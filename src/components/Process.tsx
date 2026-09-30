import React from 'react';
import { motion } from 'motion/react';
import { SITE_DATA } from '../data/siteData';

export const Process: React.FC = () => {
  return (
    <section id="process" aria-labelledby="process-heading" className="py-20 md:py-28 bg-white border-t border-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.h2
          id="process-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0E2B22] font-heading tracking-tight"
        >
          {SITE_DATA.process.title}
        </motion.h2>

        {/* Horizontal Process Stepper */}
        <div className="relative mt-12">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-12 right-12 h-[2px] bg-[#C89B2B]/40 z-0" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
            {SITE_DATA.process.steps.map((stepItem, idx) => {
              const Icon = stepItem.icon;
              return (
                <motion.div
                  key={stepItem.stepNum}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="flex flex-col items-start space-y-4"
                >
                  {/* Step Icon Badge */}
                  <div className="w-14 h-14 rounded-full bg-white border border-[#C89B2B]/60 text-[#0E2B22] flex items-center justify-center shadow-sm flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#0E2B22]" />
                  </div>

                  {/* Number & Title */}
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-sm font-bold text-[#C89B2B] font-heading">
                      {stepItem.stepNum}
                    </span>
                    <h3 className="text-xl font-bold text-[#0E2B22] font-heading">
                      {stepItem.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#1E1E1E]/75 leading-relaxed">
                    {stepItem.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
