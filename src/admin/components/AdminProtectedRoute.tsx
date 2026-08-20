import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminTableSkeleton } from './AdminSkeleton';

export const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <AdminTableSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
