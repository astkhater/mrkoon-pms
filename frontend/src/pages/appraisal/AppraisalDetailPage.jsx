import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function useAppraisal(id) {
  return useQuery({
    enabled: !!id,
    queryKey: ['appraisal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('appraisals')
        .select(`id, cycle_id, employee_id, status,
          self_score, manager_score, dept_head_score, goals_score, final_rating,
          self_reflection, manager_comment, dept_head_comment, goals_comment,
          hr_signoff, signed_off_at,
          cycle:appraisal_cycles(type, period:cycle_periods(label, type)),
          employee:users(full_name_en, full_name_ar, manager_id, role_code)`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
function useKpiScores(appraisalId) {
  return useQuery({
    enabled: !!appraisalId,
    queryKey: ['appraisal_kpi_scores', appraisalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('appraisal_kpi_scores')
        .select('id, kpi_id, self_rating, manager_rating, weight_used, weight_type_used, comment, kpi:kpis(name_en, name_ar)')
        .eq('appraisal_id', appraisalId);
      if (error) throw error;
      return data ?? [];
    },
  });
}
function useCompetencyScores(appraisalId) {
  return useQuery({
    enabled: !!appraisalId,
    queryKey: ['appraisal_comp_scores', appraisalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('track')
        .from('appraisal_competency_scores')
        .select('id, competency_id, self_rating, manager_rating, comment, competency:competencies(name_en, name_ar, code)')
        .eq('appraisal_id', appraisalId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

const statusOrder = ['draft','submitted','manager_reviewed','calibrated','hr_signoff','closed'];
function statusIndex(s) { return statusOrder.indexOf(s); }

export default function AppraisalDetailPage() {
  const { id } = useParams();
  const { t, lang } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const qc = useQueryClient();
  const a = useAppraisal(id);
  const kpis = useKpiScores(id);
  const comps = useCompetencyScores(id);

  const isMine = profile?.id === a.data?.employee_id;
  const isMyManager = profile?.id === a.data?.employee?.manager_id;
  const isHR = hasAccess(['hr','admin']);
  const isDeptHead = hasAccess(['dept_head','admin']);

  const [edit, setEdit] = useState({});
  function setRating(table, rowId, field, val) {
    setEdit(e => ({ ...e, [`${table}:${rowId}`]: { ...(e[`${table}:${rowId}`] || {}), [field]: val } }));
  }
  async function saveScore(table, row, fields) {
    const patch = {};
    for (const f of fields) {
      const k = `${table}:${row.id}`;
      if (edit[k] && edit[k][f] !== undefined) patch[f] = edit[k][f];
    }
    if (Object.keys(patch).length === 0) return;
    const { error } = await supabase.schema('track').from(table).update(patch).eq('id', row.id);
    if (error) { alert('Save error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: [`appraisal_${table.includes('comp') ? 'comp' : 'kpi'}_scores`] });
  }
  async function saveAppraisal(patch) {
    const { error } = await supabase.schema('track').from('appraisals').update(patch).eq('id', id);
    if (error) { alert('Save error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['appraisal', id] });
  }
  async function transition(newStatus) {
    const patch = { status: newStatus };
    if (newStatus === 'hr_signoff') { patch.hr_signoff = true; patch.signed_off_at = new Date().toISOString(); }
    await saveAppraisal(patch);
  }

  if (a.isLoading) return <Skeleton count={4} className='h-12' />;
  if (a.error) return <div className='text-bad'>Error: {a.error.message}</div>;
  if (!a.data) return <div>Not found</div>;

  const status = a.data.status;
  const employeeName = lang === 'ar' ? (a.data.employee?.full_name_ar || a.data.employee?.full_name_en) : a.data.employee?.full_name_en;
  const cycleType = a.data.cycle?.type;
  const cycleLabel = a.data.cycle?.period?.label;

  // Stage gating
  const canSelf  = isMine && statusIndex(status) <= statusIndex('draft');
  const canMgr   = (isMyManager || hasAccess(['admin'])) && statusIndex(status) >= statusIndex('submitted') && statusIndex(status) <= statusIndex('submitted');
  const canDept  = isDeptHead && statusIndex(status) >= statusIndex('manager_reviewed') && statusIndex(status) <= statusIndex('calibrated');
  const canHRSign = isHR && statusIndex(status) >= statusIndex('calibrated') && status !== 'closed';

  return (
    <div className='space-y-6'>
      <div className='flex items-baseline justify-between'>
        <div>
          <Link to='/appraisals' className='text-xs text-mrkoon hover:underline'>← {t('appraisal.title')}</Link>
          <h1 className='text-2xl font-semibold mt-1'>{employeeName} — {cycleLabel} <span className='text-sm font-normal text-slate-500 ms-2'>({cycleType})</span></h1>
        </div>
        <span className='text-xs px-2 py-1 rounded bg-slate-100 font-mono'>{status}</span>
      </div>

      {/* Stage progress */}
      <div className='flex items-center gap-1 text-xs'>
        {statusOrder.map((s, i) => (
          <React.Fragment key={s}>
            <span className={`px-2 py-0.5 rounded ${statusIndex(status) >= i ? 'bg-mrkoon-accent text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</span>
            {i < statusOrder.length - 1 && <span className='text-slate-300'>→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Self-assessment */}
      <Card title={t('appraisal.self_assessment')}>
        <div className='space-y-3'>
          <div>
            <label className='block text-xs text-slate-500'>{t('appraisal.self_reflection')}</label>
            <textarea
              defaultValue={a.data.self_reflection ?? ''}
              onBlur={e => canSelf && saveAppraisal({ self_reflection: e.target.value })}
              disabled={!canSelf}
              className='w-full border rounded p-2 text-sm'
              rows={3}
            />
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-xs text-slate-500'>{lang === 'ar' ? 'تقييم ذاتي' : 'Self score'}</label>
            <input
              type='number' step='0.1' min='1' max='5'
              defaultValue={a.data.self_score ?? ''}
              onBlur={e => canSelf && saveAppraisal({ self_score: e.target.value === '' ? null : Number(e.target.value) })}
              disabled={!canSelf}
              className='border rounded px-2 py-1 w-24'
            />
            {canSelf && (
              <Button onClick={() => transition('submitted')} className='ms-auto bg-mrkoon-accent'>
                {t('appraisal.submit_to_manager')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* KPI scores */}
      <Card title={`KPIs (70% — ${cycleType === 'annual' ? 'aggregated Q1-Q4' : 'this cycle'})`}>
        {kpis.isLoading ? <Skeleton count={3} className='h-8' /> : (
          kpis.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>KPI</th><th className='text-start'>Type</th><th className='text-end'>Weight</th><th className='text-end'>Self</th><th className='text-end'>Mgr</th><th /></tr>
              </thead>
              <tbody>
                {kpis.data?.map(s => (
                  <tr key={s.id} className='border-b last:border-0'>
                    <td className='py-1.5'><div className='font-mono text-xs text-slate-500'>{s.kpi_id}</div><div>{lang === 'ar' ? s.kpi?.name_ar : s.kpi?.name_en}</div></td>
                    <td className='text-xs'>{s.weight_type_used}</td>
                    <td className='text-end text-xs'>{s.weight_used ?? '—'}</td>
                    <td className='text-end'>
                      <input type='number' step='0.1' min='1' max='5' defaultValue={s.self_rating ?? ''} disabled={!canSelf}
                        onBlur={e => setRating('appraisal_kpi_scores', s.id, 'self_rating', e.target.value === '' ? null : Number(e.target.value))}
                        className='w-16 border rounded px-1 py-0.5 text-end' />
                    </td>
                    <td className='text-end'>
                      <input type='number' step='0.1' min='1' max='5' defaultValue={s.manager_rating ?? ''} disabled={!canMgr}
                        onBlur={e => setRating('appraisal_kpi_scores', s.id, 'manager_rating', e.target.value === '' ? null : Number(e.target.value))}
                        className='w-16 border rounded px-1 py-0.5 text-end' />
                    </td>
                    <td className='text-end'>
                      {(canSelf || canMgr) && (edit[`appraisal_kpi_scores:${s.id}`] && <Button onClick={() => saveScore('appraisal_kpi_scores', s, ['self_rating','manager_rating'])} className='text-xs'>{t('common.save')}</Button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      {/* Competency scores */}
      <Card title={`${t('appraisal.competencies')} (20%)`}>
        {comps.isLoading ? <Skeleton count={3} className='h-8' /> : (
          comps.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr><th className='text-start py-1'>{lang === 'ar' ? 'الكفاءة' : 'Competency'}</th><th className='text-end'>Self</th><th className='text-end'>Mgr</th><th /></tr>
              </thead>
              <tbody>
                {comps.data?.map(s => (
                  <tr key={s.id} className='border-b last:border-0'>
                    <td className='py-1.5'><div className='font-mono text-xs text-slate-500'>{s.competency?.code}</div><div>{lang === 'ar' ? s.competency?.name_ar : s.competency?.name_en}</div></td>
                    <td className='text-end'>
                      <input type='number' step='0.1' min='1' max='5' defaultValue={s.self_rating ?? ''} disabled={!canSelf}
                        onBlur={e => setRating('appraisal_competency_scores', s.id, 'self_rating', e.target.value === '' ? null : Number(e.target.value))}
                        className='w-16 border rounded px-1 py-0.5 text-end' />
                    </td>
                    <td className='text-end'>
                      <input type='number' step='0.1' min='1' max='5' defaultValue={s.manager_rating ?? ''} disabled={!canMgr}
                        onBlur={e => setRating('appraisal_competency_scores', s.id, 'manager_rating', e.target.value === '' ? null : Number(e.target.value))}
                        className='w-16 border rounded px-1 py-0.5 text-end' />
                    </td>
                    <td className='text-end'>
                      {(canSelf || canMgr) && (edit[`appraisal_competency_scores:${s.id}`] && <Button onClick={() => saveScore('appraisal_competency_scores', s, ['self_rating','manager_rating'])} className='text-xs'>{t('common.save')}</Button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>

      {/* Manager review section */}
      <Card title={t('appraisal.manager_review')}>
        <div className='space-y-3'>
          <div>
            <label className='block text-xs text-slate-500'>{t('appraisal.manager_comment')}</label>
            <textarea
              defaultValue={a.data.manager_comment ?? ''}
              onBlur={e => canMgr && saveAppraisal({ manager_comment: e.target.value })}
              disabled={!canMgr}
              className='w-full border rounded p-2 text-sm'
              rows={3}
            />
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-xs text-slate-500'>Manager score</label>
            <input
              type='number' step='0.1' min='1' max='5'
              defaultValue={a.data.manager_score ?? ''}
              onBlur={e => canMgr && saveAppraisal({ manager_score: e.target.value === '' ? null : Number(e.target.value) })}
              disabled={!canMgr}
              className='border rounded px-2 py-1 w-24'
            />
            <label className='text-xs text-slate-500 ms-3'>Goals (10%)</label>
            <input
              type='number' step='0.1' min='1' max='5'
              defaultValue={a.data.goals_score ?? ''}
              onBlur={e => canMgr && saveAppraisal({ goals_score: e.target.value === '' ? null : Number(e.target.value) })}
              disabled={!canMgr}
              className='border rounded px-2 py-1 w-24'
            />
            {canMgr && (
              <Button onClick={() => transition('manager_reviewed')} className='ms-auto bg-mrkoon-accent'>
                {t('appraisal.submit_to_dept_head')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Dept head review */}
      <Card title={t('appraisal.dept_head_review')}>
        <div className='space-y-3'>
          <div>
            <label className='block text-xs text-slate-500'>{lang === 'ar' ? 'تعليق رئيس القسم' : 'Dept head comment'}</label>
            <textarea
              defaultValue={a.data.dept_head_comment ?? ''}
              onBlur={e => canDept && saveAppraisal({ dept_head_comment: e.target.value })}
              disabled={!canDept}
              className='w-full border rounded p-2 text-sm'
              rows={2}
            />
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-xs text-slate-500'>Dept head score</label>
            <input
              type='number' step='0.1' min='1' max='5'
              defaultValue={a.data.dept_head_score ?? ''}
              onBlur={e => canDept && saveAppraisal({ dept_head_score: e.target.value === '' ? null : Number(e.target.value) })}
              disabled={!canDept}
              className='border rounded px-2 py-1 w-24'
            />
            {canDept && (
              <Button onClick={() => transition('calibrated')} className='ms-auto bg-mrkoon-accent'>
                {t('appraisal.calibration')} →
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* HR sign-off */}
      <Card title={t('appraisal.hr_signoff')}>
        <div className='flex items-center gap-3'>
          <label className='text-xs text-slate-500'>{t('appraisal.final_rating')}</label>
          <input
            type='number' step='0.1' min='1' max='5'
            defaultValue={a.data.final_rating ?? ''}
            onBlur={e => canHRSign && saveAppraisal({ final_rating: e.target.value === '' ? null : Number(e.target.value) })}
            disabled={!canHRSign}
            className='border rounded px-2 py-1 w-24'
          />
          {a.data.hr_signoff && <span className='text-xs text-mrkoon-green'>✓ {lang === 'ar' ? 'معتمد' : 'signed off'} {a.data.signed_off_at ? `· ${new Date(a.data.signed_off_at).toLocaleDateString()}` : ''}</span>}
          {canHRSign && !a.data.hr_signoff && (
            <Button onClick={() => transition('hr_signoff')} className='ms-auto bg-mrkoon-accent'>
              {t('appraisal.approve_all')} →
            </Button>
          )}
          {a.data.hr_signoff && status !== 'closed' && hasAccess(['admin','hr']) && (
            <Button onClick={() => transition('closed')} className='ms-auto'>
              {t('common.close')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
