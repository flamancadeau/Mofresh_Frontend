import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Loader2,
  Search,
  Filter,
  Activity,
} from 'lucide-react';
import { rentalsService } from '@/api';
import type { RentalEntity, RentalStatus } from '@/types/api.types';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

export const RentalsManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [rentals, setRentals] = useState<RentalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RentalStatus | 'ALL'>('ALL');

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const allRentals = await rentalsService.getRentals({ siteId: user?.siteId || undefined });
      setRentals(Array.isArray(allRentals) ? allRentals : (allRentals as any)?.data || []);
    } catch (error: any) {
      toast.error('Failed to load rentals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [user?.siteId]);

  const handleApprove = async (rentalId: string) => {
    try {
      await rentalsService.approveRental(rentalId);
      toast.success('Rental approved successfully');
      await fetchRentals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve rental');
    }
  };

  const handleActivate = async (rentalId: string) => {
    try {
      await rentalsService.activateRental(rentalId);
      toast.success('Rental activated');
      await fetchRentals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate rental');
    }
  };

  const handleComplete = async (rentalId: string) => {
    try {
      await rentalsService.completeRental(rentalId);
      toast.success('Rental completed');
      await fetchRentals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete rental');
    }
  };

  const handleCancel = async (rentalId: string) => {
    try {
      await rentalsService.cancelRental(rentalId);
      toast.success('Rental cancelled');
      await fetchRentals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel rental');
    }
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: RentalStatus) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Rentals Management</h2>
          <p className="text-gray-500 mt-1">Manage asset rentals and approvals</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <Box className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-green-900">{filteredRentals.length} Rentals</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by rental ID or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RentalStatus | 'ALL')}
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none cursor-pointer hover:border-gray-300 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Rentals...</p>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Rentals Found</h3>
          <p className="text-gray-500">No rentals match your current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredRentals.map((rental) => (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Box className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-lg">Rental #{rental.id.slice(0, 8).toUpperCase()}</h3>
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                          {rental.assetType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Client ID: {rental.clientId.slice(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(rental.rentalStartDate).toLocaleDateString()} - {new Date(rental.rentalEndDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <span className="text-lg">{rental.estimatedFee.toLocaleString()} Rwf</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${getStatusColor(rental.status)}`}>
                      {rental.status}
                    </span>

                    <div className="flex gap-2">
                      {rental.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleApprove(rental.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-900/20"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleCancel(rental.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {rental.status === 'APPROVED' && (
                        <button
                          onClick={() => handleActivate(rental.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
                        >
                          <Activity className="w-4 h-4" />
                          Activate
                        </button>
                      )}
                      {rental.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleComplete(rental.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-900/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
