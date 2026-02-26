import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle,
  Loader2,
  Instagram,
  Twitter,
  Linkedin
} from "lucide-react";

export const ContactPage = () => {
  const { t } = useTranslation();
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // EmailJS Logic - Sends to info@mofresh.rw
    emailjs.sendForm(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      form.current!,
      'YOUR_PUBLIC_KEY'
    )
      .then(() => {
        setStatus('success');
        form.current?.reset();
        setTimeout(() => setStatus('idle'), 5000);
      }, (error) => {
        console.error("Email Error:", error.text);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      });
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors selection:bg-[#9be15d] overflow-x-hidden">

      {/* Hero section */}
      <section className="w-full max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-8">
        <div className="relative rounded-[40px] lg:rounded-[56px] overflow-hidden bg-[#2d6a4f] py-20 lg:py-32 border border-white/10">
          {/* Imigongo pattern overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50' viewBox='0 0 100 50'%3E%3Cpath d='M0 25 L25 0 L50 25 L75 0 L100 25 L100 50 L75 25 L50 50 L25 25 L0 50 Z' fill='none' stroke='%23ffffff' stroke-width='0.2' opacity='0.02'/%3E%3C/svg%3E")`, backgroundSize: '100px 50px' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9be15d] opacity-10 rounded-full blur-[120px] -mr-40 -mt-40" />
          <div className="relative z-10 text-center px-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[#9be15d] text-xs font-black tracking-[0.2em] uppercase mb-8"
            >
              {t('contactUsTitle')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-[84px] font-black text-white tracking-tighter leading-[0.9]"
            >
              {t('connectWith')} <br />
              <span className="text-[#9be15d] italic">{t('moFreshDot')}</span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Contact form and info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* LEFT SIDE: OFFICIAL CONTACT INFO */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">
                {t('buildFuture')} <br />
                <span className="text-[#2d6a4f]">{t('futureOfFood')}</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('contactDescription')}
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: MapPin, title: t('addressLabel'), detail: "KG 652 St Kigali, Rwanda", sub: t('mofreshHub') },
                { icon: Mail, title: t('emailMoFresh'), detail: "info@mofresh.rw", sub: t('primarySupport') },
                { icon: Phone, title: t('phoneLabel'), detail: "+250 788 526 631", sub: t('availableHours') }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-6 rounded-[32px] bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-[#2d6a4f] flex items-center justify-center text-[#9be15d] border border-white/10 group-hover:scale-110 transition-transform">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{item.detail}</p>
                    <p className="text-sm text-gray-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              {[Linkedin, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-[#2d6a4f] hover:text-[#9be15d] transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: THE FORM */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="bg-white dark:bg-gray-800 p-8 lg:p-14 rounded-[48px] border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[#9be15d] rounded-full flex items-center justify-center text-[#2d6a4f]">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-3xl font-black dark:text-white">{t('directInquiry')}</h3>
              </div>

              <form ref={form} onSubmit={sendEmail} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2">{t('fullName')}</label>
                    <input
                      name="user_name"
                      type="text"
                      required
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full px-8 py-5 rounded-[24px] bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-[#9be15d] outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2">{t('emailAddress')}</label>
                    <input
                      name="user_email"
                      type="email"
                      required
                      placeholder="info@mofresh.rw"
                      className="w-full px-8 py-5 rounded-[24px] bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-[#9be15d] outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2">{t('yourMessage') || 'Your Message'}</label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder={t('messagePlaceholder')}
                    className="w-full px-8 py-5 rounded-[24px] bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-[#9be15d] outline-none dark:text-white resize-none"
                  />
                </div>

                <button
                  disabled={status === 'sending'}
                  type="submit"
                  className={`w-full font-black py-6 rounded-[24px] flex items-center justify-center gap-4 transition-all active:scale-95 border border-transparent ${status === 'success' ? "bg-green-500 text-white" : "bg-[#2d6a4f] text-[#9be15d] hover:bg-[#23553e]"
                    }`}
                >
                  {status === 'sending' ? (
                    <Loader2 className="animate-spin" />
                  ) : status === 'success' ? (
                    <><CheckCircle size={22} /> {t('sentToMoFresh')}</>
                  ) : (
                    <><Send size={22} /> {t('sendMessage')}</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map section */}
      <section className="w-full max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-16 pb-24">
        <div className="relative h-[600px] w-full rounded-[56px] overflow-hidden border-8 border-white dark:border-gray-800">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            title="MoFresh Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.452601957262!2d30.101784!3d-1.972989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca7807c788045%3A0xbb7b58ae4db33e29!2sMOFRESH%20OFF-GRID%20Cold%20Storage%20HUB!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
          ></iframe>

          {/* Map Overlay Badge */}
          <div className="absolute bottom-10 left-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-6 rounded-3xl hidden md:block border border-white/20">
            <p className="text-[#2d6a4f] font-black text-xl mb-1">{t('mofreshHub')}</p>
            <p className="text-gray-500 text-sm font-bold">{t('mofreshAddress')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;