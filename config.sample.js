/**
 * 配置文件模板
 * 使用方法：
 * 1. 复制此文件为 config.js
 * 2. 填入你的真实配置值
 * 3. 确保 config.js 已被添加到 .gitignore 中
 */

const AppConfig = {
  // ==================== 后端 API 鉴权 Token ====================
  // 用于文件上传等需要鉴权的接口
  // 建议修改为随机强密码，如：使用 openssl rand -base64 32 生成
  AUTH_TOKEN: 'your-random-token-here',

  // ==================== 腾讯元器配置（如使用 API 模式）====================
  // 注意：API 模式会暴露密钥，建议使用 iframe 嵌入模式
  YUANQI: {
    // API 端点地址
    API_URL: 'https://open.hunyuan.tencent.com/openapi/v1/agent/chat/completions',
    
    // AppKey - 从腾讯元器控制台获取
    // ⚠️ 警告：不要将此密钥提交到公开仓库！
    APP_KEY: 'your-app-key-here',
    
    // 助手 ID
    ASSISTANT_ID: 'your-assistant-id-here',
    
    // 用户 ID
    USER_ID: 'your-user-id-here'
  },

  // ==================== 默认 iframe 嵌入地址 ====================
  // 腾讯元器 iframe 嵌入 URL
  DEFAULT_IFRAME_URL: 'https://yuanqi.tencent.com/webim/#/chat/your-chat-id?appid=your-app-id&experience=true'
};

// 导出配置（用于模块化环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}
