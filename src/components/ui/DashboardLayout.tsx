import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import logo from '@/assets/Logo.png';
import {
  LayoutDashboard,
  Package,
  Truck,
  Wrench,
  FileText,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Search,
  Box,
  Store,
  CreditCard,
  Users,
  MapPin,
  Sun,
  Moon,
  ShoppingCart,
  ChevronDown,
  Globe,
  DollarSign,
  UserPlus,
  LayoutGrid,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeNav: string;
  setActiveNav: (name: string) => void;
}

type Language = 'en' | 'fr' | 'rw';

const languageLabels = {
  en: 'Eng',
  fr: 'Fra',
  rw: 'Kin',
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeNav,
  setActiveNav
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const currentLanguage = i18n.language as Language;

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change or screen resize
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeNav]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const getNavItems = () => {
    const role = user?.role || 'BUYER';
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Site Management', icon: MapPin },
          { name: 'Assets', icon: Box },
          { name: 'Products', icon: Package },
          { name: 'Financials', icon: DollarSign },
          { name: 'User Management', icon: Users },
          { name: 'Vendor Requests', icon: UserPlus },
          { name: 'Reports', icon: FileText },
          { name: 'Settings', icon: SettingsIcon },
        ];
      case 'SITE_MANAGER':
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Orders', icon: ShoppingCart },
          { name: 'Rentals', icon: Box },
          { name: 'Hub Inventory', icon: Package },
          { name: 'Asset Control', icon: Wrench },
          { name: 'Vendor Requests', icon: UserPlus },
          { name: 'Reports', icon: FileText },
          { name: 'Settings', icon: SettingsIcon },
        ];
      case 'SUPPLIER':
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Manage Products', icon: Package },
          { name: 'Categories', icon: LayoutGrid },
          { name: 'Deliveries', icon: Truck },
          { name: 'Earnings', icon: DollarSign },
          { name: 'Settings', icon: SettingsIcon },
        ];
      case 'BUYER':
      default:
        return [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'My Rentals', icon: Box },
          { name: 'Marketplace', icon: Store },
          { name: 'Orders', icon: Package },
          { name: 'Invoice', icon: CreditCard },
          { name: 'Settings', icon: SettingsIcon },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'System Administrator';
      case 'SITE_MANAGER':
        return 'Site Manager';
      case 'SUPPLIER':
        return 'Supplier Account';
      case 'BUYER':
        return 'Client Account';
      default:
        return 'User';
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-8 pb-6 border-b border-white/10">
        <div className="flex items-center">
          <img src={logo} alt="MoFresh Logo" className="h-12 w-auto object-contain" />
        </div>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-4">
          {getRoleLabel()}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const getRolePrefix = (role: string) => {
            switch (role) {
              case 'SITE_MANAGER': return 'manager';
              default: return role.toLowerCase();
            }
          };
          const rolePrefix = user ? getRolePrefix(user.role) : 'dashboard';
          const slug = item.name.toLowerCase().replace(/\s+/g, '-');
          const itemPath = `/${rolePrefix}/${slug === 'dashboard' ? '' : slug}`;

          const isActive =
            (slug === 'dashboard' && (window.location.pathname === `/${rolePrefix}` || window.location.pathname === `/${rolePrefix}/`)) ||
            (slug !== 'dashboard' && window.location.pathname.startsWith(`/${rolePrefix}/${slug}`));

          return (
            <button
              key={item.name}
              onClick={() => navigate(itemPath)}
              className={`w-full flex items-center gap-4 px-8 py-4 transition-all relative group ${isActive
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffb703] shadow-[0_0_10px_rgba(255,183,3,0.5)]"
                />
              )}
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#ffb703]' : 'group-hover:scale-110'
                  }`}
              />
              <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1 border-t border-white/10">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Help Center</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors">
      {/* Backdrop for Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-[#1a4d2e] dark:bg-gray-950 text-white flex-col transition-colors border-r border-white/5 relative z-20 overflow-y-auto">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-64 bg-[#1a4d2e] dark:bg-gray-950 text-white flex flex-col z-50 lg:hidden shadow-2xl overflow-y-auto"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white/60 hover:text-white bg-white/5 rounded-lg"
              >
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
            </div>
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Content Header (Enhanced Top Bar) */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-8 py-4 transition-colors flex-shrink-0">
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <LayoutDashboard className="w-6 h-6" />
            </button>

            {/* Search Bar - Only for BUYER and SUPPLIER */}
            {user?.role && ['BUYER', 'SUPPLIER'].includes(user.role) && (
              <>
                <div className="relative flex-1 max-w-xl hidden sm:flex items-center bg-gray-50 dark:bg-gray-700 rounded-full border border-gray-100 dark:border-gray-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#38a169]/20 transition-all">
                  <input
                    type="text"
                    placeholder="Search your dashboard..."
                    className="flex-1 pl-6 pr-4 py-2.5 bg-transparent dark:text-white outline-none text-sm placeholder:text-gray-400"
                  />
                  <button className="mr-1 p-2 bg-[#ffb703] hover:bg-[#fb8500] rounded-full text-[#1a4d2e] shadow-md transition-colors flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Search - Icon only for tiny screens */}
                <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                  <Search className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Utility & User Section */}
            <div className="ml-auto flex items-center gap-2 sm:gap-4 md:gap-6">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#38a169]/10 hover:text-[#38a169] transition-all"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all font-bold text-[10px] sm:text-xs"
                >
                  <Globe size={14} className="text-[#38a169] sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">
                    {languageLabels[currentLanguage] || 'Eng'}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform sm:w-3.5 sm:h-3.5 ${isLanguageDropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {isLanguageDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden p-1 z-50 transition-colors"
                    >
                      {(['en', 'fr', 'rw'] as Language[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={`w-full px-4 py-2 text-left text-xs rounded-lg transition-colors ${currentLanguage === lang
                            ? 'bg-[#38a169]/10 text-[#38a169] font-bold'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white'
                            }`}
                        >
                          {lang === 'en'
                            ? 'English'
                            : lang === 'fr'
                              ? 'Français'
                              : 'Kinyarwanda'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart - Only visible for BUYER and SUPPLIER */}
              {user?.role && ['BUYER', 'SUPPLIER'].includes(user.role) && (
                <button
                  onClick={() => navigate('/cart')}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-[#38a169]/10 hover:text-[#38a169] transition-all"
                >
                  <ShoppingCart size={18} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#ffb703] text-[#1a4d2e] text-[8px] sm:text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {/* Separator - Only show if cart is visible */}
              {user?.role && ['BUYER', 'SUPPLIER'].includes(user.role) && (
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
              )}

              {/* Profile - Clickable to Settings */}
              <button
                onClick={() => setActiveNav('Settings')}
                className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full px-1 sm:px-2 py-1 transition-colors group"
              >
                <div className="text-right hidden xl:block">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {user?.role === 'SITE_MANAGER' && user.siteName ? `${user.siteName} Hub` : getRoleLabel()}
                  </p>
                </div>
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-[#ffb703] transition-all shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-[#fdfdfd] dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};