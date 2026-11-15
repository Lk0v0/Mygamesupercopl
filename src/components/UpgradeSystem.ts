/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, UpgradeOption, UpgradeRarity, WeaponType } from '../types';

export interface UpgradeContext {
  updateCoins?: (amount: number) => void;
  unlockWeapon?: (weaponType: WeaponType) => void;
}

export interface UpgradeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: UpgradeRarity;
  statBonus: string;
  category: 'SURVIVAL' | 'OFFENSE' | 'TACTICAL' | 'ULTIMATE';
  weight: number;
  maxStacks?: number;
  apply: (p: Player, ctx?: UpgradeContext) => Player;
}

export const ALL_UPGRADES: UpgradeDefinition[] = [
  // ==========================================
  // COMMON UPGRADES (Base Tier - Emerald)
  // ==========================================
  {
    id: 'hp_boost_common',
    title: 'Fortificação Vital',
    description: 'Amplia sua saúde máxima em +35 HP e injeta cura imediata de 40 HP.',
    icon: 'hp',
    rarity: 'COMMON',
    statBonus: '+35 HP MÁX & CURA',
    category: 'SURVIVAL',
    weight: 20,
    apply: (p) => {
      p.maxHp += 35;
      p.hp = Math.min(p.maxHp, p.hp + 40);
      return p;
    },
  },
  {
    id: 'speed_boost_common',
    title: 'Condicionamento Tático',
    description: 'Aumenta a velocidade de movimentação e propulsão em +12%.',
    icon: 'speed',
    rarity: 'COMMON',
    statBonus: '+12% VELOCIDADE',
    category: 'TACTICAL',
    weight: 18,
    apply: (p) => {
      p.speed = Math.round(p.speed * 1.12);
      return p;
    },
  },
  {
    id: 'damage_boost_common',
    title: 'Munição Calibrada',
    description: 'Aprimoramento balístico que eleva o dano de todas as armas e lasers em +20%.',
    icon: 'damage',
    rarity: 'COMMON',
    statBonus: '+20% DANO GERAL',
    category: 'OFFENSE',
    weight: 20,
    apply: (p) => {
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.max(1, Math.round(w.damage * 1.2));
      });
      return p;
    },
  },
  {
    id: 'firerate_boost_common',
    title: 'Gatilho Polido',
    description: 'Mecanismo aliviado que aumenta a cadência de disparo e feixe em +20%.',
    icon: 'firerate',
    rarity: 'COMMON',
    statBonus: '+20% CADÊNCIA',
    category: 'OFFENSE',
    weight: 18,
    apply: (p) => {
      Object.values(p.weapons).forEach((w) => {
        w.fireRate = Number((w.fireRate * 1.2).toFixed(1));
      });
      return p;
    },
  },
  {
    id: 'bullet_velocity_common',
    title: 'Propulsão Supersônica',
    description: 'Aumenta a velocidade dos projéteis em +25% e reduz a dispersão em 15%.',
    icon: 'bullet_speed',
    rarity: 'COMMON',
    statBonus: '+25% VEL. PROJÉTIL',
    category: 'TACTICAL',
    weight: 16,
    apply: (p) => {
      Object.values(p.weapons).forEach((w) => {
        w.bulletSpeed = Math.round(w.bulletSpeed * 1.25);
        w.spread = Math.max(0.005, w.spread * 0.85);
      });
      return p;
    },
  },
  {
    id: 'combat_bounty_common',
    title: 'Suprimento de Campo',
    description: 'Receba imediatamente +200 Créditos de combate para gastar na armaria.',
    icon: 'coins',
    rarity: 'COMMON',
    statBonus: '+200 CRÉDITOS',
    category: 'TACTICAL',
    weight: 14,
    apply: (p, ctx) => {
      p.coinsEarned = (p.coinsEarned || 0) + 200;
      p.score = p.coinsEarned;
      if (ctx?.updateCoins) ctx.updateCoins(200);
      return p;
    },
  },

  // ==========================================
  // RARE UPGRADES (High Tier - Cyan)
  // ==========================================
  {
    id: 'shield_deflection_rare',
    title: 'Deflexão Iônica',
    description: 'Eleva a capacidade do Escudo em +50 e recarrega 100% da barreira defensiva.',
    icon: 'shield',
    rarity: 'RARE',
    statBonus: '+50 ESCUDO MÁX',
    category: 'SURVIVAL',
    weight: 14,
    apply: (p) => {
      p.maxShield += 50;
      p.shield = p.maxShield;
      return p;
    },
  },
  {
    id: 'pierce_boost_rare',
    title: 'Munição Perfurante Dupla',
    description: 'Projéteis atravessam +2 inimigos extras e causam +12% de dano.',
    icon: 'pierce',
    rarity: 'RARE',
    statBonus: '+2 PERFURAÇÃO · +12% DANO',
    category: 'OFFENSE',
    weight: 14,
    apply: (p) => {
      Object.values(p.weapons).forEach((w) => {
        w.piercing += 2;
        w.damage = Math.round(w.damage * 1.12);
      });
      return p;
    },
  },
  {
    id: 'heavy_charge_rare',
    title: 'Carga de Impacto Pesado',
    description: 'Aumenta o dano em +32% e aplica +40% de força real de repulsão (knockback) nos acertos.',
    icon: 'damage',
    rarity: 'RARE',
    statBonus: '+32% DANO · +40% REPULSÃO',
    category: 'OFFENSE',
    weight: 13,
    apply: (p) => {
      p.knockbackMult = Number(((p.knockbackMult || 1) * 1.4).toFixed(2));
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 1.32);
      });
      return p;
    },
  },
  {
    id: 'rapid_burst_rare',
    title: 'Alimentador Ultrassônico',
    description: 'Acelera a cadência de tiro de todo o arsenal e lasers em +35%.',
    icon: 'firerate',
    rarity: 'RARE',
    statBonus: '+35% CADÊNCIA',
    category: 'OFFENSE',
    weight: 13,
    apply: (p) => {
      Object.values(p.weapons).forEach((w) => {
        w.fireRate = Number((w.fireRate * 1.35).toFixed(1));
      });
      return p;
    },
  },
  {
    id: 'nanite_regen_rare',
    title: 'Injeção de Nanorrobôs',
    description: 'Cura 100% da saúde atual e instala regeneração passiva contínua de +2 HP/s.',
    icon: 'regen',
    rarity: 'RARE',
    statBonus: 'CURA TOTAL + 2 HP/S',
    category: 'SURVIVAL',
    weight: 12,
    apply: (p) => {
      p.hp = p.maxHp;
      p.regenHpRate = (p.regenHpRate || 0) + 2.0;
      return p;
    },
  },
  {
    id: 'plasma_capacitor_rare',
    title: 'Capacitor de Mira Crítica',
    description: 'Concede +15% de Chance Crítica, +25% Velocidade de Projétil e +30 Escudo.',
    icon: 'crit_blade',
    rarity: 'RARE',
    statBonus: '+15% CRÍTICO · +30 ESCUDO',
    category: 'TACTICAL',
    weight: 12,
    apply: (p) => {
      p.critChance = Math.min(0.95, (p.critChance || 0) + 0.15);
      p.maxShield += 30;
      p.shield = Math.min(p.maxShield, p.shield + 30);
      Object.values(p.weapons).forEach((w) => {
        w.bulletSpeed = Math.round(w.bulletSpeed * 1.25);
      });
      return p;
    },
  },

  // ==========================================
  // EPIC UPGRADES (Master Tier - Purple)
  // ==========================================
  {
    id: 'shatter_doctrine_epic',
    title: 'Doutrina de Estilhaços',
    description: 'Inimigos abatidos explodem em estilhaços letais que perfuram alvos ao redor. +35% Dano e +15% Crítico.',
    icon: 'explosion',
    rarity: 'EPIC',
    statBonus: 'ESTILHAÇOS AO ABATER · +35% DANO',
    category: 'OFFENSE',
    weight: 8,
    apply: (p) => {
      p.shatterLevel = (p.shatterLevel || 0) + 1;
      p.critChance = Math.min(0.95, (p.critChance || 0) + 0.15);
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 1.35);
      });
      return p;
    },
  },
  {
    id: 'vampiric_matrix_epic',
    title: 'Vampirismo Quântico',
    description: 'Drena +3 HP por cada inimigo abatido diretamente para sua vida vital.',
    icon: 'vampirism',
    rarity: 'EPIC',
    statBonus: '+3 HP POR ABATE',
    category: 'SURVIVAL',
    weight: 8,
    apply: (p) => {
      p.vampirism = (p.vampirism || 0) + 3;
      return p;
    },
  },
  {
    id: 'hyper_shield_epic',
    title: 'Escudo Cinético de Choque',
    description: '+70 Escudo Máximo. Sempre que o escudo absorver dano, dispara onda de choque que repele e atordoa hordas.',
    icon: 'shield_epic',
    rarity: 'EPIC',
    statBonus: '+70 ESCUDO + PULSO DE CHOQUE',
    category: 'SURVIVAL',
    weight: 8,
    apply: (p) => {
      p.shieldShockLevel = (p.shieldShockLevel || 0) + 1;
      p.maxShield += 70;
      p.shield = p.maxShield;
      return p;
    },
  },
  {
    id: 'black_market_epic',
    title: 'Dossiê do Mercado Negro',
    description: 'Receba +500 Créditos imediatos e dobre (2x) o ganho de moedas por abate.',
    icon: 'coins_epic',
    rarity: 'EPIC',
    statBonus: '+500 CRED · 2X MOEDAS',
    category: 'TACTICAL',
    weight: 8,
    apply: (p, ctx) => {
      p.coinsEarned = (p.coinsEarned || 0) + 500;
      p.score = p.coinsEarned;
      p.bonusCoinsMult = (p.bonusCoinsMult || 1) * 2;
      if (ctx?.updateCoins) ctx.updateCoins(500);
      return p;
    },
  },
  {
    id: 'chrono_overclock_epic',
    title: 'Overclock Crono-Tático',
    description: 'Aumenta a cadência em +28%, velocidade de movimento em +18% e concede +12% Esquiva Temporal.',
    icon: 'speed',
    rarity: 'EPIC',
    statBonus: '+28% CADÊNCIA · +12% DESVIO',
    category: 'TACTICAL',
    weight: 8,
    apply: (p) => {
      p.dodgeChance = Math.min(0.65, (p.dodgeChance || 0) + 0.12);
      p.speed = Math.round(p.speed * 1.18);
      Object.values(p.weapons).forEach((w) => {
        w.fireRate = Number((w.fireRate * 1.28).toFixed(1));
      });
      return p;
    },
  },

  // ==========================================
  // LEGENDARY UPGRADES (God Tier - Gold)
  // ==========================================
  {
    id: 'phoenix_protocol_legendary',
    title: 'Protocolo Fênix: Ascensão',
    description: '+60 HP Máx, Cura Total, +100 Escudo Máx e +4.5 HP/s de regeneração contínua.',
    icon: 'phoenix',
    rarity: 'LEGENDARY',
    statBonus: 'CURA TOTAL + 100 ESCUDO',
    category: 'ULTIMATE',
    weight: 4,
    apply: (p) => {
      p.maxHp += 60;
      p.hp = p.maxHp;
      p.maxShield += 100;
      p.shield = p.maxShield;
      p.regenHpRate = (p.regenHpRate || 0) + 4.5;
      return p;
    },
  },
  {
    id: 'omega_overload_legendary',
    title: 'Sobrecarga Bélica Ômega',
    description: '+75% Dano em todo o arsenal, +3 Perfuração e +40% velocidade de projétil.',
    icon: 'omega_damage',
    rarity: 'LEGENDARY',
    statBonus: '+75% DANO · +3 PERFURAÇÃO',
    category: 'ULTIMATE',
    weight: 4,
    apply: (p) => {
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 1.75);
        w.piercing += 3;
        w.bulletSpeed = Math.round(w.bulletSpeed * 1.4);
      });
      return p;
    },
  },
  {
    id: 'lead_storm_legendary',
    title: 'Tempestade de Chumbo',
    description: '+80% Cadência de disparo em todas as armas e reduz a dispersão ao mínimo.',
    icon: 'lead_storm',
    rarity: 'LEGENDARY',
    statBonus: '+80% CADÊNCIA & MIRA ZERO',
    category: 'ULTIMATE',
    weight: 4,
    apply: (p) => {
      Object.values(p.weapons).forEach((w) => {
        w.fireRate = Number((w.fireRate * 1.8).toFixed(1));
        w.spread = Math.max(0.005, w.spread * 0.35);
      });
      return p;
    },
  },
  {
    id: 'ultimate_armory_legendary',
    title: 'Suprimento Bélico Classificado',
    description: 'Desbloqueia e equipa a próxima arma pesada/avançada da armaria (ou +40% Dano se tudo liberado) e +1.000 Créditos.',
    icon: 'trophy_legendary',
    rarity: 'LEGENDARY',
    statBonus: 'NOVA ARMA + 1.000 CRED',
    category: 'ULTIMATE',
    weight: 3,
    apply: (p, ctx) => {
      const locked = Object.values(p.weapons).find((w) => !w.unlocked);
      if (locked) {
        locked.unlocked = true;
        if (ctx?.unlockWeapon) {
          ctx.unlockWeapon(locked.type);
        }
        p.currentWeapon = locked.type;
      } else {
        Object.values(p.weapons).forEach((w) => {
          w.damage = Math.round(w.damage * 1.4);
        });
      }
      p.coinsEarned = (p.coinsEarned || 0) + 1000;
      p.score = p.coinsEarned;
      if (ctx?.updateCoins) ctx.updateCoins(1000);
      return p;
    },
  },
  {
    id: 'chain_lightning_legendary',
    title: 'Tempestade Voltaica',
    description: 'Seus acertos disparam arcos elétricos que saltam para até 3 inimigos próximos, atordoando e causando dano extra (+35% Dano).',
    icon: 'lightning',
    rarity: 'LEGENDARY',
    statBonus: 'ARCOS ELÉTRICOS · +35% DANO',
    category: 'OFFENSE',
    weight: 5,
    apply: (p) => {
      p.chainLightningLevel = (p.chainLightningLevel || 0) + 1;
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 1.35);
      });
      return p;
    },
  },
  {
    id: 'executioner_crit_legendary',
    title: 'Lâmina do Carrasco Imperial',
    description: '+30% Chance Crítica, multiplicador crítico aumentado (+0.75x) e +35% Dano base.',
    icon: 'crit_blade',
    rarity: 'LEGENDARY',
    statBonus: '+30% CRÍTICO · 2.75x+ DANO',
    category: 'OFFENSE',
    weight: 4,
    apply: (p) => {
      p.critChance = Math.min(0.95, (p.critChance || 0) + 0.30);
      p.critMultiplier = (p.critMultiplier || 2.0) + 0.75;
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 1.35);
      });
      return p;
    },
  },
  {
    id: 'gravity_vortex_legendary',
    title: 'Pulso Gravitacional Tático',
    description: 'Emite periodicamente ondas gravitacionais que repelem, atordoam e ferem inimigos próximos. +50 Escudo e +20% Dano.',
    icon: 'gravity_pulse',
    rarity: 'LEGENDARY',
    statBonus: 'ONDA REPULSORA + 50 ESCUDO',
    category: 'SURVIVAL',
    weight: 5,
    apply: (p) => {
      p.gravityPulseLevel = (p.gravityPulseLevel || 0) + 1;
      p.maxShield += 50;
      p.shield = p.maxShield;
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 1.2);
      });
      return p;
    },
  },
  {
    id: 'berserk_adrenaline_legendary',
    title: 'Fúria Adrenérgica Suprema',
    description: '+30% Velocidade, +45% Cadência, +25% Dano e +5 HP drenados a cada abate.',
    icon: 'berserk',
    rarity: 'LEGENDARY',
    statBonus: '+30% VEL · +45% CAD · +5 VAMP',
    category: 'ULTIMATE',
    weight: 4,
    apply: (p) => {
      p.speed = Math.round(p.speed * 1.3);
      p.vampirism = (p.vampirism || 0) + 5;
      Object.values(p.weapons).forEach((w) => {
        w.fireRate = Number((w.fireRate * 1.45).toFixed(1));
        w.damage = Math.round(w.damage * 1.25);
      });
      return p;
    },
  },

  // ==========================================
  // MYTHIC UPGRADES (Transcendent Cosmic Tier)
  // ==========================================
  {
    id: 'mythic_singularity_overdrive',
    title: 'Singularidade Estelar Mítica',
    description:
      'Invoca 5 Lâminas Cósmicas orbitais letais, dispara Explosão Nova a cada 3 tiros, +140% Dano, +65% Cadência, +25% Crítico e Velocidade, +150 HP e +200 Escudo.',
    icon: 'mythic_singularity',
    rarity: 'MYTHIC',
    statBonus: '5 LÂMINAS + NOVA + 140% DANO',
    category: 'ULTIMATE',
    weight: 10,
    apply: (p) => {
      p.mythicSingularity = (p.mythicSingularity || 0) + 1;
      p.maxHp += 150;
      p.hp = p.maxHp;
      p.maxShield += 200;
      p.shield = p.maxShield;
      p.regenHpRate = (p.regenHpRate || 0) + 6.0;
      p.vampirism = (p.vampirism || 0) + 4;
      p.critChance = Math.min(0.95, (p.critChance || 0) + 0.25);
      p.speed = Math.round(p.speed * 1.25);
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 2.4);
        w.fireRate = Number((w.fireRate * 1.65).toFixed(1));
        w.bulletSpeed = Math.round(w.bulletSpeed * 1.35);
        w.piercing += 4;
      });
      return p;
    },
  },
  {
    id: 'mythic_solar_phoenix',
    title: 'Supernova Solar Mítica',
    description:
      'Gera uma Corona Solar flamejante contínua que incinera hordas ao redor e detona Supernovas a cada abate. +180 HP Máx, Cura Total, +160 Escudo e +90% Dano.',
    icon: 'solar_phoenix',
    rarity: 'MYTHIC',
    statBonus: 'AURA SOLAR + EXPLOSÃO + 180 HP',
    category: 'ULTIMATE',
    weight: 10,
    apply: (p) => {
      p.mythicSolarAura = (p.mythicSolarAura || 0) + 1;
      p.maxHp += 180;
      p.hp = p.maxHp;
      p.maxShield += 160;
      p.shield = p.maxShield;
      p.regenHpRate = (p.regenHpRate || 0) + 5.0;
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 1.9);
        w.fireRate = Number((w.fireRate * 1.35).toFixed(1));
      });
      return p;
    },
  },
  {
    id: 'mythic_chrono_reaper',
    title: 'Ceifador Crono-Quântico Mítico',
    description:
      'Multiplica ataques em Rajada Espectral Tripla, garante +35% Esquiva Temporal contra ataques, +110% Dano, +50% Cadência, +25% Velocidade e +6 Perfuração.',
    icon: 'chrono_reaper',
    rarity: 'MYTHIC',
    statBonus: 'TIRO TRIPLO + 35% DESVIO + 110% DANO',
    category: 'ULTIMATE',
    weight: 10,
    apply: (p) => {
      p.mythicSplitShot = (p.mythicSplitShot || 0) + 1;
      p.dodgeChance = Math.min(0.65, (p.dodgeChance || 0) + 0.35);
      p.speed = Math.round(p.speed * 1.25);
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 2.1);
        w.fireRate = Number((w.fireRate * 1.5).toFixed(1));
        w.piercing += 6;
      });
      return p;
    },
  },
  {
    id: 'mythic_void_monarch',
    title: 'Monarca do Abismo Mítico',
    description:
      'Invoca 3 Drones Caçadores que disparam lanças teleguiadas do vazio, +125% Dano, +220 Escudo Máx, +120 HP Máx e +50% Moedas por abate.',
    icon: 'void_monarch',
    rarity: 'MYTHIC',
    statBonus: '3 DRONES VOID + 220 ESCUDO + 125% DANO',
    category: 'ULTIMATE',
    weight: 10,
    apply: (p) => {
      p.mythicVoidDrones = (p.mythicVoidDrones || 0) + 1;
      p.maxHp += 120;
      p.hp = p.maxHp;
      p.maxShield += 220;
      p.shield = p.maxShield;
      p.vampirism = (p.vampirism || 0) + 3;
      p.bonusCoinsMult = (p.bonusCoinsMult || 1) * 1.5;
      Object.values(p.weapons).forEach((w) => {
        w.damage = Math.round(w.damage * 2.25);
      });
      return p;
    },
  },
];

/**
 * Roll 3 distinct upgrades weighted by player level, luck, and stack history.
 * Milestone levels (multiples of 5) boost Epic/Legendary/Mythic resonance.
 */
export function rollLevelUpOptions(
  playerLevel: number,
  ctx?: UpgradeContext | ((amount: number) => void),
  luckLevel: number = 0,
  acquiredStacks?: Record<string, number>
): UpgradeOption[] {
  const upgradeCtx: UpgradeContext =
    typeof ctx === 'function' ? { updateCoins: ctx } : ctx || {};

  const clampedLuck = Math.max(0, Math.min(5, luckLevel));
  const isMilestone = playerLevel > 1 && playerLevel % 5 === 0;

  // Dynamic rarity curve
  const mythicChance = Math.min(
    0.26,
    (isMilestone ? 0.08 : 0.015) + playerLevel * 0.002 + clampedLuck * 0.024
  );
  const legendaryChance = Math.min(
    0.44,
    (isMilestone ? 0.18 : 0.06) + playerLevel * 0.011 + clampedLuck * 0.05
  );
  const epicChance = Math.min(0.35, 0.14 + playerLevel * 0.015 + clampedLuck * 0.035);
  const rawRareChance = Math.min(0.36, 0.26 + playerLevel * 0.012 + clampedLuck * 0.025);
  const rareChance = Math.max(
    0,
    Math.min(rawRareChance, 0.96 - (mythicChance + legendaryChance + epicChance))
  );

  const selectedDefs: UpgradeDefinition[] = [];
  const chosenIds = new Set<string>();

  for (let slot = 0; slot < 3; slot++) {
    const roll = Math.random();
    const alreadyHasMythic = selectedDefs.some((d) => d.rarity === 'MYTHIC');
    let targetRarity: UpgradeRarity = 'COMMON';

    if (!alreadyHasMythic && (roll < mythicChance || (isMilestone && slot === 0 && roll < mythicChance * 2.2))) {
      targetRarity = 'MYTHIC';
    } else if (roll < mythicChance + legendaryChance) {
      targetRarity = 'LEGENDARY';
    } else if (roll < mythicChance + legendaryChance + epicChance) {
      targetRarity = 'EPIC';
    } else if (roll < mythicChance + legendaryChance + epicChance + rareChance) {
      targetRarity = 'RARE';
    } else {
      targetRarity = 'COMMON';
    }

    let pool = ALL_UPGRADES.filter(
      (u) => u.rarity === targetRarity && !chosenIds.has(u.id)
    );

    if (pool.length === 0) {
      pool = ALL_UPGRADES.filter((u) => !chosenIds.has(u.id) && u.rarity !== 'MYTHIC');
    }

    if (pool.length > 0) {
      const totalWeight = pool.reduce((acc, u) => acc + u.weight, 0);
      let randWeight = Math.random() * totalWeight;
      let chosen = pool[0];

      for (const item of pool) {
        randWeight -= item.weight;
        if (randWeight <= 0) {
          chosen = item;
          break;
        }
      }

      chosenIds.add(chosen.id);
      selectedDefs.push(chosen);
    }
  }

  return selectedDefs.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    rarity: def.rarity,
    statBonus: def.statBonus,
    category: def.category,
    currentStack: acquiredStacks?.[def.id] || 0,
    effect: (p: Player) => {
      const nextStacks = { ...(p.acquiredUpgrades || {}) };
      nextStacks[def.id] = (nextStacks[def.id] || 0) + 1;
      p.acquiredUpgrades = nextStacks;
      return def.apply(p, upgradeCtx);
    },
  }));
}
