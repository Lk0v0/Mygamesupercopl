/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bullet, VoidDroneState, WeaponType } from '../types';

/**
 * Render top-down equipped realistic conventional firearm with recoil slide/bolt kick.
 * No circular ball hands: renders sleek tactical forearm sleeve & gloved grip geometry aligned to weapon.
 */
export function renderPlayerWeapon(
  ctx: CanvasRenderingContext2D,
  weaponType: WeaponType,
  recoil: number,
  time: number,
  playerRadius: number
) {
  ctx.save();
  const rKick = Math.max(0, Math.min(10, recoil));

  if (weaponType === WeaponType.GLOCK_19) {
    // Tactical Two-Handed Weaver Grip Forearms (sleek tapered sleeves, no circular ball hands)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.1;
    // Right dominant forearm
    ctx.beginPath();
    ctx.roundRect(4 - rKick * 0.4, 3.5, 16, 5.2, 2.2);
    ctx.fill();
    ctx.stroke();
    // Left support forearm
    ctx.beginPath();
    ctx.roundRect(6 - rKick * 0.3, -8.5, 14, 4.8, 2.2);
    ctx.fill();
    ctx.stroke();

    // Glock 19 Gen5 MOS Slide (reciprocates sharply on shot)
    const sx = 12 - rKick * 0.9;
    ctx.fillStyle = '#0f172a'; // Polymer dust cover & TLR-7A body
    ctx.beginPath();
    ctx.roundRect(14 - rKick * 0.4, -3.1, 18, 6.2, 1.4);
    ctx.fill();

    // Streamlight TLR-7A bezel under barrel
    ctx.fillStyle = '#334155';
    ctx.fillRect(28 - rKick * 0.4, -2.5, 5, 5);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.fillRect(32.5 - rKick * 0.4, -1.8, 1.3, 3.6);

    // nDLC Charcoal Steel Slide
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.roundRect(sx, -2.6, 20.5, 5.2, 1.1);
    ctx.fill();
    ctx.stroke();

    // Steel Match Barrel Tip + Brass Ejection Port Glint
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx + 20, -1.4, 3.2, 2.8);
    ctx.fillStyle = '#020617';
    ctx.fillRect(sx + 9, -2.3, 5.2, 2.5);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(sx + 9.8, -1.9, 3.2, 1.5);

    // Trijicon RMR Micro Red Dot Top Housing + Glowing Ruby Dot
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.fillRect(sx + 3.5, -2.2, 4.6, 4.4);
    ctx.strokeRect(sx + 3.5, -2.2, 4.6, 4.4);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(sx + 5.8, 0, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Front Tritium Night Sight
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(sx + 18.2, -0.7, 1.6, 1.4);
  } else if (weaponType === WeaponType.BENELLI_M4) {
    const bx = 4 - rKick * 1.1;
    // Tactical Forearm Grip
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(2 - rKick * 0.4, 4, 15, 5.2, 2.2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(14 - rKick * 0.6, -7.2, 14, 4.6, 2.0);
    ctx.fill();
    ctx.stroke();

    // Collapsible Tactical Stock Shoulder Butt
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.roundRect(bx - 6, -3.0, 11, 6.0, 1.2);
    ctx.fill();
    ctx.stroke();

    // Anodized Titanium Receiver
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.roundRect(bx + 4, -3.5, 16, 7.0, 1.2);
    ctx.fill();
    ctx.stroke();

    // Top Picatinny Rail & Side-Saddle Crimson 12ga Shells
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx + 6, -1.3, 12, 2.6);
    ctx.fillStyle = '#dc2626';
    for (let s = 0; s < 4; s++) {
      ctx.fillRect(bx + 6.5 + s * 2.8, 3.2, 2.0, 1.8);
    }

    // Ribbed Polymer Forend + Heavy Barrel + Full-Length Underbarrel Tube
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(bx + 20, -3.2, 13, 6.4, 1.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.fillRect(bx + 20, -1.6, 20.5, 3.2);
    // Breacher Choke Muzzle Crown + Front Ghost-Ring Red Post
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#94a3b8';
    ctx.fillRect(bx + 39.5, -2.0, 3.6, 4.0);
    ctx.strokeRect(bx + 39.5, -2.0, 3.6, 4.0);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(bx + 38.2, -0.7, 1.4, 1.4);
  } else {
    // FN SCAR-L CQC (5.56x45mm NATO)
    const rx = 4 - rKick * 0.85;
    // Support Arm Reaching to Vertical Foregrip & Firing Arm on Grip
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(2 - rKick * 0.35, 3.8, 15, 5.0, 2.1);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(15 - rKick * 0.5, -7.8, 14, 4.6, 2.0);
    ctx.fill();
    ctx.stroke();

    // FDE Folding Stock Rear
    ctx.fillStyle = '#b49468';
    ctx.strokeStyle = '#5c472c';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.roundRect(rx - 7, -3.0, 12, 6.0, 1.3);
    ctx.fill();
    ctx.stroke();

    // FDE Monolithic Extruded Upper Receiver & Quad-Rail Handguard
    ctx.fillStyle = '#c4a476';
    ctx.strokeStyle = '#6b5333';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.roundRect(rx + 4, -3.5, 29, 7.0, 1.2);
    ctx.fill();
    ctx.stroke();

    // Top Continuous Picatinny Rail
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rx + 5, -1.3, 27, 2.6);

    // EOTech EXPS3 Holographic Sight + Subtle Red Reticle Dot
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.8;
    ctx.fillRect(rx + 9, -2.5, 6.8, 5.0);
    ctx.strokeRect(rx + 9, -2.5, 6.8, 5.0);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(rx + 12.4, 0, 1.0, 0, Math.PI * 2);
    ctx.fill();

    // PEQ-15 FDE Tactical Laser Module + Subtle IR/Red Laser Micro-Lens
    ctx.fillStyle = '#9c7e54';
    ctx.strokeStyle = '#475569';
    ctx.fillRect(rx + 23.5, -3.4, 7.2, 3.0);
    const laserPulse = 0.55 + Math.sin(time * 0.012) * 0.25;
    ctx.fillStyle = `rgba(56, 189, 248, ${laserPulse.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(rx + 30.8, -1.9, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Free-Floated Steel CQC Barrel + Gas Block + 3-Prong Flash Hider
    ctx.fillStyle = '#475569';
    ctx.fillRect(rx + 33, -1.5, 9.5, 3.0);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.7;
    ctx.fillRect(rx + 41.5, -2.1, 4.2, 4.2);
    ctx.strokeRect(rx + 41.5, -2.1, 4.2, 4.2);
  }

  // Keep playerRadius referenced cleanly
  if (playerRadius < 0) {
    ctx.fillRect(0, 0, 0, 0);
  }

  ctx.restore();
}

/**
 * Render projectile & tracer trails with high-clarity crisp canvas shapes (zero shadowBlur).
 */
export function renderBulletVisual(
  ctx: CanvasRenderingContext2D,
  b: Bullet,
  camX: number,
  camY: number,
  time: number
) {
  const bx = b.x - camX;
  const by = b.y - camY;

  ctx.save();
  ctx.translate(bx, by);

  if (b.isEnemy) {
    ctx.rotate(b.ownerAngle);
    if (b.color === '#dc2626') {
      // Butcher Boss heavy cleaver wave
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius + 3, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.fillStyle = '#fecaca';
      ctx.beginPath();
      ctx.arc(2, 0, b.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.color === '#a855f7') {
      // Necrotitan bone/void spike
      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.moveTo(b.radius + 6, 0);
      ctx.lineTo(-b.radius, -b.radius * 0.75);
      ctx.lineTo(-b.radius * 0.5, 0);
      ctx.lineTo(-b.radius, b.radius * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.arc(1, 0, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Toxic Spitter acid glob
      ctx.fillStyle = 'rgba(132, 204, 22, 0.35)';
      ctx.beginPath();
      ctx.arc(-4, 0, b.radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ecfccb';
      ctx.beginPath();
      ctx.arc(1.5, -1, b.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // Mythic Spectral Split Shot Ray
  if (b.isRay) {
    ctx.rotate(b.ownerAngle);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = b.color || '#e879f9';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(11, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Mythic Void Monarch Homing Lance
  if (b.isVoidLance) {
    ctx.rotate(b.ownerAngle);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(192, 132, 252, 0.42)';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-14, -5.5);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f5d0fe';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -2.5);
    ctx.lineTo(-8, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  // Epic Ricochet Shrapnel
  if (b.isShrapnel) {
    ctx.rotate(b.ownerAngle + time * 0.015);
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(5.5, 0);
    ctx.lineTo(-4, -3.2);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, 3.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-1, -1, 3, 2);
    ctx.restore();
    return;
  }

  ctx.rotate(b.ownerAngle);

  if (b.weaponType === WeaponType.BENELLI_M4) {
    // 12-Gauge 00 Buckshot: hot ember streak + lead pellet core
    const streak = ctx.createLinearGradient(-22, 0, 5, 0);
    streak.addColorStop(0, 'rgba(249, 115, 22, 0)');
    streak.addColorStop(0.55, 'rgba(251, 146, 60, 0.65)');
    streak.addColorStop(1, '#fef08a');
    ctx.fillStyle = streak;
    ctx.fillRect(-22, -1.6, 26, 3.2);

    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius + 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(1.1, 0, Math.max(1.2, b.radius * 0.52), 0, Math.PI * 2);
    ctx.fill();
  } else if (b.weaponType === WeaponType.SCAR_L) {
    // 5.56x45mm NATO High-Velocity Spitzer Tracer
    const streak = ctx.createLinearGradient(-44, 0, 8, 0);
    streak.addColorStop(0, 'rgba(56, 189, 248, 0)');
    streak.addColorStop(0.5, 'rgba(56, 189, 248, 0.55)');
    streak.addColorStop(0.85, '#bae6fd');
    streak.addColorStop(1, '#ffffff');
    ctx.fillStyle = streak;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-44, -2.0);
    ctx.lineTo(-44, 2.0);
    ctx.closePath();
    ctx.fill();

    // Copper-jacketed Spitzer bullet nose
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.ellipse(2, 0, 5.2, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Glock 19 9x19mm NATO FMJ/JHP + Crisp Amber Vapor Trail
    const streak = ctx.createLinearGradient(-28, 0, 6, 0);
    streak.addColorStop(0, 'rgba(251, 191, 36, 0)');
    streak.addColorStop(0.55, 'rgba(251, 191, 36, 0.62)');
    streak.addColorStop(1, '#fef3c7');
    ctx.fillStyle = streak;
    ctx.fillRect(-28, -1.4, 33, 2.8);

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(1.5, 0, 4.2, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(2.8, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Render rotating blazing Solar Corona around the player (Mythic Solar Phoenix).
 */
export function renderMythicSolarAura(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  level: number,
  time: number
) {
  const auraRadius = 140 + Math.min(3, level - 1) * 18;
  const pulse = 0.92 + Math.sin(time * 0.008) * 0.08;

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.globalCompositeOperation = 'lighter';

  const grad = ctx.createRadialGradient(0, 0, auraRadius * 0.25, 0, 0, auraRadius * pulse);
  grad.addColorStop(0, 'rgba(251, 146, 60, 0.02)');
  grad.addColorStop(0.65, 'rgba(249, 115, 22, 0.14)');
  grad.addColorStop(0.92, 'rgba(250, 204, 21, 0.24)');
  grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(time * 0.0016);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([16, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius * 0.96, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const fx = Math.cos(a) * auraRadius * 0.96;
    const fy = Math.sin(a) * auraRadius * 0.96;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.72)';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(0, -10 - Math.sin(time * 0.015 + i) * 4, 12, 0);
    ctx.quadraticCurveTo(0, 5, -8, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Render 5 orbiting lethal Cosmic Singularity Blades slicing enemies around the player.
 */
export function renderMythicSingularityBlades(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  orbitAngle: number,
  count: number,
  time: number
) {
  const orbitR = 78;
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.globalCompositeOperation = 'lighter';

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, orbitR, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < count; i++) {
    const a = orbitAngle + (i * Math.PI * 2) / count;
    const bx = Math.cos(a) * orbitR;
    const by = Math.sin(a) * orbitR;

    for (let s = 0; s < 7; s++) {
      const f0 = s / 7;
      const f1 = (s + 1) / 7;
      const a0 = a - 0.55 * (1 - f0);
      const a1 = a - 0.55 * (1 - f1);
      ctx.strokeStyle = `rgba(217, 70, 239, ${(f1 * 0.55).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, f1 * 4.5);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, orbitR, a0, a1);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(a + Math.PI / 2 + Math.sin(time * 0.01 + i) * 0.15);

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(-13, -3);
    ctx.quadraticCurveTo(2, -13, 15, 0);
    ctx.quadraticCurveTo(2, -5, -13, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.quadraticCurveTo(3, -10, 14, 0);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -3, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Render 3 autonomous hovering Void Monarch Hunter Drones around the player.
 */
export function renderMythicVoidDrones(
  ctx: CanvasRenderingContext2D,
  drones: VoidDroneState[],
  camX: number,
  camY: number,
  time: number
) {
  if (!drones.length) return;

  ctx.save();
  for (let i = 0; i < drones.length; i++) {
    const d = drones[i];
    const sx = d.x - camX;
    const sy = d.y - camY;
    const pulse = 0.8 + Math.sin(time * 0.015 + i * 2) * 0.2;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(d.angle);

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(232, 121, 249, 0.7)';
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-8, 3);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-7, -9);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-7, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1, 0, 2.6 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();
}
