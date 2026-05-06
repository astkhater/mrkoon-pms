import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';

export default function Topbar() {
  const { profile, signOut } = useAuth();
  const { lang, toggleLang, t } = useLang();
  return (
    <header className='bg-white border-b px-4 md:px-8 py-3 flex items-center justify-between'>
      <div className='text-sm text-slate-500'>{t('app.subtitle', 'Performance Management')}</div>
      <div className='flex items-center gap-3'>
        <button
          onClick={toggleLang}
          className='px-3 py-1 rounded border text-sm hover:bg-slate-50'
          aria-label='Toggle language'
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
        <span className='text-sm'>{lang === 'ar' ? profile?.full_name_ar : profile?.full_name_en}</span>
        <button onClick={signOut} className='text-sm text-mrkoon hover:underline'>
          {t('auth.signout', 'Sign out')}
        </button>
      </div>
    </header>
  );
}
