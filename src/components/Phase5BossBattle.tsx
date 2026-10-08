import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Shield,
  Sparkles,
  Activity,
  Award,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sun,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { IMAGES, NURSES, PHASE5_EDUCATIONAL_MESSAGES } from '../data/gameData';
import { soundFX } from '../utils/sound';

interface Phase5BossBattleProps {
  goldenSkinEquipped: boolean;
  onVictory: () => void;
  onAdvanceToPhase10: () => void;
  onBackToMap: () => void;
}

interface CareItem {
  id: string;
  x: number;
  y: number;
  label: string;
  symbol: string;
}

interface MiniChallenge {
  question: string;
  options: string[];
  correctIdx: number;
  feedback: string;
}

const PRENATAL_CHALLENGES: MiniChallenge[] = [
  {
    question: 'Qual cuidado é fundamental em todas as consultas de pré-natal para proteger a gestante?',
    options: [
      'Aferir e acompanhar a pressão arterial regularmente com a equipe de saúde',
      'Verificar a pressão apenas se houver dor intensa',
      'Ignorar o registro na Caderneta da Gestante',
    ],
    correctIdx: 0,
    feedback: 'Excelente! A pressão arterial deve ser acompanhada durante a gestação.',
  },
  {
    question: 'Por que o acompanhamento pré-natal regular reduz os riscos da hipertensão gestacional?',
    options: [
      'Permite identificar precocemente qualquer alteração e orientar o cuidado seguro',
      'Substitui o descanso e a hidratação diária',
      'Serve apenas para agendar a data do parto',
    ],
    correctIdx: 0,
    feedback: 'Perfeito! O acompanhamento pré-natal é importante em todas as etapas.',
  },
  {
    question: 'Como os quatro enfermeiros orientam a gestante sobre sinais de equilíbrio e bem-estar?',
    options: [
      'Manter consultas em dia, alimentação equilibrada e comunicar sinais como inchaço súbito ou cefaleia',
      'Suspender consultas após o primeiro trimestre',
      'Realizar automedicação sem conversar com o enfermeiro ou médico',
    ],
    correctIdx: 0,
    feedback: 'Correto! Informação, vigilância e acolhimento protegem mãe e bebê.',
  },
];

const CARE_ITEM_TYPES = [
  { label: 'Monitor de Pressão', symbol: '🩺' },
  { label: 'Caderneta da Gestante', symbol: '📋' },
  { label: 'Consulta Pré-Natal', symbol: '💚' },
  { label: 'Exame de Rotina', symbol: '🔬' },
  { label: 'Hidratação & Repouso', symbol: '💧' },
];

const GRID_COLS = 5;
const GRID_ROWS = 4;

export const Phase5BossBattle: React.FC<Phase5BossBattleProps> = ({
  goldenSkinEquipped,
  onVictory,
  onAdvanceToPhase10,
  onBackToMap,
}) => {
  // Boss dark energy (100 -> 0 means defeated and illuminated)
  const [bossEnergy, setBossEnergy] = useState<number>(100);
  const [teamWellbeing, setTeamWellbeing] = useState<number>(100);
  const [itemsCollected, setItemsCollected] = useState<number>(0);
  const [challengesCompleted, setChallengesCompleted] = useState<number>(0);

  // Squad position on 5x4 grid
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 2, y: 3 });

  // Active wave row (0..3) sweeping down from the boss
  const [waveRow, setWaveRow] = useState<number | null>(0);
  const [isSlowedByWave, setIsSlowedByWave] = useState<boolean>(false);
  const [shieldActive, setShieldActive] = useState<boolean>(false);

  // Spawned care items on the grid
  const [careItems, setCareItems] = useState<CareItem[]>([
    { id: 'item-1', x: 1, y: 1, label: 'Monitor de Pressão', symbol: '🩺' },
    { id: 'item-2', x: 3, y: 2, label: 'Caderneta da Gestante', symbol: '📋' },
  ]);

  // Cooldowns for the 4 nurses (in seconds)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({
    stephanie: 0,
    marcelo: 0,
    bianca: 0,
    leticia: 0,
  });

  // Educational message banner index
  const [eduMessageIndex, setEduMessageIndex] = useState<number>(0);
  const [combatLog, setCombatLog] = useState<string>(
    'A Sombra da Pressão emite ondas pulsantes! Colete itens de pré-natal e use as habilidades dos 4 enfermeiros.'
  );

  // Active mini-challenge modal
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);

  const isDefeated = bossEnergy <= 0;

  // Trigger parent victory callback when bossEnergy reaches 0
  useEffect(() => {
    if (isDefeated) {
      soundFX.playVictoryFanfare();
      onVictory();
    }
  }, [isDefeated, onVictory]);

  // Rotate educational messages every 4.5s during battle
  useEffect(() => {
    if (isDefeated) return;
    const interval = setInterval(() => {
      setEduMessageIndex((prev) => (prev + 1) % PHASE5_EDUCATIONAL_MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isDefeated]);

  // Cooldown tick timer (every 1s)
  useEffect(() => {
    if (isDefeated) return;
    const timer = setInterval(() => {
      setCooldowns((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] > 0) next[key] = Math.max(0, next[key] - 1);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isDefeated]);

  // Boss pulsing wave mechanic (sweeps rows 0 -> 1 -> 2 -> 3)
  useEffect(() => {
    if (isDefeated || activeChallengeIdx !== null) return;
    const waveTimer = setInterval(() => {
      setWaveRow((prevRow) => {
        const nextRow = prevRow === null ? 0 : (prevRow + 1) % GRID_ROWS;
        return nextRow;
      });
    }, 1800);
    return () => clearInterval(waveTimer);
  }, [isDefeated, activeChallengeIdx]);

  // Check if wave hits squad on current row
  useEffect(() => {
    if (isDefeated || waveRow === null || activeChallengeIdx !== null) return;
    if (waveRow === playerPos.y) {
      if (shieldActive) {
        setCombatLog('Escudo de Marcelo neutralizou a onda pulsante da Sombra da Pressão!');
      } else {
        soundFX.playWavePulse();
        setIsSlowedByWave(true);
        setTeamWellbeing((w) => Math.max(25, w - 4));
        setCombatLog(
          'Onda de pressão atingiu a equipe, dificultando a movimentação! Use Pulso Sereno (Stephanie) ou colete itens.'
        );
        const clearSlow = setTimeout(() => setIsSlowedByWave(false), 2200);
        return () => clearTimeout(clearSlow);
      }
    }
  }, [waveRow, playerPos.y, shieldActive, isDefeated, activeChallengeIdx]);

  // Helper to spawn a new care item at a random free position
  const spawnNewCareItem = useCallback((currentX: number, currentY: number) => {
    const template = CARE_ITEM_TYPES[Math.floor(Math.random() * CARE_ITEM_TYPES.length)];
    let rx = Math.floor(Math.random() * GRID_COLS);
    let ry = Math.floor(Math.random() * GRID_ROWS);
    if (rx === currentX && ry === currentY) {
      rx = (rx + 2) % GRID_COLS;
      ry = (ry + 1) % GRID_ROWS;
    }
    return {
      id: `item-${Date.now()}-${Math.random()}`,
      x: rx,
      y: ry,
      label: template.label,
      symbol: template.symbol,
    };
  }, []);

  // Move squad to target cell
  const moveSquadTo = useCallback(
    (targetX: number, targetY: number) => {
      if (isDefeated || activeChallengeIdx !== null) return;
      const clampedX = Math.max(0, Math.min(GRID_COLS - 1, targetX));
      const clampedY = Math.max(0, Math.min(GRID_ROWS - 1, targetY));

      setPlayerPos({ x: clampedX, y: clampedY });

      // Check item collection
      setCareItems((prevItems) => {
        const hitItem = prevItems.find((it) => it.x === clampedX && it.y === clampedY);
        if (!hitItem) return prevItems;

        soundFX.playCollect();
        setItemsCollected((c) => c + 1);
        setBossEnergy((b) => Math.max(0, b - 12));
        setTeamWellbeing((w) => Math.min(100, w + 8));
        setIsSlowedByWave(false);
        setCombatLog(
          `Item coletado: ${hitItem.label}! “A pressão arterial deve ser acompanhada durante a gestação.” (-12% Sombra)`
        );

        const remaining = prevItems.filter((it) => it.id !== hitItem.id);
        return [...remaining, spawnNewCareItem(clampedX, clampedY)];
      });
    },
    [isDefeated, activeChallengeIdx, spawnNewCareItem]
  );

  // Keyboard controls (WASD / Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDefeated || activeChallengeIdx !== null) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moveSquadTo(playerPos.x, playerPos.y - 1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveSquadTo(playerPos.x, playerPos.y + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveSquadTo(playerPos.x - 1, playerPos.y);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveSquadTo(playerPos.x + 1, playerPos.y);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, isDefeated, activeChallengeIdx, moveSquadTo]);

  // Activate one of the 4 nurses' skills
  const handleUseNurseSkill = (nurseId: 'stephanie' | 'marcelo' | 'bianca' | 'leticia') => {
    if (isDefeated || cooldowns[nurseId] > 0) return;

    const nurse = NURSES.find((n) => n.id === nurseId)!;
    soundFX.playNurseSkill(nurse.pitchOffset);

    if (nurseId === 'stephanie') {
      setIsSlowedByWave(false);
      setTeamWellbeing((w) => Math.min(100, w + 15));
      setBossEnergy((b) => Math.max(0, b - 14));
      setCooldowns((c) => ({ ...c, stephanie: 4 }));
      setCombatLog(
        'Stephanie ativou Pulso Sereno! Ondas de pressão estabilizadas: “O acompanhamento pré-natal é importante.” (-14% Sombra)'
      );
    } else if (nurseId === 'marcelo') {
      setShieldActive(true);
      setIsSlowedByWave(false);
      setBossEnergy((b) => Math.max(0, b - 14));
      setCooldowns((c) => ({ ...c, marcelo: 5 }));
      setCombatLog(
        'Marcelo ergueu o Escudo de Equilíbrio! Ondas bloqueadas: “A pressão arterial deve ser acompanhada durante a gestação.” (-14% Sombra)'
      );
      setTimeout(() => setShieldActive(false), 5000);
    } else if (nurseId === 'bianca') {
      setBossEnergy((b) => Math.max(0, b - 18));
      setCooldowns((c) => ({ ...c, bianca: 5 }));
      setEduMessageIndex((i) => (i + 1) % PHASE5_EDUCATIONAL_MESSAGES.length);
      setCombatLog(
        'Bianca irradiou Luz da Informação sobre o pré-natal, dissipando a energia escura da Sombra da Pressão! (-18% Sombra)'
      );
    } else if (nurseId === 'leticia') {
      setItemsCollected((c) => c + 1);
      setTeamWellbeing(100);
      setBossEnergy((b) => Math.max(0, b - 16));
      setCooldowns((c) => ({ ...c, leticia: 5 }));
      setCombatLog(
        'Leticia ativou Elo Preventivo! Itens de acompanhamento reunidos e bem-estar restaurado ao máximo! (-16% Sombra)'
      );
    }
  };

  const handleOpenChallenge = () => {
    if (isDefeated) return;
    const nextIdx = challengesCompleted % PRENATAL_CHALLENGES.length;
    setActiveChallengeIdx(nextIdx);
  };

  const handleAnswerChallenge = (optionIdx: number) => {
    if (activeChallengeIdx === null) return;
    const challenge = PRENATAL_CHALLENGES[activeChallengeIdx];
    if (optionIdx === challenge.correctIdx) {
      soundFX.playBossPurify();
      setChallengesCompleted((c) => c + 1);
      setBossEnergy((b) => Math.max(0, b - 25));
      setTeamWellbeing(100);
      setCombatLog(`${challenge.feedback} (-25% Sombra da Pressão!)`);
      setActiveChallengeIdx(null);
    } else {
      soundFX.playWavePulse();
      setCombatLog('Tente novamente! Lembre-se: o acompanhamento pré-natal e da pressão arterial é essencial.');
    }
  };

  const handleResetBoss = () => {
    setBossEnergy(100);
    setTeamWellbeing(100);
    setItemsCollected(0);
    setChallengesCompleted(0);
    setIsSlowedByWave(false);
    setShieldActive(false);
    setActiveChallengeIdx(null);
    setCombatLog('Batalha reiniciada! Avance contra a Sombra da Pressão com os 4 enfermeiros.');
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      {/* Phase Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium mb-1">
            <span>Fase 5 de 10</span>
            <span aria-hidden="true">·</span>
            <span>Primeiro Grande Chefão Temático</span>
            <span aria-hidden="true">·</span>
            <span>Saúde na Gestação & Pré-Natal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fase 5 — Chefão: A Sombra da Pressão
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Representação simbólica dos desafios relacionados à hipertensão durante a gestação. Colete itens de
            acompanhamento pré-natal, supere as ondas pulsantes e una as habilidades de Stephanie, Marcelo, Bianca e Leticia.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBackToMap}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Voltar ao Mapa
          </button>
          <button
            onClick={handleResetBoss}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Fase 5</span>
          </button>
        </div>
      </div>

      {/* Prominent Educational Banner During Battle */}
      <div
        className={`mt-5 rounded-xl px-5 py-3.5 border transition-colors duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDefeated
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100'
            : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {isDefeated ? (
            <Sun className="w-5 h-5 text-amber-300 shrink-0" />
          ) : (
            <Activity className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block">
              Mensagem Educativa do Pré-Natal
            </span>
            <p className="text-base sm:text-lg font-display font-semibold text-white">
              {isDefeated
                ? '“O acompanhamento pré-natal é importante.” · “A pressão arterial deve ser acompanhada durante a gestação.”'
                : PHASE5_EDUCATIONAL_MESSAGES[eduMessageIndex]}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-300 font-mono tabular-nums shrink-0">
          Itens: {itemsCollected} · Desafios: {challengesCompleted}
        </div>
      </div>

      {/* Victory Illumination State */}
      {isDefeated && (
        <div className="mt-6 rounded-2xl border border-amber-400/50 bg-gradient-to-br from-emerald-950/90 via-teal-900/70 to-amber-950/80 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Sun className="w-4 h-4" />
                <span>ENERGIA ESCURA DISSIPADA · CENÁRIO ILUMINADO</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                A Sombra da Pressão foi superada pelo Cuidado Pré-Natal!
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                Com o trabalho em equipe de <strong>Stephanie, Marcelo, Bianca e Leticia</strong>, toda a energia escura
                desapareceu e o caminho ficou completamente iluminado. O monitoramento da pressão arterial e o pré-natal
                em dia garantem segurança e tranquilidade para a gestante!
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-sm text-amber-200 font-medium">
                <span className="flex items-center gap-2 text-base font-semibold text-amber-300">
                  <Award className="w-5 h-5 text-amber-400" />
                  🏅 Recompensa Desbloqueada: Medalha Cuidado na Gestação
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={onAdvanceToPhase10}
                className="px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
              >
                <span>Avançar para Fase 10: Sombra do Descuido</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Zone Battle Layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Zone: Boss Visual & Interactive 2D Wave Arena (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Boss Visual Card with Dynamic Illumination Transition */}
          <div
            className={`relative rounded-2xl overflow-hidden border transition-all duration-700 ${
              isDefeated
                ? 'border-amber-400/60 bg-emerald-950/50'
                : 'border-indigo-500/40 bg-slate-900'
            }`}
          >
            <div className="relative h-60 sm:h-72 w-full overflow-hidden">
              {!imgError ? (
                <img
                  src={IMAGES.bossPressao}
                  alt="Sombra da Pressão - Criatura gigante em estilo anime formada por energia escura e ondas pulsantes"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover transition-all duration-1000 ${
                    isDefeated
                      ? 'brightness-125 saturate-150 hue-rotate-60 opacity-40 scale-95'
                      : 'brightness-95 scale-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center">
                  <Activity className="w-16 h-16 text-indigo-400" />
                </div>
              )}

              {/* Pulsing Wave Rings Overlay when Boss is Active */}
              {!isDefeated && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-indigo-400/40 animate-pulse-ring" />
                  <div
                    className="w-72 h-72 rounded-full border border-amber-400/30 animate-pulse-ring"
                    style={{ animationDelay: '0.9s' }}
                  />
                </div>
              )}

              {/* Illuminated Sunbeams Overlay when Defeated */}
              {isDefeated && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-amber-500/25 to-amber-300/30 flex flex-col items-center justify-center p-6 text-center">
                  <Sun className="w-14 h-14 text-amber-300 mb-2" />
                  <p className="text-xl font-display font-bold text-white">
                    Cenário Iluminado · Medalha Cuidado na Gestação Conquistada!
                  </p>
                  <p className="text-xs text-emerald-100 mt-1">
                    A energia escura se dissipou com o acompanhamento pré-natal completo.
                  </p>
                </div>
              )}

              {/* Scrim & Boss Status Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-4">
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <div>
                    <span className="text-xs text-indigo-300 font-medium">
                      CHEFÃO DA FASE 5 · HIPERTENSÃO GESTACIONAL SIMBÓLICA
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Sombra da Pressão</h2>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span className="text-xs text-slate-300 block">
                      {isDefeated ? 'LUZ PLENA RESTAURADA' : 'ENERGIA ESCURA & ONDAS'}
                    </span>
                    <span className="text-sm font-semibold text-amber-300">{bossEnergy}%</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDefeated
                        ? 'bg-emerald-400'
                        : bossEnergy > 50
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-500'
                        : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                    style={{ width: `${isDefeated ? 100 : bossEnergy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 2D Arena Grid: Move, Dodge Pressure Waves & Collect Prenatal Items */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 transition-colors duration-500 ${
              isDefeated
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Campo de Acompanhamento Pré-Natal (Clique nas casas ou use Setas / WASD)
                </h3>
                <p className="text-xs text-slate-400">
                  As ondas roxas pulsantes dificultam o movimento. Colete os itens de cuidado para iluminar o cenário!
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                {shieldActive && (
                  <span className="text-sky-300 font-semibold">● ESCUDO DE MARCELO ATIVO</span>
                )}
                {isSlowedByWave && !shieldActive && (
                  <span className="text-amber-300 font-semibold">▲ ONDA DE PRESSÃO: MOVIMENTO LENTO</span>
                )}
                {!isSlowedByWave && !shieldActive && (
                  <span className="text-emerald-300 font-semibold">● PRESSÃO ESTÁVEL</span>
                )}
              </div>
            </div>

            {/* 5x4 Arena Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 my-3">
              {Array.from({ length: GRID_ROWS }).map((_, rIdx) =>
                Array.from({ length: GRID_COLS }).map((__, cIdx) => {
                  const isPlayerHere = playerPos.x === cIdx && playerPos.y === rIdx;
                  const itemHere = careItems.find((it) => it.x === cIdx && it.y === rIdx);
                  const isWaveHere = !isDefeated && waveRow === rIdx;

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      onClick={() => moveSquadTo(cIdx, rIdx)}
                      className={`h-16 sm:h-20 rounded-xl border flex flex-col items-center justify-center relative transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                        isDefeated
                          ? 'bg-emerald-900/30 border-emerald-500/30 hover:bg-emerald-900/50'
                          : isPlayerHere
                          ? 'bg-emerald-950/90 border-emerald-400 shadow-md scale-[1.02]'
                          : isWaveHere
                          ? 'bg-indigo-950/80 border-indigo-400/60'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Wave line indicator */}
                      {isWaveHere && !isPlayerHere && (
                        <span className="text-[10px] font-mono text-indigo-300/90 tracking-tight">
                          〰 Onda Pulsante
                        </span>
                      )}

                      {/* Care item on tile */}
                      {itemHere && !isPlayerHere && (
                        <div className="flex flex-col items-center">
                          <span className="text-xl sm:text-2xl" role="img" aria-label={itemHere.label}>
                            {itemHere.symbol}
                          </span>
                          <span className="text-[10px] text-amber-200 font-medium truncate max-w-[90px] mt-0.5">
                            {itemHere.label}
                          </span>
                        </div>
                      )}

                      {/* Nurse Squad Position */}
                      {isPlayerHere && (
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-emerald-300">
                            {goldenSkinEquipped ? '✨ Equipe Ouro' : '🛡️ 4 Enfermeiros'}
                          </span>
                          <span className="text-[10px] text-slate-300">
                            {shieldActive ? 'Escudo Ativo' : isSlowedByWave ? 'Onda Sentida' : 'Prontos'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Mobile / Quick Directional Controls + Combat Log */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-300 leading-relaxed">{combatLog}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveSquadTo(playerPos.x - 1, playerPos.y)}
                  aria-label="Mover para esquerda"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSquadTo(playerPos.x, playerPos.y - 1)}
                  aria-label="Mover para cima"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSquadTo(playerPos.x, playerPos.y + 1)}
                  aria-label="Mover para baixo"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSquadTo(playerPos.x + 1, playerPos.y)}
                  aria-label="Mover para direita"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Zone: 4 Nurses' Skills & Prenatal Challenge Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Team Wellbeing & Challenge Trigger Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Equilíbrio & Bem-Estar no Pré-Natal</span>
              </div>
              <span className="text-sm font-mono tabular-nums text-emerald-300 font-semibold">
                {teamWellbeing}/100 · ESTÁVEL
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${teamWellbeing}%` }}
              />
            </div>

            {/* Interactive Mini-Challenge Button */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-amber-300 font-medium">
                  Desafio Educativo de Pré-Natal (-25% Sombra da Pressão)
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  Concluídos: {challengesCompleted}
                </span>
              </div>
              <button
                type="button"
                disabled={isDefeated}
                onClick={handleOpenChallenge}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Realizar Desafio de Acompanhamento da Pressão</span>
              </button>
            </div>

            {/* Inline Active Challenge Box */}
            {activeChallengeIdx !== null && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/50 space-y-3">
                <p className="text-xs font-semibold text-amber-300">
                  Desafio de Acompanhamento #{challengesCompleted + 1}
                </p>
                <p className="text-sm text-white font-medium">
                  {PRENATAL_CHALLENGES[activeChallengeIdx].question}
                </p>
                <div className="space-y-2">
                  {PRENATAL_CHALLENGES[activeChallengeIdx].options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnswerChallenge(idx)}
                      className="w-full text-left p-2.5 rounded-lg text-xs text-slate-200 bg-slate-900 hover:bg-indigo-950/80 border border-slate-700 hover:border-amber-400/60 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4 Nurses' Tactical Skills */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                Habilidades dos Quatro Enfermeiros
              </h3>
              <p className="text-xs text-slate-400">
                Utilize corretamente as especialidades de Stephanie, Marcelo, Bianca e Leticia para superar as ondas.
              </p>
            </div>

            <div className="space-y-2.5">
              {NURSES.map((nurse) => {
                const cd = cooldowns[nurse.id] || 0;
                const isReady = cd === 0 && !isDefeated;
                return (
                  <div
                    key={nurse.id}
                    className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">{nurse.name}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-emerald-300 font-medium truncate">
                          {goldenSkinEquipped ? nurse.goldenSkinName : nurse.skillName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {nurse.skillDescription}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!isReady}
                      onClick={() => handleUseNurseSkill(nurse.id)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        isReady
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {cd > 0 ? `Recarga ${cd}s` : `Usar ${nurse.skillName}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fase 5 Reward Preview / Unlocked Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  isDefeated ? 'bg-amber-400/20 border border-amber-400/60' : 'bg-slate-800'
                }`}
              >
                🏅
              </div>
              <div>
                <div className="text-xs text-slate-400">
                  Recompensa da Fase 5 · {isDefeated ? 'Conquistada!' : 'Derrote o Chefão'}
                </div>
                <div className="text-sm font-bold text-white">Medalha Cuidado na Gestação</div>
              </div>
            </div>
            {isDefeated && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          </div>
        </div>
      </div>
    </section>
  );
};
