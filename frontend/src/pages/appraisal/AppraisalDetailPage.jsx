import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function AppraisalDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('appraisal.title')} — {id}</h1>
      <Card><Empty reason={t('empty.no_appraisals')} /></Card>
    </div>
  );
}
