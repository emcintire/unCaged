import type { Response } from 'express';
import { getRequiredEnv, getTokenFromRequest, signAccessToken, getUserIdFromRequest } from '@/utils';

describe('Utility helpers', () => {
  it('getTokenFromRequest returns bearer token and null for missing header', () => {
    const withToken = {
      header: (name: string) => (name === 'authorization' ? 'Bearer abc.def.ghi' : undefined),
    };
    const withoutToken = { header: () => undefined };

    expect(getTokenFromRequest(withToken as never)).toBe('abc.def.ghi');
    expect(getTokenFromRequest(withoutToken as never)).toBeNull();
  });

  it('getRequiredEnv returns value and throws for missing var', () => {
    process.env.TEST_ENV_VALUE = 'present';
    expect(getRequiredEnv('TEST_ENV_VALUE')).toBe('present');

    delete process.env.TEST_ENV_VALUE;
    expect(() => getRequiredEnv('TEST_ENV_VALUE')).toThrow('environment variable is not defined');
  });

  it('getUserIdFromRequest returns user id when bearer token is valid', () => {
    const token = signAccessToken({ sub: 'user-123', isAdmin: false });
    const req = {
      header: (name: string) => (name === 'authorization' ? `Bearer ${token}` : undefined),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    const userId = getUserIdFromRequest(req as never, res);
    expect(userId).toBe('user-123');
    expect((res.status as unknown as jest.Mock)).not.toHaveBeenCalled();
  });

  it('getUserIdFromRequest sends 401 and returns null when token is missing', () => {
    const req = { header: () => undefined };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    const userId = getUserIdFromRequest(req as never, res);
    expect(userId).toBeNull();
    expect((res.status as unknown as jest.Mock)).toHaveBeenCalledWith(401);
    expect((res.send as unknown as jest.Mock)).toHaveBeenCalledWith('No token provided');
  });
});