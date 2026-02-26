import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, ArrowLeft, CheckCircle, Loader2, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { authService } from '@/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.requestPasswordReset({ email });
      toast.success(t('resetLinkSent') || 'Reset code sent!', {
        description: t('instructionsSentTo') || `Check your inbox at ${email}`,
      });

      // Redirect to reset password page with email parameter
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('accountRecovery') || 'Account Recovery'}
      subtitle={t('forgotPassword') || "Enter your email for reset instructions"}
    >
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-4 w-full"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">{t('emailAddressLabel')}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#2E8B2E] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="𝖤𝗆𝖺𝗂𝗅 𝗍𝗈 𝗋𝖾𝖼𝗈𝗏𝖾𝗋..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-[#2E8B2E]/10 focus:border-[#2E8B2E] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold text-base"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-[#2E8B2E] hover:bg-[#1a4d2e] text-white font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-[#2E8B2E]/10 hover:shadow shadow-[#2E8B2E]/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('sendResetLink') || 'Send Link'}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full"
          >
            <div className="w-14 h-14 bg-[#2E8B2E]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2E8B2E]/20">
              <CheckCircle className="w-6 h-6 text-[#2E8B2E]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 tracking-tighter uppercase">{t('checkYourEmail')}</h3>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-6 leading-relaxed">
              {t('instructionsSentTo') || 'Instructions sent to'} <br /> <span className="text-[#2E8B2E]/80 text-xs font-black">{email}</span>
            </p>

            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2.5 bg-gray-50/50 dark:bg-white/[0.03] text-[#2E8B2E]/70 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100 dark:border-white/5 transition-all hover:bg-gray-100 dark:hover:bg-white/[0.05]"
            >
              {t('resendEmail') || 'Resend Email'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/[0.03] flex flex-col items-center gap-4 w-full">
        <Link
          to="/login"
          className="flex items-center gap-2 text-gray-400 dark:text-gray-600 hover:text-[#2E8B2E] transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToLogin') || 'Back to Login'}
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-[10px] font-black text-gray-300 dark:text-gray-700 hover:text-[#2E8B2E] uppercase tracking-wider transition-all"
        >
          <Home className="w-4 h-4" />
          {t('goBackHome')}
        </Link>
      </div>
    </AuthLayout>
  );
}
