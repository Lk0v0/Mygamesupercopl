import React, { useState } from 'react';
import { WeaponType } from '../types';
import {
  Coins,
  X,
  Zap,
  Crosshair,
  Check,
  Sparkles,
  Shield,
  Heart,
  Gauge,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Target,
  Star,
  Shirt,
  Flame,
  Rocket,
} from 'lucide-react';
import { sound } from '../sound';
import { WeaponIllustration } from './WeaponGraphics';
import { OPERATOR_SKINS } from './OperatorSkins';
import { OperatorAvatarPreview } from './OperatorVisuals';

export interface WeaponStoreItem {
  type: WeaponType;
  name: string;
  categoryLabel: string;
  description: string;
  specialTrait: string;
  damage: number;
  pellets?: number;
  fireRate: number;
  speed: number;
  piercing: number;
  price: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const WEAPON_CATALOG: WeaponStoreItem[] = [
  {
    type: WeaponType.GLOCK_19,
    name: 'Glock 19 Gen5 MOS',
    categoryLabel: 'Pistola Tática · 9×19mm NATO',
    description:
      'Pistola semiautomática de polímero com ferrolho MOS, mira holográfica Trijicon RMR e lanterna tática TLR-7A. Confiável e precisa.',
    specialTrait: 'Inicial Gratuita · Alta precisão, recuo leve e disparo rápido.',
    damage: 15,
    fireRate: 5.8,
    speed: 840,
    piercing: 1,
    price: 0,
    color: '#fbbf24',
    icon: Crosshair,
  },
  {
    type: WeaponType.MP5_A5,
    name: 'HK MP5A5 9mm',
    categoryLabel: 'Submetralhadora · 9×19mm Silenciada',
    description:
      'SMG alemã de ação por roletes equipada com supressor tático, mira Aimpoint Micro T-2 e carregador curvo de 30 munições.',
    specialTrait: '13.5 tiros/s · Cadência veloz com controle de recuo exemplar.',
    damage: 11,
    fireRate: 13.5,
    speed: 880,
    piercing: 1,
    price: 1600,
    color: '#34d399',
    icon: Zap,
  },
  {
    type: WeaponType.BENELLI_M4,
    name: 'Benelli M4 Super 90',
    categoryLabel: 'Escopeta Tática · Calibre 12',
    description:
      'Escopeta semiautomática militar com sistema a gás ARGO, trilho Picatinny, suporte lateral de cartuchos e freio de boca breacher.',
    specialTrait: 'Dispara 7 chumbos 00 Buckshot por tiro (70 de dano total).',
    damage: 10,
    pellets: 7,
    fireRate: 2.35,
    speed: 700,
    piercing: 1,
    price: 2800,
    color: '#f87171',
    icon: Zap,
  },
  {
    type: WeaponType.FLAMETHROWER,
    name: 'M2A1-7 Lança-Chamas',
    categoryLabel: 'Arma Incendiária · Napalm Pressurizado',
    description:
      'Tanques duplos pressurizados alimentam um bico ignitor contínuo que projeta jatos de napalm líquido capazes de incendiar hordas inteiras.',
    specialTrait: 'Cone incendiário perfurante (7 alvos) + queimadura contínua.',
    damage: 14,
    pellets: 2,
    fireRate: 15.5,
    speed: 540,
    piercing: 7,
    price: 4800,
    color: '#f97316',
    icon: Flame,
  },
  {
    type: WeaponType.SCAR_L,
    name: 'FN SCAR-L CQC',
    categoryLabel: 'Carabina de Assalto · 5.56×45mm',
    description:
      'Carabina modular FDE de operações especiais com mira EOTech EXPS3 + G33, módulo laser PEQ-15 e carregador PMAG.',
    specialTrait: '9.8 tiros/s de alta velocidade com perfuração dupla.',
    damage: 22,
    fireRate: 9.8,
    speed: 980,
    piercing: 2,
    price: 6500,
    color: '#38bdf8',
    icon: Target,
  },
  {
    type: WeaponType.AWM_SNIPER,
    name: 'AWM .338 Lapua',
    categoryLabel: 'Rifle de Precisão · .338 Lapua Magnum',
    description:
      'Fuzil antimaterial britânico de chassi verde-oliva com cano flutuante, freio de boca duplo e luneta telescópica de longo alcance.',
    specialTrait: 'Projétil hipersônico · 145 de dano atravessando até 6 alvos.',
    damage: 145,
    fireRate: 1.15,
    speed: 1580,
    piercing: 6,
    price: 9200,
    color: '#c084fc',
    icon: Target,
  },
  {
    type: WeaponType.RPG_7,
    name: 'RPG-7V2 Lança-Foguetes',
    categoryLabel: 'Lançador Antitanque · Ogiva HE',
    description:
      'Lançador portátil de tubo reforçado com proteção térmica de madeira e ogiva de alto explosivo para dizimar grupos inteiros.',
    specialTrait: 'Explosão em área (155 px) com onda de choque incendiária.',
    damage: 185,
    fireRate: 0.78,
    speed: 760,
    piercing: 1,
    price: 13500,
    color: '#fb923c',
    icon: Rocket,
  },
];

interface StoreScreenProps {
  coins: number;
  unlockedWeapons: WeaponType[];
  equippedWeapon: WeaponType;
  onBuyWeapon: (weaponType: WeaponType, price: number) => boolean;
  onEquipWeapon: (weaponType: WeaponType) => void;
  unlockedSkins: string[];
  equippedSkin: string;
  onBuySkin: (skinId: string, price: number) => boolean;
  onEquipSkin: (skinId: string) => void;
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

type TabType = 'ALL' | 'SKINS' | 'UPGRADES';

export const StoreScreen: React.FC<StoreScreenProps> = ({
  coins,
  unlockedWeapons,
  equippedWeapon,
  onBuyWeapon,
  onEquipWeapon,
  unlockedSkins,
  equippedSkin,
  onBuySkin,
  onEquipSkin,
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
      showSuccess(`${item.name} desbloqueada e equipada com sucesso!`);
    } else {
      showError('Não foi possível concluir a transação.');
    }
  };

  const handleEquip = (item: WeaponStoreItem) => {
    onEquipWeapon(item.type);
    showSuccess(`${item.name} equipada como sua arma ativa!`);
  };

  const handleBuySkin = (skinId: string, name: string, price: number) => {
    if (coins < price) {
      showError(`Créditos insuficientes! Requer ${price.toLocaleString()} CRED.`);
      return;
    }
    const ok = onBuySkin(skinId, price);
    if (ok) {
      showSuccess(`Skin "${name}" desbloqueada e equipada!`);
    } else {
      showError('Não foi possível concluir a compra da skin.');
    }
  };

  const handleEquipSkin = (skinId: string, name: string) => {
    onEquipSkin(skinId);
    showSuccess(`Skin "${name}" equipada no seu operador!`);
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
    showSuccess(`Radar de Raridade aprimorado para Nível ${luckLevel + 1}!`);
  };

  const equippedWeaponName =
    WEAPON_CATALOG.find((w) => w.type === equippedWeapon)?.name || 'Glock 19 Gen5 MOS';
  const equippedSkinName =
    OPERATOR_SKINS.find((s) => s.id === equippedSkin)?.name || 'Recruta de Choque';

  return (
    <div
      data-gamepad-scope="modal"
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#050a0f]/95 backdrop-blur-md p-2 sm:p-5 pt-safe pb-safe overflow-hidden select-none"
    >
      <div className="w-full max-w-7xl h-[94dvh] bg-[#071018] border border-white/10 rounded-2xl sm:rounded-3xl flex flex-col landscape:flex-row md:flex-row relative overflow-hidden shadow-2xl">
        {/* LEFT COMMAND RAIL (Wide Desktop/Landscape) / COMPACT TOP HEADER (Portrait) */}
        <aside className="w-full landscape:w-60 md:w-72 shrink-0 bg-slate-950/75 border-b landscape:border-b-0 landscape:border-r md:border-b-0 md:border-r border-white/10 p-3 sm:p-5 flex flex-col justify-between gap-2.5 landscape:overflow-y-auto md:overflow-y-auto hud-scroll">
          <div className="flex flex-col gap-2.5 sm:gap-3.5">
            {/* Title + Close */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="hidden md:block text-[10px] font-mono text-cyan-400 uppercase tracking-[0.18em]">
                  Armaria da Ilha · Munição ∞
                </span>
                <h2 className="text-base sm:text-xl font-display font-bold text-white uppercase tracking-wide truncate">
                  Loja & Equipamentos
                </h2>
              </div>

              <button
                data-gamepad-back="true"
                onClick={() => {
                  sound.playPowerup();
                  onClose();
                }}
                className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/25 text-slate-300 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                title="Fechar Loja"
                aria-label="Fechar Loja"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallet + Dev Coins */}
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-slate-900/90 border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2.5">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="hidden md:block text-[9px] font-mono text-slate-400 uppercase leading-none">
                    Saldo Disponível
                  </span>
                  <span className="text-sm sm:text-base font-mono-numbers font-bold text-white leading-tight block truncate tabular-nums">
                    {coins.toLocaleString()} <span className="text-[10px] text-amber-300">CRED</span>
                  </span>
                </div>
              </div>

              {onAddTestCoins && (
                <button
                  onClick={() => {
                    sound.playPowerup();
                    onAddTestCoins();
                    showSuccess('+10.000 Créditos adicionados!');
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-amber-500/15 border border-amber-400/35 hover:bg-amber-500/25 text-amber-300 text-xs font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Adicionar moedas de teste"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>+10K</span>
                </button>
              )}
            </div>

            {/* Responsive Navigation Tabs (Horizontal in Portrait, Vertical in Widescreen) */}
            <div className="grid grid-cols-3 landscape:grid-cols-1 md:grid-cols-1 gap-1.5">
              <button
                onClick={() => { sound.playPowerup(); setActiveTab('ALL'); }}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-display font-bold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center landscape:justify-between md:justify-between gap-2 ${
                  activeTab === 'ALL'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>Armas</span>
                <span className="hidden sm:inline font-mono text-[10px] opacity-75">{WEAPON_CATALOG.length}</span>
              </button>

              <button
                onClick={() => { sound.playPowerup(); setActiveTab('SKINS'); }}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-display font-bold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center landscape:justify-between md:justify-between gap-2 ${
                  activeTab === 'SKINS'
                    ? 'bg-fuchsia-400 text-slate-950'
                    : 'bg-slate-900/80 border border-white/10 text-fuchsia-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 shrink-0" />
                  <span>Skins</span>
                </span>
                <span className="hidden sm:inline font-mono text-[10px] opacity-75">{OPERATOR_SKINS.length}</span>
              </button>

              <button
                onClick={() => { sound.playPowerup(); setActiveTab('UPGRADES'); }}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-display font-bold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center landscape:justify-between md:justify-between gap-2 ${
                  activeTab === 'UPGRADES'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-slate-900/80 border border-white/10 text-emerald-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>Melhorias</span>
                <span className="hidden sm:inline font-mono text-[10px] opacity-75">5</span>
              </button>
            </div>
          </div>

          {/* Active Loadout Summary + Back CTA (Desktop/Landscape) */}
          <div className="hidden landscape:flex md:flex flex-col gap-2.5 pt-3 border-t border-white/10">
            <div className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 space-y-1.5">
              <div>
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Arma Equipada
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {equippedWeaponName}
                </span>
              </div>
              <div className="pt-1.5 border-t border-white/5">
                <span className="text-[9px] font-mono text-fuchsia-400 uppercase tracking-wider block">
                  Operador Ativo
                </span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {equippedSkinName}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPowerup();
                onClose();
              }}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs tracking-widest uppercase transition-all active:scale-[0.98] cursor-pointer"
            >
              Confirmar e Voltar
            </button>
          </div>
        </aside>

        {/* RIGHT SCROLLABLE CATALOG AREA */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 p-3 sm:p-5 overflow-hidden">
          {purchaseSuccess && (
            <div className="mb-3 bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{purchaseSuccess}</span>
            </div>
          )}
          {purchaseError && (
            <div className="mb-3 bg-rose-500/15 border border-rose-500/35 text-rose-300 px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{purchaseError}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto hud-scroll pr-1 pb-2">
            {/* WEAPONS TAB */}
            {activeTab === 'ALL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {WEAPON_CATALOG.map((item) => {
                  const Icon = item.icon;
                  const isUnlocked = unlockedWeapons.includes(item.type) || item.price === 0;
                  const isEquipped = equippedWeapon === item.type;
                  const canAfford = coins >= item.price;

                  return (
                    <div
                      key={item.type}
                      className={`rounded-2xl p-4 flex flex-col justify-between transition-colors relative overflow-hidden ${
                        isEquipped
                          ? 'bg-cyan-950/35 border-2 border-cyan-400'
                          : 'bg-slate-950/75 border border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div>
                        {/* Clean Unboxed Status Header */}
                        <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 text-[10.5px] font-mono">
                          <span className="text-slate-400 uppercase tracking-wider truncate">
                            {item.categoryLabel}
                          </span>
                          {isEquipped ? (
                            <span className="inline-flex items-center gap-1 text-cyan-300 font-bold uppercase shrink-0">
                              <Check className="w-3.5 h-3.5" />
                              <span>Equipada</span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-emerald-400 font-bold uppercase shrink-0">
                              Desbloqueada
                            </span>
                          ) : (
                            <span className="text-amber-300 font-bold tabular-nums shrink-0">
                              {item.price.toLocaleString()} CRED
                            </span>
                          )}
                        </div>

                        <div className="mb-3 rounded-xl bg-slate-950/90 border border-white/10 p-2 flex items-center justify-center">
                          <WeaponIllustration type={item.type} className="w-full h-20 sm:h-24" />
                        </div>

                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${item.color}18`,
                              borderColor: `${item.color}40`,
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-white text-base leading-tight truncate">
                              {item.name}
                            </h3>
                            <span className="text-[11px] font-mono text-cyan-300 block mt-0.5">
                              Munição: ∞ Infinita
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-400 text-xs leading-snug mb-2.5">
                          {item.description}
                        </p>

                        <p className="text-[11px] font-mono text-slate-300 mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                          <span className="truncate">{item.specialTrait}</span>
                        </p>

                        {/* Stat Bars */}
                        <div className="space-y-1.5 mb-4 bg-slate-950/60 p-3 rounded-xl border border-white/5 tabular-nums">
                          <div className="flex items-center justify-between text-[10.5px] font-mono">
                            <span className="text-slate-400">DANO BASE</span>
                            <span className="text-white font-bold">
                              {item.pellets ? `${item.damage}×${item.pellets} (${item.damage * item.pellets})` : item.damage}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: `${Math.min(100, ((item.pellets ? item.damage * item.pellets : item.damage) / 185) * 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10.5px] font-mono pt-1">
                            <span className="text-slate-400">CADÊNCIA</span>
                            <span className="text-white font-bold">{item.fireRate}/s</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${Math.min(100, (item.fireRate / 16) * 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10.5px] font-mono pt-1">
                            <span className="text-slate-400">PERFURAÇÃO</span>
                            <span className="text-white font-bold">
                              {item.type === WeaponType.RPG_7
                                ? 'Explosivo AoE'
                                : `${item.piercing} ${item.piercing === 1 ? 'Alvo' : 'Alvos'}`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${Math.min(100, ((item.type === WeaponType.RPG_7 ? 7 : item.piercing) / 7) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        {isEquipped ? (
                          <div className="w-full min-h-[44px] py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/50 text-cyan-300 text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>Equipada</span>
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleEquip(item)}
                            className="w-full min-h-[44px] py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                          >
                            Equipar Arma
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuy(item)}
                            disabled={!canAfford}
                            className={`w-full min-h-[44px] py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              canAfford
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-[0.98]'
                                : 'bg-slate-800/70 border border-white/5 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4 shrink-0" />
                            <span>
                              {canAfford
                                ? `Comprar · ${item.price.toLocaleString()} CRED`
                                : `Requer ${item.price.toLocaleString()} CRED`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SKINS TAB */}
            {activeTab === 'SKINS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {OPERATOR_SKINS.map((skin) => {
                  const isUnlocked = unlockedSkins.includes(skin.id) || skin.price === 0;
                  const isEquipped = equippedSkin === skin.id;
                  const canAfford = coins >= skin.price;
                  const hasSpecialEffect = skin.specialEffectType && skin.specialEffectType !== 'NONE';
                  const rarityColor =
                    skin.rarity === 'MYTHIC'
                      ? 'text-cyan-200'
                      : skin.rarity === 'LEGENDARY'
                        ? 'text-amber-300'
                        : skin.rarity === 'EPIC'
                          ? 'text-purple-300'
                          : skin.rarity === 'RARE'
                            ? 'text-cyan-300'
                            : 'text-slate-400';

                  return (
                    <div
                      key={skin.id}
                      className={`rounded-2xl p-4 flex flex-col justify-between transition-colors ${
                        isEquipped
                          ? 'bg-fuchsia-950/30 border-2 border-fuchsia-400'
                          : 'bg-slate-950/75 border border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 text-[10.5px] font-mono">
                          <span className={`font-bold uppercase tracking-wider ${rarityColor}`}>
                            {skin.rarity === 'MYTHIC'
                              ? 'Mítica'
                              : skin.rarity === 'LEGENDARY'
                                ? 'Lendária'
                                : skin.rarity === 'EPIC'
                                  ? 'Épica'
                                  : skin.rarity === 'RARE'
                                    ? 'Rara'
                                    : 'Padrão'}
                          </span>
                          {isEquipped ? (
                            <span className="inline-flex items-center gap-1 text-fuchsia-300 font-bold uppercase">
                              <Check className="w-3.5 h-3.5" />
                              <span>Equipada</span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-emerald-400 font-bold uppercase">Desbloqueada</span>
                          ) : (
                            <span className="text-amber-300 font-bold tabular-nums">
                              {skin.price.toLocaleString()} CRED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-16 h-16 rounded-xl bg-slate-900/90 border flex items-center justify-center shrink-0 overflow-hidden"
                            style={{ borderColor: `${skin.accentColor}55` }}
                          >
                            <OperatorAvatarPreview skinId={skin.id} size={64} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span
                              className="text-[10px] font-mono font-bold uppercase tracking-widest block"
                              style={{ color: skin.accentColor }}
                            >
                              {skin.callsign}
                            </span>
                            <h3 className="font-display font-bold text-white text-base leading-tight truncate">
                              {skin.name}
                            </h3>
                            {skin.title && (
                              <span className="text-[11px] font-mono text-slate-400 block truncate">
                                {skin.title}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-400 text-xs leading-snug mb-3">
                          {skin.description}
                        </p>

                        <div
                          className={`rounded-xl p-2.5 border mb-4 ${
                            hasSpecialEffect
                              ? 'bg-slate-900/90 border-fuchsia-500/30'
                              : 'bg-slate-900/60 border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-wider mb-0.5">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: skin.accentColor }} />
                            <span style={{ color: skin.accentColor }}>
                              {hasSpecialEffect ? `Efeito: ${skin.perkName}` : skin.perkName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{skin.perkDescription}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        {isEquipped ? (
                          <div className="w-full min-h-[44px] py-2.5 rounded-xl bg-fuchsia-500/15 border border-fuchsia-400/50 text-fuchsia-200 text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>Ativa em Combate</span>
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleEquipSkin(skin.id, skin.name)}
                            className="w-full min-h-[44px] py-2.5 rounded-xl bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 font-display font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer"
                          >
                            Equipar Skin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuySkin(skin.id, skin.name, skin.price)}
                            disabled={!canAfford}
                            className={`w-full min-h-[44px] py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              canAfford
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-[0.98]'
                                : 'bg-slate-800/70 border border-white/5 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4 shrink-0" />
                            <span>
                              {canAfford
                                ? `Comprar · ${skin.price.toLocaleString()} CRED`
                                : `Requer ${skin.price.toLocaleString()} CRED`}
                            </span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {/* Health */}
                <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 text-[10.5px] font-mono">
                      <span className="text-rose-300 font-bold uppercase">Vitalidade</span>
                      <span className="text-slate-300 font-bold tabular-nums">Nível {maxHealthLevel}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-base">Vitalidade Máxima</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                          +15 HP máximo permanente por nível para todas as partidas.
                        </p>
                        <div className="mt-2 text-xs font-mono text-slate-300 tabular-nums">
                          {100 + maxHealthLevel * 15} HP →{' '}
                          <strong className="text-emerald-400">{100 + (maxHealthLevel + 1) * 15} HP</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
                    <span className="text-base font-mono-numbers font-bold text-amber-300 tabular-nums">
                      {((maxHealthLevel + 1) * 200).toLocaleString()} CRED
                    </span>
                    <button
                      onClick={handleHealthUpgrade}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/45 hover:bg-rose-500 text-rose-200 hover:text-white font-display font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
                    >
                      +15 HP
                    </button>
                  </div>
                </div>

                {/* Shield */}
                <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 text-[10.5px] font-mono">
                      <span className="text-cyan-300 font-bold uppercase">Proteção</span>
                      <span className="text-slate-300 font-bold tabular-nums">Nível {maxShieldLevel}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-base">Escudo Tático</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                          Barreira de energia regenerativa ao sair de combate.
                        </p>
                        <div className="mt-2 text-xs font-mono text-slate-300 tabular-nums">
                          {maxShieldLevel * 20} pts →{' '}
                          <strong className="text-emerald-400">{(maxShieldLevel + 1) * 20} pts</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
                    <span className="text-base font-mono-numbers font-bold text-amber-300 tabular-nums">
                      {((maxShieldLevel + 1) * 250).toLocaleString()} CRED
                    </span>
                    <button
                      onClick={handleShieldUpgrade}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/45 hover:bg-cyan-400 text-cyan-200 hover:text-slate-950 font-display font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
                    >
                      +20 Escudo
                    </button>
                  </div>
                </div>

                {/* Speed */}
                <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 text-[10.5px] font-mono">
                      <span className="text-amber-300 font-bold uppercase">Mobilidade</span>
                      <span className="text-slate-300 font-bold tabular-nums">Nível {speedLevel}/5</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                        <Gauge className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-base">Propulsores de Corrida</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                          +8% velocidade tática em terra e nado por nível.
                        </p>
                        <div className="mt-2 text-xs font-mono text-slate-300 tabular-nums">
                          +{speedLevel * 8}%
                          {speedLevel < 5 && (
                            <>
                              {' '}→ <strong className="text-emerald-400">+{(speedLevel + 1) * 8}%</strong>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
                    <span className="text-base font-mono-numbers font-bold text-amber-300 tabular-nums">
                      {speedLevel >= 5 ? 'MÁXIMO' : `${((speedLevel + 1) * 250).toLocaleString()} CRED`}
                    </span>
                    <button
                      onClick={handleSpeedUpgrade}
                      disabled={speedLevel >= 5}
                      className={`min-h-[44px] px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all ${
                        speedLevel >= 5
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500/20 border border-amber-500/45 hover:bg-amber-400 text-amber-200 hover:text-slate-950 cursor-pointer'
                      }`}
                    >
                      {speedLevel >= 5 ? 'Nível Máx' : '+8% Vel'}
                    </button>
                  </div>
                </div>

                {/* Damage */}
                <div className="bg-slate-950/75 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 text-[10.5px] font-mono">
                      <span className="text-purple-300 font-bold uppercase">Balística</span>
                      <span className="text-slate-300 font-bold tabular-nums">Nível {damageLevel}/5</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-base">Balística de Precisão</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                          +10% dano base permanente em todas as armas.
                        </p>
                        <div className="mt-2 text-xs font-mono text-slate-300 tabular-nums">
                          +{damageLevel * 10}%
                          {damageLevel < 5 && (
                            <>
                              {' '}→ <strong className="text-emerald-400">+{(damageLevel + 1) * 10}%</strong>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
                    <span className="text-base font-mono-numbers font-bold text-amber-300 tabular-nums">
                      {damageLevel >= 5 ? 'MÁXIMO' : `${((damageLevel + 1) * 350).toLocaleString()} CRED`}
                    </span>
                    <button
                      onClick={handleDamageUpgrade}
                      disabled={damageLevel >= 5}
                      className={`min-h-[44px] px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all ${
                        damageLevel >= 5
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-purple-500/20 border border-purple-500/45 hover:bg-purple-500 text-purple-200 hover:text-white cursor-pointer'
                      }`}
                    >
                      {damageLevel >= 5 ? 'Nível Máx' : '+10% Dano'}
                    </button>
                  </div>
                </div>

                {/* Luck */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-950/90 via-emerald-950/20 to-amber-950/15 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 text-[10.5px] font-mono">
                      <span className="text-emerald-300 font-bold uppercase">Raridade & Reroll</span>
                      <span className="text-slate-300 font-bold tabular-nums">Nível {luckLevel}/5</span>
                    </div>
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 shrink-0">
                        <Star className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-white text-base sm:text-lg">
                          Radar de Sorte & Raridade
                        </h4>
                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                          Eleva a chance de Power-Ups Raros, Épicos, Lendários e Míticos ao subir de nível.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-slate-300 tabular-nums">
                          <span>
                            Atual: <strong className="text-emerald-400">+{luckLevel * 20}%</strong>
                          </span>
                          {luckLevel < 5 && (
                            <span>
                              → <strong className="text-amber-300">+{(luckLevel + 1) * 20}%</strong>
                            </span>
                          )}
                          <span className="text-white/25" aria-hidden="true">·</span>
                          <span className="text-fuchsia-300">Mítico Base +{(luckLevel * 1.5).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
                    <span className="text-base font-mono-numbers font-bold text-amber-300 tabular-nums">
                      {luckLevel >= 5 ? 'MÁXIMO' : `${((luckLevel + 1) * 300).toLocaleString()} CRED`}
                    </span>
                    <button
                      onClick={handleLuckUpgrade}
                      disabled={luckLevel >= 5}
                      className={`min-h-[44px] px-5 py-2 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all ${
                        luckLevel >= 5
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500/20 border border-emerald-400/45 hover:bg-emerald-400 text-emerald-200 hover:text-slate-950 cursor-pointer'
                      }`}
                    >
                      {luckLevel >= 5 ? 'Nível Máx' : '+20% Sorte'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Portrait Bottom Confirm Bar */}
          <div className="landscape:hidden md:hidden pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-white font-semibold truncate">{equippedWeaponName}</span>
            <button
              onClick={() => {
                sound.playPowerup();
                onClose();
              }}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs tracking-wider uppercase cursor-pointer shrink-0"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
