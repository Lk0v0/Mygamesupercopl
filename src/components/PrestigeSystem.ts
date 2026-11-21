import { TokenUpgradeId } from '../types';

export const MAX_PRESTIGE = 10;
export const FIRST_PRESTIGE_COST = 650_000;

export function getPrestigeCost(currentPrestige: number): number {
  if (currentPrestige >= MAX_PRESTIGE) return Infinity;
  return FIRST_PRESTIGE_COST * Math.pow(2, Math.max(0, currentPrestige));
}

export function getPrestigeBonuses(prestigeLevel: number) {
  const safeLevel = Math.max(0, Math.min(MAX_PRESTIGE, prestigeLevel));
  return {
    damageMult: 1 + safeLevel * 0.2, // +20% Dano Global por Prestígio
    coinsMult: 1 + safeLevel * 0.35, // +35% Créditos por Prestígio
    damageBonusPct: safeLevel * 20,
    coinsBonusPct: safeLevel * 35,
  };
}

export interface TokenUpgradeDef {
  id: TokenUpgradeId;
  name: string;
  subtitle: string;
  description: string;
  maxLevel: number; // Always 5
  costPerLevel: number; // 1 Token
  accentColor: string;
  perLevelLabel: string;
  formatTotal: (level: number) => string;
}

export const TOKEN_UPGRADES: TokenUpgradeDef[] = [
  {
    id: 'token_wealth',
    name: 'Midas Tático',
    subtitle: 'Economia Permanente',
    description: 'Amplifica permanentemente todos os créditos obtidos ao eliminar inimigos e completar ondas.',
    maxLevel: 5,
    costPerLevel: 1,
    accentColor: '#f59e0b',
    perLevelLabel: '+35% Créditos / nível',
    formatTotal: (lvl) => `+${lvl * 35}% Créditos`,
  },
  {
    id: 'token_might',
    name: 'Fúria Bélica',
    subtitle: 'Poder de Fogo Global',
    description: 'Aumenta permanentemente o dano base de todas as armas convencionais de combate.',
    maxLevel: 5,
    costPerLevel: 1,
    accentColor: '#ef4444',
    perLevelLabel: '+18% Dano / nível',
    formatTotal: (lvl) => `+${lvl * 18}% Dano`,
  },
  {
    id: 'token_vitality',
    name: 'Titã Imortal',
    subtitle: 'Blindagem & Vitalidade',
    description: 'Inicie todas as incursões com reservas permanentes extras de vida máxima e escudo de energia.',
    maxLevel: 5,
    costPerLevel: 1,
    accentColor: '#10b981',
    perLevelLabel: '+40 HP & +25 Escudo / nível',
    formatTotal: (lvl) => `+${lvl * 40} HP · +${lvl * 25} Escudo`,
  },
  {
    id: 'token_haste',
    name: 'Sobrecarga Cinética',
    subtitle: 'Cadência & Propulsão',
    description: 'Acelera permanentemente a cadência de disparo das armas e a velocidade de deslocamento.',
    maxLevel: 5,
    costPerLevel: 1,
    accentColor: '#38bdf8',
    perLevelLabel: '+7% Cadência & +6% Vel. / nível',
    formatTotal: (lvl) => `+${lvl * 7}% Cadência · +${lvl * 6}% Vel.`,
  },
  {
    id: 'token_crit_xp',
    name: 'Olho de Singularidade',
    subtitle: 'Crítico & Evolução Rápida',
    description: 'Eleva a chance de acertos críticos letais e acelera o ganho de XP para evoluir mais rápido.',
    maxLevel: 5,
    costPerLevel: 1,
    accentColor: '#c084fc',
    perLevelLabel: '+5% Crítico & +15% XP / nível',
    formatTotal: (lvl) => `+${lvl * 5}% Crítico · +${lvl * 15}% XP`,
  },
];

export const DEFAULT_TOKEN_UPGRADES: Record<TokenUpgradeId, number> = {
  token_wealth: 0,
  token_might: 0,
  token_vitality: 0,
  token_haste: 0,
  token_crit_xp: 0,
};
