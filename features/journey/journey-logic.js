/* Journey state and decisions. No DOM, network or browser storage. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.LoopMoveJourney=api;})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const choices={first:'首批带走',later:'后续再搬',sell:'转卖',donate:'捐赠',recycle:'回收',stay:'留在原处'};
  const initial=()=>({version:1,step:0,furthest:1,profile:{district:'ktn',month:'2027-09',household:'一人入住',priority:'轻装搬家'},session:null,decisions:{},checks:{},facilityView:'future',confirmed:false});
  function validDimensions(d){return !!d&&['width','depth','height'].every(k=>typeof d[k]==='number'&&Number.isFinite(d[k])&&d[k]>0&&d[k]<=1000);}
  function eligible(e){return e&&!e.fixed&&e.includeByDefault!==false&&e.logisticsStatus==='ready'&&validDimensions(e.dimensionsCm);}
  function recommendation(e,profile={}){
    if(e.fixed||e.logisticsStatus==='fixed_or_built_in')return {choice:'stay',why:'先确认是否属于固定或房东设施，暂留原处。'};
    if(profile.priority==='保留熟悉的家具'&&['bed','desk','chair'].includes(e.catalogKey))return {choice:'first',why:'按你保留熟悉家具的目标，优先带走；先确认新家空间和搬运条件。'};
    if(profile.priority==='先安顿工作'&&['desk','chair'].includes(e.catalogKey))return {choice:'first',why:'按你先安顿工作的目标，优先安排工作区物品。'};
    if(e.catalogKey==='laptop')return {choice:'first',why:'工作与日常需要，建议随首批物品带走。'};
    if(e.catalogKey==='bed'||e.catalogKey==='desk')return {choice:'later',why:'大件先核对新家尺寸和交付条件，再安排后续搬运。'};
    if(e.catalogKey==='plant')return {choice:'stay',why:'先确认能否运输及由谁照顾，暂不计入跨境搬运。'};
    return {choice:'first',why:'可作为首批候选，按你的实际需要调整。'};
  }
  function summarize(state){
    const entities=state.session?.entities||[],groups=Object.fromEntries(Object.keys(choices).map(k=>[k,[]])),pending=[];
    let firstVolume=0,laterVolume=0,baseline=0;
    entities.forEach(e=>{
      if(eligible(e))baseline+=e.dimensionsCm.width*e.dimensionsCm.depth*e.dimensionsCm.height*(e.quantity||1)/1e6;
      const choice=state.decisions[e.id];
      if(!Object.hasOwn(choices,choice)){pending.push({item:e,reason:'尚未选择去向'});return;}
      if(['first','later'].includes(choice)&&!eligible(e)){pending.push({item:e,reason:'带走前需确认尺寸与可搬状态'});return;}
      groups[choice].push(e);
      if(['first','later'].includes(choice)){
        const volume=e.dimensionsCm.width*e.dimensionsCm.depth*e.dimensionsCm.height*(e.quantity||1)/1e6;
        if(choice==='first')firstVolume+=volume;else laterVolume+=volume;
      }
    });
    const volume=(firstVolume+laterVolume)*1.1;
    return {groups,pending,firstVolume:firstVolume*1.1,laterVolume:laterVolume*1.1,totalVolume:volume,baseline:baseline*1.1,avoidedVolume:Math.max(0,baseline*1.1-volume),total:entities.length};
  }
  function applySuggestions(state){
    const decisions={...state.decisions};
    (state.session?.entities||[]).forEach(e=>{if(!Object.hasOwn(choices,decisions[e.id]))decisions[e.id]=recommendation(e,state.profile).choice;});
    return {...state,decisions,confirmed:false};
  }
  function canAdvance(state,step=state.step){
    if(step===1)return ['ktn','fln','st','hsk'].includes(state.profile.district)&&/^\d{4}-(0[1-9]|1[0-2])$/.test(state.profile.month);
    if(step===3)return !!state.session?.entities?.length;
    if(step===4)return canAdvance(state,1)&&!!state.session?.entities?.length&&summarize(state).pending.length===0&&state.confirmed;
    return true;
  }
  function restore(raw){
    const fresh=initial();
    if(!raw||raw.version!==1)return fresh;
    const p=raw.profile||{};
    fresh.profile={district:['ktn','fln','st','hsk'].includes(p.district)?p.district:'ktn',month:/^\d{4}-(0[1-9]|1[0-2])$/.test(p.month)?p.month:'2027-09',household:['一人入住','两人同行','家庭搬迁'].includes(p.household)?p.household:'一人入住',priority:['轻装搬家','先安顿工作','保留熟悉的家具'].includes(p.priority)?p.priority:'轻装搬家'};
    const session=raw.session;
    if(session&&Array.isArray(session.entities)&&Array.isArray(session.photos)&&session.entities.length<=100){
      // Only recover this journey's local illustrated session, not arbitrary persisted objects.
      if(session.mode==='illustrated_example'&&session.entities.every(e=>e&&typeof e.id==='string'&&/^sample-item-\d+$/.test(e.id)&&typeof e.displayLabel==='string'&&Number.isInteger(e.quantity)&&e.quantity>0&&e.quantity<=99&&(!e.dimensionsCm||validDimensions(e.dimensionsCm))))fresh.session=session;
    }
    fresh.furthest=Math.min(fresh.session?5:3,Math.max(1,Number.isInteger(raw.furthest)?raw.furthest:1));
    fresh.step=Math.min(fresh.furthest,Math.max(0,Number.isInteger(raw.step)?raw.step:0));
    (fresh.session?.entities||[]).forEach(e=>{const choice=raw.decisions?.[e.id];if(Object.hasOwn(choices,choice))fresh.decisions[e.id]=choice;});
    fresh.checks=Object.fromEntries(['measure','first','later','origin','arrival'].map(k=>[k,raw.checks?.[k]===true]));
    fresh.confirmed=raw.confirmed===true;fresh.facilityView=raw.facilityView==='current'?'current':'future';
    if(fresh.step===5&&!canAdvance(fresh,4))fresh.step=4;
    return fresh;
  }
  return {choices,initial,validDimensions,eligible,recommendation,summarize,applySuggestions,canAdvance,restore};
});
