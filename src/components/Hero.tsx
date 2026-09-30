import React from 'react';
import { SITE_DATA } from '../data/siteData';

interface HeroProps {
  onOpenConsultationModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenConsultationModal }) => {
  return (
    <section id="home" aria-labelledby="hero-heading" className="relative bg-white overflow-hidden pt-24 pb-14 md:pt-28 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#C89B2B]">Limited-time website offer</p>
            <h1 id="hero-heading" className="max-w-3xl text-[3.2rem] font-extrabold leading-[1.02] tracking-tight text-[#0E2B22] font-heading sm:text-[4.4rem] xl:text-[5.2rem]">
              {SITE_DATA.hero.titleLine1}<br />
              {SITE_DATA.hero.titleLine2}
              <span className="text-[#C89B2B]">{SITE_DATA.hero.titleHighlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl font-semibold leading-snug text-[#0E2B22] sm:text-2xl">
              {SITE_DATA.hero.subheading}
            </p>
            <ul className="mt-8 grid max-w-xl gap-3 text-base text-[#1E1E1E]/75 sm:grid-cols-2">
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Business-focused design</li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Mobile-ready experience</li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Clear conversion path</li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Built for your next stage</li>
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="w-full rounded-[28px] border border-[#E7E7E7] bg-[#F3F3F3] p-6 shadow-[0_22px_48px_rgba(14,43,34,0.08)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Launch your website now</p>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#0E2B22]/60">Special campaign price</p>
              <div className="mt-2 flex items-end gap-4">
                <span className="text-lg font-semibold text-[#1E1E1E]/35 line-through decoration-2 decoration-red-500">₹14,999</span>
                <span className="text-5xl font-semibold leading-none text-[#0E2B22]">₹4,999</span>
              </div>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-[#1E1E1E]/70">A focused website that makes your business easier to understand, trust and contact.</p>
              <a
                href="https://wa.me/919953270270?text=Hi%2C%20I%20visited%20ybgp.in%20and%20I%27m%20interested%20in%20getting%20a%20website%20designed%20for%20my%20business.%20I%27d%20like%20to%20know%20more%20about%20the%20%E2%82%B94%2C999%20offer."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#C89B2B] px-6 py-4 text-lg font-bold text-[#0E2B22] shadow-md transition-colors duration-200 hover:bg-[#D5AA3E] hover:shadow-lg"
              >
                Get Your Website Now →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
