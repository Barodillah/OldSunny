<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Lead;

class SunnyAiService
{
    protected string $knowledgePath;

    public function __construct()
    {
        $this->knowledgePath = realpath(base_path('../knowledge')) ?: base_path('../knowledge');
    }

    /**
     * Get knowledge data from Database (KnowledgeItem) or fallback to JSON files
     */
    public function getKnowledge(string $key): ?array
    {
        // 1. Coba ambil knowledge dinamis dari tabel MySQL knowledge_items
        try {
            $normalizedKey = str_replace('-', '_', strtolower(trim($key)));
            $dbItem = \App\Models\KnowledgeItem::where('key', $normalizedKey)->where('is_active', true)->first();
            if ($dbItem && !empty($dbItem->payload)) {
                return is_array($dbItem->payload) ? $dbItem->payload : (json_decode($dbItem->payload, true) ?: []);
            }
        } catch (\Throwable $e) {
            // Abaikan error koneksi / tabel dan lanjut ke file fallback
        }

        // 2. Fallback ke file JSON lokal
        $fileMap = [
            'dealer' => 'dealer_info.json',
            'body_paint' => 'body_paint.json',
            'price_list' => 'price_list.json',
            'sparepart' => 'sparepart.json',
            'aksesoris' => 'aksesoris.json',
            'perawatan' => 'mitsubishi_perawatan_berkala.json',
            'simulasi_kredit' => 'simulasi_kredit.json',
            'soft_selling_ac' => 'soft_selling_additional_services.json',
            'extended_smart' => 'extended_smart_package.json',
            'promo' => 'promo/promo_oktober_2026.json',
            'destinator' => 'fitur/destinator.json',
        ];

        if (!isset($fileMap[$key])) {
            return null;
        }

        $fullPath = $this->knowledgePath . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $fileMap[$key]);
        if (file_exists($fullPath)) {
            $content = file_get_contents($fullPath);
            return json_decode($content, true) ?: [];
        }

        return null;
    }

    /**
     * Get real-time Jakarta time metadata
     */
    public function getJakartaTime(): array
    {
        $dt = new \DateTime('now', new \DateTimeZone('Asia/Jakarta'));
        $days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        $dayIndex = (int) $dt->format('w');
        $monthIndex = (int) $dt->format('n') - 1;

        return [
            'day_name' => $days[$dayIndex],
            'day' => (int) $dt->format('j'),
            'month' => $months[$monthIndex],
            'year' => (int) $dt->format('Y'),
            'time' => $dt->format('H:i') . ' WIB',
            'formatted' => $days[$dayIndex] . ', ' . $dt->format('j') . ' ' . $months[$monthIndex] . ' ' . $dt->format('Y'),
            'iso_date' => $dt->format('Y-m-d'),
        ];
    }

    /**
     * Build the rich system prompt tailored to PT Sun Star Prima Motor Margahayu
     */
    public function buildSystemPrompt(?string $nopolContext = '', ?string $slotContext = ''): string
    {
        $time = $this->getJakartaTime();
        $dealer = $this->getKnowledge('dealer') ?? [];
        $bodyPaint = $this->getKnowledge('body_paint') ?? [];
        $priceList = $this->getKnowledge('price_list') ?? [];
        $promo = $this->getKnowledge('promo') ?? [];
        $sparepart = $this->getKnowledge('sparepart') ?? [];
        $aksesoris = $this->getKnowledge('accessories') ?? ($this->getKnowledge('aksesoris') ?? []);
        $simulasi = $this->getKnowledge('simulasi_kredit') ?? [];
        $perawatan = $this->getKnowledge('perawatan') ?? [];
        $acSoft = $this->getKnowledge('soft_selling_ac') ?? [];
        $esp = $this->getKnowledge('extended_smart') ?? [];
        $destinator = $this->getKnowledge('destinator') ?? [];

        // Build price snippet
        $priceSnippet = "";
        if (!empty($priceList['passenger_car'])) {
            foreach ($priceList['passenger_car'] as $model => $data) {
                $mName = !empty($data['name']) ? $data['name'] : strtoupper(str_replace('_', ' ', $model));
                $priceSnippet .= "\n**{$mName}**\n";
                if (!empty($data['items'])) {
                    foreach ($data['items'] as $item) {
                        $priceSnippet .= "- {$item['type']}: Rp " . number_format($item['price'], 0, ',', '.') . "\n";
                    }
                }
                if (!empty($data['additional_cost']) && is_array($data['additional_cost'])) {
                    $priceSnippet .= "  Biaya Tambahan OTR:\n";
                    foreach ($data['additional_cost'] as $costName => $costPrice) {
                        $cLabel = ucwords(str_replace('_', ' ', $costName));
                        $priceSnippet .= "  • {$cLabel}: +Rp " . number_format($costPrice, 0, ',', '.') . "\n";
                    }
                }
            }
        }
        if (!empty($priceList['commercial_car'])) {
            $priceSnippet .= "\n**KENDARAAN NIAGA & FUSO**\n";
            foreach ($priceList['commercial_car'] as $model => $data) {
                $mName = strtoupper(str_replace('_', ' ', $model));
                $priceSnippet .= "- {$mName}:\n";
                if (!empty($data['categories'])) {
                    foreach ($data['categories'] as $cat => $items) {
                        foreach ($items as $item) {
                            $priceSnippet .= "  • {$item['type']} ({$item['spec']}): Rp " . number_format($item['price'], 0, ',', '.') . "\n";
                        }
                    }
                }
            }
        }

        // Build sparepart snippet
        $sparepartSnippet = "";
        if (!empty($sparepart['metadata']['catatan_penting'])) {
            $sparepartSnippet .= "Pedoman Kompatibilitas Suku Cadang:\n";
            foreach ($sparepart['metadata']['catatan_penting'] as $note) {
                $sparepartSnippet .= "• {$note}\n";
            }
            $sparepartSnippet .= "\n";
        }
        if (!empty($sparepart['spare_parts'])) {
            foreach ($sparepart['spare_parts'] as $part) {
                $statusNote = ($part['status'] ?? '') === 'always_available' ? ' [Fast Moving/Always Ready]' : '';
                $sparepartSnippet .= "- [{$part['kategori']}] {$part['nomor_part']} — {$part['nama']} (Rp " . number_format($part['harga_satuan'], 0, ',', '.') . "){$statusNote} | Model: " . implode(', ', $part['digunakan_pada']) . "\n";
            }
        }

        // Build aksesoris snippet
        $aksesorisSnippet = "";
        $accList = $aksesoris['mitsubishi_accessories'] ?? $aksesoris;
        if (!empty($accList) && is_array($accList)) {
            foreach ($accList as $vModel => $cats) {
                if (!is_array($cats)) continue;
                $aksesorisSnippet .= "\n**Model: {$vModel}**\n";
                // Paket
                if (!empty($cats['paket_aksesoris'])) {
                    $aksesorisSnippet .= "• Paket Bundle:\n";
                    foreach (array_slice($cats['paket_aksesoris'], 0, 5) as $pkg) {
                        $pPrice = !empty($pkg['price']) ? ' (Rp ' . number_format($pkg['price'], 0, ',', '.') . ')' : '';
                        $aksesorisSnippet .= "  - {$pkg['item']}{$pPrice}\n";
                    }
                }
                // Exterior
                if (!empty($cats['exterior'])) {
                    $aksesorisSnippet .= "• Eksterior:\n";
                    foreach (array_slice($cats['exterior'], 0, 6) as $acc) {
                        $aPrice = !empty($acc['price']) ? ' (Rp ' . number_format($acc['price'], 0, ',', '.') . ')' : '';
                        $aksesorisSnippet .= "  - {$acc['item']}{$aPrice}\n";
                    }
                }
                // Interior
                if (!empty($cats['interior'])) {
                    $aksesorisSnippet .= "• Interior:\n";
                    foreach (array_slice($cats['interior'], 0, 5) as $acc) {
                        $aPrice = !empty($acc['price']) ? ' (Rp ' . number_format($acc['price'], 0, ',', '.') . ')' : '';
                        $aksesorisSnippet .= "  - {$acc['item']}{$aPrice}\n";
                    }
                }
            }
        }

        // Build body & paint snippet
        $bpSnippet = "Standar Fasilitas: " . ($bodyPaint['facility_standard'] ?? 'Resmi MMKSI') . "\n";
        $bpSnippet .= "- Oven Spray Booth bertekanan positif, bebas debu, suhu 60-70°C\n";
        $bpSnippet .= "- Computerized Color Matching (akurasi warna 100% sama dengan pabrik OEM)\n";
        $bpSnippet .= "- Hydraulic Frame Alignment Bench (perbaikan sasis/chassis tabrakan)\n";
        $bpSnippet .= "- Express Body Paint (1 hari selesai untuk perbaikan 1-3 panel ringan)\n";
        $bpSnippet .= "- Rekanan Asuransi Resmi: Garda Oto, Sompo, Zurich/Adira, ACA, Sinarmas, Tokio Marine, Jasindo, Allianz, dll. Layanan klaim dibantu end-to-end sampai SPK terbit.\n";
        $bpSnippet .= "- Garansi Pengecatan Resmi: 6 Bulan.\n";
        $bpSnippet .= "- Estimasi Biaya Mandiri: Per panel Rp 750.000 – Rp 1.250.000, spot repair lecet Rp 350.000 – Rp 500.000, poles bodi menyeluruh mulai Rp 1.500.000.\n";

        // Build promo & event snippet from database / knowledge
        $promoSnippet = "";
        try {
            $promoList = \App\Models\Promo::where('is_active', true)->orderBy('sort_order')->get();
            if ($promoList->isEmpty()) {
                $promoKI = $this->getKnowledge('promo_event') ?? $this->getKnowledge('promo');
                $items = is_array($promoKI) ? ($promoKI['promos'] ?? $promoKI) : [];
            } else {
                $items = $promoList;
            }

            foreach ($items as $p) {
                $pTitle = is_object($p) ? $p->title : ($p['title'] ?? '');
                $pCat = is_object($p) ? ($p->category_label ?: ucfirst($p->category)) : ($p['category_label'] ?? ucfirst($p['category'] ?? ''));
                $pVehicles = is_object($p) ? $p->target_vehicles : ($p['target_vehicles'] ?? '');
                $pValidity = is_object($p) ? $p->validity : ($p['validity'] ?? '');
                $pHighlight = is_object($p) ? $p->highlight : ($p['highlight'] ?? '');
                $pLink = is_object($p) ? $p->action_link : ($p['action_link'] ?? '');
                $pLinkActive = is_object($p) ? $p->action_link_active : ($p['action_link_active'] ?? false);
                $pLabel = is_object($p) ? $p->action_button_label : ($p['action_button_label'] ?? '');

                $promoSnippet .= "\n**[{$pCat}] {$pTitle}**\n";
                if ($pVehicles) $promoSnippet .= "• Berlaku Untuk: {$pVehicles}\n";
                if ($pValidity) $promoSnippet .= "• Periode: {$pValidity}\n";
                if ($pHighlight) $promoSnippet .= "• Ringkasan: {$pHighlight}\n";
                if ($pLinkActive && !empty($pLink)) {
                    $lbl = !empty($pLabel) ? $pLabel : 'Form Pendaftaran / Klaim';
                    $promoSnippet .= "• Link Akses Langsung ({$lbl}): {$pLink}\n";
                }
            }
        } catch (\Throwable $e) {
            // Silently fallback
        }

        return <<<PROMPT
Kamu adalah **Sunny**, Asisten Pintar 24 Jam resmi dari **PT Sun Star Prima Motor - Margahayu** (Dealer Resmi Mitsubishi Motors & Fuso 3S + Authorized Body & Paint di Bekasi Timur).

## WAKTU SAAT INI (REAL-TIME JAKARTA)
- Hari & Tanggal: **{$time['formatted']}**
- Waktu: **{$time['time']}**
- Zona Waktu: **WIB (Asia/Jakarta)**

## PROFIL & IDENTITAS DEALER KAMI
- Nama Dealer: **PT Sun Star Prima Motor - Margahayu (Bekasi Timur)**
- Alamat Lengkap: Jl. Ir. H. Juanda No. 35 Bulak Kapal, RT.001/RW.001, Aren Jaya, Kec. Bekasi Timur, Kota Bekasi, Jawa Barat 17111
- Patokan / Landmark: Bulak Kapal Bekasi Timur, seberang area komersial / Terminal Margahayu
- Rute Google Maps: https://maps.app.goo.gl/avtswtfZ9g7sTkcZ6
- Telepon Hunting: (021) 8834 7777
- WhatsApp Resmi & Hotline: 0812-8834-7777
- Layanan Darurat 24 Jam (Service On Road): 0812-8834-7777
- Rekening Resmi Pembayaran (WASPADA PENIPUAN):
  • Bank: **BCA (Bank Central Asia)**
  • Nomor Rekening: **3425419999**
  • Atas Nama: **PT SUN STAR PRIMA MOTOR**
  • PENTING: Dilarang keras mentransfer ke rekening pribadi sales/karyawan. Semua transaksi sah HANYA ke rekening resmi PT Sun Star Prima Motor di atas.

## JAM OPERASIONAL DEALER
1. **Showroom Penjualan:**
   - Senin – Sabtu: 08:30 – 19:00 WIB
   - Minggu & Hari Libur Nasional: 09:00 – 17:00 WIB (Buka Setiap Hari)
2. **Bengkel Resmi & Body Paint:**
   - Senin – Jumat: 08:00 – 16:30 WIB
   - Sabtu: 08:00 – 15:00 WIB
   - Penerimaan servis datang langsung (walk-in) paling siang: pukul **11:00 WIB**
3. **Layanan Darurat Service On Road & Sunny Assistant:**
   - **Siaga 24 Jam Nonstop (24/7)** setiap hari termasuk hari libur dan tanggal merah.

## FASILITAS DEALER & HOSPITALITAS UNGGULAN (100% GRATIS)
- Ruang Tunggu VIP Lounge mewah ber-AC dan sofa nyaman
- **Voucher Noah Coffee Gratis** untuk setiap pelanggan showroom & servis
- **Kids Zone Playground** mandi bola ceria & mainan edukasi higienis berstandar SNI
- **Enjoy Room** dengan bean bag empuk & pencahayaan ramah mata untuk relaksasi
- **Work From Anywhere (WFA) Station** dengan Wi-Fi 6 berkecepatan tinggi & stopkontak lengkap
- **Free Shuttle Service** mengantar pelanggan ke stasiun atau pusat perbelanjaan terdekat selama mobil dirawat
- Snack Corner & Minuman dingin/hangat gratis
- Musholla & Toilet bersih berstandar eksekutif

## PERAN & MISI UTAMA SUNNY
Sunny adalah asisten pintar 24 jam resmi dari PT Sun Star Prima Motor Margahayu.
Kamu bersikap ramah, sopan, bersahabat, informatif, dan selalu **membantu dengan suka hati**.
JANGAN PERNAH bersikap kaku atau memaksa. Bicaralah selayaknya konsultan ramah yang tulus ingin membantu kebutuhan konsumen.

## FILOSOFI PELAYANAN: MEMBANTU DENGAN SUKA HATI (HELP FIRST, QUALIFY LATER)
1. **JANGAN AGRESIF MEMINTA NOMOR WHATSAPP DI AWAL:**
   - Dilarang keras langsung menodong atau meminta nomor WhatsApp di pesan awal atau saat konsumen baru mulai bertanya/menyapa.
   - Sambut setiap pertanyaan dengan hangat, antusias, dan bersahabat.
   - Berikan informasi yang dicari konsumen terlebih dahulu secara tuntas, jelas, dan memuaskan (seperti spesifikasi, keunggulan fitur, kisaran harga OTR, promo bulan ini, fasilitas bengkel, estimasi pengerjaan, dsb).
   - Biarkan percakapan mengalir santai dan bangun kenyamanan serta kepercayaan konsumen terlebih dahulu.

2. **EKSPLORASI KEBUTUHAN SECARA NATURAL:**
   - Tanyakan preferensi atau kebutuhan konsumen secara wajar selayaknya percakapan akrab (misal: "Apakah tertarik varian matik atau manual?", "Rencana untuk mobil keluarga atau operasional?").
   - Berikan rekomendasi dan hitungan simulasi awal secara transparan di dalam chat tanpa syarat apapun.

3. **NOMOR WHATSAPP SEBAGAI PERMINTAAN TERAKHIR (UNTUK MENYIMPAN LEAD):**
   - Nomor WhatsApp adalah **permintaan terakhir** yang HANYA ditanyakan setelah kebutuhan konsumen sudah jelas dibahas dan konsumen ingin langkah tindak lanjut resmi.
   - Contoh momen yang tepat menanyakan nomor WhatsApp di tahap akhir:
     • Konsumen ingin dikirimkan rincian tabel simulasi kredit resmi leasing atau brosur PDF lengkap.
     • Konsumen ingin konfirmasi jadwal test drive atau booking servis bengkel.
     • Konsumen ingin dihubungkan langsung dengan konsultan sales atau Service Advisor resmi dealer.
   - Tanyakan nomor WhatsApp dengan sopan, santun, dan tanpa memaksa:
     *"Bila Bapak/Ibu berkenan, boleh dibantu nama dan nomor WhatsApp aktifnya? Agar Sunny dan konsultan resmi kami dapat mengirimkan rincian tabel simulasi kredit resmi / konfirmasi jadwal test drive langsung ke WhatsApp Anda."*

4. **ATURAN MUTLAK PENYIMPANAN DATA (TAG [SAVE_LEAD]):**
   - Tag `[SAVE_LEAD:label]` HANYA dikeluarkan jika konsumen telah memberikan nomor WhatsApp/telepon di tahap akhir percakapan ini.
   - JANGAN PERNAH mengeluarkan tag `[SAVE_LEAD]` jika konsumen belum memberikan nomor WhatsApp.
   - Ketika nomor WhatsApp sudah diberikan, sertakan tag penyimpanan lead:
     `[SAVE_LEAD:label]{"customer_name":"...","customer_phone":"...","customer_nopol":"...","vehicle_model":"...","notes":"...","data":{...}}[/SAVE_LEAD]`

## TUGAS & PENANGANAN REQUEST LENGKAP:
1. **BOOKING SERVICE (Perawatan Berkala & Perbaikan):**
   - Tanyakan: Nomor Polisi (Nopol), jenis servis (KM berapa / ada keluhan?), tanggal, dan jam yang diinginkan.
   - Jam booking yang tersedia: **08:00, 09:00, 10:00, 11:00, 13:00** (Jam harus bulat).
   - Informasikan jika datang langsung tanpa booking (walk-in) diterima maksimal pukul 11:00 WIB.
   - Servis kelipatan ganjil (10k, 30k, 50k) = servis kecil (estimasi ~2 jam). Kelipatan genap (20k, 40k, 60k) = servis besar (>2 jam).
   - Verifikasi nomor HP customer sebelum konfirmasi akhir. Sertakan tag `[SAVE_LEAD:booking]`.
2. **TEST DRIVE:**
   - Tawarkan model: Destinator, New Xforce HEV, New Pajero Sport, New Xpander Cross, New Xpander, All New Triton.
   - Kumpulkan: Pilihan model, tanggal & jam yang diinginkan (antara 08:30 - 17:00 WIB), Nama Lengkap, dan Nomor WhatsApp.
   - Sertakan tag `[SAVE_LEAD:test_drive]`.
3. **PEMESANAN KENDARAAN (SPK) & SIMULASI KREDIT:**
   - Berikan informasi harga OTR resmi dan promo berjalan.
   - Tawarkan simulasi kredit (Dipo Star Finance, bunga 0%, DP ringan mulai 10-15%, tenor s.d. 6-7 tahun, smart cash).
   - Jika membahas simulasi kredit, sertakan tag `[SIMULASI_KREDIT]` agar tombol kalkulator interaktif muncul.
   - Kumpulkan data peminat: Nama dan Nomor WhatsApp. Sertakan tag `[SAVE_LEAD:prospect]`.
4. **EMERGENCY / SERVICE ON ROAD 24 JAM:**
   - Untuk mobil mogok, aki tekor (jumper), ban bocor/ganti serep, overheat, atau butuh derek towing resmi ke bengkel.
   - Sertakan tag `[EMERGENCY]` agar tombol berbagi lokasi koordinat GPS muncul.
   - Kumpulkan: Lokasi alamat/patokan, Nopol, Kendaraan, Kendala, Nama, dan No HP.
   - Informasikan bahwa tim Service on Road segera dihubungi dan meluncur ke lokasi.
   - Sertakan tag `[SAVE_LEAD:emergency]`.
5. **SPAREPART & AKSESORIS:**
   - Semua suku cadang dijamin 100% orisinal Mitsubishi Motors Genuine Parts (MMGO).
   - Tampilkan nomor part, nama, harga satuan resmi, dan peruntukannya.
   - Untuk aksesoris paket (Aero Package, Platinum Package, dll.), jelaskan rincian dan hematnya membeli paket dibanding satuan.
   - Jika customer berminat memesan, kumpulkan Nama dan No HP, lalu sertakan tag `[SAVE_LEAD:sparepart]` atau `[SAVE_LEAD:aksesoris]`.
6. **AUTHORIZED BODY & PAINT:**
   - Fasilitas oven spray booth MMKSI bebas debu, computerized color matching 100% presisi, hydraulic frame alignment bench, dan Express Body Paint 1 hari selesai.
   - Bantuan klaim asuransi end-to-end (Garda Oto, Sompo, Zurich, ACA, Sinarmas, dll.) didampingi Service Advisor sampai SPK asuransi terbit.
   - Garansi resmi hasil pengecatan 6 bulan.
   - Kumpulkan data keluhan bodi/cat dan nomor kontak pelanggan.
7. **COMPLAINT / KRITIK & SARAN:**
   - Dengarkan dengan empati penuh. Tanyakan apakah terkait Penjualan, Servis Bengkel, Body Paint, atau Lainnya.
   - Kumpulkan: Nama Lengkap, Nomor HP/WhatsApp, Nopol (jika servis/body paint) atau Nama Sales (jika pembelian), serta rincian kronologi keluhan.
   - Sampaikan bahwa keluhan langsung masuk ke meja Customer Service Management (CSM) dan ditindaklanjuti maksimal 1x24 jam.
   - Sertakan tag `[SAVE_LEAD:complaint]`.
8. **QUESTION / INFO STOK & PELAYANAN:**
   - Jawab pertanyaan fasilitas, alamat, rute, jam buka, ketersediaan unit, maupun pertanyaan umum dengan jelas dan akurat.
   - Sertakan tag `[WHATSAPP]` jika customer butuh bicara langsung dengan Admin / Sales / Service Advisor di WhatsApp.

## ATURAN TAG & FORMAT JAWABAN:
- Gunakan bahasa Indonesia yang luwes, profesional, hangat, dan tertata rapi dengan markdown (bold, bullet points).
- Pastikan jawaban lengkap dan tidak terpotong di tengah jalan.
- Setiap jawaban WAJIB diakhiri dengan **3 opsi Quick Reply** di baris baru yang diawali tanda `💬 `.
  PANDUAN KHUSUS QUICK REPLY (PENTING):
  Tulis opsi Quick Reply murni dari POV (Sudut Pandang) USER / KONSUMEN dalam kalimat santun, wajar, dan ringkas (1 baris), agar ketika user mengklik opsi tersebut, kalimatnya langsung bertindak sebagai respons cepat untuk menjawab pertanyaan Sunny atau mengajukan pertanyaan lanjutan dari customer.
  Opsi harus mencakup variasi:
  a) Menjawab Cepat pertanyaan Sunny (misal: "Saya berminat Xforce varian Ultimate, hubungi saya di WA", "Saya mau booking servis untuk Nopol B 1234 XYZ")
  b) Mengajukan Pertanyaan Lanjutan yang relevan bagi konsumen (misal: "Hitungkan simulasi DP 15% dan cicilan per bulannya", "Berapa lama pengerjaan servis berkala ini?", "Bisa bantu proses klaim asuransi rekanan?")
  DILARANG menggunakan judul menu kaku seperti "Booking Servis Sekarang", "Simulasi Kredit Destinator", atau "Fasilitas Body Paint". Selalu gunakan kalimat aktif / pertanyaan dari sudut pandang konsumen.
  Contoh format yang benar:
  💬 Hitungkan simulasi DP 15% dan tenor 5 tahun
  💬 Ada promo diskon OTR & cashback unit ini bulan ini?
  💬 Saya mau booking jadwal servis untuk besok pagi
- JANGAN sertakan data rahasia internal dalam tampilan pesan ke customer.
- **DETEKSI TOPIK DI LUAR KONTEKS PELAYANAN DEALER [OUT_OF_CONTEXT]:**
  - Jika pesan terbaru pengguna menanyakan hal yang sama sekali di luar konteks pelayanan dealer mobil Mitsubishi (misalnya: resep masakan, politik, coding/programming, curhat pribadi, PR sekolah, matematika rumit, cryptocurrency, tugas umum non-otomotif, lelucon tak terkait, atau hal lain di luar mobil, promo, pembiayaan, servis bengkel, body paint, suku cadang, dan dealer kami):
    1. TETAP JAWAB DENGAN SANGAT RAMAH, SANTUN, DAN SOPAN. Jelaskan dengan halus bahwa sebagai asisten virtual resmi Mitsubishi Sun Margahayu, Sunny hanya mengkhususkan diri membantu seputar produk mobil Mitsubishi, promo, simulasi kredit, booking bengkel, perbaikan bodi, dan suku cadang. JANGAN SEBUTKAN ATAU PERINGATKAN tentang sistem pemblokiran atau penghitungan sama sekali!
    2. Sertakan tag rahasia `[OUT_OF_CONTEXT]` di baris sebelum daftar quick reply.
- Ketika data customer LENGKAP untuk suatu aksi, sertakan tag penyimpanan lead di baris sebelum quick reply:
  `[SAVE_LEAD:label]{"customer_name":"...","customer_phone":"...","customer_nopol":"...","vehicle_model":"...","data":{...}}[/SAVE_LEAD]`

## DATA REFERENSI PENGETAHUAN KAMI:
### 1. DAFTAR HARGA KENDARAAN (OTR JABODETABEK / BEKASI)
{$priceSnippet}

### 2. FASILITAS & BIAYA BODY & PAINT
{$bpSnippet}

### 3. CONTOH SUKU CADANG FAST MOVING RESMI (MMGO)
{$sparepartSnippet}

### 4. KATALOG AKSESORIS RESMI MITSUBISHI (GENUINE ACCESSORIES)
{$aksesorisSnippet}

### 5. PROGRAM PROMO & EVENT SPESIAL BERJALAN SAAT INI
{$promoSnippet}

PROMPT;
    }

    /**
     * Send chat request to OpenRouter or fallback to smart knowledge engine
     */
    public function chat(array $messages, ?string $sessionId = null): array
    {
        $systemPrompt = $this->buildSystemPrompt();
        $apiKey = env('OPENROUTER_API_KEY');
        $model = env('OPENROUTER_MODEL', 'google/gemini-2.0-flash-001');
        $siteUrl = env('OPENROUTER_SITE_URL', 'http://localhost:5173');
        $appName = env('OPENROUTER_APP_NAME', 'Sunny AI - PT Sun Star Prima Motor Margahayu');

        // Check if API key is provided
        if (!empty($apiKey) && trim($apiKey) !== 'your_openrouter_api_key_here') {
            try {
                $payload = [
                    'model' => $model,
                    'messages' => array_merge(
                        [['role' => 'system', 'content' => $systemPrompt]],
                        $messages
                    ),
                    'temperature' => 0.7,
                    'max_tokens' => 1500,
                ];

                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'HTTP-Referer' => $siteUrl,
                    'X-Title' => $appName,
                    'Content-Type' => 'application/json',
                ])->timeout(35)->post('https://openrouter.ai/api/v1/chat/completions', $payload);

                if ($response->successful()) {
                    $json = $response->json();
                    $content = $json['choices'][0]['message']['content'] ?? '';
                    if (!empty($content)) {
                        return $this->processResponse($content, $sessionId);
                    }
                } else {
                    Log::warning('OpenRouter API returned error status: ' . $response->status() . ' - ' . $response->body());
                }
            } catch (\Throwable $e) {
                Log::error('OpenRouter API exception: ' . $e->getMessage());
            }
        }

        // Smart Knowledge Fallback Engine when OpenRouter key is empty or temporarily unreachable
        return $this->smartKnowledgeFallback($messages, $sessionId);
    }

    /**
     * Process response: extract tags, parse quick replies, auto-save leads
     */
    public function processResponse(string $rawText, ?string $sessionId = null): array
    {
        // Strip thinking tags
        $cleanText = preg_replace('/<think>[\s\S]*?<\/think>/i', '', $rawText);
        $cleanText = preg_replace('/<thinking>[\s\S]*?<\/thinking>/i', '', $cleanText);

        $hasEmergency = strpos($cleanText, '[EMERGENCY]') !== false;
        $hasWhatsApp = strpos($cleanText, '[WHATSAPP]') !== false;
        $hasSimulasiKredit = strpos($cleanText, '[SIMULASI_KREDIT]') !== false;
        $isOutOfContext = strpos($cleanText, '[OUT_OF_CONTEXT]') !== false;

        // Detect & Save Leads to MySQL (Strictly requires valid customer phone/WhatsApp)
        $savedLead = null;
        if (preg_match('/\[SAVE_LEAD:(\w+)\]([\s\S]*?)\[\/SAVE_LEAD\]/', $cleanText, $matches)) {
            $leadType = $matches[1];
            $leadJsonStr = trim($matches[2]);
            // Remove markdown code blocks if any
            $leadJsonStr = preg_replace('/^```json/i', '', $leadJsonStr);
            $leadJsonStr = preg_replace('/^```/', '', $leadJsonStr);
            $leadJsonStr = preg_replace('/```$/', '', $leadJsonStr);
            $leadData = json_decode(trim($leadJsonStr), true);

            if (is_array($leadData)) {
                try {
                    $savedLead = $this->saveOrUpdateLead($sessionId, $leadType, $leadData);
                } catch (\Throwable $e) {
                    Log::error('Failed to auto-save or update lead in database: ' . $e->getMessage());
                }
            }
        }

        // Clean out internal tags for frontend presentation
        $cleanText = preg_replace('/\[EMERGENCY\]/', '', $cleanText);
        $cleanText = preg_replace('/\[WHATSAPP\]/', '', $cleanText);
        $cleanText = preg_replace('/\[SIMULASI_KREDIT\]/', '', $cleanText);
        $cleanText = preg_replace('/\[OUT_OF_CONTEXT\]/', '', $cleanText);
        $cleanText = preg_replace('/\[SAVE_LEAD:\w+\][\s\S]*?\[\/SAVE_LEAD\]/', '', $cleanText);
        $cleanText = preg_replace('/^.*\[SISTEM\].*$/m', '', $cleanText);
        $cleanText = preg_replace('/^.*\[INTERNAL[^\]]*\].*$/m', '', $cleanText);

        // Extract 💬 quick replies
        $lines = explode("\n", $cleanText);
        $quickReplies = [];
        $finalLines = [];

        foreach ($lines as $line) {
            if (preg_match('/^💬\s*(.+)/', trim($line), $qrMatch)) {
                $quickReplies[] = trim($qrMatch[1]);
            } else {
                $finalLines[] = $line;
            }
        }

        $finalText = trim(implode("\n", $finalLines));

        if (empty($quickReplies)) {
            $quickReplies = [
                'Berapa promo OTR & diskon mobil baru bulan ini?',
                'Saya ingin booking jadwal servis berkala di bengkel',
                'Hitungkan simulasi DP ringan & cicilan per bulan'
            ];
        }

        return [
            'success' => true,
            'reply' => $finalText,
            'quick_replies' => array_slice($quickReplies, 0, 4),
            'action_tags' => [
                'emergency' => $hasEmergency,
                'whatsapp' => $hasWhatsApp,
                'simulasi_kredit' => $hasSimulasiKredit,
                'out_of_context' => $isOutOfContext,
            ],
            'saved_lead' => $savedLead ? [
                'id' => $savedLead->id,
                'type' => $savedLead->type,
                'customer_name' => $savedLead->customer_name,
                'customer_phone' => $savedLead->customer_phone,
                'is_updated' => $savedLead->is_updated ?? false,
            ] : null,
        ];
    }

    /**
     * Save a new lead or update an existing lead without creating duplicates.
     * Strictly requires a valid customer phone/WhatsApp number.
     */
    public function saveOrUpdateLead(?string $sessionId, string $leadType, array $leadData, ?string $explicitPhone = null): ?Lead
    {
        // 1. Identify phone number
        $customerPhone = $explicitPhone ?: ($leadData['customer_phone'] ?? null);

        // Fallback: check session database record if phone wasn't in leadData
        if (empty($customerPhone) && !empty($sessionId)) {
            $session = \App\Models\ChatSession::where('session_id', $sessionId)->first();
            if ($session && !empty($session->customer_phone)) {
                $customerPhone = $session->customer_phone;
            }
        }

        // Validate phone number format (must contain at least 8 digits)
        if ($customerPhone) {
            $customerPhone = trim($customerPhone);
            if (!preg_match('/(?:\+?62|0)8[0-9]{7,12}/', $customerPhone, $pMatch)) {
                $customerPhone = null;
            } else {
                $customerPhone = $pMatch[0];
            }
        }

        // STRICT RULE: If no valid phone/WhatsApp number, DO NOT SAVE TO LEADS!
        if (empty($customerPhone)) {
            Log::info("saveOrUpdateLead: Lead skipped for session {$sessionId} because customer phone/WhatsApp is not provided yet.");
            return null;
        }

        // 2. Search for existing lead in this session or by phone number in recent window
        $existingLead = null;
        if (!empty($sessionId)) {
            $existingLead = Lead::where('session_id', $sessionId)->first();
        }

        if (!$existingLead && !empty($customerPhone)) {
            // Check active 'new' lead created in the last 24 hours with same phone
            $existingLead = Lead::where('customer_phone', $customerPhone)
                ->where('status', 'new')
                ->where('created_at', '>=', now()->subHours(24))
                ->latest()
                ->first();
        }

        $customerName = !empty($leadData['customer_name']) ? trim($leadData['customer_name']) : null;
        $customerNopol = !empty($leadData['customer_nopol']) ? strtoupper(trim($leadData['customer_nopol'])) : null;
        $vehicleModel = !empty($leadData['vehicle_model']) ? trim($leadData['vehicle_model']) : null;
        $newNotes = !empty($leadData['notes']) ? trim($leadData['notes']) : (!empty($leadData['kebutuhan']) ? trim($leadData['kebutuhan']) : null);
        $payloadData = is_array($leadData['data'] ?? null) ? $leadData['data'] : $leadData;

        $normalizedType = strtolower(str_replace(' ', '_', $leadType ?: 'prospect'));
        if ($normalizedType === 'aksesoris') {
            $normalizedType = 'sparepart';
        }

        // 3. If lead ALREADY EXISTS: UPDATE IT, DO NOT DUPLICATE!
        if ($existingLead) {
            $updates = [];

            if (empty($existingLead->customer_phone) && $customerPhone) {
                $updates['customer_phone'] = $customerPhone;
            }

            if (!empty($customerName) && (empty($existingLead->customer_name) || strlen($customerName) > strlen($existingLead->customer_name))) {
                $updates['customer_name'] = $customerName;
            }

            if (!empty($customerNopol) && empty($existingLead->customer_nopol)) {
                $updates['customer_nopol'] = $customerNopol;
            }

            if (!empty($vehicleModel) && (empty($existingLead->vehicle_model) || $existingLead->vehicle_model === 'Kendaraan Mitsubishi')) {
                $updates['vehicle_model'] = $vehicleModel;
            }

            // Upgrade type from generic 'prospect' to specific type
            if ($existingLead->type === 'prospect' && $normalizedType !== 'prospect') {
                $updates['type'] = $normalizedType;
            }

            // Append new information to notes cleanly with timestamp
            if (!empty($newNotes)) {
                $existingNotes = $existingLead->notes ?? '';
                if (empty($existingNotes)) {
                    $updates['notes'] = $newNotes;
                } elseif (!str_contains($existingNotes, $newNotes)) {
                    $time = date('d/m H:i');
                    $updates['notes'] = $existingNotes . "\n[Update {$time} WIB]: " . $newNotes;
                }
            }

            // Merge data JSON
            $existingJson = is_array($existingLead->data) ? $existingLead->data : [];
            $mergedJson = array_merge($existingJson, $payloadData);
            $updates['data'] = $mergedJson;

            $existingLead->update($updates);
            $existingLead->is_updated = true;
            Log::info("saveOrUpdateLead: Updated existing lead ID {$existingLead->id} for session {$sessionId}.");
            return $existingLead;
        }

        // 4. If lead DOES NOT EXIST YET: CREATE IT
        $initialNotes = $newNotes ?: "Kontak awal via Asisten AI Sunny ({$normalizedType})";
        $lead = Lead::create([
            'session_id' => $sessionId,
            'type' => $normalizedType,
            'customer_name' => $customerName,
            'customer_phone' => $customerPhone,
            'customer_nopol' => $customerNopol,
            'vehicle_model' => $vehicleModel,
            'status' => 'new',
            'data' => $payloadData,
            'notes' => $initialNotes,
            'source' => 'sunny_ai_chat',
        ]);

        $lead->is_updated = false;
        Log::info("saveOrUpdateLead: Created new lead ID {$lead->id} for session {$sessionId}.");
        return $lead;
    }

    /**
     * Smart fallback engine using dealer knowledge data if OpenRouter key is not set or network fails
     */
    protected function smartKnowledgeFallback(array $messages, ?string $sessionId = null): array
    {
        $lastUserMsg = '';
        foreach (array_reverse($messages) as $m) {
            if (($m['role'] ?? '') === 'user') {
                $lastUserMsg = strtolower($m['content'] ?? '');
                break;
            }
        }

        $time = $this->getJakartaTime();
        $dealer = $this->getKnowledge('dealer');
        $bodyPaint = $this->getKnowledge('body_paint');

        $reply = "";
        $quickReplies = [];
        $actionTags = [
            'emergency' => false,
            'whatsapp' => false,
            'simulasi_kredit' => false,
        ];

        // 1. Emergency & Service on Road (Share Loc)
        if (str_contains($lastUserMsg, 'darurat') || str_contains($lastUserMsg, 'mogok') || str_contains($lastUserMsg, 'service on road') || str_contains($lastUserMsg, 'derek') || str_contains($lastUserMsg, 'share loc') || str_contains($lastUserMsg, 'titik lokasi') || str_contains($lastUserMsg, 'koordinat')) {
            $actionTags['emergency'] = true;
            if (str_contains($lastUserMsg, 'maps.google.com') || str_contains($lastUserMsg, 'koordinat') || str_contains($lastUserMsg, 'titik')) {
                $reply = "🚨 **TITIK LOKASI DARURAT ANDA BERHASIL DITERIMA!**\n\n" .
                    "Sistem siaga dealer kami telah mencatat koordinat lokasi kendaraan Anda.\n\n" .
                    "• 📞 **Hotline Dispatcher Siaga:** **0812-8834-7777** (Telepon / WhatsApp)\n" .
                    "• 🔧 Tim mekanik resmi Service on Road PT Sun Star Prima Motor Margahayu siap melakukan verifikasi dan meluncur ke lokasi Anda.\n" .
                    "• 🛡️ *Pastikan kendaraan berada di posisi aman, nyalakan lampu hazard, dan pasang segitiga pengaman jika di bahu jalan.*\n\n" .
                    "Silakan klik tombol **Kirim ke Dispatcher WA** atau **Hotline Darurat** di bawah untuk komunikasi langsung dengan tim lapangan:";
                $quickReplies = [
                    'Hubungkan saya dengan hotline darurat sekarang',
                    'Tolong kirim mekanik jumper aki / derek resmi',
                    'Berapa estimasi waktu tim tiba di lokasi saya?'
                ];
            } else {
                $reply = "🚨 **LAYANAN SERVICE ON ROAD 24 JAM — MITSUBISHI SUN MARGAHAYU**\n\n" .
                    "Tim teknisi darurat kami siap meluncur ke titik lokasi Anda untuk menangani kendaraan mogok, aki drop/jumper, ganti ban serep, atau derek resmi ke bengkel.\n\n" .
                    "📍 **Hubungi Hotline Darurat Sekarang:** **0812-8834-7777**\n" .
                    "Anda dapat langsung mengklik tombol **📍 Share Loc Titik Darurat** di bawah untuk menandai dan mengirimkan posisi GPS akurat kendaraan Anda.";
                $quickReplies = [
                    'Tolong pandu kirim titik lokasi GPS saya',
                    'Hubungkan saya dengan hotline darurat sekarang',
                    'Mobil saya mogok tidak bisa starter, mohon bantuan'
                ];
            }
        }
        // 2. Body & Paint
        elseif (str_contains($lastUserMsg, 'body paint') || str_contains($lastUserMsg, 'bodi') || str_contains($lastUserMsg, 'cat') || str_contains($lastUserMsg, 'asuransi') || str_contains($lastUserMsg, 'penyok') || str_contains($lastUserMsg, 'baret')) {
            $reply = "✨ **AUTHORIZED BODY & PAINT MITSUBISHI SUN MARGAHAYU (STANDAR MMKSI)**\n\n" .
                "Fasilitas resmi perbaikan bodi dan cat berstandar pabrikan:\n" .
                "• **Oven Spray Booth:** Pengecatan steril bertekanan positif bebas debu dengan oven suhu presisi.\n" .
                "• **Computerized Color Matching:** Formula warna 100% akurat persis warna asli pabrik OEM.\n" .
                "• **Express Body Paint:** Perbaikan baret/penyok 1–3 panel selesai dalam 1 hari kerja.\n" .
                "• **Klaim Asuransi Satu Pintu:** Rekanan resmi Garda Oto, Sompo, Zurich/Adira, ACA, Sinarmas, Tokio Marine, Jasindo, Allianz, dll. Proses klaim dibantu Service Advisor sampai tuntas!\n" .
                "• **Garansi Cat:** Garansi resmi 6 bulan.\n\n" .
                "Estimasi mandiri: per panel mulai Rp 750.000 – Rp 1.250.000.\n\n" .
                "👉 Boleh diceritakan bagian mana yang lecet/penyok dan apakah berencana klaim asuransi rekanan atau perbaikan mandiri? Sunny siap bantu berikan estimasi awal dengan senang hati!";
            $quickReplies = [
                'Bisa bantu proses klaim asuransi mobil saya?',
                'Berapa estimasi biaya perbaikan baret 1-2 panel?',
                'Apakah pengerjaan bodi & cat bisa selesai 1 hari?'
            ];
        }
        // 3. Booking Servis
        elseif (str_contains($lastUserMsg, 'booking') || str_contains($lastUserMsg, 'servis') || str_contains($lastUserMsg, 'service') || str_contains($lastUserMsg, 'bengkel') || str_contains($lastUserMsg, 'jadwal')) {
            $reply = "🔧 **RESERVASI BENGKEL RESMI MITSUBISHI SUN MARGAHAYU**\n\n" .
                "Bengkel resmi kami melayani perawatan berkala, tune-up, uji rem, spooring-balancing, dan servis AC dengan teknisi bersertifikasi MMKSI.\n\n" .
                "• **Jam Operasional:** Senin–Jumat 08:00–16:30 WIB | Sabtu 08:00–15:00 WIB\n" .
                "• **Slot Jam Booking:** 08:00, 09:00, 10:00, 11:00, 13:00 WIB\n" .
                "• **Fasilitas Pengunjung:** Voucher Noah Coffee gratis, Kids Zone playground, WFA Wi-Fi 6, dan Free Shuttle Service.\n\n" .
                "👉 Boleh diinfokan rencana **hari & jam kedatangan**, **tipe mobil**, serta **keluhan servis** Anda? Sunny bantu siapkan jadwal terbaiknya!";
            $quickReplies = [
                'Saya mau booking jadwal servis berkala minggu ini',
                'Berapa estimasi biaya servis kelipatan 10.000 KM?',
                'Apakah ruang tunggu ada WiFi dan area santai?'
            ];
        }
        // 4. Kredit & Harga
        elseif (str_contains($lastUserMsg, 'kredit') || str_contains($lastUserMsg, 'angsuran') || str_contains($lastUserMsg, 'cicilan') || str_contains($lastUserMsg, 'harga') || str_contains($lastUserMsg, 'dp') || str_contains($lastUserMsg, 'otr')) {
            $actionTags['simulasi_kredit'] = true;
            $reply = "💰 **HARGA OTR & SIMULASI KREDIT RESMI TRANSPARAN**\n\n" .
                "PT Sun Star Prima Motor Margahayu menyediakan paket pembiayaan resmi (Dipo Star Finance, BCA Finance, dll.):\n" .
                "• Program Bunga 0% (Smart Cash / Tenor 1-2 Tahun)\n" .
                "• Paket DP Ringan mulai 10% - 15% dengan tenor hingga 6-7 tahun\n" .
                "• Free Paket SMART Perawatan Berkala s.d. 50.000 KM / 4 Tahun (Gratis Jasa & Part)\n\n" .
                "Unit terpopuler bulan ini:\n" .
                "1. **Destinator:** OTR mulai Rp 395.000.000\n" .
                "2. **New Xforce (termasuk HEV):** OTR mulai Rp 388.000.000\n" .
                "3. **New Pajero Sport:** OTR mulai Rp 577.600.000\n" .
                "4. **New Xpander:** OTR mulai Rp 270.000.000\n\n" .
                "👉 Model Mitsubishi mana yang paling menarik perhatian Anda? Beritahu Sunny, dan Sunny bantu berikan rincian promo serta hitungan simulasi terbaiknya!";
            $quickReplies = [
                'Hitungkan simulasi DP ringan & cicilan Destinator',
                'Berapa diskon OTR & promo cashback Xforce bulan ini?',
                'Apakah ada program bunga 0% untuk Pajero Sport?'
            ];
        }
        // 5. Test Drive
        elseif (str_contains($lastUserMsg, 'test drive') || str_contains($lastUserMsg, 'tes drive') || str_contains($lastUserMsg, 'coba mobil')) {
            $reply = "🚗 **JADWALKAN TEST DRIVE RESMI MITSUBISHI**\n\n" .
                "Rasakan performa dan kenyamanan berkendara unit terbaru kami di Showroom Sun Margahayu:\n" .
                "• **Destinator** (The Ultimate 7-Seater Family SUV)\n" .
                "• **All New Xforce** (4 Drive Modes & Yamaha Sound)\n" .
                "• **New Pajero Sport** (Big Luxury SUV Tangguh)\n" .
                "• **New Xpander & Xpander Cross**\n\n" .
                "Test drive dapat dilakukan setiap hari pukul 08:30 – 17:00 WIB.\n\n" .
                "👉 Dari pilihan unit di atas, tipe mana yang ingin Anda coba kemudikan? Silakan tentukan hari yang nyaman bagi Anda, Sunny siap bantu siapkan!";
            $quickReplies = [
                'Saya mau jadwal test drive Destinator akhir pekan ini',
                'Apakah armada test drive Xforce bisa datang ke rumah?',
                'Apa saja syarat yang perlu disiapkan untuk test drive?'
            ];
        }
        // 6. Sparepart & Aksesoris
        elseif (str_contains($lastUserMsg, 'sparepart') || str_contains($lastUserMsg, 'suku cadang') || str_contains($lastUserMsg, 'oli') || str_contains($lastUserMsg, 'aksesoris') || str_contains($lastUserMsg, 'part') || str_contains($lastUserMsg, 'filter')) {
            $reply = "⚙️ **SUKU CADANG & AKSESORIS ORISINAL (MITSUBISHI GENUINE PARTS)**\n\n" .
                "Seluruh suku cadang dan pelumas di Bengkel Sun Margahayu dijamin 100% Original Equipment Manufacturer (OEM) berbarcode resmi MMKSI dengan garansi:\n" .
                "• **Pelumas Mesin MMGO (Mitsubishi Motors Genuine Oil):** Formula khusus mesin bensin & diesel common rail.\n" .
                "• **Fast Moving Parts:** Filter oli, filter kabin AC, kampas rem, busi, dan fan belt selalu ready stock.\n" .
                "• **Paket Aksesoris Resmi:** Aero Package, Interior/Exterior dress-up kit (lebih hemat hingga jutaan rupiah dibanding beli satuan).\n\n" .
                "👉 Boleh sebutkan suku cadang atau aksesoris yang Anda cari untuk tipe mobil apa? Sunny siap bantu cek ketersediaan stok fisiknya!";
            $quickReplies = [
                'Berapa harga paket oli mesin resmi MMGO?',
                'Apakah filter AC & kampas rem ready stock?',
                'Ada paket promo dress-up aksesoris resmi?'
            ];
        }
        // 7. Complaint / Kritik & Saran
        elseif (str_contains($lastUserMsg, 'komplain') || str_contains($lastUserMsg, 'keluhan') || str_contains($lastUserMsg, 'kritik') || str_contains($lastUserMsg, 'saran') || str_contains($lastUserMsg, 'kecewa') || str_contains($lastUserMsg, 'masukan')) {
            $actionTags['whatsapp'] = true;
            $reply = "🙏 **LAYANAN KELUHAN & MASUKAN KONSUMEN (CUSTOMER SERVICE MANAGEMENT)**\n\n" .
                "Kami memohon maaf atas ketidaknyamanan yang Bapak/Ibu alami. Setiap masukan dan kritik adalah prioritas utama manajemen kami untuk terus berbenah.\n\n" .
                "Mohon informasikan:\n" .
                "1. Terkait bagian apa? (**Penjualan** / **Servis Bengkel** / **Body Paint**)\n" .
                "2. Nama Lengkap & Nomor WhatsApp yang dapat dihubungi\n" .
                "3. Nomor Polisi (jika servis/body paint) atau Nama Sales (jika pembelian)\n" .
                "4. Rincian kendala / kronologi singkat\n\n" .
                "Laporan Anda akan langsung diproses oleh tim CSM dan ditindaklanjuti maksimal 1x24 jam.";
            $quickReplies = [
                'Saya ingin sampaikan keluhan terkait servis bengkel',
                'Saya ingin tindak lanjuti kendala dengan tim sales',
                'Tolong sambungkan ke Customer Service Manager'
            ];
        }
        // 8. Rekening Resmi & Legalitas
        elseif (str_contains($lastUserMsg, 'rekening') || str_contains($lastUserMsg, 'transfer') || str_contains($lastUserMsg, 'penipuan') || str_contains($lastUserMsg, 'bca')) {
            $reply = "🛡️ **REKENING RESMI & PERLINDUNGAN TRANSAKSI KONSUMEN**\n\n" .
                "Untuk keamanan seluruh konsumen, PT Sun Star Prima Motor menegaskan bahwa seluruh transaksi resmi pemesanan (SPK), DP, pelunasan kendaraan, servis, maupun suku cadang HANYA sah ke:\n\n" .
                "🏦 **Bank:** BCA (Bank Central Asia)\n" .
                "🔢 **Nomor Rekening:** **3425419999**\n" .
                "👤 **Atas Nama:** **PT SUN STAR PRIMA MOTOR**\n\n" .
                "⛔ *Dilarang keras mentransfer dana ke rekening pribadi sales atau karyawan manapun!* Bukti setor resmi dealer akan diterbitkan langsung.";
            $quickReplies = [
                'Saya ingin konfirmasi transfer DP/SPK ke BCA dealer',
                'Boleh minta nomor WhatsApp sales konsultan resmi?',
                'Bagaimana prosedur penerbitan kuitansi resmi dealer?'
            ];
        }
        // Default general response
        else {
            $reply = "Halo! Saya **Sunny**, asisten pintar 24 jam **PT Sun Star Prima Motor - Margahayu**.\n\n" .
                "Kami siap membantu Anda seputar kebutuhan Mitsubishi terlengkap:\n" .
                "• 🚙 **Info Unit Baru & OTR:** Destinator, Xforce, Pajero Sport, Xpander, Triton, L300, Canter\n" .
                "• 🔧 **Booking Servis Berkala:** Reservasi tanpa antre & fasilitas lounge VIP\n" .
                "• 🎨 **Authorized Body & Paint:** Oven spray booth berstandar MMKSI & klaim asuransi satu pintu\n" .
                "• 🚨 **Layanan Darurat 24 Jam:** Service on Road & derek resmi\n" .
                "• ⚙️ **Suku Cadang & Aksesoris:** 100% Genuine Parts MMGO bergaransi\n" .
                "• 📍 **Lokasi:** Jl. Ir. H. Juanda No. 35 Bulak Kapal, Bekasi Timur\n\n" .
                "👉 Silakan tanyakan apa saja seputar promo mobil baru, jadwal servis bengkel, hingga perbaikan bodi & cat. Sunny siap membantu Anda dengan senang hati!";
            $quickReplies = [
                'Berapa diskon OTR & promo mobil baru bulan ini?',
                'Saya ingin booking jadwal servis berkala di bengkel',
                'Bisa konsultasi perbaikan bodi & klaim asuransi?'
            ];
        }

        return [
            'success' => true,
            'reply' => $reply,
            'quick_replies' => $quickReplies,
            'action_tags' => $actionTags,
            'saved_lead' => null,
            'note' => 'Operated with Dealer Knowledge Engine',
        ];
    }
}
