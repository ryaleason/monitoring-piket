"use client";

import React from "react";
import { Check, Edit2, UserPlus, X, RotateCcw, Lock } from "lucide-react";

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
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Area Header */}
      <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-slate-500 tracking-wider">
              0{areaNumber}
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {areaName}
            </h2>
          </div>

          <button
            onClick={() => onCheckAll(!allCompleted)}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 active:text-slate-950 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            {allCompleted ? "Batal Semua" : "Centang Semua"}
          </button>
        </div>

        {/* Integrated Petugas Row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-slate-600 font-medium">Petugas:</span>
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
                          : "bg-slate-100 text-slate-800 border border-slate-200/70"
                      }`}
                    >
                      <span>{name}</span>
                      {onRemoveHelper && (
                        <button
                          type="button"
                          onClick={() => onRemoveHelper(name)}
                          className="text-slate-400 hover:text-slate-800 p-0.5 rounded-full transition-colors"
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
              <span className="font-semibold text-slate-900">
                {assignee}
              </span>
            )}

            {isFixedSchedule && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5 text-slate-600" />
                <span>Tetap</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isModified && onResetAssignee && (
              <button
                type="button"
                onClick={onResetAssignee}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-md transition-colors"
                title="Reset ke jadwal asli"
                aria-label="Reset ke jadwal asli"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onEditAssignee}
              className="p-1 text-slate-400 hover:text-slate-800 rounded-md transition-colors"
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
            <span className="text-[11px] text-slate-600">
              {areaNumber === 1 ? "Tambah bantuan:" : "Tarik bantuan:"}
            </span>
            {availableHelpers.map((helper) => (
              <button
                key={helper}
                type="button"
                onClick={() => onAddHelper(helper)}
                className="px-2 py-0.5 bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 text-slate-600 hover:text-emerald-700 border border-dashed border-slate-300 hover:border-emerald-300 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all"
              >
                <UserPlus className="w-3 h-3" />
                <span>{helper}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task Checklist */}
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => {
          const isDone = task.completed;
          return (
            <label
              key={task.id}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors select-none min-h-[46px] ${
                isDone ? "bg-slate-50/50" : "hover:bg-slate-50/80 active:bg-slate-100/60"
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
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white hover:border-slate-400"
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

      {/* Footer counter */}
      <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span>Status area</span>
        <span className="font-semibold text-slate-700">
          {completedCount} dari {totalCount} tugas selesai
        </span>
      </div>
    </section>
  );
}
