import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase.js';
import ConfigEditor from '../../components/admin/ConfigEditor.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Admin → Config → Assumptions — D-34 Khater Q3
// Operational expectations from TaskForce sheets. Drive activity dashboards, NOT payouts.
// Tabs by department; sub-filter by functional role.
export default function AssumptionsPanel() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.schema('def').from('departments').select('code, name_en').order('code');
      setDepartments(data || []);
      if (data?.length) setActiveDept(data[0].code);
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

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>Assumptions</h1>
      <p className='text-sm text-slate-600'>
        Operational expectations (e.g., BD ≥13/qtr → ≥8/month → ~16–20 meetings → ~40–50 qualifying calls). These drive activity dashboards. They do not drive payouts — payout values live in <em>Compensation Inputs</em>.
      </p>
      <div className='flex flex-wrap gap-2 border-b pb-2'>
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
      {activeDept && (
        <ConfigEditor
          schema='config'
          table='assumptions'
          columns={columns}
          keyCols={['id']}
          filter={{ department_code: activeDept }}
          orderBy='key'
          newRow={{ department_code: activeDept, key: 'new_assumption' }}
        />
      )}
    </div>
  );
}
