"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface HeaderProps {
  formattedDate: string;
}

export function Header({ formattedDate }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-xl w-full mx-auto px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-blue-900 tracking-tight leading-tight truncate">
            ITBS Al-Kautsar
          </h1>
          <p className="text-[11px] sm:text-xs font-medium text-slate-600 truncate">
            Monitoring Piket Asrama & Musala
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-900 rounded-lg text-xs font-medium border border-blue-200/80 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span className="whitespace-nowrap">{formattedDate || "Memuat..."}</span>
        </div>
      </div>
    </header>
  );
}
