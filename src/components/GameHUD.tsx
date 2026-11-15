import React, { useState, useEffect, useRef } from 'react';
import { ActiveBossInfo, GameMode, GameState, Player, WeaponType } from '../types';
import {
  Trophy,
  Skull,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Shield,
  Heart,
  Sparkles,
  Crosshair,
  Zap,
  Activity,
  Aperture,
  Flame,
  Coins,
  ShoppingCart,
  Radio,
  HelpCircle,
  X,
  ChevronRight,
  Target,
  Swords,
  Award,
  AlertTriangle,
  Biohazard,
  Atom,
  Orbit,
  Crown,
  GitBranch,
  Gem,
  Snowflake,
} from 'lucide-react';
import { sound } from '../sound';

interface GameHUDProps {
  gameState: GameState;
  player: Player;
  wave: number;
  zombiesRemaining: number;
  highScore: number;
  highScoreZombie: number;
  highScoreAlien: number;
  gameMode: GameMode;
  activeBoss?: ActiveBossInfo | null;
  onStart: () => void;
  onOpenModeSelect: () => void;
  onChangeMode?: (mode: GameMode) => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onGoToMenu: () => void;
  onSelectWeapon?: (weapon: WeaponType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  coins: number;
  onOpenStore: () => void;
  onResetAll?: () => void;
  prestigeLevel?: number;
  tokens?: number;
  onOpenPrestige?: () => void;
  onOpenMastery?: () => void;
  masterySkillHud?: {
    available: boolean;
    name: string;
    cooldown: number;
    maxCooldown: number;
    shipColor: string;
  };
  onTriggerMasterySkill?: () => void;
  destructorWarp?: {
    chargeProgress: number;
    active: boolean;
    remainingRatio: number;
  };
  ironManMode?: 'REPULSOR' | 'LASER';
  onToggleIronManMode?: () => void;
  iceFireDragonHud?: {
    activeDragon: 'FIRE' | 'ICE';
    merged: boolean;
    mergeTimer: number;
    mergeDuration: number;
    cooldown: number;
    maxCooldown: number;
  };
  onSwitchIceFireDragon?: () => void;
  onTriggerIceFireMerge?: () => void;
}

const getWeaponIcon = (wt: WeaponType) => {
  switch (wt) {
    case WeaponType.PISTOL:
    case WeaponType.ASSAULT_RIFLE:
    case WeaponType.MINIGUN:
      return Crosshair;
    case WeaponType.MAGNUM:
    case WeaponType.SNIPER:
      return Target;
    case WeaponType.SHOTGUN:
    case WeaponType.ROCKET_LAUNCHER:
    case WeaponType.DESTRUCTOR:
    case WeaponType.IRON_MAN:
      return Zap;
    case WeaponType.MACHINE_GUN:
    case WeaponType.LMG:
      return Activity;
    case WeaponType.PLASMA_RIFLE:
    case WeaponType.RAY_RIFLE:
    case WeaponType.INTERCEPTOR:
      return Aperture;
    case WeaponType.FLAMETHROWER:
    case WeaponType.NAVE_REI:
    case WeaponType.EAST_DRAGON:
    case WeaponType.ICE_AND_FIRE_DRAGON:
      return Flame;
    case WeaponType.RAYGUN:
      return Sparkles;
    case WeaponType.LASER_MINIGUN:
      return Radio;
    default:
      return Crosshair;
  }
};

export const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  player,
  wave,
  zombiesRemaining,
  highScore,
  highScoreZombie,
  highScoreAlien,
  gameMode,
  activeBoss,
  onStart,
  onOpenModeSelect,
  onChangeMode,
  onPauseToggle,
  onRestart,
  onGoToMenu,
  soundEnabled,
  onToggleSound,
  coins,
  onOpenStore,
  onResetAll,
  prestigeLevel = 0,
  tokens = 0,
  onOpenPrestige,
  onOpenMastery,
  masterySkillHud,
  onTriggerMasterySkill,
  destructorWarp,
  ironManMode = 'REPULSOR',
  onToggleIronManMode,
  iceFireDragonHud,
  onSwitchIceFireDragon,
  onTriggerIceFireMerge,
}) => {
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showRebootModal, setShowRebootModal] = useState(false);
  const [waveAlert, setWaveAlert] = useState<number | null>(null);
  const [bossBanner, setBossBanner] = useState<{ name: string; title: string } | null>(null);
  const prevWaveRef = useRef(wave);
  const prevBossIdRef = useRef<string | null>(null);

  // Trigger dramatic Boss arrival banner
  useEffect(() => {
    if (activeBoss && activeBoss.id !== prevBossIdRef.current) {
      setBossBanner({ name: activeBoss.name, title: activeBoss.title });
      const timer = setTimeout(() => {
        setBossBanner(null);
      }, 3500);
      prevBossIdRef.current = activeBoss.id;
      return () => clearTimeout(timer);
    }
    if (!activeBoss) {
      prevBossIdRef.current = null;
    }
  }, [activeBoss]);

  // Trigger brief dramatic tactical banner when wave increments
  useEffect(() => {
    if (gameState === GameState.PLAYING && wave > 1 && wave !== prevWaveRef.current) {
      setWaveAlert(wave);
      const timer = setTimeout(() => {
        setWaveAlert(null);
      }, 2600);
      prevWaveRef.current = wave;
      return () => clearTimeout(timer);
    }
    prevWaveRef.current = wave;
  }, [wave, gameState]);

  const xpPercentage = Math.min(100, (player.xp / player.xpNeeded) * 100);
  const hpPercentage = Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100));
  const isCriticalHp = hpPercentage <= 30;
  const isExtremeHp = hpPercentage <= 15;
  const shieldPercentage =
    player.maxShield > 0 ? Math.min(100, Math.max(0, (player.shield / player.maxShield) * 100)) : 0;

  const currentWeaponStats = player.weapons[player.currentWeapon] || {
    name: 'Pistola Tática 9mm',
    damage: 18,
    fireRate: 4.5,
    piercing: 1,
    color: '#38bdf8',
  };
  const CurrentIcon = getWeaponIcon(player.currentWeapon);

  const handleButtonClick = (action: () => void) => {
    sound.playClick();
    action();
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-40 select-none overflow-hidden">
      {/* ========================================================= */}
      {/* 1. ACTIVE PLAYING / PAUSED / LEVEL UP HUD (MINIMALIST) */}
      {/* ========================================================= */}
      {(gameState === GameState.PLAYING ||
        gameState === GameState.PAUSED ||
        gameState === GameState.LEVEL_UP) && (
        <>
          {/* Top Horizon XP Hairline (Ultra-minimalist) */}
          <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
            <div className="w-full h-[2px] bg-slate-900/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Visceral Low Health Danger & Arterial Vignette Overlay */}
          {isCriticalHp && gameState === GameState.PLAYING && (
            <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none">
              {/* Layer 1: Arterial Deep Crimson Pulse Vignette */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isExtremeHp
                    ? 'bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(153,27,27,0.45)_55%,rgba(69,10,10,0.88)_100%)] animate-pulse'
                    : 'bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(185,28,28,0.3)_65%,rgba(127,29,29,0.7)_100%)] animate-pulse'
                }`}
              />

              {/* Layer 2: Heavy Bleeding Frame & Visor Blood Edges */}
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  isExtremeHp
                    ? 'border-[12px] sm:border-[24px] border-red-700/60 shadow-[inset_0_0_120px_rgba(220,38,38,0.85)]'
                    : 'border-[8px] sm:border-[16px] border-red-600/40 shadow-[inset_0_0_80px_rgba(220,38,38,0.6)]'
                }`}
              />

              {/* Layer 3: Organic Visor Blood Dripping & Corner Splatters */}
              <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Top-Left Blood Splat */}
                <path d="M0,0 Q60,40 100,0 Q80,70 120,60 Q70,90 40,110 Q20,130 0,140 Z" fill="#7f1d1d" opacity="0.75" />
                <circle cx="90" cy="85" r="5" fill="#991b1b" opacity="0.7" />
                <circle cx="115" cy="110" r="3.5" fill="#991b1b" opacity="0.6" />
                <path d="M40,110 Q42,150 43,180 Q44,195 46,200 Q43,200 42,180 Z" fill="#991b1b" opacity="0.6" />

                {/* Top-Right Blood Splat */}
                <path d="M100%,0 Qcalc(100% - 60px),40 calc(100% - 100px),0 Qcalc(100% - 75px),75 calc(100% - 110px),60 Qcalc(100% - 60px),100 calc(100% - 30px),130 L100%,130 Z" fill="#7f1d1d" opacity="0.75" />
                <circle cx="calc(100% - 85px)" cy="90" r="4.5" fill="#991b1b" opacity="0.7" />
                <circle cx="calc(100% - 120px)" cy="80" r="3" fill="#991b1b" opacity="0.6" />

                {/* Bottom-Left & Bottom-Right Splatters */}
                <path d="M0,100% Q50,calc(100% - 50px) 110,100% Q80,calc(100% - 80px) 0,calc(100% - 110px) Z" fill="#450a0a" opacity="0.8" />
                <path d="M100%,100% Qcalc(100% - 50px),calc(100% - 50px) calc(100% - 110px),100% Qcalc(100% - 80px),calc(100% - 80px) 100%,calc(100% - 110px) Z" fill="#450a0a" opacity="0.8" />
              </svg>

              {/* Layer 4: Tactical Biometric ECG Telemetry Monitor Warning Banner */}
              <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-xl transition-all ${
                    isExtremeHp
                      ? 'bg-red-950/95 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.75)] animate-bounce'
                      : 'bg-red-950/90 border-red-500/60 shadow-[0_0_16px_rgba(239,68,68,0.45)]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 text-red-400 fill-red-500 ${isExtremeHp ? 'animate-ping' : 'animate-pulse'}`} />
                  
                  <svg className="hidden sm:block w-12 h-3.5 text-red-400 stroke-current fill-none" viewBox="0 0 60 20" strokeWidth="2">
                    <path d="M0,10 L15,10 L20,3 L25,17 L30,5 L35,13 L40,10 L60,10" className="animate-pulse" />
                  </svg>

                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono font-black tracking-wider text-red-200 uppercase leading-none">
                      {isExtremeHp ? 'TRAUMA SEVERO' : 'VITALIDADE CRÍTICA'}
                    </span>
                    <span className="text-[8.5px] font-mono font-bold text-red-400 uppercase mt-0.5 leading-none">
                      {player.hp} HP · {Math.round(130 + (1 - hpPercentage / 30) * 55)} BPM
                    </span>
                  </div>

                  <Activity className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* New Wave Start Brief Tactical Alert */}
          {waveAlert && (
            <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-950/90 border border-amber-500/40 px-3.5 py-1 rounded-lg shadow-lg flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-display font-black text-white uppercase tracking-wider whitespace-nowrap">
                  ONDA {waveAlert} INICIADA
                </span>
              </div>
            </div>
          )}

          {/* Dramatic Boss Arrival Warning Banner */}
          {bossBanner && (
            <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-300 w-full max-w-md px-3">
              <div className={`p-2 sm:p-3 rounded-xl border shadow-2xl flex items-center gap-2.5 ${
                gameMode === GameMode.ALIEN
                  ? 'bg-cyan-950/95 border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.5)]'
                  : 'bg-red-950/95 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.5)]'
              }`}>
                <div className={`p-2 rounded-lg shrink-0 ${gameMode === GameMode.ALIEN ? 'bg-cyan-500 text-slate-950' : 'bg-red-600 text-white'}`}>
                  {gameMode === GameMode.ALIEN ? (
                    <Orbit className="w-5 h-5 animate-spin-slow" />
                  ) : (
                    <Skull className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[9px] font-mono font-black tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>ALERTA DE CHEFE SUPREMO</span>
                  </span>
                  <span className="text-xs sm:text-base font-display font-black text-white tracking-wide uppercase truncate">
                    {bossBanner.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-300 truncate">
                    {bossBanner.title}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Top Boss Health Bar */}
          {activeBoss && (
            <div className="absolute top-11 sm:top-14 left-1/2 -translate-x-1/2 z-30 w-full max-w-[270px] sm:max-w-md px-2 pointer-events-none animate-in fade-in duration-200">
              <div className={`px-2.5 py-1.5 rounded-lg border shadow-xl flex flex-col gap-1 ${
                gameMode === GameMode.ALIEN
                  ? 'bg-slate-950/90 border-cyan-500/50'
                  : 'bg-slate-950/90 border-red-500/50'
              }`}>
                <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {gameMode === GameMode.ALIEN ? (
                      <Orbit className="w-3 h-3 text-cyan-400 animate-spin-slow shrink-0" />
                    ) : (
                      <Skull className="w-3 h-3 text-red-500 animate-pulse shrink-0" />
                    )}
                    <span className="font-display font-black tracking-wider uppercase text-white truncate max-w-[130px] sm:max-w-[220px]">
                      {activeBoss.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono-numbers font-bold shrink-0">
                    <span className={gameMode === GameMode.ALIEN ? 'text-cyan-300' : 'text-red-300'}>
                      {Math.max(0, activeBoss.hp)} / {activeBoss.maxHp}
                    </span>
                    <span className="text-amber-400 ml-0.5">
                      {Math.round(Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100))}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ease-out ${
                      gameMode === GameMode.ALIEN
                        ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-fuchsia-500'
                        : 'bg-gradient-to-r from-amber-500 via-red-500 to-rose-600'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Top Header HUD - Compact & Zero-Blur for Max Mobile FPS */}
          <div className="w-full flex items-center justify-between gap-1.5 px-2 sm:px-4 pt-2 pb-1 pointer-events-auto">
            {/* LEFT: Minimal Vital Signs Capsule */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-white/10 shadow-md shrink-0">
              <span className="text-[9.5px] sm:text-[10px] font-mono font-black text-cyan-300 tracking-wider">
                LV.{player.level}
              </span>
              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[52px] sm:min-w-[100px]">
                {/* Health Bar */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isCriticalHp ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${hpPercentage}%` }}
                  />
                </div>
                {/* Shield Bar (if unlocked) */}
                {player.maxShield > 0 && (
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-150"
                      style={{ width: `${shieldPercentage}%` }}
                    />
                  </div>
                )}
              </div>
              <span
                className={`text-[9.5px] sm:text-[10px] font-mono-numbers font-bold ${
                  isCriticalHp ? 'text-red-400 animate-pulse' : 'text-slate-300'
                }`}
              >
                {player.hp}
              </span>
            </div>

            {/* CENTER: Floating Slim Wave & Mode Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10 shadow-md min-w-0">
              {gameMode === GameMode.ALIEN ? (
                <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/90 border border-cyan-500/40 px-1.5 py-0.5 rounded shrink-0">
                  <Atom className="w-2.5 h-2.5 text-cyan-400" />
                  <span className="hidden xs:inline sm:inline">ALIEN</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] font-mono font-bold text-red-400 bg-red-950/90 border border-red-500/40 px-1.5 py-0.5 rounded shrink-0">
                  <Biohazard className="w-2.5 h-2.5 text-red-400" />
                  <span className="hidden xs:inline sm:inline">ZUMBI</span>
                </div>
              )}
              <span className="text-[10px] sm:text-[11px] font-display font-black text-white tracking-wider uppercase whitespace-nowrap">
                O{wave.toString().padStart(2, '0')}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[9.5px] sm:text-[10px] font-mono-numbers text-slate-300 font-bold whitespace-nowrap">
                {zombiesRemaining > 0 ? (
                  <>
                    {zombiesRemaining}
                    <span className="hidden md:inline"> RESTANTES</span>
                  </>
                ) : (
                  'LIMPO'
                )}
              </span>
            </div>

            {/* RIGHT: Minimalist Score & Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-white/10 shadow-md">
                <span className="text-[11px] sm:text-sm font-mono-numbers font-bold text-amber-400 flex items-center gap-1 tracking-tight" title="Score / Dinheiro Ganho">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {player.score.toLocaleString()}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[9.5px] sm:text-[10px] font-mono-numbers font-bold text-rose-400 flex items-center gap-1">
                  <Skull className="w-2.5 h-2.5" /> {player.kills}
                </span>
              </div>

              {/* Minimal Buttons */}
              {onResetAll && (
                <button
                  onClick={() => handleButtonClick(() => setShowRebootModal(true))}
                  className="p-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-rose-400 hover:text-rose-300 hover:border-rose-500/40 active:scale-95 transition-all cursor-pointer shadow-md"
                  title="Reboot: Resetar Tudo"
                  aria-label="Reboot: Resetar Tudo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleButtonClick(onToggleSound)}
                className="p-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/40 active:scale-95 transition-all cursor-pointer shadow-md"
                title="Alternar Áudio"
                aria-label="Alternar Áudio"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                onClick={() => handleButtonClick(onPauseToggle)}
                className="p-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/40 active:scale-95 transition-all cursor-pointer shadow-md"
                title="Pausar Combate"
                aria-label="Pausar Combate"
              >
                {gameState === GameState.PAUSED ? (
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                ) : (
                  <Pause className="w-3.5 h-3.5 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* BOTTOM CENTER: Compact Active Powers, Warp Indicator & Weapon Strip */}
          <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-auto max-w-[60vw]">
            {((player.mythicSingularity || 0) > 0 ||
              (player.mythicSolarAura || 0) > 0 ||
              (player.mythicSplitShot || 0) > 0 ||
              (player.mythicVoidDrones || 0) > 0 ||
              (player.chainLightningLevel || 0) > 0 ||
              (player.gravityPulseLevel || 0) > 0) && (
              <div className="flex items-center flex-wrap justify-center gap-1.5 bg-slate-950/85 px-2 py-0.5 rounded border border-fuchsia-500/30 text-[8.5px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-slate-200 shadow-lg">
                {(player.mythicSingularity || 0) > 0 && (
                  <span className="text-cyan-300">✦ Lâminas×5</span>
                )}
                {(player.mythicSolarAura || 0) > 0 && (
                  <span className="text-amber-300">☀ Corona</span>
                )}
                {(player.mythicSplitShot || 0) > 0 && (
                  <span className="text-fuchsia-300">◈ Triplo</span>
                )}
                {(player.mythicVoidDrones || 0) > 0 && (
                  <span className="text-purple-300">❖ Drones×3</span>
                )}
                {(player.chainLightningLevel || 0) > 0 && (
                  <span className="text-sky-300">⚡ Arco</span>
                )}
                {(player.gravityPulseLevel || 0) > 0 && (
                  <span className="text-indigo-300">◎ Pulso</span>
                )}
              </div>
            )}

            {(player.currentWeapon === WeaponType.DESTRUCTOR ||
              player.currentWeapon === WeaponType.INTERCEPTOR ||
              player.currentWeapon === WeaponType.NAVE_REI) && destructorWarp && (
              <div className={`bg-slate-950/85 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border flex items-center gap-2 shadow-lg min-w-[165px] sm:min-w-[215px] ${
                player.currentWeapon === WeaponType.NAVE_REI ? 'border-red-500/45' : 'border-cyan-500/30'
              }`}>
                <span className={`text-[8.5px] sm:text-[9px] font-mono font-black uppercase tracking-wider whitespace-nowrap ${
                  destructorWarp.active
                    ? (player.currentWeapon === WeaponType.NAVE_REI ? 'text-red-400 animate-pulse' : 'text-fuchsia-300 animate-pulse')
                    : destructorWarp.chargeProgress > 0.02
                      ? (player.currentWeapon === WeaponType.NAVE_REI ? 'text-red-300' : 'text-cyan-300')
                      : 'text-slate-400'
                }`}>
                  {player.currentWeapon === WeaponType.NAVE_REI
                    ? (destructorWarp.active
                        ? 'FÚRIA ATIVA'
                        : destructorWarp.chargeProgress > 0.02
                          ? `FÚRIA ${Math.round(destructorWarp.chargeProgress * 100)}%`
                          : '[SHIFT] 6s · FÚRIA')
                    : (destructorWarp.active
                        ? 'WARP ATIVO'
                        : destructorWarp.chargeProgress > 0.02
                          ? `WARP ${Math.round(destructorWarp.chargeProgress * 100)}%`
                          : '[SHIFT] 3s · WARP')}
                </span>
                <div className="flex-1 h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-white/10 min-w-[44px]">
                  <div
                    className={`h-full transition-all duration-75 ${
                      player.currentWeapon === WeaponType.NAVE_REI
                        ? (destructorWarp.active
                            ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300'
                            : 'bg-gradient-to-r from-red-600 to-rose-400')
                        : (destructorWarp.active
                            ? 'bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-amber-300'
                            : 'bg-gradient-to-r from-cyan-500 to-sky-300')
                    }`}
                    style={{
                      width: `${Math.round(
                        (destructorWarp.active ? destructorWarp.remainingRatio : destructorWarp.chargeProgress) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {player.currentWeapon === WeaponType.IRON_MAN && (
              <button
                onClick={() => {
                  if (onToggleIronManMode) onToggleIronManMode();
                }}
                className={`bg-slate-950/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold transition-all shadow-lg cursor-pointer ${
                  ironManMode === 'LASER'
                    ? 'border-red-500/60 text-amber-200 hover:bg-red-950/60'
                    : 'border-cyan-400/60 text-cyan-200 hover:bg-cyan-950/60'
                }`}
                title="Pressione [Shift] ou [E] para alternar entre Repulsor e Laser"
              >
                {ironManMode === 'LASER' ? (
                  <Flame className="w-3 h-3 text-red-400" />
                ) : (
                  <Zap className="w-3 h-3 text-cyan-400" />
                )}
                <span className="uppercase tracking-wider">
                  {ironManMode === 'LASER' ? 'LASER' : 'REPULSOR'}
                </span>
                <span className="hidden sm:inline text-white/25">·</span>
                <span className="hidden sm:inline text-slate-300">[SHIFT/E]</span>
              </button>
            )}

            {player.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON && iceFireDragonHud && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {iceFireDragonHud.merged ? (
                  <div className="bg-slate-950/90 px-2.5 py-1 rounded-lg border border-purple-400/70 shadow-lg flex flex-col gap-0.5 min-w-[160px] sm:min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider">
                      <span className="text-fuchsia-300 flex items-center gap-1 animate-pulse">
                        <Crown className="w-3 h-3 text-fuchsia-300" />
                        MEGA DRAGÃO ROXO
                      </span>
                      <span className="text-purple-200">
                        {iceFireDragonHud.mergeTimer.toFixed(1)}s
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-400 to-pink-300 transition-all duration-75"
                        style={{
                          width: `${Math.round(
                            Math.max(0, Math.min(1, iceFireDragonHud.mergeTimer / Math.max(1, iceFireDragonHud.mergeDuration))) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (onSwitchIceFireDragon) onSwitchIceFireDragon();
                      }}
                      className={`bg-slate-950/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold transition-all shadow-lg cursor-pointer ${
                        iceFireDragonHud.activeDragon === 'FIRE'
                          ? 'border-orange-500/65 text-amber-200 hover:bg-orange-950/50'
                          : 'border-sky-400/65 text-sky-200 hover:bg-sky-950/50'
                      }`}
                      title="Pressione [Shift] para trocar entre Dragão de Fogo e Dragão de Gelo"
                    >
                      {iceFireDragonHud.activeDragon === 'FIRE' ? (
                        <Flame className="w-3 h-3 text-orange-400" />
                      ) : (
                        <Snowflake className="w-3 h-3 text-sky-400" />
                      )}
                      <span className="uppercase tracking-wider">
                        {iceFireDragonHud.activeDragon === 'FIRE' ? 'FOGO' : 'GELO'}
                      </span>
                      <span className="hidden sm:inline text-white/25">·</span>
                      <span className="hidden sm:inline text-slate-300">[SHIFT]</span>
                    </button>

                    <button
                      onClick={() => {
                        if (iceFireDragonHud.cooldown <= 0 && onTriggerIceFireMerge) {
                          onTriggerIceFireMerge();
                        }
                      }}
                      className={`bg-slate-950/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold transition-all shadow-lg ${
                        iceFireDragonHud.cooldown <= 0
                          ? 'border-purple-400/70 text-fuchsia-200 hover:bg-purple-950/60 cursor-pointer'
                          : 'border-white/10 text-slate-400 cursor-default'
                      }`}
                      title="Pressione [Q] para fundir Fogo + Gelo no Mega Dragão Roxo"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="uppercase tracking-wider">[Q] FUSÃO</span>
                      <span style={{ color: iceFireDragonHud.cooldown <= 0 ? '#e879f9' : '#94a3b8' }}>
                        {iceFireDragonHud.cooldown <= 0 ? 'PRONTA' : `${iceFireDragonHud.cooldown.toFixed(1)}s`}
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}

            {masterySkillHud?.available && (
              <button
                onClick={() => {
                  if (masterySkillHud.cooldown <= 0 && onTriggerMasterySkill) {
                    onTriggerMasterySkill();
                  }
                }}
                className={`bg-slate-950/85 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold transition-all shadow-lg ${
                  masterySkillHud.cooldown <= 0
                    ? 'border-amber-400/50 text-white hover:bg-slate-900 cursor-pointer'
                    : 'border-white/10 text-slate-400 cursor-default'
                }`}
                title="Pressione [Q] para usar habilidade de Maestria"
              >
                <Sparkles className="w-3 h-3" style={{ color: masterySkillHud.shipColor }} />
                <span className="uppercase tracking-wider">[Q] {masterySkillHud.name}</span>
                <span style={{ color: masterySkillHud.cooldown <= 0 ? '#34d399' : '#94a3b8' }}>
                  {masterySkillHud.cooldown <= 0 ? 'PRONTA' : `${masterySkillHud.cooldown.toFixed(1)}s`}
                </span>
              </button>
            )}

            <div className="bg-slate-950/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-lg">
              <CurrentIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: currentWeaponStats.color }} />
              <span className="text-[10px] sm:text-[11px] font-display font-black uppercase tracking-wider text-white truncate max-w-[115px] sm:max-w-[200px]">
                {currentWeaponStats.name}
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                ∞
              </span>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 2. MINIMALIST GAME MENU (GameState.MENU) - SPLIT LANDSCAPE */}
      {/* ========================================================= */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 pointer-events-auto bg-slate-950 flex flex-col justify-between text-white overflow-y-auto">
          {/* Ambient Cinematic Backdrop */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <img
              src="/src/assets/images/menu_apocalypse_backdrop_1794414619588.jpg"
              alt="Quarantine Outpost"
              className="w-full h-full object-cover object-center filter brightness-[0.18] contrast-115 pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/90 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_50%,rgba(6,182,212,0.10),transparent_65%)] pointer-events-none" />
          </div>

          {/* MENU TOP BAR: Compact Header */}
          <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-8 py-2.5 sm:py-3.5 border-b border-white/5 shrink-0">
            {/* Zone 1: Brand + Prestige Tier */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-display font-black tracking-[0.14em] uppercase text-white whitespace-nowrap">
                ZOMBIE SHOOTER 2D
              </span>
              {prestigeLevel > 0 && (
                <>
                  <span className="text-white/20">·</span>
                  <button
                    onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                    className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer shrink-0"
                  >
                    <Crown className="w-3 h-3" />
                    <span>P{prestigeLevel}</span>
                  </button>
                </>
              )}
            </div>

            {/* Zone 2: Unboxed Wallet (Credits · Tokens) */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono shrink-0">
              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Abrir Armaria"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono-numbers font-bold">{coins.toLocaleString()}</span>
              </button>
              <span className="text-white/20">·</span>
              <button
                onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Abrir Prestígio & Loja de Tokens"
              >
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono-numbers font-bold">{tokens}</span>
              </button>
            </div>

            {/* Zone 3: Minimal Utility Icons */}
            <div className="flex items-center gap-1 shrink-0">
              {onResetAll && (
                <button
                  onClick={() => handleButtonClick(() => setShowRebootModal(true))}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Reboot (Resetar Progresso)"
                  aria-label="Reboot"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleButtonClick(() => setShowControlsModal(true))}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
                title="Guia de Controles"
                aria-label="Controles"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleButtonClick(onToggleSound)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
                aria-label="Alternar Som"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </header>

          {/* MENU CENTERPIECE: LEFT = MENU/BRAND/WEAPON/RECORDS · RIGHT = OPTIONS & ACTIONS */}
          <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-3 landscape:py-2 flex items-center justify-center">
            <div className="w-full grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 landscape:gap-6 md:gap-8 items-center">
              {/* LEFT COLUMN: Brand Identity, Equipped Weapon & High Scores */}
              <div className="landscape:col-span-6 md:col-span-6 flex flex-col items-center landscape:items-start md:items-start text-center landscape:text-left md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300 mb-2">
                  <span>OPERATIVOS 360°</span>
                  <span className="text-white/25">·</span>
                  <span>MUNIÇÃO ∞</span>
                </div>

                <h1 className="text-4xl landscape:text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase leading-none">
                  ZOMBIE{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">
                    SHOOTER
                  </span>
                </h1>
                <p className="mt-1.5 landscape:mt-1.5 sm:mt-2.5 text-[11px] sm:text-xs text-slate-400 font-mono tracking-wide max-w-sm">
                  Combate 360° · Naves, Dragões & Arsenal · Hordas Implacáveis
                </p>

                {/* Equipped Weapon Glance Card */}
                <div className="mt-3 sm:mt-5 w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-slate-900/90 shrink-0"
                    >
                      <CurrentIcon className="w-4 h-4" style={{ color: currentWeaponStats.color }} />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 leading-none">
                        Arma Equipada
                      </span>
                      <span className="text-xs sm:text-sm font-display font-bold text-white truncate mt-0.5">
                        {currentWeaponStats.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer transition-colors shrink-0"
                  >
                    Trocar
                  </button>
                </div>

                {/* High Scores Summary */}
                <div className="mt-2.5 sm:mt-3.5 w-full max-w-sm grid grid-cols-2 gap-2 text-left">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-red-300 flex items-center gap-1">
                      <Biohazard className="w-3 h-3 text-red-400" /> Zumbi
                    </span>
                    <span className="text-xs font-mono-numbers font-bold text-white">
                      {highScoreZombie.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                      <Atom className="w-3 h-3 text-cyan-400" /> Alien
                    </span>
                    <span className="text-xs font-mono-numbers font-bold text-white">
                      {highScoreAlien.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Mode Switcher, Play CTA & 2x2 Options Grid */}
              <div className="landscape:col-span-6 md:col-span-6 w-full max-w-md mx-auto flex flex-col gap-2.5">
                {/* Segmented Mode Switcher */}
                <div>
                  <div className="p-1 bg-white/[0.03] border border-white/10 rounded-xl grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (onChangeMode) onChangeMode(GameMode.ZOMBIE);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        gameMode === GameMode.ZOMBIE
                          ? 'bg-red-500/20 text-red-100 border border-red-500/40'
                          : 'text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <Biohazard className="w-3.5 h-3.5 text-red-400" />
                      <span>Zumbi</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        if (onChangeMode) onChangeMode(GameMode.ALIEN);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        gameMode === GameMode.ALIEN
                          ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <Atom className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Alien</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-1.5 pt-1.5 text-[10.5px] font-mono text-slate-400">
                    <span>
                      {gameMode === GameMode.ZOMBIE ? 'Infectados & Titãs' : 'Frotas Alien & Overlords'}
                    </span>
                    <span className="font-mono-numbers text-slate-200">
                      Recorde {(gameMode === GameMode.ALIEN ? highScoreAlien : highScoreZombie).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary Dominant PLAY CTA */}
                <button
                  id="btn-start-game"
                  onClick={() => handleButtonClick(onStart)}
                  className={`group w-full py-3 landscape:py-2.5 sm:py-3.5 px-6 rounded-xl font-display font-black tracking-wider uppercase text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 shadow-lg ${
                    gameMode === GameMode.ALIEN
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.28)]'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_24px_rgba(225,29,72,0.28)]'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>JOGAR {gameMode === GameMode.ALIEN ? 'ALIEN' : 'ZUMBI'}</span>
                </button>

                {/* Streamlined 2x2 Options Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="py-2.5 landscape:py-2 sm:py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-200 text-xs font-display font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                    <span>Armaria</span>
                  </button>

                  <button
                    onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                    className="py-2.5 landscape:py-2 sm:py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-500/40 text-slate-200 text-xs font-display font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Prestígio</span>
                  </button>

                  <button
                    onClick={() => onOpenMastery && handleButtonClick(onOpenMastery)}
                    className="py-2.5 landscape:py-2 sm:py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-cyan-500/40 text-slate-200 text-xs font-display font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Maestria</span>
                  </button>

                  <button
                    onClick={() => handleButtonClick(onOpenModeSelect)}
                    className="py-2.5 landscape:py-2 sm:py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-200 text-xs font-display font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                    <span>Modos</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* MENU FOOTER: Quiet & Compact */}
          <footer className="relative z-10 px-4 sm:px-8 py-2 sm:py-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 shrink-0">
            <div className="flex items-center gap-2">
              <span>Modo Mobile: Touch Duplo</span>
              {prestigeLevel > 0 && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-amber-400/90">Prestígio {prestigeLevel}/10</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>WASD + Mouse</span>
              <span className="text-white/20">·</span>
              <span>Shift: Warp/Trocar</span>
              <span className="text-white/20">·</span>
              <span>Q: Maestria/Fusão</span>
            </div>
          </footer>

          {/* CONTROLS GUIDE MODAL */}
          {showControlsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
              <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
                <button
                  onClick={() => setShowControlsModal(false)}
                  className="sticky float-right top-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5 mb-3">
                  <HelpCircle className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base sm:text-lg font-display font-bold uppercase text-white">
                    GUIA DE CONTROLES
                  </h2>
                </div>

                <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 gap-3 text-left">
                  <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                      COMPUTADOR / DESKTOP
                    </span>
                    <ul className="text-[11px] sm:text-xs text-slate-300 flex flex-col gap-1.5 font-mono">
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Mover:</span>
                        <span className="font-bold text-white">[W] [A] [S] [D]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Mirar & Disparar:</span>
                        <span className="font-bold text-cyan-400">Mouse + Clique</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Warp / Fúria:</span>
                        <span className="font-bold text-fuchsia-300">Segurar [SHIFT]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Habilidade Maestria:</span>
                        <span className="font-bold text-amber-300">Tecla [Q]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Homem de Ferro:</span>
                        <span className="font-bold text-red-300">[SHIFT] / [E]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Dragões Fogo/Gelo:</span>
                        <span className="font-bold text-purple-300">[SHIFT] / [Q]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Pausar:</span>
                        <span className="font-bold text-white">[P] ou [Espaço]</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3">
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-2">
                      MOBILE / TOUCHSCREEN
                    </span>
                    <ul className="text-[11px] sm:text-xs text-slate-300 flex flex-col gap-1.5 font-mono">
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Joystick Esq:</span>
                        <span className="font-bold text-cyan-300">Mover</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Joystick Dir:</span>
                        <span className="font-bold text-rose-400">Mirar & Atirar</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Botões Dir:</span>
                        <span className="font-bold text-amber-300">Warp / Trocar / Fusão</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setShowControlsModal(false)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
                >
                  FECHAR
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REBOOT CONFIRMATION MODAL */}
      {showRebootModal && onResetAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-sm w-full max-h-[92dvh] overflow-y-auto p-5 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-2.5 text-rose-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-display font-black uppercase text-white mb-1">
              REBOOT COMPLETO
            </h3>
            <p className="text-xs font-mono text-slate-400 leading-relaxed mb-4">
              Deseja apagar permanentemente todos os créditos, armas, upgrades, prestígios, tokens, maestrias e recordes?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowRebootModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowRebootModal(false);
                  handleButtonClick(onResetAll);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-black uppercase tracking-wider cursor-pointer"
              >
                Confirmar Reboot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TACTICAL PAUSE OVERLAY (GameState.PAUSED)              */}
      {/* ========================================================= */}
      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 pointer-events-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none z-50">
          <div className="w-full max-w-4xl my-auto grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* LEFT: Status & Telemetry */}
            <div className="landscape:col-span-6 md:col-span-6 flex flex-col items-center landscape:items-start md:items-start text-center landscape:text-left md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400">
                  <Pause className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] font-mono font-bold">
                  {gameMode === GameMode.ALIEN ? (
                    <>
                      <Atom className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300">MODO ALIEN</span>
                    </>
                  ) : (
                    <>
                      <Biohazard className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-red-300">MODO ZUMBI</span>
                    </>
                  )}
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase mb-1">
                OPERAÇÃO SUSPENSA
              </h2>
              <p className="text-slate-400 text-[11px] font-mono uppercase tracking-widest mb-4">
                O combate está pausado temporariamente
              </p>

              <div className="grid grid-cols-2 gap-2.5 w-full max-w-md bg-slate-900/85 border border-white/10 rounded-xl p-3">
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Onda Atual</span>
                  <span className="text-sm sm:text-base font-display font-black text-white">ONDA {wave}</span>
                </div>
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Score (Créditos)</span>
                  <span className="text-sm sm:text-base font-mono-numbers font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {player.score.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Abates</span>
                  <span className="text-sm sm:text-base font-mono-numbers font-bold text-rose-400">{player.kills}</span>
                </div>
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Nível</span>
                  <span className="text-sm sm:text-base font-display font-black text-amber-400">LVL {player.level}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Action Options */}
            <div className="landscape:col-span-6 md:col-span-6 flex flex-col gap-2.5 w-full max-w-sm mx-auto">
              <button
                id="btn-resume-game"
                onClick={() => handleButtonClick(onPauseToggle)}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-display font-black tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" /> RETOMAR COMBATE
              </button>

              <button
                id="btn-restart-paused"
                onClick={() => handleButtonClick(onRestart)}
                className="py-2.5 px-5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 hover:text-white hover:bg-slate-800 font-display font-bold tracking-wider uppercase text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> REINICIAR PARTIDA
              </button>

              <button
                onClick={() => handleButtonClick(onOpenModeSelect)}
                className="py-2.5 px-5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-slate-800 font-display font-bold tracking-wider uppercase text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Crosshair className="w-3.5 h-3.5" /> SELECIONAR OUTRO MODO
              </button>

              <button
                onClick={() => handleButtonClick(onGoToMenu)}
                className="py-2.5 px-5 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                VOLTAR AO MENU PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GAME OVER SCREEN (GameState.GAME_OVER) - SPLIT LANDSCAPE */}
      {/* ========================================================= */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 pointer-events-auto bg-slate-950 flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto z-50">
          {/* Ambient apocalyptic grid */}
          <div
            className="fixed inset-0 z-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative z-10 w-full max-w-4xl my-auto grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* LEFT: Defeat Status & Debrief Metrics */}
            <div className="landscape:col-span-6 md:col-span-6 flex flex-col items-center landscape:items-start md:items-start text-center landscape:text-left md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <Skull className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-[10px] sm:text-xs font-mono font-bold">
                  {gameMode === GameMode.ALIEN ? (
                    <>
                      <Atom className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300">MODO ALIEN FINALIZADO</span>
                    </>
                  ) : (
                    <>
                      <Biohazard className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-red-300">MODO ZUMBI FINALIZADO</span>
                    </>
                  )}
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-rose-600 tracking-tight uppercase mb-1">
                SINAIS VITAIS PERDIDOS
              </h2>
              <p className="text-slate-400 font-mono text-[10.5px] sm:text-xs tracking-wider uppercase mb-3">
                {gameMode === GameMode.ALIEN
                  ? 'Operativo neutralizado pela ofensiva alienígena'
                  : 'O sobrevivente sucumbiu à horda de infectados'}
              </p>

              {/* After-Action Debrief (AAR) Card */}
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-md bg-slate-900/85 border border-white/10 rounded-xl p-3 shadow-2xl">
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Onda Final</span>
                  <span className="text-base sm:text-lg font-display font-black text-white">ONDA {wave}</span>
                </div>

                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Score (Créditos)</span>
                  <span className="text-base sm:text-lg font-mono-numbers font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {player.score.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Eliminados</span>
                  <span className="text-base sm:text-lg font-mono-numbers font-bold text-rose-400 flex items-center gap-1">
                    <Skull className="w-3.5 h-3.5" /> {player.kills}
                  </span>
                </div>

                <div className="flex flex-col items-center landscape:items-start md:items-start p-2 bg-slate-950/60 rounded-lg border border-white/5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Nível Atingido</span>
                  <span className="text-base sm:text-lg font-display font-black text-amber-400">LVL {player.level}</span>
                </div>
              </div>

              {/* New High Score Banner */}
              {player.score >= (gameMode === GameMode.ALIEN ? highScoreAlien : highScoreZombie) && player.score > 0 && (
                <div className="mt-2.5 text-amber-300 text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 py-1.5 px-3.5 rounded-lg animate-pulse flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>NOVO RECORDE ({gameMode === GameMode.ALIEN ? 'ALIEN' : 'ZUMBI'})!</span>
                </div>
              )}
            </div>

            {/* RIGHT: Game Over Actions */}
            <div className="landscape:col-span-6 md:col-span-6 flex flex-col gap-2.5 w-full max-w-sm mx-auto">
              <button
                id="btn-try-again"
                onClick={() => handleButtonClick(onRestart)}
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-display font-black tracking-wider uppercase text-sm shadow-[0_0_24px_rgba(244,63,94,0.35)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> TENTAR NOVAMENTE
              </button>

              <button
                onClick={() => handleButtonClick(onOpenModeSelect)}
                className="py-2.5 px-6 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-slate-800 font-display font-bold tracking-wider uppercase text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> TROCAR DE MODO
              </button>

              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="py-2.5 px-6 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 font-display font-bold tracking-wider uppercase text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> ARMARIA & UPGRADES
              </button>

              <button
                id="btn-back-to-menu"
                onClick={() => handleButtonClick(onGoToMenu)}
                className="py-2.5 px-6 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 font-mono text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                VOLTAR AO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
