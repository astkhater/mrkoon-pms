import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase.js';

function usePIPs(filter) {
  return useQuery({
    queryKey: ['pips', filter],
    queryFn: async () => {
      let q = supabase.schema('track').from('pips')
        .select('id, employee_id, opened_at, target_close_date, status, plan_text, outcome_text, closed_at, employee:users(full_name_en, full_name_ar, role_code, department:departments(code)), opened_from:opened_from_appraisal_id(id)')
        .order('opened_at', { ascending: false });
      if (filter === 'active') q = q.eq('status', 'active');
      if (filter === 'closed') q = q.in('status', ['closed_success','closed_fail','cancelled']);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

const statusTone = {
  active: 'bg-amber-100 text-amber-700',
  closed_success: 'bg-mrkoon-green-tint text-mrkoon-green',
  closed_fail: 'bg-rose-100 text-rose-700',
  escalated: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function PIPsPage() {
  const { lang, t } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('active');
  const pips = usePIPs(filter);
  const canManage = hasAccess(['hr','admin','manager','dept_head']);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  async function closePIP(p, outcome) {
    if (!confirm(`Close PIP for ${p.employee?.full_name_en}?`)) return;
    const { error } = await supabase.schema('track').from('pips').update({
      status: outcome,
      outcome_text: draft.outcome_text ?? p.outcome_text,
      closed_at: new Date().toISOString(),
      closed_by: profile.id,
    }).eq('id', p.id);
    if (error) { alert('Error: ' + error.message); return; }
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ['pips'] });
  }
  async function savePlan(p) {
    const { error } = await supabase.schema('track').from('pips').update({
      plan_text: draft.plan_text,
      target_close_date: draft.target_close_date || null,
    }).eq('id', p.id);
    if (error) { alert('Error: ' + error.message); return; }
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ['pips'] });
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{lang === 'ar' ? 'خطط تحسين الأداء' : 'Performance Improvement Plans'}</h1>
        <div className='flex gap-2'>
          {['active','closed','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-sm px-3 py-1.5 rounded ${filter === f ? 'bg-mrkoon text-white' : 'bg-white border'}`}>
              {f === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : f === 'closed' ? (lang === 'ar' ? 'مغلق' : 'Closed') : (lang === 'ar' ? 'الكل' : 'All')}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {pips.isLoading ? <Skeleton count={3} className='h-16' /> : (
          (pips.data ?? []).length === 0 ? (
            <div className='text-sm text-slate-500 py-8 text-center'>
              {filter === 'active' ? (lang === 'ar' ? 'لا توجد خطط نشطة. الفريق على المسار.' : 'No active PIPs. Team on track.') : t('common.no_data')}
            </div>
          ) : (
            <ul className='divide-y'>
              {pips.data.map(p => {
                const isEditing = editingId === p.id;
                return (
                  <li key={p.id} className='py-3'>
                    <div className='flex items-baseline justify-between mb-2'>
                      <div>
                        <div className='font-medium'>{lang === 'ar' ? (p.employee?.full_name_ar || p.employee?.full_name_en) : p.employee?.full_name_en}</div>
                        <div className='text-xs text-slate-500'>
                          {p.employee?.department?.code} · {p.employee?.role_code}
                          {' · '}{lang === 'ar' ? 'فُتح:' : 'opened:'} {new Date(p.opened_at).toLocaleDateString()}
                          {p.target_close_date && (<>{' · '}{lang === 'ar' ? 'يستهدف:' : 'target close:'} {p.target_close_date}</>)}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusTone[p.status] || ''}`}>{p.status}</span>
                    </div>
                    {isEditing ? (
                      <div className='space-y-2 text-sm'>
                        <textarea
                          defaultValue={p.plan_text ?? ''}
                          onChange={e => setDraft(d => ({ ...d, plan_text: e.target.value }))}
                          className='w-full border rounded p-2'
                          rows={3}
                          placeholder={lang === 'ar' ? 'الخطة...' : 'Plan...'}
                        />
                        <div className='flex items-center gap-2'>
                          <label className='text-xs text-slate-500'>{lang === 'ar' ? 'تاريخ الإغلاق المستهدف' : 'Target close date'}</label>
                          <input type='date' defaultValue={p.target_close_date ?? ''} onChange={e => setDraft(d => ({ ...d, target_close_date: e.target.value }))} className='border rounded px-2 py-1' />
                        </div>
                        {p.status === 'active' && (
                          <textarea
                            defaultValue={p.outcome_text ?? ''}
                            onChange={e => setDraft(d => ({ ...d, outcome_text: e.target.value }))}
                            className='w-full border rounded p-2'
                            rows={2}
                            placeholder={lang === 'ar' ? 'النتيجة (مطلوبة عند الإغلاق)...' : 'Outcome (required to close)...'}
                          />
                        )}
                        <div className='flex gap-2 justify-end'>
                          <button onClick={() => setEditingId(null)} className='text-sm border px-3 py-1 rounded'>{t('common.cancel')}</button>
                          <button onClick={() => savePlan(p)} className='text-sm bg-mrkoon text-white px-3 py-1 rounded'>{t('common.save')}</button>
                          {p.status === 'active' && (
                            <>
                              <button onClick={() => closePIP(p, 'closed_success')} className='text-sm bg-mrkoon-green text-white px-3 py-1 rounded'>{lang === 'ar' ? 'إغلاق ناجح' : 'Close — success'}</button>
                              <button onClick={() => closePIP(p, 'closed_fail')} className='text-sm bg-rose-600 text-white px-3 py-1 rounded'>{lang === 'ar' ? 'إغلاق فشل' : 'Close — fail'}</button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className='text-sm'>
                        <div className='text-slate-700 whitespace-pre-wrap'>{p.plan_text ?? '—'}</div>
                        {p.outcome_text && (
                          <div className='mt-2 text-xs text-slate-500'>
                            <span className='font-medium'>{lang === 'ar' ? 'النتيجة:' : 'Outcome:'}</span> {p.outcome_text}
                          </div>
                        )}
                        {canManage && (
                          <button onClick={() => { setEditingId(p.id); setDraft({ plan_text: p.plan_text, target_close_date: p.target_close_date, outcome_text: p.outcome_text }); }} className='text-xs text-mrkoon hover:underline mt-2'>
                            {lang === 'ar' ? 'تعديل' : 'edit'}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )
        )}
      </Card>
    </div>
  );
}
