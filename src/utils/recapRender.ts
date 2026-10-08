// Draws the year-end recap as Instagram Story slides (1080 x 1920 PNGs).
// Everything is drawn on a canvas from data and assets bundled with the app,
// so it works offline. Visual language matches the app: white ground, the
// 100-mile blue grid, 2px (here 6px at story scale) blue strokes, Work Sans,
// black bold uppercase headings, the patterned nav band at the bottom.

import gridSvg from '../assets/map/grid.svg?raw';
import outlineSvg from '../assets/map/states-outline.svg?raw';
import stateLinesSvg from '../assets/map/state-lines.svg?raw';
import routeSvg from '../assets/map/route.svg?raw';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import svgPaths from '../imports/svg-do3t78tvh5';
import { WORDMARK_PATH } from '../components/Wordmark';
import { MAP_LAYOUT, TOWN_ANCHORS } from '../data/mapGeometry';
import { mileToRoutePoint } from './routeLocation';
import { formatNumber } from './measurements';
import { routeLabel, type RideDirection } from './direction';
import { excerpt, splitDuration, type RecapData } from './recap';

export const SLIDE_W = 1080;
export const SLIDE_H = 1920;

const BLUE = '#40C8EF';
const INK = '#000000';
const MUTED = 'rgba(0,0,0,0.6)';
const ORANGE = '#FF6B35';
const YELLOW = '#febc12';
const FONT = '"Work Sans Variable", "Work Sans", system-ui, sans-serif';
const STROKE = 6; // the app's 2px stroke at story scale
const RADIUS = 22;
const SIDE = 90; // side margin
const BAND_TOP = 1716; // patterned band at the bottom, like the app's nav

export interface RecapSlide {
  id: string;
  label: string;
  blob: Blob;
  url: string;
}

// ---------- drawing helpers ----------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

function setFont(ctx: CanvasRenderingContext2D, size: number, weight: number, tracking = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  // letterSpacing is supported in current Safari and Chrome; ignore elsewhere
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${tracking}px`;
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  opts: { size: number; weight?: number; color?: string; align?: CanvasTextAlign; tracking?: number; upper?: boolean },
) {
  setFont(ctx, opts.size, opts.weight ?? 400, opts.tracking ?? 0);
  ctx.fillStyle = opts.color ?? INK;
  ctx.textAlign = opts.align ?? 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(opts.upper ? value.toUpperCase() : value, x, y);
}

/** Shrink a single line until it fits. */
function fitText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number, size: number, weight: number, tracking = 0): number {
  let s = size;
  setFont(ctx, s, weight, tracking);
  while (ctx.measureText(value).width > maxWidth && s > 20) {
    s -= 2;
    setFont(ctx, s, weight, tracking);
  }
  return s;
}

function wrap(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function strokeBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = BLUE) {
  roundRect(ctx, x + STROKE / 2, y + STROKE / 2, w - STROKE, h - STROKE, RADIUS);
  ctx.lineWidth = STROKE;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

const fmtDate = (ts: number, opts: Intl.DateTimeFormatOptions) => new Date(ts).toLocaleDateString('en-US', opts);

// ---------- shared frame ----------

interface Assets {
  pattern: HTMLImageElement;
  map: HTMLImageElement | null;
  photos: HTMLImageElement[];
}

function drawFrame(ctx: CanvasRenderingContext2D, assets: Assets, data: RecapData, index: number, total: number) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);

  // Header: globe + wordmark, centered, in the app's blue
  const markW = 560;
  const markScale = markW / 204;
  const globe = 64;
  const gap = 18;
  const totalW = globe + gap + markW;
  const left = (SLIDE_W - totalW) / 2;
  const top = 168;
  ctx.save();
  ctx.translate(left, top);
  ctx.scale(globe / 24, globe / 24);
  ctx.fillStyle = BLUE;
  ctx.fill(new Path2D(svgPaths.pee90000));
  ctx.restore();
  ctx.save();
  ctx.translate(left + globe + gap, top + (globe - 13 * markScale) / 2);
  ctx.scale(markScale, markScale);
  ctx.fillStyle = BLUE;
  ctx.fill(new Path2D(WORDMARK_PATH));
  ctx.restore();

  // Bottom band: the dot-grid pattern with a blue rule, like the nav bar
  const tile = 540;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, BAND_TOP, SLIDE_W, SLIDE_H - BAND_TOP);
  ctx.clip();
  for (let x = 0; x < SLIDE_W; x += tile) for (let y = BAND_TOP; y < SLIDE_H; y += tile) ctx.drawImage(assets.pattern, x, y, tile, tile);
  ctx.restore();
  ctx.fillStyle = BLUE;
  ctx.fillRect(0, BAND_TOP, SLIDE_W, STROKE);
  text(ctx, `${data.year} Recap`, SIDE, BAND_TOP + 110, { size: 38, weight: 600, color: BLUE, align: 'left', upper: true });
  text(ctx, `${index + 1} / ${total}`, SLIDE_W - SIDE, BAND_TOP + 110, { size: 38, weight: 600, color: BLUE, align: 'right' });
}

/** Page title and gray line under it, like the app's page headers. */
function drawHeading(ctx: CanvasRenderingContext2D, title: string, meta?: string, y = 400) {
  const size = fitText(ctx, title.toUpperCase(), SLIDE_W - SIDE * 2, 76, 700, -1);
  text(ctx, title, SLIDE_W / 2, y, { size, weight: 700, upper: true, tracking: -1 });
  if (meta) text(ctx, meta, SLIDE_W / 2, y + 70, { size: 40, color: MUTED });
}

// ---------- slides ----------

type SlideDraw = (ctx: CanvasRenderingContext2D) => void;

function coverSlide(data: RecapData, direction: RideDirection): SlideDraw {
  return (ctx) => {
    text(ctx, 'Tour Divide', SLIDE_W / 2, 560, { size: 96, weight: 700, upper: true, tracking: -2 });
    text(ctx, String(data.year), SLIDE_W / 2, 880, { size: 340, weight: 800, tracking: -12 });
    text(ctx, routeLabel(direction), SLIDE_W / 2, 990, { size: 46, color: MUTED });
    if (data.firstDate && data.lastDate) {
      const range = `${fmtDate(data.firstDate, { month: 'short', day: 'numeric' })} – ${fmtDate(data.lastDate, { month: 'short', day: 'numeric' })}`;
      text(ctx, range, SLIDE_W / 2, 1060, { size: 46, color: MUTED });
    }

    // Three stat boxes, like the timer's digit boxes
    const days = data.ride
      ? Math.max(1, Math.round(data.ride.time / 86400000))
      : data.firstDate && data.lastDate
        ? Math.round((data.lastDate - data.firstDate) / 86400000) + 1
        : 0;
    const stats = [
      { value: days, label: 'Days' },
      { value: data.entries.length, label: 'Entries' },
      data.photos.length > 0 ? { value: data.photos.length, label: 'Photos' } : { value: data.townsWritten.length, label: 'Towns' },
    ];
    const gap = 30;
    const w = (SLIDE_W - SIDE * 2 - gap * 2) / 3;
    const y = 1230;
    stats.forEach((s, i) => {
      const x = SIDE + i * (w + gap);
      strokeBox(ctx, x, y, w, 230);
      const size = fitText(ctx, formatNumber(s.value), w - 40, 120, 700);
      text(ctx, formatNumber(s.value), x + w / 2, y + 160, { size, weight: 700 });
      text(ctx, s.label, x + w / 2, y + 300, { size: 34, weight: 500, color: MUTED, upper: true, tracking: 1 });
    });
  };
}

function rideSlide(data: RecapData): SlideDraw {
  const ride = data.ride!;
  return (ctx) => {
    // Status pill
    const pill = ride.type === 'finish' ? 'Finish' : 'Scratch';
    setFont(ctx, 34, 600, 1);
    const pw = ctx.measureText(pill.toUpperCase()).width + 56;
    roundRect(ctx, (SLIDE_W - pw) / 2, 300, pw, 66, 12);
    ctx.fillStyle = ride.type === 'finish' ? BLUE : ORANGE;
    ctx.fill();
    text(ctx, pill, SLIDE_W / 2, 346, { size: 34, weight: 600, color: '#fff', upper: true, tracking: 1 });

    drawHeading(ctx, 'Ride time', ride.title, 490);

    // Days / hours / minutes boxes
    const d = splitDuration(ride.time);
    const parts = [
      { v: d.days, l: 'Days' },
      { v: d.hours, l: 'Hours' },
      { v: d.minutes, l: 'Min' },
    ];
    const gap = 30;
    const w = (SLIDE_W - SIDE * 2 - gap * 2) / 3;
    const y = 640;
    parts.forEach((p, i) => {
      const x = SIDE + i * (w + gap);
      strokeBox(ctx, x, y, w, 250);
      text(ctx, String(p.v).padStart(2, '0'), x + w / 2, y + 175, { size: 150, weight: 700, tracking: -4 });
      text(ctx, p.l, x + w / 2, y + 315, { size: 34, weight: 500, color: MUTED, upper: true, tracking: 1 });
    });

    // State splits, as a bordered list
    const laps = ride.laps.slice(0, 7);
    if (laps.length) {
      text(ctx, 'States', SIDE, 1080, { size: 36, weight: 600, align: 'left', upper: true, tracking: 1 });
      const rowH = 82;
      const top = 1110;
      const h = rowH * laps.length;
      strokeBox(ctx, SIDE, top, SLIDE_W - SIDE * 2, h + STROKE);
      laps.forEach((lap, i) => {
        const ry = top + STROKE / 2 + i * rowH;
        if (i > 0) {
          ctx.fillStyle = 'rgba(64,200,239,0.35)';
          ctx.fillRect(SIDE + STROKE, ry, SLIDE_W - SIDE * 2 - STROKE * 2, 3);
        }
        const t = splitDuration(lap.time);
        text(ctx, lap.title, SIDE + 40, ry + 54, { size: 38, weight: 600, align: 'left', upper: true });
        text(ctx, t.days ? `${t.days}d ${t.hours}h ${t.minutes}m` : `${t.hours}h ${t.minutes}m`, SLIDE_W - SIDE - 40, ry + 54, { size: 38, color: MUTED, align: 'right' });
      });
    }
  };
}

function mapSlide(data: RecapData, assets: Assets): SlideDraw {
  return (ctx) => {
    const towns = data.townsWritten.length;
    drawHeading(ctx, 'Where you wrote', `${towns} ${towns === 1 ? 'town' : 'towns'} · ${data.entries.length} ${data.entries.length === 1 ? 'entry' : 'entries'}`, 380);
    if (assets.map) {
      const w = 720;
      const h = (w * MAP_LAYOUT.viewBox.height) / MAP_LAYOUT.viewBox.width;
      ctx.drawImage(assets.map, (SLIDE_W - w) / 2, 520, w, Math.min(h, BAND_TOP - 560));
    }
  };
}

function photosSlide(data: RecapData, assets: Assets): SlideDraw {
  return (ctx) => {
    const n = data.photos.length;
    drawHeading(ctx, 'On the road', `${n} ${n === 1 ? 'photo' : 'photos'}`, 380);
    const imgs = assets.photos.slice(0, 4);
    const x0 = SIDE;
    const W = SLIDE_W - SIDE * 2;
    const y0 = 520;
    const H = 1110;
    const gap = 30;
    const cells: [number, number, number, number][] =
      imgs.length === 1
        ? [[x0, y0, W, H]]
        : imgs.length === 2
          ? [[x0, y0, W, (H - gap) / 2], [x0, y0 + (H + gap) / 2, W, (H - gap) / 2]]
          : imgs.length === 3
            ? [[x0, y0, W, (H - gap) / 2], [x0, y0 + (H + gap) / 2, (W - gap) / 2, (H - gap) / 2], [x0 + (W + gap) / 2, y0 + (H + gap) / 2, (W - gap) / 2, (H - gap) / 2]]
            : [0, 1, 2, 3].map((i) => [x0 + (i % 2) * ((W + gap) / 2), y0 + Math.floor(i / 2) * ((H + gap) / 2), (W - gap) / 2, (H - gap) / 2]);
    imgs.forEach((img, i) => {
      const [x, y, w, h] = cells[i];
      ctx.save();
      roundRect(ctx, x, y, w, h, RADIUS);
      ctx.clip();
      drawCover(ctx, img, x, y, w, h);
      ctx.restore();
      strokeBox(ctx, x, y, w, h);
    });
  };
}

function highlightSlide(data: RecapData): SlideDraw {
  const hl = data.highlight!;
  return (ctx) => {
    text(ctx, 'From the journal', SLIDE_W / 2, 380, { size: 40, weight: 600, color: BLUE, upper: true, tracking: 1 });

    // Big opening quote, then the excerpt
    text(ctx, '“', SIDE - 10, 610, { size: 240, weight: 700, color: BLUE, align: 'left' });
    setFont(ctx, 62, 400, -0.5);
    let body = excerpt(hl.text, 330);
    let lines = wrap(ctx, body, SLIDE_W - SIDE * 2);
    while (lines.length > 9) {
      body = excerpt(hl.text, body.length - 40);
      lines = wrap(ctx, body, SLIDE_W - SIDE * 2);
    }
    const lh = 86;
    lines.forEach((l, i) => text(ctx, l, SIDE, 640 + i * lh, { size: 62, color: INK, align: 'left', tracking: -0.5 }));

    const after = 640 + lines.length * lh + 50;
    ctx.fillStyle = BLUE;
    ctx.fillRect(SIDE, after, 120, STROKE);
    const where = hl.town ? `${hl.town.name}, ${hl.town.state}` : 'On the route';
    text(ctx, where, SIDE, after + 80, { size: 42, weight: 700, align: 'left', upper: true });
    text(ctx, fmtDate(hl.timestamp, { weekday: 'long', month: 'long', day: 'numeric' }), SIDE, after + 140, { size: 38, color: MUTED, align: 'left' });
  };
}

function numbersSlide(data: RecapData): SlideDraw {
  return (ctx) => {
    drawHeading(ctx, 'By the numbers', undefined, 400);
    const stats = [
      { v: data.entries.length, l: 'Journal entries' },
      { v: data.words, l: 'Words written' },
      { v: data.townsWritten.length, l: 'Towns' },
      { v: data.photos.length, l: 'Photos' },
      { v: data.resupplies, l: 'Resupplies logged' },
      { v: data.ride?.laps.length ?? 0, l: 'States recorded' },
    ].filter((s) => s.v > 0);
    const gap = 30;
    const w = (SLIDE_W - SIDE * 2 - gap) / 2;
    const h = 250;
    stats.forEach((s, i) => {
      const x = SIDE + (i % 2) * (w + gap);
      const y = 500 + Math.floor(i / 2) * (h + gap);
      strokeBox(ctx, x, y, w, h);
      const size = fitText(ctx, formatNumber(s.v), w - 60, 120, 700, -2);
      text(ctx, formatNumber(s.v), x + w / 2, y + 140, { size, weight: 700, tracking: -2 });
      text(ctx, s.l, x + w / 2, y + 205, { size: 32, weight: 500, color: MUTED, upper: true, tracking: 1 });
    });
  };
}

// ---------- map asset ----------

const inner = (svg: string) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/** The app's map, with a black dot on every town the rider wrote about. */
function mapSvg(data: RecapData): string {
  const { viewBox, grid, statesOutline, stateLines, route } = MAP_LAYOUT;
  const written = new Set(data.townsWritten.map((t) => t.id));
  const dots = TOWN_ANCHORS.filter((a) => written.has(a.townId))
    .map((a) => {
      const [x, y] = mileToRoutePoint(a.mile);
      return `<circle cx="${x}" cy="${y}" r="3.4" fill="#231F20"/>`;
    })
    .join('');
  const [sx, sy] = mileToRoutePoint(0);
  const [ex, ey] = mileToRoutePoint(TOWN_ANCHORS[TOWN_ANCHORS.length - 1].mile);
  const ends = [
    [sx, sy],
    [ex, ey],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${YELLOW}" stroke="#231F20" stroke-width="1.2"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}" width="${viewBox.width * 4}" height="${viewBox.height * 4}" fill="none">
<g fill="none" transform="translate(${grid.x} ${grid.y})">${inner(gridSvg)}</g>
<g fill="none" transform="translate(${statesOutline.x} ${statesOutline.y})">${inner(outlineSvg)}</g>
<g fill="none" transform="translate(${stateLines.x} ${stateLines.y})">${inner(stateLinesSvg)}</g>
<g transform="translate(${route.x} ${route.y}) scale(${route.scaleX} ${route.scaleY})"><g fill="none">${inner(routeSvg)}</g>${dots}${ends}</g>
</svg>`;
}

// ---------- public ----------

export async function renderRecapSlides(data: RecapData, direction: RideDirection): Promise<RecapSlide[]> {
  if (document.fonts) {
    await Promise.all([400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 60px "Work Sans Variable"`).catch(() => [])));
  }

  const [pattern, map, ...photos] = await Promise.all([
    loadImage(navBgPattern),
    loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(mapSvg(data))}`).catch(() => null),
    ...data.photos.slice(0, 4).map((p) => loadImage(p).catch(() => null)),
  ]);
  const assets: Assets = { pattern: pattern as HTMLImageElement, map: map as HTMLImageElement | null, photos: photos.filter(Boolean) as HTMLImageElement[] };

  // Only the slides there's something to show for
  const plan: { id: string; label: string; draw: SlideDraw }[] = [{ id: 'cover', label: 'Cover', draw: coverSlide(data, direction) }];
  if (data.ride) plan.push({ id: 'ride', label: 'Ride time', draw: rideSlide(data) });
  if (data.townsWritten.length) plan.push({ id: 'map', label: 'Map', draw: mapSlide(data, assets) });
  if (assets.photos.length) plan.push({ id: 'photos', label: 'Photos', draw: photosSlide(data, assets) });
  if (data.highlight) plan.push({ id: 'journal', label: 'Journal', draw: highlightSlide(data) });
  plan.push({ id: 'numbers', label: 'Numbers', draw: numbersSlide(data) });

  const slides: RecapSlide[] = [];
  for (let i = 0; i < plan.length; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = SLIDE_W;
    canvas.height = SLIDE_H;
    const ctx = canvas.getContext('2d')!;
    drawFrame(ctx, assets, data, i, plan.length);
    plan[i].draw(ctx);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not draw slide'))), 'image/png'),
    );
    slides.push({ id: plan[i].id, label: plan[i].label, blob, url: URL.createObjectURL(blob) });
  }
  return slides;
}
