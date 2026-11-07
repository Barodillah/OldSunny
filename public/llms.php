<?php
/**
 * Dynamic LLM Knowledge Endpoint (llms.txt & llms-full.txt)
 * Fetches real-time data from MySQL database (with JSON fallback) and syncs physical files.
 */

require_once __DIR__ . '/seo-db-provider.php';

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['SERVER_PORT'] ?? 80) == 443)
    || (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || (($_SERVER['HTTP_HOST'] ?? 'cssunmotor.com') === 'cssunmotor.com');
$protocol = $isHttps ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'cssunmotor.com';
$baseUrl = $protocol . '://' . $host;

$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$cliMode = $argv[1] ?? '';
$mode = 'summary';

if (
    $cliMode === 'full'
    || (isset($_GET['mode']) && strtolower((string)$_GET['mode']) === 'full')
    || stripos($requestUri, 'llms-full') !== false
) {
    $mode = 'full';
}

$ctx = sunnyLoadDynamicDatabaseContext();

// Sync both physical files if CLI mode is 'sync' or sync current requested mode file
if ($cliMode === 'sync') {
    $summaryContent = sunnyGenerateDynamicLlmsMarkdown($ctx, 'summary', 'https://cssunmotor.com');
    $fullContent = sunnyGenerateDynamicLlmsMarkdown($ctx, 'full', 'https://cssunmotor.com');
    @file_put_contents(__DIR__ . '/llms.txt', $summaryContent);
    @file_put_contents(__DIR__ . '/llms-full.txt', $fullContent);
    echo "Synced llms.txt (" . strlen($summaryContent) . " bytes) and llms-full.txt (" . strlen($fullContent) . " bytes) from DB.\n";
    exit(0);
}

$markdown = sunnyGenerateDynamicLlmsMarkdown($ctx, $mode, $baseUrl);

// Best-effort background sync of the physical file on disk
$targetFile = $mode === 'full' ? (__DIR__ . '/llms-full.txt') : (__DIR__ . '/llms.txt');
if (is_writable(__DIR__) || (file_exists($targetFile) && is_writable($targetFile))) {
    @file_put_contents($targetFile, $markdown);
}

if (php_sapi_name() !== 'cli') {
    header('Content-Type: text/plain; charset=UTF-8');
    header('Cache-Control: public, max-age=300, s-maxage=300');
    header('X-Data-Source: dynamic-mysql');
}

echo $markdown;

