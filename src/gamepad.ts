import { useEffect, useState } from 'react';

export type GamepadProfileMode = 'AUTO' | 'STANDARD' | 'ANDROID_HID' | 'PLAYSTATION' | 'NINTENDO';
export type RightStickAxesMode = 'AUTO' | '2_3' | '2_5' | '3_4';

export interface GamepadSettings {
  profile: GamepadProfileMode;
  rightStickAxes: RightStickAxesMode;
  twinStickAutoFire: boolean;
}

const SETTINGS_STORAGE_KEY = 'zombie_shooter_gamepad_settings_v2';

const DEFAULT_GAMEPAD_SETTINGS: GamepadSettings = {
  profile: 'AUTO',
  rightStickAxes: 'AUTO',
  twinStickAutoFire: true,
};

let cachedSettings: GamepadSettings | null = null;

export function getGamepadSettings(): GamepadSettings {
  if (cachedSettings) return cachedSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedSettings = {
        profile: parsed.profile || 'AUTO',
        rightStickAxes: parsed.rightStickAxes || 'AUTO',
        twinStickAutoFire:
          typeof parsed.twinStickAutoFire === 'boolean' ? parsed.twinStickAutoFire : true,
      };
      return cachedSettings;
    }
  } catch {}
  cachedSettings = { ...DEFAULT_GAMEPAD_SETTINGS };
  return cachedSettings;
}

export function saveGamepadSettings(next: Partial<GamepadSettings>): GamepadSettings {
  const merged: GamepadSettings = { ...getGamepadSettings(), ...next };
  cachedSettings = merged;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  } catch {}
  return merged;
}

export interface GamepadInputSnapshot {
  connected: boolean;
  id: string;
  detectedProfile: Exclude<GamepadProfileMode, 'AUTO'>;
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  aimActive: boolean;
  aimFire: boolean;
  fireHeld: boolean;
  warpHeld: boolean;
  switchPressed: boolean;
  skillPressed: boolean;
  reloadPressed: boolean;
  pausePressed: boolean;
}

export interface GamepadEdgeState {
  prevSwitch: boolean;
  prevSkill: boolean;
  prevReload: boolean;
  prevPause: boolean;
}

export function createGamepadEdgeState(): GamepadEdgeState {
  return {
    prevSwitch: false,
    prevSkill: false,
    prevReload: false,
    prevPause: false,
  };
}

interface PadCalibration {
  padKey: string;
  restAxes: number[];
  triggerAxes: boolean[];
  detectedProfile: Exclude<GamepadProfileMode, 'AUTO'>;
  rxIndex: number;
  ryIndex: number;
}

const calibrationCache = new Map<string, PadCalibration>();

export function sanitizeAxis(val: number | undefined): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return 0;
  if (Math.abs(val) < 0.002) return 0;
  return Math.max(-1, Math.min(1, val));
}

export function isBtnPressed(pad: Gamepad | null | undefined, idx: number, threshold = 0.35): boolean {
  if (!pad || !pad.buttons || idx < 0 || idx >= pad.buttons.length) return false;
  const btn = pad.buttons[idx];
  if (!btn) return false;
  const val = typeof btn.value === 'number' && Number.isFinite(btn.value) ? btn.value : 0;
  return Boolean(btn.pressed || val >= threshold);
}

/**
 * Selects the genuine controller while filtering out Android/Linux virtual ghost devices
 * (e.g., fingerprint sensors, uinput-goodix, gpio-keys, consumer control).
 */
export function getPrimaryGamepad(): Gamepad | null {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  const pads = navigator.getGamepads();
  if (!pads) return null;

  let bestPad: Gamepad | null = null;
  let bestScore = -Infinity;

  for (let i = 0; i < pads.length; i++) {
    const p = pads[i];
    if (!p || !p.connected) continue;
    const btnCount = p.buttons ? p.buttons.length : 0;
    const axisCount = p.axes ? p.axes.length : 0;
    if (btnCount < 4 && axisCount < 2) continue;

    const idLower = (p.id || '').toLowerCase();
    const isLikelyGhost =
      /fingerprint|goodix|uinput|gpio|accelerometer|gyroscope|sensor|touchscreen|consumer control/.test(
        idLower
      );
    if (isLikelyGhost && btnCount < 10) continue;

    let score = 0;
    if (!isLikelyGhost) score += 1000;
    if (p.mapping === 'standard') score += 300;
    if (axisCount >= 4) score += 150;
    if (btnCount >= 10) score += 100;
    score += Math.min(axisCount, 10) * 5 + Math.min(btnCount, 20) * 2;

    // Bonus if the user is actively pressing or moving sticks on this pad
    let activeInput = false;
    for (let b = 0; b < btnCount; b++) {
      if (p.buttons[b]?.pressed) {
        activeInput = true;
        break;
      }
    }
    if (!activeInput) {
      for (let a = 0; a < Math.min(axisCount, 6); a++) {
        const av = p.axes[a];
        if (typeof av === 'number' && Math.abs(av) > 0.25 && Math.abs(av + 1) > 0.15) {
          activeInput = true;
          break;
        }
      }
    }
    if (activeInput) score += 50;

    if (score > bestScore) {
      bestScore = score;
      bestPad = p;
    }
  }

  return bestPad;
}

function detectProfile(pad: Gamepad): Exclude<GamepadProfileMode, 'AUTO'> {
  const idLower = (pad.id || '').toLowerCase();
  const isNintendo = /057e|nintendo|switch|pro controller|joy-con/.test(idLower);
  if (isNintendo) return 'NINTENDO';

  if (pad.mapping === 'standard') {
    return 'STANDARD';
  }

  const isPlayStation = /054c|sony|dualshock|dualsense|playstation|ps4|ps5/.test(idLower);
  if (isPlayStation) return 'PLAYSTATION';

  // Generic / Android Bluetooth HID (Xbox BT unmapped on Android, iPega, GameSir, BSP, ShanWan, etc.)
  return 'ANDROID_HID';
}

function getOrCreateCalibration(pad: Gamepad): PadCalibration {
  const key = `${pad.index}::${pad.id}::${pad.mapping}::${pad.axes?.length || 0}::${pad.buttons?.length || 0}`;
  const existing = calibrationCache.get(key);
  if (existing) {
    // Refine trigger detection if an axis was initially resting at -1
    const axesLen = pad.axes?.length || 0;
    for (let i = 2; i < Math.min(axesLen, 8); i++) {
      const v = sanitizeAxis(pad.axes[i]);
      if (v < -0.78 && Math.abs(existing.restAxes[i] ?? 0) > 0.7) {
        existing.triggerAxes[i] = true;
      }
    }
    return existing;
  }

  const axesLen = pad.axes?.length || 0;
  const restAxes: number[] = [];
  const triggerAxes: boolean[] = [];
  for (let i = 0; i < axesLen; i++) {
    const v = sanitizeAxis(pad.axes[i]);
    restAxes.push(v);
    // Triggers on Android / Linux HID typically rest at -1.0 (or +1.0)
    triggerAxes.push(i >= 2 && v < -0.72);
  }

  const detectedProfile = detectProfile(pad);

  // Determine default Right Stick axis indices for this controller
  let rxIndex = 2;
  let ryIndex = 3;

  if (pad.mapping === 'standard' && !triggerAxes[2] && !triggerAxes[3]) {
    rxIndex = 2;
    ryIndex = 3;
  } else if (axesLen >= 6) {
    if ((triggerAxes[3] || triggerAxes[4]) && !triggerAxes[2] && !triggerAxes[5]) {
      // Android Xbox / DualSense / Generic HID: Z (2) & RZ (5) are Right Stick, 3 & 4 are L2/R2
      rxIndex = 2;
      ryIndex = 5;
    } else if ((triggerAxes[2] || triggerAxes[5]) && !triggerAxes[3] && !triggerAxes[4]) {
      // Linux / HID: 2 is L2, 3 & 4 are Right Stick, 5 is R2
      rxIndex = 3;
      ryIndex = 4;
    } else if (!triggerAxes[2] && !triggerAxes[3]) {
      rxIndex = 2;
      ryIndex = 3;
    } else {
      // Pick first two non-trigger axes in [2..5]
      const centered: number[] = [];
      for (let i = 2; i < 6; i++) {
        if (!triggerAxes[i]) centered.push(i);
      }
      if (centered.length >= 2) {
        rxIndex = centered[0];
        ryIndex = centered[1];
      }
    }
  }

  const cal: PadCalibration = {
    padKey: key,
    restAxes,
    triggerAxes,
    detectedProfile,
    rxIndex,
    ryIndex,
  };
  calibrationCache.set(key, cal);
  return cal;
}

interface LogicalButtons {
  south: boolean; // A / Cross (Confirm / Shoot)
  east: boolean; // B / Circle (Back / Switch Mode)
  west: boolean; // X / Square (Warp / Hold Fury)
  north: boolean; // Y / Triangle (Mastery Skill / Fusion)
  l1: boolean; // LB / L1
  r1: boolean; // RB / R1
  l2: boolean; // LT / L2
  r2: boolean; // RT / R2
  select: boolean;
  start: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
}

function readLogicalButtons(
  pad: Gamepad,
  profile: Exclude<GamepadProfileMode, 'AUTO'>,
  cal: PadCalibration
): LogicalButtons {
  const btnLen = pad.buttons?.length || 0;

  let south = false;
  let east = false;
  let west = false;
  let north = false;
  let l1 = false;
  let r1 = false;
  let l2 = false;
  let r2 = false;
  let select = false;
  let start = false;

  if (profile === 'STANDARD') {
    south = isBtnPressed(pad, 0);
    east = isBtnPressed(pad, 1);
    west = isBtnPressed(pad, 2);
    north = isBtnPressed(pad, 3);
    l1 = isBtnPressed(pad, 4);
    r1 = isBtnPressed(pad, 5);
    l2 = isBtnPressed(pad, 6, 0.22);
    r2 = isBtnPressed(pad, 7, 0.22);
    select = isBtnPressed(pad, 8);
    start = isBtnPressed(pad, 9);
  } else if (profile === 'NINTENDO') {
    // Nintendo physical layout has B at bottom (0 or 1) and A at right
    if (pad.mapping === 'standard') {
      south = isBtnPressed(pad, 0); // Bottom physical (B on Switch)
      east = isBtnPressed(pad, 1); // Right physical (A on Switch)
      west = isBtnPressed(pad, 2); // Left physical (Y on Switch)
      north = isBtnPressed(pad, 3); // Top physical (X on Switch)
    } else {
      south = isBtnPressed(pad, 1);
      east = isBtnPressed(pad, 0);
      west = isBtnPressed(pad, 3);
      north = isBtnPressed(pad, 2);
    }
    l1 = isBtnPressed(pad, 4);
    r1 = isBtnPressed(pad, 5);
    l2 = isBtnPressed(pad, 6, 0.22);
    r2 = isBtnPressed(pad, 7, 0.22);
    select = isBtnPressed(pad, 8);
    start = isBtnPressed(pad, 9);
  } else if (profile === 'PLAYSTATION') {
    // Unmapped Sony DualShock 4 / DualSense HID:
    // 0: Square, 1: Cross, 2: Circle, 3: Triangle, 4: L1, 5: R1, 6: L2, 7: R2, 8: Share, 9: Options
    west = isBtnPressed(pad, 0);
    south = isBtnPressed(pad, 1);
    east = isBtnPressed(pad, 2);
    north = isBtnPressed(pad, 3);
    l1 = isBtnPressed(pad, 4);
    r1 = isBtnPressed(pad, 5);
    l2 = isBtnPressed(pad, 6, 0.22);
    r2 = isBtnPressed(pad, 7, 0.22);
    select = isBtnPressed(pad, 8);
    start = isBtnPressed(pad, 9);
  } else {
    // ANDROID_HID (Generic Android Bluetooth / iPega / GameSir / Xbox BT unmapped in WebView)
    // Android InputDevice layout often skips index 2 (C) & 5 (Z):
    // 0: A, 1: B, 3: X, 4: Y, 6: L1, 7: R1, 8: L2, 9: R2, 10: Select, 11: Start
    const hasExtendedLayout = btnLen >= 12 && !isBtnPressed(pad, 2) && !isBtnPressed(pad, 5);
    if (btnLen >= 12) {
      south = isBtnPressed(pad, 0);
      east = isBtnPressed(pad, 1);
      // Support both C/Z-skipped Android HID (3=X,4=Y) and packed if user hits 2/3
      west = isBtnPressed(pad, 3);
      north = isBtnPressed(pad, 4);
      l1 = isBtnPressed(pad, 6);
      r1 = isBtnPressed(pad, 7);
      l2 = isBtnPressed(pad, 8, 0.22);
      r2 = isBtnPressed(pad, 9, 0.22);
      select = isBtnPressed(pad, 10);
      start = isBtnPressed(pad, 11);
      if (!hasExtendedLayout && (isBtnPressed(pad, 2) || isBtnPressed(pad, 5))) {
        // Fallback if this HID actually uses 2=X, 3=Y, 4=L1, 5=R1
        west = isBtnPressed(pad, 2);
        north = isBtnPressed(pad, 3);
        l1 = isBtnPressed(pad, 4);
        r1 = isBtnPressed(pad, 5);
        l2 = isBtnPressed(pad, 6, 0.22);
        r2 = isBtnPressed(pad, 7, 0.22);
        select = isBtnPressed(pad, 8);
        start = isBtnPressed(pad, 9);
      }
    } else {
      south = isBtnPressed(pad, 0);
      east = isBtnPressed(pad, 1);
      west = isBtnPressed(pad, 2);
      north = isBtnPressed(pad, 3);
      l1 = isBtnPressed(pad, 4);
      r1 = isBtnPressed(pad, 5);
      l2 = isBtnPressed(pad, 6, 0.22);
      r2 = isBtnPressed(pad, 7, 0.22);
      select = isBtnPressed(pad, 8);
      start = isBtnPressed(pad, 9);
    }
  }

  // Also check analog trigger axes (for controllers where L2/R2 only report on axes and not buttons)
  if (cal.triggerAxes[3] && sanitizeAxis(pad.axes?.[3]) > -0.35) l2 = true;
  if (cal.triggerAxes[4] && sanitizeAxis(pad.axes?.[4]) > -0.35) r2 = true;
  if (cal.triggerAxes[2] && sanitizeAxis(pad.axes?.[2]) > -0.35) l2 = true;
  if (cal.triggerAxes[5] && sanitizeAxis(pad.axes?.[5]) > -0.35) r2 = true;

  // D-Pad: Check standard buttons 12..15 AND common Android hat axes (axes[6]/axes[7] or axes[4]/axes[5] hat)
  let dpadUp = isBtnPressed(pad, 12);
  let dpadDown = isBtnPressed(pad, 13);
  let dpadLeft = isBtnPressed(pad, 14);
  let dpadRight = isBtnPressed(pad, 15);

  const axesLen = pad.axes?.length || 0;
  if (axesLen >= 8) {
    const hx = sanitizeAxis(pad.axes[6]);
    const hy = sanitizeAxis(pad.axes[7]);
    if (hx < -0.55) dpadLeft = true;
    if (hx > 0.55) dpadRight = true;
    if (hy < -0.55) dpadUp = true;
    if (hy > 0.55) dpadDown = true;
  }

  return {
    south,
    east,
    west,
    north,
    l1,
    r1,
    l2,
    r2,
    select,
    start,
    dpadUp,
    dpadDown,
    dpadLeft,
    dpadRight,
  };
}

function readRightStick(
  pad: Gamepad,
  cal: PadCalibration,
  axesMode: RightStickAxesMode
): { rx: number; ry: number } {
  const axes = pad.axes;
  if (!axes || axes.length < 4) return { rx: 0, ry: 0 };

  let ix = cal.rxIndex;
  let iy = cal.ryIndex;
  if (axesMode === '2_3') {
    ix = 2;
    iy = 3;
  } else if (axesMode === '2_5' && axes.length >= 6) {
    ix = 2;
    iy = 5;
  } else if (axesMode === '3_4' && axes.length >= 5) {
    ix = 3;
    iy = 4;
  }

  let rx = sanitizeAxis(axes[ix]);
  let ry = sanitizeAxis(axes[iy]);

  // Safety guard: if an axis is actually a resting trigger at -1 or +1 when idle, ignore phantom stick lock
  if (cal.triggerAxes[ix]) rx = 0;
  if (cal.triggerAxes[iy]) ry = 0;

  // Dynamic fallback in AUTO mode: if primary right-stick pair is completely dead at 0
  // while another non-trigger pair in axes[2..5] is clearly being pushed, switch immediately!
  if (axesMode === 'AUTO' && Math.hypot(rx, ry) < 0.14 && axes.length >= 6) {
    const candidates: [number, number][] = [
      [2, 5],
      [3, 4],
      [2, 3],
    ];
    for (const [cx, cy] of candidates) {
      if (cx === ix && cy === iy) continue;
      if (cal.triggerAxes[cx] || cal.triggerAxes[cy]) continue;
      const tx = sanitizeAxis(axes[cx]);
      const ty = sanitizeAxis(axes[cy]);
      const tMag = Math.hypot(tx, ty);
      // Only adopt if axis rest was near center and is now pushed cleanly
      const restOk = Math.abs(cal.restAxes[cx] ?? 0) < 0.45 && Math.abs(cal.restAxes[cy] ?? 0) < 0.45;
      if (restOk && tMag >= 0.25 && tMag <= 1.45) {
        cal.rxIndex = cx;
        cal.ryIndex = cy;
        return { rx: tx, ry: ty };
      }
    }
  }

  return { rx, ry };
}

/**
 * Reads the primary connected gamepad without allocating intermediate arrays/objects
 * outside the returned snapshot. Safe to call every animation frame.
 */
export function readActiveGamepadState(
  edges: GamepadEdgeState,
  out: GamepadInputSnapshot
): GamepadInputSnapshot {
  const pad = getPrimaryGamepad();
  if (!pad) {
    out.connected = false;
    out.id = '';
    out.moveX = 0;
    out.moveY = 0;
    out.aimX = 0;
    out.aimY = 0;
    out.aimActive = false;
    out.aimFire = false;
    out.fireHeld = false;
    out.warpHeld = false;
    out.switchPressed = false;
    out.skillPressed = false;
    out.reloadPressed = false;
    out.pausePressed = false;
    edges.prevSwitch = false;
    edges.prevSkill = false;
    edges.prevReload = false;
    edges.prevPause = false;
    return out;
  }

  const settings = getGamepadSettings();
  const cal = getOrCreateCalibration(pad);
  const effectiveProfile: Exclude<GamepadProfileMode, 'AUTO'> =
    settings.profile === 'AUTO' ? cal.detectedProfile : settings.profile;

  const btns = readLogicalButtons(pad, effectiveProfile, cal);

  out.connected = true;
  out.id = pad.id || 'Gamepad';
  out.detectedProfile = effectiveProfile;

  // Left stick + D-Pad movement
  let lx = sanitizeAxis(pad.axes?.[0]);
  let ly = sanitizeAxis(pad.axes?.[1]);
  const leftMag = Math.hypot(lx, ly);
  const LEFT_DEADZONE = 0.16;
  if (!Number.isFinite(leftMag) || leftMag < LEFT_DEADZONE) {
    lx = 0;
    ly = 0;
  } else {
    const scaled = Math.min(1, (leftMag - LEFT_DEADZONE) / (1 - LEFT_DEADZONE));
    lx = (lx / leftMag) * scaled;
    ly = (ly / leftMag) * scaled;
    if (!Number.isFinite(lx)) lx = 0;
    if (!Number.isFinite(ly)) ly = 0;
  }

  let dpadX = 0;
  let dpadY = 0;
  if (btns.dpadLeft) dpadX -= 1;
  if (btns.dpadRight) dpadX += 1;
  if (btns.dpadUp) dpadY -= 1;
  if (btns.dpadDown) dpadY += 1;

  if (dpadX !== 0 || dpadY !== 0) {
    const dLen = Math.hypot(dpadX, dpadY) || 1;
    out.moveX = dpadX / dLen;
    out.moveY = dpadY / dLen;
  } else {
    out.moveX = lx;
    out.moveY = ly;
  }
  if (!Number.isFinite(out.moveX)) out.moveX = 0;
  if (!Number.isFinite(out.moveY)) out.moveY = 0;

  // Right stick aiming (handles standard 2/3, Android Z/RZ 2/5, and HID 3/4 automatically)
  const { rx, ry } = readRightStick(pad, cal, settings.rightStickAxes);
  const rightMag = Math.hypot(rx, ry);
  const RIGHT_AIM_DEADZONE = 0.16;
  const RIGHT_FIRE_DEADZONE = 0.42;

  if (Number.isFinite(rightMag) && rightMag >= RIGHT_AIM_DEADZONE) {
    out.aimX = rx / rightMag;
    out.aimY = ry / rightMag;
    out.aimActive = true;
    out.aimFire = settings.twinStickAutoFire && rightMag >= RIGHT_FIRE_DEADZONE;
    if (!Number.isFinite(out.aimX)) out.aimX = 0;
    if (!Number.isFinite(out.aimY)) out.aimY = 0;
  } else {
    out.aimX = 0;
    out.aimY = 0;
    out.aimActive = false;
    out.aimFire = false;
  }

  // Clear, non-conflicting shooter bindings:
  // Fire: RT (R2), RB (R1), or A (Cross)
  out.fireHeld = btns.r2 || btns.r1 || btns.south;

  // Warp / Fury (Hold): LT (L2), LB (L1), or X (Square)
  out.warpHeld = btns.l2 || btns.l1 || btns.west;

  // Switch Mode / Dragon (Tap): B (Circle), or tap LB / L1
  const switchDown = btns.east || btns.l1;
  out.switchPressed = switchDown && !edges.prevSwitch;
  edges.prevSwitch = switchDown;

  // Mastery Skill / Mega Fusion: Y (Triangle)
  const skillDown = btns.north;
  out.skillPressed = skillDown && !edges.prevSkill;
  edges.prevSkill = skillDown;

  // Reload (unused for infinite ammo, kept clean)
  out.reloadPressed = false;
  edges.prevReload = false;

  // Pause: Start / Options
  const pauseDown = btns.start;
  out.pausePressed = pauseDown && !edges.prevPause;
  edges.prevPause = pauseDown;

  return out;
}

export interface GamepadDiagnosticInfo {
  connected: boolean;
  id: string;
  mapping: string;
  detectedProfile: Exclude<GamepadProfileMode, 'AUTO'>;
  rxIndex: number;
  ryIndex: number;
  lx: number;
  ly: number;
  rx: number;
  ry: number;
  pressedIndices: number[];
}

export function getGamepadDiagnosticInfo(): GamepadDiagnosticInfo | null {
  const pad = getPrimaryGamepad();
  if (!pad) return null;
  const settings = getGamepadSettings();
  const cal = getOrCreateCalibration(pad);
  const profile: Exclude<GamepadProfileMode, 'AUTO'> =
    settings.profile === 'AUTO' ? cal.detectedProfile : settings.profile;
  const { rx, ry } = readRightStick(pad, cal, settings.rightStickAxes);
  const pressedIndices: number[] = [];
  if (pad.buttons) {
    for (let i = 0; i < pad.buttons.length; i++) {
      if (isBtnPressed(pad, i)) pressedIndices.push(i);
    }
  }
  return {
    connected: true,
    id: pad.id || 'Gamepad',
    mapping: pad.mapping || 'raw',
    detectedProfile: profile,
    rxIndex: settings.rightStickAxes === '2_3' ? 2 : settings.rightStickAxes === '2_5' ? 2 : settings.rightStickAxes === '3_4' ? 3 : cal.rxIndex,
    ryIndex: settings.rightStickAxes === '2_3' ? 3 : settings.rightStickAxes === '2_5' ? 5 : settings.rightStickAxes === '3_4' ? 4 : cal.ryIndex,
    lx: sanitizeAxis(pad.axes?.[0]),
    ly: sanitizeAxis(pad.axes?.[1]),
    rx,
    ry,
    pressedIndices,
  };
}

export function useGamepadConnection(): { connected: boolean; name: string } {
  const [state, setState] = useState<{ connected: boolean; name: string }>(() => {
    const pad = getPrimaryGamepad();
    return { connected: !!pad, name: pad?.id || '' };
  });

  useEffect(() => {
    const sync = () => {
      const pad = getPrimaryGamepad();
      setState((prev) => {
        const nextConnected = !!pad;
        const nextName = pad?.id || '';
        if (prev.connected === nextConnected && prev.name === nextName) return prev;
        return { connected: nextConnected, name: nextName };
      });
    };

    sync();
    window.addEventListener('gamepadconnected', sync);
    window.addEventListener('gamepaddisconnected', sync);
    const interval = window.setInterval(sync, 1200);

    return () => {
      window.removeEventListener('gamepadconnected', sync);
      window.removeEventListener('gamepaddisconnected', sync);
      window.clearInterval(interval);
    };
  }, []);

  return state;
}

type Direction = 'up' | 'down' | 'left' | 'right';

function getFocusableElements(): HTMLElement[] {
  const modalScopes = Array.from(
    document.querySelectorAll<HTMLElement>('[data-gamepad-scope="modal"]')
  );
  const root: ParentNode =
    modalScopes.length > 0 ? modalScopes[modalScopes.length - 1] : document.body;

  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [role="button"]:not([aria-disabled="true"]), [data-gamepad-nav]'
    )
  );

  return candidates.filter((el) => {
    if (el.getAttribute('aria-hidden') === 'true') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 4 && rect.height > 4;
  });
}

function findNextElement(
  current: HTMLElement | null,
  elements: HTMLElement[],
  dir: Direction
): HTMLElement | null {
  if (elements.length === 0) return null;
  if (!current || !elements.includes(current)) {
    return elements[0];
  }

  const cRect = current.getBoundingClientRect();
  const cx = cRect.left + cRect.width / 2;
  const cy = cRect.top + cRect.height / 2;

  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of elements) {
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;
    const dx = ex - cx;
    const dy = ey - cy;

    let primary = 0;
    let secondary = 0;

    if (dir === 'right') {
      if (dx <= 6) continue;
      primary = dx;
      secondary = Math.abs(dy);
    } else if (dir === 'left') {
      if (dx >= -6) continue;
      primary = -dx;
      secondary = Math.abs(dy);
    } else if (dir === 'down') {
      if (dy <= 6) continue;
      primary = dy;
      secondary = Math.abs(dx);
    } else if (dir === 'up') {
      if (dy >= -6) continue;
      primary = -dy;
      secondary = Math.abs(dx);
    }

    const score = primary + secondary * 2.25;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

/**
 * Spatial D-Pad / Left-Stick navigation across any active menu, store, prestige,
 * mastery tree, or modal. Press A/Cross to activate, B/Circle to go back/close, Start to play/resume.
 */
export function useGamepadMenuNavigation(
  enabled: boolean,
  onBack?: () => void
): void {
  useEffect(() => {
    let focusedEl: HTMLElement | null = null;

    const clearFocus = () => {
      if (focusedEl) {
        focusedEl.removeAttribute('data-gamepad-focused');
        focusedEl = null;
      }
      document
        .querySelectorAll('[data-gamepad-focused="true"]')
        .forEach((node) => node.removeAttribute('data-gamepad-focused'));
    };

    if (!enabled) {
      clearFocus();
      return;
    }

    const setFocus = (el: HTMLElement | null) => {
      if (focusedEl && focusedEl !== el) {
        try {
          focusedEl.removeAttribute('data-gamepad-focused');
        } catch {}
      }
      focusedEl = el;
      if (focusedEl) {
        try {
          focusedEl.setAttribute('data-gamepad-focused', 'true');
          if (typeof focusedEl.scrollIntoView === 'function') {
            focusedEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }
        } catch {}
      }
    };

    const handlePointer = () => clearFocus();
    window.addEventListener('pointerdown', handlePointer, { passive: true });

    let prevA = false;
    let prevB = false;
    let prevStart = false;
    let prevDir: Direction | null = null;
    let lastDirTriggerTime = 0;
    let repeatDelay = 260;
    let rafId = 0;

    const seedPad = getPrimaryGamepad();
    if (seedPad) {
      const settings = getGamepadSettings();
      const cal = getOrCreateCalibration(seedPad);
      const profile: Exclude<GamepadProfileMode, 'AUTO'> =
        settings.profile === 'AUTO' ? cal.detectedProfile : settings.profile;
      const seedBtns = readLogicalButtons(seedPad, profile, cal);
      prevA = seedBtns.south;
      prevB = seedBtns.east;
      prevStart = seedBtns.start;
    }

    const tick = (now: number) => {
      try {
        const pad = getPrimaryGamepad();
        if (pad) {
          const settings = getGamepadSettings();
          const cal = getOrCreateCalibration(pad);
          const profile: Exclude<GamepadProfileMode, 'AUTO'> =
            settings.profile === 'AUTO' ? cal.detectedProfile : settings.profile;
          const btns = readLogicalButtons(pad, profile, cal);

          let dir: Direction | null = null;
          const ax = sanitizeAxis(pad.axes?.[0]);
          const ay = sanitizeAxis(pad.axes?.[1]);

          if (btns.dpadUp || ay < -0.55) dir = 'up';
          else if (btns.dpadDown || ay > 0.55) dir = 'down';
          else if (btns.dpadLeft || ax < -0.55) dir = 'left';
          else if (btns.dpadRight || ax > 0.55) dir = 'right';

          if (dir) {
            const isNewDir = dir !== prevDir;
            if (isNewDir || now - lastDirTriggerTime >= repeatDelay) {
              const elements = getFocusableElements();
              if (!focusedEl || !document.contains(focusedEl) || !elements.includes(focusedEl)) {
                const preferred =
                  elements.find((el) => el.id === 'btn-start-game') || elements[0] || null;
                setFocus(preferred);
              } else {
                const next = findNextElement(focusedEl, elements, dir);
                if (next) setFocus(next);
              }
              lastDirTriggerTime = now;
              repeatDelay = isNewDir ? 260 : 140;
            }
            prevDir = dir;
          } else {
            prevDir = null;
          }

          // A / Cross: Click focused button
          const aDown = btns.south;
          if (aDown && !prevA) {
            const elements = getFocusableElements();
            if (!focusedEl || !document.contains(focusedEl) || !elements.includes(focusedEl)) {
              const preferred =
                elements.find((el) => el.id === 'btn-start-game') || elements[0] || null;
              setFocus(preferred);
              if (preferred) {
                try {
                  preferred.click();
                } catch {}
              }
            } else {
              try {
                focusedEl.click();
              } catch {}
            }
          }
          prevA = aDown;

          // B / Circle: Close / Back
          const bDown = btns.east;
          if (bDown && !prevB) {
            const elements = getFocusableElements();
            const backBtn = elements.find((el) => el.getAttribute('data-gamepad-back') === 'true');
            if (backBtn) {
              try {
                backBtn.click();
              } catch {}
            } else if (onBack) {
              try {
                onBack();
              } catch {}
            }
          }
          prevB = bDown;

          // Start: Start Game or Resume Pause
          const startDown = btns.start;
          if (startDown && !prevStart) {
            const elements = getFocusableElements();
            const resumeOrStart =
              elements.find((el) => el.getAttribute('data-gamepad-resume') === 'true') ||
              elements.find((el) => el.id === 'btn-start-game');
            if (resumeOrStart) {
              try {
                resumeOrStart.click();
              } catch {}
            }
          }
          prevStart = startDown;
        }
      } catch {}

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointerdown', handlePointer);
      clearFocus();
    };
  }, [enabled, onBack]);
}
