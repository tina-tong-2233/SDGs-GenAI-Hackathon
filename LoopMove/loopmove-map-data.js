/* Moving service points are fictional. Facilities are sourced planning records; schematic groups are not coordinates. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.LoopMoveMapData = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const categories = {all: '全部地点', recycle: '回收', donate: '捐赠', pickup: '集运', movein: '入住'};
  const bounds = {west: 113.94, east: 114.20, south: 22.43, north: 22.59};
  const places = [
    {id:'sz-recycle', name:'南山回收点 · 示例', area:'深圳 · 南山', category:'recycle', lat:22.55, lng:113.972, accepts:'小家电、电子设备', note:'出发前整理不用的电器。实际接收品类、费用和预约方式需另行核实。'},
    {id:'sz-donate', name:'福田捐赠点 · 示例', area:'深圳 · 福田', category:'donate', lat:22.558, lng:114.043, accepts:'洁净衣物、书籍', note:'先确认物品状况，再向真实机构核实是否接收。'},
    {id:'sz-pickup', name:'深圳集运点 · 示例', area:'深圳 · 罗湖', category:'pickup', lat:22.565, lng:114.128, accepts:'已装箱的搬家物品', note:'用于演示出发前的物品交接。跨境运输要求需向实际承运方确认。'},
    {id:'hk-recycle', name:'元朗回收点 · 示例', area:'香港 · 元朗', category:'recycle', lat:22.455, lng:114.03, accepts:'纸箱、包装材料', note:'搬入后分类整理包装。此处没有真实营业时间或回收承诺。'},
    {id:'hk-donate', name:'上水捐赠点 · 示例', area:'香港 · 上水', category:'donate', lat:22.499, lng:114.117, accepts:'可再使用的家居小物', note:'用于体验附近地点筛选；请勿按此示意位置前往。'},
    {id:'hk-movein', name:'粉岭入住点 · 示例', area:'香港 · 粉岭', category:'movein', lat:22.484, lng:114.166, accepts:'搬入目的地', note:'用于演示选择搬入地点，不对应具体住宅或收货地址。'}
  ];
  const facilityCategories = {all:'全部配套', transport:'交通', education:'教育', medical:'医疗', shopping:'商业', leisure:'休闲'};
  const districts = {all:'全部片区', ktn:'古洞北', fln:'粉岭北 / 上水', st:'新田 / 牛潭尾', hsk:'洪水桥 / 厦村'};
  const statuses = {existing:'现有', building:'建设中', planned:'规划中'};
  const sources = {
    rail:{title:'北部都会区 · 运输基建',url:'https://www.nm.gov.hk/tc/map'},
    ktn:{title:'古洞北发展大纲图',url:'https://www.ktnfln-ndas.gov.hk/tc/text-version/2-1-3-about_project.php'},
    fln:{title:'粉岭北发展大纲图',url:'https://www.ktnfln-ndas.gov.hk/tc/text-version/2-1-4-about_project.php'},
    university:{title:'香港首个五年规划（2026—2030年）第三篇',url:'https://www.info.gov.hk/gia/general/202609/16/P2026091600155p.htm'},
    park:{title:'渔护署 · 塱原自然生态公园',url:'https://enjoyleisure.afcd.gov.hk/zh-HK/whats-on/long-valley-nature-park-overview'},
    hospital:{title:'医院管理局 · 北区医院',url:'https://www.ha.org.hk/visitor/ha_hosp_details.asp?Content_ID=100178&Lang=CHIGB'}
  };
  const facilities = [
    {id:'ktn-station',name:'东铁线古洞站',district:'ktn',category:'transport',status:'building',timing:'目标 2027 年竣工',source:'rail',note:'新增铁路站，服务古洞北新发展区。竣工目标不等于已经开放。'},
    {id:'ktn-town',name:'市镇广场与购物街',district:'ktn',category:'shopping',status:'planned',timing:'本次资料未确认启用时间',source:'ktn',note:'规划在古洞站及公共交通交汇处附近集中零售与社区活动；具体商户尚未核实。'},
    {id:'ktn-sports',name:'古洞北康乐区',district:'ktn',category:'leisure',status:'planned',timing:'本次资料未确认启用时间',source:'ktn',note:'规划包括凤岗山公园、泳池、体育中心和运动场／运动场馆。'},
    {id:'ktn-park',name:'塱原自然生态公园',district:'ktn',category:'leisure',status:'existing',timing:'2024 年 11 月开放',source:'park',note:'邻近古洞北的生态保育、农耕与自然教育设施；出行前查看官方开放安排。'},
    {id:'fln-hospital',name:'北区医院（现有院舍）',district:'fln',category:'medical',status:'existing',timing:'现有医疗服务',source:'hospital',note:'位于上水保健路 9 号。现有院舍与扩建项目分别展示，扩建容量不计入现有设施。'},
    {id:'fln-expansion',name:'北区医院扩建',district:'fln',category:'medical',status:'building',timing:'官方资料：预计最快 2028 年完成',source:'hospital',note:'为北区医院增加设施；具体启用及服务安排以医院管理局公告为准。'},
    {id:'fln-retail',name:'东部中心购物步行街',district:'fln',category:'shopping',status:'planned',timing:'本次资料未确认启用时间',source:'fln',note:'规划有临街商铺、茶座及餐厅；属于规划功能，未列出确定进驻商户。'},
    {id:'fln-central',name:'粉岭北中央公园',district:'fln',category:'leisure',status:'planned',timing:'本次资料未确认启用时间',source:'fln',note:'规划在石湖新村一带建设中央公园，并结合周边社会福利和康乐设施。'},
    {id:'st-university',name:'新田大学城',district:'st',category:'education',status:'planned',timing:'2026—2030 年推进基础建设',source:'university',note:'规划覆盖新田科技城及牛潭尾新发展区，发展专上教育与科研；不是中小学学区或入学保证。'},
    {id:'st-hospital',name:'综合医教研医院',district:'st',category:'medical',status:'planned',timing:'2026—2030 年计划启动建设',source:'university',note:'与香港科技大学医学院建设配套。启动建设时间不是医院开诊日期。'},
    {id:'hsk-station',name:'屯马线洪水桥站',district:'hsk',category:'transport',status:'building',timing:'预计 2030 年竣工',source:'rail',note:'设于天水围站与兆康站之间，服务洪水桥／厦村及邻近地区。'},
    {id:'hsk-university',name:'洪水桥大学城',district:'hsk',category:'education',status:'planned',timing:'规划支持院校于 2027—2028 年率先进驻',source:'university',note:'规划发展专上教育、校园和生活配套；率先进驻不代表整个大学城建成。'}
  ].map(p => ({...p,area:districts[p.district],checkedAt:'2026-10-08'}));
  function filterFacilities({query='',category='all',district='all',view='future'} = {}) {
    const term = String(query).trim().toLocaleLowerCase();
    return facilities.filter(p => (category === 'all' || p.category === category) &&
      (district === 'all' || p.district === district) && (view !== 'current' || p.status === 'existing') &&
      [p.name,p.area,p.note].join(' ').toLocaleLowerCase().includes(term));
  }
  function filterPlaces(query = '', category = 'all') {
    const term = String(query).trim().toLocaleLowerCase();
    return places.filter(p => (category === 'all' || p.category === category) &&
      [p.name, p.area, p.accepts].join(' ').toLocaleLowerCase().includes(term));
  }
  function project(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) return null;
    return {x: (lng - bounds.west) / (bounds.east - bounds.west) * 100, y: (bounds.north - lat) / (bounds.north - bounds.south) * 100};
  }
  return {categories, places, filterPlaces, project, facilityCategories, districts, statuses, sources, facilities, filterFacilities};
});
