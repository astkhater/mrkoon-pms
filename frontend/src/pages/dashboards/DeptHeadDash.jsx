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

// Monitor-first DeptHeadDash. Reframe 2026-06-15.
//   Lead with: department health (calibration readiness, submission compliance)
//   Outcome cards: Dept performance / Dept OKRs / Dept Bonus total
//   Roster compact at bottom — not the headline.

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

function useDeptPayouts(deptUserIds) {
  return useQuery({
    enabled: deptUserIds.length > 0,
    queryKey: ['dept.payouts', deptUserIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('commission_payouts')
        .select('id, employee_id, total_amount, status')
        .in('employee_id', deptUserIds);
      if (error) return [];
      return data ?? [];
    },
  });
}

function fmtMoney(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K EGP';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' EGP';
}

export default function DeptHeadDash() {
  const { lang } = useTranslation();
  const { profile } = useAuth();
  const deptUsers = useDeptUsers(profile?.department_id);
  const okrs = useObjectives();
  const depts = useDepartments();
  const cycles = useActiveCycle();

  const userIds = (deptUsers.data ?? []).map(u => u.id);
  const payouts = useDeptPayouts(userIds);

  const myDept = depts.data?.find(d => d.id === profile?.department_id);
  const deptName = lang === 'ar' ? (myDept?.name_ar || 'قسمي') : (myDept?.name_en || 'My department');

  const deptObjs = (okrs.data ?? []).filter(o =>
    o.level === 'department' && o.department_id === profile?.department_id
  );
  const companyObjs = (okrs.data ?? []).filter(o => o.level === 'company');

  const approvedTotal = (payouts.data ?? [])
    .filter(p => p.status === 'approved')
    .reduce((s, p) => s + (Number(p.total_amount) || 0), 0);

  const openPeriod = (cycles.data ?? [])[0];

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-2xl font-semibold'>{deptName}</h1>
        <p className='text-sm text-slate-500 mt-1'>
          {lang === 'ar'
            ? 'نظرة شاملة على القسم: الأداء، الأهداف، المعايرة.'
            : 'Department overview: performance, objectives, calibration.'}
        </p>
      </div>

      <AttentionCard />

      {/* HERO CTA — Calibration */}
      <Link
        to='/appraisals/calibration'
        className='block rounded-xl border-2 border-mrkoon-accent bg-gradient-to-br from-mrkoon-green-tint to-white p-5 hover:shadow-md transition-shadow'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='text-xs uppercase tracking-wider text-mrkoon-green font-semibold'>
              {lang === 'ar' ? '⚖ المهمة الأساسية' : '⚖ Primary action'}
            </div>
            <div className='text-xl md:text-2xl font-semibold text-mrkoon mt-1'>
              {lang === 'ar' ? 'راجع معايرة تقييمات القسم' : 'Calibrate department ratings'}
            </div>
            <div className='text-sm text-slate-600 mt-1.5'>
              {deptUsers.data?.length ?? 0} {lang === 'ar' ? 'موظف' : 'employees'}
              {openPeriod && (
                <span className='ms-2 text-slate-500'>
                  · {lang === 'ar' ? 'فترة:' : 'period:'} <span className='font-medium'>{openPeriod.label}</span>
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
              {lang === 'ar' ? 'أهداف القسم' : 'Dept OKRs'}
            </div>
            <Link to='/okrs' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'الكل ←' : 'View all →'}
            </Link>
          