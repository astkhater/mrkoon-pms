import React from 'react';

const variants = {
  primary: 'bg-mrkoon text-white hover:bg-mrkoon-dark focus-visible:outline-mrkoon',
  secondary: 'bg-white text-mrkoon border border-mrkoon hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-bad text-white hover:bg-red-700',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      type='button'
      className={`px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
