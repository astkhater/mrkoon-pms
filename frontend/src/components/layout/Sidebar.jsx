import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';

// IA reframe 2026-06-15: workflow-grouped nav, builder pages buried under Settings.
// Pattern: groups[].items[]  — each item gates by role_code + functional permissions.

const ALL = ['employee','manager','dept_head','hr','finance','c_level','admin'];
const MGR_UP = ['manager','dept_head','hr','admin','c_level']; // anyone who has reports or oversees
const DH_UP  = ['dept_head','hr','admin','c_level'];

const groups = [
  {
    id: 'home',
    label: { en: '', ar: '' },
    items: [
      { to: '/', en: 'Dashboard', ar: 'الرئيسية', icon: '⌂', roles: ALL, end: true },
    ],
  },
  {
    id: 'my-work',
    label: { en: 'My Work', ar: 'مهامي' },
    items: [
      { to: '/kpis/entry', en: 'Enter KPIs',  ar: 'إدخال المؤشرات', icon: '✎', roles: ALL },
      { to: '/okrs',       en: 'My OKRs',     ar: 'أهدافي',         icon: '◎', roles: ALL },
      { to: '/appraisals', en: 'My Appraisal',ar: 'تقييمي',         icon: '★', roles: ALL },
      { to: '/bonus',      en: 'My Bonus',    ar: 'مكافآتي',        icon: '₤', roles: ALL },
    ],
  },
  {
    id: 'team',
    label: { en: 'Team', ar: 'الفريق' },
    items: [
      { to: '/team',        en: 'Team Status', ar: 'حالة الفريق',    icon: '◉', roles: MGR_UP },
      { to: '/cadence',     en: 'Check-ins',   ar: 'المتابعات',      icon: '⟳', roles: MGR_UP },
      { to: '/team?view=bonus', en: 'Team Bonus', ar: 'مكافآت الفريق', icon: '₤', roles: MGR_UP },
      { to: '/pips',        en: 'PIPs',        ar: 'خطط التحسين',    icon: '!', roles: MGR_UP },
    ],
  },
  {
    id: 'org',
    label: { en: 'Org', ar: 'المؤسسة' },
    items: [
      { to: '/appraisals/calibration', en: 'Calibration', ar: 'المعايرة', icon: '⚖', roles: DH_UP },
      { to: '/kpis',                   en: 'KPI Library', ar: 'مكتبة المؤشرات', icon: '▤', roles: DH_UP },
    ],
  },
  {
    id: 'reference',
    label: { en: 'Reference', ar: 'المرجع' },
    items: [
      { to: '/sops', en: 'SOPs', ar: 'الإجراءات',   icon: '☰', roles: ALL },
      { to: '/help', en: 'Help', ar: 'المساعدة',    icon: '?', roles: ALL },
    ],
  },
  {
    id: 'settings',
    label: { en: 'Settings', ar: 'الإعدادات' },
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: '/admin/kpi-master',          en: 'KPI Catalog',         ar: 'مكتبة المؤشرات',   icon: '▤', roles: ['admin','hr'] },
      { to: '/admin/cycle-periods',       en: 'Cycle Periods',       ar: 'فترات الدورة',     icon: '◔', roles: ['admin','hr'] },
      { to: '/admin/compensation-inputs', en: 'Compensation Inputs', ar: 'مدخلات التعويضات', icon: '₤', roles: ['admin','finance'] },
      { to: '/admin/levels',              en: 'Levels & Roles',      ar: 'المستويات والأدوار',icon: '⌬', roles: ['admin','hr'] },
      { to: '/admin/assumptions',         en: 'Assumptions',         ar: 'الافتراضات',       icon: 'ƒ', roles: ['admin','hr','finance'] },
      { to: '/admin/users',               en: 'Users',               ar: 'المستخدمون',       icon: '◌', roles: ['admin','hr'] },
      { to: '/audit',                     en: 'Audit Log',           ar: 'سجل التدقيق',      icon: '◈', roles: ['hr','finance','c_level','admin'] },
      { to: '/admin/config',              en: 'All Settings',        ar: 'كل الإعدادات',     icon: '⚙', roles: ['admin','hr','finance'] },
    ],
  },
];

function GroupHeader({ label, collapsible, open, onToggle, lang }) {
  if (!label) return null;
  if (collapsible) {
    return (
      <button
        onClick={onToggle}
        className='flex items-center justify-between w-full px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-mrkoon-grey-mid hover:text-white'
      >
        <span>{lang === 'ar' ? '⚙ ' + label : '⚙ ' + label}</span>
        <span className='text-mrkoon-grey-mid'>{open ? '▾' : '▸'}</span>
      </button>
    );
  }
  return (
    <div className='px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-mrkoon-grey-mid'>
      {label}
    </div>
  );
}

function NavItem({ item, lang }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        'flex items-center gap-2 px-4 py-1.5 whitespace-nowrap hover:bg-mrkoon-dark text-sm ' +
        (isActive ? 'bg-mrkoon-dark border-s-4 border-mrkoon-accent' : '')
      }
    >
      {item.icon && <span className='text-xs text-mrkoon-grey-mid w-3 text-center'>{item.icon}</span>}
      <span>{lang === 'ar' ? item.ar : item.en}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { hasAccess } = useAuth();
  const { lang } = useLang();
  const logoSrc = lang === 'ar' ? '/brand/logo-h-ar-white.png' : '/brand/logo-h-en-white.png';

  // Persist Settings group collapse state
  const [settingsOpen, setSettingsOpen] = useState(() => {
    try { return localStorage.getItem('mrk.sidebar.settings.open') === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('mrk.sidebar.settings.open', settingsOpen ? '1' : '0'); } catch {}
  }, [settingsOpen]);

  const visibleGroups = groups
    .map(g => ({ ...g, items: g.items.filter(i => hasAccess(i.roles)) }))
    .filter(g => g.items.length > 0);

  return (
    <aside className='md:w-60 bg-mrkoon text-white md:min-h-screen md:sticky md:top-0'>
      <div className='p-4 border-b border-mrkoon-light/30'>
        <img src={logoSrc} alt='Mrkoon PMS' className='h-8' />
        <div className='text-[10px] uppercase tracking-wider text-mrkoon-grey-mid mt-1.5'>Performance</div>
      </div>
      <nav className='flex md:flex-col flex-row overflow-x-auto md:overflow-visible pb-4'>
        {visibleGroups.map(g => (
          <div key={g.id} className='md:contents'>
            <GroupHeader
              label={lang === 'ar' ? g.label.ar : g.label.en}
              collapsible={g.collapsible}
              open={g.collapsible ? settingsOpen : true}
              onToggle={() => setSettingsOpen(o => !o)}
              lang={lang}
            />
            {(g.collapsible ? settingsOpen : true) && g.items.map(item => (
              <NavItem key={item.to} item={item} lang={lang} />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
