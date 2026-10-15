import { useCallback, useEffect, useState } from 'react';
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
  template_name: string | null;
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
  return Boolean(business.expiry_date && new Date(business.expiry_date).getTime() < Date.now());
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

  const updateField = (key: string, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  const openCreate = () => {
    setSelectedBusiness(null);
    setForm(emptyForm());
    setNotice('');
    setError('');
    setFormMode('create');
  };
  const openBusinessForm = (business: BusinessSummary, mode: Exclude<FormMode, 'create' | null>) => {
    setSelectedBusiness(business);
    setNotice('');
    setError('');
    setForm({
      ...emptyForm(),
      name: business.name,
      slug: business.slug,
      category: business.category,
      description: business.description ?? '',
      phone: business.phone ?? '',
      whatsapp: business.whatsapp ?? '',
      email: business.email ?? '',
      address: business.address ?? '',
      google_maps_url: business.google_maps_url ?? '',
      city: business.city ?? '',
      pincode: business.pincode ?? '',
      instagram_url: business.instagram_url ?? '',
      facebook_url: business.facebook_url ?? '',
      youtube_url: business.youtube_url ?? '',
      linkedin_url: business.linkedin_url ?? '',
      google_business_url: business.google_business_url ?? '',
      other_social_url: business.other_social_url ?? '',
      plan: business.plan ?? 'YBGP Websites',
      amount: business.amount ?? '1999',
      start_date: business.start_date?.slice(0, 10) ?? today(),
      expiry_date: business.expiry_date?.slice(0, 10) ?? yearFromToday(),
      subscription_active: business.subscription_status === 'EXPIRED' ? 'false' : 'true',
      published: business.status === 'ACTIVE' ? 'true' : 'false',
    });
    setFormMode(mode);
  };

  const createBusiness = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.expiry_date < form.start_date) {
      setError('Expiry date must be on or after the subscription start date.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await apiRequest<{ publicUrl: string }>('/api/admin/businesses', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          slug: form.slug || form.name,
          amount: Number(form.amount),
          subscription_active: form.subscription_active === 'true',
          published: form.published === 'true',
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

  const active = businesses.filter((business) => business.status === 'ACTIVE' && !isExpired(business)).length;
  const expired = businesses.filter(isExpired).length;
  const drafts = businesses.filter((business) => business.status === 'INACTIVE').length;
  const enquiries = businesses.reduce((count, business) => count + Number(business.enquiry_count || 0), 0);
  const expiring = businesses.filter(isExpiringSoon).length;

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-7 text-[#0E2B22] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <PageHeading
          eyebrow="YBGP Websites · Operations"
          title="Admin dashboard"
          description="Manage business websites, owners, publishing and subscriptions from one workspace."
          action={<div className="flex flex-wrap gap-2">{!isLoading && !needsLogin && !loadFailed ? <SignOutButton /> : null}<a href="/websites" className={secondaryButtonClassName}>Product page</a><button className={buttonClassName} onClick={openCreate} disabled={isLoading || needsLogin || loadFailed}>＋ Create business</button></div>}
        />

        {notice ? <div className="mb-5"><Notice kind="success">{notice}</Notice></div> : null}
        {error && !needsLogin ? <div className="mb-5"><Notice>{error}</Notice></div> : null}

        {needsLogin ? (
          <AccessPanel onAuthenticated={() => { setNeedsLogin(false); void load(); }} />
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#12221b]/55 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormMode(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="business-modal-title" className="mx-auto my-3 max-w-3xl rounded-2xl bg-[#fbfaf7] shadow-2xl sm:my-8">
            <div className="flex items-start justify-between border-b border-[#e8e2d7] px-5 py-4 sm:px-7">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">{formMode === 'create' ? 'New tenant' : formMode === 'subscription' ? 'Billing' : 'Business details'}</p><h2 id="business-modal-title" className="mt-1 text-2xl font-bold">{formMode === 'create' ? 'Create business' : formMode === 'subscription' ? 'Manage subscription' : 'Edit business'}</h2></div>
              <button className="rounded-full px-3 py-2 text-lg text-[#68746c] hover:bg-[#eeeae1]" onClick={() => setFormMode(null)} aria-label="Close">×</button>
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
                  ].map(([label, value]) => <div key={label} className="rounded-xl border border-[#e8e2d7] bg-white p-4"><p className="text-xs font-semibold text-[#718078]">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>)}
                </section>
              ) : formMode === 'create' ? (
                <>
                  <FormSection title="Business">
                    <Field label="Business name" value={form.name} onChange={(value) => updateField('name', value)} required />
                    <Field label="Website slug" value={form.slug} onChange={(value) => updateField('slug', value)} placeholder="Auto-generated if left blank" />
                    <Field label="Category" value={form.category} onChange={(value) => updateField('category', value)} required />
                    <TextAreaField label="Description" value={form.description} onChange={(value) => updateField('description', value)} />
                    <Field label="Business phone" value={form.phone} onChange={(value) => updateField('phone', value)} type="tel" />
                    <Field label="WhatsApp number" value={form.whatsapp} onChange={(value) => updateField('whatsapp', value)} type="tel" />
                    <Field label="Business email" value={form.email} onChange={(value) => updateField('email', value)} type="email" />
                    <Field label="Address" value={form.address} onChange={(value) => updateField('address', value)} />
                    <Field label="City" value={form.city} onChange={(value) => updateField('city', value)} />
                    <Field label="Pincode" value={form.pincode} onChange={(value) => updateField('pincode', value)} inputMode="numeric" />
                    <Field label="Google Maps URL" value={form.google_maps_url} onChange={(value) => updateField('google_maps_url', value)} type="url" />
                  </FormSection>
                  <FormSection title="Social profiles">
                    <Field label="Instagram URL" value={form.instagram_url} onChange={(value) => updateField('instagram_url', value)} type="url" />
                    <Field label="Facebook URL" value={form.facebook_url} onChange={(value) => updateField('facebook_url', value)} type="url" />
                    <Field label="YouTube URL" value={form.youtube_url} onChange={(value) => updateField('youtube_url', value)} type="url" />
                    <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(value) => updateField('linkedin_url', value)} type="url" />
                    <Field label="Google Business URL" value={form.google_business_url} onChange={(value) => updateField('google_business_url', value)} type="url" />
                    <Field label="Other social link" value={form.other_social_url} onChange={(value) => updateField('other_social_url', value)} type="url" />
                  </FormSection>
                  <section>
                    <h3 className="font-bold">Choose a template</h3>
                    {templates.length === 0 ? <p className="mt-2 text-sm text-[#68746c]">No active templates are available.</p> : (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {templates.map((template) => (
                          <label key={template.id} className={`cursor-pointer rounded-2xl border p-4 transition ${form.template_slug === template.slug ? 'border-[#0E2B22] bg-[#eff4f0] ring-2 ring-[#0E2B22]/10' : 'border-[#e2ddd2] bg-white hover:border-[#9aa89f]'}`}>
                            <input className="sr-only" type="radio" name="template" value={template.slug} required checked={form.template_slug === template.slug} onChange={() => updateField('template_slug', template.slug)} />
                            <span className="flex items-center justify-between"><strong>{template.name}</strong><span className="text-xs font-semibold text-[#9d7723]">{form.template_slug === template.slug ? 'Selected' : 'Select'}</span></span>
                            <span className="mt-2 block text-sm leading-5 text-[#68746c]">{template.description || 'A clean, responsive business website template.'}</span>
                            <span className={`mt-4 block h-14 rounded-xl ${template.slug === 'food-bakery' ? 'bg-gradient-to-r from-[#f6dfca] via-[#c77753] to-[#7f4935]' : 'bg-gradient-to-r from-[#dce9e1] via-[#729080] to-[#0E2B22]'}`} aria-hidden="true" />
                          </label>
                        ))}
                      </div>
                    )}
                  </section>
                  <FormSection title="Business owner">
                    <Field label="Owner name" value={form.owner_name} onChange={(value) => updateField('owner_name', value)} required autoComplete="name" />
                    <Field label="Owner email" value={form.owner_email} onChange={(value) => updateField('owner_email', value)} type="email" required autoComplete="email" />
                    <Field label="Owner phone" value={form.owner_phone} onChange={(value) => updateField('owner_phone', value)} type="tel" />
                    <Field label="Temporary password" value={form.owner_password} onChange={(value) => updateField('owner_password', value)} type="password" required min="8" autoComplete="new-password" />
                  </FormSection>
                  <FormSection title="Subscription · ₹1,999/year">
                    <Field label="Plan" value={form.plan} onChange={(value) => updateField('plan', value)} required />
                    <Field label="Annual price (₹)" value={form.amount} onChange={(value) => updateField('amount', value)} type="number" min="0" step="1" required />
                    <Field label="Start date" value={form.start_date} onChange={(value) => updateField('start_date', value)} type="date" required />
                    <Field label="Expiry date" value={form.expiry_date} onChange={(value) => updateField('expiry_date', value)} type="date" required />
                    <SelectField label="Subscription" value={form.subscription_active} onChange={(value) => updateField('subscription_active', value)} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Expired / inactive' }]} />
                    <SelectField label="Publishing" value={form.published} onChange={(value) => updateField('published', value)} options={[{ value: 'true', label: 'Published' }, { value: 'false', label: 'Draft' }]} />
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
                    <Field label="Category" value={form.category} onChange={(value) => updateField('category', value)} required />
                    <TextAreaField label="Description" value={form.description} onChange={(value) => updateField('description', value)} />
                    <Field label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} type="tel" />
                    <Field label="WhatsApp" value={form.whatsapp} onChange={(value) => updateField('whatsapp', value)} type="tel" />
                    <Field label="Email" value={form.email} onChange={(value) => updateField('email', value)} type="email" />
                    <Field label="City" value={form.city} onChange={(value) => updateField('city', value)} />
                    <Field label="Pincode" value={form.pincode} onChange={(value) => updateField('pincode', value)} inputMode="numeric" />
                    <Field label="Google Maps URL" value={form.google_maps_url} onChange={(value) => updateField('google_maps_url', value)} type="url" />
                    <SelectField label="Publishing" value={form.published} onChange={(value) => updateField('published', value)} options={[{ value: 'true', label: 'Published' }, { value: 'false', label: 'Draft' }]} />
                  </FormSection>
                  {formMode === 'edit' ? (
                    <FormSection title="Contact, Location & Social Links">
                      <Field label="Instagram URL" value={form.instagram_url} onChange={(value) => updateField('instagram_url', value)} type="url" />
                      <Field label="Facebook URL" value={form.facebook_url} onChange={(value) => updateField('facebook_url', value)} type="url" />
                      <Field label="YouTube URL" value={form.youtube_url} onChange={(value) => updateField('youtube_url', value)} type="url" />
                      <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(value) => updateField('linkedin_url', value)} type="url" />
                      <Field label="Google Business URL" value={form.google_business_url} onChange={(value) => updateField('google_business_url', value)} type="url" />
                      <Field label="Other social link" value={form.other_social_url} onChange={(value) => updateField('other_social_url', value)} type="url" />
                    </FormSection>
                  ) : null}
                </>
              )}
              {error ? <Notice>{error}</Notice> : null}
              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#e8e2d7] bg-[#fbfaf7] pt-4 sm:flex-row sm:justify-end">
                <button className={secondaryButtonClassName} type="button" onClick={() => setFormMode(null)}>Cancel</button>
                {formMode !== 'view' ? <button className={buttonClassName} type="submit" disabled={busy || (formMode === 'create' && templates.length === 0)}>{busy ? 'Saving…' : formMode === 'create' ? 'Create website' : 'Save changes'}</button> : null}
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h3 className="mb-3 font-bold">{title}</h3><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>;
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
