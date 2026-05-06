// =================================================================
// Mrkoon OKR Webapp — CRM Sync Edge Function (DORMANT BY DEFAULT)
// Date: 2026-05-02
// Stack: Deno + Supabase Edge Functions
//
// Behavior:
//   - If CRM_SUPABASE_URL OR CRM_SUPABASE_ANON_KEY is unset:
//       returns { ok: true, mode: "dormant", synced: 0, errors: [] }
//   - If both set:
//       fetches each requested payout from THIS app's DB
//       posts to CRM `commission_events` table (idempotent on payout_id)
//       returns { ok: true, mode: "live", synced: n, errors: [] }
//
// Activation: see handover-docs/how-to-activate-crm.md
// =================================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SyncRequest {
  payout_ids: string[];
}

interface SyncResponse {
  ok: boolean;
  mode: "dormant" | "live";
  synced: number;
  errors: { payout_id: string; reason: string }[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const crmUrl = Deno.env.get("CRM_SUPABASE_URL");
    const crmKey = Deno.env.get("CRM_SUPABASE_ANON_KEY");
    const dormant = !crmUrl || !crmKey;

    if (dormant) {
      const resp: SyncResponse = { ok: true, mode: "dormant", synced: 0, errors: [] };
      return json(resp);
    }

    // Live mode
    const body = (await req.json()) as SyncRequest;
    if (!body || !Array.isArray(body.payout_ids) || body.payout_ids.length === 0) {
      return json({ ok: false, mode: "live", synced: 0, errors: [{ payout_id: "-", reason: "payout_ids required" }] }, 400);
    }

    const localUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const local = createClient(localUrl, serviceKey, { auth: { persistSession: false } });
    const crm = createClient(crmUrl!, crmKey!, { auth: { persistSession: false } });

    const errors: { payout_id: string; reason: string }[] = [];
    let synced = 0;

    for (const pid of body.payout_ids) {
      try {
        const { data: payout, error: pe } = await local
          .from("commission_payouts")
          .select("id, scheme_id, period_id, employee_id, total_amount, status, approved_at")
          .eq("id", pid)
          .maybeSingle();
        if (pe || !payout) {
          errors.push({ payout_id: pid, reason: pe?.message || "payout not found" });
          continue;
        }
        if (payout.status !== "approved" && payout.status !== "exported") {
          errors.push({ payout_id: pid, reason: "payout not approved" });
          continue;
        }

        // Idempotent upsert into CRM commission_events
        const { error: ce } = await crm.from("commission_events").upsert(
          {
            source_payout_id: payout.id,
            scheme_id: payout.scheme_id,
            period_id: payout.period_id,
            employee_id: payout.employee_id,
            amount: payout.total_amount,
            approved_at: payout.approved_at,
            source_app: "mrkoon-okr",
          },
          { onConflict: "source_payout_id" },
        );

        if (ce) {
          errors.push({ payout_id: pid, reason: ce.message });
          continue;
        }

        // Mark as exported in local app
        await local
          .from("commission_payouts")
          .update({ status: "exported", exported_at: new Date().toISOString() })
          .eq("id", pid);

        synced++;
      } catch (err: any) {
        errors.push({ payout_id: pid, reason: err?.message ?? String(err) });
      }
    }

    const resp: SyncResponse = { ok: errors.length === 0, mode: "live", synced, errors };
    return json(resp);
  } catch (err: any) {
    return json({ ok: false, mode: "live", synced: 0, errors: [{ payout_id: "-", reason: err?.message ?? String(err) }] }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
