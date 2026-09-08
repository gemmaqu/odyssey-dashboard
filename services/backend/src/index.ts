import { createApp } from './app.js';

// Cloudflare Workers entry. The app is created once per isolate.
const app = createApp();

export default app;
