"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, Share2, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chromium)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback guide
      alert(
        "Untuk memasang aplikasi: buka menu browser (titik tiga di kanan atas) lalu pilih 'Tambahkan ke Layar Utama' / 'Install App'."
      );
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-2xl p-3 sm:p-3.5 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight truncate">
            <p className="text-xs sm:text-sm font-bold truncate">
              Pasang Aplikasi di HP
            </p>
            <p className="text-[11px] text-blue-100 truncate">
              Akses cepat langsung dari layar utama tanpa buka browser
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-2 bg-white text-blue-800 hover:bg-blue-50 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors touch-target shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-white/70 hover:text-white rounded-lg touch-target"
            aria-label="Tutup saran instalasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Cara Pasang di iPhone (Safari)
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs text-slate-700 space-y-3 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tekan tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah ke atas <Share2 className="w-3.5 h-3.5 inline text-blue-600" />) di bagian bawah layar Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong> (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tekan <strong>"Tambah"</strong> di pojok kanan atas. Ikon aplikasi akan langsung muncul di HP Anda!
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs touch-target"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
