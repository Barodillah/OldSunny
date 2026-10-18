<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\ChatSession;
use App\Models\ChatMessage;

class ChatSessionTracker
{
    /**
     * Get or create a chat session with full device, IP, and location metadata
     */
    public function recordSession(string $sessionId, Request $request, ?array $clientInfo = []): ChatSession
    {
        $ip = $this->getClientIp($request);
        $userAgent = $request->userAgent() ?? ($clientInfo['user_agent'] ?? 'Unknown');

        // Parse device, browser, and OS
        $parsed = $this->parseUserAgent($userAgent, $clientInfo);

        // Resolve location (City, Region, Country, ISP, Lat, Long)
        $location = $this->resolveLocation($ip, $clientInfo);

        $session = ChatSession::where('session_id', $sessionId)->first();

        if (!$session) {
            $session = ChatSession::create([
                'session_id' => $sessionId,
                'customer_name' => $clientInfo['customer_name'] ?? null,
                'customer_phone' => $clientInfo['customer_phone'] ?? null,
                'customer_nopol' => $clientInfo['customer_nopol'] ?? null,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'device_type' => $clientInfo['device_type'] ?? $parsed['device_type'],
                'browser' => $clientInfo['browser'] ?? $parsed['browser'],
                'browser_version' => $clientInfo['browser_version'] ?? $parsed['browser_version'],
                'os' => $clientInfo['os'] ?? $parsed['os'],
                'screen_resolution' => $clientInfo['screen_resolution'] ?? null,
                'language' => $clientInfo['language'] ?? ($request->header('Accept-Language') ? substr($request->header('Accept-Language'), 0, 10) : 'id-ID'),
                'timezone' => $clientInfo['timezone'] ?? 'Asia/Jakarta',
                'city' => $location['city'],
                'region' => $location['region'],
                'country' => $location['country'],
                'country_code' => $location['country_code'],
                'latitude' => $location['latitude'],
                'longitude' => $location['longitude'],
                'isp' => $location['isp'],
                'status' => 'active',
                'messages_count' => 0,
                'last_activity_at' => now(),
            ]);
        } else {
            // Update activity & any new customer data
            $updates = [
                'last_activity_at' => now(),
            ];

            if (!empty($clientInfo['customer_name']) && empty($session->customer_name)) {
                $updates['customer_name'] = $clientInfo['customer_name'];
            }
            if (!empty($clientInfo['customer_phone']) && empty($session->customer_phone)) {
                $updates['customer_phone'] = $clientInfo['customer_phone'];
            }
            if (!empty($clientInfo['customer_nopol']) && empty($session->customer_nopol)) {
                $updates['customer_nopol'] = $clientInfo['customer_nopol'];
            }

            $session->update($updates);
        }

        return $session;
    }

    /**
     * Record a chat message associated with the session
     */
    public function recordMessage(string $sessionId, string $senderType, string $message, ?array $quickReplies = null, ?array $actionTags = null, ?array $metadata = null): ChatMessage
    {
        $chatMsg = ChatMessage::create([
            'session_id' => $sessionId,
            'sender_type' => $senderType,
            'message' => $message,
            'quick_replies' => $quickReplies,
            'action_tags' => $actionTags,
            'metadata' => $metadata,
        ]);

        ChatSession::where('session_id', $sessionId)->increment('messages_count');
        ChatSession::where('session_id', $sessionId)->update(['last_activity_at' => now()]);

        return $chatMsg;
    }

    /**
     * Resolve true client IP
     */
    protected function getClientIp(Request $request): string
    {
        $headers = [
            'CF-Connecting-IP',
            'X-Forwarded-For',
            'X-Real-IP',
        ];

        foreach ($headers as $header) {
            $val = $request->header($header);
            if (!empty($val)) {
                // If comma-separated, take the first one
                $ips = explode(',', $val);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return $request->ip() ?: '127.0.0.1';
    }

    /**
     * Parse User Agent into device, browser, and OS
     */
    protected function parseUserAgent(string $ua, array $clientInfo): array
    {
        $deviceType = 'desktop';
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $ua)) {
            $deviceType = 'tablet';
        } elseif (preg_match('/(android|iphone|ipod|blackberry|windows phone|mobile)/i', $ua)) {
            $deviceType = 'mobile';
        }

        // Browser
        $browser = 'Unknown';
        $browserVersion = null;
        if (preg_match('/Edg\/([0-9.]+)/i', $ua, $matches)) {
            $browser = 'Microsoft Edge';
            $browserVersion = $matches[1];
        } elseif (preg_match('/Chrome\/([0-9.]+)/i', $ua, $matches)) {
            $browser = 'Google Chrome';
            $browserVersion = $matches[1];
        } elseif (preg_match('/Safari\/([0-9.]+)/i', $ua, $matches) && !str_contains($ua, 'Chrome')) {
            $browser = 'Safari';
            $browserVersion = $matches[1];
        } elseif (preg_match('/Firefox\/([0-9.]+)/i', $ua, $matches)) {
            $browser = 'Mozilla Firefox';
            $browserVersion = $matches[1];
        } elseif (preg_match('/OPR\/([0-9.]+)/i', $ua, $matches) || preg_match('/Opera\/([0-9.]+)/i', $ua, $matches)) {
            $browser = 'Opera';
            $browserVersion = $matches[1];
        }

        // OS
        $os = 'Unknown OS';
        if (preg_match('/windows nt 10/i', $ua)) {
            $os = 'Windows 10/11';
        } elseif (preg_match('/windows nt 6.3/i', $ua)) {
            $os = 'Windows 8.1';
        } elseif (preg_match('/windows nt 6.1/i', $ua)) {
            $os = 'Windows 7';
        } elseif (preg_match('/macintosh|mac os x/i', $ua)) {
            $os = 'macOS';
        } elseif (preg_match('/android/i', $ua)) {
            $os = 'Android';
        } elseif (preg_match('/iphone|ipad|ipod/i', $ua)) {
            $os = 'iOS';
        } elseif (preg_match('/linux/i', $ua)) {
            $os = 'Linux';
        }

        return [
            'device_type' => $clientInfo['device_type'] ?? $deviceType,
            'browser' => $clientInfo['browser'] ?? $browser,
            'browser_version' => $clientInfo['browser_version'] ?? $browserVersion,
            'os' => $clientInfo['os'] ?? $os,
        ];
    }

    /**
     * Resolve geolocation information from IP address
     */
    protected function resolveLocation(string $ip, array $clientInfo): array
    {
        // If client provided coordinates directly (e.g. from GPS / HTML5 Geolocation)
        $clientLat = $clientInfo['latitude'] ?? null;
        $clientLng = $clientInfo['longitude'] ?? null;

        // Check if IP is localhost / private network
        $isPrivate = in_array($ip, ['127.0.0.1', '::1', 'localhost']) ||
            str_starts_with($ip, '192.168.') ||
            str_starts_with($ip, '10.') ||
            str_starts_with($ip, '172.16.') ||
            str_starts_with($ip, '172.31.');

        if ($isPrivate) {
            return [
                'city' => $clientInfo['city'] ?? 'Bekasi Timur',
                'region' => $clientInfo['region'] ?? 'Jawa Barat',
                'country' => $clientInfo['country'] ?? 'Indonesia',
                'country_code' => $clientInfo['country_code'] ?? 'ID',
                'latitude' => $clientLat ?: -6.2508468,
                'longitude' => $clientLng ?: 107.0245155,
                'isp' => 'Localhost / Internal Dealer Network',
            ];
        }

        // For public IPs, check cache first (cache for 24 hours per IP)
        $cacheKey = "geo_ip_" . md5($ip);
        return Cache::remember($cacheKey, 86400, function () use ($ip, $clientLat, $clientLng, $clientInfo) {
            try {
                // Free IP-API (json) endpoint with 1.8 second timeout
                $resp = Http::timeout(1.8)->get("http://ip-api.com/json/{$ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org");
                if ($resp->successful()) {
                    $data = $resp->json();
                    if (($data['status'] ?? '') === 'success') {
                        return [
                            'city' => $data['city'] ?? ($clientInfo['city'] ?? 'Unknown'),
                            'region' => $data['regionName'] ?? ($clientInfo['region'] ?? 'Unknown'),
                            'country' => $data['country'] ?? ($clientInfo['country'] ?? 'Indonesia'),
                            'country_code' => $data['countryCode'] ?? ($clientInfo['country_code'] ?? 'ID'),
                            'latitude' => $clientLat ?: ($data['lat'] ?? null),
                            'longitude' => $clientLng ?: ($data['lon'] ?? null),
                            'isp' => $data['isp'] ?? ($data['org'] ?? 'Unknown ISP'),
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::notice("GeoIP lookup failed for {$ip}: " . $e->getMessage());
            }

            return [
                'city' => $clientInfo['city'] ?? 'Bekasi Timur',
                'region' => $clientInfo['region'] ?? 'Jawa Barat',
                'country' => $clientInfo['country'] ?? 'Indonesia',
                'country_code' => $clientInfo['country_code'] ?? 'ID',
                'latitude' => $clientLat ?: -6.2508468,
                'longitude' => $clientLng ?: 107.0245155,
                'isp' => 'Internet Public',
            ];
        });
    }
}
