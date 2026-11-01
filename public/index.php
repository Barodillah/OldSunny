<?php
/**
 * Dynamic Open Graph & SEO Fallback for SPA (Single Page Application)
 * Mitsubishi Sun Star Motor Margahayu Bekasi
 *
 * Ensures WhatsApp, Facebook, Twitter/X, Telegram, LinkedIn, and Discord
 * crawlers receive real-time, article-specific thumbnails, titles, and summaries.
 */

// 1. Determine Current Protocol & Domain
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? 80) == 443) ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'cssunmotor.com';
$fullRequestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestPath = parse_url($fullRequestUri, PHP_URL_PATH) ?? '/';
$canonicalUrl = $protocol . '://' . $host . $fullRequestUri;

// 2. Default Fallback SEO Values
$siteName = 'Mitsubishi Sun Margahayu';
$defaultTitle = 'Mitsubishi Sun Margahayu | Dealer Transparan & Bengkel Resmi 24/7';
$defaultDesc = 'Dealer resmi Mitsubishi Sun Star Motor Margahayu Bekasi. Layanan transparansi penuh: simulasi kredit transparan, unit Xforce, Pajero Sport, Xpander, servis bengkel 24/7, dan verifikasi sales resmi.';
$defaultImage = 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp';
$defaultKeywords = 'mitsubishi bekasi, mitsubishi sun margahayu, dealer mitsubishi, servis mitsubishi 24 jam, xforce, pajero sport, xpander';
$type = 'website';
$author = 'PT. Sun Star Motor Margahayu';

$pageTitle = $defaultTitle;
$pageDesc = $defaultDesc;
$pageImage = $defaultImage;
$pageKeywords = $defaultKeywords;

// 3. Static Page Route Definitions
$staticRoutes = [
    '/vehicles' => [
        'title' => 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
        'desc' => 'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi: New Pajero Sport, Xforce, Xpander, Xpander Cross, Triton, dan L300.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
        'keywords' => 'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, promo xpander bekasi',
    ],
    '/vehicle-list' => [
        'title' => 'Katalog Mobil Mitsubishi | Harga OTR & Spesifikasi Sun Margahayu',
        'desc' => 'Daftar lengkap harga OTR, promo, dan spesifikasi lini kendaraan Mitsubishi: New Pajero Sport, Xforce, Xpander, Xpander Cross, Triton, dan L300.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
        'keywords' => 'harga mobil mitsubishi bekasi, pajero sport bekasi, mitsubishi xforce, promo xpander bekasi',
    ],
    '/promo' => [
        'title' => 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
        'desc' => 'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi',
    ],
    '/promo-event' => [
        'title' => 'Promo Spesial Mitsubishi Bekasi | DP Rendah & Bunga 0% Sun Margahayu',
        'desc' => 'Program penawaran eksklusif Mitsubishi Sun Margahayu: promo DP ringan, bunga 0%, cashback puluhan juta, dan paket servis gratis resmi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'promo mitsubishi bekasi, diskon xpander bekasi, promo pajero sport, dp ringan mitsubishi',
    ],
    '/booking' => [
        'title' => 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Jadwalkan perawatan berkala, servis cepat, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu siaga 24 jam.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi',
    ],
    '/booking-service' => [
        'title' => 'Booking Servis Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Jadwalkan perawatan berkala, servis cepat, dan perbaikan kendaraan Mitsubishi Anda di bengkel resmi Sun Margahayu siaga 24 jam.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'booking servis mitsubishi, bengkel mitsubishi bekasi, servis mobil 24 jam bekasi',
    ],
    '/service-on-road' => [
        'title' => 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
        'desc' => 'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi',
    ],
    '/service-on-the-road' => [
        'title' => 'Layanan Darurat & Servis di Jalan 24 Jam (SOS) | Mitsubishi Sun Margahayu',
        'desc' => 'Bantuan darurat mogok, aki drop, ban kempis, dan servis on the road 24/7 resmi dari Mitsubishi Sun Margahayu Bekasi.',
        'image' => 'https://bewhy.id/wp-content/uploads/url_6acf19882a3111.91793750.jpg',
        'keywords' => 'mitsubishi service on the road, montir darurat 24 jam bekasi, towing mitsubishi bekasi',
    ],
    '/facilities' => [
        'title' => 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Eksplorasi fasilitas 3S (Sales, Service, Spare Parts) berstandar global: lounge eksekutif, kids zone, EV charger, dan pit servis modern.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu',
    ],
    '/fasilitas' => [
        'title' => 'Fasilitas Dealer & Bengkel Resmi 24 Jam | Mitsubishi Sun Margahayu',
        'desc' => 'Eksplorasi fasilitas 3S (Sales, Service, Spare Parts) berstandar global: lounge eksekutif, kids zone, EV charger, dan pit servis modern.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'fasilitas dealer mitsubishi bekasi, showroom mitsubishi sun margahayu',
    ],
    '/accessories' => [
        'title' => 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
        'desc' => 'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi bergaransi resmi di Sun Margahayu Bekasi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi',
    ],
    '/aksesoris' => [
        'title' => 'Aksesoris Resmi Mitsubishi Genuine Accessories | Sun Margahayu',
        'desc' => 'Tingkatkan gaya dan kenyamanan kendaraan dengan aksesoris original Mitsubishi bergaransi resmi di Sun Margahayu Bekasi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'aksesoris mitsubishi bekasi, aksesoris pajero sport original, aksesoris xpander resmi',
    ],
    '/sales' => [
        'title' => 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
        'desc' => 'Verifikasi profil sales konsultan resmi Mitsubishi Sun Star Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
        'image' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
        'keywords' => 'sales mitsubishi bekasi, sales resmi sun margahayu, verifikasi sales anti penipuan',
    ],
    '/sales-list' => [
        'title' => 'Daftar Sales Konsultan Resmi Terverifikasi | Mitsubishi Sun Margahayu',
        'desc' => 'Verifikasi profil sales konsultan resmi Mitsubishi Sun Star Motor Margahayu. Hubungi langsung untuk simulasi kredit, test drive, dan penawaran terbaik.',
        'image' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
        'keywords' => 'sales mitsubishi bekasi, sales resmi sun margahayu, verifikasi sales anti penipuan',
    ],
    '/organization' => [
        'title' => 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
        'desc' => 'Mengenal jajaran manajemen dan tim profesional PT Sun Star Motor Margahayu Bekasi yang berdedikasi melayani kepemilikan Mitsubishi Anda.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'struktur organisasi sun margahayu, profil pt sun star motor bekasi',
    ],
    '/struktur-organisasi' => [
        'title' => 'Profil & Struktur Organisasi Dealer | Mitsubishi Sun Margahayu',
        'desc' => 'Mengenal jajaran manajemen dan tim profesional PT Sun Star Motor Margahayu Bekasi yang berdedikasi melayani kepemilikan Mitsubishi Anda.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'struktur organisasi sun margahayu, profil pt sun star motor bekasi',
    ],
    '/news' => [
        'title' => 'Berita, Edukasi Otomotif & Update Resmi | Mitsubishi Sun Margahayu',
        'desc' => 'Kumpulan artikel otomotif terkini, tips perawatan mobil, review unit Mitsubishi, dan pengumuman program dealer Sun Margahayu.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
        'keywords' => 'berita mitsubishi, tips otomotif mitsubishi, review xforce bekasi',
    ],
    '/contact' => [
        'title' => 'Kontak & Lokasi Dealer Resmi | Mitsubishi Sun Margahayu Bekasi',
        'desc' => 'Alamat lengkap, nomor telepon, WhatsApp resmi, dan panduan arah menuju dealer Mitsubishi Sun Star Motor Margahayu Bekasi.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'alamat mitsubishi sun margahayu, nomor telepon mitsubishi bekasi, whatsapp dealer mitsubishi',
    ],
    '/search' => [
        'title' => 'Pencarian Layanan & Kendaraan | Mitsubishi Sun Margahayu',
        'desc' => 'Temukan informasi unit mobil, paket servis, promo terkini, dan panduan otomotif di Mitsubishi Sun Margahayu.',
        'image' => 'https://cssunmotor.com/wp-content/uploads/url_6ae03aca9c4102.54906789.webp',
        'keywords' => 'pencarian mitsubishi sun margahayu, cari mobil bekasi, cari servis mitsubishi',
    ],
];

// Clean path by stripping subfolders (like /OldSunny) if in local XAMPP
$normalizedPath = preg_replace('#^/[^/]+(?=/(?:news|article|vehicles|promo|booking|service-on-road|facilities|accessories|sales|organization|contact|search|portal))#', '', $requestPath);
$normalizedPath = rtrim($normalizedPath, '/') ?: '/';

// 4. Check if Request is an Article Detail Page (/news/{slug} or /article/{slug})
if (preg_match('~^/(?:news|article)/([^/?#]+)~', $normalizedPath, $matches)) {
    $articleSlugOrId = trim(urldecode($matches[1]));
    $type = 'article';
    $articleData = null;

    // STRATEGY A: Fetch directly from local API endpoint (independent of DB socket/permissions)
    $apiCandidateUrls = [
        $protocol . '://' . $host . '/api/articles/' . urlencode($articleSlugOrId),
        'http://127.0.0.1/OldSunny/api/public/api/articles/' . urlencode($articleSlugOrId)
    ];

    foreach ($apiCandidateUrls as $apiUrl) {
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
        }
    }

    // STRATEGY B: Fallback to direct PDO MySQL connection if API call didn't succeed
    if (!$articleData) {
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

                $stmt = $pdo->prepare('SELECT id, slug, title, summary, image_url, author, tags, category FROM articles WHERE slug = ? OR id = ? LIMIT 1');
                $stmt->execute([$articleSlugOrId, $articleSlugOrId]);
                $found = $stmt->fetch();
                if ($found) {
                    $articleData = $found;
                    break;
                }
            } catch (\Throwable $e) {
                // Try next candidate host
            }
        }
    }

    if ($articleData) {
        $pageTitle = trim($articleData['title']) . ' | Mitsubishi Sun Margahayu';
        $pageDesc = trim(strip_tags($articleData['summary'] ?: $articleData['title']));
        if (mb_strlen($pageDesc) > 200) {
            $pageDesc = mb_substr($pageDesc, 0, 197) . '...';
        }
        if (!empty($articleData['image_url'])) {
            $pageImage = trim($articleData['image_url']);
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
    }
} elseif (isset($staticRoutes[$normalizedPath])) {
    // 5. Match static route
    $matched = $staticRoutes[$normalizedPath];
    $pageTitle = $matched['title'];
    $pageDesc = $matched['desc'];
    $pageImage = $matched['image'];
    $pageKeywords = $matched['keywords'];
} elseif (strpos($normalizedPath, '/portal') === 0) {
    // 6. Portal route
    $pageTitle = 'Portal Manajemen Operasional | Mitsubishi Sun Margahayu';
    $pageDesc = 'Sistem operasional internal dealer, analitik leads, Sunny AI, dan manajemen data Sun Margahayu.';
}

// Ensure Image is an Absolute URL (mandatory for WhatsApp & Open Graph preview)
if (!preg_match('#^https?://#i', $pageImage)) {
    $pageImage = $protocol . '://' . $host . '/' . ltrim($pageImage, '/');
}

// 7. Locate index.html (SPA Entry File)
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

// 8. Replace Title
$safeTitle = htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8');
$safeDesc = htmlspecialchars($pageDesc, ENT_QUOTES, 'UTF-8');
$safeImage = htmlspecialchars($pageImage, ENT_QUOTES, 'UTF-8');
$safeKeywords = htmlspecialchars($pageKeywords, ENT_QUOTES, 'UTF-8');
$safeCanonical = htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8');
$safeAuthor = htmlspecialchars($author, ENT_QUOTES, 'UTF-8');
$safeType = htmlspecialchars($type, ENT_QUOTES, 'UTF-8');

// Replace <title>
$html = preg_replace('#<title>.*?</title>#is', "<title>{$safeTitle}</title>", $html);

// Replace or Insert Standard Meta Description
if (preg_match('#<meta\s+name=["\']description["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+name=["\']description["\'][^>]*>#i', "<meta name=\"description\" content=\"{$safeDesc}\" />", $html);
} else {
    $html = str_replace('</head>', "  <meta name=\"description\" content=\"{$safeDesc}\" />\n</head>", $html);
}

// Replace or Insert Keywords
if (preg_match('#<meta\s+name=["\']keywords["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+name=["\']keywords["\'][^>]*>#i', "<meta name=\"keywords\" content=\"{$safeKeywords}\" />", $html);
}

// Replace or Insert Author
if (preg_match('#<meta\s+name=["\']author["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+name=["\']author["\'][^>]*>#i', "<meta name=\"author\" content=\"{$safeAuthor}\" />", $html);
}

// Replace Open Graph Tags
$html = preg_replace('#<meta\s+property=["\']og:title["\'][^>]*>#i', "<meta property=\"og:title\" content=\"{$safeTitle}\" />", $html);
$html = preg_replace('#<meta\s+property=["\']og:description["\'][^>]*>#i', "<meta property=\"og:description\" content=\"{$safeDesc}\" />", $html);
$html = preg_replace('#<meta\s+property=["\']og:image["\'][^>]*>#i', "<meta property=\"og:image\" content=\"{$safeImage}\" />", $html);
$html = preg_replace('#<meta\s+property=["\']og:type["\'][^>]*>#i', "<meta property=\"og:type\" content=\"{$safeType}\" />", $html);

// Inject or Replace og:url
if (preg_match('#<meta\s+property=["\']og:url["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<meta\s+property=["\']og:url["\'][^>]*>#i', "<meta property=\"og:url\" content=\"{$safeCanonical}\" />", $html);
} else {
    $html = str_replace('</head>', "  <meta property=\"og:url\" content=\"{$safeCanonical}\" />\n</head>", $html);
}

// Replace Twitter Card Tags
$html = preg_replace('#<meta\s+name=["\']twitter:title["\'][^>]*>#i', "<meta name=\"twitter:title\" content=\"{$safeTitle}\" />", $html);
$html = preg_replace('#<meta\s+name=["\']twitter:description["\'][^>]*>#i', "<meta name=\"twitter:description\" content=\"{$safeDesc}\" />", $html);
$html = preg_replace('#<meta\s+name=["\']twitter:image["\'][^>]*>#i', "<meta name=\"twitter:image\" content=\"{$safeImage}\" />", $html);

// Inject or Replace Canonical Link
if (preg_match('#<link\s+rel=["\']canonical["\'][^>]*>#i', $html)) {
    $html = preg_replace('#<link\s+rel=["\']canonical["\'][^>]*>#i', "<link rel=\"canonical\" href=\"{$safeCanonical}\" />", $html);
} else {
    $html = str_replace('</head>', "  <link rel=\"canonical\" href=\"{$safeCanonical}\" />\n</head>", $html);
}

// 9. Send Response
header('Content-Type: text/html; charset=UTF-8');
echo $html;
