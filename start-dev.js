import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = parseInt(process.env.PORT || '5173');

const server = await createServer({
  root: __dirname,
  server: { port, host: true },
});

await server.listen();
server.printUrls();
