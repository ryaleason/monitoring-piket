"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-medium transition-all max-w-[90vw] ${
        isSuccess
          ? "bg-slate-900 text-white border-slate-700"
          : isError
          ? "bg-rose-950 text-white border-rose-800"
          : "bg-slate-900 text-white border-slate-700"
      }`}
    >
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      <span className="truncate">{message}</span>
      <button
        onClick={onClose}
        className="ml-1.5 text-white/70 hover:text-white p-1 rounded-md transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
