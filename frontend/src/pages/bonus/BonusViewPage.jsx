import React, { useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function useSchemes() {
  return useQuery({
    queryKey: ['def.commission_schemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('commission_schemes')
        .select('id, name_en, name_ar, cadence, comp_model, active')
        .eq('active', true)
        .order('id');
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useOpenPeriods() {
  return useQuery({
    queryKey: ['config.cycle_periods.open'],
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

function usePayouts(filter) {
  return useQuery({
    queryKey: ['track.commission_payouts', filter],
    queryFn: async () => {
      let q = supabase
        .schema('track')
        .from('commission_payouts')
        .select('id, scheme_id, period_id, employee_id, total_amount, status, approved_at, exported_at, notes, scheme:commission_schemes(name_en, name_ar, cadence), period:cycle_periods(label, type), employee:users(full_name_en, full_name_ar)');
      if (filter === 'pending') q = q.in('status', ['draft','pending_approval']);
      if (filter === 'approved') q = q.eq('status', 'approved');
      if (filter === 'mine') q = q; // RLS already restricts
      q = q.order('id', { ascending: false }).limit(50);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

const tone = {
  draft: 'bg-amber-100 text-amber-700',
  pending_approval: 'bg-blue-100 text-blue-700',
  approved: 'bg-mrkoon-green-tint text-mrkoon-green',
  rejected: 'bg-rose-100 text-rose-700',
  exported: 'bg-slate-100 text-slate-600',
};

function fmtMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' EGP';
}

export default function BonusViewPage() {
  const { t, lang } = useTranslation();
  const { profile, hasAccess } = useAuth();
  const qc = useQueryClient();
  const [view, setView] = useState(hasAccess(['finance','admin','c_level']) ? 'pending' : 'mine');
  const schemes = useSchemes();
  const payouts = usePayouts(view);
  const periods = useOpenPeriods();
  const isFinance = hasAccess(['finance','admin']);
  const [runPeriodId, setRunPeriodId] = useState('');
  const [runScheme, setRunScheme] = useState('');
  const [running, setRunning] = useState(false);

  async function approve(id) {
    const { error } = await supabase.schema('track').from('commission_payouts').update({
      status: 'approved',
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) { alert('Approve error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['track.commission_payouts'] });
  }
  async function hold(id) {
    const { error } = await supabase.schema('track').from('commission_payouts').update({ status: 'draft' }).eq('id', id);
    if (error) { alert('Hold error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['track.commission_payouts'] });
  }
  async function reject(id) {
    if (!confirm('Reject this payout?')) return;
    const { error } = await supabase.schema('track').from('commission_payouts').update({ status: 'rejected' }).eq('id', id);
    if (error) { alert('Reject error: ' + error.message); return; }
    qc.invalidateQueries({ queryKey: ['track.commission_payouts'] });
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>{t('bonus.title')}</h1>
        {isFinance && <Badge tone='amber'>{t('bonus.finance_only')}</Badge>}
      </div>

      {isFinance && (
        <Card title={lang === 'ar' ? 'تشغيل العمولات لفترة' : 'Run commissions for a period'}>
          <div className='flex flex-wrap gap-2 items-end text-sm'>
            <div>
              <label className='block text-xs text-slate-500'>{t('common.period')}</label>
              <select value={runPeriodId} onChange={e => setRunPeriodId(e.target.value)} className='border rounded px-2 py-1'>
                <option value=''>—</option>
                {(periods.data ?? []).map(p => <option key={p.id} value={p.id}>{p.label} · {p.type}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs text-slate-500'>{lang === 'ar' ? 'المخطط' : 'Scheme'}</label>
              <select value={runScheme} onChange={e => setRunScheme(e.target.value)} className='border rounded px-2 py-1'>
                <option value=''>{lang === 'ar' ? 'الكل' : 'All'}</option>
                <option value='BD'>BD</option>
                <option value='AM'>AM</option>
                <option value='VM'>VM</option>
                <option value='OPS'>OPS field</option>
                <option value='OPS-TL'>OPS TL gates</option>
                <option value='ONB'>Onboarding</option>
                <option value='OPEX'>OpEx (MKT/TECH/FIN/HR)</option>
              </select>
            </div>
            <button
              disabled={!runPeriodId || running}
              onClick={async () => {
                if (!confirm(`Run commissions for the selected period${runScheme ? ' · ' + runScheme : ' (all schemes)'}? This generates draft payouts.`)) return;
                setRunning(true);
                const { data, error } = await supabase.schema('calc').rpc('fn_run_commission_bulk', {
                  p_period_id: runPeriodId,
                  p_scheme_filter: runScheme || null,
                });
                setRunning(false);
                if (error) { alert('Run error: ' + error.message); return; }
                const summary = (data ?? []).map(r => `${r.scheme}: ${r.payouts_created}`).join(' · ') || 'no rows';
                alert('Done. ' + summary);
                qc.invalidateQueries({ queryKey: ['track.commission_payouts'] });
              }}
              className='text-sm bg-mrkoon-accent text-white px-3 py-1.5 rounded disabled:opacity-50'
            >
              {running ? '…' : (lang === 'ar' ? 'تشغيل' : 'Run')}
            </button>
            <span className='text-xs text-slate-400 ms-2'>{lang === 'ar' ? 'يُنشئ مسودات للعمولات لكل موظف مؤهل' : 'Creates draft payouts per eligible employee'}</span>
          </div>
        </Card>
      )}

      <Card title={lang === 'ar' ? 'مخططات العمولة النشطة' : 'Active commission schemes'}>
        {schemes.isLoading ? <Skeleton count={3} className='h-8' /> : (
          schemes.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('common.no_data')}</div>
          ) : (
            <div className='grid md:grid-cols-3 gap-3 text-sm'>
              {schemes.data?.map(s => (
                <div key={s.id} className='border rounded p-3'>
                  <div className='font-mono text-xs text-slate-500'>{s.id}</div>
                  <div className='font-medium'>{lang === 'ar' ? s.name_ar : s.name_en}</div>
                  <div className='flex gap-2 mt-1.5'>
                    <span className='text-xs px-1.5 py-0.5 rounded bg-slate-100'>{s.cadence}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${s.comp_model === 'COGS' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{s.comp_model}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <div className='flex gap-2 border-b pb-2'>
        <button onClick={() => setView('mine')} className={`px-3 py-1.5 rounded text-sm ${view === 'mine' ? 'bg-mrkoon text-white' : 'bg-white border'}`}>
          {lang === 'ar' ? 'دفعاتي' : 'My payouts'}
        </button>
        {isFinance && (
          <>
            <button onClick={() => setView('pending')} className={`px-3 py-1.5 rounded text-sm ${view === 'pending' ? 'bg-mrkoon text-white' : 'bg-white border'}`}>
              {t('bonus.pending')}
            </button>
            <button onClick={() => setView('approved')} className={`px-3 py-1.5 rounded text-sm ${view === 'approved' ? 'bg-mrkoon text-white' : 'bg-white border'}`}>
              {t('bonus.approved_recent')}
            </button>
          </>
        )}
      </div>

      <Card>
        {payouts.isLoading ? <Skeleton count={5} className='h-10' /> : (
          payouts.data?.length === 0 ? (
            <div className='text-sm text-slate-500'>{t('empty.no_payouts')}</div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr>
                  <th className='text-start py-1'>{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'المخطط' : 'Scheme'}</th>
                  <th className='text-start'>{t('common.period')}</th>
                  <th className='text-end'>{t('bonus.total')}</th>
                  <th className='text-start'>{t('common.status')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {payouts.data?.map(p => (
                  <tr key={p.id} className='border-b last:border-0'>
                    <td className='py-1.5'>{lang === 'ar' ? (p.employee?.full_name_ar || p.employee?.full_name_en) : p.employee?.full_name_en}</td>
                    <td className='text-xs'>{lang === 'ar' ? p.scheme?.name_ar : p.scheme?.name_en} <span className='text-slate-400'>· {p.scheme?.cadence}</span></td>
                    <td className='text-xs text-slate-500'>{p.period?.label}</td>
                    <td className='text-end font-medium'>{fmtMoney(p.total_amount)}</td>
                    <td><span className={`text-xs px-1.5 py-0.5 rounded ${tone[p.status] || tone.draft}`}>{p.status}</span></td>
                    <td className='text-end'>
                      {isFinance && p.status === 'pending_approval' && (
                        <div className='flex gap-1 justify-end'>
                          <button onClick={() => approve(p.id)} className='text-xs text-mrkoon-green hover:underline'>{t('bonus.approve')}</button>
                          <button onClick={() => hold(p.id)} className='text-xs text-amber-600 hover:underline'>{t('bonus.hold')}</button>
                          <button onClick={() => reject(p.id)} className='text-xs text-rose-600 hover:underline'>{t('common.reject')}</button>
                        </div>
                      )}
                      {isFinance && p.status === 'draft' && (
                        <button onClick={() => approve(p.id)} className='text-xs text-mrkoon-green hover:underline'>{t('bonus.approve')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </Card>
    </div>
  );
}
