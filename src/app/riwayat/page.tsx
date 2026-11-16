"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HistoryCard, HistoryItem } from "@/components/HistoryCard";
import { Toast } from "@/components/Toast";
import { ArrowLeft, History, RefreshCw, CalendarOff } from "lucide-react";

export default function RiwayatPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
  };

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/reports/history");
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      showToast("Gagal memuat riwayat laporan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors touch-target flex items-center justify-center"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Riwayat Laporan Piket
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                ITBS AL- Kautsar - Monitoring piket
              </p>
            </div>
          </div>

          <button
            onClick={loadHistory}
            className="p-2 text-slate-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors touch-target flex items-center justify-center"
            title="Muat Ulang"
            aria-label="Muat Ulang"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-3 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-500 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Memuat riwayat...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <CalendarOff className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Belum ada riwayat laporan
            </p>
            <p className="text-xs text-slate-500">
              Laporan piket harian yang dibuka atau dicentang akan otomatis tercatat di sini.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <HistoryCard key={item.date} item={item} onNotify={showToast} />
          ))
        )}
      </main>

      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
