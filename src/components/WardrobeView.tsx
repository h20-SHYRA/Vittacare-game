import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Gamepad2,
  Shirt,
  Users,
  Crown,
} from 'lucide-react';
import {
  CharacterId,
  NURSES,
  SkinId,
  WARDROBE_SKINS,
} from '../data/gameData';
import { PixelNurseAvatar } from './PixelNurseAvatar';
import { soundFX } from '../utils/sound';

interface WardrobeViewProps {
  selectedCharacterIdx: number;
  characterSkins: Record<CharacterId, SkinId>;
  onSelectCharacterIdx: (idx: number) => void;
  onEquipSkinForCharacter: (charId: CharacterId, skinId: SkinId) => void;
  onEquipSkinForAll: (skinId: SkinId) => void;
  onStartGameWithCharacter: (charIdx: number) => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  selectedCharacterIdx,
  characterSkins,
  onSelectCharacterIdx,
  onEquipSkinForCharacter,
  onEquipSkinForAll,
  onStartGameWithCharacter,
}) => {
  const activeNurse = NURSES[selectedCharacterIdx] || NURSES[0];
  const equippedSkinId: SkinId = characterSkins[activeNurse.id] || 'padrao';
  const equippedSkinMeta =
    WARDROBE_SKINS.find((s) => s.id === equippedSkinId) || WARDROBE_SKINS[0];

  const [toastMessage, setToastMessage] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Shirt className="w-4 h-4 text-emerald-400" />
            <span>GUARDA-ROUPA OFICIAL VITTACARE · 8 COLEÇÕES DE SKINS EM PIXEL ART</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Guarda-Roupa &amp; Skins dos Personagens
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Personalize o traje de cada integrante da Enfermagem, Marketing (Mkt) e Sócias da Clínica Vittacare. Todas as skins aparecem em tempo real durante as 17 fases!
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playCollect();
            onStartGameWithCharacter(selectedCharacterIdx);
          }}
          className="px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Jogar com {activeNurse.name}</span>
        </button>
      </div>

      {toastMessage && (
        <div className="rounded-xl bg-emerald-950/90 border border-emerald-400/60 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-200 flex items-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Character Selector Strip (All 10 Characters) */}
      <div className="rounded-2xl bg-slate-900/95 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            1. Escolha o Personagem para Vestir:
          </span>
          <span className="text-xs text-amber-300 font-medium">
            Selecionado: {activeNurse.name} ({activeNurse.groupLabel})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {NURSES.map((nurse, idx) => {
            const isSelected = idx === selectedCharacterIdx;
            const charSkin = characterSkins[nurse.id] || 'padrao';
            const skinObj =
              WARDROBE_SKINS.find((s) => s.id === charSkin) || WARDROBE_SKINS[0];

            return (
              <button
                key={nurse.id}
                type="button"
                onClick={() => {
                  soundFX.playCollect();
                  onSelectCharacterIdx(idx);
                }}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/95 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <PixelNurseAvatar
                  nurseId={nurse.id}
                  skinId={charSkin}
                  scale={2.4}
                />
                <div className="w-full">
                  <div className="text-xs font-bold text-white truncate">
                    {nurse.name}
                  </div>
                  <div className="text-[10px] text-amber-300 truncate">
                    {skinObj.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Spotlight Character Stage + 8 Skin Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Character Spotlight Stage (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/40 border-2 border-amber-400/60 p-6 flex flex-col items-center text-center space-y-4 shadow-2xl">
          <div className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            <span>PROVADOR EM PIXEL ART</span>
          </div>

          <div className="w-44 h-48 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
            <div className="absolute inset-x-6 bottom-4 h-4 rounded-full bg-emerald-500/25 blur-sm" />
            <PixelNurseAvatar
              nurseId={activeNurse.id}
              skinId={equippedSkinId}
              scale={5}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-emerald-400">
              {activeNurse.groupLabel}
            </span>
            <h2 className="text-2xl font-display font-bold text-white">
              {activeNurse.name}
            </h2>
            <p className="text-xs text-slate-300">{activeNurse.role}</p>
          </div>

          <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 text-left space-y-1.5">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span>Skin Equipada:</span>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 text-[10px]">
                {equippedSkinMeta.badge}
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              {equippedSkinMeta.name}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {equippedSkinMeta.description}
            </p>
          </div>

          <div className="w-full rounded-xl bg-slate-900/90 border border-emerald-500/30 p-3.5 text-left space-y-1">
            <div className="text-xs font-bold text-emerald-300">
              ⚡ Poder Único: {activeNurse.skillName}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeNurse.skillDescription}
            </p>
          </div>
        </div>

        {/* Right: 8 Wardrobe Skins Collection Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              2. Escolha uma Skin para {activeNurse.name} (8 Opções Desbloqueadas):
            </h2>
            <span className="text-xs text-slate-400">
              Clique para equipar individualmente ou em toda a equipe
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WARDROBE_SKINS.map((skin) => {
              const isEquipped = equippedSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between gap-4 ${
                    isEquipped
                      ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/30 shadow-xl'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
                      <PixelNurseAvatar
                        nurseId={activeNurse.id}
                        skinId={skin.id}
                        scale={3.2}
                      />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          style={{ color: skin.accentHex }}
                          className="text-[10px] font-mono uppercase font-bold tracking-wider"
                        >
                          {skin.badge}
                        </span>
                        {isEquipped && (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Em Uso
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {skin.name}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {skin.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playCollect();
                        onEquipSkinForCharacter(activeNurse.id, skin.id);
                        triggerToast(
                          `Skin "${skin.name}" equipada em ${activeNurse.name}!`
                        );
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-emerald-400 hover:text-slate-950 text-white'
                      }`}
                    >
                      {isEquipped
                        ? `✓ Equipada em ${activeNurse.name}`
                        : `Vestir em ${activeNurse.name}`}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playVictoryFanfare();
                        onEquipSkinForAll(skin.id);
                        triggerToast(
                          `Skin "${skin.name}" equipada em todos os 10 personagens!`
                        );
                      }}
                      title="Equipar esta skin nos 10 personagens de uma só vez"
                      className="py-2 px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/50 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Todos</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
