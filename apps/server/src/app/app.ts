import dotenv from 'dotenv';

import { bootstrap } from './bootstrap';
import { createApp } from './createApp';

export const app = createApp();

export default app;

if (require.main === module) {
  dotenv.config();
  void bootstrap(app);
}
