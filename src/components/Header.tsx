"use client";

import React from "react";

interface HeaderProps {
  formattedDate: string;
}

export function Header({ formattedDate }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
      <div className="max-w-xl w-full mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
            ITBS Al-Kautsar
          </span>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Monitoring Piket
          </h1>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-900 block">
            {formattedDate || "Memuat..."}
          </span>
          <span className="text-[11px] text-slate-600 block">
            Asrama & Musala
          </span>
        </div>
      </div>
    </header>
  );
}
