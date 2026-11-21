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
  const [leftTouchActive, setLeftTouchActive] = useState(false);
  const [leftOrigin, setLeftOrigin] = useState({ x: 0, y: 0 });
  const [leftKnob, setLeftKnob] = useState({ x: 0, y: 0 });
  const leftTouchIdRef = useRef<number | null>(null);
  const leftOriginRef = useRef({ x: 0, y: 0 });
  const onLeftRef = useRef(onLeftJoystick);
  onLeftRef.current = onLeftJoystick;

  const [rightTouchActive, setRightTouchActive] = useState(false);
  const [rightOrigin, setRightOrigin] = useState({ x: 0, y: 0 });
  const [rightKnob, setRightKnob] = useState({ x: 0, y: 0 });
  const rightTouchIdRef = useRef<number | null>(null);
  const rightOriginRef = useRef({ x: 0, y: 0 });
  const onRightRef = useRef(onRightJoystick);
  onRightRef.current = onRightJoystick;

  const MAX_RADIUS = 54;

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

  const resetLeft = useCallback(() => {
    leftTouchIdRef.current = null;
    setLeftTouchActive(false);
    setLeftKnob({ x: 0, y: 0 });
    onLeftRef.current({ x: 0, y: 0, active: false });
  }, []);

  const resetRight = useCallback(() => {
    rightTouchIdRef.current = null;
    setRightTouchActive(false);
    setRightKnob({ x: 0, y: 0 });
    onRightRef.current({ x: 0, y: 0, active: false });
  }, []);

  const updateLeftCoords = useCallback((clientX: number, clientY: number) => {
    const origin = leftOriginRef.current;
    const dx = clientX - origin.x;
    const dy = clientY - origin.y;
    const dist = Math.hypot(dx, dy);

    let kx = dx;
    let ky = dy;

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

  const updateRightCoords = useCallback((clientX: number, clientY: number) => {
    const origin = rightOriginRef.current;
    const dx = clientX - origin.x;
    const dy = clientY - origin.y;
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

  const rightAimAngle = Math.atan2(rightKnob.y, rightKnob.x);
  const rightAimDist = Math.hypot(rightKnob.x, rightKnob.y);

  return (
    <div className="absolute inset-0 pointer-events-none select-none touch-none z-30 overflow-hidden">
      {/* LEFT DYNAMIC TOUCH ZONE (MOVEMENT) */}
      <div
        className="absolute top-14 landscape:top-12 bottom-0 left-0 w-1/2 pointer-events-auto"
        onTouchStart={handleLeftZoneTouchStart}
        style={{ touchAction: 'none' }}
      >
        {/* Resting guide sits clear of portrait bottom weapon dock (bottom-24) and tucks to corner in landscape */}
        {!leftTouchActive && isTouchDevice && (
          <div className="absolute bottom-24 left-4 landscape:bottom-6 landscape:left-6 sm:bottom-8 sm:left-8 flex flex-col items-center pointer-events-none opacity-45 transition-opacity">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border border-cyan-400/45 flex items-center justify-center bg-[#060d14]/55 relative">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-500/20 border border-cyan-400/55 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-300" />
              </div>
              <div className="absolute inset-1.5 rounded-full border border-dashed border-cyan-400/20" />
            </div>
            <span className="text-[8px] font-mono font-bold tracking-widest text-cyan-300/80 uppercase mt-1">
              Mover
            </span>
          </div>
        )}

        {leftTouchActive && (
          <div
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 z-40"
            style={{
              left: `${leftOrigin.x}px`,
              top: `${leftOrigin.y}px`,
            }}
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#060d14]/85 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.45)] flex items-center justify-center relative">
              <div className="absolute inset-3.5 sm:inset-4 rounded-full border border-cyan-400/30" />
              <div className="absolute top-1 bottom-1 w-0.5 bg-cyan-400/20" />
              <div className="absolute left-1 right-1 h-0.5 bg-cyan-400/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/60" />

              {Math.hypot(leftKnob.x, leftKnob.y) > 6 && (
                <div
                  className="absolute left-1/2 top-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left opacity-80"
                  style={{
                    width: `${Math.hypot(leftKnob.x, leftKnob.y)}px`,
                    transform: `rotate(${Math.atan2(leftKnob.y, leftKnob.x)}rad)`,
                  }}
                />
              )}

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

      {/* RIGHT DYNAMIC TOUCH ZONE (AIM & SHOOT) */}
      <div
        className="absolute top-14 landscape:top-12 bottom-0 right-0 w-1/2 pointer-events-auto"
        onTouchStart={handleRightZoneTouchStart}
        style={{ touchAction: 'none' }}
      >
        {!rightTouchActive && isTouchDevice && (
          <div className="absolute bottom-24 right-4 landscape:bottom-6 landscape:right-6 sm:bottom-8 sm:right-8 flex flex-col items-center pointer-events-none opacity-45 transition-opacity">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border border-rose-400/45 flex items-center justify-center bg-[#060d14]/55 relative">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500/20 border border-rose-400/55 flex items-center justify-center">
                <Crosshair className="w-3.5 h-3.5 text-rose-300" />
              </div>
              <div className="absolute inset-1.5 rounded-full border border-dashed border-rose-400/20" />
            </div>
            <span className="text-[8px] font-mono font-bold tracking-widest text-rose-300/80 uppercase mt-1">
              Mirar
            </span>
          </div>
        )}

        {rightTouchActive && (
          <div
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2 z-40"
            style={{
              left: `${rightOrigin.x}px`,
              top: `${rightOrigin.y}px`,
            }}
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#060d14]/85 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.45)] flex items-center justify-center relative">
              <div className="absolute inset-3.5 sm:inset-4 rounded-full border border-rose-400/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />

              {rightAimDist > 8 && (
                <div
                  className="absolute left-1/2 top-1/2 h-0.5 bg-gradient-to-r from-rose-400 via-rose-300 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.85)] origin-left"
                  style={{
                    width: '105px',
                    transform: `rotate(${rightAimAngle}rad)`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-200 shadow-[0_0_8px_#fda4af]" />
                </div>
              )}

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

      {/* Discreet Desktop Controls Hint in Bottom-Left Corner (Never overlaps centered Weapon Bar) */}
      {!isTouchDevice && (
        <div className="hidden xl:flex absolute bottom-3 left-5 items-center gap-2 text-[10px] font-mono text-slate-400/55 pointer-events-none">
          <span>WASD Mover</span>
          <span aria-hidden="true">·</span>
          <span>Mouse Mirar/Atirar</span>
          <span aria-hidden="true">·</span>
          <span>1–3 Armas</span>
          <span aria-hidden="true">·</span>
          <span>ESC Pausa</span>
        </div>
      )}
    </div>
  );
};
