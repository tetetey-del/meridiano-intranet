-- Deja la demo como recién instalada. Solo administración puede ejecutarla.
create or replace function public.reiniciar_datos_ejemplo() returns void
language plpgsql security definer set search_path = '' as $$
declare
  dominio text := '@academiameridiano.cr';
  matricula uuid := '22222222-0000-0000-0000-000000000001';
begin
  if not public.es_admin() then raise exception 'Solo administración puede reiniciar los datos'; end if;

  -- 1. Equipo de ejemplo: 14 cuentas, datos originales, sin fotos, contraseña de demo
  create temp table _equipo(usr text, nombre text, rol text, puesto text, area text, tel text) on commit drop;
  insert into _equipo values
    ('laura.mendez','Laura Méndez Solís','admin','Directora general','Dirección','+506 8812-4410'),
    ('carlos.araya','Carlos Araya Mora','admin','Jefe de administración','Administración','+506 8890-1123'),
    ('andres.vargas','Andrés Vargas Pérez','responsable','Coordinador académico','Coordinación','+506 8703-5521'),
    ('mariela.jimenez','Mariela Jiménez Castro','responsable','Coordinadora de convocatorias','Coordinación','+506 8721-6630'),
    ('paola.herrera','Paola Herrera Rojas','responsable','Coordinadora de profesorado','Coordinación','+506 8834-2297'),
    ('sofia.rojas','Sofía Rojas Alfaro','equipo','Profesora de Derecho Administrativo','Profesorado','+506 8655-9012'),
    ('daniela.quesada','Daniela Quesada Mora','equipo','Profesora de Matemática y Razonamiento','Profesorado','+506 8610-3344'),
    ('josepablo.solano','José Pablo Solano Vega','equipo','Profesor de Derecho Constitucional','Profesorado','+506 8677-4508'),
    ('valeria.chaves','Valeria Chaves Núñez','equipo','Profesora de Redacción y Ortografía','Profesorado','+506 8699-7781'),
    ('esteban.monge','Esteban Monge Arias','equipo','Profesor de Pruebas Psicométricas','Profesorado','+506 8643-1209'),
    ('fabian.calderon','Fabián Calderón Ureña','equipo','Profesor de Legislación Laboral','Profesorado','+506 8620-5576'),
    ('gabriela.umana','Gabriela Umaña Soto','equipo','Orientadora académica','Orientación','+506 8758-8812'),
    ('natalia.villalobos','Natalia Villalobos Cruz','equipo','Secretaría y atención al alumnado','Secretaría','+506 8741-0065'),
    ('ricardo.brenes','Ricardo Brenes Campos','equipo','Soporte técnico y aulas','Servicios','+506 8766-3390');

  delete from auth.users where email not in (select usr || dominio from _equipo) and id <> auth.uid();
  update auth.users set banned_until = null,
    encrypted_password = extensions.crypt('Meridiano2026!', extensions.gen_salt('bf'))
  where email in (select usr || dominio from _equipo);
  update public.profiles p set full_name = e.nombre, role = e.rol::public.perfil, puesto = e.puesto,
    area = e.area, phone = e.tel, avatar_url = null, active = true
  from _equipo e where p.email = e.usr || dominio;

  -- 2. Carpetas y permisos originales
  delete from public.folders where id not in (
    '11111111-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000003',
    '11111111-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000005');
  update public.folders f set name = v.n, description = v.d, allowed_roles = v.r::public.perfil[], sort_order = v.o
  from (values
    ('11111111-0000-0000-0000-000000000001'::uuid,'General','Normas, horarios y documentación para todo el personal','{equipo,responsable,admin}',1),
    ('11111111-0000-0000-0000-000000000002'::uuid,'Procedimientos','Procedimientos internos vigentes','{equipo,responsable,admin}',2),
    ('11111111-0000-0000-0000-000000000003'::uuid,'Convocatorias y materiales','Convocatorias oficiales, temarios y material docente','{equipo,responsable,admin}',3),
    ('11111111-0000-0000-0000-000000000004'::uuid,'Coordinación académica','Planificación y evaluación (responsables)','{responsable,admin}',4),
    ('11111111-0000-0000-0000-000000000005'::uuid,'Dirección y administración','Presupuestos, tarifas y contratos (solo administración)','{admin}',5)
  ) v(id, n, d, r, o) where f.id = v.id;

  -- 3. Documentos: solo los 8 de ejemplo, con sus versiones originales (matrícula: v1 guardada y v2 vigente)
  delete from public.documents where id::text not like '22222222-0000-0000-0000-00000000000_';
  delete from public.document_versions where file_path !~ '^[0-9a-f-]+/[0-9a-f-]+/v[0-9]+-';
  update public.document_versions set is_current = false where is_current;
  update public.document_versions set is_current = true
  where (document_id = matricula and version_number = 2) or (document_id <> matricula and version_number = 1);
  update public.documents set updated_at = now() - case when id = matricula then interval '3 days' else interval '20 days' end;

  -- 4. Avisos originales, con fechas recientes y lecturas de ejemplo (9 de 14 y 5 de 14)
  delete from public.announcements where id::text not like '33333333-0000-0000-0000-00000000000_';
  delete from public.announcement_attachments
  where file_path <> '33333333-0000-0000-0000-000000000002/instrucciones-simulacro-noviembre.pdf';
  update public.announcements a set created_at = now() - v.hace
  from (values
    ('33333333-0000-0000-0000-000000000001'::uuid, interval '3 days'),
    ('33333333-0000-0000-0000-000000000002'::uuid, interval '1 day'),
    ('33333333-0000-0000-0000-000000000003'::uuid, interval '6 days'),
    ('33333333-0000-0000-0000-000000000004'::uuid, interval '9 days'),
    ('33333333-0000-0000-0000-000000000005'::uuid, interval '12 days')
  ) v(id, hace) where a.id = v.id;
  delete from public.announcement_reads;
  insert into public.announcement_reads(announcement_id, user_id, read_at)
  select '33333333-0000-0000-0000-000000000001', p.id, now() - interval '2 days' + (row_number() over (order by p.email)) * interval '2 hours'
  from public.profiles p where p.email in (select usr || dominio from _equipo where usr in
    ('laura.mendez','carlos.araya','andres.vargas','mariela.jimenez','paola.herrera','natalia.villalobos','gabriela.umana','daniela.quesada','valeria.chaves'));
  insert into public.announcement_reads(announcement_id, user_id, read_at)
  select '33333333-0000-0000-0000-000000000002', p.id, now() - interval '10 hours' + (row_number() over (order by p.email)) * interval '1 hour'
  from public.profiles p where p.email in (select usr || dominio from _equipo where usr in
    ('andres.vargas','paola.herrera','laura.mendez','esteban.monge','josepablo.solano'));

  -- 5. Eventos originales y respuestas de asistencia de ejemplo
  delete from public.events where id::text not like '44444444-0000-0000-0000-00000000000_';
  delete from public.event_rsvps;
  insert into public.event_rsvps(event_id, user_id, status)
  select '44444444-0000-0000-0000-000000000001', p.id, case when p.email like 'carlos%' or p.email like 'valeria%' then 'no' else 'si' end
  from public.profiles p where p.role in ('admin','responsable') or p.email like 'daniela%' or p.email like 'valeria%';
  insert into public.event_rsvps(event_id, user_id, status)
  select '44444444-0000-0000-0000-000000000002', p.id, 'si'
  from public.profiles p where p.email in ('natalia.villalobos' || dominio, 'andres.vargas' || dominio, 'mariela.jimenez' || dominio);
end $$;

revoke execute on function public.reiniciar_datos_ejemplo() from public, anon;
grant execute on function public.reiniciar_datos_ejemplo() to authenticated;
