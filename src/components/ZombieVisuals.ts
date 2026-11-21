/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Zombie, ZombieType } from '../types';

/**
 * Redesigned top-down zombie renderer keeping the signature round ball silhouette,
 * upgraded with 3D spherical lighting, distinct infection anatomy, pulsing pustules,
 * exposed bone/armor plates, fangs/claws, and combat reaction highlights (zero shadowBlur).
 */
export function renderBallZombie(
  ctx: CanvasRenderingContext2D,
  z: Zombie,
  sx: number,
  sy: number,
  time: number,
  recentlyHit: boolean = false
): void {
  const r = z.radius;
  const seed = z.aiSeed || 0;
  const pulse = Math.sin(time * 0.01 + seed) * 0.05;
  const walkSway = Math.sin(time * 0.013 + seed);

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(z.angle);
  ctx.scale(1 + pulse, 1 - pulse * 0.6);

  // Palette & visual identity per zombie class
  let coreColor = '#65a30d';
  let midColor = '#365314';
  let rimColor = '#142608';
  let outlineColor = '#020617';
  let armColor = '#3f6212';
  let eyeColor = '#fbbf24';
  let eyeGlow = '#ef4444';

  switch (z.type) {
    case ZombieType.RUNNER:
      coreColor = '#f87171';
      midColor = '#b91c1c';
      rimColor = '#450a0a';
      outlineColor = '#090d16';
      armColor = '#991b1b';
      eyeColor = '#fef08a';
      eyeGlow = '#f97316';
      break;
    case ZombieType.TANK:
      coreColor = '#84a98c';
      midColor = '#354f52';
      rimColor = '#1b2628';
      outlineColor = '#020617';
      armColor = '#2f3e46';
      eyeColor = '#fb923c';
      eyeGlow = '#ea580c';
      break;
    case ZombieType.TOXIC_SPITTER:
      coreColor = '#d9f99d';
      midColor = '#65a30d';
      rimColor = '#1a2e05';
      outlineColor = '#365314';
      armColor = '#4d7c0f';
      eyeColor = '#ecfccb';
      eyeGlow = '#84cc16';
      break;
    case ZombieType.BOSS:
      coreColor = '#ef4444';
      midColor = '#7f1d1d';
      rimColor = '#1c0505';
      outlineColor = '#fbbf24';
      armColor = '#450a0a';
      eyeColor = '#fde047';
      eyeGlow = '#f97316';
      break;
    case ZombieType.BOSS_BUTCHER:
      coreColor = '#be123c';
      midColor = '#4c0519';
      rimColor = '#090205';
      outlineColor = '#fda4af';
      armColor = '#3b0712';
      eyeColor = '#ffffff';
      eyeGlow = '#e11d48';
      break;
    case ZombieType.BOSS_NECROTITAN:
      coreColor = '#c084fc';
      midColor = '#581c87';
      rimColor = '#1e0536';
      outlineColor = '#e879f9';
      armColor = '#3b0764';
      eyeColor = '#fae8ff';
      eyeGlow = '#d946ef';
      break;
    default:
      break;
  }

  // 1. Boss dark outer pressure ring / Necrotitan orbiting bone shards
  if (z.isBoss) {
    ctx.strokeStyle = z.type === ZombieType.BOSS_NECROTITAN ? 'rgba(217, 70, 239, 0.38)' : 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 6 + Math.sin(time * 0.008) * 2, 0, Math.PI * 2);
    ctx.stroke();

    if (z.type === ZombieType.BOSS_NECROTITAN) {
      ctx.fillStyle = '#e9d5ff';
      for (let i = 0; i < 4; i++) {
        const oa = time * 0.004 + (i * Math.PI) / 2 - z.angle;
        const ox = Math.cos(oa) * (r + 10);
        const oy = Math.sin(oa) * (r + 10);
        ctx.beginPath();
        ctx.arc(ox, oy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 2. Reaching clawed / armored arms anchored smoothly on the ball sides
  const armReach = z.type === ZombieType.RUNNER ? r * 1.18 : r * 0.96;
  const armThick = z.type === ZombieType.TANK || z.isBoss ? r * 0.38 : r * 0.28;
  ctx.fillStyle = recentlyHit ? '#fca5a5' : armColor;
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.5;

  // Left arm
  ctx.beginPath();
  ctx.roundRect(r * 0.12 + walkSway * 2.4, -r * 0.92, armReach, armThick, armThick * 0.45);
  ctx.fill();
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.roundRect(r * 0.12 - walkSway * 2.4, r * 0.92 - armThick, armReach, armThick, armThick * 0.45);
  ctx.fill();
  ctx.stroke();

  // Sharp claw tips
  ctx.fillStyle = z.type === ZombieType.TOXIC_SPITTER ? '#bef264' : '#e2e8f0';
  for (const side of [-1, 1]) {
    const cy = side * (r * 0.92 - armThick * 0.5);
    const cx = r * 0.12 + armReach + (side === -1 ? walkSway * 2.4 : -walkSway * 2.4);
    ctx.beginPath();
    ctx.moveTo(cx - 1, cy - 2.5);
    ctx.lineTo(cx + 4.5, cy);
    ctx.lineTo(cx - 1, cy + 2.5);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Main 3D Spherical Zombie Ball Body (radial shading toward upper-left catchlight)
  const sphereGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.08, 0, 0, r);
  if (recentlyHit) {
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.5, '#fca5a5');
    sphereGrad.addColorStop(1, '#991b1b');
  } else {
    sphereGrad.addColorStop(0, coreColor);
    sphereGrad.addColorStop(0.55, midColor);
    sphereGrad.addColorStop(1, rimColor);
  }

  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // 4. Class-specific organic surface details inside the sphere
  if (!recentlyHit) {
    if (z.type === ZombieType.NORMAL) {
      // Decayed forest moss patch + exposed stitched skull scar
      ctx.fillStyle = 'rgba(20, 83, 45, 0.55)';
      ctx.beginPath();
      ctx.arc(-r * 0.32, r * 0.28, r * 0.34, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(127, 29, 29, 0.78)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-r * 0.35, -r * 0.25);
      ctx.lineTo(r * 0.15, -r * 0.08);
      ctx.stroke();
    } else if (z.type === ZombieType.RUNNER) {
      // Exposed sinew striations & jagged rear bone spikes
      ctx.strokeStyle = 'rgba(254, 202, 202, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(-r * 0.1, 0, r * 0.55, Math.PI * 0.65, Math.PI * 1.35);
      ctx.stroke();
      ctx.fillStyle = '#fecaca';
      for (const s of [-0.4, 0, 0.4]) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.88, s * r - 2.5);
        ctx.lineTo(-r * 1.24, s * r);
        ctx.lineTo(-r * 0.88, s * r + 2.5);
        ctx.closePath();
        ctx.fill();
      }
    } else if (z.type === ZombieType.TANK) {
      // Riveted heavy carapace plates over sphere
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(-r * 0.08, 0, r * 0.62, -Math.PI * 0.65, Math.PI * 0.65);
      ctx.fill();
      ctx.stroke();

      // Glowing magma mutation veins
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.25);
      ctx.lineTo(-r * 0.15, 0);
      ctx.lineTo(-r * 0.45, r * 0.35);
      ctx.stroke();
    } else if (z.type === ZombieType.TOXIC_SPITTER) {
      // Bubbling bioluminescent acid sacs on ball dome
      const sacPulse = 1 + Math.sin(time * 0.016 + seed) * 0.18;
      ctx.fillStyle = '#ecfccb';
      const sacs = [
        { x: -r * 0.25, y: -r * 0.32, rad: r * 0.22 },
        { x: -r * 0.38, y: r * 0.22, rad: r * 0.25 },
        { x: 0, y: r * 0.36, rad: r * 0.17 },
      ];
      for (let i = 0; i < sacs.length; i++) {
        ctx.beginPath();
        ctx.arc(sacs[i].x, sacs[i].y, sacs[i].rad * sacPulse, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (z.type === ZombieType.BOSS) {
      // Bone crown spikes around dome + glowing magma crack
      ctx.fillStyle = '#fef3c7';
      for (let s = 0; s < 6; s++) {
        const sa = (s * Math.PI * 2) / 6 + 0.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa - 0.14) * r * 0.85, Math.sin(sa - 0.14) * r * 0.85);
        ctx.lineTo(Math.cos(sa) * (r + 7), Math.sin(sa) * (r + 7));
        ctx.lineTo(Math.cos(sa + 0.14) * r * 0.85, Math.sin(sa + 0.14) * r * 0.85);
        ctx.closePath();
        ctx.fill();
      }
    } else if (z.type === ZombieType.BOSS_BUTCHER) {
      // Iron riveted butcher visor plate across front hemisphere
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(r * 0.1, 0, r * 0.72, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.lineTo(r * 0.1, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (z.type === ZombieType.BOSS_NECROTITAN) {
      // Etched void rune circle inside dome
      ctx.strokeStyle = 'rgba(240, 171, 252, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.56, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 5. Crisp spherical outline
  ctx.strokeStyle = recentlyHit ? '#ffffff' : outlineColor;
  ctx.lineWidth = z.isBoss ? 2.6 : 1.9;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Snarling front fangs / mandibles on front edge of the ball
  ctx.fillStyle = z.type === ZombieType.TOXIC_SPITTER ? '#d9f99d' : '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(r * 0.86, -r * 0.24);
  ctx.lineTo(r * 1.12, -r * 0.15);
  ctx.lineTo(r * 0.92, -r * 0.04);
  ctx.moveTo(r * 0.86, r * 0.24);
  ctx.lineTo(r * 1.12, r * 0.15);
  ctx.lineTo(r * 0.92, r * 0.04);
  ctx.fill();

  // 7. Intense glowing eyes (Spitter gets 3 eyes, Necrotitan gets 4, others get 2 predator eyes)
  const eyeRadius = Math.max(2.0, r * 0.145);
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(r * 0.48, -r * 0.28, eyeRadius * 1.45, 0, Math.PI * 2);
  ctx.arc(r * 0.48, r * 0.28, eyeRadius * 1.45, 0, Math.PI * 2);
  if (z.type === ZombieType.TOXIC_SPITTER) {
    ctx.arc(r * 0.6, 0, eyeRadius * 1.3, 0, Math.PI * 2);
  } else if (z.type === ZombieType.BOSS_NECROTITAN) {
    ctx.arc(r * 0.34, -r * 0.48, eyeRadius * 1.2, 0, Math.PI * 2);
    ctx.arc(r * 0.34, r * 0.48, eyeRadius * 1.2, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(r * 0.5, -r * 0.28, eyeRadius * 0.85, 0, Math.PI * 2);
  ctx.arc(r * 0.5, r * 0.28, eyeRadius * 0.85, 0, Math.PI * 2);
  if (z.type === ZombieType.TOXIC_SPITTER) {
    ctx.arc(r * 0.62, 0, eyeRadius * 0.78, 0, Math.PI * 2);
  } else if (z.type === ZombieType.BOSS_NECROTITAN) {
    ctx.arc(r * 0.36, -r * 0.48, eyeRadius * 0.72, 0, Math.PI * 2);
    ctx.arc(r * 0.36, r * 0.48, eyeRadius * 0.72, 0, Math.PI * 2);
  }
  ctx.fill();

  // 8. Wet glossy spherical top catchlight
  if (!recentlyHit) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.22, -r * 0.3, r * 0.28, r * 0.14, -0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Status indicators (Fire / Stun)
  if (z.isOnFire) {
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.9)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3.2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (z.isStunned) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();

  // Overhead sleek HP bar for wounded zombies (non-bosses have compact bar; bosses have HUD bar)
  if (!z.isBoss && z.hp < z.maxHp) {
    const bw = r * 2.15;
    const ratio = Math.max(0, Math.min(1, z.hp / z.maxHp));
    ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
    ctx.fillRect(sx - bw / 2, sy - r - 11, bw, 4);
    ctx.fillStyle =
      z.type === ZombieType.TANK
        ? '#f59e0b'
        : z.type === ZombieType.TOXIC_SPITTER
          ? '#84cc16'
          : '#ef4444';
    ctx.fillRect(sx - bw / 2, sy - r - 11, bw * ratio, 4);
  }
}
