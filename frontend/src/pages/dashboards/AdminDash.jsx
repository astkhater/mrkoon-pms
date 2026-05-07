import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import {
  useHeadcountStats,
  useKPILibraryStats,
  useOKRStats,
  useRecentAudit,
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

function MiniBar({ label, count, total, color = 'bg-mrkoon' }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className='flex items-center text-sm gap-2'>
      <div className='w-28 truncate'>{label}</div>
      <div className='flex-1 h-2 bg-slate-100 rounded'>
        <div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className='w-12 text-right text-xs text-slate-500'>{count}</div>
    </div>
  );
}

export default function AdminDash() {
  const { t, lang } = useTranslation();
  const hc = useHeadcountStats();
  const kpi = useKPILibraryStats();
  const okr = useOKRStats();
  const audit = useRecentAudit(8);
  const cycles = useActiveCycle();

  return (
    <div className='space-y-6'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{t('nav.admin')} — {t('nav.dashboard')}</h1>
        <Link to='/admin/config' className='text-sm text-mrkoon hover:underline'>
          {t('admin.config')} →
        </Link>
      </div>

      {/* Top KPI tiles */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile
          label={lang === 'ar' ? 'إجمالي الموظفين' : 'Active employees'}
          value={hc.isLoading ? '…' : hc.data?.total ?? 0}
          hint={lang === 'ar' ? 'في القاعدة' : 'in def.users'}
        />
        <StatTile
          label={lang === 'ar' ? 'مكتبة المؤشرات' : 'KPI library'}
          value={kpi.isLoading ? '…' : kpi.data?.total ?? 0}
          hint={lang === 'ar' ? 'مؤشر معتمد' : 'KPIs defined'}
        />
        <StatTile
          label={lang === 'ar' ? 'الأهداف النشطة' : 'Active objectives'}
          value={okr.isLoading ? '…' : okr.data?.objCount ?? 0}
          hint={`${okr.data?.krCount ?? 0} ${lang === 'ar' ? 'نتيجة رئيسية' : 'KRs'}`}
        />
        <StatTile
          label={lang === 'ar' ? 'الدورات المفتوحة' : 'Open cycles'}
          value={cycles.isLoading ? '…' : cycles.data?.length ?? 0}
          hint={cycles.data?.[0]?.label ?? '—'}
        />
      </div>

      {/* Headcount by dept + role */}
      <div className='grid md:grid-cols-2 gap-4'>
        <Card title={lang === 'ar' ? 'التوزيع حسب القسم' : 'Headcount by department'}>
          {hc.isLoading ? <Skeleton count={6} className='h-3' /> : (
            <div className='space-y-2'>
              {Object.entries(hc.data?.byDept ?? {}).sort((a,b)=>b[1]-a[1]).map(([code,c]) => (
                <MiniBar key={code} label={code} count={c} total={hc.data?.total ?? 0} />
              ))}
            </div>
          )}
        </Card>
        <Card title={lang === 'ar' ? 'التوزيع حسب الدور' : 'Headcount by role'}>
          {hc.isLoading ? <Skeleton count={6} className='h-3' /> : (
            <div className='space-y-2'>
              {Object.entries(hc.data?.byRole ?? {}).sort((a,b)=>b[1]-a[1]).map(([role,c]) => (
                <MiniBar key={role} label={role} count={c} total={hc.data?.total ?? 0} color='bg-emerald-600' />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* KPI library breakdown */}
      <div className='grid md:grid-cols-3 gap-4'>
        <Card title={lang === 'ar' ? 'المؤشرات حسب التكرار' : 'KPIs by frequency'}>
          {kpi.isLoading ? <Skeleton count={5} className='h-3' /> : (
            <div className='space-y-2'>
              {['daily','weekly','monthly','quarterly','annual'].map(f => (
                <MiniBar key={f} label={t(`kpi.${f}`)} count={kpi.data?.byFreq?.[f] ?? 0} total={kpi.data?.total ?? 0} color='bg-amber-500' />
              ))}
            </div>
          )}
        </Card>
        <Card title={lang === 'ar' ? 'المؤشرات حسب النوع' : 'KPIs by weight type'}>
          {kpi.isLoading ? <Skeleton count={4} className='h-3' /> : (
            <div className='space-y-2'>
              {['scored','gate','monitor','dashboard'].map(t2 => (
                <MiniBar key={t2} label={t2} count={kpi.data?.byType?.[t2] ?? 0} total={kpi.data?.total ?? 0} color='bg-slate-500' />
              ))}
            </div>
          )}
        </Card>
        <Card title={lang === 'ar' ? 'المؤشرات حسب القسم' : 'KPIs by team prefix'}>
          {kpi.isLoading ? <Skeleton count={6} className='h-3' /> : (
            <div className='space-y-2'>
              {Object.entries(kpi.data?.byPrefix ?? {}).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([p,c]) => (
                <MiniBar key={p} label={p} count={c} total={kpi.data?.total ?? 0} color='bg-indigo-500' />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent audit events */}
      <Card title={lang === 'ar' ? 'أحدث أحداث التدقيق' : 'Recent audit events'}>
        {audit.isLoading ? <Skeleton count={4} className='h-4' /> : (audit.data?.length === 0 ? (
          <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
        ) : (
          <table className='w-full text-sm'>
            <thead className='text-xs text-slate-500 border-b'>
              <tr><th className='text-start py-1'>When</th><th className='text-start'>Action</th><th className='text-start'>Where</th><th className='text-start'>Row</th></tr>
            </thead>
            <tbody>
              {audit.data?.map(e => (
                <tr key={e.id} className='border-b last:border-0'>
                  <td className='py-1 text-slate-500 whitespace-nowrap'>{new Date(e.at).toLocaleString()}</td>
                  <td className='font-mono text-xs'>{e.action}</td>
                  <td className='text-slate-700'>{e.schema_name}.{e.table_name}</td>
                  <td className='text-slate-400 text-xs truncate max-w-[200px]'>{e.row_pk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </Card>

      {/* Quick links */}
      <Card title={lang === 'ar' ? 'إجراءات سريعة' : 'Quick actions'}>
        <div className='grid sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm'>
          <Link to='/admin/config' className='border rounded p-2 hover:bg-slate-50'>{t('admin.config')}</Link>
          <Link to='/admin/kpi-master' className='border rounded p-2 hover:bg-slate-50'>{t('admin.kpis')}</Link>
          <Link to='/admin/levels' className='border rounded p-2 hover:bg-slate-50'>{t('admin.salary_bands')}</Link>
          <Link to='/audit' className='border rounded p-2 hover:bg-slate-50'>{t('nav.audit')}</Link>
          <Link to='/okrs' className='border rounded p-2 hover:bg-slate-50'>{t('nav.okrs')}</Link>
        </div>
      </Card>
    </div>
  );
}
