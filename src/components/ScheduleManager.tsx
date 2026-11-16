"use client";

import React, { useState, useEffect } from "react";
import { WeeklyScheduleItem, AreaWithTasks } from "@/lib/db";
import { Save, Check, RefreshCw, CalendarDays } from "lucide-react";

interface ScheduleManagerProps {
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const DAYS = [
  { index: 1, name: "Senin" },
  { index: 2, name: "Selasa" },
  { index: 3, name: "Rabu" },
  { index: 4, name: "Kamis" },
  { index: 5, name: "Jumat" },
  { index: 6, name: "Sabtu" },
  { index: 0, name: "Minggu" },
];

export function ScheduleManager({ onNotify }: ScheduleManagerProps) {
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>([]);
  const [areas, setAreas] = useState<AreaWithTasks[]>([]);
  const [activeDay, setActiveDay] = useState<number>(1); // Default Senin
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [schedRes, taskRes] = await Promise.all([
          fetch("/api/admin/schedule"),
          fetch("/api/admin/tasks"),
        ]);

        const schedData = await schedRes.json();
        const taskData = await taskRes.json();

        setSchedule(schedData.schedule || []);
        setAreas(taskData.areas || []);
      } catch {
        onNotify("Gagal memuat jadwal mingguan", "error");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [onNotify]);

  const getAssignee = (dayIndex: number, areaId: number) => {
    const item = schedule.find((s) => s.dayOfWeek === dayIndex && s.areaId === areaId);
    return item ? item.assignee : "";
  };

  const handleAssigneeChange = (dayIndex: number, areaId: number, value: string) => {
    setSchedule((prev) => {
      const existing = prev.find((s) => s.dayOfWeek === dayIndex && s.areaId === areaId);
      if (existing) {
        return prev.map((s) =>
          s.dayOfWeek === dayIndex && s.areaId === areaId ? { ...s, assignee: value } : s
        );
      } else {
        return [...prev, { id: Date.now(), dayOfWeek: dayIndex, areaId, assignee: value }];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": sessionStorage.getItem("admin_pin") || "",
        },
        body: JSON.stringify({ schedule }),
      });

      if (!res.ok) throw new Error();
      onNotify("Jadwal mingguan berhasil disimpan!");
    } catch {
      onNotify("Gagal menyimpan jadwal mingguan", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-xs font-medium">Memuat jadwal mingguan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Day Selector Tabs (Horizontal Scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((day) => {
          const isActive = activeDay === day.index;
          return (
            <button
              key={day.index}
              onClick={() => setActiveDay(day.index)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-target ${
                isActive
                  ? "bg-blue-700 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {day.name}
            </button>
          );
        })}
      </div>

      {/* Schedule Form for Active Day */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Petugas Hari {DAYS.find((d) => d.index === activeDay)?.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400">Jadwal Mingguan Tetap</span>
        </div>

        <div className="space-y-3.5">
          {areas.map((area) => (
            <div key={area.id} className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Area {area.displayOrder}: {area.name}
              </label>
              <input
                type="text"
                value={getAssignee(activeDay, area.id)}
                onChange={(e) =>
                  handleAssigneeChange(activeDay, area.id, e.target.value)
                }
                placeholder="Contoh: Ahmad atau Rakha & Ega"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 min-h-[44px]"
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors touch-target shadow-xs"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Jadwal Mingguan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
