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
} from './shared';
import {
  isValidOptionalImageUrl,
  OG_DESCRIPTION_MAX_LENGTH,
  OG_TITLE_MAX_LENGTH,
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
}: {
  business: OwnerBusiness;
  settings: Record<string, string>;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<StringFields>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setForm({
      name: business.name,
      slug: business.slug,
      category: business.category,
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
    });
  }, [business, settings]);

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
          category: form.category,
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
      <PanelHeading title="Contact, Location & Social Links" description="Keep your address, directions, contact details and social links up to date on your website." />
      <form onSubmit={save} className="space-y-5">
        <FormSection title="Contact and location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" value={form.name ?? ''} onChange={(value) => update('name', value)} required />
          <Field label="Website address (slug)" value={form.slug ?? ''} onChange={() => undefined} readOnly />
          <Field label="Category" value={form.category ?? ''} onChange={(value) => update('category', value)} required />
          <Field label="Business email" value={form.email ?? ''} onChange={(value) => update('email', value)} type="email" />
          <Field label="Phone" value={form.phone ?? ''} onChange={(value) => update('phone', value)} type="tel" />
          <Field label="WhatsApp" value={form.whatsapp ?? ''} onChange={(value) => update('whatsapp', value)} type="tel" />
          <Field label="City" value={form.city ?? ''} onChange={(value) => update('city', value)} />
          <Field label="Pincode" value={form.pincode ?? ''} onChange={(value) => update('pincode', value)} inputMode="numeric" />
          <Field label="Google Maps URL" value={form.google_maps_url ?? ''} onChange={(value) => update('google_maps_url', value)} type="url" />
        </div>
        <TextAreaField label="Business address" value={form.address ?? ''} onChange={(value) => update('address', value)} />
        </FormSection>
        <FormSection title="Social links">
          <Field label="Instagram URL" value={form.instagram_url ?? ''} onChange={(value) => update('instagram_url', value)} type="url" />
          <Field label="Facebook URL" value={form.facebook_url ?? ''} onChange={(value) => update('facebook_url', value)} type="url" />
          <Field label="YouTube URL" value={form.youtube_url ?? ''} onChange={(value) => update('youtube_url', value)} type="url" />
          <Field label="LinkedIn URL" value={form.linkedin_url ?? ''} onChange={(value) => update('linkedin_url', value)} type="url" />
          <Field label="Google Business URL" value={form.google_business_url ?? ''} onChange={(value) => update('google_business_url', value)} type="url" />
          <Field label="Other social link" value={form.other_social_url ?? ''} onChange={(value) => update('other_social_url', value)} type="url" />
          <Field label="TikTok URL" value={form.tiktok_url ?? ''} onChange={(value) => update('tiktok_url', value)} type="url" />
          <Field label="X URL" value={form.x_url ?? ''} onChange={(value) => update('x_url', value)} type="url" />
          <Field label="Pinterest URL" value={form.pinterest_url ?? ''} onChange={(value) => update('pinterest_url', value)} type="url" />
        </FormSection>
        <TextAreaField label="Business description" value={form.description ?? ''} onChange={(value) => update('description', value)} />
        {error ? <Notice>{error}</Notice> : null}
        {success ? <Notice kind="success">{success}</Notice> : null}
        <button className={buttonClassName} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
      </form>
    </section>
  );
}

export function ProductsManager() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [form, setForm] = useState<StringFields>(productForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [saving, setSaving] = useState(false);

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
  const reset = () => { setEditingId(null); setForm(productForm()); };
  const edit = (product: ProductRecord) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? '',
      category_id: product.category_id ?? '',
      price: product.price ?? '',
      image: product.image ?? '',
      status: product.status,
      sort_order: String(product.sort_order),
    });
    setSuccess('');
    setError('');
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.price && (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)) {
      setError('Price must be a valid non-negative amount.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
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
      setSuccess(editingId ? 'Product / service updated.' : 'Product / service added.');
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
          <Field label="Name" value={form.name ?? ''} onChange={(value) => update('name', value)} required />
          <SelectField label="Category" value={form.category_id ?? ''} onChange={(value) => update('category_id', value)} options={[{ value: '', label: 'No category' }, ...categories.map((item) => ({ value: item.id, label: item.name }))]} />
          <Field label="Price (₹, optional)" value={form.price ?? ''} onChange={(value) => update('price', value)} type="number" min="0" step="0.01" />
          <Field label="Image URL or path (optional)" value={form.image ?? ''} onChange={(value) => update('image', value)} />
          <SelectField label="Visibility" value={form.status ?? 'ACTIVE'} onChange={(value) => update('status', value)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
          <Field label="Display order" value={form.sort_order ?? '0'} onChange={(value) => update('sort_order', value)} type="number" step="1" />
        </div>
        <div className="mt-4"><TextAreaField label="Description" value={form.description ?? ''} onChange={(value) => update('description', value)} rows={3} /></div>
        <div className="mt-4 flex flex-wrap gap-2"><button className={buttonClassName} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product / service'}</button>{editingId ? <button className={secondaryButtonClassName} type="button" onClick={reset}>Cancel edit</button> : null}</div>
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

export function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [form, setForm] = useState({ name: '', status: 'ACTIVE', sort_order: '0' });
  const [editing, setEditing] = useState<string | null>(null);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [saving, setSaving] = useState(false);
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
  const reset = () => { setEditing(null); setForm({ name: '', status: 'ACTIVE', sort_order: '0' }); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      await apiRequest(`/api/business/categories${editing ? `/${editing}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order || 0) }),
      });
      reset(); await load(); setSuccess(editing ? 'Category updated.' : 'Category created.');
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
  const edit = (category: CategoryRecord) => { setEditing(category.id); setForm({ name: category.name, status: category.status, sort_order: String(category.sort_order) }); setError(''); setSuccess(''); };

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Categories" description="Create clear sections to help visitors browse your products and services." />
      <form onSubmit={save} className="mb-6 grid gap-3 rounded-2xl bg-[#f8f7f3] p-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
        <Field label="Category name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} required />
        <SelectField label="Visibility" value={form.status} onChange={(status) => setForm((current) => ({ ...current, status }))} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
        <Field label="Display order" value={form.sort_order} onChange={(sort_order) => setForm((current) => ({ ...current, sort_order }))} type="number" step="1" />
        <div className="flex gap-2"><button className={buttonClassName} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Add'}</button>{editing ? <button className={secondaryButtonClassName} type="button" onClick={reset}>Cancel</button> : null}</div>
      </form>
      {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}{success ? <div className="mb-4"><Notice kind="success">{success}</Notice></div> : null}
      {loading ? <p className="py-4 text-sm text-[#68746c]">Loading categories…</p> : categories.length === 0 ? <EmptyState title="No categories yet" text="Add a category above to group your products or services." /> : (
        <div className="space-y-3">{categories.map((category) => (
          <article key={category.id} className="flex flex-col gap-3 rounded-xl border border-[#eee9df] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2ee] font-bold text-[#214434]">{category.name.slice(0, 1).toUpperCase()}</div><div><h3 className="font-semibold">{category.name}</h3><p className="text-sm text-[#6d7870]">{products.filter((product) => product.category_id === category.id).length} products · Order {category.sort_order}</p></div><StatusPill active={category.status === 'ACTIVE'} /></div>
            <div className="flex gap-2"><button className={secondaryButtonClassName} onClick={() => edit(category)}>Edit</button><button className={secondaryButtonClassName} onClick={() => void remove(category)}>Delete</button></div>
          </article>
        ))}</div>
      )}
    </section>
  );
}

export function GalleryManager() {
  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [form, setForm] = useState({ image: '', title: '', status: 'ACTIVE', sort_order: '0' });
  const [editing, setEditing] = useState<string | null>(null);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [saving, setSaving] = useState(false);
  const load = async () => {
    setLoading(true); setError('');
    try { const data = await apiRequest<{ gallery: GalleryRecord[] }>('/api/business/gallery'); setItems(data.gallery); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load gallery'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const reset = () => { setEditing(null); setForm({ image: '', title: '', status: 'ACTIVE', sort_order: '0' }); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      await apiRequest(`/api/business/gallery${editing ? `/${editing}` : ''}`, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, sort_order: Number(form.sort_order || 0) }) });
      reset(); await load(); setSuccess(editing ? 'Gallery image updated.' : 'Gallery image added.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save gallery image'); }
    finally { setSaving(false); }
  };
  const remove = async (item: GalleryRecord) => {
    if (!window.confirm(`Delete "${item.title}" from the gallery?`)) return;
    setError(''); setSuccess('');
    try { await apiRequest(`/api/business/gallery/${item.id}`, { method: 'DELETE' }); await load(); setSuccess('Gallery image deleted.'); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete gallery image'); }
  };
  const edit = (item: GalleryRecord) => { setEditing(item.id); setForm({ image: item.image, title: item.title, status: item.status, sort_order: String(item.sort_order) }); setError(''); setSuccess(''); };
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Gallery" description="Add an image URL or path. File upload is not part of this version; the title is also used as image alternative text." />
      <form onSubmit={save} className="mb-6 rounded-2xl bg-[#f8f7f3] p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Image URL or path" value={form.image} onChange={(value) => update('image', value)} required />
          <Field label="Image title / alternative text" value={form.title} onChange={(value) => update('title', value)} required />
          <SelectField label="Visibility" value={form.status} onChange={(value) => update('status', value)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
          <Field label="Display order" value={form.sort_order} onChange={(value) => update('sort_order', value)} type="number" step="1" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><button className={buttonClassName} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save image' : 'Add image'}</button>{editing ? <button className={secondaryButtonClassName} type="button" onClick={reset}>Cancel</button> : null}</div>
      </form>
      {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}{success ? <div className="mb-4"><Notice kind="success">{success}</Notice></div> : null}
      {loading ? <p className="py-4 text-sm text-[#68746c]">Loading gallery…</p> : items.length === 0 ? <EmptyState title="Your gallery is empty" text="Add an image URL or path to show photos on your public website." /> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-[#eee9df]">
            {item.image ? <img src={item.image} alt={item.title} className="h-40 w-full bg-[#f1eee8] object-cover" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /> : <div className="grid h-40 place-items-center bg-[#f1eee8] text-sm text-[#78827b]">No preview available</div>}
            <div className="p-3"><div className="flex items-center justify-between gap-2"><h3 className="truncate font-semibold">{item.title}</h3><StatusPill active={item.status === 'ACTIVE'} /></div><p className="mt-1 text-xs text-[#768078]">Order {item.sort_order}</p><div className="mt-3 flex gap-2"><button className={secondaryButtonClassName} onClick={() => edit(item)}>Edit</button><button className={secondaryButtonClassName} onClick={() => void remove(item)}>Delete</button></div></div>
          </article>
        ))}</div>
      )}
    </section>
  );
}

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const { loading, setLoading, error, setError, success, setSuccess } = useLoadError();
  const [savingId, setSavingId] = useState<string | null>(null);
  const load = async () => {
    setLoading(true); setError('');
    try { const data = await apiRequest<{ enquiries: EnquiryRecord[] }>('/api/business/enquiries'); setEnquiries(data.enquiries); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load enquiries'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
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
        <div className="space-y-3">{enquiries.map((item) => (
          <article key={item.id} className="rounded-xl border border-[#eee9df] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.name}</h3><StatusPill active={item.status !== 'CLOSED'} label={item.status} /></div><p className="mt-1 text-sm text-[#617067]">{item.phone} · {item.email || 'Email not provided'}</p><p className="mt-1 text-xs text-[#8a938d]">{formatDate(item.created_at)}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#374a40]">{item.message}</p></div>
              <label className="shrink-0 text-xs font-semibold text-[#58665e]">Status<select className="mt-1 block min-h-11 rounded-xl border border-[#ded9cd] bg-white px-3 text-sm" value={item.status} disabled={savingId === item.id} onChange={(event) => void changeStatus(item, event.target.value as EnquiryRecord['status'])}><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="CLOSED">Closed</option></select></label>
            </div>
          </article>
        ))}</div>
      )}
    </section>
  );
}

export function SettingsManager({
  initialSettings,
  onSaved,
}: {
  initialSettings: Record<string, string>;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<StringFields>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    setForm({
      whatsapp: initialSettings.whatsapp ?? '',
      call_phone: initialSettings.call_phone ?? '',
      cta_text: initialSettings.cta_text ?? '',
      cta_url: initialSettings.cta_url ?? '',
      contact_email: initialSettings.contact_email ?? '',
      working_hours: initialSettings.working_hours ?? '',
    });
  }, [initialSettings]);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      await apiRequest('/api/business/settings', { method: 'PATCH', body: JSON.stringify(form) });
      await onSaved(); setSuccess('Settings saved. Your public website is updated.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save settings'); }
    finally { setBusy(false); }
  };
  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="Website settings" description="Set contact actions and business hours shown on the public website." />
      <form onSubmit={save} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number" value={form.whatsapp ?? ''} onChange={(value) => update('whatsapp', value)} type="tel" />
          <Field label="Call number" value={form.call_phone ?? ''} onChange={(value) => update('call_phone', value)} type="tel" />
          <Field label="CTA button text" value={form.cta_text ?? ''} onChange={(value) => update('cta_text', value)} placeholder="Contact us" />
          <Field label="CTA link URL" value={form.cta_url ?? ''} onChange={(value) => update('cta_url', value)} type="url" />
          <Field label="Contact email" value={form.contact_email ?? ''} onChange={(value) => update('contact_email', value)} type="email" />
        </div>
        <TextAreaField label="Working hours" value={form.working_hours ?? ''} onChange={(value) => update('working_hours', value)} rows={3} />
        {error ? <Notice>{error}</Notice> : null}{success ? <Notice kind="success">{success}</Notice> : null}
        <button className={buttonClassName} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
      </form>
    </section>
  );
}

export function SeoManager({
  initialSettings,
  onSaved,
}: {
  initialSettings: Record<string, string>;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({ seo_title: '', seo_description: '', og_title: '', og_description: '', og_image: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    setForm({
      seo_title: initialSettings.seo_title ?? '',
      seo_description: initialSettings.seo_description ?? '',
      og_title: initialSettings.og_title ?? '',
      og_description: initialSettings.og_description ?? '',
      og_image: initialSettings.og_image ?? '',
    });
  }, [initialSettings]);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const imageError = !isValidOptionalImageUrl(form.og_image.trim())
    ? 'Use an HTTP(S) image URL or an image path under /uploads.'
    : '';
  const seoTitleError = form.seo_title.length > SEO_TITLE_MAX_LENGTH;
  const seoDescriptionError = form.seo_description.length > SEO_DESCRIPTION_MAX_LENGTH;
  const ogTitleError = form.og_title.length > OG_TITLE_MAX_LENGTH;
  const ogDescriptionError = form.og_description.length > OG_DESCRIPTION_MAX_LENGTH;
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
      await onSaved(); setSuccess('SEO settings saved. Refresh your public website to see the updated metadata and heading.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save SEO settings'); }
    finally { setBusy(false); }
  };
  return (
    <section className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-sm sm:p-6">
      <PanelHeading title="SEO & social preview" description="Set simple search titles and Open Graph text. This does not submit your site to search engines." />
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
        {error ? <Notice>{error}</Notice> : null}{success ? <Notice kind="success">{success}</Notice> : null}
        <button className={buttonClassName} disabled={busy}>{busy ? 'Saving…' : 'Save SEO settings'}</button>
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
