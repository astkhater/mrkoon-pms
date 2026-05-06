import React from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';
import { formatNumber } from '../../utils/format.js';

export default function KRRow({ kr }) {
  const { lang } = useTranslation();
  const title = lang === 'ar' ? (kr.title_ar || kr.title_en) : kr.title_en;
  const progress = null; // Wire to per-KR progress when KPI actuals exist
  return (
    <div className='flex items-center gap-3 py-2 border-b last:border-b-0 text-sm'>
      <span className='font-mono text-xs text-slate-500 w-20'>{kr.code}</span>
      <span className='flex-1'>{title}</span>
      {kr.target_value != null && (
        <span className='text-xs text-slate-500 w-28 text-end'>
          {formatNumber(kr.target_value, lang)} {kr.unit || ''}
        </span>
      )}
      <span className='text-xs text-slate-500 w-16 text-end'>w {kr.weight ?? '—'}</span>
      <ProgressBar value={progress} />
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
