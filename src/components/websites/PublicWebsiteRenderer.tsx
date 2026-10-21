import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Compass, Link2, MapPin, Menu, MessageCircle, Sparkles, X } from 'lucide-react';
import { SocialBrandIcon, type SocialPlatform } from './SocialBrandIcon';
import { getWebsiteTemplateDesign, type WebsiteTemplateDesign } from './templateDesigns';
import { getTemplateDefaults, getTemplateTheme, type WebsiteTheme } from './templateDefaults';
import { inferPrimaryAction, resolvePrimaryActionUrl, type PrimaryAction } from '../../../server/business/cta';
import { formatWorkingHours } from '../../../server/business/hours';
import { resolveBusinessImageUrl } from '../../../server/business/images';

export interface BusinessWebsiteResponse {
  business: {
    name: string;
    slug: string;
    category: string;
    logo?: string | null;
    description: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    google_maps_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
  };
  template: {
    name: string;
    slug: string;
  };
  settings: Record<string, string>;
  primaryAction?: { type: PrimaryAction; text: string; url: string | null };
  categories: Array<{ id: string; name: string; status: string }>;
  products: Array<{ id: string; category_id: string | null; name: string; slug: string; description: string | null; price: string | null; image: string | null; status: string }>;
  gallery: Array<{ id: string; title: string; image: string; status: string }>;
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
  };
}

export function PublicWebsiteRenderer({ slug, initialData }: { slug: string; initialData?: BusinessWebsiteResponse }) {
  const [data, setData] = useState<BusinessWebsiteResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadWebsite = async () => {
      if (initialData) {
        setData(initialData);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/public/websites/${encodeURIComponent(slug)}`, { signal: controller.signal });
        const payload = await response.json().catch(() => ({})) as BusinessWebsiteResponse & { error?: string };
        if (!response.ok) throw new Error(payload.error || 'This website could not be found');
        setData(payload);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load website');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadWebsite();
    return () => controller.abort();
  }, [initialData, slug]);

  useEffect(() => {
    if (!data) return;
    document.title = data.seo.title;
    document.head.querySelector('meta[name="description"]')?.setAttribute('content', data.seo.description);
    document.head.querySelector('meta[name="author"]')?.setAttribute('content', data.business.name);
    document.head.querySelector('meta[property="og:site_name"]')?.setAttribute('content', data.business.name);
    document.head.querySelector('meta[property="og:title"]')?.setAttribute('content', data.seo.ogTitle);
    document.head.querySelector('meta[property="og:description"]')?.setAttribute('content', data.seo.ogDescription);
    document.head.querySelector('meta[property="og:image"]')?.setAttribute('content', data.seo.ogImage ?? '');
    document.head.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', data.business.name);
    document.head.querySelector('meta[property="og:url"]')?.setAttribute('content', data.seo.canonicalUrl);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', data.seo.canonicalUrl);
    document.head.querySelector('meta[name="twitter:title"]')?.setAttribute('content', data.seo.ogTitle);
    document.head.querySelector('meta[name="twitter:description"]')?.setAttribute('content', data.seo.ogDescription);
    document.head.querySelector('meta[name="twitter:image"]')?.setAttribute('content', data.seo.ogImage ?? '');
    document.head.querySelector('meta[name="twitter:url"]')?.setAttribute('content', data.seo.canonicalUrl);
  }, [data]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f5f2] p-8 text-[#0E2B22]"><p role="status" className="animate-pulse">Loading website…</p></main>;
  }

  if (error || !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5f2] px-4 text-[#0E2B22]">
        <div className="max-w-xl rounded-3xl border border-[#e6dfd1] bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">YBGP Websites</p>
          <h1 className="mt-3 text-3xl font-bold">Website unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#68746c]">{error ?? 'This business website is not available.'}</p>
          <a href="/websites" className="mt-5 inline-flex rounded-xl bg-[#0E2B22] px-4 py-3 text-sm font-semibold text-white">Explore YBGP Websites</a>
        </div>
      </main>
    );
  }

  const { business, template, settings, categories, products, gallery, seo } = data;
  const design = getWebsiteTemplateDesign(template.slug, business.category);
  const defaults = getTemplateDefaults(template.slug, business.category);
  const theme = getTemplateTheme(template.slug, business.category);
  const foodLayout = design === 'food';
  const salonLayout = design === 'salon';
  const jewelleryLayout = design === 'jewellery';
  const clinicLayout = design === 'clinic';
  const astrologyLayout = design === 'astrology';
  const travelLayout = design === 'travel';
  const isModern = design === 'modern';
  const isService = isModern || salonLayout || clinicLayout || astrologyLayout;
  const collectionId = clinicLayout ? 'departments' : astrologyLayout ? 'consultations' : travelLayout ? 'packages' : isService ? 'services' : 'collections';

  const whatsapp = business.whatsapp || settings.whatsapp;
  const phone = business.phone || settings.call_phone;
  const email = business.email || settings.contact_email;
  const address = [business.address || settings.contact_address, settings.city, settings.pincode].filter(Boolean).join(', ');
  const explicitMapsUrl = safeExternalUrl(business.google_maps_url);
  const locationQuery = address || defaults.location.query;
  const directionsUrl = explicitMapsUrl || (locationQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`
    : '');
  const primaryActionType = data.primaryAction?.type ?? inferPrimaryAction(settings, business);
  const ctaUrl = data.primaryAction?.url ?? resolvePrimaryActionUrl(primaryActionType, business, settings.cta_url) ?? (whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#contact');
  const ctaText = data.primaryAction?.text || settings.cta_text || (
    clinicLayout ? 'Book Consultation' :
    astrologyLayout ? 'Consult Astrologer' :
    travelLayout ? 'Get Travel Quote' :
    foodLayout ? 'Order on WhatsApp' :
    salonLayout ? 'Book Appointment' :
    jewelleryLayout ? 'Explore Collection' :
    'Start a conversation'
  );
  const displayWorkingHours = formatWorkingHours(settings.working_hours) || defaults.openingHours;

  const socialLinks = [
    { name: 'Instagram', url: business.instagram_url, platform: 'instagram' as SocialPlatform },
    { name: 'Facebook', url: business.facebook_url, platform: 'facebook' as SocialPlatform },
    { name: 'YouTube', url: settings.youtube_url, platform: 'youtube' as SocialPlatform },
    { name: 'LinkedIn', url: settings.linkedin_url, platform: 'linkedin' as SocialPlatform },
    { name: 'TikTok', url: settings.tiktok_url, platform: 'tiktok' as SocialPlatform },
    { name: 'X', url: settings.x_url, platform: 'x' as SocialPlatform },
    { name: 'Pinterest', url: settings.pinterest_url, platform: 'pinterest' as SocialPlatform },
    { name: 'Google Business', url: settings.google_business_url, icon: MapPin },
    { name: 'Other link', url: settings.other_social_url, icon: Link2 },
  ].map((item) => ({ ...item, url: safeExternalUrl(item.url) }))
    .filter((item) => Boolean(item.url));

  const heroImage = gallery
    .map((item) => safeImageUrl(item.image))
    .find((image): image is string => Boolean(image)) || safeImageUrl(business.logo) || defaults.hero.image;

  const whatsappDirectUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to get in touch with ${business.name}.`)}`
    : ctaUrl;

  const isDemo = data.business.slug.startsWith('demo-');
  const heroEyebrow = settings.hero_eyebrow || business.category || defaults.hero.eyebrow;
  const heroTitle = settings.hero_title || business.name;
  const storyEyebrow = settings.about_eyebrow || defaults.story.eyebrow;
  const storyTitle = settings.about_title || defaults.story.title;
  const storyDescription = settings.about_description || business.description || defaults.story.description;
  const storyPoints = settings.about_points
    ? settings.about_points.split('\n').map((p) => p.trim()).filter(Boolean)
    : defaults.story.points;
  const storyImage = safeImageUrl(settings.about_image) || defaults.story.image;
  const highlightsEyebrow = settings.highlights_eyebrow || (categories.length > 0
    ? 'Categories' :
    clinicLayout ? 'Clinical care & departments' :
    astrologyLayout ? 'Jyotish & Vedic consultations' :
    travelLayout ? 'Curated tour packages & rentals' :
    salonLayout ? 'The salon menu' :
    isModern ? 'What we do' :
    foodLayout ? 'From the counter' :
    'The collection'
  );
  const highlightsTitle = settings.highlights_title || (categories.length > 0
    ? 'Explore our categories' :
    clinicLayout ? 'Comprehensive medical care for you and your family.' :
    astrologyLayout ? 'Ancient Vedic wisdom interpreted for modern life.' :
    travelLayout ? 'Handcrafted holidays and reliable travel services.' :
    foodLayout ? 'A little something for every kind of gathering.' :
    salonLayout ? 'Care that starts with listening.' :
    isModern ? 'The right support for your next step.' :
    'Pieces with presence. Made for your own story.'
  );
  const finalCtaTitle = settings.final_cta_title || defaults.finalCta.title;
  const finalCtaDescription = settings.final_cta_description || defaults.finalCta.description;
  const finalCtaButton = settings.final_cta_button || defaults.finalCta.button;

  const highlightItems = categories.length === 0 ? defaults.highlights : [];

  const navItems = clinicLayout
    ? [
        { label: 'Home', href: '#about' },
        { label: 'Departments', href: `#${collectionId}` },
        { label: 'Consultations', href: '#bestsellers' },
        { label: 'Clinical Care', href: '#about' },
        { label: 'Facilities', href: '#gallery' },
        { label: 'Book Visit', href: '#contact' },
      ]
    : astrologyLayout
      ? [
          { label: 'Home', href: '#home' },
          { label: 'Consultations', href: `#${collectionId}` },
          { label: 'Horoscopes', href: '#bestsellers' },
          { label: 'Vedic Tradition', href: '#about' },
          { label: 'Astro Gallery', href: '#gallery' },
          { label: 'Consult Astrologer', href: '#contact' },
        ]
      : travelLayout
        ? [
            { label: 'Home', href: '#home' },
            { label: 'Tour Packages', href: `#${collectionId}` },
            { label: 'Popular Trips', href: '#bestsellers' },
            { label: 'Why Travel With Us', href: '#about' },
            { label: 'Travel Gallery', href: '#gallery' },
            { label: 'Plan Journey', href: '#contact' },
          ]
        : foodLayout
          ? [
              { label: 'Home', href: '#home' },
              { label: 'Menu', href: `#${collectionId}` },
              { label: 'Bestsellers', href: '#bestsellers' },
              { label: 'Our story', href: '#about' },
              { label: 'Gallery', href: '#gallery' },
              { label: 'Order', href: '#contact' },
            ]
          : isService
            ? [
                { label: 'Home', href: '#home' },
                { label: isModern ? 'What we do' : 'Services', href: `#${collectionId}` },
                { label: isModern ? 'Ways to work together' : 'Most booked', href: '#bestsellers' },
                { label: isModern ? 'Our approach' : 'The studio', href: '#about' },
                { label: 'Gallery', href: '#gallery' },
                { label: isModern ? 'Contact' : 'Book', href: '#contact' },
              ]
            : [
                { label: 'Home', href: '#home' },
                { label: 'Collections', href: `#${collectionId}` },
                { label: 'New pieces', href: '#bestsellers' },
                { label: 'Craft', href: '#about' },
                { label: 'Gallery', href: '#gallery' },
                { label: 'Enquire', href: '#contact' },
              ];

  const storySection = (
    <section id="about" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
      {foodLayout ? (
        <div className="grid overflow-hidden lg:grid-cols-[1fr_1fr]" style={{ background: theme.panelStrong }}>
          <img src={storyImage} alt="" className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[560px]" loading="lazy" />
          <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>{storyEyebrow}</p>
            <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-tight sm:text-4xl">{storyTitle}</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: theme.muted }}>{storyDescription}</p>
            <div className="mt-6 space-y-2.5">
              {storyPoints.map((point) => (
                <div key={point} className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-[#a04a2b]">✓</span> {point}
                </div>
              ))}
            </div>
            <a href="#contact" className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold" style={{ color: theme.accentStrong }}>{defaults.story.cta} <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      ) : isService ? (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div className="relative">
            <img src={storyImage} alt="" className="h-[380px] w-full object-cover sm:h-[520px] lg:h-[600px]" loading="lazy" />
            <span className="absolute bottom-4 left-4 max-w-[260px] bg-white/90 px-4 py-3 font-heading text-lg italic shadow-sm sm:bottom-8 sm:left-8 sm:text-xl" style={{ color: theme.accentDark }}>
              {clinicLayout
                ? 'Patient-first clinical care.'
                : astrologyLayout
                ? 'Ancient wisdom, modern clarity.'
                : travelLayout
                ? 'Wanderlust planned to perfection.'
                : isModern
                ? 'Thoughtful work, made personal.'
                : 'A softer kind of salon day.'}
            </span>
          </div>
          <div className="max-w-xl py-3 lg:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>{storyEyebrow}</p>
            <h2 className="mt-4 font-heading text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl">{storyTitle}</h2>
            <p className="mt-5 text-base leading-relaxed" style={{ color: theme.muted }}>{storyDescription}</p>
            <div className="mt-7 space-y-3 border-t pt-5" style={{ borderColor: theme.border }}>
              {storyPoints.map((point) => <p key={point} className="text-sm font-medium">✓ {point}</p>)}
            </div>
            {!clinicLayout ? (
              <a href="#contact" className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: theme.cta }}>{defaults.story.cta} <ArrowRight className="h-4 w-4" /></a>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={`grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:p-12 ${jewelleryLayout ? 'bg-[#181512] border border-[#2e2720] text-[#f7f4ee]' : 'bg-[#eae4dc]'}`}>
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>{storyEyebrow}</p>
            <h2 className="mt-4 font-heading text-3xl font-normal leading-tight tracking-[-0.03em] sm:text-4xl">{storyTitle}</h2>
            <p className="mt-5 text-sm leading-relaxed sm:text-base" style={{ color: theme.muted }}>{storyDescription}</p>
            <div className="mt-6 space-y-2">
              {storyPoints.map((point) => <p key={point} className={`text-sm font-medium ${jewelleryLayout ? 'text-[#e0c297]' : 'text-[#211a13]'}`}>✦ {point}</p>)}
            </div>
            <a href="#contact" className="mt-7 inline-flex w-fit items-center gap-2 border-b pb-2 text-sm font-semibold" style={{ borderColor: theme.accent, color: theme.accentDark }}>{defaults.story.cta} <ArrowRight className="h-4 w-4" /></a>
          </div>
          <img src={storyImage} alt="" className="h-[320px] w-full object-cover sm:h-[460px] lg:h-[580px]" loading="lazy" />
        </div>
      )}
    </section>
  );

  return (
    <div className={`min-h-screen ${foodLayout ? 'font-sans' : ''}`} style={{ background: theme.pageBg, color: theme.text }}>
      {/* Sticky Top Demo Notice Banner */}
      {isDemo ? (
        <aside
          role="region"
          aria-label="Demo website notice"
          className="relative z-[60] border-b border-[#fef08a]/30 bg-[#1c1917] px-4 py-2.5 text-white shadow-md"
        >
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 sm:px-6 lg:px-10">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <span className="rounded-full bg-[#f59e0b] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-sm">
                FOR DEMO ONLY
              </span>
              <span className="font-medium text-amber-100">
                You are viewing the <strong className="text-white">{template.name}</strong> template demo. All offerings, credentials &amp; numbers are sample data.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/websites"
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                ← All Templates
              </a>
              <a
                href={`https://wa.me/919953270270?text=${encodeURIComponent(`Hi YBGP, I want to get a website using the ${template.name} template for ₹1,999/yr.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f59e0b] px-3.5 py-1 text-xs font-bold text-black shadow-sm transition hover:bg-[#fbbf24]"
              >
                Get This Website (₹1,999/yr) <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </aside>
      ) : null}

      {/* Sticky Blurred Brand Header */}
      <header className="sticky top-0 z-50 border-b transition-colors" style={{ background: theme.headerSurface, borderColor: theme.border, backdropFilter: 'blur(18px)' }}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
          <a href={clinicLayout ? '#about' : '#home'} className="flex min-w-0 items-center gap-3" aria-label={`${business.name} home`}>
            {safeImageUrl(business.logo) ? (
              <img src={safeImageUrl(business.logo)} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold" style={{ background: theme.accentSoft, color: theme.accentDark }}>
                {business.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
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
            <a
              href={ctaUrl}
              target={ctaUrl.startsWith('http') ? '_blank' : undefined}
              rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 shadow-sm"
              style={{ background: theme.cta }}
            >
              {ctaText}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-semibold xl:hidden"
            style={{ borderColor: theme.border, color: theme.text, background: theme.panel }}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {mobileNavOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        <nav aria-label={`${business.name} mobile navigation`} hidden={!mobileNavOpen} className="border-t px-4 py-4 xl:hidden" style={{ borderColor: theme.border, background: theme.panel }}>
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 sm:grid-cols-3">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)} className="rounded-xl border px-3 py-3 text-sm font-medium" style={{ borderColor: theme.border, color: theme.text, background: theme.pageBg }}>
                {item.label}
              </a>
            ))}
            <a
              href={ctaUrl}
              target={ctaUrl.startsWith('http') ? '_blank' : undefined}
              rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={() => setMobileNavOpen(false)}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white sm:col-span-1"
              style={{ background: theme.cta }}
            >
              {ctaText} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </header>

      <main>
        {clinicLayout ? storySection : null}
        {/* Full Storefront Hero */}
        {astrologyLayout ? (
          <section id="home" className="relative mx-auto mt-3 min-h-[580px] max-w-[1440px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#16122c] via-[#211a42] to-[#120f24] text-[#f7f5ee] shadow-[0_24px_70px_rgba(20,16,40,0.35)] sm:mt-6 sm:min-h-[640px] lg:min-h-[700px]">
            <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
            <div className="relative mx-auto grid min-h-[580px] max-w-7xl items-center gap-8 px-6 py-14 sm:min-h-[640px] sm:px-10 lg:min-h-[700px] lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#1c1836]/80 px-4 py-1.5 text-xs font-semibold text-[#f0d48f] backdrop-blur-sm">
                  <span>✦ Authentic Vedic Jyotish &amp; Vastu Shastra</span>
                </div>
                <h1 className="mt-5 font-heading text-4xl font-normal leading-[1.02] tracking-[-0.03em] text-[#fffdf7] sm:text-5xl lg:text-[4.75rem]">{heroTitle}</h1>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-[#d6d0e8] sm:text-lg">{business.description || seo.description || defaults.hero.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#181432] shadow-lg transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: '#e0c297' }}>
                    {ctaText} <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href={`#${collectionId}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d4af37]/50 px-5 py-3 text-sm font-semibold text-[#f5edd9] transition-colors hover:bg-white/10 sm:text-base">
                    Explore Consultations
                  </a>
                  {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-[#e4ddd0] transition-colors hover:bg-white/10 sm:text-base">Directions</a> : null}
                </div>
                <p className="mt-10 text-xs font-medium uppercase tracking-[0.24em] text-[#c5a77e]">
                  {displayWorkingHours || 'Vedic Kundli Analysis · Career Forecasting · Vastu Consultation'}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-[#1e193d]/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
                <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e0c297]">{business.name}</span>
                  <span className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-0.5 text-[10px] font-semibold text-[#f5edd9]">Kundli Milan</span>
                </div>
                <div className="mt-6 space-y-3.5">
                  {[
                    { icon: '☀️', title: 'Birth Chart & Planetary Dasha', desc: 'Detailed transit predictions and auspicious timing for key decisions.' },
                    { icon: '⚖️', title: 'Kundli Matching (36 Guna)', desc: 'Ashtakoot compatibility analysis for marriage and partnership harmony.' },
                    { icon: '🏡', title: 'Vastu Energy Harmonization', desc: 'Practical remedies for residential and workspace prosperity without demolition.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-[#f5edd9]">{item.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#b6aed1]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-center text-[11px] font-semibold text-[#e0c297]">✦ 100% Confidential 1-on-1 Consultations</p>
              </div>
            </div>
          </section>
        ) : travelLayout ? (
          <section id="home" className="relative mx-auto mt-3 min-h-[580px] max-w-[1440px] overflow-hidden rounded-3xl sm:mt-6 sm:min-h-[630px] lg:min-h-[700px]">
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,45,62,0.92) 0%, rgba(13,45,62,0.65) 50%, rgba(13,45,62,0.2) 100%)' }} />
            <div className="relative flex min-h-[580px] max-w-3xl flex-col justify-center px-5 py-14 sm:min-h-[630px] sm:px-10 lg:min-h-[700px] lg:px-16 text-white">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold text-[#e0edf5] backdrop-blur-md">
                <span>✈️ Curated Holiday Tours &amp; Outstation Cab Desk</span>
              </div>
              <h1 className="mt-5 max-w-[680px] font-heading text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-white">{heroTitle}</h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">{business.description || seo.description || defaults.hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: theme.cta }}>
                  {ctaText} <ArrowRight className="h-4 w-4" />
                </a>
                <a href={`#${collectionId}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base">
                  Explore Tour Packages
                </a>
                {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base">Travel Desk Directions</a> : null}
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/20 pt-4 text-xs font-medium text-white/80">
                <span>✓ 24/7 On-Trip Assistance</span>
                <span>✓ Verified AC Cabs</span>
                <span>✓ Handpicked Verified Stays</span>
              </div>
            </div>
          </section>
        ) : foodLayout ? (
          <section id="home" className="relative mx-auto mt-3 min-h-[570px] max-w-[1440px] overflow-hidden sm:mt-6 sm:min-h-[620px] sm:rounded-[28px] lg:min-h-[700px]">
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(31,17,10,0.85) 0%, rgba(39,22,14,0.55) 50%, rgba(39,22,14,0.15) 100%)' }} />
            <div className="relative flex min-h-[570px] max-w-3xl flex-col justify-center px-5 py-14 sm:min-h-[620px] sm:px-10 lg:min-h-[700px] lg:px-16 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d5af]">{heroEyebrow}</p>
              <h1 className="mt-5 max-w-[660px] font-heading text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">{heroTitle}</h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">{business.description || seo.description || defaults.hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: theme.cta }}>
                  {ctaText} <ArrowRight className="h-4 w-4" />
                </a>
                <a href={`#${collectionId}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base">
                  Browse the menu
                </a>
                {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base">Directions</a> : null}
              </div>
              <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-white/75">{displayWorkingHours || 'Small batches · baked fresh · made to share'}</p>
            </div>
          </section>
        ) : salonLayout ? (
          <section id="home" className="mx-auto grid max-w-[1440px] overflow-hidden lg:min-h-[650px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:order-1 lg:px-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.label }}>{heroEyebrow}</p>
              <h1 className="mt-5 max-w-xl font-heading text-4xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[4.75rem]">{heroTitle}</h1>
              <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg" style={{ color: theme.muted }}>{business.description || seo.description || defaults.hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: theme.cta }}>
                  {ctaText} <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#services" className="inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold sm:text-base" style={{ borderColor: theme.border, color: theme.text }}>
                  Explore services
                </a>
                {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold sm:text-base" style={{ borderColor: theme.border, color: theme.text }}>Directions</a> : null}
              </div>
              <div className="mt-10 border-t pt-5 text-xs font-medium uppercase tracking-[0.18em]" style={{ borderColor: theme.border, color: theme.muted }}>{displayWorkingHours || 'Considered care · expert hands · time for you'}</div>
            </div>
            <div className="order-1 flex h-[330px] items-center justify-center overflow-hidden bg-[#f0e5df] p-6 sm:h-[440px] lg:order-2 lg:h-[650px]">
              <div className="relative h-full w-full max-w-lg overflow-hidden rounded-t-[12rem] bg-gradient-to-br from-[#cba99e] via-[#f1e5df] to-[#9b7169] sm:rounded-t-[16rem]">
                <img src={heroImage} alt="" className="h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
              </div>
            </div>
          </section>
        ) : jewelleryLayout ? (
          <section id="home" className="mx-auto grid max-w-[1440px] overflow-hidden bg-[#171411] lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="order-2 flex flex-col justify-center px-5 py-12 text-[#f8f5ef] sm:px-12 sm:py-16 lg:order-1 lg:px-20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c5a77e]">{heroEyebrow}</p>
              <h1 className="mt-6 max-w-xl font-heading text-4xl font-normal leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[5rem]">{heroTitle}</h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">{business.description || seo.description || defaults.hero.description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#collections" className="inline-flex min-h-12 w-fit items-center gap-3 border-b border-[#c5a77e] pb-2 text-sm font-medium text-[#e8d3b1] transition-colors hover:text-white sm:text-base">
                  Explore the collection <ArrowRight className="h-4 w-4" />
                </a>
                <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-white sm:text-sm">WhatsApp us</a>
                {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-white sm:text-sm">Directions</a> : null}
              </div>
              <p className="mt-12 text-[10px] uppercase tracking-[0.24em] text-white/45">{displayWorkingHours || 'Made to hold a story'}</p>
            </div>
            <div className="order-1 h-[350px] overflow-hidden bg-[#2b2722] sm:h-[470px] lg:order-2 lg:h-[680px]">
              <img src={heroImage} alt="" className="h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
            </div>
          </section>
        ) : clinicLayout ? null : (
          <section id="home" className="mx-auto grid max-w-[1440px] overflow-hidden lg:min-h-[650px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:order-1 lg:px-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.label }}>{heroEyebrow}</p>
              <h1 className="mt-5 w-full font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[4.75rem]">{heroTitle}</h1>
              <p className="mt-6 w-full text-base leading-relaxed sm:text-lg" style={{ color: theme.muted }}>{business.description || seo.description || defaults.hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:text-base" style={{ background: theme.cta }}>
                  {ctaText} <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#services" className="inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold sm:text-base" style={{ borderColor: theme.border, color: theme.text }}>
                  Explore what we do
                </a>
                {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold sm:text-base" style={{ borderColor: theme.border, color: theme.text }}>Directions</a> : null}
              </div>
              <div className="mt-10 border-t pt-5 text-xs font-medium uppercase tracking-[0.18em]" style={{ borderColor: theme.border, color: theme.muted }}>{displayWorkingHours || 'Clear thinking · considered design · practical support'}</div>
            </div>
            <div className="order-1 flex h-[330px] items-center justify-center overflow-hidden bg-[#dce9df] p-6 sm:h-[440px] lg:order-2 lg:h-[650px]">
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-6 shadow-[0_24px_60px_rgba(24,54,41,0.12)] sm:p-8">
                <div className="flex items-center justify-between border-b border-[#e6ece7] pb-4">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#294a38]">{business.name}</span>
                  <span className="rounded-full bg-[#e9f1eb] px-3 py-1 text-[10px] font-semibold text-[#587464]">{business.category}</span>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8d7026]">Welcome to our website</p>
                    <p className="mt-2 font-heading text-xl font-semibold leading-snug text-[#183629] sm:text-2xl">{business.name}</p>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#52685b]">{business.description || defaults.hero.description}</p>
                    <a href={ctaUrl} className="mt-4 inline-flex rounded-full bg-[#183629] px-4 py-2 text-xs font-semibold text-white">{ctaText}</a>
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    {(categories.length > 0 ? categories.map((c) => ({ title: c.name })) : defaults.highlights).slice(0, 3).map((item, idx) => (
                      <div key={item.title} className="flex items-center gap-2.5 rounded-xl border border-[#e6ece7] p-2.5 text-xs">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9f1eb] font-bold text-[#294a38]">0{idx + 1}</span>
                        <span className="truncate font-medium text-[#52685b]">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Highlights Section */}
        <section id={collectionId} className="scroll-mt-24 mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:pb-24">
          <div className={`mb-8 ${clinicLayout ? 'w-full' : jewelleryLayout ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>
              {highlightsEyebrow}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              {highlightsTitle}
            </h2>
            {business.description || categories.length === 0 ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: theme.muted }}>
                {business.description || defaults.summary}
              </p>
            ) : null}
          </div>

          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <article key={category.id} className="flex min-h-36 items-center gap-4 rounded-2xl border p-5 sm:p-6" style={{ borderColor: theme.border, background: theme.panel }}>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-semibold" style={{ background: theme.panelStrong, color: theme.accentStrong }}>
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                  <h3 className="font-heading text-lg font-semibold sm:text-xl" style={{ color: theme.accentDark }}>{category.name}</h3>
                </article>
              ))}
            </div>
          ) : (
            <div className={`grid gap-5 ${foodLayout ? 'sm:grid-cols-2 xl:grid-cols-4' : isService ? 'sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10' : 'sm:grid-cols-2 lg:grid-cols-4 lg:gap-8'}`}>
              {highlightItems.map((item, index) => (
                <article key={item.title + index} className={`${isService ? 'group' : foodLayout ? 'overflow-hidden border shadow-[0_16px_36px_rgba(61,34,18,0.08)]' : 'overflow-hidden border-b pb-5'}`} style={foodLayout ? { background: theme.panel, borderColor: theme.border } : !isService ? { borderColor: theme.border } : undefined}>
                  <div className={`overflow-hidden ${foodLayout ? 'h-[260px] sm:h-[300px]' : isService ? 'h-[300px] sm:h-[360px]' : `h-[300px] sm:h-[380px] ${index % 2 === 1 ? 'lg:mt-12' : ''}`}`}>
                    <img src={item.image} alt={item.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                  </div>
                  <div className={`${foodLayout ? 'p-5' : isService ? 'pt-5' : 'pt-4'}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: theme.label }}>{isService ? `0${index + 1} / ${business.category}` : item.title}</p>
                    <h3 className="mt-2 font-heading text-xl font-semibold sm:text-2xl" style={{ color: theme.accentDark }}>{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>{item.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {!clinicLayout ? storySection : null}

        {/* Offerings & Products Section */}
        <section id="bestsellers" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>
                {clinicLayout
                  ? 'Consultations & Care'
                  : astrologyLayout
                  ? 'Astro Consultations'
                  : travelLayout
                  ? 'Popular Holiday Packages'
                  : salonLayout
                  ? 'Most requested'
                  : isModern
                  ? 'Ways to work together'
                  : foodLayout
                  ? 'Customer favourites'
                  : 'A few beloved pieces'}
                {isDemo ? (
                  <span className="ml-2.5 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-700">
                    Sample Offerings · For Demo Only
                  </span>
                ) : null}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {products.length > 0
                  ? 'Our products & services'
                  : clinicLayout
                  ? 'Dedicated healthcare consultations & tests.'
                  : astrologyLayout
                  ? 'Consultations shaped around your birth chart.'
                  : travelLayout
                  ? 'Curated holiday packages & private rides.'
                  : salonLayout
                  ? 'The appointments guests return for.'
                  : isModern
                  ? 'Focused support, built around you.'
                  : foodLayout
                  ? 'The ones that disappear first.'
                  : 'The signatures that stay with you.'}
              </h2>
            </div>
            <a href={ctaUrl} className="inline-flex w-fit items-center gap-2 text-sm font-semibold" style={{ color: theme.accentStrong }}>
              {clinicLayout
                ? 'Book a consultation'
                : astrologyLayout
                ? 'Consult astrologer'
                : travelLayout
                ? 'Inquire for package quote'
                : salonLayout
                ? 'Book a visit'
                : isModern
                ? 'Talk through your goals'
                : foodLayout
                ? 'Order a favourite'
                : 'Ask about a piece'} <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <TemplateItemCard
                  key={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : undefined}
                  image={safeImageUrl(product.image)}
                  whatsapp={whatsapp}
                  businessName={business.name}
                  theme={theme}
                  design={design}
                />
              ))}
            </div>
          ) : isDemo ? (
            <div className={`grid gap-5 ${foodLayout ? 'sm:grid-cols-3' : 'md:grid-cols-3'}`}>
              {defaults.bestsellers.map((item) => (
                <TemplateItemCard
                  key={item.name}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  whatsapp={whatsapp}
                  businessName={business.name}
                  theme={theme}
                  design={design}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border p-8 text-center" style={{ borderColor: theme.border, background: theme.panel }}>
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.label }}>Our Offerings</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold" style={{ color: theme.accentDark }}>Catalogue updating soon</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: theme.muted }}>
                We are currently preparing our service menu and catalogue. In the meantime, feel free to reach out to us directly on WhatsApp to ask about options, availability, or pricing.
              </p>
              <div className="mt-5 flex justify-center">
                <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ background: theme.cta }}>
                  Inquire on WhatsApp <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className={`mb-8 ${clinicLayout ? 'w-full' : jewelleryLayout || astrologyLayout ? 'mx-auto max-w-xl text-center' : 'max-w-2xl'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>
              {clinicLayout
                ? 'Clinical infrastructure'
                : astrologyLayout
                ? 'Sacred methodology & insights'
                : travelLayout
                ? 'Travel moments & expedition fleet'
                : salonLayout
                ? 'Inside the studio'
                : isModern
                ? 'Selected work'
                : foodLayout
                ? 'A peek behind the counter'
                : 'Details in their own light'}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {clinicLayout
                ? 'Modern clinical facilities & diagnostic care.'
                : astrologyLayout
                ? 'Precision astrological charts & consultations.'
                : travelLayout
                ? 'Journeys designed for discovery, comfort & wonder.'
                : salonLayout
                ? 'A little of the studio feeling.'
                : isModern
                ? 'A few things we are proud of.'
                : foodLayout
                ? 'Made, dressed and shared with care.'
                : 'A closer look at the little things.'}
            </h2>
          </div>

          <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${foodLayout || travelLayout ? 'lg:grid-cols-4' : isService ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            {gallery.length > 0 ? (
              gallery.map((item, index) => (
                <figure key={item.id} className={`${index === 0 ? 'col-span-2 row-span-2' : ''} overflow-hidden rounded-2xl border`} style={{ borderColor: theme.border, background: theme.panel }}>
                  <img src={safeImageUrl(item.image)} alt={item.title} className="h-full min-h-[220px] w-full object-cover" loading="lazy" />
                  {item.title ? <figcaption className="p-3 text-xs font-medium" style={{ color: theme.muted }}>{item.title}</figcaption> : null}
                </figure>
              ))
            ) : isDemo ? (
              defaults.gallery.map((item, index) => (
                <figure key={item.image} className={`${foodLayout && index === 0 ? 'col-span-2 row-span-2' : ''} ${isService && index === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2' : ''} ${!foodLayout && !isService && (index === 1 || index === 4) ? 'row-span-2' : ''} overflow-hidden rounded-2xl border`} style={{ borderColor: theme.border, background: theme.panel }}>
                  <img src={item.image} alt={item.alt} className={`h-full w-full object-cover ${foodLayout && index === 0 ? 'min-h-[300px] sm:min-h-[360px]' : 'min-h-[160px] sm:min-h-[220px] lg:min-h-[260px]'}`} loading="lazy" />
                </figure>
              ))
            ) : (
              [heroImage, storyImage].filter(Boolean).map((imgUrl, index) => (
                <figure key={imgUrl + index} className="overflow-hidden rounded-2xl border" style={{ borderColor: theme.border, background: theme.panel }}>
                  <img src={imgUrl} alt={business.name} className="h-full min-h-[200px] w-full object-cover" loading="lazy" />
                  <figcaption className="p-3 text-xs font-medium" style={{ color: theme.muted }}>{index === 0 ? `${business.name} · ${business.category}` : storyEyebrow}</figcaption>
                </figure>
              ))
            )}
          </div>
        </section>

        {/* Final High-Conversion Banner */}
        <section id="final-cta" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div
            className={`flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between rounded-2xl ${
              jewelleryLayout
                ? 'bg-[#181512] text-white border border-[#2e2720]'
                : astrologyLayout
                ? 'bg-[#0f172a] text-[#f8fafc] border border-[#233554] shadow-[0_20px_50px_rgba(10,18,36,0.35)]'
                : ''
            }`}
            style={!jewelleryLayout && !astrologyLayout ? { background: theme.panelStrong } : undefined}
          >
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: jewelleryLayout ? '#c5a77e' : astrologyLayout ? '#f59e0b' : theme.label }}
              >
                {clinicLayout
                  ? 'Your health, in trusted hands'
                  : astrologyLayout
                  ? 'Align your stars & destiny'
                  : travelLayout
                  ? 'Plan your journey seamlessly'
                  : salonLayout
                  ? 'Make a little time for you'
                  : isModern
                  ? 'Your next step starts here'
                  : foodLayout
                  ? 'Tell us what you are celebrating'
                  : 'A piece, chosen personally'}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{finalCtaTitle}</h2>
              <p
                className="mt-3 text-base leading-relaxed"
                style={{ color: jewelleryLayout ? 'rgba(255,255,255,0.68)' : astrologyLayout ? 'rgba(226,232,240,0.75)' : theme.muted }}
              >
                {finalCtaDescription}
              </p>
            </div>
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:text-base shadow-sm"
              style={{ background: astrologyLayout ? '#d97706' : theme.cta }}
            >
              {finalCtaButton} <SocialBrandIcon platform="whatsapp" size={20} />
            </a>
          </div>
        </section>

        {/* Location & Contact Section */}
        <section id="contact" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
          <div className="grid overflow-hidden border" style={{ borderColor: theme.border, background: theme.panel }}>
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>Visit or get in touch</p>
                <h2 className="mt-3 font-heading text-3xl font-semibold">{business.name}</h2>
                <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>{business.category}{address ? ` · ${address}` : ''}</p>
                <div className="mt-6 space-y-4 text-sm">
                  {address ? (
                    <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: theme.accentStrong }} /><div><p className="font-semibold">Location</p><p className="mt-1" style={{ color: theme.muted }}>{address}</p></div></div>
                  ) : null}
                  {displayWorkingHours ? (
                    <div className="flex gap-3"><span className="mt-0.5 text-base" style={{ color: theme.accentStrong }}>◷</span><div><p className="font-semibold">Opening hours</p><p className="mt-1 whitespace-pre-line" style={{ color: theme.muted }}>{displayWorkingHours}</p></div></div>
                  ) : null}
                  {phone ? (
                    <div className="flex gap-3"><span className="mt-0.5 text-base" style={{ color: theme.accentStrong }}>☎</span><div><p className="font-semibold">Phone</p><a href={`tel:${phone}`} className="mt-1 block hover:underline" style={{ color: theme.muted }}>{phone}</a></div></div>
                  ) : null}
                  {email ? (
                    <div className="flex gap-3"><span className="mt-0.5 text-base" style={{ color: theme.accentStrong }}>✉</span><div><p className="font-semibold">Email</p><a href={`mailto:${email}`} className="mt-1 block hover:underline" style={{ color: theme.muted }}>{email}</a></div></div>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {directionsUrl ? (
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ background: theme.cta }}><MapPin aria-hidden="true" size={17} />Google Maps Directions</a>
                  ) : null}
                  {whatsapp ? (
                    <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: theme.border, color: theme.text }}><MessageCircle aria-hidden="true" size={17} />WhatsApp</a>
                  ) : null}
                </div>
                {socialLinks.length ? (
                  <div className="mt-8 border-t pt-5" style={{ borderColor: theme.border }}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: theme.label }}>Social profiles</p>
                    <div className="mt-3 flex flex-wrap gap-2" aria-label="Social profiles">
                      {socialLinks.map((social) => (
                        <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" title={social.name} className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:opacity-75" style={{ color: theme.accentDark, borderColor: theme.border }}>
                          {social.platform ? <SocialBrandIcon platform={social.platform} /> : social.icon ? <social.icon aria-hidden="true" size={18} /> : null}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="min-h-[300px] overflow-hidden bg-[#e9ece8]">
                <iframe title={`Map showing ${business.name}`} src={`https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[300px] w-full border-0" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Branded Footer */}
      <footer className="border-t" style={{ background: theme.panel, borderColor: theme.border }}>
        {isDemo ? (
          <div className="border-b border-dashed px-4 py-3 text-center text-xs" style={{ borderColor: theme.border, color: theme.muted }}>
            ⚠ <strong>Demonstration Website:</strong> This storefront is a live preview of the {template.name} template by YBGP. All offerings, services, prices, and sample photos shown are for demonstration purposes only.
          </div>
        ) : null}
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div>
            <p className="font-heading text-lg font-semibold" style={{ color: theme.accentDark }}>{business.name}</p>
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>{business.category}{address ? ` · ${address}` : ''}</p>
          </div>
          <nav aria-label={`${business.name} footer navigation`} className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium" style={{ color: theme.muted }}>
            {navItems.slice(1, 5).map((item) => <a key={item.href} href={item.href} className="hover:underline">{item.label}</a>)}
          </nav>
          <div className="flex flex-col gap-1 text-right text-xs" style={{ color: theme.muted }}>
            <p>© {new Date().getFullYear()} {business.name}.</p>
            <a
              href="https://ybgp.in/websites"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <span>Designed &amp; Powered by</span>
              <img src="/Black%20and%20Gold%20YBGP%20Logo.png" alt="YBGP" className="h-5 w-auto object-contain" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function safeExternalUrl(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.toString() : '';
  } catch {
    return '';
  }
}

function safeImageUrl(value: string | null | undefined): string {
  return resolveBusinessImageUrl(value);
}

function FoodItemCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
}: {
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
}) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to order ${name} from ${businessName}.`)}`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#ecdccf] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-56 w-full overflow-hidden bg-[#fbf6f0] sm:h-64">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center bg-[#fdf2ea]">
            <span className="font-heading text-4xl font-bold text-[#b25333]">{name.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        {price ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-[#a04a2b] px-3.5 py-1 text-xs font-bold text-white shadow-md">
            {price}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#a04a2b]">Freshly Prepared</span>
          <h3 className="mt-1 font-heading text-xl font-bold text-[#2c1810]">{name}</h3>
          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#785648]">{description}</p>
          ) : null}
        </div>
        {whatsappUrl ? (
          <div className="mt-5 border-t border-[#f4e7dd] pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#a04a2b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Order via WhatsApp
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SalonTreatmentCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
}: {
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
}) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to book an appointment for ${name} at ${businessName}.`)}`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#ebe0da] bg-[#faf6f3] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#8f5c54] hover:shadow-md">
      {image ? (
        <div className="relative h-60 w-full overflow-hidden sm:h-64">
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-wider text-[#8f5c54] backdrop-blur-sm shadow-sm">
            Treatment Ritual
          </span>
        </div>
      ) : (
        <div className="grid h-48 place-items-center bg-[#faebe6]">
          <span className="font-heading text-3xl font-light text-[#8f5c54]">{name.slice(0, 1).toUpperCase()}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-xl font-medium text-[#291e1c]">{name}</h3>
            {price ? (
              <span className="shrink-0 font-serif text-base font-semibold text-[#8f5c54]">{price}</span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#7a605a]">{description}</p>
          ) : null}
        </div>
        {whatsappUrl ? (
          <div className="mt-6 border-t border-[#ebe0da] pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8f5c54] bg-white px-4 py-2.5 text-xs font-semibold text-[#8f5c54] shadow-sm transition-colors hover:bg-[#8f5c54] hover:text-white"
            >
              Reserve Treatment Slot <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function JewelleryItemCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
}: {
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
}) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to enquire about the ${name} piece at ${businessName}.`)}`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#2e2720] bg-[#181512] text-[#f7f4ee] shadow-[0_16px_36px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c5a77e]">
      <div className="relative h-64 w-full overflow-hidden bg-[#221d17] sm:h-72">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center bg-[#241e17]">
            <span className="font-heading text-4xl font-light text-[#c5a77e]">{name.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181512] via-transparent to-transparent opacity-60" />
        <span className="absolute left-3 top-3 rounded-full border border-[#c5a77e]/40 bg-[#181512]/80 px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#e0c297] backdrop-blur-sm">
          Bespoke Craft
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-heading text-xl font-normal text-white">{name}</h3>
            {price ? (
              <span className="shrink-0 font-serif text-base tracking-wide text-[#e0c297]">{price}</span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[#b0a698]">{description}</p>
          ) : null}
        </div>
        {whatsappUrl ? (
          <div className="mt-6 border-t border-[#2e2720] pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between border-b border-[#c5a77e] pb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#e0c297] transition-colors hover:text-white"
            >
              <span>Enquire About Piece</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ModernSolutionCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
}: {
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
}) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in discussing ${name} with ${businessName}.`)}`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#dbe7df] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0e2b22] hover:shadow-md">
      {image ? (
        <div className="mb-4 h-48 w-full overflow-hidden rounded-xl bg-[#eef4f0]">
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#eef4f0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e523b]">
              Advisory Solution
            </span>
            {price ? (
              <span className="font-bold text-[#0e2b22] text-sm">{price}</span>
            ) : null}
          </div>
          <h3 className="mt-3 font-heading text-xl font-bold text-[#13281e]">{name}</h3>
          {description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#526b5e]">{description}</p>
          ) : null}
        </div>
        {whatsappUrl ? (
          <div className="mt-6 border-t border-[#eaf1ec] pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e2b22] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Discuss Scope <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ClinicServiceCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
}: {
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
}) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to book an appointment for ${name} at ${businessName}.`)}`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#cbe7e3] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0284c7] hover:shadow-md">
      {image ? (
        <div className="relative h-56 w-full overflow-hidden bg-[#f0f9f8] sm:h-60">
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0284c7] shadow-sm backdrop-blur-sm">
            Clinical Consultation
          </span>
        </div>
      ) : (
        <div className="grid h-44 place-items-center bg-[#f0fdfa]">
          <span className="font-heading text-3xl font-semibold text-[#0d9488]">{name.slice(0, 1).toUpperCase()}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-xl font-bold text-[#0f172a]">{name}</h3>
            {price ? (
              <span className="shrink-0 rounded-md bg-[#e0f2fe] px-2.5 py-1 text-xs font-bold text-[#0369a1]">{price}</span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#475569]">{description}</p>
          ) : null}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#0d9488]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Doctor Consultation &amp; Care
          </div>
        </div>
        {whatsappUrl ? (
          <div className="mt-6 border-t border-[#e2e8f0] pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Book Consultation Slot
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function AstrologyConsultationCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
}: {
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
}) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to schedule an astrological consultation for ${name} with ${businessName}. Please share available slots.`)}`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1120] text-[#f1f5f9] shadow-[0_16px_36px_rgba(2,6,23,0.5)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#f59e0b]">
      {image ? (
        <div className="relative h-56 w-full overflow-hidden bg-[#0f172a] sm:h-60">
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent opacity-70" />
          <span className="absolute left-3 top-3 rounded-full border border-[#f59e0b]/40 bg-[#0f172a]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#fbbf24] backdrop-blur-sm">
            Vedic Guidance
          </span>
        </div>
      ) : (
        <div className="grid h-44 place-items-center bg-[#0f172a]">
          <span className="font-heading text-4xl text-[#fbbf24]">✦</span>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-xl font-medium text-[#fef3c7]">{name}</h3>
            {price ? (
              <span className="shrink-0 font-serif text-base font-semibold text-[#f59e0b]">{price}</span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#94a3b8]">{description}</p>
          ) : null}
          <div className="mt-4 flex items-center gap-2 text-xs text-[#cbd5e1]">
            <Sparkles className="h-3.5 w-3.5 text-[#f59e0b]" /> Birth Chart Analysis Included
          </div>
        </div>
        {whatsappUrl ? (
          <div className="mt-6 border-t border-[#1e293b] pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Consult Astrologer
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TravelPackageCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
}: {
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
}) {
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${name} package from ${businessName}. Please share itinerary and quote.`)}`
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#fed7aa] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ea580c] hover:shadow-md">
      {image ? (
        <div className="relative h-60 w-full overflow-hidden bg-[#fff7ed] sm:h-64">
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          <span className="absolute left-3 top-3 rounded-full bg-[#c2410c] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Curated Tour
          </span>
          {price ? (
            <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#c2410c] shadow-md backdrop-blur-sm">
              {price}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="grid h-44 place-items-center bg-[#fff7ed]">
          <span className="font-heading text-4xl text-[#ea580c]">✈</span>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="font-heading text-xl font-bold text-[#292524]">{name}</h3>
          {description ? (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#57534e]">{description}</p>
          ) : null}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#c2410c]">
            <Compass className="h-3.5 w-3.5" /> Transport, Guide &amp; Custom Schedule
          </div>
        </div>
        {whatsappUrl ? (
          <div className="mt-6 border-t border-[#ffedd5] pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Inquire Package Quote
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TemplateItemCard({
  name,
  description,
  price,
  image,
  whatsapp,
  businessName,
  theme,
  design,
}: {
  key?: string;
  name: string;
  description: string | null;
  price?: string;
  image?: string;
  whatsapp?: string | null;
  businessName: string;
  theme: WebsiteTheme;
  design: WebsiteTemplateDesign;
}) {
  if (design === 'food') {
    return (
      <FoodItemCard
        name={name}
        description={description}
        price={price}
        image={image}
        whatsapp={whatsapp}
        businessName={businessName}
        theme={theme}
      />
    );
  }
  if (design === 'salon') {
    return (
      <SalonTreatmentCard
        name={name}
        description={description}
        price={price}
        image={image}
        whatsapp={whatsapp}
        businessName={businessName}
        theme={theme}
      />
    );
  }
  if (design === 'jewellery') {
    return (
      <JewelleryItemCard
        name={name}
        description={description}
        price={price}
        image={image}
        whatsapp={whatsapp}
        businessName={businessName}
        theme={theme}
      />
    );
  }
  if (design === 'clinic') {
    return (
      <ClinicServiceCard
        name={name}
        description={description}
        price={price}
        image={image}
        whatsapp={whatsapp}
        businessName={businessName}
        theme={theme}
      />
    );
  }
  if (design === 'astrology') {
    return (
      <AstrologyConsultationCard
        name={name}
        description={description}
        price={price}
        image={image}
        whatsapp={whatsapp}
        businessName={businessName}
        theme={theme}
      />
    );
  }
  if (design === 'travel') {
    return (
      <TravelPackageCard
        name={name}
        description={description}
        price={price}
        image={image}
        whatsapp={whatsapp}
        businessName={businessName}
        theme={theme}
      />
    );
  }
  return (
    <ModernSolutionCard
      name={name}
      description={description}
      price={price}
      image={image}
      whatsapp={whatsapp}
      businessName={businessName}
      theme={theme}
    />
  );
}
