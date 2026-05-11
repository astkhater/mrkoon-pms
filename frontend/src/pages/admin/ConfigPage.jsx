import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

const sections = [
  { to: '/admin/users',                 title: 'Users',              desc: 'Roster + role / permissions / active. Edit role_code, hr/finance/admin overlays.' },
  { to: '/admin/cycle-periods',         title: 'Cycle Periods',      desc: 'Monthly / quarterly / annual periods. Create before opening an appraisal cycle.' },
  { to: '/admin/levels',                title: 'Levels & Grades',    desc: '10 levels; activate dormant ones (Manager / Sr Manager / Head / Director).' },
  { to: '/admin/compensation-inputs',   title: 'Compensation Inputs', desc: 'BD rate scale, AM/VM/Ops rates, gates, OpEx bands. Source-of-truth for payouts.' },
  { to: '/admin/assumptions',           title: 'Assumptions',        desc: 'Single source of truth for targets (GP, retention, etc.). Cascades to KRs/KPIs via formula_ref.' },
  { to: '/admin/kpi-master',            title: 'KPI Master',         desc: 'KPI catalog + per-role weights (sum = 1.00 for scored). Source: framework v6.' },
];

export default function ConfigPage() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('admin.config')}</h1>
      <div className='grid md:grid-cols-2 gap-4'>
        {sections.map((s) => (
          <Card key={s.to} title={s.title}>
            <p className='text-sm text-slate-600 mb-3'>{s.desc}</p>
            <Link to={s.to} className='text-mrkoon hover:underline text-sm'>Open →</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
