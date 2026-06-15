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

// Action-first employee home. Reframe 2026-06-15:
//   Top: Welcome + AttentionCard (what's urgent)
//   Hero CTA: "Enter this month's KPIs" — the daily-use action
//   Below: My Bonus (live or last) | My OKRs | My Appraisal — outcomes, not config
// All "builder" surfaces (KPI catalog browse, scheme view) moved to /kpis or Settings.

function useMyKPIs(functionalRoleId) {
  return useQuery({
    enabled: !!functionalRoleId,
    queryKey: ['my.kpis', functionalRoleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpi_role_weights')
        .select('kpi_id, weight, weight_type, kpi:kpis(name_en, name_ar)')
        .eq('functional_role_id', functionalRoleId);
      if (error) {
        if ((error.message || '').toLowerCase().includes('permission')) return [];
        throw error;
      }
      return data ?? [];
    },
  });
}

function useMyRecentPayouts(userId) {
  return useQuery({
    enabled: !!userId,
    queryKey: ['my.payouts.recent', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('commission_payouts')
        .select('id, total_amount, status, scheme:commission_schemes(name_en, name_ar, cadence), period:cycle_periods(label, type)')
        .eq('employee_id', userId)
        .order('id', { ascending: false })
        .limit(6);
      if (error) return [];
      return data ?? [];
    },
  });
}

function useMyAppraisal(userId) {
  return useQuery({
    enabled: !!userId,
    queryKey: ['my.appraisal.current', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('appraisals')
        .select('id, status, overall_rating, period:cycle_periods(label)')
        .eq('employee_id', userId)
        .order('id', { ascending: false })
        .limit(1);
      if (error) return null;
      return (data && data[0]) || null;
    },
  });
}

function fmtMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' EGP';
}

export default function EmployeeDash() {
  const { t, lang } = useTranslation();
  const { profile } = useAuth();
  const name = profile ? (lang === 'ar' ? profile.full_name_ar : profile.full_name_en) : '';

  const okrs = useObjectives();
  const cycles = useActiveCycle();
  const myKpis = useMyKPIs(profile?.functional_role_id);
  const payouts = useMyRecentPayouts(profile?.id);
  const appraisal = useMyAppraisal(profile?.id);

  const myObjs = (okrs.data ?? []).filter(o =>
    o.owner_user_id === profile?.id ||
    (o.level === 'department' && o.department_id === profile?.department_id)
  );

  // Pick the active monthly period if one exists, else the first open period
  const openPeriod = (cycles.data ?? []).find(c => c.type === 'monthly') || (cycles.data ?? [])[0];
  const kpiCount = myKpis.data?.length ?? 0;

  // Most-recent payout summary (until live projection RPC ships in next task)
  const approvedThisCycle = (payouts.data ?? []).find(p => p.status === 'approved');
  const lastPayoutAmt = approvedThisCycle?.total_amount;
  const lastPayoutLabel = approvedThisCycle?.period?.label;

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-2xl font-semibold'>
          {lang === 'ar' ? 'مرحباً' : 'Welcome'}{name ? `, ${name}` : ''}
        </h1>
        <p className='text-sm text-slate-500 mt-1'>
          {lang === 'ar'
            ? 'هذه صفحتك للعمل اليومي: أدخل بياناتك، تابع أهدافك، واطّلع على مكافآتك.'
            : 'Your daily home: enter your data, track your OKRs, see your bonus.'}
        </p>
      </div>

      <AttentionCard />

      {/* HERO CTA — Enter This Month's KPIs */}
      <Link
        to='/kpis/entry'
        className='block rounded-xl border-2 border-mrkoon-accent bg-gradient-to-br from-mrkoon-green-tint to-white p-5 hover:shadow-md transition-shadow'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='text-xs uppercase tracking-wider text-mrkoon-green font-semibold'>
              {lang === 'ar' ? '✎ المهمة الأساسية' : '✎ Primary action'}
            </div>
            <div className='text-xl md:text-2xl font-semibold text-mrkoon mt-1'>
              {lang === 'ar' ? 'أدخل مؤشرات هذا الشهر' : "Enter this month's KPIs"}
            </div>
            <div className='text-sm text-slate-600 mt-1.5'>
              {openPeriod ? (
                <>
                  {lang === 'ar' ? 'الفترة المفتوحة:' : 'Open period:'}{' '}
                  <span className='font-medium'>{openPeriod.label}</span>
                  {kpiCount > 0 && (
                    <span className='ms-2 text-slate-500'>
                      · {kpiCount} {lang === 'ar' ? 'مؤشر معيّن لك' : 'KPIs assigned to you'}
                    </span>
                  )}
                </>
              ) : (
                <span className='text-slate-400'>
                  {lang === 'ar' ? 'لا توجد فترة مفتوحة حالياً' : 'No open period right now'}
                </span>
              )}
            </div>
          </div>
          <div className='text-3xl text-mrkoon-accent'>→</div>
        </div>
      </Link>

      {/* Outcome cards: Bonus | OKRs | Appraisal */}
      <div className='grid md:grid-cols-3 gap-4'>

        {/* My Bonus */}
        <Card>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm font-medium text-mrkoon'>
              {lang === 'ar' ? 'مكافآتي' : 'My Bonus'}
            </div>
            <Link to='/bonus' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'التفاصيل ←' : 'Details →'}
            </Link>
          </div>
          {payouts.isLoading ? <Skeleton count={2} className='h-6' /> : (
            lastPayoutAmt != null ? (
              <>
                <div className='text-3xl font-semibold text-mrkoon-green'>{fmtMoney(lastPayoutAmt)}</div>
                <div className='text-xs text-slate-500 mt-1'>
                  {lang === 'ar' ? 'آخر دفعة معتمدة' : 'Most recent approved'} · {lastPayoutLabel || '—'}
                </div>
              </>
            ) : (
              <>
                <div className='text-2xl font-semibold text-slate-300'>—</div>
                <div className='text-xs text-slate-500 mt-1'>
                  {lang === 'ar'
                    ? 'لا توجد دفعات معتمدة بعد. العرض الحي للمكافأة المتوقعة قادم.'
                    : 'No approved payouts yet. Live projection view coming.'}
                </div>
              </>
            )
          )}
        </Card>

        {/* My OKRs */}
        <Card>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm font-medium text-mrkoon'>
              {lang === 'ar' ? 'أهدافي' : 'My OKRs'}
            </div>
            <Link to='/okrs' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'الكل ←' : 'View all →'}
            </Link>
          </div>
          {okrs.isLoading ? <Skeleton count={3} className='h-6' /> : (
            myObjs.length === 0 ? (
              <div className='text-sm text-slate-400'>
                {lang === 'ar' ? 'لا توجد أهداف مسندة' : 'No OKRs assigned'}
              </div>
            ) : (
              <>
                <div className='text-3xl font-semibold text-mrkoon'>{myObjs.length}</div>
                <div className='text-xs text-slate-500 mt-1'>
                  {lang === 'ar' ? 'هدف نشط (شخصي + قسم)' : 'active objectives (mine + dept)'}
                </div>
                <div className='mt-3 space-y-1 text-xs'>
                  {myObjs.slice(0, 3).map(o => (
                    <Link key={o.id} to='/okrs' className='block hover:text-mrkoon-accent truncate'>
                      <span className='font-mono text-slate-400 me-1.5'>{o.code}</span>
                      {lang === 'ar' ? o.title_ar : o.title_en}
                    </Link>
                  ))}
                </div>
              </>
            )
          )}
        </Card>

        {/* My Appraisal */}
        <Card>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm font-medium text-mrkoon'>
              {lang === 'ar' ? 'تقييمي' : 'My Appraisal'}
            </div>
            <Link to='/appraisals' className='text-xs text-mrkoon-accent hover:underline'>
              {lang === 'ar' ? 'الكل ←' : 'View all →'}
            </Link>
          </div>
          {appraisal.isLoading ? <Skeleton count={2} className='h-6' /> : (
            appraisal.data ? (
              <>
                <div className='text-2xl font-semibold text-mrkoon'>
                  {appraisal.data.overall_rating != null ? `${appraisal.data.overall_rating}/5` : '—'}
                </div>
                <div className='text-xs text-slate-500 mt-1'>
                  {appraisal.data.period?.label || ''} · {appraisal.data.status}
                </div>
                <Link
                  to={`/appraisals/${appraisal.data.id}`}
                  className='inline-block mt-3 text-xs text-mrkoon-accent hover:underline'
                >
                  {lang === 'ar' ? 'فتح التقييم ←' : 'Open appraisal →'}
                </Link>
              </>
            ) : (
              <div className='text-sm text-slate-400'>
                {lang === 'ar' ? 'لا يوجد تقييم نشط' : 'No active appraisal'}
              </div>
            )
          )}
        </Card>
      </div>
    </div>
  );
}
