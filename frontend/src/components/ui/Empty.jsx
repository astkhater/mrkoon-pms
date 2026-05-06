import React from 'react';

// Empty state per ux-standards: tell user WHY empty + WHAT NEXT
export default function Empty({ reason, cta }) {
  return (
    <div className='text-center py-12 text-slate-500'>
      <div className='text-sm mb-3'>{reason}</div>
      {cta}
    </div>
  );
}
