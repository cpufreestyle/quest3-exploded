@echo off
chcp 65001 >nul
title Quest 3 3D 拆解工具

cd /d "%~dp0"

echo ========================================
echo   Quest 3 3D 拆解工具
echo ========================================
echo.

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

:: 安装依赖（如果没有）
if not exist "node_modules" (
    echo 📦 首次运行，安装依赖...
    call npm install
    echo.
)

:: 启动服务
echo 🚀 启动服务...
echo.
echo   服务地址:
echo     - 本地: http://localhost:3001
echo.
echo   按 Ctrl+C 停止服务
echo.

node server.js

:: 服务停止后保持窗口打开
echo.
pause
