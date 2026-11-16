import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  Coins,
  Cpu,
  Flame,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  AllShipMasteryState,
  MasteryNodeDefinition,
  ShipTypeKey,
  WeaponType,
} from '../types';
import {
  canUnlockMasteryNode,
  getShipMasteryLevelInfo,
  SHIP_MASTERY_NODES,
  SHIP_META,
  TRAIN_MASTERY_CREDIT_COST,
  TRAIN_MASTERY_XP_GAIN,
} from './MasterySystem';
import { sound } from '../sound';

interface MasteryScreenProps {
  coins: number;
  unlockedWeapons: WeaponType[];
  shipMastery: AllShipMasteryState;
  onUnlockNode: (ship: ShipTypeKey, nodeId: string) => boolean;
  onResetTree: (ship: ShipTypeKey) => void;
  onTrainShip: (ship: ShipTypeKey) => boolean;
  onClose: () => void;
}

const SHIPS_ORDER: ShipTypeKey[] = ['TROPER', 'DESTRUCTOR', 'INTERCEPTOR', 'NAVE_REI'];

// Normalized coordinates (percentage) inside the SVG/node canvas
function getNodePosition(tier: 1 | 2 | 3 | 4, branch: 'center' | 'left' | 'right') {
  const yMap = { 1: 12, 2: 37, 3: 63, 4: 87 };
  const xMap = { center: 50, left: 22, right: 78 };
  return { x: xMap[branch], y: yMap[tier] };
}

export const MasteryScreen: React.FC<MasteryScreenProps> = ({
  coins,
  unlockedWeapons,
  shipMastery,
  onUnlockNode,
  onResetTree,
  onTrainShip,
  onClose,
}) => {
  const [selectedShip, setSelectedShip] = useState<ShipTypeKey>('DESTRUCTOR');
  const nodes = SHIP_MASTERY_NODES[selectedShip];
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0].id);

  const handleSelectShip = (ship: ShipTypeKey) => {
    sound.playClick();
    setSelectedShip(ship);
    setSelectedNodeId(SHIP_MASTERY_NODES[ship][0].id);
  };

  const progress = shipMastery[selectedShip] || { xp: 0, unlockedNodes: [] };
  const levelInfo = getShipMasteryLevelInfo(progress.xp);
  const availablePoints = Math.max(0, levelInfo.totalPoints - progress.unlockedNodes.length);
  const meta = SHIP_META[selectedShip];

  const isShipOwned = unlockedWeapons.includes(selectedShip as unknown as WeaponType);

  const selectedNode: MasteryNodeDefinition = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  const isSelectedUnlocked = progress.unlockedNodes.includes(selectedNode.id);
  const isSelectedUnlockable = canUnlockMasteryNode(shipMastery, selectedShip, selectedNode);

  const handleUnlockClick = () => {
    if (!isSelectedUnlockable) return;
    if (onUnlockNode(selectedShip, selectedNode.id)) {
      sound.playMasteryUnlock();
    }
  };

  const handleTrainClick = () => {
    if (levelInfo.isMax || coins < TRAIN_MASTERY_CREDIT_COST) return;
    if (onTrainShip(selectedShip)) {
      sound.playMasteryUnlock();
    }
  };

  return (
    <div
      data-gamepad-scope="modal"
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-1.5 sm:p-4 overflow-hidden select-none"
    >
      <div className="w-full max-w-6xl h-[94dvh] bg-slate-900 border border-white/10 rounded-2xl flex flex-col landscape:flex-row md:flex-row overflow-hidden shadow-2xl">
        {/* LEFT RAIL: Back, Title, Credits, Vertical Ship Tabs & XP Training */}
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
                  Maestria Naves
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 font-bold tabular-nums">
                  <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{coins.toLocaleString()} CRED</span>
                </div>
              </div>
            </div>

            {/* Ship Selector Tabs */}
            <div className="flex landscape:flex-col md:flex-col gap-1 p-1 bg-slate-950 border border-white/10 rounded-xl overflow-x-auto landscape:overflow-x-visible">
              {SHIPS_ORDER.map((shipKey) => {
                const sMeta = SHIP_META[shipKey];
                const sProg = shipMastery[shipKey] || { xp: 0, unlockedNodes: [] };
                const sLvl = getShipMasteryLevelInfo(sProg.xp);
                const pts = Math.max(0, sLvl.totalPoints - sProg.unlockedNodes.length);
                const active = selectedShip === shipKey;

                return (
                  <button
                    key={shipKey}
                    onClick={() => handleSelectShip(shipKey)}
                    className={`px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-slate-800 text-white border border-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sMeta.accentColor }}
                      />
                      <span className="truncate">{sMeta.name}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10.5px] shrink-0">
                      <span className="text-slate-400">Nv.{sLvl.level}</span>
                      {pts > 0 && (
                        <span className="text-emerald-400 font-bold">+{pts}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ship Mastery XP & Train Action */}
          <div className="flex flex-row landscape:flex-col md:flex-col items-center landscape:items-stretch md:items-stretch justify-between gap-2 pt-1 landscape:pt-2.5 landscape:border-t md:border-t border-white/10">
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <div className="flex items-center justify-between text-[10.5px] font-mono tabular-nums">
                <span className="text-slate-300 font-semibold">
                  Nv.{levelInfo.level}/{levelInfo.maxLevel}
                </span>
                <span className="text-slate-400">
                  {levelInfo.isMax
                    ? 'MÁX'
                    : `${levelInfo.xpInLevel}/${levelInfo.xpNeededForNext} XP`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.round(levelInfo.progressRatio * 100)}%`,
                    backgroundColor: meta.accentColor,
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleTrainClick}
              disabled={levelInfo.isMax || coins < TRAIN_MASTERY_CREDIT_COST}
              className={`px-3 py-1.5 sm:py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 text-center ${
                levelInfo.isMax
                  ? 'bg-slate-800 text-slate-500 cursor-default'
                  : coins >= TRAIN_MASTERY_CREDIT_COST
                  ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 cursor-pointer'
                  : 'bg-slate-900 border border-white/10 text-slate-500 cursor-not-allowed'
              }`}
              title="Converter Créditos em XP de Maestria para a nave selecionada"
            >
              {levelInfo.isMax
                ? 'Maestria Máx'
                : `Treinar +${TRAIN_MASTERY_XP_GAIN}XP (${TRAIN_MASTERY_CREDIT_COST.toLocaleString()})`}
            </button>
          </div>
        </aside>

        {/* RIGHT SPLIT AREA: Interactive Skill Tree + Node Inspector */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto sm:overflow-hidden grid grid-cols-1 sm:grid-cols-12">
          {/* Tree Canvas (7 Cols) */}
          <div className="sm:col-span-7 p-2.5 sm:p-4 flex flex-col justify-between bg-slate-950/60 border-b sm:border-b-0 sm:border-r border-white/10 relative overflow-y-auto min-h-[280px] sm:min-h-0">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <span style={{ color: meta.accentColor }} className="font-bold">
                  {meta.name}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-slate-400 truncate">
                  {isShipOwned ? 'Desbloqueada' : 'Compre na Armaria'}
                </span>
              </div>
              <div className="text-emerald-300 font-bold tabular-nums shrink-0">
                Pontos: {availablePoints}
              </div>
            </div>

            {/* Skill Tree Node Graph */}
            <div className="relative flex-1 w-full max-w-lg mx-auto min-h-[265px]">
              {/* SVG Connector Branches */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {nodes.map((node) => {
                  const to = getNodePosition(node.tier, node.branch);
                  return node.requires.map((reqId) => {
                    const parent = nodes.find((p) => p.id === reqId);
                    if (!parent) return null;
                    const from = getNodePosition(parent.tier, parent.branch);
                    const bothUnlocked =
                      progress.unlockedNodes.includes(parent.id) &&
                      progress.unlockedNodes.includes(node.id);
                    const parentUnlocked = progress.unlockedNodes.includes(parent.id);

                    return (
                      <line
                        key={`${reqId}->${node.id}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={
                          bothUnlocked
                            ? meta.accentColor
                            : parentUnlocked
                            ? 'rgba(255,255,255,0.35)'
                            : 'rgba(255,255,255,0.1)'
                        }
                        strokeWidth={bothUnlocked ? 0.85 : 0.45}
                        strokeDasharray={bothUnlocked ? undefined : '1.5 1.5'}
                      />
                    );
                  });
                })}
              </svg>

              {/* Tree Nodes */}
              {nodes.map((node) => {
                const pos = getNodePosition(node.tier, node.branch);
                const unlocked = progress.unlockedNodes.includes(node.id);
                const unlockable = canUnlockMasteryNode(shipMastery, selectedShip, node);
                const isSelected = selectedNode.id === node.id;
                const isAbility = node.kind === 'HABILIDADE';

                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedNodeId(node.id);
                    }}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      borderColor: unlocked
                        ? meta.accentColor
                        : isSelected
                        ? '#ffffff'
                        : unlockable
                        ? 'rgba(52, 211, 153, 0.7)'
                        : 'rgba(255, 255, 255, 0.14)',
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-[35%] max-w-[160px] p-1.5 sm:p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      unlocked
                        ? 'bg-slate-900 shadow-lg'
                        : unlockable
                        ? 'bg-slate-900 hover:bg-slate-800'
                        : 'bg-slate-950 opacity-85 hover:opacity-100'
                    } ${isSelected ? 'ring-2 ring-white/50 scale-[1.03] z-20' : 'z-10'}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-[8.5px] sm:text-[9.5px] font-mono font-bold uppercase tracking-wider truncate ${
                          isAbility ? 'text-amber-300' : 'text-cyan-300'
                        }`}
                      >
                        {node.kind}
                      </span>
                      {unlocked ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : unlockable ? (
                        <Sparkles className="w-3 h-3 text-emerald-300 shrink-0" />
                      ) : (
                        <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10.5px] sm:text-xs font-display font-bold text-white leading-tight truncate">
                      {node.title}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-0.5">
                      {node.shortBonus}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2">
              <span>Nível 1 → Ramos Passiva / Habilidade → Suprema</span>
              <span>Ganhe XP abatendo inimigos com a nave</span>
            </div>
          </div>

          {/* Right 5 Cols: Selected Node Inspector */}
          <div className="sm:col-span-5 p-3.5 sm:p-5 flex flex-col justify-between gap-3 sm:gap-5 bg-slate-900/80 overflow-y-auto">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Tier {selectedNode.tier} · {selectedNode.kind === 'HABILIDADE' ? 'Habilidade Especial' : 'Aprimoramento Passivo'}
                </span>
                {selectedNode.cooldownSec && (
                  <span className="text-xs font-mono text-amber-300">
                    Recarga: {selectedNode.cooldownSec}s
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl border border-white/15 bg-slate-950 flex items-center justify-center shrink-0"
                  style={{ color: meta.accentColor }}
                >
                  {selectedNode.kind === 'HABILIDADE' ? (
                    selectedShip === 'NAVE_REI' ? (
                      <Flame className="w-6 h-6" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )
                  ) : selectedShip === 'NAVE_REI' ? (
                    <Shield className="w-6 h-6" />
                  ) : (
                    <Cpu className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-display font-bold text-white leading-tight">
                    {selectedNode.title}
                  </h3>
                  <div className="text-xs font-mono font-semibold mt-1" style={{ color: meta.accentColor }}>
                    {selectedNode.shortBonus}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedNode.description}
              </p>

              {/* Prerequisites Info */}
              {selectedNode.requires.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Pré-requisito ({selectedNode.tier === 4 ? 'Qualquer ramo anterior' : 'Obrigatório'})
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedNode.requires.map((reqId) => {
                      const reqNode = nodes.find((n) => n.id === reqId);
                      const met = progress.unlockedNodes.includes(reqId);
                      return (
                        <span
                          key={reqId}
                          className={`font-medium ${met ? 'text-emerald-400' : 'text-slate-400'}`}
                        >
                          {met ? '✓ ' : '• '}
                          {reqNode?.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <button
                onClick={handleUnlockClick}
                disabled={isSelectedUnlocked || !isSelectedUnlockable}
                className={`w-full py-3.5 px-5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  isSelectedUnlocked
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : isSelectedUnlockable
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg cursor-pointer active:scale-[0.98]'
                    : 'bg-slate-800/80 text-slate-500 border border-white/10 cursor-not-allowed'
                }`}
              >
                {isSelectedUnlocked ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Habilidade Desbloqueada</span>
                  </>
                ) : isSelectedUnlockable ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Desbloquear ({selectedNode.cost} Ponto)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {availablePoints < selectedNode.cost
                        ? 'Pontos de Maestria Insuficientes'
                        : 'Desbloqueie o Nó Anterior'}
                    </span>
                  </>
                )}
              </button>

              {progress.unlockedNodes.length > 0 && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onResetTree(selectedShip);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resetar Árvore da {meta.name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
