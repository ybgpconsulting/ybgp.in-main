type AnalyticsParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined;
const conversionLabels = {
  whatsapp: import.meta.env.VITE_GOOGLE_ADS_WHATSAPP_LABEL as string | undefined,
  phone: import.meta.env.VITE_GOOGLE_ADS_PHONE_LABEL as string | undefined,
  lead: import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL as string | undefined
};

let initialized = false;

const configuredIds = [measurementId, googleAdsId].filter(Boolean);

const pushToDataLayer = (...args: unknown[]) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

export const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  if (!window.gtag) return;
  window.gtag('event', eventName, params);
};

export const trackConversion = (conversionType: 'whatsapp' | 'phone' | 'lead', params: AnalyticsParams = {}) => {
  const eventName = conversionType === 'whatsapp'
    ? 'whatsapp_click'
    : conversionType === 'phone'
      ? 'phone_call_click'
      : 'lead_form_click';
  const pagePath = window.location.pathname;
  const landingPage = pagePath === '/business-website/' ? 'business_website' : 'general_site';

  trackEvent(eventName, { ...params, page_path: pagePath, landing_page: landingPage });

  if (pagePath === '/business-website/') {
    trackEvent(`website_offer_${eventName}`, { ...params, page_path: pagePath });
  }

  const label = conversionLabels[conversionType];
  if (googleAdsId && label) {
    trackEvent('conversion', {
      send_to: `${googleAdsId}/${label}`,
      value: conversionType === 'lead' ? 1 : undefined,
      currency: 'INR',
      ...params
    });
  }
};

const trackOutboundClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  const link = target?.closest<HTMLAnchorElement>('a[href]');
  if (!link) return;

  const href = link.href;
  const params = { link_url: href, link_text: link.textContent?.trim() || 'unknown' };

  if (href.startsWith('https://wa.me/')) {
    trackConversion('whatsapp', params);
  } else if (href.startsWith('tel:')) {
    trackConversion('phone', params);
  } else if (href.includes('forms.gle/') || href.includes('docs.google.com/forms/')) {
    trackConversion('lead', params);
  }
};

export const initializeAnalytics = () => {
  if (initialized || configuredIds.length === 0) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => pushToDataLayer(...args));
  pushToDataLayer('js', new Date());

  configuredIds.forEach((id) => {
    window.gtag?.('config', id, { send_page_view: id === measurementId });
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(configuredIds[0])}`;
  document.head.appendChild(script);
  document.addEventListener('click', trackOutboundClick, true);
};

export {};
