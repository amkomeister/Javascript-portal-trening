import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// Notices include transitive packages bundled into the browser and offline export.
export async function buildNotices() {
  const blocks = [];
  for (const entry of await readdir('node_modules/.pnpm')) {
    const nested = resolve('node_modules/.pnpm', entry, 'node_modules');
    let names;
    try {
      names = await readdir(nested, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const item of names) {
      if (!item.isDirectory()) continue;
      const dirs = item.name.startsWith('@')
        ? (await readdir(resolve(nested, item.name), { withFileTypes: true }))
            .filter((d) => d.isDirectory())
            .map((d) => resolve(nested, item.name, d.name))
        : [resolve(nested, item.name)];
      for (const dir of dirs) {
        let pkg;
        try {
          pkg = JSON.parse(await readFile(resolve(dir, 'package.json'), 'utf8'));
        } catch {
          continue;
        }
        const files = (await readdir(dir)).filter((n) =>
          /^(licen[cs]e|copying|notice)(\.|$)/i.test(n),
        );
        for (const name of files) {
          try {
            blocks.push(
              pkg.name +
                ' ' +
                pkg.version +
                ' — ' +
                name +
                '\n' +
                (await readFile(resolve(dir, name), 'utf8')),
            );
          } catch {}
        }
      }
    }
  }
  blocks.unshift('Kodeverkstad Skule\n' + (await readFile('LICENSE', 'utf8')));
  await mkdir('public/export', { recursive: true });
  await writeFile(
    'public/export/THIRD-PARTY.txt',
    blocks.sort().join('\n\n----------------------------------------\n\n'),
  );
}
