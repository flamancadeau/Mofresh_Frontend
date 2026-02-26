import { Route, Routes, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VendorRegistration from '@/pages/VendorRegistration';
import VerifyOTP from '@/pages/VerifyOTP';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Cart from '@/pages/Cart';
import Contact from '@/pages/Contact';
import ViewAll from '@/pages/ViewAll';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import ManagerDashboardPage from '@/pages/ManagerDashboardPage';
import BuyerDashboardPage from '@/pages/BuyerDashboardPage';
import SupplierDashboardPage from '../pages/SupplierDashboardPage';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('BUYER' | 'SITE_MANAGER' | 'ADMIN' | 'SUPPLIER')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

const getDashboardPath = (role: 'BUYER' | 'SITE_MANAGER' | 'ADMIN' | 'SUPPLIER') => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'SITE_MANAGER':
      return '/manager/dashboard';
    case 'SUPPLIER':
      return '/supplier/dashboard';
    case 'BUYER':
      return '/buyer/dashboard';
    default:
      return '/login';
  }
};

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth Routes - Redirect if already logged in */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <Register />
          )
        }
      />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/vendor-registration" element={<VendorRegistration />} />
      <Route path="/view-all" element={<ViewAll />} />
      <Route path="/cart" element={<Cart />} />

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Site Manager Dashboard Routes */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute allowedRoles={['SITE_MANAGER']}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Buyer Dashboard Routes */}
      <Route
        path="/buyer/*"
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Supplier Dashboard Routes */}
      <Route
        path="/supplier/*"
        element={
          <ProtectedRoute allowedRoles={['SUPPLIER']}>
            <SupplierDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Legacy /dashboard route - redirect to appropriate dashboard */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;