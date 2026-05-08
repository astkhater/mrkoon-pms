import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase.js';
import ConfigEditor from '../../components/admin/ConfigEditor.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Admin → Config → Assumptions
// Single source of truth for company + department + role-level assumptions.
// Tabs: COMPANY (null department) + each department code.
export default function AssumptionsPanel() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState('COMPANY');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.schema('def').from('departments').select('code, name_en').order('code');
      setDepartments(data || []);
    })();
  }, []);

  const columns = [
    { key: 'functional_role_code', label: 'Role', type: 'text' },
    { key: 'period',               label: 'Period (or null = standing)', type: 'text' },
    { key: 'key',                  label: 'Key', type: 'text' },
    { key: 'value_numeric',        label: 'Value', type: 'number' },
    { key: 'unit',                 label: 'Unit', type: 'text' },
    { key: 'source',               label: 'Source', type: 'text' },
    { key: 'notes',                label: 'Notes', type: 'text' },
  ];

  // COMPANY tab → department_code IS NULL; otherwise filter by code
  const isCompanyView = activeDept === 'COMPANY';
  const filter = isCompanyView ? { department_code: null } : { department_code: activeDept };
  const newRow = isCompanyView
    ? { department_code: null, period: 'FY2026', key: 'new_assumption' }
    : { department_code: activeDept, period: 'FY2026', key: 'new_assumption' };

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>Assumptions</h1>
      <p className='text-sm text-slate-600'>
        Single source of truth for targets, ratios, and operational expectations. Calc views read these to derive KR/KPI thresholds. Edit here propagates everywhere on next read. Payout values live separately in <em>Compensation Inputs</em>.
      </p>
      <div className='flex flex-wrap gap-2 border-b pb-2'>
        <button
          key='COMPANY'
          onClick={() => setActiveDept('COMPANY')}
          className={`px-3 py-1.5 rounded text-sm ${activeDept === 'COMPANY' ? 'bg-mrkoon text-white' : 'bg-white border'}`}
        >
          🏢 Company-wide
        </button>
        {departments.map((d) => (
          <button
            key={d.code}
            onClick={() => setActiveDept(d.code)}
            className={`px-3 py-1.5 rounded text-sm ${activeDept === d.code ? 'bg-mrkoon text-white' : 'bg-white border'}`}
          >
            {d.code} — {d.name_en}
          </button>
        ))}
      </div>
      <ConfigEditor
        schema='config'
        table='assumptions'
        columns={columns}
        keyCols={['id']}
        filter={filter}
        orderBy='key'
        newRow={newRow}
      />
    </div>
  );
}
