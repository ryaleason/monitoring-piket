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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-2 ${
        isSuccess
          ? "bg-blue-900 text-white border-blue-700"
          : isError
          ? "bg-rose-900 text-white border-rose-700"
          : "bg-slate-900 text-white border-slate-700"
      }`}
    >
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/70 hover:text-white p-1 rounded-md transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
