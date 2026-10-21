import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { firestoreStore } from '../server/store.js';
import { exportData, restoreData } from '../server/backup.js';
import { buildExport } from './export-build.mjs';
const verify = process.argv.includes('--verify'),
  e2e = process.argv.includes('--e2e'),
  preview = process.argv.includes('--preview');
if (process.env.NODE_ENV === 'production')
  throw Error('Lokal utvikling kan ikkje startast i produksjonsmodus.');
const port = e2e ? 5176 : 5175,
  emulatorPort = e2e ? 8086 : 8085,
  projectId = e2e ? 'demo-school-e2e' : verify ? 'demo-school-verify' : 'demo-kodeverkstad';
if (!verify) await buildExport();
if (preview) {
  const { build } = await import('vite');
  await build();
}
await mkdir('.local', { recursive: true });
let entries;
try {
  entries = await readdir('.local/tools');
} catch {
  throw Error('Køyr node scripts/setup.mjs først.');
}
const java =
  process.platform === 'win32'
    ? resolve(
        '.local/tools',
        entries.find((n) => n.startsWith('jdk-')) || 'missing',
        'bin/java.exe',
      )
    : 'java';
const emulator = spawn(
  java,
  [
    '-jar',
    resolve('.local/tools/firestore.jar'),
    '--host=127.0.0.1',
    '--port=' + emulatorPort,
    '--project_id=' + projectId,
  ],
  { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
);
emulator.on('error', (e) => {
  console.error(e.message);
  process.exitCode = 1;
});
let logs = '';
for (const stream of [emulator.stdout, emulator.stderr])
  stream.on('data', (d) => {
    logs = (logs + d).slice(-6000);
  });
let ready = false;
for (let i = 0; i < 100; i++) {
  if (emulator.exitCode !== null) throw Error('Emulatoren stoppa: ' + logs);
  try {
    const r = await fetch('http://127.0.0.1:' + emulatorPort);
    if (r.ok) {
      ready = true;
      break;
    }
  } catch {}
  await delay(200);
}
if (!ready) {
  emulator.kill();
  throw Error('Emulatoren svarte ikkje. ' + logs);
}
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:' + emulatorPort;
const store = firestoreStore(projectId);
let child,
  stopping = false;
async function snapshot() {
  if (e2e || verify) return;
  const backup = await exportData(store.db);
  await writeFile('.local/data.next.json', JSON.stringify(backup));
  await rename('.local/data.next.json', '.local/data.json');
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  clearInterval(autoBackup);
  try {
    await snapshot();
  } catch (e) {
    console.error('Lokal sikkerheitskopi feila:', e.message);
    code = 1;
  }
  child?.kill();
  await store.db.terminate();
  emulator.kill();
  process.exitCode = code;
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
let autoBackup;
try {
  if (!e2e && !verify) {
    let backup;
    try {
      backup = JSON.parse(await readFile('.local/data.json', 'utf8'));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
    if (backup) await restoreData(store.db, backup);
  }
  if (verify) {
    await store.set('users', 'synthetic', { id: 'synthetic', name: 'Test' });
    await store.set('projects', 'synthetic_snake', {
      id: 'snake',
      userId: 'synthetic',
      revision: 1,
      data: { files: { js: 'print(42)', html: '', css: '' } },
    });
    const backup = await exportData(store.db),
      target = firestoreStore('demo-school-restore-' + Date.now());
    await restoreData(target.db, backup);
    const restored = await target.get('projects', 'synthetic_snake');
    if (restored.data.files.js !== 'print(42)') throw Error('Gjenoppretting feila.');
    let blocked = false;
    try {
      await restoreData(target.db, backup);
    } catch {
      blocked = true;
    }
    if (!blocked) throw Error('Overskriving blei ikkje stoppa.');
    console.log(
      'PASS: Firestore emulator, sikkerheitskopi, gjenoppretting, vern mot overskriving.',
    );
    await target.db.terminate();
    await stop();
  } else {
    autoBackup = setInterval(
      () => snapshot().catch((e) => console.error('Lokal kopi:', e.message)),
      30000,
    );
    child = spawn(process.execPath, ['server/index.js'], {
      stdio: 'inherit',
      windowsHide: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        SCHOOL_PREVIEW: preview ? '1' : '',
        SCHOOL_LOCAL: '1',
        PORT: String(port),
        GOOGLE_CLOUD_PROJECT: projectId,
      },
    });
    child.on('exit', (code) => stop(code || 0));
  }
} catch (e) {
  console.error(e);
  await stop(1);
}
