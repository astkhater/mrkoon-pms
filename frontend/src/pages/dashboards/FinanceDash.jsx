import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useHeadcountStats, useActiveCycle } from '../../hooks/useDashboardStats.js';
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

export default function FinanceDash() {
  const { t, lang } = useTranslation();
  const hc = useHeadcountStats();
  const cycles = useActiveCycle();

  // Identify COGS vs OpEx departments (defined in schema seed)
  const cogs = ['BD','AM','OPS','VM','ONB'];
  const opex = ['MKT','TECH','FIN','HR','MGMT'];

  const cogsTotal = (hc.data && Object.entries(hc.data.byDept).filter(([k]) => cogs.includes(k)).reduce((s,[,v]) => s+v, 0)) ?? 0;
  const opexTotal = (hc.data && Object.entries(hc.data.byDept).filter(([k]) => opex.includes(k)).reduce((s,[,v]) => s+v, 0)) ?? 0;

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — Finance</h1>

      <div className='flex gap-2 flex-wrap'>
        <Badge tone='red'>{t('dashboard.crm_not_connected')}</Badge>
        <Badge tone='red'>{t('dashboard.erp_not_connected')}</Badge>
      </div>

      <AttentionCard />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile
          label={lang === 'ar' ? 'إجمالي الموظفين' : 'Active headcount'}
          value={hc.isLoading ? '…' : hc.data?.total ?? 0}
        />
        <StatTile
          label={lang === 'ar' ? 'فرق العمولة (COGS)' : 'Commission teams (COGS)'}
          value={hc.isLoading ? '…' : cogsTotal}
          hint={cogs.join(', ')}
        />
        <StatTile
          label={lang === 'ar' ? 'فرق المكافآت (OpEx)' : 'Bonus teams (OpEx)'}
          value={hc.isLoading ? '…' : opexTotal}
          hint={opex.join(', ')}
        />
        <StatTile
          label={t('dashboard.period_open')}
          value={cycles.data?.[0]?.label ?? '—'}
        />
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        <Card title={t('bonus.pending')}>
          <div className='text-sm text-slate-500'>{t('empty.no_payouts')}</div>
          <div className='text-xs text-slate-400 mt-1'>{lang === 'ar' ? 'الحوافز تظهر هنا بعد فتح دورة المكافآت ربع/سنوية.' : 'Payouts appear here after a quarterly/annual bonus run.'}</div>
        </Card>
        <Card title={t('bonus.approved_recent')}>
          <div className='text-sm text-slate-500'>{t('empty.no_payouts')}</div>
        </Card>
      </div>

      <Card title={lang === 'ar' ? 'الموظفون حسب القسم' : 'Employees by department'}>
        {hc.isLoading ? <Skeleton count={5} className='h-3' /> : (
          <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
            {Object.entries(hc.data?.byDept ?? {}).sort((a,b)=>b[1]-a[1]).map(([code, c]) => (
              <div key={code} className={`border rounded p-2 text-center ${cogs.includes(code) ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                <div className='font-mono text-xs text-slate-500'>{code}</div>
                <div className='text-xl font-semibold text-mrkoon'>{c}</div>
                <div className='text-[10px] text-slate-400'>{cogs.includes(code) ? 'COGS' : 'OpEx'}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={lang === 'ar' ? 'إجراءات سريعة' : 'Quick actions'}>
        <div className='grid sm:grid-cols-3 gap-2 text-sm'>
          <Link to='/admin/compensation-inputs' className='border rounded p-2 hover:bg-slate-50'>{t('admin.rates')}</Link>
          <Link to='/bonus' className='border rounded p-2 hover:bg-slate-50'>{t('nav.bonus')}</Link>
          <Link to='/audit' className='border rounded p-2 hover:bg-slate-50'>{t('nav.audit')}</Link>
        </div>
      </Card>
    </div>
  );
}
