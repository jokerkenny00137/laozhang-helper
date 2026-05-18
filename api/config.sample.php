<?php
/**
 * API 配置文件模板
 * 使用方法：
 * 1. 复制此文件为 config.local.php
 * 2. 填入你的真实配置值
 * 3. 确保 config.local.php 已被添加到 .gitignore 中
 */

return [
    // 鉴权 Token - 建议修改为随机强密码
    // 生成方法：openssl rand -base64 32
    'auth_token' => 'your-random-token-here',
    
    // 其他配置项...
    'upload_max_size' => 10 * 1024 * 1024, // 10MB
    'allowed_image_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'allowed_audio_types' => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
];
