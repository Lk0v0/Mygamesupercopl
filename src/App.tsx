import { useEffect, useRef, useState, useCallback } from 'react';
import { MobileControls } from './components/MobileControls';
import { GameHUD } from './components/GameHUD';
import { UpgradeScreen } from './components/UpgradeScreen';
import { StoreScreen } from './components/StoreScreen';
import {
  ActiveBossInfo,
  GameMode,
  GameState,
  Player,
  Zombie,
  ZombieType,
  Bullet,
  Particle,
  BloodSplat,
  ItemDrop,
  DropType,
  JoystickInput,
  UpgradeOption,
  WeaponType,
  WeaponStats,
  DyingState,
  ThrusterTrailPoint,
  VoidDroneState,
  AllShipMasteryState,
  ShipTypeKey,
  TokenUpgradeId,
  DragonSegment,
} from './types';
import { sound, isSoundEnabled, toggleSound } from './sound';
import {
  renderPlayerWeapon,
  renderBulletVisual,
  renderFlamethrowerStream,
  FlameStreamPoint,
  getDestructorBlastersWorld,
  getInterceptorBlastersWorld,
  getReiBlastersWorld,
  ReiBlasterMount,
  renderDestructorShip,
  renderInterceptorShip,
  renderReiShip,
  renderDestructorTwinBeams,
  renderReiQuadBeams,
  renderSingleExtraLaserBeam,
  renderDestructorThrusterTrails,
  renderMythicSolarAura,
  renderMythicSingularityBlades,
  renderMythicVoidDrones,
  renderEastDragon,
  renderEastDragonFireBeam,
  renderIronManSuit,
  renderIronManLaserBeam,
  renderIronManFlightTrail,
  renderCompanionDragon,
  renderDragonElementalBeam,
} from './components/WeaponVisuals';
import { rollLevelUpOptions } from './components/UpgradeSystem';
import { renderOperatorBody } from './components/OperatorVisuals';
import { ModeSelectModal } from './components/ModeSelectModal';
import { PrestigeScreen } from './components/PrestigeScreen';
import { MasteryScreen } from './components/MasteryScreen';
import {
  MAX_PRESTIGE,
  getPrestigeCost,
  getPrestigeBonuses,
  TOKEN_UPGRADES,
  DEFAULT_TOKEN_UPGRADES,
} from './components/PrestigeSystem';
import {
  SHIP_META,
  SHIP_MASTERY_NODES,
  DEFAULT_SHIP_MASTERY,
  TRAIN_MASTERY_CREDIT_COST,
  TRAIN_MASTERY_XP_GAIN,
  hasMasteryNode,
  canUnlockMasteryNode,
} from './components/MasterySystem';

const ARENA_SIZE = 2400; // Total width and height of the arena bounds
const SPAWN_MARGIN = 100; // How far outside the screen zombies should spawn

// Default starting stats for weapons with INFINITE AMMO
const INITIAL_WEAPONS: Record<WeaponType, WeaponStats> = {
  [WeaponType.PISTOL]: {
    type: WeaponType.PISTOL,
    name: 'Pistola Tática 9mm Mk.II',
    damage: 22,
    fireRate: 4.5, // bullets per second
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 600,
    spread: 0.02,
    piercing: 1,
    color: '#fbbf24', // Golden Amber
    unlocked: true,
  },
  [WeaponType.SHOTGUN]: {
    type: WeaponType.SHOTGUN,
    name: 'Espingarda Calibre 12 Dupla',
    damage: 24, // x 5 pellets = 120 damage up close!
    fireRate: 1.6,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 520,
    spread: 0.28, // wide spread
    piercing: 1,
    color: '#f87171', // Crimson Red
    unlocked: false,
  },
  [WeaponType.MACHINE_GUN]: {
    type: WeaponType.MACHINE_GUN,
    name: 'SMG Tática Vector MP-7',
    damage: 14,
    fireRate: 13, // ultra-fast burst
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 650,
    spread: 0.08,
    piercing: 1,
    color: '#c084fc', // Neon Violet
    unlocked: false,
  },
  [WeaponType.PLASMA_RIFLE]: {
    type: WeaponType.PLASMA_RIFLE,
    name: 'Rifle de Plasma Arc-1',
    damage: 54,
    fireRate: 2.6,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 480,
    spread: 0.015, // sniper accuracy
    piercing: 4, // pierces 4 enemies!
    color: '#38bdf8', // Cyan Ion
    unlocked: false,
  },
  [WeaponType.MINIGUN]: {
    type: WeaponType.MINIGUN,
    name: 'Metralhadora Titan M134',
    damage: 8, // Nerfed from 12
    fireRate: 16, // Nerfed from 22 for better balance
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 720,
    spread: 0.20, // Slightly wider spread
    piercing: 1,
    color: '#10b981', // Emerald Depleted Uranium
    unlocked: false,
  },
  [WeaponType.ROCKET_LAUNCHER]: {
    type: WeaponType.ROCKET_LAUNCHER,
    name: 'Lança-Mísseis M-99 Hellfire',
    damage: 260,
    fireRate: 1.4,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 580,
    spread: 0.015,
    piercing: 1, // explosive missile
    color: '#f97316', // Fiery Rocket Orange
    unlocked: false,
  },
  [WeaponType.FLAMETHROWER]: {
    type: WeaponType.FLAMETHROWER,
    name: 'Lança-Chamas Vulcão Napalm-X',
    damage: 18,
    fireRate: 36,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 460,
    spread: 0.32,
    piercing: 99, // infinite penetration
    color: '#ff5500', // Incandescent Fire
    unlocked: false,
  },
  [WeaponType.RAYGUN]: {
    type: WeaponType.RAYGUN,
    name: 'Pulsar Alienígena Zeta-9',
    damage: 48,
    fireRate: 5.5,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 740,
    spread: 0.025,
    piercing: 2,
    color: '#00ffcc', // Alien Cyan
    unlocked: false,
  },
  [WeaponType.RAY_RIFLE]: {
    type: WeaponType.RAY_RIFLE,
    name: 'Fuzil Cristalino Zarkon',
    damage: 72,
    fireRate: 8.5,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 880,
    spread: 0.018,
    piercing: 3,
    color: '#39ff14', // Electric Lime
    unlocked: false,
  },
  [WeaponType.LASER_MINIGUN]: {
    type: WeaponType.LASER_MINIGUN,
    name: 'Laser Minigun Hiper-Feixe Omega',
    damage: 32,
    fireRate: 28.0,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 1050,
    spread: 0.02,
    piercing: 3,
    color: '#ff0055', // Neon Laser Magenta
    unlocked: false,
  },
  [WeaponType.MAGNUM]: {
    type: WeaponType.MAGNUM,
    name: 'Revólver .44 Magnum Hunter',
    damage: 68,
    fireRate: 2.2,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 780,
    spread: 0.015,
    piercing: 2,
    color: '#f59e0b',
    unlocked: false,
  },
  [WeaponType.ASSAULT_RIFLE]: {
    type: WeaponType.ASSAULT_RIFLE,
    name: 'Fuzil de Assalto AK-47',
    damage: 34,
    fireRate: 9.0,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 760,
    spread: 0.045,
    piercing: 2,
    color: '#fb923c',
    unlocked: false,
  },
  [WeaponType.LMG]: {
    type: WeaponType.LMG,
    name: 'Metralhadora Leve M249 SAW',
    damage: 21,
    fireRate: 14.5,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 740,
    spread: 0.09,
    piercing: 2,
    color: '#eab308',
    unlocked: false,
  },
  [WeaponType.SNIPER]: {
    type: WeaponType.SNIPER,
    name: 'Fuzil Sniper .50 BMG',
    damage: 165,
    fireRate: 1.1,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 1350,
    spread: 0.005,
    piercing: 5,
    color: '#fde047',
    unlocked: false,
  },
  [WeaponType.DESTRUCTOR]: {
    type: WeaponType.DESTRUCTOR,
    name: 'Nave Destructor',
    damage: 44,
    fireRate: 16,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 1800,
    spread: 0,
    piercing: 99,
    color: '#22d3ee',
    unlocked: false,
  },
  [WeaponType.INTERCEPTOR]: {
    type: WeaponType.INTERCEPTOR,
    name: 'Nave Interceptor',
    damage: 20,
    fireRate: 24,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 1250,
    spread: 0.025,
    piercing: 2,
    color: '#00f5d4',
    unlocked: false,
  },
  [WeaponType.NAVE_REI]: {
    type: WeaponType.NAVE_REI,
    name: 'Nave Rei',
    damage: 52,
    fireRate: 18,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 2000,
    spread: 0,
    piercing: 99,
    color: '#ef4444',
    unlocked: false,
  },
  [WeaponType.EAST_DRAGON]: {
    type: WeaponType.EAST_DRAGON,
    name: 'East Dragon',
    damage: 50,
    fireRate: 20,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 2000,
    spread: 0,
    piercing: 99,
    color: '#f97316',
    unlocked: false,
  },
  [WeaponType.IRON_MAN]: {
    type: WeaponType.IRON_MAN,
    name: 'Homem de Ferro',
    damage: 48,
    fireRate: 10,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 1350,
    spread: 0.02,
    piercing: 3,
    color: '#ef4444',
    unlocked: false,
  },
  [WeaponType.ICE_AND_FIRE_DRAGON]: {
    type: WeaponType.ICE_AND_FIRE_DRAGON,
    name: 'Ice and Fire Dragon',
    damage: 62,
    fireRate: 20,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 2000,
    spread: 0,
    piercing: 99,
    color: '#a855f7',
    unlocked: false,
  },
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.ZOMBIE);
  const modeRef = useRef<GameMode>(GameMode.ZOMBIE);
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
  const [highScoreZombie, setHighScoreZombie] = useState<number>(0);
  const [highScoreAlien, setHighScoreAlien] = useState<number>(0);
  const [wave, setWave] = useState(0);
  const [zombiesRemaining, setZombiesRemaining] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundActive, setSoundActive] = useState(isSoundEnabled());
  const [levelUpOptions, setLevelUpOptions] = useState<UpgradeOption[]>([]);
  const [rerollsLeft, setRerollsLeft] = useState<number>(1);
  
  // Single equipped weapon & unlocked arsenal system (Infinite Ammo)
  const [unlockedWeapons, setUnlockedWeapons] = useState<WeaponType[]>([WeaponType.PISTOL]);
  const [equippedWeapon, setEquippedWeapon] = useState<WeaponType>(WeaponType.PISTOL);


  // Slow-motion dramatic death collapse ref
  const dyingRef = useRef<DyingState | null>(null);

  // Heartbeat pulse ref for visceral low health feedback
  const lastHeartbeatRef = useRef<number>(0);
  
  const [coins, setCoins] = useState<number>(0);
  const [activeBoss, setActiveBoss] = useState<ActiveBossInfo | null>(null);
  const lastBossHudSyncRef = useRef<{ id: string | null; hp: number; ts: number }>({
    id: null,
    hp: -1,
    ts: 0,
  });
  const [maxShieldLevel, setMaxShieldLevel] = useState<number>(0);
  const [maxHealthLevel, setMaxHealthLevel] = useState<number>(0);
  const [speedLevel, setSpeedLevel] = useState<number>(0);
  const [damageLevel, setDamageLevel] = useState<number>(0);
  const [luckLevel, setLuckLevel] = useState<number>(0);

  // Prestige, Tokens & Ship Mastery Systems
  const [prestigeLevel, setPrestigeLevel] = useState<number>(0);
  const prestigeRef = useRef<number>(0);
  const [tokens, setTokens] = useState<number>(0);
  const [tokenUpgrades, setTokenUpgrades] = useState<Record<TokenUpgradeId, number>>({ ...DEFAULT_TOKEN_UPGRADES });
  const tokenUpgradesRef = useRef<Record<TokenUpgradeId, number>>({ ...DEFAULT_TOKEN_UPGRADES });
  const [shipMastery, setShipMastery] = useState<AllShipMasteryState>(
    JSON.parse(JSON.stringify(DEFAULT_SHIP_MASTERY))
  );
  const shipMasteryRef = useRef<AllShipMasteryState>(
    JSON.parse(JSON.stringify(DEFAULT_SHIP_MASTERY))
  );
  const masterySkillCooldownRef = useRef<number>(0);
  const masteryCombatTimersRef = useRef({
    orbitalBurnTimer: 0,
    reiStormTimer: 0,
    orbBurstCount: 0,
  });
  const [masterySkillHud, setMasterySkillHud] = useState({
    available: false,
    name: '',
    cooldown: 0,
    maxCooldown: 8,
    shipColor: '#22d3ee',
  });

  // DOM Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Input states (Joysticks)
  const leftJoystick = useRef<JoystickInput>({ x: 0, y: 0, active: false });
  const rightJoystick = useRef<JoystickInput>({ x: 0, y: 0, active: false });

  // Desktop Fallback Inputs
  const keysPressed = useRef<Record<string, boolean>>({});
  const mousePos = useRef({ x: 0, y: 0 });
  const hasMouseMovedRef = useRef(false);
  const isMouseDown = useRef(false);
  const mobileWarpHoldingRef = useRef(false);

  // Ship State shared by Destructor, Interceptor & Nave Rei (±30° gimbal blasters, smooth turning, Warp/Fury)
  const destructorStateRef = useRef({
    leftBlasterAngle: 0,
    rightBlasterAngle: 0,
    leftMuzzleX: ARENA_SIZE / 2,
    leftMuzzleY: ARENA_SIZE / 2,
    rightMuzzleX: ARENA_SIZE / 2,
    rightMuzzleY: ARENA_SIZE / 2,
    reiBlasters: [] as ReiBlasterMount[],
    isFiring: false,
    laserChargeProgress: 0,
    beamTickTimer: 0,
    beamSoundTimer: 0,
    warpChargeTimer: 0,
    warpActive: false,
    warpTimer: 0,
    warpSoundTimer: 0,
    orbitAngle: 0,
    hudSyncTimer: 0,
    angularVel: 0,
    leftTrail: [] as ThrusterTrailPoint[],
    rightTrail: [] as ThrusterTrailPoint[],
  });
  const DRAGON_SEGMENT_COUNT = 18;
  const DRAGON_SEGMENT_SPACING = 11.5;
  const createInitialDragonSegments = (hx: number, hy: number): DragonSegment[] =>
    Array.from({ length: DRAGON_SEGMENT_COUNT }, (_, idx) => ({
      x: hx - (idx + 1) * DRAGON_SEGMENT_SPACING,
      y: hy,
      angle: 0,
    }));
  const eastDragonStateRef = useRef({
    segments: createInitialDragonSegments(ARENA_SIZE / 2, ARENA_SIZE / 2),
    isFiring: false,
    beamExtension: 0,
    muzzleX: ARENA_SIZE / 2 + 26,
    muzzleY: ARENA_SIZE / 2,
    beamEndX: ARENA_SIZE / 2 + 980,
    beamEndY: ARENA_SIZE / 2,
    beamTickTimer: 0,
    beamSoundTimer: 0,
    emberTimer: 0,
  });
  const ironManStateRef = useRef({
    mode: 'REPULSOR' as 'REPULSOR' | 'LASER',
    isFiring: false,
    laserChargeProgress: 0,
    beamTickTimer: 0,
    beamSoundTimer: 0,
    repulsorTimer: 0,
    handToggle: 0,
    muzzleX: ARENA_SIZE / 2 + 20,
    muzzleY: ARENA_SIZE / 2,
    beamEndX: ARENA_SIZE / 2 + 950,
    beamEndY: ARENA_SIZE / 2,
    trail: [] as ThrusterTrailPoint[],
  });
  const [ironManModeHud, setIronManModeHud] = useState<'REPULSOR' | 'LASER'>('REPULSOR');
  const ICE_FIRE_MERGE_DURATION = 10.0;
  const ICE_FIRE_MERGE_COOLDOWN = 10.0;
  const createCompanionDragonSegments = (
    hx: number,
    hy: number,
    count: number,
    spacing: number
  ): DragonSegment[] =>
    Array.from({ length: count }, (_, idx) => ({
      x: hx - (idx + 1) * spacing,
      y: hy,
      angle: 0,
    }));
  const iceFireDragonStateRef = useRef({
    activeDragon: 'FIRE' as 'FIRE' | 'ICE',
    merged: false,
    mergeTimer: 0,
    mergeCooldown: 0,
    fireHead: { x: ARENA_SIZE / 2 + 24, y: ARENA_SIZE / 2 - 34, angle: 0 },
    fireSegments: createCompanionDragonSegments(ARENA_SIZE / 2 + 24, ARENA_SIZE / 2 - 34, 14, 10),
    iceHead: { x: ARENA_SIZE / 2 - 24, y: ARENA_SIZE / 2 + 42, angle: 0 },
    iceSegments: createCompanionDragonSegments(ARENA_SIZE / 2 - 24, ARENA_SIZE / 2 + 42, 14, 10),
    megaHead: { x: ARENA_SIZE / 2 + 44, y: ARENA_SIZE / 2, angle: 0 },
    megaSegments: createCompanionDragonSegments(ARENA_SIZE / 2 + 44, ARENA_SIZE / 2, 20, 15.5),
    isFiring: false,
    beamExtension: 0,
    muzzleX: ARENA_SIZE / 2 + 48,
    muzzleY: ARENA_SIZE / 2 - 34,
    beamEndX: ARENA_SIZE / 2 + 1000,
    beamEndY: ARENA_SIZE / 2 - 34,
    beamTickTimer: 0,
    beamSoundTimer: 0,
    emberTimer: 0,
    hudSyncTimer: 0,
  });
  const [iceFireDragonHud, setIceFireDragonHud] = useState({
    activeDragon: 'FIRE' as 'FIRE' | 'ICE',
    merged: false,
    mergeTimer: 0,
    mergeDuration: ICE_FIRE_MERGE_DURATION,
    cooldown: 0,
    maxCooldown: ICE_FIRE_MERGE_COOLDOWN,
  });
  const [destructorWarpHud, setDestructorWarpHud] = useState({
    chargeProgress: 0,
    active: false,
    remainingRatio: 0,
    remainingSeconds: 0,
    chargeDuration: 3.0,
  });

  // Active Mythic & Legendary runtime combat tracking
  const mythicCombatRef = useRef({
    orbitalAngle: 0,
    orbitalHitCooldowns: {} as Record<string, number>,
    novaShotCounter: 0,
    solarBurnTimer: 0,
    gravityPulseTimer: 0,
    chainLightningCooldowns: {} as Record<string, number>,
    destructorSplitCounter: 0,
    voidDrones: [
      { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2, angle: 0, fireTimer: 0.2 },
      { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2, angle: 0, fireTimer: 0.4 },
      { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2, angle: 0, fireTimer: 0.6 },
    ] as VoidDroneState[],
  });

  // Core Game Entities (stored in refs for high-performance access in the frame loop)
  const playerRef = useRef<Player>({
    x: ARENA_SIZE / 2,
    y: ARENA_SIZE / 2,
    radius: 18,
    angle: 0,
    speed: 180, // pixels per second
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpNeeded: 100,
    level: 1,
    score: 0,
    kills: 0,
    currentWeapon: WeaponType.PISTOL,
    weapons: JSON.parse(JSON.stringify(INITIAL_WEAPONS)),
    shield: 0,
    maxShield: 0,
    lastShotTime: 0,
    vx: 0,
    vy: 0,
    hotbar: [WeaponType.PISTOL, null, null],
    inventory: [null, null, null, null, null, null, null, null],
    equippedSkin: 'skin_default',
    unlockedSkins: ['skin_default'],
  });

  const zombiesRef = useRef<Zombie[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bloodSplatsRef = useRef<BloodSplat[]>([]);
  const itemDropsRef = useRef<ItemDrop[]>([]);
  const flameStreamRef = useRef<FlameStreamPoint[]>([]);

  // Wave manager ref
  const waveActiveRef = useRef(false);
  const waveSpawnTimerRef = useRef<number | null>(null);

  // Camera coordinates (follows player smoothly)
  const cameraRef = useRef({ x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 });
  const screenShakeRef = useRef(0);
  const muzzleFlashIntensityRef = useRef(0);
  const gunRecoilRef = useRef(0);
  const dynamicSpreadRef = useRef(0);

  // To update React HUD efficiently without forcing re-renders on every animation frame,
  // we push player state to a React state occasionally (or sync on specific events)
  const [hudPlayer, setHudPlayer] = useState<Player>({ ...playerRef.current });

  // Load high score, unlocked arsenal, and upgrades data
  useEffect(() => {
    // Load active game mode
    const savedMode = localStorage.getItem('zombie_shooter_active_mode') as GameMode | null;
    if (savedMode === GameMode.ALIEN || savedMode === GameMode.ZOMBIE) {
      setCurrentMode(savedMode);
      modeRef.current = savedMode;
    }

    // Load high scores per mode
    const savedGeneral = localStorage.getItem('zombie_shooter_highscore');
    const savedZombie = localStorage.getItem('zombie_shooter_highscore_zombie');
    const savedAlien = localStorage.getItem('zombie_shooter_highscore_alien');

    const zombieScore = savedZombie ? parseInt(savedZombie, 10) : savedGeneral ? parseInt(savedGeneral, 10) : 0;
    const alienScore = savedAlien ? parseInt(savedAlien, 10) : 0;

    setHighScoreZombie(zombieScore);
    setHighScoreAlien(alienScore);
    const activeScore = (savedMode === GameMode.ALIEN ? alienScore : zombieScore) || (savedGeneral ? parseInt(savedGeneral, 10) : 0);
    setHighScore(activeScore);
    
    // Load or migrate unlocked weapons
    const savedUnlocked = localStorage.getItem('zombie_shooter_unlocked_weapons');
    let initialUnlocked: WeaponType[] = [WeaponType.PISTOL];
    if (savedUnlocked) {
      try {
        const parsed = JSON.parse(savedUnlocked);
        if (Array.isArray(parsed)) {
          initialUnlocked = parsed.filter((wt: WeaponType) => INITIAL_WEAPONS[wt] !== undefined);
        }
      } catch (e) {
        initialUnlocked = [WeaponType.PISTOL];
      }
    }
    if (!initialUnlocked.includes(WeaponType.PISTOL)) {
      initialUnlocked.push(WeaponType.PISTOL);
    }
    setUnlockedWeapons(initialUnlocked);

    // Load equipped weapon
    const savedEquipped = localStorage.getItem('zombie_shooter_equipped_weapon') as WeaponType | null;
    if (savedEquipped && INITIAL_WEAPONS[savedEquipped] && initialUnlocked.includes(savedEquipped)) {
      setEquippedWeapon(savedEquipped);
      playerRef.current.currentWeapon = savedEquipped;
    } else {
      setEquippedWeapon(WeaponType.PISTOL);
      playerRef.current.currentWeapon = WeaponType.PISTOL;
      localStorage.setItem('zombie_shooter_equipped_weapon', WeaponType.PISTOL);
    }

    const savedCoins = localStorage.getItem('zombie_shooter_coins');
    if (savedCoins) {
      setCoins(parseInt(savedCoins, 10));
    } else {
      setCoins(1000);
      localStorage.setItem('zombie_shooter_coins', '1000');
    }

    const savedShieldLvl = localStorage.getItem('zombie_shooter_shield_level');
    if (savedShieldLvl) {
      setMaxShieldLevel(parseInt(savedShieldLvl, 10));
    }
    const savedHealthLvl = localStorage.getItem('zombie_shooter_health_level');
    if (savedHealthLvl) {
      setMaxHealthLevel(parseInt(savedHealthLvl, 10));
    }
    const savedSpeedLvl = localStorage.getItem('zombie_shooter_speed_level');
    if (savedSpeedLvl) {
      setSpeedLevel(parseInt(savedSpeedLvl, 10));
    }
    const savedDamageLvl = localStorage.getItem('zombie_shooter_damage_level');
    if (savedDamageLvl) {
      setDamageLevel(parseInt(savedDamageLvl, 10));
    }
    const savedLuckLvl = localStorage.getItem('zombie_shooter_luck_level');
    if (savedLuckLvl) {
      setLuckLevel(parseInt(savedLuckLvl, 10));
    }

    const savedPrestige = localStorage.getItem('zombie_shooter_prestige');
    if (savedPrestige) {
      const pVal = Math.max(0, Math.min(MAX_PRESTIGE, parseInt(savedPrestige, 10) || 0));
      setPrestigeLevel(pVal);
      prestigeRef.current = pVal;
    }

    const savedTokens = localStorage.getItem('zombie_shooter_tokens');
    if (savedTokens) {
      setTokens(Math.max(0, parseInt(savedTokens, 10) || 0));
    }

    const savedTokenUpg = localStorage.getItem('zombie_shooter_token_upgrades');
    if (savedTokenUpg) {
      try {
        const parsed = JSON.parse(savedTokenUpg);
        const merged = { ...DEFAULT_TOKEN_UPGRADES, ...parsed };
        setTokenUpgrades(merged);
        tokenUpgradesRef.current = merged;
      } catch (e) {
        // fallback defaults
      }
    }

    const savedMastery = localStorage.getItem('zombie_shooter_ship_mastery');
    if (savedMastery) {
      try {
        const parsed = JSON.parse(savedMastery);
        const merged: AllShipMasteryState = {
          DESTRUCTOR: parsed.DESTRUCTOR || { xp: 0, unlockedNodes: [] },
          INTERCEPTOR: parsed.INTERCEPTOR || { xp: 0, unlockedNodes: [] },
          NAVE_REI: parsed.NAVE_REI || { xp: 0, unlockedNodes: [] },
        };
        setShipMastery(merged);
        shipMasteryRef.current = merged;
      } catch (e) {
        // fallback defaults
      }
    }

  }, []);

  const updateCoins = (amount: number) => {
    setCoins((prev) => {
      const next = Math.max(0, prev + amount);
      localStorage.setItem('zombie_shooter_coins', next.toString());
      return next;
    });
  };

  const handleAddTestCoins = () => {
    updateCoins(1000);
  };

  // Weapon purchase: unlocks weapon and equips it immediately
  const handleBuyWeapon = (weaponType: WeaponType, price: number): boolean => {
    updateCoins(-price);

    setUnlockedWeapons((prev) => {
      const updated = prev.includes(weaponType) ? prev : [...prev, weaponType];
      localStorage.setItem('zombie_shooter_unlocked_weapons', JSON.stringify(updated));
      return updated;
    });

    // Auto-equip purchased weapon
    handleEquipWeapon(weaponType);
    return true;
  };

  // Equip weapon directly
  const handleEquipWeapon = (weaponType: WeaponType) => {
    setEquippedWeapon(weaponType);
    localStorage.setItem('zombie_shooter_equipped_weapon', weaponType);
    playerRef.current.currentWeapon = weaponType;
    if (playerRef.current.weapons[weaponType]) {
      playerRef.current.weapons[weaponType].unlocked = true;
    }
    if (weaponType === WeaponType.ICE_AND_FIRE_DRAGON) {
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      const ifd = iceFireDragonStateRef.current;
      ifd.fireHead = { x: px + 24, y: py - 34, angle: playerRef.current.angle };
      ifd.fireSegments = createCompanionDragonSegments(px + 24, py - 34, 14, 10);
      ifd.iceHead = { x: px - 24, y: py + 42, angle: playerRef.current.angle };
      ifd.iceSegments = createCompanionDragonSegments(px - 24, py + 42, 14, 10);
      ifd.megaHead = { x: px + 44, y: py, angle: playerRef.current.angle };
      ifd.megaSegments = createCompanionDragonSegments(px + 44, py, 20, 15.5);
    }
    syncHudPlayer();
    sound.playPowerup();
  };

  const handleBuyShieldUpgrade = () => {
    const cost = (maxShieldLevel + 1) * 250;
    updateCoins(-cost);
    setMaxShieldLevel((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_shield_level', next.toString());
      return next;
    });
  };

  const handleBuyHealthUpgrade = () => {
    const cost = (maxHealthLevel + 1) * 200;
    updateCoins(-cost);
    setMaxHealthLevel((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_health_level', next.toString());
      return next;
    });
  };

  const handleBuySpeedUpgrade = () => {
    const cost = (speedLevel + 1) * 250;
    updateCoins(-cost);
    setSpeedLevel((prev) => {
      const next = Math.min(5, prev + 1);
      localStorage.setItem('zombie_shooter_speed_level', next.toString());
      return next;
    });
  };

  const handleBuyDamageUpgrade = () => {
    const cost = (damageLevel + 1) * 350;
    updateCoins(-cost);
    setDamageLevel((prev) => {
      const next = Math.min(5, prev + 1);
      localStorage.setItem('zombie_shooter_damage_level', next.toString());
      return next;
    });
  };

  const handleBuyLuckUpgrade = () => {
    const cost = (luckLevel + 1) * 300;
    updateCoins(-cost);
    setLuckLevel((prev) => {
      const next = Math.min(5, prev + 1);
      localStorage.setItem('zombie_shooter_luck_level', next.toString());
      return next;
    });
  };

  const handleOpenStore = () => {
    setGameState(GameState.STORE);
  };

  const handleCloseStore = () => {
    setGameState(GameState.MENU);
  };

  const handleOpenPrestige = () => {
    setGameState(GameState.PRESTIGE);
  };

  const handleOpenMastery = () => {
    setGameState(GameState.MASTERY);
  };

  const handleAscendPrestige = (): boolean => {
    if (prestigeLevel >= MAX_PRESTIGE) return false;
    const cost = getPrestigeCost(prestigeLevel);
    if (coins < cost) return false;
    updateCoins(-cost);
    const nextP = prestigeLevel + 1;
    setPrestigeLevel(nextP);
    prestigeRef.current = nextP;
    localStorage.setItem('zombie_shooter_prestige', nextP.toString());
    setTokens((prev) => {
      const nextT = prev + 1;
      localStorage.setItem('zombie_shooter_tokens', nextT.toString());
      return nextT;
    });
    return true;
  };

  const handleBuyTokenUpgrade = (id: TokenUpgradeId): boolean => {
    const def = TOKEN_UPGRADES.find((u) => u.id === id);
    if (!def) return false;
    const curLvl = tokenUpgrades[id] || 0;
    if (curLvl >= def.maxLevel || tokens < def.costPerLevel) return false;

    setTokens((prev) => {
      const nextT = Math.max(0, prev - def.costPerLevel);
      localStorage.setItem('zombie_shooter_tokens', nextT.toString());
      return nextT;
    });
    setTokenUpgrades((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      tokenUpgradesRef.current = next;
      localStorage.setItem('zombie_shooter_token_upgrades', JSON.stringify(next));
      return next;
    });
    return true;
  };

  const handleRespecTokens = () => {
    const spent = (Object.values(tokenUpgrades) as number[]).reduce(
      (acc: number, v: number) => acc + (Number(v) || 0),
      0
    );
    if (spent <= 0) return;
    setTokens((prev) => {
      const nextT = prev + spent;
      localStorage.setItem('zombie_shooter_tokens', nextT.toString());
      return nextT;
    });
    const resetUpg = { ...DEFAULT_TOKEN_UPGRADES };
    setTokenUpgrades(resetUpg);
    tokenUpgradesRef.current = resetUpg;
    localStorage.setItem('zombie_shooter_token_upgrades', JSON.stringify(resetUpg));
  };

  const addShipMasteryXp = useCallback((ship: ShipTypeKey, xpGain: number) => {
    if (xpGain <= 0) return;
    setShipMastery((prev) => {
      const cur = prev[ship] || { xp: 0, unlockedNodes: [] };
      const next: AllShipMasteryState = {
        ...prev,
        [ship]: { ...cur, xp: cur.xp + xpGain },
      };
      shipMasteryRef.current = next;
      localStorage.setItem('zombie_shooter_ship_mastery', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleUnlockMasteryNode = (ship: ShipTypeKey, nodeId: string): boolean => {
    const node = SHIP_MASTERY_NODES[ship]?.find((n) => n.id === nodeId);
    if (!node) return false;
    if (!canUnlockMasteryNode(shipMastery, ship, node)) return false;

    setShipMastery((prev) => {
      const cur = prev[ship] || { xp: 0, unlockedNodes: [] };
      const next: AllShipMasteryState = {
        ...prev,
        [ship]: {
          ...cur,
          unlockedNodes: [...cur.unlockedNodes, nodeId],
        },
      };
      shipMasteryRef.current = next;
      localStorage.setItem('zombie_shooter_ship_mastery', JSON.stringify(next));
      return next;
    });
    return true;
  };

  const handleResetMasteryTree = (ship: ShipTypeKey) => {
    setShipMastery((prev) => {
      const cur = prev[ship] || { xp: 0, unlockedNodes: [] };
      const next: AllShipMasteryState = {
        ...prev,
        [ship]: { ...cur, unlockedNodes: [] },
      };
      shipMasteryRef.current = next;
      localStorage.setItem('zombie_shooter_ship_mastery', JSON.stringify(next));
      return next;
    });
  };

  const handleTrainShipMastery = (ship: ShipTypeKey): boolean => {
    if (coins < TRAIN_MASTERY_CREDIT_COST) return false;
    updateCoins(-TRAIN_MASTERY_CREDIT_COST);
    addShipMasteryXp(ship, TRAIN_MASTERY_XP_GAIN);
    return true;
  };

  const syncMasterySkillHud = useCallback((wt: WeaponType, cd: number) => {
    const shipKey: ShipTypeKey | null =
      wt === WeaponType.DESTRUCTOR
        ? 'DESTRUCTOR'
        : wt === WeaponType.INTERCEPTOR
          ? 'INTERCEPTOR'
          : wt === WeaponType.NAVE_REI
            ? 'NAVE_REI'
            : null;
    if (!shipKey) {
      setMasterySkillHud((prev) => (prev.available ? { ...prev, available: false } : prev));
      return;
    }
    const skillNodeId =
      shipKey === 'DESTRUCTOR'
        ? 'dest_pulse_skill'
        : shipKey === 'INTERCEPTOR'
          ? 'int_supersonic_skill'
          : 'rei_judgement_skill';
    const unlocked = hasMasteryNode(shipMasteryRef.current, shipKey, skillNodeId);
    const meta = SHIP_META[shipKey];
    setMasterySkillHud({
      available: unlocked,
      name: meta.activeSkillName,
      cooldown: Math.max(0, cd),
      maxCooldown: meta.activeSkillCooldown,
      shipColor: meta.accentColor,
    });
  }, []);

  const triggerShipMasterySkill = useCallback(() => {
    if (gameState !== GameState.PLAYING || dyingRef.current?.active) return;
    if (masterySkillCooldownRef.current > 0) return;

    const p = playerRef.current;
    const shipKey: ShipTypeKey | null =
      p.currentWeapon === WeaponType.DESTRUCTOR
        ? 'DESTRUCTOR'
        : p.currentWeapon === WeaponType.INTERCEPTOR
          ? 'INTERCEPTOR'
          : p.currentWeapon === WeaponType.NAVE_REI
            ? 'NAVE_REI'
            : null;
    if (!shipKey) return;

    const skillNodeId =
      shipKey === 'DESTRUCTOR'
        ? 'dest_pulse_skill'
        : shipKey === 'INTERCEPTOR'
          ? 'int_supersonic_skill'
          : 'rei_judgement_skill';

    if (!hasMasteryNode(shipMasteryRef.current, shipKey, skillNodeId)) return;

    const meta = SHIP_META[shipKey];
    masterySkillCooldownRef.current = meta.activeSkillCooldown;
    sound.playMasterySkill(shipKey);
    screenShakeRef.current = Math.min(28, screenShakeRef.current + 14);

    if (shipKey === 'DESTRUCTOR') {
      // Pulso de Sobrecarga: 260px EMP blast + heavy damage + 1.6s stun
      const dw = p.weapons[WeaponType.DESTRUCTOR] || INITIAL_WEAPONS[WeaponType.DESTRUCTOR];
      const pulseDmg = Math.max(110, Math.round(dw.damage * 4.2));
      particlesRef.current.push({
        id: `dest-emp-${Date.now()}`,
        type: 'PLASMA_RING',
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        radius: 26,
        growthSpeed: 620,
        color: '#22d3ee',
        alpha: 1,
        decay: 0.045,
      });
      for (let zi = 0; zi < zombiesRef.current.length; zi++) {
        const z = zombiesRef.current[zi];
        if (z.hp <= 0) continue;
        const dist = Math.hypot(z.x - p.x, z.y - p.y);
        if (dist <= 275 + z.radius) {
          z.hp -= pulseDmg;
          const pa = Math.atan2(z.y - p.y, z.x - p.x);
          z.knockbackX += Math.cos(pa) * 480;
          z.knockbackY += Math.sin(pa) * 480;
          z.isStunned = true;
          z.stunTimer = Math.max(z.stunTimer, 1.6);
        }
      }
    } else if (shipKey === 'INTERCEPTOR') {
      // Rajada Supersônica: 14 piercing 360° orbs + +35 shield (or +20 HP)
      const iw = p.weapons[WeaponType.INTERCEPTOR] || INITIAL_WEAPONS[WeaponType.INTERCEPTOR];
      const orbDmg = Math.max(45, Math.round(iw.damage * 2.4));
      for (let i = 0; i < 14; i++) {
        const a = (i * Math.PI * 2) / 14 + p.angle;
        bulletsRef.current.push({
          id: `int-skill-orb-${Date.now()}-${i}-${Math.random()}`,
          x: p.x + Math.cos(a) * 24,
          y: p.y + Math.sin(a) * 24,
          vx: Math.cos(a) * 1150,
          vy: Math.sin(a) * 1150,
          radius: 7,
          damage: orbDmg,
          piercingRemaining: 5,
          color: '#00f5d4',
          distanceTraveled: 0,
          maxDistance: 860,
          ownerAngle: a,
          isOrb: true,
          homingStrength: 3.0,
        });
      }
      if (p.maxShield > 0) {
        p.shield = Math.min(p.maxShield, p.shield + 35);
      } else {
        p.hp = Math.min(p.maxHp, p.hp + 20);
      }
      particlesRef.current.push({
        id: `int-skill-ring-${Date.now()}`,
        type: 'RAY_RING',
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        radius: 22,
        growthSpeed: 540,
        color: '#00f5d4',
        alpha: 0.95,
        decay: 0.055,
      });
    } else {
      // Julgamento Real: 8 crimson lightning strikes on closest enemies within 450px
      const rw = p.weapons[WeaponType.NAVE_REI] || INITIAL_WEAPONS[WeaponType.NAVE_REI];
      const strikeDmg = Math.max(180, Math.round(rw.damage * 4.8));
      const candidates = zombiesRef.current
        .filter((z) => z.hp > 0 && Math.hypot(z.x - p.x, z.y - p.y) <= 460)
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
        .slice(0, 8);

      for (let si = 0; si < candidates.length; si++) {
        const tgt = candidates[si];
        tgt.hp -= strikeDmg;
        tgt.isStunned = true;
        tgt.stunTimer = Math.max(tgt.stunTimer, 0.9);
        const arcPts: { x: number; y: number }[] = [];
        for (let s = 1; s <= 4; s++) {
          const frac = s / 4;
          const jitter = s === 4 ? 0 : 18;
          arcPts.push({
            x: p.x + (tgt.x - p.x) * frac + (Math.random() - 0.5) * jitter,
            y: p.y + (tgt.y - p.y) * frac + (Math.random() - 0.5) * jitter,
          });
        }
        particlesRef.current.push({
          id: `rei-judge-${Date.now()}-${si}-${Math.random()}`,
          type: 'ENERGY_ARC',
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: 3.2,
          color: '#ef4444',
          alpha: 1,
          decay: 0.12,
          points: arcPts,
        });
        particlesRef.current.push({
          id: `rei-jring-${Date.now()}-${si}-${Math.random()}`,
          type: 'FIRE_RING',
          x: tgt.x,
          y: tgt.y,
          vx: 0,
          vy: 0,
          radius: 10,
          growthSpeed: 320,
          color: '#ef4444',
          alpha: 0.95,
          decay: 0.06,
        });
      }
    }

    syncMasterySkillHud(p.currentWeapon, masterySkillCooldownRef.current);
  }, [gameState, syncMasterySkillHud]);

  const triggerShipMasterySkillRef = useRef(triggerShipMasterySkill);
  triggerShipMasterySkillRef.current = triggerShipMasterySkill;

  const toggleIronManMode = useCallback(() => {
    if (gameState !== GameState.PLAYING || dyingRef.current?.active) return;
    const p = playerRef.current;
    if (p.currentWeapon !== WeaponType.IRON_MAN) return;

    const im = ironManStateRef.current;
    const nextMode: 'REPULSOR' | 'LASER' = im.mode === 'REPULSOR' ? 'LASER' : 'REPULSOR';
    im.mode = nextMode;
    im.laserChargeProgress = 0;
    im.beamTickTimer = 0.04;
    im.repulsorTimer = 0.1;
    setIronManModeHud(nextMode);
    sound.playIronManModeSwitch(nextMode);

    particlesRef.current.push({
      id: `im-switch-${Date.now()}-${Math.random()}`,
      type: 'PLASMA_RING',
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      radius: 16,
      growthSpeed: 320,
      color: nextMode === 'LASER' ? '#ef4444' : '#38bdf8',
      alpha: 0.95,
      decay: 0.06,
    });
  }, [gameState]);

  const toggleIronManModeRef = useRef(toggleIronManMode);
  toggleIronManModeRef.current = toggleIronManMode;

  const switchIceFireDragon = useCallback(() => {
    if (gameState !== GameState.PLAYING || dyingRef.current?.active) return;
    const p = playerRef.current;
    if (p.currentWeapon !== WeaponType.ICE_AND_FIRE_DRAGON) return;

    const ifd = iceFireDragonStateRef.current;
    if (ifd.merged) return;

    const nextDragon: 'FIRE' | 'ICE' = ifd.activeDragon === 'FIRE' ? 'ICE' : 'FIRE';
    ifd.activeDragon = nextDragon;
    ifd.beamTickTimer = 0.04;
    ifd.beamExtension = Math.min(ifd.beamExtension, 0.15);

    const activeHead = nextDragon === 'FIRE' ? ifd.fireHead : ifd.iceHead;
    setIceFireDragonHud({
      activeDragon: nextDragon,
      merged: false,
      mergeTimer: 0,
      mergeDuration: ICE_FIRE_MERGE_DURATION,
      cooldown: ifd.mergeCooldown,
      maxCooldown: ICE_FIRE_MERGE_COOLDOWN,
    });
    sound.playIceFireDragonSwitch(nextDragon);

    particlesRef.current.push({
      id: `ifd-switch-${Date.now()}-${Math.random()}`,
      type: 'PLASMA_RING',
      x: activeHead.x,
      y: activeHead.y,
      vx: 0,
      vy: 0,
      radius: 14,
      growthSpeed: 280,
      color: nextDragon === 'FIRE' ? '#f97316' : '#38bdf8',
      alpha: 0.95,
      decay: 0.06,
    });
  }, [gameState]);

  const switchIceFireDragonRef = useRef(switchIceFireDragon);
  switchIceFireDragonRef.current = switchIceFireDragon;

  const triggerIceFireMerge = useCallback(() => {
    if (gameState !== GameState.PLAYING || dyingRef.current?.active) return;
    const p = playerRef.current;
    if (p.currentWeapon !== WeaponType.ICE_AND_FIRE_DRAGON) return;

    const ifd = iceFireDragonStateRef.current;
    if (ifd.merged || ifd.mergeCooldown > 0) return;

    ifd.merged = true;
    ifd.mergeTimer = ICE_FIRE_MERGE_DURATION;
    ifd.beamExtension = 0.04;
    ifd.beamTickTimer = 0.04;
    ifd.beamSoundTimer = 0.08;

    const midX = (ifd.fireHead.x + ifd.iceHead.x) * 0.5;
    const midY = (ifd.fireHead.y + ifd.iceHead.y) * 0.5;
    ifd.megaHead.x = midX;
    ifd.megaHead.y = midY;
    ifd.megaHead.angle = p.angle;
    ifd.megaSegments = createCompanionDragonSegments(midX, midY, 20, 15.5);

    sound.playMegaDragonFusion();
    screenShakeRef.current = Math.min(24, screenShakeRef.current + 14);

    // Dual-element convergence shockwaves into Mega Purple Dragon
    [
      { x: ifd.fireHead.x, y: ifd.fireHead.y, color: '#f97316' },
      { x: ifd.iceHead.x, y: ifd.iceHead.y, color: '#38bdf8' },
      { x: midX, y: midY, color: '#a855f7' },
    ].forEach((pt, idx) => {
      particlesRef.current.push({
        id: `ifd-merge-ring-${Date.now()}-${idx}-${Math.random()}`,
        type: 'PLASMA_RING',
        x: pt.x,
        y: pt.y,
        vx: 0,
        vy: 0,
        radius: idx === 2 ? 22 : 14,
        growthSpeed: idx === 2 ? 460 : 300,
        color: pt.color,
        alpha: 1,
        decay: 0.045,
      });
    });

    for (let k = 0; k < 22; k++) {
      const sa = (Math.PI * 2 * k) / 22;
      const sp = 95 + Math.random() * 190;
      particlesRef.current.push({
        id: `ifd-merge-sp-${Date.now()}-${k}-${Math.random()}`,
        type: 'SPARK',
        x: midX,
        y: midY,
        vx: Math.cos(sa) * sp,
        vy: Math.sin(sa) * sp,
        radius: 2.6 + Math.random() * 2.5,
        color: k % 3 === 0 ? '#e879f9' : k % 3 === 1 ? '#f97316' : '#38bdf8',
        alpha: 1,
        decay: 0.045,
      });
    }

    setIceFireDragonHud({
      activeDragon: ifd.activeDragon,
      merged: true,
      mergeTimer: ICE_FIRE_MERGE_DURATION,
      mergeDuration: ICE_FIRE_MERGE_DURATION,
      cooldown: 0,
      maxCooldown: ICE_FIRE_MERGE_COOLDOWN,
    });
  }, [gameState]);

  const triggerIceFireMergeRef = useRef(triggerIceFireMerge);
  triggerIceFireMergeRef.current = triggerIceFireMerge;

  // Update HUD player data periodically or on certain events
  const syncHudPlayer = useCallback(() => {
    setHudPlayer({
      ...playerRef.current,
      weapons: { ...playerRef.current.weapons },
    });
  }, []);

  // Set up high score updates per mode
  const updateHighScore = (score: number) => {
    const activeMode = modeRef.current;
    if (activeMode === GameMode.ALIEN) {
      if (score > highScoreAlien) {
        setHighScoreAlien(score);
        localStorage.setItem('zombie_shooter_highscore_alien', score.toString());
      }
    } else {
      if (score > highScoreZombie) {
        setHighScoreZombie(score);
        localStorage.setItem('zombie_shooter_highscore_zombie', score.toString());
      }
    }
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('zombie_shooter_highscore', score.toString());
    }
  };

  const handleSelectMode = (mode: GameMode) => {
    setCurrentMode(mode);
    modeRef.current = mode;
    localStorage.setItem('zombie_shooter_active_mode', mode);
    setHighScore(mode === GameMode.ALIEN ? highScoreAlien : highScoreZombie);
  };

  const handleSelectModeAndPlay = (mode: GameMode) => {
    handleSelectMode(mode);
    setShowModeModal(false);
    handleStartGame();
  };

  // Sound toggle handler
  const handleToggleSound = () => {
    const active = toggleSound();
    setSoundActive(active);
  };

  // Keyboard and mouse event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      
      // Prevent browser scrolling with Space or Arrow keys inside the game
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === GameState.PLAYING) {
          setGameState(GameState.PAUSED);
        } else if (gameState === GameState.PAUSED) {
          setGameState(GameState.PLAYING);
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        if (gameState === GameState.PLAYING) {
          reloadActiveWeapon();
        }
      }

      if ((e.key === 'q' || e.key === 'Q') && !e.repeat) {
        if (gameState === GameState.PLAYING) {
          if (playerRef.current.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON) {
            triggerIceFireMergeRef.current();
          } else {
            triggerShipMasterySkillRef.current();
          }
        }
      }

      if ((key === 'e' || key === 'shift') && !e.repeat) {
        if (gameState === GameState.PLAYING) {
          if (playerRef.current.currentWeapon === WeaponType.IRON_MAN) {
            toggleIronManModeRef.current();
          } else if (key === 'shift' && playerRef.current.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON) {
            switchIceFireDragonRef.current();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Mouse position relative to the canvas coordinate space
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      mousePos.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      hasMouseMovedRef.current = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (gameState === GameState.PLAYING) {
        isMouseDown.current = true;
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const handleWindowBlur = () => {
      keysPressed.current = {};
      isMouseDown.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [gameState]);

  // Handle mobile joystick changes
  const handleLeftJoystick = useCallback((input: JoystickInput) => {
    leftJoystick.current = input;
  }, []);

  const handleRightJoystick = useCallback((input: JoystickInput) => {
    rightJoystick.current = input;
  }, []);

  // Handle mobile Warp / Fúria hold button actions
  const handleWarpStart = useCallback(() => {
    mobileWarpHoldingRef.current = true;
  }, []);

  const handleWarpEnd = useCallback(() => {
    mobileWarpHoldingRef.current = false;
  }, []);

  // Reset/Restart Game
  const initGame = () => {
    // Re-center player and initialize weapons with infinite ammo
    const weapons = JSON.parse(JSON.stringify(INITIAL_WEAPONS));

    const prestigeBonus = getPrestigeBonuses(prestigeRef.current);
    const tUp = tokenUpgradesRef.current;
    const tokenDamageMult = 1 + (tUp.token_might || 0) * 0.18;
    const tokenWealthMult = 1 + (tUp.token_wealth || 0) * 0.35;
    const tokenHpBonus = (tUp.token_vitality || 0) * 40;
    const tokenShieldBonus = (tUp.token_vitality || 0) * 25;
    const tokenFireRateMult = 1 + (tUp.token_haste || 0) * 0.07;
    const tokenSpeedMult = 1 + (tUp.token_haste || 0) * 0.06;
    const tokenCritBonus = (tUp.token_crit_xp || 0) * 0.05;

    const sm = shipMasteryRef.current;

    // Apply damage level + Prestige + Token Might + Token Haste bonuses
    const damageMult = (1 + damageLevel * 0.10) * prestigeBonus.damageMult * tokenDamageMult;
    Object.values(weapons).forEach((w: any) => {
      let wDmgMult = damageMult;
      let wRateMult = tokenFireRateMult;

      if (w.type === WeaponType.DESTRUCTOR && hasMasteryNode(sm, 'DESTRUCTOR', 'dest_core')) {
        wDmgMult *= 1.2;
      }
      if (w.type === WeaponType.INTERCEPTOR && hasMasteryNode(sm, 'INTERCEPTOR', 'int_aero')) {
        wRateMult *= 1.2;
      }
      if (w.type === WeaponType.NAVE_REI && hasMasteryNode(sm, 'NAVE_REI', 'rei_armor')) {
        wDmgMult *= 1.2;
      }

      w.damage = Math.round(w.damage * wDmgMult);
      w.fireRate = Number((w.fireRate * wRateMult).toFixed(2));
      if (unlockedWeapons.includes(w.type)) {
        w.unlocked = true;
      }
      w.currentAmmo = Infinity;
      w.ammoCapacity = Infinity;
    });

    const activeWeapon = unlockedWeapons.includes(equippedWeapon) ? equippedWeapon : WeaponType.PISTOL;
    if (weapons[activeWeapon]) {
      weapons[activeWeapon].unlocked = true;
    }

    const intAeroSpeedMult =
      activeWeapon === WeaponType.INTERCEPTOR && hasMasteryNode(sm, 'INTERCEPTOR', 'int_aero')
        ? 1.15
        : 1.0;
    const reiArmorShieldBonus =
      activeWeapon === WeaponType.NAVE_REI && hasMasteryNode(sm, 'NAVE_REI', 'rei_armor')
        ? 60
        : 0;

    const totalMaxHp = 100 + maxHealthLevel * 15 + tokenHpBonus;
    const totalMaxShield = maxShieldLevel * 20 + tokenShieldBonus + reiArmorShieldBonus;

    playerRef.current = {
      x: ARENA_SIZE / 2,
      y: ARENA_SIZE / 2,
      radius: 18,
      angle: 0,
      speed: 180 * (1 + speedLevel * 0.08) * tokenSpeedMult * intAeroSpeedMult,
      hp: totalMaxHp,
      maxHp: totalMaxHp,
      xp: 0,
      xpNeeded: 100,
      level: 1,
      score: 0,
      kills: 0,
      currentWeapon: activeWeapon,
      weapons: weapons,
      shield: totalMaxShield,
      maxShield: totalMaxShield,
      lastShotTime: 0,
      vx: 0,
      vy: 0,
      unlockedWeapons: [...unlockedWeapons],
      coinsEarned: 0,
      vampirism: 0,
      bonusCoinsMult: prestigeBonus.coinsMult * tokenWealthMult,
      critChance: tokenCritBonus,
      critMultiplier: 2,
      regenHpRate: 0,
      chainLightningLevel: 0,
      gravityPulseLevel: 0,
      mythicSingularity: 0,
      mythicSolarAura: 0,
      mythicSplitShot: 0,
      dodgeChance: 0,
      mythicVoidDrones: 0,
      shatterLevel: 0,
      shieldShockLevel: 0,
      knockbackMult: 1,
      acquiredUpgrades: {},
    };

    masterySkillCooldownRef.current = 0;
    masteryCombatTimersRef.current = {
      orbitalBurnTimer: 0,
      reiStormTimer: 0,
      orbBurstCount: 0,
    };
    syncMasterySkillHud(activeWeapon, 0);

    // Reset dying state
    dyingRef.current = null;

    // Clear list of arrays
    zombiesRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    bloodSplatsRef.current = [];
    itemDropsRef.current = [];
    flameStreamRef.current = [];

    // Reset wave
    setWave(0);
    setZombiesRemaining(0);
    setActiveBoss(null);
    waveActiveRef.current = false;
    if (waveSpawnTimerRef.current) {
      clearTimeout(waveSpawnTimerRef.current);
      waveSpawnTimerRef.current = null;
    }

    cameraRef.current = { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 };

    // Reset Ship state (Destructor / Interceptor / Nave Rei)
    destructorStateRef.current = {
      leftBlasterAngle: 0,
      rightBlasterAngle: 0,
      leftMuzzleX: ARENA_SIZE / 2,
      leftMuzzleY: ARENA_SIZE / 2,
      rightMuzzleX: ARENA_SIZE / 2,
      rightMuzzleY: ARENA_SIZE / 2,
      reiBlasters: [],
      isFiring: false,
      laserChargeProgress: 0,
      beamTickTimer: 0,
      beamSoundTimer: 0,
      warpChargeTimer: 0,
      warpActive: false,
      warpTimer: 0,
      warpSoundTimer: 0,
      orbitAngle: 0,
      hudSyncTimer: 0,
      angularVel: 0,
      leftTrail: [],
      rightTrail: [],
    };
    eastDragonStateRef.current = {
      segments: createInitialDragonSegments(ARENA_SIZE / 2, ARENA_SIZE / 2),
      isFiring: false,
      beamExtension: 0,
      muzzleX: ARENA_SIZE / 2 + 26,
      muzzleY: ARENA_SIZE / 2,
      beamEndX: ARENA_SIZE / 2 + 980,
      beamEndY: ARENA_SIZE / 2,
      beamTickTimer: 0,
      beamSoundTimer: 0,
      emberTimer: 0,
    };
    ironManStateRef.current = {
      mode: 'REPULSOR',
      isFiring: false,
      laserChargeProgress: 0,
      beamTickTimer: 0,
      beamSoundTimer: 0,
      repulsorTimer: 0,
      handToggle: 0,
      muzzleX: ARENA_SIZE / 2 + 20,
      muzzleY: ARENA_SIZE / 2,
      beamEndX: ARENA_SIZE / 2 + 950,
      beamEndY: ARENA_SIZE / 2,
      trail: [],
    };
    setIronManModeHud('REPULSOR');
    iceFireDragonStateRef.current = {
      activeDragon: 'FIRE',
      merged: false,
      mergeTimer: 0,
      mergeCooldown: 0,
      fireHead: { x: ARENA_SIZE / 2 + 24, y: ARENA_SIZE / 2 - 34, angle: 0 },
      fireSegments: createCompanionDragonSegments(ARENA_SIZE / 2 + 24, ARENA_SIZE / 2 - 34, 14, 10),
      iceHead: { x: ARENA_SIZE / 2 - 24, y: ARENA_SIZE / 2 + 42, angle: 0 },
      iceSegments: createCompanionDragonSegments(ARENA_SIZE / 2 - 24, ARENA_SIZE / 2 + 42, 14, 10),
      megaHead: { x: ARENA_SIZE / 2 + 44, y: ARENA_SIZE / 2, angle: 0 },
      megaSegments: createCompanionDragonSegments(ARENA_SIZE / 2 + 44, ARENA_SIZE / 2, 20, 15.5),
      isFiring: false,
      beamExtension: 0,
      muzzleX: ARENA_SIZE / 2 + 48,
      muzzleY: ARENA_SIZE / 2 - 34,
      beamEndX: ARENA_SIZE / 2 + 1000,
      beamEndY: ARENA_SIZE / 2 - 34,
      beamTickTimer: 0,
      beamSoundTimer: 0,
      emberTimer: 0,
      hudSyncTimer: 0,
    };
    setIceFireDragonHud({
      activeDragon: 'FIRE',
      merged: false,
      mergeTimer: 0,
      mergeDuration: ICE_FIRE_MERGE_DURATION,
      cooldown: 0,
      maxCooldown: ICE_FIRE_MERGE_COOLDOWN,
    });
    mobileWarpHoldingRef.current = false;
    setDestructorWarpHud({
      chargeProgress: 0,
      active: false,
      remainingRatio: 0,
      remainingSeconds: 0,
      chargeDuration: 3.0,
    });

    // Reset Mythic active combat state
    mythicCombatRef.current = {
      orbitalAngle: 0,
      orbitalHitCooldowns: {},
      novaShotCounter: 0,
      solarBurnTimer: 0,
      gravityPulseTimer: 0,
      chainLightningCooldowns: {},
      destructorSplitCounter: 0,
      voidDrones: [
        { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2, angle: 0, fireTimer: 0.2 },
        { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2, angle: 0, fireTimer: 0.4 },
        { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2, angle: 0, fireTimer: 0.6 },
      ],
    };

    syncHudPlayer();
  };

  const handleStartGame = () => {
    initGame();
    setGameState(GameState.PLAYING);
    sound.playPowerup();
    startNextWave(1);
  };

  const handlePauseToggle = () => {
    setGameState((prev) => {
      if (prev === GameState.PLAYING) return GameState.PAUSED;
      if (prev === GameState.PAUSED) return GameState.PLAYING;
      return prev;
    });
  };

  const handleRestart = () => {
    const p = playerRef.current;
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
      const runCoins = p.coinsEarned || 0;
      if (runCoins > 0) {
        updateCoins(runCoins);
        updateHighScore(p.score);
      }
    }
    initGame();
    setGameState(GameState.PLAYING);
    sound.playPowerup();
    startNextWave(1);
  };

  const handleGoToMenu = () => {
    const p = playerRef.current;
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
      const runCoins = p.coinsEarned || 0;
      if (runCoins > 0) {
        updateCoins(runCoins);
        updateHighScore(p.score);
      }
    }
    
    initGame();
    setGameState(GameState.MENU);
  };

  const handleSelectWeapon = (weaponType: WeaponType) => {
    handleEquipWeapon(weaponType);
  };

  const handleResetAll = useCallback(() => {
    localStorage.clear();
    setCoins(1000);
    setMaxShieldLevel(0);
    setMaxHealthLevel(0);
    setSpeedLevel(0);
    setDamageLevel(0);
    setLuckLevel(0);
    setUnlockedWeapons([WeaponType.PISTOL]);
    setEquippedWeapon(WeaponType.PISTOL);
    setHighScore(0);
    setHighScoreZombie(0);
    setHighScoreAlien(0);
    setPrestigeLevel(0);
    prestigeRef.current = 0;
    setTokens(0);
    const resetTokenUpg = { ...DEFAULT_TOKEN_UPGRADES };
    setTokenUpgrades(resetTokenUpg);
    tokenUpgradesRef.current = resetTokenUpg;
    const resetMastery = JSON.parse(JSON.stringify(DEFAULT_SHIP_MASTERY));
    setShipMastery(resetMastery);
    shipMasteryRef.current = resetMastery;
    initGame();
    setGameState(GameState.MENU);
  }, []);

  // Spawning Zombies Wave logic
  const startNextWave = (nextWaveNum: number) => {
    if (waveSpawnTimerRef.current) clearTimeout(waveSpawnTimerRef.current);
    
    setWave(nextWaveNum);
    waveActiveRef.current = true;

    const isAlienMode = modeRef.current === GameMode.ALIEN;

    // Calculate number of enemies based on wave
    const count = isAlienMode ? (5 + nextWaveNum * 4) : (6 + nextWaveNum * 4);
    setZombiesRemaining(count);

    // Play mode-specific alert sound (or Boss Alarm on boss waves)
    if (nextWaveNum % 5 === 0) {
      sound.playBossAlarm();
      setTimeout(() => {
        if (isAlienMode) {
          sound.playAlienBossRoar();
        } else {
          sound.playZombieRoar();
        }
      }, 350);
    } else {
      if (isAlienMode) {
        sound.playAlienShoot();
      } else {
        sound.playZombieHit();
      }
    }

    // Spawn enemies spread out around the player outside of screen view
    const p = playerRef.current;
    const canvas = canvasRef.current;
    const viewDist = canvas ? Math.max(canvas.width, canvas.height) / 1.5 : 500;

    const newZombies: Zombie[] = [];
    for (let i = 0; i < count; i++) {
      let type: ZombieType;
      let shootsProjectiles = false;
      let isBoss = false;
      let bossName: string | undefined = undefined;
      let bossTitle: string | undefined = undefined;
      const rand = Math.random();

      // Configure statistics based on mode
      let radius = 16;
      let hp = 25 + nextWaveNum * 4;
      let speed = 75 + Math.random() * 20;
      let damage = 12 + nextWaveNum * 1.5;
      let scoreValue = 100;
      let xpValue = 15;
      let color = '#22c55e';

      if (isAlienMode) {
        // ==========================================
        // MODO ALIEN: APENAS INIMIGOS EXTRATERRESTRES
        // ==========================================
        if (nextWaveNum % 5 === 0 && i === 0) {
          isBoss = true;
          shootsProjectiles = true;
          if (nextWaveNum === 5) {
            // Onda 5: Lorde Overlord Psíquico
            type = ZombieType.ALIEN_OVERLORD;
            bossName = 'LORDE OVERLORD PSÍQUICO';
            bossTitle = 'MENTE-COLMEIA XENO-CEREBRAL';
            radius = 45;
            hp = 480 + nextWaveNum * 100;
            speed = 52;
            damage = 36 + nextWaveNum * 4;
            scoreValue = 1500;
            xpValue = 200;
            color = '#ec4899'; // Bright Magenta
          } else if (nextWaveNum === 10) {
            // Onda 10: Dreadnought Nave-Mãe
            type = ZombieType.ALIEN_DREADNOUGHT;
            bossName = 'DREADNOUGHT NAVE-MÃE';
            bossTitle = 'FORTALEZA DE GUERRA FLUTUANTE';
            radius = 52;
            hp = 950 + nextWaveNum * 130;
            speed = 44;
            damage = 44 + nextWaveNum * 5;
            scoreValue = 2400;
            xpValue = 350;
            color = '#06b6d4'; // Heavy Cyan Warship
          } else {
            // Onda 15+: Leviatã Cósmico Void
            type = ZombieType.ALIEN_LEVIATHAN;
            bossName = 'LEVIATÃ CÓSMICO VOID';
            bossTitle = 'DEVORADOR ESTELAR DO VÁCUO';
            radius = 62;
            hp = 1550 + nextWaveNum * 175;
            speed = 48;
            damage = 54 + nextWaveNum * 6;
            scoreValue = 3800;
            xpValue = 520;
            color = '#a855f7'; // Cosmic Void Purple
          }
        } else if (nextWaveNum >= 4 && rand < 0.25) {
          // Alien Colossus (Armored Tank)
          type = ZombieType.ALIEN_COLOSSUS;
          radius = 28;
          hp = 120 + nextWaveNum * 22;
          speed = 44 + Math.random() * 8;
          damage = 32 + nextWaveNum * 3;
          scoreValue = 420;
          xpValue = 65;
          color = '#6366f1'; // Indigo Bio-Armor
          shootsProjectiles = false;
        } else if (nextWaveNum >= 3 && rand < 0.55) {
          // Alien Shooter (Plasma Blaster Soldier)
          type = ZombieType.ALIEN_SHOOTER;
          radius = 21;
          hp = 85 + nextWaveNum * 12;
          speed = 65 + Math.random() * 15;
          damage = 16 + nextWaveNum * 2;
          scoreValue = 350;
          xpValue = 45;
          color = '#06b6d4'; // Deep Cyan
          shootsProjectiles = true;
        } else if (nextWaveNum >= 2 && rand < 0.80) {
          // Alien Drone (Fast Erratic Swarm Drone)
          type = ZombieType.ALIEN_DRONE;
          radius = 12;
          hp = 22 + nextWaveNum * 3;
          speed = 135 + Math.random() * 25; // Very fast
          damage = 8 + nextWaveNum;
          scoreValue = 180;
          xpValue = 22;
          color = '#c084fc'; // Purple Drone
          shootsProjectiles = true;
        } else {
          // Alien Scout (Fast Plasma Scout)
          type = ZombieType.ALIEN_SCOUT;
          radius = 14;
          hp = 32 + nextWaveNum * 5;
          speed = 115 + Math.random() * 20;
          damage = 10 + nextWaveNum;
          scoreValue = 200;
          xpValue = 25;
          color = '#00ffcc'; // Neon Cyan
          shootsProjectiles = true;
        }
      } else {
        // ==========================================
        // MODO ZUMBI: APENAS INIMIGOS MORTOS-VIVOS
        // ==========================================
        if (nextWaveNum % 5 === 0 && i === 0) {
          isBoss = true;
          if (nextWaveNum === 5) {
            // Onda 5: Tirano Necrótico Alfa
            type = ZombieType.BOSS;
            bossName = 'TIRANO NECRÓTICO ALFA';
            bossTitle = 'ABOMINAÇÃO BIOLÓGICA CLASSE-V';
            radius = 46;
            hp = 440 + nextWaveNum * 90;
            speed = 56;
            damage = 42 + nextWaveNum * 5;
            scoreValue = 1400;
            xpValue = 190;
            color = '#9333ea'; // Purple Necrotic Boss
            shootsProjectiles = false;
          } else if (nextWaveNum === 10) {
            // Onda 10: Golias Açougueiro Pestilento
            type = ZombieType.BOSS_BUTCHER;
            bossName = 'GOLIAS AÇOUGUEIRO PESTILENTO';
            bossTitle = 'CARNICEIRO BLINDADO DEFORMADO';
            radius = 52;
            hp = 920 + nextWaveNum * 125;
            speed = 50;
            damage = 48 + nextWaveNum * 5;
            scoreValue = 2400;
            xpValue = 350;
            color = '#b91c1c'; // Blood Butcher Red
            shootsProjectiles = true; // Throws cleaver shockwaves
          } else {
            // Onda 15+: Necro-Titã Supremo
            type = ZombieType.BOSS_NECROTITAN;
            bossName = 'NECRO-TITÃ SUPREMO';
            bossTitle = 'COLOSSO DA ANIQUILAÇÃO TOTAL';
            radius = 60;
            hp = 1550 + nextWaveNum * 170;
            speed = 46;
            damage = 56 + nextWaveNum * 6;
            scoreValue = 3800;
            xpValue = 520;
            color = '#4c1d95'; // Dark Obsidian Colossus
            shootsProjectiles = true; // Radial bone spikes
          }
        } else if (nextWaveNum >= 3 && rand < 0.22) {
          // Toxic Spitter (Cuspidor Tóxico)
          type = ZombieType.TOXIC_SPITTER;
          radius = 17;
          hp = 36 + nextWaveNum * 6;
          speed = 70 + Math.random() * 15;
          damage = 14 + nextWaveNum * 1.5;
          scoreValue = 220;
          xpValue = 30;
          color = '#84cc16'; // Lime/Toxic Green
          shootsProjectiles = true;
        } else if (nextWaveNum >= 4 && rand < 0.50) {
          // Tank Zombie (Bruto Blindado)
          type = ZombieType.TANK;
          radius = 25;
          hp = 85 + nextWaveNum * 16;
          speed = 45 + Math.random() * 10;
          damage = 26 + nextWaveNum * 3;
          scoreValue = 260;
          xpValue = 38;
          color = '#78350f'; // Dark Brown Rot
          shootsProjectiles = false;
        } else if (nextWaveNum >= 2 && rand < 0.75) {
          // Runner Zombie (Carniçal Corredor)
          type = ZombieType.RUNNER;
          radius = 13;
          hp = 16 + nextWaveNum * 2;
          speed = 140 + Math.random() * 20; // Very fast sprint
          damage = 8 + nextWaveNum;
          scoreValue = 150;
          xpValue = 20;
          color = '#ef4444'; // Red Carniçal
          shootsProjectiles = false;
        } else {
          // Normal Zombie (Infectado Comum)
          type = ZombieType.NORMAL;
          radius = 16;
          hp = 25 + nextWaveNum * 4;
          speed = 75 + Math.random() * 20;
          damage = 12 + nextWaveNum * 1.5;
          scoreValue = 100;
          xpValue = 15;
          color = '#22c55e'; // Rotten Green
          shootsProjectiles = false;
        }
      }

      // Position: Random circle outside player view distance
      const spawnAngle = Math.random() * Math.PI * 2;
      const dist = viewDist + Math.random() * 300;
      let zx = p.x + Math.cos(spawnAngle) * dist;
      let zy = p.y + Math.sin(spawnAngle) * dist;

      // Clamp to arena
      zx = Math.max(radius + 10, Math.min(ARENA_SIZE - radius - 10, zx));
      zy = Math.max(radius + 10, Math.min(ARENA_SIZE - radius - 10, zy));

      newZombies.push({
        id: `zombie-${Date.now()}-${i}-${Math.random()}`,
        type,
        x: zx,
        y: zy,
        radius,
        speed,
        hp,
        maxHp: hp,
        damage,
        scoreValue,
        xpValue,
        color,
        angle: 0,
        lastAttackTime: 0,
        knockbackX: 0,
        knockbackY: 0,
        isStunned: false,
        stunTimer: 0,
        shootsProjectiles,
        isBoss,
        bossName,
        bossTitle,
        lastShootTime: Date.now() + Math.random() * 1500,
      });
    }

    // Set initial active boss for HUD if spawned
    const spawnedBoss = newZombies.find(z => z.isBoss);
    if (spawnedBoss) {
      setActiveBoss({
        id: spawnedBoss.id,
        name: spawnedBoss.bossName || 'CHEFE SUPREMO',
        title: spawnedBoss.bossTitle || 'AMEAÇA DE NÍVEL ALFA',
        hp: Math.round(spawnedBoss.hp),
        maxHp: Math.round(spawnedBoss.maxHp),
        type: spawnedBoss.type,
        color: spawnedBoss.color,
      });
    } else {
      setActiveBoss(null);
    }

    zombiesRef.current = newZombies;
    syncHudPlayer();
  };

  const unlockWeaponFromUpgrade = (weaponType: WeaponType) => {
    setEquippedWeapon(weaponType);
    localStorage.setItem('zombie_shooter_equipped_weapon', weaponType);
    setUnlockedWeapons((prev) => {
      const updated = prev.includes(weaponType) ? prev : [...prev, weaponType];
      localStorage.setItem('zombie_shooter_unlocked_weapons', JSON.stringify(updated));
      return updated;
    });
  };

  // Triggered on level up with dynamic rarity roll
  const handleLevelUp = (currentLvl: number) => {
    setRerollsLeft(1);
    const rolled = rollLevelUpOptions(
      currentLvl,
      { updateCoins, unlockWeapon: unlockWeaponFromUpgrade },
      luckLevel,
      playerRef.current.acquiredUpgrades
    );
    setLevelUpOptions(rolled);
    setGameState(GameState.LEVEL_UP);
  };

  // Reroll upgrade options with audio feedback
  const handleRerollUpgrades = () => {
    if (rerollsLeft <= 0) return;
    setRerollsLeft((prev) => Math.max(0, prev - 1));
    const rolled = rollLevelUpOptions(
      playerRef.current.level,
      { updateCoins, unlockWeapon: unlockWeaponFromUpgrade },
      luckLevel,
      playerRef.current.acquiredUpgrades
    );
    setLevelUpOptions(rolled);
  };

  const handleSelectUpgrade = (option: UpgradeOption) => {
    // Apply the upgrade effect
    const updatedPlayer = option.effect({ ...playerRef.current });
    playerRef.current = updatedPlayer;

    // Deduct XP and scale threshold for next level
    playerRef.current.xp = Math.max(0, playerRef.current.xp - playerRef.current.xpNeeded);
    playerRef.current.xpNeeded = Math.round(playerRef.current.xpNeeded * 1.28 + 20);
    playerRef.current.level += 1;

    syncHudPlayer();

    // Create custom particle burst around player
    const p = playerRef.current;
    const isMythicPick = option.rarity === 'MYTHIC';
    if (isMythicPick) {
      particlesRef.current.push({
        id: `particle-mythic-nova-${Date.now()}-${Math.random()}`,
        type: 'MYTHIC_NOVA',
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        radius: 14,
        growthSpeed: 480,
        color: '#d946ef',
        alpha: 1,
        decay: 0.032,
      });
    }

    for (let i = 0; i < (isMythicPick ? 52 : 36); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 110 + Math.random() * 170;
      particlesRef.current.push({
        id: `particle-lvl-${Date.now()}-${i}-${Math.random()}`,
        type: 'LEVEL_UP',
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 3.5,
        color: isMythicPick
          ? i % 3 === 0
            ? '#38bdf8'
            : i % 3 === 1
            ? '#e879f9'
            : '#fde047'
          : '#facc15',
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
      });
    }

    // Handle multi-level XP rollover cleanly!
    if (playerRef.current.xp >= playerRef.current.xpNeeded) {
      handleLevelUp(playerRef.current.level);
      return;
    }

    // Unpause game back into combat
    setGameState(GameState.PLAYING);
  };

  // Spawning powerups/drops
  const spawnItemDrop = (x: number, y: number) => {
    // 30% chance to drop a consumable on zombie death
    if (Math.random() > 0.35) return;

    const rand = Math.random();
    let type = DropType.HEALTH;
    let color = '#10b981'; // Green
    
    const p = playerRef.current;

    // Determine drop type
    if (rand < 0.30) {
      type = DropType.HEALTH;
      color = '#10b981'; // Green (Health)
    } else if (rand < 0.55) {
      type = DropType.AMMO;
      color = '#ef4444'; // Red (Ammo)
    } else if (rand < 0.80) {
      type = DropType.PISTOL_CLIP;
      color = '#fbbf24'; // Yellow/Gold (Pistol Clip)
    } else if (p.maxShield > 0 && rand < 0.9) {
      type = DropType.SHIELD;
      color = '#22d3ee'; // Cyan (Shield)
    } else {
      // Small chance to drop an actual weapon if they are locked!
      const lockedWeapons = [];
      if (!p.weapons[WeaponType.SHOTGUN].unlocked) lockedWeapons.push(DropType.WEAPON_SHOTGUN);
      if (!p.weapons[WeaponType.MACHINE_GUN].unlocked) lockedWeapons.push(DropType.WEAPON_MACHINE_GUN);
      if (!p.weapons[WeaponType.PLASMA_RIFLE].unlocked) lockedWeapons.push(DropType.WEAPON_PLASMA_RIFLE);
      if (!p.weapons[WeaponType.MINIGUN].unlocked) lockedWeapons.push(DropType.WEAPON_MINIGUN);
      if (!p.weapons[WeaponType.ROCKET_LAUNCHER].unlocked) lockedWeapons.push(DropType.WEAPON_ROCKET_LAUNCHER);
      if (!p.weapons[WeaponType.FLAMETHROWER].unlocked) lockedWeapons.push(DropType.WEAPON_FLAMETHROWER);
      if (!p.weapons[WeaponType.RAYGUN].unlocked) lockedWeapons.push(DropType.WEAPON_RAYGUN);
      if (!p.weapons[WeaponType.RAY_RIFLE].unlocked) lockedWeapons.push(DropType.WEAPON_RAY_RIFLE);
      if (!p.weapons[WeaponType.LASER_MINIGUN].unlocked) lockedWeapons.push(DropType.WEAPON_LASER_MINIGUN);

      if (lockedWeapons.length > 0) {
        type = lockedWeapons[Math.floor(Math.random() * lockedWeapons.length)];
        color = '#a855f7'; // Purple (Weapon Unlock Drop!)
      } else {
        type = DropType.AMMO; // Default back to ammo
        color = '#ef4444';
      }
    }

    itemDropsRef.current.push({
      id: `drop-${Date.now()}-${Math.random()}`,
      x,
      y,
      radius: 12,
      type,
      amount: type === DropType.HEALTH ? 25 : type === DropType.AMMO ? 40 : type === DropType.PISTOL_CLIP ? 1 : 25,
      color,
      pulseTimer: 0,
    });
  };

  const triggerRocketExplosion = (expX: number, expY: number, damage: number) => {
    sound.playExplosion();
    screenShakeRef.current = Math.min(40, screenShakeRef.current + 30);
    muzzleFlashIntensityRef.current = 1.0;

    // 1. Fire shockwave ring expanding rapidly
    particlesRef.current.push({
      id: `rocket-ring-${Date.now()}-${Math.random()}`,
      type: 'FIRE_RING',
      x: expX,
      y: expY,
      vx: 0,
      vy: 0,
      radius: 12,
      growthSpeed: 450,
      color: '#ff4500',
      alpha: 1.0,
      decay: 0.08,
    });

    // 2. Central expanding explosion fireball
    particlesRef.current.push({
      id: `rocket-exp-${Date.now()}-${Math.random()}`,
      type: 'EXPLOSION',
      x: expX,
      y: expY,
      vx: 0,
      vy: 0,
      radius: 18,
      growthSpeed: 280,
      color: '#ffaa00',
      alpha: 1.0,
      decay: 0.06,
    });

    // 3. Thick smoke clouds rising from blast
    for (let s = 0; s < 10; s++) {
      const smokeAngle = Math.random() * Math.PI * 2;
      const smokeSpeed = 30 + Math.random() * 80;
      particlesRef.current.push({
        id: `exp-smoke-${Date.now()}-${s}-${Math.random()}`,
        type: 'SMOKE',
        x: expX,
        y: expY,
        vx: Math.cos(smokeAngle) * smokeSpeed,
        vy: Math.sin(smokeAngle) * smokeSpeed,
        radius: 12 + Math.random() * 12,
        growthSpeed: 28 + Math.random() * 15,
        color: Math.random() < 0.5 ? 'rgba(51, 65, 85, 0.7)' : 'rgba(30, 41, 59, 0.6)',
        alpha: 0.8,
        decay: 0.02 + Math.random() * 0.02,
      });
    }

    // 4. Shrapnel / Fire sparks in 360 degrees
    for (let k = 0; k < 28; k++) {
      const sparkAngle = Math.random() * Math.PI * 2;
      const sparkSpeed = 120 + Math.random() * 320;
      particlesRef.current.push({
        id: `rocket-spark-${Date.now()}-${k}-${Math.random()}`,
        type: 'SPARK',
        x: expX,
        y: expY,
        vx: Math.cos(sparkAngle) * sparkSpeed,
        vy: Math.sin(sparkAngle) * sparkSpeed,
        radius: 2.5 + Math.random() * 3,
        color: k % 3 === 0 ? '#ffffff' : k % 3 === 1 ? '#fbbf24' : '#ef4444',
        alpha: 1,
        decay: 0.025 + Math.random() * 0.035,
      });
    }

    // 5. Scorch crater on floor canvas
    bloodSplatsRef.current.push({
      x: expX,
      y: expY,
      radius: 32 + Math.random() * 16,
      alpha: 0.75,
      color: '#1c1917', // Scorched charcoal crater
    });

    // 6. AoE Damage, Knockback & Igniting nearby Zombies
    const blastRadius = 180;
    zombiesRef.current.forEach((z) => {
      const dist = Math.hypot(z.x - expX, z.y - expY);
      if (dist < blastRadius) {
        const falloff = 1 - (dist / blastRadius) * 0.5;
        const finalDmg = Math.round(damage * falloff);
        z.hp -= finalDmg;
        z.isStunned = true;
        z.stunTimer = 0.45;

        // Set nearby enemies on fire!
        z.isOnFire = true;
        z.burnTimer = 3.5;

        const pushAngle = Math.atan2(z.y - expY, z.x - expX);
        const kbForce = 650 * falloff * (playerRef.current.knockbackMult || 1);
        z.knockbackX += Math.cos(pushAngle) * kbForce;
        z.knockbackY += Math.sin(pushAngle) * kbForce;
      }
    });
  };

  const triggerCarpetBombExplosion = (expX: number, expY: number, damage: number) => {
    sound.playExplosion();
    screenShakeRef.current = Math.min(50, screenShakeRef.current + 38);
    muzzleFlashIntensityRef.current = 1.0;

    // 1. Double expanding stealth fire rings (stealth crimson + high-heat core)
    particlesRef.current.push({
      id: `bomb-ring1-${Date.now()}-${Math.random()}`,
      type: 'FIRE_RING',
      x: expX,
      y: expY,
      vx: 0,
      vy: 0,
      radius: 16,
      growthSpeed: 520,
      color: '#f43f5e', // Stealth Laser Crimson
      alpha: 1.0,
      decay: 0.07,
    });
    particlesRef.current.push({
      id: `bomb-ring2-${Date.now()}-${Math.random()}`,
      type: 'FIRE_RING',
      x: expX,
      y: expY,
      vx: 0,
      vy: 0,
      radius: 10,
      growthSpeed: 380,
      color: '#fbbf24', // Amber core
      alpha: 1.0,
      decay: 0.09,
    });

    // 2. Central blast fireball
    particlesRef.current.push({
      id: `bomb-exp-${Date.now()}-${Math.random()}`,
      type: 'EXPLOSION',
      x: expX,
      y: expY,
      vx: 0,
      vy: 0,
      radius: 24,
      growthSpeed: 340,
      color: '#ff2255',
      alpha: 1.0,
      decay: 0.05,
    });

    // 3. Cluster submunition pop rings (carpet bombing staggered blastlets)
    for (let c = 0; c < 5; c++) {
      const clusterAngle = (c / 5) * Math.PI * 2 + Math.random() * 0.4;
      const clusterDist = 40 + Math.random() * 50;
      const subX = expX + Math.cos(clusterAngle) * clusterDist;
      const subY = expY + Math.sin(clusterAngle) * clusterDist;

      particlesRef.current.push({
        id: `bomb-sub-${Date.now()}-${c}-${Math.random()}`,
        type: 'FIRE_RING',
        x: subX,
        y: subY,
        vx: 0,
        vy: 0,
        radius: 8,
        growthSpeed: 290,
        color: c % 2 === 0 ? '#ef4444' : '#f59e0b',
        alpha: 0.9,
        decay: 0.1,
      });

      // Mini craters for the submunitions
      bloodSplatsRef.current.push({
        x: subX,
        y: subY,
        radius: 18 + Math.random() * 10,
        alpha: 0.7,
        color: '#0f172a',
      });
    }

    // 4. Heavy tactical dark smoke clouds
    for (let s = 0; s < 14; s++) {
      const smokeAngle = Math.random() * Math.PI * 2;
      const smokeSpeed = 35 + Math.random() * 95;
      particlesRef.current.push({
        id: `bomb-smoke-${Date.now()}-${s}-${Math.random()}`,
        type: 'SMOKE',
        x: expX,
        y: expY,
        vx: Math.cos(smokeAngle) * smokeSpeed,
        vy: Math.sin(smokeAngle) * smokeSpeed,
        radius: 16 + Math.random() * 14,
        growthSpeed: 32 + Math.random() * 20,
        color: Math.random() < 0.6 ? 'rgba(15, 23, 42, 0.85)' : 'rgba(30, 41, 59, 0.75)',
        alpha: 0.85,
        decay: 0.02 + Math.random() * 0.015,
      });
    }

    // 5. Fiery shrapnel sparks
    for (let k = 0; k < 36; k++) {
      const sparkAngle = Math.random() * Math.PI * 2;
      const sparkSpeed = 140 + Math.random() * 380;
      particlesRef.current.push({
        id: `bomb-spark-${Date.now()}-${k}-${Math.random()}`,
        type: 'SPARK',
        x: expX,
        y: expY,
        vx: Math.cos(sparkAngle) * sparkSpeed,
        vy: Math.sin(sparkAngle) * sparkSpeed,
        radius: 3 + Math.random() * 3,
        color: k % 3 === 0 ? '#ffffff' : k % 3 === 1 ? '#f43f5e' : '#fb923c',
        alpha: 1,
        decay: 0.025 + Math.random() * 0.03,
      });
    }

    // 6. Huge scorched carpet bomb crater
    bloodSplatsRef.current.push({
      x: expX,
      y: expY,
      radius: 46 + Math.random() * 16,
      alpha: 0.85,
      color: '#09090b', // Deep charcoal stealth crater
    });

    // 7. Devastating AoE damage, knockback and carpet napalm ignition
    const blastRadius = 240;
    zombiesRef.current.forEach((z) => {
      const dist = Math.hypot(z.x - expX, z.y - expY);
      if (dist < blastRadius) {
        const falloff = 1 - (dist / blastRadius) * 0.45;
        const finalDmg = Math.round(damage * falloff);
        z.hp -= finalDmg;
        z.isStunned = true;
        z.stunTimer = 0.75;

        // Severe burn
        z.isOnFire = true;
        z.burnTimer = 5.0;

        const pushAngle = Math.atan2(z.y - expY, z.x - expX);
        const kbForce = 780 * falloff * (playerRef.current.knockbackMult || 1);
        z.knockbackX += Math.cos(pushAngle) * kbForce;
        z.knockbackY += Math.sin(pushAngle) * kbForce;
      }
    });
  };

  const reloadActiveWeapon = () => {
    const p = playerRef.current;
    let w = p.weapons[p.currentWeapon];
    if (!w) {
      p.currentWeapon = WeaponType.PISTOL;
      if (!p.weapons[WeaponType.PISTOL]) {
        p.weapons[WeaponType.PISTOL] = JSON.parse(JSON.stringify(INITIAL_WEAPONS[WeaponType.PISTOL]));
      }
      w = p.weapons[WeaponType.PISTOL];
    }
    if (w && w.currentAmmo < w.ammoCapacity) {
      w.currentAmmo = w.ammoCapacity;
      sound.playReload();
      syncHudPlayer();
    }
  };

  // Trigger weapon shooting
  const fireActiveWeapon = (angle: number) => {
    const p = playerRef.current;
    const now = Date.now();
    let w = p.weapons[p.currentWeapon];

    if (!w) {
      p.currentWeapon = WeaponType.PISTOL;
      if (!p.weapons[WeaponType.PISTOL]) {
        p.weapons[WeaponType.PISTOL] = JSON.parse(JSON.stringify(INITIAL_WEAPONS[WeaponType.PISTOL]));
      }
      w = p.weapons[WeaponType.PISTOL];
    }

    if (!w) return;

    // Check firing rate cooldown
    const delay = 1000 / w.fireRate;
    if (now - p.lastShotTime < delay) return;

    p.lastShotTime = now;

    const isRocket = p.currentWeapon === WeaponType.ROCKET_LAUNCHER;
    const isFlame = p.currentWeapon === WeaponType.FLAMETHROWER;

    if (isRocket) {
      sound.playRocketLaunch();
      screenShakeRef.current = Math.min(32, screenShakeRef.current + 22);
      muzzleFlashIntensityRef.current = 1.0;
      gunRecoilRef.current = 14;

      p.x -= Math.cos(angle) * 12;
      p.y -= Math.sin(angle) * 12;
      p.x = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.x));
      p.y = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.y));

      const muzzleX = p.x + Math.cos(angle) * (p.radius + 20);
      const muzzleY = p.y + Math.sin(angle) * (p.radius + 20);

      // Backblast smoke behind player
      for (let b = 0; b < 8; b++) {
        const bbAngle = angle + Math.PI + (Math.random() * 0.6 - 0.3);
        const bbSpeed = 80 + Math.random() * 120;
        particlesRef.current.push({
          id: `backblast-${Date.now()}-${b}-${Math.random()}`,
          type: 'SMOKE',
          x: p.x - Math.cos(angle) * 20,
          y: p.y - Math.sin(angle) * 20,
          vx: Math.cos(bbAngle) * bbSpeed,
          vy: Math.sin(bbAngle) * bbSpeed,
          radius: 8 + Math.random() * 6,
          growthSpeed: 22,
          color: 'rgba(234, 88, 12, 0.65)',
          alpha: 0.85,
          decay: 0.05,
        });
      }

      bulletsRef.current.push({
        id: `rocket-${Date.now()}-${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(angle) * w.bulletSpeed,
        vy: Math.sin(angle) * w.bulletSpeed,
        radius: 8,
        damage: w.damage,
        piercingRemaining: 1,
        color: '#f97316',
        distanceTraveled: 0,
        maxDistance: 850,
        ownerAngle: angle,
        isRocket: true,
      });

      // Infinite ammo: no ammo consumption
      return;
    }

    if (isFlame) {
      sound.playFlamethrower();
      screenShakeRef.current = Math.min(10, screenShakeRef.current + 1.0);
      gunRecoilRef.current = 2.2;

      const muzzleX = p.x + Math.cos(angle) * (p.radius + 20);
      const muzzleY = p.y + Math.sin(angle) * (p.radius + 20);

      const flameSpread = angle + (Math.random() * w.spread * 2 - w.spread);
      const flameSpeed = w.bulletSpeed * (0.9 + Math.random() * 0.25);
      const vx = Math.cos(flameSpread) * flameSpeed;
      const vy = Math.sin(flameSpread) * flameSpeed;

      // Invisible/spark hitbox projectile for cone damage & burning DOT
      bulletsRef.current.push({
        id: `flame-${Date.now()}-${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx,
        vy,
        radius: 10,
        flameMaxRadius: 34,
        damage: w.damage,
        piercingRemaining: w.piercing,
        color: '#ff5500',
        distanceTraveled: 0,
        maxDistance: 360,
        ownerAngle: angle,
        isFlame: true,
      });

      // Push dense continuous spine points for renderFlamethrowerStream (zero fireballs)
      const streamVx = Math.cos(angle + (Math.random() - 0.5) * 0.14) * (w.bulletSpeed * 1.05);
      const streamVy = Math.sin(angle + (Math.random() - 0.5) * 0.14) * (w.bulletSpeed * 1.05);
      flameStreamRef.current.push(
        {
          x: muzzleX + Math.cos(angle) * 7,
          y: muzzleY + Math.sin(angle) * 7,
          vx: streamVx,
          vy: streamVy,
          age: 0.025,
          maxAge: 0.54,
          seed: Math.random() * 100,
        },
        {
          x: muzzleX,
          y: muzzleY,
          vx: streamVx,
          vy: streamVy,
          age: 0,
          maxAge: 0.54,
          seed: Math.random() * 100,
        }
      );
      if (flameStreamRef.current.length > 90) {
        flameStreamRef.current.splice(0, flameStreamRef.current.length - 90);
      }

      // Sharp directional incandescent sparks at nozzle (no round balls)
      for (let fe = 0; fe < 2; fe++) {
        const emberAngle = angle + (Math.random() * 0.65 - 0.325);
        const emberSpeed = 140 + Math.random() * 180;
        particlesRef.current.push({
          id: `ember-${Date.now()}-${fe}-${Math.random()}`,
          type: 'SPARK',
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(emberAngle) * emberSpeed,
          vy: Math.sin(emberAngle) * emberSpeed,
          radius: 1.5 + Math.random() * 1.6,
          color: fe % 2 === 0 ? '#fef08a' : '#fb923c',
          alpha: 0.95,
          decay: 0.09,
        });
      }

      return;
    }

    const isRaygun = p.currentWeapon === WeaponType.RAYGUN;
    const isRayRifle = p.currentWeapon === WeaponType.RAY_RIFLE;
    const isLaserMinigun = p.currentWeapon === WeaponType.LASER_MINIGUN;

    // Play dedicated authentic sounds per weapon
    if (p.currentWeapon === WeaponType.PISTOL) {
      sound.playPistol();
    } else if (p.currentWeapon === WeaponType.SHOTGUN) {
      sound.playShotgun();
    } else if (p.currentWeapon === WeaponType.MACHINE_GUN) {
      sound.playMachineGun();
    } else if (p.currentWeapon === WeaponType.MINIGUN) {
      sound.playMinigun();
    } else if (p.currentWeapon === WeaponType.PLASMA_RIFLE) {
      sound.playShoot(true);
    } else if (p.currentWeapon === WeaponType.RAYGUN) {
      sound.playRaygun();
    } else if (p.currentWeapon === WeaponType.RAY_RIFLE) {
      sound.playRayRifle();
    } else if (p.currentWeapon === WeaponType.LASER_MINIGUN) {
      sound.playLaserMinigun();
    } else {
      sound.playShoot(false);
    }

    // Dynamic recoil parameters based on weapon
    const isPlasma = p.currentWeapon === WeaponType.PLASMA_RIFLE;
    const isShotgun = p.currentWeapon === WeaponType.SHOTGUN;
    const isMG = p.currentWeapon === WeaponType.MACHINE_GUN;

    const shakeAmt = isLaserMinigun ? 1.5 : isRayRifle ? 7 : isRaygun ? 5 : isPlasma ? 12 : isShotgun ? 10 : isMG ? 2.5 : 3.5;
    const recoilKick = isLaserMinigun ? 2 : isRayRifle ? 7 : isRaygun ? 5 : isPlasma ? 11 : isShotgun ? 9 : isMG ? 4 : 5.5;
    const pushbackForce = isLaserMinigun ? 1.0 : isRayRifle ? 3.5 : isRaygun ? 2.5 : isPlasma ? 7 : isShotgun ? 8.5 : isMG ? 1.8 : 2.5;
    const bloomIncrease = isLaserMinigun ? 0.002 : isRayRifle ? 0.008 : isRaygun ? 0.01 : isPlasma ? 0.005 : isShotgun ? 0.012 : isMG ? 0.022 : 0.015;

    // Apply screen shake
    screenShakeRef.current = Math.min(18, screenShakeRef.current + shakeAmt);

    // Apply muzzle flash illumination
    muzzleFlashIntensityRef.current = 1.0;

    // Apply visual recoil on weapon sprite
    gunRecoilRef.current = recoilKick;

    // Apply physical pushback (recoil kickback force)
    p.x -= Math.cos(angle) * pushbackForce;
    p.y -= Math.sin(angle) * pushbackForce;
    p.x = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.y));

    // Increase dynamic spread bloom
    dynamicSpreadRef.current = Math.min(0.18, dynamicSpreadRef.current + bloomIncrease);

    // Bullet spawning parameters
    const bulletRadius = isRaygun ? 8 : isRayRifle ? 7 : isLaserMinigun ? 5 : isPlasma ? 10 : 4;
    const bColor = w.color;
    const bSpeed = w.bulletSpeed;

    // Create muzzle flash particles
    const muzzleX = p.x + Math.cos(angle) * (p.radius + 15);
    const muzzleY = p.y + Math.sin(angle) * (p.radius + 15);

    // Spawn nice muzzle flash sparks
    const sparkCount = isPlasma ? 8 : (isRaygun || isRayRifle || isLaserMinigun) ? 6 : 5;
    for (let i = 0; i < sparkCount; i++) {
      const flashAngle = angle + (Math.random() * 0.5 - 0.25);
      const flashSpeed = (isPlasma || isLaserMinigun ? 90 : 60) + Math.random() * (isPlasma ? 140 : 110);
      particlesRef.current.push({
        id: `muzzle-${Date.now()}-${i}-${Math.random()}`,
        type: 'MUZZLE',
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(flashAngle) * flashSpeed,
        vy: Math.sin(flashAngle) * flashSpeed,
        radius: (isPlasma ? 3 : 2) + Math.random() * 3,
        color: bColor,
        alpha: 1,
        decay: isPlasma ? 0.15 + Math.random() * 0.1 : 0.1 + Math.random() * 0.1,
      });
    }

    if (isRaygun || isRayRifle) {
      // Ray Ring particle effect
      particlesRef.current.push({
        id: `ray-ring-${Date.now()}-${Math.random()}`,
        type: 'RAY_RING',
        x: muzzleX,
        y: muzzleY,
        vx: (p.vx || 0) * 0.2,
        vy: (p.vy || 0) * 0.2,
        radius: 3,
        growthSpeed: 160,
        color: bColor,
        alpha: 1.0,
        decay: 0.15,
      });
    }

    if (isPlasma) {
      // 1. Spawning dynamic expanding plasma energy rings (concentric shockwaves)
      particlesRef.current.push({
        id: `plasma-ring-${Date.now()}-${Math.random()}`,
        type: 'PLASMA_RING',
        x: muzzleX,
        y: muzzleY,
        vx: (p.vx || 0) * 0.2, // move slightly with player
        vy: (p.vy || 0) * 0.2,
        radius: 4,
        growthSpeed: 190, // expands fast
        color: '#38bdf8', // beautiful cyan glow
        alpha: 1.0,
        decay: 0.14, // fades out quickly
      });

      // 2. Crackling electricity lightning arcs propagating forward!
      for (let arcIndex = 0; arcIndex < 3; arcIndex++) {
        const arcPoints: { x: number; y: number }[] = [];
        let currX = muzzleX;
        let currY = muzzleY;
        const baseAngle = angle + (Math.random() * 0.8 - 0.4);
        
        // Generate a jagged line of 4 segments
        for (let seg = 0; seg < 4; seg++) {
          const segLength = 8 + Math.random() * 10;
          const segAngle = baseAngle + (Math.random() * 0.6 - 0.3);
          currX += Math.cos(segAngle) * segLength;
          currY += Math.sin(segAngle) * segLength;
          arcPoints.push({ x: currX, y: currY });
        }

        particlesRef.current.push({
          id: `energy-arc-${Date.now()}-${arcIndex}-${Math.random()}`,
          type: 'ENERGY_ARC',
          x: muzzleX,
          y: muzzleY,
          vx: (p.vx || 0) * 0.1,
          vy: (p.vy || 0) * 0.1,
          radius: 2,
          color: '#38bdf8', // cyan lightning
          alpha: 1.0,
          decay: 0.25, // stays for only 4-5 frames
          points: arcPoints,
        });
      }

      // 3. Swirling tangent orbs/sparks circling the muzzle path
      for (let s = 0; s < 4; s++) {
        const swirlAngle = angle + (Math.random() * Math.PI * 2);
        const swirlSpeed = 80 + Math.random() * 90;
        particlesRef.current.push({
          id: `swirl-${Date.now()}-${s}-${Math.random()}`,
          type: 'SPARK',
          x: muzzleX + Math.cos(swirlAngle) * 8,
          y: muzzleY + Math.sin(swirlAngle) * 8,
          vx: Math.cos(swirlAngle + Math.PI / 2 + (Math.random() * 0.4 - 0.2)) * swirlSpeed,
          vy: Math.sin(swirlAngle + Math.PI / 2 + (Math.random() * 0.4 - 0.2)) * swirlSpeed,
          radius: 1.5 + Math.random() * 2,
          color: '#e0f2fe', // hot glowing cyan-white
          alpha: 1.0,
          decay: 0.15 + Math.random() * 0.1,
        });
      }
    } else {
      // Normal weapons (Pistol, Shotgun, Machine Gun) muzzle flash enhancements
      // 1. Spawning a high-intensity customized MUZZLE_FLARE at the end of the barrel
      const flareColor = isShotgun ? 'rgba(248, 113, 113, 0.95)' : isMG ? 'rgba(192, 132, 252, 0.95)' : 'rgba(251, 191, 36, 0.95)';
      const flareRadius = isShotgun ? 14 : isMG ? 8 : 6;
      const flareGrowth = isShotgun ? 45 : isMG ? 25 : 18;
      const flareDecay = isShotgun ? 0.25 : isMG ? 0.35 : 0.28;

      particlesRef.current.push({
        id: `muzzle-flare-${Date.now()}-${Math.random()}`,
        type: 'MUZZLE_FLARE',
        x: muzzleX,
        y: muzzleY,
        vx: (p.vx || 0) * 0.15,
        vy: (p.vy || 0) * 0.15,
        radius: flareRadius,
        growthSpeed: flareGrowth,
        color: flareColor,
        alpha: 1.0,
        decay: flareDecay,
      });

      // 2. Spawning realistic smoke puffs
      const smokeCount = isShotgun ? 6 : isMG ? 1 : 2;
      for (let s = 0; s < smokeCount; s++) {
        // Smoke expands outward in a cone from the barrel tip
        const maxSmokeSpread = isShotgun ? 0.45 : 0.25;
        const smokeAngle = angle + (Math.random() * maxSmokeSpread * 2 - maxSmokeSpread);
        const smokeSpeed = (isShotgun ? 45 : 25) + Math.random() * (isShotgun ? 60 : 35);
        
        // Select an ambient particle color: slate-gray, light gray, soft charcoal
        const smokeColors = ['rgba(148, 163, 184, 0.35)', 'rgba(203, 213, 225, 0.3)', 'rgba(100, 116, 139, 0.3)'];
        const chosenColor = smokeColors[Math.floor(Math.random() * smokeColors.length)];
        
        particlesRef.current.push({
          id: `smoke-${Date.now()}-${s}-${Math.random()}`,
          type: 'SMOKE',
          x: muzzleX + Math.cos(smokeAngle) * (s * 3),
          y: muzzleY + Math.sin(smokeAngle) * (s * 3),
          vx: Math.cos(smokeAngle) * smokeSpeed + (p.vx || 0) * 0.1,
          vy: Math.sin(smokeAngle) * smokeSpeed + (p.vy || 0) * 0.1,
          radius: (isShotgun ? 5 : 3.5) + Math.random() * (isShotgun ? 6 : 3),
          growthSpeed: (isShotgun ? 24 : 14) + Math.random() * 8,
          color: chosenColor,
          alpha: 0.55 + Math.random() * 0.25,
          decay: isShotgun ? 0.045 + Math.random() * 0.03 : 0.065 + Math.random() * 0.04,
        });
      }
    }

    const currentSpread = w.spread + dynamicSpreadRef.current;

    // Shotgun fires organic, randomized buckshot scatter (never in a rigid line)
    if (isShotgun) {
      const pelletCount = 7; // Generous 7-pellet buckshot cloud
      for (let i = 0; i < pelletCount; i++) {
        // Organic, natural bell-curve scatter inside the cone
        const scatterOffset = (Math.random() + Math.random() - 1) * currentSpread * 1.35;
        const finalAngle = angle + scatterOffset;

        // Randomize pellet velocity so they don't form a flat rigid arc!
        const speedMultiplier = 0.82 + Math.random() * 0.36; // 82% to 118% speed
        const pelletSpeed = bSpeed * speedMultiplier;

        // Slight natural muzzle jitter along perpendicular axis
        const perpAngle = angle + Math.PI / 2;
        const jitterDist = (Math.random() - 0.5) * 5;
        const pelletX = muzzleX + Math.cos(perpAngle) * jitterDist;
        const pelletY = muzzleY + Math.sin(perpAngle) * jitterDist;

        // Variable pellet size and falloff distance for true organic depth
        const pelletRadius = bulletRadius * (0.8 + Math.random() * 0.45);
        const maxRange = 380 + Math.random() * 120;
        
        bulletsRef.current.push({
          id: `bullet-${Date.now()}-${i}-${Math.random()}`,
          x: pelletX,
          y: pelletY,
          vx: Math.cos(finalAngle) * pelletSpeed,
          vy: Math.sin(finalAngle) * pelletSpeed,
          radius: pelletRadius,
          damage: w.damage,
          piercingRemaining: w.piercing,
          color: bColor,
          distanceTraveled: 0,
          maxDistance: maxRange,
          ownerAngle: angle,
          weaponType: WeaponType.SHOTGUN,
        });
      }
    } else {
      // Standard single bullet (Pistol, Machine Gun, Plasma, Minigun, Laser Minigun, etc.)
      const finalAngle = angle + (Math.random() * currentSpread * 2 - currentSpread);
      bulletsRef.current.push({
        id: `bullet-${Date.now()}-${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(finalAngle) * bSpeed,
        vy: Math.sin(finalAngle) * bSpeed,
        radius: bulletRadius,
        damage: w.damage,
        piercingRemaining: w.piercing,
        color: bColor,
        distanceTraveled: 0,
        maxDistance: isLaserMinigun ? 950 : isRayRifle ? 850 : isRaygun ? 700 : p.currentWeapon === WeaponType.PISTOL ? 600 : 750,
        ownerAngle: angle,
        isRay: isRaygun || isRayRifle,
        isLaser: isLaserMinigun,
        weaponType: p.currentWeapon,
      });
    }

    // MYTHIC CHRONO-REAPER: Triple Spectral Split Shot flanking rays
    if (p.mythicSplitShot && p.mythicSplitShot > 0 && !isFlame) {
      const splitOffsets = [-0.16, 0.16];
      for (let si = 0; si < splitOffsets.length; si++) {
        const sAngle = angle + splitOffsets[si];
        bulletsRef.current.push({
          id: `split-${Date.now()}-${si}-${Math.random()}`,
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(sAngle) * Math.max(680, bSpeed * 1.05),
          vy: Math.sin(sAngle) * Math.max(680, bSpeed * 1.05),
          radius: Math.max(4.5, bulletRadius * 0.85),
          damage: Math.round(w.damage * (0.65 + (p.mythicSplitShot - 1) * 0.15)),
          piercingRemaining: Math.max(3, w.piercing),
          color: '#e879f9',
          distanceTraveled: 0,
          maxDistance: 780,
          ownerAngle: sAngle,
          isRay: true,
          weaponType: p.currentWeapon,
        });
      }
    }

    // MYTHIC SINGULARITY: Radial Nova Shot burst every 3 shots
    if (p.mythicSingularity && p.mythicSingularity > 0) {
      mythicCombatRef.current.novaShotCounter += 1;
      if (mythicCombatRef.current.novaShotCounter >= 3) {
        mythicCombatRef.current.novaShotCounter = 0;
        const novaCount = 12;
        const novaDmg = Math.round(w.damage * (1.25 + (p.mythicSingularity - 1) * 0.4));
        for (let ni = 0; ni < novaCount; ni++) {
          const na = (ni * Math.PI * 2) / novaCount + angle * 0.25;
          bulletsRef.current.push({
            id: `nova-${Date.now()}-${ni}-${Math.random()}`,
            x: p.x + Math.cos(na) * 20,
            y: p.y + Math.sin(na) * 20,
            vx: Math.cos(na) * 760,
            vy: Math.sin(na) * 760,
            radius: 6,
            damage: novaDmg,
            piercingRemaining: 4,
            color: ni % 2 === 0 ? '#38bdf8' : '#f0abfc',
            distanceTraveled: 0,
            maxDistance: 560,
            ownerAngle: na,
            isRay: true,
          });
        }
        particlesRef.current.push({
          id: `nova-ring-${Date.now()}-${Math.random()}`,
          type: 'MYTHIC_NOVA',
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: 16,
          growthSpeed: 420,
          color: '#38bdf8',
          alpha: 0.9,
          decay: 0.045,
        });
      }
    }

    // Spawn a bullet shell casing ejection
    const casingAngle = angle - Math.PI / 2 + (Math.random() * 0.4 - 0.2);
    const casingSpeed = 40 + Math.random() * 40;
    particlesRef.current.push({
      id: `casing-${Date.now()}-${Math.random()}`,
      type: 'CASING',
      x: p.x,
      y: p.y,
      vx: Math.cos(casingAngle) * -casingSpeed,
      vy: Math.sin(casingAngle) * -casingSpeed,
      radius: 1.5,
      color: '#d97706', // Brass orange/gold
      alpha: 1,
      decay: 0.02,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.1 + Math.random() * 0.2,
    });

    syncHudPlayer();
  };

  // Dramatic slow-motion player death sequence
  const triggerPlayerDeath = (p: Player, attackAngle: number = p.angle + Math.PI) => {
    if (dyingRef.current?.active) return;

    // Knock weapon out of player's hands with randomized momentum
    const weaponKickAngle = attackAngle + (Math.random() * 0.5 - 0.25);
    const weaponSpeed = 190 + Math.random() * 70;

    dyingRef.current = {
      active: true,
      timer: 2.8,
      total: 2.8,
      fatalAngle: attackAngle,
      startX: p.x,
      startY: p.y,
      recoilX: Math.cos(attackAngle) * 35,
      recoilY: Math.sin(attackAngle) * 35,
      flatlinePlayed: false,
      bodyFallPlayed: false,
      bloodPoolRadius: 8,
      droppedWeapon: {
        type: p.currentWeapon,
        x: p.x + Math.cos(p.angle) * 10,
        y: p.y + Math.sin(p.angle) * 10,
        vx: Math.cos(weaponKickAngle) * weaponSpeed,
        vy: Math.sin(weaponKickAngle) * weaponSpeed,
        angle: p.angle,
        rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 8),
      },
    };

    sound.playDeathImpact();
    screenShakeRef.current = 52;

    // Push player slightly along fatal blow
    p.x += Math.cos(attackAngle) * 18;
    p.y += Math.sin(attackAngle) * 18;
    p.x = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.y));

    // 1. Violent arterial blood spray flying backwards
    for (let i = 0; i < 55; i++) {
      const sprayAngle = attackAngle + (Math.random() * 1.4 - 0.7);
      const spraySpeed = 80 + Math.random() * 260;
      particlesRef.current.push({
        id: `fatal-blood-${Date.now()}-${i}-${Math.random()}`,
        type: 'BLOOD',
        x: p.x,
        y: p.y,
        vx: Math.cos(sprayAngle) * spraySpeed,
        vy: Math.sin(sprayAngle) * spraySpeed,
        radius: 3 + Math.random() * 4.5,
        color: Math.random() > 0.35 ? '#dc2626' : '#991b1b',
        alpha: 1,
        decay: 0.012 + Math.random() * 0.02,
      });
    }

    // 2. Visor glass shatter fragments & tactical spark burst
    for (let j = 0; j < 25; j++) {
      const shardAngle = Math.random() * Math.PI * 2;
      const shardSpeed = 60 + Math.random() * 200;
      particlesRef.current.push({
        id: `visor-shard-${Date.now()}-${j}-${Math.random()}`,
        type: 'SPARK',
        x: p.x + Math.cos(p.angle) * 10,
        y: p.y + Math.sin(p.angle) * 10,
        vx: Math.cos(shardAngle) * shardSpeed,
        vy: Math.sin(shardAngle) * shardSpeed,
        radius: 1.5 + Math.random() * 2.5,
        color: j % 2 === 0 ? '#38bdf8' : '#ffffff',
        alpha: 1,
        decay: 0.03 + Math.random() * 0.03,
      });
    }

    // 3. Expanding shockwave ring
    particlesRef.current.push({
      id: `death-ring-${Date.now()}-${Math.random()}`,
      type: 'FIRE_RING',
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      radius: 6,
      growthSpeed: 220,
      color: '#ef4444',
      alpha: 1,
      decay: 0.035,
    });
  };

  // Main Canvas Rendering & Physics Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let shieldRegenTimer = 0;

    const gameLoop = (time: number) => {
      // Calculate delta time in seconds, clamped to avoid massive jumps on lag spikes
      const unscaledDt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const p = playerRef.current;

      // Visceral low health heartbeat pulse audio check with dynamic rate
      if (gameState === GameState.PLAYING && p.hp > 0 && p.hp <= p.maxHp * 0.30) {
        const hpRatio = p.hp / (p.maxHp * 0.30); // 1.0 (at 30%) down to 0.0 (near death)
        const beatInterval = 380 + hpRatio * 440; // 380ms (rapid tachycardia) to 820ms
        const urgency = 1.0 + (1 - hpRatio) * 0.7; // 1.0 to 1.7 volume & pitch
        if (time - lastHeartbeatRef.current > beatInterval) {
          lastHeartbeatRef.current = time;
          sound.playHeartbeat(urgency);
          screenShakeRef.current = Math.max(screenShakeRef.current, 1.8 + (1 - hpRatio) * 2.8);
        }
      }

      // Check if dramatic slow-motion death sequence is active
      let dt = unscaledDt;
      if (dyingRef.current?.active) {
        const d = dyingRef.current;
        const elapsed = d.total - d.timer;
        d.timer -= unscaledDt;

        // Friction and rotation on dropped weapon
        d.droppedWeapon.x += d.droppedWeapon.vx * unscaledDt;
        d.droppedWeapon.y += d.droppedWeapon.vy * unscaledDt;
        d.droppedWeapon.vx *= Math.pow(0.08, unscaledDt);
        d.droppedWeapon.vy *= Math.pow(0.08, unscaledDt);
        d.droppedWeapon.angle += d.droppedWeapon.rotSpeed * unscaledDt;
        d.droppedWeapon.rotSpeed *= Math.pow(0.15, unscaledDt);

        // Body fall sound trigger at ~0.55s
        if (elapsed >= 0.55 && !d.bodyFallPlayed) {
          d.bodyFallPlayed = true;
          sound.playBodyFall();
          screenShakeRef.current = Math.max(screenShakeRef.current, 12);
        }

        // Heart monitor flatline audio trigger at ~1.05s
        if (elapsed >= 1.05 && !d.flatlinePlayed) {
          d.flatlinePlayed = true;
          sound.playFlatline();
        }

        // Blood pool gradually expands beneath the fallen soldier
        if (d.bloodPoolRadius < 52) {
          d.bloodPoolRadius += unscaledDt * 22;
        }

        // Time dilation (slow-motion death camera)
        dt = unscaledDt * 0.18;

        if (d.timer <= 0) {
          bloodSplatsRef.current.push({
            x: p.x,
            y: p.y,
            radius: d.bloodPoolRadius + 8,
            color: '#450a0a',
            alpha: 0.95,
          });
          dyingRef.current = null;
          p.hp = 0;
          setGameState(GameState.GAME_OVER);
          sound.playGameOver();
          updateHighScore(p.score);
          const runCoins = p.coinsEarned || 0;
          updateCoins(runCoins);
          drawGame(time);
          return;
        }
      }

      if (gameState === GameState.PLAYING || dyingRef.current?.active) {
        updateGame(dt);
      }

      drawGame(time);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Update coordinates and physics
    const updateGame = (dt: number) => {
      const p = playerRef.current;
      const nowMs = Date.now();

      let levelUpQueuedThisFrame = false;

      const handleZombieDeath = (z: Zombie, depth: number = 0) => {
        const isAlienUnit = modeRef.current === GameMode.ALIEN;
        if (isAlienUnit) {
          sound.playFreeze();
        } else {
          sound.playZombieKill();
        }
        p.kills += 1;
        const baseCoins = z.isBoss
          ? 350
          : z.type === ZombieType.TANK || z.type === ZombieType.ALIEN_COLOSSUS
            ? 60
            : z.type === ZombieType.RUNNER || z.type === ZombieType.ALIEN_DRONE
              ? 25
              : 15;
        const zombieCoins = Math.round(baseCoins * (p.bonusCoinsMult || 1));
        p.coinsEarned = (p.coinsEarned || 0) + zombieCoins;
        p.score = p.coinsEarned;

        if (z.isBoss) {
          sound.playPowerup();
          for (let exp = 0; exp < 16; exp++) {
            const expAngle = Math.random() * Math.PI * 2;
            const expSpeed = 60 + Math.random() * 140;
            particlesRef.current.push({
              id: `boss-exp-${Date.now()}-${exp}-${Math.random()}`,
              type: isAlienUnit ? 'ALIEN_PLASMA' : 'EXPLOSION',
              x: z.x,
              y: z.y,
              vx: Math.cos(expAngle) * expSpeed,
              vy: Math.sin(expAngle) * expSpeed,
              radius: 4 + Math.random() * 5,
              color: z.color,
              alpha: 1,
              decay: 0.03,
            });
          }
        }

        if (p.vampirism && p.vampirism > 0) {
          p.hp = Math.min(p.maxHp, p.hp + p.vampirism);
        }

        // EPIC SHATTER DOCTRINE: Fragmentation burst + shrapnel darts on kill
        if (p.shatterLevel && p.shatterLevel > 0 && depth < 1) {
          sound.playShatterBurst();
          const shardCount = 4 + p.shatterLevel * 2;
          const activeW = p.weapons[p.currentWeapon] || INITIAL_WEAPONS[WeaponType.PISTOL];
          const shardDmg = Math.max(16, Math.round(activeW.damage * 0.55 * p.shatterLevel));
          for (let s = 0; s < shardCount; s++) {
            const sa = (s * Math.PI * 2) / shardCount + Math.random() * 0.35;
            bulletsRef.current.push({
              id: `shrapnel-${Date.now()}-${s}-${Math.random()}`,
              x: z.x,
              y: z.y,
              vx: Math.cos(sa) * 620,
              vy: Math.sin(sa) * 620,
              radius: 5,
              damage: shardDmg,
              piercingRemaining: 2,
              color: '#fb923c',
              distanceTraveled: 0,
              maxDistance: 210,
              ownerAngle: sa,
              isShrapnel: true,
            });
          }
          particlesRef.current.push({
            id: `shatter-ring-${Date.now()}-${Math.random()}`,
            type: 'FIRE_RING',
            x: z.x,
            y: z.y,
            vx: 0,
            vy: 0,
            radius: 8,
            growthSpeed: 280,
            color: '#fb923c',
            alpha: 0.85,
            decay: 0.08,
          });
        }

        // MYTHIC SOLAR PHOENIX: Fiery Solar Explosion on kill
        if (p.mythicSolarAura && p.mythicSolarAura > 0 && depth < 1) {
          const solarRadius = 115 + (p.mythicSolarAura - 1) * 20;
          const activeW = p.weapons[p.currentWeapon] || INITIAL_WEAPONS[WeaponType.PISTOL];
          const solarBlastDmg = Math.max(28, Math.round(activeW.damage * 0.85 * p.mythicSolarAura));

          particlesRef.current.push({
            id: `solar-exp-ring-${Date.now()}-${Math.random()}`,
            type: 'FIRE_RING',
            x: z.x,
            y: z.y,
            vx: 0,
            vy: 0,
            radius: 10,
            growthSpeed: 390,
            color: '#fbbf24',
            alpha: 0.95,
            decay: 0.06,
          });
          particlesRef.current.push({
            id: `solar-exp-core-${Date.now()}-${Math.random()}`,
            type: 'EXPLOSION',
            x: z.x,
            y: z.y,
            vx: 0,
            vy: 0,
            radius: 14,
            growthSpeed: 240,
            color: '#f97316',
            alpha: 0.9,
            decay: 0.07,
          });

          const list = zombiesRef.current;
          for (let si = 0; si < list.length; si++) {
            const nz = list[si];
            if (nz.id === z.id || nz.hp <= 0) continue;
            const d = Math.hypot(nz.x - z.x, nz.y - z.y);
            if (d <= solarRadius + nz.radius) {
              nz.hp -= solarBlastDmg;
              nz.isOnFire = true;
              nz.burnTimer = 3.5;
              const pa = Math.atan2(nz.y - z.y, nz.x - z.x);
              nz.knockbackX += Math.cos(pa) * 220 * (p.knockbackMult || 1);
              nz.knockbackY += Math.sin(pa) * 220 * (p.knockbackMult || 1);
              if (nz.hp <= 0) {
                handleZombieDeath(nz, depth + 1);
              }
            }
          }
        }

        const finalSplatColor = isAlienUnit
          ? (z.isBoss ? '#be185d' : z.type === ZombieType.ALIEN_DRONE ? '#7e22ce' : '#0e7490')
          : (z.isBoss ? '#6b21a8' : z.type === ZombieType.TOXIC_SPITTER ? '#3f6212' : z.type === ZombieType.RUNNER ? '#7f1d1d' : '#052e16');

        bloodSplatsRef.current.push({
          x: z.x,
          y: z.y,
          radius: z.radius * (1.2 + Math.random() * 0.6),
          alpha: 0.6,
          color: finalSplatColor,
        });
        if (bloodSplatsRef.current.length > 140) {
          bloodSplatsRef.current.shift();
        }

        const xpMult = 1 + (tokenUpgradesRef.current.token_crit_xp || 0) * 0.15;
        p.xp += Math.round(z.xpValue * xpMult);

        const activeShipKey: ShipTypeKey | null =
          p.currentWeapon === WeaponType.DESTRUCTOR
            ? 'DESTRUCTOR'
            : p.currentWeapon === WeaponType.INTERCEPTOR
              ? 'INTERCEPTOR'
              : p.currentWeapon === WeaponType.NAVE_REI
                ? 'NAVE_REI'
                : null;
        if (activeShipKey) {
          addShipMasteryXp(activeShipKey, z.isBoss ? 45 : 8);
          if (
            activeShipKey === 'INTERCEPTOR' &&
            destructorStateRef.current.warpActive &&
            hasMasteryNode(shipMasteryRef.current, 'INTERCEPTOR', 'int_frenzy')
          ) {
            masterySkillCooldownRef.current = Math.max(0, masterySkillCooldownRef.current - 0.45);
          }
          if (
            activeShipKey === 'NAVE_REI' &&
            destructorStateRef.current.warpActive &&
            hasMasteryNode(shipMasteryRef.current, 'NAVE_REI', 'rei_emperor') &&
            depth < 1
          ) {
            const rw = p.weapons[WeaponType.NAVE_REI] || INITIAL_WEAPONS[WeaponType.NAVE_REI];
            const empBlastDmg = Math.max(45, Math.round(rw.damage * 1.4));
            particlesRef.current.push({
              id: `rei-emp-kill-${Date.now()}-${Math.random()}`,
              type: 'FIRE_RING',
              x: z.x,
              y: z.y,
              vx: 0,
              vy: 0,
              radius: 12,
              growthSpeed: 380,
              color: '#ef4444',
              alpha: 0.9,
              decay: 0.06,
            });
            for (let ri = 0; ri < zombiesRef.current.length; ri++) {
              const rz = zombiesRef.current[ri];
              if (rz.id === z.id || rz.hp <= 0) continue;
              if (Math.hypot(rz.x - z.x, rz.y - z.y) <= 95 + rz.radius) {
                rz.hp -= empBlastDmg;
                if (rz.hp <= 0) handleZombieDeath(rz, depth + 1);
              }
            }
          }
        }

        spawnItemDrop(z.x, z.y);

        if (p.xp >= p.xpNeeded && !levelUpQueuedThisFrame) {
          levelUpQueuedThisFrame = true;
          handleLevelUp(p.level);
        }

        setZombiesRemaining((prev) => {
          const updated = Math.max(0, prev - 1);
          if (updated === 0) {
            waveActiveRef.current = false;
            p.coinsEarned = (p.coinsEarned || 0) + wave * 50;
            p.score = p.coinsEarned;
            waveSpawnTimerRef.current = window.setTimeout(() => {
              startNextWave(wave + 1);
            }, 2500);
          }
          return updated;
        });
      };

      // Helper: Chain Lightning Arc jumps across up to 3*level nearby enemies
      const triggerChainLightning = (sourceZ: Zombie, baseDamage: number, chainLevel: number) => {
        if (chainLevel <= 0) return;
        const lastChain = mythicCombatRef.current.chainLightningCooldowns[sourceZ.id] || 0;
        if (nowMs - lastChain < 220) return;
        mythicCombatRef.current.chainLightningCooldowns[sourceZ.id] = nowMs;

        const maxJumps = 3 * chainLevel;
        const jumpDmg = Math.max(8, Math.round(baseDamage * 0.48));
        const hitIds = new Set<string>([sourceZ.id]);
        let currX = sourceZ.x;
        let currY = sourceZ.y;
        let jumped = false;

        for (let jump = 0; jump < maxJumps; jump++) {
          let closest: Zombie | null = null;
          let minD = 240;
          for (let zi = 0; zi < zombiesRef.current.length; zi++) {
            const cand = zombiesRef.current[zi];
            if (cand.hp <= 0 || hitIds.has(cand.id)) continue;
            const dist = Math.hypot(cand.x - currX, cand.y - currY);
            if (dist < minD) {
              minD = dist;
              closest = cand;
            }
          }
          if (!closest) break;

          jumped = true;
          hitIds.add(closest.id);

          // Build jagged electric arc polyline
          const segs = 4;
          const arcPts: { x: number; y: number }[] = [];
          for (let s = 1; s <= segs; s++) {
            const frac = s / segs;
            const jitter = s === segs ? 0 : 14;
            arcPts.push({
              x: currX + (closest.x - currX) * frac + (Math.random() - 0.5) * jitter,
              y: currY + (closest.y - currY) * frac + (Math.random() - 0.5) * jitter,
            });
          }
          particlesRef.current.push({
            id: `chain-arc-${Date.now()}-${jump}-${Math.random()}`,
            type: 'ENERGY_ARC',
            x: currX,
            y: currY,
            vx: 0,
            vy: 0,
            radius: 2.5,
            color: jump % 2 === 0 ? '#38bdf8' : '#fde047',
            alpha: 1,
            decay: 0.16,
            points: arcPts,
          });

          closest.hp -= jumpDmg;
          closest.isStunned = true;
          closest.stunTimer = Math.max(closest.stunTimer, 0.24);
          if (closest.hp <= 0) {
            handleZombieDeath(closest);
          }
          currX = closest.x;
          currY = closest.y;
        }

        if (jumped) {
          sound.playChainLightning();
        }
      };

      // Helper: Escudo Cinético de Choque shockwave when shield takes damage
      const triggerShieldShock = () => {
        const sLevel = p.shieldShockLevel || 0;
        if (sLevel <= 0) return;
        sound.playGravityPulse();
        const shockRadius = 175 + (sLevel - 1) * 25;
        const shockDmg = 18 * sLevel;
        particlesRef.current.push({
          id: `shield-shock-${Date.now()}-${Math.random()}`,
          type: 'PLASMA_RING',
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: 18,
          growthSpeed: 420,
          color: '#22d3ee',
          alpha: 1,
          decay: 0.055,
        });
        for (let zi = 0; zi < zombiesRef.current.length; zi++) {
          const nz = zombiesRef.current[zi];
          if (nz.hp <= 0) continue;
          const dist = Math.hypot(nz.x - p.x, nz.y - p.y);
          if (dist <= shockRadius + nz.radius) {
            const pa = Math.atan2(nz.y - p.y, nz.x - p.x);
            nz.knockbackX += Math.cos(pa) * 460 * (p.knockbackMult || 1);
            nz.knockbackY += Math.sin(pa) * 460 * (p.knockbackMult || 1);
            nz.isStunned = true;
            nz.stunTimer = Math.max(nz.stunTimer, 0.85);
            nz.hp -= shockDmg;
            if (nz.hp <= 0) {
              handleZombieDeath(nz);
            }
          }
        }
      };

      // 1. GATHER MOVEMENT & AIM INPUTS FIRST
      let moveX = 0;
      let moveY = 0;

      if (leftJoystick.current.active) {
        moveX = leftJoystick.current.x;
        moveY = leftJoystick.current.y;
      } else {
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) moveY = -1;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) moveY = 1;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) moveX = -1;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) moveX = 1;

        if (moveX !== 0 && moveY !== 0) {
          const len = Math.sqrt(moveX * moveX + moveY * moveY);
          moveX /= len;
          moveY /= len;
        }
      }

      let shootingAngle = p.angle;
      let shouldFire = false;
      const isDestructor = p.currentWeapon === WeaponType.DESTRUCTOR;
      const isInterceptor = p.currentWeapon === WeaponType.INTERCEPTOR;
      const isRei = p.currentWeapon === WeaponType.NAVE_REI;
      const isEastDragon = p.currentWeapon === WeaponType.EAST_DRAGON;
      const isIronMan = p.currentWeapon === WeaponType.IRON_MAN;
      const isIceFireDragon = p.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON;
      const isShip = isDestructor || isInterceptor || isRei;
      const ds = destructorStateRef.current;
      const ed = eastDragonStateRef.current;
      const im = ironManStateRef.current;
      const ifd = iceFireDragonStateRef.current;

      let destructorTargetX = p.x + Math.cos(p.angle) * 300;
      let destructorTargetY = p.y + Math.sin(p.angle) * 300;

      if (isShip && !dyingRef.current?.active) {
        // Ships: blasters ALWAYS aim toward cursor (or right joystick) within ±30° gimbal cone;
        // ship hull rotates with silky-smooth exponential angular damping (no snap, no pause).
        if (rightJoystick.current.active) {
          const rx = rightJoystick.current.x;
          const ry = rightJoystick.current.y;
          const dragDist = Math.hypot(rx, ry);
          if (dragDist > 0.15) {
            const joyAngle = Math.atan2(ry, rx);
            destructorTargetX = p.x + Math.cos(joyAngle) * 360;
            destructorTargetY = p.y + Math.sin(joyAngle) * 360;
            shouldFire = true;
          }
        } else if (canvasRef.current) {
          if (hasMouseMovedRef.current) {
            const camLeft = cameraRef.current.x - canvasRef.current.width / 2;
            const camTop = cameraRef.current.y - canvasRef.current.height / 2;
            destructorTargetX = mousePos.current.x + camLeft;
            destructorTargetY = mousePos.current.y + camTop;
          }
          shouldFire = isMouseDown.current;
        }

        const desiredAimAngle = Math.atan2(destructorTargetY - p.y, destructorTargetX - p.x);
        shootingAngle = desiredAimAngle;

        const MAX_GIMBAL = Math.PI / 6; // 30 degrees each side
        let angleDiff = desiredAimAngle - p.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        let excess = 0;
        if (angleDiff > MAX_GIMBAL) {
          excess = angleDiff - MAX_GIMBAL;
        } else if (angleDiff < -MAX_GIMBAL) {
          excess = angleDiff + MAX_GIMBAL;
        }

        if (masterySkillCooldownRef.current > 0) {
          masterySkillCooldownRef.current = Math.max(0, masterySkillCooldownRef.current - dt);
        }
        const smNow = shipMasteryRef.current;

        // Smooth angular turn smoothing (no instant snap, no pause delay)
        const destTurnBoost =
          isDestructor && hasMasteryNode(smNow, 'DESTRUCTOR', 'dest_core') ? 1.15 : 1.0;
        const turnResponsiveness =
          (isRei ? 3.9 : isDestructor ? 5.2 : 6.8) * (ds.warpActive ? 1.25 : 1.0) * destTurnBoost;
        if (Math.abs(excess) > 0.001) {
          const lerpFactor = 1 - Math.exp(-turnResponsiveness * dt);
          const step = excess * lerpFactor;
          p.angle += step;
          ds.angularVel = dt > 0.0001 ? step / dt : 0;
        } else {
          ds.angularVel *= Math.exp(-12 * dt);
        }

        while (p.angle > Math.PI) p.angle -= Math.PI * 2;
        while (p.angle < -Math.PI) p.angle += Math.PI * 2;

        // Shift charge: 3s Warp (2.1s with Capacitor) or 6s Modo Fúria (4.5s with Reator Carmesim)
        const hasDestCapacitor = isDestructor && hasMasteryNode(smNow, 'DESTRUCTOR', 'dest_capacitor');
        const hasReiCore = isRei && hasMasteryNode(smNow, 'NAVE_REI', 'rei_crimson_core');
        const WARP_CHARGE_DURATION = isRei ? (hasReiCore ? 4.5 : 6.0) : hasDestCapacitor ? 2.1 : 3.0;
        const WARP_MODE_DURATION = isRei ? 10.0 : hasDestCapacitor ? 10.0 : 8.0;
        const holdingShift = !!keysPressed.current['shift'] || mobileWarpHoldingRef.current;

        if (!ds.warpActive) {
          if (holdingShift) {
            ds.warpChargeTimer = Math.min(WARP_CHARGE_DURATION, ds.warpChargeTimer + dt);
            ds.warpSoundTimer += dt;
            if (ds.warpSoundTimer >= 0.2) {
              ds.warpSoundTimer = 0;
              sound.playDestructorWarpChargeTick(ds.warpChargeTimer / WARP_CHARGE_DURATION);
            }

            // Nave Rei: emits crackling red electricity & particles during charge!
            const chargeP = ds.warpChargeTimer / WARP_CHARGE_DURATION;
            if (isRei && chargeP > 0.12 && Math.random() < 0.35 + chargeP * 0.55) {
              const arcStartA = Math.random() * Math.PI * 2;
              const arcPoints: { x: number; y: number }[] = [];
              let ax = p.x + Math.cos(arcStartA) * 26;
              let ay = p.y + Math.sin(arcStartA) * 26;
              for (let seg = 0; seg < 4; seg++) {
                const stepA = arcStartA + (Math.random() - 0.5) * 1.1;
                const stepL = 12 + Math.random() * 14;
                ax += Math.cos(stepA) * stepL;
                ay += Math.sin(stepA) * stepL;
                arcPoints.push({ x: ax, y: ay });
              }
              particlesRef.current.push({
                id: `rei-celec-${Date.now()}-${Math.random()}`,
                type: 'ENERGY_ARC',
                x: p.x,
                y: p.y,
                vx: 0,
                vy: 0,
                radius: 2.2,
                color: '#ef4444',
                alpha: 0.95,
                decay: 0.14,
                points: arcPoints,
              });
            }

            if (ds.warpChargeTimer >= WARP_CHARGE_DURATION) {
              ds.warpActive = true;
              ds.warpTimer = WARP_MODE_DURATION;
              ds.warpChargeTimer = 0;
              ds.warpSoundTimer = 0;
              if (isRei) {
                sound.playReiFuryActivate();
              } else {
                sound.playDestructorWarpActivate();
              }
              screenShakeRef.current = Math.min(30, screenShakeRef.current + (isRei ? 20 : 14));
              particlesRef.current.push({
                id: `warp-ring-1-${Date.now()}-${Math.random()}`,
                type: 'PLASMA_RING',
                x: p.x,
                y: p.y,
                vx: 0,
                vy: 0,
                radius: isRei ? 36 : 26,
                growthSpeed: isRei ? 520 : 420,
                color: isRei ? '#ef4444' : '#e879f9',
                alpha: 1,
                decay: 0.032,
              });
              particlesRef.current.push({
                id: `warp-ring-2-${Date.now()}-${Math.random()}`,
                type: 'PLASMA_RING',
                x: p.x,
                y: p.y,
                vx: 0,
                vy: 0,
                radius: 20,
                growthSpeed: isRei ? 380 : 300,
                color: isRei ? '#fbbf24' : isInterceptor ? '#00f5d4' : '#22d3ee',
                alpha: 1,
                decay: 0.038,
              });
            }
          } else {
            ds.warpChargeTimer = Math.max(0, ds.warpChargeTimer - dt * 2.5);
            ds.warpSoundTimer = 0;
          }
        } else {
          ds.warpTimer -= dt;
          if (hasReiCore && p.maxShield > 0 && p.shield < p.maxShield) {
            p.shield = Math.min(p.maxShield, p.shield + 14 * dt);
          }
          if (ds.warpTimer <= 0) {
            ds.warpActive = false;
            ds.warpTimer = 0;
          }
        }

        // Advance particle accelerator spheres rapidly (super-super-fast during Nave Rei Modo Fúria!)
        const chargeRatio = ds.warpActive ? 1 : ds.warpChargeTimer / WARP_CHARGE_DURATION;
        const accelSpeed = isRei
          ? (ds.warpActive ? 68 : 8 + Math.pow(chargeRatio, 1.25) * 48)
          : (ds.warpActive ? 42 : 7 + Math.pow(chargeRatio, 1.35) * 34);
        ds.orbitAngle = (ds.orbitAngle + accelSpeed * dt) % (Math.PI * 200);

        // Destructor Tier 3: Refração Orbital — accelerator spheres damage touching enemies
        if (
          isDestructor &&
          (ds.warpActive || ds.warpChargeTimer > 0.25) &&
          hasMasteryNode(smNow, 'DESTRUCTOR', 'dest_orbital_burn')
        ) {
          masteryCombatTimersRef.current.orbitalBurnTimer += dt;
          if (masteryCombatTimersRef.current.orbitalBurnTimer >= 0.22) {
            masteryCombatTimersRef.current.orbitalBurnTimer = 0;
            const dw = p.weapons[WeaponType.DESTRUCTOR] || INITIAL_WEAPONS[WeaponType.DESTRUCTOR];
            const orbSlashDmg = Math.max(24, Math.round(dw.damage * 0.9));
            for (let zi = 0; zi < zombiesRef.current.length; zi++) {
              const oz = zombiesRef.current[zi];
              if (oz.hp <= 0) continue;
              if (Math.hypot(oz.x - p.x, oz.y - p.y) <= 82 + oz.radius) {
                oz.hp -= orbSlashDmg;
                if (oz.hp <= 0) handleZombieDeath(oz);
              }
            }
          }
        }

        // Nave Rei Tier 3: Tempestade de Fúria — continuous red lightning arcs shock nearby enemies
        if (
          isRei &&
          (ds.warpActive || chargeRatio > 0.2) &&
          hasMasteryNode(smNow, 'NAVE_REI', 'rei_storm')
        ) {
          masteryCombatTimersRef.current.reiStormTimer += dt;
          if (masteryCombatTimersRef.current.reiStormTimer >= (ds.warpActive ? 0.26 : 0.45)) {
            masteryCombatTimersRef.current.reiStormTimer = 0;
            const rw = p.weapons[WeaponType.NAVE_REI] || INITIAL_WEAPONS[WeaponType.NAVE_REI];
            const shockDmg = Math.max(28, Math.round(rw.damage * (ds.warpActive ? 1.2 : 0.65)));
            for (let zi = 0; zi < zombiesRef.current.length; zi++) {
              const rz = zombiesRef.current[zi];
              if (rz.hp <= 0) continue;
              if (Math.hypot(rz.x - p.x, rz.y - p.y) <= 195 + rz.radius) {
                rz.hp -= shockDmg;
                rz.isStunned = true;
                rz.stunTimer = Math.max(rz.stunTimer, 0.25);
                if (rz.hp <= 0) handleZombieDeath(rz);
              }
            }
          }
        }

        // Nave Rei Modo Fúria: continuous dense crimson particles + red electricity bolts + proximity shock
        if (isRei && ds.warpActive) {
          for (let fp = 0; fp < 4; fp++) {
            const pa = Math.random() * Math.PI * 2;
            const spd = 95 + Math.random() * 190;
            particlesRef.current.push({
              id: `rei-fury-pt-${Date.now()}-${fp}-${Math.random()}`,
              type: fp % 2 === 0 ? 'SPARK' : 'MUZZLE',
              x: p.x + Math.cos(pa) * (20 + Math.random() * 24),
              y: p.y + Math.sin(pa) * (20 + Math.random() * 24),
              vx: Math.cos(pa) * spd,
              vy: Math.sin(pa) * spd,
              radius: 2.5 + Math.random() * 3.0,
              color: fp === 0 ? '#fca5a5' : fp % 2 === 0 ? '#ef4444' : '#dc2626',
              alpha: 1,
              decay: 0.05,
            });
          }
          for (let eb = 0; eb < 2; eb++) {
            const arcStartA = Math.random() * Math.PI * 2;
            const arcPoints: { x: number; y: number }[] = [];
            let ax = p.x + Math.cos(arcStartA) * 24;
            let ay = p.y + Math.sin(arcStartA) * 24;
            for (let seg = 0; seg < 4; seg++) {
              const stepA = arcStartA + (Math.random() - 0.5) * 1.1;
              const stepL = 16 + Math.random() * 18;
              ax += Math.cos(stepA) * stepL;
              ay += Math.sin(stepA) * stepL;
              arcPoints.push({ x: ax, y: ay });
            }
            particlesRef.current.push({
              id: `rei-felec-${Date.now()}-${eb}-${Math.random()}`,
              type: 'ENERGY_ARC',
              x: p.x,
              y: p.y,
              vx: 0,
              vy: 0,
              radius: 2.6,
              color: eb === 0 ? '#ef4444' : '#fca5a5',
              alpha: 1,
              decay: 0.16,
              points: arcPoints,
            });
          }
        }

        ds.hudSyncTimer += dt;
        if (ds.hudSyncTimer >= 0.08) {
          ds.hudSyncTimer = 0;
          setDestructorWarpHud({
            chargeProgress: ds.warpChargeTimer / WARP_CHARGE_DURATION,
            active: ds.warpActive,
            remainingRatio: ds.warpActive ? Math.max(0, ds.warpTimer / WARP_MODE_DURATION) : 0,
            remainingSeconds: ds.warpActive ? Math.max(0, ds.warpTimer) : 0,
            chargeDuration: WARP_CHARGE_DURATION,
          });
          syncMasterySkillHud(p.currentWeapon, masterySkillCooldownRef.current);
        }
      } else {
        if (ds.isFiring || ds.laserChargeProgress > 0 || ds.warpActive || ds.warpChargeTimer > 0 || ds.angularVel !== 0) {
          ds.isFiring = false;
          ds.laserChargeProgress = 0;
          ds.warpActive = false;
          ds.warpChargeTimer = 0;
          ds.warpTimer = 0;
          ds.angularVel = 0;
          mobileWarpHoldingRef.current = false;
          setDestructorWarpHud({
            chargeProgress: 0,
            active: false,
            remainingRatio: 0,
            remainingSeconds: 0,
            chargeDuration: 3.0,
          });
        }

        if (isEastDragon) {
          // East Dragon smoothly turns its horned head toward cursor / right joystick
          if (rightJoystick.current.active) {
            const rx = rightJoystick.current.x;
            const ry = rightJoystick.current.y;
            const dragDist = Math.hypot(rx, ry);
            if (dragDist > 0.15) {
              const targetAng = Math.atan2(ry, rx);
              let diff = targetAng - p.angle;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              p.angle += diff * (1 - Math.exp(-10 * dt));
              shootingAngle = p.angle;
              shouldFire = true;
            }
          } else if (canvasRef.current && (hasMouseMovedRef.current || isMouseDown.current)) {
            const camLeft = cameraRef.current.x - canvasRef.current.width / 2;
            const camTop = cameraRef.current.y - canvasRef.current.height / 2;
            const screenPlayerX = p.x - camLeft;
            const screenPlayerY = p.y - camTop;
            const targetAng = Math.atan2(mousePos.current.y - screenPlayerY, mousePos.current.x - screenPlayerX);
            let diff = targetAng - p.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            p.angle += diff * (1 - Math.exp(-10 * dt));
            shootingAngle = p.angle;
            shouldFire = isMouseDown.current;
          } else if (moveX !== 0 || moveY !== 0) {
            const targetAng = Math.atan2(moveY, moveX);
            let diff = targetAng - p.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            p.angle += diff * (1 - Math.exp(-8 * dt));
            shootingAngle = p.angle;
          }
          while (p.angle > Math.PI) p.angle -= Math.PI * 2;
          while (p.angle < -Math.PI) p.angle += Math.PI * 2;
        } else {
          if (rightJoystick.current.active) {
            const rx = rightJoystick.current.x;
            const ry = rightJoystick.current.y;
            const dragDist = Math.hypot(rx, ry);
            if (dragDist > 0.15) {
              shootingAngle = Math.atan2(ry, rx);
              p.angle = shootingAngle;
              shouldFire = true;
            }
          } else if (isMouseDown.current && canvasRef.current) {
            const camLeft = cameraRef.current.x - canvasRef.current.width / 2;
            const camTop = cameraRef.current.y - canvasRef.current.height / 2;
            const screenPlayerX = p.x - camLeft;
            const screenPlayerY = p.y - camTop;
            const dx = mousePos.current.x - screenPlayerX;
            const dy = mousePos.current.y - screenPlayerY;
            shootingAngle = Math.atan2(dy, dx);
            p.angle = shootingAngle;
            shouldFire = true;
          } else if (moveX !== 0 || moveY !== 0) {
            p.angle = Math.atan2(moveY, moveX);
          }
        }
      }

      if (dyingRef.current?.active) {
        moveX = 0;
        moveY = 0;
        shouldFire = false;
        ds.isFiring = false;
        ds.laserChargeProgress = 0;
        ed.isFiring = false;
        ed.beamExtension = 0;
        im.isFiring = false;
        im.laserChargeProgress = 0;
        ifd.isFiring = false;
        ifd.beamExtension = 0;
      }

      // 2. PLAYER POSITION UPDATE
      const warpSpeedMult = isShip && ds.warpActive
        ? (isInterceptor ? 2.85 : isRei ? 2.25 : 2.65)
        : isEastDragon
          ? 1.15
          : isIronMan
            ? 1.12
            : 1.0;
      p.vx = moveX * p.speed * warpSpeedMult;
      p.vy = moveY * p.speed * warpSpeedMult;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Constrain player in arena bounds
      p.x = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.x));
      p.y = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.y));

      // Keep ship blaster geometry & rear twin thruster trails locked to post-movement coords
      if (isShip && !dyingRef.current?.active) {
        if (isRei) {
          ds.reiBlasters = getReiBlastersWorld(p.x, p.y, p.angle, destructorTargetX, destructorTargetY);
        } else {
          const geo = isInterceptor
            ? getInterceptorBlastersWorld(p.x, p.y, p.angle, destructorTargetX, destructorTargetY)
            : getDestructorBlastersWorld(p.x, p.y, p.angle, destructorTargetX, destructorTargetY);
          ds.leftBlasterAngle = geo.leftAngle;
          ds.rightBlasterAngle = geo.rightAngle;
          ds.leftMuzzleX = geo.leftMuzzleX;
          ds.leftMuzzleY = geo.leftMuzzleY;
          ds.rightMuzzleX = geo.rightMuzzleX;
          ds.rightMuzzleY = geo.rightMuzzleY;
        }
        ds.isFiring = shouldFire;
        if (shouldFire) {
          ds.laserChargeProgress = Math.min(1, ds.laserChargeProgress + dt / 0.26);
        } else {
          ds.laserChargeProgress = 0;
        }

        // Compute world nozzle coordinates for BOTH rear thrusters
        const nozzleXOffset = isRei ? -24 : -17;
        const nozzleYOffset = isRei ? 12 : isInterceptor ? 9 : 8.5;
        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);
        const leftNozzleX = p.x + (nozzleXOffset * cosA - -nozzleYOffset * sinA);
        const leftNozzleY = p.y + (nozzleXOffset * sinA + -nozzleYOffset * cosA);
        const rightNozzleX = p.x + (nozzleXOffset * cosA - nozzleYOffset * sinA);
        const rightNozzleY = p.y + (nozzleXOffset * sinA + nozzleYOffset * cosA);

        const movingNow = Math.hypot(p.vx || 0, p.vy || 0) > 8;
        const trailMaxLife = ds.warpActive ? 0.56 : 0.36;

        // Decay existing thruster trail nodes
        for (let ti = 0; ti < ds.leftTrail.length; ti++) {
          ds.leftTrail[ti].life -= dt;
        }
        for (let ti = 0; ti < ds.rightTrail.length; ti++) {
          ds.rightTrail[ti].life -= dt;
        }
        ds.leftTrail = ds.leftTrail.filter((pt) => pt.life > 0);
        ds.rightTrail = ds.rightTrail.filter((pt) => pt.life > 0);

        if (movingNow || ds.warpActive) {
          ds.leftTrail.push({
            x: leftNozzleX,
            y: leftNozzleY,
            life: trailMaxLife,
            maxLife: trailMaxLife,
            warp: ds.warpActive,
          });
          ds.rightTrail.push({
            x: rightNozzleX,
            y: rightNozzleY,
            life: trailMaxLife,
            maxLife: trailMaxLife,
            warp: ds.warpActive,
          });
          const maxPts = ds.warpActive ? 42 : 28;
          if (ds.leftTrail.length > maxPts) ds.leftTrail.splice(0, ds.leftTrail.length - maxPts);
          if (ds.rightTrail.length > maxPts) ds.rightTrail.splice(0, ds.rightTrail.length - maxPts);
        }

        // High-speed Warp / Fury Mode plasma afterburner streaks
        if (ds.warpActive && (Math.abs(p.vx) > 20 || Math.abs(p.vy) > 20)) {
          for (let ws = 0; ws < 2; ws++) {
            particlesRef.current.push({
              id: `warp-spark-${Date.now()}-${ws}-${Math.random()}`,
              type: 'SPARK',
              x: p.x - Math.cos(p.angle) * (isRei ? 24 : 18) + (Math.random() - 0.5) * 18,
              y: p.y - Math.sin(p.angle) * (isRei ? 24 : 18) + (Math.random() - 0.5) * 18,
              vx: -p.vx * 0.28 + (Math.random() - 0.5) * 45,
              vy: -p.vy * 0.28 + (Math.random() - 0.5) * 45,
              radius: 2.2 + Math.random() * 2.2,
              color: isRei ? (ws % 2 === 0 ? '#ef4444' : '#fbbf24') : ws % 2 === 0 ? '#e879f9' : isInterceptor ? '#00f5d4' : '#22d3ee',
              alpha: 0.9,
              decay: 0.06,
            });
          }
        }
      } else {
        ds.leftTrail = [];
        ds.rightTrail = [];
      }

      // Update East Dragon articulated worm-like serpentine body segments & forward-extending fire beam
      if (isEastDragon && !dyingRef.current?.active) {
        const nowSec = nowMs * 0.001;
        const movingNow = Math.hypot(p.vx || 0, p.vy || 0) > 8;
        const wasEdFiring = ed.isFiring;
        ed.isFiring = shouldFire;
        if (shouldFire) {
          if (!wasEdFiring) {
            ed.beamExtension = 0.04;
          } else {
            ed.beamExtension = Math.min(1, ed.beamExtension + dt / 0.22);
          }
        } else {
          ed.beamExtension = 0;
        }
        const effDragonBeamLen = 980 * Math.max(0.04, ed.beamExtension);
        ed.muzzleX = p.x + Math.cos(p.angle) * 26;
        ed.muzzleY = p.y + Math.sin(p.angle) * 26;
        ed.beamEndX = ed.muzzleX + Math.cos(p.angle) * effDragonBeamLen;
        ed.beamEndY = ed.muzzleY + Math.sin(p.angle) * effDragonBeamLen;

        let targetX = p.x - Math.cos(p.angle) * 8;
        let targetY = p.y - Math.sin(p.angle) * 8;
        const segs = ed.segments;
        for (let si = 0; si < segs.length; si++) {
          const seg = segs[si];
          const dxS = targetX - seg.x;
          const dyS = targetY - seg.y;
          const distS = Math.hypot(dxS, dyS) || 0.001;
          const ang = Math.atan2(dyS, dxS);
          const waveAmp = (movingNow ? 2.6 : 1.4) * Math.sin(nowSec * 7.2 - si * 0.62);
          const perpX = -Math.sin(ang) * waveAmp;
          const perpY = Math.cos(ang) * waveAmp;

          seg.x = targetX - (dxS / distS) * DRAGON_SEGMENT_SPACING + perpX * dt * 16;
          seg.y = targetY - (dyS / distS) * DRAGON_SEGMENT_SPACING + perpY * dt * 16;
          seg.angle = ang;

          targetX = seg.x;
          targetY = seg.y;
        }

        // Ambient fire embers trailing off dragon spine & tail
        ed.emberTimer += dt;
        if (ed.emberTimer >= (movingNow || ed.isFiring ? 0.045 : 0.11)) {
          ed.emberTimer = 0;
          const randSeg = segs[Math.floor(Math.random() * segs.length)] || { x: p.x, y: p.y };
          particlesRef.current.push({
            id: `ed-ember-${Date.now()}-${Math.random()}`,
            type: Math.random() < 0.45 ? 'FLAME' : 'SPARK',
            x: randSeg.x + (Math.random() - 0.5) * 14,
            y: randSeg.y + (Math.random() - 0.5) * 14,
            vx: -(p.vx || 0) * 0.18 + (Math.random() - 0.5) * 40,
            vy: -(p.vy || 0) * 0.18 - 25 - Math.random() * 35,
            radius: 2.2 + Math.random() * 2.5,
            color: Math.random() < 0.5 ? '#f97316' : '#fde047',
            alpha: 0.9,
            decay: 0.055,
          });
        }
      } else {
        ed.isFiring = false;
        ed.beamExtension = 0;
      }

      // Update Iron Man jet trail & laser charge state
      if (isIronMan && !dyingRef.current?.active) {
        im.isFiring = shouldFire;
        if (shouldFire && im.mode === 'LASER') {
          im.laserChargeProgress = Math.min(1, im.laserChargeProgress + dt / 0.26);
        } else {
          im.laserChargeProgress = 0;
        }
        im.muzzleX = p.x + Math.cos(p.angle) * 20;
        im.muzzleY = p.y + Math.sin(p.angle) * 20;
        im.beamEndX = im.muzzleX + Math.cos(p.angle) * 950;
        im.beamEndY = im.muzzleY + Math.sin(p.angle) * 950;

        for (let ti = 0; ti < im.trail.length; ti++) {
          im.trail[ti].life -= dt;
        }
        im.trail = im.trail.filter((pt) => pt.life > 0);
        const movingNow = Math.hypot(p.vx || 0, p.vy || 0) > 8;
        if (movingNow) {
          const backX = p.x - Math.cos(p.angle) * 15;
          const backY = p.y - Math.sin(p.angle) * 15;
          im.trail.push({
            x: backX,
            y: backY,
            life: 0.34,
            maxLife: 0.34,
            warp: im.mode === 'LASER',
          });
          if (im.trail.length > 28) im.trail.splice(0, im.trail.length - 28);
        }
      } else {
        im.isFiring = false;
        im.laserChargeProgress = 0;
        im.trail = [];
      }

      // Update Ice & Fire Dragon dual companions & Mega Purple Dragon fusion
      if (isIceFireDragon && !dyingRef.current?.active) {
        const nowSec = nowMs * 0.001;
        const movingNow = Math.hypot(p.vx || 0, p.vy || 0) > 8;

        if (ifd.merged) {
          ifd.mergeTimer -= dt;
          if (ifd.mergeTimer <= 0) {
            ifd.merged = false;
            ifd.mergeTimer = 0;
            ifd.mergeCooldown = ICE_FIRE_MERGE_COOLDOWN;
            const splitX = ifd.megaHead.x;
            const splitY = ifd.megaHead.y;
            ifd.fireHead.x = splitX - Math.sin(p.angle) * -28;
            ifd.fireHead.y = splitY + Math.cos(p.angle) * -28;
            ifd.iceHead.x = splitX - Math.sin(p.angle) * 28;
            ifd.iceHead.y = splitY + Math.cos(p.angle) * 28;
            particlesRef.current.push({
              id: `ifd-split-${Date.now()}-${Math.random()}`,
              type: 'PLASMA_RING',
              x: splitX,
              y: splitY,
              vx: 0,
              vy: 0,
              radius: 18,
              growthSpeed: 320,
              color: '#c084fc',
              alpha: 0.9,
              decay: 0.055,
            });
          }
        } else if (ifd.mergeCooldown > 0) {
          ifd.mergeCooldown = Math.max(0, ifd.mergeCooldown - dt);
        }

        const wasIfdFiring = ifd.isFiring;
        ifd.isFiring = shouldFire;
        if (shouldFire) {
          if (!wasIfdFiring) {
            ifd.beamExtension = 0.04;
          } else {
            ifd.beamExtension = Math.min(1, ifd.beamExtension + dt / 0.2);
          }
        } else {
          ifd.beamExtension = 0;
        }

        let companionAimAngle = p.angle;
        if (rightJoystick.current.active && Math.hypot(rightJoystick.current.x, rightJoystick.current.y) > 0.15) {
          companionAimAngle = Math.atan2(rightJoystick.current.y, rightJoystick.current.x);
        } else if (canvasRef.current && (hasMouseMovedRef.current || isMouseDown.current)) {
          const camLeft = cameraRef.current.x - canvasRef.current.width / 2;
          const camTop = cameraRef.current.y - canvasRef.current.height / 2;
          companionAimAngle = Math.atan2(
            mousePos.current.y - (p.y - camTop),
            mousePos.current.x - (p.x - camLeft)
          );
        }

        const updateSerpentineChain = (
          headX: number,
          headY: number,
          headAngle: number,
          segs: DragonSegment[],
          spacing: number,
          phaseOffset: number
        ) => {
          let tx = headX - Math.cos(headAngle) * (spacing * 0.7);
          let ty = headY - Math.sin(headAngle) * (spacing * 0.7);
          for (let si = 0; si < segs.length; si++) {
            const seg = segs[si];
            const dxS = tx - seg.x;
            const dyS = ty - seg.y;
            const distS = Math.hypot(dxS, dyS) || 0.001;
            const ang = Math.atan2(dyS, dxS);
            const waveAmp = (movingNow ? 2.4 : 1.4) * Math.sin(nowSec * 7.4 - si * 0.6 + phaseOffset);
            seg.x = tx - (dxS / distS) * spacing - Math.sin(ang) * waveAmp * dt * 16;
            seg.y = ty - (dyS / distS) * spacing + Math.cos(ang) * waveAmp * dt * 16;
            seg.angle = ang;
            tx = seg.x;
            ty = seg.y;
          }
        };

        const steerAngle = (cur: number, tgt: number, rate: number) => {
          let diff = tgt - cur;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          let next = cur + diff * (1 - Math.exp(-rate * dt));
          while (next > Math.PI) next -= Math.PI * 2;
          while (next < -Math.PI) next += Math.PI * 2;
          return next;
        };

        const posFactor = 1 - Math.exp(-10.5 * dt);

        if (!ifd.merged) {
          const fireActive = ifd.activeDragon === 'FIRE';
          const iceActive = ifd.activeDragon === 'ICE';
          const bobF = Math.sin(nowSec * 4.2) * 5;
          const bobI = Math.cos(nowSec * 4.2) * 5;

          const fireTargetX = fireActive
            ? p.x + Math.cos(companionAimAngle) * 34 - Math.sin(companionAimAngle) * -28
            : p.x - Math.cos(p.angle) * 26 - Math.sin(p.angle) * -46;
          const fireTargetY = (fireActive
            ? p.y + Math.sin(companionAimAngle) * 34 + Math.cos(companionAimAngle) * -28
            : p.y - Math.sin(p.angle) * 26 + Math.cos(p.angle) * -46) + bobF;
          const fireDesiredAng = fireActive ? companionAimAngle : p.angle;

          ifd.fireHead.x += (fireTargetX - ifd.fireHead.x) * posFactor;
          ifd.fireHead.y += (fireTargetY - ifd.fireHead.y) * posFactor;
          ifd.fireHead.angle = steerAngle(ifd.fireHead.angle, fireDesiredAng, 13);
          updateSerpentineChain(ifd.fireHead.x, ifd.fireHead.y, ifd.fireHead.angle, ifd.fireSegments, 10, 0);

          const iceTargetX = iceActive
            ? p.x + Math.cos(companionAimAngle) * 34 - Math.sin(companionAimAngle) * 28
            : p.x - Math.cos(p.angle) * 26 - Math.sin(p.angle) * 46;
          const iceTargetY = (iceActive
            ? p.y + Math.sin(companionAimAngle) * 34 + Math.cos(companionAimAngle) * 28
            : p.y - Math.sin(p.angle) * 26 + Math.cos(p.angle) * 46) + bobI;
          const iceDesiredAng = iceActive ? companionAimAngle : p.angle;

          ifd.iceHead.x += (iceTargetX - ifd.iceHead.x) * posFactor;
          ifd.iceHead.y += (iceTargetY - ifd.iceHead.y) * posFactor;
          ifd.iceHead.angle = steerAngle(ifd.iceHead.angle, iceDesiredAng, 13);
          updateSerpentineChain(ifd.iceHead.x, ifd.iceHead.y, ifd.iceHead.angle, ifd.iceSegments, 10, Math.PI);

          const attackerHead = fireActive ? ifd.fireHead : ifd.iceHead;
          const beamLen = 960 * Math.max(0.04, ifd.beamExtension);
          ifd.muzzleX = attackerHead.x + Math.cos(attackerHead.angle) * 22;
          ifd.muzzleY = attackerHead.y + Math.sin(attackerHead.angle) * 22;
          ifd.beamEndX = ifd.muzzleX + Math.cos(attackerHead.angle) * beamLen;
          ifd.beamEndY = ifd.muzzleY + Math.sin(attackerHead.angle) * beamLen;

          ifd.emberTimer += dt;
          if (ifd.emberTimer >= 0.065) {
            ifd.emberTimer = 0;
            const fs = ifd.fireSegments[Math.floor(Math.random() * ifd.fireSegments.length)] || ifd.fireHead;
            particlesRef.current.push({
              id: `ifd-femb-${Date.now()}-${Math.random()}`,
              type: 'FLAME',
              x: fs.x + (Math.random() - 0.5) * 10,
              y: fs.y + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 26,
              vy: -22 - Math.random() * 25,
              radius: 2.0 + Math.random() * 2.0,
              color: Math.random() < 0.5 ? '#f97316' : '#fde047',
              alpha: 0.85,
              decay: 0.065,
            });
            const isg = ifd.iceSegments[Math.floor(Math.random() * ifd.iceSegments.length)] || ifd.iceHead;
            particlesRef.current.push({
              id: `ifd-iemb-${Date.now()}-${Math.random()}`,
              type: 'SPARK',
              x: isg.x + (Math.random() - 0.5) * 10,
              y: isg.y + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 26,
              vy: -14 - Math.random() * 22,
              radius: 2.0 + Math.random() * 1.8,
              color: Math.random() < 0.5 ? '#38bdf8' : '#e0f2fe',
              alpha: 0.85,
              decay: 0.065,
            });
          }
        } else {
          // Mega Purple Dragon formation
          const megaTargetX = p.x + Math.cos(companionAimAngle) * 48;
          const megaTargetY = p.y + Math.sin(companionAimAngle) * 48 + Math.sin(nowSec * 3.8) * 5;
          ifd.megaHead.x += (megaTargetX - ifd.megaHead.x) * posFactor;
          ifd.megaHead.y += (megaTargetY - ifd.megaHead.y) * posFactor;
          ifd.megaHead.angle = steerAngle(ifd.megaHead.angle, companionAimAngle, 12);
          updateSerpentineChain(ifd.megaHead.x, ifd.megaHead.y, ifd.megaHead.angle, ifd.megaSegments, 15.5, 0);

          const beamLen = 1120 * Math.max(0.04, ifd.beamExtension);
          ifd.muzzleX = ifd.megaHead.x + Math.cos(ifd.megaHead.angle) * 40;
          ifd.muzzleY = ifd.megaHead.y + Math.sin(ifd.megaHead.angle) * 40;
          ifd.beamEndX = ifd.muzzleX + Math.cos(ifd.megaHead.angle) * beamLen;
          ifd.beamEndY = ifd.muzzleY + Math.sin(ifd.megaHead.angle) * beamLen;

          ifd.emberTimer += dt;
          if (ifd.emberTimer >= 0.04) {
            ifd.emberTimer = 0;
            const ms = ifd.megaSegments[Math.floor(Math.random() * ifd.megaSegments.length)] || ifd.megaHead;
            particlesRef.current.push({
              id: `ifd-memb-${Date.now()}-${Math.random()}`,
              type: 'SPARK',
              x: ms.x + (Math.random() - 0.5) * 18,
              y: ms.y + (Math.random() - 0.5) * 18,
              vx: (Math.random() - 0.5) * 42,
              vy: -25 - Math.random() * 32,
              radius: 2.5 + Math.random() * 2.5,
              color: Math.random() < 0.5 ? '#c084fc' : '#f0abfc',
              alpha: 0.92,
              decay: 0.055,
            });
          }
        }

        ifd.hudSyncTimer += dt;
        if (ifd.hudSyncTimer >= 0.08) {
          ifd.hudSyncTimer = 0;
          setIceFireDragonHud({
            activeDragon: ifd.activeDragon,
            merged: ifd.merged,
            mergeTimer: Math.max(0, ifd.mergeTimer),
            mergeDuration: ICE_FIRE_MERGE_DURATION,
            cooldown: Math.max(0, ifd.mergeCooldown),
            maxCooldown: ICE_FIRE_MERGE_COOLDOWN,
          });
        }
      } else {
        if (ifd.isFiring || ifd.beamExtension > 0) {
          ifd.isFiring = false;
          ifd.beamExtension = 0;
        }
      }

      // Update continuous flame stream spine points (for non-fireball liquid fire jet)
      if (flameStreamRef.current.length > 0) {
        const nextStream: FlameStreamPoint[] = [];
        const streamList = flameStreamRef.current;
        for (let f = 0; f < streamList.length; f++) {
          const fp = streamList[f];
          fp.age += dt;
          if (fp.age < fp.maxAge) {
            fp.x += fp.vx * dt;
            fp.y += fp.vy * dt;
            const drag = Math.exp(-1.15 * dt);
            fp.vx *= drag;
            fp.vy *= drag;
            const curl = Math.sin(fp.age * 16 + fp.seed) * 32 * dt;
            fp.x += -Math.sin(Math.atan2(fp.vy, fp.vx)) * curl;
            fp.y += Math.cos(Math.atan2(fp.vy, fp.vx)) * curl;
            nextStream.push(fp);
          }
        }
        flameStreamRef.current = nextStream;
      }

      // Fire weapons: Destructor continuous twin laser beams vs regular projectiles
      if (isDestructor) {
        if (shouldFire && !dyingRef.current?.active) {
          const dw = p.weapons[WeaponType.DESTRUCTOR] || INITIAL_WEAPONS[WeaponType.DESTRUCTOR];
          const tickInterval = 1 / Math.max(1, dw.fireRate);
          ds.beamTickTimer += dt;
          ds.beamSoundTimer += dt;

          if (ds.beamSoundTimer >= 0.085) {
            ds.beamSoundTimer = 0;
            sound.playDestructorLaserTick(ds.warpActive);
          }

          if (ds.beamTickTimer >= tickInterval) {
            ds.beamTickTimer = 0;
            const BEAM_RANGE = 950;
            const lEndX = ds.leftMuzzleX + Math.cos(ds.leftBlasterAngle) * BEAM_RANGE;
            const lEndY = ds.leftMuzzleY + Math.sin(ds.leftBlasterAngle) * BEAM_RANGE;
            const rEndX = ds.rightMuzzleX + Math.cos(ds.rightBlasterAngle) * BEAM_RANGE;
            const rEndY = ds.rightMuzzleY + Math.sin(ds.rightBlasterAngle) * BEAM_RANGE;

            // MYTHIC CHRONO-REAPER: Flanking spectral plasma lances on Destructor fire cycles
            if (p.mythicSplitShot && p.mythicSplitShot > 0) {
              mythicCombatRef.current.destructorSplitCounter += 1;
              if (mythicCombatRef.current.destructorSplitCounter >= 2) {
                mythicCombatRef.current.destructorSplitCounter = 0;
                const midAngle = shootingAngle;
                [-0.22, 0.22].forEach((offset, idx) => {
                  const sa = midAngle + offset;
                  bulletsRef.current.push({
                    id: `d-split-${Date.now()}-${idx}-${Math.random()}`,
                    x: p.x + Math.cos(sa) * 24,
                    y: p.y + Math.sin(sa) * 24,
                    vx: Math.cos(sa) * 920,
                    vy: Math.sin(sa) * 920,
                    radius: 5.5,
                    damage: Math.round(dw.damage * 1.15 * (p.mythicSplitShot || 1)),
                    piercingRemaining: 4,
                    color: '#e879f9',
                    distanceTraveled: 0,
                    maxDistance: 800,
                    ownerAngle: sa,
                    isRay: true,
                  });
                });
              }
            }

            // MYTHIC SINGULARITY: Nova Shot every 3 Destructor beam cycles
            if (p.mythicSingularity && p.mythicSingularity > 0) {
              mythicCombatRef.current.novaShotCounter += 1;
              if (mythicCombatRef.current.novaShotCounter >= 3) {
                mythicCombatRef.current.novaShotCounter = 0;
                const novaCount = 12;
                const novaDmg = Math.round(dw.damage * 1.45 * p.mythicSingularity);
                for (let ni = 0; ni < novaCount; ni++) {
                  const na = (ni * Math.PI * 2) / novaCount + p.angle * 0.3;
                  bulletsRef.current.push({
                    id: `d-nova-${Date.now()}-${ni}-${Math.random()}`,
                    x: p.x + Math.cos(na) * 22,
                    y: p.y + Math.sin(na) * 22,
                    vx: Math.cos(na) * 780,
                    vy: Math.sin(na) * 780,
                    radius: 6,
                    damage: novaDmg,
                    piercingRemaining: 4,
                    color: ni % 2 === 0 ? '#38bdf8' : '#f0abfc',
                    distanceTraveled: 0,
                    maxDistance: 560,
                    ownerAngle: na,
                    isRay: true,
                  });
                }
                particlesRef.current.push({
                  id: `d-nova-ring-${Date.now()}-${Math.random()}`,
                  type: 'MYTHIC_NOVA',
                  x: p.x,
                  y: p.y,
                  vx: 0,
                  vy: 0,
                  radius: 16,
                  growthSpeed: 420,
                  color: '#38bdf8',
                  alpha: 0.9,
                  decay: 0.045,
                });
              }
            }

            const pointToSegDist = (
              px: number,
              py: number,
              ax: number,
              ay: number,
              bx: number,
              by: number
            ) => {
              const abx = bx - ax;
              const aby = by - ay;
              const abLenSq = abx * abx + aby * aby;
              if (abLenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
              const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
              return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
            };

            const smBeam = shipMasteryRef.current;
            const hasDestPrism = hasMasteryNode(smBeam, 'DESTRUCTOR', 'dest_prism');
            const hasDestSingularity =
              ds.warpActive && hasMasteryNode(smBeam, 'DESTRUCTOR', 'dest_singularity');
            const cEndX = p.x + Math.cos(shootingAngle) * BEAM_RANGE;
            const cEndY = p.y + Math.sin(shootingAngle) * BEAM_RANGE;

            const enemyList = zombiesRef.current;
            for (let zi = 0; zi < enemyList.length; zi++) {
              const z = enemyList[zi];
              if (z.hp <= 0) continue;

              const hitRadius = z.radius + 9;
              const hitLeft =
                pointToSegDist(z.x, z.y, ds.leftMuzzleX, ds.leftMuzzleY, lEndX, lEndY) <= hitRadius;
              const hitRight =
                pointToSegDist(z.x, z.y, ds.rightMuzzleX, ds.rightMuzzleY, rEndX, rEndY) <= hitRadius;
              const hitCenter =
                hasDestSingularity &&
                pointToSegDist(z.x, z.y, p.x, p.y, cEndX, cEndY) <= z.radius + 14;

              if (!hitLeft && !hitRight && !hitCenter) continue;

              const beamsHit = (hitLeft ? 1 : 0) + (hitRight ? 1 : 0) + (hitCenter ? 2 : 0);
              let tickDmg = dw.damage * beamsHit * (ds.warpActive ? 1.25 : 1.0);
              const effCrit = (p.critChance || 0) + (hasDestPrism ? 0.12 : 0);
              if (effCrit > 0 && Math.random() < effCrit) {
                tickDmg = Math.round(tickDmg * (p.critMultiplier || 2));
                particlesRef.current.push({
                  id: `dcrit-${Date.now()}-${Math.random()}`,
                  type: 'SPARK',
                  x: z.x,
                  y: z.y - 12,
                  vx: (Math.random() - 0.5) * 40,
                  vy: -60,
                  radius: 3.5,
                  color: '#fbbf24',
                  alpha: 1,
                  decay: 0.05,
                });
              }

              z.hp -= Math.round(tickDmg);
              const hitAngle = hitLeft ? ds.leftBlasterAngle : ds.rightBlasterAngle;
              const kbBoost = (p.knockbackMult || 1) * (hasDestPrism ? 1.35 : 1);
              z.knockbackX += Math.cos(hitAngle) * 45 * kbBoost;
              z.knockbackY += Math.sin(hitAngle) * 45 * kbBoost;
              z.isStunned = true;
              z.stunTimer = 0.04;

              if (p.chainLightningLevel && p.chainLightningLevel > 0) {
                triggerChainLightning(z, tickDmg, p.chainLightningLevel);
              }

              for (let k = 0; k < 2; k++) {
                const sAng = hitAngle + Math.PI + (Math.random() * 1.4 - 0.7);
                const sSpd = 65 + Math.random() * 105;
                particlesRef.current.push({
                  id: `dlhit-${Date.now()}-${k}-${Math.random()}`,
                  type: 'SPARK',
                  x: z.x + (Math.random() - 0.5) * z.radius,
                  y: z.y + (Math.random() - 0.5) * z.radius,
                  vx: Math.cos(sAng) * sSpd,
                  vy: Math.sin(sAng) * sSpd,
                  radius: 1.6 + Math.random() * 1.6,
                  color: ds.warpActive ? '#e879f9' : '#22d3ee',
                  alpha: 1,
                  decay: 0.06,
                });
              }

              if (z.hp <= 0) {
                handleZombieDeath(z);
              }
            }
          }
        } else {
          ds.beamTickTimer = 0.06;
          ds.beamSoundTimer = 0.085;
        }
      } else if (isInterceptor) {
        if (shouldFire && !dyingRef.current?.active) {
          const iw = p.weapons[WeaponType.INTERCEPTOR] || INITIAL_WEAPONS[WeaponType.INTERCEPTOR];
          const effRate = iw.fireRate * (ds.warpActive ? 1.35 : 1.0);
          const shotInterval = 1 / Math.max(1, effRate);
          ds.beamTickTimer += dt;
          ds.beamSoundTimer += dt;

          if (ds.beamTickTimer >= shotInterval) {
            ds.beamTickTimer = 0;
            const orbColor = ds.warpActive ? '#e879f9' : iw.color || '#00f5d4';
            const orbSpeed = iw.bulletSpeed * (ds.warpActive ? 1.2 : 1.0);
            const spread = iw.spread || 0.025;

            if (ds.beamSoundTimer >= 0.05) {
              ds.beamSoundTimer = 0;
              sound.playInterceptorOrb(ds.warpActive);
            }

            const smInt = shipMasteryRef.current;
            const hasIntHoming = hasMasteryNode(smInt, 'INTERCEPTOR', 'int_homing');
            const hasIntFrenzy = ds.warpActive && hasMasteryNode(smInt, 'INTERCEPTOR', 'int_frenzy');
            const hasIntNova = hasMasteryNode(smInt, 'INTERCEPTOR', 'int_nova_orb');
            const hasIntSwarm = ds.warpActive && hasMasteryNode(smInt, 'INTERCEPTOR', 'int_swarm');

            masteryCombatTimersRef.current.orbBurstCount += 1;
            const isExplosiveBurst = hasIntNova && masteryCombatTimersRef.current.orbBurstCount >= 5;
            if (isExplosiveBurst) {
              masteryCombatTimersRef.current.orbBurstCount = 0;
            }

            // Fire twin rapid plasma orbs from BOTH long-wingtip blasters (+2 parallel in Swarm Warp)
            const blasters = [
              { x: ds.leftMuzzleX, y: ds.leftMuzzleY, angle: ds.leftBlasterAngle },
              { x: ds.rightMuzzleX, y: ds.rightMuzzleY, angle: ds.rightBlasterAngle },
            ];
            const swarmOffsets = hasIntSwarm ? [-0.085, 0.085] : [0];
            const baseOrbDmg = Math.round(
              iw.damage * (ds.warpActive ? 1.25 : 1.0) * (hasIntFrenzy ? 1.25 : 1.0)
            );
            for (let bi = 0; bi < blasters.length; bi++) {
              const bl = blasters[bi];
              for (let si = 0; si < swarmOffsets.length; si++) {
                const a = bl.angle + swarmOffsets[si] + (Math.random() * spread * 2 - spread);
                bulletsRef.current.push({
                  id: `iorb-${Date.now()}-${bi}-${si}-${Math.random()}`,
                  x: bl.x,
                  y: bl.y,
                  vx: Math.cos(a) * orbSpeed,
                  vy: Math.sin(a) * orbSpeed,
                  radius: isExplosiveBurst ? 7.5 : ds.warpActive ? 6.2 : 5.4,
                  damage: isExplosiveBurst ? Math.round(baseOrbDmg * 1.45) : baseOrbDmg,
                  piercingRemaining: iw.piercing,
                  color: isExplosiveBurst ? '#fbbf24' : orbColor,
                  distanceTraveled: 0,
                  maxDistance: 900,
                  ownerAngle: a,
                  isOrb: true,
                  isBomb: isExplosiveBurst && si === 0,
                  homingStrength: hasIntHoming ? 4.2 : 0,
                  weaponType: WeaponType.INTERCEPTOR,
                });
              }
            }

            // MYTHIC CHRONO-REAPER: Flanking spectral orbs
            if (p.mythicSplitShot && p.mythicSplitShot > 0) {
              mythicCombatRef.current.destructorSplitCounter += 1;
              if (mythicCombatRef.current.destructorSplitCounter >= 2) {
                mythicCombatRef.current.destructorSplitCounter = 0;
                [-0.22, 0.22].forEach((offset, idx) => {
                  const sa = shootingAngle + offset;
                  bulletsRef.current.push({
                    id: `i-split-${Date.now()}-${idx}-${Math.random()}`,
                    x: p.x + Math.cos(sa) * 24,
                    y: p.y + Math.sin(sa) * 24,
                    vx: Math.cos(sa) * 1100,
                    vy: Math.sin(sa) * 1100,
                    radius: 5.5,
                    damage: Math.round(iw.damage * 1.3 * (p.mythicSplitShot || 1)),
                    piercingRemaining: 4,
                    color: '#e879f9',
                    distanceTraveled: 0,
                    maxDistance: 840,
                    ownerAngle: sa,
                    isOrb: true,
                  });
                });
              }
            }

            // MYTHIC SINGULARITY: Nova Shot every 3 Interceptor orb cycles
            if (p.mythicSingularity && p.mythicSingularity > 0) {
              mythicCombatRef.current.novaShotCounter += 1;
              if (mythicCombatRef.current.novaShotCounter >= 4) {
                mythicCombatRef.current.novaShotCounter = 0;
                const novaCount = 12;
                const novaDmg = Math.round(iw.damage * 1.65 * p.mythicSingularity);
                for (let ni = 0; ni < novaCount; ni++) {
                  const na = (ni * Math.PI * 2) / novaCount + p.angle * 0.3;
                  bulletsRef.current.push({
                    id: `i-nova-${Date.now()}-${ni}-${Math.random()}`,
                    x: p.x + Math.cos(na) * 22,
                    y: p.y + Math.sin(na) * 22,
                    vx: Math.cos(na) * 860,
                    vy: Math.sin(na) * 860,
                    radius: 6,
                    damage: novaDmg,
                    piercingRemaining: 4,
                    color: ni % 2 === 0 ? '#00f5d4' : '#e879f9',
                    distanceTraveled: 0,
                    maxDistance: 580,
                    ownerAngle: na,
                    isOrb: true,
                  });
                }
              }
            }
          }
        } else {
          ds.beamTickTimer = 0.05;
          ds.beamSoundTimer = 0.05;
        }
      } else if (isRei) {
        if (shouldFire && !dyingRef.current?.active && ds.reiBlasters.length === 4) {
          const rw = p.weapons[WeaponType.NAVE_REI] || INITIAL_WEAPONS[WeaponType.NAVE_REI];
          const tickInterval = 1 / Math.max(1, rw.fireRate * (ds.warpActive ? 1.25 : 1.0));
          ds.beamTickTimer += dt;
          ds.beamSoundTimer += dt;

          if (ds.beamSoundTimer >= 0.09) {
            ds.beamSoundTimer = 0;
            sound.playReiLaserTick(ds.warpActive);
          }

          if (ds.beamTickTimer >= tickInterval) {
            ds.beamTickTimer = 0;
            const BEAM_RANGE = ds.warpActive ? 1150 : 980;
            const beamEnds = ds.reiBlasters.map((b) => ({
              ax: b.muzzleX,
              ay: b.muzzleY,
              bx: b.muzzleX + Math.cos(b.angle) * BEAM_RANGE,
              by: b.muzzleY + Math.sin(b.angle) * BEAM_RANGE,
              angle: b.angle,
            }));

            // MYTHIC CHRONO-REAPER & SINGULARITY support for Nave Rei
            if (p.mythicSplitShot && p.mythicSplitShot > 0) {
              mythicCombatRef.current.destructorSplitCounter += 1;
              if (mythicCombatRef.current.destructorSplitCounter >= 2) {
                mythicCombatRef.current.destructorSplitCounter = 0;
                [-0.24, 0.24].forEach((offset, idx) => {
                  const sa = shootingAngle + offset;
                  bulletsRef.current.push({
                    id: `r-split-${Date.now()}-${idx}-${Math.random()}`,
                    x: p.x + Math.cos(sa) * 32,
                    y: p.y + Math.sin(sa) * 32,
                    vx: Math.cos(sa) * 980,
                    vy: Math.sin(sa) * 980,
                    radius: 6,
                    damage: Math.round(rw.damage * 1.25 * (p.mythicSplitShot || 1)),
                    piercingRemaining: 4,
                    color: ds.warpActive ? '#ef4444' : '#fbbf24',
                    distanceTraveled: 0,
                    maxDistance: 840,
                    ownerAngle: sa,
                    isRay: true,
                  });
                });
              }
            }

            if (p.mythicSingularity && p.mythicSingularity > 0) {
              mythicCombatRef.current.novaShotCounter += 1;
              if (mythicCombatRef.current.novaShotCounter >= 3) {
                mythicCombatRef.current.novaShotCounter = 0;
                const novaCount = 12;
                const novaDmg = Math.round(rw.damage * 1.55 * p.mythicSingularity);
                for (let ni = 0; ni < novaCount; ni++) {
                  const na = (ni * Math.PI * 2) / novaCount + p.angle * 0.3;
                  bulletsRef.current.push({
                    id: `r-nova-${Date.now()}-${ni}-${Math.random()}`,
                    x: p.x + Math.cos(na) * 28,
                    y: p.y + Math.sin(na) * 28,
                    vx: Math.cos(na) * 820,
                    vy: Math.sin(na) * 820,
                    radius: 6.5,
                    damage: novaDmg,
                    piercingRemaining: 4,
                    color: ds.warpActive ? '#ef4444' : '#fbbf24',
                    distanceTraveled: 0,
                    maxDistance: 600,
                    ownerAngle: na,
                    isRay: true,
                  });
                }
              }
            }

            const pointToSegDist = (
              px: number,
              py: number,
              ax: number,
              ay: number,
              bx: number,
              by: number
            ) => {
              const abx = bx - ax;
              const aby = by - ay;
              const abLenSq = abx * abx + aby * aby;
              if (abLenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
              const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
              return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
            };

            const smRei = shipMasteryRef.current;
            const hasReiLethal = hasMasteryNode(smRei, 'NAVE_REI', 'rei_lethal');
            const hasReiEmperor = ds.warpActive && hasMasteryNode(smRei, 'NAVE_REI', 'rei_emperor');
            if (hasReiEmperor) {
              [-0.18, 0.18].forEach((flankOff) => {
                const fa = shootingAngle + flankOff;
                beamEnds.push({
                  ax: p.x + Math.cos(fa) * 28,
                  ay: p.y + Math.sin(fa) * 28,
                  bx: p.x + Math.cos(fa) * BEAM_RANGE,
                  by: p.y + Math.sin(fa) * BEAM_RANGE,
                  angle: fa,
                });
              });
            }

            const furyMult = ds.warpActive ? (hasReiLethal ? 3.25 : 2.5) : 1.0;
            const beamExtraRadius = ds.warpActive ? 20 : 10;
            const enemyList = zombiesRef.current;

            for (let zi = 0; zi < enemyList.length; zi++) {
              const z = enemyList[zi];
              if (z.hp <= 0) continue;

              const hitRadius = z.radius + beamExtraRadius;
              let beamsHit = 0;
              let hitAngle = shootingAngle;
              for (let bi = 0; bi < beamEnds.length; bi++) {
                const be = beamEnds[bi];
                if (pointToSegDist(z.x, z.y, be.ax, be.ay, be.bx, be.by) <= hitRadius) {
                  beamsHit += 1;
                  hitAngle = be.angle;
                }
              }
              if (beamsHit === 0) continue;

              let tickDmg = rw.damage * beamsHit * furyMult;
              if (p.critChance && Math.random() < p.critChance) {
                tickDmg = Math.round(tickDmg * (p.critMultiplier || 2));
              }

              z.hp -= Math.round(tickDmg);
              if (hasReiLethal && p.hp < p.maxHp) {
                p.hp = Math.min(p.maxHp, p.hp + Math.max(0.5, tickDmg * 0.008));
              }
              z.knockbackX += Math.cos(hitAngle) * (ds.warpActive ? 95 : 52) * (p.knockbackMult || 1);
              z.knockbackY += Math.sin(hitAngle) * (ds.warpActive ? 95 : 52) * (p.knockbackMult || 1);
              z.isStunned = true;
              z.stunTimer = ds.warpActive ? 0.08 : 0.04;

              if (p.chainLightningLevel && p.chainLightningLevel > 0) {
                triggerChainLightning(z, tickDmg, p.chainLightningLevel);
              }

              for (let k = 0; k < (ds.warpActive ? 3 : 2); k++) {
                const sAng = hitAngle + Math.PI + (Math.random() * 1.4 - 0.7);
                const sSpd = 80 + Math.random() * 130;
                particlesRef.current.push({
                  id: `rlhit-${Date.now()}-${k}-${Math.random()}`,
                  type: 'SPARK',
                  x: z.x + (Math.random() - 0.5) * z.radius,
                  y: z.y + (Math.random() - 0.5) * z.radius,
                  vx: Math.cos(sAng) * sSpd,
                  vy: Math.sin(sAng) * sSpd,
                  radius: ds.warpActive ? 2.4 + Math.random() * 2.2 : 1.7 + Math.random() * 1.5,
                  color: ds.warpActive ? (k % 2 === 0 ? '#ef4444' : '#fca5a5') : '#fbbf24',
                  alpha: 1,
                  decay: 0.055,
                });
              }

              if (z.hp <= 0) {
                handleZombieDeath(z);
              }
            }
          }
        } else {
          ds.beamTickTimer = 0.05;
          ds.beamSoundTimer = 0.09;
        }
      } else if (isEastDragon) {
        if (shouldFire && !dyingRef.current?.active) {
          const edw = p.weapons[WeaponType.EAST_DRAGON] || INITIAL_WEAPONS[WeaponType.EAST_DRAGON];
          const tickInterval = 1 / Math.max(1, edw.fireRate);
          ed.beamTickTimer += dt;
          ed.beamSoundTimer += dt;

          if (ed.beamSoundTimer >= 0.085) {
            ed.beamSoundTimer = 0;
            sound.playEastDragonFireLaserTick();
          }

          // Stream vivid flame tongues & fire sparks radiating along the fire-laser beam every frame
          const beamDx = ed.beamEndX - ed.muzzleX;
          const beamDy = ed.beamEndY - ed.muzzleY;
          for (let fb = 0; fb < 2; fb++) {
            const distFrac = Math.random() * 0.65;
            const spreadPerp = (Math.random() - 0.5) * 14;
            const px = ed.muzzleX + beamDx * distFrac - Math.sin(p.angle) * spreadPerp;
            const py = ed.muzzleY + beamDy * distFrac + Math.cos(p.angle) * spreadPerp;
            const flameSpd = 210 + Math.random() * 230;
            const fAng = p.angle + (Math.random() - 0.5) * 0.22;
            particlesRef.current.push({
              id: `ed-flame-${Date.now()}-${fb}-${Math.random()}`,
              type: 'FLAME',
              x: px,
              y: py,
              vx: Math.cos(fAng) * flameSpd,
              vy: Math.sin(fAng) * flameSpd,
              radius: 3.4 + Math.random() * 3.8,
              color: Math.random() < 0.45 ? '#fde047' : Math.random() < 0.7 ? '#f97316' : '#ef4444',
              alpha: 0.95,
              decay: 0.075,
            });
          }

          if (ed.beamTickTimer >= tickInterval) {
            ed.beamTickTimer = 0;

            // MYTHIC CHRONO-REAPER & SINGULARITY support for East Dragon
            if (p.mythicSplitShot && p.mythicSplitShot > 0) {
              mythicCombatRef.current.destructorSplitCounter += 1;
              if (mythicCombatRef.current.destructorSplitCounter >= 2) {
                mythicCombatRef.current.destructorSplitCounter = 0;
                [-0.22, 0.22].forEach((offset, idx) => {
                  const sa = p.angle + offset;
                  bulletsRef.current.push({
                    id: `ed-split-${Date.now()}-${idx}-${Math.random()}`,
                    x: ed.muzzleX,
                    y: ed.muzzleY,
                    vx: Math.cos(sa) * 960,
                    vy: Math.sin(sa) * 960,
                    radius: 6,
                    damage: Math.round(edw.damage * 1.2 * (p.mythicSplitShot || 1)),
                    piercingRemaining: 4,
                    color: '#f97316',
                    distanceTraveled: 0,
                    maxDistance: 800,
                    ownerAngle: sa,
                    isRay: true,
                  });
                });
              }
            }

            if (p.mythicSingularity && p.mythicSingularity > 0) {
              mythicCombatRef.current.novaShotCounter += 1;
              if (mythicCombatRef.current.novaShotCounter >= 3) {
                mythicCombatRef.current.novaShotCounter = 0;
                const novaCount = 12;
                const novaDmg = Math.round(edw.damage * 1.5 * p.mythicSingularity);
                for (let ni = 0; ni < novaCount; ni++) {
                  const na = (ni * Math.PI * 2) / novaCount + p.angle * 0.3;
                  bulletsRef.current.push({
                    id: `ed-nova-${Date.now()}-${ni}-${Math.random()}`,
                    x: p.x + Math.cos(na) * 24,
                    y: p.y + Math.sin(na) * 24,
                    vx: Math.cos(na) * 800,
                    vy: Math.sin(na) * 800,
                    radius: 6.5,
                    damage: novaDmg,
                    piercingRemaining: 4,
                    color: ni % 2 === 0 ? '#f97316' : '#fde047',
                    distanceTraveled: 0,
                    maxDistance: 580,
                    ownerAngle: na,
                    isRay: true,
                  });
                }
              }
            }

            const pointToSegDist = (
              px: number,
              py: number,
              ax: number,
              ay: number,
              bx: number,
              by: number
            ) => {
              const abx = bx - ax;
              const aby = by - ay;
              const abLenSq = abx * abx + aby * aby;
              if (abLenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
              const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
              return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
            };

            const enemyList = zombiesRef.current;
            for (let zi = 0; zi < enemyList.length; zi++) {
              const z = enemyList[zi];
              if (z.hp <= 0) continue;

              const hitRadius = z.radius + 16;
              if (
                pointToSegDist(z.x, z.y, ed.muzzleX, ed.muzzleY, ed.beamEndX, ed.beamEndY) > hitRadius
              ) {
                continue;
              }

              let tickDmg = edw.damage;
              if (p.critChance && Math.random() < p.critChance) {
                tickDmg = Math.round(tickDmg * (p.critMultiplier || 2));
              }

              z.hp -= Math.round(tickDmg);
              // Ignite every monster hit by East Dragon's fire laser!
              z.isOnFire = true;
              z.burnTimer = 4.0;

              z.knockbackX += Math.cos(p.angle) * 58 * (p.knockbackMult || 1);
              z.knockbackY += Math.sin(p.angle) * 58 * (p.knockbackMult || 1);
              z.isStunned = true;
              z.stunTimer = 0.04;

              if (p.chainLightningLevel && p.chainLightningLevel > 0) {
                triggerChainLightning(z, tickDmg, p.chainLightningLevel);
              }

              // Fiery impact burst (flames + sparks + occasional fire shockwave ring)
              for (let k = 0; k < 3; k++) {
                const sAng = p.angle + Math.PI + (Math.random() * 1.8 - 0.9);
                const sSpd = 75 + Math.random() * 125;
                particlesRef.current.push({
                  id: `edhit-${Date.now()}-${k}-${Math.random()}`,
                  type: k === 0 ? 'FLAME' : 'SPARK',
                  x: z.x + (Math.random() - 0.5) * z.radius,
                  y: z.y + (Math.random() - 0.5) * z.radius,
                  vx: Math.cos(sAng) * sSpd,
                  vy: Math.sin(sAng) * sSpd,
                  radius: k === 0 ? 4.2 + Math.random() * 2.5 : 2 + Math.random() * 2,
                  color: k % 2 === 0 ? '#f97316' : '#fde047',
                  alpha: 1,
                  decay: 0.06,
                });
              }

              if (Math.random() < 0.22) {
                particlesRef.current.push({
                  id: `edring-${Date.now()}-${Math.random()}`,
                  type: 'FIRE_RING',
                  x: z.x,
                  y: z.y,
                  vx: 0,
                  vy: 0,
                  radius: 10,
                  growthSpeed: 190,
                  color: '#f97316',
                  alpha: 0.85,
                  decay: 0.08,
                });
              }

              if (z.hp <= 0) {
                handleZombieDeath(z);
              }
            }
          }
        } else {
          ed.beamTickTimer = 0.04;
          ed.beamSoundTimer = 0.085;
        }
      } else if (isIronMan) {
        if (shouldFire && !dyingRef.current?.active) {
          const imw = p.weapons[WeaponType.IRON_MAN] || INITIAL_WEAPONS[WeaponType.IRON_MAN];
          if (im.mode === 'REPULSOR') {
            // MODO REPULSOR: High-velocity alternating palm repulsor plasma blasts
            const shotInterval = 1 / Math.max(1, imw.fireRate);
            im.repulsorTimer += dt;
            if (im.repulsorTimer >= shotInterval) {
              im.repulsorTimer = 0;
              im.handToggle = im.handToggle === 0 ? 1 : 0;
              const sideSign = im.handToggle === 0 ? -1 : 1;
              const cosA = Math.cos(p.angle);
              const sinA = Math.sin(p.angle);
              const spawnX = p.x + cosA * 22 - sinA * (sideSign * 13.5);
              const spawnY = p.y + sinA * 22 + cosA * (sideSign * 13.5);
              const spreadA = (Math.random() * 2 - 1) * (imw.spread || 0.02);
              const shotA = shootingAngle + spreadA;
              const repulsorDmg = Math.round(imw.damage * 1.45);

              sound.playIronManRepulsor();
              bulletsRef.current.push({
                id: `im-rep-${Date.now()}-${Math.random()}`,
                x: spawnX,
                y: spawnY,
                vx: Math.cos(shotA) * imw.bulletSpeed,
                vy: Math.sin(shotA) * imw.bulletSpeed,
                radius: 6.2,
                damage: repulsorDmg,
                piercingRemaining: imw.piercing,
                color: '#38bdf8',
                distanceTraveled: 0,
                maxDistance: 920,
                ownerAngle: shotA,
                isOrb: true,
                weaponType: WeaponType.IRON_MAN,
              });

              for (let sp = 0; sp < 3; sp++) {
                const sA = shotA + (Math.random() - 0.5) * 0.7;
                const sSpd = 120 + Math.random() * 140;
                particlesRef.current.push({
                  id: `im-muzz-${Date.now()}-${sp}-${Math.random()}`,
                  type: 'SPARK',
                  x: spawnX,
                  y: spawnY,
                  vx: Math.cos(sA) * sSpd,
                  vy: Math.sin(sA) * sSpd,
                  radius: 2 + Math.random() * 1.5,
                  color: sp === 0 ? '#ffffff' : '#38bdf8',
                  alpha: 0.95,
                  decay: 0.08,
                });
              }

              // Mythic support (Chrono-Reaper split + Singularity nova)
              if (p.mythicSplitShot && p.mythicSplitShot > 0) {
                [-0.18, 0.18].forEach((offset, idx) => {
                  const sa = shotA + offset;
                  bulletsRef.current.push({
                    id: `im-split-${Date.now()}-${idx}-${Math.random()}`,
                    x: spawnX,
                    y: spawnY,
                    vx: Math.cos(sa) * imw.bulletSpeed,
                    vy: Math.sin(sa) * imw.bulletSpeed,
                    radius: 5.5,
                    damage: Math.round(repulsorDmg * 0.85 * (p.mythicSplitShot || 1)),
                    piercingRemaining: 4,
                    color: '#e879f9',
                    distanceTraveled: 0,
                    maxDistance: 860,
                    ownerAngle: sa,
                    isOrb: true,
                  });
                });
              }
              if (p.mythicSingularity && p.mythicSingularity > 0) {
                mythicCombatRef.current.novaShotCounter += 1;
                if (mythicCombatRef.current.novaShotCounter >= 5) {
                  mythicCombatRef.current.novaShotCounter = 0;
                  const novaCount = 12;
                  const novaDmg = Math.round(repulsorDmg * 1.45 * p.mythicSingularity);
                  for (let ni = 0; ni < novaCount; ni++) {
                    const na = (ni * Math.PI * 2) / novaCount + p.angle * 0.3;
                    bulletsRef.current.push({
                      id: `im-rnova-${Date.now()}-${ni}-${Math.random()}`,
                      x: p.x + Math.cos(na) * 20,
                      y: p.y + Math.sin(na) * 20,
                      vx: Math.cos(na) * 900,
                      vy: Math.sin(na) * 900,
                      radius: 6,
                      damage: novaDmg,
                      piercingRemaining: 4,
                      color: ni % 2 === 0 ? '#38bdf8' : '#e879f9',
                      distanceTraveled: 0,
                      maxDistance: 600,
                      ownerAngle: na,
                      isOrb: true,
                    });
                  }
                }
              }
            }
          } else {
            // MODO LASER: Continuous thermal crimson-gold laser beam (starts thin -> swells thick)
            const tickInterval = 1 / 20;
            im.beamTickTimer += dt;
            im.beamSoundTimer += dt;

            if (im.beamSoundTimer >= 0.085) {
              im.beamSoundTimer = 0;
              sound.playIronManLaserTick();
            }

            if (im.beamTickTimer >= tickInterval) {
              im.beamTickTimer = 0;

              if (p.mythicSplitShot && p.mythicSplitShot > 0) {
                mythicCombatRef.current.destructorSplitCounter += 1;
                if (mythicCombatRef.current.destructorSplitCounter >= 2) {
                  mythicCombatRef.current.destructorSplitCounter = 0;
                  [-0.22, 0.22].forEach((offset, idx) => {
                    const sa = p.angle + offset;
                    bulletsRef.current.push({
                      id: `im-lsplit-${Date.now()}-${idx}-${Math.random()}`,
                      x: im.muzzleX,
                      y: im.muzzleY,
                      vx: Math.cos(sa) * 980,
                      vy: Math.sin(sa) * 980,
                      radius: 5.5,
                      damage: Math.round(imw.damage * 1.15 * (p.mythicSplitShot || 1)),
                      piercingRemaining: 4,
                      color: '#ef4444',
                      distanceTraveled: 0,
                      maxDistance: 820,
                      ownerAngle: sa,
                      isRay: true,
                    });
                  });
                }
              }

              if (p.mythicSingularity && p.mythicSingularity > 0) {
                mythicCombatRef.current.novaShotCounter += 1;
                if (mythicCombatRef.current.novaShotCounter >= 3) {
                  mythicCombatRef.current.novaShotCounter = 0;
                  const novaCount = 12;
                  const novaDmg = Math.round(imw.damage * 1.5 * p.mythicSingularity);
                  for (let ni = 0; ni < novaCount; ni++) {
                    const na = (ni * Math.PI * 2) / novaCount + p.angle * 0.3;
                    bulletsRef.current.push({
                      id: `im-lnova-${Date.now()}-${ni}-${Math.random()}`,
                      x: p.x + Math.cos(na) * 20,
                      y: p.y + Math.sin(na) * 20,
                      vx: Math.cos(na) * 840,
                      vy: Math.sin(na) * 840,
                      radius: 6,
                      damage: novaDmg,
                      piercingRemaining: 4,
                      color: ni % 2 === 0 ? '#ef4444' : '#fbbf24',
                      distanceTraveled: 0,
                      maxDistance: 580,
                      ownerAngle: na,
                      isRay: true,
                    });
                  }
                }
              }

              const pointToSegDist = (
                px: number,
                py: number,
                ax: number,
                ay: number,
                bx: number,
                by: number
              ) => {
                const abx = bx - ax;
                const aby = by - ay;
                const abLenSq = abx * abx + aby * aby;
                if (abLenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
                const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
                return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
              };

              const enemyList = zombiesRef.current;
              for (let zi = 0; zi < enemyList.length; zi++) {
                const z = enemyList[zi];
                if (z.hp <= 0) continue;

                const hitRadius = z.radius + 14;
                if (
                  pointToSegDist(z.x, z.y, im.muzzleX, im.muzzleY, im.beamEndX, im.beamEndY) > hitRadius
                ) {
                  continue;
                }

                let tickDmg = imw.damage * 0.95;
                if (p.critChance && Math.random() < p.critChance) {
                  tickDmg = Math.round(tickDmg * (p.critMultiplier || 2));
                }

                z.hp -= Math.round(tickDmg);
                z.knockbackX += Math.cos(p.angle) * 50 * (p.knockbackMult || 1);
                z.knockbackY += Math.sin(p.angle) * 50 * (p.knockbackMult || 1);
                z.isStunned = true;
                z.stunTimer = 0.04;

                if (p.chainLightningLevel && p.chainLightningLevel > 0) {
                  triggerChainLightning(z, tickDmg, p.chainLightningLevel);
                }

                for (let k = 0; k < 2; k++) {
                  const sAng = p.angle + Math.PI + (Math.random() * 1.4 - 0.7);
                  const sSpd = 70 + Math.random() * 115;
                  particlesRef.current.push({
                    id: `im-lhit-${Date.now()}-${k}-${Math.random()}`,
                    type: 'SPARK',
                    x: z.x + (Math.random() - 0.5) * z.radius,
                    y: z.y + (Math.random() - 0.5) * z.radius,
                    vx: Math.cos(sAng) * sSpd,
                    vy: Math.sin(sAng) * sSpd,
                    radius: 1.8 + Math.random() * 1.8,
                    color: k === 0 ? '#fbbf24' : '#ef4444',
                    alpha: 1,
                    decay: 0.06,
                  });
                }

                if (z.hp <= 0) {
                  handleZombieDeath(z);
                }
              }
            }
          }
        } else {
          im.repulsorTimer = 0.08;
          im.beamTickTimer = 0.04;
          im.beamSoundTimer = 0.085;
        }
      } else if (isIceFireDragon) {
        if (shouldFire && !dyingRef.current?.active) {
          const ifdw =
            p.weapons[WeaponType.ICE_AND_FIRE_DRAGON] ||
            INITIAL_WEAPONS[WeaponType.ICE_AND_FIRE_DRAGON];
          const tickInterval = 1 / Math.max(1, ifdw.fireRate);
          ifd.beamTickTimer += dt;
          ifd.beamSoundTimer += dt;

          const activeAng = ifd.merged
            ? ifd.megaHead.angle
            : ifd.activeDragon === 'FIRE'
              ? ifd.fireHead.angle
              : ifd.iceHead.angle;

          if (ifd.beamSoundTimer >= 0.095) {
            ifd.beamSoundTimer = 0;
            if (ifd.merged) {
              sound.playPurpleMegaLaser();
            } else if (ifd.activeDragon === 'FIRE') {
              sound.playDragonBeam();
            } else {
              sound.playDragonIceBeam();
            }
          }

          // Stream elemental particles along the active dragon beam
          const bDx = ifd.beamEndX - ifd.muzzleX;
          const bDy = ifd.beamEndY - ifd.muzzleY;
          for (let fb = 0; fb < 2; fb++) {
            const frac = Math.random() * 0.7;
            const perp = (Math.random() - 0.5) * (ifd.merged ? 26 : 14);
            const px = ifd.muzzleX + bDx * frac - Math.sin(activeAng) * perp;
            const py = ifd.muzzleY + bDy * frac + Math.cos(activeAng) * perp;
            const spd = (ifd.merged ? 260 : 210) + Math.random() * 200;
            const fAng = activeAng + (Math.random() - 0.5) * 0.22;
            const pColor = ifd.merged
              ? fb === 0
                ? '#e879f9'
                : '#a855f7'
              : ifd.activeDragon === 'FIRE'
                ? fb === 0
                  ? '#fde047'
                  : '#f97316'
                : fb === 0
                  ? '#e0f2fe'
                  : '#38bdf8';
            particlesRef.current.push({
              id: `ifd-beam-pt-${Date.now()}-${fb}-${Math.random()}`,
              type: ifd.activeDragon === 'FIRE' && !ifd.merged ? 'FLAME' : 'SPARK',
              x: px,
              y: py,
              vx: Math.cos(fAng) * spd,
              vy: Math.sin(fAng) * spd,
              radius: (ifd.merged ? 4.2 : 3.0) + Math.random() * 2.8,
              color: pColor,
              alpha: 0.95,
              decay: 0.075,
            });
          }

          if (ifd.beamTickTimer >= tickInterval) {
            ifd.beamTickTimer = 0;

            if (p.mythicSplitShot && p.mythicSplitShot > 0) {
              mythicCombatRef.current.destructorSplitCounter += 1;
              if (mythicCombatRef.current.destructorSplitCounter >= 2) {
                mythicCombatRef.current.destructorSplitCounter = 0;
                [-0.22, 0.22].forEach((offset, idx) => {
                  const sa = activeAng + offset;
                  bulletsRef.current.push({
                    id: `ifd-split-${Date.now()}-${idx}-${Math.random()}`,
                    x: ifd.muzzleX,
                    y: ifd.muzzleY,
                    vx: Math.cos(sa) * 980,
                    vy: Math.sin(sa) * 980,
                    radius: 6,
                    damage: Math.round(ifdw.damage * (ifd.merged ? 1.8 : 1.15) * (p.mythicSplitShot || 1)),
                    piercingRemaining: 4,
                    color: ifd.merged ? '#c084fc' : ifd.activeDragon === 'FIRE' ? '#f97316' : '#38bdf8',
                    distanceTraveled: 0,
                    maxDistance: 820,
                    ownerAngle: sa,
                    isRay: true,
                  });
                });
              }
            }

            if (p.mythicSingularity && p.mythicSingularity > 0) {
              mythicCombatRef.current.novaShotCounter += 1;
              if (mythicCombatRef.current.novaShotCounter >= 3) {
                mythicCombatRef.current.novaShotCounter = 0;
                const novaCount = 12;
                const novaDmg = Math.round(ifdw.damage * 1.5 * p.mythicSingularity);
                for (let ni = 0; ni < novaCount; ni++) {
                  const na = (ni * Math.PI * 2) / novaCount + activeAng * 0.3;
                  bulletsRef.current.push({
                    id: `ifd-nova-${Date.now()}-${ni}-${Math.random()}`,
                    x: ifd.muzzleX,
                    y: ifd.muzzleY,
                    vx: Math.cos(na) * 820,
                    vy: Math.sin(na) * 820,
                    radius: 6.5,
                    damage: novaDmg,
                    piercingRemaining: 4,
                    color: ni % 2 === 0 ? '#a855f7' : ifd.activeDragon === 'FIRE' ? '#f97316' : '#38bdf8',
                    distanceTraveled: 0,
                    maxDistance: 600,
                    ownerAngle: na,
                    isRay: true,
                  });
                }
              }
            }

            const pointToSegDist = (
              px: number,
              py: number,
              ax: number,
              ay: number,
              bx: number,
              by: number
            ) => {
              const abx = bx - ax;
              const aby = by - ay;
              const abLenSq = abx * abx + aby * aby;
              if (abLenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
              const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
              return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
            };

            const enemyList = zombiesRef.current;
            for (let zi = 0; zi < enemyList.length; zi++) {
              const z = enemyList[zi];
              if (z.hp <= 0) continue;

              const hitRadius = z.radius + (ifd.merged ? 30 : 17);
              if (
                pointToSegDist(z.x, z.y, ifd.muzzleX, ifd.muzzleY, ifd.beamEndX, ifd.beamEndY) > hitRadius
              ) {
                continue;
              }

              let tickDmg = ifdw.damage * (ifd.merged ? 2.6 : 1.0);
              if (p.critChance && Math.random() < p.critChance) {
                tickDmg = Math.round(tickDmg * (p.critMultiplier || 2));
              }

              z.hp -= Math.round(tickDmg);

              if (ifd.merged || ifd.activeDragon === 'FIRE') {
                z.isOnFire = true;
                z.burnTimer = 4.5;
              }
              if (ifd.merged || ifd.activeDragon === 'ICE') {
                z.isStunned = true;
                z.stunTimer = Math.max(z.stunTimer, ifd.merged ? 0.55 : 0.45);
              } else {
                z.isStunned = true;
                z.stunTimer = Math.max(z.stunTimer, 0.04);
              }

              z.knockbackX += Math.cos(activeAng) * (ifd.merged ? 82 : 56) * (p.knockbackMult || 1);
              z.knockbackY += Math.sin(activeAng) * (ifd.merged ? 82 : 56) * (p.knockbackMult || 1);

              if (p.chainLightningLevel && p.chainLightningLevel > 0) {
                triggerChainLightning(z, tickDmg, p.chainLightningLevel);
              }

              for (let k = 0; k < 3; k++) {
                const sAng = activeAng + Math.PI + (Math.random() * 1.8 - 0.9);
                const sSpd = 80 + Math.random() * 130;
                particlesRef.current.push({
                  id: `ifdhit-${Date.now()}-${k}-${Math.random()}`,
                  type: ifd.activeDragon === 'FIRE' && !ifd.merged && k === 0 ? 'FLAME' : 'SPARK',
                  x: z.x + (Math.random() - 0.5) * z.radius,
                  y: z.y + (Math.random() - 0.5) * z.radius,
                  vx: Math.cos(sAng) * sSpd,
                  vy: Math.sin(sAng) * sSpd,
                  radius: k === 0 ? 4.0 + Math.random() * 2.2 : 2.0 + Math.random() * 2.0,
                  color: ifd.merged
                    ? k % 2 === 0
                      ? '#e879f9'
                      : '#a855f7'
                    : ifd.activeDragon === 'FIRE'
                      ? k % 2 === 0
                        ? '#f97316'
                        : '#fde047'
                      : k % 2 === 0
                        ? '#38bdf8'
                        : '#e0f2fe',
                  alpha: 1,
                  decay: 0.06,
                });
              }

              if (Math.random() < (ifd.merged ? 0.3 : 0.2)) {
                particlesRef.current.push({
                  id: `ifdring-${Date.now()}-${Math.random()}`,
                  type: ifd.activeDragon === 'FIRE' && !ifd.merged ? 'FIRE_RING' : 'PLASMA_RING',
                  x: z.x,
                  y: z.y,
                  vx: 0,
                  vy: 0,
                  radius: 10,
                  growthSpeed: ifd.merged ? 230 : 185,
                  color: ifd.merged ? '#c084fc' : ifd.activeDragon === 'FIRE' ? '#f97316' : '#38bdf8',
                  alpha: 0.85,
                  decay: 0.08,
                });
              }

              if (z.hp <= 0) {
                handleZombieDeath(z);
              }
            }
          }
        } else {
          ifd.beamTickTimer = 0.04;
          ifd.beamSoundTimer = 0.095;
        }
      } else if (shouldFire) {
        fireActiveWeapon(shootingAngle);
      }

      // Shield passive regeneration
      if (p.maxShield > 0 && p.shield < p.maxShield) {
        shieldRegenTimer += dt;
        if (shieldRegenTimer >= 4.0) {
          p.shield = Math.min(p.maxShield, p.shield + 8 * dt);
        }
      }

      // Health passive regeneration (from Nanite Regen / Phoenix Protocol perks)
      if (p.regenHpRate && p.regenHpRate > 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + p.regenHpRate * dt);
      }

      // ============================================================
      // 2b. ACTIVE MYTHIC & LEGENDARY POWER-UPS COMBAT RUNTIME
      // ============================================================
      if (!dyingRef.current?.active) {
        const mc = mythicCombatRef.current;

        // A. MYTHIC SINGULARITY: 5 Orbiting Cosmic Scythe Blades
        if (p.mythicSingularity && p.mythicSingularity > 0) {
          mc.orbitalAngle = (mc.orbitalAngle + 4.3 * dt) % (Math.PI * 200);
          const bladeCount = 5;
          const orbitR = 78;
          const activeW = p.weapons[p.currentWeapon] || INITIAL_WEAPONS[WeaponType.PISTOL];
          const sliceDmg = Math.max(32, Math.round((36 + activeW.damage * 0.75) * p.mythicSingularity));

          for (let bi = 0; bi < bladeCount; bi++) {
            const ba = mc.orbitalAngle + (bi * Math.PI * 2) / bladeCount;
            const bx = p.x + Math.cos(ba) * orbitR;
            const by = p.y + Math.sin(ba) * orbitR;
            for (let zi = 0; zi < zombiesRef.current.length; zi++) {
              const z = zombiesRef.current[zi];
              if (z.hp <= 0) continue;
              if (Math.hypot(z.x - bx, z.y - by) <= z.radius + 18) {
                const lastHit = mc.orbitalHitCooldowns[z.id] || 0;
                if (nowMs - lastHit >= 260) {
                  mc.orbitalHitCooldowns[z.id] = nowMs;
                  z.hp -= sliceDmg;
                  const ka = Math.atan2(z.y - p.y, z.x - p.x);
                  z.knockbackX += Math.cos(ka) * 260 * (p.knockbackMult || 1);
                  z.knockbackY += Math.sin(ka) * 260 * (p.knockbackMult || 1);
                  for (let sp = 0; sp < 4; sp++) {
                    const sa = Math.random() * Math.PI * 2;
                    particlesRef.current.push({
                      id: `blade-sp-${Date.now()}-${sp}-${Math.random()}`,
                      type: 'SPARK',
                      x: bx,
                      y: by,
                      vx: Math.cos(sa) * 110,
                      vy: Math.sin(sa) * 110,
                      radius: 2.2,
                      color: sp % 2 === 0 ? '#38bdf8' : '#f0abfc',
                      alpha: 1,
                      decay: 0.08,
                    });
                  }
                  if (z.hp <= 0) handleZombieDeath(z);
                }
              }
            }
          }
        }

        // B. MYTHIC SOLAR PHOENIX: Continuous Solar Corona Aura burn
        if (p.mythicSolarAura && p.mythicSolarAura > 0) {
          mc.solarBurnTimer += dt;
          if (mc.solarBurnTimer >= 0.25) {
            mc.solarBurnTimer = 0;
            const auraR = 140 + Math.min(3, p.mythicSolarAura - 1) * 18;
            const activeW = p.weapons[p.currentWeapon] || INITIAL_WEAPONS[WeaponType.PISTOL];
            const auraDmg = Math.max(14, Math.round((16 + activeW.damage * 0.28) * p.mythicSolarAura));
            for (let zi = 0; zi < zombiesRef.current.length; zi++) {
              const z = zombiesRef.current[zi];
              if (z.hp <= 0) continue;
              if (Math.hypot(z.x - p.x, z.y - p.y) <= auraR + z.radius) {
                z.hp -= auraDmg;
                z.isOnFire = true;
                z.burnTimer = 3.5;
                if (z.hp <= 0) handleZombieDeath(z);
              }
            }
          }
        }

        // C. LEGENDARY GRAVITY PULSE: Periodic Kinetic Repelling Shockwave
        if (p.gravityPulseLevel && p.gravityPulseLevel > 0) {
          const pulseCooldown = Math.max(2.0, 4.6 - p.gravityPulseLevel * 0.45);
          mc.gravityPulseTimer += dt;
          if (mc.gravityPulseTimer >= pulseCooldown) {
            mc.gravityPulseTimer = 0;
            sound.playGravityPulse();
            const gRadius = 215 + p.gravityPulseLevel * 24;
            const gDmg = 24 * p.gravityPulseLevel;

            particlesRef.current.push({
              id: `grav-pulse-${Date.now()}-${Math.random()}`,
              type: 'PLASMA_RING',
              x: p.x,
              y: p.y,
              vx: 0,
              vy: 0,
              radius: 22,
              growthSpeed: 540,
              color: '#818cf8',
              alpha: 0.95,
              decay: 0.045,
            });

            for (let zi = 0; zi < zombiesRef.current.length; zi++) {
              const z = zombiesRef.current[zi];
              if (z.hp <= 0) continue;
              const d = Math.hypot(z.x - p.x, z.y - p.y);
              if (d <= gRadius + z.radius) {
                const pa = Math.atan2(z.y - p.y, z.x - p.x);
                z.knockbackX += Math.cos(pa) * 560 * (p.knockbackMult || 1);
                z.knockbackY += Math.sin(pa) * 560 * (p.knockbackMult || 1);
                z.isStunned = true;
                z.stunTimer = Math.max(z.stunTimer, 0.9);
                z.hp -= gDmg;
                if (z.hp <= 0) handleZombieDeath(z);
              }
            }
          }
        }

        // D. MYTHIC VOID MONARCH: 3 Autonomous Hunter Drones firing Homing Void Lances
        if (p.mythicVoidDrones && p.mythicVoidDrones > 0) {
          const activeW = p.weapons[p.currentWeapon] || INITIAL_WEAPONS[WeaponType.PISTOL];
          const droneDmg = Math.max(24, Math.round((28 + activeW.damage * 0.65) * p.mythicVoidDrones));
          const droneCount = mc.voidDrones.length;

          for (let di = 0; di < droneCount; di++) {
            const dr = mc.voidDrones[di];
            const orbitA = nowMs * 0.0022 + (di * Math.PI * 2) / droneCount;
            const desiredX = p.x + Math.cos(orbitA) * 56;
            const desiredY = p.y + Math.sin(orbitA) * 56 + Math.sin(nowMs * 0.006 + di) * 6;
            dr.x += (desiredX - dr.x) * Math.min(1, dt * 8);
            dr.y += (desiredY - dr.y) * Math.min(1, dt * 8);

            // Find nearest enemy within 580px
            let targetZ: Zombie | null = null;
            let bestDist = 580;
            for (let zi = 0; zi < zombiesRef.current.length; zi++) {
              const z = zombiesRef.current[zi];
              if (z.hp <= 0) continue;
              const d = Math.hypot(z.x - dr.x, z.y - dr.y);
              if (d < bestDist) {
                bestDist = d;
                targetZ = z;
              }
            }

            if (targetZ) {
              dr.angle = Math.atan2(targetZ.y - dr.y, targetZ.x - dr.x);
              dr.fireTimer -= dt;
              if (dr.fireTimer <= 0) {
                dr.fireTimer = Math.max(0.32, 0.68 - (p.mythicVoidDrones - 1) * 0.1);
                bulletsRef.current.push({
                  id: `void-lance-${Date.now()}-${di}-${Math.random()}`,
                  x: dr.x + Math.cos(dr.angle) * 12,
                  y: dr.y + Math.sin(dr.angle) * 12,
                  vx: Math.cos(dr.angle) * 640,
                  vy: Math.sin(dr.angle) * 640,
                  radius: 6,
                  damage: droneDmg,
                  piercingRemaining: 2,
                  color: '#c084fc',
                  distanceTraveled: 0,
                  maxDistance: 720,
                  ownerAngle: dr.angle,
                  isVoidLance: true,
                  homingStrength: 7.8,
                });
              }
            } else {
              dr.angle = orbitA + Math.PI / 2;
              dr.fireTimer = Math.max(0, dr.fireTimer - dt);
            }
          }
        }
      }

      // 3. UPDATE BULLETS
      const activeBullets: Bullet[] = [];
      const bullets = bulletsRef.current;

      for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        const oldX = b.x;
        const oldY = b.y;

        // Homing Void Lance steering toward nearest live enemy
        if (b.homingStrength && !b.isEnemy && zombiesRef.current.length > 0) {
          let nearest: Zombie | null = null;
          let minD = 420;
          for (let zi = 0; zi < zombiesRef.current.length; zi++) {
            const cand = zombiesRef.current[zi];
            if (cand.hp <= 0) continue;
            const d = Math.hypot(cand.x - b.x, cand.y - b.y);
            if (d < minD) {
              minD = d;
              nearest = cand;
            }
          }
          if (nearest) {
            const speed = Math.hypot(b.vx, b.vy);
            const curAng = Math.atan2(b.vy, b.vx);
            const tgtAng = Math.atan2(nearest.y - b.y, nearest.x - b.x);
            let diff = tgtAng - curAng;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const nextAng = curAng + Math.max(-b.homingStrength * dt, Math.min(b.homingStrength * dt, diff));
            b.vx = Math.cos(nextAng) * speed;
            b.vy = Math.sin(nextAng) * speed;
            b.ownerAngle = nextAng;
          }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.isRocket || b.isMissile) {
          // Accelerate rocket slightly
          b.vx *= Math.pow(1.02, dt * 60);
          b.vy *= Math.pow(1.02, dt * 60);

          // Rocket tail smoke
          particlesRef.current.push({
            id: `rsmoke-${Date.now()}-${Math.random()}`,
            type: 'SMOKE',
            x: b.x - Math.cos(b.ownerAngle) * 12,
            y: b.y - Math.sin(b.ownerAngle) * 12,
            vx: -Math.cos(b.ownerAngle) * 40 + (Math.random() * 20 - 10),
            vy: -Math.sin(b.ownerAngle) * 40 + (Math.random() * 20 - 10),
            radius: b.isMissile ? 3.5 : 5 + Math.random() * 4,
            growthSpeed: 20,
            color: b.isMissile ? 'rgba(224, 242, 254, 0.75)' : 'rgba(100, 116, 139, 0.55)',
            alpha: 0.75,
            decay: 0.05,
          });

          // Rocket tail flame
          particlesRef.current.push({
            id: `rfire-${Date.now()}-${Math.random()}`,
            type: 'FLAME',
            x: b.x - Math.cos(b.ownerAngle) * 10,
            y: b.y - Math.sin(b.ownerAngle) * 10,
            vx: -Math.cos(b.ownerAngle) * 60 + (Math.random() * 30 - 15),
            vy: -Math.sin(b.ownerAngle) * 60 + (Math.random() * 30 - 15),
            radius: 4 + Math.random() * 3,
            color: b.isMissile ? '#38bdf8' : Math.random() < 0.5 ? '#fef08a' : '#f97316',
            alpha: 0.9,
            decay: 0.12,
          });
        } else if (b.isCosmic) {
          // Cosmic galaxy stardust trail
          particlesRef.current.push({
            id: `cstar-${Date.now()}-${Math.random()}`,
            type: 'SPARK',
            x: b.x - Math.cos(b.ownerAngle) * 6 + (Math.random() * 8 - 4),
            y: b.y - Math.sin(b.ownerAngle) * 6 + (Math.random() * 8 - 4),
            vx: -Math.cos(b.ownerAngle) * 40,
            vy: -Math.sin(b.ownerAngle) * 40,
            radius: 2 + Math.random() * 2,
            color: Math.random() < 0.5 ? '#38bdf8' : '#f43f5e',
            alpha: 1,
            decay: 0.08,
          });
        } else if (b.isFlame) {
          // Expand flame cone size downrange
          if (b.flameMaxRadius) {
            b.radius = Math.min(b.flameMaxRadius, b.radius + 70 * dt);
          }
          // Air resistance slows flame jet slightly
          b.vx *= Math.exp(-0.7 * dt);
          b.vy *= Math.exp(-0.7 * dt);

          // Dissipating smoke
          if (b.distanceTraveled > b.maxDistance * 0.5 && Math.random() < 0.35) {
            particlesRef.current.push({
              id: `fsmoke-${Date.now()}-${Math.random()}`,
              type: 'SMOKE',
              x: b.x,
              y: b.y,
              vx: b.vx * 0.2,
              vy: b.vy * 0.2 - 15,
              radius: b.radius * 0.5,
              growthSpeed: 16,
              color: 'rgba(71, 85, 105, 0.45)',
              alpha: 0.5,
              decay: 0.04,
            });
          }
        }

        // Calculate travel distance
        const dx = b.x - oldX;
        const dy = b.y - oldY;
        b.distanceTraveled += Math.sqrt(dx * dx + dy * dy);

        // Enemy Bullet hitting player
        if (b.isEnemy) {
          const distP = Math.hypot(p.x - b.x, p.y - b.y);
          if (distP < p.radius + b.radius) {
            b.piercingRemaining = 0;

            // TEMPORAL DODGE check
            if (p.dodgeChance && Math.random() < p.dodgeChance) {
              sound.playTemporalDodge();
              particlesRef.current.push({
                id: `dodge-ring-${Date.now()}-${Math.random()}`,
                type: 'RAY_RING',
                x: p.x,
                y: p.y,
                vx: 0,
                vy: 0,
                radius: p.radius,
                growthSpeed: 260,
                color: '#38bdf8',
                alpha: 0.9,
                decay: 0.08,
              });
            } else {
              sound.playPlayerHit();
              screenShakeRef.current = Math.min(25, screenShakeRef.current + 12);
              const hadShield = p.shield > 0;

              if (p.shield > 0) {
                p.shield -= b.damage;
                if (p.shield < 0) {
                  p.hp += p.shield;
                  p.shield = 0;
                }
              } else {
                p.hp -= b.damage;
              }

              if (hadShield) {
                triggerShieldShock();
              }

              shieldRegenTimer = 0;

              for (let pk = 0; pk < 6; pk++) {
                const sparkAngle = Math.random() * Math.PI * 2;
                particlesRef.current.push({
                  id: `ehit-${Date.now()}-${pk}-${Math.random()}`,
                  type: 'SPARK',
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(sparkAngle) * 90,
                  vy: Math.sin(sparkAngle) * 90,
                  radius: 3,
                  color: b.color,
                  alpha: 1,
                  decay: 0.08,
                });
              }

              syncHudPlayer();

              if (p.hp <= 0) {
                p.hp = 0;
                triggerPlayerDeath(p, Math.atan2(b.vy, b.vx));
                return;
              }
            }
          }
        }

        // Keep bullets if they are inside arena bounds and under range
        if (
          b.x >= 0 &&
          b.x <= ARENA_SIZE &&
          b.y >= 0 &&
          b.y <= ARENA_SIZE &&
          b.distanceTraveled < b.maxDistance &&
          b.piercingRemaining > 0
        ) {
          activeBullets.push(b);
        } else {
          if (b.isBomb) {
            triggerCarpetBombExplosion(b.x, b.y, b.damage);
          } else if (b.isRocket || b.isMissile || b.isCosmic) {
            triggerRocketExplosion(b.x, b.y, b.damage);
          }
        }
      }
      bulletsRef.current = activeBullets;

      // 4. UPDATE ZOMBIES
      const activeZombies: Zombie[] = [];
      const zombies = zombiesRef.current;
      const now = Date.now();

      for (let i = 0; i < zombies.length; i++) {
        const z = zombies[i];
        if (z.hp <= 0) continue;

        // Apply stun states
        if (z.isStunned) {
          z.stunTimer -= dt;
          if (z.stunTimer <= 0) {
            z.isStunned = false;
          }
        }

        // Apply zombie burning DOT (damage over time)
        if (z.isOnFire) {
          z.burnTimer = (z.burnTimer || 0) - dt;
          z.burnDamageTimer = (z.burnDamageTimer || 0) + dt;

          if (z.burnDamageTimer >= 0.2) {
            const wasAliveBurn = z.hp > 0;
            z.hp -= 6;
            z.burnDamageTimer = 0;

            // Rising flame tongue sparks from burning zombie
            particlesRef.current.push({
              id: `zburn-${Date.now()}-${Math.random()}`,
              type: 'FLAME',
              x: z.x + (Math.random() * z.radius - z.radius / 2),
              y: z.y + (Math.random() * z.radius - z.radius / 2),
              vx: (Math.random() - 0.5) * 35,
              vy: -65 - Math.random() * 45,
              radius: 3.5 + Math.random() * 3.5,
              color: Math.random() < 0.5 ? '#ff4500' : '#fef08a',
              alpha: 1.0,
              decay: 0.08,
            });

            if (wasAliveBurn && z.hp <= 0) {
              handleZombieDeath(z);
              continue;
            }
          }

          if (z.burnTimer <= 0) {
            z.isOnFire = false;
          }
        }

        // Apply knockback deceleration
        z.knockbackX *= 0.85;
        z.knockbackY *= 0.85;

        if (Math.abs(z.knockbackX) < 0.1) z.knockbackX = 0;
        if (Math.abs(z.knockbackY) < 0.1) z.knockbackY = 0;

        // Standard zombie tracking movement
        if (!z.isStunned) {
          // Angle from zombie to player
          const zAngle = Math.atan2(p.y - z.y, p.x - z.x);
          z.angle = zAngle;

          // Normal speed + knockback vector
          z.x += (Math.cos(zAngle) * z.speed + z.knockbackX) * dt;
          z.y += (Math.sin(zAngle) * z.speed + z.knockbackY) * dt;
        } else {
          // Move only with knockback if stunned
          z.x += z.knockbackX * dt;
          z.y += z.knockbackY * dt;
        }

        // Constrain to arena
        z.x = Math.max(z.radius, Math.min(ARENA_SIZE - z.radius, z.x));
        z.y = Math.max(z.radius, Math.min(ARENA_SIZE - z.radius, z.y));

        // Enemy Ranged Shooting logic (Toxic Spitter in Zombie Mode & Alien units in Alien Mode)
        if (z.shootsProjectiles && !z.isStunned) {
          const distToP = Math.hypot(p.x - z.x, p.y - z.y);
          if (distToP < 700) {
            let shootInterval = 1400;
            if (z.type === ZombieType.TOXIC_SPITTER) shootInterval = 2100;
            else if (z.type === ZombieType.BOSS_BUTCHER) shootInterval = 1700;
            else if (z.type === ZombieType.BOSS_NECROTITAN) shootInterval = 2100;
            else if (z.type === ZombieType.ALIEN_DRONE) shootInterval = 1500;
            else if (z.type === ZombieType.ALIEN_SCOUT) shootInterval = 1350;
            else if (z.type === ZombieType.ALIEN_SHOOTER) shootInterval = 1750;
            else if (z.type === ZombieType.ALIEN_OVERLORD) shootInterval = 1300;
            else if (z.type === ZombieType.ALIEN_DREADNOUGHT) shootInterval = 1400;
            else if (z.type === ZombieType.ALIEN_LEVIATHAN) shootInterval = 1500;

            if (now - (z.lastShootTime || 0) > shootInterval) {
              z.lastShootTime = now;
              const aimAngle = Math.atan2(p.y - z.y, p.x - z.x);

              if (z.type === ZombieType.TOXIC_SPITTER) {
                // Toxic Spitter biological acid spit
                sound.playZombieHit();
                bulletsRef.current.push({
                  id: `acid-bullet-${Date.now()}-${Math.random()}`,
                  x: z.x + Math.cos(aimAngle) * (z.radius + 6),
                  y: z.y + Math.sin(aimAngle) * (z.radius + 6),
                  vx: Math.cos(aimAngle) * 380,
                  vy: Math.sin(aimAngle) * 380,
                  radius: 7,
                  damage: z.damage,
                  piercingRemaining: 1,
                  color: '#84cc16', // Lime acidic green
                  distanceTraveled: 0,
                  maxDistance: 620,
                  ownerAngle: aimAngle,
                  isEnemy: true,
                });

                // Acid droplets splash
                for (let sp = 0; sp < 4; sp++) {
                  const spAngle = aimAngle + (Math.random() * 0.8 - 0.4);
                  particlesRef.current.push({
                    id: `acid-sp-${Date.now()}-${sp}-${Math.random()}`,
                    type: 'TOXIC_ACID',
                    x: z.x + Math.cos(aimAngle) * z.radius,
                    y: z.y + Math.sin(aimAngle) * z.radius,
                    vx: Math.cos(spAngle) * 60,
                    vy: Math.sin(spAngle) * 60,
                    radius: 2 + Math.random() * 3,
                    color: '#84cc16',
                    alpha: 1,
                    decay: 0.08,
                  });
                }
              } else if (z.type === ZombieType.BOSS_BUTCHER) {
                // Golias Açougueiro triple cleaver shockwave
                sound.playZombieRoar();
                [-0.22, 0, 0.22].forEach(off => {
                  const finalA = aimAngle + off;
                  bulletsRef.current.push({
                    id: `cleaver-bullet-${Date.now()}-${Math.random()}`,
                    x: z.x + Math.cos(finalA) * (z.radius + 12),
                    y: z.y + Math.sin(finalA) * (z.radius + 12),
                    vx: Math.cos(finalA) * 440,
                    vy: Math.sin(finalA) * 440,
                    radius: 9,
                    damage: z.damage,
                    piercingRemaining: 1,
                    color: '#ef4444',
                    distanceTraveled: 0,
                    maxDistance: 680,
                    ownerAngle: finalA,
                    isEnemy: true,
                  });
                });
              } else if (z.type === ZombieType.BOSS_NECROTITAN) {
                // Necro-Titã 8-way radial bone spike burst
                sound.playZombieRoar();
                for (let k = 0; k < 8; k++) {
                  const spikeAngle = (k * Math.PI * 2) / 8 + (now * 0.001);
                  bulletsRef.current.push({
                    id: `bonespike-${Date.now()}-${k}-${Math.random()}`,
                    x: z.x + Math.cos(spikeAngle) * (z.radius + 14),
                    y: z.y + Math.sin(spikeAngle) * (z.radius + 14),
                    vx: Math.cos(spikeAngle) * 420,
                    vy: Math.sin(spikeAngle) * 420,
                    radius: 8,
                    damage: z.damage,
                    piercingRemaining: 1,
                    color: '#c084fc',
                    distanceTraveled: 0,
                    maxDistance: 700,
                    ownerAngle: spikeAngle,
                    isEnemy: true,
                  });
                }
              } else if (z.type === ZombieType.ALIEN_OVERLORD) {
                // Alien Overlord Triple spread plasma burst
                sound.playAlienBossRoar();
                [-0.24, 0, 0.24].forEach(off => {
                  const finalA = aimAngle + off;
                  bulletsRef.current.push({
                    id: `alien-bullet-${Date.now()}-${Math.random()}`,
                    x: z.x + Math.cos(finalA) * (z.radius + 10),
                    y: z.y + Math.sin(finalA) * (z.radius + 10),
                    vx: Math.cos(finalA) * 520,
                    vy: Math.sin(finalA) * 520,
                    radius: 8,
                    damage: z.damage,
                    piercingRemaining: 1,
                    color: '#ec4899', // Bright Magenta
                    distanceTraveled: 0,
                    maxDistance: 700,
                    ownerAngle: finalA,
                    isEnemy: true,
                  });
                });
              } else if (z.type === ZombieType.ALIEN_DREADNOUGHT) {
                // Dreadnought Quad rotating laser cannons
                sound.playAlienShoot();
                for (let q = 0; q < 4; q++) {
                  const qAngle = aimAngle + (q * Math.PI) / 2;
                  bulletsRef.current.push({
                    id: `dread-bullet-${Date.now()}-${q}-${Math.random()}`,
                    x: z.x + Math.cos(qAngle) * (z.radius + 12),
                    y: z.y + Math.sin(qAngle) * (z.radius + 12),
                    vx: Math.cos(qAngle) * 480,
                    vy: Math.sin(qAngle) * 480,
                    radius: 8,
                    damage: z.damage,
                    piercingRemaining: 1,
                    color: '#00ffcc', // Electric Cyan Laser
                    distanceTraveled: 0,
                    maxDistance: 720,
                    ownerAngle: qAngle,
                    isEnemy: true,
                  });
                }
              } else if (z.type === ZombieType.ALIEN_LEVIATHAN) {
                // Leviatã Void 5-way nova singularity spread
                sound.playAlienBossRoar();
                [-0.36, -0.18, 0, 0.18, 0.36].forEach(off => {
                  const finalA = aimAngle + off;
                  bulletsRef.current.push({
                    id: `leviathan-bullet-${Date.now()}-${Math.random()}`,
                    x: z.x + Math.cos(finalA) * (z.radius + 16),
                    y: z.y + Math.sin(finalA) * (z.radius + 16),
                    vx: Math.cos(finalA) * 530,
                    vy: Math.sin(finalA) * 530,
                    radius: 11,
                    damage: z.damage,
                    piercingRemaining: 1,
                    color: '#e879f9', // Cosmic Nova
                    distanceTraveled: 0,
                    maxDistance: 750,
                    ownerAngle: finalA,
                    isEnemy: true,
                  });
                });
              } else {
                // Alien Scout, Drone, or Shooter
                sound.playAlienShoot();
                let bulletColor = '#00ffcc';
                let bulletSpeed = 480;
                let bulletRadius = 6;

                if (z.type === ZombieType.ALIEN_DRONE) {
                  bulletColor = '#c084fc'; // Purple Drone dart
                  bulletSpeed = 510;
                  bulletRadius = 5;
                } else if (z.type === ZombieType.ALIEN_SHOOTER) {
                  bulletColor = '#06b6d4'; // Deep Cyan Plasma
                  bulletSpeed = 420;
                  bulletRadius = 9;
                }

                bulletsRef.current.push({
                  id: `alien-bullet-${Date.now()}-${Math.random()}`,
                  x: z.x + Math.cos(aimAngle) * (z.radius + 8),
                  y: z.y + Math.sin(aimAngle) * (z.radius + 8),
                  vx: Math.cos(aimAngle) * bulletSpeed,
                  vy: Math.sin(aimAngle) * bulletSpeed,
                  radius: bulletRadius,
                  damage: z.damage,
                  piercingRemaining: 1,
                  color: bulletColor,
                  distanceTraveled: 0,
                  maxDistance: 650,
                  ownerAngle: aimAngle,
                  isEnemy: true,
                });

                // Alien muzzle spark
                for (let sp = 0; sp < 4; sp++) {
                  const spAngle = aimAngle + (Math.random() * 0.8 - 0.4);
                  particlesRef.current.push({
                    id: `aspark-${Date.now()}-${sp}-${Math.random()}`,
                    type: 'ALIEN_PLASMA',
                    x: z.x + Math.cos(aimAngle) * z.radius,
                    y: z.y + Math.sin(aimAngle) * z.radius,
                    vx: Math.cos(spAngle) * 80,
                    vy: Math.sin(spAngle) * 80,
                    radius: 3 + Math.random() * 3,
                    color: bulletColor,
                    alpha: 1,
                    decay: 0.1,
                  });
                }
              }
            }
          }
        }

        // Attack Player collision check
        const distToPlayer = Math.hypot(p.x - z.x, p.y - z.y);
        if (distToPlayer < p.radius + z.radius) {
          if (now - z.lastAttackTime > 800) { // attack rate limit 0.8s
            z.lastAttackTime = now;

            // TEMPORAL DODGE check
            if (p.dodgeChance && Math.random() < p.dodgeChance) {
              sound.playTemporalDodge();
              particlesRef.current.push({
                id: `mdodge-ring-${Date.now()}-${Math.random()}`,
                type: 'RAY_RING',
                x: p.x,
                y: p.y,
                vx: 0,
                vy: 0,
                radius: p.radius,
                growthSpeed: 280,
                color: '#38bdf8',
                alpha: 0.95,
                decay: 0.08,
              });
            } else {
              // Damage calculation: shields absorb 100% until depleted
              const damageDealt = z.damage;
              sound.playPlayerHit();
              const hadShield = p.shield > 0;

              if (p.shield > 0) {
                p.shield -= damageDealt;
                if (p.shield < 0) {
                  p.hp += p.shield; // Overflow to HP
                  p.shield = 0;
                }
              } else {
                p.hp -= damageDealt;
              }

              if (hadShield) {
                triggerShieldShock();
              }

              shieldRegenTimer = 0; // reset shield recharge cooldown on damage

              // Screen hit flash particles (Red)
              for (let k = 0; k < 12; k++) {
                const bloodAngle = Math.random() * Math.PI * 2;
                const bSpeed = 60 + Math.random() * 120;
                particlesRef.current.push({
                  id: `player-blood-${Date.now()}-${k}-${Math.random()}`,
                  type: 'BLOOD',
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(bloodAngle) * bSpeed,
                  vy: Math.sin(bloodAngle) * bSpeed,
                  radius: 3 + Math.random() * 3,
                  color: '#ef4444', // Red blood
                  alpha: 1,
                  decay: 0.03 + Math.random() * 0.03,
                });
              }

              syncHudPlayer();

              // Game over check via dramatic slow-motion death sequence
              if (p.hp <= 0) {
                p.hp = 0;
                triggerPlayerDeath(p, Math.atan2(p.y - z.y, p.x - z.x));
                return;
              }
            }
          }

          // Push zombies away from each other so they don't overlay
          const pushAngle = Math.atan2(z.y - p.y, z.x - p.x);
          z.x = p.x + Math.cos(pushAngle) * (p.radius + z.radius + 1);
          z.y = p.y + Math.sin(pushAngle) * (p.radius + z.radius + 1);
        }

        // Avoid overlap with other zombies (fast pairwise push-away physics with AABB + squared distance)
        for (let j = i + 1; j < zombies.length; j++) {
          const other = zombies[j];
          const minDist = z.radius + other.radius;
          const zdx = other.x - z.x;
          if (zdx > minDist || zdx < -minDist) continue;
          const zdy = other.y - z.y;
          if (zdy > minDist || zdy < -minDist) continue;
          const distSq = zdx * zdx + zdy * zdy;
          if (distSq < minDist * minDist) {
            if (distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const push = ((minDist - dist) * 0.5) / dist;
              const px = zdx * push;
              const py = zdy * push;
              z.x -= px;
              z.y -= py;
              other.x += px;
              other.y += py;
            } else {
              z.x -= 0.5;
              other.x += 0.5;
            }
          }
        }

        // Check collision against bullets (fast AABB + squared distance)
        const bulletList = bulletsRef.current;
        for (let j = bulletList.length - 1; j >= 0; j--) {
          const b = bulletList[j];
          if (b.isEnemy) continue; // Enemy projectiles don't hit zombies/aliens
          const hitR = z.radius + b.radius;
          const bdx = b.x - z.x;
          if (bdx > hitR || bdx < -hitR) continue;
          const bdy = b.y - z.y;
          if (bdy > hitR || bdy < -hitR) continue;

          if (bdx * bdx + bdy * bdy < hitR * hitR) {
            // Bullet Hit Zombie!
            let hitDamage = b.damage;
            if (p.critChance && Math.random() < p.critChance) {
              hitDamage = Math.round(hitDamage * (p.critMultiplier || 2));
              // Gold crit hit particles
              particlesRef.current.push({
                id: `crit-${Date.now()}-${Math.random()}`,
                type: 'SPARK',
                x: z.x,
                y: z.y - 12,
                vx: (Math.random() - 0.5) * 40,
                vy: -60,
                radius: 3.5,
                color: '#fbbf24',
                alpha: 1,
                decay: 0.05,
              });
            }

            if (b.isBomb) {
              triggerCarpetBombExplosion(b.x, b.y, hitDamage);
              b.piercingRemaining = 0;
            } else if (b.isRocket || b.isMissile || b.isCosmic) {
              triggerRocketExplosion(b.x, b.y, hitDamage);
              b.piercingRemaining = 0;
            } else if (b.isFlame) {
              z.hp -= hitDamage;
              z.isOnFire = true;
              z.burnTimer = 3.5;
              b.piercingRemaining--;

              // Spawns hit flame sparks
              for (let fk = 0; fk < 2; fk++) {
                particlesRef.current.push({
                  id: `fhit-${Date.now()}-${fk}-${Math.random()}`,
                  type: 'FLAME',
                  x: z.x + (Math.random() * 12 - 6),
                  y: z.y + (Math.random() * 12 - 6),
                  vx: (Math.random() - 0.5) * 60,
                  vy: -30 - Math.random() * 40,
                  radius: 4 + Math.random() * 4,
                  color: '#ff4500',
                  alpha: 1.0,
                  decay: 0.08,
                });
              }
            } else {
              z.hp -= hitDamage;
              b.piercingRemaining--;
            }

            // LEGENDARY CHAIN LIGHTNING arc jumps
            if (p.chainLightningLevel && p.chainLightningLevel > 0) {
              triggerChainLightning(z, hitDamage, p.chainLightningLevel);
            }

            // Hit audio (mode dependent)
            if (modeRef.current === GameMode.ALIEN) {
              sound.playAlienShoot();
            } else {
              sound.playZombieHit();
            }

            // Apply bullet impact knockback (honoring p.knockbackMult)
            const baseKb = b.isFlame ? 35 : p.currentWeapon === WeaponType.PLASMA_RIFLE ? 300 : 150;
            const kbStrength = baseKb * (p.knockbackMult || 1);
            z.knockbackX += Math.cos(b.ownerAngle) * kbStrength;
            z.knockbackY += Math.sin(b.ownerAngle) * kbStrength;
            z.isStunned = true;
            z.stunTimer = b.isFlame ? 0.05 : 0.15; // Brief hitstun

            // Spark hit particles (Golden or Plasma Cyan)
            for (let k = 0; k < 6; k++) {
              const sparkAngle = b.ownerAngle + Math.PI + (Math.random() * 1.2 - 0.6);
              const sparkSpeed = 80 + Math.random() * 120;
              particlesRef.current.push({
                id: `spark-${Date.now()}-${k}-${Math.random()}`,
                type: 'SPARK',
                x: b.x,
                y: b.y,
                vx: Math.cos(sparkAngle) * sparkSpeed,
                vy: Math.sin(sparkAngle) * sparkSpeed,
                radius: 1.5 + Math.random() * 1.5,
                color: b.color,
                alpha: 1,
                decay: 0.04 + Math.random() * 0.04,
              });
            }

            // Mode-specific blood / plasma impact particles
            const isAlienUnit = modeRef.current === GameMode.ALIEN;
            const bloodColor = isAlienUnit 
              ? (z.type === ZombieType.ALIEN_OVERLORD ? '#ec4899' : z.type === ZombieType.ALIEN_DRONE ? '#c084fc' : '#00ffcc')
              : (z.type === ZombieType.BOSS ? '#c084fc' : z.type === ZombieType.TOXIC_SPITTER ? '#84cc16' : z.type === ZombieType.RUNNER ? '#f87171' : '#15803d');

            for (let k = 0; k < 8; k++) {
              const bloodAngle = b.ownerAngle + (Math.random() * 1.5 - 0.75);
              const bloodSpeed = 60 + Math.random() * 130;
              particlesRef.current.push({
                id: `blood-${Date.now()}-${k}-${Math.random()}`,
                type: isAlienUnit ? 'ALIEN_PLASMA' : 'BLOOD',
                x: z.x,
                y: z.y,
                vx: Math.cos(bloodAngle) * bloodSpeed,
                vy: Math.sin(bloodAngle) * bloodSpeed,
                radius: 2 + Math.random() * 3,
                color: bloodColor,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03,
              });
            }

            // Floor splatter chance on hits
            if (Math.random() < 0.35) {
              const dropColor = isAlienUnit
                ? (z.type === ZombieType.ALIEN_OVERLORD ? '#831843' : '#083344')
                : (z.type === ZombieType.BOSS ? '#6b21a8' : '#022c22');

              bloodSplatsRef.current.push({
                x: z.x + (Math.random() * 16 - 8),
                y: z.y + (Math.random() * 16 - 8),
                radius: z.radius * (0.3 + Math.random() * 0.4),
                alpha: 0.35 + Math.random() * 0.25,
                color: dropColor,
              });
              if (bloodSplatsRef.current.length > 140) {
                bloodSplatsRef.current.shift();
              }
            }

            // Enemy Death Trigger
            if (z.hp <= 0) {
              handleZombieDeath(z);
              break; // exit bullet check for this zombie since it died
            }
          }
        }

        // Only retain live zombies
        if (z.hp > 0) {
          activeZombies.push(z);
        }
      }
      zombiesRef.current = activeZombies;

      // Update active boss state for HUD (throttled to avoid 60Hz React re-renders)
      const liveBoss = activeZombies.find(z => z.isBoss && z.hp > 0);
      if (liveBoss) {
        const roundedHp = Math.round(liveBoss.hp);
        const lastSync = lastBossHudSyncRef.current;
        if (
          lastSync.id !== liveBoss.id ||
          (roundedHp !== lastSync.hp && now - lastSync.ts >= 120)
        ) {
          lastSync.id = liveBoss.id;
          lastSync.hp = roundedHp;
          lastSync.ts = now;
          setActiveBoss({
            id: liveBoss.id,
            name: liveBoss.bossName || 'CHEFE SUPREMO',
            title: liveBoss.bossTitle || 'AMEAÇA DE NÍVEL ALFA',
            hp: roundedHp,
            maxHp: Math.round(liveBoss.maxHp),
            type: liveBoss.type,
            color: liveBoss.color,
          });
        }
      } else if (lastBossHudSyncRef.current.id !== null) {
        lastBossHudSyncRef.current.id = null;
        lastBossHudSyncRef.current.hp = -1;
        setActiveBoss(prev => (prev ? null : prev));
      }

      // 5. UPDATE CONSUMABLE ITEM DROPS
      const activeDrops: ItemDrop[] = [];
      const drops = itemDropsRef.current;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.pulseTimer += dt * 5; // Pulse animation rate

        const distToPlayer = Math.hypot(p.x - d.x, p.y - d.y);
        
        // Attract drops slightly to player if very close (vacuum effect!)
        if (distToPlayer < 120) {
          const vacuumAngle = Math.atan2(p.y - d.y, p.x - d.x);
          const vacuumSpeed = 160 * (1 - distToPlayer / 120);
          d.x += Math.cos(vacuumAngle) * vacuumSpeed * dt;
          d.y += Math.sin(vacuumAngle) * vacuumSpeed * dt;
        }

        if (distToPlayer < p.radius + d.radius) {
          // Collect item!
          sound.playPowerup();

          if (d.type === DropType.HEALTH) {
            p.hp = Math.min(p.maxHp, p.hp + 25);
            // green particles
            createCollectParticles(d.x, d.y, '#10b981');
          } else if (d.type === DropType.AMMO || d.type === DropType.PISTOL_CLIP) {
            // Ammo is infinite, so collecting ammo crates rewards bonus credits!
            p.coinsEarned = (p.coinsEarned || 0) + 50;
            p.score = p.coinsEarned;
            createCollectParticles(d.x, d.y, '#fbbf24');
          } else if (d.type === DropType.SHIELD) {
            if (p.maxShield === 0) {
              p.maxShield = 25; // Unlock standard shield if not yet owned
            }
            p.shield = Math.min(p.maxShield, p.shield + 25);
            createCollectParticles(d.x, d.y, '#22d3ee');
          } else if (
            d.type === DropType.WEAPON_SHOTGUN || 
            d.type === DropType.WEAPON_MACHINE_GUN || 
            d.type === DropType.WEAPON_PLASMA_RIFLE || 
            d.type === DropType.WEAPON_MINIGUN ||
            d.type === DropType.WEAPON_ROCKET_LAUNCHER ||
            d.type === DropType.WEAPON_FLAMETHROWER ||
            d.type === DropType.WEAPON_RAYGUN ||
            d.type === DropType.WEAPON_RAY_RIFLE ||
            d.type === DropType.WEAPON_LASER_MINIGUN
          ) {
            const wt = d.type === DropType.WEAPON_SHOTGUN ? WeaponType.SHOTGUN : 
                       d.type === DropType.WEAPON_MACHINE_GUN ? WeaponType.MACHINE_GUN :
                       d.type === DropType.WEAPON_PLASMA_RIFLE ? WeaponType.PLASMA_RIFLE :
                       d.type === DropType.WEAPON_MINIGUN ? WeaponType.MINIGUN :
                       d.type === DropType.WEAPON_ROCKET_LAUNCHER ? WeaponType.ROCKET_LAUNCHER :
                       d.type === DropType.WEAPON_FLAMETHROWER ? WeaponType.FLAMETHROWER :
                       d.type === DropType.WEAPON_RAYGUN ? WeaponType.RAYGUN :
                       d.type === DropType.WEAPON_RAY_RIFLE ? WeaponType.RAY_RIFLE : WeaponType.LASER_MINIGUN;
            
            p.weapons[wt].unlocked = true;
            p.weapons[wt].currentAmmo = Infinity;
            p.weapons[wt].ammoCapacity = Infinity;
            p.currentWeapon = wt;
            setEquippedWeapon(wt);
            setUnlockedWeapons(prev => {
              const updated = prev.includes(wt) ? prev : [...prev, wt];
              localStorage.setItem('zombie_shooter_unlocked_weapons', JSON.stringify(updated));
              return updated;
            });
            localStorage.setItem('zombie_shooter_equipped_weapon', wt);
            createCollectParticles(d.x, d.y, d.color);
          }

          p.score = p.coinsEarned || 0;
          syncHudPlayer();
        } else {
          activeDrops.push(d);
        }
      }
      itemDropsRef.current = activeDrops;

      // 6. UPDATE PARTICLES
      const activeParticles: Particle[] = [];
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.alpha -= pt.decay;

        if ((pt.type === 'PLASMA_RING' || pt.type === 'FIRE_RING' || pt.type === 'EXPLOSION' || pt.type === 'RAY_RING' || pt.type === 'MYTHIC_NOVA') && pt.growthSpeed !== undefined) {
          pt.radius += pt.growthSpeed * dt;
        }

        if (pt.type === 'FLAME') {
          pt.radius += (pt.growthSpeed || 8) * dt;
          pt.vx *= Math.exp(-2 * dt);
          pt.vy *= Math.exp(-2 * dt);
        }

        if (pt.type === 'SMOKE') {
          if (pt.growthSpeed !== undefined) pt.radius += pt.growthSpeed * dt;
          pt.vx *= Math.exp(-4 * dt);
          pt.vy *= Math.exp(-4 * dt);
        }

        if (pt.type === 'MUZZLE_FLARE' && pt.growthSpeed !== undefined) {
          pt.radius += pt.growthSpeed * dt;
        }

        if (pt.rotation !== undefined && pt.rotSpeed !== undefined) {
          pt.rotation += pt.rotSpeed;
        }

        if (pt.alpha > 0) {
          activeParticles.push(pt);
        }
      }
      if (activeParticles.length > 260) {
        activeParticles.splice(0, activeParticles.length - 260);
      }
      particlesRef.current = activeParticles;

      // 7. SMOOTH CAMERA INTERPOLATION (LERP)
      cameraRef.current.x += (p.x - cameraRef.current.x) * 0.1;
      cameraRef.current.y += (p.y - cameraRef.current.y) * 0.1;

      // Keep camera inside arena boundaries
      if (canvasRef.current) {
        const halfW = canvasRef.current.width / 2;
        const halfH = canvasRef.current.height / 2;
        cameraRef.current.x = Math.max(halfW, Math.min(ARENA_SIZE - halfW, cameraRef.current.x));
        cameraRef.current.y = Math.max(halfH, Math.min(ARENA_SIZE - halfH, cameraRef.current.y));
      }

      // 8. DECAY WEAPON & GAME-FEEL RECOIL PARAMETERS
      screenShakeRef.current *= Math.exp(-12 * dt);
      if (screenShakeRef.current < 0.1) screenShakeRef.current = 0;

      muzzleFlashIntensityRef.current *= Math.exp(-22 * dt);
      if (muzzleFlashIntensityRef.current < 0.05) muzzleFlashIntensityRef.current = 0;

      gunRecoilRef.current *= Math.exp(-18 * dt);
      if (gunRecoilRef.current < 0.1) gunRecoilRef.current = 0;

      dynamicSpreadRef.current *= Math.exp(-6 * dt);
      if (dynamicSpreadRef.current < 0.001) dynamicSpreadRef.current = 0;
    };

    // Spawn sparkles on item collection
    const createCollectParticles = (cx: number, cy: number, color: string) => {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 80;
        particlesRef.current.push({
          id: `collect-${Date.now()}-${i}-${Math.random()}`,
          type: 'SPARK',
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 2,
          color,
          alpha: 1,
          decay: 0.03 + Math.random() * 0.03,
        });
      }
    };

    // Draw grid arena backgrounds, blood splats, entities, hud effects
    const drawGame = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D | null;
      if (!ctx) return;

      const p = playerRef.current;

      // Fill screen background dark slate
      ctx.fillStyle = '#020617'; // slate-950 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera translations offset coordinates
      let camX = cameraRef.current.x - canvas.width / 2;
      let camY = cameraRef.current.y - canvas.height / 2;

      // Apply screen shake (dynamic, Snappy camera shake)
      if (screenShakeRef.current > 0) {
        camX += (Math.random() * 2 - 1) * screenShakeRef.current;
        camY += (Math.random() * 2 - 1) * screenShakeRef.current;
      }

      // Camera viewport bounds for frustum culling
      const viewLeft = camX;
      const viewTop = camY;
      const viewRight = camX + canvas.width;
      const viewBottom = camY + canvas.height;

      // 1. DRAW TILE GRID LINES (Batched into a single path stroke for max FPS)
      const isAlienStage = modeRef.current === GameMode.ALIEN;
      ctx.strokeStyle = isAlienStage ? 'rgba(6, 182, 212, 0.18)' : 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      const startX = Math.floor(camX / gridSize) * gridSize;
      const startY = Math.floor(camY / gridSize) * gridSize;
      const endX = startX + canvas.width + gridSize;
      const endY = startY + canvas.height + gridSize;
      const minLineY = Math.max(0, camY) - camY;
      const maxLineY = Math.min(ARENA_SIZE, camY + canvas.height) - camY;
      const minLineX = Math.max(0, camX) - camX;
      const maxLineX = Math.min(ARENA_SIZE, camX + canvas.width) - camX;

      ctx.beginPath();
      for (let x = startX; x <= endX; x += gridSize) {
        if (x >= 0 && x <= ARENA_SIZE) {
          const sx = x - camX;
          ctx.moveTo(sx, minLineY);
          ctx.lineTo(sx, maxLineY);
        }
      }
      for (let y = startY; y <= endY; y += gridSize) {
        if (y >= 0 && y <= ARENA_SIZE) {
          const sy = y - camY;
          ctx.moveTo(minLineX, sy);
          ctx.lineTo(maxLineX, sy);
        }
      }
      ctx.stroke();

      // 2. DRAW ARENA BOUNDARY BORDERS (No shadowBlur)
      ctx.strokeStyle = isAlienStage ? '#06b6d4' : '#7f1d1d';
      ctx.lineWidth = 10;
      ctx.strokeRect(-camX, -camY, ARENA_SIZE, ARENA_SIZE);

      // 3. DRAW PERMANENT BLOOD SPLATTERS (Culled + no per-splat save/restore)
      const splats = bloodSplatsRef.current;
      for (let i = 0; i < splats.length; i++) {
        const s = splats[i];
        if (
          s.x + s.radius < viewLeft ||
          s.x - s.radius > viewRight ||
          s.y + s.radius < viewTop ||
          s.y - s.radius > viewBottom
        ) {
          continue;
        }
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x - camX, s.y - camY, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 3b. DRAW MUZZLE FLASH AMBIENT GLOW (Fast layered circles instead of createRadialGradient)
      if (muzzleFlashIntensityRef.current > 0) {
        let rgbColor = '251, 191, 36';
        if (p.currentWeapon === WeaponType.SHOTGUN) rgbColor = '248, 113, 113';
        else if (p.currentWeapon === WeaponType.MACHINE_GUN) rgbColor = '167, 139, 250';
        else if (p.currentWeapon === WeaponType.PLASMA_RIFLE) rgbColor = '56, 189, 248';

        const flashX = p.x + Math.cos(p.angle) * (p.radius + 15) - camX;
        const flashY = p.y + Math.sin(p.angle) * (p.radius + 15) - camY;
        const glowRadius =
          (p.currentWeapon === WeaponType.PLASMA_RIFLE
            ? 150
            : p.currentWeapon === WeaponType.SHOTGUN
              ? 130
              : 95) * muzzleFlashIntensityRef.current;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(${rgbColor}, ${(0.14 * muzzleFlashIntensityRef.current).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(flashX, flashY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${rgbColor}, ${(0.24 * muzzleFlashIntensityRef.current).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(flashX, flashY, glowRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. DRAW CONSUMABLE ITEM DROPS (Culled + fast glow ring instead of shadowBlur)
      const drops = itemDropsRef.current;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        if (
          d.x + 28 < viewLeft ||
          d.x - 28 > viewRight ||
          d.y + 28 < viewTop ||
          d.y - 28 > viewBottom
        ) {
          continue;
        }
        ctx.save();
        
        // Pulse scaling animation
        const pulse = 1 + Math.sin(d.pulseTimer) * 0.15;
        const screenX = d.x - camX;
        const screenY = d.y - camY;

        ctx.translate(screenX, screenY);
        ctx.scale(pulse, pulse);

        // Fast translucent halo ring (replaces shadowBlur)
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = d.color;
        ctx.beginPath();

        if (d.type === DropType.HEALTH) {
          // Draw Medical Cross Crate
          ctx.roundRect(-8, -8, 16, 16, 3);
          ctx.fill();
          // Draw inner cross
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-2, -6, 4, 12);
          ctx.fillRect(-6, -2, 12, 4);
        } else if (d.type === DropType.AMMO) {
          // Draw Bullet Crate
          ctx.roundRect(-9, -7, 18, 14, 2);
          ctx.fill();
          // Draw simple ammo details
          ctx.fillStyle = '#000000';
          ctx.fillRect(-5, -3, 2, 6);
          ctx.fillRect(-1, -3, 2, 6);
          ctx.fillRect(3, -3, 2, 6);
        } else if (d.type === DropType.PISTOL_CLIP) {
          // Draw Pistol Clip (vertical ammo clip)
          ctx.roundRect(-6, -10, 12, 20, 2);
          ctx.fill();
          // Draw metallic highlights/bullets inside the clip
          ctx.fillStyle = '#1e293b'; // dark clip background
          ctx.fillRect(-3, -7, 6, 14);
          ctx.fillStyle = '#fbbf24'; // gold bullet tips visible at the top
          ctx.fillRect(-2, -6, 4, 3);
          ctx.fillRect(-2, -1, 4, 3);
          ctx.fillRect(-2, 4, 4, 3);
        } else if (d.type === DropType.SHIELD) {
          // Draw Energy shield orb
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-3, -1);
          ctx.lineTo(0, 3);
          ctx.lineTo(3, -1);
          ctx.stroke();
        } else {
          // Weapon Unlock crate!
          ctx.roundRect(-10, -10, 20, 20, 4);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -2, 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-1, 2, 2, 2);
        }

        ctx.restore();
      }

      // 5. DRAW FLAMETHROWER STREAM AND BULLETS (Culled to viewport)
      renderFlamethrowerStream(ctx, flameStreamRef.current, camX, camY, time);

      const bullets = bulletsRef.current;
      for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        const bPad = b.radius + 36;
        if (
          b.x + bPad < viewLeft ||
          b.x - bPad > viewRight ||
          b.y + bPad < viewTop ||
          b.y - bPad > viewBottom
        ) {
          continue;
        }
        renderBulletVisual(ctx, b, camX, camY, time);
      }

      // 6. DRAW ZOMBIES (Frustum culled + cached shading instead of radial gradient & shadowBlur)
      const zombies = zombiesRef.current;
      for (let i = 0; i < zombies.length; i++) {
        const z = zombies[i];
        const zPad = z.radius + 45;
        if (
          z.x + zPad < viewLeft ||
          z.x - zPad > viewRight ||
          z.y + zPad < viewTop ||
          z.y - zPad > viewBottom
        ) {
          continue;
        }
        const szX = z.x - camX;
        const szY = z.y - camY;

        ctx.save();
        ctx.translate(szX, szY);
        ctx.rotate(z.angle);

        // Draw zombie body shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(4, 4, z.radius, 0, Math.PI * 2);
        ctx.fill();

        const isAlien = z.type === ZombieType.ALIEN_SCOUT || 
                        z.type === ZombieType.ALIEN_DRONE || 
                        z.type === ZombieType.ALIEN_SHOOTER || 
                        z.type === ZombieType.ALIEN_COLOSSUS || 
                        z.type === ZombieType.ALIEN_OVERLORD ||
                        z.type === ZombieType.ALIEN_DREADNOUGHT ||
                        z.type === ZombieType.ALIEN_LEVIATHAN;

        // Fast layered shading (replaces expensive per-zombie createRadialGradient)
        ctx.fillStyle = darkenColor(z.color, 35);
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = z.color;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius * 0.78, 0, Math.PI * 2);
        ctx.fill();

        // Fire aura if burning (fast layered translucent halo without shadowBlur)
        if (z.isOnFire) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.34)';
          ctx.beginPath();
          ctx.arc(0, 0, z.radius + 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Stroke outline
        ctx.strokeStyle = isAlien 
          ? (z.isBoss ? '#f43f5e' : '#083344') 
          : (z.isBoss ? '#7f1d1d' : '#052e16');
        ctx.lineWidth = z.isBoss ? 5 : (z.type === ZombieType.TANK || z.type === ZombieType.ALIEN_COLOSSUS) ? 3 : 2;
        ctx.stroke();

        if (isAlien) {
          // ==========================================
          // ALIEN VISUALS
          // ==========================================
          if (z.type === ZombieType.ALIEN_DRONE) {
            // Rotating outer cyber-thruster pods
            const spin = time * 0.005;
            for (let a = 0; a < 3; a++) {
              const podAngle = spin + (a * Math.PI * 2) / 3;
              const px = Math.cos(podAngle) * (z.radius + 4);
              const py = Math.sin(podAngle) * (z.radius + 4);
              ctx.fillStyle = '#c084fc';
              ctx.beginPath();
              ctx.arc(px, py, 3, 0, Math.PI * 2);
              ctx.fill();
            }

            // Central pulsing violet ocular sensor
            ctx.fillStyle = '#e879f9';
            ctx.beginPath();
            ctx.arc(z.radius * 0.35, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (z.type === ZombieType.ALIEN_COLOSSUS) {
            // Armored heavy chitin carapace ridges
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-z.radius * 0.2, 0, z.radius * 0.7, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();

            // Heavy mandible claws
            ctx.fillStyle = '#4338ca';
            ctx.beginPath();
            ctx.arc(z.radius * 0.8, -z.radius * 0.45, 5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.8, z.radius * 0.45, 5, 0, Math.PI * 2);
            ctx.fill();

            // Glowing green sensory slits
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath();
            ctx.arc(z.radius * 0.5, -z.radius * 0.25, 2.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.5, z.radius * 0.25, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (z.type === ZombieType.ALIEN_OVERLORD) {
            // Psychic crown horns / crest
            ctx.fillStyle = '#be185d';
            ctx.beginPath();
            ctx.moveTo(z.radius * 0.8, 0);
            ctx.lineTo(z.radius * 1.3, -z.radius * 0.4);
            ctx.lineTo(z.radius * 1.1, 0);
            ctx.lineTo(z.radius * 1.3, z.radius * 0.4);
            ctx.closePath();
            ctx.fill();

            // 3 psychic glowing eyes
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(z.radius * 0.5, -z.radius * 0.3, 3.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.5, z.radius * 0.3, 3.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.65, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (z.type === ZombieType.ALIEN_DREADNOUGHT) {
            // Dreadnought Floating Warship: Hex Carapace
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 2;
            ctx.strokeRect(-z.radius * 0.45, -z.radius * 0.45, z.radius * 0.9, z.radius * 0.9);

            // 4 rotating outer engine thrusters
            const dreadSpin = time * 0.004;
            for (let a = 0; a < 4; a++) {
              const podAngle = dreadSpin + (a * Math.PI) / 2;
              const px = Math.cos(podAngle) * (z.radius + 6);
              const py = Math.sin(podAngle) * (z.radius + 6);
              ctx.fillStyle = '#06b6d4';
              ctx.beginPath();
              ctx.arc(px, py, 4.5, 0, Math.PI * 2);
              ctx.fill();
              // Blue ion flame
              ctx.fillStyle = '#00ffcc';
              ctx.beginPath();
              ctx.arc(px * 1.1, py * 1.1, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Dual Front Heavy Plasma Cannons
            ctx.fillStyle = '#0e7490';
            ctx.fillRect(z.radius * 0.6, -11, 14, 5);
            ctx.fillRect(z.radius * 0.6, 6, 14, 5);

            // Core Reactor
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (z.type === ZombieType.ALIEN_LEVIATHAN) {
            // Leviathan Cosmic Void Entity
            // 3 radiating cosmic energy crests
            ctx.fillStyle = '#7e22ce';
            for (let c = -1; c <= 1; c++) {
              ctx.beginPath();
              ctx.moveTo(z.radius * 0.7, c * 15);
              ctx.lineTo(z.radius * 1.35, c * 22);
              ctx.lineTo(z.radius * 0.9, c * 5);
              ctx.closePath();
              ctx.fill();
            }

            // 4 orbiting cosmic particle motes
            const leviSpin = time * 0.003;
            for (let m = 0; m < 4; m++) {
              const moteAngle = leviSpin + (m * Math.PI) / 2;
              const mx = Math.cos(moteAngle) * (z.radius + 8);
              const my = Math.sin(moteAngle) * (z.radius + 8);
              ctx.fillStyle = '#e879f9';
              ctx.beginPath();
              ctx.arc(mx, my, 4, 0, Math.PI * 2);
              ctx.fill();
            }

            // 5 multi-spectral glowing celestial eyes
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(z.radius * 0.5, -14, 3.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.5, 14, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.arc(z.radius * 0.6, -7, 3, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.6, 7, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.arc(z.radius * 0.7, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Alien Scout & Alien Shooter
            ctx.fillStyle = z.type === ZombieType.ALIEN_SHOOTER ? '#0e7490' : '#00ffcc';
            ctx.beginPath();
            ctx.arc(z.radius * 0.8, -z.radius * 0.35, 3.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.8, z.radius * 0.35, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Sleek glowing alien ocular slit eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(z.radius * 0.4, -z.radius * 0.35, z.radius * 0.28, z.radius * 0.16, Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(z.radius * 0.4, z.radius * 0.35, z.radius * 0.28, z.radius * 0.16, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00ffcc';
            ctx.beginPath();
            ctx.arc(z.radius * 0.45, -z.radius * 0.35, 2, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.45, z.radius * 0.35, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // ==========================================
          // ZOMBIE VISUALS
          // ==========================================
          // Reaching decaying undead hands
          ctx.fillStyle = z.color;
          ctx.beginPath();
          ctx.arc(z.radius * 0.7, -z.radius * 0.4, 4, 0, Math.PI * 2);
          ctx.arc(z.radius * 0.7, z.radius * 0.4, 4, 0, Math.PI * 2);
          ctx.fill();

          if (z.type === ZombieType.BOSS) {
            // Tirano Necrótico: Bone shoulder plates & White Eyes
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(-z.radius * 0.2, -z.radius * 0.6, 6, 0, Math.PI * 2);
            ctx.arc(-z.radius * 0.2, z.radius * 0.6, 6, 0, Math.PI * 2);
            ctx.fill();

            // Glowing dead white eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(z.radius * 0.4, -z.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.4, z.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (z.type === ZombieType.BOSS_BUTCHER) {
            // Golias Açougueiro: Giant rusted steel cleaver blade strapped on right arm
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(z.radius * 0.4, z.radius * 0.25, z.radius * 0.75, 10);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(z.radius * 0.4, z.radius * 0.25, z.radius * 0.75, 2);

            // Metal jaw staples
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(z.radius * 0.5, -6);
            ctx.lineTo(z.radius * 0.5, 6);
            ctx.stroke();

            // Glowing yellow butcher eyes
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(z.radius * 0.4, -z.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.4, z.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (z.type === ZombieType.BOSS_NECROTITAN) {
            // Necro-Titã: 4 massive bone spikes jutting out of back
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 3.5;
            for (let s = 0; s < 4; s++) {
              const sy = (s - 1.5) * 16;
              ctx.beginPath();
              ctx.moveTo(-z.radius * 0.3, sy);
              ctx.lineTo(-z.radius * 1.25, sy * 1.3);
              ctx.stroke();
            }

            // Dark matter glowing violet core
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();

            // Glowing violet skull eyes
            ctx.fillStyle = '#e879f9';
            ctx.beginPath();
            ctx.arc(z.radius * 0.4, -z.radius * 0.3, 4.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.4, z.radius * 0.3, 4.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (z.type === ZombieType.TOXIC_SPITTER) {
            // Acid pustules on back
            ctx.fillStyle = '#bef264';
            ctx.beginPath();
            ctx.arc(-z.radius * 0.3, -z.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.arc(-z.radius * 0.4, 0, 5, 0, Math.PI * 2);
            ctx.arc(-z.radius * 0.3, z.radius * 0.3, 4, 0, Math.PI * 2);
            ctx.fill();

            // Acid drooling jaws
            ctx.fillStyle = '#a3e635';
            ctx.beginPath();
            ctx.arc(z.radius * 0.6, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            // Glowing lime eyes
            ctx.fillStyle = '#ecfccb';
            ctx.beginPath();
            ctx.arc(z.radius * 0.4, -z.radius * 0.3, 2.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.4, z.radius * 0.3, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Standard / Runner / Tank eyes
            ctx.fillStyle = z.type === ZombieType.RUNNER ? '#f97316' : '#f87171';
            ctx.beginPath();
            ctx.arc(z.radius * 0.4, -z.radius * 0.3, 2.5, 0, Math.PI * 2);
            ctx.arc(z.radius * 0.4, z.radius * 0.3, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();

        // Draw a HP bar above boss or big zombies
        if (z.isBoss || (z.hp < z.maxHp && z.maxHp > 30)) {
          const barW = z.radius * (z.isBoss ? 2.4 : 2);
          const barH = z.isBoss ? 7 : 5;
          const bx = szX - barW / 2;
          const by = szY - z.radius - (z.isBoss ? 16 : 12);

          ctx.save();
          // background
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.fillRect(bx, by, barW, barH);
          // progress
          ctx.fillStyle = z.isBoss ? (isAlien ? '#ec4899' : '#dc2626') : '#22c55e';
          const hpRatio = Math.max(0, z.hp / z.maxHp);
          ctx.fillRect(bx, by, barW * hpRatio, barH);
          // border
          ctx.strokeStyle = z.isBoss ? '#ffffff' : 'rgba(255,255,255,0.2)';
          ctx.lineWidth = z.isBoss ? 1.5 : 1;
          ctx.strokeRect(bx, by, barW, barH);
          ctx.restore();
        }
      }

      // 7. DRAW PLAYER OR DOWNED OPERATOR
      const spX = p.x - camX;
      const spY = p.y - camY;

      if (dyingRef.current?.active) {
        const d = dyingRef.current;
        const deathProgress = Math.min(1, Math.max(0, 1 - d.timer / d.total));

        // A. Real-time expanding dark arterial blood pool on ground
        ctx.save();
        const poolR = d.bloodPoolRadius;
        const poolGrad = ctx.createRadialGradient(spX, spY, 2, spX, spY, poolR);
        poolGrad.addColorStop(0, '#3f0606');
        poolGrad.addColorStop(0.65, '#5c0a0a');
        poolGrad.addColorStop(0.9, '#7f1d1d');
        poolGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.arc(spX, spY, poolR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // B. Dropped weapon skidding / resting on floor
        const dw = d.droppedWeapon;
        ctx.save();
        ctx.translate(dw.x - camX, dw.y - camY);
        ctx.rotate(dw.angle);
        // Weapon shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(-2, 2, 20, 6);
        renderPlayerWeapon(ctx, dw.type, 0, time, 0);
        ctx.restore();

        // C. Collapsed Downed Operator Body
        ctx.save();
        ctx.translate(spX, spY);
        // Tilt body flat on ground along fatal attack angle
        const collapseAngle = p.angle + (d.fatalAngle - p.angle) * Math.min(1, deathProgress * 1.6);
        ctx.rotate(collapseAngle);

        // Flattening floor shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(3, 4, p.radius * (1 - deathProgress * 0.15), p.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        renderOperatorBody(ctx, 'skin_default', p.radius, time, false, deathProgress);
        ctx.restore();
      } else {
        const isMoving = Math.hypot(p.vx || 0, p.vy || 0) > 10;

        // Active Mythic Solar Phoenix Aura beneath player/ship
        if (p.mythicSolarAura && p.mythicSolarAura > 0) {
          renderMythicSolarAura(ctx, spX, spY, p.mythicSolarAura, time);
        }

        if (
          p.currentWeapon === WeaponType.DESTRUCTOR ||
          p.currentWeapon === WeaponType.INTERCEPTOR ||
          p.currentWeapon === WeaponType.NAVE_REI
        ) {
          const ds = destructorStateRef.current;
          const isReiDraw = p.currentWeapon === WeaponType.NAVE_REI;

          // A0: Continuous Thruster Exhaust Ribbon Trails behind both rear nozzles
          renderDestructorThrusterTrails(
            ctx,
            ds.leftTrail,
            ds.rightTrail,
            camX,
            camY,
            ds.warpActive,
            time,
            isReiDraw && (ds.warpActive || ds.warpChargeTimer > 0.6)
          );

          const smDraw = shipMasteryRef.current;
          const hasCapDraw = hasMasteryNode(smDraw, 'DESTRUCTOR', 'dest_capacitor');
          const hasReiCoreDraw = hasMasteryNode(smDraw, 'NAVE_REI', 'rei_crimson_core');
          const destChargeMax = hasCapDraw ? 2.1 : 3.0;
          const destWarpMax = hasCapDraw ? 10.0 : 8.0;
          const reiChargeMax = hasReiCoreDraw ? 4.5 : 6.0;

          if (p.currentWeapon === WeaponType.DESTRUCTOR) {
            // A: Continuous Twin Laser Beams when firing (+ 3rd center singularity beam if unlocked)
            if (ds.isFiring) {
              const BEAM_RANGE = 950;
              const leftEndX = ds.leftMuzzleX + Math.cos(ds.leftBlasterAngle) * BEAM_RANGE;
              const leftEndY = ds.leftMuzzleY + Math.sin(ds.leftBlasterAngle) * BEAM_RANGE;
              const rightEndX = ds.rightMuzzleX + Math.cos(ds.rightBlasterAngle) * BEAM_RANGE;
              const rightEndY = ds.rightMuzzleY + Math.sin(ds.rightBlasterAngle) * BEAM_RANGE;

              renderDestructorTwinBeams(
                ctx,
                ds.leftMuzzleX,
                ds.leftMuzzleY,
                leftEndX,
                leftEndY,
                ds.rightMuzzleX,
                ds.rightMuzzleY,
                rightEndX,
                rightEndY,
                camX,
                camY,
                ds.warpActive,
                time,
                ds.laserChargeProgress
              );

              if (ds.warpActive && hasMasteryNode(smDraw, 'DESTRUCTOR', 'dest_singularity')) {
                const midAngle = (ds.leftBlasterAngle + ds.rightBlasterAngle) * 0.5;
                renderSingleExtraLaserBeam(
                  ctx,
                  p.x,
                  p.y,
                  p.x + Math.cos(midAngle) * BEAM_RANGE,
                  p.y + Math.sin(midAngle) * BEAM_RANGE,
                  camX,
                  camY,
                  '#d946ef',
                  'rgba(192, 132, 252, 0.42)',
                  1.35,
                  time,
                  ds.laserChargeProgress
                );
              }
            }

            // B: Transform Player into the Destructor Spaceship + Twin ±30° Blasters + Particle Accelerator Orbs
            renderDestructorShip(
              ctx,
              spX,
              spY,
              p.angle,
              ds.leftBlasterAngle,
              ds.rightBlasterAngle,
              isMoving,
              ds.isFiring,
              ds.warpChargeTimer / destChargeMax,
              ds.warpActive,
              ds.warpActive ? Math.max(0, ds.warpTimer / destWarpMax) : 0,
              ds.orbitAngle,
              time,
              p.shield
            );
          } else if (p.currentWeapon === WeaponType.INTERCEPTOR) {
            // B: Transform Player into the Long-Wing Interceptor Spaceship + Wingtip Rapid Orb Blasters
            renderInterceptorShip(
              ctx,
              spX,
              spY,
              p.angle,
              ds.leftBlasterAngle,
              ds.rightBlasterAngle,
              isMoving,
              ds.isFiring,
              ds.warpChargeTimer / 3.0,
              ds.warpActive,
              ds.warpActive ? Math.max(0, ds.warpTimer / 8.0) : 0,
              ds.orbitAngle,
              time,
              p.shield,
              ds.angularVel
            );
          } else {
            // A: 4 Continuous Quad Laser Beams (+2 extra flank crimson lasers if rei_emperor unlocked)
            if (ds.isFiring && ds.reiBlasters.length === 4) {
              const rRange = ds.warpActive ? 1150 : 980;
              renderReiQuadBeams(
                ctx,
                ds.reiBlasters,
                rRange,
                camX,
                camY,
                ds.warpActive,
                time,
                ds.laserChargeProgress
              );
              if (ds.warpActive && hasMasteryNode(smDraw, 'NAVE_REI', 'rei_emperor')) {
                const avgA =
                  (ds.reiBlasters[0].angle + ds.reiBlasters[3].angle) * 0.5;
                [-0.18, 0.18].forEach((flankOff) => {
                  const fa = avgA + flankOff;
                  renderSingleExtraLaserBeam(
                    ctx,
                    p.x + Math.cos(fa) * 28,
                    p.y + Math.sin(fa) * 28,
                    p.x + Math.cos(fa) * rRange,
                    p.y + Math.sin(fa) * rRange,
                    camX,
                    camY,
                    '#ef4444',
                    'rgba(220, 38, 38, 0.45)',
                    1.25,
                    time,
                    ds.laserChargeProgress
                  );
                });
              }
            }

            // B: Transform Player into the Giant Nave Rei Flagship + 4 Blasters + Red Electricity Fury
            renderReiShip(
              ctx,
              spX,
              spY,
              p.angle,
              ds.reiBlasters,
              isMoving,
              ds.isFiring,
              ds.warpChargeTimer / reiChargeMax,
              ds.warpActive,
              ds.warpActive ? Math.max(0, ds.warpTimer / 10.0) : 0,
              ds.orbitAngle,
              time,
              p.shield,
              ds.angularVel
            );
          }
        } else if (p.currentWeapon === WeaponType.EAST_DRAGON) {
          const ed = eastDragonStateRef.current;
          if (ed.isFiring) {
            renderEastDragonFireBeam(
              ctx,
              ed.muzzleX,
              ed.muzzleY,
              ed.beamEndX,
              ed.beamEndY,
              camX,
              camY,
              time
            );
          }
          renderEastDragon(
            ctx,
            ed.segments,
            p.x,
            p.y,
            p.angle,
            camX,
            camY,
            isMoving,
            ed.isFiring,
            time,
            p.shield
          );
        } else if (p.currentWeapon === WeaponType.IRON_MAN) {
          const im = ironManStateRef.current;
          renderIronManFlightTrail(ctx, im.trail, camX, camY, im.mode, time);
          if (im.isFiring && im.mode === 'LASER') {
            renderIronManLaserBeam(
              ctx,
              im.muzzleX,
              im.muzzleY,
              im.beamEndX,
              im.beamEndY,
              camX,
              camY,
              time,
              im.laserChargeProgress
            );
          }
          renderIronManSuit(
            ctx,
            spX,
            spY,
            p.angle,
            im.mode,
            isMoving,
            im.isFiring,
            time,
            p.shield
          );
        } else {
          // Spawn subtle motion trail particles if moving
          if (isMoving && Math.random() < 0.45) {
            particlesRef.current.push({
              id: `ptrail-${Date.now()}-${Math.random()}`,
              type: 'SPARK',
              x: p.x + (Math.random() - 0.5) * 8,
              y: p.y + (Math.random() - 0.5) * 8,
              vx: -(p.vx || 0) * 0.15,
              vy: -(p.vy || 0) * 0.15,
              radius: 2 + Math.random() * 2,
              color: '#38bdf8',
              alpha: 0.6,
              decay: 0.05,
            });
          }

          ctx.save();
          ctx.translate(spX, spY);
          ctx.rotate(p.angle);

          // A: Draw distinct bespoke weapon model & tactical gloved hands in player's grip
          renderPlayerWeapon(ctx, p.currentWeapon, gunRecoilRef.current, time, p.radius);

          // B: Draw player shadow body
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.beginPath();
          ctx.arc(3, 3, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // C: Draw rich bespoke tactical operator suit, armor plates, and visor
          renderOperatorBody(ctx, 'skin_default', p.radius, time, isMoving, 0);

          ctx.restore();

          // D: Draw pulsing glowing cyan shield if shield is active (fast dual-stroke halo)
          if (p.shield > 0) {
            const pulseW = 2.5 + Math.sin(time / 150) * 1.0;
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.20)';
            ctx.lineWidth = pulseW + 5;
            ctx.beginPath();
            ctx.arc(spX, spY, p.radius + 8, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
            ctx.lineWidth = pulseW;
            ctx.beginPath();
            ctx.arc(spX, spY, p.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
          }

          // E: Render Ice & Fire Dragon dual companions (or Mega Purple Dragon when fused!) + elemental beam
          if (p.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON) {
            const ifdDraw = iceFireDragonStateRef.current;
            if (ifdDraw.isFiring) {
              const beamVar: 'FIRE' | 'ICE' | 'MEGA_PURPLE' = ifdDraw.merged
                ? 'MEGA_PURPLE'
                : ifdDraw.activeDragon;
              renderDragonElementalBeam(
                ctx,
                beamVar,
                ifdDraw.muzzleX,
                ifdDraw.muzzleY,
                ifdDraw.beamEndX,
                ifdDraw.beamEndY,
                camX,
                camY,
                time
              );
            }

            if (ifdDraw.merged) {
              renderCompanionDragon(
                ctx,
                'MEGA_PURPLE',
                ifdDraw.megaSegments,
                ifdDraw.megaHead.x,
                ifdDraw.megaHead.y,
                ifdDraw.megaHead.angle,
                camX,
                camY,
                isMoving,
                ifdDraw.isFiring,
                true,
                time,
                1.65
              );
            } else {
              // Draw idle escort dragon first, then active attacker dragon on top
              const firstVar: 'FIRE' | 'ICE' = ifdDraw.activeDragon === 'FIRE' ? 'ICE' : 'FIRE';
              const secondVar: 'FIRE' | 'ICE' = ifdDraw.activeDragon;
              const drawPair = [
                {
                  variant: firstVar,
                  segs: firstVar === 'FIRE' ? ifdDraw.fireSegments : ifdDraw.iceSegments,
                  head: firstVar === 'FIRE' ? ifdDraw.fireHead : ifdDraw.iceHead,
                  isAttacker: false,
                },
                {
                  variant: secondVar,
                  segs: secondVar === 'FIRE' ? ifdDraw.fireSegments : ifdDraw.iceSegments,
                  head: secondVar === 'FIRE' ? ifdDraw.fireHead : ifdDraw.iceHead,
                  isAttacker: true,
                },
              ];
              for (let di = 0; di < drawPair.length; di++) {
                const d = drawPair[di];
                renderCompanionDragon(
                  ctx,
                  d.variant,
                  d.segs,
                  d.head.x,
                  d.head.y,
                  d.head.angle,
                  camX,
                  camY,
                  isMoving,
                  d.isAttacker && ifdDraw.isFiring,
                  d.isAttacker,
                  time,
                  0.85
                );
              }
            }
          }
        }

        // Active Mythic Singularity: 5 Orbiting Cosmic Scythe Blades
        if (p.mythicSingularity && p.mythicSingularity > 0) {
          renderMythicSingularityBlades(
            ctx,
            spX,
            spY,
            mythicCombatRef.current.orbitalAngle,
            5,
            time
          );
        }

        // Active Mythic Void Monarch: 3 Autonomous Hunter Drones
        if (p.mythicVoidDrones && p.mythicVoidDrones > 0) {
          renderMythicVoidDrones(ctx, mythicCombatRef.current.voidDrones, camX, camY, time);
        }
      }

      // 8. DRAW PARTICLES (Frustum culled + fast layered rendering without shadowBlur/gradients)
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        if (!pt.points) {
          const pPad = pt.radius + 40;
          if (
            pt.x + pPad < viewLeft ||
            pt.x - pPad > viewRight ||
            pt.y + pPad < viewTop ||
            pt.y - pPad > viewBottom
          ) {
            continue;
          }
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;

        if (pt.type === 'CASING' && pt.rotation !== undefined) {
          ctx.translate(pt.x - camX, pt.y - camY);
          ctx.rotate(pt.rotation);
          ctx.fillRect(-2, -1, 4, 2); // rectangular shell
        } else if (pt.type === 'MYTHIC_NOVA') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius * 0.78, 0, Math.PI * 2);
          ctx.stroke();
        } else if (pt.type === 'PLASMA_RING' || pt.type === 'RAY_RING') {
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius * 0.98, 0, Math.PI * 2);
          ctx.stroke();
        } else if (pt.type === 'FIRE_RING') {
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius * 0.96, 0, Math.PI * 2);
          ctx.stroke();
        } else if (pt.type === 'EXPLOSION') {
          const rx = pt.x - camX;
          const ry = pt.y - camY;
          const rad = Math.max(1, pt.radius);
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
          ctx.beginPath();
          ctx.arc(rx, ry, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
          ctx.beginPath();
          ctx.arc(rx, ry, rad * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(rx, ry, rad * 0.22, 0, Math.PI * 2);
          ctx.fill();
        } else if (pt.type === 'FLAME') {
          const rx = pt.x - camX;
          const ry = pt.y - camY;
          const speedSq = pt.vx * pt.vx + pt.vy * pt.vy;
          const velAngle = speedSq > 16 ? Math.atan2(pt.vy, pt.vx) : -Math.PI / 2;
          const tongueLen = Math.max(8, pt.radius * 3.4);
          const tongueHalfW = Math.max(2, pt.radius * 1.05);

          ctx.translate(rx, ry);
          ctx.rotate(velAngle);
          ctx.globalCompositeOperation = 'lighter';

          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.moveTo(-tongueLen * 0.2, 0);
          ctx.quadraticCurveTo(tongueLen * 0.15, -tongueHalfW, tongueLen, 0);
          ctx.quadraticCurveTo(tongueLen * 0.15, tongueHalfW, -tongueLen * 0.2, 0);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = 'rgba(254, 249, 195, 0.85)';
          ctx.beginPath();
          ctx.moveTo(-tongueLen * 0.1, 0);
          ctx.quadraticCurveTo(tongueLen * 0.1, -tongueHalfW * 0.45, tongueLen * 0.55, 0);
          ctx.quadraticCurveTo(tongueLen * 0.1, tongueHalfW * 0.45, -tongueLen * 0.1, 0);
          ctx.closePath();
          ctx.fill();
        } else if (pt.type === 'ENERGY_ARC' && pt.points) {
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          ctx.moveTo(pt.x - camX, pt.y - camY);
          for (const pPoint of pt.points) {
            ctx.lineTo(pPoint.x - camX, pPoint.y - camY);
          }
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(pt.x - camX, pt.y - camY);
          for (const pPoint of pt.points) {
            ctx.lineTo(pPoint.x - camX, pPoint.y - camY);
          }
          ctx.stroke();
        } else if (pt.type === 'SMOKE') {
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (pt.type === 'MUZZLE_FLARE') {
          const rx = pt.x - camX;
          const ry = pt.y - camY;
          ctx.globalCompositeOperation = 'lighter';

          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(rx, ry, pt.radius * 0.65, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = pt.color;
          ctx.lineWidth = pt.radius * 0.25;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(rx - pt.radius * 1.4, ry);
          ctx.lineTo(rx + pt.radius * 1.4, ry);
          ctx.moveTo(rx, ry - pt.radius * 0.7);
          ctx.lineTo(rx, ry + pt.radius * 0.7);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = pt.radius * 0.1;
          ctx.beginPath();
          ctx.moveTo(rx - pt.radius * 1.1, ry);
          ctx.lineTo(rx + pt.radius * 1.1, ry);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pt.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 9. DRAW "WAVE TRANSITION / INCOMING HORDE" ALERTS OVERLAYS
      if (!waveActiveRef.current && wave > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; // glowing red tint screen
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Countdown alert
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('ALERTA DE INFECTADOS APRESSADOS', canvas.width / 2, canvas.height / 2 - 35);

        ctx.font = '900 36px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`PREPARAR PARA ONDA ${wave + 1}!`, canvas.width / 2, canvas.height / 2);

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText('A PRÓXIMA HORDA CHEGA EM BREVE...', canvas.width / 2, canvas.height / 2 + 35);
        ctx.restore();
      }

      // 10. VISCERAL CANVAS-LEVEL LOW HEALTH ARTERIAL PULSE
      if (gameState === GameState.PLAYING && p.hp > 0 && p.hp <= p.maxHp * 0.30) {
        const hpRatio = p.hp / (p.maxHp * 0.30); // 1.0 down to 0.0
        const beatDuration = 380 + hpRatio * 440;
        const timeSinceBeat = time - lastHeartbeatRef.current;
        const pulsePhase = Math.max(0, Math.min(1, 1 - timeSinceBeat / beatDuration));
        const arterialThrob = Math.sin(pulsePhase * Math.PI);

        ctx.save();
        // Dynamic radial vignette tuned to heartbeat
        const minDim = Math.min(canvas.width, canvas.height);
        const innerR = minDim * (0.24 + hpRatio * 0.22 - arterialThrob * 0.05);
        const outerR = minDim * 0.75;
        const vigGrad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          Math.max(10, innerR),
          canvas.width / 2,
          canvas.height / 2,
          outerR
        );

        const edgeAlpha = (0.35 + (1 - hpRatio) * 0.45) * (0.65 + arterialThrob * 0.35);
        vigGrad.addColorStop(0, 'rgba(153, 27, 27, 0)');
        vigGrad.addColorStop(0.65, `rgba(185, 28, 28, ${edgeAlpha * 0.5})`);
        vigGrad.addColorStop(1, `rgba(69, 10, 10, ${edgeAlpha})`);

        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Flash red tint at the apex of the heartbeat thump when extreme (<15% HP)
        if (hpRatio < 0.5 && arterialThrob > 0.6) {
          ctx.fillStyle = `rgba(220, 38, 38, ${(arterialThrob - 0.6) * 0.22})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
      }

      // 11. DRAMATIC SLOW-MOTION DEATH COLLAPSE OVERLAY
      if (dyingRef.current?.active) {
        const progress = Math.min(1, Math.max(0, 1 - dyingRef.current.timer / dyingRef.current.total));
        ctx.save();

        // Atmospheric red-black fade
        ctx.fillStyle = `rgba(69, 10, 10, ${progress * 0.45})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = `rgba(2, 6, 23, ${progress * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cinematic Widescreen Letterbox Bars
        const barHeight = Math.min(65, canvas.height * 0.11 * Math.min(1, progress * 1.8));
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, barHeight);
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

        // CRT Telemetry Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        for (let y = barHeight; y < canvas.height - barHeight; y += 4) {
          ctx.fillRect(0, y, canvas.width, 1.5);
        }

        // Biometric Heart Monitor Flatline Line Across Center
        if (progress > 0.25) {
          const flatlineAlpha = Math.min(1, (progress - 0.25) * 2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${flatlineAlpha * 0.85})`;
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2 + 55);
          ctx.lineTo(canvas.width, canvas.height / 2 + 55);
          ctx.stroke();

          // Cardiac flatline pulse label
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = `rgba(248, 113, 113, ${flatlineAlpha})`;
          ctx.textAlign = 'right';
          ctx.fillText('EKG MONITOR: 0 BPM [PARADA CARDÍACA]', canvas.width - 25, canvas.height / 2 + 48);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glitch offset on text
        const glitchX = (Math.random() - 0.5) * (progress < 0.6 ? 4 : 0);
        const glitchY = (Math.random() - 0.5) * (progress < 0.6 ? 2 : 0);

        // Large bold failure announcement
        ctx.font = '900 32px Chakra Petch, sans-serif';
        ctx.fillStyle = `rgba(239, 68, 68, ${Math.min(1, progress * 1.6)})`;
        ctx.fillText('SINAL DO OPERADOR PERDIDO', canvas.width / 2 + glitchX, canvas.height / 2 - 20 + glitchY);

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = `rgba(254, 202, 202, ${Math.min(1, progress * 1.5)})`;
        ctx.fillText('COLAPSO DE SINAIS VITAIS // EXTRAÇÃO TÁTICA ABORTADA', canvas.width / 2, canvas.height / 2 + 18);

        ctx.restore();
      }
    };

    // Cached helper to darken hex colors without per-frame hex parsing overhead
    const darkColorCache = new Map<string, string>();
    const darkenColor = (hex: string, percent: number) => {
      const key = `${hex}_${percent}`;
      const cached = darkColorCache.get(key);
      if (cached) return cached;
      const num = parseInt(hex.replace('#', ''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = ((num >> 8) & 0x00ff) - amt,
        B = (num & 0x0000ff) - amt;
      const res =
        '#' +
        (
          0x1000000 +
          (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
          (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
          (B < 0 ? 0 : B > 255 ? 255 : B)
        )
          .toString(16)
          .slice(1);
      darkColorCache.set(key, res);
      return res;
    };

    // Resize canvas to match the exact dimensions of its screen parent container
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Run requestAnimation frame
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, wave]);

  // Sync HUD statistics inside standard React cycle occasionally to ensure 60fps
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const interval = setInterval(() => {
      syncHudPlayer();
    }, 150);

    return () => clearInterval(interval);
  }, [gameState, syncHudPlayer]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 font-sans text-white flex flex-col select-none">
      {/* 1. Main Canvas Stage container */}
      <div id="game-stage" ref={containerRef} className="relative flex-1 w-full h-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full cursor-crosshair touch-none"
        />

        {/* Fast radial vignette (replaces heavy GPU blur-2xl layer) */}
        <div className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(2,6,23,0.68)_100%)]" />

        {/* 2. Visual overlays (Start Menu, HUD bar, Paused screen, Game Over) */}
        <GameHUD
          gameState={gameState}
          player={hudPlayer}
          wave={wave}
          zombiesRemaining={zombiesRemaining}
          highScore={highScore}
          highScoreZombie={highScoreZombie}
          highScoreAlien={highScoreAlien}
          gameMode={currentMode}
          activeBoss={activeBoss}
          onStart={handleStartGame}
          onOpenModeSelect={() => setShowModeModal(true)}
          onChangeMode={handleSelectMode}
          onPauseToggle={handlePauseToggle}
          onRestart={handleRestart}
          onGoToMenu={handleGoToMenu}
          onSelectWeapon={handleSelectWeapon}
          soundEnabled={soundActive}
          onToggleSound={handleToggleSound}
          coins={coins}
          onOpenStore={handleOpenStore}
          onResetAll={handleResetAll}
          prestigeLevel={prestigeLevel}
          tokens={tokens}
          onOpenPrestige={handleOpenPrestige}
          onOpenMastery={handleOpenMastery}
          masterySkillHud={masterySkillHud}
          onTriggerMasterySkill={triggerShipMasterySkill}
          destructorWarp={destructorWarpHud}
          ironManMode={ironManModeHud}
          onToggleIronManMode={toggleIronManMode}
          iceFireDragonHud={iceFireDragonHud}
          onSwitchIceFireDragon={switchIceFireDragon}
          onTriggerIceFireMerge={triggerIceFireMerge}
        />

        {/* Mode Selector Modal */}
        {showModeModal && (
          <ModeSelectModal
            currentMode={currentMode}
            highScoreZombie={highScoreZombie}
            highScoreAlien={highScoreAlien}
            onSelectModeAndPlay={handleSelectModeAndPlay}
            onClose={() => setShowModeModal(false)}
          />
        )}

        {/* Store Overlay */}
        {gameState === GameState.STORE && (
          <StoreScreen
            coins={coins}
            unlockedWeapons={unlockedWeapons}
            equippedWeapon={equippedWeapon}
            onBuyWeapon={handleBuyWeapon}
            onEquipWeapon={handleEquipWeapon}
            onBuyShieldUpgrade={handleBuyShieldUpgrade}
            onBuyHealthUpgrade={handleBuyHealthUpgrade}
            onBuySpeedUpgrade={handleBuySpeedUpgrade}
            onBuyDamageUpgrade={handleBuyDamageUpgrade}
            onBuyLuckUpgrade={handleBuyLuckUpgrade}
            maxShieldLevel={maxShieldLevel}
            maxHealthLevel={maxHealthLevel}
            speedLevel={speedLevel}
            damageLevel={damageLevel}
            luckLevel={luckLevel}
            onAddTestCoins={handleAddTestCoins}
            onClose={handleCloseStore}
          />
        )}

        {/* Prestige & Token Shop Overlay */}
        {gameState === GameState.PRESTIGE && (
          <PrestigeScreen
            coins={coins}
            prestigeLevel={prestigeLevel}
            tokens={tokens}
            tokenUpgrades={tokenUpgrades}
            onAscendPrestige={handleAscendPrestige}
            onBuyTokenUpgrade={handleBuyTokenUpgrade}
            onRespecTokens={handleRespecTokens}
            onClose={handleCloseStore}
          />
        )}

        {/* Ship Mastery Skill Tree Overlay */}
        {gameState === GameState.MASTERY && (
          <MasteryScreen
            coins={coins}
            unlockedWeapons={unlockedWeapons}
            shipMastery={shipMastery}
            onUnlockNode={handleUnlockMasteryNode}
            onResetTree={handleResetMasteryTree}
            onTrainShip={handleTrainShipMastery}
            onClose={handleCloseStore}
          />
        )}

        {/* 3. Survivor level up upgrades panel overlay */}
        {gameState === GameState.LEVEL_UP && (
          <UpgradeScreen
            options={levelUpOptions}
            onSelect={handleSelectUpgrade}
            level={hudPlayer.level}
            onReroll={handleRerollUpgrades}
            rerollsLeft={rerollsLeft}
          />
        )}

        {/* 4. DUAL DYNAMIC VIRTUAL JOYSTICKS & TACTICAL WARP BUTTON (Mobile / Touch) */}
        {gameState === GameState.PLAYING && (
          <MobileControls
            onLeftJoystick={handleLeftJoystick}
            onRightJoystick={handleRightJoystick}
            isShip={
              hudPlayer.currentWeapon === WeaponType.DESTRUCTOR ||
              hudPlayer.currentWeapon === WeaponType.INTERCEPTOR ||
              hudPlayer.currentWeapon === WeaponType.NAVE_REI
            }
            shipType={
              hudPlayer.currentWeapon === WeaponType.NAVE_REI
                ? 'NAVE_REI'
                : hudPlayer.currentWeapon === WeaponType.INTERCEPTOR
                ? 'INTERCEPTOR'
                : hudPlayer.currentWeapon === WeaponType.DESTRUCTOR
                ? 'DESTRUCTOR'
                : null
            }
            warpChargeProgress={destructorWarpHud.chargeProgress}
            warpActive={destructorWarpHud.active}
            warpRemainingRatio={destructorWarpHud.remainingRatio}
            warpRemainingSeconds={destructorWarpHud.remainingSeconds}
            warpChargeDuration={destructorWarpHud.chargeDuration}
            onWarpStart={handleWarpStart}
            onWarpEnd={handleWarpEnd}
            hasMasterySkill={masterySkillHud.available}
            masteryCooldown={masterySkillHud.cooldown}
            masteryMaxCooldown={masterySkillHud.maxCooldown}
            masterySkillName={masterySkillHud.name}
            onTriggerMasterySkill={triggerShipMasterySkill}
            isIronMan={hudPlayer.currentWeapon === WeaponType.IRON_MAN}
            ironManMode={ironManModeHud}
            onToggleIronManMode={toggleIronManMode}
            isIceFireDragon={hudPlayer.currentWeapon === WeaponType.ICE_AND_FIRE_DRAGON}
            iceFireActiveDragon={iceFireDragonHud.activeDragon}
            iceFireMerged={iceFireDragonHud.merged}
            iceFireCooldown={iceFireDragonHud.cooldown}
            iceFireMergeRemaining={iceFireDragonHud.mergeTimer}
            onSwitchIceFireDragon={switchIceFireDragon}
            onTriggerIceFireMerge={triggerIceFireMerge}
          />
        )}
      </div>
    </div>
  );

}
