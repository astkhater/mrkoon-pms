import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';
import { downloadCSV } from '../../utils/csv.js';

function useMyKPIs(functionalRoleId) {
  return useQuery({
    enabled: !!functionalRoleId,
    queryKey: ['my.kpiList', functionalRoleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpi_role_weights')
        .select('kpi_id, weight, weight_type, kpi:kpis(id, name_en, name_ar, frequency, target_value, unit, weight_type_default, formula_text)')
        .eq('functional_role_id', functionalRoleId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useLibraryKPIs() {
  return useQuery({
    queryKey: ['library.kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpis')
        .select('id, name_en, name_ar, frequency, target_value, unit, weight_type_default')
        .order('id');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function KPIDashboardPage() {
  const { t, lang } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const [view, setView] = useState('mine'); // 'mine' or 'library'
  const isPower = hasAccess(['admin','hr','c_level','dept_head','manager']);
  const mine = useMyKPIs(profile?.functional_role_id);
  const lib = useLibraryKPIs();

  const rows = view === 'mine' ? (mine.data ?? []).map(r => ({ ...r.kpi, weight: r.weight, weight_type: r.weight_type })) : (lib.data ?? []);
  const isLoading = view === 'mine' ? mine.isLoading : lib.isLoading;

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{t('kpi.title')}</h1>
        <div className='flex items-center gap-3'>
          {rows.length > 0 && (
            <button
              onClick={() => downloadCSV(`mrkoon-kpis-${view}-${new Date().toISOString().slice(0,10)}.csv`, rows.filter(Boolean), [
                'id', 'name_en', 'name_ar', 'frequency', 'target_value', 'unit', 'weight_type_default', 'formula_text', 'weight'
              ])}
              className='text-sm text-mrkoon hover:underline'
            >Export CSV</button>
          )}
          <Link to='/kpis/entry' className='text-sm bg-mrkoon text-white px-3 py-1.5 rounded hover:bg-mrkoon-dark'>
            {t('kpi.enter_actuals')} →
          </Link>
        </div>
      </div>

      <div className='flex gap-2 border-b pb-2'>
        <button onClick={() => setView('mine')} className={`px-3 py-1.5 rounded text-sm ${view === 'mine' ? 'bg-mrkoon text-white' : 'bg-white border'}`}>
          {lang === 'ar' ? 'مؤشراتي' : 'My KPIs'}
        </button>
        {isPower && (
          <button onClick={() => setView('library')} className={`px-3 py-1.5 rounded text-sm ${view === 'library' ? 'bg-mrkoon text-white' : 'bg-white border'}`}>
            {t('kpi.library')} ({lib.data?.length ?? '…'})
          </button>
        )}
      </div>

      <Card>
        {isLoading ? <Skeleton count={6} className='h-10' /> : (
          rows.length === 0 ? (
            <div className='text-sm text-slate-500'>{view === 'mine' ? t('kpi.no_kpis_assigned') : t('common.no_data')}</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-xs text-slate-500 border-b'>
                  <tr>
                    <th className='text-start py-2'>ID</th>
                    <th className='text-start'>KPI</th>
                    <th className='text-start'>{t('kpi.frequency')}</th>
                    <th className='text-end'>{t('common.target')}</th>
                    <th className='text-start'>Type</th>
                    {view === 'mine' && <th className='text-end'>{t('common.weight')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(k => k && (
                    <tr key={k.id} className='border-b last:border-0'>
                      <td className='py-1.5 pe-3 font-mono text-xs text-slate-500'>{k.id}</td>
                      <td className='py-1.5 pe-3'>
                        <div className='font-medium'>{lang === 'ar' ? k.name_ar : k.name_en}</div>
                        {k.formula_text && <div className='text-xs text-slate-400'>{k.formula_text}</div>}
                      </td>
                      <td className='py-1.5 pe-3 text-xs text-slate-600 whitespace-nowrap'>{k.frequency}</td>
                      <td className='py-1.5 pe-3 text-end whitespace-nowrap'>{k.target_value ?? '—'} <span className='text-xs text-slate-400'>{k.unit}</span></td>
                      <td className='py-1.5 pe-3'>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          (k.weight_type_default || 'scored') === 'scored' ? 'bg-emerald-100 text-emerald-700' :
                          (k.weight_type_default) === 'gate' ? 'bg-amber-100 text-amber-700' :
                          (k.weight_type_default) === 'monitor' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700'
                        }`}>{k.weight_type_default || 'scored'}</span>
                      </td>
                      {view === 'mine' && <td className='py-1.5 text-end text-xs'>{k.weight ?? '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
