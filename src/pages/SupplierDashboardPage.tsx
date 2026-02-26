import React from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { SupplierDashboard } from '@/components/dashboard/SupplierDashboard';

const SupplierDashboardPage: React.FC = () => {
  const location = useLocation();

  // Extract the slug from the URL: /supplier/manage-products -> manage-products
  const pathParts = location.pathname.split('/supplier/')[1] || 'dashboard';
  const slug = pathParts.split('/')[0];

  // Map slug back to label
  const activeNav = slug === 'dashboard' ? 'Dashboard' :
    slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <DashboardLayout activeNav={activeNav} setActiveNav={() => { }}>
      <SupplierDashboard activeNav={activeNav} />
    </DashboardLayout>
  );
};

export default SupplierDashboardPage;
