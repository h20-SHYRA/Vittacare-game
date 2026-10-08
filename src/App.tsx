import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  Users,
  Gamepad2,
} from 'lucide-react';
import {
  CAMPAIGN_PHASES,
  IMAGES,
  NURSES,
  CharacterId,
} from './data/gameData';
import { MarioPlatformerGame } from './components/MarioPlatformerGame';
import { VittacareFinale } from './components/VittacareFinale';
import { PixelNurseAvatar } from './components/PixelNurseAvatar';
import { soundFX } from './utils/sound';

type ActiveView = 'PLATFORMER' | 'MAP' | 'NURSES' | 'FINALE';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('PLATFORMER');
  const [currentPhaseNum, setCurrentPhaseNum] = useState<number>(1);
  const [selectedCharacterIdx, setSelectedCharacterIdx] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Progression & Rewards State
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [hasMedalGestacao, setHasMedalGestacao] = useState<boolean>(false);
  const [hasTrophyVittacare, setHasTrophyVittacare] = useState<boolean>(false);
  const [goldenSkinEquipped, setGoldenSkinEquipped] = useState<boolean>(false);

  // Image error fallback
  const [heroImgError, setHeroImgError] = useState<boolean>(false);

  const toggleSound = () => {
    const nextMuted = !soundMuted;
    soundFX.muted = nextMuted;
    setSoundMuted(nextMuted);
    if (!nextMuted) {
      soundFX.playCollect();
    }
  };

  const handlePhaseComplete = (phaseNum: number) => {
    setCompletedPhases((prev) => Array.from(new Set([...prev, phaseNum])));
    if (phaseNum === 5) {
      setHasMedalGestacao(true);
    }
    if (phaseNum === 10) {
      setHasTrophyVittacare(true);
      setGoldenSkinEquipped(true);
    }
  };

  const startPlatformerPhase = (phaseNum: number, charIdx?: number) => {
    soundFX.playCollect();
    if (charIdx !== undefined) {
      setSelectedCharacterIdx(charIdx);
    }
    setCurrentPhaseNum(phaseNum);
    setActiveView('PLATFORMER');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setActiveView('PLATFORMER')}
          className="text-lg sm:text-xl font-display font-bold tracking-tight text-white hover:text-emerald-300 transition-colors whitespace-nowrap"
        >
          Guardiões Vittacare
        </button>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => startPlatformerPhase(1)}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeView === 'PLATFORMER' && currentPhaseNum !== 5 && currentPhaseNum !== 10
                ? 'text-emerald-300 underline underline-offset-8'
                : ''
            }`}
          >
            Jogar Fases 1–10
          </button>
          <button
            type="button"
            onClick={() => startPlatformerPhase(5)}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeView === 'PLATFORMER' && currentPhaseNum === 5
                ? 'text-amber-300 underline underline-offset-8'
                : ''
            }`}
          >
            Fase 5: Sombra da Pressão
          </button>
          <button
            type="button"
            onClick={() => startPlatformerPhase(10)}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeView === 'PLATFORMER' && currentPhaseNum === 10
                ? 'text-amber-300 underline underline-offset-8'
                : ''
            }`}
          >
            Fase 10: Sombra do Descuido + Clínica
          </button>
          <button
            type="button"
            onClick={() => setActiveView('NURSES')}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeView === 'NURSES' ? 'text-emerald-300 underline underline-offset-8' : ''
            }`}
          >
            10 Personagens Pixel & Skins
          </button>
          <button
            type="button"
            onClick={() => setActiveView('FINALE')}
            className={`hover:text-white transition-colors whitespace-nowrap ${
              activeView === 'FINALE' ? 'text-emerald-300 underline underline-offset-8' : ''
            }`}
          >
            Clínica Vittacare
          </button>
        </nav>

        {/* Zone 3: 2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundMuted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'MAP' ? 'PLATFORMER' : 'MAP')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            {activeView === 'MAP' ? 'Voltar ao Jogo' : 'Ver Mapa do Mundo'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => startPlatformerPhase(1)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
            activeView === 'PLATFORMER' && currentPhaseNum !== 5 && currentPhaseNum !== 10
              ? 'bg-emerald-400 text-slate-950 font-bold'
              : 'text-slate-300 bg-slate-950/60'
          }`}
        >
          ▶ Fase 1
        </button>
        <button
          type="button"
          onClick={() => startPlatformerPhase(5)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
            activeView === 'PLATFORMER' && currentPhaseNum === 5
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-300 bg-slate-950/60'
          }`}
        >
          ⚔️ Fase 5: Pressão
        </button>
        <button
          type="button"
          onClick={() => startPlatformerPhase(10)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
            activeView === 'PLATFORMER' && currentPhaseNum === 10
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-300 bg-slate-950/60'
          }`}
        >
          🏥 Fase 10: Descuido + Clínica
        </button>
        <button
          type="button"
          onClick={() => setActiveView('NURSES')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
            activeView === 'NURSES' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-300 bg-slate-950/60'
          }`}
        >
          10 Personagens
        </button>
        <button
          type="button"
          onClick={() => setActiveView('FINALE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
            activeView === 'FINALE' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-300 bg-slate-950/60'
          }`}
        >
          Clínica Vittacare
        </button>
      </div>

      {/* Main Content Router */}
      <main className="flex-1">
        {activeView === 'PLATFORMER' && (
          <MarioPlatformerGame
            phaseNumber={currentPhaseNum}
            goldenSkinEquipped={goldenSkinEquipped}
            selectedCharacterIdx={selectedCharacterIdx}
            onSelectCharacterIdx={(idx) => setSelectedCharacterIdx(idx)}
            onPhaseComplete={handlePhaseComplete}
            onSelectPhase={(num) => setCurrentPhaseNum(num)}
            onOpenFinale={() => setActiveView('FINALE')}
            onToggleGoldenSkin={() => setGoldenSkinEquipped((prev) => !prev)}
          />
        )}

        {activeView === 'FINALE' && (
          <VittacareFinale
            goldenSkinEquipped={goldenSkinEquipped}
            onToggleGoldenSkin={() => setGoldenSkinEquipped((prev) => !prev)}
            onRestartJourney={() => startPlatformerPhase(1)}
            onOpenNursesGallery={() => setActiveView('NURSES')}
          />
        )}

        {activeView === 'NURSES' && (
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium mb-1">
                  <span>10 Personagens em Pixel Art</span>
                  <span aria-hidden="true">·</span>
                  <span>Enfermagem · Marketing Empresarial · Sócias Elegantes</span>
                  <span aria-hidden="true">·</span>
                  <span>Título: {hasTrophyVittacare ? 'Herói do Cuidado' : 'Guardião Vittacare'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Equipe Completa Vittacare em Pixel Art (10 Personagens Jogáveis)
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                  Escolha qualquer integrante da equipe para jogar na fase horizontal: a equipe de{' '}
                  <strong>Enfermagem</strong> (Stephanie, Marcelo, Bianca e Leticia), o time de{' '}
                  <strong>Marketing em traje empresarial</strong> (Ronald, Nina, Samara e Letícia Mkt) e as{' '}
                  <strong>Sócias da Clínica em traje elegante</strong> (Vivian e Bárbara).
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playCollect();
                    setGoldenSkinEquipped((prev) => !prev);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {goldenSkinEquipped
                      ? '✨ Skin Especial Dourada: ATIVA'
                      : '🎁 Equipar Skin Especial Dourada'}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {NURSES.map((nurse, idx) => {
                const isSelected = selectedCharacterIdx === idx;
                const outfitLabel =
                  nurse.group === 'SOCIAS'
                    ? 'Traje Elegante de Alta Costura Vittacare'
                    : nurse.group === 'MARKETING'
                    ? 'Traje Empresarial Executivo Vittacare'
                    : 'Uniforme Clínico Vittacare';

                return (
                  <div
                    key={nurse.id}
                    className={`rounded-2xl p-6 border transition-all flex flex-col sm:flex-row items-center gap-6 ${
                      goldenSkinEquipped
                        ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-emerald-950/40 border-amber-400/60'
                        : isSelected
                        ? 'bg-slate-900 border-emerald-400'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* High-Detail Pixel Art Preview Box */}
                    <div className="w-28 h-32 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      <PixelNurseAvatar
                        nurseId={nurse.id as CharacterId}
                        goldenSkin={goldenSkinEquipped}
                        scale={4}
                        animate={true}
                      />
                    </div>

                    <div className="flex-1 space-y-2.5 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-emerald-300 font-medium">
                            {nurse.groupLabel} · {nurse.role}
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {nurse.name}{' '}
                            <span className="text-xs font-normal text-slate-400">
                              · {nurse.specialty}
                            </span>
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => startPlatformerPhase(currentPhaseNum, idx)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap"
                        >
                          Jogar com {nurse.name}
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        <strong className="text-amber-300">{nurse.skillName}:</strong> {nurse.skillDescription}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <span className="text-amber-300 font-medium">
                          {goldenSkinEquipped ? `🎁 Skin: ${nurse.goldenSkinName}` : outfitLabel}
                        </span>
                        <span className="text-slate-400 italic">{nurse.quote}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Awards Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
                <div className="text-3xl">🏅</div>
                <div>
                  <div className="text-xs text-slate-400">
                    Fase 5 · {hasMedalGestacao ? 'Conquistada' : 'Vença a Sombra da Pressão'}
                  </div>
                  <div className="text-base font-bold text-white">Medalha Cuidado na Gestação</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
                <div className="text-3xl">🏆</div>
                <div>
                  <div className="text-xs text-slate-400">
                    Fase 10 · {hasTrophyVittacare ? 'Conquistado' : 'Chegue à Clínica Vittacare'}
                  </div>
                  <div className="text-base font-bold text-white">Troféu Guardião Vittacare</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
                <div className="text-3xl">🎖️</div>
                <div>
                  <div className="text-xs text-slate-400">
                    Final · {hasTrophyVittacare ? 'Desbloqueado' : 'Complete o Nível 10'}
                  </div>
                  <div className="text-base font-bold text-white">Título: Herói do Cuidado</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeView === 'MAP' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-12">
            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-medium">
                  <span>Jogo Horizontal em Pixel Art (Estilo Mario)</span>
                  <span aria-hidden="true">·</span>
                  <span>10 Personagens Jogáveis</span>
                  <span aria-hidden="true">·</span>
                  <span>Joystick & Tela Cheia Horizontal</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-[1.12]">
                  Aventura Horizontal em Pixel Art rumo à Clínica Vittacare
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Jogue com <strong>1 personagem por vez</strong> entre os <strong>10 integrantes da Clínica Vittacare</strong>:
                  os enfermeiros <strong>Stephanie, Marcelo, Bianca e Leticia</strong>, a equipe de marketing{' '}
                  <strong>Ronald, Nina, Samara e Letícia</strong> e as sócias <strong>Vivian e Bárbara</strong>. Supere
                  os vilões e chefões em pixel art até a chegada à <strong>Clínica Vittacare</strong> no Nível 10!
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => startPlatformerPhase(1)}
                    className="px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Começar do Nível 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startPlatformerPhase(5)}
                    className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-400/50 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Fase 5: Sombra da Pressão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startPlatformerPhase(10)}
                    className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/50 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Fase 10: Sombra do Descuido + Clínica</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                  <div className="relative h-72 sm:h-88 w-full">
                    {!heroImgError ? (
                      <img
                        src={IMAGES.nursesTeam}
                        alt="Equipe Guardiões Vittacare"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center">
                        <Users className="w-16 h-16 text-emerald-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-emerald-300">
                          10 PERSONAGENS JOGÁVEIS EM PIXEL ART
                        </div>
                        <div className="text-lg font-bold text-white">
                          Enfermagem · Marketing · Sócias Vittacare
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveView('NURSES')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors whitespace-nowrap self-start sm:self-auto"
                      >
                        Escolher Personagem (10)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* All 10 Progressive Horizontal Phases Grid */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Todas as 10 Fases Horizontais (Dificuldade Progressiva Nível 1 ao 10)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {CAMPAIGN_PHASES.map((phase) => {
                  const isBoss = phase.type !== 'CARE_STAGE';
                  const isDone = completedPhases.includes(phase.phaseNumber);
                  return (
                    <button
                      key={phase.phaseNumber}
                      type="button"
                      onClick={() => startPlatformerPhase(phase.phaseNumber)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        isBoss
                          ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-amber-950/50 border-amber-400/60 hover:border-amber-300'
                          : isDone
                          ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className={isBoss ? 'text-amber-300 font-bold' : 'text-slate-400 font-mono'}>
                            Fase {String(phase.phaseNumber).padStart(2, '0')} · Dif. {phase.phaseNumber}/10
                          </span>
                          {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">{phase.title}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{phase.subtitle}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold">
                        <span className={isBoss ? 'text-amber-300' : 'text-emerald-300'}>
                          {phase.phaseNumber === 10
                            ? '🏥 Chefão + Clínica'
                            : isBoss
                            ? '⚔️ Jogar Chefão'
                            : '▶ Jogar Fase'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 sm:px-8 mt-8 text-xs text-slate-400">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Guardiões Vittacare · Enfermagem, Marketing & Sócias Vittacare · “Cuidar também é prevenir.”
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => startPlatformerPhase(5)}
              className="hover:text-white transition-colors"
            >
              Fase 5: Sombra da Pressão
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => startPlatformerPhase(10)}
              className="hover:text-white transition-colors"
            >
              Fase 10: Sombra do Descuido + Clínica
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveView('FINALE')}
              className="hover:text-white transition-colors"
            >
              Clínica Vittacare
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
