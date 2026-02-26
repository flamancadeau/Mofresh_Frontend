import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import farmerImage from "@/assets/AboutHarvest.jpg";
import basketImage from "@/assets/AbtHarvestInBox.jpeg";
import teamImage from "@/assets/Hero.jpg";
import { Package, Sun, Smartphone } from 'lucide-react';

function AboutPage() {
  const { t } = useTranslation();

  const features = [
    t('aboutFeature1') || "Direct farm-to-business connections",
    t('aboutFeature2') || "Quality assurance on every order",
    t('aboutFeature3') || "Real-time tracking and updates"
  ];

  const products = [
    {
      icon: Sun,
      title: t('mofreshHubLabel'),
      description: t('mofreshHubDesc')
    },
    {
      icon: Package,
      title: t('mofreshBoxLabel'),
      description: t('mofreshBoxDesc')
    },
    {
      icon: Smartphone,
      title: t('mofreshAppLabel'),
      description: t('mofreshAppDesc')
    }
  ];

  return (
    <div className="bg-gradient-to-b from-[#f9fdf7] to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#157954] via-[#21263A] to-[#157954] text-white py-24 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={teamImage}
            alt={t('aboutTeamImageAlt')}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#157954]/80 via-[#21263A]/70 to-[#157954]/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6"
          >
            {t('aboutUsTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm text-gray-200"
          >
            <a href="/" className="hover:text-[#D0D34D] transition-colors">
              {t('home')}
            </a>{" "}
            <span className="mx-2">→</span>{" "}
            <span className="text-[#D0D34D] font-medium">
              {t('aboutUsTitle')}
            </span>
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          {/* Left side - Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="rounded-3xl overflow-hidden h-full border border-gray-100 dark:border-gray-800"
            >
              <img
                src={farmerImage}
                alt={t('aboutFarmerImageAlt')}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="grid grid-rows-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800"
              >
                <img
                  src={basketImage}
                  alt={t('aboutBasketImageAlt')}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-[#157954] to-[#21263A] rounded-3xl flex flex-col items-center justify-center text-white p-6 border border-white/10"
              >
                <div className="text-5xl font-bold mb-2">50+</div>
                <div className="text-sm">{t('activeClients')}</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - About content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium uppercase tracking-wider">
              {t('aboutMofreshLabel')}
            </h3>
            <h2 className="text-5xl font-bold mb-8 leading-tight">
              {t('aboutMofreshHeading1')}
              <br />
              <span className="text-[#157954] dark:text-[#52b788]">
                {t('aboutMofreshHeading2')}
              </span> {t('aboutMofreshHeading3')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-12 leading-relaxed text-lg">
              {t('aboutMofreshDescription')}
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#157954]/10 flex items-center justify-center text-[#157954] dark:text-[#52b788]">
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* New Products Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('ourSolutionsTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('mofreshProductsTitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-800 p-10 rounded-[40px] border border-gray-100 dark:border-gray-700 text-center"
              >
                <div className="w-20 h-20 bg-[#157954]/10 rounded-3xl flex items-center justify-center text-[#157954] dark:text-[#52b788] mx-auto mb-8">
                  <product.icon size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">{product.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vision, Mission, History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          <div className="space-y-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 border-2 border-[#157954]/20 dark:border-gray-700 rounded-[40px] p-10 transition-all"
            >
              <h3 className="text-[#157954] dark:text-[#52b788] font-bold text-xl mb-4">{t('ourVision')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {t('visionDescription')}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 border-2 border-[#157954]/20 dark:border-gray-700 rounded-[40px] p-10 transition-all"
            >
              <h3 className="text-[#157954] dark:text-[#52b788] font-bold text-xl mb-4">{t('ourMission')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {t('missionDescription')}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#157954] to-[#21263A] text-white rounded-[40px] p-10 transition-all"
            >
              <h3 className="text-[#D0D34D] font-bold text-xl mb-4">{t('ourHistory')}</h3>
              <p className="text-white/90 leading-relaxed text-lg">
                {t('historyDescription')}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[40px] overflow-hidden min-h-[600px] border border-gray-200 dark:border-gray-800"
          >
            <div className="absolute inset-0">
              <img
                src={teamImage}
                alt={t('aboutTeamCollab')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#157954]/90 via-[#157954]/70 to-[#D0D34D]/60"></div>
            </div>
            <div className="relative h-full p-14 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-6xl font-bold text-white leading-tight">
                  {t('aboutSlogan1')}<br />
                  {t('aboutSlogan2')} <span className="text-[#D0D34D]">{t('aboutSlogan3')}</span><br />
                  {t('aboutSlogan4')} <span className="text-white">{t('aboutSlogan5')}</span>
                </h2>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="bg-[#D0D34D] text-gray-900 px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
                >
                  {t('contactUsButton')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;