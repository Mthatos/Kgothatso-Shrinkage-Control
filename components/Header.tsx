import React, { useState, useEffect } from 'react';
import BrandingLogo from './BrandingLogo';
import { useAuth } from '../src/context/AuthContext';
import { LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  onOpenPortal?: () => void;
  onOpenLogin?: () => void;
  inPortal?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenPortal, onOpenLogin, inPortal = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
    if (inPortal) {
      // If currently inside portal, emit event to return to landing page
      window.location.hash = href;
      window.location.reload();
      return;
    }

    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-card/95 backdrop-blur-md shadow-lg border-b border-gray-800' : 'bg-dark-bg/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with proper proportions */}
          <div className="flex-shrink-0">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, '#home')}
              className="flex items-center cursor-pointer group"
            >
              <BrandingLogo imgClassName="h-11 md:h-12 w-auto" />
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {!inPortal && (
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="cursor-pointer text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Portal Actions */}
            <div className="flex items-center space-x-3 border-l border-gray-700 pl-6">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden lg:block">
                    <div className="text-sm font-semibold text-white flex items-center gap-1.5 justify-end">
                      {user.role === 'ADMIN' ? (
                        <ShieldCheck className="w-4 h-4 text-brand-red inline" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-emerald-400 inline" />
                      )}
                      <span>{user.fullName}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          user.role === 'ADMIN'
                            ? 'bg-brand-red/20 text-red-400 border border-brand-red/30'
                            : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {user.role} PORTAL
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenPortal}
                    className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all transform hover:scale-105"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{inPortal ? 'Dashboard' : 'Enter Portal'}</span>
                  </button>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-brand-red hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-brand-red/20 transition-all transform hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user ? (
              <button
                onClick={onOpenPortal}
                className="bg-brand-red text-white p-2 rounded-md"
                title="Open Portal"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-brand-red text-white px-3 py-1.5 rounded-md text-xs font-semibold"
              >
                Login
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-card border-b border-gray-800 shadow-2xl">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {!inPortal &&
              navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                    setIsMenuOpen(false);
                  }}
                  className="cursor-pointer text-gray-300 hover:bg-gray-800 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  {link.label}
                </a>
              ))}

            <div className="pt-3 border-t border-gray-700/60">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-sm text-gray-300">
                    Signed in as <span className="font-bold text-white">{user.fullName}</span> ({user.role})
                  </div>
                  <button
                    onClick={() => {
                      onOpenPortal?.();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-brand-red text-white py-2 rounded-md font-semibold text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Enter {user.role === 'ADMIN' ? 'Admin' : 'Client'} Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 text-gray-300 hover:text-white py-2 rounded-md text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenLogin?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-brand-red text-white py-2.5 rounded-md font-semibold text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Inventory Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
