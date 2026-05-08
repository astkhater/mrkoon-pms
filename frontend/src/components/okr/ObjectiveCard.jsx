import React, { useState } from 'react';
import KRRow from './KRRow.jsx';
import Badge from '../ui/Badge.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

const levelTone = { company: 'blue', department: 'amber', individual: 'gray' };
const levelLabelKey = { company: 'okr.company', department: 'okr.department', individual: 'okr.individual' };

export default function ObjectiveCard({ obj, departments, progress, krTargets }) {
  const { lang, t } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title_en: obj.title_en, title_ar: obj.title_ar });
  const title = lang === 'ar' ? (obj.title_ar || obj.title_en) : obj.title_en;
  const dept = departments?.find((d) => d.id === obj.department_id);
  const krs = obj.key_results || [];

  // Permissions: admin / c_level / dept head can edit. Manager-level can edit objectives they own.
  const canEditObj = hasAccess(['admin','c_level','dept_head']) ||
    (hasAccess(['manager']) && obj.owner_user_id === profile?.id);
  // Approve = lock the KR. Higher bar than edit.
  const canApprove = hasAccess(['admin','c_level','dept_head','hr']);

  async function saveObj() {
    const { error } = await supabase.schema('def').from('objectives').update(draft).eq('id', obj.id);
    if (error) { alert('Save error: ' + error.message); return; }
    setEditing(false);
    qc.invalidateQueries({ queryKey: ['def.objectives'] });
  }
  async function addKR() {
    const nextNum = (krs.length + 1);
    const code = `${obj.code}.KR${nextNum}`;
    const payload = {
      code, objective_id: obj.id,
      title_en: 'New key result',
      title_ar: 'نتيجة رئيسية جديدة',
      target_value: null, unit: null, weight: 1.0, status: 'open',
    };
    const { error } = await supabase.schema('def').from('key_results').insert(payload);
    if (error) { alert('Insert error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['def.objectives'] });
  }
  async function removeObj() {
    if (!confirm(`Delete ${obj.code} (${title}) and all ${krs.length} KRs?`)) return;
    const { error } = await supabase.schema('def').from('objectives').delete().eq('id', obj.id);
    if (error) { alert('Delete error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['def.objectives'] });
  }

  return (
    <section className='bg-white border rounded-lg mb-3'>
      <header
        className='flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50'
        onClick={(e) => { if (!editing) setOpen((o) => !o); }}
      >
        <Badge tone={levelTone[obj.level] || 'gray'}>{t(levelLabelKey[obj.level] || 'okr.individual')}</Badge>
        <span className='font-mono text-xs text-slate-500'>{obj.code}</span>
        {editing ? (
          <div className='flex-1 flex gap-2' onClick={(e) => e.stopPropagation()}>
            <input value={draft.title_en} onChange={e => setDraft({ ...draft, title_en: e.target.value })} className='flex-1 border rounded px-2 py-1 text-sm' placeholder='Title (EN)' />
            <input value={draft.title_ar ?? ''} onChange={e => setDraft({ ...draft, title_ar: e.target.value })} className='flex-1 border rounded px-2 py-1 text-sm' placeholder='Title (AR)' />
            <button onClick={saveObj} className='text-xs bg-mrkoon text-white px-3 py-1 rounded'>{t('common.save')}</button>
            <button onClick={() => setEditing(false)} className='text-xs border px-3 py-1 rounded'>{t('common.cancel')}</button>
          </div>
        ) : (
          <span className='flex-1 font-medium'>{title}</span>
        )}
        {dept && !editing && <span className='text-xs text-slate-500'>{lang === 'ar' ? dept.name_ar : dept.name_en}</span>}
        {!editing && progress != null && (
          <span className='flex items-center gap-1.5'>
            <span className='w-20 h-1.5 bg-slate-100 rounded overflow-hidden'>
              <span className='block h-full bg-mrkoon-accent' style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }} />
            </span>
            <span className='text-xs text-slate-500'>{Math.round(progress * 100)}%</span>
          </span>
        )}
        {!editing && <span className='text-xs text-slate-400'>{krs.length} KRs</span>}
        {canEditObj && !editing && (
          <div className='flex gap-1' onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditing(true)} className='text-xs text-mrkoon hover:underline'>edit</button>
            <button onClick={removeObj} className='text-xs text-rose-600 hover:underline'>×</button>
          </div>
        )}
      </header>
      {open && (
        <div className='px-3 pb-3'>
          {krs.length === 0 ? (
            <div className='text-xs text-slate-500 py-2'>{lang === 'ar' ? 'لا توجد نتائج رئيسية بعد' : 'No key results yet'}</div>
          ) : (
            krs.map((kr) => <KRRow key={kr.id} kr={kr} canEdit={canEditObj} canApprove={canApprove} effectiveTarget={krTargets?.[kr.id]?.effective_target} formulaRef={krTargets?.[kr.id]?.formula_ref} />)
          )}
          {canEditObj && (
            <button onClick={addKR} className='mt-2 text-xs text-mrkoon hover:underline'>+ {t('okr.add_kr')}</button>
          )}
        </div>
      )}
    </section>
  );
}
