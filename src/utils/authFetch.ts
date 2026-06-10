/**
 * Centralized fetch with automatic Bearer Token, Retry on 401, Auto-Refresh with JWT, and failure handling.
 */

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem('jiuspeak_refresh_token');
  if (!refresh) {
    clearStorage();
    return null;
  }

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('jiuspeak_access_token', data.accessToken);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('jiuspeak_refresh_token', data.refreshToken);
        }
        return data.accessToken;
      }
    }
  } catch (err) {
    console.error("[authFetch] Refresh token request failed:", err);
  }

  clearStorage();
  window.dispatchEvent(new Event('auth-logout-required'));
  return null;
}

function clearStorage() {
  localStorage.removeItem('jiuspeak_access_token');
  localStorage.removeItem('jiuspeak_refresh_token');
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('jiuspeak_user_profile_v2');
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('jiuspeak_access_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    console.warn(`[authFetch] ${response.status} detected on ${url}. Attempting auto-retry and refresh...`);
    if (!refreshPromise) {
      refreshPromise = performRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      const nextHeaders = new Headers(options.headers || {});
      nextHeaders.set('Authorization', `Bearer ${newToken}`);
      return fetch(url, { ...options, headers: nextHeaders });
    }
  }

  return response;
}
