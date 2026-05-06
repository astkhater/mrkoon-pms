import React from 'react';
import OKRTree from '../../components/okr/OKRTree.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function OKRListPage() {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>{t('okr.title')}</h1>
      </div>
      <OKRTree />
    </div>
  );
}
