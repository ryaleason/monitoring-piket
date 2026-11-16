"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ReminderBanner } from "@/components/ReminderBanner";
import { AreaCard } from "@/components/AreaCard";
import { ActionButtons } from "@/components/ActionButtons";
import { EditAssigneeModal } from "@/components/EditAssigneeModal";
import { Toast } from "@/components/Toast";
import { copyToClipboard } from "@/lib/clipboard";
import { AreaWithTasks, DailyData } from "@/lib/db";
import { RefreshCw, FileText } from "lucide-react";

interface DailyApiResponse extends DailyData {
  cutoffTime: string;
  isCutoffExceeded: boolean;
  formattedReport: string;
  todayWib: {
    formattedDate: string;
    formattedTime: string;
  };
}

export default function HomePage() {
  const [data, setData] = useState<DailyApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isCopying, setIsCopying] = useState(false);

  // Edit assignee modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    areaId: number;
    areaName: string;
    currentAssignee: string;
  }>({
    isOpen: false,
    areaId: 0,
    areaName: "",
    currentAssignee: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  const fetchDailyData = useCallback(async () => {
    try {
      const res = await fetch("/api/daily");
      if (!res.ok) throw new Error("Gagal mengambil data harian");
      const json: DailyApiResponse = await res.json();
      setData(json);
    } catch {
      showToast("Gagal memuat data piket", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  // Handle single task toggle
  const handleToggleTask = async (taskId: number, currentCompleted: boolean) => {
    if (!data) return;
    const newStatus = !currentCompleted;

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        areas: prev.areas.map((area) => ({
          ...area,
          tasks: area.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: newStatus } : task
          ),
        })),
      };
    });

    try {
      const res = await fetch("/api/daily/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          taskId,
          completed: newStatus,
        }),
      });
      if (!res.ok) throw new Error();
      // Silently refresh full report string in background
      const refreshed = await fetch(`/api/daily?date=${data.date}`);
      if (refreshed.ok) {
        const full = await refreshed.json();
        setData(full);
      }
    } catch {
      showToast("Gagal memperbarui status tugas", "error");
      fetchDailyData();
    }
  };

  // Handle check all tasks in area
  const handleCheckAll = async (areaId: number, completed: boolean) => {
    if (!data) return;

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        areas: prev.areas.map((area) =>
          area.id === areaId
            ? {
                ...area,
                tasks: area.tasks.map((t) => ({ ...t, completed })),
              }
            : area
        ),
      };
    });

    try {
      const res = await fetch("/api/daily/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          areaId,
          checkAll: true,
          completed,
        }),
      });
      if (!res.ok) throw new Error();

      const refreshed = await fetch(`/api/daily?date=${data.date}`);
      if (refreshed.ok) {
        const full = await refreshed.json();
        setData(full);
      }
    } catch {
      showToast("Gagal memperbarui semua tugas area", "error");
      fetchDailyData();
    }
  };

  // Handle save assignee
  const handleSaveAssignee = async (areaId: number, newAssignee: string) => {
    if (!data) return;

    try {
      const res = await fetch("/api/daily/assignee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          areaId,
          assignee: newAssignee,
        }),
      });
      if (!res.ok) throw new Error();

      showToast("Nama petugas berhasil diganti");
      const refreshed = await fetch(`/api/daily?date=${data.date}`);
      if (refreshed.ok) {
        const full = await refreshed.json();
        setData(full);
      }
    } catch {
      showToast("Gagal mengganti nama petugas", "error");
    }
  };

  // Handle toggle sent status
  const handleToggleSentStatus = async () => {
    if (!data) return;
    const newStatus = !data.isSent;

    try {
      const res = await fetch("/api/daily/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          isSent: newStatus,
        }),
      });
      if (!res.ok) throw new Error();

      setData((prev) => (prev ? { ...prev, isSent: newStatus, sentAt: newStatus ? new Date().toISOString() : null } : prev));
      showToast(
        newStatus
          ? "Laporan ditandai sudah dikirim ke grup!"
          : "Status laporan dikembalikan menjadi belum dikirim."
      );
    } catch {
      showToast("Gagal memperbarui status pengiriman", "error");
    }
  };

  // Handle copy report to clipboard
  const handleCopyReport = async () => {
    if (!data) return;
    setIsCopying(true);

    try {
      // Refresh latest formatted report string
      const res = await fetch(`/api/daily?date=${data.date}`);
      let reportText = data.formattedReport;
      if (res.ok) {
        const full = await res.json();
        setData(full);
        reportText = full.formattedReport;
      }

      const success = await copyToClipboard(reportText);
      if (success) {
        showToast("Laporan berhasil disalin ke clipboard!");
      } else {
        showToast("Gagal menyalin otomatis. Silakan salin manual.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menyalin laporan", "error");
    } finally {
      setIsCopying(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">
          Memuat data piket ITBS AL-Kautsar...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-sm font-medium text-rose-600 mb-3">
          Gagal terhubung ke database piket.
        </p>
        <button
          onClick={fetchDailyData}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const allTasks = data.areas.flatMap((a) => a.tasks);
  const totalCompleted = allTasks.filter((t) => t.completed).length;
  const totalTasks = allTasks.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* App Header */}
      <Header formattedDate={data.todayWib?.formattedDate || data.date} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4 pb-6">
        {/* Reminder Banner */}
        <ReminderBanner
          isSent={data.isSent}
          isCutoffExceeded={data.isCutoffExceeded}
          cutoffTime={data.cutoffTime || "20:00"}
          sentAt={data.sentAt}
          onMarkSent={handleToggleSentStatus}
        />

        {/* Areas Cards */}
        <div className="space-y-4">
          {data.areas.map((area: AreaWithTasks) => (
            <AreaCard
              key={area.id}
              area={area}
              onToggleTask={handleToggleTask}
              onCheckAll={handleCheckAll}
              onOpenEditAssignee={(areaId, areaName, currentAssignee) =>
                setEditModal({
                  isOpen: true,
                  areaId,
                  areaName,
                  currentAssignee,
                })
              }
            />
          ))}
        </div>

        {/* Preview Teks Laporan (Accordion/Collapsible info) */}
        <details className="bg-white rounded-xl border border-slate-200 p-3 text-xs text-slate-600 group">
          <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 select-none touch-target">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Lihat Tampilan Format Teks WhatsApp</span>
          </summary>
          <pre className="mt-3 p-3 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-100">
            {data.formattedReport}
          </pre>
        </details>
      </main>

      {/* Sticky Bottom Action Buttons */}
      <ActionButtons
        onCopyReport={handleCopyReport}
        onToggleSentStatus={handleToggleSentStatus}
        isSent={data.isSent}
        isCopying={isCopying}
        totalCompleted={totalCompleted}
        totalTasks={totalTasks}
      />

      {/* Modal Edit Nama Petugas Hari Ini */}
      <EditAssigneeModal
        isOpen={editModal.isOpen}
        areaId={editModal.areaId}
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
