import { describe, it, expect } from "vitest";
import { formatDailyReport, AreaReportData } from "@/lib/reportFormatter";

describe("reportFormatter", () => {
  it("formats report identically to PRD section 6 when all tasks are completed", () => {
    const areas: AreaReportData[] = [
      {
        areaNumber: 1,
        areaName: "Dapur",
        assigneeText: "Ahmad",
        tasks: [
          { text: "Membersihkan dan merapikan area dapur.", completed: true },
          { text: "Membersihkan meja dan wastafel.", completed: true },
          { text: "Merapikan peralatan dapur dan makan.", completed: true },
          { text: "Menanak nasi.", completed: true },
          { text: "Membuang sampah.", completed: true },
          { text: "Memastikan dapur bersih dan rapi.", completed: true },
        ],
      },
      {
        areaNumber: 2,
        areaName: "Lobby, Ruang Belajar, Halaman & Ruang Asrama",
        assigneeText: "Fulan",
        tasks: [
          { text: "Menyapu dan mengepel area ruang belajar dan lobby.", completed: true },
          { text: "Menata dan merapikan sepatu.", completed: true },
          { text: "Merapikan meja, kursi, dan fasilitas ruang belajar serta lobby.", completed: true },
          { text: "Menyapu dan membersihkan halaman.", completed: true },
          { text: "Membersihkan dan merapikan ruang asrama.", completed: true },
          { text: "Merapikan barang-barang yang berserakan.", completed: true },
          { text: "Mengumpulkan dan membuang sampah.", completed: true },
          { text: "Memastikan seluruh area bersih dan rapi.", completed: true },
        ],
      },
      {
        areaNumber: 3,
        areaName: "Musala & Kamar Mandi",
        assigneeText: "Rakha & Ega",
        tasks: [
          { text: "Menyapu dan mengepel area musala.", completed: true },
          { text: "Membersihkan/menebahi karpet musala.", completed: true },
          { text: "Merapikan sajadah dan perlengkapan ibadah.", completed: true },
          { text: "Menata Al-Qur'an dan buku-buku keagamaan.", completed: true },
          { text: "Membersihkan area tempat wudu.", completed: true },
          { text: "Membersihkan dan menyikat kamar mandi area musala.", completed: true },
          { text: "Memastikan musala dan kamar mandi bersih, rapi, dan nyaman.", completed: true },
        ],
      },
    ];

    const expected =
`List Piket Asrama & Musala

1. Dapur : Ahmad

Membersihkan dan merapikan area dapur. ✅
Membersihkan meja dan wastafel. ✅
Merapikan peralatan dapur dan makan. ✅
Menanak nasi. ✅
Membuang sampah. ✅
Memastikan dapur bersih dan rapi. ✅

2. Lobby, Ruang Belajar, Halaman & Ruang Asrama : Fulan

Menyapu dan mengepel area ruang belajar dan lobby. ✅
Menata dan merapikan sepatu. ✅
Merapikan meja, kursi, dan fasilitas ruang belajar serta lobby. ✅
Menyapu dan membersihkan halaman. ✅
Membersihkan dan merapikan ruang asrama. ✅
Merapikan barang-barang yang berserakan. ✅
Mengumpulkan dan membuang sampah. ✅
Memastikan seluruh area bersih dan rapi. ✅

3. Musala & Kamar Mandi : Rakha & Ega

Menyapu dan mengepel area musala. ✅
Membersihkan/menebahi karpet musala. ✅
Merapikan sajadah dan perlengkapan ibadah. ✅
Menata Al-Qur'an dan buku-buku keagamaan. ✅
Membersihkan area tempat wudu. ✅
Membersihkan dan menyikat kamar mandi area musala. ✅
Memastikan musala dan kamar mandi bersih, rapi, dan nyaman. ✅`;

    const actual = formatDailyReport(areas);
    expect(actual).toBe(expected);
  });

  it("marks uncompleted tasks with ❌ and maintains space before colon", () => {
    const areas: AreaReportData[] = [
      {
        areaNumber: 1,
        areaName: "Dapur",
        assigneeText: "Zaid",
        tasks: [
          { text: "Menanak nasi.", completed: true },
          { text: "Membuang sampah.", completed: false },
        ],
      },
    ];

    const expected =
`List Piket Asrama & Musala

1. Dapur : Zaid

Menanak nasi. ✅
Membuang sampah. ❌`;

    const actual = formatDailyReport(areas);
    expect(actual).toBe(expected);
  });
});
