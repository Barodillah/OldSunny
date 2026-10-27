<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KnowledgeItem;

class KnowledgeController extends Controller
{
    /**
     * Normalize key (e.g. price-list -> price_list)
     */
    protected function normalizeKey(string $key): string
    {
        $k = str_replace('-', '_', strtolower(trim($key)));
        if ($k === 'aksesoris') {
            return 'accessories';
        }
        if ($k === 'spare_part' || $k === 'spareparts' || $k === 'spare_parts') {
            return 'sparepart';
        }
        return $k;
    }

    /**
     * Get knowledge item by key
     */
    public function show(Request $request, string $key)
    {
        $normalizedKey = $this->normalizeKey($key);

        $keysToSearch = [$normalizedKey];
        if ($normalizedKey === 'accessories') {
            $keysToSearch[] = 'aksesoris';
        }
        if ($normalizedKey === 'sparepart') {
            $keysToSearch[] = 'spare_part';
            $keysToSearch[] = 'spareparts';
        }

        $item = KnowledgeItem::whereIn('key', $keysToSearch)->first();

        // If not found in DB yet, attempt to seed from file
        if (!$item) {
            $item = $this->seedDefaultKnowledge($normalizedKey);
        }

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => "Knowledge dengan kunci '{$key}' belum tersedia."
            ], 404);
        }

        $payload = is_array($item->payload) ? $item->payload : json_decode($item->payload, true);
        $metadata = is_array($item->metadata) ? $item->metadata : json_decode($item->metadata, true);

        // Ensure featured_models is accessible at root level
        if ($normalizedKey === 'price_list') {
            $featured = $payload['featured_models'] ?? ($metadata['featured_models'] ?? ['new_xforce', 'destinator', 'new_xpander_cross']);
            $payload['featured_models'] = $featured;
        }

        return response()->json([
            'success' => true,
            'key' => $item->key,
            'title' => $item->title,
            'category' => $item->category,
            'data' => $payload,
            'metadata' => $metadata,
            'updated_at' => $item->updated_at?->toISOString() ?? now()->toISOString(),
            'updated_by' => $item->updated_by ?? 'System'
        ]);
    }

    /**
     * Update knowledge item
     */
    public function update(Request $request, string $key)
    {
        $normalizedKey = $this->normalizeKey($key);
        $payload = $request->input('data') ?: ($request->input('payload') ?: $request->all());

        if (empty($payload) || !is_array($payload)) {
            return response()->json([
                'success' => false,
                'message' => 'Format payload data knowledge tidak valid.'
            ], 422);
        }

        // Khusus price_list: validasi model favorit harus dipilih 3
        if ($normalizedKey === 'price_list') {
            $featured = $request->input('featured_models');
            if (empty($featured)) {
                $featured = $payload['featured_models'] ?? ($payload['meta']['featured_models'] ?? []);
            }

            if (!is_array($featured) || count($featured) !== 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Khusus model favorit harus dipilih tepat 3 model.'
                ], 422);
            }

            // Validasi apakah 3 model tersebut valid ada di passenger_car
            $passengerKeys = array_keys($payload['passenger_car'] ?? []);
            foreach ($featured as $mKey) {
                if (!in_array($mKey, $passengerKeys, true)) {
                    return response()->json([
                        'success' => false,
                        'message' => "Model favorit '{$mKey}' tidak ditemukan dalam daftar mobil penumpang."
                    ], 422);
                }
            }

            // Sync featured_models into payload and metadata
            $payload['featured_models'] = array_values($featured);
            if (isset($payload['meta']) && is_array($payload['meta'])) {
                $payload['meta']['featured_models'] = array_values($featured);
            }
        }

        $periode = $payload['meta']['periode'] ?? date('F Y');
        $updatedBy = $request->input('updated_by', 'Admin Portal Margahayu');

        $metadata = [
            'periode' => $periode,
            'featured_models' => $payload['featured_models'] ?? [],
            'brand' => $payload['meta']['brand'] ?? 'Mitsubishi',
            'last_sync' => now()->toISOString()
        ];

        $item = KnowledgeItem::updateOrCreate(
            ['key' => $normalizedKey],
            [
                'title' => $request->input('title', $normalizedKey === 'price_list' ? 'Price List Kendaraan Mitsubishi Motors' : ucfirst(str_replace('_', ' ', $normalizedKey))),
                'category' => $request->input('category', $normalizedKey === 'price_list' ? 'sales' : 'general'),
                'payload' => $payload,
                'metadata' => $metadata,
                'is_active' => true,
                'updated_by' => $updatedBy
            ]
        );

        // Sync to filesystem for resilience and Sunny AI knowledge fallback
        $this->syncToFileSystem($normalizedKey, $payload);

        return response()->json([
            'success' => true,
            'message' => 'Data OTR dan knowledge berhasil diperbarui secara dinamis.',
            'key' => $item->key,
            'title' => $item->title,
            'data' => $payload,
            'metadata' => $metadata,
            'updated_at' => $item->updated_at->toISOString(),
            'updated_by' => $item->updated_by
        ]);
    }

    /**
     * Reset knowledge item back to file defaults
     */
    public function reset(Request $request, string $key)
    {
        $normalizedKey = $this->normalizeKey($key);
        $item = KnowledgeItem::where('key', $normalizedKey)->first();

        if ($item) {
            $item->delete();
        }

        $newItem = $this->seedDefaultKnowledge($normalizedKey);

        if (!$newItem) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset data default.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data knowledge berhasil direset ke pengaturan awal.',
            'data' => $newItem->payload
        ]);
    }

    /**
     * Seed initial knowledge item from repository JSON files
     */
    protected function seedDefaultKnowledge(string $key): ?KnowledgeItem
    {
        if ($key === 'price_list') {
            $paths = [
                base_path('../vehicle-list.json'),
                base_path('../knowledge/price_list.json'),
            ];

            $content = null;
            foreach ($paths as $p) {
                if (file_exists($p)) {
                    $content = file_get_contents($p);
                    break;
                }
            }

            if ($content) {
                $payload = json_decode($content, true);
                if ($payload) {
                    $featured = ['new_xforce', 'destinator', 'new_xpander_cross'];
                    $payload['featured_models'] = $featured;
                    if (isset($payload['meta']) && is_array($payload['meta'])) {
                        $payload['meta']['featured_models'] = $featured;
                    }

                    return KnowledgeItem::create([
                        'key' => 'price_list',
                        'title' => 'Price List Kendaraan Mitsubishi Motors',
                        'category' => 'sales',
                        'payload' => $payload,
                        'metadata' => [
                            'periode' => $payload['meta']['periode'] ?? 'Oktober 2026',
                            'brand' => 'Mitsubishi',
                            'featured_models' => $featured
                        ],
                        'is_active' => true,
                        'updated_by' => 'System Seed'
                    ]);
                }
            }
        }

        if ($key === 'accessories' || $key === 'aksesoris') {
            $paths = [
                base_path('../knowledge/aksesoris.json'),
                base_path('../aksesoris.json'),
            ];

            $content = null;
            foreach ($paths as $p) {
                if (file_exists($p)) {
                    $content = file_get_contents($p);
                    break;
                }
            }

            if ($content) {
                $payload = json_decode($content, true);
                if ($payload) {
                    $acc = $payload['mitsubishi_accessories'] ?? $payload;
                    return KnowledgeItem::create([
                        'key' => 'accessories',
                        'title' => 'Katalog Aksesoris Resmi Mitsubishi Motors (Genuine Accessories)',
                        'category' => 'parts_accessories',
                        'payload' => $payload,
                        'metadata' => [
                            'brand' => 'Mitsubishi Motors',
                            'total_models' => count($acc),
                            'last_sync' => now()->toISOString()
                        ],
                        'is_active' => true,
                        'updated_by' => 'System Seed'
                    ]);
                }
            }
        }

        if ($key === 'sparepart' || $key === 'spare_part') {
            $paths = [
                base_path('../knowledge/sparepart.json'),
                base_path('../sparepart.json'),
            ];

            $content = null;
            foreach ($paths as $p) {
                if (file_exists($p)) {
                    $content = file_get_contents($p);
                    break;
                }
            }

            if ($content) {
                $payload = json_decode($content, true);
                if ($payload) {
                    $totalParts = count($payload['spare_parts'] ?? []);
                    return KnowledgeItem::create([
                        'key' => 'sparepart',
                        'title' => 'Master Data Spare Part Fast Moving Mitsubishi MMKSI',
                        'category' => 'parts_accessories',
                        'payload' => $payload,
                        'metadata' => [
                            'brand' => 'Mitsubishi Motors',
                            'total_parts' => $totalParts,
                            'last_sync' => now()->toISOString()
                        ],
                        'is_active' => true,
                        'updated_by' => 'System Seed'
                    ]);
                }
            }
        }

        return null;
    }

    /**
     * Synchronize DB payload to local JSON files if writable
     */
    protected function syncToFileSystem(string $key, array $payload): void
    {
        if ($key === 'price_list') {
            $targetFiles = [
                base_path('../vehicle-list.json'),
                base_path('../knowledge/price_list.json')
            ];

            $jsonString = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            foreach ($targetFiles as $file) {
                try {
                    if (file_exists($file) || is_writable(dirname($file))) {
                        file_put_contents($file, $jsonString);
                    }
                } catch (\Throwable $e) {
                    // Non-fatal, DB is the primary source
                }
            }
        }

        if ($key === 'accessories' || $key === 'aksesoris') {
            $targetFiles = [
                base_path('../knowledge/aksesoris.json'),
                base_path('../aksesoris.json')
            ];

            $jsonString = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            foreach ($targetFiles as $file) {
                try {
                    if (file_exists($file) || is_writable(dirname($file))) {
                        file_put_contents($file, $jsonString);
                    }
                } catch (\Throwable $e) {
                    // Non-fatal
                }
            }
        }

        if ($key === 'sparepart' || $key === 'spare_part') {
            $targetFiles = [
                base_path('../knowledge/sparepart.json'),
                base_path('../sparepart.json')
            ];

            $jsonString = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            foreach ($targetFiles as $file) {
                try {
                    if (file_exists($file) || is_writable(dirname($file))) {
                        file_put_contents($file, $jsonString);
                    }
                } catch (\Throwable $e) {
                    // Non-fatal
                }
            }
        }
    }
}
