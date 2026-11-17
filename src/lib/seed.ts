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

// Official weekly schedule for 7 days (0: Minggu, 1: Senin, ..., 6: Sabtu)
export const INITIAL_SCHEDULE = [
  // 0: Minggu
  { dayOfWeek: 0, areaId: 1, assignee: "Semua Santri" },
  { dayOfWeek: 0, areaId: 2, assignee: "Semua Santri" },
  { dayOfWeek: 0, areaId: 3, assignee: "Semua Santri" },
  // 1: Senin
  { dayOfWeek: 1, areaId: 1, assignee: "Gabrial" },
  { dayOfWeek: 1, areaId: 2, assignee: "Izal & Arman" },
  { dayOfWeek: 1, areaId: 3, assignee: "Ega & Rakha" },
  // 2: Selasa
  { dayOfWeek: 2, areaId: 1, assignee: "Akyas" },
  { dayOfWeek: 2, areaId: 2, assignee: "Hisyam, Ega & Evan" },
  { dayOfWeek: 2, areaId: 3, assignee: "Yasir & Hanif" },
  // 3: Rabu
  { dayOfWeek: 3, areaId: 1, assignee: "Rakha" },
  { dayOfWeek: 3, areaId: 2, assignee: "Yasir & Hanif" },
  { dayOfWeek: 3, areaId: 3, assignee: "Gabrial & Izal" },
  // 4: Kamis
  { dayOfWeek: 4, areaId: 1, assignee: "Arman" },
  { dayOfWeek: 4, areaId: 2, assignee: "Ashlah & Rakha" },
  { dayOfWeek: 4, areaId: 3, assignee: "Akyas & Hisyam" },
  // 5: Jumat
  { dayOfWeek: 5, areaId: 1, assignee: "Gabrial" },
  { dayOfWeek: 5, areaId: 2, assignee: "Akyas & Hisyam" },
  { dayOfWeek: 5, areaId: 3, assignee: "Yasir & Hanif" },
  // 6: Sabtu
  { dayOfWeek: 6, areaId: 1, assignee: "Izal" },
  { dayOfWeek: 6, areaId: 2, assignee: "Ashlah & Ega" },
  { dayOfWeek: 6, areaId: 3, assignee: "Evan & Arman" },
];

export const INITIAL_SETTINGS: Record<string, string> = {
  admin_pin: process.env.ADMIN_PIN || "1234",
  reminder_cutoff_time: process.env.REMINDER_CUTOFF_TIME || "20:00",
};
