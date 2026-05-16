@echo off
chcp 65001 >nul
echo 正在初始化 Git 仓库...

REM 配置 Git
git config --global user.name "jokerkenny00137"
git config --global user.email "jokerkenny@qq.com"

REM 初始化仓库
git init

REM 添加所有文件
git add .

REM 提交
git commit -m "Initial commit: 老张工艺助手项目"

echo.
echo ========================================
echo 下一步：在 GitHub 创建仓库
echo ========================================
echo 1. 访问 https://github.com/new
echo 2. 仓库名填写：laozhang-helper
echo 3. 不要勾选 "Initialize this repository with a README"
echo 4. 点击 Create repository
echo.
echo 完成后按任意键继续...
pause >nul

echo.
echo 正在推送到 GitHub...
git branch -M main
git remote add origin https://github.com/jokerkenny00137/laozhang-helper.git
git push -u origin main

echo.
echo ========================================
echo 上传完成！
echo ========================================
pause
