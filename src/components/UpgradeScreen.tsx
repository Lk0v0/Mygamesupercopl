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
      return <Heart className={className} />;
    case 'speed':
      return <Zap className={className} />;
    case 'shield':
    case 'shield_deflection':
    case 'shield_epic':
      return <Shield className={className} />;
    case 'damage':
    case 'heavy_damage':
      return <Swords className={className} />;
    case 'firerate':
    case 'rapid_burst':
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
    case 'vampirism':
      return <Heart className={className} />;
    case 'explosion':
      return <Flame className={className} />;
    case 'phoenix':
      return <Crown className={className} />;
    case 'omega_damage':
      return <Swords className={className} />;
    case 'lead_storm':
      return <Layers className={className} />;
    case 'trophy_legendary':
      return <Award className={className} />;
    case 'lightning':
      return <Zap className={className} />;
    case 'crit_blade':
      return <Crosshair className={className} />;
    case 'gravity_pulse':
      return <Orbit className={className} />;
    case 'berserk':
      return <Flame className={className} />;
    case 'mythic_singularity':
      return <Orbit className={className} />;
    case 'solar_phoenix':
      return <Sun className={className} />;
    case 'chrono_reaper':
      return <Atom className={className} />;
    case 'void_monarch':
      return <Crown className={className} />;
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

const RARITY_CONFIG: Record<
  UpgradeRarity,
  {
    label: string;
    border: string;
    cornerColor: string;
    glow: string;
    accentColor: string;
    iconBg: string;
    bgGradient: string;
    ctaClass: string;
  }
> = {
  COMMON: {
    label: 'COMUM',
    border: 'border-slate-700/80 hover:border-emerald-400/80',
    cornerColor: 'border-emerald-400/60',
    glow: 'hover:shadow-[0_0_28px_rgba(16,185,129,0.22)]',
    accentColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-400/35 text-emerald-300',
    bgGradient: 'from-slate-900/95 via-slate-900/90 to-slate-950/95',
    ctaClass: 'bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white border-slate-600 hover:border-emerald-300',
  },
  RARE: {
    label: 'RARO',
    border: 'border-cyan-500/45 hover:border-cyan-300',
    cornerColor: 'border-cyan-400',
    glow: 'hover:shadow-[0_0_36px_rgba(6,182,212,0.34)]',
    accentColor: 'text-cyan-300',
    iconBg: 'bg-cyan-500/15 border-cyan-400/45 text-cyan-300',
    bgGradient: 'from-slate-900/95 via-cyan-950/30 to-slate-950/95',
    ctaClass: 'bg-cyan-600 hover:bg-cyan-400 text-slate-950 border-cyan-400',
  },
  EPIC: {
    label: 'ÉPICO',
    border: 'border-purple-500/55 hover:border-purple-300',
    cornerColor: 'border-purple-400',
    glow: 'hover:shadow-[0_0_42px_rgba(168,85,247,0.42)]',
    accentColor: 'text-purple-300',
    iconBg: 'bg-purple-500/20 border-purple-400/50 text-purple-200',
    bgGradient: 'from-slate-900/95 via-purple-950/35 to-slate-950/95',
    ctaClass: 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400',
  },
  LEGENDARY: {
    label: 'LENDÁRIO',
    border: 'border-amber-400/80 hover:border-amber-200',
    cornerColor: 'border-amber-300',
    glow: 'shadow-[0_0_38px_rgba(245,158,11,0.28)] hover:shadow-[0_0_62px_rgba(245,158,11,0.55)]',
    accentColor: 'text-amber-300',
    iconBg: 'bg-amber-500/25 border-amber-300/65 text-amber-200',
    bgGradient: 'from-slate-900/95 via-amber-950/35 to-slate-950/95',
    ctaClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
  },
  MYTHIC: {
    label: 'MÍTICO',
    border: 'border-cyan-300 hover:border-white',
    cornerColor: 'border-fuchsia-300',
    glow: 'shadow-[0_0_60px_rgba(56,189,248,0.48)] hover:shadow-[0_0_88px_rgba(217,70,239,0.78)]',
    accentColor: 'text-cyan-200',
    iconBg: 'bg-gradient-to-br from-cyan-500/35 via-fuchsia-500/35 to-amber-400/35 border-cyan-200/80 text-white',
    bgGradient: 'from-slate-950 via-fuchsia-950/55 to-cyan-950/55',
    ctaClass: 'bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 hover:brightness-110 text-slate-950 border-white shadow-[0_0_28px_rgba(56,189,248,0.55)]',
  },
};

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({
  options,
  onSelect,
  level,
  onReroll,
  rerollsLeft = 1,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rerollCycle, setRerollCycle] = useState<number>(0);
  const hasMythic = options.some((opt) => opt.rarity === 'MYTHIC');
  const [mythicStage, setMythicStage] = useState<'RIFT' | 'SUPERNOVA' | 'REVEALED'>(
    hasMythic ? 'RIFT' : 'REVEALED'
  );
  const selectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedId(null);
    const containsMythic = options.some((opt) => opt.rarity === 'MYTHIC');
    const containsLegendary = options.some((opt) => opt.rarity === 'LEGENDARY');

    if (containsMythic) {
      setMythicStage('RIFT');
      sound.playMythicArrival();
      const burstTimer = window.setTimeout(() => {
        setMythicStage('SUPERNOVA');
        sound.playMythicBlast();
      }, 650);
      const revealTimer = window.setTimeout(() => {
        setMythicStage('REVEALED');
      }, 1300);
      return () => {
        clearTimeout(burstTimer);
        clearTimeout(revealTimer);
      };
    } else {
      setMythicStage('REVEALED');
      if (containsLegendary) {
        sound.playLegendary();
      } else {
        sound.playLevelUp();
      }
    }
  }, [options]);

  useEffect(() => {
    return () => {
      if (selectTimerRef.current) clearTimeout(selectTimerRef.current);
    };
  }, []);

  const triggerSelect = useCallback(
    (option: UpgradeOption) => {
      if (mythicStage !== 'REVEALED' || selectedId !== null) return;
      setSelectedId(option.id);
      if (option.rarity === 'MYTHIC') {
        sound.playMythicBlast();
      } else {
        sound.playPowerup();
      }
      selectTimerRef.current = window.setTimeout(() => {
        onSelect(option);
      }, 190);
    },
    [mythicStage, selectedId, onSelect]
  );

  const handleReroll = useCallback(() => {
    if (!onReroll || rerollsLeft <= 0 || mythicStage !== 'REVEALED' || selectedId !== null) return;
    sound.playReroll();
    setRerollCycle((c) => c + 1);
    onReroll();
  }, [onReroll, rerollsLeft, mythicStage, selectedId]);

  // Keyboard shortcuts [1] [2] [3] to pick upgrade & [R] to reroll
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (mythicStage !== 'REVEALED') {
        if (e.key === ' ' || e.key === 'Enter') {
          setMythicStage('REVEALED');
        }
        return;
      }
      if (e.key === '1' && options[0]) triggerSelect(options[0]);
      else if (e.key === '2' && options[1]) triggerSelect(options[1]);
      else if (e.key === '3' && options[2]) triggerSelect(options[2]);
      else if ((e.key === 'r' || e.key === 'R') && rerollsLeft > 0 && onReroll) {
        handleReroll();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [options, mythicStage, rerollsLeft, onReroll, triggerSelect, handleReroll]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-xl p-4 sm:p-6 md:p-8 select-none overflow-y-auto animate-lvl-backdrop">
      {/* Ambient Tactical Grid */}
      <div
        className="fixed inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: hasMythic
            ? 'linear-gradient(#d946ef 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)'
            : 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* Mythic Cosmic Vortex Backdrop */}
      {hasMythic && (
        <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            className="w-[1150px] h-[1150px] rounded-full opacity-30 animate-mythic-spin"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(56,189,248,0.5) 35deg, transparent 85deg, rgba(217,70,239,0.5) 155deg, transparent 215deg, rgba(250,204,21,0.45) 285deg, transparent 360deg)',
              filter: 'blur(30px)',
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* REBUILT MYTHIC AWAKENING SEQUENCE (RIFT -> SUPERNOVA)     */}
      {/* ========================================================= */}
      {hasMythic && mythicStage !== 'REVEALED' && (
        <div
          onClick={() => setMythicStage('REVEALED')}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 cursor-pointer overflow-hidden"
        >
          {/* Dimensional Horizontal Rift Slit */}
          {mythicStage === 'RIFT' && (
            <div className="absolute w-[85vw] max-w-2xl h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_40px_rgba(56,189,248,0.95)] animate-mythic-rift pointer-events-none" />
          )}

          {/* Supernova Triple Shockwave & Flash */}
          {mythicStage === 'SUPERNOVA' && (
            <>
              <div className="absolute w-72 h-72 rounded-full border-4 border-cyan-300 animate-mythic-shockwave pointer-events-none" />
              <div
                className="absolute w-72 h-72 rounded-full border-4 border-fuchsia-400 animate-mythic-shockwave pointer-events-none"
                style={{ animationDelay: '90ms' }}
              />
              <div
                className="absolute w-72 h-72 rounded-full border-2 border-amber-300 animate-mythic-shockwave pointer-events-none"
                style={{ animationDelay: '180ms' }}
              />
              <div className="fixed inset-0 bg-gradient-to-r from-cyan-300/35 via-white/40 to-fuchsia-400/35 animate-mythic-flash pointer-events-none" />
            </>
          )}

          {/* Concentric Dimensional Sigils + Imploding Core */}
          <div className="relative flex items-center justify-center w-52 h-52">
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/75 animate-mythic-spin-fast" />
            <div className="absolute inset-3 rounded-full border-2 border-fuchsia-400/75 animate-mythic-spin-reverse" />
            <div className="absolute inset-8 rotate-45 border border-amber-300/60 animate-mythic-spin" />
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-amber-300 flex items-center justify-center shadow-[0_0_90px_rgba(217,70,239,0.95)] animate-mythic-core-charge">
              <Atom className="w-12 h-12 text-slate-950" />
            </div>
          </div>

          <div className="mt-8 text-center px-4">
            <p className="text-[11px] font-mono tracking-[0.34em] text-cyan-300 uppercase mb-2">
              Ruptura Dimensional Detectada · Nível {level + 1}
            </p>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-fuchsia-300 to-amber-200 uppercase tracking-wider drop-shadow-2xl">
              Despertar Mítico
            </h2>
            <p className="mt-3 text-[11px] text-slate-400 font-mono uppercase tracking-widest">
              Clique ou pressione [ESPAÇO] para revelar
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REBUILT POWER-UP SELECTOR PANEL                           */}
      {/* ========================================================= */}
      <div
        className={`relative z-10 w-full max-w-5xl flex flex-col items-center my-auto py-3 transition-all duration-300 ${
          mythicStage !== 'REVEALED' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Tactical Header Banner */}
        <div className="w-full max-w-3xl text-center mb-5 sm:mb-7 animate-lvl-banner">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-cyan-500/35 rounded text-[10px] font-mono font-bold tracking-[0.22em] uppercase text-cyan-300 mb-2.5">
            <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
            <span>
              {hasMythic
                ? 'Singularidade Mítica Disponível'
                : `Protocolo de Evolução · Nível ${level + 1}`}
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-5xl font-display font-black text-transparent bg-clip-text tracking-tight uppercase italic drop-shadow-xl ${
              hasMythic
                ? 'bg-gradient-to-r from-cyan-200 via-fuchsia-300 to-amber-200'
                : 'bg-gradient-to-r from-white via-cyan-200 to-sky-400'
            }`}
          >
            SELETOR DE POWER-UP
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto font-sans">
            Escolha 1 diretriz de combate para instalar no seu equipamento agora.
          </p>
        </div>

        {/* 3 Angular Tactical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full mb-6">
          {options.map((option, idx) => {
            const rarity = option.rarity || 'COMMON';
            const config = RARITY_CONFIG[rarity];
            const isMythic = rarity === 'MYTHIC';
            const isLegendary = rarity === 'LEGENDARY';
            const isEpic = rarity === 'EPIC';
            const isSelected = selectedId === option.id;
            const isDimmed = selectedId !== null && !isSelected;
            const stack = option.currentStack || 0;
            const categoryLabel = CATEGORY_LABELS[option.category || 'TACTICAL'] || 'TÁTICO';

            const animClass = isSelected
              ? 'animate-lvl-selected'
              : rerollCycle > 0
              ? 'animate-lvl-reroll'
              : hasMythic
              ? 'animate-mythic-card-reveal'
              : 'animate-lvl-card';

            return (
              <div
                key={`${option.id}-${rerollCycle}`}
                onClick={() => triggerSelect(option)}
                style={{ animationDelay: `${idx * 90}ms` }}
                className={`group relative flex flex-col justify-between p-5 rounded-lg border-2 bg-gradient-to-b ${
                  config.bgGradient
                } ${config.border} ${config.glow} ${animClass} backdrop-blur-md cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 active:scale-[0.98] ${
                  isMythic ? 'ring-1 ring-cyan-200/70' : ''
                } ${isDimmed ? 'opacity-40 scale-95 pointer-events-none' : ''} overflow-hidden shadow-2xl`}
              >
                {/* Angular HUD Corner Brackets */}
                <span className={`pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 ${config.cornerColor}`} />
                <span className={`pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 ${config.cornerColor}`} />
                <span className={`pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 ${config.cornerColor}`} />
                <span className={`pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 ${config.cornerColor}`} />

                {/* Prismatic Foil Top Bar & Aurora Sweep for Mythic */}
                {isMythic && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 animate-mythic-holo" />
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent animate-mythic-aurora" />
                    </div>
                  </>
                )}

                {/* Hover Shimmer for Epic / Legendary */}
                {(isLegendary || isEpic) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                )}

                {/* Top Metadata Strip */}
                <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-black tracking-wider uppercase ${config.accentColor}`}>
                      {config.label}
                    </span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-400 font-bold">{categoryLabel}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {stack > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-bold font-mono-numbers">
                        NV.{stack}→{stack + 1}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-bold">
                        [{idx + 1}]
                      </span>
                    )}
                  </div>
                </div>

                {/* Emblem Icon with Active Orbital Rings on Mythic / Legendary */}
                <div className="relative z-10 flex items-center justify-center my-5">
                  {isMythic && (
                    <>
                      <div className="absolute w-24 h-24 rounded-full border border-dashed border-cyan-300/70 animate-mythic-spin pointer-events-none" />
                      <div className="absolute w-28 h-28 rounded-full border border-fuchsia-400/50 animate-mythic-spin-reverse pointer-events-none" />
                      <div className="absolute w-20 h-20 rotate-45 border border-amber-300/40 animate-mythic-spin-fast pointer-events-none" />
                    </>
                  )}
                  {isLegendary && (
                    <div className="absolute w-24 h-24 rounded-full border border-dashed border-amber-400/40 animate-mythic-spin pointer-events-none" />
                  )}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                      isMythic ? 'animate-mythic-float' : ''
                    } ${config.iconBg}`}
                  >
                    {getUpgradeIcon(option.icon, 'w-8 h-8 sm:w-10 sm:h-10')}
                  </div>
                </div>

                {/* Title, Stat Bonus Callout & Description */}
                <div className="relative z-10 flex flex-col text-center mb-5 flex-1">
                  <h3
                    className={`text-base sm:text-lg font-display font-black tracking-wide uppercase mb-2 ${
                      isMythic
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200'
                        : 'text-white'
                    }`}
                  >
                    {option.title}
                  </h3>

                  {option.statBonus && (
                    <div className="mx-auto mb-2.5 px-2.5 py-1 rounded bg-slate-950/80 border border-white/10 text-[11px] font-mono-numbers font-bold text-cyan-300 tracking-wide">
                      {option.statBonus}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {option.description}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  className={`relative z-10 w-full py-2.5 px-4 rounded border flex items-center justify-center gap-1.5 text-xs font-display font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${config.ctaClass}`}
                >
                  <span>{isMythic ? 'Despertar Poder Mítico' : 'Instalar Power-Up'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Bar: Reroll + Hotkey Hint */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onReroll && rerollsLeft > 0 && (
            <button
              onClick={handleReroll}
              className="flex items-center gap-2 px-5 py-2.5 rounded bg-slate-900/95 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Rolar Novas Opções ({rerollsLeft} restante)</span>
              <span className="text-slate-500 ml-1">[R]</span>
            </button>
          )}
          <span className="hidden sm:inline text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Atalhos: [1] [2] [3] Selecionar
          </span>
        </div>
      </div>
    </div>
  );
};
