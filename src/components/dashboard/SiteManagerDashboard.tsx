import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Truck,
  Wrench,
  User,
  Phone,
  Mail,
  Camera,
  Save,
  Loader2,
  TrendingUp,
  Activity,
  DollarSign,
  BarChart3,
  Lock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser, updateSiteName } from '@/store/authSlice';
import {
  reportsService,
  rentalsService,
  sitesService,
  logisticsService,
} from '@/api';
import { HubInventory } from './site/HubInventory';
import { AssetControl } from './site/AssetControl';
import { OrdersManagement } from './site/OrdersManagement';
import { RentalsManagement } from './site/RentalsManagement';
import { SupplierRequests } from './admin/SupplierRequests';
import { toast } from 'sonner';
import type { SiteEntity } from '@/types/api.types';

interface SiteManagerDashboardProps {
  activeNav: string;
  setActiveNav?: (nav: string) => void;
}

export const SiteManagerDashboard: React.FC<SiteManagerDashboardProps> = ({ activeNav, setActiveNav }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [sites, setSites] = useState<SiteEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    revenue: 0,
    totalAssets: 0,
    activeRentals: 0,
    pendingMaintenance: 0,
  });

  // Asset breakdown for visualization
  const [assetBreakdown, setAssetBreakdown] = useState({
    coldBoxes: 0,
    coldPlates: 0,
    tricycles: 0,
  });

  // Settings Form State
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    nationalId: null as File | null,
    businessCert: null as File | null,
    profilePicture: null as File | null,
    newPassword: '',
    confirmPassword: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    if (!user?.siteId) return;

    try {
      setLoading(true);
      const [revenueData, rentals, boxes, plates, tricycles] = await Promise.all([
        reportsService.getRevenueReport({ siteId: user.siteId }).catch(() => ({ totalRevenue: 0 })),
        rentalsService.getRentals({ siteId: user.siteId, status: 'ACTIVE' as any }).catch(() => []),
        logisticsService.getColdBoxes().catch(() => []),
        logisticsService.getColdPlates().catch(() => []),
        logisticsService.getTricycles().catch(() => []),
      ]);

      const revenue = (revenueData as any)?.totalRevenue || (revenueData as any)?.data?.totalRevenue || 0;
      const rentalsList = Array.isArray(rentals) ? rentals : (rentals as any)?.data || [];

      // Filter assets by site
      const siteBoxes = boxes.filter((b: any) => b.siteId === user.siteId);
      const sitePlates = plates.filter((p: any) => p.siteId === user.siteId);
      const siteTricycles = tricycles.filter((t: any) => t.siteId === user.siteId);

      const totalAssets = siteBoxes.length + sitePlates.length + siteTricycles.length;
      const maintenanceAssets = [
        ...siteBoxes.filter((b: any) => b.status === 'MAINTENANCE'),
        ...sitePlates.filter((p: any) => p.status === 'MAINTENANCE'),
        ...siteTricycles.filter((t: any) => t.status === 'MAINTENANCE'),
      ].length;

      setDashboardStats({
        revenue,
        totalAssets,
        activeRentals: rentalsList.length,
        pendingMaintenance: maintenanceAssets,
      });

      setAssetBreakdown({
        coldBoxes: siteBoxes.length,
        coldPlates: sitePlates.length,
        tricycles: siteTricycles.length,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesList = await sitesService.getAllSites();
        setSites(sitesList);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
    fetchDashboardData();
  }, [user?.siteId]);

  // Find the site this manager is responsible for
  const managerSite = sites.find(s => s.id === user?.siteId);

  // Sync site name to Redux for global header
  useEffect(() => {
    if (managerSite?.name && user?.siteName !== managerSite.name) {
      dispatch(updateSiteName(managerSite.name));
    }
  }, [managerSite, user?.siteName, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'nationalId' | 'businessCert' | 'profilePicture') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));

    if (field === 'profilePicture' && file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setIsSaving(false);
          return;
        }
        if (formData.newPassword.length < 8) {
          toast.error('Password must be at least 8 characters');
          setIsSaving(false);
          return;
        }
      }

      await dispatch(updateUser({
        id: user.id,
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          nationalIdDocument: formData.nationalId || undefined,
          businessCertificateDocument: formData.businessCert || undefined,
          avatar: formData.profilePicture || undefined,
          password: formData.newPassword || undefined,
        }
      })).unwrap();

      // Clear password fields on success
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'Hub Inventory':
        return <HubInventory />;
      case 'Asset Control':
        return <AssetControl />;
      case 'Orders':
        return <OrdersManagement />;
      case 'Rentals':
        return <RentalsManagement />;
      case 'Vendor Requests':
        return <SupplierRequests />;
      case 'Reports':
        return (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reports Coming Soon</h3>
            <p className="text-gray-500">Advanced analytics and reporting features will be available here</p>
          </div>
        );
      case 'Settings':
        return (
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Hub Manager Settings</h2>
              <button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#ffb703] hover:bg-[#fb8500] text-[#1a4d2e] px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Avatar */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#38a169]/10 flex items-center justify-center bg-gray-50">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <User className="w-12 h-12" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">No Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePicture')}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-[#1a4d2e] p-2.5 rounded-full text-white shadow-lg transform transition-transform group-hover:scale-110"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm font-bold text-[#38a169] uppercase tracking-widest">Site Manager</p>
                </div>
                <div className="w-full pt-6 border-t border-gray-50 flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Mail className="w-4 h-4 text-[#ffb703]" /> {user?.email}
                  </div>
                </div>
              </div>

              {/* Right Column: Fields */}
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdateProfile}>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#38a169]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#38a169]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#38a169]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">National ID Document</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.files?.[0] || null })}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-[#38a169]/30 focus:bg-white rounded-2xl text-xs font-bold text-gray-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Business Certificate</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => setFormData({ ...formData, businessCert: e.target.files?.[0] || null })}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-[#38a169]/30 focus:bg-white rounded-2xl text-xs font-bold text-gray-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#38a169]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#38a169]/30 focus:bg-white rounded-2xl text-sm font-bold text-gray-800 transition-all outline-none"
                      />
                    </div>
                  </div>
                </form>

                <div className="pt-6 border-t border-gray-50">
                  <h4 className="text-sm font-black text-gray-900 mb-4">Operational Controls</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm transition-colors border border-gray-100">
                      Report Issue to HQ
                    </button>
                    <button className="flex-1 py-3 px-6 bg-[#38a169]/10 hover:bg-[#38a169]/20 text-[#1a4d2e] rounded-xl font-bold text-sm transition-colors border border-[#38a169]/20">
                      Request Hub Sync
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* Modern Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a4d2e] via-[#2a6d3e] to-[#38a169] rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                    <TrendingUp className="w-8 h-8 text-[#ffb703]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-[#ffb703] text-[#1a4d2e] text-[10px] font-black uppercase tracking-widest rounded-full">
                        {managerSite?.name || 'Loading...'} Hub
                      </span>
                    </div>
                    <h1 className="text-4xl font-black text-white leading-tight">
                      Operations Dashboard
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 shadow-xl group hover:bg-white/15 transition-all">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 leading-none mb-1">System Status</span>
                    <span className="text-sm font-black uppercase tracking-widest text-white">Live & Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-[#38a169] animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
              </div>
            ) : (
              <>
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="col-span-1 lg:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group hover:scale-[1.02] transition-transform"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-white/70" />
                      </div>
                      <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                      <h3 className="text-4xl font-black mb-2">{dashboardStats.revenue.toLocaleString()} <span className="text-2xl">Rwf</span></h3>
                      <p className="text-white/70 text-sm">Current period performance</p>
                    </div>
                  </motion.div>

                  {/* Assets Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Box className="w-6 h-6 text-green-600" />
                      </div>
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Assets</p>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{dashboardStats.totalAssets}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-bold">Active</span>
                    </div>
                  </motion.div>

                  {/* Rentals Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Truck className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Rentals</p>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{dashboardStats.activeRentals}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">Ongoing</span>
                    </div>
                  </motion.div>

                  {/* Maintenance Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wrench className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Maintenance</p>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{dashboardStats.pendingMaintenance}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full font-bold">Pending</span>
                    </div>
                  </motion.div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Asset Breakdown Visualization */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">Asset Distribution</h3>
                        <p className="text-gray-500 text-sm">Current inventory breakdown</p>
                      </div>
                      <button
                        onClick={() => setActiveNav?.('Asset Control')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
                      >
                        View All
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Box className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mb-1">{assetBreakdown.coldBoxes}</p>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Cold Boxes</p>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Box className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mb-1">{assetBreakdown.coldPlates}</p>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Cold Plates</p>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Truck className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mb-1">{assetBreakdown.tricycles}</p>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tricycles</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Total Asset Count</span>
                        <span className="text-2xl font-black text-gray-900">{dashboardStats.totalAssets}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Quick Actions */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl">
                    <h3 className="text-2xl font-black mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveNav?.('Orders')}
                        className="w-full py-4 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all text-left flex items-center justify-between group border border-white/10"
                      >
                        <span>View Pending Orders</span>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveNav?.('Rentals')}
                        className="w-full py-4 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all text-left flex items-center justify-between group border border-white/10"
                      >
                        <span>Manage Rentals</span>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveNav?.('Hub Inventory')}
                        className="w-full py-4 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all text-left flex items-center justify-between group border border-white/10"
                      >
                        <span>Manage Inventory</span>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={fetchDashboardData}
                      className="w-full mt-6 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Loader2 className="w-4 h-4" />
                      Refresh Data
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return renderContent();
};
