import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useObjectives } from '../../hooks/useOKRs.js';
import AttentionCard from '../../components/AttentionCard.jsx';
import {
  useHeadcountStats,
  useKPILibraryStats,
  useActiveCycle,
  useCompanyAssumptions,
} from '../../hooks/useDashboardStats.js';

function StatTile({ label, value, hint }) {
  return (
    <div className='rounded-md border bg-white p-3'>
      <div className='text-xs text-slate-500'>{label}</div>
      <div className='text-2xl font-semibold text-mrkoon mt-1'>{value}</div>
      {hint && <div className='text-xs text-slate-400 mt-1'>{hint}</div>}
    </div>
  );
}

function fmtMoney(n) {
  if (n == null) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return String(n);
}
function fmtPct(n) { return n == null ? '—' : (n * 100).toFixed(1) + '%'; }

export default function CLevelDash() {
  const { t, lang } = useTranslation();
  const { data: objectives, isLoading } = useObjectives();
  const hc = useHeadcountStats();
  const kpi = useKPILibraryStats();
  const cycles = useActiveCycle();
  const assumptions = useCompanyAssumptions();

  const companyObjs = (objectives ?? []).filter(o => o.level === 'company');
  const A = assumptions.data?.byKey ?? {};

  return (
    <div className='space-y-6'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — C-Level</h1>
        <Link to='/okrs' className='text-sm text-mrkoon hover:underline'>{t('nav.okrs')} →</Link>
      </div>

      <AttentionCard />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile
          label={lang === 'ar' ? 'الأهداف على مستوى الشركة' : 'Company objectives'}
          value={isLoading ? '…' : companyObjs.length}
          hint={lang === 'ar' ? 'سنة 2026' : 'FY 2026'}
        />
        <StatTile
          label={lang === 'ar' ? 'إجمالي الموظفين' : 'Active headcount'}
          value={hc.isLoading ? '…' : hc.data?.total ?? 0}
          hint={`${Object.keys(hc.data?.byDept ?? {}).length} ${lang === 'ar' ? 'قسم' : 'depts'}`}
        />
        <StatTile
          label={lang === 'ar' ? 'مكتبة المؤشرات' : 'KPI library'}
          value={kpi.isLoading ? '…' : kpi.data?.total ?? 0}
        />
        <StatTile
          label={lang === 'ar' ? 'الدورة المفتوحة' : 'Active cycle'}
          value={cycles.data?.[0]?.label ?? '—'}
          hint={cycles.data?.[0]?.type ?? ''}
        />
      </div>

      <Card title={lang === 'ar' ? 'الافتراضات على مستوى الشركة (FY 2026)' : 'Company assumptions (FY 2026 — single source of truth)'}>
        {assumptions.isLoading ? <Skeleton count={4} className='h-3' /> : (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'هدف الربح السنوي' : 'GP Target'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtMoney(A.gp_target_annual?.value_numeric)} EGP</div></div>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'توقع الربح' : 'GP Forecast'}</div><div className='text-lg font-semibold text-emerald-600'>{fmtMoney(A.gp_forecast_annual?.value_numeric)} EGP</div></div>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'هامش الربح' : 'Blended Margin'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.blended_gp_margin?.value_numeric)}</div></div>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'الاستحواذ السنوي' : 'New Clients (Year)'}</div><div className='text-lg font-semibold text-mrkoon'>{A.new_clients_year_target?.value_numeric ?? '—'}</div></div>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'GMV أسبوعي' : 'Weekly GMV'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtMoney(A.weekly_gmv_target?.value_numeric)} EGP</div></div>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'احتفاظ' : 'Retention'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.retention_rate_min?.value_numeric)}</div></div>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'الجودة' : 'Loading Quality'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.loading_zero_issue_rate?.value_numeric)}</div></div>
            <div className='border rounded p-2'><div className='text-xs text-slate-500'>{lang === 'ar' ? 'وقت التشغيل' : 'Platform Uptime'}</div><div className='text-lg font-semibold text-mrkoon'>{fmtPct(A.platform_uptime_min?.value_numeric)}</div></div>
          </div>
        )}
        <div className='text-xs text-slate-400 mt-3'>
          {lang === 'ar' ? 'مصدر واحد للحقيقة — يحرر عبر' : 'Single source of truth — edit via'} <Link to='/admin/assumptions' className='text-mrkoon hover:underline'>Admin → Assumptions</Link>
        </div>
      </Card>

      <Card title={lang === 'ar' ? 'الأهداف على مستوى الشركة (FY 2026)' : 'Company objectives (FY 2026)'}>
        {isLoading ? <Skeleton count={6} className='h-12' /> : (
          companyObjs.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('empty.no_okrs')}</div>
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

      <Card title={lang === 'ar' ? 'القسم: التوزيع' : 'Headcount by department'}>
        {hc.isLoading ? <Skeleton count={4} className='h-3' /> : (
          <div className='grid grid-cols-2 md:grid-cols-5 gap-2 text-center'>
            {Object.entries(hc.data?.byDept ?? {}).sort((a,b)=>b[1]-a[1]).map(([code, c]) => (
              <div key={code} className='border rounded p-2 text-sm'>
                <div className='font-mono text-xs text-slate-500'>{code}</div>
                <div className='text-xl font-semibold text-mrkoon'>{c}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
