import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function AdminDashboardPage() {
  const location = useLocation();

  // Extract the slug from the URL: /admin/user-management -> user-management
  const pathParts = location.pathname.split('/admin/')[1] || 'dashboard';
  const slug = pathParts.split('/')[0];

  // Map slug back to label
  const activeNav = slug === 'dashboard' ? 'Dashboard' :
    slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <DashboardLayout activeNav={activeNav} setActiveNav={() => { }}>
      <AdminDashboard activeNav={activeNav} />
    </DashboardLayout>
  );
}