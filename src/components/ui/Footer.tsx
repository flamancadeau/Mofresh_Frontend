import { Linkedin, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import Logo from '@/assets/Logo.png';

// Imigongo-inspired zigzag SVG pattern (Rwandan geometric art) - Premium watermark style
const imigongoPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50' viewBox='0 0 100 50'%3E%3Cpath d='M0 25 L25 0 L50 25 L75 0 L100 25 L100 50 L75 25 L50 50 L25 25 L0 50 Z' fill='none' stroke='%23ffffff' stroke-width='0.2' opacity='0.02'/%3E%3C/svg%3E")`;

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-[#14281f] dark:bg-gray-950 text-white transition-colors overflow-hidden">
      {/* Imigongo chevron pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: imigongoPattern, backgroundSize: '40px 20px' }}
      />

 

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 text-center sm:text-left">
          {/* Logo and description */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start">
            <Link to="/" className="inline-block mb-4">
              <div className="rounded-xl inline-block">
                <img src={Logo} alt="MoFresh Logo" className="h-8 w-auto" />
              </div>
            </Link>
            <p className="text-gray-300 dark:text-gray-400 text-sm mb-6 leading-relaxed max-w-sm">
              {t('footerDescription')}
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/mofreshrw/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#9be15d] hover:text-[#0B3D2E] transition-all border border-white/10 hover:border-[#9be15d]">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/kivu-cold-group/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#9be15d] hover:text-[#0B3D2E] transition-all border border-white/10 hover:border-[#9be15d]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://wa.me/250788526631" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all border border-white/10 hover:border-[#25D366]">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#9be15d]">{t('platform')}</h3>
            <ul className="space-y-3 text-gray-300 dark:text-gray-400 text-sm">
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('features')}</a></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('marketplace')}</a></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('coldStorage')}</a></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('logistics')}</a></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('pricing')}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#9be15d]">{t('company')}</h3>
            <ul className="space-y-3 text-gray-300 dark:text-gray-400 text-sm">
              <li><Link to="/about" className="hover:text-[#9be15d] transition-colors">{t('aboutUs2')}</Link></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('career')}</a></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('partners')}</a></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('blog')}</a></li>
              <li><a href="#" className="hover:text-[#9be15d] transition-colors">{t('contactUs')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#9be15d]">{t('contactTitle')}</h3>
            <ul className="space-y-4 text-gray-300 dark:text-gray-400 text-sm">
              <li className="flex items-start gap-3 justify-center sm:justify-start">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#9be15d]" />
                <span className="leading-tight">{t('address')}</span>
              </li>
              <li className="flex items-center gap-3 justify-center sm:justify-start">
                <Phone className="w-5 h-5 flex-shrink-0 text-[#9be15d]" />
                <span>{t('phone')}</span>
              </li>
              <li className="flex items-center gap-3 justify-center sm:justify-start">
                <Mail className="w-5 h-5 flex-shrink-0 text-[#9be15d]" />
                <span className="break-all">{t('email')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with Imigongo diamond accent */}
        <div className="mt-14 pt-8 border-t border-white/10 dark:border-gray-800 relative">
          {/* Small diamond motif */}
       
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
            <p className="font-medium">{t('copyright')}</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              <a href="#" className="hover:text-[#9be15d] transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-[#9be15d] transition-colors">{t('termsOfService')}</a>
              <a href="#" className="hover:text-[#9be15d] transition-colors">{t('cookies')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}