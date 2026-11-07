// Client-side metadata, Open Graph, Twitter Card, and dynamic database-backed Schema.org JSON-LD utilities.

export const SITE_ORIGIN = 'https://cssunmotor.com'
const SEO_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/OldSunny/api/public/api'

export const DEFAULT_SEO = {
  siteName: 'Mitsubishi Sun Margahayu',
  title: 'Mitsubishi Sun Margahayu | Dealer Transparan & Bengkel Resmi 24/7',
  description:
    'Dealer resmi Mitsubishi Sun Star Prima Motor Margahayu Bekasi. Layanan transparansi penuh: simulasi kredit transparan, unit Xforce, Destinator, Pajero Sport, Xpander, servis bengkel 24/7, dan verifikasi sales resmi.',
  keywords:
    'mitsubishi bekasi, mitsubishi sun margahayu, dealer mitsubishi bekasi timur, servis mitsubishi 24 jam, xforce, destinator, pajero sport, xpander, booking service mitsubishi, sun star prima motor',
  image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
  type: 'website',
  author: 'PT Sun Star Prima Motor',
  robots: 'index, follow',
}

export const PAGE_SEO_CONFIG = {
  '/': {
    title: 'Mitsubishi Sun Margahayu | Dealer Transparan & Bengkel Resmi 24/7',
    description:
      'Dealer resmi Mitsubishi Sun Star Prima Motor Margahayu Bekasi. Layanan transparansi penuh: simulasi kredit transparan, unit Xforce, Destinator, Pajero Sport, Xpander, servis bengkel 24/7, dan verifikasi sales resmi.',
    keywords:
      'mitsubishi bekasi, mitsubishi sun margahayu, dealer mitsubishi, servis mitsubishi 24 jam, xforce, destinator, pajero sport, xpander',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    breadcrumbName: 'Beranda',
  },
  '/vehicles': {
    title: 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
    description:
      'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi Bekasi: Destinator, New Xforce, New Pajero Sport, Xpander, Xpander Cross, Triton, L300, dan Fuso.',
    keywords:
      'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, mitsubishi destinator, promo xpander bekasi, simulasi kredit mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
    breadcrumbName: 'Katalog Kendaraan',
  },
  '/vehicle-list': {
    title: 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
    description:
      'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi Bekasi: Destinator, New Xforce, New Pajero Sport, Xpander, Xpander Cross, Triton, L300, dan Fuso.',
    keywords:
      'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, mitsubishi destinator, promo xpander bekasi, simulasi kredit mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
    canonicalPath: '/vehicles',
    breadcrumbName: 'Katalog Kendaraan',
  },
  '/promo': {
    title: 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
    description:
      'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
    keywords:
      'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi, bunga 0 persen mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    breadcrumbName: 'Promo & Penawaran',
  },
  '/promo-event': {
    title: 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
    description:
      'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
    keywords:
      'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi, bunga 0 persen mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    canonicalPath: '/promo',
    breadcrumbName: 'Promo & Penawaran',
  },
  '/booking': {
    title: 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Jadwalkan perawatan berkala, servis cepat, Extended SMART Package, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu.',
    keywords:
      'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi, ganti oli mitsubishi, perawatan berkala xpander',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
    breadcrumbName: 'Booking Servis',
  },
  '/booking-service': {
    title: 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Jadwalkan perawatan berkala, servis cepat, Extended SMART Package, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu.',
    keywords:
      'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi, ganti oli mitsubishi, perawatan berkala xpander',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
    canonicalPath: '/booking',
    breadcrumbName: 'Booking Servis',
  },
  '/service-on-road': {
    title: 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
    description:
      'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
    keywords:
      'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi, derek mobil mitsubishi, darurat bengkel 24 jam',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
    breadcrumbName: 'Service on Road 24 Jam',
  },
  '/service-on-the-road': {
    title: 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
    description:
      'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
    keywords:
      'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi, derek mobil mitsubishi, darurat bengkel 24 jam',
    image: 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
    canonicalPath: '/service-on-road',
    breadcrumbName: 'Service on Road 24 Jam',
  },
  '/facilities': {
    title: 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Eksplorasi fasilitas 3S + Body Paint berstandar global: VIP Lounge, gratis voucher Noach Coffee, Kids Zone, WFA Station Wi-Fi 6, dan Free Shuttle Service.',
    keywords:
      'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu, lounge dealer mitsubishi, body paint mitsubishi bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    breadcrumbName: 'Fasilitas Dealer',
  },
  '/fasilitas': {
    title: 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Eksplorasi fasilitas 3S + Body Paint berstandar global: VIP Lounge, gratis voucher Noach Coffee, Kids Zone, WFA Station Wi-Fi 6, dan Free Shuttle Service.',
    keywords:
      'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu, lounge dealer mitsubishi, body paint mitsubishi bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    canonicalPath: '/facilities',
    breadcrumbName: 'Fasilitas Dealer',
  },
  '/services': {
    title: 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
    description:
      'Eksplorasi fasilitas 3S + Body Paint berstandar global: VIP Lounge, gratis voucher Noach Coffee, Kids Zone, WFA Station Wi-Fi 6, dan Free Shuttle Service.',
    keywords:
      'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu, lounge dealer mitsubishi, body paint mitsubishi bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    canonicalPath: '/facilities',
    breadcrumbName: 'Fasilitas Dealer',
  },
  '/accessories': {
    title: 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
    description:
      'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi Genuine Accessories dan suku cadang resmi di Sun Margahayu Bekasi.',
    keywords:
      'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi, body kit mitsubishi, suku cadang mitsubishi bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    breadcrumbName: 'Aksesoris & Sparepart',
  },
  '/aksesoris': {
    title: 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
    description:
      'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi Genuine Accessories dan suku cadang resmi di Sun Margahayu Bekasi.',
    keywords:
      'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi, body kit mitsubishi, suku cadang mitsubishi bekasi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    canonicalPath: '/accessories',
    breadcrumbName: 'Aksesoris & Sparepart',
  },
  '/sales': {
    title: 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
    description:
      'Verifikasi profil sales konsultan resmi PT Sun Star Prima Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
    keywords:
      'sales mitsubishi bekasi, sales resmi sun margahayu, sales consultant mitsubishi, verifikasi sales anti penipuan',
    image: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
    breadcrumbName: 'Sales Resmi Terverifikasi',
  },
  '/sales-list': {
    title: 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
    description:
      'Verifikasi profil sales konsultan resmi PT Sun Star Prima Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
    keywords:
      'sales mitsubishi bekasi, sales resmi sun margahayu, sales consultant mitsubishi, verifikasi sales anti penipuan',
    image: 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
    canonicalPath: '/sales',
    breadcrumbName: 'Sales Resmi Terverifikasi',
  },
  '/organization': {
    title: 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
    description:
      'Mengenal jajaran manajemen dan tim profesional PT Sun Star Prima Motor Margahayu Bekasi yang melayani kepemilikan Mitsubishi Anda.',
    keywords:
      'struktur organisasi sun margahayu, profil pt sun star prima motor bekasi, dealer mitsubishi bekasi timur',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    breadcrumbName: 'Struktur Organisasi',
  },
  '/struktur-organisasi': {
    title: 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
    description:
      'Mengenal jajaran manajemen dan tim profesional PT Sun Star Prima Motor Margahayu Bekasi yang melayani kepemilikan Mitsubishi Anda.',
    keywords:
      'struktur organisasi sun margahayu, profil pt sun star prima motor bekasi, dealer mitsubishi bekasi timur',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    canonicalPath: '/organization',
    breadcrumbName: 'Struktur Organisasi',
  },
  '/about': {
    title: 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
    description:
      'Mengenal jajaran manajemen dan tim profesional PT Sun Star Prima Motor Margahayu Bekasi yang melayani kepemilikan Mitsubishi Anda.',
    keywords:
      'struktur organisasi sun margahayu, profil pt sun star prima motor bekasi, dealer mitsubishi bekasi timur',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    canonicalPath: '/organization',
    breadcrumbName: 'Struktur Organisasi',
  },
  '/news': {
    title: 'Berita, Edukasi Otomotif & Update Resmi | Mitsubishi Sun Margahayu',
    description:
      'Kumpulan artikel otomotif terkini, tips perawatan mobil, review unit Mitsubishi, dan pengumuman program dealer Sun Margahayu.',
    keywords:
      'berita mitsubishi, tips otomotif mitsubishi, review xforce bekasi, artikel dealer sun margahayu',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
    breadcrumbName: 'Berita & Edukasi',
  },
  '/contact': {
    title: 'Kontak & Lokasi Dealer Resmi | Mitsubishi Sun Margahayu Bekasi',
    description:
      'Alamat lengkap Jl. Ir. H. Juanda No. 35 Bekasi Timur, nomor telepon (021) 8834 7777, WhatsApp resmi, rekening sah BCA 3425419999, dan peta rute dealer.',
    keywords:
      'alamat mitsubishi sun margahayu, nomor telepon mitsubishi bekasi, whatsapp dealer mitsubishi bekasi, rekening pt sun star prima motor',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    breadcrumbName: 'Kontak & Lokasi',
  },
  '/faq': {
    title: 'Pusat Bantuan & Pertanyaan Umum (FAQ) Resmi | Mitsubishi Sun Margahayu',
    description:
      'Jawaban resmi berbasis database real-time seputar harga OTR Mitsubishi Bekasi, promo kredit bunga 0%, paket servis SMART, suku cadang, dan verifikasi sales sah.',
    keywords:
      'faq mitsubishi bekasi, tanya jawab mitsubishi sun margahayu, info harga dan servis mitsubishi, verifikasi rekening bca pt sun star prima motor',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    breadcrumbName: 'Pusat Bantuan & FAQ',
  },
  '/faqs': {
    title: 'Pusat Bantuan & Pertanyaan Umum (FAQ) Resmi | Mitsubishi Sun Margahayu',
    description:
      'Jawaban resmi berbasis database real-time seputar harga OTR Mitsubishi Bekasi, promo kredit bunga 0%, paket servis SMART, suku cadang, dan verifikasi sales sah.',
    keywords:
      'faq mitsubishi bekasi, tanya jawab mitsubishi sun margahayu, info harga dan servis mitsubishi, verifikasi rekening bca pt sun star prima motor',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    canonicalPath: '/faq',
    breadcrumbName: 'Pusat Bantuan & FAQ',
  },
  '/search': {
    title: 'Pencarian Layanan & Kendaraan | Mitsubishi Sun Margahayu',
    description:
      'Temukan informasi unit mobil, paket servis, promo terkini, dan panduan otomotif di Mitsubishi Sun Margahayu.',
    keywords: 'pencarian mitsubishi sun margahayu, cari mobil bekasi, cari servis mitsubishi',
    image: 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
    robots: 'noindex, follow',
    breadcrumbName: 'Pencarian',
  },
}

const FALLBACK_FAQS_BY_ROUTE = {
  '/': [
    {
      q: 'Apa saja model mobil unggulan dan harga OTR Mitsubishi terbaru di Sun Margahayu Bekasi?',
      a: 'Berdasarkan price list resmi, 3 model unggulan kami adalah Mitsubishi New Xforce (Rp 388.000.000 s/d Rp 460.000.000), Mitsubishi Destinator (Rp 402.000.000 s/d Rp 517.000.000), dan Mitsubishi New Pajero Sport (Rp 591.000.000 s/d Rp 794.000.000). Tersedia pula New Xpander (mulai Rp 274.500.000), New Xpander Cross (mulai Rp 348.000.000), All New Triton (mulai Rp 340.000.000), Colt L300 Euro 4 (mulai Rp 255.000.000), serta lini niaga Fuso.',
    },
    {
      q: 'Apa nomor rekening resmi PT Sun Star Prima Motor untuk pembayaran SPK, DP, dan servis?',
      a: 'Seluruh transaksi pemesanan kendaraan (SPK), uang muka (DP), pelunasan, servis bengkel, Body & Paint, maupun suku cadang HANYA SAH apabila ditransfer ke rekening Bank BCA 3425419999 atas nama PT Sun Star Prima Motor. Dilarang keras mentransfer dana ke rekening pribadi sales atau oknum manapun.',
    },
    {
      q: 'Siapa pimpinan cabang dan bagaimana status verifikasi staf resmi di Mitsubishi Sun Margahayu?',
      a: 'Cabang Mitsubishi Sun Margahayu dipimpin oleh Branch Manager, Customer Satisfaction Manager (CSM), Service Manager, Admin Head, Sparepart Manager, serta jajaran Sales Supervisor dan Sales Consultant resmi yang terverifikasi langsung di database internal PT Sun Star Prima Motor.',
    },
    {
      q: 'Apakah Mitsubishi Sun Margahayu menyediakan layanan darurat 24 jam dan asisten Sunny AI?',
      a: 'Ya, layanan darurat Service on Road (SOS) di nomor (021) 8834 7777 serta asisten virtual Sunny AI aktif 24 jam penuh setiap hari termasuk hari Minggu dan libur nasional.',
    },
  ],
  '/vehicles': [
    {
      q: 'Berapa daftar harga OTR mobil Mitsubishi terbaru di Sun Margahayu Bekasi?',
      a: 'Daftar harga OTR referensi Bekasi: Mitsubishi Destinator (Rp 402.000.000 s/d Rp 517.000.000), Mitsubishi New Xforce & HEV (Rp 388.000.000 s/d Rp 460.000.000), Mitsubishi New Xpander (Rp 274.500.000 s/d Rp 348.000.000), Mitsubishi New Xpander Cross (Rp 348.000.000 s/d Rp 374.000.000), Mitsubishi New Pajero Sport (Rp 591.000.000 s/d Rp 794.000.000), All New Triton (Rp 340.000.000 s/d Rp 571.500.000), serta Colt L300 Euro 4 (Rp 255.000.000 s/d Rp 260.000.000).',
    },
    {
      q: 'Berapa tambahan biaya untuk pilihan warna Putih Mutiara atau Two-Tone?',
      a: 'Penyesuaian harga warna khusus berdasarkan data price list resmi: Destinator warna putih +Rp 2.500.000, New Xforce warna putih +Rp 1.500.000, New Xpander warna putih +Rp 1.500.000, New Xpander Cross warna putih +Rp 1.500.000 (Two-Tone +Rp 3.500.000), serta New Pajero Sport warna putih +Rp 3.000.000.',
    },
    {
      q: 'Apakah pembelian mobil baru Mitsubishi sudah termasuk gratis biaya servis berkala?',
      a: 'Servis berkala pada 10.000 KM s/d 50.000 KM (hingga 4 tahun) ditanggung sepenuhnya oleh program SMART Package Mitsubishi (gratis jasa dan suku cadang sesuai buku servis).',
    },
  ],
  '/promo': [
    {
      q: 'Apa saja program promo Mitsubishi yang sedang aktif di Sun Margahayu saat ini?',
      a: 'Program promo resmi yang sedang aktif meliputi Program Bunga 0% Tenor hingga 2 Tahun, Paket DP Ringan Mulai Rp 15 Jutaan, Subsidi Tukar Tambah (Trade-In) s/d Rp 10 Juta, Special Rate New Pajero Sport, Showroom Weekend Gathering, serta Promo Servis Berkala & Diskon Sparepart 15%.',
    },
    {
      q: 'Bagaimana rincian promo kredit bunga 0%, DP ringan, dan subsidi tukar tambah (Trade-In)?',
      a: 'Tersedia bunga 0% hingga 24 bulan untuk New Xforce dan Xpander series, DP ringan mulai Rp 15 jutaan dengan tenor hingga 6 tahun, serta subsidi cashback tukar tambah mobil lama segala merk hingga Rp 10.000.000.',
    },
    {
      q: 'Apakah tersedia promo diskon servis bengkel dan acara test drive akhir pekan?',
      a: 'Pelanggan menikmati diskon jasa servis berkala 10% dan suku cadang 15% untuk booking H-1 pada hari kerja, serta undangan Showroom Weekend Gathering setiap Sabtu & Minggu lengkap dengan test drive berhadiah.',
    },
  ],
  '/booking': [
    {
      q: 'Berapa harga paket Extended SMART Package terbaru untuk Xpander, Xforce, dan Pajero Sport?',
      a: 'Harga resmi paket perpanjangan servis Extended SMART Package (termasuk PPN 11%): untuk Xpander, Xpander Cross, dan Xforce mulai dari Rp 1.387.500 (1XPM) hingga Rp 6.660.000 (6XPM); untuk Pajero Sport mulai dari Rp 2.497.500 (1XPM) hingga Rp 13.320.000 (6XPM).',
    },
    {
      q: 'Berapa estimasi biaya servis berkala Mitsubishi dari 10.000 KM hingga di atas 50.000 KM?',
      a: 'Servis 10.000 KM s/d 50.000 KM gratis (program MMKSI hingga 4 tahun). Setelah masa gratis berakhir, estimasi biaya perawatan berkala Xpander mulai dari Rp 1.530.690 (servis kecil) hingga Rp 2.978.685 (servis 60.000 KM termasuk PPN 11%).',
    },
    {
      q: 'Bagaimana prosedur booking servis online dan jam batas penerimaan walk-in di bengkel Sun Margahayu?',
      a: 'Pelanggan dapat melakukan booking servis online dengan memasukkan nomor polisi kendaraan, memilih kelipatan kilometer, dan memilih slot jam kedatangan. Bengkel buka Senin s/d Jumat pukul 08:00 - 16:30 WIB dan Sabtu pukul 08:00 - 15:00 WIB, dengan batas penerimaan walk-in tanpa booking pukul 11:00 WIB.',
    },
  ],
  '/service-on-road': [
    {
      q: 'Kendala darurat apa saja yang dilayani oleh Mitsubishi Service on Road 24 Jam?',
      a: 'Tim mekanik Service on Road melayani bantuan darurat 24/7 di jalan maupun di rumah wilayah Bekasi dan Jabodetabek untuk kondisi mobil mogok, jumper atau penggantian aki drop, ban kempis, kunci tertinggal, pemeriksaan diagnostik kelistrikan, serta koordinasi mobil derek (towing) resmi.',
    },
    {
      q: 'Berapa nomor telepon darurat Service on Road Mitsubishi Sun Margahayu?',
      a: 'Hubungi Hotline Darurat SOS 24 Jam di (021) 8834 7777, WhatsApp Layanan Servis di 0822-1092-8822, atau kirim titik koordinat GPS Anda langsung melalui formulir Service on Road di halaman ini.',
    },
  ],
  '/facilities': [
    {
      q: 'Apakah seluruh fasilitas seperti Noach Coffee, Shuttle Service, dan Kids Zone gratis digunakan?',
      a: 'Ya, seluruh fasilitas hospitality meliputi Voucher Noach Coffee, Free Shuttle Service (antar-jemput radius 15 km), Kids Zone Playground, Enjoy Room Bean Bag, Snack Corner, dan WFA Station Wi-Fi 6 dapat dinikmati 100% gratis oleh pelanggan showroom dan bengkel resmi Sun Margahayu.',
    },
    {
      q: 'Bagaimana cara memesan layanan Free Shuttle Service saat mobil sedang diservis?',
      a: 'Cukup informasikan tujuan antar-jemput Anda kepada Service Advisor saat registrasi servis di bengkel atau tanyakan lebih awal melalui asisten virtual Sunny AI. Pengemudi resmi kami siap mengantar dan menjemput Anda kembali saat mobil selesai diservis.',
    },
    {
      q: 'Apakah tersedia fasilitas perbaikan bodi dan cat (Authorized Body & Paint)?',
      a: 'Tersedia fasilitas Authorized Body & Paint berstandar MMKSI lengkap dengan Oven Spray Booth, pencampuran warna terkomputerisasi, suku cadang panel orisinal, serta layanan klaim asuransi maupun perbaikan mandiri.',
    },
  ],
  '/accessories': [
    {
      q: 'Apa saja aksesoris resmi Mitsubishi Genuine Accessories (MGA) yang tersedia beserta harganya?',
      a: 'Katalog Mitsubishi Genuine Accessories (MGA) resmi tersedia untuk Destinator (Aero Package Rp 9.710.000, Platinum Plus Rp 18.430.000), New Xforce (Paket Platinum Rp 14.290.000, Paket Stylish Rp 9.570.000), Xpander (Safety Package Rp 4.560.000, Basic Package Rp 1.060.000), Xpander Cross (Urban Package Rp 1.544.000), dan Pajero Sport (Aero Plus Package Rp 23.520.000).',
    },
    {
      q: 'Berapa harga suku cadang fast-moving asli (Mitsubishi Genuine Parts) di bengkel resmi?',
      a: 'Tersedia lengkap suku cadang fast-moving Mitsubishi Genuine Parts berstatus selalu tersedia (always available) seperti Oil Filter, Filter Udara, Filter AC, Kanvas Rem Depan, Busi, dan Belt Timing dengan jaminan keaslian 100% dan garansi pemasangan resmi.',
    },
  ],
  '/sales': [
    {
      q: 'Siapa saja daftar Sales Consultant resmi yang aktif dan terverifikasi di Mitsubishi Sun Margahayu?',
      a: 'Seluruh Sales Consultant resmi yang tampil pada direktori aktif halaman ini telah diverifikasi langsung oleh manajemen dan berada di bawah pengawasan Sales Supervisor PT Sun Star Prima Motor Margahayu.',
    },
    {
      q: 'Bagaimana cara memverifikasi mantan sales/karyawan yang sudah nonaktif agar terhindar dari penipuan?',
      a: 'Daftar personel yang sudah resign atau berstatus nonaktif dipublikasikan secara terbuka pada tab Personel Nonaktif. Mereka tidak lagi memiliki wewenang mewakili PT Sun Star Prima Motor, dan seluruh pembayaran sah hanya ditransfer ke rekening BCA 3425419999 a.n. PT Sun Star Prima Motor.',
    },
  ],
  '/organization': [
    {
      q: 'Bagaimana susunan pimpinan cabang dan manajemen aktif PT Sun Star Prima Motor Margahayu saat ini?',
      a: 'Struktur organisasi cabang dipimpin oleh Branch Manager beserta Customer Satisfaction Manager (CSM), Service Manager, Admin Head, Sparepart Manager, dan Sales Supervisor yang ditampilkan secara transparan dari database sumber daya manusia dealer.',
    },
    {
      q: 'Bagaimana kebijakan transparansi terkait perubahan jabatan atau personel yang sudah tidak aktif?',
      a: 'Setiap pembaruan jabatan maupun status pengunduran diri staf diperbarui secara real-time di database kami untuk melindungi konsumen dari penyalahgunaan wewenang dan memastikan pelayanan resmi yang akuntabel.',
    },
  ],
  '/news': [
    {
      q: 'Apa saja artikel berita dan panduan otomotif terbaru dari Mitsubishi Sun Margahayu?',
      a: 'Pusat berita Mitsubishi Sun Margahayu menyajikan liputan rilis unit terbaru, panduan perawatan berkala, edukasi anti-penipuan transaksi dealer, serta informasi program purnajual resmi.',
    },
    {
      q: 'Apakah konsumen dapat berdiskusi atau menanyakan isi artikel langsung ke Sunny AI?',
      a: 'Ya, pada setiap halaman artikel tersedia tombol konsultasi langsung dengan Sunny AI serta kolom komentar publik yang dimoderasi oleh tim internal dealer.',
    },
  ],
  '/contact': [
    {
      q: 'Berapa nomor WhatsApp resmi untuk divisi Penjualan (Sales), Servis Bengkel, dan Pengaduan CSM?',
      a: 'Saluran WhatsApp resmi terbagi menjadi 3 divisi utama: CS Sales / Penjualan Unit Baru di 0813-1874-7300, Layanan Servis & Booking Bengkel di 0822-1092-8822, serta Customer Satisfaction Manager (CSM) di 0851-8332-5604. Telepon hunting dan darurat 24 jam dapat dihubungi di (021) 8834 7777.',
    },
    {
      q: 'Siapa pejabat Customer Satisfaction Manager (CSM) yang menangani laporan keluhan pelanggan?',
      a: 'Laporan keluhan pelanggan diaudit dan ditangani langsung oleh Customer Satisfaction Manager (CSM) beserta pimpinan cabang PT Sun Star Prima Motor dengan jaminan kerahasiaan data pelapor dan tindak lanjut maksimal 1x24 jam kerja.',
    },
  ],
}

const dynamicSeoState = {
  isLoaded: false,
  isFetching: false,
  generatedAt: null,
  faqsByRoute: null,
  vehicleCatalogSchema: null,
}

function hydrateFromServerScriptIfPresent() {
  if (typeof document === 'undefined' || dynamicSeoState.isLoaded) return
  const payloadEl = document.getElementById('sunny-dynamic-seo-payload')
  if (!payloadEl || !payloadEl.textContent) return
  try {
    const parsed = JSON.parse(payloadEl.textContent)
    if (parsed && parsed.faqs_by_route) {
      dynamicSeoState.faqsByRoute = parsed.faqs_by_route
      dynamicSeoState.vehicleCatalogSchema = parsed.vehicle_catalog_schema || null
      dynamicSeoState.generatedAt = parsed.generated_at || null
      dynamicSeoState.isLoaded = true
    }
  } catch {
    // Ignore malformed server payload and fall back to API fetch
  }
}

hydrateFromServerScriptIfPresent()

export async function fetchDynamicSeoData() {
  hydrateFromServerScriptIfPresent()
  if (dynamicSeoState.isLoaded && dynamicSeoState.faqsByRoute) {
    return dynamicSeoState
  }
  if (dynamicSeoState.isFetching) {
    return dynamicSeoState
  }

  dynamicSeoState.isFetching = true
  const candidateUrls = [
    `${SEO_API_BASE_URL}/seo/dynamic`,
    '/seo-dynamic.php',
  ]

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) continue
      const data = await response.json()
      if (data && data.success && data.faqs_by_route) {
        dynamicSeoState.faqsByRoute = data.faqs_by_route
        dynamicSeoState.vehicleCatalogSchema = data.vehicle_catalog_schema || null
        dynamicSeoState.generatedAt = data.generated_at || null
        dynamicSeoState.isLoaded = true
        dynamicSeoState.isFetching = false

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('sunny-dynamic-seo-updated', { detail: dynamicSeoState })
          )
        }
        return dynamicSeoState
      }
    } catch {
      // Try next candidate endpoint
    }
  }

  dynamicSeoState.isFetching = false
  return dynamicSeoState
}

export const FAQ_CATEGORIES = [
  { key: '/', label: 'Umum & Keamanan Transaksi', path: '/' },
  { key: '/vehicles', label: 'Katalog & Harga OTR Mobil', path: '/vehicles' },
  { key: '/promo', label: 'Promo, Kredit & Trade-In', path: '/promo' },
  { key: '/booking', label: 'Booking & Paket Servis SMART', path: '/booking' },
  { key: '/service-on-road', label: 'Darurat Service on Road 24 Jam', path: '/service-on-road' },
  { key: '/facilities', label: 'Fasilitas Showroom & Hospitality', path: '/facilities' },
  { key: '/accessories', label: 'Aksesoris Resmi & Suku Cadang', path: '/accessories' },
  { key: '/sales', label: 'Verifikasi Sales & Anti-Penipuan', path: '/sales' },
  { key: '/organization', label: 'Struktur Organisasi & Manajemen', path: '/organization' },
  { key: '/news', label: 'Berita & Edukasi Otomotif', path: '/news' },
  { key: '/contact', label: 'Kontak Divisi & Lapor CSM', path: '/contact' },
]

export function resolveCanonicalFaqKey(pathname) {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/'
  const config = PAGE_SEO_CONFIG[cleanPath]
  return config?.canonicalPath || cleanPath
}

export function getAllDynamicFaqsGrouped() {
  hydrateFromServerScriptIfPresent()
  const sourceMap = dynamicSeoState.faqsByRoute || FALLBACK_FAQS_BY_ROUTE
  return FAQ_CATEGORIES.map((cat) => {
    const items =
      Array.isArray(sourceMap[cat.key]) && sourceMap[cat.key].length > 0
        ? sourceMap[cat.key]
        : FALLBACK_FAQS_BY_ROUTE[cat.key] || []
    return {
      ...cat,
      items,
    }
  })
}

export function getPageFaqs(pathname) {
  hydrateFromServerScriptIfPresent()
  const canonicalKey = resolveCanonicalFaqKey(pathname)
  if (canonicalKey === '/faq') {
    const grouped = getAllDynamicFaqsGrouped()
    const seen = new Set()
    const merged = []
    for (const group of grouped) {
      for (const item of group.items) {
        if (!seen.has(item.q)) {
          seen.add(item.q)
          merged.push(item)
        }
      }
    }
    return merged
  }

  const dynamicList = dynamicSeoState.faqsByRoute?.[canonicalKey]
  if (Array.isArray(dynamicList) && dynamicList.length > 0) {
    return dynamicList
  }
  return FALLBACK_FAQS_BY_ROUTE[canonicalKey] || []
}

export function getDynamicSeoGeneratedAt() {
  return dynamicSeoState.generatedAt
}

function setMetaTag(selector, attributeName, attributeValue, content) {
  if (typeof document === 'undefined') return
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content || '')
}

function setCanonicalTag(url) {
  if (typeof document === 'undefined') return
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url || window.location.href)
}

export function setJsonLd(scriptId, schemaData) {
  if (typeof document === 'undefined') return
  const existing = document.getElementById(scriptId)
  if (!schemaData) {
    if (existing) existing.remove()
    return
  }
  const script = existing || document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(schemaData)
  if (!existing) {
    document.head.appendChild(script)
  }
}

export function removeJsonLd(scriptId) {
  if (typeof document === 'undefined') return
  const existing = document.getElementById(scriptId)
  if (existing) existing.remove()
}

export function updateDocumentMeta(options = {}) {
  if (typeof document === 'undefined') return

  const title = options.title || DEFAULT_SEO.title
  const description = options.description || DEFAULT_SEO.description
  const keywords = options.keywords || DEFAULT_SEO.keywords
  const image = options.image || DEFAULT_SEO.image
  const type = options.type || DEFAULT_SEO.type
  const author = options.author || DEFAULT_SEO.author
  const robots = options.robots || DEFAULT_SEO.robots
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN
  const currentUrl = options.canonicalPath
    ? `${origin}${options.canonicalPath}`
    : options.url || (typeof window !== 'undefined' ? window.location.href : SITE_ORIGIN)

  document.title = title

  setMetaTag('meta[name="description"]', 'name', 'description', description)
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords)
  setMetaTag('meta[name="author"]', 'name', 'author', author)
  setMetaTag('meta[name="robots"]', 'name', 'robots', robots)

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title)
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', image)
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl)
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type)
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', DEFAULT_SEO.siteName)

  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image)

  setCanonicalTag(currentUrl)
}

export function getAutoDealerSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['AutoDealer', 'AutomotiveBusiness', 'LocalBusiness'],
        '@id': `${SITE_ORIGIN}/#autodealer`,
        name: 'Mitsubishi Sun Margahayu Bekasi',
        legalName: 'PT Sun Star Prima Motor',
        alternateName: 'PT Sun Star Prima Motor - Margahayu',
        description: DEFAULT_SEO.description,
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/logo-brand.webp`,
        image: DEFAULT_SEO.image,
        telephone: '+62-21-88347777',
        email: 'info@sunmargahayu.co.id',
        priceRange: 'Rp 255.000.000 - Rp 1.415.000.000',
        currenciesAccepted: 'IDR',
        paymentAccepted:
          'Transfer Bank Resmi BCA 3425419999 a.n. PT Sun Star Prima Motor, Tunai, Kredit Leasing Resmi',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Jl. Ir. H. Juanda No. 35 Bulak Kapal, RT.001/RW.001, Aren Jaya',
          addressLocality: 'Bekasi Timur, Kota Bekasi',
          addressRegion: 'Jawa Barat',
          postalCode: '17111',
          addressCountry: 'ID',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -6.250846761200644,
          longitude: 107.02451547363883,
        },
        hasMap: 'https://maps.app.goo.gl/avtswtfZ9g7sTkcZ6',
        areaServed: [
          { '@type': 'City', name: 'Kota Bekasi' },
          { '@type': 'AdministrativeArea', name: 'Kabupaten Bekasi' },
          { '@type': 'City', name: 'Jakarta Timur' },
          { '@type': 'City', name: 'Cikarang' },
          { '@type': 'City', name: 'Karawang' },
        ],
        brand: [
          { '@type': 'Brand', name: 'Mitsubishi Motors' },
          { '@type': 'Brand', name: 'Mitsubishi Fuso' },
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+62-21-88347777',
            contactType: 'emergency',
            areaServed: 'ID',
            availableLanguage: ['Indonesian'],
            hoursAvailable: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '00:00',
              closes: '23:59',
            },
          },
          {
            '@type': 'ContactPoint',
            telephone: '+62-813-1874-7300',
            contactType: 'sales',
            areaServed: 'ID',
            availableLanguage: ['Indonesian'],
          },
          {
            '@type': 'ContactPoint',
            telephone: '+62-822-1092-8822',
            contactType: 'customer service',
            areaServed: 'ID',
            availableLanguage: ['Indonesian'],
          },
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '08:30',
            closes: '19:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Sunday'],
            opens: '09:00',
            closes: '17:00',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: 'Mitsubishi Sun Margahayu',
        publisher: { '@id': `${SITE_ORIGIN}/#autodealer` },
        inLanguage: 'id-ID',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_ORIGIN}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

export function getBreadcrumbSchema(pathname, customLeafTitle = null) {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/'
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: `${SITE_ORIGIN}/`,
    },
  ]

  if (cleanPath === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    }
  }

  if (cleanPath.startsWith('/news/') || cleanPath.startsWith('/article/')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Berita & Edukasi',
      item: `${SITE_ORIGIN}/news`,
    })
    if (customLeafTitle) {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: customLeafTitle,
        item: `${SITE_ORIGIN}${cleanPath}`,
      })
    }
  } else {
    const config = PAGE_SEO_CONFIG[cleanPath]
    const canonicalPath = config?.canonicalPath || cleanPath
    const leafName = customLeafTitle || config?.breadcrumbName || 'Halaman'
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: leafName,
      item: `${SITE_ORIGIN}${canonicalPath}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export function getPageFaqSchema(pathname) {
  const faqs = getPageFaqs(pathname)
  if (!faqs || faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function getVehicleCatalogSchema() {
  hydrateFromServerScriptIfPresent()
  if (dynamicSeoState.vehicleCatalogSchema) {
    return dynamicSeoState.vehicleCatalogSchema
  }

  const models = [
    {
      name: 'Mitsubishi Destinator',
      image: 'https://cssunmotor.com/wp-content/uploads/url_6ae054f30fe950.18048876.webp',
      lowPrice: 402000000,
      highPrice: 517000000,
      bodyType: 'SUV',
    },
    {
      name: 'Mitsubishi New Xforce',
      image: 'https://csdwindo.com/wp-content/uploads/newxforcetr.png',
      lowPrice: 388000000,
      highPrice: 460000000,
      bodyType: 'Compact SUV',
    },
    {
      name: 'Mitsubishi New Xpander',
      image: 'https://csdwindo.com/media/mmksi/xpander.png',
      lowPrice: 274500000,
      highPrice: 348000000,
      bodyType: 'MPV',
    },
    {
      name: 'Mitsubishi New Xpander Cross',
      image: 'https://csdwindo.com/media/mmksi/xpander_cross.webp',
      lowPrice: 348000000,
      highPrice: 374000000,
      bodyType: 'Crossover MPV',
    },
    {
      name: 'Mitsubishi New Pajero Sport',
      image: 'https://csdwindo.com/media/mmksi/pajero.png',
      lowPrice: 591000000,
      highPrice: 794000000,
      bodyType: 'SUV',
    },
    {
      name: 'Mitsubishi All New Triton',
      image: 'https://cssunmotor.com/wp-content/uploads/url_6ae05932608fd2.01144573.webp',
      lowPrice: 340000000,
      highPrice: 571500000,
      bodyType: 'Pickup Truck',
    },
    {
      name: 'Mitsubishi Colt L300 Euro 4',
      image: 'https://csdwindo.com/media/mmksi/l300.png',
      lowPrice: 255000000,
      highPrice: 260000000,
      bodyType: 'Commercial Pickup',
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Katalog Kendaraan Resmi Mitsubishi Sun Margahayu Bekasi',
    itemListElement: models.map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': ['Car', 'Product'],
        name: m.name,
        image: m.image,
        bodyType: m.bodyType,
        brand: {
          '@type': 'Brand',
          name: 'Mitsubishi Motors',
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'IDR',
          lowPrice: m.lowPrice,
          highPrice: m.highPrice,
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'AutoDealer',
            name: 'Mitsubishi Sun Margahayu (PT Sun Star Prima Motor)',
          },
        },
      },
    })),
  }
}

export function getArticleSchema(article, pageUrl) {
  if (!article || !article.title) return null
  const image = article.imageUrl || article.image_url || DEFAULT_SEO.image
  const publishedAt = article.createdAt || article.created_at || new Date().toISOString()
  const updatedAt = article.updatedAt || article.updated_at || publishedAt
  const authorName = article.author || 'PT Sun Star Prima Motor'

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl || `${SITE_ORIGIN}/news/${article.slug || article.id}`,
    },
    headline: article.title,
    description: article.summary || DEFAULT_SEO.description,
    image: [image],
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: SITE_ORIGIN,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mitsubishi Sun Margahayu (PT Sun Star Prima Motor)',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/logo-brand.webp`,
      },
    },
  }
}
