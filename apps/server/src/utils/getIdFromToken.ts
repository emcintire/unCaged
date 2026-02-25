import jwt from 'jsonwebtoken';

import { getRequiredEnv } from '@/utils';

export const getIdFromToken = (token: string): string => {
  const jwtPrivateKey = getRequiredEnv('JWT_PRIVATE_KEY');
  const decoded = jwt.verify(token, jwtPrivateKey) as { sub: string };
  return decoded.sub;
};
