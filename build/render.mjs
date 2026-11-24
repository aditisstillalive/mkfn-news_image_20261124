// Render build/page.html to entry.png (1024x1024) and a 300 px preview for legibility checks.
// Usage: node build/render.mjs [previewDir]
import { chromium } from 'playwright';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const previewDir = process.argv[2] ?? join(root, 'out');
const pageUrl = 'file://' + join(here, 'page.html');

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  await page.goto(pageUrl);
  await page.evaluate(() => document.fonts.ready);

  // Fail loudly if any element overflows the 1024x1024 canvas.
  const overflow = await page.evaluate(() => {
    const d = document.documentElement;
    return { w: d.scrollWidth, h: d.scrollHeight };
  });
  if (overflow.w > 1024 || overflow.h > 1024) console.warn('WARNING: page overflows canvas', overflow);

  const out = join(root, 'entry.png');
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1024, height: 1024 } });

  // 300 px copy: draw the PNG scaled down in the browser itself.
  const small = await browser.newPage({ viewport: { width: 300, height: 300 } });
  await small.goto('file://' + out);
  await small.setContent(`<body style="margin:0"><img src="file://${out}" style="width:300px;height:300px;display:block"></body>`);
  await small.waitForTimeout(200);
  await small.screenshot({ path: join(previewDir, 'preview-300.png') });

  const bytes = statSync(out).size;
  console.log(`entry.png ${bytes} bytes (${(bytes / 1048576).toFixed(3)} MiB)`, bytes > 1048576 ? 'TOO BIG' : 'ok');
} finally {
  await browser.close();
}
