/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeaponType, Bullet, ThrusterTrailPoint, VoidDroneState, DragonSegment } from '../types';

/**
 * Top-down visual renderer for all weapons without any balls or spherical hand blobs.
 * Purely mechanical, angular, tactical, and sharp.
 * Drawn relative to player center (0, 0), with player facing along +X axis.
 */
export function renderPlayerWeapon(
  ctx: CanvasRenderingContext2D,
  weaponType: WeaponType,
  recoil: number,
  time: number,
  playerRadius: number = 16
) {
  ctx.save();
  // Apply weapon kickback recoil along -X
  ctx.translate(-recoil, 0);

  switch (weaponType) {
    case WeaponType.PISTOL: {
      // === 1. PISTOLA TÁTICA 9MM MK.II ===
      // Sleek tactical semi-automatic with slide serrations and laser module (NO BALLS)

      // Slide & Barrel
      ctx.fillStyle = '#1e293b'; // Gunmetal slide
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(10, -2.5, 18, 5, 1);
      ctx.fill();
      ctx.stroke();

      // Top slide highlight
      ctx.fillStyle = '#475569';
      ctx.fillRect(11, -2.5, 16, 1.2);

      // Slide serrations (rear)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12, -2, 1, 4);
      ctx.fillRect(14, -2, 1, 4);
      ctx.fillRect(16, -2, 1, 4);

      // Ejection port
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(18, -2, 3, 2);

      // Under-barrel tactical laser box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(15, 2.5, 8, 2);
      ctx.fillStyle = '#ef4444'; // Red laser emitter lens
      ctx.fillRect(23, 2.5, 1.5, 2);

      // Faint targeting laser beam projection
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(25, 3.5);
      ctx.lineTo(65, 3.5);
      ctx.stroke();
      ctx.restore();

      // Sleek angular receiver frame into operator body (NO BALLS)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, -1.8, 4, 3.6);
      break;
    }

    case WeaponType.MAGNUM: {
      // === REVÓLVER .44 MAGNUM HUNTER ===
      // Heavy brushed-steel 6-chamber revolver with ventilated rib barrel & walnut grip (NO BALLS)

      // Brushed steel frame
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(7, -3.2, 13, 6.4, 1);
      ctx.fill();
      ctx.stroke();

      // 6-round fluted revolving cylinder
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.roundRect(11, -4.5, 7.5, 9, 1.5);
      ctx.fill();
      ctx.stroke();
      // Fluting slots
      ctx.fillStyle = '#334155';
      ctx.fillRect(12, -3.4, 5.5, 1.4);
      ctx.fillRect(12, 2, 5.5, 1.4);

      // Long heavy underlug barrel
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(18.5, -2.2, 15, 4.4, 0.8);
      ctx.fill();
      ctx.stroke();

      // Ventilated top rib + red front ramp sight
      ctx.fillStyle = '#475569';
      ctx.fillRect(19, -0.8, 13.5, 1.6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(32, -1, 2, 2);
      break;
    }

    case WeaponType.ASSAULT_RIFLE: {
      // === FUZIL DE ASSALTO AK-47 ===
      // Stamped steel receiver, walnut handguard, curved steel banana magazine & slant brake (NO BALLS)

      // Walnut buttstock junction & rear trunnion
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(5, -2.5, 6, 5);

      // Stamped gunmetal receiver
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(10, -3.8, 16, 7.6, 1.2);
      ctx.fill();
      ctx.stroke();

      // Top ribbed dust cover + bolt charging handle
      ctx.fillStyle = '#475569';
      ctx.fillRect(11, -1.6, 13, 3.2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(18, 3.6, 3.5, 2.2);

      // Iconic angled banana magazine extending sideways
      ctx.save();
      ctx.translate(18, 3.5);
      ctx.rotate(0.42);
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.fillRect(-1.5, 0, 4.5, 12);
      ctx.strokeRect(-1.5, 0, 4.5, 12);
      ctx.restore();

      // Wooden upper/lower handguard forend
      ctx.fillStyle = '#9a3412';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(25, -3.2, 11, 6.4, 1);
      ctx.fill();
      ctx.stroke();

      // Exposed steel barrel & slant muzzle brake
      ctx.fillStyle = '#334155';
      ctx.fillRect(36, -1.5, 9, 3);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(44, -2, 3, 4);
      break;
    }

    case WeaponType.LMG: {
      // === METRALHADORA LEVE M249 SAW ===
      // Belt-fed light machine gun with olive-drab 200-round ammo box, brass belt & folded bipod (NO BALLS)

      // Side-mounted 200-round ammo box
      ctx.fillStyle = '#365314';
      ctx.strokeStyle = '#1a2e05';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(11, 4, 10, 8, 1.5);
      ctx.fill();
      ctx.stroke();

      // Linked brass ammo belt feeding into receiver
      ctx.fillStyle = '#eab308';
      ctx.fillRect(13, 1.5, 6, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14.5, 1.5, 1, 3);
      ctx.fillRect(17, 1.5, 1, 3);

      // Heavy squared feed-tray receiver
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(7, -4.5, 20, 9, 1.2);
      ctx.fill();
      ctx.stroke();

      // Top rail & heat-shield shroud
      ctx.fillStyle = '#334155';
      ctx.fillRect(26, -3.5, 13, 7);
      ctx.fillStyle = '#0f172a';
      for (let v = 28; v <= 36; v += 3) {
        ctx.fillRect(v, -2, 1.5, 4);
      }

      // Extended heavy barrel + birdcage flash hider
      ctx.fillStyle = '#475569';
      ctx.fillRect(39, -1.6, 8, 3.2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(46, -2.2, 3, 4.4);

      // Folded titanium bipod legs
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(39, -3.5);
      ctx.lineTo(31, -6.5);
      ctx.moveTo(39, 3.5);
      ctx.lineTo(31, 6.5);
      ctx.stroke();
      break;
    }

    case WeaponType.SNIPER: {
      // === FUZIL SNIPER .50 BMG ANTI-BLINDAGEM ===
      // Long fluted anti-materiel barrel, dual-port chevron muzzle brake & precision scope (NO BALLS)

      // Tactical chassis receiver
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(6, -4, 19, 8, 1.5);
      ctx.fill();
      ctx.stroke();

      // Bolt handle sticking out
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(12, 3.8, 2.5, 3.5);

      // Long fluted match barrel
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.fillRect(25, -1.8, 25, 3.6);
      ctx.strokeRect(25, -1.8, 25, 3.6);

      // Dual-chamber anti-materiel muzzle brake
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.fillRect(49, -3.6, 6, 7.2);
      ctx.strokeRect(49, -3.6, 6, 7.2);
      ctx.fillStyle = '#020617';
      ctx.fillRect(51, -3.6, 1.4, 7.2);

      // Mounted telescopic optical scope (with sapphire lens gleam)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(11, -2.5, 17, 5, 1);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(26.5, -1.8, 1.8, 3.6);
      break;
    }

    case WeaponType.SHOTGUN: {
      // === 2. ESPINGARDA DE CANO DUPLO CALIBRE 12 ===
      // Heavy tactical double-barrel shotgun with twin steel tubes and ribbed foregrip (NO BALLS)

      // Receiver block (rear)
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(8, -4.5, 12, 9, 1.5);
      ctx.fill();
      ctx.stroke();

      // Twin blued steel barrels (side by side)
      // Top barrel
      ctx.fillStyle = '#475569';
      ctx.fillRect(18, -4, 20, 3.5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(18, -4, 20, 1);

      // Bottom barrel
      ctx.fillStyle = '#475569';
      ctx.fillRect(18, 0.5, 20, 3.5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(18, 0.5, 20, 1);

      // Center ventilated rib between barrels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(18, -0.5, 20, 1);

      // Sharp rectangular fiber-optic front sight (NO BALL BEAD)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(37, -1, 2, 2);

      // Ribbed textured pump-action foregrip
      ctx.fillStyle = '#78350f'; // Dark tactical walnut
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, -5, 10, 10, 1.5);
      ctx.fill();
      ctx.stroke();
      // Ribs
      ctx.fillStyle = '#451a03';
      ctx.fillRect(18, -4.5, 1.2, 9);
      ctx.fillRect(21, -4.5, 1.2, 9);
      ctx.fillRect(24, -4.5, 1.2, 9);
      break;
    }

    case WeaponType.MACHINE_GUN: {
      // === 3. SUBMETRALHADORA SMG TÁTICA VECTOR MP-7 ===
      // Fast CQB submachine gun with holographic sight, suppressor, and curved magazine (NO BALLS)

      // Receiver body
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(8, -3.5, 18, 7, 1.5);
      ctx.fill();
      ctx.stroke();

      // Top Picatinny accessory rail
      ctx.fillStyle = '#334155';
      ctx.fillRect(9, -4.5, 16, 1.5);

      // Holographic sight with rectangular lens
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(13, -6.5, 6, 2.5);
      ctx.fillStyle = '#c084fc'; // Purple holo reticle window
      ctx.fillRect(15, -6, 2, 1.5);

      // Cylindrical fluted suppressor barrel
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(24, -2.5, 12, 5, 1);
      ctx.fill();
      ctx.stroke();
      // Muzzle rings
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(27, -2.5, 1, 5);
      ctx.fillRect(30, -2.5, 1, 5);

      // Extended curved tactical magazine (angled)
      ctx.save();
      ctx.translate(12, 3);
      ctx.rotate(0.3);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 4, 11);
      // Brass rim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0.5, 10, 3, 1.5);
      ctx.restore();
      break;
    }

    case WeaponType.PLASMA_RIFLE: {
      // === 4. RIFLE DE PLASMA ELÉTRICO ARC-1 ===
      // Sci-fi high-energy carbine with glowing plasma cell & dual accelerator rails (NO BALLS)

      // Futuristic bullpup chassis
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(24, -4);
      ctx.lineTo(30, -2);
      ctx.lineTo(30, 2);
      ctx.lineTo(24, 4);
      ctx.lineTo(8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pulsing illuminated Plasma Core Chamber
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(14, -2.5, 9, 5);
      // Inner hot-white filament
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, -1, 5, 2);

      // Dual electromagnetic accelerator rails
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      // Top rail
      ctx.fillRect(28, -3.5, 14, 2);
      // Bottom rail
      ctx.fillRect(28, 1.5, 14, 2);

      // Lively crackling electrical arc between rail prongs
      if (Math.random() < 0.85) {
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.2;
        const midX = 35 + (Math.random() * 4 - 2);
        const midY = Math.random() * 3 - 1.5;
        ctx.beginPath();
        ctx.moveTo(38, -3);
        ctx.lineTo(midX, midY);
        ctx.lineTo(38, 3);
        ctx.stroke();
      }
      break;
    }

    case WeaponType.MINIGUN: {
      // === 5. METRALHADORA ROTATIVA MINIGUN TITAN M134 ===
      // Heavy 6-barrel Gatling rotary cannon with animated spinning barrels & emerald heat vents (NO BALLS)

      // Main drive motor & gearbox housing
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(6, -6, 16, 12, 1.5);
      ctx.fill();
      ctx.stroke();

      // Emerald heat exhaust vents
      ctx.fillStyle = '#10b981';
      ctx.fillRect(8, -5, 12, 1.8);
      ctx.fillRect(8, 3.2, 12, 1.8);

      // Central axle rotor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, -1.5, 18, 3);

      // 6 Rotating Steel Barrels (dynamically animated rotation)
      const rotAngle = (time * 0.04) % (Math.PI * 2);
      const barrelCount = 6;
      const barrelRadius = 4.2;

      for (let i = 0; i < barrelCount; i++) {
        const bAngle = rotAngle + (i * Math.PI * 2) / barrelCount;
        const bY = Math.sin(bAngle) * barrelRadius;
        const bZ = Math.cos(bAngle); // depth
        const bThickness = bZ > 0 ? 2.5 : 1.8;
        const bColor = bZ > 0 ? '#64748b' : '#334155';

        ctx.fillStyle = bColor;
        ctx.fillRect(20, bY - bThickness / 2, 18, bThickness);
      }

      // 2 Barrel retaining clamp rings
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(26, -5.5, 2.5, 11);
      ctx.fillRect(36, -5.5, 2.5, 11);

      // Ammo feed chute on the side
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(10, 6, 8, 3);
      break;
    }

    case WeaponType.ROCKET_LAUNCHER: {
      // === 6. LANÇADOR DE MÍSSEIS PESADO M-99 HELLFIRE ===
      // Massive shoulder-fired missile launcher with hazard stripes, targeting optics, and aerodynamic warhead (NO BALLS)

      // Tube rests on right shoulder (offset Y = 4)
      const tubeY = 4;
      const tubeW = 42;
      const tubeH = 12;

      // Rear exhaust blast bell (flared)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-4, tubeY - 6.5);
      ctx.lineTo(4, tubeY - 5);
      ctx.lineTo(4, tubeY + 5);
      ctx.lineTo(-4, tubeY + 6.5);
      ctx.closePath();
      ctx.fill();

      // Main heavy launch tube
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(4, tubeY - tubeH / 2, tubeW, tubeH, 1.5);
      ctx.fill();
      ctx.stroke();

      // Hazard Warning Stripes (yellow/black angled chevrons)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(20, tubeY - 5, 8, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(21, tubeY - 5, 1.5, 10);
      ctx.fillRect(24, tubeY - 5, 1.5, 10);

      // Digital targeting computer with rectangular orange lens
      ctx.fillStyle = '#090d16';
      ctx.fillRect(14, tubeY - 8.5, 9, 3.5);
      ctx.fillStyle = '#f97316'; // Orange targeting lens
      ctx.fillRect(21, tubeY - 8, 2, 2.5);

      // Sharp Conical Rocket Warhead Nose Cone (NO BALL TIP)
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(44, tubeY - 4.5);
      ctx.lineTo(51, tubeY);
      ctx.lineTo(44, tubeY + 4.5);
      ctx.closePath();
      ctx.fill();

      // Steel impact needle point
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(50, tubeY - 0.75, 2, 1.5);
      break;
    }

    case WeaponType.FLAMETHROWER: {
      // === 7. LANÇA-CHAMAS VULCÃO NAPALM-X ===
      // Industrial flamethrower with fuel compression tanks, heat shroud, and pilot flame (NO BALLS)

      // Dual fuel canisters clamped to side
      ctx.fillStyle = '#ea580c'; // Bright orange napalm tank
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(6, -7.5, 12, 5, 1.5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c2410c'; // Bronze second pressure tank
      ctx.beginPath();
      ctx.roundRect(6, 2.5, 12, 5, 1.5);
      ctx.fill();
      ctx.stroke();

      // Brass pressure regulator block (NO CIRCULAR GAUGE)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(10, -1.5, 4, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(11, -1, 2, 2);

      // Perforated heat-shielded long barrel
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(16, -3, 20, 6, 1);
      ctx.fill();
      ctx.stroke();

      // Heat ventilation rectangular slits along barrel
      ctx.fillStyle = '#0f172a';
      for (let h = 20; h <= 32; h += 4) {
        ctx.fillRect(h, -1.5, 1.8, 3);
      }

      // Nozzle bell at tip
      ctx.fillStyle = '#475569';
      ctx.fillRect(36, -3.5, 3, 7);

      // Active flickering pilot light flame
      const flameFlicker = Math.sin(time / 40) * 1.5 + (Math.random() * 2 - 1);
      const flameLength = 6 + flameFlicker;
      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.moveTo(39, -2);
      ctx.lineTo(39 + flameLength, 0);
      ctx.lineTo(39, 2);
      ctx.closePath();
      ctx.fill();
      // Hot yellow core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(39, -1);
      ctx.lineTo(39 + flameLength * 0.5, 0);
      ctx.lineTo(39, 1);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case WeaponType.RAYGUN: {
      // === 8. RAYGUN ALIENÍGENA PULSAR ZETA-9 ===
      // Futuristic alien energy blaster with angular faceted crystal core and emitter prongs (NO BALLS)

      // Sleek angular chassis
      ctx.fillStyle = '#0e7490';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(18, -5.5);
      ctx.lineTo(26, -2);
      ctx.lineTo(26, 2);
      ctx.lineTo(18, 5.5);
      ctx.lineTo(8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central Pulsating Angular Diamond Crystal Core (NO CIRCULAR ORB)
      ctx.fillStyle = '#00ffcc';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(16, -4);
      ctx.lineTo(22, 0);
      ctx.lineTo(16, 4);
      ctx.closePath();
      ctx.fill();
      // Hot white core slit
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, -1, 2, 2);

      // Angular Chromium Energy Focus Vanes (NO ELLIPSES)
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(24, -4.5, 2, 9);
      ctx.fillRect(28, -3.5, 2, 7);
      ctx.fillRect(32, -2.5, 2, 5);

      // Emitter needle
      ctx.fillStyle = '#00ffcc';
      ctx.fillRect(34, -1, 4, 2);
      break;
    }

    case WeaponType.RAY_RIFLE: {
      // === 9. FUZIL CRISTALINO ZARKON ===
      // Biomechanical alien weapon with radioactive green crystals and sharp spines (NO BALLS)

      // Biomechanical obsidian carapace chassis
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(16, -6);
      ctx.lineTo(32, -3);
      ctx.lineTo(38, -1.5);
      ctx.lineTo(38, 1.5);
      ctx.lineTo(32, 3);
      ctx.lineTo(16, 6);
      ctx.lineTo(8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3 Radioactive Alien Crystals protruding from spine
      ctx.fillStyle = '#39ff14';

      // Crystal 1
      ctx.beginPath();
      ctx.moveTo(14, -5);
      ctx.lineTo(17, -9);
      ctx.lineTo(20, -5);
      ctx.closePath();
      ctx.fill();

      // Crystal 2
      ctx.beginPath();
      ctx.moveTo(22, -4);
      ctx.lineTo(25, -8.5);
      ctx.lineTo(28, -4);
      ctx.closePath();
      ctx.fill();

      // Crystal 3
      ctx.beginPath();
      ctx.moveTo(29, -3);
      ctx.lineTo(32, -7);
      ctx.lineTo(35, -3);
      ctx.closePath();
      ctx.fill();

      // Muzzle focusing prism with neon green aura
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(37, -2, 5, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, -1, 2, 2);
      break;
    }

    case WeaponType.LASER_MINIGUN: {
      // === 10. LASER MINIGUN HIPER-FEIXE OMEGA ===
      // Experimental heavy weapon: revolving quad-prisms and glowing magenta radiator fins (NO BALLS)

      // Cyclotron capacitor housing
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(6, -6.5, 18, 13, 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Neon-Magenta Radiator Fins
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(8, -5, 14, 1.5);
      ctx.fillRect(8, 3.5, 14, 1.5);

      // High-density rectangular power cell (NO BALL CAPACITOR)
      ctx.fillRect(11, -2, 6, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(13, -1, 2, 2);

      // Revolving Quad-Prism Laser Assembly
      const lRot = time * 0.05;
      ctx.fillStyle = '#334155';
      ctx.fillRect(22, -2, 16, 4);

      // Rotating prism heads
      const prismCount = 4;
      for (let p = 0; p < prismCount; p++) {
        const pAngle = lRot + (p * Math.PI * 2) / prismCount;
        const pY = Math.sin(pAngle) * 4.5;
        const pZ = Math.cos(pAngle);
        const pColor = pZ > 0 ? '#ff0055' : '#881337';
        ctx.fillStyle = pColor;
        ctx.fillRect(24, pY - 1, 14, 2);
      }

      // Front focusing lens ring
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(36, -5.5, 3, 11);
      break;
    }

    case WeaponType.DESTRUCTOR: {
      // === NAVE DESTRUCTOR (DROP/MINI POD) ===
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-10, -13);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-10, 13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(0, -11, 12, 3);
      ctx.fillRect(0, 8, 12, 3);
      break;
    }

    case WeaponType.INTERCEPTOR: {
      // === NAVE INTERCEPTOR (DROP/MINI POD) ===
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-4, -18);
      ctx.lineTo(-10, -18);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-10, 18);
      ctx.lineTo(-4, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f5d4';
      ctx.beginPath();
      ctx.arc(-4, -17, 2.5, 0, Math.PI * 2);
      ctx.arc(-4, 17, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case WeaponType.NAVE_REI: {
      // === NAVE REI (DROP/MINI POD) ===
      ctx.fillStyle = '#14090b';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-4, -20);
      ctx.lineTo(-14, -18);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-14, 18);
      ctx.lineTo(-4, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(2, -16, 10, 2.5);
      ctx.fillRect(2, 13.5, 10, 2.5);
      break;
    }

    case WeaponType.IRON_MAN: {
      // === HOMEM DE FERRO GAUNTLET ===
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(8, -4.5, 16, 9, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(24, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case WeaponType.ICE_AND_FIRE_DRAGON: {
      // === CETRO DUAL FOGO & GELO (DRAGÕES COMPANHEIROS) ===
      const pulse = 1 + Math.sin(time * 0.01) * 0.14;
      // Sleek obsidian-violet dragon crest handle
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(4, -2.6, 20, 5.2, 2);
      ctx.fill();
      ctx.stroke();

      // Left Fire Ruby + Right Ice Sapphire twin orbs orbiting crest tip (fast glow halos)
      ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
      ctx.beginPath();
      ctx.arc(23, -4.5, 4.4 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(23, -4.5, 2.8 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.arc(23, 4.5, 4.4 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(23, 4.5, 2.8 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Central Violet Dragon Core gem
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.arc(26, 0, 5.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5d0fe';
      ctx.beginPath();
      ctx.arc(26, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case WeaponType.VENOM_FRUIT: {
      // === AKUMA NO MI: FRUTA DO VENENO (DOKU DOKU NO MI) ===
      const pulse = 1 + Math.sin(time * 0.008) * 0.12;
      const hoverX = 20;
      const hoverY = 0;

      // Toxic aura halo behind fruit
      ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
      ctx.beginPath();
      ctx.arc(hoverX, hoverY, 10.5 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Gloved hand reaching / cradling the Devil Fruit
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.arc(13, 3.5, 4.2, 0, Math.PI * 2);
      ctx.arc(13, -3.5, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Green curly Devil Fruit stem
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hoverX - 2, hoverY - 6);
      ctx.quadraticCurveTo(hoverX + 1, hoverY - 11, hoverX + 4.5, hoverY - 8.5);
      ctx.stroke();

      // Purple Doku Doku no Mi fruit orb
      ctx.fillStyle = '#6b21a8';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hoverX, hoverY, 7.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Akuma no Mi swirl markings
      ctx.strokeStyle = '#f5d0fe';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.arc(hoverX - 2, hoverY - 1.5, 2.2, 0.2, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hoverX + 2.2, hoverY + 1.8, 2.0, Math.PI, Math.PI * 2.5);
      ctx.stroke();

      // Animated dripping venom drop at tip
      const dripOff = (Math.sin(time * 0.012) * 0.5 + 0.5) * 4.5;
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(hoverX + 5.5 + dripOff, hoverY + 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    default:
      // Clean fallback
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, -2.5, 18, 5);
      break;
  }

  ctx.restore();
}

/**
 * Render distinct projectile and bullet visuals according to weapon type!
 */
export function renderBulletVisual(
  ctx: CanvasRenderingContext2D,
  b: Bullet,
  camX: number,
  camY: number,
  time: number
) {
  const scrX = b.x - camX;
  const scrY = b.y - camY;

  // 0.1 COSMIC GALAXY BULLET (Ultra Starlight Core & Galaxy Arms)
  if (b.isCosmic) {
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(b.ownerAngle);

    const rot = time / 80;

    // Outer Cosmic Nebula Aura
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Dual Galaxy Spiral Arms
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 2; i++) {
      const armAng = rot + i * Math.PI;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius * 1.4, armAng, armAng + Math.PI * 0.8);
      ctx.stroke();
    }

    // Outer Starlight Halo Ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 1.2, 0, Math.PI * 2);
    ctx.stroke();

    // Spinning 4-Point Starlight Core
    ctx.save();
    ctx.rotate(rot * 2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(b.radius * 1.5, 0);
    ctx.lineTo(b.radius * 0.3, b.radius * 0.3);
    ctx.lineTo(0, b.radius * 1.5);
    ctx.lineTo(-b.radius * 0.3, b.radius * 0.3);
    ctx.lineTo(-b.radius * 1.5, 0);
    ctx.lineTo(-b.radius * 0.3, -b.radius * 0.3);
    ctx.lineTo(0, -b.radius * 1.5);
    ctx.lineTo(b.radius * 0.3, -b.radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
    return;
  }

  // 0.2 AIM-9X SIDEWINDER AIR-TO-AIR & STRIKE MISSILE (F-22 Raptor)
  if (b.isMissile) {
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(b.ownerAngle);

    // Rocket Solid-Fuel Flame Exhaust Tail with Mach Shockwaves
    const flameLen = 18 + Math.random() * 10;

    // Outer Azure Flame Halo
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.lineTo(-18 - flameLen, 0);
    ctx.lineTo(-14, 8);
    ctx.closePath();
    ctx.fill();

    // Outer Azure Flame Expansion
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(-14, -5.5);
    ctx.lineTo(-14 - flameLen, 0);
    ctx.lineTo(-14, 5.5);
    ctx.closePath();
    ctx.fill();

    // Inner White-Hot Supersonic Core Flame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-14, -3);
    ctx.lineTo(-14 - flameLen * 0.75, 0);
    ctx.lineTo(-14, 3);
    ctx.closePath();
    ctx.fill();

    // Mach Shock Diamond in Rocket Exhaust
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-18, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Aerodynamic Cylindrical Missile Fuselage (USAF Light Ghost Gray)
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(-14, -3.5, 26, 7);

    // Gold Warhead Ring & Brown Rocket Motor Band
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(2, -3.5, 3.5, 7);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, -3.5, 2.5, 7);

    // Infrared Glass Seeker Dome on Nose
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(12, -3.5);
    ctx.lineTo(19, 0);
    ctx.lineTo(12, 3.5);
    ctx.closePath();
    ctx.fill();
    // Glowing IR Eye reflection
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(16, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Rear Aft Cruciform Stabilizer Tail Fins
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.lineTo(-7, -3.5);
    ctx.lineTo(-14, -3.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, 8);
    ctx.lineTo(-7, 3.5);
    ctx.lineTo(-14, 3.5);
    ctx.closePath();
    ctx.fill();

    // Forward Steerable Titanium Guidance Canards
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(6, -7);
    ctx.lineTo(10, -3.5);
    ctx.lineTo(6, -3.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, 7);
    ctx.lineTo(10, 3.5);
    ctx.lineTo(6, 3.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    return;
  }

  // 0.3 STEALTH PRECISION JDAM BOMB (B-2 Spirit Stealth Bomber)
  if (b.isBomb) {
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(b.ownerAngle);

    // Dynamic Projected Ground Laser Targeting Reticle & Crosshairs
    const reticlePulse = 0.5 + Math.sin(time * 0.012) * 0.5;
    ctx.strokeStyle = `rgba(244, 63, 94, ${(0.45 + reticlePulse * 0.45).toFixed(2)})`;
    ctx.lineWidth = 1.6;

    // Expanding Ground Laser Ring
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair ticks
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(-24, 0);
    ctx.moveTo(24, 0);
    ctx.lineTo(30, 0);
    ctx.moveTo(0, -30);
    ctx.lineTo(0, -24);
    ctx.moveTo(0, 24);
    ctx.lineTo(0, 30);
    ctx.stroke();

    // Heavy Aerodynamic Stealth Bomb Body (Matte Carbon Obsidian)
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(15, 0); // Pointed armor-piercing penetrator nose
    ctx.lineTo(6, -6);
    ctx.lineTo(-12, -6);
    ctx.lineTo(-16, -2.5);
    ctx.lineTo(-16, 2.5);
    ctx.lineTo(-12, 6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Laser Guidance Inertial Stencil Bands
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-2, -5.5, 3.5, 11);

    // Blinking Crimson Guidance Sensor Nose LED
    const blink = Math.sin(time * 0.02) > 0;
    ctx.fillStyle = blink ? '#ffffff' : '#f43f5e';
    ctx.beginPath();
    ctx.arc(13, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Deployable GPS Grid Steering Lattice Tail Fins
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1;
    // Top grid fin
    ctx.beginPath();
    ctx.roundRect(-16, -11, 4.5, 6, 1);
    ctx.fill();
    ctx.stroke();
    // Bottom grid fin
    ctx.beginPath();
    ctx.roundRect(-16, 5, 4.5, 6, 1);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 0a. HOMING VOID LANCE (Mythic Void Monarch Drones)
  if (b.isVoidLance) {
    const moveAngle = (b.vx * b.vx + b.vy * b.vy) > 1 ? Math.atan2(b.vy, b.vx) : b.ownerAngle;
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(moveAngle);
    ctx.globalCompositeOperation = 'lighter';

    ctx.fillStyle = 'rgba(192, 132, 252, 0.55)';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-2, -5.5);
    ctx.lineTo(13, 0);
    ctx.lineTo(-2, 5.5);
    ctx.closePath();
    ctx.fill();

    // Hot white spear filament
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(11, 0);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 0a2. FRUTA DO VENENO — HYDRA VENOM DRAGON HEADS ([Q] / [1])
  if (b.isHydra) {
    const moveAngle = (b.vx * b.vx + b.vy * b.vy) > 1 ? Math.atan2(b.vy, b.vx) : b.ownerAngle;
    const isKinjite = b.color === '#f43f5e' || b.color === '#e11d48';
    const bodyCol = isKinjite ? '#be123c' : '#7e22ce';
    const edgeCol = isKinjite ? '#fb7185' : '#e879f9';
    const wakeCol = isKinjite ? 'rgba(244, 63, 94, 0.34)' : 'rgba(168, 85, 247, 0.34)';

    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(moveAngle);

    // Wavy liquid dragon neck segments trailing behind head
    const wave = Math.sin(time * 0.025 + b.distanceTraveled * 0.06);
    for (let s = 3; s >= 1; s--) {
      const sx = -s * 12;
      const sy = Math.sin(wave + s * 1.1) * (3 + s * 1.4);
      const sr = Math.max(4, b.radius * (0.9 - s * 0.16));
      ctx.fillStyle = wakeCol;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 1.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bodyCol;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer venomous aura around dragon head
    ctx.fillStyle = wakeCol;
    ctx.beginPath();
    ctx.ellipse(2, 0, b.radius * 1.8, b.radius * 1.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Swept Hydra Dragon Horns
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(-16, -13);
    ctx.moveTo(-4, 6);
    ctx.lineTo(-16, 13);
    ctx.stroke();

    // Sculpted Venom Serpent-Dragon Head with Fanged Snout
    ctx.fillStyle = bodyCol;
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.radius * 1.55, 0);
    ctx.lineTo(b.radius * 0.4, -b.radius * 0.85);
    ctx.lineTo(-b.radius * 0.9, -b.radius * 0.65);
    ctx.lineTo(-b.radius * 0.65, 0);
    ctx.lineTo(-b.radius * 0.9, b.radius * 0.65);
    ctx.lineTo(b.radius * 0.4, b.radius * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fierce Glowing Slit Eyes & Toxic Fangs
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(b.radius * 0.28, -b.radius * 0.36, 2.6, 0, Math.PI * 2);
    ctx.arc(b.radius * 0.28, b.radius * 0.36, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.radius * 0.95, 0, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // 0a3. FRUTA DO VENENO — CHLORO BALL ([E] / [2])
  if (b.isChloroBall) {
    const spin = time * 0.015;
    ctx.save();
    ctx.translate(scrX, scrY);

    ctx.fillStyle = 'rgba(132, 204, 22, 0.32)';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6b21a8';
    ctx.strokeStyle = '#a3e635';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pressurized gas swirl ribbons inside sphere
    ctx.strokeStyle = '#bef264';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.58, spin, spin + Math.PI * 1.15);
    ctx.stroke();

    ctx.fillStyle = '#ecfccb';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // 0a4. FRUTA DO VENENO — KINJITE VENOM DEMON WAVE (Transformed Primary)
  if (b.isVenomWave) {
    const moveAngle = (b.vx * b.vx + b.vy * b.vy) > 1 ? Math.atan2(b.vy, b.vx) : b.ownerAngle;
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(moveAngle);
    ctx.globalCompositeOperation = 'lighter';

    ctx.fillStyle = 'rgba(225, 29, 72, 0.42)';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 1.45, -Math.PI * 0.48, Math.PI * 0.48);
    ctx.quadraticCurveTo(b.radius * 0.4, 0, 0, -b.radius * 1.45);
    ctx.fill();

    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-b.radius * 0.35, 0, b.radius * 1.25, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();

    ctx.strokeStyle = '#fff1f2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-b.radius * 0.2, 0, b.radius * 1.1, -Math.PI * 0.34, Math.PI * 0.34);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 0a5. FRUTA DO VENENO — PRIMARY VENOM ORB
  if (b.isVenom) {
    ctx.save();
    ctx.translate(scrX, scrY);

    ctx.fillStyle = 'rgba(168, 85, 247, 0.32)';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 1.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9333ea';
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fdf4ff';
    ctx.beginPath();
    ctx.arc(b.radius * 0.2, -b.radius * 0.2, b.radius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // 0b. KINETIC SHRAPNEL SHARD (Doutrina de Estilhaços)
  if (b.isShrapnel) {
    const moveAngle = (b.vx * b.vx + b.vy * b.vy) > 1 ? Math.atan2(b.vy, b.vx) : b.ownerAngle;
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(moveAngle);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-7, -2.5);
    ctx.lineTo(8, 0);
    ctx.lineTo(-7, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-3, -1);
    ctx.lineTo(6, 0);
    ctx.lineTo(-3, 1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  // 0c. INTERCEPTOR / TROPER PLASMA ORBS (Fast, zero per-orb gradient allocation)
  if (b.isOrb) {
    const moveAngle = (b.vx * b.vx + b.vy * b.vy) > 1 ? Math.atan2(b.vy, b.vx) : b.ownerAngle;
    const orbColor = b.color || '#00f5d4';
    const orbR =
      b.weaponType === WeaponType.TROPER
        ? Math.max(2.9, b.radius || 3.6)
        : Math.max(4.5, b.radius || 5.5);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const wakeLen = orbR * 3.2;
    const wakeX = scrX - Math.cos(moveAngle) * wakeLen;
    const wakeY = scrY - Math.sin(moveAngle) * wakeLen;
    ctx.strokeStyle = orbColor;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = orbR * 1.15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(wakeX, wakeY);
    ctx.lineTo(scrX, scrY);
    ctx.stroke();

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = orbColor;
    ctx.beginPath();
    ctx.arc(scrX, scrY, orbR * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = orbColor;
    ctx.beginPath();
    ctx.arc(scrX, scrY, orbR * 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(scrX, scrY, orbR * 0.48, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // 1. ROCKET PROJECTILE
  if (b.isRocket) {
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(b.ownerAngle);

    // Rocket exhaust flame trail (pulsating orange/yellow)
    const flameLen = 14 + Math.sin(time / 20) * 4 + Math.random() * 4;
    ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
    ctx.beginPath();
    ctx.moveTo(-6, -6.5);
    ctx.lineTo(-9 - flameLen, 0);
    ctx.lineTo(-6, 6.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-6 - flameLen, 0);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();

    // Hot yellow inner flame
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(-6 - flameLen * 0.6, 0);
    ctx.lineTo(-6, 2);
    ctx.closePath();
    ctx.fill();

    // Rocket missile body
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6, -3.5, 14, 7);

    // Hazard yellow bands
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, -3.5, 3, 7);

    // Conical warhead
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(8, -3.5);
    ctx.lineTo(15, 0);
    ctx.lineTo(8, 3.5);
    ctx.closePath();
    ctx.fill();

    // Stabilizer fins
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-2, -3.5);
    ctx.lineTo(-6, -3.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, 6);
    ctx.lineTo(-2, 3.5);
    ctx.lineTo(-6, 3.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    return;
  }

  // 2. FLAMETHROWER HITBOX STREAK (actual continuous fire stream is rendered by renderFlamethrowerStream)
  if (b.isFlame) {
    const flameRatio = Math.max(0, Math.min(1, b.distanceTraveled / b.maxDistance));
    const fade = Math.max(0, 1 - flameRatio);
    if (fade <= 0.05 || (Math.floor(b.x + b.y) & 1) !== 0) return;

    const velAngle = Math.atan2(b.vy, b.vx);
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(velAngle);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(253, 224, 71, ${(0.55 * fade).toFixed(3)})`;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 3. LASER MINIGUN HYPER-BEAM / F-22 VULCAN SUPERSONIC TRACER
  if (b.isLaser) {
    const trailTime = 0.035;
    const trailX = b.x - b.vx * trailTime - camX;
    const trailY = b.y - b.vy * trailTime - camY;

    ctx.save();
    const laserColor = b.color || '#ff0055';
    ctx.lineCap = 'round';
    // Fast wide glow pass (replaces expensive shadowBlur)
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = laserColor;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(scrX, scrY);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = laserColor;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(scrX, scrY);
    ctx.stroke();

    // Hot white inner core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(scrX, scrY);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 4. RAYGUN / RAY RIFLE ENERGETIC BOLTS
  if (b.isRay) {
    ctx.save();
    ctx.translate(scrX, scrY);
    ctx.rotate(b.ownerAngle);

    // Outer translucent aura diamond
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(-b.radius * 2.1, 0);
    ctx.lineTo(0, -b.radius * 1.25);
    ctx.lineTo(b.radius * 2.1, 0);
    ctx.lineTo(0, b.radius * 1.25);
    ctx.closePath();
    ctx.fill();

    // Solid energy diamond bolt
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(-b.radius * 1.6, 0);
    ctx.lineTo(0, -b.radius * 0.8);
    ctx.lineTo(b.radius * 1.6, 0);
    ctx.lineTo(0, b.radius * 0.8);
    ctx.closePath();
    ctx.fill();

    // Core bright hot-white line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-b.radius, 0);
    ctx.lineTo(b.radius, 0);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 5. PLASMA ION SURGE
  if (b.color === '#38bdf8' && b.radius >= 8) {
    ctx.save();
    // Outer cyan plasma field
    ctx.fillStyle = 'rgba(56, 189, 248, 0.34)';
    ctx.beginPath();
    ctx.arc(scrX, scrY, b.radius * 1.65, 0, Math.PI * 2);
    ctx.fill();

    // Solid core
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(scrX, scrY, b.radius, 0, Math.PI * 2);
    ctx.fill();

    // Hot-white center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(scrX, scrY, b.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // 6. HIGH-CALIBER SNIPER / MAGNUM & STANDARD TRACER BULLETS
  const isSniper = b.weaponType === WeaponType.SNIPER;
  const isMagnum = b.weaponType === WeaponType.MAGNUM;
  const trailTime = isSniper ? 0.045 : isMagnum ? 0.032 : 0.024;
  const trailX = b.x - b.vx * trailTime - camX;
  const trailY = b.y - b.vy * trailTime - camY;

  ctx.save();
  ctx.lineCap = 'round';
  // Fast outer halo stroke
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = b.color;
  ctx.lineWidth = (isSniper ? b.radius * 3.4 : b.radius * 3.0);
  ctx.beginPath();
  ctx.moveTo(trailX, trailY);
  ctx.lineTo(scrX, scrY);
  ctx.stroke();

  // Tracer streak
  ctx.globalAlpha = 1;
  ctx.strokeStyle = b.color;
  ctx.lineWidth = isSniper ? b.radius * 2.1 : b.radius * 2;
  ctx.beginPath();
  ctx.moveTo(trailX, trailY);
  ctx.lineTo(scrX, scrY);
  ctx.stroke();

  // Inner hot-white supersonic core
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = isSniper ? Math.max(2.4, b.radius) : Math.max(1.5, b.radius * 0.8);
  ctx.beginPath();
  ctx.moveTo(trailX, trailY);
  ctx.lineTo(scrX, scrY);
  ctx.stroke();

  ctx.restore();
}

export interface FlameStreamPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  seed: number;
}

/**
 * Render a continuous, turbulent liquid-fire flamethrower ribbon along the active flame spine
 * (uses undulating tapered polygons with linear fire gradients — zero circular balls).
 */
export function renderFlamethrowerStream(
  ctx: CanvasRenderingContext2D,
  points: FlameStreamPoint[],
  camX: number,
  camY: number,
  time: number
) {
  if (!points || points.length < 2) return;

  // Group contiguous stream runs (split if gap > 75px from distinct trigger pulls)
  const segments: FlameStreamPoint[][] = [];
  let current: FlameStreamPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (Math.hypot(curr.x - prev.x, curr.y - prev.y) > 75) {
      if (current.length >= 2) segments.push(current);
      current = [curr];
    } else {
      current.push(curr);
    }
  }
  if (current.length >= 2) segments.push(current);

  if (segments.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const run of segments) {
    // run[0] = oldest (tip downrange), run[len-1] = newest (nozzle)
    const n = run.length;
    const tipPt = run[0];
    const nozzlePt = run[n - 1];

    const tipX = tipPt.x - camX;
    const tipY = tipPt.y - camY;
    const nozX = nozzlePt.x - camX;
    const nozY = nozzlePt.y - camY;

    if (Math.hypot(tipX - nozX, tipY - nozY) < 4) continue;

    // Build smooth left/right edges for outer, mid, and core fire ribbons
    const buildRibbon = (
      widthScale: number,
      waveAmp: number,
      waveFreq: number,
      startFadeIndex: number = 0
    ) => {
      const leftPts: { x: number; y: number }[] = [];
      const rightPts: { x: number; y: number }[] = [];

      for (let i = startFadeIndex; i < n; i++) {
        const pt = run[i];
        const ageRatio = Math.max(0, Math.min(1, pt.age / Math.max(0.01, pt.maxAge)));
        // ageRatio: 0 = nozzle, 1 = tip
        const px = pt.x - camX;
        const py = pt.y - camY;

        // Tangent direction along the flame stream
        const prevPt = run[Math.max(0, i - 1)];
        const nextPt = run[Math.min(n - 1, i + 1)];
        let tx = prevPt.x - nextPt.x;
        let ty = prevPt.y - nextPt.y;
        const tLen = Math.hypot(tx, ty) || 1;
        tx /= tLen;
        ty /= tLen;
        const nx = -ty;
        const ny = tx;

        // Tapered cone silhouette: tight at nozzle, swells in mid-plume, narrows into jagged tip
        const envelope =
          ageRatio < 0.72
            ? 0.22 + Math.pow(ageRatio / 0.72, 0.75) * 0.95
            : Math.max(0.05, 1.17 * (1 - (ageRatio - 0.72) / 0.28));

        const flicker =
          Math.sin(time * 0.036 - ageRatio * waveFreq + pt.seed) *
          waveAmp *
          Math.min(1, ageRatio * 1.4);
        const halfW = Math.max(1.5, (3.2 + 23 * envelope) * widthScale + flicker * 0.45);
        const lateralWobble =
          Math.sin(time * 0.028 - ageRatio * (waveFreq * 0.8) + pt.seed * 2.1) *
          waveAmp *
          ageRatio;

        leftPts.push({
          x: px + nx * (halfW + lateralWobble),
          y: py + ny * (halfW + lateralWobble),
        });
        rightPts.push({
          x: px - nx * (halfW - lateralWobble),
          y: py - ny * (halfW - lateralWobble),
        });
      }

      if (leftPts.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(leftPts[0].x, leftPts[0].y);
      for (let i = 1; i < leftPts.length; i++) {
        const midX = (leftPts[i - 1].x + leftPts[i].x) * 0.5;
        const midY = (leftPts[i - 1].y + leftPts[i].y) * 0.5;
        ctx.quadraticCurveTo(leftPts[i - 1].x, leftPts[i - 1].y, midX, midY);
      }
      const lastIdx = leftPts.length - 1;
      ctx.lineTo(leftPts[lastIdx].x, leftPts[lastIdx].y);
      ctx.lineTo(rightPts[lastIdx].x, rightPts[lastIdx].y);
      for (let i = lastIdx - 1; i >= 0; i--) {
        const midX = (rightPts[i + 1].x + rightPts[i].x) * 0.5;
        const midY = (rightPts[i + 1].y + rightPts[i].y) * 0.5;
        ctx.quadraticCurveTo(rightPts[i + 1].x, rightPts[i + 1].y, midX, midY);
      }
      ctx.lineTo(rightPts[0].x, rightPts[0].y);
      ctx.closePath();
    };

    // Layer 1: Outer crimson-orange roaring liquid flame envelope with jagged flame tongues
    const outerGrad = ctx.createLinearGradient(nozX, nozY, tipX, tipY);
    outerGrad.addColorStop(0, 'rgba(255, 120, 20, 0.92)');
    outerGrad.addColorStop(0.42, 'rgba(249, 115, 22, 0.72)');
    outerGrad.addColorStop(0.78, 'rgba(220, 38, 38, 0.36)');
    outerGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
    buildRibbon(1.08, 9.5, 12);
    ctx.fillStyle = outerGrad;
    ctx.fill();

    // Layer 2: Inner bright orange-gold turbulent sheet
    const midGrad = ctx.createLinearGradient(nozX, nozY, tipX, tipY);
    midGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    midGrad.addColorStop(0.32, 'rgba(251, 146, 60, 0.82)');
    midGrad.addColorStop(0.72, 'rgba(234, 88, 12, 0.38)');
    midGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    buildRibbon(0.66, 6.5, 15);
    ctx.fillStyle = midGrad;
    ctx.fill();

    // Layer 3: Blinding white-yellow pressurized nozzle ignition jet (hottest near barrel)
    const startHotIdx = Math.max(0, Math.floor(n * 0.35));
    if (n - startHotIdx >= 2) {
      const hotOrigin = run[startHotIdx];
      const hotGrad = ctx.createLinearGradient(
        nozX,
        nozY,
        hotOrigin.x - camX,
        hotOrigin.y - camY
      );
      hotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      hotGrad.addColorStop(0.24, 'rgba(254, 249, 195, 0.88)');
      hotGrad.addColorStop(0.65, 'rgba(251, 191, 36, 0.45)');
      hotGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      buildRibbon(0.34, 3.2, 17, startHotIdx);
      ctx.fillStyle = hotGrad;
      ctx.fill();
    }

    // Layer 3b: Blue-cyan high-pressure gas pilot root right out of nozzle
    const startPilotIdx = Math.max(0, Math.floor(n * 0.72));
    if (n - startPilotIdx >= 2) {
      const pilotEnd = run[startPilotIdx];
      const pilotGrad = ctx.createLinearGradient(
        nozX,
        nozY,
        pilotEnd.x - camX,
        pilotEnd.y - camY
      );
      pilotGrad.addColorStop(0, 'rgba(186, 230, 253, 0.95)');
      pilotGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.55)');
      pilotGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      buildRibbon(0.2, 1.4, 20, startPilotIdx);
      ctx.fillStyle = pilotGrad;
      ctx.fill();
    }

    // Layer 4: Internal high-velocity liquid fuel streaks inside the jet
    ctx.lineCap = 'round';
    for (let s = 0; s < Math.min(5, n - 1); s++) {
      const idx = Math.min(n - 2, Math.floor((s / 5) * (n - 1)));
      const pA = run[idx];
      const pB = run[idx + 1];
      const lifeRatio = 1 - pA.age / Math.max(0.01, pA.maxAge);
      if (lifeRatio <= 0.08) continue;
      const ax = pA.x - camX;
      const ay = pA.y - camY;
      const bx = pB.x - camX;
      const by = pB.y - camY;
      const ang = Math.atan2(ay - by, ax - bx);
      const streakLen = 14 + lifeRatio * 18;
      const sGrad = ctx.createLinearGradient(
        ax,
        ay,
        ax + Math.cos(ang) * streakLen,
        ay + Math.sin(ang) * streakLen
      );
      sGrad.addColorStop(0, `rgba(254, 249, 195, ${(0.72 * lifeRatio).toFixed(3)})`);
      sGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.strokeStyle = sGrad;
      ctx.lineWidth = 2.2 * lifeRatio;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + Math.cos(ang) * streakLen, ay + Math.sin(ang) * streakLen);
      ctx.stroke();
    }

    // Layer 5: Sharp tapered detached flame tongues whipping around the plume (non-circular)
    for (let t = 0; t < Math.min(6, Math.floor(n / 2)); t++) {
      const srcIdx = Math.min(n - 1, t * 2);
      const sp = run[srcIdx];
      const spRatio = 1 - sp.age / Math.max(0.01, sp.maxAge);
      if (spRatio <= 0.06) continue;
      const sx = sp.x - camX;
      const sy = sp.y - camY;
      const fAng = Math.atan2(sp.vy, sp.vx) + Math.sin(time * 0.032 + t * 2.1 + sp.seed) * 0.44;
      const perp = fAng + Math.PI / 2;
      const len = 20 + (t % 3) * 12;
      const baseHalf = 3.2 * spRatio;

      const tipLX = sx + Math.cos(fAng) * len;
      const tipLY = sy + Math.sin(fAng) * len;
      const midLX = sx + Math.cos(fAng) * (len * 0.45) + Math.cos(perp) * baseHalf * 1.4;
      const midLY = sy + Math.sin(fAng) * (len * 0.45) + Math.sin(perp) * baseHalf * 1.4;

      const lickGrad = ctx.createLinearGradient(sx, sy, tipLX, tipLY);
      lickGrad.addColorStop(0, `rgba(253, 186, 116, ${(0.65 * spRatio).toFixed(3)})`);
      lickGrad.addColorStop(0.5, `rgba(249, 115, 22, ${(0.48 * spRatio).toFixed(3)})`);
      lickGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');

      ctx.fillStyle = lickGrad;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(perp) * baseHalf, sy + Math.sin(perp) * baseHalf);
      ctx.quadraticCurveTo(midLX, midLY, tipLX, tipLY);
      ctx.quadraticCurveTo(
        sx + Math.cos(fAng) * (len * 0.4) - Math.cos(perp) * baseHalf * 0.8,
        sy + Math.sin(fAng) * (len * 0.4) - Math.sin(perp) * baseHalf * 0.8,
        sx - Math.cos(perp) * baseHalf,
        sy - Math.sin(perp) * baseHalf
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

export interface DestructorBlasterGeometry {
  leftPivotX: number;
  leftPivotY: number;
  leftAngle: number;
  leftMuzzleX: number;
  leftMuzzleY: number;
  rightPivotX: number;
  rightPivotY: number;
  rightAngle: number;
  rightMuzzleX: number;
  rightMuzzleY: number;
}

const MAX_DESTRUCTOR_GIMBAL = Math.PI / 6; // 30 degrees on each side

function normalizeAngle(a: number): number {
  let ang = a;
  while (ang > Math.PI) ang -= Math.PI * 2;
  while (ang < -Math.PI) ang += Math.PI * 2;
  return ang;
}

/**
 * Compute world-space wing blaster pivots, mouse-aimed angles (clamped within ±30° of ship hull),
 * and blaster muzzle coordinates for both rendering and continuous twin laser raycasts.
 */
export function getDestructorBlastersWorld(
  shipX: number,
  shipY: number,
  shipAngle: number,
  targetWorldX: number,
  targetWorldY: number
): DestructorBlasterGeometry {
  const cosA = Math.cos(shipAngle);
  const sinA = Math.sin(shipAngle);

  // Wing mount offsets relative to ship center
  const mountX = 4;
  const mountY = 18;
  const muzzleLen = 20;

  const leftPivotX = shipX + cosA * mountX - sinA * -mountY;
  const leftPivotY = shipY + sinA * mountX + cosA * -mountY;
  const rightPivotX = shipX + cosA * mountX - sinA * mountY;
  const rightPivotY = shipY + sinA * mountX + cosA * mountY;

  const distToCursor = Math.hypot(targetWorldX - shipX, targetWorldY - shipY);
  const centerAimAngle =
    distToCursor > 2 ? Math.atan2(targetWorldY - shipY, targetWorldX - shipX) : shipAngle;

  // Project cursor slightly forward if very close to ship so twin blasters stay cleanly aimed
  const effTargetX =
    distToCursor < 110 ? shipX + Math.cos(centerAimAngle) * 140 : targetWorldX;
  const effTargetY =
    distToCursor < 110 ? shipY + Math.sin(centerAimAngle) * 140 : targetWorldY;

  const rawLeft = Math.atan2(effTargetY - leftPivotY, effTargetX - leftPivotX);
  const rawRight = Math.atan2(effTargetY - rightPivotY, effTargetX - rightPivotX);

  const clampRelative = (raw: number) => {
    const diff = Math.max(-MAX_DESTRUCTOR_GIMBAL, Math.min(MAX_DESTRUCTOR_GIMBAL, normalizeAngle(raw - shipAngle)));
    return shipAngle + diff;
  };

  const leftAngle = clampRelative(rawLeft);
  const rightAngle = clampRelative(rawRight);

  return {
    leftPivotX,
    leftPivotY,
    leftAngle,
    leftMuzzleX: leftPivotX + Math.cos(leftAngle) * muzzleLen,
    leftMuzzleY: leftPivotY + Math.sin(leftAngle) * muzzleLen,
    rightPivotX,
    rightPivotY,
    rightAngle,
    rightMuzzleX: rightPivotX + Math.cos(rightAngle) * muzzleLen,
    rightMuzzleY: rightPivotY + Math.sin(rightAngle) * muzzleLen,
  };
}

/**
 * Render the Destructor Spaceship transformation, twin ±30° gimbal blasters,
 * and the fast particle-accelerator spinning spheres + trails (during 3s Shift charge & Warp Mode).
 */
export function renderDestructorShip(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  shipAngle: number,
  leftBlasterWorldAngle: number,
  rightBlasterWorldAngle: number,
  isMoving: boolean,
  isFiring: boolean,
  warpChargeProgress: number,
  warpActive: boolean,
  warpRemainingRatio: number,
  orbitAngle: number,
  time: number,
  shield: number = 0
) {
  const chargeP = Math.max(0, Math.min(1, warpChargeProgress));
  const accelIntensity = warpActive ? 1.0 : chargeP;
  const pulse = 0.8 + Math.sin(time * 0.02) * 0.2;

  // 1. Ground Drop Shadow beneath hovering starship
  ctx.save();
  ctx.translate(screenX + 8, screenY + 12);
  ctx.rotate(shipAngle);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(-10, -25);
  ctx.lineTo(-22, -16);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-22, 16);
  ctx.lineTo(-10, 25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. PARTICLE ACCELERATOR ORBITAL SPHERES & MULTI-DIRECTIONAL TRAILS (3s Shift charge & Warp Mode)
  if (accelIntensity > 0.01) {
    renderShipWarpAccelerator(
      ctx,
      screenX,
      screenY,
      chargeP,
      warpActive,
      warpRemainingRatio,
      orbitAngle,
      time,
      '#22d3ee',
      '#e879f9'
    );
  }

  // 3. DESTRUCTOR SPACESHIP CHASSIS & TWIN GIMBAL BLASTERS
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(shipAngle);

  // Subtle holographic ±30° gimbal indicator ahead of ship
  ctx.save();
  ctx.strokeStyle = warpActive ? 'rgba(232, 121, 249, 0.25)' : 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 1.1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, 38, -MAX_DESTRUCTOR_GIMBAL, MAX_DESTRUCTOR_GIMBAL);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(22, -Math.sin(MAX_DESTRUCTOR_GIMBAL) * 22);
  ctx.lineTo(39, -Math.sin(MAX_DESTRUCTOR_GIMBAL) * 39);
  ctx.moveTo(22, Math.sin(MAX_DESTRUCTOR_GIMBAL) * 22);
  ctx.lineTo(39, Math.sin(MAX_DESTRUCTOR_GIMBAL) * 39);
  ctx.stroke();
  ctx.restore();

  // Rear Twin Hyper-Thruster Exhaust Flames
  const baseThrust = warpActive ? 42 : isMoving ? 24 : 12;
  const thrustLen = baseThrust + Math.random() * (warpActive ? 14 : 6);
  [-8.5, 8.5].forEach((ty) => {
    const tGrad = ctx.createLinearGradient(-16, ty, -16 - thrustLen, ty);
    tGrad.addColorStop(0, '#ffffff');
    tGrad.addColorStop(0.28, warpActive ? '#e879f9' : '#22d3ee');
    tGrad.addColorStop(0.68, warpActive ? '#6366f1' : '#0284c7');
    tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.moveTo(-15, ty - (warpActive ? 5.2 : 3.6));
    ctx.lineTo(-16 - thrustLen, ty);
    ctx.lineTo(-15, ty + (warpActive ? 5.2 : 3.6));
    ctx.closePath();
    ctx.fill();
  });

  // Main Swept Delta Wings & Armored Hull
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = warpActive ? '#e879f9' : '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, 0); // Sharp forward nose prow
  ctx.lineTo(10, -10);
  ctx.lineTo(6, -24); // Left outer wingtip
  ctx.lineTo(-14, -24);
  ctx.lineTo(-20, -14);
  ctx.lineTo(-15, -6);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-15, 6);
  ctx.lineTo(-20, 14);
  ctx.lineTo(-14, 24); // Right outer wingtip
  ctx.lineTo(6, 24);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Titanium Dorsal Armor Spine & Energy Conduits
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = warpActive ? '#c084fc' : '#0284c7';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(4, -8);
  ctx.lineTo(-14, -8);
  ctx.lineTo(-14, 8);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Wing Plasma Channels
  ctx.strokeStyle = warpActive ? '#f0abfc' : '#00f5d4';
  ctx.lineWidth = 1.6;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(-12, side * 12);
    ctx.lineTo(2, side * 18);
    ctx.lineTo(6, side * 12);
    ctx.stroke();
  });

  // Forward Cockpit Canopy (sleek armored crystal visor)
  const canopyGrad = ctx.createLinearGradient(0, -4, 15, 4);
  canopyGrad.addColorStop(0, '#0284c7');
  canopyGrad.addColorStop(0.55, '#7dd3fc');
  canopyGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = canopyGrad;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(5, -4.5);
  ctx.lineTo(-2, -3.5);
  ctx.lineTo(-2, 3.5);
  ctx.lineTo(5, 4.5);
  ctx.closePath();
  ctx.fill();

  // Dorsal Particle Reactor Core
  ctx.fillStyle = warpActive ? '#e879f9' : '#00f5d4';
  ctx.beginPath();
  ctx.arc(-8, 0, 4.2 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-8, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // TWIN WING-MOUNTED ARTICULATED BLASTERS (each rotated cleanly toward mouse within ±30°)
  const drawBlasterTurret = (mountY: number, worldAngle: number) => {
    const localRot = normalizeAngle(worldAngle - shipAngle);
    ctx.save();
    ctx.translate(4, mountY);
    ctx.rotate(localRot);

    // Turret swivel base
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = warpActive ? '#e879f9' : '#38bdf8';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-6, -4.5, 13, 9, 2.5);
    ctx.fill();
    ctx.stroke();

    // Twin Parallel Laser Accelerator Rails
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, -3.5, 16, 2.4);
    ctx.fillRect(4, 1.1, 16, 2.4);

    // Glowing Laser Conduit Core between rails
    ctx.fillStyle = isFiring ? '#ffffff' : warpActive ? '#e879f9' : '#00f5d4';
    ctx.fillRect(4, -1.0, 14, 2.0);

    // Muzzle focusing emitter tip
    ctx.fillStyle = isFiring ? '#fef08a' : '#38bdf8';
    ctx.fillRect(18, -2.5, 3, 5);

    if (isFiring) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const mGrad = ctx.createRadialGradient(20, 0, 1, 20, 0, 13);
      mGrad.addColorStop(0, '#ffffff');
      mGrad.addColorStop(0.45, warpActive ? '#e879f9' : '#22d3ee');
      mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.arc(20, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  drawBlasterTurret(-18, leftBlasterWorldAngle);
  drawBlasterTurret(18, rightBlasterWorldAngle);

  ctx.restore(); // end ship hull transform

  // 4. Tactical Shield Ring around Destructor if active
  if (shield > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
    ctx.lineWidth = 2.6 + Math.sin(time / 150) * 1.0;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Shared Particle Accelerator Warp visual with tilted precessing orbits and
 * multi-directional divergent plasma trails shooting/curving in varied directions.
 */
function renderShipWarpAccelerator(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  chargeP: number,
  warpActive: boolean,
  warpRemainingRatio: number,
  orbitAngle: number,
  time: number,
  primaryHex: string,
  warpHex: string,
  redElectricityIntensity: number = 0,
  radiusScale: number = 1.0
) {
  const accelIntensity = warpActive ? 1.0 : chargeP;
  ctx.save();
  ctx.translate(screenX, screenY);

  const ringRadiusOuter = (warpActive ? 50 : 58 - chargeP * 10) * radiusScale;
  const ringRadiusInner = (warpActive ? 36 : 42 - chargeP * 6) * radiusScale;

  // Magnetic containment gauge ring
  ctx.strokeStyle = redElectricityIntensity > 0.05
    ? 'rgba(239, 68, 68, 0.35)'
    : warpActive
      ? 'rgba(192, 132, 252, 0.28)'
      : 'rgba(56, 189, 248, 0.24)';
  ctx.lineWidth = 1.8 * radiusScale;
  ctx.beginPath();
  ctx.arc(0, 0, ringRadiusOuter, 0, Math.PI * 2);
  ctx.stroke();

  const gaugeRatio = warpActive ? Math.max(0, Math.min(1, warpRemainingRatio)) : chargeP;
  ctx.strokeStyle = warpActive ? warpHex : chargeP > 0.72 ? '#fef08a' : primaryHex;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(0, 0, ringRadiusOuter, -Math.PI / 2, -Math.PI / 2 + gaugeRatio * Math.PI * 2);
  ctx.stroke();

  ctx.globalCompositeOperation = 'lighter';

  // Helper to get tilted elliptical orbit point so different spheres fly across varied planes
  const getTiltedOrbitPt = (angle: number, rx: number, ry: number, planeTilt: number) => {
    const lx = Math.cos(angle) * rx;
    const ly = Math.sin(angle) * ry;
    const ct = Math.cos(planeTilt);
    const st = Math.sin(planeTilt);
    return {
      x: lx * ct - ly * st,
      y: lx * st + ly * ct,
    };
  };

  // Helper to draw multi-directional trails branching off a warp sphere in different angles
  const drawDivergentSphereTrails = (
    sx: number,
    sy: number,
    baseOrbitA: number,
    planeTilt: number,
    rx: number,
    ry: number,
    dirSign: number,
    sphereIdx: number,
    colHex: string
  ) => {
    // 1) Primary curved trail along its tilted precessing plane
    const segs = 10;
    const trailSpan = 0.7 + accelIntensity * 1.35;
    for (let s = 0; s < segs; s++) {
      const f0 = s / segs;
      const f1 = (s + 1) / segs;
      const a0 = baseOrbitA - dirSign * trailSpan * (1 - f0);
      const a1 = baseOrbitA - dirSign * trailSpan * (1 - f1);
      const p0 = getTiltedOrbitPt(a0, rx, ry, planeTilt);
      const p1 = getTiltedOrbitPt(a1, rx, ry, planeTilt);
      const alpha = f1 * (0.3 + accelIntensity * 0.55);

      ctx.strokeStyle = colHex;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = Math.max(1.1, (2.0 + accelIntensity * 3.8) * f1);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    // 2) Secondary divergent trails shooting/curving in OTHER directions (radial flare, diagonal whip, cross-spiral)
    const dirOffsets = [
      0.55 + Math.sin(time * 0.014 + sphereIdx * 2.1) * 0.45, // outward diagonal flare
      -0.85 + Math.cos(time * 0.017 + sphereIdx * 1.4) * 0.45, // inward/cross-axis whip
      Math.PI * 0.38 * (sphereIdx % 2 === 0 ? 1 : -1), // steep cross-directional jet
    ];

    for (let d = 0; d < dirOffsets.length; d++) {
      const tangentA = baseOrbitA + dirSign * Math.PI * 0.5 + planeTilt;
      const shootA = tangentA + Math.PI + dirOffsets[d];
      const streamLen = (24 + d * 10) * (0.45 + accelIntensity * 0.85);
      const curl = Math.sin(time * 0.025 + sphereIdx + d * 1.9) * 14 * accelIntensity;
      const midX = sx + Math.cos(shootA) * (streamLen * 0.52) - Math.sin(shootA) * curl;
      const midY = sy + Math.sin(shootA) * (streamLen * 0.52) + Math.cos(shootA) * curl;
      const endX = sx + Math.cos(shootA + dirOffsets[d] * 0.25) * streamLen;
      const endY = sy + Math.sin(shootA + dirOffsets[d] * 0.25) * streamLen;

      const grad = ctx.createLinearGradient(sx, sy, endX, endY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, colHex);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.globalAlpha = 0.5 + accelIntensity * 0.45;
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1.2, (2.6 - d * 0.45) * (0.65 + accelIntensity * 0.6));
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  // Outer multi-plane spheres (6 spheres across tilted precessing orbits)
  const outerCount = 6;
  for (let i = 0; i < outerCount; i++) {
    const planeTilt = (i * Math.PI) / 3 + Math.sin(time * 0.002 + i) * 0.28;
    const rx = ringRadiusOuter * (1.02 + (i % 2) * 0.08);
    const ry = ringRadiusOuter * (0.68 + ((i + 1) % 3) * 0.12);
    const a = orbitAngle * (i % 2 === 0 ? 1 : -1.08) + (i * Math.PI * 2) / outerCount;
    const dirSign = i % 2 === 0 ? 1 : -1;
    const pos = getTiltedOrbitPt(a, rx, ry, planeTilt);
    const sphereCol = warpActive ? (i % 2 === 0 ? warpHex : primaryHex) : primaryHex;

    drawDivergentSphereTrails(pos.x, pos.y, a, planeTilt, rx, ry, dirSign, i, sphereCol);

    const orbR = 3.6 + accelIntensity * 3.0;
    ctx.fillStyle = sphereCol;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, orbR * 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const sGrad = ctx.createRadialGradient(pos.x, pos.y, 0.4, pos.x, pos.y, orbR);
    sGrad.addColorStop(0, '#ffffff');
    sGrad.addColorStop(0.5, '#fef08a');
    sGrad.addColorStop(1, sphereCol);
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, orbR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner counter-spinning spheres with cross-axis divergent trails
  const innerCount = 4;
  for (let i = 0; i < innerCount; i++) {
    const planeTilt = -0.4 + (i * Math.PI) / 4;
    const rx = ringRadiusInner * 1.05;
    const ry = ringRadiusInner * 0.65;
    const a = -orbitAngle * 1.38 + (i * Math.PI * 2) / innerCount;
    const pos = getTiltedOrbitPt(a, rx, ry, planeTilt);
    const innerCol = warpActive ? '#facc15' : '#00f5d4';

    drawDivergentSphereTrails(pos.x, pos.y, a, planeTilt, rx, ry, -1, i + 10, innerCol);

    const orbR = 2.8 + accelIntensity * 2.2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, orbR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crackling Crimson/Red Electricity Arcs radiating around the ship during Fury charge & Modo Fúria
  if (redElectricityIntensity > 0.04) {
    const boltCount = warpActive ? 9 : Math.max(2, Math.floor(redElectricityIntensity * 7));
    for (let bi = 0; bi < boltCount; bi++) {
      const startA = Math.random() * Math.PI * 2;
      const startR = (10 + Math.random() * 14) * radiusScale;
      const endR = ringRadiusOuter * (0.9 + Math.random() * 0.65);
      const endA = startA + (Math.random() - 0.5) * 0.9;
      let cx = Math.cos(startA) * startR;
      let cy = Math.sin(startA) * startR;
      const tx = Math.cos(endA) * endR;
      const ty = Math.sin(endA) * endR;

      ctx.strokeStyle = bi % 3 === 0 ? '#fca5a5' : '#ef4444';
      ctx.lineWidth = warpActive ? 2.4 : 1.6;
      ctx.globalAlpha = 0.55 + redElectricityIntensity * 0.45;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const segs = 4;
      for (let s = 1; s < segs; s++) {
        const f = s / segs;
        cx = cx + (tx - cx) * (1 / (segs - s + 1)) + (Math.random() - 0.5) * 18 * radiusScale;
        cy = cy + (ty - cy) * (1 / (segs - s + 1)) + (Math.random() - 0.5) * 18 * radiusScale;
        if (f > 0) ctx.lineTo(cx, cy);
      }
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // White-hot electric core on strongest bolts
      if (warpActive && bi % 2 === 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

/**
 * Compute world-space long-wingtip blaster pivots, ±30° gimbal-clamped angles,
 * and muzzle coordinates for the Nave Interceptor.
 */
export function getInterceptorBlastersWorld(
  shipX: number,
  shipY: number,
  shipAngle: number,
  targetWorldX: number,
  targetWorldY: number
): DestructorBlasterGeometry {
  const cosA = Math.cos(shipAngle);
  const sinA = Math.sin(shipAngle);

  // Long swept wings: blasters mounted right at the extreme wingtips (±34px lateral span)
  const mountX = -6;
  const mountY = 34;
  const muzzleLen = 17;

  const leftPivotX = shipX + cosA * mountX - sinA * -mountY;
  const leftPivotY = shipY + sinA * mountX + cosA * -mountY;
  const rightPivotX = shipX + cosA * mountX - sinA * mountY;
  const rightPivotY = shipY + sinA * mountX + cosA * mountY;

  const distToCursor = Math.hypot(targetWorldX - shipX, targetWorldY - shipY);
  const centerAimAngle =
    distToCursor > 2 ? Math.atan2(targetWorldY - shipY, targetWorldX - shipX) : shipAngle;

  const effTargetX =
    distToCursor < 110 ? shipX + Math.cos(centerAimAngle) * 140 : targetWorldX;
  const effTargetY =
    distToCursor < 110 ? shipY + Math.sin(centerAimAngle) * 140 : targetWorldY;

  const rawLeft = Math.atan2(effTargetY - leftPivotY, effTargetX - leftPivotX);
  const rawRight = Math.atan2(effTargetY - rightPivotY, effTargetX - rightPivotX);

  const clampRelative = (raw: number) => {
    const diff = Math.max(-MAX_DESTRUCTOR_GIMBAL, Math.min(MAX_DESTRUCTOR_GIMBAL, normalizeAngle(raw - shipAngle)));
    return shipAngle + diff;
  };

  const leftAngle = clampRelative(rawLeft);
  const rightAngle = clampRelative(rawRight);

  return {
    leftPivotX,
    leftPivotY,
    leftAngle,
    leftMuzzleX: leftPivotX + Math.cos(leftAngle) * muzzleLen,
    leftMuzzleY: leftPivotY + Math.sin(leftAngle) * muzzleLen,
    rightPivotX,
    rightPivotY,
    rightAngle,
    rightMuzzleX: rightPivotX + Math.cos(rightAngle) * muzzleLen,
    rightMuzzleY: rightPivotY + Math.sin(rightAngle) * muzzleLen,
  };
}

/**
 * Render the Nave Interceptor transformation:
 * Sleek long-winged starfighter, twin wingtip rapid-orb blasters, RCS turning puffs,
 * multi-directional Warp Particle Accelerator spheres, and shield ring.
 */
export function renderInterceptorShip(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  shipAngle: number,
  leftBlasterWorldAngle: number,
  rightBlasterWorldAngle: number,
  isMoving: boolean,
  isFiring: boolean,
  warpChargeProgress: number,
  warpActive: boolean,
  warpRemainingRatio: number,
  orbitAngle: number,
  time: number,
  shield: number = 0,
  angularVel: number = 0
) {
  const chargeP = Math.max(0, Math.min(1, warpChargeProgress));
  const accelIntensity = warpActive ? 1.0 : chargeP;
  const pulse = 0.8 + Math.sin(time * 0.024) * 0.2;

  // 1. Ground Drop Shadow beneath hovering long-wing starfighter
  ctx.save();
  ctx.translate(screenX + 8, screenY + 12);
  ctx.rotate(shipAngle);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.beginPath();
  ctx.moveTo(32, 0);
  ctx.lineTo(6, -9);
  ctx.lineTo(-4, -36);
  ctx.lineTo(-16, -36);
  ctx.lineTo(-11, -12);
  ctx.lineTo(-20, -7);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-20, 7);
  ctx.lineTo(-11, 12);
  ctx.lineTo(-16, 36);
  ctx.lineTo(-4, 36);
  ctx.lineTo(6, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. WARP PARTICLE ACCELERATOR SPHERES & MULTI-DIRECTIONAL TRAILS
  if (accelIntensity > 0.01) {
    renderShipWarpAccelerator(
      ctx,
      screenX,
      screenY,
      chargeP,
      warpActive,
      warpRemainingRatio,
      orbitAngle,
      time,
      '#00f5d4',
      '#e879f9'
    );
  }

  // 3. INTERCEPTOR LONG-WING STARFIGHTER HULL & WINGTIP ORB BLASTERS
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(shipAngle);

  // Subtle ±30° gimbal indicator ahead of ship
  ctx.save();
  ctx.strokeStyle = warpActive ? 'rgba(232, 121, 249, 0.25)' : 'rgba(16, 185, 129, 0.22)';
  ctx.lineWidth = 1.1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, 42, -MAX_DESTRUCTOR_GIMBAL, MAX_DESTRUCTOR_GIMBAL);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // RCS Attitude Thruster Puffs when actively banking/turning
  if (Math.abs(angularVel) > 0.4) {
    const turnSide = angularVel > 0 ? -1 : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(0, 245, 212, 0.65)';
    ctx.beginPath();
    ctx.moveTo(16, turnSide * 5);
    ctx.lineTo(13, turnSide * (14 + Math.random() * 6));
    ctx.lineTo(19, turnSide * 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Rear Twin Hyper-Thruster Exhaust Flames
  const baseThrust = warpActive ? 44 : isMoving ? 26 : 13;
  const thrustLen = baseThrust + Math.random() * (warpActive ? 14 : 6);
  [-9, 9].forEach((ty) => {
    const tGrad = ctx.createLinearGradient(-16, ty, -16 - thrustLen, ty);
    tGrad.addColorStop(0, '#ffffff');
    tGrad.addColorStop(0.28, warpActive ? '#e879f9' : '#00f5d4');
    tGrad.addColorStop(0.68, warpActive ? '#8b5cf6' : '#059669');
    tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.moveTo(-15, ty - (warpActive ? 5.0 : 3.4));
    ctx.lineTo(-16 - thrustLen, ty);
    ctx.lineTo(-15, ty + (warpActive ? 5.0 : 3.4));
    ctx.closePath();
    ctx.fill();
  });

  // Long Swept Aerodynamic Wings + Needle Fuselage
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = warpActive ? '#e879f9' : '#34d399';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 0); // Needle nose prow
  ctx.lineTo(14, -6);
  ctx.lineTo(8, -12);
  ctx.lineTo(12, -16); // Forward canard fin
  ctx.lineTo(4, -12);
  ctx.lineTo(-2, -35); // Left long wing leading edge
  ctx.lineTo(-14, -35); // Left wingtip mount
  ctx.lineTo(-10, -13);
  ctx.lineTo(-19, -9);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-19, 9);
  ctx.lineTo(-10, 13);
  ctx.lineTo(-14, 35); // Right wingtip mount
  ctx.lineTo(-2, 35); // Right long wing leading edge
  ctx.lineTo(4, 12);
  ctx.lineTo(12, 16); // Right forward canard fin
  ctx.lineTo(8, 12);
  ctx.lineTo(14, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Armor Spine
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = warpActive ? '#c084fc' : '#059669';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(25, 0);
  ctx.lineTo(6, -6);
  ctx.lineTo(-14, -7);
  ctx.lineTo(-14, 7);
  ctx.lineTo(6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Long-Wing Energy Conduits feeding wingtip blasters
  ctx.strokeStyle = warpActive ? '#f0abfc' : '#00f5d4';
  ctx.lineWidth = 1.8;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(-6, side * 8);
    ctx.lineTo(-7, side * 32);
    ctx.stroke();
  });

  // Sleek Interceptor Cockpit Canopy
  const canopyGrad = ctx.createLinearGradient(0, -3.5, 19, 3.5);
  canopyGrad.addColorStop(0, '#059669');
  canopyGrad.addColorStop(0.55, '#5eead4');
  canopyGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = canopyGrad;
  ctx.beginPath();
  ctx.moveTo(21, 0);
  ctx.lineTo(8, -4);
  ctx.lineTo(-1, -3);
  ctx.lineTo(-1, 3);
  ctx.lineTo(8, 4);
  ctx.closePath();
  ctx.fill();

  // Central Reactor Core
  ctx.fillStyle = warpActive ? '#e879f9' : '#00f5d4';
  ctx.beginPath();
  ctx.arc(-8, 0, 3.8 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-8, 0, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // TWIN WINGTIP-MOUNTED ORB BLASTERS (at ±34px wingtips)
  const drawWingtipOrbBlaster = (mountY: number, worldAngle: number) => {
    const localRot = normalizeAngle(worldAngle - shipAngle);
    ctx.save();
    ctx.translate(-6, mountY);
    ctx.rotate(localRot);

    // Wingtip swivel pod
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = warpActive ? '#e879f9' : '#00f5d4';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-5, -4.5, 11, 9, 2.5);
    ctx.fill();
    ctx.stroke();

    // Orb accelerator barrel & glowing containment chamber
    ctx.fillStyle = '#090d16';
    ctx.fillRect(4, -3.2, 12, 6.4);
    ctx.fillStyle = isFiring ? '#ffffff' : warpActive ? '#e879f9' : '#00f5d4';
    ctx.beginPath();
    ctx.arc(14, 0, isFiring ? 3.8 : 2.8, 0, Math.PI * 2);
    ctx.fill();

    if (isFiring) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = warpActive ? 'rgba(232, 121, 249, 0.45)' : 'rgba(0, 245, 212, 0.45)';
      ctx.beginPath();
      ctx.arc(17, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(17, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  drawWingtipOrbBlaster(-34, leftBlasterWorldAngle);
  drawWingtipOrbBlaster(34, rightBlasterWorldAngle);

  ctx.restore();

  // 4. Tactical Shield Ring
  if (shield > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.24)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
    ctx.lineWidth = 2.6 + Math.sin(time / 150) * 1.0;
    ctx.stroke();
    ctx.restore();
  }
}

export interface ReiBlasterMount {
  pivotX: number;
  pivotY: number;
  angle: number;
  muzzleX: number;
  muzzleY: number;
}

/**
 * Compute world-space pivots, ±30° gimbal-clamped angles, and muzzle positions
 * for all 4 laser blasters of the giant Nave Rei flagship.
 */
export function getReiBlastersWorld(
  shipX: number,
  shipY: number,
  shipAngle: number,
  targetWorldX: number,
  targetWorldY: number
): ReiBlasterMount[] {
  const cosA = Math.cos(shipAngle);
  const sinA = Math.sin(shipAngle);

  // 4 Blaster hardpoints: 2 inner forward + 2 outer main wing blasters on larger Nave Rei hull
  const mounts = [
    { mx: 14, my: -20 },
    { mx: -2, my: -38 },
    { mx: 14, my: 20 },
    { mx: -2, my: 38 },
  ];
  const muzzleLen = 22;

  const distToCursor = Math.hypot(targetWorldX - shipX, targetWorldY - shipY);
  const centerAimAngle =
    distToCursor > 2 ? Math.atan2(targetWorldY - shipY, targetWorldX - shipX) : shipAngle;
  const effTargetX =
    distToCursor < 120 ? shipX + Math.cos(centerAimAngle) * 150 : targetWorldX;
  const effTargetY =
    distToCursor < 120 ? shipY + Math.sin(centerAimAngle) * 150 : targetWorldY;

  return mounts.map(({ mx, my }) => {
    const pivotX = shipX + cosA * mx - sinA * my;
    const pivotY = shipY + sinA * mx + cosA * my;
    const raw = Math.atan2(effTargetY - pivotY, effTargetX - pivotX);
    const diff = Math.max(-MAX_DESTRUCTOR_GIMBAL, Math.min(MAX_DESTRUCTOR_GIMBAL, normalizeAngle(raw - shipAngle)));
    const angle = shipAngle + diff;
    return {
      pivotX,
      pivotY,
      angle,
      muzzleX: pivotX + Math.cos(angle) * muzzleLen,
      muzzleY: pivotY + Math.sin(angle) * muzzleLen,
    };
  });
}

/**
 * Render the compact mini-fighter Nave Troper:
 * Smaller than Destructor/Interceptor, single center nose orb emitter, single rear thruster, NO Warp rings.
 */
export function renderTroperShip(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  shipAngle: number,
  isMoving: boolean,
  isFiring: boolean,
  time: number,
  shield: number = 0,
  angularVel: number = 0
) {
  const pulse = 0.85 + Math.sin(time * 0.014) * 0.15;

  // 1. Compact Ground Shadow
  ctx.save();
  ctx.translate(screenX + 5, screenY + 7);
  ctx.rotate(shipAngle);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(3, -7);
  ctx.lineTo(-9, -15);
  ctx.lineTo(-14, -12);
  ctx.lineTo(-10, -4);
  ctx.lineTo(-13, 0);
  ctx.lineTo(-10, 4);
  ctx.lineTo(-14, 12);
  ctx.lineTo(-9, 15);
  ctx.lineTo(3, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Mini Starfighter Chassis
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(shipAngle);

  const bankScale = 1 - Math.min(0.16, Math.abs(angularVel) * 0.025);
  ctx.scale(1, bankScale);

  // Single Compact Rear Thruster Flame
  const flameLen = (isMoving ? 14 : 6.5) + Math.sin(time * 0.04) * 2.5;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.beginPath();
  ctx.moveTo(-12, -3.5);
  ctx.lineTo(-12 - flameLen * 1.25, 0);
  ctx.lineTo(-12, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.moveTo(-12, -1.8);
  ctx.lineTo(-12 - flameLen * 0.65, 0);
  ctx.lineTo(-12, 1.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Sleek Mini Delta Hull (Gunmetal Navy + Sky-Blue Trim)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(17, 0);
  ctx.lineTo(4, -6.5);
  ctx.lineTo(-8, -14.5);
  ctx.lineTo(-13, -11.5);
  ctx.lineTo(-9, -4.5);
  ctx.lineTo(-12, 0);
  ctx.lineTo(-9, 4.5);
  ctx.lineTo(-13, 11.5);
  ctx.lineTo(-8, 14.5);
  ctx.lineTo(4, 6.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Armor Panel & Subtle Wing Stripes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(0, -4.5);
  ctx.lineTo(-8, -4.5);
  ctx.lineTo(-8, 4.5);
  ctx.lineTo(0, 4.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-3, -6);
  ctx.lineTo(-10, -11);
  ctx.moveTo(-3, 6);
  ctx.lineTo(-10, 11);
  ctx.stroke();

  // Cockpit Canopy
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(2, -3);
  ctx.lineTo(-3, -2.2);
  ctx.lineTo(-3, 2.2);
  ctx.lineTo(2, 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.ellipse(3, -0.7, 3.2, 1.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Single Nose Orb Emitter Tip
  ctx.fillStyle = '#334155';
  ctx.fillRect(14, -2.2, 5, 4.4);
  ctx.fillStyle = isFiring ? '#ffffff' : '#38bdf8';
  ctx.beginPath();
  ctx.arc(19, 0, isFiring ? 2.6 * pulse : 1.9, 0, Math.PI * 2);
  ctx.fill();

  if (isFiring) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.beginPath();
    ctx.arc(20, 0, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  // 3. Compact Shield Ring
  if (shield > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.58)';
    ctx.lineWidth = 2 + Math.sin(time / 150) * 0.7;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Render the colossal Nave Rei flagship: larger dreadnought chassis, 4 laser blasters,
 * 6s Fury charge with red electricity & hyper-fast multi-directional spheres, and Modo Fúria.
 */
export function renderReiShip(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  shipAngle: number,
  blasters: ReiBlasterMount[],
  isMoving: boolean,
  isFiring: boolean,
  furyChargeProgress: number,
  furyActive: boolean,
  furyRemainingRatio: number,
  orbitAngle: number,
  time: number,
  shield: number = 0,
  angularVel: number = 0
) {
  const chargeP = Math.max(0, Math.min(1, furyChargeProgress));
  const accelIntensity = furyActive ? 1.0 : chargeP;
  const pulse = 0.82 + Math.sin(time * 0.022) * 0.18;
  const elecIntensity = furyActive ? 1.0 : chargeP > 0.12 ? Math.min(1, (chargeP - 0.12) / 0.88) : 0;

  // 1. Massive Flagship Ground Shadow
  ctx.save();
  ctx.translate(screenX + 10, screenY + 14);
  ctx.rotate(shipAngle);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.beginPath();
  ctx.moveTo(44, 0);
  ctx.lineTo(18, -22);
  ctx.lineTo(4, -40);
  ctx.lineTo(-22, -38);
  ctx.lineTo(-30, -20);
  ctx.lineTo(-22, -10);
  ctx.lineTo(-28, 0);
  ctx.lineTo(-22, 10);
  ctx.lineTo(-30, 20);
  ctx.lineTo(-22, 38);
  ctx.lineTo(4, 40);
  ctx.lineTo(18, 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. HYPER-FAST FURY SPHERES + MULTI-DIRECTIONAL TRAILS + RED ELECTRICITY
  if (accelIntensity > 0.01) {
    renderShipWarpAccelerator(
      ctx,
      screenX,
      screenY,
      chargeP,
      furyActive,
      furyRemainingRatio,
      orbitAngle,
      time,
      '#ef4444',
      '#dc2626',
      elecIntensity,
      1.35
    );
  }

  // 3. GIANT NAVE REI HULL & 4 LASER BLASTERS
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(shipAngle);

  // Subtle ±30° gimbal guide
  ctx.save();
  ctx.strokeStyle = furyActive ? 'rgba(239, 68, 68, 0.35)' : 'rgba(251, 191, 36, 0.24)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, 54, -MAX_DESTRUCTOR_GIMBAL, MAX_DESTRUCTOR_GIMBAL);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // RCS Attitude thrusters when smoothly banking
  if (Math.abs(angularVel) > 0.35) {
    const turnSide = angularVel > 0 ? -1 : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = furyActive ? 'rgba(239, 68, 68, 0.72)' : 'rgba(251, 191, 36, 0.65)';
    ctx.beginPath();
    ctx.moveTo(22, turnSide * 10);
    ctx.lineTo(18, turnSide * (22 + Math.random() * 7));
    ctx.lineTo(26, turnSide * 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Heavy Twin Rear Capital Thruster Plumes
  const baseThrust = furyActive ? 54 : isMoving ? 32 : 16;
  const thrustLen = baseThrust + Math.random() * (furyActive ? 18 : 7);
  [-12, 12].forEach((ty) => {
    const tGrad = ctx.createLinearGradient(-24, ty, -24 - thrustLen, ty);
    tGrad.addColorStop(0, '#ffffff');
    tGrad.addColorStop(0.26, furyActive ? '#ef4444' : '#fbbf24');
    tGrad.addColorStop(0.68, furyActive ? '#991b1b' : '#dc2626');
    tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.moveTo(-22, ty - (furyActive ? 7.2 : 5.0));
    ctx.lineTo(-24 - thrustLen, ty);
    ctx.lineTo(-22, ty + (furyActive ? 7.2 : 5.0));
    ctx.closePath();
    ctx.fill();
  });

  // Colossal Imperial Dreadnought Hull
  ctx.fillStyle = '#14080b';
  ctx.strokeStyle = furyActive ? '#ef4444' : '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(42, 0); // Royal spearhead prow
  ctx.lineTo(20, -14);
  ctx.lineTo(16, -24);
  ctx.lineTo(6, -39); // Outer port wingtip
  ctx.lineTo(-18, -39);
  ctx.lineTo(-28, -22);
  ctx.lineTo(-21, -11);
  ctx.lineTo(-26, 0);
  ctx.lineTo(-21, 11);
  ctx.lineTo(-28, 22);
  ctx.lineTo(-18, 39); // Outer starboard wingtip
  ctx.lineTo(6, 39);
  ctx.lineTo(16, 24);
  ctx.lineTo(20, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Crimson & Gold Armor Crest
  ctx.fillStyle = '#240b10';
  ctx.strokeStyle = furyActive ? '#f87171' : '#fbbf24';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(32, 0);
  ctx.lineTo(10, -12);
  ctx.lineTo(-18, -14);
  ctx.lineTo(-18, 14);
  ctx.lineTo(10, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing Plasma Power Conduits
  ctx.strokeStyle = furyActive ? '#ef4444' : '#fbbf24';
  ctx.lineWidth = 2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(-14, side * 14);
    ctx.lineTo(-2, side * 34);
    ctx.lineTo(12, side * 20);
    ctx.stroke();
  });

  // Imperial Command Canopy
  const canopyGrad = ctx.createLinearGradient(0, -6, 26, 6);
  canopyGrad.addColorStop(0, furyActive ? '#991b1b' : '#b45309');
  canopyGrad.addColorStop(0.55, furyActive ? '#f87171' : '#fde047');
  canopyGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = canopyGrad;
  ctx.beginPath();
  ctx.moveTo(25, 0);
  ctx.lineTo(10, -6);
  ctx.lineTo(-2, -4.5);
  ctx.lineTo(-2, 4.5);
  ctx.lineTo(10, 6);
  ctx.closePath();
  ctx.fill();

  // Giant Fury Reactor Core
  ctx.fillStyle = furyActive ? '#ef4444' : '#f59e0b';
  ctx.beginPath();
  ctx.arc(-11, 0, 6.2 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-11, 0, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // 4 ARTICULATED QUAD LASER BLASTERS
  const mountPositions = [
    { mx: 14, my: -20 },
    { mx: -2, my: -38 },
    { mx: 14, my: 20 },
    { mx: -2, my: 38 },
  ];
  for (let i = 0; i < mountPositions.length; i++) {
    const mp = mountPositions[i];
    const b = blasters[i];
    const localRot = b ? normalizeAngle(b.angle - shipAngle) : 0;
    ctx.save();
    ctx.translate(mp.mx, mp.my);
    ctx.rotate(localRot);

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = furyActive ? '#ef4444' : '#fbbf24';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-6, -5, 14, 10, 2.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5, -3.8, 17, 2.6);
    ctx.fillRect(5, 1.2, 17, 2.6);

    ctx.fillStyle = isFiring ? '#ffffff' : furyActive ? '#ef4444' : '#fbbf24';
    ctx.fillRect(5, -1.2, 15, 2.4);

    if (isFiring) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const bloomR = furyActive ? 16 : 11;
      ctx.fillStyle = furyActive ? 'rgba(239, 68, 68, 0.45)' : 'rgba(251, 191, 36, 0.45)';
      ctx.beginPath();
      ctx.arc(22, 0, bloomR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(22, 0, bloomR * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  ctx.restore();

  // 4. Imperial Shield Ring
  if (shield > 0) {
    ctx.save();
    ctx.strokeStyle = furyActive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(251, 191, 36, 0.25)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = furyActive ? 'rgba(239, 68, 68, 0.65)' : 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 3 + Math.sin(time / 150) * 1.1;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Render all 4 continuous laser beams of Nave Rei.
 * In Modo Fúria, beams turn blazing crimson-red, massive in thickness, with crackling red lightning!
 */
export function renderReiQuadBeams(
  ctx: CanvasRenderingContext2D,
  blasters: ReiBlasterMount[],
  beamRange: number,
  camX: number,
  camY: number,
  furyActive: boolean,
  time: number,
  beamCharge: number = 1
) {
  const easedCharge = 1 - Math.pow(1 - Math.max(0, Math.min(1, beamCharge)), 2.2);
  const widthRamp = 0.14 + 0.86 * easedCharge;
  const flicker = 0.9 + Math.sin(time * 0.095) * 0.1;
  const outerColor = furyActive ? 'rgba(220, 38, 38, 0.42)' : 'rgba(245, 158, 11, 0.34)';
  const midColor = furyActive ? 'rgba(239, 68, 68, 0.94)' : 'rgba(251, 191, 36, 0.88)';
  const shadowCol = furyActive ? '#ef4444' : '#fbbf24';

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  for (let i = 0; i < blasters.length; i++) {
    const b = blasters[i];
    const sx1 = b.muzzleX - camX;
    const sy1 = b.muzzleY - camY;
    const sx2 = b.muzzleX + Math.cos(b.angle) * beamRange - camX;
    const sy2 = b.muzzleY + Math.sin(b.angle) * beamRange - camY;
    const dx = sx2 - sx1;
    const dy = sy2 - sy1;
    const len = Math.hypot(dx, dy);
    if (len < 6) continue;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    // 1. Wide atmospheric crimson/gold glow sheath (ramps from thin to thick!)
    ctx.strokeStyle = outerColor;
    ctx.lineWidth = (furyActive ? 46 : 24) * widthRamp * flicker;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    // 2. High-intensity plasma beam core
    ctx.strokeStyle = midColor;
    ctx.lineWidth = (furyActive ? 22 : 9.5) * widthRamp * flicker;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    // 3. Jagged red electricity helix crackling down the laser in Modo Fúria
    const steps = Math.min(28, Math.max(10, Math.floor(len / 38)));
    ctx.strokeStyle = furyActive ? '#fca5a5' : 'rgba(254, 240, 138, 0.8)';
    ctx.lineWidth = (furyActive ? 3.0 : 2.0) * (0.35 + 0.65 * easedCharge);
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const f = s / steps;
      const d = f * len;
      const amp = (furyActive
        ? Math.sin(f * 30 - time * 0.09 + i * 1.6) * 11 * flicker + (Math.random() - 0.5) * 6
        : Math.sin(f * 22 - time * 0.06 + i * 1.6) * 5 * flicker) * widthRamp;
      const px = sx1 + ux * d + nx * amp;
      const py = sy1 + uy * d + ny * amp;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. Blinding white-hot center
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = (furyActive ? 8.2 : 3.6) * widthRamp * flicker;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    // 5. Fast Muzzle bloom
    const mR = (furyActive ? 26 : 16) * (0.45 + 0.55 * widthRamp) * flicker;
    ctx.fillStyle = shadowCol;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(sx1, sy1, mR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx1, sy1, mR * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Render the twin continuous high-energy laser beams fired simultaneously from both Destructor wing blasters.
 * Animates from a thin razor beam to full thickness smoothly via beamCharge (0 -> 1).
 */
export function renderDestructorTwinBeams(
  ctx: CanvasRenderingContext2D,
  leftMuzzleX: number,
  leftMuzzleY: number,
  leftEndX: number,
  leftEndY: number,
  rightMuzzleX: number,
  rightMuzzleY: number,
  rightEndX: number,
  rightEndY: number,
  camX: number,
  camY: number,
  warpActive: boolean,
  time: number,
  beamCharge: number = 1
) {
  const easedCharge = 1 - Math.pow(1 - Math.max(0, Math.min(1, beamCharge)), 2.2);
  const widthRamp = 0.14 + 0.86 * easedCharge;
  const flicker = 0.88 + Math.sin(time * 0.085) * 0.12;
  const outerColor = warpActive ? 'rgba(192, 132, 252, 0.36)' : 'rgba(14, 165, 233, 0.36)';
  const midColor = warpActive ? 'rgba(232, 121, 249, 0.85)' : 'rgba(34, 211, 238, 0.88)';
  const shadowCol = warpActive ? '#e879f9' : '#22d3ee';

  const drawSingleBeam = (x1: number, y1: number, x2: number, y2: number, phaseOffset: number) => {
    const sx1 = x1 - camX;
    const sy1 = y1 - camY;
    const sx2 = x2 - camX;
    const sy2 = y2 - camY;
    const dx = sx2 - sx1;
    const dy = sy2 - sy1;
    const len = Math.hypot(dx, dy);
    if (len < 6) return;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    // 1. Wide atmospheric glow sheath (starts thin, swells to full thickness)
    ctx.strokeStyle = outerColor;
    ctx.lineWidth = (warpActive ? 28 : 24) * widthRamp * flicker;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    // 2. High-intensity plasma laser sheath
    ctx.strokeStyle = midColor;
    ctx.lineWidth = (warpActive ? 11 : 9) * widthRamp * flicker;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    // 3. Traveling energy wave along beam
    const steps = Math.min(30, Math.max(10, Math.floor(len / 34)));
    ctx.strokeStyle = warpActive ? 'rgba(254, 240, 138, 0.72)' : 'rgba(165, 243, 252, 0.72)';
    ctx.lineWidth = 2.0 * (0.4 + 0.6 * widthRamp);
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const f = s / steps;
      const d = f * len;
      const amp = Math.sin(f * 24 - time * 0.06 + phaseOffset) * 5.5 * widthRamp * flicker;
      const px = sx1 + ux * d + nx * amp;
      const py = sy1 + uy * d + ny * amp;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. Blinding white-hot laser core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = (warpActive ? 4.4 : 3.6) * widthRamp * flicker;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    // 5 & 6. Muzzle and endpoint bloom
    const mr = 16 * (0.5 + 0.5 * widthRamp) * flicker;
    const er = 20 * widthRamp * flicker;
    ctx.fillStyle = shadowCol;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(sx1, sy1, mr, 0, Math.PI * 2);
    ctx.arc(sx2, sy2, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx1, sy1, mr * 0.42, 0, Math.PI * 2);
    ctx.arc(sx2, sy2, er * 0.42, 0, Math.PI * 2);
    ctx.fill();
  };

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  drawSingleBeam(leftMuzzleX, leftMuzzleY, leftEndX, leftEndY, 0);
  drawSingleBeam(rightMuzzleX, rightMuzzleY, rightEndX, rightEndY, Math.PI);
  ctx.restore();
}

/**
 * Render an extra continuous Mastery supreme laser beam (Destructor 3rd center singularity beam or Nave Rei flank beams).
 */
export function renderSingleExtraLaserBeam(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  camX: number,
  camY: number,
  coreColor: string,
  outerColor: string,
  widthScale: number,
  time: number,
  beamCharge: number = 1
) {
  const easedCharge = 1 - Math.pow(1 - Math.max(0, Math.min(1, beamCharge)), 2.2);
  const wRamp = widthScale * (0.14 + 0.86 * easedCharge);
  const sx1 = x1 - camX;
  const sy1 = y1 - camY;
  const sx2 = x2 - camX;
  const sy2 = y2 - camY;
  const dx = sx2 - sx1;
  const dy = sy2 - sy1;
  const len = Math.hypot(dx, dy);
  if (len < 6) return;

  const flicker = 0.88 + Math.sin(time * 0.095) * 0.12;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  ctx.strokeStyle = outerColor;
  ctx.lineWidth = 30 * wRamp * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  ctx.strokeStyle = coreColor;
  ctx.lineWidth = 12 * wRamp * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  const steps = Math.min(26, Math.max(10, Math.floor(len / 38)));
  ctx.strokeStyle = 'rgba(255,255,255,0.72)';
  ctx.lineWidth = 2.0 * (0.4 + 0.6 * easedCharge);
  ctx.beginPath();
  for (let s = 0; s <= steps; s++) {
    const f = s / steps;
    const d = f * len;
    const amp = Math.sin(f * 26 - time * 0.08) * 6.5 * (0.14 + 0.86 * easedCharge) * flicker;
    const px = sx1 + ux * d + nx * amp;
    const py = sy1 + uy * d + ny * amp;
    if (s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4.8 * wRamp * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  ctx.fillStyle = coreColor;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(sx2, sy2, 22 * wRamp * flicker, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sx2, sy2, 9 * wRamp * flicker, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render smooth continuous plasma ribbon trails behind BOTH rear thrusters of the Destructor ship.
 */
export function renderDestructorThrusterTrails(
  ctx: CanvasRenderingContext2D,
  leftTrail: ThrusterTrailPoint[],
  rightTrail: ThrusterTrailPoint[],
  camX: number,
  camY: number,
  warpActive: boolean,
  time: number,
  furyRed: boolean = false
) {
  const drawSingleRibbon = (trail: ThrusterTrailPoint[], phase: number) => {
    if (trail.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1];
      const p1 = trail[i];
      const lifeRatio = Math.max(0, Math.min(1, p1.life / Math.max(0.01, p1.maxLife)));
      const headRatio = i / (trail.length - 1);
      const t = lifeRatio * (0.25 + headRatio * 0.75);
      if (t <= 0.02) continue;

      const x0 = p0.x - camX;
      const y0 = p0.y - camY;
      const x1 = p1.x - camX;
      const y1 = p1.y - camY;
      if (Math.hypot(x1 - x0, y1 - y0) > 120) continue;

      const isWarpPt = warpActive || p1.warp;
      const shimmer = 0.88 + Math.sin(time * 0.03 + i * 0.6 + phase) * 0.12;
      const baseW = (furyRed ? (isWarpPt ? 17 : 11) : isWarpPt ? 12.5 : 8.0) * t * shimmer;

      // Outer luminous plasma sheath
      ctx.strokeStyle = furyRed
        ? (isWarpPt ? `rgba(220, 38, 38, ${(0.55 * t).toFixed(3)})` : `rgba(245, 158, 11, ${(0.42 * t).toFixed(3)})`)
        : isWarpPt
          ? `rgba(217, 70, 239, ${(0.42 * t).toFixed(3)})`
          : `rgba(14, 165, 233, ${(0.38 * t).toFixed(3)})`;
      ctx.lineWidth = Math.max(1.5, baseW * 1.9);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Inner hyper-ion core
      ctx.strokeStyle = furyRed
        ? (isWarpPt ? `rgba(248, 113, 113, ${(0.85 * t).toFixed(3)})` : `rgba(253, 224, 71, ${(0.75 * t).toFixed(3)})`)
        : isWarpPt
          ? `rgba(56, 189, 248, ${(0.75 * t).toFixed(3)})`
          : `rgba(34, 211, 238, ${(0.72 * t).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, baseW);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // White-hot centerline near nozzle
      if (t > 0.35) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.78 * (t - 0.25)).toFixed(3)})`;
        ctx.lineWidth = Math.max(0.8, baseW * 0.4);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  drawSingleRibbon(leftTrail, 0);
  drawSingleRibbon(rightTrail, Math.PI * 0.7);
}

/**
 * Render blazing Mythic Solar Phoenix Corona Aura around the player/ship.
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

  // Radial fiery corona wash
  const grad = ctx.createRadialGradient(0, 0, auraRadius * 0.25, 0, 0, auraRadius * pulse);
  grad.addColorStop(0, 'rgba(251, 146, 60, 0.02)');
  grad.addColorStop(0.65, 'rgba(249, 115, 22, 0.14)');
  grad.addColorStop(0.92, 'rgba(250, 204, 21, 0.24)');
  grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Rotating dashed solar ring + scorching rim
  ctx.save();
  ctx.rotate(time * 0.0016);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([16, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius * 0.96, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 8 swirling solar flare tongues along the perimeter
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

  // Subtle cosmic orbital track
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, orbitR, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < count; i++) {
    const a = orbitAngle + (i * Math.PI * 2) / count;
    const bx = Math.cos(a) * orbitR;
    const by = Math.sin(a) * orbitR;

    // Curved cosmic comet wake behind each spinning blade
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

    // Crescent cosmic scythe blade
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

    // Glowing prismatic edge
    ctx.strokeStyle = '#f0abfc';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.quadraticCurveTo(3, -10, 14, 0);
    ctx.stroke();

    // Inner star core
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

    // Void thruster glow
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(232, 121, 249, 0.7)';
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-8, 3);
    ctx.closePath();
    ctx.fill();

    // Sleek angular void hunter chassis
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

    // Void prism core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1, 0, 2.6 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();
}

/**
 * Render East Dragon's continuous fire-laser beam:
 * Unmistakably a continuous laser beam, forged out of living roaring dragon fire with wavy flame envelopes,
 * helical fire strands, incandescent molten core, and roaring dragon-breath muzzle flare.
 */
export function renderEastDragonFireBeam(
  ctx: CanvasRenderingContext2D,
  muzzleX: number,
  muzzleY: number,
  endX: number,
  endY: number,
  camX: number,
  camY: number,
  time: number
) {
  const sx1 = muzzleX - camX;
  const sy1 = muzzleY - camY;
  const sx2 = endX - camX;
  const sy2 = endY - camY;
  const dx = sx2 - sx1;
  const dy = sy2 - sy1;
  const len = Math.hypot(dx, dy);
  if (len < 6) return;

  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const flicker = 0.88 + Math.sin(time * 0.095) * 0.08 + Math.cos(time * 0.17) * 0.04;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Wide scorching atmospheric crimson-orange heat aura
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.34)';
  ctx.lineWidth = 38 * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 2. Living wavy flame silhouette ribbon racing along the laser beam
  const steps = Math.min(34, Math.max(14, Math.floor(len / 30)));
  const topPts: { x: number; y: number }[] = [];
  const botPts: { x: number; y: number }[] = [];
  for (let s = 0; s <= steps; s++) {
    const f = s / steps;
    const d = f * len;
    const baseHalfW = (11 + Math.sin(f * Math.PI) * 5) * flicker;
    const wave1 = Math.sin(d * 0.045 - time * 0.055) * 5.2;
    const wave2 = Math.cos(d * 0.085 - time * 0.082 + 1.1) * 3.1;
    const wTop = baseHalfW + wave1 + wave2;
    const wBot = baseHalfW - wave1 * 0.85 + wave2;
    topPts.push({ x: sx1 + ux * d + nx * wTop, y: sy1 + uy * d + ny * wTop });
    botPts.push({ x: sx1 + ux * d - nx * wBot, y: sy1 + uy * d - ny * wBot });
  }

  const flameGrad = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
  flameGrad.addColorStop(0, 'rgba(251, 191, 36, 0.88)');
  flameGrad.addColorStop(0.28, 'rgba(249, 115, 22, 0.82)');
  flameGrad.addColorStop(0.75, 'rgba(239, 68, 68, 0.68)');
  flameGrad.addColorStop(1, 'rgba(185, 28, 28, 0.25)');

  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(topPts[0].x, topPts[0].y);
  for (let i = 1; i < topPts.length; i++) {
    ctx.lineTo(topPts[i].x, topPts[i].y);
  }
  for (let i = botPts.length - 1; i >= 0; i--) {
    ctx.lineTo(botPts[i].x, botPts[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // 3. Swirling helical fire-tongues twisting down the laser shaft
  for (let h = 0; h < 2; h++) {
    const phase = h * Math.PI;
    ctx.strokeStyle = h === 0 ? 'rgba(253, 224, 71, 0.78)' : 'rgba(251, 146, 60, 0.72)';
    ctx.lineWidth = 2.6 * flicker;
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const f = s / steps;
      const d = f * len;
      const amp = Math.sin(d * 0.055 - time * 0.065 + phase) * 9.5 * flicker;
      const px = sx1 + ux * d + nx * amp;
      const py = sy1 + uy * d + ny * amp;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // 4. Crisp continuous high-energy molten gold laser core
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.96)';
  ctx.lineWidth = 10.5 * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 5. Blinding white-hot thermal laser core line
  ctx.strokeStyle = '#fffbeb';
  ctx.lineWidth = 4.5 * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 6. Roaring dragon-breath flame cone & bloom at the open jaws
  const coneLen = 68 * flicker;
  const coneHalfW = 24 * flicker;
  ctx.fillStyle = 'rgba(251, 146, 60, 0.55)';
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.quadraticCurveTo(
    sx1 + ux * (coneLen * 0.45) + nx * coneHalfW,
    sy1 + uy * (coneLen * 0.45) + ny * coneHalfW,
    sx1 + ux * coneLen,
    sy1 + uy * coneLen
  );
  ctx.quadraticCurveTo(
    sx1 + ux * (coneLen * 0.45) - nx * coneHalfW,
    sy1 + uy * (coneLen * 0.45) - ny * coneHalfW,
    sx1,
    sy1
  );
  ctx.closePath();
  ctx.fill();

  const mR = 24 * flicker;
  ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
  ctx.beginPath();
  ctx.arc(sx1, sy1, mR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sx1, sy1, mR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // 7. Advancing fireball spearhead tip as the beam surges forward from the jaws
  const tipR = 20 * flicker;
  ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
  ctx.beginPath();
  ctx.arc(sx2, sy2, tipR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sx2, sy2, tipR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Transform the player into the worm-like serpentine Eastern Dragon (East Dragon):
 * Articulated slithering scale segments, fiery dorsal spine fins, clawed limbs,
 * horned dragon head, flowing golden whiskers, and blazing fire maw.
 */
export function renderEastDragon(
  ctx: CanvasRenderingContext2D,
  segments: DragonSegment[],
  headWorldX: number,
  headWorldY: number,
  headAngle: number,
  camX: number,
  camY: number,
  isMoving: boolean,
  isFiring: boolean,
  time: number,
  shield: number
) {
  const headX = headWorldX - camX;
  const headY = headWorldY - camY;
  const totalSegs = segments.length;

  // 1. Soft ground shadow beneath serpentine body & head
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  for (let i = totalSegs - 1; i >= 0; i--) {
    const seg = segments[i];
    const t = i / Math.max(1, totalSegs - 1);
    const r = Math.max(4, 14.5 * (1 - t * 0.68));
    ctx.beginPath();
    ctx.arc(seg.x - camX + 4, seg.y - camY + 6, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(headX + 4, headY + 6, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Draw articulated worm-like serpentine segments from TAIL to NECK
  for (let i = totalSegs - 1; i >= 0; i--) {
    const seg = segments[i];
    const sx = seg.x - camX;
    const sy = seg.y - camY;
    const t = i / Math.max(1, totalSegs - 1); // 0 at neck, 1 at tail tip
    const r = Math.max(4.5, 14.5 * (1 - t * 0.68));

    // Fiery tail plume on the final segment
    if (i === totalSegs - 1) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(seg.angle);
      ctx.globalCompositeOperation = 'lighter';
      const tailWave = Math.sin(time * 0.014) * 4;

      const tailGrad = ctx.createLinearGradient(0, 0, -28, 0);
      tailGrad.addColorStop(0, '#fde047');
      tailGrad.addColorStop(0.45, '#f97316');
      tailGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(-15, -10 + tailWave * 0.5, -28, tailWave);
      ctx.quadraticCurveTo(-15, 10 + tailWave * 0.5, 0, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Clawed dragon legs at front shoulders (i === 3) and hind hips (i === 10)
    if (i === 3 || i === 10) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(seg.angle);
      const stride = isMoving ? Math.sin(time * 0.015 + (i === 3 ? 0 : Math.PI)) * 0.35 : 0;
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.scale(1, side);
        ctx.rotate(stride * side);

        // Upper dragon limb
        ctx.fillStyle = '#991b1b';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(2, r * 0.65);
        ctx.quadraticCurveTo(8, r + 8, 12, r + 10);
        ctx.lineTo(4, r + 11);
        ctx.quadraticCurveTo(-2, r + 6, -3, r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3 Golden dragon claws
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        for (let c = -1; c <= 1; c++) {
          ctx.beginPath();
          ctx.moveTo(7 + c * 2.5, r + 10);
          ctx.lineTo(11 + c * 3, r + 14.5);
          ctx.stroke();
        }
        ctx.restore();
      });
      ctx.restore();
    }

    // Segment scale body (fast layered shading without per-segment gradients/shadowBlur)
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(seg.angle);

    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = i % 2 === 0 ? '#fbbf24' : '#f97316';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#dc2626';
    ctx.beginPath();
    ctx.ellipse(1.5, 0, r * 0.82, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden dorsal spine fin spike on alternating segments
    if (i % 2 === 0) {
      const finTilt = Math.sin(time * 0.012 - i * 0.5) * 2.5;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(r * 0.45, 0);
      ctx.lineTo(-r * 0.9, -2.8 + finTilt);
      ctx.lineTo(-r * 0.9, 2.8 + finTilt);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing molten ember core dot on spine
    ctx.fillStyle = isFiring ? '#fef08a' : '#fb923c';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1.5, r * 0.24), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 3. Fierce Eastern Dragon Head at (headX, headY)
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headAngle);

  // A. Fiery Flame Mane framing the neck/back of skull
  const manePulse = 1 + Math.sin(time * 0.018) * 0.08;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let m = -3; m <= 3; m++) {
    const ma = m * 0.34 + Math.sin(time * 0.016 + m) * 0.08;
    const mLen = (20 + (3 - Math.abs(m)) * 2.5) * manePulse;
    ctx.save();
    ctx.rotate(ma);
    ctx.fillStyle = Math.abs(m) % 2 === 0 ? 'rgba(249, 115, 22, 0.72)' : 'rgba(251, 191, 36, 0.65)';
    ctx.beginPath();
    ctx.moveTo(-4, -3.5);
    ctx.quadraticCurveTo(-mLen * 0.6, -5, -mLen, 0);
    ctx.quadraticCurveTo(-mLen * 0.6, 5, -4, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // B. Sweeping Imperial Golden Dragon Antlers/Horns curving backward
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(1, side);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-3, 7);
    ctx.quadraticCurveTo(-14, 16, -26, 13);
    ctx.stroke();

    // Antler fork branch
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-14, 13);
    ctx.quadraticCurveTo(-18, 20, -23, 21);
    ctx.stroke();
    ctx.restore();
  });

  // C. Main Dragon Cranium & Elongated Jaw/Snout
  const jawFlare = isFiring ? 3.2 : 0;
  ctx.fillStyle = '#b91c1c';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(26, -3 - jawFlare * 0.4); // Snout upper lip
  ctx.lineTo(14, -10 - jawFlare * 0.3); // Snout bridge
  ctx.lineTo(2, -14); // Brow ridge
  ctx.lineTo(-12, -11); // Rear cheek plate
  ctx.lineTo(-15, 0); // Neck socket
  ctx.lineTo(-12, 11);
  ctx.lineTo(2, 14);
  ctx.lineTo(14, 10 + jawFlare * 0.3);
  ctx.lineTo(26, 3 + jawFlare * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout ridge armor & golden crown crest
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(23, 0);
  ctx.lineTo(8, -7);
  ctx.lineTo(-6, -6);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-6, 6);
  ctx.lineTo(8, 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-4, -3);
  ctx.lineTo(-9, 0);
  ctx.lineTo(-4, 3);
  ctx.closePath();
  ctx.fill();

  // D. Glowing Flaring Nostrils & Molten Fire Maw inside Jaws
  ctx.fillStyle = isFiring ? '#ffffff' : '#fbbf24';
  ctx.beginPath();
  ctx.arc(20, -3.5, 1.8, 0, Math.PI * 2);
  ctx.arc(20, 3.5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  if (isFiring) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(253, 224, 71, 0.55)';
    ctx.beginPath();
    ctx.arc(25, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(25, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // E. Fierce Blazing Golden Dragon Eyes
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(1, side);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(3, 8.5, 4.2, 2.2, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, 8.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // F. Flowing Undulating Golden Dragon Whiskers (Barbels)
  [-1, 1].forEach((side) => {
    const wWave1 = Math.sin(time * 0.011 + side) * 6;
    const wWave2 = Math.cos(time * 0.009 + side * 2) * 8;
    ctx.save();
    ctx.scale(1, side);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(19, 6);
    ctx.bezierCurveTo(26, 15 + wWave1 * 0.4, 14, 24 + wWave1, 3, 28 + wWave2);
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();

  // 4. Optional Shield Aura around Dragon Head
  if (shield > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.25)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(headX, headY, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.6)';
    ctx.lineWidth = 2.6 + Math.sin(time / 150) * 1.0;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Render Iron Man's flight thruster ribbon trail behind his armor boots/back jets.
 */
export function renderIronManFlightTrail(
  ctx: CanvasRenderingContext2D,
  trail: ThrusterTrailPoint[],
  camX: number,
  camY: number,
  mode: 'REPULSOR' | 'LASER',
  time: number
) {
  if (trail.length < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const outerHex = mode === 'LASER' ? '239, 68, 68' : '56, 189, 248';
  const coreHex = mode === 'LASER' ? '251, 191, 36' : '224, 242, 254';

  for (let i = 1; i < trail.length; i++) {
    const p0 = trail[i - 1];
    const p1 = trail[i];
    const lifeRatio = Math.max(0, Math.min(1, p1.life / Math.max(0.01, p1.maxLife)));
    const headRatio = i / (trail.length - 1);
    const t = lifeRatio * (0.25 + headRatio * 0.75);
    if (t <= 0.02) continue;

    const x0 = p0.x - camX;
    const y0 = p0.y - camY;
    const x1 = p1.x - camX;
    const y1 = p1.y - camY;
    if (Math.hypot(x1 - x0, y1 - y0) > 120) continue;

    const shimmer = 0.88 + Math.sin(time * 0.03 + i * 0.6) * 0.12;
    const baseW = 7.5 * t * shimmer;

    ctx.strokeStyle = `rgba(${outerHex}, ${(0.42 * t).toFixed(3)})`;
    ctx.lineWidth = Math.max(1.5, baseW * 1.9);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${coreHex}, ${(0.78 * t).toFixed(3)})`;
    ctx.lineWidth = Math.max(1, baseW);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Render Iron Man's Continuous Stark Laser Beam (Modo Laser):
 * Starts thin from the gauntlet/unibeam emitter and ramps to full thickness via beamCharge.
 */
export function renderIronManLaserBeam(
  ctx: CanvasRenderingContext2D,
  muzzleX: number,
  muzzleY: number,
  endX: number,
  endY: number,
  camX: number,
  camY: number,
  time: number,
  beamCharge: number = 1
) {
  const easedCharge = 1 - Math.pow(1 - Math.max(0, Math.min(1, beamCharge)), 2.2);
  const widthRamp = 0.14 + 0.86 * easedCharge;
  const sx1 = muzzleX - camX;
  const sy1 = muzzleY - camY;
  const sx2 = endX - camX;
  const sy2 = endY - camY;
  const dx = sx2 - sx1;
  const dy = sy2 - sy1;
  const len = Math.hypot(dx, dy);
  if (len < 6) return;

  const flicker = 0.9 + Math.sin(time * 0.095) * 0.1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  // 1. Wide crimson thermal sheath
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.44)';
  ctx.lineWidth = 34 * widthRamp * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 2. Intense crimson-orange Stark laser body
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)';
  ctx.lineWidth = 14 * widthRamp * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 3. Golden high-frequency energy wave helix
  const steps = Math.min(28, Math.max(10, Math.floor(len / 34)));
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
  ctx.lineWidth = 2.4 * (0.35 + 0.65 * easedCharge);
  ctx.beginPath();
  for (let s = 0; s <= steps; s++) {
    const f = s / steps;
    const d = f * len;
    const amp = Math.sin(f * 26 - time * 0.08) * 7 * widthRamp * flicker;
    const px = sx1 + ux * d + nx * amp;
    const py = sy1 + uy * d + ny * amp;
    if (s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // 4. White-hot precision laser filament
  ctx.strokeStyle = '#fffbeb';
  ctx.lineWidth = 5.2 * widthRamp * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 5. Emitter bloom + endpoint thermal bloom (fast additive circles)
  const mr = 18 * (0.5 + 0.5 * widthRamp) * flicker;
  const er = 22 * widthRamp * flicker;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(sx1, sy1, mr, 0, Math.PI * 2);
  ctx.arc(sx2, sy2, er, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sx1, sy1, mr * 0.4, 0, Math.PI * 2);
  ctx.arc(sx2, sy2, er * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Transform the player into Iron Man (Armadura Mark Stark):
 * Sculpted crimson-and-gold armor, glowing cyan Arc Reactor, twin aiming repulsor/laser gauntlets,
 * iconic gold faceplate & glowing eyes, and hovering jet thrusters.
 */
export function renderIronManSuit(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  angle: number,
  mode: 'REPULSOR' | 'LASER',
  isMoving: boolean,
  isFiring: boolean,
  time: number,
  shield: number = 0
) {
  const pulse = 0.85 + Math.sin(time * 0.018) * 0.15;
  const isLaserMode = mode === 'LASER';

  // 1. Hovering Ground Drop Shadow
  ctx.save();
  ctx.translate(screenX + 6, screenY + 10);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Iron Man Armored Body
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(angle);

  // Rear Boot / Back Stabilizer Jet Flames
  const jetLen = (isMoving ? 24 : 11) + Math.random() * 6;
  [-7.5, 7.5].forEach((jy) => {
    const jGrad = ctx.createLinearGradient(-13, jy, -13 - jetLen, jy);
    jGrad.addColorStop(0, '#ffffff');
    jGrad.addColorStop(0.35, isLaserMode ? '#fbbf24' : '#38bdf8');
    jGrad.addColorStop(0.75, isLaserMode ? '#ef4444' : '#0284c7');
    jGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = jGrad;
    ctx.beginPath();
    ctx.moveTo(-12, jy - 3.2);
    ctx.lineTo(-13 - jetLen, jy);
    ctx.lineTo(-12, jy + 3.2);
    ctx.closePath();
    ctx.fill();
  });

  // Twin Forward Armored Gauntlets (extended slightly forward while firing)
  const armReach = isFiring ? 6 : 2;
  [-13.5, 13.5].forEach((ay, idx) => {
    ctx.save();
    ctx.translate(armReach, ay);

    // Shoulder Pauldron (Crimson with Gold Trim)
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-8, -5.5, 11, 11, 3);
    ctx.fill();
    ctx.stroke();

    // Forearm & Gauntlet (Gold + Crimson Plate)
    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(1, -4, 15, 8, 2);
    ctx.fill();
    ctx.stroke();

    // Golden Forearm Wrist Guard
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(6, -3.2, 6, 6.4);

    // Palm / Wrist Emitter Node
    const emitterCol = isLaserMode ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = isFiring ? '#ffffff' : emitterCol;
    ctx.beginPath();
    ctx.arc(16.5, 0, isFiring ? 3.8 : 2.8, 0, Math.PI * 2);
    ctx.fill();

    if (isFiring && idx === 0 && !isLaserMode) {
      // subtle palm discharge ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(17, 0, 5.5, -0.8, 0.8);
      ctx.stroke();
    }

    ctx.restore();
  });

  // Main Sculpted Crimson Torso & Back Wing Flaps
  ctx.fillStyle = '#b91c1c';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(14, -7);
  ctx.lineTo(14, 7);
  ctx.lineTo(2, 14);
  ctx.lineTo(-12, 11);
  ctx.lineTo(-15, 0);
  ctx.lineTo(-12, -11);
  ctx.lineTo(2, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold Upper Clavicle Armor Plates
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(11, -9);
  ctx.lineTo(3, -12);
  ctx.lineTo(1, -6);
  ctx.lineTo(9, -4);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(11, 9);
  ctx.lineTo(3, 12);
  ctx.lineTo(1, 6);
  ctx.lineTo(9, 4);
  ctx.closePath();
  ctx.fill();

  // Back Stabilizer Flaps (Dark Red + Gold)
  ctx.fillStyle = '#7f1d1d';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.1;
  ctx.fillRect(-14, -9, 5, 5);
  ctx.strokeRect(-14, -9, 5, 5);
  ctx.fillRect(-14, 4, 5, 5);
  ctx.strokeRect(-14, 4, 5, 5);

  // Iconic Mark Helmet (Crimson Dome + Gold Faceplate)
  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(3, 0, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden Titanium Faceplate Mask (facing +X)
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(13.5, -3.5);
  ctx.lineTo(13.5, 3.5);
  ctx.lineTo(7, 7);
  ctx.lineTo(2, 4.5);
  ctx.lineTo(2, -4.5);
  ctx.lineTo(7, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Visor Eyes (Cyan in Repulsor mode, Blazing Amber-White in Laser mode)
  ctx.fillStyle = isLaserMode ? '#fffbeb' : '#e0f2fe';
  ctx.fillRect(8.5, -5.2, 3.2, 2.2);
  ctx.fillRect(8.5, 3.0, 3.2, 2.2);

  // Glowing Arc Reactor / Unibeam Core (Forward Chest Collar / Crown Core)
  const reactorColor = isLaserMode ? '#ef4444' : '#38bdf8';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = isLaserMode ? 'rgba(251, 191, 36, 0.45)' : 'rgba(56, 189, 248, 0.45)';
  ctx.beginPath();
  ctx.arc(14.5, 0, 7.2 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = reactorColor;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(14.5, 0, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 3. Stark Energy Shield Ring if active
  if (shield > 0) {
    ctx.save();
    ctx.strokeStyle = isLaserMode ? 'rgba(251, 191, 36, 0.24)' : 'rgba(56, 189, 248, 0.24)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 27, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = isLaserMode ? 'rgba(251, 191, 36, 0.6)' : 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2.6 + Math.sin(time / 150) * 1.0;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Render elemental dragon beams for the Ice & Fire Dragon companion weapon:
 * - 'FIRE': Roaring crimson/gold flame beam
 * - 'ICE': Glacial sapphire/cyan crystalline frost beam
 * - 'MEGA_PURPLE': Colossal void-purple/magenta fusion beam with twin cosmic plasma helices
 */
export function renderDragonElementalBeam(
  ctx: CanvasRenderingContext2D,
  variant: 'FIRE' | 'ICE' | 'MEGA_PURPLE',
  muzzleX: number,
  muzzleY: number,
  endX: number,
  endY: number,
  camX: number,
  camY: number,
  time: number
) {
  const sx1 = muzzleX - camX;
  const sy1 = muzzleY - camY;
  const sx2 = endX - camX;
  const sy2 = endY - camY;
  const dx = sx2 - sx1;
  const dy = sy2 - sy1;
  const len = Math.hypot(dx, dy);
  if (len < 6) return;

  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  const isMega = variant === 'MEGA_PURPLE';
  const isIce = variant === 'ICE';
  const widthScale = isMega ? 1.85 : 1.0;
  const flicker = 0.92 + Math.sin(time * 0.042) * 0.08 + Math.cos(time * 0.071) * 0.06;

  const outerAuraColor = isMega
    ? 'rgba(147, 51, 234, 0.28)'
    : isIce
      ? 'rgba(14, 165, 233, 0.24)'
      : 'rgba(220, 38, 38, 0.24)';
  const midGlowColor = isMega
    ? 'rgba(192, 132, 252, 0.45)'
    : isIce
      ? 'rgba(56, 189, 248, 0.42)'
      : 'rgba(249, 115, 22, 0.42)';
  const coreTipColor = isMega ? '#f5d0fe' : isIce ? '#e0f2fe' : '#fef08a';
  const coreBodyColor = isMega ? '#c084fc' : isIce ? '#38bdf8' : '#fde047';
  const coreTailColor = isMega ? '#7e22ce' : isIce ? '#0284c7' : '#f97316';
  const haloStopZero = isMega
    ? 'rgba(126, 34, 206, 0)'
    : isIce
      ? 'rgba(2, 132, 199, 0)'
      : 'rgba(220, 38, 38, 0)';

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Wide outer aura
  ctx.strokeStyle = outerAuraColor;
  ctx.lineWidth = 42 * widthScale * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 2. Mid elemental corona
  ctx.strokeStyle = midGlowColor;
  ctx.lineWidth = 24 * widthScale * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 3. Undulating jagged / wavy outer plasma envelope
  const steps = Math.max(12, Math.floor(len / 28));
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const dist = t * len;
    const wave = isIce
      ? ((i % 2 === 0 ? 1 : -1) * (4 + 3 * Math.sin(time * 0.025 + i))) * (0.4 + Math.min(1, t * 3) * 0.6)
      : Math.sin(dist * 0.036 - time * 0.028) *
        (7.5 * widthScale) *
        (0.35 + Math.min(1, t * 3) * 0.65);
    const px = sx1 + ux * dist + nx * wave;
    const py = sy1 + uy * dist + ny * wave;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = isMega
    ? 'rgba(216, 180, 254, 0.72)'
    : isIce
      ? 'rgba(125, 211, 252, 0.68)'
      : 'rgba(251, 146, 60, 0.68)';
  ctx.lineWidth = 14 * widthScale * flicker;
  ctx.stroke();

  // 4. Braided elemental helices (twin helices for Mega Purple, single for Fire/Ice)
  const helixDirs = isMega ? [1, -1] : [1];
  for (let h = 0; h < helixDirs.length; h++) {
    const dir = helixDirs[h];
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const dist = t * len;
      const amp = (10 + Math.sin(t * Math.PI * 5 - time * 0.022) * 5) * widthScale;
      const wave = Math.sin(dist * 0.055 - time * 0.036 + h * Math.PI) * amp * dir;
      const px = sx1 + ux * dist + nx * wave;
      const py = sy1 + uy * dist + ny * wave;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = isMega
      ? h === 0
        ? 'rgba(240, 171, 252, 0.78)'
        : 'rgba(168, 85, 247, 0.78)'
      : isIce
        ? 'rgba(224, 242, 254, 0.78)'
        : 'rgba(254, 240, 138, 0.78)';
    ctx.lineWidth = 5 * widthScale;
    ctx.stroke();
  }

  // 5. Incandescent core spine
  const coreGrad = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.18, coreTipColor);
  coreGrad.addColorStop(0.65, coreBodyColor);
  coreGrad.addColorStop(1, coreTailColor);
  ctx.strokeStyle = coreGrad;
  ctx.lineWidth = 9.5 * widthScale * flicker;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.2 * widthScale;
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();

  // 6. Muzzle breath flare & advancing spearhead tip
  const mR = 24 * widthScale * flicker;
  const mGrad = ctx.createRadialGradient(sx1, sy1, 2, sx1, sy1, mR);
  mGrad.addColorStop(0, '#ffffff');
  mGrad.addColorStop(0.38, coreTipColor);
  mGrad.addColorStop(0.75, coreTailColor);
  mGrad.addColorStop(1, haloStopZero);
  ctx.fillStyle = mGrad;
  ctx.beginPath();
  ctx.arc(sx1, sy1, mR, 0, Math.PI * 2);
  ctx.fill();

  const tipR = 22 * widthScale * flicker;
  const tipGrad = ctx.createRadialGradient(sx2, sy2, 2, sx2, sy2, tipR);
  tipGrad.addColorStop(0, '#ffffff');
  tipGrad.addColorStop(0.4, coreTipColor);
  tipGrad.addColorStop(0.78, coreTailColor);
  tipGrad.addColorStop(1, haloStopZero);
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.arc(sx2, sy2, tipR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render an articulated companion serpentine dragon:
 * - 'FIRE': Crimson-orange & molten gold flame dragon
 * - 'ICE': Sapphire-cyan & frost crystal ice dragon
 * - 'MEGA_PURPLE': Giant fused Cosmic Void-Purple Dragon
 */
export function renderCompanionDragon(
  ctx: CanvasRenderingContext2D,
  variant: 'FIRE' | 'ICE' | 'MEGA_PURPLE',
  segments: DragonSegment[],
  headWorldX: number,
  headWorldY: number,
  headAngle: number,
  camX: number,
  camY: number,
  isMoving: boolean,
  isFiring: boolean,
  isActiveAttacker: boolean,
  time: number,
  scale = 1
) {
  const headX = headWorldX - camX;
  const headY = headWorldY - camY;
  const totalSegs = segments.length;

  const isMega = variant === 'MEGA_PURPLE';
  const isIce = variant === 'ICE';

  const segColorA = isMega ? '#9333ea' : isIce ? '#38bdf8' : '#ef4444';
  const segColorB = isMega ? '#7e22ce' : isIce ? '#0ea5e9' : '#dc2626';
  const segMidColor = isMega ? '#581c87' : isIce ? '#0369a1' : '#991b1b';
  const accentColor = isMega ? '#e879f9' : isIce ? '#e0f2fe' : '#fbbf24';
  const accentGlow = isMega ? '#c084fc' : isIce ? '#7dd3fc' : '#f97316';
  const tailStart = isMega ? '#f5d0fe' : isIce ? '#e0f2fe' : '#fde047';
  const tailMid = isMega ? '#a855f7' : isIce ? '#38bdf8' : '#f97316';
  const tailEnd = isMega
    ? 'rgba(126, 34, 206, 0)'
    : isIce
      ? 'rgba(2, 132, 199, 0)'
      : 'rgba(220, 38, 38, 0)';
  const craniumFill = isMega ? '#6b21a8' : isIce ? '#0284c7' : '#b91c1c';
  const ridgeFill = isMega ? '#9333ea' : isIce ? '#0ea5e9' : '#dc2626';
  const eyeFill = isMega ? '#f5d0fe' : isIce ? '#e0f2fe' : '#fef08a';

  // 1. Soft ground shadow beneath serpentine body & head
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
  for (let i = totalSegs - 1; i >= 0; i--) {
    const seg = segments[i];
    const t = i / Math.max(1, totalSegs - 1);
    const r = Math.max(3.5, 13.5 * (1 - t * 0.68)) * scale;
    ctx.beginPath();
    ctx.arc(seg.x - camX + 3.5 * scale, seg.y - camY + 5 * scale, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(headX + 3.5 * scale, headY + 5 * scale, 15.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Articulated serpentine segments from tail to neck
  const shoulderIdx = Math.min(totalSegs - 2, 3);
  const hipIdx = Math.min(totalSegs - 2, Math.floor(totalSegs * 0.6));

  for (let i = totalSegs - 1; i >= 0; i--) {
    const seg = segments[i];
    const sx = seg.x - camX;
    const sy = seg.y - camY;
    const t = i / Math.max(1, totalSegs - 1);
    const r = Math.max(4.0, 13.5 * (1 - t * 0.68)) * scale;

    // Elemental tail plume
    if (i === totalSegs - 1) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(seg.angle);
      ctx.scale(scale, scale);
      ctx.globalCompositeOperation = 'lighter';
      const tailWave = Math.sin(time * 0.015 + (isIce ? 2 : 0)) * 4;

      const tailGrad = ctx.createLinearGradient(0, 0, -26, 0);
      tailGrad.addColorStop(0, tailStart);
      tailGrad.addColorStop(0.45, tailMid);
      tailGrad.addColorStop(1, tailEnd);
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(0, -4.5);
      ctx.quadraticCurveTo(-14, -9.5 + tailWave * 0.5, -26, tailWave);
      ctx.quadraticCurveTo(-14, 9.5 + tailWave * 0.5, 0, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Clawed limbs at shoulders and hips
    if (i === shoulderIdx || i === hipIdx) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(seg.angle);
      const stride = isMoving ? Math.sin(time * 0.015 + (i === shoulderIdx ? 0 : Math.PI)) * 0.35 : 0;
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.scale(1, side);
        ctx.rotate(stride * side);

        ctx.fillStyle = segMidColor;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.1 * scale;
        ctx.beginPath();
        ctx.moveTo(2 * scale, r * 0.65);
        ctx.quadraticCurveTo(7.5 * scale, r + 7.5 * scale, 11 * scale, r + 9 * scale);
        ctx.lineTo(3.5 * scale, r + 10 * scale);
        ctx.quadraticCurveTo(-2 * scale, r + 5.5 * scale, -2.5 * scale, r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = eyeFill;
        ctx.lineWidth = 1.3 * scale;
        ctx.lineCap = 'round';
        for (let c = -1; c <= 1; c++) {
          ctx.beginPath();
          ctx.moveTo((6.5 + c * 2.2) * scale, r + 9 * scale);
          ctx.lineTo((10 + c * 2.8) * scale, r + 13 * scale);
          ctx.stroke();
        }
        ctx.restore();
      });
      ctx.restore();
    }

    // Segment scale armor (fast layered shading without per-segment gradients/shadowBlur)
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(seg.angle);

    ctx.fillStyle = segMidColor;
    ctx.strokeStyle = i % 2 === 0 ? accentColor : accentGlow;
    ctx.lineWidth = 1.3 * scale;

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = i % 2 === 0 ? segColorA : segColorB;
    ctx.beginPath();
    ctx.ellipse(1.5 * scale, 0, r * 0.82, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    if (i % 2 === 0) {
      const finTilt = Math.sin(time * 0.012 - i * 0.5) * 2.2 * scale;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(r * 0.45, 0);
      ctx.lineTo(-r * 0.9, -2.6 * scale + finTilt);
      ctx.lineTo(-r * 0.9, 2.6 * scale + finTilt);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = isFiring ? '#ffffff' : tailStart;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1.4, r * 0.24), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 3. Active Attacker or Mega Fusion halo around dragon head
  if (isActiveAttacker || isMega) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const auraR = (isMega ? 38 : 27) * scale * (1 + Math.sin(time * 0.012) * 0.06);
    ctx.strokeStyle = isMega
      ? 'rgba(232, 121, 249, 0.55)'
      : isIce
        ? 'rgba(56, 189, 248, 0.55)'
        : 'rgba(249, 115, 22, 0.55)';
    ctx.lineWidth = 2.0 * scale;
    ctx.setLineDash([7 * scale, 5 * scale]);
    ctx.beginPath();
    ctx.arc(headX, headY, auraR, time * 0.003, time * 0.003 + Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Dragon Head
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headAngle);
  ctx.scale(scale, scale);

  // Elemental mane framing neck
  const manePulse = 1 + Math.sin(time * 0.018) * 0.08;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let m = -3; m <= 3; m++) {
    const ma = m * 0.34 + Math.sin(time * 0.016 + m) * 0.08;
    const mLen = (19 + (3 - Math.abs(m)) * 2.4) * manePulse;
    ctx.save();
    ctx.rotate(ma);
    ctx.fillStyle = isMega
      ? Math.abs(m) % 2 === 0
        ? 'rgba(168, 85, 247, 0.72)'
        : 'rgba(240, 171, 252, 0.65)'
      : isIce
        ? Math.abs(m) % 2 === 0
          ? 'rgba(56, 189, 248, 0.72)'
          : 'rgba(224, 242, 254, 0.65)'
        : Math.abs(m) % 2 === 0
          ? 'rgba(249, 115, 22, 0.72)'
          : 'rgba(251, 191, 36, 0.65)';
    ctx.beginPath();
    ctx.moveTo(-4, -3.4);
    ctx.quadraticCurveTo(-mLen * 0.6, -5, -mLen, 0);
    ctx.quadraticCurveTo(-mLen * 0.6, 5, -4, 3.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Horns / Crystalline Antlers
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(1, side);
    ctx.strokeStyle = isMega ? '#f0abfc' : isIce ? '#bae6fd' : '#fde047';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-3, 7);
    if (isIce) {
      ctx.lineTo(-15, 16);
      ctx.lineTo(-26, 12);
    } else {
      ctx.quadraticCurveTo(-14, 16, -25, 13);
    }
    ctx.stroke();

    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-14, 13);
    ctx.lineTo(-22, 21);
    ctx.stroke();
    ctx.restore();
  });

  // Main Cranium & Elongated Jaw
  const jawFlare = isFiring ? 3.0 : 0;

  ctx.fillStyle = craniumFill;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(25, -3 - jawFlare * 0.4);
  ctx.lineTo(13, -9.5 - jawFlare * 0.3);
  ctx.lineTo(2, -13.5);
  ctx.lineTo(-11, -10.5);
  ctx.lineTo(-14, 0);
  ctx.lineTo(-11, 10.5);
  ctx.lineTo(2, 13.5);
  ctx.lineTo(13, 9.5 + jawFlare * 0.3);
  ctx.lineTo(25, 3 + jawFlare * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout ridge & crown crest
  ctx.fillStyle = ridgeFill;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(8, -6.8);
  ctx.lineTo(-5.5, -5.8);
  ctx.lineTo(-7.5, 0);
  ctx.lineTo(-5.5, 5.8);
  ctx.lineTo(8, 6.8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(13.5, 0);
  ctx.lineTo(-4, -2.8);
  ctx.lineTo(-8.5, 0);
  ctx.lineTo(-4, 2.8);
  ctx.closePath();
  ctx.fill();

  // Flaring nostrils & glowing maw when firing
  ctx.fillStyle = isFiring ? '#ffffff' : accentColor;
  ctx.beginPath();
  ctx.arc(19, -3.2, 1.7, 0, Math.PI * 2);
  ctx.arc(19, 3.2, 1.7, 0, Math.PI * 2);
  ctx.fill();

  if (isFiring) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = tailMid;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(24, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(24, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Fierce Glowing Eyes
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.scale(1, side);
    ctx.fillStyle = eyeFill;
    ctx.beginPath();
    ctx.ellipse(3, 8.2, 4.0, 2.1, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, 8.2, 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Flowing Whiskers
  [-1, 1].forEach((side) => {
    const wWave1 = Math.sin(time * 0.011 + side) * 5.5;
    const wWave2 = Math.cos(time * 0.009 + side * 2) * 7.5;
    ctx.save();
    ctx.scale(1, side);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(18, 5.8);
    ctx.bezierCurveTo(25, 14 + wWave1 * 0.4, 13, 22 + wWave1, 3, 26 + wWave2);
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}

/**
 * Render lingering Chloro Ball toxic gas cloud area on the floor.
 */
export function renderToxicChloroCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  lifeRatio: number,
  isKinjite: boolean,
  camX: number,
  camY: number,
  time: number
) {
  const sx = x - camX;
  const sy = y - camY;
  const fade = Math.min(1, lifeRatio * 2.2);
  const pulse = 1 + Math.sin(time * 0.007 + x * 0.01) * 0.06;

  ctx.save();
  ctx.translate(sx, sy);

  // Outer perimeter ring
  ctx.strokeStyle = isKinjite
    ? `rgba(244, 63, 94, ${(0.55 * fade).toFixed(2)})`
    : `rgba(163, 230, 53, ${(0.52 * fade).toFixed(2)})`;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.arc(0, 0, radius * pulse, time * 0.001, time * 0.001 + Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Layered translucent gas lobes (zero radial gradient allocs)
  ctx.fillStyle = isKinjite
    ? `rgba(190, 18, 60, ${(0.22 * fade).toFixed(2)})`
    : `rgba(126, 34, 206, ${(0.2 * fade).toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.96, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isKinjite
    ? `rgba(244, 63, 94, ${(0.18 * fade).toFixed(2)})`
    : `rgba(132, 204, 22, ${(0.18 * fade).toFixed(2)})`;
  for (let i = 0; i < 4; i++) {
    const a = time * 0.0018 + (i * Math.PI) / 2;
    const ox = Math.cos(a) * radius * 0.34;
    const oy = Math.sin(a) * radius * 0.34;
    ctx.beginPath();
    ctx.arc(ox, oy, radius * 0.48, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rising toxic bubbles
  ctx.fillStyle = isKinjite
    ? `rgba(253, 164, 175, ${(0.65 * fade).toFixed(2)})`
    : `rgba(217, 249, 157, ${(0.62 * fade).toFixed(2)})`;
  for (let b = 0; b < 5; b++) {
    const phase = ((time * 0.003 + b * 1.37) % 1);
    const ang = b * 1.9 + x * 0.03;
    const dist = radius * (0.2 + ((b * 0.17) % 0.65));
    const bx = Math.cos(ang) * dist;
    const by = Math.sin(ang) * dist - phase * 18;
    const br = (1 - phase) * 5.2 + 1.5;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Render the towering One Piece Magellan-inspired "Venom Demon: Kinjite" transformation.
 */
export function renderVenomDemonForm(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  angle: number,
  radius: number,
  isMoving: boolean,
  time: number,
  shield: number,
  auraRadius: number
) {
  ctx.save();
  ctx.translate(screenX, screenY);

  // 1. Corrosive Hell's Judgment floor aura ring (world-space around player)
  const pulse = 1 + Math.sin(time * 0.009) * 0.05;
  ctx.fillStyle = 'rgba(159, 18, 57, 0.14)';
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(244, 63, 94, 0.48)';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius * pulse, time * 0.0018, time * 0.0018 + Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.rotate(angle);

  const demonR = radius * 1.48;
  const sway = Math.sin(time * 0.012) * (isMoving ? 4.5 : 2.2);

  // 2. Flowing Crimson-Black Liquid Venom Cloak / Tendrils
  ctx.fillStyle = 'rgba(136, 19, 55, 0.85)';
  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(4, -demonR * 0.9);
  ctx.quadraticCurveTo(-demonR * 1.15, -demonR * 1.2 + sway, -demonR * 1.7, -demonR * 0.55 + sway);
  ctx.lineTo(-demonR * 1.45, 0 - sway * 0.5);
  ctx.lineTo(-demonR * 1.7, demonR * 0.55 - sway);
  ctx.quadraticCurveTo(-demonR * 1.15, demonR * 1.2 - sway, 4, demonR * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.arc(4, 4, demonR, 0, Math.PI * 2);
  ctx.fill();

  // 4. Twin Shoulder Serpent-Skull Venom Crests (Magellan Demon Shoulders)
  [-1, 1].forEach((side) => {
    const sy = side * (demonR * 0.82);
    ctx.fillStyle = '#4c0519';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(10, sy);
    ctx.lineTo(-4, sy + side * 8);
    ctx.lineTo(-14, sy);
    ctx.lineTo(-4, sy - side * 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing shoulder dragon eye
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(2, sy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Towering Kinjite Liquid Body Core
  ctx.fillStyle = '#881337';
  ctx.strokeStyle = '#fda4af';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, demonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.arc(2, 0, demonR * 0.72, 0, Math.PI * 2);
  ctx.fill();

  // Dripping crimson toxin crown & demon fangs
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(demonR * 0.62, -6, 5.2, 0, Math.PI * 2);
  ctx.arc(demonR * 0.62, 6, 5.2, 0, Math.PI * 2);
  ctx.fill();

  // Curved Giant Demon Horns (curving forward-outward)
  [-1, 1].forEach((side) => {
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(2, side * (demonR * 0.48));
    ctx.quadraticCurveTo(14, side * (demonR * 1.15), 24, side * (demonR * 0.85));
    ctx.quadraticCurveTo(10, side * (demonR * 0.75), -4, side * (demonR * 0.25));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // 6. Blazing Demon Visor Eyes & Wicked Grin
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(demonR * 0.45, -7.5, 4.5, 2.2, -0.3, 0, Math.PI * 2);
  ctx.ellipse(demonR * 0.45, 7.5, 4.5, 2.2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(demonR * 0.52, -7.5, 1.3, 0, Math.PI * 2);
  ctx.arc(demonR * 0.52, 7.5, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Forward extended Demon Clawed Hands dripping Kinjite venom
  [-1, 1].forEach((side) => {
    ctx.fillStyle = '#4c0519';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(demonR * 0.92, side * 12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  if (shield > 0) {
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, demonR + 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}






