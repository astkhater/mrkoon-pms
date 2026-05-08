import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Login() {
  const { signInWithMagicLink } = useAuth();
  const { t, lang, toggleLang } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const { error } = await signInWithMagicLink(email);
    if (error) setError(error.message);
    else setSent(true);
  }

  // Localized horizontal color logo (navy + green) on white card.
  const logoSrc = lang === 'ar' ? '/brand/logo-h-ar.png' : '/brand/logo-h-en.png';

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-mrkoon'>
      <div className='max-w-sm w-full bg-white rounded-lg shadow-lg p-8'>
        <div className='text-center mb-8'>
          <img src={logoSrc} alt='Mrkoon' className='h-14 mx-auto mb-4' />
          <div className='text-base text-slate-600 font-medium mt-2'>{t('app.subtitle')}</div>
          <div className='text-sm text-slate-500 mt-3'>{t('auth.title')}</div>
        </div>
        {sent ? (
          <div className='text-center text-sm text-mrkoon-accent font-medium'>{t('auth.link_sent')}</div>
        ) : (
          <form onSubmit={onSubmit} className='space-y-4'>
            <Input
              label={t('auth.email_label')}
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
              error={error}
            />
            <Button type='submit' className='w-full bg-mrkoon-accent hover:opacity-90'>{t('auth.send_link')}</Button>
            <div className='text-xs text-slate-500 text-center'>{t('auth.need_help')}</div>
          </form>
        )}
        <div className='text-center mt-6 border-t pt-4'>
          <button onClick={toggleLang} className='text-xs text-slate-500 underline hover:text-mrkoon'>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </div>
  );
}
