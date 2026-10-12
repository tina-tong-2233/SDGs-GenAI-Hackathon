# LoopMove 开发守则

## 1. 目录与运行

- `index.html` 是完整用户旅程入口；`features/scan/index.html` 是独立扫描入口。
- `features/scan/scan-logic.js` 必须与扫描页面放在同一个目录。
- 页面必须通过本地 HTTP 服务器运行，不把 `file://` 直接打开当成标准测试方式。
- 不修改、删除或移动项目的 `.codebuddy` 数据目录。
- 新增资源必须使用相对路径，并在本地 HTTP 服务器下验证。

## 2. 逻辑和界面分离

### `features/scan/index.html` 负责

- 页面结构；
- CSS 和视觉设计；
- 文件选择、拍照、拖放和粘贴；
- 页面导航；
- 结果渲染；
- 用户交互；
- Toast、sheet、主题切换。

### `features/scan/scan-logic.js` 负责

- 识别结果标准化；
- 照片、观察结果和实体数据；
- 跨照片去重；
- 物流目录匹配；
- 尺寸、体积和装箱计算；
- 用户确认后的状态变更；
- 导出数据。

逻辑文件不得直接使用：

```js
document
querySelector
innerHTML
classList
localStorage
```

## 3. AI 检测和物流目录必须分离

AI 负责回答：

> 照片里看到了什么？

物流目录负责回答：

> 如果这个物品的类别已经确认，搬运计算可以使用哪些尺寸和属性？

不能让物流目录变成 AI 的识别白名单。

AI 可以识别目录里没有的物品，例如：

- 瑜伽垫；
- 婴儿车；
- 折叠晾衣架；
- 特殊乐器；
- 非标准柜体。

这些物品必须：

1. 保留 AI 返回的原始名称；
2. 正常显示在照片结果里；
3. 标记为“需要确认类别或尺寸”；
4. 不填充零尺寸；
5. 不默认可装箱；
6. 不自动计入运输体积。

## 4. 物流目录规则

物流目录现在的职责是提供：

- 默认尺寸；
- 软硬材质；
- 是否易碎；
- 是否可能固定；
- 是否可装箱；
- 单独运输规则。

目录匹配必须经过安全函数，不允许直接写：

```js
CATALOG[key]
```

必须使用安全的 own-property 判断，拒绝：

```text
__proto__
constructor
toString
```

未知类别不得通过默认值变成：

```js
width: 0,
depth: 0,
height: 0
```

## 5. 尺寸来源

每个物品的尺寸必须标记来源：

```text
user_measured       用户手动输入
vision_estimate     视觉模型估算
catalog_default     物流目录默认尺寸
unknown             没有可靠尺寸
```

优先级：

```text
user_measured > vision_estimate > catalog_default > unknown
```

`unknown` 物品不能进入体积和装箱计算。

## 6. AI 接口

真实 WorkBuddy 视觉接口必须通过后端 adapter 接入：

```text
浏览器
  → 后端视觉接口
  → WorkBuddy / 视觉模型
  → 严格 JSON 校验
  → LoopMove 逻辑层
  → 页面
```

禁止：

- 把 API Key 写在 HTML；
- 把 API Key 写在前端 JS；
- 从浏览器直接请求带密钥的模型接口；
- 在没有真实服务时显示“正在实时调用 AI”；
- 识别失败后随机使用旧的 mock 结果。

当前没有配置实时视觉接口时，使用明确标注的离线 fixture。

## 7. 识别结果校验

所有视觉服务返回结果都必须校验：

- JSON 结构；
- 类别名称是否为空；
- `bbox` 是否在 0 到 1 范围内；
- 宽高是否大于 0；
- 数量是否为合理整数；
- 尺寸是否为有限正数；
- 不接受 `NaN`、负数和无限大；
- 单张图片失败不能阻塞其他图片。

校验失败时进入：

```text
待确认 / 暂未识别
```

而不是把错误结果继续送入装箱逻辑。

## 8. 多照片与去重

数据关系必须保持：

```text
photo → observation → entity
```

- `photo` 是一张上传图片；
- `observation` 是某张图片中看到的一次物品；
- `entity` 是跨照片去重后的真实物品。

汇总必须按 `entity` 统计，不能按检测框数量统计。

不能因为两张照片都出现“椅子”就自动判断是同一把椅子。存在不确定性时必须保留待确认状态。

## 9. 前端信息设计

结果页优先展示对用户有用的信息：

- 图片里是什么；
- 这个物品来自哪张照片；
- 是否可能重复；
- 是否需要确认；
- 是否有尺寸；
- 是否进入搬家清单。

默认隐藏实现细节：

- 抽帧；
- 位姿恢复；
- 开放词汇检测；
- 深度网络名称；
- 算法实现名称。

精度说明放在结果页附近，并提供详情 sheet。不要把长篇技术说明放在首页最下面。

## 10. 视觉守则

沿用当前移动端视觉方向：

- 暖纸色背景；
- 墨绿色主操作色；
- 琥珀色代表需要确认；
- 统一 SVG 线性图标；
- 稳定的系统无衬线字体；
- 分组列表优先于重复卡片；
- 触控区域不小于 44×44；
- 支持深色模式；
- 支持 `prefers-reduced-motion`。

## 11. 测试要求

修改后至少运行：

### 语法检查

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('features/scan/index.html','utf8');const j=[...h.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].pop()[1];new Function(j);new Function(fs.readFileSync('features/scan/scan-logic.js','utf8'));console.log('ok')"
```

### 启动测试

```bash
python3 -m http.server 8000 --directory .
```

然后访问：

```text
http://localhost:8000/features/scan/index.html
```

### 逻辑测试

至少验证：

- 五张演示照片能匹配；
- 同一家具跨照片只统计一次；
- 未知类别不会产生零体积；
- 未知类别不会默认可装箱；
- 恶意 key 不会导致异常；
- 异常 bbox 和数量会被限制；
- WorkBuddy adapter 返回目录外类别时进入待确认；
- 一张照片失败不影响其他照片。

### 修改完成后的检查

- 运行浏览器渲染测试；
- 检查相对路径；
- 检查移动端布局；
- 检查精度说明位置；
- 检查没有 `[object Object]`、`undefined`、`NaN`；
- 不删除 `.codebuddy`；
- 不把测试截图、临时 probe 或模型密钥放进交付目录。
