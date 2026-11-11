import React from 'react';
import BrandingLogo from './BrandingLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-card border-t border-gray-800 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandingLogo imgClassName="h-10 w-auto" showSubtitle={true} />
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <a href="#portal" className="text-brand-red font-bold hover:underline">Portal Login</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>&copy; {new Date().getFullYear()} Kgothatso Shrinkage Control. All Rights Reserved.</p>
          <p>Loss Prevention &bull; Inventory Audits &bull; Retail Shrinkage Management</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
