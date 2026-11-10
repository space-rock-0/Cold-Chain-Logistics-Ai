import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
process.argv = [process.execPath, 'next', 'dev', 'frontend'];
await import('../frontend/node_modules/next/dist/bin/next');
