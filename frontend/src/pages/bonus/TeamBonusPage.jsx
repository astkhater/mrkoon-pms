import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

// Team Bonus view (/team/bonus) — built 2026-06-17.
// For managers/dept heads/HR/admin: shows each direct report's bonus state
// (latest approved payout, pending count, YTD approved, drilldown link).
// RLS gates which employees are visible based on the viewer's permissions.

function fmtMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' EGP';
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

function useTeam(profile, hasAccess) {
  return useQuery({
    enabled: !!profile?.id,
    queryKey: ['team.bonus.list', profile?.id],
    queryFn: async () => {
      const isHRish = hasAccess(['hr','admin']);
      const isCLevel = hasAccess(['c_level']);
      const isDeptHead = hasAccess(['dept_head']);

      let q = supabase
        .schema('def').from('users')
        .select('id, full_name_en, full_name_ar, role_code, functional_role:functional_roles(code, name_en, name_ar), department:departments(code, name_en, name_ar)')
        .eq('active', true);

      if (!isHRish && !isCLevel) {
        if (isDeptHead && profile?.department_id) {
          q = q.eq('department_id', profile.department_id);
        } else {
          q = q.eq('manager_id', profile.id);
        }
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

function usePayoutsForTeam(employeeIds) {
  return useQuery({
    enabled: employeeIds.length > 0,
    queryKey: ['team.bonus.payouts', employeeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track').from('commission_payouts')
        .select('id, employee_id, total_amount, status, period:cycle_periods(label, type, start_date), approved_at, scheme:commission_schemes(id, name_en)')
        .in('employee_id', employeeIds)
        .order('id', { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });
}

const statusTone = {
  draft: 'bg-amber-100 text-amber-700',
  pending_approval: 'bg-blue-100 text-blue-700',
  approved: 'bg-mrkoon-green-tint text-mrkoon-green',
  rejected: 'bg-rose-100 text-rose-700',
  exported: 'bg-slate-100 text-slate-600',
};

export default function TeamBonusPage() {
  const { lang } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const [scope, setScope] = useState('approved'); // approved | pending | all

  const team = useTeam(profile, hasAccess);
  const employeeIds = (team.data ?? []).map(u => u.id);
  const payouts = usePayoutsForTeam(employeeIds);

  // Aggregate per-employee
  const byEmp = {};
  (payouts.data ?? []).forEach(p => {
    if (!byEmp[p.employee_id]) byEmp[p.employee_id] = { approved_sum: 0, approved_count: 0, pending_count: 0, last_approved: null, last_approved_at: null, recent_period: null };
    if (p.status === 'approved') {
      byEmp[p.employee_id].approved_sum += Number(p.total_amount) || 0;
      byEmp[p.employee_id].approved_count += 1;
      if (!byEmp[p.employee_id].last_approved || (p.approved_at && p.approved_at > byEmp[p.employee_id].last_approved_at)) {
        byEmp[p.employee_id].last_approved = Number(p.total_amount) || 0;
        byEmp[p.employee_id].last_approved_at = p.approved_at;
        byEmp[p.employee_id].recent_period = p.period?.label;
      }
    }
    if (p.status === 'pending_approval' || p.status === 'draft') {
      byEmp[p.employee_id].pending_count += 1;
    }
  });

  const grandApproved = Object.values(byEmp).reduce((s, e) => s + e.approved_sum, 0);
  const grandPending = Object.values(byEmp).reduce((s, e) => s + e.pending_count, 0);

  const rows = (team.data ?? []).map(u => ({ ...u, ...(byEmp[u.id] || {}) }));
  const filteredRows = scope === 'pending'
    ? rows.filter(r => (r.pending_count || 0) > 0)
    : scope === 'approved'
      ? rows.filter(r => (r.approved_count || 0) > 0)
      : rows;

  const loading = team.isLoading || payouts.isLoading;

  return (
    <div className='space-y-5'>
      <div className='flex items-baseline justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>
            {lang === 'ar' ? 'مكافآت الفريق' : 'Team Bonus'}
          </h1>
          <p className='text-sm text-slate-500 mt-1'>
            {lang === 'ar'
              ? 'نظرة شاملة على دفعات المكافآت لتقاريرك المباشرة.'
              : 'Overview of bonus payouts for your direct reports.'}
          </p>
        </div>
        <Link to='/team' className='text-sm text-mrkoon-accent hover:underline'>
          {lang === 'ar' ? 'حالة الفريق ←' : 'Team status →'}
        </Link>
      </div>

      {/* Summary tiles */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{lang === 'ar' ? 'إجمالي المعتمد' : 'Total approved'}</div>
          <div className='text-2xl font-semibold text-mrkoon-green'>{loading ? '…' : fmtMoney(grandApproved)}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{lang === 'ar' ? 'بانتظار' : 'Pending'}</div>
          <div className={'text-2xl font-semibold ' + (grandPending > 0 ? 'text-amber-600' : 'text-slate-300')}>{loading ? '…' : grandPending}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{lang === 'ar' ? 'الموظفون' : 'Reports'}</div>
          <div className='text-2xl font-semibold text-mrkoon'>{loading ? '…' : (team.data?.length ?? 0)}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{lang === 'ar' ? 'متوسط للموظف' : 'Avg per report'}</div>
          <div className='text-2xl font-semibold text-mrkoon'>{loading || !team.data?.length ? '…' : fmtMoney(grandApproved / team.data.length)}</div>
        </div>
      </div>

      {/* Scope tabs */}
      <div className='flex gap-2 border-b pb-2'>
        {['approved','pending','all'].map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={'px-3 py-1.5 rounded text-sm ' + (scope === s ? 'bg-mrkoon text-white' : 'bg-white border')}
          >
            {s === 'approved' ? (lang === 'ar' ? 'معتمد' : 'Approved') :
             s === 'pending' ? (lang === 'ar' ? 'بانتظار' : 'Pending') :
                               (lang === 'ar' ? 'الكل' : 'All')}
          </button>
        ))}
      </div>

      <Card>
        {loading ? <Skeleton count={5} className='h-10' /> : (
          filteredRows.length === 0 ? (
            <div className='text-sm text-slate-500 py-8 text-center'>
              {scope === 'approved'
                ? (lang === 'ar' ? 'لا توجد دفعات معتمدة بعد لأي من تقاريرك.' : 'No approved payouts for your reports yet.')
                : scope === 'pending'
                  ? (lang === 'ar' ? 'لا توجد دفعات بانتظار.' : 'No payouts pending review.')
                  : (lang === 'ar' ? 'لا توجد بيانات.' : 'No data.')}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-xs text-slate-500 border-b'>
                  <tr>
                    <th className='text-start py-1'>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'الدور' : 'Role'}</th>
                    <th className='text-end'>{lang === 'ar' ? 'آخر معتمد' : 'Last approved'}</th>
                    <th className='text-start'>{lang === 'ar' ? 'فترة' : 'Period'}</th>
                    <th className='text-end'>{lang === 'ar' ? 'إجمالي معتمد' : 'Total approved'}</th>
                    <th className='text-end'>{lang === 'ar' ? 'بانتظار' : 'Pending'}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(u => (
                    <tr key={u.id} className='border-b last:border-0'>
                      <td className='py-1.5'>
                        <div>{lang === 'ar' ? (u.full_name_ar || u.full_name_en) : u.full_name_en}</div>
                        <div className='text-xs text-slate-500'>{u.department?.code ?? '—'}</div>
                      </td>
                      <td className='text-xs text-slate-500'>{u.functional_role?.code ?? '—'}</td>
                      <td className='text-end font-medium'>{fmtMoney(u.last_approved)}</td>
                      <td className='text-xs text-slate-500'>{u.recent_period ?? '—'}</td>
                      <td className='text-end font-medium text-mrkoon-green'>{fmtMoney(u.approved_sum)}</td>
                      <td className='text-end'>
                        {(u.pending_count || 0) > 0 ? (
                          <span className={'text-xs px-1.5 py-0.5 rounded ' + statusTone.pending_approval}>{u.pending_count}</span>
                        ) : <span className='text-xs text-slate-400'>0</span>}
                      </td>
                      <td className='text-end text-xs'>
                        <Link to={`/bonus/me?employee=${u.id}`} className='text-mrkoon-accent hover:underline'>
                          {lang === 'ar' ? 'التوقع ←' : 'projection →'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>

      <div className='text-xs text-slate-400 border-t pt-3'>
        {lang === 'ar'
          ? '⚠ الأرقام تعكس آخر تحديث من المالية. تقديرات الفترة الحالية تظهر في صفحة "التوقع" لكل موظف.'
          : '⚠ Figures reflect Finance\'s latest sync. Live projections for the current period appear on each report\'s projection page.'}
      </div>
    </div>
  );
}
