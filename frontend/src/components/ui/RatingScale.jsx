import React from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';

// Label-anchored rating scale per design decision D-19
const labels = [
  { value: 1, key: 'rating.unsatisfactory' },
  { value: 2, key: 'rating.needs_improvement' },
  { value: 3, key: 'rating.meets' },
  { value: 4, key: 'rating.exceeds' },
  { value: 5, key: 'rating.exceptional' },
];

export default function RatingScale({ value, onChange, name, disabled }) {
  const { t } = useTranslation();
  return (
    <div className='flex flex-wrap gap-2'>
      {labels.map((l) => (
        <label key={l.value} className={`flex items-center gap-1.5 px-2 py-1 border rounded cursor-pointer ${value === l.value ? 'bg-mrkoon text-white border-mrkoon' : 'border-slate-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <input
            type='radio'
            name={name}
            value={l.value}
            checked={value === l.value}
            onChange={() => !disabled && onChange?.(l.value)}
            disabled={disabled}
            className='sr-only'
          />
          <span className='text-xs'>{l.value}</span>
          <span className='text-xs'>{t(l.key)}</span>
        </label>
      ))}
    </div>
  );
}
