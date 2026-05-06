import React, { useState } from 'react';
import KRRow from './KRRow.jsx';
import Badge from '../ui/Badge.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

const levelTone = { company: 'blue', department: 'amber', individual: 'gray' };
const levelLabelKey = { company: 'okr.company', department: 'okr.department', individual: 'okr.individual' };

export default function ObjectiveCard({ obj, departments }) {
  const { lang, t } = useTranslation();
  const [open, setOpen] = useState(true);
  const title = lang === 'ar' ? (obj.title_ar || obj.title_en) : obj.title_en;
  const dept = departments?.find((d) => d.id === obj.department_id);
  const krs = obj.key_results || [];
  return (
    <section className='bg-white border rounded-lg mb-3'>
      <header
        className='flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50'
        onClick={() => setOpen((o) => !o)}
      >
        <Badge tone={levelTone[obj.level] || 'gray'}>{t(levelLabelKey[obj.level] || 'okr.individual')}</Badge>
        <span className='font-mono text-xs text-slate-500'>{obj.code}</span>
        <span className='flex-1 font-medium'>{title}</span>
        {dept && <span className='text-xs text-slate-500'>{lang === 'ar' ? dept.name_ar : dept.name_en}</span>}
        <span className='text-xs text-slate-400'>{krs.length} KRs</span>
      </header>
      {open && krs.length > 0 && (
        <div className='px-3 pb-3'>
          {krs.map((kr) => <KRRow key={kr.id} kr={kr} />)}
        </div>
      )}
    </section>
  );
}
