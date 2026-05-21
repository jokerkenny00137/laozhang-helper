<?php
/**
 * 腾讯元器 API 代理
 * 解决前端跨域问题
 */

// 允许跨域请求
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只允许 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => '仅支持 POST 请求']);
    exit;
}

// 获取请求体
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => '无效的请求数据']);
    exit;
}

// 从请求中获取配置，或使用本地配置
$assistantId = $data['assistant_id'] ?? '';
$userId = $data['user_id'] ?? '';
$messages = $data['messages'] ?? [];
$stream = $data['stream'] ?? false;

// 加载本地配置（包含敏感信息）
$configFile = __DIR__ . '/config.local.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => '服务器配置错误：未找到本地配置文件']);
    exit;
}

$localConfig = require $configFile;
$appKey = $localConfig['yuanqi_app_key'] ?? '';

if (empty($appKey)) {
    http_response_code(500);
    echo json_encode(['error' => '服务器配置错误：未配置腾讯元器 AppKey']);
    exit;
}

// 调用腾讯元器 API
$apiUrl = 'https://open.hunyuan.tencent.com/openapi/v1/agent/chat/completions';

$requestBody = [
    'assistant_id' => $assistantId,
    'user_id' => $userId,
    'stream' => $stream,
    'messages' => $messages
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $appKey,
    'X-Source: openapi'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'API 请求失败: ' . $error]);
    exit;
}

// 返回 API 响应
http_response_code($httpCode);
echo $response;
