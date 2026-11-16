/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WeaponType } from '../types';

const WT = WeaponType as any;

interface WeaponIllustrationProps {
  type: WeaponType;
  color?: string;
  className?: string;
}

export const WeaponIllustration: React.FC<WeaponIllustrationProps> = ({
  type,
  color = '#facc15',
  className = 'w-full h-full',
}) => {
  switch (type) {
    case WT.PISTOL:
      // === PISTOLA TÁTICA 9MM ===
      return (
        <svg
          viewBox="0 0 320 140"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pistol-slide" x1="60" y1="30" x2="260" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="pistol-frame" x1="100" y1="50" x2="160" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="pistol-steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Background Technical Watermark */}
          <text x="290" y="32" textAnchor="end" fill="#334155" opacity="0.25" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CAL: 9x19MM NATO
          </text>
          <text x="290" y="46" textAnchor="end" fill="#334155" opacity="0.25" fontSize="9" fontFamily="monospace">
            TACTICAL POLYMER FRAME
          </text>

          {/* Barrel Crown & Guide Rod */}
          <rect x="254" y="44" width="16" height="10" rx="1.5" fill="#020617" />
          <circle cx="268" cy="49" r="3.5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <circle cx="268" cy="49" r="1.8" fill="#020617" />
          <rect x="250" y="58" width="8" height="5" rx="1" fill="#475569" />

          {/* Main Slide (Upper) */}
          <path
            d="M 68 40 L 254 40 L 254 62 L 244 64 L 68 64 Z"
            fill="url(#pistol-slide)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Slide Top Bevel */}
          <rect x="72" y="40" width="180" height="3" fill="#64748b" opacity="0.6" />

          {/* Rear Slide Cocking Serrations */}
          {[-20, -15, -10, -5, 0].map((dx, i) => (
            <line key={`rs-${i}`} x1={95 + dx} y1="44" x2={95 + dx} y2="60" stroke="#090d16" strokeWidth="2" strokeLinecap="round" />
          ))}

          {/* Front Press Check Serrations */}
          {[0, 5, 10, 15].map((dx, i) => (
            <line key={`fs-${i}`} x1={220 + dx} y1="45" x2={220 + dx} y2="58" stroke="#090d16" strokeWidth="1.8" strokeLinecap="round" />
          ))}

          {/* Ejection Port & Extractor */}
          <rect x="156" y="42" width="28" height="9" rx="1" fill="#020617" stroke="#334155" strokeWidth="0.8" />
          <rect x="159" y="44" width="14" height="5" fill="#b45309" opacity="0.9" /> {/* 9mm Brass Casing glimpse */}
          <rect x="159" y="44" width="3" height="5" fill="#fbbf24" />
          <rect x="181" y="43" width="3" height="7" fill="#475569" /> {/* Extractor Claw */}

          {/* Iron Sights */}
          <rect x="74" y="34" width="7" height="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <circle cx="77.5" cy="37" r="1.2" fill="#22c55e" /> {/* Tritium Green dot */}
          <rect x="246" y="34" width="5" height="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <circle cx="248.5" cy="37" r="1.2" fill="#22c55e" /> {/* Front Green dot */}

          {/* Lower Polymer Frame & Picatinny Rail */}
          <path
            d="M 66 64 L 246 64 L 246 75 L 180 75 L 175 79 L 140 79 L 134 84 L 126 126 L 90 126 L 82 82 L 66 70 Z"
            fill="url(#pistol-frame)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Under-Barrel Picatinny Rail Notches */}
          {[0, 6, 12, 18].map((rx, i) => (
            <rect key={`rail-${i}`} x={212 + rx} y="71" width="3.5" height="4" fill="#090d16" />
          ))}

          {/* Tactical Laser Module under Rail */}
          <rect x="210" y="75" width="28" height="9" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />
          <circle cx="236" cy="79.5" r="2" fill="#22c55e" className="animate-pulse" />
          <circle cx="236" cy="79.5" r="0.8" fill="#ffffff" />

          {/* Grip Stippling & Texturing */}
          <path
            d="M 94 88 L 122 88 L 118 120 L 92 120 Z"
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth="1"
          />
          {/* Grip Checkered Dots */}
          {[0, 6, 12, 18, 24].map((gy, r) => (
            <g key={`grip-row-${r}`}>
              {[0, 5, 10, 15, 20].map((gx, c) => (
                <rect key={`gdot-${r}-${c}`} x={97 + gx} y={92 + gy} width="2" height="2" rx="0.5" fill="#334155" opacity="0.75" />
              ))}
            </g>
          ))}

          {/* Extended Magazine Baseplate */}
          <rect x="88" y="125" width="40" height="7" rx="2" fill="#020617" stroke="#334155" strokeWidth="1" />
          <circle cx="108" cy="128.5" r="1.5" fill="#475569" />

          {/* Trigger Guard & Trigger */}
          <path
            d="M 140 75 Q 165 75 160 96 Q 148 98 135 88 Z"
            fill="none"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Curved Match Trigger */}
          <path
            d="M 144 79 Q 152 86 148 92"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Slide Release & Takedown Lever */}
          <rect x="128" y="66" width="10" height="3" rx="1" fill="#64748b" />
          <rect x="156" y="67" width="7" height="3" rx="0.8" fill="#64748b" />

          {/* Caliber & Brand Stamp */}
          <text x="105" y="55" fill="#94a3b8" fontSize="6.5" fontFamily="monospace" fontWeight="bold" opacity="0.8">
            TACTICAL 9MM AUTO
          </text>
        </svg>
      );

    case WT.MAGNUM:
      // === REVÓLVER MAGNUM .44 ===
      return (
        <svg
          viewBox="0 0 340 140"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="magnum-steel" x1="40" y1="30" x2="280" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="35%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="magnum-wood" x1="60" y1="80" x2="110" y2="135" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* Technical Specs Text */}
          <text x="310" y="32" textAnchor="end" fill="#334155" opacity="0.25" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CAL: .44 REMINGTON MAGNUM
          </text>
          <text x="310" y="46" textAnchor="end" fill="#334155" opacity="0.25" fontSize="9" fontFamily="monospace">
            HEAVY 6-INCH FULL UNDERLUG
          </text>

          {/* Long Stainless Heavy Barrel */}
          <rect x="175" y="43" width="100" height="15" rx="1" fill="url(#magnum-steel)" stroke="#334155" strokeWidth="1.2" />
          {/* Full Underlug Rod Shroud */}
          <rect x="175" y="58" width="94" height="10" rx="1" fill="url(#magnum-steel)" stroke="#334155" strokeWidth="1" />
          {/* Ventilated Rib Slots on Top Barrel */}
          <rect x="175" y="39" width="100" height="4" fill="#64748b" />
          {[0, 18, 36, 54, 72].map((vx, i) => (
            <rect key={`vrib-${i}`} x={185 + vx} y="40" width="10" height="2.5" fill="#0f172a" rx="0.5" />
          ))}

          {/* Muzzle Crown & Deep Bore */}
          <rect x="274" y="42" width="6" height="24" rx="1.5" fill="#475569" stroke="#1e293b" />
          <circle cx="277" cy="50.5" r="4.5" fill="#020617" />
          <circle cx="277" cy="50.5" r="2.8" fill="#1e293b" />

          {/* Red Ramp Target Blade Sight */}
          <path d="M 266 39 L 273 39 L 273 31 L 268 31 Z" fill="#334155" />
          <polygon points="268,32 272,32 272,36 269,38" fill="#ef4444" />

          {/* Rear Adjustable Target Sight */}
          <rect x="96" y="36" width="18" height="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <rect x="98" y="34" width="5" height="4" fill="#0f172a" />
          <line x1="97" y1="39" x2="113" y2="39" stroke="#ffffff" strokeWidth="1" opacity="0.7" />

          {/* Frame Center Body */}
          <path
            d="M 94 42 L 176 42 L 176 72 L 152 75 L 118 75 L 102 70 Z"
            fill="url(#magnum-steel)"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* Cylinder (Tambor de 6 Tiros) */}
          <rect x="118" y="44" width="48" height="28" rx="3.5" fill="url(#magnum-steel)" stroke="#1e293b" strokeWidth="1.5" />
          {/* Cylinder Flutes (Ranhuras do Tambor) */}
          <rect x="122" y="48" width="38" height="4" rx="2" fill="#1e293b" opacity="0.85" />
          <rect x="122" y="56" width="38" height="4" rx="2" fill="#0f172a" opacity="0.9" />
          <rect x="122" y="64" width="38" height="4" rx="2" fill="#1e293b" opacity="0.85" />
          {/* Cylinder Pivot Pin & Ratchet */}
          <circle cx="166" cy="58" r="3.5" fill="#cbd5e1" stroke="#334155" />
          <circle cx="166" cy="58" r="1.5" fill="#f59e0b" />

          {/* Exposed Cocked Hammer */}
          <path
            d="M 94 42 Q 86 32 78 30 Q 82 44 88 48 Z"
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* Serrated Hammer Spur */}
          <line x1="79" y1="32" x2="84" y2="37" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="81" y1="34" x2="86" y2="39" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Contoured Walnut Wood Grip */}
          <path
            d="M 96 70 Q 92 84 86 100 Q 80 120 74 126 Q 96 132 110 126 Q 116 108 114 84 L 118 75 Z"
            fill="url(#magnum-wood)"
            stroke="#3b1502"
            strokeWidth="1.5"
          />
          {/* Grip Wood Grain & Contours */}
          <path d="M 88 88 Q 98 104 84 122" fill="none" stroke="#b45309" strokeWidth="1.2" opacity="0.6" />
          <path d="M 98 84 Q 106 102 96 124" fill="none" stroke="#78350f" strokeWidth="1" opacity="0.8" />
          {/* Brass Medallion Insert */}
          <circle cx="98" cy="98" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <polygon points="98,95 99.5,99 96.5,99" fill="#78350f" />

          {/* Large Heavy Trigger Guard & Trigger */}
          <path
            d="M 120 75 Q 146 75 142 98 Q 128 100 114 86 Z"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Curved Stainless Trigger */}
          <path d="M 124 79 Q 132 88 128 94" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

          {/* Caliber Inscription */}
          <text x="185" y="53" fill="#334155" fontSize="7" fontFamily="monospace" fontWeight="bold">
            .44 MAGNUM HUNTER
          </text>
        </svg>
      );

    case WT.MACHINE_GUN:
      // === SUBMETRALHADORA SMG MP5 ===
      return (
        <svg
          viewBox="0 0 340 140"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mp5-steel" x1="80" y1="40" x2="260" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="mp5-mag" x1="160" y1="70" x2="190" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Technical Specs Text */}
          <text x="310" y="32" textAnchor="end" fill="#334155" opacity="0.25" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CAL: 9MM NATO AUTOMATIC
          </text>
          <text x="310" y="46" textAnchor="end" fill="#334155" opacity="0.25" fontSize="9" fontFamily="monospace">
            RATE: 900 RPM · ROLLER-DELAYED
          </text>

          {/* Collapsible Wire A3 Stock Rails */}
          <rect x="42" y="54" width="60" height="4.5" fill="#475569" rx="1" />
          <rect x="42" y="66" width="60" height="4.5" fill="#475569" rx="1" />
          <path d="M 42 50 L 46 50 L 46 76 L 42 76 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />

          {/* Receiver Upper Tube & Cocking Tube */}
          <rect x="98" y="44" width="130" height="15" rx="1.5" fill="url(#mp5-steel)" stroke="#334155" strokeWidth="1.2" />
          <rect x="140" y="40" width="88" height="5" rx="1" fill="#0f172a" />
          {/* Cocking Handle Notch */}
          <rect x="206" y="38" width="8" height="7" rx="1.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />

          {/* Ribbed Tropical Polymer Forend Handguard */}
          <path
            d="M 188 56 L 254 56 L 250 78 L 186 78 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* Handguard Grip Ridges */}
          {[0, 6, 12, 18, 24, 30, 36, 42, 48].map((hx, i) => (
            <line key={`mp5-h-${i}`} x1={194 + hx} y1="60" x2={192 + hx} y2="74" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          ))}

          {/* Barrel & 3-Lug Flash Hider */}
          <rect x="254" y="48" width="24" height="7" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          {/* Flash Hider Ports */}
          <rect x="274" y="46" width="12" height="11" rx="1.5" fill="#1e293b" stroke="#334155" />
          <line x1="277" y1="48" x2="277" y2="55" stroke="#020617" strokeWidth="1.5" />
          <line x1="281" y1="48" x2="281" y2="55" stroke="#020617" strokeWidth="1.5" />

          {/* Front Hooded Ring Sight */}
          <circle cx="260" cy="42" r="5.5" fill="none" stroke="#334155" strokeWidth="1.8" />
          <line x1="260" y1="42" x2="260" y2="47" stroke="#22c55e" strokeWidth="1.5" />

          {/* Rear Rotary Diopter Drum Sight */}
          <path d="M 112 44 L 118 36 L 124 44 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
          <circle cx="118" cy="40" r="1.5" fill="#020617" />

          {/* Lower Polymer Trigger Group & Grip */}
          <path
            d="M 98 59 L 188 59 L 184 76 L 152 76 L 146 118 L 122 118 L 126 76 L 98 72 Z"
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth="1.2"
          />

          {/* Textured Pistol Grip Panels */}
          <rect x="127" y="82" width="16" height="30" rx="2" fill="#1e293b" opacity="0.6" />
          <line x1="129" y1="88" x2="141" y2="88" stroke="#334155" strokeWidth="1.2" />
          <line x1="129" y1="96" x2="141" y2="96" stroke="#334155" strokeWidth="1.2" />
          <line x1="129" y1="104" x2="141" y2="104" stroke="#334155" strokeWidth="1.2" />

          {/* Trigger Guard & Selector Switch */}
          <path d="M 148 76 Q 166 76 160 92 Q 150 94 140 84 Z" fill="none" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 150 79 Q 155 84 152 89" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          {/* Fire Selector Lever (Set to Full Auto) */}
          <circle cx="132" cy="74" r="3" fill="#475569" />
          <line x1="132" y1="74" x2="126" y2="78" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />

          {/* Iconic Curved 30-Round Steel Magazine */}
          <path
            d="M 170 70 Q 186 98 200 128 L 184 132 Q 170 102 154 74 Z"
            fill="url(#mp5-mag)"
            stroke="#334155"
            strokeWidth="1.5"
          />
          {/* Magazine Catch & Rib Lines */}
          <path d="M 166 76 Q 180 100 194 126" fill="none" stroke="#475569" strokeWidth="1.2" opacity="0.5" />
          <rect x="160" y="68" width="12" height="6" fill="#334155" />

          {/* Ejection Port */}
          <rect x="146" y="48" width="18" height="6" rx="1" fill="#020617" stroke="#475569" strokeWidth="0.8" />
        </svg>
      );

    case WT.SHOTGUN:
      // === ESPINGARDA CALIBRE 12 (DOZE REALISTA PUMP ACTION) ===
      return (
        <svg
          viewBox="0 0 360 140"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shotgun-metal" x1="60" y1="40" x2="280" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="pump-orange" x1="180" y1="60" x2="250" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <linearGradient id="stock-wood" x1="40" y1="60" x2="130" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Technical Specs Text */}
          <text x="330" y="30" textAnchor="end" fill="#334155" opacity="0.25" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CAL: 12 GAUGE BUCKSHOT
          </text>
          <text x="330" y="44" textAnchor="end" fill="#334155" opacity="0.25" fontSize="9" fontFamily="monospace">
            TACTICAL PUMP-ACTION · SPREAD: 6 PELLETS
          </text>

          {/* Long 12-Gauge Blued Steel Barrel */}
          <rect x="130" y="46" width="170" height="11" rx="1.5" fill="url(#shotgun-metal)" stroke="#334155" strokeWidth="1.2" />
          {/* Perforated Heat Shield Shroud */}
          <rect x="150" y="44" width="130" height="4" fill="#1e293b" />
          {[0, 12, 24, 36, 48, 60, 72, 84, 96, 108].map((hx, i) => (
            <circle key={`shoth-${i}`} cx={158 + hx} cy="46" r="1.5" fill="#020617" />
          ))}

          {/* Front Brass Bead Sight */}
          <circle cx="295" cy="44" r="2.2" fill="#facc15" stroke="#92400e" strokeWidth="0.8" />

          {/* Large Open Barrel Bore Crown */}
          <rect x="298" y="45" width="6" height="20" rx="1" fill="#1e293b" stroke="#334155" />
          <circle cx="301" cy="51.5" r="4.5" fill="#020617" />
          <circle cx="301" cy="51.5" r="2.5" fill="#334155" />

          {/* Full Length Magazine Tube */}
          <rect x="130" y="58" width="160" height="9" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* Magazine Tube Knurled Cap */}
          <rect x="286" y="57" width="10" height="11" rx="1.5" fill="#475569" stroke="#1e293b" />
          <line x1="289" y1="58" x2="289" y2="67" stroke="#1e293b" strokeWidth="1" />
          <line x1="292" y1="58" x2="292" y2="67" stroke="#1e293b" strokeWidth="1" />

          {/* Barrel Clamp Ring (Brace connecting barrel & magazine tube) */}
          <rect x="276" y="45" width="6" height="23" rx="1" fill="#0f172a" stroke="#475569" strokeWidth="1" />

          {/* Iconic Orange/Black Ribbed Tactical Pump Forend (Telha de Recarga) */}
          <rect x="186" y="56" width="68" height="15" rx="3.5" fill="url(#pump-orange)" stroke="#7c2d12" strokeWidth="1.5" />
          {/* Pump Ribbed Grooves */}
          {[0, 6, 12, 18, 24, 30, 36, 42, 48, 54].map((px, i) => (
            <rect key={`pump-g-${i}`} x={192 + px} y="58" width="2.5" height="11" rx="1" fill="#7c2d12" opacity="0.85" />
          ))}

          {/* Action Bars linking pump to receiver */}
          <rect x="154" y="60" width="34" height="3" fill="#64748b" />

          {/* Solid Heavy Aluminum Receiver */}
          <path
            d="M 108 46 L 154 46 L 154 75 L 120 75 L 108 66 Z"
            fill="url(#shotgun-metal)"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* Ejection Port with Red 12-Gauge Shell */}
          <rect x="122" y="49" width="24" height="10" rx="1.5" fill="#020617" stroke="#475569" strokeWidth="1" />
          <rect x="125" y="51" width="14" height="6" rx="1" fill="#dc2626" /> {/* Red plastic hull */}
          <rect x="139" y="51" width="4" height="6" fill="#fbbf24" /> {/* Brass base cap */}

          {/* Tactical Pistol Grip & Solid Stock */}
          <path
            d="M 108 60 L 108 72 L 72 86 L 36 94 L 32 120 L 44 122 L 72 104 L 94 92 L 100 114 L 118 114 L 122 84 L 120 75 Z"
            fill="url(#stock-wood)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Thick Cushioned Rubber Recoil Pad */}
          <path d="M 32 94 L 38 94 L 46 122 L 40 122 Z" fill="#020617" stroke="#334155" strokeWidth="1.2" />
          <line x1="36" y1="102" x2="42" y2="102" stroke="#475569" strokeWidth="1.5" />
          <line x1="38" y1="112" x2="44" y2="112" stroke="#475569" strokeWidth="1.5" />

          {/* Trigger Guard & Trigger */}
          <path d="M 116 75 Q 134 75 130 92 Q 120 94 110 84 Z" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M 119 78 Q 124 84 122 89" fill="none" stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" />

          {/* Inscription Stamp */}
          <text x="130" y="70" fill="#64748b" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
            CAL 12 TACTICAL
          </text>
        </svg>
      );

    case WT.ASSAULT_RIFLE:
      // === FUZIL DE ASSALTO AK-47 ===
      return (
        <svg
          viewBox="0 0 360 140"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ak-wood" x1="100" y1="40" x2="300" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="40%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
            <linearGradient id="ak-steel" x1="80" y1="40" x2="260" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Technical Specs Text */}
          <text x="330" y="30" textAnchor="end" fill="#334155" opacity="0.25" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CAL: 7.62x39MM SOVIET
          </text>
          <text x="330" y="44" textAnchor="end" fill="#334155" opacity="0.25" fontSize="9" fontFamily="monospace">
            SELECT-FIRE · STAMPED STEEL RECEIVER
          </text>

          {/* Stamped Steel Receiver */}
          <rect x="96" y="47" width="86" height="25" rx="1.5" fill="url(#ak-steel)" stroke="#334155" strokeWidth="1.2" />

          {/* Top Receiver Dust Cover */}
          <path d="M 96 47 L 168 47 L 168 43 L 96 44 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />
          <line x1="104" y1="46" x2="160" y2="46" stroke="#64748b" strokeWidth="1" />

          {/* Bolt Handle & Safety Selector */}
          <rect x="144" y="49" width="8" height="4" rx="1" fill="#cbd5e1" />
          <line x1="112" y1="56" x2="140" y2="60" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

          {/* Receiver Rivets */}
          <circle cx="104" cy="54" r="1.5" fill="#475569" />
          <circle cx="104" cy="64" r="1.5" fill="#475569" />
          <circle cx="160" cy="65" r="1.5" fill="#475569" />

          {/* Wood Upper & Lower Handguards (Guarda-mão de Madeira) */}
          <path
            d="M 182 46 L 246 48 L 242 70 L 182 70 Z"
            fill="url(#ak-wood)"
            stroke="#451a03"
            strokeWidth="1.2"
          />
          {/* Handguard Vent Slots */}
          <rect x="194" y="52" width="12" height="3" rx="1" fill="#451a03" />
          <rect x="214" y="52" width="12" height="3" rx="1" fill="#451a03" />

          {/* Barrel, Gas Tube & Slant Muzzle Brake */}
          <rect x="244" y="50" width="58" height="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <rect x="244" y="45" width="28" height="6" fill="#0f172a" />
          {/* Cleaning Rod under Barrel */}
          <line x1="184" y1="62" x2="296" y2="62" stroke="#475569" strokeWidth="1.2" />

          {/* Hooded Front Sight Post */}
          <path d="M 284 50 L 288 38 L 292 50 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <circle cx="288" cy="42" r="3" fill="none" stroke="#334155" strokeWidth="1.2" />
          <line x1="288" y1="42" x2="288" y2="47" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Slant Muzzle Compensator */}
          <polygon points="302,50 310,48 310,59 302,58" fill="#475569" stroke="#1e293b" strokeWidth="1" />

          {/* Tangent Rear Sight Leaf */}
          <rect x="172" y="42" width="12" height="5" fill="#0f172a" stroke="#334155" />

          {/* Iconic Curved 30-Round Steel Banana Magazine */}
          <path
            d="M 148 72 Q 172 98 186 128 L 166 134 Q 150 104 132 72 Z"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1.5"
          />
          {/* Magazine Horizontal Strengthening Ribs */}
          {[0, 10, 20, 30].map((my, i) => (
            <path key={`ak-mag-r-${i}`} d={`M ${140 + my * 0.4} ${84 + my} Q ${156 + my * 0.4} ${98 + my} ${172 + my * 0.4} ${108 + my}`} fill="none" stroke="#334155" strokeWidth="1.5" opacity="0.6" />
          ))}

          {/* Wood Pistol Grip */}
          <path
            d="M 104 72 L 96 108 L 114 108 L 118 72 Z"
            fill="url(#ak-wood)"
            stroke="#451a03"
            strokeWidth="1.2"
          />

          {/* Wood Buttstock */}
          <path
            d="M 96 52 L 40 68 L 36 104 L 54 100 L 96 72 Z"
            fill="url(#ak-wood)"
            stroke="#451a03"
            strokeWidth="1.5"
          />
          {/* Steel Buttplate */}
          <path d="M 40 68 L 36 104 L 33 102 L 37 68 Z" fill="#334155" stroke="#1e293b" />

          {/* Trigger Guard & Trigger */}
          <path d="M 118 72 Q 138 72 134 88 Q 124 90 114 80 Z" fill="none" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 122 75 Q 128 80 125 85" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case WT.SNIPER:
      // === FUZIL SNIPER .50 BMG (ANTI-BLINDAGEM) ===
      return (
        <svg
          viewBox="0 0 380 140"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sniper-barrel" x1="120" y1="40" x2="340" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="scope-lens" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Technical Specs Text */}
          <text x="350" y="26" textAnchor="end" fill="#334155" opacity="0.25" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CAL: .50 BMG (12.7x99MM NATO)
          </text>
          <text x="350" y="38" textAnchor="end" fill="#334155" opacity="0.25" fontSize="9" fontFamily="monospace">
            ANTI-MATERIEL · RANGE: 2.000M · 5X PIERCE
          </text>

          {/* Colossal Fluted Heavy Barrel */}
          <rect x="150" y="56" width="168" height="11" rx="1" fill="url(#sniper-barrel)" stroke="#334155" strokeWidth="1.2" />
          {/* Fluting Grooves */}
          {[0, 24, 48, 72, 96, 120].map((fx, i) => (
            <rect key={`flute-${i}`} x={170 + fx} y="59.5" width="16" height="3" rx="1" fill="#090d16" />
          ))}

          {/* Giant Chevron Dual-Port Muzzle Brake */}
          <path
            d="M 318 53 L 344 50 L 344 72 L 318 69 Z"
            fill="#090d16"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Side Exhaust Blast Baffles */}
          <rect x="323" y="54" width="4" height="14" fill="#334155" />
          <rect x="331" y="53" width="4" height="16" fill="#334155" />
          <circle cx="343" cy="61" r="3.5" fill="#020617" />

          {/* Folded Titanium Bipod Legs */}
          <line x1="280" y1="68" x2="220" y2="76" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <circle cx="280" cy="68" r="3" fill="#1e293b" />
          <rect x="216" y="74" width="8" height="5" rx="1.5" fill="#0f172a" />

          {/* Receiver & Picatinny Rail */}
          <rect x="100" y="52" width="84" height="24" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <rect x="110" y="48" width="70" height="4" fill="#334155" />
          {/* Bolt Handle & Knurled Knob */}
          <circle cx="118" cy="56" r="3.5" fill="#64748b" />
          <line x1="118" y1="56" x2="108" y2="48" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="108" cy="48" r="3" fill="#475569" />

          {/* Heavy Illuminated Variable-Power Sniper Scope */}
          <rect x="120" y="36" width="56" height="10" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
          <rect x="114" y="34" width="10" height="14" rx="1" fill="#0f172a" stroke="#334155" />
          <rect x="172" y="32" width="14" height="18" rx="1.5" fill="#0f172a" stroke="#334155" />
          {/* Sapphire Anti-Reflective Lens Glow */}
          <ellipse cx="185" cy="41" rx="2" ry="7" fill="url(#scope-lens)" />
          {/* Elevation & Windage Turrets */}
          <rect x="144" y="28" width="8" height="8" rx="1" fill="#334155" stroke="#1e293b" />
          <rect x="144" y="38" width="8" height="5" rx="1" fill="#475569" />
          {/* Scope Mounting Rings */}
          <rect x="128" y="44" width="6" height="8" fill="#475569" />
          <rect x="162" y="44" width="6" height="8" fill="#475569" />

          {/* Detachable Box Magazine for .50 BMG */}
          <polygon points="144,76 172,76 166,112 140,110" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <line x1="148" y1="84" x2="164" y2="85" stroke="#334155" strokeWidth="1.5" />
          <line x1="146" y1="94" x2="162" y2="95" stroke="#334155" strokeWidth="1.5" />

          {/* Skeletonized Sniper Chassis Stock */}
          <path
            d="M 100 62 L 40 68 L 32 108 L 52 108 L 68 86 L 100 76 Z"
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Adjustable Cheek Rest & Recoil Monopod */}
          <rect x="52" y="58" width="28" height="8" rx="2" fill="#334155" />
          <rect x="30" y="86" width="6" height="24" rx="1" fill="#475569" />

          {/* Tactical Pistol Grip & Match Trigger */}
          <path d="M 100 76 L 94 106 L 112 106 L 116 76 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
          <path d="M 116 76 Q 134 76 130 92 Q 120 94 112 84 Z" fill="none" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 120 79 Q 124 84 122 88" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case WT.MINIGUN:
      // === MINIGUN ROTATIVA M134 ===
      return (
        <svg
          viewBox="0 0 380 140"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mini-barrel" x1="140" y1="40" x2="330" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="brass-belt" x1="110" y1="70" x2="160" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* Technical Specs Text */}
          <text x="350" y="26" textAnchor="end" fill="#334155" opacity="0.25" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CAL: 7.62x51MM NATO (6-BARREL GATLING)
          </text>
          <text x="350" y="38" textAnchor="end" fill="#334155" opacity="0.25" fontSize="9" fontFamily="monospace">
            RATE: 3.000 RPM · MOTORIZED ROTOR HUB
          </text>

          {/* Six Distinct Rotating Heavy Steel Barrels */}
          {[
            { y: 46, h: 4 },
            { y: 52, h: 4 },
            { y: 58, h: 4 },
            { y: 64, h: 4 },
            { y: 70, h: 4 },
          ].map((bar, i) => (
            <rect key={`minib-${i}`} x="170" y={bar.y} width="150" height={bar.h} fill="url(#mini-barrel)" stroke="#090d16" strokeWidth="0.8" />
          ))}

          {/* Three Circular Barrel Clamp Ring Collars */}
          {[195, 245, 295].map((cx, i) => (
            <g key={`collar-${i}`}>
              <rect x={cx} y="44" width="9" height="32" rx="2" fill="#090d16" stroke="#475569" strokeWidth="1" />
              <circle cx={cx + 4.5} cy="48" r="1.5" fill="#cbd5e1" />
              <circle cx={cx + 4.5} cy="60" r="1.5" fill="#cbd5e1" />
              <circle cx={cx + 4.5} cy="72" r="1.5" fill="#cbd5e1" />
            </g>
          ))}

          {/* Front Muzzle Rotor Crown with 6 Bore Exits */}
          <rect x="320" y="43" width="8" height="34" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          {[46, 52, 58, 64, 70].map((by, i) => (
            <circle key={`muzzle-bore-${i}`} cx="325" cy={by + 2} r="1.8" fill="#020617" />
          ))}

          {/* Electric Rotor Motor Housing Block */}
          <rect x="110" y="42" width="64" height="36" rx="3" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          {/* Cooling Fins on Motor */}
          {[0, 6, 12, 18, 24, 30].map((mx, i) => (
            <line key={`motor-fin-${i}`} x1={116 + mx} y1="46" x2={116 + mx} y2="74" stroke="#1e293b" strokeWidth="2.5" />
          ))}
          {/* Power Status LED */}
          <circle cx="164" cy="48" r="2.5" fill="#0284c7" className="animate-pulse" />

          {/* Flexible Ammo Feed Chute & 7.62mm Linked Brass Belt */}
          <path
            d="M 124 78 Q 110 98 126 126 L 144 120 Q 130 96 142 78 Z"
            fill="url(#brass-belt)"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          {/* Linked Cartridges */}
          {[0, 8, 16, 24, 32].map((by, i) => (
            <rect key={`brass-cart-${i}`} x="120" y={84 + by} width="16" height="4" rx="1" fill="#facc15" stroke="#92400e" strokeWidth="0.8" />
          ))}

          {/* Top Carrying Support Bar with Handle */}
          <path
            d="M 112 42 L 112 28 L 190 28 L 190 42"
            fill="none"
            stroke="#334155"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="132" y="24" width="38" height="8" rx="2" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1" />

          {/* Dual Rear Spade Grips & Butterfly Triggers */}
          <path d="M 90 46 L 110 46 M 90 74 L 110 74" stroke="#334155" strokeWidth="4" />
          <rect x="84" y="42" width="8" height="36" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <circle cx="88" cy="60" r="3.5" fill="#ef4444" /> {/* Trigger button */}
        </svg>
      );

    case WT.ICE_REVOLVER:
      // === REVÓLVER DO GELO .44 FROST ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ice-rev-grad" x1="60" y1="40" x2="280" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
          </defs>
          <text x="310" y="32" textAnchor="end" fill="#38bdf8" opacity="0.35" fontSize="11" fontFamily="monospace" fontWeight="bold">
            CRYO-TITANIUM .44 SUBZERO
          </text>
          {/* Heavy Ice Barrel */}
          <rect x="175" y="43" width="95" height="15" rx="1.5" fill="url(#ice-rev-grad)" stroke="#38bdf8" strokeWidth="1.2" />
          <rect x="175" y="58" width="90" height="9" rx="1" fill="#075985" stroke="#38bdf8" strokeWidth="0.8" />
          {/* Glowing Cryo-Chamber */}
          <rect x="120" y="44" width="46" height="26" rx="3" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="124" y="54" width="38" height="6" rx="3" fill="#38bdf8" className="animate-pulse" />
          {/* Frame & Grip */}
          <path d="M 96 42 L 175 42 L 175 72 L 102 70 Z" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
          <path d="M 96 70 Q 86 100 76 126 Q 96 132 110 126 L 118 75 Z" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Ice Shard Icicles on Barrel */}
          <polygon points="210,58 215,67 220,58" fill="#bae6fd" />
          <polygon points="240,58 244,69 248,58" fill="#bae6fd" />
          {/* Muzzle */}
          <rect x="270" y="42" width="6" height="24" rx="1.5" fill="#38bdf8" />
          <circle cx="273" cy="50.5" r="4.5" fill="#e0f2fe" />
        </svg>
      );

    case WT.HUNTING_RIFLE:
      // === RIFLE DE CAÇA ÁRTICO 7.62 ===
      return (
        <svg viewBox="0 0 360 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="330" y="30" textAnchor="end" fill="#06b6d4" opacity="0.35" fontSize="11" fontFamily="monospace" fontWeight="bold">
            ARCTIC BOLT-ACTION 7.62x54R
          </text>
          {/* Long Precision Barrel */}
          <rect x="140" y="52" width="160" height="8" rx="1" fill="#334155" stroke="#06b6d4" strokeWidth="1" />
          <rect x="296" y="50" width="8" height="12" rx="1" fill="#0e7490" />
          {/* Classic Hunting Stock */}
          <path d="M 60 70 L 140 56 L 240 56 L 236 68 L 130 76 L 68 116 L 40 110 Z" fill="#164e63" stroke="#06b6d4" strokeWidth="1.5" />
          {/* Bolt Handle */}
          <circle cx="132" cy="52" r="3.5" fill="#cbd5e1" />
          <line x1="132" y1="52" x2="124" y2="44" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Telescopic Hunting Sight */}
          <rect x="130" y="38" width="58" height="8" rx="1" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
          <rect x="124" y="36" width="8" height="12" fill="#082f49" />
          <rect x="186" y="35" width="10" height="14" fill="#082f49" />
          <ellipse cx="195" cy="42" rx="1.5" ry="5" fill="#22d3ee" />
        </svg>
      );

    case WT.ICE_STAFF:
      // === CAJADO DE GELO ANCESTRAL ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="310" y="30" textAnchor="end" fill="#38bdf8" opacity="0.35" fontSize="11" fontFamily="monospace" fontWeight="bold">
            ANCESTRAL ICE ARTIFACT · DUAL FLOATING SPIKES
          </text>
          {/* Staff Rod */}
          <rect x="60" y="66" width="190" height="8" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Runic Carvings on Rod */}
          {[80, 110, 140, 170, 200].map((rx, i) => (
            <circle key={`runerod-${i}`} cx={rx} cy="70" r="2" fill="#38bdf8" className="animate-pulse" />
          ))}
          {/* Floating Crystalline Head */}
          <polygon points="265,70 280,52 295,70 280,88" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <polygon points="270,70 280,58 290,70 280,82" fill="#e0f2fe" />
          {/* Floating Ice Spikes hovering around staff */}
          <g className="animate-bounce-subtle">
            <polygon points="240,40 258,40 249,24" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <polygon points="244,40 254,40 249,28" fill="#bae6fd" />
            <polygon points="240,100 258,100 249,116" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <polygon points="244,100 254,100 249,112" fill="#bae6fd" />
          </g>
        </svg>
      );

    case WT.DRAGON_SERPENT:
      // === RELÍQUIA DO DRAGÃO SERPENTE (IMPERIAL SOLAR SHENLONG) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dragonGoldBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c2d12" />
              <stop offset="40%" stopColor="#ea580c" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
            <radialGradient id="dragonOrb" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>
          </defs>

          {/* Oriental Cloud Motifs / Aura */}
          <path d="M 30 70 Q 50 50 70 70 T 110 70" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.25" fill="none" />
          <path d="M 180 30 Q 200 15 220 30 T 250 30" stroke="#fde047" strokeWidth="1.2" strokeOpacity="0.25" fill="none" />

          {/* Text Watermark */}
          <text x="315" y="24" textAnchor="end" fill="#f97316" opacity="0.45" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SOLAR SERPENT DRAGON · SHENLONG RELIC
          </text>

          {/* Sinuous Dragon Body with Dorsal Flame Spines */}
          <path d="M 35 90 Q 75 35 130 80 T 225 65 Q 255 55 280 72" stroke="url(#dragonGoldBody)" strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d="M 35 90 Q 75 35 130 80 T 225 65 Q 255 55 280 72" stroke="#fef08a" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Dorsal Flame Fins */}
          <path d="M 70 54 L 66 42 L 78 50 M 115 58 L 118 44 L 126 56 M 175 74 L 180 60 L 188 72 M 220 62 L 225 48 L 232 60" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="#ea580c" />

          {/* Dragon Talons / Claws */}
          <g stroke="#facc15" strokeWidth="2" strokeLinecap="round">
            <path d="M 100 78 L 94 94 M 94 94 L 88 98 M 94 94 L 95 101 M 94 94 L 102 98" />
            <path d="M 195 72 L 198 88 M 198 88 L 192 92 M 198 88 L 200 95 M 198 88 L 206 91" />
          </g>

          {/* Flowing Tail Fan */}
          <path d="M 35 90 Q 18 100 12 114 Q 22 102 30 98 Q 14 116 8 126 Q 24 112 36 94" fill="#f97316" opacity="0.85" />

          {/* Majestic Dragon Head */}
          <g>
            {/* Dragon Skull */}
            <ellipse cx="282" cy="72" rx="14" ry="10" fill="#c2410c" stroke="#fde047" strokeWidth="2" />
            {/* Jaws / Mouth open */}
            <path d="M 288 68 L 298 67 L 293 74 L 298 77 L 288 77" fill="#7c2d12" stroke="#fde047" strokeWidth="1.5" />
            {/* Fangs */}
            <polygon points="292,67 294,71 296,67" fill="#ffffff" />
            <polygon points="292,77 294,73 296,77" fill="#ffffff" />

            {/* Imperial Branching Horns */}
            <path d="M 276 64 Q 268 45 258 40 M 270 52 Q 262 48 260 42" stroke="#fde047" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 278 62 Q 272 40 264 34 M 274 48 Q 268 42 268 36" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />

            {/* Glowing Golden Eye */}
            <ellipse cx="284" cy="68" rx="3" ry="2.2" fill="#ffffff" />
            <ellipse cx="284.5" cy="68" rx="1.5" ry="2" fill="#ea580c" />

            {/* Sinuous Waving Whiskers */}
            <path d="M 292 70 Q 308 60 326 66" stroke="#fef08a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 292 76 Q 306 88 322 84" stroke="#fde047" strokeWidth="1.6" fill="none" strokeLinecap="round" />

            {/* Flaming Solar Orb */}
            <circle cx="316" cy="72" r="10" fill="url(#dragonOrb)" stroke="#fde047" strokeWidth="1.8" />
            <circle cx="314" cy="70" r="3.5" fill="#ffffff" />
          </g>
        </svg>
      );

    case WT.ICE_FIRE_DRAGON:
      // === ICE AND FIRE SERPENT DRAGONS (10X MASTERPIECE DESIGN) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Fire Dragon Gradient */}
            <linearGradient id="fireDragonScale" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9a3412" />
              <stop offset="35%" stopColor="#ea580c" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>

            {/* Ice Dragon Gradient */}
            <linearGradient id="iceDragonScale" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="35%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#f0f9ff" />
            </linearGradient>

            {/* Cosmic Void Pearl Gradient */}
            <radialGradient id="voidCosmicOrb" cx="38%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#f5d0fe" />
              <stop offset="55%" stopColor="#c084fc" />
              <stop offset="85%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </radialGradient>

            {/* Starfield / Void Halo */}
            <radialGradient id="voidHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#7e22ce" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Ambient Elemental Energy Runes */}
          <text x="320" y="22" textAnchor="end" fill="#c084fc" opacity="0.6" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            10X SUPREME SERPENTS · TWIN DRAGONS & VOID FUSION
          </text>

          {/* Subtle Yin-Yang Elemental Energy Wave */}
          <path d="M 25 70 Q 80 40 140 70 T 255 70" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.3" fill="none" />

          {/* ========================================================
              1. FIRE DRAGON (Top Arc - Sinuous Crimson, Flame & Gold)
             ======================================================== */}
          {/* Flame Dorsal Crest Fins */}
          <g stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" fill="#ea580c">
            <path d="M 65 38 L 60 26 L 72 34" />
            <path d="M 105 32 L 108 18 L 118 30" />
            <path d="M 160 36 L 164 22 L 174 34" />
            <path d="M 215 40 L 222 28 L 228 40" />
          </g>

          {/* Fire Dragon Sinuous Body */}
          <path d="M 30 46 Q 70 18 120 42 T 210 35 Q 240 28 262 40" stroke="url(#fireDragonScale)" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M 30 46 Q 70 18 120 42 T 210 35 Q 240 28 262 40" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Fire Dragon Talons / Claws */}
          <g stroke="#facc15" strokeWidth="1.8" strokeLinecap="round">
            <path d="M 95 38 L 92 50 L 87 53 M 92 50 L 92 56 M 92 50 L 98 54" />
            <path d="M 180 38 L 183 48 L 178 51 M 183 48 L 184 55 M 183 48 L 189 51" />
          </g>

          {/* Fire Tail Plume (Phoenix flames) */}
          <path d="M 30 46 Q 16 52 10 64 Q 20 54 26 50 Q 12 66 6 74 Q 22 62 30 48" fill="#f97316" opacity="0.85" />

          {/* Fire Dragon Head */}
          <g>
            <ellipse cx="264" cy="40" rx="12" ry="8.5" fill="#c2410c" stroke="#fde047" strokeWidth="1.8" />
            {/* Open Roaring Jaw */}
            <path d="M 268 37 L 277 36 L 273 42 L 277 45 L 268 45" fill="#7c2d12" stroke="#fde047" strokeWidth="1.4" />
            <polygon points="271,36 273,39 275,36" fill="#ffffff" />
            <polygon points="271,45 273,42 275,45" fill="#ffffff" />

            {/* Stag-like Golden Antlers */}
            <path d="M 258 34 Q 252 18 242 14 M 254 24 Q 246 22 244 16" stroke="#fde047" strokeWidth="2.4" strokeLinecap="round" />
            {/* Glowing Amber Eye with Ruby brow */}
            <circle cx="266" cy="37" r="2.5" fill="#ffffff" />
            <circle cx="266.5" cy="37" r="1.3" fill="#ea580c" />
            {/* Flowing Whiskers */}
            <path d="M 272 38 Q 285 28 300 34" stroke="#fef08a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 272 43 Q 284 52 296 48" stroke="#fde047" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>

          {/* ========================================================
              2. ICE DRAGON (Bottom Arc - Azure, Diamond & Frost Spikes)
             ======================================================== */}
          {/* Crystalline Dorsal Spikes */}
          <g stroke="#bae6fd" strokeWidth="1.8" strokeLinecap="round" fill="#0284c7">
            <path d="M 65 102 L 60 114 L 72 106" />
            <path d="M 105 108 L 108 122 L 118 110" />
            <path d="M 160 104 L 164 118 L 174 106" />
            <path d="M 215 100 L 222 112 L 228 100" />
          </g>

          {/* Ice Dragon Sinuous Body */}
          <path d="M 30 94 Q 70 122 120 98 T 210 105 Q 240 112 262 100" stroke="url(#iceDragonScale)" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M 30 94 Q 70 122 120 98 T 210 105 Q 240 112 262 100" stroke="#f0f9ff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Ice Dragon Talons / Claws */}
          <g stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round">
            <path d="M 95 102 L 92 90 L 87 87 M 92 90 L 92 84 M 92 90 L 98 86" />
            <path d="M 180 102 L 183 92 L 178 89 M 183 92 L 184 85 M 183 92 L 189 89" />
          </g>

          {/* Crystalline Snowflake Tail */}
          <path d="M 30 94 L 14 100 L 22 92 L 10 90 L 22 88 L 14 80 L 26 88 L 30 94" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.2" opacity="0.9" />

          {/* Ice Dragon Head */}
          <g>
            <ellipse cx="264" cy="100" rx="12" ry="8.5" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.8" />
            {/* Open Roaring Jaw */}
            <path d="M 268 97 L 277 96 L 273 102 L 277 105 L 268 105" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.4" />
            <polygon points="271,96 273,99 275,96" fill="#ffffff" />
            <polygon points="271,105 273,102 275,105" fill="#ffffff" />

            {/* Faceted Ice Antlers */}
            <path d="M 258 106 Q 252 122 242 126 M 254 116 Q 246 118 244 124" stroke="#bae6fd" strokeWidth="2.4" strokeLinecap="round" />
            {/* Glowing Diamond Eye */}
            <circle cx="266" cy="97" r="2.5" fill="#ffffff" />
            <circle cx="266.5" cy="97" r="1.3" fill="#0284c7" />
            {/* Flowing Frost Whiskers */}
            <path d="M 272 98 Q 285 108 300 104" stroke="#e0f2fe" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 272 103 Q 284 92 296 96" stroke="#bae6fd" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>

          {/* ========================================================
              3. CENTRAL COSMIC VOID FUSION PEARL (MEGA DRAGÃO ROXO)
             ======================================================== */}
          <g>
            {/* Pulsing Outer Nebula Aura */}
            <circle cx="304" cy="70" r="28" fill="url(#voidHalo)" />

            {/* Orbiting Celestial Rings */}
            <ellipse cx="304" cy="70" rx="26" ry="9" stroke="#f0abfc" strokeWidth="1.8" transform="rotate(-25 304 70)" strokeDasharray="5 2" opacity="0.8" />
            <ellipse cx="304" cy="70" rx="25" ry="8" stroke="#38bdf8" strokeWidth="1.4" transform="rotate(35 304 70)" strokeDasharray="4 3" opacity="0.75" />

            {/* The Solid Mystic Void Core */}
            <circle cx="304" cy="70" r="15" fill="url(#voidCosmicOrb)" stroke="#f5d0fe" strokeWidth="2" />
            <circle cx="301" cy="67" r="4.5" fill="#ffffff" />

            {/* Crackling Violet Lightning Sparks */}
            <path d="M 292 68 L 296 64 L 300 68 L 304 63" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
          </g>
        </svg>
      );

    case WT.SOLAR_CANNON:
      // === CANHÃO SOLAR DE RÁ ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="solar-gold" x1="40" y1="40" x2="280" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <radialGradient id="sun-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
          </defs>
          <text x="320" y="24" textAnchor="end" fill="#f59e0b" opacity="0.4" fontSize="10" fontFamily="monospace" fontWeight="bold">
            RELÍQUIA SOLAR · SOLAR RAY AMPLIFIER
          </text>
          {/* Heavy Armored Chassis */}
          <rect x="50" y="52" width="160" height="36" rx="6" fill="#1e293b" stroke="#b45309" strokeWidth="2" />
          <rect x="65" y="58" width="130" height="24" rx="3" fill="url(#solar-gold)" opacity="0.85" />
          {/* Hieroglyphic Rune Engravings */}
          <path d="M 80 70 L 100 70 M 110 65 L 110 75 M 120 70 L 135 65 L 135 75 Z M 150 70 L 175 70" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
          {/* Solar Battery Chamber with Glass Window */}
          <rect x="180" y="55" width="45" height="30" rx="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="202" cy="70" r="10" fill="url(#sun-core)" />
          {/* Quad Accelerator Prongs */}
          <path d="M 225 54 L 285 46 M 225 64 L 295 60 M 225 76 L 295 80 M 225 86 L 285 94" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
          {/* Focused Solar Emitter Core */}
          <circle cx="280" cy="70" r="14" fill="url(#sun-core)" stroke="#fde047" strokeWidth="2" />
          <circle cx="280" cy="70" r="6" fill="#ffffff" />
          {/* Radiating Sun Rays */}
          <path d="M 280 50 L 280 44 M 280 90 L 280 96 M 298 60 L 306 54 M 298 80 L 306 86" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case WT.DESERT_SNIPER:
      // === FUZIL ANTI-BLINDAGEM DAS DUNAS (.50 BMG DESERT) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="desert-camo" x1="40" y1="40" x2="300" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="35%" stopColor="#d97706" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <text x="320" y="24" textAnchor="end" fill="#ca8a04" opacity="0.4" fontSize="10" fontFamily="monospace" fontWeight="bold">
            CAL: .50 BMG DESERT AP · EXTREME VELOCITY
          </text>
          {/* Ergonomic Sniper Stock with Cheek Riser */}
          <path d="M 40 85 L 85 85 L 95 68 L 45 68 Z" fill="#1e293b" stroke="#78350f" strokeWidth="1.5" />
          <rect x="42" y="60" width="35" height="7" rx="2" fill="#ca8a04" />
          {/* Main Receiver Chassis (Desert Sand Finish) */}
          <rect x="90" y="62" width="120" height="24" rx="3" fill="url(#desert-camo)" stroke="#451a03" strokeWidth="1.5" />
          {/* Extended .50 Heavy Match Barrel */}
          <rect x="210" y="68" width="95" height="10" fill="#0f172a" stroke="#ca8a04" strokeWidth="1" />
          {/* Massive Dual-Chamber Muzzle Brake */}
          <rect x="305" y="64" width="22" height="18" rx="2" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="312" y1="67" x2="312" y2="79" stroke="#fbbf24" strokeWidth="2" />
          <line x1="318" y1="67" x2="318" y2="79" stroke="#fbbf24" strokeWidth="2" />
          {/* High-Power Tactical Scope */}
          <rect x="115" y="44" width="75" height="13" rx="2.5" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
          <rect x="105" y="42" width="14" height="17" rx="2" fill="#1e293b" stroke="#ca8a04" strokeWidth="1" />
          <rect x="186" y="40" width="18" height="21" rx="2" fill="#1e293b" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="195" cy="50.5" r="5" fill="#38bdf8" opacity="0.8" />
          {/* Scope Mount Turrets */}
          <rect x="130" y="57" width="10" height="5" fill="#334155" />
          <rect x="165" y="57" width="10" height="5" fill="#334155" />
          {/* 10-Round Desert Heavy Magazine */}
          <path d="M 140 86 L 155 86 L 150 115 L 135 115 Z" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
          {/* Folded Desert Bipod */}
          <path d="M 235 78 L 265 98 M 235 78 L 255 102" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case WT.CHAOS_GUN:
      // === FUZIS GÊMEOS DO CAOS (CHAOS GUN - VÔO AUTÔNOMO & DISPAROS ALTERNADOS) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chaos-flame" x1="0" y1="0" x2="300" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#f97316" />
              <stop offset="70%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="chaos-thruster-jet" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#f43f5e" />
              <stop offset="70%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <radialGradient id="chaos-plasma-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fb7185" />
              <stop offset="75%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="chaos-obsidian" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="45%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <filter id="chaos-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Kicker label */}
          <text x="320" y="20" textAnchor="end" fill="#f43f5e" opacity="0.8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            VÔO AUTÔNOMO COM PROPULSORES · DISPARO ALTERNADO
          </text>
          <text x="320" y="32" textAnchor="end" fill="#fb7185" opacity="0.45" fontSize="8" fontFamily="monospace">
            TELEMETRIA PSIONICA · CAL. PLASMA DEMONÍACO 30MM
          </text>

          {/* Flight dynamic energy stream between the twin rifles */}
          <path d="M 50 42 C 90 60, 110 50, 160 70" stroke="url(#chaos-flame)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

          {/* === UPPER RIFLE (Fuzil Flutuante Esquerdo - Em Posição de Disparo) === */}
          <g transform="translate(15, 18)">
            {/* Aerodynamic Flight Trail & Thruster Backfire */}
            <path d="M -15 24 L 25 18 L 25 30 Z" fill="url(#chaos-thruster-jet)" opacity="0.8" />
            <line x1="-30" y1="24" x2="20" y2="24" stroke="#fb7185" strokeWidth="2" strokeDasharray="6 3" opacity="0.7" />

            {/* Plasma Levitation Aura */}
            <ellipse cx="140" cy="24" rx="115" ry="17" fill="url(#chaos-flame)" opacity="0.22" filter="url(#chaos-glow)" />

            {/* Floating Gyroscopic Anti-Gravity Rings */}
            <ellipse cx="26" cy="24" rx="7" ry="18" fill="none" stroke="#f43f5e" strokeWidth="2.5" opacity="0.9" />
            <ellipse cx="26" cy="24" rx="3.5" ry="11" fill="#fb7185" opacity="0.6" />
            <circle cx="26" cy="24" r="2" fill="#ffffff" />

            {/* Aerodynamic Forward-Swept Stabilizer Fin */}
            <path d="M 75 14 L 115 6 L 130 14 Z" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.2" />

            {/* Main Obsidian Chassis */}
            <path d="M 32 26 L 68 26 L 85 14 L 210 14 L 230 20 L 215 32 L 68 32 Z" fill="url(#chaos-obsidian)" stroke="#f43f5e" strokeWidth="1.8" />

            {/* Runic Heat Conduits */}
            <path d="M 90 20 L 135 20 L 145 26 L 195 26" stroke="#fb7185" strokeWidth="1.5" fill="none" opacity="0.85" />
            
            {/* Exposed Glowing Plasma Fusion Core */}
            <rect x="100" y="17" width="55" height="9" rx="2.5" fill="#450a0a" stroke="#f97316" strokeWidth="1.3" />
            <rect x="103" y="19" width="49" height="5" rx="1.5" fill="url(#chaos-flame)" />
            <line x1="115" y1="17" x2="115" y2="26" stroke="#fbbf24" strokeWidth="1" />
            <line x1="130" y1="17" x2="130" y2="26" stroke="#fbbf24" strokeWidth="1" />

            {/* Dual Precision Carbon-Plasma Barrels */}
            <rect x="210" y="16" width="76" height="5.5" rx="1.5" fill="#020617" stroke="#e11d48" strokeWidth="1.2" />
            <rect x="210" y="24" width="72" height="5" rx="1.5" fill="#020617" stroke="#f97316" strokeWidth="1.2" />

            {/* Cooling Heatsink Vents */}
            {[0, 8, 16, 24].map((vx, i) => (
              <line key={`vent-up-${i}`} x1={155 + vx} y1="16" x2={155 + vx} y2="22" stroke="#f43f5e" strokeWidth="1.2" />
            ))}

            {/* Muzzle Plasma Spike & Active Shot Spark */}
            <circle cx="294" cy="22" r="8" fill="url(#chaos-plasma-glow)" />
            <path d="M 288 22 L 320 22" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <polygon points="295,14 315,22 295,30" fill="url(#chaos-flame)" opacity="0.75" />

            {/* Demonic Horn Crest */}
            <path d="M 135 14 Q 165 2 188 6" stroke="#f43f5e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          </g>

          {/* === LOWER RIFLE (Fuzil Flutuante Direito - Estabilizado em Vôo com Propulsão) === */}
          <g transform="translate(32, 70)">
            {/* Aerodynamic Flight Trail & Thruster Backfire */}
            <path d="M -15 24 L 25 18 L 25 30 Z" fill="url(#chaos-thruster-jet)" opacity="0.8" />
            <line x1="-30" y1="24" x2="20" y2="24" stroke="#d946ef" strokeWidth="2" strokeDasharray="6 3" opacity="0.7" />

            {/* Plasma Levitation Aura */}
            <ellipse cx="140" cy="24" rx="115" ry="17" fill="url(#chaos-flame)" opacity="0.22" filter="url(#chaos-glow)" />

            {/* Floating Gyroscopic Anti-Gravity Rings */}
            <ellipse cx="26" cy="24" rx="7" ry="18" fill="none" stroke="#a855f7" strokeWidth="2.5" opacity="0.9" />
            <ellipse cx="26" cy="24" rx="3.5" ry="11" fill="#d946ef" opacity="0.6" />
            <circle cx="26" cy="24" r="2" fill="#ffffff" />

            {/* Aerodynamic Stabilizer Fin */}
            <path d="M 75 14 L 115 6 L 130 14 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="1.2" />

            {/* Main Obsidian Chassis */}
            <path d="M 32 26 L 68 26 L 85 14 L 210 14 L 230 20 L 215 32 L 68 32 Z" fill="url(#chaos-obsidian)" stroke="#a855f7" strokeWidth="1.8" />

            {/* Runic Heat Conduits */}
            <path d="M 90 20 L 135 20 L 145 26 L 195 26" stroke="#d946ef" strokeWidth="1.5" fill="none" opacity="0.85" />

            {/* Exposed Glowing Plasma Fusion Core */}
            <rect x="100" y="17" width="55" height="9" rx="2.5" fill="#3b0764" stroke="#d946ef" strokeWidth="1.3" />
            <rect x="103" y="19" width="49" height="5" rx="1.5" fill="url(#chaos-flame)" />
            <line x1="115" y1="17" x2="115" y2="26" stroke="#f472b6" strokeWidth="1" />
            <line x1="130" y1="17" x2="130" y2="26" stroke="#f472b6" strokeWidth="1" />

            {/* Dual Precision Carbon-Plasma Barrels */}
            <rect x="210" y="16" width="76" height="5.5" rx="1.5" fill="#020617" stroke="#ec4899" strokeWidth="1.2" />
            <rect x="210" y="24" width="72" height="5" rx="1.5" fill="#020617" stroke="#f43f5e" strokeWidth="1.2" />

            {/* Cooling Heatsink Vents */}
            {[0, 8, 16, 24].map((vx, i) => (
              <line key={`vent-down-${i}`} x1={155 + vx} y1="16" x2={155 + vx} y2="22" stroke="#d946ef" strokeWidth="1.2" />
            ))}

            {/* Muzzle Plasma Spike */}
            <circle cx="294" cy="22" r="7" fill="url(#chaos-plasma-glow)" />
            <path d="M 288 22 L 312 22" stroke="#fecdd3" strokeWidth="2.5" strokeLinecap="round" />

            {/* Demonic Horn Crest */}
            <path d="M 135 14 Q 165 2 188 6" stroke="#ec4899" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      );


    case WT.SCORPION_SMG:
      // === SUBMETRALHADORA ESCORPIÃO DAS AREIAS ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="scorp-desert-body" x1="50" y1="30" x2="260" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="scorp-venom-glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <radialGradient id="scorp-stinger-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Watermark Specs */}
          <text x="310" y="24" textAnchor="end" fill="#d97706" opacity="0.65" fontSize="10" fontFamily="monospace" fontWeight="bold">
            CAL: 9MM SCORPION VENOM · 50-RDS DUAL DRUM
          </text>
          <text x="310" y="36" textAnchor="end" fill="#10b981" opacity="0.5" fontSize="8" fontFamily="monospace">
            DARDO ÁCIDO CORROSIVO · CADÊNCIA 18 T/S
          </text>

          {/* Scorpion Silhouette Icon in background */}
          <path d="M 260 50 Q 280 35 295 42 Q 305 50 300 62 Q 295 70 280 65" stroke="#ca8a04" strokeWidth="1.5" fill="none" opacity="0.3" />

          {/* Rear Stock (Folded Desert Polymer) */}
          <path d="M 40 45 L 80 45 L 75 75 L 45 80 Z" fill="#1e293b" stroke="#78350f" strokeWidth="1.4" />
          <line x1="50" y1="52" x2="72" y2="52" stroke="#d97706" strokeWidth="1.2" />
          <line x1="50" y1="62" x2="70" y2="62" stroke="#d97706" strokeWidth="1.2" />

          {/* Main Receiver Chassis (Desert Ochre & Carbon Fiber) */}
          <path d="M 80 40 L 220 40 L 235 48 L 225 72 L 140 72 L 125 82 L 95 82 L 80 65 Z" fill="url(#scorp-desert-body)" stroke="#451a03" strokeWidth="1.6" />

          {/* Upper Scorpion-Arch Charging Bridge */}
          <path d="M 120 40 Q 160 22 205 34 L 205 40 Z" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.4" />
          <line x1="140" y1="33" x2="190" y2="33" stroke="#10b981" strokeWidth="1.5" />

          {/* Glowing Toxic Acid / Venom Reservoir Chamber */}
          <rect x="135" y="46" width="55" height="10" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="1.4" />
          <rect x="138" y="48" width="49" height="6" rx="2" fill="url(#scorp-venom-glow)" />
          <line x1="155" y1="46" x2="155" y2="56" stroke="#a7f3d0" strokeWidth="1" />
          <line x1="172" y1="46" x2="172" y2="56" stroke="#a7f3d0" strokeWidth="1" />

          {/* Curved Forward Scorpion Barrel Shroud */}
          <rect x="220" y="44" width="60" height="14" rx="2" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.4" />
          {/* Barrel Cooling Ports */}
          {[0, 10, 20, 30, 40].map((px, i) => (
            <circle key={`vport-${i}`} cx={230 + px} cy={51} r="2.2" fill="#10b981" opacity="0.8" />
          ))}

          {/* Muzzle Brake & Stinger Flash Suppressor */}
          <path d="M 280 42 L 298 46 L 298 56 L 280 60 Z" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="298" cy="51" r="5" fill="url(#scorp-stinger-core)" />
          <path d="M 298 48 L 312 45 M 298 51 L 316 51 M 298 54 L 312 57" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />

          {/* Tactical Pistol Grip (Stippled) */}
          <path d="M 98 75 L 122 75 L 115 118 L 88 118 Z" fill="#0f172a" stroke="#78350f" strokeWidth="1.5" />
          {[0, 6, 12, 18, 24].map((gy, i) => (
            <line key={`sgrip-${i}`} x1={96} y1={84 + gy} x2={114} y2={84 + gy} stroke="#ca8a04" strokeWidth="1.2" opacity="0.6" />
          ))}

          {/* Curved High-Capacity Desert Dual Magazine */}
          <path d="M 148 72 Q 155 105 178 126 L 160 128 Q 140 105 135 72 Z" fill="#1e293b" stroke="#d97706" strokeWidth="1.6" />
          <path d="M 152 72 Q 159 105 182 126" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Match Trigger & Guard */}
          <path d="M 122 75 Q 138 75 135 92 Q 124 94 116 84" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 126 79 Q 130 85 127 88" stroke="#10b981" strokeWidth="2" fill="none" />
        </svg>
      );

    case WT.ANUBIS_SHOTGUN:
      // === TRABUCO SAGRADO DE ANÚBIS ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="anubis-basalt" x1="0" y1="0" x2="320" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="anubis-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <radialGradient id="anubis-eye-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Watermark Specs */}
          <text x="315" y="22" textAnchor="end" fill="#f59e0b" opacity="0.8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            CAL: 12-GAUGE ANUBIS · BASALTO NEGRO & OURO
          </text>
          <text x="315" y="34" textAnchor="end" fill="#d97706" opacity="0.5" fontSize="8" fontFamily="monospace">
            8 BALOTES FUNERÁRIOS · MALDIÇÃO DAS PIRÂMIDES
          </text>

          {/* Basalt Stock with Golden Egyptian Inlays */}
          <path d="M 35 48 L 95 48 L 90 74 L 115 78 L 108 115 L 75 115 L 45 92 Z" fill="url(#anubis-basalt)" stroke="#f59e0b" strokeWidth="1.8" />
          {/* Golden Pharaoh Hieroglyphic Bands on Stock */}
          <line x1="50" y1="58" x2="80" y2="58" stroke="url(#anubis-gold)" strokeWidth="2.5" />
          <line x1="55" y1="68" x2="82" y2="68" stroke="url(#anubis-gold)" strokeWidth="2" />
          <circle cx="70" cy="85" r="4" fill="#f59e0b" />

          {/* Main Heavy Receiver with Jackal-Head Emblem */}
          <rect x="95" y="44" width="70" height="32" rx="3" fill="url(#anubis-basalt)" stroke="#f59e0b" strokeWidth="2" />
          {/* Jackal Profile Engraving */}
          <path d="M 125 50 L 138 48 L 145 56 L 152 56 L 150 62 L 135 66 Z" fill="url(#anubis-gold)" />
          <circle cx="140" cy="54" r="1.8" fill="#ffffff" />

          {/* Massive Dual Heavy Shotgun Barrels (Heavy Gauge) */}
          {/* Upper Heavy Barrel */}
          <rect x="165" y="44" width="125" height="13" rx="2" fill="url(#anubis-basalt)" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="170" y1="46" x2="285" y2="46" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
          {/* Lower Heavy Barrel */}
          <rect x="165" y="58" width="125" height="13" rx="2" fill="url(#anubis-basalt)" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="170" y1="60" x2="285" y2="60" stroke="#fef08a" strokeWidth="1" opacity="0.7" />

          {/* Golden Ribbing & Locking Rings */}
          {[0, 30, 60, 90].map((bx, i) => (
            <rect key={`ring-${i}`} x={185 + bx} y="42" width="6" height="31" rx="1.5" fill="url(#anubis-gold)" stroke="#78350f" strokeWidth="1" />
          ))}

          {/* Massive Flared Muzzle Crowns */}
          <rect x="290" y="41" width="14" height="37" rx="3" fill="url(#anubis-gold)" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="297" cy="50.5" r="5" fill="#020617" />
          <circle cx="297" cy="64.5" r="5" fill="#020617" />
          {/* Eye of Anubis Glimmer */}
          <circle cx="297" cy="50.5" r="2.5" fill="#f59e0b" />
          <circle cx="297" cy="64.5" r="2.5" fill="#f59e0b" />

          {/* Gold Shotgun Pump Grip (Carved Basalt) */}
          <rect x="195" y="73" width="46" height="10" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
          {[0, 8, 16, 24, 32].map((gx, i) => (
            <line key={`pump-${i}`} x1={202 + gx} y1="74" x2={202 + gx} y2="82" stroke="#d97706" strokeWidth="1.8" />
          ))}

          {/* Heavy Curved Gold Trigger & Basalt Guard */}
          <path d="M 125 76 Q 145 76 142 96 Q 130 98 120 86" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 128 80 Q 134 88 130 92" stroke="#ffffff" strokeWidth="2.5" fill="none" />
        </svg>
      );

    case WT.PHARAOH_STAFF:
      // === CETRO SOLAR DOS FARAÓS (OLHO DE HÓRUS) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pharaoh-gold" x1="0" y1="0" x2="300" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <radialGradient id="pharaoh-sun-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="lapis-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <filter id="solar-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Watermark Specs */}
          <text x="320" y="22" textAnchor="end" fill="#f59e0b" opacity="0.85" fontSize="10" fontFamily="monospace" fontWeight="bold">
            RELÍQUIA MÍTICA DE RÁ · CETRO DO OLHO DE HÓRUS
          </text>
          <text x="320" y="34" textAnchor="end" fill="#fef08a" opacity="0.5" fontSize="8" fontFamily="monospace">
            ORBES SOLARES ORBITAIS · RAIOS DE INCINERAÇÃO CÓSMICA
          </text>

          {/* Ambient Solar Aura */}
          <circle cx="270" cy="70" r="38" fill="url(#pharaoh-sun-core)" opacity="0.35" filter="url(#solar-glow)" />

          {/* Scepter Main Shaft (Polished Egyptian Gold & Lapis Lazuli Ribs) */}
          <rect x="25" y="65" width="220" height="10" rx="3" fill="url(#pharaoh-gold)" stroke="#78350f" strokeWidth="1.5" />
          {/* Lapis Lazuli Inlay Bands along Shaft */}
          {[0, 28, 56, 84, 112, 140, 168, 196].map((bx, i) => (
            <rect key={`lapis-${i}`} x={40 + bx} y="63" width="6" height="14" rx="1.5" fill="url(#lapis-blue)" stroke="#fef08a" strokeWidth="1" />
          ))}

          {/* Golden Grip Knots & Tassels */}
          <circle cx="35" cy="70" r="7" fill="url(#pharaoh-gold)" stroke="#78350f" strokeWidth="1.5" />
          <polygon points="35,70 15,64 15,76" fill="#f59e0b" />

          {/* Royal Wings of Horus Flaring Outward */}
          <g transform="translate(230, 70)">
            {/* Upper Wing */}
            <path d="M 0 0 C 15 -25, 40 -40, 60 -36 C 45 -22, 35 -10, 20 0 Z" fill="url(#pharaoh-gold)" stroke="#78350f" strokeWidth="1.5" />
            <path d="M 10 -6 C 25 -22, 45 -32, 55 -28" stroke="#38bdf8" strokeWidth="1.8" fill="none" />

            {/* Lower Wing */}
            <path d="M 0 0 C 15 25, 40 40, 60 36 C 45 22, 35 10, 20 0 Z" fill="url(#pharaoh-gold)" stroke="#78350f" strokeWidth="1.5" />
            <path d="M 10 6 C 25 22, 45 32, 55 28" stroke="#38bdf8" strokeWidth="1.8" fill="none" />

            {/* Central Solar Disc (The Sun of Ra) */}
            <circle cx="42" cy="0" r="18" fill="url(#pharaoh-sun-core)" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx="42" cy="0" r="10" fill="#ffffff" />

            {/* Sacred Eye of Horus inside Sun Disc */}
            <path d="M 34 0 Q 42 -7 50 0 Q 42 7 34 0 Z" fill="none" stroke="#78350f" strokeWidth="1.8" />
            <circle cx="42" cy="0" r="3.2" fill="#0284c7" />
            <circle cx="42" cy="0" r="1.5" fill="#ffffff" />
            {/* Eye teardrop and spiral */}
            <path d="M 40 4 L 40 9 M 44 4 Q 46 8 50 7" stroke="#78350f" strokeWidth="1.5" />

            {/* Radiating Incandescent Solar Beams */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
              const rad = (ang * Math.PI) / 180;
              const x1 = 42 + Math.cos(rad) * 20;
              const y1 = Math.sin(rad) * 20;
              const x2 = 42 + Math.cos(rad) * (i % 2 === 0 ? 32 : 26);
              const y2 = Math.sin(rad) * (i % 2 === 0 ? 32 : 26);
              return <line key={`sray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />;
            })}
          </g>
        </svg>
      );

    case WT.TROPER:
      // === NAVE TROPER (MINI-CAÇA COMPACTO · SEM WARP · ORBES PEQUENOS LENTOS) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="326" y="18" textAnchor="end" fill="#38bdf8" opacity="0.95" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            NAVE TROPER · MINI-CAÇA DE ENTRADA
          </text>
          <text x="326" y="30" textAnchor="end" fill="#94a3b8" opacity="0.88" fontSize="8" fontFamily="monospace">
            SEM WARP · ORBES PEQUENOS EM DISPARO LENTO
          </text>

          {/* Small Spaced Slow Energy Orbs Streaming from Single Nose Cannon */}
          {[190, 242, 296].map((ox, i) => (
            <g key={`torb-${i}`}>
              <line x1={ox - 10} y1="72" x2={ox} y2="72" stroke="#38bdf8" strokeWidth="2.4" strokeOpacity="0.45" strokeLinecap="round" />
              <circle cx={ox} cy="72" r={4.8 - i * 0.35} fill="#0284c7" fillOpacity="0.4" />
              <circle cx={ox} cy="72" r={3.0 - i * 0.2} fill="#38bdf8" />
              <circle cx={ox} cy="72" r={1.3} fill="#ffffff" />
            </g>
          ))}

          {/* Single Compact Rear Thruster Plume */}
          <polygon points="94,67 66,72 94,77" fill="#38bdf8" opacity="0.85" />
          <polygon points="94,69.5 76,72 94,74.5" fill="#e0f2fe" />

          {/* Compact Mini Delta Starfighter Hull */}
          <polygon
            points="146,72 118,59 95,43 86,49 94,63 89,72 94,81 86,95 95,101 118,85"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <polygon points="134,72 110,63 96,63 96,81 110,81" fill="#1e293b" />
          <line x1="106" y1="60" x2="92" y2="50" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="106" y1="84" x2="92" y2="94" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />

          {/* Compact Cockpit */}
          <polygon points="128,72 114,66 104,68 104,76 114,78" fill="#38bdf8" />
          <ellipse cx="115" cy="70.5" rx="5" ry="1.8" fill="#e0f2fe" />

          {/* Single Front Nose Emitter */}
          <rect x="142" y="68" width="9" height="8" rx="1.5" fill="#334155" stroke="#7dd3fc" strokeWidth="1.2" />
          <circle cx="152" cy="72" r="3.4" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.4" />
        </svg>
      );

    case WT.DESTRUCTOR:
      // === NAVE DESTRUCTOR (TRANSFORMAÇÃO EM NAVE + 2 BLASTERS LASER ±30° + MODO WARP) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="326" y="18" textAnchor="end" fill="#22d3ee" opacity="0.92" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            NAVE DESTRUCTOR · BLASTERS GÊMEOS ±30°
          </text>
          <text x="326" y="30" textAnchor="end" fill="#e879f9" opacity="0.85" fontSize="8" fontFamily="monospace">
            LASER CONTÍNUO DUPLO + SHIFT 3s: MODO WARP ACELERADOR
          </text>
          {/* Particle Accelerator Orbit Ring & Comet Trails */}
          <circle cx="122" cy="72" r="48" stroke="#c084fc" strokeWidth="1.6" strokeDasharray="7 5" strokeOpacity="0.65" />
          <path d="M 76 62 A 48 48 0 0 1 114 25" stroke="#22d3ee" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
          <path d="M 168 82 A 48 48 0 0 1 130 119" stroke="#e879f9" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="114" cy="25" r="5" fill="#ffffff" stroke="#22d3ee" strokeWidth="2" />
          <circle cx="130" cy="119" r="5" fill="#ffffff" stroke="#e879f9" strokeWidth="2" />
          <circle cx="80" cy="96" r="4" fill="#fef08a" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Twin Continuous Laser Beams Firing Forward */}
          <line x1="162" y1="42" x2="334" y2="34" stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.35" strokeLinecap="round" />
          <line x1="162" y1="42" x2="334" y2="34" stroke="#22d3ee" strokeWidth="5.5" strokeOpacity="0.9" strokeLinecap="round" />
          <line x1="162" y1="42" x2="334" y2="34" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="162" y1="102" x2="334" y2="110" stroke="#0ea5e9" strokeWidth="12" strokeOpacity="0.35" strokeLinecap="round" />
          <line x1="162" y1="102" x2="334" y2="110" stroke="#22d3ee" strokeWidth="5.5" strokeOpacity="0.9" strokeLinecap="round" />
          <line x1="162" y1="102" x2="334" y2="110" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          {/* Twin Rear Warp Thruster Plumes */}
          <polygon points="84,56 42,61 84,66" fill="#22d3ee" opacity="0.85" />
          <polygon points="84,78 42,83 84,88" fill="#e879f9" opacity="0.85" />
          {/* Destructor Delta Starship Hull */}
          <polygon points="172,72 134,54 126,30 88,30 78,48 86,62 80,72 86,82 78,96 88,114 126,114 134,90" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.4" />
          <polygon points="160,72 126,58 92,58 92,86 126,86" fill="#1e293b" stroke="#0284c7" strokeWidth="1.6" />
          {/* Cockpit Canopy */}
          <polygon points="150,72 128,64 114,66 114,78 128,80" fill="#7dd3fc" />
          {/* Particle Core */}
          <circle cx="102" cy="72" r="6" fill="#00f5d4" />
          <circle cx="102" cy="72" r="2.5" fill="#ffffff" />
          {/* Twin Wing-Mounted Blasters */}
          <g transform="translate(130, 42) rotate(-3)">
            <rect x="-8" y="-6" width="18" height="12" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="8" y="-4" width="22" height="8" rx="1.5" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.4" />
            <circle cx="30" cy="0" r="4.5" fill="#ffffff" />
          </g>
          <g transform="translate(130, 102) rotate(3)">
            <rect x="-8" y="-6" width="18" height="12" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="8" y="-4" width="22" height="8" rx="1.5" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.4" />
            <circle cx="30" cy="0" r="4.5" fill="#ffffff" />
          </g>
        </svg>
      );

    case WT.INTERCEPTOR:
      // === NAVE INTERCEPTOR (ASAS LONGAS + BLASTERS NAS PONTAS + ORBES ULTRA-RÁPIDOS + WARP) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="326" y="16" textAnchor="end" fill="#00f5d4" opacity="0.94" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            NAVE INTERCEPTOR · ASAS LONGAS
          </text>
          <text x="326" y="28" textAnchor="end" fill="#a7f3d0" opacity="0.85" fontSize="8" fontFamily="monospace">
            ORBES HIPER-RÁPIDOS NAS PONTAS + SHIFT 3s: MODO WARP
          </text>
          {/* Multi-directional Warp Accelerator Orbit Trails */}
          <ellipse cx="118" cy="70" rx="52" ry="30" transform="rotate(-28 118 70)" stroke="#34d399" strokeWidth="1.4" strokeDasharray="6 4" strokeOpacity="0.6" />
          <ellipse cx="118" cy="70" rx="50" ry="26" transform="rotate(34 118 70)" stroke="#e879f9" strokeWidth="1.4" strokeDasharray="5 5" strokeOpacity="0.55" />
          {/* Outward / diagonal warp sphere trails */}
          <path d="M 88 32 Q 62 22 44 38" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
          <circle cx="88" cy="32" r="4.5" fill="#ffffff" stroke="#22d3ee" strokeWidth="2" />
          <path d="M 152 104 Q 178 120 198 102" stroke="#e879f9" strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
          <circle cx="152" cy="104" r="4.5" fill="#ffffff" stroke="#e879f9" strokeWidth="2" />
          <path d="M 74 96 Q 52 114 38 96" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
          <circle cx="74" cy="96" r="4" fill="#fef08a" stroke="#10b981" strokeWidth="1.6" />
          {/* Rapid Plasma Orbs Streaming from Both Long-Wingtip Blasters */}
          {[168, 204, 240, 276, 312].map((ox, i) => (
            <g key={`iorb-top-${i}`}>
              <line x1={ox - 16} y1={24 - i * 1.2} x2={ox} y2={24 - i * 1.2} stroke="#00f5d4" strokeWidth="3.5" strokeOpacity="0.55" strokeLinecap="round" />
              <circle cx={ox} cy={24 - i * 1.2} r={5.5 - i * 0.4} fill="#10b981" fillOpacity="0.45" />
              <circle cx={ox} cy={24 - i * 1.2} r={3.6 - i * 0.25} fill="#00f5d4" />
              <circle cx={ox} cy={24 - i * 1.2} r={1.6} fill="#ffffff" />
            </g>
          ))}
          {[168, 204, 240, 276, 312].map((ox, i) => (
            <g key={`iorb-bot-${i}`}>
              <line x1={ox - 16} y1={116 + i * 1.2} x2={ox} y2={116 + i * 1.2} stroke="#00f5d4" strokeWidth="3.5" strokeOpacity="0.55" strokeLinecap="round" />
              <circle cx={ox} cy={116 + i * 1.2} r={5.5 - i * 0.4} fill="#10b981" fillOpacity="0.45" />
              <circle cx={ox} cy={116 + i * 1.2} r={3.6 - i * 0.25} fill="#00f5d4" />
              <circle cx={ox} cy={116 + i * 1.2} r={1.6} fill="#ffffff" />
            </g>
          ))}
          {/* Twin Rear Thruster Plumes */}
          <polygon points="82,56 36,61 82,66" fill="#00f5d4" opacity="0.85" />
          <polygon points="82,74 36,79 82,84" fill="#34d399" opacity="0.85" />
          {/* Long Swept Interceptor Wings & Sleek Needle Hull */}
          <polygon
            points="182,70 132,57 110,18 82,18 96,52 78,61 84,70 78,79 96,88 82,122 110,122 132,83"
            fill="#090d16"
            stroke="#10b981"
            strokeWidth="2.2"
          />
          {/* Wing Energy Conduits */}
          <polyline points="98,56 100,24" stroke="#00f5d4" strokeWidth="2" strokeLinecap="round" />
          <polyline points="98,84 100,116" stroke="#00f5d4" strokeWidth="2" strokeLinecap="round" />
          {/* Sleek Needle Cockpit */}
          <polygon points="164,70 136,63 112,65 112,75 136,77" fill="#5eead4" />
          <circle cx="98" cy="70" r="5" fill="#00f5d4" />
          <circle cx="98" cy="70" r="2" fill="#ffffff" />
          {/* Wingtip Orb Blasters */}
          <g transform="translate(106, 22)">
            <rect x="-6" y="-5" width="22" height="10" rx="3" fill="#1e293b" stroke="#00f5d4" strokeWidth="1.5" />
            <circle cx="18" cy="0" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
          </g>
          <g transform="translate(106, 118)">
            <rect x="-6" y="-5" width="22" height="10" rx="3" fill="#1e293b" stroke="#00f5d4" strokeWidth="1.5" />
            <circle cx="18" cy="0" r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case WT.NAVE_REI:
      // === NAVE REI (NAVE CAPITAL GIGANTE + 4 BLASTERS LASER + MODO FÚRIA VERMELHO 6s) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="328" y="15" textAnchor="end" fill="#ef4444" opacity="0.95" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            NAVE REI · 4 BLASTERS IMPERIAIS
          </text>
          <text x="328" y="26" textAnchor="end" fill="#fbbf24" opacity="0.88" fontSize="8" fontFamily="monospace">
            4 FEIXES LASER + SHIFT 6s: MODO FÚRIA VERMELHA
          </text>
          {/* Hyper-fast Multi-directional Fury Spheres & Red Electricity */}
          <ellipse cx="106" cy="72" rx="58" ry="34" transform="rotate(-24 106 72)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.65" />
          <ellipse cx="106" cy="72" rx="56" ry="30" transform="rotate(28 106 72)" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="5 5" strokeOpacity="0.55" />
          <path d="M 78 28 Q 52 16 36 34" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <circle cx="78" cy="28" r="5" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
          <path d="M 146 112 Q 172 128 194 108" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <circle cx="146" cy="112" r="5" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
          {/* Crackling Red Electricity Bolts */}
          <polyline points="56,52 68,46 64,58 78,50" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <polyline points="62,98 76,92 70,104 86,98" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
          <polyline points="124,34 136,44 128,48 140,56" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
          {/* 4 Colossal Crimson Fury Laser Beams */}
          {[28, 48, 96, 116].map((by, i) => (
            <g key={`rei-beam-${i}`}>
              <line x1="150" y1={by} x2="336" y2={by + (i < 2 ? -6 : 6)} stroke="#dc2626" strokeWidth="11" strokeOpacity="0.4" strokeLinecap="round" />
              <line x1="150" y1={by} x2="336" y2={by + (i < 2 ? -6 : 6)} stroke="#ef4444" strokeWidth="5.5" strokeOpacity="0.92" strokeLinecap="round" />
              <line x1="150" y1={by} x2="336" y2={by + (i < 2 ? -6 : 6)} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
          {/* Twin Heavy Thruster Plumes */}
          <polygon points="62,56 18,62 62,68" fill="#ef4444" opacity="0.9" />
          <polygon points="62,76 18,82 62,88" fill="#fbbf24" opacity="0.9" />
          {/* Giant Imperial Dreadnought Hull */}
          <polygon
            points="174,72 134,48 118,22 76,20 56,42 64,58 54,72 64,86 56,102 76,124 118,122 134,96"
            fill="#14090b"
            stroke="#ef4444"
            strokeWidth="2.4"
          />
          <polygon points="158,72 122,52 72,54 72,90 122,92" fill="#230b10" stroke="#fbbf24" strokeWidth="1.5" />
          {/* Royal Crown Canopy & Reactor */}
          <polygon points="146,72 120,62 98,64 98,80 120,82" fill="#fca5a5" />
          <circle cx="84" cy="72" r="7" fill="#ef4444" />
          <circle cx="84" cy="72" r="3" fill="#ffffff" />
          {/* 4 Quad Wing Laser Blasters */}
          {[28, 48, 96, 116].map((by, i) => (
            <g key={`rei-pod-${i}`} transform={`translate(${i === 0 || i === 3 ? 112 : 128}, ${by})`}>
              <rect x="-7" y="-5" width="22" height="10" rx="2.5" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.4" />
              <circle cx="17" cy="0" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="1.4" />
            </g>
          ))}
        </svg>
      );

    case WT.EAST_DRAGON:
      // === EAST DRAGON (DRAGÃO ORIENTAL SERPENTEANTE + FEIXE LASER DE FOGO VIVO) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dragon-fire-beam" x1="165" y1="70" x2="338" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="65%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <text x="328" y="15" textAnchor="end" fill="#fb923c" opacity="0.95" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            EAST DRAGON · SERPENTE IMPERIAL DE FOGO
          </text>
          <text x="328" y="26" textAnchor="end" fill="#fde047" opacity="0.88" fontSize="8" fontFamily="monospace">
            FEIXE LASER CONTÍNUO INCANDESCENTE + CHAMAS VIVAS
          </text>

          {/* Continuous Fire-Laser Beam from Dragon Jaws */}
          <path d="M 164 68 Q 210 50 255 66 T 338 66 L 338 78 T 255 78 Q 210 92 164 74 Z" fill="#dc2626" opacity="0.42" />
          <path d="M 166 69 Q 208 56 250 69 T 338 69 L 338 75 T 250 75 Q 208 86 166 73 Z" fill="#f97316" opacity="0.85" />
          <line x1="166" y1="71" x2="338" y2="71" stroke="url(#dragon-fire-beam)" strokeWidth="7" strokeLinecap="round" />
          <line x1="166" y1="71" x2="338" y2="71" stroke="#fffbeb" strokeWidth="2.6" strokeLinecap="round" />
          {/* Ambient Flying Fire Embers along Beam */}
          <circle cx="215" cy="54" r="3" fill="#fde047" />
          <circle cx="248" cy="87" r="2.8" fill="#fb923c" />
          <circle cx="286" cy="57" r="2.5" fill="#f97316" />
          <circle cx="316" cy="83" r="3" fill="#fde047" />

          {/* Undulating Serpentine Worm-Like Dragon Body (Tail to Neck) */}
          <path
            d="M 22 92 Q 36 52 58 88 T 96 86 T 134 72"
            stroke="#991b1b"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 22 92 Q 36 52 58 88 T 96 86 T 134 72"
            stroke="#ef4444"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 22 92 Q 36 52 58 88 T 96 86 T 134 72"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeDasharray="6 5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Fiery Tail Tuft */}
          <polygon points="24,92 6,84 12,94 4,104" fill="#f97316" />
          <polygon points="22,92 10,89 13,95 9,99" fill="#fde047" />
          {/* Dorsal Flame Spine Spikes */}
          <polygon points="48,66 43,53 55,61" fill="#f97316" />
          <polygon points="75,92 71,105 82,95" fill="#fbbf24" />
          <polygon points="106,74 103,60 115,69" fill="#f97316" />

          {/* Sweeping Horns & Flowing Whiskers */}
          <path d="M 136 62 Q 116 40 102 38" stroke="#fde047" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 136 80 Q 116 102 102 104" stroke="#fde047" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 156 64 Q 170 46 184 48" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M 156 78 Q 170 96 184 94" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Fierce Eastern Dragon Head */}
          <polygon points="168,71 146,56 128,62 128,80 146,86" fill="#b91c1c" stroke="#fbbf24" strokeWidth="1.8" />
          <polygon points="165,71 148,62 138,65 138,77 148,80" fill="#dc2626" />
          {/* Molten Fire Maw */}
          <circle cx="166" cy="71" r="8" fill="#f97316" opacity="0.85" />
          <circle cx="166" cy="71" r="4" fill="#ffffff" />
          {/* Blazing Golden Eyes */}
          <circle cx="147" cy="64" r="2.6" fill="#fef08a" />
          <circle cx="147" cy="78" r="2.6" fill="#fef08a" />
        </svg>
      );

    case WT.IRON_MAN:
      // === HOMEM DE FERRO (ARMADURA MARK STARK + MODO REPULSOR + MODO LASER) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ironman-laser-grad" x1="168" y1="84" x2="338" y2="84" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="65%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <text x="328" y="15" textAnchor="end" fill="#fbbf24" opacity="0.95" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            HOMEM DE FERRO · ARMADURA MARK STARK
          </text>
          <text x="328" y="26" textAnchor="end" fill="#38bdf8" opacity="0.9" fontSize="8" fontFamily="monospace">
            [SHIFT / E] ALTERNAR: MODO REPULSOR ↔ MODO LASER
          </text>

          {/* Upper Mode: Cyan Stark Repulsor Plasma Blasts */}
          <line x1="165" y1="50" x2="295" y2="44" stroke="#0284c7" strokeWidth="5" strokeOpacity="0.35" strokeLinecap="round" strokeDasharray="18 10" />
          <ellipse cx="222" cy="48" rx="14" ry="4.5" fill="#38bdf8" opacity="0.85" />
          <ellipse cx="222" cy="48" rx="9" ry="2.2" fill="#ffffff" />
          <ellipse cx="278" cy="45" rx="16" ry="5" fill="#38bdf8" opacity="0.9" />
          <ellipse cx="278" cy="45" rx="10" ry="2.4" fill="#ffffff" />
          <circle cx="164" cy="50" r="8" fill="#38bdf8" opacity="0.45" />
          <circle cx="164" cy="50" r="4" fill="#ffffff" />

          {/* Lower Mode: Blazing Crimson-Gold Unibeam Laser */}
          <line x1="165" y1="88" x2="336" y2="92" stroke="#dc2626" strokeWidth="14" strokeOpacity="0.38" strokeLinecap="round" />
          <line x1="165" y1="88" x2="336" y2="92" stroke="url(#ironman-laser-grad)" strokeWidth="6.5" strokeLinecap="round" />
          <line x1="165" y1="88" x2="336" y2="92" stroke="#fffbeb" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="165" cy="88" r="9" fill="#fbbf24" opacity="0.7" />
          <circle cx="165" cy="88" r="4.5" fill="#ffffff" />

          {/* Boot Jet Thrusters */}
          <polygon points="82,60 32,65 82,70" fill="#38bdf8" opacity="0.85" />
          <polygon points="82,74 32,79 82,84" fill="#f97316" opacity="0.85" />

          {/* Twin Armored Gauntlets */}
          <rect x="116" y="42" width="44" height="14" rx="4" fill="#b91c1c" stroke="#fbbf24" strokeWidth="1.6" />
          <rect x="132" y="44" width="16" height="10" rx="2" fill="#fbbf24" />
          <circle cx="162" cy="49" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

          <rect x="116" y="81" width="44" height="14" rx="4" fill="#b91c1c" stroke="#fbbf24" strokeWidth="1.6" />
          <rect x="132" y="83" width="16" height="10" rx="2" fill="#fbbf24" />
          <circle cx="162" cy="88" r="5" fill="#ef4444" stroke="#fde047" strokeWidth="1.5" />

          {/* Crimson & Gold Torso */}
          <polygon points="134,54 134,88 106,100 80,88 74,71 80,54 106,42" fill="#991b1b" stroke="#fbbf24" strokeWidth="2.2" />
          {/* Mark Helmet */}
          <circle cx="107" cy="71" r="18" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
          <polygon points="124,62 124,80 112,87 100,80 100,62 112,55" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
          {/* Glowing Eyes */}
          <rect x="114" y="61" width="6" height="3.5" rx="1" fill="#e0f2fe" />
          <rect x="114" y="77" width="6" height="3.5" rx="1" fill="#fffbeb" />
          {/* Glowing Arc Reactor Core */}
          <circle cx="132" cy="71" r="8" fill="#38bdf8" opacity="0.45" />
          <circle cx="132" cy="71" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      );

    case WT.ICE_AND_FIRE_DRAGON:
      // === ICE & FIRE DRAGON (DOIS DRAGÕES COMPANHEIROS + FUSÃO MEGA DRAGÃO ROXO) ===
      return (
        <svg viewBox="0 0 340 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ifd-purple-beam" x1="208" y1="74" x2="338" y2="74" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="22%" stopColor="#f0abfc" />
              <stop offset="60%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
          </defs>
          <text x="328" y="15" textAnchor="end" fill="#e879f9" opacity="0.95" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
            ICE &amp; FIRE DRAGON · FUSÃO ELEMENTAL
          </text>
          <text x="328" y="26" textAnchor="end" fill="#cbd5e1" opacity="0.9" fontSize="8" fontFamily="monospace">
            [SHIFT] TROCAR FOGO ↔ GELO · [Q] MEGA DRAGÃO ROXO
          </text>

          {/* Top Serpentine Fire Dragon */}
          <path d="M18,52 Q42,32 66,46 T114,44" stroke="#f97316" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
          <path d="M18,52 Q42,32 66,46 T114,44" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="6 6" />
          <polygon points="134,44 114,35 110,44 114,53" fill="#dc2626" stroke="#fde047" strokeWidth="1.5" />
          <circle cx="122" cy="42" r="2.2" fill="#fef08a" />
          <line x1="135" y1="44" x2="178" y2="62" stroke="#f97316" strokeWidth="3.5" strokeOpacity="0.65" strokeLinecap="round" />

          {/* Bottom Serpentine Ice Dragon */}
          <path d="M18,98 Q42,118 66,102 T114,104" stroke="#0ea5e9" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
          <path d="M18,98 Q42,118 66,102 T114,104" stroke="#e0f2fe" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="6 6" />
          <polygon points="134,104 114,95 110,104 114,113" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
          <circle cx="122" cy="102" r="2.2" fill="#e0f2fe" />
          <line x1="135" y1="104" x2="178" y2="86" stroke="#38bdf8" strokeWidth="3.5" strokeOpacity="0.65" strokeLinecap="round" />

          {/* Center-Right Mega Purple Dragon Crest & Void Beam */}
          <line x1="208" y1="74" x2="338" y2="74" stroke="#9333ea" strokeWidth="22" strokeOpacity="0.34" strokeLinecap="round" />
          <line x1="208" y1="74" x2="338" y2="74" stroke="url(#ifd-purple-beam)" strokeWidth="9" strokeLinecap="round" />
          <line x1="208" y1="74" x2="338" y2="74" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

          <circle cx="186" cy="74" r="22" fill="#7e22ce" fillOpacity="0.28" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="5 4" />
          <polygon points="214,74 186,58 172,66 168,74 172,82 186,90" fill="#6b21a8" stroke="#f0abfc" strokeWidth="2" />
          <polygon points="196,74 182,66 176,74 182,82" fill="#a855f7" />
          <circle cx="192" cy="69" r="2.6" fill="#f5d0fe" />
          <circle cx="192" cy="79" r="2.6" fill="#f5d0fe" />
          <circle cx="212" cy="74" r="6.5" fill="#ffffff" fillOpacity="0.85" />
        </svg>
      );

    default:
      return null;
  }
};
