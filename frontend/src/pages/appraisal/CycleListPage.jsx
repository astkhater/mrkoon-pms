import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function useCycles() {
  return useQuery({
    queryKey: ['appraisal_cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('appraisal_cycles')
        .select('id, type, status, deadline, period_id, period:cycle_periods(label, type, start_date, end_date)')
        .order('deadline', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useMyAppraisals(employeeId) {
  return useQuery({
    enabled: !!employeeId,
    queryKey: ['my.appraisals', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('appraisals')
        .select('id, cycle_id, status, self_score, manager_score, final_rating, cycle:appraisal_cycles(type, period:cycle_periods(label))')
        .eq('employee_id', employeeId)
        .order('id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useCyclePeriods() {
  return useQuery({
    queryKey: ['config.cycle_periods.all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('config')
        .from('cycle_periods')
        .select('id, type, label, start_date, end_date, status')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

const statusTone = {
  open: 'bg-emerald-100 text-emerald-700',
  locked: 'bg-mrkoon/10 text-mrkoon',
  closed: 'bg-slate-100 text-slate-600',
  archived: 'bg-slate-50 text-slate-400',
};
const apprTone = {
  draft: 'bg-amber-100 text-amber-700',
  submitted: 'bg-blue-100 text-blue-700',
  manager_reviewed: 'bg-indigo-100 text-indigo-700',
  calibrated: 'bg-purple-100 text-purple-700',
  hr_signoff: 'bg-mrkoon-green-tint text-mrkoon-green',
  closed: 'bg-slate-100 text-slate-600',
  incomplete: 'bg-rose-100 text-rose-700',
};

export default function CycleListPage() {
  const { t, lang } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const qc = useQueryClient();
  const cycles = useCycles();
  const mine = useMyAppraisals(profile?.id);
  const periods = useCyclePeriods();
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ type: 'quarterly', period_id: '', deadline: '' });

  const canManageCycles = hasAccess(['admin','hr']);

  async function createCycle() {
    if (!draft.period_id) { alert('Period required'); return; }
    const payload = {
      type: draft.type,
      period_id: draft.period_id,
      deadline: draft.deadline || null,
      status: 'open',
    };
    const { error } = await supabase.schema('track').from('appraisal_cycles').insert(payload);
    if (error) { alert('Create error: ' + error.message); return; }
    setShowAdd(false);
    setDraft({ type: 'quarterly', period_id: '', deadline: '' });
    qc.invalidateQueries({ queryKey: ['appraisal_cycles'] });
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>{t('appraisal.title')}</h1>
        {canManageCycles && (
          <button onClick={() => setShowAdd(s => !s)} className='text-sm bg-mrkoon-accent text-white px-3 py-1.5 rounded hover:opacity-90'>
            + {t('hr.open_new_cycle')}
          </button>
        )}
      </div>

      {showAdd && (
        <div className='bg-mrkoon-green-tint border rounded-lg p-3 space-y-2'>
          <div className='font-medium text-sm'>{t('hr.open_new_cycle')}</div>
          <div className='grid md:grid-cols-3 gap-2 text-sm'>
            <div>
              <label className='block text-xs text-slate-500'>{lang === 'ar' ? 'النوع' : 'Type'}</label>
              <select value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })} className='w-full border rounded px-2 py-1'>
                <option value='monthly'>{t('appraisal.monthly')}</option>
                <option value='quarterly'>{t('appraisal.quarterly')}</option>
                <option value='annual'>{t('appraisal.annual')}</option>
              </select>
            </div>
            <div>
              <label className='block text-xs text-slate-500'>{t('common.period')}</label>
              <select value={draft.period_id} onChange={e => setDraft({ ...draft, period_id: e.target.value })} className='w-full border rounded px-2 py-1'>
                <option value=''>—</option>
                {(periods.data ?? []).filter(p => p.type === draft.type).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs text-slate-500'>{lang === 'ar' ? 'الموعد النهائي' : 'Deadline'}</label>
              <input type='date' value={draft.deadline} onChange={e => setDraft({ ...draft, deadline: e.target.value })} className='w-full border rounded px-2 py-1' />
            </div>
          </div>
          <div className='flex gap-2 justify-end'>
            <button onClick={() => setShowAdd(false)} className='text-sm border px-3 py-1.5 rounded'>{t('common.cancel')}</button>
            <button onClick={createCycle} className='text-sm bg-mrkoon text-white px-3 py-1.5 rounded'>{t('common.save')}</button>
          </div>
        </div>
      )}

      <Card title={lang === 'ar' ? 'تقييماتي' : 'My appraisals'}>
        {mine.isLoading ? <Skeleton count={3} className='h-10' /> : (
          mine.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('empty.no_appraisals')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>{t('common.period')}</th><th className='text-start'>{lang === 'ar' ? 'النوع' : 'Type'}</th><th className='text-start'>{t('common.status')}</th><th className='text-end'>Self</th><th className='text-end'>Mgr</th><th className='text-end'>Final</th><th /></tr>
              </thead>
              <tbody>
                {mine.data?.map(a => (
                  <tr key={a.id} className='border-b last:border-0'>
                    <td className='py-1.5'>{a.cycle?.period?.label ?? '—'}</td>
                    <td className='font-mono text-xs'>{a.cycle?.type}</td>
                    <td><span className={`text-xs px-1.5 py-0.5 rounded ${apprTone[a.status] || apprTone.draft}`}>{a.status}</span></td>
                    <td className='text-end'>{a.self_score ?? '—'}</td>
                    <td className='text-end'>{a.manager_score ?? '—'}</td>
                    <td className='text-end'>{a.final_rating ?? '—'}</td>
                    <td className='text-end'><Link to={`/appraisals/${a.id}`} className='text-xs text-mrkoon hover:underline'>{lang === 'ar' ? 'فتح' : 'open'} →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      <Card title={t('hr.cycles')}>
        {cycles.isLoading ? <Skeleton count={3} className='h-10' /> : (
          cycles.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>{t('common.period')}</th><th className='text-start'>{lang === 'ar' ? 'النوع' : 'Type'}</th><th className='text-start'>{t('common.status')}</th><th className='text-start'>{lang === 'ar' ? 'الموعد النهائي' : 'Deadline'}</th><th /></tr>
              </thead>
              <tbody>
                {cycles.data?.map(c => (
                  <tr key={c.id} className='border-b last:border-0'>
                    <td className='py-1.5'>{c.period?.label ?? '—'}</td>
                    <td className='font-mono text-xs'>{c.type}</td>
                    <td><span className={`text-xs px-1.5 py-0.5 rounded ${statusTone[c.status] || statusTone.open}`}>{c.status}</span></td>
                    <td className='text-xs text-slate-500'>{c.deadline ?? '—'}</td>
                    <td className='text-end'>
                      {canManageCycles && c.status === 'open' && (
                        <button
                          onClick={async () => {
                            if (!confirm(`Generate appraisal records for all active employees in cycle "${c.period?.label}"?`)) return;
                            const { data, error } = await supabase.schema('track').rpc('fn_generate_appraisals_for_cycle', { p_cycle_id: c.id });
                            if (error) { alert('Error: ' + error.message); return; }
                            alert(`Generated ${data ?? 0} appraisals.`);
                            qc.invalidateQueries({ queryKey: ['my.appraisals'] });
                          }}
                          className='text-xs text-mrkoon hover:underline'
                        >
                          generate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>
    </div>
  );
}
