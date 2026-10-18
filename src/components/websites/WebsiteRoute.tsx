import { lazy, Suspense, useEffect, useState } from 'react';
import { PublicWebsiteRenderer, type BusinessWebsiteResponse } from './PublicWebsiteRenderer';

const BusinessWebsitePage = lazy(() => import('../BusinessWebsitePage').then((module) => ({ default: module.BusinessWebsitePage })));
const showcaseSlugs = ['demo-modern', 'demo-bakery', 'demo-salon', 'demo-jewellery'];

export function WebsiteRoute({ slug }: { slug: string }) {
  const [state, setState] = useState<'checking' | 'tenant' | 'showcase' | 'unavailable'>('checking');
  const [tenant, setTenant] = useState<BusinessWebsiteResponse | null>(null);
  const isShowcaseSlug = showcaseSlugs.includes(slug);

  useEffect(() => {
    setState('checking');
    setTenant(null);
    if (isShowcaseSlug) {
      setState('showcase');
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
  }, [isShowcaseSlug, slug]);

  useEffect(() => {
    if (state === 'showcase') {
      document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex');
    } else if (state === 'tenant') {
      document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'index, follow');
    }
  }, [state]);

  if (state === 'showcase') {
    return <Suspense fallback={<div className="min-h-screen bg-white" />}><BusinessWebsitePage demoSlug={slug} /></Suspense>;
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
