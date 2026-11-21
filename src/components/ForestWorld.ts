/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ISLAND_CENTER, ISLAND_WORLD_SIZE } from './IslandTerrain';

export const FOREST_SIZE = ISLAND_WORLD_SIZE;
export const FOREST_CENTER = ISLAND_CENTER;

import { checkBuildingsBulletHit, resolveBuildingsCollision } from './BuildingsWorld';

export type TreeSpecies = 'PINE' | 'OAK' | 'ELDER_PINE' | 'AUTUMN_MAPLE' | 'DEAD';

export interface ForestTree {
  id: number;
  x: number;
  y: number;
  trunkRadius: number;
  canopyRadius: number;
  species: TreeSpecies;
  variant: number;
  seed: number;
  swayPhase: number;
}

export interface ForestBoulder {
  id: number;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  seed: number;
}

export interface ForestBush {
  x: number;
  y: number;
  radius: number;
  seed: number;
  kind: 'FERN' | 'LOG' | 'SHROOM' | 'FLOWERS';
  rotation: number;
}

export interface ForestClearing {
  x: number;
  y: number;
  radius: number;
  hasCampfire: boolean;
  name: string;
}

export interface ForestStreamPoint {
  x: number;
  y: number;
  width: number;
}

export interface ForestLightingParams {
  shadowDirX: number;
  shadowDirY: number;
  shadowStretch: number;
  shadowAlpha: number;
  sunWarmth: number;
  campfireStrength: number;
  fireflyStrength: number;
}

interface ForestData {
  trees: ForestTree[];
  boulders: ForestBoulder[];
  bushes: ForestBush[];
  clearings: ForestClearing[];
  trails: { x1: number; y1: number; x2: number; y2: number; width: number }[];
  stream: ForestStreamPoint[];
  cellSize: number;
  gridCols: number;
  treeGrid: Map<number, ForestTree[]>;
  boulderGrid: Map<number, ForestBoulder[]>;
  bushGrid: Map<number, ForestBush[]>;
}

let cachedForest: ForestData | null = null;
let cachedForestTile: HTMLCanvasElement | null = null;
let cachedCanopySprites: Record<string, HTMLCanvasElement> | null = null;

function hash2d(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function cellKey(cx: number, cy: number, cols: number): number {
  return cy * cols + cx;
}

export function getForestData(): ForestData {
  if (cachedForest) return cachedForest;

  const cellSize = 320;
  const gridCols = Math.ceil(FOREST_SIZE / cellSize) + 1;

  const clearings: ForestClearing[] = [
    { x: FOREST_CENTER, y: FOREST_CENTER, radius: 190, hasCampfire: false, name: 'Spawn Baseplate' },
  ];

  cachedForest = {
    trees: [],
    boulders: [],
    bushes: [],
    clearings,
    trails: [],
    stream: [],
    cellSize,
    gridCols,
    treeGrid: new Map<number, ForestTree[]>(),
    boulderGrid: new Map<number, ForestBoulder[]>(),
    bushGrid: new Map<number, ForestBush[]>(),
  };
  return cachedForest;
}

export function createConcreteBaseplateTile(): HTMLCanvasElement {
  // 256x256 seamless 2x2 poured industrial concrete slab tile (maps to 320x320 world units)
  const size = 256;
  const slabSize = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  // Base neutral architectural concrete
  g.fillStyle = '#6d737b';
  g.fillRect(0, 0, size, size);

  const slabShades = ['#70767f', '#696f77', '#6c727a', '#727881'];

  for (let sy = 0; sy < 2; sy++) {
    for (let sx = 0; sx < 2; sx++) {
      const px = sx * slabSize;
      const py = sy * slabSize;
      const idx = sy * 2 + sx;

      // Subtle poured slab tone + gentle directional trowel gradient
      const grad = g.createLinearGradient(px, py, px + slabSize, py + slabSize);
      grad.addColorStop(0, slabShades[idx]);
      grad.addColorStop(1, '#666c74');
      g.fillStyle = grad;
      g.fillRect(px, py, slabSize, slabSize);

      // Soft mineral weathering & screed variation inside each concrete panel
      for (let m = 0; m < 6; m++) {
        const mx = px + 18 + hash2d(idx * 41 + m * 13) * (slabSize - 36);
        const my = py + 18 + hash2d(idx * 67 + m * 29) * (slabSize - 36);
        const mr = 18 + hash2d(idx * 19 + m * 37) * 26;
        const mGrad = g.createRadialGradient(mx, my, 2, mx, my, mr);
        const isLight = m % 2 === 0;
        mGrad.addColorStop(0, isLight ? 'rgba(226, 232, 240, 0.045)' : 'rgba(15, 23, 42, 0.055)');
        mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = mGrad;
        g.beginPath();
        g.arc(mx, my, mr, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  // Fine trowel brush streaks across concrete surface
  g.lineWidth = 1;
  for (let i = 0; i < 42; i++) {
    const x = hash2d(i * 11.7) * size;
    const y = hash2d(i * 23.3) * size;
    const len = 14 + hash2d(i * 31.1) * 28;
    g.strokeStyle = i % 2 === 0 ? 'rgba(241, 245, 249, 0.032)' : 'rgba(15, 23, 42, 0.04)';
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y + (hash2d(i * 7.9) - 0.5) * 3);
    g.stroke();
  }

  // Micro-aggregate quartz & basalt concrete grain speckles
  for (let i = 0; i < 420; i++) {
    const gx = Math.floor(hash2d(i * 17.1 + 3) * size);
    const gy = Math.floor(hash2d(i * 29.7 + 9) * size);
    const sz = hash2d(i * 43.3) > 0.82 ? 2 : 1;
    const light = hash2d(i * 59.9) > 0.48;
    g.fillStyle = light ? 'rgba(226, 232, 240, 0.09)' : 'rgba(15, 23, 42, 0.12)';
    g.fillRect(gx, gy, sz, sz);
  }

  // Subtle hairline stress crack inside one slab
  g.strokeStyle = 'rgba(30, 41, 59, 0.22)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(36, 48);
  g.lineTo(51, 56);
  g.lineTo(63, 53);
  g.lineTo(74, 65);
  g.stroke();

  // Crisp concrete expansion joints between slabs (seamless across tile edges)
  g.fillStyle = 'rgba(30, 36, 44, 0.46)';
  g.fillRect(0, 0, size, 2);
  g.fillRect(0, slabSize - 1, size, 2);
  g.fillRect(0, 0, 2, size);
  g.fillRect(slabSize - 1, 0, 2, size);

  // Subtle sunlit concrete lip along expansion joints
  g.fillStyle = 'rgba(248, 250, 252, 0.075)';
  g.fillRect(0, 2, size, 1);
  g.fillRect(0, slabSize + 1, size, 1);
  g.fillRect(2, 0, 1, size);
  g.fillRect(slabSize + 1, 0, 1, size);

  return c;
}

export function createGrassTerrainTile(): HTMLCanvasElement {
  // 256x256 seamless lush meadow grass terrain tile (maps to 320x320 world units)
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  // Rich natural turf base
  g.fillStyle = '#3f6b32';
  g.fillRect(0, 0, size, size);

  const drawWrapped = (fn: (ox: number, oy: number) => void) => {
    for (let oy = -size; oy <= size; oy += size) {
      for (let ox = -size; ox <= size; ox += size) {
        fn(ox, oy);
      }
    }
  };

  // Organic mossy, clover & warm soil variation patches (seamless wrapped across tile borders)
  for (let p = 0; p < 22; p++) {
    const px = hash2d(p * 17.3 + 5) * size;
    const py = hash2d(p * 31.9 + 11) * size;
    const pr = 22 + hash2d(p * 47.1) * 34;
    const tone = p % 3;
    drawWrapped((ox, oy) => {
      const cx = px + ox;
      const cy = py + oy;
      if (cx + pr < 0 || cx - pr > size || cy + pr < 0 || cy - pr > size) return;
      const grad = g.createRadialGradient(cx, cy, 2, cx, cy, pr);
      if (tone === 0) {
        grad.addColorStop(0, 'rgba(92, 146, 62, 0.34)');
        grad.addColorStop(1, 'rgba(92, 146, 62, 0)');
      } else if (tone === 1) {
        grad.addColorStop(0, 'rgba(38, 72, 31, 0.36)');
        grad.addColorStop(1, 'rgba(38, 72, 31, 0)');
      } else {
        grad.addColorStop(0, 'rgba(101, 118, 58, 0.22)');
        grad.addColorStop(1, 'rgba(101, 118, 58, 0)');
      }
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, pr, 0, Math.PI * 2);
      g.fill();
    });
  }

  // Layered grass blade clusters & root shadows (wrapped cleanly across seams)
  g.lineCap = 'round';
  for (let i = 0; i < 640; i++) {
    const bx = hash2d(i * 13.7 + 2) * size;
    const by = hash2d(i * 27.1 + 9) * size;
    const len = 4 + hash2d(i * 41.3) * 7.5;
    const lean = (hash2d(i * 59.7) - 0.5) * 4.2;
    const shadeRoll = hash2d(i * 73.9);
    const stroke =
      shadeRoll < 0.28
        ? 'rgba(29, 58, 24, 0.55)'
        : shadeRoll < 0.68
          ? 'rgba(78, 128, 52, 0.58)'
          : shadeRoll < 0.92
            ? 'rgba(108, 162, 68, 0.52)'
            : 'rgba(146, 194, 88, 0.44)';

    g.strokeStyle = stroke;
    g.lineWidth = 1.1 + hash2d(i * 19.1) * 0.9;
    drawWrapped((ox, oy) => {
      const x0 = bx + ox;
      const y0 = by + oy;
      if (x0 < -10 || x0 > size + 10 || y0 < -10 || y0 > size + 10) return;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x0 + lean, y0 - len);
      g.stroke();
    });
  }

  // Subtle clover tufts & tiny meadow wildflowers for rich surface scale
  for (let f = 0; f < 26; f++) {
    const fx = hash2d(f * 37.3 + 4) * size;
    const fy = hash2d(f * 53.7 + 8) * size;
    const isBlossom = f % 4 === 0;
    g.fillStyle = isBlossom
      ? f % 8 === 0
        ? 'rgba(254, 240, 138, 0.58)'
        : 'rgba(241, 245, 249, 0.48)'
      : 'rgba(132, 204, 82, 0.35)';
    drawWrapped((ox, oy) => {
      const x = fx + ox;
      const y = fy + oy;
      if (x < -4 || x > size + 4 || y < -4 || y > size + 4) return;
      g.beginPath();
      g.arc(x, y, isBlossom ? 1.5 : 2.1, 0, Math.PI * 2);
      g.fill();
    });
  }

  return c;
}

export function createForestGroundTile(): HTMLCanvasElement {
  return createGrassTerrainTile();
}

function bakePainterlyCanopy(
  baseRgb: string,
  midRgb: string,
  highlightRgb: string,
  tipRgb: string,
  isPine: boolean,
  seedOffset: number
): HTMLCanvasElement {
  const size = 240;
  const half = size * 0.5;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  if (isPine) {
    // 4 concentric pine bough tiers from deep shaded base up to sunlit crown
    const tiers = [
      { count: 13, outer: 102, inner: 60, color: baseRgb, rot: 0.1 },
      { count: 11, outer: 84, inner: 48, color: midRgb, rot: 0.45 },
      { count: 9, outer: 62, inner: 32, color: highlightRgb, rot: 0.8 },
      { count: 7, outer: 38, inner: 18, color: tipRgb, rot: 1.2 },
    ];

    for (let t = 0; t < tiers.length; t++) {
      const tier = tiers[t];
      const ox = -t * 3.5;
      const oy = -t * 3.5;
      g.fillStyle = tier.color;
      g.beginPath();
      const totalPts = tier.count * 2;
      for (let p = 0; p < totalPts; p++) {
        const a = tier.rot + seedOffset + (p * Math.PI * 2) / totalPts;
        const jit = 0.88 + hash2d(p * 17 + t * 41 + seedOffset) * 0.22;
        const r = (p % 2 === 0 ? tier.outer : tier.inner) * jit;
        const px = half + ox + Math.cos(a) * r;
        const py = half + oy + Math.sin(a) * r;
        if (p === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fill();
    }

    // Fine needle highlight strokes near crown apex
    g.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    g.lineWidth = 1.5;
    for (let s = 0; s < 12; s++) {
      const a = seedOffset + (s * Math.PI * 2) / 12;
      g.beginPath();
      g.moveTo(half - 8, half - 8);
      g.lineTo(half - 8 + Math.cos(a) * 32, half - 8 + Math.sin(a) * 32);
      g.stroke();
    }
  } else {
    // Broad organic leafy crown composed of 30+ shaded leaf clusters
    // Base deep shadow canopy lobes
    g.fillStyle = baseRgb;
    for (let i = 0; i < 12; i++) {
      const a = seedOffset + (i * Math.PI * 2) / 12;
      const dist = 42 + hash2d(i * 11 + seedOffset) * 20;
      const r = 34 + hash2d(i * 23 + seedOffset) * 14;
      g.beginPath();
      g.arc(half + Math.cos(a) * dist, half + Math.sin(a) * dist, r, 0, Math.PI * 2);
      g.fill();
    }
    g.beginPath();
    g.arc(half, half, 66, 0, Math.PI * 2);
    g.fill();

    // Mid foliage volume
    g.fillStyle = midRgb;
    for (let i = 0; i < 14; i++) {
      const a = seedOffset + 0.4 + (i * Math.PI * 2) / 14;
      const dist = 26 + hash2d(i * 19 + 5 + seedOffset) * 26;
      const r = 26 + hash2d(i * 31 + seedOffset) * 12;
      g.beginPath();
      g.arc(half - 4 + Math.cos(a) * dist, half - 4 + Math.sin(a) * dist, r, 0, Math.PI * 2);
      g.fill();
    }

    // Upper sunlit leaf canopy tufts
    g.fillStyle = highlightRgb;
    for (let i = 0; i < 10; i++) {
      const a = seedOffset + 0.8 + (i * Math.PI * 2) / 10;
      const dist = 16 + hash2d(i * 37 + seedOffset) * 22;
      const r = 18 + hash2d(i * 41 + seedOffset) * 10;
      g.beginPath();
      g.arc(half - 9 + Math.cos(a) * dist, half - 9 + Math.sin(a) * dist, r, 0, Math.PI * 2);
      g.fill();
    }

    // Crisp sun-kissed crown leaf tips
    g.fillStyle = tipRgb;
    for (let i = 0; i < 7; i++) {
      const a = seedOffset + (i * Math.PI * 2) / 7;
      const dist = 10 + hash2d(i * 47 + seedOffset) * 16;
      const r = 10 + hash2d(i * 53 + seedOffset) * 7;
      g.beginPath();
      g.arc(half - 13 + Math.cos(a) * dist, half - 13 + Math.sin(a) * dist, r, 0, Math.PI * 2);
      g.fill();
    }
  }

  return c;
}

export function getCanopySprites(): Record<string, HTMLCanvasElement> {
  if (cachedCanopySprites) return cachedCanopySprites;
  cachedCanopySprites = {
    PINE_0: bakePainterlyCanopy('#133a22', '#1d5432', '#2d7a47', '#4ea864', true, 0.2),
    PINE_1: bakePainterlyCanopy('#10331e', '#1a4a2c', '#296e40', '#48995a', true, 1.7),
    ELDER_PINE_0: bakePainterlyCanopy('#0f2d1b', '#17452a', '#24663b', '#3f8c54', true, 0.9),
    ELDER_PINE_1: bakePainterlyCanopy('#123622', '#1c4f31', '#2b7346', '#4a9e60', true, 2.3),
    OAK_0: bakePainterlyCanopy('#173d21', '#225b2e', '#358040', '#60ab57', false, 0.5),
    OAK_1: bakePainterlyCanopy('#1a4424', '#276633', '#3e8d47', '#70ba62', false, 2.1),
    AUTUMN_MAPLE_0: bakePainterlyCanopy('#4d2312', '#7c3615', '#b45309', '#f59e0b', false, 0.8),
    AUTUMN_MAPLE_1: bakePainterlyCanopy('#5c1f14', '#922b18', '#c2410c', '#fb923c', false, 2.7),
  };
  return cachedCanopySprites;
}

export function bakeForestPropSprites(): {
  fern: HTMLCanvasElement;
  flowers: HTMLCanvasElement;
  shroom: HTMLCanvasElement;
  log: HTMLCanvasElement;
} {
  const mkCanvas = (w = 96, h = 96) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  // 1. Multi-frond lush forest fern sprite
  const fern = mkCanvas(96, 96);
  const fg = fern.getContext('2d');
  if (fg) {
    fg.translate(48, 48);
    fg.fillStyle = 'rgba(26, 90, 42, 0.95)';
    for (let f = 0; f < 6; f++) {
      fg.save();
      fg.rotate((f * Math.PI * 2) / 6);
      fg.beginPath();
      fg.ellipse(20, 0, 23, 8.5, 0, 0, Math.PI * 2);
      fg.fill();
      fg.fillStyle = 'rgba(74, 168, 82, 0.52)';
      fg.beginPath();
      fg.ellipse(18, 0, 15, 3.2, 0, 0, Math.PI * 2);
      fg.fill();
      fg.fillStyle = 'rgba(26, 90, 42, 0.95)';
      fg.restore();
    }
    fg.fillStyle = '#4ade80';
    fg.beginPath();
    fg.arc(0, 0, 8, 0, Math.PI * 2);
    fg.fill();
  }

  // 2. Wildflowers tuft sprite
  const flowers = mkCanvas(96, 96);
  const flg = flowers.getContext('2d');
  if (flg) {
    flg.translate(48, 48);
    flg.fillStyle = 'rgba(30, 84, 46, 0.88)';
    flg.beginPath();
    flg.arc(0, 0, 26, 0, Math.PI * 2);
    flg.fill();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6 + 0.3;
      const fx = Math.cos(a) * 14;
      const fy = Math.sin(a) * 14;
      flg.fillStyle = i % 2 === 0 ? '#fde047' : '#f8fafc';
      flg.beginPath();
      flg.arc(fx, fy, 4.8, 0, Math.PI * 2);
      flg.fill();
      flg.fillStyle = '#ca8a04';
      flg.beginPath();
      flg.arc(fx, fy, 1.8, 0, Math.PI * 2);
      flg.fill();
    }
  }

  // 3. Bioluminescent night mushroom cluster sprite
  const shroom = mkCanvas(96, 96);
  const sg = shroom.getContext('2d');
  if (sg) {
    sg.translate(48, 48);
    for (let m = 0; m < 3; m++) {
      const a = m * 2.1 + 0.4;
      const mx = Math.cos(a) * 14;
      const my = Math.sin(a) * 14;
      const grad = sg.createRadialGradient(mx, my, 1, mx, my, 18);
      grad.addColorStop(0, 'rgba(110, 231, 183, 0.72)');
      grad.addColorStop(1, 'rgba(110, 231, 183, 0)');
      sg.fillStyle = grad;
      sg.beginPath();
      sg.arc(mx, my, 18, 0, Math.PI * 2);
      sg.fill();

      sg.fillStyle = m === 0 ? '#34d399' : '#6ee7b7';
      sg.beginPath();
      sg.arc(mx, my, 7.5, 0, Math.PI * 2);
      sg.fill();
      sg.fillStyle = '#ecfdf5';
      sg.beginPath();
      sg.arc(mx - 2, my - 2, 2.5, 0, Math.PI * 2);
      sg.fill();
    }
  }

  // 4. Mossy hollow fallen log sprite
  const log = mkCanvas(128, 64);
  const lg = log.getContext('2d');
  if (lg) {
    lg.translate(64, 32);
    lg.fillStyle = '#3b2416';
    lg.strokeStyle = '#140c07';
    lg.lineWidth = 3;
    lg.beginPath();
    lg.roundRect(-52, -14, 104, 28, 9);
    lg.fill();
    lg.stroke();
    lg.fillStyle = '#4d7c0f';
    lg.beginPath();
    lg.roundRect(-34, -12, 54, 9, 4);
    lg.fill();
    lg.fillStyle = '#6b462b';
    lg.fillRect(-20, 2, 48, 4);
  }

  return { fern, flowers, shroom, log };
}

export function queryTreesInBounds(minX: number, minY: number, maxX: number, maxY: number): ForestTree[] {
  const forest = getForestData();
  const cs = forest.cellSize;
  const x0 = Math.max(0, Math.floor(minX / cs));
  const y0 = Math.max(0, Math.floor(minY / cs));
  const x1 = Math.min(forest.gridCols - 1, Math.floor(maxX / cs));
  const y1 = Math.min(forest.gridCols - 1, Math.floor(maxY / cs));
  const out: ForestTree[] = [];
  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      const b = forest.treeGrid.get(cellKey(cx, cy, forest.gridCols));
      if (b) {
        for (let i = 0; i < b.length; i++) out.push(b[i]);
      }
    }
  }
  return out;
}

export function queryBouldersInBounds(minX: number, minY: number, maxX: number, maxY: number): ForestBoulder[] {
  const forest = getForestData();
  const cs = forest.cellSize;
  const x0 = Math.max(0, Math.floor(minX / cs));
  const y0 = Math.max(0, Math.floor(minY / cs));
  const x1 = Math.min(forest.gridCols - 1, Math.floor(maxX / cs));
  const y1 = Math.min(forest.gridCols - 1, Math.floor(maxY / cs));
  const out: ForestBoulder[] = [];
  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      const b = forest.boulderGrid.get(cellKey(cx, cy, forest.gridCols));
      if (b) {
        for (let i = 0; i < b.length; i++) out.push(b[i]);
      }
    }
  }
  return out;
}

export function resolveForestEntityCollision(
  x: number,
  y: number,
  radius: number
): { x: number; y: number } {
  const bPos = resolveBuildingsCollision(x, y, radius);
  return {
    x: Math.max(radius + 18, Math.min(FOREST_SIZE - radius - 18, bPos.x)),
    y: Math.max(radius + 18, Math.min(FOREST_SIZE - radius - 18, bPos.y)),
  };
}

export function checkForestBulletHit(x: number, y: number, radius: number): 'WOOD' | 'STONE' | null {
  return checkBuildingsBulletHit(x, y, radius);
}

export function renderForestTerrain(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  width: number,
  height: number,
  time: number = 0,
  lighting?: ForestLightingParams
): void {
  if (!cachedForestTile) {
    cachedForestTile = createForestGroundTile();
  }
  const forest = getForestData();
  const pattern = ctx.createPattern(cachedForestTile, 'repeat');

  const arenaScreenX = -camX;
  const arenaScreenY = -camY;
  const visLeft = Math.max(0, arenaScreenX);
  const visTop = Math.max(0, arenaScreenY);
  const visRight = Math.min(width, arenaScreenX + FOREST_SIZE);
  const visBottom = Math.min(height, arenaScreenY + FOREST_SIZE);

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

  // 1. Shallow Scenic Woodland Stream (muddy pebble bed + translucent turquoise water + sun ripples)
  if (forest.stream.length >= 2) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Damp muddy bank border
    ctx.strokeStyle = 'rgba(42, 34, 24, 0.72)';
    ctx.lineWidth = 74;
    ctx.beginPath();
    ctx.moveTo(forest.stream[0].x - camX, forest.stream[0].y - camY);
    for (let i = 1; i < forest.stream.length; i++) {
      ctx.lineTo(forest.stream[i].x - camX, forest.stream[i].y - camY);
    }
    ctx.stroke();

    // Cool clear creek water
    ctx.strokeStyle = 'rgba(20, 74, 88, 0.78)';
    ctx.lineWidth = 52;
    ctx.stroke();

    // Flowing water highlight thread
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
    ctx.lineWidth = 14;
    ctx.setLineDash([28, 36]);
    ctx.lineDashOffset = -(time * 0.045) % 64;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 2. Organic Dirt Forest Trails connecting clearings
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(66, 51, 34, 0.62)';
  for (let i = 0; i < forest.trails.length; i++) {
    const tr = forest.trails[i];
    ctx.lineWidth = tr.width;
    ctx.beginPath();
    ctx.moveTo(tr.x1 - camX, tr.y1 - camY);
    ctx.lineTo(tr.x2 - camX, tr.y2 - camY);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(94, 73, 49, 0.44)';
  for (let i = 0; i < forest.trails.length; i++) {
    const tr = forest.trails[i];
    ctx.lineWidth = tr.width * 0.56;
    ctx.beginPath();
    ctx.moveTo(tr.x1 - camX, tr.y1 - camY);
    ctx.lineTo(tr.x2 - camX, tr.y2 - camY);
    ctx.stroke();
  }

  // 3. Forest Clearings (worn earth + grassy outer ring + stone campfire circle)
  for (let i = 0; i < forest.clearings.length; i++) {
    const cl = forest.clearings[i];
    const sx = cl.x - camX;
    const sy = cl.y - camY;
    if (sx + cl.radius < 0 || sx - cl.radius > width || sy + cl.radius < 0 || sy - cl.radius > height) {
      continue;
    }

    ctx.fillStyle = 'rgba(72, 58, 40, 0.48)';
    ctx.beginPath();
    ctx.arc(sx, sy, cl.radius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(92, 74, 52, 0.34)';
    ctx.beginPath();
    ctx.arc(sx, sy, cl.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();

    if (cl.hasCampfire) {
      // Crossed firewood logs
      ctx.strokeStyle = '#3b2416';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx - 11, sy - 6);
      ctx.lineTo(sx + 11, sy + 6);
      ctx.moveTo(sx - 9, sy + 8);
      ctx.lineTo(sx + 9, sy - 8);
      ctx.stroke();

      // Stone firepit ring
      ctx.fillStyle = '#475569';
      for (let s = 0; s < 10; s++) {
        const sa = (s * Math.PI * 2) / 10;
        ctx.beginPath();
        ctx.arc(sx + Math.cos(sa) * 19, sy + Math.sin(sa) * 19, 4.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(sx, sy, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Walk-through ferns, mossy fallen logs, glowing forest mushrooms & wildflowers
  const cs = forest.cellSize;
  const x0 = Math.max(0, Math.floor((camX - 60) / cs));
  const y0 = Math.max(0, Math.floor((camY - 60) / cs));
  const x1 = Math.min(forest.gridCols - 1, Math.floor((camX + width + 60) / cs));
  const y1 = Math.min(forest.gridCols - 1, Math.floor((camY + height + 60) / cs));
  const shroomGlow = 0.25 + (lighting?.fireflyStrength ?? 0.3) * 0.75;

  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      const bucket = forest.bushGrid.get(cellKey(cx, cy, forest.gridCols));
      if (!bucket) continue;
      for (let i = 0; i < bucket.length; i++) {
        const b = bucket[i];
        const bx = b.x - camX;
        const by = b.y - camY;

        if (b.kind === 'LOG') {
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(b.rotation);
          ctx.fillStyle = '#362316';
          ctx.strokeStyle = '#170f0a';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.roundRect(-b.radius, -6.5, b.radius * 2, 13, 4);
          ctx.fill();
          ctx.stroke();
          // Bark ridges + lush moss strip
          ctx.fillStyle = '#3f6212';
          ctx.fillRect(-b.radius * 0.55, -5.5, b.radius * 0.85, 3.8);
          ctx.fillStyle = '#5c3c24';
          ctx.fillRect(-b.radius * 0.3, 1, b.radius * 0.9, 2);
          ctx.restore();
        } else if (b.kind === 'SHROOM') {
          for (let m = 0; m < 3; m++) {
            const ma = b.seed + m * 2.1;
            const mx = bx + Math.cos(ma) * 5.5;
            const my = by + Math.sin(ma) * 5.5;
            ctx.fillStyle = `rgba(110, 231, 183, ${(0.22 * shroomGlow).toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(mx, my, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = m === 0 ? '#34d399' : '#6ee7b7';
            ctx.beginPath();
            ctx.arc(mx, my, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (b.kind === 'FLOWERS') {
          ctx.fillStyle = 'rgba(34, 84, 48, 0.72)';
          ctx.beginPath();
          ctx.arc(bx, by, b.radius * 0.62, 0, Math.PI * 2);
          ctx.fill();
          for (let fl = 0; fl < 4; fl++) {
            const fa = b.seed + fl * 1.57;
            ctx.fillStyle = fl % 2 === 0 ? '#fde047' : '#f8fafc';
            ctx.beginPath();
            ctx.arc(bx + Math.cos(fa) * b.radius * 0.36, by + Math.sin(fa) * b.radius * 0.36, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Layered multi-frond forest fern
          const sway = Math.sin(time * 0.002 + b.seed) * 0.05;
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(b.rotation + sway);
          ctx.fillStyle = 'rgba(28, 84, 42, 0.85)';
          for (let f = 0; f < 6; f++) {
            const fa = (f * Math.PI * 2) / 6;
            ctx.save();
            ctx.rotate(fa);
            ctx.beginPath();
            ctx.ellipse(b.radius * 0.42, 0, b.radius * 0.48, b.radius * 0.19, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.fillStyle = 'rgba(74, 152, 78, 0.55)';
          ctx.beginPath();
          ctx.arc(0, 0, b.radius * 0.24, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  // Timberline Quarantine Perimeter Fence
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 12]);
  ctx.strokeRect(arenaScreenX + 12, arenaScreenY + 12, FOREST_SIZE - 24, FOREST_SIZE - 24);
  ctx.setLineDash([]);
  ctx.restore();
}

export function renderForestEnvironmentShadows(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  width: number,
  height: number,
  lighting?: ForestLightingParams
): void {
  const viewLeft = camX - 200;
  const viewTop = camY - 200;
  const viewRight = camX + width + 200;
  const viewBottom = camY + height + 200;

  const trees = queryTreesInBounds(viewLeft, viewTop, viewRight, viewBottom);
  const boulders = queryBouldersInBounds(viewLeft, viewTop, viewRight, viewBottom);

  const dirX = lighting?.shadowDirX ?? 0.68;
  const dirY = lighting?.shadowDirY ?? 0.56;
  const stretch = lighting?.shadowStretch ?? 1.15;
  const alpha = lighting?.shadowAlpha ?? 0.36;
  const shadowRot = Math.atan2(dirY, dirX);

  ctx.save();
  ctx.fillStyle = `rgba(2, 6, 18, ${alpha.toFixed(2)})`;
  ctx.beginPath();

  for (let i = 0; i < boulders.length; i++) {
    const b = boulders[i];
    const dist = b.radius * 0.52 * stretch;
    const sx = b.x - camX + dirX * dist;
    const sy = b.y - camY + dirY * dist;
    ctx.moveTo(sx + b.radius * (0.95 + stretch * 0.26), sy);
    ctx.ellipse(sx, sy, b.radius * (0.95 + stretch * 0.26), b.radius * 0.84, shadowRot, 0, Math.PI * 2);
  }

  for (let i = 0; i < trees.length; i++) {
    const t = trees[i];
    const sr = t.canopyRadius * 0.94;
    const dist = t.canopyRadius * 0.56 * stretch;
    const sx = t.x - camX + dirX * dist;
    const sy = t.y - camY + dirY * dist;
    ctx.moveTo(sx + sr * (0.96 + stretch * 0.28), sy);
    ctx.ellipse(sx, sy, sr * (0.96 + stretch * 0.28), sr * 0.82, shadowRot, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

export function renderForestTrunksAndProps(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  width: number,
  height: number,
  time: number,
  lighting?: ForestLightingParams
): void {
  const forest = getForestData();
  const viewLeft = camX - 100;
  const viewTop = camY - 100;
  const viewRight = camX + width + 100;
  const viewBottom = camY + height + 100;

  const boulders = queryBouldersInBounds(viewLeft, viewTop, viewRight, viewBottom);
  const trees = queryTreesInBounds(viewLeft, viewTop, viewRight, viewBottom);

  const sunOx = -(lighting?.shadowDirX ?? 0.68);
  const sunOy = -(lighting?.shadowDirY ?? 0.56);

  // 1. Mossy Faceted Forest Boulders
  for (let i = 0; i < boulders.length; i++) {
    const b = boulders[i];
    const sx = b.x - camX;
    const sy = b.y - camY;
    ctx.save();
    ctx.translate(sx, sy);

    ctx.save();
    ctx.rotate(b.rotation);
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.radius, 0);
    for (let v = 1; v < 8; v++) {
      const a = (v * Math.PI * 2) / 8;
      const rMod = b.radius * (0.8 + hash2d(b.seed + v * 5) * 0.26);
      ctx.lineTo(Math.cos(a) * rMod, Math.sin(a) * rMod);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner stone bevel & crack
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(b.radius * 0.14, b.radius * 0.14, b.radius * 0.56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Dynamic solar/lunar rim highlight on lit face
    ctx.fillStyle = 'rgba(226, 232, 240, 0.24)';
    ctx.beginPath();
    ctx.arc(sunOx * b.radius * 0.28, sunOy * b.radius * 0.28, b.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Lush emerald moss cap
    ctx.fillStyle = 'rgba(74, 148, 68, 0.58)';
    ctx.beginPath();
    ctx.arc(b.radius * 0.18, b.radius * 0.18, b.radius * 0.34, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 2. Living Campfire Flames & Embers in Clearings
  const fireScale = 0.65 + (lighting?.campfireStrength ?? 0.6) * 0.55;
  for (let i = 0; i < forest.clearings.length; i++) {
    const cl = forest.clearings[i];
    if (!cl.hasCampfire) continue;
    const sx = cl.x - camX;
    const sy = cl.y - camY;
    if (sx < -80 || sx > width + 80 || sy < -80 || sy > height + 80) continue;

    const flicker = (0.85 + Math.sin(time * 0.018 + i) * 0.2) * fireScale;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 12 * flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(Math.sin(time * 0.03 + i) * 2.2, Math.cos(time * 0.025 + i) * 2.2, 6 * flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Exposed Root Buttresses & Bark-Textured Solid Tree Trunks
  for (let i = 0; i < trees.length; i++) {
    const t = trees[i];
    const sx = t.x - camX;
    const sy = t.y - camY;
    ctx.save();
    ctx.translate(sx, sy);

    // Radiating surface roots gripping forest floor
    ctx.strokeStyle = '#2b1d12';
    ctx.lineWidth = Math.max(3, t.trunkRadius * 0.28);
    ctx.lineCap = 'round';
    for (let r = 0; r < 5; r++) {
      const ra = t.seed + (r * Math.PI * 2) / 5 + hash2d(r + t.id) * 0.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ra) * t.trunkRadius * 0.6, Math.sin(ra) * t.trunkRadius * 0.6);
      ctx.lineTo(Math.cos(ra) * t.trunkRadius * 1.55, Math.sin(ra) * t.trunkRadius * 1.55);
      ctx.stroke();
    }

    // Main trunk
    ctx.fillStyle = '#332215';
    ctx.strokeStyle = '#120a05';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, t.trunkRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner heartwood + solar rim light
    ctx.fillStyle = '#523724';
    ctx.beginPath();
    ctx.arc(sunOx * t.trunkRadius * 0.22, sunOy * t.trunkRadius * 0.22, t.trunkRadius * 0.56, 0, Math.PI * 2);
    ctx.fill();

    // Dead tree bare crooked branches
    if (t.species === 'DEAD') {
      ctx.strokeStyle = '#3f2e20';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      for (let br = 0; br < 5; br++) {
        const ba = t.seed + (br * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ba) * t.canopyRadius, Math.sin(ba) * t.canopyRadius);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

export function renderForestCanopies(
  ctx: CanvasRenderingContext2D,
  playerX: number,
  playerY: number,
  camX: number,
  camY: number,
  width: number,
  height: number,
  time: number
): void {
  const sprites = getCanopySprites();
  const viewLeft = camX - 150;
  const viewTop = camY - 150;
  const viewRight = camX + width + 150;
  const viewBottom = camY + height + 150;

  const trees = queryTreesInBounds(viewLeft, viewTop, viewRight, viewBottom);
  for (let i = 0; i < trees.length; i++) {
    const t = trees[i];
    if (t.species === 'DEAD') continue;

    const sx = t.x - camX;
    const sy = t.y - camY;
    const distToPlayerSq = (playerX - t.x) ** 2 + (playerY - t.y) ** 2;
    const fadeR = t.canopyRadius + 48;
    const alpha = distToPlayerSq < fadeR * fadeR ? 0.34 : 0.94;

    const swayX = Math.sin(time * 0.0014 + t.swayPhase) * 2.8;
    const swayY = Math.cos(time * 0.0011 + t.swayPhase) * 1.8;
    const swayRot = Math.sin(time * 0.0009 + t.swayPhase) * 0.035;

    const key = `${t.species}_${t.variant}`;
    const sprite = sprites[key] || sprites.PINE_0;
    const drawSize = t.canopyRadius * 2.38;

    ctx.save();
    ctx.translate(sx + swayX, sy + swayY);
    ctx.rotate(t.seed * 0.25 + swayRot);
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
    ctx.restore();
  }
}

export function renderForestAtmosphere(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  width: number,
  height: number,
  time: number,
  lighting?: ForestLightingParams
): void {
  const forest = getForestData();
  const timeSec = time * 0.001;

  // 1. Rising warm sparks above active campfires
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < forest.clearings.length; i++) {
    const cl = forest.clearings[i];
    if (!cl.hasCampfire) continue;
    const sx = cl.x - camX;
    const sy = cl.y - camY;
    if (sx < -80 || sx > width + 80 || sy < -80 || sy > height + 80) continue;

    for (let e = 0; e < 6; e++) {
      const life = ((timeSec * 0.75 + e * 0.167 + i * 0.3) % 1);
      const ex = sx + Math.sin(life * 8 + e * 2.3) * 14;
      const ey = sy - life * 44;
      ctx.globalAlpha = (1 - life) * 0.85;
      ctx.fillStyle = e % 2 === 0 ? '#fb923c' : '#fef08a';
      ctx.beginPath();
      ctx.arc(ex, ey, (1 - life) * 2.1 + 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 2. Bioluminescent Dusk/Night Fireflies drifting across woodland clearings
  const ffStrength = lighting?.fireflyStrength ?? 0;
  if (ffStrength > 0.08) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) {
      const fx = ((hash2d(i * 19.1) * width * 1.4 + Math.sin(timeSec * 0.45 + i) * 65 - camX * 0.35) % width + width) % width;
      const fy = ((hash2d(i * 31.7) * height * 1.4 + Math.cos(timeSec * 0.38 + i * 1.3) * 55 - camY * 0.35) % height + height) % height;
      const blink = Math.max(0, Math.sin(timeSec * 2.4 + i * 1.9));
      if (blink < 0.05) continue;
      ctx.globalAlpha = blink * ffStrength * 0.85;
      ctx.fillStyle = '#bef264';
      ctx.beginPath();
      ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7fee7';
      ctx.beginPath();
      ctx.arc(fx, fy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
