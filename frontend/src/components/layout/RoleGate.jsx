import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';

export default function RoleGate({ roles, children }) {
  const { hasAccess, loading } = useAuth();
  const { t } = useLang();
  if (loading) return null;
  if (!hasAccess(roles)) {
    return (
      <div className='p-8 max-w-md mx-auto text-center'>
        <h2 className='text-xl font-semibold text-mrkoon mb-2'>{t('common.no_access_title', 'No access')}</h2>
        <p className='text-slate-600'>{t('common.no_access_body', "You don't have permission to view this page.")}</p>
      </div>
    );
  }
  return children;
}
