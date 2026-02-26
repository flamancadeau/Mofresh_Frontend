import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { BecomeVendorModal } from '@/components/ui/BecomeVendorModal';
import { motion } from 'framer-motion';
import { loginUser } from '@/store/authSlice';
import { toast } from 'sonner';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, otpRequired } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showVendorModal, setShowVendorModal] = useState(false);

  useEffect(() => {
    if (otpRequired) {
      navigate('/verify-otp', { replace: true });
      return;
    }

    if (isAuthenticated && user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'SITE_MANAGER':
          navigate('/manager/dashboard', { replace: true });
          break;
        case 'BUYER':
          navigate('/buyer/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, otpRequired, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      const msg = t('pleaseFillAllFields') || 'Please fill in all fields';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      const result = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.rejected.match(result)) {
        const backendError = result.payload as string;
        const msg = backendError || t('invalidCredentials') || 'Invalid email or password';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = t('errorOccurred') || 'An error occurred. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title={t('secureLogin') || 'Secure Login'}
      subtitle={t('enterYourCredentials') || 'Enter your credentials to access MoFresh'}
    >
      <div className="w-full">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('emailAddressLabel')}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#2E8B2E] transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-[#2E8B2E]/10 focus:border-[#2E8B2E] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold text-sm"
                placeholder="𝖤𝗆𝖺𝗂𝗅 𝗍𝗈 𝗌𝗍𝖺𝗋𝗍..."
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{t('password')}</label>
              <Link to="/forgot-password" title={t('forgotPassword')} className="text-[10px] font-black text-[#2E8B2E]/80 hover:text-[#2E8B2E] uppercase tracking-widest transition-colors mb-0.5">
                {t('forgotPassword')}?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#2E8B2E] transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-[#2E8B2E]/10 focus:border-[#2E8B2E] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold text-sm"
                placeholder="𝖯𝖺𝗌𝗌𝗐𝗈𝗋𝖽 𝗍𝗈 𝗌𝗍𝖺𝗋𝗍..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-[#2E8B2E] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 py-1">
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-white/20 rounded peer-checked:bg-[#2E8B2E] peer-checked:border-[#2E8B2E] transition-all flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform" />
              </div>
            </label>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">{t('rememberMe') || 'Stay logged in'}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2E8B2E] hover:bg-[#1a4d2e] text-white font-black py-3.5 rounded-xl transition-all shadow-xl shadow-[#2E8B2E]/10 hover:shadow shadow-[#2E8B2E]/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('logIn')}
          </motion.button>
        </form>

        {/* Demo Login Buttons */}
        {/* <div className="mt-8 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => dispatch(loginMock({
              id: 'admin-1',
              email: 'admin@mofresh.rw',
              name: 'Super Admin',
              role: 'ADMIN',
              location: 'Kigali HQ',
              isActive: true
            }))}
            className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-purple-200"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => dispatch(loginMock({
              id: 'manager-1',
              email: 'manager@mofresh.rw',
              name: 'Site Manager',
              role: 'SITE_MANAGER',
              location: 'Kigali Central',
              isActive: true
            }))}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-blue-200"
          >
            Manager Demo
          </button>
          <button
            type="button"
            onClick={() => dispatch(loginMock({
              id: 'buyer-1',
              email: 'client@gmail.com',
              name: 'John Doe',
              role: 'BUYER',
              location: 'Kalisimbi',
              isActive: true
            }))}
            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-green-200"
          >
            Buyer Demo
          </button>
        </div> */}

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.05] flex flex-col items-center gap-3">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {t('dontHaveAccount')}?{' '}
            <Link to="/register" className="text-[#2E8B2E] hover:text-[#1a4d2e] hover:underline ml-1 transition-colors">{t('signUp')}</Link>
          </p>

          {/* Become a Vendor Button */}
          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowVendorModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-all shadow-lg shadow-black/10 dark:shadow-white/5"
          >
            <Store className="w-3 h-3" />
            Become a Vendor
          </motion.button> */}

          {/* <Link
            to="/"
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-600 hover:text-[#2E8B2E] uppercase tracking-wider transition-all mt-1"
          >
            <Home className="w-3 h-3" />
            {t('goBackHome')}
          </Link> */}
        </div>
      </div>

      {/* Vendor Modal */}
      <BecomeVendorModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} />
    </AuthLayout>
  );
}