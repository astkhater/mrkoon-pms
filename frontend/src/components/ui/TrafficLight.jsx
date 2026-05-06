import React from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';

const map = {
  green: { dot: 'bg-ok',  textKey: 'kpi.traffic_green', icon: '●' },
  amber: { dot: 'bg-warn',textKey: 'kpi.traffic_amber', icon: '◐' },
  red:   { dot: 'bg-bad', textKey: 'kpi.traffic_red',   icon: '○' },
  gray:  { dot: 'bg-slate-300', textKey: 'common.no_data', icon: '–' },
};

// Color + icon + text label per accessibility rule (D-08, ux-standards)
export default function TrafficLight({ status }) {
  const { t } = useTranslation();
  const m = map[status] || map.gray;
  return (
    <span className='inline-flex items-center gap-1.5'>
      <span className={`w-2.5 h-2.5 rounded-full ${m.dot}`} aria-hidden='true' />
      <span className='text-xs' aria-hidden='true'>{m.icon}</span>
      <span className='text-xs text-slate-700'>{t(m.textKey)}</span>
    </span>
  );
}
