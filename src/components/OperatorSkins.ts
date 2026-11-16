/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OperatorSkin } from '../types';

export const OPERATOR_SKINS: OperatorSkin[] = [
  {
    id: 'skin_default',
    name: 'Recruta de Choque',
    callsign: 'VANGUARDA-01',
    title: 'Infantaria Padrão',
    description:
      'Armadura balística modular de combate urbano com capacete de alta proteção, montagem de visão tática e visor HUD ciano.',
    price: 0,
    rarity: 'COMMON',
    color: '#2563eb',
    accentColor: '#38bdf8',
    trailColor: 'rgba(56, 189, 248, 0.45)',
    glowColor: '#38bdf8',
    specialEffectType: 'NONE',
    perkName: 'Equipamento Padrão',
    perkDescription: 'Visual tático limpo sem modificadores de combate.',
    unlocked: true,
  },
  {
    id: 'skin_ghost_recon',
    name: 'Espectro Noturno',
    callsign: 'PHANTOM-07',
    title: 'Operações Furtivas',
    description:
      'Traje furtivo preto-fosco com capuz balístico e óculos noturnos quádruplos infravermelhos de alta letalidade.',
    price: 2500,
    rarity: 'RARE',
    color: '#1e293b',
    accentColor: '#f43f5e',
    trailColor: 'rgba(244, 63, 94, 0.55)',
    glowColor: '#f43f5e',
    specialEffectType: 'SHADOW',
    perkName: 'Rastro Fantasma',
    perkDescription: 'Deixa rastros de sombra carmesim ao correr e concede +6% Velocidade de movimento.',
  },
  {
    id: 'skin_hazard_juggernaut',
    name: 'Bio-Contenção Hazmat',
    callsign: 'BIO-HAZARD',
    title: 'Unidade Química Pesada',
    description:
      'Armadura blindada de contenção biológica com tanque dorsal pressurizado, respirador ativo e placas reforçadas.',
    price: 3800,
    rarity: 'RARE',
    color: '#ca8a04',
    accentColor: '#a3e635',
    trailColor: 'rgba(163, 230, 53, 0.5)',
    glowColor: '#84cc16',
    specialEffectType: 'HAZMAT',
    perkName: 'Blindagem Química',
    perkDescription: 'Libera névoa bio-tóxica verde ao se mover e concede +30 HP Máximo inicial.',
  },
  {
    id: 'skin_pyro_igniter',
    name: 'Piromante Infernal',
    callsign: 'INFERNO-X',
    title: 'Assalto Térmico',
    description:
      'Exoesqueleto de obsidiana com fissuras de magma incandescentes, ombreiras térmicas e visor de plasma solar.',
    price: 6500,
    rarity: 'EPIC',
    color: '#991b1b',
    accentColor: '#fb923c',
    trailColor: 'rgba(249, 115, 22, 0.65)',
    glowColor: '#f97316',
    specialEffectType: 'PYRO',
    perkName: 'Aura de Brasas',
    perkDescription: 'Solta brasas vivas ao correr, ilumina o chão e dá 22% de chance dos tiros incendiarem inimigos.',
  },
  {
    id: 'skin_cryo_warden',
    name: 'Guardião Criogênico',
    callsign: 'ZERO-ABSOLUTO',
    title: 'Defensor Glacial',
    description:
      'Armadura ártica de liga branca com cristais criogênicos ativos nos ombros e núcleo refrigerado sub-zero.',
    price: 8000,
    rarity: 'EPIC',
    color: '#0284c7',
    accentColor: '#e0f2fe',
    trailColor: 'rgba(125, 211, 252, 0.65)',
    glowColor: '#38bdf8',
    specialEffectType: 'CRYO',
    perkName: 'Campo Glacial',
    perkDescription: 'Emite partículas de gelo, concede +35 Escudo inicial e desacelera inimigos muito próximos.',
  },
  {
    id: 'skin_volt_cyber',
    name: 'Ciborgue Voltaico',
    callsign: 'RAIO-OMEGA',
    title: 'Exo-Unidade Cibernética',
    description:
      'Chassi cibernético titânio-escuro com bobinas de alta voltagem nos ombros e visor duplo energizado por arcos elétricos.',
    price: 12500,
    rarity: 'LEGENDARY',
    color: '#0f172a',
    accentColor: '#22d3ee',
    trailColor: 'rgba(34, 211, 238, 0.75)',
    glowColor: '#22d3ee',
    specialEffectType: 'VOLT',
    perkName: 'Descarga Estática',
    perkDescription: 'Arcos elétricos orbitam o traje, eletrocutam inimigos colados e dão +10% Cadência de tiro.',
  },
  {
    id: 'skin_solar_valkyrie',
    name: 'Valquíria Solar',
    callsign: 'SOLARIS-PRIME',
    title: 'Armadura Mítica Estelar',
    description:
      'Traje supremo branco-dourado forjado em energia estelar com fragmentos orbitais prismáticos e coroa luminosa.',
    price: 20000,
    rarity: 'MYTHIC',
    color: '#fef3c7',
    accentColor: '#f59e0b',
    trailColor: 'rgba(250, 204, 21, 0.8)',
    glowColor: '#fbbf24',
    specialEffectType: 'SOLAR',
    perkName: 'Coroa Estelar',
    perkDescription: 'Cristais solares orbitam você com brilho dourado: +12% Dano Global, +25 HP e +25 Escudo.',
  },
];

export function getOperatorSkinById(skinId?: string): OperatorSkin {
  return OPERATOR_SKINS.find((s) => s.id === skinId) || OPERATOR_SKINS[0];
}
