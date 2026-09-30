import React from 'react';
import { motion } from 'motion/react';
import { SITE_DATA } from '../data/siteData';

export const Services: React.FC = () => {
  const servicePageSlugs: Record<string, string> = {
    'business-strategy': 'business-strategy-consulting',
    'business-planning': 'business-planning',
    'registration-compliance': 'business-registration-compliance',
    'website-app-development': 'website-app-development',
    'branding-digital-marketing': 'branding-digital-marketing',
    'business-growth-scaling': 'business-growth-scaling'
  };

  return (
    <section id="services" aria-labelledby="services-heading" className="py-20 md:py-28 bg-[#FBFBFB] border-t border-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.h2
          id="services-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0E2B22] font-heading tracking-tight"
        >
          {SITE_DATA.services.title}
        </motion.h2>

        {/* Intro Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base sm:text-lg text-[#1E1E1E]/75 leading-relaxed max-w-3xl mb-16"
        >
          {SITE_DATA.services.subtitle}
        </motion.p>

        {/* Services Cards Grid (3x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SITE_DATA.services.items.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-white p-8 rounded-[24px] border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#C89B2B]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Icon Badge */}
                  <div className="w-12 h-12 rounded-[14px] bg-[#0E2B22] text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0E2B22] font-heading mb-3">
                    <a href={`/${servicePageSlugs[service.id]}/`} className="hover:text-[#C89B2B] transition-colors">
                      {service.title}
                    </a>
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-[#1E1E1E]/70 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </section>
  );
};
