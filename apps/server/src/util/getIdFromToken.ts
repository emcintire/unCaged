import jwt from 'jsonwebtoken';

export const getIdFromToken = (token: string): string => {
  const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
  if (!jwtPrivateKey) {
    throw new Error('JWT_PRIVATE_KEY is not defined');
  }
  const decoded = jwt.verify(token, jwtPrivateKey) as { _id: string };
  return decoded._id;
};
