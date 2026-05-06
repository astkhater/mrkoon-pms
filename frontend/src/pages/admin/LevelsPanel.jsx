import React from 'react';
import ConfigEditor from '../../components/admin/ConfigEditor.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Admin → Config → Levels — D-33 Khater Q1
// 10 levels seeded. TL active first-line. Manager/Sr Mgr/Head/Director dormant.
export default function LevelsPanel() {
  const { t } = useTranslation();
  const columns = [
    { key: 'code',     label: 'Code',     readOnly: true },
    { key: 'ord',      label: 'Order',    type: 'number' },
    { key: 'title_en', label: 'Title (EN)', type: 'text' },
    { key: 'title_ar', label: 'Title (AR)', type: 'text' },
    { key: 'active',   label: 'Active',   type: 'boolean' },
    { key: 'comp_band',label: 'Salary band', type: 'select',
      options: [{ value: 'L1', label: 'L1' }, { value: 'L2', label: 'L2' }, { value: 'L3', label: 'L3' }, { value: 'L4', label: 'L4' }, { value: 'L5', label: 'L5' }] },
    { key: 'notes',    label: 'Notes',    type: 'text' },
  ];
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('admin.config')} — Levels</h1>
      <ConfigEditor
        schema='config'
        table='levels'
        columns={columns}
        keyCols={['code']}
        orderBy='ord'
      />
    </div>
  );
}
