// Records docs/hero.gif for the README by driving the running dev server
// with a local Chrome/Edge. Start `npm run dev` first, then: npm run hero-gif
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';
import { chromium } from 'playwright-core';

const { GIFEncoder, quantize, applyPalette } = gifenc;
const root = fileURLToPath(new URL('..', import.meta.url));
const BASE = process.env.BASE_URL ?? 'http://localhost:5178';
const W = 1100;
const H = 720;

// Level 1 senders → correct answer, so the demo plays well.
const ANSWERS = {
  '+1 (849) 555-0193': 'report',
  'Maple Ridge Bank': 'report',
  'Brightpath Pharmacy': 'trust',
  'System Alert': 'report',
  '+1 (213) 555-0177': 'report',
  'Hollow Pine Secondary': 'trust',
};

let browser;
for (const channel of ['chrome', 'msedge']) {
  try { browser = await chromium.launch({ channel }); break; } catch { /* next */ }
}
if (!browser) throw new Error('Install Google Chrome or Microsoft Edge.');

const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const frames = [];

async function capture(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    frames.push({ png: await page.screenshot({ type: 'png' }), t: Date.now() });
  }
}

async function senderName() {
  const label = await page.locator('[role=region][aria-label*=" from "]').first().getAttribute('aria-label');
  return label?.replace(/^.*? from /, '') ?? '';
}

async function swipe(choice) {
  const card = page.locator('.cursor-grab').first();
  const box = await card.boundingBox();
  const sx = box.x + box.width / 2;
  const sy = box.y + box.height / 2;
  const dx = choice === 'trust' ? 260 : -260;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (let i = 1; i <= 14; i++) {
    await page.mouse.move(sx + (dx * i) / 14, sy + i, { steps: 1 });
    await page.waitForTimeout(35);
  }
  await page.mouse.up();
}

// 1. Landing hero with the self-playing phone
await page.goto(BASE + '/');
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForTimeout(1200);
await capture(3200);

// 2. Play three messages of level 1
await page.goto(BASE + '/play/1');
for (let round = 0; round < 3; round++) {
  await capture(1300); // buzz in
  const name = await senderName();
  const choice = ANSWERS[name] ?? 'report';
  await Promise.all([swipe(choice), capture(900)]);
  await capture(2600); // reveal + confetti
  await page.keyboard.press('Enter');
}
await browser.close();

// Encode
const enc = GIFEncoder();
frames.forEach((f, i) => {
  const { data, width, height } = PNG.sync.read(f.png);
  const palette = quantize(data, 128);
  const index = applyPalette(data, palette);
  const next = frames[i + 1]?.t ?? f.t + 600;
  const delay = Math.max(50, Math.min(600, next - f.t));
  enc.writeFrame(index, width, height, { palette, delay });
});
enc.finish();
mkdirSync(`${root}docs`, { recursive: true });
writeFileSync(`${root}docs/hero.gif`, enc.bytes());
console.log(`wrote docs/hero.gif (${frames.length} frames)`);
