import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, WifiOff } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed standalone PWA on mobile/desktop, hide install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer shrink-0"
        title="Instalar Guardiões Vittacare como App no Celular (PWA)"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Instalar App (PWA)</span>
        <span className="sm:hidden">Baixar App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border-2 border-emerald-400/60 p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Smartphone className="w-5 h-5 text-amber-300" />
                <span>Instalar no Celular (Modo App PWA)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
                <p className="font-bold text-amber-300">Como instalar no iPhone / iPad (Safari):</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li className="flex items-center gap-1.5 flex-wrap">
                    <span>1. Toque no botão</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-semibold">
                      <Share className="w-3.5 h-3.5" /> Compartilhar
                    </span>
                    <span>na barra do Safari.</span>
                  </li>
                  <li className="flex items-center gap-1.5 flex-wrap">
                    <span>2. Role para baixo e toque em</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-semibold">
                      <PlusSquare className="w-3.5 h-3.5" /> Adicionar à Tela de Início
                    </span>
                  </li>
                  <li>3. Confirme em <strong>Adicionar</strong> para abrir em tela cheia sem barra de navegador!</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
                <p className="font-bold text-amber-300">Como instalar no Android / Chrome (Vercel):</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Abra o link oficial do jogo na <strong>Vercel</strong> pelo navegador do celular (Chrome / Edge / Samsung Internet).</li>
                  <li>Toque no menu do navegador <strong>(⋮)</strong> no canto superior e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  <li>No iPhone (Safari), toque em <strong>Compartilhar</strong> &rarr; <strong>Adicionar à Tela de Início</strong>.</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Entendi, voltar ao jogo
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-lg">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo Offline Ativo — Jogo salvo no cache do aparelho</span>
    </div>
  );
};
