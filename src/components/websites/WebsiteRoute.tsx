import { lazy, Suspense, useEffect, useState } from 'react';
import { PublicWebsiteRenderer, type BusinessWebsiteResponse } from './PublicWebsiteRenderer';

const BusinessWebsitePage = lazy(() => import('../BusinessWebsitePage').then((module) => ({ default: module.BusinessWebsitePage })));
const showcaseSlugs = ['demo-modern', 'demo-bakery', 'demo-salon', 'demo-jewellery'];
const templatePreviews = {
  'modern-business': {
    name: 'Modern Business',
    businessName: 'Northline Studio',
    category: 'Business strategy & digital consulting',
    description: 'A clear, flexible storefront for professional services and local businesses.',
    image: '/demo-sites/modern/workspace.jpg',
    offerings: ['Business strategy session', 'Digital presence review', 'Growth support'],
    gallery: [
      { title: 'A thoughtful workspace', image: '/demo-sites/modern/workspace.jpg' },
      { title: 'Planning together', image: '/demo-sites/modern/meeting.jpg' },
      { title: 'A collaborative studio', image: '/demo-sites/modern/team.jpg' },
    ],
  },
  'food-bakery': {
    name: 'Food / Bakery',
    businessName: 'Aroma & Crumb',
    category: 'Bakery & cafe',
    description: 'A warm, photo-led storefront for fresh food, menus and local favourites.',
    image: '/demo-sites/bakery/hero.jpg',
    offerings: ['Celebration cakes', 'Fresh pastries', 'Seasonal treats'],
    gallery: [
      { title: 'Made fresh every day', image: '/demo-sites/bakery/bestseller-1.jpg' },
      { title: 'A customer favourite', image: '/demo-sites/bakery/bestseller-2.jpg' },
      { title: 'A little something sweet', image: '/demo-sites/bakery/bestseller-3.jpg' },
    ],
  },
  'salon-studio': {
    name: 'Salon & Wellness',
    businessName: 'Maison Gloss',
    category: 'Salon & wellness',
    description: 'A calm editorial storefront for appointment-led services and wellness studios.',
    image: '/demo-sites/salon/hero.jpg',
    offerings: ['Signature haircut', 'Colour & styling', 'Wellness treatment'],
    gallery: [
      { title: 'Our studio', image: '/demo-sites/salon/service-1.jpg' },
      { title: 'Made for your moment', image: '/demo-sites/salon/service-2.jpg' },
      { title: 'A little self-care', image: '/demo-sites/salon/service-3.jpg' },
    ],
  },
  'jewellery-boutique': {
    name: 'Jewellery Boutique',
    businessName: 'Silver Elara',
    category: 'Jewellery boutique',
    description: 'A cinematic, gallery-led storefront for distinctive collections and premium retail.',
    image: '/demo-sites/jewellery/hero.jpg',
    offerings: ['Everyday essentials', 'Statement pieces', 'Made to order'],
    gallery: [
      { title: 'The signature collection', image: '/demo-sites/jewellery/bestseller-1.jpg' },
      { title: 'A considered detail', image: '/demo-sites/jewellery/bestseller-2.jpg' },
      { title: 'Made to be treasured', image: '/demo-sites/jewellery/collection-3.jpg' },
    ],
  },
} as const;

const isTemplatePreviewSlug = (slug: string): slug is keyof typeof templatePreviews =>
  Object.prototype.hasOwnProperty.call(templatePreviews, slug);

const createTemplatePreview = (templateSlug: keyof typeof templatePreviews): BusinessWebsiteResponse => {
  const preview = templatePreviews[templateSlug];
  return {
    business: {
      name: preview.businessName,
      slug: `template-preview-${templateSlug}`,
      category: preview.category,
      logo: null,
      description: preview.description,
      phone: null,
      whatsapp: null,
      email: null,
      address: null,
      google_maps_url: null,
      instagram_url: null,
      facebook_url: null,
    },
    template: { name: preview.name, slug: templateSlug },
    settings: {},
    categories: [],
    products: preview.offerings.map((name, index) => ({
      id: `preview-product-${index}`,
      category_id: null,
      name,
      slug: `preview-product-${index}`,
      description: `A sample ${preview.category.toLowerCase()} offering. Add your own details in the business dashboard.`,
      price: null,
      image: preview.gallery[index].image,
      status: 'ACTIVE',
    })),
    gallery: preview.gallery.map((item, index) => ({
      id: `preview-gallery-${index}`,
      title: item.title,
      image: item.image,
      status: 'ACTIVE',
    })),
    seo: {
      title: `${preview.name} Template Preview`,
      description: preview.description,
      canonicalUrl: window.location.href,
      ogTitle: preview.name,
      ogDescription: preview.description,
    },
    subscription: { plan: null, amount: null, status: null },
  };
};

export function WebsiteRoute({ slug }: { slug: string }) {
  const [state, setState] = useState<'checking' | 'tenant' | 'showcase' | 'preview' | 'unavailable'>('checking');
  const [tenant, setTenant] = useState<BusinessWebsiteResponse | null>(null);
  const isShowcaseSlug = showcaseSlugs.includes(slug);
  const previewTemplateSlug = slug.startsWith('template-preview/') ? slug.slice('template-preview/'.length) : '';
  const previewData = isTemplatePreviewSlug(previewTemplateSlug)
    ? createTemplatePreview(previewTemplateSlug)
    : null;
  const isTemplatePreview = previewData !== null;

  useEffect(() => {
    setState('checking');
    setTenant(null);
    if (isShowcaseSlug) {
      setState('showcase');
      return;
    }
    if (isTemplatePreview) {
      setState('preview');
      return;
    }
    const controller = new AbortController();
    const resolveRoute = async () => {
      try {
        const response = await fetch(`/api/public/websites/${encodeURIComponent(slug)}`, { signal: controller.signal });
        if (response.ok) {
          const data = await response.json() as BusinessWebsiteResponse;
          if (!controller.signal.aborted) {
            setTenant(data);
            setState('tenant');
          }
          return;
        }

        if (!controller.signal.aborted) setState('unavailable');
      } catch {
        if (!controller.signal.aborted) setState('unavailable');
      }
    };
    void resolveRoute();
    return () => controller.abort();
  }, [isShowcaseSlug, isTemplatePreview, slug]);

  useEffect(() => {
    if (state === 'showcase' || state === 'preview') {
      document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex');
    } else if (state === 'tenant') {
      document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'index, follow');
    }
  }, [state]);

  if (state === 'showcase') {
    return <Suspense fallback={<div className="min-h-screen bg-white" />}><BusinessWebsitePage demoSlug={slug} /></Suspense>;
  }
  if (state === 'preview' && previewData) {
    return <PublicWebsiteRenderer slug={slug} initialData={previewData} />;
  }

  if (state === 'checking') {
    return <main className="grid min-h-screen place-items-center bg-[#f7f5f2] text-[#0E2B22]"><p role="status">Loading website…</p></main>;
  }
  if (state === 'tenant' && tenant) {
    return <PublicWebsiteRenderer slug={slug} initialData={tenant} />;
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5f2] px-4 text-[#0E2B22]">
      <div className="max-w-xl rounded-3xl border border-[#e6dfd1] bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">YBGP Websites</p>
        <h1 className="mt-3 text-3xl font-bold">Website unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-[#68746c]">This business website could not be found or is temporarily unavailable.</p>
        <a href="/websites" className="mt-5 inline-flex rounded-xl bg-[#0E2B22] px-4 py-3 text-sm font-semibold text-white">Explore YBGP Websites</a>
      </div>
    </main>
  );
}
