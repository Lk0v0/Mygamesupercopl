import React, { useState } from 'react';
import { WeaponType } from '../types';
import {
  Coins,
  X,
  Zap,
  Activity,
  Aperture,
  Crosshair,
  Flame,
  Check,
  Sparkles,
  Shield,
  Heart,
  Gauge,
  PlusCircle,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Target,
  Star,
} from 'lucide-react';
import { sound } from '../sound';
import { WeaponIllustration } from './WeaponGraphics';

export interface WeaponStoreItem {
  type: WeaponType;
  name: string;
  category: 'BALÍSTICA' | 'PESADA' | 'ALTA_ENERGIA';
  categoryLabel: string;
  description: string;
  specialTrait: string;
  damage: number;
  fireRate: number; // shots per sec
  speed: number;
  piercing: number;
  price: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const WEAPON_CATALOG: WeaponStoreItem[] = [
  {
    type: WeaponType.PISTOL,
    name: 'Pistola Tática 9mm Mk.II',
    category: 'BALÍSTICA',
    categoryLabel: 'Balística • Inicial',
    description: 'Pistola tática com compensador de recuo e mira laser de precisão. Confiável e cirúrgica.',
    specialTrait: 'Precisão cirúrgica e recuo ultra-baixo.',
    damage: 22,
    fireRate: 4.5,
    speed: 600,
    piercing: 1,
    price: 0, // Free default
    color: '#fbbf24',
    icon: Crosshair,
  },
  {
    type: WeaponType.SHOTGUN,
    name: 'Espingarda Calibre 12 Dupla',
    category: 'BALÍSTICA',
    categoryLabel: 'Balística • Dispersão',
    description: 'Dispara uma cortina devastadora de 5 chumbos simultâneos em leque. Oblitera qualquer horda próxima.',
    specialTrait: 'Dispersão quíntupla de chumbo à queima-roupa com alto impacto.',
    damage: 24,
    fireRate: 1.6,
    speed: 520,
    piercing: 1,
    price: 3500,
    color: '#f87171',
    icon: Zap,
  },
  {
    type: WeaponType.MAGNUM,
    name: 'Revólver .44 Magnum Hunter',
    category: 'BALÍSTICA',
    categoryLabel: 'Balística • Alto Calibre',
    description: 'Revólver pesado de cano longo com tambor de 6 tiros e alto poder de parada. Perfura blindagens leves.',
    specialTrait: 'Alto impacto por disparo com dupla perfuração e precisão.',
    damage: 68,
    fireRate: 2.2,
    speed: 780,
    piercing: 2,
    price: 4500,
    color: '#f59e0b',
    icon: Target,
  },
  {
    type: WeaponType.MACHINE_GUN,
    name: 'SMG Tática Vector MP-7',
    category: 'BALÍSTICA',
    categoryLabel: 'Balística • Cadência Rápida',
    description: 'Disparos contínuos e velozes com silenciador tático. Excelente para manter pressão sobre zumbis velozes.',
    specialTrait: 'Cadência veloz de 13 disparos/segundo com projéteis infinitos.',
    damage: 14,
    fireRate: 13,
    speed: 650,
    piercing: 1,
    price: 5500,
    color: '#c084fc',
    icon: Activity,
  },
  {
    type: WeaponType.ASSAULT_RIFLE,
    name: 'Fuzil de Assalto AK-47',
    category: 'BALÍSTICA',
    categoryLabel: 'Balística • Fuzil de Assalto',
    description: 'Fuzil clássico 7.62x39mm confiável em qualquer alcance. Combina boa cadência com dano sólido e perfuração.',
    specialTrait: 'Equilíbrio letal de alcance, cadência e perfuração dupla.',
    damage: 34,
    fireRate: 9.0,
    speed: 760,
    piercing: 2,
    price: 7500,
    color: '#fb923c',
    icon: Crosshair,
  },
  {
    type: WeaponType.PLASMA_RIFLE,
    name: 'Rifle de Plasma Arc-1',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Energia • Perfurante',
    description: 'Esferas condensadas de plasma elétrico que cortam fileiras inteiras e emitem arcos de choque.',
    specialTrait: 'Perfurador elétrico que atravessa 4 alvos em linha reta.',
    damage: 54,
    fireRate: 2.6,
    speed: 480,
    piercing: 4,
    price: 10000,
    color: '#38bdf8',
    icon: Aperture,
  },
  {
    type: WeaponType.LMG,
    name: 'Metralhadora Leve M249 SAW',
    category: 'PESADA',
    categoryLabel: 'Pesada • Supressão Contínua',
    description: 'Metralhadora alimentada por fita 5.56mm NATO com bipé tático. Mantém fogo pesado contínuo contra hordas.',
    specialTrait: 'Rajada sustentada de 14.5 tiros/s com perfuração dupla.',
    damage: 21,
    fireRate: 14.5,
    speed: 740,
    piercing: 2,
    price: 14000,
    color: '#eab308',
    icon: Activity,
  },
  {
    type: WeaponType.MINIGUN,
    name: 'Metralhadora Titan M134',
    category: 'PESADA',
    categoryLabel: 'Pesada • Cadência Insana',
    description: 'Seis canos rotativos táticos com supressão contínua calibrada para consumo sustentável.',
    specialTrait: 'Parede contínua de supressão tática contra grupos compactos.',
    damage: 8,
    fireRate: 16,
    speed: 700,
    piercing: 1,
    price: 16500,
    color: '#10b981',
    icon: Crosshair,
  },
  {
    type: WeaponType.SNIPER,
    name: 'Fuzil Sniper .50 BMG',
    category: 'BALÍSTICA',
    categoryLabel: 'Balística • Anti-Blindagem',
    description: 'Rifle anti-material calibre .50 com luneta de longo alcance. Dispara projéteis supersônicos devastadores.',
    specialTrait: '165 de dano massivo e perfuração de até 5 alvos em linha.',
    damage: 165,
    fireRate: 1.1,
    speed: 1350,
    piercing: 5,
    price: 20000,
    color: '#fde047',
    icon: Target,
  },
  {
    type: WeaponType.FLAMETHROWER,
    name: 'Lança-Chamas Vulcão Napalm-X',
    category: 'PESADA',
    categoryLabel: 'Pesada • Incendiário',
    description: 'Torrente de napalm fervente com penetração infinita e piloto aceso. Incinera dezenas de zumbis.',
    specialTrait: 'Penetração total e ignição em chamas contínua.',
    damage: 18,
    fireRate: 36,
    speed: 460,
    piercing: 99,
    price: 23500,
    color: '#ff5500',
    icon: Flame,
  },
  {
    type: WeaponType.ROCKET_LAUNCHER,
    name: 'Lança-Mísseis M-99 Hellfire',
    category: 'PESADA',
    categoryLabel: 'Pesada • Explosão em Área',
    description: 'Mísseis pesados de detonação explosiva maciça com mira computadorizada. Destrói grupos inteiros.',
    specialTrait: 'Dano em área massivo de 260 com dispersão explosiva.',
    damage: 260,
    fireRate: 1.4,
    speed: 580,
    piercing: 1,
    price: 28000,
    color: '#f97316',
    icon: Zap,
  },
  {
    type: WeaponType.RAYGUN,
    name: 'Pulsar Alienígena Zeta-9',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Alien • Pulsos de Íons',
    description: 'Arma extraterrestre recuperada de invasores. Emite anéis concêntricos de plasma com perfuração iônica.',
    specialTrait: 'Anéis iônicos de alta energia com perfuração dupla.',
    damage: 48,
    fireRate: 5.5,
    speed: 740,
    piercing: 2,
    price: 33500,
    color: '#00ffcc',
    icon: Sparkles,
  },
  {
    type: WeaponType.RAY_RIFLE,
    name: 'Fuzil Cristalino Zarkon',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Alien • Feixe Ionizado',
    description: 'Fuzil de guerra alienígena com espinhos de criptonita que disparam feixes verdes de alta densidade.',
    specialTrait: 'Perfura 3 monstros causando 72 de dano massivo.',
    damage: 72,
    fireRate: 8.5,
    speed: 880,
    piercing: 3,
    price: 45500,
    color: '#39ff14',
    icon: Aperture,
  },
  {
    type: WeaponType.LASER_MINIGUN,
    name: 'Laser Minigun Hiper-Feixe Omega',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Suprema • Laser Contínuo',
    description: 'A arma definitiva: 4 prismas laser rotativos disparando 28 feixes contínuos à velocidade da luz.',
    specialTrait: '28 feixes laser por segundo com penetração tripla e alcance extremo.',
    damage: 32,
    fireRate: 28,
    speed: 1050,
    piercing: 3,
    price: 60000,
    color: '#ff0055',
    icon: Radio,
  },
  {
    type: WeaponType.DESTRUCTOR,
    name: 'Nave Destructor',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Transformação • Nave + Blasters ±30° + Warp',
    description: 'Transforma você na nave Destructor equipada com dois blasters que sempre miram no cursor (±30° antes de girar a nave), disparam feixe laser contínuo e ativam o Modo Warp ao segurar Shift por 3s.',
    specialTrait: '2 Blasters no Mouse (±30°) • Laser Contínuo • Shift 3s = Modo Warp Ultra-Rápido',
    damage: 44,
    fireRate: 16,
    speed: 1800,
    piercing: 99,
    price: 41500,
    color: '#22d3ee',
    icon: Zap,
  },
  {
    type: WeaponType.INTERCEPTOR,
    name: 'Nave Interceptor',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Transformação • Asas Longas + Orbes + Warp',
    description: 'Transforma você na nave Interceptor de asas longas com dois blasters nas pontas que disparam orbes em cadência extrema, além de Modo Warp ao segurar Shift por 3s.',
    specialTrait: '2 Blasters nas Asas Longas • Rajada Extrema de Orbes • Shift 3s = Modo Warp',
    damage: 20,
    fireRate: 24,
    speed: 1250,
    piercing: 2,
    price: 50500,
    color: '#00f5d4',
    icon: Sparkles,
  },
  {
    type: WeaponType.NAVE_REI,
    name: 'Nave Rei',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Soberana • Nave Gigante + 4 Lasers + Fúria',
    description: 'Transforma você na colossal Nave Rei com 4 blasters laser. Segurar Shift por 6s gera esferas super-rápidas com eletricidade vermelha e ativa o Modo Fúria com 4 lasers vermelhos gigantes e super potentes.',
    specialTrait: '4 Blasters Laser • Shift 6s = Modo Fúria (Eletricidade Vermelha + Lasers Gigantes)',
    damage: 52,
    fireRate: 18,
    speed: 2000,
    piercing: 99,
    price: 76500,
    color: '#ef4444',
    icon: Flame,
  },
  {
    type: WeaponType.EAST_DRAGON,
    name: 'East Dragon',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Transformação • Dragão Oriental + Laser de Fogo',
    description: 'Transforma você no lendário Dragão East de corpo serpenteante articulado que desliza pelo campo e dispara um feixe de laser contínuo ardente feito de fogo vivo com efeitos de combustão e chamas.',
    specialTrait: 'Dragão Serpenteante • Laser Contínuo de Fogo Vivo • Chamas & Queimadura',
    damage: 50,
    fireRate: 20,
    speed: 2000,
    piercing: 99,
    price: 85000,
    color: '#f97316',
    icon: Flame,
  },
  {
    type: WeaponType.IRON_MAN,
    name: 'Homem de Ferro',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Armadura Stark • Repulsor + Laser',
    description: 'Transforma você no Homem de Ferro com propulsores a jato e Reator Arc. Alterne com [Shift] ou [E] entre o Modo Repulsor (disparos de plasma perfurantes de alta cadência) e o Modo Laser (feixe térmico contínuo de alta potência).',
    specialTrait: '[Shift / E] Modo Repulsor (Rajadas de Plasma) ↔ Modo Laser (Feixe Contínuo)',
    damage: 48,
    fireRate: 10,
    speed: 1350,
    piercing: 3,
    price: 95000,
    color: '#ef4444',
    icon: Zap,
  },
  {
    type: WeaponType.ICE_AND_FIRE_DRAGON,
    name: 'Ice and Fire Dragon',
    category: 'ALTA_ENERGIA',
    categoryLabel: 'Dragões Gêmeos • Fogo + Gelo + Fusão Roxo',
    description: 'Invoca dois dragões serpenteantes (Fogo e Gelo) que seguem você em combate. Aperte [Shift] para alternar qual dragão ataca com feixe contínuo de chamas ou gelo congelante, e aperte [Q] para fundir ambos em um Mega Dragão Roxo devastador!',
    specialTrait: '[Shift] Fogo ↔ Gelo • [Q] Fusão Mega Dragão Roxo (10s)',
    damage: 62,
    fireRate: 20,
    speed: 2000,
    piercing: 99,
    price: 115000,
    color: '#a855f7',
    icon: Flame,
  },
];

interface StoreScreenProps {
  coins: number;
  unlockedWeapons: WeaponType[];
  equippedWeapon: WeaponType;
  onBuyWeapon: (weaponType: WeaponType, price: number) => boolean;
  onEquipWeapon: (weaponType: WeaponType) => void;
  onBuyShieldUpgrade: () => void;
  onBuyHealthUpgrade: () => void;
  onBuySpeedUpgrade: () => void;
  onBuyDamageUpgrade: () => void;
  onBuyLuckUpgrade: () => void;
  maxShieldLevel: number;
  maxHealthLevel: number;
  speedLevel: number;
  damageLevel: number;
  luckLevel: number;
  onAddTestCoins?: () => void;
  onClose: () => void;
}

type TabType = 'ALL' | 'BALLISTIC' | 'HEAVY' | 'ENERGY' | 'UPGRADES';

export const StoreScreen: React.FC<StoreScreenProps> = ({
  coins,
  unlockedWeapons,
  equippedWeapon,
  onBuyWeapon,
  onEquipWeapon,
  onBuyShieldUpgrade,
  onBuyHealthUpgrade,
  onBuySpeedUpgrade,
  onBuyDamageUpgrade,
  onBuyLuckUpgrade,
  maxShieldLevel,
  maxHealthLevel,
  speedLevel,
  damageLevel,
  luckLevel,
  onAddTestCoins,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setPurchaseSuccess(msg);
    setPurchaseError(null);
    sound.playPowerup();
    setTimeout(() => setPurchaseSuccess(null), 3000);
  };

  const showError = (msg: string) => {
    setPurchaseError(msg);
    setPurchaseSuccess(null);
    sound.playZombieHit();
    setTimeout(() => setPurchaseError(null), 3000);
  };

  const handleBuy = (item: WeaponStoreItem) => {
    if (coins < item.price) {
      showError(`Créditos insuficientes! Você precisa de ${item.price.toLocaleString()} CRED.`);
      return;
    }

    const success = onBuyWeapon(item.type, item.price);
    if (success) {
      showSuccess(`${item.name} desbloqueada e EQUIPADA com sucesso!`);
    } else {
      showError('Não foi possível concluir a transação.');
    }
  };

  const handleEquip = (item: WeaponStoreItem) => {
    onEquipWeapon(item.type);
    showSuccess(`${item.name} equipada como sua arma ativa!`);
  };

  const handleHealthUpgrade = () => {
    const cost = (maxHealthLevel + 1) * 200;
    if (coins < cost) {
      showError(`Créditos insuficientes! Requer ${cost} CRED.`);
      return;
    }
    onBuyHealthUpgrade();
    showSuccess(`Vida Máxima aprimorada permanentemente para Nível ${maxHealthLevel + 1}!`);
  };

  const handleShieldUpgrade = () => {
    const cost = (maxShieldLevel + 1) * 250;
    if (coins < cost) {
      showError(`Créditos insuficientes! Requer ${cost} CRED.`);
      return;
    }
    onBuyShieldUpgrade();
    showSuccess(`Escudo Tático aprimorado permanentemente para Nível ${maxShieldLevel + 1}!`);
  };

  const handleSpeedUpgrade = () => {
    if (speedLevel >= 5) {
      showError('Velocidade de movimento já está no nível máximo!');
      return;
    }
    const cost = (speedLevel + 1) * 250;
    if (coins < cost) {
      showError(`Créditos insuficientes! Requer ${cost} CRED.`);
      return;
    }
    onBuySpeedUpgrade();
    showSuccess(`Velocidade de Corrida aprimorada para Nível ${speedLevel + 1}!`);
  };

  const handleDamageUpgrade = () => {
    if (damageLevel >= 5) {
      showError('Dano Global já está no nível máximo!');
      return;
    }
    const cost = (damageLevel + 1) * 350;
    if (coins < cost) {
      showError(`Créditos insuficientes! Requer ${cost} CRED.`);
      return;
    }
    onBuyDamageUpgrade();
    showSuccess(`Balística Aprimorada (+10% Dano) no Nível ${damageLevel + 1}!`);
  };

  const handleLuckUpgrade = () => {
    if (luckLevel >= 5) {
      showError('Radar de Sorte já está no nível máximo!');
      return;
    }
    const cost = (luckLevel + 1) * 300;
    if (coins < cost) {
      showError(`Créditos insuficientes! Requer ${cost} CRED.`);
      return;
    }
    onBuyLuckUpgrade();
    showSuccess(`Radar de Raridade aprimorado! Mais chance de Power-Ups Raros, Épicos, Lendários e Míticos!`);
  };

  // Filter weapons based on active tab
  const filteredWeapons = WEAPON_CATALOG.filter((w) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'BALLISTIC') return w.category === 'BALÍSTICA';
    if (activeTab === 'HEAVY') return w.category === 'PESADA';
    if (activeTab === 'ENERGY') return w.category === 'ALTA_ENERGIA';
    return false;
  });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-2 sm:p-4 overflow-hidden select-none">
      <div className="w-full max-w-6xl h-[94dvh] bg-slate-900 border border-cyan-500/20 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.12)] relative overflow-hidden">

        {/* Top Header */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 pb-2.5 sm:pb-4 border-b border-white/10 shrink-0 relative z-10">
          <div className="min-w-0">
            <div className="hidden sm:flex items-center gap-2 text-cyan-400 text-[10px] font-mono font-black tracking-widest uppercase mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CENTRO DE ARMAMENTOS & SOBREVIVÊNCIA</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] text-cyan-300 font-sans font-bold">
                MUNIÇÃO INFINITA ∞
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 uppercase italic tracking-wider truncate">
              Loja & Armaria Tática
            </h2>
            <p className="hidden md:block text-slate-400 text-xs mt-0.5">
              Desbloqueie armas com munição infinita e equipe <span className="text-cyan-300 font-bold">1 arma principal</span> para dominar as hordas!
            </p>
          </div>

          {/* Right Wallet & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wallet Display */}
            <div className="bg-slate-950/85 border border-cyan-500/30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              </div>
              <div className="flex flex-col">
                <span className="hidden sm:block text-[9px] font-mono text-slate-400 font-bold tracking-widest uppercase leading-none">CRÉDITOS</span>
                <span className="text-sm sm:text-lg font-black text-white font-mono flex items-center gap-1 leading-none mt-0.5 tabular-nums">
                  {coins.toLocaleString()} <span className="text-[10px] text-amber-400 font-bold">CRED</span>
                </span>
              </div>
            </div>

            {/* Test Coins Bonus Button */}
            {onAddTestCoins && (
              <button
                onClick={() => {
                  sound.playPowerup();
                  onAddTestCoins();
                  showSuccess('+1.000 Créditos adicionados para teste!');
                }}
                className="px-2.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                title="Adicionar moedas de teste"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">+1.000</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playPowerup();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 border border-white/10 hover:border-white/30 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Fechar Loja"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Status Alerts Toast */}
        {purchaseSuccess && (
          <div className="mt-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs md:text-sm font-bold shadow-lg animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{purchaseSuccess}</span>
          </div>
        )}
        {purchaseError && (
          <div className="mt-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs md:text-sm font-bold shadow-lg animate-fade-in shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{purchaseError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 py-2 sm:py-3 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => { sound.playPowerup(); setActiveTab('ALL'); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-slate-950/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            Todas ({WEAPON_CATALOG.length})
          </button>
          <button
            onClick={() => { sound.playPowerup(); setActiveTab('BALLISTIC'); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'BALLISTIC'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-slate-950/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            Balísticas
          </button>
          <button
            onClick={() => { sound.playPowerup(); setActiveTab('HEAVY'); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'HEAVY'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-slate-950/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            Pesadas
          </button>
          <button
            onClick={() => { sound.playPowerup(); setActiveTab('ENERGY'); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ENERGY'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-slate-950/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            Energia & Alien
          </button>
          <button
            onClick={() => { sound.playPowerup(); setActiveTab('UPGRADES'); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'UPGRADES'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'bg-slate-950/60 border border-white/10 text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-800/80'
            }`}
          >
            ★ Upgrades
          </button>
        </div>

        {/* Scrollable Main Catalog Area */}
        <div className="flex-1 overflow-y-auto pr-1 pb-3 space-y-3">
          {/* WEAPONS GRID */}
          {activeTab !== 'UPGRADES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWeapons.map((item) => {
                const Icon = item.icon;
                const isUnlocked = unlockedWeapons.includes(item.type) || item.price === 0;
                const isEquipped = equippedWeapon === item.type;
                const canAfford = coins >= item.price;

                return (
                  <div
                    key={item.type}
                    className={`rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-colors relative overflow-hidden ${
                      isEquipped
                        ? 'bg-cyan-950/45 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : isUnlocked
                          ? 'bg-slate-950/75 border border-white/15 hover:border-cyan-500/40'
                          : 'bg-slate-950/55 border border-white/10 hover:border-white/20 opacity-95'
                    }`}
                  >
                    {/* Top indicator ribbon */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">
                        {item.categoryLabel}
                      </span>
                      
                      {isEquipped ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          <Check className="w-3 h-3 text-cyan-300 stroke-[3]" /> EQUIPADA
                        </span>
                      ) : isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                          DESBLOQUEADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold font-mono">
                          {item.price.toLocaleString()} CRED
                        </span>
                      )}
                    </div>

                    {/* Weapon Info & Icon Header */}
                    <div>
                      {(item.type === WeaponType.DESTRUCTOR || item.type === WeaponType.INTERCEPTOR || item.type === WeaponType.NAVE_REI || item.type === WeaponType.EAST_DRAGON || item.type === WeaponType.IRON_MAN || item.type === WeaponType.ICE_AND_FIRE_DRAGON) && (
                        <div className={`mb-3 rounded-xl bg-slate-950/85 border p-2 flex items-center justify-center ${
                          item.type === WeaponType.ICE_AND_FIRE_DRAGON
                            ? 'border-purple-500/60'
                            : item.type === WeaponType.IRON_MAN
                              ? 'border-amber-400/50'
                              : item.type === WeaponType.EAST_DRAGON
                                ? 'border-orange-500/50'
                                : item.type === WeaponType.NAVE_REI
                                  ? 'border-red-500/50'
                                  : item.type === WeaponType.INTERCEPTOR
                                    ? 'border-emerald-400/40'
                                    : 'border-cyan-400/40'
                        }`}>
                          <WeaponIllustration type={item.type} className="w-full h-24" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-2.5">
                        <div 
                          className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-lg"
                          style={{ 
                            backgroundColor: `${item.color}18`, 
                            borderColor: `${item.color}40`,
                            boxShadow: `0 0 15px ${item.color}20` 
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-white text-base md:text-lg leading-tight truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono font-black flex items-center gap-1 text-cyan-400">
                              Munição: ∞ Infinita
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed mb-3 min-h-[36px]">
                        {item.description}
                      </p>

                      {/* Trait Highlight */}
                      <div className="bg-slate-900/80 border border-white/5 rounded-xl px-2.5 py-1.5 mb-3">
                        <span className="text-[10px] font-mono font-medium text-slate-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 shrink-0 text-cyan-400" />
                          <span className="truncate">{item.specialTrait}</span>
                        </span>
                      </div>

                      {/* Weapon Stats Bars */}
                      <div className="space-y-1.5 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                        {/* Damage */}
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">DANO BASE</span>
                          <span className="text-white font-bold">{item.damage}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${Math.min(100, (item.damage / 240) * 100)}%` }} 
                          />
                        </div>

                        {/* Fire Rate */}
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                          <span className="text-slate-400">CADÊNCIA</span>
                          <span className="text-white font-bold">{item.fireRate}/s</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-400 rounded-full" 
                            style={{ width: `${Math.min(100, (item.fireRate / 35) * 100)}%` }} 
                          />
                        </div>

                        {/* Piercing */}
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                          <span className="text-slate-400">PERFURAÇÃO</span>
                          <span className="text-white font-bold">
                            {item.piercing >= 90 ? 'ILIMITADA' : `${item.piercing} Alvos`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-400 rounded-full" 
                            style={{ width: `${item.piercing >= 90 ? 100 : Math.min(100, (item.piercing / 4) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-1 pt-2 border-t border-white/5">
                      {isEquipped ? (
                        <div className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                          <Check className="w-4 h-4 stroke-[3]" /> EM COMBATE (EQUIPADA)
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleEquip(item)}
                          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                          EQUIPAR ESTA ARMA
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-[0.98]'
                              : 'bg-slate-800/60 border border-white/5 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          {canAfford ? `COMPRAR • ${item.price.toLocaleString()} CRED` : `REQUER ${item.price.toLocaleString()} CRED`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SURVIVOR UPGRADES TAB */}
          {activeTab === 'UPGRADES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Max Health Upgrade */}
              <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-lg">Vitalidade Máxima</h4>
                      <span className="text-[10px] font-mono font-black bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full uppercase">
                        Nível {maxHealthLevel}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Aumenta permanentemente o HP máximo inicial do seu sobrevivente por <span className="text-rose-400 font-bold">+15 HP</span> por nível para todas as partidas.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-300">
                      <span>HP Base Atual: <strong className="text-rose-400 font-bold">{100 + maxHealthLevel * 15} HP</strong></span>
                      <span>→</span>
                      <span>Próximo: <strong className="text-emerald-400 font-bold">{100 + (maxHealthLevel + 1) * 15} HP</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">CUSTO DO UPGRADE</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {((maxHealthLevel + 1) * 200).toLocaleString()} CRED
                    </span>
                  </div>
                  <button
                    onClick={handleHealthUpgrade}
                    className="px-5 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500 text-rose-300 hover:text-white font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md"
                  >
                    UPGRADE +15 HP
                  </button>
                </div>
              </div>

              {/* Energy Shield Upgrade */}
              <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-lg">Escudo de Energia Tático</h4>
                      <span className="text-[10px] font-mono font-black bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full uppercase">
                        Nível {maxShieldLevel}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Inicie as partidas com barreira de escudo de energia que absorve dano e <span className="text-cyan-400 font-bold">se regenera automaticamente</span> ao sair de combate.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-300">
                      <span>Escudo Atual: <strong className="text-cyan-400 font-bold">{maxShieldLevel * 20} Pontos</strong></span>
                      <span>→</span>
                      <span>Próximo: <strong className="text-emerald-400 font-bold">{(maxShieldLevel + 1) * 20} Pontos</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">CUSTO DO UPGRADE</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {((maxShieldLevel + 1) * 250).toLocaleString()} CRED
                    </span>
                  </div>
                  <button
                    onClick={handleShieldUpgrade}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md"
                  >
                    UPGRADE +20 ESCUDO
                  </button>
                </div>
              </div>

              {/* Movement Speed Upgrade */}
              <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                    <Gauge className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-lg">Propulsores de Corrida</h4>
                      <span className="text-[10px] font-mono font-black bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full uppercase">
                        Nível {speedLevel}/5
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Melhora a velocidade de locomoção tática em <span className="text-amber-400 font-bold">+8%</span> por nível para manobrar e fugir de enxames de infectados.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-300">
                      <span>Bônus Atual: <strong className="text-amber-400 font-bold">+{speedLevel * 8}%</strong></span>
                      {speedLevel < 5 && (
                        <>
                          <span>→</span>
                          <span>Próximo: <strong className="text-emerald-400 font-bold">+{(speedLevel + 1) * 8}%</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">CUSTO DO UPGRADE</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {speedLevel >= 5 ? 'MÁXIMO' : `${((speedLevel + 1) * 250).toLocaleString()} CRED`}
                    </span>
                  </div>
                  <button
                    onClick={handleSpeedUpgrade}
                    disabled={speedLevel >= 5}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-md ${
                      speedLevel >= 5
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500 text-amber-300 hover:text-slate-950 cursor-pointer'
                    }`}
                  >
                    {speedLevel >= 5 ? 'NÍVEL MÁX' : 'UPGRADE +8% VEL'}
                  </button>
                </div>
              </div>

              {/* Global Weapon Damage Upgrade */}
              <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-lg">Balística de Alta Precisão</h4>
                      <span className="text-[10px] font-mono font-black bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full uppercase">
                        Nível {damageLevel}/5
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Adiciona <span className="text-purple-400 font-bold">+10% de dano base</span> em todas as suas armas com projéteis infinitos permanentemente.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-300">
                      <span>Dano Extra Atual: <strong className="text-purple-400 font-bold">+{damageLevel * 10}%</strong></span>
                      {damageLevel < 5 && (
                        <>
                          <span>→</span>
                          <span>Próximo: <strong className="text-emerald-400 font-bold">+{(damageLevel + 1) * 10}%</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">CUSTO DO UPGRADE</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {damageLevel >= 5 ? 'MÁXIMO' : `${((damageLevel + 1) * 350).toLocaleString()} CRED`}
                    </span>
                  </div>
                  <button
                    onClick={handleDamageUpgrade}
                    disabled={damageLevel >= 5}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-md ${
                      damageLevel >= 5
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500 text-purple-300 hover:text-white cursor-pointer'
                    }`}
                  >
                    {damageLevel >= 5 ? 'NÍVEL MÁX' : 'UPGRADE +10% DANO'}
                  </button>
                </div>
              </div>

              {/* Luck / Better Power-Up Rarity Boost Upgrade */}
              <div className="sm:col-span-2 bg-gradient-to-br from-slate-950/85 via-emerald-950/25 to-amber-950/20 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 shrink-0">
                    <Star className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-white text-lg">Radar de Sorte & Raridade</h4>
                      <span className="text-[10px] font-mono font-black bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full uppercase">
                        Nível {luckLevel}/5
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-400/30 text-amber-300 px-2 py-0.5 rounded-full uppercase">
                        Boost de Power-Ups
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Aumenta drasticamente a chance de aparecerem Power-Ups <span className="text-sky-300 font-bold">Raros</span>, <span className="text-purple-300 font-bold">Épicos</span>, <span className="text-amber-300 font-bold">Lendários</span> e <span className="text-fuchsia-300 font-bold">Míticos</span> ao subir de nível e usar Reroll!
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-mono text-slate-300">
                      <span>Sorte Atual: <strong className="text-emerald-400 font-bold">+{luckLevel * 20}% Raridade</strong></span>
                      {luckLevel < 5 && (
                        <>
                          <span>→</span>
                          <span>Próximo: <strong className="text-amber-300 font-bold">+{(luckLevel + 1) * 20}% Raridade</strong></span>
                        </>
                      )}
                      <span className="text-slate-500">•</span>
                      <span className="text-fuchsia-300/90">
                        Chance Mítico Base: +{(luckLevel * 1.5).toFixed(1)}% | Lendário: +{luckLevel * 4.5}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">CUSTO DO UPGRADE</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {luckLevel >= 5 ? 'MÁXIMO' : `${((luckLevel + 1) * 300).toLocaleString()} CRED`}
                    </span>
                  </div>
                  <button
                    onClick={handleLuckUpgrade}
                    disabled={luckLevel >= 5}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-md ${
                      luckLevel >= 5
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-emerald-500/20 border border-emerald-400/50 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 cursor-pointer'
                    }`}
                  >
                    {luckLevel >= 5 ? 'NÍVEL MÁX' : 'UPGRADE +20% SORTE'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Bar: Quick Summary and Exit */}
        <div className="pt-2.5 sm:pt-3.5 border-t border-white/10 flex flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
            <span className="hidden sm:inline px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 font-mono text-cyan-300 font-bold uppercase text-[10px]">
              Arma
            </span>
            <span className="text-white font-bold truncate">
              {WEAPON_CATALOG.find(w => w.type === equippedWeapon)?.name || 'Pistola Tática'}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-cyan-400 font-mono text-[11px]">Munição ∞</span>
          </div>

          <button
            onClick={() => {
              sound.playPowerup();
              onClose();
            }}
            className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-[0.98] cursor-pointer shrink-0"
          >
            Confirmar e Voltar
          </button>
        </div>

      </div>
    </div>
  );
};
