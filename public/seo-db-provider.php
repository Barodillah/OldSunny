<?php
/**
 * Dynamic SEO, AEO (FAQPage), and GEO (llms.txt / llms-full.txt) Database Provider
 * Mitsubishi Sun Star Prima Motor Margahayu Bekasi
 *
 * Reads live data from MySQL tables (knowledge_items, promos, employees, sales,
 * articles, chat_messages) with automatic fallback to local knowledge JSON files.
 */

if (!function_exists('sunnyFormatRupiah')) {
    function sunnyFormatRupiah($amount): string
    {
        $num = (float) $amount;
        if ($num <= 0)
            return 'Rp 0';
        return 'Rp ' . number_format($num, 0, ',', '.');
    }
}

if (!function_exists('sunnyConnectPdo')) {
    function sunnyConnectPdo(): ?PDO
    {
        static $cachedPdo = false;
        if ($cachedPdo !== false) {
            return $cachedPdo;
        }

        $dbConfigPaths = [
            __DIR__ . '/../api/.env',
            __DIR__ . '/api/.env',
            dirname(__DIR__) . '/api/.env',
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
                    if ($line === '' || strpos($line, '#') === 0)
                        continue;
                    if (preg_match('/^DB_HOST=(.*)$/', $line, $m))
                        $dbHost = trim($m[1], " \t\n\r\0\x0B\"'");
                    if (preg_match('/^DB_PORT=(.*)$/', $line, $m))
                        $dbPort = trim($m[1], " \t\n\r\0\x0B\"'");
                    if (preg_match('/^DB_DATABASE=(.*)$/', $line, $m))
                        $dbName = trim($m[1], " \t\n\r\0\x0B\"'");
                    if (preg_match('/^DB_USERNAME=(.*)$/', $line, $m))
                        $dbUser = trim($m[1], " \t\n\r\0\x0B\"'");
                    if (preg_match('/^DB_PASSWORD=(.*)$/', $line, $m))
                        $dbPass = trim($m[1], " \t\n\r\0\x0B\"'");
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
                    PDO::ATTR_TIMEOUT => 2,
                ]);
                $cachedPdo = $pdo;
                return $pdo;
            } catch (\Throwable $e) {
                // Continue trying next candidate host
            }
        }

        $cachedPdo = null;
        return null;
    }
}

if (!function_exists('sunnyReadKnowledgeJsonFallback')) {
    function sunnyReadKnowledgeJsonFallback(string $filename): array
    {
        $candidates = [
            __DIR__ . '/../knowledge/' . $filename,
            __DIR__ . '/knowledge/' . $filename,
            dirname(__DIR__) . '/knowledge/' . $filename,
            __DIR__ . '/../' . $filename,
        ];
        foreach ($candidates as $path) {
            if (file_exists($path) && is_readable($path)) {
                $raw = file_get_contents($path);
                $decoded = json_decode((string) $raw, true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            }
        }
        return [];
    }
}

if (!function_exists('sunnyLoadDynamicDatabaseContext')) {
    function sunnyLoadDynamicDatabaseContext(): array
    {
        static $cachedContext = null;
        if ($cachedContext !== null) {
            return $cachedContext;
        }

        $pdo = sunnyConnectPdo();

        // 1. Load dealer_info baseline
        $dealerInfo = sunnyReadKnowledgeJsonFallback('dealer_info.json');

        // 2. Load knowledge_items from DB (with JSON file fallback)
        $knowledgeMap = [
            'price_list' => null,
            'extended_smart' => null,
            'service_data' => null,
            'accessories' => null,
            'sparepart' => null,
        ];
        $knowledgeUpdatedAt = [];

        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT `key`, `payload`, `metadata`, `updated_at` FROM `knowledge_items` WHERE `is_active` = 1 OR `is_active` IS NULL");
                if ($stmt) {
                    while ($row = $stmt->fetch()) {
                        $k = strtolower(trim($row['key'] ?? ''));
                        $payload = is_array($row['payload']) ? $row['payload'] : json_decode((string) ($row['payload'] ?? ''), true);
                        if (!is_array($payload))
                            continue;

                        if (in_array($k, ['price_list', 'price-list'], true)) {
                            $knowledgeMap['price_list'] = $payload;
                            $knowledgeUpdatedAt['price_list'] = $row['updated_at'] ?? null;
                        } elseif (in_array($k, ['extended_smart', 'extended_package', 'extended_smart_package', 'smart_package'], true)) {
                            $knowledgeMap['extended_smart'] = $payload;
                            $knowledgeUpdatedAt['extended_smart'] = $row['updated_at'] ?? null;
                        } elseif (in_array($k, ['service_data', 'perawatan', 'perawatan_berkala', 'mitsubishi_perawatan_berkala'], true)) {
                            $knowledgeMap['service_data'] = $payload;
                            $knowledgeUpdatedAt['service_data'] = $row['updated_at'] ?? null;
                        } elseif (in_array($k, ['accessories', 'aksesoris'], true)) {
                            $knowledgeMap['accessories'] = $payload;
                            $knowledgeUpdatedAt['accessories'] = $row['updated_at'] ?? null;
                        } elseif (in_array($k, ['sparepart', 'spare_part', 'spareparts'], true)) {
                            $knowledgeMap['sparepart'] = $payload;
                            $knowledgeUpdatedAt['sparepart'] = $row['updated_at'] ?? null;
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Fallback to JSON files below
            }
        }

        if (empty($knowledgeMap['price_list'])) {
            $knowledgeMap['price_list'] = sunnyReadKnowledgeJsonFallback('price_list.json');
        }
        if (empty($knowledgeMap['extended_smart'])) {
            $knowledgeMap['extended_smart'] = sunnyReadKnowledgeJsonFallback('extended_smart_package.json');
        }
        if (empty($knowledgeMap['service_data'])) {
            $knowledgeMap['service_data'] = sunnyReadKnowledgeJsonFallback('mitsubishi_perawatan_berkala.json');
        }
        if (empty($knowledgeMap['accessories'])) {
            $knowledgeMap['accessories'] = sunnyReadKnowledgeJsonFallback('aksesoris.json');
        }
        if (empty($knowledgeMap['sparepart'])) {
            $knowledgeMap['sparepart'] = sunnyReadKnowledgeJsonFallback('sparepart.json');
        }

        // 3. Load Active Promos from DB (with promo_event.json fallback)
        $promos = [];
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT `slug`, `title`, `category`, `category_label`, `badge`, `target_vehicles`, `validity`, `highlight`, `bullets`, `terms`, `updated_at` FROM `promos` WHERE `is_active` = 1 ORDER BY `sort_order` ASC, `id` ASC");
                if ($stmt) {
                    while ($row = $stmt->fetch()) {
                        $row['bullets'] = is_array($row['bullets']) ? $row['bullets'] : (json_decode((string) ($row['bullets'] ?? '[]'), true) ?: []);
                        $row['terms'] = is_array($row['terms']) ? $row['terms'] : (json_decode((string) ($row['terms'] ?? '[]'), true) ?: []);
                        $promos[] = $row;
                    }
                }
            } catch (\Throwable $e) {
                // Fallback below
            }
        }
        if (empty($promos)) {
            $fallbackPromo = sunnyReadKnowledgeJsonFallback('promo_event.json');
            $rawPromos = $fallbackPromo['promos'] ?? $fallbackPromo;
            if (is_array($rawPromos)) {
                foreach ($rawPromos as $p) {
                    if (is_array($p) && !empty($p['title']) && ($p['is_active'] ?? true)) {
                        $promos[] = $p;
                    }
                }
            }
        }

        // 4. Load Employees (Active & Inactive) from DB
        $activeEmployees = [];
        $inactiveEmployees = [];
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT `id`, `name`, `role`, `level`, `department`, `tenure`, `nik`, `badge`, `status`, `deactivated_at`, `deactivated_reason` FROM `employees` ORDER BY `id` ASC");
                if ($stmt) {
                    while ($row = $stmt->fetch()) {
                        if (($row['status'] ?? 'active') === 'active') {
                            $activeEmployees[] = $row;
                        } else {
                            $inactiveEmployees[] = $row;
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Ignore if table not migrated yet
            }
        }

        // 5. Load Sales (Active & Inactive) with Supervisor Name from DB
        $activeSales = [];
        $inactiveSales = [];
        if ($pdo) {
            try {
                $stmt = $pdo->query("
                    SELECT s.`id`, s.`name`, s.`position`, s.`phone`, s.`email`, s.`nik`, s.`specialization`, s.`tenure`, s.`joined_year`, s.`status`, s.`deactivated_at`, s.`deactivated_reason`, e.`name` AS `supervisor_name`
                    FROM `sales` s
                    LEFT JOIN `employees` e ON s.`supervisor_id` = e.`id`
                    ORDER BY s.`id` ASC
                ");
                if ($stmt) {
                    while ($row = $stmt->fetch()) {
                        if (($row['status'] ?? 'active') === 'active') {
                            $activeSales[] = $row;
                        } else {
                            $inactiveSales[] = $row;
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Ignore if table not migrated yet
            }
        }

        // 6. Load Published Articles from DB
        $articles = [];
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT `id`, `slug`, `title`, `category`, `summary`, `author`, `date`, `views_count`, `likes_count`, `created_at`, `updated_at` FROM `articles` WHERE `status` = 'published' OR `status` IS NULL ORDER BY `id` DESC LIMIT 20");
                if ($stmt) {
                    $articles = $stmt->fetchAll() ?: [];
                }
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        // 7. Compute Sunny AI Avg Response Time from chat_messages
        $avgResponseTime = 1.5;
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT `session_id`, `sender_type`, `created_at` FROM `chat_messages` ORDER BY `id` DESC LIMIT 50");
                if ($stmt) {
                    $msgs = array_reverse($stmt->fetchAll() ?: []);
                    $diffs = [];
                    for ($i = 0; $i < count($msgs) - 1; $i++) {
                        $curr = $msgs[$i];
                        $next = $msgs[$i + 1];
                        if (
                            ($curr['session_id'] ?? '') === ($next['session_id'] ?? '')
                            && ($curr['sender_type'] ?? '') === 'user'
                            && in_array($next['sender_type'] ?? '', ['ai', 'bot', 'assistant'], true)
                        ) {
                            $diff = strtotime((string) $next['created_at']) - strtotime((string) $curr['created_at']);
                            if ($diff >= 0 && $diff <= 180) {
                                $diffs[] = $diff === 0 ? 0.8 : (float) $diff;
                            }
                        }
                    }
                    if (count($diffs) > 0) {
                        $avgResponseTime = round(array_sum($diffs) / count($diffs), 1);
                    }
                }
            } catch (\Throwable $e) {
                // Keep default 1.5s
            }
        }

        $cachedContext = [
            'dealer_info' => $dealerInfo,
            'knowledge' => $knowledgeMap,
            'knowledge_updated_at' => $knowledgeUpdatedAt,
            'promos' => $promos,
            'active_employees' => $activeEmployees,
            'inactive_employees' => $inactiveEmployees,
            'active_sales' => $activeSales,
            'inactive_sales' => $inactiveSales,
            'articles' => $articles,
            'avg_response_time' => $avgResponseTime,
            'generated_at' => date('c'),
        ];

        return $cachedContext;
    }
}

if (!function_exists('sunnyExtractVehicleSummaries')) {
    function sunnyExtractVehicleSummaries(array $priceList): array
    {
        $modelLabels = [
            'destinator' => ['name' => 'Mitsubishi Destinator', 'bodyType' => 'Premium MPV / SUV'],
            'new_xforce' => ['name' => 'Mitsubishi New Xforce', 'bodyType' => 'Compact SUV'],
            'new_xpander' => ['name' => 'Mitsubishi New Xpander', 'bodyType' => 'Family MPV'],
            'new_xpander_cross' => ['name' => 'Mitsubishi New Xpander Cross', 'bodyType' => 'Crossover MPV'],
            'new_pajero_sport' => ['name' => 'Mitsubishi New Pajero Sport', 'bodyType' => 'SUV 4x4 / 4x2'],
            'triton' => ['name' => 'Mitsubishi All New Triton', 'bodyType' => 'Double & Single Cabin Pickup'],
            'l300' => ['name' => 'Mitsubishi Colt L300 Euro 4', 'bodyType' => 'Commercial Pickup'],
        ];

        $passenger = $priceList['passenger_car'] ?? [];
        $summaries = [];

        foreach ($passenger as $key => $info) {
            if (!is_array($info))
                continue;
            $items = $info['items'] ?? [];
            $prices = [];
            $variantStrings = [];
            foreach ($items as $item) {
                $p = (int) ($item['price'] ?? 0);
                if ($p > 0) {
                    $prices[] = $p;
                    $variantStrings[] = ($item['type'] ?? 'Varian') . ' (' . sunnyFormatRupiah($p) . ')';
                }
            }
            if (empty($prices))
                continue;

            $minP = min($prices);
            $maxP = max($prices);
            $meta = $modelLabels[$key] ?? [
                'name' => !empty($info['name']) ? 'Mitsubishi ' . $info['name'] : 'Mitsubishi ' . ucwords(str_replace('_', ' ', $key)),
                'bodyType' => 'Passenger Vehicle',
            ];

            $summaries[$key] = [
                'key' => $key,
                'name' => $meta['name'],
                'bodyType' => $meta['bodyType'],
                'image' => $info['image'] ?? 'https://cssunmotor.com/wp-content/uploads/url_6ab0a0771891e7.52336063.webp',
                'min_price' => $minP,
                'max_price' => $maxP,
                'min_formatted' => sunnyFormatRupiah($minP),
                'max_formatted' => sunnyFormatRupiah($maxP),
                'range_formatted' => $minP === $maxP
                    ? sunnyFormatRupiah($minP)
                    : sunnyFormatRupiah($minP) . ' s/d ' . sunnyFormatRupiah($maxP),
                'variant_count' => count($items),
                'items' => $items,
                'variant_strings' => $variantStrings,
                'additional_cost' => $info['additional_cost'] ?? [],
            ];
        }

        return $summaries;
    }
}

if (!function_exists('sunnyBuildVehicleCatalogSchema')) {
    function sunnyBuildVehicleCatalogSchema(array $ctx, string $baseUrl = 'https://cssunmotor.com'): array
    {
        $priceList = $ctx['knowledge']['price_list'] ?? [];
        $summaries = sunnyExtractVehicleSummaries($priceList);
        $elements = [];
        $pos = 1;

        foreach ($summaries as $m) {
            $img = $m['image'];
            if (!preg_match('#^https?://#i', $img)) {
                $img = rtrim($baseUrl, '/') . '/' . ltrim($img, '/');
            }
            $elements[] = [
                '@type' => 'ListItem',
                'position' => $pos++,
                'item' => [
                    '@type' => ['Car', 'Product'],
                    'name' => $m['name'],
                    'image' => $img,
                    'bodyType' => $m['bodyType'],
                    'brand' => [
                        '@type' => 'Brand',
                        'name' => 'Mitsubishi Motors',
                    ],
                    'offers' => [
                        '@type' => 'AggregateOffer',
                        'priceCurrency' => 'IDR',
                        'offerCount' => $m['variant_count'],
                        'lowPrice' => $m['min_price'],
                        'highPrice' => $m['max_price'],
                        'availability' => 'https://schema.org/InStock',
                        'seller' => [
                            '@type' => 'AutoDealer',
                            'name' => 'Mitsubishi Sun Margahayu (PT Sun Star Prima Motor)',
                        ],
                    ],
                ],
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => 'Katalog Harga OTR Kendaraan Resmi Mitsubishi Sun Margahayu Bekasi (' . ($priceList['meta']['periode'] ?? date('F Y')) . ')',
            'itemListElement' => $elements,
        ];
    }
}

if (!function_exists('sunnyBuildDynamicFaqsByRoute')) {
    function sunnyBuildDynamicFaqsByRoute(array $ctx): array
    {
        $priceList = $ctx['knowledge']['price_list'] ?? [];
        $periodeOtr = $priceList['meta']['periode'] ?? date('F Y');
        $featuredKeys = $priceList['featured_models'] ?? ['new_xforce', 'destinator', 'new_pajero_sport'];
        $vehicleSummaries = sunnyExtractVehicleSummaries($priceList);

        // Build Featured Models text
        $featuredSentences = [];
        foreach ($featuredKeys as $fk) {
            if (isset($vehicleSummaries[$fk])) {
                $v = $vehicleSummaries[$fk];
                $featuredSentences[] = "{$v['name']} ({$v['range_formatted']})";
            }
        }
        if (empty($featuredSentences)) {
            foreach (array_slice($vehicleSummaries, 0, 3) as $v) {
                $featuredSentences[] = "{$v['name']} ({$v['range_formatted']})";
            }
        }
        $featuredText = implode(', ', $featuredSentences);

        // Build All Passenger Cars text
        $allPassengerParts = [];
        foreach ($vehicleSummaries as $v) {
            $allPassengerParts[] = "{$v['name']} ({$v['variant_count']} varian: {$v['range_formatted']})";
        }
        $allPassengerText = implode('; ', $allPassengerParts);

        // Additional color costs
        $colorCostParts = [];
        foreach ($vehicleSummaries as $v) {
            if (!empty($v['additional_cost']['warna_putih'])) {
                $colorCostParts[] = "{$v['name']} warna putih +" . sunnyFormatRupiah($v['additional_cost']['warna_putih']);
            }
            if (!empty($v['additional_cost']['two_tone'])) {
                $colorCostParts[] = "{$v['name']} Two-Tone +" . sunnyFormatRupiah($v['additional_cost']['two_tone']);
            }
        }
        $colorCostText = !empty($colorCostParts)
            ? implode(', ', $colorCostParts) . '.'
            : 'Tersedia opsi warna spesial dengan penyesuaian harga sesuai tipe kendaraan.';

        // Leadership & Staff from DB
        $activeEmployees = $ctx['active_employees'] ?? [];
        $inactiveEmployees = $ctx['inactive_employees'] ?? [];
        $activeSales = $ctx['active_sales'] ?? [];
        $inactiveSales = $ctx['inactive_sales'] ?? [];

        $direksiName = null;
        $csmName = null;
        $managersList = [];
        $supervisorsList = [];

        foreach ($activeEmployees as $emp) {
            $lvl = strtolower($emp['level'] ?? '');
            $label = trim($emp['name']) . ' (' . trim($emp['role']) . ')';
            if ($lvl === 'direksi' && !$direksiName) {
                $direksiName = $label;
            } elseif ($lvl === 'csm' && !$csmName) {
                $csmName = $label;
            } elseif ($lvl === 'managerial') {
                $managersList[] = $label;
            } elseif ($lvl === 'supervisor') {
                $supervisorsList[] = trim($emp['name']);
            }
        }

        $leadershipSummary = [];
        if ($direksiName)
            $leadershipSummary[] = "Direksi/Pimpinan Cabang: {$direksiName}";
        if ($csmName)
            $leadershipSummary[] = "Customer Satisfaction Manager (CSM): {$csmName}";
        if (!empty($managersList))
            $leadershipSummary[] = 'Jajaran Manajer: ' . implode(', ', array_slice($managersList, 0, 5));
        if (!empty($supervisorsList))
            $leadershipSummary[] = 'Supervisor Sales: ' . implode(', ', array_slice($supervisorsList, 0, 6));

        $leadershipText = !empty($leadershipSummary)
            ? implode('. ', $leadershipSummary) . '.'
            : 'Dipimpin oleh jajaran Branch Manager, Customer Satisfaction Manager (CSM), Service Manager, dan Sales Supervisor resmi PT Sun Star Prima Motor.';

        // Sales active & inactive summary
        $salesCount = count($activeSales);
        $salesNamesSample = array_map(function ($s) {
            $spvInfo = !empty($s['supervisor_name']) ? " (SPV: {$s['supervisor_name']})" : '';
            return trim($s['name']) . $spvInfo;
        }, array_slice($activeSales, 0, 8));
        $salesListText = $salesCount > 0
            ? "Saat ini terdapat {$salesCount} Sales Consultant resmi berstatus aktif di database kami, antara lain: " . implode(', ', $salesNamesSample) . ($salesCount > 8 ? ', dan rekan wiraniaga terverifikasi lainnya.' : '.')
            : 'Seluruh wiraniaga resmi kami terdaftar dan diverifikasi langsung di bawah bimbingan Supervisor PT Sun Star Prima Motor.';

        $totalInactive = count($inactiveEmployees) + count($inactiveSales);
        $inactiveNames = [];
        foreach (array_slice($inactiveSales, 0, 4) as $is) {
            $inactiveNames[] = trim($is['name']) . ' (Eks Sales)';
        }
        foreach (array_slice($inactiveEmployees, 0, 4) as $ie) {
            $inactiveNames[] = trim($ie['name']) . ' (Eks ' . trim($ie['role']) . ')';
        }
        $inactiveText = $totalInactive > 0
            ? "Tercatat {$totalInactive} personel nonaktif di direktori transparansi database kami (seperti " . implode(', ', array_slice($inactiveNames, 0, 5)) . "). Mereka sudah tidak lagi memiliki wewenang mewakili PT Sun Star Prima Motor. Pastikan seluruh pembayaran hanya ditransfer ke rekening resmi Bank BCA 3425419999 a.n. PT Sun Star Prima Motor."
            : 'Daftar personel yang sudah resign atau nonaktif dipublikasikan secara real-time di halaman Sales dan Struktur Organisasi. Seluruh pembayaran SPK, DP, dan servis wajib ditransfer hanya ke Bank BCA 3425419999 a.n. PT Sun Star Prima Motor.';

        // Extended SMART Package dynamic text
        $extSmartRaw = $ctx['knowledge']['extended_smart']['extended_smart_package'] ?? ($ctx['knowledge']['extended_smart'] ?? []);
        $xpSmartTiers = $extSmartRaw['xpander_series']['prices_including_vat'] ?? [];
        $pjSmartTiers = $extSmartRaw['pajero_sport']['prices_including_vat'] ?? [];

        $xpSmartParts = [];
        foreach ($xpSmartTiers as $t) {
            $val = $t['after'] ?? ($t['price'] ?? 0);
            if ($val > 0)
                $xpSmartParts[] = ($t['type'] ?? '') . ': ' . sunnyFormatRupiah($val);
        }
        $pjSmartParts = [];
        foreach ($pjSmartTiers as $t) {
            $val = $t['price'] ?? ($t['after'] ?? 0);
            if ($val > 0)
                $pjSmartParts[] = ($t['type'] ?? '') . ': ' . sunnyFormatRupiah($val);
        }
        $smartPackageDynamicAnswer = 'Harga resmi paket perpanjangan servis Extended SMART Package (termasuk PPN 11%) di database kami: '
            . (!empty($xpSmartParts) ? 'Untuk Xpander, Xpander Cross, dan Xforce (' . implode(', ', $xpSmartParts) . '). ' : '')
            . (!empty($pjSmartParts) ? 'Untuk Pajero Sport (' . implode(', ', $pjSmartParts) . '). ' : '')
            . 'Pelanggan menghemat biaya perawatan hingga 25% serta mendapatkan gratis jasa, suku cadang berkala, dan perpanjangan layanan darurat 24 jam selama 1 tahun.';

        // Service Data dynamic text
        $serviceData = $ctx['knowledge']['service_data'] ?? [];
        $freePolicy = $serviceData['kebijakan_free_service'] ?? [];
        $xpander10k = $serviceData['kendaraan']['xpander']['perawatan']['10000']['grand_total'] ?? 1530690;
        $xpander60k = $serviceData['kendaraan']['xpander']['perawatan']['60000']['grand_total'] ?? 2436450;
        $serviceDynamicAnswer = ($freePolicy['keterangan_cakupan'] ?? 'Servis berkala 10.000 KM s/d 50.000 KM (maksimal 4 tahun sejak tanggal penyerahan kendaraan) ditanggung gratis jasa dan suku cadang sesuai buku garansi MMKSI (khusus Destinator gratis servis s/d 60.000 KM).')
            . ' Untuk kendaraan yang telah melewati masa gratis servis, estimasi biaya perawatan berkala Xpander di database kami mulai dari '
            . sunnyFormatRupiah($xpander10k) . ' (servis kecil) hingga ' . sunnyFormatRupiah($xpander60k) . ' (servis 60.000 KM termasuk PPN 11%).';

        // Promos dynamic text
        $promos = $ctx['promos'] ?? [];
        $activePromoTitles = [];
        $leasingPromoDetails = [];
        $serviceEventPromoDetails = [];
        foreach ($promos as $p) {
            $title = trim($p['title'] ?? '');
            $target = trim($p['target_vehicles'] ?? 'Lini Mitsubishi');
            $val = trim($p['validity'] ?? 'Periode berjalan');
            $highlight = trim($p['highlight'] ?? '');
            if ($title !== '') {
                $activePromoTitles[] = "{$title} ({$target}, {$val})";
                if (($p['category'] ?? '') === 'leasing') {
                    $leasingPromoDetails[] = "{$title}: {$highlight}";
                } else {
                    $serviceEventPromoDetails[] = "{$title} ({$val}): {$highlight}";
                }
            }
        }
        $activePromosAnswer = !empty($activePromoTitles)
            ? 'Terdapat ' . count($activePromoTitles) . ' program promo resmi yang sedang aktif di database Mitsubishi Sun Margahayu: ' . implode('; ', $activePromoTitles) . '.'
            : 'Mitsubishi Sun Margahayu menyediakan promo bunga 0%, paket DP ringan, subsidi tukar tambah (trade-in), dan diskon servis berkala.';

        $leasingPromosAnswer = !empty($leasingPromoDetails)
            ? implode(' ', $leasingPromoDetails)
            : 'Tersedia paket kredit bunga 0% hingga 2 tahun, DP ringan mulai Rp 15 jutaan, serta subsidi trade-in hingga Rp 10 juta melalui leasing resmi rekanan.';

        $serviceEventPromosAnswer = !empty($serviceEventPromoDetails)
            ? implode(' ', $serviceEventPromoDetails)
            : 'Tersedia Showroom Weekend Gathering setiap akhir pekan dengan gratis Noach Coffee serta diskon jasa servis berkala 10% dan sparepart 15% untuk booking H-1.';

        // Accessories & Sparepart dynamic text
        $accRaw = $ctx['knowledge']['accessories']['mitsubishi_accessories'] ?? ($ctx['knowledge']['accessories'] ?? []);
        $accModelSummaries = [];
        foreach ($accRaw as $modelName => $sections) {
            if (!is_array($sections))
                continue;
            $pkgList = $sections['paket_aksesoris'] ?? [];
            if (!empty($pkgList)) {
                $firstPkg = $pkgList[0];
                $accModelSummaries[] = "{$modelName} (contoh: {$firstPkg['item']} " . sunnyFormatRupiah($firstPkg['price'] ?? 0) . ')';
            } else {
                $accModelSummaries[] = $modelName;
            }
        }
        $accessoriesAnswer = !empty($accModelSummaries)
            ? 'Katalog Mitsubishi Genuine Accessories (MGA) resmi tersedia untuk model: ' . implode(', ', $accModelSummaries) . '. Seluruh aksesoris dijamin orisinal, presisi tanpa merusak garansi kelistrikan/bodi, dan dapat dipasang langsung di bengkel Sun Margahayu.'
            : 'Tersedia aksesoris resmi Mitsubishi Genuine Accessories (MGA) untuk Destinator, Xforce, Xpander, Xpander Cross, Pajero Sport, dan Triton.';

        $spareRaw = $ctx['knowledge']['sparepart'] ?? [];
        $spareList = $spareRaw['spare_parts'] ?? [];
        $totalSpare = count($spareList);
        $sampleSpare = [];
        foreach (array_slice($spareList, 0, 5) as $sp) {
            $sampleSpare[] = ($sp['nama'] ?? 'Part') . ' (' . ($sp['nomor_part'] ?? '-') . ': ' . sunnyFormatRupiah($sp['harga_satuan'] ?? 0) . ')';
        }
        $sparepartAnswer = $totalSpare > 0
            ? "Database suku cadang kami mencatat {$totalSpare} item fast-moving Mitsubishi Genuine Parts berstatus selalu tersedia (always available), di antaranya: " . implode(', ', $sampleSpare) . ' (harga sebelum PPN 11%).'
            : 'Suku cadang fast-moving Mitsubishi Genuine Parts selalu tersedia di bengkel resmi Sun Margahayu.';

        // Articles dynamic text
        $articles = $ctx['articles'] ?? [];
        $articleCount = count($articles);
        $latestTitles = array_map(function ($a) {
            return '"' . trim($a['title'] ?? '') . '" (' . trim($a['category'] ?? 'Berita') . ')';
        }, array_slice($articles, 0, 4));
        $articlesAnswer = $articleCount > 0
            ? "Saat ini terdapat {$articleCount} publikasi dan artikel edukasi resmi di portal berita kami. Artikel terbaru meliputi: " . implode(', ', $latestTitles) . '.'
            : 'Pusat berita Mitsubishi Sun Margahayu menyajikan informasi rilis unit terbaru, tips perawatan berkala, dan edukasi keamanan transaksi konsumen.';

        $avgResp = $ctx['avg_response_time'] ?? 1.5;

        $routesMap = [
            '/' => [
                [
                    'q' => "Apa saja model mobil unggulan dan harga OTR Mitsubishi terbaru ({$periodeOtr}) di Sun Margahayu Bekasi?",
                    'a' => "Berdasarkan database price list resmi periode {$periodeOtr}, 3 model unggulan kami adalah {$featuredText}. Secara keseluruhan tersedia lini lengkap: {$allPassengerText}.",
                ],
                [
                    'q' => 'Apa nomor rekening resmi PT Sun Star Prima Motor untuk pembayaran SPK, DP, dan servis?',
                    'a' => 'Seluruh transaksi pemesanan kendaraan (SPK), uang muka (DP), pelunasan, servis bengkel, Body & Paint, maupun suku cadang HANYA SAH apabila ditransfer ke rekening Bank BCA 3425419999 atas nama PT Sun Star Prima Motor. Dilarang keras mentransfer dana ke rekening pribadi sales atau oknum manapun.',
                ],
                [
                    'q' => 'Siapa pimpinan cabang dan bagaimana status verifikasi staf resmi di Mitsubishi Sun Margahayu saat ini?',
                    'a' => "{$leadershipText} {$salesListText}",
                ],
                [
                    'q' => 'Apakah Mitsubishi Sun Margahayu menyediakan layanan darurat 24 jam dan asisten Sunny AI?',
                    'a' => "Ya, layanan darurat Service on Road (SOS) di nomor (021) 8834 7777 serta asisten virtual Sunny AI aktif 24 jam penuh setiap hari (dengan rata-rata kecepatan respon chat saat ini ~{$avgResp} detik).",
                ],
            ],
            '/vehicles' => [
                [
                    'q' => "Berapa daftar harga OTR mobil Mitsubishi terbaru ({$periodeOtr}) di Sun Margahayu Bekasi?",
                    'a' => "Daftar harga OTR referensi Bekasi periode {$periodeOtr} di database kami: {$allPassengerText}.",
                ],
                [
                    'q' => 'Berapa tambahan biaya untuk pilihan warna Putih Mutiara atau Two-Tone?',
                    'a' => "Penyesuaian harga warna khusus berdasarkan data price list resmi saat ini: {$colorCostText}",
                ],
                [
                    'q' => 'Apakah pembelian mobil baru Mitsubishi sudah termasuk gratis biaya servis berkala?',
                    'a' => $serviceDynamicAnswer,
                ],
            ],
            '/promo' => [
                [
                    'q' => 'Apa saja program promo Mitsubishi yang sedang aktif di Sun Margahayu saat ini?',
                    'a' => $activePromosAnswer,
                ],
                [
                    'q' => 'Bagaimana rincian promo kredit bunga 0%, DP ringan, dan subsidi tukar tambah (Trade-In)?',
                    'a' => $leasingPromosAnswer,
                ],
                [
                    'q' => 'Apakah tersedia promo diskon servis bengkel dan acara test drive akhir pekan?',
                    'a' => $serviceEventPromosAnswer,
                ],
            ],
            '/booking' => [
                [
                    'q' => 'Berapa harga paket Extended SMART Package terbaru untuk Xpander, Xforce, dan Pajero Sport?',
                    'a' => $smartPackageDynamicAnswer,
                ],
                [
                    'q' => 'Berapa estimasi biaya servis berkala Mitsubishi dari 10.000 KM hingga di atas 50.000 KM?',
                    'a' => $serviceDynamicAnswer,
                ],
                [
                    'q' => 'Bagaimana prosedur booking servis online dan jam batas penerimaan walk-in di bengkel Sun Margahayu?',
                    'a' => 'Pelanggan dapat melakukan booking servis online di halaman Booking Service dengan memasukkan nomor polisi kendaraan, memilih kelipatan kilometer, dan memilih slot jam kedatangan. Bengkel buka Senin s/d Jumat pukul 08:00 - 16:30 WIB dan Sabtu pukul 08:00 - 15:00 WIB, dengan batas penerimaan walk-in tanpa booking pukul 11:00 WIB.',
                ],
            ],
            '/service-on-road' => [
                [
                    'q' => 'Kendala darurat apa saja yang dilayani oleh Mitsubishi Service on Road 24 Jam?',
                    'a' => 'Tim mekanik Service on Road melayani bantuan darurat 24/7 di jalan maupun di rumah wilayah Bekasi dan Jabodetabek untuk kondisi mobil mogok, jumper atau penggantian aki drop, ban kempis, kunci tertinggal, pemeriksaan diagnostik kelistrikan, serta koordinasi mobil derek (towing) resmi.',
                ],
                [
                    'q' => 'Berapa nomor telepon darurat Service on Road Mitsubishi Sun Margahayu?',
                    'a' => 'Hubungi Hotline Darurat SOS 24 Jam di (021) 8834 7777, WhatsApp Layanan Servis di 0822-1092-8822, atau kirim titik koordinat GPS Anda langsung melalui formulir Service on Road di website ini.',
                ],
            ],
            '/facilities' => [
                [
                    'q' => 'Apakah seluruh fasilitas seperti Noach Coffee, Shuttle Service, dan Kids Zone gratis digunakan?',
                    'a' => 'Ya, seluruh fasilitas hospitality meliputi Voucher Noach Coffee, Free Shuttle Service (antar-jemput radius 15 km), Kids Zone Playground, Enjoy Room Bean Bag, Snack Corner, dan WFA Station Wi-Fi 6 dapat dinikmati 100% gratis oleh pelanggan showroom dan bengkel resmi Sun Margahayu.',
                ],
                [
                    'q' => 'Bagaimana cara memesan layanan Free Shuttle Service saat mobil sedang diservis?',
                    'a' => 'Cukup informasikan tujuan antar-jemput Anda kepada Service Advisor saat registrasi servis di bengkel atau tanyakan lebih awal melalui asisten virtual Sunny AI. Pengemudi resmi kami siap mengantar dan menjemput Anda kembali saat mobil selesai diservis.',
                ],
                [
                    'q' => 'Apakah ada program acara showroom atau promo bengkel yang sedang berlangsung saat ini?',
                    'a' => $serviceEventPromosAnswer,
                ],
                [
                    'q' => 'Apakah tersedia fasilitas perbaikan bodi dan cat (Authorized Body & Paint)?',
                    'a' => 'Tersedia fasilitas Authorized Body & Paint berstandar MMKSI lengkap dengan Oven Spray Booth, pencampuran warna terkomputerisasi, suku cadang panel orisinal, serta layanan klaim asuransi maupun perbaikan mandiri.',
                ],
            ],
            '/accessories' => [
                [
                    'q' => 'Apa saja aksesoris resmi Mitsubishi Genuine Accessories (MGA) yang tersedia beserta harganya?',
                    'a' => $accessoriesAnswer,
                ],
                [
                    'q' => 'Berapa harga suku cadang fast-moving asli (Mitsubishi Genuine Parts) di bengkel resmi?',
                    'a' => $sparepartAnswer,
                ],
            ],
            '/sales' => [
                [
                    'q' => 'Siapa saja daftar Sales Consultant resmi yang aktif dan terverifikasi di Mitsubishi Sun Margahayu?',
                    'a' => $salesListText,
                ],
                [
                    'q' => 'Bagaimana cara memverifikasi mantan sales/karyawan yang sudah nonaktif agar terhindar dari penipuan?',
                    'a' => $inactiveText,
                ],
            ],
            '/organization' => [
                [
                    'q' => 'Bagaimana susunan pimpinan cabang dan manajemen aktif PT Sun Star Prima Motor Margahayu saat ini?',
                    'a' => $leadershipText,
                ],
                [
                    'q' => 'Bagaimana kebijakan transparansi terkait perubahan jabatan atau personel yang sudah tidak aktif?',
                    'a' => $inactiveText,
                ],
            ],
            '/news' => [
                [
                    'q' => 'Apa saja artikel berita dan panduan otomotif terbaru dari Mitsubishi Sun Margahayu?',
                    'a' => $articlesAnswer,
                ],
                [
                    'q' => 'Apakah konsumen dapat berdiskusi atau menanyakan isi artikel langsung ke Sunny AI?',
                    'a' => 'Ya, pada setiap halaman artikel tersedia tombol konsultasi langsung dengan Sunny AI serta kolom komentar publik yang dimoderasi oleh tim internal dealer.',
                ],
            ],
            '/contact' => [
                [
                    'q' => 'Berapa nomor WhatsApp resmi untuk divisi Penjualan (Sales), Servis Bengkel, dan Pengaduan CSM?',
                    'a' => 'Saluran WhatsApp resmi terbagi menjadi 3 divisi utama: CS Sales / Penjualan Unit Baru di 0813-1874-7300, Layanan Servis & Booking Bengkel di 0822-1092-8822, serta Customer Satisfaction Manager (CSM) di 0851-8332-5604. Telepon hunting dan darurat 24 jam dapat dihubungi di (021) 8834 7777.',
                ],
                [
                    'q' => 'Siapa pejabat Customer Satisfaction Manager (CSM) yang menangani laporan keluhan pelanggan?',
                    'a' => ($csmName ? "Laporan keluhan pelanggan diaudit dan ditangani langsung oleh {$csmName} " : 'Laporan keluhan pelanggan diaudit langsung oleh Customer Satisfaction Manager (CSM) ')
                        . 'beserta pimpinan cabang PT Sun Star Prima Motor dengan jaminan kerahasiaan data pelapor dan tindak lanjut maksimal 1x24 jam kerja.',
                ],
            ],
        ];

        $allFaqItems = [];
        $seenQ = [];
        foreach ($routesMap as $rKey => $items) {
            foreach ($items as $fItem) {
                if (isset($seenQ[$fItem['q']]))
                    continue;
                $seenQ[$fItem['q']] = true;
                $allFaqItems[] = $fItem;
            }
        }
        $routesMap['/faq'] = $allFaqItems;

        return $routesMap;
    }
}

if (!function_exists('sunnyBuildFaqJsonLdForRoute')) {
    function sunnyBuildFaqJsonLdForRoute(string $pathname, array $faqsByRoute): ?array
    {
        $clean = rtrim($pathname, '/') ?: '/';
        $aliasMap = [
            '/vehicle-list' => '/vehicles',
            '/promo-event' => '/promo',
            '/booking-service' => '/booking',
            '/service-on-the-road' => '/service-on-road',
            '/fasilitas' => '/facilities',
            '/services' => '/facilities',
            '/aksesoris' => '/accessories',
            '/sales-list' => '/sales',
            '/struktur-organisasi' => '/organization',
            '/about' => '/organization',
            '/faqs' => '/faq',
        ];
        $canonicalKey = $aliasMap[$clean] ?? $clean;
        $faqs = $faqsByRoute[$canonicalKey] ?? null;

        if (empty($faqs) || !is_array($faqs)) {
            return null;
        }

        $entities = [];
        foreach ($faqs as $item) {
            if (empty($item['q']) || empty($item['a']))
                continue;
            $entities[] = [
                '@type' => 'Question',
                'name' => $item['q'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $item['a'],
                ],
            ];
        }

        if (empty($entities))
            return null;

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $entities,
        ];
    }
}

if (!function_exists('sunnyGenerateDynamicLlmsMarkdown')) {
    function sunnyGenerateDynamicLlmsMarkdown(array $ctx, string $mode = 'summary', string $baseUrl = 'https://cssunmotor.com'): string
    {
        $baseUrl = rtrim($baseUrl, '/');
        $priceList = $ctx['knowledge']['price_list'] ?? [];
        $periodeOtr = $priceList['meta']['periode'] ?? date('F Y');
        $vehicleSummaries = sunnyExtractVehicleSummaries($priceList);
        $promos = $ctx['promos'] ?? [];
        $activeEmployees = $ctx['active_employees'] ?? [];
        $inactiveEmployees = $ctx['inactive_employees'] ?? [];
        $activeSales = $ctx['active_sales'] ?? [];
        $inactiveSales = $ctx['inactive_sales'] ?? [];
        $articles = $ctx['articles'] ?? [];
        $avgResp = $ctx['avg_response_time'] ?? 1.5;
        $syncTime = date('Y-m-d H:i:s') . ' WIB';

        $lines = [];

        if ($mode === 'summary') {
            $lines[] = '# Mitsubishi Sun Margahayu Bekasi (PT Sun Star Prima Motor)';
            $lines[] = '';
            $lines[] = '> Dealer resmi 3S (Sales, Service, Spare Parts) dan Authorized Body & Paint Mitsubishi Motors & Mitsubishi Fuso di Kota Bekasi, Jawa Barat. Dokumen ini dihasilkan secara dinamis langsung dari database operasional dealer (Sinkronisasi terakhir: ' . $syncTime . ').';
            $lines[] = '';
            $lines[] = '## Entitas Resmi & Lokasi';
            $lines[] = '- **Nama Komersial**: Mitsubishi Sun Margahayu Bekasi';
            $lines[] = '- **Nama Badan Hukum**: PT Sun Star Prima Motor';
            $lines[] = '- **Kode Dealer**: 100711';
            $lines[] = '- **Otorisasi**: Authorized 3S + Body & Paint Dealer Mitsubishi Motors (MMKSI) & Mitsubishi Fuso (KTB)';
            $lines[] = '- **Alamat Lengkap**: Jl. Ir. H. Juanda No. 35 Bulak Kapal, RT.001/RW.001, Aren Jaya, Kec. Bekasi Timur, Kota Bekasi, Jawa Barat 17111';
            $lines[] = '- **Koordinat GPS**: -6.250846761200644, 107.02451547363883';
            $lines[] = '- **Google Maps**: https://maps.app.goo.gl/avtswtfZ9g7sTkcZ6';
            $lines[] = '- **Domain Resmi**: ' . $baseUrl;
            $lines[] = '';
            $lines[] = '## Kebijakan Mutlak Anti-Penipuan & Rekening Bank Resmi';
            $lines[] = '- **Bank Resmi**: BCA (Bank Central Asia)';
            $lines[] = '- **Nomor Rekening**: `3425419999`';
            $lines[] = '- **Atas Nama**: **PT SUN STAR PRIMA MOTOR**';
            $lines[] = '- **Aturan Transaksi**: Seluruh pembayaran SPK, DP, pelunasan unit, servis bengkel, Body & Paint, dan suku cadang HANYA SAH apabila ditransfer ke rekening BCA `3425419999` a.n. PT Sun Star Prima Motor. Dilarang keras mentransfer dana ke rekening pribadi sales atau karyawan manapun.';
            $lines[] = '';
            $lines[] = '## Kontak Resmi & Saluran Bantuan';
            $lines[] = '- **Telepon Hunting & Hotline Darurat SOS 24 Jam**: (021) 8834 7777';
            $lines[] = '- **WhatsApp CS Sales / Penjualan Unit Baru**: 0813-1874-7300 (https://wa.me/6281318747300)';
            $lines[] = '- **WhatsApp Layanan Servis & Booking Bengkel**: 0822-1092-8822 (https://wa.me/6282210928822)';
            $lines[] = '- **WhatsApp Customer Satisfaction Manager (CSM)**: 0851-8332-5604 (https://wa.me/6285183325604)';
            $lines[] = '- **Kecepatan Respon Asisten Virtual Sunny AI (Live Telemetry)**: ~' . $avgResp . ' detik (Siaga 24/7)';
            $lines[] = '';
            $lines[] = '## Lini Kendaraan & Harga OTR Live Database (Periode: ' . $periodeOtr . ')';
            foreach ($vehicleSummaries as $v) {
                $lines[] = '- **' . $v['name'] . '** (' . $v['variant_count'] . ' varian): ' . $v['range_formatted'];
            }
            $lines[] = '';
            if (!empty($promos)) {
                $lines[] = '## Promo & Program Aktif Saat Ini (' . count($promos) . ' Program)';
                foreach ($promos as $p) {
                    $lines[] = '- **' . trim($p['title'] ?? '') . '** [' . trim($p['badge'] ?? $p['category_label'] ?? 'Promo') . ']: ' . trim($p['highlight'] ?? '') . ' (Target: ' . trim($p['target_vehicles'] ?? '-') . ' | Berlaku: ' . trim($p['validity'] ?? '-') . ')';
                }
                $lines[] = '';
            }
            $lines[] = '## Ringkasan Personel Terverifikasi di Database';
            $lines[] = '- **Pejabat & Staf Struktural Aktif**: ' . count($activeEmployees) . ' orang';
            $lines[] = '- **Sales Consultant Resmi Aktif**: ' . count($activeSales) . ' orang';
            $lines[] = '- **Arsip Personel Nonaktif (Direktori Anti-Fraud)**: ' . (count($inactiveEmployees) + count($inactiveSales)) . ' orang';
            $lines[] = '';
            if (!empty($articles)) {
                $lines[] = '## Artikel & Berita Terbaru (' . count($articles) . ' Publikasi)';
                foreach (array_slice($articles, 0, 5) as $art) {
                    $slug = rawurlencode(trim($art['slug'] ?? $art['id'] ?? ''));
                    $lines[] = '- [' . trim($art['title'] ?? 'Artikel') . '](' . $baseUrl . '/news/' . $slug . ') - Kategori: ' . trim($art['category'] ?? 'Umum');
                }
                $lines[] = '';
            }
            $lines[] = '## Peta Navigasi Utama Website';
            $lines[] = '- [Beranda & Ringkasan Layanan](' . $baseUrl . '/)';
            $lines[] = '- [Katalog Kendaraan & Harga OTR](' . $baseUrl . '/vehicles)';
            $lines[] = '- [Promo & Program Penjualan](' . $baseUrl . '/promo)';
            $lines[] = '- [Booking Servis Bengkel Resmi](' . $baseUrl . '/booking)';
            $lines[] = '- [Layanan Darurat Service on Road 24 Jam](' . $baseUrl . '/service-on-road)';
            $lines[] = '- [Fasilitas Showroom & Hospitality](' . $baseUrl . '/facilities)';
            $lines[] = '- [Aksesoris Resmi & Suku Cadang](' . $baseUrl . '/accessories)';
            $lines[] = '- [Direktori Sales Resmi Terverifikasi](' . $baseUrl . '/sales)';
            $lines[] = '- [Struktur Organisasi & Manajemen](' . $baseUrl . '/organization)';
            $lines[] = '- [Berita, Artikel & Edukasi Otomotif](' . $baseUrl . '/news)';
            $lines[] = '- [Pusat Bantuan & FAQ Resmi (Live Database)](' . $baseUrl . '/faq)';
            $lines[] = '- [Pusat Kontak & Lapor Keluhan CSM](' . $baseUrl . '/contact)';
            $lines[] = '- [Dokumentasi Konteks Lengkap AI (llms-full.txt)](' . $baseUrl . '/llms-full.txt)';

            return implode("\n", $lines) . "\n";
        }

        // FULL MODE (llms-full.txt)
        $lines[] = '# Dokumentasi Konteks Lengkap AI (Live Database): Mitsubishi Sun Margahayu Bekasi';
        $lines[] = '';
        $lines[] = '> Dokumen ini (`llms-full.txt`) dihasilkan secara dinamis langsung dari database MySQL PT Sun Star Prima Motor Margahayu Bekasi (Sinkronisasi terakhir: ' . $syncTime . '). Menyajikan data real-time untuk harga OTR per varian, promo aktif, paket servis Extended SMART, estimasi perawatan berkala, katalog aksesoris & suku cadang, struktur manajemen aktif, daftar sales resmi terverifikasi, arsip personel nonaktif (anti-penipuan), artikel terbaru, serta FAQ dinamis.';
        $lines[] = '';
        $lines[] = '---';
        $lines[] = '';
        $lines[] = '## 1. Identitas Hukum, Lokasi & Rekening Resmi (Anti-Fraud)';
        $lines[] = '- **Nama Badan Hukum**: PT Sun Star Prima Motor';
        $lines[] = '- **Nama Cabang**: Mitsubishi Sun Margahayu Bekasi (Kode Cabang: SM-MGH-01)';
        $lines[] = '- **Otorisasi Resmi**: Dealer 3S (Sales, Service, Spare Parts) + Authorized Body & Paint Mitsubishi Motors (MMKSI) & Mitsubishi Fuso (KTB)';
        $lines[] = '- **Alamat**: Jl. Ir. H. Juanda No. 35 Bulak Kapal, RT.001/RW.001, Aren Jaya, Kec. Bekasi Timur, Kota Bekasi, Jawa Barat 17111';
        $lines[] = '- **Koordinat GPS**: -6.250846761200644, 107.02451547363883';
        $lines[] = '- **Google Maps**: https://maps.app.goo.gl/avtswtfZ9g7sTkcZ6';
        $lines[] = '- **Satu-satunya Rekening Bank Sah**: **BCA 3425419999** atas nama **PT SUN STAR PRIMA MOTOR**';
        $lines[] = '- **Peringatan Anti-Penipuan**: Segala transaksi SPK, booking fee, DP, pelunasan unit, pembayaran servis bengkel, Body & Paint, maupun suku cadang HANYA SAH jika ditransfer ke rekening BCA 3425419999 a.n. PT Sun Star Prima Motor. Dilarang mentransfer ke rekening pribadi sales/karyawan.';
        $lines[] = '- **Kontak Resmi**:';
        $lines[] = '  - Telepon Hunting & Darurat SOS 24 Jam: (021) 8834 7777';
        $lines[] = '  - WhatsApp CS Sales / Penjualan: 0813-1874-7300';
        $lines[] = '  - WhatsApp Layanan Servis & Booking: 0822-1092-8822';
        $lines[] = '  - WhatsApp Customer Satisfaction Manager (CSM): 0851-8332-5604';
        $lines[] = '  - Email: info@sunmargahayu.co.id / csm@sunmargahayu.co.id';
        $lines[] = '';
        $lines[] = '---';
        $lines[] = '';
        $lines[] = '## 2. Daftar Lengkap Harga OTR Kendaraan dari Database (Periode: ' . $periodeOtr . ')';
        $lines[] = '';
        $lines[] = '### A. Kendaraan Penumpang & Niaga Ringan (Mitsubishi Motors)';
        foreach ($vehicleSummaries as $v) {
            $lines[] = '#### ' . $v['name'] . ' (' . $v['bodyType'] . ')';
            foreach ($v['items'] as $item) {
                $lines[] = '- ' . ($item['type'] ?? 'Varian') . ': ' . sunnyFormatRupiah($item['price'] ?? 0);
            }
            if (!empty($v['additional_cost'])) {
                $addNotes = [];
                foreach ($v['additional_cost'] as $ck => $cv) {
                    $addNotes[] = ucwords(str_replace('_', ' ', $ck)) . ': +' . sunnyFormatRupiah($cv);
                }
                $lines[] = '- *Biaya Tambahan Opsi/Warna*: ' . implode(', ', $addNotes);
            }
            $lines[] = '';
        }

        $commercial = $priceList['commercial_car'] ?? [];
        if (!empty($commercial)) {
            $lines[] = '### B. Kendaraan Niaga Truk & Bus (Mitsubishi Fuso)';
            foreach ($commercial as $cKey => $cGroup) {
                $cName = 'Mitsubishi Fuso ' . ucwords(str_replace('_', ' ', $cKey));
                $lines[] = '#### ' . $cName;
                $cats = $cGroup['categories'] ?? [];
                foreach ($cats as $catKey => $items) {
                    if (!is_array($items))
                        continue;
                    foreach ($items as $item) {
                        $spec = !empty($item['spec']) ? ' (' . $item['spec'] . ')' : '';
                        $lines[] = '- ' . ($item['type'] ?? 'Varian') . $spec . ': ' . sunnyFormatRupiah($item['price'] ?? 0);
                    }
                }
                $lines[] = '';
            }
        }

        $lines[] = '---';
        $lines[] = '';
        $lines[] = '## 3. Program Promo & Event Aktif dari Database (' . count($promos) . ' Program)';
        if (!empty($promos)) {
            foreach ($promos as $idx => $p) {
                $num = $idx + 1;
                $lines[] = '### ' . $num . '. ' . trim($p['title'] ?? 'Promo');
                $lines[] = '- **Kategori**: ' . trim($p['category_label'] ?? $p['category'] ?? 'Promo') . ' (' . trim($p['badge'] ?? '-') . ')';
                $lines[] = '- **Target Kendaraan**: ' . trim($p['target_vehicles'] ?? '-');
                $lines[] = '- **Masa Berlaku**: ' . trim($p['validity'] ?? '-');
                $lines[] = '- **Sorotan**: ' . trim($p['highlight'] ?? '-');
                if (!empty($p['bullets']) && is_array($p['bullets'])) {
                    $lines[] = '- **Keuntungan Utama**: ' . implode('; ', $p['bullets']);
                }
                if (!empty($p['terms']) && is_array($p['terms'])) {
                    $lines[] = '- **Syarat & Ketentuan**: ' . implode('; ', $p['terms']);
                }
                $lines[] = '';
            }
        } else {
            $lines[] = '- Hubungi CS Sales di 0813-1874-7300 untuk rincian promo berjalan.';
            $lines[] = '';
        }

        $lines[] = '---';
        $lines[] = '';
        $lines[] = '## 4. Paket Extended SMART Package & Estimasi Perawatan Berkala dari Database';
        $extSmart = $ctx['knowledge']['extended_smart']['extended_smart_package'] ?? ($ctx['knowledge']['extended_smart'] ?? []);
        if (!empty($extSmart)) {
            $lines[] = '### A. Extended SMART Package (Termasuk PPN 11%)';
            $xpTiers = $extSmart['xpander_series']['prices_including_vat'] ?? [];
            if (!empty($xpTiers)) {
                $lines[] = '- **Xpander, Xpander Cross & Xforce** (Efektif: ' . ($extSmart['xpander_series']['effective_date'] ?? '-') . '):';
                foreach ($xpTiers as $t) {
                    $lines[] = '  - Paket ' . ($t['type'] ?? '') . ': ' . sunnyFormatRupiah($t['after'] ?? ($t['price'] ?? 0));
                }
            }
            $pjTiers = $extSmart['pajero_sport']['prices_including_vat'] ?? [];
            if (!empty($pjTiers)) {
                $lines[] = '- **Pajero Sport** (Efektif: ' . ($extSmart['pajero_sport']['effective_date'] ?? '-') . '):';
                foreach ($pjTiers as $t) {
                    $lines[] = '  - Paket ' . ($t['type'] ?? '') . ': ' . sunnyFormatRupiah($t['price'] ?? ($t['after'] ?? 0));
                }
            }
            $lines[] = '';
        }

        $srvData = $ctx['knowledge']['service_data'] ?? [];
        if (!empty($srvData['kendaraan'])) {
            $lines[] = '### B. Estimasi Biaya Perawatan Berkala (Grand Total Termasuk PPN 11%)';
            foreach ($srvData['kendaraan'] as $kKey => $kVal) {
                $mName = $kVal['nama_lengkap'] ?? ucwords(str_replace('_', ' ', $kKey));
                $lines[] = '- **' . $mName . '**:';
                $perawatan = $kVal['perawatan'] ?? [];
                foreach ($perawatan as $km => $detail) {
                    $freeTag = !empty($detail['status_free_service']) ? ' [GRATIS Program MMKSI s/d 4 Thn, Referensi: ' . sunnyFormatRupiah($detail['grand_total'] ?? 0) . ']' : ': ' . sunnyFormatRupiah($detail['grand_total'] ?? 0);
                    $lines[] = '  - ' . number_format((int) $km, 0, ',', '.') . ' KM' . $freeTag;
                }
            }
            $lines[] = '';
        }

        $lines[] = '---';
        $lines[] = '';
        $lines[] = '## 5. Katalog Aksesoris Resmi (MGA) & Suku Cadang Fast-Moving dari Database';
        $accData = $ctx['knowledge']['accessories']['mitsubishi_accessories'] ?? ($ctx['knowledge']['accessories'] ?? []);
        if (!empty($accData)) {
            $lines[] = '### A. Aksesoris Resmi (Mitsubishi Genuine Accessories)';
            foreach ($accData as $modelName => $sections) {
                if (!is_array($sections))
                    continue;
                $itemsText = [];
                foreach (['paket_aksesoris', 'exterior', 'interior'] as $secKey) {
                    foreach ($sections[$secKey] ?? [] as $accItem) {
                        if (!empty($accItem['item'])) {
                            $itemsText[] = $accItem['item'] . ' (' . sunnyFormatRupiah($accItem['price'] ?? 0) . ')';
                        }
                    }
                }
                if (!empty($itemsText)) {
                    $lines[] = '- **' . $modelName . '**: ' . implode(', ', array_slice($itemsText, 0, 10));
                }
            }
            $lines[] = '';
        }

        $spareData = $ctx['knowledge']['sparepart']['spare_parts'] ?? [];
        if (!empty($spareData)) {
            $lines[] = '### B. Suku Cadang Fast-Moving (Mitsubishi Genuine Parts - Harga Satuan Sebelum PPN)';
            foreach (array_slice($spareData, 0, 20) as $sp) {
                $usedOn = is_array($sp['digunakan_pada'] ?? null) ? implode('/', $sp['digunakan_pada']) : '-';
                $lines[] = '- `' . ($sp['nomor_part'] ?? '-') . '` ' . ($sp['nama'] ?? 'Part') . ' (' . $usedOn . '): ' . sunnyFormatRupiah($sp['harga_satuan'] ?? 0);
            }
            $lines[] = '';
        }

        $lines[] = '---';
        $lines[] = '';
        $lines[] = '## 6. Struktur Organisasi & Daftar Sales Resmi Terverifikasi dari Database';
        if (!empty($activeEmployees)) {
            $lines[] = '### A. Jajaran Manajemen & Supervisor Aktif (' . count($activeEmployees) . ' Pejabat)';
            foreach ($activeEmployees as $emp) {
                $nikInfo = !empty($emp['nik']) ? ' | NIK: `' . $emp['nik'] . '`' : '';
                $deptInfo = !empty($emp['department']) ? ' | Divisi: ' . $emp['department'] : '';
                $lines[] = '- **' . trim($emp['name']) . '** - ' . trim($emp['role']) . ' (Level: ' . strtoupper($emp['level'] ?? '-') . $deptInfo . $nikInfo . ')';
            }
            $lines[] = '';
        }

        if (!empty($activeSales)) {
            $lines[] = '### B. Daftar Wiraniaga / Sales Consultant Resmi Aktif (' . count($activeSales) . ' Orang)';
            foreach ($activeSales as $s) {
                $spv = !empty($s['supervisor_name']) ? ' | SPV: ' . $s['supervisor_name'] : '';
                $spec = !empty($s['specialization']) ? ' | Spesialisasi: ' . $s['specialization'] : '';
                $nik = !empty($s['nik']) ? ' | NIK: `' . $s['nik'] . '`' : '';
                $lines[] = '- **' . trim($s['name']) . '** (' . trim($s['position'] ?? 'Sales Consultant') . $spv . $spec . $nik . ')';
            }
            $lines[] = '';
        }

        if (!empty($inactiveEmployees) || !empty($inactiveSales)) {
            $lines[] = '### C. Direktori Personel Nonaktif / Resign (Peringatan Anti-Penipuan)';
            $lines[] = 'Nama-nama berikut tercatat berstatus **NONAKTIF** di database kami dan tidak lagi memiliki wewenang mewakili PT Sun Star Prima Motor:';
            foreach ($inactiveEmployees as $ie) {
                $lines[] = '- ' . trim($ie['name']) . ' (Eks ' . trim($ie['role']) . ') - Status: Nonaktif';
            }
            foreach ($inactiveSales as $is) {
                $lines[] = '- ' . trim($is['name']) . ' (Eks ' . trim($is['position'] ?? 'Sales') . ') - Status: Nonaktif';
            }
            $lines[] = '';
        }

        if (!empty($articles)) {
            $lines[] = '---';
            $lines[] = '';
            $lines[] = '## 7. Daftar Publikasi & Artikel Edukasi Resmi dari Database';
            foreach ($articles as $art) {
                $slug = rawurlencode(trim($art['slug'] ?? $art['id'] ?? ''));
                $lines[] = '- **[' . trim($art['title'] ?? 'Artikel') . '](' . $baseUrl . '/news/' . $slug . ')** (' . trim($art['category'] ?? 'Berita') . '): ' . trim($art['summary'] ?? '');
            }
            $lines[] = '';
        }

        $lines[] = '---';
        $lines[] = '';
        $lines[] = '## 8. Daftar Pertanyaan Umum (FAQPage) Dinamis';
        $faqsByRoute = sunnyBuildDynamicFaqsByRoute($ctx);
        $seenQuestions = [];
        foreach ($faqsByRoute as $routeKey => $faqItems) {
            foreach ($faqItems as $f) {
                if (isset($seenQuestions[$f['q']]))
                    continue;
                $seenQuestions[$f['q']] = true;
                $lines[] = '### Q: ' . $f['q'];
                $lines[] = 'A: ' . $f['a'];
                $lines[] = '';
            }
        }

        return implode("\n", $lines) . "\n";
    }
}

if (!function_exists('sunnySyncPhysicalLlmsFiles')) {
    function sunnySyncPhysicalLlmsFiles(array $ctx, string $baseUrl = 'https://cssunmotor.com', bool $force = false): void
    {
        $llmsSummaryPath = __DIR__ . '/llms.txt';
        $llmsFullPath = __DIR__ . '/llms-full.txt';

        $shouldSync = $force
            || !file_exists($llmsSummaryPath)
            || !file_exists($llmsFullPath)
            || (time() - (int) @filemtime($llmsSummaryPath)) > 120;

        if (!$shouldSync) {
            return;
        }

        if (is_writable(__DIR__) || (file_exists($llmsSummaryPath) && is_writable($llmsSummaryPath))) {
            @file_put_contents($llmsSummaryPath, sunnyGenerateDynamicLlmsMarkdown($ctx, 'summary', $baseUrl));
            @file_put_contents($llmsFullPath, sunnyGenerateDynamicLlmsMarkdown($ctx, 'full', $baseUrl));
        }
    }
}
