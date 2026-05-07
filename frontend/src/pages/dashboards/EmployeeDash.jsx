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

// Pull KPIs assigned to user's functional role (subset of full library)
function useMyKPIs(functionalRoleId) {
  return useQuery({
    enabled: !!functionalRoleId,
    queryKey: ['my.kpis', functionalRoleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpi_role_weights')
        .select('kpi_id, weight, weight_type')
        .eq('functional_role_id', functionalRoleId);
      if (error) {
        if ((error.message || '').toLowerCase().includes('permission')) return [];
        throw error;
      }
      return data ?? [];
    },
  });
}

export default function EmployeeDash() {
  const { t, lang } = useTranslation();
  const { profile } = useAuth();
  const name = profile ? (lang === 'ar' ? profile.full_name_ar : profile.full_name_en) : '';
  const okrs = useObjectives();
  const cycles = useActiveCycle();
  const myKpis = useMyKPIs(profile?.functional_role_id);

  // "My OKRs" = objectives owned by this user (as owner_user_id) + dept-level for my dept
  const myObjs = (okrs.data ?? []).filter(o =>
    o.owner_user_id === profile?.id ||
    (o.level === 'department' && o.department_id === profile?.department_id)
  );

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold'>{t('dashboard.welcome')}{name ? ', ' + name : ''}</h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile
          label={t('dashboard.my_okrs')}
          value={okrs.isLoading ? '…' : myObjs.length}
          hint={lang === 'ar' ? 'هدف شخصي/قسم' : 'mine + dept'}
        />
        <StatTile
          label={t('dashboard.my_kpis')}
          value={myKpis.isLoading ? '…' : myKpis.data?.length ?? 0}
          hint={lang === 'ar' ? 'مؤشرات هذه الفترة' : 'this period'}
        />
        <StatTile
          label={t('dashboard.period_open')}
          value={cycles.data?.[0]?.label ?? '—'}
        />
        <StatTile
          label={t('dashboard.bonus_estimate')}
          value='—'
          hint={t('dashboard.bonus_estimate_note')}
        />
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        <Card title={t('dashboard.my_okrs')}>
          {okrs.isLoading ? <Skeleton count={3} className='h-10' /> : (
            myObjs.length === 0 ? (
              <div className='text-sm text-slate-500'>{t('empty.no_okrs')}</div>
            ) : (
              <div className='space-y-1 text-sm'>
                {myObjs.slice(0, 6).map(o => (
                  <Link key={o.id} to='/okrs' className='block border rounded p-2 hover:bg-slate-50'>
                    <span className='text-xs text-slate-500 font-mono me-2'>{o.code}</span>
                    {lang === 'ar' ? o.title_ar : o.title_en}
                  </Link>
                ))}
                {myObjs.length > 6 && (
                  <Link to='/okrs' className='text-xs text-mrkoon hover:underline block mt-2'>+{myObjs.length - 6} more →</Link>
                )}
              </div>
            )
          )}
        </Card>

        <Card title={t('dashboard.my_kpis')}>
          {myKpis.isLoading ? <Skeleton count={4} className='h-3' /> : (
            myKpis.data?.length === 0 ? (
              <div>
                <div className='text-sm text-slate-500 mb-2'>{t('kpi.no_kpis_assigned')}</div>
                <Link to='/kpis' className='text-xs text-mrkoon hover:underline'>{t('kpi.library')} →</Link>
              </div>
            ) : (
              <div className='space-y-1 text-sm'>
                {myKpis.data?.slice(0, 8).map(k => (
                  <div key={k.kpi_id} className='flex items-center justify-between border rounded p-2'>
                    <span className='font-mono text-xs'>{k.kpi_id}</span>
                    <span className='text-xs text-slate-500'>w {k.weight ?? '—'} · {k.weight_type ?? 'scored'}</span>
                  </div>
                ))}
                {(myKpis.data?.length ?? 0) > 8 && (
                  <Link to='/kpis' className='text-xs text-mrkoon hover:underline block mt-2'>+{(myKpis.data?.length ?? 0) - 8} more →</Link>
                )}
              </div>
            )
          )}
        </Card>

        <Card title={t('dashboard.appraisal_status')}>
          <div className='text-sm text-slate-500'>{t('empty.no_appraisals')}</div>
        </Card>

        <Card title={t('dashboard.bonus_estimate')}>
          <div className='text-sm text-slate-500'>{t('empty.no_payouts')}</div>
          <div className='text-xs text-slate-400 mt-1'>{t('dashboard.bonus_estimate_note')}</div>
        </Card>
      </div>
    </div>
  );
}
