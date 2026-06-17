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
import AttentionCard from '../../components/AttentionCard.jsx';

// Monitor-first AdminDash. Reframe 2026-06-15.
//   Lead with: system health (open period, pending invites, recent activity)
//   Outcome cards: Open periods / KPI library status / Recent activity count
//   Builder shortcuts move to a "Configuration" section at the bottom.

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
  const { lang } = useTranslation();
  const hc = useHeadcountStats();
  const kpi = useKPILibraryStats();
  const okr = useOKRStats();
  const audit = useRecentAudit(8);
  const cycles = useActiveCycle();

  const openPeriod = (cycles.data ?? [])[0];

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-2xl font-semibold'>
          {lang === 'ar' ? 'لوحة المسؤول' : 'Admin'}
        </h1>
        <p className='text-sm text-slate-500 mt-1'>
          {lang === 'ar'
            ? 'صحة النظام، الفترات المفتوحة، النشاط الأخير.'
            : 'System health, open periods, recent activity.'}
        </p>
      </div>

      <AttentionCard />

      {/* HERO CTA — Manage current period (admin's recurring action) */}
      <Link
        to='/admin/cycle-periods'
        className='block rounded-xl border-2 border-mrkoon-accent bg-gradient-to-br from-mrkoon-green-tint to-white p-5 hover:shadow-md transition-shadow'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='text-xs uppercase tracking-wider text-mrkoon-green font-semibold'>
              {lang === 'ar' ? '◔ المهمة الأساسية' : '◔ Primary action'}
            </div>
            <div className='text-xl md:text-2xl font-semibold text-mrkoon mt-1'>
              {lang === 'ar' ? 'إدارة فترات الدورات' : 'Manage cycle periods'}
            </div>
            <div className='text-sm text-slate-600 mt-1.5'>
              {openPeriod ? (
                <>
                  {lang === 'ar' ? 'الفترة المفتوحة:' : 'Open period:'}{' '}
                  <span className='font-medium'>{openPeriod.label}</span>
                  <span className='ms-2 text-slate-500'>· {cycles.data?.length ?? 0} {lang === 'ar' ? 'دورة نشطة' : 'cycles open'}</span>
                </>
              ) : (
                <span className='text-amber-600'>
                  {lang === 'ar' ? '⚠ لا توجد فترات مفتوحة — افتح واحدة لبدء الإدخال' : '⚠ No open period — open one to enable entry'}
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
              {lang === 'ar' ? 'الموظفون النشطون' : 'Active employees'}
            </div>
            <Link to='/admin/users' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'القائمة ←' : 'Manage →'}
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
              {lang === 'ar' ? 'مكتبة المؤشرات' : 'KPI library'}
            </div>
            <Link to='/admin/kpi-master' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'الكتالوج ←' : 'Catalog →'}
            </Link>
          </div>
          {kpi.isLoading ? <Skeleton count={2} className='h-6' /> : (
            <>
              <div className='text-3xl font-semibold text-mrkoon'>{kpi.data?.total ?? 0}</div>
              <div className='text-xs text-slate-500 mt-1'>
                {okr.data?.objCount ?? 0} {lang === 'ar' ? 'هدف نشط' : 'OKRs'} · {okr.data?.krCount ?? 0} KRs
              </div>
            </>
          )}
        </Card>

        <Card>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm font-medium text-mrkoon'>
              {lang === 'ar' ? 'النشاط الأخير' : 'Recent activity'}
            </div>
            <Link to='/audit' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'السجل ←' : 'Audit log →'}
            </Link>
          </div>
          {audit.isLoading ? <Skeleton count={2} className='h-6' /> : (
            <>
              <div className='text-3xl font-semibold text-mrkoon'>{audit.data?.length ?? 0}</div>
              <div className='text-xs text-slate-500 mt-1'>
                {lang === 'ar' ? 'حدث في آخر تحديث' : 'events in current view'}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Recent audit feed */}
      <Card title={lang === 'ar' ? 'النشاط الأخير' : 'Recent activity'}>
        {audit.isLoading ? <Skeleton count={4} className='h-4' /> : (
          audit.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>
              {lang === 'ar' ? 'لا يوجد نشاط' : 'No activity'}
            </div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr>
                  <th className='text-start py-1'>{lang === 'ar' ? 'الوقت' : 'When'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'الموضع' : 'Where'}</th>
                </tr>
              </thead>
              <tbody>
                {audit.data?.map(e => (
                  <tr key={e.id} className='border-b last:border-0'>
                    <td className='py-1 text-slate-500 whitespace-nowrap text-xs'>{new Date(e.at).toLocaleString()}</td>
                    <td className='font-mono text-xs'>{e.action}</td>
                    <td className='text-slate-700 text-xs'>{e.schema_name}.{e.table_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      {/* Configuration — collapsed, builder shortcuts here */}
      <details className='group'>
        <summary className='cursor-pointer text-sm font-medium text-slate-600 hover:text-mrkoon flex items-center gap-2'>
          <span className='group-open:rotate-90 transition-transform inline-block'>▸</span>
          {lang === 'ar' ? '⚙ الإعدادات وإحصاءات النظام' : '⚙ Configuration & system stats'}
        </summary>

        <div className='mt-3 space-y-4'>
          <Card title={lang === 'ar' ? 'إجراءات سريعة' : 'Quick configuration'}>
            <div className='grid sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm'>
              <Link to='/admin/config'              className='border rounded p-2 hover:bg-slate-50'>{lang === 'ar' ? 'كل الإعدادات' : 'All settings'}</Link>
              <Link to='/admin/assumptions'         className='border rounded p-2 hover:bg-slate-50 bg-amber-50'>{lang === 'ar' ? '📊 الافتراضات' : '📊 Assumptions'}</Link>
              <Link to='/admin/kpi-master'          className='border rounded p-2 hover:bg-slate-50'>{lang === 'ar' ? 'مكتبة المؤشرات' : 'KPI catalog'}</Link>
              <Link to='/admin/cycle-periods'       className='border rounded p-2 hover:bg-slate-50'>{lang === 'ar' ? 'فترات الدورة' : 'Cycle periods'}</Link>
              <Link to='/admin/compensation-inputs' className='border rounded p-2 hover:bg-slate-50'>{lang === 'ar' ? 'مدخلات التعويضات' : 'Compensation inputs'}</Link>
              <Link to='/admin/levels'              className='border rounded p-2 hover:bg-slate-50'>{lang === 'ar' ? 'المستويات والأدوار' : 'Levels & roles'}</Link>
              <Link to='/admin/users'               className='border rounded p-2 hover:bg-slate-50'>{lang === 'ar' ? '👤 المستخدمون' : '👤 Users'}</Link>
              <Link to='/audit'                     className='border rounded p-2 hover:bg-slate-50'>{lang === 'ar' ? 'سجل التدقيق' : 'Audit log'}</Link>
            </div>
          </Card>

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
        </div>
      </details>
    </div>
  );
}
