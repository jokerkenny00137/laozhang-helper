# 部署检查清单

## ✅ 部署前必做事项

### 1. 配置文件设置

- [ ] 复制 `config.sample.js` 为 `config.js`
- [ ] 在 `config.js` 中填入真实的 AUTH_TOKEN
- [ ] 复制 `api/config.sample.php` 为 `api/config.local.php`
- [ ] 在 `config.local.php` 中填入相同的 AUTH_TOKEN
- [ ] 配置腾讯元器 iframe URL（如使用 iframe 模式）
- [ ] 配置腾讯元器 API 密钥（如使用 API 模式）

### 2. 确认敏感信息已清理

- [ ] 代码中没有硬编码的 `Bearer laozhang2024`
- [ ] 代码中没有硬编码的腾讯元器 `appKey`
- [ ] 代码中没有硬编码的 `assistantId`
- [ ] 代码中没有硬编码的 `userId`
- [ ] `.gitignore` 中包含 `config.js` 和 `api/config.local.php`

### 3. 在 HTML 中引入配置

在所有使用 `chat.js` 或 `admin.js` 的 HTML 文件中添加：

```html
<script src="config.js"></script>
<script>window.appConfig = AppConfig;</script>
```

---

## 🚀 推送到 GitHub

```bash
# 添加所有文件
git add .

# 提交（注明是安全清理版本）
git commit -m "security: 清理敏感信息，改用配置文件管理

- 移除硬编码的 Bearer Token
- 移除硬编码的腾讯元器 API 密钥
- 添加 config.sample.js 和 config.sample.php 模板
- 添加 SECURITY.md 部署指南
- 更新 .gitignore 忽略敏感配置文件"

# 强制推送到 GitHub（覆盖旧版本）
git push -f origin main

# 推送标签
git push origin v1.0
```

---

## ⚠️ 重要：GitHub 仓库历史清理

由于之前的提交历史中可能包含敏感信息，建议执行以下操作之一：

### 方案 A：删除仓库重新创建（推荐，最安全）

1. 在 GitHub 上删除 `laozhang-helper` 仓库
2. 重新创建空仓库
3. 重新推送清理后的代码

```bash
git remote remove origin
git remote add origin https://github.com/jokerkenny00137/laozhang-helper.git
git push -u origin main
git push origin v1.0
```

### 方案 B：使用 git-filter-repo 清理历史

```bash
# 安装 git-filter-repo
pip install git-filter-repo

# 清理敏感信息
git filter-repo --replace-text <(echo 'laozhang2024==>REMOVED')
git filter-repo --replace-text <(echo 'oKmFAEybU7IkzqWmNbdTdyv4KMLifhYf==>REMOVED')

# 强制推送
git push -f origin main
```

---

## 🔒 腾讯元器安全建议

由于之前的密钥可能已泄露，建议：

1. **登录腾讯元器控制台**
2. **重新生成 AppKey**
3. **更新 `config.js` 中的配置**
4. **监控 API 调用情况**，检查是否有异常请求

---

## 📋 部署后验证

- [ ] 首页 iframe 模式正常显示
- [ ] 后台文件上传功能正常
- [ ] 登录功能正常
- [ ] 所有页面无报错

---

## 🐛 常见问题

**Q: 部署后文件上传提示 "未配置鉴权 Token"**
A: 检查 `config.js` 是否正确创建并引入到页面中

**Q: 部署后 iframe 显示空白**
A: 检查 `DEFAULT_IFRAME_URL` 是否配置正确

**Q: GitHub 上还能看到旧的敏感信息**
A: 需要清理 Git 历史或删除仓库重新创建
