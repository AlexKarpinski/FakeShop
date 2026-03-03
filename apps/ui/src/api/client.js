import { getToken } from '../auth/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function apiFetch(path, options = {}) {
  const { method = 'GET', body, auth = true } = options;
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${requestPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data && typeof data.error === 'string'
      ? data.error
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export { apiFetch, API_BASE_URL };
