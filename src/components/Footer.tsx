import React from 'react';
import { SITE_DATA } from '../data/siteData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0E2B22] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col gap-1 text-center text-[10px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} YBGP. All Rights Reserved.</div>
          <div className="font-mono text-white/70">{SITE_DATA.website}</div>
        </div>
      </div>
    </footer>
  );
};
