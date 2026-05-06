import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import ar from '../lang/ar.js';
import en from '../lang/en.js';

const LangCtx = createContext(null);
export const useLang = () => useContext(LangCtx);

const dicts = { ar, en };

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o && k in o ? o[k] : undefined), obj);
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mrkoon_lang') : null;
    return stored || (import.meta.env.VITE_DEFAULT_LANG ?? 'ar');
  });

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('mrkoon_lang', lang);
  }, [lang]);

  const setLang = useCallback((next) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === 'ar' ? 'en' : 'ar')), []);

  const t = useCallback((key, fallback) => {
    const v = get(dicts[lang], key);
    if (typeof v === 'string') return v;
    const en_v = get(dicts.en, key);
    if (typeof en_v === 'string') return en_v;
    return fallback ?? key;
  }, [lang]);

  return (
    <LangCtx.Provider value={{ lang, setLang, toggleLang, t, isRTL: lang === 'ar' }}>
      {children}
    </LangCtx.Provider>
  );
}
