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
  INVENTORY_MENU = 'INVENTORY_MENU',
  INVENTORY_GAME = 'INVENTORY_GAME',
  STORE = 'STORE',
  PRESTIGE = 'PRESTIGE',
  MASTERY = 'MASTERY',
}

export enum WeaponType {
  PISTOL = 'PISTOL',
  MAGNUM = 'MAGNUM',
  SHOTGUN = 'SHOTGUN',
  MACHINE_GUN = 'MACHINE_GUN',
  ASSAULT_RIFLE = 'ASSAULT_RIFLE',
  LMG = 'LMG',
  SNIPER = 'SNIPER',
  PLASMA_RIFLE = 'PLASMA_RIFLE',
  MINIGUN = 'MINIGUN',
  ROCKET_LAUNCHER = 'ROCKET_LAUNCHER',
  FLAMETHROWER = 'FLAMETHROWER',
  RAYGUN = 'RAYGUN',
  RAY_RIFLE = 'RAY_RIFLE',
  LASER_MINIGUN = 'LASER_MINIGUN',
  DESTRUCTOR = 'DESTRUCTOR',
  INTERCEPTOR = 'INTERCEPTOR',
  NAVE_REI = 'NAVE_REI',
  EAST_DRAGON = 'EAST_DRAGON',
  IRON_MAN = 'IRON_MAN',
  ICE_AND_FIRE_DRAGON = 'ICE_AND_FIRE_DRAGON',
  TROPER = 'TROPER',
  VENOM_FRUIT = 'VENOM_FRUIT',
}

export interface DragonSegment {
  x: number;
  y: number;
  angle: number;
}

export interface WeaponStats {
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // bullets per second
  ammoCapacity: number;
  currentAmmo: number;
  bulletSpeed: number;
  spread: number; // in radians
  piercing: number; // how many enemies a bullet can pass through
  burstCount?: number; // for burst firing if any
  color: string;
  pentes?: number; // number of spare clips/pentes
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
  shield: number; // temporary shield
  maxShield: number;
  lastShotTime: number;
  vx?: number;
  vy?: number;
  hotbar?: (WeaponType | null)[];
  inventory?: (WeaponType | null)[];
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

export interface ThrusterTrailPoint {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  warp?: boolean;
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
  ALIEN = 'ALIEN',
}

export enum ZombieType {
  // Zombie Mode Enemies
  NORMAL = 'NORMAL',
  RUNNER = 'RUNNER',
  TANK = 'TANK',
  TOXIC_SPITTER = 'TOXIC_SPITTER',
  BOSS = 'BOSS', // Onda 5: Tirano Necrótico Alfa
  BOSS_BUTCHER = 'BOSS_BUTCHER', // Onda 10: Golias Açougueiro Pestilento
  BOSS_NECROTITAN = 'BOSS_NECROTITAN', // Onda 15+: Necro-Titã Supremo

  // Alien Mode Enemies
  ALIEN_SCOUT = 'ALIEN_SCOUT',
  ALIEN_DRONE = 'ALIEN_DRONE',
  ALIEN_SHOOTER = 'ALIEN_SHOOTER',
  ALIEN_COLOSSUS = 'ALIEN_COLOSSUS',
  ALIEN_OVERLORD = 'ALIEN_OVERLORD', // Onda 5: Lorde Overlord Psíquico
  ALIEN_DREADNOUGHT = 'ALIEN_DREADNOUGHT', // Onda 10: Dreadnought Nave-Mãe
  ALIEN_LEVIATHAN = 'ALIEN_LEVIATHAN', // Onda 15+: Leviatã Cósmico Void
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
  isRocket?: boolean;
  isFlame?: boolean;
  isRay?: boolean;
  isLaser?: boolean;
  isEnemy?: boolean;
  isCosmic?: boolean;
  isMissile?: boolean;
  isBomb?: boolean;
  isVoidLance?: boolean;
  isShrapnel?: boolean;
  isOrb?: boolean;
  homingStrength?: number;
  flameSize?: number;
  flameMaxRadius?: number;
  smokeTimer?: number;
  weaponType?: WeaponType;
  isIgnite?: boolean;
  isVenom?: boolean;
  isHydra?: boolean;
  isChloroBall?: boolean;
  isVenomWave?: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'BLOOD' | 'SPARK' | 'CASING' | 'MUZZLE' | 'LEVEL_UP' | 'PLASMA_RING' | 'ENERGY_ARC' | 'SMOKE' | 'MUZZLE_FLARE' | 'FLAME' | 'FIRE_RING' | 'EXPLOSION' | 'RAY_RING' | 'ALIEN_PLASMA' | 'TOXIC_ACID' | 'ALIEN_BLOOD' | 'MYTHIC_NOVA';
  rotation?: number;
  rotSpeed?: number;
  growthSpeed?: number;
  points?: { x: number; y: number }[];
}

export interface BloodSplat {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
  angle?: number;
  stretch?: number;
}

export enum DropType {
  HEALTH = 'HEALTH',
  AMMO = 'AMMO',
  SHIELD = 'SHIELD',
  WEAPON_MAGNUM = 'WEAPON_MAGNUM',
  WEAPON_SHOTGUN = 'WEAPON_SHOTGUN',
  WEAPON_MACHINE_GUN = 'WEAPON_MACHINE_GUN',
  WEAPON_ASSAULT_RIFLE = 'WEAPON_ASSAULT_RIFLE',
  WEAPON_LMG = 'WEAPON_LMG',
  WEAPON_SNIPER = 'WEAPON_SNIPER',
  WEAPON_PLASMA_RIFLE = 'WEAPON_PLASMA_RIFLE',
  WEAPON_MINIGUN = 'WEAPON_MINIGUN',
  WEAPON_ROCKET_LAUNCHER = 'WEAPON_ROCKET_LAUNCHER',
  WEAPON_FLAMETHROWER = 'WEAPON_FLAMETHROWER',
  WEAPON_RAYGUN = 'WEAPON_RAYGUN',
  WEAPON_RAY_RIFLE = 'WEAPON_RAY_RIFLE',
  WEAPON_LASER_MINIGUN = 'WEAPON_LASER_MINIGUN',
  PISTOL_CLIP = 'PISTOL_CLIP',
  ESCAPE_KEY = 'ESCAPE_KEY',
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
  x: number; // -1 to 1
  y: number; // -1 to 1
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

export type ShipTypeKey = 'TROPER' | 'DESTRUCTOR' | 'INTERCEPTOR' | 'NAVE_REI';

export type MasteryNodeKind = 'PASSIVA' | 'HABILIDADE';

export interface MasteryNodeDefinition {
  id: string;
  ship: ShipTypeKey;
  title: string;
  kind: MasteryNodeKind;
  tier: 1 | 2 | 3 | 4;
  branch: 'center' | 'left' | 'right';
  requires: string[];
  cost: number;
  shortBonus: string;
  description: string;
  cooldownSec?: number;
}

export interface ShipMasteryProgress {
  xp: number;
  unlockedNodes: string[];
}

export type AllShipMasteryState = Record<ShipTypeKey, ShipMasteryProgress>;

