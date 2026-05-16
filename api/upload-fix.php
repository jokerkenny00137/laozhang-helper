<?php
/**
 * 文件上传API
 * 保存背景图、介绍页图片和音频到服务器
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 简单鉴权
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
if ($authHeader !== 'Bearer laozhang2024') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// 创建上传目录
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// 检查文件
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$maxSize = 10 * 1024 * 1024; // 10MB

// 通过文件扩展名验证类型
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp3', 'wav', 'ogg', 'm4a', 'aac'];

if (!in_array($ext, $allowedExts)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Allowed: Images (JPG, PNG, GIF, WebP) and Audio (MP3, WAV, OGG, M4A, AAC)']);
    exit;
}

// 验证文件大小
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Max: 10MB']);
    exit;
}

// 生成文件名
$filename = uniqid() . '_' . time() . '.' . $ext;
$filepath = $uploadDir . $filename;

// 移动文件
if (move_uploaded_file($file['tmp_name'], $filepath)) {
    // 返回相对路径
    $url = './api/uploads/' . $filename;
    echo json_encode([
        'success' => true,
        'url' => $url,
        'filename' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
}
