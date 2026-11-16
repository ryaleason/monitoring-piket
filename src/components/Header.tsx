"use client";

import React from "react";
import Link from "next/link";
import { Settings, History, Calendar } from "lucide-react";

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
          <p className="text-xs font-medium text-blue-600">
            Monitoring Piket Asrama & Musala
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{formattedDate || "Memuat tanggal..."}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/riwayat"
            className="p-2.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors touch-target flex items-center justify-center"
            title="Riwayat Laporan"
            aria-label="Riwayat Laporan"
          >
            <History className="w-5 h-5" />
          </Link>
          <Link
            href="/kelola"
            className="p-2.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors touch-target flex items-center justify-center"
            title="Kelola Jadwal & Tugas"
            aria-label="Kelola Jadwal & Tugas"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
