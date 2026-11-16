"use client";

import React, { useState } from "react";
import { Copy, Check, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

export interface HistoryItem {
  date: string;
  isSent: boolean;
  sentAt: string | null;
  totalTasks: number;
  completedTasks: number;
  formattedReport: string;
}

interface HistoryCardProps {
  item: HistoryItem;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export function HistoryCard({ item, onNotify }: HistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Format date display
  const [year, month, day] = item.date.split("-").map((v) => parseInt(v, 10));
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dateLabel = `${dayNames[dateObj.getUTCDay()]}, ${day} ${monthNames[month - 1]} ${year}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(item.formattedReport);
    if (success) {
      setIsCopied(true);
      onNotify(`Laporan tanggal ${item.date} disalin!`);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      onNotify("Gagal menyalin laporan", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">{dateLabel}</span>
            {item.isSent ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Terkirim</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                <Clock className="w-3 h-3" />
                <span>Belum Terkirim</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Tugas Selesai:{" "}
            <span className="font-semibold text-slate-700">
              {item.completedTasks} dari {item.totalTasks}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors touch-target shadow-xs ${
              isCopied
                ? "bg-emerald-600 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? "Tersalin" : "Salin Ulang"}</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors touch-target flex items-center justify-center border border-slate-200"
            title={isOpen ? "Tutup detail" : "Lihat isi laporan"}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/70">
          <pre className="p-3 bg-white rounded-xl text-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-200/80">
            {item.formattedReport}
          </pre>
        </div>
      )}
    </div>
  );
}
