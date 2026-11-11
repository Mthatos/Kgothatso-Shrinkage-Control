import React from 'react';
import { ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center text-center text-white overflow-hidden bg-dark-bg"
    >
      {/* Designed Background Layer (No external pictures) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle geometric technical grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        ></div>

        {/* Brand-Red Primary Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] h-[450px] sm:h-[600px] bg-brand-red/15 rounded-full blur-[140px]"></div>

        {/* Secondary dark-card depth glow */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent"></div>

        {/* Subtle decorative concentric audit rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[700px] sm:h-[1000px] border border-white/[0.03] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[750px] h-[500px] sm:h-[750px] border border-brand-red/[0.06] rounded-full pointer-events-none"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pt-20 pb-16">
        {/* Pre-title status indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-card/90 border border-gray-800 text-xs font-semibold text-gray-300 mb-8 shadow-inner backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
          <span>Retail Inventory &amp; Loss Prevention Intelligence</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[1.08]">
          Kgothatso <span className="text-brand-red inline-block">Shrinkage Control</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed font-normal">
          Precision inventory audits, multi-shop shrinkage analysis, and forensic loss prevention systems designed to safeguard enterprise retail profitability.
        </p>

        {/* Value Proposition Micro-Pillars */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs text-gray-400">
          <div className="p-3 rounded-xl bg-dark-card/60 border border-gray-800/80 backdrop-blur-sm flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-red flex-shrink-0" />
            <span>Zero-Tolerance Loss Control</span>
          </div>
          <div className="p-3 rounded-xl bg-dark-card/60 border border-gray-800/80 backdrop-blur-sm flex items-center justify-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-red flex-shrink-0" />
            <span>Multi-Shop Audit Tracking</span>
          </div>
          <div className="p-3 rounded-xl bg-dark-card/60 border border-gray-800/80 backdrop-blur-sm flex items-center justify-center gap-2">
            <span className="font-mono font-bold text-brand-red">ZAR</span>
            <span>Forensic Financial Analytics</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
          <a
            href="#portal"
            className="inline-flex items-center gap-2.5 bg-brand-red hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-xl text-sm sm:text-base uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl shadow-brand-red/25"
          >
            <span>Access Inventory Portal</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-dark-card/90 hover:bg-gray-800 text-gray-200 hover:text-white font-bold py-3.5 px-8 rounded-xl text-sm sm:text-base uppercase tracking-wider border border-gray-700 hover:border-gray-500 transition-all transform hover:scale-105 shadow-lg backdrop-blur-sm"
          >
            Request Audit Consultation
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
