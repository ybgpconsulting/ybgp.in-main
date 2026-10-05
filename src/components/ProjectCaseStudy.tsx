import React, { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, ExternalLink, Layers3, MonitorSmartphone, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { trackEvent } from '../analytics';
import { PROJECTS, type Project } from '../data/projects';
import { SITE_DATA } from '../data/siteData';
import { Reveal } from './Reveal';

interface ProjectCaseStudyProps {
  project: Project;
}

const getRelatedProjects = (project: Project) => {
  const preferred = project.relatedProjects
    .map((slug) => PROJECTS.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is Project => Boolean(candidate) && candidate.slug !== project.slug);

  const fallback = PROJECTS.filter((candidate) => candidate.slug !== project.slug && !preferred.some((item) => item.slug === candidate.slug));
  return [...preferred, ...fallback].slice(0, 3);
};

export const ProjectCaseStudy: React.FC<ProjectCaseStudyProps> = ({ project }) => {
  const prefersReducedMotion = useReducedMotion();
  const relatedProjects = getRelatedProjects(project);

  useEffect(() => {
    trackEvent('project_view', {
      project_name: project.name,
      project_slug: project.slug,
      project_type: project.projectType,
      project_status: project.status
    });
  }, [project]);

  const openLiveSite = () => {
    if (!project.liveUrl) return;
    trackEvent('project_live_site_click', {
      project_name: project.name,
      project_slug: project.slug,
      project_live_url: project.liveUrl
    });
    window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
  };

  const openConsultation = () => {
    const formUrl = SITE_DATA.googleFormUrl || `https://wa.me/${SITE_DATA.phoneRaw}?text=${encodeURIComponent(SITE_DATA.whatsappPrefilledMessage)}`;
    trackEvent('project_cta_click', {
      project_name: project.name,
      project_slug: project.slug,
      cta_type: 'consultation'
    });
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${SITE_DATA.phoneRaw}?text=${encodeURIComponent(`Hello YBGP, I am interested in a project like ${project.name}.`)}`;
    trackEvent('project_whatsapp_click', {
      project_name: project.name,
      project_slug: project.slug
    });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#F7F7F7] text-[#1E1E1E]">
      <section className="relative isolate overflow-hidden bg-[#071b14] px-4 pb-16 pt-28 text-white sm:px-6 sm:pb-20 lg:px-8 lg:pt-32">
        <div aria-hidden="true" className="absolute inset-0 opacity-20 portfolio-noise" />
        <div aria-hidden="true" className="absolute -right-28 -top-32 h-[26rem] w-[26rem] rounded-full border border-[#C89B2B]/20 bg-[#C89B2B]/[0.06] shadow-[0_0_100px_rgba(200,155,43,0.08)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <a href="/work/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#D7CBA4] transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to work
            </a>
            <span className="rounded-full border border-[#C89B2B]/35 bg-[#C89B2B]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F2E6B6]">
              {project.badge}
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D7CBA4]">{project.category}</p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[0.9] tracking-[-0.06em] text-white font-heading sm:text-5xl lg:text-6xl">
                {project.name}
              </h1>
              {project.fullName && <p className="mt-3 text-base text-white/70 sm:text-lg">{project.fullName}</p>}
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{project.description}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={project.liveUrl || '/work/'}
                  target={project.liveUrl ? '_blank' : undefined}
                  rel={project.liveUrl ? 'noopener noreferrer' : undefined}
                  onClick={project.liveUrl ? openLiveSite : undefined}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C89B2B] px-5 py-3 text-sm font-semibold text-[#0E2B22] shadow-[0_12px_25px_rgba(200,155,43,0.18)] transition-transform hover:-translate-y-0.5"
                >
                  {project.isLive ? 'Visit Live Website' : 'Project Preview'}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={openConsultation}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Talk to YBGP
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="soft-panel relative overflow-hidden rounded-[26px] border border-white/10 bg-[#F7F7F7] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:p-3">
                <div className="mb-2 flex items-center gap-1.5 border-b border-[#E9E9E9] px-2 pb-2 sm:px-3 sm:pb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D9968B]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D8BD72]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#9DBDA6]" />
                  <span className="ml-2 min-w-0 flex-1 truncate rounded-sm bg-[#F2F4F2] px-2 py-1 text-[9px] text-[#67756F] uppercase tracking-[0.12em] sm:text-[10px]">
                    {project.liveUrl ? project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '/work/' + project.slug}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#5F6B66]" aria-hidden="true" />
                </div>
                <img src={project.image} alt={project.imageAlt || `${project.name} preview`} className="h-full w-full rounded-[16px] object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-[#E5E5E2] bg-white p-5 shadow-[0_20px_60px_rgba(14,43,34,0.04)] sm:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ['Industry', project.industry],
              ['Project Type', project.projectType],
              ['Ownership', project.ownership],
              ['Status', project.status],
              ['Services', project.services.slice(0, 2).join(' / ')]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[#F7F7F4] p-4 border border-[#E8E8E3]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7B867D]">{label}</p>
                <p className="mt-3 text-sm font-semibold text-[#0E2B22] sm:text-base">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <Reveal delay={0.05} duration={0.55}>
            <div className="soft-panel rounded-[26px] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">The business / project</p>
              <h2 className="mt-4 text-2xl font-bold leading-tight text-[#0E2B22] font-heading sm:text-3xl">What the business needed</h2>
              <p className="mt-4 leading-relaxed text-[#1E1E1E]/75">{project.solution}</p>
            </div>
          </Reveal>

          <Reveal delay={0.1} duration={0.55}>
            <div className="soft-panel rounded-[26px] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">The challenge</p>
              <h2 className="mt-4 text-2xl font-bold leading-tight text-[#0E2B22] font-heading sm:text-3xl">The problem or requirement</h2>
              <p className="mt-4 leading-relaxed text-[#1E1E1E]/75">{project.challenge}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#C89B2B]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">What YBGP did</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {project.services.map((service, index) => (
              <Reveal key={service} delay={index * 0.04} duration={0.5}>
                <div className="soft-panel h-full rounded-[22px] border border-[#E9E9E9] p-5">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0E2B22] text-[#F5E7B8]">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0E2B22]">{service}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-[#E7E7E3] bg-white p-6 shadow-[0_20px_60px_rgba(14,43,34,0.04)] sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-[#C89B2B]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">How it works</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {project.workflow.map((step, index) => (
              <div key={`${step}-${index}`} className="flex items-center gap-3 sm:flex-col sm:items-start xl:flex-row xl:items-center">
                <div className="flex items-center gap-3 xl:flex-row">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0E2B22] text-sm font-bold text-white">{index + 1}</div>
                  {index < project.workflow.length - 1 && <ChevronRight className="hidden h-5 w-5 text-[#B8A66D] xl:block" aria-hidden="true" />}
                </div>
                <p className="text-sm font-semibold text-[#0E2B22] sm:text-base">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <MonitorSmartphone className="h-5 w-5 text-[#C89B2B]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">See it in action</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="soft-panel rounded-[26px] p-3 sm:p-4">
              <div className="overflow-hidden rounded-[18px] border border-[#E9E9E9] bg-white p-2 sm:p-3">
                <div className="mb-2 flex items-center gap-1.5 border-b border-[#E9E9E9] px-1 pb-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D9968B]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D8BD72]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#9DBDA6]" />
                </div>
                <img src={project.image} alt={`${project.name} website preview`} className="w-full rounded-[12px] object-cover" />
              </div>
            </div>

            <div className="soft-panel rounded-[26px] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0E2B22]">Mobile experience</p>
              <div className="mt-5 flex justify-center">
                <div className="w-[220px] rounded-[28px] border-[7px] border-[#0E2B22] bg-[#F3F1E8] p-2 shadow-[0_22px_55px_rgba(14,43,34,0.18)]">
                  <img src={project.image} alt={`${project.name} mobile preview`} className="h-[400px] w-full rounded-[18px] object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#C89B2B]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">Key features</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {project.features.map((feature, index) => (
              <Reveal key={feature} delay={index * 0.04} duration={0.5}>
                <div className="rounded-[22px] border border-[#EAEAE5] bg-white p-5 shadow-[0_12px_38px_rgba(14,43,34,0.03)]">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5E7B8] text-[#0E2B22]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-[#0E2B22]">{feature}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {project.panels && (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[30px] bg-[#0E2B22] p-6 text-white shadow-[0_30px_80px_rgba(14,43,34,0.2)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D7CBA4]">Business management</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight font-heading sm:text-4xl">Platform roles and panels</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {project.panels.map((panel) => (
                <div key={panel} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <p className="text-base font-semibold text-white">{panel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#C89B2B]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">Visual walkthrough</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {project.screenshots.map((shot) => (
              <div key={`${shot.title}-${shot.group}`} className="soft-panel overflow-hidden rounded-[24px] p-3">
                <img src={shot.src} alt={shot.title} className="h-56 w-full rounded-[16px] object-cover sm:h-64" />
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B867D]">{shot.group}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#0E2B22]">{shot.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1E1E1E]/70">{shot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-[#E7E7E3] bg-[#F3F1E8] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6A1E]">{project.isLive ? 'Experience the live website' : 'Project Preview'}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0E2B22] font-heading sm:text-4xl">{project.isLive ? 'See the project in its live environment' : 'View the project concept'}</h2>
            </div>
            <a
              href={project.liveUrl || '/work/'}
              target={project.liveUrl ? '_blank' : undefined}
              rel={project.liveUrl ? 'noopener noreferrer' : undefined}
              onClick={project.liveUrl ? openLiveSite : undefined}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#0E2B22] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {project.isLive ? 'Visit Live Website' : 'View Project'}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-[#E7E7E3] bg-white p-6 shadow-[0_20px_60px_rgba(14,43,34,0.04)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">Project status</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0E2B22] font-heading sm:text-4xl">{project.status}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {[project.badge, project.ownership, project.projectType].map((item) => (
                <span key={item} className="rounded-full border border-[#D8DCD8] bg-[#F7F7F7] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#465A51] sm:text-[11px]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6A1E]">Explore more work</p>
            <a href="/work/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E2B22] hover:text-[#8A6A1E]">
              View all projects <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedProjects.map((item) => (
              <a key={item.slug} href={`/work/${item.slug}/`} className="group block overflow-hidden rounded-[24px] border border-[#E8E7E4] bg-white shadow-[0_20px_50px_rgba(14,43,34,0.04)] transition-all hover:-translate-y-1 hover:border-[#C89B2B]">
                <div className="overflow-hidden border-b border-[#EDEDE8]">
                  <img src={item.image} alt={item.imageAlt || item.name} className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A6A1E]">{item.badge}</p>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-[#0E2B22] font-heading">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1E1E1E]/70">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0E2B22]">
                    View Case Study <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#E9EDE7] px-4 pb-20 pt-16 sm:px-6 sm:pb-24 lg:px-8">
        <div aria-hidden="true" className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#C89B2B]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6A1E]">YBGP</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#0E2B22] font-heading sm:text-4xl">Have a business idea or need a better digital presence?</h2>
              <p className="mt-3 text-base leading-relaxed text-[#1E1E1E]/75">Let's build something practical for your business.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={openWhatsApp} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0E2B22] px-5 py-3 text-sm font-semibold text-[#0E2B22] transition-colors hover:bg-[#0E2B22] hover:text-white">
                WhatsApp YBGP
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={openConsultation} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0E2B22] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(14,43,34,0.2)] transition-transform hover:-translate-y-0.5">
                Talk to YBGP
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
