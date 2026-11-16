/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BloodSplat, Bullet, GameMode, ItemDrop, Player, WeaponType, Zombie, ZombieType } from '../types';

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
let smokeSpritesCache: Record<'light' | 'mid' | 'dark' | 'ember' | 'toxic' | 'cyan', HTMLCanvasElement> | null = null;
let zombieGroundTile: HTMLCanvasElement | null = null;
let alienGroundTile: HTMLCanvasElement | null = null;
let dustMotes: DustMote[] | null = null;

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

function getSmokeSprites(): Record<'light' | 'mid' | 'dark' | 'ember' | 'toxic' | 'cyan', HTMLCanvasElement> {
  if (smokeSpritesCache) return smokeSpritesCache;
  smokeSpritesCache = {
    light: createVolumetricSmokeSprite('226, 232, 240', '148, 163, 184', '248, 250, 252'),
    mid: createVolumetricSmokeSprite('148, 163, 184', '71, 85, 105', '226, 232, 240'),
    dark: createVolumetricSmokeSprite('51, 65, 85', '15, 23, 42', '100, 116, 139'),
    ember: createVolumetricSmokeSprite('234, 88, 12', '120, 53, 15', '253, 186, 116'),
    toxic: createVolumetricSmokeSprite('132, 204, 22', '63, 98, 18', '190, 242, 100'),
    cyan: createVolumetricSmokeSprite('186, 230, 253', '56, 189, 248', '240, 249, 255'),
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
  let key: 'light' | 'mid' | 'dark' | 'ember' | 'toxic' | 'cyan' = 'mid';
  if (color.includes('234, 88') || color.includes('fb923c') || color.includes('fdba74')) {
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

function getLightSprites(): Record<LightColorKey, HTMLCanvasElement> {
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

function createAlienGroundTile(): HTMLCanvasElement {
  const size = 480;
  const slab = 160;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  // Obsidian-titanium orbital deck base
  g.fillStyle = '#030816';
  g.fillRect(0, 0, size, size);

  for (let gx = 0; gx < 3; gx++) {
    for (let gy = 0; gy < 3; gy++) {
      const h = seededHash(gx * 11 + gy * 17 + 9);
      g.fillStyle = h > 0.5 ? 'rgba(15, 23, 42, 0.45)' : 'rgba(8, 47, 73, 0.16)';
      g.fillRect(gx * slab + 3, gy * slab + 3, slab - 6, slab - 6);
    }
  }

  // Brushed titanium micro-grain
  for (let i = 0; i < 650; i++) {
    const px = seededHash(i * 4.3) * size;
    const py = seededHash(i * 6.9) * size;
    g.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.035)' : 'rgba(2, 6, 23, 0.35)';
    g.fillRect(px, py, 6, 1);
  }

  // Recessed dark hull plate seams
  g.strokeStyle = 'rgba(2, 6, 23, 0.85)';
  g.lineWidth = 2.5;
  for (let p = 0; p <= size; p += slab) {
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, size);
    g.moveTo(0, p);
    g.lineTo(size, p);
    g.stroke();
  }

  // Subtle glowing cyan energy conduit traces along major deck joints
  g.strokeStyle = 'rgba(6, 182, 212, 0.18)';
  g.lineWidth = 1.2;
  for (let p = 0; p < size; p += slab) {
    g.beginPath();
    g.moveTo(p + 2, 0);
    g.lineTo(p + 2, size);
    g.moveTo(0, p + 2);
    g.lineTo(size, p + 2);
    g.stroke();
  }

  // Corner hex bolts & subtle bio-tech node dots
  for (let gx = 0; gx < 3; gx++) {
    for (let gy = 0; gy < 3; gy++) {
      const bx = gx * slab;
      const by = gy * slab;
      g.fillStyle = 'rgba(34, 211, 238, 0.22)';
      g.fillRect(bx + 8, by + 8, 3, 3);
      g.fillRect(bx + slab - 11, by + 8, 3, 3);
      g.fillRect(bx + 8, by + slab - 11, 3, 3);
      g.fillRect(bx + slab - 11, by + slab - 11, 3, 3);
    }
  }

  return c;
}

export function renderArenaGround(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  width: number,
  height: number,
  arenaSize: number,
  isAlienStage: boolean
): void {
  if (isAlienStage && !alienGroundTile) {
    alienGroundTile = createAlienGroundTile();
  } else if (!isAlienStage && !zombieGroundTile) {
    zombieGroundTile = createZombieGroundTile();
  }

  const tile = isAlienStage ? alienGroundTile! : zombieGroundTile!;
  const pattern = ctx.createPattern(tile, 'repeat');

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
  ctx.strokeStyle = isAlienStage ? 'rgba(6, 182, 212, 0.4)' : 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 14;
  ctx.strokeRect(arenaScreenX - 4, arenaScreenY - 4, arenaSize + 8, arenaSize + 8);

  ctx.strokeStyle = isAlienStage ? '#22d3ee' : '#991b1b';
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
      // Explosion scorch crater: outer soot ring + charred core
      ctx.fillStyle = 'rgba(9, 9, 11, 0.45)';
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius * 1.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius * 0.78, 0, Math.PI * 2);
      ctx.fill();
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
  isDowned: boolean
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.42)';

  // Drops subtle ground shadows
  ctx.beginPath();
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (d.x + 24 < viewLeft || d.x - 24 > viewRight || d.y + 24 < viewTop || d.y - 24 > viewBottom) {
      continue;
    }
    const sx = d.x - camX + 3;
    const sy = d.y - camY + 5;
    ctx.moveTo(sx + d.radius * 0.9, sy);
    ctx.ellipse(sx, sy, d.radius * 0.9, d.radius * 0.55, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Zombies & Bosses grounded directional cast shadows (batched single path for 60fps!)
  ctx.beginPath();
  for (let i = 0; i < zombies.length; i++) {
    const z = zombies[i];
    const pad = z.radius + 32;
    if (z.x + pad < viewLeft || z.x - pad > viewRight || z.y + pad < viewTop || z.y - pad > viewBottom) {
      continue;
    }
    const sx = z.x - camX + z.radius * 0.28;
    const sy = z.y - camY + z.radius * 0.38;
    const rx = z.radius * 1.08;
    const ry = z.radius * 0.78;
    ctx.moveTo(sx + rx, sy);
    ctx.ellipse(sx, sy, rx, ry, 0.35, 0, Math.PI * 2);
  }
  ctx.fill();

  // Player grounded cast shadow (skip if downed, handled by collapse)
  if (!isDowned) {
    const psx = player.x - camX + 5;
    const psy = player.y - camY + 7;
    ctx.beginPath();
    ctx.ellipse(psx, psy, player.radius * 1.12, player.radius * 0.82, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Renders atmospheric dynamic lighting across the arena using pre-cached radial light sprites
 * (NO flashlight cone — strictly environmental floodlights, muzzle flashes, firelight,
 * projectiles, bioluminescence, and explosion flashes).
 */
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
  isAlienStage: boolean,
  muzzleFlashIntensity: number,
  time: number
): void {
  const sprites = getLightSprites();
  const viewLeft = camX - 180;
  const viewTop = camY - 180;
  const viewRight = camX + width + 180;
  const viewBottom = camY + height + 180;

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

  // 1. Arena Overhead Floodlight Pools (spaced every 480px — creates atmospheric depth & pools of light)
  const spacing = 480;
  const startLX = Math.max(240, Math.floor(viewLeft / spacing) * spacing + 240);
  const startLY = Math.max(240, Math.floor(viewTop / spacing) * spacing + 240);
  for (let lx = startLX; lx <= Math.min(arenaSize - 120, viewRight); lx += spacing) {
    for (let ly = startLY; ly <= Math.min(arenaSize - 120, viewBottom); ly += spacing) {
      const h = seededHash(lx * 0.013 + ly * 0.029);
      if (isAlienStage) {
        const pulse = 0.09 + Math.sin(time * 0.0018 + h * 10) * 0.025;
        drawLight(lx, ly, 230, h > 0.65 ? 'purple' : 'cyan', pulse);
      } else {
        // Warm sodium-vapor overhead floodlights; rare subtle industrial flicker
        const flicker = h > 0.82 ? (Math.sin(time * 0.019 + h * 30) > -0.75 ? 0.11 : 0.04) : 0.11;
        drawLight(lx, ly, 240, h > 0.45 ? 'amber' : 'white', flicker);
      }
    }
  }

  // 2. Player Ambient Suit/Shield/Ship/Dragon Ground Reflection (strictly omnidirectional, NO flashlight)
  let playerLightColor: LightColorKey = 'cyan';
  let playerLightRadius = 85;
  let playerLightAlpha = 0.11;

  if (player.currentWeapon === WeaponType.NAVE_REI || player.currentWeapon === WeaponType.IRON_MAN) {
    playerLightColor = 'red';
    playerLightRadius = 110;
    playerLightAlpha = 0.16;
  } else if (player.currentWeapon === WeaponType.EAST_DRAGON) {
    playerLightColor = 'orange';
    playerLightRadius = 120;
    playerLightAlpha = 0.17;
  } else if (player.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON) {
    playerLightColor = 'purple';
    playerLightRadius = 115;
    playerLightAlpha = 0.16;
  } else if (player.equippedSkin === 'skin_pyro_igniter') {
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
  } else if (player.currentWeapon === WeaponType.TROPER) {
    playerLightColor = 'cyan';
    playerLightRadius = 70;
    playerLightAlpha = 0.12;
  } else if (player.shield > 0) {
    playerLightColor = 'cyan';
    playerLightRadius = 95;
    playerLightAlpha = 0.15;
  }
  drawLight(player.x, player.y, playerLightRadius, playerLightColor, playerLightAlpha);

  // 3. Muzzle Flash Gunfire Illumination Splash
  if (muzzleFlashIntensity > 0.02) {
    let flashColor: LightColorKey = 'amber';
    if (player.currentWeapon === WeaponType.PLASMA_RIFLE || player.currentWeapon === WeaponType.RAYGUN || player.currentWeapon === WeaponType.DESTRUCTOR || player.currentWeapon === WeaponType.INTERCEPTOR || player.currentWeapon === WeaponType.TROPER) {
      flashColor = 'cyan';
    } else if (player.currentWeapon === WeaponType.RAY_RIFLE) {
      flashColor = 'green';
    } else if (player.currentWeapon === WeaponType.LASER_MINIGUN || player.currentWeapon === WeaponType.NAVE_REI || player.currentWeapon === WeaponType.IRON_MAN) {
      flashColor = 'red';
    } else if (player.currentWeapon === WeaponType.MACHINE_GUN || player.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON) {
      flashColor = 'purple';
    } else if (player.currentWeapon === WeaponType.FLAMETHROWER || player.currentWeapon === WeaponType.ROCKET_LAUNCHER || player.currentWeapon === WeaponType.EAST_DRAGON) {
      flashColor = 'orange';
    }
    const mx = player.x + Math.cos(player.angle) * (player.radius + 16);
    const my = player.y + Math.sin(player.angle) * (player.radius + 16);
    drawLight(mx, my, 165 * muzzleFlashIntensity + 40, flashColor, 0.36 * muzzleFlashIntensity);
  }

  // 4. Item Drop Floor Reflections
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    const lk: LightColorKey =
      d.color === '#10b981' ? 'green' : d.color === '#22d3ee' ? 'cyan' : d.color === '#fbbf24' ? 'amber' : 'red';
    const pulse = 0.13 + Math.sin(d.pulseTimer) * 0.035;
    drawLight(d.x, d.y, 44, lk, pulse);
  }

  // 5. Burning Enemies, Toxic Units, Alien Glow & Boss Auras (Capped for mobile FPS)
  let enemyLightsDrawn = 0;
  for (let i = 0; i < zombies.length && enemyLightsDrawn < 28; i++) {
    const z = zombies[i];
    if (z.x + 120 < viewLeft || z.x - 120 > viewRight || z.y + 120 < viewTop || z.y - 120 > viewBottom) {
      continue;
    }
    if (z.isOnFire) {
      const flicker = 0.2 + Math.sin(time * 0.025 + i) * 0.06;
      drawLight(z.x, z.y, z.radius * 3.1, 'orange', flicker);
      enemyLightsDrawn++;
    } else if (z.isBoss) {
      const bossColor: LightColorKey = isAlienStage ? 'purple' : 'red';
      drawLight(z.x, z.y, z.radius * 3.4, bossColor, 0.22 + Math.sin(time * 0.005) * 0.05);
      enemyLightsDrawn++;
    } else if (z.type === ZombieType.TOXIC_SPITTER) {
      drawLight(z.x, z.y, z.radius * 2.4, 'green', 0.14);
      enemyLightsDrawn++;
    } else if (z.type === ZombieType.ALIEN_DRONE || z.type === ZombieType.ALIEN_SHOOTER) {
      drawLight(z.x, z.y, z.radius * 2.2, 'cyan', 0.11);
      enemyLightsDrawn++;
    }
  }

  // 6. Active Projectiles / Lasers / Fireballs Floor Lighting (Capped at 24 for max mobile FPS)
  let bulletLightsDrawn = 0;
  for (let i = 0; i < bullets.length && bulletLightsDrawn < 24; i++) {
    const b = bullets[i];
    if (b.x + 90 < viewLeft || b.x - 90 > viewRight || b.y + 90 < viewTop || b.y - 90 > viewBottom) {
      continue;
    }
    let lk: LightColorKey = 'amber';
    let rad = 36;
    let alpha = 0.14;
    if (b.isEnemy) {
      lk = b.isCosmic ? 'purple' : 'green';
      rad = 44;
      alpha = 0.18;
    } else if (b.isRocket || b.isBomb) {
      lk = 'orange';
      rad = 78;
      alpha = 0.28;
    } else if (b.isFlame) {
      lk = 'orange';
      rad = 56;
      alpha = 0.18;
    } else if (b.isLaser) {
      lk = 'red';
      rad = 48;
      alpha = 0.2;
    } else if (b.isRay || b.isOrb || b.isVoidLance) {
      lk = 'cyan';
      rad = 52;
      alpha = 0.2;
    }
    drawLight(b.x, b.y, rad, lk, alpha);
    bulletLightsDrawn++;
  }

  // 7. Dynamic Explosion / Impact Flash Lights
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
  isAlienStage: boolean,
  time: number
): void {
  if (!dustMotes) {
    dustMotes = [];
    for (let i = 0; i < 28; i++) {
      dustMotes.push({
        x: Math.random() * 1600,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 18 + (isAlienStage ? 6 : 10),
        vy: -6 - Math.random() * 14,
        size: 1 + Math.random() * 1.8,
        alpha: 0.16 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  ctx.save();
  ctx.fillStyle = isAlienStage ? '#67e8f9' : '#fed7aa';
  for (let i = 0; i < dustMotes.length; i++) {
    const m = dustMotes[i];
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    if (m.x < 0) m.x += width;
    else if (m.x > width) m.x -= width;
    if (m.y < 0) m.y += height;
    else if (m.y > height) m.y -= height;

    const shimmer = 0.65 + 0.35 * Math.sin(time * 0.003 + m.phase);
    ctx.globalAlpha = m.alpha * shimmer;
    ctx.beginPath();
    ctx.arc(m.x % Math.max(1, width), m.y % Math.max(1, height), m.size, 0, Math.PI * 2);
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

