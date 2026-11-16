"use client";

import React from "react";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface ReminderBannerProps {
  isSent: boolean;
  isCutoffExceeded: boolean;
  cutoffTime: string;
  sentAt: string | null;
  onMarkSent: () => void;
}

export function ReminderBanner({
  isSent,
  isCutoffExceeded,
  cutoffTime,
  sentAt,
  onMarkSent,
}: ReminderBannerProps) {
  if (isSent) {
    let sentTimeText = "";
    if (sentAt) {
      try {
        const d = new Date(sentAt);
        sentTimeText = ` pada ${d.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        })} WIB`;
      } catch {
        sentTimeText = "";
      }
    }

    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 text-emerald-900 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-semibold">Laporan hari ini sudah dikirim</span>
            <span className="text-emerald-700 text-xs block sm:inline sm:ml-1">
              ke grup WhatsApp{sentTimeText}.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Not sent yet: Check if cutoff exceeded
  if (isCutoffExceeded) {
    return (
      <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-4 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-pulse">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-rose-900 leading-snug">
              Perhatian: Laporan Belum Dikirim!
            </p>
            <p className="text-xs text-rose-800 mt-0.5">
              Batas waktu pengiriman ({cutoffTime} WIB) telah lewat. Segera salin laporan dan kirim ke grup Mentoring ITBS.
            </p>
          </div>
        </div>
        <button
          onClick={onMarkSent}
          className="self-start sm:self-auto px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 touch-target flex items-center justify-center transition-colors shadow-xs"
        >
          Sudah Dikirim
        </button>
      </div>
    );
  }

  // Before cutoff
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 sm:p-4 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-xs sm:text-sm text-blue-900 leading-snug">
            Pengingat Piket Harian
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            Laporan hari ini belum ditandai terkirim ke grup (batas jam {cutoffTime} WIB).
          </p>
        </div>
      </div>
      <button
        onClick={onMarkSent}
        className="self-start sm:self-auto px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-medium shrink-0 touch-target flex items-center justify-center transition-colors"
      >
        Sudah Dikirim
      </button>
    </div>
  );
}
