import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronRight,
  User,
  Camera,
  MapPin,
  Lock,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/authSlice';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import { SupplierProductManagement } from './supplier/SupplierProductManagement';
import { SupplierCategoryManagement } from './supplier/SupplierCategoryManagement';

interface SupplierDashboardProps {
  activeNav: string;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ activeNav }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Profile state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    location: user?.location || 'Kigali, Rwanda',
    profilePicture: null as File | null,
    newPassword: '',
    confirmPassword: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, profilePicture: file }));

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
          avatar: formData.profilePicture || undefined,
          password: formData.newPassword || undefined,
        }
      })).unwrap();

      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'Dashboard':
        return (
          <div className="space-y-8 pb-10">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Earnings', value: '450,000 Rwf', icon: DollarSign, color: 'bg-blue-500' },
                { label: 'Pending Deliveries', value: '12', icon: Truck, color: 'bg-orange-500' },
                { label: 'Active Inventory', value: '85 items', icon: Package, color: 'bg-green-500' },
                { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'bg-purple-500' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black mt-1 dark:text-white">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Deliveries */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black dark:text-white">Recent Deliveries</h3>
                  <button className="text-sm font-bold text-green-600 dark:text-green-400 hover:scale-105 transition-transform">
                    View All
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Order ID</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Hub / Site</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Date</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {[
                          { id: '#DEL-001', site: 'Kigali Hub', date: 'Oct 24, 2025', status: 'delivered' },
                          { id: '#DEL-002', site: 'Musanze Site', date: 'Oct 25, 2025', status: 'pending' },
                          { id: '#DEL-003', site: 'Rubavu Hub', date: 'Oct 26, 2025', status: 'delivered' },
                          { id: '#DEL-004', site: 'Kigali Hub', date: 'Oct 27, 2025', status: 'failed' },
                        ].map((delivery, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                            <td className="px-6 py-5 font-bold text-sm dark:text-white">{delivery.id}</td>
                            <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-green-500" />
                                {delivery.site}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-gray-500">{delivery.date}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[delivery.status as keyof typeof statusColors]}`}>
                                {delivery.status}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <button className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-xl shadow-sm transition-all group-hover:scale-110">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Inventory Summary */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black dark:text-white">Active Inventory</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
                  {[
                    { name: 'Potatoes', qty: '500kg', status: 'In Stock', percentage: 75, color: 'bg-green-500' },
                    { name: 'Carrots', qty: '200kg', status: 'Low Stock', percentage: 20, color: 'bg-orange-500' },
                    { name: 'Onions', qty: '150kg', status: 'In Stock', percentage: 45, color: 'bg-blue-500' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="dark:text-white">{item.name}</span>
                        <span className="text-gray-400">{item.qty}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          className={`h-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => toast.info('Navigating to Products...')}
                    className="w-full mt-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    Manage Inventory
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Manage Products':
        return <SupplierProductManagement />;
      case 'Categories':
        return <SupplierCategoryManagement />;
      case 'Settings':
        return (
          <div className="max-w-4xl space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />

              <div className="relative flex flex-col md:flex-row gap-10 items-start">
                {/* Profile Picture Upload Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-green-100 dark:ring-green-900 shadow-xl transition-all group-hover:ring-green-300">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-50 dark:bg-gray-700 flex flex-col items-center justify-center text-gray-300">
                          <User size={64} className="mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all scale-90 hover:scale-100 group-active:scale-95"
                    >
                      <Camera size={20} />
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black dark:text-white uppercase tracking-widest">Profile Discovery</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Upload clear avatar</p>
                  </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleUpdateProfile} className="flex-1 space-y-6 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500/20 dark:text-white font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500/20 dark:text-white font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500/20 dark:text-white font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Location / Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500/20 dark:text-white font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">New Password</label>
                      <div className="relative" ref={passwordRef}>
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        <input
                          type="password"
                          placeholder="Leave blank to keep current"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500/20 dark:text-white font-medium transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500/20 dark:text-white font-medium transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-16 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-900/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? 'Synchronizing...' : 'Update Records'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Account Security Card */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">Account Security</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage your credentials</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => passwordRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-3xl hover:bg-gray-100 transition-all border border-transparent hover:border-orange-500/20"
                >
                  <span className="font-bold text-sm dark:text-white">Change Password</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-3xl hover:bg-gray-100 transition-all border border-transparent hover:border-red-500/20">
                  <span className="font-bold text-sm text-red-500">Deactivate Account</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black dark:text-white italic">{activeNav} Expansion</h3>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-2 px-10 text-center">
              We are synchronizing the backend records for this module.
            </p>
            <div className="mt-8 flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {renderContent()}
    </div>
  );
};
