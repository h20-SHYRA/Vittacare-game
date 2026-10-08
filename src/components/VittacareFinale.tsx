import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  DoorOpen,
  Sun,
  Heart,
  CheckCircle2,
  RotateCcw,
  Users,
} from 'lucide-react';
import { IMAGES, NURSES } from '../data/gameData';
import { soundFX } from '../utils/sound';

interface VittacareFinaleProps {
  goldenSkinEquipped: boolean;
  onToggleGoldenSkin: () => void;
  onRestartJourney: () => void;
  onOpenNursesGallery: () => void;
}

export const VittacareFinale: React.FC<VittacareFinaleProps> = ({
  goldenSkinEquipped,
  onToggleGoldenSkin,
  onRestartJourney,
  onOpenNursesGallery,
}) => {
  // Cinematic steps: 0 = Walking on sunlit path, 1 = Clinic doors opening, 2 = Full celebration & rewards
  const [cinematicStep, setCinematicStep] = useState<0 | 1 | 2>(0);
  const [clinicImgError, setClinicImgError] = useState<boolean>(false);
  const [teamImgError, setTeamImgError] = useState<boolean>(false);

  useEffect(() => {
    soundFX.playVictoryFanfare();
    const t1 = setTimeout(() => setCinematicStep(1), 1600);
    const t2 = setTimeout(() => setCinematicStep(2), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Cinematic Hero Banner: Arrival at Clínica Vittacare */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/70 bg-slate-900 shadow-2xl">
        <div className="relative h-80 sm:h-[420px] w-full overflow-hidden">
          {!clinicImgError ? (
            <img
              src={IMAGES.clinicaFinale}
              alt="Clínica Vittacare com portas abertas e caminho iluminado pelo sol"
              referrerPolicy="no-referrer"
              onError={() => setClinicImgError(true)}
              className={`w-full h-full object-cover transition-transform duration-1000 ${
                cinematicStep >= 1 ? 'scale-105 brightness-105' : 'scale-100 brightness-95'
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-amber-900 flex items-center justify-center">
              <Sun className="w-20 h-20 text-amber-300" />
            </div>
          )}

          {/* Measured Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Cinematic Progression Indicator Top */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-950/85 border border-amber-400/50 text-xs font-medium text-amber-200 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-amber-400" />
              <span>
                {cinematicStep === 0 && 'As sombras desapareceram... Stephanie, Marcelo, Bianca e Leticia seguem pelo caminho iluminado.'}
                {cinematicStep === 1 && 'As portas da Clínica Vittacare se abrem em boas-vindas luminosas!'}
                {cinematicStep === 2 && 'Chegada à Clínica Vittacare · Cuidado, Prevenção e Bem-Estar Conquistados!'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCinematicStep(s as 0 | 1 | 2)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    cinematicStep === s
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Cena {s + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Center-Bottom Final Headline Messages */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-300 tracking-wide mb-2">
              <Sun className="w-4 h-4" />
              <span>CLÍNICA VITTACARE · TODAS AS SOMBRAS DISSIPADAS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight drop-shadow-md">
              “JORNADA CONCLUÍDA!”
            </h1>

            <p className="text-xl sm:text-2xl font-display font-semibold text-emerald-300 mt-2">
              “Cuidar também é prevenir.”
            </p>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-3 leading-relaxed">
              Após derrotar a <strong>Sombra da Pressão</strong> e a <strong>Sombra do Descuido</strong>, os quatro
              enfermeiros — <strong>Stephanie, Marcelo, Bianca e Leticia</strong> — atravessam juntos as portas abertas
              da <strong>Clínica Vittacare</strong>, celebrando a saúde, a informação e a autonomia feminina.
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Unlocked Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 4 Rewards Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Recompensas da Jornada Conquistadas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Cada vitória simboliza uma conquista para o bem-estar, a prevenção e a autonomia pessoal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Troféu Guardião Vittacare */}
            <div className="rounded-2xl bg-slate-900 border border-amber-400/50 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl" role="img" aria-label="Troféu">
                  🏆
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-xs text-amber-300 font-medium">Recompensa Suprema · Fase 10</div>
              <h3 className="text-lg font-bold text-white">Troféu Guardião Vittacare</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Concedido por superar todos os fragmentos da Sombra do Descuido e conduzir a equipe até a Clínica Vittacare.
              </p>
            </div>

            {/* Título: Herói do Cuidado */}
            <div className="rounded-2xl bg-slate-900 border border-emerald-400/50 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl" role="img" aria-label="Título">
                  🎖️
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-xs text-emerald-300 font-medium">Título de Honra Desbloqueado</div>
              <h3 className="text-lg font-bold text-white">Título: Herói do Cuidado</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reconhecimento pela dedicação à informação confiável, ao acompanhamento pré-natal e à prevenção contínua.
              </p>
            </div>

            {/* Medalha Cuidado na Gestação */}
            <div className="rounded-2xl bg-slate-900 border border-indigo-400/40 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl" role="img" aria-label="Medalha">
                  🏅
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-xs text-indigo-300 font-medium">Recompensa da Fase 5</div>
              <h3 className="text-lg font-bold text-white">Medalha Cuidado na Gestação</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conquistada ao vencer a Sombra da Pressão e iluminar o acompanhamento da pressão arterial no pré-natal.
              </p>
            </div>

            {/* Skin Especial dos Quatro Enfermeiros */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-emerald-950/60 border border-amber-400 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl" role="img" aria-label="Presente Skin">
                  🎁
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {goldenSkinEquipped ? 'EQUIPADA' : 'DISPONÍVEL'}
                </span>
              </div>
              <div className="text-xs text-amber-300 font-medium">Visual Exclusivo Desbloqueado</div>
              <h3 className="text-lg font-bold text-white">Skin Especial dos Quatro Enfermeiros</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trajes cerimoniais Guardião Vittacare para Stephanie, Marcelo, Bianca e Leticia!
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFX.playCollect();
                  onToggleGoldenSkin();
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors whitespace-nowrap"
              >
                {goldenSkinEquipped ? '✨ Skin Especial Equipada (Alternar)' : 'Equipar Skin Especial Agora'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: The 4 Nurses Arriving Together Showcase (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div className="relative h-56 w-full overflow-hidden">
            {!teamImgError ? (
              <img
                src={IMAGES.nursesTeam}
                alt="Os quatro enfermeiros Stephanie, Marcelo, Bianca e Leticia"
                referrerPolicy="no-referrer"
                onError={() => setTeamImgError(true)}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  goldenSkinEquipped ? 'saturate-150 brightness-110' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <Users className="w-12 h-12 text-emerald-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300">
                Equipe Reunida na Clínica Vittacare
              </span>
              <span className="text-xs font-mono text-emerald-300">
                {goldenSkinEquipped ? '✨ Traje Especial Ativo' : 'Uniforme Padrão'}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {NURSES.map((nurse) => (
                <div
                  key={nurse.id}
                  className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      {nurse.name} ·{' '}
                      <span className="text-amber-300 font-medium">
                        {goldenSkinEquipped ? nurse.goldenSkinName : nurse.specialty}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {nurse.groupLabel} · {nurse.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onOpenNursesGallery}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors whitespace-nowrap"
              >
                Ver Galeria dos 4 Enfermeiros
              </button>
              <button
                type="button"
                onClick={onRestartJourney}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Jogar Novamente</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
