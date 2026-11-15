import { AllShipMasteryState, MasteryNodeDefinition, ShipTypeKey } from '../types';

export const SHIP_META: Record<
  ShipTypeKey,
  {
    name: string;
    role: string;
    accentColor: string;
    activeSkillName: string;
    activeSkillCooldown: number;
  }
> = {
  DESTRUCTOR: {
    name: 'Nave Destructor',
    role: 'Lasers Gêmeos · Warp 3s',
    accentColor: '#22d3ee',
    activeSkillName: 'Pulso de Sobrecarga',
    activeSkillCooldown: 8,
  },
  INTERCEPTOR: {
    name: 'Nave Interceptor',
    role: 'Asas Longas & Orbes · Warp 3s',
    accentColor: '#00f5d4',
    activeSkillName: 'Rajada Supersônica',
    activeSkillCooldown: 7,
  },
  NAVE_REI: {
    name: 'Nave Rei',
    role: '4 Lasers Soberanos · Fúria 6s',
    accentColor: '#ef4444',
    activeSkillName: 'Julgamento Real',
    activeSkillCooldown: 9,
  },
};

// Cumulative XP thresholds for Mastery Levels 1..7 (each level grants 1 Mastery Point)
// Level 1 starts at 0 XP so piloting/opening Mastery immediately offers 1 starting point!
export const MASTERY_XP_THRESHOLDS = [0, 250, 650, 1200, 1950, 2900, 4100];
export const TRAIN_MASTERY_CREDIT_COST = 6500;
export const TRAIN_MASTERY_XP_GAIN = 250;

export function getShipMasteryLevelInfo(xp: number) {
  let level = 1;
  for (let i = 1; i < MASTERY_XP_THRESHOLDS.length; i++) {
    if (xp >= MASTERY_XP_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  const maxLevel = MASTERY_XP_THRESHOLDS.length;
  const isMax = level >= maxLevel;
  const currentFloor = MASTERY_XP_THRESHOLDS[level - 1] || 0;
  const nextThreshold = isMax ? currentFloor : MASTERY_XP_THRESHOLDS[level];
  const progressRatio = isMax
    ? 1
    : Math.max(0, Math.min(1, (xp - currentFloor) / Math.max(1, nextThreshold - currentFloor)));

  return {
    level,
    maxLevel,
    isMax,
    totalPoints: level, // 1 point at level 1, up to 7 points at level 7
    currentFloor,
    nextThreshold,
    xpInLevel: Math.max(0, xp - currentFloor),
    xpNeededForNext: isMax ? 0 : Math.max(0, nextThreshold - currentFloor),
    progressRatio,
  };
}

export const SHIP_MASTERY_NODES: Record<ShipTypeKey, MasteryNodeDefinition[]> = {
  DESTRUCTOR: [
    {
      id: 'dest_core',
      ship: 'DESTRUCTOR',
      title: 'Núcleo de Plasma Duplo',
      kind: 'PASSIVA',
      tier: 1,
      branch: 'center',
      requires: [],
      cost: 1,
      shortBonus: '+20% Dano Laser · Giro +15%',
      description: 'Otimiza os reatores frontais da Destructor, elevando o dano contínuo dos lasers gêmeos em +20% e suavizando a resposta de giro em +15%.',
    },
    {
      id: 'dest_capacitor',
      ship: 'DESTRUCTOR',
      title: 'Capacitor Térmico',
      kind: 'PASSIVA',
      tier: 2,
      branch: 'left',
      requires: ['dest_core'],
      cost: 1,
      shortBonus: 'Warp 2.1s · Duração +2s',
      description: 'Reduz o tempo de carregamento do Modo Warp de 3s para 2.1s e estende a duração máxima do Warp em +2 segundos.',
    },
    {
      id: 'dest_pulse_skill',
      ship: 'DESTRUCTOR',
      title: 'Pulso de Sobrecarga',
      kind: 'HABILIDADE',
      tier: 2,
      branch: 'right',
      requires: ['dest_core'],
      cost: 1,
      cooldownSec: 8,
      shortBonus: 'Ativa [Q]: Anel PEM + Atordoamento',
      description: 'Habilidade Ativa [Q] ou Botão Tático: libera um anel eletromagnético ao redor da nave que causa dano massivo, empurra e atordoa todos os inimigos num raio de 260px.',
    },
    {
      id: 'dest_prism',
      ship: 'DESTRUCTOR',
      title: 'Feixes Prismáticos',
      kind: 'PASSIVA',
      tier: 3,
      branch: 'left',
      requires: ['dest_capacitor'],
      cost: 1,
      shortBonus: '+12% Crítico Laser · +35% Empurrão',
      description: 'Foca os dois canhões em lentes prismáticas de alta penetração, concedendo +12% de chance crítica nos lasers e +35% de impacto.',
    },
    {
      id: 'dest_orbital_burn',
      ship: 'DESTRUCTOR',
      title: 'Refração Orbital',
      kind: 'HABILIDADE',
      tier: 3,
      branch: 'right',
      requires: ['dest_pulse_skill'],
      cost: 1,
      shortBonus: 'Esferas Warp causam dano ao tocar',
      description: 'Habilidade Passiva de Combate: durante o carregamento e o Modo Warp, as esferas aceleradoras eletrizadas cortam e causam dano direto em qualquer inimigo que encostar nelas.',
    },
    {
      id: 'dest_singularity',
      ship: 'DESTRUCTOR',
      title: 'Singularidade Destructor',
      kind: 'HABILIDADE',
      tier: 4,
      branch: 'center',
      requires: ['dest_prism', 'dest_orbital_burn'],
      cost: 1,
      shortBonus: 'Suprema: 3º Feixe Central no Warp',
      description: 'Habilidade Suprema: ao disparar em Modo Warp, abre um 3º canhão central de plasma violeta que corta o centro da mira causando dano duplo!',
    },
  ],

  INTERCEPTOR: [
    {
      id: 'int_aero',
      ship: 'INTERCEPTOR',
      title: 'Asas Aerodinâmicas',
      kind: 'PASSIVA',
      tier: 1,
      branch: 'center',
      requires: [],
      cost: 1,
      shortBonus: '+15% Vel. Base · +20% Cadência',
      description: 'Alonga os estabilizadores de carbono da Interceptor, concedendo +15% de velocidade de voo permanente e +20% de cadência de tiro nos orbes.',
    },
    {
      id: 'int_homing',
      ship: 'INTERCEPTOR',
      title: 'Orbes Teleguiados',
      kind: 'PASSIVA',
      tier: 2,
      branch: 'left',
      requires: ['int_aero'],
      cost: 1,
      shortBonus: 'Rastreamento automático de orbes',
      description: 'Equipa cada orbe disparado pelas asas com micro-sensores magnéticos que curvam suavemente em direção ao inimigo mais próximo.',
    },
    {
      id: 'int_supersonic_skill',
      ship: 'INTERCEPTOR',
      title: 'Rajada Supersônica',
      kind: 'HABILIDADE',
      tier: 2,
      branch: 'right',
      requires: ['int_aero'],
      cost: 1,
      cooldownSec: 7,
      shortBonus: 'Ativa [Q]: Nova 360° de 14 Orbes',
      description: 'Habilidade Ativa [Q] ou Botão Tático: dispara instantaneamente 14 orbes perfurantes em 360° ao redor da Interceptor e recarrega parte do escudo.',
    },
    {
      id: 'int_frenzy',
      ship: 'INTERCEPTOR',
      title: 'Frenesi de Hipervelocidade',
      kind: 'PASSIVA',
      tier: 3,
      branch: 'left',
      requires: ['int_homing'],
      cost: 1,
      shortBonus: 'Abates no Warp reduzem recarga [Q]',
      description: 'Durante o Modo Warp, cada inimigo eliminado reduz o tempo de recarga da Rajada Supersônica em 0.45s e aumenta o dano dos orbes em +25%.',
    },
    {
      id: 'int_nova_orb',
      ship: 'INTERCEPTOR',
      title: 'Orbes de Impacto Explosivo',
      kind: 'HABILIDADE',
      tier: 3,
      branch: 'right',
      requires: ['int_supersonic_skill'],
      cost: 1,
      shortBonus: 'Orbes carregados explodem em área',
      description: 'Habilidade de Combate: a cada 5 rajadas das asas, libera orbes de energia condensada que detonam em ondas de choque ao atingir o alvo.',
    },
    {
      id: 'int_swarm',
      ship: 'INTERCEPTOR',
      title: 'Enxame Fantasma',
      kind: 'HABILIDADE',
      tier: 4,
      branch: 'center',
      requires: ['int_frenzy', 'int_nova_orb'],
      cost: 1,
      shortBonus: 'Suprema: +2 Orbes Extras no Warp',
      description: 'Habilidade Suprema: enquanto o Modo Warp estiver ativo, cada asa dispara 2 orbes simultâneos em ângulo paralelo (4 orbes por rajada)!',
    },
  ],

  NAVE_REI: [
    {
      id: 'rei_armor',
      ship: 'NAVE_REI',
      title: 'Blindagem Soberana',
      kind: 'PASSIVA',
      tier: 1,
      branch: 'center',
      requires: [],
      cost: 1,
      shortBonus: '+60 Escudo Máx. · +20% Dano Base',
      description: 'Reforça o casco capitânia da Nave Rei com +60 de escudo inicial regenerativo e eleva o poder bruto dos 4 blasters em +20%.',
    },
    {
      id: 'rei_crimson_core',
      ship: 'NAVE_REI',
      title: 'Reator Carmesim',
      kind: 'PASSIVA',
      tier: 2,
      branch: 'left',
      requires: ['rei_armor'],
      cost: 1,
      shortBonus: 'Fúria em 4.5s · Regen Escudo em Fúria',
      description: 'Reduz o tempo de carga do Modo Fúria de 6s para 4.5s e regenera escudo continuamente enquanto o Modo Fúria estiver ativo.',
    },
    {
      id: 'rei_judgement_skill',
      ship: 'NAVE_REI',
      title: 'Julgamento Real',
      kind: 'HABILIDADE',
      tier: 2,
      branch: 'right',
      requires: ['rei_armor'],
      cost: 1,
      cooldownSec: 9,
      shortBonus: 'Ativa [Q]: 8 Raios Carmesim Letais',
      description: 'Habilidade Ativa [Q] ou Botão Tático: convoca uma tempestade de 8 relâmpagos vermelhos que atingem diretamente os inimigos próximos com dano crítico massivo.',
    },
    {
      id: 'rei_lethal',
      ship: 'NAVE_REI',
      title: 'Soberania Letal',
      kind: 'PASSIVA',
      tier: 3,
      branch: 'left',
      requires: ['rei_crimson_core'],
      cost: 1,
      shortBonus: '+30% Dano Fúria · +6% Vampirismo',
      description: 'Potencializa os lasers gigantes do Modo Fúria em +30% de dano extra e drena vida dos inimigos abatidos pelos feixes.',
    },
    {
      id: 'rei_storm',
      ship: 'NAVE_REI',
      title: 'Tempestade de Fúria',
      kind: 'HABILIDADE',
      tier: 3,
      branch: 'right',
      requires: ['rei_judgement_skill'],
      cost: 1,
      shortBonus: 'Eletricidade Vermelha eletrocuta em área',
      description: 'Habilidade de Combate: os arcos de eletricidade vermelha emitidos durante a carga e no Modo Fúria descarregam dano elétrico contínuo nos inimigos próximos.',
    },
    {
      id: 'rei_emperor',
      ship: 'NAVE_REI',
      title: 'Ascensão do Imperador',
      kind: 'HABILIDADE',
      tier: 4,
      branch: 'center',
      requires: ['rei_lethal', 'rei_storm'],
      cost: 1,
      shortBonus: 'Suprema: 6 Lasers Carmesim na Fúria',
      description: 'Habilidade Suprema: durante o Modo Fúria, libera 2 canhões de flanco adicionais (6 lasers vermelhos gigantes simultâneos) que detonam alvos abatidos!',
    },
  ],
};

export const DEFAULT_SHIP_MASTERY: AllShipMasteryState = {
  DESTRUCTOR: { xp: 0, unlockedNodes: [] },
  INTERCEPTOR: { xp: 0, unlockedNodes: [] },
  NAVE_REI: { xp: 0, unlockedNodes: [] },
};

export function hasMasteryNode(
  mastery: AllShipMasteryState,
  ship: ShipTypeKey,
  nodeId: string
): boolean {
  return mastery[ship]?.unlockedNodes?.includes(nodeId) ?? false;
}

export function canUnlockMasteryNode(
  mastery: AllShipMasteryState,
  ship: ShipTypeKey,
  node: MasteryNodeDefinition
): boolean {
  const prog = mastery[ship] || { xp: 0, unlockedNodes: [] };
  if (prog.unlockedNodes.includes(node.id)) return false;
  const info = getShipMasteryLevelInfo(prog.xp);
  const spent = prog.unlockedNodes.length;
  const availablePoints = Math.max(0, info.totalPoints - spent);
  if (availablePoints < node.cost) return false;
  // Require at least ONE parent if tier < 4, or ALL parents if tier 4? Wait: Tier 4 requires at least 1 of tier 3 OR both? Let's require ALL listed in `requires` (wait: for Tier 4, having BOTH branches means you need 6 points = Level 6, OR requiring ANY branch in Tier 3 lets you reach Tier 4 at Level 4! Requiring ANY branch in Tier 3 makes building super rewarding by Level 4 and maxing everything at Level 6!). Let's check:
  if (node.requires.length === 0) return true;
  if (node.tier === 4) {
    // Tier 4 unlocks as soon as at least one Tier 3 branch is unlocked!
    return node.requires.some((reqId) => prog.unlockedNodes.includes(reqId));
  }
  return node.requires.every((reqId) => prog.unlockedNodes.includes(reqId));
}
