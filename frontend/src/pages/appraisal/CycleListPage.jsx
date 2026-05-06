import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function CycleListPage() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('appraisal.title')}</h1>
      <Card title={t('hr.cycles')}>
        <Empty reason={t('empty.no_appraisals')} />
      </Card>
    </div>
  );
}
