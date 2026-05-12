import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

export default function Topbar() {
  const { profile, signOut, role, permissions = [] } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const name = lang === 'ar' ? (profile?.full_name_ar || profile?.full_name_en) : profile?.full_name_en;
  const initials = (name || '?').split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase();

  return (
    <header className='bg-white border-b px-4 md:px-8 py-3 flex items-center justify-between'>
      <div className='flex items-center gap-3 text-sm text-slate-500'>
        <span>{t('app.subtitle', 'Performance Management')}</span>
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
      <div className='flex items-center gap-3'>
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
