import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

// Pull KPIs assigned to a given functional_role_id.
function useAssignedKPIs(functionalRoleId) {
  return useQuery({
    enabled: !!functionalRoleId,
    queryKey: ['assignedKpis', functionalRoleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpi_role_weights')
        .select('kpi_id, weight, weight_type, kpi:kpis(id, name_en, name_ar, frequency, target_value, unit, formula_text, weight_type_default)')
        .eq('functional_role_id', functionalRoleId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Roster of employees the current user can write KPIs for.
// Filters at API level: HR/admin = all; manager = direct reports; dept_head = dept members; else = none.
function useEmployeeRoster({ canProxy, isHR, isAdmin, isDeptHead, isManager, userId, deptId }) {
  return useQuery({
    enabled: canProxy && !!userId,
    queryKey: ['kpi.roster', { canProxy, isHR, isAdmin, isDeptHead, isManager, userId, deptId }],
    queryFn: async () => {
      let q = supabase
        .schema('def')
        .from('users')
        .select('id, full_name_en, full_name_ar, functional_role_id, department_id, role_code')
        .eq('active', true)
        .order('full_name_en');
      if (!(isHR || isAdmin)) {
        if (isDeptHead && deptId) {
          q = q.eq('department_id', deptId);
        } else if (isManager) {
          q = q.eq('manager_id', userId);
        } else {
          // No proxy scope — return empty
          return [];
        }
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Open cycle periods grouped by type for the period selector.
function useOpenPeriods() {
  return useQuery({
    queryKey: ['periods.open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('config')
        .from('cycle_periods')
        .select('id, type, label, start_date, end_date, status')
        .eq('status', 'open')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Already-entered actuals for the current employee in the current period.
function useMyActuals(employeeId, periodId) {
  return useQuery({
    enabled: !!employeeId && !!periodId,
    queryKey: ['my.actuals', employeeId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('kpi_actuals')
        .select('id, kpi_id, actual_value, evidence_ref, override_comment, updated_at')
        .eq('employee_id', employeeId)
        .eq('period_id', periodId);
      if (error) throw error;
      const byKpi = {};
      (data ?? []).forEach(r => { byKpi[r.kpi_id] = r; });
      return byKpi;
    },
  });
}

function isOutOfRange(actual, target) {
  if (target == null || actual == null || actual === '') return false;
  const n = Number(actual);
  if (isNaN(n)) return false;
  const t = Number(target);
  if (t === 0) return false;
  const ratio = n / t;
  return ratio < 0.5 || ratio > 1.5;
}

function trafficLight(actual, target) {
  if (target == null || actual == null || actual === '') return 'gray';
  const n = Number(actual);
  if (isNaN(n)) return 'gray';
  const t = Number(target);
  if (t === 0) return 'gray';
  const ratio = n / t;
  if (ratio >= 1.0) return 'green';
  if (ratio >= 0.7) return 'amber';
  return 'red';
}

export default function KPIEntryPage() {
  const { t, lang } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const qc = useQueryClient();
  const canProxy = hasAccess(['hr','admin','manager','dept_head']);
  const [proxyTargetId, setProxyTargetId] = useState(null);
  const roster = useEmployeeRoster({
    canProxy,
    isHR: hasAccess(['hr']),
    isAdmin: hasAccess(['admin']),
    isDeptHead: hasAccess(['dept_head']),
    isManager: hasAccess(['manager']),
    userId: profile?.id,
    deptId: profile?.department_id,
  });

  // Effective target employee — proxy target if set, else self
  const targetEmployee = proxyTargetId ? roster.data?.find(u => u.id === proxyTargetId) : profile;
  const targetFunctionalRoleId = targetEmployee?.functional_role_id;
  const targetEmployeeId = targetEmployee?.id;

  const assigned = useAssignedKPIs(targetFunctionalRoleId);
  const periods = useOpenPeriods();

  // Period selector state
  const [periodId, setPeriodId] = useState(null);
  useEffect(() => {
    if (!periodId && periods.data?.length) {
      // Default to most-recent monthly cycle
      const monthly = periods.data.find(p => p.type === 'monthly') || periods.data[0];
      setPeriodId(monthly?.id);
    }
  }, [periods.data, periodId]);

  const actuals = useMyActuals(targetEmployeeId, periodId);

  // Per-row local edits keyed by kpi_id
  const [edits, setEdits] = useState({});
  function setEdit(kpiId, field, value) {
    setEdits(e => ({ ...e, [kpiId]: { ...(e[kpiId] || {}), [field]: value } }));
  }

  // Filter to KPIs whose frequency matches the chosen period type
  const selectedPeriod = periods.data?.find(p => p.id === periodId);
  const visibleKpis = useMemo(() => {
    if (!assigned.data || !selectedPeriod) return [];
    const wanted = selectedPeriod.type; // monthly|quarterly|annual
    return assigned.data.filter(a => {
      const freq = a.kpi?.frequency;
      if (wanted === 'monthly') return ['daily','weekly','monthly'].includes(freq);
      if (wanted === 'quarterly') return ['quarterly','monthly'].includes(freq);
      if (wanted === 'annual') return true;
      return true;
    });
  }, [assigned.data, selectedPeriod]);

  async function saveRow(kpiId) {
    const e = edits[kpiId];
    if (!e || e.actual == null || e.actual === '') return;
    const target = visibleKpis.find(v => v.kpi_id === kpiId)?.kpi?.target_value;
    const out = isOutOfRange(e.actual, target);
    if (out && !e.comment) {
      alert(t('kpi.out_of_range', 'Value outside expected range — please add a comment.'));
      return;
    }
    const existing = actuals.data?.[kpiId];
    const payload = {
      kpi_id: kpiId,
      employee_id: targetEmployeeId,
      period_id: periodId,
      actual_value: Number(e.actual),
      evidence_ref: e.evidence ?? null,
      override_comment: out ? e.comment : (e.comment ?? null),
    };
    let result;
    if (existing) {
      result = await supabase.schema('track').from('kpi_actuals').update(payload).eq('id', existing.id);
    } else {
      result = await supabase.schema('track').from('kpi_actuals').insert(payload);
    }
    if (result.error) { alert('Save error: ' + result.error.message); return; }
    setEdits(state => { const c = { ...state }; delete c[kpiId]; return c; });
    qc.invalidateQueries({ queryKey: ['my.actuals'] });
  }

  if (!profile) return <Skeleton count={4} className='h-12' />;

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{t('kpi.enter_actuals')}</h1>
        {selectedPeriod && (
          <div className='text-sm text-slate-500'>
            {selectedPeriod.label} <span className='text-xs'>· {selectedPeriod.type}</span>
          </div>
        )}
      </div>

      {/* Proxy target picker — HR/admin/manager can enter on behalf of anyone */}
      {canProxy && (
        <Card>
          <div className='flex items-center gap-2 text-sm flex-wrap'>
            <label className='text-xs text-slate-500'>{lang === 'ar' ? 'إدخال نيابة عن' : 'Enter on behalf of'}:</label>
            <select
              value={proxyTargetId ?? ''}
              onChange={(e) => setProxyTargetId(e.target.value || null)}
              className='border rounded px-2 py-1'
            >
              <option value=''>{lang === 'ar' ? 'نفسي' : 'Myself'}</option>
              {(roster.data ?? []).filter(u => u.id !== profile.id).map(u => (
                <option key={u.id} value={u.id}>
                  {lang === 'ar' ? (u.full_name_ar || u.full_name_en) : u.full_name_en} {u.role_code === 'admin' ? '' : `· ${u.role_code}`}
                </option>
              ))}
            </select>
            {proxyTargetId && (
              <span className='text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700'>
                {lang === 'ar' ? 'وضع الإدخال نيابة' : 'Proxy mode'}
              </span>
            )}
          </div>
        </Card>
      )}

      {!targetFunctionalRoleId && (
        <Card>
          <div className='text-sm text-slate-500'>
            {proxyTargetId
              ? (lang === 'ar' ? 'هذا الموظف ليس له دور وظيفي محدد، فلا يوجد مؤشرات معينة.' : 'This employee has no functional role assigned — no KPIs to enter.')
              : (lang === 'ar' ? 'لم يتم تعيين دور وظيفي لحسابك. اطلب من الموارد البشرية إدخال البيانات نيابة عنك أو تعيين دور.' : 'No functional role assigned. Ask HR to enter on your behalf or assign a role.')}
          </div>
        </Card>
      )}

      {/* Period selector */}
      <div className='flex flex-wrap gap-2 border-b pb-2'>
        {periods.isLoading ? <Skeleton count={2} className='h-8 w-24' /> : (
          (periods.data ?? []).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodId(p.id)}
              className={`px-3 py-1.5 rounded text-sm ${periodId === p.id ? 'bg-mrkoon text-white' : 'bg-white border'}`}
            >
              {p.label} <span className='text-xs opacity-75'>· {p.type}</span>
            </button>
          ))
        )}
      </div>

      {/* KPI entry table */}
      <Card>
        {(assigned.isLoading || actuals.isLoading) ? <Skeleton count={6} className='h-12' /> : (
          visibleKpis.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('kpi.no_kpis_assigned')}</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-xs text-slate-500 border-b'>
                  <tr>
                    <th className='text-start py-2'>KPI</th>
                    <th className='text-start'>{t('kpi.frequency')}</th>
                    <th className='text-end'>{t('common.target')}</th>
                    <th className='text-end'>{t('common.actual')}</th>
                    <th className='text-center w-12'>RAG</th>
                    <th className='text-start'>{t('common.comment')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleKpis.map(a => {
                    const k = a.kpi;
                    if (!k) return null;
                    const existing = actuals.data?.[k.id];
                    const editVal = edits[k.id]?.actual ?? existing?.actual_value ?? '';
                    const editComment = edits[k.id]?.comment ?? existing?.override_comment ?? '';
                    const dirty = !!edits[k.id];
                    const rag = trafficLight(editVal, k.target_value);
                    const outOfRange = isOutOfRange(editVal, k.target_value);
                    const ragColor = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-rose-500', gray: 'bg-slate-300' }[rag];
                    return (
                      <tr key={k.id} className='border-b last:border-0 align-top'>
                        <td className='py-2 pe-3'>
                          <div className='font-mono text-xs text-slate-500'>{k.id}</div>
                          <div className='font-medium'>{lang === 'ar' ? k.name_ar : k.name_en}</div>
                          {k.formula_text && <div className='text-xs text-slate-400 mt-0.5'>{k.formula_text}</div>}
                        </td>
                        <td className='py-2 text-xs text-slate-600 whitespace-nowrap'>{k.frequency}</td>
                        <td className='py-2 text-end whitespace-nowrap'>{k.target_value ?? '—'} <span className='text-xs text-slate-400'>{k.unit}</span></td>
                        <td className='py-2 text-end'>
                          <input
                            type='number'
                            value={editVal}
                            onChange={(e) => setEdit(k.id, 'actual', e.target.value)}
                            className='border rounded px-2 py-1 w-24 text-end'
                            placeholder='—'
                          />
                        </td>
                        <td className='py-2 text-center'>
                          <span className={`inline-block w-3 h-3 rounded-full ${ragColor}`} title={rag} />
                        </td>
                        <td className='py-2 pe-3'>
                          <input
                            type='text'
                            value={editComment}
                            onChange={(e) => setEdit(k.id, 'comment', e.target.value)}
                            className={`border rounded px-2 py-1 w-full ${outOfRange ? 'border-rose-400' : ''}`}
                            placeholder={outOfRange ? (lang === 'ar' ? 'مطلوب: السبب' : 'Required: explain') : (lang === 'ar' ? 'اختياري' : 'optional')}
                          />
                        </td>
                        <td className='py-2'>
                          {dirty && <Button onClick={() => saveRow(k.id)} className='text-xs'>{t('common.save')}</Button>}
                          {!dirty && existing && <span className='text-xs text-slate-400'>✓ {new Date(existing.updated_at).toLocaleDateString()}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
