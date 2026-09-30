import React, { useState } from 'react';
import { ArrowUpRight, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { PROJECTS, type Project } from '../data/projects';
import { SITE_DATA } from '../data/siteData';
import { Reveal } from './Reveal';

const QueuePreview: React.FC = () => (
  <div className="grid h-full min-h-[250px] grid-cols-[1.05fr_0.95fr] gap-3 bg-[#F2F5F7] p-4 sm:min-h-[390px] sm:gap-5 sm:p-7">
    <div className="flex flex-col justify-between rounded-md bg-white p-4 shadow-sm sm:p-6">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#267B87] sm:text-xs">Today's flow</p>
        <p className="mt-2 text-sm font-semibold text-[#152A35] sm:text-xl">Smart Queue</p>
      </div>
      <div className="mt-5 border-l-2 border-[#2A8790] pl-3 sm:pl-4">
        <p className="text-[9px] uppercase tracking-[0.12em] text-[#7C8B93] sm:text-[10px]">Now serving</p>
        <p className="mt-1 text-3xl font-bold leading-none text-[#152A35] sm:text-5xl">A-104</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-[#F2F5F7] p-2 sm:p-3"><p className="text-[8px] uppercase text-[#7C8B93] sm:text-[9px]">Waiting</p><p className="mt-1 text-lg font-semibold text-[#152A35] sm:text-2xl">08</p></div>
        <div className="bg-[#F2F5F7] p-2 sm:p-3"><p className="text-[8px] uppercase text-[#7C8B93] sm:text-[9px]">Avg. wait</p><p className="mt-1 text-lg font-semibold text-[#152A35] sm:text-2xl">12m</p></div>
      </div>
    </div>
    <div className="flex flex-col gap-2 sm:gap-3">
      <div className="flex items-center justify-between rounded-md bg-[#152A35] p-3 text-white sm:p-4">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px]">Queue live</span>
        <span className="h-2 w-2 rounded-full bg-[#5DC5A2]" />
      </div>
      <div className="flex-1 rounded-md bg-white p-3 shadow-sm sm:p-4">
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#7C8B93] sm:text-[9px]">Room 02</p>
        {['A-101', 'A-102', 'A-103'].map((token, index) => (
          <div key={token} className="flex items-center justify-between border-b border-[#EDF0F2] py-3 last:border-0 sm:py-4">
            <span className="text-[10px] font-semibold text-[#152A35] sm:text-xs">Token {token}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-[#5DC5A2]' : 'bg-[#C8D3D8]'}`} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProjectVisual: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const previewLabel = project.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${project.name} live site in a new tab`}
      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#C89B2B] focus-visible:ring-offset-4"
      style={{ perspective: 1200 }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`relative rounded-lg border border-[#D8DCD8] bg-white p-2 shadow-[0_18px_48px_rgba(14,43,34,0.12)] transition-shadow duration-500 group-hover:shadow-[0_26px_58px_rgba(14,43,34,0.17)] sm:p-3 ${project.isApplication ? 'ring-1 ring-[#0E2B22]/10' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
        whileHover={prefersReducedMotion ? undefined : { rotateX: 1.3, rotateY: index % 2 ? -1.2 : 1.2, scale: 1.012 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex h-8 items-center gap-1.5 border-b border-[#ECEEEC] px-2 sm:h-10 sm:px-3">
          <span className="h-2 w-2 rounded-full bg-[#D9968B] sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#D8BD72] sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#9DBDA6] sm:h-2.5 sm:w-2.5" />
          <span className="ml-2 min-w-0 flex-1 truncate rounded-sm bg-[#F4F5F3] px-2 py-1 text-[8px] text-[#737B76] sm:ml-4 sm:px-3 sm:text-[10px]">{previewLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#7C867F] sm:h-4 sm:w-4" aria-hidden="true" />
        </div>
        <div className={`relative isolate aspect-[1.38] overflow-hidden bg-[#EEF1EC] ${project.isApplication ? 'sm:aspect-[1.5]' : ''}`}>
          {project.preview === 'queue' ? (
            <QueuePreview />
          ) : project.preview === 'unavailable' ? (
            <div className="flex h-full min-h-[250px] flex-col items-center justify-center bg-[#E9EDE7] px-6 text-center sm:min-h-[390px]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#707B74]">Cortek Enterprises</span>
              <span className="mt-3 font-heading text-2xl font-bold text-[#0E2B22] sm:text-4xl">Business management platform</span>
              <span className="mt-5 border border-[#C7CEC7] px-3 py-2 text-xs text-[#59645C]">Live preview currently unavailable</span>
            </div>
          ) : imageUnavailable ? (
            <div className="flex h-full min-h-[250px] items-center justify-center bg-[#E9EDE7] px-6 text-center sm:min-h-[390px]">
              <span className="font-heading text-2xl font-bold text-[#0E2B22] sm:text-4xl">{project.name}</span>
            </div>
          ) : (
            <img
              src={project.image}
              alt={project.imageAlt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setImageUnavailable(true)}
              className={`h-full w-full object-cover transition-transform duration-500 ${prefersReducedMotion ? '' : 'group-hover:scale-[1.025]'} ${project.id === 'ybgp' ? 'object-center' : ''}`}
            />
          )}
          {project.ownWork && <span className="absolute left-3 top-3 z-10 bg-[#0E2B22] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white sm:left-5 sm:top-5 sm:px-3 sm:text-[9px]">Our own work</span>}
          {project.isApplication && <span className="absolute right-3 top-3 z-10 bg-[#0E2B22] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white sm:right-5 sm:top-5 sm:px-3 sm:text-[9px]">Web application</span>}
        </div>
      </motion.div>
    </motion.a>
  );
};

export const Work: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="bg-[#F7F7F7] text-[#1E1E1E]">
    <section id="work" aria-labelledby="work-heading" className="bg-[#0E2B22] px-4 pb-12 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8CBA4]">Selected projects</p>
        <h1 id="work-heading" className="mt-4 text-5xl font-extrabold leading-none font-heading sm:text-7xl">OUR WORK</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">Digital experiences we've designed, built and brought to life.</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#D8CBA4] sm:text-sm">We don't just advise. We build.</p>
      </div>
    </section>

    <section aria-label="Selected projects" className="px-4 sm:px-6">
      <div className="mx-auto max-w-7xl divide-y divide-[#DCDCD6]">
        {PROJECTS.map((project, index) => {
          const imageColumn = index % 2 === 0 ? 'lg:col-start-2' : 'lg:col-start-1';
          const infoColumn = index % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-2';

          return (
            <Reveal key={project.id} delay={index === 0 ? 0 : 0.04} duration={0.55}>
              <article className={`grid gap-6 py-12 sm:gap-8 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-x-14 ${project.isApplication ? 'lg:py-20' : ''}`}>
                <div className={`order-1 flex flex-col items-start ${infoColumn} lg:row-start-1`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-[#8A6A1E]">{project.number}</span>
                    {project.ownWork && <span className="border border-[#D8DCD8] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#56645A]">Built by us, for us</span>}
                    {project.isApplication && <span className="border border-[#D8DCD8] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#56645A]">Digital product</span>}
                  </div>
                  <h2 className="mt-4 text-3xl font-bold leading-tight text-[#0E2B22] font-heading sm:text-4xl lg:text-5xl">{project.name}</h2>
                  {project.fullName && <p className="mt-2 text-sm font-medium text-[#59645C] sm:text-base">{project.fullName}</p>}
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#8A6A1E] sm:text-sm">{project.category}</p>
                </div>
                <div className={`order-2 ${imageColumn} lg:row-span-2`}>
                  <ProjectVisual project={project} index={index} />
                </div>
                <div className={`order-3 flex flex-col items-start ${infoColumn} lg:row-start-2`}>
                  <p className="mt-5 max-w-xl leading-relaxed text-[#1E1E1E]/75 sm:text-lg">{project.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.name} project tags`}>
                    {project.tags.map((tag) => <li key={tag} className="border border-[#D8DCD8] px-2.5 py-1 text-[10px] font-medium text-[#59645C] sm:text-xs">{tag}</li>)}
                  </ul>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link mt-7 inline-flex min-h-11 items-center gap-2 border-b border-[#C89B2B] pb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#0E2B22] outline-none transition-colors hover:text-[#8A6A1E] focus-visible:ring-2 focus-visible:ring-[#C89B2B] focus-visible:ring-offset-4 sm:text-sm"
                  >
                    View live {project.isApplication ? 'project' : 'site'}
                    <ArrowUpRight className={`h-4 w-4 transition-transform duration-300 ${prefersReducedMotion ? '' : 'group-hover/link:translate-x-1 group-hover/link:-translate-y-1'}`} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>

    <section className="bg-[#E9EDE7] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6A1E]">Your next chapter</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#0E2B22] font-heading sm:text-4xl">Have a challenge worth solving?</h2>
          <p className="mt-3 leading-relaxed text-[#1E1E1E]/70">Tell us where you want to go. We'll help you identify a practical way to get there.</p>
        </div>
        <a href={SITE_DATA.googleFormUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 self-start bg-[#0E2B22] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#164537] md:self-auto">
          Start a conversation <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
    </div>
  );
};