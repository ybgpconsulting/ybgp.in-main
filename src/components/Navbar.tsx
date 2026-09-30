import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { SITE_DATA } from '../data/siteData';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenConsultationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConsultationModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(() => window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E9E9E9] py-1 shadow-sm'
          : 'bg-white py-1.5 border-b border-[#F0F0F0]'
      }`}
    >
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 focus:outline-none">
            <Logo size="sm" showSubtitle={false} />
            <div className="leading-none text-left">
              <div className="text-[0.72rem] font-bold tracking-[0.08em] text-[#0E2B22]">Your Business Growth Partner</div>
              <div className="mt-0.5 text-[0.52rem] font-medium tracking-[0.08em] text-[#6A6A6A]">From Idea to a Profitable Business</div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#0E2B22] ${
                    isActive
                      ? 'text-[#0E2B22] font-semibold'
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
              className="bg-[#0E2B22] hover:bg-[#164537] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 group cursor-pointer"
            >
              <span>{SITE_DATA.hero.primaryCta}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0E2B22] hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E9E9E9] px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#0E2B22]/5 text-[#0E2B22] font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultationModal();
              }}
              className="w-full bg-[#0E2B22] text-white py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>{SITE_DATA.hero.primaryCta}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
