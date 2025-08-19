import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("tenant");
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    if (!slug) return new Response("Missing tenant", { status: 400, headers: CORS });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: summary, error: sErr } = await supabase
      .rpc("get_tenant_summary", { p_slug: slug })
      .single();
    if (sErr || !summary) return new Response("Not found", { status: 404, headers: CORS });

    const { data: items, error: iErr } = await supabase
      .rpc("list_public_reviews", { p_slug: slug, p_limit: limit, p_offset: offset });
    if (iErr) throw iErr;

    const payload = { summary, items, tenant_id: summary.id };
    return new Response(JSON.stringify(payload), { headers: { "content-type": "application/json", ...CORS } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: CORS });
  }
});
