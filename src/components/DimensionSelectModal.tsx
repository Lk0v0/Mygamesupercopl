import React, { useState } from 'react';
import { 
  Globe2, 
  Trees, 
  Snowflake, 
  Lock, 
  Play, 
  X, 
  Compass, 
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  Sun,
  Wind,
  Layers,
  Skull
} from 'lucide-react';
import { sound } from '../sound';

interface DimensionSelectModalProps {
  unlockedIceBiome?: boolean;
  activeBiome: 'FOREST' | 'FROZEN_FOREST' | 'DESERT';
  onSelectBiome: (biome: 'FOREST' | 'FROZEN_FOREST' | 'DESERT') => void;
  onStartInBiome?: (biome: 'FOREST' | 'FROZEN_FOREST' | 'DESERT', isDragonAttack?: boolean) => void;
  onClose: () => void;
}

export const DimensionSelectModal: React.FC<DimensionSelectModalProps> = ({
  activeBiome,
  onSelectBiome,
  onStartInBiome,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERWORLD' | 'DIMENSIONS'>('OVERWORLD');
  const [dragonAttackActive, setDragonAttackActive] = useState<boolean>(false);

  const handleLaunchBiome = (biome: 'FOREST' | 'FROZEN_FOREST' | 'DESERT', isDragonAttack = false) => {
    sound.playPowerup();
    onSelectBiome(biome);
    if (onStartInBiome) {
      onStartInBiome(biome, isDragonAttack);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/92 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl bg-slate-900/95 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
        
        {/* Subtle decorative ambient lights */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
                  Teatro de Operações
                </span>
                <span aria-hidden="true" className="text-white/20">·</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Seleção de Bioma
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>ESCOLHA SEU BIOMA DE COMBATE</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playPowerup();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between gap-3 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                sound.playPowerup();
                setActiveTab('OVERWORLD');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'OVERWORLD'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Biomas da Overworld</span>
            </button>

            <button
              onClick={() => {
                sound.playPowerup();
                setActiveTab('DIMENSIONS');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'DIMENSIONS'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dimensões Futuras</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Clique no bioma para entrar em combate diretamente
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-3 pr-1 custom-scrollbar">
          
          {/* TAB 1: OVERWORLD BIOMES */}
          {activeTab === 'OVERWORLD' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. BIOMA: FLORESTA SOMBRIA (Available + EVENTO DRAGON ATTACK) */}
              <div
                onClick={() => handleLaunchBiome('FOREST', dragonAttackActive)}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-950/80 border transition-all cursor-pointer shadow-lg hover:shadow-2xl ${
                  dragonAttackActive
                    ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
                    : activeBiome === 'FOREST'
                      ? 'border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : 'border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform shadow-md ${
                      dragonAttackActive 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 group-hover:scale-105'
                    }`}>
                      {dragonAttackActive ? <Flame className="w-6 h-6 text-rose-400" /> : <Trees className="w-6 h-6" />}
                    </div>

                    <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      dragonAttackActive
                        ? 'bg-rose-500 text-white font-black animate-pulse shadow-md'
                        : activeBiome === 'FOREST'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    }`}>
                      {dragonAttackActive ? (
                        <>
                          <Flame className="w-3.5 h-3.5 fill-white" />
                          <span>EVENTO ATIVO</span>
                        </>
                      ) : activeBiome === 'FOREST' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selecionado</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Disponível</span>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                    <span>{dragonAttackActive ? 'Floresta em Chamas' : 'Floresta Sombria'}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      dragonAttackActive 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {dragonAttackActive ? 'DRAGON ATTACK' : 'MATA NEGRA'}
                    </span>
                  </h3>
                  <div className={`text-xs font-medium mb-3 ${dragonAttackActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {dragonAttackActive ? '🔥 Céus em Chamas, Enxames de Dragões & Dragãozão Boss' : 'Vegetação Densa, Troncos & Clareiras Táticas'}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {dragonAttackActive
                      ? 'Um cataclismo de chamas incendiou a floresta! Enfrente 5 ondas ferozes de dragões cuspidores de fogo e derrote o colossal Dragãozão na Onda 5 para conquistar a Relíquia do Dragão Serpente!'
                      : 'Mata fechada com pinheiros milenares, vegetação alta e o temível Golias da Mata Negra que surge como chefe único a cada 10 ondas.'}
                  </p>

                  {/* EVENT TOGGLE BOX (THE DRAGON ATTACK) */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playPowerup();
                      setDragonAttackActive(prev => !prev);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 mb-4 select-none ${
                      dragonAttackActive
                        ? 'bg-rose-950/80 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.35)] text-rose-200'
                        : 'bg-slate-900/80 border-white/10 hover:border-rose-500/40 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 ${dragonAttackActive ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                        <Flame className={`w-4 h-4 ${dragonAttackActive ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-xs uppercase tracking-wide ${dragonAttackActive ? 'text-rose-300' : 'text-white'}`}>
                            Ativar "The Dragon Attack"
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono font-bold uppercase border border-rose-500/40">
                            5 ONDAS
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 mt-0.5 leading-snug">
                          {dragonAttackActive
                            ? '✓ Ativado: 5 ondas com dragões e Boss Dragãozão'
                            : 'Clique para ativar o evento especial de dragões'}
                        </p>
                      </div>
                    </div>

                    <div className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                      dragonAttackActive ? 'bg-rose-500' : 'bg-slate-800 border border-white/20'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-md ${
                        dragonAttackActive ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>

                  {!dragonAttackActive && (
                    <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/5 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Excelente cobertura natural para manobras de tiro</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                        <Skull className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Chefe W10: <strong>Golias da Mata Negra</strong> (Impacto Sísmico)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10">
                  {dragonAttackActive ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchBiome('FOREST', true);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 active:scale-95 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 fill-white animate-bounce" />
                      <span>INICIAR THE DRAGON ATTACK (5 ONDAS)</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchBiome('FOREST', false);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>JOGAR NA FLORESTA (NORMAL)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. BIOMA: TUNDRA DO PERMAFROST (REMAKE 2.0 TOTALMENTE ATIVO!) */}
              <div
                onClick={() => handleLaunchBiome('FROZEN_FOREST')}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-950/80 border transition-all cursor-pointer shadow-lg hover:shadow-2xl ${
                  activeBiome === 'FROZEN_FOREST'
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.4)]'
                    : 'border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-md">
                      <Snowflake className="w-6 h-6 animate-pulse" />
                    </div>

                    <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      activeBiome === 'FROZEN_FOREST'
                        ? 'bg-cyan-400 text-slate-950 font-black'
                        : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span>REMAKE ATIVO</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                    <span>Tundra do Permafrost 2.0</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">REMAKE</span>
                  </h3>
                  <div className="text-xs text-cyan-400 font-medium mb-3">
                    ❄️ Gêiseres Criogênicos, Monólitos & Ymir o Titã Absoluto
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Remake completo da dimensão de gelo: fendas abissais brilhantes, pinheiros com estalactites gélidas e mecânicas táticas de combate sub-zero!
                  </p>

                  {/* REMAKE GLACIAL 2.0 ACTIVE BADGE */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-950/80 to-slate-950 border border-cyan-400/40 text-cyan-200 text-xs flex flex-col gap-1.5 shadow-inner mb-4">
                    <div className="flex items-center gap-1.5 font-black text-cyan-300 uppercase tracking-wide text-[10.5px]">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                      <span>NOVIDADES DO REMAKE 2.0 ATIVAS</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 text-cyan-200">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Gêiseres Criogênicos:</strong> Erupções que congelam zumbis e dão escudo!</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-200">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Monólitos Estilhaçáveis:</strong> Explodem em 14 estilhaços perfurantes.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-200">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Patins Táticos:</strong> +15% vel. de deslize e recarga de esquiva mais rápida.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-200">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span><strong>Novo Chefe W10:</strong> Ymir, Titã do Zero Absoluto (Fase 2 Diamante)!</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchBiome('FROZEN_FOREST');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-sky-400 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>ENTRAR NO REMAKE DO GELO</span>
                  </button>
                </div>
              </div>

              {/* 3. BIOMA: DESERTO ESCALDANTE (GRANDE UPDATE TOTALMENTE ATIVO!) */}
              <div
                onClick={() => handleLaunchBiome('DESERT')}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-slate-950/95 via-amber-950/20 to-slate-950/95 border transition-all cursor-pointer shadow-xl hover:shadow-2xl overflow-hidden ${
                  activeBiome === 'DESERT'
                    ? 'border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.4)]'
                    : 'border-amber-500/30 hover:border-amber-400 hover:bg-slate-950'
                }`}
              >
                {/* Golden sun ray ambient glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform">
                      <Sun className="w-6 h-6 animate-spin-slow" />
                    </div>

                    <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      activeBiome === 'DESERT'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                    }`}>
                      {activeBiome === 'DESERT' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selecionado</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>NOVO UPDATE</span>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                    <span>Deserto Escaldante</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">DUNAS</span>
                  </h3>
                  <div className="text-xs text-amber-400 font-medium mb-3 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ermos Áridos, Tempestades de Areia & Relíquia Solar</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Grande update do Deserto: vastas dunas onduladas sob sol ardente, vórtices de areia movediça, cactos gigantes, oásis secretos e o colossal <strong>Verme Devorador das Dunas</strong> na Onda 10!
                  </p>

                  {/* ACTIVE DESERT UPDATE FEATURES BOX */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/80 to-slate-950 border border-amber-500/40 text-amber-200 text-xs flex flex-col gap-1.5 shadow-inner mb-4">
                    <div className="flex items-center gap-1.5 font-black text-amber-300 uppercase tracking-wide text-[10.5px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>DESTAQUES DO GRANDE UPDATE DO DESERTO</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span><strong>Vórtices de Areia Movediça:</strong> Atraem e desaceleram inimigos com atrito real!</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span><strong>Cactos, Oásis & Ruínas:</strong> Cobertura tática e obeliscos antigos esculpidos.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span><strong>Inimigos Mumificados & Escorpiões:</strong> Disparam veneno abrasivo e maldições.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <Skull className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Chefe Onda 10:</strong> O Grande Verme Devorador das Dunas (Erupção subterrânea)!</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchBiome('DESERT');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>ENTRAR NO DESERTO ESCALDANTE</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EXTRA DIMENSIONS */}
          {activeTab === 'DIMENSIONS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* DIMENSION: TERRA INVERTIDA */}
              <div className="relative flex flex-col justify-between p-5 rounded-2xl bg-slate-950/60 border border-purple-500/30">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Layers className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Em Pesquisa Dimensional</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1">
                    Terra Invertida
                  </h3>
                  <div className="text-xs text-purple-400 font-medium mb-3">
                    Dimensão Distorcida & Fendas Gravitacionais
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Uma fenda dimensional invertida com gravidade caótica, mutações alienígenas e abominações de antimatéria. O laboratório de física quântica mantém os portais selados.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="w-full py-3 px-4 rounded-xl bg-slate-800/80 border border-white/5 text-slate-400 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock className="w-3.5 h-3.5" />
                    <span>ACESSO LACRADO (EM BREVE)</span>
                  </div>
                </div>
              </div>

              {/* OVERWORLD ACCESS QUICK SHORTCUT */}
              <div 
                onClick={() => {
                  sound.playPowerup();
                  setActiveTab('OVERWORLD');
                }}
                className="relative flex flex-col justify-between p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Globe2 className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dimensão Ativa</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1">
                    Overworld (Superfície)
                  </h3>
                  <div className="text-xs text-emerald-400 font-medium mb-3">
                    Zona Terrestre dos Sobreviventes
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Contém os biomas ativos: Floresta Sombria, Floresta Congelada e o próximo Deserto Escaldante.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => setActiveTab('OVERWORLD')}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ver Biomas da Overworld</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Ao escolher um bioma disponível, a operação de combate iniciará imediatamente.</span>
          <span className="font-semibold text-emerald-400 font-mono flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              activeBiome === 'DESERT' ? 'bg-amber-400' : activeBiome === 'FROZEN_FOREST' ? 'bg-cyan-400' : 'bg-emerald-400'
            }`} />
            <span>Bioma Atual: {
              activeBiome === 'DESERT'
                ? '🏜️ Deserto Escaldante'
                : activeBiome === 'FROZEN_FOREST'
                ? '❄️ Floresta Congelada'
                : '🌲 Floresta Sombria'
            }</span>
          </span>
        </div>

      </div>
    </div>
  );
};
