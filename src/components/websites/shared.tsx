import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

export const inputClassName = 'mt-1.5 w-full rounded-xl border border-[#ded9cd] bg-white px-3.5 py-3 text-sm text-[#172c25] outline-none transition focus:border-[#0E2B22] focus:ring-2 focus:ring-[#0E2B22]/10';
export const buttonClassName = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0E2B22] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#194638] disabled:cursor-not-allowed disabled:opacity-60';
export const secondaryButtonClassName = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#ded9cd] bg-white px-4 py-2.5 text-sm font-semibold text-[#173328] transition hover:bg-[#f7f5f0] disabled:cursor-not-allowed disabled:opacity-60';

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('json')) {
    throw new Error(response.ok
      ? 'The API returned a non-JSON response. The Node.js API may be unavailable.'
      : `Request failed (${response.status})`);
  }

  let payload: { error?: string } & T;
  try {
    payload = await response.json() as { error?: string } & T;
  } catch {
    throw new Error('The API returned invalid JSON.');
  }

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

export function Notice({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-[#e6dfd1] bg-[#f8f5ef] text-[#33463d]',
  };
  return <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[kind]}`}>{children}</div>;
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  min,
  max,
  step,
  autoComplete,
  minLength,
  maxLength,
  inputMode,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  readOnly?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-[#33463d]">
      {label}{required ? <span className="text-red-600"> *</span> : null}
      <input
        className={inputClassName}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm font-medium text-[#33463d]">
      {label}
      <textarea className={inputClassName} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-sm font-medium text-[#33463d]">
      {label}
      <select className={inputClassName} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function AccessPanel({
  role,
  onAuthenticated,
}: {
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER';
  onAuthenticated: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiRequest(role === 'SUPER_ADMIN' ? '/api/auth/admin/login' : '/api/auth/business/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onAuthenticated();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-[#e6dfd1] bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9d7723]">Secure sign in</p>
      <h2 className="mt-2 text-2xl font-bold text-[#0E2B22]">Sign in to manage your website</h2>
      <form onSubmit={signIn} className="mt-5 space-y-4">
        <Field label="Email" value={email} onChange={setEmail} type="email" required autoComplete="username" />
        <Field label="Password" value={password} onChange={setPassword} type="password" required autoComplete="current-password" />
        {error ? <Notice>{error}</Notice> : null}
        <button className={`${buttonClassName} w-full`} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </section>
  );
}

export function SignOutButton({ role }: { role: 'SUPER_ADMIN' | 'BUSINESS_OWNER' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signOut = async () => {
    setBusy(true);
    setError('');
    try {
      await apiRequest(role === 'SUPER_ADMIN' ? '/api/auth/admin/logout' : '/api/auth/business/logout', {
        method: 'POST',
      });
      window.location.reload();
    } catch (requestError) {
      setBusy(false);
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign out');
    }
  };
  return <div className="flex flex-col items-end gap-1"><button className={secondaryButtonClassName} onClick={() => void signOut()} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button>{error ? <span role="alert" className="max-w-48 text-right text-xs text-red-700">{error}</span> : null}</div>;
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.23em] text-[#9d7723]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0E2B22] sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a665f]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-[0_6px_24px_rgba(39,35,25,0.04)]">
      <p className="text-sm font-medium text-[#637068]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#0E2B22]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#7d877f]">{hint}</p> : null}
    </div>
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
}
