"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { AreaCard, TaskState } from "@/components/AreaCard";
import { EditAssigneeModal } from "@/components/EditAssigneeModal";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Toast } from "@/components/Toast";
import { copyToClipboard } from "@/lib/clipboard";
import { formatDailyReport, AreaReportData } from "@/lib/reportFormatter";
import { getJakartaDate } from "@/lib/dateUtils";
import {
  FIXED_DAILY_SCHEDULE,
  DEFAULT_PIKET_AREAS,
  AreaDefinition,
} from "@/lib/schedule";
import { Copy, Check, CheckCheck, FileText, CalendarDays, Send } from "lucide-react";

interface DayItem {
  index: number;
  name: string;
  shortName: string;
}

const DAYS_LIST: DayItem[] = [
  { index: 1, name: "Senin", shortName: "Sen" },
  { index: 2, name: "Selasa", shortName: "Sel" },
  { index: 3, name: "Rabu", shortName: "Rab" },
  { index: 4, name: "Kamis", shortName: "Kam" },
  { index: 5, name: "Jumat", shortName: "Jum" },
  { index: 6, name: "Sabtu", shortName: "Sab" },
  { index: 0, name: "Minggu", shortName: "Min" },
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

  // Assignees override state per area: { 1: "...", 2: "...", 3: "..." }
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

    // Load saved checks for today from localStorage
    try {
      const savedChecks = localStorage.getItem(`piket_checks_${jakarta.dateString}`);
      if (savedChecks) {
        setTaskChecks(JSON.parse(savedChecks));
      }
    } catch {
      // ignore storage access issues
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
    setToastMessage(`Petugas Area ${editModal.areaNumber} diperbarui`);
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

  // Redirection to WhatsApp
  const handleSendToWhatsApp = async () => {
    // 1. Copy to clipboard first as backup
    await copyToClipboard(formattedReport);

    // 2. Open WhatsApp with pre-filled text
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedReport)}`;
    window.open(waUrl, "_blank");

    setToastMessage("Laporan disalin. Membuka WhatsApp...");
    setToastType("success");
  };

  // Copy report only
  const handleCopyOnly = async () => {
    const success = await copyToClipboard(formattedReport);
    if (success) {
      setCopiedRecently(true);
      setToastMessage("Laporan berhasil disalin ke clipboard!");
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

  const selectedDayObj = DAYS_LIST.find((d) => d.index === selectedDayIndex);
  const selectedDayName = selectedDayObj ? selectedDayObj.name : "Senin";
  const isSelectedToday = selectedDayIndex === dateInfo.dayIndex;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* App Header */}
      <Header formattedDate={dateInfo.formattedDate} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-3.5 py-3 space-y-3.5 pb-28">
        {/* Compact PWA Install Banner */}
        <InstallPrompt />

        {/* Day Selector (7-Day Responsive Grid) */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CalendarDays className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                Jadwal: <strong className="text-blue-900">{selectedDayName}</strong>
                {isSelectedToday && (
                  <span className="ml-1 text-[11px] font-normal text-blue-700">
                    (Hari Ini)
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => handleCheckAllGlobal(!allGlobalCompleted)}
              className="text-blue-700 hover:text-blue-900 active:text-blue-950 font-medium flex items-center gap-1 touch-target text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{allGlobalCompleted ? "Batal Semua" : "Centang Semua"}</span>
            </button>
          </div>

          {/* 7 Columns Day Buttons */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {DAYS_LIST.map((d) => {
              const isSelected = selectedDayIndex === d.index;
              const isToday = dateInfo.dayIndex === d.index;
              return (
                <button
                  key={d.index}
                  onClick={() => handleSelectDay(d.index)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs transition-all touch-target min-h-[44px] ${
                    isSelected
                      ? "bg-blue-700 text-white font-bold shadow-2xs"
                      : isToday
                      ? "bg-blue-50 text-blue-900 border border-blue-200 font-semibold hover:bg-blue-100/70"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                  aria-label={`Pilih jadwal hari ${d.name}${isToday ? " (Hari ini)" : ""}`}
                >
                  <span className="sm:hidden text-xs">{d.shortName}</span>
                  <span className="hidden sm:inline text-xs">{d.name}</span>
                  {isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? "bg-white" : "bg-blue-600"
                      }`}
                      title="Hari Ini"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Area Checklist Cards */}
        <div className="space-y-3.5">
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

        {/* Format Preview Details */}
        <details className="bg-white rounded-xl border border-slate-200 p-3 text-xs text-slate-600 group">
          <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-2 select-none touch-target">
            <FileText className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Lihat Tampilan Format Teks WhatsApp</span>
          </summary>
          <pre className="mt-2.5 p-3 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-200/70">
            {formattedReport}
          </pre>
        </details>
      </main>

      {/* Sticky Bottom Actions Bar (Sleek & Compact) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-0.5">
            <span className="font-medium text-slate-700">
              Progres: <strong className="text-blue-900">{completedCount}/{totalTasks}</strong> ({percent}%)
            </span>
            <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Side-by-side Actions: Salin Teks + Kirim ke WhatsApp */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyOnly}
              className="py-2.5 px-3.5 rounded-xl font-semibold text-xs border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 touch-target"
              title="Salin format laporan ke clipboard"
            >
              {copiedRecently ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendToWhatsApp}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-all flex items-center justify-center gap-2 touch-target"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Kirim ke WhatsApp</span>
            </button>
          </div>
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
