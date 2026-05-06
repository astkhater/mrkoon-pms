import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function FinanceDash() {
  const { t } = useTranslation();
  // CRM/ERP banner: dormancy state read from a future hook; placeholder shows banner now
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('nav.dashboard')} — Finance</h1>
      <div className='flex gap-2'>
        <Badge tone='red'>{t('dashboard.crm_not_connected')}</Badge>
        <Badge tone='red'>{t('dashboard.erp_not_connected')}</Badge>
      </div>
      <Card title={t('bonus.pending')}>
        <Empty reason={t('empty.no_payouts')} />
      </Card>
      <Card title={t('bonus.approved_recent')}>
        <Empty reason={t('empty.no_payouts')} />
      </Card>
    </div>
  );
}
