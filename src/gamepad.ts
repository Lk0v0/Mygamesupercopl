import { useEffect, useState } from 'react';

export interface GamepadInputSnapshot {
  connected: boolean;
  id: string;
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  aimActive: boolean;
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

function getPrimaryGamepad(): Gamepad | null {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  const pads = navigator.getGamepads();
  if (!pads) return null;
  for (let i = 0; i < pads.length; i++) {
    const p = pads[i];
    if (p && p.connected) return p;
  }
  return null;
}

function isBtnPressed(pad: Gamepad, idx: number, threshold = 0.35): boolean {
  const btn = pad.buttons[idx];
  if (!btn) return false;
  return btn.pressed || btn.value >= threshold;
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

  out.connected = true;
  out.id = pad.id || 'Gamepad';

  // Left stick + D-Pad movement
  let lx = pad.axes[0] ?? 0;
  let ly = pad.axes[1] ?? 0;
  const leftMag = Math.hypot(lx, ly);
  const LEFT_DEADZONE = 0.16;
  if (leftMag < LEFT_DEADZONE) {
    lx = 0;
    ly = 0;
  } else {
    const scaled = Math.min(1, (leftMag - LEFT_DEADZONE) / (1 - LEFT_DEADZONE));
    lx = (lx / leftMag) * scaled;
    ly = (ly / leftMag) * scaled;
  }

  let dpadX = 0;
  let dpadY = 0;
  if (isBtnPressed(pad, 14)) dpadX -= 1; // D-Pad Left
  if (isBtnPressed(pad, 15)) dpadX += 1; // D-Pad Right
  if (isBtnPressed(pad, 12)) dpadY -= 1; // D-Pad Up
  if (isBtnPressed(pad, 13)) dpadY += 1; // D-Pad Down

  if (dpadX !== 0 || dpadY !== 0) {
    const dLen = Math.hypot(dpadX, dpadY) || 1;
    out.moveX = dpadX / dLen;
    out.moveY = dpadY / dLen;
  } else {
    out.moveX = lx;
    out.moveY = ly;
  }

  // Right stick aiming
  const rx = pad.axes[2] ?? 0;
  const ry = pad.axes[3] ?? 0;
  const rightMag = Math.hypot(rx, ry);
  const RIGHT_DEADZONE = 0.22;
  if (rightMag >= RIGHT_DEADZONE) {
    out.aimX = rx / rightMag;
    out.aimY = ry / rightMag;
    out.aimActive = true;
  } else {
    out.aimX = 0;
    out.aimY = 0;
    out.aimActive = false;
  }

  // Triggers / face buttons
  // Fire: RT (7), RB (5), or A/Cross (0)
  out.fireHeld = isBtnPressed(pad, 7, 0.22) || isBtnPressed(pad, 5) || isBtnPressed(pad, 0);

  // Warp / Switch (Hold for Ships, Tap for Iron Man / Ice & Fire): LT (6), LB (4), or X/Square (2)
  const switchDown = isBtnPressed(pad, 6, 0.25) || isBtnPressed(pad, 4) || isBtnPressed(pad, 2);
  out.warpHeld = switchDown;
  out.switchPressed = switchDown && !edges.prevSwitch;
  edges.prevSwitch = switchDown;

  // Skill / Mega Fusion: Y/Triangle (3)
  const skillDown = isBtnPressed(pad, 3);
  out.skillPressed = skillDown && !edges.prevSkill;
  edges.prevSkill = skillDown;

  // Reload: B/Circle (1)
  const reloadDown = isBtnPressed(pad, 1);
  out.reloadPressed = reloadDown && !edges.prevReload;
  edges.prevReload = reloadDown;

  // Pause: Start/Options (9) or Select/Back (8)
  const pauseDown = isBtnPressed(pad, 9);
  out.pausePressed = pauseDown && !edges.prevPause;
  edges.prevPause = pauseDown;

  return out;
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

    // Weight perpendicular offset higher so aligned row/column items are preferred
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
 * mastery tree, or modal. Press A to activate, B to go back/close, Start to play/resume.
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
        focusedEl.removeAttribute('data-gamepad-focused');
      }
      focusedEl = el;
      if (focusedEl) {
        focusedEl.setAttribute('data-gamepad-focused', 'true');
        focusedEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    };

    // Hide visual focus ring when user switches back to pointer or touch
    const handlePointer = () => clearFocus();
    window.addEventListener('pointerdown', handlePointer, { passive: true });

    let prevA = false;
    let prevB = false;
    let prevStart = false;
    let prevDir: Direction | null = null;
    let lastDirTriggerTime = 0;
    let repeatDelay = 260;
    let rafId = 0;

    // Seed initial button state so pressing A/B to open a screen doesn't immediately double-fire
    const seedPad = getPrimaryGamepad();
    if (seedPad) {
      prevA = isBtnPressed(seedPad, 0);
      prevB = isBtnPressed(seedPad, 1);
      prevStart = isBtnPressed(seedPad, 9);
    }

    const tick = (now: number) => {
      const pad = getPrimaryGamepad();
      if (pad) {
        let dir: Direction | null = null;
        const ax = pad.axes[0] ?? 0;
        const ay = pad.axes[1] ?? 0;

        if (isBtnPressed(pad, 12) || ay < -0.55) dir = 'up';
        else if (isBtnPressed(pad, 13) || ay > 0.55) dir = 'down';
        else if (isBtnPressed(pad, 14) || ax < -0.55) dir = 'left';
        else if (isBtnPressed(pad, 15) || ax > 0.55) dir = 'right';

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
        const aDown = isBtnPressed(pad, 0);
        if (aDown && !prevA) {
          const elements = getFocusableElements();
          if (!focusedEl || !document.contains(focusedEl) || !elements.includes(focusedEl)) {
            const preferred =
              elements.find((el) => el.id === 'btn-start-game') || elements[0] || null;
            setFocus(preferred);
            if (preferred) preferred.click();
          } else {
            focusedEl.click();
          }
        }
        prevA = aDown;

        // B / Circle: Close / Back
        const bDown = isBtnPressed(pad, 1);
        if (bDown && !prevB) {
          const elements = getFocusableElements();
          const backBtn = elements.find((el) => el.getAttribute('data-gamepad-back') === 'true');
          if (backBtn) {
            backBtn.click();
          } else if (onBack) {
            onBack();
          }
        }
        prevB = bDown;

        // Start: Start Game or Resume Pause
        const startDown = isBtnPressed(pad, 9);
        if (startDown && !prevStart) {
          const elements = getFocusableElements();
          const resumeOrStart =
            elements.find((el) => el.getAttribute('data-gamepad-resume') === 'true') ||
            elements.find((el) => el.id === 'btn-start-game');
          if (resumeOrStart) {
            resumeOrStart.click();
          }
        }
        prevStart = startDown;
      }

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
