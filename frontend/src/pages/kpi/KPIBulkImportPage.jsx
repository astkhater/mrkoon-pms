import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { supabase } from '../../utils/supabase.js';

// Minimal CSV parser — handles quoted fields with comma/quote/newline.
function parseCSV(text) {
  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let cur = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { cur.push(field); field = ''; }
      else if (c === '\r') { /* ignore */ }
      else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
      else { field += c; }
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const dataRows = rows.slice(1).filter(r => r.some(cell => cell !== ''));
  return { headers, rows: dataRows };
}

export default function KPIBulkImportPage() {
  const { lang, t } = useTranslation();
  const { hasAccess } = useAuth();
  const isAllowed = hasAccess(['hr','admin','manager','dept_head']);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // { headers, rows }
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isAllowed) {
    return (
      <div className='p-8 max-w-md mx-auto text-center'>
        <h2 className='text-xl font-semibold text-mrkoon mb-2'>{t('common.no_access_title')}</h2>
        <p className='text-slate-600'>{t('common.no_access_body')}</p>
      </div>
    );
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const text = await f.text();
    setPreview(parseCSV(text));
  }

  async function runImport() {
    if (!preview) return;
    const { headers, rows } = preview;
    // Required columns
    const required = ['employee_email', 'kpi_id', 'period_label', 'actual_value'];
    const missing = required.filter(c => !headers.includes(c));
    if (missing.length) { alert('Missing columns: ' + missing.join(', ')); return; }

    setImporting(true);
    const stats = { ok: 0, skipped: 0, errors: [] };

    // Cache lookups
    const { data: users } = await supabase.schema('def').from('users').select('id, email');
    const userByEmail = Object.fromEntries((users ?? []).map(u => [u.email.toLowerCase(), u.id]));
    const { data: periods } = await supabase.schema('config').from('cycle_periods').select('id, label');
    const periodByLabel = Object.fromEntries((periods ?? []).map(p => [p.label, p.id]));

    const colIdx = Object.fromEntries(headers.map((h, i) => [h, i]));
    for (const row of rows) {
      const email = (row[colIdx.employee_email] || '').trim().toLowerCase();
      const kpiId = (row[colIdx.kpi_id] || '').trim();
      const periodLabel = (row[colIdx.period_label] || '').trim();
      const actualRaw = (row[colIdx.actual_value] || '').trim();
      const comment = colIdx.comment != null ? (row[colIdx.comment] || '').trim() : null;

      if (!email || !kpiId || !periodLabel || actualRaw === '') {
        stats.skipped++;
        continue;
      }
      const empId = userByEmail[email];
      const periodId = periodByLabel[periodLabel];
      const actualValue = Number(actualRaw);
      if (!empId) { stats.errors.push(`Unknown email: ${email}`); continue; }
      if (!periodId) { stats.errors.push(`Unknown period: ${periodLabel}`); continue; }
      if (isNaN(actualValue)) { stats.errors.push(`Bad actual_value: ${actualRaw}`); continue; }

      // Upsert: try update first, fall back to insert
      const { data: existing } = await supabase
        .schema('track').from('kpi_actuals')
        .select('id').eq('kpi_id', kpiId).eq('employee_id', empId).eq('period_id', periodId).maybeSingle();

      const payload = {
        kpi_id: kpiId, employee_id: empId, period_id: periodId,
        actual_value: actualValue, override_comment: comment || null,
      };
      let res;
      if (existing) {
        res = await supabase.schema('track').from('kpi_actuals').update(payload).eq('id', existing.id);
      } else {
        res = await supabase.schema('track').from('kpi_actuals').insert(payload);
      }
      if (res.error) { stats.errors.push(`${email}/${kpiId}/${periodLabel}: ${res.error.message}`); }
      else { stats.ok++; }
    }
    setImporting(false);
    setResult(stats);
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{lang === 'ar' ? 'استيراد القيم الفعلية بكميات' : 'Bulk KPI actuals import'}</h1>
        <Link to='/kpis/entry' className='text-sm text-mrkoon hover:underline'>← {t('kpi.enter_actuals')}</Link>
      </div>

      <Card title={lang === 'ar' ? 'تنسيق الملف' : 'CSV format'}>
        <div className='text-sm space-y-2'>
          <p>{lang === 'ar' ? 'الأعمدة المطلوبة (السطر الأول):' : 'Required header row:'}</p>
          <code className='block bg-slate-100 p-2 rounded font-mono text-xs'>employee_email,kpi_id,period_label,actual_value,comment</code>
          <p className='text-xs text-slate-500'>
            {lang === 'ar'
              ? 'مثال: yassin_hisham@mrkoonapp.com,BD-04,Q2 2026,0.32,تجاوز الهدف'
              : 'Example: yassin_hisham@mrkoonapp.com,BD-04,Q2 2026,0.32,exceeded target'}
          </p>
          <p className='text-xs text-slate-500'>{lang === 'ar' ? 'يقوم بالتحديث إذا كان السجل موجوداً، أو الإضافة إذا لم يكن.' : 'Upserts: updates if (kpi, employee, period) row exists, else inserts.'}</p>
        </div>
      </Card>

      <Card>
        <div className='space-y-3'>
          <input type='file' accept='.csv,text/csv' onChange={onFile} className='block text-sm' />
          {file && preview && (
            <div className='text-sm text-slate-600'>
              <div>{file.name} · {preview.rows.length} {lang === 'ar' ? 'صف' : 'rows'} · {preview.headers.length} {lang === 'ar' ? 'عمود' : 'cols'}</div>
              <div className='text-xs text-slate-400 mt-1'>{preview.headers.join(' · ')}</div>
            </div>
          )}
          <Button onClick={runImport} disabled={!preview || importing} className='bg-mrkoon-accent'>
            {importing ? '…' : (lang === 'ar' ? 'تشغيل الاستيراد' : 'Run import')}
          </Button>
        </div>
      </Card>

      {result && (
        <Card title={lang === 'ar' ? 'النتيجة' : 'Result'}>
          <div className='space-y-1 text-sm'>
            <div className='text-mrkoon-green'>✓ {result.ok} {lang === 'ar' ? 'سطر مستورد' : 'rows imported'}</div>
            {result.skipped > 0 && <div className='text-slate-500'>· {result.skipped} {lang === 'ar' ? 'سطر مهمل (حقول ناقصة)' : 'rows skipped (missing fields)'}</div>}
            {result.errors.length > 0 && (
              <details className='mt-2'>
                <summary className='text-rose-600 cursor-pointer'>✗ {result.errors.length} {lang === 'ar' ? 'خطأ' : 'errors'}</summary>
                <ul className='text-xs text-rose-600 mt-1 list-disc list-inside max-h-48 overflow-y-auto'>
                  {result.errors.slice(0, 50).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </details>
            )}
          </div>
        </Card>
      )}

      {preview && preview.rows.length > 0 && (
        <Card title={lang === 'ar' ? 'معاينة (أول 10 سطور)' : 'Preview (first 10 rows)'}>
          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead className='text-slate-500 border-b'>
                <tr>{preview.headers.map((h, i) => <th key={i} className='text-start py-1 pe-3 font-mono'>{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className='border-b last:border-0'>
                    {r.map((c, j) => <td key={j} className='py-1 pe-3 truncate max-w-[200px]'>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rows.length > 10 && <div className='text-xs text-slate-400 mt-2'>+{preview.rows.length - 10} more rows</div>}
          </div>
        </Card>
      )}
    </div>
  );
}
