
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 sm:py-32 bg-dark-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="md:pr-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">About Us</h2>
            <div className="w-24 h-1 bg-brand-red mb-6"></div>
            <p className="text-lg text-gray-300 mb-4">
              Kgothatso Shrinkage Control is a premier inventory management company dedicated to helping businesses minimize losses and optimize operations. With cutting-edge technology and expert strategies, we provide comprehensive solutions to combat inventory shrinkage.
            </p>
            <p className="text-lg text-gray-300">
              Our team of specialists works closely with you to identify vulnerabilities, implement robust control systems, and provide actionable insights through detailed data analysis. We are committed to safeguarding your profits and ensuring your business thrives.
            </p>
          </div>
          <div>
            <img 
              src="https://picsum.photos/600/400?random=1" 
              alt="Team working on inventory management" 
              className="rounded-lg shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
