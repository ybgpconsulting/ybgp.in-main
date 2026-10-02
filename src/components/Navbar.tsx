import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { SITE_DATA } from '../data/siteData';

interface NavbarProps {
  onOpenConsultationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConsultationModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(() => window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Section spy
      const sections = ['home', 'work', 'about', 'services', 'process', 'why-choose-us', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'Work', href: '/work/', id: 'work' },
    { label: 'About', href: '/about/', id: 'about' },
    { label: 'Services', href: '/services/', id: 'services' },
    { label: 'Process', href: '/process/', id: 'process' },
    { label: 'Why Choose Us', href: '/why-choose-us/', id: 'why-choose-us' },
    { label: 'Contact', href: '/contact/', id: 'contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-white/70 py-2 shadow-[0_10px_35px_rgba(14,43,34,0.07)]'
          : 'bg-white/75 backdrop-blur-md py-2 border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-14 items-center justify-between gap-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 focus:outline-none">
            <Logo size="sm" showSubtitle={false} />
            <div className="leading-none text-left">
              <div className="text-[0.72rem] font-bold tracking-[0.08em] text-[#0E2B22]">Your Business Growth Partner</div>
              <div className="mt-0.5 text-[0.52rem] font-medium tracking-[0.08em] text-[#6A6A6A]">From Idea to a Profitable Business</div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 rounded-full border border-[#0E2B22]/[0.08] bg-white/70 px-5 py-2 shadow-[0_4px_18px_rgba(14,43,34,0.035)]">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors hover:text-[#0E2B22] after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#C89B2B] after:transition-all hover:after:w-4 ${
                    isActive
                      ? 'text-[#0E2B22] font-semibold after:w-4'
                      : 'text-[#555555]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onOpenConsultationModal}
              className="bg-[#0E2B22] hover:bg-[#164537] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-[0_8px_20px_rgba(14,43,34,0.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(14,43,34,0.28)] flex items-center gap-2 group cursor-pointer"
            >
              <span>{SITE_DATA.hero.primaryCta}</span>
            </button>
          </div>

          <button
            onClick={onOpenConsultationModal}
            className="md:hidden shrink-0 bg-[#0E2B22] px-3 py-2 text-[11px] font-semibold text-white"
          >
            Start a project
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="md:hidden -mx-4 overflow-x-auto border-t border-[#0E2B22]/10 px-4 [scrollbar-width:thin]">
          <div className="flex w-max min-w-full items-center gap-6 py-2.5">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                aria-current={activeSection === link.id ? 'page' : undefined}
                className={`shrink-0 border-b pb-1 text-xs font-medium transition-colors ${
                  activeSection === link.id
                    ? 'border-[#C89B2B] text-[#0E2B22] font-semibold'
                    : 'border-transparent text-[#555555]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};
