import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Box,
  CreditCard,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Camera,
  Save,
  Lock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/authSlice';
import { invoicesService, productsService, rentalsService, ordersService } from '@/api';
import type { InvoiceResponseDto, ProductEntity, OrderEntity, RentalEntity } from '@/types/api.types';
import { toast } from 'sonner';

interface BuyerDashboardProps {
  activeNav: string;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ activeNav }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Settings Form State
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    location: user?.location || 'Kigali, Rwanda',
    nationalId: null as File | null,
    businessCert: null as File | null,
    profilePicture: null as File | null,
    newPassword: '',
    confirmPassword: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLDivElement>(null);

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

      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const [invoices, setInvoices] = useState<InvoiceResponseDto[]>([]);
  const [balance, setBalance] = useState(0);

  React.useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?.id) return;
      try {
        const response = await invoicesService.getAllInvoices({ clientId: user.id });
        // Handle both raw array and wrapped response { data: [], ... }
        const data = Array.isArray(response) ? response : (response as any)?.data || [];
        setInvoices(data);

        const totalUnpaid = data
          .filter((inv: InvoiceResponseDto) => inv.status === 'UNPAID')
          .reduce((sum: number, inv: InvoiceResponseDto) => sum + (inv.totalAmount - inv.paidAmount), 0);
        setBalance(totalUnpaid);
      } catch (error) {
        console.error('Error fetching buyer invoices:', error);
      }
    };

    fetchInvoices();
  }, [user?.id]);

  const stats = [
    { label: 'Active assets', value: '12', icon: Box, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Invoice Balance', value: `${balance.toLocaleString()} Rwf`, subValue: '+Add funds', icon: CreditCard, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Orders', value: (invoices?.length || 0).toString(), badge: '+5% this week', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];


  const [rentals, setRentals] = useState<RentalEntity[]>([]);
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rentalsRes, productsRes, ordersRes] = await Promise.all([
          rentalsService.getRentals().catch(() => []),
          productsService.getAllProducts().catch(() => []),
          ordersService.getAllOrders().catch(() => [])
        ]);

        // Handle potentially wrapped responses if API returns { data: ... }
        setRentals(Array.isArray(rentalsRes) ? rentalsRes : (rentalsRes as any)?.data || []);
        setProducts(Array.isArray(productsRes) ? productsRes : (productsRes as any)?.data || []);
        setOrders(Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load some dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // ... existing invoice fetch logic ...

  const renderContent = () => {
    switch (activeNav) {
      case 'My Rentals':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">My Rentals</h2>
            {isLoading ? (
              <div className="text-center py-20 text-gray-500">Loading rentals...</div>
            ) : rentals.length === 0 ? (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
                <Box className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">You have no active rentals.</p>
                <button className="mt-4 text-[#38a169] font-bold hover:underline">Rent Asset</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentals.map((rental) => (
                  <div key={rental.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                    <div className="h-40 bg-gray-100 rounded-2xl overflow-hidden relative">
                      {rental.image ? <img src={rental.image} className="w-full h-full object-cover" /> : <Box className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{rental.assetName}</h3>
                      <p className="text-sm text-gray-500">Hub: {rental.hubLocation}</p>
                      <p className="text-xs text-gray-400 mt-1">Due: {new Date(rental.rentalEndDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${rental.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {rental.status}
                      </span>
                      <button className="text-xs font-bold text-[#1a4d2e] hover:underline">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'Marketplace':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Fresh Produce Marketplace</h2>
            {isLoading ? (
              <div className="text-center py-20 text-gray-500">Loading marketplace...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No products available.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 space-y-3 group cursor-pointer transition-transform hover:-translate-y-1">
                    <div className="h-32 bg-gray-100 rounded-2xl overflow-hidden relative">
                      {product.image ? (
                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-green-50 flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-green-200" /></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-[#1a4d2e]">{(product.price ?? product.sellingPricePerUnit).toLocaleString()} Rwf/{product.unit}</span>
                      <button className="bg-[#38a169] text-white p-2 rounded-xl hover:bg-[#1a4d2e] transition-colors">
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'Orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Order Management</h2>
            {isLoading ? (
              <div className="text-center py-20 text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>You have no past orders.</p>
                <button className="mt-4 text-[#38a169] font-bold hover:underline">Start Shopping</button>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>{order.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold">{order.totalAmount.toLocaleString()} Rwf</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'Invoice':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Billing & Invoices</h2>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 text-center text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Download and manage your transaction invoices.</p>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Profile Settings</h2>
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
                  <p className="text-sm font-bold text-[#38a169] uppercase tracking-widest">{user?.role} Profile</p>
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
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
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
                    <div className="relative" ref={passwordRef}>
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
                  <h4 className="text-sm font-black text-gray-900 mb-4">Account Security</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => passwordRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex-1 py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm transition-colors border border-gray-100"
                    >
                      Change Password
                    </button>
                    <button className="flex-1 py-3 px-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors border border-red-100/50">
                      Deactivate Account
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
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                  Welcome Back, <span className="text-[#38a169]">{user?.firstName}</span>
                </h1>
                <p className="text-gray-500 mt-1">Here's what's happening with your logistics today</p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Live</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#38a169]/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                        {stat.badge && (
                          <span className="text-[10px] bg-green-100 text-[#38a169] px-2 py-0.5 rounded-full font-bold">
                            {stat.badge}
                          </span>
                        )}
                      </div>
                      {stat.subValue && (
                        <button className="text-[10px] font-bold text-[#ff9500] hover:underline">
                          {stat.subValue}
                        </button>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative overflow-hidden rounded-[2.5rem] h-52 group cursor-pointer shadow-lg shadow-[#1a4d2e]/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a4d2e] via-[#1a4d2e]/90 to-transparent p-6 sm:p-10 flex flex-col justify-center text-white z-10">
                  <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 leading-tight max-w-[200px]">Need more capacity?</h3>
                  <button className="flex items-center gap-2 sm:gap-3 bg-[#ffb703] hover:bg-[#fb8500] text-[#1a4d2e] px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold w-fit transition-all hover:scale-105 shadow-xl shadow-black/20 text-sm sm:text-base">
                    Rent assets <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Logistics" />
              </div>

              <div className="relative overflow-hidden rounded-[2.5rem] h-52 group cursor-pointer shadow-lg shadow-[#38a169]/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#52796f] via-[#52796f]/90 to-transparent p-6 sm:p-10 flex flex-col justify-center text-white z-10 transition-transform">
                  <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 leading-tight max-w-[200px]">Source fresh produce</h3>
                  <button className="flex items-center gap-2 sm:gap-3 border-2 border-white hover:bg-white hover:text-[#354f52] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold w-fit transition-all hover:scale-105 shadow-xl shadow-black/20 backdrop-blur-sm text-sm sm:text-base">
                    Visit Marketplace
                  </button>
                </div>
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Marketplace" />
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-gray-50">
                <h3 className="text-lg sm:text-xl font-black text-gray-900">Recent Bookings</h3>
                <button className="text-xs sm:text-sm font-bold text-gray-400 hover:text-[#38a169] transition-colors">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="px-6 sm:px-10 py-4 sm:py-6 whitespace-nowrap">Asset</th>
                      <th className="px-6 sm:px-10 py-4 sm:py-6 whitespace-nowrap">Order ID</th>
                      <th className="px-6 sm:px-10 py-4 sm:py-6 whitespace-nowrap">Status</th>
                      <th className="px-6 sm:px-10 py-4 sm:py-6 whitespace-nowrap">Pick up date</th>
                      <th className="px-6 sm:px-10 py-4 sm:py-6 text-right whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.slice(0, 5).map((invoice, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 p-1">
                              <Box className="w-6 h-6 text-[#38a169]" />
                            </div>
                            <span className="text-sm font-bold text-gray-800 capitalize">Invoice #{invoice.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-sm font-medium text-gray-400">{invoice.id.slice(0, 8)}</span>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${invoice.status === 'PAID' ? 'bg-green-100 text-[#38a169]' :
                            invoice.status === 'UNPAID' ? 'bg-orange-100 text-[#ffb703]' :
                              'bg-gray-100 text-gray-400'
                            }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-gray-400">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                        <td className="px-10 py-6 text-sm font-black text-gray-900 text-right">{invoice.totalAmount.toLocaleString()} Rwf</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderContent();
};
