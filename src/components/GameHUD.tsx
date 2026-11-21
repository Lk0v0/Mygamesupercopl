import React, { useState, useEffect, useRef } from 'react';
import { ActiveBossInfo, GameState, GraphicsQuality, Player, WeaponType } from '../types';
import {
  Skull,
  RefreshCw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Heart,
  Crosshair,
  Zap,
  Activity,
  Coins,
  ShoppingCart,
  HelpCircle,
  X,
  Target,
  Award,
  AlertTriangle,
  Crown,
  Gem,
  Gamepad2,
  Eye,
  Trophy,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  ChevronRight,
  Lock,
  Check,
  Monitor,
  Flame,
  Rocket,
} from 'lucide-react';
import { sound } from '../sound';
import { DayPhaseId } from './EnvironmentLighting';
import { GRAPHICS_PRESET_CONFIGS } from './ForestWorld3D';
import {
  GamepadDiagnosticInfo,
  GamepadProfileMode,
  GamepadSettings,
  RightStickAxesMode,
  getGamepadDiagnosticInfo,
  getGamepadSettings,
  saveGamepadSettings,
} from '../gamepad';

interface GameHUDProps {
  gameState: GameState;
  player: Player;
  wave: number;
  zombiesRemaining: number;
  highScoreZombie: number;
  activeBoss?: ActiveBossInfo | null;
  dayNight?: {
    phase: DayPhaseId;
    phaseLabel: string;
    clockText: string;
  };
  onStart: () => void;
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
  gamepadConnected?: boolean;
  visionConeEnabled?: boolean;
  onToggleVisionCone?: () => void;
  graphicsQuality?: GraphicsQuality;
  onChangeGraphicsQuality?: (quality: GraphicsQuality) => void;
}

const GRAPHICS_QUALITY_ORDER: GraphicsQuality[] = ['ULTRA_LOW', 'LOW', 'MEDIUM', 'HIGH'];

const getWeaponIcon = (wt: WeaponType) => {
  switch (wt) {
    case WeaponType.GLOCK_19:
      return Crosshair;
    case WeaponType.MP5_A5:
      return Zap;
    case WeaponType.BENELLI_M4:
      return Zap;
    case WeaponType.FLAMETHROWER:
      return Flame;
    case WeaponType.SCAR_L:
      return Target;
    case WeaponType.AWM_SNIPER:
      return Target;
    case WeaponType.RPG_7:
      return Rocket;
    default:
      return Crosshair;
  }
};

const getWeaponShortLabel = (wt: WeaponType): string => {
  switch (wt) {
    case WeaponType.GLOCK_19:
      return 'Glock';
    case WeaponType.MP5_A5:
      return 'MP5A5';
    case WeaponType.BENELLI_M4:
      return 'Benelli';
    case WeaponType.FLAMETHROWER:
      return 'Chamas';
    case WeaponType.SCAR_L:
      return 'SCAR-L';
    case WeaponType.AWM_SNIPER:
      return 'AWM';
    case WeaponType.RPG_7:
      return 'RPG-7';
  }
};

const DayPhaseIcon: React.FC<{ phase: DayPhaseId; className?: string }> = ({ phase, className = 'w-3.5 h-3.5' }) => {
  if (phase === 'DAWN') return <Sunrise className={`${className} text-amber-300`} />;
  if (phase === 'DAY') return <Sun className={`${className} text-yellow-300`} />;
  if (phase === 'DUSK') return <Sunset className={`${className} text-orange-400`} />;
  return <Moon className={`${className} text-sky-300`} />;
};

export const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  player,
  wave,
  zombiesRemaining,
  highScoreZombie,
  activeBoss,
  dayNight,
  onStart,
  onPauseToggle,
  onRestart,
  onGoToMenu,
  onSelectWeapon,
  soundEnabled,
  onToggleSound,
  coins,
  onOpenStore,
  onResetAll,
  prestigeLevel = 0,
  tokens = 0,
  onOpenPrestige,
  gamepadConnected = false,
  visionConeEnabled = false,
  onToggleVisionCone,
  graphicsQuality = 'MEDIUM',
  onChangeGraphicsQuality,
}) => {
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showRebootModal, setShowRebootModal] = useState(false);
  const [waveAlert, setWaveAlert] = useState<number | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [gamepadCfg, setGamepadCfg] = useState<GamepadSettings>(() => getGamepadSettings());
  const [gamepadDiag, setGamepadDiag] = useState<GamepadDiagnosticInfo | null>(null);
  const prevWaveRef = useRef(wave);

  useEffect(() => {
    if (!showControlsModal) return;
    const poll = () => setGamepadDiag(getGamepadDiagnosticInfo());
    poll();
    const id = window.setInterval(poll, 80);
    return () => window.clearInterval(id);
  }, [showControlsModal]);

  const updateGamepadCfg = (patch: Partial<GamepadSettings>) => {
    const next = saveGamepadSettings(patch);
    setGamepadCfg({ ...next });
  };

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

  const xpPercentage = Math.min(100, (player.xp / Math.max(1, player.xpNeeded)) * 100);
  const hpPercentage = Math.min(100, Math.max(0, (player.hp / Math.max(1, player.maxHp)) * 100));
  const isCriticalHp = hpPercentage <= 30;
  const isExtremeHp = hpPercentage <= 15;
  const shieldPercentage =
    player.maxShield > 0 ? Math.min(100, Math.max(0, (player.shield / player.maxShield) * 100)) : 0;

  const currentWeaponStats = player.weapons[player.currentWeapon] || {
    name: 'Glock 19 Gen5 MOS',
    damage: 15,
    fireRate: 5.8,
    piercing: 1,
    currentAmmo: Infinity,
    ammoCapacity: Infinity,
    color: '#fbbf24',
  };
  const CurrentIcon = getWeaponIcon(player.currentWeapon);
  const unlockedList = player.unlockedWeapons || [WeaponType.GLOCK_19];

  const handleButtonClick = (action: () => void) => {
    sound.playClick();
    action();
  };

  const hasMythicOrPassivePowers =
    (player.mythicSingularity || 0) > 0 ||
    (player.mythicSolarAura || 0) > 0 ||
    (player.mythicSplitShot || 0) > 0 ||
    (player.mythicVoidDrones || 0) > 0 ||
    (player.chainLightningLevel || 0) > 0 ||
    (player.gravityPulseLevel || 0) > 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-40 select-none overflow-hidden">
      {/* ========================================================= */}
      {/* 1. ACTIVE COMBAT HUD (Widescreen-First + Portrait Clean)  */}
      {/* ========================================================= */}
      {(gameState === GameState.PLAYING ||
        gameState === GameState.PAUSED ||
        gameState === GameState.LEVEL_UP) && (
        <>
          {/* Full-width Top XP Hairline */}
          <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
            <div className="w-full h-[2.5px] bg-slate-950/75 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-300 ease-out"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Low Health Edge Vignette */}
          {isCriticalHp && gameState === GameState.PLAYING && (
            <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isExtremeHp
                    ? 'bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(153,27,27,0.42)_65%,rgba(69,10,10,0.82)_100%)]'
                    : 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(185,28,28,0.24)_72%,rgba(127,29,29,0.58)_100%)]'
                }`}
              />
            </div>
          )}

          {/* TOP HUD BAR: Compact across portrait & spacious across widescreen, strictly under y=58px so canvas Radar at top-right never overlaps */}
          <header className="w-full pt-[max(0.4rem,env(safe-area-inset-top))] px-2.5 sm:px-5 px-safe flex items-start justify-between gap-2 pointer-events-auto z-40">
            {/* LEFT CLUSTER: Operator Vitals */}
            <div className="bg-[#060d14]/82 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-2 sm:gap-3 shadow-lg shrink-0">
              <div className="flex flex-col items-start">
                <span className="text-[10px] sm:text-xs font-mono-numbers font-bold text-cyan-300 tracking-wider leading-none">
                  NV.{player.level}
                </span>
                <span className="hidden md:block text-[9px] font-mono text-slate-400 uppercase mt-0.5 leading-none">
                  Operador
                </span>
              </div>

              <div className="flex flex-col gap-1 w-16 sm:w-28 lg:w-36">
                <div className="w-full h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isCriticalHp ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${hpPercentage}%` }}
                  />
                </div>
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
                className={`text-[11px] sm:text-xs font-mono-numbers font-bold tabular-nums leading-none ${
                  isCriticalHp ? 'text-rose-400' : 'text-slate-100'
                }`}
              >
                {player.hp}
                <span className="hidden lg:inline text-slate-400 font-normal">/{player.maxHp}</span>
              </span>
            </div>

            {/* CENTER CLUSTER: Wave, Hostiles & Solar/Lunar 24h Clock (Always visible in portrait & widescreen) */}
            <div className="bg-[#060d14]/82 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2.5 shadow-lg min-w-0">
              <span className="text-[11px] sm:text-xs font-display font-bold text-white tracking-wider uppercase whitespace-nowrap tabular-nums">
                <span className="sm:hidden">O{wave.toString().padStart(2, '0')}</span>
                <span className="hidden sm:inline">ONDA {wave.toString().padStart(2, '0')}</span>
              </span>

              <span className="text-white/20" aria-hidden="true">·</span>

              <span className="text-[11px] sm:text-xs font-mono-numbers text-slate-200 font-semibold whitespace-nowrap tabular-nums">
                {zombiesRemaining > 0 ? (
                  <>
                    {zombiesRemaining}
                    <span className="hidden md:inline text-slate-400 font-normal"> REST.</span>
                  </>
                ) : (
                  <span className="text-emerald-300">LIMPO</span>
                )}
              </span>

              {dayNight && (
                <>
                  <span className="text-white/20" aria-hidden="true">·</span>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono-numbers font-semibold whitespace-nowrap tabular-nums text-amber-200"
                    title={`${dayNight.phaseLabel} — Ciclo Solar/Lunar`}
                  >
                    <DayPhaseIcon phase={dayNight.phase} className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>{dayNight.clockText}</span>
                    <span className="hidden lg:inline text-slate-400 font-normal">{dayNight.phaseLabel}</span>
                  </span>
                </>
              )}
            </div>

            {/* RIGHT CLUSTER: Score, Kills & Quick Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="bg-[#060d14]/82 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-2 shadow-lg tabular-nums">
                <span
                  className="text-[11px] sm:text-sm font-mono-numbers font-bold text-amber-300 flex items-center gap-1"
                  title="Score / Créditos"
                >
                  <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span>{player.score.toLocaleString()}</span>
                </span>
                <span className="hidden xs:inline text-white/20" aria-hidden="true">·</span>
                <span className="hidden xs:flex text-[10px] sm:text-xs font-mono-numbers font-bold text-rose-400 items-center gap-1">
                  <Skull className="w-3 h-3 shrink-0" />
                  <span>{player.kills}</span>
                </span>
              </div>

              <button
                onClick={() => handleButtonClick(onToggleSound)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#060d14]/82 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400/50 active:scale-95 transition-all cursor-pointer shadow-lg flex items-center justify-center"
                title="Alternar Áudio"
                aria-label="Alternar Áudio"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <button
                onClick={() => handleButtonClick(onPauseToggle)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#060d14]/82 backdrop-blur-md border border-white/10 text-slate-200 hover:text-white hover:border-amber-400/50 active:scale-95 transition-all cursor-pointer shadow-lg flex items-center justify-center"
                title="Pausar Combate"
                aria-label="Pausar Combate"
              >
                {gameState === GameState.PAUSED ? (
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
            </div>
          </header>

          {/* UNIFIED NON-OVERLAPPING TOP-CENTER EVENT STACK (Critical HP / Wave Alert / Boss Bar) */}
          <div className="absolute top-[52px] sm:top-[64px] left-1/2 -translate-x-1/2 z-30 w-full max-w-[300px] sm:max-w-md px-3 flex flex-col items-center gap-1.5 pointer-events-none">
            {isCriticalHp && gameState === GameState.PLAYING && (
              <div
                className={`w-auto px-3 py-1 rounded-lg border backdrop-blur-md flex items-center gap-2 shadow-lg ${
                  isExtremeHp
                    ? 'bg-rose-950/92 border-rose-500/80 text-rose-100'
                    : 'bg-rose-950/85 border-rose-500/50 text-rose-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono-numbers font-bold uppercase tracking-wider whitespace-nowrap">
                  {isExtremeHp ? 'TRAUMA SEVERO' : 'HP CRÍTICO'} · {Math.round(130 + (1 - hpPercentage / 30) * 55)} BPM
                </span>
                <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              </div>
            )}

            {waveAlert && (
              <div className="bg-[#060d14]/90 backdrop-blur-md border border-amber-400/50 px-4 py-1 rounded-lg shadow-lg flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-display font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  Onda {waveAlert} Iniciada
                </span>
              </div>
            )}

            {activeBoss && (
              <div className="w-full px-3 py-2 rounded-xl border border-rose-500/50 bg-[#060d14]/90 backdrop-blur-md shadow-xl flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Skull className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-display font-bold tracking-wider uppercase text-white truncate">
                      {activeBoss.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono-numbers font-bold shrink-0 tabular-nums">
                    <span className="text-rose-300">
                      {Math.max(0, activeBoss.hp)}/{activeBoss.maxHp}
                    </span>
                    <span className="text-amber-400">
                      {Math.round(Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100))}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-150 ease-out bg-gradient-to-r from-amber-400 via-rose-500 to-red-600"
                    style={{
                      width: `${Math.max(0, Math.min(100, (activeBoss.hp / Math.max(1, activeBoss.maxHp)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM CENTER DOCK: Active Powers + Weapon Quick-Switch + Equipped Weapon Readout */}
          <div className="w-full pb-[max(0.5rem,env(safe-area-inset-bottom))] px-2 sm:px-5 flex flex-col items-center gap-1.5 z-30 pointer-events-none">
            {hasMythicOrPassivePowers && (
              <div className="bg-[#060d14]/82 backdrop-blur-md border border-fuchsia-400/25 px-2.5 py-0.5 rounded-lg flex items-center flex-wrap justify-center gap-x-2.5 gap-y-0.5 text-[9.5px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-200 max-w-[92vw]">
                {(player.mythicSingularity || 0) > 0 && <span className="text-cyan-300">✦ Lâminas×5</span>}
                {(player.mythicSolarAura || 0) > 0 && <span className="text-amber-300">☀ Corona</span>}
                {(player.mythicSplitShot || 0) > 0 && <span className="text-fuchsia-300">◈ Triplo</span>}
                {(player.mythicVoidDrones || 0) > 0 && <span className="text-purple-300">❖ Drones×3</span>}
                {(player.chainLightningLevel || 0) > 0 && <span className="text-sky-300">⚡ Arco</span>}
                {(player.gravityPulseLevel || 0) > 0 && <span className="text-indigo-300">◎ Pulso</span>}
              </div>
            )}

            <div className="pointer-events-auto flex flex-col items-center gap-1 max-w-[calc(100vw-1rem)]">
              {unlockedList.length > 1 && onSelectWeapon && (
                <div className="bg-[#060d14]/85 backdrop-blur-md border border-white/10 p-1 rounded-xl flex items-center gap-1 shadow-lg max-w-[94vw] overflow-x-auto hud-scroll">
                  {unlockedList.map((wt, idx) => {
                    const isSel = player.currentWeapon === wt;
                    const shortLabel = getWeaponShortLabel(wt);
                    return (
                      <button
                        key={wt}
                        onClick={() => handleButtonClick(() => onSelectWeapon(wt))}
                        className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0 ${
                          isSel
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="opacity-70">{idx + 1}</span>
                        <span>{shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="bg-[#060d14]/82 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg flex items-center gap-2 shadow-md">
                <CurrentIcon className="w-3.5 h-3.5 shrink-0" style={{ color: currentWeaponStats.color }} />
                <span className="text-[11px] sm:text-xs font-display font-bold uppercase tracking-wider text-white truncate max-w-[170px] sm:max-w-[260px]">
                  {currentWeaponStats.name}
                </span>
                <span className="text-white/20" aria-hidden="true">·</span>
                <span className="text-[11px] font-mono-numbers font-bold text-cyan-300">∞</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 2. WIDESCREEN-FIRST + PORTRAIT-CLEAN MAIN MENU            */}
      {/* ========================================================= */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 pointer-events-auto bg-[#050a0f] flex flex-col justify-between text-slate-100 overflow-y-auto hud-scroll">
          {/* Full-Bleed Atmospheric Island & Ocean Key Art + Directional Scrims */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {!heroImgFailed ? (
              <img
                src="/src/assets/images/island_coast_hero_1795271172173.jpg"
                alt="Ilha Tropical e Oceano ao Entardecer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover object-right sm:object-center scale-[1.02] brightness-[0.74] contrast-[1.06] pointer-events-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_75%_40%,rgba(245,158,11,0.22),rgba(12,48,62,0.88)_52%,#050a0f_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050a0f]/95 via-[#050a0f]/75 to-[#050a0f]/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a0f] via-transparent to-[#050a0f]/75" />
          </div>

          {/* 3-ZONE TOP HEADER */}
          <header className="relative z-10 w-full max-w-[1560px] mx-auto pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 px-4 sm:px-8 lg:px-12 border-b border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-baseline gap-2.5 min-w-0">
              <span className="text-base sm:text-xl font-display font-bold tracking-[0.12em] uppercase text-white whitespace-nowrap">
                Zombie Shooter
              </span>
              <span className="hidden xs:inline text-[11px] font-mono text-amber-300/90 uppercase tracking-widest whitespace-nowrap">
                Ilha 3D
              </span>
            </div>

            {/* Zone 2: Clean Desktop / Widescreen Nav Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-200">
              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="min-h-[44px] px-1 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Armaria
              </button>
              <button
                onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                className="min-h-[44px] px-1 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Prestígio{prestigeLevel > 0 ? ` · P${prestigeLevel}` : ''}
              </button>
              <button
                onClick={() => handleButtonClick(() => setShowControlsModal(true))}
                className="min-h-[44px] px-1 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                Controles
              </button>
            </nav>

            {/* Zone 3: Wallet & Quick Utilities */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="min-h-[44px] px-2 flex items-center gap-1.5 text-xs sm:text-sm font-mono-numbers font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap"
                title="Créditos disponíveis"
              >
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{coins.toLocaleString()}</span>
              </button>

              <button
                onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                className="hidden sm:flex min-h-[44px] px-2 items-center gap-1.5 text-xs sm:text-sm font-mono-numbers font-bold text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                title="Tokens de Prestígio"
              >
                <Gem className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{tokens}</span>
              </button>

              {gamepadConnected && (
                <button
                  onClick={() => handleButtonClick(() => setShowControlsModal(true))}
                  className="w-11 h-11 rounded-xl text-emerald-300 hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
                  title="Controle Conectado"
                  aria-label="Controle Conectado"
                >
                  <Gamepad2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleButtonClick(onToggleSound)}
                className="w-11 h-11 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
                title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
                aria-label="Alternar Áudio"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {onResetAll && (
                <button
                  onClick={() => handleButtonClick(() => setShowRebootModal(true))}
                  className="w-11 h-11 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
                  title="Resetar Progresso"
                  aria-label="Resetar Progresso"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>

          {/* CENTER STAGE: Balanced Widescreen 12-Col Grid & Crisp Portrait Stack */}
          <main className="relative z-10 flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 py-5 sm:py-6 lg:py-8 flex flex-col justify-center">
            <div className="w-full grid grid-cols-1 landscape:md:grid-cols-12 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
              {/* LEFT COLUMN: Editorial Hero + Primary CTA + Telemetry Strip */}
              <div className="landscape:md:col-span-7 lg:col-span-7 flex flex-col items-start text-left">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-slate-300 tracking-wide mb-3">
                  <span className="text-emerald-400 font-bold uppercase">Modo Zumbi</span>
                  <span className="text-white/25" aria-hidden="true">·</span>
                  <span>Ilha & Oceano 3D</span>
                  <span className="text-white/25" aria-hidden="true">·</span>
                  <span>Ciclo Solar 24h</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[4.25rem] xl:text-[4.75rem] font-display font-bold tracking-tight text-white leading-[0.98] text-balance max-w-2xl">
                  Sobreviva na{' '}
                  <span className="text-amber-400">Ilha</span>
                </h1>

                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Explore a ilha tropical 3D com praias, mar nadável, casas entráveis e sombras reais guiadas pelo sol do amanhecer ao crepúsculo. Três armas realistas com munição infinita.
                </p>

                <p className="mt-3.5 pl-3 border-l-2 border-amber-400/75 text-xs sm:text-[13px] text-amber-100/90 leading-snug max-w-xl">
                  <strong className="text-amber-300 font-display tracking-wide">GENERAL REMAKE COMING</strong>
                  <span className="text-amber-200/55 mx-1.5">—</span>
                  <span>Reformulação geral em andamento; Modo Zumbi e o novo arsenal estão ativos.</span>
                </p>

                {/* Primary CTAs */}
                <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    id="btn-start-game"
                    onClick={() => handleButtonClick(onStart)}
                    className="flex-1 sm:flex-none min-h-[48px] py-3 px-7 sm:px-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold tracking-wide text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-amber-950/35 whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-slate-950 shrink-0" />
                    <span>Jogar Agora</span>
                  </button>

                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="min-h-[48px] py-3 px-5 sm:px-6 rounded-xl bg-white/[0.07] hover:bg-white/[0.13] border border-white/15 text-white font-display font-semibold tracking-wide text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Armaria</span>
                  </button>
                </div>

                {/* Portrait / Small Screen Secondary Nav Row */}
                <div className="mt-2.5 grid grid-cols-3 gap-2 w-full md:hidden">
                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="min-h-[44px] px-2 rounded-xl bg-[#071018]/85 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Armaria</span>
                  </button>
                  <button
                    onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                    className="min-h-[44px] px-2 rounded-xl bg-[#071018]/85 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Prestígio</span>
                  </button>
                  <button
                    onClick={() => handleButtonClick(() => setShowControlsModal(true))}
                    className="min-h-[44px] px-2 rounded-xl bg-[#071018]/85 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span>Controles</span>
                  </button>
                </div>

                {/* Unboxed Clean Telemetry Strip */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-white/10 w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 tabular-nums">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Recorde</div>
                    <div className="mt-1 text-base sm:text-lg font-mono-numbers font-bold text-white flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{highScoreZombie.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Arma Ativa</div>
                    <div className="mt-1 text-sm sm:text-base font-display font-semibold text-white truncate">
                      {currentWeaponStats.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Terreno</div>
                    <div className="mt-1 text-sm sm:text-base font-display font-semibold text-cyan-300">
                      Ilha & Mar 3D
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Ciclo Solar</div>
                    <div className="mt-1 text-sm sm:text-base font-display font-semibold text-emerald-300">
                      24h em 3 min
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Tactical Arsenal & Graphics Preset Rail */}
              <div className="landscape:md:col-span-5 lg:col-span-5 w-full flex flex-col gap-3.5 bg-[#071018]/88 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-slate-200">
                    Arsenal de Combate
                  </h2>
                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="min-h-[36px] text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>Melhorias</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-[245px] sm:max-h-[265px] overflow-y-auto hud-scroll pr-1 divide-y divide-white/[0.08]">
                  {(
                    [
                      {
                        type: WeaponType.GLOCK_19,
                        name: 'Glock 19 Gen5 MOS',
                        role: 'Pistola Tática 9mm · Precisão e agilidade',
                        accent: '#fbbf24',
                      },
                      {
                        type: WeaponType.MP5_A5,
                        name: 'HK MP5A5 9mm',
                        role: 'Submetralhadora · 13.5 tiros/s silenciada',
                        accent: '#34d399',
                      },
                      {
                        type: WeaponType.BENELLI_M4,
                        name: 'Benelli M4 Super 90',
                        role: 'Espingarda Cal. 12 · 7 projéteis por disparo',
                        accent: '#f87171',
                      },
                      {
                        type: WeaponType.FLAMETHROWER,
                        name: 'M2A1-7 Lança-Chamas',
                        role: 'Napalm Pressurizado · Incendeia hordas',
                        accent: '#f97316',
                      },
                      {
                        type: WeaponType.SCAR_L,
                        name: 'FN SCAR-L CQC',
                        role: 'Rifle 5.56mm · Alta cadência e perfuração',
                        accent: '#38bdf8',
                      },
                      {
                        type: WeaponType.AWM_SNIPER,
                        name: 'AWM .338 Lapua',
                        role: 'Sniper Antimaterial · Dano extremo (6 alvos)',
                        accent: '#c084fc',
                      },
                      {
                        type: WeaponType.RPG_7,
                        name: 'RPG-7V2 Lança-Foguetes',
                        role: 'Ogiva Explosiva · Impacto em área letal',
                        accent: '#fb923c',
                      },
                    ] as const
                  ).map((w) => {
                    const isUnlocked = unlockedList.includes(w.type);
                    const isEquipped = player.currentWeapon === w.type;
                    const WIcon = getWeaponIcon(w.type);
                    return (
                      <button
                        key={w.type}
                        onClick={() => {
                          if (isUnlocked && onSelectWeapon) {
                            handleButtonClick(() => onSelectWeapon(w.type));
                          } else {
                            handleButtonClick(onOpenStore);
                          }
                        }}
                        className={`w-full min-h-[56px] py-3 px-3 -mx-3 first:pt-2.5 last:pb-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                          isEquipped ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                            <WIcon className="w-4 h-4" style={{ color: w.accent }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-display font-semibold text-white truncate">
                              {w.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">{w.role}</div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isEquipped ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 whitespace-nowrap">
                              <Check className="w-3.5 h-3.5" />
                              <span>Equipada</span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                              Equipar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 whitespace-nowrap">
                              <Lock className="w-3 h-3" />
                              <span>Armaria</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {onChangeGraphicsQuality && (
                  <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Qualidade Gráfica</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate">
                        {GRAPHICS_PRESET_CONFIGS[graphicsQuality].description}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {GRAPHICS_QUALITY_ORDER.map((q) => {
                        const active = graphicsQuality === q;
                        return (
                          <button
                            key={q}
                            onClick={() => handleButtonClick(() => onChangeGraphicsQuality(q))}
                            className={`min-h-[40px] py-2 px-2 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-sm'
                                : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08] hover:text-white'
                            }`}
                          >
                            {GRAPHICS_PRESET_CONFIGS[q].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* QUIET FOOTER */}
          <footer className="relative z-10 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span>Zombie Shooter 3D</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span className="text-amber-300/90 font-medium">General Remake Coming</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span>WASD Mover</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span>Mouse Mirar e Atirar</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span>1–7 Armas</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span>ESC Pausar</span>
            </div>
          </footer>

          {/* CONTROLS GUIDE MODAL */}
          {showControlsModal && (
            <div
              data-gamepad-scope="modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/88 backdrop-blur-sm"
            >
              <div className="bg-[#071018] border border-white/15 rounded-2xl max-w-5xl w-full max-h-[92dvh] overflow-y-auto hud-scroll p-4 sm:p-6 shadow-2xl relative">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                    <h2 className="text-base sm:text-lg font-display font-bold uppercase text-white">
                      Guia de Controles
                    </h2>
                  </div>
                  <button
                    data-gamepad-back="true"
                    onClick={() => setShowControlsModal(false)}
                    className="w-11 h-11 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer flex items-center justify-center shrink-0"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 landscape:grid-cols-3 md:grid-cols-3 gap-3 text-left">
                  <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2.5">
                      Computador / Desktop
                    </span>
                    <ul className="text-xs text-slate-300 flex flex-col gap-2 font-mono">
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Mover:</span>
                        <span className="font-bold text-white">[W] [A] [S] [D]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Mirar & Atirar:</span>
                        <span className="font-bold text-cyan-400">Mouse + Clique</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Trocar Arma:</span>
                        <span className="font-bold text-amber-300">[1] – [7]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Pausar:</span>
                        <span className="font-bold text-white">[P] / [ESC]</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3.5">
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-2.5">
                      Mobile / Touchscreen
                    </span>
                    <ul className="text-xs text-slate-300 flex flex-col gap-2 font-mono">
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Joystick Esq:</span>
                        <span className="font-bold text-cyan-300">Mover</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Joystick Dir:</span>
                        <span className="font-bold text-rose-400">Mirar & Atirar</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Trocar Arma:</span>
                        <span className="font-bold text-amber-300">Barra Inferior</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-3.5">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                      <Gamepad2 className="w-3.5 h-3.5" /> Controle / Gamepad
                    </span>
                    <ul className="text-xs text-slate-300 flex flex-col gap-2 font-mono">
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Analógico Esq:</span>
                        <span className="font-bold text-white">Mover / Menu</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Analógico Dir:</span>
                        <span className="font-bold text-cyan-300">
                          {gamepadCfg.twinStickAutoFire ? 'Mirar 360° & Atirar' : 'Mirar 360°'}
                        </span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">RT / R2 / A:</span>
                        <span className="font-bold text-rose-300">Atirar / Confirmar</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">LB / B · Start:</span>
                        <span className="font-bold text-sky-300">Voltar · Pausar</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Controller Calibration */}
                <div className="mt-3.5 bg-slate-950/75 border border-cyan-500/20 rounded-xl p-3.5 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5" /> Calibração do Controle
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[300px]">
                      {gamepadDiag
                        ? `Conectado (${gamepadDiag.detectedProfile}) · R[${gamepadDiag.rxIndex},${gamepadDiag.ryIndex}]`
                        : 'Nenhum controle detectado — aperte um botão'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Perfil de Botões</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            ['AUTO', 'Auto'],
                            ['STANDARD', 'Xbox'],
                            ['ANDROID_HID', 'Android/BT'],
                            ['PLAYSTATION', 'PS'],
                            ['NINTENDO', 'Switch'],
                          ] as [GamepadProfileMode, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => updateGamepadCfg({ profile: val })}
                            className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                              gamepadCfg.profile === val
                                ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                                : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Eixos Analógico Dir</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            ['AUTO', 'Auto'],
                            ['2_3', '2/3'],
                            ['2_5', '2/5'],
                            ['3_4', '3/4'],
                          ] as [RightStickAxesMode, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => updateGamepadCfg({ rightStickAxes: val })}
                            className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                              gamepadCfg.rightStickAxes === val
                                ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-bold'
                                : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] uppercase">Disparo do Analógico Dir</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => updateGamepadCfg({ twinStickAutoFire: true })}
                          className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                            gamepadCfg.twinStickAutoFire
                              ? 'bg-rose-500 text-white border-rose-400 font-bold'
                              : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                          }`}
                        >
                          Mirar + Atirar
                        </button>
                        <button
                          onClick={() => updateGamepadCfg({ twinStickAutoFire: false })}
                          className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                            !gamepadCfg.twinStickAutoFire
                              ? 'bg-rose-500 text-white border-rose-400 font-bold'
                              : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                          }`}
                        >
                          Só Mirar (RT Atira)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowControlsModal(false)}
                  className="mt-4 w-full min-h-[44px] py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REBOOT CONFIRMATION MODAL */}
      {showRebootModal && onResetAll && (
        <div
          data-gamepad-scope="modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/88 backdrop-blur-sm pointer-events-auto"
        >
          <div className="bg-[#071018] border border-rose-500/35 rounded-2xl max-w-sm w-full max-h-[92dvh] overflow-y-auto p-5 shadow-2xl text-center">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-display font-bold uppercase text-white mb-1.5">
              Reboot Completo
            </h3>
            <p className="text-xs font-mono text-slate-400 leading-relaxed mb-5">
              Deseja apagar permanentemente todos os créditos, armas, upgrades, prestígios, tokens e recordes?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                data-gamepad-back="true"
                onClick={() => setShowRebootModal(false)}
                className="min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-display font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowRebootModal(false);
                  handleButtonClick(onResetAll);
                }}
                className="min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PAUSE OVERLAY (Widescreen 2-Col + Portrait Stack)      */}
      {/* ========================================================= */}
      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 pointer-events-auto bg-[#050a0f]/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto hud-scroll select-none z-50">
          <div className="w-full max-w-5xl my-auto grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-5 sm:gap-8 items-center">
            {/* LEFT: Status & Telemetry */}
            <div className="landscape:col-span-6 md:col-span-6 flex flex-col items-center landscape:items-start md:items-start text-center landscape:text-left md:text-left">
              <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-300 uppercase tracking-widest mb-2">
                <Pause className="w-4 h-4" />
                <span>Operação Suspensa · Modo Zumbi</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight uppercase mb-2">
                Combate Pausado
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-5">
                Ajuste qualidade gráfica ou retome a defesa da ilha.
              </p>

              <div className="grid grid-cols-2 gap-2.5 w-full max-w-md bg-[#071018]/90 border border-white/10 rounded-2xl p-3.5 tabular-nums">
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2.5 bg-slate-950/60 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Onda Atual</span>
                  <span className="text-base sm:text-lg font-display font-bold text-white mt-0.5">ONDA {wave}</span>
                </div>
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2.5 bg-slate-950/60 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Créditos</span>
                  <span className="text-base sm:text-lg font-mono-numbers font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    {player.score.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2.5 bg-slate-950/60 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Eliminados</span>
                  <span className="text-base sm:text-lg font-mono-numbers font-bold text-rose-400 mt-0.5">
                    {player.kills}
                  </span>
                </div>
                <div className="flex flex-col items-center landscape:items-start md:items-start p-2.5 bg-slate-950/60 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Nível</span>
                  <span className="text-base sm:text-lg font-display font-bold text-cyan-300 mt-0.5">
                    NV.{player.level}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Action Buttons & Graphics Selector */}
            <div className="landscape:col-span-6 md:col-span-6 flex flex-col gap-2.5 w-full max-w-md mx-auto">
              <button
                id="btn-resume-game"
                data-gamepad-resume="true"
                data-gamepad-back="true"
                onClick={() => handleButtonClick(onPauseToggle)}
                className="min-h-[48px] py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold tracking-wider uppercase text-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Retomar Combate</span>
              </button>

              {onChangeGraphicsQuality && (
                <div className="bg-[#071018]/90 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Gráficos</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      {GRAPHICS_PRESET_CONFIGS[graphicsQuality].description}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {GRAPHICS_QUALITY_ORDER.map((q) => {
                      const active = graphicsQuality === q;
                      return (
                        <button
                          key={q}
                          onClick={() => handleButtonClick(() => onChangeGraphicsQuality(q))}
                          className={`min-h-[40px] py-1.5 px-1 rounded-lg border text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                              : 'bg-slate-950/70 text-slate-300 border-white/10 hover:text-white'
                          }`}
                        >
                          {GRAPHICS_PRESET_CONFIGS[q].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {onToggleVisionCone && (
                <button
                  onClick={() => handleButtonClick(onToggleVisionCone)}
                  className={`min-h-[44px] py-2.5 px-5 rounded-xl border font-display font-bold tracking-wider uppercase text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                    visionConeEnabled
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-[#071018]/90 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Campo de Visão: {visionConeEnabled ? 'Ativado' : 'Desativado'}</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="btn-restart-paused"
                  onClick={() => handleButtonClick(onRestart)}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-[#071018]/90 border border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.06] font-display font-bold tracking-wider uppercase text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reiniciar</span>
                </button>

                <button
                  onClick={() => handleButtonClick(onGoToMenu)}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-950/80 border border-white/10 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  Menu Principal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. GAME OVER OVERLAY (Widescreen 2-Col + Portrait Stack)  */}
      {/* ========================================================= */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 pointer-events-auto bg-[#05080f]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none overflow-y-auto hud-scroll z-50">
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_18%,rgba(225,29,72,0.16),transparent_60%)]" />

          <div className="relative z-10 w-full max-w-4xl bg-[#071018]/92 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono uppercase tracking-[0.14em] text-slate-400 mb-3">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-rose-500" />
                <span className="text-rose-400 font-bold">Relatório Pós-Combate</span>
              </div>
              <span className="text-slate-300 font-semibold">Ilha · Modo Zumbi</span>
            </div>

            <div className="w-full flex items-center gap-3 my-3">
              <div className="h-[1px] flex-1 bg-rose-500/25" />
              <svg className="w-24 h-5 text-rose-500 stroke-current fill-none shrink-0" viewBox="0 0 96 20" strokeWidth="1.8">
                <path d="M0,10 L26,10 L32,3 L38,17 L44,6 L49,12 L54,10 L96,10" />
              </svg>
              <div className="h-[1px] flex-1 bg-rose-500/25" />
            </div>

            <div className="text-center sm:text-left mt-3 mb-6">
              <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight uppercase text-white leading-none">
                Operador <span className="text-rose-500">Abatido</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                O sobrevivente foi superado pela horda na ilha.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 mb-5 tabular-nums">
              <div className="px-4 py-3.5 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Score Ganho</span>
                <span className="mt-1 text-lg sm:text-xl font-mono-numbers font-bold text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  {player.score.toLocaleString()}
                </span>
              </div>

              <div className="px-4 py-3.5 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Eliminados</span>
                <span className="mt-1 text-lg sm:text-xl font-mono-numbers font-bold text-rose-400">
                  {player.kills}
                </span>
              </div>

              <div className="px-4 py-3.5 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Onda Final</span>
                <span className="mt-1 text-lg sm:text-xl font-display font-bold text-white">
                  ONDA {wave}
                </span>
              </div>

              <div className="px-4 py-3.5 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Nível</span>
                <span className="mt-1 text-lg sm:text-xl font-display font-bold text-cyan-300">
                  NV.{player.level}
                </span>
              </div>
            </div>

            {player.score >= highScoreZombie && player.score > 0 && (
              <div className="mb-5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/35 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Novo Recorde Pessoal Alcançado!</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                id="btn-try-again"
                onClick={() => handleButtonClick(onRestart)}
                className="flex-1 min-h-[48px] py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-bold tracking-wider uppercase text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-rose-600/25"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                <span>Jogar Novamente</span>
              </button>

              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="min-h-[48px] py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-amber-300 font-display font-bold tracking-wider uppercase text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Armaria</span>
              </button>

              <button
                id="btn-back-to-menu"
                data-gamepad-back="true"
                onClick={() => handleButtonClick(onGoToMenu)}
                className="min-h-[48px] py-3 px-5 rounded-xl bg-transparent hover:bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white font-mono font-bold uppercase tracking-wider text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center whitespace-nowrap"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
