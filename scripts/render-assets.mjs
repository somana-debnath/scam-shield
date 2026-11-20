// Renders brand PNGs (og:image, favicons) from HTML using a locally installed
// Chrome or Edge. Run with: npm run assets
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const shield = readFileSync(`${root}public/favicon.svg`, 'utf8');

async function launch() {
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel });
    } catch {
      /* try next */
    }
  }
  throw new Error('Install Google Chrome or Microsoft Edge to render assets.');
}

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Inter:wght@500;600;700&display=block" rel="stylesheet">`;

const og = `<!doctype html><html><head>${fonts}<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; font-family: Inter, sans-serif; background: #FAF8F4; position: relative; color: #181630; }
  .blob { position: absolute; border-radius: 50%; filter: blur(70px); }
  .wrap { position: relative; display: flex; height: 100%; padding: 72px 80px; gap: 40px; align-items: center; }
  .left { flex: 1; }
  .logo { display: flex; align-items: center; gap: 14px; font-family: Fredoka; font-weight: 700; font-size: 40px; }
  .logo svg { width: 64px; height: 64px; }
  .logo b { color: #4338CA; }
  h1 { font-family: Fredoka; font-weight: 700; font-size: 78px; line-height: 1.0; margin-top: 36px; letter-spacing: -1px; }
  h1 span { color: #4338CA; }
  p { margin-top: 24px; font-size: 26px; color: #585670; font-weight: 500; }
  .chips { display: flex; gap: 12px; margin-top: 30px; }
  .chip { padding: 10px 20px; border-radius: 999px; font-weight: 700; font-size: 22px; }
  .phone { width: 330px; height: 560px; margin-bottom: -170px; border-radius: 52px; background: #16142b; padding: 13px; box-shadow: 0 40px 80px -20px rgba(40,32,110,.45); transform: rotate(6deg); }
  .screen { background: #FAF8F4; border-radius: 40px; height: 100%; padding: 56px 20px 20px; position: relative; }
  .island { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 96px; height: 28px; border-radius: 99px; background: #16142b; }
  .from { font-weight: 700; font-size: 18px; } .from small { display:block; font-weight:600; color:#C2410C; font-size: 14px; }
  .bubble { margin-top: 20px; background: #F3F1FC; border-radius: 24px 24px 24px 8px; padding: 16px 18px; font-size: 18px; line-height: 1.5; }
  mark { background: linear-gradient(transparent 55%, rgba(255,122,102,.4) 55%); color: #C2410C; font-weight: 700; }
  .link { color: #2563EB; text-decoration: underline; font-weight: 700; }
  .stamp { position: absolute; right: 30px; top: 400px; transform: rotate(-8deg); border: 5px solid #FF7A66; color: #C2410C; font-family: Fredoka; font-weight: 700; font-size: 34px; padding: 2px 16px; border-radius: 16px; background: rgba(255,255,255,.85); }
</style></head><body>
  <div class="blob" style="width:420px;height:420px;background:#A5B4FC;left:-120px;top:-140px;opacity:.6"></div>
  <div class="blob" style="width:420px;height:420px;background:#6EE7B7;right:-80px;bottom:-160px;opacity:.55"></div>
  <div class="blob" style="width:260px;height:260px;background:#FF7A66;right:300px;top:-60px;opacity:.25"></div>
  <div class="wrap">
    <div class="left">
      <div class="logo">${shield}<span>Scam<b>Shield</b></span></div>
      <h1>Spot the scam<br><span>before it spots you.</span></h1>
      <p>A free swipe game that trains your eye for fake texts, emails, voicemails and pop-ups.</p>
      <div class="chips">
        <span class="chip" style="background:#FFE4DE;color:#C2410C">← Report</span>
        <span class="chip" style="background:#D6F8E9;color:#047857">Trust →</span>
      </div>
    </div>
    <div class="phone"><div class="screen"><div class="island"></div>
      <div class="from">+1 (365) 555-0101<small>Unknown number</small></div>
      <div class="bubble">ParcelPoint: your package is on hold due to an <mark>unpaid $1.99 fee</mark>. <mark>Pay within 24h</mark> or it will be returned.<br><br><span class="link">parcelpoint-redelivery.info</span></div>
      <div class="stamp">REPORT</div>
    </div></div>
  </div>
</body></html>`;

const icon = (size, pad) => `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${pad ? '#FAF8F4' : 'transparent'}">
  <div style="width:${pad ? size * 0.78 : size}px;height:${pad ? size * 0.78 : size}px">${shield.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`;

const browser = await launch();
async function render(html, w, h, out, transparent = false) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${root}${out}`, omitBackground: transparent });
  await page.close();
  console.log('wrote', out);
}

await render(og, 1200, 630, 'public/og-image.png');
await render(icon(32, false), 32, 32, 'public/favicon-32.png', true);
await render(icon(180, true), 180, 180, 'public/apple-touch-icon.png');
await browser.close();
