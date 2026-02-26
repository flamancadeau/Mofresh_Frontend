import { motion } from 'motion/react';
import { Phone, Target, Rocket, History, CheckCircle2, Leaf } from "lucide-react";
import { Link } from 'react-router';

// Assets
import farmerImage from "@/assets/AboutHarvest.jpg";
import basketImage from "@/assets/AbtHarvestInBox.jpeg";
import teamImage from "@/assets/Hero.jpg";

// Imigongo-inspired zigzag SVG pattern (Rwandan geometric art) - Premium watermark style
const imigongoPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50' viewBox='0 0 100 50'%3E%3Cpath d='M0 25 L25 0 L50 25 L75 0 L100 25 L100 50 L75 25 L50 50 L25 25 L0 50 Z' fill='none' stroke='%23ffffff' stroke-width='0.2' opacity='0.02'/%3E%3C/svg%3E")`;

function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors selection:bg-[#9be15d] selection:text-[#2d6a4f] overflow-x-hidden">

      {/* Hero section */}
      <section className="w-full max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-8">
        <div className="relative rounded-[40px] lg:rounded-[56px] overflow-hidden bg-[#2d6a4f] py-24 lg:py-36 border border-white/10 shadow-2xl flex items-center">
          {/* Background image */}
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${teamImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Brand overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D2E] via-[#0B3D2E]/80 to-transparent opacity-90" />
          {/* Imigongo pattern overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: imigongoPattern, backgroundSize: '40px 20px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#9be15d] opacity-20 rounded-full blur-[120px] -mr-20 -mt-20" />

          <div className="relative z-10 px-8 lg:px-24 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="inline-block px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[#9be15d] text-xs font-black tracking-[0.2em] uppercase">
                Our Mission
              </span>
              <h1 className="text-5xl lg:text-[84px] font-black text-white leading-[0.9] tracking-tighter">
                Growing the <br />
                <span className="text-[#9be15d] italic">Future</span> of Agri.
              </h1>

              <nav className="flex items-center gap-3 text-white/50 font-bold pt-4 text-sm uppercase tracking-widest">
                <Link to="/" className="hover:text-[#9be15d] transition-colors">Home</Link>
                <span className="opacity-30">/</span>
                <span className="text-white">About MoFresh</span>
              </nav>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Side: Image Collage */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 lg:space-y-8 pt-16"
              >
                <div className="rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-2xl h-[300px] lg:h-[450px] border-4 border-white dark:border-gray-800">
                  <img src={farmerImage} className="w-full h-full object-cover transition-transform hover:scale-110 duration-700" alt="Farmer" />
                </div>
                {/* Accent block */}
                <div className="bg-[#2d6a4f] rounded-[32px] p-8 text-white shadow-xl aspect-square flex flex-col justify-center items-center text-center group">
                  <Leaf className="text-[#9be15d] w-12 h-12 mb-4 group-hover:rotate-12 transition-transform" />
                  <span className="text-4xl font-black text-[#9be15d]">100%</span>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Organic Focus</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4 lg:space-y-8"
              >
                <div className="bg-[#9be15d] rounded-[32px] p-8 flex flex-col items-center justify-center text-center aspect-square shadow-xl">
                  <Rocket className="w-16 h-16 text-[#2d6a4f] mb-4 animate-bounce" />
                  <p className="text-[#2d6a4f] font-black leading-tight">Fastest Farm-to-Fork Logistics</p>
                </div>
                <div className="rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-2xl h-[300px] lg:h-[400px] border-4 border-white dark:border-gray-800">
                  <img src={basketImage} className="w-full h-full object-cover transition-transform hover:scale-110 duration-700" alt="Produce" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="lg:col-span-6 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-[#2d6a4f] dark:text-[#9be15d] font-black uppercase tracking-[0.3em] text-xs mb-6">Our Philosophy</h3>
              <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter mb-8">
                Store fresh. <br />
                <span className="text-[#2d6a4f] italic">Sell smart.</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                MoFresh is an integrated cold chain and agricultural marketplace platform designed to empower small-scale farmers in Rwanda by eliminating post-harvest losses.
              </p>

              <div className="grid gap-4">
                {[
                  "Direct farm-to-business connections",
                  "Quality assurance on every order",
                  "Eco-friendly off-grid cold storage"
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 15 }}
                    className="flex items-center gap-5 p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-[#9be15d]/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] flex items-center justify-center text-[#9be15d] shadow-lg">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="text-gray-900 dark:text-white font-black text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="max-w-[1728px] mx-auto px-4 sm:px-8 lg:px-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Vision Card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white dark:bg-gray-800 p-12 rounded-[48px] shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between group"
          >
            <div>
              <div className="w-16 h-16 bg-[#9be15d]/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#2d6a4f] transition-all">
                <Target className="text-[#2d6a4f] group-hover:text-[#9be15d] w-8 h-8 transition-colors" />
              </div>
              <h3 className="text-3xl font-black mb-4 dark:text-white">Our Vision</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                To be the leading catalyst for zero food waste in Africa through solar-powered cold storage technology.
              </p>
            </div>
          </motion.div>

          {/* History card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-[#2d6a4f] p-12 rounded-[48px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between"
          >
            <History className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                <History className="text-[#9be15d] w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black mb-4">Our History</h3>
              <p className="text-lg opacity-80 leading-relaxed">
                Founded with a simple mission: ensure that no farmer's hard work goes to waste due to heat or poor logistics.
              </p>
            </div>
            <div className="relative z-10 pt-8 text-[#9be15d] font-black text-4xl">Since 2024</div>
          </motion.div>

          {/* CTA card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="relative rounded-[48px] overflow-hidden shadow-2xl group min-h-[400px] flex flex-col justify-end p-12"
          >
            <img src={teamImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Team" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d6a4f] via-[#2d6a4f]/20 to-transparent" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-black text-white leading-tight">
                Fresh produce. <br />
                <span className="text-[#9be15d]">Better markets.</span>
              </h2>
              <Link to="/contact" className="inline-flex items-center gap-3 bg-white text-[#2d6a4f] px-8 py-4 rounded-2xl font-black hover:bg-[#9be15d] transition-all group/btn">
                Contact Us
                <Phone className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default AboutPage;