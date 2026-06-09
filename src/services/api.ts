import { authFetch } from '../utils/authFetch';

export const api = {
  async get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await authFetch(url, { ...options, method: 'GET' });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorMsg.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async post<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    const res = await authFetch(url, {
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
    return res.json();
  },

  async put<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    const res = await authFetch(url, {
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
    return res.json();
  },

  async delete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await authFetch(url, { ...options, method: 'DELETE' });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorMsg.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }
};
