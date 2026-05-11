// Lightweight CSV export — no dependency.
// Quotes fields containing comma/quote/newline. UTF-8 BOM so Excel detects Arabic correctly.

function csvCell(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCSV(rows, columns) {
  if (!rows?.length) return '';
  const cols = columns || Object.keys(rows[0]);
  const head = cols.map(c => csvCell(typeof c === 'object' ? c.label : c)).join(',');
  const lines = rows.map(r =>
    cols.map(c => {
      if (typeof c === 'object') {
        const v = typeof c.value === 'function' ? c.value(r) : r[c.key];
        return csvCell(v);
      }
      return csvCell(r[c]);
    }).join(',')
  );
  return '﻿' + [head, ...lines].join('\r\n');
}

export function downloadCSV(filename, rows, columns) {
  const blob = new Blob([toCSV(rows, columns)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
