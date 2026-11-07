<?php
/**
 * Dynamic Open Graph, Canonical, Robots, and JSON-LD Injector for SPA
 * Mitsubishi Sun Star Prima Motor Margahayu Bekasi
 */

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['SERVER_PORT'] ?? 80) == 443)
    || (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || (($_SERVER['HTTP_HOST'] ?? 'cssunmotor.com') === 'cssunmotor.com');
$protocol = $isHttps ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'cssunmotor.com';
$fullRequestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestPath = parse_url($fullRequestUri, PHP_URL_PATH) ?? '/';

// Prevent index.php from ever serving text/html for missing static assets (.js, .css, /assets/*)
if (
    preg_match('#^/assets/#i', $requestPath) ||
    preg_match('#\.(js|mjs|css|map|webp|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$#i', $requestPath)
) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo '404 Not Found';
    exit;
}

$siteName = 'Mitsubishi Sun Margahayu';
$defaultTitle = 'Mitsubishi Sun Margahayu | Dealer Transparan & Bengkel Resmi 24/7';
$defaultDesc = 'Dealer resmi Mitsubishi Sun Star Prima Motor Margahayu Bekasi. Layanan transparansi penuh: simulasi kredit transparan, unit Xforce, Destinator, Pajero Sport, Xpander, servis bengkel 24/7, dan verifikasi sales resmi.';
$defaultImage = 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp';
$defaultKeywords = 'mitsubishi bekasi, mitsubishi sun margahayu, dealer mitsubishi, servis mitsubishi 24 jam, xforce, destinator, pajero sport, xpander';
$type = 'website';
$author = 'PT Sun Star Prima Motor';
$robots = 'index, follow';
$extraJsonLd = null;

$pageTitle = $defaultTitle;
$pageDesc = $defaultDesc;
$pageImage = $defaultImage;
$pageKeywords = $defaultKeywords;

$staticRoutes = [
    '/vehicles' => [
        'title' => 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
        'desc' => 'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi Bekasi: Destinator, New Xforce, New Pajero Sport, Xpander, Xpander Cross, Triton, L300, dan Fuso.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
        'keywords' => 'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, mitsubishi destinator, promo xpander bekasi',
        'canonical' => '/vehicles',
    ],
    '/vehicle-list' => [
        'title' => 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
        'desc' => 'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi Bekasi: Destinator, New Xforce, New Pajero Sport, Xpander, Xpander Cross, Triton, L300, dan Fuso.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
        'keywords' => 'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, mitsubishi destinator, promo xpander bekasi',
        'canonical' => '/vehicles',
    ],
    '/promo' => [
        'title' => 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
        'desc' => 'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi',
        'canonical' => '/promo',
    ],
    '/promo-event' => [
        'title' => 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
        'desc' => 'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi',
        'canonical' => '/promo',
    ],
    '/booking' => [
        'title' => 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Jadwalkan perawatan berkala, servis cepat, Extended SMART Package, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi',
        'canonical' => '/booking',
    ],
    '/booking-service' => [
        'title' => 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Jadwalkan perawatan berkala, servis cepat, Extended SMART Package, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi',
        'canonical' => '/booking',
    ],
    '/service-on-road' => [
        'title' => 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
        'desc' => 'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi',
        'canonical' => '/service-on-road',
    ],
    '/service-on-the-road' => [
        'title' => 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
        'desc' => 'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi',
        'canonical' => '/service-on-road',
    ],
    '/facilities' => [
        'title' => 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Eksplorasi fasilitas 3S + Body Paint berstandar global: VIP Lounge, gratis voucher Noach Coffee, Kids Zone, WFA Station Wi-Fi 6, dan Free Shuttle Service.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu',
        'canonical' => '/facilities',
    ],
    '/fasilitas' => [
        'title' => 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Eksplorasi fasilitas 3S + Body Paint berstandar global: VIP Lounge, gratis voucher Noach Coffee, Kids Zone, WFA Station Wi-Fi 6, dan Free Shuttle Service.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu',
        'canonical' => '/facilities',
    ],
    '/services' => [
        'title' => 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Eksplorasi fasilitas 3S + Body Paint berstandar global: VIP Lounge, gratis voucher Noach Coffee, Kids Zone, WFA Station Wi-Fi 6, dan Free Shuttle Service.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu',
        'canonical' => '/facilities',
    ],
    '/accessories' => [
        'title' => 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
        'desc' => 'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi Genuine Accessories dan suku cadang resmi di Sun Margahayu Bekasi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi',
        'canonical' => '/accessories',
    ],
    '/aksesoris' => [
        'title' => 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
        'desc' => 'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi Genuine Accessories dan suku cadang resmi di Sun Margahayu Bekasi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi',
        'canonical' => '/accessories',
    ],
    '/sales' => [
        'title' => 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
        'desc' => 'Verifikasi profil sales konsultan resmi PT Sun Star Prima Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
        'image' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
        'keywords' => 'sales mitsubishi bekasi, sales resmi sun margahayu, verifikasi sales anti penipuan',
        'canonical' => '/sales',
    ],
    '/sales-list' => [
        'title' => 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
        'desc' => 'Verifikasi profil sales konsultan resmi PT Sun Star Prima Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
        'image' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
        'keywords' => 'sales mitsubishi bekasi, sales resmi sun margahayu, verifikasi sales anti penipuan',
        'canonical' => '/sales',
    ],
    '/organization' => [
        'title' => 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
        'desc' => 'Mengenal jajaran manajemen dan tim profesional PT Sun Star Prima Motor Margahayu Bekasi yang melayani kepemilikan Mitsubishi Anda.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'struktur organisasi sun margahayu, profil pt sun star prima motor bekasi',
        'canonical' => '/organization',
    ],
    '/struktur-organisasi' => [
        'title' => 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
        'desc' => 'Mengenal jajaran manajemen dan tim profesional PT Sun Star Prima Motor Margahayu Bekasi yang melayani kepemilikan Mitsubishi Anda.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'struktur organisasi sun margahayu, profil pt sun star prima motor bekasi',
        'canonical' => '/organization',
    ],
    '/about' => [
        'title' => 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
        'desc' => 'Mengenal jajaran manajemen dan tim profesional PT Sun Star Prima Motor Margahayu Bekasi yang melayani kepemilikan Mitsubishi Anda.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'struktur organisasi sun margahayu, profil pt sun star prima motor bekasi',
        'canonical' => '/organization',
    ],
    '/news' => [
        'title' => 'Berita, Edukasi Otomotif & Update Resmi | Mitsubishi Sun Margahayu',
        'desc' => 'Kumpulan artikel otomotif terkini, tips perawatan mobil, review unit Mitsubishi, dan pengumuman program dealer Sun Margahayu.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
        'keywords' => 'berita mitsubishi, tips otomotif mitsubishi, review xforce bekasi',
        'canonical' => '/news',
    ],
    '/contact' => [
        'title' => 'Kontak & Lokasi Dealer Resmi | Mitsubishi Sun Margahayu Bekasi',
        'desc' => 'Alamat lengkap Jl. Ir. H. Juanda No. 35 Bekasi Timur, nomor telepon (021) 8834 7777, WhatsApp resmi, rekening sah BCA 3425419999, dan peta rute dealer.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'alamat mitsubishi sun margahayu, nomor telepon mitsubishi bekasi, whatsapp dealer mitsubishi',
        'canonical' => '/contact',
    ],
    '/faq' => [
        'title' => 'Pusat Bantuan & Pertanyaan Umum (FAQ) Resmi | Mitsubishi Sun Margahayu',
        'desc' => 'Jawaban resmi berbasis database real-time seputar harga OTR Mitsubishi Bekasi, promo kredit bunga 0%, paket servis SMART, suku cadang, dan verifikasi sales sah.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'faq mitsubishi bekasi, tanya jawab mitsubishi sun margahayu, info harga dan servis mitsubishi',
        'canonical' => '/faq',
    ],
    '/faqs' => [
        'title' => 'Pusat Bantuan & Pertanyaan Umum (FAQ) Resmi | Mitsubishi Sun Margahayu',
        'desc' => 'Jawaban resmi berbasis database real-time seputar harga OTR Mitsubishi Bekasi, promo kredit bunga 0%, paket servis SMART, suku cadang, dan verifikasi sales sah.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'faq mitsubishi bekasi, tanya jawab mitsubishi sun margahayu, info harga dan servis mitsubishi',
        'canonical' => '/faq',
    ],
    '/search' => [
        'title' => 'Pencarian Layanan & Kendaraan | Mitsubishi Sun Margahayu',
        'desc' => 'Temukan informasi unit mobil, paket servis, promo terkini, dan panduan otomotif di Mitsubishi Sun Margahayu.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'pencarian mitsubishi sun margahayu, cari mobil bekasi, cari servis mitsubishi',
        'canonical' => '/search',
        'robots' => 'noindex, follow',
    ],
];

// Vehicle preview map for query parameters (?model= or ?unit=)
$vehiclePreviews = [
    'destinator' => [
        'title' => 'Mitsubishi Destinator | Harga OTR Mulai Rp 402 Juta - Sun Margahayu Bekasi',
        'desc' => 'Cek spesifikasi, varian Ultimate & Exceed, simulasi kredit DP ringan, dan jadwal test drive Mitsubishi Destinator di dealer resmi Sun Margahayu.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae054f30fe950.18048876.webp',
    ],
    'xforce' => [
        'title' => 'Mitsubishi New Xforce & HEV Hybrid | Harga OTR Mulai Rp 388 Juta',
        'desc' => 'Eksplorasi fitur Diamond Sense, varian HEV Hybrid & Ultimate, serta simulasi kredit Mitsubishi New Xforce di Sun Margahayu Bekasi.',
        'image' => 'https://csdwindo.com/wp-content/uploads/newxforcetr.png',
    ],
    'xpander' => [
        'title' => 'Mitsubishi New Xpander | Harga OTR Mulai Rp 274,5 Juta - Sun Margahayu',
        'desc' => 'MPV keluarga favorit dengan kenyamanan suspensi terbaik. Cek harga OTR Bekasi, promo bunga 0%, dan paket SMART di Sun Margahayu.',
        'image' => 'https://csdwindo.com/media/mmksi/xpander.png',
    ],
    'xpander_cross' => [
        'title' => 'Mitsubishi New Xpander Cross | Harga OTR Mulai Rp 348 Juta - Sun Margahayu',
        'desc' => 'Tangguh di segala medan dengan fitur Active Yaw Control (AYC). Dapatkan penawaran kredit terbaik New Xpander Cross di Bekasi.',
        'image' => 'https://csdwindo.com/media/mmksi/xpander_cross.webp',
    ],
    'pajero' => [
        'title' => 'Mitsubishi New Pajero Sport | Harga OTR Mulai Rp 591 Juta - Sun Margahayu',
        'desc' => 'SUV tangguh berkelas Dakar Ultimate 4x4 & 4x2. Cek promo cashback, ketersediaan warna, dan jadwalkan test drive di Mitsubishi Sun Margahayu.',
        'image' => 'https://csdwindo.com/media/mmksi/pajero.png',
    ],
    'triton' => [
        'title' => 'Mitsubishi All New Triton 4x4 | Harga OTR Mulai Rp 340 Juta - Sun Margahayu',
        'desc' => 'Double Cabin & Single Cabin tangguh untuk pertambangan, perkebunan, dan operasional bisnis. Konsultasi pembelian fleet dan ritel di Bekasi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae05932608fd2.01144573.webp',
    ],
    'l300' => [
        'title' => 'Mitsubishi Colt L300 Euro 4 | Harga OTR Mulai Rp 255 Juta - Sun Margahayu',
        'desc' => 'Legenda niaga mesin Euro 4 bertenaga dan irit BBM dengan daya angkut kargo ekstra luas. Tersedia promo DP ringan di Bekasi.',
        'image' => 'https://csdwindo.com/media/mmksi/l300.png',
    ],
];

$normalizedPath = preg_replace('#^/[^/]+(?=/(?:news|article|vehicles|vehicle-list|promo|promo-event|booking|booking-service|service-on-road|service-on-the-road|facilities|fasilitas|services|accessories|aksesoris|sales|sales-list|organization|struktur-organisasi|about|contact|faq|faqs|search|portal))#', '', $requestPath);
$normalizedPath = rtrim($normalizedPath, '/') ?: '/';
$canonicalUrl = $protocol . '://' . $host . ($normalizedPath === '/' ? '/' : $normalizedPath);

if (preg_match('~^/(?:news|article)/([^/?#]+)~', $normalizedPath, $matches)) {
    $articleSlugOrId = trim(urldecode($matches[1]));
    $type = 'article';
    $articleData = null;
    $dbLookupAttempted = false;

    $dbConfigPaths = [
        __DIR__ . '/../api/.env',
        __DIR__ . '/api/.env',
        dirname(__DIR__) . '/api/.env'
    ];

    $dbHost = '127.0.0.1';
    $dbPort = '3306';
    $dbName = 'sunny';
    $dbUser = 'root';
    $dbPass = '';

    foreach ($dbConfigPaths as $envPath) {
        if (file_exists($envPath) && is_readable($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (strpos($line, '#') === 0) continue;
                if (preg_match('/^DB_HOST=(.*)$/', $line, $m)) $dbHost = trim($m[1], " \t\n\r\0\x0B\"'");
                if (preg_match('/^DB_PORT=(.*)$/', $line, $m)) $dbPort = trim($m[1], " \t\n\r\0\x0B\"'");
                if (preg_match('/^DB_DATABASE=(.*)$/', $line, $m)) $dbName = trim($m[1], " \t\n\r\0\x0B\"'");
                if (preg_match('/^DB_USERNAME=(.*)$/', $line, $m)) $dbUser = trim($m[1], " \t\n\r\0\x0B\"'");
                if (preg_match('/^DB_PASSWORD=(.*)$/', $line, $m)) $dbPass = trim($m[1], " \t\n\r\0\x0B\"'");
            }
            break;
        }
    }

    $hostsToTry = array_unique([$dbHost, 'localhost', '127.0.0.1']);
    foreach ($hostsToTry as $candidateHost) {
        try {
            $dsn = "mysql:host={$candidateHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 2
            ]);

            $stmt = $pdo->prepare('SELECT * FROM articles WHERE slug = ? OR id = ? LIMIT 1');
            if ($stmt && $stmt->execute([$articleSlugOrId, $articleSlugOrId])) {
                $dbLookupAttempted = true;
                $found = $stmt->fetch();
                if ($found) {
                    $articleData = $found;
                    break;
                }
            }
        } catch (\Throwable $e) {
            // Continue to next host
        }
    }

    if (!$articleData) {
        $apiCandidateUrls = [
            $protocol . '://' . $host . '/api/articles/' . urlencode($articleSlugOrId),
            'http://127.0.0.1/OldSunny/api/public/api/articles/' . urlencode($articleSlugOrId)
        ];

        foreach ($apiCandidateUrls as $apiUrl) {
            if (!function_exists('curl_init')) break;
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 3);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($code === 200 && !empty($res)) {
                $parsed = json_decode($res, true);
                if (!empty($parsed['success']) && !empty($parsed['data']['title'])) {
                    $articleData = $parsed['data'];
                    break;
                }
            } elseif ($code === 404) {
                $dbLookupAttempted = true;
            }
        }
    }

    if ($articleData) {
        $robots = 'index, follow';
        $resolvedSlug = !empty($articleData['slug']) ? trim($articleData['slug']) : $articleSlugOrId;
        $canonicalUrl = $protocol . '://' . $host . '/news/' . rawurlencode($resolvedSlug);
        $pageTitle = trim($articleData['title']) . ' | Mitsubishi Sun Margahayu';
        $pageDesc = trim(strip_tags($articleData['summary'] ?: $articleData['title']));
        if (mb_strlen($pageDesc) > 200) {
            $pageDesc = mb_substr($pageDesc, 0, 197) . '...';
        }
        $imgCandidate = $articleData['image_url'] ?? $articleData['imageUrl'] ?? '';
        if (!empty($imgCandidate)) {
            $pageImage = trim($imgCandidate);
        }
        if (!empty($articleData['author'])) {
            $author = trim($articleData['author']);
        }
        if (!empty($articleData['tags'])) {
            $rawTags = $articleData['tags'];
            if (is_array($rawTags)) {
                $pageKeywords = implode(', ', $rawTags);
            } elseif (is_string($rawTags) && strpos($rawTags, '[') === 0) {
                $parsed = json_decode($rawTags, true);
                if (is_array($parsed)) {
                    $pageKeywords = implode(', ', $parsed);
                }
            } else {
                $pageKeywords = (string)$rawTags;
            }
        }

        $absArticleImage = preg_match('#^https?://#i', $pageImage)
            ? $pageImage
            : $protocol . '://' . $host . '/' . ltrim($pageImage, '/');
        $publishedAt = $articleData['created_at'] ?? $articleData['createdAt'] ?? date('c');
        $updatedAt = $articleData['updated_at'] ?? $articleData['updatedAt'] ?? $publishedAt;

        $extraJsonLd = [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $canonicalUrl,
            ],
            'headline' => trim($articleData['title']),
            'description' => $pageDesc,
            'image' => [$absArticleImage],
            'datePublished' => date('c', strtotime((string)$publishedAt) ?: time()),
            'dateModified' => date('c', strtotime((string)$updatedAt) ?: time()),
            'author' => [
                '@type' => 'Organization',
                'name' => $author,
                'url' => $protocol . '://' . $host . '/',
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'Mitsubishi Sun Margahayu (PT Sun Star Prima Motor)',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => $protocol . '://' . $host . '/logo-brand.webp',
                ],
            ],
        ];
    } elseif ($dbLookupAttempted) {
        $robots = 'noindex, follow';
    }
} elseif (isset($staticRoutes[$normalizedPath])) {
    $matched = $staticRoutes[$normalizedPath];
    $pageTitle = $matched['title'];
    $pageDesc = $matched['desc'];
    $pageImage = $matched['image'];
    $pageKeywords = $matched['keywords'];
    if (!empty($matched['canonical'])) {
        $canonicalUrl = $protocol . '://' . $host . $matched['canonical'];
    }
    if (!empty($matched['robots'])) {
        $robots = $matched['robots'];
    }

    // Dynamic vehicle preview override when ?model= or ?unit= query parameter is present
    if ($normalizedPath === '/vehicles' || $normalizedPath === '/vehicle-list') {
        $queryUnit = strtolower(trim($_GET['model'] ?? $_GET['unit'] ?? ''));
        foreach ($vehiclePreviews as $key => $vMeta) {
            if ($queryUnit !== '' && strpos($queryUnit, $key) !== false) {
                $pageTitle = $vMeta['title'];
                $pageDesc = $vMeta['desc'];
                $pageImage = $vMeta['image'];
                break;
            }
        }
    }
} elseif (strpos($normalizedPath, '/portal') === 0) {
    $pageTitle = 'Portal Manajemen Operasional | Mitsubishi Sun Margahayu';
    $pageDesc = 'Sistem operasional internal dealer, analitik leads, Sunny AI, dan manajemen data PT Sun Star Prima Motor Margahayu.';
    $robots = 'noindex, nofollow';
} elseif (preg_match('#^/(?:400|403|404|429|500|503|error)#', $normalizedPath)) {
    $robots = 'noindex, nofollow';
}

if (!preg_match('#^https?://#i', $pageImage)) {
    $pageImage = $protocol . '://' . $host . '/' . ltrim($pageImage, '/');
}

$htmlFile = null;
$searchPaths = [
    __DIR__ . '/index.html',
    __DIR__ . '/dist/index.html',
    dirname(__DIR__) . '/dist/index.html',
    dirname(__DIR__) . '/index.html'
];

foreach ($searchPaths as $p) {
    if (file_exists($p) && is_file($p)) {
        $htmlFile = $p;
        break;
    }
}

if (!$htmlFile) {
    header('Content-Type: text/plain; charset=UTF-8', true, 500);
    echo "Sistem Sedang Memproses: Berkas index.html belum ditemukan.";
    exit;
}

$html = file_get_contents($htmlFile);

// Prioritize CSS stylesheet loading before JS bundle and strip crossorigin on same-origin CSS
// so Googlebot WRS downloads and applies CSS immediately before screenshot capture.
if (preg_match('#<link\s+rel=["\']stylesheet["\'][^>]*href=["\'](/assets/[^"\']+\.css)["\'][^>]*>#i', $html, $cssMatch)) {
    $cssHref = $cssMatch[1];
    $html = str_replace($cssMatch[0], '', $html);
    $priorityCssTags = "<link rel=\"preload\" as=\"style\" href=\"{$cssHref}\" />\n    <link rel=\"stylesheet\" href=\"{$cssHref}\" />";
    if (preg_match('#<script\s+type=["\']module["\'][^>]*>#i', $html, $scriptMatch)) {
        $html = str_replace($scriptMatch[0], $priorityCssTags . "\n    " . $scriptMatch[0], $html);
    } else {
        $html = str_replace('</head>', "  " . $priorityCssTags . "\n</head>", $html);
    }
}

$safeTitle = htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8');
$safeDesc = htmlspecialchars($pageDesc, ENT_QUOTES, 'UTF-8');
$safeImage = htmlspecialchars($pageImage, ENT_QUOTES, 'UTF-8');
$safeKeywords = htmlspecialchars($pageKeywords, ENT_QUOTES, 'UTF-8');
$safeCanonical = htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8');
$safeAuthor = htmlspecialchars($author, ENT_QUOTES, 'UTF-8');
$safeType = htmlspecialchars($type, ENT_QUOTES, 'UTF-8');
$safeRobots = htmlspecialchars($robots, ENT_QUOTES, 'UTF-8');

$html = preg_replace('#<title>.*?</title>#is', "<title>{$safeTitle}</title>", $html);

if (preg_match('#<meta\s+name=["\']description["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+name=["\']description["\'][^>]*>#i', "<meta name=\"description\" content=\"{$safeDesc}\" />", $html);
} else {
    $html = str_replace('</head>', "  <meta name=\"description\" content=\"{$safeDesc}\" />\n</head>", $html);
}

if (preg_match('#<meta\s+name=["\']keywords["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+name=["\']keywords["\'][^>]*>#i', "<meta name=\"keywords\" content=\"{$safeKeywords}\" />", $html);
}

if (preg_match('#<meta\s+name=["\']author["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+name=["\']author["\'][^>]*>#i', "<meta name=\"author\" content=\"{$safeAuthor}\" />", $html);
}

if (preg_match('#<meta\s+name=["\']robots["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+name=["\']robots["\'][^>]*>#i', "<meta name=\"robots\" content=\"{$safeRobots}\" />", $html);
} else {
    $html = str_replace('</head>', "  <meta name=\"robots\" content=\"{$safeRobots}\" />\n</head>", $html);
}

$html = preg_replace('#<meta\s+property=["\']og:title["\'][^>]*>#i', "<meta property=\"og:title\" content=\"{$safeTitle}\" />", $html);
$html = preg_replace('#<meta\s+property=["\']og:description["\'][^>]*>#i', "<meta property=\"og:description\" content=\"{$safeDesc}\" />", $html);
$html = preg_replace('#<meta\s+property=["\']og:image["\'][^>]*>#i', "<meta property=\"og:image\" content=\"{$safeImage}\" />", $html);
$html = preg_replace('#<meta\s+property=["\']og:type["\'][^>]*>#i', "<meta property=\"og:type\" content=\"{$safeType}\" />", $html);

if (preg_match('#<meta\s+property=["\']og:url["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+property=["\']og:url["\'][^>]*>#i', "<meta property=\"og:url\" content=\"{$safeCanonical}\" />", $html);
} else {
    $html = str_replace('</head>', "  <meta property=\"og:url\" content=\"{$safeCanonical}\" />\n</head>", $html);
}

$html = preg_replace('#<meta\s+name=["\']twitter:title["\'][^>]*>#i', "<meta name=\"twitter:title\" content=\"{$safeTitle}\" />", $html);
$html = preg_replace('#<meta\s+name=["\']twitter:description["\'][^>]*>#i', "<meta name=\"twitter:description\" content=\"{$safeDesc}\" />", $html);
$html = preg_replace('#<meta\s+name=["\']twitter:image["\'][^>]*>#i', "<meta name=\"twitter:image\" content=\"{$safeImage}\" />", $html);

if (preg_match('#<link\s+rel=["\']canonical["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<link\s+rel=["\']canonical["\'][^>]*>#i', "<link rel=\"canonical\" href=\"{$safeCanonical}\" />", $html);
} else {
    $html = str_replace('</head>', "  <link rel=\"canonical\" href=\"{$safeCanonical}\" />\n</head>", $html);
}

if ($extraJsonLd) {
    $jsonString = json_encode($extraJsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
    $scriptTag = "  <script id=\"schema-article\" type=\"application/ld+json\">{$jsonString}</script>\n</head>";
    $html = str_replace('</head>', $scriptTag, $html);
}

if (!empty($articleData)) {
    $articleJsonStr = json_encode($articleData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
    if (is_string($articleJsonStr) && $articleJsonStr !== '') {
        $articleHydrationTag = "  <script id=\"sunny-initial-article\" type=\"application/json\">{$articleJsonStr}</script>\n</head>";
        $html = str_replace('</head>', $articleHydrationTag, $html);
    }
}

// Inject dynamic FAQPage and Vehicle ItemList schemas from database for public routes
if (strpos($normalizedPath, '/portal') !== 0 && file_exists(__DIR__ . '/seo-db-provider.php')) {
    try {
        require_once __DIR__ . '/seo-db-provider.php';
        $dynamicCtx = sunnyLoadDynamicDatabaseContext();
        $faqsByRoute = sunnyBuildDynamicFaqsByRoute($dynamicCtx);
        $faqJsonLd = sunnyBuildFaqJsonLdForRoute($normalizedPath, $faqsByRoute);

        if ($faqJsonLd) {
            $faqJsonStr = json_encode($faqJsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
            $faqScript = "  <script id=\"schema-faq\" type=\"application/ld+json\">{$faqJsonStr}</script>\n</head>";
            $html = str_replace('</head>', $faqScript, $html);
        }

        $vehicleCatalogSchema = sunnyBuildVehicleCatalogSchema($dynamicCtx, $protocol . '://' . $host);
        if (($normalizedPath === '/vehicles' || $normalizedPath === '/vehicle-list') && $vehicleCatalogSchema) {
            $vehJsonStr = json_encode($vehicleCatalogSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
            $vehScript = "  <script id=\"schema-vehicles\" type=\"application/ld+json\">{$vehJsonStr}</script>\n</head>";
            $html = str_replace('</head>', $vehScript, $html);
        }

        $hydrationPayload = json_encode([
            'generated_at' => $dynamicCtx['generated_at'],
            'faqs_by_route' => $faqsByRoute,
            'vehicle_catalog_schema' => $vehicleCatalogSchema,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
        if (is_string($hydrationPayload) && $hydrationPayload !== '') {
            $hydrationScript = "  <script id=\"sunny-dynamic-seo-payload\" type=\"application/json\">{$hydrationPayload}</script>\n</head>";
            $html = str_replace('</head>', $hydrationScript, $html);
        }
    } catch (\Throwable $e) {
        // Fail open safely so HTML always renders even if DB/SEO provider encounters an error
    }
}

header('Content-Type: text/html; charset=UTF-8');
header('X-Robots-Tag: ' . $robots);
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
echo $html;
