"use client";

import React, { useState, useEffect } from "react";
import { X, User, Info } from "lucide-react";

interface EditAssigneeModalProps {
  isOpen: boolean;
  areaId: number;
  areaName: string;
  currentAssignee: string;
  onClose: () => void;
  onSave: (areaId: number, newAssignee: string) => Promise<void>;
}

export function EditAssigneeModal({
  isOpen,
  areaId,
  areaName,
  currentAssignee,
  onClose,
  onSave,
}: EditAssigneeModalProps) {
  const [name, setName] = useState(currentAssignee);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(currentAssignee);
  }, [currentAssignee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(areaId, name.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-slate-800">
              Ganti Petugas Hari Ini
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Area Piket
            </label>
            <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              {areaName}
            </p>
          </div>

          <div>
            <label
              htmlFor="assigneeInput"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Nama Petugas Hari Ini
            </label>
            <input
              id="assigneeInput"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ahmad atau Rakha & Ega"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              autoFocus
              required
            />
            <p className="flex items-start gap-1.5 mt-2 text-xs text-slate-500">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Perubahan hanya berlaku untuk hari ini (misal karena tukar piket / sakit), dan tidak mengubah jadwal mingguan.
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg touch-target"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg touch-target flex items-center justify-center transition-colors shadow-xs"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
