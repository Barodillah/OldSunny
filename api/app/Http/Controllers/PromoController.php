<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Promo;
use App\Models\KnowledgeItem;
use Illuminate\Support\Str;

class PromoController extends Controller
{
    /**
     * Default Initial Seed Items (matching Mitsubishi Margahayu Promos & Events)
     */
    protected function getDefaultPromoItems(): array
    {
        return [
            [
                'slug' => 'bunga-0-xforce-xpander',
                'title' => 'Program Bunga 0% Tenor hingga 2 Tahun',
                'category' => 'leasing',
                'category_label' => 'Leasing',
                'badge' => 'BUNGA 0%',
                'badge_theme' => 'red',
                'target_vehicles' => 'New XFORCE, New Xpander, New Xpander Cross',
                'validity' => 'Berlaku s/d Akhir Bulan Ini',
                'highlight' => 'Angsuran bebas bunga hingga 24 bulan resmi pembiayaan Dipo Star Finance.',
                'bullets' => [
                    'Bunga 0% dengan pilihan tenor 1 hingga 2 tahun',
                    'Gratis asuransi All-Risk komprehensif selama 1 tahun',
                    'Bebas biaya provisi dan administrasi kredit resmi'
                ],
                'terms' => [
                    'Berlaku khusus untuk aplikasi kredit via Dipo Star Finance',
                    'Uang muka (DP) minimal mengikuti ketentuan paket reguler',
                    'Promo dapat digabungkan dengan program gratis servis berkala hingga 50.000 KM'
                ],
                'action_link' => '',
                'action_link_active' => false,
                'action_button_label' => 'Klaim Promo',
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'slug' => 'dp-ringan-xpander',
                'title' => 'Paket DP Ringan Mulai Rp 15 Jutaan',
                'category' => 'leasing',
                'category_label' => 'Leasing',
                'badge' => 'DP RINGAN',
                'badge_theme' => 'dark',
                'target_vehicles' => 'New Xpander & New Xpander Cross',
                'validity' => 'Kuota Terbatas 25 Unit',
                'highlight' => 'Bawa pulang MPV keluarga idaman dengan uang muka terjangkau dan cicilan fleksibel.',
                'bullets' => [
                    'Uang muka (DP) super ringan mulai Rp 15 jutaan',
                    'Pilihan tenor fleksibel panjang hingga 6 tahun',
                    'Proses persetujuan (approval) cepat 1x24 jam kerja'
                ],
                'terms' => [
                    'Kelengkapan berkas data nasabah lengkap dan valid',
                    'Berlaku untuk seluruh varian New Xpander dan Xpander Cross',
                    'Unit siap kirim (ready stock) selama kuota alokasi tersedia'
                ],
                'action_link' => '',
                'action_link_active' => false,
                'action_button_label' => 'Klaim Promo',
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'slug' => 'subsidi-trade-in',
                'title' => 'Subsidi Tukar Tambah (Trade-In) s/d Rp 10 Juta',
                'category' => 'leasing',
                'category_label' => 'Leasing',
                'badge' => 'SUBSIDI TRADE-IN',
                'badge_theme' => 'red',
                'target_vehicles' => 'Semua Lini Mitsubishi Baru',
                'validity' => 'Berlaku Setiap Hari',
                'highlight' => 'Tukar mobil lama segala merk dengan harga appraisal pasar tertinggi plus subsidi langsung.',
                'bullets' => [
                    'Tambahan subsidi cashback langsung hingga Rp 10.000.000',
                    'Appraisal transparan di tempat oleh tim spesialis tersertifikasi',
                    'Proses tukar tambah cepat, mobil lama langsung jadi pengurang DP unit baru'
                ],
                'terms' => [
                    'Mobil lama bebas dari indikasi bekas tabrakan berat atau banjir',
                    'Dokumen kendaraan lama (STNK, BPKB, faktur) lengkap dan sah',
                    'Berlaku untuk upgrade ke unit Xpander, Xpander Cross, XFORCE, atau Pajero Sport'
                ],
                'action_link' => '',
                'action_link_active' => false,
                'action_button_label' => 'Klaim Promo',
                'is_active' => true,
                'sort_order' => 3
            ],
            [
                'slug' => 'special-rate-pajero',
                'title' => 'Special Rate & Paket Mewah New Pajero Sport',
                'category' => 'leasing',
                'category_label' => 'Leasing',
                'badge' => 'SPECIAL RATE',
                'badge_theme' => 'red',
                'target_vehicles' => 'New Pajero Sport Dakar & Exceed',
                'validity' => 'Berlaku s/d Akhir Bulan Ini',
                'highlight' => 'Bunga rendah kompetitif mulai 2.5% dan paket bonus proteksi ekstra untuk SUV legendaris.',
                'bullets' => [
                    'Bunga ringan kompetitif mulai 2.5% p.a. tenor 1 tahun',
                    'Gratis paket Smart Package servis berkala & suku cadang hingga 50.000 KM / 4 tahun',
                    'Bonus kaca film V-Kool kelas VIP dan karpet bludru eksklusif'
                ],
                'terms' => [
                    'Paket leasing resmi rekanan Sun Star Prima Motor',
                    'Berlaku untuk Pajero Sport Dakar 4x2, Dakar Ultimate, dan Exceed',
                    'Garansi mesin resmi APM tetap berlaku 3 tahun / 100.000 KM'
                ],
                'action_link' => '',
                'action_link_active' => false,
                'action_button_label' => 'Klaim Promo',
                'is_active' => true,
                'sort_order' => 4
            ],
            [
                'slug' => 'showroom-event-gathering',
                'title' => 'Showroom Weekend Gathering & Test Drive Berhadiah',
                'category' => 'event',
                'category_label' => 'Event Showroom',
                'badge' => 'EVENT DEALER',
                'badge_theme' => 'dark',
                'target_vehicles' => 'Terbuka untuk Seluruh Keluarga & Komunitas',
                'validity' => 'Setiap Sabtu & Minggu (09.00 - 16.00 WIB)',
                'highlight' => 'Rasakan impresi berkendara New XFORCE & Xpander sambil menikmati hospitalitas dealer.',
                'bullets' => [
                    'Free flow Noah Coffee espresso bar & snack playground anak 100% gratis',
                    'Hadiah langsung lucky dip merchandise eksklusif bagi setiap peserta test drive',
                    'Hadiah doorprize alat elektronik rumah tangga bagi SPK yang diterbitkan di lokasi event'
                ],
                'terms' => [
                    'Lokasi acara: Showroom Mitsubishi Sun Star Prima Motor Margahayu (Jl. Ir. H. Juanda No. 35)',
                    'Peserta test drive wajib membawa SIM A aktif yang masih berlaku',
                    'Keluarga dan anak-anak dapat menikmati arena playground Kids Zone'
                ],
                'action_link' => '',
                'action_link_active' => false,
                'action_button_label' => 'Daftar Event Sekarang',
                'is_active' => true,
                'sort_order' => 5
            ],
            [
                'slug' => 'servis-oli-diskon',
                'title' => 'Promo Servis Berkala & Diskon Sparepart 15%',
                'category' => 'service',
                'category_label' => 'After Sales',
                'badge' => 'AFTER SALES',
                'badge_theme' => 'red',
                'target_vehicles' => 'Seluruh Kendaraan Penumpang & Komersial Mitsubishi',
                'validity' => 'Senin s/d Jumat (Booking H-1)',
                'highlight' => 'Perawatan berkala di bengkel resmi terpercaya dengan teknisi profesional bersertifikat.',
                'bullets' => [
                    'Diskon jasa servis berkala 10% dan genuine parts 15%',
                    'Gratis general check up menyeluruh pada 15 titik vital kendaraan',
                    'Gratis 1 liter oli mesin resmi Mitsubishi Motors Genuine Oil (MMGO)'
                ],
                'terms' => [
                    'Wajib melakukan booking servis minimal 1 hari sebelumnya (H-1)',
                    'Berlaku di bengkel resmi Sun Star Prima Motor Margahayu',
                    'Dapat digabungkan dengan fasilitas antar jemput shuttle service'
                ],
                'action_link' => '',
                'action_link_active' => false,
                'action_button_label' => 'Klaim Promo Servis',
                'is_active' => true,
                'sort_order' => 6
            ]
        ];
    }

    /**
     * Auto-seed default promo items if table is empty
     */
    protected function ensureSeeded(): void
    {
        if (Promo::count() === 0) {
            foreach ($this->getDefaultPromoItems() as $item) {
                Promo::create($item);
            }
            $this->syncToKnowledgeItemAndFile();
        }
    }

    /**
     * Get public promo list (for public website Promo.jsx)
     */
    public function index(Request $request)
    {
        $this->ensureSeeded();

        $query = Promo::query();

        // If not portal, only show active items
        if (!$request->boolean('all')) {
            $query->where('is_active', true);
        }

        if ($category = $request->input('category')) {
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }

        $promos = $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'total' => $promos->count(),
            'data' => $promos
        ]);
    }

    /**
     * Get portal promos with stats and knowledge metadata
     */
    public function portalIndex(Request $request)
    {
        $this->ensureSeeded();

        $promos = Promo::orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();

        $stats = [
            'total' => $promos->count(),
            'active' => $promos->where('is_active', true)->count(),
            'leasing' => $promos->where('category', 'leasing')->count(),
            'event' => $promos->where('category', 'event')->count(),
            'service' => $promos->where('category', 'service')->count(),
            'with_action_link' => $promos->where('action_link_active', true)->count(),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'data' => $promos,
            'last_updated' => Promo::max('updated_at') ?? now()->toISOString()
        ]);
    }

    /**
     * Create new Promo / Event
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:191',
            'category' => 'required|string|in:leasing,event,service',
            'category_label' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:60',
            'badge_theme' => 'nullable|string|max:30',
            'target_vehicles' => 'nullable|string|max:191',
            'validity' => 'nullable|string|max:191',
            'highlight' => 'nullable|string',
            'bullets' => 'nullable|array',
            'terms' => 'nullable|array',
            'action_link' => 'nullable|string',
            'action_link_active' => 'nullable|boolean',
            'action_button_label' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean'
        ]);

        $slugBase = Str::slug($validated['title']);
        $slug = $slugBase;
        $counter = 1;
        while (Promo::where('slug', $slug)->exists()) {
            $slug = "{$slugBase}-{$counter}";
            $counter++;
        }

        $validated['slug'] = $slug;
        $validated['sort_order'] = (Promo::max('sort_order') ?? 0) + 1;
        $validated['updated_by'] = $request->input('updated_by', 'Admin Portal Margahayu');

        // Defaults for category_label
        if (empty($validated['category_label'])) {
            $validated['category_label'] = match ($validated['category']) {
                'event' => 'Event Showroom',
                'service' => 'After Sales',
                default => 'Leasing'
            };
        }

        $promo = Promo::create($validated);
        $this->syncToKnowledgeItemAndFile();

        return response()->json([
            'success' => true,
            'message' => 'Promo & Event baru berhasil ditambahkan.',
            'data' => $promo
        ], 201);
    }

    /**
     * Update Promo / Event
     */
    public function update(Request $request, $id)
    {
        $promo = Promo::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:191',
            'category' => 'required|string|in:leasing,event,service',
            'category_label' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:60',
            'badge_theme' => 'nullable|string|max:30',
            'target_vehicles' => 'nullable|string|max:191',
            'validity' => 'nullable|string|max:191',
            'highlight' => 'nullable|string',
            'bullets' => 'nullable|array',
            'terms' => 'nullable|array',
            'action_link' => 'nullable|string',
            'action_link_active' => 'nullable|boolean',
            'action_button_label' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean'
        ]);

        $validated['updated_by'] = $request->input('updated_by', 'Admin Portal Margahayu');

        $promo->update($validated);
        $this->syncToKnowledgeItemAndFile();

        return response()->json([
            'success' => true,
            'message' => 'Data Promo & Event berhasil diperbarui.',
            'data' => $promo
        ]);
    }

    /**
     * Quick toggle action link active
     */
    public function toggleActionLink(Request $request, $id)
    {
        $promo = Promo::findOrFail($id);
        $promo->action_link_active = !$promo->action_link_active;
        $promo->save();

        $this->syncToKnowledgeItemAndFile();

        return response()->json([
            'success' => true,
            'message' => 'Status Link Action berhasil diubah.',
            'action_link_active' => $promo->action_link_active
        ]);
    }

    /**
     * Delete Promo / Event
     */
    public function destroy($id)
    {
        $promo = Promo::findOrFail($id);
        $title = $promo->title;
        $promo->delete();

        $this->syncToKnowledgeItemAndFile();

        return response()->json([
            'success' => true,
            'message' => "Promo '{$title}' berhasil dihapus."
        ]);
    }

    /**
     * Reorder promos
     */
    public function reorder(Request $request)
    {
        $orderedIds = $request->input('ids', []);
        if (is_array($orderedIds)) {
            foreach ($orderedIds as $index => $id) {
                Promo::where('id', $id)->update(['sort_order' => $index + 1]);
            }
            $this->syncToKnowledgeItemAndFile();
        }

        return response()->json([
            'success' => true,
            'message' => 'Urutan Promo & Event berhasil diperbarui.'
        ]);
    }

    /**
     * Reset promos to factory defaults
     */
    public function reset(Request $request)
    {
        Promo::truncate();

        foreach ($this->getDefaultPromoItems() as $item) {
            Promo::create($item);
        }

        $this->syncToKnowledgeItemAndFile();

        $promos = Promo::orderBy('sort_order', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Seluruh Promo & Event telah direset ke data default bawaan sistem.',
            'data' => $promos
        ]);
    }

    /**
     * Sync table data to KnowledgeItem model and local JSON backup
     */
    protected function syncToKnowledgeItemAndFile(): void
    {
        try {
            $allPromos = Promo::orderBy('sort_order', 'asc')->get()->toArray();

            // 1. Sync to KnowledgeItem (key: promo_event)
            KnowledgeItem::updateOrCreate(
                ['key' => 'promo_event'],
                [
                    'title' => 'Daftar Promo Penjualan & Event Showroom Mitsubishi Margahayu',
                    'category' => 'sales_marketing',
                    'payload' => $allPromos,
                    'metadata' => [
                        'total_items' => count($allPromos),
                        'brand' => 'Mitsubishi Motors',
                        'last_sync' => now()->toISOString()
                    ],
                    'is_active' => true,
                    'updated_by' => 'System Sync'
                ]
            );

            // 2. Backup to filesystem
            $targetFiles = [
                base_path('../knowledge/promo_event.json'),
                base_path('../promo_event.json')
            ];

            $jsonString = json_encode([
                'meta' => [
                    'title' => 'Master Data Promo & Event Mitsubishi Margahayu',
                    'last_sync' => now()->toISOString()
                ],
                'promos' => $allPromos
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            foreach ($targetFiles as $file) {
                if (file_exists($file) || is_writable(dirname($file))) {
                    file_put_contents($file, $jsonString);
                }
            }
        } catch (\Throwable $e) {
            // Non-fatal
        }
    }
}
