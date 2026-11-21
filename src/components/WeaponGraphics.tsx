/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WeaponType } from '../types';

interface WeaponGraphicProps {
  type: WeaponType;
  className?: string;
}

export const WeaponIllustration: React.FC<WeaponGraphicProps> = ({
  type,
  className = 'w-16 h-10',
}) => {
  switch (type) {
    case WeaponType.GLOCK_19:
      return (
        <svg viewBox="0 0 120 72" fill="none" className={className}>
          <defs>
            <linearGradient id="g19-slide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="45%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="g19-frame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Trijicon RMR Reflex Optic */}
          <path d="M35 19 L37 11 H54 L56 19 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          <path d="M39 18 L40 13 H51 L52 18 Z" fill="#1e293b" />
          <ellipse cx="45.5" cy="15.5" rx="4.2" ry="2.2" fill="#dc2626" opacity="0.45" />
          <circle cx="45.5" cy="15.5" r="1.1" fill="#ef4444" />

          {/* Front Tritium & Rear Suppressor-Height Sights */}
          <rect x="26" y="16" width="5" height="3.5" rx="0.6" fill="#0f172a" stroke="#475569" strokeWidth="0.6" />
          <rect x="88" y="15.5" width="4.5" height="4" rx="0.6" fill="#0f172a" stroke="#475569" strokeWidth="0.6" />
          <circle cx="90.2" cy="17.2" r="0.9" fill="#4ade80" />

          {/* Extended Threaded Match Barrel Hint */}
          <rect x="94" y="21.5" width="7" height="5.5" rx="0.8" fill="#64748b" stroke="#334155" strokeWidth="0.7" />
          <line x1="96" y1="21.5" x2="96" y2="27" stroke="#1e293b" strokeWidth="0.7" />
          <line x1="98.5" y1="21.5" x2="98.5" y2="27" stroke="#1e293b" strokeWidth="0.7" />

          {/* Gen5 nDLC Slide + Bullnose */}
          <path
            d="M23 19 H91 C93.5 19 95 20.5 95 23 V30.5 H22 V21.5 C22 20 22.8 19 23 19 Z"
            fill="url(#g19-slide)"
            stroke="#64748b"
            strokeWidth="1"
          />
          {/* Steel Ejection Port + Brass Chamber Glint */}
          <rect x="57" y="19.5" width="14" height="5" rx="0.7" fill="#0f172a" stroke="#475569" strokeWidth="0.6" />
          <rect x="58.5" y="21" width="9" height="2.4" rx="0.5" fill="#d97706" opacity="0.85" />
          <rect x="56" y="25" width="13" height="1.5" fill="#94a3b8" opacity="0.6" />

          {/* Front & Rear Cocking Serrations */}
          <g stroke="#0f172a" strokeWidth="1.2" opacity="0.75">
            <line x1="26" y1="21" x2="26" y2="29" />
            <line x1="29" y1="21" x2="29" y2="29" />
            <line x1="32" y1="21" x2="32" y2="29" />
            <line x1="35" y1="21" x2="35" y2="29" />
            <line x1="77" y1="21" x2="77" y2="29" />
            <line x1="80" y1="21" x2="80" y2="29" />
            <line x1="83" y1="21" x2="83" y2="29" />
            <line x1="86" y1="21" x2="86" y2="29" />
          </g>

          {/* Polymer Frame, Beavertail & Ergo Grip */}
          <path
            d="M20 30.5 H94 V35.5 H66 C64 35.5 62.5 37 62.5 39 V44 C62.5 46 60.5 47.5 58 47.5 H45 L41 61 C40.4 62.5 39 63.5 37 63.5 H23.5 C21.5 63.5 20.5 62 21.2 60 L27 38 C27.5 36 25 34.5 19.5 34 C18 33.8 18 31 20 30.5 Z"
            fill="url(#g19-frame)"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Trigger Guard Cutout & Safe-Action Trigger */}
          <path
            d="M46 35.5 H60 V43.5 C60 44.5 59 45.2 57.5 45.2 H46.5 Z"
            fill="#020617"
            stroke="#334155"
            strokeWidth="0.9"
          />
          <path d="M51 35.5 C50 38.5 51 41.5 53 43.2" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

          {/* Grip Stippling Texture & Flared Magwell Baseplate */}
          <path d="M27.5 42 L24 58 H36.5 L40 42 Z" fill="#0f172a" opacity="0.65" />
          <g stroke="#334155" strokeWidth="0.7" opacity="0.75">
            <line x1="27" y1="45" x2="39" y2="45" />
            <line x1="26" y1="49" x2="38" y2="49" />
            <line x1="25" y1="53" x2="37" y2="53" />
            <line x1="24" y1="57" x2="36" y2="57" />
          </g>
          <path d="M21 61.5 H40.5 L41.5 65.5 H20.5 Z" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="43.5" cy="36.5" r="1.4" fill="#64748b" />

          {/* Streamlight TLR-7A Tactical Rail Weapon Light */}
          <rect x="66" y="35.5" width="24" height="9" rx="1.8" fill="#1e293b" stroke="#64748b" strokeWidth="0.9" />
          <rect x="86" y="36" width="7" height="8" rx="1.2" fill="#334155" stroke="#94a3b8" strokeWidth="0.7" />
          <ellipse cx="92.5" cy="40" rx="1.2" ry="3.2" fill="#fef08a" opacity="0.85" />
          <circle cx="71" cy="40" r="1.5" fill="#475569" />
        </svg>
      );

    case WeaponType.BENELLI_M4:
      return (
        <svg viewBox="0 0 120 72" fill="none" className={className}>
          <defs>
            <linearGradient id="bm4-metal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="bm4-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Rubber Recoil Pad & Collapsible Skeleton Stock */}
          <path d="M5 28 H10 V49 H5 C4 49 3.5 47.5 3.8 45.5 L4.5 30 C4.6 28.8 5 28 5 28 Z" fill="#090d16" stroke="#334155" strokeWidth="0.9" />
          <path d="M10 29 L33 27 V34 L10 38 Z" fill="#1e293b" stroke="#475569" strokeWidth="0.9" />
          <path d="M10 43 L28 36 L30 39 L10 47 Z" fill="#334155" stroke="#475569" strokeWidth="0.8" />
          {/* Buffer Tube */}
          <rect x="24" y="27.5" width="12" height="5" fill="#475569" stroke="#64748b" strokeWidth="0.7" />

          {/* Rubberized Tactical Pistol Grip */}
          <path
            d="M34 35 L42 35 L38.5 54 C38 55.8 36.5 56.5 34.5 56.5 H31 C29.5 56.5 29 55 29.5 53.2 L34 35 Z"
            fill="url(#bm4-dark)"
            stroke="#475569"
            strokeWidth="0.9"
          />

          {/* Trigger Guard & Trigger */}
          <path d="M41.5 35 H53 V42 C53 43 52 43.5 50.5 43.5 H42 Z" fill="#020617" stroke="#475569" strokeWidth="0.8" />
          <path d="M46 35.5 C45.5 38 46.2 40.5 47.8 41.8" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />

          {/* Anodized M1014 Receiver */}
          <path
            d="M34 24.5 H69 C70.5 24.5 71.5 25.5 71.5 27 V35.5 H34 Z"
            fill="url(#bm4-metal)"
            stroke="#94a3b8"
            strokeWidth="0.9"
          />

          {/* Top Picatinny Rail & Ghost-Ring Sight */}
          <rect x="40" y="22.2" width="24" height="2.4" fill="#0f172a" stroke="#64748b" strokeWidth="0.6" />
          <circle cx="43.5" cy="20.6" r="2.1" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
          <rect x="108" y="19.8" width="3.5" height="3.8" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.7" />
          <circle cx="109.8" cy="21.4" r="0.8" fill="#f87171" />

          {/* Chrome Bolt Carrier & Charging Handle */}
          <rect x="53" y="26.2" width="11" height="4" rx="0.6" fill="#cbd5e1" stroke="#475569" strokeWidth="0.6" />
          <rect x="54.5" y="27.2" width="2.8" height="2.2" rx="0.4" fill="#0f172a" />

          {/* Side-Saddle Shell Carrier (4 Crimson 12-Gauge Shells) */}
          <rect x="39" y="26.5" width="13" height="8" rx="1" fill="#090d16" stroke="#334155" strokeWidth="0.6" />
          {[40.2, 43.3, 46.4, 49.5].map((sx) => (
            <g key={sx}>
              <rect x={sx} y="27" width="2.2" height="5.5" rx="0.4" fill="#dc2626" />
              <rect x={sx} y="31.5" width="2.2" height="2" rx="0.2" fill="#fbbf24" />
            </g>
          ))}

          {/* Heavy Barrel & Tactical Breacher Choke */}
          <rect x="71.5" y="23.5" width="43" height="4.2" fill="url(#bm4-metal)" stroke="#64748b" strokeWidth="0.8" />
          <rect x="113" y="22.8" width="4.5" height="5.5" rx="0.6" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.7" />

          {/* Full-Length Underbarrel 7+1 Tube Magazine */}
          <rect x="71.5" y="29" width="38" height="4" fill="#334155" stroke="#64748b" strokeWidth="0.7" />
          <rect x="102" y="23.2" width="3.5" height="10.2" rx="0.6" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.7" />

          {/* Twin Ribbed Forend Handguard */}
          <path
            d="M71.5 28 H97 C99 28 100 29.5 100 31.5 C100 33.8 98.5 35 96.5 35 H71.5 Z"
            fill="url(#bm4-dark)"
            stroke="#475569"
            strokeWidth="0.9"
          />
          <g stroke="#334155" strokeWidth="1.2">
            <line x1="75" y1="29.5" x2="75" y2="34" />
            <line x1="79" y1="29.5" x2="79" y2="34" />
            <line x1="83" y1="29.5" x2="83" y2="34" />
            <line x1="87" y1="29.5" x2="87" y2="34" />
            <line x1="91" y1="29.5" x2="91" y2="34" />
          </g>
        </svg>
      );

    case WeaponType.SCAR_L:
      return (
        <svg viewBox="0 0 120 72" fill="none" className={className}>
          <defs>
            <linearGradient id="scar-fde" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d6b88d" />
              <stop offset="50%" stopColor="#b49468" />
              <stop offset="100%" stopColor="#856842" />
            </linearGradient>
            <linearGradient id="scar-fde-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9c7e54" />
              <stop offset="100%" stopColor="#6b5333" />
            </linearGradient>
          </defs>

          {/* Signature Folding Adjustable "UGG Boot" Stock */}
          <path
            d="M5 24 H27 V38 L16 40 L10 51 H5 C3.8 51 3.5 49.5 3.8 47 L4.5 26 C4.6 24.8 5 24 5 24 Z"
            fill="url(#scar-fde)"
            stroke="#5c472c"
            strokeWidth="0.9"
          />
          {/* Cheek Riser + Stock Hinge */}
          <path d="M9 21.5 H23 L25 24 H7 Z" fill="#a8885c" stroke="#5c472c" strokeWidth="0.8" />
          <rect x="4" y="25" width="2.8" height="25" rx="0.8" fill="#0f172a" />
          <rect x="25" y="25" width="3.5" height="12" fill="#1e293b" stroke="#475569" strokeWidth="0.7" />

          {/* Monolithic Extruded FDE Upper Receiver & Handguard */}
          <path
            d="M28.5 21.5 H88 V31 H28.5 Z"
            fill="url(#scar-fde)"
            stroke="#5c472c"
            strokeWidth="0.9"
          />
          {/* Top Full-Length Picatinny Rail */}
          <rect x="28.5" y="19.5" width="59.5" height="2.2" fill="#334155" />

          {/* EOTech EXPS3 Holographic Optic + G33 3x Magnifier */}
          <rect x="33" y="12.5" width="12" height="7" rx="1" fill="#44403c" stroke="#9c7e54" strokeWidth="0.8" />
          <rect x="47" y="10.8" width="14" height="8.7" rx="1.2" fill="#1e293b" stroke="#78716c" strokeWidth="0.9" />
          <rect x="49.5" y="12.2" width="8.5" height="5.2" rx="0.5" fill="#0ea5e9" opacity="0.28" />
          <circle cx="53.8" cy="14.8" r="1.1" fill="#ef4444" />

          {/* PEQ-15 Tactical Laser Designator Module on Front Rail */}
          <rect x="75" y="15.5" width="11" height="4" rx="0.6" fill="#a8885c" stroke="#5c472c" strokeWidth="0.7" />
          <circle cx="85" cy="17.5" r="0.9" fill="#ef4444" />

          {/* Ejection Port & Reciprocating Charging Handle */}
          <rect x="52" y="23.5" width="10" height="4.2" rx="0.5" fill="#0f172a" stroke="#5c472c" strokeWidth="0.6" />
          <rect x="64" y="24" width="5.5" height="2.4" rx="0.6" fill="#0f172a" stroke="#64748b" strokeWidth="0.6" />

          {/* Cooling Slots on Monolithic Handguard */}
          {[71, 75.5, 80, 84.5].map((vx) => (
            <rect key={vx} x={vx} y="24.2" width="2.8" height="4.2" rx="0.8" fill="#1e293b" />
          ))}

          {/* Matte Black Lower Receiver + Polymer Grip */}
          <path
            d="M32 31 H68 V38 H44 L40.5 55 C40 56.5 38.8 57.5 36.8 57.5 H32.5 C31 57.5 30.2 56 30.8 54.2 L35 37 H32 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="0.9"
          />
          <rect x="44" y="37" width="11" height="6.5" rx="1" fill="#020617" stroke="#334155" strokeWidth="0.8" />
          <path d="M48 37.5 C47.5 40 48.2 42 49.5 42.8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

          {/* Curved 30-Round 5.56 Polymer PMAG with Brass Witness Window */}
          <path
            d="M57 38 H67 L69.5 56 C69.7 57.8 68.5 59 66.5 59 H59.5 C57.8 59 56.8 57.5 56.8 55.8 Z"
            fill="url(#scar-fde-dark)"
            stroke="#5c472c"
            strokeWidth="0.9"
          />
          <rect x="60" y="43" width="4.2" height="10" rx="0.8" fill="#0f172a" stroke="#5c472c" strokeWidth="0.6" />
          <rect x="60.7" y="44.2" width="2.8" height="7.5" rx="0.4" fill="#eab308" opacity="0.85" />

          {/* Underbarrel Angled Vertical Foregrip */}
          <path d="M74 31 H82 L80 44 C79.8 45.2 78.8 46 77.5 46 H75.5 C74.2 46 73.5 45 73.6 43.8 Z" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />

          {/* Gas Block + Front Sight + Free-Floated CQC Barrel & 3-Prong Flash Hider */}
          <rect x="88" y="21.5" width="7" height="7" fill="#334155" stroke="#64748b" strokeWidth="0.7" />
          <path d="M89.5 21.5 L90.5 16.5 H93.5 L94.5 21.5 Z" fill="#475569" stroke="#94a3b8" strokeWidth="0.6" />
          <rect x="95" y="23.8" width="15" height="3.6" fill="#475569" stroke="#64748b" strokeWidth="0.7" />
          {/* 3-Prong Flash Hider */}
          <path d="M110 22.8 H117 V24.3 H113 V25.3 H117 V26.8 H113 V27.5 H117 V28.6 H110 Z" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.7" />
        </svg>
      );

    case WeaponType.MP5_A5:
      return (
        <svg viewBox="0 0 120 72" fill="none" className={className}>
          <defs>
            <linearGradient id="mp5-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Retractable A3/A5 Collapsible Wire Stock */}
          <rect x="6" y="25.5" width="3.2" height="19" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
          <line x1="9" y1="28" x2="29" y2="28" stroke="#64748b" strokeWidth="2.2" />
          <line x1="9" y1="36.5" x2="29" y2="36.5" stroke="#475569" strokeWidth="1.6" />

          {/* Upper Stamped Receiver + Cocking Tube */}
          <rect x="28" y="22.5" width="46" height="9.5" rx="1.8" fill="url(#mp5-body)" stroke="#64748b" strokeWidth="0.9" />
          <rect x="52" y="19.5" width="24" height="3.2" rx="1.2" fill="#334155" stroke="#94a3b8" strokeWidth="0.7" />
          <circle cx="57" cy="21" r="1.4" fill="#94a3b8" />

          {/* Aimpoint Micro T-2 Optic */}
          <rect x="35" y="13.5" width="13" height="6.8" rx="1.2" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
          <rect x="38" y="20.3" width="7" height="2.2" fill="#334155" />
          <circle cx="41.5" cy="16.9" r="1.3" fill="#34d399" />

          {/* Navy Polymer Lower + Angled Grip */}
          <path
            d="M30 32 H54 V38 H42 L39 54 C38.5 55.6 37 56.5 35.2 56.5 H31.5 C30 56.5 29.2 55 29.8 53.2 L33.5 37 H30 Z"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="0.9"
          />
          <rect x="42" y="36.5" width="9" height="5.5" rx="1" fill="#020617" stroke="#334155" strokeWidth="0.8" />
          <circle cx="38" cy="34.5" r="1.4" fill="#ef4444" />

          {/* Signature Curved 30-Round 9mm Magazine */}
          <path
            d="M52 38 H60 C60 46 62 53 66 59 L59 61 C54.5 54 52 46 52 38 Z"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="0.9"
          />
          <line x1="55.5" y1="44" x2="58.5" y2="55" stroke="#34d399" strokeWidth="1" opacity="0.65" />

          {/* Tropical Ribbed Forearm + Vertical Foregrip */}
          <path d="M62 24 H84 V33.5 H62 Z" fill="#1e293b" stroke="#475569" strokeWidth="0.9" />
          {[66, 70, 74, 78].map((rx) => (
            <line key={rx} x1={rx} y1="25.5" x2={rx} y2="32" stroke="#0f172a" strokeWidth="1.2" />
          ))}
          <rect x="70" y="33.5" width="6.5" height="12" rx="1.4" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />

          {/* Front Hooded Sight + Tactical Suppressor */}
          <path d="M81 22.5 L82.5 17 H85 L86.5 22.5 Z" fill="#334155" stroke="#94a3b8" strokeWidth="0.7" />
          <rect x="87" y="23.5" width="26" height="7" rx="1.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.9" />
          <line x1="92" y1="23.5" x2="92" y2="30.5" stroke="#334155" strokeWidth="1.1" />
          <line x1="108" y1="23.5" x2="108" y2="30.5" stroke="#34d399" strokeWidth="1" opacity="0.75" />
        </svg>
      );

    case WeaponType.FLAMETHROWER:
      return (
        <svg viewBox="0 0 120 72" fill="none" className={className}>
          <defs>
            <linearGradient id="flame-tank" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9a3412" />
              <stop offset="45%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
            <linearGradient id="flame-metal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* Pressurized Twin Napalm & Nitrogen Backpack Cylinders */}
          <rect x="4" y="15" width="12" height="39" rx="5.5" fill="url(#flame-tank)" stroke="#fb923c" strokeWidth="0.9" />
          <rect x="17" y="17" width="10" height="36" rx="4.8" fill="#365314" stroke="#84cc16" strokeWidth="0.8" opacity="0.92" />
          {/* Hazard Bands + Pressure Gauge */}
          <rect x="4.5" y="26" width="11" height="4" fill="#fbbf24" opacity="0.85" />
          <circle cx="10" cy="13" r="3" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
          <line x1="10" y1="13" x2="11.8" y2="11.4" stroke="#ef4444" strokeWidth="1" />

          {/* Braided High-Pressure Fuel Hose */}
          <path
            d="M15 48 C22 57, 34 56, 40 44"
            stroke="#334155"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M15 48 C22 57, 34 56, 40 44"
            stroke="#fb923c"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />

          {/* Heavy Ignition Wand Body */}
          <rect x="32" y="26" width="44" height="10" rx="2" fill="url(#flame-metal)" stroke="#94a3b8" strokeWidth="0.9" />
          {/* Rear Trigger Grip + Front Valve Handle */}
          <path
            d="M36 36 H44 L41.5 52 C41 53.5 39.5 54 38 54 H34.5 C33.2 54 32.5 52.8 33 51 Z"
            fill="#0f172a"
            stroke="#64748b"
            strokeWidth="0.9"
          />
          <rect x="44.5" y="36" width="6" height="5" fill="#b91c1c" />
          <rect x="64" y="36" width="7" height="12" rx="1.4" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />

          {/* Underslung Fuel Regulator + Perforated Heat Shroud */}
          <rect x="76" y="27.5" width="23" height="6.8" rx="1.2" fill="#334155" stroke="#94a3b8" strokeWidth="0.8" />
          {[79, 83.5, 88, 92.5].map((hx) => (
            <circle key={hx} cx={hx} cy="30.9" r="1.4" fill="#020617" />
          ))}

          {/* Brass Igniter Nozzle + Pilot Flame */}
          <rect x="99" y="28.2" width="7" height="5.4" rx="0.8" fill="#d97706" stroke="#fde68a" strokeWidth="0.7" />
          <path d="M101 33.6 L104 37.5 H108" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
          {/* Glowing Pilot Flame Plume */}
          <path
            d="M106 30.8 C110 25.5, 116 26.5, 118.5 30.8 C116 35.5, 110 36, 106 30.8 Z"
            fill="#f97316"
            opacity="0.92"
          />
          <path
            d="M107 30.8 C109.5 28, 113 28.5, 115 30.8 C113 33.2, 109.5 33.5, 107 30.8 Z"
            fill="#fde047"
          />
        </svg>
      );

    case WeaponType.AWM_SNIPER:
      return (
        <svg viewBox="0 0 120 72" fill="none" className={className}>
          <defs>
            <linearGradient id="awm-olive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#65a30d" />
              <stop offset="55%" stopColor="#4d7c0f" />
              <stop offset="100%" stopColor="#365314" />
            </linearGradient>
          </defs>

          {/* Thumbhole Precision Rifle Stock */}
          <path
            d="M4 27.5 H32 L34 38 L22 49 H13 C12 49 11.5 47 12.2 44.5 L15 38 H4 Z"
            fill="url(#awm-olive)"
            stroke="#1a2e05"
            strokeWidth="0.9"
          />
          <rect x="3" y="27.5" width="2.5" height="17" rx="0.8" fill="#0f172a" />
          <rect x="10" y="24.8" width="12" height="2.7" rx="1" fill="#1e293b" stroke="#64748b" strokeWidth="0.6" />
          {/* Thumbhole Cutout */}
          <ellipse cx="23.5" cy="36" rx="4.2" ry="3.4" fill="#020617" stroke="#365314" strokeWidth="0.8" />

          {/* Chassis Receiver + Forend */}
          <path
            d="M32 25.5 H72 V34.5 H32 Z"
            fill="url(#awm-olive)"
            stroke="#1a2e05"
            strokeWidth="0.9"
          />
          {/* Steel Bolt Action Assembly */}
          <rect x="35" y="21.5" width="22" height="4.2" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
          <path d="M40 23.5 L36.5 29.5" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="36.2" cy="30" r="1.7" fill="#cbd5e1" />

          {/* 5-Round .338 Lapua Box Magazine */}
          <rect x="44" y="34.5" width="11" height="10" rx="1" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />

          {/* High-Magnification Schmidt & Bender PMII Scope */}
          <rect x="38" y="17.8" width="4" height="3.8" fill="#1e293b" />
          <rect x="52" y="17.8" width="4" height="3.8" fill="#1e293b" />
          <path
            d="M29 12.5 H36 L38 14 H56 L59 11.8 H67 V18.8 H59 L56 16.8 H38 L36 18.2 H29 Z"
            fill="#0f172a"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
          <line x1="66.5" y1="12.5" x2="66.5" y2="18.1" stroke="#c084fc" strokeWidth="1.6" />

          {/* Folding Front Bipod */}
          <line x1="68" y1="34.5" x2="77" y2="48" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="68" y1="34.5" x2="62" y2="48" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="77" cy="48.5" r="1.6" fill="#64748b" />

          {/* Long Free-Float Fluted Barrel + Dual-Baffle Muzzle Brake */}
          <rect x="72" y="26.4" width="35" height="3.8" fill="#334155" stroke="#94a3b8" strokeWidth="0.7" />
          <rect x="107" y="25" width="10" height="6.6" rx="0.8" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="109.5" y="26" width="2" height="4.6" fill="#475569" />
          <rect x="113" y="26" width="2" height="4.6" fill="#475569" />
        </svg>
      );

    case WeaponType.RPG_7:
      return (
        <svg viewBox="0 0 120 72" fill="none" className={className}>
          <defs>
            <linearGradient id="rpg-tube" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="rpg-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="rpg-warhead" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3f6212" />
              <stop offset="70%" stopColor="#65a30d" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* Flared Rear Venturi Exhaust Bell */}
          <path
            d="M4 25 L14 28 V36 L4 39 Z"
            fill="#0f172a"
            stroke="#64748b"
            strokeWidth="0.9"
          />

          {/* Main 40mm Steel Launch Tube */}
          <rect x="14" y="28" width="76" height="8" fill="url(#rpg-tube)" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Wooden Heat Shield Sleeves */}
          <rect x="26" y="26.8" width="24" height="10.4" rx="1.6" fill="url(#rpg-wood)" stroke="#451a03" strokeWidth="0.8" />
          <rect x="52" y="27.2" width="14" height="9.6" rx="1.4" fill="url(#rpg-wood)" stroke="#451a03" strokeWidth="0.8" />

          {/* PGO-7 Optical Sight */}
          <path d="M58 20.5 H68 V26.8 H60 Z" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="67.5" cy="22.8" r="1.8" fill="#fb923c" />

          {/* Forward Firing Grip + Trigger Housing + Rear Support Grip */}
          <path d="M68 36 H75 L73 51 C72.5 52.5 71 53 69.5 53 H67 C65.8 53 65 51.8 65.5 50 Z" fill="#0f172a" stroke="#64748b" strokeWidth="0.9" />
          <rect x="44" y="37" width="6.5" height="12" rx="1.4" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />

          {/* Iconic Protruding PG-7V High-Explosive Warhead */}
          <rect x="90" y="29" width="6" height="6" fill="#475569" />
          <path
            d="M96 29.5 L103 24 L117 31.2 V32.8 L103 40 L96 34.5 Z"
            fill="url(#rpg-warhead)"
            stroke="#365314"
            strokeWidth="0.9"
          />
          <rect x="102.5" y="24.5" width="2.4" height="15" fill="#fbbf24" opacity="0.9" />
          <circle cx="117" cy="32" r="1.6" fill="#cbd5e1" />
        </svg>
      );
  }
};
