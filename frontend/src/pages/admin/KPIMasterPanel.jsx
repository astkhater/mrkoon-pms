import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase.js';
import ConfigEditor from '../../components/admin/ConfigEditor.jsx';
import Card from '../../components/ui/Card.jsx';
import Empty from '../../components/ui/Empty.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Admin → Config → KPI Master — D-36 weight_type enum (scored/monitor/gate/dashboard)
// Two sections:
//   1. KPI catalog (def.kpis) — id, name, frequency, weight_type_default, sop_ref, scheme_ref
//   2. Per-role weights (def.kpi_role_weights) — sum=1.00 enforced for 'scored' rows
export default function KPIMasterPanel() {
  const { t } = useTranslation();
  const [activeRole, setActiveRole] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.schema('def').from('functional_roles').select('id, code, name_en').order('code');
      setRoles(data || []);
      if (data?.length) setActiveRole(data[0].id);
    })();
  }, []);

  const kpiColumns = [
    { key: 'id',                   label: 'ID',         readOnly: true },
    { key: 'name_en',              label: 'Name (EN)',  type: 'text' },
    { key: 'name_ar',              label: 'Name (AR)',  type: 'text' },
    { key: 'frequency',            label: 'Frequency',  type: 'select',
      options: ['daily','weekly','monthly','quarterly','annual'].map((v) => ({ value: v, label: v })) },
    { key: 'weight_type_default',  label: 'Type',       type: 'select',
      options: ['scored','monitor','gate','dashboard'].map((v) => ({ value: v, label: v })) },
    { key: 'weight_default',       label: 'Default weight', type: 'number' },
    { key: 'gate_amount',          label: 'Gate amount (EGP)', type: 'number' },
    { key: 'gate_threshold',       label: 'Gate threshold',     type: 'number' },
    { key: 'sop_ref',              label: 'SOP',        type: 'text' },
    { key: 'scheme_ref',           label: 'Scheme',     type: 'text' },
  ];

  const weightColumns = [
    { key: 'kpi_id',       label: 'KPI', readOnly: true },
    { key: 'weight_type',  label: 'Type', type: 'select',
      options: ['scored','monitor','gate','dashboard'].map((v) => ({ value: v, label: v })) },
    { key: 'weight',       label: 'Weight (scored only)', type: 'number' },
    { key: 'gate_amount',  label: 'Gate amount (gate only)', type: 'number' },
  ];

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>KPI Master</h1>
      <p className='text-sm text-slate-600'>
        Source: <code className='bg-slate-100 px-1 rounded'>okr-kpi-framework-v6-20260502.xlsx</code> KPI Master tab.
        Sum of <strong>scored</strong> weights per role must equal 1.00.
      </p>

      <Card title='KPI Catalog'>
        <ConfigEditor
          schema='def'
          table='kpis'
          columns={kpiColumns}
          keyCols={['id']}
          orderBy='id'
        />
      </Card>

      <Card title='Per-role weights'>
        <div className='flex flex-wrap gap-2 border-b pb-2 mb-3'>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`px-3 py-1.5 rounded text-sm ${activeRole === r.id ? 'bg-mrkoon text-white' : 'bg-white border'}`}
            >
              {r.code}
            </button>
          ))}
        </div>
        {activeRole ? (
          <>
            <SumBanner roleId={activeRole} />
            <ConfigEditor
              schema='def'
              table='kpi_role_weights'
              columns={weightColumns}
              keyCols={['kpi_id', 'functional_role_id']}
              filter={{ functional_role_id: activeRole }}
              orderBy='kpi_id'
              newRow={{ functional_role_id: activeRole, weight_type: 'scored' }}
            />
          </>
        ) : <Empty reason='No roles defined.' />}
      </Card>
    </div>
  );
}

function SumBanner({ roleId }) {
  const [sum, setSum] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .schema('def')
        .from('kpi_role_weights')
        .select('weight, weight_type')
        .eq('functional_role_id', roleId)
        .eq('weight_type', 'scored');
      const s = (data || []).reduce((a, r) => a + Number(r.weight || 0), 0);
      setSum(s);
    })();
  }, [roleId]);
  if (sum == null) return null;
  const ok = Math.abs(sum - 1.0) < 0.005;
  return (
    <div className='mb-3 text-sm'>
      Σ scored weights = <strong>{sum.toFixed(3)}</strong>{' '}
      {ok ? <Badge tone='green'>balanced</Badge> : <Badge tone='red'>must equal 1.000</Badge>}
    </div>
  );
}
