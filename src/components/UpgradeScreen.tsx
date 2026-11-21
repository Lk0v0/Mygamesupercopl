/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { UpgradeOption, UpgradeRarity } from '../types';
import {
  Shield,
  Flame,
  Heart,
  Zap,
  Swords,
  Target,
  Sparkles,
  RefreshCw,
  Coins,
  Crown,
  Layers,
  ChevronRight,
  Gauge,
  Activity,
  Award,
  Orbit,
  Atom,
  Sun,
  Crosshair,
} from 'lucide-react';
import { sound } from '../sound';

interface UpgradeScreenProps {
  options: UpgradeOption[];
  onSelect: (option: UpgradeOption) => void;
  level: number;
  onReroll?: () => void;
  rerollsLeft?: number;
}

const getUpgradeIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'hp':
    case 'vampirism':
      return <Heart className={className} />;
    case 'speed':
    case 'lightning':
      return <Zap className={className} />;
    case 'shield':
    case 'shield_deflection':
    case 'shield_epic':
      return <Shield className={className} />;
    case 'damage':
    case 'heavy_damage':
    case 'omega_damage':
      return <Swords className={className} />;
    case 'firerate':
    case 'rapid_burst':
    case 'explosion':
    case 'berserk':
      return <Flame className={className} />;
    case 'pierce':
      return <Target className={className} />;
    case 'bullet_speed':
      return <Gauge className={className} />;
    case 'coins':
    case 'coins_epic':
      return <Coins className={className} />;
    case 'regen':
      return <Activity className={className} />;
    case 'phoenix':
    case 'void_monarch':
      return <Crown className={className} />;
    case 'lead_storm':
      return <Layers className={className} />;
    case 'trophy_legendary':
      return <Award className={className} />;
    case 'crit_blade':
      return <Crosshair className={className} />;
    case 'gravity_pulse':
    case 'mythic_singularity':
      return <Orbit className={className} />;
    case 'solar_phoenix':
      return <Sun className={className} />;
    case 'chrono_reaper':
      return <Atom className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

const CATEGORY_LABELS: Record<string, string> = {
  OFFENSE: 'OFENSIVA',
  SURVIVAL: 'SOBREVIVÊNCIA',
  TACTICAL: 'TÁTICO',
  ULTIMATE: 'SUPREMO',
};

const RARITY_STYLES: Record<
  UpgradeRarity,
  {
    label: string;
    stripBg: string;
    border: string;
    bg: string;
    labelColor: string;
    iconBox: string;
    statColor: string;
    cta: string;
  }
> = {
  COMMON: {
    label: 'COMUM',
    stripBg: 'bg-emerald-500',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'from-[#071018]/95 to-slate-950/95',
    labelColor: 'text-emerald-300',
    iconBox: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300',
    statColor: 'text-emerald-300',
    cta: 'bg-slate-800 hover:bg-emerald-500 text-white hover:text-slate-950 border-emerald-500/40',
  },
  RARE: {
    label: 'RARO',
    stripBg: 'bg-cyan-400',
    border: 'border-cyan-500/50 hover:border-cyan-300',
    bg: 'from-[#071018]/95 via-cyan-950/35 to-slate-950/95',
    labelColor: 'text-cyan-300',
    iconBox: 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200',
    statColor: 'text-cyan-300',
    cta: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300',
  },
  EPIC: {
    label: 'ÉPICO',
    stripBg: 'bg-purple-500',
    border: 'border-purple-500/60 hover:border-purple-300',
    bg: 'from-[#071018]/95 via-purple-950/40 to-slate-950/95',
    labelColor: 'text-purple-300',
    iconBox: 'bg-purple-500/20 border-purple-400/60 text-purple-200',
    statColor: 'text-purple-200',
    cta: 'bg-purple-600 hover:bg-purple-500 text-white border-purple-300',
  },
  LEGENDARY: {
    label: 'LENDÁRIO',
    stripBg: 'bg-amber-400',
    border: 'border-amber-400/75 hover:border-amber-200',
    bg: 'from-[#071018]/95 via-amber-950/35 to-slate-950/95',
    labelColor: 'text-amber-300',
    iconBox: 'bg-amber-500/20 border-amber-300/65 text-amber-200',
    statColor: 'text-amber-300',
    cta: 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200',
  },
  MYTHIC: {
    label: 'MÍTICO',
    stripBg: 'bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300',
    border: 'border-cyan-300 hover:border-white ring-1 ring-fuchsia-400/40',
    bg: 'from-slate-950 via-fuchsia-950/45 to-cyan-950/45',
    labelColor: 'text-cyan-200',
    iconBox: 'bg-gradient-to-br from-cyan-500/35 via-fuchsia-500/35 to-amber-400/35 border-cyan-200/80 text-white',
    statColor: 'text-cyan-200',
    cta: 'bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 hover:brightness-105 text-slate-950 border-white',
  },
};

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({
  options,
  onSelect,
  level,
  onReroll,
  rerollsLeft = 0,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rerollCycle, setRerollCycle] = useState<number>(0);
  const selectionLockRef = useRef<boolean>(false);
  const selectTimerRef = useRef<number | null>(null);

  const hasMythic = options.some((opt) => opt.rarity === 'MYTHIC');

  useEffect(() => {
    selectionLockRef.current = false;
    setSelectedId(null);
    if (selectTimerRef.current) {
      clearTimeout(selectTimerRef.current);
      selectTimerRef.current = null;
    }

    const containsMythic = options.some((opt) => opt.rarity === 'MYTHIC');
    const containsLegendary = options.some((opt) => opt.rarity === 'LEGENDARY');
    if (containsMythic) {
      sound.playMythicArrival();
    } else if (containsLegendary) {
      sound.playLegendary();
    } else {
      sound.playLevelUp();
    }

    return () => {
      if (selectTimerRef.current) {
        clearTimeout(selectTimerRef.current);
        selectTimerRef.current = null;
      }
    };
  }, [options]);

  const triggerSelect = useCallback(
    (option: UpgradeOption) => {
      if (!option || selectionLockRef.current) return;
      selectionLockRef.current = true;
      setSelectedId(option.id);
      if (option.rarity === 'MYTHIC') {
        sound.playMythicBlast();
      } else {
        sound.playPowerup();
      }
      selectTimerRef.current = window.setTimeout(() => {
        onSelect(option);
      }, 110);
    },
    [onSelect]
  );

  const handleReroll = useCallback(() => {
    if (!onReroll || rerollsLeft <= 0 || selectionLockRef.current) return;
    sound.playReroll();
    setRerollCycle((c) => c + 1);
    onReroll();
  }, [onReroll, rerollsLeft]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selectionLockRef.current) return;
      if (e.key === '1' && options[0]) triggerSelect(options[0]);
      else if (e.key === '2' && options[1]) triggerSelect(options[1]);
      else if (e.key === '3' && options[2]) triggerSelect(options[2]);
      else if ((e.key === 'r' || e.key === 'R') && rerollsLeft > 0 && onReroll) {
        handleReroll();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [options, rerollsLeft, onReroll, triggerSelect, handleReroll]);

  return (
    <div
      data-gamepad-scope="modal"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050a0f]/92 backdrop-blur-md p-3 sm:p-6 pt-safe pb-safe select-none overflow-y-auto hud-scroll animate-lvl-backdrop"
    >
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center my-auto gap-3 sm:gap-5">
        {/* Clean Header Row (No static pill clutter) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#071018]/90 border border-white/10 shadow-xl animate-lvl-banner">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-[0.18em] uppercase text-cyan-300 block leading-none mb-1">
                {hasMythic ? 'Ressonância Mítica Detectada' : `Subiu de Nível · Nv.${level + 1}`}
              </span>
              <h2
                className={`text-lg sm:text-2xl font-display font-bold uppercase tracking-wide truncate leading-tight text-transparent bg-clip-text ${
                  hasMythic
                    ? 'bg-gradient-to-r from-cyan-200 via-fuchsia-300 to-amber-200'
                    : 'bg-gradient-to-r from-white via-cyan-100 to-sky-300'
                }`}
              >
                Escolha um Power-Up
              </h2>
            </div>
          </div>

          {onReroll && rerollsLeft > 0 && (
            <button
              type="button"
              data-gamepad-nav="true"
              onClick={handleReroll}
              className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-cyan-400/45 text-cyan-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>Rolar ({rerollsLeft})</span>
              <span className="hidden sm:inline text-slate-400">[R]</span>
            </button>
          )}
        </div>

        {/* 3 Cards: Side-by-Side on Widescreen/Landscape, Compact Horizontal Rows on Portrait */}
        <div className="grid grid-cols-1 landscape:grid-cols-3 sm:grid-cols-3 gap-2.5 sm:gap-4 w-full">
          {options.map((option, idx) => {
            const rarity: UpgradeRarity = option.rarity || 'COMMON';
            const style = RARITY_STYLES[rarity] || RARITY_STYLES.COMMON;
            const isMythic = rarity === 'MYTHIC';
            const isSelected = selectedId === option.id;
            const isDimmed = selectedId !== null && !isSelected;
            const stack = option.currentStack || 0;
            const categoryLabel = CATEGORY_LABELS[option.category || 'TACTICAL'] || 'TÁTICO';

            const animClass = isSelected
              ? 'animate-lvl-selected'
              : rerollCycle > 0
                ? 'animate-lvl-reroll'
                : 'animate-lvl-card';

            return (
              <button
                key={`${option.id}-${idx}-${rerollCycle}`}
                type="button"
                data-gamepad-nav="true"
                onClick={() => triggerSelect(option)}
                style={{ animationDelay: `${idx * 45}ms` }}
                className={`group relative text-left flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl border bg-gradient-to-b ${style.bg} ${style.border} ${animClass} cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden shadow-xl ${
                  isDimmed ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${style.stripBg}`} />

                {/* Clean Unboxed Top Metadata Line */}
                <div className="relative z-10 flex items-center justify-between gap-2 pb-2 border-b border-white/10 w-full text-[10.5px] font-mono">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className={`font-bold uppercase tracking-wider ${style.labelColor}`}>
                      {style.label}
                    </span>
                    <span className="text-white/25" aria-hidden="true">·</span>
                    <span className="text-slate-400 uppercase truncate">{categoryLabel}</span>
                  </div>

                  {stack > 0 ? (
                    <span className="text-amber-300 font-bold tabular-nums shrink-0">
                      NV.{stack}→{stack + 1}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-bold shrink-0">[{idx + 1}]</span>
                  )}
                </div>

                {/* Body: Horizontal on Portrait, Vertical Centered on Widescreen */}
                <div className="relative z-10 flex landscape:flex-col sm:flex-col items-center gap-3 my-2.5 sm:my-4 w-full">
                  <div className="relative flex items-center justify-center shrink-0">
                    {isMythic && (
                      <div className="hidden sm:block absolute w-16 h-16 rounded-full border border-dashed border-cyan-300/60 animate-mythic-spin pointer-events-none" />
                    )}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 ${
                        isMythic ? 'animate-mythic-float' : ''
                      } ${style.iconBox}`}
                    >
                      {getUpgradeIcon(option.icon, 'w-6 h-6 sm:w-7 sm:h-7')}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 landscape:text-center sm:text-center w-full">
                    <h3
                      className={`text-sm sm:text-base font-display font-bold uppercase tracking-wide leading-tight mb-1 truncate sm:whitespace-normal ${
                        isMythic
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200'
                          : 'text-white'
                      }`}
                    >
                      {option.title}
                    </h3>

                    {option.statBonus && (
                      <div
                        className={`text-xs font-mono-numbers font-bold tracking-wide mb-1 truncate ${style.statColor}`}
                      >
                        {option.statBonus}
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-snug line-clamp-2 sm:line-clamp-3">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Tactile Selection Bar */}
                <div
                  className={`relative z-10 w-full min-h-[40px] py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider transition-colors ${style.cta}`}
                >
                  <span>{isMythic ? 'Despertar Poder' : 'Instalar Upgrade'}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        <p className="hidden sm:block text-[11px] font-mono text-slate-400 uppercase tracking-widest text-center">
          Toque no card, use [1] [2] [3] no teclado ou D-Pad + (A) no controle
        </p>
      </div>
    </div>
  );
};
