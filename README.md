# ITBS AL- Kautsar — Monitoring Piket Asrama & Musala

Aplikasi web *mobile-first* sederhana untuk mencatat pelaksanaan piket harian santri Asrama & Musala ITBS AL-Kautsar, menyusun laporan teks berformat presisi untuk grup WhatsApp "Mentoring ITBS", dan memantau status pengiriman laporan harian.

## Fitur Utama

1. **Halaman Hari Ini (Checklist Harian)**
   - Zona waktu otomatis terkunci ke **Asia/Jakarta (WIB)**.
   - Nama petugas tiap area otomatis terisi sesuai jadwal mingguan tetap.
   - Opsi penggantian nama petugas hari ini (misal karena tukar piket atau sakit) tanpa merusak jadwal mingguan tetap.
   - Checklist interaktif per area dengan tombol cepat **"Centang Semua"** dan target sentuh minimal 44px yang nyaman di HP.
   - Tombol utama **"Salin Laporan WhatsApp"** yang sangat menonjol dengan umpan balik toast dan dukungan *clipboard fallback* untuk semua jenis browser HP.
   - Tombol **"Tandai Sudah Dikirim ke Grup"** untuk merekam status pengiriman.

2. **Sistem Pengingat Cerdas (Reminder Banner)**
   - Menampilkan pengingat jika laporan hari itu belum ditandai terkirim.
   - Sebelum jam batas (default **20:00 WIB**): Banner informasi biru lembut.
   - Melewati jam batas: Banner peringatan merah mencolok untuk mencegah pengurus lupa mengirim laporan.
   - Berubah menjadi notifikasi hijau setelah laporan ditandai terkirim.

3. **Format Laporan WhatsApp Identik (Strict Format)**
   - Format teks murni tanpa markdown, kompatibel sempurna saat ditempel ke WhatsApp di Android, iOS, maupun Web.
   - Tanda centang `✅` untuk tugas selesai dan silang `❌` untuk tugas yang belum selesai.
   - Format spasi sebelum titik dua pada header area (`1. Dapur : [Nama]`) dan penulisan dua nama dengan ` & `.

4. **Panel Pengurus (Dilindungi PIN Bersama)**
   - Dilindungi autentikasi satu PIN bersama (default: `1234`).
   - **Kelola Jadwal Mingguan Tetap**: Mengatur petugas Senin sampai Minggu untuk 3 area.
   - **Kelola Daftar Tugas**: Tambah tugas baru, ubah teks tugas, dan hapus tugas tiap area.
   - **Pengaturan**: Mengubah jam batas pengingat laporan dan mengganti PIN bersama pengurus.

5. **Riwayat Laporan**
   - Melihat daftar laporan tanggal-tanggal sebelumnya beserta status pengiriman dan jumlah tugas selesai.
   - Melihat pratinjau teks dan menyalin ulang laporan masa lalu dengan satu tombol.

---

## Palet Desain

Aplikasi ini menggunakan palet **Biru dan Putih** yang bersih, kontras tinggi, dan bebas dari elemen AI generik:
- **Primary Blue:** `#1d4ed8` (Blue-700) / `#1e40af` (Blue-800)
- **Soft Blue Backgrounds:** `#eff6ff` (Blue-50) / `#dbeafe` (Blue-100)
- **Neutral White / Slate:** `#ffffff` / `#f8fafc`
- **Text & Contrast:** `#0f172a` (Slate-900)

---

## Menjalankan Proyek

### Prasyarat
- Node.js versi 22+ (mendukung modul bawaan `node:sqlite`)
- npm atau pnpm

### Instalasi & Menjalankan Dev Server
```bash
# Instalasi dependensi
npm install

# Menjalankan server pengembangan
npm run dev
```
Buka browser di `http://localhost:3000`.

### Menjalankan Unit Test (Vitest)
```bash
npm test
```

### Build Produksi
```bash
npm run build
npm start
```

---

## Konfigurasi Lingkungan (`.env.local`)

Buat berkas `.env.local` bila ingin mengubah pengaturan default:
```env
# PIN Bersama Pengurus (default: 1234)
ADMIN_PIN=1234

# Batas Waktu Pengingat (format HH:mm WIB, default 20:00)
REMINDER_CUTOFF_TIME=20:00

# Path berkas database SQLite lokal
DATABASE_PATH=./data/piket.db
```
