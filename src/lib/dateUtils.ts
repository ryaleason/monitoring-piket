/**
 * Utilities for dates and times locked to Asia/Jakarta (WIB) timezone.
 */

const JAKARTA_TZ = "Asia/Jakarta";

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export interface JakartaDateInfo {
  dateString: string; // YYYY-MM-DD
  dayIndex: number; // 0 for Sunday ... 6 for Saturday
  dayName: string; // "Senin", "Selasa", dll.
  formattedDate: string; // "Senin, 16 November 2026"
  formattedTime: string; // "17:15"
  hours: number;
  minutes: number;
}

export function getJakartaDate(date: Date = new Date()): JakartaDateInfo {
  // Use Intl to extract components in Asia/Jakarta timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = partMap.year;
  const month = partMap.month;
  const day = partMap.day;
  const hour = partMap.hour === "24" ? "00" : partMap.hour;
  const minute = partMap.minute;

  const dateString = `${year}-${month}-${day}`;

  // Determine weekday in Jakarta:
  // Create an explicit Date representing midnight Jakarta for dayIndex
  const jakartaMid = new Date(`${year}-${month}-${day}T00:00:00Z`);
  const dayIndex = jakartaMid.getUTCDay();
  const dayName = DAY_NAMES[dayIndex];

  const monthIndex = parseInt(month, 10) - 1;
  const dayNumber = parseInt(day, 10);
  const formattedDate = `${dayName}, ${dayNumber} ${MONTH_NAMES[monthIndex]} ${year}`;
  const formattedTime = `${hour}:${minute}`;

  return {
    dateString,
    dayIndex,
    dayName,
    formattedDate,
    formattedTime,
    hours: parseInt(hour, 10),
    minutes: parseInt(minute, 10),
  };
}

export function isPastCutoff(cutoffTime: string, now: Date = new Date()): boolean {
  const [cutoffH, cutoffM] = cutoffTime.split(":").map((v) => parseInt(v, 10));
  const { hours, minutes } = getJakartaDate(now);

  const currentTotal = hours * 60 + minutes;
  const cutoffTotal = cutoffH * 60 + cutoffM;

  return currentTotal >= cutoffTotal;
}
