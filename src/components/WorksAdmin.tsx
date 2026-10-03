import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Plus, ShieldCheck } from 'lucide-react';
import { PROJECTS, type StoredProject } from '../data/projects';

interface AdminProject extends StoredProject {
  id: string;
}

const initialForm = {
  name: '',
  fullName: '',
  category: '',
  description: '',
  image: '',
  imageAlt: '',
  url: '',
  tags: '',
  ownWork: false,
  isApplication: false,
  sampleTemplate: false,
};

const fieldClassName = 'mt-2 w-full rounded-lg border border-[#D8DCD8] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none transition focus:border-[#C89B2B] focus:ring-2 focus:ring-[#C89B2B]/20';
const labelClassName = 'block text-sm font-semibold text-[#0E2B22]';

export const WorksAdmin: React.FC = () => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProjects = async () => {
    const response = await fetch('/api/works');
    const result = await response.json() as { projects?: AdminProject[]; error?: string };
    if (!response.ok || !Array.isArray(result.projects)) {
      throw new Error(result.error || 'Could not load published work.');
    }
    setProjects(result.projects);
  };

  useEffect(() => {
    document.title = 'Works Admin | YBGP';
    loadProjects()
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load published work.'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.currentTarget;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (event.currentTarget as HTMLInputElement).checked : value,
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const response = await fetch('/api/admin/works', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json() as { error?: string; project?: AdminProject };
      if (!response.ok) throw new Error(result.error || 'Could not publish this project.');
      const publishedProject = result.project;
      if (!publishedProject) throw new Error('The server did not return the published project.');
      setProjects((current) => [...current, publishedProject]);
      setForm(initialForm);
      setSuccess('Project published and added to the Work page.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not publish this project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6F3] px-4 py-10 text-[#1E1E1E] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <a href="/work/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E2B22] hover:text-[#8A6A1E]">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Work page
        </a>
        <header className="mt-8 rounded-2xl bg-[#071b14] p-6 text-white sm:p-9">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><ShieldCheck size={21} aria-hidden="true" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8CBA4]">YBGP • Protected admin</p>
              <h1 className="mt-1 text-3xl font-bold font-heading">Add a work</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75">Publish a project to the public Work page. Admin access is protected by Cloudflare Access.</p>
        </header>

        {error && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {success && <p role="status" className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">{success}</p>}

        <form onSubmit={submit} className="mt-7 grid gap-6 rounded-2xl border border-[#E0E4DE] bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>Project name *
              <input className={fieldClassName} name="name" value={form.name} onChange={updateField} required maxLength={120} />
            </label>
            <label className={labelClassName}>Subtitle
              <input className={fieldClassName} name="fullName" value={form.fullName} onChange={updateField} maxLength={160} />
            </label>
            <label className={labelClassName}>Category *
              <input className={fieldClassName} name="category" value={form.category} onChange={updateField} required maxLength={160} placeholder="e.g. Travel / Booking Platform" />
            </label>
            <label className={labelClassName}>Project URL *
              <input className={fieldClassName} name="url" type="url" value={form.url} onChange={updateField} required placeholder="https://example.com" />
            </label>
            <label className={labelClassName}>Preview image URL
              <input className={fieldClassName} name="image" type="url" value={form.image} onChange={updateField} placeholder="https://example.com/preview.jpg" />
            </label>
            <label className={labelClassName}>Image description
              <input className={fieldClassName} name="imageAlt" value={form.imageAlt} onChange={updateField} maxLength={240} />
            </label>
          </div>
          <label className={labelClassName}>Project description *
            <textarea className={fieldClassName} name="description" value={form.description} onChange={updateField} required rows={4} maxLength={1200} />
          </label>
          <label className={labelClassName}>Tags * <span className="font-normal text-[#68736B]">(separate with commas)</span>
            <input className={fieldClassName} name="tags" value={form.tags} onChange={updateField} required placeholder="Website, E-commerce, Growth" />
          </label>
          <fieldset className="flex flex-wrap gap-x-7 gap-y-3">
            {[
              ['ownWork', 'Our own work'],
              ['isApplication', 'Web application'],
              ['sampleTemplate', 'Sample template'],
            ].map(([name, label]) => (
              <label key={name} className="inline-flex items-center gap-2 text-sm text-[#344239]">
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name as keyof typeof form] as boolean}
                  onChange={updateField}
                  className="h-4 w-4 accent-[#0E2B22]"
                />
                {label}
              </label>
            ))}
          </fieldset>
          <div>
            <button type="submit" disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0E2B22] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#164537] disabled:cursor-wait disabled:opacity-60">
              <Plus size={17} aria-hidden="true" /> {saving ? 'Publishing…' : 'Publish work'}
            </button>
          </div>
        </form>

        <section aria-labelledby="published-work-heading" className="mt-10">
          <h2 id="published-work-heading" className="text-xl font-bold text-[#0E2B22] font-heading">Published from admin</h2>
          {loading ? <p className="mt-4 text-sm text-[#68736B]">Loading projects…</p> : projects.length === 0 ? (
            <p className="mt-4 text-sm text-[#68736B]">No admin-published projects yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#E0E4DE] rounded-xl border border-[#E0E4DE] bg-white">
              {projects.map((project, index) => (
                <li key={project.id} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-[#8A6A1E]">{String(PROJECTS.length + index + 1).padStart(2, '0')}</p>
                    <p className="truncate font-semibold text-[#0E2B22]">{project.name}</p>
                    <p className="truncate text-sm text-[#68736B]">{project.category}</p>
                  </div>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name}`} className="shrink-0 rounded-full p-2 text-[#0E2B22] hover:bg-[#F4F6F3]">
                    <ExternalLink size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};
