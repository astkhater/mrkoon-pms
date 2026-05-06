import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase.js';

// Fetch all objectives + their KRs, ordered by level (company → department → individual).
// Joins department + period for display. Authenticated user sees rows per RLS.
export function useObjectives() {
  return useQuery({
    queryKey: ['def.objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('objectives')
        .select(`
          id, code, level, title_en, title_ar, description, owner_user_id,
          department_id,
          period_id,
          key_results:key_results ( id, code, title_en, title_ar, target_value, unit, weight, status, parent_kr_id )
        `)
        .order('level')
        .order('code');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['def.departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('departments')
        .select('id, code, name_en, name_ar')
        .order('code');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCyclePeriods() {
  return useQuery({
    queryKey: ['config.cycle_periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('config')
        .from('cycle_periods')
        .select('id, type, label, start_date, end_date, status')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useOKRProgress() {
  return useQuery({
    queryKey: ['calc.vw_okr_progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('calc')
        .from('vw_okr_progress')
        .select('objective_id, progress');
      if (error) {
        // View may return empty if no actuals; treat as []
        if ((error.message || '').includes('schema')) return [];
        throw error;
      }
      return data ?? [];
    },
  });
}
