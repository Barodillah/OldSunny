<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Sales;
use App\Models\Promo;
use App\Models\Article;

class SearchController extends Controller
{
    /**
     * Public Universal Search Endpoint
     * Searches:
     * 1. Public Pages
     * 2. Kendaraan (Vehicles & Price List)
     * 3. Employee (Struktur & Pejabat)
     * 4. Sales (Wiraniaga Resmi)
     * 5. Promo & Event
     * 6. Aksesoris Resmi
     * 7. Sparepart Resmi
     */
    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));
        $category = trim($request->query('category', 'all'));

        if (mb_strlen($q) < 3) {
            return response()->json([
                'success' => true,
                'query' => $q,
                'total' => 0,
                'counts' => [
                    'all' => 0,
                    'page' => 0,
                    'vehicle' => 0,
                    'sales' => 0,
                    'employee' => 0,
                    'article' => 0,
                    'promo' => 0,
                    'accessory' => 0,
                    'sparepart' => 0,
                ],
                'results' => []
            ]);
        }

        $kw = mb_strtolower($q);

        $pageResults = $this->searchPages($kw);
        $vehicleResults = $this->searchVehicles($kw);
        $employeeResults = $this->searchEmployees($kw);
        $salesResults = $this->searchSales($kw);
        $promoResults = $this->searchPromos($kw);
        $articleResults = $this->searchArticles($kw);
        $accessoryResults = $this->searchAccessories($kw);
        $sparepartResults = $this->searchSpareparts($kw);

        $counts = [
            'all' => count($pageResults) + count($vehicleResults) + count($employeeResults) +
                     count($salesResults) + count($promoResults) + count($articleResults) +
                     count($accessoryResults) + count($sparepartResults),
            'page' => count($pageResults),
            'vehicle' => count($vehicleResults),
            'sales' => count($salesResults),
            'employee' => count($employeeResults),
            'promo' => count($promoResults),
            'article' => count($articleResults),
            'accessory' => count($accessoryResults),
            'sparepart' => count($sparepartResults),
        ];

        $allResults = [];
        if ($category === 'all' || $category === 'page') $allResults = array_merge($allResults, $pageResults);
        if ($category === 'all' || $category === 'vehicle') $allResults = array_merge($allResults, $vehicleResults);
        if ($category === 'all' || $category === 'sales') $allResults = array_merge($allResults, $salesResults);
        if ($category === 'all' || $category === 'employee') $allResults = array_merge($allResults, $employeeResults);
        if ($category === 'all' || $category === 'promo') $allResults = array_merge($allResults, $promoResults);
        if ($category === 'all' || $category === 'article') $allResults = array_merge($allResults, $articleResults);
        if ($category === 'all' || $category === 'accessory') $allResults = array_merge($allResults, $accessoryResults);
        if ($category === 'all' || $category === 'sparepart') $allResults = array_merge($allResults, $sparepartResults);

        return response()->json([
            'success' => true,
            'query' => $q,
            'category' => $category,
            'total' => count($allResults),
            'counts' => $counts,
            'results' => $allResults
        ]);
    }

    /**
     * 1. Public Pages
     */
    private function searchPages(string $kw): array
    {
        $pages = [
            [
                'id' => 'page-home',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Beranda Showroom',
                'subtitle' => 'Halaman utama dealer resmi Mitsubishi Margahayu Bekasi Timur',
                'badge' => 'Halaman',
                'link' => '/',
                'keywords' => ['beranda', 'home', 'utama', 'showroom', 'dealer', 'margahayu', 'bekasi', 'mitsubishi', 'mobil']
            ],
            [
                'id' => 'page-booking',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Booking Servis Bengkel',
                'subtitle' => 'Jadwalkan servis berkala, perbaikan kendaraan, dan perawatan resmi tanpa antre',
                'badge' => 'Halaman',
                'link' => '/booking',
                'keywords' => ['booking', 'servis', 'service', 'bengkel', 'jadwal', 'perawatan', 'stall', 'antre', 'reservasi', 'montir']
            ],
            [
                'id' => 'page-service-on-road',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Service on Road 24 Jam',
                'subtitle' => 'Layanan bantuan darurat derek, aki mogok, ban kempes, dan teknisi kilat di jalan 24 jam',
                'badge' => 'Halaman',
                'link' => '/service-on-road',
                'keywords' => ['service on road', 'sor', 'darurat', 'mogok', 'emergency', 'bantuan', 'derek', 'aki', 'ban bocor', '24 jam']
            ],
            [
                'id' => 'page-facilities',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Fasilitas & Layanan Bengkel',
                'subtitle' => 'Fasilitas bengkel resmi 3S, perbaikan body & paint modern, ruang tunggu VIP, dan suku cadang',
                'badge' => 'Halaman',
                'link' => '/facilities',
                'keywords' => ['fasilitas', 'facilities', 'bengkel', 'body paint', 'bodi', 'cat', 'ruang tunggu', 'layanan', 'bodi dan cat']
            ],
            [
                'id' => 'page-vehicles',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Daftar Kendaraan & Price List',
                'subtitle' => 'Katalog lengkap unit mobil Mitsubishi, tipe, spesifikasi, dan daftar harga OTR terbaru',
                'badge' => 'Halaman',
                'link' => '/vehicles',
                'keywords' => ['kendaraan', 'mobil', 'vehicles', 'price list', 'harga', 'otr', 'katalog', 'unit', 'spesifikasi', 'tipe', 'pajerosport', 'xpander', 'xforce', 'triton', 'l300']
            ],
            [
                'id' => 'page-promo',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Promo & Event Spesial',
                'subtitle' => 'Program promo diskon DP ringan, bunga kredit 0%, dan event showroom dealer bulan ini',
                'badge' => 'Halaman',
                'link' => '/promo',
                'keywords' => ['promo', 'diskon', 'event', 'bunga', 'dp murah', 'cashback', 'penawaran', 'program']
            ],
            [
                'id' => 'page-sales',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Tim Sales & Wiraniaga Resmi',
                'subtitle' => 'Daftar profil sales consultant bersertifikasi untuk konsultasi unit, kredit, dan test drive',
                'badge' => 'Halaman',
                'link' => '/sales',
                'keywords' => ['sales', 'wiraniaga', 'konsultan', 'marketing', 'salesman', 'rekomendasi', 'tim penjualan']
            ],
            [
                'id' => 'page-organization',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Struktur Organisasi & Profil Dealer',
                'subtitle' => 'Susunan pimpinan cabang, divisi manajemen, dan profil PT Sun Star Prima Motor Margahayu',
                'badge' => 'Halaman',
                'link' => '/organization',
                'keywords' => ['organisasi', 'struktur', 'profil', 'about', 'tentang', 'manajemen', 'direksi', 'sejarah', 'pejabat', 'karyawan']
            ],
            [
                'id' => 'page-accessories',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Aksesoris Resmi Mitsubishi',
                'subtitle' => 'Katalog genuine accessories resmi eksterior & interior bergaransi dengan harga terjangkau',
                'badge' => 'Halaman',
                'link' => '/accessories',
                'keywords' => ['aksesoris', 'accessories', 'variasi', 'genuine', 'eksterior', 'interior', 'katalog', 'paket variasi']
            ],
            [
                'id' => 'page-news',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Berita & Edukasi Otomotif',
                'subtitle' => 'Tips berkendara, informasi teknologi Mitsubishi Motors, dan update rilis otomotif terkini',
                'badge' => 'Halaman',
                'link' => '/news',
                'keywords' => ['berita', 'artikel', 'news', 'tips', 'informasi', 'edukasi', 'bacaan']
            ],
            [
                'id' => 'page-contact',
                'type' => 'page',
                'category_name' => 'Halaman Public',
                'title' => 'Kontak & Alamat Showroom',
                'subtitle' => 'Lokasi showroom Jl. Ir. H. Juanda No. 35, nomor telepon hotline 24 Jam & WhatsApp resmi',
                'badge' => 'Halaman',
                'link' => '/contact',
                'keywords' => ['kontak', 'contact', 'lokasi', 'alamat', 'telepon', 'whatsapp', 'maps', 'juanda', 'bekasi timur']
            ]
        ];

        $matched = [];
        foreach ($pages as $p) {
            $haystack = mb_strtolower($p['title'] . ' ' . $p['subtitle'] . ' ' . implode(' ', $p['keywords']));
            if (str_contains($haystack, $kw)) {
                $matched[] = [
                    'id' => $p['id'],
                    'type' => 'page',
                    'category_name' => 'Halaman Public',
                    'title' => $p['title'],
                    'subtitle' => $p['subtitle'],
                    'badge' => $p['badge'],
                    'badge_color' => '#475569',
                    'badge_bg' => '#f1f5f9',
                    'link' => $p['link'],
                    'image' => null,
                ];
            }
        }
        return $matched;
    }

    /**
     * 2. Kendaraan (Vehicles & Price List)
     */
    private function searchVehicles(string $kw): array
    {
        $file = base_path('../knowledge/price_list.json');
        if (!file_exists($file)) $file = base_path('../vehicle-list.json');
        if (!file_exists($file)) return [];

        $data = json_decode(file_get_contents($file), true) ?: [];
        $results = [];

        // Categories: passenger_car, commercial_car
        $categories = ['passenger_car', 'commercial_car'];
        foreach ($categories as $catKey) {
            if (empty($data[$catKey]) || !is_array($data[$catKey])) continue;

            foreach ($data[$catKey] as $modelKey => $modelData) {
                $modelName = ucwords(str_replace('_', ' ', $modelKey));
                $image = $modelData['image'] ?? null;
                $catLabel = $catKey === 'passenger_car' ? 'Kendaraan Penumpang' : 'Kendaraan Niaga';

                $modelMatch = str_contains(mb_strtolower($modelName), $kw);

                // Variant items
                $variants = $modelData['items'] ?? [];
                $matchedVariants = [];

                foreach ($variants as $v) {
                    $typeName = $v['type'] ?? '';
                    $spec = $v['spec'] ?? '';
                    $haystack = mb_strtolower("{$modelName} {$typeName} {$spec}");
                    if ($modelMatch || str_contains($haystack, $kw)) {
                        $matchedVariants[] = $v;
                    }
                }

                if ($modelMatch || !empty($matchedVariants)) {
                    $lowestPrice = null;
                    if (!empty($matchedVariants)) {
                        $prices = array_column($matchedVariants, 'price');
                        $lowestPrice = min($prices);
                    } elseif (!empty($variants)) {
                        $prices = array_column($variants, 'price');
                        $lowestPrice = min($prices);
                    }

                    $priceText = $lowestPrice ? 'Mulai Rp ' . number_format($lowestPrice, 0, ',', '.') : 'Harga On The Road';

                    $results[] = [
                        'id' => "veh-{$modelKey}",
                        'type' => 'vehicle',
                        'category_name' => 'Kendaraan',
                        'title' => "Mitsubishi {$modelName}",
                        'subtitle' => "{$priceText} • {$catLabel}",
                        'badge' => 'Mobil',
                        'badge_color' => '#dc2626',
                        'badge_bg' => '#fef2f2',
                        'link' => '/vehicles',
                        'image' => $image,
                        'price' => $lowestPrice
                    ];
                }
            }
        }

        return $results;
    }

    /**
     * 3. Employee (Struktur & Pejabat)
     */
    private function searchEmployees(string $kw): array
    {
        $employees = Employee::where('status', 'active')
            ->where(function ($q) use ($kw) {
                $q->where('name', 'like', "%{$kw}%")
                  ->orWhere('role', 'like', "%{$kw}%")
                  ->orWhere('department', 'like', "%{$kw}%")
                  ->orWhere('nik', 'like', "%{$kw}%");
            })
            ->take(15)
            ->get();

        $results = [];
        foreach ($employees as $emp) {
            $results[] = [
                'id' => "emp-{$emp->id}",
                'type' => 'employee',
                'category_name' => 'Karyawan',
                'title' => $emp->name,
                'subtitle' => $emp->role . ($emp->department ? " • {$emp->department}" : ''),
                'badge' => 'Karyawan',
                'badge_color' => '#7c3aed',
                'badge_bg' => '#f5f3ff',
                'link' => '/organization',
                'image' => $emp->photo_url,
                'nik' => $emp->nik
            ];
        }
        return $results;
    }

    /**
     * 4. Sales (Wiraniaga Resmi)
     */
    private function searchSales(string $kw): array
    {
        $sales = Sales::with('supervisor')
            ->where('status', 'active')
            ->where(function ($q) use ($kw) {
                $q->where('name', 'like', "%{$kw}%")
                  ->orWhere('position', 'like', "%{$kw}%")
                  ->orWhere('specialization', 'like', "%{$kw}%")
                  ->orWhere('phone', 'like', "%{$kw}%");
            })
            ->take(15)
            ->get();

        $results = [];
        foreach ($sales as $s) {
            $results[] = [
                'id' => "sales-{$s->id}",
                'type' => 'sales',
                'category_name' => 'Sales',
                'title' => $s->name,
                'subtitle' => $s->position . ($s->specialization ? " • {$s->specialization}" : ''),
                'badge' => 'Sales',
                'badge_color' => '#059669',
                'badge_bg' => '#ecfdf5',
                'link' => '/sales',
                'image' => $s->photo_url,
                'phone' => $s->phone
            ];
        }
        return $results;
    }

    /**
     * 5. Promo & Event
     */
    private function searchPromos(string $kw): array
    {
        $promos = Promo::where('is_active', true)
            ->where(function ($q) use ($kw) {
                $q->where('title', 'like', "%{$kw}%")
                  ->orWhere('highlight', 'like', "%{$kw}%")
                  ->orWhere('category_label', 'like', "%{$kw}%")
                  ->orWhere('target_vehicles', 'like', "%{$kw}%");
            })
            ->take(10)
            ->get();

        $results = [];
        foreach ($promos as $p) {
            $results[] = [
                'id' => "promo-{$p->id}",
                'type' => 'promo',
                'category_name' => 'Promo',
                'title' => $p->title,
                'subtitle' => $p->highlight ?: ($p->category_label ?? 'Program Promo Dealer'),
                'badge' => 'Promo',
                'badge_color' => '#d97706',
                'badge_bg' => '#fffbeb',
                'link' => '/promo',
                'image' => null
            ];
        }

        // Fallback check in promo_event.json if empty or to augment
        if (count($results) < 5) {
            $file = base_path('../promo_event.json');
            if (file_exists($file)) {
                $jsonData = json_decode(file_get_contents($file), true) ?: [];
                $list = $jsonData['promos'] ?? [];
                foreach ($list as $idx => $item) {
                    $haystack = mb_strtolower(($item['title'] ?? '') . ' ' . ($item['highlight'] ?? '') . ' ' . ($item['category_label'] ?? ''));
                    if (str_contains($haystack, $kw)) {
                        $results[] = [
                            'id' => "promo-json-{$idx}",
                            'type' => 'promo',
                            'category_name' => 'Promo',
                            'title' => $item['title'],
                            'subtitle' => $item['highlight'] ?? ($item['category_label'] ?? 'Promo Showroom'),
                            'badge' => 'Promo',
                            'badge_color' => '#d97706',
                            'badge_bg' => '#fffbeb',
                            'link' => '/promo',
                            'image' => null
                        ];
                    }
                }
            }
        }

        return $results;
    }

    /**
     * 6. Aksesoris Resmi
     */
    private function searchAccessories(string $kw): array
    {
        $file = base_path('../knowledge/aksesoris.json');
        if (!file_exists($file)) $file = base_path('../aksesoris.json');
        if (!file_exists($file)) return [];

        $data = json_decode(file_get_contents($file), true) ?: [];
        $accessories = $data['mitsubishi_accessories'] ?? [];
        $results = [];

        foreach ($accessories as $modelName => $categories) {
            $cleanModel = str_replace('_', ' ', $modelName);
            if (!is_array($categories)) continue;

            foreach ($categories as $catKey => $items) {
                if (!is_array($items)) continue;

                foreach ($items as $idx => $item) {
                    $itemName = $item['item'] ?? ($item['nama'] ?? '');
                    $price = $item['price'] ?? ($item['harga'] ?? 0);
                    $img = $item['img'] ?? ($item['gambar'] ?? null);

                    $haystack = mb_strtolower("{$itemName} {$cleanModel} {$catKey}");
                    if (str_contains($haystack, $kw)) {
                        $priceFormatted = $price > 0 ? 'Rp ' . number_format($price, 0, ',', '.') : 'Hubungi Dealer';
                        $results[] = [
                            'id' => "acc-{$cleanModel}-{$idx}",
                            'type' => 'accessory',
                            'category_name' => 'Aksesoris',
                            'title' => $itemName,
                            'subtitle' => "Model {$cleanModel} • {$priceFormatted}",
                            'badge' => 'Aksesoris',
                            'badge_color' => '#0284c7',
                            'badge_bg' => '#f0f9ff',
                            'link' => '/accessories',
                            'image' => $img,
                            'price' => $price
                        ];
                    }
                }
            }
        }

        return array_slice($results, 0, 20);
    }

    /**
     * 7. Sparepart Resmi
     */
    private function searchSpareparts(string $kw): array
    {
        $file = base_path('../knowledge/sparepart.json');
        if (!file_exists($file)) return [];

        $data = json_decode(file_get_contents($file), true) ?: [];
        $parts = $data['spare_parts'] ?? [];
        $results = [];

        foreach ($parts as $idx => $part) {
            $nama = $part['nama'] ?? '';
            $partNo = $part['nomor_part'] ?? '';
            $kategori = $part['kategori'] ?? '';
            $usedOn = is_array($part['digunakan_pada'] ?? null) ? implode(' ', $part['digunakan_pada']) : '';
            $price = $part['harga_satuan'] ?? 0;

            $haystack = mb_strtolower("{$nama} {$partNo} {$kategori} {$usedOn} sparepart spare part");
            if (str_contains($haystack, $kw)) {
                $priceFormatted = $price > 0 ? 'Rp ' . number_format($price, 0, ',', '.') : 'Harga Dealer';
                $results[] = [
                    'id' => "sp-{$idx}",
                    'type' => 'sparepart',
                    'category_name' => 'Sparepart',
                    'title' => $nama,
                    'subtitle' => "No. Part: {$partNo} • {$priceFormatted}",
                    'badge' => 'Sparepart',
                    'badge_color' => '#0d9488',
                    'badge_bg' => '#f0fdfa',
                    'link' => '/facilities',
                    'image' => null,
                    'price' => $price,
                    'part_number' => $partNo
                ];
            }
        }

        return array_slice($results, 0, 20);
    }
    /**
     * 8. Berita & Artikel Edukasi
     */
    private function searchArticles(string $kw): array
    {
        $articles = Article::where('status', 'published')
            ->where(function ($q) use ($kw) {
                $q->where('title', 'like', "%{$kw}%")
                  ->orWhere('summary', 'like', "%{$kw}%")
                  ->orWhere('category', 'like', "%{$kw}%")
                  ->orWhere('author', 'like', "%{$kw}%")
                  ->orWhere('full_content', 'like', "%{$kw}%")
                  ->orWhere('slug', 'like', "%{$kw}%");
            })
            ->orderBy('date', 'desc')
            ->take(15)
            ->get();

        $results = [];
        foreach ($articles as $art) {
            $results[] = [
                'id' => "art-{$art->id}",
                'type' => 'article',
                'category_name' => 'Berita & Artikel',
                'title' => $art->title,
                'subtitle' => $art->summary ? mb_strimwidth($art->summary, 0, 120, '...') : "{$art->category} • {$art->date}",
                'badge' => $art->category ?: 'Artikel',
                'badge_color' => '#2563eb',
                'badge_bg' => '#eff6ff',
                'link' => "/news/{$art->slug}",
                'image' => $art->image_url,
                'date' => $art->date,
                'slug' => $art->slug
            ];
        }

        return $results;
    }
}
