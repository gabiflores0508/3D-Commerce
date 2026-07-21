/**
 * Cliente HTTP central da 3DCommerce.
 * Fala com o backend Express usando o envelope { ok, data, error }.
 *
 * Convenções:
 *   - Base URL vem de `VITE_API_URL`; sem trailing slash.
 *   - `Authorization: Bearer <token>` é setado dinamicamente pelo store de auth.
 *   - JSON por padrão; se o body for `FormData`, deixamos o browser setar
 *     o Content-Type (necessário para multipart boundaries).
 *   - Respostas 204 devolvem `undefined`.
 *   - Erros da API viram instâncias de `ApiError` com `code/message/status`.
 */

const RAW_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

// -----------------------------------------------------------------------------
// Token — armazenado in-memory e sincronizado com localStorage
// -----------------------------------------------------------------------------

type TokenKind = 'customer' | 'admin';
const TOKEN_KEYS: Record<TokenKind, string> = {
  customer: '3dc-token-customer',
  admin: '3dc-token-admin',
};

let currentToken: string | null = null;

/** Retorna o token que a rota deve usar. Preferimos admin quando presente. */
function readActiveToken(): string | null {
  if (currentToken) return currentToken;
  const admin = localStorage.getItem(TOKEN_KEYS.admin);
  if (admin) return admin;
  const customer = localStorage.getItem(TOKEN_KEYS.customer);
  return customer ?? null;
}

export function setAuthToken(kind: TokenKind, token: string | null) {
  const storageKey = TOKEN_KEYS[kind];
  if (token) {
    localStorage.setItem(storageKey, token);
    currentToken = token;
  } else {
    localStorage.removeItem(storageKey);
    // Se limpar o admin, ainda pode ter token do customer, e vice-versa.
    currentToken = readActiveToken();
  }
}

export function getStoredToken(kind: TokenKind): string | null {
  return localStorage.getItem(TOKEN_KEYS[kind]);
}

/** Chamado quando um 401 chega em qualquer request. Zera token e emite evento. */
function handleUnauthorized() {
  localStorage.removeItem(TOKEN_KEYS.customer);
  localStorage.removeItem(TOKEN_KEYS.admin);
  currentToken = null;
  window.dispatchEvent(new CustomEvent('auth:expired'));
}

// -----------------------------------------------------------------------------
// Tipos de erro e envelope
// -----------------------------------------------------------------------------

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;
  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
    this.name = 'ApiError';
  }
  static network(message = 'Falha de conexão com o servidor.') {
    return new ApiError(0, { code: 'NETWORK_ERROR', message });
  }
}

interface Envelope<T> {
  ok: boolean;
  data?: T;
  error?: ApiErrorPayload;
}

// -----------------------------------------------------------------------------
// Requisição
// -----------------------------------------------------------------------------

export interface RequestOptions {
  /** Se true, não anexa Authorization mesmo que exista token. */
  anonymous?: boolean;
  /** Query params opcionais. Valores `undefined/null` são omitidos. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Sobrescreve o token (útil para request de admin quando cliente tb está logado). */
  token?: string | null;
  /** Timeout em ms (default 30s). */
  timeoutMs?: number;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = `${API_BASE_URL}${normalized}`;
  if (!query) return base;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);

  const headers: Record<string, string> = {};
  const token = opts.anonymous ? null : opts.token ?? readActiveToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let requestBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (isFormData) {
      requestBody = body as FormData;
      // NÃO setar Content-Type — o browser injeta boundary correto.
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: requestBody,
      signal: controller.signal,
    });
  } catch (err) {
    window.clearTimeout(timeout);
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(0, { code: 'TIMEOUT', message: 'Tempo esgotado.' });
    }
    throw ApiError.network();
  } finally {
    window.clearTimeout(timeout);
  }

  // 204 — sem corpo.
  if (res.status === 204) return undefined as unknown as T;

  let payload: Envelope<T> | null = null;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    payload = (await res.json().catch(() => null)) as Envelope<T> | null;
  }

  if (!res.ok || !payload || payload.ok === false) {
    if (res.status === 401) handleUnauthorized();
    const errPayload: ApiErrorPayload = payload?.error ?? {
      code: `HTTP_${res.status}`,
      message: res.statusText || 'Erro desconhecido.',
    };
    throw new ApiError(res.status, errPayload);
  }

  return payload.data as T;
}

// -----------------------------------------------------------------------------
// API pública do módulo
// -----------------------------------------------------------------------------

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, body, opts),
  del: <T = void>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, undefined, opts),
};

/** Prefixa URL do backend (útil pra images de /uploads/...). */
export function apiAssetUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return '';
  if (/^(data:|https?:)/i.test(pathOrUrl)) return pathOrUrl;
  return `${API_BASE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl}`;
}
