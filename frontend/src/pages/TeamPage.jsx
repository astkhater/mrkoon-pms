import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase.js';

function useTeam(profile, hasAccess) {
  return useQuery({
    enabled: !!profile?.id,
    queryKey: ['team.full', profile?.id],
    queryFn: async () => {
      const isHR = hasAccess(['hr']);
      const isAdmin = hasAccess(['admin']);
      const isDeptHead = hasAccess(['dept_head']);
      const isCLevel = hasAccess(['c_level']);

      let q = supabase
        .schema('def').from('users')
        .select('id, full_name_en, full_name_ar, role_code, level_id, functional_role_id, department_id, active, department:departments(code, name_en), level:levels(code), functional_role:functional_roles(code)')
        .eq('active', true);

      if (isHR || isAdmin) {
        // all
      } else if (isCLevel) {
        // all (c-level sees company-wide)
      } else if (isDeptHead && profile?.department_id) {
        q = q.eq('department_id', profile.department_id);
      } else {
        q = q.eq('manager_id', profile.id);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useTeamKPIStats(team) {
  return useQuery({
    enabled: !!team && team.length > 0,
    queryKey: ['team.kpiStats', team?.map(t => t.id).join(',')],
    queryFn: async () => {
      const empIds = team.map(t => t.id);
      // KPI count per employee = count of kpi_role_weights for their functional role
      const roleIds = [...new Set(team.map(t => t.functional_role_id).filter(Boolean))];
      let kpiCounts = {};
      if (roleIds.length > 0) {
        const { data: rw } = await supabase
          .schema('def').from('kpi_role_weights')
          .select('functional_role_id, kpi_id')
          .in('functional_role_id', roleIds);
        const byRole = {};
        (rw ?? []).forEach(r => { byRole[r.functional_role_id] = (byRole[r.functional_role_id] ?? 0) + 1; });
        team.forEach(t => { kpiCounts[t.id] = byRole[t.functional_role_id] ?? 0; });
      }
      // Latest actuals + count per employee
      const { data: actuals } = await supabase
        .schema('track').from('kpi_actuals')
        .select('employee_id, actual_value, updated_at, kpi:kpis(id, target_value, frequency)')
        .in('employee_id', empIds)
        .order('updated_at', { ascending: false });
      const byEmp = {};
      (actuals ?? []).forEach(a => {
        if (!byEmp[a.employee_id]) byEmp[a.employee_id] = { latest: a.updated_at, rag: { g: 0, a: 0, r: 0, gray: 0 }, total: 0 };
        byEmp[a.employee_id].total += 1;
        const t = a.kpi?.target_value;
        const v = Number(a.actual_value);
        if (t == null || isNaN(v)) { byEmp[a.employee_id].rag.gray += 1; return; }
        const ratio = v / t;
        if (ratio >= 1.0) byEmp[a.employee_id].rag.g += 1;
        else if (ratio >= 0.7) byEmp[a.employee_id].rag.a += 1;
        else byEmp[a.employee_id].rag.r += 1;
      });
      // Appraisal latest status per employee
      const { data: apprs } = await supabase
        .schema('track').from('appraisals')
        .select('employee_id, status, final_rating, cycle:appraisal_cycles(period:cycle_periods(label, type))')
        .in('employee_id', empIds)
        .order('id', { ascending: false });
      const lastApprByEmp = {};
      (apprs ?? []).forEach(a => { if (!lastApprByEmp[a.employee_id]) lastApprByEmp[a.employee_id] = a; });

      return team.map(t => ({
        ...t,
        kpis_assigned: kpiCounts[t.id] ?? 0,
        actuals_count: byEmp[t.id]?.total ?? 0,
        latest_actual: byEmp[t.id]?.latest ?? null,
        rag: byEmp[t.id]?.rag ?? { g: 0, a: 0, r: 0, gray: 0 },
        last_appraisal: lastApprByEmp[t.id] ?? null,
      }));
    },
  });
}

function daysSince(iso) {
  if (!iso) return null;
  const d = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(d);
}

const apprTone = {
  draft: 'bg-amber-100 text-amber-700',
  submitted: 'bg-blue-100 text-blue-700',
  manager_reviewed: 'bg-indigo-100 text-indigo-700',
  calibrated: 'bg-purple-100 text-purple-700',
  hr_signoff: 'bg-mrkoon-green-tint text-mrkoon-green',
  closed: 'bg-slate-100 text-slate-600',
};

export default function TeamPage() {
  const { profile, hasAccess } = useAuth();
  const { lang, t } = useTranslation();
  const team = useTeam(profile, hasAccess);
  const stats = useTeamKPIStats(team.data);

  const rows = stats.data ?? team.data ?? [];
  const summary = useMemo(() => {
    const total = rows.length;
    let totalActuals = 0, g = 0, a = 0, r = 0;
    rows.forEach(x => {
      totalActuals += x.actuals_count ?? 0;
      g += x.rag?.g ?? 0;
      a += x.rag?.a ?? 0;
      r += x.rag?.r ?? 0;
    });
    return { total, totalActuals, g, a, r };
  }, [rows]);

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{lang === 'ar' ? 'الفريق' : 'My Team'}</h1>
        <div className='text-sm text-slate-500'>{summary.total} {lang === 'ar' ? 'موظف' : 'reports'}</div>
      </div>

      {/* Summary tiles */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{lang === 'ar' ? 'إجمالي القيم المسجلة' : 'Total actuals'}</div>
          <div className='text-2xl font-semibold text-mrkoon'>{summary.totalActuals}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{t('kpi.traffic_green')}</div>
          <div className='text-2xl font-semibold text-emerald-600'>{summary.g}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{t('kpi.traffic_amber')}</div>
          <div className='text-2xl font-semibold text-amber-600'>{summary.a}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{t('kpi.traffic_red')}</div>
          <div className='text-2xl font-semibold text-rose-600'>{summary.r}</div>
        </div>
      </div>

      <Card>
        {team.isLoading || stats.isLoading ? <Skeleton count={5} className='h-10' /> : (
          rows.length === 0 ? (
            <div className='text-sm text-slate-500 py-8 text-center'>
              {lang === 'ar' ? 'لا يوجد موظفون تحت إشرافك' : 'No direct reports — nothing to show.'}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-xs text-slate-500 border-b'>
                  <tr>
                    <th className='text-start py-1'>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'القسم' : 'Dept'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'المستوى' : 'Level'}</th>
                    <th className='text-end'>{lang === 'ar' ? 'مؤشرات' : 'KPIs'}</th>
                    <th className='text-end'>{lang === 'ar' ? 'القيم' : 'Actuals'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'الحالة' : 'RAG'}</th>
                    <th className='text-end'>{lang === 'ar' ? 'آخر إدخال' : 'Last entry'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'آخر تقييم' : 'Last appraisal'}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(u => {
                    const d = daysSince(u.latest_actual);
                    const stale = d != null && d > 14;
                    return (
                      <tr key={u.id} className='border-b last:border-0'>
                        <td className='py-1.5'>
                          <div>{lang === 'ar' ? (u.full_name_ar || u.full_name_en) : u.full_name_en}</div>
                          <div className='text-xs text-slate-500'>{u.functional_role?.code ?? '—'}</div>
                        </td>
                        <td className='text-xs'>{u.department?.code ?? '—'}</td>
                        <td className='text-xs'>{u.level?.code ?? '—'}</td>
                        <td className='text-end'>{u.kpis_assigned ?? 0}</td>
                        <td className='text-end'>{u.actuals_count ?? 0}</td>
                        <td>
                          <div className='flex gap-1'>
                            {u.rag?.g > 0 && <span className='text-xs px-1.5 rounded bg-emerald-100 text-emerald-700'>{u.rag.g}</span>}
                            {u.rag?.a > 0 && <span className='text-xs px-1.5 rounded bg-amber-100 text-amber-700'>{u.rag.a}</span>}
                            {u.rag?.r > 0 && <span className='text-xs px-1.5 rounded bg-rose-100 text-rose-700'>{u.rag.r}</span>}
                            {(!u.rag || (u.rag.g + u.rag.a + u.rag.r) === 0) && <span className='text-xs text-slate-400'>—</span>}
                          </div>
                        </td>
                        <td className={`text-end text-xs ${stale ? 'text-rose-600' : 'text-slate-500'}`}>
                          {d == null ? '—' : `${d}d`}
                        </td>
                        <td className='text-xs'>
                          {u.last_appraisal ? (
                            <span>
                              <span className={`px-1.5 py-0.5 rounded ${apprTone[u.last_appraisal.status] || apprTone.draft}`}>{u.last_appraisal.status}</span>
                              {u.last_appraisal.final_rating != null && <span className='ms-1'>· {u.last_appraisal.final_rating}</span>}
                            </span>
                          ) : '—'}
                        </td>
                        <td className='text-end text-xs'>
                          <Link to={`/kpis/entry?employee=${u.id}`} className='text-mrkoon hover:underline'>enter →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
