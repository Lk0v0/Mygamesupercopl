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
  fireRate: number; // shots per sec
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
    specialTrait: 'Inicial Gratuita • Alta precisão, recuo leve e disparo rápido.',
    damage: 15,
    fireRate: 5.8,
    speed: 840,
    piercing: 1,
    price: 0,
    color: '#fbbf24',
    icon: Crosshair,
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
      showSuccess(`${item.name} desbloqueada e EQUIPADA com sucesso!`);
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
      showSuccess(`Skin "${name}" desbloqueada e EQUIPADA!`);
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
    showSuccess(`Radar de Raridade aprimorado! Mais chance de Power-Ups Raros, Épicos, Lendários e Míticos!`);
  };

  const filteredWeapons = WEAPON_CATALOG;

  const equippedWeaponName =
    WEAPON_CATALOG.find((w) => w.type === equippedWeapon)?.name || 'Glock 19 Gen5 MOS';
  const equippedSkinName =
    OPERATOR_SKINS.find((s) => s.id === equippedSkin)?.name || 'Recruta de Choque';

  return (
    <div
      data-gamepad-scope="modal"
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-1.5 sm:p-4 overflow-hidden select-none"
    >
      <div className="w-full max-w-6xl h-[94dvh] bg-slate-900 border border-cyan-500/20 rounded-2xl sm:rounded-3xl flex flex-col landscape:flex-row md:flex-row relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.12)]">

        {/* LEFT RAIL: Title, Wallet, Vertical Category Tabs & Exit */}
        <aside className="w-full landscape:w-52 sm:landscape:w-56 md:w-64 shrink-0 bg-slate-950/80 border-b landscape:border-b-0 landscape:border-r md:border-b-0 md:border-r border-white/10 p-2.5 sm:p-4 flex flex-col justify-between gap-2 sm:gap-3 landscape:overflow-y-auto md:overflow-y-auto">
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Title + Close Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="hidden md:inline-flex items-center gap-1 text-cyan-400 text-[9.5px] font-mono font-black tracking-widest uppercase">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  MUNIÇÃO ∞
                </span>
                <h2 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 uppercase italic tracking-wider truncate">
                  Loja & Armaria
                </h2>
              </div>

              <button
                data-gamepad-back="true"
                onClick={() => {
                  sound.playPowerup();
                  onClose();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                title="Fechar Loja"
                aria-label="Fechar Loja"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Wallet + Test Coins Row */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 min-w-0 bg-slate-900/90 border border-cyan-500/30 px-2.5 py-1.5 rounded-xl flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="hidden md:block text-[8.5px] font-mono text-slate-400 uppercase leading-none">
                    CRÉDITOS
                  </span>
                  <span className="text-xs sm:text-base font-black text-white font-mono leading-tight block truncate tabular-nums">
                    {coins.toLocaleString()} <span className="text-[9px] text-amber-400">CRED</span>
                  </span>
                </div>
              </div>

              {onAddTestCoins && (
                <button
                  onClick={() => {
                    sound.playPowerup();
                    onAddTestCoins();
                    showSuccess('+10.000 Créditos adicionados para teste!');
                  }}
                  className="px-2 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 text-[11px] font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Adicionar moedas de teste"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">+10K</span>
                </button>
              )}
            </div>

            {/* Navigation Tabs (Horizontal in portrait, Vertical in landscape) */}
            <div className="flex landscape:flex-col md:flex-col gap-1.5 overflow-x-auto landscape:overflow-x-visible md:overflow-x-visible scrollbar-none pb-0.5 landscape:pb-0">
              <button
                onClick={() => { sound.playPowerup(); setActiveTab('ALL'); }}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer text-left flex items-center justify-between gap-2 ${
                  activeTab === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/70 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>Armas</span>
                <span className="text-[10px] font-mono opacity-80">({WEAPON_CATALOG.length})</span>
              </button>
              <button
                onClick={() => { sound.playPowerup(); setActiveTab('SKINS'); }}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer text-left flex items-center justify-between gap-2 ${
                  activeTab === 'SKINS'
                    ? 'bg-fuchsia-500 text-slate-950 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                    : 'bg-slate-900/70 border border-white/10 text-fuchsia-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 shrink-0" />
                  Skins
                </span>
                <span className="text-[10px] font-mono opacity-80">({OPERATOR_SKINS.length})</span>
              </button>
              <button
                onClick={() => { sound.playPowerup(); setActiveTab('UPGRADES'); }}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer text-left ${
                  activeTab === 'UPGRADES'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900/70 border border-white/10 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
                }`}
              >
                ★ Upgrades
              </button>
            </div>
          </div>

          {/* Equipped Weapon + Skin + Confirm Footer */}
          <div className="hidden landscape:flex md:flex flex-col gap-2 pt-2 border-t border-white/10">
            <div className="bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-2 space-y-1">
              <div>
                <span className="text-[8.5px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Arma Equipada
                </span>
                <span className="text-[11px] font-bold text-white truncate block">
                  {equippedWeaponName}
                </span>
              </div>
              <div className="pt-1 border-t border-white/5">
                <span className="text-[8.5px] font-mono text-fuchsia-400 uppercase tracking-wider block">
                  Operador / Skin
                </span>
                <span className="text-[11px] font-bold text-slate-200 truncate block">
                  {equippedSkinName}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playPowerup();
                onClose();
              }}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-widest uppercase transition-all active:scale-[0.98] cursor-pointer"
            >
              Voltar ao Menu
            </button>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA: Alerts + Full-Height Scrollable Grid */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 p-2.5 sm:p-4 overflow-hidden">
          {purchaseSuccess && (
            <div className="mb-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{purchaseSuccess}</span>
            </div>
          )}
          {purchaseError && (
            <div className="mb-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{purchaseError}</span>
            </div>
          )}

          {/* Scrollable Main Catalog Area */}
          <div className="flex-1 overflow-y-auto pr-1 pb-2 space-y-3">
            {/* WEAPONS GRID */}
            {activeTab !== 'UPGRADES' && activeTab !== 'SKINS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-black uppercase tracking-wider shrink-0">
                          <Check className="w-3 h-3 text-cyan-300 stroke-[3]" /> EQUIPADA
                        </span>
                      ) : isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                          DESBLOQUEADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold font-mono tabular-nums shrink-0">
                          {item.price.toLocaleString()} CRED
                        </span>
                      )}
                    </div>

                    {/* Weapon Info & Tactical SVG Preview */}
                    <div>
                      <div className="mb-2.5 rounded-xl bg-slate-950/90 border border-white/10 p-2 flex items-center justify-center">
                        <WeaponIllustration type={item.type} className="w-full h-20 sm:h-24" />
                      </div>

                      <div className="flex items-start gap-2.5 mb-2">
                        <div 
                          className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-lg"
                          style={{ 
                            backgroundColor: `${item.color}18`, 
                            borderColor: `${item.color}40`,
                            boxShadow: `0 0 15px ${item.color}20` 
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-white text-sm sm:text-base leading-tight truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono font-black flex items-center gap-1 text-cyan-400">
                              Munição: ∞ Infinita
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-400 text-[11px] sm:text-xs leading-snug mb-2">
                        {item.description}
                      </p>

                      {/* Trait Highlight */}
                      <div className="bg-slate-900/80 border border-white/5 rounded-lg px-2 py-1 mb-2.5">
                        <span className="text-[10px] font-mono font-medium text-slate-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 shrink-0 text-cyan-400" />
                          <span className="truncate">{item.specialTrait}</span>
                        </span>
                      </div>

                      {/* Weapon Stats Bars */}
                      <div className="space-y-1.5 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 tabular-nums">
                        {/* Damage */}
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">DANO BASE</span>
                          <span className="text-white font-bold">
                            {item.pellets ? `${item.damage}×${item.pellets} (${item.damage * item.pellets})` : item.damage}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${Math.min(100, (((item.pellets ? item.damage * item.pellets : item.damage)) / 75) * 100)}%` }} 
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
                            style={{ width: `${Math.min(100, (item.fireRate / 12) * 100)}%` }} 
                          />
                        </div>

                        {/* Piercing */}
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                          <span className="text-slate-400">PERFURAÇÃO</span>
                          <span className="text-white font-bold">
                            {item.piercing} {item.piercing === 1 ? 'Alvo' : 'Alvos'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-400 rounded-full" 
                            style={{ width: `${Math.min(100, (item.piercing / 3) * 100)}%` }} 
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

          {/* OPERATOR SKINS TAB */}
          {activeTab === 'SKINS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
              {OPERATOR_SKINS.map((skin) => {
                const isUnlocked = unlockedSkins.includes(skin.id) || skin.price === 0;
                const isEquipped = equippedSkin === skin.id;
                const canAfford = coins >= skin.price;
                const hasSpecialEffect = skin.specialEffectType && skin.specialEffectType !== 'NONE';
                const rarityBadge =
                  skin.rarity === 'MYTHIC'
                    ? 'bg-fuchsia-500/20 border-cyan-300/60 text-cyan-200'
                    : skin.rarity === 'LEGENDARY'
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                      : skin.rarity === 'EPIC'
                        ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                        : skin.rarity === 'RARE'
                          ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                          : 'bg-slate-700/40 border-slate-500/40 text-slate-300';

                return (
                  <div
                    key={skin.id}
                    className={`rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-colors relative overflow-hidden ${
                      isEquipped
                        ? 'bg-fuchsia-950/35 border-2 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.22)]'
                        : isUnlocked
                          ? 'bg-slate-950/75 border border-white/15 hover:border-fuchsia-400/45'
                          : 'bg-slate-950/55 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      {/* Header Status & Rarity */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-black uppercase tracking-wider ${rarityBadge}`}>
                          {skin.rarity === 'MYTHIC' ? 'MÍTICA' : skin.rarity === 'LEGENDARY' ? 'LENDÁRIA' : skin.rarity === 'EPIC' ? 'ÉPICA' : skin.rarity === 'RARE' ? 'RARA' : 'PADRÃO'}
                        </span>
                        {isEquipped ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 text-[10px] font-black uppercase tracking-wider">
                            <Check className="w-3 h-3 stroke-[3]" /> EQUIPADA
                          </span>
                        ) : isUnlocked ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            DESBLOQUEADA
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold font-mono">
                            {skin.price.toLocaleString()} CRED
                          </span>
                        )}
                      </div>

                      {/* Avatar Preview + Name/Callsign */}
                      <div className="flex items-center gap-3 mb-2.5">
                        <div
                          className="w-16 h-16 rounded-xl bg-slate-900/90 border flex items-center justify-center shrink-0 overflow-hidden"
                          style={{ borderColor: `${skin.accentColor}55` }}
                        >
                          <OperatorAvatarPreview skinId={skin.id} size={64} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest block" style={{ color: skin.accentColor }}>
                            {skin.callsign}
                          </span>
                          <h3 className="font-black text-white text-sm sm:text-base leading-tight truncate">
                            {skin.name}
                          </h3>
                          {skin.title && (
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              {skin.title}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-400 text-[11px] sm:text-xs leading-snug mb-2.5">
                        {skin.description}
                      </p>

                      {/* Special Effect Box */}
                      <div
                        className={`rounded-xl p-2 border mb-3 ${
                          hasSpecialEffect
                            ? 'bg-slate-900/90 border-fuchsia-500/30'
                            : 'bg-slate-900/60 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider mb-0.5">
                          <Sparkles className="w-3 h-3 shrink-0" style={{ color: skin.accentColor }} />
                          <span style={{ color: skin.accentColor }}>
                            {hasSpecialEffect ? `Efeito Especial: ${skin.perkName}` : skin.perkName}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-snug">
                          {skin.perkDescription}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-2 border-t border-white/5">
                      {isEquipped ? (
                        <div className="w-full py-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-200 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 stroke-[3]" /> SKIN ATIVA EM COMBATE
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleEquipSkin(skin.id, skin.name)}
                          className="w-full py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-black text-xs tracking-widest uppercase transition-all active:scale-[0.98] cursor-pointer"
                        >
                          EQUIPAR SKIN
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuySkin(skin.id, skin.name, skin.price)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-[0.98]'
                              : 'bg-slate-800/60 border border-white/5 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          {canAfford ? `COMPRAR • ${skin.price.toLocaleString()} CRED` : `REQUER ${skin.price.toLocaleString()} CRED`}
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

          {/* Portrait-only Bottom Bar (in landscape it's already in the left rail) */}
          <div className="landscape:hidden md:hidden pt-2 border-t border-white/10 flex flex-row items-center justify-between gap-2 shrink-0">
            <span className="text-xs text-white font-bold truncate">
              {equippedWeaponName}
            </span>
            <button
              onClick={() => {
                sound.playPowerup();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs tracking-widest uppercase cursor-pointer shrink-0"
            >
              Confirmar e Voltar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
