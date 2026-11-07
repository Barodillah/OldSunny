# Panduan Update & Redeploy ke Produksi (`cssunmotor.com`)

Dokumen ini menjelaskan langkah-langkah terstruktur untuk melakukan update (redeploy) **Frontend (React + Vite + Server-Side SEO Injector)** maupun **Backend (Laravel API & Database)** ke server hosting produksi.

---

## 1. Build Frontend di Lokal

Setiap kali ada perubahan pada tampilan, komponen React (`src/`), metadata (`index.html`), atau file publik (`public/`), jalankan perintah build di terminal lokal:

```powershell
npm run build
```

### Apa yang dilakukan `npm run build`?
Vite secara otomatis mengompilasi aplikasi React dan menyalin seluruh isi folder `public/` ke dalam folder **`dist/`**, termasuk:
- `dist/index.html` (Template utama SPA beserta baseline Schema.org JSON-LD)
- `dist/index.php` (Server-side Open Graph, Canonical, dan Dynamic `FAQPage` / `ItemList` JSON-LD injector dari database)
- `dist/.htaccess` (Routing Apache, rewrite `/sitemap.xml` ke `sitemap.php`, rewrite `/llms.txt` & `/llms-full.txt` ke `llms.php`, kompresi Gzip, dan cache headers)
- `dist/seo-db-provider.php` (Engine pusat penarik data real-time MySQL untuk `llms.txt`, `llms-full.txt`, `FAQPage`, dan `ItemList` kendaraan)
- `dist/llms.php` (Generator dinamis berbasis database untuk `/llms.txt` dan `/llms-full.txt`)
- `dist/seo-dynamic.php` (Endpoint JSON dinamis berbasis database untuk hidrasi FAQ & Schema di sisi React SPA)
- `dist/sitemap.php` (Generator XML Sitemap dinamis untuk halaman statis + artikel database)
- `dist/robots.txt` (Aturan akses mesin pencari & AI crawlers serta proteksi `/portal`)
- `dist/llms.txt` & `dist/llms-full.txt` (Snapshot fisik terbaru yang otomatis disinkronkan dari database)
- `dist/assets/` (Bundle JS dan CSS yang sudah diminifikasi)

---

## 2. Alur Upload Frontend ke Hosting (cPanel / FTP / SSH)

1. **Buka File Manager Hosting** menuju direktori root domain `public_html/` (atau folder tempat `cssunmotor.com` diarahkan).
2. **Jangan hapus folder `api/` atau `wp-content/`** yang sudah ada di server produksi.
3. **Bersihkan bundle lama di `public_html/assets/`** agar file JS/CSS dengan hash lama tidak menumpuk.
4. **Upload seluruh isi folder `dist/`** ke `public_html/`:
   - Cara tercepat: blok semua file di dalam folder `dist/` lokal (termasuk `.htaccess`), kompres menjadi `dist.zip`, upload ke `public_html/`, lalu klik **Extract** (Overwrite existing files).
   - Pastikan file tersembunyi **`.htaccess`** ikut ter-upload dan tidak tertinggal.

---

## 3. Alur Update Backend Laravel (`api/`) & Database (Jika Ada Perubahan)

Jika terdapat perubahan pada kode backend di folder `api/` atau penambahan tabel/kolom database:

### A. Upload File Backend yang Berubah
- Upload file yang berubah di dalam `api/app/`, `api/routes/`, `api/config/`, atau `api/database/migrations/` ke path yang sama di server (`public_html/api/...` atau lokasi folder `api` di server).
- **Penting**: Jangan menimpa file `api/.env` di server produksi dengan `.env` lokal apabila `.env` lokal sedang berisi konfigurasi `localhost`.

### B. Menjalankan Migrasi Database Produksi
Pilih salah satu dari 2 metode berikut:

1. **Metode Terminal SSH Hosting (Jika tersedia di cPanel)**:
   ```bash
   cd ~/public_html/api
   php artisan migrate --force
   php artisan optimize:clear
   ```
2. **Metode Remote dari PC Lokal (Tanpa SSH)**:
   - Ubah sementara kredensial `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di `api/.env` lokal menggunakan kredensial MySQL server produksi (pastikan IP publik Anda sudah dimasukkan ke menu **Remote MySQL** di cPanel).
   - Jalankan di terminal lokal:
     ```powershell
     cd api
     php artisan migrate --force
     ```
   - Setelah selesai, kembalikan `api/.env` lokal ke pengaturan database lokal (`127.0.0.1` / `sunny`).

---

## 4. Checklist Verifikasi Pasca-Redeploy

Setelah proses upload selesai, buka URL berikut di browser untuk memastikan seluruh fitur berjalan normal:

1. **Cek Robots.txt**:
   - Buka: `https://cssunmotor.com/robots.txt`
   - Pastikan daftar `User-agent`, `Disallow: /portal/`, dan `Sitemap: https://cssunmotor.com/sitemap.xml` tampil.
2. **Cek Dynamic XML Sitemap**:
   - Buka: `https://cssunmotor.com/sitemap.xml`
   - Pastikan tampil struktur XML berisi halaman utama (`/`, `/vehicles`, `/booking`, dll.) beserta daftar URL artikel `/news/...` dari database.
3. **Cek Dokumen AI / GEO (`llms.txt`)**:
   - Buka: `https://cssunmotor.com/llms.txt` dan `https://cssunmotor.com/llms-full.txt`
   - Pastikan profil resmi PT Sun Star Prima Motor, rekening BCA `3425419999`, dan daftar harga OTR tampil rapi.
4. **Cek Preview Share Link Artikel di WhatsApp**:
   - Salin salah satu URL artikel (`https://cssunmotor.com/news/judul-artikel-anda`) dan tempelkan ke chat WhatsApp.
   - Pastikan judul spesifik artikel, deskripsi ringkas, dan gambar thumbnail muncul.
5. **Submit Sitemap ke Google Search Console**:
   - Masuk ke [Google Search Console](https://search.google.com/search-console), pilih properti `cssunmotor.com`, buka menu **Sitemaps**, lalu masukkan `sitemap.xml` dan klik **Submit**.

