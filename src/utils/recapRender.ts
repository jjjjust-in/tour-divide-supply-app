// Draws the year-end recap as Instagram Story slides (1080 x 1920 PNGs).
// Everything is drawn on a canvas from data and assets bundled with the app,
// so it works offline. Visual language matches the app: white ground, the
// 100-mile blue grid, 2px (here 6px at story scale) blue strokes, Work Sans,
// black bold uppercase headings, the patterned nav band at the bottom.

import gridSvg from '../assets/map/grid.svg?raw';
import outlineSvg from '../assets/map/states-outline.svg?raw';
import stateLinesSvg from '../assets/map/state-lines.svg?raw';
import routeSvg from '../assets/map/route.svg?raw';
import coloradoLabelSvg from '../assets/map/labels/colorado.svg?raw';
import idahoLabelSvg from '../assets/map/labels/idaho.svg?raw';
import montanaLabelSvg from '../assets/map/labels/montana.svg?raw';
import newMexicoLabelSvg from '../assets/map/labels/new-mexico.svg?raw';
import wyomingLabelSvg from '../assets/map/labels/wyoming.svg?raw';
import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import svgPaths from '../imports/svg-do3t78tvh5';
import { WORDMARK_PATH } from '../components/Wordmark';
import { MAP_LAYOUT, TOWN_ANCHORS } from '../data/mapGeometry';
import { MAP_STATES } from '../data/mapStates';
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
const BLUE_SOFT = 'rgba(64,200,239,0.18)';
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

function drawFrame(ctx: CanvasRenderingContext2D, assets: Assets, data: RecapData) {
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
  text(ctx, `${data.year} Race Recap`, SLIDE_W / 2, BAND_TOP + 110, { size: 38, weight: 600, color: BLUE, upper: true });
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
      const top = 510;
      const h = BAND_TOP - 60 - top;
      const w = (h * MAP_LAYOUT.viewBox.width) / MAP_LAYOUT.viewBox.height;
      ctx.drawImage(assets.map, (SLIDE_W - w) / 2, top, w, h);
    }
  };
}

const MAX_PHOTOS = 10;

// Mosaic layouts on a 6 x 8 grid: [col, row, width, height]. The first photo
// gets the big square; the rest tile around it.
const MOSAICS: [number, number, number, number][][] = [
  [],
  [[0, 0, 6, 8]],
  [[0, 0, 6, 4], [0, 4, 6, 4]],
  [[0, 0, 6, 5], [0, 5, 3, 3], [3, 5, 3, 3]],
  [[0, 0, 6, 5], [0, 5, 2, 3], [2, 5, 2, 3], [4, 5, 2, 3]],
  [[0, 0, 4, 4], [4, 0, 2, 2], [4, 2, 2, 2], [0, 4, 3, 4], [3, 4, 3, 4]],
  [[0, 0, 4, 4], [4, 0, 2, 2], [4, 2, 2, 2], [0, 4, 2, 2], [0, 6, 2, 2], [2, 4, 4, 4]],
  [[0, 0, 4, 4], [4, 0, 2, 2], [4, 2, 2, 2], [0, 4, 2, 2], [0, 6, 2, 2], [2, 4, 4, 2], [2, 6, 4, 2]],
  [[0, 0, 4, 4], [4, 0, 2, 2], [4, 2, 2, 2], [0, 4, 2, 2], [2, 4, 2, 2], [4, 4, 2, 2], [0, 6, 3, 2], [3, 6, 3, 2]],
  [[0, 0, 4, 4], [4, 0, 2, 2], [4, 2, 2, 2], [0, 4, 2, 2], [2, 4, 2, 2], [4, 4, 2, 2], [0, 6, 2, 2], [2, 6, 2, 2], [4, 6, 2, 2]],
  [[0, 0, 4, 4], [4, 0, 2, 2], [4, 2, 2, 2], [0, 4, 2, 2], [2, 4, 2, 2], [4, 4, 2, 2], [0, 6, 1.5, 2], [1.5, 6, 1.5, 2], [3, 6, 1.5, 2], [4.5, 6, 1.5, 2]],
];

function photosSlide(data: RecapData, assets: Assets): SlideDraw {
  return (ctx) => {
    const n = data.photos.length;
    drawHeading(ctx, 'On the road', `${n} ${n === 1 ? 'photo' : 'photos'}`, 380);
    const imgs = assets.photos.slice(0, MAX_PHOTOS);
    const x0 = SIDE;
    const y0 = 510;
    const W = SLIDE_W - SIDE * 2;
    const H = BAND_TOP - 70 - y0;
    const gap = 24;
    const colW = W / 6;
    const rowH = H / 8;
    // Small tiles get a smaller corner so they still read as rounded squares
    MOSAICS[imgs.length].forEach(([c, r, cw, rh], i) => {
      const x = x0 + c * colW + (c > 0 ? gap / 2 : 0);
      const y = y0 + r * rowH + (r > 0 ? gap / 2 : 0);
      const w = cw * colW - (c > 0 ? gap / 2 : 0) - (c + cw < 6 ? gap / 2 : 0);
      const h = rh * rowH - (r > 0 ? gap / 2 : 0) - (r + rh < 8 ? gap / 2 : 0);
      ctx.save();
      roundRect(ctx, x, y, w, h, RADIUS);
      ctx.clip();
      drawCover(ctx, imgs[i], x, y, w, h);
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

// ---------- by the numbers: one small chart per stat ----------

const DAY = 86400000;
const dayKey = (ts: number) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** Entries and words per day across the ride, or per week if it ran long. */
function perPeriod(data: RecapData) {
  if (!data.firstDate || !data.lastDate) return { entries: [], words: [], weekly: false };
  const start = dayKey(data.firstDate);
  const days = Math.round((dayKey(data.lastDate) - start) / DAY) + 1;
  const weekly = days > 45;
  const n = weekly ? Math.ceil(days / 7) : days;
  const entries = new Array<number>(n).fill(0);
  const words = new Array<number>(n).fill(0);
  data.entries.forEach((e) => {
    const d = Math.round((dayKey(e.timestamp) - start) / DAY);
    const i = weekly ? Math.floor(d / 7) : d;
    entries[i] += 1;
    words[i] += e.content.trim().split(/\s+/).filter(Boolean).length;
  });
  return { entries, words, weekly };
}

type Panel = { span: 'full' | 'half'; base: number; draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void };

const PAD = 40;

const SIDE_COL = 250; // label column on wide cards

/** Card frame with its label and big number. Returns the chart area: below them,
 *  or to their right on a wide card ('side'). */
function panelFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  layout: 'stack' | 'side' = 'stack',
) {
  strokeBox(ctx, x, y, w, h);
  const colW = layout === 'side' ? SIDE_COL : w - PAD * 2;
  text(ctx, label, x + PAD, y + 62, { size: 28, weight: 600, color: MUTED, align: 'left', upper: true, tracking: 1 });
  const size = fitText(ctx, value, colW, 84, 700, -2);
  text(ctx, value, x + PAD, y + 150, { size, weight: 700, align: 'left', tracking: -2 });
  return layout === 'side'
    ? { cx: x + PAD + SIDE_COL + 30, cy: y + PAD + 6, cw: w - PAD * 2 - SIDE_COL - 30, ch: h - PAD * 2 - 6 }
    : { cx: x + PAD, cy: y + 186, cw: w - PAD * 2, ch: h - 186 - PAD };
}

function smallLabel(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, align: CanvasTextAlign = 'left') {
  text(ctx, value, x, y, { size: 24, weight: 500, color: MUTED, align, upper: true, tracking: 1 });
}

function columns(ctx: CanvasRenderingContext2D, values: number[], x: number, y: number, w: number, h: number) {
  const max = Math.max(1, ...values);
  const gap = values.length > 24 ? 4 : 8;
  const bw = (w - gap * (values.length - 1)) / values.length;
  values.forEach((v, i) => {
    const bh = v > 0 ? Math.max(8, (h * v) / max) : 0;
    const bx = x + i * (bw + gap);
    ctx.fillStyle = BLUE_SOFT;
    ctx.fillRect(bx, y, bw, h);
    if (bh) {
      ctx.fillStyle = BLUE;
      ctx.fillRect(bx, y + h - bh, bw, bh);
    }
  });
}

function numbersSlide(data: RecapData, direction: RideDirection): SlideDraw {
  return (ctx) => {
    drawHeading(ctx, 'By the numbers', undefined, 340);
    const { entries, words, weekly } = perPeriod(data);
    const period = weekly ? 'week' : 'day';
    const dateRange = (cx: number, by: number, cw: number) => {
      if (!data.firstDate || !data.lastDate) return;
      smallLabel(ctx, fmtDate(data.firstDate, { month: 'short', day: 'numeric' }), cx, by);
      smallLabel(ctx, fmtDate(data.lastDate, { month: 'short', day: 'numeric' }), cx + cw, by, 'right');
    };

    const panels: Panel[] = [];

    // Journal entries: a column for each day
    if (data.entries.length) {
      panels.push({
        span: 'full',
        base: 230,
        draw: (ctx, x, y, w, h) => {
          const a = panelFrame(ctx, x, y, w, h, 'Entries', formatNumber(data.entries.length), 'side');
          smallLabel(ctx, `Per ${period}`, x + PAD, y + h - PAD);
          columns(ctx, entries, a.cx, a.cy, a.cw, a.ch - 40);
          dateRange(a.cx, a.cy + a.ch, a.cw);
        },
      });
    }

    // Words written: a line through the ride
    if (data.words) {
      panels.push({
        span: 'half',
        base: 370,
        draw: (ctx, x, y, w, h) => {
          const a = panelFrame(ctx, x, y, w, h, 'Words written', formatNumber(data.words));
          const ch = a.ch - 40;
          const max = Math.max(1, ...words);
          const pts = words.map((v, i) => [a.cx + (words.length === 1 ? a.cw / 2 : (a.cw * i) / (words.length - 1)), a.cy + ch - (ch * v) / max] as const);
          ctx.beginPath();
          ctx.moveTo(pts[0][0], a.cy + ch);
          pts.forEach(([px, py]) => ctx.lineTo(px, py));
          ctx.lineTo(pts[pts.length - 1][0], a.cy + ch);
          ctx.closePath();
          ctx.fillStyle = BLUE_SOFT;
          ctx.fill();
          ctx.beginPath();
          pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
          ctx.lineWidth = STROKE;
          ctx.lineJoin = 'round';
          ctx.strokeStyle = BLUE;
          ctx.stroke();
          ctx.fillStyle = INK;
          ctx.fillRect(a.cx, a.cy + ch, a.cw, 3);
          smallLabel(ctx, `Most in a ${period}: ${formatNumber(max)}`, a.cx, a.cy + a.ch);
        },
      });
    }

    // Photos: share of entries with a photo
    if (data.photos.length) {
      panels.push({
        span: 'half',
        base: 370,
        draw: (ctx, x, y, w, h) => {
          panelFrame(ctx, x, y, w, h, 'Photos', formatNumber(data.photos.length));
          const share = data.entries.length ? data.photos.length / data.entries.length : 1;
          const ring = 30;
          const r = Math.min((h - PAD * 2) / 2, (w - PAD * 2) * 0.32) - ring / 2;
          const ox = x + w - PAD - r - ring / 2;
          const oy = y + h / 2;
          ctx.lineWidth = ring;
          ctx.lineCap = 'butt';
          ctx.strokeStyle = BLUE_SOFT;
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = BLUE;
          ctx.beginPath();
          ctx.arc(ox, oy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, share));
          ctx.stroke();
          text(ctx, `${Math.round(Math.min(1, share) * 100)}%`, ox, oy + 6, { size: 48, weight: 700, tracking: -1 });
          smallLabel(ctx, 'of entries', ox, oy + 42, 'center');
        },
      });
    }

    // Towns: the whole route as a line, filled dots where the rider wrote
    if (data.townsWritten.length) {
      panels.push({
        span: 'full',
        base: 230,
        draw: (ctx, x, y, w, h) => {
          const total = data.routeTowns.length;
          const a = panelFrame(ctx, x, y, w, h, 'Towns', String(data.townsWritten.length), 'side');
          smallLabel(ctx, `Of ${total}`, x + PAD, y + h - PAD);
          const towns = direction === 'nobo' ? [...data.routeTowns].reverse() : data.routeTowns;
          const first = towns[0];
          const last = towns[towns.length - 1];
          const span = Math.abs(last.mileage - first.mileage) || 1;
          const ly = a.cy + (a.ch - 40) / 2 + 4;
          ctx.fillStyle = BLUE;
          ctx.fillRect(a.cx, ly - STROKE / 2, a.cw, STROKE);
          const written = new Set(data.townsWritten.map((t) => t.id));
          towns.forEach((t) => {
            const tx = a.cx + (a.cw * Math.abs(t.mileage - first.mileage)) / span;
            ctx.beginPath();
            ctx.arc(tx, ly, written.has(t.id) ? 11 : 7, 0, Math.PI * 2);
            ctx.fillStyle = written.has(t.id) ? INK : '#ffffff';
            ctx.fill();
            if (!written.has(t.id)) {
              ctx.lineWidth = 4;
              ctx.strokeStyle = BLUE;
              ctx.stroke();
            }
          });
          smallLabel(ctx, first.name, a.cx, a.cy + a.ch);
          smallLabel(ctx, last.name, a.cx + a.cw, a.cy + a.ch, 'right');
        },
      });
    }

    // States: entries per state, in ride order
    const stateOrder = [...new Set((direction === 'nobo' ? [...data.routeTowns].reverse() : data.routeTowns).map((t) => t.state))];
    const perState = stateOrder.map((st) => ({
      st,
      n: data.entries.filter((e) => data.routeTowns.find((t) => t.id === e.townId)?.state === st).length,
    }));
    const statesWritten = perState.filter((s) => s.n > 0).length;
    if (statesWritten) {
      panels.push({
        span: 'half',
        base: 370,
        draw: (ctx, x, y, w, h) => {
          const a = panelFrame(ctx, x, y, w, h, 'States', String(statesWritten));
          columns(ctx, perState.map((s) => s.n), a.cx, a.cy, a.cw, a.ch - 40);
          const gap = 8;
          const bw = (a.cw - gap * (perState.length - 1)) / perState.length;
          perState.forEach((s, i) => smallLabel(ctx, s.st, a.cx + i * (bw + gap) + bw / 2, a.cy + a.ch, 'center'));
        },
      });
    }

    // Resupplies: one square per stop
    if (data.resupplies) {
      panels.push({
        span: 'half',
        base: 370,
        draw: (ctx, x, y, w, h) => {
          const a = panelFrame(ctx, x, y, w, h, 'Resupplies', formatNumber(data.resupplies));
          const shown = Math.min(data.resupplies, 40);
          // Largest square size that fits them all
          let size = 64;
          const gap = 10;
          const fits = (s: number) => Math.floor((a.cw + gap) / (s + gap)) * Math.floor((a.ch + gap) / (s + gap)) >= shown;
          while (size > 12 && !fits(size)) size -= 2;
          const perRow = Math.floor((a.cw + gap) / (size + gap));
          for (let i = 0; i < shown; i++) {
            roundRect(ctx, a.cx + (i % perRow) * (size + gap), a.cy + Math.floor(i / perRow) * (size + gap), size, size, Math.min(10, size / 4));
            ctx.fillStyle = BLUE;
            ctx.fill();
          }
        },
      });
    }

    // Pack into rows: full cards alone, half cards in pairs (a lone half goes full width)
    const rows: Panel[][] = [];
    for (let i = 0; i < panels.length; i++) {
      const p = panels[i];
      if (p.span === 'half' && panels[i + 1]?.span === 'half') {
        rows.push([p, panels[i + 1]]);
        i++;
      } else rows.push([p]);
    }
    if (!rows.length) return;

    const gap = 28;
    const top = 390;
    const bottom = BAND_TOP - 50;
    const baseOf = (row: Panel[]) => Math.max(...row.map((p) => p.base));
    const gaps = gap * (rows.length - 1);
    const content = rows.reduce((sum, r) => sum + baseOf(r), 0);
    const k = Math.min(1.3, (bottom - top - gaps) / content);
    let y = top + Math.max(0, (bottom - top - gaps - content * k) / 2);
    const W = SLIDE_W - SIDE * 2;
    rows.forEach((row) => {
      const h = baseOf(row) * k;
      const w = row.length === 2 ? (W - gap) / 2 : W;
      row.forEach((p, i) => p.draw(ctx, SIDE + i * (w + gap), y, w, h));
      y += h + gap;
    });
  };
}

// ---------- map asset ----------

const inner = (svg: string) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// State name artwork, sized and placed exactly as on the Route page
const svgSize = (svg: string) => ({
  width: Number(svg.match(/<svg[^>]*\bwidth="([\d.]+)"/)?.[1]),
  height: Number(svg.match(/<svg[^>]*\bheight="([\d.]+)"/)?.[1]),
});
const STATE_LABEL_HEIGHT = 6;
const STATE_LABELS: Record<string, string> = {
  MT: montanaLabelSvg,
  ID: idahoLabelSvg,
  WY: wyomingLabelSvg,
  CO: coloradoLabelSvg,
  NM: newMexicoLabelSvg,
};

/** The Route page's map: every town as a dot, a ring around the ones the rider wrote about. */
function mapSvg(data: RecapData): string {
  const { viewBox, grid, statesOutline, stateLines, route } = MAP_LAYOUT;
  const written = new Set(data.townsWritten.map((t) => t.id));
  const labels = MAP_STATES.map((state) => {
    const svg = STATE_LABELS[state.abbr];
    if (!svg) return '';
    const { width, height } = svgSize(svg);
    const k = STATE_LABEL_HEIGHT / height;
    const [lx, ly] = state.labelAt;
    return `<g transform="translate(${lx - (width * k) / 2} ${ly - STATE_LABEL_HEIGHT / 2}) scale(${k})">${inner(svg)}</g>`;
  }).join('');
  const towns = TOWN_ANCHORS.map((a) => {
    const [x, y] = mileToRoutePoint(a.mile);
    const ring = written.has(a.townId) ? `<circle cx="${x}" cy="${y}" r="4.6" fill="none" stroke="#231F20" stroke-width="1"/>` : '';
    return `${ring}<circle cx="${x}" cy="${y}" r="2.4" fill="#231F20"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}" width="${viewBox.width * 4}" height="${viewBox.height * 4}" fill="none">
<g fill="none" transform="translate(${grid.x} ${grid.y})">${inner(gridSvg)}</g>
<g fill="none" transform="translate(${statesOutline.x} ${statesOutline.y})">${inner(outlineSvg)}</g>
<g fill="none" transform="translate(${stateLines.x} ${stateLines.y})">${inner(stateLinesSvg)}</g>
<g transform="translate(${stateLines.x} ${stateLines.y})">${labels}</g>
<g transform="translate(${route.x} ${route.y}) scale(${route.scaleX} ${route.scaleY})"><g fill="none">${inner(routeSvg)}</g>${towns}</g>
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
    ...data.photos.slice(0, MAX_PHOTOS).map((p) => loadImage(p).catch(() => null)),
  ]);
  const assets: Assets = { pattern: pattern as HTMLImageElement, map: map as HTMLImageElement | null, photos: photos.filter(Boolean) as HTMLImageElement[] };

  // Only the slides there's something to show for
  const plan: { id: string; label: string; draw: SlideDraw }[] = [{ id: 'cover', label: 'Cover', draw: coverSlide(data, direction) }];
  if (data.ride) plan.push({ id: 'ride', label: 'Ride time', draw: rideSlide(data) });
  if (data.townsWritten.length) plan.push({ id: 'map', label: 'Map', draw: mapSlide(data, assets) });
  if (assets.photos.length) plan.push({ id: 'photos', label: 'Photos', draw: photosSlide(data, assets) });
  if (data.highlight) plan.push({ id: 'journal', label: 'Journal', draw: highlightSlide(data) });
  plan.push({ id: 'numbers', label: 'Numbers', draw: numbersSlide(data, direction) });

  const slides: RecapSlide[] = [];
  for (let i = 0; i < plan.length; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = SLIDE_W;
    canvas.height = SLIDE_H;
    const ctx = canvas.getContext('2d')!;
    drawFrame(ctx, assets, data);
    plan[i].draw(ctx);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not draw slide'))), 'image/png'),
    );
    slides.push({ id: plan[i].id, label: plan[i].label, blob, url: URL.createObjectURL(blob) });
  }
  return slides;
}
