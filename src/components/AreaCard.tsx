"use client";

import React, { useState } from "react";
import {
  Check,
  Edit2,
  UserPlus,
  X,
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

interface AreaCardProps {
  areaNumber: number;
  areaName: string;
  assignee: string;
  assigneeList?: string[];
  defaultAssigneeList?: string[];
  availableHelpers?: string[];
  onAddHelper?: (name: string) => void;
  onRemoveHelper?: (name: string) => void;
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
  assigneeList,
  defaultAssigneeList,
  availableHelpers,
  onAddHelper,
  onRemoveHelper,
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

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onCheckAll(!allCompleted)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 active:text-blue-900 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
              title={allCompleted ? "Batalkan semua centang" : "Centang semua tugas"}
            >
              {allCompleted ? "Batal Semua" : "Centang Semua"}
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

        {/* Integrated Petugas Row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-slate-500 font-medium">Petugas:</span>
            {assigneeList && assigneeList.length > 0 ? (
              <div className="flex items-center gap-1 flex-wrap">
                {assigneeList.map((name) => {
                  const isExtra =
                    defaultAssigneeList && !defaultAssigneeList.includes(name);
                  return (
                    <span
                      key={name}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-xs ${
                        isExtra
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-blue-50 text-blue-900 border border-blue-200/90"
                      }`}
                    >
                      <span>{name}</span>
                      {onRemoveHelper && (
                        <button
                          type="button"
                          onClick={() => onRemoveHelper(name)}
                          className="text-blue-400 hover:text-blue-800 p-0.5 rounded-full transition-colors"
                          title={`Kembalikan ${name}`}
                          aria-label={`Kembalikan ${name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
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
                <span>Tetap</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isModified && onResetAssignee && (
              <button
                type="button"
                onClick={onResetAssignee}
                className="p-1 text-slate-400 hover:text-blue-700 rounded-md transition-colors"
                title="Reset ke jadwal asli"
                aria-label="Reset ke jadwal asli"
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

        {/* Quick Helpers (Inline, Minimalist) */}
        {availableHelpers && availableHelpers.length > 0 && onAddHelper && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-slate-500">
              {areaNumber === 1 ? "Tambah bantuan:" : "Tarik bantuan:"}
            </span>
            {availableHelpers.map((helper) => (
              <button
                key={helper}
                type="button"
                onClick={() => onAddHelper(helper)}
                className="px-2 py-0.5 bg-blue-50/60 hover:bg-emerald-50 active:bg-emerald-100 text-blue-700 hover:text-emerald-700 border border-dashed border-blue-300 hover:border-emerald-300 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all"
              >
                <UserPlus className="w-3 h-3" />
                <span>{helper}</span>
              </button>
            ))}
          </div>
        )}
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
