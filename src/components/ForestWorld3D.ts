/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  BloodSplat,
  Bullet,
  DropType,
  DyingState,
  GraphicsQuality,
  ItemDrop,
  Particle,
  Player,
  VoidDroneState,
  WeaponType,
  Zombie,
  ZombieType,
} from '../types';
import {
  DAY_NIGHT_CYCLE_SECONDS,
  DayNightState,
  GroundFootprint,
  SceneFlashLight,
  SpentCasing,
  getDayNightState,
  getFireballSprites,
  getLightSprites,
  getSmokeSprites,
} from './EnvironmentLighting';
import {
  FOREST_SIZE,
  createGrassTerrainTile,
} from './ForestWorld';
import {
  ISLAND_CENTER,
  ISLAND_WORLD_SIZE,
  MAX_SEABED_DEPTH,
  SEA_LEVEL_Y,
  createBeachSandTile,
  createIslandBathymetryDataArray,
  createOceanSurfaceDetailDataArray,
  getCoastlineSignedDistance,
  getEntitySwimPose,
  getIslandGroundY,
  getIslandPier,
  getIslandWalkableY,
  getOceanWaveHeight,
  getOceanWaveSlope,
  getWaterDepth,
} from './IslandTerrain';
import {
  EnterableHouse,
  WallMaterialKind,
  getEnterableHouses,
} from './BuildingsWorld';
import { renderOperatorBody } from './OperatorVisuals';
import { renderPlayerWeapon } from './WeaponVisuals';
import { renderBallZombie } from './ZombieVisuals';

export interface GraphicsPresetConfig {
  label: string;
  description: string;
  resolutionFactor: number;
  maxPixelRatio: number;
  shadows: boolean;
  shadowMapSize: number;
  maxSplats: number;
  maxFootprints: number;
  maxCasings: number;
  maxParticles: number;
  maxFlashLights: number;
  fireflies: boolean;
  headlampSpot: boolean;
  cameraFar: number;
  chunkPad: number;
  grassTuftsPerChunk: number;
}

export const GRAPHICS_PRESET_CONFIGS: Record<GraphicsQuality, GraphicsPresetConfig> = {
  ULTRA_LOW: {
    label: 'Muito Baixo',
    description: 'Máximo FPS · 50% res · sem sombras 3D',
    resolutionFactor: 0.5,
    maxPixelRatio: 0.55,
    shadows: false,
    shadowMapSize: 256,
    maxSplats: 14,
    maxFootprints: 8,
    maxCasings: 10,
    maxParticles: 36,
    maxFlashLights: 0,
    fireflies: false,
    headlampSpot: false,
    cameraFar: 1850,
    chunkPad: 80,
    grassTuftsPerChunk: 0,
  },
  LOW: {
    label: 'Baixo',
    description: 'Leve · 65% res · sombras simplificadas',
    resolutionFactor: 0.65,
    maxPixelRatio: 0.72,
    shadows: false,
    shadowMapSize: 512,
    maxSplats: 28,
    maxFootprints: 16,
    maxCasings: 18,
    maxParticles: 64,
    maxFlashLights: 1,
    fireflies: false,
    headlampSpot: true,
    cameraFar: 2100,
    chunkPad: 110,
    grassTuftsPerChunk: 18,
  },
  MEDIUM: {
    label: 'Médio',
    description: 'Balanceado · 82% res · sombras 3D',
    resolutionFactor: 0.82,
    maxPixelRatio: 1.0,
    shadows: true,
    shadowMapSize: 768,
    maxSplats: 52,
    maxFootprints: 28,
    maxCasings: 32,
    maxParticles: 110,
    maxFlashLights: 2,
    fireflies: true,
    headlampSpot: true,
    cameraFar: 2400,
    chunkPad: 150,
    grassTuftsPerChunk: 40,
  },
  HIGH: {
    label: 'Alto',
    description: 'Nitidez 100% · sombras HD 1280px',
    resolutionFactor: 1.0,
    maxPixelRatio: 1.5,
    shadows: true,
    shadowMapSize: 1280,
    maxSplats: 84,
    maxFootprints: 44,
    maxCasings: 56,
    maxParticles: 180,
    maxFlashLights: 2,
    fireflies: true,
    headlampSpot: true,
    cameraFar: 2700,
    chunkPad: 190,
    grassTuftsPerChunk: 64,
  },
};

export interface Scene3DFrameInput {
  player: Player;
  zombies: Zombie[];
  bullets: Bullet[];
  drops: ItemDrop[];
  particles: Particle[];
  splats: BloodSplat[];
  footprints: GroundFootprint[];
  casings: SpentCasing[];
  flashLights: SceneFlashLight[];
  voidDrones: VoidDroneState[];
  dyingState: DyingState;
  camera: {
    x: number;
    y: number;
    zoom: number;
    shake: number;
    trauma: number;
    roll: number;
    springX: number;
    springY: number;
  };
  viewportWidth: number;
  viewportHeight: number;
  weaponRecoil: number;
  muzzleFlashIntensity: number;
  mythicOrbitAngle: number;
  dayCycleTime: number;
  nowMs: number;
  dt: number;
  zombieHitFlashMap: Map<string, number>;
  visionConeEnabled: boolean;
}

const TILT_X = -Math.PI * 0.34; // ~ -61 deg tilt matching 2.5D diorama perspective
const CHUNK_SIZE = 320; // 10x10 chunks across 3200x3200 baseplate (5 studs per chunk)
const CHUNKS_PER_AXIS = FOREST_SIZE / CHUNK_SIZE;
const AIM_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -15);
const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _ndc = new THREE.Vector2();
const _rayHit = new THREE.Vector3();
const _cornerNdc = new THREE.Vector2();
const _cornerHit = new THREE.Vector3();
const _projVec = new THREE.Vector3();

function seededHash(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function createCanvasTexture(
  canvas: HTMLCanvasElement,
  isColor = true,
  anisotropy = 4
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

function isPointInVisionCone(
  originX: number,
  originY: number,
  aimAngle: number,
  targetX: number,
  targetY: number,
  coneHalfAngle = 0.68,
  maxRange = 760
): boolean {
  const dx = targetX - originX;
  const dy = targetY - originY;
  const distSq = dx * dx + dy * dy;
  if (distSq <= 95 * 95) return true;
  if (distSq > maxRange * maxRange) return false;
  let diff = Math.atan2(dy, dx) - aimAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) <= coneHalfAngle;
}

interface ZombieSpriteEntry {
  group: THREE.Group;
  card: THREE.Mesh;
  mat: THREE.MeshLambertMaterial;
  contactShadow: THREE.Mesh;
  shadowProxy: THREE.Mesh;
  hpBg: THREE.Mesh;
  hpFill: THREE.Mesh;
  hpMat: THREE.MeshBasicMaterial;
  fireRing: THREE.Mesh;
  stunRing: THREE.Mesh;
}

export class ForestDiorama3DRenderer {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly isSoftwareGl: boolean;

  private container: HTMLElement;
  private width = 1280;
  private height = 720;
  private graphicsQuality: GraphicsQuality;
  private preset: GraphicsPresetConfig;
  private renderScale: number;
  private maxAniso = 2;
  private disposed = false;
  private litMaterials: THREE.MeshLambertMaterial[] = [];

  // Island Landmass (chunked), 3D Grass Tufts, Chunked Animated Ocean, Coastal Pier, Buoys & 3D Houses
  private islandTerrainChunks: { mesh: THREE.Mesh; minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  private oceanChunks: { mesh: THREE.Mesh; minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  private abyssSeabedMesh!: THREE.Mesh;
  private islandDataTex!: THREE.DataTexture;
  private oceanDetailTex!: THREE.DataTexture;
  private oceanBuoys: { group: THREE.Group; x: number; z: number; seed: number }[] = [];
  private grassTuftChunks: { mesh: THREE.InstancedMesh; maxCount: number; minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  private houseEntries: {
    house: EnterableHouse;
    root: THREE.Group;
    roofGroup: THREE.Group;
    roofMaterials: THREE.MeshStandardMaterial[];
    roofShadowMeshes: THREE.Mesh[];
    wallShadowMeshes: THREE.Mesh[];
    glowMat: THREE.MeshBasicMaterial;
    roofOpacity: number;
  }[] = [];
  private housePointLights: THREE.PointLight[] = [];
  private spawnMesh!: THREE.Mesh;
  private visMinX = 0;
  private visMaxX = FOREST_SIZE;
  private visMinZ = 0;
  private visMaxZ = FOREST_SIZE;

  // Sky / Multi-Bounce Global Illumination / 3-Phase Sky PMREM IBL / Lights
  private envDayTarget: THREE.WebGLRenderTarget | null = null;
  private envGoldenTarget: THREE.WebGLRenderTarget | null = null;
  private envNightTarget: THREE.WebGLRenderTarget | null = null;
  private uLiquidTime = { value: 0 };
  private uOceanSunLevel = { value: 1.0 };
  private uOceanSunColor = { value: new THREE.Color(0xfffbeb) };
  private uWaterSunDir = { value: new THREE.Vector2(0.7, 0.5) };
  private uGiBounceColor = { value: new THREE.Color(0x5ea2b8) };
  private uSplashRipples = {
    value: Array.from({ length: 6 }, () => new THREE.Vector4(-99999, -99999, -999, 0)),
  };
  private splashCursor = 0;
  private bgColor = new THREE.Color(0x6ba5df);
  private fog: THREE.FogExp2;
  private hemiLight: THREE.HemisphereLight;
  private sunLight: THREE.DirectionalLight;
  private giBounceLight: THREE.DirectionalLight;
  private giTopSkyLight: THREE.DirectionalLight;
  private headlampSpot: THREE.SpotLight;
  private headlampConeMesh: THREE.Mesh;
  private headlampConeMat: THREE.MeshBasicMaterial;
  private flashPointLights: THREE.PointLight[] = [];

  // Player & Weapon Sprite Rig (cached textures - zero per-frame canvas redraw)
  private playerTextures = new Map<string, THREE.CanvasTexture>();
  private playerMat!: THREE.MeshLambertMaterial;
  private playerGroup: THREE.Group;
  private playerCard: THREE.Mesh;
  private playerShadowProxy: THREE.Mesh;
  private playerContactShadow: THREE.Mesh;
  private contactShadowMat!: THREE.MeshBasicMaterial;
  private weaponShadowGroup!: THREE.Group;
  private weaponStockProxy!: THREE.Mesh;
  private weaponBodyProxy!: THREE.Mesh;
  private weaponBarrelProxy!: THREE.Mesh;
  private weaponGroundShadowTextures = new Map<WeaponType, THREE.CanvasTexture>();
  private weaponGroundShadowMat!: THREE.MeshBasicMaterial;
  private weaponGroundShadow!: THREE.Mesh;
  private droppedWeaponTextures = new Map<WeaponType, THREE.CanvasTexture>();
  private droppedWeaponMat!: THREE.MeshLambertMaterial;
  private droppedWeaponMesh: THREE.Mesh;
  private droppedWeaponShadowMat!: THREE.MeshBasicMaterial;
  private droppedWeaponShadow!: THREE.Mesh;
  private droppedWeaponShadowProxy!: THREE.Mesh;
  private deathBloodPoolMesh: THREE.Mesh;

  // Mythic visuals around player
  private solarAuraMesh: THREE.Mesh;
  private singularityBladesGroup: THREE.Group;
  private droneMeshes: THREE.Mesh[] = [];

  // Zombie Sprite Cache & Pool
  private zombieTextures = new Map<string, THREE.CanvasTexture>();
  private zombiePool: ZombieSpriteEntry[] = [];
  private zombieActive = new Map<string, ZombieSpriteEntry>();
  private aliveZombieIds = new Set<string>();
  private zombieCardGeo = new THREE.PlaneGeometry(1, 1);
  private zombieProxyGeo = new THREE.SphereGeometry(0.75, 8, 6);
  private zombieHpGeo = new THREE.PlaneGeometry(1, 0.14);
  private zombieRingGeo = new THREE.RingGeometry(0.95, 1.08, 20);

  // Entity & FX Pools
  private dropTextures: Record<'HEALTH' | 'SHIELD', THREE.CanvasTexture>;
  private dropPool: { group: THREE.Group; card: THREE.Mesh; mat: THREE.MeshLambertMaterial; halo: THREE.Mesh; haloMat: THREE.MeshBasicMaterial }[] = [];

  private bulletTextures: Record<string, THREE.CanvasTexture> = {};
  private bulletPool: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];

  private splatTextures: Record<'BLOOD' | 'ACID' | 'CRATER', THREE.CanvasTexture>;
  private liquidBloodAlbedo: THREE.CanvasTexture[] = [];
  private liquidBloodNormal: THREE.CanvasTexture[] = [];
  private liquidAcidAlbedo!: THREE.CanvasTexture;
  private liquidAcidNormal!: THREE.CanvasTexture;
  private liquidSplatPool: { mesh: THREE.Mesh; mat: THREE.MeshPhysicalMaterial }[] = [];
  private splatPool: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];

  private decalGeo = new THREE.PlaneGeometry(1, 1);
  private footprintTex!: THREE.CanvasTexture;
  private footprintPool: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  private casingPool: { mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial }[] = [];

  private particleTextures: Record<string, THREE.CanvasTexture> = {};
  private particlePool: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  private arcLinePool: {
    line: THREE.Line;
    mat: THREE.LineBasicMaterial;
    buffer: Float32Array;
    attr: THREE.BufferAttribute;
  }[] = [];

  // Atmospheric Dust & Night Fireflies
  private fireflyPoints!: THREE.Points;
  private fireflyMat!: THREE.PointsMaterial;
  private fireflyCount = 56;
  private fireflySeeds: Float32Array;

  // Reusable raycaster
  private raycaster = new THREE.Raycaster();
  private texturesToDispose: THREE.Texture[] = [];
  private geometriesToDispose: THREE.BufferGeometry[] = [];
  private materialsToDispose: THREE.Material[] = [];

  constructor(container: HTMLElement, initialQuality: GraphicsQuality = 'MEDIUM') {
    this.container = container;
    this.width = Math.max(1, container.clientWidth || window.innerWidth);
    this.height = Math.max(1, container.clientHeight || window.innerHeight);
    this.graphicsQuality = initialQuality;
    this.preset = GRAPHICS_PRESET_CONFIGS[initialQuality] || GRAPHICS_PRESET_CONFIGS.MEDIUM;

    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const shadowsOn = !this.isSoftwareGl && this.preset.shadows;

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderScale = this.computeEffectivePixelRatio();
    this.renderer.setPixelRatio(this.renderScale);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.shadowMap.enabled = shadowsOn;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.className = 'cursor-crosshair touch-none';

    this.maxAniso = Math.min(2, this.renderer.capabilities.getMaxAnisotropy() || 1);
    container.appendChild(this.renderer.domElement);

    // Scene & Crisp Day/Night Sky + 3-Phase Procedural Sky/Ocean GI PMREM IBL
    this.scene = new THREE.Scene();
    this.scene.background = this.bgColor;
    this.fog = new THREE.FogExp2(0x6ba5df, 0.00012);
    this.scene.fog = this.fog;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envDayTarget = this.bakeSkyPmrem(pmrem, 0x2f7ef2, 0xa8e7ff, 0x1d685e, 0xfff8d6, 1.35);
    this.envGoldenTarget = this.bakeSkyPmrem(pmrem, 0x3f2e63, 0xff9a54, 0x452f29, 0xffb36b, 1.45);
    this.envNightTarget = this.bakeSkyPmrem(pmrem, 0x071226, 0x1e3c6b, 0x071a2c, 0xbfdbfe, 0.72);
    this.scene.environment = this.envDayTarget.texture;
    this.scene.environmentIntensity = 1.12;
    pmrem.dispose();

    // 2.5D Telephoto Diorama Perspective Camera (~62.5 deg downward pitch, tight far plane)
    this.camera = new THREE.PerspectiveCamera(34, this.width / this.height, 80, this.preset.cameraFar);

    // Multi-Bounce Outdoor Global Illumination Lighting Rig:
    // 1) Hemisphere Sky/Ocean-Grass Bounce
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x2d5438, 1.02);
    this.scene.add(this.hemiLight);

    // 2) Key Sun / Moon Directional Light (shadows)
    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.42);
    this.sunLight.castShadow = shadowsOn;
    this.sunLight.shadow.mapSize.width = this.preset.shadowMapSize;
    this.sunLight.shadow.mapSize.height = this.preset.shadowMapSize;
    this.sunLight.shadow.camera.near = 180;
    this.sunLight.shadow.camera.far = 1800;
    const d = 500;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0008;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 3) Indirect GI Counter-Bounce Light (simulates sunlight bouncing off ocean waves & island grass onto shadowed walls/sprites)
    this.giBounceLight = new THREE.DirectionalLight(0x7cc4df, 0.48);
    this.giBounceLight.castShadow = false;
    this.scene.add(this.giBounceLight);
    this.scene.add(this.giBounceLight.target);

    // 4) Overhead Zenith Skylight Soft GI Fill (prevents flat dark roofs/faces during dawn & dusk)
    this.giTopSkyLight = new THREE.DirectionalLight(0xbae6fd, 0.28);
    this.giTopSkyLight.castShadow = false;
    this.scene.add(this.giTopSkyLight);
    this.scene.add(this.giTopSkyLight.target);

    // Player tactical weapon headlamp spotlight
    this.headlampSpot = new THREE.SpotLight(0xfff4d6, 0, 900, 0.42, 0.55, 1.25);
    this.headlampSpot.castShadow = false;
    this.scene.add(this.headlampSpot);
    this.scene.add(this.headlampSpot.target);

    // Volumetric spotlight cone helper
    const coneGeo = new THREE.PlaneGeometry(360, 560);
    coneGeo.translate(0, 280, 0);
    this.headlampConeMat = new THREE.MeshBasicMaterial({
      map: this.createConeBeamTexture(),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.headlampConeMesh = new THREE.Mesh(coneGeo, this.headlampConeMat);
    this.headlampConeMesh.rotation.x = Math.PI / 2;
    this.scene.add(this.headlampConeMesh);
    this.geometriesToDispose.push(coneGeo);
    this.materialsToDispose.push(this.headlampConeMat);

    // Pooled dynamic flash lights (muzzle / explosions)
    for (let i = 0; i < 2; i++) {
      const pl = new THREE.PointLight(0xfbbf24, 0, 360, 1.5);
      this.scene.add(pl);
      this.flashPointLights.push(pl);
    }

    // Pooled warm interior lights for visible enterable houses
    for (let i = 0; i < 2; i++) {
      const hpl = new THREE.PointLight(0xffd28a, 0, 360, 1.35);
      hpl.castShadow = false;
      this.scene.add(hpl);
      this.housePointLights.push(hpl);
    }

    // Build static 3D Concrete Baseplate + 3D Enterable Houses
    this.buildStaticForestWorld();
    this.buildEnterableHouses();

    // Shared Contact Shadow Disc Material
    const contactTex = this.createContactShadowTexture();
    this.contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    this.texturesToDispose.push(contactTex);
    this.materialsToDispose.push(this.contactShadowMat);

    // Build Operator + Weapon 2.5D Sprite Rig (cached textures)
    this.playerGroup = new THREE.Group();
    const playerGeo = new THREE.PlaneGeometry(118, 118);
    this.playerMat = new THREE.MeshLambertMaterial({
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
    });
    this.playerCard = new THREE.Mesh(playerGeo, this.playerMat);
    this.playerCard.rotation.x = TILT_X;
    this.playerCard.position.y = 18;
    this.playerCard.renderOrder = 4;
    this.playerGroup.add(this.playerCard);
    this.litMaterials.push(this.playerMat);

    // Shadow caster proxy inside player (depth/shadow pass only)
    const pProxyGeo = new THREE.SphereGeometry(15, 10, 8);
    const pProxyMat = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: false,
      transparent: true,
      opacity: 0,
    });
    this.playerShadowProxy = new THREE.Mesh(pProxyGeo, pProxyMat);
    this.playerShadowProxy.position.y = 16;
    this.playerShadowProxy.castShadow = this.renderer.shadowMap.enabled;
    this.playerGroup.add(this.playerShadowProxy);

    // 3D Weapon Shadow Proxy Rig (casts realistic gun barrel/receiver/optic shadows onto Baseplate)
    const wBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    this.weaponShadowGroup = new THREE.Group();
    this.weaponShadowGroup.position.y = 20;
    this.weaponStockProxy = new THREE.Mesh(wBoxGeo, pProxyMat);
    this.weaponBodyProxy = new THREE.Mesh(wBoxGeo, pProxyMat);
    this.weaponBarrelProxy = new THREE.Mesh(wBoxGeo, pProxyMat);
    this.weaponStockProxy.castShadow = this.renderer.shadowMap.enabled;
    this.weaponBodyProxy.castShadow = this.renderer.shadowMap.enabled;
    this.weaponBarrelProxy.castShadow = this.renderer.shadowMap.enabled;
    this.weaponShadowGroup.add(this.weaponStockProxy, this.weaponBodyProxy, this.weaponBarrelProxy);
    this.playerGroup.add(this.weaponShadowGroup);

    // Soft contact shadow disc on ground
    const pContactGeo = new THREE.PlaneGeometry(44, 44);
    this.playerContactShadow = new THREE.Mesh(pContactGeo, this.contactShadowMat);
    this.playerContactShadow.rotation.x = -Math.PI / 2;
    this.playerContactShadow.position.y = 0.35;
    this.playerGroup.add(this.playerContactShadow);

    // Directional Ground Weapon Shadow (complements 3D shadow map & guarantees weapon shadow in low presets / software WebGL)
    this.weaponGroundShadowMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: this.renderer.shadowMap.enabled ? 0.28 : 0.58,
      depthWrite: false,
    });
    const wGroundGeo = new THREE.PlaneGeometry(116, 48);
    this.weaponGroundShadow = new THREE.Mesh(wGroundGeo, this.weaponGroundShadowMat);
    this.weaponGroundShadow.rotation.x = -Math.PI / 2;
    this.weaponGroundShadow.position.y = 0.37;
    this.scene.add(this.weaponGroundShadow);

    this.scene.add(this.playerGroup);
    this.geometriesToDispose.push(playerGeo, pProxyGeo, wBoxGeo, pContactGeo, wGroundGeo);
    this.materialsToDispose.push(this.playerMat, pProxyMat, this.weaponGroundShadowMat);

    // Dropped weapon & shadow + death blood pool
    this.droppedWeaponMat = new THREE.MeshLambertMaterial({
      transparent: true,
      alphaTest: 0.05,
    });
    this.litMaterials.push(this.droppedWeaponMat);
    const dwGeo = new THREE.PlaneGeometry(76, 76);
    this.droppedWeaponMesh = new THREE.Mesh(dwGeo, this.droppedWeaponMat);
    this.droppedWeaponMesh.rotation.x = -Math.PI / 2;
    this.droppedWeaponMesh.position.y = 5.5;
    this.droppedWeaponMesh.visible = false;
    this.scene.add(this.droppedWeaponMesh);

    this.droppedWeaponShadowMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: this.renderer.shadowMap.enabled ? 0.34 : 0.6,
      depthWrite: false,
    });
    this.droppedWeaponShadow = new THREE.Mesh(wGroundGeo, this.droppedWeaponShadowMat);
    this.droppedWeaponShadow.rotation.x = -Math.PI / 2;
    this.droppedWeaponShadow.position.y = 0.42;
    this.droppedWeaponShadow.visible = false;
    this.scene.add(this.droppedWeaponShadow);

    this.droppedWeaponShadowProxy = new THREE.Mesh(wBoxGeo, pProxyMat);
    this.droppedWeaponShadowProxy.scale.set(34, 5, 6);
    this.droppedWeaponShadowProxy.position.y = 5.5;
    this.droppedWeaponShadowProxy.castShadow = this.renderer.shadowMap.enabled;
    this.droppedWeaponShadowProxy.visible = false;
    this.scene.add(this.droppedWeaponShadowProxy);

    // Pre-bake glossy liquid blood/acid Albedo + Normal pairs BEFORE creating death pool
    for (let v = 0; v < 3; v++) {
      const pair = this.bakeLiquidPuddlePair('BLOOD', v);
      this.liquidBloodAlbedo.push(pair.albedo);
      this.liquidBloodNormal.push(pair.normal);
      this.texturesToDispose.push(pair.albedo, pair.normal);
    }
    const acidPair = this.bakeLiquidPuddlePair('ACID', 0);
    this.liquidAcidAlbedo = acidPair.albedo;
    this.liquidAcidNormal = acidPair.normal;
    this.texturesToDispose.push(acidPair.albedo, acidPair.normal);

    const bloodPoolMat = this.createLiquidPhysicalMaterial(
      this.liquidBloodAlbedo[0],
      this.liquidBloodNormal[0],
      false
    );
    const bloodPoolGeo = new THREE.PlaneGeometry(2.35, 2.35);
    this.deathBloodPoolMesh = new THREE.Mesh(bloodPoolGeo, bloodPoolMat);
    this.deathBloodPoolMesh.rotation.x = -Math.PI / 2;
    this.deathBloodPoolMesh.position.y = 0.34;
    this.deathBloodPoolMesh.visible = false;
    this.scene.add(this.deathBloodPoolMesh);
    this.geometriesToDispose.push(dwGeo, bloodPoolGeo);
    this.materialsToDispose.push(this.droppedWeaponMat, this.droppedWeaponShadowMat, bloodPoolMat);

    // Mythic Solar Corona + Singularity Blades + Void Drones
    const solarTex = this.createSolarAuraTexture();
    const solarMat = new THREE.MeshBasicMaterial({
      map: solarTex,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.solarAuraMesh = new THREE.Mesh(new THREE.PlaneGeometry(310, 310), solarMat);
    this.solarAuraMesh.rotation.x = -Math.PI / 2;
    this.solarAuraMesh.position.y = 1.4;
    this.solarAuraMesh.visible = false;
    this.scene.add(this.solarAuraMesh);

    const bladeTex = this.createBladeSpriteTexture();
    this.singularityBladesGroup = new THREE.Group();
    const bladeGeo = new THREE.PlaneGeometry(34, 34);
    for (let i = 0; i < 5; i++) {
      const bMat = new THREE.MeshBasicMaterial({
        map: bladeTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const bMesh = new THREE.Mesh(bladeGeo, bMat);
      bMesh.rotation.x = TILT_X;
      this.singularityBladesGroup.add(bMesh);
      this.materialsToDispose.push(bMat);
    }
    this.singularityBladesGroup.visible = false;
    this.scene.add(this.singularityBladesGroup);

    const droneTex = this.createDroneSpriteTexture();
    const droneGeo = new THREE.PlaneGeometry(30, 30);
    for (let i = 0; i < 3; i++) {
      const drMat = new THREE.MeshBasicMaterial({
        map: droneTex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const drMesh = new THREE.Mesh(droneGeo, drMat);
      drMesh.rotation.x = TILT_X;
      drMesh.visible = false;
      this.scene.add(drMesh);
      this.droneMeshes.push(drMesh);
      this.materialsToDispose.push(drMat);
    }
    this.texturesToDispose.push(solarTex, bladeTex, droneTex);
    this.materialsToDispose.push(solarMat);
    this.geometriesToDispose.push(bladeGeo, droneGeo);

    // Pre-bake drops, splats, boot tread, bullets & particle textures
    this.dropTextures = {
      HEALTH: createCanvasTexture(this.bakeDropCanvas(DropType.HEALTH), true, this.maxAniso),
      SHIELD: createCanvasTexture(this.bakeDropCanvas(DropType.SHIELD), true, this.maxAniso),
    };
    this.splatTextures = {
      BLOOD: this.liquidBloodAlbedo[0],
      ACID: this.liquidAcidAlbedo,
      CRATER: createCanvasTexture(this.bakeSplatCanvas('CRATER'), true, this.maxAniso),
    };
    this.footprintTex = this.createFootprintTexture();
    this.texturesToDispose.push(this.dropTextures.HEALTH, this.dropTextures.SHIELD, this.splatTextures.CRATER, this.footprintTex);
    this.bakeBulletTextures();
    this.bakeParticleTextures();

    // Pre-build Atmospheric Dust & Night Fireflies (tight radius around camera)
    this.fireflySeeds = new Float32Array(this.fireflyCount * 3);
    const ffPos = new Float32Array(this.fireflyCount * 3);
    for (let i = 0; i < this.fireflyCount; i++) {
      this.fireflySeeds[i * 3] = (seededHash(i * 17.3) - 0.5) * 1300;
      this.fireflySeeds[i * 3 + 1] = 16 + seededHash(i * 31.7) * 72;
      this.fireflySeeds[i * 3 + 2] = (seededHash(i * 53.1) - 0.5) * 980;
      ffPos[i * 3] = this.fireflySeeds[i * 3];
      ffPos[i * 3 + 1] = this.fireflySeeds[i * 3 + 1];
      ffPos[i * 3 + 2] = this.fireflySeeds[i * 3 + 2];
    }
    const ffGeo = new THREE.BufferGeometry();
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    const ffTex = this.createMoteTexture();
    this.fireflyMat = new THREE.PointsMaterial({
      size: 16,
      map: ffTex,
      color: 0xbef264,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.fireflyPoints = new THREE.Points(ffGeo, this.fireflyMat);
    this.fireflyPoints.frustumCulled = false;
    this.fireflyPoints.visible = this.preset.fireflies;
    this.scene.add(this.fireflyPoints);
    this.geometriesToDispose.push(ffGeo);
    this.materialsToDispose.push(this.fireflyMat);
    this.texturesToDispose.push(ffTex);

    // Pre-warm shaders when hardware WebGL is active
    if (!this.isSoftwareGl) {
      this.camera.position.set(FOREST_SIZE / 2, 980, FOREST_SIZE / 2 + 510);
      this.camera.lookAt(FOREST_SIZE / 2, 0, FOREST_SIZE / 2);
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private computeEffectivePixelRatio(): number {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const scaled = dpr * this.preset.resolutionFactor;
    const cap = this.isSoftwareGl ? Math.min(0.58, this.preset.maxPixelRatio) : this.preset.maxPixelRatio;
    return Math.max(0.45, Math.min(cap, scaled));
  }

  public getGraphicsQuality(): GraphicsQuality {
    return this.graphicsQuality;
  }

  public setGraphicsPreset(quality: GraphicsQuality): void {
    if (this.disposed) return;
    const nextPreset = GRAPHICS_PRESET_CONFIGS[quality] || GRAPHICS_PRESET_CONFIGS.MEDIUM;
    this.graphicsQuality = quality;
    this.preset = nextPreset;

    this.renderScale = this.computeEffectivePixelRatio();
    this.renderer.setPixelRatio(this.renderScale);
    this.renderer.setSize(this.width, this.height, false);

    if (this.camera.far !== nextPreset.cameraFar) {
      this.camera.far = nextPreset.cameraFar;
      this.camera.updateProjectionMatrix();
    }

    const shadowsOn = !this.isSoftwareGl && nextPreset.shadows;
    const shadowToggled = this.renderer.shadowMap.enabled !== shadowsOn;
    this.renderer.shadowMap.enabled = shadowsOn;
    this.sunLight.castShadow = shadowsOn;
    this.playerShadowProxy.castShadow = shadowsOn;
    this.weaponStockProxy.castShadow = shadowsOn;
    this.weaponBodyProxy.castShadow = shadowsOn;
    this.weaponBarrelProxy.castShadow = shadowsOn;
    this.droppedWeaponShadowProxy.castShadow = shadowsOn;

    for (let i = 0; i < this.houseEntries.length; i++) {
      const he = this.houseEntries[i];
      for (let w = 0; w < he.wallShadowMeshes.length; w++) {
        he.wallShadowMeshes[w].castShadow = shadowsOn;
      }
      for (let r = 0; r < he.roofShadowMeshes.length; r++) {
        he.roofShadowMeshes[r].castShadow = shadowsOn && he.roofOpacity > 0.45;
      }
    }

    if (
      this.sunLight.shadow.mapSize.width !== nextPreset.shadowMapSize ||
      this.sunLight.shadow.mapSize.height !== nextPreset.shadowMapSize
    ) {
      this.sunLight.shadow.mapSize.set(nextPreset.shadowMapSize, nextPreset.shadowMapSize);
      if (this.sunLight.shadow.map) {
        this.sunLight.shadow.map.dispose();
        this.sunLight.shadow.map = null;
      }
    }
    this.sunLight.shadow.needsUpdate = true;
    this.renderer.shadowMap.needsUpdate = true;

    if (shadowToggled) {
      for (let i = 0; i < this.litMaterials.length; i++) {
        this.litMaterials[i].needsUpdate = true;
      }
    }

    this.weaponGroundShadowMat.opacity = shadowsOn ? 0.28 : 0.58;
    this.droppedWeaponShadowMat.opacity = shadowsOn ? 0.34 : 0.6;

    if (!nextPreset.fireflies) {
      this.fireflyPoints.visible = false;
    }
    if (!nextPreset.headlampSpot) {
      this.headlampSpot.intensity = 0;
      this.headlampConeMesh.visible = false;
    }

    for (let i = 0; i < this.grassTuftChunks.length; i++) {
      const tc = this.grassTuftChunks[i];
      tc.mesh.count = Math.min(tc.maxCount, nextPreset.grassTuftsPerChunk);
    }
  }

  // =========================================================================
  // 3D ISLAND TERRAIN + REALISTIC ANIMATED OCEAN + WOODEN PIER & MARITIME BUOYS
  // =========================================================================
  private createGrassTuftGeometry(): THREE.BufferGeometry {
    // 5-blade organic 3D grass tuft with bottom-center pivot (y = 0) & root-to-tip shading
    const blades = 5;
    const positions = new Float32Array(blades * 9);
    const normals = new Float32Array(blades * 9);
    const colors = new Float32Array(blades * 9);

    for (let b = 0; b < blades; b++) {
      const ang = (b * Math.PI * 2) / blades + (b % 2) * 0.28;
      const spreadR = 2.6 + (b % 2) * 1.4;
      const tipR = spreadR + 3.4;
      const height = 11.5 + (b % 3) * 3.0;
      const baseW = 2.2;

      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      const px = -sin * baseW;
      const pz = cos * baseW;

      const cx = cos * spreadR * 0.35;
      const cz = sin * spreadR * 0.35;

      const baseIdx = b * 9;
      positions[baseIdx] = cx - px;
      positions[baseIdx + 1] = 0;
      positions[baseIdx + 2] = cz - pz;
      positions[baseIdx + 3] = cx + px;
      positions[baseIdx + 4] = 0;
      positions[baseIdx + 5] = cz + pz;
      positions[baseIdx + 6] = cos * tipR;
      positions[baseIdx + 7] = height;
      positions[baseIdx + 8] = sin * tipR;

      const nx = cos * 0.32;
      const ny = 0.9;
      const nz = sin * 0.32;
      for (let v = 0; v < 3; v++) {
        normals[baseIdx + v * 3] = nx;
        normals[baseIdx + v * 3 + 1] = ny;
        normals[baseIdx + v * 3 + 2] = nz;
      }

      colors[baseIdx] = 0.48;
      colors[baseIdx + 1] = 0.65;
      colors[baseIdx + 2] = 0.36;
      colors[baseIdx + 3] = 0.48;
      colors[baseIdx + 4] = 0.65;
      colors[baseIdx + 5] = 0.36;
      colors[baseIdx + 6] = 0.96;
      colors[baseIdx + 7] = 1.0;
      colors[baseIdx + 8] = 0.72;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }

  private bakeSkyPmrem(
    pmrem: THREE.PMREMGenerator,
    zenithHex: number,
    horizonHex: number,
    groundHex: number,
    sunHex: number,
    sunPower: number
  ): THREE.WebGLRenderTarget {
    const skyScene = new THREE.Scene();
    const domeGeo = new THREE.SphereGeometry(28, 20, 14);
    const domeMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uZenith: { value: new THREE.Color(zenithHex) },
        uHorizon: { value: new THREE.Color(horizonHex) },
        uGround: { value: new THREE.Color(groundHex) },
        uSun: { value: new THREE.Color(sunHex) },
        uSunPower: { value: sunPower },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uZenith;
        uniform vec3 uHorizon;
        uniform vec3 uGround;
        uniform vec3 uSun;
        uniform float uSunPower;
        varying vec3 vDir;
        void main() {
          float y = vDir.y;
          vec3 skyCol = mix(uHorizon, uZenith, pow(clamp(y, 0.0, 1.0), 0.58));
          vec3 col = y >= 0.0 ? skyCol : mix(uHorizon * 0.85, uGround, pow(clamp(-y, 0.0, 1.0), 0.45));
          vec3 sunDir = normalize(vec3(0.45, 0.68, 0.58));
          float sunDot = max(0.0, dot(normalize(vDir), sunDir));
          col += uSun * (pow(sunDot, 24.0) * 1.15 + pow(sunDot, 4.0) * 0.18) * uSunPower;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    skyScene.add(dome);
    const rt = pmrem.fromScene(skyScene, 0.04);
    domeGeo.dispose();
    domeMat.dispose();
    return rt;
  }

  public triggerWaterRipple(worldX: number, worldZ: number, strength = 1.0): void {
    if (this.disposed) return;
    if (getWaterDepth(worldX, worldZ) <= 0.15 && getCoastlineSignedDistance(worldX, worldZ) < -18) return;
    const slot = this.uSplashRipples.value[this.splashCursor];
    slot.set(worldX, worldZ, this.uLiquidTime.value, Math.max(0.25, Math.min(2.2, strength)));
    this.splashCursor = (this.splashCursor + 1) % this.uSplashRipples.value.length;
  }

  private buildStaticForestWorld(): void {
    // 1. Baked Island Bathymetry & Coastline Data Texture (shared between Island Terrain & Ocean Water)
    const dataSize = 256;
    const rawData = createIslandBathymetryDataArray(dataSize);
    this.islandDataTex = new THREE.DataTexture(rawData, dataSize, dataSize, THREE.RGBAFormat);
    this.islandDataTex.colorSpace = THREE.NoColorSpace;
    this.islandDataTex.minFilter = THREE.LinearFilter;
    this.islandDataTex.magFilter = THREE.LinearFilter;
    this.islandDataTex.wrapS = THREE.ClampToEdgeWrapping;
    this.islandDataTex.wrapT = THREE.ClampToEdgeWrapping;
    this.islandDataTex.flipY = false;
    this.islandDataTex.needsUpdate = true;

    // 1b. Seamless GPU Tileable Ocean Ripple Normal & Lacy Seafoam DataTexture (replaces costly fragment trig!)
    const detailSize = 128;
    const detailRaw = createOceanSurfaceDetailDataArray(detailSize);
    this.oceanDetailTex = new THREE.DataTexture(detailRaw, detailSize, detailSize, THREE.RGBAFormat);
    this.oceanDetailTex.colorSpace = THREE.NoColorSpace;
    this.oceanDetailTex.minFilter = THREE.LinearMipmapLinearFilter;
    this.oceanDetailTex.magFilter = THREE.LinearFilter;
    this.oceanDetailTex.generateMipmaps = true;
    this.oceanDetailTex.wrapS = THREE.RepeatWrapping;
    this.oceanDetailTex.wrapT = THREE.RepeatWrapping;
    this.oceanDetailTex.needsUpdate = true;

    // 2. Seamless Grass Meadow & Golden Beach Sand Textures
    const grassTex = createCanvasTexture(createGrassTerrainTile(), true, this.maxAniso);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;

    const sandTex = createCanvasTexture(createBeachSandTile(), true, this.maxAniso);
    sandTex.wrapS = THREE.RepeatWrapping;
    sandTex.wrapT = THREE.RepeatWrapping;

    const uTime = this.uLiquidTime;
    const uIslandData = { value: this.islandDataTex };
    const uOceanDetail = { value: this.oceanDetailTex };
    const uGrassTex = { value: grassTex };
    const uSandTex = { value: sandTex };
    const uWorldSize = { value: ISLAND_WORLD_SIZE };
    const uGiBounce = this.uGiBounceColor;

    // 3. Spatial 4x4 Chunked 3D Island Terrain (culls off-screen terrain chunks & avoids coastline vertex bloat)
    const islandMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
    });
    islandMat.customProgramCacheKey = () => 'island-terrain-splat-gi-v2';
    islandMat.onBeforeCompile = (shader) => {
      shader.uniforms.uLiquidTime = uTime;
      shader.uniforms.uIslandDataMap = uIslandData;
      shader.uniforms.uOceanDetailMap = uOceanDetail;
      shader.uniforms.uGrassMap = uGrassTex;
      shader.uniforms.uSandMap = uSandTex;
      shader.uniforms.uWorldSize = uWorldSize;
      shader.uniforms.uGiBounceColor = uGiBounce;

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          varying vec2 vIslandWorldXZ;
          varying vec2 vIslandUv;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec4 islandWp = modelMatrix * vec4(transformed, 1.0);
          vIslandWorldXZ = islandWp.xz;
          vIslandUv = clamp(islandWp.xz / ${ISLAND_WORLD_SIZE.toFixed(1)}, 0.002, 0.998);`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uLiquidTime;
          uniform sampler2D uIslandDataMap;
          uniform sampler2D uOceanDetailMap;
          uniform sampler2D uGrassMap;
          uniform sampler2D uSandMap;
          uniform float uWorldSize;
          uniform vec3 uGiBounceColor;
          varying vec2 vIslandWorldXZ;
          varying vec2 vIslandUv;`
        )
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          vec4 iData = texture2D(uIslandDataMap, vIslandUv);
          float shoreNorm = iData.r;
          float depthNorm = iData.g;
          float sandWeight = iData.b;

          vec3 grassSample = texture2D(uGrassMap, vIslandWorldXZ / 320.0).rgb;
          vec3 sandSample = texture2D(uSandMap, vIslandWorldXZ / 220.0).rgb;

          // Dry coastal dune fringe -> golden beach sand
          vec3 terrainCol = mix(grassSample, sandSample, sandWeight);

          // Wet swash zone darkening right along lapping waterline
          float wetBand = smoothstep(0.57, 0.50, shoreNorm) * smoothstep(0.36, 0.48, shoreNorm);
          terrainCol = mix(terrainCol, terrainCol * vec3(0.58, 0.54, 0.48), wetBand * 0.78);

          // Fast texture-driven underwater caustics in sunlit shallows (skipped in deep water)
          if (depthNorm > 0.001) {
            float cFade = 1.0 - smoothstep(0.04, 0.52, depthNorm);
            vec3 shoalTint = mix(terrainCol, vec3(0.30, 0.62, 0.64), smoothstep(0.0, 0.45, depthNorm));
            if (cFade > 0.02) {
              float cTex = texture2D(uOceanDetailMap, vIslandWorldXZ * 0.0085 + vec2(uLiquidTime * 0.024, -uLiquidTime * 0.018)).b;
              shoalTint += vec3(0.24, 0.34, 0.28) * cTex * cFade * 0.65;
            }
            terrainCol = mix(shoalTint, vec3(0.03, 0.11, 0.20), smoothstep(0.35, 0.92, depthNorm));
          } else {
            // Subtle coastal ocean sky bounce GI tint along sunlit beach sand
            terrainCol += uGiBounceColor * (sandWeight * 0.06);
          }
          diffuseColor.rgb *= terrainCol;`
        );
    };
    this.litMaterials.push(islandMat);

    const gridN = 4;
    const terrainChunkSize = ISLAND_WORLD_SIZE / gridN;
    for (let cz = 0; cz < gridN; cz++) {
      for (let cx = 0; cx < gridN; cx++) {
        const minX = cx * terrainChunkSize;
        const minZ = cz * terrainChunkSize;
        const chunkCx = minX + terrainChunkSize * 0.5;
        const chunkCz = minZ + terrainChunkSize * 0.5;
        const chunkGeo = new THREE.PlaneGeometry(terrainChunkSize, terrainChunkSize, 22, 22);
        chunkGeo.rotateX(-Math.PI / 2);

        const posAttr = chunkGeo.attributes.position as THREE.BufferAttribute;
        const normAttr = chunkGeo.attributes.normal as THREE.BufferAttribute;
        let maxY = -999;
        for (let i = 0; i < posAttr.count; i++) {
          const wx = chunkCx + posAttr.getX(i);
          const wz = chunkCz + posAttr.getZ(i);
          const gy = getIslandGroundY(wx, wz);
          if (gy > maxY) maxY = gy;
          posAttr.setY(i, gy);

          // Seamless world-space finite difference normal across chunk boundaries
          const hL = getIslandGroundY(wx - 4, wz);
          const hR = getIslandGroundY(wx + 4, wz);
          const hD = getIslandGroundY(wx, wz - 4);
          const hU = getIslandGroundY(wx, wz + 4);
          const nx = hL - hR;
          const nz = hD - hU;
          const ny = 8;
          const invL = 1 / Math.hypot(nx, ny, nz);
          normAttr.setXYZ(i, nx * invL, ny * invL, nz * invL);
        }
        posAttr.needsUpdate = true;
        normAttr.needsUpdate = true;

        const tMesh = new THREE.Mesh(chunkGeo, islandMat);
        tMesh.position.set(chunkCx, 0, chunkCz);
        tMesh.receiveShadow = maxY > SEA_LEVEL_Y - 12;
        this.scene.add(tMesh);
        this.geometriesToDispose.push(chunkGeo);
        this.islandTerrainChunks.push({
          mesh: tMesh,
          minX,
          maxX: minX + terrainChunkSize,
          minZ,
          maxZ: minZ + terrainChunkSize,
        });
      }
    }

    // 4. Outer Deep Horizon Seabed Floor (prevents seeing empty void past the island terrain)
    const abyssGeo = new THREE.PlaneGeometry(11600, 11600);
    abyssGeo.rotateX(-Math.PI / 2);
    const abyssMat = new THREE.MeshBasicMaterial({ color: 0x05182d });
    this.abyssSeabedMesh = new THREE.Mesh(abyssGeo, abyssMat);
    this.abyssSeabedMesh.position.set(ISLAND_CENTER, SEA_LEVEL_Y - MAX_SEABED_DEPTH - 0.5, ISLAND_CENTER);
    this.scene.add(this.abyssSeabedMesh);

    // 5. Fast Single-Pass PBR Ocean Surface (Chunked 4x4 Nearshore + Low-Poly Outer Horizon Skirt)
    // Uses MeshStandardMaterial (FrontSide, no Clearcoat 2x IBL pass) + texture micro-ripples + GPU splash rings!
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.085,
      metalness: 0.14,
      envMapIntensity: 1.9,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.FrontSide,
    });
    const uSunLevel = this.uOceanSunLevel;
    const uSunColor = this.uOceanSunColor;
    const uSunDir = this.uWaterSunDir;
    const uRipples = this.uSplashRipples;
    oceanMat.customProgramCacheKey = () => 'ocean-surface-gerstner-gi-v2';
    oceanMat.onBeforeCompile = (shader) => {
      shader.uniforms.uLiquidTime = uTime;
      shader.uniforms.uIslandDataMap = uIslandData;
      shader.uniforms.uOceanDetailMap = uOceanDetail;
      shader.uniforms.uWorldSize = uWorldSize;
      shader.uniforms.uOceanSunLevel = uSunLevel;
      shader.uniforms.uOceanSunColor = uSunColor;
      shader.uniforms.uWaterSunDir = uSunDir;
      shader.uniforms.uSplashRipples = uRipples;

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uLiquidTime;
          uniform sampler2D uIslandDataMap;
          uniform float uWorldSize;
          varying vec2 vOceanWorldXZ;
          varying float vWaveCrest;
          varying vec2 vWaveSlope;`
        )
        .replace(
          '#include <beginnormal_vertex>',
          `#include <beginnormal_vertex>
          vec2 wXZ = (modelMatrix * vec4(position, 1.0)).xz;
          vec2 bMaskV = step(vec2(0.0), wXZ) * step(wXZ, vec2(uWorldSize));
          float validV = bMaskV.x * bMaskV.y;
          float dNormV = mix(1.0, texture2D(uIslandDataMap, clamp(wXZ / uWorldSize, 0.002, 0.998)).g, validV);
          float shoreDamp = clamp(dNormV * 6.0, 0.0, 1.0);
          float shoalBoost = 1.0 + 0.25 * (1.0 - clamp(dNormV * 1.8, 0.0, 1.0)) * shoreDamp;

          float p1 = wXZ.x * 0.017 + wXZ.y * 0.008 + uLiquidTime * 1.45;
          float p2 = wXZ.x * 0.011 - wXZ.y * 0.019 + uLiquidTime * 1.15;
          float p3 = wXZ.x * 0.029 + wXZ.y * 0.025 - uLiquidTime * 2.05;

          float dhdx = (cos(p1) * 0.0178 - sin(p2) * 0.0079 + cos(p3) * 0.0098) * shoreDamp;
          float dhdz = (cos(p1) * 0.0084 + sin(p2) * 0.0136 + cos(p3) * 0.0085) * shoreDamp;
          objectNormal = normalize(vec3(-dhdx, 1.0, -dhdz));
          vWaveSlope = vec2(dhdx, dhdz);`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vOceanWorldXZ = wXZ;
          float s1 = sin(p1);
          float crest = (s1 + 0.22 * (s1 * s1 - 0.5)) * 1.05 + cos(p2) * 0.72 + sin(p3) * 0.34;
          float waveY = crest * shoreDamp * shoalBoost;
          vWaveCrest = waveY;
          transformed.y += waveY;`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uLiquidTime;
          uniform sampler2D uIslandDataMap;
          uniform sampler2D uOceanDetailMap;
          uniform float uWorldSize;
          uniform float uOceanSunLevel;
          uniform vec3 uOceanSunColor;
          uniform vec2 uWaterSunDir;
          uniform vec4 uSplashRipples[6];
          varying vec2 vOceanWorldXZ;
          varying float vWaveCrest;
          varying vec2 vWaveSlope;`
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          vec2 inB = step(vec2(0.0), vOceanWorldXZ) * step(vOceanWorldXZ, vec2(uWorldSize));
          float validF = inB.x * inB.y;
          vec4 oData = texture2D(uIslandDataMap, clamp(vOceanWorldXZ / uWorldSize, 0.002, 0.998));
          float depthNormF = mix(1.0, oData.g, validF);
          float shoreSigned = mix(-1.0, oData.r * 2.0 - 1.0, validF);

          // Sample tileable GPU normal + lacy bubble texture (2 reads, zero fragment sin/cos!)
          vec3 detA = texture2D(uOceanDetailMap, vOceanWorldXZ * 0.0052 + vec2(uLiquidTime * 0.024, uLiquidTime * 0.015)).rgb;
          vec3 detB = texture2D(uOceanDetailMap, vOceanWorldXZ * 0.0094 + vec2(-uLiquidTime * 0.019, uLiquidTime * 0.027)).rgb;

          // Tropical turquoise shallows -> rich cerulean shelf -> deep pelagic sapphire
          vec3 shallowCol = vec3(0.14, 0.80, 0.76);
          vec3 midCol = vec3(0.02, 0.45, 0.67);
          vec3 deepCol = vec3(0.02, 0.14, 0.30);

          vec3 waterBody = mix(shallowCol, midCol, smoothstep(0.0, 0.38, depthNormF));
          waterBody = mix(waterBody, deepCol, smoothstep(0.32, 0.92, depthNormF));

          // Subsurface scattering emerald-turquoise glow inside sunlit wave crests
          float sssGlow = clamp(vWaveCrest * 0.55, 0.0, 1.0) * (0.25 + 0.75 * uOceanSunLevel);
          waterBody += vec3(0.06, 0.32, 0.30) * sssGlow;

          // Modulate water hue naturally across Dawn / Day / Sunset / Moonlit Night
          float lumScale = 0.30 + 0.70 * uOceanSunLevel;
          waterBody *= mix(vec3(0.64, 0.76, 0.98), uOceanSunColor * 1.05, uOceanSunLevel) * lumScale;

          // Interactive concentric water splash ripples (distort surface & add subtle wake foam)
          vec2 splashGrad = vec2(0.0);
          float splashFoam = 0.0;
          for (int i = 0; i < 6; i++) {
            vec4 sr = uSplashRipples[i];
            float age = uLiquidTime - sr.z;
            if (age > 0.0 && age < 2.2 && sr.w > 0.01) {
              vec2 dVec = vOceanWorldXZ - sr.xy;
              float dist = length(dVec) + 0.001;
              float ringR = age * 92.0;
              float band = exp(-abs(dist - ringR) * 0.075) * exp(-age * 1.45) * sr.w;
              float ringWave = sin((dist - ringR) * 0.34);
              splashGrad += (dVec / dist) * (ringWave * band * 0.42);
              splashFoam += max(0.0, ringWave) * band * 0.48;
            }
          }

          // Directional Solar/Lunar Specular Glitter Path across wave ripples
          vec2 microSlope = ((detA.rg - 0.5) + (detB.rg - 0.5)) * 0.48 + splashGrad;
          vec2 waveTilt = vWaveSlope * 14.0 + microSlope;
          float sunGlint = pow(max(0.0, dot(normalize(vec2(-waveTilt.x, -waveTilt.y + 0.35)), normalize(uWaterSunDir + vec2(0.001)))), 14.0);
          waterBody += uOceanSunColor * sunGlint * (0.14 + 0.28 * uOceanSunLevel) * smoothstep(0.04, 0.3, depthNormF);

          // Rolling coastal surf waves & lacy bubble seafoam along exact beach contour
          float foamJitter = (detA.b - 0.5) * 0.028;
          float shoreBand = shoreSigned + foamJitter;
          float surfPulse = sin(shoreBand * 72.0 - uLiquidTime * 2.9);
          float surfZone = smoothstep(-0.17, -0.012, shoreBand) * (1.0 - smoothstep(0.01, 0.045, shoreBand));
          float crestFoam = smoothstep(0.32, 0.90, surfPulse) * surfZone;
          float shorelineEdgeFoam = smoothstep(-0.042, 0.0, shoreBand) * (1.0 - smoothstep(0.0, 0.032, shoreBand));
          float microBubble = clamp(detA.b * 0.65 + detB.b * 0.55, 0.0, 1.0);
          float foamMask = clamp(shorelineEdgeFoam * 0.88 + crestFoam * (0.45 + 0.55 * microBubble) + splashFoam, 0.0, 1.0);

          vec3 foamCol = mix(vec3(0.55, 0.68, 0.82), vec3(0.95, 0.98, 1.0), 0.35 + 0.65 * uOceanSunLevel);
          diffuseColor.rgb = mix(waterBody, foamCol, foamMask);

          // Transparent shallow shoals fading softly onto wet sand -> richer deep sea alpha
          float landFeather = 1.0 - smoothstep(-0.005, 0.034, shoreBand);
          float depthAlpha = mix(0.44, 0.90, smoothstep(0.0, 0.55, depthNormF));
          diffuseColor.a = clamp(mix(depthAlpha, 0.95, foamMask) * landFeather, 0.0, 0.96);`
        )
        .replace(
          '#include <normal_fragment_maps>',
          `#include <normal_fragment_maps>
          vec3 rippleW = normalize(vec3(microSlope.x * 0.65, 1.0, microSlope.y * 0.65));
          normal = normalize(mix(normal, normalize((viewMatrix * vec4(rippleW, 0.0)).xyz), 0.42));`
        );
    };

    // Build 4x4 frustum-culled nearshore ocean chunks covering [0..4160]
    for (let cz = 0; cz < gridN; cz++) {
      for (let cx = 0; cx < gridN; cx++) {
        const minX = cx * terrainChunkSize;
        const minZ = cz * terrainChunkSize;
        const chunkCx = minX + terrainChunkSize * 0.5;
        const chunkCz = minZ + terrainChunkSize * 0.5;
        const oGeo = new THREE.PlaneGeometry(terrainChunkSize, terrainChunkSize, 22, 22);
        oGeo.rotateX(-Math.PI / 2);
        const oMesh = new THREE.Mesh(oGeo, oceanMat);
        oMesh.position.set(chunkCx, SEA_LEVEL_Y, chunkCz);
        oMesh.renderOrder = 6;
        this.scene.add(oMesh);
        this.geometriesToDispose.push(oGeo);
        this.oceanChunks.push({
          mesh: oMesh,
          minX,
          maxX: minX + terrainChunkSize,
          minZ,
          maxZ: minZ + terrainChunkSize,
        });
      }
    }

    // Build 8 low-poly outer deep ocean horizon tiles extending out to [-3600 .. +7760]
    const padOuter = 3600;
    const outerSpecs: [number, number, number, number][] = [
      [-padOuter, 0, -padOuter, ISLAND_WORLD_SIZE + padOuter],
      [ISLAND_WORLD_SIZE, ISLAND_WORLD_SIZE + padOuter, -padOuter, ISLAND_WORLD_SIZE + padOuter],
      [0, ISLAND_WORLD_SIZE, -padOuter, 0],
      [0, ISLAND_WORLD_SIZE, ISLAND_WORLD_SIZE, ISLAND_WORLD_SIZE + padOuter],
    ];
    for (let oi = 0; oi < outerSpecs.length; oi++) {
      const [minX, maxX, minZ, maxZ] = outerSpecs[oi];
      const w = maxX - minX;
      const d = maxZ - minZ;
      const oGeo = new THREE.PlaneGeometry(w, d, 10, 10);
      oGeo.rotateX(-Math.PI / 2);
      const oMesh = new THREE.Mesh(oGeo, oceanMat);
      oMesh.position.set((minX + maxX) * 0.5, SEA_LEVEL_Y, (minZ + maxZ) * 0.5);
      oMesh.renderOrder = 6;
      this.scene.add(oMesh);
      this.geometriesToDispose.push(oGeo);
      this.oceanChunks.push({ mesh: oMesh, minX, maxX, minZ, maxZ });
    }

    // 6. Chunked 3D Wind-Swaying Grass Tufts (strictly placed on flat inland meadow grass)
    const tuftGeo = this.createGrassTuftGeometry();
    const tuftMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      vertexColors: true,
      side: THREE.DoubleSide,
    });
    tuftMat.customProgramCacheKey = () => 'grass-wind-v1';
    tuftMat.onBeforeCompile = (shader) => {
      shader.uniforms.uLiquidTime = uTime;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uLiquidTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
          float windPhase = instanceMatrix[3][0] * 0.035 + instanceMatrix[3][2] * 0.028;
          transformed.x += sin(uLiquidTime * 2.1 + windPhase) * (position.y * 0.14);
          transformed.z += cos(uLiquidTime * 1.7 + windPhase) * (position.y * 0.08);
          #endif`
        );
    };
    this.litMaterials.push(tuftMat);

    const houses = getEnterableHouses();
    const isBlockedForGrass = (wx: number, wz: number): boolean => {
      // Never place grass on sandy beach or underwater
      if (getCoastlineSignedDistance(wx, wz) > -142) return true;
      // Keep center spawn pad clear
      if ((wx - ISLAND_CENTER) ** 2 + (wz - ISLAND_CENTER) ** 2 < 118 * 118) return true;
      // Keep houses & door porch aprons clear of tall grass
      for (let h = 0; h < houses.length; h++) {
        const house = houses[h];
        if (
          wx >= house.minX - 24 &&
          wx <= house.maxX + 24 &&
          wz >= house.minZ - 24 &&
          wz <= house.maxZ + 24
        ) {
          return true;
        }
      }
      return false;
    };

    const maxTuftsCap = 64;
    const dummy = new THREE.Object3D();
    const tuftColor = new THREE.Color();
    const tuftPalette = [0x5a8c3c, 0x4c7c32, 0x6ea348, 0x76ab50, 0x44702d];

    for (let gz = 0; gz < CHUNKS_PER_AXIS; gz++) {
      for (let gx = 0; gx < CHUNKS_PER_AXIS; gx++) {
        const minX = gx * CHUNK_SIZE;
        const minZ = gz * CHUNK_SIZE;
        const inst = new THREE.InstancedMesh(tuftGeo, tuftMat, maxTuftsCap);
        let placed = 0;
        for (let t = 0; t < maxTuftsCap * 2 && placed < maxTuftsCap; t++) {
          const seed = gz * 997 + gx * 131 + t * 17.3;
          const wx = minX + 12 + seededHash(seed) * (CHUNK_SIZE - 24);
          const wz = minZ + 12 + seededHash(seed + 41.7) * (CHUNK_SIZE - 24);
          if (isBlockedForGrass(wx, wz)) continue;

          const s = 0.8 + seededHash(seed + 73.1) * 0.45;
          dummy.position.set(wx, 0, wz);
          dummy.rotation.set(0, seededHash(seed + 19.4) * Math.PI * 2, 0);
          dummy.scale.set(s, 0.85 + seededHash(seed + 55.2) * 0.4, s);
          dummy.updateMatrix();
          inst.setMatrixAt(placed, dummy.matrix);
          tuftColor.setHex(tuftPalette[placed % tuftPalette.length]);
          inst.setColorAt(placed, tuftColor);
          placed++;
        }
        if (placed > 0) {
          inst.instanceMatrix.needsUpdate = true;
          if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
          inst.computeBoundingSphere();
          inst.count = Math.min(placed, this.preset.grassTuftsPerChunk);
          inst.visible = inst.count > 0;
          this.scene.add(inst);
          this.grassTuftChunks.push({
            mesh: inst,
            maxCount: placed,
            minX,
            maxX: minX + CHUNK_SIZE,
            minZ,
            maxZ: minZ + CHUNK_SIZE,
          });
        }
      }
    }

    // 7. Natural Stone Clearing Spawn Pad at Island Center
    const spawnTex = createCanvasTexture(this.bakeSpawnPadTexture(), true, this.maxAniso);
    const spawnGeo = new THREE.PlaneGeometry(220, 220);
    const spawnMat = new THREE.MeshLambertMaterial({
      map: spawnTex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.litMaterials.push(spawnMat);
    this.spawnMesh = new THREE.Mesh(spawnGeo, spawnMat);
    this.spawnMesh.rotation.x = -Math.PI / 2;
    this.spawnMesh.position.set(ISLAND_CENTER, 0.2, ISLAND_CENTER);
    this.spawnMesh.receiveShadow = true;
    this.scene.add(this.spawnMesh);

    // 8. Composite Wooden Coastal Pier / Dock + Harbor Lantern + Outer Maritime Swim Buoys
    this.buildCoastalPier();
    this.buildOceanBuoys();

    this.texturesToDispose.push(this.islandDataTex, this.oceanDetailTex, grassTex, sandTex, spawnTex);
    this.geometriesToDispose.push(abyssGeo, tuftGeo, spawnGeo);
    this.materialsToDispose.push(islandMat, abyssMat, oceanMat, tuftMat, spawnMat);
  }

  private buildCoastalPier(): void {
    const pier = getIslandPier();
    const shadowsOn = this.renderer.shadowMap.enabled;
    const group = new THREE.Group();

    const plankMat = new THREE.MeshStandardMaterial({
      color: 0x8a6443,
      roughness: 0.86,
      metalness: 0.04,
    });
    const pilingMat = new THREE.MeshStandardMaterial({
      color: 0x4b3321,
      roughness: 0.92,
      metalness: 0.02,
    });
    const cleatMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.6,
    });
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

    // Support pilings anchored into sandy seabed
    const pilingGeo = new THREE.CylinderGeometry(5.5, 6.2, 32, 8);
    const pierLen = pier.endZ - pier.startZ;
    const bays = 4;
    for (let i = 0; i <= bays; i++) {
      const pz = pier.startZ + (pierLen * i) / bays;
      for (const side of [-1, 1]) {
        const piling = new THREE.Mesh(pilingGeo, pilingMat);
        piling.position.set(pier.cx + side * (pier.width * 0.42), pier.deckY - 12, pz);
        piling.castShadow = shadowsOn;
        piling.receiveShadow = true;
        group.add(piling);
      }
    }

    // Side structural stringer beams
    const stringerGeo = new THREE.BoxGeometry(6, 5, pierLen);
    for (const side of [-1, 1]) {
      const str = new THREE.Mesh(stringerGeo, pilingMat);
      str.position.set(pier.cx + side * (pier.width * 0.42), pier.deckY - 2.5, (pier.startZ + pier.endZ) * 0.5);
      str.receiveShadow = true;
      group.add(str);
    }

    // Individual weathered transverse deck planks
    const plankCount = 14;
    const plankStep = pierLen / plankCount;
    const plankGeo = new THREE.BoxGeometry(pier.width, 2.4, plankStep - 2.4);
    for (let i = 0; i < plankCount; i++) {
      const plank = new THREE.Mesh(plankGeo, plankMat);
      plank.position.set(pier.cx, pier.deckY - 1.1, pier.startZ + (i + 0.5) * plankStep);
      plank.receiveShadow = true;
      plank.castShadow = shadowsOn;
      group.add(plank);
    }

    // Mooring bollards & harbor lantern post at pier end
    const bollardGeo = new THREE.CylinderGeometry(3.2, 3.8, 9, 8);
    const bollardOffsets: [number, number][] = [
      [pier.cx - pier.width * 0.4, pier.endZ - 14],
      [pier.cx + pier.width * 0.4, pier.endZ - 14],
      [pier.cx - pier.width * 0.4, pier.startZ + 90],
      [pier.cx + pier.width * 0.4, pier.startZ + 90],
    ];
    for (const [bx, bz] of bollardOffsets) {
      const bol = new THREE.Mesh(bollardGeo, cleatMat);
      bol.position.set(bx, pier.deckY + 4, bz);
      bol.castShadow = shadowsOn;
      group.add(bol);
    }

    // Harbor lantern post on southeast corner of dock
    const postGeo = new THREE.BoxGeometry(4.5, 34, 4.5);
    const post = new THREE.Mesh(postGeo, pilingMat);
    post.position.set(pier.cx + pier.width * 0.42, pier.deckY + 17, pier.endZ - 12);
    post.castShadow = shadowsOn;
    const lampGeo = new THREE.BoxGeometry(9, 9, 9);
    const lamp = new THREE.Mesh(lampGeo, lanternMat);
    lamp.position.set(pier.cx + pier.width * 0.42, pier.deckY + 35, pier.endZ - 12);
    group.add(post, lamp);

    this.scene.add(group);
    this.geometriesToDispose.push(pilingGeo, stringerGeo, plankGeo, bollardGeo, postGeo, lampGeo);
    this.materialsToDispose.push(plankMat, pilingMat, cleatMat, lanternMat);
  }

  private buildOceanBuoys(): void {
    const floatGeo = new THREE.CylinderGeometry(13, 15, 10, 12);
    const towerGeo = new THREE.CylinderGeometry(4.5, 8.5, 16, 8);
    const beaconGeo = new THREE.SphereGeometry(4.2, 8, 6);

    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42, metalness: 0.15 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.48, metalness: 0.1 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    const buoyCount = 10;
    const buoyRadius = 1860;
    for (let i = 0; i < buoyCount; i++) {
      const a = (i * Math.PI * 2) / buoyCount + 0.18;
      const bx = ISLAND_CENTER + Math.cos(a) * buoyRadius;
      const bz = ISLAND_CENTER + Math.sin(a) * buoyRadius;

      const bGroup = new THREE.Group();
      const floatMesh = new THREE.Mesh(floatGeo, redMat);
      floatMesh.position.y = 1.5;
      const towerMesh = new THREE.Mesh(towerGeo, whiteMat);
      towerMesh.position.y = 13;
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 22.5;
      bGroup.add(floatMesh, towerMesh, beaconMesh);
      bGroup.position.set(bx, SEA_LEVEL_Y, bz);
      this.scene.add(bGroup);
      this.oceanBuoys.push({ group: bGroup, x: bx, z: bz, seed: i * 1.37 });
    }

    this.geometriesToDispose.push(floatGeo, towerGeo, beaconGeo);
    this.materialsToDispose.push(redMat, whiteMat, beaconMat);
  }

  // =========================================================================
  // 3D ENTERABLE HOUSES CONSTRUCTION (COMPOSITE WALLS, DOORS, WINDOWS, PROPS, CUTAWAY ROOFS)
  // =========================================================================
  private bakeArchitectureTexture(
    kind: 'BRICK' | 'CONCRETE' | 'METAL' | 'WOOD_FLOOR' | 'TILE_FLOOR' | 'EPOXY_FLOOR' | 'SHINGLE_ROOF' | 'CRATE'
  ): THREE.CanvasTexture {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d')!;

    if (kind === 'BRICK') {
      g.fillStyle = '#9ca3af'; // mortar base
      g.fillRect(0, 0, size, size);
      const rows = 8;
      const cols = 4;
      const bh = size / rows;
      const bw = size / cols;
      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (bw * 0.5);
        for (let col = -1; col <= cols; col++) {
          const shade = seededHash(r * 31 + col * 17) * 26 - 13;
          g.fillStyle = `rgb(${Math.round(166 + shade)}, ${Math.round(86 + shade * 0.5)}, ${Math.round(68 + shade * 0.4)})`;
          g.fillRect(col * bw + offset + 1.5, r * bh + 1.5, bw - 3, bh - 3);
        }
      }
    } else if (kind === 'CONCRETE') {
      g.fillStyle = '#b6bec8';
      g.fillRect(0, 0, size, size);
      for (let i = 0; i < 240; i++) {
        const x = seededHash(i * 11.3) * size;
        const y = seededHash(i * 23.7) * size;
        g.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.09)';
        g.fillRect(x, y, 2, 2);
      }
      g.strokeStyle = 'rgba(30, 41, 59, 0.28)';
      g.lineWidth = 2;
      g.strokeRect(1, 1, size - 2, size * 0.5 - 2);
      g.strokeRect(1, size * 0.5 + 1, size - 2, size * 0.5 - 2);
    } else if (kind === 'METAL') {
      g.fillStyle = '#94a3b8';
      g.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 8) {
        g.fillStyle = x % 16 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.22)';
        g.fillRect(x, 0, 4, size);
      }
      g.fillStyle = 'rgba(15, 23, 42, 0.25)';
      g.fillRect(0, size * 0.5 - 1, size, 2);
    } else if (kind === 'WOOD_FLOOR') {
      g.fillStyle = '#8b5e3c';
      g.fillRect(0, 0, size, size);
      const planks = 6;
      const ph = size / planks;
      for (let i = 0; i < planks; i++) {
        const s = (seededHash(i * 19.3) - 0.5) * 20;
        g.fillStyle = `rgb(${Math.round(145 + s)}, ${Math.round(98 + s * 0.7)}, ${Math.round(62 + s * 0.5)})`;
        g.fillRect(0, i * ph + 1, size, ph - 2);
        g.fillStyle = 'rgba(42, 22, 10, 0.42)';
        g.fillRect(0, i * ph, size, 1.5);
        const seam = Math.floor(seededHash(i * 43.1) * size);
        g.fillRect(seam, i * ph, 1.5, ph);
      }
    } else if (kind === 'TILE_FLOOR') {
      const tile = size / 4;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const alt = (x + y) % 2 === 0;
          g.fillStyle = alt ? '#94a3b8' : '#7c8b9e';
          g.fillRect(x * tile + 1, y * tile + 1, tile - 2, tile - 2);
        }
      }
    } else if (kind === 'EPOXY_FLOOR') {
      g.fillStyle = '#475569';
      g.fillRect(0, 0, size, size);
      g.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      g.lineWidth = 2;
      g.strokeRect(1, 1, size - 2, size - 2);
      g.fillStyle = 'rgba(250, 204, 21, 0.14)';
      g.fillRect(0, 0, size, 4);
    } else if (kind === 'SHINGLE_ROOF') {
      g.fillStyle = '#a3a3a3';
      g.fillRect(0, 0, size, size);
      const rows = 8;
      const rh = size / rows;
      for (let r = 0; r < rows; r++) {
        const v = 135 + Math.round((seededHash(r * 23) - 0.5) * 32);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(0, r * rh, size, rh - 1.5);
        g.fillStyle = 'rgba(0,0,0,0.28)';
        g.fillRect(0, (r + 1) * rh - 2, size, 2);
      }
    } else {
      // CRATE
      g.fillStyle = '#a16207';
      g.fillRect(0, 0, size, size);
      g.strokeStyle = '#422006';
      g.lineWidth = 8;
      g.strokeRect(4, 4, size - 8, size - 8);
      g.beginPath();
      g.moveTo(8, 8);
      g.lineTo(size - 8, size - 8);
      g.stroke();
    }

    const tex = createCanvasTexture(c, true, this.maxAniso);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.texturesToDispose.push(tex);
    return tex;
  }

  private buildEnterableHouses(): void {
    const houses = getEnterableHouses();
    const shadowsOn = this.renderer.shadowMap.enabled;

    const brickTex = this.bakeArchitectureTexture('BRICK');
    const concreteWallTex = this.bakeArchitectureTexture('CONCRETE');
    const metalWallTex = this.bakeArchitectureTexture('METAL');
    const woodFloorTex = this.bakeArchitectureTexture('WOOD_FLOOR');
    const tileFloorTex = this.bakeArchitectureTexture('TILE_FLOOR');
    const epoxyFloorTex = this.bakeArchitectureTexture('EPOXY_FLOOR');
    const shingleRoofTex = this.bakeArchitectureTexture('SHINGLE_ROOF');
    const crateTex = this.bakeArchitectureTexture('CRATE');

    const porchMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.88,
      metalness: 0.05,
    });
    const trimStoneMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.72,
      metalness: 0.08,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.16,
      metalness: 0.35,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.44,
      metalness: 0.55,
    });
    const woodLegMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.78,
      metalness: 0.04,
    });
    const sconceBulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    this.materialsToDispose.push(porchMat, trimStoneMat, glassMat, steelMat, woodLegMat, sconceBulbMat);

    const floorGlowTex = this.createMoteTexture();
    this.texturesToDispose.push(floorGlowTex);

    const wallTexForKind = (kind: WallMaterialKind) =>
      kind === 'BRICK' ? brickTex : kind === 'METAL' ? metalWallTex : concreteWallTex;

    for (let i = 0; i < houses.length; i++) {
      const h = houses[i];
      const root = new THREE.Group();
      const wallShadowMeshes: THREE.Mesh[] = [];
      const roofShadowMeshes: THREE.Mesh[] = [];
      const roofMaterials: THREE.MeshStandardMaterial[] = [];

      // 1. Interior Floor (polygonOffset ensures blood/footprints render cleanly above)
      const fBaseTex =
        h.floorKind === 'WOOD' ? woodFloorTex : h.floorKind === 'TILE' ? tileFloorTex : epoxyFloorTex;
      const fTex = fBaseTex.clone();
      fTex.repeat.set(Math.max(2, h.width / 88), Math.max(2, h.depth / 88));
      fTex.needsUpdate = true;
      this.texturesToDispose.push(fTex);

      const floorMat = new THREE.MeshStandardMaterial({
        map: fTex,
        roughness: h.floorKind === 'EPOXY' ? 0.52 : 0.76,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -0.5,
        polygonOffsetUnits: -0.5,
      });
      this.materialsToDispose.push(floorMat);
      const floorGeo = new THREE.PlaneGeometry(h.width - 10, h.depth - 10);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(h.cx, 0.14, h.cz);
      floorMesh.receiveShadow = true;
      root.add(floorMesh);
      this.geometriesToDispose.push(floorGeo);

      // 2. Concrete Threshold Porch Steps at each Doorway
      for (let d = 0; d < h.doorways.length; d++) {
        const door = h.doorways[d];
        const isHoriz = door.side === 'N' || door.side === 'S';
        const stepW = isHoriz ? door.width + 18 : 26;
        const stepD = isHoriz ? 26 : door.width + 18;
        const outOffset = 14;
        const sx =
          door.side === 'W' ? door.x - outOffset : door.side === 'E' ? door.x + outOffset : door.x;
        const sz =
          door.side === 'N' ? door.z - outOffset : door.side === 'S' ? door.z + outOffset : door.z;
        const stepGeo = new THREE.BoxGeometry(stepW, 2.2, stepD);
        const stepMesh = new THREE.Mesh(stepGeo, porchMat);
        stepMesh.position.set(sx, 1.1, sz);
        stepMesh.receiveShadow = true;
        root.add(stepMesh);
        this.geometriesToDispose.push(stepGeo);

        // Doorframe jamb pillars & top trim bar
        const jambGeo = new THREE.BoxGeometry(6, h.wallHeight - 16, 18);
        const jOffset = door.width * 0.5 + 1.5;
        const j1 = new THREE.Mesh(jambGeo, steelMat);
        const j2 = new THREE.Mesh(jambGeo, steelMat);
        if (isHoriz) {
          j1.position.set(door.x - jOffset, (h.wallHeight - 16) * 0.5, door.z);
          j2.position.set(door.x + jOffset, (h.wallHeight - 16) * 0.5, door.z);
        } else {
          j1.rotation.y = Math.PI / 2;
          j2.rotation.y = Math.PI / 2;
          j1.position.set(door.x, (h.wallHeight - 16) * 0.5, door.z - jOffset);
          j2.position.set(door.x, (h.wallHeight - 16) * 0.5, door.z + jOffset);
        }
        root.add(j1, j2);
        this.geometriesToDispose.push(jambGeo);
      }

      // 3. Textured Wall Segments, Window Sills & Tinted Glass Panes
      const houseWallTexBase = wallTexForKind(h.walls[0]?.materialKind || 'CONCRETE');
      const wallMat = new THREE.MeshStandardMaterial({
        map: houseWallTexBase,
        color: h.wallColor,
        roughness: h.archetype === 'WAREHOUSE' ? 0.5 : 0.78,
        metalness: h.archetype === 'WAREHOUSE' ? 0.28 : 0.04,
      });
      this.materialsToDispose.push(wallMat);

      for (let w = 0; w < h.walls.length; w++) {
        const seg = h.walls[w];
        const segW = seg.hw * 2;
        const segD = seg.hd * 2;
        const wGeo = new THREE.BoxGeometry(segW, seg.height, segD);
        const wMesh = new THREE.Mesh(wGeo, wallMat);
        wMesh.position.set(seg.cx, seg.yOffset + seg.height * 0.5, seg.cz);
        wMesh.castShadow = shadowsOn;
        wMesh.receiveShadow = true;
        root.add(wMesh);
        wallShadowMeshes.push(wMesh);
        this.geometriesToDispose.push(wGeo);

        // Window sill ledge + tinted open-shooting window pane above sill
        if (seg.isWindowPart && seg.yOffset === 0) {
          const sillGeo = new THREE.BoxGeometry(segW + 4, 3.5, segD + 4);
          const sillMesh = new THREE.Mesh(sillGeo, trimStoneMat);
          sillMesh.position.set(seg.cx, seg.height + 1.5, seg.cz);
          sillMesh.receiveShadow = true;
          root.add(sillMesh);

          const glassH = Math.max(18, h.wallHeight - 20 - seg.height - 4);
          const isHoriz = segW >= segD;
          const glassGeo = new THREE.BoxGeometry(isHoriz ? segW - 4 : 2.5, glassH, isHoriz ? 2.5 : segD - 4);
          const glassMesh = new THREE.Mesh(glassGeo, glassMat);
          glassMesh.position.set(seg.cx, seg.height + 3 + glassH * 0.5, seg.cz);
          root.add(glassMesh);
          this.geometriesToDispose.push(sillGeo, glassGeo);
        }
      }

      // 4. Composite Interior Props (Rugs, Multi-Leg Tables, Steel Workbenches, Braced Crates)
      for (let pIdx = 0; pIdx < h.props.length; pIdx++) {
        const prop = h.props[pIdx];
        if (prop.kind === 'RUG') {
          const rGeo = new THREE.PlaneGeometry(prop.hw * 2, prop.hd * 2);
          const rMat = new THREE.MeshStandardMaterial({
            color: prop.color,
            roughness: 0.92,
            metalness: 0.02,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
          });
          const rMesh = new THREE.Mesh(rGeo, rMat);
          rMesh.rotation.x = -Math.PI / 2;
          rMesh.position.set(prop.cx, 0.22, prop.cz);
          rMesh.receiveShadow = true;
          root.add(rMesh);
          this.geometriesToDispose.push(rGeo);
          this.materialsToDispose.push(rMat);
        } else if (prop.kind === 'CRATE') {
          const cGeo = new THREE.BoxGeometry(prop.hw * 2, prop.height, prop.hd * 2);
          const cMat = new THREE.MeshStandardMaterial({
            map: crateTex,
            color: prop.color,
            roughness: 0.78,
            metalness: 0.06,
          });
          const cMesh = new THREE.Mesh(cGeo, cMat);
          cMesh.position.set(prop.cx, prop.height * 0.5, prop.cz);
          cMesh.castShadow = shadowsOn;
          cMesh.receiveShadow = true;
          root.add(cMesh);
          wallShadowMeshes.push(cMesh);
          this.geometriesToDispose.push(cGeo);
          this.materialsToDispose.push(cMat);
        } else {
          // TABLE or WORKBENCH (composite tabletop + 4 legs)
          const topMat = new THREE.MeshStandardMaterial({
            color: prop.color,
            roughness: prop.kind === 'WORKBENCH' ? 0.45 : 0.72,
            metalness: prop.kind === 'WORKBENCH' ? 0.35 : 0.06,
          });
          const topGeo = new THREE.BoxGeometry(prop.hw * 2, 4, prop.hd * 2);
          const topMesh = new THREE.Mesh(topGeo, topMat);
          topMesh.position.set(prop.cx, prop.height - 2, prop.cz);
          topMesh.castShadow = shadowsOn;
          topMesh.receiveShadow = true;
          root.add(topMesh);
          wallShadowMeshes.push(topMesh);

          const legGeo = new THREE.BoxGeometry(4, prop.height - 4, 4);
          const legMat = prop.kind === 'WORKBENCH' ? steelMat : woodLegMat;
          const ox = prop.hw - 4;
          const oz = prop.hd - 4;
          const legOffsets: [number, number][] = [
            [-ox, -oz],
            [ox, -oz],
            [-ox, oz],
            [ox, oz],
          ];
          for (let l = 0; l < 4; l++) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(prop.cx + legOffsets[l][0], (prop.height - 4) * 0.5, prop.cz + legOffsets[l][1]);
            root.add(leg);
          }
          this.geometriesToDispose.push(topGeo, legGeo);
          this.materialsToDispose.push(topMat);
        }
      }

      // 5. Interior Warm Ceiling/Floor Glow Sprite + Wall Sconce
      const glowMat = new THREE.MeshBasicMaterial({
        map: floorGlowTex,
        color: 0xffd28a,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowGeo = new THREE.PlaneGeometry(h.width * 0.76, h.depth * 0.76);
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.rotation.x = -Math.PI / 2;
      glowMesh.position.set(h.lightX, 0.24, h.lightZ);
      root.add(glowMesh);

      const bulbGeo = new THREE.BoxGeometry(6, 5, 6);
      const bulbMesh = new THREE.Mesh(bulbGeo, sconceBulbMat);
      bulbMesh.position.set(h.lightX, h.wallHeight - 10, h.minZ + 18);
      root.add(bulbMesh);
      this.geometriesToDispose.push(glowGeo, bulbGeo);
      this.materialsToDispose.push(glowMat);

      // 6. Composite Cutaway Roof Group (per-house fade materials)
      const roofGroup = new THREE.Group();
      const roofTex = (h.roofKind === 'GABLE' ? shingleRoofTex : metalWallTex).clone();
      roofTex.repeat.set(Math.max(2, h.width / 80), Math.max(2, h.depth / 80));
      roofTex.needsUpdate = true;
      this.texturesToDispose.push(roofTex);

      const roofMainMat = new THREE.MeshStandardMaterial({
        map: roofTex,
        color: h.roofColor,
        roughness: h.roofKind === 'CORRUGATED' ? 0.42 : 0.82,
        metalness: h.roofKind === 'CORRUGATED' ? 0.32 : 0.06,
        transparent: true,
        opacity: 1,
      });
      const roofTrimMat = new THREE.MeshStandardMaterial({
        color: h.trimColor,
        roughness: 0.65,
        metalness: 0.14,
        transparent: true,
        opacity: 1,
      });
      roofMaterials.push(roofMainMat, roofTrimMat);
      this.materialsToDispose.push(roofMainMat, roofTrimMat);

      const overhang = 22;
      const rw = h.width + overhang;
      const rd = h.depth + overhang;

      if (h.roofKind === 'GABLE') {
        const pitchH = 38;
        const slopeHalfD = rd * 0.5;
        const slopeLen = Math.hypot(slopeHalfD, pitchH);
        const slopeAngle = Math.atan2(pitchH, slopeHalfD);
        const slopeGeo = new THREE.BoxGeometry(rw, 6, slopeLen + 4);

        const northSlope = new THREE.Mesh(slopeGeo, roofMainMat);
        northSlope.position.set(h.cx, h.wallHeight + pitchH * 0.5, h.cz - slopeHalfD * 0.5);
        northSlope.rotation.x = -slopeAngle;
        northSlope.castShadow = shadowsOn;
        northSlope.receiveShadow = true;

        const southSlope = new THREE.Mesh(slopeGeo, roofMainMat);
        southSlope.position.set(h.cx, h.wallHeight + pitchH * 0.5, h.cz + slopeHalfD * 0.5);
        southSlope.rotation.x = slopeAngle;
        southSlope.castShadow = shadowsOn;
        southSlope.receiveShadow = true;

        const ridgeGeo = new THREE.BoxGeometry(rw + 4, 8, 12);
        const ridge = new THREE.Mesh(ridgeGeo, roofTrimMat);
        ridge.position.set(h.cx, h.wallHeight + pitchH, h.cz);

        const chimGeo = new THREE.BoxGeometry(24, 34, 24);
        const chimney = new THREE.Mesh(chimGeo, roofTrimMat);
        chimney.position.set(h.cx + h.width * 0.25, h.wallHeight + pitchH * 0.65 + 10, h.cz - h.depth * 0.18);
        chimney.castShadow = shadowsOn;

        roofGroup.add(northSlope, southSlope, ridge, chimney);
        roofShadowMeshes.push(northSlope, southSlope, chimney);
        this.geometriesToDispose.push(slopeGeo, ridgeGeo, chimGeo);
      } else {
        // FLAT_PARAPET or CORRUGATED industrial deck
        const deckGeo = new THREE.BoxGeometry(rw, 8, rd);
        const deck = new THREE.Mesh(deckGeo, roofMainMat);
        deck.position.set(h.cx, h.wallHeight + 4, h.cz);
        deck.castShadow = shadowsOn;
        deck.receiveShadow = true;

        const ridgeCapGeo = new THREE.BoxGeometry(rw * 0.55, 11, rd * 0.24);
        const ridgeCap = new THREE.Mesh(ridgeCapGeo, roofTrimMat);
        ridgeCap.position.set(h.cx - rw * 0.08, h.wallHeight + 13, h.cz);
        ridgeCap.castShadow = shadowsOn;

        const hvacGeo = new THREE.BoxGeometry(34, 16, 28);
        const hvac = new THREE.Mesh(hvacGeo, roofTrimMat);
        hvac.position.set(h.cx + rw * 0.22, h.wallHeight + 16, h.cz - rd * 0.16);
        hvac.castShadow = shadowsOn;

        roofGroup.add(deck, ridgeCap, hvac);
        roofShadowMeshes.push(deck, ridgeCap, hvac);
        this.geometriesToDispose.push(deckGeo, ridgeCapGeo, hvacGeo);
      }

      root.add(roofGroup);
      this.scene.add(root);
      this.houseEntries.push({
        house: h,
        root,
        roofGroup,
        roofMaterials,
        roofShadowMeshes,
        wallShadowMeshes,
        glowMat,
        roofOpacity: 1,
      });
    }
  }

  private updateEnterableHouses(player: Player, dt: number, dn: DayNightState): void {
    const shadowsOn = this.renderer.shadowMap.enabled;
    const dampDt = Math.min(0.05, Math.max(0.001, dt));
    const nightBoost = dn.darknessAlpha;

    // Collect up to 2 nearest visible houses for dynamic warm interior PointLights on MEDIUM/HIGH
    const allowHouseLights = this.preset.maxFlashLights > 0 && nightBoost > 0.08;
    let l1Idx = -1;
    let l2Idx = -1;
    let d1 = Infinity;
    let d2 = Infinity;

    for (let i = 0; i < this.houseEntries.length; i++) {
      const entry = this.houseEntries[i];
      const h = entry.house;
      if (!entry.root.visible) continue;

      // Fade roof away smoothly whenever operator enters or stands in doorway
      const insideOrDoor =
        player.x >= h.minX - 26 &&
        player.x <= h.maxX + 26 &&
        player.y >= h.minZ - 26 &&
        player.y <= h.maxZ + 26;

      const targetOpacity = insideOrDoor ? 0 : 1;
      entry.roofOpacity = THREE.MathUtils.damp(entry.roofOpacity, targetOpacity, 11, dampDt);

      const visibleRoof = entry.roofOpacity > 0.03;
      entry.roofGroup.visible = visibleRoof;
      if (visibleRoof) {
        const allowCast = shadowsOn && entry.roofOpacity > 0.45;
        for (let m = 0; m < entry.roofMaterials.length; m++) {
          const mat = entry.roofMaterials[m];
          mat.opacity = entry.roofOpacity;
          mat.depthWrite = entry.roofOpacity > 0.94;
        }
        for (let r = 0; r < entry.roofShadowMeshes.length; r++) {
          entry.roofShadowMeshes[r].castShadow = allowCast;
        }
      }

      entry.glowMat.opacity = 0.16 + nightBoost * 0.34;

      if (allowHouseLights) {
        const distSq = (h.cx - player.x) ** 2 + (h.cz - player.y) ** 2;
        if (distSq < d1) {
          d2 = d1;
          l2Idx = l1Idx;
          d1 = distSq;
          l1Idx = i;
        } else if (distSq < d2) {
          d2 = distSq;
          l2Idx = i;
        }
      }
    }

    const chosen = [l1Idx, l2Idx];
    for (let li = 0; li < this.housePointLights.length; li++) {
      const pl = this.housePointLights[li];
      const hi = chosen[li];
      if (allowHouseLights && hi >= 0) {
        const h = this.houseEntries[hi].house;
        pl.position.set(h.lightX, 52, h.lightZ);
        pl.intensity = 1.45 + nightBoost * 2.2;
      } else {
        pl.intensity = 0;
      }
    }
  }

  private bakeSpawnPadTexture(): HTMLCanvasElement {
    const size = 192;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d')!;
    const sc = size / 256;
    g.scale(sc, sc);

    // Natural packed-earth & mossy field-stone tactical drop circle on the grass
    const earthGrad = g.createRadialGradient(128, 128, 18, 128, 128, 114);
    earthGrad.addColorStop(0, 'rgba(92, 74, 54, 0.72)');
    earthGrad.addColorStop(0.68, 'rgba(78, 68, 46, 0.52)');
    earthGrad.addColorStop(1, 'rgba(63, 107, 50, 0)');
    g.fillStyle = earthGrad;
    g.beginPath();
    g.arc(128, 128, 114, 0, Math.PI * 2);
    g.fill();

    // Faint tactical landing circle & crosshairs
    g.strokeStyle = 'rgba(251, 191, 36, 0.46)';
    g.lineWidth = 4;
    g.setLineDash([22, 16]);
    g.beginPath();
    g.arc(128, 128, 86, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);

    g.strokeStyle = 'rgba(241, 245, 249, 0.44)';
    g.lineWidth = 4;
    g.beginPath();
    g.arc(128, 128, 54, 0, Math.PI * 2);
    g.stroke();

    g.strokeStyle = 'rgba(251, 191, 36, 0.56)';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(104, 128);
    g.lineTo(152, 128);
    g.moveTo(128, 104);
    g.lineTo(128, 152);
    g.stroke();

    return c;
  }

  private createContactShadowTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0.85)');
    grad.addColorStop(0.6, 'rgba(2, 6, 23, 0.42)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return createCanvasTexture(c, true, 1);
  }

  private createConeBeamTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createLinearGradient(128, 256, 128, 0);
    grad.addColorStop(0, 'rgba(254, 249, 195, 0.46)');
    grad.addColorStop(0.5, 'rgba(254, 243, 199, 0.16)');
    grad.addColorStop(1, 'rgba(254, 243, 199, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(120, 256);
    g.lineTo(14, 0);
    g.lineTo(242, 0);
    g.lineTo(136, 256);
    g.closePath();
    g.fill();
    return createCanvasTexture(c, true, 2);
  }

  private createSolarAuraTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(128, 128, 30, 128, 128, 126);
    grad.addColorStop(0, 'rgba(251, 146, 60, 0)');
    grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.22)');
    grad.addColorStop(0.88, 'rgba(250, 204, 21, 0.5)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(253, 224, 71, 0.72)';
    g.lineWidth = 4;
    g.setLineDash([22, 14]);
    g.beginPath();
    g.arc(128, 128, 114, 0, Math.PI * 2);
    g.stroke();
    return createCanvasTexture(c, true, this.maxAniso);
  }

  private createBladeSpriteTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.translate(48, 48);
    g.fillStyle = '#0f172a';
    g.strokeStyle = '#38bdf8';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(-26, -6);
    g.quadraticCurveTo(4, -28, 32, 0);
    g.quadraticCurveTo(4, -10, -26, 6);
    g.closePath();
    g.fill();
    g.stroke();
    g.strokeStyle = '#f0abfc';
    g.lineWidth = 2.5;
    g.stroke();
    return createCanvasTexture(c, true, this.maxAniso);
  }

  private createDroneSpriteTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.translate(48, 48);
    g.fillStyle = 'rgba(232, 121, 249, 0.75)';
    g.beginPath();
    g.moveTo(-16, -6);
    g.lineTo(-40, 0);
    g.lineTo(-16, 6);
    g.closePath();
    g.fill();
    g.fillStyle = '#0f172a';
    g.strokeStyle = '#c084fc';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(26, 0);
    g.lineTo(-14, -18);
    g.lineTo(-8, 0);
    g.lineTo(-14, 18);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(4, 0, 5, 0, Math.PI * 2);
    g.fill();
    return createCanvasTexture(c, true, this.maxAniso);
  }

  private createMoteTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return createCanvasTexture(c, true, 1);
  }

  private bakeDropCanvas(type: DropType): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.translate(48, 48);
    const color = type === DropType.HEALTH ? '#10b981' : '#22d3ee';
    g.fillStyle = '#0f172a';
    g.strokeStyle = color;
    g.lineWidth = 6;
    g.beginPath();
    g.roundRect(-28, -28, 56, 56, 14);
    g.fill();
    g.stroke();
    g.fillStyle = color;
    if (type === DropType.HEALTH) {
      g.fillRect(-14, -5, 28, 10);
      g.fillRect(-5, -14, 10, 28);
    } else {
      g.beginPath();
      g.moveTo(0, -17);
      g.lineTo(14, -5);
      g.lineTo(11, 12);
      g.lineTo(0, 20);
      g.lineTo(-11, 12);
      g.lineTo(-14, -5);
      g.closePath();
      g.fill();
    }
    return c;
  }

  private createFootprintTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 32;
    const g = c.getContext('2d')!;
    // Realistic military boot sole tread (heel + ball lugs)
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.roundRect(4, 5, 13, 22, 5);
    g.fill();
    g.beginPath();
    g.roundRect(21, 3, 23, 26, 8);
    g.fill();
    // Tread grip notch
    g.clearRect(17, 4, 3, 24);
    return createCanvasTexture(c, true, 1);
  }

  private createLiquidPhysicalMaterial(
    map: THREE.CanvasTexture,
    normalMap: THREE.CanvasTexture,
    isAcid: boolean
  ): THREE.MeshPhysicalMaterial {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map,
      normalMap,
      normalScale: new THREE.Vector2(1.4, 1.4),
      roughness: isAcid ? 0.08 : 0.045,
      metalness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.035,
      ior: 1.38,
      reflectivity: 0.92,
      envMapIntensity: 1.85,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const uTime = this.uLiquidTime;
    mat.customProgramCacheKey = () => 'liquid-blood-v1';
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uLiquidTime = uTime;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vLiquidUv;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLiquidUv = uv;');
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uLiquidTime;\nvarying vec2 vLiquidUv;'
        )
        .replace(
          '#include <normal_fragment_maps>',
          `#include <normal_fragment_maps>
          float ripA = sin(vLiquidUv.x * 26.0 + uLiquidTime * 3.1) * cos(vLiquidUv.y * 26.0 - uLiquidTime * 2.4);
          float ripB = cos(vLiquidUv.x * 18.0 - uLiquidTime * 2.0 + vLiquidUv.y * 16.0);
          normal = normalize(normal + vec3(ripA * 0.045, ripB * 0.045, 0.0));`
        );
    };
    return mat;
  }

  private bakeLiquidPuddlePair(
    kind: 'BLOOD' | 'ACID',
    variant: number
  ): { albedo: THREE.CanvasTexture; normal: THREE.CanvasTexture } {
    const size = 128;
    const heightField = new Float32Array(size * size);

    // Build organic multi-lobe metaball height field for realistic fluid surface & rounded meniscus
    const blobs: { cx: number; cy: number; r: number; w: number }[] = [
      { cx: 0.5, cy: 0.5, r: 0.25, w: 1.0 },
    ];
    const lobeCount = 5;
    for (let i = 0; i < lobeCount; i++) {
      const a = variant * 1.9 + (i * Math.PI * 2) / lobeCount + seededHash(variant * 13 + i * 7) * 0.6;
      const dist = 0.11 + seededHash(variant * 29 + i * 11) * 0.16;
      const rad = 0.1 + seededHash(variant * 41 + i * 17) * 0.09;
      blobs.push({
        cx: 0.5 + Math.cos(a) * dist,
        cy: 0.5 + Math.sin(a) * dist,
        r: rad,
        w: 0.85,
      });
    }
    // 2 small satellite splash droplets around perimeter
    for (let s = 0; s < 2; s++) {
      const a = variant * 2.4 + s * 2.6 + 0.7;
      const dist = 0.34 + seededHash(variant * 53 + s * 19) * 0.08;
      blobs.push({
        cx: 0.5 + Math.cos(a) * dist,
        cy: 0.5 + Math.sin(a) * dist,
        r: 0.055 + seededHash(variant * 67 + s) * 0.025,
        w: 0.72,
      });
    }

    for (let y = 0; y < size; y++) {
      const ny = y / (size - 1);
      for (let x = 0; x < size; x++) {
        const nx = x / (size - 1);
        let field = 0;
        for (let b = 0; b < blobs.length; b++) {
          const bl = blobs[b];
          const dx = nx - bl.cx;
          const dy = ny - bl.cy;
          const d2 = dx * dx + dy * dy;
          const r2 = bl.r * bl.r;
          if (d2 < r2 * 2.6) {
            field += bl.w * Math.exp((-d2 * 1.9) / r2);
          }
        }
        // Subtle organic fluid ripple inside puddle
        const ripple =
          0.025 *
          Math.sin(nx * 24 + variant * 1.7) *
          Math.cos(ny * 24 - variant * 1.1);
        const h = Math.max(0, Math.min(1, (field - 0.32) * 1.65 + ripple));
        heightField[y * size + x] = h;
      }
    }

    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const ag = albedoCanvas.getContext('2d')!;
    const aImg = ag.createImageData(size, size);

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = size;
    normalCanvas.height = size;
    const ng = normalCanvas.getContext('2d')!;
    const nImg = ng.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      const ym = Math.max(0, y - 1);
      const yp = Math.min(size - 1, y + 1);
      for (let x = 0; x < size; x++) {
        const xm = Math.max(0, x - 1);
        const xp = Math.min(size - 1, x + 1);
        const idx = y * size + x;
        const p4 = idx * 4;
        const h = heightField[idx];

        // Albedo: deep oxygenated fluid core + brighter crimson thin rim
        const alpha = h <= 0.01 ? 0 : Math.min(255, Math.round(Math.pow(Math.min(1, h * 3.8), 0.7) * 242));
        if (kind === 'BLOOD') {
          const rim = 1 - Math.min(1, h * 1.35);
          aImg.data[p4] = Math.round(92 + rim * 96);
          aImg.data[p4 + 1] = Math.round(7 + rim * 16);
          aImg.data[p4 + 2] = Math.round(11 + rim * 14);
          aImg.data[p4 + 3] = alpha;
        } else {
          const core = Math.min(1, h * 1.2);
          aImg.data[p4] = Math.round(132 + core * 48);
          aImg.data[p4 + 1] = Math.round(204 + core * 36);
          aImg.data[p4 + 2] = Math.round(22 + core * 44);
          aImg.data[p4 + 3] = alpha;
        }

        // Central-difference fluid meniscus normal map
        const dhdx = (heightField[y * size + xp] - heightField[y * size + xm]) * 7.5;
        const dhdy = (heightField[yp * size + x] - heightField[ym * size + x]) * 7.5;
        const invLen = 1 / Math.hypot(-dhdx, -dhdy, 1);
        nImg.data[p4] = Math.round((-dhdx * invLen * 0.5 + 0.5) * 255);
        nImg.data[p4 + 1] = Math.round((dhdy * invLen * 0.5 + 0.5) * 255);
        nImg.data[p4 + 2] = Math.round((invLen * 0.5 + 0.5) * 255);
        nImg.data[p4 + 3] = 255;
      }
    }

    ag.putImageData(aImg, 0, 0);
    ng.putImageData(nImg, 0, 0);

    return {
      albedo: createCanvasTexture(albedoCanvas, true, this.maxAniso),
      normal: createCanvasTexture(normalCanvas, false, this.maxAniso),
    };
  }

  private bakeSplatCanvas(kind: 'BLOOD' | 'ACID' | 'CRATER'): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.translate(64, 64);
    if (kind === 'CRATER') {
      const grad = g.createRadialGradient(0, 0, 8, 0, 0, 56);
      grad.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
      grad.addColorStop(0.55, 'rgba(28, 25, 23, 0.85)');
      grad.addColorStop(1, 'rgba(28, 25, 23, 0)');
      g.fillStyle = grad;
      g.fillRect(-64, -64, 128, 128);
      g.strokeStyle = 'rgba(234, 88, 12, 0.45)';
      g.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(Math.cos(a) * 32, Math.sin(a) * 32);
        g.stroke();
      }
      return c;
    }

    g.fillStyle = kind === 'ACID' ? '#84cc16' : '#991b1b';
    g.beginPath();
    g.arc(0, 0, 30, 0, Math.PI * 2);
    g.fill();
    return c;
  }

  private bakeBulletTextures(): void {
    const mkBullet = (drawFn: (g: CanvasRenderingContext2D) => void) => {
      const c = document.createElement('canvas');
      c.width = 96;
      c.height = 32;
      const g = c.getContext('2d')!;
      g.translate(76, 16);
      drawFn(g);
      const tex = createCanvasTexture(c, true, this.maxAniso);
      this.texturesToDispose.push(tex);
      return tex;
    };

    this.bulletTextures.GLOCK_19 = mkBullet((g) => {
      const gr = g.createLinearGradient(-56, 0, 12, 0);
      gr.addColorStop(0, 'rgba(251, 191, 36, 0)');
      gr.addColorStop(0.6, 'rgba(251, 191, 36, 0.72)');
      gr.addColorStop(1, '#fef3c7');
      g.fillStyle = gr;
      g.fillRect(-56, -3, 66, 6);
      g.fillStyle = '#fbbf24';
      g.beginPath();
      g.ellipse(4, 0, 8, 3.6, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(7, 0, 2.4, 0, Math.PI * 2);
      g.fill();
    });

    this.bulletTextures.BENELLI_M4 = mkBullet((g) => {
      const gr = g.createLinearGradient(-44, 0, 10, 0);
      gr.addColorStop(0, 'rgba(249, 115, 22, 0)');
      gr.addColorStop(0.6, 'rgba(251, 146, 60, 0.78)');
      gr.addColorStop(1, '#fef08a');
      g.fillStyle = gr;
      g.fillRect(-44, -3.5, 52, 7);
      g.fillStyle = '#f87171';
      g.beginPath();
      g.arc(2, 0, 6.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fffbeb';
      g.beginPath();
      g.arc(4, 0, 3.2, 0, Math.PI * 2);
      g.fill();
    });

    this.bulletTextures.SCAR_L = mkBullet((g) => {
      const gr = g.createLinearGradient(-72, 0, 14, 0);
      gr.addColorStop(0, 'rgba(56, 189, 248, 0)');
      gr.addColorStop(0.55, 'rgba(56, 189, 248, 0.65)');
      gr.addColorStop(0.88, '#bae6fd');
      gr.addColorStop(1, '#ffffff');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(14, 0);
      g.lineTo(-72, -3.8);
      g.lineTo(-72, 3.8);
      g.closePath();
      g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.ellipse(5, 0, 9, 3.2, 0, 0, Math.PI * 2);
      g.fill();
    });

    this.bulletTextures.RAY = mkBullet((g) => {
      g.strokeStyle = '#e879f9';
      g.lineWidth = 8;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(-64, 0);
      g.lineTo(12, 0);
      g.stroke();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 3.5;
      g.stroke();
    });

    this.bulletTextures.VOID = mkBullet((g) => {
      g.fillStyle = 'rgba(192, 132, 252, 0.55)';
      g.beginPath();
      g.moveTo(16, 0);
      g.lineTo(-32, -11);
      g.lineTo(-18, 0);
      g.lineTo(-32, 11);
      g.closePath();
      g.fill();
      g.fillStyle = '#f5d0fe';
      g.beginPath();
      g.moveTo(14, 0);
      g.lineTo(-16, -5);
      g.lineTo(-16, 5);
      g.closePath();
      g.fill();
    });

    this.bulletTextures.ACID = mkBullet((g) => {
      g.fillStyle = 'rgba(132, 204, 22, 0.45)';
      g.beginPath();
      g.arc(-10, 0, 12, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#84cc16';
      g.beginPath();
      g.arc(0, 0, 9.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ecfccb';
      g.beginPath();
      g.arc(3, -2, 4, 0, Math.PI * 2);
      g.fill();
    });

    this.bulletTextures.CLEAVER = mkBullet((g) => {
      g.strokeStyle = '#ef4444';
      g.lineWidth = 7;
      g.beginPath();
      g.arc(-4, 0, 12, -Math.PI * 0.45, Math.PI * 0.45);
      g.stroke();
      g.fillStyle = '#fecaca';
      g.beginPath();
      g.arc(2, 0, 5, 0, Math.PI * 2);
      g.fill();
    });

    this.bulletTextures.SHRAPNEL = mkBullet((g) => {
      g.fillStyle = '#fb923c';
      g.beginPath();
      g.moveTo(10, 0);
      g.lineTo(-10, -6);
      g.lineTo(-4, 0);
      g.lineTo(-10, 6);
      g.closePath();
      g.fill();
    });
  }

  private bakeParticleTextures(): void {
    const smokes = getSmokeSprites();
    for (const [k, cv] of Object.entries(smokes)) {
      const tex = createCanvasTexture(cv, true, 2);
      this.particleTextures[`smoke_${k}`] = tex;
      this.texturesToDispose.push(tex);
    }
    const fire = getFireballSprites();
    for (const [k, cv] of Object.entries(fire)) {
      const tex = createCanvasTexture(cv, true, 2);
      this.particleTextures[`fire_${k}`] = tex;
      this.texturesToDispose.push(tex);
    }
    const lights = getLightSprites();
    for (const [k, cv] of Object.entries(lights)) {
      const tex = createCanvasTexture(cv, true, 2);
      this.particleTextures[`light_${k}`] = tex;
      this.texturesToDispose.push(tex);
    }

    // Ring shockwave texture
    const rc = document.createElement('canvas');
    rc.width = 128;
    rc.height = 128;
    const rg = rc.getContext('2d')!;
    rg.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    rg.lineWidth = 8;
    rg.beginPath();
    rg.arc(64, 64, 54, 0, Math.PI * 2);
    rg.stroke();
    rg.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    rg.lineWidth = 18;
    rg.beginPath();
    rg.arc(64, 64, 50, 0, Math.PI * 2);
    rg.stroke();
    const ringTex = createCanvasTexture(rc, true, 2);
    this.particleTextures.ring = ringTex;
    this.texturesToDispose.push(ringTex);

    // Muzzle flare sprite
    const mc = document.createElement('canvas');
    mc.width = 96;
    mc.height = 64;
    const mg = mc.getContext('2d')!;
    mg.translate(16, 32);
    mg.fillStyle = 'rgba(251, 191, 36, 0.85)';
    mg.beginPath();
    mg.moveTo(0, -14);
    mg.lineTo(74, 0);
    mg.lineTo(0, 14);
    mg.closePath();
    mg.fill();
    mg.fillStyle = '#ffffff';
    mg.beginPath();
    mg.arc(10, 0, 10, 0, Math.PI * 2);
    mg.fill();
    const flareTex = createCanvasTexture(mc, true, 2);
    this.particleTextures.flare = flareTex;
    this.texturesToDispose.push(flareTex);

    // Crisp dot particle
    const dc = document.createElement('canvas');
    dc.width = 32;
    dc.height = 32;
    const dg = dc.getContext('2d')!;
    dg.fillStyle = '#ffffff';
    dg.beginPath();
    dg.arc(16, 16, 14, 0, Math.PI * 2);
    dg.fill();
    const dotTex = createCanvasTexture(dc, true, 1);
    this.particleTextures.dot = dotTex;
    this.texturesToDispose.push(dotTex);

    // Glossy airborne liquid droplet bead with specular highlight glint
    const bdc = document.createElement('canvas');
    bdc.width = 48;
    bdc.height = 32;
    const bdg = bdc.getContext('2d')!;
    bdg.fillStyle = 'rgba(255, 255, 255, 0.96)';
    bdg.beginPath();
    bdg.ellipse(24, 16, 18, 11, 0, 0, Math.PI * 2);
    bdg.fill();
    bdg.fillStyle = 'rgba(255, 255, 255, 0.95)';
    bdg.beginPath();
    bdg.ellipse(28, 11, 7, 3.2, -0.15, 0, Math.PI * 2);
    bdg.fill();
    const bloodDropTex = createCanvasTexture(bdc, true, 2);
    this.particleTextures.bloodDrop = bloodDropTex;
    this.texturesToDispose.push(bloodDropTex);

    // Glossy specular ocean splash droplet
    const wdc = document.createElement('canvas');
    wdc.width = 32;
    wdc.height = 32;
    const wdg = wdc.getContext('2d')!;
    const wGrad = wdg.createRadialGradient(14, 12, 2, 16, 16, 15);
    wGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    wGrad.addColorStop(0.55, 'rgba(186, 230, 253, 0.85)');
    wGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
    wdg.fillStyle = wGrad;
    wdg.beginPath();
    wdg.arc(16, 16, 15, 0, Math.PI * 2);
    wdg.fill();
    const waterDropTex = createCanvasTexture(wdc, true, 2);
    this.particleTextures.waterDrop = waterDropTex;
    this.texturesToDispose.push(waterDropTex);
  }

  // Bake crisp `renderBallZombie` sprite textures lazily per class / walk frame / hit state
  private getZombieSpriteTexture(z: Zombie, frameBucket: number, recentlyHit: boolean): THREE.CanvasTexture {
    const key = `${z.type}_${recentlyHit ? 'HIT' : frameBucket}`;
    const existing = this.zombieTextures.get(key);
    if (existing) return existing;

    const size = 144;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d')!;
    const drawScale = size / 192;
    g.save();
    g.scale(drawScale, drawScale);

    // Use a fixed base radius inside the sprite canvas, scaled cleanly by z.radius in 3D
    const baseR = z.isBoss ? 48 : 38;
    const fakeZombie: Zombie = {
      ...z,
      radius: baseR,
      angle: 0,
      aiSeed: 0,
      hp: z.maxHp,
      isOnFire: false,
      isStunned: false,
    };
    const fakeTime = (frameBucket * Math.PI * 0.5) / 0.013;
    renderBallZombie(g, fakeZombie, 96, 96, fakeTime, recentlyHit);
    g.restore();

    const tex = createCanvasTexture(c, true, this.maxAniso);
    this.zombieTextures.set(key, tex);
    this.texturesToDispose.push(tex);
    return tex;
  }

  public resize(width: number, height: number): void {
    if (this.disposed) return;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }

  public screenToWorld(clientX: number, clientY: number): { x: number; y: number } {
    _ndc.set((clientX / this.width) * 2 - 1, -(clientY / this.height) * 2 + 1);
    this.raycaster.setFromCamera(_ndc, this.camera);
    const hit = this.raycaster.ray.intersectPlane(AIM_PLANE, _rayHit);
    if (hit) {
      return { x: hit.x, y: hit.z };
    }
    return { x: FOREST_SIZE / 2, y: FOREST_SIZE / 2 };
  }

  public worldToScreen(wx: number, wy: number, heightY = 0): { x: number; y: number } {
    _projVec.set(wx, heightY, wy).project(this.camera);
    return {
      x: (_projVec.x * 0.5 + 0.5) * this.width,
      y: (-_projVec.y * 0.5 + 0.5) * this.height,
    };
  }

  // =========================================================================
  // MAIN FRAME SYNC & RENDER
  // =========================================================================
  public render(input: Scene3DFrameInput): void {
    if (this.disposed) return;

    const {
      player: p,
      zombies,
      bullets,
      drops,
      particles,
      splats,
      footprints,
      casings,
      flashLights,
      voidDrones,
      dyingState: ds,
      camera: cam,
      viewportWidth: vw,
      viewportHeight: vh,
      weaponRecoil,
      muzzleFlashIntensity,
      mythicOrbitAngle,
      dayCycleTime,
      nowMs,
      dt,
      zombieHitFlashMap,
      visionConeEnabled,
    } = input;

    const dn = getDayNightState(dayCycleTime);
    this.uLiquidTime.value = nowMs * 0.001;

    // 1. Update 2.5D Camera (centered cleanly around 2D camera center + zoom/shake/roll)
    const shakePower = cam.trauma * cam.trauma * 14 + cam.shake * 0.55;
    const shakeOx = (Math.random() - 0.5) * shakePower;
    const shakeOy = (Math.random() - 0.5) * shakePower;
    const centerWorldX = cam.x + vw * 0.5 + cam.springX + shakeOx;
    const centerWorldZ = cam.y + vh * 0.5 + cam.springY + shakeOy;
    const zoom = Math.max(0.75, Math.min(1.45, cam.zoom || 1));

    const camHeight = 1040 / zoom;
    const camBackZ = 520 / zoom;
    this.camera.position.set(centerWorldX, camHeight, centerWorldZ + camBackZ);
    this.camera.lookAt(centerWorldX, 10, centerWorldZ);
    if (Math.abs(cam.roll) > 0.0002) {
      this.camera.rotateZ(cam.roll);
    }
    this.camera.updateMatrixWorld();

    // 1b. Compute exact camera ground footprint & cull off-screen Baseplate chunks/houses/entities
    this.computeVisibleBounds(centerWorldX, centerWorldZ, vw, vh, zoom);
    this.updateVisibleWorldChunks();

    // 2. Update 3-Minute Day/Night Global Illumination, Enterable House Roof Cutaway & Interior Lights
    this.updateDayNightLighting(dn, centerWorldX, centerWorldZ, p, flashLights, muzzleFlashIntensity);
    this.updateEnterableHouses(p, dt, dn);

    // 3. Sync Ground Liquid Blood Pools, Craters, Footprints & Brass Casings (culled to view)
    this.syncGroundDecals(splats, footprints, casings);

    // 4. Sync Item Drops (culled to view)
    this.syncDrops(drops, nowMs);

    // 5. Sync Ball Zombie 2.5D Sprites (culled to view)
    this.syncZombies(zombies, p, nowMs, zombieHitFlashMap, visionConeEnabled && !ds.active);

    // 6. Sync Operator + Active Weapon 2.5D Sprite, Weapon Shadows & Mythic Effects
    this.syncPlayer(p, ds, weaponRecoil, mythicOrbitAngle, nowMs, dn);

    // 7. Sync Bullets & Particles (culled to view)
    this.syncBullets(bullets, nowMs);
    this.syncParticles(particles, nowMs);

    // 8. Update Atmospheric Dust / Dusk-Night Fireflies & Wave-Slope Buoyant Ocean Buoys
    this.updateFireflies(centerWorldX, centerWorldZ, nowMs, dn);
    const timeSec = nowMs * 0.001;
    for (let i = 0; i < this.oceanBuoys.length; i++) {
      const b = this.oceanBuoys[i];
      if (!this.isInView(b.x, b.z, 90)) {
        b.group.visible = false;
        continue;
      }
      b.group.visible = true;
      const wh = getOceanWaveHeight(b.x, b.z, timeSec);
      const slope = getOceanWaveSlope(b.x, b.z, timeSec);
      b.group.position.y = SEA_LEVEL_Y + wh;
      b.group.rotation.x = slope.dhdz * 1.45 + Math.sin(timeSec * 1.4 + b.seed) * 0.06;
      b.group.rotation.z = -slope.dhdx * 1.45 + Math.cos(timeSec * 1.15 + b.seed) * 0.06;
    }

    // 9. Render Real 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  private computeVisibleBounds(
    centerX: number,
    centerZ: number,
    vw: number,
    vh: number,
    zoom: number
  ): void {
    const corners: [number, number][] = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let valid = true;

    for (let i = 0; i < 4; i++) {
      _cornerNdc.set(corners[i][0], corners[i][1]);
      this.raycaster.setFromCamera(_cornerNdc, this.camera);
      const hit = this.raycaster.ray.intersectPlane(GROUND_PLANE, _cornerHit);
      if (!hit) {
        valid = false;
        break;
      }
      if (hit.x < minX) minX = hit.x;
      if (hit.x > maxX) maxX = hit.x;
      if (hit.z < minZ) minZ = hit.z;
      if (hit.z > maxZ) maxZ = hit.z;
    }

    if (!valid) {
      const halfW = (vw / zoom) * 0.85;
      const halfH = (vh / zoom) * 0.95;
      minX = centerX - halfW;
      maxX = centerX + halfW;
      minZ = centerZ - halfH;
      maxZ = centerZ + halfH;
    }

    const pad = this.preset.chunkPad;
    this.visMinX = minX - pad;
    this.visMaxX = maxX + pad;
    this.visMinZ = minZ - pad;
    this.visMaxZ = maxZ + pad;
  }

  private updateVisibleWorldChunks(): void {
    const minX = this.visMinX;
    const maxX = this.visMaxX;
    const minZ = this.visMinZ;
    const maxZ = this.visMaxZ;

    for (let i = 0; i < this.islandTerrainChunks.length; i++) {
      const tc = this.islandTerrainChunks[i];
      tc.mesh.visible =
        tc.maxX >= minX && tc.minX <= maxX && tc.maxZ >= minZ && tc.minZ <= maxZ;
    }
    for (let i = 0; i < this.oceanChunks.length; i++) {
      const oc = this.oceanChunks[i];
      oc.mesh.visible =
        oc.maxX >= minX && oc.minX <= maxX && oc.maxZ >= minZ && oc.minZ <= maxZ;
    }
    const tuftsEnabled = this.preset.grassTuftsPerChunk > 0;
    for (let i = 0; i < this.grassTuftChunks.length; i++) {
      const tc = this.grassTuftChunks[i];
      tc.mesh.visible =
        tuftsEnabled && tc.maxX >= minX && tc.minX <= maxX && tc.maxZ >= minZ && tc.minZ <= maxZ;
    }
    for (let i = 0; i < this.houseEntries.length; i++) {
      const he = this.houseEntries[i];
      const h = he.house;
      he.root.visible =
        h.maxX + 48 >= minX && h.minX - 48 <= maxX && h.maxZ + 48 >= minZ && h.minZ - 48 <= maxZ;
    }
    const spawnHalf = 115;
    const c = ISLAND_CENTER;
    this.spawnMesh.visible =
      c + spawnHalf >= minX && c - spawnHalf <= maxX && c + spawnHalf >= minZ && c - spawnHalf <= maxZ;
  }

  private isInView(x: number, y: number, pad = 60): boolean {
    return (
      x >= this.visMinX - pad &&
      x <= this.visMaxX + pad &&
      y >= this.visMinZ - pad &&
      y <= this.visMaxZ + pad
    );
  }

  public afterDraw(cb: () => void, trackTimer: (id: number) => void): void {
    if (this.disposed) return;
    if (this.isSoftwareGl) {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (sync) {
        gl.flush();
        const poll = () => {
          if (this.disposed) {
            gl.deleteSync(sync);
            return;
          }
          const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            trackTimer(window.setTimeout(poll, 5));
          } else {
            gl.deleteSync(sync);
            trackTimer(window.setTimeout(cb, 80));
          }
        };
        trackTimer(window.setTimeout(poll, 5));
        return;
      }
      trackTimer(window.setTimeout(cb, 80));
      return;
    }
    trackTimer(window.setTimeout(cb, 16));
  }

  private updateDayNightLighting(
    dn: DayNightState,
    camX: number,
    camZ: number,
    player: Player,
    flashLights: SceneFlashLight[],
    muzzleFlashIntensity: number
  ): void {
    // 3-Minute Sky Horizon, 3-Phase Sky PMREM IBL & Multi-Bounce Coastal Global Illumination
    const dayBlend = 1 - dn.darknessAlpha;
    const sunR = dn.sunRgb[0] / 255;
    const sunG = dn.sunRgb[1] / 255;
    const sunB = dn.sunRgb[2] / 255;
    this.uOceanSunLevel.value = dayBlend;
    this.uOceanSunColor.value.setRGB(sunR, sunG, sunB);
    this.uWaterSunDir.value.set(dn.shadowDirX, dn.shadowDirY);

    // Swap Sky Dome IBL Environment smoothly across Day / Dawn-Dusk / Night (0ms GPU swap)
    const nextEnv =
      dn.phase === 'NIGHT'
        ? this.envNightTarget?.texture
        : dn.phase === 'DAWN' || dn.phase === 'DUSK'
          ? this.envGoldenTarget?.texture
          : this.envDayTarget?.texture;
    if (nextEnv && this.scene.environment !== nextEnv) {
      this.scene.environment = nextEnv;
    }
    this.scene.environmentIntensity = 0.56 + dayBlend * 0.68 + dn.sunWarmth * 0.16;

    this.bgColor.setRGB(
      0.04 + dayBlend * 0.28 + dn.sunWarmth * 0.16,
      0.07 + dayBlend * 0.45 + dn.sunWarmth * 0.05,
      0.16 + dayBlend * 0.62 - dn.sunWarmth * 0.08
    );
    this.fog.color.copy(this.bgColor);
    this.fog.density = 0.00013 + dn.darknessAlpha * 0.00017;

    // Spatial Coastal Global Illumination Bounce: shift ground bounce toward turquoise sea near coast
    const coastProximity = Math.max(0, Math.min(1, (getCoastlineSignedDistance(camX, camZ) + 260) / 420));
    const groundBounceR = (0.14 + dayBlend * 0.14 + dn.sunWarmth * 0.1) * (1 - coastProximity * 0.45);
    const groundBounceG = (0.19 + dayBlend * 0.21) * (1 + coastProximity * 0.22);
    const groundBounceB = 0.15 + dayBlend * 0.16 + coastProximity * (0.14 + dayBlend * 0.24);
    this.uGiBounceColor.value.setRGB(groundBounceR * 1.4, groundBounceG * 1.35, groundBounceB * 1.45);

    // 1) Sky-to-Ground Hemisphere GI Fill
    this.hemiLight.color.setRGB(
      sunR * (0.45 + dayBlend * 0.52),
      sunG * (0.45 + dayBlend * 0.52),
      sunB * (0.55 + dayBlend * 0.45)
    );
    this.hemiLight.groundColor.setRGB(groundBounceR, groundBounceG, groundBounceB);
    this.hemiLight.intensity = 0.62 + dayBlend * 0.66;

    // 2) Directional Sun / Moon Key Light (shadows)
    const sunHeight = 380 + dayBlend * 360;
    this.sunLight.position.set(
      camX - dn.shadowDirX * 520 * dn.shadowStretch,
      sunHeight,
      camZ - dn.shadowDirY * 520 * dn.shadowStretch
    );
    this.sunLight.target.position.set(camX, 0, camZ);
    this.sunLight.target.updateMatrixWorld();
    this.sunLight.color.setRGB(sunR, sunG, sunB);
    this.sunLight.intensity = 0.78 + dayBlend * 1.48;

    // 3) Counter-Bounce GI Fill Light (sky/ocean/meadow indirect bounce lighting up shadowed faces)
    this.giBounceLight.position.set(
      camX + dn.shadowDirX * 420,
      190 + dayBlend * 90,
      camZ + dn.shadowDirY * 420
    );
    this.giBounceLight.target.position.set(camX, 0, camZ);
    this.giBounceLight.target.updateMatrixWorld();
    this.giBounceLight.color.setRGB(
      0.34 + dn.sunWarmth * 0.36 + dayBlend * 0.18,
      0.48 + dayBlend * 0.26 + coastProximity * 0.14,
      0.72 + dayBlend * 0.24 + coastProximity * 0.18
    );
    this.giBounceLight.intensity = 0.28 + dayBlend * 0.34 + dn.sunWarmth * 0.12;

    // 4) Soft Overhead Zenith Skylight GI Fill
    this.giTopSkyLight.position.set(camX, 620, camZ);
    this.giTopSkyLight.target.position.set(camX, 0, camZ);
    this.giTopSkyLight.target.updateMatrixWorld();
    this.giTopSkyLight.color.setRGB(
      0.42 + dayBlend * 0.38,
      0.56 + dayBlend * 0.36,
      0.86 + dayBlend * 0.14
    );
    this.giTopSkyLight.intensity = 0.18 + dayBlend * 0.22;

    // Tactical Weapon Headlamp Spotlight
    const flStr = dn.flashlightStrength;
    if (this.preset.headlampSpot && flStr > 0.04) {
      const pPose = getEntitySwimPose(player.x, player.y, this.uLiquidTime.value);
      this.headlampSpot.position.set(player.x, pPose.baseY + 22, player.y);
      this.headlampSpot.target.position.set(
        player.x + Math.cos(player.angle) * 340,
        SEA_LEVEL_Y * 0.25,
        player.y + Math.sin(player.angle) * 340
      );
      this.headlampSpot.target.updateMatrixWorld();
      this.headlampSpot.intensity = flStr * 3.8 + muzzleFlashIntensity * 1.2;

      this.headlampConeMesh.position.set(
        player.x + Math.cos(player.angle) * 20,
        Math.max(SEA_LEVEL_Y + 3, pPose.baseY + 6),
        player.y + Math.sin(player.angle) * 20
      );
      this.headlampConeMesh.rotation.set(Math.PI / 2, 0, player.angle - Math.PI / 2);
      this.headlampConeMat.opacity = flStr * 0.42;
      this.headlampConeMesh.visible = flStr > 0.06;
    } else {
      this.headlampSpot.intensity = 0;
      this.headlampConeMesh.visible = false;
    }

    // Pooled dynamic muzzle & explosion point lights (capped by graphics preset)
    const maxFl = Math.min(this.preset.maxFlashLights, this.flashPointLights.length);
    let flUsed = 0;
    if (muzzleFlashIntensity > 0.08 && flUsed < maxFl) {
      const pl = this.flashPointLights[flUsed++];
      pl.position.set(
        player.x + Math.cos(player.angle) * (player.radius + 22),
        22,
        player.y + Math.sin(player.angle) * (player.radius + 22)
      );
      pl.color.setHex(0xfbbf24);
      pl.intensity = muzzleFlashIntensity * 3.4;
    }
    for (let i = 0; i < flashLights.length && flUsed < maxFl; i++) {
      const fl = flashLights[i];
      const pl = this.flashPointLights[flUsed++];
      pl.position.set(fl.x, 26, fl.y);
      pl.color.setHex(fl.color === 'cyan' ? 0x22d3ee : fl.color === 'purple' ? 0xc084fc : 0xf97316);
      pl.intensity = fl.alpha * 3.8;
    }
    for (let i = flUsed; i < this.flashPointLights.length; i++) {
      this.flashPointLights[i].intensity = 0;
    }
  }

  private syncGroundDecals(
    splats: BloodSplat[],
    footprints: GroundFootprint[],
    casings: SpentCasing[]
  ): void {
    // Liquid Blood & Acid Puddles (MeshPhysicalMaterial) vs Matte Blast Craters (MeshBasicMaterial)
    const maxSplats = this.preset.maxSplats;
    let liquidIdx = 0;
    let craterIdx = 0;
    let totalShown = 0;
    for (let i = splats.length - 1; i >= 0 && totalShown < maxSplats; i--) {
      const s = splats[i];
      if (!this.isInView(s.x, s.y, s.radius * 3.2)) continue;
      totalShown++;

      const isScorch = s.color === '#1c1917' || s.color === '#09090b' || s.color === '#0f172a';
      if (isScorch) {
        if (this.splatPool.length <= craterIdx) {
          const mat = new THREE.MeshBasicMaterial({
            map: this.splatTextures.CRATER,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2,
          });
          const mesh = new THREE.Mesh(this.decalGeo, mat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.y = 0.28;
          this.scene.add(mesh);
          this.splatPool.push({ mesh, mat });
          this.materialsToDispose.push(mat);
        }
        const item = this.splatPool[craterIdx++];
        const groundY = getIslandWalkableY(s.x, s.y);
        item.mat.opacity = s.alpha;
        item.mesh.position.set(s.x, groundY + 0.28 + (craterIdx % 4) * 0.01, s.y);
        item.mesh.rotation.set(-Math.PI / 2, 0, -(s.angle || 0));
        const sz = s.radius * 2.8;
        item.mesh.scale.set(sz * (s.stretch ? Math.min(1.5, s.stretch) : 1), sz, 1);
        item.mesh.visible = getWaterDepth(s.x, s.y) < 1.0;
      } else {
        const isAcid = s.color.includes('84cc16') || s.color.includes('132, 204') || s.color.includes('65a30d');
        if (this.liquidSplatPool.length <= liquidIdx) {
          const mat = this.createLiquidPhysicalMaterial(
            this.liquidBloodAlbedo[0],
            this.liquidBloodNormal[0],
            false
          );
          const mesh = new THREE.Mesh(this.decalGeo, mat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.y = 0.30;
          this.scene.add(mesh);
          this.liquidSplatPool.push({ mesh, mat });
          this.materialsToDispose.push(mat);
        }
        const item = this.liquidSplatPool[liquidIdx++];
        const vIdx = (s.variant || 0) % this.liquidBloodAlbedo.length;
        const nextAlbedo = isAcid ? this.liquidAcidAlbedo : this.liquidBloodAlbedo[vIdx];
        const nextNormal = isAcid ? this.liquidAcidNormal : this.liquidBloodNormal[vIdx];
        if (item.mat.map !== nextAlbedo) {
          const wasNull = !item.mat.map;
          item.mat.map = nextAlbedo;
          item.mat.normalMap = nextNormal;
          item.mat.roughness = isAcid ? 0.08 : 0.045;
          if (wasNull) item.mat.needsUpdate = true;
        }
        const walkY = getIslandWalkableY(s.x, s.y);
        const wDepth = getWaterDepth(s.x, s.y);
        const overWater = wDepth > 0.6;
        item.mat.opacity = Math.max(0, Math.min(0.96, s.alpha * (overWater ? 0.45 : 1)));
        item.mesh.position.set(
          s.x,
          (overWater ? SEA_LEVEL_Y + 0.35 : walkY + 0.29) + (liquidIdx % 5) * 0.01,
          s.y
        );
        item.mesh.rotation.set(-Math.PI / 2, 0, -(s.angle || 0));
        const sz = s.radius * (overWater ? 2.85 : 2.45);
        item.mesh.scale.set(sz * (s.stretch ? Math.min(1.7, s.stretch) : 1), sz, 1);
        item.mesh.visible = true;
      }
    }
    for (let i = liquidIdx; i < this.liquidSplatPool.length; i++) {
      this.liquidSplatPool[i].mesh.visible = false;
    }
    for (let i = craterIdx; i < this.splatPool.length; i++) {
      this.splatPool[i].mesh.visible = false;
    }

    // Boot Footprints (muddy dark or wet glossy crimson after stepping in fresh blood)
    const maxFootprints = this.preset.maxFootprints;
    let fpIdx = 0;
    for (let i = footprints.length - 1; i >= 0 && fpIdx < maxFootprints; i--) {
      const fp = footprints[i];
      if (!this.isInView(fp.x, fp.y, 20)) continue;
      if (getWaterDepth(fp.x, fp.y) > 1.5) continue;
      if (this.footprintPool.length <= fpIdx) {
        const mat = new THREE.MeshBasicMaterial({
          map: this.footprintTex,
          color: 0x090d16,
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3,
        });
        const mesh = new THREE.Mesh(this.decalGeo, mat);
        mesh.rotation.x = -Math.PI / 2;
        this.scene.add(mesh);
        this.footprintPool.push({ mesh, mat });
        this.materialsToDispose.push(mat);
      }
      const item = this.footprintPool[fpIdx++];
      const fpY = getIslandWalkableY(fp.x, fp.y);
      item.mesh.position.set(fp.x, fpY + 0.38, fp.y);
      item.mesh.rotation.set(-Math.PI / 2, 0, -fp.angle);
      item.mesh.scale.set(8.2, 4.8, 1);
      item.mat.color.setHex(fp.wet ? 0x7f1d1d : 0x090d16);
      item.mat.opacity = Math.max(0, fp.alpha * (fp.wet ? 0.88 : 0.52));
      item.mesh.visible = true;
    }
    for (let i = fpIdx; i < this.footprintPool.length; i++) {
      this.footprintPool[i].mesh.visible = false;
    }

    // Brass Casings (only visible on land/beach/pier in viewport)
    const maxCasings = this.preset.maxCasings;
    let cIdx = 0;
    for (let i = casings.length - 1; i >= 0 && cIdx < maxCasings; i--) {
      const c = casings[i];
      if (!this.isInView(c.x, c.y, 20)) continue;
      if (getWaterDepth(c.x, c.y) > 1.0) continue;
      if (this.casingPool.length <= cIdx) {
        const mat = new THREE.MeshLambertMaterial({
          color: 0xfbbf24,
          transparent: true,
        });
        const mesh = new THREE.Mesh(this.decalGeo, mat);
        mesh.rotation.x = -Math.PI / 2;
        this.scene.add(mesh);
        this.casingPool.push({ mesh, mat });
        this.materialsToDispose.push(mat);
        this.litMaterials.push(mat);
      }
      const item = this.casingPool[cIdx++];
      const cY = getIslandWalkableY(c.x, c.y);
      item.mesh.position.set(c.x, cY + 0.38, c.y);
      item.mesh.rotation.set(-Math.PI / 2, 0, -c.angle);
      item.mesh.scale.set(c.isShell ? 6.2 : 4.6, c.isShell ? 2.6 : 1.9, 1);
      item.mat.color.set(c.color);
      item.mat.opacity = Math.max(0, c.alpha);
      item.mesh.visible = true;
    }
    for (let i = cIdx; i < this.casingPool.length; i++) {
      this.casingPool[i].mesh.visible = false;
    }
  }

  private syncDrops(drops: ItemDrop[], nowMs: number): void {
    const timeSec = nowMs * 0.001;
    let dropIdx = 0;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      if (!this.isInView(d.x, d.y, 48)) continue;
      if (this.dropPool.length <= dropIdx) {
        const group = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({
          transparent: true,
          alphaTest: 0.1,
          side: THREE.DoubleSide,
        });
        const card = new THREE.Mesh(this.decalGeo, mat);
        card.scale.set(26, 26, 1);
        card.rotation.x = TILT_X;

        const haloMat = new THREE.MeshBasicMaterial({
          map: this.particleTextures.light_white,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Mesh(this.decalGeo, haloMat);
        halo.rotation.x = -Math.PI / 2;
        halo.scale.set(42, 42, 1);
        halo.position.y = 0.5;

        group.add(card, halo);
        this.scene.add(group);
        this.dropPool.push({ group, card, mat, halo, haloMat });
        this.materialsToDispose.push(mat, haloMat);
        this.litMaterials.push(mat);
      }
      const item = this.dropPool[dropIdx++];
      const bob = Math.sin(d.pulseTimer + nowMs * 0.004) * 3.5;
      const wDepth = getWaterDepth(d.x, d.y);
      const baseY = wDepth > 0.5 ? SEA_LEVEL_Y + getOceanWaveHeight(d.x, d.y, timeSec) - 1.5 : getIslandWalkableY(d.x, d.y);
      item.group.position.set(d.x, baseY, d.y);
      item.card.position.y = 14 + bob;
      const nextTex = d.type === DropType.HEALTH ? this.dropTextures.HEALTH : this.dropTextures.SHIELD;
      if (item.mat.map !== nextTex) {
        const wasNull = !item.mat.map;
        item.mat.map = nextTex;
        if (wasNull) item.mat.needsUpdate = true;
      }
      item.mat.emissive.set(d.color);
      item.mat.emissiveIntensity = 0.25;
      item.haloMat.color.set(d.color);
      item.haloMat.opacity = 0.45 + Math.sin(nowMs * 0.006 + i) * 0.15;
      item.group.visible = true;
    }
    for (let i = dropIdx; i < this.dropPool.length; i++) {
      this.dropPool[i].group.visible = false;
    }
  }

  private createZombieEntry(): ZombieSpriteEntry {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
    });
    const card = new THREE.Mesh(this.zombieCardGeo, mat);
    card.rotation.x = TILT_X;
    card.renderOrder = 4;

    const contactShadow = new THREE.Mesh(this.decalGeo, this.contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.34;

    const pMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const shadowProxy = new THREE.Mesh(this.zombieProxyGeo, pMat);
    shadowProxy.castShadow = false;

    const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x020617, transparent: true, opacity: 0.85, depthTest: false });
    const hpBg = new THREE.Mesh(this.zombieHpGeo, hpBgMat);
    hpBg.rotation.x = TILT_X;
    hpBg.renderOrder = 22;

    const hpMat = new THREE.MeshBasicMaterial({ color: 0xef4444, depthTest: false });
    const hpFill = new THREE.Mesh(this.zombieHpGeo, hpMat);
    hpFill.rotation.x = TILT_X;
    hpFill.renderOrder = 23;

    const fireMat = new THREE.MeshBasicMaterial({ color: 0xfb923c, side: THREE.DoubleSide });
    const fireRing = new THREE.Mesh(this.zombieRingGeo, fireMat);
    fireRing.rotation.x = -Math.PI / 2;
    fireRing.position.y = 1.6;
    fireRing.visible = false;

    const stunMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const stunRing = new THREE.Mesh(this.zombieRingGeo, stunMat);
    stunRing.rotation.x = -Math.PI / 2;
    stunRing.position.y = 1.8;
    stunRing.visible = false;

    group.add(card, contactShadow, shadowProxy, hpBg, hpFill, fireRing, stunRing);
    this.scene.add(group);
    this.materialsToDispose.push(mat, pMat, hpBgMat, hpMat, fireMat, stunMat);
    this.litMaterials.push(mat);
    return { group, card, mat, contactShadow, shadowProxy, hpBg, hpFill, hpMat, fireRing, stunRing };
  }

  private syncZombies(
    zombies: Zombie[],
    player: Player,
    nowMs: number,
    hitFlashMap: Map<string, number>,
    useVisionCone: boolean
  ): void {
    this.aliveZombieIds.clear();
    for (let i = 0; i < zombies.length; i++) {
      this.aliveZombieIds.add(zombies[i].id);
    }

    for (const [id, entry] of this.zombieActive.entries()) {
      if (!this.aliveZombieIds.has(id)) {
        entry.group.visible = false;
        this.zombieActive.delete(id);
        this.zombiePool.push(entry);
      }
    }

    const timeSec = nowMs * 0.001;
    const shadowsEnabled = this.renderer.shadowMap.enabled;
    for (let i = 0; i < zombies.length; i++) {
      const z = zombies[i];
      let entry = this.zombieActive.get(z.id);
      if (!entry) {
        entry = this.zombiePool.pop() || this.createZombieEntry();
        this.zombieActive.set(z.id, entry);
      }

      if (
        !this.isInView(z.x, z.y, z.radius + 70) ||
        (useVisionCone && !z.isBoss && !isPointInVisionCone(player.x, player.y, player.angle, z.x, z.y))
      ) {
        entry.group.visible = false;
        continue;
      }

      const recentlyHit = nowMs - (hitFlashMap.get(z.id) || 0) < 95;
      const frameBucket = Math.floor(((nowMs * 0.013 + (z.aiSeed || 0)) / (Math.PI * 0.5))) & 3;
      const tex = this.getZombieSpriteTexture(z, frameBucket, recentlyHit);
      if (entry.mat.map !== tex) {
        const wasNull = !entry.mat.map;
        entry.mat.map = tex;
        if (wasNull) entry.mat.needsUpdate = true;
      }

      const zPose = getEntitySwimPose(z.x, z.y, timeSec, z.aiSeed || 0);
      const submergeBlend = Math.max(0, Math.min(1, (zPose.waterDepth - 2.5) / 8.5));
      const hop = (1 - submergeBlend * 0.75) * Math.abs(Math.sin(nowMs * 0.008 + (z.aiSeed || 0))) * (z.type === ZombieType.RUNNER ? 5.5 : 2.8);
      const pulse = 1 + Math.sin(nowMs * 0.01 + (z.aiSeed || 0)) * 0.04;
      const spriteSize = (z.radius * 192) / (z.isBoss ? 48 : 38);
      const cardLocalY = z.radius * 0.92 + hop - submergeBlend * (z.radius * 0.42 + 1.5);

      entry.group.position.set(z.x, zPose.baseY, z.y);
      entry.card.position.set(0, cardLocalY, 0);
      entry.card.scale.set(spriteSize * pulse, spriteSize / pulse, 1);
      entry.card.rotation.set(TILT_X + zPose.tiltX * 0.35, zPose.tiltZ * 0.35, -z.angle);

      const csSize = z.radius * 2.55;
      entry.contactShadow.scale.set(csSize, csSize, 1);
      entry.contactShadow.visible = zPose.waterDepth < 1.5;
      entry.shadowProxy.castShadow = shadowsEnabled && !!z.isBoss && zPose.waterDepth < 2.0;
      if (z.isBoss) {
        entry.shadowProxy.position.y = cardLocalY;
        entry.shadowProxy.scale.setScalar(z.radius);
      }

      // Status rings
      entry.fireRing.visible = !!z.isOnFire;
      if (z.isOnFire) {
        entry.fireRing.position.y = Math.max(1.6, cardLocalY - z.radius * 0.4);
        entry.fireRing.scale.setScalar(z.radius + 4);
      }
      entry.stunRing.visible = !z.isOnFire && !!z.isStunned;
      if (z.isStunned) {
        entry.stunRing.position.y = Math.max(1.8, cardLocalY - z.radius * 0.35);
        entry.stunRing.scale.setScalar(z.radius + 4);
      }

      // Overhead HP bar for wounded standard zombies
      if (!z.isBoss && z.hp < z.maxHp) {
        const bw = z.radius * 2.2;
        const ratio = Math.max(0.02, Math.min(1, z.hp / z.maxHp));
        entry.hpBg.visible = true;
        entry.hpFill.visible = true;
        entry.hpBg.scale.set(bw, 22, 1);
        entry.hpBg.position.set(0, cardLocalY + z.radius * 0.98 + 12, -z.radius * 0.35);

        entry.hpFill.scale.set(bw * ratio, 22, 1);
        entry.hpFill.position.set(-bw * (1 - ratio) * 0.5, cardLocalY + z.radius * 0.98 + 12.2, -z.radius * 0.35);
        entry.hpMat.color.setHex(
          z.type === ZombieType.TANK ? 0xf59e0b : z.type === ZombieType.TOXIC_SPITTER ? 0x84cc16 : 0xef4444
        );
      } else {
        entry.hpBg.visible = false;
        entry.hpFill.visible = false;
      }

      entry.group.visible = true;
    }
  }

  private getPlayerSpriteTexture(
    skin: string,
    weapon: WeaponType,
    radius: number,
    isMoving: boolean,
    recoil: number,
    deathProgress: number,
    nowMs: number
  ): THREE.CanvasTexture {
    const animBucket = deathProgress > 0 ? 0 : isMoving ? (Math.floor(nowMs * 0.015 / (Math.PI * 0.5)) & 3) : -1;
    const recoilBucket = deathProgress > 0 ? 0 : recoil > 0.45 ? 1 : 0;
    const deathBucket = deathProgress > 0 ? Math.min(5, Math.floor(deathProgress * 5)) : -1;
    const key = `${skin}_${weapon}_${animBucket}_${recoilBucket}_${deathBucket}`;
    const cached = this.playerTextures.get(key);
    if (cached) return cached;

    const size = 144;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d')!;
    g.translate(size * 0.5, size * 0.5);
    g.scale(1.1625, 1.1625);

    const fakeTime = animBucket >= 0 ? (animBucket * Math.PI * 0.5) / 0.015 : 0;
    const fakeRecoil = recoilBucket === 1 ? 0.85 : 0;
    if (deathBucket < 0) {
      renderPlayerWeapon(g, weapon, fakeRecoil, fakeTime, radius);
    }
    renderOperatorBody(g, skin, radius, fakeTime, animBucket >= 0, deathBucket >= 0 ? deathBucket / 5 : 0);

    const tex = createCanvasTexture(c, true, this.maxAniso);
    this.playerTextures.set(key, tex);
    this.texturesToDispose.push(tex);
    return tex;
  }

  private getWeaponGroundShadowTexture(weapon: WeaponType): THREE.CanvasTexture {
    const existing = this.weaponGroundShadowTextures.get(weapon);
    if (existing) return existing;

    // 116x48 elongated soft directional shadow silhouette aligned along +X
    const c = document.createElement('canvas');
    c.width = 116;
    c.height = 48;
    const g = c.getContext('2d')!;
    g.translate(58, 24);
    g.fillStyle = 'rgba(2, 6, 23, 0.82)';

    const drawBlurShape = (rx: number, ry: number, rw: number, rh: number, r = 3) => {
      // Soft multi-pass shadow silhouette (fast, zero shadowBlur)
      g.fillStyle = 'rgba(2, 6, 23, 0.24)';
      g.beginPath();
      g.roundRect(rx - 3, ry - 3, rw + 6, rh + 6, r + 2);
      g.fill();
      g.fillStyle = 'rgba(2, 6, 23, 0.65)';
      g.beginPath();
      g.roundRect(rx, ry, rw, rh, r);
      g.fill();
    };

    if (weapon === WeaponType.GLOCK_19) {
      drawBlurShape(4, -5.5, 14, 11, 3);
      drawBlurShape(12, -3.5, 22, 7, 2);
    } else if (weapon === WeaponType.BENELLI_M4) {
      drawBlurShape(-4, -4.5, 26, 9, 2.5);
      drawBlurShape(20, -3.2, 24, 6.4, 2);
    } else {
      // FN SCAR-L CQC
      drawBlurShape(-5, -4.5, 34, 9, 2.5);
      drawBlurShape(10, -5.5, 9, 11, 2);
      drawBlurShape(29, -3.0, 17, 6, 2);
    }

    const tex = createCanvasTexture(c, true, 1);
    this.weaponGroundShadowTextures.set(weapon, tex);
    this.texturesToDispose.push(tex);
    return tex;
  }

  private getDroppedWeaponTexture(weapon: WeaponType, radius: number): THREE.CanvasTexture {
    const cached = this.droppedWeaponTextures.get(weapon);
    if (cached) return cached;

    const c = document.createElement('canvas');
    c.width = 96;
    c.height = 96;
    const dg = c.getContext('2d')!;
    dg.translate(48, 48);
    dg.scale(1.26, 1.26);
    renderPlayerWeapon(dg, weapon, 0, 0, radius);

    const tex = createCanvasTexture(c, true, this.maxAniso);
    this.droppedWeaponTextures.set(weapon, tex);
    this.texturesToDispose.push(tex);
    return tex;
  }

  private syncPlayer(
    p: Player,
    ds: DyingState,
    weaponRecoil: number,
    mythicOrbitAngle: number,
    nowMs: number,
    dn: DayNightState
  ): void {
    const deathProgress = ds.active ? Math.min(1, ds.timer / ds.total) : 0;
    const isMoving = !ds.active && Math.hypot(p.vx || 0, p.vy || 0) > 15;
    const pTex = this.getPlayerSpriteTexture(
      p.equippedSkin || 'skin_default',
      p.currentWeapon,
      p.radius,
      isMoving,
      weaponRecoil,
      deathProgress,
      nowMs
    );
    if (this.playerMat.map !== pTex) {
      const wasNull = !this.playerMat.map;
      this.playerMat.map = pTex;
      if (wasNull) this.playerMat.needsUpdate = true;
    }

    const timeSec = nowMs * 0.001;
    const pose = getEntitySwimPose(p.x, p.y, timeSec, 0);
    const submergeBlend = Math.max(0, Math.min(1, (pose.waterDepth - 2.5) / 8.5));
    const bob = (isMoving ? Math.abs(Math.sin(nowMs * 0.015)) * 3.5 : 0) * (1 - submergeBlend * 0.5);
    const activeAngle = ds.active ? ds.fatalAngle + deathProgress * 0.25 : p.angle;
    const cardLocalY = (ds.active ? 5 : 19 - submergeBlend * 11.5) + bob;

    this.playerGroup.position.set(p.x, pose.baseY, p.y);
    this.playerCard.position.y = cardLocalY;
    this.playerCard.rotation.set(
      ds.active ? -Math.PI * 0.47 : TILT_X + pose.tiltX * 0.32,
      ds.active ? 0 : pose.tiltZ * 0.32,
      -activeAngle
    );
    this.playerShadowProxy.visible = !ds.active && pose.waterDepth < 2.0;
    this.playerContactShadow.visible = pose.waterDepth < 1.5;

    // Sync 3D Weapon Shadow Proxy Rig + Directional Weapon Ground Shadow
    if (!ds.active) {
      const kick = Math.min(8, weaponRecoil * 0.85);
      this.weaponShadowGroup.visible = pose.waterDepth < 1.8;
      this.weaponShadowGroup.position.y = cardLocalY + 1;
      this.weaponShadowGroup.rotation.y = -activeAngle;

      if (p.currentWeapon === WeaponType.GLOCK_19) {
        this.weaponStockProxy.scale.set(10, 5, 7);
        this.weaponStockProxy.position.set(11 - kick * 0.4, -1, 0);
        this.weaponBodyProxy.scale.set(18, 6, 5.5);
        this.weaponBodyProxy.position.set(20 - kick, 0.5, 0);
        this.weaponBarrelProxy.scale.set(8, 4.5, 4.5);
        this.weaponBarrelProxy.position.set(30 - kick * 0.8, 0, 0);
      } else if (p.currentWeapon === WeaponType.BENELLI_M4) {
        this.weaponStockProxy.scale.set(12, 6, 6);
        this.weaponStockProxy.position.set(-1 - kick * 0.8, 0, 0);
        this.weaponBodyProxy.scale.set(20, 7, 7);
        this.weaponBodyProxy.position.set(15 - kick, 0.5, 0);
        this.weaponBarrelProxy.scale.set(19, 4.5, 4.5);
        this.weaponBarrelProxy.position.set(34 - kick, 0.5, 0);
      } else {
        // SCAR-L CQC
        this.weaponStockProxy.scale.set(12, 6, 6);
        this.weaponStockProxy.position.set(-1 - kick * 0.7, 0, 0);
        this.weaponBodyProxy.scale.set(28, 7.5, 7);
        this.weaponBodyProxy.position.set(18 - kick * 0.85, 1, 0);
        this.weaponBarrelProxy.scale.set(15, 4.5, 4.5);
        this.weaponBarrelProxy.position.set(38 - kick * 0.85, 0.5, 0);
      }

      const wShadowTex = this.getWeaponGroundShadowTexture(p.currentWeapon);
      if (this.weaponGroundShadowMat.map !== wShadowTex) {
        const wasNull = !this.weaponGroundShadowMat.map;
        this.weaponGroundShadowMat.map = wShadowTex;
        if (wasNull) this.weaponGroundShadowMat.needsUpdate = true;
      }
      const shOffX = dn.shadowDirX * 14 * dn.shadowStretch;
      const shOffZ = dn.shadowDirY * 14 * dn.shadowStretch;
      this.weaponGroundShadow.position.set(p.x + shOffX, pose.baseY + 0.37, p.y + shOffZ);
      this.weaponGroundShadow.rotation.set(-Math.PI / 2, 0, -activeAngle);
      this.weaponGroundShadow.visible = pose.waterDepth < 1.3;
    } else {
      this.weaponShadowGroup.visible = false;
      this.weaponGroundShadow.visible = false;
    }

    // Dropped weapon & weapon shadow + expanding blood pool when downed
    if (ds.active) {
      const dwTex = this.getDroppedWeaponTexture(ds.droppedWeapon.type, p.radius);
      if (this.droppedWeaponMat.map !== dwTex) {
        const wasNull = !this.droppedWeaponMat.map;
        this.droppedWeaponMat.map = dwTex;
        if (wasNull) this.droppedWeaponMat.needsUpdate = true;
      }

      const dwWalkY = getIslandWalkableY(ds.droppedWeapon.x, ds.droppedWeapon.y);
      const dwDepth = getWaterDepth(ds.droppedWeapon.x, ds.droppedWeapon.y);
      const dwBaseY = dwDepth > 0.5 ? SEA_LEVEL_Y + 0.5 : dwWalkY + 5.5;

      this.droppedWeaponMesh.position.set(ds.droppedWeapon.x, dwBaseY, ds.droppedWeapon.y);
      this.droppedWeaponMesh.rotation.set(-Math.PI / 2, 0, -ds.droppedWeapon.angle);
      this.droppedWeaponMesh.visible = true;

      const dwShadowTex = this.getWeaponGroundShadowTexture(ds.droppedWeapon.type);
      if (this.droppedWeaponShadowMat.map !== dwShadowTex) {
        const wasNull = !this.droppedWeaponShadowMat.map;
        this.droppedWeaponShadowMat.map = dwShadowTex;
        if (wasNull) this.droppedWeaponShadowMat.needsUpdate = true;
      }
      this.droppedWeaponShadow.position.set(
        ds.droppedWeapon.x + dn.shadowDirX * 5.5 * dn.shadowStretch,
        dwWalkY + 0.42,
        ds.droppedWeapon.y + dn.shadowDirY * 5.5 * dn.shadowStretch
      );
      this.droppedWeaponShadow.rotation.set(-Math.PI / 2, 0, -ds.droppedWeapon.angle);
      this.droppedWeaponShadow.visible = dwDepth < 1.2;

      this.droppedWeaponShadowProxy.position.set(ds.droppedWeapon.x, dwWalkY + 5.5, ds.droppedWeapon.y);
      this.droppedWeaponShadowProxy.rotation.set(0, -ds.droppedWeapon.angle, 0);
      this.droppedWeaponShadowProxy.visible = this.renderer.shadowMap.enabled && dwDepth < 1.2;

      const dpDepth = pose.waterDepth;
      this.deathBloodPoolMesh.position.set(
        p.x,
        dpDepth > 0.5 ? SEA_LEVEL_Y + 0.35 : pose.baseY + 0.34,
        p.y
      );
      this.deathBloodPoolMesh.scale.set(ds.bloodPoolRadius * 1.15, ds.bloodPoolRadius * 0.9, 1);
      this.deathBloodPoolMesh.rotation.set(-Math.PI / 2, 0, -ds.fatalAngle);
      this.deathBloodPoolMesh.visible = true;
    } else {
      this.droppedWeaponMesh.visible = false;
      this.droppedWeaponShadow.visible = false;
      this.droppedWeaponShadowProxy.visible = false;
      this.deathBloodPoolMesh.visible = false;
    }

    // Mythic Solar Corona
    if ((p.mythicSolarAura || 0) > 0 && !ds.active) {
      const auraS = (140 + Math.min(3, (p.mythicSolarAura || 1) - 1) * 18) / 140;
      this.solarAuraMesh.position.set(p.x, Math.max(SEA_LEVEL_Y + 0.8, pose.baseY + 1.4), p.y);
      this.solarAuraMesh.rotation.set(-Math.PI / 2, 0, -nowMs * 0.0016);
      this.solarAuraMesh.scale.setScalar(auraS * (0.94 + Math.sin(nowMs * 0.008) * 0.06));
      this.solarAuraMesh.visible = true;
    } else {
      this.solarAuraMesh.visible = false;
    }

    // Mythic Singularity Blades
    if ((p.mythicSingularity || 0) > 0 && !ds.active) {
      this.singularityBladesGroup.position.set(p.x, pose.baseY + cardLocalY, p.y);
      for (let i = 0; i < 5; i++) {
        const a = mythicOrbitAngle + (i * Math.PI * 2) / 5;
        const m = this.singularityBladesGroup.children[i] as THREE.Mesh;
        m.position.set(Math.cos(a) * 78, 0, Math.sin(a) * 78);
        m.rotation.set(TILT_X, 0, -(a + Math.PI / 2));
      }
      this.singularityBladesGroup.visible = true;
    } else {
      this.singularityBladesGroup.visible = false;
    }
  }

  public syncDrones(drones: VoidDroneState[], isDowned: boolean): void {
    for (let i = 0; i < this.droneMeshes.length; i++) {
      const mesh = this.droneMeshes[i];
      if (isDowned || i >= drones.length) {
        mesh.visible = false;
        continue;
      }
      const d = drones[i];
      mesh.position.set(d.x, 28, d.y);
      mesh.rotation.set(TILT_X, 0, -d.angle);
      mesh.visible = true;
    }
  }

  private syncBullets(bullets: Bullet[], nowMs: number): void {
    let bIdx = 0;
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      if (!this.isInView(b.x, b.y, 64)) continue;

      if (this.bulletPool.length <= bIdx) {
        const mat = new THREE.MeshBasicMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(this.decalGeo, mat);
        this.scene.add(mesh);
        this.bulletPool.push({ mesh, mat });
        this.materialsToDispose.push(mat);
      }

      const item = this.bulletPool[bIdx++];
      let tex = this.bulletTextures.GLOCK_19;
      let sx = 44;
      let sy = 15;
      let additive = false;

      if (b.isEnemy) {
        if (b.color === '#dc2626') {
          tex = this.bulletTextures.CLEAVER;
          sx = 44;
          sy = 24;
        } else if (b.color === '#a855f7') {
          tex = this.bulletTextures.VOID;
          sx = 42;
          sy = 18;
          additive = true;
        } else {
          tex = this.bulletTextures.ACID;
          sx = 34;
          sy = 18;
        }
      } else if (b.isRay) {
        tex = this.bulletTextures.RAY;
        sx = 58;
        sy = 18;
        additive = true;
      } else if (b.isVoidLance) {
        tex = this.bulletTextures.VOID;
        sx = 46;
        sy = 20;
        additive = true;
      } else if (b.isShrapnel) {
        tex = this.bulletTextures.SHRAPNEL;
        sx = 22;
        sy = 12;
      } else if (b.weaponType === WeaponType.BENELLI_M4) {
        tex = this.bulletTextures.BENELLI_M4;
        sx = 40;
        sy = 15;
      } else if (b.weaponType === WeaponType.SCAR_L) {
        tex = this.bulletTextures.SCAR_L;
        sx = 64;
        sy = 14;
      }

      if (item.mat.map !== tex) {
        const wasNull = !item.mat.map;
        item.mat.map = tex;
        if (wasNull) item.mat.needsUpdate = true;
      }
      item.mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      item.mesh.position.set(b.x, 16, b.y);
      const rotZ = b.isShrapnel ? -(b.ownerAngle + nowMs * 0.015) : -b.ownerAngle;
      item.mesh.rotation.set(TILT_X, 0, rotZ);
      item.mesh.scale.set(sx, sy, 1);
      item.mesh.visible = true;
    }

    for (let i = bIdx; i < this.bulletPool.length; i++) {
      this.bulletPool[i].mesh.visible = false;
    }
  }

  private syncParticles(particles: Particle[], nowMs: number): void {
    const maxParticles = this.preset.maxParticles;
    let spIdx = 0;
    let arcIdx = 0;
    for (let i = 0; i < particles.length; i++) {
      const pt = particles[i];
      if (!this.isInView(pt.x, pt.y, pt.radius * 3 + 40)) continue;

      if (pt.type === 'ENERGY_ARC' && pt.points && pt.points.length >= 2) {
        if (this.arcLinePool.length <= arcIdx) {
          const geo = new THREE.BufferGeometry();
          const buffer = new Float32Array(24 * 3);
          const attr = new THREE.BufferAttribute(buffer, 3);
          attr.setUsage(THREE.DynamicDrawUsage);
          geo.setAttribute('position', attr);
          const mat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            blending: THREE.AdditiveBlending,
          });
          const line = new THREE.Line(geo, mat);
          this.scene.add(line);
          this.arcLinePool.push({ line, mat, buffer, attr });
          this.geometriesToDispose.push(geo);
          this.materialsToDispose.push(mat);
        }
        const arc = this.arcLinePool[arcIdx++];
        const count = Math.min(24, pt.points.length);
        for (let k = 0; k < count; k++) {
          arc.buffer[k * 3] = pt.points[k].x;
          arc.buffer[k * 3 + 1] = 18;
          arc.buffer[k * 3 + 2] = pt.points[k].y;
        }
        arc.attr.needsUpdate = true;
        arc.line.geometry.setDrawRange(0, count);
        arc.mat.color.set(pt.color);
        arc.mat.opacity = Math.max(0, pt.alpha);
        arc.line.visible = true;
        continue;
      }

      if (spIdx >= maxParticles) continue;

      if (this.particlePool.length <= spIdx) {
        const mat = new THREE.MeshBasicMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(this.decalGeo, mat);
        this.scene.add(mesh);
        this.particlePool.push({ mesh, mat });
        this.materialsToDispose.push(mat);
      }

      const item = this.particlePool[spIdx++];
      let tex = this.particleTextures.dot;
      let szX = pt.radius * 2;
      let szY = pt.radius * 2;
      let additive = false;
      let heightY = pt.z !== undefined ? Math.max(0.6, pt.z) : 12;
      let rotX = TILT_X;
      let rotZ = -(pt.rotation || 0);
      let tintHex: string | number = pt.color || '#ffffff';

      if (pt.type === 'BLOOD' || pt.type === 'TOXIC_ACID') {
        tex = this.particleTextures.bloodDrop;
        const speed = Math.hypot(pt.vx, pt.vy);
        const streak = 1 + Math.min(1.4, speed * 0.006);
        szX = pt.radius * 2.5 * streak;
        szY = pt.radius * 1.9;
        rotZ = -Math.atan2(pt.vy, pt.vx);
      } else if (pt.type === 'SMOKE') {
        const key = pt.color.includes('132, 204')
          ? 'smoke_toxic'
          : pt.color.includes('234, 88') || pt.color.includes('fb923c')
            ? 'smoke_ember'
            : pt.color.includes('15, 23') || pt.color.includes('30, 41')
              ? 'smoke_dark'
              : 'smoke_mid';
        tex = this.particleTextures[key];
        szX = pt.radius * 3.15;
        szY = szX;
        tintHex = '#ffffff';
        heightY = 18;
      } else if (pt.type === 'EXPLOSION') {
        tex = this.particleTextures.fire_fire;
        szX = pt.radius * 2.8;
        szY = szX;
        additive = true;
        tintHex = '#ffffff';
        heightY = 20;
      } else if (pt.type === 'WATER_RING') {
        tex = this.particleTextures.ring;
        szX = pt.radius * 2.1;
        szY = szX;
        additive = false;
        rotX = -Math.PI / 2;
        rotZ = 0;
        heightY = SEA_LEVEL_Y + 0.85 + getOceanWaveHeight(pt.x, pt.y, nowMs * 0.001);
        item.mesh.renderOrder = 8;
      } else if (pt.type === 'WATER_SPLASH') {
        tex = this.particleTextures.waterDrop;
        szX = pt.radius * 2.5;
        szY = szX;
        additive = false;
        heightY = SEA_LEVEL_Y + Math.max(0.8, pt.z ?? 5);
        item.mesh.renderOrder = 9;
      } else if (
        pt.type === 'SHOCKWAVE_HEAT' ||
        pt.type === 'FIRE_RING' ||
        pt.type === 'PLASMA_RING' ||
        pt.type === 'RAY_RING' ||
        pt.type === 'MYTHIC_NOVA'
      ) {
        tex = this.particleTextures.ring;
        szX = pt.radius * 2.1;
        szY = szX;
        additive = true;
        rotX = -Math.PI / 2;
        rotZ = 0;
        heightY = 3;
      } else if (pt.type === 'MUZZLE_FLARE') {
        tex = this.particleTextures.flare;
        szX = pt.radius * 2.6;
        szY = szX;
        additive = true;
        tintHex = pt.color;
        heightY = 16;
      } else if (pt.type === 'CASING') {
        szX = pt.radius >= 2.0 ? 5.5 : 4.2;
        szY = szX * 0.45;
        heightY = 10 + Math.sin(nowMs * 0.02) * 3;
      } else if (pt.type === 'SPARK' || pt.type === 'FLAME' || pt.type === 'LEVEL_UP') {
        tex = this.particleTextures.light_white;
        szX = pt.radius * 3.5;
        szY = szX;
        additive = true;
      }

      if (item.mat.map !== tex) {
        const wasNull = !item.mat.map;
        item.mat.map = tex;
        if (wasNull) item.mat.needsUpdate = true;
      }
      if (pt.type !== 'WATER_RING' && pt.type !== 'WATER_SPLASH') {
        item.mesh.renderOrder = 0;
      }
      item.mat.color.set(tintHex);
      item.mat.opacity = Math.max(0, Math.min(1, pt.alpha));
      item.mat.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      item.mesh.position.set(pt.x, heightY, pt.y);
      item.mesh.rotation.set(rotX, 0, rotZ);
      item.mesh.scale.set(szX, szY, 1);
      item.mesh.visible = true;
    }

    for (let i = spIdx; i < this.particlePool.length; i++) {
      this.particlePool[i].mesh.visible = false;
    }
    for (let i = arcIdx; i < this.arcLinePool.length; i++) {
      this.arcLinePool[i].line.visible = false;
    }
  }

  private updateFireflies(camX: number, camZ: number, nowMs: number, dn: DayNightState): void {
    if (!this.preset.fireflies) {
      this.fireflyPoints.visible = false;
      return;
    }
    this.fireflyPoints.visible = true;

    const t = nowMs * 0.001;
    const pos = this.fireflyPoints.geometry.attributes.position as THREE.BufferAttribute;
    const ffActive = dn.fireflyStrength > 0.08;
    this.fireflyMat.color.setHex(ffActive ? 0xbef264 : dn.sunWarmth > 0.45 ? 0xfde68a : 0xbae6fd);
    this.fireflyMat.opacity = ffActive
      ? 0.45 + dn.fireflyStrength * 0.52
      : 0.28 + Math.sin(t * 1.4) * 0.08;
    this.fireflyMat.size = ffActive ? 17 : 11;

    for (let i = 0; i < this.fireflyCount; i++) {
      const bx = this.fireflySeeds[i * 3];
      const by = this.fireflySeeds[i * 3 + 1];
      const bz = this.fireflySeeds[i * 3 + 2];
      pos.setXYZ(
        i,
        camX + bx + Math.sin(t * 0.55 + i) * 42,
        by + Math.sin(t * 0.8 + i * 1.7) * 12,
        camZ + bz + Math.cos(t * 0.48 + i * 1.3) * 38
      );
    }
    pos.needsUpdate = true;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const geo of this.geometriesToDispose) geo.dispose();
    for (const mat of this.materialsToDispose) mat.dispose();
    for (const tex of this.texturesToDispose) tex.dispose();
    if (this.envDayTarget) {
      this.envDayTarget.dispose();
      this.envDayTarget = null;
    }
    if (this.envGoldenTarget) {
      this.envGoldenTarget.dispose();
      this.envGoldenTarget = null;
    }
    if (this.envNightTarget) {
      this.envNightTarget.dispose();
      this.envNightTarget = null;
    }
    this.zombieCardGeo.dispose();
    this.zombieProxyGeo.dispose();
    this.zombieHpGeo.dispose();
    this.zombieRingGeo.dispose();
    this.decalGeo.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export { DAY_NIGHT_CYCLE_SECONDS };
