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

  // Hold off on resolving the role until profile actually loads after a fresh session,
  // otherwise the home redirect routes to the employee fallback.
  const role = profile?.role_code ?? (session && profile === null ? '__loading__' : null);
  const permissions = profile?.permissions ?? [];

  // hasAccess('hr') returns true if role_code='hr' OR 'hr' in permissions array.
  // Used by RoleGate and Sidebar to gate functional pages without forcing role_code
  // to double as both org-position and access-tier.
  function hasAccess(requiredRoles) {
    if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles];
    if (requiredRoles.includes(role)) return true;
    return requiredRoles.some(r => permissions.includes(r));
  }

  async function signInWithMagicLink(email) {
    return await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  }
  async function signOut() { await supabase.auth.signOut(); }

  return (
    <AuthCtx.Provider value={{ session, profile, role, permissions, hasAccess, loading, signInWithMagicLink, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
