import React, { useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function useAudit({ schemaFilter, tableFilter, actionFilter, limit }) {
  return useQuery({
    queryKey: ['audit.events', schemaFilter, tableFilter, actionFilter, limit],
    queryFn: async () => {
      let q = supabase
        .schema('audit')
        .from('events')
        .select('id, actor, action, schema_name, table_name, row_pk, before_json, after_json, at')
        .order('at', { ascending: false })
        .limit(limit);
      if (schemaFilter) q = q.eq('schema_name', schemaFilter);
      if (tableFilter)  q = q.eq('table_name',  tableFilter);
      if (actionFilter) q = q.eq('action', actionFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

const actionTone = {
  INSERT: 'bg-mrkoon-green-tint text-mrkoon-green',
  UPDATE: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-rose-100 text-rose-700',
};

export default function AuditLogPage() {
  const { t, lang } = useTranslation();
  const [schemaFilter, setSchemaFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [limit, setLimit] = useState(50);
  const events = useAudit({ schemaFilter: schemaFilter || null, tableFilter: tableFilter || null, actionFilter: actionFilter || null, limit });
  const [expanded, setExpanded] = useState(null);

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('nav.audit')}</h1>

      <Card>
        <div className='flex flex-wrap gap-2 items-center text-sm'>
          <select value={schemaFilter} onChange={e => setSchemaFilter(e.target.value)} className='border rounded px-2 py-1'>
            <option value=''>All schemas</option>
            <option value='def'>def</option>
            <option value='config'>config</option>
            <option value='track'>track</option>
            <option value='calc'>calc</option>
          </select>
          <input value={tableFilter} onChange={e => setTableFilter(e.target.value)} placeholder='table name' className='border rounded px-2 py-1' />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className='border rounded px-2 py-1'>
            <option value=''>All actions</option>
            <option value='INSERT'>INSERT</option>
            <option value='UPDATE'>UPDATE</option>
            <option value='DELETE'>DELETE</option>
          </select>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} className='border rounded px-2 py-1'>
            <option value={50}>last 50</option>
            <option value={100}>last 100</option>
            <option value={250}>last 250</option>
          </select>
          {events.isLoading && <span className='text-xs text-slate-400'>loading…</span>}
          {!events.isLoading && <span className='text-xs text-slate-500 ms-auto'>{events.data?.length ?? 0} events</span>}
        </div>
      </Card>

      <Card>
        {events.isLoading ? <Skeleton count={6} className='h-8' /> : (
          events.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr>
                  <th className='text-start py-1'>{lang === 'ar' ? 'الوقت' : 'When'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'الجدول' : 'Table'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'الصف' : 'Row PK'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'الفاعل' : 'Actor'}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {events.data?.map(e => (
                  <React.Fragment key={e.id}>
                    <tr className='border-b last:border-0 hover:bg-slate-50'>
                      <td className='py-1.5 text-xs whitespace-nowrap'>{new Date(e.at).toLocaleString()}</td>
                      <td><span className={`text-xs px-1.5 py-0.5 rounded font-mono ${actionTone[e.action] || ''}`}>{e.action}</span></td>
                      <td className='font-mono text-xs'>{e.schema_name}.{e.table_name}</td>
                      <td className='font-mono text-xs text-slate-500 truncate max-w-[160px]'>{e.row_pk}</td>
                      <td className='font-mono text-xs text-slate-500 truncate max-w-[140px]'>{e.actor ?? '—'}</td>
                      <td><button onClick={() => setExpanded(expanded === e.id ? null : e.id)} className='text-xs text-mrkoon hover:underline'>{expanded === e.id ? '−' : '+'}</button></td>
                    </tr>
                    {expanded === e.id && (
                      <tr className='border-b'>
                        <td colSpan={6} className='py-2 bg-slate-50'>
                          <div className='grid md:grid-cols-2 gap-3 text-xs'>
                            <div>
                              <div className='font-medium mb-1'>before</div>
                              <pre className='bg-white border rounded p-2 overflow-x-auto'>{JSON.stringify(e.before_json, null, 2) ?? '—'}</pre>
                            </div>
                            <div>
                              <div className='font-medium mb-1'>after</div>
                              <pre className='bg-white border rounded p-2 overflow-x-auto'>{JSON.stringify(e.after_json, null, 2) ?? '—'}</pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>
    </div>
  );
}
