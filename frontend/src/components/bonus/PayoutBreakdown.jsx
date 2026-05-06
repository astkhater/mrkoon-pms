import React from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';
import { formatCurrency } from '../../utils/format.js';

// Step-by-step payout breakdown — design decision D-24 (transparency, irreversible)
export default function PayoutBreakdown({ steps = [], total }) {
  const { t, lang } = useTranslation();
  return (
    <div className='border rounded-lg p-4 bg-white'>
      <h3 className='font-semibold mb-3'>{t('bonus.breakdown')}</h3>
      <ol className='space-y-2 text-sm'>
        {steps.map((s, i) => (
          <li key={i} className='border-b pb-2'>
            <div className='flex justify-between'>
              <div>
                <div className='font-medium'>Step {s.step_no}: {s.step_label}</div>
                {s.formula && <div className='text-xs text-slate-500 mt-0.5'>{s.formula}</div>}
              </div>
              <div className='text-end'>
                {s.amount != null && <div className='font-mono'>{formatCurrency(s.amount, lang)}</div>}
                {s.intermediate != null && <div className='text-xs text-slate-500'>{s.intermediate}</div>}
              </div>
            </div>
            {s.inputs_json && (
              <pre className='text-xs bg-slate-50 mt-2 p-2 rounded overflow-x-auto'>{JSON.stringify(s.inputs_json, null, 2)}</pre>
            )}
          </li>
        ))}
      </ol>
      <div className='flex justify-between font-semibold mt-3 pt-3 border-t'>
        <span>{t('bonus.total')}</span>
        <span className='font-mono'>{formatCurrency(total, lang)}</span>
      </div>
    </div>
  );
}
