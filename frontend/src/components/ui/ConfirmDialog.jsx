import React, { useState } from 'react';
import Button from './Button.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Destructive actions require confirmation (ux-standards)
export default function ConfirmDialog({ open, title, body, requirePhrase, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const [phrase, setPhrase] = useState('');
  if (!open) return null;
  const ok = !requirePhrase || phrase === requirePhrase;
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50' role='dialog' aria-modal='true'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
        <h3 className='text-lg font-semibold mb-2'>{title}</h3>
        <p className='text-sm text-slate-600 mb-4'>{body}</p>
        {requirePhrase && (
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={requirePhrase}
            className='w-full border border-slate-300 rounded px-3 py-2 text-sm mb-4'
          />
        )}
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' onClick={onCancel}>{t('common.cancel')}</Button>
          <Button variant='danger' disabled={!ok} onClick={onConfirm}>{t('common.confirm')}</Button>
        </div>
      </div>
    </div>
  );
}
