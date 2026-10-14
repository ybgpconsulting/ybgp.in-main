import { lazy, Suspense, useEffect, useState } from 'react';
import { PublicWebsiteRenderer, type BusinessWebsiteResponse } from './PublicWebsiteRenderer';

const BusinessWebsitePage = lazy(() => import('../BusinessWebsitePage').then((module) => ({ default: module.BusinessWebsitePage })));
const showcaseSlugs = ['demo-bakery', 'demo-salon', 'demo-jewellery'];

export function WebsiteRoute({ slug }: { slug: string }) {
  const [state, setState] = useState<'checking' | 'tenant' | 'showcase' | 'other'>('checking');
  const [tenant, setTenant] = useState<BusinessWebsiteResponse | null>(null);

  useEffect(() => {
    if (showcaseSlugs.includes(slug)) {
      setState('showcase');
      setTenant(null);
      return;
    }

    setState('checking');
    const controller = new AbortController();
    const resolveRoute = async () => {
      let response: Response;
      try {
        response = await fetch(`/api/public/websites/${encodeURIComponent(slug)}`, { signal: controller.signal });
      } catch {
        if (!controller.signal.aborted) setState('other');
        return;
      }

      if (response.ok) {
        try {
          setTenant(await response.json() as BusinessWebsiteResponse);
          setState('tenant');
        } catch {
          if (!controller.signal.aborted) setState('other');
        }
        return;
      }

      setState('other');
    };
    void resolveRoute();
    return () => controller.abort();
  }, [slug]);

  if (state === 'checking') {
    return <main className="grid min-h-screen place-items-center bg-[#f7f5f2] text-[#0E2B22]"><p role="status">Loading website…</p></main>;
  }
  if (state === 'tenant' && tenant) {
    return <PublicWebsiteRenderer slug={slug} initialData={tenant} />;
  }
  if (state === 'showcase') {
    return <ShowcaseFallback slug={slug} />;
  }
  return <PublicWebsiteRenderer slug={slug} />;
}

function ShowcaseFallback({ slug }: { slug: string }) {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><BusinessWebsitePage demoSlug={slug} /></Suspense>;
}
