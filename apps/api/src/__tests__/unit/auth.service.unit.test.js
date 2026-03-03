jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../utils/hash', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../utils/jwt', () => ({
  signAccessToken: jest.fn(),
}));

const User = require('../../models/User');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { signAccessToken } = require('../../utils/jwt');
const authService = require('../../services/auth.service');

function mockLean(value) {
  return {
    lean: jest.fn().mockResolvedValue(value),
  };
}

describe('services/auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register throws conflict when email already exists', async () => {
    User.findOne.mockReturnValue(mockLean({ _id: 'u1' }));

    await expect(
      authService.register({
        email: 'user@example.com',
        password: 'secret123',
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already exists',
    });
  });

  it('login throws unauthorized on invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'user@example.com',
        password: 'secret123',
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials',
    });
  });

  it('register creates user and returns token', async () => {
    User.findOne.mockReturnValue(mockLean(null));
    hashPassword.mockResolvedValue('hashed');
    User.create.mockResolvedValue({
      _id: 'u1',
      email: 'user@example.com',
      role: 'user',
    });
    signAccessToken.mockReturnValue('token-1');

    const result = await authService.register({
      email: 'User@Example.com',
      password: 'secret123',
    });

    expect(hashPassword).toHaveBeenCalledWith('secret123');
    expect(User.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: 'user',
    });
    expect(result).toEqual({ token: 'token-1' });
  });

  it('login returns token when password matches', async () => {
    User.findOne.mockResolvedValue({
      _id: 'u1',
      email: 'user@example.com',
      role: 'user',
      passwordHash: 'hashed',
    });
    comparePassword.mockResolvedValue(true);
    signAccessToken.mockReturnValue('token-2');

    const result = await authService.login({
      email: 'user@example.com',
      password: 'secret123',
    });

    expect(comparePassword).toHaveBeenCalledWith('secret123', 'hashed');
    expect(result).toEqual({ token: 'token-2' });
  });
});
