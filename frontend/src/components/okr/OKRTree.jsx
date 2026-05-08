import React, { useMemo, useState } from 'react';
import ObjectiveCard from './ObjectiveCard.jsx';
import { useObjectives, useDepartments, useOKRProgress, useKRTargets } from '../../hooks/useOKRs.js';
import Empty from '../ui/Empty.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

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
      <div className='flex flex-wrap gap-2 border-b pb-2 mb-3'>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded text-sm ${filter === f.id ? 'bg-mrkoon text-white' : 'bg-white border'}`}
          >
            {t(f.labelKey)}
          </button>
        ))}
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
