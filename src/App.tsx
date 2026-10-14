import React, { Suspense, lazy, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { WebsitesAdminDashboard } from './components/websites/WebsitesAdminDashboard';
import { WebsitesOwnerDashboard } from './components/websites/WebsitesOwnerDashboard';
import { PublicWebsiteRenderer } from './components/websites/PublicWebsiteRenderer';
import { WebsiteRoute } from './components/websites/WebsiteRoute';
import { SITE_DATA } from './data/siteData';
import { getServicePage, SECTION_ROUTES } from './data/servicePages';
import { getProjectBySlug } from './data/projects';

const About = lazy(() => import('./components/About').then((module) => ({ default: module.About })));
const Services = lazy(() => import('./components/Services').then((module) => ({ default: module.Services })));
const Process = lazy(() => import('./components/Process').then((module) => ({ default: module.Process })));
const WhyChooseUs = lazy(() => import('./components/WhyChooseUs').then((module) => ({ default: module.WhyChooseUs })));
const Contact = lazy(() => import('./components/Contact').then((module) => ({ default: module.Contact })));
const BusinessWebsitePage = lazy(() => import('./components/BusinessWebsitePage').then((module) => ({ default: module.BusinessWebsitePage })));
const ServicePage = lazy(() => import('./components/ServicePage').then((module) => ({ default: module.ServicePage })));
const SectionPage = lazy(() => import('./components/SectionPage').then((module) => ({ default: module.SectionPage })));
const Work = lazy(() => import('./components/Work').then((module) => ({ default: module.Work })));
const ProjectCaseStudy = lazy(() => import('./components/ProjectCaseStudy').then((module) => ({ default: module.ProjectCaseStudy })));

export default function App() {
  const routeSlug = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const servicePage = getServicePage(routeSlug);
  const projectSlug = routeSlug.startsWith('work/') ? routeSlug.replace(/^work\//, '') : null;
  const project = projectSlug ? getProjectBySlug(projectSlug) : null;
  const websiteRouteSlug = routeSlug.startsWith('websites/') ? routeSlug.replace(/^websites\//, '') : null;
  const isWebsitesAdmin = routeSlug === 'websites/admin';
  const isWebsitesDashboard = routeSlug === 'websites/dashboard';
  const demoWebsiteSlug = websiteRouteSlug && ['demo-bakery', 'demo-salon', 'demo-jewellery'].includes(websiteRouteSlug) ? websiteRouteSlug : null;
  const isHome = routeSlug === '' || routeSlug === 'index.html';
  const isWebsitesPage = routeSlug === 'websites' || routeSlug === 'business-website';
  const sectionPage = SECTION_ROUTES[routeSlug as keyof typeof SECTION_ROUTES];

  useEffect(() => {
    if (project) {
      document.title = project.seo.title;
      document.head.querySelector('meta[name="description"]')?.setAttribute('content', project.seo.description);
      document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'index, follow');
      return;
    }

    if (demoWebsiteSlug) {
      document.title = 'Demo Business Website | YBGP Websites';
      document.head.querySelector('meta[name="description"]')?.setAttribute('content', 'A sample business website created with the YBGP Websites V1 product flow.');
      document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex');
      return;
    }

    if (isWebsitesAdmin || isWebsitesDashboard) {
      document.title = isWebsitesAdmin ? 'Websites Admin | YBGP' : 'Website Dashboard | YBGP';
      document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex');
      return;
    }

    if (sectionPage) {
      document.title = sectionPage.title;
      document.head.querySelector('meta[name="description"]')?.setAttribute('content', sectionPage.description);
      return;
    }

    if (servicePage || isHome) return;

    document.title = 'Page Not Found | YBGP';
    document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex');
  }, [demoWebsiteSlug, isWebsitesAdmin, isWebsitesDashboard, isHome, sectionPage, servicePage, project]);

  if (project) {
    const handleOpenConsultation = () => {
      const formUrl = SITE_DATA.googleFormUrl || `https://wa.me/${SITE_DATA.phoneRaw}?text=${encodeURIComponent(SITE_DATA.whatsappPrefilledMessage)}`;
      window.open(formUrl, '_blank', 'noopener,noreferrer');
    };

    return (
      <Suspense fallback={<div className="min-h-screen bg-white" /> }>
        <SectionPage onOpenConsultationModal={handleOpenConsultation}>
          <ProjectCaseStudy project={project} />
        </SectionPage>
      </Suspense>
    );
  }

  if (servicePage) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-white" /> }>
        <ServicePage page={servicePage} />
      </Suspense>
    );
  }

  if (isWebsitesAdmin) {
    return <WebsitesAdminDashboard />;
  }

  if (isWebsitesDashboard) {
    return <WebsitesOwnerDashboard />;
  }

  if (demoWebsiteSlug) {
    return <WebsiteRoute slug={demoWebsiteSlug} />;
  }

  if (websiteRouteSlug && !isWebsitesAdmin && !isWebsitesDashboard) {
    return <PublicWebsiteRenderer slug={websiteRouteSlug} />;
  }

  if (sectionPage) {
    const handleOpenConsultation = () => {
      const formUrl = SITE_DATA.googleFormUrl || `https://wa.me/${SITE_DATA.phoneRaw}?text=${encodeURIComponent(SITE_DATA.whatsappPrefilledMessage)}`;
      window.open(formUrl, '_blank', 'noopener,noreferrer');
    };

    return (
      <Suspense fallback={<div className="min-h-screen bg-white" /> }> 
        <SectionPage onOpenConsultationModal={handleOpenConsultation}>
          {isWebsitesPage && <BusinessWebsitePage />}
          {routeSlug === 'work' && <Work />}
          {routeSlug === 'about' && <About />}
          {routeSlug === 'services' && <Services />}
          {routeSlug === 'process' && <Process />}
          {routeSlug === 'why-choose-us' && <WhyChooseUs />}
          {routeSlug === 'contact' && <Contact onOpenConsultationModal={handleOpenConsultation} />}
        </SectionPage>
      </Suspense>
    );
  }

  if (!isHome) {
    return (
      <main className="min-h-screen bg-white text-[#0E2B22] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C89B2B]">404</p>
        <h1 className="mt-4 text-4xl font-extrabold font-heading">Page not found</h1>
        <a href="/" className="mt-8 bg-[#0E2B22] text-white px-6 py-3 rounded-full font-semibold">Return to YBGP</a>
      </main>
    );
  }

  const handleOpenConsultation = () => {
    const formUrl = SITE_DATA.googleFormUrl || `https://wa.me/${SITE_DATA.phoneRaw}?text=${encodeURIComponent(
      SITE_DATA.whatsappPrefilledMessage
    )}`;
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="site-shell min-h-screen text-[#1E1E1E] flex flex-col font-sans selection:bg-[#C89B2B] selection:text-white">
      {/* Sticky Header Navigation */}
      <Navbar onOpenConsultationModal={handleOpenConsultation} />

      {/* Main One-Page Section Architecture */}
      <main className="flex-grow">
        <Hero onOpenConsultationModal={handleOpenConsultation} />
      </main>

      {/* Corporate Footer */}
      <Footer />

      {/* Fixed WhatsApp CTA Button */}
      <WhatsAppButton />
    </div>
  );
}
