"use client";

import React, { useState } from "react";
import { Copy, Check, CheckCheck, RefreshCw } from "lucide-react";

interface ActionButtonsProps {
  onCopyReport: () => Promise<void>;
  onToggleSentStatus: () => Promise<void>;
  isSent: boolean;
  isCopying: boolean;
  totalCompleted: number;
  totalTasks: number;
}

export function ActionButtons({
  onCopyReport,
  onToggleSentStatus,
  isSent,
  isCopying,
  totalCompleted,
  totalTasks,
}: ActionButtonsProps) {
  const [copiedRecently, setCopiedRecently] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleCopy = async () => {
    await onCopyReport();
    setCopiedRecently(true);
    setTimeout(() => setCopiedRecently(false), 2500);
  };

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      await onToggleSentStatus();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const percent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-lg">
      <div className="max-w-xl mx-auto flex flex-col gap-2.5">
        {/* Progress summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Total Tugas:</span>
            <span className="font-bold text-blue-900">
              {totalCompleted}/{totalTasks}
            </span>
            <span className="text-slate-400">({percent}%)</span>
          </div>
          <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Main Action: Salin Laporan (Most Prominent) */}
          <button
            onClick={handleCopy}
            disabled={isCopying}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 touch-target ${
              copiedRecently
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white ring-2 ring-blue-700/20"
            }`}
          >
            {copiedRecently ? (
              <>
                <Check className="w-5 h-5 text-emerald-200 stroke-[2.5]" />
                <span>Laporan Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 stroke-[2.2]" />
                <span>Salin Laporan WhatsApp</span>
              </>
            )}
          </button>

          {/* Secondary Action: Sudah Dikirim Status */}
          <button
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            className={`w-full py-3 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 touch-target border ${
              isSent
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
            }`}
          >
            {isUpdatingStatus ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
            ) : isSent ? (
              <>
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Sudah Dikirim (Klik utk Batal)</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tandai Sudah Dikirim ke Grup</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
