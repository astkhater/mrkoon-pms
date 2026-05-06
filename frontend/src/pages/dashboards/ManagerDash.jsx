import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function ManagerDash() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — Manager</h1>
      <Card title={t('dashboard.my_okrs')}>
        <Empty reason={t('empty.no_okrs')} />
      </Card>
      <Card title={t('dashboard.appraisal_status')}>
        <Empty reason={t('empty.no_appraisals')} />
      </Card>
    </div>
  );
}
