# 老张工艺助手 - 智能体展示网站

基于腾讯元器平台开发的机械加工工艺AI智能体展示网站，参加CICAS 2025比赛作品。

## 项目概述

**老张工艺助手**是一款面向机械工程专业学生和从业者的AI智能体，以"25年机加老师傅"的人设，用口语化、接地气的方式解答车铣钻磨、铸锻焊、热处理等加工工艺问题。

### 核心功能

- **AI对话**：与"老张"实时交流，获取工艺知识和实操建议
- **知识整合**：整合B站、知乎等平台的优质教学资源
- **老师傅口诀**：25年产线经验总结，快速记忆工艺要点
- **CICAS参赛**：符合大赛要求的智能体作品展示

## 技术架构

### 前端技术栈

- **纯HTML/CSS/JS** - 无框架依赖，轻量高效
- **液态玻璃UI** - CSS backdrop-filter实现现代化视觉效果
- **Canvas 2D粒子系统** - 200个粒子的动态背景，性能友好
- **CSS动画** - 齿轮旋转、渐入效果等

### AI技术

- **腾讯元器平台** - 智能体基础框架
- **DeepSeek-R1** - 深度推理能力，处理复杂工艺问题
- **腾讯混元** - 中文语义理解，更懂国内工艺术语
- **人设Prompt工程** - 25年老师傅口吻精准调教

### 数据存储

- **localStorage** - 管理员设置、背景图、背景音乐等本地存储
- **sessionStorage** - 对话历史临时存储

## 项目结构

```
project/
├── index.html              # 主页（Hero + 对话窗口）
├── about.html              # 介绍页（产品概述、技术优势、应用场景）
├── login.html              # 管理员登录页
├── admin.html              # 管理员后台仪表盘
├── css/
│   ├── base.css           # 基础样式、CSS变量、工具类
│   ├── components.css     # 组件样式（导航、卡片、表单等）
│   └── pages.css          # 页面特定样式
├── js/
│   ├── storage.js         # localStorage封装模块
│   ├── main.js            # 粒子系统、导航、主题管理
│   ├── chat.js            # 对话功能、模拟API回复
│   └── admin.js           # 后台管理逻辑
├── assets/
│   ├── images/            # 默认背景图、占位图
│   └── audio/             # 默认背景音乐（可选）
└── README.md              # 项目说明文档
```

## 部署说明

### 本地运行

1. 克隆或下载项目到本地
2. 使用浏览器直接打开 `index.html`
3. 推荐使用 Chrome/Firefox/Edge 最新版本

### Web服务器部署

#### 方式一：静态网站托管

将项目文件上传到任意静态网站托管服务：
- GitHub Pages
- Netlify
- Vercel
- 腾讯云COS
- 阿里云OSS

#### 方式二：Nginx部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/project;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
```

#### 方式三：Docker部署

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

构建并运行：
```bash
docker build -t laozhang-assistant .
docker run -d -p 80:80 laozhang-assistant
```

## 管理员后台

### 登录信息

- **用户名**：`admin`
- **密码**：`admin123`
- **访问地址**：`/login.html`

### 后台功能

1. **外观设置**
   - 主题色切换（工业橙/钢蓝/熔岩红）
   - 背景图片上传
   - 背景音乐上传

2. **内容管理**
   - 介绍页标题编辑
   - 介绍页正文编辑
   - 介绍页图片上传（最多5张）
   - 优势卡片内容编辑

3. **预览**
   - 一键预览主页效果
   - 一键预览介绍页效果

## API配置

当前对话功能使用**模拟回复**实现，如需接入真实API：

1. 打开 `js/chat.js`
2. 修改 `apiConfig` 对象：

```javascript
apiConfig: {
  url: 'https://your-api-endpoint.com/chat',  // 替换为真实API地址
  key: 'your-api-key',                         // 替换为真实API密钥
  model: 'deepseek-r1'
}
```

3. 取消 `callAgentAPI` 方法中的真实API调用注释

## 腾讯元器智能体配置

### 智能体信息

- **平台**：腾讯元器 (https://yuanqi.tencent.com)
- **人设**：25年机加老师傅，口语化讲解机械加工工艺
- **知识库**：机械加工工艺手册、国标资料
- **插件**：DuckDuckGo搜索、视频资源索引

### Prompt示例

```
你是老张，一位有25年机械加工经验的老师傅。

你的特点：
- 说话接地气，像车间里带徒弟的老师傅
- 喜欢用"口诀"总结工艺要点
- 会推荐B站等平台的优质教学视频
- 对车铣钻磨、铸锻焊、热处理等工艺门儿清

回答风格：
1. 先给出直接答案
2. 解释原理和注意事项
3. 分享老师傅的实战经验
4. 推荐相关学习资源（如有）

使用口语化表达，避免过于学术化的术语。
```

## CICAS比赛相关

### 比赛信息

- **名称**：CICAS 2025
- **官网**：https://www.cicas.cn
- **主题**：人工智能+制造/文化/其他

### 作品亮点

1. **AI+制造教育**：用AI技术解决机械工程教育中的痛点问题
2. **经验传承**：数字化保留老师傅的宝贵经验
3. **资源整合**：打通全网优质教学资源
4. **零代码开发**：基于腾讯元器平台，快速落地

### 提交材料

- [x] 项目展示网站
- [ ] 项目说明文档（PDF）
- [ ] 演示视频
- [ ] 知识产权承诺书

## 浏览器兼容性

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome | 90+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |

## 开发计划

- [x] 基础页面框架
- [x] 粒子系统背景
- [x] 对话窗口UI
- [x] 模拟AI回复
- [x] 管理员后台
- [x] 主题切换功能
- [ ] 真实API接入
- [ ] 用户反馈系统
- [ ] 移动端优化
- [ ] 多语言支持

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

- 项目主页：https://your-domain.com
- 邮箱：contact@example.com
- GitHub：https://github.com/yourusername/laozhang-assistant

---

**祝CICAS比赛顺利！🏆**
