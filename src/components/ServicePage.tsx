import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SITE_DATA } from '../data/siteData';
import { getServicePage, SERVICE_PAGES } from '../data/servicePages';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';

interface ServicePageProps {
  page: NonNullable<ReturnType<typeof getServicePage>>;
}

export const ServicePage: React.FC<ServicePageProps> = ({ page }) => {
  const relatedPages = page.relatedServiceIds
    .map((id) => SERVICE_PAGES.find((candidate) => candidate.slug !== page.slug && candidate.relatedServiceIds.includes(id)))
    .filter((candidate, index, pages) => candidate && pages.indexOf(candidate) === index)
    .slice(0, 3);

  const handleOpenConsultation = () => {
    const formUrl = SITE_DATA.googleFormUrl || `https://wa.me/${SITE_DATA.phoneRaw}?text=${encodeURIComponent(SITE_DATA.whatsappPrefilledMessage)}`;
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] flex flex-col font-sans">
      <Navbar onOpenConsultationModal={handleOpenConsultation} />
      <main className="flex-grow">
      <section className="bg-white pt-8 pb-4 md:pt-10 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-2 text-sm text-[#1E1E1E]/60">
              <a href="/" className="hover:text-[#0E2B22] transition-colors">Home</a>
              <span className="px-2" aria-hidden="true">/</span>
              <a href="/#services" className="hover:text-[#0E2B22] transition-colors">Services</a>
              <span className="px-2" aria-hidden="true">/</span>
              <span aria-current="page">{page.shortName}</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[2px] w-8 bg-[#C89B2B]" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#C89B2B]">YBGP SERVICES</span>
            </div>
            <p className="mt-2 text-lg sm:text-xl text-[#1E1E1E]/75 leading-relaxed max-w-3xl">{page.intro}</p>
            <a
              href={SITE_DATA.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-[#0E2B22] hover:bg-[#164537] text-white px-7 py-3.5 rounded-full font-semibold transition-colors"
            >
              Book Free Consultation <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#FBFBFB] border-t border-[#F0F0F0] py-12 md:py-16" aria-labelledby="service-detail-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="service-detail-heading" className="sr-only">How YBGP helps with {page.shortName}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {page.sections.map((section) => (
              <article key={section.heading} className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#EBEBEB] shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0E2B22] font-heading mb-4">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-base sm:text-lg text-[#1E1E1E]/75 leading-relaxed">{paragraph}</p>)}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16" aria-labelledby="related-services-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="related-services-heading" className="text-3xl sm:text-4xl font-extrabold text-[#0E2B22] font-heading tracking-tight mb-8">Related ways we can help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPages.map((related) => related && (
              <a key={related.slug} href={`/${related.slug}/`} className="group p-6 rounded-[20px] border border-[#E9E9E9] hover:border-[#C89B2B] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-[#0E2B22] font-heading">{related.shortName}</h3>
                  <ArrowRight className="w-5 h-5 text-[#C89B2B] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm text-[#1E1E1E]/70 leading-relaxed">{related.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#0E2B22] text-white py-14 md:py-18" aria-labelledby="service-cta-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-[#C89B2B] mx-auto mb-4" aria-hidden="true" />
          <h2 id="service-cta-heading" className="text-3xl sm:text-4xl font-extrabold font-heading">Ready to make the next move?</h2>
          <p className="mt-4 text-white/75 text-lg">Talk with {SITE_DATA.owner} about the priorities, constraints and opportunities in your business.</p>
          <a href={SITE_DATA.googleFormUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 bg-[#C89B2B] hover:bg-[#D5AA3E] text-[#0E2B22] px-7 py-3.5 rounded-full font-semibold transition-colors">
            Start a Conversation <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
