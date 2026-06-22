import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';

// IA reframe 2026-06-15: workflow-grouped nav, builder pages under Settings.
// Mobile polish 2026-06-19: slide-in drawer on <md, normal sticky aside on >=md.

const ALL = ['employee','manager','dept_head','hr','finance','c_level','admin'];
const MGR_UP = ['manager','dept_head','hr','admin','c_level'];
const DH_UP  = ['dept_head','hr','admin','c_level'];

const groups = [
  { id: 'home', label: { en: '', ar: '' }, items: [
    { to: '/', en: 'Dashboard', ar: 'الرئيسية', icon: '⌂', roles: ALL, end: true },
  ]},
  { id: 'my-work', label: { en: 'My Work', ar: 'مهامي' }, items: [
    { to: '/kpis/entry', en: 'Enter KPIs',  ar: 'إدخال المؤشرات', icon: '✎', roles: ALL },
    { to: '/okrs',       en: 'My OKRs',     ar: 'أهدافي',         icon: '◎', roles: ALL },
    { to: '/appraisals', en: 'My Appraisal',ar: 'تقييمي',         icon: '★', roles: ALL },
    { to: '/bonus/me',   en: 'My Bonus',    ar: 'مكافآتي',        icon: '₤', roles: ALL },
  ]},
  { id: 'team', label: { en: 'Team', ar: 'الفريق' }, items: [
    { to: '/team',        en: 'Team Status', ar: 'حالة الفريق',    icon: '◉', roles: MGR_UP },
    { to: '/cadence',     en: 'Check-ins',   ar: 'المتابعات',      icon: '⟳', roles: MGR_UP },
    { to: '/team/bonus',  en: 'Team Bonus',  ar: 'مكافآت الفريق', icon: '₤', roles: MGR_UP },
    { to: '/pips',        en: 'PIPs',        ar: 'خطط التحسين',    icon: '!', roles: MGR_UP },
  ]},
  { id: 'org', label: { en: 'Org', ar: 'المؤسسة' }, items: [
    { to: '/appraisals/calibration', en: 'Calibration', ar: 'المعايرة', icon: '⚖', roles: DH_UP },
    { to: '/kpis',                   en: 'KPI Library', ar: 'مكتبة المؤشرات', icon: '▤', roles: DH_UP },
  ]},
  { id: 'reference', label: { en: 'Reference', ar: 'المرجع' }, items: [
    { to: '/sops', en: 'SOPs', ar: 'الإجراءات',   icon: '☰', roles: ALL },
    { to: '/help', en: 'Help', ar: 'المساعدة',    icon: '?', roles: ALL },
  ]},
  { id: 'settings', label: { en: 'Settings', ar: 'الإعدادات' }, collapsible: true, defaultOpen: false, items: [
    { to: '/admin/kpi-master',          en: 'KPI Catalog',         ar: 'مكتبة المؤشرات',   icon: '▤', roles: ['admin','hr'] },
    { to: '/admin/cycle-periods',       en: 'Cycle Periods',       ar: 'فترات الدورة',     icon: '◔', roles: ['admin','hr'] },
    { to: '/admin/compensation-inputs', en: 'Compensation Inputs', ar: 'مدخلات التعويضات', icon: '₤', roles: ['admin','finance'] },
    { to: '/admin/levels',              en: 'Levels & Roles',      ar: 'المستويات والأدوار',icon: '⌬', roles: ['admin','hr'] },
    { to: '/admin/assumptions',         en: 'Assumptions',         ar: 'الافتراضات',       icon: 'ƒ', roles: ['admin','hr','finance'] },
    { to: '/admin/users',               en: 'Users',               ar: 'المستخدمون',       icon: '◌', roles: ['admin','hr'] },
    { to: '/audit',                     en: 'Audit Log',           ar: 'سجل التدقيق',      icon: '◈', roles: ['hr','finance','c_level','admin'] },
    { to: '/admin/config',              en: 'All Settings',        ar: 'كل الإعدادات',     icon: '⚙', roles: ['admin','hr','finance'] },
  ]},
];

function GroupHeader({ label, collapsible, open, onToggle }) {
  if (!label) return null;
  if (collapsible) {
    return (
      <button
        onClick={onToggle}
        className='flex items-center justify-between w-full px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-mrkoon-grey-mid hover:text-white'
      >
        <span>⚙ {label}</span>
        <span className='text-mrkoon-grey-mid'>{open ? '▾' : '▸'}</span>
      </button>
    );
  }
  return <div className='px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-mrkoon-grey-mid'>{label}</div>;
}

function NavItem({ item, lang, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        'flex items-center gap-2 px-4 py-2 whitespace-nowrap hover:bg-mrkoon-dark text-sm ' +
        (isActive ? 'bg-mrkoon-dark border-s-4 border-mrkoon-accent' : '')
      }
    >
      {item.icon && <span className='text-xs text-mrkoon-grey-mid w-3 text-center'>{item.icon}</span>}
      <span>{lang === 'ar' ? item.ar : item.en}</span>
    </NavLink>
  );
}

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { hasAccess } = useAuth();
  const { lang } = useLang();
  const logoSrc = lang === 'ar' ? '/brand/logo-h-ar-white.png' : '/brand/logo-h-en-white.png';

  const [settingsOpen, setSettingsOpen] = useState(() => {
    try { return localStorage.getItem('mrk.sidebar.settings.open') === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('mrk.sidebar.settings.open', settingsOpen ? '1' : '0'); } catch {}
  }, [settingsOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  const visibleGroups = groups
    .map(g => ({ ...g, items: g.items.filter(i => hasAccess(i.roles)) }))
    .filter(g => g.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className='fixed inset-0 bg-black/40 z-30 md:hidden'
          aria-hidden='true'
        />
      )}

      <aside
        className={
          'bg-mrkoon text-white ' +
          // Mobile: fixed drawer, slides in from start
          'fixed inset-y-0 start-0 z-40 w-64 overflow-y-auto transform transition-transform duration-200 ease-out ' +
          (isOpen ? 'translate-x-0 rtl:translate-x-0' : '-translate-x-full rtl:translate-x-full') + ' ' +
          // md+: revert to static sticky aside
          'md:relative md:translate-x-0 md:rtl:translate-x-0 md:w-60 md:min-h-screen md:sticky md:top-0 md:z-auto md:overflow-visible'
        }
      >
        <div className='p-4 border-b border-mrkoon-light/30 flex items-center justify-between'>
          <div>
            <img src={logoSrc} alt='Mrkoon PMS' className='h-8' />
            <div className='text-[10px] uppercase tracking-wider text-mrkoon-grey-mid mt-1.5'>Performance</div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className='md:hidden text-mrkoon-grey-mid hover:text-white p-1 -m-1'
            aria-label={lang === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
          >
            ✕
          </button>
        </div>
        <nav className='flex flex-col pb-4'>
          {visibleGroups.map(g => (
            <div key={g.id}>
              <GroupHeader
                label={lang === 'ar' ? g.label.ar : g.label.en}
                collapsible={g.collapsible}
                open={g.collapsible ? settingsOpen : true}
                onToggle={() => setSettingsOpen(o => !o)}
              />
              {(g.collapsible ? settingsOpen : true) && g.items.map(item => (
                <NavItem key={item.to} item={item} lang={lang} onNavigate={onClose} />
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
