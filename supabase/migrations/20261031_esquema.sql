create extension if not exists unaccent with schema extensions;

create type public.perfil as enum ('equipo','responsable','admin');

create or replace function public.normalizar(t text) returns text
language sql immutable parallel safe set search_path = '' as
$$ select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t,''))) $$;

-- PERFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role public.perfil not null default 'equipo',
  puesto text default '',
  area text default '',
  phone text default '',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.mi_perfil() returns public.perfil
language sql stable security definer set search_path = '' as
$$ select role from public.profiles where id = auth.uid() and active $$;

create or replace function public.es_gestor() returns boolean
language sql stable security definer set search_path = '' as
$$ select coalesce(public.mi_perfil() in ('responsable','admin'), false) $$;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as
$$ select coalesce(public.mi_perfil() = 'admin', false) $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, role, puesto, area, phone)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::public.perfil, 'equipo'),
    coalesce(new.raw_user_meta_data->>'puesto',''),
    coalesce(new.raw_user_meta_data->>'area',''),
    coalesce(new.raw_user_meta_data->>'phone','')
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- CARPETAS
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  allowed_roles public.perfil[] not null default '{equipo,responsable,admin}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.puede_ver_carpeta(fid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.folders f
    where f.id = fid and public.mi_perfil() is not null
      and (public.mi_perfil() = 'admin' or public.mi_perfil() = any(f.allowed_roles))
  )
$$;

-- DOCUMENTOS Y VERSIONES
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.folders(id) on delete cascade,
  title text not null,
  description text default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number int not null default 1,
  file_path text not null,
  file_name text not null,
  mime_type text default '',
  size_bytes bigint default 0,
  notes text default '',
  content_text text default '',
  is_current boolean not null default true,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);
create unique index una_vigente_por_documento on public.document_versions(document_id) where is_current;

-- Al subir una versión nueva: número correlativo, la anterior se conserva y deja de ser vigente
create or replace function public.antes_de_nueva_version() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select coalesce(max(version_number),0)+1 into new.version_number
  from public.document_versions where document_id = new.document_id;
  update public.document_versions set is_current = false
  where document_id = new.document_id and is_current;
  new.is_current := true;
  update public.documents set updated_at = now() where id = new.document_id;
  return new;
end $$;
create trigger trg_nueva_version before insert on public.document_versions
for each row execute function public.antes_de_nueva_version();

-- Volver a marcar vigente una versión anterior (sin borrar nada)
create or replace function public.marcar_vigente(version_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare d uuid; f uuid;
begin
  select v.document_id, doc.folder_id into d, f
  from public.document_versions v join public.documents doc on doc.id = v.document_id
  where v.id = version_id;
  if d is null or not public.es_gestor() or not public.puede_ver_carpeta(f) then
    raise exception 'Sin permiso';
  end if;
  update public.document_versions set is_current = false where document_id = d and is_current;
  update public.document_versions set is_current = true where id = version_id;
  update public.documents set updated_at = now() where id = d;
end $$;

-- AVISOS
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  category text not null default 'General',
  is_important boolean not null default false,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.announcement_attachments (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  size_bytes bigint default 0,
  created_at timestamptz not null default now()
);

create table public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

-- CALENDARIO
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  location text default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('si','no')),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- SEGURIDAD (RLS)
alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_attachments enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

create policy "perfiles: ver si estás activo" on public.profiles for select to authenticated
  using (public.mi_perfil() is not null);
create policy "perfiles: admin edita" on public.profiles for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy "carpetas: solo las de tu perfil" on public.folders for select to authenticated
  using (public.puede_ver_carpeta(id));
create policy "carpetas: admin crea" on public.folders for insert to authenticated with check (public.es_admin());
create policy "carpetas: admin edita" on public.folders for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "carpetas: admin borra" on public.folders for delete to authenticated using (public.es_admin());

create policy "documentos: según carpeta" on public.documents for select to authenticated
  using (public.puede_ver_carpeta(folder_id));
create policy "documentos: gestores crean" on public.documents for insert to authenticated
  with check (public.es_gestor() and public.puede_ver_carpeta(folder_id));
create policy "documentos: gestores editan" on public.documents for update to authenticated
  using (public.es_gestor() and public.puede_ver_carpeta(folder_id))
  with check (public.es_gestor() and public.puede_ver_carpeta(folder_id));
create policy "documentos: admin borra" on public.documents for delete to authenticated using (public.es_admin());

create policy "versiones: según carpeta" on public.document_versions for select to authenticated
  using (exists (select 1 from public.documents d where d.id = document_id and public.puede_ver_carpeta(d.folder_id)));
create policy "versiones: gestores suben" on public.document_versions for insert to authenticated
  with check (public.es_gestor() and exists (select 1 from public.documents d where d.id = document_id and public.puede_ver_carpeta(d.folder_id)));

create policy "avisos: todo el personal lee" on public.announcements for select to authenticated using (public.mi_perfil() is not null);
create policy "avisos: gestores publican" on public.announcements for insert to authenticated with check (public.es_gestor());
create policy "avisos: gestores editan" on public.announcements for update to authenticated using (public.es_gestor()) with check (public.es_gestor());
create policy "avisos: admin borra" on public.announcements for delete to authenticated using (public.es_admin());

create policy "adjuntos: todo el personal" on public.announcement_attachments for select to authenticated using (public.mi_perfil() is not null);
create policy "adjuntos: gestores suben" on public.announcement_attachments for insert to authenticated with check (public.es_gestor());

create policy "lecturas: la propia o gestores todas" on public.announcement_reads for select to authenticated
  using (user_id = auth.uid() or public.es_gestor());
create policy "lecturas: confirmar la propia" on public.announcement_reads for insert to authenticated
  with check (user_id = auth.uid() and public.mi_perfil() is not null);

create policy "eventos: todo el personal" on public.events for select to authenticated using (public.mi_perfil() is not null);
create policy "eventos: gestores crean" on public.events for insert to authenticated with check (public.es_gestor());
create policy "eventos: gestores editan" on public.events for update to authenticated using (public.es_gestor()) with check (public.es_gestor());
create policy "eventos: gestores borran" on public.events for delete to authenticated using (public.es_gestor());

create policy "asistencia: ver propia o gestores" on public.event_rsvps for select to authenticated
  using (user_id = auth.uid() or public.es_gestor());
create policy "asistencia: responder la propia" on public.event_rsvps for insert to authenticated
  with check (user_id = auth.uid() and public.mi_perfil() is not null);
create policy "asistencia: cambiar la propia" on public.event_rsvps for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RECUENTOS (números, sin nombres, visibles para todos)
create or replace function public.recuento_lecturas()
returns table(announcement_id uuid, leidos bigint, total bigint)
language sql stable security definer set search_path = '' as $$
  select a.id,
    (select count(*) from public.announcement_reads r join public.profiles p on p.id = r.user_id
      where r.announcement_id = a.id and p.active),
    (select count(*) from public.profiles where active)
  from public.announcements a
  where public.mi_perfil() is not null
$$;

create or replace function public.recuento_asistencia()
returns table(event_id uuid, si bigint, no bigint)
language sql stable security definer set search_path = '' as $$
  select e.id,
    (select count(*) from public.event_rsvps r where r.event_id = e.id and r.status='si'),
    (select count(*) from public.event_rsvps r where r.event_id = e.id and r.status='no')
  from public.events e where public.mi_perfil() is not null
$$;

-- BÚSQUEDA por título y contenido (respeta permisos: security invoker)
create or replace function public.buscar(q text)
returns table(tipo text, id uuid, titulo text, contexto text, extra text, fecha timestamptz)
language plpgsql stable security invoker set search_path = '' as $$
declare n text := public.normalizar(trim(q));
begin
  if length(n) < 2 then return; end if;
  return query
  select 'aviso'::text, a.id, a.title,
    case when public.normalizar(a.title) like '%'||n||'%' then left(a.body, 160)
      else '…'||substr(a.body, greatest(strpos(public.normalizar(a.body), n)-60,1), 180)||'…' end,
    a.category, a.created_at
  from public.announcements a
  where public.normalizar(a.title) like '%'||n||'%' or public.normalizar(a.body) like '%'||n||'%'
  union all
  select 'documento'::text, d.id, d.title,
    case when public.normalizar(d.title) like '%'||n||'%' and coalesce(d.description,'')<>'' then d.description
      when public.normalizar(v.content_text) like '%'||n||'%'
        then '…'||substr(v.content_text, greatest(strpos(public.normalizar(v.content_text), n)-60,1), 180)||'…'
      else coalesce(d.description,'') end,
    f.name, d.updated_at
  from public.documents d
  join public.folders f on f.id = d.folder_id
  left join public.document_versions v on v.document_id = d.id and v.is_current
  where public.normalizar(d.title) like '%'||n||'%'
     or public.normalizar(d.description) like '%'||n||'%'
     or public.normalizar(v.content_text) like '%'||n||'%'
  order by 6 desc
  limit 40;
end $$;

-- Permisos de ejecución: nada para anónimos; los disparadores no se exponen
revoke execute on function public.mi_perfil(), public.es_gestor(), public.es_admin(), public.puede_ver_carpeta(uuid),
  public.handle_new_user(), public.antes_de_nueva_version(), public.marcar_vigente(uuid),
  public.recuento_lecturas(), public.recuento_asistencia(), public.buscar(text) from public, anon;
revoke execute on function public.handle_new_user(), public.antes_de_nueva_version() from authenticated;
grant execute on function public.mi_perfil(), public.es_gestor(), public.es_admin(), public.puede_ver_carpeta(uuid),
  public.marcar_vigente(uuid), public.recuento_lecturas(), public.recuento_asistencia(), public.buscar(text) to authenticated;

-- ALMACENAMIENTO PRIVADO
insert into storage.buckets (id, name, public, file_size_limit) values
  ('documentos','documentos', false, 52428800),
  ('adjuntos','adjuntos', false, 52428800),
  ('avatares','avatares', true, 5242880)
on conflict (id) do nothing;

-- documentos/<carpeta_id>/<documento_id>/<archivo>: solo quien puede ver la carpeta
create policy "documentos: leer según carpeta" on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and public.puede_ver_carpeta(((storage.foldername(name))[1])::uuid));
create policy "documentos: gestores suben" on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and public.es_gestor() and public.puede_ver_carpeta(((storage.foldername(name))[1])::uuid));

create policy "adjuntos: personal activo lee" on storage.objects for select to authenticated
  using (bucket_id = 'adjuntos' and public.mi_perfil() is not null);
create policy "adjuntos: gestores suben" on storage.objects for insert to authenticated
  with check (bucket_id = 'adjuntos' and public.es_gestor());

create policy "avatares: admin sube" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatares' and public.es_admin());
create policy "avatares: admin actualiza" on storage.objects for update to authenticated
  using (bucket_id = 'avatares' and public.es_admin());

-- Tiempo real para el recuento
alter publication supabase_realtime add table public.announcement_reads;
alter publication supabase_realtime add table public.event_rsvps;
