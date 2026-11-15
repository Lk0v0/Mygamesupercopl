import React, { useState } from 'react';
import { 
  Skull, 
  Biohazard, 
  Orbit, 
  Atom, 
  Play, 
  X, 
  Trophy, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight,
  Crosshair,
  Zap,
  Activity,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GameMode } from '../types';
import { sound } from '../sound';

interface ModeSelectModalProps {
  currentMode: GameMode;
  highScoreZombie: number;
  highScoreAlien: number;
  onSelectModeAndPlay: (mode: GameMode) => void;
  onClose: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  currentMode,
  highScoreZombie,
  highScoreAlien,
  onSelectModeAndPlay,
  onClose,
}) => {
  const [hoveredMode, setHoveredMode] = useState<GameMode | null>(null);

  const handleLaunchMode = (mode: GameMode) => {
    sound.playPowerup();
    onSelectModeAndPlay(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/92 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-5xl bg-slate-900/95 border border-white/10 rounded-2xl md:rounded-3xl p-3.5 sm:p-6 shadow-2xl flex flex-col overflow-hidden max-h-[94dvh]">
        
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500/20 via-slate-800 to-cyan-500/20 border border-white/15 flex items-center justify-center text-white shadow-md shrink-0">
              <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[9px] sm:text-[10px]">
                  OPERAÇÃO TÁTICA
                </span>
                <span aria-hidden="true" className="hidden sm:inline text-white/20">·</span>
                <span className="hidden sm:inline text-slate-400 font-mono text-[10px]">
                  SELEÇÃO DE TEATRO DE GUERRA
                </span>
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-display font-black text-white tracking-tight truncate">
                ESCOLHA SEU MODO DE JOGO
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10 shrink-0"
            aria-label="Fechar Seletor de Modo"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Quick Subtitle / Guide */}
        <div className="hidden sm:flex py-2 items-center justify-between text-xs text-slate-300 shrink-0">
          <p className="text-[11px] text-slate-400">
            Selecione a ameaça hostil para iniciar a missão de combate.
          </p>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
            MUNIÇÃO 100% INFINITA
          </span>
        </div>

        {/* Mode Cards Grid (Side-by-side on mobile landscape & desktop) */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 custom-scrollbar">
          
          {/* ========================================================= */}
          {/* CARD 1: MODO ZUMBI */}
          {/* ========================================================= */}
          <div
            onClick={() => handleLaunchMode(GameMode.ZOMBIE)}
            onMouseEnter={() => setHoveredMode(GameMode.ZOMBIE)}
            onMouseLeave={() => setHoveredMode(null)}
            className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950/95 via-red-950/20 to-slate-950/95 border transition-all duration-300 shadow-xl overflow-hidden cursor-pointer hover:scale-[1.01] hover:border-red-400 ${
              currentMode === GameMode.ZOMBIE
                ? 'border-red-500 ring-2 ring-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.35)]'
                : 'border-red-500/30'
            }`}
            title="Clique para iniciar o Modo Zumbi"
          >
            {/* Background Red Ambient Pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              {/* Card Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shadow-md">
                  <Biohazard className="w-7 h-7 text-red-400" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{highScoreZombie.toLocaleString()} PTS</span>
                  </div>

                  {currentMode === GameMode.ZOMBIE && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 text-slate-950 font-bold text-[10px] uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ATUAL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Kicker */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/30">
                  AMEAÇA BIOLÓGICA
                </span>
                <span className="text-[10px] font-mono text-slate-400">SETOR TERRESTRE</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                <span>MODO ZUMBI</span>
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Sobreviva a enxames colossais de mortos-vivos vorazes. Carnificina visceral, carniçais frenéticos que avançam em disparada e o terrível Tirano Necrótico a cada 5 ondas!
              </p>

              {/* Enemy Roster Preview */}
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5 mb-4">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  INIMIGOS DESTE MODO (SOMENTE ZUMBIS):
                </span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Infectado Comum</span>
                      <span className="text-[9px] font-mono text-slate-400">Horda básica voraz</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Carniçal Corredor</span>
                      <span className="text-[9px] font-mono text-red-300">Velocidade extrema</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-800 shadow-[0_0_6px_rgba(180,83,9,0.6)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Bruto Mutante</span>
                      <span className="text-[9px] font-mono text-amber-300">Blindado & pesado</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Cuspidor Tóxico</span>
                      <span className="text-[9px] font-mono text-lime-300">Dispara bile ácida</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-col gap-1.5 p-2 rounded-lg bg-red-950/60 border border-red-500/30">
                  <div className="flex items-center justify-between text-[10px] font-display font-black text-red-200">
                    <span className="flex items-center gap-1.5 text-red-400">
                      <Skull className="w-3.5 h-3.5" />
                      <span>CHEFES DO MODO ZUMBI (A CADA 5 ONDAS):</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                    <div className="bg-slate-950/80 p-1.5 rounded border border-red-500/20 flex flex-col">
                      <span className="text-red-300 font-bold">Onda 5</span>
                      <span className="text-white truncate">Tirano Necrótico</span>
                      <span className="text-slate-400">Investida Bruta</span>
                    </div>
                    <div className="bg-slate-950/80 p-1.5 rounded border border-red-500/20 flex flex-col">
                      <span className="text-red-300 font-bold">Onda 10</span>
                      <span className="text-white truncate">Açougueiro</span>
                      <span className="text-slate-400">Lâminas Ácidas</span>
                    </div>
                    <div className="bg-slate-950/80 p-1.5 rounded border border-red-500/20 flex flex-col">
                      <span className="text-red-300 font-bold">Onda 15+</span>
                      <span className="text-white truncate">Necro-Titã</span>
                      <span className="text-slate-400">Espinhos Ósseos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat Highlights */}
              <div className="space-y-1 text-[11px] text-slate-300 mb-4">
                <div className="flex items-center gap-1.5 text-red-300">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Combate corpo a corpo agressivo com enxames maciços</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-300">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Sangue e poças de decomposição visceral no chão</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-300">
                  <span className="text-red-400 font-bold">✓</span>
                  <span>Munição infinita em todas as armas desbloqueadas</span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLaunchMode(GameMode.ZOMBIE);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-display font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>JOGAR MODO ZUMBI</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2: MODO ALIEN */}
          {/* ========================================================= */}
          <div
            onClick={() => handleLaunchMode(GameMode.ALIEN)}
            onMouseEnter={() => setHoveredMode(GameMode.ALIEN)}
            onMouseLeave={() => setHoveredMode(null)}
            className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950/95 via-cyan-950/20 to-slate-950/95 border transition-all duration-300 shadow-xl overflow-hidden cursor-pointer hover:scale-[1.01] hover:border-cyan-300 ${
              currentMode === GameMode.ALIEN
                ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.4)]'
                : 'border-cyan-500/30'
            }`}
            title="Clique para iniciar o Modo Alien"
          >
            {/* Background Cyan Ambient Pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Card Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-md">
                  <Atom className="w-7 h-7 text-cyan-400 animate-spin-slow" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold">
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{highScoreAlien.toLocaleString()} PTS</span>
                  </div>

                  {currentMode === GameMode.ALIEN && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 font-bold text-[10px] uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ATUAL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Kicker */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  INVASÃO EXTRATERRESTRE
                </span>
                <span className="text-[10px] font-mono text-slate-400">SETOR CÓSMICO</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                <span>MODO ALIEN</span>
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Repila uma invasão cibernética alienígena. Inimigos atacam à distância com tiros de plasma ionizado, bio-drones voadores velozes e o colossal Overlord Psíquico Cósmico!
              </p>

              {/* Enemy Roster Preview */}
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5 mb-4">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  INIMIGOS DESTE MODO (SOMENTE ALIENS):
                </span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Batedor Cibernético</span>
                      <span className="text-[9px] font-mono text-cyan-300">Dardos de plasma veloz</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Bio-Drone</span>
                      <span className="text-[9px] font-mono text-purple-300">Voo errático & rajada</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Soldado Zarkon</span>
                      <span className="text-[9px] font-mono text-teal-300">Canhão de plasma pesado</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">Golias Cósmico</span>
                      <span className="text-[9px] font-mono text-indigo-300">Carapaça blindada</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-col gap-1.5 p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                  <div className="flex items-center justify-between text-[10px] font-display font-black text-cyan-200">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Orbit className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>CHEFES DO MODO ALIEN (A CADA 5 ONDAS):</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                    <div className="bg-slate-950/80 p-1.5 rounded border border-cyan-500/20 flex flex-col">
                      <span className="text-cyan-300 font-bold">Onda 5</span>
                      <span className="text-white truncate">Overlord Psíquico</span>
                      <span className="text-slate-400">Tiro Triplo Plasma</span>
                    </div>
                    <div className="bg-slate-950/80 p-1.5 rounded border border-cyan-500/20 flex flex-col">
                      <span className="text-cyan-300 font-bold">Onda 10</span>
                      <span className="text-white truncate">Dreadnought</span>
                      <span className="text-slate-400">Espiral de Canhões</span>
                    </div>
                    <div className="bg-slate-950/80 p-1.5 rounded border border-cyan-500/20 flex flex-col">
                      <span className="text-cyan-300 font-bold">Onda 15+</span>
                      <span className="text-white truncate">Leviatã Void</span>
                      <span className="text-slate-400">Nova Estelar Cósmica</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat Highlights */}
              <div className="space-y-1 text-[11px] text-slate-300 mb-4">
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Combate tático com esquiva ativa de projéteis de plasma</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Fluidos bio-luminescentes neon ciano e magenta</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Arena tecnológica com piso holográfico cibernético</span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLaunchMode(GameMode.ALIEN);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-display font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>JOGAR MODO ALIEN</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white/20">●</span>
            <span>Clique em qualquer modo para iniciar a partida imediatamente.</span>
          </div>

          <div className="font-mono text-[11px] flex items-center gap-2">
            <span className="text-slate-500">Modo Selecionado:</span>
            <span className={`font-black ${currentMode === GameMode.ALIEN ? 'text-cyan-400' : 'text-red-400'}`}>
              {currentMode === GameMode.ALIEN ? '👽 MODO ALIEN' : '🧟 MODO ZUMBI'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
