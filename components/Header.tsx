import React, { useState, useEffect } from 'react';
import { Logo } from '../constants';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#contact', label: 'Contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();

    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 80; // h-20 = 5rem = 80px
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark-card shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center cursor-pointer" aria-label="Go to homepage">
              <Logo />
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-card">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;