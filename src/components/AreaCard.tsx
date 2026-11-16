"use client";

import React from "react";
import { Check, CheckCheck, Edit2 } from "lucide-react";
import { AreaWithTasks } from "@/lib/db";

interface AreaCardProps {
  area: AreaWithTasks;
  onToggleTask: (taskId: number, currentCompleted: boolean) => void;
  onCheckAll: (areaId: number, completed: boolean) => void;
  onOpenEditAssignee: (areaId: number, areaName: string, currentAssignee: string) => void;
}

export function AreaCard({
  area,
  onToggleTask,
  onCheckAll,
  onOpenEditAssignee,
}: AreaCardProps) {
  const completedCount = area.tasks.filter((t) => t.completed).length;
  const totalCount = area.tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* Header Area */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
              Area {area.displayOrder}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {area.name}
            </h2>
          </div>

          <button
            onClick={() => onCheckAll(area.id, !allCompleted)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors touch-target ${
              allCompleted
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
            title={allCompleted ? "Hapus semua centang" : "Centang semua tugas"}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{allCompleted ? "Batal Semua" : "Centang Semua"}</span>
          </button>
        </div>

        {/* Petugas Banner */}
        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 text-xs">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-slate-500 shrink-0">Petugas:</span>
            <span className="font-semibold text-blue-900 truncate">
              {area.assigneeText || "Belum ditentukan"}
            </span>
          </div>
          <button
            onClick={() =>
              onOpenEditAssignee(area.id, area.name, area.assigneeText || "")
            }
            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors touch-target flex items-center justify-center shrink-0 ml-1"
            title="Ganti petugas hari ini"
            aria-label="Ganti petugas hari ini"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Checklist */}
      <div className="divide-y divide-slate-100 p-1 sm:p-2">
        {area.tasks.map((task) => {
          const isDone = Boolean(task.completed);
          return (
            <label
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors touch-target ${
                isDone ? "bg-blue-50/50" : "hover:bg-slate-50"
              }`}
            >
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleTask(task.id, isDone)}
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
                  isDone ? "text-slate-700 font-medium" : "text-slate-800"
                }`}
              >
                {task.text}
              </span>

              <span className="text-xs shrink-0 select-none ml-1">
                {isDone ? "✅" : "❌"}
              </span>
            </label>
          );
        })}
      </div>

      {/* Footer status counter */}
      <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Status tugas area</span>
        <span className="font-semibold text-slate-700">
          {completedCount} dari {totalCount} selesai
        </span>
      </div>
    </section>
  );
}
