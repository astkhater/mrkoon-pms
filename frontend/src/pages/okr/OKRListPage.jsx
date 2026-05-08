import React, { useState } from 'react';
import OKRTree from '../../components/okr/OKRTree.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDepartments, useCyclePeriods } from '../../hooks/useOKRs.js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

export default function OKRListPage() {
  const { t, lang } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    code: '', level: 'company', title_en: '', title_ar: '',
    department_id: null, period_id: null,
  });
  const { data: depts } = useDepartments();
  const { data: periods } = useCyclePeriods();

  const canCreate = hasAccess(['admin','c_level','dept_head']);

  async function create() {
    if (!draft.code || !draft.title_en) {
      alert(lang === 'ar' ? 'الكود والعنوان مطلوبان' : 'Code and title (EN) required');
      return;
    }
    const payload = {
      code: draft.code,
      level: draft.level,
      title_en: draft.title_en,
      title_ar: draft.title_ar || draft.title_en,
      department_id: draft.level === 'company' ? null : draft.department_id,
      period_id: draft.period_id,
      owner_user_id: profile.id,
    };
    const { error } = await supabase.schema('def').from('objectives').insert(payload);
    if (error) { alert('Create error: ' + error.message); return; }
    setShowAdd(false);
    setDraft({ code: '', level: 'company', title_en: '', title_ar: '', department_id: null, period_id: null });
    qc.invalidateQueries({ queryKey: ['def.objectives'] });
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>{t('okr.title')}</h1>
        {canCreate && (
          <button onClick={() => setShowAdd(s => !s)} className='text-sm bg-mrkoon text-white px-3 py-1.5 rounded hover:bg-mrkoon-dark'>
            + {t('okr.set_okrs')}
          </button>
        )}
      </div>

      {showAdd && (
        <div className='bg-amber-50 border rounded-lg p-3 space-y-2'>
          <div className='font-medium text-sm'>{lang === 'ar' ? 'هدف جديد' : 'New objective'}</div>
          <div className='grid md:grid-cols-2 gap-2 text-sm'>
            <div>
              <label className='block text-xs text-slate-500'>Code</label>
              <input value={draft.code} onChange={e => setDraft({ ...draft, code: e.target.value })} placeholder='e.g. CO7 or D-OPS-1' className='w-full border rounded px-2 py-1' />
            </div>
            <div>
              <label className='block text-xs text-slate-500'>{lang === 'ar' ? 'المستوى' : 'Level'}</label>
              <select value={draft.level} onChange={e => setDraft({ ...draft, level: e.target.value })} className='w-full border rounded px-2 py-1'>
                <option value='company'>{t('okr.company')}</option>
                <option value='department'>{t('okr.department')}</option>
                <option value='individual'>{t('okr.individual')}</option>
              </select>
            </div>
            <div>
              <label className='block text-xs text-slate-500'>{t('common.period')}</label>
              <select value={draft.period_id ?? ''} onChange={e => setDraft({ ...draft, period_id: e.target.value || null })} className='w-full border rounded px-2 py-1'>
                <option value=''>—</option>
                {(periods ?? []).map(p => <option key={p.id} value={p.id}>{p.label} · {p.type}</option>)}
              </select>
            </div>
            {draft.level !== 'company' && (
              <div>
                <label className='block text-xs text-slate-500'>{t('okr.department')}</label>
                <select value={draft.department_id ?? ''} onChange={e => setDraft({ ...draft, department_id: e.target.value || null })} className='w-full border rounded px-2 py-1'>
                  <option value=''>—</option>
                  {(depts ?? []).map(d => <option key={d.id} value={d.id}>{d.code} — {lang === 'ar' ? d.name_ar : d.name_en}</option>)}
                </select>
              </div>
            )}
            <div className='md:col-span-2'>
              <label className='block text-xs text-slate-500'>Title (EN)</label>
              <input value={draft.title_en} onChange={e => setDraft({ ...draft, title_en: e.target.value })} className='w-full border rounded px-2 py-1' />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-xs text-slate-500'>العنوان (AR)</label>
              <input value={draft.title_ar} onChange={e => setDraft({ ...draft, title_ar: e.target.value })} className='w-full border rounded px-2 py-1' dir='rtl' />
            </div>
          </div>
          <div className='flex gap-2 justify-end'>
            <button onClick={() => setShowAdd(false)} className='text-sm border px-3 py-1.5 rounded'>{t('common.cancel')}</button>
            <button onClick={create} className='text-sm bg-mrkoon text-white px-3 py-1.5 rounded'>{t('common.save')}</button>
          </div>
        </div>
      )}

      <OKRTree />
    </div>
  );
}
