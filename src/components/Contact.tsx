import React from 'react';
import { motion } from 'motion/react';
import { SITE_DATA } from '../data/siteData';
import { Phone, Mail, Globe, Instagram, MapPin } from 'lucide-react';

interface ContactProps {
  onOpenConsultationModal: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenConsultationModal }) => {
  const contactDetails = [
    {
      icon: Phone,
      label: 'PHONE',
      value: SITE_DATA.phone,
      href: `tel:${SITE_DATA.phoneRaw}`,
    },
    {
      icon: Mail,
      label: 'EMAIL',
      value: SITE_DATA.email,
      href: `mailto:${SITE_DATA.email}`,
    },
    {
      icon: Globe,
      label: 'WEBSITE',
      value: SITE_DATA.website,
      href: SITE_DATA.websiteUrl,
      external: true,
    },
    {
      icon: Instagram,
      label: 'INSTAGRAM',
      value: SITE_DATA.instagram,
      href: SITE_DATA.instagramUrl,
      external: true,
    },
    {
      icon: MapPin,
      label: 'LOCATION',
      value: SITE_DATA.location,
      href: null,
    },
  ];

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-20 md:py-28 bg-[#FBFBFB] border-t border-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            id="contact-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0E2B22] font-heading tracking-tight"
          >
            {SITE_DATA.contact.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-[#1E1E1E]/75 leading-relaxed"
          >
            {SITE_DATA.contact.subtitle}
          </motion.p>
        </div>

        {/* Centered Business Card */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[28px] border border-[#EBEBEB] p-8 sm:p-12 shadow-xl text-center space-y-8"
          >
            {/* Header: Name & Title */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0E2B22] font-heading">
                {SITE_DATA.owner}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#C89B2B] tracking-[0.18em] uppercase mt-1">
                {SITE_DATA.ownerTitle}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#EBEBEB]" />

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {contactDetails.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-[12px] bg-[#F7F7F7] border border-[#EAEAEA] text-[#0E2B22] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0E2B22] group-hover:text-white transition-colors duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#888888] tracking-[0.15em] uppercase">
                        {item.label}
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-[#0E2B22] tracking-tight">
                        {item.value}
                      </div>
                    </div>
                  </div>
                );

                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="block focus:outline-none"
                    >
                      {content}
                    </a>
                  );
                }

                return <div key={item.label}>{content}</div>;
              })}
            </div>

            {/* Schedule Consultation Button */}
            <div className="pt-4">
              <button
                onClick={onOpenConsultationModal}
                className="w-full bg-[#0E2B22] hover:bg-[#164537] text-white py-4 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                {SITE_DATA.contact.primaryCta}
              </button>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
};
