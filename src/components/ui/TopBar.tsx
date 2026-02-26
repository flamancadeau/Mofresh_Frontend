import { useState, useEffect } from 'react';
import { CloudSun, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TopBar() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState({ temp: 25, condition: t('weatherSunny') });

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Africa/Kigali'
      };

      const localeMap: { [key: string]: string } = {
        en: 'en-US',
        fr: 'fr-FR',
        rw: 'rw-RW'
      };

      const locale = localeMap[i18n.language] || 'en-US';
      setCurrentDate(now.toLocaleDateString(locale, options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute for "validity"
    return () => clearInterval(interval);
  }, [i18n.language]);

  // Simulate dynamic weather for Kigali
  useEffect(() => {
    const conditions = [t('weatherSunny'), t('weatherCloudy'), t('weatherSunny')]; // Predominantly sunny
    const updateWeather = () => {
      setWeather({
        temp: Math.floor(Math.random() * (26 - 21 + 1)) + 21, // Kigali average range
        condition: conditions[Math.floor(Math.random() * conditions.length)]
      });
    };

    const timer = setInterval(updateWeather, 30000); // Variation every 30s
    return () => clearInterval(timer);
  }, [t]);

  const marqueeMessages = [
    t('marqueeSourcing'),
    t('marqueeStorage'),
    t('marqueeRentals'),
    t('marqueeQuality')
  ];

  return (
    <div className="bg-[#1a1a1a] text-white py-2 px-4 sm:px-8 lg:px-16 flex items-center justify-between text-xs sm:text-sm border-b border-white/5 relative overflow-hidden">
      <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
        <div className="flex items-center gap-2 group cursor-default">
          <CloudSun size={14} className="text-[#9be15d] group-hover:scale-110 transition-transform" />
          <span className="font-medium">{t('kigali')} {weather.temp}°C • {weather.condition}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 border-l border-white/20 pl-4 lg:pl-6">
          <Calendar size={14} className="text-[#9be15d]" />
          <span className="font-medium">{currentDate}</span>
        </div>
      </div>

      {/* Marquee Effect */}
      <div className="flex-1 overflow-hidden mx-2 sm:mx-4 lg:mx-8">
        <div className="animate-marquee whitespace-nowrap inline-block">
          {marqueeMessages.map((msg, idx) => (
            <span key={idx} className="font-medium italic mx-8">
              {msg} <span className="text-[#9be15d]">#MoFresh</span>
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {marqueeMessages.map((msg, idx) => (
            <span key={`dup-${idx}`} className="font-medium italic mx-8">
              {msg} <span className="text-[#9be15d]">#MoFresh</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <button className="text-[#9be15d] font-bold hover:text-white transition-colors flex items-center gap-1">
          {t('mofreshUpdates')}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}} />
    </div>
  );
}
