import dotenv from 'dotenv';
import { createApp } from './createApp';
import { bootstrap } from './bootstrap';

export const app = createApp();

export default app;

// Only run side-effects when this file is executed directly (not when imported by tests)
if (require.main === module) {
  dotenv.config();
  void bootstrap(app);
}
