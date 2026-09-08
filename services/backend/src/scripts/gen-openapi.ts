import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApp } from '../app.js';

/**
 * Emit the OpenAPI 3.1 document by introspecting the Hono app in Node — no
 * running server or database needed. Orval consumes the written file.
 */
const app = createApp();
const doc = app.getOpenAPI31Document({
  openapi: '3.1.0',
  info: { title: 'Odyssey Ordering API', version: '0.1.0' },
});

const out = resolve(process.cwd(), 'openapi.json');
writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`Wrote ${out}`);
