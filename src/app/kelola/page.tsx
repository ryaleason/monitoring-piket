"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PinModal } from "@/components/PinModal";
import { ScheduleManager } from "@/components/ScheduleManager";
import { TaskManager } from "@/components/TaskManager";
import { SettingsManager } from "@/components/SettingsManager";
import { Toast } from "@/components/Toast";
import { ArrowLeft, Calendar, CheckSquare, Sliders, LogOut } from "lucide-react";

export default function KelolaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "tasks" | "settings">("schedule");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    // Check session storage for admin login
    const isAuth = sessionStorage.getItem("admin_auth") === "true";
    setIsAuthenticated(isAuth);
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!isAuthenticated) {
    return <PinModal onSuccess={() => setIsAuthenticated(true)} />;
  }

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
                Panel Pengurus
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                ITBS AL- Kautsar - Monitoring piket
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors touch-target flex items-center justify-center"
            title="Keluar"
            aria-label="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-xl mx-auto px-4 flex border-t border-slate-100">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors touch-target ${
              activeTab === "schedule"
                ? "border-blue-700 text-blue-700 bg-blue-50/40"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jadwal Mingguan</span>
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors touch-target ${
              activeTab === "tasks"
                ? "border-blue-700 text-blue-700 bg-blue-50/40"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Daftar Tugas</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors touch-target ${
              activeTab === "settings"
                ? "border-blue-700 text-blue-700 bg-blue-50/40"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 pb-8">
        {activeTab === "schedule" && <ScheduleManager onNotify={showToast} />}
        {activeTab === "tasks" && <TaskManager onNotify={showToast} />}
        {activeTab === "settings" && <SettingsManager onNotify={showToast} />}
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
