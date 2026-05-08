import React, { useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function useSOPs() {
  return useQuery({
    queryKey: ['def.sops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('sops')
        .select('id, title_en, title_ar, department_id, owner_role_code, cycle, category, last_reviewed, department:departments(code, name_en, name_ar)')
        .order('id');
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useLinks(sopId) {
  return useQuery({
    enabled: !!sopId,
    queryKey: ['sop.links', sopId],
    queryFn: async () => {
      const [kpis, krs] = await Promise.all([
        supabase.schema('def').from('kpi_sop_links').select('kpi_id, kpi:kpis(id, name_en, name_ar)').eq('sop_id', sopId),
        supabase.schema('def').from('kr_sop_links').select('kr_id, kr:key_results(id, code, title_en, title_ar)').eq('sop_id', sopId),
      ]);
      return { kpis: kpis.data ?? [], krs: krs.data ?? [] };
    },
  });
}

export default function SOPIndexPage() {
  const { t, lang } = useTranslation();
  const sops = useSOPs();
  const [selected, setSelected] = useState(null);
  const links = useLinks(selected);

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{t('sop.title')}</h1>

      <div className='grid md:grid-cols-3 gap-4'>
        {/* SOP list */}
        <div className='md:col-span-2'>
          <Card>
            {sops.isLoading ? <Skeleton count={5} className='h-8' /> : (
              sops.data?.length === 0 ? (
                <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
              ) : (
                <table className='w-full text-sm'>
                  <thead className='text-xs text-slate-500 border-b'>
                    <tr>
                      <th className='text-start py-1'>ID</th>
                      <th className='text-start'>{lang === 'ar' ? 'العنوان' : 'Title'}</th>
                      <th className='text-start'>{lang === 'ar' ? 'القسم' : 'Dept'}</th>
                      <th className='text-start'>{t('sop.cycle')}</th>
                      <th className='text-start'>{t('sop.last_reviewed')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sops.data?.map(s => (
                      <tr key={s.id}
                          onClick={() => setSelected(s.id)}
                          className={`border-b last:border-0 cursor-pointer hover:bg-slate-50 ${selected === s.id ? 'bg-mrkoon-green-tint' : ''}`}>
                        <td className='py-1.5 font-mono text-xs text-slate-500'>{s.id}</td>
                        <td>{lang === 'ar' ? (s.title_ar || s.title_en) : s.title_en}</td>
                        <td className='text-xs'>{s.department?.code ?? '—'}</td>
                        <td className='text-xs text-slate-500'>{s.cycle ?? '—'}</td>
                        <td className='text-xs text-slate-500'>{s.last_reviewed ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </Card>
        </div>

        {/* Linked KPIs / KRs panel */}
        <div>
          <Card title={selected ? (lang === 'ar' ? 'مرتبط' : 'Linked items') : (lang === 'ar' ? 'اختر إجراء عمل' : 'Select an SOP')}>
            {!selected ? (
              <div className='text-sm text-slate-400'>{lang === 'ar' ? 'اضغط على إجراء عمل لرؤية المؤشرات والنتائج المرتبطة' : 'Click a SOP to see linked KPIs and KRs'}</div>
            ) : links.isLoading ? <Skeleton count={3} className='h-6' /> : (
              <div className='space-y-3 text-sm'>
                <div>
                  <div className='text-xs text-slate-500 mb-1'>{t('sop.linked_kpis')} ({links.data?.kpis.length ?? 0})</div>
                  {(links.data?.kpis ?? []).length === 0 ? (
                    <div className='text-xs text-slate-400'>{t('common.no_data')}</div>
                  ) : (
                    <ul className='space-y-1'>
                      {links.data?.kpis.map(l => (
                        <li key={l.kpi_id} className='border-l-2 border-mrkoon-green ps-2'>
                          <div className='font-mono text-xs text-slate-500'>{l.kpi_id}</div>
                          <div className='text-xs'>{lang === 'ar' ? l.kpi?.name_ar : l.kpi?.name_en}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className='text-xs text-slate-500 mb-1'>{t('sop.linked_krs')} ({links.data?.krs.length ?? 0})</div>
                  {(links.data?.krs ?? []).length === 0 ? (
                    <div className='text-xs text-slate-400'>{t('common.no_data')}</div>
                  ) : (
                    <ul className='space-y-1'>
                      {links.data?.krs.map(l => (
                        <li key={l.kr_id} className='border-l-2 border-mrkoon-accent ps-2'>
                          <div className='font-mono text-xs text-slate-500'>{l.kr?.code}</div>
                          <div className='text-xs'>{lang === 'ar' ? l.kr?.title_ar : l.kr?.title_en}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
