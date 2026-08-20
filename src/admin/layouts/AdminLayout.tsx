import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { AdminMoreDrawer } from '../components/AdminMoreDrawer';

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-curator-charcoal font-sans flex flex-col antialiased">
      {/* Desktop Persistent Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile "More" Drawer Bottom Sheet */}
      <AdminMoreDrawer isOpen={isMoreDrawerOpen} onClose={() => setIsMoreDrawerOpen(false)} />

      {/* Main Viewport Shell */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top App Bar */}
        <AdminHeader onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

        {/* Scrollable Main Content — with bottom padding to avoid bottom nav clipping on mobile */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <AdminBottomNav onOpenMore={() => setIsMoreDrawerOpen(true)} />
    </div>
  );
};
