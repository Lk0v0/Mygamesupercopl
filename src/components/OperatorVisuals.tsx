import React, { useEffect, useRef } from 'react';

/**
 * Renders the top-down tactical operator body tailored to the equipped skin,
 * complete with animated armor details and special visual effects (zero shadowBlur for 60fps).
 */
export function renderOperatorBody(
  ctx: CanvasRenderingContext2D,
  skinId: string,
  radius: number,
  time: number,
  isMoving: boolean,
  deathProgress: number = 0
) {
  ctx.save();

  // If dying, apply ragdoll collapse flattening
  if (deathProgress > 0) {
    const collapseScale = 1 - deathProgress * 0.25;
    ctx.scale(collapseScale, collapseScale * (1 - deathProgress * 0.15));
  }

  const dead = deathProgress > 0;
  const pulse = 0.75 + Math.sin(time * 0.008) * 0.25;
  const walkSway = isMoving && !dead ? Math.sin(time * 0.015) : 0;
  if (walkSway !== 0) {
    ctx.rotate(walkSway * 0.065);
  }

  // Color palette per skin
  let coreColor = '#60a5fa';
  let midColor = '#2563eb';
  let rimDark = '#1e3a8a';
  let outerStroke = '#3b82f6';
  let visorColor = '#38bdf8';
  let pauldronColor = '#1e40af';
  let strapColor = '#1d4ed8';

  switch (skinId) {
    case 'skin_ghost_recon':
      coreColor = '#334155';
      midColor = '#1e293b';
      rimDark = '#020617';
      outerStroke = '#f43f5e';
      visorColor = '#fb7185';
      pauldronColor = '#0f172a';
      strapColor = '#be123c';
      break;
    case 'skin_hazard_juggernaut':
      coreColor = '#facc15';
      midColor = '#ca8a04';
      rimDark = '#3f6212';
      outerStroke = '#a3e635';
      visorColor = '#bef264';
      pauldronColor = '#365314';
      strapColor = '#1e293b';
      break;
    case 'skin_pyro_igniter':
      coreColor = '#dc2626';
      midColor = '#7f1d1d';
      rimDark = '#1c1917';
      outerStroke = '#f97316';
      visorColor = '#fb923c';
      pauldronColor = '#450a0a';
      strapColor = '#ea580c';
      break;
    case 'skin_cryo_warden':
      coreColor = '#e0f2fe';
      midColor = '#0284c7';
      rimDark = '#0c4a6e';
      outerStroke = '#7dd3fc';
      visorColor = '#bae6fd';
      pauldronColor = '#0369a1';
      strapColor = '#e0f2fe';
      break;
    case 'skin_volt_cyber':
      coreColor = '#334155';
      midColor = '#0f172a';
      rimDark = '#020617';
      outerStroke = '#22d3ee';
      visorColor = '#22d3ee';
      pauldronColor = '#164e63';
      strapColor = '#06b6d4';
      break;
    case 'skin_solar_valkyrie':
      coreColor = '#fffbeb';
      midColor = '#f59e0b';
      rimDark = '#78350f';
      outerStroke = '#fde047';
      visorColor = '#fef08a';
      pauldronColor = '#b45309';
      strapColor = '#e879f9';
      break;
    default:
      break;
  }

  // Skin-specific outer animated aura / special FX beneath suit (when alive)
  if (!dead) {
    if (skinId === 'skin_pyro_igniter') {
      ctx.globalAlpha = 0.22 * pulse;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (skinId === 'skin_cryo_warden') {
      ctx.globalAlpha = 0.2 * pulse;
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (skinId === 'skin_volt_cyber') {
      ctx.strokeStyle = `rgba(34, 211, 238, ${(0.45 * pulse).toFixed(2)})`;
      ctx.lineWidth = 1.6;
      const rot = time * 0.005;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, rot, rot + 1.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, rot + Math.PI, rot + Math.PI + 1.3);
      ctx.stroke();
    } else if (skinId === 'skin_solar_valkyrie') {
      // Radiant golden-prismatic orbital ring + 3 floating star shards
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const a = time * 0.0038 + (i * Math.PI * 2) / 3;
        const ox = Math.cos(a) * (radius + 7);
        const oy = Math.sin(a) * (radius + 7);
        ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#e879f9';
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(a) * 4, oy + Math.sin(a) * 4);
        ctx.lineTo(ox + Math.cos(a + 2.2) * 3, oy + Math.sin(a + 2.2) * 3);
        ctx.lineTo(ox + Math.cos(a - 2.2) * 3, oy + Math.sin(a - 2.2) * 3);
        ctx.closePath();
        ctx.fill();
      }
    } else if (skinId === 'skin_ghost_recon' && isMoving) {
      // Subtle stealth afterimage silhouette trailing backwards
      ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
      ctx.beginPath();
      ctx.arc(-5, 0, radius * 0.92, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Base Suit Body (fast layered fills instead of per-frame gradients when possible, or clean radial gradient)
  const grad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
  if (dead) {
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.4, '#1e293b');
    grad.addColorStop(0.85, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else {
    grad.addColorStop(0, coreColor);
    grad.addColorStop(0.45, midColor);
    grad.addColorStop(0.86, rimDark);
    grad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Rear Dorsal Pack / Cloak / Canisters depending on Skin
  if (skinId === 'skin_hazard_juggernaut') {
    // Pressurized Bio-Hazard Green Twin Tanks on Back
    ctx.fillStyle = dead ? '#1e293b' : '#4d7c0f';
    ctx.strokeStyle = dead ? '#334155' : '#a3e635';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-radius * 1.05, -radius * 0.55, 7, radius * 0.45, 2);
    ctx.roundRect(-radius * 1.05, radius * 0.1, 7, radius * 0.45, 2);
    ctx.fill();
    ctx.stroke();
  } else if (skinId === 'skin_ghost_recon') {
    // Stealth Recon Cloak Tail Fins
    ctx.fillStyle = dead ? '#0f172a' : '#090d16';
    ctx.strokeStyle = dead ? '#334155' : '#e11d48';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.4, -radius * 0.72);
    ctx.lineTo(-radius * 1.18, -radius * 0.36);
    ctx.lineTo(-radius * 0.95, 0);
    ctx.lineTo(-radius * 1.18, radius * 0.36);
    ctx.lineTo(-radius * 0.4, radius * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (skinId === 'skin_pyro_igniter') {
    // Molten Magma Vents on Armor
    ctx.strokeStyle = dead ? '#451a03' : '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.55, -radius * 0.35);
    ctx.lineTo(-radius * 0.1, -radius * 0.22);
    ctx.moveTo(-radius * 0.55, radius * 0.35);
    ctx.lineTo(-radius * 0.1, radius * 0.22);
    ctx.stroke();
  } else if (skinId === 'skin_cryo_warden') {
    // Crystalline Frost Dorsal Spikes
    ctx.fillStyle = dead ? '#334155' : '#bae6fd';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-radius * 0.3, side * radius * 0.55);
      ctx.lineTo(-radius * 0.95, side * radius * 0.85);
      ctx.lineTo(-radius * 0.68, side * radius * 0.25);
      ctx.closePath();
      ctx.fill();
    }
  } else if (skinId === 'skin_solar_valkyrie') {
    // Twin Wing Fin Plumes
    ctx.fillStyle = dead ? '#334155' : '#fde047';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-radius * 0.15, side * radius * 0.7);
      ctx.lineTo(-radius * 1.12, side * radius * 1.02);
      ctx.lineTo(-radius * 0.65, side * radius * 0.32);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Tactical Plate-Carrier Backpack Rig (for Default & Volt skins)
    ctx.fillStyle = dead ? '#0f172a' : '#1e293b';
    ctx.strokeStyle = dead ? '#334155' : outerStroke;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(-radius * 1.04, -radius * 0.44, 6.5, radius * 0.88, 2);
    ctx.fill();
    ctx.stroke();
  }

  // Tactical Helmet Mount / NVG Shroud (Forehead)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = dead ? '#334155' : rimDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(radius * 0.3, -radius * 0.3, 4, radius * 0.6, 1);
  ctx.fill();
  ctx.stroke();

  // Tactical Kevlar Straps / Cyber Conduits
  ctx.strokeStyle = dead ? '#1e293b' : strapColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.6, -radius * 0.4);
  ctx.lineTo(radius * 0.2, -radius * 0.4);
  ctx.moveTo(-radius * 0.6, radius * 0.4);
  ctx.lineTo(radius * 0.2, radius * 0.4);
  ctx.stroke();

  // Forward Tactical Visor (or Quad-Lens NVG for Ghost Recon / Cyber Visor for Volt)
  ctx.save();
  let activeVisor = visorColor;
  if (dead) {
    const flicker = Math.sin(deathProgress * 25) > 0;
    if (deathProgress < 0.35 && flicker) {
      activeVisor = visorColor;
    } else if (deathProgress < 0.65) {
      activeVisor = '#ea580c';
    } else {
      activeVisor = '#1e293b';
    }
  }

  if (!dead) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = activeVisor;
    ctx.beginPath();
    ctx.arc(radius * 0.52, 0, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (skinId === 'skin_ghost_recon') {
    // 4 Glowing Crimson NVG Lenses
    ctx.fillStyle = activeVisor;
    [-0.36, -0.14, 0.14, 0.36].forEach((offY) => {
      ctx.beginPath();
      ctx.arc(radius * 0.62, radius * offY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    ctx.fillStyle = activeVisor;
    ctx.beginPath();
    ctx.moveTo(radius * 0.84, 0);
    ctx.lineTo(radius * 0.28, -radius * 0.36);
    ctx.lineTo(radius * 0.42, 0);
    ctx.lineTo(radius * 0.28, radius * 0.36);
    ctx.closePath();
    ctx.fill();

    // Inner White HUD reticle slit (if alive)
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
  }

  // Shattered Visor Cracks when dying
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

  // Tactical Shoulder Pauldrons with walk stride offset & top bevel highlight
  const pauldronShift = walkSway * 2.1;
  ctx.fillStyle = dead ? '#1e293b' : pauldronColor;
  const pRad = skinId === 'skin_hazard_juggernaut' ? 4.4 : 3.5;
  ctx.beginPath();
  ctx.arc(-radius * 0.25 + pauldronShift, -radius * 0.82, pRad, 0, Math.PI * 2);
  ctx.arc(-radius * 0.25 - pauldronShift, radius * 0.82, pRad, 0, Math.PI * 2);
  ctx.fill();

  // Subtle metallic bevel rim on pauldrons
  if (!dead) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.arc(-radius * 0.22 + pauldronShift, -radius * 0.85, pRad * 0.45, 0, Math.PI * 2);
    ctx.arc(-radius * 0.22 - pauldronShift, radius * 0.79, pRad * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Volt Cyber Shoulder Arc Coils
  if (skinId === 'skin_volt_cyber' && !dead) {
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(-radius * 0.25 + pauldronShift, -radius * 0.82, 1.8, 0, Math.PI * 2);
    ctx.arc(-radius * 0.25 - pauldronShift, radius * 0.82, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3D Helmet Dome Specular Catchlight & Armor Seam Groove
  if (!dead) {
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.64, Math.PI * 0.65, Math.PI * 1.35);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.14, -radius * 0.24, radius * 0.34, radius * 0.18, -0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer Crisp Tactical Rim
  ctx.strokeStyle = dead ? '#475569' : outerStroke;
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

export const OperatorAvatarPreview: React.FC<{ skinId?: string; size?: number }> = ({
  skinId = 'skin_default',
  size = 56,
}) => {
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
      ctx.rotate(-0.35);
      renderOperatorBody(ctx, skinId, size * 0.3, time, true);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skinId, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="shrink-0 block" />;
};
