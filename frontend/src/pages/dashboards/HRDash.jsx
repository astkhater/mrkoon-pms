import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function HRDash() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — HR</h1>
      <Card title={t('hr.cycles')}>
        <Empty reason={t('empty.no_appraisals')} />
      </Card>
      <Card title={t('hr.overdue')}>
        <Empty reason={t('empty.no_appraisals')} />
      </Card>
    </div>
  );
}
