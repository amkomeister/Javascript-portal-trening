import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { firestoreStore } from '../server/store.js';
import { exportData, restoreData } from '../server/backup.js';
const [action, file] = process.argv.slice(2),
  projectId = process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId || !file || !['export', 'restore'].includes(action))
  throw Error(
    'Bruk GOOGLE_CLOUD_PROJECT og pnpm backup/restore <fil.json>. Lokal database krev FIRESTORE_EMULATOR_HOST.',
  );
if (!process.env.FIRESTORE_EMULATOR_HOST && process.env.CONFIRM_PROJECT !== projectId)
  throw Error('For ekte data må driftsansvarleg setje CONFIRM_PROJECT lik GOOGLE_CLOUD_PROJECT.');
const store = firestoreStore(projectId);
try {
  if (action === 'export') {
    await writeFile(resolve(file), JSON.stringify(await exportData(store.db), null, 2), {
      flag: 'wx',
    });
    console.log('Sikkerheitskopi lagra. Oppbevar fila skjerma.');
  } else {
    await restoreData(store.db, JSON.parse(await readFile(resolve(file), 'utf8')));
    console.log('Gjenoppretta i tom database. Brukarane må logge inn på nytt.');
  }
} finally {
  await store.db.terminate();
}
