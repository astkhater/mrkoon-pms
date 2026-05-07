import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useObjectives } from '../../hooks/useOKRs.js';
import { useActiveCycle } from '../../hooks/useDashboardStats.js';
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

function useTeam(managerId) {
  return useQuery({
    enabled: !!managerId,
    queryKey: ['team', managerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('users')
        .select('id, full_name_en, full_name_ar, role_code, level_id, functional_role_id, active')
        .eq('manager_id', managerId)
        .eq('active', true);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function ManagerDash() {
  const { t, lang } = useTranslation();
  const { profile } = useAuth();
  const team = useTeam(profile?.id);
  const okrs = useObjectives();
  const cycles = useActiveCycle();

  const myObjs = (okrs.data ?? []).filter(o =>
    o.owner_user_id === profile?.id ||
    (o.level === 'department' && o.department_id === profile?.department_id)
  );

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold'>
        {t('dashboard.welcome')}{profile ? ', ' + (lang === 'ar' ? profile.full_name_ar : profile.full_name_en) : ''}
      </h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile
          label={lang === 'ar' ? 'حجم الفريق' : 'Direct reports'}
          value={team.isLoading ? '…' : team.data?.length ?? 0}
          hint={lang === 'ar' ? 'موظف نشط' : 'active'}
        />
        <StatTile
          label={t('dashboard.my_okrs')}
          value={okrs.isLoading ? '…' : myObjs.length}
        />
        <StatTile
          label={t('dashboard.period_open')}
          value={cycles.data?.[0]?.label ?? '—'}
        />
        <StatTile
          label={lang === 'ar' ? 'تقييمات بانتظاري' : 'Pending my review'}
          value='0'
          hint={t('common.no_data')}
        />
      </div>

      <Card title={lang === 'ar' ? 'فريقي' : 'My team'}>
        {team.isLoading ? <Skeleton count={4} className='h-8' /> : (
          team.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{lang === 'ar' ? 'لا يوجد موظفون مرتبطون بك' : 'No direct reports'}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>{lang === 'ar' ? 'الاسم' : 'Name'}</th><th className='text-start'>{lang === 'ar' ? 'الدور' : 'Role'}</th><th className='text-start'>{lang === 'ar' ? 'الحالة' : 'Status'}</th></tr>
              </thead>
              <tbody>
                {team.data?.map(u => (
                  <tr key={u.id} className='border-b last:border-0'>
                    <td className='py-1.5'>{lang === 'ar' ? (u.full_name_ar || u.full_name_en) : u.full_name_en}</td>
                    <td className='font-mono text-xs text-slate-500'>{u.role_code}</td>
                    <td><span className='inline-block w-2 h-2 rounded-full bg-emerald-500 me-2'></span>{lang === 'ar' ? 'نشط' : 'active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      <Card title={t('dashboard.my_okrs')}>
        {okrs.isLoading ? <Skeleton count={3} className='h-10' /> : (
          myObjs.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('empty.no_okrs')}</div>
          ) : (
            <div className='space-y-1 text-sm'>
              {myObjs.map(o => (
                <Link key={o.id} to='/okrs' className='block border rounded p-2 hover:bg-slate-50'>
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
