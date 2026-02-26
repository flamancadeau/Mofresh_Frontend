import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin,
  Loader2,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import { ordersService } from '@/api';
import type { OrderEntity, OrderStatus } from '@/types/api.types';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

export const OrdersManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderEntity | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await ordersService.getAllOrders();
      // Filter by site if user is site manager
      const filteredOrders = user?.siteId 
        ? allOrders.filter(o => o.siteId === user.siteId)
        : allOrders;
      setOrders(filteredOrders);
    } catch (error: any) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.siteId]);

  const handleApprove = async (orderId: string) => {
    try {
      await ordersService.approveOrder(orderId);
      toast.success('Order approved successfully');
      await fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve order');
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await ordersService.rejectOrder(orderId, reason);
      toast.success('Order rejected');
      await fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INVOICED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Orders Management</h2>
          <p className="text-gray-500 mt-1">Review and approve customer orders</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <Package className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-900">{filteredOrders.length} Orders</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none cursor-pointer hover:border-gray-300 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="INVOICED">Invoiced</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500">No orders match your current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                        <p className="text-sm text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Client ID: {order.clientId.slice(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-gray-900">
                        <span className="text-lg">{order.totalAmount.toLocaleString()} Rwf</span>
                      </div>
                    </div>

                    {order.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="font-bold">Note:</span> {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>

                    {order.status === 'REQUESTED' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(order.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-900/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6">Order Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Order ID</p>
                    <p className="font-bold text-gray-900">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Total Amount</p>
                    <p className="font-bold text-gray-900 text-xl">{selectedOrder.totalAmount.toLocaleString()} Rwf</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Created</p>
                    <p className="font-bold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Delivery Address</p>
                  <p className="font-bold text-gray-900">{selectedOrder.deliveryAddress}</p>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Notes</p>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-6 w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
