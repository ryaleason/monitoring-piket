export interface SeedArea {
  id: number;
  name: string;
  displayOrder: number;
  tasks: string[];
}

export const INITIAL_AREAS: SeedArea[] = [
  {
    id: 1,
    name: "Dapur",
    displayOrder: 1,
    tasks: [
      "Membersihkan dan merapikan area dapur.",
      "Membersihkan meja dan wastafel.",
      "Merapikan peralatan dapur dan makan.",
      "Menanak nasi.",
      "Membuang sampah.",
      "Memastikan dapur bersih dan rapi.",
    ],
  },
  {
    id: 2,
    name: "Lobby, Ruang Belajar, Halaman & Ruang Asrama",
    displayOrder: 2,
    tasks: [
      "Menyapu dan mengepel area ruang belajar dan lobby.",
      "Menata dan merapikan sepatu.",
      "Merapikan meja, kursi, dan fasilitas ruang belajar serta lobby.",
      "Menyapu dan membersihkan halaman.",
      "Membersihkan dan merapikan ruang asrama.",
      "Merapikan barang-barang yang berserakan.",
      "Mengumpulkan dan membuang sampah.",
      "Memastikan seluruh area bersih dan rapi.",
    ],
  },
  {
    id: 3,
    name: "Musala & Kamar Mandi",
    displayOrder: 3,
    tasks: [
      "Menyapu dan mengepel area musala.",
      "Membersihkan/menebahi karpet musala.",
      "Merapikan sajadah dan perlengkapan ibadah.",
      "Menata Al-Qur'an dan buku-buku keagamaan.",
      "Membersihkan area tempat wudu.",
      "Membersihkan dan menyikat kamar mandi area musala.",
      "Memastikan musala dan kamar mandi bersih, rapi, dan nyaman.",
    ],
  },
];

// Sample initial weekly schedule for 7 days (0: Minggu, 1: Senin, ..., 6: Sabtu)
export const INITIAL_SCHEDULE = [
  // 0: Minggu
  { dayOfWeek: 0, areaId: 1, assignee: "Zaid" },
  { dayOfWeek: 0, areaId: 2, assignee: "Umar" },
  { dayOfWeek: 0, areaId: 3, assignee: "Ali & Hasan" },
  // 1: Senin
  { dayOfWeek: 1, areaId: 1, assignee: "Ahmad" },
  { dayOfWeek: 1, areaId: 2, assignee: "Fulan" },
  { dayOfWeek: 1, areaId: 3, assignee: "Rakha & Ega" },
  // 2: Selasa
  { dayOfWeek: 2, areaId: 1, assignee: "Bilal" },
  { dayOfWeek: 2, areaId: 2, assignee: "Hamzah" },
  { dayOfWeek: 2, areaId: 3, assignee: "Salman & Zubair" },
  // 3: Rabu
  { dayOfWeek: 3, areaId: 1, assignee: "Tariq" },
  { dayOfWeek: 3, areaId: 2, assignee: "Khalid" },
  { dayOfWeek: 3, areaId: 3, assignee: "Usamah & Sa'ad" },
  // 4: Kamis
  { dayOfWeek: 4, areaId: 1, assignee: "Ibrahim" },
  { dayOfWeek: 4, areaId: 2, assignee: "Yusuf" },
  { dayOfWeek: 4, areaId: 3, assignee: "Yahya & Zakariya" },
  // 5: Jumat
  { dayOfWeek: 5, areaId: 1, assignee: "Ismail" },
  { dayOfWeek: 5, areaId: 2, assignee: "Ilyas" },
  { dayOfWeek: 5, areaId: 3, assignee: "Harun & Musa" },
  // 6: Sabtu
  { dayOfWeek: 6, areaId: 1, assignee: "Idris" },
  { dayOfWeek: 6, areaId: 2, assignee: "Dawud" },
  { dayOfWeek: 6, areaId: 3, assignee: "Sulaiman & Yunus" },
];

export const INITIAL_SETTINGS: Record<string, string> = {
  admin_pin: process.env.ADMIN_PIN || "1234",
  reminder_cutoff_time: process.env.REMINDER_CUTOFF_TIME || "20:00",
};
