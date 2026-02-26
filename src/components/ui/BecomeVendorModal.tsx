import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, CheckCircle, Store, FileText, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { validateEmail } from '@/utils/validation.utils';
import { usersService } from '@/api';

interface BecomeVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BecomeVendorModal: React.FC<BecomeVendorModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEmail(email);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    if (!phone || !description) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await usersService.submitVendorRequest({
        email,
        phone,
        description
      });

      setIsSuccess(true);
      toast.success("Vendor request submitted!", {
        description: "Admin will review and approve your request shortly.",
      });

      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        setPhone('');
        setDescription('');
        onClose();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send vendor information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setPhone('');
      setDescription('');
      setIsSuccess(false);
      onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className="relative bg-gradient-to-br from-[#2E8B2E] to-[#1a4d2e] p-8 text-white">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Store className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Become a Vendor</h2>
                </div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Join MoFresh Network</p>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#2E8B2E]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:border-[#2E8B2E] outline-none transition-all font-medium text-sm"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#2E8B2E]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+250..."
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:border-[#2E8B2E] outline-none transition-all font-medium text-sm"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">What will you supply?</label>
                      <div className="relative group">
                        <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-300 group-focus-within:text-[#2E8B2E]" />
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your products..."
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:border-[#2E8B2E] outline-none transition-all font-medium text-sm h-24 resize-none"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full bg-[#2E8B2E] hover:bg-[#1a4d2e] text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-[#2E8B2E]/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                    >
                      {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Request Approval'}
                    </motion.button>
                  </form>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">Application Sent!</h3>
                    <p className="text-sm text-gray-600">Admin will review your request for <span className="font-bold text-[#2E8B2E]">{email}</span> shortly.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
