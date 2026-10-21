import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, sep } from 'node:path';
import { unzipSync } from 'fflate';
const root = resolve('.local/tools');
await mkdir(root, { recursive: true });
async function download(url, name, sha) {
  const target = resolve(root, name);
  let data;
  try {
    data = await readFile(target);
  } catch {}
  if (!data || createHash('sha256').update(data).digest('hex') !== sha) {
    console.log('Hentar ' + name);
    const response = await fetch(url);
    if (!response.ok) throw Error('Nedlasting feila: ' + response.status);
    data = Buffer.from(await response.arrayBuffer());
    if (createHash('sha256').update(data).digest('hex') !== sha)
      throw Error('Feil kontrollsum: ' + name);
    await writeFile(target, data);
  }
  return target;
}
await download(
  'https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v1.22.0.jar',
  'firestore.jar',
  '9b6498b7f62714d67f48f59b3818883cd682dbcd46b9f59511de81c97bb5166c',
);
if (process.platform === 'win32') {
  const zip = await download(
    'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_x64_windows_hotspot_21.0.12.1_1.zip',
    'java.zip',
    'd35f31e712f0fcf6ac5a093edc90204fbff22f720ba3950bd09d331d5e621636',
  );
  if (!(await readdir(root)).some((n) => n.startsWith('jdk-'))) {
    for (const [name, bytes] of Object.entries(unzipSync(await readFile(zip)))) {
      const path = resolve(root, name);
      if (!path.startsWith(root + sep)) throw Error('Ugyldig arkivsti.');
      if (name.endsWith('/')) await mkdir(path, { recursive: true });
      else {
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, bytes);
      }
    }
  }
} else if (spawnSync('java', ['-version'], { stdio: 'ignore' }).status !== 0)
  throw Error('Installer Java 21 eller nyare, og køyr oppsettet på nytt.');
console.log('Lokale verktøy klare. Ingen maskininnstillingar er endra.');
