const TOKEN_KEY = 'token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function isLoggedIn() {
  return Boolean(getToken());
}

function decodeToken() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  try {
    const base64Url = parts[1];
    const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = padded + '='.repeat((4 - (padded.length % 4)) % 4);
    const decoded = atob(normalized);
    const payload = JSON.parse(decoded);

    return {
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
}

export {
  getToken,
  setToken,
  clearToken,
  isLoggedIn,
  decodeToken,
};
