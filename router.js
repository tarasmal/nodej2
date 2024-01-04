import { readdir } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = new Map();
const baseDir = path.join(__dirname, 'routes');

async function getRouters(dirname, base = '') {
    const workdir = path.join(baseDir, dirname);
    const dirEntries = await readdir(workdir, { withFileTypes: true });

    const promises = dirEntries.map(async (dirent) => {
        const entryPath = path.join(workdir, dirent.name);

        if (dirent.isDirectory()) {
            await getRouters(path.join(dirname, dirent.name));
        } else if (dirent.isFile() && dirent.name === 'index.js') {
            const moduleURL = pathToFileURL(entryPath).href;
            const module = await import(moduleURL);
            const routePath = path.join('/', dirname);
            const normalizedRoutePath = path.normalize(routePath).replaceAll(path.sep, '/');
            router.set(normalizedRoutePath, module.default || module);
        }
    });

    await Promise.all(promises);
}

await getRouters('');

console.log(router)

export default router;
