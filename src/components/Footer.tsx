import React from 'react';
import { SITE_DATA } from '../data/siteData';

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden bg-[#071b14] text-white border-t border-white/10">
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[#C89B2B]/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-1 text-center text-[10px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} YBGP. All Rights Reserved.</div>
          <div className="font-mono text-white/70">{SITE_DATA.website}</div>
        </div>
      </div>
    </footer>
  );
};
