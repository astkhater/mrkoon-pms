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
            {lang === 'ar' ? 'وضع المعاينة (للمسؤول فقط)' : 'Preview mode (admin-only)'}
          </div>
          {VIEW_AS_ROLES.map(r => (
            <button
              key={r.code}
              onClick={() => pick(r.code)}
              className={
                'block w-full text-start px-3 py-1.5 hover:bg-slate-50 ' +
                (r.code === viewAs ? 'bg-amber-50 font-medium' : '')
              }
            >
              {lang === 'ar' ? r.ar : r.en}
              <span className='text-[10px] text-slate-400 ms-2 font-mono'>{r.code}</span>
            </button>
          ))}
          {current && (
            <button
              onClick={exit}
              className='block w-full text-start px-3 py-2 border-t text-rose-600 hover:bg-rose-50'
            >
              ✕ {lang === 'ar' ? 'إنهاء وضع المعاينة' : 'Exit preview mode'}
            </button>
          )}
          <div className='px-3 py-2 text-[10px] text-slate-400 border-t'>
            {lang === 'ar'
              ? 'لا يُغيّر صلاحيات قاعدة البيانات — للواجهة فقط.'
              : 'UI only — your data access is unchanged.'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Topbar() {
  const { profile, signOut, role, permissions = [], viewAs } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const name = lang === 'ar' ? (profile?.full_name_ar || profile?.full_name_en) : profile?.full_name_en;
  const initials = (name || '?').split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase();

  return (
    <header className={
      'bg-white border-b px-4 md:px-8 py-3 flex items-center justify-between ' +
      (viewAs ? 'border-b-2 border-amber-300' : '')
    }>
      <div className='flex items-center gap-3 text-sm text-slate-500'>
        <span className='hidden sm:inline'>{t('app.subtitle', 'Performance Management')}</span>
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: !navigator.platform.toLowerCase().includes('mac'), metaKey: navigator.platform.toLowerCase().includes('mac') }))}
          className='hidden md:flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-slate-50'
          aria-label='Open command palette'
          title={lang === 'ar' ? 'بحث سريع (Ctrl+K)' : 'Quick search (Ctrl+K)'}
        >
          <span>🔍</span>
          <kbd className='font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded'>{navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}</kbd>
        </button>
      </div>
      <div className='flex items-center gap-2 md:gap-3'>
        <ViewAsSwitcher lang={lang} />
        <button
          onClick={toggleLang}
          className='px-3 py-1 rounded border text-sm hover:bg-slate-50'
          aria-label='Toggle language'
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
        <Link to='/help' className='text-sm text-slate-500 hover:text-mrkoon' title={lang === 'ar' ? 'مساعدة' : 'Help'}>?</Link>
        <NotificationBell />
        <div className='flex items-center gap-2 border-s ps-3'>
          <div className='w-8 h-8 rounded-full bg-mrkoon-accent text-white grid place-items-center text-xs font-semibold'>{initials}</div>
          <div className='hidden md:block'>
            <div className='text-sm font-medium leading-tight'>{name}</div>
            <div className='text-[10px] text-slate-500 leading-tight'>{role}{permissions.length > 0 && ` · ${permissions.join('·')}`}</div>
          </div>
        </div>
        <button onClick={signOut} className='text-sm text-rose-600 hover:underline ms-1'>
          {t('auth.signout', 'Sign out')}
        </button>
      </div>
    </header>
  );
}
