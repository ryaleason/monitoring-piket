"use client";

import React, { useState, useEffect } from "react";
import { X, User } from "lucide-react";

interface EditAssigneeModalProps {
  isOpen: boolean;
  areaNumber: number;
  areaName: string;
  currentAssignee: string;
  onClose: () => void;
  onSave: (newAssignee: string) => void;
}

export function EditAssigneeModal({
  isOpen,
  areaNumber,
  areaName,
  currentAssignee,
  onClose,
  onSave,
}: EditAssigneeModalProps) {
  const [name, setName] = useState(currentAssignee);

  useEffect(() => {
    setName(currentAssignee);
  }, [currentAssignee, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            <h3 id="modal-title" className="font-semibold text-sm text-slate-900">
              Ubah Nama Petugas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md touch-target flex items-center justify-center"
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
              Area {areaNumber}: {areaName}
            </p>
          </div>

          <div>
            <label
              htmlFor="assigneeInput"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Nama Petugas Hari Ini
            </label>
            <input
              id="assigneeInput"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ahmad atau Rakha & Ega"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg touch-target"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg touch-target flex items-center justify-center transition-colors shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
