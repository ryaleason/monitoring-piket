# ITBS AL- Kautsar - Monitoring Piket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web mobile-first "ITBS AL- Kautsar - Monitoring piket" untuk pencatatan piket harian santri, penyalin laporan otomatis berformat persis WhatsApp ke grup Mentoring ITBS, sistem pengingat batas waktu pengiriman harian (WIB), serta manajemen jadwal mingguan dan tugas terlindungi PIN bersama.

**Architecture:** Next.js (App Router) dengan TypeScript dan Tailwind CSS menggunakan palet warna biru dan putih. Layer persistensi menggunakan SQLite (`node:sqlite` bawaan Node 22+) untuk database lokal terpusat yang ringan, cepat, dan tanpa dependensi eksternal. Logika penyusunan teks laporan dipisahkan sebagai pure function yang diverifikasi dengan unit test Vitest terhadap spesifikasi WAJIB identik dari PRD.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, `node:sqlite`, Vitest (testing).

**Spec:** [PRD & Rules — Piket Tracker Asrama & Musala.md](file:///home/ryaleason/Projects/My%20Project/monitoring-piket/PRD%20&%20Rules%20—%20Piket%20Tracker%20Asrama%20&%20Musala.md)

## Global Constraints

- Judul aplikasi: `ITBS AL- Kautsar - Monitoring piket`.
- Palet warna: Biru dan Putih (Primary blue `#1d4ed8` / `#2563eb`, latar putih `#ffffff`, aksen biru lembut `#eff6ff`, slate dark `#0f172a` untuk kontras tinggi).
- Format laporan: Teks murni tanpa markdown, judul "List Piket Asrama & Musala", satu spasi sebelum titik dua pada header area (`1. Dapur : [Nama]`), tugas selesai diakhiri ` ✅`, belum selesai diakhiri ` ❌`, dua nama digabung dengan ` & `.
- Zona waktu: Seluruh penanggalan, perhitungan hari (0=Minggu s.d. 6=Sabtu / Senin-Minggu), dan jam batas pengingat mutlak menggunakan zona waktu `Asia/Jakarta` (WIB).
- Aksesibilitas HP: Mobile-first, ukuran target sentuh minimal 44px (`min-h-[44px] min-w-[44px]`).
- Clipboard: `navigator.clipboard.writeText` dengan fallback `document.execCommand('copy')` untuk browser HP lama.
- Proteksi Admin: Pengaturan jadwal, tugas, dan jam batas dilindungi verifikasi satu PIN bersama (default: `1234` atau via `ADMIN_PIN`).
- Bahasa UI: Seluruh antarmuka menggunakan bahasa Indonesia yang ringkas dan jelas.
- Desain: Bebas tampilan generik AI (tanpa gradasi ungu-biru, tanpa kartu berbayang berlebihan, tanpa emoji dekoratif liar).

## Review Focus

1. **Format teks laporan persis sama hingga ke spasi dan baris kosong**: Spasi sebelum titik dua (`1. Dapur : Nama`), dua baris baru antar-area, dan simbol status `✅` / `❌`.
   - *Test:* `tests/reportFormatter.test.ts` membandingkan string output secara verbatim terhadap contoh PRD bagian 6.
2. **Perhitungan hari dan batas jam saat pergantian hari di zona WIB**: Menghindari bug UTC offset di mana jam 00:00 - 06:59 WIB masih dianggap hari sebelumnya jika server menggunakan UTC.
   - *Test:* `tests/dateUtils.test.ts` menguji fungsi waktu WIB pada jam-jam rawan (misal 00:15 WIB dan 23:45 WIB).
3. **Penggantian nama petugas harian tidak boleh mengubah jadwal mingguan**: Mengedit nama di kartu Hari Ini hanya tersimpan di `daily_assignments`, bukan `weekly_schedule`.
   - *Test:* `tests/db.test.ts` memastikan edit nama hari ini tidak memodifikasi row `weekly_schedule`.
4. **Fallback clipboard saat izin clipboard ditolak atau di browser HP tanpa HTTPS**: Penyalinan laporan tetap berhasil dengan fallback textarea `execCommand`.
   - *Test:* `tests/clipboard.test.ts` memverifikasi mekanisme fallback ketika `navigator.clipboard` undefined/reject.
5. **Idempotensi checklist dan inisialisasi tanggal harian**: Membuka tanggal baru otomatis meng-clone jadwal mingguan ke `daily_assignments` tanpa menduplikasi data jika dibuka bersamaan.
   - *Test:* `tests/db.test.ts` menguji pemanggilan ganda `getOrCreateDailyReport(date)`.

---

### Task 1: Scaffolding Project & Environment Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `.env.example`, `.env.local`
- Create: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: None
- Produces: Project environment Next.js + Tailwind (palette blue-white) + Vitest runner.

- [ ] **Step 1: Inisialisasi Git repository dan .gitignore**
- [ ] **Step 2: Setup package.json, TypeScript, Tailwind CSS, Lucide React, dan Vitest**
- [ ] **Step 3: Setup styling palet biru-putih dan font di `src/app/globals.css`**
- [ ] **Step 4: Tulis test awal di `tests/setup.test.ts` dan jalankan vitest**
- [ ] **Step 5: Jalankan `npm test` dan pastikan PASS**
- [ ] **Step 6: Commit**
  ```bash
  git add .
  git commit -m "chore: scaffold project with nextjs, tailwind, vitest and blue-white palette"
  ```

---

### Task 2: Utility Tanggal WIB & Pure Report Formatter

**Files:**
- Create: `src/lib/dateUtils.ts`
- Create: `src/lib/reportFormatter.ts`
- Test: `tests/dateUtils.test.ts`
- Test: `tests/reportFormatter.test.ts`

**Interfaces:**
- Consumes: Raw area tasks, assignees, checklist status.
- Produces:
  ```typescript
  export interface AreaReportData {
    areaNumber: number;
    areaName: string;
    assigneeText: string;
    tasks: { text: string; completed: boolean }[];
  }
  export function formatDailyReport(areas: AreaReportData[]): string;
  export function getJakartaDate(): { dateString: string; dayIndex: number; formattedDate: string; formattedTime: string };
  export function isPastCutoff(cutoffTime: string): boolean;
  ```

- [ ] **Step 1: Tulis failing test untuk dateUtils dan reportFormatter**
  Uji output verbatim terhadap PRD Bagian 6 (termasuk spasi sebelum titik dua dan baris kosong).
- [ ] **Step 2: Jalankan test dan pastikan FAIL**
- [ ] **Step 3: Implementasi `src/lib/dateUtils.ts` (Asia/Jakarta timezone) dan `src/lib/reportFormatter.ts`**
- [ ] **Step 4: Jalankan test dan pastikan PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/ tests/
  git commit -m "feat: implement WIB date helpers and pure WhatsApp report formatter with tests"
  ```

---

### Task 3: Database Layer & Seed Data (node:sqlite)

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/seed.ts`
- Test: `tests/db.test.ts`

**Interfaces:**
- Consumes: SQLite engine via `node:sqlite`.
- Produces:
  ```typescript
  export function getDb(): DatabaseSync;
  export function getOrCreateDailyData(dateStr: string): DailyData;
  export function toggleTaskCheck(dateStr: string, taskId: number, completed: boolean): void;
  export function checkAllTasks(dateStr: string, areaId: number, completed: boolean): void;
  export function updateDailyAssignee(dateStr: string, areaId: number, assignee: string): void;
  export function setReportSentStatus(dateStr: string, isSent: boolean): void;
  export function getWeeklySchedule(): WeeklyScheduleItem[];
  export function updateWeeklySchedule(schedule: { dayOfWeek: number; areaId: number; assignee: string }[]): void;
  export function getTasksByArea(): AreaWithTasks[];
  export function saveTask(task: { id?: number; areaId: number; text: string; displayOrder: number; active: boolean }): void;
  export function deleteTask(taskId: number): void;
  export function getSettings(): Record<string, string>;
  export function updateSetting(key: string, value: string): void;
  ```

- [ ] **Step 1: Tulis test untuk schema, seeding default 3 area & 21 task, dan query daily data di `tests/db.test.ts`**
- [ ] **Step 2: Jalankan test dan pastikan FAIL**
- [ ] **Step 3: Implementasikan schema table dan query repository di `src/lib/db.ts` & seeding di `src/lib/seed.ts`**
- [ ] **Step 4: Jalankan test dan pastikan PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/db.ts src/lib/seed.ts tests/db.test.ts
  git commit -m "feat: implement sqlite repository and initial seed data for areas and tasks"
  ```

---

### Task 4: API Routes & Server Actions

**Files:**
- Create: `src/app/api/daily/route.ts`
- Create: `src/app/api/daily/check/route.ts`
- Create: `src/app/api/daily/assignee/route.ts`
- Create: `src/app/api/daily/status/route.ts`
- Create: `src/app/api/admin/schedule/route.ts`
- Create: `src/app/api/admin/tasks/route.ts`
- Create: `src/app/api/admin/settings/route.ts`
- Create: `src/app/api/admin/auth/route.ts`
- Test: `tests/api.test.ts`

**Interfaces:**
- Consumes: `src/lib/db.ts`, `src/lib/reportFormatter.ts`
- Produces: REST endpoints untuk update checklist, penggantian nama petugas, status terkirim, serta verifikasi PIN admin.

- [ ] **Step 1: Tulis test untuk API routes di `tests/api.test.ts`**
- [ ] **Step 2: Jalankan test dan pastikan FAIL**
- [ ] **Step 3: Implementasikan API routes untuk operasional harian dan admin**
- [ ] **Step 4: Jalankan test dan pastikan PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/app/api/ tests/api.test.ts
  git commit -m "feat: implement API endpoints for daily checklist and admin management"
  ```

---

### Task 5: Komponen Clipboard & Feedback Toast

**Files:**
- Create: `src/lib/clipboard.ts`
- Create: `src/components/Toast.tsx`
- Test: `tests/clipboard.test.ts`

**Interfaces:**
- Consumes: String text to copy.
- Produces:
  ```typescript
  export async function copyToClipboard(text: string): Promise<boolean>;
  ```

- [ ] **Step 1: Tulis test unit untuk copyToClipboard di `tests/clipboard.test.ts`**
- [ ] **Step 2: Jalankan test dan pastikan FAIL**
- [ ] **Step 3: Implementasikan `src/lib/clipboard.ts` dengan fallback textarea dan komponen `Toast.tsx`**
- [ ] **Step 4: Jalankan test dan pastikan PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/clipboard.ts src/components/Toast.tsx tests/clipboard.test.ts
  git commit -m "feat: implement robust clipboard copy with fallback and toast feedback"
  ```

---

### Task 6: Tampilan Utama Hari Ini (Mobile-First Blue-White UI)

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/ReminderBanner.tsx`
- Create: `src/components/AreaCard.tsx`
- Create: `src/components/ActionButtons.tsx`
- Create: `src/components/EditAssigneeModal.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: DailyData dari API `/api/daily`, `copyToClipboard`, `formatDailyReport`.
- Produces: Halaman muka utama yang memuat:
  1. Header judul `ITBS AL- Kautsar - Monitoring piket` dan tanggal WIB
  2. Banner pengingat (biru/kuning sebelum jam 20:00 WIB, merah mencolok jika lewat jam batas)
  3. 3 Kartu Area dengan checklist checkbox besar (min 44px) dan tombol "Centang Semua"
  4. Quick edit modal untuk mengganti nama petugas hari ini
  5. Tombol utama mencolok "Salin Laporan" dan tombol "Sudah Dikirim ke Grup"

- [ ] **Step 1: Implementasikan Header dan ReminderBanner**
- [ ] **Step 2: Implementasikan AreaCard dengan checklist per tugas dan tombol Centang Semua**
- [ ] **Step 3: Implementasikan ActionButtons (Salin Laporan dengan indikator sukses & status pengiriman)**
- [ ] **Step 4: Integrasikan di `src/app/page.tsx` dengan fetch data realtime dan optimasi responsif HP**
- [ ] **Step 5: Uji fungsionalitas di browser / build test**
- [ ] **Step 6: Commit**
  ```bash
  git add src/components/ src/app/page.tsx
  git commit -m "feat: implement mobile-first today checklist page with reminder banner and copy actions"
  ```

---

### Task 7: Halaman Kelola Admin (PIN Protected)

**Files:**
- Create: `src/app/kelola/page.tsx`
- Create: `src/components/PinModal.tsx`
- Create: `src/components/ScheduleManager.tsx`
- Create: `src/components/TaskManager.tsx`
- Create: `src/components/SettingsManager.tsx`

**Interfaces:**
- Consumes: PIN verification API `/api/admin/auth`, API `/api/admin/schedule`, `/api/admin/tasks`, `/api/admin/settings`.
- Produces: Halaman manajemen untuk:
  - Input & validasi PIN pengurus bersama.
  - Form tabel jadwal mingguan (Senin s.d. Minggu per 3 area).
  - Manajemen tugas (tambah, edit teks, urutan, aktif/nonaktif).
  - Pengaturan batas jam pengingat (default 20:00 WIB).

- [ ] **Step 1: Buat komponen proteksi PinModal dengan penyimpanan session storage**
- [ ] **Step 2: Buat komponen ScheduleManager untuk mengatur petugas mingguan per hari**
- [ ] **Step 3: Buat komponen TaskManager untuk CRUD tugas tiap area**
- [ ] **Step 4: Buat komponen SettingsManager untuk jam batas pengingat dan ganti PIN**
- [ ] **Step 5: Susun di `src/app/kelola/page.tsx` dengan navigasi kembali ke halaman utama**
- [ ] **Step 6: Uji verifikasi PIN salah vs benar dan perubahan data jadwal**
- [ ] **Step 7: Commit**
  ```bash
  git add src/app/kelola/ src/components/
  git commit -m "feat: implement PIN-protected admin management for schedule, tasks, and settings"
  ```

---

### Task 8: Halaman Riwayat Laporan

**Files:**
- Create: `src/app/riwayat/page.tsx`
- Create: `src/app/api/reports/history/route.ts`
- Create: `src/components/HistoryCard.tsx`

**Interfaces:**
- Consumes: Daftar tanggal laporan dari database.
- Produces: Halaman riwayat untuk melihat status tanggal-tanggal sebelumnya, preview teks laporan masa lalu, dan tombol salin ulang.

- [ ] **Step 1: Implementasikan API endpoint history di `/api/reports/history`**
- [ ] **Step 2: Buat komponen `HistoryCard` untuk menampilkan ringkasan tanggal, status terkirim, dan preview laporan**
- [ ] **Step 3: Susun halaman `src/app/riwayat/page.tsx` dengan filter tanggal dan tombol salin ulang**
- [ ] **Step 4: Commit**
  ```bash
  git add src/app/riwayat/ src/app/api/reports/history/ src/components/HistoryCard.tsx
  git commit -m "feat: implement past reports history view and re-copy functionality"
  ```

---

### Task 9: Verifikasi Penerimaan, Audit Mobile & Finalisasi

**Files:**
- Modify: `README.md`, `PRD & Rules — Piket Tracker Asrama & Musala.md` (jika ada update catatan)

- [ ] **Step 1: Jalankan seluruh test suite Vitest (`npm test`) dan pastikan 100% lulus**
- [ ] **Step 2: Jalankan `npm run build` untuk memverifikasi tidak ada error kompilasi TypeScript atau Next.js**
- [ ] **Step 3: Uji verifikasi format laporan dengan checklist sebagian dan checklist penuh terhadap WhatsApp**
- [ ] **Step 4: Verifikasi tampilan mobile di viewport HP (360px - 414px) untuk memastikan tombol min 44px dan navigasi nyaman**
- [ ] **Step 5: Buat README petunjuk menjalankan dan konfigurasi aplikasi**
- [ ] **Step 6: Commit final**
  ```bash
  git add .
  git commit -m "docs: finalize project setup and verification documentation"
  ```
