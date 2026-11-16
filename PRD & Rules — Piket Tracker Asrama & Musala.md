# PRD & Rules — Piket Tracker Asrama & Musala

Versi 1.0 · Dokumen untuk Gabyrrr · Web sederhana pencatatan piket harian dan penyalin laporan ke grup WhatsApp

## 1. Ringkasan

Piket Tracker adalah web sederhana untuk mencatat piket harian Asrama & Musala. Petugas mencentang tugas yang sudah selesai, lalu web menyusun laporan dalam format yang sama persis dengan chat "List Piket Asrama & Musala" di grup WhatsApp. Laporan disalin dengan satu tombol lalu ditempel ke grup. Web juga mengingatkan kalau laporan hari itu belum dikirim.

## 2. Latar Belakang dan Masalah

- Semua santri wajib piket, dan tiap hari harus ada laporan piket yang dikirim ke grup "Mentoring ITBS".
- Pengurus sering lupa mengirim laporan.
- Format laporan panjang (3 area, puluhan tugas), jadi mengetik ulang tiap hari merepotkan dan formatnya tidak selalu konsisten.
- Petugas tiap area berbeda-beda setiap hari, sehingga nama petugas harus diganti manual setiap kali.

## 3. Tujuan dan Indikator Keberhasilan

| Tujuan | Indikator |
| --- | --- |
| Laporan terkirim setiap hari | Laporan terkirim tiap hari piket, tanpa terlewat |
| Membuat laporan cepat | Dari buka web sampai salin laporan kurang dari 1 menit |
| Format konsisten | Teks laporan identik dengan format grup |
| Mudah dipakai semua santri | Bisa dipakai di HP tanpa panduan khusus |

## 4. Pengguna

- **Petugas piket**: santri yang bertugas hari itu. Mencentang tugas areanya.
- **Pengurus**: bertanggung jawab mengirim laporan ke grup. Menyalin laporan dan menandai sudah terkirim. Juga mengelola jadwal dan daftar tugas.

## 5. Ruang Lingkup

### 5.1 Masuk (MVP)

1. **Halaman Hari Ini**: tanggal dan hari (WIB), tiga kartu area, nama petugas otomatis dari jadwal mingguan, dan checklist tugas.
2. **Checklist per area**: setiap tugas punya checkbox. Ada tombol "Centang semua" per area.
3. **Edit nama petugas hari itu**: nama dari jadwal bisa diganti manual, misalnya karena tukar piket atau petugas sakit.
4. **Salin laporan**: satu tombol menyalin teks laporan lengkap ke clipboard.
5. **Status laporan**: pengurus menekan "Sudah dikirim ke grup". Status tersimpan per tanggal.
6. **Pengingat**: banner mencolok di halaman jika laporan hari itu belum ditandai terkirim, dan makin menonjol setelah jam batas (default 20.00 WIB, bisa diatur).
7. **Kelola jadwal mingguan tetap**: petugas per area untuk Senin sampai Minggu.
8. **Kelola daftar tugas**: tambah, ubah, hapus, dan urutkan tugas tiap area.
9. **Riwayat sederhana**: daftar tanggal beserta status terkirim atau belum, dan laporan hari lalu bisa dilihat dan disalin ulang.

### 5.2 Tidak masuk (versi ini)

- Pengiriman otomatis ke WhatsApp (tidak memakai bot atau API WA).
- Notifikasi push atau pesan WhatsApp otomatis.
- Penilaian, poin, atau denda piket.
- Jadwal adzan (opsi pengembangan lanjutan, lihat bagian 11).

## 6. Format Laporan (WAJIB identik)

Contoh keluaran, dengan nama petugas diambil dari jadwal hari itu:

```
List Piket Asrama & Musala

1. Dapur : [Nama]

Membersihkan dan merapikan area dapur. ✅
Membersihkan meja dan wastafel. ✅
Merapikan peralatan dapur dan makan. ✅
Menanak nasi. ✅
Membuang sampah. ✅
Memastikan dapur bersih dan rapi. ✅

2. Lobby, Ruang Belajar, Halaman & Ruang Asrama : [Nama]

Menyapu dan mengepel area ruang belajar dan lobby. ✅
Menata dan merapikan sepatu. ✅
Merapikan meja, kursi, dan fasilitas ruang belajar serta lobby. ✅
Menyapu dan membersihkan halaman. ✅
Membersihkan dan merapikan ruang asrama. ✅
Merapikan barang-barang yang berserakan. ✅
Mengumpulkan dan membuang sampah. ✅
Memastikan seluruh area bersih dan rapi. ✅

3. Musala & Kamar Mandi : [Nama & Nama]

Menyapu dan mengepel area musala. ✅
Membersihkan/menebahi karpet musala. ✅
Merapikan sajadah dan perlengkapan ibadah. ✅
Menata Al-Qur'an dan buku-buku keagamaan. ✅
Membersihkan area tempat wudu. ✅
Membersihkan dan menyikat kamar mandi area musala. ✅
Memastikan musala dan kamar mandi bersih, rapi, dan nyaman. ✅
```

Aturan format:

- Judul, penomoran area, tanda titik dua, dan urutan tugas harus sama dengan contoh.
- Tugas yang sudah dicentang diberi ✅ di akhir baris. Tugas yang belum dicentang diberi ❌ sehingga kekurangan terlihat jelas di grup.
- Dua petugas dalam satu area ditulis dengan "&" (contoh: Rakha & Ega).
- Teks murni tanpa markdown, supaya tampil benar di WhatsApp.
- Satu baris kosong antara judul area dan daftar tugas, dan satu baris kosong antar area.

## 7. Alur Pengguna

1. Petugas atau pengurus membuka web, dan halaman Hari Ini langsung tampil dengan petugas sesuai jadwal.
2. Petugas mencentang tugas yang selesai di areanya.
3. Setelah semua area selesai, pengurus menekan **Salin laporan**.
4. Pengurus membuka grup WhatsApp, menempel, dan mengirim.
5. Pengurus kembali ke web dan menekan **Sudah dikirim ke grup**. Banner pengingat hilang.

## 8. Aturan Bisnis

- Jadwal petugas memakai **jadwal mingguan tetap**: tiap hari dalam seminggu punya petugas tetap per area.
- Perubahan nama pada halaman Hari Ini hanya berlaku untuk tanggal itu dan tidak mengubah jadwal mingguan.
- Satu tanggal punya satu laporan. Mengubah centang setelah ditandai terkirim diperbolehkan, tetapi status kembali menjadi "belum dikirim ulang" bila pengurus menghendaki (lihat pertanyaan terbuka).
- Hari dan tanggal selalu memakai zona waktu Asia/Jakarta (WIB).

## 9. Kebutuhan Non-Fungsional

- **Mobile-first**: dipakai terutama dari HP, tombol besar dan mudah ditekan.
- **Ringan dan cepat**: halaman Hari Ini terbuka dalam waktu singkat di koneksi biasa.
- **Sederhana**: tanpa fitur berlebihan. Pengguna harus paham tanpa panduan.
- **Bahasa Indonesia** untuk seluruh teks antarmuka.
- **Akses**: dilindungi PIN atau kata sandi bersama untuk pengurus (halaman kelola jadwal dan tugas). Halaman Hari Ini boleh dibuka tanpa login oleh petugas.
- **Data kecil**: cukup database sederhana, tanpa data pribadi sensitif selain nama panggilan santri.

## 10. Model Data (usulan)

- **areas**: id, nama, urutan
- **tasks**: id, area\_id, teks, urutan, aktif
- **santri**: id, nama
- **weekly\_schedule**: id, hari (0 sampai 6), area\_id, santri\_id
- **daily\_reports**: id, tanggal, status\_terkirim, waktu\_terkirim
- **daily\_assignments**: id, tanggal, area\_id, nama petugas (hasil salinan dari jadwal, boleh diubah)
- **daily\_task\_checks**: id, tanggal, task\_id, selesai

## 11. Pengembangan Lanjutan (di luar MVP)

- Halaman Jadwal Adzan Hari Ini dengan dua mode (libur kuliah dan saat kuliah), memakai data dari jadwal adzan santri.
- Pengingat lewat notifikasi (PWA) pada jam tertentu.
- Ekspor riwayat piket per bulan.

## 12. Kriteria Penerimaan

- Membuka halaman Hari Ini menampilkan tiga area dengan petugas sesuai jadwal hari itu.
- Mencentang semua tugas lalu menekan Salin laporan menghasilkan teks yang persis sama dengan format di bagian 6.
- Mengganti nama petugas hari ini tidak mengubah jadwal mingguan.
- Banner pengingat muncul selama laporan hari itu belum ditandai terkirim, dan hilang setelah ditandai.
- Setelah jam batas, banner tampil dengan tingkat peringatan lebih tinggi.
- Jadwal mingguan dan daftar tugas dapat diubah oleh pengurus dan langsung berlaku di laporan berikutnya.
- Tampilan nyaman dipakai di layar HP.

## 13. Risiko

- Pengurus tetap lupa membuka web. Mitigasi: pengingat visual yang jelas, dan opsi PWA atau notifikasi di versi lanjutan.
- Format WhatsApp berubah atau ✅ tidak tampil di perangkat tertentu. Mitigasi: uji tempel di WhatsApp Android dan iOS.
- Jadwal berubah di tengah minggu. Mitigasi: nama petugas bisa diedit per hari.

## 14. Pertanyaan Terbuka

1. Bagaimana dengan santri yang tidak piket pada hari tertentu (sakit, izin, kegiatan lain): cukup diganti nama petugas manual, atau perlu penanda "izin"?
2. Jam batas pengingat: tetap 20.00 WIB atau mau diatur lain?
3. Siapa yang boleh menekan "Sudah dikirim": hanya pengurus atau semua orang?
4. Apakah laporan boleh diedit lagi setelah ditandai terkirim?
5. Apakah perlu login per orang, atau cukup satu PIN bersama untuk pengurus?

## 15. Rules untuk AI Agent / Pengembangan (AGENTS.md)

Bagian ini bisa disalin ke `AGENTS.md` di root proyek.

### Produk

- Ini web sederhana. Jangan menambah fitur di luar PRD ini tanpa diminta.
- Prioritas: cepat dipakai di HP, mudah dipahami, format laporan benar.

### Bahasa dan Teks

- Semua teks antarmuka memakai bahasa Indonesia yang singkat dan jelas.
- Kode, nama variabel, dan komentar memakai bahasa Inggris.

### Format Laporan

- Fungsi penyusun laporan harus berupa satu fungsi murni (input: tanggal, petugas, daftar tugas dan status centang; output: string) dan wajib diuji dengan unit test terhadap contoh di bagian 6.
- Jangan mengubah teks tugas, urutan area, judul, atau tanda baca tanpa diminta. Satu spasi sebelum titik dua pada baris area ("Dapur : Nama") harus dipertahankan.
- Output teks murni, tanpa markdown dan tanpa karakter khusus selain ✅ dan ❌.

### Waktu

- Semua perhitungan tanggal, hari, dan jam batas memakai zona waktu Asia/Jakarta, bukan zona waktu server atau browser.

### UI dan Desain

- Mobile-first. Target sentuh minimal 44px. Teks mudah dibaca di layar kecil.
- Hindari tampilan generik khas AI: tanpa gradasi ungu-biru, tanpa kartu dengan bayangan berlebihan, tanpa emoji dekoratif berlebihan, dan tanpa tata letak template yang seragam. Pakai palet warna terbatas (satu warna utama dan satu aksen), tipografi tegas, dan jarak yang konsisten.
- Tombol utama (Salin laporan) harus paling menonjol di halaman. Banner pengingat harus jelas tetapi tidak mengganggu.
- Tampilkan umpan balik singkat saat menyalin (contoh: "Laporan disalin").
- Dukung mode terang. Mode gelap opsional.

### Kode

- Stack usulan: Next.js dengan TypeScript, Tailwind, dan Supabase atau database sederhana lain. Boleh diganti selama PRD terpenuhi.
- Komponen kecil dan terpisah. Tidak ada logika bisnis di dalam komponen tampilan.
- Validasi input di sisi server untuk semua perubahan jadwal dan tugas.
- Rahasia (PIN, kunci database) hanya lewat variabel lingkungan, tidak boleh ada di repositori.
- Salin ke clipboard memakai `navigator.clipboard` dengan cadangan `execCommand` agar jalan di browser HP lama.

### Pengerjaan

- Kerjakan bertahap: (1) data dan jadwal, (2) halaman Hari Ini dan checklist, (3) penyusun dan penyalin laporan, (4) status terkirim dan pengingat, (5) halaman kelola dan riwayat.
- Setelah tiap tahap, pastikan aplikasi bisa dijalankan dan tes lulus sebelum lanjut.
- Jika ada hal yang tidak jelas di PRD, tanyakan atau catat di bagian Pertanyaan Terbuka, jangan menebak diam-diam.
