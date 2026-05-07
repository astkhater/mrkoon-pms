import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useObjectives } from '../../hooks/useOKRs.js';
import {
  useHeadcountStats,
  useKPILibraryStats,
  useActiveCycle,
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

export default function CLevelDash() {
  const { t, lang } = useTranslation();
  const { data: objectives, isLoading } = useObjectives();
  const hc = useHeadcountStats();
  const kpi = useKPILibraryStats();
  const cycles = useActiveCycle();

  const companyObjs = (objectives ?? []).filter(o => o.level === 'company');

  return (
    <div className='space-y-6'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — C-Level</h1>
        <Link to='/okrs' className='text-sm text-mrkoon hover:underline'>{t('nav.okrs')} →</Link>
      </div>

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
