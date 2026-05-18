# 安全部署指南

## ⚠️ 重要提醒

本项目已从代码中移除了所有硬编码的敏感信息（API 密钥、Token 等）。**在部署前必须完成以下配置步骤**，否则部分功能将无法正常工作。

---

## 🔧 部署前配置

### 1. 前端配置（config.js）

```bash
# 复制配置文件模板
cp config.sample.js config.js
```

编辑 `config.js`，填入你的真实配置：

```javascript
const AppConfig = {
  // 后端 API 鉴权 Token（用于文件上传）
  // 生成方法：openssl rand -base64 32
  AUTH_TOKEN: 'your-random-token-here',

  // 腾讯元器配置（可选，仅 API 模式需要）
  YUANQI: {
    API_URL: 'https://open.hunyuan.tencent.com/openapi/v1/agent/chat/completions',
    APP_KEY: 'your-app-key-from-tencent-yuanqi',
    ASSISTANT_ID: 'your-assistant-id',
    USER_ID: 'your-user-id'
  },

  // 默认 iframe 嵌入地址（iframe 模式必需）
  DEFAULT_IFRAME_URL: 'https://yuanqi.tencent.com/webim/#/chat/your-chat-id?appid=your-app-id&experience=true'
};
```

**注意**：`config.js` 已添加到 `.gitignore`，不会被提交到 Git 仓库。

---

### 2. 后端配置（api/config.local.php）

```bash
# 复制配置文件模板
cp api/config.sample.php api/config.local.php
```

编辑 `api/config.local.php`，填入与前端相同的 Token：

```php
<?php
return [
    // 必须与 config.js 中的 AUTH_TOKEN 一致
    'auth_token' => 'your-random-token-here',
    
    'upload_max_size' => 10 * 1024 * 1024,
    'allowed_image_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'allowed_audio_types' => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
];
```

**注意**：`api/config.local.php` 已添加到 `.gitignore`，不会被提交到 Git 仓库。

---

### 3. 在 HTML 中引入 config.js

确保在所有页面中引入配置文件（在 `chat.js` 和 `admin.js` 之前）：

```html
<!-- 在 <head> 或页面底部添加 -->
<script src="config.js"></script>
<script>
  // 将配置暴露给全局变量
  window.appConfig = AppConfig;
</script>
```

---

## 🔒 生成安全 Token

### Linux / macOS
```bash
openssl rand -base64 32
```

### Windows (PowerShell)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % { [char]$_ })
```

### 在线工具
- https://randomkeygen.com/
- https://www.grc.com/passwords.htm

---

## 🚀 部署后验证

1. **测试 iframe 模式**
   - 访问首页
   - 检查对话窗口是否正常加载腾讯元器

2. **测试文件上传**
   - 登录后台
   - 尝试上传背景图片或音频
   - 检查是否正常保存

3. **测试 API 模式（可选）**
   - 在后台切换为 API 模式
   - 测试对话功能

---

## ⚠️ 安全注意事项

1. **永远不要将 `config.js` 或 `config.local.php` 提交到 Git 仓库**
2. **定期更换鉴权 Token**
3. **使用 HTTPS 部署，防止 Token 被中间人窃取**
4. **限制文件上传类型和大小**
5. **API 模式会暴露密钥，建议使用 iframe 嵌入模式**

---

## 🐛 故障排除

### 文件上传失败，提示 "未配置鉴权 Token"
- 检查 `config.js` 是否正确创建并引入
- 检查 `config.js` 和 `config.local.php` 中的 Token 是否一致

### iframe 模式显示空白
- 检查 `DEFAULT_IFRAME_URL` 是否正确配置
- 确认腾讯元器嵌入地址有效

### API 模式无法连接
- 检查 `YUANQI.APP_KEY` 是否正确
- 确认腾讯元器控制台中已开启 API 调用权限

---

## 📞 需要帮助？

如有问题，请提交 [Issue](https://github.com/jokerkenny00137/laozhang-helper/issues)。
