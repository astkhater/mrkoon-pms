import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell({ children }) {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <Sidebar />
      <div className='flex-1 flex flex-col min-w-0'>
        <Topbar />
        <main className='flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto'>{children}</main>
      </div>
    </div>
  );
}
