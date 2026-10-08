/* Verified external service links and sourced facility records. Facility groups are schematic, not coordinates. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.LoopMoveMapData = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const serviceCategories = {all:'全部服务', recycle:'回收处理', donate:'物资捐赠', resale:'二手转卖', moving:'搬运服务'};
  const services = [
    {id:'sz-bulky',name:'深圳大件垃圾处理指引',provider:'深圳市政府',area:'深圳',category:'recycle',icon:'box',kind:'官方指引',description:'家具准备丢弃前，先了解定点投放与预约清运的处理方式。',note:'政策说明页；具体收运安排请向所在小区物业或辖区确认。',action:'查看处理指引',url:'https://www.sz.gov.cn/zfgb/zcjd/content/post_4981833.html'},
    {id:'hk-green',name:'绿在区区',provider:'香港环境保护署',area:'香港',category:'recycle',icon:'recycle',kind:'回收网点',description:'查找社区回收设施，把纸箱、包装和可回收物送到合适的地方。',note:'接收品类及开放安排以各回收设施公告为准。',action:'查找回收设施',url:'https://www.wastereduction.gov.hk/zh-cn/waste-reduction-programme/green-at-community'},
    {id:'hk-alba',name:'欧绿保电器回收',provider:'ALBA IWS',area:'香港',category:'recycle',icon:'appliance',kind:'预约入口',description:'查看废旧电器回收说明，前往机构网站了解上门回收安排。',note:'请先核对适用电器、搬运条件和预约要求。',action:'查看电器回收',url:'https://weee.com.hk/hk/recycling/'},
    {id:'hk-salvation',name:'救世军物资捐赠',provider:'救世军循环再用计划',area:'香港',category:'donate',icon:'heart',kind:'捐赠站查询',description:'让仍可使用的物品继续被需要，按地区查找物资捐赠站。',note:'捐赠前向机构确认接收品类与物品状况要求。',action:'查找捐赠站',url:'https://recycling.salvationarmy.org.hk/collection_points'},
    {id:'hk-carousell',name:'Carousell 家具与家居',provider:'Carousell 旋转拍卖',area:'香港',category:'resale',icon:'tag',kind:'二手平台',description:'浏览家具与家居分类，为闲置物品寻找下一位使用者。',note:'刊登、议价和交接在平台进行；成交价格由买卖双方确认。',action:'打开二手平台',url:'https://www.carousell.com.hk/categories/furniture-home-living-13/'},
    {id:'hk-lalamove',name:'Lalamove 定价帮搬',provider:'Lalamove 香港',area:'香港本地',category:'moving',icon:'truck',kind:'搬运服务',description:'查看香港本地送货及附加搬运服务，按物品和楼宇情况了解费用。',note:'本入口为香港本地服务，不代表提供深圳至香港跨境搬家。',action:'了解搬运服务',url:'https://www.lalamove.com/zh-hk/help-move'}
  ].map(service => ({...service,checkedAt:'2026-10-08'}));
  function filterServices(query='',category='all') {
    const term = String(query).trim().toLocaleLowerCase();
    return services.filter(s => (category === 'all' || s.category === category) &&
      [s.name,s.provider,s.area,s.description].join(' ').toLocaleLowerCase().includes(term));
  }
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
  return {serviceCategories, services, filterServices, facilityCategories, districts, statuses, sources, facilities, filterFacilities};
});
