/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActiveBossInfo,
  BloodSplat,
  Bullet,
  DropType,
  DyingState,
  GameState,
  GraphicsQuality,
  ItemDrop,
  JoystickInput,
  Particle,
  Player,
  TokenUpgradeId,
  UpgradeOption,
  VoidDroneState,
  WeaponStats,
  WeaponType,
  Zombie,
  ZombieType,
} from './types';
import { GameHUD } from './components/GameHUD';
import { UpgradeScreen } from './components/UpgradeScreen';
import { StoreScreen } from './components/StoreScreen';
import { PrestigeScreen } from './components/PrestigeScreen';
import { MobileControls } from './components/MobileControls';
import { OfflineIndicator } from './components/PWAInstallBanner';
import { sound, toggleSound, isSoundEnabled } from './sound';
import { rollLevelUpOptions } from './components/UpgradeSystem';
import { getOperatorSkinById } from './components/OperatorSkins';
import {
  DEFAULT_TOKEN_UPGRADES,
  getPrestigeBonuses,
  getPrestigeCost,
  MAX_PRESTIGE,
} from './components/PrestigeSystem';
import {
  DAY_NIGHT_CYCLE_SECONDS,
  DayPhaseId,
  GroundFootprint,
  SceneFlashLight,
  SpentCasing,
  getDayNightState,
  renderGamepadAimReticle,
} from './components/EnvironmentLighting';
import {
  FOREST_SIZE,
  checkForestBulletHit,
  resolveForestEntityCollision,
} from './components/ForestWorld';
import {
  getEnterableHouses,
  isPointInsideHouse,
  steerZombieAroundBuildings,
} from './components/BuildingsWorld';
import {
  ISLAND_CENTER,
  getCoastlineRadius,
  getIslandPier,
  getOceanCurrentDrift,
  getTerrainSurfaceKind,
  getWaterDepth,
  getWaterSpeedMultiplier,
  isPointOnPier,
} from './components/IslandTerrain';
import { ForestDiorama3DRenderer } from './components/ForestWorld3D';
import {
  createGamepadEdgeState,
  readActiveGamepadState,
  useGamepadConnection,
  useGamepadMenuNavigation,
} from './gamepad';

const ARENA_SIZE = FOREST_SIZE;

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

const WEAPON_HOTBAR_ORDER: WeaponType[] = [
  WeaponType.GLOCK_19,
  WeaponType.BENELLI_M4,
  WeaponType.SCAR_L,
];

const INITIAL_WEAPONS: Record<WeaponType, WeaponStats> = {
  [WeaponType.GLOCK_19]: {
    type: WeaponType.GLOCK_19,
    name: 'Glock 19 Gen5 MOS',
    damage: 15,
    fireRate: 5.8,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 840,
    spread: 0.022,
    piercing: 1,
    color: '#fbbf24',
    unlocked: true,
  },
  [WeaponType.BENELLI_M4]: {
    type: WeaponType.BENELLI_M4,
    name: 'Benelli M4 Super 90',
    damage: 10,
    fireRate: 2.35,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 700,
    spread: 0.16,
    piercing: 1,
    color: '#f87171',
    unlocked: false,
  },
  [WeaponType.SCAR_L]: {
    type: WeaponType.SCAR_L,
    name: 'FN SCAR-L CQC',
    damage: 22,
    fireRate: 9.8,
    ammoCapacity: Infinity,
    currentAmmo: Infinity,
    bulletSpeed: 980,
    spread: 0.03,
    piercing: 2,
    color: '#38bdf8',
    unlocked: false,
  },
};

function sanitizeWeapons(list: unknown): WeaponType[] {
  const valid = new Set<WeaponType>();
  valid.add(WeaponType.GLOCK_19);
  if (Array.isArray(list)) {
    for (const item of list) {
      if (typeof item === 'string' && INITIAL_WEAPONS[item as WeaponType]) {
        valid.add(item as WeaponType);
      }
    }
  }
  return WEAPON_HOTBAR_ORDER.filter((wt) => valid.has(wt));
}



function renderVisionConeOverlay(
  ctx: CanvasRenderingContext2D,
  screenPx: number,
  screenPy: number,
  aimAngle: number,
  width: number,
  height: number
) {
  const coneRadius = Math.max(width, height) * 0.95;
  const halfAngle = 0.68;

  ctx.save();
  // Darken outside of tactical flashlight cone using evenodd clip fill
  ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.moveTo(screenPx, screenPy);
  ctx.arc(screenPx, screenPy, coneRadius, aimAngle - halfAngle, aimAngle + halfAngle);
  ctx.closePath();
  ctx.fill('evenodd');

  // Subtle close peripheral awareness halo
  const nearGrad = ctx.createRadialGradient(screenPx, screenPy, 20, screenPx, screenPy, 110);
  nearGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
  nearGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = nearGrad;
  ctx.beginPath();
  ctx.arc(screenPx, screenPy, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function App() {
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const threeRendererRef = useRef<ForestDiorama3DRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const gameStateRef = useRef<GameState>(GameState.MENU);
  const previousScreenRef = useRef<GameState>(GameState.MENU);

  // Vision cone optional tactical setting (toggleable in Pause Menu)
  const [visionConeEnabled, setVisionConeEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zombie_shooter_vision_cone') === 'true';
    } catch {
      return false;
    }
  });
  const visionConeEnabledRef = useRef(visionConeEnabled);
  useEffect(() => {
    visionConeEnabledRef.current = visionConeEnabled;
    try {
      localStorage.setItem('zombie_shooter_vision_cone', visionConeEnabled ? 'true' : 'false');
    } catch {}
  }, [visionConeEnabled]);

  const handleToggleVisionCone = useCallback(() => {
    setVisionConeEnabled((prev) => !prev);
  }, []);

  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>(() => {
    try {
      const saved = localStorage.getItem('zombie_shooter_graphics_quality') as GraphicsQuality | null;
      if (saved === 'ULTRA_LOW' || saved === 'LOW' || saved === 'MEDIUM' || saved === 'HIGH') {
        return saved;
      }
    } catch {}
    return 'MEDIUM';
  });
  const graphicsQualityRef = useRef<GraphicsQuality>(graphicsQuality);
  const staticFrameRenderedRef = useRef<boolean>(false);

  const handleChangeGraphicsQuality = useCallback((quality: GraphicsQuality) => {
    graphicsQualityRef.current = quality;
    setGraphicsQuality(quality);
    try {
      localStorage.setItem('zombie_shooter_graphics_quality', quality);
    } catch {}
    threeRendererRef.current?.setGraphicsPreset(quality);
    staticFrameRenderedRef.current = false;
  }, []);

  const [highScoreZombie, setHighScoreZombie] = useState<number>(() => {
    const zVal = parseInt(localStorage.getItem('zombie_shooter_highscore_zombie') || '0', 10) || 0;
    const legacy = parseInt(localStorage.getItem('zombie_shooter_highscore') || '0', 10) || 0;
    return Math.max(zVal, legacy);
  });

  const [unlockedWeapons, setUnlockedWeapons] = useState<WeaponType[]>(() => {
    try {
      const saved = localStorage.getItem('zombie_shooter_unlocked_weapons');
      if (saved) {
        return sanitizeWeapons(JSON.parse(saved));
      }
    } catch {}
    return [WeaponType.GLOCK_19];
  });

  const [equippedWeapon, setEquippedWeapon] = useState<WeaponType>(() => {
    const saved = localStorage.getItem('zombie_shooter_equipped_weapon') as WeaponType | null;
    if (saved && INITIAL_WEAPONS[saved]) return saved;
    return WeaponType.GLOCK_19;
  });

  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zombie_shooter_unlocked_skins');
      const parsed = saved ? (JSON.parse(saved) as string[]) : ['skin_default'];
      return parsed.includes('skin_default') ? parsed : ['skin_default', ...parsed];
    } catch {
      return ['skin_default'];
    }
  });

  const [equippedSkin, setEquippedSkin] = useState<string>(() => {
    return localStorage.getItem('zombie_shooter_equipped_skin') || 'skin_default';
  });

  const [coins, setCoins] = useState<number>(() => {
    return parseInt(localStorage.getItem('zombie_shooter_coins') || '0', 10) || 0;
  });

  const [maxShieldLevel, setMaxShieldLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('zombie_shooter_shield_level') || '0', 10) || 0;
  });

  const [maxHealthLevel, setMaxHealthLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('zombie_shooter_health_level') || '0', 10) || 0;
  });

  const [speedLevel, setSpeedLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('zombie_shooter_speed_level') || '0', 10) || 0;
  });

  const [damageLevel, setDamageLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('zombie_shooter_damage_level') || '0', 10) || 0;
  });

  const [luckLevel, setLuckLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('zombie_shooter_luck_level') || '0', 10) || 0;
  });

  const [prestigeLevel, setPrestigeLevel] = useState<number>(() => {
    const saved = parseInt(localStorage.getItem('zombie_shooter_prestige') || '0', 10) || 0;
    return Math.max(0, Math.min(MAX_PRESTIGE, saved));
  });

  const [tokens, setTokens] = useState<number>(() => {
    return Math.max(0, parseInt(localStorage.getItem('zombie_shooter_tokens') || '0', 10) || 0);
  });

  const [tokenUpgrades, setTokenUpgrades] = useState<Record<TokenUpgradeId, number>>(() => {
    try {
      const saved = localStorage.getItem('zombie_shooter_token_upgrades');
      if (saved) return { ...DEFAULT_TOKEN_UPGRADES, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_TOKEN_UPGRADES };
  });

  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());
  const [wave, setWave] = useState(1);
  const [zombiesRemaining, setZombiesRemaining] = useState(0);
  const [activeBoss, setActiveBoss] = useState<ActiveBossInfo | null>(null);
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
  const [dayNightHud, setDayNightHud] = useState<{
    phase: DayPhaseId;
    phaseLabel: string;
    clockText: string;
  }>(() => {
    const init = getDayNightState(24);
    return { phase: init.phase, phaseLabel: init.phaseLabel, clockText: init.clockText };
  });

  const { connected: gamepadConnected } = useGamepadConnection();
  const gamepadStateRef = useRef<ReturnType<typeof readActiveGamepadState>>({
    connected: false,
    id: '',
    detectedProfile: 'STANDARD',
    moveX: 0,
    moveY: 0,
    aimX: 0,
    aimY: 0,
    aimActive: false,
    aimFire: false,
    fireHeld: false,
    warpHeld: false,
    switchPressed: false,
    skillPressed: false,
    venomSkill1Pressed: false,
    venomSkill2Pressed: false,
    venomSkill3Pressed: false,
    reloadPressed: false,
    pausePressed: false,
  });
  const gamepadEdgeRef = useRef(createGamepadEdgeState());

  // Persistent state mirrors in refs for tight 60fps loop
  const coinsRef = useRef(coins);
  const unlockedWeaponsRef = useRef(unlockedWeapons);
  const equippedWeaponRef = useRef(equippedWeapon);
  const unlockedSkinsRef = useRef(unlockedSkins);
  const equippedSkinRef = useRef(equippedSkin);
  const shieldLevelRef = useRef(maxShieldLevel);
  const healthLevelRef = useRef(maxHealthLevel);
  const speedLevelRef = useRef(speedLevel);
  const damageLevelRef = useRef(damageLevel);
  const luckLevelRef = useRef(luckLevel);
  const prestigeLevelRef = useRef(prestigeLevel);
  const tokenUpgradesRef = useRef(tokenUpgrades);
  const highScoreZombieRef = useRef(highScoreZombie);

  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { unlockedWeaponsRef.current = unlockedWeapons; }, [unlockedWeapons]);
  useEffect(() => { equippedWeaponRef.current = equippedWeapon; }, [equippedWeapon]);
  useEffect(() => { unlockedSkinsRef.current = unlockedSkins; }, [unlockedSkins]);
  useEffect(() => { equippedSkinRef.current = equippedSkin; }, [equippedSkin]);
  useEffect(() => { shieldLevelRef.current = maxShieldLevel; }, [maxShieldLevel]);
  useEffect(() => { healthLevelRef.current = maxHealthLevel; }, [maxHealthLevel]);
  useEffect(() => { speedLevelRef.current = speedLevel; }, [speedLevel]);
  useEffect(() => { damageLevelRef.current = damageLevel; }, [damageLevel]);
  useEffect(() => { luckLevelRef.current = luckLevel; }, [luckLevel]);
  useEffect(() => { prestigeLevelRef.current = prestigeLevel; }, [prestigeLevel]);
  useEffect(() => { tokenUpgradesRef.current = tokenUpgrades; }, [tokenUpgrades]);
  useEffect(() => { highScoreZombieRef.current = highScoreZombie; }, [highScoreZombie]);

  // Mutable simulation refs
  const createInitialPlayer = useCallback((): Player => {
    const skin = getOperatorSkinById(equippedSkinRef.current);
    const vitalityLvl = tokenUpgradesRef.current.token_vitality || 0;
    const mightLvl = tokenUpgradesRef.current.token_might || 0;
    const hasteLvl = tokenUpgradesRef.current.token_haste || 0;
    const critXpLvl = tokenUpgradesRef.current.token_crit_xp || 0;
    const wealthLvl = tokenUpgradesRef.current.token_wealth || 0;
    const prestigeBonuses = getPrestigeBonuses(prestigeLevelRef.current);

    let bonusHp = healthLevelRef.current * 15 + vitalityLvl * 40;
    let bonusShield = shieldLevelRef.current * 20 + vitalityLvl * 25;
    let speedMult = (1 + speedLevelRef.current * 0.08) * (1 + hasteLvl * 0.06);
    let damageMult =
      (1 + damageLevelRef.current * 0.1) *
      (1 + mightLvl * 0.18) *
      prestigeBonuses.damageMult;
    let fireRateMult = 1 + hasteLvl * 0.07;

    if (skin.id === 'skin_ghost_recon') speedMult *= 1.06;
    if (skin.id === 'skin_hazard_juggernaut') bonusHp += 30;
    if (skin.id === 'skin_cryo_warden') bonusShield += 35;
    if (skin.id === 'skin_volt_cyber') fireRateMult *= 1.1;
    if (skin.id === 'skin_solar_valkyrie') {
      damageMult *= 1.12;
      bonusHp += 25;
      bonusShield += 25;
    }

    const totalHp = 100 + bonusHp;
    const clonedWeapons: Record<WeaponType, WeaponStats> = {
      [WeaponType.GLOCK_19]: {
        ...INITIAL_WEAPONS[WeaponType.GLOCK_19],
        damage: Math.round(INITIAL_WEAPONS[WeaponType.GLOCK_19].damage * damageMult),
        fireRate: Number((INITIAL_WEAPONS[WeaponType.GLOCK_19].fireRate * fireRateMult).toFixed(2)),
        unlocked: unlockedWeaponsRef.current.includes(WeaponType.GLOCK_19),
      },
      [WeaponType.BENELLI_M4]: {
        ...INITIAL_WEAPONS[WeaponType.BENELLI_M4],
        damage: Math.round(INITIAL_WEAPONS[WeaponType.BENELLI_M4].damage * damageMult),
        fireRate: Number((INITIAL_WEAPONS[WeaponType.BENELLI_M4].fireRate * fireRateMult).toFixed(2)),
        unlocked: unlockedWeaponsRef.current.includes(WeaponType.BENELLI_M4),
      },
      [WeaponType.SCAR_L]: {
        ...INITIAL_WEAPONS[WeaponType.SCAR_L],
        damage: Math.round(INITIAL_WEAPONS[WeaponType.SCAR_L].damage * damageMult),
        fireRate: Number((INITIAL_WEAPONS[WeaponType.SCAR_L].fireRate * fireRateMult).toFixed(2)),
        unlocked: unlockedWeaponsRef.current.includes(WeaponType.SCAR_L),
      },
    };

    const startWeapon = unlockedWeaponsRef.current.includes(equippedWeaponRef.current)
      ? equippedWeaponRef.current
      : WeaponType.GLOCK_19;

    return {
      x: ARENA_SIZE / 2,
      y: ARENA_SIZE / 2,
      radius: 17,
      angle: 0,
      speed: Math.round(235 * speedMult),
      hp: totalHp,
      maxHp: totalHp,
      xp: 0,
      xpNeeded: 100,
      level: 1,
      score: 0,
      kills: 0,
      currentWeapon: startWeapon,
      weapons: clonedWeapons,
      shield: bonusShield,
      maxShield: bonusShield,
      lastShotTime: 0,
      vx: 0,
      vy: 0,
      unlockedWeapons: [...unlockedWeaponsRef.current],
      equippedSkin: equippedSkinRef.current,
      unlockedSkins: [...unlockedSkinsRef.current],
      coinsEarned: 0,
      vampirism: 0,
      bonusCoinsMult: prestigeBonuses.coinsMult * (1 + wealthLvl * 0.35),
      critChance: critXpLvl * 0.05,
      critMultiplier: 2.0,
      regenHpRate: 0,
      rerollsAvailable: 2,
      mythicSingularity: 0,
      chainLightningLevel: 0,
      gravityPulseLevel: 0,
      mythicSolarAura: 0,
      mythicSplitShot: 0,
      dodgeChance: 0,
      mythicVoidDrones: 0,
      shatterLevel: 0,
      shieldShockLevel: 0,
      knockbackMult: 1,
      acquiredUpgrades: {},
    };
  }, []);

  const playerRef = useRef<Player>(createInitialPlayer());
  const [hudPlayer, setHudPlayer] = useState<Player>(() => playerRef.current);

  const zombiesRef = useRef<Zombie[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const splatsRef = useRef<BloodSplat[]>([]);
  const dropsRef = useRef<ItemDrop[]>([]);
  const flashLightsRef = useRef<SceneFlashLight[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const footprintsRef = useRef<GroundFootprint[]>([]);
  const wetBloodStepsRef = useRef<number>(0);
  const spentCasingsRef = useRef<SpentCasing[]>([]);
  const voidDronesRef = useRef<VoidDroneState[]>([]);
  const zombieHitFlashRef = useRef<Map<string, number>>(new Map());
  const wasPlayerInWaterRef = useRef<boolean>(false);
  const wasOnPierRef = useRef<boolean>(false);
  const splashCooldownRef = useRef<number>(0);
  const swimWakeTimerRef = useRef<number>(0);

  const waveRef = useRef<number>(1);
  const zombiesToSpawnRef = useRef<number>(8);
  const spawnTimerRef = useRef<number>(0);
  const waveTransitionTimerRef = useRef<number>(0);
  const dayCycleTimeRef = useRef<number>(24); // Start in bright morning sunlight; 180s full cycle

  // Camera & realistic kinematics state
  const cameraRef = useRef({
    x: ARENA_SIZE / 2 - (typeof window !== 'undefined' ? window.innerWidth / 2 : 500),
    y: ARENA_SIZE / 2 - (typeof window !== 'undefined' ? window.innerHeight / 2 : 400),
    shake: 0,
    trauma: 0,
    zoom: 1,
    zoomVel: 0,
    zoomImpulse: 0,
    roll: 0,
    rollVel: 0,
    springX: 0,
    springY: 0,
    springVx: 0,
    springVy: 0,
    stepVx: 0,
    stepVy: 0,
    recoilVx: 0,
    recoilVy: 0,
    walkPhase: 0,
    prevStepSign: 1,
    stepCadenceSoundTimer: 0,
    swayTime: 0,
  });

  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const leftJoystickRef = useRef<JoystickInput>({ x: 0, y: 0, active: false });
  const rightJoystickRef = useRef<JoystickInput>({ x: 0, y: 0, active: false });

  // Timers & combat state
  const muzzleFlashRef = useRef(0);
  const weaponRecoilRef = useRef(0);
  const weaponBloomRef = useRef(0);
  const playerDamageFlashRef = useRef(0);
  const lastDamageTimeRef = useRef(0);
  const shieldRechargeTimerRef = useRef(0);
  const heartbeatTimerRef = useRef(0);
  const skinEffectTimerRef = useRef(0);
  const skinOrbitalTimerRef = useRef(0);
  const gravityPulseTimerRef = useRef(0);
  const mythicShotCountRef = useRef(0);
  const mythicOrbitAngleRef = useRef(0);
  const mythicSolarDamageTimerRef = useRef(0);
  const hudSyncTimerRef = useRef(0);

  const dyingStateRef = useRef<DyingState>({
    active: false,
    timer: 0,
    total: 2.25,
    fatalAngle: 0,
    startX: 0,
    startY: 0,
    recoilX: 0,
    recoilY: 0,
    flatlinePlayed: false,
    bodyFallPlayed: false,
    bloodPoolRadius: 0,
    droppedWeapon: {
      type: WeaponType.GLOCK_19,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      rotSpeed: 0,
    },
  });

  const updateCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      const next = Math.max(0, prev + Math.round(amount));
      localStorage.setItem('zombie_shooter_coins', next.toString());
      return next;
    });
  }, []);

  const syncHud = useCallback(() => {
    const p = playerRef.current;
    setHudPlayer({ ...p, weapons: { ...p.weapons } });
    const boss = zombiesRef.current.find((z) => z.isBoss && z.hp > 0);
    if (boss) {
      setActiveBoss({
        id: boss.id,
        name: boss.bossName || 'Chefe Mutante',
        title: boss.bossTitle || 'Ameaça Alfa',
        hp: Math.max(0, Math.ceil(boss.hp)),
        maxHp: boss.maxHp,
        type: boss.type,
        color: boss.color,
      });
    } else {
      setActiveBoss(null);
    }
    setZombiesRemaining(zombiesRef.current.length + zombiesToSpawnRef.current);
    const dn = getDayNightState(dayCycleTimeRef.current);
    setDayNightHud((prev) =>
      prev.clockText === dn.clockText && prev.phase === dn.phase
        ? prev
        : { phase: dn.phase, phaseLabel: dn.phaseLabel, clockText: dn.clockText }
    );
  }, []);

  const switchWeapon = useCallback(
    (targetWeapon: WeaponType) => {
      const p = playerRef.current;
      if (!unlockedWeaponsRef.current.includes(targetWeapon)) return;
      if (p.currentWeapon === targetWeapon && equippedWeaponRef.current === targetWeapon) return;
      p.currentWeapon = targetWeapon;
      setEquippedWeapon(targetWeapon);
      localStorage.setItem('zombie_shooter_equipped_weapon', targetWeapon);
      weaponBloomRef.current = 0;
      weaponRecoilRef.current = 0;
      sound.playReload();
      syncHud();
    },
    [syncHud]
  );

  const setAppState = useCallback((next: GameState) => {
    gameStateRef.current = next;
    staticFrameRenderedRef.current = false;
    setGameState(next);
  }, []);

  // ==========================================
  // GAME LIFECYCLE CONTROLS
  // ==========================================
  const startGame = useCallback(() => {
    const freshPlayer = createInitialPlayer();
    playerRef.current = freshPlayer;

    zombiesRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    splatsRef.current = [];
    dropsRef.current = [];
    flashLightsRef.current = [];
    floatingTextsRef.current = [];
    footprintsRef.current = [];
    wetBloodStepsRef.current = 0;
    spentCasingsRef.current = [];
    voidDronesRef.current = [];
    zombieHitFlashRef.current.clear();
    wasPlayerInWaterRef.current = false;
    wasOnPierRef.current = false;
    splashCooldownRef.current = 0;
    swimWakeTimerRef.current = 0;

    waveRef.current = 1;
    setWave(1);
    zombiesToSpawnRef.current = 8;
    spawnTimerRef.current = 0.25;
    waveTransitionTimerRef.current = 0;
    dayCycleTimeRef.current = 24;

    muzzleFlashRef.current = 0;
    weaponRecoilRef.current = 0;
    weaponBloomRef.current = 0;
    playerDamageFlashRef.current = 0;
    mythicShotCountRef.current = 0;
    dyingStateRef.current.active = false;

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : window.innerWidth;
    const h = canvas ? canvas.height : window.innerHeight;
    cameraRef.current = {
      x: freshPlayer.x - w / 2,
      y: freshPlayer.y - h / 2,
      shake: 0,
      trauma: 0,
      zoom: 1,
      zoomVel: 0,
      zoomImpulse: 0,
      roll: 0,
      rollVel: 0,
      springX: 0,
      springY: 0,
      springVx: 0,
      springVy: 0,
      stepVx: 0,
      stepVy: 0,
      recoilVx: 0,
      recoilVy: 0,
      walkPhase: 0,
      prevStepSign: 1,
      stepCadenceSoundTimer: 0,
      swayTime: 0,
    };

    syncHud();
    setAppState(GameState.PLAYING);
  }, [createInitialPlayer, setAppState, syncHud]);

  const handlePauseToggle = useCallback(() => {
    if (gameStateRef.current === GameState.PLAYING && !dyingStateRef.current.active) {
      setAppState(GameState.PAUSED);
    } else if (gameStateRef.current === GameState.PAUSED) {
      setAppState(GameState.PLAYING);
    }
  }, [setAppState]);

  const handleGoToMenu = useCallback(() => {
    dyingStateRef.current.active = false;
    setAppState(GameState.MENU);
  }, [setAppState]);

  const handleOpenStore = useCallback(() => {
    if (gameStateRef.current !== GameState.STORE) {
      previousScreenRef.current =
        gameStateRef.current === GameState.GAME_OVER ? GameState.GAME_OVER : GameState.MENU;
      setAppState(GameState.STORE);
    }
  }, [setAppState]);

  const handleCloseStore = useCallback(() => {
    setAppState(
      previousScreenRef.current === GameState.GAME_OVER ? GameState.GAME_OVER : GameState.MENU
    );
  }, [setAppState]);

  const handleOpenPrestige = useCallback(() => {
    previousScreenRef.current = GameState.MENU;
    setAppState(GameState.PRESTIGE);
  }, [setAppState]);

  const handleClosePrestige = useCallback(() => {
    setAppState(GameState.MENU);
  }, [setAppState]);

  const handleToggleSound = useCallback(() => {
    const enabled = toggleSound();
    setSoundEnabled(enabled);
  }, []);

  // Store & Prestige callbacks
  const handleBuyWeapon = useCallback((wt: WeaponType, price: number): boolean => {
    if (coinsRef.current < price) return false;
    setCoins((prev) => {
      const next = Math.max(0, prev - price);
      localStorage.setItem('zombie_shooter_coins', next.toString());
      return next;
    });
    setUnlockedWeapons((prev) => {
      const next = sanitizeWeapons([...prev, wt]);
      localStorage.setItem('zombie_shooter_unlocked_weapons', JSON.stringify(next));
      return next;
    });
    setEquippedWeapon(wt);
    localStorage.setItem('zombie_shooter_equipped_weapon', wt);
    playerRef.current.currentWeapon = wt;
    if (playerRef.current.weapons[wt]) {
      playerRef.current.weapons[wt].unlocked = true;
    }
    return true;
  }, []);

  const handleEquipWeapon = useCallback((wt: WeaponType) => {
    if (!unlockedWeaponsRef.current.includes(wt)) return;
    setEquippedWeapon(wt);
    localStorage.setItem('zombie_shooter_equipped_weapon', wt);
    playerRef.current.currentWeapon = wt;
    syncHud();
  }, [syncHud]);

  const handleBuySkin = useCallback((skinId: string, price: number): boolean => {
    if (coinsRef.current < price) return false;
    setCoins((prev) => {
      const next = Math.max(0, prev - price);
      localStorage.setItem('zombie_shooter_coins', next.toString());
      return next;
    });
    setUnlockedSkins((prev) => {
      const next = prev.includes(skinId) ? prev : [...prev, skinId];
      localStorage.setItem('zombie_shooter_unlocked_skins', JSON.stringify(next));
      return next;
    });
    setEquippedSkin(skinId);
    localStorage.setItem('zombie_shooter_equipped_skin', skinId);
    playerRef.current.equippedSkin = skinId;
    return true;
  }, []);

  const handleEquipSkin = useCallback((skinId: string) => {
    setEquippedSkin(skinId);
    localStorage.setItem('zombie_shooter_equipped_skin', skinId);
    playerRef.current.equippedSkin = skinId;
  }, []);

  const handleBuyShieldUpgrade = useCallback(() => {
    const cost = (shieldLevelRef.current + 1) * 250;
    if (coinsRef.current < cost) return;
    updateCoins(-cost);
    setMaxShieldLevel((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_shield_level', next.toString());
      return next;
    });
  }, [updateCoins]);

  const handleBuyHealthUpgrade = useCallback(() => {
    const cost = (healthLevelRef.current + 1) * 200;
    if (coinsRef.current < cost) return;
    updateCoins(-cost);
    setMaxHealthLevel((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_health_level', next.toString());
      return next;
    });
  }, [updateCoins]);

  const handleBuySpeedUpgrade = useCallback(() => {
    if (speedLevelRef.current >= 5) return;
    const cost = (speedLevelRef.current + 1) * 250;
    if (coinsRef.current < cost) return;
    updateCoins(-cost);
    setSpeedLevel((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_speed_level', next.toString());
      return next;
    });
  }, [updateCoins]);

  const handleBuyDamageUpgrade = useCallback(() => {
    if (damageLevelRef.current >= 5) return;
    const cost = (damageLevelRef.current + 1) * 350;
    if (coinsRef.current < cost) return;
    updateCoins(-cost);
    setDamageLevel((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_damage_level', next.toString());
      return next;
    });
  }, [updateCoins]);

  const handleBuyLuckUpgrade = useCallback(() => {
    if (luckLevelRef.current >= 5) return;
    const cost = (luckLevelRef.current + 1) * 300;
    if (coinsRef.current < cost) return;
    updateCoins(-cost);
    setLuckLevel((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_luck_level', next.toString());
      return next;
    });
  }, [updateCoins]);

  const handleAscendPrestige = useCallback((): boolean => {
    if (prestigeLevel >= MAX_PRESTIGE) return false;
    const cost = getPrestigeCost(prestigeLevel);
    if (coinsRef.current < cost) return false;
    updateCoins(-cost);
    setPrestigeLevel((prev) => {
      const next = Math.min(MAX_PRESTIGE, prev + 1);
      localStorage.setItem('zombie_shooter_prestige', next.toString());
      return next;
    });
    setTokens((prev) => {
      const next = prev + 1;
      localStorage.setItem('zombie_shooter_tokens', next.toString());
      return next;
    });
    return true;
  }, [prestigeLevel, updateCoins]);

  const handleBuyTokenUpgrade = useCallback(
    (id: TokenUpgradeId): boolean => {
      if (tokens < 1) return false;
      const curLvl = tokenUpgrades[id] || 0;
      if (curLvl >= 5) return false;
      setTokens((prev) => {
        const next = Math.max(0, prev - 1);
        localStorage.setItem('zombie_shooter_tokens', next.toString());
        return next;
      });
      setTokenUpgrades((prev) => {
        const next = { ...prev, [id]: (prev[id] || 0) + 1 };
        localStorage.setItem('zombie_shooter_token_upgrades', JSON.stringify(next));
        return next;
      });
      return true;
    },
    [tokens, tokenUpgrades]
  );

  const handleRespecTokens = useCallback(() => {
    const spent = (Object.values(tokenUpgrades) as number[]).reduce(
      (acc, v) => acc + (Number(v) || 0),
      0
    );
    if (spent <= 0) return;
    setTokens((prev) => {
      const next = prev + spent;
      localStorage.setItem('zombie_shooter_tokens', next.toString());
      return next;
    });
    setTokenUpgrades({ ...DEFAULT_TOKEN_UPGRADES });
    localStorage.setItem('zombie_shooter_token_upgrades', JSON.stringify(DEFAULT_TOKEN_UPGRADES));
  }, [tokenUpgrades]);

  const handleResetAll = useCallback(() => {
    try {
      [
        'zombie_shooter_coins',
        'zombie_shooter_unlocked_weapons',
        'zombie_shooter_equipped_weapon',
        'zombie_shooter_unlocked_skins',
        'zombie_shooter_equipped_skin',
        'zombie_shooter_shield_level',
        'zombie_shooter_health_level',
        'zombie_shooter_speed_level',
        'zombie_shooter_damage_level',
        'zombie_shooter_luck_level',
        'zombie_shooter_prestige',
        'zombie_shooter_tokens',
        'zombie_shooter_token_upgrades',
        'zombie_shooter_highscore_zombie',
        'zombie_shooter_highscore',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {}
    setCoins(0);
    setUnlockedWeapons([WeaponType.GLOCK_19]);
    setEquippedWeapon(WeaponType.GLOCK_19);
    setUnlockedSkins(['skin_default']);
    setEquippedSkin('skin_default');
    setMaxShieldLevel(0);
    setMaxHealthLevel(0);
    setSpeedLevel(0);
    setDamageLevel(0);
    setLuckLevel(0);
    setPrestigeLevel(0);
    setTokens(0);
    setTokenUpgrades({ ...DEFAULT_TOKEN_UPGRADES });
    setHighScoreZombie(0);
    setAppState(GameState.MENU);
  }, [setAppState]);

  // Level-up upgrade callbacks
  const handleSelectUpgrade = useCallback(
    (option: UpgradeOption) => {
      const nextPlayer = option.effect({
        ...playerRef.current,
        weapons: { ...playerRef.current.weapons },
      });
      nextPlayer.level += 1;
      nextPlayer.xp = Math.max(0, nextPlayer.xp - nextPlayer.xpNeeded);
      nextPlayer.xpNeeded = Math.round(nextPlayer.xpNeeded * 1.28 + 45);
      playerRef.current = nextPlayer;

      // Sync void drones count immediately if Mythic Void Monarch picked
      const desiredDrones = (nextPlayer.mythicVoidDrones || 0) > 0 ? 3 : 0;
      while (voidDronesRef.current.length < desiredDrones) {
        voidDronesRef.current.push({
          x: nextPlayer.x,
          y: nextPlayer.y,
          angle: 0,
          fireTimer: 0.4 * voidDronesRef.current.length,
        });
      }

      if (nextPlayer.xp >= nextPlayer.xpNeeded) {
        setUpgradeOptions(
          rollLevelUpOptions(nextPlayer.level, updateCoins, luckLevelRef.current, nextPlayer.acquiredUpgrades)
        );
        syncHud();
        return;
      }

      syncHud();
      setAppState(GameState.PLAYING);
    },
    [setAppState, syncHud, updateCoins]
  );

  const handleRerollUpgrades = useCallback(() => {
    const p = playerRef.current;
    if ((p.rerollsAvailable || 0) <= 0) return;
    p.rerollsAvailable = (p.rerollsAvailable || 0) - 1;
    setUpgradeOptions(
      rollLevelUpOptions(p.level, updateCoins, luckLevelRef.current, p.acquiredUpgrades)
    );
    syncHud();
  }, [syncHud, updateCoins]);

  // Enable Gamepad menu navigation when not actively playing
  useGamepadMenuNavigation(
    gameState !== GameState.PLAYING,
    gameState === GameState.STORE
      ? handleCloseStore
      : gameState === GameState.PRESTIGE
        ? handleClosePrestige
        : gameState === GameState.PAUSED
          ? handlePauseToggle
          : undefined
  );

  // ==========================================
  // KEYBOARD, MOUSE & CANVAS RESIZE LISTENERS
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;

      if (k === 'escape' || k === 'p') {
        if (gameStateRef.current === GameState.PLAYING || gameStateRef.current === GameState.PAUSED) {
          handlePauseToggle();
        }
      }

      if (gameStateRef.current === GameState.PLAYING && !dyingStateRef.current.active) {
        if (k === '1') switchWeapon(WeaponType.GLOCK_19);
        else if (k === '2') switchWeapon(WeaponType.BENELLI_M4);
        else if (k === '3') switchWeapon(WeaponType.SCAR_L);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const handleBlur = () => {
      keysRef.current = {};
      mouseRef.current.isDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handlePauseToggle, switchWeapon]);

  useEffect(() => {
    const mount = threeMountRef.current;
    if (!mount) return;
    const diorama = new ForestDiorama3DRenderer(mount, graphicsQualityRef.current);
    threeRendererRef.current = diorama;
    return () => {
      diorama.dispose();
      threeRendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      threeRendererRef.current?.resize(window.innerWidth, window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouseRef.current.isDown = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouseRef.current.isDown = false;
    };
    const handleWheel = (e: WheelEvent) => {
      if (gameStateRef.current !== GameState.PLAYING || dyingStateRef.current.active) return;
      const list = unlockedWeaponsRef.current;
      if (list.length <= 1) return;
      const idx = list.indexOf(playerRef.current.currentWeapon);
      const dir = e.deltaY > 0 ? 1 : -1;
      const nextIdx = (idx + dir + list.length) % list.length;
      switchWeapon(list[nextIdx]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [switchWeapon]);

  // ==========================================
  // CORE SIMULATION & RENDER LOOP (60 FPS)
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();

    const addFloatingText = (x: number, y: number, text: string, color: string, scale = 1) => {
      if (floatingTextsRef.current.length > 60) {
        floatingTextsRef.current.shift();
      }
      floatingTextsRef.current.push({
        id: `${Date.now()}-${Math.random()}`,
        x,
        y,
        text,
        color,
        alpha: 1,
        vy: -38,
        scale,
      });
    };

    const spawnZombieForWave = (currentWave: number, forceBoss = false) => {
      const p = playerRef.current;
      let zx = ARENA_SIZE * 0.5;
      let zy = ARENA_SIZE * 0.5;
      for (let attempt = 0; attempt < 6; attempt++) {
        const spawnDist = 520 + Math.random() * 240;
        const spawnAngle = Math.random() * Math.PI * 2;
        zx = Math.max(40, Math.min(ARENA_SIZE - 40, p.x + Math.cos(spawnAngle) * spawnDist));
        zy = Math.max(40, Math.min(ARENA_SIZE - 40, p.y + Math.sin(spawnAngle) * spawnDist));
        if (!isPointInsideHouse(zx, zy, 34)) break;
      }
      const blockedHouse = isPointInsideHouse(zx, zy, 30);
      if (blockedHouse) {
        const door = blockedHouse.porchDoor;
        zx = door.x + (door.side === 'W' ? -48 : door.side === 'E' ? 48 : 0);
        zy = door.z + (door.side === 'N' ? -48 : door.side === 'S' ? 48 : 0);
      }

      const scaleMult = 1 + (currentWave - 1) * 0.22;
      const speedWaveBonus = Math.min(85, (currentWave - 1) * 4);

      if (forceBoss) {
        let bossType = ZombieType.BOSS;
        let bossName = 'TIRANO NECRÓTICO ALFA';
        let bossTitle = 'Abominação Mutante';
        let baseHp = 950;
        let radius = 36;
        let speed = 88;
        let damage = 28;
        let color = '#991b1b';

        if (currentWave % 15 === 0) {
          bossType = ZombieType.BOSS_NECROTITAN;
          bossName = 'NECRO-TITÃ SUPREMO';
          bossTitle = 'Senhor da Praga';
          baseHp = 2200;
          radius = 44;
          speed = 82;
          damage = 42;
          color = '#7e22ce';
        } else if (currentWave % 10 === 0) {
          bossType = ZombieType.BOSS_BUTCHER;
          bossName = 'AÇOUGUEIRO PESTILENTO';
          bossTitle = 'Carrasco da Quarentena';
          baseHp = 1550;
          radius = 40;
          speed = 102;
          damage = 34;
          color = '#b91c1c';
        }

        const totalBossHp = Math.round(baseHp * (1 + (currentWave - 5) * 0.14));
        const bossPos = resolveForestEntityCollision(zx, zy, radius);
        zombiesRef.current.push({
          id: `boss-${currentWave}-${Math.random()}`,
          type: bossType,
          x: bossPos.x,
          y: bossPos.y,
          radius,
          speed: speed + Math.min(35, currentWave * 1.5),
          hp: totalBossHp,
          maxHp: totalBossHp,
          damage,
          scoreValue: 500 + currentWave * 60,
          xpValue: 180 + currentWave * 20,
          color,
          angle: Math.atan2(p.y - bossPos.y, p.x - bossPos.x),
          lastAttackTime: 0,
          knockbackX: 0,
          knockbackY: 0,
          isStunned: false,
          stunTimer: 0,
          isBoss: true,
          bossName,
          bossTitle,
          specialAttackTimer: 2.8,
          lastShootTime: 0,
          aiSeed: Math.random() * 100,
        });
        return;
      }

      const roll = Math.random();
      let type = ZombieType.NORMAL;
      let radius = 16;
      let hp = Math.round(42 * scaleMult);
      let speed = 96 + speedWaveBonus * 0.65;
      let damage = 12 + Math.floor(currentWave * 1.1);
      let color = '#166534';
      let scoreValue = 28;
      let xpValue = 24;
      let shootsProjectiles = false;

      if (currentWave >= 2 && roll > 0.72 && roll <= 0.88) {
        type = ZombieType.RUNNER;
        radius = 13.5;
        hp = Math.round(28 * scaleMult);
        speed = 168 + speedWaveBonus;
        damage = 9 + Math.floor(currentWave * 0.9);
        color = '#dc2626';
        scoreValue = 36;
        xpValue = 28;
      } else if (currentWave >= 3 && roll > 0.88 && roll <= 0.96) {
        type = ZombieType.TANK;
        radius = 24;
        hp = Math.round(135 * scaleMult);
        speed = 68 + speedWaveBonus * 0.4;
        damage = 22 + Math.floor(currentWave * 1.6);
        color = '#3f6212';
        scoreValue = 75;
        xpValue = 52;
      } else if (currentWave >= 4 && roll > 0.96) {
        type = ZombieType.TOXIC_SPITTER;
        radius = 16.5;
        hp = Math.round(52 * scaleMult);
        speed = 86 + speedWaveBonus * 0.45;
        damage = 14 + Math.floor(currentWave * 1.1);
        color = '#84cc16';
        scoreValue = 58;
        xpValue = 42;
        shootsProjectiles = true;
      }

      const zPos = resolveForestEntityCollision(zx, zy, radius);
      zombiesRef.current.push({
        id: `z-${Date.now()}-${Math.random()}`,
        type,
        x: zPos.x,
        y: zPos.y,
        radius,
        speed,
        hp,
        maxHp: hp,
        damage,
        scoreValue,
        xpValue,
        color,
        angle: Math.atan2(p.y - zPos.y, p.x - zPos.x),
        lastAttackTime: 0,
        knockbackX: 0,
        knockbackY: 0,
        isStunned: false,
        stunTimer: 0,
        shootsProjectiles,
        lastShootTime: 0,
        aiSeed: Math.random() * 100,
      });
    };

    const startNextWave = () => {
      const nextWave = waveRef.current + 1;
      waveRef.current = nextWave;
      setWave(nextWave);

      const isBossWave = nextWave % 5 === 0;
      const count = 7 + nextWave * 4;
      zombiesToSpawnRef.current = count;
      spawnTimerRef.current = 0.3;

      if (isBossWave) {
        spawnZombieForWave(nextWave, true);
        sound.playBossAlarm();
        window.setTimeout(() => sound.playZombieRoar(), 350);
      } else {
        sound.playZombieHit();
      }
      syncHud();
    };

    const handleZombieDeath = (z: Zombie) => {
      if (z.isDead) return;
      z.isDead = true;
      zombieHitFlashRef.current.delete(z.id);

      const p = playerRef.current;
      const cam = cameraRef.current;
      p.kills += 1;

      const earnedCred = Math.round(z.scoreValue * (p.bonusCoinsMult || 1));
      p.score += earnedCred;
      p.coinsEarned = (p.coinsEarned || 0) + earnedCred;
      updateCoins(earnedCred);

      const critXpLvl = tokenUpgradesRef.current.token_crit_xp || 0;
      const xpGain = Math.round(z.xpValue * (1 + critXpLvl * 0.15));
      p.xp += xpGain;

      if ((p.vampirism || 0) > 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + (p.vampirism || 0));
      }

      if (z.isBoss) {
        sound.playPowerup();
        sound.playExplosion();
        cam.trauma = Math.min(1, cam.trauma + 0.55);
        cam.shake = Math.max(cam.shake, 12);
        flashLightsRef.current.push({
          x: z.x,
          y: z.y,
          radius: 260,
          color: 'red',
          alpha: 0.75,
          decay: 1.8,
        });
        particlesRef.current.push({
          id: `boss-exp-${Math.random()}`,
          x: z.x,
          y: z.y,
          vx: 0,
          vy: 0,
          radius: 75,
          color: '#f43f5e',
          alpha: 0.95,
          decay: 1.4,
          type: 'EXPLOSION',
        });
        if (getWaterDepth(z.x, z.y) > 0.5) {
          threeRendererRef.current?.triggerWaterRipple(z.x, z.y, 1.85);
          sound.playWaterSplash(true);
        }
      } else {
        sound.playZombieKill();
      }

      // Ground expanding liquid blood pool + 3D ballistic blood droplets
      const isAcidZombie = z.type === ZombieType.TOXIC_SPITTER;
      const bloodColor = isAcidZombie ? '#65a30d' : '#7f1d1d';
      const targetPoolR = z.radius * (z.isBoss ? 1.75 : 1.15 + Math.random() * 0.6);
      if (splatsRef.current.length > 260) {
        splatsRef.current.shift();
      }
      splatsRef.current.push({
        x: z.x,
        y: z.y,
        radius: Math.max(6, targetPoolR * 0.38),
        targetRadius: targetPoolR,
        alpha: 0.94,
        color: bloodColor,
        angle: Math.random() * Math.PI * 2,
        stretch: 1 + Math.random() * 0.35,
        isLiquid: true,
        variant: Math.floor(Math.random() * 3),
      });

      // Directional splash streaks around body
      const streakCount = z.isBoss ? 4 : 2;
      for (let s = 0; s < streakCount; s++) {
        const sa = Math.random() * Math.PI * 2;
        const dist = z.radius * (0.7 + Math.random() * 1.15);
        const sr = z.radius * (0.45 + Math.random() * 0.35);
        if (splatsRef.current.length > 260) splatsRef.current.shift();
        splatsRef.current.push({
          x: z.x + Math.cos(sa) * dist,
          y: z.y + Math.sin(sa) * dist,
          radius: sr * 0.45,
          targetRadius: sr,
          alpha: 0.88,
          color: bloodColor,
          angle: sa,
          stretch: 1.3 + Math.random() * 0.4,
          isLiquid: true,
          variant: (s + 1) % 3,
        });
      }

      const burstCount = z.isBoss ? 22 : 10;
      for (let i = 0; i < burstCount; i++) {
        const ba = Math.random() * Math.PI * 2;
        const bs = 70 + Math.random() * 215;
        particlesRef.current.push({
          id: `b-${Math.random()}`,
          x: z.x,
          y: z.y,
          z: 10 + Math.random() * 14,
          vx: Math.cos(ba) * bs,
          vy: Math.sin(ba) * bs,
          vz: 55 + Math.random() * 115,
          drag: 3.5,
          radius: 2.2 + Math.random() * 3.4,
          color: isAcidZombie ? '#84cc16' : '#b91c1c',
          alpha: 0.95,
          decay: 1.4,
          type: isAcidZombie ? 'TOXIC_ACID' : 'BLOOD',
        });
      }

      // Epic Shatter Doctrine shrapnel
      if ((p.shatterLevel || 0) > 0) {
        sound.playShatterBurst();
        const shardCount = 4 + (p.shatterLevel || 1) * 2;
        const baseWeaponDmg = p.weapons[p.currentWeapon]?.damage || 15;
        for (let s = 0; s < shardCount; s++) {
          const sa = (s * Math.PI * 2) / shardCount + Math.random() * 0.35;
          bulletsRef.current.push({
            id: `shrap-${Math.random()}`,
            x: z.x,
            y: z.y,
            vx: Math.cos(sa) * 520,
            vy: Math.sin(sa) * 520,
            radius: 4,
            damage: Math.round(baseWeaponDmg * (0.55 + (p.shatterLevel || 1) * 0.2)),
            piercingRemaining: 2,
            color: '#fb923c',
            distanceTraveled: 0,
            maxDistance: 210,
            ownerAngle: sa,
            isShrapnel: true,
          });
        }
      }

      // Mythic Solar Phoenix supernova explosion on kill
      if ((p.mythicSolarAura || 0) > 0) {
        particlesRef.current.push({
          id: `nova-${Math.random()}`,
          x: z.x,
          y: z.y,
          vx: 0,
          vy: 0,
          radius: 18,
          growthSpeed: 290,
          color: '#fbbf24',
          alpha: 0.9,
          decay: 2.2,
          type: 'FIRE_RING',
        });
        flashLightsRef.current.push({
          x: z.x,
          y: z.y,
          radius: 140,
          color: 'orange',
          alpha: 0.45,
          decay: 2.8,
        });
        for (let ni = 0; ni < zombiesRef.current.length; ni++) {
          const oz = zombiesRef.current[ni];
          if (oz.isDead || oz.id === z.id) continue;
          const dSq = (oz.x - z.x) ** 2 + (oz.y - z.y) ** 2;
          if (dSq < 115 * 115) {
            oz.hp -= 28 * (p.mythicSolarAura || 1);
            oz.isOnFire = true;
            oz.burnTimer = 2.5;
          }
        }
      }

      // Supply Drop chance (Health / Shield)
      const dropChance = z.isBoss ? 1.0 : 0.08 + luckLevelRef.current * 0.015;
      if (Math.random() < dropChance && dropsRef.current.length < 30) {
        const dropIsShield = p.maxShield > 0 && Math.random() > 0.48;
        dropsRef.current.push({
          id: `drop-${Math.random()}`,
          x: z.x,
          y: z.y,
          radius: 11,
          type: dropIsShield ? DropType.SHIELD : DropType.HEALTH,
          amount: dropIsShield ? 35 : 30,
          color: dropIsShield ? '#22d3ee' : '#10b981',
          pulseTimer: 0,
        });
      }

      // Check Level Up trigger
      if (p.xp >= p.xpNeeded && gameStateRef.current === GameState.PLAYING) {
        setUpgradeOptions(
          rollLevelUpOptions(p.level, updateCoins, luckLevelRef.current, p.acquiredUpgrades)
        );
        syncHud();
        setAppState(GameState.LEVEL_UP);
      }
    };

    const damageZombie = (z: Zombie, rawDmg: number, isCrit = false, hitAngle = 0) => {
      if (z.isDead) return;
      const p = playerRef.current;
      z.hp -= rawDmg;
      zombieHitFlashRef.current.set(z.id, performance.now());

      const kbStrength = (isCrit ? 115 : 65) * (p.knockbackMult || 1) * (z.isBoss ? 0.15 : 1);
      z.knockbackX += Math.cos(hitAngle) * kbStrength;
      z.knockbackY += Math.sin(hitAngle) * kbStrength;

      sound.playZombieHit();

      addFloatingText(
        z.x + (Math.random() - 0.5) * 14,
        z.y - z.radius - 6,
        isCrit ? `${Math.round(rawDmg)}!` : `${Math.round(rawDmg)}`,
        isCrit ? '#fbbf24' : '#ffffff',
        isCrit ? 1.25 : 0.95
      );

      // Ballistic 3D liquid blood droplets + directional arterial splatter behind zombie
      const isAcid = z.type === ZombieType.TOXIC_SPITTER;
      const dropCount = isCrit ? 6 : 4;
      for (let b = 0; b < dropCount; b++) {
        const ba = hitAngle + (Math.random() - 0.5) * 0.85;
        const bs = 85 + Math.random() * 145;
        particlesRef.current.push({
          id: `hit-${Math.random()}`,
          x: z.x + Math.cos(hitAngle) * (z.radius * 0.45),
          y: z.y + Math.sin(hitAngle) * (z.radius * 0.45),
          z: 12 + Math.random() * 8,
          vx: Math.cos(ba) * bs,
          vy: Math.sin(ba) * bs,
          vz: 45 + Math.random() * 85,
          drag: 3.8,
          radius: 1.9 + Math.random() * 2.3,
          color: isAcid ? '#84cc16' : '#dc2626',
          alpha: 0.92,
          decay: 1.75,
          type: isAcid ? 'TOXIC_ACID' : 'BLOOD',
        });
      }

      if (isCrit || Math.random() < 0.45) {
        const dist = z.radius * (0.9 + Math.random() * 0.9);
        const sr = z.radius * (isCrit ? 0.65 : 0.42);
        if (splatsRef.current.length > 260) splatsRef.current.shift();
        splatsRef.current.push({
          x: z.x + Math.cos(hitAngle) * dist,
          y: z.y + Math.sin(hitAngle) * dist,
          radius: sr * 0.45,
          targetRadius: sr,
          alpha: 0.86,
          color: isAcid ? '#65a30d' : '#7f1d1d',
          angle: hitAngle + (Math.random() - 0.5) * 0.35,
          stretch: 1.45,
          isLiquid: true,
          variant: Math.floor(Math.random() * 3),
        });
      }

      if (z.hp <= 0) {
        handleZombieDeath(z);
      }
    };

    const triggerPlayerDeathSequence = (fatalAngle: number) => {
      const p = playerRef.current;
      if (dyingStateRef.current.active) return;

      dyingStateRef.current = {
        active: true,
        timer: 0,
        total: 2.25,
        fatalAngle,
        startX: p.x,
        startY: p.y,
        recoilX: Math.cos(fatalAngle) * 38,
        recoilY: Math.sin(fatalAngle) * 38,
        flatlinePlayed: false,
        bodyFallPlayed: false,
        bloodPoolRadius: 6,
        droppedWeapon: {
          type: p.currentWeapon,
          x: p.x + Math.cos(p.angle) * 18,
          y: p.y + Math.sin(p.angle) * 18,
          vx: Math.cos(fatalAngle + 0.65) * 125,
          vy: Math.sin(fatalAngle + 0.65) * 125,
          angle: p.angle,
          rotSpeed: 6.5,
        },
      };

      cameraRef.current.trauma = 1.0;
      cameraRef.current.shake = 16;
      sound.playDeathImpact();
    };

    const applyDamageToPlayer = (dmg: number, sourceAngle: number) => {
      const p = playerRef.current;
      if (dyingStateRef.current.active) return;
      const now = performance.now();
      if (now - lastDamageTimeRef.current < 320) return;

      // Temporal dodge chance
      if ((p.dodgeChance || 0) > 0 && Math.random() < (p.dodgeChance || 0)) {
        lastDamageTimeRef.current = now;
        sound.playTemporalDodge();
        addFloatingText(p.x, p.y - 26, 'DESVIO!', '#22d3ee', 1.15);
        return;
      }

      lastDamageTimeRef.current = now;
      shieldRechargeTimerRef.current = 4.2;
      playerDamageFlashRef.current = 1.0;
      cameraRef.current.trauma = Math.min(1, cameraRef.current.trauma + 0.42);
      cameraRef.current.shake = Math.max(cameraRef.current.shake, 8);

      let remaining = dmg;
      if (p.shield > 0) {
        const absorbed = Math.min(p.shield, remaining);
        p.shield -= absorbed;
        remaining -= absorbed;

        // Kinetic shock shield perk
        if ((p.shieldShockLevel || 0) > 0) {
          sound.playChainLightning();
          particlesRef.current.push({
            id: `shk-${Math.random()}`,
            x: p.x,
            y: p.y,
            vx: 0,
            vy: 0,
            radius: 22,
            growthSpeed: 420,
            color: '#38bdf8',
            alpha: 0.9,
            decay: 2.6,
            type: 'PLASMA_RING',
          });
          for (let i = 0; i < zombiesRef.current.length; i++) {
            const z = zombiesRef.current[i];
            if (z.isDead) continue;
            const d = Math.hypot(z.x - p.x, z.y - p.y);
            if (d < 165) {
              const pa = Math.atan2(z.y - p.y, z.x - p.x);
              z.knockbackX += Math.cos(pa) * 320;
              z.knockbackY += Math.sin(pa) * 320;
              z.isStunned = true;
              z.stunTimer = 0.8 + (p.shieldShockLevel || 1) * 0.25;
              damageZombie(z, 22 * (p.shieldShockLevel || 1), false, pa);
            }
          }
        }
      }

      if (remaining > 0) {
        p.hp = Math.max(0, p.hp - remaining);
        sound.playPlayerHit();
        for (let pb = 0; pb < 4; pb++) {
          const ba = sourceAngle + (Math.random() - 0.5) * 1.1;
          const bs = 60 + Math.random() * 90;
          particlesRef.current.push({
            id: `pblood-${Math.random()}`,
            x: p.x,
            y: p.y,
            z: 14,
            vx: Math.cos(ba) * bs,
            vy: Math.sin(ba) * bs,
            vz: 40 + Math.random() * 65,
            drag: 4,
            radius: 1.8 + Math.random() * 1.8,
            color: '#b91c1c',
            alpha: 0.9,
            decay: 1.8,
            type: 'BLOOD',
          });
        }
      } else {
        sound.playZombieHit();
      }

      if (p.hp <= 0) {
        triggerPlayerDeathSequence(sourceAngle);
      }
      syncHud();
    };

    const fireConventionalWeapon = (nowSec: number) => {
      const p = playerRef.current;
      const wStats = p.weapons[p.currentWeapon];
      if (!wStats) return;

      const interval = 1 / Math.max(0.5, wStats.fireRate);
      if (nowSec - p.lastShotTime < interval) return;
      p.lastShotTime = nowSec;

      const cam = cameraRef.current;
      const currentSpread = wStats.spread + weaponBloomRef.current;
      const baseSpeed = wStats.bulletSpeed;
      const hasPyroIgnite = p.equippedSkin === 'skin_pyro_igniter' && Math.random() < 0.22;

      let barrelOffset = 18;
      let muzzleColor = '#fbbf24';
      let lightColor: 'amber' | 'orange' | 'cyan' = 'amber';
      let casingColor = '#f59e0b';
      let isShell = false;

      if (p.currentWeapon === WeaponType.GLOCK_19) {
        barrelOffset = 17;
        muzzleColor = '#fbbf24';
        lightColor = 'amber';
        casingColor = '#f59e0b';
        sound.playGlock19();

        cam.shake = Math.max(cam.shake, 3.4);
        weaponRecoilRef.current = Math.min(10, weaponRecoilRef.current + 5.2);
        cam.recoilVx -= Math.cos(p.angle) * 44;
        cam.recoilVy -= Math.sin(p.angle) * 44;
        weaponBloomRef.current = Math.min(0.11, weaponBloomRef.current + 0.012);
        cam.trauma = Math.min(1, cam.trauma + 0.08);
        cam.zoomImpulse -= 0.004;
        cam.rollVel += (Math.random() > 0.5 ? 1 : -1) * 0.018;

        const shotAngle = p.angle + (Math.random() - 0.5) * currentSpread;
        const bx = p.x + Math.cos(p.angle) * (p.radius + barrelOffset);
        const by = p.y + Math.sin(p.angle) * (p.radius + barrelOffset);
        bulletsRef.current.push({
          id: `b-${Math.random()}`,
          x: bx,
          y: by,
          vx: Math.cos(shotAngle) * baseSpeed,
          vy: Math.sin(shotAngle) * baseSpeed,
          radius: 3.8,
          damage: wStats.damage,
          piercingRemaining: wStats.piercing,
          color: wStats.color,
          distanceTraveled: 0,
          maxDistance: 680,
          ownerAngle: shotAngle,
          weaponType: WeaponType.GLOCK_19,
          isIgnite: hasPyroIgnite,
        });
      } else if (p.currentWeapon === WeaponType.BENELLI_M4) {
        barrelOffset = 22;
        muzzleColor = '#fb923c';
        lightColor = 'orange';
        casingColor = '#dc2626';
        isShell = true;
        sound.playBenelliM4();

        cam.shake = Math.max(cam.shake, 9.5);
        weaponRecoilRef.current = Math.min(10, weaponRecoilRef.current + 9.0);
        cam.recoilVx -= Math.cos(p.angle) * 108;
        cam.recoilVy -= Math.sin(p.angle) * 108;
        weaponBloomRef.current = Math.min(0.14, weaponBloomRef.current + 0.014);
        cam.trauma = Math.min(1, cam.trauma + 0.25);
        cam.zoomImpulse -= 0.016;
        cam.rollVel += (Math.random() > 0.5 ? 1 : -1) * 0.05;

        const mx = p.x + Math.cos(p.angle) * (p.radius + barrelOffset);
        const my = p.y + Math.sin(p.angle) * (p.radius + barrelOffset);
        particlesRef.current.push({
          id: `sw-${Math.random()}`,
          x: mx,
          y: my,
          vx: 0,
          vy: 0,
          radius: 8,
          growthSpeed: 280,
          color: '#fed7aa',
          alpha: 0.72,
          decay: 4.5,
          type: 'SHOCKWAVE_HEAT',
        });

        // 7 realistic 00 Buckshot pellets
        const scatterSpread = currentSpread * 1.15;
        const perpX = -Math.sin(p.angle);
        const perpY = Math.cos(p.angle);
        for (let pellet = 0; pellet < 7; pellet++) {
          const shotAngle = p.angle + (Math.random() + Math.random() - 1) * scatterSpread;
          const pelletSpeed = baseSpeed * (0.85 + Math.random() * 0.3);
          const jitter = (Math.random() - 0.5) * 4.2;
          bulletsRef.current.push({
            id: `buck-${Math.random()}`,
            x: mx + perpX * jitter,
            y: my + perpY * jitter,
            vx: Math.cos(shotAngle) * pelletSpeed,
            vy: Math.sin(shotAngle) * pelletSpeed,
            radius: 4.2 * (0.8 + Math.random() * 0.45),
            damage: wStats.damage,
            piercingRemaining: wStats.piercing,
            color: wStats.color,
            distanceTraveled: 0,
            maxDistance: 420 + Math.random() * 120,
            ownerAngle: shotAngle,
            weaponType: WeaponType.BENELLI_M4,
            isIgnite: hasPyroIgnite,
          });
        }
      } else {
        // WeaponType.SCAR_L
        barrelOffset = 24;
        muzzleColor = '#bae6fd';
        lightColor = 'cyan';
        casingColor = '#eab308';
        sound.playScarL();

        cam.shake = Math.max(cam.shake, 4.5);
        weaponRecoilRef.current = Math.min(10, weaponRecoilRef.current + 5.5);
        cam.recoilVx -= Math.cos(p.angle) * 52;
        cam.recoilVy -= Math.sin(p.angle) * 52;
        weaponBloomRef.current = Math.min(0.11, weaponBloomRef.current + 0.011);
        cam.trauma = Math.min(1, cam.trauma + 0.11);
        cam.zoomImpulse -= 0.006;
        cam.rollVel += (Math.random() > 0.5 ? 1 : -1) * 0.022;

        const mx = p.x + Math.cos(p.angle) * (p.radius + barrelOffset);
        const my = p.y + Math.sin(p.angle) * (p.radius + barrelOffset);
        particlesRef.current.push({
          id: `sw-scar-${Math.random()}`,
          x: mx,
          y: my,
          vx: 0,
          vy: 0,
          radius: 6,
          growthSpeed: 210,
          color: '#e0f2fe',
          alpha: 0.5,
          decay: 5.2,
          type: 'SHOCKWAVE_HEAT',
        });

        const shotAngle = p.angle + (Math.random() - 0.5) * currentSpread;
        bulletsRef.current.push({
          id: `scar-${Math.random()}`,
          x: mx,
          y: my,
          vx: Math.cos(shotAngle) * baseSpeed,
          vy: Math.sin(shotAngle) * baseSpeed,
          radius: 4.4,
          damage: wStats.damage,
          piercingRemaining: wStats.piercing,
          color: wStats.color,
          distanceTraveled: 0,
          maxDistance: 920,
          ownerAngle: shotAngle,
          weaponType: WeaponType.SCAR_L,
          isIgnite: hasPyroIgnite,
        });
      }

      // Mythic Chrono Reaper Spectral Triple Split Shot
      if ((p.mythicSplitShot || 0) > 0) {
        const mx = p.x + Math.cos(p.angle) * (p.radius + barrelOffset);
        const my = p.y + Math.sin(p.angle) * (p.radius + barrelOffset);
        const wingAngles = [p.angle - 0.19, p.angle + 0.19];
        for (const wa of wingAngles) {
          bulletsRef.current.push({
            id: `split-${Math.random()}`,
            x: mx,
            y: my,
            vx: Math.cos(wa) * (baseSpeed * 1.1),
            vy: Math.sin(wa) * (baseSpeed * 1.1),
            radius: 4.5,
            damage: Math.round(wStats.damage * (0.75 + (p.mythicSplitShot || 1) * 0.25)),
            piercingRemaining: Math.max(3, wStats.piercing + 2),
            color: '#e879f9',
            distanceTraveled: 0,
            maxDistance: 720,
            ownerAngle: wa,
            isRay: true,
          });
        }
      }

      // Mythic Singularity Star Nova every 3 shots
      mythicShotCountRef.current += 1;
      if ((p.mythicSingularity || 0) > 0 && mythicShotCountRef.current % 3 === 0) {
        sound.playMythicBlast();
        const novaCount = 8;
        for (let ni = 0; ni < novaCount; ni++) {
          const na = p.angle + (ni * Math.PI * 2) / novaCount;
          bulletsRef.current.push({
            id: `nova-ray-${Math.random()}`,
            x: p.x,
            y: p.y,
            vx: Math.cos(na) * 860,
            vy: Math.sin(na) * 860,
            radius: 5,
            damage: Math.round(wStats.damage * (1.2 + (p.mythicSingularity || 1) * 0.35)),
            piercingRemaining: 4,
            color: '#38bdf8',
            distanceTraveled: 0,
            maxDistance: 560,
            ownerAngle: na,
            isRay: true,
          });
        }
      }

      // Muzzle flare & flash light + gunpowder smoke + spent brass casing ejection
      const mx = p.x + Math.cos(p.angle) * (p.radius + barrelOffset);
      const my = p.y + Math.sin(p.angle) * (p.radius + barrelOffset);
      muzzleFlashRef.current = 1.0;

      flashLightsRef.current.push({
        x: mx,
        y: my,
        radius: p.currentWeapon === WeaponType.BENELLI_M4 ? 190 : 135,
        color: lightColor,
        alpha: 0.5,
        decay: 8.5,
      });

      particlesRef.current.push({
        id: `mf-${Math.random()}`,
        x: mx,
        y: my,
        vx: Math.cos(p.angle) * 35,
        vy: Math.sin(p.angle) * 35,
        radius: p.currentWeapon === WeaponType.BENELLI_M4 ? 13 : 9,
        color: muzzleColor,
        alpha: 0.95,
        decay: 14,
        type: 'MUZZLE_FLARE',
        rotation: p.angle,
      });

      // Gunpowder smoke puff
      particlesRef.current.push({
        id: `gunsmoke-${Math.random()}`,
        x: mx,
        y: my,
        vx: Math.cos(p.angle) * 55 + (Math.random() - 0.5) * 20,
        vy: Math.sin(p.angle) * 55 + (Math.random() - 0.5) * 20,
        drag: 3.5,
        radius: p.currentWeapon === WeaponType.BENELLI_M4 ? 11 : 7,
        growthSpeed: 16,
        color: 'rgba(203, 213, 225, 0.3)',
        alpha: 0.38,
        decay: 1.9,
        type: 'SMOKE',
        rotation: Math.random() * Math.PI * 2,
      });

      // Spent brass / shotgun hull ejection to the right side
      const ejectAngle = p.angle + Math.PI * 0.5 + (Math.random() - 0.5) * 0.35;
      const ejectSpeed = 88 + Math.random() * 48;
      particlesRef.current.push({
        id: `casing-${Math.random()}`,
        x: p.x + Math.cos(p.angle) * 10,
        y: p.y + Math.sin(p.angle) * 10,
        vx: Math.cos(ejectAngle) * ejectSpeed,
        vy: Math.sin(ejectAngle) * ejectSpeed,
        drag: 5.2,
        radius: isShell ? 2.2 : p.currentWeapon === WeaponType.SCAR_L ? 1.8 : 1.5,
        color: casingColor,
        alpha: 1,
        decay: 1.55,
        type: 'CASING',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 18,
      });
    };

    const updateGame = (dt: number, nowMs: number) => {
      const state = gameStateRef.current;
      const p = playerRef.current;
      const cam = cameraRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const nowSec = nowMs / 1000;

      // Poll controller every frame
      const gp = readActiveGamepadState(gamepadEdgeRef.current, gamepadStateRef.current);

      if (gp.pausePressed && (state === GameState.PLAYING || state === GameState.PAUSED)) {
        handlePauseToggle();
        return;
      }

      if (state !== GameState.PLAYING) return;

      // Advance 3-minute (180s) Day & Night cycle smoothly while active
      if (!dyingStateRef.current.active) {
        dayCycleTimeRef.current = (dayCycleTimeRef.current + dt) % DAY_NIGHT_CYCLE_SECONDS;
      }

      // Handle Gamepad weapon switching (B / L1)
      if (gp.switchPressed && !dyingStateRef.current.active && unlockedWeaponsRef.current.length > 1) {
        const list = unlockedWeaponsRef.current;
        const idx = list.indexOf(p.currentWeapon);
        switchWeapon(list[(idx + 1) % list.length]);
      }

      // ==========================================
      // DYING SLOW-MOTION COLLAPSE SEQUENCE
      // ==========================================
      if (dyingStateRef.current.active) {
        const ds = dyingStateRef.current;
        ds.timer += dt;
        const progress = Math.min(1, ds.timer / ds.total);
        const timeScale = 0.25;
        const scaledDt = dt * timeScale;

        if (ds.timer < 0.45) {
          const slideT = ds.timer / 0.45;
          p.x = ds.startX + ds.recoilX * (1 - Math.pow(1 - slideT, 2));
          p.y = ds.startY + ds.recoilY * (1 - Math.pow(1 - slideT, 2));
          p.x = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.x));
          p.y = Math.max(p.radius, Math.min(ARENA_SIZE - p.radius, p.y));
        }

        if (!ds.bodyFallPlayed && ds.timer >= 0.42) {
          ds.bodyFallPlayed = true;
          sound.playBodyFall();
        }
        if (!ds.flatlinePlayed && ds.timer >= 0.72) {
          ds.flatlinePlayed = true;
          sound.playFlatline();
        }

        ds.bloodPoolRadius = Math.min(34, 6 + progress * 30);

        // Dropped weapon slide
        ds.droppedWeapon.x += ds.droppedWeapon.vx * scaledDt;
        ds.droppedWeapon.y += ds.droppedWeapon.vy * scaledDt;
        ds.droppedWeapon.vx *= Math.exp(-3.5 * scaledDt);
        ds.droppedWeapon.vy *= Math.exp(-3.5 * scaledDt);
        ds.droppedWeapon.angle += ds.droppedWeapon.rotSpeed * scaledDt;
        ds.droppedWeapon.rotSpeed *= Math.exp(-3.2 * scaledDt);

        cam.trauma = Math.max(0, cam.trauma - dt * 0.9);
        cam.shake = Math.max(0, cam.shake - dt * 18);
        cam.x += (p.x - width / 2 - cam.x) * (1 - Math.exp(-4 * dt));
        cam.y += (p.y - height / 2 - cam.y) * (1 - Math.exp(-4 * dt));

        if (ds.timer >= ds.total) {
          ds.active = false;
          sound.playGameOver();
          if (p.score > highScoreZombieRef.current) {
            setHighScoreZombie(p.score);
            localStorage.setItem('zombie_shooter_highscore_zombie', p.score.toString());
            localStorage.setItem('zombie_shooter_highscore', p.score.toString());
          }
          syncHud();
          setAppState(GameState.GAME_OVER);
        }
        return;
      }

      // ==========================================
      // PLAYER MOVEMENT & INPUT RESOLUTION
      // ==========================================
      let moveX = 0;
      let moveY = 0;
      if (keysRef.current['w'] || keysRef.current['arrowup']) moveY -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) moveY += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += 1;

      if (leftJoystickRef.current.active) {
        moveX = leftJoystickRef.current.x;
        moveY = leftJoystickRef.current.y;
      } else if (gp.connected && (Math.abs(gp.moveX) > 0.05 || Math.abs(gp.moveY) > 0.05)) {
        moveX = gp.moveX;
        moveY = gp.moveY;
      }

      const moveMag = Math.hypot(moveX, moveY);
      if (moveMag > 1) {
        moveX /= moveMag;
        moveY /= moveMag;
      } else if (moveMag > 0.01 && (keysRef.current['w'] || keysRef.current['a'] || keysRef.current['s'] || keysRef.current['d'])) {
        moveX /= moveMag;
        moveY /= moveMag;
      }

      const waterSpeedMult = getWaterSpeedMultiplier(p.x, p.y);
      const preWaterDepth = getWaterDepth(p.x, p.y);
      const playerDrift = preWaterDepth > 2.8 ? getOceanCurrentDrift(p.x, p.y, nowSec) : { vx: 0, vz: 0 };
      const vx = moveX * p.speed * waterSpeedMult;
      const vy = moveY * p.speed * waterSpeedMult;
      p.vx = vx;
      p.vy = vy;

      const nextPlayerPos = resolveForestEntityCollision(
        p.x + (vx + playerDrift.vx * 0.75) * dt,
        p.y + (vy + playerDrift.vz * 0.75) * dt,
        p.radius
      );
      p.x = nextPlayerPos.x;
      p.y = nextPlayerPos.y;

      const onPierNow = isPointOnPier(p.x, p.y);
      const playerWaterDepth = getWaterDepth(p.x, p.y);
      if (splashCooldownRef.current > 0) splashCooldownRef.current -= dt;
      // Shoreline hysteresis prevents splash-sound/particle spam when walking along the 2.2 contour
      const inWaterNow = wasPlayerInWaterRef.current ? playerWaterDepth > 1.2 : playerWaterDepth > 3.2;
      if (inWaterNow !== wasPlayerInWaterRef.current) {
        const jumpedFromPier = inWaterNow && wasOnPierRef.current;
        wasPlayerInWaterRef.current = inWaterNow;
        if (splashCooldownRef.current <= 0 || jumpedFromPier) {
          splashCooldownRef.current = 0.34;
          sound.playWaterSplash(inWaterNow);
          threeRendererRef.current?.triggerWaterRipple(p.x, p.y, jumpedFromPier ? 1.65 : 1.15);
          particlesRef.current.push({
            id: `wring-io-${Math.random()}`,
            x: p.x,
            y: p.y,
            vx: 0,
            vy: 0,
            radius: jumpedFromPier ? 16 : 12,
            growthSpeed: jumpedFromPier ? 118 : 92,
            color: '#bae6fd',
            alpha: 0.78,
            decay: 1.45,
            type: 'WATER_RING',
          });
          const splashCount = jumpedFromPier ? 11 : 7;
          for (let ws = 0; ws < splashCount; ws++) {
            const sa = (ws * Math.PI * 2) / splashCount + Math.random() * 0.4;
            const spd = (jumpedFromPier ? 75 : 52) + Math.random() * 70;
            particlesRef.current.push({
              id: `wsplash-io-${Math.random()}`,
              x: p.x + Math.cos(sa) * 10,
              y: p.y + Math.sin(sa) * 10,
              z: jumpedFromPier ? 10 : 6,
              vx: Math.cos(sa) * spd,
              vy: Math.sin(sa) * spd,
              vz: (jumpedFromPier ? 95 : 70) + Math.random() * 60,
              drag: 3.2,
              radius: 2.2 + Math.random() * 1.8,
              color: '#e0f2fe',
              alpha: 0.9,
              decay: 1.9,
              type: 'WATER_SPLASH',
            });
          }
        }
      }
      wasOnPierRef.current = onPierNow;

      if (inWaterNow && Math.hypot(vx, vy) > 25) {
        swimWakeTimerRef.current += dt;
        if (swimWakeTimerRef.current >= 0.24) {
          swimWakeTimerRef.current = 0;
          threeRendererRef.current?.triggerWaterRipple(p.x, p.y, 0.52);
          particlesRef.current.push({
            id: `wwake-${Math.random()}`,
            x: p.x,
            y: p.y,
            vx: -vx * 0.08,
            vy: -vy * 0.08,
            radius: 10,
            growthSpeed: 54,
            color: '#e0f2fe',
            alpha: 0.58,
            decay: 1.15,
            type: 'WATER_RING',
          });
        }
      } else {
        swimWakeTimerRef.current = 0.16;
      }

      // Aim resolution (Touch Right Joystick -> Gamepad Right Stick -> Mouse World Coords)
      if (rightJoystickRef.current.active) {
        p.angle = Math.atan2(rightJoystickRef.current.y, rightJoystickRef.current.x);
      } else if (gp.connected && gp.aimActive) {
        p.angle = Math.atan2(gp.aimY, gp.aimX);
      } else if (!gp.connected) {
        const worldAim = threeRendererRef.current
          ? threeRendererRef.current.screenToWorld(mouseRef.current.x, mouseRef.current.y)
          : { x: mouseRef.current.x + cam.x, y: mouseRef.current.y + cam.y };
        p.angle = Math.atan2(worldAim.y - p.y, worldAim.x - p.x);
      }

      // Firing check
      const isFiring =
        mouseRef.current.isDown ||
        rightJoystickRef.current.active ||
        (gp.connected && (gp.fireHeld || gp.aimFire));
      if (isFiring) {
        fireConventionalWeapon(nowSec);
      }

      // Passive HP regeneration & Energy Shield recharge
      if ((p.regenHpRate || 0) > 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + (p.regenHpRate || 0) * dt);
      }
      if (shieldRechargeTimerRef.current > 0) {
        shieldRechargeTimerRef.current -= dt;
      } else if (p.maxShield > 0 && p.shield < p.maxShield) {
        p.shield = Math.min(p.maxShield, p.shield + 14 * dt);
      }

      // Low HP arterial heartbeat
      const hpRatio = p.hp / Math.max(1, p.maxHp);
      if (hpRatio <= 0.3) {
        heartbeatTimerRef.current -= dt;
        if (heartbeatTimerRef.current <= 0) {
          const intensity = hpRatio <= 0.15 ? 1.45 : 1.0;
          sound.playHeartbeat(intensity);
          heartbeatTimerRef.current = hpRatio <= 0.15 ? 0.56 : 0.85;
        }
      }

      // Skin active combat perks & ambient trails
      skinEffectTimerRef.current += dt;
      skinOrbitalTimerRef.current += dt;
      if (skinEffectTimerRef.current >= 0.08 && Math.hypot(vx, vy) > 40) {
        skinEffectTimerRef.current = 0;
        if (p.equippedSkin === 'skin_pyro_igniter') {
          particlesRef.current.push({
            id: `pyro-${Math.random()}`,
            x: p.x + (Math.random() - 0.5) * 14,
            y: p.y + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 28,
            vy: (Math.random() - 0.5) * 28,
            radius: 3.5,
            color: '#f97316',
            alpha: 0.7,
            decay: 2.2,
            type: 'FLAME',
          });
        } else if (p.equippedSkin === 'skin_hazard_juggernaut') {
          particlesRef.current.push({
            id: `haz-${Math.random()}`,
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16,
            radius: 8,
            color: 'rgba(132, 204, 22, 0.35)',
            alpha: 0.45,
            decay: 1.4,
            type: 'SMOKE',
          });
        } else if (p.equippedSkin === 'skin_cryo_warden') {
          particlesRef.current.push({
            id: `cryo-${Math.random()}`,
            x: p.x + (Math.random() - 0.5) * 18,
            y: p.y + (Math.random() - 0.5) * 18,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            radius: 2.5,
            color: '#bae6fd',
            alpha: 0.75,
            decay: 2.5,
            type: 'SPARK',
          });
        }
      }

      if (skinOrbitalTimerRef.current >= 0.35) {
        skinOrbitalTimerRef.current = 0;
        if (p.equippedSkin === 'skin_volt_cyber') {
          for (let i = 0; i < zombiesRef.current.length; i++) {
            const z = zombiesRef.current[i];
            if (z.isDead) continue;
            if ((z.x - p.x) ** 2 + (z.y - p.y) ** 2 < 78 * 78) {
              damageZombie(z, 9 + p.level * 2, false, Math.atan2(z.y - p.y, z.x - p.x));
              break;
            }
          }
        }
      }

      // Gravity Vortex Pulse perk
      if ((p.gravityPulseLevel || 0) > 0) {
        gravityPulseTimerRef.current -= dt;
        if (gravityPulseTimerRef.current <= 0) {
          gravityPulseTimerRef.current = Math.max(2.2, 4.5 - (p.gravityPulseLevel || 1) * 0.45);
          sound.playGravityPulse();
          particlesRef.current.push({
            id: `grav-${Math.random()}`,
            x: p.x,
            y: p.y,
            vx: 0,
            vy: 0,
            radius: 24,
            growthSpeed: 380,
            color: '#818cf8',
            alpha: 0.85,
            decay: 2.1,
            type: 'PLASMA_RING',
          });
          const pulseRange = 175 + (p.gravityPulseLevel || 1) * 20;
          for (let i = 0; i < zombiesRef.current.length; i++) {
            const z = zombiesRef.current[i];
            if (z.isDead) continue;
            const d = Math.hypot(z.x - p.x, z.y - p.y);
            if (d < pulseRange) {
              const pa = Math.atan2(z.y - p.y, z.x - p.x);
              z.knockbackX += Math.cos(pa) * 340;
              z.knockbackY += Math.sin(pa) * 340;
              z.isStunned = true;
              z.stunTimer = 0.7;
              damageZombie(z, 18 * (p.gravityPulseLevel || 1), false, pa);
            }
          }
        }
      }

      // Mythic Singularity Blades orbiting contact damage
      if ((p.mythicSingularity || 0) > 0) {
        mythicOrbitAngleRef.current += dt * 3.8;
        const bladeCount = 5;
        const orbitR = 78;
        for (let b = 0; b < bladeCount; b++) {
          const ba = mythicOrbitAngleRef.current + (b * Math.PI * 2) / bladeCount;
          const bx = p.x + Math.cos(ba) * orbitR;
          const by = p.y + Math.sin(ba) * orbitR;
          for (let zi = 0; zi < zombiesRef.current.length; zi++) {
            const z = zombiesRef.current[zi];
            if (z.isDead) continue;
            const hitR = z.radius + 14;
            if ((z.x - bx) ** 2 + (z.y - by) ** 2 < hitR * hitR) {
              damageZombie(
                z,
                (16 + (p.mythicSingularity || 1) * 8) * dt * 8,
                false,
                ba + Math.PI / 2
              );
            }
          }
        }
      }

      // Mythic Solar Corona continuous burn aura
      if ((p.mythicSolarAura || 0) > 0) {
        mythicSolarDamageTimerRef.current += dt;
        if (mythicSolarDamageTimerRef.current >= 0.25) {
          mythicSolarDamageTimerRef.current = 0;
          const auraR = 140 + Math.min(3, (p.mythicSolarAura || 1) - 1) * 18;
          for (let zi = 0; zi < zombiesRef.current.length; zi++) {
            const z = zombiesRef.current[zi];
            if (z.isDead) continue;
            if ((z.x - p.x) ** 2 + (z.y - p.y) ** 2 <= auraR * auraR) {
              z.isOnFire = true;
              z.burnTimer = 2.5;
              damageZombie(z, 14 * (p.mythicSolarAura || 1), false, Math.atan2(z.y - p.y, z.x - p.x));
            }
          }
        }
      }

      // Mythic Void Monarch Drones autonomous hunter lances
      if ((p.mythicVoidDrones || 0) > 0 && voidDronesRef.current.length > 0) {
        for (let di = 0; di < voidDronesRef.current.length; di++) {
          const drone = voidDronesRef.current[di];
          const orbitA = nowSec * 1.9 + (di * Math.PI * 2) / voidDronesRef.current.length;
          const tx = p.x + Math.cos(orbitA) * 52;
          const ty = p.y + Math.sin(orbitA) * 52;
          drone.x += (tx - drone.x) * Math.min(1, dt * 8);
          drone.y += (ty - drone.y) * Math.min(1, dt * 8);
          drone.fireTimer -= dt;

          // Target closest zombie
          let bestZ: Zombie | null = null;
          let bestDSq = 520 * 520;
          for (let zi = 0; zi < zombiesRef.current.length; zi++) {
            const z = zombiesRef.current[zi];
            if (z.isDead) continue;
            const dSq = (z.x - drone.x) ** 2 + (z.y - drone.y) ** 2;
            if (dSq < bestDSq) {
              bestDSq = dSq;
              bestZ = z;
            }
          }

          if (bestZ) {
            drone.angle = Math.atan2(bestZ.y - drone.y, bestZ.x - drone.x);
            if (drone.fireTimer <= 0) {
              drone.fireTimer = Math.max(0.28, 0.72 - (p.mythicVoidDrones || 1) * 0.1);
              bulletsRef.current.push({
                id: `void-${Math.random()}`,
                x: drone.x,
                y: drone.y,
                vx: Math.cos(drone.angle) * 620,
                vy: Math.sin(drone.angle) * 620,
                radius: 5,
                damage: Math.round(24 * (p.mythicVoidDrones || 1)),
                piercingRemaining: 2,
                color: '#c084fc',
                distanceTraveled: 0,
                maxDistance: 640,
                ownerAngle: drone.angle,
                isVoidLance: true,
                homingStrength: 4.5,
              });
            }
          } else {
            drone.angle = orbitA + Math.PI / 2;
          }
        }
      }

      // ==========================================
      // CAMERA REALISTIC KINEMATICS & FOOTSTEPS
      // ==========================================
      const speedNow = Math.hypot(vx, vy);
      const speedNorm = Math.min(1.5, speedNow / Math.max(1, p.speed));
      cam.swayTime += dt;

      if (speedNow > 22) {
        const strideFreq = 6.2 + speedNorm * 4.4;
        cam.walkPhase += dt * strideFreq;
        const stepSign = Math.sin(cam.walkPhase) >= 0 ? 1 : -1;

        if (stepSign !== cam.prevStepSign && cam.stepCadenceSoundTimer <= 0) {
          cam.prevStepSign = stepSign;
          const surfaceKind = getTerrainSurfaceKind(p.x, p.y);
          const waterDepthNow = getWaterDepth(p.x, p.y);

          if (surfaceKind === 'WATER' && waterDepthNow > 6.0) {
            cam.stepCadenceSoundTimer = 0.28;
            sound.playSwimStroke();
            threeRendererRef.current?.triggerWaterRipple(
              p.x + Math.cos(p.angle + stepSign * 0.75) * 12,
              p.y + Math.sin(p.angle + stepSign * 0.75) * 12,
              0.46
            );
            if (Math.random() < 0.75) {
              particlesRef.current.push({
                id: `wstroke-${Math.random()}`,
                x: p.x + Math.cos(p.angle + stepSign * 0.75) * 14,
                y: p.y + Math.sin(p.angle + stepSign * 0.75) * 14,
                z: 4,
                vx: (Math.random() - 0.5) * 48,
                vy: (Math.random() - 0.5) * 48,
                vz: 45 + Math.random() * 45,
                drag: 3.8,
                radius: 1.9 + Math.random() * 1.4,
                color: '#e0f2fe',
                alpha: 0.85,
                decay: 2.2,
                type: 'WATER_SPLASH',
              });
            }
          } else {
            cam.stepCadenceSoundTimer = 0.16;
            const footSurface =
              surfaceKind === 'WATER'
                ? 'water'
                : surfaceKind === 'SAND'
                  ? 'sand'
                  : surfaceKind === 'PIER'
                    ? 'concrete'
                    : 'grass';
            sound.playFootstep(footSurface);
          }

          // Heel-strike lateral/vertical camera micro-impulse
          const moveAngle = Math.atan2(vy, vx);
          const perpAngle = moveAngle + Math.PI / 2;
          cam.stepVx += Math.cos(perpAngle) * stepSign * 14 * speedNorm;
          cam.stepVy += (Math.sin(perpAngle) * stepSign * 8 + 16) * speedNorm;
          cam.rollVel += stepSign * 0.009 * speedNorm;
          cam.zoomImpulse -= 0.0018 * speedNorm;

          if (surfaceKind !== 'WATER') {
            // Check if boot stepped in fresh liquid blood puddle
            for (let si = splatsRef.current.length - 1; si >= Math.max(0, splatsRef.current.length - 60); si--) {
              const sp = splatsRef.current[si];
              if (!sp.isLiquid || sp.alpha < 0.25 || sp.color.includes('84cc16') || sp.color.includes('65a30d')) continue;
              const dSq = (p.x - sp.x) ** 2 + (p.y - sp.y) ** 2;
              const rHit = sp.radius * 1.15;
              if (dSq <= rHit * rHit) {
                wetBloodStepsRef.current = 4;
                break;
              }
            }
            const isWetStep = wetBloodStepsRef.current > 0;
            if (isWetStep) wetBloodStepsRef.current -= 1;

            // Spawn realistic boot tread footprint behind stride foot (crimson when tracking through blood)
            if (footprintsRef.current.length > 140) {
              footprintsRef.current.shift();
            }
            footprintsRef.current.push({
              x: p.x + Math.cos(perpAngle) * stepSign * 6.5,
              y: p.y + Math.sin(perpAngle) * stepSign * 6.5,
              angle: moveAngle,
              side: stepSign as -1 | 1,
              alpha: isWetStep ? 0.85 : 0.42,
              wet: isWetStep,
              scale: 1,
            });
          }
        }
      }
      if (cam.stepCadenceSoundTimer > 0) cam.stepCadenceSoundTimer -= dt;

      // Damped harmonic springs for step bounce, recoil kick, trauma & zoom
      const springStiffness = 125;
      const springDamping = 14;
      cam.springVx += (-springStiffness * cam.springX - springDamping * cam.springVx) * dt;
      cam.springVy += (-springStiffness * cam.springY - springDamping * cam.springVy) * dt;
      cam.springX += (cam.springVx + cam.stepVx + cam.recoilVx) * dt;
      cam.springY += (cam.springVy + cam.stepVy + cam.recoilVy) * dt;
      cam.stepVx *= Math.exp(-16 * dt);
      cam.stepVy *= Math.exp(-16 * dt);
      cam.recoilVx *= Math.exp(-18 * dt);
      cam.recoilVy *= Math.exp(-18 * dt);

      cam.rollVel += (-95 * cam.roll - 13 * cam.rollVel) * dt;
      cam.roll = Math.max(-0.045, Math.min(0.045, cam.roll + cam.rollVel * dt));

      const targetZoom = 1 + cam.zoomImpulse;
      cam.zoomVel += (110 * (targetZoom - cam.zoom) - 16 * cam.zoomVel) * dt;
      cam.zoom = Math.max(0.92, Math.min(1.06, cam.zoom + cam.zoomVel * dt));
      cam.zoomImpulse *= Math.exp(-9 * dt);

      cam.trauma = Math.max(0, cam.trauma - dt * 1.9);
      cam.shake = Math.max(0, cam.shake - dt * 26);

      // Lead camera smoothly ahead in aim direction
      const aimLeadDist = 42 + (p.currentWeapon === WeaponType.SCAR_L ? 22 : 0);
      const targetCamX = p.x + Math.cos(p.angle) * aimLeadDist - width / 2;
      const targetCamY = p.y + Math.sin(p.angle) * aimLeadDist - height / 2;
      const camFollow = 1 - Math.exp(-8.5 * dt);
      cam.x += (targetCamX - cam.x) * camFollow;
      cam.y += (targetCamY - cam.y) * camFollow;

      // Clamp camera cleanly within Island & Surrounding Ocean margins
      cam.x = Math.max(-300, Math.min(ARENA_SIZE - width + 300, cam.x));
      cam.y = Math.max(-300, Math.min(ARENA_SIZE - height + 300, cam.y));

      // Decay weapon bloom, recoil & muzzle flash
      weaponBloomRef.current = Math.max(0, weaponBloomRef.current - dt * 0.24);
      weaponRecoilRef.current = Math.max(0, weaponRecoilRef.current - dt * 28);
      muzzleFlashRef.current = Math.max(0, muzzleFlashRef.current - dt * 14);
      playerDamageFlashRef.current = Math.max(0, playerDamageFlashRef.current - dt * 3.4);

      // ==========================================
      // WAVE & ZOMBIE SPAWNING
      // ==========================================
      if (zombiesToSpawnRef.current > 0) {
        spawnTimerRef.current -= dt;
        if (spawnTimerRef.current <= 0 && zombiesRef.current.length < 95) {
          spawnZombieForWave(waveRef.current, false);
          zombiesToSpawnRef.current -= 1;
          spawnTimerRef.current = Math.max(0.24, 0.92 - waveRef.current * 0.045);
        }
      } else if (zombiesRef.current.length === 0) {
        waveTransitionTimerRef.current += dt;
        if (waveTransitionTimerRef.current >= 1.35) {
          waveTransitionTimerRef.current = 0;
          startNextWave();
        }
      }

      // ==========================================
      // BULLETS SIMULATION & COLLISIONS
      // ==========================================
      for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
        const b = bulletsRef.current[bi];

        // Void lance gentle homing
        if (b.isVoidLance && b.homingStrength && zombiesRef.current.length > 0) {
          let nearest: Zombie | null = null;
          let nearDSq = 380 * 380;
          for (let zi = 0; zi < zombiesRef.current.length; zi++) {
            const z = zombiesRef.current[zi];
            if (z.isDead) continue;
            const dSq = (z.x - b.x) ** 2 + (z.y - b.y) ** 2;
            if (dSq < nearDSq) {
              nearDSq = dSq;
              nearest = z;
            }
          }
          if (nearest) {
            const desired = Math.atan2(nearest.y - b.y, nearest.x - b.x);
            const curA = Math.atan2(b.vy, b.vx);
            let diff = desired - curA;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const nextA = curA + Math.max(-b.homingStrength * dt, Math.min(b.homingStrength * dt, diff));
            const spd = Math.hypot(b.vx, b.vy);
            b.vx = Math.cos(nextA) * spd;
            b.vy = Math.sin(nextA) * spd;
            b.ownerAngle = nextA;
          }
        }

        const stepDist = Math.hypot(b.vx * dt, b.vy * dt);
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.distanceTraveled += stepDist;

        if (
          b.distanceTraveled >= b.maxDistance ||
          b.x < -40 ||
          b.x > ARENA_SIZE + 40 ||
          b.y < -40 ||
          b.y > ARENA_SIZE + 40
        ) {
          if (!b.isRay && b.distanceTraveled >= b.maxDistance && getWaterDepth(b.x, b.y) > 0.6) {
            threeRendererRef.current?.triggerWaterRipple(b.x, b.y, b.isShrapnel ? 0.42 : 0.68);
            if (particlesRef.current.length < 180) {
              particlesRef.current.push({
                id: `bwat-${Math.random()}`,
                x: b.x,
                y: b.y,
                vx: 0,
                vy: 0,
                radius: 7,
                growthSpeed: 52,
                color: '#e0f2fe',
                alpha: 0.65,
                decay: 1.8,
                type: 'WATER_RING',
              });
              for (let ws = 0; ws < 2; ws++) {
                particlesRef.current.push({
                  id: `bws-${Math.random()}`,
                  x: b.x,
                  y: b.y,
                  z: 4,
                  vx: (Math.random() - 0.5) * 60,
                  vy: (Math.random() - 0.5) * 60,
                  vz: 55 + Math.random() * 45,
                  drag: 3.5,
                  radius: 1.8,
                  color: '#e0f2fe',
                  alpha: 0.85,
                  decay: 2.3,
                  type: 'WATER_SPLASH',
                });
              }
            }
          }
          bulletsRef.current.splice(bi, 1);
          continue;
        }

        if (!b.isRay && !b.isVoidLance) {
          const forestHit = checkForestBulletHit(b.x, b.y, b.radius);
          if (forestHit) {
            const sparkColor = forestHit === 'WOOD' ? '#92400e' : '#cbd5e1';
            for (let sp = 0; sp < 4; sp++) {
              const sa = b.ownerAngle + Math.PI + (Math.random() - 0.5) * 1.4;
              const ss = 65 + Math.random() * 110;
              particlesRef.current.push({
                id: `fhit-${Math.random()}`,
                x: b.x,
                y: b.y,
                vx: Math.cos(sa) * ss,
                vy: Math.sin(sa) * ss,
                drag: 6,
                radius: 1.6 + Math.random() * 1.6,
                color: sparkColor,
                alpha: 0.9,
                decay: 3.0,
                type: 'SPARK',
              });
            }
            bulletsRef.current.splice(bi, 1);
            continue;
          }
        }

        if (b.isEnemy) {
          const hitDist = p.radius + b.radius;
          if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 <= hitDist * hitDist) {
            applyDamageToPlayer(b.damage, b.ownerAngle);
            bulletsRef.current.splice(bi, 1);
          }
          continue;
        }

        // Player bullet vs zombies
        let bulletRemoved = false;
        for (let zi = zombiesRef.current.length - 1; zi >= 0; zi--) {
          const z = zombiesRef.current[zi];
          if (z.isDead) continue;
          const hitR = z.radius + b.radius;
          if ((b.x - z.x) ** 2 + (b.y - z.y) ** 2 <= hitR * hitR) {
            const isCrit = Math.random() < (p.critChance || 0);
            const finalDmg = isCrit ? b.damage * (p.critMultiplier || 2.0) : b.damage;
            damageZombie(z, finalDmg, isCrit, b.ownerAngle);

            if (b.isIgnite) {
              z.isOnFire = true;
              z.burnTimer = 2.6;
            }

            // Voltaic chain lightning perk
            if ((p.chainLightningLevel || 0) > 0 && !b.isShrapnel) {
              sound.playChainLightning();
              const maxJumps = 2 + (p.chainLightningLevel || 1);
              let jumpCount = 0;
              for (let j = 0; j < zombiesRef.current.length && jumpCount < maxJumps; j++) {
                const oz = zombiesRef.current[j];
                if (oz.isDead || oz.id === z.id) continue;
                const dSq = (oz.x - z.x) ** 2 + (oz.y - z.y) ** 2;
                if (dSq < 150 * 150) {
                  jumpCount++;
                  oz.isStunned = true;
                  oz.stunTimer = 0.25;
                  damageZombie(oz, finalDmg * 0.45, false, Math.atan2(oz.y - z.y, oz.x - z.x));
                  particlesRef.current.push({
                    id: `arc-${Math.random()}`,
                    x: oz.x,
                    y: oz.y,
                    vx: 0,
                    vy: 0,
                    radius: 4,
                    color: '#38bdf8',
                    alpha: 0.9,
                    decay: 6,
                    type: 'ENERGY_ARC',
                    points: [
                      { x: z.x, y: z.y },
                      {
                        x: (z.x + oz.x) / 2 + (Math.random() - 0.5) * 24,
                        y: (z.y + oz.y) / 2 + (Math.random() - 0.5) * 24,
                      },
                      { x: oz.x, y: oz.y },
                    ],
                  });
                }
              }
            }

            b.piercingRemaining -= 1;
            if (b.piercingRemaining <= 0) {
              bulletsRef.current.splice(bi, 1);
              bulletRemoved = true;
              break;
            }
          }
        }
        if (bulletRemoved) continue;
      }

      // ==========================================
      // ZOMBIES AI & PHYSICS
      // ==========================================
      for (let zi = zombiesRef.current.length - 1; zi >= 0; zi--) {
        const z = zombiesRef.current[zi];
        if (z.isDead) {
          zombiesRef.current.splice(zi, 1);
          continue;
        }

        // Fire DoT
        if (z.isOnFire && (z.burnTimer || 0) > 0) {
          z.burnTimer = (z.burnTimer || 0) - dt;
          z.burnDamageTimer = (z.burnDamageTimer || 0) + dt;
          if (z.burnDamageTimer >= 0.4) {
            z.burnDamageTimer = 0;
            damageZombie(z, 10 + p.level * 2, false, 0);
            if (z.isDead) {
              zombiesRef.current.splice(zi, 1);
              continue;
            }
          }
          if ((z.burnTimer || 0) <= 0) z.isOnFire = false;
        }

        if (z.isStunned) {
          z.stunTimer -= dt;
          if (z.stunTimer <= 0) z.isStunned = false;
        }

        const dx = p.x - z.x;
        const dy = p.y - z.y;
        const dist = Math.hypot(dx, dy) || 1;
        const steered = steerZombieAroundBuildings(z.x, z.y, p.x, p.y);
        const sdx = steered.targetX - z.x;
        const sdy = steered.targetY - z.y;
        const sdist = Math.hypot(sdx, sdy) || 1;
        z.angle = Math.atan2(dy, dx);

        // Cryo Warden aura slow near player
        const skinSlowMult = p.equippedSkin === 'skin_cryo_warden' && dist < 130 ? 0.55 : 1.0;

        const zWaterMult = getWaterSpeedMultiplier(z.x, z.y);

        if (!z.isStunned) {
          let desiredSpeed = z.speed * skinSlowMult * zWaterMult;
          if (z.shootsProjectiles && dist < 310) {
            desiredSpeed = dist < 210 ? -z.speed * 0.35 * zWaterMult : 0;
            z.lastShootTime = (z.lastShootTime || 0) + dt;
            if (z.lastShootTime >= 2.3) {
              z.lastShootTime = 0;
              sound.playZombieHit();
              bulletsRef.current.push({
                id: `spit-${Math.random()}`,
                x: z.x + Math.cos(z.angle) * z.radius,
                y: z.y + Math.sin(z.angle) * z.radius,
                vx: Math.cos(z.angle) * 320,
                vy: Math.sin(z.angle) * 320,
                radius: 6,
                damage: z.damage,
                piercingRemaining: 1,
                color: '#84cc16',
                distanceTraveled: 0,
                maxDistance: 460,
                ownerAngle: z.angle,
                isEnemy: true,
              });
            }
          }

          // Boss Special Attacks
          if (z.isBoss) {
            z.specialAttackTimer = (z.specialAttackTimer || 0) - dt;
            if ((z.specialAttackTimer || 0) <= 0) {
              z.specialAttackTimer = z.type === ZombieType.BOSS_NECROTITAN ? 2.4 : 3.1;
              if (z.type === ZombieType.BOSS_BUTCHER) {
                sound.playZombieRoar();
                const fan = [-0.24, 0, 0.24];
                for (const off of fan) {
                  const a = z.angle + off;
                  bulletsRef.current.push({
                    id: `cleaver-${Math.random()}`,
                    x: z.x,
                    y: z.y,
                    vx: Math.cos(a) * 350,
                    vy: Math.sin(a) * 350,
                    radius: 8,
                    damage: Math.round(z.damage * 0.7),
                    piercingRemaining: 1,
                    color: '#dc2626',
                    distanceTraveled: 0,
                    maxDistance: 520,
                    ownerAngle: a,
                    isEnemy: true,
                  });
                }
              } else if (z.type === ZombieType.BOSS_NECROTITAN) {
                sound.playZombieRoar();
                const ring = 8;
                for (let ri = 0; ri < ring; ri++) {
                  const a = z.angle + (ri * Math.PI * 2) / ring;
                  bulletsRef.current.push({
                    id: `titan-${Math.random()}`,
                    x: z.x,
                    y: z.y,
                    vx: Math.cos(a) * 310,
                    vy: Math.sin(a) * 310,
                    radius: 7.5,
                    damage: Math.round(z.damage * 0.65),
                    piercingRemaining: 1,
                    color: '#a855f7',
                    distanceTraveled: 0,
                    maxDistance: 580,
                    ownerAngle: a,
                    isEnemy: true,
                  });
                }
              } else {
                // Alfa Boss lunge burst
                z.knockbackX += Math.cos(z.angle) * 280;
                z.knockbackY += Math.sin(z.angle) * 280;
                sound.playZombieRoar();
              }
            }
          }

          z.x += (sdx / sdist) * desiredSpeed * dt;
          z.y += (sdy / sdist) * desiredSpeed * dt;

          const zDepth = getWaterDepth(z.x, z.y);
          if (zDepth > 3.5) {
            const zDrift = getOceanCurrentDrift(z.x, z.y, nowSec);
            z.x += zDrift.vx * 0.7 * dt;
            z.y += zDrift.vz * 0.7 * dt;
            if (desiredSpeed > 12 && particlesRef.current.length < 180 && Math.random() < dt * 2.2) {
              threeRendererRef.current?.triggerWaterRipple(z.x, z.y, 0.42);
              particlesRef.current.push({
                id: `zwake-${Math.random()}`,
                x: z.x,
                y: z.y,
                vx: 0,
                vy: 0,
                radius: Math.max(9, z.radius * 0.65),
                growthSpeed: 42,
                color: '#bae6fd',
                alpha: 0.45,
                decay: 1.0,
                type: 'WATER_RING',
              });
            }
          }
        }

        // Apply and damp knockback
        z.x += z.knockbackX * dt;
        z.y += z.knockbackY * dt;
        z.knockbackX *= Math.exp(-8.5 * dt);
        z.knockbackY *= Math.exp(-8.5 * dt);

        // Soft zombie-to-zombie separation so hordes fan out naturally
        for (let oj = zi - 1; oj >= 0 && oj >= zi - 10; oj--) {
          const oz = zombiesRef.current[oj];
          if (!oz || oz.isDead) continue;
          const sdx = z.x - oz.x;
          const sdy = z.y - oz.y;
          const minDist = z.radius + oz.radius;
          const dSq = sdx * sdx + sdy * sdy;
          if (dSq > 0.01 && dSq < minDist * minDist) {
            const d = Math.sqrt(dSq);
            const push = (minDist - d) * 0.45;
            const nx = sdx / d;
            const ny = sdy / d;
            z.x += nx * push;
            z.y += ny * push;
            oz.x -= nx * push;
            oz.y -= ny * push;
          }
        }

        const resolvedZ = resolveForestEntityCollision(z.x, z.y, z.radius);
        z.x = resolvedZ.x;
        z.y = resolvedZ.y;

        // Melee contact damage
        const contactDist = p.radius + z.radius;
        if ((z.x - p.x) ** 2 + (z.y - p.y) ** 2 <= contactDist * contactDist) {
          applyDamageToPlayer(z.damage, z.angle);
        }
      }

      // ==========================================
      // ITEM DROPS PICKUP
      // ==========================================
      for (let di = dropsRef.current.length - 1; di >= 0; di--) {
        const d = dropsRef.current[di];
        d.pulseTimer += dt * 4;
        if (getWaterDepth(d.x, d.y) > 2.8) {
          const dropDrift = getOceanCurrentDrift(d.x, d.y, nowSec);
          d.x += dropDrift.vx * 0.85 * dt;
          d.y += dropDrift.vz * 0.85 * dt;
        }
        const dist = Math.hypot(p.x - d.x, p.y - d.y);
        if (dist < 110) {
          d.x += ((p.x - d.x) / Math.max(1, dist)) * 280 * dt;
          d.y += ((p.y - d.y) / Math.max(1, dist)) * 280 * dt;
        }
        if (dist <= p.radius + d.radius + 8) {
          sound.playPowerup();
          if (d.type === DropType.HEALTH) {
            p.hp = Math.min(p.maxHp, p.hp + d.amount);
            addFloatingText(p.x, p.y - 20, `+${d.amount} HP`, '#34d399', 1.05);
          } else if (d.type === DropType.SHIELD && p.maxShield > 0) {
            p.shield = Math.min(p.maxShield, p.shield + d.amount);
            addFloatingText(p.x, p.y - 20, `+${d.amount} ESCUDO`, '#22d3ee', 1.05);
          } else {
            p.hp = Math.min(p.maxHp, p.hp + 15);
          }
          dropsRef.current.splice(di, 1);
          syncHud();
        }
      }

      // ==========================================
      // PARTICLES, FLASH LIGHTS, FOOTPRINTS & CASINGS
      // ==========================================
      for (let pi = particlesRef.current.length - 1; pi >= 0; pi--) {
        const pt = particlesRef.current[pi];
        pt.prevX = pt.x;
        pt.prevY = pt.y;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        if (pt.drag) {
          const damp = Math.exp(-pt.drag * dt);
          pt.vx *= damp;
          pt.vy *= damp;
        }
        if (pt.growthSpeed) {
          pt.radius += pt.growthSpeed * dt;
        }
        if (pt.rotSpeed) {
          pt.rotation = (pt.rotation || 0) + pt.rotSpeed * dt;
        }
        if (pt.z !== undefined && pt.vz !== undefined) {
          pt.z += pt.vz * dt;
          pt.vz -= (pt.type === 'WATER_SPLASH' ? 360 : 430) * dt;
          if (pt.type === 'WATER_SPLASH' && pt.z <= 0.2) {
            particlesRef.current.splice(pi, 1);
            continue;
          }
          if ((pt.type === 'BLOOD' || pt.type === 'TOXIC_ACID') && pt.z <= 0.4) {
            if (splatsRef.current.length < 260 && Math.random() < 0.75) {
              const landR = Math.max(3.5, pt.radius * 2.1);
              splatsRef.current.push({
                x: pt.x,
                y: pt.y,
                radius: landR * 0.45,
                targetRadius: landR,
                alpha: 0.82,
                color: pt.type === 'TOXIC_ACID' ? '#65a30d' : '#7f1d1d',
                angle: Math.atan2(pt.vy, pt.vx),
                stretch: 1.25,
                isLiquid: true,
                variant: Math.floor(Math.random() * 3),
              });
            }
            particlesRef.current.splice(pi, 1);
            continue;
          }
        }
        pt.alpha -= pt.decay * dt;

        // When airborne casing settles, convert into persistent spent brass/shell on ground
        if (pt.type === 'CASING' && pt.alpha <= 0.45) {
          sound.playCasingClink();
          if (spentCasingsRef.current.length > 160) {
            spentCasingsRef.current.shift();
          }
          spentCasingsRef.current.push({
            x: pt.x,
            y: pt.y,
            angle: pt.rotation || 0,
            color: pt.color,
            isShell: pt.radius >= 2.0,
            alpha: 0.9,
          });
          particlesRef.current.splice(pi, 1);
          continue;
        }

        if (pt.alpha <= 0) {
          particlesRef.current.splice(pi, 1);
        }
      }

      // Dynamic liquid blood pool expansion & slow drying evaporation
      for (let si = splatsRef.current.length - 1; si >= 0; si--) {
        const sp = splatsRef.current[si];
        if (sp.targetRadius && sp.radius < sp.targetRadius) {
          sp.radius += (sp.targetRadius - sp.radius) * Math.min(1, dt * 6.5);
        }
        sp.alpha -= dt * (sp.isLiquid ? 0.008 : 0.006);
        if (sp.alpha <= 0.02) {
          splatsRef.current.splice(si, 1);
        }
      }

      for (let li = flashLightsRef.current.length - 1; li >= 0; li--) {
        const fl = flashLightsRef.current[li];
        fl.alpha -= fl.decay * dt;
        if (fl.alpha <= 0) flashLightsRef.current.splice(li, 1);
      }

      for (let fi = footprintsRef.current.length - 1; fi >= 0; fi--) {
        footprintsRef.current[fi].alpha -= dt * 0.045;
        if (footprintsRef.current[fi].alpha <= 0) footprintsRef.current.splice(fi, 1);
      }

      for (let ci = spentCasingsRef.current.length - 1; ci >= 0; ci--) {
        spentCasingsRef.current[ci].alpha -= dt * 0.015;
        if (spentCasingsRef.current[ci].alpha <= 0) spentCasingsRef.current.splice(ci, 1);
      }

      for (let ti = floatingTextsRef.current.length - 1; ti >= 0; ti--) {
        const ft = floatingTextsRef.current[ti];
        ft.y += ft.vy * dt;
        ft.alpha -= dt * 1.45;
        if (ft.alpha <= 0) floatingTextsRef.current.splice(ti, 1);
      }

      hudSyncTimerRef.current += dt;
      if (hudSyncTimerRef.current >= 0.08) {
        hudSyncTimerRef.current = 0;
        syncHud();
      }
    };

    const renderScene = (dt: number, nowMs: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const p = playerRef.current;
      const cam = cameraRef.current;
      const ds = dyingStateRef.current;
      const diorama = threeRendererRef.current;

      ctx.clearRect(0, 0, width, height);

      if (diorama) {
        diorama.render({
          player: p,
          zombies: zombiesRef.current,
          bullets: bulletsRef.current,
          drops: dropsRef.current,
          particles: particlesRef.current,
          splats: splatsRef.current,
          footprints: footprintsRef.current,
          casings: spentCasingsRef.current,
          flashLights: flashLightsRef.current,
          voidDrones: voidDronesRef.current,
          dyingState: ds,
          camera: cam,
          viewportWidth: width,
          viewportHeight: height,
          weaponRecoil: weaponRecoilRef.current,
          muzzleFlashIntensity: muzzleFlashRef.current,
          mythicOrbitAngle: mythicOrbitAngleRef.current,
          dayCycleTime: dayCycleTimeRef.current,
          nowMs,
          dt,
          zombieHitFlashMap: zombieHitFlashRef.current,
          visionConeEnabled: visionConeEnabledRef.current,
        });
        diorama.syncDrones(voidDronesRef.current, ds.active);
      }

      const playerScreen = diorama
        ? diorama.worldToScreen(p.x, p.y, 16)
        : { x: p.x - cam.x, y: p.y - cam.y };

      // Crisp screen-space floating damage numbers projected from 3D world
      if (floatingTextsRef.current.length > 0) {
        ctx.save();
        ctx.textAlign = 'center';
        for (let i = 0; i < floatingTextsRef.current.length; i++) {
          const ft = floatingTextsRef.current[i];
          const pos2d = diorama
            ? diorama.worldToScreen(ft.x, ft.y, 34)
            : { x: ft.x - cam.x, y: ft.y - cam.y };
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.font = `900 ${Math.round(13 * ft.scale)}px ui-monospace, monospace`;
          ctx.fillStyle = '#020617';
          ctx.fillText(ft.text, pos2d.x + 1, pos2d.y + 1);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, pos2d.x, pos2d.y);
        }
        ctx.restore();
      }

      // Optional Vision Cone tactical darkness mask
      if (visionConeEnabledRef.current && !ds.active) {
        renderVisionConeOverlay(ctx, playerScreen.x, playerScreen.y, p.angle, width, height);
      }

      // Gamepad aim reticle
      if (gamepadStateRef.current.connected && !ds.active && gameStateRef.current === GameState.PLAYING) {
        renderGamepadAimReticle(
          ctx,
          playerScreen.x,
          playerScreen.y,
          p.angle,
          gamepadStateRef.current.aimActive,
          nowMs
        );
      }

      // Red damage vignette flash (no per-frame full-screen 2D vignette blit!)
      if (playerDamageFlashRef.current > 0.02) {
        ctx.save();
        ctx.fillStyle = `rgba(220, 38, 38, ${(playerDamageFlashRef.current * 0.28).toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Compact Island & Ocean Tactical Radar Minimap
      if (gameStateRef.current === GameState.PLAYING && !ds.active && width >= 480) {
        const radarR = 46;
        const rx = width - radarR - 18;
        const ry = 108 + radarR;
        const radarRange = 1780;
        const scale = radarR / radarRange;

        ctx.save();
        ctx.beginPath();
        ctx.arc(rx, ry, radarR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 36, 68, 0.9)';
        ctx.fill();
        ctx.clip();

        const slabX = rx - p.x * scale;
        const slabY = ry - p.y * scale;
        const islandCx = slabX + ISLAND_CENTER * scale;
        const islandCy = slabY + ISLAND_CENTER * scale;

        // Maritime Outer Buoy Ring
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(islandCx, islandCy, 1860 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const traceCoastline = (offsetRadius: number) => {
          const steps = 48;
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const a = (s / steps) * Math.PI * 2;
            const r = (getCoastlineRadius(a) + offsetRadius) * scale;
            const px = islandCx + Math.cos(a) * r;
            const py = islandCy + Math.sin(a) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        };

        // Shallow Turquoise Lagoon Shelf
        traceCoastline(110);
        ctx.fillStyle = 'rgba(14, 116, 144, 0.48)';
        ctx.fill();

        // Golden Sandy Beach Coastline
        traceCoastline(0);
        ctx.fillStyle = 'rgba(217, 184, 118, 0.85)';
        ctx.fill();

        // Lush Green Island Interior Meadow
        traceCoastline(-72);
        ctx.fillStyle = 'rgba(34, 84, 48, 0.86)';
        ctx.fill();

        // Wooden Coastal Pier Silhouette
        const pier = getIslandPier();
        ctx.fillStyle = 'rgba(146, 98, 57, 0.9)';
        ctx.fillRect(
          slabX + pier.minX * scale,
          slabY + pier.startZ * scale,
          pier.width * scale,
          (pier.endZ - pier.startZ) * scale
        );

        // Center Spawn Pad Marker
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(islandCx - 3.5, islandCy - 3.5, 7, 7);

        // 3D Enterable Houses Architectural Footprints on Radar
        const mapHouses = getEnterableHouses();
        ctx.fillStyle = 'rgba(203, 213, 225, 0.48)';
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.78)';
        ctx.lineWidth = 1;
        for (let hi = 0; hi < mapHouses.length; hi++) {
          const h = mapHouses[hi];
          const hx = slabX + h.minX * scale;
          const hy = slabY + h.minZ * scale;
          const hw = h.width * scale;
          const hd = h.depth * scale;
          ctx.fillRect(hx, hy, hw, hd);
          ctx.strokeRect(hx, hy, hw, hd);
        }

        // Crisp Shoreline Contour
        traceCoastline(0);
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        for (let i = 0; i < zombiesRef.current.length; i++) {
          const z = zombiesRef.current[i];
          if (z.isDead) continue;
          const dx = (z.x - p.x) * scale;
          const dy = (z.y - p.y) * scale;
          if (dx * dx + dy * dy > (radarR - 3) * (radarR - 3)) continue;
          ctx.fillStyle = z.isBoss ? '#fbbf24' : '#ef4444';
          ctx.beginPath();
          ctx.arc(rx + dx, ry + dy, z.isBoss ? 3.2 : 1.7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.arc(rx, ry, 20, p.angle - 0.55, p.angle + 0.55);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(rx, ry, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.42)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rx, ry, radarR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    let timerId = 0;
    let active = true;

    const scheduleNext = () => {
      if (!active) return;
      const diorama = threeRendererRef.current;
      if (diorama?.isSoftwareGl) {
        diorama.afterDraw(gameLoop, (id) => {
          timerId = id;
        });
      } else {
        animId = requestAnimationFrame(gameLoop);
      }
    };

    const gameLoop = () => {
      if (!active) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      updateGame(dt, now);
      const st = gameStateRef.current;
      if (st === GameState.PLAYING || st === GameState.GAME_OVER) {
        staticFrameRenderedRef.current = false;
        renderScene(dt, now);
      } else if (st === GameState.PAUSED || st === GameState.LEVEL_UP) {
        if (!staticFrameRenderedRef.current) {
          staticFrameRenderedRef.current = true;
          renderScene(dt, now);
        }
      } else {
        staticFrameRenderedRef.current = false;
      }

      scheduleNext();
    };

    animId = requestAnimationFrame(gameLoop);
    return () => {
      active = false;
      cancelAnimationFrame(animId);
      clearTimeout(timerId);
    };
  }, [handlePauseToggle, setAppState, switchWeapon, syncHud, updateCoins]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      <div
        ref={threeMountRef}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(2,6,23,0.42) 100%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none touch-none"
      />

      {gameState === GameState.PLAYING && (
        <MobileControls
          onLeftJoystick={(input) => {
            leftJoystickRef.current = input;
          }}
          onRightJoystick={(input) => {
            rightJoystickRef.current = input;
          }}
        />
      )}

      <GameHUD
        gameState={gameState}
        player={hudPlayer}
        wave={wave}
        zombiesRemaining={zombiesRemaining}
        highScoreZombie={highScoreZombie}
        activeBoss={activeBoss}
        dayNight={dayNightHud}
        onStart={startGame}
        onPauseToggle={handlePauseToggle}
        onRestart={startGame}
        onGoToMenu={handleGoToMenu}
        onSelectWeapon={switchWeapon}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        coins={coins}
        onOpenStore={handleOpenStore}
        onResetAll={handleResetAll}
        prestigeLevel={prestigeLevel}
        tokens={tokens}
        onOpenPrestige={handleOpenPrestige}
        gamepadConnected={gamepadConnected}
        visionConeEnabled={visionConeEnabled}
        onToggleVisionCone={handleToggleVisionCone}
        graphicsQuality={graphicsQuality}
        onChangeGraphicsQuality={handleChangeGraphicsQuality}
      />

      {gameState === GameState.LEVEL_UP && (
        <UpgradeScreen
          options={upgradeOptions}
          onSelect={handleSelectUpgrade}
          level={hudPlayer.level}
          onReroll={handleRerollUpgrades}
          rerollsLeft={hudPlayer.rerollsAvailable || 0}
        />
      )}

      {gameState === GameState.STORE && (
        <StoreScreen
          coins={coins}
          unlockedWeapons={unlockedWeapons}
          equippedWeapon={equippedWeapon}
          onBuyWeapon={handleBuyWeapon}
          onEquipWeapon={handleEquipWeapon}
          unlockedSkins={unlockedSkins}
          equippedSkin={equippedSkin}
          onBuySkin={handleBuySkin}
          onEquipSkin={handleEquipSkin}
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
          onAddTestCoins={() => updateCoins(10000)}
          onClose={handleCloseStore}
        />
      )}

      {gameState === GameState.PRESTIGE && (
        <PrestigeScreen
          coins={coins}
          prestigeLevel={prestigeLevel}
          tokens={tokens}
          tokenUpgrades={tokenUpgrades}
          onAscendPrestige={handleAscendPrestige}
          onBuyTokenUpgrade={handleBuyTokenUpgrade}
          onRespecTokens={handleRespecTokens}
          onClose={handleClosePrestige}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}

export default App;
