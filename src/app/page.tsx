"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { AreaCard, TaskState, AssigneeItem } from "@/components/AreaCard";
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
  parseSantriNames,
  formatSantriNames,
  transferSantri,
} from "@/lib/schedule";
import { Copy, Check, Minus, Send, Calendar, Lock } from "lucide-react";

interface DayItem {
  index: number;
  name: string;
  shortName: string;
}

const DAYS_LIST: DayItem[] = [
  { index: 1, name: "Senin", shortName: "SEN" },
  { index: 2, name: "Selasa", shortName: "SEL" },
  { index: 3, name: "Rabu", shortName: "RAB" },
  { index: 4, name: "Kamis", shortName: "KAM" },
  { index: 5, name: "Jumat", shortName: "JUM" },
  { index: 6, name: "Sabtu", shortName: "SAB" },
  { index: 0, name: "Minggu", shortName: "MIN" },
];

/**
 * Menghitung tanggal ISO (YYYY-MM-DD) untuk hari yang dipilih dalam minggu berjalan.
 */
function getTargetDateStr(dayIndex: number, referenceDateStr: string): string {
  if (!referenceDateStr) return "";
  const [year, month, day] = referenceDateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  const curJsDay = d.getUTCDay();
  const curMonBased = curJsDay === 0 ? 7 : curJsDay;
  const targetMonBased = dayIndex === 0 ? 7 : dayIndex;
  const diff = targetMonBased - curMonBased;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split("T")[0];
}

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

  // Dynamic Dapur & Asrama/Lobby santri roster
  const [dayRoster, setDayRoster] = useState<{
    dapur: string[];
    lobby: string[];
  }>({
    dapur: ["Akyas"],
    lobby: ["Hisyam", "Ega", "Evan"],
  });

  // Optional manual override for Musala (Area 3 is fixed by default)
  const [customMusalaAssignee, setCustomMusalaAssignee] = useState<string | null>(null);

  // Checklist state: { [taskId]: boolean }
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({});

  // WhatsApp lock state: if report is sent, checklist is locked from edits
  const [isSent, setIsSent] = useState<boolean>(false);

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

  // Target date string for the selected day in this week
  const activeDateString = useMemo(() => {
    return getTargetDateStr(selectedDayIndex, dateInfo.dateString);
  }, [selectedDayIndex, dateInfo.dateString]);

  // 1. Initialize today's date in WIB
  useEffect(() => {
    const jakarta = getJakartaDate();
    setDateInfo({
      formattedDate: jakarta.formattedDate,
      dayIndex: jakarta.dayIndex,
      dateString: jakarta.dateString,
    });
    setSelectedDayIndex(jakarta.dayIndex);
  }, []);

  // 2. Active schedule default for the selected day
  const defaultSchedule = useMemo(() => {
    return (
      FIXED_DAILY_SCHEDULE[selectedDayIndex] || {
        dapur: "Petugas Dapur",
        lobby: "Petugas Lobby",
        musala: "Petugas Musala",
      }
    );
  }, [selectedDayIndex]);

  // Default lists for comparison
  const defaultDapurList = useMemo(
    () => parseSantriNames(defaultSchedule.dapur),
    [defaultSchedule]
  );
  const defaultLobbyList = useMemo(
    () => parseSantriNames(defaultSchedule.lobby),
    [defaultSchedule]
  );

  // Check if roster has been modified from the default
  const isRosterModified = useMemo(() => {
    return (
      JSON.stringify(dayRoster.dapur) !== JSON.stringify(defaultDapurList) ||
      JSON.stringify(dayRoster.lobby) !== JSON.stringify(defaultLobbyList) ||
      customMusalaAssignee !== null
    );
  }, [dayRoster, defaultDapurList, defaultLobbyList, customMusalaAssignee]);

  // Fetch daily data from database whenever active date changes
  const loadDailyData = useCallback(
    async (dateStr: string, dayIdx: number) => {
      if (!dateStr) return;
      try {
        const res = await fetch(`/api/daily?date=${dateStr}`);
        if (!res.ok) return;
        const data = await res.json();

        // Update locked status
        setIsSent(Boolean(data.isSent));

        // Update task checks
        if (data.taskChecks) {
          setTaskChecks(data.taskChecks);
        } else {
          setTaskChecks({});
        }

        // Update roster from DB if available and has valid names
        if (
          data.dayRoster?.dapur &&
          data.dayRoster.dapur.length > 0 &&
          !data.dayRoster.dapur.includes("Petugas")
        ) {
          setDayRoster({
            dapur: data.dayRoster.dapur,
            lobby: data.dayRoster.lobby || [],
          });
        } else {
          const schedule = FIXED_DAILY_SCHEDULE[dayIdx] || {
            dapur: "Petugas Dapur",
            lobby: "Petugas Lobby",
            musala: "Petugas Musala",
          };
          setDayRoster({
            dapur: parseSantriNames(schedule.dapur),
            lobby: parseSantriNames(schedule.lobby),
          });
        }

        if (data.customMusalaAssignee) {
          setCustomMusalaAssignee(data.customMusalaAssignee);
        } else {
          setCustomMusalaAssignee(null);
        }
      } catch (err) {
        console.error("Gagal memuat data dari database:", err);
      }
    },
    []
  );

  // Effect to load data when activeDateString is available
  useEffect(() => {
    if (activeDateString) {
      loadDailyData(activeDateString, selectedDayIndex);
    }
  }, [activeDateString, selectedDayIndex, loadDailyData]);

  // Determine effective assignee per area
  const getAssigneeForArea = (areaId: number): string => {
    if (areaId === 1) return formatSantriNames(dayRoster.dapur);
    if (areaId === 2) return formatSantriNames(dayRoster.lobby);
    if (areaId === 3) return customMusalaAssignee ?? defaultSchedule.musala;
    return "";
  };

  // Day switch handler
  const handleSelectDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
  };

  // 1-Tap Move Santri between Dapur and Asrama
  const handleAddHelper = async (name: string, toArea: 1 | 2) => {
    if (isSent) {
      setToastMessage("Laporan sudah terkunci dan tidak dapat diubah.");
      setToastType("error");
      return;
    }

    const updated = transferSantri(dayRoster, name, toArea === 1 ? "dapur" : "lobby");
    setDayRoster(updated);

    setToastMessage(
      toArea === 1
        ? `${name} pindah membantu di Dapur`
        : `${name} pindah membantu di Asrama`
    );
    setToastType("success");

    // Persist to database
    if (activeDateString) {
      try {
        const res = await fetch("/api/daily/assignee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            roster: {
              dapur: updated.dapur,
              lobby: updated.lobby,
            },
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          if (res.status === 403) {
            setIsSent(true);
            setToastMessage("Laporan sudah terkirim ke WhatsApp dan terkunci.");
            setToastType("error");
            loadDailyData(activeDateString, selectedDayIndex);
          } else {
            console.error("Failed to save roster:", errData.error);
          }
        }
      } catch (e) {
        console.error("Error saving roster:", e);
      }
    }
  };

  const handleRemoveHelper = async (name: string, fromArea: 1 | 2) => {
    if (isSent) {
      setToastMessage("Laporan sudah terkunci dan tidak dapat diubah.");
      setToastType("error");
      return;
    }

    const updated = transferSantri(dayRoster, name, fromArea === 1 ? "lobby" : "dapur");
    setDayRoster(updated);

    setToastMessage(
      fromArea === 1
        ? `${name} dikembalikan ke Asrama`
        : `${name} dikembalikan ke Dapur`
    );
    setToastType("success");

    // Persist to database
    if (activeDateString) {
      try {
        const res = await fetch("/api/daily/assignee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            roster: {
              dapur: updated.dapur,
              lobby: updated.lobby,
            },
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          if (res.status === 403) {
            setIsSent(true);
            setToastMessage("Laporan sudah terkirim ke WhatsApp dan terkunci.");
            setToastType("error");
            loadDailyData(activeDateString, selectedDayIndex);
          } else {
            console.error("Failed to save roster:", errData.error);
          }
        }
      } catch (e) {
        console.error("Error saving roster:", e);
      }
    }
  };

  const handleResetRoster = async () => {
    if (isSent) {
      setToastMessage("Laporan sudah terkunci dan tidak dapat diubah.");
      setToastType("error");
      return;
    }

    const resetRoster = {
      dapur: [...defaultDapurList],
      lobby: [...defaultLobbyList],
    };
    setDayRoster(resetRoster);
    setCustomMusalaAssignee(null);
    setToastMessage("Jadwal petugas dikembalikan ke jadwal resmi");
    setToastType("success");

    if (activeDateString) {
      try {
        await fetch("/api/daily/assignee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            roster: {
              dapur: resetRoster.dapur,
              lobby: resetRoster.lobby,
              musala: defaultSchedule.musala,
            },
          }),
        });
      } catch (e) {
        console.error("Error resetting roster:", e);
      }
    }
  };

  // Toggle single task check
  const handleToggleTask = async (taskId: string) => {
    if (isSent) {
      setToastMessage("Ceklist terkunci karena laporan sudah terkirim ke WhatsApp.");
      setToastType("error");
      return;
    }

    const nextState = !taskChecks[taskId];
    setTaskChecks((prev) => ({ ...prev, [taskId]: nextState }));

    if (activeDateString) {
      try {
        const res = await fetch("/api/daily/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            taskId,
            completed: nextState,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          if (res.status === 403) {
            setIsSent(true);
            setToastMessage("Ceklist terkunci karena laporan sudah terkirim.");
            setToastType("error");
            loadDailyData(activeDateString, selectedDayIndex);
          }
        }
      } catch (e) {
        console.error("Error updating check:", e);
      }
    }
  };

  // Check all tasks in an area
  const handleCheckAllArea = async (area: AreaDefinition, completed: boolean) => {
    if (isSent) {
      setToastMessage("Ceklist terkunci karena laporan sudah terkirim ke WhatsApp.");
      setToastType("error");
      return;
    }

    setTaskChecks((prev) => {
      const updated = { ...prev };
      area.tasks.forEach((t) => {
        updated[t.id] = completed;
      });
      return updated;
    });

    if (activeDateString) {
      try {
        const res = await fetch("/api/daily/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            areaId: area.id,
            checkAll: true,
            completed,
          }),
        });
        if (!res.ok && res.status === 403) {
          setIsSent(true);
          setToastMessage("Ceklist terkunci karena laporan sudah terkirim.");
          setToastType("error");
          loadDailyData(activeDateString, selectedDayIndex);
        }
      } catch (e) {
        console.error("Error checking all in area:", e);
      }
    }
  };

  // Check all tasks globally
  const handleCheckAllGlobal = async (completed: boolean) => {
    if (isSent) {
      setToastMessage("Ceklist terkunci karena laporan sudah terkirim ke WhatsApp.");
      setToastType("error");
      return;
    }

    const updated: Record<string, boolean> = { ...taskChecks };
    DEFAULT_PIKET_AREAS.forEach((area) => {
      area.tasks.forEach((t) => {
        updated[t.id] = completed;
      });
    });
    setTaskChecks(updated);

    if (activeDateString) {
      try {
        const res = await fetch("/api/daily/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            checks: updated,
          }),
        });
        if (!res.ok && res.status === 403) {
          setIsSent(true);
          setToastMessage("Ceklist terkunci karena laporan sudah terkirim.");
          setToastType("error");
          loadDailyData(activeDateString, selectedDayIndex);
        }
      } catch (e) {
        console.error("Error checking all globally:", e);
      }
    }
  };

  // Save modified assignee from manual modal
  const handleSaveAssignee = async (newAssignee: string) => {
    if (isSent) {
      setToastMessage("Laporan sudah terkunci dan tidak dapat diubah.");
      setToastType("error");
      return;
    }

    const targetArea = editModal.areaNumber;
    if (targetArea === 1) {
      setDayRoster((prev) => ({
        ...prev,
        dapur: parseSantriNames(newAssignee),
      }));
    } else if (targetArea === 2) {
      setDayRoster((prev) => ({
        ...prev,
        lobby: parseSantriNames(newAssignee),
      }));
    } else if (targetArea === 3) {
      setCustomMusalaAssignee(newAssignee);
    }

    setToastMessage(`Petugas Area ${targetArea} diperbarui`);
    setToastType("success");

    if (activeDateString) {
      try {
        await fetch("/api/daily/assignee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            areaId: targetArea,
            assignee: newAssignee,
          }),
        });
      } catch (e) {
        console.error("Error saving manual assignee:", e);
      }
    }
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
  }, [dayRoster, defaultSchedule, customMusalaAssignee, taskChecks]);

  // Send to WhatsApp & Lock in Database
  const handleSendToWhatsApp = async () => {
    // 1. Copy report text to clipboard
    await copyToClipboard(formattedReport);

    // 2. Lock the report in database
    if (activeDateString) {
      try {
        await fetch("/api/daily/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: activeDateString,
            isSent: true,
          }),
        });
        setIsSent(true);
      } catch (e) {
        console.error("Error setting report sent status:", e);
      }
    }

    // 3. Open WhatsApp
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedReport)}`;
    window.open(waUrl, "_blank");

    setToastMessage("Laporan disalin & ceklist terkunci. Membuka WhatsApp...");
    setToastType("success");
  };

  // Copy report only (always functional, even when locked!)
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
  const hasSomeGlobalCompleted = completedCount > 0 && !allGlobalCompleted;

  const selectedDayObj = DAYS_LIST.find((d) => d.index === selectedDayIndex);
  const selectedDayName = selectedDayObj ? selectedDayObj.name : "Senin";
  const isSelectedToday = selectedDayIndex === dateInfo.dayIndex;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      {/* App Header */}
      <Header formattedDate={dateInfo.formattedDate} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-3.5 space-y-4 pb-32">
        {/* Compact PWA Install Banner */}
        <InstallPrompt />

        {/* Lock Banner when report has been sent to WhatsApp */}
        {isSent && (
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-bold text-emerald-950">
                  Laporan Terkirim ke WhatsApp (Terkunci)
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-full">
                  Final
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                Ceklist dan petugas untuk hari ini sudah terkirim ke grup dan tidak dapat diubah lagi. Anda tetap dapat menyalin teks laporan menggunakan tombol di bawah.
              </p>
            </div>
          </div>
        )}

        {/* Day Selector (Artisanal Calendar Strip in Royal Blue) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600 font-medium">Jadwal:</span>
              <span className="font-bold text-blue-950">{selectedDayName}</span>
              {isSelectedToday && (
                <span className="text-[10px] font-semibold px-2 py-0.5 text-slate-400 rounded-full">
                  Hari Ini
                </span>
              )}
            </div>
            {/* Global Check All Checkbox Button (Icon Only - Anti-Slop) */}
            <button
              type="button"
              disabled={isSent}
              onClick={() => !isSent && handleCheckAllGlobal(!allGlobalCompleted)}
              className={`p-1 rounded-lg transition-colors touch-target flex items-center justify-center ${
                isSent
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : "text-slate-500 hover:text-blue-700 hover:bg-blue-100/60 active:bg-blue-200/60"
              }`}
              title={
                isSent
                  ? "Ceklist terkunci (laporan sudah dikirim)"
                  : allGlobalCompleted
                  ? "Batalkan semua tugas hari ini"
                  : "Centang semua tugas hari ini"
              }
              aria-label={
                allGlobalCompleted
                  ? "Batalkan semua tugas hari ini"
                  : "Centang semua tugas hari ini"
              }
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  allGlobalCompleted
                    ? "bg-blue-600 text-white shadow-2xs"
                    : hasSomeGlobalCompleted
                    ? "bg-blue-50 border-2 border-blue-600 text-blue-600"
                    : "border-2 border-slate-300 bg-white hover:border-blue-500"
                }`}
              >
                {allGlobalCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : hasSomeGlobalCompleted ? (
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                ) : null}
              </div>
            </button>
          </div>

          {/* 7 Columns Minimalist Strip */}
          <div className="grid grid-cols-7 gap-1 bg-blue-50/60 p-1 rounded-xl">
            {DAYS_LIST.map((d) => {
              const isSelected = selectedDayIndex === d.index;
              const isToday = dateInfo.dayIndex === d.index;
              return (
                <button
                  key={d.index}
                  onClick={() => handleSelectDay(d.index)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs transition-all touch-target min-h-[44px] ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : isToday
                      ? "bg-white text-blue-900 font-semibold shadow-2xs border border-blue-200/80"
                      : "text-slate-600 hover:text-blue-700 hover:bg-white/60"
                  }`}
                  aria-label={`Jadwal hari ${d.name}`}
                >
                  <span className="text-[11px] font-bold tracking-tight">{d.shortName}</span>
                  {isToday && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isSelected ? "bg-white" : "bg-blue-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Area Checklist Cards with Solusi 2 (Arah Pindah Jelas) */}
        <div className="space-y-4">
          {DEFAULT_PIKET_AREAS.map((area) => {
            const areaTasks: TaskState[] = area.tasks.map((t) => ({
              id: t.id,
              text: t.text,
              completed: Boolean(taskChecks[t.id]),
            }));
            const currentAssignee = getAssigneeForArea(area.id);

            let assigneeItems: AssigneeItem[] | undefined;
            let canTransferToOtherArea: boolean | undefined;
            let transferActionLabel: string | undefined;
            let onTransferPerson: ((name: string) => void) | undefined;
            let onReturnPerson: ((name: string) => void) | undefined;

            const isSunday = selectedDayIndex === 0;

            if (!isSunday) {
              if (area.id === 1) {
                // Area 1: Dapur
                assigneeItems = dayRoster.dapur.map((name) => ({
                  name,
                  isGuest: !defaultDapurList.includes(name), // true if transferred from Asrama
                }));
                // If a guest (e.g. Hisyam or Evan) is in Dapur, onReturnPerson returns him to Asrama
                onReturnPerson = (name: string) => handleRemoveHelper(name, 1);

                // Default santri in Dapur (e.g. Gabrial or Akyas) can also transfer to help Asrama
                canTransferToOtherArea = true;
                transferActionLabel = "Bantu Asrama";
                onTransferPerson = (name: string) => handleAddHelper(name, 2);
              } else if (area.id === 2) {
                // Area 2: Lobby & Asrama
                assigneeItems = dayRoster.lobby.map((name) => ({
                  name,
                  isGuest: !defaultLobbyList.includes(name), // true if transferred from Dapur
                }));
                // Default santri in Asrama (e.g. Hisyam, Ega, Evan) have "Bantu Dapur" button!
                canTransferToOtherArea = true;
                transferActionLabel = "Bantu Dapur";
                onTransferPerson = (name: string) => handleAddHelper(name, 1);

                // If someone is a guest from Dapur
                onReturnPerson = (name: string) => handleRemoveHelper(name, 2);
              }
            }

            return (
              <AreaCard
                key={area.id}
                areaNumber={area.id}
                areaName={area.name}
                assignee={currentAssignee}
                assigneeItems={assigneeItems}
                canTransferToOtherArea={canTransferToOtherArea}
                transferActionLabel={transferActionLabel}
                onTransferPerson={onTransferPerson}
                onReturnPerson={onReturnPerson}
                onResetAssignee={handleResetRoster}
                isModified={isRosterModified}
                isFixedSchedule={area.id === 3}
                isLocked={isSent}
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
      </main>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-slate-600 font-medium">
              Progres Selesai: <strong className="text-blue-950">{completedCount}/{totalTasks}</strong> ({percent}%)
            </span>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons: "Salin Teks" always functional, WhatsApp button triggers lock and opens WhatsApp */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyOnly}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-900 border border-blue-200/80 transition-colors flex items-center justify-center gap-1.5 shrink-0 touch-target"
              title="Salin format laporan ke clipboard (selalu aktif)"
            >
              {copiedRecently ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-700" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendToWhatsApp}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white shadow-xs transition-all flex items-center justify-center gap-2 touch-target ${
                isSent
                  ? "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900"
                  : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
              }`}
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{isSent ? "Buka di WhatsApp" : "Kirim ke WhatsApp"}</span>
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
