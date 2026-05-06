import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className='block'>
      {label && <span className='block text-sm font-medium text-slate-700 mb-1'>{label}</span>}
      <input
        className={`w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-mrkoon focus:border-mrkoon ${error ? 'border-bad' : 'border-slate-300'} ${className}`}
        {...props}
      />
      {error && <span className='block text-xs text-bad mt-1'>{error}</span>}
    </label>
  );
}
