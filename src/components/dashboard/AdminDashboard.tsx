import React from 'react';
import { Overview } from './admin/Overview';
import { UserManagement } from './admin/UserManagement';
import { AssetManagement } from './admin/AssetManagement';
import { SiteManagement } from './admin/SiteManagement';
import { ProductManagement } from './admin/ProductManagement';
import { Financials } from './admin/Financials';
import { SupplierRequests } from './admin/SupplierRequests';

import { AdminSettings } from './admin/AdminSettings';

interface AdminDashboardProps {
  activeNav: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeNav }) => {
  const renderContent = () => {
    switch (activeNav) {
      case 'Dashboard':
        return <Overview />;
      case 'User Management':
        return <UserManagement />;
      case 'Site Management':
        return <SiteManagement />;
      case 'Assets':
        return <AssetManagement />;
      case 'Products':
      case 'Inventory':
        return <ProductManagement />;
      case 'Vendor Requests':
      case 'Supplier Requests':
      case 'Vendors':
        return <SupplierRequests />;
      case 'Financials':
        return <Financials />;
      case 'Reports':
        return <div className="p-12 text-center text-gray-400">Global system reports coming soon...</div>;
      case 'Settings':
        return <AdminSettings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="mt-4">
      {renderContent()}
    </div>
  );
};
