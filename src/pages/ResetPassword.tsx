import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { authService } from '@/api';
import { validatePassword, validateOTP } from '@/utils/validation.utils';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/input-otp';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate OTP
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      toast.error(otpValidation.error);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email: emailFromParams,
        code: otp,
        newPassword,
      });

      setIsSuccess(true);
      toast.success('Password Reset Successfully!', {
        description: 'You can now login with your new password.',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('resetPassword') || 'Reset Password'}
      subtitle={t('enterNewPassword') || 'Enter OTP and create a new password'}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-5 w-full"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">
                  Verification Code (OTP)
                </label>
                <div className="flex justify-center py-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      if (value.length === 6 && otp.length < 6) {
                        toast.success(t('otpFilled') || 'Verification code filled');
                      }
                    }}
                    render={({ slots }) => (
                      <InputOTPGroup className="gap-2 sm:gap-3">
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} index={index} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 ml-1 mt-1">
                  Enter the 6-digit code sent to {emailFromParams}
                </p>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#2E8B2E] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-[#2E8B2E]/10 focus:border-[#2E8B2E] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold text-base"
                    placeholder="New password..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#2E8B2E] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 ml-1 mt-1">
                  Min 8 chars, uppercase, lowercase, number, special char
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest ml-1">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#2E8B2E] transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-[#2E8B2E]/10 focus:border-[#2E8B2E] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold text-base"
                    placeholder="Confirm password..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#2E8B2E] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-[#2E8B2E] hover:bg-[#1a4d2e] text-white font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-[#2E8B2E]/10 hover:shadow shadow-[#2E8B2E]/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm mt-6"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full py-8"
          >
            <div className="w-16 h-16 bg-[#2E8B2E]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2E8B2E]/20">
              <CheckCircle2 className="w-8 h-8 text-[#2E8B2E]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase">
              Password Reset!
            </h3>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">
              Redirecting to login...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/[0.03] flex flex-col items-center gap-4 w-full">
        <motion.a
          href="/"
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 text-[10px] font-black text-gray-300 dark:text-gray-700 hover:text-[#2E8B2E] uppercase tracking-wider transition-all"
        >
          <Home className="w-4 h-4" />
          {t('goBackHome')}
        </motion.a>
      </div>
    </AuthLayout>
  );
}
