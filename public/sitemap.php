<?php
/**
 * Dynamic XML Sitemap Generator
 * Mitsubishi Sun Star Prima Motor Margahayu Bekasi (https://cssunmotor.com)
 *
 * Outputs all canonical public SPA routes and dynamically published articles
 * from the backend API / MySQL database in standard sitemaps.org XML format.
 */

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['SERVER_PORT'] ?? 80) == 443)
    || (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || (($_SERVER['HTTP_HOST'] ?? 'cssunmotor.com') === 'cssunmotor.com');
$protocol = $isHttps ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'cssunmotor.com';
$baseUrl = $protocol . '://' . $host;
$today = date('Y-m-d');

// 1. Canonical Public Static Routes
$staticPages = [
    ['loc' => '/',                'changefreq' => 'daily',   'priority' => '1.0'],
    ['loc' => '/vehicles',        'changefreq' => 'weekly',  'priority' => '0.9'],
    ['loc' => '/promo',           'changefreq' => 'weekly',  'priority' => '0.9'],
    ['loc' => '/booking',         'changefreq' => 'weekly',  'priority' => '0.9'],
    ['loc' => '/service-on-road', 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['loc' => '/facilities',      'changefreq' => 'monthly', 'priority' => '0.8'],
    ['loc' => '/accessories',     'changefreq' => 'monthly', 'priority' => '0.8'],
    ['loc' => '/sales',           'changefreq' => 'weekly',  'priority' => '0.8'],
    ['loc' => '/organization',    'changefreq' => 'monthly', 'priority' => '0.7'],
    ['loc' => '/news',            'changefreq' => 'daily',   'priority' => '0.9'],
    ['loc' => '/faq',             'changefreq' => 'weekly',  'priority' => '0.8'],
    ['loc' => '/contact',         'changefreq' => 'monthly', 'priority' => '0.8'],
];

// 2. Fetch Dynamic Published Articles (Strategy A: Local API, Strategy B: PDO Fallback)
$articles = [];

$apiCandidateUrls = [
    $baseUrl . '/api/articles',
    'http://127.0.0.1/OldSunny/api/public/api/articles'
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
        if (!empty($parsed['success']) && is_array($parsed['data'])) {
            $articles = $parsed['data'];
            break;
        }
    }
}

if (empty($articles)) {
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

            $stmt = $pdo->query("SELECT id, slug, status, updated_at, created_at FROM articles WHERE status = 'published' OR status IS NULL ORDER BY id DESC");
            if ($stmt) {
                $articles = $stmt->fetchAll();
                break;
            }
        } catch (\Throwable $e) {
            // Try next candidate host
        }
    }
}

header('Content-Type: application/xml; charset=UTF-8');
header('X-Robots-Tag: noindex');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($staticPages as $page): ?>
  <url>
    <loc><?= htmlspecialchars($baseUrl . $page['loc'], ENT_XML1, 'UTF-8') ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq><?= $page['changefreq'] ?></changefreq>
    <priority><?= $page['priority'] ?></priority>
  </url>
<?php endforeach; ?>
<?php
$seenSlugs = [];
foreach ($articles as $art):
    $status = strtolower($art['status'] ?? 'published');
    if ($status !== 'published') continue;
    $slug = trim($art['slug'] ?? $art['id'] ?? '');
    if ($slug === '' || isset($seenSlugs[$slug])) continue;
    $seenSlugs[$slug] = true;

    $rawDate = $art['updated_at'] ?? $art['updatedAt'] ?? $art['created_at'] ?? $art['createdAt'] ?? null;
    $lastmod = $today;
    if (!empty($rawDate)) {
        $ts = strtotime((string)$rawDate);
        if ($ts !== false && $ts > 0) {
            $lastmod = date('Y-m-d', $ts);
        }
    }
    $articleUrl = $baseUrl . '/news/' . rawurlencode($slug);
?>
  <url>
    <loc><?= htmlspecialchars($articleUrl, ENT_XML1, 'UTF-8') ?></loc>
    <lastmod><?= $lastmod ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
<?php endforeach; ?>
</urlset>
