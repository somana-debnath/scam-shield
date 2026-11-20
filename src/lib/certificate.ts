export interface CertificateData {
  name: string;
  score: number;
  rank: string;
  date: Date;
  badges: string[]; // emoji
  levels: number;
}

export const CERT_W = 1600;
export const CERT_H = 1000;

const SHIELD = 'M32 4.5c7.6 4.6 15.4 6.6 22.6 7 1.2.1 2 1 2 2.2v13.6c0 15.3-9.4 26.6-23.6 32.2a2.6 2.6 0 01-2 0C16.8 53.9 7.4 42.6 7.4 27.3V13.7c0-1.2.8-2.1 2-2.2 7.2-.4 15-2.4 22.6-7z';
const CHECK = 'M21 32.5l7.5 7.5L44 24.5';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 64, size / 64);
  const g = ctx.createLinearGradient(10, 4, 54, 60);
  g.addColorStop(0, '#6D64F5');
  g.addColorStop(1, '#4338CA');
  ctx.fillStyle = g;
  ctx.fill(new Path2D(SHIELD));
  ctx.strokeStyle = '#6EE7B7';
  ctx.lineWidth = 6.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(CHECK));
  ctx.restore();
}

/** Make sure Google Fonts are ready before drawing text onto canvas. */
export async function loadCertificateFonts() {
  if (!('fonts' in document)) return;
  await Promise.all([
    document.fonts.load('700 96px Fredoka'),
    document.fonts.load('600 40px Fredoka'),
    document.fonts.load('500 28px Inter'),
    document.fonts.load('700 28px Inter'),
  ]).catch(() => undefined);
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, weight: string, family: string) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  } while (size > 32);
  return size;
}

export function drawCertificate(canvas: HTMLCanvasElement, d: CertificateData) {
  canvas.width = CERT_W;
  canvas.height = CERT_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // background
  ctx.fillStyle = '#FAF8F4';
  ctx.fillRect(0, 0, CERT_W, CERT_H);

  // soft blobs
  const blob = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CERT_W, CERT_H);
  };
  blob(140, 120, 520, 'rgba(165,180,252,0.55)');
  blob(1500, 900, 560, 'rgba(110,231,183,0.45)');
  blob(1450, 120, 380, 'rgba(255,122,102,0.25)');

  // card
  ctx.save();
  ctx.shadowColor = 'rgba(40,32,110,0.18)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  roundRect(ctx, 70, 70, CERT_W - 140, CERT_H - 140, 48);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
  roundRect(ctx, 96, 96, CERT_W - 192, CERT_H - 192, 34);
  ctx.setLineDash([2, 14]);
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#C7C2F5';
  ctx.stroke();
  ctx.setLineDash([]);

  // header
  drawShield(ctx, CERT_W / 2 - 60, 140, 120);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4F46E5';
  ctx.font = '700 30px Inter, sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('CERTIFICATE OF SCAM-SPOTTING', CERT_W / 2, 320);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#585670';
  ctx.font = '500 30px Inter, sans-serif';
  ctx.fillText('This certifies that', CERT_W / 2, 390);

  // name
  const name = d.name.trim() || 'A Scam Shield Player';
  ctx.fillStyle = '#181630';
  fitText(ctx, name, CERT_W - 360, 104, '700', 'Fredoka, sans-serif');
  ctx.fillText(name, CERT_W / 2, 500);
  ctx.fillStyle = '#34D399';
  roundRect(ctx, CERT_W / 2 - 180, 528, 360, 10, 5);
  ctx.fill();

  ctx.fillStyle = '#585670';
  ctx.font = '500 32px Inter, sans-serif';
  ctx.fillText(`completed all ${d.levels} levels of Scam Shield and can spot the scam before it spots them.`, CERT_W / 2, 610);

  // stats pills
  const pill = (cx: number, label: string, value: string, bg: string, fg: string) => {
    const w = 300;
    roundRect(ctx, cx - w / 2, 660, w, 130, 30);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.fillStyle = fg;
    fitText(ctx, value, w - 48, 56, '600', 'Fredoka, sans-serif');
    ctx.fillText(value, cx, 735);
    ctx.font = '700 20px Inter, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(label, cx, 770);
    ctx.letterSpacing = '0px';
  };
  pill(CERT_W / 2 - 340, 'SCAM-PROOF SCORE', `${d.score}/100`, '#E8E6FF', '#4338CA');
  pill(CERT_W / 2, 'RANK', d.rank, '#D6F8E9', '#047857');
  pill(CERT_W / 2 + 340, 'BADGES', d.badges.length ? d.badges.slice(0, 5).join('') : '—', '#FEF3C7', '#92400E');

  // footer
  ctx.fillStyle = '#585670';
  ctx.font = '500 24px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(d.date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }), 150, 862);
  ctx.textAlign = 'right';
  ctx.font = '600 30px Fredoka, sans-serif';
  ctx.fillStyle = '#181630';
  ctx.fillText('Scam', CERT_W - 150 - ctx.measureText('Shield').width, 864);
  ctx.fillStyle = '#4338CA';
  ctx.fillText('Shield', CERT_W - 150, 864);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

export function fileNameFor(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `scam-shield-certificate${slug ? `-${slug}` : ''}.png`;
}
