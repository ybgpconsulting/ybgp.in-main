import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  AccessPanel,
  apiRequest,
  buttonClassName,
  Field,
  formatDate,
  MetricCard,
  Notice,
  PageHeading,
  secondaryButtonClassName,
  SelectField,
  SignOutButton,
  TextAreaField,
} from './shared';
import { getWebsiteTemplateDemoSlug, getWebsiteTemplateDesign, getWebsiteTemplatePreviewImage, inferTemplateSlugFromCategory } from './templateDesigns';
import { CategorySelectField } from './businessCategories';
import {
  isValidOptionalImageUrl,
  OG_DESCRIPTION_MAX_LENGTH,
  OG_TITLE_MAX_LENGTH,
  resolveTenantImageUrl,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from '../../../server/seo/shared';

interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  google_maps_url: string | null;
  city: string | null;
  pincode: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  google_business_url: string | null;
  other_social_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  pinterest_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  template_id?: string | null;
  template_name: string | null;
  template_slug?: string | null;
  plan: string | null;
  subscription_status: 'ACTIVE' | 'EXPIRED' | null;
  amount: string | null;
  start_date: string | null;
  expiry_date: string | null;
  owner_name: string | null;
  owner_email: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  enquiry_count: number | string;
}

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

type FormMode = 'create' | 'edit' | 'view' | 'subscription' | null;
type FormValues = Record<string, string>;

const today = () => new Date().toISOString().slice(0, 10);
const yearFromToday = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};
const emptyForm = (): FormValues => ({
  name: '',
  slug: '',
  category: '',
  description: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  google_maps_url: '',
  city: '',
  pincode: '',
  instagram_url: '',
  facebook_url: '',
  youtube_url: '',
  linkedin_url: '',
  google_business_url: '',
  other_social_url: '',
  tiktok_url: '',
  x_url: '',
  pinterest_url: '',
  seo_title: '',
  seo_description: '',
  og_title: '',
  og_description: '',
  og_image: '',
  template_slug: '',
  owner_name: '',
  owner_email: '',
  owner_phone: '',
  owner_password: '',
  plan: 'YBGP Websites',
  amount: '1999',
  start_date: today(),
  expiry_date: yearFromToday(),
  subscription_active: 'true',
  published: 'true',
});

const isExpired = (business: BusinessSummary) => {
  if (business.subscription_status === 'EXPIRED') return true;
  return Boolean(business.expiry_date && business.expiry_date.slice(0, 10) < today());
};

const isExpiringSoon = (business: BusinessSummary) => {
  if (!business.expiry_date || isExpired(business)) return false;
  const days = (new Date(business.expiry_date).getTime() - Date.now()) / 86_400_000;
  return days <= 30;
};

export function WebsitesAdminDashboard() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSummary | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const businessFormRequestId = useRef(0);
  const businessFormLoading = useRef(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [businessPayload, templatePayload] = await Promise.all([
        apiRequest<{ businesses: BusinessSummary[] }>('/api/admin/businesses'),
        apiRequest<{ templates: Template[] }>('/api/templates'),
      ]);
      if (!Array.isArray(businessPayload.businesses) || !Array.isArray(templatePayload.templates)) {
        throw new Error('The admin API returned incomplete data.');
      }
      setBusinesses(businessPayload.businesses);
      setTemplates(templatePayload.templates);
      setNeedsLogin(false);
      setLoadFailed(false);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load admin data';
      setNeedsLogin(message.includes('401') || message.toLowerCase().includes('authentication'));
      setLoadFailed(true);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateField = (key: string, value: string) => {
    setForm((previous) => {
      const next = { ...previous, [key]: value };
      if (key === 'category' && formMode === 'create' && value.trim()) {
        const suggested = inferTemplateSlugFromCategory(value);
        if (templates.some((t) => t.slug === suggested)) {
          next.template_slug = suggested;
        }
      }
      return next;
    });
  };
  const openCreate = () => {
    businessFormRequestId.current += 1;
    if (businessFormLoading.current) {
      businessFormLoading.current = false;
      setBusy(false);
    }
    setSelectedBusiness(null);
    setForm({
      ...emptyForm(),
      template_slug: templates.find((template) => template.slug === 'modern-business')?.slug
        ?? templates[0]?.slug
        ?? 'modern-business',
    });
    setNotice('');
    setError('');
    setFormMode('create');
  };
  const openBusinessForm = async (business: BusinessSummary, mode: Exclude<FormMode, 'create' | null>) => {
    const requestId = ++businessFormRequestId.current;
    setNotice('');
    setError('');
    setFormMode(null);
    businessFormLoading.current = true;
    setBusy(true);
    try {
      const payload = await apiRequest<{ business: BusinessSummary }>(`/api/admin/businesses/${business.id}`);
      if (requestId !== businessFormRequestId.current) return;
      const current = payload.business;
      setSelectedBusiness(current);
      setForm({
        ...emptyForm(),
        name: current.name,
        slug: current.slug,
        category: current.category,
        description: current.description ?? '',
        phone: current.phone ?? '',
        whatsapp: current.whatsapp ?? '',
        email: current.email ?? '',
        address: current.address ?? '',
        google_maps_url: current.google_maps_url ?? '',
        city: current.city ?? '',
        pincode: current.pincode ?? '',
        instagram_url: current.instagram_url ?? '',
        facebook_url: current.facebook_url ?? '',
        youtube_url: current.youtube_url ?? '',
        linkedin_url: current.linkedin_url ?? '',
        google_business_url: current.google_business_url ?? '',
        other_social_url: current.other_social_url ?? '',
        tiktok_url: current.tiktok_url ?? '',
        x_url: current.x_url ?? '',
        pinterest_url: current.pinterest_url ?? '',
        seo_title: current.seo_title ?? '',
        seo_description: current.seo_description ?? '',
        og_title: current.og_title ?? '',
        og_description: current.og_description ?? '',
        og_image: current.og_image ?? '',
        template_slug: current.template_slug
          ?? templates.find((t) => t.id === current.template_id)?.slug
          ?? inferTemplateSlugFromCategory(current.category)
          ?? 'modern-business',
        plan: current.plan ?? 'YBGP Websites',
        amount: current.amount ?? '1999',
        start_date: current.start_date?.slice(0, 10) ?? today(),
        expiry_date: current.expiry_date?.slice(0, 10) ?? yearFromToday(),
        subscription_active: current.subscription_status === 'EXPIRED' ? 'false' : 'true',
        published: current.status === 'ACTIVE' ? 'true' : 'false',
      });
      setFormMode(mode);
    } catch (loadError) {
      if (requestId === businessFormRequestId.current) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load business details');
      }
    } finally {
      if (requestId === businessFormRequestId.current) {
        businessFormLoading.current = false;
        setBusy(false);
      }
    }
  };
  const closeBusinessForm = () => {
    businessFormRequestId.current += 1;
    if (businessFormLoading.current) {
      businessFormLoading.current = false;
      setBusy(false);
    }
    setFormMode(null);
    setSelectedBusiness(null);
  };

  const createBusiness = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.category.trim() || !form.owner_name.trim() || !form.owner_email.trim()) {
      setError('Business name, category, owner name, and owner email are required.');
      return;
    }
    if (form.owner_password.length < 8) {
      setError('Owner temporary password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await apiRequest<{ publicUrl: string }>('/api/admin/businesses', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          slug: form.name.trim(),
          template_slug: form.template_slug,
          owner_name: form.owner_name.trim(),
          owner_email: form.owner_email.trim(),
          owner_password: form.owner_password,
          published: true,
        }),
      });
      setNotice(`Business created. Public website: ${window.location.origin}${result.publicUrl}`);
      setFormMode(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create business');
    } finally {
      setBusy(false);
    }
  };

  const saveBusiness = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBusiness) return;
    if (formMode === 'edit' && (
      form.seo_title.length > SEO_TITLE_MAX_LENGTH ||
      form.seo_description.length > SEO_DESCRIPTION_MAX_LENGTH ||
      form.og_title.length > OG_TITLE_MAX_LENGTH ||
      form.og_description.length > OG_DESCRIPTION_MAX_LENGTH
    )) {
      setError('Please correct the highlighted SEO field limits before saving.');
      return;
    }
    if (formMode === 'edit' && !isValidOptionalImageUrl(form.og_image.trim())) {
      setError('Open Graph image must be a valid http or https URL or an image path under /uploads.');
      return;
    }
    if (formMode === 'subscription' && form.expiry_date < form.start_date) {
      setError('Expiry date must be on or after the subscription start date.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const body = formMode === 'subscription'
        ? {
            plan: form.plan,
            amount: Number(form.amount),
            start_date: form.start_date,
            expiry_date: form.expiry_date,
            subscription_status: form.subscription_active === 'true' ? 'ACTIVE' : 'EXPIRED',
          }
        : {
            name: form.name,
            slug: form.slug,
            category: form.category,
            description: form.description,
            phone: form.phone,
            whatsapp: form.whatsapp,
            email: form.email,
            address: form.address,
            google_maps_url: form.google_maps_url,
            city: form.city,
            pincode: form.pincode,
            instagram_url: form.instagram_url,
            facebook_url: form.facebook_url,
            youtube_url: form.youtube_url,
            linkedin_url: form.linkedin_url,
            google_business_url: form.google_business_url,
            other_social_url: form.other_social_url,
            tiktok_url: form.tiktok_url,
            x_url: form.x_url,
            pinterest_url: form.pinterest_url,
            seo_title: form.seo_title,
            seo_description: form.seo_description,
            og_title: form.og_title,
            og_description: form.og_description,
            og_image: form.og_image,
            template_slug: form.template_slug,
            status: form.published === 'true' ? 'ACTIVE' : 'INACTIVE',
          };
      await apiRequest(`/api/admin/businesses/${selectedBusiness.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setFormMode(null);
      setNotice(`${formMode === 'subscription' ? 'Subscription' : 'Business'} updated.`);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save changes');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (business: BusinessSummary) => {
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/admin/businesses/${business.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: business.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
      });
      setNotice(`${business.name} ${business.status === 'ACTIVE' ? 'deactivated' : 'activated'}.`);
      await load();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Unable to update business status');
    }
  };

  const deleteBusiness = async (business: BusinessSummary) => {
    const confirmed = window.confirm(
      `Permanently delete ${business.name}? This removes its website, products, categories, gallery, enquiries, settings and subscription. This cannot be undone.`
    );
    if (!confirmed) return;

    setBusy(true);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/admin/businesses/${business.id}`, { method: 'DELETE' });
      setNotice(`${business.name} was deleted.`);
      closeBusinessForm();
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete business');
    } finally {
      setBusy(false);
    }
  };

  const active = businesses.filter((business) => business.status === 'ACTIVE' && !isExpired(business)).length;
  const expired = businesses.filter(isExpired).length;
  const drafts = businesses.filter((business) => business.status === 'INACTIVE').length;
  const enquiries = businesses.reduce((count, business) => count + Number(business.enquiry_count || 0), 0);
  const expiring = businesses.filter(isExpiringSoon).length;
  const selectedTemplate = templates.find((template) => template.slug === form.template_slug) ?? null;

  const renderTemplateSelector = (isEdit = false) => (
    <section className={isEdit ? "rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-xs" : ""}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold">{isEdit ? "Storefront layout & template" : "Choose storefront template"}</h3>
          <p className="mt-0.5 text-xs text-[#68746c]">
            {isEdit
              ? "Change the design, layout, and theme applied to this business website."
              : "Select the starting layout and style for this website."}
          </p>
        </div>
        {selectedTemplate ? (
          <a
            href={`/websites/${getWebsiteTemplateDemoSlug(selectedTemplate.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#0E2B22] underline decoration-[#c6b676] underline-offset-4 hover:text-[#8D7026]"
          >
            Preview {selectedTemplate.name} demo ↗
          </a>
        ) : null}
      </div>

      {templates.length === 0 ? (
        <p className="mt-2 text-sm text-[#68746c]">No active templates are available.</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {templates.map((template) => {
            const design = getWebsiteTemplateDesign(template.slug);
            const isSelected = form.template_slug === template.slug;
            const previewImage = getWebsiteTemplatePreviewImage(template.slug);
            return (
              <label
                key={template.id}
                className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition duration-200 ${
                  isSelected
                    ? 'border-[#0E2B22] bg-[#eff4f0] ring-2 ring-[#0E2B22]/15 shadow-sm'
                    : 'border-[#e2ddd2] bg-white hover:border-[#9aa89f] hover:shadow-sm'
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name={isEdit ? "edit-template" : "create-template"}
                  value={template.slug}
                  checked={isSelected}
                  onChange={() => updateField('template_slug', template.slug)}
                />
                <div className="relative h-24 w-full overflow-hidden bg-[#e5eee7]">
                  <img
                    src={previewImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span
                    className={`absolute bottom-2 left-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      design === 'food'
                        ? 'bg-[#f4e2d3] text-[#603b2c]'
                        : design === 'salon'
                        ? 'bg-[#f0e5df] text-[#8f5c54]'
                        : design === 'jewellery'
                        ? 'bg-[#c5a77e] text-[#211a13]'
                        : 'bg-white text-[#173629]'
                    }`}
                  >
                    {design === 'food'
                      ? 'Food & Bakery'
                      : design === 'salon'
                      ? 'Salon & Wellness'
                      : design === 'jewellery'
                      ? 'Jewellery Boutique'
                      : 'Modern Business'}
                  </span>
                  {isSelected ? (
                    <span className="absolute right-2 top-2 rounded-full bg-[#0E2B22] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      ✓ Selected
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <strong className="block text-sm font-bold text-[#173328]">{template.name}</strong>
                  <span className="mt-0.5 block line-clamp-1 text-xs text-[#68746c]">
                    {template.description || 'A clean, responsive business storefront.'}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-7 text-[#0E2B22] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <PageHeading
          eyebrow="YBGP Websites · Operations"
          title="Admin dashboard"
          description="Manage business websites, owners, publishing and subscriptions from one workspace."
          action={<div className="flex flex-wrap gap-2">{!isLoading && !needsLogin && !loadFailed ? <><button className={secondaryButtonClassName} onClick={() => setShowCredentialForm(true)}>Change login</button><SignOutButton role="SUPER_ADMIN" /></> : null}<a href="/websites" className={secondaryButtonClassName}>Product page</a><button className={buttonClassName} onClick={openCreate} disabled={isLoading || needsLogin || loadFailed}>＋ Create business</button></div>}
        />

        {notice ? <div className="mb-5"><Notice kind="success">{notice}</Notice></div> : null}
        {error && !needsLogin ? <div className="mb-5"><Notice>{error}</Notice></div> : null}

        {needsLogin ? (
          <AccessPanel role="SUPER_ADMIN" onAuthenticated={() => { setNeedsLogin(false); void load(); }} />
        ) : loadFailed ? (
          <section className="rounded-2xl border border-[#e8e2d7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Admin data is unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-[#68746c]">The dashboard could not load its API data. Check that the Node.js application and database are available, then retry.</p>
            <button className={`${secondaryButtonClassName} mt-4`} onClick={() => void load()} disabled={isLoading}>{isLoading ? 'Retrying…' : 'Retry'}</button>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <MetricCard label="Total businesses" value={businesses.length} />
              <MetricCard label="Active" value={active} />
              <MetricCard label="Expired" value={expired} />
              <MetricCard label="Draft" value={drafts} />
              <MetricCard label="Enquiries" value={enquiries} />
              <MetricCard label="Expiring soon" value={expiring} hint="Within the next 30 days" />
            </section>

            <section className="mt-7 overflow-hidden rounded-2xl border border-[#e8e2d7] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#eee9df] px-5 py-4">
                <div><h2 className="font-bold">Businesses</h2><p className="mt-0.5 text-xs text-[#78827b]">Tenant websites and subscription status</p></div>
                <button className={secondaryButtonClassName} onClick={() => void load()} disabled={isLoading}>{isLoading ? 'Refreshing…' : 'Refresh'}</button>
              </div>
              {isLoading ? <p className="p-6 text-sm text-[#68746c]">Loading businesses…</p> : businesses.length === 0 ? (
                <div className="p-8 text-center"><h3 className="font-semibold">No businesses yet</h3><p className="mt-1 text-sm text-[#68746c]">Create the first tenant website to get started.</p><button className={`${buttonClassName} mt-4`} onClick={openCreate}>Create business</button></div>
              ) : (
                <>
                  <div className="space-y-3 p-3 md:hidden">
                    {businesses.map((business) => <BusinessCard key={business.id} business={business} onView={() => openBusinessForm(business, 'view')} onEdit={() => openBusinessForm(business, 'edit')} onSubscription={() => openBusinessForm(business, 'subscription')} onToggle={() => void toggleStatus(business)} />)}
                  </div>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-[1000px] w-full text-left text-sm">
                      <thead className="bg-[#faf9f6] text-xs uppercase tracking-wide text-[#6f7c73]">
                        <tr>{['Business', 'Owner', 'Template', 'Status', 'Subscription', 'Expiry', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr>
                      </thead>
                      <tbody>
                        {businesses.map((business) => (
                          <tr key={business.id} className="border-t border-[#f0ece4] align-middle">
                            <td className="px-4 py-4"><p className="font-semibold">{business.name}</p><p className="mt-0.5 text-xs text-[#758078]">/{business.slug} · {business.category}</p></td>
                            <td className="px-4 py-4"><p>{business.owner_name || 'Pending'}</p><p className="text-xs text-[#758078]">{business.owner_email || '—'}</p></td>
                            <td className="px-4 py-4">{business.template_name || '—'}</td>
                            <td className="px-4 py-4"><StatusBadge value={business.status === 'INACTIVE' ? 'DRAFT' : isExpired(business) ? 'EXPIRED' : 'ACTIVE'} /></td>
                            <td className="px-4 py-4">{business.plan || '—'}<p className="text-xs text-[#758078]">{business.subscription_status || 'No subscription'}</p></td>
                            <td className="px-4 py-4">{formatDate(business.expiry_date)}</td>
                            <td className="px-4 py-4"><BusinessActions business={business} onView={() => openBusinessForm(business, 'view')} onEdit={() => openBusinessForm(business, 'edit')} onSubscription={() => openBusinessForm(business, 'subscription')} onToggle={() => void toggleStatus(business)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>

      {formMode ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#12221b]/55 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeBusinessForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="business-modal-title" className="mx-auto my-3 max-w-3xl rounded-2xl bg-[#fbfaf7] shadow-2xl sm:my-8">
            <div className="flex items-start justify-between border-b border-[#e8e2d7] px-5 py-4 sm:px-7">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">{formMode === 'create' ? 'New tenant' : formMode === 'subscription' ? 'Billing' : formMode === 'view' ? 'Business overview' : 'Business details'}</p><h2 id="business-modal-title" className="mt-1 text-2xl font-bold">{formMode === 'create' ? 'Create business' : formMode === 'subscription' ? 'Manage subscription' : formMode === 'view' ? 'Business details' : 'Edit business'}</h2></div>
              <button className="rounded-full px-3 py-2 text-lg text-[#68746c] hover:bg-[#eeeae1]" onClick={closeBusinessForm} aria-label="Close">×</button>
            </div>
            <form onSubmit={formMode === 'create' ? createBusiness : saveBusiness} className="max-h-[calc(100vh-130px)] space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              {formMode === 'view' ? (
                <section className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Business', selectedBusiness?.name],
                    ['Public URL', `${window.location.origin}/websites/${selectedBusiness?.slug ?? ''}`],
                    ['Category', selectedBusiness?.category],
                    ['Owner', selectedBusiness?.owner_name || 'Pending'],
                    ['Owner email', selectedBusiness?.owner_email || '—'],
                    ['Template', selectedBusiness?.template_name || '—'],
                    ['Status', selectedBusiness?.status || '—'],
                    ['Subscription', selectedBusiness?.plan || '—'],
                    ['Annual price', selectedBusiness?.amount ? `₹${Number(selectedBusiness.amount).toLocaleString('en-IN')}` : '—'],
                    ['Expiry', formatDate(selectedBusiness?.expiry_date)],
                    ['Enquiries', String(selectedBusiness?.enquiry_count ?? 0)],
                    ['Phone', selectedBusiness?.phone || '—'],
                    ['Email', selectedBusiness?.email || '—'],
                    ['Meta title', selectedBusiness?.seo_title || 'Automatic default'],
                    ['Meta description', selectedBusiness?.seo_description || 'Automatic default'],
                    ['Open Graph title', selectedBusiness?.og_title || 'Automatic default'],
                    ['Open Graph description', selectedBusiness?.og_description || 'Automatic default'],
                    ['Open Graph image', selectedBusiness?.og_image || 'Automatic default'],
                  ].map(([label, value]) => <div key={label} className="rounded-xl border border-[#e8e2d7] bg-white p-4"><p className="text-xs font-semibold text-[#718078]">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>)}
                </section>
              ) : formMode === 'create' ? (
                <>
                  <div className="rounded-2xl border border-[#0E2B22]/15 bg-[#f4f7f5] p-4 text-xs leading-relaxed text-[#213f32]">
                    <div className="flex items-start gap-2.5">
                      <span className="text-base leading-none">✨</span>
                      <div>
                        <p className="font-bold text-[#0E2B22]">Quick Onboarding</p>
                        <p className="mt-0.5 text-[#43594e]">
                          Only essential details are required to launch this business website. Full profile details, operating hours, catalogue, gallery, social media links, SEO tags, and subscription settings can be managed anytime from the dashboard.
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormSection title="Business details">
                    <Field
                      label="Business name"
                      value={form.name}
                      onChange={(value) => updateField('name', value)}
                      placeholder="e.g. Copper Chimney or Artisanal Studio"
                      required
                    />
                    <div className="sm:col-span-2">
                      <CategorySelectField
                        label="Category"
                        value={form.category}
                        onChange={(value) => updateField('category', value)}
                        onTemplateSuggest={(templateSlug) => updateField('template_slug', templateSlug)}
                        required
                      />
                    </div>
                  </FormSection>

                  {renderTemplateSelector(false)}

                  <FormSection title="Owner login credentials">
                    <Field
                      label="Owner name"
                      value={form.owner_name}
                      onChange={(value) => updateField('owner_name', value)}
                      placeholder="e.g. Ramesh Patel"
                      required
                      autoComplete="name"
                    />
                    <Field
                      label="Owner email"
                      value={form.owner_email}
                      onChange={(value) => updateField('owner_email', value)}
                      type="email"
                      placeholder="owner@example.com"
                      required
                      autoComplete="email"
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Temporary password"
                        value={form.owner_password}
                        onChange={(value) => updateField('owner_password', value)}
                        type="password"
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <p className="mt-1 text-xs text-[#758078]">
                        The owner will use this email and password to log into their website dashboard.
                      </p>
                    </div>
                  </FormSection>
                </>
              ) : formMode === 'subscription' ? (
                <FormSection title={`${selectedBusiness?.name ?? 'Business'} · annual subscription`}>
                  <Field label="Plan" value={form.plan} onChange={(value) => updateField('plan', value)} required />
                  <Field label="Amount (₹)" value={form.amount} onChange={(value) => updateField('amount', value)} type="number" min="0" step="1" required />
                  <Field label="Start date" value={form.start_date} onChange={(value) => updateField('start_date', value)} type="date" required />
                  <Field label="Expiry date" value={form.expiry_date} onChange={(value) => updateField('expiry_date', value)} type="date" required />
                  <SelectField label="Subscription status" value={form.subscription_active} onChange={(value) => updateField('subscription_active', value)} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Expired / inactive' }]} />
                </FormSection>
              ) : (
                <>
                  <FormSection title="Business profile">
                    <Field label="Business name" value={form.name} onChange={(value) => updateField('name', value)} required />
                    <Field label="Website slug" value={form.slug} onChange={(value) => updateField('slug', value)} required />
                    <div className="sm:col-span-2">
                      <CategorySelectField
                        label="Category"
                        value={form.category}
                        onChange={(value) => updateField('category', value)}
                        onTemplateSuggest={(templateSlug) => {
                          if (!form.template_slug || form.template_slug === 'modern-business') {
                            updateField('template_slug', templateSlug);
                          }
                        }}
                        required
                      />
                    </div>
                    <TextAreaField label="Description" value={form.description} onChange={(value) => updateField('description', value)} />
                    <Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} type="tel" />
                    <Field label="WhatsApp" value={form.whatsapp} onChange={(value) => updateField('whatsapp', value)} type="tel" />
                    <Field label="Email" value={form.email} onChange={(value) => updateField('email', value)} type="email" />
                    <Field label="City" value={form.city} onChange={(value) => updateField('city', value)} />
                    <Field label="Pincode" value={form.pincode} onChange={(value) => updateField('pincode', value)} inputMode="numeric" />
                    <Field label="Google Maps URL" value={form.google_maps_url} onChange={(value) => updateField('google_maps_url', value)} type="url" />
                    <SelectField label="Publishing" value={form.published} onChange={(value) => updateField('published', value)} options={[{ value: 'true', label: 'Published' }, { value: 'false', label: 'Draft' }]} />
                  </FormSection>
                  {formMode === 'edit' ? renderTemplateSelector(true) : null}
                  {formMode === 'edit' ? (
                    <FormSection title="Contact, Location & Social Links">
                      <Field label="Instagram URL" value={form.instagram_url} onChange={(value) => updateField('instagram_url', value)} type="url" />
                      <Field label="Facebook URL" value={form.facebook_url} onChange={(value) => updateField('facebook_url', value)} type="url" />
                      <Field label="YouTube URL" value={form.youtube_url} onChange={(value) => updateField('youtube_url', value)} type="url" />
                      <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(value) => updateField('linkedin_url', value)} type="url" />
                      <Field label="Google Business URL" value={form.google_business_url} onChange={(value) => updateField('google_business_url', value)} type="url" />
                      <Field label="Other social link" value={form.other_social_url} onChange={(value) => updateField('other_social_url', value)} type="url" />
                      <Field label="TikTok URL" value={form.tiktok_url} onChange={(value) => updateField('tiktok_url', value)} type="url" />
                      <Field label="X URL" value={form.x_url} onChange={(value) => updateField('x_url', value)} type="url" />
                      <Field label="Pinterest URL" value={form.pinterest_url} onChange={(value) => updateField('pinterest_url', value)} type="url" />
                    </FormSection>
                  ) : null}
                  {formMode === 'edit' ? (
                    <SeoSettingsSection
                      form={form}
                      onChange={updateField}
                      businessName={form.name}
                      slug={form.slug}
                      category={form.category}
                      description={form.description}
                    />
                  ) : null}
                  {formMode === 'edit' && selectedBusiness ? (
                    <DangerZoneSection
                      businessName={selectedBusiness.name}
                      onDelete={() => void deleteBusiness(selectedBusiness)}
                      busy={busy}
                    />
                  ) : null}
                </>
              )}
              {error ? <Notice>{error}</Notice> : null}
              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#e8e2d7] bg-[#fbfaf7] pt-4 sm:flex-row sm:justify-end">
                <button className={secondaryButtonClassName} type="button" onClick={closeBusinessForm}>
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode === 'view' && selectedBusiness ? (
                  <button
                    className={buttonClassName}
                    type="button"
                    onClick={() => setFormMode('edit')}
                  >
                    Edit business
                  </button>
                ) : null}
                {formMode !== 'view' ? (
                  <button
                    className={buttonClassName}
                    type="submit"
                    disabled={busy || (formMode === 'create' && templates.length === 0)}
                  >
                    {busy ? 'Saving…' : formMode === 'create' ? 'Create website' : 'Save changes'}
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </div>
      ) : null}
      {showCredentialForm ? <AdminCredentialForm onClose={() => setShowCredentialForm(false)} /> : null}
    </main>
  );
}

function AdminCredentialForm({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const updateCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiRequest('/api/auth/credentials', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_email: newEmail,
          new_password: newPassword,
        }),
      });
      window.location.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update admin credentials');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#12221b]/55 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="credential-dialog-title" className="mx-auto my-8 max-w-lg rounded-2xl bg-[#fbfaf7] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#e8e2d7] px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">Admin account</p>
            <h2 id="credential-dialog-title" className="mt-1 text-2xl font-bold">Change login credentials</h2>
          </div>
          <button className="rounded-full px-3 py-2 text-lg text-[#68746c] hover:bg-[#eeeae1]" onClick={onClose} disabled={busy} aria-label="Close">×</button>
        </div>
        <form onSubmit={updateCredentials} className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-[#68746c]">Changing credentials signs out all active sessions. You will need to sign in again.</p>
          <Field label="Current password" value={currentPassword} onChange={setCurrentPassword} type="password" required maxLength={1024} autoComplete="current-password" />
          <Field label="New admin email" value={newEmail} onChange={setNewEmail} type="email" required maxLength={254} autoComplete="email" />
          <Field label="New password (at least 12 characters)" value={newPassword} onChange={setNewPassword} type="password" required minLength={12} maxLength={1024} autoComplete="new-password" />
          <Field label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} type="password" required minLength={12} maxLength={1024} autoComplete="new-password" />
          {error ? <Notice>{error}</Notice> : null}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" className={secondaryButtonClassName} onClick={onClose} disabled={busy}>Cancel</button>
            <button className={buttonClassName} disabled={busy}>{busy ? 'Updating…' : 'Update credentials'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h3 className="mb-3 font-bold">{title}</h3><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>;
}

function SeoSettingsSection({
  form,
  onChange,
  businessName,
  slug,
  category,
  description,
}: {
  form: FormValues;
  onChange: (key: string, value: string) => void;
  businessName: string;
  slug: string;
  category: string;
  description: string;
}) {
  const defaultTitle = `${businessName || 'Business'}${category ? ` | ${category}` : ''}`;
  const defaultDescription = description.trim() || `Visit ${businessName || 'this business'} for ${category.toLowerCase() || 'business'} offerings and contact information.`;
  const previewTitle = form.og_title.trim() || form.seo_title.trim() || defaultTitle;
  const previewDescription = form.og_description.trim() || form.seo_description.trim() || defaultDescription;
  const image = form.og_image.trim();
  const imageError = !isValidOptionalImageUrl(image)
    ? 'Use an HTTP(S) image URL or an image path under /uploads (for example, /uploads/businesses/example/share.jpg).'
    : '';
  const previewSlug = (slug.trim() || businessName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180) || 'business';
  const titleError = form.seo_title.length > SEO_TITLE_MAX_LENGTH
    ? `Meta title must be at most ${SEO_TITLE_MAX_LENGTH} characters.`
    : '';
  const seoDescriptionError = form.seo_description.length > SEO_DESCRIPTION_MAX_LENGTH
    ? `Meta description must be at most ${SEO_DESCRIPTION_MAX_LENGTH} characters.`
    : '';
  const ogTitleError = form.og_title.length > OG_TITLE_MAX_LENGTH
    ? `Open Graph title must be at most ${OG_TITLE_MAX_LENGTH} characters.`
    : '';
  const ogDescriptionError = form.og_description.length > OG_DESCRIPTION_MAX_LENGTH
    ? `Open Graph description must be at most ${OG_DESCRIPTION_MAX_LENGTH} characters.`
    : '';
  let imagePreview = '/og-image.svg';
  if (typeof window !== 'undefined') {
    try {
      const canonicalUrl = new URL(`/websites/${previewSlug}/`, window.location.origin).href;
      imagePreview = resolveTenantImageUrl(image, canonicalUrl, '/og-image.svg');
    } catch {
      imagePreview = '/og-image.svg';
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-[#e8e2d7] bg-white p-4">
      <div>
        <h3 className="font-bold">SEO &amp; Social Preview</h3>
        <p className="mt-1 text-sm text-[#68746c]">Leave fields empty to use automatic defaults based on this business.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Field label="Meta title" value={form.seo_title} onChange={(value) => onChange('seo_title', value)} maxLength={SEO_TITLE_MAX_LENGTH} />
          <p className={`mt-1 text-xs ${titleError ? 'text-red-700' : 'text-[#818b84]'}`} role={titleError ? 'alert' : undefined}>
            {titleError || `${form.seo_title.length}/${SEO_TITLE_MAX_LENGTH} characters`}
          </p>
        </div>
        <div>
          <Field label="Open Graph title" value={form.og_title} onChange={(value) => onChange('og_title', value)} maxLength={OG_TITLE_MAX_LENGTH} />
          <p className={`mt-1 text-xs ${ogTitleError ? 'text-red-700' : 'text-[#818b84]'}`} role={ogTitleError ? 'alert' : undefined}>
            {ogTitleError || `${form.og_title.length}/${OG_TITLE_MAX_LENGTH} characters`}
          </p>
        </div>
        <div>
          <TextAreaField label="Meta description" value={form.seo_description} onChange={(value) => onChange('seo_description', value)} rows={3} maxLength={SEO_DESCRIPTION_MAX_LENGTH} />
          <p className={`mt-1 text-xs ${seoDescriptionError ? 'text-red-700' : 'text-[#818b84]'}`} role={seoDescriptionError ? 'alert' : undefined}>
            {seoDescriptionError || `${form.seo_description.length}/${SEO_DESCRIPTION_MAX_LENGTH} characters`}
          </p>
        </div>
        <div>
          <TextAreaField label="Open Graph description" value={form.og_description} onChange={(value) => onChange('og_description', value)} rows={3} maxLength={OG_DESCRIPTION_MAX_LENGTH} />
          <p className={`mt-1 text-xs ${ogDescriptionError ? 'text-red-700' : 'text-[#818b84]'}`} role={ogDescriptionError ? 'alert' : undefined}>
            {ogDescriptionError || `${form.og_description.length}/${OG_DESCRIPTION_MAX_LENGTH} characters`}
          </p>
        </div>
        <div>
          <Field label="Open Graph image URL or path" value={form.og_image} onChange={(value) => onChange('og_image', value)} />
          <p className={`mt-1 text-xs ${imageError ? 'text-red-700' : 'text-[#818b84]'}`} role={imageError ? 'alert' : undefined}>
            {imageError || `${form.og_image.length} characters`}
          </p>
        </div>
      </div>
      <div className="max-w-lg overflow-hidden rounded-xl border border-[#ded9cd] bg-[#f7f6f2]">
        <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-[#78827b]">Illustrative social-sharing preview</p>
        <img src={imagePreview} alt="" className="mt-2 aspect-[1.91/1] w-full bg-[#e9e5db] object-cover" />
        <div className="p-3">
          <p className="truncate text-xs uppercase text-[#78827b]">{typeof window === 'undefined' ? 'your-website' : window.location.host}</p>
          <p className="mt-1 line-clamp-2 font-semibold text-[#173328]">{previewTitle}</p>
          <p className="mt-1 line-clamp-2 text-sm text-[#68746c]">{previewDescription}</p>
        </div>
      </div>
      <p className="text-xs text-[#78827b]">Search engines may rewrite snippets; metadata does not guarantee rankings or indexing.</p>
    </section>
  );
}

function DangerZoneSection({
  businessName,
  onDelete,
  busy,
}: {
  businessName: string;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50/50 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-red-950">Danger zone</h3>
          <p className="mt-1 text-sm leading-6 text-red-800">
            Permanently delete <strong className="font-semibold text-red-950">{businessName}</strong>? This removes its website, products, categories, gallery, enquiries, settings and subscription. This cannot be undone.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onDelete}
          disabled={busy}
        >
          {busy ? 'Deleting…' : 'Delete business'}
        </button>
      </div>
    </section>
  );
}

function StatusBadge({ value }: { value: string }) {
  const className = value === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : value === 'EXPIRED' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{value}</span>;
}

function BusinessCard({
  business,
  onView,
  onEdit,
  onSubscription,
  onToggle,
}: {
  key?: string;
  business: BusinessSummary;
  onView: () => void;
  onEdit: () => void;
  onSubscription: () => void;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-2xl border border-[#e8e2d7] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{business.name}</h3><p className="text-xs text-[#758078]">/{business.slug}</p></div><StatusBadge value={business.status === 'INACTIVE' ? 'DRAFT' : isExpired(business) ? 'EXPIRED' : 'ACTIVE'} /></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-[#758078]">Owner</p><p className="mt-0.5 font-medium">{business.owner_name || 'Pending'}</p></div>
        <div><p className="text-xs text-[#758078]">Template</p><p className="mt-0.5 font-medium">{business.template_name || '—'}</p></div>
        <div><p className="text-xs text-[#758078]">Subscription</p><p className="mt-0.5 font-medium">{business.plan || '—'}</p></div>
        <div><p className="text-xs text-[#758078]">Expiry</p><p className="mt-0.5 font-medium">{formatDate(business.expiry_date)}</p></div>
      </div>
      <BusinessActions business={business} onView={onView} onEdit={onEdit} onSubscription={onSubscription} onToggle={onToggle} />
    </article>
  );
}

function BusinessActions({
  business,
  onView,
  onEdit,
  onSubscription,
  onToggle,
}: {
  key?: string;
  business: BusinessSummary;
  onView: () => void;
  onEdit: () => void;
  onSubscription: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button className={secondaryButtonClassName} onClick={onView}>View</button>
      <button className={secondaryButtonClassName} onClick={onEdit}>Edit</button>
      <button className={secondaryButtonClassName} onClick={onSubscription}>Subscription</button>
      <button className={secondaryButtonClassName} onClick={onToggle}>{business.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
      <a className={secondaryButtonClassName} href={`/websites/${business.slug}`} target="_blank" rel="noreferrer">Open website ↗</a>
    </div>
  );
}
