import React, { useState } from 'react';
import ConfigEditor from '../../components/admin/ConfigEditor.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Admin → Config → Compensation Inputs — D-34 Khater Q2
// Tabs by scheme. Each tab edits config.compensation_rates rows for that scheme.
// Khater fills BD rate scale + AM/VM/Ops values here.
// Scheme IDs follow BCF version (v8 = current, post Hussein TL Gates 6-gate expansion 2026-05-12)
const schemes = [
  { id: 'BD-COMM-Q-v7',    label: 'BD Acquisition (quarterly)' },
  { id: 'AM-COMM-v7',      label: 'AM (monthly, 6-component)' },
  { id: 'VM-COMM-v8',      label: 'VM Sales v8 (monthly, per-auction)' },
  { id: 'OPS-BONUS-v7',    label: 'Ops Bonus (monthly)' },
  { id: 'OPS-TL-GATES-v8', label: 'Ops TL Gates v8 (6 gates, cap 6,500)' },
  { id: 'ONB-COMM-v7',     label: 'Onboarding (per-merchant)' },
  { id: 'OPEX-QTR-v7',     label: 'Quarterly OpEx Bonus' },
  { id: 'ANNUAL-BONUS-v7', label: 'Annual Bonus' },
];

export default function CompensationInputsPanel() {
  const { t } = useTranslation();
  const [active, setActive] = useState(schemes[0].id);

  const columns = [
    { key: 'key',           label: 'Key',           type: 'text' },
    { key: 'value_numeric', label: 'Numeric',       type: 'number' },
    { key: 'value_json',    label: 'JSON',          type: 'json' },
    { key: 'effective_from',label: 'Effective from',type: 'text' },
    { key: 'notes',         label: 'Notes',         type: 'text' },
  ];

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('admin.rates')}</h1>
      <p className='text-sm text-slate-600'>
        Source-of-truth comp parameters. Tabs by scheme. Khater fills exact BD rates here from <code className='bg-slate-100 px-1 rounded'>BD-Commission-Calculator.xlsx</code>; everything else from the calculator file.
      </p>
      <div className='flex flex-wrap gap-2 border-b pb-2'>
        {schemes.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-3 py-1.5 rounded text-sm ${active === s.id ? 'bg-mrkoon text-white' : 'bg-white border'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <ConfigEditor
        schema='config'
        table='compensation_rates'
        columns={columns}
        keyCols={['id']}
        filter={{ scheme_ref: active }}
        orderBy='key'
        newRow={{ scheme_ref: active, key: 'new_key', value_numeric: 0 }}
      />
    </div>
  );
}
