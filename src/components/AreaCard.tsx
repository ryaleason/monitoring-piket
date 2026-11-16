"use client";

import React from "react";
import { Check, CheckCheck, Edit2 } from "lucide-react";

export interface TaskState {
  id: string;
  text: string;
  completed: boolean;
}

interface AreaCardProps {
  areaNumber: number;
  areaName: string;
  assignee: string;
  tasks: TaskState[];
  onToggleTask: (taskId: string) => void;
  onCheckAll: (completed: boolean) => void;
  onEditAssignee: () => void;
}

export function AreaCard({
  areaNumber,
  areaName,
  assignee,
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

        {/* Petugas Bar */}
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-slate-500 shrink-0 font-medium">Petugas:</span>
            <span className="font-bold text-blue-900 truncate">
              {assignee || "Belum ditentukan"}
            </span>
          </div>
          <button
            onClick={onEditAssignee}
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors touch-target flex items-center justify-center shrink-0 ml-1"
            title="Ganti nama petugas hari ini"
            aria-label="Ganti nama petugas hari ini"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
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
