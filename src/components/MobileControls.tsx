import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JoystickInput } from '../types';
import { Flame, Zap, Crosshair, Sparkles, Snowflake, Crown, Biohazard, Wind, Skull } from 'lucide-react';

export interface MobileControlsProps {
  onLeftJoystick: (input: JoystickInput) => void;
  onRightJoystick: (input: JoystickInput) => void;
  isShip?: boolean;
  shipType?: 'TROPER' | 'DESTRUCTOR' | 'INTERCEPTOR' | 'NAVE_REI' | null;
  showWarp?: boolean;
  warpChargeProgress?: number; // 0 to 1
  warpActive?: boolean;
  warpRemainingRatio?: number; // 1 down to 0
  warpRemainingSeconds?: number;
  warpChargeDuration?: number; // 3.0 or 6.0
  onWarpStart?: () => void;
  onWarpEnd?: () => void;
  hasMasterySkill?: boolean;
  masteryCooldown?: number;
  masteryMaxCooldown?: number;
  masterySkillName?: string;
  onTriggerMasterySkill?: () => void;
  isIronMan?: boolean;
  ironManMode?: 'REPULSOR' | 'LASER';
  onToggleIronManMode?: () => void;
  isIceFireDragon?: boolean;
  iceFireActiveDragon?: 'FIRE' | 'ICE';
  iceFireMerged?: boolean;
  iceFireCooldown?: number;
  iceFireMergeRemaining?: number;
  onSwitchIceFireDragon?: () => void;
  onTriggerIceFireMerge?: () => void;
  isVenomFruit?: boolean;
  venomFruitHud?: {
    hydraCd: number;
    chloroCd: number;
    roadCd: number;
    demonCd: number;
    demonActive: boolean;
    demonTimer: number;
  };
  onTriggerVenomHydra?: () => void;
  onTriggerVenomChloro?: () => void;
  onTriggerVenomRoad?: () => void;
  onTriggerVenomDemon?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeftJoystick,
  onRightJoystick,
  isShip = false,
  shipType = null,
  showWarp = true,
  warpChargeProgress = 0,
  warpActive = false,
  warpRemainingRatio = 0,
  warpRemainingSeconds = 0,
  warpChargeDuration = 3.0,
  onWarpStart,
  onWarpEnd,
  hasMasterySkill = false,
  masteryCooldown = 0,
  masteryMaxCooldown = 8,
  masterySkillName = 'Skill',
  onTriggerMasterySkill,
  isIronMan = false,
  ironManMode = 'REPULSOR',
  onToggleIronManMode,
  isIceFireDragon = false,
  iceFireActiveDragon = 'FIRE',
  iceFireMerged = false,
  iceFireCooldown = 0,
  iceFireMergeRemaining = 0,
  onSwitchIceFireDragon,
  onTriggerIceFireMerge,
  isVenomFruit = false,
  venomFruitHud,
  onTriggerVenomHydra,
  onTriggerVenomChloro,
  onTriggerVenomRoad,
  onTriggerVenomDemon,
}) => {
  // === 1. LEFT DYNAMIC JOYSTICK (MOVEMENT) ===
  const [leftTouchActive, setLeftTouchActive] = useState(false);
  const [leftOrigin, setLeftOrigin] = useState({ x: 0, y: 0 });
  const [leftKnob, setLeftKnob] = useState({ x: 0, y: 0 });
  const leftTouchIdRef = useRef<number | null>(null);
  const leftOriginRef = useRef({ x: 0, y: 0 });
  const onLeftRef = useRef(onLeftJoystick);
  onLeftRef.current = onLeftJoystick;

  // === 2. RIGHT DYNAMIC JOYSTICK (AIM & FIRE) ===
  const [rightTouchActive, setRightTouchActive] = useState(false);
  const [rightOrigin, setRightOrigin] = useState({ x: 0, y: 0 });
  const [rightKnob, setRightKnob] = useState({ x: 0, y: 0 });
  const rightTouchIdRef = useRef<number | null>(null);
  const rightOriginRef = useRef({ x: 0, y: 0 });
  const onRightRef = useRef(onRightJoystick);
  onRightRef.current = onRightJoystick;

  // Maximum joystick throw radius (px)
  const MAX_RADIUS = 54;

  // Track if device has touch capability or mobile screen
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;
  });

  useEffect(() => {
    const handleTouch = () => setIsTouchDevice(true);
    window.addEventListener('touchstart', handleTouch, { passive: true });
    const handleResize = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Reset Left Joystick
  const resetLeft = useCallback(() => {
    leftTouchIdRef.current = null;
    setLeftTouchActive(false);
    setLeftKnob({ x: 0, y: 0 });
    onLeftRef.current({ x: 0, y: 0, active: false });
  }, []);

  // Reset Right Joystick
  const resetRight = useCallback(() => {
    rightTouchIdRef.current = null;
    setRightTouchActive(false);
    setRightKnob({ x: 0, y: 0 });
    onRightRef.current({ x: 0, y: 0, active: false });
  }, []);

  // Update Left position with smooth follow-finger origin
  const updateLeftCoords = useCallback((clientX: number, clientY: number) => {
    const origin = leftOriginRef.current;
    let dx = clientX - origin.x;
    let dy = clientY - origin.y;
    const dist = Math.hypot(dx, dy);

    let kx = dx;
    let ky = dy;

    // Follow-finger dynamic joystick: base slides smoothly if dragged past MAX_RADIUS
    if (dist > MAX_RADIUS) {
      const excess = dist - MAX_RADIUS;
      const nx = dx / dist;
      const ny = dy / dist;
      origin.x += nx * excess;
      origin.y += ny * excess;
      leftOriginRef.current = origin;
      setLeftOrigin({ x: origin.x, y: origin.y });
      kx = nx * MAX_RADIUS;
      ky = ny * MAX_RADIUS;
    }

    setLeftKnob({ x: kx, y: ky });
    onLeftRef.current({
      x: kx / MAX_RADIUS,
      y: ky / MAX_RADIUS,
      active: dist > 3,
    });
  }, [MAX_RADIUS]);

  // Update Right position with smooth follow-finger origin
  const updateRightCoords = useCallback((clientX: number, clientY: number) => {
    const origin = rightOriginRef.current;
    let dx = clientX - origin.x;
    let dy = clientY - origin.y;
    const dist = Math.hypot(dx, dy);

    let kx = dx;
    let ky = dy;

    if (dist > MAX_RADIUS) {
      const excess = dist - MAX_RADIUS;
      const nx = dx / dist;
      const ny = dy / dist;
      origin.x += nx * excess;
      origin.y += ny * excess;
      rightOriginRef.current = origin;
      setRightOrigin({ x: origin.x, y: origin.y });
      kx = nx * MAX_RADIUS;
      ky = ny * MAX_RADIUS;
    }

    setRightKnob({ x: kx, y: ky });
    onRightRef.current({
      x: kx / MAX_RADIUS,
      y: ky / MAX_RADIUS,
      active: dist > 5,
    });
  }, [MAX_RADIUS]);

  // Global window touch listeners so moving finger anywhere on screen maintains smooth tracking
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === leftTouchIdRef.current) {
          updateLeftCoords(touch.clientX, touch.clientY);
        } else if (touch.identifier === rightTouchIdRef.current) {
          updateRightCoords(touch.clientX, touch.clientY);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === leftTouchIdRef.current) {
          resetLeft();
        } else if (touch.identifier === rightTouchIdRef.current) {
          resetRight();
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [updateLeftCoords, updateRightCoords, resetLeft, resetRight]);

  // Handle Touch Start on Left Half (Movement)
  const handleLeftZoneTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (leftTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    leftTouchIdRef.current = touch.identifier;
    const origin = { x: touch.clientX, y: touch.clientY };
    leftOriginRef.current = origin;
    setLeftOrigin(origin);
    setLeftKnob({ x: 0, y: 0 });
    setLeftTouchActive(true);
    onLeftRef.current({ x: 0, y: 0, active: true });
  };

  // Handle Touch Start on Right Half (Aim & Fire)
  const handleRightZoneTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (rightTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    rightTouchIdRef.current = touch.identifier;
    const origin = { x: touch.clientX, y: touch.clientY };
    rightOriginRef.current = origin;
    setRightOrigin(origin);
    setRightKnob({ x: 0, y: 0 });
    setRightTouchActive(true);
    onRightRef.current({ x: 0, y: 0, active: true });
  };

  // === 3. WARP / MODO FÚRIA HOLDING MANAGEMENT ===
  const isPressingWarpRef = useRef(false);

  const startWarp = () => {
    if (isPressingWarpRef.current) return;
    isPressingWarpRef.current = true;
    if (onWarpStart) onWarpStart();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(18);
    }
  };

  const stopWarp = () => {
    if (!isPressingWarpRef.current) return;
    isPressingWarpRef.current = false;
    if (onWarpEnd) onWarpEnd();
  };

  const isRei = shipType === 'NAVE_REI';
  const isInterceptor = shipType === 'INTERCEPTOR';

  // Aim Angle calculation for laser pointer on right joystick
  const rightAimAngle = Math.atan2(rightKnob.y, rightKnob.x);
  const rightAimDist = Math.hypot(rightKnob.x, rightKnob.y);

  // SVG Progress Ring calculations for Warp Button
  // Radius: 32 -> Circumference = 2 * PI * 32 = ~201.06
  const RING_RADIUS = 32;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const strokeOffset = warpActive
    ? RING_CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, warpRemainingRatio)))
    : RING_CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, warpChargeProgress)));

  return (
    <div className="absolute inset-0 pointer-events-none select-none touch-none z-30 overflow-hidden font-sans">

      {/* ======================================================== */}
      {/* 1. DYNAMIC LEFT TOUCH ZONE (MOVEMENT)                     */}
      {/* ======================================================== */}
      <div
        className="absolute top-12 bottom-0 left-0 w-1/2 pointer-events-auto"
        onTouchStart={handleLeftZoneTouchStart}
        style={{ touchAction: 'none' }}
      >
        {/* Subtle resting guide anchor when idle (Mobile only) */}
        {!leftTouchActive && isTouchDevice && (
          <div className="absolute bottom-3 left-3 sm:bottom-8 sm:left-8 flex flex-col items-center pointer-events-none opacity-45 transition-opacity">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-cyan-400/40 flex items-center justify-center bg-slate-950/50 relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-300" />
              </div>
              <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-dashed border-cyan-400/20" />
            </div>
            <span className="text-[7.5px] sm:text-[8px] font-mono font-bold tracking-widest text-cyan-300/75 uppercase mt-1">
              Mover
            </span>
          </div>
        )}

        {/* Dynamic Spawned Left Joystick Base */}
        {leftTouchActive && (
          <div
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 z-40 transition-transform duration-75"
            style={{
              left: `${leftOrigin.x}px`,
              top: `${leftOrigin.y}px`,
            }}
          >
            {/* Outer Base Ring */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/85 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center relative">
              {/* Radial crosshairs */}
              <div className="absolute inset-3.5 sm:inset-4 rounded-full border border-cyan-400/30" />
              <div className="absolute top-1 bottom-1 w-0.5 bg-cyan-400/20" />
              <div className="absolute left-1 right-1 h-0.5 bg-cyan-400/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/60" />

              {/* Vector trail from center to knob */}
              {Math.hypot(leftKnob.x, leftKnob.y) > 6 && (
                <div
                  className="absolute left-1/2 top-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left opacity-75"
                  style={{
                    width: `${Math.hypot(leftKnob.x, leftKnob.y)}px`,
                    transform: `rotate(${Math.atan2(leftKnob.y, leftKnob.x)}rad)`,
                  }}
                />
              )}

              {/* Movable Knob */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-500 border-2 border-white flex items-center justify-center absolute"
                style={{
                  transform: `translate3d(${leftKnob.x}px, ${leftKnob.y}px, 0)`,
                  willChange: 'transform',
                }}
              >
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/90" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DYNAMIC RIGHT TOUCH ZONE (AIM & SHOOT)                 */}
      {/* ======================================================== */}
      <div
        className="absolute top-12 bottom-0 right-0 w-1/2 pointer-events-auto"
        onTouchStart={handleRightZoneTouchStart}
        style={{ touchAction: 'none' }}
      >
        {/* Subtle resting guide anchor when idle (Mobile only) */}
        {!rightTouchActive && isTouchDevice && (
          <div className="absolute bottom-3 right-3 sm:bottom-8 sm:right-8 flex flex-col items-center pointer-events-none opacity-45 transition-opacity">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-rose-400/40 flex items-center justify-center bg-slate-950/50 relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center animate-pulse">
                <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300" />
              </div>
              <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-dashed border-rose-400/20" />
            </div>
            <span className="text-[7.5px] sm:text-[8px] font-mono font-bold tracking-widest text-rose-300/75 uppercase mt-1">
              Mirar
            </span>
          </div>
        )}

        {/* Dynamic Spawned Right Joystick Base */}
        {rightTouchActive && (
          <div
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 z-40 transition-transform duration-75"
            style={{
              left: `${rightOrigin.x}px`,
              top: `${rightOrigin.y}px`,
            }}
          >
            {/* Outer Base Ring */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/85 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center relative">
              {/* Aiming Reticle Circle */}
              <div className="absolute inset-3.5 sm:inset-4 rounded-full border border-rose-400/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />

              {/* Aiming Laser Line Indicator extending toward target */}
              {rightAimDist > 8 && (
                <div
                  className="absolute left-1/2 top-1/2 h-0.5 bg-gradient-to-r from-rose-400 via-rose-300 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.9)] origin-left"
                  style={{
                    width: '105px',
                    transform: `rotate(${rightAimAngle}rad)`,
                  }}
                >
                  {/* Glowing crosshair tip */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-200 shadow-[0_0_8px_#fda4af]" />
                </div>
              )}

              {/* Movable Knob */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-pink-500 border-2 border-white flex items-center justify-center absolute"
                style={{
                  transform: `translate3d(${rightKnob.x}px, ${rightKnob.y}px, 0)`,
                  willChange: 'transform',
                }}
              >
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/90" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. TACTICAL WARP / MODO FÚRIA + MASTERY SKILL BUTTONS    */}
      {/* ======================================================== */}
      {isShip && (
        <div className="absolute bottom-20 right-3 sm:bottom-28 sm:right-8 flex items-end gap-2 sm:gap-3 pointer-events-auto z-50">
          {/* Mastery Active Skill Button (Unlocked via Ship Skill Tree) */}
          {hasMasterySkill && onTriggerMasterySkill && (
            <div className="flex flex-col items-center gap-1">
              <button
                id="mobile-mastery-skill-button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (masteryCooldown <= 0) {
                    onTriggerMasterySkill();
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(24);
                    }
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (masteryCooldown <= 0) onTriggerMasterySkill();
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all select-none touch-none ${
                  masteryCooldown <= 0
                    ? isRei
                      ? 'bg-red-950/95 border-red-400 text-red-100 active:scale-95 cursor-pointer'
                      : isInterceptor
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 active:scale-95 cursor-pointer'
                      : 'bg-cyan-950/95 border-cyan-400 text-cyan-100 active:scale-95 cursor-pointer'
                    : 'bg-slate-950/85 border-white/15 text-slate-500 cursor-not-allowed'
                }`}
                title={masterySkillName}
              >
                {masteryCooldown > 0 ? (
                  <span className="text-[11px] font-mono font-black text-slate-300">
                    {masteryCooldown.toFixed(1)}s
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider mt-0.5">
                      SKILL
                    </span>
                  </>
                )}
              </button>
              <span className="text-[7.5px] font-mono uppercase tracking-wider text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/10">
                {masteryCooldown > 0
                  ? `${Math.round((1 - masteryCooldown / Math.max(1, masteryMaxCooldown)) * 100)}%`
                  : 'PRONTA'}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-1.5">
          
          {showWarp && (
          <>
          <button
            id="mobile-warp-button"
            onTouchStart={(e) => {
              e.stopPropagation();
              startWarp();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              stopWarp();
            }}
            onTouchCancel={(e) => {
              e.stopPropagation();
              stopWarp();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startWarp();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              stopWarp();
            }}
            onMouseLeave={() => {
              if (isPressingWarpRef.current) stopWarp();
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-150 select-none touch-none ${
              warpActive
                ? isRei
                  ? 'scale-105 animate-pulse'
                  : 'scale-105 animate-pulse'
                : warpChargeProgress > 0.05
                  ? 'scale-105'
                  : 'hover:scale-102 active:scale-95'
            }`}
            title={
              isRei
                ? 'Segure 6s para ativar o Modo Fúria'
                : 'Segure 3s para ativar o Modo Warp'
            }
          >
            {/* SVG Circular Charge & Duration Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 80 80"
            >
              {/* Background Track Ring */}
              <circle
                cx="40"
                cy="40"
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="4"
              />

              {/* Progress Stroke Ring */}
              {(warpActive || warpChargeProgress > 0.02) && (
                <circle
                  cx="40"
                  cy="40"
                  r={RING_RADIUS}
                  fill="none"
                  stroke={
                    warpActive
                      ? isRei
                        ? '#ef4444'
                        : isInterceptor
                        ? '#e879f9'
                        : '#22d3ee'
                      : isRei
                      ? '#f59e0b'
                      : '#38bdf8'
                  }
                  strokeWidth="5"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              )}
            </svg>

            {/* Inner Tactile Button Body */}
            <div
              className={`w-[54px] h-[54px] sm:w-[66px] sm:h-[66px] rounded-full flex flex-col items-center justify-center border-2 transition-colors relative overflow-hidden ${
                warpActive
                  ? isRei
                    ? 'bg-gradient-to-tr from-red-950 via-red-900 to-amber-950 border-red-400 text-white shadow-inner'
                    : isInterceptor
                    ? 'bg-gradient-to-tr from-purple-950 via-fuchsia-950 to-indigo-950 border-fuchsia-300 text-white shadow-inner'
                    : 'bg-gradient-to-tr from-cyan-950 via-sky-950 to-blue-950 border-cyan-300 text-white shadow-inner'
                  : warpChargeProgress > 0.05
                    ? isRei
                      ? 'bg-gradient-to-tr from-red-950/90 to-amber-900/90 border-amber-400 text-amber-200'
                      : 'bg-gradient-to-tr from-slate-950/95 to-cyan-950/95 border-cyan-400 text-cyan-200'
                    : isRei
                      ? 'bg-slate-950/85 border-red-500/50 hover:border-red-400 text-red-200'
                      : isInterceptor
                      ? 'bg-slate-950/85 border-fuchsia-500/50 hover:border-fuchsia-400 text-fuchsia-200'
                      : 'bg-slate-950/85 border-cyan-500/50 hover:border-cyan-400 text-cyan-200'
              }`}
            >
              {/* Dynamic Icon & Content */}
              {warpActive ? (
                <>
                  {isRei ? (
                    <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                  ) : (
                    <Zap className="w-5 h-5 text-white animate-bounce" />
                  )}
                  <span className="text-[9px] font-black font-mono tracking-tight text-white mt-0.5">
                    {warpRemainingSeconds > 0
                      ? `${warpRemainingSeconds.toFixed(1)}s`
                      : `${Math.round(warpRemainingRatio * (isRei ? 10 : 8))}s`}
                  </span>
                </>
              ) : warpChargeProgress > 0.05 ? (
                <>
                  {isRei ? (
                    <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                  ) : (
                    <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
                  )}
                  <span className="text-[9px] font-black font-mono tracking-tight text-amber-300 mt-0.5">
                    {Math.round(warpChargeProgress * 100)}%
                  </span>
                </>
              ) : (
                <>
                  {isRei ? (
                    <Flame className="w-5 h-5 text-red-400" />
                  ) : (
                    <Zap className="w-5 h-5 text-cyan-400" />
                  )}
                  <span className="text-[8px] font-black uppercase tracking-wider font-mono mt-0.5">
                    {isRei ? 'FÚRIA' : 'WARP'}
                  </span>
                  <span className="text-[7px] font-mono text-slate-400 leading-none">
                    {warpChargeDuration}s
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Micro status badge below the button */}
          <div
            className={`px-2 py-0.5 rounded-full text-[7px] sm:text-[7.5px] font-mono font-bold tracking-wider uppercase border shadow-md ${
              warpActive
                ? isRei
                  ? 'bg-red-950/90 border-red-500/60 text-red-200 animate-pulse'
                  : 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 animate-pulse'
                : warpChargeProgress > 0.05
                  ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
                  : 'bg-slate-950/80 border-white/10 text-slate-400'
            }`}
          >
            {warpActive
              ? isRei
                ? '⚡ FÚRIA ATIVA'
                : '⚡ WARP ATIVO'
              : warpChargeProgress > 0.05
                ? 'SEGURE...'
                : isRei
                  ? 'SEGURE 6s'
                  : 'SEGURE 3s'}
          </div>
          </>
          )}
          </div>

        </div>
      )}

      {/* Iron Man Mode Toggle Button (Repulsor <-> Laser) */}
      {isIronMan && onToggleIronManMode && (
        <div className="absolute bottom-20 right-3 sm:bottom-28 sm:right-8 flex flex-col items-center gap-1 pointer-events-auto z-50">
          <button
            id="mobile-ironman-mode-button"
            onTouchStart={(e) => {
              e.stopPropagation();
              onToggleIronManMode();
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(20);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleIronManMode();
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-none shadow-lg cursor-pointer ${
              ironManMode === 'LASER'
                ? 'bg-gradient-to-tr from-red-950 via-red-900 to-amber-950 border-amber-400 text-amber-100'
                : 'bg-gradient-to-tr from-sky-950 via-cyan-950 to-slate-950 border-cyan-400 text-cyan-100'
            }`}
            title="Alternar Modo Repulsor / Laser"
          >
            {ironManMode === 'LASER' ? (
              <>
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                <span className="text-[8px] sm:text-[8.5px] font-mono font-black uppercase tracking-wider mt-0.5 text-white">
                  LASER
                </span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
                <span className="text-[8px] sm:text-[8.5px] font-mono font-black uppercase tracking-wider mt-0.5 text-white">
                  REPULSOR
                </span>
              </>
            )}
          </button>
          <span className="px-2 py-0.5 rounded-full text-[7px] sm:text-[7.5px] font-mono font-bold tracking-wider uppercase border border-white/15 bg-slate-950/90 text-slate-300">
            TROCAR MODO
          </span>
        </div>
      )}

      {/* Ice & Fire Dragon Tactical Buttons (Switch Fire/Ice + Mega Purple Fusion) */}
      {isIceFireDragon && (
        <div className="absolute bottom-20 right-3 sm:bottom-28 sm:right-8 flex items-end gap-2 sm:gap-3 pointer-events-auto z-50">
          {/* Switch Dragon Button (Fire <-> Ice) */}
          {!iceFireMerged && onSwitchIceFireDragon && (
            <div className="flex flex-col items-center gap-1">
              <button
                id="mobile-icefire-switch-button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onSwitchIceFireDragon();
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSwitchIceFireDragon();
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-none shadow-lg cursor-pointer ${
                  iceFireActiveDragon === 'FIRE'
                    ? 'bg-gradient-to-tr from-red-950 via-orange-950 to-amber-950 border-orange-400 text-amber-100'
                    : 'bg-gradient-to-tr from-sky-950 via-cyan-950 to-slate-950 border-sky-400 text-sky-100'
                }`}
                title="Trocar Dragão Atacante (Fogo / Gelo)"
              >
                {iceFireActiveDragon === 'FIRE' ? (
                  <>
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" />
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black uppercase tracking-wider mt-0.5 text-white">
                      FOGO
                    </span>
                  </>
                ) : (
                  <>
                    <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black uppercase tracking-wider mt-0.5 text-white">
                      GELO
                    </span>
                  </>
                )}
              </button>
              <span className="px-2 py-0.5 rounded-full text-[7px] font-mono font-bold tracking-wider uppercase border border-white/15 bg-slate-950/90 text-slate-300">
                TROCAR
              </span>
            </div>
          )}

          {/* Mega Purple Dragon Fusion Button */}
          {onTriggerIceFireMerge && (
            <div className="flex flex-col items-center gap-1">
              <button
                id="mobile-icefire-merge-button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (!iceFireMerged && iceFireCooldown <= 0) {
                    onTriggerIceFireMerge();
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(35);
                    }
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!iceFireMerged && iceFireCooldown <= 0) {
                    onTriggerIceFireMerge();
                  }
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-none shadow-lg ${
                  iceFireMerged
                    ? 'bg-gradient-to-tr from-purple-950 via-fuchsia-900 to-purple-900 border-fuchsia-300 text-fuchsia-100 animate-pulse cursor-default'
                    : iceFireCooldown <= 0
                      ? 'bg-gradient-to-tr from-purple-950 via-violet-900 to-slate-950 border-purple-400 text-purple-100 cursor-pointer'
                      : 'bg-slate-950/85 border-white/15 text-slate-400 cursor-default'
                }`}
                title="Fundir Fogo + Gelo no Mega Dragão Roxo"
              >
                {iceFireMerged ? (
                  <>
                    <Crown className="w-6 h-6 text-fuchsia-300" />
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider mt-0.5 text-white">
                      {iceFireMergeRemaining.toFixed(1)}s
                    </span>
                  </>
                ) : iceFireCooldown <= 0 ? (
                  <>
                    <Sparkles className="w-6 h-6 text-fuchsia-300" />
                    <span className="text-[8.5px] font-mono font-black uppercase tracking-wider mt-0.5 text-white">
                      FUNDIR
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-500" />
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider mt-0.5 text-slate-300">
                      {iceFireCooldown.toFixed(1)}s
                    </span>
                  </>
                )}
              </button>
              <span className="px-2 py-0.5 rounded-full text-[7px] font-mono font-bold tracking-wider uppercase border border-white/15 bg-slate-950/85 text-purple-200">
                MEGA ROXO
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fruta do Veneno (Doku Doku no Mi) 3 Skills + Venom Demon Transform */}
      {isVenomFruit && venomFruitHud && (
        <div className="absolute bottom-16 right-2 sm:bottom-24 sm:right-6 grid grid-cols-2 gap-1.5 sm:gap-2 pointer-events-auto z-50">
          {/* Skill 1: Hidra */}
          <button
            id="mobile-venom-hydra"
            onTouchStart={(e) => {
              e.stopPropagation();
              if (venomFruitHud.hydraCd <= 0 && onTriggerVenomHydra) {
                onTriggerVenomHydra();
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (venomFruitHud.hydraCd <= 0 && onTriggerVenomHydra) onTriggerVenomHydra();
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-none shadow-lg ${
              venomFruitHud.hydraCd <= 0
                ? 'bg-gradient-to-tr from-purple-950 via-violet-900 to-fuchsia-950 border-purple-400 text-purple-100 cursor-pointer'
                : 'bg-slate-950/85 border-white/15 text-slate-400'
            }`}
          >
            <Biohazard className="w-4 h-4 text-purple-300" />
            <span className="text-[7px] font-mono font-black uppercase mt-0.5">
              {venomFruitHud.hydraCd <= 0 ? 'HIDRA' : `${venomFruitHud.hydraCd.toFixed(1)}s`}
            </span>
          </button>

          {/* Skill 2: Bola de Cloro */}
          <button
            id="mobile-venom-chloro"
            onTouchStart={(e) => {
              e.stopPropagation();
              if (venomFruitHud.chloroCd <= 0 && onTriggerVenomChloro) {
                onTriggerVenomChloro();
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (venomFruitHud.chloroCd <= 0 && onTriggerVenomChloro) onTriggerVenomChloro();
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-none shadow-lg ${
              venomFruitHud.chloroCd <= 0
                ? 'bg-gradient-to-tr from-lime-950 via-emerald-950 to-purple-950 border-lime-400 text-lime-100 cursor-pointer'
                : 'bg-slate-950/85 border-white/15 text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4 text-lime-300" />
            <span className="text-[7px] font-mono font-black uppercase mt-0.5">
              {venomFruitHud.chloroCd <= 0 ? 'CLORO' : `${venomFruitHud.chloroCd.toFixed(1)}s`}
            </span>
          </button>

          {/* Skill 3: Estrada Venenosa */}
          <button
            id="mobile-venom-road"
            onTouchStart={(e) => {
              e.stopPropagation();
              if (venomFruitHud.roadCd <= 0 && onTriggerVenomRoad) {
                onTriggerVenomRoad();
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (venomFruitHud.roadCd <= 0 && onTriggerVenomRoad) onTriggerVenomRoad();
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-none shadow-lg ${
              venomFruitHud.roadCd <= 0
                ? 'bg-gradient-to-tr from-fuchsia-950 via-purple-900 to-slate-950 border-fuchsia-400 text-fuchsia-100 cursor-pointer'
                : 'bg-slate-950/85 border-white/15 text-slate-400'
            }`}
          >
            <Wind className="w-4 h-4 text-fuchsia-300" />
            <span className="text-[6.5px] font-mono font-black uppercase mt-0.5">
              {venomFruitHud.roadCd <= 0 ? 'ESTRADA' : `${venomFruitHud.roadCd.toFixed(1)}s`}
            </span>
          </button>

          {/* Transformation: Demônio do Veneno */}
          <button
            id="mobile-venom-demon"
            onTouchStart={(e) => {
              e.stopPropagation();
              if (!venomFruitHud.demonActive && venomFruitHud.demonCd <= 0 && onTriggerVenomDemon) {
                onTriggerVenomDemon();
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!venomFruitHud.demonActive && venomFruitHud.demonCd <= 0 && onTriggerVenomDemon) {
                onTriggerVenomDemon();
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-95 select-none touch-none shadow-lg ${
              venomFruitHud.demonActive
                ? 'bg-gradient-to-tr from-rose-950 via-red-900 to-fuchsia-950 border-rose-300 text-rose-100 animate-pulse'
                : venomFruitHud.demonCd <= 0
                  ? 'bg-gradient-to-tr from-rose-950 via-purple-950 to-slate-950 border-rose-400 text-rose-100 cursor-pointer'
                  : 'bg-slate-950/85 border-white/15 text-slate-400'
            }`}
          >
            <Skull className="w-4 h-4 text-rose-300" />
            <span className="text-[6.5px] font-mono font-black uppercase mt-0.5">
              {venomFruitHud.demonActive
                ? `${venomFruitHud.demonTimer.toFixed(1)}s`
                : venomFruitHud.demonCd <= 0
                  ? 'DEMÔNIO'
                  : `${venomFruitHud.demonCd.toFixed(1)}s`}
            </span>
          </button>
        </div>
      )}

      {/* Helper legend for desktop mode when idle */}
      {!isTouchDevice && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 opacity-30 max-w-[260px] text-center pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest text-slate-400">MODO PC ATIVO</span>
          <span className="text-[9px] text-slate-500">Mover: WASD | Mirar: Mouse | Disparar: Clique | Warp/Fúria: Shift</span>
        </div>
      )}

    </div>
  );
};
