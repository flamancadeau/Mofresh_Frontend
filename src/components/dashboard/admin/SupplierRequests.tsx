import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar, MapPin, UserCheck, UserPlus, Loader2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { usersService } from '@/api';

interface VendorRequest {
  id: string;
  email: string;
  phone: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  email: string;
  action: 'APPROVE' | 'REJECT';
}

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, onSubmit, email, action }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultMessage = action === 'APPROVE'
        ? "Thank you for your request. We have approved your application. Please proceed to registration."
        : "Thank you for your interest. Unfortunately, we cannot approve your request at this time.";
      setMessage(defaultMessage);
    }
  }, [isOpen, action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(message);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className={`p-8 text-white ${action === 'APPROVE' ? 'bg-[#2E8B2E]' : 'bg-red-600'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Reply to Request</h2>
                  </div>
                  <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-xs font-bold opacity-80 uppercase tracking-widest flex items-center gap-2">
                  Sending to: <span className="underline">{email}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Body</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your reply message..."
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:border-[#2E8B2E] outline-none transition-all font-medium text-sm h-40 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 border border-gray-100 text-gray-400 hover:bg-gray-50 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-[2] flex items-center justify-center gap-2 px-6 py-4 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-black/10 ${action === 'APPROVE' ? 'bg-[#2E8B2E] hover:bg-[#1a4d2e]' : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Reply</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export const SupplierRequests: React.FC = () => {
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean;
    email: string;
    action: 'APPROVE' | 'REJECT';
  }>({
    isOpen: false,
    email: '',
    action: 'APPROVE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const reqs = await usersService.getVendorRequests();
      setRequests(reqs as VendorRequest[]);
    } catch (error: any) {
      toast.error('Failed to fetch vendor requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReplyModal = (email: string, action: 'APPROVE' | 'REJECT') => {
    setReplyModal({
      isOpen: true,
      email,
      action
    });
  };

  const handleReplySubmit = async (message: string) => {
    try {
      await usersService.replyVendorRequest({
        email: replyModal.email,
        message
      });
      toast.success(`Vendor request ${replyModal.action === 'APPROVE' ? 'approved' : 'rejected'}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reply to vendor request');
      throw error;
    }
  };

  const pendingRequests = Array.isArray(requests) ? requests.filter(r => r.status === 'PENDING') : [];
  const pastRequests = Array.isArray(requests) ? requests.filter(r => r.status !== 'PENDING') : [];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-black text-gray-900 leading-tight">Supplier <span className="text-[#38a169]">Applications</span></h2>
        <p className="text-gray-500 text-sm">Review and approve new vendor requests</p>
      </div>

      {/* Pending Applications */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#2E8B2E] animate-spin" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching applications...</p>
        </div>
      ) : pendingRequests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {pendingRequests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-[#38a169]/30 transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#2E8B2E] shrink-0">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900">{req.email}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-black uppercase tracking-widest">Pending Review</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#2E8B2E]">
                      <MapPin className="w-3 h-3" /> {req.phone}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 italic leading-relaxed">
                    "{req.description}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => openReplyModal(req.email, 'REJECT')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => openReplyModal(req.email, 'APPROVE')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#2E8B2E] text-white hover:bg-[#1a4d2e] rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-[#2E8B2E]/20"
                >
                  <Check className="w-4 h-4" /> Approve Vendor
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50/50 rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No pending applications</p>
        </div>
      )}

      {/* Past Requests */}
      {pastRequests.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Processed Requests</h3>
          <div className="bg-white rounded-[2.5rem] border border-gray-50 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="px-8 py-4">Supplier</th>
                  <th className="px-8 py-4">Branch</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pastRequests.map((req) => (
                  <tr key={req.id} className="text-sm">
                    <td className="px-8 py-4 font-bold text-gray-700">{req.email}</td>
                    <td className="px-8 py-4 text-gray-500 font-medium">{req.phone}</td>
                    <td className="px-8 py-4 text-gray-400 text-xs font-bold">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-4 text-right">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      <ReplyModal
        isOpen={replyModal.isOpen}
        onClose={() => setReplyModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleReplySubmit}
        email={replyModal.email}
        action={replyModal.action}
      />
    </div>
  );
};
