import React from 'react';
import ConfigEditor from '../../components/admin/ConfigEditor.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Admin → Config → Cycle Periods
// Manage config.cycle_periods. HR creates a cycle period (Q1 2026 quarterly)
// before opening an appraisal cycle for it.
export default function CyclePeriodsPanel() {
  const { t, lang } = useTranslation();

  const columns = [
    { key: 'label',      label: lang === 'ar' ? 'العنوان' : 'Label', type: 'text' },
    {
      key: 'type', label: lang === 'ar' ? 'النوع' : 'Type', type: 'select',
      options: [
        { value: 'monthly',   label: 'monthly' },
        { value: 'quarterly', label: 'quarterly' },
        { value: 'annual',    label: 'annual' },
      ],
    },
    { key: 'start_date', label: lang === 'ar' ? 'البداية' : 'Start', type: 'text' },
    { key: 'end_date',   label: lang === 'ar' ? 'النهاية' : 'End',   type: 'text' },
    {
      key: 'status', label: t('common.status'), type: 'select',
      options: [
        { value: 'open',     label: 'open' },
        { value: 'closed',   label: 'closed' },
        { value: 'archived', label: 'archived' },
      ],
    },
  ];

  // Smart defaults for new row — next quarter
  const today = new Date();
  const y = today.getFullYear();
  const q = Math.floor(today.getMonth() / 3) + 1;
  const newRow = {
    label: `Q${q} ${y}`,
    type: 'quarterly',
    status: 'open',
    start_date: new Date(y, (q - 1) * 3, 1).toISOString().slice(0, 10),
    end_date:   new Date(y, q * 3, 0).toISOString().slice(0, 10),
  };

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('admin.cycle_periods')}</h1>
      <p className='text-sm text-slate-600'>
        {lang === 'ar'
          ? 'فترات الدورات (شهرية / ربعية / سنوية) — أنشئ فترة قبل فتح دورة تقييم لها. التواريخ بصيغة YYYY-MM-DD.'
          : 'Period definitions (monthly / quarterly / annual). Create a period before opening an appraisal cycle for it. Dates as YYYY-MM-DD.'}
      </p>
      <ConfigEditor
        schema='config'
        table='cycle_periods'
        columns={columns}
        keyCols={['id']}
        orderBy='start_date'
        newRow={newRow}
      />
    </div>
  );
}
