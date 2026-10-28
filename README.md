# 数学讲义 · 三本合订

在线：<https://lugabeeee.github.io/math-lecture-notes/>（`noindex` + `robots.txt`，链接可分享，不进搜索引擎）

一个仓库放三本单文件离线讲义，入口 `index.html` 是三张卡片：

| 文件 | 内容 | 体量 |
|---|---|---|
| `analysis-vol1/index.html` | 《数学分析》上册预习讲义（华东师大六版） | 2.37 MB · 11 章 + 附录 · 69 节 · 11 个交互实验 |
| `数学分析下册-讲义.html` | 《数学分析》下册 12–23 章（华东师大六版） | 2.50 MB · 12 章 40 节 · 208 条定义/定理 |
| `高等代数-讲义.html` | 《高等代数》1–10 章合订（北大五版） | 2.69 MB · 10 章 72 节 · 338 条定义/定理 |

三本都是**单文件、断网可读**：MathJax 矢量公式已内联，双击打开即可，不需要装任何东西。
`analysis-vol1/index-offline.html` 是上册的离线加强版（视频 base64 内嵌，2.88 MB）。

## 目录结构

```
index.html                    入口页（三张卡片）
数学分析下册-讲义.html          下册（构建产物）
高等代数-讲义.html             高代（构建产物）
analysis-vol1/                上册：源码 + 构建产物
  index.html  index-offline.html
  src/        章节分片（HTML）
  engine/     交互实验引擎
  assets/     MathJax
  videos/     6 段讲解动画（mp4）
  build.py buildlib.py make_sample.py
  README.md   上册自己的说明
```

## 怎么读

每节先读「说人话」或「章导语」，再看定义与定理（证明默认折叠，先自己推），最后做节末自测。
`Ctrl/⌘ + K` 全文搜索，侧栏跳章，右上角切深浅色，打印样式会展开折叠。

## 重新构建

**上册**（源码在本仓库 `analysis-vol1/`）：

```bash
cd analysis-vol1
python3 build.py            # → index.html 与 index-offline.html
python3 make_sample.py ch2  # 可选：抽单章样张
```

**下册 / 高等代数**：内容源是结构化 JSON，放在本地工作区 `高等代数/work/chapters/`（不随本仓库发布），
构建脚本为 `高等代数/build/gen.py`：

```bash
cd 高等代数
python3 build/gen.py        # → build/out/{ga,ma2}.html
cp build/out/ga.html        deliver/高等代数-讲义.html
cp build/out/ma2.html       deliver/数学分析下册-讲义.html
```

## 内容标准（三本一致）

- 每章开头一段**「这一章在故事里的位置」**：接上一章什么、本章立什么、给下一章留什么；
- 每节配**背景 / 常见误解 / 方法提示**块（来龙去脉用「一般认为 / 世纪年代」对冲，不编具体年份）；
- 几乎每个定义配一条**「说人话」**：白话翻译 + 具体例子（数字、小矩阵、具体多项式），类比都带边界校准；
- 重要定理配**「为什么需要这些条件」**：逐条审计前提，删掉会怎样、反例是什么。

三本的新增内容都经过**独立数学复核**（另一模型逐条读、逐条复算），退回修订后再复审，才进入构建。
原有定义、定理、例题、易错点与自测题一律未改动——构建前用基线快照逐字段比对过。

## 已知取舍

1. **定理编号是程序按章自动生成的，不是教材原编号**；需要对照纸质书时，看每章末尾「编校说明」。
2. 目录按第五/六版结构整理，个别节标题可能与手上印次略有出入。
3. 数学分析第 23 章（向量函数微分学）在部分印次为选学，若你的书没有可整章略过。
4. 三本讲义都是预习/自学材料，不替代教材、课堂与老师讲义。

## 说明

仓库带 `<meta name="robots" content="noindex, nofollow, noarchive">` 与 `robots.txt`（`Disallow: /`）：链接可以正常分享和访问，但主流搜索引擎不会收录。若要彻底下线，删掉 GitHub Pages 的发布源即可。
