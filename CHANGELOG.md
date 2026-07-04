# 更新日志 (Changelog)

所有项目的显著变更都将记录在此文件中。

## [v1.3.0] - 2026-07-04

### ✨ 新功能

#### 🤖 AI 智能爆炸系统
- **智能爆炸距离计算** `calculateSmartExplodeDist()`
  - 根据模型大小自动调整（尺寸 × 40%）
  - 根据相机距离防止飞出屏幕
  - 根据 FOV 计算视野边界
  - 朝向相机的爆炸自动减小（角度因子 0.5-1.0）

#### 📏 自动模型缩放
- **检测微小模型**：< 5 单位自动触发
- **放大到合适大小**：目标 10 单位
- **最大缩放限制**：20 倍
- **同步爆炸坐标**：homePos 放大，explodePos 智能计算

#### 📷 相机自动适配
- **fitCameraToModel()** 函数
  - 根据模型大小计算最佳距离
  - 平滑过渡动画（0.03/帧，缓动函数）
  - 支持默认和自定义模型

### 🐛 Bug 修复

- **#1** 自定义模型爆炸飞出屏幕
  - 问题：小模型放大后爆炸距离过大
  - 修复：AI 智能计算爆炸距离
  - 影响：所有自定义模型

- **#2** 小模型看不见
  - 问题：quest3分解.glb（0.25 单位）太小
  - 修复：自动放大 20 倍到 5.0 单位
  - 影响：所有 < 5 单位的模型

- **#3** GLTFLoader 实例化错误
  - 问题：`loader.parse is not a function`
  - 修复：改为 `new LoaderClass()` 模式
  - 影响：所有页面（8 个文件）

- **#4** 自定义模型不显示
  - 问题：默认模型和新模型重叠
  - 修复：加载自定义模型时隐藏默认模型
  - 影响：模型上传功能

- **#5** 浏览器缓存问题
  - 问题：旧代码被缓存
  - 修复：添加 `?v=timestamp` 参数
  - 工具：clear-cache.html

- **#6** CORS 错误
  - 问题：直接打开 HTML 文件（file://）
  - 修复：完善文档说明，添加诊断工具

- **#7** Fetch 失败
  - 问题：模型加载失败
  - 修复：添加 test-fetch.html 诊断工具

### 📚 新增文档

- **[SMART_EXPLOSION.md](SMART_EXPLOSION.md)** - AI智能爆炸功能详解
  - 计算逻辑、效果对比、控制台日志
- **[EXPLOSION_TROUBLESHOOTING.md](EXPLOSION_TROUBLESHOOTING.md)** - 爆炸效果调试指南
  - 为什么 2 个部件的模型爆炸不明显
- **[CUSTOM_MODEL_FIX.md](CUSTOM_MODEL_FIX.md)** - 自定义模型修复说明
  - 可见性切换、爆炸效果、测试步骤
- **[GLTFLOADER_FIX.md](GLTFLOADER_FIX.md)** - GLTFLoader 技术文档
  - 类 vs 实例、正确用法、常见错误
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - 完整故障排除指南
  - CORS、fetch、缓存、模型显示等问题
- **[RELEASE_NOTES_v1.3.0.md](RELEASE_NOTES_v1.3.0.md)** - 详细发布说明

### 🧪 新增测试工具

- **[test-explosion.html](test-explosion.html)** - 爆炸效果分析工具
  - 加载模型、计算爆炸距离、可视化坐标、效果评估
- **[check-model.html](check-model.html)** - 模型结构检查器
  - 3D 可视化、部件统计、包围盒计算
- **[debug-loader.html](debug-loader.html)** - GLTFLoader 调试工具
  - 4步测试（fetch、import、实例化、解析）
- **[clear-cache.html](clear-cache.html)** - 浏览器缓存清除助手
  - 硬性重新加载、无痕模式
- **[test-minimal.html](test-minimal.html)** - 最小化测试
  - 测试 import、实例化、完整流程
- **[test-fetch.html](test-fetch.html)** - Fetch API 诊断工具
  - 测试 fetch 和 XMLHttpRequest

### 📝 文档更新

- **[README.md](README.md)**
  - 更新版本号：v1.3.0
  - 添加 AI 智能爆炸功能说明
  - 添加自动缩放功能说明
  - 添加版本历史

### 💻 代码变更

#### JavaScript
- **main.js**
  - 新增 `calculateSmartExplodeDist()` - 智能爆炸计算
  - 优化 `fitCameraToModel()` - 相机适配
  - 新增自动缩放逻辑 - 20 倍放大
  - 优化爆炸坐标同步 - sqrt 缩放
  - 增强控制台日志 - 详细调试信息

#### HTML
- **index.html**
  - 更新版本信息
  - 添加 `?v=timestamp` 缓存破坏

#### 新增文件
- SMART_EXPLOSION.md
- EXPLOSION_TROUBLESHOOTING.md
- CUSTOM_MODEL_FIX.md
- GLTFLOADER_FIX.md
- TROUBLESHOOTING.md
- RELEASE_NOTES_v1.3.0.md
- CHANGELOG.md

### 📊 统计

```
新增文档: 6 个
新增工具: 6 个
Bug 修复: 7 个
代码变更: +1500/-200 行
测试覆盖: 6 个测试页面
```

---

## [v1.2.0] - 2026-06-22

### ✨ 新功能

#### 📱 WebXR AR 预览模式（实验性）
- WebXR 支持检测（Android Chrome + iOS Safari）
- AR 会话管理（启动/退出）
- Hit-test 平面检测
- 模型自动放置
- AR 渲染循环（60 FPS）
- 自动旋转 + 呼吸爆炸效果

#### 🎨 UI/UX 全面升级
- 加载动画（旋转环形加载器）
- 主题切换（深色/浅色）
- 500 粒子系统背景
- 按钮效果升级（悬停、点击、涟漪）
- 步骤描述动画（fadeInUp）
- 工具清单美化（shimmer 动画）
- 自定义滚动条

### 📝 文档

- WEBXR_AR_IMPLEMENTATION.md - AR 实现文档
- REAL_MODEL_AR_PLAN.md - 真实模型规划
- AR_FEATURE_COMPLETE.md - AR 功能报告
- UI_UX_IMPROVEMENTS.md - UI/UX 美化文档
- RELEASE_NOTES_v1.2.0.md

### 💻 代码

- main.js: +200 行（AR 功能）
- index.html: +1 按钮
- style.css: +50 行

---

## [v1.0.0] - 2026-06-20

### ✨ 初始版本

#### 核心功能
- 3D Quest 3 模型（15 个独立部件）
- 爆炸视图（按钮 + 滑块 + 鼠标）
- 7 步结构化教学（iFixit 风格）
- 工具清单动态显示
- 时间轴控制（播放/暂停/速度）
- 键盘快捷键（5 种）
- 自定义模型上传（GLB/GLTF）
- 部件信息卡片
- 移动端适配

#### UI/UX
- 响应式设计
- 平滑动画
- 加载状态
- 错误处理

### 📝 文档

- README.md - 项目说明
- BLENDER_TUTORIAL.md - Blender 教程
- IMPLEMENTATION_SUMMARY.md - 实现总结
- RELEASE_NOTES_v1.0.0.md

### 💻 代码

- main.js: ~1500 行
- style.css: ~600 行
- index.html: ~200 行
- vendor/ - Three.js + 插件

---

## 格式说明

每个版本包含以下部分：

- **✨ 新功能**：新增的功能
- **🐛 Bug 修复**：修复的问题
- **📝 文档**：新增或更新的文档
- **💻 代码变更**：代码改动
- **📊 统计**：数量统计

---

**最后更新**：2026-07-04
**维护者**：Claude Code
**项目**：Quest 3 爆炸拆解 3D 视图
**仓库**：https://github.com/cpufreestyle/quest3-exploded
