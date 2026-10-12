# Map 实现与后续目标

## 北都生活配套（主视图）

- 默认进入“北都生活配套”，与搬家服务网站卡片分开切换。
- 已收录 12 项有官方来源的设施／规划记录，覆盖古洞北、粉岭北／上水、新田／牛潭尾和洪水桥／厦村。
- 交通、教育、医疗、商业、休闲五类筛选，可与片区和搜索组合。
- “现有设施”只计入现有记录；“建成后展望”叠加现有、建设中、规划中记录，并显示各自状态。不存在统一的全区建成年份。
- 每条详情提供官方来源、核查日期（2026-10-08）及目标时间；缺乏确认的时间明确标注。
- 使用片区关系示意，不为未核实选址的规划项目编造坐标，不计算步行距离或宣称服务覆盖。
- 本轮为部分资料收录，空结果不表示当地没有设施。教育类目前收录大学城，不代表完整学校清单或学区资格。
- 关注配套保存至 `localStorage.loopmove_map_facility`；搬家服务卡片直接打开外部网站。

资料来源链接见 `features/explore/explore-data.js` 中的 `sources`，亦可从每条详情直接访问。

验收：默认显示 12 项；切至现有显示 2 项；新田片区＋现有显示“暂无收录”；新田片区＋展望＋医疗显示综合医教研医院；切回搬家服务显示六个网站入口；返回配套后可恢复保存的关注项。

## 搬家服务网站卡片

入口为 `features/explore/index.html`，扫描首页提供“生活配套与搬家服务”链接。

- 用六张网站卡片替代旧版虚构服务点，移除服务地图、定位、坐标及“下一站”保存功能。
- 回收处理、物资捐赠、二手转卖、搬运服务四类，支持关键词组合筛选与空结果重置。
- 每张卡片使用真实 HTTPS 链接，整张可点击，新标签页打开，支持键盘访问。
- 卡片显示机构、服务地区、简介、使用提示、域名与跳转动作。深圳入口明确为政策指引，香港本地搬运不被描述为跨境服务。
- 核查于 2026-10-08。网站可能更新，服务条件由机构或平台确定。

| 入口 | 链接 |
| --- | --- |
| 深圳大件垃圾处理指引 | https://www.sz.gov.cn/zfgb/zcjd/content/post_4981833.html |
| 绿在区区 | https://www.wastereduction.gov.hk/zh-cn/waste-reduction-programme/green-at-community |
| 欧绿保电器回收 | https://weee.com.hk/hk/recycling/ |
| 救世军捐赠站 | https://recycling.salvationarmy.org.hk/collection_points |
| Carousell 家具与家居 | https://www.carousell.com.hk/categories/furniture-home-living-13/ |
| Lalamove 定价帮搬 | https://www.lalamove.com/zh-hk/help-move |

## 文件分工

- `features/explore/index.html`：配套示意图、网站卡片容器与导航。
- `features/explore/explore.css`：响应式布局、主题、卡片样式。
- `features/explore/explore-data.js`：官方配套记录、服务链接、分类和搜索过滤。
- `features/explore/explore.js`：视图切换、筛选、卡片与配套详情渲染、配套保存。

## Future goal：Google Maps（未开发）

可行性结论：从架构上，原生 JavaScript 页面可以接入 Maps JavaScript API；本轮仅查阅官方接入要求，未进行真实 API 或目标网络验证。没有添加 Google SDK、API Key、网络请求或计费配置。

后续实施前需要确认：

1. 创建或选择 Google Cloud 项目，启用 Maps JavaScript API；按正式接入要求配置计费与 API Key。
2. 对浏览器 Key 配置网站来源与 API 限制，设置额度和预算监控。不要使用无限制 Key。浏览器地图 Key 与后端服务凭证分别管理。
3. 在实际部署域名、深圳与香港目标网络和移动设备上验证可用性、加载时间与失败体验。
4. 建立真实地点数据来源，核实服务范围、接收物品、地址、营业时间及更新时间；未核实的设施不得伪装成 Google Places 结果。
5. 将北都配套片区示意替换为真实地图与标记，保留列表、筛选与详情流程。按需求另行评估 Places 和路线服务，核对对应成本及条款。
6. 地图加载或授权失败时保留地点列表并提供明确提示；定位仍由用户主动触发。

验收：实际域名下地图成功加载；标记和真实地点对应；过滤和详情联动；权限拒绝及网络失败有可用降级；没有将跨境直线连接当作可通行路线。

官方资料（核查于 2026-10-08）：

- [Maps JavaScript API 设置](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [用量与计费](https://developers.google.com/maps/documentation/javascript/usage-and-billing)

## 本地检查

运行 `bash scripts/start.sh`，打开 `http://localhost:8000/features/explore/index.html`。

搬家服务视图手动验收：显示六张卡片；筛选“捐赠”只显示救世军；搜索“深圳”显示处理指引；搜索无匹配词显示空状态并能重置；点击每张卡片打开对应网站；切回北都配套仍支持现有／展望、片区筛选和保存。检查手机、桌面、深浅色及键盘访问。

## 验证记录

JavaScript 语法及模拟 DOM 交互检查覆盖网站链接属性、服务筛选／空结果／重置、双视图切换与配套筛选／保存恢复。真实浏览器视觉验收受当前环境权限限制，尚未完成。
