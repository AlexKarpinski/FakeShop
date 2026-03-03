import { afterEach, describe, expect, it } from 'vitest';
import { clearToken, decodeToken, setToken } from '../auth/auth';

function toBase64Url(value) {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function makeToken(payload) {
  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const body = toBase64Url(payload);
  return `${header}.${body}.signature`;
}

describe('auth/decodeToken', () => {
  afterEach(() => {
    clearToken();
  });

  it('returns role and email for a valid token payload', () => {
    setToken(
      makeToken({
        sub: 'u1',
        role: 'admin',
        email: 'admin@example.com',
      })
    );

    expect(decodeToken()).toEqual({
      role: 'admin',
      email: 'admin@example.com',
    });
  });

  it('returns null for invalid token', () => {
    setToken('invalid-token');
    expect(decodeToken()).toBeNull();
  });
});
