import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function CLevelDash() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — C-Level</h1>
      <Card title={t('dashboard.my_okrs')}>
        <Empty reason={t('empty.no_okrs')} />
      </Card>
      <Card title='KPI health'>
        <Empty reason={t('empty.no_kpis')} />
      </Card>
    </div>
  );
}
