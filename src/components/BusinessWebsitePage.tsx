import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Images, Link2, MapPin, Menu, MessageCircle, Share2, Smartphone, X } from 'lucide-react';
import { SITE_DATA } from '../data/siteData';
import { SocialBrandIcon, type SocialPlatform } from './websites/SocialBrandIcon';

const websiteOfferMessage = 'Hi YBGP, I am interested in getting my business website for ₹1,999/year. Please share the details.';
const websiteOfferUrl = `https://wa.me/${SITE_DATA.phoneRaw}?text=${encodeURIComponent(websiteOfferMessage)}`;

const websiteBenefits = [
  { title: 'Show What You Sell', description: 'Display your products, services and business photos in one place.', icon: Images },
  { title: 'Connect on WhatsApp', description: 'Make it easy for customers to contact you and ask about your business.', icon: MessageCircle },
  { title: 'One Link to Share', description: 'Bring your business details, social links and contact information together.', icon: Link2 },
  { title: 'Made for Mobile', description: 'Give customers a simple way to browse your website on their phones.', icon: Smartphone },
  { title: 'Your Location, One Tap Away', description: 'Show customers where to find you with your business address and Google Maps directions.', icon: MapPin },
  { title: 'All Your Social Links in One Place', description: 'Connect your Instagram, Facebook, YouTube and other social profiles directly from your website.', icon: Share2 }
];

const websiteSteps = [
  ['01', 'Choose Your Design', 'Explore the examples and choose a style that suits your business.'],
  ['02', 'Share Your Details', 'Send your business information, products, services and photos.'],
  ['03', 'Get Your Website', 'Launch your online presence with a link you can share with customers.']
];

import { demoThemes, demoBusinesses, type DemoBusiness, type DemoHighlight, type DemoProduct } from './websites/templateDefaults';

const faqs = [
  ['What is included in the ₹1,999/year plan?', 'A mobile-friendly business website with supported business details, products or services, a gallery and contact features. The final website depends on the selected design and the information you provide.'],
  ['Are there hosting or setup charges?', 'There are no hosting charges or setup fees under this plan. The annual website plan is ₹1,999, with no hidden platform charges. Optional third-party services, if requested, may have their own costs.'],
  ['Can I use it for my type of business?', 'YBGP Websites is designed for small businesses such as boutiques, jewellery stores, bakeries, salons, consultants and local service providers.'],
  ['Can customers contact me through WhatsApp?', 'Your website can display your business contact information and a WhatsApp contact option, wherever supported by your selected website setup.'],
  ['Can I update my website later?', 'Yes. Use your website dashboard to update supported business contact details, address, location and social links.'],
  ['Is a custom domain included?', 'The plan provides a shareable website link. Custom domain registration is not included; if you want a separate domain, it must be registered separately and may have an additional third-party cost.']
];

const WebsitePreview: React.FC<{ businessName: string; businessType: string; templateName: string; accent: 'bakery' | 'salon' | 'jewellery'; image: string }> = ({ businessName, businessType, templateName, accent, image }) => {
  const overlay = {
    bakery: 'from-[#28170f]/80 via-[#28170f]/25 to-transparent',
    salon: 'from-[#251b18]/75 via-[#251b18]/20 to-transparent',
    jewellery: 'from-[#171411]/75 via-[#171411]/15 to-transparent'
  }[accent];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E4E4] bg-white shadow-[0_12px_30px_rgba(14,43,34,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(14,43,34,0.13)]">
      <div className="relative h-56 overflow-hidden sm:h-64">
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className={`absolute inset-0 bg-gradient-to-t ${overlay}`} />
        <div className="absolute inset-x-5 bottom-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">{templateName} template</p>
          <h3 className="mt-2 font-heading text-2xl font-bold">{businessName}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <span className="text-sm font-medium text-[#54635a]">{businessType}</span>
        <span aria-hidden="true" className="inline-flex items-center gap-1 text-sm font-bold text-[#0E2B22]">Open demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </div>
  );
};

const SectionEyebrow: React.FC<{ label: string; accent: string }> = ({ label, accent }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>{label}</p>
);

const demoWhatsappUrl = (businessName: string, action: string) =>
  `https://wa.me/919953270270?text=${encodeURIComponent(`Hi, I'd like to ${action} at ${businessName}.`)}`;

const previewSocialPlatforms: SocialPlatform[] = ['instagram', 'facebook', 'youtube', 'linkedin', 'tiktok', 'x', 'pinterest'];

const DemoStorefront: React.FC<{ business: DemoBusiness; theme: (typeof demoThemes)[keyof typeof demoThemes] }> = ({ business, theme }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isModern = business.template === 'modern';
  const isBakery = business.template === 'bakery';
  const isSalon = business.template === 'salon';
  const isJewellery = business.template === 'jewellery';
  const isService = isSalon || isModern;
  const collectionId = isService ? 'services' : 'collections';
  const primaryAction = isBakery
    ? { href: demoWhatsappUrl(business.name, 'place an order'), external: true, label: 'Order on WhatsApp' }
    : isService
      ? { href: demoWhatsappUrl(business.name, isSalon ? 'book an appointment' : 'discuss a project'), external: true, label: isSalon ? 'Book Appointment' : 'Start a conversation' }
      : { href: '#collections', external: false, label: 'Explore Collection' };
  const navItems = isBakery
    ? [
        { label: 'Home', href: '#home' },
        { label: 'Menu', href: '#collections' },
        { label: 'Bestsellers', href: '#bestsellers' },
        { label: 'Our story', href: '#about' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Order', href: '#contact' }
      ]
    : isService
      ? [
          { label: 'Home', href: '#home' },
          { label: isModern ? 'What we do' : 'Services', href: '#services' },
          { label: isModern ? 'Ways to work together' : 'Most booked', href: '#bestsellers' },
          { label: isModern ? 'Our approach' : 'The studio', href: '#about' },
          { label: 'Gallery', href: '#gallery' },
          { label: isModern ? 'Contact' : 'Book', href: '#contact' }
        ]
      : [
          { label: 'Home', href: '#home' },
          { label: 'Collections', href: '#collections' },
          { label: 'New pieces', href: '#bestsellers' },
          { label: 'Craft', href: '#about' },
          { label: 'Gallery', href: '#gallery' },
          { label: 'Enquire', href: '#contact' }
        ];
  const whatsappUrl = demoWhatsappUrl(business.name, isSalon ? 'book an appointment' : isModern ? 'discuss a project' : isBakery ? 'place an order' : 'ask about a piece');
  const headerAction = isJewellery
    ? { href: whatsappUrl, external: true, label: 'WhatsApp Us' }
    : primaryAction;

  return (
    <div className={`min-h-screen ${isBakery ? 'font-sans' : ''}`} style={{ background: theme.pageBg, color: theme.text }}>
      <header className="sticky top-0 z-50 border-b" style={{ background: theme.headerSurface, borderColor: theme.border, backdropFilter: 'blur(18px)' }}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
          <a href="#home" className="flex min-w-0 items-center gap-3" aria-label={`${business.name} home`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold" style={{ background: theme.accentSoft, color: theme.accentDark }}>
              {business.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-heading text-lg font-bold leading-tight sm:text-xl" style={{ color: theme.accentDark }}>{business.name}</span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.18em]" style={{ color: theme.muted }}>{business.category}</span>
            </span>
          </a>

          <nav aria-label={`${business.name} main navigation`} className="hidden items-center gap-5 xl:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="whitespace-nowrap text-[13px] font-medium transition-opacity hover:opacity-65" style={{ color: theme.text }}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <a href={headerAction.href} target={headerAction.external ? '_blank' : undefined} rel={headerAction.external ? 'noopener noreferrer' : undefined} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5" style={{ background: theme.cta }}>
              {headerAction.label}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-semibold xl:hidden"
            style={{ borderColor: theme.border, color: theme.text, background: theme.panel }}
            aria-expanded={mobileNavOpen}
            aria-controls="demo-mobile-navigation"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {mobileNavOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        <nav id="demo-mobile-navigation" aria-label={`${business.name} mobile navigation`} hidden={!mobileNavOpen} className="border-t px-4 py-4 xl:hidden" style={{ borderColor: theme.border, background: theme.panel }}>
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 sm:grid-cols-3">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)} className="rounded-xl border px-3 py-3 text-sm font-medium" style={{ borderColor: theme.border, color: theme.text, background: theme.pageBg }}>
                {item.label}
              </a>
            ))}
            <a href={headerAction.href} target={headerAction.external ? '_blank' : undefined} rel={headerAction.external ? 'noopener noreferrer' : undefined} onClick={() => setMobileNavOpen(false)} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white sm:col-span-1" style={{ background: theme.cta }}>
              {headerAction.label} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </header>

      <main>
        {isBakery ? (
          <section id="home" className="relative mx-auto mt-4 min-h-[570px] max-w-[1440px] overflow-hidden sm:mt-6 sm:min-h-[620px] sm:rounded-[28px] lg:min-h-[700px]">
            <img src={business.hero.image} alt={business.hero.alt} className="absolute inset-0 h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(31,17,10,0.82) 0%, rgba(39,22,14,0.52) 48%, rgba(39,22,14,0.04) 100%)' }} />
            <div className="relative flex min-h-[570px] max-w-3xl flex-col justify-center px-5 py-14 sm:min-h-[620px] sm:px-10 lg:min-h-[700px] lg:px-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d5af]">{business.hero.eyebrow}</p>
              <h1 className="mt-5 max-w-[660px] font-heading text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">{business.hero.title}</h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">{business.hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={primaryAction.href} target={primaryAction.external ? '_blank' : undefined} rel={primaryAction.external ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:px-6 sm:text-base" style={{ background: theme.cta }}>
                  {business.hero.primaryCta} <ArrowRight className="h-4 w-4" />
                </a>
                <a href={`#${collectionId}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:px-6 sm:text-base">
                  Browse the menu
                </a>
              </div>
              <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-white/75">Small batches · baked fresh · made to share</p>
            </div>
          </section>
        ) : isService ? (
          <section id="home" className="mx-auto grid max-w-[1440px] overflow-hidden lg:min-h-[650px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:order-1 lg:px-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.label }}>{business.hero.eyebrow}</p>
              <h1 className="mt-5 max-w-xl font-heading text-5xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[5.25rem]">{business.hero.title}</h1>
              <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg" style={{ color: theme.muted }}>{business.hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={primaryAction.href} target={primaryAction.external ? '_blank' : undefined} rel={primaryAction.external ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: theme.cta }}>
                  {business.hero.primaryCta} <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#services" className="inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold sm:text-base" style={{ borderColor: theme.border, color: theme.text }}>
                  {isModern ? 'Explore what we do' : 'Explore services'}
                </a>
              </div>
              <div className="mt-10 border-t pt-5 text-xs font-medium uppercase tracking-[0.18em]" style={{ borderColor: theme.border, color: theme.muted }}>{isModern ? 'Clear thinking · considered design · practical support' : 'Considered care · expert hands · time for you'}</div>
            </div>
            <div className="order-1 h-[330px] overflow-hidden sm:h-[440px] lg:order-2 lg:h-[650px]">
              {isModern ? (
                <div role="img" aria-label={business.hero.alt} className="relative h-full overflow-hidden bg-[#dce9df]">
                  <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#b8cfbd]/70 blur-2xl" />
                  <div aria-hidden="true" className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[#eadbb2]/65 blur-2xl" />
                  <div className="absolute left-[8%] top-[15%] w-[82%] overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_28px_70px_rgba(24,54,41,0.14)] sm:left-[12%] sm:top-[18%]">
                    <div className="flex items-center justify-between border-b border-[#e6ece7] px-5 py-4">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#294a38]">Northline Studio</span>
                      <span className="rounded-full bg-[#e9f1eb] px-3 py-1 text-[10px] font-semibold text-[#587464]">Project overview</span>
                    </div>
                    <div className="grid gap-5 p-5 sm:grid-cols-[1fr_0.8fr] sm:p-7">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8d7026]">A clear way forward</p>
                        <p className="mt-3 max-w-xs font-heading text-2xl font-semibold leading-tight text-[#183629] sm:text-3xl">Make your next move with confidence.</p>
                        <div className="mt-5 h-2 w-4/5 rounded-full bg-[#e6ece7]" />
                        <div className="mt-2 h-2 w-3/5 rounded-full bg-[#edf1ed]" />
                        <div className="mt-5 inline-flex rounded-full bg-[#183629] px-4 py-2 text-xs font-semibold text-white">Explore our services</div>
                      </div>
                      <div className="flex flex-col justify-center gap-3">
                        {['Strategy & direction', 'Digital experiences', 'Ongoing support'].map((service, index) => (
                          <div key={service} className="flex items-center gap-3 rounded-xl border border-[#e6ece7] p-3">
                            <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${index === 1 ? 'bg-[#f4ecd9] text-[#8d7026]' : 'bg-[#e9f1eb] text-[#294a38]'}`}>0{index + 1}</span>
                            <span className="text-xs font-semibold text-[#52685b]">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="absolute bottom-[11%] right-[8%] rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-semibold text-[#294a38] shadow-md">Thoughtful work, made personal</span>
                </div>
              ) : (
                <img src={business.hero.image} alt={business.hero.alt} className="h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
              )}
            </div>
          </section>
        ) : (
          <section id="home" className="mx-auto grid max-w-[1440px] overflow-hidden bg-[#171411] lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="order-2 flex flex-col justify-center px-5 py-12 text-[#f8f5ef] sm:px-12 sm:py-16 lg:order-1 lg:px-20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c5a77e]">{business.hero.eyebrow}</p>
              <h1 className="mt-6 max-w-xl font-heading text-5xl font-normal leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[5.5rem]">{business.hero.title}</h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">{business.hero.description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#collections" className="inline-flex min-h-12 w-fit items-center gap-3 border-b border-[#c5a77e] pb-2 text-sm font-medium text-[#e8d3b1] transition-colors hover:text-white sm:text-base">
                  Explore the collection <ArrowRight className="h-4 w-4" />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-white sm:text-sm">WhatsApp us</a>
              </div>
              <p className="mt-12 text-[10px] uppercase tracking-[0.24em] text-white/45">Made to hold a story</p>
            </div>
            <div className="order-1 h-[350px] overflow-hidden bg-[#2b2722] sm:h-[470px] lg:order-2 lg:h-[680px]">
              <img src={business.hero.image} alt={business.hero.alt} className="h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
            </div>
          </section>
        )}

        <section id={collectionId} className="scroll-mt-24 mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <div className={`mb-8 ${isJewellery ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
            <SectionEyebrow label={isSalon ? 'The Maison Gloss menu' : isModern ? 'What we do' : isBakery ? 'From the counter' : 'The Elara collection'} accent={theme.label} />
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              {isBakery ? 'A little something for every kind of gathering.' : isSalon ? 'Care that starts with listening.' : isModern ? 'The right support for your next step.' : 'Pieces with presence. Made for your own story.'}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: theme.muted }}>{business.summary}</p>
          </div>

          <div className={`grid gap-5 ${isBakery ? 'sm:grid-cols-2 xl:grid-cols-4' : isService ? 'sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10' : 'sm:grid-cols-2 lg:grid-cols-4 lg:gap-8'}`}>
            {business.highlights.map((item, index) => (
              <article key={item.title} className={`${isService ? 'group' : isBakery ? 'overflow-hidden border shadow-[0_16px_36px_rgba(61,34,18,0.08)]' : 'overflow-hidden border-b pb-5'}`} style={isBakery ? { background: theme.panel, borderColor: theme.border } : !isService ? { borderColor: theme.border } : undefined}>
                <div className={`overflow-hidden ${isBakery ? 'h-[260px] sm:h-[300px]' : isService ? 'h-[300px] sm:h-[360px]' : `h-[300px] sm:h-[380px] ${index % 2 === 1 ? 'lg:mt-12' : ''}`}`}>
                  <img src={item.image} alt={item.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                </div>
                <div className={`${isBakery ? 'p-5' : isService ? 'pt-5' : 'pt-4'}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: theme.label }}>{isService ? `0${index + 1} / ${business.category}` : item.title}</p>
                  <h3 className="mt-2 font-heading text-xl font-semibold sm:text-2xl" style={{ color: theme.accentDark }}>{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>{item.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          {isBakery ? (
            <div className="grid overflow-hidden lg:grid-cols-[1fr_1fr]" style={{ background: theme.panelStrong }}>
              <img src={business.story.image} alt={business.story.alt} className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[560px]" loading="lazy" />
              <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
                <SectionEyebrow label={business.story.eyebrow} accent={theme.label} />
                <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-tight sm:text-4xl">{business.story.title}</h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: theme.muted }}>{business.story.description}</p>
                <a href="#contact" className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold" style={{ color: theme.accentStrong }}>{business.story.cta} <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
          ) : isService ? (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
              <div className="relative">
                <img src={business.story.image} alt={business.story.alt} className="h-[380px] w-full object-cover sm:h-[520px] lg:h-[600px]" loading="lazy" />
                <span className="absolute bottom-4 left-4 max-w-[240px] bg-white/90 px-4 py-3 font-heading text-lg italic shadow-sm sm:bottom-8 sm:left-8 sm:text-xl" style={{ color: theme.accentDark }}>{isModern ? 'Thoughtful work, made personal.' : 'A softer kind of salon day.'}</span>
              </div>
              <div className="max-w-xl py-3 lg:py-10">
                <SectionEyebrow label={business.story.eyebrow} accent={theme.label} />
                <h2 className="mt-4 font-heading text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl">{business.story.title}</h2>
                <p className="mt-5 text-base leading-relaxed" style={{ color: theme.muted }}>{business.story.description}</p>
                <div className="mt-7 space-y-3 border-t pt-5" style={{ borderColor: theme.border }}>
                  {business.story.points.map((point) => <p key={point} className="text-sm font-medium">{point}</p>)}
                </div>
                <a href="#contact" className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: theme.cta }}>{business.story.cta} <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 bg-[#eae4dc] p-5 sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:p-12">
              <div className="flex flex-col justify-center">
                <SectionEyebrow label={business.story.eyebrow} accent={theme.label} />
                <h2 className="mt-4 font-heading text-3xl font-normal leading-tight tracking-[-0.03em] sm:text-4xl">{business.story.title}</h2>
                <p className="mt-5 text-sm leading-relaxed sm:text-base" style={{ color: theme.muted }}>{business.story.description}</p>
                <a href="#contact" className="mt-7 inline-flex w-fit items-center gap-2 border-b pb-2 text-sm font-semibold" style={{ borderColor: theme.accent, color: theme.accentDark }}>{business.story.cta} <ArrowRight className="h-4 w-4" /></a>
              </div>
              <img src={business.story.image} alt={business.story.alt} className="h-[320px] w-full object-cover sm:h-[460px] lg:h-[580px]" loading="lazy" />
            </div>
          )}
        </section>

        <section id="bestsellers" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow label={isSalon ? 'Most requested' : isModern ? 'Ways to work together' : isBakery ? 'Customer favourites' : 'A few beloved pieces'} accent={theme.label} />
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{isSalon ? 'The appointments guests return for.' : isModern ? 'Focused support, built around you.' : isBakery ? 'The ones that disappear first.' : 'The signatures that stay with you.'}</h2>
            </div>
            <a href="#contact" className="inline-flex w-fit items-center gap-2 text-sm font-semibold" style={{ color: theme.accentStrong }}>{isSalon ? 'Book a visit' : isModern ? 'Talk through your goals' : isBakery ? 'Order a favourite' : 'Ask about a piece'} <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className={`grid gap-5 ${isBakery ? 'sm:grid-cols-3' : 'md:grid-cols-3'}`}>
            {business.bestsellers.map((item) => (
              <article key={item.name} className={isJewellery ? '' : 'overflow-hidden border'} style={!isJewellery ? { background: theme.panel, borderColor: theme.border } : undefined}>
                <img src={item.image} alt={item.alt} className={`${isSalon ? 'h-[320px] sm:h-[380px]' : 'h-[280px] sm:h-[340px]'} w-full object-cover`} loading="lazy" />
                <div className="px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-semibold sm:text-xl">{item.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>{item.description}</p>
                    </div>
                    {item.price && <span className="shrink-0 pt-1 text-xs font-semibold" style={{ color: theme.label }}>{item.price}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className={`mb-8 ${isJewellery ? 'mx-auto max-w-xl text-center' : 'max-w-2xl'}`}>
            <SectionEyebrow label={isSalon ? 'Inside the studio' : isModern ? 'Selected work' : isBakery ? 'A peek behind the counter' : 'Details in their own light'} accent={theme.label} />
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{isSalon ? 'A little of the Maison Gloss feeling.' : isModern ? 'A few things we are proud to have shaped.' : isBakery ? 'Made, dressed and shared with care.' : 'A closer look at the little things.'}</h2>
          </div>
          <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${isBakery ? 'lg:grid-cols-4' : isService ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            {business.gallery.map((item, index) => (
              <figure key={item.image} className={`${isBakery && index === 0 ? 'col-span-2 row-span-2' : ''} ${isService && index === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2' : ''} ${!isBakery && !isService && (index === 1 || index === 4) ? 'row-span-2' : ''} overflow-hidden`}>
                <img src={item.image} alt={item.alt} className={`h-full w-full object-cover ${isBakery && index === 0 ? 'min-h-[300px] sm:min-h-[360px]' : 'min-h-[160px] sm:min-h-[220px] lg:min-h-[260px]'}`} loading="lazy" />
              </figure>
            ))}
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className={`flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between ${isJewellery ? 'bg-[#171411] text-white' : ''}`} style={!isJewellery ? { background: theme.panelStrong } : undefined}>
            <div className="max-w-2xl">
              <SectionEyebrow label={isSalon ? 'Make a little time for you' : isModern ? 'Your next step starts here' : isBakery ? 'Tell us what you are celebrating' : 'A piece, chosen personally'} accent={isJewellery ? '#c5a77e' : theme.label} />
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{business.finalCta.title}</h2>
              <p className="mt-3 text-base leading-relaxed" style={{ color: isJewellery ? 'rgba(255,255,255,0.68)' : theme.muted }}>{business.finalCta.description}</p>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: theme.cta }}>
              {business.finalCta.button} <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
          <div className="grid overflow-hidden border" style={{ borderColor: theme.border, background: theme.panel }}>
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <SectionEyebrow label="Visit or get in touch" accent={theme.label} />
                <h2 className="mt-3 font-heading text-3xl font-semibold">We would love to hear from you.</h2>
                <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>{business.name} is a sample business website. Replace the sample details and connect your own channels before launch.</p>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: theme.accentStrong }} /><div><p className="font-semibold">Location</p><p className="mt-1" style={{ color: theme.muted }}>{business.location.label}</p></div></div>
                  <div className="flex gap-3"><span className="mt-0.5 text-base" style={{ color: theme.accentStrong }}>◷</span><div><p className="font-semibold">Opening hours</p><p className="mt-1" style={{ color: theme.muted }}>{business.openingHours}</p></div></div>
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.location.query)}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: theme.cta }}><MapPin aria-hidden="true" size={17} />Find us on Google Maps</a>
                <div className="mt-8 border-t pt-5" style={{ borderColor: theme.border }}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: theme.label }}>Social profiles</p>
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Social profile examples">
                    {previewSocialPlatforms.map((platform) => <span key={platform} title={`${platform} profile link`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border" style={{ color: theme.accentDark, borderColor: theme.border }}><SocialBrandIcon platform={platform} size={18} /></span>)}
                  </div>
                  <p className="mt-2 text-xs" style={{ color: theme.muted }}>Add your profile URLs in the website dashboard to make these official brand icons clickable.</p>
                </div>
              </div>
              <div className="min-h-[300px] overflow-hidden bg-[#e9ece8]">
                <iframe title={`Map showing the sample ${business.location.query} location`} src={`https://www.google.com/maps?q=${encodeURIComponent(business.location.query)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[300px] w-full border-0" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ background: theme.panel, borderColor: theme.border }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div>
            <p className="font-heading text-lg font-semibold" style={{ color: theme.accentDark }}>{business.name}</p>
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>{business.category} · {business.location.query}</p>
          </div>
          <nav aria-label={`${business.name} footer navigation`} className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium" style={{ color: theme.muted }}>
            {navItems.slice(1, 5).map((item) => <a key={item.href} href={item.href} className="hover:underline">{item.label}</a>)}
          </nav>
          <p className="text-[10px]" style={{ color: theme.muted }}>YBGP {business.templateName} demo</p>
        </div>
      </footer>
    </div>
  );
};

export const BusinessWebsitePage: React.FC<{ demoSlug?: string }> = ({ demoSlug }) => {
  const demoBusiness = demoSlug ? demoBusinesses[demoSlug] ?? demoBusinesses['demo-bakery'] : null;

  useEffect(() => {
    if (!demoBusiness) return;

    document.title = demoBusiness.seoTitle;
    const metaDescription = document.head.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', demoBusiness.summary);
    document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex');
  }, [demoBusiness]);

  if (demoBusiness) {
    const theme = demoBusiness.template === 'modern'
      ? demoThemes.modern
      : demoBusiness.template === 'bakery'
      ? demoThemes.bakery
      : demoBusiness.template === 'salon'
        ? demoThemes.salon
        : demoThemes.jewellery;

    return <DemoStorefront business={demoBusiness} theme={theme} />;
  }

  return (
    <div className="bg-[#F8F7F3] text-[#1E1E1E]">
      <section className="relative overflow-hidden bg-[#0E2B22] px-4 pb-14 pt-24 text-white sm:px-6 sm:pb-20 sm:pt-32" aria-labelledby="website-hero-heading">
        <div aria-hidden="true" className="absolute -right-24 -top-28 h-[30rem] w-[30rem] rounded-full bg-[#C89B2B]/10 blur-3xl" />
        <div aria-hidden="true" className="dot-grid absolute bottom-0 right-[8%] hidden h-64 w-64 opacity-15 sm:block" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8D69D] sm:text-xs">YBGP Websites · Special annual offer</p>
            <h1 id="website-hero-heading" className="section-title mt-4 max-w-2xl text-[2.2rem] font-extrabold leading-[1.05] tracking-[-0.035em] font-heading sm:mt-5 sm:text-6xl lg:text-[4.2rem]">
              Your Business.<br />Your Own Website.
            </h1>
            <p className="mt-4 text-base font-semibold text-white/90 sm:mt-5 sm:text-lg">Instagram par business? Ab apni website bhi banaiye.</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">Show your products and services, share one simple link, and let customers contact you directly on WhatsApp.</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 lg:hidden">
              <span className="text-2xl font-extrabold leading-none text-white">₹1,999/year</span>
              <span className="text-sm font-medium text-white/65 line-through">₹4,999/year</span>
              <span className="text-xs font-semibold text-[#E8D69D]">Save ₹3,000 · 60% OFF</span>
              <span className="basis-full text-xs text-white/70">No hosting charges · No setup fee</span>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D6B85A] px-6 py-3 text-sm font-bold text-[#0E2B22] shadow-[0_10px_24px_rgba(200,155,43,0.24)] transition-colors hover:bg-[#E4CA76] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
                Get My Website <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#website-demos" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
                View Live Demos
              </a>
            </div>
          </div>

          <div className="three-d-stage w-full">
            <div className="three-d-card relative overflow-hidden rounded-[26px] border border-[#E8D69D]/60 bg-white p-5 text-[#0E2B22] shadow-[0_28px_70px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-8">
              <div aria-hidden="true" className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] bg-[#C89B2B]/10" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78601F]">Annual plan</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-base font-semibold text-[#66736F] line-through decoration-1">₹4,999/year</span>
                <span className="rounded-full bg-[#F5EDD3] px-3 py-1 text-xs font-bold text-[#66521E]">Save ₹3,000 · 60% OFF</span>
              </div>
              <p className="mt-1 text-[2.85rem] font-extrabold leading-none tracking-tight text-[#0E2B22] sm:text-6xl">₹1,999<span className="ml-1 text-base font-semibold tracking-normal text-[#526258]">/year</span></p>
              <ul className="mt-5 space-y-2.5 text-sm text-[#33463D] sm:mt-6">
                {['Mobile-friendly business website', 'Products, services and business photos', 'WhatsApp contact option'].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9F0E9] text-[#0E2B22]"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span><span>{feature}</span></li>
                ))}
              </ul>
              <p className="mt-4 border-t border-[#E8E5DC] pt-3 text-xs font-semibold leading-5 text-[#526258]">No hosting charges · No setup fee · No hidden platform charges</p>
              <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0E2B22] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#194638] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22] motion-reduce:transition-none">
                Get Started on WhatsApp <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="website-demos" className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="website-demos-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8D7026]">Live website demos</p>
            <h2 id="website-demos-heading" className="section-title mt-3 text-3xl font-extrabold leading-tight text-[#0E2B22] font-heading sm:text-4xl">See What Your Website Could Look Like</h2>
            <p className="mt-3 text-sm leading-6 text-[#5B655F] sm:text-base">Explore live examples for different types of businesses.</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 xl:grid-cols-4">
            <a href="/websites/demo-modern/" aria-label="Open live demo: Northline Studio, modern business" className="group block overflow-hidden rounded-2xl border border-[#E8E3D9] bg-white shadow-[0_8px_24px_rgba(14,43,34,0.05)] transition-shadow hover:shadow-[0_16px_36px_rgba(14,43,34,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22] motion-reduce:transition-none">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#e5eee8]"><img src="/demo-sites/modern/workspace.jpg" alt="A bright, contemporary studio meeting space" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#294a38]">Live demo</span></div>
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5"><div><h3 className="font-heading text-lg font-bold text-[#0E2B22]">Northline Studio</h3><p className="mt-1 text-sm text-[#68746C]">Modern business</p></div><ArrowRight className="h-5 w-5 shrink-0 text-[#8D7026] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></div>
            </a>
            <a href="/websites/demo-bakery/" aria-label="Open live demo: Aroma & Crumb, bakery and gifting" className="group block overflow-hidden rounded-2xl border border-[#E8E3D9] bg-white shadow-[0_8px_24px_rgba(14,43,34,0.05)] transition-shadow hover:shadow-[0_16px_36px_rgba(14,43,34,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22] motion-reduce:transition-none">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F2E6D9]"><img src="/demo-sites/bakery/hero.jpg" alt="A freshly decorated celebration cake from the Aroma & Crumb bakery demo" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#604330]">Live demo</span></div>
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5"><div><h3 className="font-heading text-lg font-bold text-[#0E2B22]">Aroma &amp; Crumb</h3><p className="mt-1 text-sm text-[#68746C]">Bakery &amp; gifting</p></div><ArrowRight className="h-5 w-5 shrink-0 text-[#8D7026] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></div>
            </a>
            <a href="/websites/demo-salon/" aria-label="Open live demo: Maison Gloss, salon and wellness" className="group block overflow-hidden rounded-2xl border border-[#E8E3D9] bg-white shadow-[0_8px_24px_rgba(14,43,34,0.05)] transition-shadow hover:shadow-[0_16px_36px_rgba(14,43,34,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22] motion-reduce:transition-none">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F2E6D9]"><img src="/demo-sites/salon/hero.jpg" alt="The calm, modern Maison Gloss salon interior" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#604330]">Live demo</span></div>
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5"><div><h3 className="font-heading text-lg font-bold text-[#0E2B22]">Maison Gloss</h3><p className="mt-1 text-sm text-[#68746C]">Salon &amp; wellness</p></div><ArrowRight className="h-5 w-5 shrink-0 text-[#8D7026] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></div>
            </a>
            <a href="/websites/demo-jewellery/" aria-label="Open live demo: Silver Elara, jewellery boutique" className="group block overflow-hidden rounded-2xl border border-[#E8E3D9] bg-white shadow-[0_8px_24px_rgba(14,43,34,0.05)] transition-shadow hover:shadow-[0_16px_36px_rgba(14,43,34,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22] motion-reduce:transition-none sm:col-span-2 lg:col-span-1">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F2E6D9]"><img src="/demo-sites/jewellery/hero.jpg" alt="Sculptural jewellery photographed for the Silver Elara boutique demo" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#604330]">Live demo</span></div>
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5"><div><h3 className="font-heading text-lg font-bold text-[#0E2B22]">Silver Elara</h3><p className="mt-1 text-sm text-[#68746C]">Jewellery boutique</p></div><ArrowRight className="h-5 w-5 shrink-0 text-[#8D7026] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></div>
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="website-benefits-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8D7026]">Made for small businesses</p>
            <h2 id="website-benefits-heading" className="section-title mt-3 text-3xl font-extrabold leading-tight text-[#0E2B22] font-heading sm:text-4xl">Everything Your Business Needs to Get Online</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3">
            {websiteBenefits.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-[#E8E3D9] bg-[#FBFAF7] p-5 sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1E8CC] text-[#0E2B22]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-bold text-[#0E2B22]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5B655F]">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#526259]"><span className="font-bold text-[#0E2B22]">Easy to Update:</span> Update supported business details, location and social links through your website dashboard.</p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="website-steps-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8D7026]">Simple to get started</p>
            <h2 id="website-steps-heading" className="section-title mt-3 text-3xl font-extrabold leading-tight text-[#0E2B22] font-heading sm:text-4xl">Get Your Business Website in 3 Simple Steps</h2>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-3 lg:mt-8">
            {websiteSteps.map(([step, title, description]) => (
              <li key={step} className="rounded-2xl border border-[#E8E3D9] bg-white p-5 sm:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0E2B22] text-sm font-bold text-[#E8D69D]">{step}</span>
                <h3 className="mt-4 text-lg font-bold text-[#0E2B22]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5B655F]">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="website-faq-heading">
        <div className="mx-auto max-w-3xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8D7026]">Frequently asked questions</p>
            <h2 id="website-faq-heading" className="section-title mt-3 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">A few things you may want to know</h2>
          </div>
          <div className="mt-6 space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group rounded-xl border border-[#E8E3D9] bg-[#FBFAF7] px-4 py-4 open:bg-white sm:px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#0E2B22] marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22]">
                  {question}
                  <span aria-hidden="true" className="text-xl leading-none text-[#8D7026] transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-6 text-[#5B655F]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="website-final-cta-heading">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-[#0E2B22] p-6 text-white shadow-[0_20px_55px_rgba(14,43,34,0.15)] sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#C89B2B]/25" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8D69D]">Ready to get started?</p>
            <h2 id="website-final-cta-heading" className="section-title mt-3 text-3xl font-extrabold leading-tight font-heading sm:text-4xl lg:text-5xl">Give Your Business Its Own Website.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">Get started for just ₹1,999/year. Show your business, share your link and make it easier for customers to reach you.</p>
            <p className="mt-4 text-xs font-semibold text-[#E8D69D] sm:text-sm">₹1,999/year · No hosting charges · No setup fee</p>
            <a href={websiteOfferUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#D6B85A] px-6 py-3 text-sm font-bold text-[#0E2B22] transition-colors hover:bg-[#E4CA76] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
              Get My Website on WhatsApp <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessWebsitePage;
