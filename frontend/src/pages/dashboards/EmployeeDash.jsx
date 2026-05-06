import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function EmployeeDash() {
  const { t, lang } = useTranslation();
  const { profile } = useAuth();
  const name = profile ? (lang === 'ar' ? profile.full_name_ar : profile.full_name_en) : '';
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('dashboard.welcome')}{name ? ', ' + name : ''}</h1>
      <div className='grid md:grid-cols-2 gap-4'>
        <Card title={t('dashboard.my_okrs')}>
          <Empty reason={t('empty.no_okrs')} />
        </Card>
        <Card title={t('dashboard.my_kpis')}>
          <Empty reason={t('empty.no_kpis')} />
        </Card>
        <Card title={t('dashboard.appraisal_status')}>
          <Empty reason={t('empty.no_appraisals')} />
        </Card>
        <Card title={t('dashboard.bonus_estimate')}>
          <Empty reason={t('empty.no_payouts')} />
        </Card>
      </div>
    </div>
  );
}
