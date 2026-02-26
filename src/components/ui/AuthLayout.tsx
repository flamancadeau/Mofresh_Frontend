import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '@/assets/Logo.png';
import Home from '@/pages/Home';

// Imigongo-inspired zigzag SVG pattern (Rwandan geometric art) - Premium watermark style
const imigongoPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50' viewBox='0 0 100 50'%3E%3Cpath d='M0 25 L25 0 L50 25 L75 0 L100 25 L100 50 L75 25 L50 50 L25 25 L0 50 Z' fill='none' stroke='%23ffffff' stroke-width='0.2' opacity='0.02'/%3E%3C/svg%3E")`;

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  sideTitle?: React.ReactNode;
  sideDescription?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  sideTitle = <>WELCOME <br /> BACK</>,
  sideDescription = "Sign in to access your dashboard and manage your business."
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans bg-white dark:bg-black transition-colors duration-300">

      {/* Blurred Home page background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="opacity-40 blur-[10px] scale-105 brightness-90">
          <Home />
        </div>
        <div className="absolute inset-0 bg-black/20 dark:bg-black/60 mix-blend-overlay" />
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 z-10 bg-black/40 backdrop-blur-[2px] transition-all duration-500" />

      {/* Auth modal - Full Page */}
      <div className="relative z-20 min-h-screen flex items-stretch justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300"
        >
          {/* Left panel — branding with Imigongo pattern */}
          <div className="hidden lg:flex w-[45%] xl:w-[40%] bg-gradient-to-br from-[#2d6a4f] to-[#1a5c1a] relative p-20 flex-col justify-center text-white overflow-hidden">
            {/* Imigongo pattern overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: imigongoPattern, backgroundSize: '40px 20px' }} />
            {/* Background accents */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

            {/* Imigongo diamond accents */}
            <div className="absolute top-12 left-12 w-8 h-8 bg-[#9be15d]/20 rotate-45 pointer-events-none" />
            <div className="absolute top-12 left-24 w-4 h-4 bg-[#9be15d]/15 rotate-45 pointer-events-none" />
            <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10">
              <h1 className="text-[56px] font-black leading-[0.95] tracking-tighter mb-8 uppercase drop-shadow-sm">
                {sideTitle}
              </h1>
              <p className="text-lg text-white/90 max-w-xs font-normal leading-relaxed">
                {sideDescription}
              </p>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="mb-10 text-center">
              <div className="inline-block p-2 mb-4 rounded-xl bg-gray-50 dark:bg-white/5">
                <img src={logo} alt="MoFresh" className="h-12 w-auto mx-auto" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight transition-colors duration-300">{title}</h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest">{subtitle}</p>
            </div>

            <div className="w-full max-w-md">
              {children}
            </div>

            <div className="mt-12 w-full text-center">
              <Link
                to="/"
                className="text-gray-400 dark:text-gray-600 text-[10px] font-black tracking-[0.3em] uppercase hover:text-[#2E8B2E] dark:hover:text-[#2E8B2E] transition-colors border-t border-gray-100 dark:border-gray-800 pt-6 block"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};