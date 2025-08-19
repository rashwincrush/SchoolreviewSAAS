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
    const host = (url.searchParams.get("host") || "").toLowerCase();
    if (!slug || !host) {
      // allow by default when missing info (MVP)
      return new Response(JSON.stringify({ allowed: true }), { headers: { "content-type": "application/json", ...CORS } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // server-side only
    );

    const { data: tenant, error: terr } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();
    if (terr || !tenant) {
      return new Response(JSON.stringify({ allowed: false }), { headers: { "content-type": "application/json", ...CORS } });
    }

    const { data: domains } = await supabase
      .from("tenant_domains")
      .select("domain")
      .eq("tenant_id", tenant.id);

    const allowed = (domains ?? []).some(d => {
      const dom = (d.domain || "").toLowerCase();
      return host === dom || host.endsWith("." + dom);
    });

    return new Response(JSON.stringify({ allowed }), { headers: { "content-type": "application/json", ...CORS } });
  } catch {
    // default allow on unexpected error (MVP; tighten later)
    return new Response(JSON.stringify({ allowed: true }), { headers: { "content-type": "application/json", ...CORS } });
  }
});
