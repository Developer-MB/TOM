import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.basename(serverDirectory) === 'lib'
  ? path.resolve(serverDirectory, '../..')
  : path.resolve(serverDirectory, '..');
dotenv.config({ path: path.join(projectDirectory, '.env') });

const { default: app } = await import('./src/app.js');
const port = Number(process.env.PORT ?? 3001);
const frontendDirectory = path.join(projectDirectory, 'dist');

app.use(express.static(frontendDirectory, { index: false, maxAge: '1h' }));
app.get('/{*path}', (_request, response) => {
  response.sendFile(path.join(frontendDirectory, 'index.html'));
});

app.listen(port, () => {
  console.info(`TOM API listening on port ${port}`);
});
