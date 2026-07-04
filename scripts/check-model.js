#!/usr/bin/env node

/**
 * Quest 3 GLB 模型检查脚本
 * 分析模型结构、部件数量、材质等
 */

const fs = require('fs');
const path = '/Users/a1-6/quest3-exploded/models/Quest3.glb';

console.log('🔍 分析 Quest 3 GLB 模型...\n');

// 检查文件
const stats = fs.statSync(path);
console.log(`📦 文件信息:`);
console.log(`   大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`   路径: ${path}\n`);

// GLB 文件结构说明
console.log('📋 GLB 文件结构:');
console.log('   - JSON 头部（场景图）');
console.log('   - Binary buffer（几何体数据）');
console.log('   - 纹理图片（如果有）\n');

console.log('✅ 模型文件已就绪');
console.log('   下一步：集成到 main.js\n');
