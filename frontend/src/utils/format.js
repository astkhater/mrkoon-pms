// Locale-aware formatting helpers
export function formatNumber(n, lang = 'en') {
  if (n == null) return '—';
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(n);
}

export function formatCurrency(n, lang = 'en', currency = 'EGP') {
  if (n == null) return '—';
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n);
}

export function formatPct(n, lang = 'en') {
  if (n == null) return '—';
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'percent', maximumFractionDigits: 1 }).format(n);
}

export function formatDate(d, lang = 'en') {
  if (!d) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));
}
