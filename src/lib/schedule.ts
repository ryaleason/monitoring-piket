/**
 * Jadwal Piket Santri ITBS Al Kautsar (Jadwal Tetap Harian)
 * Berdasarkan dokumen resmi jadwal piket asrama & musala.
 */

export interface DayPiketSchedule {
  dapur: string;
  lobby: string;
  musala: string;
}

export const FIXED_DAILY_SCHEDULE: Record<number, DayPiketSchedule> = {
  // 1: Senin
  1: {
    dapur: "Gabrial",
    lobby: "Izal & Arman",
    musala: "Ega & Rakha",
  },
  // 2: Selasa
  2: {
    dapur: "Akyas",
    lobby: "Hisyam, Ega & Evan",
    musala: "Yasir & Hanif",
  },
  // 3: Rabu
  3: {
    dapur: "Rakha",
    lobby: "Yasir & Hanif",
    musala: "Gabrial & Izal",
  },
  // 4: Kamis
  4: {
    dapur: "Arman",
    lobby: "Ashlah & Rakha",
    musala: "Akyas & Hisyam",
  },
  // 5: Jumat
  5: {
    dapur: "Gabrial",
    lobby: "Akyas & Hisyam",
    musala: "Yasir & Hanif",
  },
  // 6: Sabtu
  6: {
    dapur: "Izal",
    lobby: "Ashlah & Ega",
    musala: "Evan & Arman",
  },
  // 0: Minggu (Piket Mingguan / Kerja Bakti Bersama)
  0: {
    dapur: "Semua Santri",
    lobby: "Semua Santri",
    musala: "Semua Santri",
  },
};

/**
 * Memecah string daftar nama santri menjadi array nama.
 * Contoh: "Hisyam & Ega" -> ["Hisyam", "Ega"]
 *         "Gabrial, Izal & Arman" -> ["Gabrial", "Izal", "Arman"]
 */
export function parseSantriNames(text: string): string[] {
  if (!text || text.trim() === "") return [];
  if (text.trim() === "Semua Santri") return ["Semua Santri"];
  return text
    .split(/[,&]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Menggabungkan array nama santri menjadi format bahasa Indonesia natural.
 * Contoh: ["Akyas"] -> "Akyas"
 *         ["Akyas", "Hisyam"] -> "Akyas & Hisyam"
 *         ["Akyas", "Hisyam", "Ega"] -> "Akyas, Hisyam & Ega"
 */
export function formatSantriNames(names: string[]): string {
  if (!names || names.length === 0) return "Belum ditentukan";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  const last = names[names.length - 1];
  const rest = names.slice(0, -1).join(", ");
  return `${rest} & ${last}`;
}

/**
 * Memindahkan santri antara Dapur (Area 1) dan Asrama/Lobby (Area 2).
 */
export function transferSantri(
  current: { dapur: string[]; lobby: string[] },
  name: string,
  toArea: "dapur" | "lobby"
): { dapur: string[]; lobby: string[] } {
  let newDapur = [...current.dapur];
  let newLobby = [...current.lobby];

  if (toArea === "dapur") {
    newLobby = newLobby.filter((n) => n !== name);
    if (!newDapur.includes(name)) {
      newDapur.push(name);
    }
  } else {
    newDapur = newDapur.filter((n) => n !== name);
    if (!newLobby.includes(name)) {
      newLobby.push(name);
    }
  }

  return { dapur: newDapur, lobby: newLobby };
}

export interface TaskDefinition {
  id: string;
  text: string;
}

export interface AreaDefinition {
  id: number;
  name: string;
  tasks: TaskDefinition[];
}

export const DEFAULT_PIKET_AREAS: AreaDefinition[] = [
  {
    id: 1,
    name: "Dapur",
    tasks: [
      { id: "dapur-1", text: "Membersihkan dan merapikan area dapur." },
      { id: "dapur-2", text: "Membersihkan meja dan wastafel." },
      { id: "dapur-3", text: "Merapikan peralatan dapur dan makan." },
      { id: "dapur-4", text: "Menanak nasi." },
      { id: "dapur-5", text: "Membuang sampah." },
      { id: "dapur-6", text: "Memastikan dapur bersih dan rapi." },
    ],
  },
  {
    id: 2,
    name: "Lobby, Ruang Belajar, Halaman & Ruang Asrama",
    tasks: [
      { id: "lobby-1", text: "Menyapu dan mengepel area ruang belajar dan lobby." },
      { id: "lobby-2", text: "Menata dan merapikan sepatu." },
      { id: "lobby-3", text: "Merapikan meja, kursi, dan fasilitas ruang belajar serta lobby." },
      { id: "lobby-4", text: "Menyapu dan membersihkan halaman." },
      { id: "lobby-5", text: "Membersihkan dan merapikan ruang asrama." },
      { id: "lobby-6", text: "Merapikan barang-barang yang berserakan." },
      { id: "lobby-7", text: "Mengumpulkan dan membuang sampah." },
      { id: "lobby-8", text: "Memastikan seluruh area bersih dan rapi." },
    ],
  },
  {
    id: 3,
    name: "Musala & Kamar Mandi",
    tasks: [
      { id: "musala-1", text: "Menyapu dan mengepel area musala." },
      { id: "musala-2", text: "Membersihkan/menebahi karpet musala." },
      { id: "musala-3", text: "Merapikan sajadah dan perlengkapan ibadah." },
      { id: "musala-4", text: "Menata Al-Qur'an dan buku-buku keagamaan." },
      { id: "musala-5", text: "Membersihkan area tempat wudu." },
      { id: "musala-6", text: "Membersihkan dan menyikat kamar mandi area musala." },
      { id: "musala-7", text: "Memastikan musala dan kamar mandi bersih, rapi, dan nyaman." },
    ],
  },
];
