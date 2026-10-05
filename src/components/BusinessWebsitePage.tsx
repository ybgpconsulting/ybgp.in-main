import React from 'react';
import { ArrowRight, Check, CheckCircle2, MessageCircle, LayoutTemplate, Store, ShieldCheck, Sparkles, Camera, ShoppingBag } from 'lucide-react';

const websiteOfferUrl = 'https://wa.me/919953270270?text=Hi%2C%20I%20want%20to%20discuss%20the%20YBGP%20Websites%20plan%20for%20%E2%82%B9999%2Fyear.';

const includedFeatures = [
  'Business profile and website setup',
  'Template-based design flow',
  'Products and services sections',
  'Gallery and visual storytelling',
  'Mobile-first public website',
  'Simple publish workflow for updates'
];

const workflowSteps = [
  ['01', 'Create business', 'Set up a new business profile and choose your website tenant.'],
  ['02', 'Select template', 'Pick a brand-aligned layout for your industry and customer journey.'],
  ['03', 'Add details', 'Add your business information, services, gallery, pricing and contact details.'],
  ['04', 'Publish', 'Launch your business website and keep the content updated from one place.']
];

const platformHighlights = [
  { title: 'One application', description: 'One app serves multiple businesses without separate codebases or duplicated customer sites.', icon: LayoutTemplate },
  { title: 'Business-safe data model', description: 'Every tenant record is tied to a business_id so one business never sees another business’s content.', icon: ShieldCheck },
  { title: 'Launch-ready templates', description: 'Start with bakery, salon, jewellery or service-oriented layouts and adapt them to the business quickly.', icon: Store },
  { title: 'Fast updates', description: 'Business owners can update products, gallery items and service content directly from the dashboard.', icon: Sparkles }
];

const demoBusinesses = {
  'demo-bakery': {
    slug: 'demo-bakery',
    name: 'Aroma & Crumb',
    category: 'Bakery & gifting studio',
    description: 'A warm neighbourhood bakery site with signature items, seasonal collections and a direct WhatsApp ordering flow.',
    heroText: 'Fresh cakes, savoury bites and gifting that feels personal.',
    services: ['Custom cakes', 'Birthday hampers', 'Corporate gifting', 'Festive boxes'],
    gallery: ['Signature cakes', 'Bakery counters', 'Event gifting', 'Custom packaging']
  },
  'demo-salon': {
    slug: 'demo-salon',
    name: 'Maison Gloss',
    category: 'Salon & wellness studio',
    description: 'A polished beauty brand experience with service cards, before-and-after inspiration and booking prompts.',
    heroText: 'Style that looks premium and feels effortless.',
    services: ['Hair styling', 'Bridal finishing', 'Facials', 'Beard grooming'],
    gallery: ['Hair transformations', 'Salon interiors', 'Spa rituals', 'Bridal styling']
  },
  'demo-jewellery': {
    slug: 'demo-jewellery',
    name: 'Silver Elara',
    category: 'Jewellery boutique',
    description: 'A refined jewellery storefront for collections, gifting moments and artisan craftsmanship.',
    heroText: 'Crafted stories in every detail.',
    services: ['Wedding jewellery', 'Daily wear', 'Custom engraving', 'Gift boxes'],
    gallery: ['Necklace drops', 'Custom collections', 'Gift styling', 'Fine finishes']
  }
} as const;

const faqs = [
  ['What is included in the ₹999/year plan?', 'The V1 package includes business setup, template selection, essential content sections, gallery upload support, a mobile-friendly public website and simple publish access.'],
  ['Does this work for multiple business types?', 'Yes. The platform is designed for small businesses such as bakeries, salons, clinics, boutiques, service providers and local brands.'],
  ['Are future SaaS features already built in?', 'This V1 keeps the product lean and extension-ready: the core architecture is designed for multi-tenancy and future SaaS scaling without creating complexity in the first release.'],
  ['What is not included in V1?', 'V1 does not include payment gateways, advanced analytics, custom domains, complex CRM, automated billing or other advanced operational modules.']
];

const WebsitePreview: React.FC<{ title: string; accent: 'bakery' | 'salon' | 'jewellery' }> = ({ title, accent }) => {
  const palette = {
    bakery: 'bg-[#F7E7D5] text-[#0E2B22]',
    salon: 'bg-[#EAEAE2] text-[#0E2B22]',
    jewellery: 'bg-[#F2EFEA] text-[#0E2B22]'
  }[accent];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E4E4] bg-white shadow-[0_12px_30px_rgba(14,43,34,0.06)]">
      <div className="flex items-center gap-1.5 border-b border-[#EFEFEF] bg-[#F7F7F7] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#D7A4A0]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D8CBA4]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#9FBBA9]" />
        <span className="ml-2 truncate text-[9px] font-medium uppercase tracking-[0.12em] text-[#66736F]">example-brand.in</span>
      </div>
      <div className={`min-h-[230px] p-5 ${palette}`}>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-[#0E2B22]/75" />
          <div className="h-2 w-12 rounded bg-[#0E2B22]/20" />
        </div>
        <div className="mt-10 space-y-2">
          <div className="h-4 w-3/4 rounded bg-[#0E2B22]/80" />
          <div className="h-3 w-2/3 rounded bg-[#0E2B22]/35" />
          <div className="mt-5 h-8 w-24 rounded-full bg-[#C89B2B]" />
        </div>
        <div className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#0E2B22]/70">{title}</div>
      </div>
    </div>
  );
};

export const BusinessWebsitePage: React.FC<{ demoSlug?: string }> = ({ demoSlug }) => {
  const demoBusiness = demoSlug ? demoBusinesses[demoSlug as keyof typeof demoBusinesses] ?? demoBusinesses['demo-bakery'] : null;

  if (demoBusiness) {
    return (
      <div className="bg-[#fffaf4] text-[#1E1E1E]">
        <header className="border-b border-[#F1E2D3] bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C89B2B]">YBGP Websites</p>
              <h1 className="text-xl font-extrabold text-[#0E2B22]">{demoBusiness.name}</h1>
            </div>
            <a href="/websites/" className="inline-flex items-center gap-2 rounded-full bg-[#0E2B22] px-4 py-2 text-sm font-semibold text-white">Back to YBGP Websites</a>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
          <section className="grid gap-8 rounded-[30px] bg-[#0E2B22] p-6 text-white shadow-[0_20px_60px_rgba(14,43,34,0.12)] lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8CBA4]">{demoBusiness.category}</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight font-heading sm:text-5xl">{demoBusiness.heroText}</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">{demoBusiness.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#C89B2B] px-5 py-3 font-bold text-[#0E2B22]">Book a consultation <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                <a href="#services" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white">View services</a>
              </div>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-[#F7F4EE] p-5 text-[#0E2B22] shadow-inner">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B726E]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8C7AF]" />
                <span>Business preview</span>
              </div>
              <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EFEAE4] pb-3">
                  <div className="text-sm font-semibold">{demoBusiness.name}</div>
                  <span className="rounded-full bg-[#F7E8CB] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0E2B22]">Featured</span>
                </div>
                <div className="mt-4 space-y-3">
                  {demoBusiness.services.map((service) => (
                    <div key={service} className="flex items-center justify-between rounded-xl bg-[#F8F6F2] px-3 py-2 text-sm">
                      <span>{service}</span>
                      <CheckCircle2 className="h-4 w-4 text-[#0E2B22]" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="services" className="mt-16">
            <div className="mb-6 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C89B2B]">What is on offer</p>
              <h3 className="mt-3 text-3xl font-extrabold font-heading text-[#0E2B22]">Built around the real customer journey.</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {demoBusiness.services.map((service, index) => (
                <div key={service} className="rounded-2xl border border-[#E9E7E2] bg-white p-5 shadow-[0_10px_24px_rgba(14,43,34,0.04)]">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F7E8CB] text-[#0E2B22]">
                    {index % 2 === 0 ? <ShoppingBag className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  </div>
                  <h4 className="text-lg font-bold text-[#0E2B22]">{service}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#49524F]">Purpose-built to help this business showcase value clearly and convert enquiries with less friction.</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-[28px] border border-[#F0E5D4] bg-white p-6 shadow-[0_16px_40px_rgba(14,43,34,0.04)] sm:p-8">
            <div className="mb-6 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C89B2B]">Gallery</p>
              <h3 className="mt-3 text-3xl font-extrabold font-heading text-[#0E2B22]">A website that tells the story visually.</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {demoBusiness.gallery.map((item) => (
                <div key={item} className="rounded-2xl border border-[#F0E7E1] bg-[#FFF8F0] p-4">
                  <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4E7D5] via-[#F8F6F2] to-[#E9F0EB] text-sm font-semibold uppercase tracking-[0.12em] text-[#0E2B22]">{item}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] text-[#1E1E1E]">
      <section className="relative overflow-hidden bg-[#0E2B22] px-4 pb-16 pt-28 text-white sm:px-6 sm:pb-20 sm:pt-36">
        <div aria-hidden="true" className="absolute -right-24 -top-28 h-[30rem] w-[30rem] rounded-full bg-[#C89B2B]/10 blur-3xl" />
        <div aria-hidden="true" className="dot-grid absolute bottom-0 right-[8%] h-64 w-64 opacity-20" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D8CBA4]">YBGP Websites • V1 launch</p>
            <h1 className="section-title mt-5 max-w-3xl text-4xl font-extrabold leading-[1.04] font-heading sm:text-6xl lg:text-7xl">Launch your business website for ₹999/year.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">A clean, multi-tenant website platform for small businesses—built to help owners publish a credible online presence without the complexity of a full SaaS suite.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#C89B2B] px-6 py-4 text-base font-bold text-[#0E2B22] shadow-[0_12px_28px_rgba(200,155,43,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#D5AA3E]">
                Start my website <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href="/websites/demo-bakery/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10">View demo site</a>
            </div>
          </div>

          <div className="three-d-stage">
            <div className="three-d-card relative overflow-hidden rounded-[28px] border border-white/20 bg-white/95 p-6 text-[#0E2B22] shadow-[0_28px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-8">
              <div aria-hidden="true" className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] bg-[#C89B2B]/10" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Annual plan</p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-xl font-semibold text-[#1E1E1E]/35 line-through decoration-2 decoration-red-500">₹1,999</span>
                <span className="text-5xl font-semibold leading-none sm:text-6xl">₹999</span>
              </div>
              <p className="mt-3 text-base font-medium text-[#1E1E1E]/70">Per business, per year</p>
              <div className="mt-6 space-y-3 text-sm text-[#0E2B22]/80">
                <div className="flex items-center justify-between rounded-xl bg-[#F7F5F2] px-3 py-2"><span>Tenant-safe architecture</span><Check className="h-4 w-4 text-[#0E2B22]" aria-hidden="true" /></div>
                <div className="flex items-center justify-between rounded-xl bg-[#F7F5F2] px-3 py-2"><span>Template-based setup</span><Check className="h-4 w-4 text-[#0E2B22]" aria-hidden="true" /></div>
                <div className="flex items-center justify-between rounded-xl bg-[#F7F5F2] px-3 py-2"><span>Publish & update flow</span><Check className="h-4 w-4 text-[#0E2B22]" aria-hidden="true" /></div>
              </div>
              <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0E2B22] px-5 py-4 font-bold text-white transition-colors hover:bg-[#164537]">
                Discuss the plan <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="platform-includes-heading">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Built for V1</p>
            <h2 id="platform-includes-heading" className="section-title mt-4 text-3xl font-extrabold leading-tight text-[#0E2B22] font-heading sm:text-4xl">A lean, scalable system for the first real customers.</h2>
            <p className="mt-5 leading-relaxed text-[#1E1E1E]/70">This launch keeps the product focused on the immediate business goal: helping YBGP create, publish and manage small-business websites without heavy operational complexity.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {includedFeatures.map((feature) => (
              <li key={feature} className="soft-panel flex items-start gap-3 rounded-xl p-4 text-base transition-transform hover:-translate-y-0.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBD9A2] text-[#0E2B22]"><Check className="h-4 w-4" aria-hidden="true" /></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="platform-architecture-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">System design</p>
            <h2 id="platform-architecture-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">An architecture that stays ready for future SaaS growth.</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {platformHighlights.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-[0_12px_28px_rgba(14,43,34,0.04)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#F7E8CB] text-[#0E2B22]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[#0E2B22]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1E1E1E]/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="platform-workflow-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">V1 workflow</p>
            <h2 id="platform-workflow-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">From business setup to public website in one simple flow.</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map(([step, title, description]) => (
              <article key={step} className="rounded-2xl border border-[#E5E5E5] bg-[#F9F9F7] p-6">
                <span className="text-sm font-bold text-[#C89B2B]">{step}</span>
                <h3 className="mt-3 text-xl font-bold text-[#0E2B22]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1E1E1E]/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="template-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">Demo templates</p>
            <h2 id="template-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">A few fast starting points for different business types.</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <a href="/websites/demo-bakery/" className="group block"><WebsitePreview title="Bakery & gifting" accent="bakery" /></a>
            <a href="/websites/demo-salon/" className="group block"><WebsitePreview title="Salon & wellness" accent="salon" /></a>
            <a href="/websites/demo-jewellery/" className="group block"><WebsitePreview title="Jewellery boutique" accent="jewellery" /></a>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="v1-scope-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">V1 scope</p>
            <h2 id="v1-scope-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">Focused on the product that matters now.</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E5E5] bg-[#F9F9F7] p-6">
              <h3 className="text-xl font-bold text-[#0E2B22]">Included in V1</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#1E1E1E]/75">
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Business creation and tenant management</li>
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Template selection and published website output</li>
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Content updates from the business dashboard</li>
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Essential SEO, gallery and contact elements</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#E5E5E5] bg-[#F9F9F7] p-6">
              <h3 className="text-xl font-bold text-[#0E2B22]">Not in V1</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#1E1E1E]/75">
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Payments, invoices and automated billing</li>
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Custom domains and verification flows</li>
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Advanced analytics or CRM automation</li>
                <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-[#0E2B22]" aria-hidden="true" />Complex page-builder or AI tools</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-6 sm:px-6" aria-labelledby="final-cta-heading">
        <div className="mx-auto max-w-5xl rounded-[30px] bg-[#0E2B22] p-8 text-white shadow-[0_22px_60px_rgba(14,43,34,0.18)] sm:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D8CBA4]">Start with V1</p>
              <h2 id="final-cta-heading" className="mt-4 text-3xl font-extrabold font-heading sm:text-5xl">Create a clean digital presence for the next business you grow.</h2>
            </div>
            <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C89B2B] px-6 py-4 text-base font-bold text-[#0E2B22] transition-transform hover:-translate-y-0.5">
              Get started with YBGP Websites <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C89B2B]">FAQ</p>
            <h2 id="faq-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">Common questions about the V1 rollout.</h2>
          </div>
          <div className="mt-8 grid gap-4">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-[#E7E7E7] bg-[#F9F9F7] p-5">
                <h3 className="text-lg font-bold text-[#0E2B22]">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1E1E1E]/70">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessWebsitePage;
