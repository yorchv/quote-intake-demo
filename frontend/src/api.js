export function runtimeConfig() {
  const browser = typeof window !== 'undefined' ? window : {};
  return {
    productApiUrl: browser.__PRODUCT_API_URL__ || process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'http://127.0.0.1:8000',
    inkpassClientSlug: browser.__INKPASS_CLIENT_SLUG__ || process.env.NEXT_PUBLIC_INKPASS_CLIENT_SLUG || ''
  };
}

export const SESSION_INVALID_EVENT = 'product-session-invalid';

export class ApiError extends Error {
  constructor(message, { status, detail = null, sessionInvalid = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.sessionInvalid = sessionInvalid;
  }
}

async function responseError(response, token = '') {
  const raw = await response.text();
  let message = raw;
  let detail = null;
  try {
    const payload = JSON.parse(raw);
    detail = payload?.detail ?? null;
    if (Array.isArray(detail)) {
      message = detail
        .map((item) => String(item?.msg || item || '').replace(/^Value error,\s*/i, ''))
        .filter(Boolean)
        .join(' ');
    } else if (typeof detail === 'string') {
      message = detail;
    } else if (detail && typeof detail.message === 'string') {
      message = detail.message;
    }
  } catch {}
  const sessionInvalid = response.status === 401 && Boolean(token);
  if (sessionInvalid && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(SESSION_INVALID_EVENT, { detail: { status: response.status } }));
  }
  return new ApiError(message || `Request failed (${response.status})`, {
    status: response.status,
    detail,
    sessionInvalid
  });
}

export async function api(path, options = {}) {
  const base = runtimeConfig().productApiUrl;
  const headers = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  if (options.idempotencyKey) headers['idempotency-key'] = options.idempotencyKey;
  const response = await fetch(`${base}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) {
    throw await responseError(response, options.token);
  }
  return response.json();
}

export async function loginWithInkPass(payload) {
  return api('/auth/inkpass/login', { method: 'POST', body: payload });
}

export async function registerWithInkPass(payload) {
  return api('/auth/inkpass/register', { method: 'POST', body: payload });
}

export async function verifyInkPassEmail(payload) {
  return api('/auth/inkpass/verify-email', { method: 'POST', body: payload });
}

export async function resendInkPassVerification(payload) {
  return api('/auth/inkpass/resend-verification', { method: 'POST', body: payload });
}

export async function requestInkPassPasswordReset(payload) {
  return api('/auth/inkpass/forgot-password', { method: 'POST', body: payload });
}

export async function resetInkPassPassword(payload) {
  return api('/auth/inkpass/reset-password', { method: 'POST', body: payload });
}

export async function streamReefPrompt(promptRequestId, body, { token, idempotencyKey, lastEventId } = {}) {
  if (!token) throw new Error('An authenticated product session is required');
  if (!idempotencyKey) throw new Error('An idempotency key is required');
  const base = runtimeConfig().productApiUrl;
  const headers = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    accept: 'text/event-stream',
    'idempotency-key': idempotencyKey
  };
  if (lastEventId) headers['last-event-id'] = lastEventId;
  const response = await fetch(`${base}/reef/prompts/${encodeURIComponent(promptRequestId)}/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!response.ok) throw await responseError(response, token);
  return response;
}

export async function uploadReefFile(file, { token, idempotencyKey, purpose = 'prompt_input', retentionDays = 30 } = {}) {
  if (!token) throw new Error('An authenticated product session is required');
  if (!idempotencyKey) throw new Error('An idempotency key is required');
  const form = new FormData();
  form.append('file', file, file.name);
  form.append('purpose', purpose);
  form.append('retention_days', String(retentionDays));
  const response = await fetch(`${runtimeConfig().productApiUrl}/reef/files`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'idempotency-key': idempotencyKey },
    body: form
  });
  if (!response.ok) throw await responseError(response, token);
  return response.json();
}
