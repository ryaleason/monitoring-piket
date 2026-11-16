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
    // Check if running as standalone PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed in this session
    try {
      if (sessionStorage.getItem("pwa_install_dismissed") === "true") {
        setIsDismissed(true);
      }
    } catch {
      // ignore
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

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("pwa_install_dismissed", "true");
    } catch {
      // ignore
    }
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsDismissed(true);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      alert(
        "Untuk memasang aplikasi: buka menu browser (titik tiga di kanan atas) lalu pilih 'Tambahkan ke Layar Utama' / 'Install App'."
      );
    }
  };

  return (
    <>
      <div className="bg-blue-50/90 border border-blue-200/90 text-blue-950 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs sm:text-sm font-bold text-blue-950 truncate">
              Pasang Aplikasi di HP
            </p>
            <p className="text-[11px] text-blue-700 truncate">
              Akses cepat tanpa repot buka browser
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors touch-target shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-blue-500 hover:text-blue-800 rounded-lg touch-target flex items-center justify-center"
            aria-label="Tutup saran instalasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Cara Pasang di iPhone (Safari)
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg touch-target flex items-center justify-center"
                aria-label="Tutup panduan"
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
                  Tekan tombol <strong>Share</strong> (ikon kotak dengan panah atas <Share2 className="w-3.5 h-3.5 inline text-blue-600" />) di bilah bawah Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Pilih <strong>Tambahkan ke Layar Utama</strong> (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tekan <strong>Tambah</strong> di pojok kanan atas. Ikon aplikasi siap digunakan langsung di layar utama HP.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs touch-target"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
