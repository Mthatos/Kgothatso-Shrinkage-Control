import React from 'react';
import { ShieldAlert, TrendingDown, CheckCircle2, Layers, Search, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 sm:py-32 bg-dark-bg relative overflow-hidden border-t border-gray-900">
      {/* Designed Background Accents (Consistent with brand colors) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px]"></div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)
            `,
            backgroundSize: '36px 36px',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Descriptive Content */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-0.5 bg-brand-red"></span>
              <span className="text-xs uppercase tracking-widest text-brand-red font-bold">
                Specialist Inventory Audits
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Combating Retail Shrinkage with Forensic Precision
            </h2>

            <div className="mt-6 space-y-4 text-base sm:text-lg text-gray-300 leading-relaxed font-normal">
              <p>
                <strong className="text-white font-semibold">Kgothatso Shrinkage Control</strong> is a specialized South African inventory management and retail audit firm dedicated to eradicating unexplained inventory discrepancies, point-of-sale pilferage, intake leakages, and operational waste.
              </p>
              <p>
                By combining systematic physical stock counts with deep category-level variance analytics, we transform standard spreadsheet count exercises into actionable loss-prevention roadmaps. Our multi-shop auditing framework ensures shop owners and operational executives maintain total oversight across every branch in real-time.
              </p>
            </div>

            {/* Core Competencies Checklist */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-200">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-card border border-gray-800">
                <CheckCircle2 className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">24-Category Line Reconciliation</span>
                  <span className="text-xs text-gray-400">Exhaustive department counts from CSD to high-value tobacco.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-card border border-gray-800">
                <CheckCircle2 className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Dedicated Bakery Control</span>
                  <span className="text-xs text-gray-400">Short shelf-life yield tracking for fast foods and warmers.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-card border border-gray-800">
                <CheckCircle2 className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Multi-Branch Access Isolation</span>
                  <span className="text-xs text-gray-400">Strict role-based permissions preventing unauthorized shop cross-views.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-card border border-gray-800">
                <CheckCircle2 className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Forensic Variance Audits</span>
                  <span className="text-xs text-gray-400">Data-driven investigation of shrinkage vs positive book surplus.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Designed Graphic Panel (Replaces generic photo) */}
          <div className="lg:col-span-5">
            <div className="bg-dark-card rounded-2xl border border-gray-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
              {/* Top ambient highlight */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Graphic Card Header */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-800 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Audit Control Center</h3>
                    <span className="text-xs text-emerald-400 font-mono">System Status: Active</span>
                  </div>
                </div>
                <span className="text-[10px] bg-gray-900 border border-gray-700 text-gray-300 font-mono px-2 py-0.5 rounded">
                  ZAR Standard
                </span>
              </div>

              {/* Key Quantitative Metric */}
              <div className="py-6 border-b border-gray-800 relative z-10">
                <span className="text-xs text-gray-400 uppercase tracking-wider block">
                  Shrinkage Variance Mitigation
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-brand-red tracking-tight font-mono">
                    -74.5%
                  </span>
                  <span className="text-xs text-gray-400">
                    average shrinkage reduction within 90 days of onboarding
                  </span>
                </div>
              </div>

              {/* Live Category Reconcile Simulation Rows */}
              <div className="pt-6 space-y-3 relative z-10">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                  <span>High-Velocity Auditing Sample</span>
                  <span className="text-brand-red">Active Scan</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-semibold text-white">Beverages &amp; Energy Drinks</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">Reconciled (99.8%)</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-brand-red"></span>
                    <span className="text-xs font-semibold text-white">Cigarettes &amp; High-Value Counter</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-red">Cage Audit Verified</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-xs font-semibold text-white">Bakery &amp; Food Warmer Lines</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">Yield Log Synchronized</span>
                </div>
              </div>

              {/* Bottom Quote Banner */}
              <div className="mt-6 p-3.5 rounded-xl bg-dark-bg/80 border border-gray-800 text-xs text-gray-400 flex items-center gap-2.5">
                <Award className="w-4 h-4 text-brand-red flex-shrink-0" />
                <span>Operating across Gauteng &bull; Johannesburg, Midrand &amp; Pretoria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
