/* LoopMove 扫描逻辑层
 * 纯数据与业务规则：不访问 DOM，不渲染 HTML，不调用 localStorage。
 * 本轮五张照片的识别结果是 WorkBuddy 多模态离线审核后固化的 fixture，
 * 不是浏览器实时调用 ChatGPT，也不会对未匹配照片随机套用结果。
 */
(function(root, factory){
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.LoopMoveLogic = api;
})(typeof window !== 'undefined' ? window : null, function(){
  'use strict';

  var LOGISTICS_CATALOG = {
    bed:{zh:'床架',en:'Bed frame',group:'家具',icon:'bed',width:150,depth:200,height:35,category:'furn',fixed:false},
    mattress:{zh:'双人床垫',en:'Double mattress',group:'软装',icon:'bed',width:150,depth:200,height:25,category:'soft',soft:true,fixed:false},
    desk:{zh:'书桌',en:'Desk',group:'家具',icon:'desk',width:120,depth:60,height:75,category:'furn',fixed:false},
    bookshelf:{zh:'开放置物架',en:'Open shelving',group:'家具',icon:'bookshelf',width:120,depth:35,height:180,category:'furn',fixed:'confirm'},
    wardrobe:{zh:'衣柜',en:'Wardrobe',group:'家具',icon:'cabinet',width:100,depth:60,height:200,category:'furn',fixed:'confirm'},
    chair:{zh:'椅子',en:'Chair',group:'家具',icon:'chair',width:45,depth:50,height:90,category:'furn'},
    stool:{zh:'凳子',en:'Stool',group:'家具',icon:'chair',width:50,depth:50,height:75,category:'furn'},
    clothes:{zh:'衣物（一组）',en:'Clothing bundle',group:'软装',icon:'clothes',width:60,depth:40,height:30,category:'soft',soft:true},
    backpack:{zh:'背包',en:'Backpack',group:'个人物品',icon:'bag',width:35,depth:18,height:45,category:'soft',soft:true},
    laptop:{zh:'笔记本电脑',en:'Laptop',group:'电子设备',icon:'laptop',width:32,depth:22,height:2,category:'elec',fragile:true},
    monitor:{zh:'显示器',en:'Monitor',group:'电子设备',icon:'monitor',width:60,depth:15,height:40,category:'elec',fragile:true},
    smallAppliances:{zh:'桌面小家电（一组）',en:'Small appliances',group:'家电',icon:'appliance',width:45,depth:35,height:35,category:'app'},
    riceCooker:{zh:'电饭煲',en:'Rice cooker',group:'家电',icon:'cooker',width:30,depth:28,height:25,category:'app'},
    kettle:{zh:'电热水壶',en:'Kettle',group:'家电',icon:'kettle',width:25,depth:20,height:25,category:'app'},
    plant:{zh:'盆栽',en:'Potted plant',group:'日用品',icon:'plant',width:40,depth:40,height:80,category:'daily'},
    deskItems:{zh:'桌面线材与小杂物（一组）',en:'Desk items bundle',group:'杂物',icon:'box',width:45,depth:35,height:25,category:'soft',soft:true},
    bedding:{zh:'床上用品（一组）',en:'Bedding bundle',group:'软装',icon:'quilt',width:60,depth:45,height:35,category:'soft',soft:true},
    door:{zh:'房门',en:'Door',group:'固定设施',icon:'door',width:90,depth:5,height:205,category:'fixed',fixed:true},
    mirror:{zh:'门上镜子',en:'Door mirror',group:'固定设施',icon:'mirror',width:35,depth:3,height:100,category:'fixed',fixed:true},
    window:{zh:'窗户',en:'Window',group:'固定设施',icon:'window',width:120,depth:8,height:120,category:'fixed',fixed:true}
  };

  var CONTAINERS = [
    {id:'boxL',zh:'大号搬家纸箱',icon:'box',width:60,depth:50,height:50,volume:.130},
    {id:'bag28',zh:'28 寸行李箱',icon:'suitcase',width:77,depth:52,height:30,volume:.095},
    {id:'boxM',zh:'中号纸箱',icon:'box',width:45,depth:40,height:40,volume:.062},
    {id:'bag24',zh:'24 寸行李箱',icon:'suitcase',width:61,depth:42,height:26,volume:.056},
    {id:'boxS',zh:'小号纸箱',icon:'box',width:35,depth:30,height:30,volume:.026}
  ];

  var REFERENCES = {
    door:{zh:'房门',standard:2.03},
    tile:{zh:'地砖',standard:.60},
    a4:{zh:'A4 纸',standard:.297}
  };

  var FIXTURE = {
    id:'bedroom-five-photos-v1',
    mode:'offline_reviewed_fixture',
    liveRecognition:false,
    reviewedBy:'WorkBuddy 多模态离线审核',
    reviewedAt:'本次原图审核',
    note:'只记录照片中清楚可见、对搬家有用的物品；小物品按组聚合。画面分组不代表真实空间分割。',
    photos:[
      {id:'photo-01',label:'书桌与床',width:1276,height:2270,size:340082,sha256:'31d6184a3126b75d7d00e4794156b111daa92af8854d3dcee283907989c03773',groups:[
        {id:'p1-desk',label:'书桌与开放架',basis:'curated_visual_group'},
        {id:'p1-bed',label:'床面',basis:'curated_visual_group'}
      ],observations:[
        {id:'obs-01-bed',entityId:'entity-bed',key:'bed',certainty:'high',bbox:{x:.02,y:.46,w:.96,h:.50},groupId:'p1-bed',note:'床架大部分可见'},
        {id:'obs-01-mattress',entityId:'entity-mattress',key:'mattress',certainty:'high',bbox:{x:.03,y:.51,w:.95,h:.34},groupId:'p1-bed'},
        {id:'obs-01-desk',entityId:'entity-desk',key:'desk',certainty:'high',bbox:{x:.00,y:.31,w:.63,h:.28},groupId:'p1-desk'},
        {id:'obs-01-shelf',entityId:'entity-bookshelf',key:'bookshelf',certainty:'high',bbox:{x:.03,y:.00,w:.58,h:.35},groupId:'p1-desk',note:'可能与墙体固定，需确认是否搬走'},
        {id:'obs-01-laptop',entityId:'entity-laptop',key:'laptop',certainty:'high',bbox:{x:.08,y:.38,w:.23,h:.14},groupId:'p1-desk'},
        {id:'obs-01-appliance',entityId:'entity-small-appliances',key:'smallAppliances',certainty:'medium',bbox:{x:.00,y:.29,w:.24,h:.17},groupId:'p1-desk',note:'桌面左侧可见多个小家电，建议拆分核对'},
        {id:'obs-01-items',entityId:'entity-desk-items',key:'deskItems',certainty:'medium',bbox:{x:.18,y:.38,w:.42,h:.17},groupId:'p1-desk'},
        {id:'obs-01-bedding',entityId:'entity-bedding',key:'bedding',certainty:'high',bbox:{x:.04,y:.54,w:.84,h:.25},groupId:'p1-bed'}
      ]},
      {id:'photo-02',label:'床与挂衣',width:958,height:1704,size:148467,sha256:'352046bee6df6d96931737d9f65a355340ee298068089268da4a120b54317c89',groups:[
        {id:'p2-bed',label:'床面',basis:'curated_visual_group'},
        {id:'p2-wardrobe',label:'衣柜与挂衣',basis:'curated_visual_group'}
      ],observations:[
        {id:'obs-02-bed',entityId:'entity-bed',key:'bed',certainty:'high',bbox:{x:.00,y:.42,w:.98,h:.55},groupId:'p2-bed'},
        {id:'obs-02-mattress',entityId:'entity-mattress',key:'mattress',certainty:'high',bbox:{x:.00,y:.47,w:.98,h:.35},groupId:'p2-bed'},
        {id:'obs-02-wardrobe',entityId:'entity-wardrobe',key:'wardrobe',certainty:'high',bbox:{x:.52,y:.00,w:.48,h:.61},groupId:'p2-wardrobe',note:'看起来像固定柜体，需确认'},
        {id:'obs-02-clothes',entityId:'entity-clothes',key:'clothes',certainty:'high',bbox:{x:.52,y:.20,w:.48,h:.31},groupId:'p2-wardrobe'},
        {id:'obs-02-chair',entityId:'entity-chair',key:'chair',certainty:'medium',bbox:{x:.52,y:.44,w:.46,h:.30},groupId:'p2-bed',note:'部分被衣物遮挡'}
      ]},
      {id:'photo-03',label:'衣柜与房门',width:958,height:1704,size:130455,sha256:'46582419afb6af6db10e8b01db0aae83160e8778641f6f40fdc6994374ff4040',groups:[
        {id:'p3-closet',label:'柜体附近',basis:'curated_visual_group'},
        {id:'p3-door',label:'房门一侧',basis:'curated_visual_group'}
      ],observations:[
        {id:'obs-03-wardrobe',entityId:'entity-wardrobe',key:'wardrobe',certainty:'high',bbox:{x:.11,y:.00,w:.56,h:.53},groupId:'p3-closet'},
        {id:'obs-03-clothes',entityId:'entity-clothes',key:'clothes',certainty:'high',bbox:{x:.12,y:.24,w:.55,h:.28},groupId:'p3-closet'},
        {id:'obs-03-backpack',entityId:'entity-backpack',key:'backpack',certainty:'high',bbox:{x:.62,y:.32,w:.18,h:.24},groupId:'p3-closet'},
        {id:'obs-03-chair',entityId:'entity-chair',key:'chair',certainty:'medium',bbox:{x:.18,y:.48,w:.48,h:.28},groupId:'p3-closet'},
        {id:'obs-03-door',entityId:'entity-door',key:'door',certainty:'high',bbox:{x:.77,y:.00,w:.23,h:.78},groupId:'p3-door',note:'固定设施，不加入搬家清单'}
      ]},
      {id:'photo-04',label:'房门与镜面',width:958,height:1704,size:95372,sha256:'3809c155c4480d1aee3c4005738f5cc3da18da85b931e800c7210549b7ea047e',groups:[
        {id:'p4-door',label:'整张照片',basis:'curated_visual_group'}
      ],observations:[
        {id:'obs-04-door',entityId:'entity-door',key:'door',certainty:'high',bbox:{x:.21,y:.15,w:.60,h:.70},groupId:'p4-door',note:'固定设施，不加入搬家清单'},
        {id:'obs-04-mirror',entityId:'entity-mirror',key:'mirror',certainty:'high',bbox:{x:.31,y:.22,w:.26,h:.51},groupId:'p4-door',note:'门上固定镜面，需确认是否可拆'},
        {id:'obs-04-backpack',entityId:'entity-backpack',key:'backpack',certainty:'medium',bbox:{x:.00,y:.47,w:.18,h:.23},groupId:'p4-door',note:'只看到部分'}
      ]},
      {id:'photo-05',label:'窗边桌面',width:1276,height:2270,size:349799,sha256:'df7396db1336a506db31953017010fee4492c62cf50db0aa9b27ac2815581462',groups:[
        {id:'p5-window',label:'窗边与桌面',basis:'curated_visual_group'},
        {id:'p5-storage',label:'桌下收纳',basis:'curated_visual_group'}
      ],observations:[
        {id:'obs-05-window',entityId:'entity-window',key:'window',certainty:'high',bbox:{x:.00,y:.00,w:.45,h:.35},groupId:'p5-window',note:'固定设施，不加入搬家清单'},
        {id:'obs-05-desk',entityId:'entity-desk',key:'desk',certainty:'high',bbox:{x:.37,y:.20,w:.63,h:.45},groupId:'p5-window'},
        {id:'obs-05-plant',entityId:'entity-plant',key:'plant',certainty:'high',bbox:{x:.33,y:.28,w:.18,h:.28},groupId:'p5-window'},
        {id:'obs-05-rice',entityId:'entity-rice',key:'riceCooker',certainty:'high',bbox:{x:.72,y:.22,w:.18,h:.16},groupId:'p5-window'},
        {id:'obs-05-kettle',entityId:'entity-kettle',key:'kettle',certainty:'medium',bbox:{x:.82,y:.23,w:.12,h:.19},groupId:'p5-window'},
        {id:'obs-05-stool',entityId:'entity-stool',key:'stool',certainty:'high',bbox:{x:.28,y:.63,w:.30,h:.28},groupId:'p5-window'},
        {id:'obs-05-items',entityId:'entity-desk-items',key:'deskItems',certainty:'medium',bbox:{x:.55,y:.36,w:.40,h:.22},groupId:'p5-window'},
        {id:'obs-05-clothes',entityId:'entity-clothes',key:'clothes',certainty:'medium',bbox:{x:.00,y:.57,w:.30,h:.30},groupId:'p5-storage',note:'部分被遮挡'}
      ]}
    ]
  };

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function hasOwn(obj,key){ return Object.prototype.hasOwnProperty.call(obj,key); }
  function catalog(key){ return key && hasOwn(LOGISTICS_CATALOG,key) ? LOGISTICS_CATALOG[key] : null; }
  function defaultDisplay(label){ return {zh:label || '待确认物品',en:label || 'Unconfirmed item',group:'待确认',icon:'alert',fixedStatus:'unknown',packability:'unknown'}; }
  function fixedStatusOf(c){ return c ? (c.fixedStatus || (c.fixed===true?'fixed':c.fixed==='confirm'?'confirm':'movable')) : 'unknown'; }
  function displayForObservation(obs){
    var c=catalog(obs && obs.catalogKey), fs=fixedStatusOf(c);
    return {
      label:(obs && (obs.displayLabel || obs.detectionLabel)) || (c && c.zh) || '待确认物品',
      group:(c && c.group) || '待确认',
      icon:(c && c.icon) || 'alert',
      fixed:fs==='fixed',
      fixedCandidate:fs==='confirm' || !!(obs && obs.logisticsStatus==='fixed_or_built_in'),
      status:obs && obs.logisticsStatus || (c ? 'ready' : 'needs_category'),
      statusText:obs && obs.logisticsStatus==='ready' ? '' : obs && obs.logisticsStatus==='fixed_or_built_in' ? '可能是固定设施' : '需要确认类别或尺寸'
    };
  }
  function displayForEntity(entity){
    var c=catalog(entity && entity.catalogKey), fs=fixedStatusOf(c);
    return {
      label:(entity && (entity.displayLabel || entity.detectionLabel || entity.label)) || (c && c.zh) || '待确认物品',
      group:(entity && entity.group) || (c && c.group) || '待确认',
      icon:(entity && entity.icon) || (c && c.icon) || 'alert',
      fixed:entity && (entity.logisticsStatus==='fixed_or_built_in' || fs==='fixed'),
      status:entity && entity.logisticsStatus || 'needs_category',
      statusText:entity && entity.logisticsStatus==='ready' ? '' : entity && entity.logisticsStatus==='fixed_or_built_in' ? '固定设施候选' : '需要确认'
    };
  }
  function resolveLogisticsMetadata(detection){
    var requested=detection && (detection.catalogKey || detection.key);
    if(requested && catalog(requested)) return {catalogKey:requested,classificationStatus:'matched',logisticsStatus:'ready',metadataBasis:'explicit_catalog_key'};
    var label=String((detection && (detection.displayLabel || detection.detectionLabel || detection.label)) || '').trim().toLowerCase();
    var keys=Object.keys(LOGISTICS_CATALOG).filter(function(key){
      var c=LOGISTICS_CATALOG[key], hay=[key,c.zh,c.en].concat(c.aliases||[]).join(' ').toLowerCase();
      return label && (hay.indexOf(label)>=0 || label.indexOf(String(c.zh).toLowerCase())>=0 || label.indexOf(String(c.en).toLowerCase())>=0);
    });
    if(keys.length===1) return {catalogKey:keys[0],classificationStatus:'matched',logisticsStatus:'ready',metadataBasis:'label_alias_match'};
    if(keys.length>1) return {catalogKey:null,candidateKeys:keys,classificationStatus:'ambiguous',logisticsStatus:'needs_category',metadataBasis:'multiple_catalog_candidates'};
    return {catalogKey:null,candidateKeys:[],classificationStatus:label?'unmapped':'unknown',logisticsStatus:'needs_dimensions',metadataBasis:'no_catalog_match'};
  }
  function dimensionsForKey(key, scale){
    var c=catalog(key); if(!c) return null;
    var s=scale || 1;
    return {width:Math.round(c.width*s),depth:Math.round(c.depth*s),height:Math.round(c.height*s),source:'catalog_default'};
  }
  function validDimensions(d){ return !!(d && Number.isFinite(Number(d.width)) && Number.isFinite(Number(d.depth)) && Number.isFinite(Number(d.height)) && d.width>0 && d.depth>0 && d.height>0); }
  function volume(item){ var d=item && item.dimensionsCm; return validDimensions(d) ? (d.width*d.depth*d.height)/1000000 : null; }
  function itemVolume(item){ var v=volume(item); return v===null ? null : v*(item.quantity || 1); }
  function canPack(item){
    if(!item || item.logisticsStatus!=='ready' || !validDimensions(item.dimensionsCm)) return 'unknown';
    var c=catalog(item.catalogKey);
    if(fixedStatusOf(c)==='fixed' || fixedStatusOf(c)==='confirm') return false;
    var v=volume(item);
    if(v===null) return 'unknown';
    if(v>.16) return false;
    if(c && c.material!=='soft' && !c.soft && Math.max(item.dimensionsCm.width,item.dimensionsCm.depth,item.dimensionsCm.height)>60) return false;
    return true;
  }
  function normalizeBBox(b){
    if(!b || ![b.x,b.y,b.w,b.h].every(function(v){return Number.isFinite(Number(v));})) return null;
    var x=Math.max(0,Math.min(1,Number(b.x))), y=Math.max(0,Math.min(1,Number(b.y)));
    var w=Math.max(0,Math.min(1-x,Number(b.w))), h=Math.max(0,Math.min(1-y,Number(b.h)));
    return w>0 && h>0 ? {x:x,y:y,w:w,h:h} : null;
  }
  function normalizeObservation(raw,photoId,index){
    var rawLabel=raw && (raw.displayLabel || raw.detectionLabel || raw.label || (catalog(raw.key)||{}).zh) || '待确认物品';
    var meta=resolveLogisticsMetadata(raw || {}), key=meta.catalogKey;
    var c=catalog(key), dims=dimensionsForKey(key,1);
    var qty=Math.max(1,Math.min(99,Math.round(Number(raw && (raw.quantity || raw.qty)) || 1)));
    var fixedStatus=fixedStatusOf(c)==='fixed' ? 'fixed_or_built_in' : (fixedStatusOf(c)==='confirm' ? 'fixed_or_built_in' : meta.logisticsStatus);
    return {
      id:(raw && raw.id) || ('obs-'+photoId+'-'+(index+1)), photoId:photoId, entityId:(raw && raw.entityId) || ('entity-'+photoId+'-'+(index+1)),
      detectionLabel:String(rawLabel), displayLabel:String(rawLabel), objectType:raw && raw.objectType || null, quantity:qty,
      certainty:raw && ['high','medium','low'].indexOf(raw.certainty)>=0 ? raw.certainty : 'medium', bbox:normalizeBBox(raw && raw.bbox),
      groupId:raw && raw.groupId || null, note:raw && raw.note || '', occluded:!!(raw && raw.occluded),
      catalogKey:key, candidateKeys:meta.candidateKeys || [], classificationStatus:meta.classificationStatus,
      logisticsStatus:fixedStatus, metadataBasis:meta.metadataBasis, dimensionsCm:dims, dimensionsSource:dims?'catalog_default':'unknown',
      requiresReview:meta.logisticsStatus!=='ready'
    };
  }
  function normalizePhoto(photo){
    return {
      id:photo.id,
      order:photo.order,
      fileName:photo.fileName || ('照片 '+(photo.order+1)),
      src:photo.src || '',
      width:photo.width || 0,
      height:photo.height || 0,
      size:photo.size || 0,
      sha256:photo.sha256 || null
    };
  }
  function matchFixture(photo){
    if(!photo || !photo.sha256) return null;
    var p=FIXTURE.photos.find(function(x){ return !!x.sha256 && photo.sha256===x.sha256; });
    return p || null;
  }
  function entityFromObservation(obs){
    var c=catalog(obs.catalogKey), d=displayForObservation(obs);
    return {
      id:obs.entityId,
      detectionLabel:obs.detectionLabel,
      displayLabel:obs.displayLabel,
      catalogKey:obs.catalogKey,
      classificationStatus:obs.classificationStatus,
      logisticsStatus:obs.logisticsStatus,
      group:d.group,
      icon:d.icon,
      label:d.label,
      quantity:obs.quantity || 1,
      observationIds:[],
      dimensionsCm:obs.dimensionsCm ? clone(obs.dimensionsCm) : null,
      source:obs.dimensionsCm ? 'catalog_default' : 'unknown',
      manual:false,
      fixed:fixedStatusOf(c)==='fixed',
      fixedStatus:obs.logisticsStatus==='fixed_or_built_in'?'需确认固定方式':(fixedStatusOf(c)==='fixed'?'固定设施':''),
      needsReview:obs.logisticsStatus!=='ready'
    };
  }
  function createSession(){
    return {schemaVersion:2,fixtureId:FIXTURE.id,mode:FIXTURE.mode,liveRecognition:false,photos:[],entities:[],activePhotoId:null,resultView:'items',selectedObservationId:null,calibration:{mode:'none',referenceKind:null,measuredValueM:null,scale:1}};
  }
  function inspectPhoto(photo){
    var p=normalizePhoto(photo), f=matchFixture(p);
    if(!f){
      p.status='unsupported';
      p.source='no_live_vision_adapter';
      p.observations=[]; p.groups=[];
      p.message='这张照片没有匹配到已审核结果；当前版本没有实时视觉识别服务。';
      return p;
    }
    p.status='reviewed-fixture';
    p.source=FIXTURE.mode;
    p.fixtureId=FIXTURE.id;
    p.groups=clone(f.groups);
    p.observations=f.observations.map(function(obs,index){return normalizeObservation(obs,p.id,index);});
    p.message='本轮照片的离线审核结果';
    return p;
  }
  function rebuildEntities(session){
    var map={};
    session.photos.forEach(function(photo){
      (photo.observations||[]).forEach(function(obs){
        if(!map[obs.entityId]) map[obs.entityId]=entityFromObservation(obs);
        if(map[obs.entityId].observationIds.indexOf(obs.id)<0) map[obs.entityId].observationIds.push(obs.id);
      });
    });
    session.entities=Object.keys(map).map(function(k){
      var e=map[k];
      if(e.fixed) e.includeByDefault=false;
      else e.includeByDefault=true;
      return e;
    });
    return session;
  }
  function inspectPhotos(photos){
    var s=createSession();
    s.photos=(photos||[]).map(inspectPhoto);
    s.activePhotoId=s.photos[0] ? s.photos[0].id : null;
    return rebuildEntities(s);
  }
  function inspectDetections(photo,detections,source){
    var p=normalizePhoto(photo);
    p.status='recognized'; p.source=source || 'vision_adapter'; p.liveRecognition=source==='workbuddy_vision';
    p.groups=[]; p.observations=(detections||[]).map(function(raw,index){return normalizeObservation(raw,p.id,index);});
    p.message='视觉识别结果'; return p;
  }
  function inspectPhotosWithRecognizer(photos,recognizer){
    var list=photos || [];
    return Promise.all(list.map(function(photo){
      return Promise.resolve().then(function(){return recognizer.inspectImage ? recognizer.inspectImage(photo) : recognizer(photo);}).then(function(result){
        if(!result || result.status==='error') throw new Error((result&&result.message)||'识别失败');
        return inspectDetections(photo,result.observations || result.items || [],result.source || 'vision_adapter');
      }).catch(function(error){
        var p=normalizePhoto(photo);p.status='error';p.source='vision_adapter';p.observations=[];p.groups=[];p.message=error.message || '识别失败';return p;
      });
    })).then(function(processed){var s=createSession();s.mode='vision_adapter';s.liveRecognition=processed.some(function(p){return p.liveRecognition;});s.photos=processed;s.activePhotoId=s.photos[0] ? s.photos[0].id : null;return rebuildEntities(s);});
  }
  function createWorkBuddyRecognizer(options){
    options=options || {};
    return {inspectImage:function(photo){
      if(typeof fetch!=='function') return Promise.reject(new Error('当前环境没有可用的视觉服务')); 
      var form=new FormData();
      if(photo.file) form.append('image',photo.file,photo.fileName || 'image.jpg');
      else form.append('image_data',photo.src || '');
      form.append('file_name',photo.fileName || 'image.jpg');
      return fetch(options.endpoint || '/api/vision/inspect',{method:'POST',body:form,headers:options.headers || {}}).then(function(r){if(!r.ok) throw new Error('视觉服务返回 '+r.status);return r.json();}).then(function(data){return {status:'ok',source:'workbuddy_vision',observations:data.observations || data.items || []};});
    }};
  }
  function selectPhoto(session,photoId){ var s=clone(session); if(s.photos.some(function(p){return p.id===photoId;})) s.activePhotoId=photoId; return s; }
  function setResultView(session,view){ var s=clone(session); s.resultView=view==='regions'?'regions':'items'; return s; }
  function getPhotoResult(session,photoId){
    var p=session.photos.find(function(x){return x.id===(photoId||session.activePhotoId);});
    if(!p) return null;
    var entities={};
    (p.observations||[]).forEach(function(obs){ entities[obs.entityId]=session.entities.find(function(e){return e.id===obs.entityId;}) || entityFromObservation(obs); });
    return {photo:p,groups:p.groups||[],observations:p.observations||[],entities:Object.keys(entities).map(function(k){return entities[k];})};
  }
  function updateObservation(session,observationId,patch){
    var s=clone(session);
    s.photos.forEach(function(p){ p.observations=(p.observations||[]).map(function(o){ return o.id===observationId ? Object.assign({},o,patch,{requiresReview:true}) : o; }); });
    rebuildEntities(s); return s;
  }
  function mergeEntities(session,entityIds,targetId){
    var s=clone(session); var keep=targetId || entityIds[0];
    s.entities=s.entities.filter(function(e){return entityIds.indexOf(e.id)<0 || e.id===keep;});
    s.photos.forEach(function(p){ (p.observations||[]).forEach(function(o){if(entityIds.indexOf(o.entityId)>=0)o.entityId=keep;}); });
    return rebuildEntities(s);
  }
  function splitEntity(session,entityId,observationIds){
    var s=clone(session), newId=entityId+'-split-'+Date.now();
    s.photos.forEach(function(p){ (p.observations||[]).forEach(function(o){if(observationIds.indexOf(o.id)>=0)o.entityId=newId;}); });
    return rebuildEntities(s);
  }
  function updateEntity(session,entityId,patch){
    var s=clone(session); s.entities=s.entities.map(function(e){return e.id===entityId ? Object.assign({},e,patch,{manual:true,source:'user_edited'}) : e;}); return s;
  }
  function applyCalibration(session,referenceKind,measuredValueM){
    var s=clone(session), ref=REFERENCES[referenceKind];
    if(!ref || !measuredValueM || measuredValueM<=0) return {ok:false,error:'请输入有效的参照物尺寸',session:s};
    var scale=measuredValueM/ref.standard;
    if(scale<.7 || scale>1.4) return {ok:false,error:'这个尺寸与标准值差异过大，请复核',session:s};
    s.calibration={mode:'user_reference',referenceKind:referenceKind,measuredValueM:measuredValueM,scale:scale};
    s.entities=s.entities.map(function(e){
      if(e.manual || e.logisticsStatus!=='ready' || !catalog(e.catalogKey)) return e;
      var d=dimensionsForKey(e.catalogKey,scale); return Object.assign({},e,{dimensionsCm:d,source:'calibrated_estimate'});
    });
    return {ok:true,session:s};
  }
  function setEntityDisposition(session,entityId,disposition){
    var s=clone(session), nextStatus;
    s.entities=s.entities.map(function(e){
      if(e.id!==entityId) return e;
      if(disposition==='fixed') nextStatus='fixed_or_built_in';
      else if(disposition==='movable') nextStatus=e.dimensionsCm?'ready':'needs_dimensions';
      else nextStatus='needs_dimensions';
      return Object.assign({},e,{logisticsStatus:nextStatus,fixed:disposition==='fixed',includeByDefault:disposition!=='fixed',needsReview:nextStatus!=='ready' && nextStatus!=='fixed_or_built_in',manual:true});
    });
    s.photos.forEach(function(p){(p.observations||[]).forEach(function(o){if(o.entityId===entityId){o.logisticsStatus=nextStatus;o.requiresReview=nextStatus!=='ready' && nextStatus!=='fixed_or_built_in';}});});
    return s;
  }
  function setEntityDimensions(session,entityId,dimensionsCm){
    var s=clone(session);
    if(!validDimensions(dimensionsCm)) return {ok:false,error:'请输入大于 0 的长、宽、高',session:s};
    s.entities=s.entities.map(function(e){return e.id===entityId ? Object.assign({},e,{dimensionsCm:{width:Number(dimensionsCm.width),depth:Number(dimensionsCm.depth),height:Number(dimensionsCm.height),source:'user_measured'},source:'user_measured',logisticsStatus:'ready',needsReview:false,manual:true,includeByDefault:true,fixed:false}) : e;});
    s.photos.forEach(function(p){(p.observations||[]).forEach(function(o){if(o.entityId===entityId){o.logisticsStatus='ready';o.requiresReview=false;o.dimensionsCm={width:Number(dimensionsCm.width),depth:Number(dimensionsCm.depth),height:Number(dimensionsCm.height),source:'user_measured'};}});});
    return {ok:true,session:s};
  }
  function buildInventory(session){
    return session.entities.filter(function(e){return e.includeByDefault!==false && e.logisticsStatus==='ready' && !e.fixed && validDimensions(e.dimensionsCm);}).map(function(e){return Object.assign({},e,{volumeM3:itemVolume(e)});});
  }
  function buildPackPlan(session){
    var allEntities=session.entities || [], items=buildInventory(session), needsReview=allEntities.filter(function(e){return e.logisticsStatus!=='ready' && !e.fixed;}), fixed=allEntities.filter(function(e){return e.fixed || e.logisticsStatus==='fixed_or_built_in';}), big=items.filter(function(i){return canPack(i)===false;}), small=items.filter(function(i){return canPack(i)===true;});
    var bigVolume=big.reduce(function(a,i){return a+(itemVolume(i)||0);},0)*1.1;
    var smallVolume=small.reduce(function(a,i){return a+(itemVolume(i)||0);},0)*1.1;
    var use={}, remaining=smallVolume, pool=CONTAINERS.slice().sort(function(a,b){return b.volume-a.volume;}), guard=0;
    while(remaining>.008 && guard++<200){ var c=pool.find(function(x){return x.volume<=remaining+1e-9;}) || pool[pool.length-1]; use[c.id]=(use[c.id]||0)+1; remaining-=c.volume; }
    return {items:items,big:big,small:small,needsReview:needsReview,fixed:fixed,bigVolume:bigVolume,smallVolume:smallVolume,totalVolume:bigVolume+smallVolume,containers:use,padding:1.1};
  }
  function exportPayload(session){
    var plan=buildPackPlan(session);
    return {schemaVersion:3,generatedAt:new Date().toISOString(),source:{mode:session.mode,liveRecognition:!!session.liveRecognition,fixtureId:session.fixtureId || null},photos:session.photos.map(function(p){return {id:p.id,fileName:p.fileName,width:p.width,height:p.height,status:p.status,source:p.source};}),items:plan.items.map(function(i){return {id:i.id,detectionLabel:i.detectionLabel,displayLabel:i.displayLabel,catalogKey:i.catalogKey,classificationStatus:i.classificationStatus,logisticsStatus:i.logisticsStatus,quantity:i.quantity,dimensionsCm:i.dimensionsCm,source:i.source};}),needsReview:plan.needsReview.map(function(i){return {id:i.id,detectionLabel:i.detectionLabel,displayLabel:i.displayLabel,catalogKey:i.catalogKey,logisticsStatus:i.logisticsStatus};}),calibration:session.calibration,packing:{totalVolumeM3:+plan.totalVolume.toFixed(3),containers:plan.containers}};
  }

  return {LOGISTICS_CATALOG:LOGISTICS_CATALOG,CATALOG:LOGISTICS_CATALOG,CONTAINERS:CONTAINERS,REFERENCES:REFERENCES,FIXTURE:FIXTURE,createSession:createSession,inspectPhoto:inspectPhoto,inspectPhotos:inspectPhotos,inspectDetections:inspectDetections,inspectPhotosWithRecognizer:inspectPhotosWithRecognizer,createWorkBuddyRecognizer:createWorkBuddyRecognizer,resolveLogisticsMetadata:resolveLogisticsMetadata,displayForObservation:displayForObservation,displayForEntity:displayForEntity,selectPhoto:selectPhoto,setResultView:setResultView,getPhotoResult:getPhotoResult,updateObservation:updateObservation,updateEntity:updateEntity,setEntityDisposition:setEntityDisposition,setEntityDimensions:setEntityDimensions,mergeEntities:mergeEntities,splitEntity:splitEntity,applyCalibration:applyCalibration,buildInventory:buildInventory,buildPackPlan:buildPackPlan,exportPayload:exportPayload,volume:volume,itemVolume:itemVolume,canPack:canPack};
});
