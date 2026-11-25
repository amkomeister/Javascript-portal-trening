import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { it, expect } from 'vitest';

const run = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));

// Keep this regression in a child process: the vulnerable parser crashes Node.
// The input is tiny and goes only to an ephemeral loopback server with memory data.
it.each(['application/json', 'application/x-www-form-urlencoded'])(
  'keeps the school server alive after trailing compressed bytes (%s)',
  async (contentType) => {
    const { stdout } = await run(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        String.raw`
        import assert from 'node:assert/strict';
        import net from 'node:net';
        import { once } from 'node:events';
        import { gzipSync } from 'node:zlib';
        import { setTimeout as delay } from 'node:timers/promises';
        import { createApp } from './server/app.js';
        import { memoryStore } from './server/store.js';

        const contentType = process.argv[1];
        const app = createApp({ store: memoryStore(), local: true, origin: 'http://127.0.0.1' });
        const server = app.listen(0, '127.0.0.1');
        await once(server, 'listening');
        const port = server.address().port;
        const socket = net.connect(port, '127.0.0.1');
        try {
          await once(socket, 'connect');
          const body = contentType === 'application/json' ? '{"probe":1}' : 'probe=1';
          const compressed = Buffer.concat([gzipSync(body), Buffer.from([0])]);
          const tail = Buffer.alloc(100 * 1024, 0x58);
          const response = once(socket, 'data');
          socket.write([
            'GET /health HTTP/1.1',
            'Host: 127.0.0.1',
            'Connection: keep-alive',
            'Content-Type: ' + contentType,
            'Content-Encoding: gzip',
            'Content-Length: ' + (compressed.length + tail.length),
            '', '',
          ].join('\r\n'));
          socket.write(Buffer.concat([compressed, tail]));
          const [chunk] = await response;
          assert.match(chunk.toString(), /^HTTP\/1\.1 200/);
          // The gzip decoder finishes before the trailing chunks are consumed.
          socket.end();
          await once(socket, 'close');
          await delay(50);
          const health = await fetch('http://127.0.0.1:' + port + '/health');
          assert.equal(health.status, 200);
          assert.deepEqual(await health.json(), { ok: true });
          console.log('server-survived');
        } finally {
          socket.destroy();
          server.closeAllConnections();
          await new Promise((resolve) => server.close(resolve));
        }
      `,
        contentType,
      ],
      { cwd: root, timeout: 8000, windowsHide: true },
    );
    expect(stdout).toContain('server-survived');
  },
  10000,
);
