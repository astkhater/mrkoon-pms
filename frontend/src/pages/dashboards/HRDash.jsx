import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useHeadcountStats, useActiveCycle } from '../../hooks/useDashboardStats.js';
import { useCyclePeriods } from '../../hooks/useOKRs.js';
import AttentionCard from '../../components/AttentionCard.jsx';

function StatTile({ label, value, hint }) {
  return (
    <div className='rounded-md border bg-white p-3'>
      <div className='text-xs text-slate-500'>{label}</div>
      <div className='text-2xl font-semibold text-mrkoon mt-1'>{value}</div>
      {hint && <div className='text-xs text-slate-400 mt-1'>{hint}</div>}
    </div>
  );
}

export default function HRDash() {
  const { t, lang } = useTranslation();
  const hc = useHeadcountStats();
  const open = useActiveCycle();
  const allCycles = useCyclePeriods();

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — HR</h1>

      <AttentionCard />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile
          label={lang === 'ar' ? 'إجمالي الموظفين' : 'Headcount'}
          value={hc.isLoading ? '…' : hc.data?.total ?? 0}
        />
        <StatTile
          label={lang === 'ar' ? 'الأقسام' : 'Departments'}
          value={hc.isLoading ? '…' : Object.keys(hc.data?.byDept ?? {}).length}
        />
        <StatTile
          label={lang === 'ar' ? 'دورات مفتوحة' : 'Open cycles'}
          value={open.isLoading ? '…' : open.data?.length ?? 0}
        />
        <StatTile
          label={lang === 'ar' ? 'إجمالي الدورات' : 'Total cycles'}
          value={allCycles.isLoading ? '…' : allCycles.data?.length ?? 0}
        />
      </div>

      <Card title={t('hr.cycles')}>
        {allCycles.isLoading ? <Skeleton count={4} className='h-8' /> : (
          allCycles.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>{t('common.period')}</th><th className='text-start'>{lang === 'ar' ? 'النوع' : 'Type'}</th><th className='text-start'>{lang === 'ar' ? 'البداية' : 'Start'}</th><th className='text-start'>{lang === 'ar' ? 'النهاية' : 'End'}</th><th className='text-start'>{t('common.status')}</th></tr>
              </thead>
              <tbody>
                {allCycles.data?.map(c => (
                  <tr key={c.id} className='border-b last:border-0'>
                    <td className='py-1.5'>{c.label}</td>
                    <td className='font-mono text-xs text-slate-500'>{c.type}</td>
                    <td className='text-xs text-slate-500'>{c.start_date}</td>
                    <td className='text-xs text-slate-500'>{c.end_date}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${c.status === 'open' ? 'bg-emerald-100 text-emerald-700' : c.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      <Card title={lang === 'ar' ? 'القوى العاملة حسب القسم' : 'Headcount by department'}>
        {hc.isLoading ? <Skeleton count={5} className='h-3' /> : (
          <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
            {Object.entries(hc.data?.byDept ?? {}).sort((a,b)=>b[1]-a[1]).map(([code, c]) => (
              <div key={code} className='border rounded p-2 text-center'>
                <div className='font-mono text-xs text-slate-500'>{code}</div>
                <div className='text-xl font-semibold text-mrkoon'>{c}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={lang === 'ar' ? 'إجراءات سريعة' : 'Quick actions'}>
        <div className='grid sm:grid-cols-3 gap-2 text-sm'>
          <Link to='/admin/levels' className='border rounded p-2 hover:bg-slate-50'>{t('admin.salary_bands')}</Link>
          <Link to='/admin/kpi-master' className='border rounded p-2 hover:bg-slate-50'>{t('admin.kpis')}</Link>
          <Link to='/audit' className='border rounded p-2 hover:bg-slate-50'>{t('nav.audit')}</Link>
        </div>
      </Card>
    </div>
  );
}
