import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Empty from '../ui/Empty.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

// Reusable Admin config editor.
// Props:
//   schema    - Postgres schema (e.g. 'config')
//   table     - table name (e.g. 'levels')
//   columns   - [{ key, label, type: 'text'|'number'|'boolean'|'select', options?, readOnly? }]
//   filterUI  - optional ReactNode rendered above the table (tab selectors, etc.)
//   filter    - optional Supabase .eq filter object: { col: value } applied to query
//   orderBy   - column name for sort
//   keyCols   - columns that are the natural primary key (for upsert)
//   newRow    - default object for "Add row"
export default function ConfigEditor({ schema, table, columns, filterUI, filter, orderBy, keyCols = ['id'], newRow }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState({}); // {rowKey: { col: value }}

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let q = supabase.schema(schema).from(table).select('*');
      if (filter) for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
      if (orderBy) q = q.order(orderBy);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) console.error(`[${schema}.${table}]`, error);
      setRows(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [schema, table, JSON.stringify(filter), orderBy]);

  function rowKey(r) { return keyCols.map((k) => r[k] ?? '').join('|'); }
  function setEdit(r, col, val) {
    setEditing((e) => ({ ...e, [rowKey(r)]: { ...(e[rowKey(r)] || {}), [col]: val } }));
  }
  async function saveRow(r) {
    const patch = editing[rowKey(r)];
    if (!patch) return;
    setSaving(true);
    const { error } = await supabase.schema(schema).from(table).update(patch).match(Object.fromEntries(keyCols.map((k) => [k, r[k]])));
    setSaving(false);
    if (error) { alert('Save error: ' + error.message); return; }
    setRows((rs) => rs.map((row) => (rowKey(row) === rowKey(r) ? { ...row, ...patch } : row)));
    setEditing((e) => { const c = { ...e }; delete c[rowKey(r)]; return c; });
  }
  async function addRow() {
    if (!newRow) return;
    const { data, error } = await supabase.schema(schema).from(table).insert(newRow).select().single();
    if (error) { alert('Insert error: ' + error.message); return; }
    setRows((rs) => [...rs, data]);
  }

  return (
    <Card
      title={`${schema}.${table}`}
      action={newRow ? <Button variant='secondary' onClick={addRow}>+ {t('common.save')}</Button> : null}
    >
      {filterUI}
      {loading ? (
        <Skeleton count={5} />
      ) : rows.length === 0 ? (
        <Empty reason={t('common.no_data')} />
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm border-collapse'>
            <thead>
              <tr className='text-left border-b'>
                {columns.map((c) => (
                  <th key={c.key} className='py-2 pr-3 font-medium text-slate-700'>{c.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const dirty = !!editing[rowKey(r)];
                return (
                  <tr key={rowKey(r)} className='border-b align-top'>
                    {columns.map((c) => (
                      <td key={c.key} className='py-2 pr-3'>
                        <CellEditor row={r} col={c} value={editing[rowKey(r)]?.[c.key] ?? r[c.key]} onChange={(v) => setEdit(r, c.key, v)} />
                      </td>
                    ))}
                    <td className='py-2'>
                      {dirty && (
                        <Button onClick={() => saveRow(r)} disabled={saving} className='text-xs'>
                          {t('common.save')}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function CellEditor({ row, col, value, onChange }) {
  if (col.readOnly) return <span className='text-slate-600'>{String(value ?? '')}</span>;
  if (col.type === 'boolean') return <input type='checkbox' checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
  if (col.type === 'number') return <input type='number' value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} className='border rounded px-2 py-1 w-28' />;
  if (col.type === 'select') return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className='border rounded px-2 py-1'>
      <option value=''>—</option>
      {(col.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  if (col.type === 'json') return <textarea rows={2} value={typeof value === 'string' ? value : JSON.stringify(value ?? null)} onChange={(e) => { try { onChange(JSON.parse(e.target.value)); } catch { onChange(e.target.value); } }} className='border rounded px-2 py-1 w-72 font-mono text-xs' />;
  return <input type='text' value={value ?? ''} onChange={(e) => onChange(e.target.value)} className='border rounded px-2 py-1 w-48' />;
}
