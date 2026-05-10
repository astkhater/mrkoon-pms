import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase.js';

export function useNotifications(recipientId, includeRead = false) {
  return useQuery({
    enabled: !!recipientId,
    queryKey: ['notifications', recipientId, includeRead],
    refetchInterval: 30000, // 30s polling for live updates
    queryFn: async () => {
      let q = supabase
        .schema('track')
        .from('notifications')
        .select('id, kind, ref_schema, ref_table, ref_id, title_en, title_ar, body_en, body_ar, link_url, read_at, dismissed_at, created_at')
        .eq('recipient_id', recipientId)
        .is('dismissed_at', null);
      if (!includeRead) q = q.is('read_at', null);
      q = q.order('created_at', { ascending: false }).limit(50);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useNotificationActions() {
  const qc = useQueryClient();
  return {
    async markRead(id) {
      const { error } = await supabase.schema('track').from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    async dismiss(id) {
      const { error } = await supabase.schema('track').from('notifications').update({ dismissed_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    async markAllRead(recipientId) {
      const { error } = await supabase.schema('track').from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', recipientId)
        .is('read_at', null);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  };
}
