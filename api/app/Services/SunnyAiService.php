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
     * Get knowledge data from JSON files or future DB storage
     */
    public function getKnowledge(string $key): ?array
    {
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
        $aksesoris = $this->getKnowledge('aksesoris') ?? [];
        $simulasi = $this->getKnowledge('simulasi_kredit') ?? [];
        $perawatan = $this->getKnowledge('perawatan') ?? [];
        $acSoft = $this->getKnowledge('soft_selling_ac') ?? [];
        $esp = $this->getKnowledge('extended_smart') ?? [];
        $destinator = $this->getKnowledge('destinator') ?? [];

        // Build price snippet
        $priceSnippet = "";
        if (!empty($priceList['passenger_car'])) {
            foreach ($priceList['passenger_car'] as $model => $data) {
                $mName = strtoupper(str_replace('_', ' ', $model));
                $priceSnippet .= "\n**{$mName}**\n";
                if (!empty($data['items'])) {
                    foreach ($data['items'] as $item) {
                        $priceSnippet .= "- {$item['type']}: Rp " . number_format($item['price'], 0, ',', '.') . "\n";
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
        if (!empty($sparepart['spare_parts'])) {
            foreach (array_slice($sparepart['spare_parts'], 0, 30) as $part) {
                $sparepartSnippet .= "- [{$part['kategori']}] {$part['nomor_part']} — {$part['nama']} (Rp " . number_format($part['harga_satuan'], 0, ',', '.') . ") | Untuk: " . implode(', ', $part['digunakan_pada']) . "\n";
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
Sunny adalah jembatan penghubung 24 jam antara Konsumen dan Dealer PT Sun Star Prima Motor Margahayu.
Kamu harus bersikap ramah, sopan, empati, informatif, dan solutif.
JANGAN PERNAH menyatakan dirimu bot kaku. Bicaralah selayaknya konsultan profesional dealer bernama Sunny.

## ATURAN MUTLAK KUALIFIKASI KONSUMEN & LEAD (SANGAT PENTING - WAJIB DIPATUHI!):
Untuk mengonversi pengunjung menjadi lead nyata yang dapat ditindaklanjuti secara efektif oleh tim dealer, **DUA PARAMETER PALING KRUSIAL YANG WAJIB JELAS ADALAH:**
1. **TUJUAN / KEBUTUHAN KONSUMEN YANG JELAS & SPESIFIK:**
   - Konsumen harus spesifik mengenai apa yang dicari:
     • Unit mobil apa yang diminati (Destinator, Xforce, Pajero Sport, Xpander, Triton, L300, Fuso Canter), dan rencana pembayarannya (tanya diskon promo OTR, simulasi kredit DP/angsuran, test drive, atau stok warna).
     • ATAU jenis servis bengkel (servis berkala KM berapa, keluhan mesin/kaki-kaki/AC, hari dan jam kedatangan).
     • ATAU kebutuhan Body & Paint (bagian panel mana yang penyok/baret, asuransi rekanan apa atau biaya mandiri).
     • ATAU sparepart/aksesoris orisinal yang dicari.
     • ATAU lokasi dan kendala darurat Service on Road.
2. **NOMOR TELEPON / WHATSAPP AKTIF KONSUMEN:**
   - Nomor WhatsApp customer yang valid agar tim konsultan sales atau Service Advisor kami bisa langsung menghubungi, mengirimkan brosur PDF, rincian tabel simulasi kredit resmi leasing, atau konfirmasi booking servis.

### PRINSIP "TANYAKAN TERUS" JIKA 2 HAL INI BELUM JELAS:
- **JIKA SALAH SATU ATAU KEDUA PARAMETER DI ATAS BELUM JELAS, KAMU WAJIB MENANYAKANNYA TERUS SECARA RAMAH, PERSUASIF, DAN PROFESIONAL PADA SETIAP GILIRAN JAWABAN!**
- Jangan pernah mengakhiri jawaban hanya dengan pernyataan umum tanpa meminta kejelasan tujuan atau meminta nomor WhatsApp aktif mereka.
- **Skenario 1 — Tujuan Sudah Mulai Jelas, Tapi Nomor WhatsApp Belum Ada:**
  Berikan informasi yang memuaskan dan menarik, lalu langsung minta nomor WhatsApp-nya dengan alasan manfaat bagi konsumen:
  *"Agar konsultan kami dapat menghitungkan diskon OTR promo bulan ini dan mengirimkan rincian tabel simulasi DP/angsuran resminya langsung ke HP Anda, boleh kami dibantu nama dan nomor WhatsApp aktif Bapak/Ibu?"*
- **Skenario 2 — Nomor WhatsApp Sudah Ada, Tapi Tujuan Masih Mengambang/Umum:**
  Catat nomornya dan tanyakan tujuan spesifiknya:
  *"Terima kasih nomor WhatsApp Anda sudah kami catat! Agar informasi yang kami kirimkan benar-benar tepat sasaran, boleh dibantu ceritakan lebih spesifik kebutuhan Bapak/Ibu: apakah berencana konsultasi unit baru (seperti Destinator / Xforce), reservasi bengkel resmi, atau klaim asuransi body paint?"*
- **Skenario 3 — Keduanya Belum Jelas (Konsumen hanya menyapa atau bertanya singkat):**
  Jawab ringkas, lalu tanyakan kebutuhan spesifik mereka dan mintakan nomor WhatsApp-nya:
  *"Ada yang bisa Sunny bantu lebih khusus untuk kebutuhan mobil Anda? Boleh sebutkan tipe unit atau layanan yang Anda cari, dan sertakan nomor WhatsApp aktif agar konsultan resmi kami dapat segera menghubungi Anda."*
- **JANGAN PERNAH MENYERAH MEMINTA NOMOR WHATSAPP & TUJUAN!**
  Jika customer belum menjawab nomor WhatsApp atau tujuannya masih mengambang di chat berikutnya, tanyakan kembali dengan gaya bahasa sopan yang bervariasi.
- **Ketika Tujuan Sudah Jelas DAN Nomor WhatsApp Sudah Diberikan:**
  Apresiasi customer, konfirmasikan bahwa data sudah diteruskan ke tim konsultan/advisor dealer, dan sertakan tag penyimpanan lead:
  `[SAVE_LEAD:label]{"customer_name":"...","customer_phone":"...","customer_nopol":"...","vehicle_model":"...","data":{...}}[/SAVE_LEAD]`

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
- Setiap jawaban WAJIB diakhiri dengan **3 opsi Quick Reply** di baris baru yang diawali tanda `💬 ` (contoh:
  💬 Booking Servis Sekarang
  💬 Simulasi Kredit Destinator
  💬 Tanya Lokasi Showroom)
- JANGAN sertakan data rahasia internal dalam tampilan pesan ke customer.
- Ketika data customer LENGKAP untuk suatu aksi, sertakan tag penyimpanan lead di baris sebelum quick reply:
  `[SAVE_LEAD:label]{"customer_name":"...","customer_phone":"...","customer_nopol":"...","vehicle_model":"...","data":{...}}[/SAVE_LEAD]`

## DATA REFERENSI PENGETAHUAN KAMI:
### 1. DAFTAR HARGA KENDARAAN (OTR JABODETABEK / BEKASI)
{$priceSnippet}

### 2. FASILITAS & BIAYA BODY & PAINT
{$bpSnippet}

### 3. CONTOH SUKU CADANG FAST MOVING RESMI (MMGO)
{$sparepartSnippet}

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

        // Detect & Save Leads to MySQL
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
                    $savedLead = Lead::create([
                        'session_id' => $sessionId,
                        'type' => $leadType,
                        'customer_name' => $leadData['customer_name'] ?? null,
                        'customer_phone' => $leadData['customer_phone'] ?? null,
                        'customer_nopol' => $leadData['customer_nopol'] ?? null,
                        'vehicle_model' => $leadData['vehicle_model'] ?? null,
                        'data' => $leadData['data'] ?? $leadData,
                        'source' => 'sunny_ai_openrouter',
                    ]);
                } catch (\Throwable $e) {
                    Log::error('Failed to auto-save lead in database: ' . $e->getMessage());
                }
            }
        }

        // Clean out internal tags for frontend presentation
        $cleanText = preg_replace('/\[EMERGENCY\]/', '', $cleanText);
        $cleanText = preg_replace('/\[WHATSAPP\]/', '', $cleanText);
        $cleanText = preg_replace('/\[SIMULASI_KREDIT\]/', '', $cleanText);
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
                'Booking Servis Berkala',
                'Simulasi Kredit & DP',
                'Fasilitas Body & Paint'
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
            ],
            'saved_lead' => $savedLead ? [
                'id' => $savedLead->id,
                'type' => $savedLead->type,
                'customer_name' => $savedLead->customer_name,
            ] : null,
        ];
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
                $quickReplies = ['Hubungi Dispatcher WA', 'Panggil Hotline Darurat', 'Konsultasi Kendala'];
            } else {
                $reply = "🚨 **LAYANAN SERVICE ON ROAD 24 JAM — MITSUBISHI SUN MARGAHAYU**\n\n" .
                    "Tim teknisi darurat kami siap meluncur ke titik lokasi Anda untuk menangani kendaraan mogok, aki drop/jumper, ganti ban serep, atau derek resmi ke bengkel.\n\n" .
                    "📍 **Hubungi Hotline Darurat Sekarang:** **0812-8834-7777**\n" .
                    "Anda dapat langsung mengklik tombol **📍 Share Loc Titik Darurat** di bawah untuk menandai dan mengirimkan posisi GPS akurat kendaraan Anda.";
                $quickReplies = ['Share Loc Titik Darurat', 'Hubungi Hotline Darurat', 'Konsultasi Kendala'];
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
                "👉 **Agar Service Advisor kami dapat segera menghitungkan estimasi biaya & membantu klaim asuransi Anda:** Boleh dibantu ceritakan bagian mana yang rusak/baret (apakah lewat asuransi atau mandiri) serta cantumkan **Nama & Nomor WhatsApp aktif Anda**?";
            $quickReplies = ['Klaim Asuransi Mobil', 'Express Body Paint 1 Hari', 'Estimasi Biaya Per Panel'];
        }
        // 3. Booking Servis
        elseif (str_contains($lastUserMsg, 'booking') || str_contains($lastUserMsg, 'servis') || str_contains($lastUserMsg, 'service') || str_contains($lastUserMsg, 'bengkel') || str_contains($lastUserMsg, 'jadwal')) {
            $reply = "🔧 **RESERVASI BENGKEL RESMI MITSUBISHI SUN MARGAHAYU**\n\n" .
                "Bengkel resmi kami melayani perawatan berkala, tune-up, uji rem, spooring-balancing, dan servis AC dengan teknisi bersertifikasi MMKSI.\n\n" .
                "• **Jam Operasional:** Senin–Jumat 08:00–16:30 WIB | Sabtu 08:00–15:00 WIB\n" .
                "• **Slot Jam Booking:** 08:00, 09:00, 10:00, 11:00, 13:00 WIB\n" .
                "• **Fasilitas Pengunjung:** Voucher Noah Coffee gratis, Kids Zone playground, WFA Wi-Fi 6, dan Free Shuttle Service.\n\n" .
                "👉 **Agar jadwal servis langsung kami kunci di sistem bengkel:** Boleh dibantu informasikan **Nomor Polisi (Nopol)**, **jenis servis (KM berapa)**, rencana **hari & jam kedatangan**, serta **Nomor WhatsApp aktif Anda**?";
            $quickReplies = ['Booking Servis Rutin', 'Tanya Estimasi Biaya KM', 'Fasilitas Ruang Tunggu'];
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
                "👉 **Agar konsultan kami dapat menghitungkan diskon OTR promo terbaik & mengirim tabel simulasi angsuran resminya:** Boleh sebutkan **model spesifik yang diminati** serta **Nama & Nomor WhatsApp aktif Anda**?";
            $quickReplies = ['Simulasi Kredit Destinator', 'Simulasi Kredit Xforce', 'Simulasi Kredit Pajero'];
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
                "👉 **Boleh dibantu sebutkan unit yang ingin Anda coba, rencana hari/jam, serta Nama Lengkap & Nomor WhatsApp aktif Anda** agar armada test drive langsung kami siapkan?";
            $quickReplies = ['Test Drive Destinator', 'Test Drive Xforce', 'Test Drive Pajero Sport'];
        }
        // 6. Sparepart & Aksesoris
        elseif (str_contains($lastUserMsg, 'sparepart') || str_contains($lastUserMsg, 'suku cadang') || str_contains($lastUserMsg, 'oli') || str_contains($lastUserMsg, 'aksesoris') || str_contains($lastUserMsg, 'part') || str_contains($lastUserMsg, 'filter')) {
            $reply = "⚙️ **SUKU CADANG & AKSESORIS ORISINAL (MITSUBISHI GENUINE PARTS)**\n\n" .
                "Seluruh suku cadang dan pelumas di Bengkel Sun Margahayu dijamin 100% Original Equipment Manufacturer (OEM) berbarcode resmi MMKSI dengan garansi:\n" .
                "• **Pelumas Mesin MMGO (Mitsubishi Motors Genuine Oil):** Formula khusus mesin bensin & diesel common rail.\n" .
                "• **Fast Moving Parts:** Filter oli, filter kabin AC, kampas rem, busi, dan fan belt selalu ready stock.\n" .
                "• **Paket Aksesoris Resmi:** Aero Package, Interior/Exterior dress-up kit (lebih hemat hingga jutaan rupiah dibanding beli satuan).\n\n" .
                "👉 **Agar tim suku cadang kami dapat memeriksa ketersediaan stok fisik & rincian harganya:** Boleh sebutkan **tipe mobil / nomor part yang dicari** serta **Nomor WhatsApp aktif Anda**?";
            $quickReplies = ['Cek Harga Oli MMGO', 'Cek Filter Kabin AC', 'Paket Aksesoris Xforce'];
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
            $quickReplies = ['Keluhan Layanan Servis', 'Keluhan Penjualan / Sales', 'Hubungi CSM via WhatsApp'];
        }
        // 8. Rekening Resmi & Legalitas
        elseif (str_contains($lastUserMsg, 'rekening') || str_contains($lastUserMsg, 'transfer') || str_contains($lastUserMsg, 'penipuan') || str_contains($lastUserMsg, 'bca')) {
            $reply = "🛡️ **REKENING RESMI & PERLINDUNGAN TRANSAKSI KONSUMEN**\n\n" .
                "Untuk keamanan seluruh konsumen, PT Sun Star Prima Motor menegaskan bahwa seluruh transaksi resmi pemesanan (SPK), DP, pelunasan kendaraan, servis, maupun suku cadang HANYA sah ke:\n\n" .
                "🏦 **Bank:** BCA (Bank Central Asia)\n" .
                "🔢 **Nomor Rekening:** **3425419999**\n" .
                "👤 **Atas Nama:** **PT SUN STAR PRIMA MOTOR**\n\n" .
                "⛔ *Dilarang keras mentransfer dana ke rekening pribadi sales atau karyawan manapun!* Bukti setor resmi dealer akan diterbitkan langsung.";
            $quickReplies = ['Konfirmasi Pembayaran SPK', 'Hubungi Sales Resmi', 'Tanya Promo OTR'];
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
                "👉 **Agar Sunny dan tim konsultan resmi dealer kami dapat memberikan bantuan yang tepat sasaran:** Boleh ceritakan **kebutuhan spesifik Anda** (unit baru apa / servis bengkel / body paint) serta cantumkan **Nama & Nomor WhatsApp aktif Anda**?";
            $quickReplies = ['Info Harga & Promo OTR', 'Booking Servis Bengkel', 'Fasilitas Body & Paint'];
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
