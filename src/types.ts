/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_UP = 'LEVEL_UP',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED',
  STORE = 'STORE',
  PRESTIGE = 'PRESTIGE',
}

export type GraphicsQuality = 'ULTRA_LOW' | 'LOW' | 'MEDIUM' | 'HIGH';

export enum WeaponType {
  GLOCK_19 = 'GLOCK_19',
  BENELLI_M4 = 'BENELLI_M4',
  SCAR_L = 'SCAR_L',
}

export interface WeaponStats {
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // shots per second
  ammoCapacity: number;
  currentAmmo: number;
  bulletSpeed: number;
  spread: number; // in radians
  piercing: number; // how many enemies a bullet can pass through
  burstCount?: number;
  color: string;
  unlocked?: boolean;
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpNeeded: number;
  level: number;
  score: number;
  kills: number;
  currentWeapon: WeaponType;
  weapons: Record<WeaponType, WeaponStats>;
  shield: number;
  maxShield: number;
  lastShotTime: number;
  vx?: number;
  vy?: number;
  unlockedWeapons?: WeaponType[];
  equippedSkin?: string;
  unlockedSkins?: string[];
  coinsEarned?: number;
  vampirism?: number;
  bonusCoinsMult?: number;
  critChance?: number;
  regenHpRate?: number;
  rerollsAvailable?: number;
  mythicSingularity?: number;
  chainLightningLevel?: number;
  critMultiplier?: number;
  gravityPulseLevel?: number;
  mythicSolarAura?: number;
  mythicSplitShot?: number;
  dodgeChance?: number;
  mythicVoidDrones?: number;
  shatterLevel?: number;
  shieldShockLevel?: number;
  knockbackMult?: number;
  acquiredUpgrades?: Record<string, number>;
}

export interface VoidDroneState {
  x: number;
  y: number;
  angle: number;
  fireTimer: number;
  targetX?: number;
  targetY?: number;
}

export interface DyingState {
  active: boolean;
  timer: number;
  total: number;
  fatalAngle: number;
  startX: number;
  startY: number;
  recoilX: number;
  recoilY: number;
  flatlinePlayed: boolean;
  bodyFallPlayed: boolean;
  bloodPoolRadius: number;
  droppedWeapon: {
    type: WeaponType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    rotSpeed: number;
  };
}

export type UpgradeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export type SkinEffectType = 'NONE' | 'SHADOW' | 'HAZMAT' | 'PYRO' | 'CRYO' | 'VOLT' | 'SOLAR';

export interface OperatorSkin {
  id: string;
  name: string;
  callsign: string;
  title?: string;
  description: string;
  price: number;
  rarity: UpgradeRarity;
  color: string;
  accentColor: string;
  trailColor: string;
  glowColor?: string;
  specialEffectType?: SkinEffectType;
  perkName?: string;
  perkDescription?: string;
  unlocked?: boolean;
}

export enum GameMode {
  ZOMBIE = 'ZOMBIE',
}

export enum ZombieType {
  NORMAL = 'NORMAL',
  RUNNER = 'RUNNER',
  TANK = 'TANK',
  TOXIC_SPITTER = 'TOXIC_SPITTER',
  BOSS = 'BOSS', // Onda 5: Tirano Necrótico Alfa
  BOSS_BUTCHER = 'BOSS_BUTCHER', // Onda 10: Golias Açougueiro Pestilento
  BOSS_NECROTITAN = 'BOSS_NECROTITAN', // Onda 15+: Necro-Titã Supremo
}

export interface Zombie {
  id: string;
  type: ZombieType;
  x: number;
  y: number;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  damage: number;
  scoreValue: number;
  xpValue: number;
  color: string;
  angle: number;
  lastAttackTime: number;
  knockbackX: number;
  knockbackY: number;
  isStunned: boolean;
  stunTimer: number;
  isOnFire?: boolean;
  burnTimer?: number;
  burnDamageTimer?: number;
  isPoisoned?: boolean;
  poisonTimer?: number;
  poisonDps?: number;
  poisonTickTimer?: number;
  isKinjitePoison?: boolean;
  lastShootTime?: number;
  shootsProjectiles?: boolean;
  isBoss?: boolean;
  bossName?: string;
  bossTitle?: string;
  specialAttackTimer?: number;
  subPhase?: number;
  aiSeed?: number;
  dashTimer?: number;
  isDead?: boolean;
}

export interface ActiveBossInfo {
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  type: ZombieType;
  color: string;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  piercingRemaining: number;
  color: string;
  distanceTraveled: number;
  maxDistance: number;
  ownerAngle: number;
  isEnemy?: boolean;
  isRay?: boolean;
  isVoidLance?: boolean;
  isShrapnel?: boolean;
  isIgnite?: boolean;
  homingStrength?: number;
  weaponType?: WeaponType;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
  vx: number;
  vy: number;
  drag?: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type:
    | 'BLOOD'
    | 'TOXIC_ACID'
    | 'MUZZLE'
    | 'MUZZLE_FLARE'
    | 'SPARK'
    | 'FLAME'
    | 'SMOKE'
    | 'EXPLOSION'
    | 'BLAST_DEBRIS'
    | 'SHOCKWAVE_HEAT'
    | 'CASING'
    | 'LEVEL_UP'
    | 'PLASMA_RING'
    | 'FIRE_RING'
    | 'RAY_RING'
    | 'MYTHIC_NOVA'
    | 'ENERGY_ARC'
    | 'WATER_RING'
    | 'WATER_SPLASH';
  rotation?: number;
  rotSpeed?: number;
  growthSpeed?: number;
  points?: { x: number; y: number }[];
  z?: number;
  vz?: number;
}

export interface BloodSplat {
  x: number;
  y: number;
  radius: number;
  targetRadius?: number;
  alpha: number;
  color: string;
  angle?: number;
  stretch?: number;
  isLiquid?: boolean;
  variant?: number;
}

export enum DropType {
  HEALTH = 'HEALTH',
  AMMO = 'AMMO',
  SHIELD = 'SHIELD',
}

export interface ItemDrop {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: DropType;
  amount: number;
  color: string;
  pulseTimer: number;
}

export interface JoystickInput {
  x: number;
  y: number;
  active: boolean;
}

export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity?: UpgradeRarity;
  statBonus?: string;
  category?: 'SURVIVAL' | 'OFFENSE' | 'TACTICAL' | 'ULTIMATE';
  currentStack?: number;
  effect: (player: Player) => Player;
}

export type TokenUpgradeId =
  | 'token_wealth'
  | 'token_might'
  | 'token_vitality'
  | 'token_haste'
  | 'token_crit_xp';
