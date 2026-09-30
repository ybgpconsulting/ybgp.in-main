import React from 'react';
import { ArrowRight, Check, MessageCircle, Phone, Zap } from 'lucide-react';
import { SITE_DATA } from '../data/siteData';

const websiteOfferUrl = 'https://wa.me/919953270270?text=Hi%2C%20I%20want%20to%20discuss%20the%20business%20website%20starting%20from%20%E2%82%B94%2C999.';

const includedFeatures = [
  'Professional design',
  'Mobile responsive layout',
  'WhatsApp integration',
  'SEO-ready structure',
  'Fast-loading build',
  'Business-focused content structure'
];

const audienceItems = [
  'Local businesses that need a credible online presence',
  'Founders launching a new service or company',
  'Professionals who want more enquiries from their website'
];

const processSteps = [
  ['01', 'Share your requirements', 'Tell us about your business, audience, services and the action you want visitors to take.'],
  ['02', 'We shape the first version', 'We organise the content, structure and visual direction around your business goals.'],
  ['03', 'Review and launch', 'You review the page, we refine the details, and your website goes live ready for enquiries.']
];

const faqs = [
  ['Is ₹4,999 the final price?', '₹4,999 is the starting price for a focused business website. The final quote depends on the number of pages, content requirements, integrations and custom features.'],
  ['What do I need to provide?', 'You can provide your logo, business details, services, contact information and any images you want to use. We can help organise the content if needed.'],
  ['Will the website work on mobile?', 'Yes. The website is designed to work across mobile, tablet and desktop screens so customers can contact you from any device.'],
  ['Can visitors contact me on WhatsApp?', 'Yes. WhatsApp integration can be included so visitors have a direct, familiar way to start a conversation with your business.'],
  ['How quickly can it launch?', 'The timeline depends on how quickly the content and feedback are available. We confirm the delivery plan after understanding your requirements.']
];

const WebsitePreview: React.FC<{ variant: 'service' | 'local' | 'professional'; title: string }> = ({ variant, title }) => (
  <div className="overflow-hidden rounded-2xl border border-[#DCDCDC] bg-white shadow-[0_14px_30px_rgba(14,43,34,0.08)]">
    <div className="flex items-center gap-1 border-b border-[#EAEAEA] bg-[#F5F5F5] px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-[#D7A4A0]" />
      <span className="h-2 w-2 rounded-full bg-[#D8CBA4]" />
      <span className="h-2 w-2 rounded-full bg-[#9FBBA9]" />
      <span className="ml-2 truncate text-[9px] text-[#888]">yourbusiness.in</span>
    </div>
    <div className={`min-h-[220px] p-5 ${variant === 'service' ? 'bg-[#0E2B22]' : variant === 'local' ? 'bg-[#F2EDE5]' : 'bg-[#E9F1EF]'}`}>
      <div className="flex items-center justify-between">
        <div className={`h-3 w-20 rounded ${variant === 'service' ? 'bg-[#C89B2B]' : 'bg-[#0E2B22]'}`} />
        <div className="h-2 w-12 rounded bg-black/20" />
      </div>
      <div className="mt-10 max-w-[180px]">
        <div className={`h-5 w-full rounded ${variant === 'service' ? 'bg-white/90' : 'bg-[#0E2B22]'}`} />
        <div className={`mt-2 h-3 w-4/5 rounded ${variant === 'service' ? 'bg-white/50' : 'bg-black/20'}`} />
        <div className={`mt-5 h-8 w-24 rounded-full ${variant === 'service' ? 'bg-[#C89B2B]' : 'bg-[#0E2B22]'}`} />
      </div>
      <p className={`mt-8 text-xs font-semibold ${variant === 'service' ? 'text-white/80' : 'text-[#0E2B22]/70'}`}>{title}</p>
    </div>
  </div>
);

export const BusinessWebsitePage: React.FC = () => (
  <div className="bg-[#F7F7F7] text-[#1E1E1E]">
    <section className="bg-[#0E2B22] px-4 pb-14 pt-14 text-white sm:px-6 sm:pb-18 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D8CBA4]">Website offer for growing businesses</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.04] font-heading sm:text-6xl lg:text-7xl">Professional Business Website</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">A fast, mobile-ready website that makes your business easier to trust, discover and contact.</p>
          <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C89B2B] px-6 py-4 text-lg font-bold text-[#0E2B22] shadow-lg transition-colors hover:bg-[#D5AA3E]">
            Get My Website <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white p-6 text-[#0E2B22] shadow-2xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Starting from</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-lg font-semibold text-[#1E1E1E]/35 line-through decoration-2 decoration-red-500">₹14,999</span>
            <span className="text-5xl font-semibold leading-none sm:text-6xl">₹4,999</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#1E1E1E]/65">Final pricing depends on pages, content, integrations and custom requirements.</p>
          <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0E2B22] px-5 py-4 font-bold text-white transition-colors hover:bg-[#164537]">
            Discuss Your Website <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>

    <section className="bg-white px-4 py-14 sm:px-6 sm:py-18" aria-labelledby="website-includes-heading">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">What you get</p>
          <h2 id="website-includes-heading" className="mt-4 text-3xl font-extrabold leading-tight text-[#0E2B22] font-heading sm:text-4xl">A clear digital home for your business.</h2>
          <p className="mt-5 leading-relaxed text-[#1E1E1E]/70">Everything is structured around one practical goal: helping the right visitors understand your offer and take the next step.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {includedFeatures.map((feature) => <li key={feature} className="flex items-start gap-3 rounded-xl border border-[#E8E8E8] p-4 text-base"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBD9A2] text-[#0E2B22]"><Check className="h-4 w-4" aria-hidden="true" /></span>{feature}</li>)}
        </ul>
      </div>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-18" aria-labelledby="website-fit-heading">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Who it is for</p><h2 id="website-fit-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">Built for businesses that need momentum.</h2></div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {audienceItems.map((item, index) => <article key={item} className="rounded-2xl border border-[#E5E5E5] bg-white p-6"><span className="text-sm font-bold text-[#C89B2B]">0{index + 1}</span><p className="mt-5 font-semibold leading-relaxed text-[#0E2B22]">{item}</p></article>)}
        </div>
      </div>
    </section>

    <section className="bg-white px-4 py-14 sm:px-6 sm:py-18" aria-labelledby="website-examples-heading">
      <div className="mx-auto max-w-6xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Example directions</p><h2 id="website-examples-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">A visual direction shaped around your business.</h2><div className="mt-8 grid gap-6 md:grid-cols-3"><WebsitePreview variant="service" title="Service business" /><WebsitePreview variant="local" title="Local business" /><WebsitePreview variant="professional" title="Professional practice" /></div></div>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-18" aria-labelledby="website-process-heading">
      <div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">How it works</p><h2 id="website-process-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">From brief to business-ready website.</h2></div><div className="mt-8 grid gap-5 md:grid-cols-3">{processSteps.map(([number, title, description]) => <article key={number} className="border-t-2 border-[#C89B2B] pt-5"><span className="text-sm font-bold text-[#C89B2B]">{number}</span><h3 className="mt-3 text-xl font-bold text-[#0E2B22] font-heading">{title}</h3><p className="mt-3 leading-relaxed text-[#1E1E1E]/70">{description}</p></article>)}</div><a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#0E2B22] px-6 py-4 font-bold text-white hover:bg-[#164537]">Start with WhatsApp <ArrowRight className="h-5 w-5" aria-hidden="true" /></a></div>
    </section>

    <section className="bg-white px-4 py-14 sm:px-6 sm:py-18" aria-labelledby="website-scope-heading">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2"><article className="rounded-2xl border border-[#D7E6DC] bg-[#F2F8F3] p-6 sm:p-8"><h2 id="website-scope-heading" className="text-2xl font-bold text-[#0E2B22] font-heading">Included in the starting scope</h2><ul className="mt-5 space-y-3 text-[#1E1E1E]/75">{['Focused business website structure', 'Responsive front-end layout', 'Contact and WhatsApp call-to-action', 'Basic on-page SEO structure', 'Deployment-ready production build'].map((item) => <li key={item} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-[#0E2B22]" aria-hidden="true" />{item}</li>)}</ul></article><article className="rounded-2xl border border-[#E9D9D5] bg-[#FFF8F6] p-6 sm:p-8"><h2 className="text-2xl font-bold text-[#0E2B22] font-heading">May be quoted separately</h2><ul className="mt-5 space-y-3 text-[#1E1E1E]/75">{['Additional pages or complex content', 'Custom application features', 'Paid hosting, domain or third-party tools', 'Professional photography or copywriting', 'Advanced SEO or ongoing marketing'].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C89B2B]" />{item}</li>)}</ul></article></div>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-18" aria-labelledby="website-faq-heading">
      <div className="mx-auto max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Questions</p><h2 id="website-faq-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">Before we build, let us make the scope clear.</h2><div className="mt-8 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">{faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-semibold text-[#0E2B22] marker:hidden">{question}<span className="float-right text-[#C89B2B] transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl leading-relaxed text-[#1E1E1E]/70">{answer}</p></details>)}</div></div>
    </section>

    <section className="bg-[#0E2B22] px-4 py-14 text-center text-white sm:px-6 sm:py-18"><div className="mx-auto max-w-3xl"><Zap className="mx-auto h-9 w-9 text-[#C89B2B]" aria-hidden="true" /><h2 className="mt-5 text-3xl font-extrabold font-heading sm:text-4xl">Ready to make your business easier to choose?</h2><p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/75">Tell us what you do and we will help you understand the right website scope and starting price.</p><div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"><a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#C89B2B] px-6 py-4 font-bold text-[#0E2B22] hover:bg-[#D5AA3E]">Get My Website <MessageCircle className="h-5 w-5" aria-hidden="true" /></a><a href={`tel:+${SITE_DATA.phoneRaw}`} className="inline-flex items-center gap-2 font-semibold text-white hover:text-[#D8CBA4]"><Phone className="h-4 w-4" aria-hidden="true" />{SITE_DATA.phoneDisplay}</a></div></div></section>
  </div>
);
