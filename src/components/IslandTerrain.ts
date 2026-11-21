/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ISLAND_WORLD_SIZE = 4160; // 13x13 chunks of 320 units
export const ISLAND_CENTER = ISLAND_WORLD_SIZE / 2;
export const SEA_LEVEL_Y = -9.0;
export const MAX_SEABED_DEPTH = 25.0; // Seabed drops to SEA_LEVEL_Y - 25 = -34

export type TerrainSurfaceKind = 'GRASS' | 'SAND' | 'PIER' | 'WATER';

export interface IslandPierBounds {
  cx: number;
  width: number;
  minX: number;
  maxX: number;
  startZ: number;
  endZ: number;
  deckY: number;
}

function hash2d(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Fast 1024-entry coastline radius lookup table (eliminates per-call multi-harmonic trig overhead)
const COAST_LUT_SIZE = 1024;
const COAST_LUT = new Float32Array(COAST_LUT_SIZE + 1);
const TWO_PI = Math.PI * 2;

function computeCoastlineRadiusExact(angle: number): number {
  return (
    1500 +
    Math.cos(angle * 2 + 0.45) * 78 +
    Math.sin(angle * 3 - 0.7) * 52 +
    Math.cos(angle * 5 + 1.1) * 26 +
    Math.sin(angle * 7) * 12
  );
}

for (let i = 0; i <= COAST_LUT_SIZE; i++) {
  COAST_LUT[i] = computeCoastlineRadiusExact((i / COAST_LUT_SIZE) * TWO_PI);
}

/**
 * Deterministic multi-harmonic coastline radius from ISLAND_CENTER (O(1) LUT interpolated).
 * Produces organic bays, coves, and headlands while keeping every house strictly on flat inland meadow.
 */
export function getCoastlineRadius(angle: number): number {
  let a = angle % TWO_PI;
  if (a < 0) a += TWO_PI;
  const f = (a / TWO_PI) * COAST_LUT_SIZE;
  const i0 = Math.floor(f);
  const t = f - i0;
  return COAST_LUT[i0] + (COAST_LUT[i0 + 1] - COAST_LUT[i0]) * t;
}

let cachedPierBounds: IslandPierBounds | null = null;

export function getIslandPier(): IslandPierBounds {
  if (cachedPierBounds) return cachedPierBounds;
  const southShoreR = getCoastlineRadius(Math.PI * 0.5);
  const startZ = ISLAND_CENTER + southShoreR - 64;
  const endZ = startZ + 230;
  const width = 92;
  cachedPierBounds = {
    cx: ISLAND_CENTER,
    width,
    minX: ISLAND_CENTER - width * 0.5,
    maxX: ISLAND_CENTER + width * 0.5,
    startZ,
    endZ,
    deckY: -2.2,
  };
  return cachedPierBounds;
}

export function isPointOnPier(x: number, z: number, margin = 0): boolean {
  const pier = getIslandPier();
  return (
    x >= pier.minX - margin &&
    x <= pier.maxX + margin &&
    z >= pier.startZ - margin &&
    z <= pier.endZ + margin
  );
}

/**
 * Signed radial distance from shoreline:
 * negative = inland (dry grass/beach), 0 = exact waterline, positive = ocean water.
 */
export function getCoastlineSignedDistance(x: number, z: number): number {
  const dx = x - ISLAND_CENTER;
  const dz = z - ISLAND_CENTER;
  const dist = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  return dist - getCoastlineRadius(angle);
}

/**
 * Ground terrain Y height (without wooden pier):
 * - Flat inland meadow (dist <= shoreR - 135): y = 0.0 (houses & interior floors stay level)
 * - Grassy coastal dune slope (-135 .. -60): 0 -> -3.4
 * - Dry golden sandy beach (-60 .. 0): -3.4 -> SEA_LEVEL_Y (-9.0)
 * - Shallow turquoise lagoon shelf (0 .. +185): -9.0 -> -19.5
 * - Deep ocean basin (+185 .. +420): -19.5 -> -34.0
 */
export function getIslandGroundY(x: number, z: number): number {
  const sd = getCoastlineSignedDistance(x, z);
  if (sd <= -135) return 0;
  if (sd <= -60) {
    const t = smoothstep(-135, -60, sd);
    return -3.4 * t;
  }
  if (sd <= 0) {
    const t = smoothstep(-60, 0, sd);
    return -3.4 + (SEA_LEVEL_Y + 3.4) * t;
  }
  if (sd <= 185) {
    const t = smoothstep(0, 185, sd);
    return SEA_LEVEL_Y - 10.5 * t;
  }
  const deepT = smoothstep(185, 420, sd);
  return SEA_LEVEL_Y - 10.5 - 14.5 * deepT;
}

/**
 * Water depth at world (x, z) taking into account the walkable wooden pier deck.
 * Returns 0 on land, beach, or wooden pier; > 0 when wading/swimming in the ocean.
 */
export function getWaterDepth(x: number, z: number): number {
  if (isPointOnPier(x, z)) return 0;
  const groundY = getIslandGroundY(x, z);
  return Math.max(0, SEA_LEVEL_Y - groundY);
}

/**
 * Raw water depth ignoring the pier (used by ocean shader & seabed visuals).
 */
export function getRawOceanDepth(x: number, z: number): number {
  return Math.max(0, SEA_LEVEL_Y - getIslandGroundY(x, z));
}

export function getTerrainSurfaceKind(x: number, z: number): TerrainSurfaceKind {
  if (isPointOnPier(x, z)) return 'PIER';
  const sd = getCoastlineSignedDistance(x, z);
  if (sd > 2) return 'WATER';
  if (sd > -72) return 'SAND';
  return 'GRASS';
}

export function getIslandWalkableY(x: number, z: number): number {
  const groundY = getIslandGroundY(x, z);
  if (isPointOnPier(x, z)) {
    return Math.max(groundY, getIslandPier().deckY);
  }
  return groundY;
}

/**
 * Analytic Gerstner-steepened multi-wave swell height matching the GPU ocean vertex shader.
 * Includes nearshore shoaling steepness and wave crest sharpening.
 */
export function getOceanWaveHeight(x: number, z: number, timeSec: number): number {
  const rawDepth = getRawOceanDepth(x, z);
  if (rawDepth <= 0.05) return 0;
  const shoreDamp = Math.min(1, rawDepth / 4.2);
  const shoalBoost = 1 + 0.25 * (1 - Math.min(1, rawDepth / 14)) * shoreDamp;

  const p1 = x * 0.017 + z * 0.008 + timeSec * 1.45;
  const p2 = x * 0.011 - z * 0.019 + timeSec * 1.15;
  const p3 = x * 0.029 + z * 0.025 - timeSec * 2.05;

  const s1 = Math.sin(p1);
  const c2 = Math.cos(p2);
  const s3 = Math.sin(p3);
  // Gerstner-like sharper wave crests & broader troughs
  const crest = (s1 + 0.22 * (s1 * s1 - 0.5)) * 1.05 + c2 * 0.72 + s3 * 0.34;
  return crest * shoreDamp * shoalBoost;
}

/**
 * Analytic surface slopes (dh/dx, dh/dz) matching GPU Gerstner wave normals for buoy/entity tilting.
 */
export function getOceanWaveSlope(
  x: number,
  z: number,
  timeSec: number
): { dhdx: number; dhdz: number } {
  const rawDepth = getRawOceanDepth(x, z);
  if (rawDepth <= 0.05) return { dhdx: 0, dhdz: 0 };
  const shoreDamp = Math.min(1, rawDepth / 4.2);

  const p1 = x * 0.017 + z * 0.008 + timeSec * 1.45;
  const p2 = x * 0.011 - z * 0.019 + timeSec * 1.15;
  const p3 = x * 0.029 + z * 0.025 - timeSec * 2.05;

  const c1 = Math.cos(p1);
  const s2 = Math.sin(p2);
  const c3 = Math.cos(p3);

  const dhdx = (c1 * 0.0178 - s2 * 0.0079 + c3 * 0.0098) * shoreDamp;
  const dhdz = (c1 * 0.0084 + s2 * 0.0136 + c3 * 0.0085) * shoreDamp;
  return { dhdx, dhdz };
}

/**
 * Physical wave orbital & coastal current drift velocity (units/sec) acting on swimmers & floating drops.
 */
export function getOceanCurrentDrift(
  x: number,
  z: number,
  timeSec: number
): { vx: number; vz: number } {
  const depth = getWaterDepth(x, z);
  if (depth <= 2.8) return { vx: 0, vz: 0 };
  const depthFactor = Math.min(1, (depth - 2.8) / 7.5);

  const p1 = x * 0.017 + z * 0.008 + timeSec * 1.45;
  const p2 = x * 0.011 - z * 0.019 + timeSec * 1.15;
  const swellPush1 = (Math.sin(p1) + 0.35) * 16.5;
  const swellPush2 = Math.cos(p2) * 11.0;

  // Subtle onshore tidal push near shallow surf zone
  const dx = x - ISLAND_CENTER;
  const dz = z - ISLAND_CENTER;
  const dist = Math.hypot(dx, dz) || 1;
  const shorePull = depth < 9.5 ? -8.5 * (1 - (depth - 2.8) / 6.7) : 0;

  return {
    vx: (swellPush1 * 0.905 + swellPush2 * 0.501 + (dx / dist) * shorePull) * depthFactor,
    vz: (swellPush1 * 0.425 - swellPush2 * 0.865 + (dz / dist) * shorePull) * depthFactor,
  };
}

/**
 * Smooth swim speed multiplier:
 * 1.0 on grass/sand/pier, 0.88 wading shallow shore, 0.76 swimming in open water.
 */
export function getWaterSpeedMultiplier(x: number, z: number): number {
  const depth = getWaterDepth(x, z);
  if (depth <= 1.2) return 1.0;
  if (depth <= 6.2) return 0.88;
  return 0.76;
}

/**
 * Computes world Y offset, submerge amount & buoyant wave pitch/roll for characters/zombies wading or swimming.
 */
export function getEntitySwimPose(
  x: number,
  z: number,
  timeSec: number,
  seed = 0
): {
  baseY: number;
  waterDepth: number;
  isSwimming: boolean;
  isWading: boolean;
  waveHeight: number;
  tiltX: number;
  tiltZ: number;
} {
  if (isPointOnPier(x, z)) {
    return {
      baseY: getIslandPier().deckY,
      waterDepth: 0,
      isSwimming: false,
      isWading: false,
      waveHeight: 0,
      tiltX: 0,
      tiltZ: 0,
    };
  }
  const groundY = getIslandGroundY(x, z);
  const waterDepth = Math.max(0, SEA_LEVEL_Y - groundY);
  if (waterDepth <= 0.4) {
    return {
      baseY: groundY,
      waterDepth: 0,
      isSwimming: false,
      isWading: false,
      waveHeight: 0,
      tiltX: 0,
      tiltZ: 0,
    };
  }
  const waveY = getOceanWaveHeight(x, z, timeSec);
  const slope = getOceanWaveSlope(x, z, timeSec);
  const swimBob = Math.sin(timeSec * 3.1 + seed) * 0.62;
  if (waterDepth <= 6.2) {
    // Wading: feet touch sandy seabed, water reaches ankles/knees
    return {
      baseY: groundY + waveY * 0.28,
      waterDepth,
      isSwimming: false,
      isWading: true,
      waveHeight: waveY,
      tiltX: slope.dhdz * 0.35,
      tiltZ: -slope.dhdx * 0.35,
    };
  }
  // Buoyant swimming: shoulders & weapon stay cleanly above the waves while lower body submerges
  const floatSink = Math.min(7.2, 2.8 + (waterDepth - 6.2) * 0.35);
  return {
    baseY: SEA_LEVEL_Y - floatSink + waveY * 0.82 + swimBob,
    waterDepth,
    isSwimming: true,
    isWading: false,
    waveHeight: waveY,
    tiltX: slope.dhdz * 1.15,
    tiltZ: -slope.dhdx * 1.15,
  };
}

/**
 * Seamless 256x256 golden coastal beach sand texture tile.
 */
export function createBeachSandTile(): HTMLCanvasElement {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (!g) return c;

  g.fillStyle = '#e2c792';
  g.fillRect(0, 0, size, size);

  const drawWrapped = (fn: (ox: number, oy: number) => void) => {
    for (let oy = -size; oy <= size; oy += size) {
      for (let ox = -size; ox <= size; ox += size) {
        fn(ox, oy);
      }
    }
  };

  // Subtle wind-swept dune ripple bands
  for (let y = 0; y < size; y += 8) {
    const shade = Math.sin((y / size) * Math.PI * 6);
    g.fillStyle = shade > 0 ? 'rgba(254, 243, 199, 0.14)' : 'rgba(180, 138, 76, 0.11)';
    g.fillRect(0, y, size, 4);
  }

  // Organic warm dune & mineral patches
  for (let p = 0; p < 18; p++) {
    const px = hash2d(p * 21.7 + 3) * size;
    const py = hash2d(p * 37.3 + 9) * size;
    const pr = 20 + hash2d(p * 53.1) * 32;
    drawWrapped((ox, oy) => {
      const cx = px + ox;
      const cy = py + oy;
      if (cx + pr < 0 || cx - pr > size || cy + pr < 0 || cy - pr > size) return;
      const grad = g.createRadialGradient(cx, cy, 2, cx, cy, pr);
      grad.addColorStop(0, p % 2 === 0 ? 'rgba(250, 232, 188, 0.24)' : 'rgba(194, 152, 92, 0.22)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, pr, 0, Math.PI * 2);
      g.fill();
    });
  }

  // Quartz, shell & basalt sand grains
  for (let i = 0; i < 950; i++) {
    const gx = Math.floor(hash2d(i * 13.3 + 1) * size);
    const gy = Math.floor(hash2d(i * 29.1 + 7) * size);
    const sz = hash2d(i * 41.7) > 0.85 ? 2 : 1;
    const tone = hash2d(i * 59.3);
    g.fillStyle =
      tone < 0.28
        ? 'rgba(120, 92, 56, 0.26)'
        : tone < 0.7
          ? 'rgba(255, 251, 235, 0.28)'
          : 'rgba(161, 124, 72, 0.24)';
    g.fillRect(gx, gy, sz, sz);
  }

  // Tiny scattered seashell flecks
  for (let s = 0; s < 14; s++) {
    const sx = hash2d(s * 61.7 + 11) * size;
    const sy = hash2d(s * 83.3 + 19) * size;
    g.fillStyle = s % 2 === 0 ? 'rgba(255, 247, 237, 0.65)' : 'rgba(253, 224, 178, 0.55)';
    g.beginPath();
    g.ellipse(sx, sy, 2.2, 1.4, hash2d(s * 17) * Math.PI, 0, Math.PI * 2);
    g.fill();
  }

  return c;
}

/**
 * Seamless 128x128 tileable GPU normal + lacy foam DataTexture for fast ocean surface ripples.
 * Avoids 10+ expensive per-pixel sin/cos calls in fragment shaders on the coastline!
 * - R/G: tangent-space wave normal X/Z slope encoded in [0..255] (128 = flat)
 * - B: organic cellular seafoam web density [0..255]
 * - A: 255
 */
export function createOceanSurfaceDetailDataArray(size = 128): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  const heights = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    const v = (y / size) * TWO_PI;
    for (let x = 0; x < size; x++) {
      const u = (x / size) * TWO_PI;
      const h =
        Math.sin(u * 2 + v) * 0.42 +
        Math.cos(u * 3 - v * 2 + 0.7) * 0.34 +
        Math.sin(u * 5 + v * 4 - 1.2) * 0.16 +
        Math.cos(u * 7 - v * 6 + 2.1) * 0.08;
      heights[y * size + x] = h;
    }
  }

  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    const v = (y / size) * TWO_PI;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const u = (x / size) * TWO_PI;

      const dx = (heights[y * size + xp] - heights[y * size + xm]) * 1.15;
      const dz = (heights[yp * size + x] - heights[ym * size + x]) * 1.15;
      const nx = Math.max(0, Math.min(255, Math.round((dx * 0.5 + 0.5) * 255)));
      const nz = Math.max(0, Math.min(255, Math.round((dz * 0.5 + 0.5) * 255)));

      // Lacy foam web pattern from multi-frequency interference
      const webA = Math.abs(Math.sin(u * 4 + Math.cos(v * 3) * 0.9));
      const webB = Math.abs(Math.cos(v * 5 - Math.sin(u * 4) * 0.8));
      const bubble = smoothstep(0.22, 0.88, 1 - webA * webB);

      const idx = (y * size + x) * 4;
      data[idx] = nx;
      data[idx + 1] = nz;
      data[idx + 2] = Math.round(bubble * 255);
      data[idx + 3] = 255;
    }
  }
  return data;
}

/**
 * Generates a linear 256x256 GPU island coastline & bathymetry lookup texture covering [0..ISLAND_WORLD_SIZE].
 * - R: signed height blend (0.5 = exact sea waterline, >0.5 = beach/grass land, <0.5 = submerged seabed)
 * - G: normalized ocean depth (0 = dry/waterline, 1 = deep MAX_SEABED_DEPTH)
 * - B: sand/grass transition weight (0 = pure grass, 1 = full beach sand / seabed)
 * - A: 255
 */
export function createIslandBathymetryDataArray(size = 256): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  for (let py = 0; py < size; py++) {
    // Row 0 in DataTexture (flipY=false) maps to UV v=0 -> z=0
    const wz = (py / (size - 1)) * ISLAND_WORLD_SIZE;
    for (let px = 0; px < size; px++) {
      const wx = (px / (size - 1)) * ISLAND_WORLD_SIZE;
      const sd = getCoastlineSignedDistance(wx, wz);
      const groundY = getIslandGroundY(wx, wz);
      const depth = Math.max(0, SEA_LEVEL_Y - groundY);

      // R: centered at 0.5 around shoreline (sd in [-160 .. +160] mapped cleanly to [1..0])
      const shoreSignedNorm = Math.max(0, Math.min(1, 0.5 - sd / 320));
      // G: depth 0..MAX_SEABED_DEPTH
      const depthNorm = Math.max(0, Math.min(1, depth / MAX_SEABED_DEPTH));
      // B: sand transition starts inland at sd = -120 and reaches full sand at sd = -36
      const sandWeight = smoothstep(-120, -36, sd);

      const idx = (py * size + px) * 4;
      data[idx] = Math.round(shoreSignedNorm * 255);
      data[idx + 1] = Math.round(depthNorm * 255);
      data[idx + 2] = Math.round(sandWeight * 255);
      data[idx + 3] = 255;
    }
  }
  return data;
}

