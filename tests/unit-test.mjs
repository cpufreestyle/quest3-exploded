#!/usr/bin/env node
/**
 * 单元测试 — 纯函数模块
 *
 * 测试 src/utils.js 和 src/server-utils.js 中导出的函数
 * 不依赖浏览器或 Three.js 环境
 *
 * 用法：
 *   node tests/unit-test.mjs
 */

import {
  UnionFind,
  easeOutCubic,
  clamp,
  smoothStep,
  lerp,
  isQuest3Model,
  generatePartName,
  base64ToUtf8,
  formatBytes,
  validateGLBHeader,
} from "../src/utils.js";

import {
  sanitizeFilename,
  parseMultipartBuffer,
  getCORSHeaders,
  MAX_PARTS,
  MAX_BOUNDARY_LENGTH,
} from "../src/server-utils.js";

// Buffer is a global in Node.js
// ===== 测试框架 =====
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
    failures.push(message);
  }
}

function assertEqual(actual, expected, message) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  ✅ ${message}: ${actual}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}: 期望 ${JSON.stringify(expected)}, 实际 ${JSON.stringify(actual)}`);
    failed++;
    failures.push(message);
  }
}

function assertApprox(actual, expected, epsilon, message) {
  const ok = Math.abs(actual - expected) < epsilon;
  if (ok) {
    console.log(`  ✅ ${message}: ${actual} ≈ ${expected}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}: 期望 ≈${expected}, 实际 ${actual}`);
    failed++;
    failures.push(message);
  }
}

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
}

// ===== 测试开始 =====

console.log("═".repeat(60));
console.log("  🧪 单元测试 — 纯函数模块");
console.log("═".repeat(60));

// ── UnionFind ──
describe("UnionFind 数据结构", () => {
  const uf = new UnionFind(10);

  // 初始状态：每个元素自成一派
  assertEqual(uf.find(0), 0, "初始 find(0) = 0");
  assertEqual(uf.find(5), 5, "初始 find(5) = 5");

  // union 操作
  uf.union(0, 1);
  assertEqual(uf.find(0), uf.find(1), "union(0,1) 后 find(0) == find(1)");

  uf.union(1, 2);
  assertEqual(uf.find(0), uf.find(2), "传递性: union(1,2) 后 find(0) == find(2)");

  uf.union(3, 4);
  uf.union(2, 3);
  assertEqual(uf.find(0), uf.find(4), "多级传递: 0-1-2-3-4 全部连通");

  // 未连通的元素
  assert(uf.find(0) !== uf.find(5), "find(0) != find(5) — 未连通");

  // 路径压缩验证
  const uf2 = new UnionFind(100);
  for (let i = 0; i < 99; i++) uf2.union(i, i + 1);
  const root = uf2.find(0);
  assertEqual(uf2.find(99), root, "100 个元素全连通后 find(0) == find(99)");

  // roots 方法
  const uf3 = new UnionFind(6);
  uf3.union(0, 1);
  uf3.union(2, 3);
  assertEqual(uf3.roots().length, 4, "6 元素 union(0,1) union(2,3) 后有 4 个连通分量");

  // componentSize
  assertEqual(uf3.componentSize(0), 2, "componentSize(0) = 2");
  assertEqual(uf3.componentSize(4), 1, "componentSize(4) = 1");
});

// ── easeOutCubic ──
describe("easeOutCubic 缓动函数", () => {
  assertApprox(easeOutCubic(0), 0, 1e-10, "easeOutCubic(0) = 0");
  assertApprox(easeOutCubic(1), 1, 1e-10, "easeOutCubic(1) = 1");
  assertApprox(easeOutCubic(0.5), 0.875, 1e-10, "easeOutCubic(0.5) = 0.875");
  assertApprox(easeOutCubic(0.25), 0.578125, 1e-10, "easeOutCubic(0.25) = 0.578125");
  // 减速特性：前半段比线性快
  assert(easeOutCubic(0.5) > 0.5, "easeOutCubic(0.5) > 0.5（前半段加速）");
});

// ── clamp ──
describe("clamp 数值限制", () => {
  assertEqual(clamp(5, 0, 10), 5, "clamp(5, 0, 10) = 5");
  assertEqual(clamp(-5, 0, 10), 0, "clamp(-5, 0, 10) = 0");
  assertEqual(clamp(15, 0, 10), 10, "clamp(15, 0, 10) = 10");
  assertEqual(clamp(0, 0, 10), 0, "clamp(0, 0, 10) = 0（边界）");
  assertEqual(clamp(10, 0, 10), 10, "clamp(10, 0, 10) = 10（边界）");
});

// ── smoothStep ──
describe("smoothStep 阶梯函数", () => {
  assertEqual(smoothStep(0, 1, -1), 0, "smoothStep(0,1,-1) = 0（低于下界）");
  assertEqual(smoothStep(0, 1, 2), 1, "smoothStep(0,1,2) = 1（高于上界）");
  assertApprox(smoothStep(0, 1, 0), 0, 1e-10, "smoothStep(0,1,0) = 0");
  assertApprox(smoothStep(0, 1, 1), 1, 1e-10, "smoothStep(0,1,1) = 1");
  assertApprox(smoothStep(0, 1, 0.5), 0.5, 1e-10, "smoothStep(0,1,0.5) = 0.5（中点）");

  // edge0 == edge1 退化情况
  assertEqual(smoothStep(5, 5, 3), 0, "smoothStep(5,5,3) = 0（退化，x < edge0）");
  assertEqual(smoothStep(5, 5, 7), 1, "smoothStep(5,5,7) = 1（退化，x >= edge0）");

  // 负范围
  assertEqual(smoothStep(-2, 0, -1), 0.5, "smoothStep(-2,0,-1) = 0.5");
});

// ── lerp ──
describe("lerp 线性插值", () => {
  assertApprox(lerp(0, 10, 0), 0, 1e-10, "lerp(0,10,0) = 0");
  assertApprox(lerp(0, 10, 1), 10, 1e-10, "lerp(0,10,1) = 10");
  assertApprox(lerp(0, 10, 0.5), 5, 1e-10, "lerp(0,10,0.5) = 5");
  assertApprox(lerp(-5, 5, 0.3), -2, 1e-10, "lerp(-5,5,0.3) = -2");
});

// ── isQuest3Model ──
describe("isQuest3Model 文件名检测", () => {
  assert(isQuest3Model("Quest3.glb"), "Quest3.glb → true");
  assert(isQuest3Model("quest3.stl"), "quest3.stl → true");
  assert(isQuest3Model("Quest 3 URDF.urdf"), "Quest 3 URDF.urdf → true");
  assert(isQuest3Model("QUEST3 model.glb"), "QUEST3 model.glb → true");
  assert(!isQuest3Model("basketball.glb"), "basketball.glb → false");
  assert(!isQuest3Model("robot.stl"), "robot.stl → false");
  assert(!isQuest3Model(""), "空字符串 → false");
  assert(!isQuest3Model(null), "null → false");
  assert(!isQuest3Model(undefined), "undefined → false");
  assert(!isQuest3Model("quest.glb"), "quest.glb (无3) → false");
});

// ── generatePartName ──
describe("generatePartName 部件命名", () => {
  const bbox = {
    center: { x: 0, y: 0, z: 0 },
    size: { x: 10, y: 10, z: 10 },
    min: { x: -5, y: -5, z: -5 },
    max: { x: 5, y: 5, z: 5 },
  };

  // 右侧
  assertEqual(
    generatePartName(0, { x: 4, y: 0, z: 0 }, bbox),
    "部件1·右侧",
    "右侧部件命名",
  );

  // 左侧
  assertEqual(
    generatePartName(1, { x: -4, y: 0, z: 0 }, bbox),
    "部件2·左侧",
    "左侧部件命名",
  );

  // 顶部
  assertEqual(
    generatePartName(2, { x: 0, y: 4, z: 0 }, bbox),
    "部件3·顶部",
    "顶部部件命名",
  );

  // 底部
  assertEqual(
    generatePartName(3, { x: 0, y: -4, z: 0 }, bbox),
    "部件4·底部",
    "底部部件命名",
  );

  // 前方
  assertEqual(
    generatePartName(4, { x: 0, y: 0, z: 4 }, bbox),
    "部件5·前方",
    "前方部件命名",
  );

  // 后方
  assertEqual(
    generatePartName(5, { x: 0, y: 0, z: -4 }, bbox),
    "部件6·后方",
    "后方部件命名",
  );

  // 中心
  assertEqual(
    generatePartName(6, { x: 0.1, y: 0.1, z: 0.1 }, bbox),
    "部件7·中心",
    "中心部件命名",
  );
});

// ── base64ToUtf8 ──
describe("base64ToUtf8 解码", () => {
  // ASCII
  assertEqual(base64ToUtf8("SGVsbG8gV29ybGQ="), "Hello World", "ASCII 解码");

  // 中文 UTF-8
  assertEqual(base64ToUtf8("5L2g5aW9"), "你好", "中文解码");

  // 混合
  assertEqual(base64ToUtf8("UXVlc3QgMyDniIbngrjlm74="), "Quest 3 爆炸图", "中英混合解码");

  // 空字符串
  assertEqual(base64ToUtf8(""), "", "空字符串解码");
});

// ── formatBytes ──
describe("formatBytes 文件大小格式化", () => {
  assertEqual(formatBytes(0), "0 B", "0 B");
  assertEqual(formatBytes(512), "512 B", "512 B");
  assertEqual(formatBytes(1024), "1.0 KB", "1024 → 1.0 KB");
  assertEqual(formatBytes(1536), "1.5 KB", "1536 → 1.5 KB");
  assertEqual(formatBytes(1048576), "1.0 MB", "1048576 → 1.0 MB");
  assertEqual(formatBytes(5242880), "5.0 MB", "5242880 → 5.0 MB");
});

// ── validateGLBHeader ──
describe("validateGLBHeader GLB 头部校验", () => {
  // 构造有效的 GLB 头部
  const validGLB = new ArrayBuffer(20);
  const view = new DataView(validGLB);
  view.setUint32(0, 0x46546c67, true); // magic 'glTF'
  view.setUint32(4, 2, true); // version 2
  view.setUint32(8, 20, true); // total length
  view.setUint32(12, 0, true); // chunk length (dummy)
  view.setUint32(16, 0x4e4f534a, true); // chunk type JSON

  const result = validateGLBHeader(new Uint8Array(validGLB));
  assert(result.valid, "有效 GLB 头部 → valid: true");
  assertEqual(result.version, 2, "GLB 版本 = 2");
  assertEqual(result.length, 20, "GLB 长度 = 20");

  // 太短
  const shortResult = validateGLBHeader(new Uint8Array(5));
  assert(!shortResult.valid, "太短的数据 → invalid");
  assert(!!shortResult.error, "包含错误信息");

  // 错误的 magic
  const badGLB = new ArrayBuffer(12);
  const badView = new DataView(badGLB);
  badView.setUint32(0, 0x00000000, true);
  badView.setUint32(4, 2, true);
  badView.setUint32(8, 12, true);
  const badResult = validateGLBHeader(new Uint8Array(badGLB));
  assert(!badResult.valid, "错误的 magic → invalid");

  // null 输入
  assert(!validateGLBHeader(null).valid, "null 输入 → invalid");
  assert(!validateGLBHeader(undefined).valid, "undefined 输入 → invalid");
});

// ── sanitizeFilename ──
describe("sanitizeFilename 文件名消毒", () => {
  assertEqual(sanitizeFilename("model.glb"), "model.glb", "正常文件名不变");
  assertEqual(sanitizeFilename("path/to/file.glb"), "pathtofile.glb", "移除路径分隔符");
  assertEqual(sanitizeFilename("..\\..\\evil.exe"), "evil.exe", "移除 .. 和反斜杠");
  assertEqual(sanitizeFilename("file\x00name.glb"), "filename.glb", "移除控制字符");
  assertEqual(sanitizeFilename("file\x1fname.glb"), "filename.glb", "移除 DEL 控制字符");
  assertEqual(sanitizeFilename("正常文件.glb"), "正常文件.glb", "保留中文字符");
  assertEqual(sanitizeFilename(""), "", "空字符串返回空");
});

// ── parseMultipartBuffer ──
describe("parseMultipartBuffer multipart 解析", () => {
  // 构造有效的 multipart 数据
  const boundary = "TestBoundary123";
  const fileContent = "Hello GLB World";
  const multipartData =
    `--${boundary}\r\n` +
    "Content-Disposition: form-data; name=\"file\"; filename=\"test.glb\"\r\n" +
    "Content-Type: application/octet-stream\r\n" +
    "\r\n" +
    fileContent +
    `\r\n--${boundary}--\r\n`;

  const buffer = Buffer.from(multipartData, "latin1");
  const result = parseMultipartBuffer(buffer, `--${boundary}`);

  assert(!!result, "解析结果非 null");
  assertEqual(result.filename, "test.glb", "文件名正确");
  assertEqual(result.fieldname, "file", "字段名正确");
  assertEqual(result.contentType, "application/octet-stream", "Content-Type 正确");
  assertEqual(result.data.toString("utf-8"), fileContent, "文件内容正确");

  // 空文件名
  const emptyMultipart =
    `--${boundary}\r\n` +
    "Content-Disposition: form-data; name=\"file\"; filename=\"\"\r\n" +
    "Content-Type: application/octet-stream\r\n" +
    "\r\n" +
    `\r\n--${boundary}--\r\n`;
  const emptyResult = parseMultipartBuffer(Buffer.from(emptyMultipart, "latin1"), `--${boundary}`);
  assertEqual(emptyResult, null, "空文件名 → null");

  // 无效 boundary
  const invalidResult = parseMultipartBuffer(buffer, "--WrongBoundary");
  assertEqual(invalidResult, null, "错误 boundary → null");

  // 恶意文件名（路径遍历）
  const maliciousMultipart =
    `--${boundary}\r\n` +
    "Content-Disposition: form-data; name=\"file\"; filename=\"../../etc/passwd\"\r\n" +
    "Content-Type: application/octet-stream\r\n" +
    "\r\n" +
    "evil" +
    `\r\n--${boundary}--\r\n`;
  const maliciousResult = parseMultipartBuffer(
    Buffer.from(maliciousMultipart, "latin1"),
    `--${boundary}`,
  );
  assert(!!maliciousResult, "恶意文件名解析结果非 null");
  assertEqual(maliciousResult.filename, "etcpasswd", "路径遍历被移除");
  assert(!maliciousResult.filename.includes(".."), "文件名不含 ..");
  assert(!maliciousResult.filename.includes("/"), "文件名不含 /");
});

// ── getCORSHeaders ──
describe("getCORSHeaders CORS 头", () => {
  const headers = getCORSHeaders();

  assertEqual(headers["Access-Control-Allow-Origin"], "*", "CORS Origin = *");
  assert(headers["Access-Control-Allow-Methods"].includes("GET"), "允许 GET");
  assert(headers["Access-Control-Allow-Methods"].includes("POST"), "允许 POST");
  assert(headers["Access-Control-Allow-Methods"].includes("OPTIONS"), "允许 OPTIONS");
  assert(headers["Access-Control-Allow-Headers"].includes("X-Manifest"), "允许 X-Manifest 头");
  assert(
    headers["Access-Control-Expose-Headers"].includes("X-Total-Parts"),
    "暴露 X-Total-Parts 头",
  );

  // 确保每次调用返回新对象（防止共享引用被修改）
  const headers2 = getCORSHeaders();
  headers2["X-Custom"] = "test";
  assert(!headers["X-Custom"], "每次调用返回独立对象");
});

// ── 常量验证 ──
describe("安全常量", () => {
  assertEqual(MAX_PARTS, 10, "MAX_PARTS = 10");
  assertEqual(MAX_BOUNDARY_LENGTH, 200, "MAX_BOUNDARY_LENGTH = 200");
  assert(MAX_PARTS > 0, "MAX_PARTS > 0");
  assert(MAX_BOUNDARY_LENGTH > 0, "MAX_BOUNDARY_LENGTH > 0");
});

// ===== 结果汇总 =====
console.log("\n" + "═".repeat(60));
console.log(`  结果: ${passed} 通过, ${failed} 失败`);
if (failed === 0) {
  console.log("  ✅ 全部测试通过！");
} else {
  console.log("  ❌ 有测试失败！");
  console.log("\n  失败项:");
  failures.forEach(f => console.log(`    • ${f}`));
}
console.log("═".repeat(60));

process.exit(failed > 0 ? 1 : 0);
