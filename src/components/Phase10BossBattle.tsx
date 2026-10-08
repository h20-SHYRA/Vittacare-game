import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  CheckCircle2,
  Sun,
  RotateCcw,
  ChevronRight,
  Users,
  BookOpen,
  HeartPulse,
  Compass,
} from 'lucide-react';
import { IMAGES, NURSES, PHASE10_EDUCATIONAL_MESSAGES } from '../data/gameData';
import { soundFX } from '../utils/sound';

interface Phase10BossBattleProps {
  goldenSkinEquipped: boolean;
  onVictory: () => void;
  onOpenFinale: () => void;
  onBackToMap: () => void;
}

interface InfoStatement {
  id: string;
  statement: string;
  isCorrect: boolean;
  obstacleFragment: string;
  explanation: string;
}

const STAGE1_INFO_CARDS: InfoStatement[] = [
  {
    id: 'info-1',
    statement: 'Consultas e exames preventivos devem ser feitos regularmente, mesmo quando não há sintomas.',
    isCorrect: true,
    obstacleFragment: 'Fragmento da Falta de Informação',
    explanation: 'Correto! “Informação também é cuidado.” A prevenção atua antes dos sintomas.',
  },
  {
    id: 'info-2',
    statement: 'O acompanhamento ginecológico e pré-natal só é necessário quando surge dor intensa.',
    isCorrect: false,
    obstacleFragment: 'Mito do Descuido',
    explanation: 'Mito dissipado! Não espere sentir dor: o acompanhamento periódico protege a saúde.',
  },
  {
    id: 'info-3',
    statement: 'Conhecer o próprio corpo, manter vacinas em dia e dialogar com enfermeiros fortalece a autonomia da mulher.',
    isCorrect: true,
    obstacleFragment: 'Fragmento da Desinformação',
    explanation: 'Correto! A orientação profissional acolhedora garante decisões seguras.',
  },
  {
    id: 'info-4',
    statement: 'O pré-natal e o controle da pressão arterial unem prevenção, escuta e segurança em cada trimestre.',
    isCorrect: true,
    obstacleFragment: 'Fragmento da Dúvida',
    explanation: 'Exato! Cuidar de cada etapa previne complicações e promove bem-estar.',
  },
];

interface PreventionItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  collected: boolean;
}

const INITIAL_PREVENTION_ITEMS: PreventionItem[] = [
  { id: 'prev-1', name: 'Exame Preventivo (Papanicolau)', icon: '🔬', category: 'Rastreamento', collected: false },
  { id: 'prev-2', name: 'Exame Clínico & Mamografia', icon: '🎗️', category: 'Diagnóstico Precoce', collected: false },
  { id: 'prev-3', name: 'Caderneta de Vacinação em Dia', icon: '💉', category: 'Imunização', collected: false },
  { id: 'prev-4', name: 'Aferição da Pressão Arterial', icon: '🩺', category: 'Monitoramento', collected: false },
  { id: 'prev-5', name: 'Consulta de Rotina & Escuta', icon: '📋', category: 'Acompanhamento', collected: false },
  { id: 'prev-6', name: 'Hábitos Saudáveis & Bem-Estar', icon: '🌿', category: 'Autocuidado', collected: false },
];

interface HealthIndicator {
  id: string;
  label: string;
  threatFragment: string;
  recommendedNurseId: 'stephanie' | 'marcelo' | 'bianca' | 'leticia';
  recommendedNurseName: string;
  protected: boolean;
}

const INITIAL_INDICATORS: HealthIndicator[] = [
  {
    id: 'ind-1',
    label: 'Indicador de Cuidado Pré-Natal',
    threatFragment: 'Ausência de Acompanhamento',
    recommendedNurseId: 'stephanie',
    recommendedNurseName: 'Stephanie',
    protected: false,
  },
  {
    id: 'ind-2',
    label: 'Indicador de Equilíbrio da Pressão',
    threatFragment: 'Desequilíbrio Silencioso',
    recommendedNurseId: 'marcelo',
    recommendedNurseName: 'Marcelo',
    protected: false,
  },
  {
    id: 'ind-3',
    label: 'Indicador de Informação Confiável',
    threatFragment: 'Falta de Informação',
    recommendedNurseId: 'bianca',
    recommendedNurseName: 'Bianca',
    protected: false,
  },
  {
    id: 'ind-4',
    label: 'Indicador de Prevenção Feminina',
    threatFragment: 'Adiamento dos Cuidados',
    recommendedNurseId: 'leticia',
    recommendedNurseName: 'Leticia',
    protected: false,
  },
];

export const Phase10BossBattle: React.FC<Phase10BossBattleProps> = ({
  goldenSkinEquipped,
  onVictory,
  onOpenFinale,
  onBackToMap,
}) => {
  // Current stage: 1 = Informação, 2 = Prevenção, 3 = Cuidado, 4 = União, 5 = Defeated
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [eduMsgIdx, setEduMsgIdx] = useState<number>(0);
  const [statusFeedback, setStatusFeedback] = useState<string>(
    'Etapa 1 — Informação: Identifique as 3 afirmações corretas sobre cuidados com a saúde para dissipar os primeiros fragmentos da Sombra do Descuido!'
  );
  const [imgError, setImgError] = useState<boolean>(false);

  // Stage 1 state: verified correct statement IDs
  const [verifiedIds, setVerifiedIds] = useState<string[]>([]);

  // Stage 2 state: Prevention items
  const [preventionItems, setPreventionItems] = useState<PreventionItem[]>(INITIAL_PREVENTION_ITEMS);

  // Stage 3 state: Protected Health Indicators
  const [selectedNurseForCare, setSelectedNurseForCare] = useState<'stephanie' | 'marcelo' | 'bianca' | 'leticia'>('stephanie');
  const [indicators, setIndicators] = useState<HealthIndicator[]>(INITIAL_INDICATORS);

  // Stage 4 state: Union of the 4 Nurses' abilities
  const [activatedUnionNurses, setActivatedUnionNurses] = useState<string[]>([]);

  const isDefeated = stage === 5;
  const bossEnergyPercent =
    stage === 1
      ? 100 - verifiedIds.length * 8
      : stage === 2
      ? 75 - preventionItems.filter((i) => i.collected).length * 4
      : stage === 3
      ? 50 - indicators.filter((i) => i.protected).length * 6
      : stage === 4
      ? Math.max(5, 25 - activatedUnionNurses.length * 5)
      : 0;

  // Cycle educational messages
  useEffect(() => {
    if (isDefeated) return;
    const timer = setInterval(() => {
      setEduMsgIdx((prev) => (prev + 1) % PHASE10_EDUCATIONAL_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isDefeated]);

  // Stage 1 Handler: Identify true health information
  const handleSelectInfoCard = (card: InfoStatement) => {
    if (verifiedIds.includes(card.id)) return;
    if (card.isCorrect) {
      soundFX.playCollect();
      const updated = [...verifiedIds, card.id];
      setVerifiedIds(updated);
      setStatusFeedback(card.explanation);

      if (updated.length >= 3) {
        soundFX.playBossPurify();
        setTimeout(() => {
          setStage(2);
          setStatusFeedback(
            'Etapa 1 Concluída! Etapa 2 — Prevenção: Colete todos os 6 itens de prevenção e acompanhamento para enfraquecer a Sombra do Descuido!'
          );
        }, 700);
      }
    } else {
      soundFX.playWavePulse();
      setStatusFeedback(
        `Atenção! Essa afirmação é um mito (${card.obstacleFragment}). Selecione apenas as informações verdadeiras sobre prevenção e acompanhamento!`
      );
    }
  };

  // Stage 2 Handler: Collect prevention items
  const handleCollectPreventionItem = (itemId: string) => {
    soundFX.playCollect();
    const updated = preventionItems.map((it) => (it.id === itemId ? { ...it, collected: true } : it));
    setPreventionItems(updated);

    const collectedCount = updated.filter((i) => i.collected).length;
    setStatusFeedback(
      `Item de prevenção coletado (${collectedCount}/6)! “Prevenção faz parte da saúde.”`
    );

    if (collectedCount === updated.length) {
      soundFX.playBossPurify();
      setTimeout(() => {
        setStage(3);
        setStatusFeedback(
          'Etapa 2 Concluída! Etapa 3 — Cuidado: Trabalhe com os 4 enfermeiros para proteger os Indicadores de Saúde e abrir o caminho!'
        );
      }, 700);
    }
  };

  // Stage 3 Handler: Protect Health Indicators with the 4 Nurses
  const handleProtectIndicator = (indicator: HealthIndicator) => {
    if (indicator.protected) return;
    if (selectedNurseForCare === indicator.recommendedNurseId) {
      const nurse = NURSES.find((n) => n.id === selectedNurseForCare)!;
      soundFX.playNurseSkill(nurse.pitchOffset);
      const updated = indicators.map((ind) =>
        ind.id === indicator.id ? { ...ind, protected: true } : ind
      );
      setIndicators(updated);
      const protectedCount = updated.filter((i) => i.protected).length;
      setStatusFeedback(
        `${nurse.name} protegeu o ${indicator.label} contra a ${indicator.threatFragment}! (${protectedCount}/4)`
      );

      if (protectedCount === updated.length) {
        soundFX.playBossPurify();
        setTimeout(() => {
          setStage(4);
          setStatusFeedback(
            'Etapa 3 Concluída! Etapa 4 — União: Combine as habilidades de Stephanie, Marcelo, Bianca e Leticia para derrotar definitivamente a Sombra do Descuido!'
          );
        }, 700);
      }
    } else {
      soundFX.playWavePulse();
      setStatusFeedback(
        `Para proteger o "${indicator.label}", selecione primeiro ${indicator.recommendedNurseName} na barra de enfermeiros acima!`
      );
    }
  };

  // Stage 4 Handler: Combine all 4 Nurses' abilities
  const handleActivateUnionNurse = (nurseId: 'stephanie' | 'marcelo' | 'bianca' | 'leticia') => {
    if (activatedUnionNurses.includes(nurseId)) return;
    const nurse = NURSES.find((n) => n.id === nurseId)!;
    soundFX.playNurseSkill(nurse.pitchOffset);
    const updated = [...activatedUnionNurses, nurseId];
    setActivatedUnionNurses(updated);
    setStatusFeedback(
      `${nurse.name} canalizou ${nurse.skillName} na União Vittacare! (${updated.length}/4 enfermeiros sincronizados)`
    );
  };

  const handleUnleashFinalUnion = () => {
    if (activatedUnionNurses.length < 4) return;
    soundFX.playVictoryFanfare();
    setStage(5);
    setStatusFeedback(
      'VITÓRIA DEFINITIVA! A União de Stephanie, Marcelo, Bianca e Leticia dissipou todas as sombras! O caminho para a Clínica Vittacare está aberto!'
    );
    onVictory();
  };

  const handleResetPhase10 = () => {
    setStage(1);
    setVerifiedIds([]);
    setPreventionItems(INITIAL_PREVENTION_ITEMS);
    setIndicators(INITIAL_INDICATORS);
    setActivatedUnionNurses([]);
    setStatusFeedback(
      'Batalha Final reiniciada! Etapa 1 — Informação: Identifique as afirmações corretas sobre cuidados com a saúde.'
    );
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
            <span>Fase 10 de 10</span>
            <span aria-hidden="true">·</span>
            <span>Chefão Final Temático</span>
            <span aria-hidden="true">·</span>
            <span>Prevenção & Saúde Integral da Mulher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fase 10 — Chefão Final: A Sombra do Descuido
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Guardião simbólico formado por sombras e fragmentos que representam falta de informação, ausência de
            acompanhamento e adiamento do autocuidado. Supere as 4 etapas com Stephanie, Marcelo, Bianca e Leticia!
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
            onClick={handleResetPhase10}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Fase 10</span>
          </button>
        </div>
      </div>

      {/* Prominent Educational Messages Banner */}
      <div
        className={`mt-5 rounded-xl px-5 py-3.5 border transition-colors duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDefeated
            ? 'bg-emerald-950/75 border-amber-400/60 text-emerald-100'
            : 'bg-purple-950/60 border-purple-500/40 text-purple-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block">
              Mensagem Educativa da Batalha Final
            </span>
            <p className="text-base sm:text-lg font-display font-semibold text-white">
              {isDefeated
                ? '“Informação também é cuidado.” · “Prevenção faz parte da saúde.” · “Não deixe seus cuidados para depois.”'
                : PHASE10_EDUCATIONAL_MESSAGES[eduMsgIdx]}
            </p>
          </div>
        </div>
        <div className="text-xs font-mono tabular-nums text-amber-200 shrink-0">
          {isDefeated ? '4/4 Etapas Vencidas' : `Etapa Atual: ${stage} de 4`}
        </div>
      </div>

      {/* 4-Stage Progress Stepper */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { num: 1, title: 'Etapa 1 — Informação', desc: 'Identificar cuidados corretos', icon: BookOpen },
          { num: 2, title: 'Etapa 2 — Prevenção', desc: 'Coletar itens preventivos', icon: Compass },
          { num: 3, title: 'Etapa 3 — Cuidado', desc: 'Proteger indicadores vitais', icon: HeartPulse },
          { num: 4, title: 'Etapa 4 — União', desc: 'Combinar os 4 enfermeiros', icon: Users },
        ].map((st) => {
          const IconComp = st.icon;
          const completed = stage > st.num;
          const active = stage === st.num;
          return (
            <button
              key={st.num}
              type="button"
              onClick={() => {
                if (!isDefeated) setStage(st.num as 1 | 2 | 3 | 4);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                completed
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : active
                  ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{st.title}</span>
                </span>
                {completed && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[11px] opacity-85 truncate">{st.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Victory Banner: Transition to Clínica Vittacare Finale */}
      {isDefeated && (
        <div className="mt-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-emerald-950/90 via-teal-900/80 to-amber-950/90 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Sun className="w-4 h-4" />
                <span>TODAS AS SOMBRAS DESAPARECERAM · CAMINHO ABERTO</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                A Sombra do Descuido foi Derrotada pela União dos 4 Enfermeiros!
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
                Com Informação, Prevenção, Cuidado e União, <strong>Stephanie, Marcelo, Bianca e Leticia</strong>{' '}
                dissiparam todos os obstáculos. Agora, siga com os quatro enfermeiros pelo último caminho iluminado até a{' '}
                <strong>Clínica Vittacare</strong>!
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenFinale}
              className="px-7 py-4 text-sm sm:text-base font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-transform duration-150 hover:scale-[1.02] flex items-center gap-2.5 whitespace-nowrap shadow-xl shrink-0"
            >
              <span>Entrar na Clínica Vittacare (Final Cinematográfico)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Split Arena */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Boss Portrait & Fragment Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`relative rounded-2xl overflow-hidden border transition-all duration-700 ${
              isDefeated
                ? 'border-amber-400/70 bg-emerald-950/40'
                : 'border-purple-500/40 bg-slate-900'
            }`}
          >
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              {!imgError ? (
                <img
                  src={IMAGES.bossDescuido}
                  alt="Sombra do Descuido - Guardião gigante em estilo anime formado por sombras e fragmentos"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover transition-all duration-1000 ${
                    isDefeated
                      ? 'brightness-125 saturate-150 opacity-35 scale-95'
                      : 'brightness-95 scale-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                  <Shield className="w-16 h-16 text-purple-400" />
                </div>
              )}

              {/* Floating Shadow Fragments Overlay */}
              {!isDefeated && (
                <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 pointer-events-none">
                  {[
                    { label: 'Falta de Informação', cleared: stage > 1 },
                    { label: 'Ausência de Prevenção', cleared: stage > 2 },
                    { label: 'Dificuldade de Acesso', cleared: stage > 3 },
                    { label: 'Negligência com a Saúde', cleared: stage > 4 },
                  ].map((frag, idx) => (
                    <span
                      key={idx}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-medium backdrop-blur-md border ${
                        frag.cleared
                          ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200 line-through'
                          : 'bg-slate-950/80 border-purple-400/40 text-purple-200'
                      }`}
                    >
                      {frag.cleared ? '✓ Purificado' : `◆ ${frag.label}`}
                    </span>
                  ))}
                </div>
              )}

              {isDefeated && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-amber-500/20 to-amber-300/30 flex flex-col items-center justify-center p-6 text-center">
                  <Sun className="w-14 h-14 text-amber-300 mb-2" />
                  <p className="text-xl font-display font-bold text-white">
                    Todas as Sombras Desapareceram!
                  </p>
                  <p className="text-xs text-emerald-100 mt-1">
                    Os 4 enfermeiros abriram o caminho iluminado até a Clínica Vittacare.
                  </p>
                </div>
              )}

              {/* Bottom Scrim & Health Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div>
                    <span className="text-xs text-purple-300 font-medium">
                      CHEFÃO FINAL DA FASE 10 · GUARDIÃO DE FRAGMENTOS
                    </span>
                    <h2 className="text-xl font-bold text-white">Sombra do Descuido</h2>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span className="text-xs text-slate-400 block">SOMBRA RESTANTE</span>
                    <span className="text-sm font-bold text-amber-300">{bossEnergyPercent}%</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${bossEnergyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* All 3 Required Educational Quotes Reference Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
            <div className="text-xs font-semibold text-amber-300">
              Pilares Educativos Contra a Sombra do Descuido
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-200">
              <p className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                1. <strong>“Informação também é cuidado.”</strong>
              </p>
              <p className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                2. <strong>“Prevenção faz parte da saúde.”</strong>
              </p>
              <p className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                3. <strong>“Não deixe seus cuidados para depois.”</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Stage Mechanics (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status Feedback Bar */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-relaxed">
              {statusFeedback}
            </p>
          </div>

          {/* ETAPA 1 — INFORMAÇÃO */}
          {stage === 1 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-amber-300 font-semibold">
                    ETAPA 1 DE 4 · LIDERADA POR BIANCA (LUZ DA INFORMAÇÃO)
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Etapa 1 — Informação: Identifique os Cuidados Corretos
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Clique nas 3 orientações verdadeiras sobre saúde da mulher para quebrar os fragmentos de desinformação.
                  </p>
                </div>
                <span className="text-sm font-mono tabular-nums text-emerald-300 font-bold shrink-0">
                  {verifiedIds.length}/3 Corretas
                </span>
              </div>

              <div className="space-y-3">
                {STAGE1_INFO_CARDS.map((card) => {
                  const isVerified = verifiedIds.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectInfoCard(card)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isVerified
                          ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100'
                          : 'bg-slate-950/90 border-slate-800 hover:border-amber-400/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-slate-400">
                          Alvo: {card.obstacleFragment}
                        </span>
                        {isVerified && (
                          <span className="text-xs font-semibold text-emerald-300">
                            ✓ Informação Validada
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{card.statement}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ETAPA 2 — PREVENÇÃO */}
          {stage === 2 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-amber-300 font-semibold">
                    ETAPA 2 DE 4 · LIDERADA POR LETICIA (ELO PREVENTIVO)
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Etapa 2 — Prevenção: Colete os Itens de Acompanhamento
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Clique em cada item preventivo no campo para reunir todos os cuidados essenciais da saúde da mulher.
                  </p>
                </div>
                <span className="text-sm font-mono tabular-nums text-emerald-300 font-bold shrink-0">
                  {preventionItems.filter((i) => i.collected).length}/6 Coletados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {preventionItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.collected}
                    onClick={() => handleCollectPreventionItem(item.id)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                      item.collected
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200 opacity-80'
                        : 'bg-slate-950 border-slate-800 hover:border-amber-400 text-white hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0" role="img" aria-label={item.name}>
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-400">{item.category}</div>
                        <div className="text-sm font-semibold truncate">{item.name}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold shrink-0 text-amber-300">
                      {item.collected ? '✓ Coletado' : 'Coletar'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ETAPA 3 — CUIDADO */}
          {stage === 3 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div>
                <span className="text-xs text-amber-300 font-semibold">
                  ETAPA 3 DE 4 · TRABALHO EM EQUIPE DOS 4 ENFERMEIROS
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Etapa 3 — Cuidado: Proteja os Indicadores de Saúde
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecione cada enfermeiro abaixo e clique no Indicador de Saúde correspondente para bloquear os
                  fragmentos da Sombra do Descuido e abrir o caminho!
                </p>
              </div>

              {/* Nurse Selector Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {NURSES.map((nurse) => {
                  const isSelected = selectedNurseForCare === nurse.id;
                  return (
                    <button
                      key={nurse.id}
                      type="button"
                      onClick={() => setSelectedNurseForCare(nurse.id)}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{nurse.name}</div>
                      <div className="text-[11px] text-emerald-300 truncate">{nurse.skillName}</div>
                    </button>
                  );
                })}
              </div>

              {/* 4 Health Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {indicators.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    disabled={ind.protected}
                    onClick={() => handleProtectIndicator(ind)}
                    className={`p-4 rounded-xl border text-left space-y-2 transition-all ${
                      ind.protected
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100'
                        : 'bg-slate-950 border-slate-800 hover:border-amber-400 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300">
                        Obstáculo: {ind.threatFragment}
                      </span>
                      <span className="text-xs font-mono text-amber-300">
                        {ind.protected ? '✓ PROTEGIDO' : `Requer: ${ind.recommendedNurseName}`}
                      </span>
                    </div>
                    <div className="text-sm font-bold">{ind.label}</div>
                    <div className="text-xs text-slate-400">
                      {ind.protected
                        ? `Protegido com sucesso por ${ind.recommendedNurseName}!`
                        : `Clique com ${ind.recommendedNurseName} selecionado(a) para proteger este indicador.`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ETAPA 4 — UNIÃO */}
          {stage === 4 && (
            <div className="rounded-2xl bg-slate-900 border border-amber-400/50 p-5 space-y-4">
              <div>
                <span className="text-xs text-amber-300 font-semibold">
                  ETAPA FINAL 4 DE 4 · COMBINAÇÃO SUPREMA DOS 4 ENFERMEIROS
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Etapa 4 — União: Combine as Habilidades para Vencer a Sombra do Descuido
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ative a habilidade de cada um dos quatro enfermeiros (<strong>Stephanie, Marcelo, Bianca e Leticia</strong>) e dispare a União Vittacare!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NURSES.map((nurse) => {
                  const activated = activatedUnionNurses.includes(nurse.id);
                  return (
                    <button
                      key={nurse.id}
                      type="button"
                      disabled={activated}
                      onClick={() => handleActivateUnionNurse(nurse.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        activated
                          ? 'bg-amber-400/20 border-amber-400 text-white'
                          : 'bg-slate-950 border-slate-800 hover:border-emerald-400 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{nurse.name}</span>
                        <span className="text-xs font-semibold text-amber-300">
                          {activated ? '✨ Habilidade Pronta!' : 'Clique para Sincronizar'}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-300 font-medium">{nurse.skillName}</div>
                      <p className="text-[11px] text-slate-400 mt-1">{nurse.quote}</p>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={activatedUnionNurses.length < 4}
                onClick={handleUnleashFinalUnion}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activatedUnionNurses.length === 4
                    ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-slate-950 shadow-xl hover:brightness-105 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {activatedUnionNurses.length === 4
                    ? 'ATIVAR UNIÃO DOS 4 ENFERMEIROS E DERROTAR A SOMBRA DO DESCUIDO!'
                    : `Sincronize os 4 Enfermeiros (${activatedUnionNurses.length}/4)`}
                </span>
              </button>
            </div>
          )}

          {/* Stage 5 Summary Card */}
          {stage === 5 && (
            <div className="rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 space-y-3">
              <h3 className="text-lg font-bold text-white">
                Resumo das 4 Etapas Conquistadas contra a Sombra do Descuido
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300 block mb-0.5">✓ Etapa 1 — Informação</strong>
                  Mitos dissipados com informação segura e diálogo aberto.
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300 block mb-0.5">✓ Etapa 2 — Prevenção</strong>
                  Exames preventivos, vacinas e acompanhamento reunidos.
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300 block mb-0.5">✓ Etapa 3 — Cuidado</strong>
                  Indicadores de saúde protegidos pela ação coordenada da equipe.
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300 block mb-0.5">✓ Etapa 4 — União</strong>
                  Stephanie, Marcelo, Bianca e Leticia abriram o caminho para a Clínica Vittacare.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
