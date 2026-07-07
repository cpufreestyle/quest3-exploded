#!/bin/bash

# Quest 3 3D 拆解工具启动脚本
# 双击此文件即可启动服务

cd "$(dirname "$0")"

echo "========================================"
echo "  Quest 3 3D 拆解工具"
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    read -p "按回车键退出..."
    exit 1
fi

# 检查 Blender
if ! command -v blender &> /dev/null; then
    echo "⚠️  警告: 未找到 Blender (可选)"
    echo "   AI 绘画功能需要 Blender"
    echo ""
fi

# 安装依赖（如果没有）
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
    echo ""
fi

# 启动服务
echo "🚀 启动服务..."
echo ""
echo "  服务地址:"
echo "    - 本地: http://localhost:3001"
echo "    - 网络: http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'):3001"
echo ""
echo "  按 Ctrl+C 停止服务"
echo ""

node server.js

# 服务停止后保持窗口打开
echo ""
read -p "服务已停止，按回车键退出..."
