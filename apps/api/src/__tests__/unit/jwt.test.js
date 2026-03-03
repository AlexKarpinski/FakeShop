const { signAccessToken, verifyAccessToken } = require('../../utils/jwt');

describe('utils/jwt', () => {
  it('signs and verifies a token roundtrip', () => {
    const token = signAccessToken({
      _id: 'u1',
      role: 'user',
      email: 'user@example.com',
    });

    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe('u1');
    expect(payload.role).toBe('user');
    expect(payload.email).toBe('user@example.com');
  });

  it('throws for invalid token', () => {
    expect(() => verifyAccessToken('not-a-token')).toThrow();
  });
});
