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

  const { review_id, action, notes } = await req.json();
  if (!review_id || !["approve", "reject"].includes(action))
    return new Response("Bad request", { status: 400, headers: CORS });

  // RLS ensures only tenant admins can update
  const { error } = await supabase
    .from("reviews")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", review_id);
  if (error) return new Response(error.message, { status: 403, headers: CORS });

  await supabase.from("moderation_actions").insert({
    review_id, moderator_id: user.id, action, notes: notes ?? null
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", ...CORS } });
});
