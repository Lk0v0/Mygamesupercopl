import React, { useEffect, useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        title="Instalar Zombie Shooter 2 como aplicativo"
        className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.2)] transition-all hover:bg-cyan-500/25 hover:text-white active:scale-95 cursor-pointer"
      >
        <Download className="h-4 w-4 text-cyan-400" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Instalar no iPhone / iPad"
          className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-cyan-300 transition-all hover:bg-cyan-500/25 hover:text-white active:scale-95 cursor-pointer"
        >
          <Smartphone className="h-4 w-4 text-cyan-400" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
            <div className="relative w-full max-w-sm rounded-2xl border border-cyan-500/35 bg-slate-950 p-6 shadow-2xl">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2.5 text-cyan-400">
                <Smartphone className="h-5 w-5" />
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Instalar no iPhone / iPad
                </h3>
              </div>
              <div className="mt-4 space-y-2.5 text-sm text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">1</span>
                  <span>
                    Toque no botão <strong className="inline-flex items-center gap-1 text-white">Compartilhar <Share className="inline h-3.5 w-3.5 text-cyan-400" /></strong> na barra do Safari.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">2</span>
                  <span>
                    Role para baixo e toque em <strong className="text-white">Adicionar à Tela de Início</strong>.
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-500 transition cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-600/95 px-3.5 py-2 text-xs font-bold text-white shadow-xl">
      <WifiOff className="h-3.5 w-3.5 animate-pulse" />
      <span>Modo Offline — Dados em cache ativos</span>
    </div>
  );
};
