import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase.js';

// Headcount summary: total active users + breakdown by dept and role.
export function useHeadcountStats() {
  return useQuery({
    queryKey: ['stats.headcount'],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .schema('def')
        .from('users')
        .select('id, role_code, department_id, level_id, active');
      if (error) throw error;

      const { data: depts } = await supabase
        .schema('def')
        .from('departments')
        .select('id, code, name_en, name_ar');

      const active = (users ?? []).filter(u => u.active);
      const total = active.length;

      const byDept = {};
      active.forEach(u => {
        const dept = depts?.find(d => d.id === u.department_id);
        const code = dept?.code ?? 'UNK';
        byDept[code] = (byDept[code] ?? 0) + 1;
      });

      const byRole = {};
      active.forEach(u => {
        byRole[u.role_code] = (byRole[u.role_code] ?? 0) + 1;
      });

      return { total, byDept, byRole, depts: depts ?? [] };
    },
  });
}

// KPI library: total KPIs + breakdown by frequency and weight_type.
export function useKPILibraryStats() {
  return useQuery({
    queryKey: ['stats.kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('kpis')
        .select('id, frequency, weight_type_default');
      if (error) throw error;
      const rows = data ?? [];
      const total = rows.length;
      const byFreq = {};
      const byType = {};
      const byPrefix = {};
      rows.forEach(k => {
        byFreq[k.frequency] = (byFreq[k.frequency] ?? 0) + 1;
        byType[k.weight_type_default] = (byType[k.weight_type_default] ?? 0) + 1;
        const prefix = (k.id.split('-')[0]) || 'UNK';
        byPrefix[prefix] = (byPrefix[prefix] ?? 0) + 1;
      });
      return { total, byFreq, byType, byPrefix };
    },
  });
}

// OKR overview: counts of objectives + KRs by level.
export function useOKRStats() {
  return useQuery({
    queryKey: ['stats.okrs'],
    queryFn: async () => {
      const { data: obj, error: e1 } = await supabase
        .schema('def')
        .from('objectives')
        .select('id, level');
      if (e1) throw e1;
      const { data: kr, error: e2 } = await supabase
        .schema('def')
        .from('key_results')
        .select('id, status');
      if (e2) throw e2;
      const objs = obj ?? [];
      const krs = kr ?? [];
      const objsByLevel = {};
      objs.forEach(o => { objsByLevel[o.level] = (objsByLevel[o.level] ?? 0) + 1; });
      const krsByStatus = {};
      krs.forEach(k => { krsByStatus[k.status] = (krsByStatus[k.status] ?? 0) + 1; });
      return { objCount: objs.length, krCount: krs.length, objsByLevel, krsByStatus };
    },
  });
}

// Recent audit events for system observability.
export function useRecentAudit(limit = 10) {
  return useQuery({
    queryKey: ['stats.audit', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('audit')
        .from('events')
        .select('id, action, schema_name, table_name, row_pk, at')
        .order('at', { ascending: false })
        .limit(limit);
      if (error) {
        // Audit access may be admin-only; treat denial as empty
        if ((error.message || '').toLowerCase().includes('permission')) return [];
        throw error;
      }
      return data ?? [];
    },
  });
}

// Active cycle period (the open one).
export function useActiveCycle() {
  return useQuery({
    queryKey: ['stats.activeCycle'],
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
