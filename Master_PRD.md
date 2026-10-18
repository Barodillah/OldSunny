# Master PRD: Landing Page Dealer Transparan – Layanan Tanpa Henti

## Overview
Landing page dealer kendaraan dengan positioning **“Dealer Transparan”** yang menggabungkan transparansi publik (struktur organisasi, notifikasi eks‑karyawan) dan **AI Customer Service 24/7** serba‑bisa. Tema visual **playful nostalgia** ala game retro / 90‑an, menyasar sisi emosional generasi dewasa melalui warna pastel, elemen pixel‑art, dan interaksi yang hangat.

**Tagline:** *Dealer Transparan, Layanan Tanpa Henti*

## Persona Prioritas
1. **Pelanggan Existing** – Pemilik kendaraan yang butuh servis, sparepart, atau bantuan darurat (prioritas utama: mereka sudah pakai produk, layanan harus responsif).
2. **Prospek Pembeli** – Calon pembeli yang ingin eksplorasi harga, simulasi kredit, test drive, atau sekedar tanya‑tanya tengah malam.
3. **Trust Verifier** – Pengunjung skeptis (orang tua pembeli, procurement fleet) yang memverifikasi kredibilitas dealer lewat struktur organisasi dan warning notice.

## Core Journey & Urutan Section
1. **AI Assistant (Floating)** – Selalu hadir di pojok kanan bawah, karakter pixel‑art berekspresi mengikuti scroll.
2. **Hero Section** – Tiga quick‑action button mewakili tiga persona: “Pun Keluhan / Darurat”, “Eksplor Mobil Baru”, “Lihat Siapa di Balik Dealer”.
3. **Kendaraan & Pricelist** – Grid/strip kendaraan beserta harga; filter berbasis tipe / harga.
4. **Promo & Event** – Banner dinamis untuk promo yang sedang berlangsung.
5. **Struktur Organisasi** – Diagram interaktif dari pimpinan hingga staf terbawah.
6. **Warning Notice** – Daftar karyawan yang sudah tidak aktif/resign; mencerminkan transparansi dan melindungi pelanggan dari oknum.
7. **Best Sales of the Month** – Profil singkat sales terbaik, bisa diklik untuk langsung hubungi via AI.
8. **News & Update** – Blog/artikel edukasi, tips perawatan, berita industri.

## Fitur AI Assistant (via OpenRouter)
Asisten 24/7 dengan kepribadian ceria khas “teman nostalgia”. Menggunakan **function calling** OpenRouter yang terhubung ke Laravel API untuk menjalankan aksi nyata.

| Layanan | Behavior AI | Backend Trigger |
|---------|-------------|-----------------|
| **Booking Service** | Cek slot real‑time di kalender bengkel, langsung booking atau tawarkan alternatif. | `GET /api/services/slots`, `POST /api/services/book` |
| **Sparepart** | Cek stok, harga, estimasi pengiriman. Bila kosong: alternatif atau pre‑order. | `GET /api/spareparts/stock` |
| **Emergency** | Panduan cepat (posisi, tombol darurat), kontak Service on Road, catat laporan darurat. | `POST /api/emergency/report` |
| **Promo & Test Drive** | Tampilkan promo relevan, langsung buat janji test drive. | `GET /api/promos`, `POST /api/testdrive/book` |
| **Simulasi Kredit** | Hitung cicilan berdasarkan harga, DP, tenor (tanpa pindah halaman). | `POST /api/simulasi-kredit` |
| **Body Paint** | Pilihan warna dari database, estimasi biaya & durasi. | `GET /api/bodypaint/options`, `POST /api/bodypaint/estimate` |
| **Aksesoris** | Rekomendasi paket ala “pilih power-up game”, lengkap dengan harga. | `GET /api/aksesoris/recommended` |

**Note:** AI Assistant wajib merespon dengan gaya nostalgia, misal: *“Wah, siap! Kita cek bengkel kayak cek cheat di game ya~”*

## Spesifikasi Teknis
### Frontend (React + JSX, react‑router)
- Dibangun dengan Vite / CRA, setiap section menjadi komponen terpisah.
- Routing via `react‑router‑dom` untuk navigasi anchor / deep‑link.
- Animasi scroll‑trigger dengan **GSAP ScrollTrigger** (elemen masuk, parallax, efek 8‑bit).
- Floating AI Character: komponen React yang berkomunikasi dengan backend via REST / SSE (streaming).
- Konami Code Easter Egg: ketika user menekan ↑↑↓↓←→←→BA, body menambah kelas `konami-mode` yang mengaktifkan stylesheet tema 8‑bit penuh.

### Backend (Laravel PHP, MySQL)
- REST API untuk semua layanan di atas, autentikasi ringan (optional, bisa token untuk user existing).
- Endpoint khusus untuk AI `POST /api/ai/chat` yang menerima prompt + session history, lalu Laravel akan melogikakan pemanggilan tools secara server‑side atau melemparkan ke OpenRouter.
- Fungsi helper untuk memformat response AI agar siap dirender sebagai “bubble chat”.

### Database (MySQL) – 7 Tabel Inti
1. **vehicles** – id, nama, kategori, harga, gambar, stok, spesifikasi.
2. **services** – id, kendaraan_id, user_id, slot_waktu, tipe_servis, status.
3. **spareparts** – id, nama, stok, harga, estimasi_kirim, alternatif_id.
4. **promos_events** – id, judul, deskripsi, gambar, tanggal_mulai, tanggal_selesai.
5. **employees** – id, nama, posisi, foto, status (aktif/resign/keluar), tanggal_resign, kontak (untuk best sales).
6. **sales** – id, employee_id, bulan, penjualan, peringkat.
7. **emergency_reports** – id, user_id, lokasi, jenis_darurat, status.

## AI Integration (OpenRouter Function Calling)
- Intent detection + tool execution dilakukan di sisi Laravel agar API key aman.
- Flow: User chat → Laravel Proxy → OpenRouter + Prompt System + Tools → Laravel Execute Tool → Format ulang → Tampilkan ke user.
- Prompt System berisi kepribadian “teman nostalgia” plus semua konteks tools yang tersedia.

## Micro‑interactions & Tema Playful
- **AI Character**: kecil di pojok, ekspresi berubah via GSAP mengikuti section yang sedang dilihat (misal: dia menunjuk ke bawah saat user di Hero, atau cengo saat di Warning Notice).
- **Confetti 8‑bit**: muncul saat user sukses booking, simulasi kredit, atau membagikan “Kartu Dealer”.
- **Kartu Dealer Transparan** (Viral Loop): template kartu bergaya Pokémon/Yu‑Gi‑Oh yang memuat nama dealer, struktur organisasi, best sales bulan ini, dan daftar eks‑karyawan. Bisa didownload & di‑share ke sosmed. Mengandung QR‑code yang mengarah ke landing page.
- **Easter Egg Konami Code**: menerapkan tema 8‑bit penuh di seluruh halaman (pixel font, efek CRT scanline, suara coin retro opsional).

## Edge Cases
- Slot booking habis: AI menawarkan hari terdekat atau alternatif bengkel rekanan.
- Stok sparepart 0: AI menawarkan pre‑order, alternatif kompatibel, atau eskalasi ke CS manusia (jika jam kerja).
- Emergency di luar jangkauan: AI tetap memberi panduan dasar dan mencatat laporan, lalu mengirim notifikasi ke admin.
- Karyawan baru muncul di struktur organisasi tetapi belum muncul di Warning Notice (otomatis hanya yang resign).
- Simulasi kredit di luar parameter (DP terlalu kecil, tenor terlalu panjang): AI memberikan warning edukatif.
- Pengguna tanpa autentikasi tetap bisa bertanya, namun untuk booking perlu input nomor telepon minimal.

## Roadmap & Status Saat Ini
- ✅ Semua pilar telah disepakati (persona, fitur AI, teknis, UX, viral loop).
- Siap masuk tahap development: setup React + Laravel + MySQL, implementasi OpenRouter.

---

**Dokumen ini menjadi acuan final untuk seluruh tim (frontend, backend, desain). Mulai dari sini, setiap bagian bisa dipecah menjadi task teknis.**