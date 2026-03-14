import { bootstrap } from './bootstrap';
import { createApp } from './createApp';

export const app = createApp();

export default app;

if (require.main === module) {
  void bootstrap(app);
}
