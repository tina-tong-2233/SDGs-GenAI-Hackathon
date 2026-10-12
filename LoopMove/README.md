# LoopMove

面向深圳到香港北部都会区搬迁场景的交互原型。用户从了解目的地开始，核对房间物品、决定去向，最终得到分批搬运清单和下一步行动，适合用于 User Journey 展示。

> 完整旅程使用六件物品的卡通房间预置示例；独立扫描页另外支持五张原图的离线结果。实时 WorkBuddy AI 和 Google Maps 均为后续目标。

## 完整用户旅程

现在从 `index.html` 开始：选择入住片区与月份 → 了解北都配套 → 核对示例房间 → 决定物品去向 → 生成搬家行动计划。支持返回修改、刷新恢复、待办勾选、下载计划及打印。

默认使用“小林从深圳搬到古洞北”的示例故事，现场演示约 3–5 分钟。详细点击顺序及讲解见 [用户旅程演示稿](docs/guide/JOURNEY_GUIDE.md)。独立扫描与配套页面继续保留。

## 用户旅程视觉风格

界面参考指定的 taste skill v1：采用非对称房间展示、灰绿色单一强调色、中性背景、更多留白和分隔线，减少重复卡片。页面包含轻量入场、按钮按压、加载骨架和空状态；手机端回到单列布局，支持深色模式及减少动画偏好。现有五步流程、物品计算与保存规则保留，运行时无需新增依赖。

## 快速运行

在项目目录执行：

```bash
bash scripts/start.sh
```

打开 [http://localhost:8000/](http://localhost:8000/)，默认进入完整旅程。

端口被占用时执行 `bash scripts/start.sh 8080`，再打开 `http://localhost:8080/`。本地启动需要 Python 3；页面使用原生 HTML、CSS 和 JavaScript，无需安装 npm 依赖或构建。

## 五步用户旅程

| 步骤 | 用户要解决的问题 | 操作 | 结果如何进入下一步 |
| --- | --- | --- | --- |
| 1. 选目的地 | 搬到哪里、什么时候入住？ | 选择片区、入住月份、同行人数和搬家目标 | 片区决定展示哪些配套；目标影响默认物品建议 |
| 2. 了解配套 | 新家附近现在和未来有什么？ | 切换“现有设施”和“建成后展望”，查看官方资料 | 了解配套建设状态，再安排首批与后续搬运 |
| 3. 核对房间 | 房间里有哪些物品、尺寸是否可靠？ | 整理示例房间，点击框选物品并核对尺寸、固定状态 | 可搬且尺寸有效的物品进入体积估算 |
| 4. 决定去向 | 什么先带、什么后搬、什么留下？ | 填入建议，再调整每件物品的去向并确认 | 首批、后续、转卖、捐赠、回收、留在原处分别汇总 |
| 5. 行动计划 | 接下来应该做什么？ | 查看分批清单、勾选待办、下载或打印计划，打开服务网站 | 得到可继续执行的搬家安排 |

旅程支持返回修改、刷新恢复、深浅色切换。修改尺寸、去向或搬家场景后，需要重新确认，待办勾选也会清空。

### 用户旅程走读：建议操作顺序

1. 首页点击 **“开始我的搬家旅程”**。
2. 保留默认的 **古洞北 / 2027 年 9 月 / 一人入住 / 轻装搬家**，进入配套页。
3. 切换一次 **“现有设施”** 和 **“建成后展望”**，展示建设状态的区别。
4. 进入房间页，点击 **“整理这个示例房间”**。
5. 选择 **行李箱**，点击 **“填入示例： 77 × 52 × 30 cm”**。展示缺少尺寸的物品需要先核对。
6. 进入去向页，点击 **“填入建议去向”**，将 **椅子** 改为 **“转卖”**，观察搬运体积变化。
7. 勾选确认，生成行动计划。展示首批、后续及出发前处理清单，勾选待办并下载计划。
8. 点击一张服务卡片，展示从计划到外部服务网站的衔接。需要重跑时选择 **“重新开始”**。

完整演示约 3–5 分钟；逐步讲解稿见 [用户旅程指南](docs/guide/JOURNEY_GUIDE.md)。

### 计划计算规则

- 建议可以修改，不会覆盖用户已经选择的去向。
- 首批和后续搬运仅计入尺寸有效、状态为可搬的物品。缺少尺寸或固定物品选择“带走”时，最终计划会要求先核对。
- 搬运体积按长 × 宽 × 高 × 数量计算，加入 10% 运输余量；容器建议复用现有装箱逻辑。
- 转卖、捐赠、回收和留在原处的物品不计入搬运体积。
- “少搬体积”比较当前尺寸已确认的可搬物品，不代表费用节省或碳减排量。
- 下载计划为 UTF-8 文本文件；“打印 / 存为 PDF”使用浏览器打印功能。

## 在线访问：GitHub Pages

Demo 通过 GitHub Pages 发布，地址：

**https://tina-tong-2233.github.io/SDGs-GenAI-Hackathon/**

- 根路径默认打开 `index.html` 完整旅程。
- 独立扫描页：`https://tina-tong-2233.github.io/SDGs-GenAI-Hackathon/features/scan/index.html`
- 北都配套与服务页：`https://tina-tong-2233.github.io/SDGs-GenAI-Hackathon/features/explore/index.html`

首次开启只需一次（若尚未开启）：

1. 打开仓库 **Settings → Pages**。
2. 在 **Build and deployment → Source** 选择 **Deploy from a branch**。
3. Branch 选择 `main`，目录选择 **/(root)**，保存。
4. 等待部署完成，访问上面的地址；之后每次推送到 `main` 都会自动更新站点。

仓库根目录已包含 `.nojekyll`，让 Pages 按原样提供静态文件，不改动 HTML、CSS、JS 与图片。GitHub 仓库页面用于阅读源码，点击仓库里的 HTML 文件不会运行项目；GitHub Pages 只能托管静态页面，不能运行本项目未来的 AI 后端（实时识别需另配 HTTPS 后端，见 [WorkBuddy 接入计划](docs/development/WORKBUDDY_INTEGRATION_PLAN.md)）。发布选项以 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) 为准。

## 独立扫描体验

打开 `features/scan/index.html`，可点击 **“看一个例子”**，体验卡通房间的物品框选、尺寸修改和搬家清单，无需下载或上传照片。示例为预置数据，不调用 AI。

如需体验照片匹配流程：

1. 从 [演示照片目录](assets/room-photos) 下载五张原图，或下载仓库 ZIP 并解压。
2. 打开已发布的扫描页面，点击“上传照片”。
3. 选择下列原图，等待页面整理结果。
4. 在照片间切换，查看物品框选与画面分组。
5. 核对固定方式和尺寸，点击“查看搬家清单”查看体积与容器建议。

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
├── index.html                       # 完整用户旅程入口
├── README.md                        # 使用说明与文档索引
├── .nojekyll                        # 让 GitHub Pages 按原样提供静态文件
├── .gitignore                       # 忽略 macOS 与构建产物
├── features/
│   ├── journey/                     # 用户旅程
│   │   ├── journey.js               # 五步界面、导航、保存与导出
│   │   ├── journey-logic.js         # 状态、建议、校验与汇总
│   │   └── journey.css              # 界面、主题与打印样式
│   ├── scan/                        # 房间扫描
│   │   ├── index.html               # 独立扫描入口
│   │   ├── scan-logic.js            # 识别适配、去重与装箱逻辑
│   │   └── scan-example.js          # 共享房间示例
│   └── explore/                     # 北都配套与搬家服务
│       ├── index.html               # 配套与服务入口
│       ├── explore-data.js          # 配套记录、服务链接与筛选
│       ├── explore.js               # 交互与保存
│       └── explore.css              # 页面样式
├── assets/
│   ├── images/                      # 房间插画
│   ├── room-photos/                 # 五张扫描示例原图
│   └── prompts/                     # 插画提示词
├── docs/
│   ├── README.md                    # 文档分类索引
│   ├── guide/
│   │   └── JOURNEY_GUIDE.md         # 用户旅程演示讲解与操作顺序
│   ├── development/
│   │   ├── DEVELOPMENT.md           # 开发守则
│   │   ├── MAP_PLAN.md              # 配套资料与地图计划
│   │   └── WORKBUDDY_INTEGRATION_PLAN.md  # 实时 AI 接入计划
│   └── references/                  # 项目证据包与修改清单（归档）
├── scripts/start.sh                 # 启动本地服务
├── tests/journey.test.cjs            # 旅程规则与扫描回归测试
└── archive/                         # 归档：早期版本
    ├── README.md                    # 归档说明
    ├── mobile.html
    └── desktop.html
```

各文档按用途分类，见 [文档索引](docs/README.md)。

### 功能入口

| 功能 | 页面 | 主要用途 |
| --- | --- | --- |
| 完整用户旅程 | [index.html](index.html) | 目的地、配套、物品核对、去向和行动计划 |
| 房间扫描 | [features/scan/index.html](features/scan/index.html) | 照片上传、示例框选、尺寸核对与清单保存 |
| 北都配套与搬家服务 | [features/explore/index.html](features/explore/index.html) | 设施状态筛选、规划资料和服务外链 |
| 早期版本 | [archive/mobile.html](archive/mobile.html)、[archive/desktop.html](archive/desktop.html) | 历史功能参考 |



技术栈：原生 HTML、CSS、JavaScript；当前没有后端、构建工具或运行时第三方依赖。

## 当前逻辑与 WorkBuddy AI 接入状态

**当前仓库没有实际接通 WorkBuddy AI，只有前端视觉服务适配器。** 未设置 `window.LOOPMOVE_VISION_ENDPOINT`，也没有实现后端 `/api/vision/inspect`。运行启动脚本只会提供静态文件，不会启动 AI 服务。

| 页面 / 文件 | 当前行为 |
| --- | --- |
| `index.html` | 使用卡通房间预置示例，复用扫描、体积和配套数据；不调用实时 AI |
| `features/scan/index.html` | 未配置接口时使用离线 fixture；配置接口后走 HTTP 识别分支 |
| `features/scan/scan-logic.js` | `createWorkBuddyRecognizer()` 预留上传与解析逻辑，没有 WorkBuddy SDK、密钥或实际模型调用实现 |
| `archive/mobile.html` | 使用 `AI_MOCK` 预置数据，模拟识别与纠正流程 |
| `archive/desktop.html` | 使用预置模拟识别结果，不调用真实视觉模型 |

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

`features/scan/index.html` 的 `ingest()` 根据 `window.LOOPMOVE_VISION_ENDPOINT` 选择分支：

```text
未配置 → inspectPhotos() → SHA-256 匹配离线 fixture
已配置 → inspectPhotosWithRecognizer()
       → createWorkBuddyRecognizer().inspectImage()
       → POST 配置的后端地址 → 规范化结果 → 合并物品 → 展示
```

`workbuddy_vision` 是适配器写入的来源标签，页面据此显示 WorkBuddy 文案；它不会验证后端实际使用了哪个模型。

## WorkBuddy AI 接入路线

详细任务、接口约定和验收标准见 [接入计划](docs/development/WORKBUDDY_INTEGRATION_PLAN.md)。实施顺序：

1. 确认 WorkBuddy 授权和图片输入能力，跑通一张照片的真实识别。
2. 建立后端上传、授权、任务执行和结果校验服务。
3. 修复前端文件保留、超时、错误处理与来源展示。
4. 实现多照片会话和跨照片物品关联。
5. GitHub Pages 部署前端，独立 HTTPS 服务部署后端，再完成端到端验收。

当前 `createWorkBuddyRecognizer()` 只是 LoopMove 自定义 HTTP 适配器，不等于官方 WorkBuddy SDK。GitHub Pages 上需要将 `window.LOOPMOVE_VISION_ENDPOINT` 配置为实际后端的完整 HTTPS 地址；`/api/vision/inspect` 只是项目拟定路由。

## 数据保存与验证

数据保存在当前浏览器的 `localStorage`：

| 键名 | 内容 |
| --- | --- |
| `loopmove_journey_v1` | 完整旅程进度、物品去向及待办勾选 |
| `loopmove_scan` | 独立扫描页保存的清单 |
| `loopmove_map_facility` | 独立配套页保存的关注项 |

“重新开始”重置完整旅程，不影响独立扫描结果。换浏览器、换站点或清除站点数据后，原进度不会自动同步。独立扫描页的保存结果不会自动导入主旅程；主旅程目前使用预置房间示例。

开发检查需要 Node.js：

```bash
node --test tests/journey.test.cjs
node --check features/journey/journey.js
node --check features/journey/journey-logic.js
```

当前 12 项测试已通过，覆盖尺寸校验、物品去向、搬运体积、固定物品、建议保护、刷新恢复及扫描回归。真实浏览器视觉检查尚未执行。开发约束见 [DEVELOPMENT.md](docs/development/DEVELOPMENT.md)。

## 常见问题

- **生成计划按钮不可用**：确认每件物品已有去向；选择带走的物品需有有效尺寸且为可搬状态，再勾选核对确认。
- **浏览器或电脑控制权限**：运行和体验项目 不需要向 Codex 授予这些权限。使用自己的浏览器打开本地地址即可。

- **Pages 打开 404**：确认部署成功、分支与目录正确，并确认已发布的目录包含 `index.html`；独立扫描页使用 `features/scan/index.html` 地址。
- **扫描逻辑未加载**：确认 `features/scan/scan-logic.js` 与页面在同一目录，且已一起提交。
- **演示照片未匹配**：使用五张原图，并在 HTTPS 或本地 `localhost` 环境下打开；普通局域网 HTTP 可能无法计算 SHA-256。
- **修改后未更新**：先确认 Pages 部署完成，再硬刷新浏览器。
- **换浏览器后看不到保存结果**：当前结果只存在原浏览器、原站点的 `localStorage` 中。

## 北都配套与搬家服务

主旅程的配套与最终计划页均提供相关入口，也可从扫描首页点击“生活配套与搬家服务”，或打开 `features/explore/index.html`。

默认展示北部都会区生活配套：四个片区、12 项有官方来源的设施／规划资料，可按交通、教育、医疗、商业、休闲筛选，并切换“现有设施”和“建成后展望”。详情显示状态、已公布的目标时间及官方来源；分期规划不代表同时建成。片区示意不表示精确选址或步行距离，收录不是完整设施清单。

“搬家服务”提供六张可直接跳转的卡片：深圳大件垃圾处理指引、绿在区区、欧绿保电器回收、救世军捐赠站、Carousell 二手家具和 Lalamove 香港本地搬运。支持服务分类与关键词筛选，点击整张卡片在新标签页打开对应网站。此视图不再使用示例地点、地图或定位。北都配套示意图及配套保存保留，支持手机布局和深浅色模式。

Google Maps 仅列为后续目标，本轮没有接入 SDK 或 API。文件分工、接入条件和验收步骤见 [Map 计划](docs/development/MAP_PLAN.md)。
