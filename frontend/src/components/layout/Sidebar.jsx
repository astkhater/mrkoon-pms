import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';

const items = [
  { to: '/',                key: 'nav.dashboard',  roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/okrs',            key: 'nav.okrs',       roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/kpis',            key: 'nav.kpis',       roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/appraisals',      key: 'nav.appraisals', roles: ['employee','manager','dept_head','hr','c_level','admin'] },
  { to: '/bonus',           key: 'nav.bonus',      roles: ['employee','manager','dept_head','finance','c_level','admin'] },
  { to: '/sops',            key: 'nav.sops',       roles: ['employee','manager','dept_head','hr','finance','c_level','admin'] },
  { to: '/audit',           key: 'nav.audit',      roles: ['hr','finance','c_level','admin'] },
  { to: '/admin/config',    key: 'nav.admin',      roles: ['admin','hr','finance'] },
];

export default function Sidebar() {
  const { role } = useAuth();
  const { t } = useLang();
  return (
    <aside className='md:w-56 bg-mrkoon text-white md:min-h-screen md:sticky md:top-0'>
      <div className='p-4 text-lg font-bold'>{t('app.name')}</div>
      <nav className='flex md:flex-col flex-row overflow-x-auto md:overflow-visible'>
        {items.filter(i => i.roles.includes(role)).map(i => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.to === '/'}
            className={({ isActive }) =>
              'px-4 py-2 whitespace-nowrap hover:bg-mrkoon-dark ' + (isActive ? 'bg-mrkoon-dark border-s-4 border-mrkoon-accent' : '')
            }
          >
            {t(i.key)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
