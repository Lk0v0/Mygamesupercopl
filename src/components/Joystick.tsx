import React, { useState, useRef, useEffect } from 'react';
import { JoystickInput } from '../types';

interface JoystickProps {
  label: string;
  onChange: (input: JoystickInput) => void;
  isTargeting?: boolean; // If true, apply Rose theme; if false, apply Slate theme
}

export const Joystick: React.FC<JoystickProps> = ({
  label,
  onChange,
  isTargeting = false,
}) => {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  // Max distance in pixels the knob can move from center
  const MAX_RADIUS = 55;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed:", err);
    }

    pointerIdRef.current = e.pointerId;
    setIsDragging(true);
    updateKnobPosFromCoords(e.clientX, e.clientY);
  };

  const resetJoystick = () => {
    setIsDragging(false);
    pointerIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onChange({ x: 0, y: 0, active: false });
  };

  const updateKnobPosFromCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Dynamic Max Radius based on the container size for perfect responsiveness!
    const maxRadius = rect.width / 2.5;

    let targetX = dx;
    let targetY = dy;

    if (distance > maxRadius) {
      targetX = (dx / distance) * maxRadius;
      targetY = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: targetX, y: targetY });

    const normX = targetX / maxRadius;
    const normY = targetY / maxRadius;

    onChange({
      x: normX,
      y: normY,
      active: true,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      updateKnobPosFromCoords(e.clientX, e.clientY);
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      resetJoystick();
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp, { passive: true });
    window.addEventListener('pointercancel', handleWindowPointerUp, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [isDragging]);

  useEffect(() => {
    return () => {
      onChange({ x: 0, y: 0, active: false });
    };
  }, [onChange]);

  // Style selectors matching the "Sleek Interface" design spec with mobile scaling
  const outerStyle = isTargeting
    ? `w-28 h-28 md:w-36 md:h-36 rounded-full bg-rose-950/60 border-4 border-rose-500/35 flex items-center justify-center relative shadow-2xl transition-all duration-300 ${
        isDragging ? 'shadow-[0_0_35px_rgba(244,63,94,0.3)] border-rose-400/50' : ''
      }`
    : `w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-900/75 border-4 border-white/15 flex items-center justify-center relative shadow-2xl transition-all duration-300 ${
        isDragging ? 'shadow-[0_0_35px_rgba(255,255,255,0.1)] border-white/20' : ''
      }`;

  const knobStyle = isTargeting
    ? 'w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-rose-600 to-rose-500 rounded-full shadow-2xl border-2 border-white/40 flex items-center justify-center transition-transform duration-75 ease-out'
    : 'w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-slate-700 to-slate-500 rounded-full shadow-2xl border-2 border-white/20 flex items-center justify-center transition-transform duration-75 ease-out';

  const innerKnobStyle = isTargeting
    ? 'w-4 h-4 md:w-6 md:h-6 rounded-full bg-white/20 blur-[0.5px]'
    : 'w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-900/30';

  const labelStyle = isTargeting
    ? 'absolute -top-6 md:-top-7 text-[9px] md:text-[10px] font-bold text-rose-400 uppercase tracking-widest'
    : 'absolute -top-6 md:-top-7 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest';

  return (
    <div className="flex flex-col items-center select-none touch-none relative pt-6">
      {/* Joystick label (positioned as absolute top to match Sleek design mockup exactly) */}
      <span className={labelStyle}>
        {label}
      </span>

      <div
        id={`joystick-${label.toLowerCase()}`}
        ref={containerRef}
        className={outerStyle}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
      >
        {/* Subtle grid accent inside the track */}
        <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
        {isTargeting && (
          <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-t from-rose-500/5 to-transparent pointer-events-none" />
        )}

        {/* Draggable Knob */}
        <div
          className={knobStyle}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          {/* Inner core accent */}
          <div className={innerKnobStyle} />
        </div>
      </div>
    </div>
  );
};

