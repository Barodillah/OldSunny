<?php
/**
 * Dynamic SEO & FAQ JSON Endpoint for SPA Client Hydration
 * Serves live database-backed FAQs by route and Vehicle Catalog ItemList schema.
 */

require_once __DIR__ . '/seo-db-provider.php';

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Cache-Control: public, max-age=180, s-maxage=180');

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['SERVER_PORT'] ?? 80) == 443)
    || (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || (($_SERVER['HTTP_HOST'] ?? 'cssunmotor.com') === 'cssunmotor.com');
$protocol = $isHttps ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'cssunmotor.com';
$baseUrl = $protocol . '://' . $host;

$ctx = sunnyLoadDynamicDatabaseContext();
sunnySyncPhysicalLlmsFiles($ctx, 'https://cssunmotor.com');
$faqsByRoute = sunnyBuildDynamicFaqsByRoute($ctx);
$vehicleCatalogSchema = sunnyBuildVehicleCatalogSchema($ctx, $baseUrl);

echo json_encode([
    'success' => true,
    'generated_at' => $ctx['generated_at'],
    'faqs_by_route' => $faqsByRoute,
    'vehicle_catalog_schema' => $vehicleCatalogSchema,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
