import React from 'react';
import { IconBolt, IconChartBar, IconShieldCheck } from '../constants';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-dark-bg p-8 rounded-2xl border border-gray-800 shadow-xl hover:border-brand-red/50 hover:shadow-brand-red/10 hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-brand-red/15 text-brand-red border border-brand-red/30 mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center gap-1.5 text-xs font-semibold text-brand-red">
        <span>Enterprise Standard Protocol</span>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const services = [
    {
      icon: <IconBolt />,
      title: 'Real-Time Inventory Tracking',
      description:
        'Monitor store stock levels with pinpoint accuracy using structured count cycles and barcode validation. Eliminate phantom inventory and unrecorded intake errors.',
    },
    {
      icon: <IconShieldCheck />,
      title: 'Forensic Loss Prevention',
      description:
        'Customized auditing strategies targeting internal shrinkage, cage access, cash desk pilferage, and delivery shortfalls to safeguard your gross profit margin.',
    },
    {
      icon: <IconChartBar />,
      title: 'Data Analytics & Variance Reporting',
      description:
        'Transform physical counts into financial intelligence. Full 24-category reconciliation, turnover ratios, and monthly shrinkage trend analysis in South African Rand.',
    },
  ];

  return (
    <section id="services" className="py-24 sm:py-32 bg-dark-card relative overflow-hidden border-t border-gray-900">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-red/5 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-brand-red"></span>
            <span className="text-xs uppercase tracking-widest text-brand-red font-bold">
              Core Solutions
            </span>
            <span className="w-6 h-0.5 bg-brand-red"></span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our Specialist Services
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Comprehensive shrinkage mitigation solutions built for independent retail, franchise supermarkets, forecourts, and distribution centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
