<?php
/**
 * 老张工艺助手 - 服务器配置API
 * 用于存储和读取管理员设置
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$configFile = __DIR__ . '/config.json';

// 获取配置
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($configFile)) {
        $content = file_get_contents($configFile);
        echo $content;
    } else {
        echo json_encode(['error' => 'Config file not found']);
    }
    exit;
}

// 辅助函数：获取 Authorization Header（兼容各种 PHP 运行模式）
function getAuthHeader() {
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            return $headers['Authorization'];
        }
    }
    // 从 $_SERVER 获取（适用于 CGI/FPM 模式）
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    return '';
}

// 加载本地配置文件（安全存储敏感信息）
function loadLocalConfig() {
    $localConfigFile = __DIR__ . '/config.local.php';
    if (file_exists($localConfigFile)) {
        return require $localConfigFile;
    }
    // 如果本地配置不存在，返回空数组
    return [];
}

// 保存配置（需要简单鉴权）
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 简单鉴权：检查管理员token
    $authHeader = getAuthHeader();
    
    // 从本地配置文件加载鉴权 Token
    $localConfig = loadLocalConfig();
    $validToken = isset($localConfig['auth_token']) ? 'Bearer ' . $localConfig['auth_token'] : '';
    
    // 如果未配置本地 Token，则拒绝请求（为了安全，不再使用硬编码默认值）
    if (empty($validToken)) {
        http_response_code(500);
        echo json_encode(['error' => 'Server configuration error: auth token not configured']);
        exit;
    }
    
    if ($authHeader !== $validToken) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    
    // 读取现有配置
    $config = [];
    if (file_exists($configFile)) {
        $config = json_decode(file_get_contents($configFile), true);
    }
    
    // 合并新配置
    $config = array_merge($config, $input);
    $config['updatedAt'] = date('Y-m-d\TH:i:s.v\Z');
    
    // 保存到文件
    if (file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => 'Config saved']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save config']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
