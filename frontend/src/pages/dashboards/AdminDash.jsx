import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function AdminDash() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('nav.admin')}</h1>
      <Card title={t('admin.config')}>
        <ul className='text-sm space-y-2'>
          <li><Link to='/admin/config' className='text-mrkoon hover:underline'>{t('admin.kpis')}</Link></li>
          <li><Link to='/admin/config' className='text-mrkoon hover:underline'>{t('admin.objectives')}</Link></li>
          <li><Link to='/admin/config' className='text-mrkoon hover:underline'>{t('admin.schemes')}</Link></li>
          <li><Link to='/admin/config' className='text-mrkoon hover:underline'>{t('admin.rates')}</Link></li>
          <li><Link to='/admin/config' className='text-mrkoon hover:underline'>{t('admin.users')}</Link></li>
        </ul>
      </Card>
      <Card title={t('nav.audit')}>
        <Link to='/audit' className='text-mrkoon hover:underline text-sm'>{t('common.no_data')} →</Link>
      </Card>
    </div>
  );
}
