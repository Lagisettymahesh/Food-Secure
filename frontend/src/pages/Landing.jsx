import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Zap, Shield, ArrowRight, Users, Package, Star } from 'lucide-react';

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

const features = [
  { icon: Zap,    title: 'Real-time Matching',   desc: 'AI instantly connects donors to nearby NGOs before food expires.',     color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { icon: MapPin, title: 'Live Map Discovery',    desc: 'NGOs see live donation pins on an interactive map with one-tap claim.',  color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'   },
  { icon: Shield, title: 'Fraud Detection',       desc: 'ML-powered anomaly detection keeps every donation verified and safe.',   color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { icon: Users,  title: 'Volunteer Routing',      desc: 'Volunteers get smart routes to pick up and deliver with proof capture.', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
];

const stats = [
  { label: 'Meals Rescued',    value: '12,400+', icon: Package },
  { label: 'Partner NGOs',     value: '340+',    icon: Heart   },
  { label: 'Active Volunteers',value: '1,200+',  icon: Users   },
  { label: 'Cities Covered',   value: '28',      icon: MapPin  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } } };

const Landing = () => {
  return (
    <div className="relative overflow-hidden">
      {/* ── Ambient orbs ── */}
      <FloatingOrb className="w-[600px] h-[600px] bg-primary-400 -top-64 -right-24 animate-spin-slow" />
      <FloatingOrb className="w-[400px] h-[400px] bg-blue-400 top-1/2 -left-32" />
      <FloatingOrb className="w-[300px] h-[300px] bg-secondary-400 bottom-20 right-1/4" />

      {/* ══════════════════════════════════════ */}
      {/* HERO SECTION                           */}
      {/* ══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-8">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            Live in 28 cities across India 🇮🇳
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 18 }}
          className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-[1.05] mb-6"
        >
          <span className="text-gradient">Rescue Food.</span>{' '}
          <span className="block text-gray-900 dark:text-white">Fight Hunger.</span>
          <span className="block text-gradient-green text-4xl md:text-5xl font-bold mt-1">Together.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-500 dark:text-dark-muted max-w-2xl font-medium mb-10 leading-relaxed"
        >
          AI-powered platform connecting restaurants, hotels & event halls with NGOs and volunteers — ensuring no meal goes to waste.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link to="/auth" className="btn-dark text-base px-7 py-3.5 hover-lift shadow-xl">
            Start Donating <ArrowRight size={18} />
          </Link>
          <Link to="/admin" className="btn-ghost border border-gray-200 dark:border-dark-border text-base px-7 py-3.5 hover-lift">
            View Admin Panel
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 flex items-center gap-3 text-sm text-gray-400"
        >
          <div className="flex -space-x-2">
            {['🧑‍🍳','👩','🧑','👨','👩‍💼'].map((e, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-panel border-2 border-white dark:border-dark-bg flex items-center justify-center text-base">{e}</div>
            ))}
          </div>
          <span>Trusted by <strong className="text-gray-700 dark:text-gray-300">1,200+ volunteers</strong> already</span>
          <span className="flex items-center gap-0.5 text-yellow-500">
            {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
          </span>
        </motion.div>

        {/* Floating hero card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 70, damping: 18 }}
          className="mt-16 w-full max-w-sm mx-auto glass rounded-2xl p-5 text-left glow-green"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="badge badge-green">● Live Donation</span>
            <span className="text-xs text-gray-400">2 min ago</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-lg">30x Biryani Trays</p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={13} /> 1.2 km · Expires in 3h</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-dark-panel rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full w-3/4" />
            </div>
            <span className="text-xs font-semibold text-primary-600">75% claimed</span>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* STATS BAR                              */}
      {/* ══════════════════════════════════════ */}
      <section className="px-4 py-8">
        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <motion.div key={label} variants={item} className="stat-card glow-green text-center flex-col">
              <Icon size={22} className="text-primary-500 mb-1" />
              <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FEATURES                               */}
      {/* ══════════════════════════════════════ */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-3">How it works</h2>
          <p className="text-gray-500 dark:text-dark-muted max-w-lg mx-auto">A seamless loop from surplus to smiles — powered by AI.</p>
        </motion.div>

        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map(({ icon: Icon, title, desc, color }) => (
            <motion.div key={title} variants={item} className="card group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={22} />
              </div>
              <h3 className="font-bold text-base mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-dark-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* CTA FOOTER BAND                        */}
      {/* ══════════════════════════════════════ */}
      <section className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass rounded-3xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-blue-500/10 rounded-3xl pointer-events-none" />
          <div className="relative z-10">
            <Heart size={40} className="text-primary-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-black mb-3">Ready to make an impact?</h2>
            <p className="text-gray-500 dark:text-dark-muted mb-8 max-w-md mx-auto">Join thousands of donors, NGOs and volunteers already saving meals every day.</p>
            <Link to="/auth" className="btn-primary text-base px-8 py-3.5 hover-lift">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
