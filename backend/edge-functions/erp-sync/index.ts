// =================================================================
// Mrkoon OKR Webapp — ERP Sync Edge Function (DORMANT BY DEFAULT)
// Date: 2026-05-02
//
// Two operations (selected via body.op):
//   - "pull_employees" — refresh employee master from ERP into def.users
//   - "push_payroll"   — export approved payouts to payroll batch in ERP
//
// Dormant if ERP_API_URL or ERP_API_KEY unset.
// =================================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ErpRequest {
  op: "pull_employees" | "push_payroll";
  payout_ids?: string[]; // for push_payroll
}

interface ErpResponse {
  ok: boolean;
  mode: "dormant" | "live";
  op: string;
  changed: number;
  errors: { id: string; reason: string }[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const erpUrl = Deno.env.get("ERP_API_URL");
    const erpKey = Deno.env.get("ERP_API_KEY");
    const dormant = !erpUrl || !erpKey;

    const body = (await req.json().catch(() => ({}))) as ErpRequest;
    const op = body?.op ?? "pull_employees";

    if (dormant) {
      return json({ ok: true, mode: "dormant", op, changed: 0, errors: [] } as ErpResponse);
    }

    // Live mode
    const localUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const local = createClient(localUrl, serviceKey, { auth: { persistSession: false } });
    let changed = 0;
    const errors: { id: string; reason: string }[] = [];

    if (op === "pull_employees") {
      // Fetch from ERP — replace endpoint per real ERP
      const r = await fetch(`${erpUrl}/employees`, {
        headers: { Authorization: `Bearer ${erpKey}` },
      });
      if (!r.ok) {
        return json({ ok: false, mode: "live", op, changed: 0, errors: [{ id: "-", reason: `ERP HTTP ${r.status}` }] });
      }
      const employees = (await r.json()) as Array<{ id: string; email: string; full_name_en: string; full_name_ar?: string; role_code?: string; department_code?: string }>;

      for (const e of employees) {
        try {
          const { error } = await local.from("users").upsert(
            {
              id: e.id,
              email: e.email,
              full_name_en: e.full_name_en,
              full_name_ar: e.full_name_ar,
              role_code: e.role_code ?? "employee",
            },
            { onConflict: "id" },
          );
          if (error) errors.push({ id: e.id, reason: error.message });
          else changed++;
        } catch (err: any) {
          errors.push({ id: e.id, reason: err?.message ?? String(err) });
        }
      }
    } else if (op === "push_payroll") {
      const ids = body.payout_ids ?? [];
      const { data: payouts } = await local
        .from("commission_payouts")
        .select("id, employee_id, total_amount, period_id, status")
        .in("id", ids);

      const approved = (payouts ?? []).filter((p: any) => p.status === "approved");
      const r = await fetch(`${erpUrl}/payroll/batch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${erpKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ items: approved }),
      });
      if (!r.ok) {
        return json({ ok: false, mode: "live", op, changed: 0, errors: [{ id: "-", reason: `ERP HTTP ${r.status}` }] });
      }
      // Mark exported
      await local
        .from("commission_payouts")
        .update({ status: "exported", exported_at: new Date().toISOString() })
        .in("id", approved.map((p: any) => p.id));
      changed = approved.length;
    } else {
      return json({ ok: false, mode: "live", op, changed: 0, errors: [{ id: "-", reason: "unknown op" }] }, 400);
    }

    return json({ ok: errors.length === 0, mode: "live", op, changed, errors } as ErpResponse);
  } catch (err: any) {
    return json({ ok: false, mode: "live", op: "unknown", changed: 0, errors: [{ id: "-", reason: err?.message ?? String(err) }] } as ErpResponse, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
