"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface HeaderProps {
  formattedDate: string;
}

export function Header({ formattedDate }: HeaderProps) {
  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-blue-900 tracking-tight leading-tight">
            ITBS AL- Kautsar
          </h1>
          <p className="text-xs font-semibold text-blue-700">
            Monitoring Piket Asrama & Musala
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-xl text-xs font-semibold border border-blue-200">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{formattedDate || "Memuat..."}</span>
        </div>
      </div>
    </header>
  );
}
