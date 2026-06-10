import { authFetch } from '../utils/authFetch';

export const formatUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  if (!cleanUrl.startsWith('/api/') && !cleanUrl.startsWith('/api')) {
    return `/api${cleanUrl}`;
  }
  return cleanUrl;
};

export const api = {
  async get<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const formattedUrl = formatUrl(url);
    const res = await authFetch(formattedUrl, { ...options, method: 'GET' });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorMsg.error || `HTTP error ${res.status}`);
    }
    return res.json() as Promise<T>;
  },

  async post<T = unknown>(url: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    const formattedUrl = formatUrl(url);
    const res = await authFetch(formattedUrl, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorMsg.error || `HTTP error ${res.status}`);
    }
    return res.json() as Promise<T>;
  },

  async put<T = unknown>(url: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    const formattedUrl = formatUrl(url);
    const res = await authFetch(formattedUrl, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorMsg.error || `HTTP error ${res.status}`);
    }
    return res.json() as Promise<T>;
  },

  async delete<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const formattedUrl = formatUrl(url);
    const res = await authFetch(formattedUrl, { ...options, method: 'DELETE' });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorMsg.error || `HTTP error ${res.status}`);
    }
    return res.json() as Promise<T>;
  }
};
