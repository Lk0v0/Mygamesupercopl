import React, { useState } from 'react';
import {
  ArrowLeft,
  Coins,
  Crown,
  Flame,
  Heart,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Zap,
  Check,
  Lock,
} from 'lucide-react';
import { TokenUpgradeId } from '../types';
import {
  getPrestigeBonuses,
  getPrestigeCost,
  MAX_PRESTIGE,
  TOKEN_UPGRADES,
} from './PrestigeSystem';
import { sound } from '../sound';

interface PrestigeScreenProps {
  coins: number;
  prestigeLevel: number;
  tokens: number;
  tokenUpgrades: Record<TokenUpgradeId, number>;
  onAscendPrestige: () => boolean;
  onBuyTokenUpgrade: (id: TokenUpgradeId) => boolean;
  onRespecTokens: () => void;
  onClose: () => void;
}

const getTokenUpgradeIcon = (id: TokenUpgradeId) => {
  switch (id) {
    case 'token_wealth':
      return Coins;
    case 'token_might':
      return Flame;
    case 'token_vitality':
      return Heart;
    case 'token_haste':
      return Zap;
    case 'token_crit_xp':
      return Sparkles;
  }
};

export const PrestigeScreen: React.FC<PrestigeScreenProps> = ({
  coins,
  prestigeLevel,
  tokens,
  tokenUpgrades,
  onAscendPrestige,
  onBuyTokenUpgrade,
  onRespecTokens,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'PRESTIGE' | 'TOKEN_SHOP'>('PRESTIGE');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isMaxPrestige = prestigeLevel >= MAX_PRESTIGE;
  const nextCost = getPrestigeCost(prestigeLevel);
  const canAffordPrestige = !isMaxPrestige && coins >= nextCost;
  const progressRatio = isMaxPrestige ? 1 : Math.min(1, coins / Math.max(1, nextCost));
  const bonuses = getPrestigeBonuses(prestigeLevel);

  const totalSpentTokens = (Object.values(tokenUpgrades) as number[]).reduce(
    (acc: number, v: number) => acc + (Number(v) || 0),
    0
  );

  const notify = (msg: string) => {
    setStatusMessage(msg);
    window.setTimeout(() => setStatusMessage(null), 2800);
  };

  const handlePrestigeClick = () => {
    if (!canAffordPrestige) return;
    if (onAscendPrestige()) {
      sound.playPrestigeAscend();
      notify(`Prestígio ${prestigeLevel + 1} alcançado! +1 Token de Prestígio concedido.`);
    }
  };

  const handleBuyUpgrade = (id: TokenUpgradeId, name: string) => {
    if (onBuyTokenUpgrade(id)) {
      sound.playPowerup();
      notify(`${name} aprimorado permanentemente!`);
    }
  };

  const handleRespec = () => {
    if (totalSpentTokens === 0) return;
    sound.playClick();
    onRespecTokens();
    notify(`${totalSpentTokens} Token(s) reembolsados com sucesso.`);
  };

  const formatCompactCredits = (val: number) => {
    if (val >= 1_000_000) {
      const m = val / 1_000_000;
      return `${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
    }
    if (val >= 1_000) {
      const k = val / 1_000;
      return `${Number.isInteger(k) ? k.toFixed(0) : k.toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  return (
    <div
      data-gamepad-scope="modal"
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-1.5 sm:p-4 overflow-hidden select-none"
    >
      <div className="w-full max-w-5xl h-[94dvh] bg-slate-900 border border-white/10 rounded-2xl flex flex-col landscape:flex-row md:flex-row overflow-hidden shadow-2xl">
        {/* LEFT RAIL: Back, Title, Rank Summary, Wallet & Vertical Tabs */}
        <aside className="w-full landscape:w-52 sm:landscape:w-56 md:w-64 shrink-0 bg-slate-950/80 border-b landscape:border-b-0 landscape:border-r md:border-b-0 md:border-r border-white/10 p-2.5 sm:p-4 flex flex-col justify-between gap-2.5 landscape:overflow-y-auto md:overflow-y-auto">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <button
                data-gamepad-back="true"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Voltar ao Menu"
                aria-label="Voltar ao Menu"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-display font-bold text-white tracking-tight truncate">
                  Prestígio & Tokens
                </h2>
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">
                  P{prestigeLevel}/{MAX_PRESTIGE} · +{bonuses.damageBonusPct}% Dano
                </div>
              </div>
            </div>

            {/* Wallet Summary */}
            <div className="grid grid-cols-2 landscape:grid-cols-1 md:grid-cols-1 gap-1.5">
              <div className="bg-slate-900/90 border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Créditos</span>
                </span>
                <span className="text-amber-300 font-bold tabular-nums">{coins.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/90 border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Tokens</span>
                </span>
                <span className="text-fuchsia-300 font-bold tabular-nums">{tokens}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex landscape:flex-col md:flex-col gap-1.5 p-1 bg-slate-950 border border-white/10 rounded-xl">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('PRESTIGE');
                }}
                className={`flex-1 landscape:flex-none md:flex-none px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer text-left flex items-center justify-between ${
                  activeTab === 'PRESTIGE'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Ascensão</span>
                <span className="font-mono text-[10px] opacity-80">{prestigeLevel}/{MAX_PRESTIGE}</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('TOKEN_SHOP');
                }}
                className={`flex-1 landscape:flex-none md:flex-none px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer text-left flex items-center justify-between ${
                  activeTab === 'TOKEN_SHOP'
                    ? 'bg-fuchsia-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Loja de Tokens</span>
                <span className="font-mono text-[10px] opacity-80">{tokens > 0 ? `${tokens}★` : '5'}</span>
              </button>
            </div>
          </div>

          <div className="hidden landscape:block md:block pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400">
            <div>Bônus Atual:</div>
            <div className="text-amber-300 font-bold">+{bonuses.damageBonusPct}% Dano · +{bonuses.coinsBonusPct}% CRED</div>
          </div>
        </aside>

        {/* RIGHT CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 min-w-0 min-h-0">
          {statusMessage && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-medium text-emerald-300">
              {statusMessage}
            </div>
          )}
          {activeTab === 'PRESTIGE' ? (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              {/* Primary Ascension Card */}
              <div className="bg-slate-950/75 border border-white/10 rounded-xl p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-5">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                      {isMaxPrestige
                        ? 'Prestígio Supremo Alcançado (Nível 10)'
                        : `Próximo Grau: Prestígio ${prestigeLevel + 1}`}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                    Cada ascensão de Prestígio concede <strong className="text-fuchsia-300">+1 Token de Prestígio</strong> para investir na Loja de Tokens e eleva seus multiplicadores permanentes em <strong className="text-amber-300">+20% Dano</strong> e <strong className="text-emerald-300">+35% Créditos</strong>. Suas armas, upgrades e skins são mantidas.
                  </p>

                  {/* Cost & Progress Bar */}
                  {!isMaxPrestige && (
                    <div className="pt-2 space-y-1.5 max-w-md">
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                        <span className="text-slate-400">Custo da Ascensão</span>
                        <span className={canAffordPrestige ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                          {coins.toLocaleString()} / {nextCost.toLocaleString()} CRED
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full transition-all duration-300 ${
                            canAffordPrestige ? 'bg-emerald-400' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.round(progressRatio * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-stretch md:items-end gap-2">
                  <button
                    onClick={handlePrestigeClick}
                    disabled={!canAffordPrestige}
                    className={`px-6 py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${
                      isMaxPrestige
                        ? 'bg-slate-800 text-slate-400 border border-white/10 cursor-default'
                        : canAffordPrestige
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer active:scale-95'
                        : 'bg-slate-800/80 text-slate-500 border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    {isMaxPrestige ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Prestígio Máximo</span>
                      </>
                    ) : canAffordPrestige ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span>Ascender (+1 Token)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Requer {formatCompactCredits(nextCost)} CRED</span>
                      </>
                    )}
                  </button>
                  {!isMaxPrestige && (
                    <span className="text-[11px] font-mono text-slate-500 text-center md:text-right">
                      Próximo custo dobra para {prestigeLevel + 1 < MAX_PRESTIGE ? formatCompactCredits(getPrestigeCost(prestigeLevel + 1)) : 'Máx'}
                    </span>
                  )}
                </div>
              </div>

              {/* Prestige 1..10 Ladder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200">
                    Escala de Prestígio (1 até 10)
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Inicia em 650.000 e dobra a cada nível
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {Array.from({ length: MAX_PRESTIGE }, (_, idx) => {
                    const rank = idx + 1;
                    const rankCost = getPrestigeCost(idx);
                    const isUnlocked = prestigeLevel >= rank;
                    const isNext = prestigeLevel + 1 === rank;

                    return (
                      <div
                        key={rank}
                        className={`p-3.5 rounded-xl border transition-colors flex flex-col justify-between gap-2 ${
                          isUnlocked
                            ? 'bg-amber-500/10 border-amber-500/40'
                            : isNext
                            ? 'bg-slate-950 border-white/25'
                            : 'bg-slate-950/40 border-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-display font-bold ${isUnlocked ? 'text-amber-300' : 'text-slate-300'}`}>
                            Prestígio {rank}
                          </span>
                          {isUnlocked ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="text-[10px] font-mono text-fuchsia-300">+1 Token</span>
                          )}
                        </div>
                        <div className="text-sm font-mono font-bold text-white tabular-nums">
                          {formatCompactCredits(rankCost)} CRED
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          +{rank * 20}% Dano · +{rank * 35}% Cred
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-w-4xl mx-auto">
              {/* Token Shop Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-white">
                    Loja de Tokens Permanentes
                  </h3>
                  <p className="text-xs text-slate-400">
                    5 upgrades permanentes com até 5 níveis cada · 1 Token por nível
                  </p>
                </div>

                {totalSpentTokens > 0 && (
                  <button
                    onClick={handleRespec}
                    className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reembolsar Tokens ({totalSpentTokens})</span>
                  </button>
                )}
              </div>

              {/* 5 Token Upgrades Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {TOKEN_UPGRADES.map((upg) => {
                  const Icon = getTokenUpgradeIcon(upg.id);
                  const level = tokenUpgrades[upg.id] || 0;
                  const isMax = level >= upg.maxLevel;
                  const canBuy = !isMax && tokens >= upg.costPerLevel;

                  return (
                    <div
                      key={upg.id}
                      className="bg-slate-950/75 border border-white/10 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center shrink-0 bg-slate-900"
                              style={{ color: upg.accentColor }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-base font-display font-bold text-white leading-tight">
                                {upg.name}
                              </h4>
                              <div className="text-[11px] font-mono text-slate-400">
                                {upg.subtitle} · {upg.perLevelLabel}
                              </div>
                            </div>
                          </div>

                          <span className="text-xs font-mono font-bold text-slate-200 tabular-nums shrink-0">
                            Nível {level}/{upg.maxLevel}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {upg.description}
                        </p>

                        {/* 5-Level Segmented Bar */}
                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                          {Array.from({ length: upg.maxLevel }, (_, i) => {
                            const active = i < level;
                            return (
                              <div
                                key={i}
                                className="h-1.5 rounded-full transition-colors"
                                style={{
                                  backgroundColor: active ? upg.accentColor : 'rgba(255,255,255,0.08)',
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                        <div className="text-xs font-mono text-slate-300 tabular-nums">
                          Atual: <span className="font-bold text-white">{upg.formatTotal(level)}</span>
                        </div>

                        <button
                          onClick={() => handleBuyUpgrade(upg.id, upg.name)}
                          disabled={!canBuy}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                            isMax
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20 cursor-default'
                              : canBuy
                              ? 'bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 cursor-pointer active:scale-95'
                              : 'bg-slate-800/70 text-slate-500 border border-white/10 cursor-not-allowed'
                          }`}
                        >
                          {isMax ? 'Nível Máximo' : 'Aprimorar · 1 Token'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
