import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  Users,
  Gamepad2,
  Lock,
  Map,
  Shirt,
} from 'lucide-react';
import {
  CAMPAIGN_PHASES,
  CharacterId,
  NURSES,
  SkinId,
  WARDROBE_SKINS,
} from './data/gameData';
import { MarioPlatformerGame } from './components/MarioPlatformerGame';
import { VittacareFinale } from './components/VittacareFinale';
import { WardrobeView } from './components/WardrobeView';
import { PixelNurseAvatar } from './components/PixelNurseAvatar';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { soundFX } from './utils/sound';

type ActiveView = 'PLATFORMER' | 'WARDROBE' | 'MAP' | 'NURSES' | 'FINALE';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('PLATFORMER');
  const [currentPhaseNum, setCurrentPhaseNum] = useState<number>(1);
  const [selectedCharacterIdx, setSelectedCharacterIdx] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Wardrobe Skins State for all 10 characters (Persisted in localStorage for Mobile PWA)
  const [characterSkins, setCharacterSkins] = useState<Record<CharacterId, SkinId>>(() => {
    try {
      const saved = localStorage.getItem('vittacare_skins_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return {
      stephanie: 'padrao',
      marcelo: 'padrao',
      bianca: 'padrao',
      leticia: 'padrao',
      ronald: 'padrao',
      nina: 'padrao',
      samara: 'padrao',
      leticia_mkt: 'padrao',
      vivian: 'padrao',
      barbara: 'padrao',
    };
  });

  // Progression & Rewards State (Strict Sequential Unlocking, Persisted in localStorage)
  const [completedPhases, setCompletedPhases] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('vittacare_completed_phases_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const [hasMedalGestacao, setHasMedalGestacao] = useState<boolean>(false);
  const [hasMedalDescuido, setHasMedalDescuido] = useState<boolean>(false);
  const [hasTrophyVittacare, setHasTrophyVittacare] = useState<boolean>(false);
  const [goldenSkinEquipped, setGoldenSkinEquipped] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('vittacare_skins_v1', JSON.stringify(characterSkins));
    } catch {
      // ignore storage errors
    }
  }, [characterSkins]);

  useEffect(() => {
    try {
      localStorage.setItem('vittacare_completed_phases_v1', JSON.stringify(completedPhases));
    } catch {
      // ignore storage errors
    }
  }, [completedPhases]);

  const maxUnlockedPhase = Math.min(
    17,
    Math.max(1, ...completedPhases.map((p) => p + 1))
  );

  const toggleSound = () => {
    const nextMuted = !soundMuted;
    soundFX.muted = nextMuted;
    setSoundMuted(nextMuted);
    if (nextMuted) {
      soundFX.stopLoFiMusic();
    } else {
      soundFX.playCollect();
      if (activeView === 'PLATFORMER') {
        soundFX.startLoFiMusic(currentPhaseNum);
      }
    }
  };

  const handleEquipSkinForCharacter = (charId: CharacterId, skinId: SkinId) => {
    setCharacterSkins((prev) => ({
      ...prev,
      [charId]: skinId,
    }));
  };

  const handleEquipSkinForAll = (skinId: SkinId) => {
    setCharacterSkins({
      stephanie: skinId,
      marcelo: skinId,
      bianca: skinId,
      leticia: skinId,
      ronald: skinId,
      nina: skinId,
      samara: skinId,
      leticia_mkt: skinId,
      vivian: skinId,
      barbara: skinId,
    });
    setGoldenSkinEquipped(skinId === 'dourada');
  };

  const handlePhaseComplete = (phaseNum: number) => {
    setCompletedPhases((prev) => Array.from(new Set([...prev, phaseNum])));
    if (phaseNum === 5) {
      setHasMedalGestacao(true);
    }
    if (phaseNum === 10) {
      setHasMedalDescuido(true);
    }
    if (phaseNum === 17) {
      setHasTrophyVittacare(true);
      handleEquipSkinForAll('dourada');
    }
  };

  const startPlatformerPhase = (phaseNum: number, charIdx?: number) => {
    if (phaseNum > maxUnlockedPhase) {
      return;
    }
    soundFX.playCollect();
    if (charIdx !== undefined) {
      setSelectedCharacterIdx(charIdx);
    }
    setCurrentPhaseNum(phaseNum);
    setActiveView('PLATFORMER');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setActiveView('PLATFORMER')}
          className="text-lg sm:text-xl font-display font-bold tracking-tight text-white hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          Guardiões Vittacare
        </button>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setActiveView('PLATFORMER')}
            className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'PLATFORMER'
                ? 'text-emerald-300 underline underline-offset-8'
                : ''
            }`}
          >
            Jogar (Fase {currentPhaseNum}/17)
          </button>

          <button
            type="button"
            onClick={() => setActiveView('WARDROBE')}
            className={`hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeView === 'WARDROBE'
                ? 'text-amber-300 font-bold underline underline-offset-8'
                : 'text-amber-200'
            }`}
          >
            <Shirt className="w-4 h-4 text-amber-400" />
            <span>Guarda-Roupa (Skins)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('NURSES')}
            className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'NURSES' ? 'text-emerald-300 underline underline-offset-8' : ''
            }`}
          >
            10 Personagens &amp; Poderes
          </button>

          <button
            type="button"
            onClick={() => setActiveView('MAP')}
            className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              activeView === 'MAP' ? 'text-emerald-300 underline underline-offset-8' : ''
            }`}
          >
            Mapa das 17 Fases ({completedPhases.length}/17)
          </button>

          <button
            type="button"
            disabled={maxUnlockedPhase < 17}
            onClick={() => startPlatformerPhase(17)}
            className={`transition-colors whitespace-nowrap flex items-center gap-1 ${
              maxUnlockedPhase < 17
                ? 'text-slate-600 cursor-not-allowed'
                : activeView === 'PLATFORMER' && currentPhaseNum === 17
                ? 'text-amber-300 underline underline-offset-8 cursor-pointer'
                : 'hover:text-white cursor-pointer'
            }`}
          >
            {maxUnlockedPhase < 17 && <Lock className="w-3.5 h-3.5" />}
            <span>Fase 17: Chefão Final &amp; Chegada</span>
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <PWAInstallButton />

          <button
            type="button"
            onClick={() => setActiveView('WARDROBE')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeView === 'WARDROBE'
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-amber-400/15 hover:bg-amber-400/25 border-amber-400/50 text-amber-300'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Guarda-Roupa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('NURSES')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Personagens</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('MAP')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fases</span>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title={soundMuted ? 'Ativar Som' : 'Silenciar Som'}
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <OfflineIndicator />
      <main className="flex-1">
        {activeView === 'PLATFORMER' && (
          <MarioPlatformerGame
            phaseNumber={currentPhaseNum}
            maxUnlockedPhase={maxUnlockedPhase}
            completedPhases={completedPhases}
            goldenSkinEquipped={goldenSkinEquipped}
            characterSkins={characterSkins}
            selectedCharacterIdx={selectedCharacterIdx}
            onSelectCharacterIdx={setSelectedCharacterIdx}
            onPhaseComplete={handlePhaseComplete}
            onSelectPhase={(num) => {
              if (num <= maxUnlockedPhase) {
                setCurrentPhaseNum(num);
              }
            }}
            onOpenFinale={() => setActiveView('FINALE')}
            onOpenWardrobe={() => setActiveView('WARDROBE')}
            onToggleGoldenSkin={() => {
              const next = !goldenSkinEquipped;
              setGoldenSkinEquipped(next);
              handleEquipSkinForAll(next ? 'dourada' : 'padrao');
            }}
          />
        )}

        {activeView === 'WARDROBE' && (
          <WardrobeView
            selectedCharacterIdx={selectedCharacterIdx}
            characterSkins={characterSkins}
            onSelectCharacterIdx={setSelectedCharacterIdx}
            onEquipSkinForCharacter={handleEquipSkinForCharacter}
            onEquipSkinForAll={handleEquipSkinForAll}
            onStartGameWithCharacter={(charIdx) => {
              setSelectedCharacterIdx(charIdx);
              setActiveView('PLATFORMER');
            }}
          />
        )}

        {activeView === 'NURSES' && (
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  ELENCO COMPLETO EM PIXEL ART · PODERES EXCLUSIVOS
                </div>
                <h1 className="text-2xl sm:text-4xl font-display font-bold text-white mt-1">
                  4 Enfermeiros Protagonistas, 4 Marketing (Mkt) e 2 Sócias Vittacare
                </h1>
                <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                  Cada personagem possui um poder único e pode ser personalizado no Guarda-Roupa com 8 coleções de skins.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView('WARDROBE')}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Shirt className="w-4 h-4" />
                  <span>Abrir Guarda-Roupa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('PLATFORMER')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Voltar ao Jogo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {NURSES.map((nurse, idx) => {
                const isSelected = idx === selectedCharacterIdx;
                const isCoreFour = nurse.group === 'ENFERMAGEM';
                const equippedSkin = characterSkins[nurse.id] || 'padrao';
                const skinLabel =
                  WARDROBE_SKINS.find((s) => s.id === equippedSkin)?.name ||
                  'Clássico Vittacare';

                return (
                  <div
                    key={nurse.id}
                    className={`rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/30 shadow-xl'
                        : isCoreFour
                        ? 'bg-slate-900/90 border-emerald-500/40'
                        : 'bg-slate-900/75 border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3.5">
                        <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                          <PixelNurseAvatar
                            nurseId={nurse.id}
                            skinId={equippedSkin}
                            size={68}
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                            {nurse.groupLabel}
                          </span>
                          <h2 className="text-xl font-bold text-white mt-1">{nurse.name}</h2>
                          <p className="text-xs text-amber-300 font-medium">
                            {nurse.role} · {nurse.specialty}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            👔 Skin ativa: <strong className="text-amber-200">{skinLabel}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Poder Exclusivo: {nurse.skillName}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {nurse.skillDescription}
                        </p>
                      </div>

                      <p className="text-xs italic text-slate-400">{nurse.quote}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startPlatformerPhase(currentPhaseNum, idx)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Jogar com {nurse.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCharacterIdx(idx);
                          setActiveView('WARDROBE');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Shirt className="w-3.5 h-3.5" />
                        <span>Skins</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'MAP' && (
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-amber-300">
                  PROGRESSÃO BLOQUEADA POR FASE · 6 BIOMAS &amp; 3 CHEFÕES
                </div>
                <h1 className="text-2xl sm:text-4xl font-display font-bold text-white mt-1">
                  Mapa da Jornada até a Clínica Vittacare (17 Fases)
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Cada fase à frente só é desbloqueada após vencer a fase anterior. A Fase 17 traz o 3º Chefão Final e a Grande Linha de Chegada da Clínica Vittacare!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                  Desbloqueadas: {maxUnlockedPhase}/17
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CAMPAIGN_PHASES.map((phase) => {
                const isUnlocked = phase.phaseNumber <= maxUnlockedPhase;
                const isCompleted = completedPhases.includes(phase.phaseNumber);
                const isBoss = phase.type !== 'CARE_STAGE';

                return (
                  <div
                    key={phase.phaseNumber}
                    className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 transition-all ${
                      !isUnlocked
                        ? 'bg-slate-950/70 border-slate-800/70 opacity-65'
                        : isBoss
                        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-400/60'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-800 text-amber-300">
                          FASE {phase.phaseNumber} · {phase.biomeName}
                        </span>
                        {!isUnlocked ? (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Bloqueada
                          </span>
                        ) : isCompleted ? (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Concluída
                          </span>
                        ) : (
                          <span className="text-xs text-amber-300 font-semibold">
                            Disponível
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white">{phase.title}</h3>
                      <p className="text-xs text-emerald-300 font-medium">{phase.subtitle}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {phase.educationalTip}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => startPlatformerPhase(phase.phaseNumber)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 ${
                        isUnlocked
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {!isUnlocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Conclua a Fase {phase.phaseNumber - 1} para abrir</span>
                        </>
                      ) : (
                        <>
                          <span>Jogar Fase {phase.phaseNumber}</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'FINALE' && (
          <VittacareFinale
            goldenSkinEquipped={goldenSkinEquipped}
            onToggleGoldenSkin={() => {
              const next = !goldenSkinEquipped;
              setGoldenSkinEquipped(next);
              handleEquipSkinForAll(next ? 'dourada' : 'padrao');
            }}
            onRestartJourney={() => startPlatformerPhase(1)}
            onOpenNursesGallery={() => setActiveView('WARDROBE')}
          />
        )}
      </main>
    </div>
  );
}
