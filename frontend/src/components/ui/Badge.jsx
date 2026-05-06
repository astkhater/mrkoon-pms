import React from 'react';

const tones = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-800',
};

export default function Badge({ tone = 'gray', children }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${tones[tone]}`}>{children}</span>;
}
