<?php
/**
 * PHP-прокси для Node.js бэкенда.
 * Все запросы (кроме существующих статических файлов) перенаправляются сюда через .htaccess.
 */

$backendUrl = 'http://127.0.0.1:3000';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$target = $backendUrl . $requestUri;

$ch = curl_init($target);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HTTPHEADER => [],
]);

// Метод
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $body = file_get_contents('php://input');
    if ($body !== '') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
}

// Заголовки
$headers = [];
foreach (getallheaders() as $key => $value) {
    $lower = strtolower($key);
    if ($lower === 'host') {
        continue;
    }
    if ($lower === 'content-length' || $lower === 'transfer-encoding') {
        continue;
    }
    $headers[] = "$key: $value";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    echo 'Bad Gateway: ' . curl_error($ch);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$rawHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

http_response_code($httpCode);

foreach (explode("\r\n", $rawHeaders) as $line) {
    $lower = strtolower($line);
    if (str_starts_with($line, 'HTTP/')) {
        continue;
    }
    if (str_starts_with($lower, 'transfer-encoding:')) {
        continue;
    }
    if (str_starts_with($lower, 'content-length:')) {
        continue;
    }
    if (trim($line) === '') {
        continue;
    }
    header($line);
}

echo $body;
curl_close($ch);
