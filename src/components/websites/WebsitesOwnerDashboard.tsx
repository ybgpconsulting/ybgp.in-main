import { useCallback, useEffect, useState } from 'react';
import {
  AccessPanel,
  apiRequest,
  buttonClassName,
  formatDate,
  MetricCard,
  Notice,
  PageHeading,
  secondaryButtonClassName,
  SignOutButton,
} from './shared';
import {
  BusinessProfileManager,
  CategoriesManager,
  EnquiriesManager,
  GalleryManager,
  ProductsManager,
  SeoManager,
  SettingsManager,
} from './WebsitesOwnerManagement';

interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  template_name: string | null;
  plan: string | null;
  subscription_status: 'ACTIVE' | 'EXPIRED' | null;
  expiry_date: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

interface OwnerSnapshot {
  business: BusinessSummary;
  settings: Record<string, string>;
  publicUrl: string;
}

type Section = 'overview' | 'profile' | 'products' | 'categories' | 'gallery' | 'enquiries' | 'settings' | 'seo';
const sections: Array<{ id: Section; label: string; detail: string }> = [
  { id: 'overview', label: 'Overview', detail: 'Website and account status' },
  { id: 'profile', label: 'Contact, Location & Social Links', detail: 'Address, contact and social links' },
  { id: 'products', label: 'Products / Services', detail: 'Your catalogue' },
  { id: 'categories', label: 'Categories', detail: 'Organize your catalogue' },
  { id: 'gallery', label: 'Gallery', detail: 'Images shown on your site' },
  { id: 'enquiries', label: 'Enquiries', detail: 'Customer messages' },
  { id: 'settings', label: 'Website settings', detail: 'CTA and business hours' },
  { id: 'seo', label: 'SEO', detail: 'Search and social previews' },
];

const effectiveSubscriptionStatus = (business: BusinessSummary) =>
  business.subscription_status === 'EXPIRED' ||
  Boolean(business.expiry_date && business.expiry_date.slice(0, 10) < new Date().toISOString().slice(0, 10))
    ? 'EXPIRED'
    : business.subscription_status || '—';

export function WebsitesOwnerDashboard() {
  const [snapshot, setSnapshot] = useState<OwnerSnapshot | null>(null);
  const [counts, setCounts] = useState({ products: 0, categories: 0, gallery: 0, enquiries: 0 });
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState('');
  const [section, setSection] = useState<Section>(() => {
    const requested = new URLSearchParams(window.location.search).get('section');
    return sections.some((item) => item.id === requested) ? requested as Section : 'overview';
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<OwnerSnapshot>('/api/business/me');
      setSnapshot(data);
      setNeedsLogin(false);
      const [products, categories, gallery, enquiries] = await Promise.all([
        apiRequest<{ products: unknown[] }>('/api/business/products'),
        apiRequest<{ categories: unknown[] }>('/api/business/categories'),
        apiRequest<{ gallery: unknown[] }>('/api/business/gallery'),
        apiRequest<{ enquiries: unknown[] }>('/api/business/enquiries'),
      ]);
      setCounts({
        products: products.products.length,
        categories: categories.categories.length,
        gallery: gallery.gallery.length,
        enquiries: enquiries.enquiries.length,
      });
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load your website';
      setNeedsLogin(message.includes('401') || message.toLowerCase().includes('authentication'));
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const basePath = typeof window !== 'undefined'
    ? window.location.pathname.replace(/\/+$/, '') || '/websites/dashboard'
    : '/websites/dashboard';

  useEffect(() => {
    const handlePopState = () => {
      const requested = new URLSearchParams(window.location.search).get('section');
      setSection(sections.some((item) => item.id === requested) ? requested as Section : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goTo = (next: Section) => {
    setSection(next);
    const url = next === 'overview' ? basePath : `${basePath}?section=${next}`;
    window.history.pushState({}, '', url);
    if (next === 'overview') void load();
  };

  if (loading && !snapshot) {
    return <main className="min-h-screen bg-[#f7f6f2] p-6 text-[#0E2B22]">Loading your website dashboard…</main>;
  }

  if (needsLogin) {
    return <main className="min-h-screen bg-[#f7f6f2] px-4 py-12"><AccessPanel role="BUSINESS_OWNER" onAuthenticated={() => void load()} /></main>;
  }

  if (!snapshot) {
    return (
      <main className="min-h-screen bg-[#f7f6f2] px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#e6dfd1] bg-white p-6">
          <h1 className="text-2xl font-bold text-[#0E2B22]">Your website dashboard</h1>
          <div className="mt-4"><Notice>{error || 'No business is linked to this account.'}</Notice></div>
          <div className="mt-5 flex flex-wrap gap-2"><SignOutButton role="BUSINESS_OWNER" /><a href="/websites" className={secondaryButtonClassName}>Back to YBGP Websites</a></div>
        </div>
      </main>
    );
  }

  const { business, settings, publicUrl } = snapshot;
  const content = section === 'profile' ? <BusinessProfileManager business={business} settings={settings} onSaved={load} />
    : section === 'products' ? <ProductsManager />
      : section === 'categories' ? <CategoriesManager />
        : section === 'gallery' ? <GalleryManager />
          : section === 'enquiries' ? <EnquiriesManager />
            : section === 'settings' ? <SettingsManager initialSettings={settings} onSaved={load} />
              : section === 'seo' ? <SeoManager initialSettings={settings} onSaved={load} />
                : <Overview business={business} publicUrl={publicUrl} counts={counts} settings={settings} />;

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-3 py-5 text-[#0E2B22] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <PageHeading
          eyebrow="YBGP Websites · Owner workspace"
          title={business.name}
          description={`Manage your ${business.category.toLowerCase()} website and keep your business information up to date.`}
          action={<div className="flex flex-wrap gap-2"><SignOutButton role="BUSINESS_OWNER" /><button type="button" onClick={() => goTo('profile')} className={secondaryButtonClassName}>Edit Website</button><a href={publicUrl} target="_blank" rel="noreferrer" className={buttonClassName}>View website ↗</a></div>}
        />

        <div className="grid gap-5 lg:grid-cols-[245px_minmax(0,1fr)]">
          <nav aria-label="Website management" className="rounded-2xl border border-[#e8e2d7] bg-white p-2 shadow-sm">
            <div className="px-3 pb-2 pt-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d7723]">Manage site</p></div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
              {sections.map((item) => (
                <button key={item.id} onClick={() => goTo(item.id)} className={`rounded-xl px-3 py-3 text-left transition ${section === item.id ? 'bg-[#eaf0eb] text-[#0E2B22]' : 'text-[#58665e] hover:bg-[#f7f5f0]'}`}>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-0.5 hidden text-xs text-[#7b867f] lg:block">{item.detail}</span>
                </button>
              ))}
            </div>
            <a href="/websites" className="mt-2 hidden rounded-xl px-3 py-3 text-sm font-semibold text-[#647168] hover:bg-[#f7f5f0] lg:block">← YBGP Websites</a>
          </nav>

          <section className="min-w-0">
            {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}
            {loading ? <div className="mb-4"><Notice kind="info">Refreshing dashboard data…</Notice></div> : null}
            {content}
          </section>
        </div>
      </div>
    </main>
  );
}

function Overview({
  business,
  publicUrl,
  counts,
  settings,
}: {
  business: BusinessSummary;
  publicUrl: string;
  counts: { products: number; categories: number; gallery: number; enquiries: number };
  settings: Record<string, string>;
}) {
  const links: Section[] = ['profile', 'products', 'categories', 'gallery', 'enquiries', 'settings', 'seo'];
  const basePath = typeof window !== 'undefined'
    ? window.location.pathname.replace(/\/+$/, '') || '/websites/dashboard'
    : '/websites/dashboard';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Website status" value={business.status === 'ACTIVE' ? 'Published' : 'Draft'} />
        <MetricCard label="Template" value={business.template_name || '—'} />
        <MetricCard label="Subscription" value={effectiveSubscriptionStatus(business)} hint={business.plan || 'YBGP Websites'} />
        <MetricCard label="Expiry" value={formatDate(business.expiry_date)} />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Products / Services" value={counts.products} />
        <MetricCard label="Categories" value={counts.categories} />
        <MetricCard label="Gallery images" value={counts.gallery} />
        <MetricCard label="Enquiries" value={counts.enquiries} />
      </div>
      <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d7723]">Your public website</p><h2 className="mt-1 text-xl font-bold">{business.name}</h2><p className="mt-1 break-all text-sm text-[#657168]">{window.location.origin}{publicUrl}</p></div>
          <a href={publicUrl} target="_blank" rel="noreferrer" className={buttonClassName}>Open website ↗</a>
        </div>
        <div className="mt-5 rounded-xl bg-[#f7f5f0] p-4 text-sm text-[#59675e]"><span className="font-semibold text-[#253d31]">Visibility: </span>{settings.website_visibility || (business.status === 'ACTIVE' ? 'public' : 'draft')}</div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {links.map((id) => {
            const item = sections.find((entry) => entry.id === id)!;
            return <a key={id} href={`${basePath}?section=${id}`} className="rounded-2xl border border-[#e8e2d7] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#758078]">{item.detail}</span></a>;
          })}
        </div>
      </section>
    </div>
  );
}
