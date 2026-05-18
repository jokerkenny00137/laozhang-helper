<?php
/**
 * 图片上传API
 * 保存背景图和介绍页图片到服务器
 */

// 禁用错误输出，防止破坏JSON响应
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 加载本地配置文件
function loadLocalConfig() {
    $localConfigFile = __DIR__ . '/config.local.php';
    if (file_exists($localConfigFile)) {
        return require $localConfigFile;
    }
    return [];
}

// 辅助函数：获取 Authorization Header（兼容各种 PHP 运行模式）
function getAuthHeader() {
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            return $headers['Authorization'];
        }
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    return '';
}

// 简单鉴权（从本地配置文件加载 Token）
$localConfig = loadLocalConfig();
$validToken = isset($localConfig['auth_token']) ? 'Bearer ' . $localConfig['auth_token'] : '';

if (empty($validToken)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error: auth token not configured']);
    exit;
}

$authHeader = getAuthHeader();
if ($authHeader !== $validToken) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// 创建上传目录
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    if (!@mkdir($uploadDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit;
    }
}

// 确保目录可写
if (!is_writable($uploadDir)) {
    @chmod($uploadDir, 0777);
}

// 检查文件
if (!isset($_FILES['file'])) {
    $error = 'No file uploaded';
    if (empty($_POST) && isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > 0) {
        $error .= '. Possible cause: file exceeds server upload limit (PHP upload_max_filesize = ' . ini_get('upload_max_filesize') . ')';
    }
    http_response_code(400);
    echo json_encode(['error' => $error]);
    exit;
}

$file = $_FILES['file'];

// 检查上传错误
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds server limit',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds form limit',
        UPLOAD_ERR_PARTIAL => 'File partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temp folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file',
        UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
    ];
    http_response_code(400);
    echo json_encode(['error' => $errorMessages[$file['error']] ?? 'Upload error: ' . $file['error']]);
    exit;
}

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
if (@move_uploaded_file($file['tmp_name'], $filepath)) {
    // 返回相对路径（使用绝对路径URL）
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
    $url = $protocol . '://' . $host . '/api/uploads/' . $filename;
    
    echo json_encode([
        'success' => true,
        'url' => $url,
        'filename' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
}
