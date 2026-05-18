#!/bin/bash
# 老张工艺助手 - 部署脚本
# 用于在服务器上快速部署项目

set -e

echo "======================================"
echo "老张工艺助手 - 部署脚本"
echo "======================================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"

# 创建必要的目录
echo "📁 创建上传目录..."
mkdir -p api/uploads
chmod 755 api/uploads

# 确保配置文件存在
if [ ! -f "api/config.json" ]; then
    echo "📝 创建默认配置文件..."
    cat > api/config.json << 'EOF'
{
  "theme": "orange",
  "backgroundImage": "",
  "backgroundAudio": "",
  "aboutTitle": "老张工艺助手",
  "aboutContent": "",
  "aboutImages": [],
  "advantages": [
    {
      "title": "老师傅人设",
      "desc": "25年产线经验口语化讲解，不是冷冰冰的百科"
    },
    {
      "title": "全网资源整合",
      "desc": "视频+图文，B站/知乎/百科优质内容一键直达"
    },
    {
      "title": "零代码搭建",
      "desc": "基于腾讯元器/Coze，低门槛快速部署"
    },
    {
      "title": "工艺全覆盖",
      "desc": "车铣钻磨、铸锻焊、热处理、特种加工全涵盖"
    }
  ],
  "chatMode": "iframe",
  "iframeUrl": "https://yuanqi.tencent.com/webim/#/chat/你的聊天ID?appid=你的AppID&experience=true",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
EOF
fi

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose down 2>/dev/null || true

# 构建并启动新容器
echo "🏗️ 构建 Docker 镜像..."
docker-compose build --no-cache

echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "======================================"
    echo "✅ 部署成功！"
    echo "======================================"
    echo ""
    echo "访问地址:"
    echo "  - 本地: http://localhost:3000"
    echo "  - 服务器: http://$(curl -s ifconfig.me):3000"
    echo ""
    echo "后台管理:"
    echo "  - 地址: http://localhost:3000/login.html"
    echo "  - 默认密码: 请查看 config.js 中的 AUTH_TOKEN"
    echo ""
    echo "常用命令:"
    echo "  - 查看日志: docker-compose logs -f"
    echo "  - 停止服务: docker-compose down"
    echo "  - 重启服务: docker-compose restart"
    echo ""
else
    echo "❌ 部署失败，请检查日志:"
    docker-compose logs
    exit 1
fi
