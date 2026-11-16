"use client";

import React from "react";
import { Check, CheckCheck, Edit2, UserPlus, X, RotateCcw } from "lucide-react";

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
  tasks,
  onToggleTask,
  onCheckAll,
  onEditAssignee,
}: AreaCardProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Area */}
      <div className="bg-slate-50 px-3.5 py-3 border-b border-slate-200/80 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-blue-700 tracking-wide uppercase">
              Area {areaNumber}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {areaName}
            </h2>
          </div>

          <button
            onClick={() => onCheckAll(!allCompleted)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors touch-target ${
              allCompleted
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
            title={allCompleted ? "Batalkan semua centang" : "Centang semua tugas"}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{allCompleted ? "Batal Semua" : "Centang Semua"}</span>
          </button>
        </div>

        {/* Petugas Bar with 1-Tap Switch */}
        <div className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-slate-500 shrink-0 font-medium">Petugas:</span>
              {assigneeList && assigneeList.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {assigneeList.map((name) => {
                    const isExtra =
                      defaultAssigneeList && !defaultAssigneeList.includes(name);
                    return (
                      <span
                        key={name}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-xs ${
                          isExtra
                            ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                            : "bg-blue-50 text-blue-900 border border-blue-200"
                        }`}
                      >
                        <span>{name}</span>
                        {onRemoveHelper && (
                          <button
                            type="button"
                            onClick={() => onRemoveHelper(name)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors touch-target min-h-0 min-w-0"
                            title={`Pindahkan ${name} kembali`}
                            aria-label={`Pindahkan ${name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="font-bold text-blue-900 truncate">
                  {assignee || "Belum ditentukan"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isModified && onResetAssignee && (
                <button
                  type="button"
                  onClick={onResetAssignee}
                  className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors touch-target flex items-center justify-center"
                  title="Kembalikan ke jadwal asli"
                  aria-label="Kembalikan ke jadwal asli"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onEditAssignee}
                className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors touch-target flex items-center justify-center"
                title="Ubah nama petugas manual"
                aria-label="Ubah nama petugas manual"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Switch Helpers Row (Area 1 Dapur & Area 2 Asrama) */}
          {availableHelpers && availableHelpers.length > 0 && onAddHelper && (
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 flex-wrap">
              <span className="text-[11px] font-medium text-slate-500">
                {areaNumber === 1 ? "+ Tambah Petugas:" : "+ Bantuan:"}
              </span>
              {availableHelpers.map((helper) => (
                <button
                  key={helper}
                  type="button"
                  onClick={() => onAddHelper(helper)}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all touch-target shadow-2xs"
                  title={`Pindahkan ${helper} ke ${areaName}`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{helper}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Checklist */}
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => {
          const isDone = task.completed;
          return (
            <label
              key={task.id}
              className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors select-none min-h-[46px] ${
                isDone ? "bg-blue-50/40" : "hover:bg-slate-50 active:bg-slate-100/70"
              }`}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleTask(task.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-blue-700 border-blue-700 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <span
                className={`text-xs sm:text-sm leading-relaxed flex-1 ${
                  isDone
                    ? "text-slate-500 line-through decoration-slate-300"
                    : "text-slate-800 font-normal"
                }`}
              >
                {task.text}
              </span>
            </label>
          );
        })}
      </div>

      {/* Footer counter */}
      <div className="px-3.5 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Status area</span>
        <span className="font-semibold text-slate-700">
          {completedCount} dari {totalCount} tugas selesai
        </span>
      </div>
    </section>
  );
}
