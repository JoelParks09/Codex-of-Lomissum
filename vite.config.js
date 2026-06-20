import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const craftedEquipmentPath = path.resolve(
  projectRoot,
  'src/data/crafted_equipment.json',
);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'crafted-equipment-api',
      configureServer(server) {
        server.middlewares.use('/api/crafted-equipment', async (request, response) => {
          if (request.method !== 'POST') {
            response.statusCode = 405;
            response.end('Method not allowed');
            return;
          }

          try {
            const chunks = [];

            for await (const chunk of request) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }

            const craftedItem = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const currentFile = await fs.readFile(craftedEquipmentPath, 'utf8');
            const currentEquipment = JSON.parse(currentFile);

            if (!Array.isArray(currentEquipment)) {
              throw new Error('crafted_equipment.json must contain an array.');
            }

            const nextEquipment = [craftedItem, ...currentEquipment];

            await fs.writeFile(
              craftedEquipmentPath,
              `${JSON.stringify(nextEquipment, null, 2)}\n`,
            );

            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(nextEquipment));
          } catch (error) {
            response.statusCode = 500;
            response.end(
              error instanceof Error ? error.message : 'Unable to save crafted equipment.',
            );
          }
        });
      },
    },
  ],
});
