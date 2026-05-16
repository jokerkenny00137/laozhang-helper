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

// 保存配置（需要简单鉴权）
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 简单鉴权：检查管理员token
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // 默认token：laozhang2024（可在后台修改）
    if ($authHeader !== 'Bearer laozhang2024') {
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
