
import React from 'react';

const Hero: React.FC = () => {
  const handleScrollToContact = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const targetElement = document.getElementById('contact');

    if (targetElement) {
      const headerOffset = 80; // The fixed header is 80px tall (h-20)
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')" }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60 z-10"></div>
      <div className="relative z-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight uppercase">
          Kgothatso <span className="text-brand-red">Shrinkage Control</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-300">
          Precision Inventory Management to Eliminate Loss and Maximize Profitability.
        </p>
        <div className="mt-10">
          <a
            href="#contact"
            onClick={handleScrollToContact}
            className="cursor-pointer inline-block bg-brand-red text-white font-bold py-3 px-8 rounded-lg text-lg uppercase hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            Secure Your Assets
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
