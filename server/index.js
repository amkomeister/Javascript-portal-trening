import express from 'express';
import { resolve } from 'node:path';
import { OAuth2Client } from 'google-auth-library';
import { configuration } from './config.js';
import { createApp } from './app.js';
import { firestoreStore } from './store.js';
const config = configuration(),
  store = firestoreStore(config.projectId),
  google = new OAuth2Client(config.clientId);
const app = createApp({
  ...config,
  store,
  verifyGoogle: async (credential) =>
    (await google.verifyIdToken({ idToken: credential, audience: config.clientId })).getPayload(),
});
if (config.local && process.env.SCHOOL_PREVIEW !== '1') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, hmr: { port: config.port + 100 } },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(resolve('dist'), { index: false }));
  app.get('/{*path}', (_, res) => {
    res.set('Cache-Control', 'no-store');
    res.sendFile(resolve('dist/index.html'));
  });
}
const server = app.listen(config.port, config.host, () =>
  console.log('Kodeverkstad Skule: ' + config.origin),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () =>
    server.close(async () => {
      await store.db.terminate();
      process.exit(0);
    }),
  );
