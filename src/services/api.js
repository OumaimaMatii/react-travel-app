/**
 * Service API centralisé.
 * Gère automatiquement :
 *   - le token Bearer (Sanctum)
 *   - les erreurs 401 (redirection vers /login)
 *   - les erreurs de validation (422)
 *   - le Content-Type multipart pour FormData
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Retourne les headers communs.
 * Si data est un FormData, on laisse le navigateur gérer le Content-Type.
 */
function buildHeaders(data) {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ne pas forcer Content-Type si c'est un FormData (multipart boundary auto)
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  } else {
    headers['Accept'] = 'application/json';
  }

  return headers;
}

/**
 * Effectue un appel fetch et normalise les erreurs.
 */
async function request(method, url, data = null, params = {}) {
  const queryString = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';

  const fullUrl = `${BASE_URL}${url}${queryString}`;
  const headers = buildHeaders(data);

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  const response = await fetch(fullUrl, options);

  // Redirection automatique si non authentifié
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Non authentifié');
  }

  // Essayer de parser le JSON dans tous les cas
  let json = null;
  try {
    json = await response.json();
  } catch {
    // La réponse n'est pas du JSON (ex: 204 No Content)
  }

  if (!response.ok) {
    const error = new Error(json?.message || `Erreur ${response.status}`);
    error.status = response.status;
    error.errors = json?.errors || null; // Erreurs de validation Laravel
    error.json = json;
    throw error;
  }

  return { data: json, status: response.status };
}

const api = {
  get:    (url, params = {})        => request('GET',    url, null, params),
  post:   (url, data = {})          => request('POST',   url, data),
  put:    (url, data = {})          => request('PUT',    url, data),
  patch:  (url, data = {})          => request('PATCH',  url, data),
  delete: (url)                     => request('DELETE', url),
};

export default api;
