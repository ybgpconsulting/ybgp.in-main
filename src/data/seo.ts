import { PROJECTS } from './projects';
import {
  ROUTE_METADATA,
  ROUTE_SLUGS,
  SECTION_ROUTES,
  SERVICE_PAGES,
} from './servicePages';

export interface SeoRoute {
  slug: string;
  title: string;
  description: string;
  canonicalPath: string;
  indexable: boolean;
  heading: string;
  content: string;
}

const noindexRoutes = new Set([
  'websites',
  'website-development-company-gurugram',
  'digital-marketing-agency-ghaziabad',
  ...PROJECTS
    .filter((project) => project.sampleTemplate)
    .map((project) => `work/${project.slug}`),
]);

const sectionHeadings: Record<string, string> = {
  work: 'Selected Work',
  websites: 'YBGP Websites',
  'business-website': 'YBGP Websites',
  about: 'About YBGP',
  services: 'Business Consulting Services',
  process: 'Our Business Growth Process',
  contact: 'Contact YBGP',
  'why-choose-us': 'Why Choose YBGP',
};

const getRouteDetails = (slug: string): Omit<SeoRoute, 'canonicalPath' | 'indexable'> => {
  const service = SERVICE_PAGES.find((page) => page.slug === slug);
  if (service) {
    return {
      slug,
      title: service.title,
      description: service.description,
      heading: service.shortName,
      content: service.intro,
    };
  }

  const project = PROJECTS.find((item) => `work/${item.slug}` === slug);
  if (project) {
    return {
      slug,
      title: project.seo.title,
      description: project.seo.description,
      heading: project.name,
      content: project.description,
    };
  }

  const metadata = ROUTE_METADATA[slug as keyof typeof ROUTE_METADATA] ?? ROUTE_METADATA.home;
  const isHome = slug === 'home';
  return {
    slug,
    title: metadata.title,
    description: metadata.description,
    heading: isHome ? 'Your Business Growth Partner' : sectionHeadings[slug] ?? metadata.title,
    content: metadata.description,
  };
};

export const getSeoRoute = (slug: string): SeoRoute => {
  const details = getRouteDetails(slug);
  const canonicalPath = slug === 'home'
    ? '/'
    : slug === 'websites' || slug === 'business-website'
      ? '/business-website/'
      : `/${slug}/`;

  return {
    ...details,
    canonicalPath,
    indexable: !noindexRoutes.has(slug),
  };
};

export const SEO_ROUTES = ROUTE_SLUGS.map((slug) => getSeoRoute(slug));
export const INDEXABLE_SEO_ROUTES = SEO_ROUTES.filter((route) =>
  route.indexable && route.slug !== 'websites'
);

export const PRIVATE_SEO_ROUTES = [
  { path: 'websites/admin', title: 'Websites Admin | YBGP' },
  { path: 'websites/dashboard', title: 'Website Dashboard | YBGP' },
  { path: 'websites/demo-bakery', title: 'Aroma & Crumb Bakery Website Demo | YBGP' },
  { path: 'websites/demo-salon', title: 'Maison Gloss Salon Website Demo | YBGP' },
  { path: 'websites/demo-jewellery', title: 'Silver Elara Jewellery Website Demo | YBGP' },
  { path: 'websites/demo-modern', title: 'Willow & Stone Modern Business Website Demo | YBGP' },
  { path: 'websites/demo-clinic', title: 'Apex Healthcare Clinic Website Demo | YBGP' },
  { path: 'websites/demo-astrology', title: 'Nakshatra Vani Astrology Website Demo | YBGP' },
  { path: 'websites/demo-travel', title: 'Wanderlust India Tours & Cabs Website Demo | YBGP' },
] as const;

export const getSectionRoute = (slug: string) =>
  SECTION_ROUTES[slug as keyof typeof SECTION_ROUTES];
