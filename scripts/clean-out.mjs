import fs from 'node:fs';
import path from 'node:path';

fs.rmSync(path.join(process.cwd(), 'out'), { recursive: true, force: true });
