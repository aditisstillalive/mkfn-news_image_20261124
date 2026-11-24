// make.fun news-image-20261124 entry (Node 22, standard library only).
// The image is entry.png beside this file, rendered ahead of time from build/page.html.
// The grader runs this with no network and copies the bytes unchanged to /output/entry.png.
// Locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
copyFileSync(new URL('./entry.png', import.meta.url), join(outDir, 'entry.png'));
