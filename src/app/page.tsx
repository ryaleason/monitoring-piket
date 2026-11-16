"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { AreaCard, TaskState } from "@/components/AreaCard";
import { EditAssigneeModal } from "@/components/EditAssigneeModal";
import { Toast } from "@/components/Toast";
import { copyToClipboard } from "@/lib/clipboard";
import { formatDailyReport, AreaReportData } from "@/lib/reportFormatter";
import { getJakartaDate } from "@/lib/dateUtils";
import {
  FIXED_DAILY_SCHEDULE,
  DEFAULT_PIKET_AREAS,
  AreaDefinition,
} from "@/lib/schedule";
import { Copy, Check, CheckCheck, FileText, CalendarDays } from "lucide-react";

const DAYS_LIST = [
  { index: 1, name: "Senin" },
  { index: 2, name: "Selasa" },
  { index: 3, name: "Rabu" },
  { index: 4, name: "Kamis" },
  { index: 5, name: "Jumat" },
  { index: 6, name: "Sabtu" },
  { index: 0, name: "Minggu" },
];

export default function HomePage() {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [dateInfo, setDateInfo] = useState<{
    formattedDate: string;
    dayIndex: number;
    dateString: string;
  }>({
    formattedDate: "",
    dayIndex: 1,
    dateString: "",
  });

  // Assignees state per area: { 1: "...", 2: "...", 3: "..." }
  const [customAssignees, setCustomAssignees] = useState<Record<number, string>>({});

  // Checklist state: { [taskId]: boolean }
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({});

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [copiedRecently, setCopiedRecently] = useState(false);

  // Modal edit assignee
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    areaNumber: number;
    areaName: string;
    currentAssignee: string;
  }>({
    isOpen: false,
    areaNumber: 1,
    areaName: "",
    currentAssignee: "",
  });

  // 1. Initialize today's date in WIB
  useEffect(() => {
    const jakarta = getJakartaDate();
    setDateInfo({
      formattedDate: jakarta.formattedDate,
      dayIndex: jakarta.dayIndex,
      dateString: jakarta.dateString,
    });
    setSelectedDayIndex(jakarta.dayIndex);

    // Load saved checks for today from localStorage if available
    try {
      const savedChecks = localStorage.getItem(`piket_checks_${jakarta.dateString}`);
      if (savedChecks) {
        setTaskChecks(JSON.parse(savedChecks));
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Active schedule for the selected day
  const defaultSchedule = useMemo(() => {
    return (
      FIXED_DAILY_SCHEDULE[selectedDayIndex] || {
        dapur: "Petugas Dapur",
        lobby: "Petugas Lobby",
        musala: "Petugas Musala",
      }
    );
  }, [selectedDayIndex]);

  // Determine effective assignee per area
  const getAssigneeForArea = (areaId: number): string => {
    if (customAssignees[areaId] !== undefined) {
      return customAssignees[areaId];
    }
    if (areaId === 1) return defaultSchedule.dapur;
    if (areaId === 2) return defaultSchedule.lobby;
    if (areaId === 3) return defaultSchedule.musala;
    return "";
  };

  // Reset custom assignees when user switches day
  const handleSelectDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setCustomAssignees({});
  };

  // Toggle single task check
  const handleToggleTask = (taskId: string) => {
    setTaskChecks((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      if (dateInfo.dateString) {
        try {
          localStorage.setItem(`piket_checks_${dateInfo.dateString}`, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  // Check all tasks in an area
  const handleCheckAllArea = (area: AreaDefinition, completed: boolean) => {
    setTaskChecks((prev) => {
      const updated = { ...prev };
      area.tasks.forEach((t) => {
        updated[t.id] = completed;
      });
      if (dateInfo.dateString) {
        try {
          localStorage.setItem(`piket_checks_${dateInfo.dateString}`, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  // Check all tasks globally
  const handleCheckAllGlobal = (completed: boolean) => {
    setTaskChecks((prev) => {
      const updated = { ...prev };
      DEFAULT_PIKET_AREAS.forEach((area) => {
        area.tasks.forEach((t) => {
          updated[t.id] = completed;
        });
      });
      if (dateInfo.dateString) {
        try {
          localStorage.setItem(`piket_checks_${dateInfo.dateString}`, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  // Save modified assignee
  const handleSaveAssignee = (newAssignee: string) => {
    setCustomAssignees((prev) => ({
      ...prev,
      [editModal.areaNumber]: newAssignee,
    }));
    setToastMessage(`Nama petugas Area ${editModal.areaNumber} diperbarui`);
    setToastType("success");
  };

  // Build formatted report string
  const formattedReport = useMemo(() => {
    const areasReportData: AreaReportData[] = DEFAULT_PIKET_AREAS.map((area) => ({
      areaNumber: area.id,
      areaName: area.name,
      assigneeText: getAssigneeForArea(area.id),
      tasks: area.tasks.map((task) => ({
        text: task.text,
        completed: Boolean(taskChecks[task.id]),
      })),
    }));

    return formatDailyReport(areasReportData);
  }, [customAssignees, defaultSchedule, taskChecks]);

  // Copy report to clipboard
  const handleCopyReport = async () => {
    const success = await copyToClipboard(formattedReport);
    if (success) {
      setCopiedRecently(true);
      setToastMessage("Laporan berhasil disalin ke clipboard! Siap ditempel ke WhatsApp.");
      setToastType("success");
      setTimeout(() => setCopiedRecently(false), 2500);
    } else {
      setToastMessage("Gagal menyalin otomatis. Silakan salin manual.");
      setToastType("error");
    }
  };

  // Metrics
  const allTasksList = DEFAULT_PIKET_AREAS.flatMap((a) => a.tasks);
  const totalTasks = allTasksList.length;
  const completedCount = allTasksList.filter((t) => Boolean(taskChecks[t.id])).length;
  const percent = Math.round((completedCount / totalTasks) * 100);
  const allGlobalCompleted = completedCount === totalTasks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* App Header */}
      <Header formattedDate={dateInfo.formattedDate} />

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4 pb-28">
        {/* Day Selector Pill Tabs */}
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-1.5 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5 text-blue-900">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>Jadwal Harian:</span>
            </span>
            <button
              onClick={() => handleCheckAllGlobal(!allGlobalCompleted)}
              className="text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 touch-target"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{allGlobalCompleted ? "Batal Semua" : "Centang Semua Tugas"}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {DAYS_LIST.map((d) => {
              const isSelected = selectedDayIndex === d.index;
              const isToday = dateInfo.dayIndex === d.index;
              return (
                <button
                  key={d.index}
                  onClick={() => handleSelectDay(d.index)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-target flex items-center gap-1 ${
                    isSelected
                      ? "bg-blue-700 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>{d.name}</span>
                  {isToday && (
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Hari Ini
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Areas Cards */}
        <div className="space-y-4">
          {DEFAULT_PIKET_AREAS.map((area) => {
            const areaTasks: TaskState[] = area.tasks.map((t) => ({
              id: t.id,
              text: t.text,
              completed: Boolean(taskChecks[t.id]),
            }));
            const currentAssignee = getAssigneeForArea(area.id);

            return (
              <AreaCard
                key={area.id}
                areaNumber={area.id}
                areaName={area.name}
                assignee={currentAssignee}
                tasks={areaTasks}
                onToggleTask={handleToggleTask}
                onCheckAll={(completed) => handleCheckAllArea(area, completed)}
                onEditAssignee={() =>
                  setEditModal({
                    isOpen: true,
                    areaNumber: area.id,
                    areaName: area.name,
                    currentAssignee,
                  })
                }
              />
            );
          })}
        </div>

        {/* Collapsible Format Preview */}
        <details className="bg-white rounded-xl border border-slate-200 p-3.5 text-xs text-slate-600 group">
          <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-2 select-none touch-target">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Lihat Tampilan Format Teks WhatsApp</span>
          </summary>
          <pre className="mt-3 p-3 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-200/80">
            {formattedReport}
          </pre>
        </details>
      </main>

      {/* Sticky Bottom Bar with Single Prominent Action Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-lg">
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Progres Selesai:</span>
              <span className="font-bold text-blue-900">
                {completedCount}/{totalTasks}
              </span>
              <span className="text-slate-400">({percent}%)</span>
            </div>
            <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Prominent Copy Button */}
          <button
            onClick={handleCopyReport}
            className={`w-full py-4 px-4 rounded-xl font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2.5 touch-target ${
              copiedRecently
                ? "bg-emerald-600 text-white"
                : "bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white ring-2 ring-blue-700/20"
            }`}
          >
            {copiedRecently ? (
              <>
                <Check className="w-5 h-5 text-emerald-200 stroke-[3]" />
                <span>Laporan Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 stroke-[2.2]" />
                <span>Salin Laporan WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Edit Assignee */}
      <EditAssigneeModal
        isOpen={editModal.isOpen}
        areaNumber={editModal.areaNumber}
        areaName={editModal.areaName}
        currentAssignee={editModal.currentAssignee}
        onClose={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveAssignee}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
