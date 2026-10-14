import { useEffect, useState } from 'react';
import { Facebook, Instagram, Link2, Linkedin, MapPin, Navigation, Youtube } from 'lucide-react';

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
  subscription: {
    plan: string | null;
    amount: string | null;
    status: string | null;
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
        setLoading(false);
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
    document.head.querySelector('meta[property="og:title"]')?.setAttribute('content', data.seo.ogTitle);
    document.head.querySelector('meta[property="og:description"]')?.setAttribute('content', data.seo.ogDescription);
    if (data.seo.ogImage) document.head.querySelector('meta[property="og:image"]')?.setAttribute('content', data.seo.ogImage);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', data.seo.canonicalUrl);
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
  const foodLayout = template.slug === 'food-bakery';
  const whatsapp = settings.whatsapp || business.whatsapp;
  const phone = settings.call_phone || business.phone;
  const email = settings.contact_email || business.email;
  const address = [business.address || settings.contact_address, settings.city, settings.pincode].filter(Boolean).join(', ');
  const explicitMapsUrl = safeExternalUrl(business.google_maps_url);
  const locationQuery = [business.address || settings.contact_address, settings.city, settings.pincode].filter(Boolean).join(', ');
  const directionsUrl = explicitMapsUrl || (locationQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`
    : '');
  const ctaText = settings.cta_text || 'Contact us';
  const ctaUrl = safeUrl(settings.cta_url) || (whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : phone ? `tel:${phone}` : email ? `mailto:${email}` : '#contact');
  const socialLinks = [
    { name: 'Instagram', url: business.instagram_url, icon: Instagram },
    { name: 'Facebook', url: business.facebook_url, icon: Facebook },
    { name: 'YouTube', url: settings.youtube_url, icon: Youtube },
    { name: 'LinkedIn', url: settings.linkedin_url, icon: Linkedin },
    { name: 'Google Business', url: settings.google_business_url, icon: MapPin },
    { name: 'Other social link', url: settings.other_social_url, icon: Link2 },
  ].map((item) => ({ ...item, url: safeExternalUrl(item.url) }))
    .filter((item) => Boolean(item.url));

  return (
    <main className={`min-h-screen text-[#192c23] ${foodLayout ? 'bg-[#fbf5ed]' : 'bg-[#f4f7f4]'}`}>
      <header className={`${foodLayout ? 'bg-[#3f2d24]' : 'bg-[#0E2B22]'} px-4 py-5 text-white sm:px-6`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a className="flex min-w-0 items-center gap-3" href="#top">
            {business.logo ? <img src={business.logo} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-lg font-bold">{business.name.slice(0, 1).toUpperCase()}</span>}
            <span className="min-w-0"><span className="block truncate text-xs font-semibold uppercase tracking-[0.2em] text-white/65">{template.name}</span><span className="block truncate text-lg font-bold">{business.name}</span></span>
          </a>
          <nav className="hidden items-center gap-5 text-sm text-white/80 sm:flex">
            <a className="hover:text-white" href="#offerings">Offerings</a>
            {gallery.length ? <a className="hover:text-white" href="#gallery">Gallery</a> : null}
            {address ? <a className="hover:text-white" href="#contact">Contact</a> : null}
          </nav>
          <a href={ctaUrl} target={ctaUrl.startsWith('http') ? '_blank' : undefined} rel={ctaUrl.startsWith('http') ? 'noreferrer' : undefined} className="shrink-0 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#183629] shadow-sm sm:text-sm">{ctaText}</a>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className={`overflow-hidden rounded-[2rem] ${foodLayout ? 'bg-[#f0d9c7]' : 'bg-[#dfeae2]'}`}>
          <div className="grid min-h-[330px] items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-14">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.24em] ${foodLayout ? 'text-[#8e5135]' : 'text-[#587464]'}`}>{business.category}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">{business.name}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#31453a]/80 sm:text-lg">{business.description || seo.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {phone ? <a href={`tel:${phone}`} className="rounded-full bg-[#173629] px-5 py-3 text-sm font-bold text-white">Call {phone}</a> : null}
                {whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={`rounded-full px-5 py-3 text-sm font-bold ${foodLayout ? 'bg-[#a45e3e] text-white' : 'bg-white text-[#173629]'}`}>WhatsApp</a> : null}
              </div>
            </div>
            <div className={`relative hidden min-h-60 items-center justify-center overflow-hidden rounded-[1.5rem] p-8 lg:flex ${foodLayout ? 'bg-gradient-to-br from-[#c9825e] to-[#754b39]' : 'bg-gradient-to-br from-[#6f9680] to-[#294a38]'}`}>
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[30px] border-white/10" />
              <div className="relative text-center text-white"><p className="text-xs font-bold uppercase tracking-[0.25em] text-white/65">{settings.city || 'Local business'}</p><p className="mt-4 text-3xl font-bold">{business.category}</p><p className="mt-3 text-sm text-white/75">{settings.working_hours || 'Here to help you'}</p></div>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-2 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {categories.map((category) => <a key={category.id} href={`#category-${category.id}`} className="shrink-0 rounded-full border border-[#dce4dc] bg-white px-4 py-2 text-sm font-semibold text-[#334b3c]">{category.name}</a>)}
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section id="offerings" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">Explore</p><h2 className="mt-2 text-3xl font-extrabold">Products &amp; services</h2></div><p className="text-sm text-[#718078]">{products.length} available</p></div>
          {categories.length ? categories.map((category) => {
            const categoryProducts = products.filter((product) => product.category_id === category.id);
            if (categoryProducts.length === 0) return null;
            return <div key={category.id} id={`category-${category.id}`} className="mb-8"><h3 className="mb-3 text-xl font-bold">{category.name}</h3><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categoryProducts.map((product) => <ProductCard key={product.id} product={product} foodLayout={foodLayout} whatsapp={whatsapp} />)}</div></div>;
          }) : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.filter((product) => !product.category_id || !categories.some((category) => category.id === product.category_id)).map((product) => <ProductCard key={product.id} product={product} foodLayout={foodLayout} whatsapp={whatsapp} />)}</div>
        </section>
      ) : (
        <section id="offerings" className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="rounded-2xl border border-dashed border-[#d5ded6] bg-white/70 px-6 py-10 text-center"><h2 className="text-xl font-bold">Offerings coming soon</h2><p className="mt-2 text-sm text-[#718078]">Contact {business.name} to learn more.</p></div></section>
      )}

      {gallery.length ? (
        <section id="gallery" className="bg-white/65 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">A closer look</p><h2 className="mt-2 text-3xl font-extrabold">Gallery</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => <figure key={item.id} className="overflow-hidden rounded-2xl border border-[#e8e2d7] bg-white shadow-sm"><img src={item.image} alt={item.title} className="h-56 w-full bg-[#eeeae2] object-cover" loading="lazy" /><figcaption className="p-4 text-sm font-semibold">{item.title}</figcaption></figure>)}
            </div>
          </div>
        </section>
      ) : null}

      <footer id="contact" className="bg-[#10271d] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-7 sm:grid-cols-2">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d3bb78]">Get in touch</p><h2 className="mt-2 text-2xl font-bold">{business.name}</h2><p className="mt-2 text-sm text-white/65">{business.category}</p>{address ? <p className="mt-4 max-w-lg whitespace-pre-wrap text-sm leading-6 text-white/80">{address}</p> : null}{directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"><Navigation aria-hidden="true" size={17} />Get Directions</a> : null}{settings.working_hours ? <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{settings.working_hours}</p> : null}</div>
          <div className="flex flex-col gap-3 sm:items-end">
            {phone ? <a href={`tel:${phone}`} className="text-sm text-white/85">Call: {phone}</a> : null}
            {email ? <a href={`mailto:${email}`} className="text-sm text-white/85">{email}</a> : null}
            <div className="flex flex-wrap gap-3">{socialLinks.map((social) => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name} title={social.name} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:bg-white/10"><social.icon aria-hidden="true" size={19} /></a>)}</div>
          </div>
        </div>
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

function ProductCard({
  product,
  foodLayout,
  whatsapp,
}: {
  key?: string;
  product: BusinessWebsiteResponse['products'][number];
  foodLayout: boolean;
  whatsapp: string | null;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e7e5dc] bg-white shadow-[0_6px_20px_rgba(35,48,38,0.05)]">
      {product.image ? <img src={product.image} alt="" className="h-48 w-full bg-[#f0eee8] object-cover" loading="lazy" /> : <div className={`grid h-32 place-items-center ${foodLayout ? 'bg-[#f5e6d9]' : 'bg-[#e9f0eb]'}`}><span className="text-4xl font-light text-[#617568]/60">{product.name.slice(0, 1).toUpperCase()}</span></div>}
      <div className="p-5"><h3 className="text-lg font-bold">{product.name}</h3>{product.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#68746c]">{product.description}</p> : null}
        <div className="mt-5 flex items-center justify-between gap-3"><span className="font-bold text-[#183629]">{product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Ask for details'}</span>{whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I am interested in ${product.name}.`)}`} target="_blank" rel="noreferrer" className={`rounded-full px-3 py-2 text-xs font-bold ${foodLayout ? 'bg-[#a45e3e] text-white' : 'bg-[#eaf0eb] text-[#173629]'}`}>Enquire</a> : null}</div>
      </div>
    </article>
  );
}
