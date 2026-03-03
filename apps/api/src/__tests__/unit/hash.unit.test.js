const { hashPassword, comparePassword } = require('../../utils/hash');

describe('utils/hash', () => {
  it('hashes and verifies password', async () => {
    const password = 'secret123';
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    await expect(comparePassword(password, hashed)).resolves.toBe(true);
  });

  it('returns false for mismatched password', async () => {
    const hashed = await hashPassword('secret123');
    await expect(comparePassword('wrong123', hashed)).resolves.toBe(false);
  });
});
