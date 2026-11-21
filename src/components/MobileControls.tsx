import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JoystickInput } from '../types';
import { Crosshair } from 'lucide-react';

export interface MobileControlsProps {
  onLeftJoystick: (input: JoystickInput) => void;
  onRightJoystick: (input: JoystickInput) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeftJoystick,
  onRightJoystick,
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

  // Aim Angle calculation for laser pointer on right joystick
  const rightAimAngle = Math.atan2(rightKnob.y, rightKnob.x);
  const rightAimDist = Math.hypot(rightKnob.x, rightKnob.y);

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

      {/* Helper legend for desktop mode when idle */}
      {!isTouchDevice && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 opacity-30 max-w-[340px] text-center pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest text-slate-400">MODO PC ATIVO</span>
          <span className="text-[9px] text-slate-500">Mover: WASD | Mirar e Atirar: Mouse | Trocar Arma: 1-3 | Pausar: P/ESC</span>
        </div>
      )}

    </div>
  );
};
