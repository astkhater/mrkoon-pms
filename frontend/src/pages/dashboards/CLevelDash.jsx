import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useObjectives } from '../../hooks/useOKRs.js';
import AttentionCard from '../../components/AttentionCard.jsx';
import {
  useHeadcountStats,
  useActiveCycle,
  useCompanyAssumptions,
} from '../../hooks/useDashboardStats.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

// Monitor-first CLevelDash. Reframe 2026-06-15.
//   Lead with: org-wide outcomes (company OKR progress, total payouts, headcount cost)
//   Outcome cards: Company OKR / Total Payouts This Cycle / Org Headcount
//   Company assumptions demoted to bottom (reference, not action).

function useAllPayouts() {
  return useQuery({
    queryKey: ['org.payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('commission_payouts')
        .select('id, total_amount, status');
      if (error) return [];
      return data ?? [];
    },
  });
}

function fmtMoney(n) {
  if (n == null) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M EGP';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K EGP';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' EGP';
}
function fmtPct(n) { return n == null ? '—' : (n * 100).toFixed(1) + '%'; }

export default function CLevelDash() {
  const { lang } = useTranslation();
  const { profile } = useAuth();
  const { data: objectives, isLoading } = useObjectives();
  const hc = useHeadcountStats();
  const cycles = useActiveCycle();
  const assumptions = useCompanyAssumptions();
  const allPayouts = useAllPayouts();

  const companyObjs = (objectives ?? []).filter(o => o.level === 'company');
  const A = assumptions.data?.byKey ?? {};

  const approvedOrg = (allPayouts.data ?? [])
    .filter(p => p.status === 'approved')
    .reduce((s, p) => s + (Number(p.total_amount) || 0), 0);
  const pendingOrg = (allPayouts.data ?? []).filter(p => p.status === 'pending_approval').length;

  const openPeriod = (cycles.data ?? [])[0];
  const name = profile ? (lang === 'ar' ? profile.full_name_ar : profile.full_name_en) : '';

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-2xl font-semibold'>
          {lang === 'ar' ? 'مرحباً' : 'Welcome'}{name ? `, ${name}` : ''}
        </h1>
        <p className='text-sm text-slate-500 mt-1'>
          {lang === 'ar'
            ? 'نظرة تنفيذية على أداء الشركة، المكافآت، والأهداف.'
            : 'Executive view: company performance, payouts, objectives.'}
        </p>
      </div>

      <AttentionCard />

      {/* HERO CTA — Company OKR progress */}
      <Link
        to='/okrs'
        className='block rounded-xl border-2 border-mrkoon-accent bg-gradient-to-br from-mrkoon-green-tint to-white p-5 hover:shadow-md transition-shadow'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='text-xs uppercase tracking-wider text-mrkoon-green font-semibold'>
              {lang === 'ar' ? '◎ نظرة تنفيذية' : '◎ Executive view'}
            </div>
            <div className='text-xl md:text-2xl font-semibold text-mrkoon mt-1'>
              {lang === 'ar' ? 'راجع أهداف الشركة' : "Review company objectives"}
            </div>
            <div className='text-sm text-slate-600 mt-1.5'>
              {companyObjs.length} {lang === 'ar' ? 'هدف على مستوى الشركة' : 'company objectives'}
              {openPeriod && (
                <span className='ms-2 text-slate-500'>
                  · {lang === 'ar' ? 'فترة:' : 'period:'} <span className='font-medium'>{openPeriod.label}</span>
                </span>
              )}
            </div>
          </div>
          <div className='text-3xl text-mrkoon-accent'>→</div>
        </div>
      </Link>

      {/* Outcome cards */}
      <div className='grid md:grid-cols-3 gap-4'>
        <Card>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm font-medium text-mrkoon'>
              {lang === 'ar' ? 'مكافآت معتمدة' : 'Approved payouts'}
            </div>
            <Link to='/bonus' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'الكل ←' : 'View all →'}
            </Link>
          </div>
          {allPayouts.isLoading ? <Skeleton count={2} className='h-6' /> : (
            <>
              <div className='text-3xl font-semibold text-mrkoon-green'>{fmtMoney(approvedOrg)}</div>
              <div className='text-xs text-slate-500 mt-1'>
                {lang === 'ar' ? `إجمالي على مستوى الشركة · ${pendingOrg} بانتظار` : `org-wide · ${pendingOrg} pending`}
              </div>
            </>
          )}
        </Card>

        <Card>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm font-medium text-mrkoon'>
              {lang === 'ar' ? 'الموظفون' : 'Active headcount'}
            </div>
            <Link to='/admin/users' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'التفاصيل ←' : 'Details →'}
            </Link>
          </div>
          {hc.isLoading ? <Skeleton count={2} className='h-6' /> : (
            <>
              <div className='text-3xl font-semibold text-mrkoon'>{hc.data?.total ?? 0}</div>
              <div className='text-xs text-slate-500 mt-1'>
                {Object.keys(hc.data?.byDept ?? {}).length} {lang === 'ar' ? 'قسم' : 'departments'}
              </div>
            </>
          )}
        </Card>

        <Card>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm font-medium text-mrkoon'>
              {lang === 'ar' ? 'الدورات المفتوحة' : 'Open cycles'}
            </div>
            <Link to='/admin/cycle-periods' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'إدارة ←' : 'Manage →'}
            </Link>
          </div>
          {cycles.isLoading ? <Skeleton count={2} className='h-6' /> : (
            <>
              <div className='text-3xl font-semibold text-mrkoon'>{cycles.data?.length ?? 0}</div>
              <div className='text-xs text-slate-500 mt-1'>
                {openPeriod?.label || (lang === 'ar' ? 'لا توجد' : 'none')}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Company OKRs detailed */}
      <Card title={lang === 'ar' ? 'أهداف الشركة (السنة المالية 2026)' : 'Company objectives (FY 2026)'}>
        {isLoading ? <Skeleton count={6} className='h-12' /> : (
          companyObjs.length === 0 ? (
            <div className='text-sm text-slate-500'>
              {lang === 'ar' ? 'لا توجد أهداف' : 'No objectives defined'}
            </div>
          ) : (
            <div className='space-y-2'>
              {companyObjs.map(o => (
                <Link to='/okrs' key={o.id} className='block border rounded p-3 hover:bg-slate-50'>
                  <div className='flex items-baseline justify-between'>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-xs text-slate-500 font-mono'>{o.code}</span>
                      <span className='font-medium'>{lang === 'ar' ? o.title_ar : o.title_en}</span>
                    </div>
                    <span className='text-xs text-slate-400'>{(o.key_results || []).length} KRs</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </Card>

      {/* Assumptions — demoted reference */}
      <details className='group'>
        <summary className='cursor-pointer text-sm font-medium text-slate-600 hover:text-mrkoon flex items-center gap-2'>
          <span className='group-open:rotate-90 transition-transform inline-block'>▸</span>
          {lang === 'ar' ? 'الافتراضات المؤسسية (مرجع)' : 'Company assumptions (reference)'}
        </summary>
        <Card>
          {assumptions.isLoading ? <Skeleton count={4} className='h-3' /> : (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'هدف الربح' : 'GP Target'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtMoney(A.gp_target_annual?.value_numeric)}</div></div>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'توقع الربح' : 'GP Forecast'}</div><div className='text-lg font-semibold text-emerald-600'>{fmtMoney(A.gp_forecast_annual?.value_numeric)}</div></div>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'هامش' : 'Margin'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.blended_gp_margin?.value_numeric)}</div></div>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'استحواذ' : 'New Clients'}</div><div className='text-lg font-semibold text-mrkoon'>{A.new_clients_year_target?.value_numeric ?? '—'}</div></div>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'GMV أسبوعي' : 'Weekly GMV'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtMoney(A.weekly_gmv_target?.value_numeric)}</div></div>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'احتفاظ' : 'Retention'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.retention_rate_min?.value_numeric)}</div></div>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'الجودة' : 'Quality'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.loading_zero_issue_rate?.value_numeric)}</div></div>
              <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'وقت التشغيل' : 'Uptime'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.platform_uptime_min?.value_numeric)}</div></div>
            </div>
          )}
          <div className='text-xs text-slate-400 mt-3'>
            {lang === 'ar' ? 'يحرر عبر' : 'Edit via'} <Link to='/admin/assumptions' className='text-mrkoon hover:underline'>Admin → Assumptions</Link>
          </div>
        </Card>
      </details>
    </div>
  );
}
