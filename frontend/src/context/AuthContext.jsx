import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    (async () => {
      // Lookup by email (def.users.id may not match auth.users.id for roster-imported employees)
      const { data, error } = await supabase
        .schema('def')
        .from('users')
        .select('id, email, full_name_en, full_name_ar, role_code, functional_role_id, department_id, manager_id, level_id, permissions')
        .eq('email', session.user.email)
        .maybeSingle();
      if (error) console.error('[auth] profile fetch error:', error);
      setProfile(data ?? null);
    })();
  }, [session]);

  // ---- REAL role + permissions (from def.users) ----
  const realRole = profile?.role_code ?? (session && profile === null ? '__loading__' : null);
  const realPermissions = profile?.permissions ?? [];

  // ---- VIEW-AS OVERRIDE (admin-only UI/UX checker mode) ----
  // Client-side only: changes which sidebar items + dashboards render.
  // RLS is unchanged — the underlying user is still the real one, so data access
  // is what the REAL user can see. Used purely for UX preview by admins.
  const [viewAs, setViewAsState] = useState(() => {
    try { return localStorage.getItem('mrk.viewAs') || null; } catch { return null; }
  });
  const setViewAs = (r) => {
    try {
      if (r) localStorage.setItem('mrk.viewAs', r);
      else localStorage.removeItem('mrk.viewAs');
    } catch {}
    setViewAsState(r || null);
  };
  const clearViewAs = () => setViewAs(null);

  // Only admins can engage view-as. Defensive guard if a non-admin somehow has it set.
  const isRealAdmin = realRole === 'admin' || realPermissions.includes('admin');
  const effectiveViewAs = isRealAdmin ? viewAs : null;

  // Effective role/perms used by sideba