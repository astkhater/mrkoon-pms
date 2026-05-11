import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';
import { downloadCSV } from '../../utils/csv.js';

// Available cycles where this user has reports in calibration / pending HR sign-off
function useCycles() {
  return useQuery({
    queryKey: ['calibration.cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track').from('appraisal_cycles')
        .select('id, type, status, period:cycle_periods(label, type, start_date)')
        .order('id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Appraisals in the chosen cycle, scoped to dept heads / HR / admin scope
function useCycleAppraisals(cycleId, profile, isDeptHead, isHR, isAdmin) {
  return useQuery({
    enabled: !!cycleId && !!profile?.id,
    queryKey: ['calibration.appraisals', cycleId, profile?.id],
    queryFn: async () => {
      let q = supabase
        .schema('track').from('appraisals')
        .select(`id, employee_id, status, self_score, manager_score, dept_head_score, goals_score, final_rating,
                 employee:users(full_name_en, full_name_ar, department_id, role_code, manager:manager_id(full_name_en))`)
        .eq('cycle_id', cycleId);
      const { data, error } = await q;
      if (error) throw error;
      let rows = data ?? [];
      // Scope: HR/admin see all; dept head sees only their dept
      if (!(isHR || isAdmin) && isDeptHead && profile?.department_id) {
        rows = rows.filter(r => r.employee?.department_id === profile.department_id);
      }
      return rows;
    },
  });
}

function useRatingBands() {
  return useQuery({
    queryKey: ['config.rating_bands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('config').from('rating_bands')
        .select('id, min_score, max_score, label_en, label_ar, ord, triggers_pip')
        .order('ord');
      if (error) throw error;
      return data ?? [];
    },
  });
}

function bandFor(score, bands) {
  if (score == null || !bands) return null;
  for (const b of bands) {
    if (score >= b.min_score && score <= b.max_score) return b;
  }
  return null;
}

const apprTone = {
  draft: 'bg-amber-100 text-amber-700',
  submitted: 'bg-blue-100 text-blue-700',
  manager_reviewed: 'bg-indigo-100 text-indigo-700',
  calibrated: 'bg-purple-100 text-purple-700',
  hr_signoff: 'bg-mrkoon-green-tint text-mrkoon-green',
  closed: 'bg-slate-100 text-slate-600',
};

export default function CalibrationPage() {
  const { profile, hasAccess } = useAuth();
  const { lang, t } = useTranslation();
  const isHR = hasAccess(['hr']);
  const isAdmin = hasAccess(['admin']);
  const isDeptHead = hasAccess(['dept_head']);

  const cycles = useCycles();
  const bands = useRatingBands();
  const [cycleId, setCycleId] = useState(null);
  const apprs = useCycleAppraisals(cycleId, profile, isDeptHead, isHR, isAdmin);

  // Rating distribution (use final_rating if set, else manager_score as proxy)
  const distribution = useMemo(() => {
    if (!apprs.data || !bands.data) return [];
    const counts = {};
    bands.data.forEach(b => { counts[b.id] = { band: b, count: 0 }; });
    counts.__unscored = { band: { label_en: 'Unscored', label_ar: 'بدون درجة', triggers_pip: false }, count: 0 };
    apprs.data.forEach(a => {
      const score = a.final_rating ?? a.manager_score;
      const b = bandFor(score, bands.data);
      if (b) counts[b.id].count += 1;
      else counts.__unscored.count += 1;
    });
    return Object.values(counts);
  }, [apprs.data, bands.data]);

  const total = (apprs.data ?? []).length;
  const exceedsCount = distribution.reduce((s, x) => s + (x.band.ord >= 4 ? x.count : 0), 0);
  const exceedsPct = total ? (exceedsCount / total) : 0;
  const topHeavy = exceedsPct > 0.30; // >30% in exceeds/exceptional = warning

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{t('appraisal.calibration')}</h1>
        <Link to='/appraisals' className='text-sm text-mrkoon hover:underline'>← {t('appraisal.title')}</Link>
      </div>

      <Card>
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <label className='text-xs text-slate-500'>{t('common.period')}</label>
          <select value={cycleId ?? ''} onChange={e => setCycleId(e.target.value || null)} className='border rounded px-2 py-1'>
            <option value=''>—</option>
            {(cycles.data ?? []).map(c => (
              <option key={c.id} value={c.id}>{c.period?.label ?? '?'} · {c.type} · {c.status}</option>
            ))}
          </select>
          {total > 0 && (
            <span className='text-xs text-slate-500 ms-auto'>{total} {lang === 'ar' ? 'تقييم' : 'appraisals'}</span>
          )}
          {total > 0 && (
            <button
              onClick={() => downloadCSV(`mrkoon-calibration-${new Date().toISOString().slice(0,10)}.csv`, apprs.data, [
                { key: 'employee', label: 'employee', value: a => a.employee?.full_name_en },
                { key: 'manager', label: 'manager', value: a => a.employee?.manager?.full_name_en },
                { key: 'status', label: 'status' },
                { key: 'self_score', label: 'self_score' },
                { key: 'manager_score', label: 'manager_score' },
                { key: 'dept_head_score', label: 'dept_head_score' },
                { key: 'goals_score', label: 'goals_score' },
                { key: 'final_rating', label: 'final_rating' },
              ])}
              className='text-xs text-mrkoon hover:underline'
            >Export CSV</button>
          )}
        </div>
      </Card>

      {!cycleId ? (
        <Card>
          <div className='text-sm text-slate-500'>{lang === 'ar' ? 'اختر دورة لعرض المعايرة' : 'Pick a cycle to view calibration.'}</div>
        </Card>
      ) : apprs.isLoading || bands.isLoading ? (
        <Skeleton count={5} className='h-10' />
      ) : (
        <>
          <Card title={lang === 'ar' ? 'توزيع التقييمات' : 'Rating distribution'}>
            {total === 0 ? (
              <div className='text-sm text-slate-500'>{t('empty.no_appraisals')}</div>
            ) : (
              <>
                <div className='space-y-2'>
                  {distribution.map((d, i) => {
                    const pct = total ? Math.round((d.count / total) * 100) : 0;
                    return (
                      <div key={i} className='flex items-center text-sm gap-2'>
                        <div className='w-40 truncate'>
                          {lang === 'ar' ? d.band.label_ar : d.band.label_en}
                          {d.band.triggers_pip && <span className='text-rose-600 ms-1 text-xs'>·PIP</span>}
                        </div>
                        <div className='flex-1 h-3 bg-slate-100 rounded'>
                          <div className={`h-3 rounded ${d.band.ord >= 4 ? 'bg-emerald-500' : d.band.ord >= 3 ? 'bg-mrkoon' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className='w-12 text-end text-xs text-slate-500'>{d.count} · {pct}%</div>
                      </div>
                    );
                  })}
                </div>
                {topHeavy && (
                  <div className='mt-3 p-2 rounded border border-amber-400 bg-amber-50'>
                    <Badge tone='amber'>{t('appraisal.distribution_skews_high')}</Badge>
                  </div>
                )}
              </>
            )}
          </Card>

          <Card title={lang === 'ar' ? 'التقييمات في الدورة' : 'Appraisals in this cycle'}>
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr>
                  <th className='text-start py-1'>{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'المدير' : 'Manager'}</th>
                  <th className='text-start'>{t('common.status')}</th>
                  <th className='text-end'>Self</th>
                  <th className='text-end'>Mgr</th>
                  <th className='text-end'>Dept</th>
                  <th className='text-end'>Final</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(apprs.data ?? []).map(a => (
                  <tr key={a.id} className='border-b last:border-0'>
                    <td className='py-1.5'>{lang === 'ar' ? (a.employee?.full_name_ar || a.employee?.full_name_en) : a.employee?.full_name_en}</td>
                    <td className='text-xs text-slate-500'>{a.employee?.manager?.full_name_en ?? '—'}</td>
                    <td><span className={`text-xs px-1.5 py-0.5 rounded ${apprTone[a.status] || apprTone.draft}`}>{a.status}</span></td>
                    <td className='text-end'>{a.self_score ?? '—'}</td>
                    <td className='text-end'>{a.manager_score ?? '—'}</td>
                    <td className='text-end'>{a.dept_head_score ?? '—'}</td>
                    <td className='text-end font-semibold'>{a.final_rating ?? '—'}</td>
                    <td className='text-end'><Link to={`/appraisals/${a.id}`} className='text-xs text-mrkoon hover:underline'>open →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
