
import bcrypt from 'bcrypt';

export const hashInput = async (input: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(input, salt);
};