import { useEffect, useState } from 'react';
import { Link2, MapPin, Navigation } from 'lucide-react';
import { SocialBrandIcon, type SocialPlatform } from './SocialBrandIcon';
import { getWebsiteTemplateDesign } from './templateDesigns';

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
  const design = getWebsiteTemplateDesign(template.slug);
  const foodLayout = design === 'food';
  const salonLayout = design === 'salon';
  const jewelleryLayout = design === 'jewellery';
  const whatsapp = settings.whatsapp || business.whatsapp;
  const phone = settings.call_phone || business.phone;
  const email = settings.contact_email || business.email;
  const address = [business.address || settings.contact_address, settings.city, settings.pincode].filter(Boolean).join(', ');
  const explicitMapsUrl = safeExternalUrl(business.google_maps_url);
  const locationQuery = [business.address || settings.contact_address, settings.city, settings.pincode].filter(Boolean).join(', ');
  const directionsUrl = explicitMapsUrl || (locationQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`
    : '');
  const mapEmbedUrl = locationQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`
    : '';
  const ctaText = settings.cta_text || 'Contact us';
  const ctaUrl = safeUrl(settings.cta_url) || (whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : phone ? `tel:${phone}` : email ? `mailto:${email}` : '#contact');
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
    .find((image): image is string => Boolean(image)) || '';
  const heroActions = (
    <div className={`mt-7 flex flex-wrap gap-3 ${salonLayout ? 'justify-center' : ''} ${jewelleryLayout ? 'text-[#211a13]' : ''}`}>
      <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className={`rounded-full px-5 py-3 text-sm font-bold ${jewelleryLayout ? 'bg-[#c5a77e] text-[#211a13]' : foodLayout ? 'bg-[#f4e2d3] text-[#603b2c]' : salonLayout ? 'bg-[#8f5c54] text-white' : 'bg-[#173629] text-white'}`}>{ctaText}</a>
      {phone ? <a href={`tel:${phone}`} className={`rounded-full border px-5 py-3 text-sm font-bold ${jewelleryLayout ? 'border-white/30 text-white' : salonLayout ? 'border-[#8f5c54]/25 text-[#8f5c54]' : foodLayout ? 'border-white/45 text-white' : 'border-[#173629]/20 text-[#173629]'}`}>Call us</a> : null}
      {whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={`rounded-full border px-5 py-3 text-sm font-bold ${jewelleryLayout ? 'border-[#c5a77e]/60 text-[#e8d3b1]' : salonLayout ? 'border-[#8f5c54]/25 text-[#8f5c54]' : foodLayout ? 'border-white/45 text-white' : 'border-[#173629]/20 text-[#173629]'}`}>WhatsApp</a> : null}
      {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={`rounded-full border px-5 py-3 text-sm font-bold ${jewelleryLayout ? 'border-white/30 text-white' : salonLayout ? 'border-[#8f5c54]/25 text-[#8f5c54]' : foodLayout ? 'border-white/45 text-white' : 'border-[#173629]/20 text-[#173629]'}`}>Directions</a> : null}
    </div>
  );

  return (
    <main className={`min-h-screen ${jewelleryLayout ? 'bg-[#f2eee8] text-[#24201c]' : foodLayout ? 'bg-[#fbf5ed] text-[#34261e]' : salonLayout ? 'bg-[#f8f3f0] text-[#302623]' : 'bg-[#f4f7f4] text-[#192c23]'}`}>
      <header className={`${jewelleryLayout ? 'bg-[#171411]' : foodLayout ? 'bg-[#3f2d24]' : salonLayout ? 'bg-[#fffdfb]' : 'bg-[#0E2B22]'} px-4 py-5 ${salonLayout ? 'text-[#302623]' : 'text-white'} sm:px-6`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a className="flex min-w-0 items-center gap-3" href="#top">
            {safeImageUrl(business.logo) ? <img src={safeImageUrl(business.logo)} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-bold ${salonLayout ? 'bg-[#f0e5df] text-[#8f5c54]' : 'bg-white/10'}`}>{business.name.slice(0, 1).toUpperCase()}</span>}
            <span className="min-w-0"><span className={`block truncate text-xs font-semibold uppercase tracking-[0.2em] ${salonLayout ? 'text-[#8f5c54]' : 'text-white/65'}`}>{template.name}</span><span className="block truncate text-lg font-bold">{business.name}</span></span>
          </a>
          <nav className={`hidden items-center gap-5 text-sm sm:flex ${salonLayout ? 'text-[#6e5651]' : 'text-white/80'}`}>
            <a className={salonLayout ? 'hover:text-[#8f5c54]' : 'hover:text-white'} href="#offerings">Offerings</a>
            {gallery.length ? <a className={salonLayout ? 'hover:text-[#8f5c54]' : 'hover:text-white'} href="#gallery">Gallery</a> : null}
            {address || phone || whatsapp || email ? <a className={salonLayout ? 'hover:text-[#8f5c54]' : 'hover:text-white'} href="#contact">Contact</a> : null}
          </nav>
          <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold shadow-sm sm:text-sm ${jewelleryLayout ? 'bg-[#c5a77e] text-[#211a13]' : foodLayout ? 'bg-[#f4e2d3] text-[#603b2c]' : salonLayout ? 'bg-[#8f5c54] text-white' : 'bg-white text-[#183629]'}`}>{ctaText}</a>
        </div>
      </header>

      {foodLayout ? (
        <section id="top" className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-[#754b39] text-white">
          {heroImage ? <img src={heroImage} alt={`${business.name} featured offering`} className="absolute inset-0 -z-20 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#28160f]/90 via-[#40261a]/75 to-[#40261a]/15" />
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f4d2b4]">{business.category}</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.02] sm:text-7xl">{business.name}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{business.description || seo.description}</p>
            {heroActions}
          </div>
          <p className="absolute bottom-5 right-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">{settings.working_hours || settings.city || 'Made fresh for you'}</p>
        </section>
      ) : salonLayout ? (
        <section id="top" className="bg-[#f0e5df] px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8f5c54]">{business.category}</p>
            <h1 className="mt-4 font-serif text-5xl font-medium leading-tight tracking-tight text-[#302623] sm:text-7xl">{business.name}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6e5651] sm:text-lg">{business.description || seo.description}</p>
            {heroActions}
            <div className="relative mx-auto mt-10 h-[260px] max-w-3xl overflow-hidden rounded-t-[12rem] bg-gradient-to-br from-[#cba99e] via-[#f1e5df] to-[#9b7169] sm:h-[360px] sm:rounded-t-[18rem]">
              {heroImage ? <img src={heroImage} alt={`${business.name} studio`} className="h-full w-full object-cover" /> : <div className="absolute inset-0 grid place-items-center font-serif text-5xl text-white/75">{business.name.slice(0, 1).toUpperCase()}</div>}
            </div>
            {settings.working_hours ? <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f5c54]">{settings.working_hours}</p> : null}
          </div>
        </section>
      ) : jewelleryLayout ? (
        <section id="top" className="relative isolate flex min-h-[560px] items-end overflow-hidden bg-[#171411] text-[#f8f5ef] sm:min-h-[680px]">
          {heroImage ? <img src={heroImage} alt={`${business.name} featured collection`} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-75" /> : null}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#171411] via-[#171411]/40 to-[#171411]/10" />
          <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-32 sm:px-10 sm:pb-20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c5a77e]">{business.category} <span className="mx-2 text-white/35">/</span> {settings.city || 'The collection'}</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-normal leading-[1.02] sm:text-7xl">{business.name}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">{business.description || seo.description}</p>
            {heroActions}
          </div>
        </section>
      ) : (
        <section id="top" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="overflow-hidden rounded-[2rem] bg-[#dfeae2]">
            <div className="grid min-h-[330px] items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#587464]">{business.category}</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">{business.name}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#31453a]/80 sm:text-lg">{business.description || seo.description}</p>
                {heroActions}
              </div>
              <div className="relative flex min-h-60 items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#6f9680] to-[#294a38] p-8">
                {heroImage ? <img src={heroImage} alt={`${business.name} gallery`} className="absolute inset-0 h-full w-full object-cover opacity-50" /> : null}
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[30px] border-white/10" />
                <div className="relative text-center text-white"><p className="text-xs font-bold uppercase tracking-[0.25em] text-white/65">{settings.city || 'Local business'}</p><p className="mt-4 text-3xl font-bold">{business.category}</p><p className="mt-3 text-sm text-white/75">{settings.working_hours || 'Here to help you'}</p></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-2 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {categories.map((category) => <a key={category.id} href={`#category-${category.id}`} className={`shrink-0 border px-4 py-2 text-sm font-semibold ${jewelleryLayout ? 'border-[#d6c8b6] bg-[#fffdf9] text-[#51463c]' : salonLayout ? 'rounded-full border-[#eadfd9] bg-white text-[#8f5c54]' : foodLayout ? 'border-[#e7d1c0] bg-[#fffaf6] text-[#754b39]' : 'rounded-full border-[#dce4dc] bg-white text-[#334b3c]'}`}>{category.name}</a>)}
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section id="offerings" className={`py-8 sm:py-10 ${jewelleryLayout ? 'bg-[#f2eee8]' : foodLayout ? 'bg-[#fbf5ed]' : salonLayout ? 'bg-[#f8f3f0]' : 'bg-[#f4f7f4]'}`}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className={`text-xs font-bold uppercase tracking-[0.2em] ${jewelleryLayout ? 'text-[#876444]' : salonLayout ? 'text-[#8f5c54]' : foodLayout ? 'text-[#a45e3e]' : 'text-[#587464]'}`}>{foodLayout ? 'From our kitchen' : salonLayout ? 'The experience' : jewelleryLayout ? 'The collection' : 'Explore'}</p><h2 className="mt-2 text-3xl font-extrabold">{foodLayout ? 'Fresh from the menu' : salonLayout ? 'Services & treatments' : jewelleryLayout ? 'Selected pieces' : 'Products & services'}</h2></div><p className="text-sm text-[#718078]">{products.length} available</p></div>
            {categories.length ? categories.map((category) => {
              const categoryProducts = products.filter((product) => product.category_id === category.id);
              if (categoryProducts.length === 0) return null;
              return <div key={category.id} id={`category-${category.id}`} className="mb-8"><h3 className="mb-3 text-xl font-bold">{category.name}</h3><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categoryProducts.map((product) => <ProductCard key={product.id} product={product} design={design} whatsapp={whatsapp} />)}</div></div>;
            }) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.filter((product) => !product.category_id || !categories.some((category) => category.id === product.category_id)).map((product) => <ProductCard key={product.id} product={product} design={design} whatsapp={whatsapp} />)}</div>
          </div>
        </section>
      ) : (
        <section id="offerings" className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="rounded-2xl border border-dashed border-[#d5ded6] bg-white/70 px-6 py-10 text-center"><h2 className="text-xl font-bold">Offerings coming soon</h2><p className="mt-2 text-sm text-[#718078]">Contact {business.name} to learn more.</p></div></section>
      )}

      {gallery.length ? (
        <section id="gallery" className={`py-10 ${jewelleryLayout ? 'bg-[#171411] text-[#f8f5ef]' : salonLayout ? 'bg-[#fffdfb]' : foodLayout ? 'bg-[#f4e4d5] text-[#34261e]' : 'bg-white/65'}`}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6"><p className={`text-xs font-bold uppercase tracking-[0.2em] ${jewelleryLayout ? 'text-[#c5a77e]' : 'text-[#9d7723]'}`}>A closer look</p><h2 className="mt-2 text-3xl font-extrabold">Gallery</h2>
            <div className={`mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${jewelleryLayout ? '[&>figure:nth-child(even)]:mt-8' : ''}`}>
              {gallery.map((item) => <figure key={item.id} className={`overflow-hidden border shadow-sm ${foodLayout ? 'border-[#eddfd2] bg-[#fffaf6]' : salonLayout ? 'rounded-2xl border-[#eadfd9] bg-white' : jewelleryLayout ? 'border-[#51483d] bg-[#231f1a]' : 'rounded-2xl border-[#e8e2d7] bg-white'}`}><img src={safeImageUrl(item.image)} alt={item.title} className="h-56 w-full bg-[#eeeae2] object-cover" loading="lazy" /><figcaption className={`p-4 text-sm font-semibold ${jewelleryLayout ? 'text-[#f8f5ef]' : ''}`}>{item.title}</figcaption></figure>)}
            </div>
          </div>
        </section>
      ) : null}

      {business.description ? (
        <section id="about" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className={`grid gap-6 p-6 sm:p-9 lg:grid-cols-[0.65fr_1.35fr] lg:items-center ${jewelleryLayout ? 'bg-[#231f1a] text-[#f8f5ef]' : foodLayout ? 'bg-[#f0e2d6]' : salonLayout ? 'rounded-[2rem] bg-[#f0e5df]' : 'bg-[#e5eee8]'}`}>
            <div><p className={`text-xs font-bold uppercase tracking-[0.2em] ${jewelleryLayout ? 'text-[#c5a77e]' : 'text-[#9d7723]'}`}>A little about us</p><h2 className="mt-2 text-3xl font-extrabold">{business.name}</h2><p className="mt-2 text-sm font-medium opacity-70">{business.category}</p></div>
            <p className="max-w-3xl whitespace-pre-line text-base leading-7 opacity-80">{business.description}</p>
          </div>
        </section>
      ) : null}

      <footer id="contact" className={`${jewelleryLayout ? 'bg-[#171411]' : foodLayout ? 'bg-[#3f2d24]' : salonLayout ? 'bg-[#3c2e2b]' : 'bg-[#10271d]'} px-4 py-10 text-white sm:px-6`}>
        <div className="mx-auto grid max-w-6xl gap-7 sm:grid-cols-2">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d3bb78]">Get in touch</p><h2 className="mt-2 text-2xl font-bold">{business.name}</h2><p className="mt-2 text-sm text-white/65">{business.category}</p>{address ? <p className="mt-4 max-w-lg whitespace-pre-wrap text-sm leading-6 text-white/80">{address}</p> : null}{directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"><Navigation aria-hidden="true" size={17} />Get Directions</a> : null}{settings.working_hours ? <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{settings.working_hours}</p> : null}</div>
          <div className="flex flex-col gap-3 sm:items-end">
            {phone ? <a href={`tel:${phone}`} className="text-sm text-white/85">Call: {phone}</a> : null}
            {email ? <a href={`mailto:${email}`} className="text-sm text-white/85">{email}</a> : null}
            {whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"><SocialBrandIcon platform="whatsapp" size={18} />Message on WhatsApp</a> : null}
            {socialLinks.length ? <div className="mt-2 flex flex-wrap gap-3" aria-label="Social media links">{socialLinks.map((social) => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name} title={social.name} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:bg-white/10">{social.platform ? <SocialBrandIcon platform={social.platform} /> : social.icon ? <social.icon aria-hidden="true" size={19} /> : null}</a>)}</div> : null}
          </div>
        </div>
        {mapEmbedUrl ? <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-white/5"><div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3bb78]">Find us</p><p className="mt-1 text-sm text-white/75">{address || locationQuery}</p></div>{directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"><Navigation aria-hidden="true" size={16} />Open in Google Maps</a> : null}</div><iframe title={`Map to ${business.name}`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full border-0" /></div> : null}
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-4 text-xs text-white/45">© {new Date().getFullYear()} {business.name}. Powered by YBGP Websites.</div>
      </footer>
    </main>
  );
}

function safeUrl(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:', 'tel:', 'mailto:'].includes(url.protocol) ? value : '';
  } catch {
    return '';
  }
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
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password
      ? url.toString()
      : '';
  } catch {
    return '';
  }
}

function ProductCard({
  product,
  design,
  whatsapp,
}: {
  key?: string;
  product: BusinessWebsiteResponse['products'][number];
  design: ReturnType<typeof getWebsiteTemplateDesign>;
  whatsapp: string | null;
}) {
  const foodLayout = design === 'food';
  const salonLayout = design === 'salon';
  const jewelleryLayout = design === 'jewellery';
  const image = safeImageUrl(product.image);
  return (
    <article className={`overflow-hidden border ${foodLayout ? 'rounded-xl border-[#eddfd2] bg-[#fffaf6] shadow-[0_8px_24px_rgba(117,75,57,0.08)]' : salonLayout ? 'rounded-3xl border-[#eadfd9] bg-[#fffdfb] shadow-[0_8px_24px_rgba(143,92,84,0.08)]' : jewelleryLayout ? 'border-[#51483d] bg-[#231f1a] text-[#f8f5ef] shadow-[0_8px_28px_rgba(43,35,27,0.12)]' : 'rounded-2xl border-[#e7e5dc] bg-white shadow-[0_6px_20px_rgba(35,48,38,0.05)]'}`}>
      {image ? <img src={image} alt="" className="h-48 w-full bg-[#f0eee8] object-cover" loading="lazy" /> : <div className={`grid h-32 place-items-center ${foodLayout ? 'bg-[#f5e6d9]' : salonLayout ? 'bg-[#f0e5df]' : jewelleryLayout ? 'bg-[#e8dfd3]' : 'bg-[#e9f0eb]'}`}><span className="text-4xl font-light text-[#617568]/60">{product.name.slice(0, 1).toUpperCase()}</span></div>}
      <div className="p-5"><h3 className="text-lg font-bold">{product.name}</h3>{product.description ? <p className={`mt-2 line-clamp-3 text-sm leading-6 ${jewelleryLayout ? 'text-white/60' : 'text-[#68746c]'}`}>{product.description}</p> : null}
        <div className="mt-5 flex items-center justify-between gap-3"><span className={`font-bold ${jewelleryLayout ? 'text-[#c5a77e]' : salonLayout ? 'text-[#8f5c54]' : foodLayout ? 'text-[#a45e3e]' : 'text-[#183629]'}`}>{product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Ask for details'}</span>{whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I am interested in ${product.name}.`)}`} target="_blank" rel="noopener noreferrer" className={`rounded-full px-3 py-2 text-xs font-bold ${foodLayout ? 'bg-[#a45e3e] text-white' : salonLayout ? 'bg-[#f3e4df] text-[#8f5c54]' : jewelleryLayout ? 'bg-[#c5a77e] text-[#211a13]' : 'bg-[#eaf0eb] text-[#173629]'}`}>{foodLayout ? 'Order / enquire' : salonLayout ? 'Book / enquire' : 'Enquire'}</a> : null}</div>
      </div>
    </article>
  );
}
