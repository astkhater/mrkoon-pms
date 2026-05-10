// "What needs my attention" — pending action counts per role.
// Each query returns 0 if RLS denies access, so it's safe to call all of them.
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase.js';

// Appraisals where I'm the next reviewer
function useAppraisalsPending(profile, role) {
  return useQuery({
    enabled: !!profile?.id,
    queryKey: ['pending.appraisals', profile?.id, role],
    queryFn: async () => {
      // employee with status='draft' → I need to submit self-assessment
      const mySelfQ = supabase
        .schema('track').from('appraisals')
        .select('id', { count: 'exact', head: true })
        .eq('employee_id', profile.id)
        .eq('status', 'draft');
      // manager: my reports' submitted appraisals
      const mgrPendingQ = supabase
        .schema('track').from('appraisals')
        .select('id, employee:users!inner(manager_id)', { count: 'exact', head: true })
        .eq('status', 'submitted')
        .eq('employee.manager_id', profile.id);
      const [mine, mgr] = await Promise.all([mySelfQ, mgrPendingQ]);
      return {
        my_self_assessment_due: mine.count ?? 0,
        manager_review_pending: mgr.count ?? 0,
      };
    },
  });
}

function useKRsPending(profile, role) {
  return useQuery({
    enabled: !!profile?.id,
    queryKey: ['pending.krs', profile?.id, role],
    queryFn: async () => {
      // KRs in 'open' status owned by me (or my dept) — need approval
      const { data, error } = await supabase
        .schema('def').from('key_results')
        .select('id, status, objective:objectives(owner_user_id, level, department_id)')
        .eq('status', 'open');
      if (error) return { open: 0 };
      const mine = (data ?? []).filter(kr =>
        kr.objective?.owner_user_id === profile.id ||
        (kr.objective?.level === 'department' && kr.objective?.department_id === profile.department_id)
      );
      return { open: mine.length };
    },
  });
}

function usePayoutsPending(profile, role, hasFinance) {
  return useQuery({
    enabled: !!profile?.id && hasFinance,
    queryKey: ['pending.payouts', profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .schema('track').from('commission_payouts')
        .select('id', { count: 'exact', head: true })
        .in('status', ['draft','pending_approval']);
      return { pending: count ?? 0 };
    },
  });
}

function useNotificationCount(profile) {
  return useQuery({
    enabled: !!profile?.id,
    queryKey: ['pending.notifs', profile?.id],
    refetchInterval: 30000,
    queryFn: async () => {
      const { count } = await supabase
        .schema('track').from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', profile.id)
        .is('read_at', null)
        .is('dismissed_at', null);
      return { unread: count ?? 0 };
    },
  });
}

export function useAttentionItems(profile, role, permissions = []) {
  const hasFinance = role === 'finance' || permissions.includes('finance');
  const apprs = useAppraisalsPending(profile, role);
  const krs = useKRsPending(profile, role);
  const payouts = usePayoutsPending(profile, role, hasFinance);
  const notifs = useNotificationCount(profile);

  const items = [];
  if (apprs.data?.my_self_assessment_due > 0) {
    items.push({ id: 'self_assess', kind: 'appraisal', count: apprs.data.my_self_assessment_due, label_en: 'Submit your self-assessment', label_ar: 'إرسال تقييمك الذاتي', link: '/appraisals' });
  }
  if (apprs.data?.manager_review_pending > 0) {
    items.push({ id: 'mgr_review', kind: 'appraisal', count: apprs.data.manager_review_pending, label_en: 'Appraisals awaiting your review', label_ar: 'تقييمات بانتظار مراجعتك', link: '/appraisals' });
  }
  if (krs.data?.open > 0 && (role === 'manager' || role === 'dept_head' || role === 'admin' || role === 'c_level')) {
    items.push({ id: 'kr_open', kind: 'okr', count: krs.data.open, label_en: 'KRs awaiting approval', label_ar: 'نتائج رئيسية بانتظار الاعتماد', link: '/okrs' });
  }
  if (payouts.data?.pending > 0) {
    items.push({ id: 'payouts', kind: 'payout', count: payouts.data.pending, label_en: 'Payouts awaiting approval', label_ar: 'دفعات بانتظار الاعتماد', link: '/bonus' });
  }
  if (notifs.data?.unread > 0) {
    items.push({ id: 'notifs', kind: 'notif', count: notifs.data.unread, label_en: 'Unread notifications', label_ar: 'إشعارات غير مقروءة', link: '/notifications' });
  }

  const isLoading = apprs.isLoading || krs.isLoading || payouts.isLoading || notifs.isLoading;
  return { items, isLoading };
}
