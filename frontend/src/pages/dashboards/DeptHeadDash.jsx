import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useObjectives, useDepartments } from '../../hooks/useOKRs.js';
import { useActiveCycle } from '../../hooks/useDashboardStats.js';
import AttentionCard from '../../components/AttentionCard.jsx';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function StatTile({ label, value, hint }) {
  return (
    <div className='rounded-md border bg-white p-3'>
      <div className='text-xs text-slate-500'>{label}</div>
      <div className='text-2xl font-semibold text-mrkoon mt-1'>{value}</div>
      {hint && <div className='text-xs text-slate-400 mt-1'>{hint}</div>}
    </div>
  );
}

function useDeptUsers(deptId) {
  return useQuery({
    enabled: !!deptId,
    queryKey: ['deptUsers', deptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('users')
        .select('id, full_name_en, full_name_ar, role_code, level_id, manager_id')
        .eq('department_id', deptId)
        .eq('active', true);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function DeptHeadDash() {
  const { t, lang } = useTranslation();
  const { profile } = useAuth();
  const deptUsers = useDeptUsers(profile?.department_id);
  const okrs = useObjectives();
  const depts = useDepartments();
  const cycles = useActiveCycle();

  const myDept = depts.data?.find(d => d.id === profile?.department_id);
  const deptObjs = (okrs.data ?? []).filter(o =>
    (o.level === 'department' && o.department_id === profile?.department_id) ||
    (o.level === 'company') // dept heads see company OKRs too
  );

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold'>
        {t('nav.dashboard')} — {lang === 'ar' ? (myDept?.name_ar || 'رئيس قسم') : (myDept?.name_en || 'Department Head')}
      </h1>

      <AttentionCard />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile
          label={lang === 'ar' ? 'الموظفون في قسمي' : 'My department'}
          value={deptUsers.isLoading ? '…' : deptUsers.data?.length ?? 0}
        />
        <StatTile
          label={lang === 'ar' ? 'أهداف القسم' : 'Dept objectives'}
          value={okrs.isLoading ? '…' : deptObjs.filter(o => o.level === 'department').length}
        />
        <StatTile
          label={lang === 'ar' ? 'أهداف الشركة' : 'Company objectives'}
          value={okrs.isLoading ? '…' : deptObjs.filter(o => o.level === 'company').length}
        />
        <StatTile
          label={t('dashboard.period_open')}
          value={cycles.data?.[0]?.label ?? '—'}
        />
      </div>

      <Card title={lang === 'ar' ? 'فريق القسم' : 'Department roster'}>
        {deptUsers.isLoading ? <Skeleton count={5} className='h-8' /> : (
          deptUsers.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>{lang === 'ar' ? 'الاسم' : 'Name'}</th><th className='text-start'>{lang === 'ar' ? 'الدور' : 'Role'}</th></tr>
              </thead>
              <tbody>
                {deptUsers.data?.map(u => (
                  <tr key={u.id} className='border-b last:border-0'>
                    <td className='py-1.5'>{lang === 'ar' ? (u.full_name_ar || u.full_name_en) : u.full_name_en}</td>
                    <td className='font-mono text-xs text-slate-500'>{u.role_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      <Card title={lang === 'ar' ? 'الأهداف ذات الصلة' : 'Related objectives'}>
        {okrs.isLoading ? <Skeleton count={3} className='h-10' /> : (
          deptObjs.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('empty.no_okrs')}</div>
          ) : (
            <div className='space-y-1 text-sm'>
              {deptObjs.map(o => (
                <Link key={o.id} to='/okrs' className='block border rounded p-2 hover:bg-slate-50'>
                  <span className={`text-xs me-2 px-1.5 py-0.5 rounded ${o.level === 'company' ? 'bg-mrkoon/10 text-mrkoon' : 'bg-emerald-100 text-emerald-700'}`}>{o.level}</span>
                  <span className='text-xs text-slate-500 font-mono me-2'>{o.code}</span>
                  {lang === 'ar' ? o.title_ar : o.title_en}
                  <span className='ms-2 text-xs text-slate-400'>· {(o.key_results || []).length} KRs</span>
                </Link>
              ))}
            </div>
          )
        )}
      </Card>
    </div>
  );
}
