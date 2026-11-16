"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, X, Share2, PlusSquare } from "lucide-react";

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
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    try {
      if (sessionStorage.getItem("pwa_install_dismissed") === "true") {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

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
        "Untuk memasang aplikasi: buka menu browser (titik tiga) lalu pilih 'Tambahkan ke Layar Utama' / 'Install App'."
      );
    }
  };

  return (
    <>
      <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium truncate">
            Pasang di Layar Utama HP untuk akses cepat
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-lg text-xs transition-colors touch-target min-h-0"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-md touch-target min-h-0 min-w-0"
            aria-label="Tutup saran instalasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Cara Pasang di iPhone (Safari)
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg touch-target min-h-0 min-w-0"
                aria-label="Tutup panduan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs text-slate-700 space-y-3 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tekan tombol <strong>Share</strong> (ikon kotak dengan panah atas <Share2 className="w-3.5 h-3.5 inline text-slate-700" />) di bilah bawah Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Pilih <strong>Tambahkan ke Layar Utama</strong> (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tekan <strong>Tambah</strong> di pojok kanan atas.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs touch-target"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
