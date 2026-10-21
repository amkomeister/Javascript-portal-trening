import { buildExport } from './export-build.mjs';
import { build } from 'vite';
await buildExport();
await build();
