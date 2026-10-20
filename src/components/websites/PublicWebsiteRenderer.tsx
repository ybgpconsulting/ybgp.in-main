import { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, Link2, MapPin, Menu, MessageCircle, X } from 'lucide-react';
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
  const isModern = design === 'modern';
  const isService = isModern || salonLayout;
  const collectionId = isService ? 'services' : 'collections';

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
  const ctaText = data.primaryAction?.text || settings.cta_text || (foodLayout ? 'Order on WhatsApp' : salonLayout ? 'Book Appointment' : jewelleryLayout ? 'Explore Collection' : 'Start a conversation');
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

  const navItems = foodLayout
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

  return (
    <div className={`min-h-screen ${foodLayout ? 'font-sans' : ''}`} style={{ background: theme.pageBg, color: theme.text }}>
      {/* Sticky Blurred Brand Header */}
      <header className="sticky top-0 z-50 border-b transition-colors" style={{ background: theme.headerSurface, borderColor: theme.border, backdropFilter: 'blur(18px)' }}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
          <a href="#home" className="flex min-w-0 items-center gap-3" aria-label={`${business.name} home`}>
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
        {/* Full Storefront Hero */}
        {foodLayout ? (
          <section id="home" className="relative mx-auto mt-3 min-h-[570px] max-w-[1440px] overflow-hidden sm:mt-6 sm:min-h-[620px] sm:rounded-[28px] lg:min-h-[700px]">
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(31,17,10,0.85) 0%, rgba(39,22,14,0.55) 50%, rgba(39,22,14,0.15) 100%)' }} />
            <div className="relative flex min-h-[570px] max-w-3xl flex-col justify-center px-5 py-14 sm:min-h-[620px] sm:px-10 lg:min-h-[700px] lg:px-16 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d5af]">{business.category || defaults.hero.eyebrow}</p>
              <h1 className="mt-5 max-w-[660px] font-heading text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">{business.name}</h1>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.label }}>{business.category || defaults.hero.eyebrow}</p>
              <h1 className="mt-5 max-w-xl font-heading text-4xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[4.75rem]">{business.name}</h1>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c5a77e]">{business.category || defaults.hero.eyebrow}</p>
              <h1 className="mt-6 max-w-xl font-heading text-4xl font-normal leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[5rem]">{business.name}</h1>
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
        ) : (
          <section id="home" className="mx-auto grid max-w-[1440px] overflow-hidden lg:min-h-[650px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:order-1 lg:px-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.label }}>{business.category || defaults.hero.eyebrow}</p>
              <h1 className="mt-5 max-w-xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[4.75rem]">{business.name}</h1>
              <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg" style={{ color: theme.muted }}>{business.description || seo.description || defaults.hero.description}</p>
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
          <div className={`mb-8 ${jewelleryLayout ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>
              {salonLayout ? 'The salon menu' : isModern ? 'What we do' : foodLayout ? 'From the counter' : 'The collection'}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              {foodLayout ? 'A little something for every kind of gathering.' : salonLayout ? 'Care that starts with listening.' : isModern ? 'The right support for your next step.' : 'Pieces with presence. Made for your own story.'}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: theme.muted }}>{business.description || defaults.summary}</p>
          </div>

          <div className={`grid gap-5 ${foodLayout ? 'sm:grid-cols-2 xl:grid-cols-4' : isService ? 'sm:grid-cols-2 lg:gap-x-8 lg:gap-y-10' : 'sm:grid-cols-2 lg:grid-cols-4 lg:gap-8'}`}>
            {defaults.highlights.map((item, index) => (
              <article key={item.title} className={`${isService ? 'group' : foodLayout ? 'overflow-hidden border shadow-[0_16px_36px_rgba(61,34,18,0.08)]' : 'overflow-hidden border-b pb-5'}`} style={foodLayout ? { background: theme.panel, borderColor: theme.border } : !isService ? { borderColor: theme.border } : undefined}>
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
        </section>

        {/* Story Section */}
        <section id="about" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          {foodLayout ? (
            <div className="grid overflow-hidden lg:grid-cols-[1fr_1fr]" style={{ background: theme.panelStrong }}>
              <img src={defaults.story.image} alt="" className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[560px]" loading="lazy" />
              <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>{defaults.story.eyebrow}</p>
                <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-tight sm:text-4xl">{defaults.story.title}</h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: theme.muted }}>{business.description || defaults.story.description}</p>
                <div className="mt-6 space-y-2.5">
                  {defaults.story.points.map((point) => (
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
                <img src={defaults.story.image} alt="" className="h-[380px] w-full object-cover sm:h-[520px] lg:h-[600px]" loading="lazy" />
                <span className="absolute bottom-4 left-4 max-w-[240px] bg-white/90 px-4 py-3 font-heading text-lg italic shadow-sm sm:bottom-8 sm:left-8 sm:text-xl" style={{ color: theme.accentDark }}>{isModern ? 'Thoughtful work, made personal.' : 'A softer kind of salon day.'}</span>
              </div>
              <div className="max-w-xl py-3 lg:py-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>{defaults.story.eyebrow}</p>
                <h2 className="mt-4 font-heading text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl">{defaults.story.title}</h2>
                <p className="mt-5 text-base leading-relaxed" style={{ color: theme.muted }}>{business.description || defaults.story.description}</p>
                <div className="mt-7 space-y-3 border-t pt-5" style={{ borderColor: theme.border }}>
                  {defaults.story.points.map((point) => <p key={point} className="text-sm font-medium">✓ {point}</p>)}
                </div>
                <a href="#contact" className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: theme.cta }}>{defaults.story.cta} <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
          ) : (
            <div className={`grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:p-12 ${jewelleryLayout ? 'bg-[#181512] border border-[#2e2720] text-[#f7f4ee]' : 'bg-[#eae4dc]'}`}>
              <div className="flex flex-col justify-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>{defaults.story.eyebrow}</p>
                <h2 className="mt-4 font-heading text-3xl font-normal leading-tight tracking-[-0.03em] sm:text-4xl">{defaults.story.title}</h2>
                <p className="mt-5 text-sm leading-relaxed sm:text-base" style={{ color: theme.muted }}>{business.description || defaults.story.description}</p>
                <div className="mt-6 space-y-2">
                  {defaults.story.points.map((point) => <p key={point} className={`text-sm font-medium ${jewelleryLayout ? 'text-[#e0c297]' : 'text-[#211a13]'}`}>✦ {point}</p>)}
                </div>
                <a href="#contact" className="mt-7 inline-flex w-fit items-center gap-2 border-b pb-2 text-sm font-semibold" style={{ borderColor: theme.accent, color: theme.accentDark }}>{defaults.story.cta} <ArrowRight className="h-4 w-4" /></a>
              </div>
              <img src={defaults.story.image} alt="" className="h-[320px] w-full object-cover sm:h-[460px] lg:h-[580px]" loading="lazy" />
            </div>
          )}
        </section>

        {/* Offerings & Products Section */}
        <section id="bestsellers" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>
                {salonLayout ? 'Most requested' : isModern ? 'Ways to work together' : foodLayout ? 'Customer favourites' : 'A few beloved pieces'}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {products.length > 0
                  ? 'Our products & services'
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
              {salonLayout ? 'Book a visit' : isModern ? 'Talk through your goals' : foodLayout ? 'Order a favourite' : 'Ask about a piece'} <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {categories.length > 0 ? (
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <a key={category.id} href={`#category-${category.id}`} className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold" style={{ borderColor: theme.border, background: theme.panel, color: theme.text }}>
                  {category.name}
                </a>
              ))}
            </div>
          ) : null}

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
          ) : (
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
          )}
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className={`mb-8 ${jewelleryLayout ? 'mx-auto max-w-xl text-center' : 'max-w-2xl'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.label }}>
              {salonLayout ? 'Inside the studio' : isModern ? 'Selected work' : foodLayout ? 'A peek behind the counter' : 'Details in their own light'}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {salonLayout ? 'A little of the studio feeling.' : isModern ? 'A few things we are proud of.' : foodLayout ? 'Made, dressed and shared with care.' : 'A closer look at the little things.'}
            </h2>
          </div>

          <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${foodLayout ? 'lg:grid-cols-4' : isService ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            {gallery.length > 0 ? (
              gallery.map((item, index) => (
                <figure key={item.id} className={`${index === 0 ? 'col-span-2 row-span-2' : ''} overflow-hidden rounded-2xl border`} style={{ borderColor: theme.border, background: theme.panel }}>
                  <img src={safeImageUrl(item.image)} alt={item.title} className="h-full min-h-[220px] w-full object-cover" loading="lazy" />
                  {item.title ? <figcaption className="p-3 text-xs font-medium" style={{ color: theme.muted }}>{item.title}</figcaption> : null}
                </figure>
              ))
            ) : (
              defaults.gallery.map((item, index) => (
                <figure key={item.image} className={`${foodLayout && index === 0 ? 'col-span-2 row-span-2' : ''} ${isService && index === 0 ? 'col-span-2 lg:col-span-1 lg:row-span-2' : ''} ${!foodLayout && !isService && (index === 1 || index === 4) ? 'row-span-2' : ''} overflow-hidden rounded-2xl border`} style={{ borderColor: theme.border, background: theme.panel }}>
                  <img src={item.image} alt={item.alt} className={`h-full w-full object-cover ${foodLayout && index === 0 ? 'min-h-[300px] sm:min-h-[360px]' : 'min-h-[160px] sm:min-h-[220px] lg:min-h-[260px]'}`} loading="lazy" />
                </figure>
              ))
            )}
          </div>
        </section>

        {/* Final High-Conversion Banner */}
        <section id="final-cta" className="scroll-mt-24 mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className={`flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between ${jewelleryLayout ? 'bg-[#181512] text-white border border-[#2e2720]' : ''}`} style={!jewelleryLayout ? { background: theme.panelStrong } : undefined}>
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: jewelleryLayout ? '#c5a77e' : theme.label }}>
                {salonLayout ? 'Make a little time for you' : isModern ? 'Your next step starts here' : foodLayout ? 'Tell us what you are celebrating' : 'A piece, chosen personally'}
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{defaults.finalCta.title}</h2>
              <p className="mt-3 text-base leading-relaxed" style={{ color: jewelleryLayout ? 'rgba(255,255,255,0.68)' : theme.muted }}>{defaults.finalCta.description}</p>
            </div>
            <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:text-base shadow-sm" style={{ background: theme.cta }}>
              {defaults.finalCta.button} <MessageCircle className="h-5 w-5" />
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
              <span>Designed &amp; Powered by YBGP</span>
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
