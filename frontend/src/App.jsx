import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import RoleGate from './components/layout/RoleGate.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Login from './pages/Login.jsx';

import EmployeeDash from './pages/dashboards/EmployeeDash.jsx';
import ManagerDash from './pages/dashboards/ManagerDash.jsx';
import DeptHeadDash from './pages/dashboards/DeptHeadDash.jsx';
import HRDash from './pages/dashboards/HRDash.jsx';
import FinanceDash from './pages/dashboards/FinanceDash.jsx';
import CLevelDash from './pages/dashboards/CLevelDash.jsx';
import AdminDash from './pages/dashboards/AdminDash.jsx';

import OKRListPage from './pages/okr/OKRListPage.jsx';
import KPIDashboardPage from './pages/kpi/KPIDashboardPage.jsx';
import KPIEntryPage from './pages/kpi/KPIEntryPage.jsx';
import CadencePage from './pages/cadence/CadencePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import CycleListPage from './pages/appraisal/CycleListPage.jsx';
import AppraisalDetailPage from './pages/appraisal/AppraisalDetailPage.jsx';
import BonusViewPage from './pages/bonus/BonusViewPage.jsx';
import SOPIndexPage from './pages/sop/SOPIndexPage.jsx';
import AdminConfigPage from './pages/admin/ConfigPage.jsx';
import LevelsPanel from './pages/admin/LevelsPanel.jsx';
import CompensationInputsPanel from './pages/admin/CompensationInputsPanel.jsx';
import AssumptionsPanel from './pages/admin/AssumptionsPanel.jsx';
import KPIMasterPanel from './pages/admin/KPIMasterPanel.jsx';
import UsersPanel from './pages/admin/UsersPanel.jsx';
import AuditLogPage from './pages/admin/AuditLogPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { session, role, loading, profile } = useAuth();
  if (loading) return null;
  if (!session) return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  );
  // After login, hold the UI on a tiny splash until the def.users profile lands.
  if (session && profile === null) {
    return <div className='min-h-screen flex items-center justify-center text-slate-400'>…</div>;
  }

  return (
    <AppShell>
      <Routes>
        <Route path='/' element={<RoleHome role={role} />} />
        <Route path='/login' element={<Navigate to='/' replace />} />
        <Route path='/dashboard' element={<RoleHome role={role} />} />
        <Route path='/dashboard/employee' element={<RoleGate roles={['employee','manager','dept_head','hr','finance','c_level','admin']}><EmployeeDash /></RoleGate>} />
        <Route path='/dashboard/manager' element={<RoleGate roles={['manager','dept_head','admin']}><ManagerDash /></RoleGate>} />
        <Route path='/dashboard/dept-head' element={<RoleGate roles={['dept_head','admin']}><DeptHeadDash /></RoleGate>} />
        <Route path='/dashboard/hr' element={<RoleGate roles={['hr','admin']}><HRDash /></RoleGate>} />
        <Route path='/dashboard/finance' element={<RoleGate roles={['finance','admin']}><FinanceDash /></RoleGate>} />
        <Route path='/dashboard/clevel' element={<RoleGate roles={['c_level','admin']}><CLevelDash /></RoleGate>} />
        <Route path='/dashboard/admin' element={<RoleGate roles={['admin']}><AdminDash /></RoleGate>} />

        <Route path='/okrs/*' element={<OKRListPage />} />
        <Route path='/kpis' element={<KPIDashboardPage />} />
        <Route path='/kpis/entry' element={<KPIEntryPage />} />
        <Route path='/cadence' element={<CadencePage />} />
        <Route path='/notifications' element={<NotificationsPage />} />
        <Route path='/appraisals' element={<CycleListPage />} />
        <Route path='/appraisals/:id' element={<AppraisalDetailPage />} />
        <Route path='/bonus' element={<BonusViewPage />} />
        <Route path='/sops' element={<SOPIndexPage />} />
        <Route path='/admin/config' element={<RoleGate roles={['admin']}><AdminConfigPage /></RoleGate>} />
        <Route path='/admin/levels' element={<RoleGate roles={['admin','hr']}><LevelsPanel /></RoleGate>} />
        <Route path='/admin/compensation-inputs' element={<RoleGate roles={['admin','finance']}><CompensationInputsPanel /></RoleGate>} />
        <Route path='/admin/assumptions' element={<RoleGate roles={['admin','hr','finance']}><AssumptionsPanel /></RoleGate>} />
        <Route path='/admin/kpi-master' element={<RoleGate roles={['admin','hr']}><KPIMasterPanel /></RoleGate>} />
        <Route path='/admin/users' element={<RoleGate roles={['admin','hr']}><UsersPanel /></RoleGate>} />
        <Route path='/audit' element={<RoleGate roles={['admin','hr','finance','c_level']}><AuditLogPage /></RoleGate>} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

function RoleHome({ role }) {
  // Permissions overlay: admin > c_level > dept_head > finance > hr > manager > employee
  const { permissions = [] } = useAuth();
  const map = {
    employee:  '/dashboard/employee',
    manager:   '/dashboard/manager',
    dept_head: '/dashboard/dept-head',
    hr:        '/dashboard/hr',
    finance:   '/dashboard/finance',
    c_level:   '/dashboard/clevel',
    admin:     '/dashboard/admin',
  };
  // Prefer functional-permission home over org role_code home (admin > c_level etc.)
  if (permissions.includes('admin')) return <Navigate to='/dashboard/admin' replace />;
  if (permissions.includes('hr') && role !== 'c_level') return <Navigate to='/dashboard/hr' replace />;
  if (permissions.includes('finance') && role !== 'c_level' && role !== 'dept_head') return <Navigate to='/dashboard/finance' replace />;
  return <Navigate to={map[role] || '/dashboard/employee'} replace />;
}
