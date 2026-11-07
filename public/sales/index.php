<?php
/**
 * Directory Fallback Router for /sales
 * Prevents Apache/LiteSpeed from returning 403 Forbidden on the physical /sales/ image folder
 * by delegating route requests (/sales and /sales/) directly to the root SPA index.php.
 */
require dirname(__DIR__) . '/index.php';

