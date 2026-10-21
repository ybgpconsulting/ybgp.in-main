import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  apiRequest,
  buttonClassName,
  Field,
  formatDate,
  Notice,
  secondaryButtonClassName,
  SelectField,
  TextAreaField,
  useUnsavedChanges,
} from './shared';
import { inferPrimaryAction, isPrimaryAction, resolvePrimaryActionUrl, type PrimaryAction } from '../../../server/business/cta';
import { BUSINESS_DAYS, createDefaultWeeklyHours, parseWeeklyHours, type WeeklyHours } from '../../../server/business/hours';
import { isValidBusinessImageUrl, resolveBusinessImageUrl } from '../../../server/business/images';
import {
  isValidOptionalImageUrl,
  OG_DESCRIPTION_MAX_LENGTH,
  OG_TITLE_MAX_LENGTH,
  resolveTenantImageUrl,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from '../../../server/seo/shared';
interface OwnerBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  google_maps_url?: string | null;
  business_hours?: string | null;
}

interface CategoryRecord {
  id: string;
  name: string;
  image: string | null;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface ProductRecord {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string | null;
  image: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sort_order: number;
}

interface GalleryRecord {
  id: string;
  image: string;
  title: string;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface EnquiryRecord {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  created_at: string;
}

type StringFields = Record<string, string>;

function PanelHeading({ title, description }: { title: string; description: string }) {
  return <div className="mb-5"><h2 className="text-xl font-bold text-[#0E2B22]">{title}</h2><p className="mt-1 text-sm leading-5 text-[#6c786f]">{description}</p></div>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h3 className="mb-3 font-bold text-[#173328]">{title}</h3><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>;
}

function useLoadError() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  return { loading, setLoading, error, setError, success, setSuccess };
}

export function BusinessProfileManager({
  business,
  settings,
  onSaved,
  onDirtyChange,
}: {
  business: OwnerBusiness;
  settings: Record<string, string>;
  onSaved: () => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState<StringFields>({});
  const [savedForm, setSavedForm] = useState<StringFields>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    const initialForm = {
      name: business.name,
      slug: business.slug,
      description: business.description ?? '',
      phone: business.phone ?? '',
      whatsapp: business.whatsapp ?? '',
      email: business.email ?? '',
      address: business.address ?? '',
      instagram_url: business.instagram_url ?? '',
      facebook_url: business.facebook_url ?? '',
      google_maps_url: business.google_maps_url ?? '',
      youtube_url: settings.youtube_url ?? '',
      linkedin_url: settings.linkedin_url ?? '',
      google_business_url: settings.google_business_url ?? '',
      other_social_url: settings.other_social_url ?? '',
      tiktok_url: settings.tiktok_url ?? '',
      x_url: settings.x_url ?? '',
      pinterest_url: settings.pinterest_url ?? '',
      city: settings.city ?? '',
      pincode: settings.pincode ?? '',
    };
    setForm(initialForm);
    setSavedForm(initialForm);
  }, [business, settings]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  useUnsavedChanges(isDirty, onDirtyChange);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (form.pincode && !/^\d{4,10}$/.test(form.pincode)) {
      setError('Pincode must contain 4 to 10 digits.');
      setLoading(false);
      return;
    }
    for (const [label, value] of [
      ['Phone', form.phone],
      ['WhatsApp', form.whatsapp],
    ]) {
      const digits = (value ?? '').replace(/\D/g, '');
      if (value && (digits.length < 7 || digits.length > 15)) {
        setError(`${label} number must contain 7 to 15 digits.`);
        setLoading(false);
        return;
      }
    }
    for (const [label, value] of [
      ['Google Maps', form.google_maps_url],
      ['Instagram', form.instagram_url],
      ['Facebook', form.facebook_url],
      ['YouTube', form.youtube_url],
      ['LinkedIn', form.linkedin_url],
      ['Google Business', form.google_business_url],
      ['Other social link', form.other_social_url],
      ['TikTok', form.tiktok_url],
      ['X', form.x_url],
      ['Pinterest', form.pinterest_url],
    ]) {
      if (!value) continue;
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
          throw new Error('invalid URL');
        }
      } catch {
        setError(`${label} must be a valid http or https URL.`);
        setLoading(false);
        return;
      }
    }
    try {
      await apiRequest('/api/business/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          phone: form.phone,
          whatsapp: form.whatsapp,
          email: form.email,
          address: form.address,
          instagram_url: form.instagram_url,
          facebook_url: form.facebook_url,
          city: form.city,
          pincode: form.pincode,
          google_maps_url: form.google_maps_url,
          youtube_url: form.youtube_url,
          linkedin_url: form.linkedin_url,
          google_business_url: form.google_business_url,
          other_social_url: form.other_social_url,
          tiktok_url: form.tiktok_url,
          x_url: form.x_url,
          pinterest_url: form.pinterest_url,
        }),
      });
      setSavedForm(form);
      setSuccess('Business profile saved. Your public website is updated.');
      try {
        await onSaved();
      } catch {
        setError('Changes were saved, but the dashboard could not refresh. Reload the page to see the latest details.');
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Business profile" description="These details are used on your public website and provide the contact information for your primary action." />
      <form onSubmit={save} className="space-y-5">
        <FormSection title="Business identity">
          <Field label="Business name" value={form.name ?? ''} onChange={(value) => update('name', value)} required maxLength={180} placeholder="e.g. Greenfield Bakery" />
          <div className="sm:col-span-2">
            <Field label="Public website address (read-only)" value={`${window.location.origin}/websites/${business.slug}`} onChange={() => undefined} readOnly />
            <p className="mt-1 text-xs text-[#78827b]">Your website address cannot be changed here, which keeps your existing links working.</p>
          </div>
        </FormSection>

        <FormSection title="Contact details">
          <Field label="Business email" value={form.email ?? ''} onChange={(value) => update('email', value)} type="email" maxLength={254} autoComplete="email" placeholder="hello@example.com" />
          <Field label="Phone" value={form.phone ?? ''} onChange={(value) => update('phone', value)} type="tel" maxLength={32} autoComplete="tel" placeholder="+91 98765 43210" />
          <Field label="WhatsApp" value={form.whatsapp ?? ''} onChange={(value) => update('whatsapp', value)} type="tel" maxLength={32} autoComplete="tel" placeholder="+91 98765 43210" />
        </FormSection>
        <FormSection title="Address and directions">
          <Field label="City" value={form.city ?? ''} onChange={(value) => update('city', value)} maxLength={100} placeholder="e.g. Pune" />
          <Field label="Pincode" value={form.pincode ?? ''} onChange={(value) => update('pincode', value)} inputMode="numeric" maxLength={10} placeholder="6-digit postal code" />
          <TextAreaField label="Business address" value={form.address ?? ''} onChange={(value) => update('address', value)} rows={2} maxLength={500} />
          <Field label="Google Maps link" value={form.google_maps_url ?? ''} onChange={(value) => update('google_maps_url', value)} type="url" maxLength={2048} placeholder="https://maps.google.com/..." />
        </FormSection>
        <FormSection title="Social links">
          <Field label="Instagram URL" value={form.instagram_url ?? ''} onChange={(value) => update('instagram_url', value)} type="url" maxLength={2048} placeholder="https://instagram.com/yourbusiness" />
          <Field label="Facebook URL" value={form.facebook_url ?? ''} onChange={(value) => update('facebook_url', value)} type="url" maxLength={2048} placeholder="https://facebook.com/yourbusiness" />
          <Field label="YouTube URL" value={form.youtube_url ?? ''} onChange={(value) => update('youtube_url', value)} type="url" maxLength={2048} placeholder="https://youtube.com/@yourbusiness" />
          <Field label="LinkedIn URL" value={form.linkedin_url ?? ''} onChange={(value) => update('linkedin_url', value)} type="url" maxLength={2048} placeholder="https://linkedin.com/company/yourbusiness" />
          <Field label="Google Business URL" value={form.google_business_url ?? ''} onChange={(value) => update('google_business_url', value)} type="url" maxLength={2048} placeholder="https://g.page/yourbusiness" />
          <Field label="Other social link" value={form.other_social_url ?? ''} onChange={(value) => update('other_social_url', value)} type="url" maxLength={2048} placeholder="https://example.com/yourbusiness" />
          <Field label="TikTok URL" value={form.tiktok_url ?? ''} onChange={(value) => update('tiktok_url', value)} type="url" maxLength={2048} placeholder="https://tiktok.com/@yourbusiness" />
          <Field label="X URL" value={form.x_url ?? ''} onChange={(value) => update('x_url', value)} type="url" maxLength={2048} placeholder="https://x.com/yourbusiness" />
          <Field label="Pinterest URL" value={form.pinterest_url ?? ''} onChange={(value) => update('pinterest_url', value)} type="url" maxLength={2048} placeholder="https://pinterest.com/yourbusiness" />
        </FormSection>
        <FormSection title="Business description">
          <div className="sm:col-span-2"><TextAreaField label="Description shown on your website" value={form.description ?? ''} onChange={(value) => update('description', value)} rows={5} maxLength={3000} /></div>
        </FormSection>
        {error ? <Notice>{error}</Notice> : null}
        {success ? <Notice kind="success">{success}</Notice> : null}
        <button className={buttonClassName} disabled={loading || !isDirty}>{loading ? 'Saving…' : 'Save profile'}</button>
      </form>
    </section>
  );
}

export function ProductsManager({
  onDirtyChange,
  onNavigate,
}: {
  onDirtyChange: (dirty: boolean) => void;
  onNavigate: (section: 'categories') => void;
}) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [form, setForm] = useState<StringFields>(productForm());
  const [savedForm, setSavedForm] = useState<StringFields>(productForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [saving, setSaving] = useState(false);
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const imageError = form.image?.trim() && !isValidBusinessImageUrl(form.image.trim())
    ? 'Use an HTTP(S) image URL or a safe root-relative image path.'
    : '';
  useUnsavedChanges(isDirty, onDirtyChange);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [productPayload, categoryPayload] = await Promise.all([
        apiRequest<{ products: ProductRecord[] }>('/api/business/products'),
        apiRequest<{ categories: CategoryRecord[] }>('/api/business/categories'),
      ]);
      setProducts(productPayload.products);
      setCategories(categoryPayload.categories);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load products and services');
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setEditingId(null); setForm(productForm()); setSavedForm(productForm()); };
  const cancelEdit = () => { if (!isDirty || window.confirm('Discard your unsaved product changes?')) reset(); };
  const edit = (product: ProductRecord) => {
    if (isDirty && !window.confirm('Discard your unsaved product changes?')) return;
    setEditingId(product.id);
    const editForm = {
      name: product.name,
      description: product.description ?? '',
      category_id: product.category_id ?? '',
      price: product.price ?? '',
      image: product.image ?? '',
      status: product.status,
      sort_order: String(product.sort_order),
    };
    setForm(editForm);
    setSavedForm(editForm);
    setSuccess('');
    setError('');
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageError) { setError(imageError); return; }
    if (form.sort_order && (!Number.isInteger(Number(form.sort_order)) || Number(form.sort_order) < 0 || Number(form.sort_order) > 2147483647)) {
      setError('Display order must be a non-negative whole number.');
      return;
    }
    if (form.price && (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)) {
      setError('Price must be a valid non-negative amount.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const wasEditing = Boolean(editingId);
      await apiRequest(`/api/business/products${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...form,
          price: form.price ? Number(form.price) : null,
          category_id: form.category_id || null,
          sort_order: Number(form.sort_order || 0),
        }),
      });
      reset();
      await load();
      setSuccess(wasEditing ? 'Product / service updated.' : 'Product / service added.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save product / service');
    } finally { setSaving(false); }
  };
  const remove = async (product: ProductRecord) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setError(''); setSuccess('');
    try {
      await apiRequest(`/api/business/products/${product.id}`, { method: 'DELETE' });
      await load();
      setSuccess('Product / service deleted.');
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete product / service'); }
  };

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Products / Services" description="Add the products or services customers can browse on your website." />
      <form onSubmit={save} className="mb-6 rounded-2xl bg-[#f8f7f3] p-4 sm:p-5">
        <h3 className="mb-3 font-bold">{editingId ? 'Edit item' : 'Add an item'}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name ?? ''} onChange={(value) => update('name', value)} required maxLength={180} placeholder="e.g. Seasonal fruit tart" />
          <SelectField label="Category" value={form.category_id ?? ''} onChange={(value) => update('category_id', value)} options={[{ value: '', label: 'No category' }, ...categories.map((item) => ({ value: item.id, label: item.name }))]} />
          <Field label="Price (₹, optional)" value={form.price ?? ''} onChange={(value) => update('price', value)} type="number" min="0" step="0.01" />
          <Field label="Image URL or path (optional)" value={form.image ?? ''} onChange={(value) => update('image', value)} maxLength={2048} placeholder="https://… or /uploads/…" />
          <SelectField label="Visibility" value={form.status ?? 'ACTIVE'} onChange={(value) => update('status', value)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
          <Field label="Display order" value={form.sort_order ?? '0'} onChange={(value) => update('sort_order', value)} type="number" min="0" max="2147483647" step="1" inputMode="numeric" />
        </div>
        {form.image ? <div className="mt-3">{imageError ? <p className="text-sm text-red-700" role="alert">{imageError}</p> : <img src={resolveBusinessImageUrl(form.image)} alt="" className="h-32 w-48 rounded-lg border border-[#ded9cd] bg-white object-cover" onError={(event) => { event.currentTarget.src = '/og-image.svg'; }} />}</div> : null}
        <div className="mt-4"><TextAreaField label="Description" value={form.description ?? ''} onChange={(value) => update('description', value)} rows={3} maxLength={3000} /></div>
        {categories.length === 0 ? <p className="mt-3 text-sm text-[#68746c]">No categories yet. <button type="button" className="font-semibold text-[#0E2B22] underline underline-offset-2" onClick={() => onNavigate('categories')}>Create a category</button> before adding catalogue items, or leave this uncategorized.</p> : null}
        {error ? <div className="mt-3"><Notice>{error}</Notice></div> : null}
        <div className="mt-4 flex flex-wrap gap-2"><button className={buttonClassName} disabled={saving || !isDirty || Boolean(imageError)}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product / service'}</button>{editingId ? <button className={secondaryButtonClassName} type="button" onClick={cancelEdit}>Cancel edit</button> : null}</div>
      </form>
      {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}{success ? <div className="mb-4"><Notice kind="success">{success}</Notice></div> : null}
      {loading ? <p className="py-4 text-sm text-[#68746c]">Loading products / services…</p> : products.length === 0 ? <EmptyState title="Your catalogue is empty" text="Add your first product or service using the form above." /> : (
        <div className="space-y-3">{products.map((product) => (
          <article key={product.id} className="flex flex-col gap-3 rounded-xl border border-[#eee9df] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{product.name}</h3><StatusPill active={product.status === 'ACTIVE'} /></div><p className="mt-1 text-sm text-[#6d7870]">{categories.find((category) => category.id === product.category_id)?.name || 'Uncategorized'} · {product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Price on enquiry'} · Order {product.sort_order}</p>{product.description ? <p className="mt-1 line-clamp-2 text-sm text-[#758078]">{product.description}</p> : null}</div>
            <div className="flex shrink-0 gap-2"><button className={secondaryButtonClassName} onClick={() => edit(product)}>Edit</button><button className={secondaryButtonClassName} onClick={() => void remove(product)}>Delete</button></div>
          </article>
        ))}</div>
      )}
    </section>
  );
}

export function CategoriesManager({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [form, setForm] = useState({ name: '', image: '', status: 'ACTIVE', sort_order: '0' });
  const [savedForm, setSavedForm] = useState({ name: '', image: '', status: 'ACTIVE', sort_order: '0' });
  const [editing, setEditing] = useState<string | null>(null);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [saving, setSaving] = useState(false);
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const imageError = form.image.trim() && !isValidBusinessImageUrl(form.image.trim())
    ? 'Use an HTTP(S) image URL or a safe root-relative image path.'
    : '';
  useUnsavedChanges(isDirty, onDirtyChange);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [categoryPayload, productPayload] = await Promise.all([
        apiRequest<{ categories: CategoryRecord[] }>('/api/business/categories'),
        apiRequest<{ products: ProductRecord[] }>('/api/business/products'),
      ]);
      setCategories(categoryPayload.categories); setProducts(productPayload.products);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load categories'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const reset = () => { const empty = { name: '', image: '', status: 'ACTIVE', sort_order: '0' }; setEditing(null); setForm(empty); setSavedForm(empty); };
  const cancelEdit = () => { if (!isDirty || window.confirm('Discard your unsaved category changes?')) reset(); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) { setError('Enter a category name.'); return; }
    if (form.name.trim().length > 120) { setError('Category name must be 120 characters or fewer.'); return; }
    if (form.image.length > 2048) { setError('Category image URL must be 2048 characters or fewer.'); return; }
    if (imageError) { setError(imageError); return; }
    if (form.sort_order && (!Number.isInteger(Number(form.sort_order)) || Number(form.sort_order) < 0 || Number(form.sort_order) > 2147483647)) { setError('Display order must be a non-negative whole number.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await apiRequest(`/api/business/categories${editing ? `/${editing}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order || 0) }),
      });
      const wasEditing = Boolean(editing);
      reset(); await load(); setSuccess(wasEditing ? 'Category updated.' : 'Category created.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save category'); }
    finally { setSaving(false); }
  };
  const remove = async (category: CategoryRecord) => {
    const linkedCount = products.filter((product) => product.category_id === category.id).length;
    if (linkedCount > 0) {
      setError(`“${category.name}” has ${linkedCount} product${linkedCount === 1 ? '' : 's'}. Move those products to another category before deleting it.`);
      return;
    }
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    setError(''); setSuccess('');
    try { await apiRequest(`/api/business/categories/${category.id}`, { method: 'DELETE' }); await load(); setSuccess('Category deleted.'); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete category'); }
  };
  const edit = (category: CategoryRecord) => { if (isDirty && !window.confirm('Discard your unsaved category changes?')) return; const editForm = { name: category.name, image: category.image ?? '', status: category.status, sort_order: String(category.sort_order) }; setEditing(category.id); setForm(editForm); setSavedForm(editForm); setError(''); setSuccess(''); };

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Categories" description="Create clear sections and choose an image for each category on your public website." />
      <form onSubmit={save} className="mb-6 grid gap-3 rounded-2xl bg-[#f8f7f3] p-4 sm:grid-cols-2 sm:items-end lg:grid-cols-[1.2fr_1.5fr_0.8fr_0.8fr_auto]">
        <Field label="Category name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} required maxLength={120} placeholder="e.g. Cakes and pastries" />
        <Field label="Category image URL or path (optional)" value={form.image} onChange={(image) => setForm((current) => ({ ...current, image }))} maxLength={2048} placeholder="https://example.com/category.jpg or /uploads/category.jpg" />
        <SelectField label="Visibility" value={form.status} onChange={(status) => setForm((current) => ({ ...current, status }))} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
        <Field label="Display order" value={form.sort_order} onChange={(sort_order) => setForm((current) => ({ ...current, sort_order }))} type="number" min="0" max="2147483647" step="1" inputMode="numeric" />
        <div className="flex gap-2"><button className={buttonClassName} disabled={saving || !isDirty}>{saving ? 'Saving…' : editing ? 'Save' : 'Add'}</button>{editing ? <button className={secondaryButtonClassName} type="button" onClick={cancelEdit}>Cancel</button> : null}</div>
      </form>
      {imageError ? <p className="-mt-3 mb-4 text-sm text-red-700" role="alert">{imageError}</p> : null}
      {form.image && !imageError ? <div className="mb-4"><img src={resolveBusinessImageUrl(form.image)} alt="" className="h-28 w-44 rounded-lg border border-[#ded9cd] bg-white object-cover" onError={(event) => { event.currentTarget.src = '/og-image.svg'; }} /></div> : null}
      {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}{success ? <div className="mb-4"><Notice kind="success">{success}</Notice></div> : null}
      {loading ? <p className="py-4 text-sm text-[#68746c]">Loading categories…</p> : categories.length === 0 ? <EmptyState title="No categories yet" text="Add a category above to group your products or services." /> : (
        <div className="space-y-3">{categories.map((category) => (
          <article key={category.id} className="flex flex-col gap-3 rounded-xl border border-[#eee9df] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">{category.image ? <img src={resolveBusinessImageUrl(category.image)} alt="" className="h-12 w-16 rounded-lg border border-[#ded9cd] object-cover" onError={(event) => { event.currentTarget.src = '/og-image.svg'; }} /> : <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2ee] font-bold text-[#214434]">{category.name.slice(0, 1).toUpperCase()}</div>}<div><h3 className="font-semibold">{category.name}</h3><p className="text-sm text-[#6d7870]">{products.filter((product) => product.category_id === category.id).length} products · Order {category.sort_order}</p></div><StatusPill active={category.status === 'ACTIVE'} /></div>
            <div className="flex gap-2"><button className={secondaryButtonClassName} onClick={() => edit(category)}>Edit</button><button className={secondaryButtonClassName} onClick={() => void remove(category)}>Delete</button></div>
          </article>
        ))}</div>
      )}
    </section>
  );
}

export function GalleryManager({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [form, setForm] = useState({ image: '', title: '', status: 'ACTIVE', sort_order: '0' });
  const [savedForm, setSavedForm] = useState({ image: '', title: '', status: 'ACTIVE', sort_order: '0' });
  const [editing, setEditing] = useState<string | null>(null);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [saving, setSaving] = useState(false);
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const imageError = form.image.trim() && !isValidBusinessImageUrl(form.image.trim())
    ? 'Enter a valid HTTP(S) image URL or safe root-relative image path. Protocol-relative URLs are not supported.'
    : '';
  useUnsavedChanges(isDirty, onDirtyChange);
  const load = async () => {
    setLoading(true); setError('');
    try { const data = await apiRequest<{ gallery: GalleryRecord[] }>('/api/business/gallery'); setItems(data.gallery); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load gallery'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const reset = () => { const empty = { image: '', title: '', status: 'ACTIVE', sort_order: '0' }; setEditing(null); setForm(empty); setSavedForm(empty); };
  const cancelEdit = () => { if (!isDirty || window.confirm('Discard your unsaved gallery changes?')) reset(); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageError) { setError(imageError); return; }
    if (form.title.trim().length > 180) { setError('Image title must be 180 characters or fewer.'); return; }
    if (form.sort_order && (!Number.isInteger(Number(form.sort_order)) || Number(form.sort_order) < 0 || Number(form.sort_order) > 2147483647)) { setError('Display order must be a non-negative whole number.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const wasEditing = Boolean(editing);
      await apiRequest(`/api/business/gallery${editing ? `/${editing}` : ''}`, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, sort_order: Number(form.sort_order || 0) }) });
      reset(); await load(); setSuccess(wasEditing ? 'Gallery image updated.' : 'Gallery image added.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save gallery image'); }
    finally { setSaving(false); }
  };
  const remove = async (item: GalleryRecord) => {
    if (!window.confirm(`Delete "${item.title}" from the gallery?`)) return;
    setError(''); setSuccess('');
    try { await apiRequest(`/api/business/gallery/${item.id}`, { method: 'DELETE' }); await load(); setSuccess('Gallery image deleted.'); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete gallery image'); }
  };
  const edit = (item: GalleryRecord) => { if (isDirty && !window.confirm('Discard your unsaved gallery changes?')) return; const editForm = { image: item.image, title: item.title, status: item.status, sort_order: String(item.sort_order) }; setEditing(item.id); setForm(editForm); setSavedForm(editForm); setError(''); setSuccess(''); };
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Gallery" description="Add an absolute HTTP(S) image URL or a root-relative path such as /uploads/businesses/example/photo.jpg. File upload is not available here; the title is used as alternative text." />
      <form onSubmit={save} className="mb-6 rounded-2xl bg-[#f8f7f3] p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Image URL or path" value={form.image} onChange={(value) => update('image', value)} required maxLength={2048} placeholder="https://… or /uploads/…" />
          <Field label="Image title / alternative text" value={form.title} onChange={(value) => update('title', value)} required maxLength={180} placeholder="Describe the image" />
          <SelectField label="Visibility" value={form.status} onChange={(value) => update('status', value)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
          <Field label="Display order" value={form.sort_order} onChange={(value) => update('sort_order', value)} type="number" min="0" max="2147483647" step="1" inputMode="numeric" />
        </div>
        {form.image ? <div className="mt-3">{imageError ? <p className="text-sm text-red-700" role="alert">{imageError}</p> : <img src={resolveBusinessImageUrl(form.image)} alt="" className="h-32 w-48 rounded-lg border border-[#ded9cd] bg-white object-cover" onError={(event) => { event.currentTarget.src = '/og-image.svg'; }} />}</div> : null}
        <div className="mt-4 flex flex-wrap gap-2"><button className={buttonClassName} disabled={saving || !isDirty || Boolean(imageError)}>{saving ? 'Saving…' : editing ? 'Save image' : 'Add image'}</button>{editing ? <button className={secondaryButtonClassName} type="button" onClick={cancelEdit}>Cancel</button> : null}</div>
      </form>
      {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}{success ? <div className="mb-4"><Notice kind="success">{success}</Notice></div> : null}
      {loading ? <p className="py-4 text-sm text-[#68746c]">Loading gallery…</p> : items.length === 0 ? <EmptyState title="Your gallery is empty" text="Add an image URL or path to show photos on your public website." /> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => {
          const safeImage = resolveBusinessImageUrl(item.image);
          return (
          <article key={item.id} className="overflow-hidden rounded-xl border border-[#eee9df]">
            {safeImage ? <img src={safeImage} alt={item.title} className="h-40 w-full bg-[#f1eee8] object-cover" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /> : <div className="grid h-40 place-items-center bg-[#f1eee8] text-sm text-[#78827b]">No preview available</div>}
            <div className="p-3"><div className="flex items-center justify-between gap-2"><h3 className="truncate font-semibold">{item.title}</h3><StatusPill active={item.status === 'ACTIVE'} /></div><p className="mt-1 text-xs text-[#768078]">Order {item.sort_order}</p><div className="mt-3 flex gap-2"><button className={secondaryButtonClassName} onClick={() => edit(item)}>Edit</button><button className={secondaryButtonClassName} onClick={() => void remove(item)}>Delete</button></div></div>
          </article>
          );
        })}</div>
      )}
    </section>
  );
}

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [savingId, setSavingId] = useState<string | null>(null);
  const load = async () => {
    setLoading(true); setError('');
    try { const data = await apiRequest<{ enquiries: EnquiryRecord[] }>('/api/business/enquiries'); setEnquiries(data.enquiries); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load enquiries'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const visibleEnquiries = enquiries
    .filter((item) => statusFilter === 'ALL' || item.status === statusFilter)
    .filter((item) => `${item.name} ${item.phone} ${item.email ?? ''} ${item.message}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((left, right) => (new Date(left.created_at).getTime() - new Date(right.created_at).getTime()) * (sortNewestFirst ? -1 : 1));
  const changeStatus = async (item: EnquiryRecord, status: EnquiryRecord['status']) => {
    setSavingId(item.id); setError(''); setSuccess('');
    try { await apiRequest(`/api/business/enquiries/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); setSuccess('Enquiry status updated.'); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to update enquiry'); }
    finally { setSavingId(null); }
  };

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Enquiries" description="Review customer messages and track what needs a response." />
      {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}{success ? <div className="mb-4"><Notice kind="success">{success}</Notice></div> : null}
      {loading ? <p className="py-4 text-sm text-[#68746c]">Loading enquiries…</p> : enquiries.length === 0 ? <EmptyState title="No enquiries yet" text="New customer enquiries will appear here." /> : (
        <>
        <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <Field label="Search enquiries" value={query} onChange={setQuery} type="search" placeholder="Name, phone, email or message" />
          <SelectField label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'ALL', label: 'All statuses' }, { value: 'NEW', label: 'New' }, { value: 'CONTACTED', label: 'Contacted' }, { value: 'CLOSED', label: 'Closed' }]} />
          <button type="button" className={`${secondaryButtonClassName} self-end`} onClick={() => setSortNewestFirst((current) => !current)} aria-label={`Sort by date, currently ${sortNewestFirst ? 'newest first' : 'oldest first'}`}>{sortNewestFirst ? 'Newest first' : 'Oldest first'}</button>
        </div>
        {visibleEnquiries.length === 0 ? <EmptyState title="No matching enquiries" text="Try a different search or status filter." /> : <div className="space-y-3">{visibleEnquiries.map((item) => {
          const digits = item.phone.replace(/\D/g, '');
          const telHref = digits.length >= 7 ? `tel:${item.phone.replace(/[^\d+]/g, '')}` : '';
          const whatsappHref = digits.length >= 7 ? `https://wa.me/${digits}` : '';
          return (
          <article key={item.id} className="rounded-xl border border-[#eee9df] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.name}</h3><StatusPill active={item.status !== 'CLOSED'} label={item.status} /></div><p className="mt-1 text-sm text-[#617067]">{item.phone}{item.email ? ` · ${item.email}` : ''}</p><p className="mt-1 text-xs text-[#8a938d]">{formatDate(item.created_at)}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#374a40]">{item.message}</p><div className="mt-3 flex flex-wrap gap-2">{telHref ? <a className={secondaryButtonClassName} href={telHref}>Call</a> : null}{whatsappHref ? <a className={secondaryButtonClassName} href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}{item.email ? <a className={secondaryButtonClassName} href={`mailto:${encodeURIComponent(item.email)}`}>Email</a> : null}</div></div>
              <label className="shrink-0 text-xs font-semibold text-[#58665e]">Status<select className="mt-1 block min-h-11 rounded-xl border border-[#ded9cd] bg-white px-3 text-sm" value={item.status} disabled={savingId === item.id} onChange={(event) => void changeStatus(item, event.target.value as EnquiryRecord['status'])}><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="CLOSED">Closed</option></select></label>
            </div>
          </article>
        );
        })}</div>}
        </>
      )}
    </section>
  );
}

export function SettingsManager({
  business,
  initialSettings,
  onSaved,
  onDirtyChange,
}: {
  business: OwnerBusiness;
  initialSettings: Record<string, string>;
  onSaved: () => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState<StringFields>({ primary_action: 'whatsapp', cta_text: '', cta_url: '' });
  const [savedForm, setSavedForm] = useState<StringFields>({ primary_action: 'whatsapp', cta_text: '', cta_url: '' });
  const [hours, setHours] = useState<WeeklyHours>(createDefaultWeeklyHours());
  const [savedHours, setSavedHours] = useState<WeeklyHours>(createDefaultWeeklyHours());
  const [legacyHours, setLegacyHours] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    const initialForm = {
      primary_action: inferPrimaryAction(initialSettings, business),
      cta_text: initialSettings.cta_text ?? '',
      cta_url: initialSettings.cta_url ?? '',
    };
    const parsedHours = parseWeeklyHours(initialSettings.working_hours);
    const initialHours = parsedHours ?? createDefaultWeeklyHours();
    setForm(initialForm);
    setSavedForm(initialForm);
    setHours(initialHours);
    setSavedHours(initialHours);
    setLegacyHours(initialSettings.working_hours && !parsedHours ? initialSettings.working_hours : '');
  }, [business.email, business.phone, business.whatsapp, initialSettings]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm) || JSON.stringify(hours) !== JSON.stringify(savedHours);
  useUnsavedChanges(isDirty, onDirtyChange);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const action = isPrimaryAction(form.primary_action) ? form.primary_action : 'whatsapp';
  const actionDirty = form.primary_action !== savedForm.primary_action || form.cta_text !== savedForm.cta_text || form.cta_url !== savedForm.cta_url;
  const actionUrl = resolvePrimaryActionUrl(action, business, form.cta_url);
  const updateDay = (day: keyof WeeklyHours, patch: Partial<WeeklyHours[keyof WeeklyHours]>) => {
    setHours((current) => ({ ...current, [day]: { ...current[day], ...patch } }));
  };
  const copyMondayToWeekdays = () => {
    setHours((current) => ({
      ...current,
      tuesday: { ...current.monday },
      wednesday: { ...current.monday },
      thursday: { ...current.monday },
      friday: { ...current.monday },
    }));
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (actionDirty && !actionUrl) {
      setError(action === 'custom'
        ? 'Enter a valid HTTP(S), phone, email, or safe site link for the custom action.'
        : `Add a valid ${action === 'whatsapp' ? 'WhatsApp number' : action === 'call' ? 'phone number' : 'business email'} in your Business profile first.`);
      return;
    }
    setBusy(true); setError(''); setSuccess('');
    try {
      const settings: Record<string, string> = {};
      if (actionDirty) {
        settings.primary_action = action;
        settings.cta_text = form.cta_text;
        if (action === 'custom') settings.cta_url = form.cta_url;
      }
      if (JSON.stringify(hours) !== JSON.stringify(savedHours)) settings.working_hours = JSON.stringify(hours);
      await apiRequest('/api/business/settings', { method: 'PATCH', body: JSON.stringify(settings) });
      setSavedForm(form);
      setSavedHours(hours);
      setLegacyHours('');
      await onSaved(); setSuccess('Settings saved. Your public website is updated.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save settings'); }
    finally { setBusy(false); }
  };
  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Website settings" description="Set contact actions and business hours shown on the public website." />
      <form onSubmit={save} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Primary action" value={action} onChange={(value) => update('primary_action', value)} options={[
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'call', label: 'Call' },
            { value: 'email', label: 'Email' },
            { value: 'custom', label: 'Custom link' },
          ]} />
          <Field label="Button text (optional)" value={form.cta_text ?? ''} onChange={(value) => update('cta_text', value)} placeholder="Contact us" maxLength={60} />
          {action === 'custom' ? <Field label="Custom link URL" value={form.cta_url ?? ''} onChange={(value) => update('cta_url', value)} inputMode="url" placeholder="https://booking.example.com" required maxLength={2048} /> : null}
        </div>
        {action === 'custom' ? <p className={`text-sm ${actionUrl ? 'text-[#657168]' : 'text-red-700'}`} role={actionUrl ? undefined : 'alert'}>{actionUrl ? `Button opens: ${actionUrl}` : 'Enter a valid HTTP(S), phone, email, or safe site-relative link.'}</p> : null}
        {action !== 'custom' && !actionUrl ? <p className="text-sm text-[#7c5a25]">Add the matching phone number or email in Contact, Location &amp; Social Links to activate this action.</p> : null}
        <section aria-labelledby="hours-heading" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 id="hours-heading" className="font-bold text-[#173328]">Business hours</h3><p className="mt-1 text-sm text-[#68746c]">Set opening and closing times by day, or mark a day closed.</p></div><button type="button" onClick={copyMondayToWeekdays} className={secondaryButtonClassName}>Copy Monday to weekdays</button></div>
          {legacyHours ? <Notice kind="info">Previously saved hours are kept as-is. Edit a day to replace them with a weekly schedule. Current hours: {legacyHours}</Notice> : null}
          <div className="divide-y divide-[#eee9df] rounded-xl border border-[#e8e2d7] px-3">
            {BUSINESS_DAYS.map(({ key, label }) => (
              <div key={key} className="grid grid-cols-2 items-center gap-2 py-3 sm:grid-cols-[minmax(7rem,1fr)_auto_minmax(7rem,1fr)_minmax(7rem,1fr)] sm:gap-3">
                <span className="text-sm font-medium">{label}</span>
                <label className="flex items-center gap-1.5 text-xs text-[#58665e]"><input type="checkbox" checked={hours[key].closed} onChange={(event) => updateDay(key, { closed: event.target.checked })} />Closed</label>
                <label className="text-xs text-[#58665e]">Opens<input aria-label={`${label} opening time`} className="mt-1 min-h-10 w-full rounded-lg border border-[#ded9cd] px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E2B22]" type="time" value={hours[key].open} disabled={hours[key].closed} onChange={(event) => updateDay(key, { open: event.target.value })} /></label>
                <label className="text-xs text-[#58665e]">Closes<input aria-label={`${label} closing time`} className="mt-1 min-h-10 w-full rounded-lg border border-[#ded9cd] px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E2B22]" type="time" value={hours[key].close} disabled={hours[key].closed} onChange={(event) => updateDay(key, { close: event.target.value })} /></label>
              </div>
            ))}
          </div>
        </section>
        {error ? <Notice>{error}</Notice> : null}{success ? <Notice kind="success">{success}</Notice> : null}
        <button className={buttonClassName} disabled={busy || !isDirty || (actionDirty && !actionUrl)}>{busy ? 'Saving…' : 'Save settings'}</button>
      </form>
    </section>
  );
}

export function SeoManager({
  business,
  publicUrl,
  initialSettings,
  onSaved,
  onDirtyChange,
}: {
  business: OwnerBusiness;
  publicUrl: string;
  initialSettings: Record<string, string>;
  onSaved: () => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState({ seo_title: '', seo_description: '', og_title: '', og_description: '', og_image: '' });
  const [savedForm, setSavedForm] = useState({ seo_title: '', seo_description: '', og_title: '', og_description: '', og_image: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    const initialForm = {
      seo_title: initialSettings.seo_title ?? '',
      seo_description: initialSettings.seo_description ?? '',
      og_title: initialSettings.og_title ?? '',
      og_description: initialSettings.og_description ?? '',
      og_image: initialSettings.og_image ?? '',
    };
    setForm(initialForm);
    setSavedForm(initialForm);
  }, [initialSettings]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  useUnsavedChanges(isDirty, onDirtyChange);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const imageError = !isValidOptionalImageUrl(form.og_image.trim())
    ? 'Use an HTTP(S) image URL or an image path under /uploads.'
    : '';
  const seoTitleError = form.seo_title.length > SEO_TITLE_MAX_LENGTH;
  const seoDescriptionError = form.seo_description.length > SEO_DESCRIPTION_MAX_LENGTH;
  const ogTitleError = form.og_title.length > OG_TITLE_MAX_LENGTH;
  const ogDescriptionError = form.og_description.length > OG_DESCRIPTION_MAX_LENGTH;
  const defaultTitle = `${business.name} | ${business.category}`;
  const defaultDescription = business.description?.trim() || `Visit ${business.name} for ${business.category.toLowerCase()} offerings and contact information.`;
  const effectiveTitle = form.seo_title.trim() || defaultTitle;
  const effectiveDescription = form.seo_description.trim() || defaultDescription;
  const previewTitle = form.og_title.trim() || form.seo_title.trim() || defaultTitle;
  const previewDescription = form.og_description.trim() || form.seo_description.trim() || defaultDescription;
  const effectiveUrl = typeof window === 'undefined' ? publicUrl : new URL(publicUrl, window.location.origin).href;
  const fallbackImage = typeof window === 'undefined' ? '/og-image.svg' : new URL('/og-image.svg', window.location.origin).href;
  const imagePreview = resolveTenantImageUrl(form.og_image, effectiveUrl, fallbackImage);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (seoTitleError || seoDescriptionError || ogTitleError || ogDescriptionError) {
      setError('Please correct the highlighted SEO field limits before saving.');
      return;
    }
    if (imageError) {
      setError(imageError);
      return;
    }
    setBusy(true); setError(''); setSuccess('');
    try {
      await apiRequest('/api/business/settings', { method: 'PATCH', body: JSON.stringify(form) });
      setSavedForm(form);
      await onSaved(); setSuccess('SEO settings saved. Refresh your public website to see the updated metadata and heading.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save SEO settings'); }
    finally { setBusy(false); }
  };
  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="SEO & social preview" description="Blank fields use automatic defaults. This does not submit your site to search engines or guarantee rankings." />
      <form onSubmit={save} className="space-y-4">
        <div>
          <Field label="Meta title" value={form.seo_title} onChange={(value) => update('seo_title', value)} maxLength={SEO_TITLE_MAX_LENGTH} />
          <p className={`mt-1 text-xs ${seoTitleError ? 'text-red-700' : 'text-[#818b84]'}`} role={seoTitleError ? 'alert' : undefined}>
            {seoTitleError ? `Meta title must be at most ${SEO_TITLE_MAX_LENGTH} characters.` : `${form.seo_title.length}/${SEO_TITLE_MAX_LENGTH} characters`}
          </p>
        </div>
        <div>
          <TextAreaField label="Meta description" value={form.seo_description} onChange={(value) => update('seo_description', value)} rows={3} maxLength={SEO_DESCRIPTION_MAX_LENGTH} />
          <p className={`mt-1 text-xs ${seoDescriptionError ? 'text-red-700' : 'text-[#818b84]'}`} role={seoDescriptionError ? 'alert' : undefined}>
            {seoDescriptionError ? `Meta description must be at most ${SEO_DESCRIPTION_MAX_LENGTH} characters.` : `${form.seo_description.length}/${SEO_DESCRIPTION_MAX_LENGTH} characters`}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Field label="Open Graph title" value={form.og_title} onChange={(value) => update('og_title', value)} maxLength={OG_TITLE_MAX_LENGTH} />
            <p className={`mt-1 text-xs ${ogTitleError ? 'text-red-700' : 'text-[#818b84]'}`} role={ogTitleError ? 'alert' : undefined}>
              {ogTitleError ? `Open Graph title must be at most ${OG_TITLE_MAX_LENGTH} characters.` : `${form.og_title.length}/${OG_TITLE_MAX_LENGTH} characters`}
            </p>
          </div>
          <Field label="Open Graph image URL or path" value={form.og_image} onChange={(value) => update('og_image', value)} />
        </div>
        {imageError ? <p className="-mt-3 text-sm text-red-700" role="alert">{imageError}</p> : null}
        <div>
          <TextAreaField label="Open Graph description" value={form.og_description} onChange={(value) => update('og_description', value)} rows={3} maxLength={OG_DESCRIPTION_MAX_LENGTH} />
          <p className={`mt-1 text-xs ${ogDescriptionError ? 'text-red-700' : 'text-[#818b84]'}`} role={ogDescriptionError ? 'alert' : undefined}>
            {ogDescriptionError ? `Open Graph description must be at most ${OG_DESCRIPTION_MAX_LENGTH} characters.` : `${form.og_description.length}/${OG_DESCRIPTION_MAX_LENGTH} characters`}
          </p>
        </div>
        <section className="max-w-2xl overflow-hidden rounded-xl border border-[#ded9cd] bg-[#f7f6f2]" aria-label="Effective public sharing preview">
          <div className="space-y-3 p-3"><div><p className="text-xs font-semibold uppercase text-[#78827b]">Effective public URL</p><p className="mt-1 break-all text-sm">{effectiveUrl}</p></div><div><p className="text-xs font-semibold uppercase text-[#78827b]">Search title</p><p className="mt-1 text-sm">{effectiveTitle}</p></div><div><p className="text-xs font-semibold uppercase text-[#78827b]">Meta description</p><p className="mt-1 text-sm">{effectiveDescription}</p></div></div>
          <img src={imagePreview} alt="" referrerPolicy="no-referrer" className="aspect-[1.91/1] w-full bg-[#e9e5db] object-cover" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
          <div className="space-y-1 p-3"><p className="font-semibold">{previewTitle}</p><p className="text-sm text-[#68746c]">{previewDescription}</p><p className="break-all text-xs text-[#78827b]">{imagePreview}</p></div>
        </section>
        {error ? <Notice>{error}</Notice> : null}{success ? <Notice kind="success">{success}</Notice> : null}
        <button className={buttonClassName} disabled={busy || !isDirty}>{busy ? 'Saving…' : 'Save SEO settings'}</button>
      </form>
    </section>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-dashed border-[#dcd7cb] bg-[#fbfaf7] px-5 py-9 text-center"><h3 className="font-semibold text-[#273e32]">{title}</h3><p className="mt-1 text-sm text-[#78827b]">{text}</p></div>;
}

function StatusPill({ active, label }: { active: boolean; label?: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{label ?? (active ? 'ACTIVE' : 'INACTIVE')}</span>;
}

function productForm(): StringFields {
  return { name: '', description: '', category_id: '', price: '', image: '', status: 'ACTIVE', sort_order: '0' };
}

export function WebsiteContentManager({
  business,
  initialSettings,
  onSaved,
  onDirtyChange,
}: {
  business: OwnerBusiness;
  initialSettings: Record<string, string>;
  onSaved: () => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState({
    hero_title: '',
    hero_eyebrow: '',
    highlights_eyebrow: '',
    highlights_title: '',
    about_eyebrow: '',
    about_title: '',
    about_description: '',
    about_points: '',
    about_image: '',
    final_cta_title: '',
    final_cta_description: '',
    final_cta_button: '',
  });
  const [savedForm, setSavedForm] = useState(form);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loaded = {
      hero_title: initialSettings.hero_title ?? '',
      hero_eyebrow: initialSettings.hero_eyebrow ?? '',
      highlights_eyebrow: initialSettings.highlights_eyebrow ?? '',
      highlights_title: initialSettings.highlights_title ?? '',
      about_eyebrow: initialSettings.about_eyebrow ?? '',
      about_title: initialSettings.about_title ?? '',
      about_description: initialSettings.about_description ?? '',
      about_points: initialSettings.about_points ?? '',
      about_image: initialSettings.about_image ?? '',
      final_cta_title: initialSettings.final_cta_title ?? '',
      final_cta_description: initialSettings.final_cta_description ?? '',
      final_cta_button: initialSettings.final_cta_button ?? '',
    };
    setForm(loaded);
    setSavedForm(loaded);
  }, [initialSettings]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  useUnsavedChanges(isDirty, onDirtyChange);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await apiRequest('/api/business/settings', {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      setSavedForm(form);
      await onSaved();
      setSuccess('Website content saved! Your public website now displays these custom headlines, story, and banner details.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save website content');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading
        title="Website Content & Story"
        description="Customize the headlines, about story, highlights, and bottom banner on your website. Blank fields will use the theme defaults."
      />
      <form onSubmit={save} className="space-y-6">
        <FormSection title="Hero section (top banner)">
          <Field
            label="Custom hero headline (optional)"
            value={form.hero_title}
            onChange={(v) => update('hero_title', v)}
            placeholder={`Defaults to "${business.name}"`}
            maxLength={300}
          />
          <Field
            label="Hero eyebrow / tagline (optional)"
            value={form.hero_eyebrow}
            onChange={(v) => update('hero_eyebrow', v)}
            placeholder={`Defaults to "${business.category}"`}
            maxLength={150}
          />
        </FormSection>

        <FormSection title="Highlights / features section">
          <Field
            label="Highlights section eyebrow (optional)"
            value={form.highlights_eyebrow}
            onChange={(v) => update('highlights_eyebrow', v)}
            placeholder="e.g. What we do / Specialities / From the counter"
            maxLength={150}
          />
          <Field
            label="Highlights section heading (optional)"
            value={form.highlights_title}
            onChange={(v) => update('highlights_title', v)}
            placeholder="e.g. Care that starts with listening / The right support for your next step"
            maxLength={300}
          />
        </FormSection>

        <FormSection title="Our story / About us section">
          <Field
            label="Story eyebrow (optional)"
            value={form.about_eyebrow}
            onChange={(v) => update('about_eyebrow', v)}
            placeholder="e.g. Our story / Craft / The studio"
            maxLength={150}
          />
          <Field
            label="Story heading (optional)"
            value={form.about_title}
            onChange={(v) => update('about_title', v)}
            placeholder="e.g. Baked fresh every morning / Thoughtful care, made personal"
            maxLength={300}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              label="Story description (optional)"
              value={form.about_description}
              onChange={(v) => update('about_description', v)}
              rows={4}
              placeholder="Tell your visitors the story of your business, what inspires your work, and why customers trust you."
              maxLength={4000}
            />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField
              label="Key bullet points / features (one per line)"
              value={form.about_points}
              onChange={(v) => update('about_points', v)}
              rows={3}
              placeholder="Over 15 years experience&#10;Painless modern procedures&#10;Family-friendly atmosphere"
              maxLength={3000}
            />
            <p className="mt-1 text-xs text-[#78827b]">Each line becomes a verified bullet point on your story section.</p>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Story photo URL (optional)"
              value={form.about_image}
              onChange={(v) => update('about_image', v)}
              placeholder="https://example.com/photos/our-team.jpg or /uploads/image.jpg"
              maxLength={2048}
            />
            <p className="mt-1 text-xs text-[#78827b]">A photo of your founders, storefront, clinic, kitchen, or workshop.</p>
          </div>
        </FormSection>

        <FormSection title="Bottom call-to-action banner">
          <Field
            label="Bottom banner heading (optional)"
            value={form.final_cta_title}
            onChange={(v) => update('final_cta_title', v)}
            placeholder="e.g. Ready to plan something special?"
            maxLength={300}
          />
          <Field
            label="Bottom button text (optional)"
            value={form.final_cta_button}
            onChange={(v) => update('final_cta_button', v)}
            placeholder="e.g. Chat with us on WhatsApp"
            maxLength={100}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              label="Bottom banner description (optional)"
              value={form.final_cta_description}
              onChange={(v) => update('final_cta_description', v)}
              rows={2}
              placeholder="e.g. Tell us what you are celebrating or reach out to ask any question. We are happy to help."
              maxLength={1500}
            />
          </div>
        </FormSection>

        {error ? <Notice>{error}</Notice> : null}
        {success ? <Notice kind="success">{success}</Notice> : null}
        <button className={buttonClassName} disabled={busy || !isDirty}>
          {busy ? 'Saving…' : 'Save website content'}
        </button>
      </form>
    </section>
  );
}
