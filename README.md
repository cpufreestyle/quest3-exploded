# Quest 3 爆炸拆解 3D 视图

使用 Three.js 构建的 Meta Quest 3 简化模型爆炸图，支持鼠标拖拽旋转、滚轮缩放、滑块控制拆解程度。

## 功能

- 🎮 程序化生成的 Quest 3 简化模型
- 💥 爆炸拆解滑块，查看内部结构
- 🖱️ 鼠标左键旋转、右键平移、滚轮缩放
- 🔄 自动旋转开关
- 📱 响应式布局

## 本地预览

这是一个纯静态项目，无需构建工具。任意 HTTP 服务器均可运行：

```bash
# 使用 Python
python3 -m http.server 8080

# 或使用 Node.js
npx serve .

# 或使用 Vite
npx vite
```

然后打开 http://localhost:8080。

## 部署到 Vercel

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登录并部署：
   ```bash
   cd quest3-exploded
   vercel
   ```

3. 按提示选择 scope、项目名称，确认部署。

项目已包含 `vercel.json`，静态文件会自动识别。

## 部署到 GitHub Pages

1. 将本目录推送到 GitHub 仓库。
2. 进入仓库 Settings → Pages。
3. Source 选择 Deploy from a branch，Branch 选择 `main`，文件夹选择 `/ (root)`。
4. 保存后即可访问。

## 文件结构

```
quest3-exploded/
├── index.html      # 页面结构
├── style.css       # 界面样式
├── main.js         # Three.js 场景与交互
├── vercel.json     # Vercel 部署配置
└── README.md
```

## 自定义真实模型

当前模型使用 Three.js 基础几何体拼成的简化版 Quest 3。如果你有真实的 GLTF/GLB 模型，可以在 `main.js` 中：

1. 引入 GLTFLoader：
   ```js
   import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
   ```

2. 加载模型并按部件拆分为独立 Group，分别设置 `homePos` 和 `explodePos`。

## 技术栈

- [Three.js](https://threejs.org/)（ES Module CDN）
- 原生 HTML / CSS / JavaScript
- Vercel（可选部署平台）
