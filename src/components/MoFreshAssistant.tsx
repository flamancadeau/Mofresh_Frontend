import { useState, useEffect, useCallback } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Volume2, VolumeX } from 'lucide-react';
import { getMoeResponse } from '../services/moeService';

export const MoFreshAssistant = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Muraho! I am Moe. How can I help you today? 🌿' }]);
  const [isMuted, setIsMuted] = useState(true); // Default to muted
  const navigate = useNavigate();

  const { rive, RiveComponent } = useRive({
    src: '/mofresh-buddy.riv',
    stateMachines: "Original State Machine",
    autoplay: true,
    onLoadError: () => console.error("Rive failed to load. Check /mofresh-buddy.riv in public folder."),
  });

  const talkTrigger = useStateMachineInput(rive, "Original State Machine", "talk");

  // Voice Functionality
  const speak = useCallback((text: string) => {
    if (isMuted) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Attempt to detect language based on common words (very basic fallback)
    if (text.toLowerCase().includes('muraho') || text.toLowerCase().includes('amafaranga')) {
      utterance.lang = 'rw-RW';
    } else if (text.toLowerCase().includes('bonjour') || text.toLowerCase().includes('merci')) {
      utterance.lang = 'fr-FR';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.2;

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    if (talkTrigger) talkTrigger.fire();

    try {
      const botResponse = await getMoeResponse(userText);
      if (!botResponse) throw new Error("Empty response from AI");

      const navMatch = botResponse.match(/\[NAVIGATE:(.*?)\]/);
      const cleanText = navMatch ? botResponse.replace(navMatch[0], "").trim() : botResponse;

      if (navMatch) {
        navigate(navMatch[1]);
      }

      setMessages(prev => [...prev, { role: 'bot', text: cleanText }]);

      // Moe talks!
      speak(cleanText);
      if (talkTrigger) talkTrigger.fire();

    } catch (error: any) {
      console.error('Error getting Moe response:', error);
      const errorMsg = "Sorry, I'm having trouble connecting right now. 🌿";
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
      speak(errorMsg);
    }
  };

  // Initial greeting voice
  useEffect(() => {
    if (isOpen && messages.length === 1 && !isMuted) {
      const timer = setTimeout(() => {
        speak(messages[0].text);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, speak, isMuted]);

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: -window.innerWidth + 300, right: 0, top: -window.innerHeight + 450, bottom: 0 }}
      dragElastic={0.1}
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-72 h-[420px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-white/20 dark:border-gray-700/50 pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-[#1B4332]/90 backdrop-blur-md p-5 text-white flex justify-between items-center shadow-lg relative z-10 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ring-4 ring-green-400/20" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-90">Moe Assistant</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90" title={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-transparent scrollbar-hide pt-4 relative">
              {/* Subtle background sprout icon watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <div className="w-32 h-32 bg-[url('/mofresh-logo.png')] bg-no-repeat bg-center bg-contain" />
              </div>

              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  key={i}
                  className={`p-3.5 rounded-2xl relative z-10 ${m.role === 'user'
                    ? 'bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white ml-auto rounded-tr-none shadow-xl shadow-[#2D6A4F]/20'
                    : 'bg-white/30 dark:bg-gray-700/30 backdrop-blur-md text-gray-800 dark:text-gray-100 mr-auto rounded-tl-none border border-white/40 dark:border-gray-600/30 shadow-sm'
                    } max-w-[90%] font-medium leading-relaxed`}
                >
                  {m.text}
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/10 dark:bg-black/10 border-t border-white/10 dark:border-gray-700/30 flex gap-2 items-center backdrop-blur-2xl">
              <div className="flex-1 relative group">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your Moe expert..."
                  className="w-full pl-5 pr-10 py-3 bg-white/20 dark:bg-gray-900/40 dark:text-white rounded-2xl text-[11px] outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 transition-all border border-white/5 dark:border-gray-700/30 shadow-inner placeholder:text-gray-400"
                />
                <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/20 group-focus-within:border-[#2D6A4F]/40 transition-colors" />
              </div>
              <button
                onClick={handleSend}
                className="bg-gradient-to-tr from-[#2D6A4F] to-[#40916C] text-white p-3.5 rounded-2xl hover:brightness-110 active:scale-90 transition-all shadow-lg shadow-[#2D6A4F]/30"
              >
                <Send size={16} className="drop-shadow-sm" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button (Moe's Head) */}
      <div className="relative group pointer-events-auto">
        {/* Remove Button (Visible on Hover) */}
        {!isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-2 -left-2 z-20 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
            title="Remove Moe"
          >
            <X size={12} />
          </button>
        )}

        <motion.div
          animate={{
            scale: isOpen ? 0.8 : 1,
            y: isOpen ? 5 : 0
          }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-20 h-20 cursor-pointer rounded-full p-1 transition-all duration-500 ${isOpen ? 'bg-transparent' : 'bg-[#2D6A4F]/10 dark:bg-green-400/10 shadow-[0_20px_50px_rgba(45,106,79,0.2)] ring-1 ring-[#2D6A4F]/20'
            } overflow-hidden flex items-center justify-center`}
        >
          {/* Rive Component with fallback background if it fails to load */}
          <div className="w-full h-full relative bg-transparent rounded-full overflow-hidden">
            <RiveComponent className="w-full h-full scale-125 translate-y-2 drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]" />

            {/* Pulsing indicator when closed to attract attention */}
            {!isOpen && (
              <div className="absolute top-4 right-4 w-4 h-4 bg-[#2D6A4F] border-2 border-white/80 dark:border-gray-800 rounded-full animate-bounce shadow-lg flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Label on hover */}
        {!isOpen && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 whitespace-nowrap">
            <p className="text-[10px] font-black text-[#2D6A4F] dark:text-green-400 uppercase tracking-widest">Chat with Moe</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
