import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase.js';

function useSearchData(open) {
  return useQuery({
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 min cache
    queryKey: ['cmdk.search'],
    queryFn: async () => {
      const [users, kpis, objs] = await Promise.all([
        supabase.schema('def').from('users').select('id, full_name_en, full_name_ar, email, role_code').eq('active', true),
        supabase.schema('def').from('kpis').select('id, name_en, name_ar, frequency'),
        supabase.schema('def').from('objectives').select('id, code, level, title_en, title_ar'),
      ]);
      return {
        users: users.data ?? [],
        kpis:  kpis.data ?? [],
        objectives: objs.data ?? [],
      };
    },
  });
}

const navItems = [
  { id: 'nav.dashboard', label_en: 'Dashboard',              label_ar: 'لوحة التحكم',         to: '/' },
  { id: 'nav.team',      label_en: 'My Team',                label_ar: 'الفريق',              to: '/team' },
  { id: 'nav.okrs',      label_en: 'OKRs',                   label_ar: 'الأهداف',             to: '/okrs' },
  { id: 'nav.kpis',      label_en: 'KPIs',                   label_ar: 'المؤشرات',            to: '/kpis' },
  { id: 'nav.kpi_entry', label_en: 'Enter KPI actuals',      label_ar: 'إدخال القيم الفعلية',  to: '/kpis/entry' },
  { id: 'nav.kpi_imp',   label_en: 'Bulk import KPIs',       label_ar: 'استيراد بكميات',       to: '/kpis/import' },
  { id: 'nav.cadence',   label_en: 'Cadence',                label_ar: 'الإيقاع',             to: '/cadence' },
  { id: 'nav.apprs',     label_en: 'Appraisals',             label_ar: 'التقييمات',           to: '/appraisals' },
  { id: 'nav.calib',     label_en: 'Calibration',            label_ar: 'المعايرة',            to: '/appraisals/calibration' },
  { id: 'nav.pips',      label_en: 'PIPs',                   label_ar: 'خطط التحسين',         to: '/pips' },
  { id: 'nav.bonus',     label_en: 'Bonus & Commission',     label_ar: 'الحوافز والعمولات',   to: '/bonus' },
  { id: 'nav.sops',      label_en: 'SOPs',                   label_ar: 'إجراءات العمل',       to: '/sops' },
  { id: 'nav.audit',     label_en: 'Audit log',              label_ar: 'سجل التدقيق',         to: '/audit' },
  { id: 'nav.assum',     label_en: 'Assumptions (SSOT)',     label_ar: 'الافتراضات',          to: '/admin/assumptions' },
  { id: 'nav.users',     label_en: 'Users admin',            label_ar: 'إدارة المستخدمين',    to: '/admin/users' },
  { id: 'nav.cycle',     label_en: 'Cycle periods',          label_ar: 'فترات الدورات',       to: '/admin/cycle-periods' },
  { id: 'nav.notif',     label_en: 'Notifications',          label_ar: 'الإشعارات',           to: '/notifications' },
];

function score(query, text) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = (text || '').toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 50;
  if (t.includes(q)) return 25;
  // Loose match: all letters in order
  let i = 0;
  for (const ch of t) { if (ch === q[i]) i++; if (i >= q.length) return 5; }
  return 0;
}

export default function CommandPalette() {
  const { hasAccess } = useAuth();
  const { lang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const nav = useNavigate();
  const data = useSearchData(open);

  useEffect(() => {
    function onKey(e) {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const triggered = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (triggered) { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape' && open) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else { setQ(''); setActiveIdx(0); }
  }, [open]);

  const results = useMemo(() => {
    const items = [];
    // Nav
    navItems.forEach(n => {
      const s = Math.max(score(q, n.label_en), score(q, n.label_ar), score(q, n.id));
      if (s > 0) items.push({ kind: 'nav', score: s + 1, label: lang === 'ar' ? n.label_ar : n.label_en, sub: 'go to', to: n.to, key: n.id });
    });
    // Users
    (data.data?.users ?? []).forEach(u => {
      const s = Math.max(score(q, u.full_name_en), score(q, u.full_name_ar), score(q, u.email));
      if (s > 0) items.push({ kind: 'user', score: s, label: u.full_name_en, sub: u.email + ' · ' + u.role_code, to: `/admin/users`, key: 'u-' + u.id });
    });
    // KPIs
    (data.data?.kpis ?? []).forEach(k => {
      const s = Math.max(score(q, k.id), score(q, k.name_en), score(q, k.name_ar));
      if (s > 0) items.push({ kind: 'kpi', score: s, label: k.id + ' — ' + (lang === 'ar' ? k.name_ar : k.name_en), sub: k.frequency, to: `/kpis/${k.id}/trend`, key: 'k-' + k.id });
    });
    // Objectives
    (data.data?.objectives ?? []).forEach(o => {
      const s = Math.max(score(q, o.code), score(q, o.title_en), score(q, o.title_ar));
      if (s > 0) items.push({ kind: 'okr', score: s, label: o.code + ' — ' + (lang === 'ar' ? o.title_ar : o.title_en), sub: o.level, to: '/okrs', key: 'o-' + o.id });
    });
    items.sort((a, b) => b.score - a.score);
    return items.slice(0, 30);
  }, [q, data.data, lang]);

  useEffect(() => { setActiveIdx(0); }, [q]);

  function pick(item) {
    if (!item) return;
    nav(item.to);
    setOpen(false);
  }

  function onInputKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter')     { e.preventDefault(); pick(results[activeIdx]); }
  }

  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24' onClick={() => setOpen(false)}>
      <div className='w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden' onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onInputKey}
          placeholder={lang === 'ar' ? 'ابحث... (موظف / مؤشر / هدف / صفحة)' : 'Search… (user / KPI / OKR / page)'}
          className='w-full border-b px-4 py-3 text-base outline-none'
        />
        <div className='max-h-96 overflow-y-auto'>
          {results.length === 0 ? (
            <div className='p-6 text-center text-sm text-slate-400'>
              {lang === 'ar' ? 'لا توجد نتائج' : 'No matches'}
            </div>
          ) : results.map((r, i) => (
            <button
              key={r.key}
              onClick={() => pick(r)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full text-start px-4 py-2 border-b last:border-0 flex items-center gap-3 ${i === activeIdx ? 'bg-mrkoon-grey-light' : ''}`}
            >
              <span className='text-xs px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-600'>{r.kind}</span>
              <span className='flex-1 truncate text-sm'>{r.label}</span>
              <span className='text-xs text-slate-400 truncate max-w-[180px]'>{r.sub}</span>
            </button>
          ))}
        </div>
        <div className='p-2 text-xs text-slate-400 border-t bg-slate-50 flex items-center justify-between'>
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{results.length} {lang === 'ar' ? 'نتيجة' : 'results'}</span>
        </div>
      </div>
    </div>
  );
}
