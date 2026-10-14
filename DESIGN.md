# DESIGN.md: Sistem Desain “Dealer Transparan” (Playful Nostalgia 90-an)

> **Acuan Dokumen:** [`Master_PRD.md`](file:///c:/xampp/htdocs/OldSunny/Master_PRD.md)  
> **Tagline:** *Dealer Transparan, Layanan Tanpa Henti*  
> **Tema Visual:** Playful Nostalgia (Retro 90s Arcade / Game Console Warmth × Transparansi Korporat Bersih)  
> **Target Audiens:** Generasi dewasa / milenial (koleksi nostalgia emosional) & trust verifier (transparansi publik terverifikasi).

---

## 1. Filosofi & Arah Artistik (Art Direction)

1. **Formal Modern Trust & Clean Precision:**  
   Menghindari gradasi ungu/pink generik AI dan tidak menggunakan emoticon (emoji). Seluruh ikon antarmuka wajib menggunakan library ikon vektor profesional (**`lucide-react`**).
2. **Professional Dealership Typography:**  
   Menggunakan font korporat yang formal, tegas, dan mudah dibaca: **`Plus Jakarta Sans`** untuk judul/heading dan **`Inter`** untuk teks body, data harga, dan tabel. Tidak menggunakan font pixel retro yang berlebihan pada antarmuka utama.
3. **Tactile & Responsive Feedback:**  
   Elemen interaktif menggunakan bayangan berlapis modern (`box-shadow: var(--shadow-sm)` ke `var(--shadow-md)`), border halus 1px yang rapi, dan feedback hover/focus yang jelas bagi pengguna.
3. **Dual Atmosphere:**
   - **Mode Standar (Cozy Retro):** Antarmuka modern yang nyaman dibaca, ramah bagi pembeli mobil dan verifikator institusional, dengan sentuhan pixel-art pada maskot, badge, dan aksen navigasi.
   - **Mode Konami (Full 8-Bit Easter Egg):** Aktif melalui cheat code klasik (↑↑↓↓←→←→BA) dengan font bitmap, scanlines CRT halus, dan palet warna 8-bit yang nostalgik.
4. **Transparansi Tanpa Kompromi:**  
   Elemen bukti kredibilitas (Struktur Organisasi & Warning Notice mantan karyawan) didesain dengan hierarki visual tegas: hijau verifikasi untuk staf aktif dan merah peringatan protektif untuk mantan karyawan.

---

## 2. Palet Warna & Token Desain (Color Tokens)

### 2.1 Palet Utama (Mode Standar)
Sistem warna dioptimalkan untuk kontras teks minimal 4.5:1 (WCAG AA).

```css
:root {
  /* Surface & Canvas */
  --bg-canvas: #FAF7F2;          /* Warm Cream / Kertas Nostalgia */
  --bg-surface: #FFFFFF;         /* Pure Card White */
  --bg-surface-subtle: #F3EFE6;  /* Soft Warm Gray */
  --bg-surface-dark: #1E1B2E;    /* Deep Arcade Slate (Footer & Header Dark) */

  /* Primary Brand (Arcade Gold / Warm Amber) */
  --primary-400: #FBBF24;
  --primary-500: #F59E0B;        /* Warna Aksen Emas Game 90-an */
  --primary-600: #D97706;
  --primary-subtle: #FEF3C7;

  /* Secondary Brand (Vintage Teal / Gameboy Mint) */
  --secondary-400: #2DD4BF;
  --secondary-500: #0D9488;        /* Teal Seimbang & Ramah */
  --secondary-600: #0F766E;
  --secondary-subtle: #CCFBF1;

  /* Nostalgic Pastel Accents */
  --pastel-coral: #FCA5A5;       /* Pink Peach Lembut */
  --pastel-lavender: #DDD6FE;    /* Ungu Lilac Gameboy */
  --pastel-sky: #BAE6FD;         /* Langit Siang 16-bit */
  --pastel-sage: #D1FAE5;        /* Daun Segar */

  /* Status & Transparansi */
  --status-verified: #059669;    /* Hijau Trust / Staf Aktif */
  --status-verified-bg: #ECFDF5;
  --status-warning: #DC2626;     /* Merah Warning Notice / Resigned */
  --status-warning-bg: #FEF2F2;
  --status-info: #0284C7;
  --status-info-bg: #E0F2FE;

  /* Teks & Garis */
  --text-main: #1F2937;          /* Charcoal Gelap (Readable) */
  --text-muted: #4B5563;         /* Abu Netral (Contrast 5.2:1) */
  --text-dim: #9CA3AF;
  --text-inverse: #FFFFFF;
  --border-main: #E5E0D8;        /* Garis Kartu Hangat */
  --border-strong: #1F2937;      /* Garis Retro Hitam/Charcoal */

  /* Retro Hard Shadows */
  --shadow-retro-sm: 2px 2px 0px var(--border-strong);
  --shadow-retro-md: 4px 4px 0px var(--border-strong);
  --shadow-retro-lg: 6px 6px 0px var(--border-strong);
  --shadow-hover: 1px 1px 0px var(--border-strong);
}
```

### 2.2 Token Konami Mode (8-Bit Retro CRT)
Diaktifkan saat class `.konami-mode` disematkan pada tag `<body>`.

```css
body.konami-mode {
  --bg-canvas: #0F380F;          /* Palette Classic Handheld Hijau Monokrom / Dark Arcade */
  --bg-surface: #306230;
  --bg-surface-subtle: #0F380F;
  --text-main: #9BBC0F;
  --text-muted: #8BAC0F;
  --border-main: #0F380F;
  --border-strong: #9BBC0F;
  --primary-500: #8BAC0F;
  --shadow-retro-md: 3px 3px 0px #0F380F;
}
```

---

## 3. Tipografi (Typography Hierarchy)

Kombinasi antara kemudahan membaca teks panjang dan identitas display retro:

| Kategori | Font Family | Fungsi |
|---|---|---|
| **Body & UI Utama** | `Plus Jakarta Sans`, `Inter`, sans-serif | Teks deskripsi, harga mobil, tabel spesifikasi, formulir |
| **Headline Display** | `Outfit`, `Space Grotesk`, sans-serif (800 Weight) | Judul hero, nama section, banner promo |
| **Retro & Pixel Touch** | `'Press Start 2P'`, `'Silkscreen'`, monospace | Kode voucher, level ekspresi AI, badge "8-Bit", Konami mode |
| **Angka & Monospace** | `JetBrains Mono`, `Consolas`, monospace | Simulasi kredit, nomor plat/inventaris, tanggal resign |

### Skala Tipografi:
- **Hero Title (`h1`):** `clamp(2rem, 5vw, 3.25rem)` / Line-height: `1.15` / Weight: `800`
- **Section Title (`h2`):** `clamp(1.5rem, 3.5vw, 2.25rem)` / Line-height: `1.25` / Weight: `700`
- **Card Title (`h3`):** `1.25rem` / Line-height: `1.3` / Weight: `700`
- **Body Large (`p.lead`):** `1.125rem` / Line-height: `1.6` / Weight: `400`
- **Body Standard:** `1rem` (16px) / Line-height: `1.6` / Weight: `400`
- **Badge / Micro-label:** `0.75rem` (12px) / Line-height: `1` / Letter-spacing: `0.06em` / Uppercase

---

## 4. Bentuk, Border, & Elevasi (Geometry & Elevation)

- **Border Radius:**
  - `var(--radius-sm)`: `4px` (Tombol retro, tag badge, input field)
  - `var(--radius-md)`: `8px` (Kartu kendaraan, promo card)
  - `var(--radius-lg)`: `14px` (Container section besar, modal chat)
  - `var(--radius-pill)`: `9999px` (Status indicators, chip filter)
- **Border Style:** Solid `1.5px` atau `2px` tegas (`var(--border-strong)` atau `var(--border-main)`).
- **Tactile Click Animation:**
  ```css
  .retro-btn {
    border: 2px solid var(--border-strong);
    box-shadow: var(--shadow-retro-md);
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  .retro-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 1px 1px 0px var(--border-strong);
  }
  ```

---

## 5. Blueprint Spesifikasi Komponen (Component Specs)

### 5.1 Floating AI Assistant ("Sunny" Pixel Companion)
- **Posisi:** `fixed` di pojok kanan bawah (`bottom: 1.5rem; right: 1.5rem; z-index: 100`).
- **Avatar Sprite:** Karakter pixel-art (resolusi render 48×48px atau 64×64px).
- **Ekspresi Reaktif Berdasarkan Section (GSAP Observer):**
  - Di *Hero*: Sprite melambai hangat (`wave`), bubble teks pembuka.
  - Di *Kendaraan & Kredit*: Sprite memegang kalkulator / kaca pembesar (`inspect`).
  - Di *Warning Notice*: Sprite waspada (`alert`), mata membelalak lucu mengingatkan verifikasi rekening resmi dealer.
  - Di *Best Sales*: Sprite membawa trofi bintang (`cheer`).
- **Chat Drawer:** Slide-in dari kanan bawah dengan bubble chat dua arah (warna peach untuk user, putih ber-border hitam untuk AI).

### 5.2 Hero Section dengan 3 Tombol Quick-Action Persona
- **Persona 1: Pelanggan Existing**  
  Tombol: `[ 🚨 Butuh Servis / Darurat ]` (Aksen Merah/Coral, membuka langsung trigger darurat/booking).
- **Persona 2: Calon Pembeli**  
  Tombol: `[ 🚗 Eksplor Mobil Baru ]` (Aksen Emas/Amber, scroll halus ke katalog kendaraan).
- **Persona 3: Trust Verifier**  
  Tombol: `[ 🛡️ Cek Siapa di Balik Dealer ]` (Aksen Teal/Sage, jump ke struktur organisasi & warning notice).

### 5.3 Kartu Katalog Kendaraan & Filter
- **Tampilan:** Grid 3 kolom (desktop) dan 1 kolom scroll snap (mobile).
- **Detail Kartu:**
  - Badge Kategori (SUV / MPV / Sedan / EV).
  - Foto kendaraan dengan rasio 16:9 berbingkai retro.
  - Harga OTR dengan font tegas + estimasi cicilan per bulan.
  - Dua tombol aksi: *"Detail & Simulasi"* dan *"Tanya AI Stok"* (membuka chat otomatis).

### 5.4 Struktur Organisasi Interaktif
- **Tampilan:** Bagan pohon vertikal-horizontal yang dapat di-expand/collapse.
- **Card Profil Staf Aktif:**
  - Foto resmi staf, nama lengkap, jabatan, dan nomor ID karyawan.
  - Badge hijau menyala: `● AKTIF TERVERIFIKASI`.

### 5.5 Warning Notice (Daftar Karyawan Non-Aktif / Resign)
- **Tujuan:** Perlindungan konsumen dari transaksi liar/oknum mantan sales.
- **Visual:** Frame kotak peringatan tegas dengan garis tepi diagonal kuning-hitam retro atau merah protektif.
- **Data:** Nama eks-karyawan, jabatan terakhir, tanggal resmi non-aktif, dan maklumat: *"Dealer tidak bertanggung jawab atas transaksi di luar rekening resmi atas nama PT Dealer Transparan."*

### 5.6 Kartu Dealer Koleksi (TCG Viral Loop)
- **Format:** Kartu digital bergaya Trading Card Game era 90-an (efek hologram foil CSS `linear-gradient` berputar tipis saat kursor bergerak).
- **Konten:**
  - Header: Nama dealer & lencana transparansi.
  - Badan: Top sales bulan ini + status verifikasi dealer.
  - Footer: QR Code unik untuk validasi keaslian.
  - Fitur: Tombol `[ Simpan Gambar ]` atau `[ Share Kartu ]` yang men-trigger efek confetti 8-bit.

---

## 6. Animasi & Interaksi (Motion & GSAP Standards)

1. **Entrance Motion (GSAP ScrollTrigger):**
   - Kartu muncul dengan efek pop-in retro: `scale: 0.95 -> 1.0`, `opacity: 0 -> 1`, durasi `0.35s`, ease `back.out(1.5)`.
   - Hindari animasi mengambang lambat tak terarah yang terasa memberatkan performa.
2. **8-Bit Confetti:**
   - Bentuk kotak-kotak kecil pixelated (bukan lingkaran modern bulat halus) yang melompat saat transaksi simulasi atau booking selesai.
3. **Sound Effects (Opsional / Audio Toggle):**
   - Toggle suara mini di pojok layar (default: *Muted*).
   - Efek 8-bit blip lembut saat klik tombol dan coin sound saat menekan Konami Code.

---

## 7. Responsivitas & Aksesibilitas (Responsive & A11y)

| Breakpoint | Kolom Grid | Navigasi & Drawer |
|---|---|---|
| **< 640px (Mobile)** | 1 Kolom penuh | Bottom sticky bar / floating action badge |
| **640px – 1024px (Tablet)** | 2 Kolom | Grid fleksibel dengan padding 1.5rem |
| **> 1024px (Desktop)** | 3 Kolom | Full tree org-chart & floating AI expand |

- **Minimum Touch Target:** `44px × 44px` untuk seluruh tombol interaktif dan link.
- **Visible Focus States:** `:focus-visible` memiliki ring tebal 2px warna kontras (`var(--border-strong)`) dengan offset 2px.
- **Motion Reduction:** Mendukung query `@media (prefers-reduced-motion: reduce)` yang mematikan parallax dan transisi pop-in.

---

## 8. Panduan Implementasi Komponen (File Mapping)

```
src/
├── components/
│   ├── Navbar.jsx                # Navigasi sticky dengan retro badge & Konami indicator
│   ├── AIAssistantFloating.jsx   # Maskot pixel-art reaktif & drawer dialog chat
│   ├── VehicleCard.jsx           # Kartu kendaraan dengan harga & quick simulation
│   ├── OrgChartTree.jsx          # Bagan interaktif jajaran pimpinan & staf
│   ├── WarningNoticeBox.jsx      # Panel edukasi & verifikasi eks-karyawan
│   ├── BestSalesCard.jsx         # Highlight profil sales bintang bulan ini
│   ├── DealerTradingCard.jsx     # Kartu TCG holografik siap download
│   └── Footer.jsx                # Keterangan legal, rekening resmi, & copyright
├── pages/
│   └── Home.jsx                  # Single-page landing page menyusun seluruh section
├── styles/
│   ├── retro-tokens.css          # CSS Variables (Standar & Konami mode)
│   └── scanline-effects.css      # Scanline CRT & font bitmap Konami
└── utils/
    └── konamiCode.js             # Listener urutan tombol keyboard klasik
```
