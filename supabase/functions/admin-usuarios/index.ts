import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Comprobar que quien llama es administración
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const { data: who } = await admin.auth.getUser(token);
  if (!who?.user) return json({ error: "No autenticado" }, 401);
  const { data: me } = await admin.from("profiles").select("role, active").eq("id", who.user.id).single();
  if (!me || me.role !== "admin" || !me.active) return json({ error: "Solo administración puede gestionar usuarios" }, 403);

  const body = await req.json().catch(() => ({}));
  try {
    if (body.action === "crear") {
      const { email, password, full_name, role, puesto, area, phone } = body;
      if (!email || !password || password.length < 8) return json({ error: "Correo y contraseña (mín. 8 caracteres) obligatorios" }, 400);
      if (!["equipo", "responsable", "admin"].includes(role)) return json({ error: "Perfil no válido" }, 400);
      const { data, error } = await admin.auth.admin.createUser({
        email: String(email).trim().toLowerCase(), password, email_confirm: true,
        user_metadata: { full_name, role, puesto, area, phone },
      });
      if (error) return json({ error: error.message.includes("already") ? "Ya existe un usuario con ese correo" : error.message }, 400);
      return json({ ok: true, id: data.user.id });
    }
    if (body.action === "activar") {
      const { id, active } = body;
      if (id === who.user.id && !active) return json({ error: "No podés desactivar tu propia cuenta" }, 400);
      const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: active ? "none" : "876000h" });
      if (error) return json({ error: error.message }, 400);
      await admin.from("profiles").update({ active }).eq("id", id);
      return json({ ok: true });
    }
    if (body.action === "contrasena") {
      const { id, password } = body;
      if (!password || password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }
    return json({ error: "Acción no reconocida" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
