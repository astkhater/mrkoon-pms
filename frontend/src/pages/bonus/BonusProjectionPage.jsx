import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

// Commission projection page (/bonus/me) — built 2026-06-17.
// Frontend-only calc: reads compensation_rates + kpi_actuals + def.kpis
// for the logged-in user (or, for admin/manager, a chosen employee via ?employee=).
// NOT a payslip — finance still runs the official batch. This is a live preview.

function fmtMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' EGP';
}
function fmtPct(n) {
  if (n == null) return '—';
  return (Number(n) * 100).toFixed(0) + '%';
}

// 1. Open periods (monthly preferred)
function useOpenPeriods() {
  return useQuery({
    queryKey: ['proj.periods.open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('config')
        .from('cycle_periods')
        .select('id, type, label, start_date, end_date, status')
        .eq('status', 'open')
        .order('start_date', { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });
}

// 2. User's assigned KPIs (joined to scheme_ref + gate config)
function useUserKPIs(functionalRoleId) {
  return useQuery({
    enabled: !!functionalRoleId,
    queryKey: ['proj.userkpis', functionalRoleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpi_role_weights')
        .select('kpi_id, weight, weight_type, kpi:kpis(id, name_en, name_ar, scheme_ref, gate_amount, gate_threshold, frequency, target_value, weight_type_default)')
        .eq('functional_role_id', functionalRoleId);
      if (error) return [];
      return (data ?? []).filter(r => r.kpi != null);
    },
  });
}

// 3. Their actuals for the chosen period
function useActuals(employeeId, periodId) {
  return useQuery({
    enabled: !!employeeId && !!periodId,
    queryKey: ['proj.actuals', employeeId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('kpi_actuals')
        .select('kpi_id, actual_value, period_id, employee_id')
        .eq('employee_id', employeeId)
        .eq('period_id', periodId);
      if (error) return [];
      return data ?? [];
    },
  });
}

// 4. Compensation rates for the active schemes (open rows only)
function useRatesForSchemes(schemeIds) {
  return useQuery({
    enabled: schemeIds.length > 0,
    queryKey: ['proj.rates', schemeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('config')
        .from('compensation_rates')
        .select('scheme_ref, key, value_numeric, value_json, notes, effective_from, effective_to')
        .in('scheme_ref', schemeIds)
        .is('effective_to', null);
      if (error) return [];
      return data ?? [];
    },
  });
}

// 5a. Target profile (for proxy mode when ?employee=id is passed)
function useTargetProfile(userId) {
  return useQuery({
    enabled: !!userId,
    queryKey: ['proj.targetprofile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def').from('users')
        .select('id, full_name_en, full_name_ar, functional_role_id')
        .eq('id', userId).maybeSingle();
      if (error) return null;
      return data;
    },
  });
}

// 5. Scheme metadata
function useSchemes(schemeIds) {
  return useQuery({
    enabled: schemeIds.length > 0,
    queryKey: ['proj.schemes', schemeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('commission_schemes')
        .select('id, name_en, name_ar, cadence, comp_model, description')
        .in('id', schemeIds);
      if (error) return [];
      return data ?? [];
    },
  });
}

function GateRow({ kpi, actual, lang }) {
  const target = Number(kpi.gate_threshold ?? 0);
  const value = actual == null ? null : Number(actual);
  const passed = value != null && value >= target;
  const amount = passed ? Number(kpi.gate_amount ?? 0) : 0;
  return (
    <tr className='border-b last:border-0'>
      <td className='py-1.5 text-sm'>{lang === 'ar' ? kpi.name_ar : kpi.name_en}</td>
      <td className='text-xs text-slate-500'>{kpi.gate_threshold != null ? (target < 1 ? fmtPct(target) : target) : '—'}</td>
      <td className={'text-sm font-medium ' + (value == null ? 'text-slate-300' : passed ? 'text-mrkoon-green' : 'text-rose-600')}>
        {value == null ? '—' : (target < 1 ? fmtPct(value) : value)}
      </td>
      <td className='text-center'>
        {value == null ? <span className='text-slate-300'>·</span> :
         passed ? <span className='text-mrkoon-green'>✓</span> :
                  <span className='text-rose-500'>✗</span>}
      </td>
      <td className='text-end text-sm font-medium'>{amount > 0 ? fmtMoney(amount) : '—'}</td>
    </tr>
  );
}

export default function BonusProjectionPage() {
  const { lang } = useTranslation();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const proxyId = searchParams.get('employee');
  const proxyProfile = useTargetProfile(proxyId);
  const isProxy = !!proxyId && proxyId !== profile?.id;
  const target = isProxy ? proxyProfile.data : profile;
  const employeeId = target?.id;
  const functionalRoleId = target?.functional_role_id;

  const periods = useOpenPeriods();
  const [periodId, setPeriodId] = useState('');
  const effectivePeriodId = periodId || periods.data?.[0]?.id || '';
  const period = (periods.data ?? []).find(p => p.id === effectivePeriodId);

  const userKpis = useUserKPIs(functionalRoleId);
  const actuals = useActuals(employeeId, effectivePeriodId);

  // Group KPIs by their scheme_ref
  const bySchemeId = {};
  (userKpis.data ?? []).forEach(r => {
    const sid = r.kpi.scheme_ref || '__unscheme__';
    if (!bySchemeId[sid]) bySchemeId[sid] = [];
    bySchemeId[sid].push(r.kpi);
  });
  const schemeIds = Object.keys(bySchemeId).filter(id => id !== '__unscheme__');

  const schemes = useSchemes(schemeIds);
  const rates = useRatesForSchemes(schemeIds);

  // Build actuals map
  const actualMap = {};
  (actuals.data ?? []).forEach(a => { actualMap[a.kpi_id] = a.actual_value; });

  // Per-scheme projected totals (gate-style: sum amounts of passed gates, then cap)
  const schemeProjections = schemeIds.map(sid => {
    const kpis = bySchemeId[sid] || [];
    const gateKpis = kpis.filter(k => (k.weight_type_default || '') === 'gate' || k.gate_amount != null);
    let earned = 0;
    gateKpis.forEach(k => {
      const v = actualMap[k.id];
      if (v != null && Number(v) >= Number(k.gate_threshold ?? 0)) {
        earned += Number(k.gate_amount ?? 0);
      }
    });
    const cap = (rates.data ?? []).find(r => r.scheme_ref === sid && /cap/i.test(r.key))?.value_numeric;
    const capped = cap && cap > 0 ? Math.min(earned, Number(cap)) : earned;
    const scheme = (schemes.data ?? []).find(s => s.id === sid);
    return { schemeId: sid, scheme, gateKpis, earned, capped, cap };
  });

  const grandTotal = schemeProjections.reduce((s, p) => s + p.capped, 0);
  const loading = periods.isLoading || userKpis.isLoading || actuals.isLoading || schemes.isLoading || rates.isLoading;

  return (
    <div className='space-y-5'>
      <div className='flex items-baseline justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>
            {isProxy
              ? (lang === 'ar' ? `توقع ${proxyProfile.data?.full_name_ar || proxyProfile.data?.full_name_en || '…'}` : `Projection — ${proxyProfile.data?.full_name_en || '…'}`)
              : (lang === 'ar' ? 'مكافأتي المتوقعة' : 'My projected bonus')}
          </h1>
          <p className='text-sm text-slate-500 mt-1'>
            {lang === 'ar'
              ? 'حساب حي بناءً على آخر بياناتك. ليست رسمية — المالية تعتمد الدفعة عند إغلاق الفترة.'
              : 'Live calc from your latest data. Not official — Finance approves at period close.'}
          </p>
          {isProxy && (
            <div className='mt-2 text-xs px-2 py-1 inline-block rounded bg-amber-50 border border-amber-200 text-amber-800'>
              {lang === 'ar' ? '👁 وضع المعاينة (لمدير/HR)' : '👁 Proxy view (manager/HR)'}
            </div>
          )}
        </div>
        <Link to={isProxy ? '/team/bonus' : '/bonus'} className='text-sm text-mrkoon-accent hover:underline'>
          {isProxy
            ? (lang === 'ar' ? 'مكافآت الفريق ←' : 'Team bonus →')
            : (lang === 'ar' ? 'الدفعات المعتمدة ←' : 'Approved payouts →')}
        </Link>
      </div>

      {/* Period picker */}
      <Card>
        <div className='flex flex-wrap items-center gap-3 text-sm'>
          <span className='text-slate-500'>{lang === 'ar' ? 'الفترة:' : 'Period:'}</span>
          {periods.isLoading ? <Skeleton className='h-6 w-32' /> : (
            <select
              value={effectivePeriodId}
              onChange={e => setPeriodId(e.target.value)}
              className='border rounded px-2 py-1'
            >
              {(periods.data ?? []).map(p => (
                <option key={p.id} value={p.id}>{p.label} · {p.type}</option>
              ))}
            </select>
          )}
          {period && (
            <span className='text-xs text-slate-500'>
              {period.start_date} → {period.end_date}
            </span>
          )}
        </div>
      </Card>

      {/* Grand total card */}
      <div className='rounded-xl border-2 border-mrkoon-accent bg-gradient-to-br from-mrkoon-green-tint to-white p-5'>
        <div className='text-xs uppercase tracking-wider text-mrkoon-green font-semibold'>
          {lang === 'ar' ? '₤ المكافأة المتوقعة' : '₤ Projected bonus'}
        </div>
        <div className='text-4xl font-semibold text-mrkoon mt-2'>
          {loading ? '…' : fmtMoney(grandTotal)}
        </div>
        <div className='text-xs text-slate-500 mt-2'>
          {lang === 'ar'
            ? 'مجموع البوابات المجتازة عبر جميع مخططاتك للفترة المختارة.'
            : 'Sum of passed gates across your schemes for the selected period.'}
        </div>
      </div>

      {/* Per-scheme breakdown */}
      {loading ? (
        <Card><Skeleton count={5} className='h-8' /></Card>
      ) : schemeProjections.length === 0 ? (
        <Card>
          <div className='text-sm text-slate-500'>
            {lang === 'ar'
              ? 'لا توجد مخططات عمولات مرتبطة بدورك. تواصل مع HR إذا كنت تتوقع عمولات.'
              : 'No commission schemes are linked to your role. Contact HR if you expect commissions.'}
          </div>
        </Card>
      ) : (
        schemeProjections.map(p => (
          <Card key={p.schemeId}>
            <div className='flex items-baseline justify-between mb-3'>
              <div>
                <div className='text-sm font-mono text-slate-500'>{p.schemeId}</div>
                <div className='text-lg font-medium text-mrkoon'>
                  {p.scheme ? (lang === 'ar' ? p.scheme.name_ar : p.scheme.name_en) : p.schemeId}
                </div>
                {p.scheme?.cadence && (
                  <div className='text-xs text-slate-400'>{p.scheme.cadence} · {p.scheme.comp_model}</div>
                )}
              </div>
              <div className='text-end'>
                <div className='text-2xl font-semibold text-mrkoon-green'>{fmtMoney(p.capped)}</div>
                {p.cap && p.cap > 0 && p.earned > p.capped && (
                  <div className='text-xs text-amber-600'>
                    {lang === 'ar' ? `مقيّد عند ${fmtMoney(p.cap)} (محصّل ${fmtMoney(p.earned)})` : `capped at ${fmtMoney(p.cap)} (earned ${fmtMoney(p.earned)})`}
                  </div>
                )}
              </div>
            </div>

            {p.gateKpis.length === 0 ? (
              <div className='text-sm text-slate-400'>
                {lang === 'ar' ? 'لا توجد بوابات مُعَرَّفة لهذا المخطط' : 'No gates defined for this scheme'}
              </div>
            ) : (
              <table className='w-full text-sm'>
                <thead className='text-xs text-slate-500 border-b'>
                  <tr>
                    <th className='text-start py-1'>{lang === 'ar' ? 'البوابة' : 'Gate'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'الحد' : 'Target'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'الفعلي' : 'Actual'}</th>
                    <th className='text-center'>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className='text-end'>{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.gateKpis.map(k => (
                    <GateRow key={k.id} kpi={k} actual={actualMap[k.id]} lang={lang} />
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        ))
      )}

      {/* Disclaimer */}
      <div className='text-xs text-slate-400 border-t pt-3'>
        {lang === 'ar'
          ? '⚠ هذا الرقم تقديري وقد يتغير عند إغلاق الفترة. لا يحل محل اعتماد المالية.'
          : '⚠ This figure is an estimate and may change at period close. Does not replace Finance approval.'}
      </div>
    </div>
  );
}
