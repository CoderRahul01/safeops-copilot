import { auth } from "./firebase";

/**
 * Standardized fetch helper for SafeOps.
 * Handles Firebase token retrieval and standardized headers.
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const user = auth.currentUser;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('⚠️ [API] Failed to refresh token:', e.message);
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.warn('🔴 [API] 401 Unauthorized: Session may be expired.');
  }

  return response;
}

/**
 * Robust JSON fetcher
 */
export async function getJson(endpoint) {
    const res = await fetchWithAuth(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
}
