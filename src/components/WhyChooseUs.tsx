import React from 'react';
import { motion } from 'motion/react';
import { SITE_DATA } from '../data/siteData';

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="why-choose-us" aria-labelledby="why-choose-us-heading" className="py-20 md:py-28 bg-[#0E2B22] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.h2
          id="why-choose-us-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight"
        >
          {SITE_DATA.whyChooseUs.title}
        </motion.h2>

        {/* 5 Cards Grid: 3 top row, 2 bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SITE_DATA.whyChooseUs.items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-[#143A2F]/80 hover:bg-[#143A2F] border border-white/10 hover:border-[#C89B2B]/50 p-8 rounded-[20px] transition-all duration-300 shadow-lg group flex flex-col justify-between"
              >
                <div>
                  {/* Icon Badge */}
                  <div className="w-12 h-12 rounded-[14px] bg-white/5 border border-white/10 text-[#C89B2B] flex items-center justify-center mb-6 shadow-inner group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-6 h-6 text-[#C89B2B]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white font-heading mb-3">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
