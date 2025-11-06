
import React from 'react';
import { IconBolt, IconChartBar, IconShieldCheck } from '../constants';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-dark-card p-8 rounded-lg shadow-lg hover:shadow-brand-red/20 hover:scale-105 transform transition-all duration-300">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-red text-white mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const Services: React.FC = () => {
  const services = [
    {
      icon: <IconBolt />,
      title: 'Real-Time Inventory Tracking',
      description: 'Monitor your stock levels with pinpoint accuracy using our advanced tracking systems. Never lose sight of a single item.'
    },
    {
      icon: <IconShieldCheck />,
      title: 'Loss Prevention Strategies',
      description: 'We design and implement tailored strategies to prevent theft, damage, and administrative errors, securing your bottom line.'
    },
    {
      icon: <IconChartBar />,
      title: 'Data Analytics & Reporting',
      description: 'Gain valuable insights from your inventory data. Our comprehensive reports help you make smarter, data-driven decisions.'
    }
  ];

  return (
    <section id="services" className="py-20 sm:py-32 bg-dark-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Our Services</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            We offer a complete suite of services to ensure your inventory is managed with maximum efficiency and security.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} icon={service.icon} title={service.title} description={service.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
