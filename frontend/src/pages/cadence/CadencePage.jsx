import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

const cadences = [
  { id: 'daily',     labelKey: 'kpi.daily' },
  { id: 'weekly',    labelKey: 'kpi.weekly' },
  { id: 'monthly',   labelKey: 'kpi.monthly' },
  { id: 'quarterly', labelKey: 'kpi.quarterly' },
  { id: 'annual',    labelKey: 'kpi.annual' },
];

function useKPIsByFrequency(freq) {
  return useQuery({
    queryKey: ['kpis.byFreq', freq],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpis')
        .select('id, name_en, name_ar, target_value, unit, weight_default, weight_type_default')
        .eq('frequency', freq)
        .order('id');
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useRecentActuals(freq) {
  return useQuery({
    queryKey: ['actuals.byFreq', freq],
    queryFn: async () => {
      // Join via kpi.frequency=freq via supabase nested filter
      const { data, error } = await supabase
        .schema('track')
        .from('kpi_actuals')
        .select('id, kpi_id, employee_id, period_id, actual_value, override_comment, updated_at, kpi:kpis!inner(id, name_en, name_ar, frequency, target_value), employee:users(full_name_en, full_name_ar)')
        .order('updated_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      // Filter in JS for the chosen frequency (Supabase nested .eq won't filter parent rows otherwise)
      return (data ?? []).filter(r => r.kpi?.frequency === freq);
    },
  });
}

function trafficLight(actual, target) {
  if (target == null || actual == null) return 'gray';
  const r = Number(actual) / Number(target);
  if (!isFinite(r)) return 'gray';
  if (r >= 1.0) return 'green';
  if (r >= 0.7) return 'amber';
  return 'red';
}

const ragColor = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-rose-500', gray: 'bg-slate-300' };

export default function CadencePage() {
  const { t, lang } = useTranslation();
  const [freq, setFreq] = useState('monthly');
  const kpis = useKPIsByFrequency(freq);
  const actuals = useRecentActuals(freq);

  const ragSummary = (actuals.data ?? []).reduce((acc, r) => {
    const c = trafficLight(r.actual_value, r.kpi?.target_value);
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{lang === 'ar' ? 'الإيقاع' : 'Cadence'}</h1>
        <Link to='/kpis/entry' className='text-sm text-mrkoon hover:underline'>{t('kpi.enter_actuals')} →</Link>
      </div>

      <div className='flex flex-wrap gap-2 border-b pb-2'>
        {cadences.map(c => (
          <button
            key={c.id}
            onClick={() => setFreq(c.id)}
            className={`px-3 py-1.5 rounded text-sm capitalize ${freq === c.id ? 'bg-mrkoon text-white' : 'bg-white border'}`}
          >
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      {/* KPI summary */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{t('kpi.title')}</div>
          <div className='text-2xl font-semibold text-mrkoon'>{kpis.isLoading ? '…' : kpis.data?.length}</div>
          <div className='text-xs text-slate-400'>{lang === 'ar' ? 'مؤشر بهذا التكرار' : 'KPIs at this cadence'}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{lang === 'ar' ? 'إدخالات أخيرة' : 'Recent entries'}</div>
          <div className='text-2xl font-semibold text-mrkoon'>{actuals.isLoading ? '…' : actuals.data?.length ?? 0}</div>
          <div className='text-xs text-slate-400'>{lang === 'ar' ? 'آخر 30' : 'last 30'}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{t('kpi.traffic_green')}</div>
          <div className='text-2xl font-semibold text-emerald-600'>{ragSummary.green ?? 0}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{t('kpi.traffic_amber')}</div>
          <div className='text-2xl font-semibold text-amber-600'>{ragSummary.amber ?? 0}</div>
        </div>
        <div className='border rounded p-3 bg-white'>
          <div className='text-xs text-slate-500'>{t('kpi.traffic_red')}</div>
          <div className='text-2xl font-semibold text-rose-600'>{ragSummary.red ?? 0}</div>
        </div>
      </div>

      {/* KPI list at this cadence */}
      <Card title={`KPIs · ${freq}`}>
        {kpis.isLoading ? <Skeleton count={5} className='h-8' /> : (
          (kpis.data ?? []).length === 0 ? (
            <div className='text-sm text-slate-500'>{lang === 'ar' ? 'لا توجد مؤشرات بهذا التكرار' : 'No KPIs at this cadence'}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>ID</th><th className='text-start'>KPI</th><th className='text-end'>{t('common.target')}</th><th className='text-start'>Type</th><th className='text-end'>{t('common.weight')}</th></tr>
              </thead>
              <tbody>
                {kpis.data?.map(k => (
                  <tr key={k.id} className='border-b last:border-0'>
                    <td className='py-1 font-mono text-xs text-slate-500'>{k.id}</td>
                    <td className='py-1'>{lang === 'ar' ? k.name_ar : k.name_en}</td>
                    <td className='text-end'>{k.target_value ?? '—'} <span className='text-xs text-slate-400'>{k.unit}</span></td>
                    <td className='text-xs'>{k.weight_type_default}</td>
                    <td className='text-end text-xs'>{k.weight_default ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      {/* Recent actuals */}
      <Card title={lang === 'ar' ? 'آخر الإدخالات' : 'Recent entries'}>
        {actuals.isLoading ? <Skeleton count={5} className='h-8' /> : (
          actuals.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{lang === 'ar' ? 'لا توجد إدخالات بعد' : 'No entries yet'}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>{lang === 'ar' ? 'الوقت' : 'When'}</th><th className='text-start'>{lang === 'ar' ? 'الموظف' : 'Employee'}</th><th className='text-start'>KPI</th><th className='text-end'>{t('common.actual')}</th><th className='text-end'>{t('common.target')}</th><th className='text-center'>RAG</th><th className='text-start'>{t('common.comment')}</th></tr>
              </thead>
              <tbody>
                {actuals.data?.map(r => {
                  const c = trafficLight(r.actual_value, r.kpi?.target_value);
                  return (
                    <tr key={r.id} className='border-b last:border-0'>
                      <td className='py-1.5 text-xs text-slate-500 whitespace-nowrap'>{new Date(r.updated_at).toLocaleString()}</td>
                      <td className='text-xs'>{lang === 'ar' ? (r.employee?.full_name_ar || r.employee?.full_name_en) : r.employee?.full_name_en}</td>
                      <td><div className='font-mono text-xs text-slate-500'>{r.kpi_id}</div><div className='text-xs'>{lang === 'ar' ? r.kpi?.name_ar : r.kpi?.name_en}</div></td>
                      <td className='text-end font-medium'>{r.actual_value}</td>
                      <td className='text-end text-xs text-slate-500'>{r.kpi?.target_value ?? '—'}</td>
                      <td className='text-center'><span className={`inline-block w-3 h-3 rounded-full ${ragColor[c]}`} /></td>
                      <td className='text-xs text-slate-500 truncate max-w-[200px]'>{r.override_comment ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </Card>
    </div>
  );
}
