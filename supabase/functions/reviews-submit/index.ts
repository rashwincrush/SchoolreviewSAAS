import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401, headers: CORS });

  const { tenant_id, reviewer_id, rating, title, text } = await req.json();
  if (!tenant_id || !reviewer_id || !rating || !text)
    return new Response("Bad request", { status: 400, headers: CORS });
  if (rating < 1 || rating > 5 || String(text).trim().length < 10)
    return new Response("Validation failed", { status: 400, headers: CORS });

  const { error } = await supabase.from("reviews").insert({
    tenant_id, reviewer_id, rating, title, body: text, status: "pending",
    submitted_ip: req.headers.get("x-forwarded-for") ?? null
  });
  if (error) return new Response(error.message, { status: 400, headers: CORS });

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", ...CORS } });
});
