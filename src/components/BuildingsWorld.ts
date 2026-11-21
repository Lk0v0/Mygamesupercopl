/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BuildingArchetype = 'RESIDENTIAL' | 'GUARDHOUSE' | 'WAREHOUSE';
export type BuildingSide = 'N' | 'S' | 'E' | 'W';
export type WallMaterialKind = 'BRICK' | 'CONCRETE' | 'METAL';

export interface BuildingWallSegment {
  cx: number;
  cz: number;
  hw: number;
  hd: number;
  yOffset: number;
  height: number;
  blocksMovement: boolean;
  blocksBullets: boolean;
  isWindowPart?: boolean;
  materialKind: WallMaterialKind;
}

export interface BuildingDoorway {
  x: number;
  z: number;
  width: number;
  side: BuildingSide;
}

export interface BuildingProp {
  kind: 'TABLE' | 'CRATE' | 'RUG' | 'WORKBENCH';
  cx: number;
  cz: number;
  hw: number;
  hd: number;
  height: number;
  blocksMovement: boolean;
  color: number;
}

export interface EnterableHouse {
  id: string;
  name: string;
  archetype: BuildingArchetype;
  cx: number;
  cz: number;
  width: number;
  depth: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  wallHeight: number;
  floorKind: 'WOOD' | 'TILE' | 'EPOXY';
  roofKind: 'GABLE' | 'FLAT_PARAPET' | 'CORRUGATED';
  roofColor: number;
  wallColor: number;
  trimColor: number;
  walls: BuildingWallSegment[];
  doorways: BuildingDoorway[];
  props: BuildingProp[];
  lightX: number;
  lightZ: number;
  porchDoor: BuildingDoorway;
}

let cachedHouses: EnterableHouse[] | null = null;

function addSegmentedSideWall(
  walls: BuildingWallSegment[],
  doorways: BuildingDoorway[],
  side: BuildingSide,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  wallT: number,
  wallHeight: number,
  materialKind: WallMaterialKind,
  openingKind: 'DOOR' | 'WINDOW' | 'SOLID',
  openingWidth: number
): void {
  const isHorizontal = side === 'N' || side === 'S';
  const span = isHorizontal ? maxX - minX : maxZ - minZ;
  const fixedCoord =
    side === 'N'
      ? minZ + wallT * 0.5
      : side === 'S'
        ? maxZ - wallT * 0.5
        : side === 'W'
          ? minX + wallT * 0.5
          : maxX - wallT * 0.5;
  const midSpan = isHorizontal ? (minX + maxX) * 0.5 : (minZ + maxZ) * 0.5;

  if (openingKind === 'SOLID') {
    walls.push({
      cx: isHorizontal ? midSpan : fixedCoord,
      cz: isHorizontal ? fixedCoord : midSpan,
      hw: isHorizontal ? span * 0.5 : wallT * 0.5,
      hd: isHorizontal ? wallT * 0.5 : span * 0.5,
      yOffset: 0,
      height: wallHeight,
      blocksMovement: true,
      blocksBullets: true,
      materialKind,
    });
    return;
  }

  const clampedOpening = Math.min(span - 48, Math.max(48, openingWidth));
  const sideLen = (span - clampedOpening) * 0.5;
  const startCoord = isHorizontal ? minX : minZ;
  const seg1Center = startCoord + sideLen * 0.5;
  const seg2Center = startCoord + span - sideLen * 0.5;

  // Left / Top solid pillar section
  walls.push({
    cx: isHorizontal ? seg1Center : fixedCoord,
    cz: isHorizontal ? fixedCoord : seg1Center,
    hw: isHorizontal ? sideLen * 0.5 : wallT * 0.5,
    hd: isHorizontal ? wallT * 0.5 : sideLen * 0.5,
    yOffset: 0,
    height: wallHeight,
    blocksMovement: true,
    blocksBullets: true,
    materialKind,
  });

  // Right / Bottom solid pillar section
  walls.push({
    cx: isHorizontal ? seg2Center : fixedCoord,
    cz: isHorizontal ? fixedCoord : seg2Center,
    hw: isHorizontal ? sideLen * 0.5 : wallT * 0.5,
    hd: isHorizontal ? wallT * 0.5 : sideLen * 0.5,
    yOffset: 0,
    height: wallHeight,
    blocksMovement: true,
    blocksBullets: true,
    materialKind,
  });

  if (openingKind === 'DOOR') {
    // Upper door lintel (characters & bullets pass underneath cleanly; fades/frames doorway)
    walls.push({
      cx: isHorizontal ? midSpan : fixedCoord,
      cz: isHorizontal ? fixedCoord : midSpan,
      hw: isHorizontal ? clampedOpening * 0.5 : wallT * 0.5,
      hd: isHorizontal ? wallT * 0.5 : clampedOpening * 0.5,
      yOffset: Math.max(54, wallHeight - 18),
      height: 18,
      blocksMovement: false,
      blocksBullets: false,
      materialKind,
    });

    doorways.push({
      x: isHorizontal ? midSpan : fixedCoord,
      z: isHorizontal ? fixedCoord : midSpan,
      width: clampedOpening,
      side,
    });
  } else {
    // WINDOW: Lower sill (blocks walking, bullets fly cleanly over) + upper lintel
    const sillH = 24;
    const lintelY = Math.max(52, wallHeight - 20);
    walls.push({
      cx: isHorizontal ? midSpan : fixedCoord,
      cz: isHorizontal ? fixedCoord : midSpan,
      hw: isHorizontal ? clampedOpening * 0.5 : wallT * 0.5,
      hd: isHorizontal ? wallT * 0.5 : clampedOpening * 0.5,
      yOffset: 0,
      height: sillH,
      blocksMovement: true,
      blocksBullets: false,
      isWindowPart: true,
      materialKind,
    });
    walls.push({
      cx: isHorizontal ? midSpan : fixedCoord,
      cz: isHorizontal ? fixedCoord : midSpan,
      hw: isHorizontal ? clampedOpening * 0.5 : wallT * 0.5,
      hd: isHorizontal ? wallT * 0.5 : clampedOpening * 0.5,
      yOffset: lintelY,
      height: wallHeight - lintelY,
      blocksMovement: false,
      blocksBullets: false,
      isWindowPart: true,
      materialKind,
    });
  }
}

function buildHouse(cfg: {
  id: string;
  name: string;
  archetype: BuildingArchetype;
  cx: number;
  cz: number;
  doorSides: [BuildingSide, BuildingSide];
  roofColor: number;
  wallColor: number;
  trimColor: number;
}): EnterableHouse {
  const width =
    cfg.archetype === 'WAREHOUSE' ? 380 : cfg.archetype === 'RESIDENTIAL' ? 320 : 240;
  const depth =
    cfg.archetype === 'WAREHOUSE' ? 280 : cfg.archetype === 'RESIDENTIAL' ? 240 : 220;
  const wallHeight = cfg.archetype === 'WAREHOUSE' ? 80 : 72;
  const wallT = 16;

  const minX = cfg.cx - width * 0.5;
  const maxX = cfg.cx + width * 0.5;
  const minZ = cfg.cz - depth * 0.5;
  const maxZ = cfg.cz + depth * 0.5;

  const materialKind: WallMaterialKind =
    cfg.archetype === 'RESIDENTIAL'
      ? 'BRICK'
      : cfg.archetype === 'GUARDHOUSE'
        ? 'CONCRETE'
        : 'METAL';

  const doorWidth =
    cfg.archetype === 'WAREHOUSE' ? 112 : cfg.archetype === 'RESIDENTIAL' ? 92 : 88;
  const windowWidth = cfg.archetype === 'WAREHOUSE' ? 88 : 74;

  const walls: BuildingWallSegment[] = [];
  const doorways: BuildingDoorway[] = [];

  const sides: BuildingSide[] = ['N', 'S', 'E', 'W'];
  for (const side of sides) {
    const isDoor = cfg.doorSides.includes(side);
    addSegmentedSideWall(
      walls,
      doorways,
      side,
      minX,
      maxX,
      minZ,
      maxZ,
      wallT,
      wallHeight,
      materialKind,
      isDoor ? 'DOOR' : 'WINDOW',
      isDoor ? doorWidth : windowWidth
    );
  }

  // Optional interior partial partition & props positioned with generous indoor movement clearance
  const props: BuildingProp[] = [];
  if (cfg.archetype === 'RESIDENTIAL') {
    // Partial interior room divider wall on the far side of doorways, leaving wide passage
    walls.push({
      cx: cfg.cx - 18,
      cz: minZ + 56,
      hw: 7,
      hd: 40,
      yOffset: 0,
      height: wallHeight - 6,
      blocksMovement: true,
      blocksBullets: true,
      materialKind: 'CONCRETE',
    });
    props.push(
      {
        kind: 'RUG',
        cx: cfg.cx - 64,
        cz: cfg.cz + 26,
        hw: 44,
        hd: 32,
        height: 1.5,
        blocksMovement: false,
        color: 0x7f1d1d,
      },
      {
        kind: 'TABLE',
        cx: cfg.cx + 72,
        cz: cfg.cz - 48,
        hw: 24,
        hd: 16,
        height: 22,
        blocksMovement: true,
        color: 0x78350f,
      },
      {
        kind: 'CRATE',
        cx: cfg.cx - 104,
        cz: cfg.cz - 62,
        hw: 15,
        hd: 15,
        height: 24,
        blocksMovement: true,
        color: 0x4d7c0f,
      }
    );
  } else if (cfg.archetype === 'GUARDHOUSE') {
    props.push(
      {
        kind: 'WORKBENCH',
        cx: cfg.cx + 46,
        cz: cfg.cz - 46,
        hw: 22,
        hd: 14,
        height: 22,
        blocksMovement: true,
        color: 0x475569,
      },
      {
        kind: 'CRATE',
        cx: cfg.cx - 56,
        cz: cfg.cz + 46,
        hw: 15,
        hd: 15,
        height: 24,
        blocksMovement: true,
        color: 0x3f6212,
      }
    );
  } else {
    // Warehouse interior crates well clear of 112-wide doorways
    props.push(
      {
        kind: 'CRATE',
        cx: cfg.cx - 96,
        cz: cfg.cz - 68,
        hw: 20,
        hd: 20,
        height: 30,
        blocksMovement: true,
        color: 0x854d0e,
      },
      {
        kind: 'CRATE',
        cx: cfg.cx + 96,
        cz: cfg.cz + 68,
        hw: 20,
        hd: 20,
        height: 30,
        blocksMovement: true,
        color: 0x365314,
      },
      {
        kind: 'WORKBENCH',
        cx: cfg.cx + 92,
        cz: cfg.cz - 72,
        hw: 26,
        hd: 15,
        height: 22,
        blocksMovement: true,
        color: 0x334155,
      }
    );
  }

  return {
    id: cfg.id,
    name: cfg.name,
    archetype: cfg.archetype,
    cx: cfg.cx,
    cz: cfg.cz,
    width,
    depth,
    minX,
    maxX,
    minZ,
    maxZ,
    wallHeight,
    floorKind:
      cfg.archetype === 'RESIDENTIAL'
        ? 'WOOD'
        : cfg.archetype === 'GUARDHOUSE'
          ? 'TILE'
          : 'EPOXY',
    roofKind:
      cfg.archetype === 'RESIDENTIAL'
        ? 'GABLE'
        : cfg.archetype === 'GUARDHOUSE'
          ? 'FLAT_PARAPET'
          : 'CORRUGATED',
    roofColor: cfg.roofColor,
    wallColor: cfg.wallColor,
    trimColor: cfg.trimColor,
    walls,
    doorways,
    props,
    lightX: cfg.cx,
    lightZ: cfg.cz,
    porchDoor: doorways[0],
  };
}

export function getEnterableHouses(): EnterableHouse[] {
  if (cachedHouses) return cachedHouses;

  cachedHouses = [
    buildHouse({
      id: 'house_north_brick',
      name: 'Casa de Alvenaria',
      archetype: 'RESIDENTIAL',
      cx: 1720,
      cz: 1660,
      doorSides: ['S', 'E'],
      roofColor: 0x7c2d12,
      wallColor: 0x9a5b46,
      trimColor: 0xd6d3d1,
    }),
    buildHouse({
      id: 'house_east_outpost',
      name: 'Posto Tático Leste',
      archetype: 'GUARDHOUSE',
      cx: 2500,
      cz: 1940,
      doorSides: ['W', 'S'],
      roofColor: 0x334155,
      wallColor: 0x64748b,
      trimColor: 0x94a3b8,
    }),
    buildHouse({
      id: 'house_sw_suburban',
      name: 'Residência Sudoeste',
      archetype: 'RESIDENTIAL',
      cx: 1620,
      cz: 2480,
      doorSides: ['N', 'E'],
      roofColor: 0x3b495e,
      wallColor: 0xcbd5e1,
      trimColor: 0x475569,
    }),
    buildHouse({
      id: 'house_ne_warehouse',
      name: 'Armazém Nordeste',
      archetype: 'WAREHOUSE',
      cx: 2680,
      cz: 1520,
      doorSides: ['S', 'W'],
      roofColor: 0x1e3a5f,
      wallColor: 0x475569,
      trimColor: 0xf59e0b,
    }),
    buildHouse({
      id: 'house_nw_bunker',
      name: 'Guarita Noroeste',
      archetype: 'GUARDHOUSE',
      cx: 1440,
      cz: 1460,
      doorSides: ['E', 'S'],
      roofColor: 0x3f3f46,
      wallColor: 0x71717a,
      trimColor: 0xa1a1aa,
    }),
    buildHouse({
      id: 'house_se_warehouse',
      name: 'Galpão Sul',
      archetype: 'WAREHOUSE',
      cx: 2560,
      cz: 2680,
      doorSides: ['N', 'W'],
      roofColor: 0x365314,
      wallColor: 0x52525b,
      trimColor: 0xfbbf24,
    }),
    buildHouse({
      id: 'house_west_cabin',
      name: 'Posto Oeste',
      archetype: 'GUARDHOUSE',
      cx: 1260,
      cz: 2080,
      doorSides: ['E', 'N'],
      roofColor: 0x78350f,
      wallColor: 0x85664e,
      trimColor: 0xd6d3d1,
    }),
  ];

  return cachedHouses;
}

function pushCircleOutOfBox(
  x: number,
  y: number,
  radius: number,
  cx: number,
  cz: number,
  hw: number,
  hd: number
): { x: number; y: number } {
  const closestX = Math.max(cx - hw, Math.min(cx + hw, x));
  const closestY = Math.max(cz - hd, Math.min(cz + hd, y));
  const dx = x - closestX;
  const dy = y - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq >= radius * radius) return { x, y };

  if (distSq > 0.0001) {
    const dist = Math.sqrt(distSq);
    const overlap = radius - dist;
    return {
      x: x + (dx / dist) * overlap,
      y: y + (dy / dist) * overlap,
    };
  }

  // Center inside box: push out along nearest axis
  const penLeft = x - (cx - hw);
  const penRight = cx + hw - x;
  const penTop = y - (cz - hd);
  const penBottom = cz + hd - y;
  const minPen = Math.min(penLeft, penRight, penTop, penBottom);
  if (minPen === penLeft) return { x: cx - hw - radius, y };
  if (minPen === penRight) return { x: cx + hw + radius, y };
  if (minPen === penTop) return { x, y: cz - hd - radius };
  return { x, y: cz + hd + radius };
}

export function resolveBuildingsCollision(
  x: number,
  y: number,
  radius: number
): { x: number; y: number } {
  const houses = getEnterableHouses();
  let rx = x;
  let ry = y;
  const margin = radius + 4;

  for (let pass = 0; pass < 2; pass++) {
    for (let h = 0; h < houses.length; h++) {
      const house = houses[h];
      if (
        rx + margin < house.minX ||
        rx - margin > house.maxX ||
        ry + margin < house.minZ ||
        ry - margin > house.maxZ
      ) {
        continue;
      }

      for (let w = 0; w < house.walls.length; w++) {
        const wall = house.walls[w];
        if (!wall.blocksMovement) continue;
        const pushed = pushCircleOutOfBox(rx, ry, radius, wall.cx, wall.cz, wall.hw, wall.hd);
        rx = pushed.x;
        ry = pushed.y;
      }

      for (let p = 0; p < house.props.length; p++) {
        const prop = house.props[p];
        if (!prop.blocksMovement) continue;
        const pushed = pushCircleOutOfBox(rx, ry, radius, prop.cx, prop.cz, prop.hw, prop.hd);
        rx = pushed.x;
        ry = pushed.y;
      }
    }
  }

  return { x: rx, y: ry };
}

export function checkBuildingsBulletHit(
  x: number,
  y: number,
  radius: number
): 'WOOD' | 'STONE' | null {
  const houses = getEnterableHouses();
  for (let h = 0; h < houses.length; h++) {
    const house = houses[h];
    if (
      x + radius < house.minX ||
      x - radius > house.maxX ||
      y + radius < house.minZ ||
      y - radius > house.maxZ
    ) {
      continue;
    }

    for (let w = 0; w < house.walls.length; w++) {
      const wall = house.walls[w];
      if (!wall.blocksBullets) continue;
      if (
        x + radius >= wall.cx - wall.hw &&
        x - radius <= wall.cx + wall.hw &&
        y + radius >= wall.cz - wall.hd &&
        y - radius <= wall.cz + wall.hd
      ) {
        return wall.materialKind === 'CONCRETE' ? 'STONE' : 'WOOD';
      }
    }
  }
  return null;
}

export function isPointInsideHouse(
  x: number,
  y: number,
  margin = 0
): EnterableHouse | null {
  const houses = getEnterableHouses();
  for (let i = 0; i < houses.length; i++) {
    const h = houses[i];
    if (
      x >= h.minX - margin &&
      x <= h.maxX + margin &&
      y >= h.minZ - margin &&
      y <= h.maxZ + margin
    ) {
      return h;
    }
  }
  return null;
}

function segmentIntersectsRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const p = [-dx, dx, -dy, dy];
  const q = [x1 - minX, maxX - x1, y1 - minZ, maxZ - y1];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-6) {
      if (q[i] < 0) return false;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
    }
  }
  return t0 <= t1;
}

// Routes zombies outside walls smoothly through house doorways toward the player
export function steerZombieAroundBuildings(
  zx: number,
  zy: number,
  px: number,
  py: number
): { targetX: number; targetY: number } {
  const houses = getEnterableHouses();
  const zInHouse = isPointInsideHouse(zx, zy, 4);
  const pInHouse = isPointInsideHouse(px, py, 4);

  // If both are inside the same house, head straight for the player
  if (zInHouse && pInHouse && zInHouse.id === pInHouse.id) {
    return { targetX: px, targetY: py };
  }

  for (let i = 0; i < houses.length; i++) {
    const h = houses[i];
    const pad = 10;
    if (!segmentIntersectsRect(zx, zy, px, py, h.minX + pad, h.maxX - pad, h.minZ + pad, h.maxZ - pad)) {
      continue;
    }

    // Check if zombie is already very close to a doorway (let it walk straight through!)
    for (let d = 0; d < h.doorways.length; d++) {
      const door = h.doorways[d];
      const dDist = Math.hypot(zx - door.x, zy - door.z);
      if (dDist < 54) {
        // Aim just inside the doorway
        const inX =
          door.side === 'W'
            ? door.x + 36
            : door.side === 'E'
              ? door.x - 36
              : door.x;
        const inZ =
          door.side === 'N'
            ? door.z + 36
            : door.side === 'S'
              ? door.z - 36
              : door.z;
        if (Math.hypot(zx - inX, zy - inZ) > 18) {
          return { targetX: inX, targetY: inZ };
        }
        return { targetX: px, targetY: py };
      }
    }

    // Pick doorway minimizing distance(z -> door) + distance(door -> player)
    let bestDoor = h.doorways[0];
    let bestCost = Infinity;
    for (let d = 0; d < h.doorways.length; d++) {
      const door = h.doorways[d];
      const cost =
        Math.hypot(door.x - zx, door.z - zy) + Math.hypot(px - door.x, py - door.z);
      if (cost < bestCost) {
        bestCost = cost;
        bestDoor = door;
      }
    }

    // Steer slightly outside the chosen doorway if zombie is outside, or slightly inside if zombie is inside
    const zInsideThis = zInHouse?.id === h.id;
    const offset = zInsideThis ? -32 : 32;
    const tx =
      bestDoor.side === 'W'
        ? bestDoor.x - offset
        : bestDoor.side === 'E'
          ? bestDoor.x + offset
          : bestDoor.x;
    const tz =
      bestDoor.side === 'N'
        ? bestDoor.z - offset
        : bestDoor.side === 'S'
          ? bestDoor.z + offset
          : bestDoor.z;

    return { targetX: tx, targetY: tz };
  }

  return { targetX: px, targetY: py };
}
