# LoopMove

面向深圳到香港北部都会区搬迁场景的房间扫描与物品整理原型。通过多张房间照片核对可见物品，整理搬家清单，并估算体积与装箱需求。

> 当前为前端 Demo，默认使用五张演示照片的离线预置结果。实时 WorkBuddy AI 尚未接通，接入路线见 [WorkBuddy AI 接入计划](WORKBUDDY_INTEGRATION_PLAN.md)。

## 功能

- 拍照、上传、拖放或粘贴多张房间照片。
- 在照片间切换，按物品或画面分组查看框选结果。
- 确认物品类别、固定方式，补充尺寸。
- 按实体 ID 合并跨照片物品，生成搬家清单。
- 估算体积与容器数量，将结果保存在浏览器。

## 在线演示：GitHub Pages

项目无需构建，可通过 GitHub Pages 发布静态页面。仓库中没有填写真实线上地址；发布后请将下面的占位地址替换为实际链接。

```text
https://<GitHub用户名>.github.io/<仓库名>/loopmove-scan.html
```

发布步骤：

1. 将项目文件推送到 GitHub 仓库，保留图片目录及相对路径。
2. 打开仓库 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 选择包含项目文件的分支（通常为 `main`），目录选择 **/(root)**，保存。
5. 等待部署完成，从 Pages 显示的站点地址访问 `loopmove-scan.html`。

当前没有 `index.html`，请使用包含 `loopmove-scan.html` 的完整地址访问扫描页。也可以访问 `loopmove-app.html` 和 `loopmove-demo.html` 查看早期版本。

GitHub 仓库页面用于阅读源码；点击仓库里的 HTML 文件不会运行 Demo。GitHub Pages 提供静态网站托管，不能运行本项目未来的 AI 后端。发布选项以 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) 为准。

## 体验流程

首页可直接点击 **“看一个例子”**，体验卡通房间的物品框选、尺寸修改和搬家清单，无需下载或上传照片。示例为预置数据，不调用 AI。

如需体验照片匹配流程：

1. 从 [演示照片目录](loopmove-demo-photos/) 下载五张原图，或下载仓库 ZIP 并解压。
2. 打开已发布的扫描页面，点击“上传照片”。
3. 选择下列原图，等待页面整理结果。
4. 在照片间切换，查看物品框选与画面分组。
5. 核对固定方式和尺寸，点击“生成去重清单”查看体积与容器建议。

```text
01-desk-bed.jpg
02-bed-wardrobe.jpg
03-wardrobe-door.jpg
04-door-mirror.jpg
05-window-desk.jpg
```

请使用下载的原始文件。截图、压缩或重新导出的图片会改变 SHA-256，无法匹配当前离线结果；任意新照片也不会触发实时 AI 识别。

## 项目结构

```text
LoopMove/
├── README.md
├── DEVELOPMENT.md                # 开发规则与数据约束
├── WORKBUDDY_INTEGRATION_PLAN.md  # 实时 AI 接入计划
├── start-demo.sh                 # 本地静态预览脚本
├── loopmove-scan.html            # 当前扫描入口
├── loopmove-scan-example.js      # 可交互的卡通房间示例
├── assets/example-room.png       # 示例房间插画
├── loopmove-scan-logic.js        # 识别适配、目录匹配、去重与装箱逻辑
├── loopmove-app.html             # 早期移动端完整 Demo
├── loopmove-demo.html            # 早期桌面版 Demo
└── loopmove-demo-photos/         # 五张演示照片
```

技术栈：原生 HTML、CSS、JavaScript；当前没有后端、构建工具或运行时第三方依赖。

## 当前逻辑与 WorkBuddy AI 接入状态

**当前仓库没有实际接通 WorkBuddy AI，只有前端视觉服务适配器。** 未设置 `window.LOOPMOVE_VISION_ENDPOINT`，也没有实现后端 `/api/vision/inspect`。运行启动脚本只会提供静态文件，不会启动 AI 服务。

| 页面 / 文件 | 当前行为 |
| --- | --- |
| `loopmove-scan.html` | 未配置接口时使用离线 fixture；配置接口后走 HTTP 识别分支 |
| `loopmove-scan-logic.js` | `createWorkBuddyRecognizer()` 预留上传与解析逻辑，没有 WorkBuddy SDK、密钥或实际模型调用实现 |
| `loopmove-app.html` | 使用 `AI_MOCK` 预置数据，模拟识别与纠正流程 |
| `loopmove-demo.html` | 使用预置模拟识别结果，不调用真实视觉模型 |

代码注释和 fixture 元数据将五张演示照片标记为“WorkBuddy 多模态离线审核”。这是预置数据的来源说明；仓库未包含该离线审核过程，不能据此认定已接通实时 AI。

### 扫描与装箱流程

1. 浏览器读取图片、获取宽高并计算文件 SHA-256。
2. 默认调用 `inspectPhotos()`，按 SHA-256 精确匹配五张演示照片的 fixture。未匹配照片显示“暂未识别”，不会随机套用其他照片结果。
3. 将可见物品规范化，按 `catalogKey` 或名称 / 别名匹配本地物流目录；多类别匹配进入待确认，目录外类别需要补充尺寸。
4. 按 `entityId` 合并跨照片物品。演示数据已经预置共同 ID；当前没有根据图片相似度自动去重的模型。
5. 尺寸默认来自品类标准库，可以按参照物比例调整或手动输入；当前没有从照片恢复真实三维尺寸。
6. 只有可搬、状态为 `ready` 且尺寸有效的物品进入清单。按长 × 宽 × 高 × 数量计算体积，增加 10% 运输余量，再按容器体积生成建议；这不是三维摆放求解。
7. “保存扫描结果”将 JSON 写入当前浏览器的 `localStorage`（键名 `loopmove_scan`），没有上传到服务器。

### 预留的实时接口调用位置

`loopmove-scan.html` 的 `ingest()` 根据 `window.LOOPMOVE_VISION_ENDPOINT` 选择分支：

```text
未配置 → inspectPhotos() → SHA-256 匹配离线 fixture
已配置 → inspectPhotosWithRecognizer()
       → createWorkBuddyRecognizer().inspectImage()
       → POST 配置的后端地址 → 规范化结果 → 合并物品 → 展示
```

`workbuddy_vision` 是适配器写入的来源标签，页面据此显示 WorkBuddy 文案；它不会验证后端实际使用了哪个模型。

## WorkBuddy AI 接入路线

详细任务、接口约定和验收标准见 [接入计划](WORKBUDDY_INTEGRATION_PLAN.md)。实施顺序：

1. 确认 WorkBuddy 授权和图片输入能力，跑通一张照片的真实识别。
2. 建立后端上传、授权、任务执行和结果校验服务。
3. 修复前端文件保留、超时、错误处理与来源展示。
4. 实现多照片会话和跨照片物品关联。
5. GitHub Pages 部署前端，独立 HTTPS 服务部署后端，再完成端到端验收。

当前 `createWorkBuddyRecognizer()` 只是 LoopMove 自定义 HTTP 适配器，不等于官方 WorkBuddy SDK。GitHub Pages 上需要将 `window.LOOPMOVE_VISION_ENDPOINT` 配置为实际后端的完整 HTTPS 地址；`/api/vision/inspect` 只是项目拟定路由。

## 本地开发

在项目目录运行：

```bash
bash start-demo.sh
```

访问 `http://localhost:8000/loopmove-scan.html`。端口被占用时可运行 `bash start-demo.sh 8080`。本地服务器仅用于静态预览；不要直接双击 HTML 作为标准测试方式。开发约束见 [DEVELOPMENT.md](DEVELOPMENT.md)。

## 常见问题

- **Pages 打开 404**：确认部署成功、分支与目录正确，并使用包含 `loopmove-scan.html` 的完整地址。
- **扫描逻辑未加载**：确认 `loopmove-scan-logic.js` 与页面在同一目录，且已一起提交。
- **演示照片未匹配**：使用五张原图，并在 HTTPS 或本地 `localhost` 环境下打开；普通局域网 HTTP 可能无法计算 SHA-256。
- **修改后未更新**：先确认 Pages 部署完成，再硬刷新浏览器。
- **换浏览器后看不到保存结果**：当前结果只存在原浏览器、原站点的 `localStorage` 中。

## 搬家地图 Map

从扫描首页点击“探索搬家地图”，或打开 `loopmove-map.html`。

默认展示北部都会区生活配套：四个片区、12 项有官方来源的设施／规划资料，可按交通、教育、医疗、商业、休闲筛选，并切换“现有设施”和“建成后展望”。详情显示状态、已公布的目标时间及官方来源；分期规划不代表同时建成。片区示意不表示精确选址或步行距离，收录不是完整设施清单。

可切换回搬家服务点：六个虚构地点、搜索与分类筛选、地点详情、浏览器定位提示和“下一站”本地保存。两种视图的保存独立，支持手机布局和深浅色模式。示意图不能用于导航。

Google Maps 仅列为后续目标，本轮没有接入 SDK 或 API。文件分工、接入条件和验收步骤见 [Map 计划](MAP_PLAN.md)。
