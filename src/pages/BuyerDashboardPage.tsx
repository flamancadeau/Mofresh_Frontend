import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { BuyerDashboard } from '@/components/dashboard/BuyerDashboard';

export default function BuyerDashboardPage() {
  const location = useLocation();

  // Extract the slug from the URL: /buyer/marketplace -> marketplace
  const pathParts = location.pathname.split('/buyer/')[1] || 'dashboard';
  const slug = pathParts.split('/')[0];

  // Map slug back to label
  const activeNav = slug === 'dashboard' ? 'Dashboard' :
    slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <DashboardLayout activeNav={activeNav} setActiveNav={() => { }}>
      <BuyerDashboard activeNav={activeNav} />
    </DashboardLayout>
  );
}