import { useCallback, useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { inferPrimaryAction, resolvePrimaryActionUrl } from '../../../server/business/cta';
import {
  isValidOptionalImageUrl,
  OG_DESCRIPTION_MAX_LENGTH,
  OG_TITLE_MAX_LENGTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from '../../../server/seo/shared';
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
  template_slug?: string | null;
  template_id?: string | null;
  plan: string | null;
  subscription_status: 'ACTIVE' | 'EXPIRED' | null;
  expiry_date: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
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
  const [counts, setCounts] = useState({ products: 0, categories: 0, gallery: 0, enquiries: 0, newEnquiries: 0 });
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
        apiRequest<{ enquiries: Array<{ status: string }> }>('/api/business/enquiries'),
      ]);
      setCounts({
        products: products.products.length,
        categories: categories.categories.length,
        gallery: gallery.gallery.length,
        enquiries: enquiries.enquiries.length,
        newEnquiries: enquiries.enquiries.filter((item) => item.status === 'NEW').length,
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

  const canDiscard = () => !hasUnsavedChanges || window.confirm('Discard your unsaved changes?');
  const confirmDiscard = () => {
    if (!canDiscard()) return false;
    setHasUnsavedChanges(false);
    return true;
  };

  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges && !window.confirm('Discard your unsaved changes?')) {
        window.history.pushState({}, '', section === 'overview' ? basePath : `${basePath}?section=${section}`);
        return;
      }
      setHasUnsavedChanges(false);
      const requested = new URLSearchParams(window.location.search).get('section');
      setSection(sections.some((item) => item.id === requested) ? requested as Section : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [basePath, hasUnsavedChanges, section]);

  const goTo = (next: Section) => {
    if (next === section) return;
    if (!confirmDiscard()) return;
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
  const content = section === 'profile' ? <BusinessProfileManager business={business} settings={settings} onSaved={load} onDirtyChange={setHasUnsavedChanges} />
    : section === 'products' ? <ProductsManager onDirtyChange={setHasUnsavedChanges} onNavigate={goTo} />
      : section === 'categories' ? <CategoriesManager onDirtyChange={setHasUnsavedChanges} />
        : section === 'gallery' ? <GalleryManager onDirtyChange={setHasUnsavedChanges} />
          : section === 'enquiries' ? <EnquiriesManager />
            : section === 'settings' ? <SettingsManager business={business} initialSettings={settings} onSaved={load} onDirtyChange={setHasUnsavedChanges} />
              : section === 'seo' ? <SeoManager business={business} publicUrl={publicUrl} initialSettings={settings} onSaved={load} onDirtyChange={setHasUnsavedChanges} />
                : <Overview business={business} publicUrl={publicUrl} counts={counts} settings={settings} onNavigate={goTo} />;

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-3 py-5 text-[#0E2B22] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <PageHeading
          eyebrow="YBGP Websites · Owner workspace"
          title={business.name}
          description={`Manage your ${business.category.toLowerCase()} website and keep your business information up to date.`}
          action={<div className="flex flex-wrap gap-2 sm:justify-end"><SignOutButton role="BUSINESS_OWNER" beforeSignOut={canDiscard} /><button type="button" onClick={() => goTo('profile')} className={secondaryButtonClassName}>Edit Website</button><a href={publicUrl} target="_blank" rel="noreferrer" className={buttonClassName}>View website ↗</a></div>}
        />

        <div className="grid gap-5 lg:grid-cols-[245px_minmax(0,1fr)]">
          <nav aria-label="Website management" className="rounded-2xl border border-[#e8e2d7] bg-white p-2 shadow-sm">
            <div className="px-3 pb-2 pt-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d7723]">Manage site</p></div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
              {sections.map((item) => (
                <button key={item.id} aria-current={section === item.id ? 'page' : undefined} onClick={() => goTo(item.id)} className={`rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E2B22] ${section === item.id ? 'bg-[#eaf0eb] text-[#0E2B22]' : 'text-[#58665e] hover:bg-[#f7f5f0]'}`}>
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
  onNavigate,
}: {
  business: BusinessSummary;
  publicUrl: string;
  counts: { products: number; categories: number; gallery: number; enquiries: number; newEnquiries: number };
  settings: Record<string, string>;
  onNavigate: (section: Section) => void;
}) {
  const [copied, setCopied] = useState(false);
  const publicHref = `${window.location.origin}${publicUrl}`;
  const primaryAction = inferPrimaryAction(settings, business);
  const hasContactAction = Boolean(resolvePrimaryActionUrl(primaryAction, business, settings.cta_url));
  const hasCustomSeo = Boolean(settings.seo_title || settings.seo_description || settings.og_title || settings.og_description || settings.og_image);
  const seoIsValid = (settings.seo_title ?? '').length <= SEO_TITLE_MAX_LENGTH &&
    (settings.seo_description ?? '').length <= SEO_DESCRIPTION_MAX_LENGTH &&
    (settings.og_title ?? '').length <= OG_TITLE_MAX_LENGTH &&
    (settings.og_description ?? '').length <= OG_DESCRIPTION_MAX_LENGTH &&
    isValidOptionalImageUrl(settings.og_image ?? '');
  const checklist: Array<{ id: Section; label: string; complete: boolean }> = [
    { id: 'profile', label: 'Complete business details', complete: Boolean(business.name && business.category && business.description && (business.phone || business.whatsapp || business.email)) },
    { id: 'products', label: 'Add products or services', complete: counts.products > 0 },
    { id: 'categories', label: 'Organize categories where applicable', complete: counts.products === 0 || counts.categories > 0 },
    { id: 'gallery', label: 'Add gallery images', complete: counts.gallery > 0 },
    { id: 'settings', label: 'Configure a contact action and hours', complete: hasContactAction && Boolean(settings.working_hours?.trim()) },
    { id: 'seo', label: 'Review search and social metadata', complete: hasCustomSeo && seoIsValid },
  ];
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicHref);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

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
        <MetricCard label="Enquiries" value={counts.enquiries} hint={`${counts.newEnquiries} new`} />
      </div>
      <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d7723]">Your public website</p><h2 className="mt-1 text-xl font-bold">{business.name}</h2><p className="mt-1 break-all text-sm text-[#657168]">{publicHref}</p></div>
          <button type="button" onClick={() => void copyLink()} className={secondaryButtonClassName} aria-label={copied ? 'Website link copied' : 'Copy website link'}>{copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}<span className="ml-2">{copied ? 'Copied' : 'Copy link'}</span></button>
        </div>
        <div className="mt-5 rounded-xl bg-[#f7f5f0] p-4 text-sm text-[#59675e]"><span className="font-semibold text-[#253d31]">Visibility: </span>{settings.website_visibility || (business.status === 'ACTIVE' ? 'public' : 'draft')}</div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Website setup</h2>
        <div className="divide-y divide-[#eee9df] rounded-2xl border border-[#e8e2d7] bg-white px-4">
          {checklist.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium"><span aria-hidden="true" className={item.complete ? 'text-emerald-700' : 'text-[#9a6a20]'}>{item.complete ? '✓' : '○'}</span>{item.label}</span>
              <button type="button" onClick={() => onNavigate(item.id)} className={`${secondaryButtonClassName} min-h-10 px-3 py-2`}>{item.complete ? 'Review' : 'Set up'}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
