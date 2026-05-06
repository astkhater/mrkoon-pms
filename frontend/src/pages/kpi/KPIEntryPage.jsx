import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function KPIEntryPage() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('kpi.enter_actuals')}</h1>
      <Card>
        <Empty reason={t('kpi.no_kpis_assigned')} />
      </Card>
    </div>
  );
}
