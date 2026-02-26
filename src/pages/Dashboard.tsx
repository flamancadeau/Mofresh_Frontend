import { useAppSelector } from '@/store/hooks';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { BuyerDashboard } from '@/components/dashboard/BuyerDashboard';
import { SiteManagerDashboard } from '@/components/dashboard/SiteManagerDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { SupplierDashboard } from '@/components/dashboard/SupplierDashboard';

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);

  // Use the URL path to determine active view
  const path = window.location.pathname.split('/dashboard/')[1] || 'dashboard';
  const activeNav = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard activeNav={activeNav === 'Dashboard' ? 'Dashboard' : activeNav} />;
      case 'SITE_MANAGER':
        return <SiteManagerDashboard activeNav={activeNav === 'Dashboard' ? 'Dashboard' : activeNav} />;
      case 'SUPPLIER':
        return <SupplierDashboard activeNav={activeNav === 'Dashboard' ? 'Dashboard' : activeNav} />;
      case 'BUYER':
      default:
        return <BuyerDashboard activeNav={activeNav === 'Dashboard' ? 'Dashboard' : activeNav} />;
    }
  };

  return (
    <DashboardLayout activeNav={activeNav} setActiveNav={() => { }}>
      {renderDashboard()}
    </DashboardLayout>
  );
}
