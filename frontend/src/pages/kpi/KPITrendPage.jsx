import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function useKPI(kpiId) {
  return useQuery({
    enabled: !!kpiId,
    queryKey: ['kpi.def', kpiId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def').from('kpis')
        .select('id, name_en, name_ar, frequency, target_value, unit, formula_text, weight_type_default')
        .eq('id', kpiId).single();
      if (error) throw error;
      return data;
    },
  });
}

function useEffectiveTarget(kpiId) {
  return useQuery({
    enabled: !!kpiId,
    queryKey: ['calc.kpi_target', kpiId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('calc').from('vw_kpi_target')
        .select('effective_target, formula_ref')
        .eq('id', kpiId).maybeSingle();
      if (error) return { effective_target: null, formula_ref: null };
      return data ?? {};
    },
  });
}

function useTrend(kpiId, employeeId) {
  return useQuery({
    enabled: !!kpiId,
    queryKey: ['trend', kpiId, employeeId],
    queryFn: async () => {
      let q = supabase
        .schema('track').from('kpi_actuals')
        .select('actual_value, override_comment, period:cycle_periods(id, label, type, start_date), employee:users(full_name_en, full_name_ar)')
        .eq('kpi_id', kpiId);
      if (employeeId) q = q.eq('employee_id', employeeId);
      const { data, error } = await q;
      if (error) throw error;
      // Sort by period start_date ascending
      return (data ?? []).slice().sort((a, b) =>
        new Date(a.period?.start_date ?? 0) - new Date(b.period?.start_date ?? 0)
      );
    },
  });
}

function useEmployeesForKPI(kpiId) {
  return useQuery({
    enabled: !!kpiId,
    queryKey: ['kpi.employees', kpiId],
    queryFn: async () => {
      // Employees who have submitted an actual for this KPI
      const { data, error } = await supabase
        .schema('track').from('kpi_actuals')
        .select('employee_id, employee:users(id, full_name_en, full_name_ar)')
        .eq('kpi_id', kpiId);
      if (error) return [];
      const map = {};
      (data ?? []).forEach(r => { if (r.employee) map[r.employee.id] = r.employee; });
      return Object.values(map);
    },
  });
}

export default function KPITrendPage() {
  const { kpiId } = useParams();
  const { lang, t } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const [employeeId, setEmployeeId] = useState(profile?.id ?? '');
  const canScope = hasAccess(['hr','admin','manager','dept_head','c_level','finance']);

  const kpi = useKPI(kpiId);
  const target = useEffectiveTarget(kpiId);
  const trend = useTrend(kpiId, employeeId || null);
  const emps = useEmployeesForKPI(kpiId);

  const effectiveTarget = target.data?.effective_target ?? kpi.data?.target_value;
  const formulaRef = target.data?.formula_ref;

  // Chart data
  const { width, height, padding, bars, max } = useMemo(() => {
    const w = 700, h = 280, p = { l: 50, r: 20, t: 20, b: 50 };
    const rows = trend.data ?? [];
    const max = Math.max(effectiveTarget ?? 0, ...rows.map(r => Number(r.actual_value || 0)), 1);
    const chartW = w - p.l - p.r;
    const chartH = h - p.t - p.b;
    const barW = rows.length ? Math.min(60, chartW / rows.length - 8) : 0;
    const bars = rows.map((r, i) => {
      const v = Number(r.actual_value || 0);
      const bh = (v / max) * chartH;
      return {
        x: p.l + (chartW / Math.max(rows.length, 1)) * i + 4,
        y: h - p.b - bh,
        w: barW,
        h: bh,
        value: v,
        label: r.period?.label ?? '',
        comment: r.override_comment,
      };
    });
    return { width: w, height: h, padding: p, bars, max };
  }, [trend.data, effectiveTarget]);

  const targetY = effectiveTarget != null ? height - padding.b - ((Number(effectiveTarget) / max) * (height - padding.t - padding.b)) : null;

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <div>
          <Link to='/kpis' className='text-xs text-mrkoon hover:underline'>← {t('kpi.title')}</Link>
          <h1 className='text-2xl font-semibold mt-1'>
            {lang === 'ar' ? (kpi.data?.name_ar || kpi.data?.name_en) : kpi.data?.name_en}
            <span className='font-mono text-sm text-slate-500 ms-2'>{kpiId}</span>
          </h1>
          {kpi.data && <div className='text-xs text-slate-500 mt-0.5'>{kpi.data.frequency} · {kpi.data.weight_type_default}</div>}
        </div>
        <div className='text-end text-sm'>
          <div><span className='text-xs text-slate-500'>{t('common.target')}: </span><span className={`font-semibold ${formulaRef ? 'text-mrkoon-accent' : 'text-mrkoon'}`}>{effectiveTarget ?? '—'} {kpi.data?.unit ?? ''}</span></div>
          {formulaRef && <div className='text-[10px] text-mrkoon-accent'>↻ {formulaRef}</div>}
        </div>
      </div>

      {canScope && (emps.data?.length ?? 0) > 1 && (
        <Card>
          <div className='flex items-center gap-2 text-sm'>
            <label className='text-xs text-slate-500'>{lang === 'ar' ? 'الموظف' : 'Employee'}</label>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className='border rounded px-2 py-1'>
              <option value=''>{lang === 'ar' ? 'الكل' : 'All employees'}</option>
              {(emps.data ?? []).map(u => (
                <option key={u.id} value={u.id}>{lang === 'ar' ? (u.full_name_ar || u.full_name_en) : u.full_name_en}</option>
              ))}
            </select>
          </div>
        </Card>
      )}

      <Card title={lang === 'ar' ? 'الاتجاه عبر الفترات' : 'Trend across periods'}>
        {trend.isLoading || kpi.isLoading ? <Skeleton count={4} className='h-12' /> : (
          (trend.data ?? []).length === 0 ? (
            <div className='text-sm text-slate-500'>{lang === 'ar' ? 'لا توجد قيم بعد لهذا المؤشر.' : 'No actuals recorded for this KPI yet.'}</div>
          ) : (
            <svg viewBox={`0 0 ${width} ${height}`} className='w-full' style={{ maxHeight: 320 }}>
              {/* Axes */}
              <line x1={padding.l} y1={height - padding.b} x2={width - padding.r} y2={height - padding.b} stroke='#cbd5e1' strokeWidth='1' />
              <line x1={padding.l} y1={padding.t} x2={padding.l} y2={height - padding.b} stroke='#cbd5e1' strokeWidth='1' />
              {/* Target reference line */}
              {targetY != null && (
                <>
                  <line x1={padding.l} y1={targetY} x2={width - padding.r} y2={targetY} stroke='#42B564' strokeDasharray='4 3' strokeWidth='1.5' />
                  <text x={width - padding.r} y={targetY - 4} textAnchor='end' fontSize='10' fill='#42B564'>target {effectiveTarget}</text>
                </>
              )}
              {/* Bars */}
              {bars.map((b, i) => {
                const hit = effectiveTarget != null && b.value >= Number(effectiveTarget);
                const ratio = effectiveTarget ? b.value / Number(effectiveTarget) : 1;
                const color = effectiveTarget == null ? '#1A2B3D' : ratio >= 1.0 ? '#42B564' : ratio >= 0.7 ? '#f59e0b' : '#dc2626';
                return (
                  <g key={i}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={color} rx='2' />
                    <text x={b.x + b.w / 2} y={b.y - 4} textAnchor='middle' fontSize='10' fill='#475569'>{b.value}</text>
                    <text x={b.x + b.w / 2} y={height - padding.b + 14} textAnchor='middle' fontSize='10' fill='#64748b'>{b.label}</text>
                  </g>
                );
              })}
              {/* Y-axis ticks */}
              {[0, 0.5, 1].map(t => {
                const y = height - padding.b - t * (height - padding.t - padding.b);
                return (
                  <g key={t}>
                    <line x1={padding.l - 4} y1={y} x2={padding.l} y2={y} stroke='#cbd5e1' />
                    <text x={padding.l - 8} y={y + 3} textAnchor='end' fontSize='10' fill='#94a3b8'>{(t * max).toFixed(t === 0 ? 0 : 1)}</text>
                  </g>
                );
              })}
            </svg>
          )
        )}
      </Card>

      <Card title={lang === 'ar' ? 'القيم' : 'Values'}>
        {(trend.data ?? []).length === 0 ? (
          <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
        ) : (
          <table className='w-full text-sm'>
            <thead className='text-xs text-slate-500 border-b'>
              <tr><th className='text-start py-1'>{t('common.period')}</th><th className='text-end'>{t('common.actual')}</th><th className='text-end'>vs {t('common.target')}</th><th className='text-start'>{t('common.comment')}</th></tr>
            </thead>
            <tbody>
              {(trend.data ?? []).map((r, i) => {
                const ratio = effectiveTarget ? Number(r.actual_value) / Number(effectiveTarget) : null;
                return (
                  <tr key={i} className='border-b last:border-0'>
                    <td className='py-1.5'>{r.period?.label} <span className='text-xs text-slate-400'>· {r.period?.type}</span></td>
                    <td className='text-end font-medium'>{r.actual_value}</td>
                    <td className='text-end text-xs text-slate-500'>{ratio != null ? `${(ratio * 100).toFixed(0)}%` : '—'}</td>
                    <td className='text-xs text-slate-500 max-w-[300px] truncate'>{r.override_comment ?? ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
