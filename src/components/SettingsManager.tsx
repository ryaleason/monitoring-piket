"use client";

import React, { useState, useEffect } from "react";
import { Clock, KeyRound, Save, RefreshCw, Sliders } from "lucide-react";

interface SettingsManagerProps {
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export function SettingsManager({ onNotify }: SettingsManagerProps) {
  const [cutoffTime, setCutoffTime] = useState("20:00");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.settings?.reminder_cutoff_time) {
          setCutoffTime(data.settings.reminder_cutoff_time);
        }
      } catch {
        onNotify("Gagal memuat pengaturan", "error");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [onNotify]);

  const handleSaveCutoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cutoffTime) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": sessionStorage.getItem("admin_pin") || "",
        },
        body: JSON.stringify({
          key: "reminder_cutoff_time",
          value: cutoffTime,
        }),
      });

      if (!res.ok) throw new Error();
      onNotify("Jam batas pengingat berhasil diperbarui!");
    } catch {
      onNotify("Gagal memperbarui jam batas pengingat", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) return;

    if (newPin !== confirmPin) {
      onNotify("Konfirmasi PIN baru tidak cocok!", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": sessionStorage.getItem("admin_pin") || "",
        },
        body: JSON.stringify({
          key: "admin_pin",
          value: newPin.trim(),
        }),
      });

      if (!res.ok) throw new Error();
      sessionStorage.setItem("admin_pin", newPin.trim());
      setNewPin("");
      setConfirmPin("");
      onNotify("PIN Pengurus berhasil diubah!");
    } catch {
      onNotify("Gagal mengubah PIN", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-xs font-medium">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cutoff Time Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Jam Batas Pengingat Laporan (WIB)
          </h3>
        </div>

        <form onSubmit={handleSaveCutoff} className="space-y-3">
          <div>
            <label
              htmlFor="cutoffInput"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Waktu Batas (Default: 20:00 WIB)
            </label>
            <input
              id="cutoffInput"
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              required
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Setelah jam ini terlewati, banner pengingat akan tampil mencolok warna merah jika laporan belum dikirim.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors touch-target shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Waktu Batas</span>
          </button>
        </form>
      </div>

      {/* Change Admin PIN Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <KeyRound className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Ganti PIN Bersama Pengurus
          </h3>
        </div>

        <form onSubmit={handleChangePin} className="space-y-3">
          <div>
            <label
              htmlFor="newPin"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              PIN Baru
            </label>
            <input
              id="newPin"
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Masukkan PIN baru"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPin"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Ulangi PIN Baru
            </label>
            <input
              id="confirmPin"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Ketik ulang PIN baru"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || !newPin.trim()}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors touch-target shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan PIN Baru</span>
          </button>
        </form>
      </div>
    </div>
  );
}
