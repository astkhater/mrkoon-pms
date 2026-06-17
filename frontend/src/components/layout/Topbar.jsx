import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

const VIEW_AS_ROLES = [
  { code: 'admin',     en: 'Admin',      ar: 'مسؤول النظام' },
  { code: 'c_level',   en: 'C-Level',    ar: 'تنفيذي' },
  { code: 'dept_head', en: 'Dept Head',  ar: 'رئيس قسم' },
  { code: 'manager',   en: 'Manager/TL', ar: 'مدير' },
  { code: 'hr',        en: 'HR',         ar: 'الموارد البشرية' },
  { code: 'finance',   en: 'Finance',    ar: 'المالية' },
  { code: 'employee',  en: 'Employee',   ar: 'موظف' },
];

function ViewAsSwitcher({ lang }) {
  const { isRealAdmin, viewAs, setViewAs, clearViewAs } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!isRealAdmin) return null;

  const current = VIEW_AS_ROLES.find(r => r.code === viewAs);

  function pick(code) {
    setViewAs(code);
    setOpen(false);
    navigate('/');
  }
  function exit() {
    clearViewAs();
    setOpen(false);
    navigate('/');
  }

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(o => !o)}
        className={
          'flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs ' +
          (current
            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
        }
        title={lang === 'ar' ? 'عرض كدور آخر' : 'View as another role'}
      >
        <span>👁</span>
        {current ? (
          <span className='font-medium'>
            {lang === 'ar' ? 'يُعرض كـ ' + current.ar : 'Viewing as ' + current.en}
          </span>
        ) : (
          <span>{lang === 'ar' ? 'عرض كـ…' : 'View as…'}</span>
        )}
        <span className='text-[10px]'>▾</span>
      </button>
      {open && (
        <div className='absolute end-0 mt-1 w-52 bg-white border rounded shadow-lg z-50 text-sm'>
          <div className='px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 border-b'>
            {lang === 'ar' ? 'وضع المعاينة (للمسؤول فقط)' : 'Preview m