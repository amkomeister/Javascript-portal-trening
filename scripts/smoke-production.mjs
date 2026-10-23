import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const base = new URL(process.argv[2] || 'http://127.0.0.1:8080');
if (!['127.0.0.1', 'localhost'].includes(base.hostname))
  throw Error('Berre ei lokal containerprøve er tillaten.');
const get = (path, options) =>
  fetch(new URL(path, base), { ...options, signal: AbortSignal.timeout(3000) });
let healthy = false;
for (let i = 0; i < 30; i++) {
  try {
    healthy = (await get('/health')).ok;
  } catch {}
  if (healthy) break;
  await delay(500);
}
assert.ok(healthy, 'Production server must listen on the configured port');
const config = await get('/api/config');
assert.equal((await config.json()).local, false);
assert.match(config.headers.get('set-cookie'), /Secure/i);
assert.match(config.headers.get('set-cookie'), /HttpOnly/i);
assert.equal(config.headers.get('cache-control'), 'no-store');
assert.match(config.headers.get('content-security-policy'), /object-src 'none'/);
assert.equal(
  (
    await get('/api/auth/local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"account":"teacher"}',
    })
  ).status,
  404,
);
assert.equal((await get('/api/progress')).status, 401);
assert.equal((await get('/api/groups')).status, 401);
const html = await (await get('/')).text();
assert.match(html, /Kodeverkstad Skule/);
const asset = html.match(/src="([^"]+\.js)"/);
assert.ok(asset, 'Production entry script is present');
const entry = await get(asset[1]);
assert.equal(entry.status, 200);
assert.match(entry.headers.get('content-type'), /javascript/);
console.log(
  'PASS: production HTTP boundary, static build, secure cookie and disabled local login. No real Google or Firestore access tested.',
);
