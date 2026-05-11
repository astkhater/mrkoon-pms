import React, { useMemo, useState } from 'react';
import ObjectiveCard from './ObjectiveCard.jsx';
import { useObjectives, useDepartments, useOKRProgress, useKRTargets } from '../../hooks/useOKRs.js';
import Empty from '../ui/Empty.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { downloadCSV } from '../../utils/csv.js';

export default function OKRTree() {
  const { t } = useTranslation();
  const { data: objectives, isLoading, error } = useObjectives();
  const { data: departments } = useDepartments();
  const { data: progress } = useOKRProgress();
  const { data: krTargets } = useKRTargets();
  const [filter, setFilter] = useState('all'); // all | company | department | individual

  const filtered = useMemo(() => {
    if (!objectives) return [];
    if (filter === 'all') return objectives;
    return objectives.filter((o) => o.level === filter);
  }, [objectives, filter]);

  if (isLoading) return <Skeleton count={4} className='h-12' />;
  if (error) return <div className='text-bad text-sm'>Error: {error.message}</div>;

  const filters = [
    { id: 'all',         labelKey: 'okr.all_levels' },
    { id: 'company',     labelKey: 'okr.company' },
    { id: 'department',  labelKey: 'okr.department' },
    { id: 'individual',  labelKey: 'okr.individual' },
  ];

  return (
    <div>
      <div className='flex flex-wrap gap-2 border-b pb-2 mb-3 items-center'>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded text-sm ${filter === f.id ? 'bg-mrkoon text-white' : 'bg-white border'}`}
          >
            {t(f.labelKey)}
          </button>
        ))}
        <button
          onClick={() => {
            const rows = [];
            filtered.forEach(o => {
              (o.key_results || []).forEach(kr => {
                const target = krTargets?.[kr.id];
                rows.push({
                  obj_code: o.code,
                  obj_level: o.level,
                  obj_title_en: o.title_en,
                  kr_code: kr.code,
                  kr_title_en: kr.title_en,
                  kr_unit: kr.unit,
                  kr_weight: kr.weight,
                  kr_status: kr.status,
                  formula_ref: target?.formula_ref ?? '',
                  effective_target: target?.effective_target ?? kr.target_value ?? '',
                  static_target: kr.target_value ?? '',
                });
              });
            });
            downloadCSV(`mrkoon-okrs-${new Date().toISOString().slice(0,10)}.csv`, rows);
          }}
          className='ms-auto text-sm text-mrkoon hover:underline'
        >Export CSV</button>
      </div>
      {filtered.length === 0 ? (
        <Empty reason={t('empty.no_okrs')} />
      ) : (
        filtered.map((obj) => (
          <ObjectiveCard
            key={obj.id}
            obj={obj}
            departments={departments}
            progress={progress?.byObj?.[obj.id]}
            krTargets={krTargets?.byId}
          />
        ))
      )}
    </div>
  );
}
