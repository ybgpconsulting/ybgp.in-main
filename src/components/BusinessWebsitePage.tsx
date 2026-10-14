import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, MessageCircle, LayoutTemplate, Store, ShieldCheck, Sparkles, Camera, ShoppingBag, Star, MapPin, Clock3, Menu, ChevronRight, X } from 'lucide-react';

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

const demoThemes = {
  bakery: {
    pageBg: '#f9f1ea',
    panel: '#fffaf6',
    panelStrong: '#f4e4d5',
    headerSurface: 'rgba(255,255,255,0.78)',
    text: '#1d120d',
    muted: '#6b4b3b',
    accent: '#b15f42',
    accentSoft: '#f8e4d9',
    accentDark: '#40251a',
    accentStrong: '#a04a2b',
    border: '#eddfd2',
    label: '#a8643d',
    heroOverlay: 'linear-gradient(90deg, rgba(22,12,8,0.72), rgba(38,24,17,0.2))',
    cta: '#b15f42'
  },
  salon: {
    pageBg: '#f7f3ef',
    panel: '#fffdfb',
    panelStrong: '#f0e5df',
    headerSurface: 'rgba(255,255,255,0.72)',
    text: '#201a17',
    muted: '#6e5651',
    accent: '#b98474',
    accentSoft: '#f3e4df',
    accentDark: '#3c2e2b',
    accentStrong: '#8f5c54',
    border: '#eadfd9',
    label: '#8c5d55',
    heroOverlay: 'linear-gradient(90deg, rgba(33,23,20,0.72), rgba(33,23,20,0.12))',
    cta: '#8f5c54'
  },
  jewellery: {
    pageBg: '#f5f2ee',
    panel: '#fdfbf9',
    panelStrong: '#efe5dc',
    headerSurface: 'rgba(255,255,255,0.74)',
    text: '#1b1715',
    muted: '#625b57',
    accent: '#9d7655',
    accentSoft: '#efe5d9',
    accentDark: '#1a1818',
    accentStrong: '#876444',
    border: '#e7e0da',
    label: '#8d6a4d',
    heroOverlay: 'linear-gradient(90deg, rgba(13,13,13,0.68), rgba(13,13,13,0.22))',
    cta: '#8d6a4d'
  }
} as const;

type DemoHighlight = {
  title: string;
  subtitle: string;
  image: string;
  alt: string;
};

type DemoProduct = {
  name: string;
  image: string;
  alt: string;
  description: string;
  price?: string;
};

type DemoBusiness = {
  slug: string;
  template: 'bakery' | 'salon' | 'jewellery';
  templateName: string;
  name: string;
  category: string;
  seoTitle: string;
  summary: string;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    image: string;
    alt: string;
  };
  highlights: DemoHighlight[];
  story: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    alt: string;
    points: string[];
    cta: string;
  };
  bestsellers: DemoProduct[];
  gallery: { image: string; alt: string }[];
  finalCta: { title: string; description: string; button: string };
};

const demoBusinesses: Record<string, DemoBusiness> = {
  'demo-bakery': {
    slug: 'demo-bakery',
    template: 'bakery',
    templateName: 'The Bakehouse',
    name: 'Aroma & Crumb',
    category: 'Bakery & gifting studio',
    seoTitle: 'Aroma & Crumb | Artisan Bakery Demo',
    summary: 'Custom cakes, handcrafted desserts and thoughtful gifting for every celebration.',
    hero: {
      eyebrow: 'Artisan Bakery & Gifting',
      title: 'Freshly baked moments, made to be remembered.',
      description: 'Custom cakes, handcrafted desserts and thoughtful gifting for every celebration.',
      primaryCta: 'Order on WhatsApp',
      image: '/demo-sites/bakery/hero.jpg',
      alt: 'A celebration cake with fresh berries and a warm bakery backdrop'
    },
    highlights: [
      { title: 'Celebration Cakes', subtitle: 'Bespoke layers and thoughtful finishes for birthdays and milestones.', image: '/demo-sites/bakery/collection-1.jpg', alt: 'Slices of rich chocolate cake ready to share' },
      { title: 'Brownies & Desserts', subtitle: 'Small-batch treats, made for passing around the table.', image: '/demo-sites/bakery/collection-2.jpg', alt: 'Freshly baked brownies with a glossy chocolate finish' },
      { title: 'Gift Hampers', subtitle: 'A considered mix of sweet things for hosts and celebrations.', image: '/demo-sites/bakery/collection-3.jpg', alt: 'A small batch of handmade bakery sweets arranged for sharing' },
      { title: 'Custom Cakes', subtitle: 'Flavours and finishes shaped around your celebration.', image: '/demo-sites/bakery/collection-4.jpg', alt: 'A decorated cake ready for a special occasion' }
    ],
    story: {
      eyebrow: 'Our story',
      title: 'Baked for everyday rituals and unforgettable celebrations.',
      description: 'At Aroma & Crumb, every order starts with a simple idea: beautifully made treats that make gatherings feel warmer, more thoughtful and more personal. We bake in small batches, mix in seasonal ingredients and design finishes that feel premium without losing the warmth of a neighbourhood bakery.',
      image: '/demo-sites/bakery/story.jpg',
      alt: 'A baker shaping fresh dough at a flour-dusted worktable',
      points: ['Small-batch artisan baking', 'Custom celebration cakes', 'Thoughtful gifting and event styling'],
      cta: 'Plan your celebration'
    },
    bestsellers: [
      { name: 'Cocoa Velvet Cake', image: '/demo-sites/bakery/bestseller-1.jpg', alt: 'A chocolate layer cake finished with smooth ganache', description: 'Dark chocolate layers with a silky ganache finish.', price: '₹2,199' },
      { name: 'Berry Celebration Slice', image: '/demo-sites/bakery/bestseller-2.jpg', alt: 'A berry-topped cake slice served with fresh fruit', description: 'Soft sponge, bright berries and a delicate cream finish.', price: '₹499' },
      { name: 'Brown Butter Cupcake', image: '/demo-sites/bakery/bestseller-3.jpg', alt: 'A small chocolate cupcake topped with buttercream', description: 'A tender crumb, rich cocoa and a swirl of house-made frosting.', price: '₹220' }
    ],
    gallery: [
      { image: '/demo-sites/bakery/gallery-1.jpg', alt: 'A bright celebration cake layered with fresh orange and cream' },
      { image: '/demo-sites/bakery/gallery-2.jpg', alt: 'Freshly baked pastries displayed together on a bakery tray' },
      { image: '/demo-sites/bakery/gallery-3.jpg', alt: 'A wholegrain loaf dusted with flour before baking' },
      { image: '/demo-sites/bakery/gallery-4.jpg', alt: 'A bakery gift box packed with assorted fruit-topped pastries' },
      { image: '/demo-sites/bakery/gallery-5.jpg', alt: 'A layered chocolate cake slice plated for serving' },
      { image: '/demo-sites/bakery/gallery-6.jpg', alt: 'A bakery counter filled with fresh loaves and pastries' }
    ],
    finalCta: {
      title: 'Planning something sweet?',
      description: 'Tell us the occasion and we will help shape a cake, hamper or dessert table that feels just right.',
      button: 'WhatsApp us'
    }
  },
  'demo-salon': {
    slug: 'demo-salon',
    template: 'salon',
    templateName: 'The Beauty Studio',
    name: 'Maison Gloss',
    category: 'Salon & wellness studio',
    seoTitle: 'Maison Gloss | Salon & Wellness Demo',
    summary: 'Thoughtful beauty experiences designed around your style, confidence and wellbeing.',
    hero: {
      eyebrow: 'Salon & Wellness Studio',
      title: 'Beauty, refined.',
      description: 'Thoughtful beauty experiences designed around your style, confidence and wellbeing.',
      primaryCta: 'Book Appointment',
      image: '/demo-sites/salon/hero.jpg',
      alt: 'A refined salon interior with dark walls, mirrors and styling chairs'
    },
    highlights: [
      { title: 'The Signature Cut', subtitle: 'Shape, movement and an easy finish tailored to your hair.', image: '/demo-sites/salon/service-1.jpg', alt: 'A stylist sectioning a client’s hair for a precision cut' },
      { title: 'Colour Atelier', subtitle: 'Natural-looking dimension with a considered gloss and tone.', image: '/demo-sites/salon/service-2.jpg', alt: 'A stylist curling a client’s hair into soft, polished waves' },
      { title: 'Skin Rituals', subtitle: 'Restorative facials and a little space to switch off.', image: '/demo-sites/salon/service-3.jpg', alt: 'A beauty therapist applying a restorative facial treatment' },
      { title: 'Bridal Beauty', subtitle: 'A thoughtful trial and a look that still feels like you.', image: '/demo-sites/salon/service-4.jpg', alt: 'A curated palette of cosmetics for a bridal beauty look' }
    ],
    story: {
      eyebrow: 'About Maison Gloss',
      title: 'A refined beauty ritual, designed around you.',
      description: 'Maison Gloss blends technique, calm and personal care to create a salon experience that feels elevated yet effortless. Every service is customised to your features, your routine and your sense of self, so the outcome feels polished and entirely yours.',
      image: '/demo-sites/salon/story.jpg',
      alt: 'A stylist shampooing a client’s hair at the salon basin',
      points: ['Luxury hair and beauty care', 'Personalised salon rituals', 'Wellness-first finishing'],
      cta: 'Find your appointment'
    },
    bestsellers: [
      { name: 'The Maison Blowout', image: '/demo-sites/salon/bestseller-1.jpg', alt: 'A stylist blow-drying a client’s hair into soft waves', description: 'Soft volume and a polished finish with lasting movement.', price: '₹2,800' },
      { name: 'The Glow Facial', image: '/demo-sites/salon/bestseller-2.jpg', alt: 'A client enjoying a gentle facial massage', description: 'A restorative facial focused on comfort, hydration and glow.', price: '₹3,600' },
      { name: 'The Bridal Edit', image: '/demo-sites/salon/bestseller-3.jpg', alt: 'Long, softly styled hair and natural makeup for a special occasion', description: 'A personal trial to find the right tones, texture and finish.', price: 'By consultation' }
    ],
    gallery: [
      { image: '/demo-sites/salon/gallery-1.jpg', alt: 'A monochrome view across the salon’s mirrors and styling chairs' },
      { image: '/demo-sites/salon/gallery-2.jpg', alt: 'Professional styling tools laid out between appointments' },
      { image: '/demo-sites/salon/gallery-3.jpg', alt: 'A stylist refining a client’s haircut with scissors and a comb' },
      { image: '/demo-sites/salon/gallery-4.jpg', alt: 'A close-up of a stylist shaping a client’s hair' },
      { image: '/demo-sites/salon/gallery-5.jpg', alt: 'A calming aromatherapy treatment with warm massage oil' },
      { image: '/demo-sites/salon/gallery-6.jpg', alt: 'A detailed manicure finished with a deep red polish' }
    ],
    finalCta: {
      title: 'Your next appointment starts here.',
      description: 'Reserve a consultation and let us shape a beauty ritual that suits your day-to-day life and special occasions.',
      button: 'Book a slot'
    }
  },
  'demo-jewellery': {
    slug: 'demo-jewellery',
    template: 'jewellery',
    templateName: 'The Editorial Boutique',
    name: 'Silver Elara',
    category: 'Jewellery boutique',
    seoTitle: 'Silver Elara | Jewellery Boutique Demo',
    summary: 'Timeless pieces crafted for celebrations, milestones and everyday elegance.',
    hero: {
      eyebrow: 'Fine Jewellery & Gifting',
      title: 'Details worth remembering.',
      description: 'Timeless pieces crafted for celebrations, milestones and everyday elegance.',
      primaryCta: 'Explore Collection',
      image: '/demo-sites/jewellery/hero.jpg',
      alt: 'Sculptural gold jewellery arranged on pale stone in dramatic light'
    },
    highlights: [
      { title: 'Necklaces', subtitle: 'Sculptural pendants and fine chains for everyday layering.', image: '/demo-sites/jewellery/collection-1.jpg', alt: 'A fine gold necklace worn against a cream silk blouse' },
      { title: 'Earrings', subtitle: 'Light-catching forms, from quiet studs to evening drops.', image: '/demo-sites/jewellery/collection-2.jpg', alt: 'A pair of delicate gold earrings arranged on linen' },
      { title: 'Rings', subtitle: 'Keepsake settings for milestones, promises and yourself.', image: '/demo-sites/jewellery/collection-3.jpg', alt: 'A rose gold gemstone ring in close detail' },
      { title: 'Bridal', subtitle: 'Heirloom-inspired accents for the day and every day after.', image: '/demo-sites/jewellery/collection-4.jpg', alt: 'A pearl and gold bridal jewellery set laid out for a ceremony' }
    ],
    story: {
      eyebrow: 'Our story',
      title: 'Jewellery designed to be cherished in the moments that matter most.',
      description: 'Silver Elara curates refined jewellery for marking life’s milestones, gifting with intention and building a wardrobe of treasured pieces that feel personal. Each design pairs sculptural form, meaningful craftsmanship and a quietly luxurious finish.',
      image: '/demo-sites/jewellery/story.jpg',
      alt: 'A jeweller’s hands arranging a pearl necklace in its presentation box',
      points: ['Hand-finished design studio', 'Wedding and gifting collections', 'Modern heirloom pieces'],
      cta: 'Discover the craft'
    },
    bestsellers: [
      { name: 'The Heirloom Chain', image: '/demo-sites/jewellery/bestseller-1.jpg', alt: 'A fine gold chain arranged over an open book', description: 'A finely weighted chain with a quiet, enduring finish.', price: '₹6,500' },
      { name: 'Sculpted Gold Chain', image: '/demo-sites/jewellery/bestseller-2.jpg', alt: 'A gold chain styled among dried flowers and a vintage mirror', description: 'A considered link and warm finish for everyday layering.', price: '₹4,200' }
    ],
    gallery: [
      { image: '/demo-sites/jewellery/gallery-1.jpg', alt: 'Gold hoops resting on pale stone in a pool of sunlight' },
      { image: '/demo-sites/jewellery/gallery-2.jpg', alt: 'A fine necklace worn close to the collarbone' },
      { image: '/demo-sites/jewellery/gallery-3.jpg', alt: 'A gold bracelet photographed beside its keepsake box' },
      { image: '/demo-sites/jewellery/gallery-4.jpg', alt: 'Delicate earrings and rings styled with dried flowers' }
    ],
    finalCta: {
      title: 'Find the piece that feels like yours.',
      description: 'Share the occasion or design brief and we will help you discover a piece that feels personal, timeless and gift-worthy.',
      button: 'Enquire now'
    }
  }
} as const;

const faqs = [
  ['What is included in the ₹999/year plan?', 'The V1 package includes business setup, template selection, essential content sections, gallery upload support, a mobile-friendly public website and simple publish access.'],
  ['Does this work for multiple business types?', 'Yes. The platform is designed for small businesses such as bakeries, salons, clinics, boutiques, service providers and local brands.'],
  ['Are future SaaS features already built in?', 'This V1 keeps the product lean and extension-ready: the core architecture is designed for multi-tenancy and future SaaS scaling without creating complexity in the first release.'],
  ['What is not included in V1?', 'V1 does not include payment gateways, advanced analytics, custom domains, complex CRM, automated billing or other advanced operational modules.']
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

const DemoStorefront: React.FC<{ business: DemoBusiness; theme: (typeof demoThemes)[keyof typeof demoThemes] }> = ({ business, theme }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isBakery = business.template === 'bakery';
  const isSalon = business.template === 'salon';
  const isJewellery = business.template === 'jewellery';
  const collectionId = isSalon ? 'services' : 'collections';
  const primaryAction = isBakery
    ? { href: demoWhatsappUrl(business.name, 'place an order'), external: true, label: 'Order on WhatsApp' }
    : isSalon
      ? { href: demoWhatsappUrl(business.name, 'book an appointment'), external: true, label: 'Book Appointment' }
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
    : isSalon
      ? [
          { label: 'Home', href: '#home' },
          { label: 'Services', href: '#services' },
          { label: 'Most booked', href: '#bestsellers' },
          { label: 'The studio', href: '#about' },
          { label: 'Gallery', href: '#gallery' },
          { label: 'Book', href: '#contact' }
        ]
      : [
          { label: 'Home', href: '#home' },
          { label: 'Collections', href: '#collections' },
          { label: 'New pieces', href: '#bestsellers' },
          { label: 'Craft', href: '#about' },
          { label: 'Gallery', href: '#gallery' },
          { label: 'Enquire', href: '#contact' }
        ];
  const whatsappUrl = demoWhatsappUrl(business.name, isSalon ? 'book an appointment' : isBakery ? 'place an order' : 'ask about a piece');
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
        ) : isSalon ? (
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
                  Explore services
                </a>
              </div>
              <div className="mt-10 border-t pt-5 text-xs font-medium uppercase tracking-[0.18em]" style={{ borderColor: theme.border, color: theme.muted }}>Considered care · expert hands · time for you</div>
            </div>
            <div className="order-1 h-[330px] overflow-hidden sm:h-[440px] lg:order-2 lg:h-[650px]">
              <img src={business.hero.image} alt={business.hero.alt} className="h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
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
            <SectionEyebrow label={isSalon ? 'The Maison Gloss menu' : isBakery ? 'From the counter' : 'The Elara collection'} accent={theme.label} />
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              {isBakery ? 'A little something for every kind of gathering.' : isSalon ? 'Care that starts with listening.' : 'Pieces with presence. Made for your own story.'}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: theme.muted }}>{business.summary}</p>
          </div>

          <div className={`grid gap-5 ${isBakery ? 'sm:grid-cols-2 xl:grid-cols-4' : isSalon ? 'sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10' : 'sm:grid-cols-2 lg:grid-cols-4 lg:gap-8'}`}>
            {business.highlights.map((item, index) => (
              <article key={item.title} className={`${isSalon ? 'group' : isBakery ? 'overflow-hidden border shadow-[0_16px_36px_rgba(61,34,18,0.08)]' : 'overflow-hidden border-b pb-5'}`} style={isBakery ? { background: theme.panel, borderColor: theme.border } : !isSalon ? { borderColor: theme.border } : undefined}>
                <div className={`overflow-hidden ${isBakery ? 'h-[260px] sm:h-[300px]' : isSalon ? 'h-[300px] sm:h-[360px]' : `h-[300px] sm:h-[380px] ${index % 2 === 1 ? 'lg:mt-12' : ''}`}`}>
                  <img src={item.image} alt={item.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                </div>
                <div className={`${isBakery ? 'p-5' : isSalon ? 'pt-5' : 'pt-4'}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: theme.label }}>{isSalon ? `0${index + 1} / ${business.category}` : item.title}</p>
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
          ) : isSalon ? (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
              <div className="relative">
                <img src={business.story.image} alt={business.story.alt} className="h-[380px] w-full object-cover sm:h-[520px] lg:h-[600px]" loading="lazy" />
                <span className="absolute bottom-4 left-4 max-w-[240px] bg-white/90 px-4 py-3 font-heading text-lg italic shadow-sm sm:bottom-8 sm:left-8 sm:text-xl" style={{ color: theme.accentDark }}>A softer kind of salon day.</span>
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
              <SectionEyebrow label={isSalon ? 'Most requested' : isBakery ? 'Customer favourites' : 'A few beloved pieces'} accent={theme.label} />
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{isSalon ? 'The appointments guests return for.' : isBakery ? 'The ones that disappear first.' : 'The signatures that stay with you.'}</h2>
            </div>
            <a href="#contact" className="inline-flex w-fit items-center gap-2 text-sm font-semibold" style={{ color: theme.accentStrong }}>{isSalon ? 'Book a visit' : isBakery ? 'Order a favourite' : 'Ask about a piece'} <ArrowRight className="h-4 w-4" /></a>
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
            <SectionEyebrow label={isSalon ? 'Inside the studio' : isBakery ? 'A peek behind the counter' : 'Details in their own light'} accent={theme.label} />
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{isSalon ? 'A little of the Maison Gloss feeling.' : isBakery ? 'Made, dressed and shared with care.' : 'A closer look at the little things.'}</h2>
          </div>
          <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${isBakery ? 'lg:grid-cols-4' : isSalon ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            {business.gallery.map((item, index) => (
              <figure key={item.image} className={`${isBakery && index === 0 ? 'col-span-2 row-span-2' : ''} ${isSalon && index === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2' : ''} ${!isBakery && !isSalon && (index === 1 || index === 4) ? 'row-span-2' : ''} overflow-hidden`}>
                <img src={item.image} alt={item.alt} className={`h-full w-full object-cover ${isBakery && index === 0 ? 'min-h-[300px] sm:min-h-[360px]' : 'min-h-[160px] sm:min-h-[220px] lg:min-h-[260px]'}`} loading="lazy" />
              </figure>
            ))}
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className={`flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between ${isJewellery ? 'bg-[#171411] text-white' : ''}`} style={!isJewellery ? { background: theme.panelStrong } : undefined}>
            <div className="max-w-2xl">
              <SectionEyebrow label={isSalon ? 'Make a little time for you' : isBakery ? 'Tell us what you are celebrating' : 'A piece, chosen personally'} accent={isJewellery ? '#c5a77e' : theme.label} />
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{business.finalCta.title}</h2>
              <p className="mt-3 text-base leading-relaxed" style={{ color: isJewellery ? 'rgba(255,255,255,0.68)' : theme.muted }}>{business.finalCta.description}</p>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: theme.cta }}>
              {business.finalCta.button} <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ background: theme.panel, borderColor: theme.border }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div>
            <p className="font-heading text-lg font-semibold" style={{ color: theme.accentDark }}>{business.name}</p>
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>{business.category} · Open Mon–Sat, 10am–7pm</p>
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
    const theme = demoBusiness.template === 'bakery'
      ? demoThemes.bakery
      : demoBusiness.template === 'salon'
        ? demoThemes.salon
        : demoThemes.jewellery;

    return <DemoStorefront business={demoBusiness} theme={theme} />;
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
            <h2 id="template-heading" className="mt-4 text-3xl font-extrabold text-[#0E2B22] font-heading sm:text-4xl">Explore the live website demos.</h2>
            <p className="mt-4 text-base leading-relaxed text-[#1E1E1E]/70">Open a complete example to see how each business website works on desktop and mobile.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <a href="/websites/demo-bakery/" aria-label="Open the Aroma & Crumb bakery website demo" className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22]"><WebsitePreview businessName="Aroma & Crumb" businessType="Bakery & gifting studio" templateName="The Bakehouse" accent="bakery" image="/demo-sites/bakery/hero.jpg" /></a>
            <a href="/websites/demo-salon/" aria-label="Open the Maison Gloss salon website demo" className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22]"><WebsitePreview businessName="Maison Gloss" businessType="Salon & wellness studio" templateName="The Beauty Studio" accent="salon" image="/demo-sites/salon/hero.jpg" /></a>
            <a href="/websites/demo-jewellery/" aria-label="Open the Silver Elara jewellery website demo" className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E2B22]"><WebsitePreview businessName="Silver Elara" businessType="Jewellery boutique" templateName="The Editorial Boutique" accent="jewellery" image="/demo-sites/jewellery/hero.jpg" /></a>
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
