// make.fun news-image-20261124 entry (Node 22, standard library only).
// The image is entry.png beside this file, rendered ahead of time from build/page.html.
// The grader runs this with no network and copies the bytes unchanged to /output/entry.png.
// Locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const png = readFileSync(new URL('./entry.png', import.meta.url));

// Refuse to emit an image the gate would reject: PNG signature, size cap, IHDR dimensions, IEND at the end.
if (!png.subarray(0, 8).equals(PNG_SIG)) throw new Error('entry.png is not a PNG');
if (png.length > MAX_BYTES) throw new Error(`entry.png is ${png.length} bytes, over 1 MiB`);
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) throw new Error(`entry.png is ${width}x${height}, over 1024x1024`);
if (png.subarray(png.length - 8, png.length - 4).toString('latin1') !== 'IEND') throw new Error('entry.png is truncated');

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
writeFileSync(join(outDir, 'entry.png'), png);
