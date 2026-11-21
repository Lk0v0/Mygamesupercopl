/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BloodSplat, Bullet, ItemDrop, Player, WeaponType, Zombie, ZombieType } from '../types';
import { getForestData } from './ForestWorld';

export type LightColorKey = 'amber' | 'orange' | 'cyan' | 'red' | 'green' | 'purple' | 'white';

export interface SceneFlashLight {
  x: number;
  y: number;
  radius: number;
  color: LightColorKey;
  alpha: number;
  decay: number;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

const LIGHT_RGB: Record<LightColorKey, string> = {
  amber: '251, 191, 36',
  orange: '249, 115, 22',
  cyan: '34, 211, 238',
  red: '239, 68, 68',
  green: '132, 204, 22',
  purple: '192, 132, 252',
  white: '248, 250, 252',
};

let lightSpritesCache: Record<LightColorKey, HTMLCanvasElement> | null = null;
let smokeSpritesCache: Record<'light' | 'mid' | 'dark' | 'ember' | 'toxic' | 'cyan' | 'purple' | 'deepPurple', HTMLCanvasElement> | null = null;
let fireballSpritesCache: Record<'fire' | 'crimson' | 'soot', HTMLCanvasElement> | null = null;
let zombieGroundTile: HTMLCanvasElement | null = null;
let dustMotes: DustMote[] | null = null;
let giLightCanvas: HTMLCanvasElement | null = null;

export const DAY_NIGHT_CYCLE_SECONDS = 180; // 3 full minutes per complete cycle

export type DayPhaseId = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';

export interface DayNightState {
  cycleProgress: number; // 0..1
  phase: DayPhaseId;
  phaseLabel: string;
  clockText: string; // 24h in-world clock e.g. "14:22"
  darknessAlpha: number;
  ambientRgb: [number, number, number];
  sunRgb: [number, number, number];
  shadowDirX: number;
  shadowDirY: number;
  shadowStretch: number;
  shadowAlpha: number;
  sunbeamAlpha: number;
  campfireStrength: number;
  flashlightStrength: number;
  fireflyStrength: number;
  sunWarmth: number;
}

interface DayKeyframe {
  t: number;
  darkness: number;
  ambientRgb: [number, number, number];
  sunRgb: [number, number, number];
  shadowDirX: number;
  shadowDirY: number;
  stretch: number;
  shadowAlpha: number;
  sunbeam: number;
  campfire: number;
  flashlight: number;
  firefly: number;
  sunWarmth: number;
}

const DAY_KEYFRAMES: DayKeyframe[] = [
  {
    t: 0.0,
    darkness: 0.34,
    ambientRgb: [36, 24, 42],
    sunRgb: [253, 186, 116],
    shadowDirX: 0.88,
    shadowDirY: 0.34,
    stretch: 1.72,
    shadowAlpha: 0.36,
    sunbeam: 0.28,
    campfire: 0.72,
    flashlight: 0.42,
    firefly: 0.3,
    sunWarmth: 0.72,
  },
  {
    t: 0.14,
    darkness: 0.04,
    ambientRgb: [14, 24, 18],
    sunRgb: [254, 243, 199],
    shadowDirX: 0.68,
    shadowDirY: 0.56,
    stretch: 1.15,
    shadowAlpha: 0.38,
    sunbeam: 0.22,
    campfire: 0.32,
    flashlight: 0.05,
    firefly: 0.0,
    sunWarmth: 0.36,
  },
  {
    t: 0.34,
    darkness: 0.01,
    ambientRgb: [12, 22, 16],
    sunRgb: [255, 251, 235],
    shadowDirX: 0.24,
    shadowDirY: 0.78,
    stretch: 0.86,
    shadowAlpha: 0.34,
    sunbeam: 0.16,
    campfire: 0.24,
    flashlight: 0.0,
    firefly: 0.0,
    sunWarmth: 0.2,
  },
  {
    t: 0.5,
    darkness: 0.22,
    ambientRgb: [52, 24, 18],
    sunRgb: [251, 146, 60],
    shadowDirX: -0.82,
    shadowDirY: 0.46,
    stretch: 1.82,
    shadowAlpha: 0.42,
    sunbeam: 0.36,
    campfire: 0.68,
    flashlight: 0.34,
    firefly: 0.28,
    sunWarmth: 0.9,
  },
  {
    t: 0.62,
    darkness: 0.58,
    ambientRgb: [14, 16, 38],
    sunRgb: [165, 180, 252],
    shadowDirX: -0.72,
    shadowDirY: 0.62,
    stretch: 1.42,
    shadowAlpha: 0.32,
    sunbeam: 0.14,
    campfire: 0.95,
    flashlight: 0.84,
    firefly: 0.8,
    sunWarmth: 0.08,
  },
  {
    t: 0.76,
    darkness: 0.78,
    ambientRgb: [5, 10, 24],
    sunRgb: [147, 197, 253],
    shadowDirX: -0.45,
    shadowDirY: 0.75,
    stretch: 1.15,
    shadowAlpha: 0.28,
    sunbeam: 0.12,
    campfire: 1.0,
    flashlight: 1.0,
    firefly: 1.0,
    sunWarmth: 0.0,
  },
  {
    t: 0.91,
    darkness: 0.56,
    ambientRgb: [16, 18, 36],
    sunRgb: [196, 181, 253],
    shadowDirX: 0.55,
    shadowDirY: 0.62,
    stretch: 1.35,
    shadowAlpha: 0.3,
    sunbeam: 0.16,
    campfire: 0.9,
    flashlight: 0.76,
    firefly: 0.68,
    sunWarmth: 0.18,
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getDayNightState(cycleElapsedSec: number): DayNightState {
  const norm = (((cycleElapsedSec % DAY_NIGHT_CYCLE_SECONDS) + DAY_NIGHT_CYCLE_SECONDS) % DAY_NIGHT_CYCLE_SECONDS) / DAY_NIGHT_CYCLE_SECONDS;

  let k0 = DAY_KEYFRAMES[DAY_KEYFRAMES.length - 1];
  let k1 = DAY_KEYFRAMES[0];
  let span = 1 - k0.t + k1.t;
  let local = norm >= k0.t ? norm - k0.t : norm + (1 - k0.t);

  for (let i = 0; i < DAY_KEYFRAMES.length - 1; i++) {
    if (norm >= DAY_KEYFRAMES[i].t && norm < DAY_KEYFRAMES[i + 1].t) {
      k0 = DAY_KEYFRAMES[i];
      k1 = DAY_KEYFRAMES[i + 1];
      span = Math.max(0.001, k1.t - k0.t);
      local = norm - k0.t;
      break;
    }
  }

  const rawU = Math.max(0, Math.min(1, local / span));
  const u = rawU * rawU * (3 - 2 * rawU);

  const sdx = lerp(k0.shadowDirX, k1.shadowDirX, u);
  const sdy = lerp(k0.shadowDirY, k1.shadowDirY, u);
  const sMag = Math.hypot(sdx, sdy) || 1;

  let phase: DayPhaseId = 'DAY';
  let phaseLabel = 'DIA';
  if (norm < 0.12 || norm >= 0.92) {
    phase = 'DAWN';
    phaseLabel = 'AMANHECER';
  } else if (norm < 0.46) {
    phase = 'DAY';
    phaseLabel = 'DIA';
  } else if (norm < 0.62) {
    phase = 'DUSK';
    phaseLabel = 'ENTARDECER';
  } else {
    phase = 'NIGHT';
    phaseLabel = 'NOITE';
  }

  // Virtual 24h clock starting at 06:00 AM
  const totalMinutes = Math.floor(((norm * 24 + 6) % 24) * 60);
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const mm = (totalMinutes % 60).toString().padStart(2, '0');

  return {
    cycleProgress: norm,
    phase,
    phaseLabel,
    clockText: `${hh}:${mm}`,
    darknessAlpha: lerp(k0.darkness, k1.darkness, u),
    ambientRgb: [
      Math.round(lerp(k0.ambientRgb[0], k1.ambientRgb[0], u)),
      Math.round(lerp(k0.ambientRgb[1], k1.ambientRgb[1], u)),
      Math.round(lerp(k0.ambientRgb[2], k1.ambientRgb[2], u)),
    ],
    sunRgb: [
      Math.round(lerp(k0.sunRgb[0], k1.sunRgb[0], u)),
      Math.round(lerp(k0.sunRgb[1], k1.sunRgb[1], u)),
      Math.round(lerp(k0.sunRgb[2], k1.sunRgb[2], u)),
    ],
    shadowDirX: sdx / sMag,
    shadowDirY: sdy / sMag,
    shadowStretch: lerp(k0.stretch, k1.stretch, u),
    shadowAlpha: lerp(k0.shadowAlpha, k1.shadowAlpha, u),
    sunbeamAlpha: lerp(k0.sunbeam, k1.sunbeam, u),
    campfireStrength: lerp(k0.campfire, k1.campfire, u),
    flashlightStrength: lerp(k0.flashlight, k1.flashlight, u),
    fireflyStrength: lerp(k0.firefly, k1.firefly, u),
    sunWarmth: lerp(k0.sunWarmth, k1.sunWarmth, u),
  };
}

function createSoftLightSprite(rgb: string): HTMLCanvasElement {
  const size = 128;
  const half = size / 2;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  const grad = g.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(0.22, `rgba(${rgb}, 0.62)`);
  grad.addColorStop(0.52, `rgba(${rgb}, 0.22)`);
  grad.addColorStop(0.8, `rgba(${rgb}, 0.05)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function createVolumetricSmokeSprite(
  coreRgb: string,
  outerRgb: string,
  highlightRgb: string
): HTMLCanvasElement {
  const size = 160;
  const half = size / 2;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  // Multi-scale turbulent smoke puffs + asymmetric curling wisps baked once for zero-lag 60fps
  const puffs = [
    { x: 0, y: 0, r: 52, op: 0.62, rgb: coreRgb },
    { x: -18, y: -12, r: 40, op: 0.54, rgb: highlightRgb },
    { x: 20, y: -8, r: 38, op: 0.5, rgb: outerRgb },
    { x: -12, y: 20, r: 36, op: 0.46, rgb: outerRgb },
    { x: 16, y: 18, r: 34, op: 0.44, rgb: coreRgb },
    { x: -28, y: 4, r: 28, op: 0.4, rgb: highlightRgb },
    { x: 6, y: -26, r: 30, op: 0.42, rgb: highlightRgb },
    { x: 28, y: 6, r: 24, op: 0.36, rgb: coreRgb },
    { x: -4, y: 28, r: 24, op: 0.34, rgb: outerRgb },
    { x: -20, y: -24, r: 20, op: 0.32, rgb: highlightRgb },
    { x: 24, y: -22, r: 19, op: 0.3, rgb: highlightRgb },
    { x: 0, y: 0, r: 22, op: 0.35, rgb: highlightRgb },
  ];

  for (let i = 0; i < puffs.length; i++) {
    const pf = puffs[i];
    const px = half + pf.x;
    const py = half + pf.y;
    const grad = g.createRadialGradient(px, py, 1, px, py, pf.r);
    grad.addColorStop(0, `rgba(${pf.rgb}, ${pf.op})`);
    grad.addColorStop(0.38, `rgba(${pf.rgb}, ${pf.op * 0.68})`);
    grad.addColorStop(0.72, `rgba(${outerRgb}, ${pf.op * 0.22})`);
    grad.addColorStop(1, `rgba(${outerRgb}, 0)`);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(px, py, pf.r, 0, Math.PI * 2);
    g.fill();
  }

  return c;
}

export function getSmokeSprites(): Record<'light' | 'mid' | 'dark' | 'ember' | 'toxic' | 'cyan' | 'purple' | 'deepPurple', HTMLCanvasElement> {
  if (smokeSpritesCache) return smokeSpritesCache;
  smokeSpritesCache = {
    light: createVolumetricSmokeSprite('226, 232, 240', '148, 163, 184', '248, 250, 252'),
    mid: createVolumetricSmokeSprite('148, 163, 184', '71, 85, 105', '226, 232, 240'),
    dark: createVolumetricSmokeSprite('51, 65, 85', '15, 23, 42', '100, 116, 139'),
    ember: createVolumetricSmokeSprite('234, 88, 12', '120, 53, 15', '253, 186, 116'),
    toxic: createVolumetricSmokeSprite('132, 204, 22', '63, 98, 18', '190, 242, 100'),
    cyan: createVolumetricSmokeSprite('186, 230, 253', '56, 189, 248', '240, 249, 255'),
    purple: createVolumetricSmokeSprite('168, 85, 247', '88, 28, 135', '233, 213, 255'),
    deepPurple: createVolumetricSmokeSprite('126, 34, 206', '46, 16, 101', '192, 132, 252'),
  };
  return smokeSpritesCache;
}

export function renderRealisticSmokeParticle(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  radius: number,
  alpha: number,
  rotation: number,
  color: string
): void {
  const sprites = getSmokeSprites();
  let key: 'light' | 'mid' | 'dark' | 'ember' | 'toxic' | 'cyan' | 'purple' | 'deepPurple' = 'mid';
  if (
    color.includes('59, 7, 100') ||
    color.includes('46, 16, 101') ||
    color.includes('88, 28, 135') ||
    color.includes('107, 33, 168') ||
    color.includes('30, 8, 52') ||
    color.includes('#581c87') ||
    color.includes('#4c1d95')
  ) {
    key = 'deepPurple';
  } else if (
    color.includes('147, 51, 234') ||
    color.includes('168, 85, 247') ||
    color.includes('192, 132, 252') ||
    color.includes('126, 34, 206') ||
    color.includes('216, 180, 254') ||
    color.includes('#a855f7') ||
    color.includes('#9333ea') ||
    color.includes('#c084fc') ||
    color.includes('#d946ef')
  ) {
    key = 'purple';
  } else if (color.includes('234, 88') || color.includes('fb923c') || color.includes('fdba74')) {
    key = 'ember';
  } else if (color.includes('132, 204') || color.includes('84cc16')) {
    key = 'toxic';
  } else if (color.includes('224, 242') || color.includes('38bdf8')) {
    key = 'cyan';
  } else if (color.includes('15, 23') || color.includes('30, 41') || color.includes('51, 65') || color.includes('71, 85')) {
    key = 'dark';
  } else if (color.includes('226, 232') || color.includes('203, 213') || color.includes('cbd5e1') || color.includes('e2e8f0')) {
    key = 'light';
  }

  const size = Math.max(10, radius * 3.15);
  ctx.save();
  ctx.translate(screenX, screenY);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
  ctx.drawImage(sprites[key], -size * 0.5, -size * 0.5, size, size);
  ctx.restore();
}

function createVolumetricFireballSprite(
  innerRgb: string,
  midRgb: string,
  outerRgb: string
): HTMLCanvasElement {
  const size = 192;
  const half = size / 2;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  // Chaotic turbulent outer fireball lobes (baked once into offscreen canvas)
  const lobes = [
    { x: 0, y: 0, r: 72, op: 0.55 },
    { x: -24, y: -16, r: 46, op: 0.62 },
    { x: 26, y: -12, r: 44, op: 0.6 },
    { x: -16, y: 26, r: 42, op: 0.58 },
    { x: 22, y: 22, r: 40, op: 0.56 },
    { x: -34, y: 8, r: 30, op: 0.5 },
    { x: 8, y: -32, r: 32, op: 0.52 },
    { x: 34, y: 10, r: 28, op: 0.48 },
    { x: -6, y: 34, r: 28, op: 0.45 },
  ];

  for (let i = 0; i < lobes.length; i++) {
    const lb = lobes[i];
    const lx = half + lb.x;
    const ly = half + lb.y;
    const grad = g.createRadialGradient(lx, ly, 2, lx, ly, lb.r);
    grad.addColorStop(0, `rgba(${innerRgb}, ${lb.op})`);
    grad.addColorStop(0.32, `rgba(${midRgb}, ${lb.op * 0.85})`);
    grad.addColorStop(0.68, `rgba(${outerRgb}, ${lb.op * 0.45})`);
    grad.addColorStop(1, `rgba(${outerRgb}, 0)`);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(lx, ly, lb.r, 0, Math.PI * 2);
    g.fill();
  }

  // Incandescent superheated central plasma flash core
  const coreGrad = g.createRadialGradient(half, half, 1, half, half, 42);
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
  coreGrad.addColorStop(0.35, `rgba(${innerRgb}, 0.88)`);
  coreGrad.addColorStop(0.75, `rgba(${midRgb}, 0.32)`);
  coreGrad.addColorStop(1, `rgba(${outerRgb}, 0)`);
  g.fillStyle = coreGrad;
  g.beginPath();
  g.arc(half, half, 42, 0, Math.PI * 2);
  g.fill();

  return c;
}

export function getFireballSprites(): Record<'fire' | 'crimson' | 'soot', HTMLCanvasElement> {
  if (fireballSpritesCache) return fireballSpritesCache;
  fireballSpritesCache = {
    fire: createVolumetricFireballSprite('254, 240, 138', '249, 115, 22', '185, 28, 28'),
    crimson: createVolumetricFireballSprite('254, 215, 170', '244, 63, 94', '136, 19, 55'),
    soot: createVolumetricSmokeSprite('30, 41, 59', '9, 9, 11', '124, 45, 18'),
  };
  return fireballSpritesCache;
}

export function renderRealisticExplosionParticle(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  radius: number,
  alpha: number,
  rotation: number,
  color: string
): void {
  const sprites = getFireballSprites();
  const isCrimson =
    color.includes('2255') ||
    color.includes('f43f5e') ||
    color.includes('e11d48') ||
    color.includes('be123c');
  const fireSprite = isCrimson ? sprites.crimson : sprites.fire;
  const clampedA = Math.min(1, Math.max(0, alpha));
  const size = Math.max(16, radius * 2.7);

  ctx.save();
  ctx.translate(screenX, screenY);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }

  // 1. Carbon smoke cloud backing builds as the fireball cools
  const sootAlpha = Math.min(0.88, (1 - clampedA * 0.55) * clampedA * 1.35);
  if (sootAlpha > 0.02) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = sootAlpha;
    const sootSize = size * 1.12;
    ctx.drawImage(sprites.soot, -sootSize * 0.5, -sootSize * 0.5, sootSize, sootSize);
  }

  // 2. Blazing additive volumetric fireball (cools naturally with alpha)
  const fireAlpha = Math.min(1, clampedA * 1.15);
  if (fireAlpha > 0.02) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = fireAlpha;
    ctx.drawImage(fireSprite, -size * 0.5, -size * 0.5, size, size);
  }

  ctx.restore();
}

export function renderRealisticShockwave(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  radius: number,
  alpha: number,
  color: string
): void {
  const clampedA = Math.min(1, Math.max(0, alpha));
  if (clampedA <= 0.01 || radius <= 2) return;

  ctx.save();
  ctx.translate(screenX, screenY);

  // Compressed air condensation halo (translucent distortion band)
  ctx.strokeStyle = `rgba(255, 255, 255, ${(clampedA * 0.24).toFixed(2)})`;
  ctx.lineWidth = Math.max(4, radius * 0.14);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.94, 0, Math.PI * 2);
  ctx.stroke();

  // Sharp supersonic pressure wave rim
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color;
  ctx.globalAlpha = clampedA * 0.72;
  ctx.lineWidth = Math.max(2, 4.5 * clampedA);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Crisp incandescent refraction highlight edge
  ctx.strokeStyle = '#ffffff';
  ctx.globalAlpha = clampedA * 0.65;
  ctx.lineWidth = Math.max(1, 1.8 * clampedA);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.01, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function getLightSprites(): Record<LightColorKey, HTMLCanvasElement> {
  if (lightSpritesCache) return lightSpritesCache;
  lightSpritesCache = {
    amber: createSoftLightSprite(LIGHT_RGB.amber),
    orange: createSoftLightSprite(LIGHT_RGB.orange),
    cyan: createSoftLightSprite(LIGHT_RGB.cyan),
    red: createSoftLightSprite(LIGHT_RGB.red),
    green: createSoftLightSprite(LIGHT_RGB.green),
    purple: createSoftLightSprite(LIGHT_RGB.purple),
    white: createSoftLightSprite(LIGHT_RGB.white),
  };
  return lightSpritesCache;
}

// Deterministic pseudo-random helper for static ground textures
function seededHash(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function createZombieGroundTile(): HTMLCanvasElement {
  const size = 480;
  const slab = 160;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  // Base deep weathered asphalt
  g.fillStyle = '#090d16';
  g.fillRect(0, 0, size, size);

  // Subtle concrete slab tone variations
  for (let gx = 0; gx < 3; gx++) {
    for (let gy = 0; gy < 3; gy++) {
      const h = seededHash(gx * 7 + gy * 13 + 3);
      g.fillStyle = h > 0.55 ? 'rgba(30, 41, 59, 0.22)' : 'rgba(15, 23, 42, 0.28)';
      g.fillRect(gx * slab + 2, gy * slab + 2, slab - 4, slab - 4);
    }
  }

  // Asphalt micro-aggregate grain (pre-baked once, 0 runtime cost)
  for (let i = 0; i < 950; i++) {
    const px = seededHash(i * 3.1) * size;
    const py = seededHash(i * 5.7) * size;
    const bright = seededHash(i * 9.3) > 0.5;
    g.fillStyle = bright ? 'rgba(148, 163, 184, 0.045)' : 'rgba(2, 6, 23, 0.26)';
    g.fillRect(px, py, i % 3 === 0 ? 2 : 1.3, 1.3);
  }

  // Subtle dark oil stains & weathering blotches
  for (let i = 0; i < 6; i++) {
    const ox = seededHash(i * 19 + 1) * size;
    const oy = seededHash(i * 23 + 2) * size;
    const or = 18 + seededHash(i * 31) * 30;
    const grad = g.createRadialGradient(ox, oy, 2, ox, oy, or);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0.42)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(ox, oy, or, 0, Math.PI * 2);
    g.fill();
  }

  // Concrete expansion seams
  g.strokeStyle = 'rgba(2, 6, 23, 0.72)';
  g.lineWidth = 2;
  for (let p = 0; p <= size; p += slab) {
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, size);
    g.moveTo(0, p);
    g.lineTo(size, p);
    g.stroke();
  }

  // Subtle beveled top-left catch-highlight along seams
  g.strokeStyle = 'rgba(100, 116, 139, 0.09)';
  g.lineWidth = 1;
  for (let p = 0; p < size; p += slab) {
    g.beginPath();
    g.moveTo(p + 1.5, 0);
    g.lineTo(p + 1.5, size);
    g.moveTo(0, p + 1.5);
    g.lineTo(size, p + 1.5);
    g.stroke();
  }

  // Hairline concrete fractures
  g.strokeStyle = 'rgba(2, 6, 23, 0.65)';
  g.lineWidth = 1.1;
  for (let cIdx = 0; cIdx < 5; cIdx++) {
    let cx = seededHash(cIdx * 41 + 5) * size;
    let cy = seededHash(cIdx * 47 + 8) * size;
    g.beginPath();
    g.moveTo(cx, cy);
    for (let seg = 0; seg < 4; seg++) {
      cx += (seededHash(cIdx * 100 + seg * 7) - 0.5) * 32;
      cy += (seededHash(cIdx * 100 + seg * 11 + 3) - 0.5) * 32;
      g.lineTo(cx, cy);
    }
    g.stroke();
  }

  // Subtle industrial drainage grate in center tile
  g.fillStyle = '#04070d';
  g.fillRect(slab + 62, slab + 62, 36, 36);
  g.strokeStyle = 'rgba(71, 85, 105, 0.35)';
  g.lineWidth = 1.5;
  g.strokeRect(slab + 62, slab + 62, 36, 36);
  g.fillStyle = 'rgba(51, 65, 85, 0.45)';
  for (let slot = 0; slot < 4; slot++) {
    g.fillRect(slab + 67, slab + 67 + slot * 7.5, 26, 3.5);
  }

  // Faded amber caution stripe markings along one seam intersection
  g.fillStyle = 'rgba(217, 119, 6, 0.14)';
  for (let st = 0; st < 4; st++) {
    g.fillRect(18 + st * 22, slab - 5, 12, 3);
  }

  return c;
}

export function renderArenaGround(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  width: number,
  height: number,
  arenaSize: number
): void {
  if (!zombieGroundTile) {
    zombieGroundTile = createZombieGroundTile();
  }

  const pattern = ctx.createPattern(zombieGroundTile, 'repeat');

  // Clip ground texture strictly inside [0, arenaSize]
  const arenaScreenX = -camX;
  const arenaScreenY = -camY;
  const visLeft = Math.max(0, arenaScreenX);
  const visTop = Math.max(0, arenaScreenY);
  const visRight = Math.min(width, arenaScreenX + arenaSize);
  const visBottom = Math.min(height, arenaScreenY + arenaSize);

  if (pattern && visRight > visLeft && visBottom > visTop) {
    ctx.save();
    ctx.translate(arenaScreenX, arenaScreenY);
    ctx.fillStyle = pattern;
    ctx.fillRect(
      visLeft - arenaScreenX,
      visTop - arenaScreenY,
      visRight - visLeft,
      visBottom - visTop
    );
    ctx.restore();
  }

  // Outer Perimeter Hazard Border & Depth Shadow
  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 14;
  ctx.strokeRect(arenaScreenX - 4, arenaScreenY - 4, arenaSize + 8, arenaSize + 8);

  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 4;
  ctx.strokeRect(arenaScreenX, arenaScreenY, arenaSize, arenaSize);
  ctx.restore();
}

export function renderRealisticSplats(
  ctx: CanvasRenderingContext2D,
  splats: BloodSplat[],
  camX: number,
  camY: number,
  viewLeft: number,
  viewTop: number,
  viewRight: number,
  viewBottom: number
): void {
  for (let i = 0; i < splats.length; i++) {
    const s = splats[i];
    const pad = s.radius * (s.stretch ? s.stretch * 1.4 : 1.45);
    if (
      s.x + pad < viewLeft ||
      s.x - pad > viewRight ||
      s.y + pad < viewTop ||
      s.y - pad > viewBottom
    ) {
      continue;
    }

    const sx = s.x - camX;
    const sy = s.y - camY;
    const isScorch = s.color === '#1c1917' || s.color === '#09090b' || s.color === '#0f172a';

    ctx.globalAlpha = s.alpha;
    if (isScorch) {
      // Ultra-realistic multi-zone blast crater: radial soot rays, rimmed charcoal bowl & cooling ember fissures
      const hBase = seededHash(s.x * 0.17 + s.y * 0.31);
      ctx.save();
      ctx.translate(sx, sy);

      // 1. Soft wide blast soot apron
      ctx.globalAlpha = s.alpha * 0.42;
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, s.radius * 1.48, 0, Math.PI * 2);
      ctx.fill();

      // 2. Radial blast-burn ejecta rays
      ctx.globalAlpha = s.alpha * 0.52;
      ctx.strokeStyle = '#09090b';
      ctx.lineCap = 'round';
      for (let ray = 0; ray < 7; ray++) {
        const ra = hBase * Math.PI * 2 + (ray * Math.PI * 2) / 7 + seededHash(ray + s.x) * 0.35;
        const rLen = s.radius * (1.18 + seededHash(ray * 3.1 + s.y) * 0.55);
        ctx.lineWidth = Math.max(2, s.radius * 0.14);
        ctx.beginPath();
        ctx.moveTo(Math.cos(ra) * s.radius * 0.4, Math.sin(ra) * s.radius * 0.4);
        ctx.lineTo(Math.cos(ra) * rLen, Math.sin(ra) * rLen);
        ctx.stroke();
      }

      // 3. Elevated shattered concrete crater rim
      ctx.globalAlpha = s.alpha * 0.45;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = Math.max(1.5, s.radius * 0.09);
      ctx.beginPath();
      ctx.arc(0, 0, s.radius * 0.94, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Deep sunken carbon blast pit
      ctx.globalAlpha = s.alpha * 0.88;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(0, 0, s.radius * 0.86, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = s.alpha * 0.92;
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0, 0, s.radius * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // 5. Subtle hot asphalt fracture fissures in crater center
      ctx.globalAlpha = s.alpha * 0.36;
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 1.2;
      for (let cr = 0; cr < 4; cr++) {
        const ca = hBase * 6.28 + cr * 1.57;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ca) * s.radius * 0.42, Math.sin(ca) * s.radius * 0.42);
        ctx.stroke();
      }
      ctx.restore();
    } else if (s.angle !== undefined && s.stretch && s.stretch > 1.12) {
      // Compact organic glancing droplet smear (no exaggerated hose streak)
      const len = s.radius * Math.min(1.65, s.stretch);
      const w = Math.max(1.8, s.radius * 0.65);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(s.angle);

      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.ellipse(len * 0.25, 0, len * 0.65, w * 0.72, 0, 0, Math.PI * 2);
      ctx.arc(len * 0.96, 0, Math.max(1.3, w * 0.34), 0, Math.PI * 2);
      ctx.arc(-len * 0.22, w * 0.35, Math.max(1.1, w * 0.24), 0, Math.PI * 2);
      ctx.fill();

      // Darker coagulated center + subtle wet highlight
      ctx.globalAlpha = s.alpha * 0.38;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.52)';
      ctx.beginPath();
      ctx.ellipse(len * 0.22, 0, len * 0.36, w * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = s.alpha * 0.22;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(len * 0.32, -w * 0.2, Math.max(1.1, len * 0.16), Math.max(0.6, w * 0.14), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Organic multi-lobe viscous splatter + coagulated core + glossy wet sheen (deterministic from coords)
      const h1 = seededHash(s.x * 0.37 + s.y * 0.71);
      const h2 = seededHash(s.x * 0.83 - s.y * 0.19);
      const h3 = seededHash(s.x * 0.51 + s.y * 0.43);
      const a1 = h1 * Math.PI * 2;
      const a2 = a1 + 2.0 + h2 * 0.95;
      const a3 = a1 + 4.1 + h3 * 0.85;

      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius * 0.88, 0, Math.PI * 2);
      ctx.arc(
        sx + Math.cos(a1) * s.radius * 0.5,
        sy + Math.sin(a1) * s.radius * 0.5,
        s.radius * 0.56,
        0,
        Math.PI * 2
      );
      ctx.arc(
        sx + Math.cos(a2) * s.radius * 0.58,
        sy + Math.sin(a2) * s.radius * 0.58,
        s.radius * 0.44,
        0,
        Math.PI * 2
      );
      ctx.arc(
        sx + Math.cos(a3) * s.radius * 0.46,
        sy + Math.sin(a3) * s.radius * 0.46,
        s.radius * 0.34,
        0,
        Math.PI * 2
      );
      // Two flung satellite droplets
      ctx.arc(
        sx + Math.cos(a1 + 3.6) * s.radius * 1.15,
        sy + Math.sin(a1 + 3.6) * s.radius * 1.15,
        Math.max(1.8, s.radius * 0.22),
        0,
        Math.PI * 2
      );
      ctx.arc(
        sx + Math.cos(a2 + 0.5) * s.radius * 1.32,
        sy + Math.sin(a2 + 0.5) * s.radius * 1.32,
        Math.max(1.4, s.radius * 0.14),
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Darker coagulated arterial/ichor core for depth
      ctx.globalAlpha = s.alpha * 0.45;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // Subtle glossy wet fluid specular catchlight
      ctx.globalAlpha = s.alpha * 0.28;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(
        sx - s.radius * 0.24,
        sy - s.radius * 0.24,
        Math.max(1.5, s.radius * 0.24),
        Math.max(1, s.radius * 0.11),
        -0.55,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export interface RealTimeShadowContext {
  flashLights?: SceneFlashLight[];
  muzzleFlashIntensity?: number;
  arenaSize?: number;
  dayNight?: DayNightState;
}

export function renderGroundCastShadows(
  ctx: CanvasRenderingContext2D,
  player: Player,
  zombies: Zombie[],
  drops: ItemDrop[],
  camX: number,
  camY: number,
  viewLeft: number,
  viewTop: number,
  viewRight: number,
  viewBottom: number,
  isDowned: boolean,
  shadowCtx?: RealTimeShadowContext
): void {
  const flashLights = shadowCtx?.flashLights;
  const muzzleIntensity = shadowCtx?.muzzleFlashIntensity ?? 0;
  const dn = shadowCtx?.dayNight;
  const baseDirX = dn ? dn.shadowDirX : 0.72;
  const baseDirY = dn ? dn.shadowDirY : 0.65;
  const baseStretch = dn ? dn.shadowStretch : 1.22;
  const baseShadowAlpha = dn ? dn.shadowAlpha : 0.36;

  const muzzleX = player.x + Math.cos(player.angle) * (player.radius + 16);
  const muzzleY = player.y + Math.sin(player.angle) * (player.radius + 16);

  // Computes live real-time shadow vector from solar/lunar cycle + campfires + muzzle/explosion flashes
  const computeShadowVector = (wx: number, wy: number, radius: number) => {
    let dirX = baseDirX;
    let dirY = baseDirY;
    let stretch = baseStretch;

    if (flashLights && flashLights.length > 0) {
      let bestW = 0;
      let fdx = 0;
      let fdy = 0;
      for (let li = 0; li < flashLights.length; li++) {
        const fl = flashLights[li];
        if (fl.alpha < 0.08) continue;
        const ldx = wx - fl.x;
        const ldy = wy - fl.y;
        const maxRange = fl.radius * 1.45;
        const dSq = ldx * ldx + ldy * ldy;
        if (dSq > 16 && dSq < maxRange * maxRange) {
          const d = Math.sqrt(dSq);
          const w = Math.min(0.92, (1 - d / maxRange) * fl.alpha * 1.4);
          if (w > bestW) {
            bestW = w;
            fdx = ldx / d;
            fdy = ldy / d;
          }
        }
      }
      if (bestW > 0.05) {
        dirX = dirX * (1 - bestW) + fdx * bestW;
        dirY = dirY * (1 - bestW) + fdy * bestW;
        const mag = Math.hypot(dirX, dirY) || 1;
        dirX /= mag;
        dirY /= mag;
        stretch += bestW * 0.68;
      }
    }

    if (muzzleIntensity > 0.14) {
      const mdx = wx - muzzleX;
      const mdy = wy - muzzleY;
      const mSq = mdx * mdx + mdy * mdy;
      if (mSq > 100 && mSq < 115600) {
        const md = Math.sqrt(mSq);
        const mw = Math.min(0.75, (1 - md / 340) * muzzleIntensity * 0.85);
        dirX = dirX * (1 - mw) + (mdx / md) * mw;
        dirY = dirY * (1 - mw) + (mdy / md) * mw;
        const mag = Math.hypot(dirX, dirY) || 1;
        dirX /= mag;
        dirY /= mag;
        stretch += mw * 0.45;
      }
    }

    const offsetDist = radius * 0.44 * stretch;
    return {
      ox: dirX * offsetDist,
      oy: dirY * offsetDist,
      rx: radius * (0.98 + stretch * 0.34),
      ry: radius * 0.74,
      rot: Math.atan2(dirY, dirX),
    };
  };

  ctx.save();

  // Pass 1: Soft atmospheric Penumbra shadows
  ctx.fillStyle = `rgba(2, 6, 23, ${(baseShadowAlpha * 0.56).toFixed(2)})`;
  ctx.beginPath();
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (d.x + 32 < viewLeft || d.x - 32 > viewRight || d.y + 32 < viewTop || d.y - 32 > viewBottom) continue;
    const sv = computeShadowVector(d.x, d.y, d.radius * 0.88);
    const sx = d.x - camX + sv.ox * 0.75;
    const sy = d.y - camY + sv.oy * 0.75;
    ctx.moveTo(sx + sv.rx * 1.15, sy);
    ctx.ellipse(sx, sy, sv.rx * 1.15, sv.ry * 0.92, sv.rot, 0, Math.PI * 2);
  }
  for (let i = 0; i < zombies.length; i++) {
    const z = zombies[i];
    const pad = z.radius + 64;
    if (z.x + pad < viewLeft || z.x - pad > viewRight || z.y + pad < viewTop || z.y - pad > viewBottom) continue;
    const sv = computeShadowVector(z.x, z.y, z.radius);
    const sx = z.x - camX + sv.ox * 1.15;
    const sy = z.y - camY + sv.oy * 1.15;
    ctx.moveTo(sx + sv.rx * 1.18, sy);
    ctx.ellipse(sx, sy, sv.rx * 1.18, sv.ry * 1.14, sv.rot, 0, Math.PI * 2);
  }
  if (!isDowned) {
    const psv = computeShadowVector(player.x, player.y, player.radius);
    const psx = player.x - camX + psv.ox * 1.15;
    const psy = player.y - camY + psv.oy * 1.15;
    ctx.moveTo(psx + psv.rx * 1.18, psy);
    ctx.ellipse(psx, psy, psv.rx * 1.18, psv.ry * 1.14, psv.rot, 0, Math.PI * 2);
  }
  ctx.fill();

  // Pass 2: Dense Umbra & Contact shadows
  ctx.fillStyle = `rgba(2, 6, 23, ${baseShadowAlpha.toFixed(2)})`;
  ctx.beginPath();
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (d.x + 28 < viewLeft || d.x - 28 > viewRight || d.y + 28 < viewTop || d.y - 28 > viewBottom) continue;
    const sv = computeShadowVector(d.x, d.y, d.radius * 0.72);
    const sx = d.x - camX + sv.ox * 0.45;
    const sy = d.y - camY + sv.oy * 0.45;
    ctx.moveTo(sx + sv.rx * 0.85, sy);
    ctx.ellipse(sx, sy, sv.rx * 0.85, sv.ry * 0.72, sv.rot, 0, Math.PI * 2);
  }
  for (let i = 0; i < zombies.length; i++) {
    const z = zombies[i];
    const pad = z.radius + 54;
    if (z.x + pad < viewLeft || z.x - pad > viewRight || z.y + pad < viewTop || z.y - pad > viewBottom) continue;
    const sv = computeShadowVector(z.x, z.y, z.radius);
    const sx = z.x - camX + sv.ox * 0.65;
    const sy = z.y - camY + sv.oy * 0.65;
    ctx.moveTo(sx + sv.rx * 0.88, sy);
    ctx.ellipse(sx, sy, sv.rx * 0.88, sv.ry * 0.86, sv.rot, 0, Math.PI * 2);
  }
  if (!isDowned) {
    const psv = computeShadowVector(player.x, player.y, player.radius);
    const psx = player.x - camX + psv.ox * 0.65;
    const psy = player.y - camY + psv.oy * 0.65;
    ctx.moveTo(psx + psv.rx * 0.88, psy);
    ctx.ellipse(psx, psy, psv.rx * 0.88, psv.ry * 0.86, psv.rot, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.restore();
}

export function renderSceneLighting(
  ctx: CanvasRenderingContext2D,
  player: Player,
  zombies: Zombie[],
  bullets: Bullet[],
  drops: ItemDrop[],
  flashLights: SceneFlashLight[],
  camX: number,
  camY: number,
  width: number,
  height: number,
  arenaSize: number,
  muzzleFlashIntensity: number,
  time: number,
  dayNight?: DayNightState
): void {
  const sprites = getLightSprites();
  const forest = getForestData();
  const dn = dayNight || getDayNightState(22);
  const viewLeft = camX - 220;
  const viewTop = camY - 220;
  const viewRight = camX + width + 220;
  const viewBottom = camY + height + 220;

  // =========================================================================
  // PASS A: QUARTER-RES GLOBAL ILLUMINATION DARKNESS & RADIOSITY LIGHTMAP
  // =========================================================================
  if (dn.darknessAlpha > 0.025) {
    const lmScale = 0.25;
    const lmW = Math.max(64, Math.ceil(width * lmScale));
    const lmH = Math.max(64, Math.ceil(height * lmScale));
    if (!giLightCanvas) {
      giLightCanvas = document.createElement('canvas');
    }
    if (giLightCanvas.width !== lmW || giLightCanvas.height !== lmH) {
      giLightCanvas.width = lmW;
      giLightCanvas.height = lmH;
    }
    const lctx = giLightCanvas.getContext('2d');
    if (lctx) {
      lctx.save();
      lctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, lmW, lmH);
      lctx.fillStyle = `rgba(${dn.ambientRgb[0]}, ${dn.ambientRgb[1]}, ${dn.ambientRgb[2]}, ${dn.darknessAlpha.toFixed(3)})`;
      lctx.fillRect(0, 0, lmW, lmH);

      // Punch out illuminated radiosity zones via destination-out
      lctx.globalCompositeOperation = 'destination-out';

      const punchRadial = (wx: number, wy: number, radius: number, strength: number) => {
        if (strength <= 0.02) return;
        if (wx + radius < viewLeft || wx - radius > viewRight || wy + radius < viewTop || wy - radius > viewBottom) {
          return;
        }
        const lx = (wx - camX) * lmScale;
        const ly = (wy - camY) * lmScale;
        const lr = Math.max(4, radius * lmScale);
        const g = lctx.createRadialGradient(lx, ly, lr * 0.1, lx, ly, lr);
        g.addColorStop(0, `rgba(0,0,0,${Math.min(1, strength).toFixed(2)})`);
        g.addColorStop(0.5, `rgba(0,0,0,${Math.min(1, strength * 0.58).toFixed(2)})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = g;
        lctx.beginPath();
        lctx.arc(lx, ly, lr, 0, Math.PI * 2);
        lctx.fill();
      };

      // 1. Operator tactical proximity aura + directional tactical flashlight beam
      const pxL = (player.x - camX) * lmScale;
      const pyL = (player.y - camY) * lmScale;
      punchRadial(player.x, player.y, 175 + dn.flashlightStrength * 45, 0.92);

      if (dn.flashlightStrength > 0.08) {
        const beamRange = (460 + dn.flashlightStrength * 110) * lmScale;
        const tipX = pxL + Math.cos(player.angle) * beamRange;
        const tipY = pyL + Math.sin(player.angle) * beamRange;
        const beamGrad = lctx.createLinearGradient(pxL, pyL, tipX, tipY);
        beamGrad.addColorStop(0, `rgba(0,0,0,${(0.95 * dn.flashlightStrength).toFixed(2)})`);
        beamGrad.addColorStop(0.55, `rgba(0,0,0,${(0.76 * dn.flashlightStrength).toFixed(2)})`);
        beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = beamGrad;
        lctx.beginPath();
        lctx.moveTo(pxL, pyL);
        lctx.arc(pxL, pyL, beamRange, player.angle - 0.34, player.angle + 0.34);
        lctx.closePath();
        lctx.fill();
      }

      // 2. Campfire GI cutouts
      for (let i = 0; i < forest.clearings.length; i++) {
        const cl = forest.clearings[i];
        if (!cl.hasCampfire) continue;
        const pulse = 1 + Math.sin(time * 0.014 + i * 2) * 0.07;
        punchRadial(cl.x, cl.y, 330 * pulse, 0.96);
      }

      // 3. Muzzle flashes & explosion lights
      if (muzzleFlashIntensity > 0.05) {
        const mx = player.x + Math.cos(player.angle) * (player.radius + 18);
        const my = player.y + Math.sin(player.angle) * (player.radius + 18);
        punchRadial(mx, my, 240, Math.min(1, muzzleFlashIntensity * 0.95));
      }
      for (let i = 0; i < flashLights.length; i++) {
        const fl = flashLights[i];
        punchRadial(fl.x, fl.y, fl.radius * 1.4, Math.min(1, fl.alpha * 1.2));
      }

      lctx.restore();

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(giLightCanvas, 0, 0, width, height);
      ctx.restore();
    }
  }

  // =========================================================================
  // PASS B: GLOBAL ILLUMINATION BOUNCE, SUNBEAMS & DYNAMIC SCENE LIGHTS
  // =========================================================================
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const drawLight = (wx: number, wy: number, radius: number, color: LightColorKey, alpha: number) => {
    if (alpha <= 0.005) return;
    if (wx + radius < viewLeft || wx - radius > viewRight || wy + radius < viewTop || wy - radius > viewBottom) {
      return;
    }
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprites[color], wx - camX - radius, wy - camY - radius, radius * 2, radius * 2);
  };

  // 1. Directional Solar / Lunar God-Ray Shafts piercing through forest clearings
  if (dn.sunbeamAlpha > 0.02) {
    const rayColor = `rgba(${dn.sunRgb[0]}, ${dn.sunRgb[1]}, ${dn.sunRgb[2]}, ${(dn.sunbeamAlpha * 0.34).toFixed(3)})`;
    const rayFade = `rgba(${dn.sunRgb[0]}, ${dn.sunRgb[1]}, ${dn.sunRgb[2]}, 0)`;
    const rayLen = 440;
    const dx = dn.shadowDirX;
    const dy = dn.shadowDirY;
    const px = -dy;
    const py = dx;

    for (let i = 0; i < forest.clearings.length; i++) {
      const cl = forest.clearings[i];
      if (cl.x + 480 < viewLeft || cl.x - 480 > viewRight || cl.y + 480 < viewTop || cl.y - 480 > viewBottom) {
        continue;
      }
      const sx = cl.x - camX - dx * 120;
      const sy = cl.y - camY - dy * 120;
      const ex = sx + dx * rayLen;
      const ey = sy + dy * rayLen;
      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0, rayFade);
      grad.addColorStop(0.28, rayColor);
      grad.addColorStop(1, rayFade);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(sx + px * 42, sy + py * 42);
      ctx.lineTo(sx - px * 42, sy - py * 42);
      ctx.lineTo(ex - px * 115, ey - py * 115);
      ctx.lineTo(ex + px * 115, ey + py * 115);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 2. Campfire Global Illumination Radiosity Bounce & Emerald Canopy Dapples
  for (let i = 0; i < forest.clearings.length; i++) {
    const cl = forest.clearings[i];
    if (!cl.hasCampfire) continue;
    const flicker = (0.22 + Math.sin(time * 0.015 + i * 2.1) * 0.045) * (0.45 + dn.campfireStrength * 0.85);
    drawLight(cl.x, cl.y, 310, 'orange', flicker);
    drawLight(cl.x, cl.y, 120, 'amber', flicker * 1.15);
  }

  const spacing = 620;
  const startLX = Math.max(320, Math.floor(viewLeft / spacing) * spacing + 320);
  const startLY = Math.max(320, Math.floor(viewTop / spacing) * spacing + 320);
  for (let lx = startLX; lx <= Math.min(arenaSize - 160, viewRight); lx += spacing) {
    for (let ly = startLY; ly <= Math.min(arenaSize - 160, viewBottom); ly += spacing) {
      const h = seededHash(lx * 0.013 + ly * 0.029);
      const dappleBase = dn.phase === 'NIGHT' ? 0.055 : 0.095;
      const dapple = dappleBase + Math.sin(time * 0.0022 + h * 20) * 0.025;
      const dColor: LightColorKey =
        dn.sunWarmth > 0.45 ? 'amber' : dn.phase === 'NIGHT' ? 'cyan' : 'green';
      drawLight(lx + (h - 0.5) * 140, ly + (h - 0.5) * 140, 240, dColor, dapple);
    }
  }

  // 3. Tactical Operator Headlamp Warm/Cool Spill (visible during Dusk/Night/Dawn)
  if (dn.flashlightStrength > 0.12) {
    const beamDist = 230 + dn.flashlightStrength * 120;
    const bx = player.x + Math.cos(player.angle) * beamDist;
    const by = player.y + Math.sin(player.angle) * beamDist;
    drawLight(bx, by, 170, 'white', 0.14 * dn.flashlightStrength);
    drawLight(
      player.x + Math.cos(player.angle) * 110,
      player.y + Math.sin(player.angle) * 110,
      95,
      'amber',
      0.11 * dn.flashlightStrength
    );
  }

  // 4. Player Ambient Suit/Shield Ground Reflection
  let playerLightColor: LightColorKey = 'cyan';
  let playerLightRadius = 90;
  let playerLightAlpha = 0.12;

  if (player.equippedSkin === 'skin_pyro_igniter') {
    playerLightColor = 'orange';
    playerLightRadius = 118;
    playerLightAlpha = 0.22;
  } else if (player.equippedSkin === 'skin_solar_valkyrie') {
    playerLightColor = 'amber';
    playerLightRadius = 120;
    playerLightAlpha = 0.21;
  } else if (player.equippedSkin === 'skin_cryo_warden') {
    playerLightColor = 'cyan';
    playerLightRadius = 110;
    playerLightAlpha = 0.18;
  } else if (player.equippedSkin === 'skin_volt_cyber') {
    playerLightColor = 'cyan';
    playerLightRadius = 108;
    playerLightAlpha = 0.18;
  } else if (player.equippedSkin === 'skin_hazard_juggernaut') {
    playerLightColor = 'green';
    playerLightRadius = 102;
    playerLightAlpha = 0.16;
  } else if (player.equippedSkin === 'skin_ghost_recon') {
    playerLightColor = 'red';
    playerLightRadius = 92;
    playerLightAlpha = 0.14;
  } else if (player.shield > 0) {
    playerLightColor = 'cyan';
    playerLightRadius = 95;
    playerLightAlpha = 0.15;
  }
  drawLight(player.x, player.y, playerLightRadius, playerLightColor, playerLightAlpha);

  // 5. Muzzle Flash Gunfire Illumination Splash calibrated to the 3 conventional firearms
  if (muzzleFlashIntensity > 0.02) {
    let flashColor: LightColorKey = 'amber';
    if (player.currentWeapon === WeaponType.BENELLI_M4) {
      flashColor = 'orange';
    } else if (player.currentWeapon === WeaponType.SCAR_L) {
      flashColor = 'cyan';
    }
    const mx = player.x + Math.cos(player.angle) * (player.radius + 18);
    const my = player.y + Math.sin(player.angle) * (player.radius + 18);
    drawLight(mx, my, 175 * muzzleFlashIntensity + 44, flashColor, 0.4 * muzzleFlashIntensity);
  }

  // 6. Item Drop Floor Reflections
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    const lk: LightColorKey =
      d.color === '#10b981' || d.color === '#34d399'
        ? 'green'
        : d.color === '#22d3ee' || d.color === '#38bdf8'
          ? 'cyan'
          : d.color === '#fbbf24' || d.color === '#f59e0b'
            ? 'amber'
            : d.color === '#f97316'
              ? 'orange'
              : 'red';
    const pulse = 0.14 + Math.sin(d.pulseTimer) * 0.035;
    drawLight(d.x, d.y, 46, lk, pulse);
  }

  // 7. Burning Enemies, Toxic Units & Boss Auras
  let enemyLightsDrawn = 0;
  for (let i = 0; i < zombies.length && enemyLightsDrawn < 28; i++) {
    const z = zombies[i];
    if (z.x + 120 < viewLeft || z.x - 120 > viewRight || z.y + 120 < viewTop || z.y - 120 > viewBottom) {
      continue;
    }
    if (z.isOnFire) {
      const flicker = 0.22 + Math.sin(time * 0.025 + i) * 0.06;
      drawLight(z.x, z.y, z.radius * 3.1, 'orange', flicker);
      enemyLightsDrawn++;
    } else if (z.isPoisoned) {
      const pulseP = 0.17 + Math.sin(time * 0.015 + i) * 0.04;
      drawLight(z.x, z.y, z.radius * 2.8, z.isKinjitePoison ? 'red' : 'purple', pulseP);
      enemyLightsDrawn++;
    } else if (z.isBoss) {
      drawLight(z.x, z.y, z.radius * 3.5, 'red', 0.24 + Math.sin(time * 0.005) * 0.05);
      enemyLightsDrawn++;
    } else if (z.type === ZombieType.TOXIC_SPITTER) {
      drawLight(z.x, z.y, z.radius * 2.5, 'green', 0.15);
      enemyLightsDrawn++;
    }
  }

  // 8. Active Projectiles Floor Lighting
  let bulletLightsDrawn = 0;
  for (let i = 0; i < bullets.length && bulletLightsDrawn < 24; i++) {
    const b = bullets[i];
    if (b.x + 90 < viewLeft || b.x - 90 > viewRight || b.y + 90 < viewTop || b.y - 90 > viewBottom) {
      continue;
    }
    let lk: LightColorKey = 'amber';
    let rad = 36;
    let alpha = 0.15;
    if (b.isEnemy) {
      lk = b.color === '#a855f7' ? 'purple' : b.color === '#dc2626' ? 'red' : 'green';
      rad = 44;
      alpha = 0.19;
    } else if (b.isRay || b.isVoidLance) {
      lk = 'purple';
      rad = 52;
      alpha = 0.22;
    } else if (b.weaponType === WeaponType.BENELLI_M4) {
      lk = 'orange';
      rad = 44;
      alpha = 0.18;
    } else if (b.weaponType === WeaponType.SCAR_L) {
      lk = 'cyan';
      rad = 48;
      alpha = 0.2;
    }
    drawLight(b.x, b.y, rad, lk, alpha);
    bulletLightsDrawn++;
  }

  // 9. Dynamic Explosion / Impact Flash Lights
  for (let i = 0; i < flashLights.length; i++) {
    const fl = flashLights[i];
    drawLight(fl.x, fl.y, fl.radius, fl.color, fl.alpha);
  }

  ctx.restore();
}

export function renderAtmosphericDust(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dt: number,
  time: number,
  dayNight?: DayNightState
): void {
  if (!dustMotes) {
    dustMotes = [];
    for (let i = 0; i < 34; i++) {
      dustMotes.push({
        x: Math.random() * 1600,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 18 + 10,
        vy: -6 - Math.random() * 14,
        size: 1 + Math.random() * 1.9,
        alpha: 0.16 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const isNight = dayNight?.phase === 'NIGHT';
  const fireflyMode = (dayNight?.fireflyStrength ?? 0) > 0.35;

  ctx.save();
  for (let i = 0; i < dustMotes.length; i++) {
    const m = dustMotes[i];
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    if (m.x < 0) m.x += width;
    else if (m.x > width) m.x -= width;
    if (m.y < 0) m.y += height;
    else if (m.y > height) m.y -= height;

    const shimmer = 0.55 + 0.45 * Math.sin(time * 0.004 + m.phase);
    const isFirefly = fireflyMode && i % 2 === 0;
    ctx.fillStyle = isFirefly ? '#bef264' : isNight ? '#bae6fd' : '#fde68a';
    ctx.globalAlpha = m.alpha * shimmer * (isFirefly ? 1.45 : 0.9);
    ctx.beginPath();
    ctx.arc(m.x % Math.max(1, width), m.y % Math.max(1, height), isFirefly ? m.size * 1.35 : m.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function renderGamepadAimReticle(
  ctx: CanvasRenderingContext2D,
  screenPlayerX: number,
  screenPlayerY: number,
  aimAngle: number,
  aimActive: boolean,
  time: number
): void {
  const dist = aimActive ? 125 : 88;
  const rx = screenPlayerX + Math.cos(aimAngle) * dist;
  const ry = screenPlayerY + Math.sin(aimAngle) * dist;
  const pulse = 1 + Math.sin(time * 0.01) * 0.12;
  const r = 10 * pulse;

  ctx.save();
  ctx.translate(rx, ry);
  ctx.strokeStyle = aimActive ? 'rgba(34, 211, 238, 0.85)' : 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = aimActive ? 1.8 : 1.2;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // 4 crosshair ticks
  const inner = r * 0.55;
  const outer = r * 1.45;
  ctx.beginPath();
  ctx.moveTo(-outer, 0);
  ctx.lineTo(-inner, 0);
  ctx.moveTo(inner, 0);
  ctx.lineTo(outer, 0);
  ctx.moveTo(0, -outer);
  ctx.lineTo(0, -inner);
  ctx.moveTo(0, inner);
  ctx.lineTo(0, outer);
  ctx.stroke();

  if (aimActive) {
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export interface GroundFootprint {
  x: number;
  y: number;
  angle: number;
  side: -1 | 1;
  alpha: number;
  wet: boolean;
  scale: number;
}

export interface SpentCasing {
  x: number;
  y: number;
  angle: number;
  color: string;
  isShell: boolean;
  alpha: number;
}

export function renderFootprintsAndCasings(
  ctx: CanvasRenderingContext2D,
  footprints: GroundFootprint[],
  casings: SpentCasing[],
  camX: number,
  camY: number,
  viewLeft: number,
  viewTop: number,
  viewRight: number,
  viewBottom: number
): void {
  // 1. Subtle tactical boot footprints & wet shore prints (culled)
  if (footprints.length > 0) {
    ctx.save();
    for (let i = 0; i < footprints.length; i++) {
      const f = footprints[i];
      if (f.x + 18 < viewLeft || f.x - 18 > viewRight || f.y + 18 < viewTop || f.y - 18 > viewBottom) {
        continue;
      }
      const sx = f.x - camX;
      const sy = f.y - camY;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(f.angle);
      ctx.globalAlpha = f.alpha;
      ctx.fillStyle = f.wet ? 'rgba(6, 28, 42, 0.56)' : 'rgba(15, 23, 42, 0.34)';
      const w = 4.6 * f.scale;
      const h = 2.6 * f.scale;
      // Heel + forefoot tread separation
      ctx.fillRect(-w * 0.55, -h * 0.5, w * 0.38, h);
      ctx.beginPath();
      ctx.ellipse(w * 0.25, 0, w * 0.42, h * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // 2. Persistent spent brass cartridges & red shotgun shells resting on the ground
  if (casings.length > 0) {
    ctx.save();
    for (let i = 0; i < casings.length; i++) {
      const c = casings[i];
      if (c.x + 14 < viewLeft || c.x - 14 > viewRight || c.y + 14 < viewTop || c.y - 14 > viewBottom) {
        continue;
      }
      ctx.save();
      ctx.translate(c.x - camX, c.y - camY);
      ctx.rotate(c.angle);
      ctx.globalAlpha = c.alpha;
      const cw = c.isShell ? 5.8 : 4.4;
      const ch = c.isShell ? 2.5 : 1.75;
      // Ground drop shadow under casing
      ctx.fillStyle = 'rgba(2, 6, 23, 0.42)';
      ctx.fillRect(-cw * 0.5 + 0.8, -ch * 0.5 + 0.9, cw, ch);
      // Casing cylinder body
      ctx.fillStyle = c.color;
      ctx.fillRect(-cw * 0.5, -ch * 0.5, cw, ch);
      // Brass primer head & specular highlight ridge
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(-cw * 0.5, -ch * 0.5, cw * 0.3, ch);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.fillRect(-cw * 0.2, -ch * 0.35, cw * 0.55, 0.55);
      ctx.restore();
    }
    ctx.restore();
  }
}

let vignetteSpriteCache: HTMLCanvasElement | null = null;
function getCinematicVignetteSprite(): HTMLCanvasElement {
  if (vignetteSpriteCache) return vignetteSpriteCache;
  const size = 256;
  const half = size * 0.5;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (g) {
    const grad = g.createRadialGradient(half, half, size * 0.32, half, half, size * 0.72);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0)');
    grad.addColorStop(0.62, 'rgba(2, 6, 23, 0.14)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0.52)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  vignetteSpriteCache = c;
  return c;
}

export function renderCinematicPostFX(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  muzzleFlashIntensity: number,
  speedRatio: number
): void {
  const vig = getCinematicVignetteSprite();
  ctx.save();

  // 1. Optical lens vignette (zero per-frame gradient allocation!)
  ctx.globalAlpha = 0.76;
  ctx.drawImage(vig, 0, 0, width, height);

  // 2. Subtle peripheral velocity focus when sprinting fast
  if (speedRatio > 1.15) {
    const focusAlpha = Math.min(0.24, (speedRatio - 1.15) * 0.18);
    ctx.globalAlpha = focusAlpha;
    ctx.drawImage(vig, -width * 0.04, -height * 0.04, width * 1.08, height * 1.08);
  }

  // 3. Subtle warm atmospheric muzzle-flash lens bounce during gunfire/explosions
  if (muzzleFlashIntensity > 0.12) {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(251, 146, 60, ${(muzzleFlashIntensity * 0.055).toFixed(3)})`;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

