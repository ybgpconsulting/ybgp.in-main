export const PRIMARY_ACTIONS = ['whatsapp', 'call', 'email', 'custom'] as const;

export type PrimaryAction = typeof PRIMARY_ACTIONS[number];

export interface BusinessContactDetails {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
}

export const resolveBusinessContact = (
  contact: BusinessContactDetails,
  settings: Record<string, string | null | undefined>
): Required<BusinessContactDetails> => ({
  phone: contact.phone?.trim() ? contact.phone : settings.call_phone?.trim() || null,
  whatsapp: contact.whatsapp?.trim() ? contact.whatsapp : settings.whatsapp?.trim() || null,
  email: contact.email?.trim() ? contact.email : settings.contact_email?.trim() || null,
});

export const isPrimaryAction = (value: unknown): value is PrimaryAction =>
  typeof value === 'string' && PRIMARY_ACTIONS.includes(value as PrimaryAction);

export const inferPrimaryAction = (
  settings: Record<string, string | null | undefined>,
  contact: BusinessContactDetails
): PrimaryAction => {
  if (isPrimaryAction(settings.primary_action)) return settings.primary_action;
  const legacyUrl = settings.cta_url?.trim();
  if (legacyUrl) {
    try {
      const url = new URL(legacyUrl, 'https://tenant.invalid');
      if (url.protocol === 'tel:') return 'call';
      if (url.protocol === 'mailto:') return 'email';
      if (url.hostname === 'wa.me') return 'whatsapp';
    } catch {
      return 'custom';
    }
    return 'custom';
  }
  if (contact.whatsapp?.trim()) return 'whatsapp';
  if (contact.phone?.trim()) return 'call';
  if (contact.email?.trim()) return 'email';
  return 'whatsapp';
};

export const resolvePrimaryActionUrl = (
  action: PrimaryAction,
  contact: BusinessContactDetails,
  customUrl = ''
): string | null => {
  if (action === 'whatsapp') {
    const digits = contact.whatsapp?.replace(/\D/g, '') ?? '';
    return digits.length >= 7 ? `https://wa.me/${digits}` : null;
  }
  if (action === 'call') {
    const rawPhone = contact.phone?.trim() ?? '';
    const digits = rawPhone.replace(/\D/g, '');
    return digits.length >= 7 ? `tel:${rawPhone.startsWith('+') ? '+' : ''}${digits}` : null;
  }
  if (action === 'email') {
    const email = contact.email?.trim() ?? '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null;
  }

  const value = customUrl.trim();
  if (!value || /[\\\u0000-\u001f\u007f]/.test(value)) return null;
  if (value.startsWith('/') && !value.startsWith('//')) {
    try {
      const path = value.split(/[?#]/, 1)[0];
      for (const segment of path.split('/')) {
        let decoded = segment;
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const next = decodeURIComponent(decoded);
          if (next === decoded) break;
          decoded = next;
        }
        if (/%[0-9a-f]{2}/i.test(decoded) || decoded === '.' || decoded === '..' || /[/\\]/.test(decoded)) return null;
      }
      return value;
    } catch {
      return null;
    }
  }
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    if (['http:', 'https:'].includes(url.protocol) && url.hostname) return url.href;
    if (url.protocol === 'mailto:' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url.pathname) && !url.search && !url.hash) return value;
    if (url.protocol === 'tel:' && /^\+?[\d\s().-]+$/.test(url.pathname) && url.pathname.replace(/\D/g, '').length >= 7) return value;
    return null;
  } catch {
    return null;
  }
};