import React, { useEffect, useRef } from 'react';

/**
 * Renders the clean, standard tactical operator body (Vanguarda-01).
 */
export function renderOperatorBody(
  ctx: CanvasRenderingContext2D,
  _skinId: string,
  radius: number,
  _time: number,
  _isMoving: boolean,
  deathProgress: number = 0
) {
  ctx.save();

  // If dying, apply ragdoll collapse flattening and rotation
  if (deathProgress > 0) {
    const collapseScale = 1 - deathProgress * 0.25;
    ctx.scale(collapseScale, collapseScale * (1 - deathProgress * 0.15));
  }

  // === RECRUTA DE CHOQUE (VANGUARDA-01) ===
  // Elite tactical assault soldier with modern high-cut ballistic helmet, NVG mount,
  // tactical polarized cyan HUD visor, and MOLLE chest armor.

  // Base High-Spec Ballistic Armor (darkens if dying)
  const grad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
  if (deathProgress > 0) {
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.4, '#1e293b');
    grad.addColorStop(0.85, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else {
    grad.addColorStop(0, '#60a5fa');
    grad.addColorStop(0.4, '#2563eb');
    grad.addColorStop(0.85, '#1e3a8a');
    grad.addColorStop(1, '#0f172a');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Tactical Ballistic Helmet Rim & NVG Shroud Mount (Forehead)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = deathProgress > 0 ? '#334155' : '#1e3a8a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(radius * 0.3, -radius * 0.3, 4, radius * 0.6, 1);
  ctx.fill();
  ctx.stroke();

  // Tactical Kevlar Vest Straps & MOLLE Webbing
  ctx.strokeStyle = deathProgress > 0 ? '#1e293b' : '#1d4ed8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.6, -radius * 0.4);
  ctx.lineTo(radius * 0.2, -radius * 0.4);
  ctx.moveTo(-radius * 0.6, radius * 0.4);
  ctx.lineTo(radius * 0.2, radius * 0.4);
  ctx.stroke();

  // Forward Tactical Visor (Flickering, cracking, and dying when deathProgress > 0)
  ctx.save();
  if (deathProgress > 0) {
    // Visor power failure animation: flickering cyan -> orange -> dull red -> dead black
    const flicker = Math.sin(deathProgress * 25) > 0;
    if (deathProgress < 0.35 && flicker) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8 * (1 - deathProgress);
      ctx.fillStyle = '#38bdf8';
    } else if (deathProgress < 0.65) {
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 6 * (1 - deathProgress);
      ctx.fillStyle = '#ea580c';
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e293b'; // completely dead offline visor
    }
  } else {
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#38bdf8';
  }

  ctx.beginPath();
  ctx.moveTo(radius * 0.82, 0);
  ctx.lineTo(radius * 0.28, -radius * 0.35);
  ctx.lineTo(radius * 0.42, 0);
  ctx.lineTo(radius * 0.28, radius * 0.35);
  ctx.closePath();
  ctx.fill();

  // Inner White HUD reticle slit (only if alive)
  if (deathProgress < 0.5) {
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - deathProgress * 2})`;
    ctx.beginPath();
    ctx.moveTo(radius * 0.78, 0);
    ctx.lineTo(radius * 0.38, -radius * 0.15);
    ctx.lineTo(radius * 0.48, 0);
    ctx.lineTo(radius * 0.38, radius * 0.15);
    ctx.closePath();
    ctx.fill();
  }

  // Shattered Visor Glass Spiderweb Cracks when dying
  if (deathProgress > 0.2) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.85, (deathProgress - 0.2) * 1.5)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(radius * 0.4, -radius * 0.1);
    ctx.lineTo(radius * 0.65, 0);
    ctx.lineTo(radius * 0.5, radius * 0.2);
    ctx.moveTo(radius * 0.65, 0);
    ctx.lineTo(radius * 0.75, -radius * 0.15);
    ctx.stroke();
  }
  ctx.restore();

  // Tactical Shoulder Pauldrons
  ctx.fillStyle = deathProgress > 0 ? '#1e293b' : '#1e40af';
  ctx.beginPath();
  ctx.arc(-radius * 0.25, -radius * 0.8, 3, 0, Math.PI * 2);
  ctx.arc(-radius * 0.25, radius * 0.8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Outer Crisp Tactical Rim
  ctx.strokeStyle = deathProgress > 0 ? '#475569' : '#3b82f6';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Blood spatter on armor if dying
  if (deathProgress > 0.15) {
    ctx.fillStyle = 'rgba(153, 27, 27, 0.75)';
    ctx.beginPath();
    ctx.arc(-radius * 0.1, -radius * 0.2, 3, 0, Math.PI * 2);
    ctx.arc(radius * 0.1, radius * 0.15, 2.5, 0, Math.PI * 2);
    ctx.arc(-radius * 0.3, radius * 0.1, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export const OperatorAvatarPreview: React.FC<{ skinId?: string; size?: number }> = ({ skinId = 'skin_default', size = 56 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = (time: number) => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      renderOperatorBody(ctx, skinId, size * 0.32, time, true);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skinId, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="shrink-0 block" />;
};
