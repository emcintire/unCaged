import dotenv from 'dotenv';
import { createApp } from './createApp';
import { bootstrap } from './bootstrap';

export const app = createApp();

export default app;

if (require.main === module) {
  dotenv.config();
  void bootstrap(app);
}
