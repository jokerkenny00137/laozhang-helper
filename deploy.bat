@echo off
chcp 65001 >nul
echo ======================================
echo 老张工艺助手 - Windows 部署脚本
echo ======================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

REM 创建上传目录
echo 📁 创建上传目录...
if not exist "api\uploads" mkdir api\uploads

REM 确保配置文件存在
if not exist "api\config.json" (
    echo 📝 创建默认配置文件...
    echo { > api\config.json
    echo   "theme": "orange", >> api\config.json
    echo   "backgroundImage": "", >> api\config.json
    echo   "backgroundAudio": "", >> api\config.json
    echo   "aboutTitle": "老张工艺助手", >> api\config.json
    echo   "aboutContent": "", >> api\config.json
    echo   "aboutImages": [], >> api\config.json
    echo   "advantages": [ >> api\config.json
    echo     {"title": "老师傅人设", "desc": "25年产线经验口语化讲解"}, >> api\config.json
    echo     {"title": "全网资源整合", "desc": "视频+图文优质内容一键直达"}, >> api\config.json
    echo     {"title": "零代码搭建", "desc": "基于腾讯元器低门槛部署"}, >> api\config.json
    echo     {"title": "工艺全覆盖", "desc": "车铣钻磨铸锻焊热处理全涵盖"} >> api\config.json
    echo   ], >> api\config.json
    echo   "chatMode": "iframe", >> api\config.json
    echo   "iframeUrl": "https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true", >> api\config.json
    echo   "updatedAt": "2025-01-01T00:00:00.000Z" >> api\config.json
    echo } >> api\config.json
)

REM 停止旧容器
echo 🛑 停止旧容器...
docker-compose down 2>nul

REM 构建并启动新容器
echo 🏗️ 构建 Docker 镜像...
docker-compose build --no-cache

echo 🚀 启动服务...
docker-compose up -d

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

REM 检查服务状态
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ 部署失败，请检查日志:
    docker-compose logs
    pause
    exit /b 1
) else (
    echo.
    echo ======================================
    echo ✅ 部署成功！
    echo ======================================
    echo.
    echo 访问地址:
    echo   - 本地: http://localhost:3000
    echo.
    echo 后台管理:
    echo   - 地址: http://localhost:3000/login.html
    echo   - 默认密码: laozhang2024
    echo.
    echo 常用命令:
    echo   - 查看日志: docker-compose logs -f
    echo   - 停止服务: docker-compose down
    echo   - 重启服务: docker-compose restart
    echo.
    pause
)
