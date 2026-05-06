import React from 'react';

export default function Card({ title, action, children, className = '' }) {
  return (
    <section className={`bg-white border rounded-lg p-4 md:p-6 ${className}`}>
      {(title || action) && (
        <header className='flex items-center justify-between mb-4'>
          {title && <h2 className='text-base font-semibold text-slate-800'>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
