import { build } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildNotices } from './licenses.mjs';
export async function buildExport() {
  await buildNotices();
  await mkdir('public/export', { recursive: true });
  await build({
    configFile: false,
    logLevel: 'error',
    publicDir: false,
    build: {
      outDir: 'public/export',
      emptyOutDir: false,
      minify: true,
      lib: {
        entry: 'src/runtime/worker.js',
        formats: ['iife'],
        name: 'KodeWorker',
        fileName: () => '.worker-bundle.js',
      },
      rolldownOptions: { output: { codeSplitting: false } },
    },
  });
  const source = await readFile('public/export/.worker-bundle.js', 'utf8');
  await writeFile(
    'public/export/worker-source.js',
    'window.KV_WORKER=' + JSON.stringify(source) + ';',
  );
  await build({
    configFile: false,
    logLevel: 'error',
    publicDir: false,
    build: {
      outDir: 'public/export',
      emptyOutDir: false,
      minify: true,
      lib: {
        entry: 'src/export-host.js',
        formats: ['iife'],
        name: 'KodeExport',
        fileName: () => 'host.js',
      },
      rolldownOptions: { output: { codeSplitting: false } },
    },
  });
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/export-build.mjs')) await buildExport();
