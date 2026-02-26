import React from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/Logo.png';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="relative flex flex-col items-center">
        {/* Logo Circle Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-48 h-48 flex items-center justify-center rounded-full border-[1.5px] border-green-500/30 mb-8"
        >
          {/* Pulsing Outer Circle */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-green-500/20"
          />

          <img
            src={logo}
            alt="MoFresh Logo"
            className="w-32 h-auto object-contain relative z-10"
          />
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-64 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
          />
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-4 text-green-600 dark:text-green-400 font-bold tracking-widest uppercase text-sm"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
