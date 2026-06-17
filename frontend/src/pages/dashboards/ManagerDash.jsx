import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useObjectives } from '../../hooks/useOKRs.js';
import { useActiveCycle } from '../../hooks/useDashboardStats.js';
import AttentionCard from '../../components/AttentionCard.jsx';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

// Monitor-first ManagerDash. Reframe 2026-06-15.
//   Lead with: pending approvals on team, team submission status
//   Outcome cards: Team Status / Team Bonus / Team OKRs
//   Builder shortcuts removed; manager doesn't configure things from home.

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

function useTeamPayouts(teamIds) {
  return useQuery({
    enabled: !!teamIds && teamIds.length > 0,
    queryKey: ['team.payouts', teamIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('commission_payouts')
        .select('id, employee_id, total_amount, status')
        .in('employee_id', teamIds)
        .order('id', { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });
}

function fmtMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' EGP';
}

export default function ManagerDash() {
  const { lang } = useTranslation();
  const { profile } = useAuth();
  const team = useTeam(profile?.id);
  const okrs = useObjectives();
  const cycles = useActiveCycle();

  const teamIds = (team.data ?? []).map(u => u.id);
  const payouts = useTeamPayouts(teamIds);

  const myObjs = (okrs.data ?? []).filter(o =>
    o.owner_user_id === profile?.id ||
    (o.level === 'department' && o.department_id === profile?.department_id)
  );

  const pendingTeamPayouts = (payouts.data ?? []).filter(p => p.status === 'draft' || p.status === 'pending_approval');
  const approvedTeamTotal = (payouts.data ?? [])
    .filter(p => p.status === 'approved')
    .reduce((s, p) => s + (Number(p.total_amount) || 0), 0);

  const openPeriod = (cycles.data ?? [])[0];
  const name = profile ? (lang === 'ar' ? profile.full_name_ar : profile.full_name_en) : '';

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-2xl font-semibold'>
          {lang === 'ar' ? 'مرحباً' : 'Welcome'}{name ? `, ${name}` : ''}
        </h1>
        <p className='text-sm text-slate-500 mt-1'>
          {lang === 'ar'
            ? 'صفحة قائد الفريق: تابع فريقك، اعتمد المؤشرات، راجع المكافآت.'
            : 'Team lead view: monitor your team, approve KPIs, review payouts.'}
        </p>
      </div>

      <AttentionCard />

      {/* HERO CTA — Team Status (always relevant for a manager) */}
      <Link
        to='/team'
        className='block rounded-xl border-2 border-mrkoon-accent bg-gradient-to-br from-mrkoon-green-tint to-white p-5 hover:shadow-md transition-shadow'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='text-xs uppercase tracking-wider text-mrkoon-green font-semibold'>
              {lang === 'ar' ? '◉ المهمة الأساسية' : '◉ Primary action'}
            </div>
            <div className='text-xl md:text-2xl font-semibold text-mrkoon mt-1'>
              {lang === 'ar' ? 'تابع حالة فريقك' : "Check your team's status"}
            </div>
            <div className='text-sm text-slate-600 mt-1.5'>
              {team.isLoading ? '…' : (
                <>
                  {team.data?.length ?? 0} {lang === 'ar' ? 'تقرير مباشر' : 'direct reports'}
                  {openPeriod && (
                    <span className='ms-2 text-slate-500'>
                      · {lang === 'ar' ? 'فترة:' : 'period:'} <span className='font-medium'>{openPeriod.label}</span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className='text-3xl text-mrkoon-accent'>→</div>
        </div>
      </Link>

      {/* Outcome cards */}
      <div className='grid md:grid-cols-3 gap-4'>
        <Card>
          <div className='fle