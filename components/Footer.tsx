
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-card border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Kgothatso Shrinkage Control. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
