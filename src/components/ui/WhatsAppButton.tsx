import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WhatsAppButton: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const whatsappNumber = "+250788526631";
  const message = "Hello MoFresh, I would like to inquire about your services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
        dragElastic={0.1}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-32 right-8 z-[100] group pointer-events-none"
      >
        {/* Remove Button (Visible on Hover) */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg pointer-events-auto"
          title="Remove WhatsApp"
        >
          <X size={12} />
        </button>

        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] transition-all duration-300 pointer-events-auto"
          aria-label="Contact on WhatsApp"
        >
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />

          <MessageCircle className="w-8 h-8 relative z-10" />

          {/* Tooltip */}
          <span className="absolute right-full mr-4 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none border border-gray-100 dark:border-gray-700">
            Chat with MoFresh
          </span>
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );
};
