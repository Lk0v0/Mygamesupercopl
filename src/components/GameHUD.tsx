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
  Biohazard,
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
    case WeaponType.BENELLI_M4:
      return Zap;
    case WeaponType.SCAR_L:
      return Target;
    default:
      return Crosshair;
  }
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

  const xpPercentage = Math.min(100, (player.xp / player.xpNeeded) * 100);
  const hpPercentage = Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100));
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

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-40 select-none overflow-hidden">
      {/* ========================================================= */}
      {/* 1. ACTIVE PLAYING / PAUSED / LEVEL UP HUD                 */}
      {/* ========================================================= */}
      {(gameState === GameState.PLAYING ||
        gameState === GameState.PAUSED ||
        gameState === GameState.LEVEL_UP) && (
        <>
          {/* Top Horizon XP Hairline */}
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
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isExtremeHp
                    ? 'bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(153,27,27,0.45)_55%,rgba(69,10,10,0.88)_100%)] animate-pulse'
                    : 'bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(185,28,28,0.3)_65%,rgba(127,29,29,0.7)_100%)] animate-pulse'
                }`}
              />
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  isExtremeHp
                    ? 'border-[12px] sm:border-[24px] border-red-700/60 shadow-[inset_0_0_120px_rgba(220,38,38,0.85)]'
                    : 'border-[8px] sm:border-[16px] border-red-600/40 shadow-[inset_0_0_80px_rgba(220,38,38,0.6)]'
                }`}
              />
              <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-xl transition-all ${
                    isExtremeHp
                      ? 'bg-red-950/95 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.75)]'
                      : 'bg-red-950/90 border-red-500/60 shadow-[0_0_16px_rgba(239,68,68,0.45)]'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-red-400 fill-red-500" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono font-black tracking-wider text-red-200 uppercase leading-none">
                      {isExtremeHp ? 'TRAUMA SEVERO' : 'VITALIDADE CRÍTICA'}
                    </span>
                    <span className="text-[8.5px] font-mono font-bold text-red-400 uppercase mt-0.5 leading-none tabular-nums">
                      {player.hp} HP · {Math.round(130 + (1 - hpPercentage / 30) * 55)} BPM
                    </span>
                  </div>
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                </div>
              </div>
            </div>
          )}

          {/* New Wave Start Brief Tactical Alert */}
          {waveAlert && (
            <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-950/90 border border-amber-500/40 px-3.5 py-1 rounded-lg shadow-lg flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] sm:text-xs font-display font-black text-white uppercase tracking-wider whitespace-nowrap">
                  ONDA {waveAlert} INICIADA
                </span>
              </div>
            </div>
          )}

          {/* Dedicated Top Boss Health Bar */}
          {activeBoss && (
            <div className="absolute top-11 sm:top-14 left-1/2 -translate-x-1/2 z-30 w-full max-w-[270px] sm:max-w-md px-2 pointer-events-none animate-in fade-in duration-200">
              <div className="px-2.5 py-1.5 rounded-lg border shadow-xl flex flex-col gap-1 bg-slate-950/90 border-red-500/50">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Skull className="w-3 h-3 text-red-500 shrink-0" />
                    <span className="font-display font-black tracking-wider uppercase text-white truncate max-w-[130px] sm:max-w-[220px]">
                      {activeBoss.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono-numbers font-bold shrink-0 tabular-nums">
                    <span className="text-red-300">
                      {Math.max(0, activeBoss.hp)} / {activeBoss.maxHp}
                    </span>
                    <span className="text-amber-400 ml-0.5">
                      {Math.round(Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100))}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-150 ease-out bg-gradient-to-r from-amber-500 via-red-500 to-rose-600"
                    style={{ width: `${Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Top Header HUD */}
          <div className="w-full flex items-center justify-between gap-1.5 px-2 sm:px-4 pt-2 pb-1 pointer-events-auto">
            {/* LEFT: Minimal Vital Signs Capsule */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-white/10 shadow-md shrink-0">
              <span className="text-[9.5px] sm:text-[10px] font-mono font-black text-cyan-300 tracking-wider tabular-nums">
                LV.{player.level}
              </span>
              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-[52px] sm:min-w-[100px]">
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isCriticalHp ? 'bg-red-500' : 'bg-emerald-400'
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
                className={`text-[9.5px] sm:text-[10px] font-mono-numbers font-bold tabular-nums ${
                  isCriticalHp ? 'text-red-400' : 'text-slate-300'
                }`}
              >
                {player.hp}
              </span>
            </div>

            {/* CENTER: Floating Slim Wave, Day/Night Clock & Zombie Mode Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10 shadow-md min-w-0">
              <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] font-mono font-bold text-red-400 bg-red-950/90 border border-red-500/40 px-1.5 py-0.5 rounded shrink-0">
                <Biohazard className="w-2.5 h-2.5 text-red-400" />
                <span className="hidden xs:inline sm:inline">ZUMBI</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-display font-black text-white tracking-wider uppercase whitespace-nowrap tabular-nums">
                O{wave.toString().padStart(2, '0')}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[9.5px] sm:text-[10px] font-mono-numbers text-slate-300 font-bold whitespace-nowrap tabular-nums">
                {zombiesRemaining > 0 ? (
                  <>
                    {zombiesRemaining}
                    <span className="hidden md:inline"> RESTANTES</span>
                  </>
                ) : (
                  'LIMPO'
                )}
              </span>
              {dayNight && (
                <>
                  <span className="text-white/20 hidden sm:inline">·</span>
                  <span
                    className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono-numbers font-bold whitespace-nowrap tabular-nums text-amber-200"
                    title={`Ciclo Dia/Noite (3 min) — ${dayNight.phaseLabel}`}
                  >
                    {dayNight.phase === 'DAWN' && <Sunrise className="w-3 h-3 text-amber-300" />}
                    {dayNight.phase === 'DAY' && <Sun className="w-3 h-3 text-yellow-300" />}
                    {dayNight.phase === 'DUSK' && <Sunset className="w-3 h-3 text-orange-400" />}
                    {dayNight.phase === 'NIGHT' && <Moon className="w-3 h-3 text-sky-300" />}
                    <span>{dayNight.clockText}</span>
                    <span className="text-slate-400 hidden lg:inline">{dayNight.phaseLabel}</span>
                  </span>
                </>
              )}
            </div>

            {/* RIGHT: Score & Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-white/10 shadow-md tabular-nums">
                <span
                  className="text-[11px] sm:text-sm font-mono-numbers font-bold text-amber-400 flex items-center gap-1 tracking-tight"
                  title="Score / Dinheiro Ganho"
                >
                  <Coins className="w-3 h-3 text-amber-400" />
                  {player.score.toLocaleString()}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[9.5px] sm:text-[10px] font-mono-numbers font-bold text-rose-400 flex items-center gap-1">
                  <Skull className="w-2.5 h-2.5" /> {player.kills}
                </span>
              </div>

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
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                ) : (
                  <Pause className="w-3.5 h-3.5 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* BOTTOM CENTER: Active Powers & Quick Firearm Hotbar */}
          <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-auto max-w-[68vw]">
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

            {unlockedList.length > 1 && onSelectWeapon && (
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {unlockedList.map((wt, idx) => {
                  const ws = player.weapons[wt];
                  const isSel = player.currentWeapon === wt;
                  const shortLabel =
                    wt === WeaponType.GLOCK_19
                      ? 'Glock 19'
                      : wt === WeaponType.BENELLI_M4
                        ? 'Benelli M4'
                        : 'SCAR-L';
                  return (
                    <button
                      key={wt}
                      onClick={() => handleButtonClick(() => onSelectWeapon(wt))}
                      className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isSel
                          ? 'bg-amber-400 text-slate-950 border-amber-200'
                          : 'bg-slate-950/85 text-slate-300 border-white/15 hover:border-amber-400/50'
                      }`}
                    >
                      [{idx + 1}] {ws?.name ? shortLabel : wt}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="bg-slate-950/85 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border border-white/15 flex items-center gap-1.5 shadow-lg">
              <CurrentIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" style={{ color: currentWeaponStats.color }} />
              <span className="text-[10px] sm:text-[11px] font-display font-black uppercase tracking-wider text-white truncate max-w-[140px] sm:max-w-[220px]">
                {currentWeaponStats.name}
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">∞</span>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 2. REDESIGNED WOODLAND SURVIVAL MENU (GameState.MENU)     */}
      {/* ========================================================= */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 pointer-events-auto bg-[#060b08] flex flex-col justify-between text-slate-100 overflow-y-auto">
          {/* Full-Bleed Atmospheric Forest Key Art + Directional Contrast Scrims */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {!heroImgFailed ? (
              <img
                src="/src/assets/images/forest_quarantine_hero_1795206941688.jpg"
                alt="Floresta de Quarentena ao Entardecer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover object-center scale-[1.02] brightness-[0.68] contrast-[1.08] pointer-events-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_70%_45%,rgba(180,83,9,0.28),rgba(12,32,20,0.92)_55%,#060b08_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050a07]/95 via-[#050a07]/72 to-[#050a07]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a07] via-transparent to-[#050a07]/75" />
          </div>

          {/* 3-ZONE TOP BAR */}
          <header className="relative z-10 w-full max-w-[1360px] mx-auto px-5 sm:px-10 py-4 border-b border-white/[0.08] flex items-center justify-between gap-8 shrink-0">
            {/* Zone 1: Clean Brand Wordmark */}
            <div className="text-lg sm:text-xl font-display font-bold tracking-[0.14em] uppercase text-white whitespace-nowrap shrink-0">
              Zombie Shooter
            </div>

            {/* Zone 2: Clean Typographic Nav Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Armaria
              </button>
              <button
                onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                className="hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Prestígio{prestigeLevel > 0 ? ` (P${prestigeLevel})` : ''}
              </button>
              <button
                onClick={() => handleButtonClick(() => setShowControlsModal(true))}
                className="hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Controles
              </button>
            </nav>

            {/* Zone 3: Primary Resource / Utility Cluster */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-mono-numbers font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap"
                title="Créditos disponíveis"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{coins.toLocaleString()}</span>
              </button>
              <button
                onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-mono-numbers font-bold text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                title="Tokens de Prestígio"
              >
                <Gem className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{tokens}</span>
              </button>

              <div className="flex items-center gap-1">
                {gamepadConnected && (
                  <button
                    onClick={() => handleButtonClick(() => setShowControlsModal(true))}
                    className="p-2 rounded-lg text-emerald-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
                    title="Controle Conectado"
                    aria-label="Controle Conectado"
                  >
                    <Gamepad2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleButtonClick(onToggleSound)}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
                  aria-label="Alternar Áudio"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>
                {onResetAll && (
                  <button
                    onClick={() => handleButtonClick(() => setShowRebootModal(true))}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] transition-colors cursor-pointer"
                    title="Resetar Progresso"
                    aria-label="Resetar Progresso"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* CENTER HERO STAGE (Asymmetric 12-Column Editorial Layout) */}
          <main className="relative z-10 flex-1 w-full max-w-[1360px] mx-auto px-5 sm:px-10 py-6 sm:py-10 flex flex-col justify-center">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
              {/* LEFT COLUMN (7 cols): Headline, Notice, Primary CTA & Clean Stat Strip */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Unboxed quiet metadata line */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-300 tracking-wide mb-4">
                  <span className="text-emerald-400 font-semibold">Modo Zumbi</span>
                  <span className="text-white/25" aria-hidden="true">·</span>
                  <span>Baseplate 3D</span>
                  <span className="text-white/25" aria-hidden="true">·</span>
                  <span>Ciclo Dia e Noite (3 min)</span>
                </div>

                {/* Main Display Headline */}
                <h1 className="text-4xl sm:text-6xl lg:text-[4.4rem] font-display font-bold tracking-tight text-white leading-[0.98] text-balance max-w-2xl">
                  Sobreviva na{' '}
                  <span className="text-amber-400">Baseplate</span>
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Enfrente hordas em uma baseplate de concreto 3D aberta com iluminação dinâmica do amanhecer à noite profunda. Três armas convencionais realistas com munição infinita.
                </p>

                {/* Clear & Refined GENERAL REMAKE COMING Notice */}
                <div className="mt-5 w-full max-w-xl rounded-xl bg-amber-950/55 border border-amber-400/35 px-4 py-3 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-[13px] text-amber-100/90 leading-relaxed">
                    <strong className="text-amber-300 font-display tracking-wide">GENERAL REMAKE COMING</strong>
                    <span className="text-amber-200/60 mx-1.5">—</span>
                    <span>
                      Reformulação geral em desenvolvimento. Temporariamente apenas o Modo Zumbi e o novo arsenal realista estão ativos.
                    </span>
                  </p>
                </div>

                {/* Primary + Secondary Action Row */}
                <div className="mt-7 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                  <button
                    id="btn-start-game"
                    onClick={() => handleButtonClick(onStart)}
                    className="py-3.5 px-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold tracking-wide text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-amber-950/40 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-slate-950 shrink-0" />
                    <span>Jogar Agora</span>
                  </button>

                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="py-3.5 px-6 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-display font-semibold tracking-wide text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Armaria</span>
                  </button>
                </div>

                {/* Clean Unboxed Telemetry Strip */}
                <div className="mt-8 pt-6 border-t border-white/10 w-full max-w-xl grid grid-cols-3 gap-6 tabular-nums">
                  <div>
                    <div className="text-xs text-slate-400">Recorde</div>
                    <div className="mt-1 text-lg sm:text-xl font-mono-numbers font-bold text-white flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{highScoreZombie.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Arma Ativa</div>
                    <div className="mt-1 text-sm sm:text-base font-display font-semibold text-white truncate">
                      {currentWeaponStats.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Ambiente</div>
                    <div className="mt-1 text-sm sm:text-base font-display font-semibold text-emerald-300">
                      Ciclo 3 min
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (5 cols): Sleek Interactive Arsenal Selector anchored cleanly */}
              <div className="lg:col-span-5 w-full flex flex-col gap-3 bg-[#08100c]/92 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-slate-200">
                    Arsenal de Combate
                  </h2>
                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>Melhorias</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-white/[0.08]">
                  {(
                    [
                      {
                        type: WeaponType.GLOCK_19,
                        name: 'Glock 19 Gen5 MOS',
                        role: 'Pistola Tática 9mm · Precisão e mobilidade',
                        accent: '#fbbf24',
                      },
                      {
                        type: WeaponType.BENELLI_M4,
                        name: 'Benelli M4 Super 90',
                        role: 'Espingarda Cal. 12 · 7 projéteis por disparo',
                        accent: '#f87171',
                      },
                      {
                        type: WeaponType.SCAR_L,
                        name: 'FN SCAR-L CQC',
                        role: 'Rifle 5.56mm · Alta cadência e perfuração',
                        accent: '#38bdf8',
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
                        className={`w-full py-3.5 px-3 -mx-3 first:pt-2 last:pb-2 rounded-lg flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                          isEquipped ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
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
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 whitespace-nowrap">
                              <Check className="w-3.5 h-3.5" />
                              <span>Equipada</span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-xs font-medium text-slate-300 hover:text-white whitespace-nowrap">
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
                      <span className="text-xs font-display font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-amber-400" />
                        <span>Qualidade Gráfica</span>
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
                            className={`py-2 px-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
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

                {/* Mobile quick links */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08] md:hidden">
                  <button
                    onClick={() => handleButtonClick(onOpenStore)}
                    className="py-2.5 px-2 rounded-lg bg-white/[0.05] text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                    <span>Armaria</span>
                  </button>
                  <button
                    onClick={() => onOpenPrestige && handleButtonClick(onOpenPrestige)}
                    className="py-2.5 px-2 rounded-lg bg-white/[0.05] text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>Prestígio</span>
                  </button>
                  <button
                    onClick={() => handleButtonClick(() => setShowControlsModal(true))}
                    className="py-2.5 px-2 rounded-lg bg-white/[0.05] text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Controles</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* QUIET FOOTER */}
          <footer className="relative z-10 w-full max-w-[1360px] mx-auto px-5 sm:px-10 py-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span>Zombie Shooter 2D</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span className="text-amber-300/90 font-medium">General Remake Coming</span>
            </div>
            <div className="flex items-center gap-2">
              <span>WASD Mover</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span>Mouse Mirar e Atirar</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span>1–3 Armas</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <span>ESC Pausar</span>
            </div>
          </footer>

          {/* CONTROLS GUIDE MODAL */}
          {showControlsModal && (
            <div
              data-gamepad-scope="modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85"
            >
              <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-4xl w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
                <button
                  data-gamepad-back="true"
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

                <div className="grid grid-cols-1 landscape:grid-cols-3 md:grid-cols-3 gap-3 text-left">
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
                        <span className="text-slate-400">Mirar & Atirar:</span>
                        <span className="font-bold text-cyan-400">Mouse + Clique</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Trocar Arma:</span>
                        <span className="font-bold text-amber-300">[1] [2] [3]</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Pausar:</span>
                        <span className="font-bold text-white">[P] / [ESC]</span>
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
                        <span className="text-slate-400">Trocar Arma:</span>
                        <span className="font-bold text-amber-300">Barra Inferior</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Gamepad2 className="w-3.5 h-3.5" /> CONTROLE / GAMEPAD
                    </span>
                    <ul className="text-[11px] sm:text-xs text-slate-300 flex flex-col gap-1.5 font-mono">
                      <li className="flex justify-between gap-2">
                        <span className="text-slate-400">Analógico Esq / D-Pad:</span>
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
                <div className="mt-3 bg-slate-950/70 border border-cyan-500/20 rounded-xl p-3 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5" /> Calibração do Controle
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[260px]">
                      {gamepadDiag
                        ? `Conectado (${gamepadDiag.detectedProfile}) · R[${gamepadDiag.rxIndex},${gamepadDiag.ryIndex}]`
                        : 'Nenhum controle detectado — aperte um botão no controle'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 text-[10px] uppercase">Perfil de Botões</span>
                      <div className="flex flex-wrap gap-1">
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
                            className={`px-2 py-1 rounded border cursor-pointer transition-colors ${
                              gamepadCfg.profile === val
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                                : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 text-[10px] uppercase">Eixos Analógico Dir</span>
                      <div className="flex flex-wrap gap-1">
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
                            className={`px-2 py-1 rounded border cursor-pointer transition-colors ${
                              gamepadCfg.rightStickAxes === val
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 text-[10px] uppercase">Disparo do Analógico Dir</span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => updateGamepadCfg({ twinStickAutoFire: true })}
                          className={`px-2 py-1 rounded border cursor-pointer transition-colors ${
                            gamepadCfg.twinStickAutoFire
                              ? 'bg-rose-500 text-white border-rose-400 font-bold'
                              : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                          }`}
                        >
                          Mirar + Atirar
                        </button>
                        <button
                          onClick={() => updateGamepadCfg({ twinStickAutoFire: false })}
                          className={`px-2 py-1 rounded border cursor-pointer transition-colors ${
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
        <div
          data-gamepad-scope="modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 pointer-events-auto"
        >
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-sm w-full max-h-[92dvh] overflow-y-auto p-5 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-2.5 text-rose-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-display font-black uppercase text-white mb-1">
              REBOOT COMPLETO
            </h3>
            <p className="text-xs font-mono text-slate-400 leading-relaxed mb-4">
              Deseja apagar permanentemente todos os créditos, armas, upgrades, prestígios, tokens e recordes?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                data-gamepad-back="true"
                onClick={() => setShowRebootModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-display font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowRebootModal(false);
                  handleButtonClick(onResetAll);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-black uppercase tracking-wider cursor-pointer whitespace-nowrap"
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
        <div className="absolute inset-0 pointer-events-auto bg-slate-950/92 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none z-50">
          <div className="w-full max-w-4xl my-auto grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* LEFT: Status & Telemetry */}
            <div className="landscape:col-span-6 md:col-span-6 flex flex-col items-center landscape:items-start md:items-start text-center landscape:text-left md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400">
                  <Pause className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-mono font-bold">
                  <Biohazard className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300">MODO ZUMBI</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase mb-1">
                OPERAÇÃO SUSPENSA
              </h2>
              <p className="text-slate-400 text-[11px] font-mono uppercase tracking-widest mb-4">
                O combate está pausado temporariamente
              </p>

              <div className="grid grid-cols-2 gap-2.5 w-full max-w-md bg-slate-900/85 border border-white/10 rounded-xl p-3 tabular-nums">
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
                data-gamepad-resume="true"
                data-gamepad-back="true"
                onClick={() => handleButtonClick(onPauseToggle)}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-display font-black tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-slate-950" /> RETOMAR COMBATE
              </button>

              {onChangeGraphicsQuality && (
                <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Gráficos</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate">
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
                          className={`py-1.5 px-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
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
                  className={`py-2.5 px-5 rounded-xl border font-display font-bold tracking-wider uppercase text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                    visionConeEnabled
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>CAMPO DE VISÃO: {visionConeEnabled ? 'ATIVADO' : 'DESATIVADO'}</span>
                </button>
              )}

              <button
                id="btn-restart-paused"
                onClick={() => handleButtonClick(onRestart)}
                className="py-2.5 px-5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 hover:text-white hover:bg-slate-800 font-display font-bold tracking-wider uppercase text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" /> REINICIAR PARTIDA
              </button>

              <button
                onClick={() => handleButtonClick(onGoToMenu)}
                className="py-2.5 px-5 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
              >
                VOLTAR AO MENU PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BLACK-BOX DEATH SCREEN (GameState.GAME_OVER)           */}
      {/* ========================================================= */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 pointer-events-auto bg-[#06090f]/96 flex items-center justify-center p-4 sm:p-8 select-none overflow-y-auto z-50">
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_18%,rgba(225,29,72,0.16),transparent_60%)]" />

          <div className="relative z-10 w-full max-w-2xl bg-slate-950/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Header Kicker */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-slate-400 mb-3">
              <div className="flex items-center gap-2">
                <Skull className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-400 font-bold">RELATÓRIO PÓS-COMBATE</span>
              </div>
              <span className="text-rose-300 font-bold">MODO ZUMBI</span>
            </div>

            {/* ECG Flatline Vector Divider */}
            <div className="w-full flex items-center gap-3 my-3">
              <div className="h-[1px] flex-1 bg-rose-500/25" />
              <svg className="w-24 h-5 text-rose-500 stroke-current fill-none shrink-0" viewBox="0 0 96 20" strokeWidth="1.8">
                <path d="M0,10 L26,10 L32,3 L38,17 L44,6 L49,12 L54,10 L96,10" />
              </svg>
              <div className="h-[1px] flex-1 bg-rose-500/25" />
            </div>

            {/* Main Headline */}
            <div className="text-center sm:text-left mt-3 mb-6">
              <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight uppercase text-white leading-none">
                OPERADOR <span className="text-rose-500">ABATIDO</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-mono text-slate-400">
                O sobrevivente foi superado pela horda de infectados.
              </p>
            </div>

            {/* Telemetry Bar */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 mb-5 tabular-nums">
              <div className="px-4 py-3 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Score Ganho</span>
                <span className="mt-1 text-lg sm:text-xl font-mono-numbers font-black text-amber-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  {player.score.toLocaleString()}
                </span>
              </div>

              <div className="px-4 py-3 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Eliminados</span>
                <span className="mt-1 text-lg sm:text-xl font-mono-numbers font-black text-rose-400">
                  {player.kills}
                </span>
              </div>

              <div className="px-4 py-3 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Onda Final</span>
                <span className="mt-1 text-lg sm:text-xl font-display font-black text-white">
                  ONDA {wave}
                </span>
              </div>

              <div className="px-4 py-3 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Nível</span>
                <span className="mt-1 text-lg sm:text-xl font-display font-black text-cyan-300">
                  NV {player.level}
                </span>
              </div>
            </div>

            {/* New Record Highlight */}
            {player.score >= highScoreZombie && player.score > 0 && (
              <div className="mb-5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/35 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Novo Recorde Pessoal (Modo Zumbi)!</span>
              </div>
            )}

            {/* Action Matrix */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                id="btn-try-again"
                onClick={() => handleButtonClick(onRestart)}
                className="flex-1 py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-black tracking-wider uppercase text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-rose-600/25"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                <span>Jogar Novamente</span>
              </button>

              <button
                onClick={() => handleButtonClick(onOpenStore)}
                className="py-3.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 text-amber-300 font-display font-bold tracking-wider uppercase text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Armaria</span>
              </button>

              <button
                id="btn-back-to-menu"
                data-gamepad-back="true"
                onClick={() => handleButtonClick(onGoToMenu)}
                className="py-3.5 px-4 rounded-xl bg-transparent hover:bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white font-mono font-bold uppercase tracking-wider text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center whitespace-nowrap"
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
