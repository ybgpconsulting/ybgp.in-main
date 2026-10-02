import React from 'react';
import { SITE_DATA } from '../data/siteData';

interface HeroProps {
  onOpenConsultationModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenConsultationModal }) => {
  return (
    <section id="home" aria-labelledby="hero-heading" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-28">
      <div aria-hidden="true" className="absolute -right-40 top-8 h-[34rem] w-[34rem] rounded-full bg-[#C89B2B]/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-52 bottom-0 h-96 w-96 rounded-full bg-[#0E2B22]/[0.055] blur-3xl" />
      <div aria-hidden="true" className="dot-grid absolute right-[4%] top-24 h-72 w-72 opacity-40" />
      <div aria-hidden="true" className="absolute right-[12%] top-28 h-40 w-40 rounded-full border border-[#C89B2B]/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#C89B2B]">Limited-time website offer</p>
            <h1 id="hero-heading" className="max-w-3xl text-[3.25rem] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#0E2B22] font-heading sm:text-[4.7rem] xl:text-[5.7rem]">
              {SITE_DATA.hero.titleLine1}<br />
              {SITE_DATA.hero.titleLine2}
              <span className="text-[#C89B2B]">{SITE_DATA.hero.titleHighlight}</span>
            </h1>
            <p className="mt-7 max-w-xl text-xl font-semibold leading-snug text-[#0E2B22] sm:text-2xl">
              {SITE_DATA.hero.subheading}
            </p>
            <ul className="mt-9 grid max-w-xl gap-x-6 gap-y-4 text-base text-[#1E1E1E]/75 sm:grid-cols-2">
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Business-focused design</li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Mobile-ready experience</li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Clear conversion path</li>
              <li className="flex items-start gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />Built for your next stage</li>
            </ul>
          </div>

          <div className="three-d-stage relative lg:col-span-5">
            <div aria-hidden="true" className="three-d-plane absolute inset-4 rounded-[34px] border border-[#C89B2B]/25 bg-[#0E2B22] shadow-[20px_30px_55px_rgba(14,43,34,0.18)]" />
            <div aria-hidden="true" className="three-d-plane absolute -right-3 -top-5 h-24 w-24 rounded-[1.75rem] border border-[#C89B2B]/30 bg-[#C89B2B]/15 backdrop-blur-md" />
            <div aria-hidden="true" className="three-d-plane absolute -bottom-5 -left-5 h-16 w-28 rounded-full border border-white/70 bg-white/60 backdrop-blur-md" />
            <div className="three-d-card premium-card relative w-full overflow-hidden rounded-[30px] border border-white/80 bg-white/90 p-6 backdrop-blur-sm sm:p-9">
              <div aria-hidden="true" className="absolute right-0 top-0 h-28 w-28 rounded-bl-[5rem] bg-[#C89B2B]/10" />
              <div aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-2/3 bg-gradient-to-r from-[#C89B2B] to-[#C89B2B]/0" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Launch your website now</p>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#0E2B22]/60">Special campaign price</p>
              <div className="mt-3 flex items-end gap-4">
                <span className="text-lg font-semibold text-[#1E1E1E]/35 line-through decoration-2 decoration-red-500">₹14,999</span>
                <span className="text-5xl font-semibold leading-none text-[#0E2B22]">₹4,999</span>
              </div>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-[#1E1E1E]/70">A focused website that makes your business easier to understand, trust and contact.</p>
              <a
                href="https://wa.me/919953270270?text=Hi%2C%20I%20visited%20ybgp.in%20and%20I%27m%20interested%20in%20getting%20a%20website%20designed%20for%20my%20business.%20I%27d%20like%20to%20know%20more%20about%20the%20%E2%82%B94%2C999%20offer."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#C89B2B] px-6 py-4 text-lg font-bold text-[#0E2B22] shadow-[0_10px_24px_rgba(200,155,43,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D5AA3E] hover:shadow-[0_14px_30px_rgba(200,155,43,0.38)]"
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
