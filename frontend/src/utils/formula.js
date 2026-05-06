// Pure-JS evaluator mirroring the Postgres formula schema:
// formula_engine_ref = { type: 'ratio'|'threshold'|'composite', inputs?, expression?, threshold? }
//
// Server (calc.fn_*) is the source of truth for payouts. This client evaluator
// is for live previews and dashboards only.

export function evaluateRatio({ actual, target }) {
  if (target == null || Number(target) === 0) return null;
  return Number(actual) / Number(target);
}

export function evaluateThreshold({ value, threshold }) {
  if (value == null || threshold == null) return null;
  return Number(value) >= Number(threshold);
}

export function trafficLight(ratio, amber = 0.7) {
  if (ratio == null) return 'gray';
  if (ratio >= 1) return 'green';
  if (ratio >= amber) return 'amber';
  return 'red';
}

export function ratingBand(score, bands) {
  if (score == null) return null;
  return bands.find((b) => score >= b.min_score && score <= b.max_score) ?? null;
}

// BD GP Kicker — illustrative client preview; server authoritative
export function bdKicker({ accounts, gp, minAccounts = 13, minGp = 300_000, pct = 0.05 }) {
  if (accounts >= minAccounts && gp >= minGp) return pct * gp;
  return 0;
}
