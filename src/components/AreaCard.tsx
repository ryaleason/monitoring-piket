"use client";

import React, { useState } from "react";
import {
  Check,
  Minus,
  Edit2,
  Undo2,
  ArrowRight,
  RotateCcw,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface TaskState {
  id: string;
  text: string;
  completed: boolean;
}

export interface AssigneeItem {
  name: string;
  isGuest?: boolean;
}

interface AreaCardProps {
  areaNumber: number;
  areaName: string;
  assignee: string;
  assigneeItems?: AssigneeItem[];
  canTransferToOtherArea?: boolean;
  transferActionLabel?: string;
  onTransferPerson?: (name: string) => void;
  onReturnPerson?: (name: string) => void;
  onResetAssignee?: () => void;
  isModified?: boolean;
  isFixedSchedule?: boolean;
  tasks: TaskState[];
  onToggleTask: (taskId: string) => void;
  onCheckAll: (completed: boolean) => void;
  onEditAssignee: () => void;
}

export function AreaCard({
  areaNumber,
  areaName,
  assignee,
  assigneeItems,
  canTransferToOtherArea,
  transferActionLabel,
  onTransferPerson,
  onReturnPerson,
  onResetAssignee,
  isModified,
  isFixedSchedule,
  tasks,
  onToggleTask,
  onCheckAll,
  onEditAssignee,
}: AreaCardProps) {
  // Collapsible accordion state: default collapsed for compact mobile view
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const someCompleted = completedCount > 0 && !allCompleted;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Area Header */}
      <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-xs font-bold text-blue-600 tracking-wider shrink-0">
              0{areaNumber}
            </span>
            <h2 className="text-base font-bold text-blue-950 truncate">
              {areaName}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Check All Checkbox Button (Icon Only - Anti-Slop) */}
            <button
              type="button"
              onClick={() => onCheckAll(!allCompleted)}
              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors touch-target flex items-center justify-center"
              title={allCompleted ? "Batalkan semua tugas area ini" : "Centang semua tugas area ini"}
              aria-label={allCompleted ? "Batalkan semua tugas area ini" : "Centang semua tugas area ini"}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  allCompleted
                    ? "bg-blue-600 text-white shadow-2xs"
                    : someCompleted
                    ? "bg-blue-50 border-2 border-blue-600 text-blue-600"
                    : "border-2 border-slate-300 bg-white hover:border-blue-500"
                }`}
              >
                {allCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : someCompleted ? (
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                ) : null}
              </div>
            </button>

            {/* Arrow Toggle Button (Chevron Up / Down) */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors touch-target flex items-center justify-center"
              title={isExpanded ? "Sembunyikan detail tugas" : "Tampilkan detail tugas"}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Sembunyikan detail tugas" : "Tampilkan detail tugas"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Integrated Petugas Row with Solusi 2 (Arah Pindah Jelas) */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-slate-500 font-medium">Petugas:</span>
            {assigneeItems && assigneeItems.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {assigneeItems.map((item) => {
                  // Case 1: Guest helper in this area (e.g. Izal helping in Dapur) -> Seamless emerald segmented pill
                  if (item.isGuest && onReturnPerson) {
                    return (
                      <div
                        key={item.name}
                        className="inline-flex items-center rounded-lg border border-emerald-300 bg-emerald-50 text-xs overflow-hidden shadow-2xs"
                      >
                        <span className="px-2.5 py-1 font-semibold text-emerald-950">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onReturnPerson(item.name)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-100/70 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-900 border-l border-emerald-300/80 text-[11px] font-medium transition-colors touch-target min-h-0 min-w-0"
                          title={`Kembalikan ${item.name} ke area asalnya`}
                          aria-label={`Kembalikan ${item.name} ke area asalnya`}
                        >
                          <Undo2 className="w-3 h-3 text-emerald-700" />
                          <span>Kembalikan</span>
                        </button>
                      </div>
                    );
                  }

                  // Case 2: Default santri with directional transfer (e.g. Asrama -> Bantu Dapur) -> Seamless blue segmented pill
                  if (canTransferToOtherArea && onTransferPerson) {
                    return (
                      <div
                        key={item.name}
                        className="inline-flex items-center rounded-lg border border-blue-200/90 text-xs overflow-hidden shadow-2xs"
                      >
                        <span className="px-2.5 py-1 font-semibold text-blue-900">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onTransferPerson(item.name)}
                          className="flex items-center gap-1 px-2 py-1  hover:bg-blue-200/80 active:bg-blue-300/80 text-blue-800 border-l border-blue-200/90 text-[11px] font-medium transition-colors touch-target min-h-0 min-w-0"
                          title={`${transferActionLabel || "Bantu"} ${item.name}`}
                          aria-label={`${transferActionLabel || "Bantu"} ${item.name}`}
                        >
                          <span>{transferActionLabel || "Bantu Dapur"}</span>
                          <ArrowRight className="w-3 h-3 text-blue-600" />
                        </button>
                      </div>
                    );
                  }

                  // Case 3: Standard default santri without transfer button (e.g. Host of Dapur, or Musala)
                  return (
                    <div
                      key={item.name}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg border border-blue-200/90 bg-blue-50/70 text-xs font-semibold text-blue-900 shadow-2xs"
                    >
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="font-bold text-blue-900">
                {assignee}
              </span>
            )}

            {isFixedSchedule && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                <Lock className="w-2.5 h-2.5 text-blue-600" />
                <span>Jadwal Tetap</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isModified && onResetAssignee && (
              <button
                type="button"
                onClick={onResetAssignee}
                className="p-1 text-slate-400 hover:text-blue-700 rounded-md transition-colors"
                title="Kembalikan ke jadwal asli"
                aria-label="Kembalikan ke jadwal asli"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onEditAssignee}
              className="p-1 text-slate-400 hover:text-blue-700 rounded-md transition-colors"
              title="Ubah nama petugas manual"
              aria-label="Ubah nama petugas manual"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Checklist (Collapsible - toggled by arrow up/down) */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 animate-in fade-in duration-200">
          {tasks.map((task) => {
            const isDone = task.completed;
            return (
              <label
                key={task.id}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors select-none min-h-[46px] ${
                  isDone ? "bg-blue-50/20" : "hover:bg-slate-50/80 active:bg-slate-100/60"
                }`}
              >
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => onToggleTask(task.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 bg-white hover:border-blue-400"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <span
                  className={`text-sm leading-snug flex-1 ${
                    isDone
                      ? "text-slate-400 line-through decoration-slate-300"
                      : "text-slate-800"
                  }`}
                >
                  {task.text}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Footer / Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-2.5 bg-slate-50/60 hover:bg-blue-50/40 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 transition-colors touch-target"
        aria-expanded={isExpanded}
      >
        <span className="font-medium text-slate-700">
          {completedCount} dari {totalCount} tugas selesai
        </span>
        <span className="flex items-center gap-1 font-semibold text-blue-700">
          <span>{isExpanded ? "Tutup rincian" : "Lihat rincian tugas"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </span>
      </button>
    </section>
  );
}
