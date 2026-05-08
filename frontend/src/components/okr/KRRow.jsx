import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatNumber } from '../../utils/format.js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

const statusTone = {
  open:     'bg-slate-100 text-slate-600',
  locked:   'bg-emerald-100 text-emerald-700',
  closed:   'bg-mrkoon/10 text-mrkoon',
  archived: 'bg-slate-50  text-slate-400',
};

export default function KRRow({ kr, canEdit, canApprove, effectiveTarget, formulaRef }) {
  const { lang, t } = useTranslation();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    title_en: kr.title_en,
    title_ar: kr.title_ar,
    target_value: kr.target_value,
    unit: kr.unit,
    weight: kr.weight,
  });
  const title = lang === 'ar' ? (kr.title_ar || kr.title_en) : kr.title_en;
  const progress = null;

  async function save() {
    setSaving(true);
    const { error } = await supabase.schema('def').from('key_results').update(draft).eq('id', kr.id);
    setSaving(false);
    if (error) { alert('Save error: ' + error.message); return; }
    setEditing(false);
    qc.invalidateQueries({ queryKey: ['def.objectives'] });
  }
  async function setStatus(newStatus) {
    const patch = { status: newStatus };
    if (newStatus === 'locked') {
      patch.approved_by = profile?.id;
      patch.approved_at = new Date().toISOString();
    }
    const { error } = await supabase.schema('def').from('key_results').update(patch).eq('id', kr.id);
    if (error) { alert('Status error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['def.objectives'] });
  }
  async function remove() {
    if (!confirm(`Delete ${kr.code}?`)) return;
    const { error } = await supabase.schema('def').from('key_results').delete().eq('id', kr.id);
    if (error) { alert('Delete error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['def.objectives'] });
  }

  if (editing) {
    return (
      <div className='py-2 border-b last:border-b-0 text-sm space-y-2 bg-amber-50 px-2 rounded'>
        <div className='flex items-center gap-2'>
          <span className='font-mono text-xs text-slate-500 w-20'>{kr.code}</span>
          <input value={draft.title_en} onChange={e => setDraft({ ...draft, title_en: e.target.value })} placeholder='Title (EN)' className='flex-1 border rounded px-2 py-1 text-xs' />
          <input value={draft.title_ar ?? ''} onChange={e => setDraft({ ...draft, title_ar: e.target.value })} placeholder='Title (AR)' className='flex-1 border rounded px-2 py-1 text-xs' />
        </div>
        <div className='flex items-center gap-2'>
          <input type='number' value={draft.target_value ?? ''} onChange={e => setDraft({ ...draft, target_value: e.target.value === '' ? null : Number(e.target.value) })} placeholder='Target' className='w-28 border rounded px-2 py-1 text-xs' />
          <input value={draft.unit ?? ''} onChange={e => setDraft({ ...draft, unit: e.target.value })} placeholder='Unit' className='w-24 border rounded px-2 py-1 text-xs' />
          <input type='number' step='0.1' value={draft.weight ?? ''} onChange={e => setDraft({ ...draft, weight: e.target.value === '' ? null : Number(e.target.value) })} placeholder='Weight' className='w-20 border rounded px-2 py-1 text-xs' />
          <button onClick={save} disabled={saving} className='ms-auto text-xs bg-mrkoon text-white px-2 py-1 rounded'>{t('common.save')}</button>
          <button onClick={() => setEditing(false)} className='text-xs border px-2 py-1 rounded'>{t('common.cancel')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3 py-2 border-b last:border-b-0 text-sm'>
      <span className='font-mono text-xs text-slate-500 w-20'>{kr.code}</span>
      <span className='flex-1'>{title}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusTone[kr.status] || statusTone.open}`}>{kr.status || 'open'}</span>
      {(effectiveTarget != null || kr.target_value != null) && (
        <span className='text-xs w-28 text-end' title={formulaRef ? `Derived from assumption: ${formulaRef}` : 'Static target'}>
          <span className={formulaRef ? 'text-mrkoon-accent font-medium' : 'text-slate-500'}>
            {formatNumber(effectiveTarget ?? kr.target_value, lang)}
          </span>
          <span className='text-slate-400'> {kr.unit || ''}</span>
          {formulaRef && <span className='block text-[9px] text-mrkoon-accent leading-none'>↻ {formulaRef}</span>}
        </span>
      )}
      <span className='text-xs text-slate-500 w-16 text-end'>w {kr.weight ?? '—'}</span>
      <ProgressBar value={progress} />
      {canEdit && (
        <div className='flex items-center gap-1 w-44 justify-end'>
          {kr.status === 'open' && <button onClick={() => setEditing(true)} className='text-xs text-mrkoon hover:underline'>edit</button>}
          {canApprove && kr.status === 'open' && <button onClick={() => setStatus('locked')} className='text-xs text-emerald-600 hover:underline'>{t('common.approve')}</button>}
          {canApprove && kr.status === 'locked' && <button onClick={() => setStatus('open')} className='text-xs text-amber-600 hover:underline'>unlock</button>}
          {canEdit && kr.status === 'open' && <button onClick={remove} className='text-xs text-rose-600 hover:underline'>×</button>}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value }) {
  if (value == null) return <span className='w-32 text-xs text-slate-400 text-end'>—</span>;
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className='w-32 bg-slate-100 rounded h-2 overflow-hidden'>
      <div className='h-full bg-mrkoon' style={{ width: `${pct}%` }} />
    </div>
  );
}
