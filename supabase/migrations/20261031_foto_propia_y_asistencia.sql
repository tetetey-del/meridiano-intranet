-- Cada persona puede quitar su propia respuesta de asistencia
create policy "asistencia: quitar la propia" on public.event_rsvps for delete to authenticated
  using (user_id = auth.uid());

-- Cada persona puede subir su propia foto en avatares/<su_id>/...
create policy "avatares: cada uno la suya" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text and public.mi_perfil() is not null);

-- Cambiar solo la propia foto (sin poder tocar el perfil ni otros datos)
create or replace function public.cambiar_mi_foto(url text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.mi_perfil() is null then raise exception 'Sin permiso'; end if;
  if url is not null and position('/storage/v1/object/public/avatares/' || auth.uid()::text || '/' in url) = 0 then
    raise exception 'Foto no válida';
  end if;
  update public.profiles set avatar_url = url where id = auth.uid();
end $$;
revoke execute on function public.cambiar_mi_foto(text) from public, anon;
grant execute on function public.cambiar_mi_foto(text) to authenticated;
