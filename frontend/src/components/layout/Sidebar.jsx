import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';

const items = [
  { to: '/',                key: 'nav.dashboard',  roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/team',            key: 'nav.team',       roles: ['manager','dept_head','hr','admin','c_level'] },
  { to: '/okrs',            key: 'nav.okrs',       roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/kpis',            key: 'nav.kpis',       roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/cadence',         key: 'nav.cadence',    roles: ['manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/appraisals',      key: 'nav.appraisals', roles: ['employee','manager','dept_head','hr','c_level','admin'] },
  { to: '/pips',            key: 'nav.pips',       roles: ['manager','dept_head','hr','c_level','admin'] },
  { to: '/bonus',           key: 'nav.bonus',      roles: ['employee','manager','dept_head','finance','c_level','admin'] },
  { to: '/sops',            key: 'nav.sops',       roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/audit',           key: 'nav.audit',      roles: ['hr','finance','c_level','admin'] },
  { to: '/admin/config',    key: 'nav.admin',      roles: ['admin','hr','finance'] },
];

export default function Sidebar() {
  const { hasAccess } = useAuth();
  const { t, lang } = useLang();
  // Use white horizontal logo on the navy sidebar.
  const logoSrc = lang === 'ar' ? '/brand/logo-h-ar-white.png' : '/brand/logo-h-en-white.png';
  return (
    <aside className='md:w-56 bg-mrkoon text-white md:min-h-screen md:sticky md:top-0'>
      <div className='p-4 border-b border-mrkoon-light/30'>
        <img src={logoSrc} alt='Mrkoon PMS' className='h-8' />
        <div className='text-[10px] uppercase tracking-wider text-mrkoon-grey-mid mt-1.5'>Performance</div>
      </div>
      <nav className='flex md:flex-col flex-row overflow-x-auto md:overflow-visible'>
        {items.filter(i => hasAccess(i.roles)).map(i => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.to === '/'}
            className={({ isActive }) =>
              'px-4 py-2 whitespace-nowrap hover:bg-mrkoon-dark text-sm ' + (isActive ? 'bg-mrkoon-dark border-s-4 border-mrkoon-accent' : '')
            }
          >
            {t(i.key)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
