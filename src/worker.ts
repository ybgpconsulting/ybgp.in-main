interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1Statement;
}

interface WorkRow {
  id: string;
  name: string;
  full_name: string | null;
  category: string;
  description: string;
  image: string | null;
  image_alt: string | null;
  url: string;
  tags: string;
  own_work: number;
  is_application: number;
  sample_template: number;
}

interface WorkerEnvironment {
  WORKS: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ACCESS_AUD: string;
  ACCESS_TEAM_DOMAIN: string;
}

interface AccessKey extends JsonWebKey {
  kid: string;
}

interface AccessClaims {
  aud: string | string[];
  iss: string;
  exp: number;
  nbf?: number;
}

let accessKeysCache: { expiresAt: number; keys: AccessKey[] } | undefined;

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

const readAccessKeys = async (teamDomain: string, forceRefresh = false): Promise<AccessKey[]> => {
  if (!forceRefresh && accessKeysCache && accessKeysCache.expiresAt > Date.now()) {
    return accessKeysCache.keys;
  }

  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error(`Unable to load Cloudflare Access signing keys (${response.status})`);

  const body = await response.json() as { keys?: AccessKey[] };
  if (!Array.isArray(body.keys)) throw new Error('Cloudflare Access returned an invalid signing-key response');

  accessKeysCache = { keys: body.keys, expiresAt: Date.now() + 5 * 60 * 1000 };
  return body.keys;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const verifyAccessToken = async (token: string, env: WorkerEnvironment): Promise<boolean> => {
  if (!env.ACCESS_AUD || !env.ACCESS_TEAM_DOMAIN) {
    throw new Error('Cloudflare Access is not configured for the works admin API');
  }

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  let header: { alg?: string; kid?: string };
  let claims: AccessClaims;
  try {
    const decodedHeader: unknown = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    const decodedClaims: unknown = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    if (!decodedHeader || typeof decodedHeader !== 'object' || !decodedClaims || typeof decodedClaims !== 'object') return false;
    header = decodedHeader as { alg?: string; kid?: string };
    claims = decodedClaims as AccessClaims;
  } catch {
    return false;
  }

  if (header.alg !== 'RS256' || !header.kid) return false;
  const teamDomain = env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (claims.iss !== `https://${teamDomain}`) return false;
  if (!(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(env.ACCESS_AUD)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(claims.exp) || claims.exp <= now || (claims.nbf !== undefined && claims.nbf > now)) return false;

  let key = (await readAccessKeys(teamDomain)).find((candidate) => candidate.kid === header.kid);
  if (!key) key = (await readAccessKeys(teamDomain, true)).find((candidate) => candidate.kid === header.kid);
  if (!key) return false;

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    key,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
};

const serializeWork = (row: WorkRow) => ({
  id: row.id,
  name: row.name,
  ...(row.full_name ? { fullName: row.full_name } : {}),
  category: row.category,
  description: row.description,
  ...(row.image ? { image: row.image } : {}),
  ...(row.image_alt ? { imageAlt: row.image_alt } : {}),
  url: row.url,
  tags: JSON.parse(row.tags) as string[],
  preview: 'image' as const,
  ...(row.own_work ? { ownWork: true } : {}),
  ...(row.is_application ? { isApplication: true } : {}),
  ...(row.sample_template ? { sampleTemplate: true } : {}),
});

const listWorks = async (env: WorkerEnvironment) => {
  const { results } = await env.WORKS.prepare(
    'SELECT id, name, full_name, category, description, image, image_alt, url, tags, own_work, is_application, sample_template FROM works ORDER BY created_at, id',
  ).all<WorkRow>();
  return results.map((row) => ({ ...serializeWork(row), id: row.id }));
};

const handleWorksApi = async (request: Request, env: WorkerEnvironment): Promise<Response> => {
  const url = new URL(request.url);

  if (url.pathname === '/api/works' && request.method === 'GET') {
    return jsonResponse({ projects: await listWorks(env) });
  }

  if (url.pathname !== '/api/admin/works' || request.method !== 'POST') {
    return jsonResponse({ error: 'Not found' }, 404);
  }

  const accessToken = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!accessToken || !(await verifyAccessToken(accessToken, env))) {
    return jsonResponse({ error: 'A valid Cloudflare Access session is required.' }, 403);
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 16_384) return jsonResponse({ error: 'Request is too large.' }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse({ error: 'Request body must be a project object.' }, 400);
  }

  const requiredFields = ['name', 'category', 'description', 'url'];
  if (requiredFields.some((field) => typeof body[field] !== 'string' || !(body[field] as string).trim())) {
    return jsonResponse({ error: 'Name, category, description, and project URL are required.' }, 400);
  }
  if (['name', 'fullName', 'category', 'description', 'image', 'imageAlt', 'url'].some(
    (field) => typeof body[field] === 'string' && (body[field] as string).length > 2000,
  )) {
    return jsonResponse({ error: 'A field exceeds the allowed length.' }, 400);
  }

  const name = (body.name as string).trim();
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const category = (body.category as string).trim();
  const description = (body.description as string).trim();
  const projectUrl = (body.url as string).trim();
  const image = typeof body.image === 'string' ? body.image.trim() : '';
  const imageAlt = typeof body.imageAlt === 'string' ? body.imageAlt.trim() : '';
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(projectUrl);
  } catch {
    return jsonResponse({ error: 'Enter a valid project URL.' }, 400);
  }
  if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
    return jsonResponse({ error: 'Project links must use HTTP or HTTPS.' }, 400);
  }

  if (image) {
    try {
      const imageUrl = new URL(image);
      if (!['https:', 'http:'].includes(imageUrl.protocol)) throw new Error('Unsupported image URL');
    } catch {
      return jsonResponse({ error: 'Enter a valid HTTP or HTTPS image URL.' }, 400);
    }
  }

  const tags = typeof body.tags === 'string'
    ? body.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12)
    : [];
  if (!tags.length) return jsonResponse({ error: 'Add at least one comma-separated project tag.' }, 400);

  const id = crypto.randomUUID();
  await env.WORKS.prepare(
    'INSERT INTO works (id, name, full_name, category, description, image, image_alt, url, tags, own_work, is_application, sample_template, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind(
    id,
    name,
    fullName || null,
    category,
    description,
    image || null,
    imageAlt || null,
    parsedUrl.toString(),
    JSON.stringify(tags),
    body.ownWork === true ? 1 : 0,
    body.isApplication === true ? 1 : 0,
    body.sampleTemplate === true ? 1 : 0,
    new Date().toISOString(),
  ).run();

  return jsonResponse({ project: { id, ...serializeWork({
    id, name, full_name: fullName || null, category, description,
    image: image || null, image_alt: imageAlt || null, url: parsedUrl.toString(),
    tags: JSON.stringify(tags), own_work: body.ownWork === true ? 1 : 0,
    is_application: body.isApplication === true ? 1 : 0,
    sample_template: body.sampleTemplate === true ? 1 : 0,
  }) } }, 201);
};

export default {
  async fetch(request: Request, env: WorkerEnvironment): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleWorksApi(request, env);
      } catch (error) {
        console.error('Works API request failed:', error);
        const message = error instanceof Error ? error.message : 'Unexpected server error.';
        if (message.includes('not configured')) return jsonResponse({ error: message }, 503);
        return jsonResponse({ error: 'The works service is temporarily unavailable.' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
