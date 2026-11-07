# UNIVERSAL SEO & GEO PLAYBOOK

> **Panduan implementasi Search Engine Optimization (SEO), Answer Engine Optimization (AEO), dan Generative Engine Optimization (GEO) untuk semua jenis website dan teknologi.**
>
> Dokumen ini dirancang sebagai *project-independent implementation standard* sekaligus instruksi kerja bagi coding agent seperti Claude Code, OpenAI Codex, Antigravity, Cursor, GitHub Copilot, dan agent pengembangan lainnya.
>
> **Tujuan utama:** membuat website mudah ditemukan, dirayapi, dipahami, diindeks, dipercaya, dirujuk, dan digunakan oleh mesin pencari maupun sistem pencarian/jawaban berbasis AI—tanpa mengorbankan aksesibilitas, keamanan, kecepatan, akurasi informasi, atau pengalaman pengguna.

---

## 0. Cara Menggunakan Panduan Ini

Panduan ini adalah standar universal, bukan instruksi untuk memaksakan satu framework atau satu arsitektur tertentu.

1. **Audit dahulu, implementasikan kemudian.** Coding agent harus membaca struktur proyek dan memahami implementasi yang sudah ada sebelum mengubah kode.
2. **Sesuaikan dengan stack.** Gunakan mekanisme native dari framework, CMS, server, atau hosting proyek. Jangan memaksakan PHP, React, Apache, database, atau teknologi tertentu jika proyek tidak menggunakannya.
3. **Utamakan kebutuhan pengguna dan kualitas informasi.** SEO/GEO bukan alasan untuk menambah teks tidak relevan, keyword stuffing, halaman tipis, atau markup yang tidak sesuai isi halaman.
4. **Jaga kompatibilitas.** Hindari perubahan besar yang tidak diperlukan, duplikasi sistem metadata, perubahan URL tanpa redirect, atau migrasi framework hanya demi SEO.
5. **Buktikan hasilnya.** Setelah implementasi, jalankan build, test, crawler/render check, validator, dan pemeriksaan regresi yang sesuai dengan kemampuan proyek.
6. **Jelaskan keterbatasan.** Bedakan fitur yang benar-benar diimplementasikan, fitur opsional, dan hal yang tidak dapat dijamin oleh pemilik website.

### 0.1. Prioritas Implementasi

| Prioritas | Makna | Contoh |
|---|---|---|
| **P0 — Critical** | Menghalangi crawling, indexing, keamanan, atau akses ke halaman penting | `noindex` tidak sengaja, canonical salah, route 404, konten utama tidak tersedia pada HTML awal, sitemap rusak |
| **P1 — High** | Fondasi SEO/GEO dan kualitas halaman | Metadata unik, heading semantik, internal links, schema yang valid, konten yang lengkap, mobile usability |
| **P2 — Medium** | Peningkatan jangkauan dan kemudahan pemahaman | FAQ, content hub, halaman author, Local SEO, feed/dokumen AI, metadata media |
| **P3 — Optional** | Fitur khusus yang manfaatnya tergantung skala dan model bisnis | Generator `llms-full.txt`, AI content feed, first-party analytics lanjutan, algoritma distribusi eksposur konten |

---

## 1. Prinsip Dasar SEO, AEO, dan GEO

### 1.1. SEO — Search Engine Optimization

SEO memastikan halaman website dapat ditemukan dan dipahami oleh mesin pencari. Implementasi mencakup:

- Crawling dan indexing yang benar.
- URL yang stabil, bersih, dan dapat diakses.
- Metadata dan struktur HTML yang relevan.
- Konten yang bermanfaat, orisinal, akurat, dan sesuai search intent.
- Internal linking dan navigasi yang jelas.
- Structured data yang mencerminkan konten sebenarnya.
- Performa, keamanan, aksesibilitas, dan pengalaman mobile.
- Pengukuran impresi, klik, indexing, dan konversi.

### 1.2. AEO — Answer Engine Optimization

AEO membantu konten memberikan jawaban yang jelas terhadap pertanyaan pengguna. Prinsipnya:

- Jawab pertanyaan utama secara langsung di awal bagian yang relevan.
- Gunakan pertanyaan sebagai subheading bila memang sesuai kebutuhan pembaca.
- Berikan konteks, batasan, langkah, alasan, contoh, dan sumber.
- Susun informasi agar dapat dipahami tanpa harus menebak konteks halaman.
- Gunakan daftar, tabel, definisi, prosedur, dan FAQ jika format tersebut benar-benar membantu.

### 1.3. GEO — Generative Engine Optimization

GEO membantu sistem AI/search generatif memahami entitas, hubungan, fakta, serta sumber informasi website sehingga informasi berpeluang dipakai atau dirujuk dalam jawaban.

Prinsipnya:

- Identitas organisasi, merek, orang, produk, layanan, dan lokasi dinyatakan konsisten.
- Fakta penting disampaikan eksplisit, spesifik, dan memiliki konteks.
- Klaim didukung sumber, bukti, pengalaman, data, atau dokumentasi yang dapat diperiksa.
- Informasi disajikan dalam format yang mudah diproses manusia dan mesin.
- Halaman memiliki URL permanen dan metadata yang jelas.
- Konten penting dapat diakses melalui halaman publik tanpa ketergantungan pada interaksi yang tidak dapat dijalankan crawler.

**Penting:** tidak ada implementasi teknis yang dapat menjamin suatu halaman dikutip oleh ChatGPT, Google AI Overviews, Perplexity, Claude, atau sistem AI lainnya. GEO meningkatkan keterbacaan, kejelasan, dan ketersediaan sumber; keputusan crawling, pemilihan sumber, sitasi, dan jawaban tetap berada pada masing-masing platform.

### 1.4. Hubungan Ketiganya

| Area | SEO | AEO | GEO |
|---|---|---|---|
| URL dan indexing | Fondasi utama | Mempermudah akses jawaban | Mempermudah penemuan sumber |
| Metadata dan HTML | Membantu memahami halaman | Memberi konteks jawaban | Memperjelas identitas dan topik |
| Konten berkualitas | Menjawab search intent | Menjawab pertanyaan | Menyediakan fakta dan konteks untuk sintesis |
| Schema/entitas | Membantu interpretasi mesin | Memperjelas tipe informasi | Memperjelas hubungan antarentitas |
| Bukti dan sumber | Menambah kualitas halaman | Mendukung jawaban | Mendukung kepercayaan dan sitasi |
| Analytics | Mengukur performa pencarian | Mengukur penggunaan konten | Mengamati referral dan dampak AI jika tersedia |

---

## 2. Protokol Kerja Wajib untuk Coding Agent

Bagian ini merupakan instruksi operasional. Agent harus menerapkannya setiap kali diminta melakukan audit atau implementasi SEO/GEO.

### 2.1. Tahap A — Discovery dan Audit Proyek

Sebelum menyentuh kode, lakukan pemeriksaan berikut:

- [ ] Identifikasi framework, bahasa pemrograman, package manager, build tool, CMS, backend, database, web server, hosting, dan deployment flow.
- [ ] Identifikasi domain utama, protokol HTTPS, versi `www` atau non-`www`, struktur direktori publik, serta base path aplikasi.
- [ ] Identifikasi tipe website: company profile, e-commerce, katalog, marketplace, SaaS, blog, portal berita, direktori, aplikasi web, landing page, atau kombinasi.
- [ ] Petakan seluruh route publik dan route privat/admin.
- [ ] Identifikasi halaman statis, halaman dinamis berbasis database/CMS, halaman detail, halaman kategori, pagination, pencarian, filter, dan parameter URL.
- [ ] Periksa template HTML awal, rendering server/client, hydration, routing, metadata manager, dan mekanisme fallback.
- [ ] Periksa file yang sudah tersedia: `robots.txt`, `sitemap.xml`, canonical, `hreflang`, Open Graph, Twitter/X Cards, JSON-LD, `llms.txt`, kebijakan AI, favicon, manifest, dan feed.
- [ ] Periksa respons HTTP, redirect, status 404/410/5xx, header cache, compression, security headers, dan konfigurasi CDN/WAF bila tersedia.
- [ ] Periksa integrasi analytics, Search Console/Bing Webmaster Tools, consent/cookie system, serta tracking konversi.
- [ ] Catat masalah yang ditemukan, lokasi file, dampak, prioritas, dan rekomendasi sebelum mengedit.

**Larangan:** jangan membuat file atau sistem yang sebenarnya sudah tersedia tanpa memeriksa implementasi lama. Jangan mengubah struktur database, routing, atau arsitektur secara agresif jika perbaikan dapat dilakukan secara lebih sederhana.

### 2.2. Tahap B — Buat Peta SEO Website

Buat inventaris URL dengan kolom minimal berikut:

| Field | Isi |
|---|---|
| URL / Route | URL publik yang akan dievaluasi |
| Page Type | Home, category, product, article, profile, contact, FAQ, dan sebagainya |
| Intent | Informational, navigational, commercial, transactional, local |
| Primary Topic | Topik utama halaman |
| Primary Entity | Entitas utama yang dibahas |
| Indexability | Index, noindex, atau perlu keputusan |
| Canonical | URL kanonis yang seharusnya |
| Metadata | Title, description, OG |
| Structured Data | Tipe schema yang sesuai |
| Internal Links | Halaman masuk dan keluar yang relevan |
| Status | Existing, missing, duplicate, broken, atau needs review |

Jangan memasukkan semua URL secara otomatis ke sitemap. Hanya URL publik yang memang layak diindeks yang boleh dimasukkan.

### 2.3. Tahap C — Implementasi Berurutan

Urutan implementasi yang disarankan:

1. Perbaiki akses, status HTTP, redirect, robots, canonical, dan indexing.
2. Pastikan rendering HTML dan konten utama dapat dibaca crawler.
3. Terapkan metadata unik per halaman.
4. Rapikan URL, heading, konten, gambar, navigasi, dan internal linking.
5. Terapkan structured data yang sesuai.
6. Optimalkan performa dan aksesibilitas.
7. Bangun konten AEO/GEO, FAQ, content hub, dan dokumentasi AI bila relevan.
8. Terapkan Local SEO dan entity consistency jika website memiliki lokasi atau entitas lokal.
9. Tambahkan analytics dan conversion tracking secara aman.
10. Validasi, dokumentasikan perubahan, dan serahkan laporan.

### 2.4. Tahap D — Aturan Perubahan Kode

- Pertahankan bahasa, gaya kode, naming convention, arsitektur, dan dependensi proyek.
- Gunakan library yang sudah ada sebelum menambahkan dependency baru.
- Hindari memasang package SEO tambahan jika fitur sederhana dapat ditangani dengan sistem yang sudah tersedia.
- Jangan menghasilkan metadata dari data yang belum tervalidasi atau dari input pengguna tanpa sanitasi.
- Escape seluruh output dinamis dalam HTML dan JSON-LD sesuai konteksnya.
- Hindari duplikasi tag `<title>`, description, canonical, Open Graph, atau JSON-LD akibat beberapa komponen mengelola `<head>` secara bersamaan.
- Jangan menghapus fitur bisnis, tracking, atau integrasi yang sudah berjalan tanpa alasan dan pengujian.
- Jangan mengubah URL lama tanpa redirect permanen yang tepat dan pemetaan backlink.
- Jangan membuat konten, rating, harga, sertifikasi, review, alamat, statistik, tanggal, atau klaim pengalaman yang tidak ada di sumber data.
- Jangan menerapkan cloaking atau memberikan konten berbeda yang menyesatkan kepada crawler dan pengguna.
- Jangan menganggap file `robots.txt` sebagai sistem keamanan. Lindungi endpoint privat menggunakan autentikasi dan otorisasi sebenarnya.

---

## 3. Arsitektur Rendering yang Crawlable

### 3.1. Prinsip Universal

Konten utama, judul halaman, metadata, dan tautan penting harus tersedia secara konsisten untuk browser dan crawler. Pilih arsitektur berdasarkan kebutuhan proyek:

| Arsitektur | Pendekatan yang disarankan |
|---|---|
| Static HTML | Metadata dan konten langsung di HTML setiap halaman |
| Static Site Generation (SSG) | Generate HTML per route saat build |
| Server-Side Rendering (SSR) | Generate HTML berdasarkan request dan data halaman |
| Incremental/Hybrid Rendering | Gunakan cache dan revalidation untuk halaman dinamis |
| CMS tradisional | Pastikan template menghasilkan HTML semantik dan metadata per konten |
| SPA / Client-Side Rendering | Evaluasi prerender, SSR, atau rendering awal yang dapat dibaca crawler; jangan mengandalkan perubahan DOM setelah interaksi saja |
| Aplikasi dengan backend/API | Gunakan backend untuk metadata dan konten publik bila dibutuhkan; API privat tetap dilindungi |

### 3.2. SPA dan Dynamic Routing

Pada SPA, implementasi SEO tidak cukup hanya mengubah `document.title` setelah navigasi. Periksa HTML yang diterima pada request langsung ke setiap URL.

Standar minimum:

- Setiap route publik memiliki judul, description, canonical, Open Graph, dan konten utama yang sesuai.
- Direct URL access dan refresh pada route dalam harus mengembalikan halaman yang benar, bukan 404 palsu.
- Metadata awal tersedia di server/prerender untuk route penting.
- Navigasi client-side memperbarui title, canonical, metadata relevan, dan analytics pageview tanpa duplikasi.
- Konten utama tidak mensyaratkan klik, login, hover, atau interaksi yang tidak tersedia bagi crawler.
- Tautan navigasi penting menggunakan elemen anchor dengan URL yang dapat diikuti.
- URL query yang bersifat filter, tracking, sorting, atau state UI memiliki kebijakan canonical/indexing yang jelas.

Gunakan SSR/SSG/prerender bila sesuai dengan stack dan skala. Jangan membuat sistem user-agent detection yang menyajikan versi halaman berbeda hanya kepada crawler.

### 3.3. Server Routing dan HTTP Response

Periksa hal-hal berikut:

- HTTPS aktif dan domain utama konsisten.
- Variasi domain (HTTP/HTTPS, www/non-www, trailing slash bila relevan) diarahkan ke satu versi kanonis.
- Halaman berhasil mengembalikan `200`.
- URL yang dihapus permanen dapat mengembalikan `410` atau redirect relevan; jangan mengarahkan semua halaman hilang ke homepage.
- Redirect tidak membentuk loop atau rantai panjang.
- Error page menggunakan status HTTP yang sesuai, bukan hanya tampilan visual 404 dengan status `200`.
- File statis menggunakan cache yang sesuai; aset berversi/hash dapat diberi cache panjang.
- HTML, CSS, JavaScript, JSON, dan format teks dapat dikompresi jika server mendukung.
- CDN/cache tidak menyajikan metadata milik URL lain akibat cache key yang salah.

Security headers seperti `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`, dan proteksi framing dapat diterapkan sesuai kebutuhan aplikasi. Konfigurasinya harus kompatibel dengan resource yang benar-benar digunakan. Header keamanan bukan pengganti autentikasi, otorisasi, dan validasi input.

---

## 4. Technical SEO: Crawl, Index, Canonical, dan Sitemap

### 4.1. `robots.txt`

Sediakan `https://domain.com/robots.txt` pada lokasi root domain bila memungkinkan.

Pedoman:

- Gunakan untuk mengatur perilaku crawling, bukan untuk menyembunyikan informasi rahasia.
- Jangan memblokir CSS, JavaScript, gambar, atau API publik yang dibutuhkan crawler untuk merender halaman.
- Batasi area privat yang tidak perlu dirayapi, tetapi tetap amankan dengan autentikasi.
- Cantumkan URL sitemap yang benar.
- Periksa konflik antara aturan `Allow` dan `Disallow`.
- Jangan memblokir URL yang sekaligus diharapkan diproses menggunakan `noindex`; crawler harus dapat mengakses halaman untuk membaca directive tersebut.
- Aturan robots untuk satu bot tidak otomatis berlaku bagi bot lain.

Contoh dasar yang perlu disesuaikan:

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://www.example.com/sitemap.xml
```

Hapus contoh `Disallow` bila path tersebut bukan area privat/nonpublik di proyek. Jangan menyalin contoh tanpa memeriksa route nyata.

### 4.2. XML Sitemap

Sitemap membantu penemuan URL; sitemap bukan jaminan indexing atau ranking.

Sitemap sebaiknya:

- Berisi URL absolut, HTTPS, dan canonical.
- Hanya memuat halaman publik yang layak diindeks dan mengembalikan status sukses.
- Menghindari halaman admin, login, pencarian internal, filter duplikat, redirect, 404, dan URL `noindex`.
- Memuat halaman statis dan halaman dinamis yang relevan dari database/CMS.
- Memperbarui `lastmod` berdasarkan perubahan konten yang nyata, bukan waktu generator dijalankan.
- Menggunakan sitemap index bila jumlah URL atau pembagian tipe konten membutuhkannya.
- Memasukkan alternatif bahasa bila implementasi multilingual menggunakan URL yang terpisah.
- Dapat dihasilkan dinamis atau saat build sesuai arsitektur.

Kategori sitemap opsional:

- `sitemap-pages.xml`
- `sitemap-products.xml`
- `sitemap-articles.xml`
- `sitemap-categories.xml`
- `sitemap-images.xml` atau sitemap video bila sesuai kebutuhan.

Jangan mengandalkan `priority` dan `changefreq` sebagai mekanisme peningkatan ranking. Fokus pada URL yang benar, status, canonical, dan `lastmod` yang akurat.

### 4.3. Canonical URL

Setiap halaman indexable harus memiliki satu canonical yang mengarah ke URL pilihan.

Aturan:

- Gunakan URL absolut dan konsisten.
- Canonical harus menunjuk ke halaman yang benar-benar setara, bukan selalu homepage.
- Hindari canonical yang bertentangan dengan redirect, hreflang, sitemap, atau internal links.
- Tentukan kebijakan untuk parameter UTM, filter, sorting, pagination, variant, dan query lainnya.
- Jangan menghapus parameter yang mengubah konten unik secara substansial tanpa evaluasi.
- Pastikan slash, kapitalisasi, encoding, hostname, dan protokol konsisten.
- Pada SPA, pembaruan canonical saat navigasi client-side harus sejalan dengan canonical HTML awal.

### 4.4. Noindex dan Status Indexing

Tentukan status setiap jenis halaman:

| Jenis halaman | Kebijakan umum |
|---|---|
| Homepage, kategori utama, detail produk/layanan, artikel berkualitas | Index bila konten publik dan bermanfaat |
| Admin, dashboard, akun, checkout privat | Jangan diindeks; tetap wajib diamankan |
| Internal search result | Biasanya `noindex` |
| Filter/sort yang menghasilkan banyak URL duplikat | Atur canonical/noindex sesuai nilai pencariannya |
| Halaman terbitan tipis, duplikat, atau kosong | Perbaiki, gabungkan, redirect, atau `noindex` sesuai kasus |
| 404 yang benar | Status 404; tidak perlu diindeks |

Jangan membuat semua halaman `index,follow` secara otomatis. Keputusan indexability harus mempertimbangkan kualitas, keunikan, dan tujuan halaman.

### 4.5. Redirect dan Migrasi URL

- Gunakan redirect permanen untuk perpindahan URL yang memang permanen.
- Pertahankan slug yang sudah memiliki trafik/backlink jika tidak ada alasan kuat untuk mengubahnya.
- Buat mapping URL lama ke URL baru secara satu-ke-satu bila memungkinkan.
- Hindari redirect massal ke homepage.
- Update internal link, canonical, sitemap, structured data URL, dan hreflang setelah migrasi.
- Uji URL lama, URL baru, trailing slash, kapitalisasi, dan query penting.

---

## 5. On-Page SEO dan Metadata

### 5.1. Metadata Wajib per Halaman

Setiap halaman publik yang dapat diindeks harus memiliki metadata yang relevan dan tidak duplikat:

```html
<title>Topik Utama atau Nama Halaman | Brand</title>
<meta name="description" content="Ringkasan yang akurat dan spesifik tentang isi halaman." />
<link rel="canonical" href="https://www.example.com/path/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Judul Halaman" />
<meta property="og:description" content="Ringkasan halaman." />
<meta property="og:url" content="https://www.example.com/path/" />
<meta property="og:image" content="https://www.example.com/path/preview.jpg" />
<meta name="twitter:card" content="summary_large_image" />
```

Tambahkan locale, author, published/modified time, atau metadata lain jika sesuai dengan tipe konten dan benar-benar tersedia.

### 5.2. Title Tag

- Setiap halaman memiliki title yang unik, ringkas, deskriptif, dan sesuai isi.
- Letakkan topik atau nama entitas utama secara natural.
- Sertakan brand bila membantu identifikasi.
- Hindari pengulangan keyword, clickbait, template generik, dan title yang hanya berisi nama brand.
- Jangan menetapkan batas karakter sebagai aturan mutlak; tampilan dapat terpotong sesuai lebar perangkat dan mesin pencari.

### 5.3. Meta Description

- Tulis ringkasan unik yang benar-benar mewakili halaman.
- Jelaskan manfaat, cakupan, produk, layanan, atau informasi yang akan ditemukan.
- Gunakan bahasa natural dan ajakan ringan bila sesuai.
- Hindari keyword stuffing dan description yang sama untuk banyak halaman.
- Description dapat ditulis ulang oleh mesin pencari; perlakukan sebagai ringkasan yang membantu, bukan jaminan snippet.

### 5.4. Open Graph dan Social Preview

- Gunakan gambar preview yang benar-benar mewakili halaman.
- Pastikan URL gambar absolut, dapat diakses publik, dan memiliki dimensi/rasio yang layak untuk platform target.
- Detail produk, artikel, dan halaman utama sebaiknya memiliki preview yang sesuai, bukan selalu satu gambar default.
- Pastikan `og:url` konsisten dengan canonical.
- Uji preview pada platform yang relevan.

### 5.5. Heading dan Struktur Semantik

- Setiap halaman memiliki satu judul utama yang jelas secara konseptual.
- Gunakan heading bertingkat secara logis (`h1`, `h2`, `h3`, dan seterusnya).
- Heading menjelaskan isi bagian, bukan hanya untuk memperbesar teks.
- Jangan memilih heading semata-mata berdasarkan tampilannya; gunakan CSS untuk styling.
- Gunakan `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, `<section>`, `<figure>`, dan elemen semantik lain sesuai maknanya.
- Sediakan breadcrumb bila membantu navigasi dan pemahaman hierarki.

### 5.6. Pola Metadata Berdasarkan Tipe Halaman

| Tipe halaman | Konten metadata dan halaman yang perlu diperhatikan |
|---|---|
| Homepage | Brand, kategori bisnis, value proposition, area layanan atau audiens utama |
| Kategori/katalog | Jenis item, cakupan kategori, manfaat, pilihan/fitur utama |
| Detail produk | Nama produk, fungsi, spesifikasi, model/varian, kondisi ketersediaan yang benar |
| Detail layanan | Nama layanan, cakupan, proses, target pengguna, wilayah jika relevan |
| Artikel/berita | Judul, ringkasan, author, tanggal publikasi/perubahan, topik |
| Studi kasus/portofolio | Klien hanya jika boleh dipublikasikan, lokasi yang dapat diverifikasi, masalah, solusi, hasil terukur |
| Tentang | Identitas, sejarah yang dapat dibuktikan, tim, keahlian, legalitas/sertifikasi yang berlaku |
| Kontak/lokasi | Nama entitas, alamat, telepon, email, jam operasional dan kanal resmi |
| FAQ | Pertanyaan aktual dan jawaban lengkap yang tampil bagi pengguna |
| Halaman pencarian | Hasil relevan untuk pengguna; indexability biasanya dibatasi |
| Legal | Kebijakan atau ketentuan yang benar-benar berlaku; jangan menganggapnya sebagai halaman keyword |

---

## 6. URL, Slug, dan Arsitektur Konten

### 6.1. URL Semantik

- Gunakan URL pendek, deskriptif, mudah dibaca, dan stabil.
- Gunakan slug yang merepresentasikan isi halaman; hindari parameter acak sebagai satu-satunya identitas halaman utama.
- Tetapkan satu pola plural/singular dan konsisten pada seluruh route.
- Gunakan separator yang mudah dibaca (umumnya tanda hubung).
- Hindari tanggal, ID, kategori, atau lokasi dalam slug jika tidak memberi nilai dan berisiko membuat URL cepat usang.
- Slug harus unik dan memiliki aturan benturan yang jelas.
- Encode karakter dengan benar dan hindari URL yang dapat berubah karena input yang tidak disanitasi.

Contoh pola:

```text
/services/
/services/service-name/
/products/
/products/product-name/
/articles/topic-name/
/case-studies/project-name/
```

Struktur aktual harus mengikuti jenis bisnis dan sistem yang sudah ada. Contoh tersebut bukan keharusan.

### 6.2. Search Intent dan Jenis Konten

Kelompokkan konten berdasarkan tujuan pencarian:

- **Informational:** panduan, definisi, edukasi, cara kerja, perbandingan.
- **Navigational:** brand, lokasi, kanal resmi, halaman login yang memang dituju pengguna.
- **Commercial investigation:** review, komparasi, spesifikasi, studi kasus, alternatif.
- **Transactional:** pembelian, booking, demo, konsultasi, permintaan penawaran.
- **Local:** kebutuhan berdasarkan kota, area layanan, cabang, atau lokasi.

Satu halaman sebaiknya memiliki fokus utama yang jelas. Jangan membuat satu halaman untuk setiap variasi keyword yang memiliki maksud pencarian sama tanpa nilai konten tambahan.

### 6.3. Content Hub dan Content Silo

Buat hubungan konten berdasarkan topik dan kebutuhan pembaca:

- Halaman hub menjelaskan topik besar.
- Halaman kategori mengelompokkan konten sejenis.
- Halaman detail membahas satu produk, layanan, pertanyaan, atau kasus secara mendalam.
- Artikel pendukung menghubungkan konsep, cara penggunaan, troubleshooting, perbandingan, dan studi kasus.
- Setiap hubungan harus relevan dan memberikan jalan navigasi yang berguna.

Contoh alur:

```text
Topic Hub
  ├── Guide / Educational Article
  ├── Comparison / FAQ
  ├── Product or Service Detail
  └── Case Study / Proof
```

### 6.4. Internal Linking

- Gunakan anchor text deskriptif dan natural.
- Hubungkan artikel dengan produk/layanan yang benar-benar berkaitan.
- Hubungkan detail produk/layanan dengan panduan, FAQ, studi kasus, atau alternatif yang relevan.
- Sediakan breadcrumb dan navigasi kategori bila membantu.
- Pastikan halaman penting tidak menjadi orphan page.
- Hindari link berlebihan, tautan otomatis yang tidak relevan, dan anchor exact-match berulang secara manipulatif.
- Periksa link yang rusak, route tidak sesuai, redirect internal, dan link tanpa tujuan.
- Untuk situs besar, gunakan rekomendasi konten berdasarkan relevansi, bukan hanya popularitas.

**Distribusi eksposur konten:** daftar konten terkait dapat mempertimbangkan konten baru atau kurang terekspos, tetapi relevansi harus tetap menjadi filter utama. Mengurutkan semua rekomendasi berdasarkan views terendah bukan faktor ranking dan tidak boleh menghasilkan tautan yang tidak relevan.

---

## 7. Content Quality, E-E-A-T, AEO, dan GEO

### 7.1. Standar Kualitas Konten

Setiap halaman harus:

- Memiliki tujuan yang jelas dan menjawab kebutuhan pengguna.
- Mengandung informasi spesifik, bukan sekadar variasi dari konten lain.
- Memberikan detail yang cukup untuk memahami topik dan mengambil keputusan.
- Menghindari klaim absolut, angka tanpa dasar, dan janji hasil yang tidak dapat dibuktikan.
- Menjelaskan istilah teknis atau singkatan saat pertama kali digunakan.
- Menyertakan contoh, langkah, tabel, gambar, diagram, atau bukti ketika membantu pemahaman.
- Memperbarui informasi yang dapat berubah seperti harga, spesifikasi, regulasi, jam operasional, dan ketersediaan.
- Memiliki sumber dan tanggal yang relevan untuk klaim faktual, ilmiah, hukum, atau statistik.

Jangan menetapkan panjang artikel sebagai target tunggal. Panjang konten mengikuti kompleksitas pertanyaan dan manfaat yang perlu diberikan.

### 7.2. E-E-A-T sebagai Kerangka Kepercayaan

Tunjukkan sinyal Experience, Expertise, Authoritativeness, dan Trustworthiness melalui bukti nyata:

- **Experience:** foto pekerjaan, dokumentasi proses, studi kasus, pengalaman penggunaan, hasil lapangan.
- **Expertise:** penulis/peninjau yang kompeten, penjelasan metode, spesifikasi, sumber primer, keahlian yang dapat diverifikasi.
- **Authoritativeness:** identitas organisasi, publikasi relevan, kemitraan, referensi dan pengakuan sah.
- **Trustworthiness:** kontak jelas, kebijakan privasi, ketentuan, informasi harga/ketersediaan yang jujur, kanal resmi, keamanan situs, dan koreksi informasi.

Jangan membuat sertifikasi, testimonial, reviewer, penghargaan, pengalaman, atau hubungan organisasi palsu. E-E-A-T bukan markup atau skor tunggal yang dapat dimanipulasi.

### 7.3. Pola Jawaban AEO

Untuk halaman edukasi, FAQ, tutorial, dan halaman layanan:

1. Mulai bagian dengan jawaban langsung atau definisi singkat.
2. Jelaskan konteks dan batasan jawaban.
3. Tambahkan langkah, alasan, contoh, atau tabel bila diperlukan.
4. Cantumkan kondisi khusus dan pengecualian.
5. Sertakan sumber rujukan yang dapat diperiksa untuk klaim penting.
6. Tutup dengan tindakan lanjutan yang relevan bila membantu pengguna.

Contoh struktur:

```markdown
## Apa fungsi [topik]?
[Jawaban langsung 1–3 kalimat dengan konteks yang cukup.]

## Bagaimana prosesnya?
1. Langkah pertama dan hasil yang diharapkan.
2. Langkah kedua dan hal yang harus diperhatikan.
3. Langkah ketiga dan cara memverifikasi hasil.

## Apa yang memengaruhi hasil?
[Variabel, batasan, dan kondisi khusus.]

## Pertanyaan yang sering diajukan
### [Pertanyaan yang benar-benar ditanyakan pengguna]
[Jawaban yang spesifik dan dapat dipahami tanpa konteks tersembunyi.]

## Sumber dan referensi
- [Sumber primer atau otoritatif]
```

### 7.4. Pola Konten yang Mudah Dipahami Sistem AI

- Sebutkan subjek secara eksplisit; jangan memakai kata ganti yang membuat konteks ambigu.
- Cantumkan definisi, nama lengkap, singkatan, satuan, lokasi, periode, dan versi ketika relevan.
- Pisahkan fakta, opini, estimasi, dan rekomendasi.
- Sajikan angka dengan satuan dan konteks; jelaskan metode bila angka merupakan hasil perhitungan.
- Gunakan tabel untuk data yang benar-benar komparatif.
- Gunakan daftar untuk proses atau kriteria.
- Cantumkan sumber primer dan tautan menuju dokumen pendukung.
- Tampilkan siapa yang menerbitkan dan kapan informasi dibuat/diperbarui jika relevan.
- Hindari teks penting yang hanya tersedia dalam gambar, video, canvas, atau komponen interaktif tanpa transkrip/alternatif teks.
- Jangan membuat paragraf generik berulang yang hanya ditujukan untuk mesin AI.

### 7.5. Sumber, Kutipan, dan Klaim

- Utamakan sumber primer: dokumentasi resmi, lembaga pemerintah, standar, riset asli, laporan resmi, dan dokumentasi pemilik data.
- Berikan atribusi dekat dengan klaim yang didukung.
- Jangan membuat tautan sumber yang tidak pernah diperiksa.
- Jangan mencantumkan referensi hanya demi terlihat otoritatif.
- Untuk data internal, jelaskan asal, periode, dan metodologi jika dapat dipublikasikan.
- Bedakan sumber eksternal, data perusahaan, opini penulis, serta konten yang dibuat dengan bantuan AI.

### 7.6. AI Content Generation

AI boleh membantu riset, outline, drafting, translasi, dan optimasi. Namun:

- Konten harus ditinjau manusia yang memahami bidangnya.
- Verifikasi fakta, angka, sumber, nama entitas, istilah teknis, harga, dan regulasi.
- Jangan memproduksi halaman massal yang tidak memiliki nilai unik.
- Jangan mengarang pengalaman tangan pertama, testimonial, hasil proyek, atau kutipan.
- Simpan tanggal publikasi/perubahan yang benar.
- Gunakan relasi database untuk menghubungkan konten terkait bila CMS mendukung.
- Jangan menerjemahkan secara literal istilah teknis/brand yang harus dipertahankan.

---

## 8. GEO Discovery Files dan Akses AI

### 8.1. `llms.txt` — Opsional, Bukan Pengganti SEO

Website dapat menyediakan `/llms.txt` sebagai ringkasan terstruktur bagi sistem AI atau pengembang yang ingin memahami isi situs. Perlakukan ini sebagai **file pendukung/eksperimental**, bukan pengganti sitemap, HTML, robots, metadata, atau dokumentasi publik.

Isi yang dapat dipertimbangkan:

- Identitas website/organisasi.
- Ringkasan layanan, produk, domain, dan topik utama.
- Tautan ke halaman penting.
- Dokumentasi produk atau layanan.
- Panduan dan FAQ.
- Kebijakan, kontak, dan kanal resmi.
- Tautan ke dokumentasi yang lebih rinci.

Contoh struktur konseptual:

```markdown
# [Nama Website]

> [Deskripsi singkat dan faktual tentang website.]

## About
- [URL profil organisasi]
- [URL kontak]

## Products and Services
- [URL katalog]
- [URL produk/layanan utama]

## Guides and Documentation
- [URL panduan]
- [URL dokumentasi]

## FAQ
- [URL FAQ]

## Policies
- [URL kebijakan privasi]
- [URL ketentuan]
```

Aturan:

- Semua tautan harus benar-benar ada, publik, dan relevan.
- Jangan memasukkan informasi rahasia, endpoint internal, data pelanggan, atau konten yang tidak boleh dipublikasikan.
- Jika dibuat dinamis, gunakan cache dan mekanisme fallback yang sesuai.
- Pastikan hasil selalu konsisten dengan website dan database.
- Pertimbangkan ukuran ringkasan dan pecah dokumen berdasarkan jenis konten bila terlalu besar.
- Jangan menyatakan bahwa file ini menjamin AI akan membaca atau mengutip situs.

### 8.2. File Dokumentasi AI yang Lebih Rinci

Untuk website dengan katalog, dokumentasi, knowledge base, atau konten besar, file terpisah dapat digunakan, misalnya:

```text
/llms.txt
/llms-full.txt
/llms-products.txt
/llms-services.txt
/llms-docs.txt
/llms-faq.txt
/llms-about.txt
/llms-contact.txt
```

Ini adalah konvensi internal website, bukan kumpulan endpoint wajib. Buat hanya jika ada kebutuhan nyata dan isi dapat dipelihara.

### 8.3. `ai.txt` dan Kebijakan Penggunaan AI

Website dapat menerbitkan dokumen kebijakan AI (misalnya pada `/.well-known/ai.txt`) untuk menjelaskan preferensi pemilik situs mengenai perangkuman, penggunaan konten, atribusi, atau kontak. Namun:

- Jangan menganggap format atau directive tersebut sebagai standar universal yang dipatuhi seluruh crawler.
- Jangan menyamakan kebijakan AI dengan `robots.txt`.
- Jangan menjanjikan bahwa instruksi atribusi pasti dipatuhi oleh sistem AI.
- Kebijakan penggunaan konten tidak menggantikan ketentuan hukum, lisensi, atau kontrol teknis.
- Verifikasi dukungan masing-masing platform sebelum mengandalkan directive tertentu.

### 8.4. Robots dan AI Crawlers

- Tentukan kebijakan berdasarkan tujuan bisnis, hak atas konten, keamanan, dan dokumentasi platform crawler yang aktual.
- Jangan mengizinkan semua bot secara membabi buta ke seluruh endpoint.
- Jangan memblokir semua AI crawler secara default tanpa memahami dampaknya terhadap discovery atau fitur produk yang diinginkan.
- WAF, rate limiting, autentikasi, dan bot management harus diterapkan terpisah dari SEO.
- Robots directive merupakan permintaan kepada crawler yang patuh, bukan mekanisme kontrol akses yang aman.
- Crawler untuk pencarian, pengambilan data, dan pelatihan model bisa memiliki identitas serta kebijakan berbeda.

### 8.5. Struktur Dokumen GEO Berdasarkan Jenis Website

| Jenis website | Konten GEO yang paling berguna |
|---|---|
| Company profile | Profil, layanan, lokasi, tim, legalitas, kontak, FAQ |
| E-commerce | Katalog, kategori, spesifikasi, varian, kebijakan harga/pengiriman/retur |
| SaaS/software | Fitur, use case, dokumentasi, integrasi, API, pricing, security, changelog |
| Blog/media | Artikel utama, author, topik, tanggal, sumber, kebijakan editorial |
| Portfolio/agency | Studi kasus, ruang lingkup, metode, deliverables, hasil yang dapat dibuktikan |
| Education | Program, kurikulum, metode, instruktur, persyaratan, FAQ |
| Local business | Profil lokasi, layanan area, jam, kontak, fasilitas, kanal resmi |
| Community/platform | Tentang komunitas, aturan, dokumentasi, kategori, proses partisipasi |

---

## 9. Structured Data — Schema.org JSON-LD

### 9.1. Prinsip Implementasi

Structured data membantu mesin memahami tipe dan hubungan informasi. Gunakan vocabulary Schema.org dan format JSON-LD bila sesuai.

- Pilih schema berdasarkan konten yang benar-benar terlihat di halaman.
- Pastikan nilai JSON-LD konsisten dengan teks yang dapat dilihat pengguna.
- Gunakan identifier `@id` yang stabil untuk entitas yang sama.
- Hubungkan organisasi, website, author, produk, layanan, dan artikel secara konsisten.
- Hindari duplikasi schema yang saling bertentangan dari server, CMS, plugin, dan komponen frontend.
- Jangan menambahkan properti hanya untuk mengejar rich result jika nilainya tidak tersedia atau tidak akurat.
- Validasi JSON, URL, tanggal, gambar, mata uang, ketersediaan, dan relasi.
- Structured data tidak menjamin rich result atau ranking.

### 9.2. Tipe Schema yang Umum

| Tipe Schema | Kapan digunakan |
|---|---|
| `Organization` | Organisasi/perusahaan |
| `LocalBusiness` dan subtype terkait | Bisnis yang memiliki lokasi/operasi lokal dan memenuhi kebutuhan datanya |
| `WebSite` | Identitas situs |
| `WebPage` | Halaman web umum |
| `AboutPage` | Halaman profil/about |
| `ContactPage` | Halaman kontak |
| `CollectionPage` | Halaman koleksi/kategori |
| `Product` | Halaman produk yang benar-benar menawarkan produk |
| `Service` | Halaman layanan bila cocok dengan model data |
| `Article` / `BlogPosting` / `NewsArticle` | Konten artikel sesuai jenisnya |
| `BreadcrumbList` | Breadcrumb yang terlihat di halaman |
| `Person` | Profil penulis, ahli, atau orang yang benar-benar disebut |
| `ImageObject` / `VideoObject` | Media dengan metadata relevan |
| `Event` | Halaman event dengan detail event nyata |
| `Course` / `JobPosting` / tipe lain | Hanya jika halaman memang berisi entitas tersebut dan memenuhi ketentuan yang relevan |

Jangan menggunakan semua tipe schema di semua halaman. Jangan menganggap `FAQPage` atau `HowTo` selalu menghasilkan rich result; dukungan tampilan dan kebijakan platform dapat berubah.

### 9.3. Properti Penting Berdasarkan Entitas

**Organization / LocalBusiness**

- `name`, `url`, `logo`, `description`.
- `sameAs` hanya untuk kanal resmi yang benar-benar dimiliki/dikelola entitas.
- `address`, `telephone`, `email`, `geo`, `openingHoursSpecification` bila datanya benar dan relevan.
- `contactPoint` untuk jenis kontak yang nyata.

**Product**

- `name`, `description`, `image`, `brand`, `sku`/`mpn`/`gtin` bila benar-benar tersedia.
- `offers` hanya jika harga, mata uang, availability, dan URL penawaran valid.
- `aggregateRating` dan `review` hanya dari ulasan nyata yang memenuhi ketentuan serta terlihat sesuai konteks.
- Jangan menggunakan harga `0`, rating default, jumlah review palsu, atau stok yang tidak sesuai.
- Untuk harga negosiasi/B2B, jangan mengarang angka demi mengisi schema. Pilih markup yang valid sesuai data aktual atau tidak menggunakan `Offer` yang tidak didukung.

**Article / BlogPosting / NewsArticle**

- `headline`, `description`, `image`, `datePublished`, `dateModified`.
- `author`, `publisher`, `mainEntityOfPage`.
- Tanggal harus sesuai riwayat editorial, bukan dibuat ulang setiap kali halaman diakses.

**BreadcrumbList**

- Daftar item mengikuti breadcrumb yang benar-benar tampil.
- Posisi dan URL harus sesuai urutan hierarki.

### 9.4. JSON-LD Contoh Organisasi

Gunakan placeholder yang harus diganti dengan data terverifikasi:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.example.com/#organization",
  "name": "[Nama Organisasi Terverifikasi]",
  "url": "https://www.example.com/",
  "logo": "https://www.example.com/assets/logo.png",
  "sameAs": [
    "https://www.example.com/official-social-profile"
  ]
}
</script>
```

Hapus `sameAs` bila belum ada tautan resmi yang dapat diverifikasi. Jangan menerbitkan placeholder.

---

## 10. Multilingual dan Multi-Regional SEO

Jika website mendukung lebih dari satu bahasa atau target negara:

- Setiap versi bahasa yang ingin diindeks harus memiliki URL yang dapat diakses secara langsung dan stabil.
- Terapkan `hreflang` dengan kode bahasa/region yang valid.
- Buat hubungan alternate dua arah/self-reference sesuai implementasi.
- Sediakan canonical untuk setiap versi bahasa dengan aturan yang konsisten.
- Masukkan URL bahasa yang layak diindeks ke sitemap.
- Gunakan atribut `lang` pada elemen `<html>` sesuai bahasa konten halaman.
- Terjemahkan metadata, heading, navigasi, alt text, dan konten utama.
- Hindari mengandalkan `localStorage`, cookie, atau geolocation untuk mengganti bahasa pada URL yang sama jika halaman bahasa terpisah perlu diindeks.
- Jangan membuat terjemahan otomatis yang salah secara konteks atau terminologi.
- Gunakan selector bahasa yang mengarah langsung ke URL versi terkait.

Jika bahasa hanya mengubah label UI dan bukan konten yang ingin diindeks terpisah, jangan membuat URL alternatif dan hreflang secara artifisial.

---

## 11. Local SEO dan Konsistensi Entitas

Untuk bisnis yang memiliki kantor, toko, klinik, cabang, area layanan, atau lokasi fisik:

### 11.1. Konsistensi NAP

Jaga konsistensi:

- **Name:** nama resmi bisnis/cabang.
- **Address:** alamat sesuai format yang benar.
- **Phone:** nomor kontak aktif dan resmi.

Informasi ini sebaiknya konsisten pada halaman kontak, footer, profil bisnis pihak ketiga, schema, dan dokumen GEO. Jika terdapat cabang berbeda, buat identitas dan halaman lokasi yang benar untuk masing-masing cabang.

### 11.2. Halaman Lokasi

Halaman lokasi yang bermanfaat dapat memuat:

- Nama cabang/lokasi.
- Alamat dan petunjuk lokasi.
- Telepon, WhatsApp, email, dan kanal resmi.
- Jam operasional aktual.
- Layanan yang tersedia di lokasi tersebut.
- Foto asli, fasilitas, area layanan, dan peta bila membantu.
- Informasi aksesibilitas/parkir bila relevan.
- FAQ lokal yang benar-benar menjawab kebutuhan pelanggan.

Jangan membuat halaman kota dalam jumlah besar dengan isi yang sama dan hanya mengganti nama kota. Setiap halaman lokasi harus merepresentasikan layanan nyata.

### 11.3. Brand Protection

Untuk mengurangi kebingungan identitas atau peniruan:

- Publikasikan daftar kanal resmi jika risiko penipuan/impersonasi relevan.
- Hubungkan profil sosial resmi melalui website dan `sameAs`.
- Gunakan nama brand dan identitas visual yang konsisten.
- Sediakan halaman kontak/pelaporan penyalahgunaan bila dibutuhkan.
- Klarifikasi domain resmi dan nomor kontak.
- Jangan membuat tuduhan terhadap pihak lain tanpa bukti yang dapat dipertanggungjawabkan.

---

## 12. Image, Video, dan Media SEO

### 12.1. Gambar

- Gunakan nama file yang deskriptif bila memungkinkan.
- Tulis `alt` yang menjelaskan fungsi atau isi gambar secara natural.
- Gambar dekoratif dapat menggunakan alt kosong (`alt=""`).
- Jangan memasukkan daftar keyword ke alt text.
- Kompres gambar dan gunakan format modern yang didukung.
- Tentukan `width` dan `height` atau aspect ratio untuk mengurangi layout shift.
- Gunakan responsive image (`srcset`/`sizes`) bila sesuai.
- Gunakan lazy loading untuk gambar di bawah fold; jangan menunda gambar utama/LCP secara tidak tepat.
- Pastikan gambar penting dapat diakses crawler dan tidak hanya menjadi background CSS jika informasinya esensial.
- Gunakan caption/figure saat memberikan konteks tambahan.

### 12.2. Video dan Audio

- Sediakan judul, ringkasan, dan konteks media.
- Untuk video penting, sediakan transkrip atau ringkasan tekstual.
- Gunakan thumbnail yang representatif dan dapat diakses publik.
- Gunakan `VideoObject` hanya bila metadata video nyata tersedia.
- Pastikan embed tidak menghambat halaman utama.
- Jangan mengandalkan konten audio/video sebagai satu-satunya tempat menyampaikan fakta penting.

### 12.3. File dan Dokumen

PDF, dokumen, atau file unduhan penting sebaiknya memiliki halaman HTML yang menjelaskan isi, pemilik, tanggal/versi, dan tujuan unduhan. Gunakan nama file deskriptif dan teks tautan yang jelas.

---

## 13. Performa, Mobile, dan Accessibility

### 13.1. Core Web Vitals dan Performa

Audit metrik pengalaman pengguna, khususnya:

- **LCP:** kecepatan tampilnya konten utama.
- **INP:** responsivitas terhadap interaksi.
- **CLS:** kestabilan layout.

Gunakan hasil pengukuran lapangan dan laboratorium yang tersedia. Periksa dokumentasi resmi terbaru untuk ambang batas dan metodologi yang berlaku; jangan mengunci angka lama ke dalam kode atau checklist permanen.

Optimasi yang dapat dipertimbangkan:

- Kompresi HTML/CSS/JS dan resource yang mendukung.
- Minifikasi dan tree-shaking.
- Code splitting dan lazy loading route/komponen berat.
- Kurangi JavaScript yang tidak dibutuhkan pada halaman publik.
- Cache aset statis dengan strategi versioning yang aman.
- Optimalkan font, preload resource penting jika terbukti diperlukan, dan gunakan `font-display` yang tepat.
- Optimalkan gambar utama dan urutan prioritas download.
- Batasi script third-party, embed, dan widget yang menghambat rendering.
- Hindari layout shift dari gambar, iklan, font, dan elemen yang disisipkan dinamis.
- Gunakan CDN bila sesuai kebutuhan trafik dan lokasi audiens.

### 13.2. Mobile Usability

- Gunakan viewport standar yang tidak melarang zoom.
- Pastikan layout responsif dan tidak menyebabkan horizontal overflow.
- Pastikan teks, tombol, navigasi, form, tabel, dan modal dapat digunakan di layar kecil.
- Jangan menyembunyikan informasi penting hanya pada desktop.
- Pastikan elemen interaktif dapat digunakan dengan keyboard dan teknologi bantu.

### 13.3. Accessibility

- Gunakan label form yang jelas.
- Gunakan alt text sesuai fungsi gambar.
- Jaga kontras warna dan fokus keyboard.
- Gunakan nama link dan button yang menjelaskan tindakan.
- Gunakan heading dan landmark semantik.
- Jangan memakai warna sebagai satu-satunya penanda status.
- Hindari menonaktifkan zoom pengguna.
- Pastikan modal, dropdown, tab, dan accordion dapat dioperasikan dengan keyboard.

---

## 14. Analytics, Search Measurement, dan Conversion Tracking

### 14.1. Measurement Plan

Tentukan KPI berdasarkan tujuan website. Contoh:

| Tujuan | Metrik yang dapat digunakan |
|---|---|
| Discovery | Indexed pages, impressions, search queries, organic landing pages |
| Acquisition | Organic clicks, CTR, sessions, referral source |
| Engagement | Engaged sessions, scroll/interaction, downloads, video engagement |
| Lead generation | Form submissions, calls, WhatsApp clicks, demo/quote requests |
| E-commerce | Product views, add-to-cart, checkout, completed purchase, revenue |
| Content quality | Landing page performance, return visits, content-assisted conversion |
| GEO visibility | Referral visits dari platform AI jika terdeteksi, citation/mention monitoring yang dapat diverifikasi |

Jangan memakai views sebagai satu-satunya ukuran kualitas atau menjadikan views sebagai indikator langsung ranking.

### 14.2. Analytics Implementation

- Gunakan satu pengelola pageview yang konsisten.
- Pada SPA, kirim pageview saat route berubah dan cegah duplikasi dari auto tracking.
- Pisahkan event interaksi dari pageview.
- Gunakan event naming dan parameter yang konsisten.
- Track CTA penting, form success, click-to-call, WhatsApp, booking, checkout, download, dan tindakan bisnis lainnya.
- Hindari mengirim PII (Personally Identifiable Information) atau data sensitif ke analytics.
- Terapkan consent dan retensi data sesuai kebutuhan hukum dan kebijakan yang berlaku.
- Jika menggunakan first-party analytics, minimalkan data yang dikumpulkan, lindungi akses, dan tetapkan retensi.
- Jangan menyimpan IP atau lokasi presisi tanpa dasar yang sah dan kebutuhan yang jelas.

### 14.3. Aturan SPA Analytics

Saat route berubah:

1. Pastikan halaman baru selesai diidentifikasi.
2. Update metadata yang diperlukan.
3. Kirim satu pageview untuk URL yang benar.
4. Catat conversion event hanya setelah tindakan benar-benar berhasil.
5. Hindari pengiriman event ganda akibat hydration, route effect, dan script global yang berjalan bersamaan.

### 14.4. Search Console dan Webmaster Tools

Jika tersedia, hubungkan properti domain yang benar dan pantau:

- Coverage/indexing dan excluded pages.
- Sitemap status.
- Crawl issues dan server errors.
- Search performance: query, page, country, device, impressions, clicks, CTR.
- Structured data enhancement/report yang relevan.
- Manual actions dan security issues.

Gunakan data untuk memilih tindakan perbaikan, bukan sekadar mengejar kenaikan skor.

---

## 15. CMS, Database, dan Konten Dinamis

Untuk website yang mengelola produk, artikel, layanan, kategori, atau portofolio melalui database/CMS:

- Simpan field SEO secara terstruktur bila kebutuhan editorial memerlukannya: title, description, slug, canonical override, OG image, robots directive, author, publish date, modified date, language, dan structured data fields.
- Sediakan fallback otomatis dari nama/judul dan ringkasan konten, tetapi izinkan editor melakukan override.
- Validasi keunikan slug dan tangani collision dengan baik.
- Saat slug berubah, buat redirect dari URL sebelumnya bila perlu.
- Hanya tampilkan konten yang berstatus published/public dan memenuhi aturan publikasi.
- `lastmod` harus mencerminkan perubahan konten yang relevan.
- Gunakan pagination yang dapat diakses dan URL yang stabil.
- Pastikan halaman kategori memiliki pengantar yang berguna; jangan hanya menjadi kumpulan kartu tanpa konteks bila kategori tersebut ditargetkan untuk pencarian.
- Hindari menghasilkan ribuan halaman tipis dari kombinasi filter, lokasi, tag, atau parameter.
- Gunakan cache dan fallback bila data dinamis diperlukan untuk sitemap atau dokumen GEO.
- Sanitasi HTML/Markdown dan escape JSON-LD untuk mencegah XSS dan markup rusak.

### 15.1. Konten yang Dihapus atau Tidak Lagi Tersedia

Tentukan skenario:

- Dipindahkan: redirect ke pengganti yang benar-benar relevan.
- Dihapus permanen tanpa pengganti: status 404/410.
- Tidak tersedia sementara: status dan pesan yang sesuai; jangan menjadikan halaman kosong sebagai `200`.
- Diganti model/versi baru: jelaskan relasi versi dan tautkan ke halaman pengganti jika relevan.

---

## 16. Security dan Privacy yang Berkaitan dengan SEO

- `robots.txt` bukan proteksi data.
- Jangan memasukkan token, key, data pelanggan, informasi internal, URL admin sensitif, atau dokumentasi privat ke sitemap/llms files.
- Lindungi dashboard, API privat, file backup, dan file konfigurasi dengan autentikasi serta aturan server.
- Jangan mengekspos direktori listing, source map sensitif, log, dump database, atau file environment.
- Escape konten dinamis pada HTML dan JSON-LD.
- Validasi URL gambar, canonical, redirect target, dan input konten.
- Gunakan HTTPS untuk seluruh halaman dan resource yang mendukung.
- Pastikan caching tidak membocorkan halaman privat atau personalized content ke pengguna lain.
- Hati-hati mengirim data analytics ke layanan eksternal; minimalkan PII dan terapkan consent sesuai ketentuan yang berlaku.

---

## 17. Audit Gap Analysis dan Rekomendasi

Setelah audit, agent wajib menghasilkan temuan yang dapat ditindaklanjuti. Format yang disarankan:

| ID | Temuan | Lokasi | Dampak | Prioritas | Rekomendasi | Status |
|---|---|---|---|---|---|---|
| SEO-001 | Canonical tidak konsisten | Template/page head | Risiko duplikasi URL | P0 | Satukan canonical per route | Open |
| SEO-002 | Route detail tidak tersedia pada direct request | Server routing | Halaman tidak dapat dirayapi/diakses | P0 | Perbaiki fallback/SSR routing | Open |
| GEO-001 | Profil organisasi tidak konsisten | About/footer/structured data | Entitas sulit dipahami | P1 | Satukan data identitas terverifikasi | Open |

Contoh area audit:

- Metadata default dipakai di semua halaman.
- Metadata halaman dinamis tidak tersedia di HTML awal.
- Canonical mengarah ke homepage atau salah host.
- Sitemap berisi URL redirect, noindex, duplikat, atau 404.
- Robots memblokir resource yang diperlukan.
- Route detail tidak bisa dibuka langsung.
- Internal link menunjuk ke slug/path yang tidak benar.
- JSON-LD memuat harga/rating/tanggal/ulasan yang tidak nyata.
- Konten utama hanya muncul setelah interaksi JavaScript.
- Halaman bahasa berbeda memakai URL/canonical yang sama padahal ditargetkan untuk indexing terpisah.
- Gambar utama terlalu berat atau tanpa dimensi.
- Viewport mematikan zoom.
- Halaman publik mengunduh bundle/admin dependency yang tidak diperlukan.
- Artikel tidak memiliki author/sumber untuk klaim yang memerlukan bukti.
- Dokumen GEO menautkan URL yang tidak ada atau informasi yang sudah usang.
- Analytics mengirim pageview ganda atau PII.

---

## 18. Testing dan Validasi Setelah Implementasi

Jalankan pengujian sesuai tool dan akses yang tersedia:

### 18.1. HTTP dan Routing

- [ ] Homepage mengembalikan status yang benar.
- [ ] URL detail/kategori dapat dibuka langsung dan setelah refresh.
- [ ] URL lama redirect ke tujuan yang benar bila ada migrasi.
- [ ] Tidak ada redirect loop atau chain yang tidak perlu.
- [ ] Error route mengirim status HTTP yang benar.
- [ ] Metadata untuk beberapa route dinamis benar-benar spesifik.

### 18.2. HTML dan Metadata

- [ ] Title dan description unik untuk setiap halaman penting.
- [ ] Canonical tunggal, valid, dan konsisten.
- [ ] Open Graph dan Twitter/X metadata sesuai halaman.
- [ ] Hanya ada satu sumber pengelolaan metadata utama.
- [ ] HTML awal memuat konten utama atau strategi rendering yang memadai.
- [ ] Heading dan landmark semantik.
- [ ] Alt text informatif dan tidak keyword-stuffed.

### 18.3. Crawl dan Indexing

- [ ] `robots.txt` dapat diakses dan tidak memblokir konten penting.
- [ ] Sitemap valid, menggunakan URL canonical, dan bebas URL error/noindex.
- [ ] Internal links mengarah ke URL yang benar.
- [ ] Parameter dan pagination memiliki kebijakan index/canonical.
- [ ] Halaman privat tidak terekspos dan tetap dilindungi secara teknis.

### 18.4. Structured Data

- [ ] JSON-LD valid secara sintaks.
- [ ] Tipe schema sesuai jenis halaman.
- [ ] Data schema sama dengan konten yang terlihat.
- [ ] Tidak ada rating, harga, review, availability, atau tanggal palsu.
- [ ] Tidak ada duplicate/conflicting entities.

### 18.5. AEO/GEO

- [ ] Pertanyaan utama dijawab dengan jelas.
- [ ] Definisi, nama entitas, satuan, periode, dan konteks tidak ambigu.
- [ ] Fakta penting memiliki sumber atau dasar yang jelas.
- [ ] Tabel/list digunakan saat membantu pemahaman.
- [ ] Dokumen GEO (bila ada) valid dan tautannya hidup.
- [ ] Tidak ada informasi privat atau klaim yang tidak dapat dibuktikan.

### 18.6. UX dan Performa

- [ ] Mobile layout dan zoom berfungsi.
- [ ] Tidak ada horizontal overflow yang tidak diinginkan.
- [ ] Gambar utama dioptimalkan.
- [ ] Lazy loading diterapkan secara tepat.
- [ ] Font dan script third-party tidak menghambat render secara berlebihan.
- [ ] Core Web Vitals dan accessibility diperiksa dengan tool yang tersedia.

### 18.7. Analytics dan Build

- [ ] Pageview tidak terkirim ganda.
- [ ] Conversion event hanya dicatat setelah tindakan berhasil.
- [ ] Tidak mengirim PII yang tidak diperlukan.
- [ ] Build, test, lint, dan type-check lulus sesuai konfigurasi proyek.
- [ ] Tidak ada regresi route, form, authentication, dan fitur bisnis.

### 18.8. Tools yang Dapat Digunakan

Pilih tool yang sesuai dan tersedia, misalnya:

- Browser DevTools dan view-source.
- `curl` atau HTTP client untuk status, redirect, dan header.
- Crawler seperti Screaming Frog atau alternatif open-source.
- Google Search Console dan Bing Webmaster Tools.
- PageSpeed Insights, Lighthouse, dan Chrome DevTools.
- Rich Results Test dan Schema Markup Validator.
- Social sharing preview/debugger yang relevan.
- Log server, analytics, serta monitoring uptime.

Jangan mengklaim pengujian berhasil jika tool tidak dijalankan atau aksesnya tidak tersedia. Laporkan apa yang sudah diuji dan apa yang masih perlu diverifikasi di lingkungan produksi.

---

## 19. Deliverables yang Harus Dihasilkan Agent

Setiap pekerjaan audit/implementasi SEO-GEO idealnya menghasilkan:

1. **Project Discovery Summary** — stack, framework, arsitektur rendering, jenis website, domain, dan inventaris route.
2. **SEO/GEO Audit** — temuan existing, gap, risiko, dan prioritas.
3. **Implementation Plan** — daftar file yang akan diubah dan pendekatan yang dipilih.
4. **Code Changes** — implementasi yang mengikuti stack serta standar proyek.
5. **Validation Report** — build/test, status URL, metadata, sitemap, schema, rendering, dan hasil tool yang benar-benar dijalankan.
6. **Remaining Issues** — bagian yang tidak dapat diselesaikan, membutuhkan akses eksternal, data pemilik, atau validasi manual.
7. **Maintenance Notes** — cara memperbarui konten, sitemap, schema, profil entitas, dan dokumen GEO.

Jangan hanya memberikan daftar rekomendasi bila pengguna meminta implementasi langsung dan agent memiliki akses yang memadai. Sebaliknya, jangan mengubah kode tanpa persetujuan bila pengguna hanya meminta audit atau analisis.

---

## 20. Master Prompt untuk Coding Agent

Bagian berikut dapat digunakan sebagai instruksi langsung setiap kali agent diminta mengaudit atau mengimplementasikan SEO dan GEO pada repository website.

```text
ROLE
You are a senior Technical SEO, AEO, GEO, web architecture, and accessibility engineer.
Your task is to audit and improve the current website project using the repository's existing technology stack and architecture.

PRIMARY OBJECTIVE
Make the website technically crawlable, indexable where appropriate, semantically understandable, useful to users, accessible, fast, and clearly attributable as an information source for search engines and AI answer systems.

MANDATORY WORKFLOW
1. Inspect the entire relevant project structure before making changes.
2. Identify the framework, language, CMS, backend, database, router, rendering strategy, web server, hosting assumptions, and build/deploy process.
3. Inventory all public routes and distinguish them from private/admin/authenticated routes.
4. Audit existing metadata, canonical, robots.txt, sitemap.xml, structured data, rendering, internal links, content, media, multilingual support, analytics, and performance.
5. Produce a concise findings list with file paths, evidence, impact, and priority.
6. Implement critical fixes first, followed by high-value SEO/GEO improvements.
7. Reuse existing architecture and dependencies. Do not force a particular framework or introduce unnecessary packages.
8. Test the implementation and report the exact validation performed.

NON-NEGOTIABLE RULES
- Do not fabricate business facts, author credentials, reviews, ratings, testimonials, prices, stock, certifications, locations, statistics, dates, or citations.
- Do not use keyword stuffing, doorway pages, mass-generated thin content, cloaking, or deceptive redirects.
- Do not treat robots.txt as access control.
- Do not expose private endpoints, credentials, user data, admin files, or internal documentation in public SEO/GEO outputs.
- Do not add structured data that does not match visible and verifiable page content.
- Do not create duplicate title, description, canonical, Open Graph, or conflicting JSON-LD.
- Do not change established URLs without an appropriate redirect plan.
- Do not break existing features, authentication, forms, analytics, or API behavior.
- Do not assume that llms.txt or ai.txt guarantees AI crawling, citation, or attribution. Treat them as optional support files.
- Do not claim that a page is indexed or cited unless that has been verified through an appropriate source.

TECHNICAL REQUIREMENTS
A. Rendering and routing
- Make important public route content and metadata available in initial HTML through the most suitable existing method: static HTML, SSG, SSR, prerendering, or CMS rendering.
- For SPA projects, ensure direct route requests and refreshes work; synchronize metadata on client navigation without relying only on client-side updates.
- Keep crawler-visible content consistent with user-visible content.

B. Metadata and URL
- Provide unique, accurate title and meta description for every indexable route.
- Set one correct absolute canonical URL per indexable page.
- Configure Open Graph and Twitter/X metadata using relevant public images.
- Define clear index/noindex rules for admin, search, filters, duplicate, and thin pages.
- Use semantic, stable URLs and manage redirects safely.

C. Crawl and discovery
- Provide a correct robots.txt without blocking essential rendering resources.
- Generate a valid XML sitemap containing only canonical, public, indexable URLs with accurate last modification dates.
- Include dynamic content from the CMS/database only when published and eligible for indexing.
- Never expose private content through sitemap, feeds, or AI documentation.

D. Content and semantics
- Use logical heading hierarchy and semantic HTML.
- Make page intent, primary topic, and primary entity explicit.
- Answer relevant user questions clearly and directly.
- Use meaningful internal links, breadcrumbs, descriptive image alt text, tables, and lists when appropriate.
- Support content accuracy with verifiable sources, authorship, dates, and real experience where available.

E. Structured data
- Use relevant Schema.org JSON-LD only when supported by visible page content and real data.
- Reuse stable entity identifiers where appropriate.
- Never invent Product offers, prices, ratings, reviews, availability, or business facts.
- Validate JSON-LD and remove duplicate/conflicting schema.

F. GEO support
- Improve entity clarity, factual specificity, source attribution, content structure, and public documentation.
- Optionally create or improve llms.txt and supporting Markdown resources when useful for this project.
- Optionally publish an AI usage policy only after checking the site's legal/business requirements; do not assume universal crawler support.
- Keep all GEO documents accurate, current, linked, and free of confidential data.

G. Local and multilingual SEO
- If the business is local, keep official name, address, phone, service area, opening hours, map, and business profiles consistent and verified.
- If multilingual pages should be indexed separately, use stable language URLs, correct html lang, canonical, hreflang, and sitemap entries.
- Do not generate fake location pages or duplicate translations.

H. Performance, accessibility, and analytics
- Audit LCP, INP, CLS, mobile usability, image optimization, scripts, caching, and compression using available tools.
- Keep zoom available and support keyboard/screen-reader access.
- Avoid duplicate SPA pageviews and track meaningful conversions without sending unnecessary personal data.

VALIDATION
- Run the project's build, tests, lint, and type checks when available.
- Test representative public URLs, including dynamic detail routes and direct refresh.
- Inspect actual HTML/head output, status codes, redirects, robots.txt, and sitemap.xml.
- Validate structured data and verify internal links.
- Test mobile layout and performance with available tools.
- Separate confirmed results from assumptions or checks that require production access.

FINAL RESPONSE FORMAT
1. Project architecture summary.
2. Critical findings ordered by priority.
3. Files changed and what changed.
4. SEO/GEO features implemented.
5. Tests and validation actually performed, including results.
6. Remaining risks, blockers, and production checks.
7. Maintenance instructions.

Proceed autonomously within the requested scope. Prefer the smallest safe change that solves the problem. If a detail is unknown, inspect the repository and available data; do not invent it. If implementation is blocked by missing credentials, external access, or business facts, complete all safe work possible and clearly identify the blocker.
```

---

## 21. Maintenance Checklist Berkala

### Setiap Publikasi Konten

- [ ] Topik dan search intent jelas.
- [ ] Title, description, slug, dan heading spesifik.
- [ ] Konten akurat, unik, dan bermanfaat.
- [ ] Klaim penting memiliki sumber/bukti.
- [ ] Author dan tanggal benar bila relevan.
- [ ] Gambar memiliki alt text, ukuran, dan format yang tepat.
- [ ] Internal link relevan.
- [ ] Canonical dan schema sesuai.
- [ ] Konten siap dipublikasikan dan URL dapat diakses.

### Bulanan atau Sesuai Skala Website

- [ ] Periksa sitemap dan error indexing.
- [ ] Periksa broken links, redirect, dan 404.
- [ ] Tinjau halaman dengan impresi tinggi tetapi CTR rendah.
- [ ] Tinjau halaman dengan trafik turun atau konten usang.
- [ ] Periksa performa mobile dan Core Web Vitals.
- [ ] Periksa akurasi data produk/layanan, harga, lokasi, jam, dan kontak.
- [ ] Periksa dokumen GEO dan tautan pendukung bila tersedia.
- [ ] Tinjau konversi organik dan kualitas lead, bukan hanya traffic.

### Saat Ada Perubahan Besar

- [ ] Domain atau struktur URL berubah.
- [ ] Migrasi CMS/framework/hosting.
- [ ] Redesain template atau sistem routing.
- [ ] Perubahan bahasa/negara target.
- [ ] Penghapusan produk, kategori, artikel, atau lokasi.
- [ ] Perubahan identitas brand atau kanal resmi.
- [ ] Perubahan consent, analytics, atau kebijakan privasi.

Lakukan audit ulang terhadap redirect, canonical, sitemap, schema, rendering, analytics, dan indexing setelah perubahan besar.

---

## 22. Prinsip Penutup

SEO dan GEO bukan sekadar menambahkan meta tag, schema, atau file khusus AI. Keduanya bergantung pada fondasi yang sama: **website yang dapat diakses, konten yang benar-benar berguna, struktur yang jelas, identitas yang konsisten, bukti yang dapat diverifikasi, serta pengalaman pengguna yang baik.**

Gunakan fitur teknis sesuai kebutuhan proyek. Bangun halaman untuk membantu manusia terlebih dahulu, kemudian pastikan mesin dapat memahami dan mengakses informasi yang sama. Ukur hasilnya, perbaiki berdasarkan data, dan jangan mengorbankan akurasi demi mengejar visibilitas.

> **Standar keputusan untuk agent:** implementasikan yang relevan, jangan memaksakan yang tidak relevan, jangan mengarang data, dan selalu validasi hasil.
