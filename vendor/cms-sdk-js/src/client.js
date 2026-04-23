/**
 * Sakha CMS JS SDK — HTTP Client
 * Handles auth (API key+secret OR JWT), envelope unwrapping, auto-refresh.
 */

export class HttpClient {
  constructor({ baseUrl, apiKey, apiSecret, getToken, onAuthFailure }) {
    this.baseUrl = (baseUrl || 'http://localhost:5001').replace(/\/$/, '');
    this.apiKey = apiKey || null;
    this.apiSecret = apiSecret || null;
    this.getToken = getToken || null;
    this.onAuthFailure = onAuthFailure || null;
    this.extraHeaders = {};
  }

  setHeader(key, value) {
    if (value) this.extraHeaders[key] = value;
    else delete this.extraHeaders[key];
  }

  _buildHeaders(extra) {
    const headers = { 'Content-Type': 'application/json', ...this.extraHeaders, ...extra };

    if (this.getToken) {
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } else if (this.apiKey && this.apiSecret) {
      headers['Authorization'] = `Bearer ${this.apiKey}:${this.apiSecret}`;
    } else if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  async _request(method, path, { body, params, headers } = {}) {
    let url = `${this.baseUrl}${path}`;

    if (params) {
      const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      if (qs) url += `?${qs}`;
    }

    const opts = {
      method,
      headers: this._buildHeaders(headers),
    };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);

    if (res.status === 401 && this.onAuthFailure) {
      this.onAuthFailure(res);
      throw new SdkError(401, 'Unauthorized');
    }

    if (res.status === 204) return null;

    const json = await res.json();

    if (!res.ok) {
      const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
      throw new SdkError(res.status, msg, json?.error);
    }

    if (json && typeof json === 'object' && 'success' in json) {
      if (!json.success) throw new SdkError(res.status, json.error?.message || 'Request failed', json.error);
      return { data: json.data, meta: json.meta || null };
    }

    return { data: json, meta: null };
  }

  get(path, opts) { return this._request('GET', path, opts); }
  post(path, body, opts) { return this._request('POST', path, { body, ...opts }); }
  put(path, body, opts) { return this._request('PUT', path, { body, ...opts }); }
  delete(path, opts) { return this._request('DELETE', path, opts); }
}

export class SdkError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'SdkError';
    this.status = status;
    this.details = details;
  }
}
