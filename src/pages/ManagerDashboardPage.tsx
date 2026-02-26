import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { SiteManagerDashboard } from '@/components/dashboard/SiteManagerDashboard';
import { useState, useEffect } from 'react';

export default function ManagerDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the slug from the URL: /manager/hub-inventory -> hub-inventory
  const pathParts = location.pathname.split('/manager/')[1] || location.pathname.split('/manager')[1] || 'dashboard';
  const cleanPath = pathParts.replace(/^\//, '').split('/')[0] || 'dashboard';
  const slug = cleanPath === '' ? 'dashboard' : cleanPath;

  // Map slug back to label
  const getNavFromSlug = (slug: string) => {
    if (slug === 'dashboard') return 'Dashboard';
    if (slug === 'orders') return 'Orders';
    if (slug === 'rentals') return 'Rentals';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const [activeNav, setActiveNav] = useState(getNavFromSlug(slug));

  useEffect(() => {
    setActiveNav(getNavFromSlug(slug));
  }, [location.pathname]);

  const handleSetActiveNav = (nav: string) => {
    setActiveNav(nav);
    // Convert nav to slug and navigate
    const navSlug = nav.toLowerCase().replace(/\s+/g, '-');
    if (nav === 'Dashboard') {
      navigate('/manager');
    } else {
      navigate(`/manager/${navSlug}`);
    }
  };

  return (
    <DashboardLayout activeNav={activeNav} setActiveNav={handleSetActiveNav}>
      <SiteManagerDashboard activeNav={activeNav} setActiveNav={handleSetActiveNav} />
    </DashboardLayout>
  );
}