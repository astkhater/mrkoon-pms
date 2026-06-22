import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import CommandPalette from '../CommandPalette.jsx';

// Mobile drawer state lifted here so Topbar (hamburger) and Sidebar (drawer)
// share it. On md+ screens the sidebar is always visible and drawer state is
// effectively ignored.
export default function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Auto-close the drawer on route change so the nav doesn't stay over the page.
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <Sidebar isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className='flex-1 flex flex-col min-w-0'>
        <Topbar onToggleDrawer={() => setDrawerOpen(o => !o)} />
        <main className='flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto'>{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
