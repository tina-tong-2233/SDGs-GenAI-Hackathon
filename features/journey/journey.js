(function(){
  'use strict';
  const J=window.LoopMoveJourney,L=window.LoopMoveLogic,D=window.LoopMoveMapData;
  const $=s=>document.querySelector(s),main=$('#journey-main'),nav=$('#journey-nav'),controls=$('#journey-controls');
  if(!J||!L||!D||!window.createLoopMoveExample){main.textContent='页面资源未能加载，请刷新页面重试。';return;}
  const storageKey='loopmove_journey_v1',steps=['选目的地','了解配套','核对房间','决定去向','行动计划'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=id=>'<svg class="icon" aria-hidden="true"><use href="#j-'+id+'"/></svg>';
  const fmt=n=>Number(n).toFixed(2),label=e=>e.displayLabel||e.detectionLabel||'物品';
  let state=J.initial(),selectedItem=null,busy=false,toastTimer;
  try{state=J.restore(JSON.parse(localStorage.getItem(storageKey)));}catch(_){/* Use a fresh, valid journey. */}
  function toast(text){$('#toast').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').textContent='',4000);}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(_){toast('浏览器无法保存；本次仍可继续体验，离开后进度可能丢失。');}}
  function district(){return D.districts[state.profile.district];}
  function route(){return '<span class="route-chip">深圳 → '+esc(district())+' · '+esc(state.profile.month)+'</span>';}
  function heading(number,title,copy){return '<div class="step-header"><div><p class="eyebrow">'+String(number).padStart(2,'0')+' / '+steps[number-1]+'</p><h1>'+title+'</h1><p class="muted">'+copy+'</p></div>'+route()+'</div>';}
  function nextAllowed(){return J.canAdvance(state);}
  function updateControls(){
    if(!state.step){controls.hidden=true;return;}
    controls.hidden=false;
    const next=['','了解目的地配套','开始整理房间','决定物品去向','生成我的行动计划'][state.step];
    const hints=['','先确定你的入住场景。','规划设施不等于入住时已开放。','尺寸为估算值，搬运前需要核对。','每件物品都要有去向；确认后生成计划。','已形成可执行的待办，实际预约在服务方网站进行。'];
    controls.innerHTML='<div class="bottom-bar"><span class="hint">'+hints[state.step]+'</span><div class="actions"><button data-action="back">'+(state.step===1?'返回首页':'上一步')+'</button>'+(state.step<5?'<button class="primary" data-action="next" '+(!nextAllowed()?'disabled':'')+'>'+next+icon('arrow')+'</button>':'<button data-action="export">下载计划</button><button class="primary" data-action="print">打印 / 存为 PDF</button>')+'</div></div>';
  }
  function renderNav(){
    nav.hidden=!state.step;
    nav.innerHTML='<div class="step-nav">'+steps.map((text,i)=>{const n=i+1,blocked=n>state.furthest||(n===5&&!J.canAdvance(state,4));return '<button data-step="'+n+'" '+(blocked?'disabled':'')+(n===state.step?' aria-current="step"':'')+'><span class="step-number">'+(n<state.step?icon('check'):String(n).padStart(2,'0'))+'</span>'+text+'</button>';}).join('')+'</div>';
  }
  function landing(){
    return '<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="live-dot" aria-hidden="true"></span> A MORE CONSIDERED MOVE</p><h1>一间房，<br><em>轻一点出发。</em></h1><p class="hero-description">从深圳到香港北部。了解新的日常，整理现在的物品，再决定每一件的下一站。</p><div class="hero-actions"><button class="primary" data-action="start">'+(state.furthest>1?'继续我的旅程':'开始我的搬家旅程')+icon('arrow')+'</button>'+(state.furthest>1?'<button class="text-button" data-action="reset">重新开始</button>':'')+'</div><div class="scenario"><span class="scenario-label">这一次，跟小林一起搬家</span><p>一个人，从深圳搬到古洞北。<br>房间里的东西，需要一次全搬走吗？</p></div><p class="hero-meta">3–5 分钟交互旅程 <span aria-hidden="true">/</span> 进度保存在此浏览器</p></div><figure class="hero-art"><div class="scene-header"><span>ROOM STUDY / 01</span><span class="scene-mode">预置房间示例</span></div><div class="scene-media"><img src="./assets/images/example-room.png" alt="小林的示例卧室，有床、书桌、电脑、椅子、行李箱和绿植"><div class="scene-ticket"><span class="ticket-icon">'+icon('box')+'</span><div><strong>6 件物品</strong><small>从核对开始，给它们新的安排。</small></div></div></div><figcaption><span>深圳的一间房</span><span>下一站 · 古洞北 '+icon('arrow')+'</span></figcaption></figure><div class="hero-path" aria-label="旅程概要"><span><b>01</b>认识目的地<small>现在与未来的配套</small></span><span><b>02</b>整理这一间房<small>核对尺寸，选择去向</small></span><span><b>03</b>带着计划出发<small>首批、后续与行动清单</small></span></div></section>';
  }
  function setup(){
    const descriptions={ktn:'居住与市镇配套',fln:'新发展区与既有社区',st:'科技、教育与医疗规划',hsk:'铁路与大学城规划'};
    return heading(1,'新生活，准备从哪里开始？','先选一个片区和计划入住时间，后面都可以修改。')+'<div class="two-column"><section class="panel"><h2>我的搬家场景</h2><p class="small muted">出发地：深圳 · 以下信息仅用于本次旅程</p><p class="small">准备住在哪个片区？</p><div class="district-options">'+Object.entries(D.districts).filter(([k])=>k!=='all').map(([k,v])=>'<button class="district-choice" data-district="'+k+'" aria-pressed="'+(k===state.profile.district)+'"><strong>'+v+'</strong><small>'+descriptions[k]+'</small></button>').join('')+'</div><div class="field-grid"><label class="field">计划入住月份<input id="move-month" type="month" value="'+esc(state.profile.month)+'" aria-describedby="month-help" required><small id="month-help" class="field-help">用于安排你的计划，具体交付与设施启用仍需核实。</small></label><label class="field">与谁一起搬<select id="household">'+['一人入住','两人同行','家庭搬迁'].map(v=>'<option '+(v===state.profile.household?'selected':'')+'>'+v+'</option>').join('')+'</select></label></div><label class="field">这次最想做到<select id="priority">'+['轻装搬家','先安顿工作','保留熟悉的家具'].map(v=>'<option '+(v===state.profile.priority?'selected':'')+'>'+v+'</option>').join('')+'</select></label></section><aside class="panel wash"><p class="eyebrow">YOUR NEXT CHAPTER</p><h2>先安顿，再慢慢完善。</h2><div class="route-story"><div><strong>深圳 · 现在的房间</strong><small>核对物品，决定带走或留下。</small></div><div><strong>'+esc(district())+' · '+esc(state.profile.month)+'</strong><small>'+esc(state.profile.household)+'，以“'+esc(state.profile.priority)+'”为目标。</small></div><div><strong>新的日常</strong><small>首批先解决生活所需，大件按实际条件再安排。</small></div></div><p class="small muted">我们会保留“现在有什么”和“未来规划什么”的区别，不把规划当成入住承诺。</p></aside></div>';
  }
  function facilities(){
    const all=D.filterFacilities({district:state.profile.district}),visible=D.filterFacilities({district:state.profile.district,view:state.facilityView}),existing=all.filter(p=>p.status==='existing').length;
    return heading(2,'先认识新家的周边。','对照你的入住计划，看看哪些已经存在，哪些仍在建设或规划。')+'<div class="two-column"><section class="panel"><div class="split-heading"><h2>'+esc(district())+'</h2><div class="segmented" role="group" aria-label="配套时间视角"><button data-view="current" aria-pressed="'+(state.facilityView==='current')+'">现有设施</button><button data-view="future" aria-pressed="'+(state.facilityView==='future')+'">建成后展望</button></div></div><div class="facility-list">'+(visible.length?visible.map(p=>'<article class="facility-row"><h3>'+esc(p.name)+' <span class="status '+p.status+'">'+D.statuses[p.status]+'</span></h3><p>'+esc(p.timing)+'</p><p>'+esc(p.note)+'</p><a href="'+esc(D.sources[p.source].url)+'" target="_blank" rel="noopener noreferrer">查看官方资料 ↗</a></article>').join(''):'<div class="empty-state">'+icon('pin')+'<h3>现有配套，仍待补充。</h3><p>本次资料尚未收录此片区的现有设施。可以切换至“建成后展望”查看规划。</p><small>暂无收录，不代表该区没有配套。</small></div>')+'</div><p class="small muted">片区归类示意 · 部分资料收录 · 核查：2026-10-08</p></section><aside class="panel wash sticky-summary"><p class="eyebrow">对这次搬家的影响</p><h2>第一批，先带生活必需品。</h2><div class="metric-row"><div><b>'+existing+'</b><span>已收录的现有设施</span></div><div><b>'+(all.length-existing)+'</b><span>在建 / 规划项目</span></div></div><p>你的计划入住月份是 <strong>'+esc(state.profile.month)+'</strong>。项目目标年份不代表当月已开放，具体启用时间仍需核实。</p><p class="small muted">下一步先整理房间。大型家具可等新家尺寸、楼宇交付与配送条件确认后再搬。</p><a href="./features/explore/index.html" target="_blank" rel="noopener">完整配套视图 ↗</a></aside></div>';
  }
  function scan(){
    const session=state.session,entities=session?.entities||[],active=entities.find(e=>e.id===selectedItem)||entities[0];
    if(active)selectedItem=active.id;
    const observations=session?.photos[0]?.observations||[];
    const boxes=observations.filter(o=>o.bbox).map(o=>'<button class="room-box" style="left:'+(o.bbox.x*100)+'%;top:'+(o.bbox.y*100)+'%;width:'+(o.bbox.w*100)+'%;height:'+(o.bbox.h*100)+'%" data-item="'+o.entityId+'" aria-label="核对'+esc(o.displayLabel)+'" aria-pressed="'+(active?.id===o.entityId)+'"><span>'+esc(o.displayLabel)+'</span></button>').join('');
    let inspector='<p class="eyebrow">从一张示例照片开始</p><h2>房间里，哪些要带走？</h2><p class="muted">先展开照片中的六件物品，再逐一核对尺寸和可搬状态。</p><button class="primary" data-action="scan" '+(busy?'disabled':'')+'>'+icon('box')+(busy?'正在整理示例…':'整理这个示例房间')+'</button><p class="note">这里使用预置示例，不调用实时 AI。实际搬运前请测量物品尺寸。</p>';
    if(busy)inspector='<div class="scan-skeleton" aria-busy="true" aria-label="正在整理预置示例"><p class="eyebrow">正在整理示例房间</p><div class="skeleton-line title"></div><div class="skeleton-line"></div><div class="skeleton-fields"><i></i><i></i><i></i></div><div class="skeleton-line button"></div><p class="small muted">逐件展开预置物品，准备尺寸核对。</p></div>';
    if(active){const d=active.dimensionsCm||{};inspector='<div class="scan-info"><p class="eyebrow">'+(entities.indexOf(active)+1)+' / '+entities.length+' · 物品核对</p><h2>'+esc(label(active))+'</h2><p class="small muted">'+(active.dimensionsCm?(active.source==='illustrated_dimensions'?'示例尺寸':active.source==='user_measured'?'你填写的尺寸':'品类默认尺寸'):'尚无尺寸，请补充或在下一步选择不搬走')+'</p><form id="dimensions-form"><div class="dimension-fields">'+[['width','长'],['depth','宽'],['height','高']].map(([key,name])=>'<label>'+name+'（cm）<input name="'+key+'" type="number" min="0.1" max="1000" step="0.1" value="'+(d[key]||'')+'" required></label>').join('')+'</div><p id="dimensions-error" class="field-error" role="alert"></p><button type="submit">保存尺寸</button></form>'+(!active.dimensionsCm?'<button class="text-button" data-action="sample-dims">填入示例： 77 × 52 × 30 cm</button>':'')+'<label class="check-row"><input id="fixed-item" type="checkbox" '+(active.fixed?'checked':'')+'>这是固定或不随我搬走的设施</label><p class="note">'+(J.eligible(active)?'已可纳入体积估算；下一步选择是否带走。':'尚未计入搬运体积，可补充信息或在下一步安排其他去向。')+'</p></div>';}
    return heading(3,'从这一间房开始整理。','点击照片中的物品，核对尺寸；不确定的物品不会自动计入搬运体积。')+'<div class="two-column"><section><div class="room-preview"><img src="./assets/images/example-room.png" alt="示例卧室与六件待整理物品">'+boxes+'</div>'+(entities.length?'<div class="object-list" role="group" aria-label="物品选择">'+entities.map(e=>'<button data-item="'+e.id+'" aria-pressed="'+(active?.id===e.id)+'">'+esc(label(e))+(J.eligible(e)?'':' · 待核对')+'</button>').join(''):'')+'<p class="note">示例预置框选 · 尺寸用于体积估算，不代表真实三维扫描。<br><a href="./features/scan/index.html" target="_blank" rel="noopener">打开独立照片扫描体验 ↗</a></p></section><aside class="panel sticky-summary">'+inspector+'</aside></div>';
  }
  function decisions(){
    const summary=J.summarize(state);
    return heading(4,'不是所有东西，都要一起出发。','为每件物品选择去向。建议供参考，最终决定由你确认。')+'<div class="two-column"><section class="panel"><div class="split-heading"><h2>给物品一个安排</h2><button data-action="suggest">填入建议去向</button></div><p class="small muted">你的目标：'+esc(state.profile.priority)+'。建议从首批必需品、大件后搬和暂留物品开始。</p>'+state.session.entities.map(e=>{const r=J.recommendation(e,state.profile);return '<div class="decision-row"><div><h3>'+esc(label(e))+'</h3><p>'+esc(r.why)+'</p><span class="small muted">'+(J.eligible(e)?fmt(L.itemVolume(e))+' m³ · 不含余量':'尺寸或可搬状态待核对')+'</span>'+(!J.eligible(e)&&['first','later'].includes(state.decisions[e.id])?'<p class="issue">需返回上一步确认尺寸，或选择其他去向。</p>':'')+'</div><label><span class="small muted">'+esc(label(e))+'的去向</span><select data-choice="'+e.id+'"><option value="">请选择</option>'+Object.entries(J.choices).map(([k,v])=>'<option value="'+k+'" '+(state.decisions[e.id]===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label></div>';}).join('')+'</section><aside class="panel wash sticky-summary"><p class="eyebrow">YOUR MOVING LOAD</p><h2>这次真正要搬的</h2><div class="summary-number">'+fmt(summary.totalVolume)+' <span class="small">m³</span></div><p class="small muted">已确认带走的体积，含 10% 运输余量</p><div class="metric-row"><div><b>'+summary.groups.first.length+'</b><span>首批带走</span></div><div><b>'+summary.groups.later.length+'</b><span>后续再搬</span></div><div><b>'+summary.pending.length+'</b><span>待完成决定</span></div></div><p class="note '+(summary.pending.length?'warning':'')+'">'+(summary.pending.length?'还有 '+summary.pending.length+' 件需要选择去向或确认尺寸。':'每件物品已有去向。你可以返回修改，计划会重新计算。')+'</p><label class="check-row"><input id="confirm-decisions" type="checkbox" '+(state.confirmed?'checked':'')+' '+(summary.pending.length?'disabled':'')+'>我已核对这些去向，用它们生成计划。</label><p class="small muted">转卖、捐赠和回收只表示你的安排，不代表已经成交或预约。</p></aside></div>';
  }
  function list(items){return items.length?items.map(e=>esc(label(e))).join('、'):'这一阶段暂未安排物品';}
  function checklist(id,text){return '<label class="check-row"><input data-check="'+id+'" type="checkbox" '+(state.checks[id]?'checked':'')+'>'+text+'</label>';}
  function plan(){
    const s=J.summarize(state),movingIds=new Set([...s.groups.first,...s.groups.later].map(e=>e.id)),packing=L.buildPackPlan({...state.session,entities:state.session.entities.filter(e=>movingIds.has(e.id))});
    const containers=Object.entries(packing.containers).map(([id,count])=>L.CONTAINERS.find(c=>c.id===id).zh+' × '+count).join('、');
    const origin=[...s.groups.sell,...s.groups.donate,...s.groups.recycle,...s.groups.stay];
    return heading(5,'可以出发了，带上这份计划。','从决定到行动。勾选待办，或下载这份清单继续安排。')+'<div class="plan-stats"><div class="stat"><b>'+s.groups.first.length+' <small>件</small></b><span>首批带走</span></div><div class="stat"><b>'+fmt(s.totalVolume)+' <small>m³</small></b><span>总搬运估算 · 含余量</span></div><div class="stat"><b>'+fmt(s.avoidedVolume)+' <small>m³</small></b><span>相较全部可搬物品少搬</span></div></div><div class="two-column"><section class="timeline"><article class="timeline-card"><span class="timeline-index">01</span><div><h3>出发前 · 在深圳处理好</h3><p>'+list(origin)+'</p><ul>'+['sell','donate','recycle','stay'].filter(k=>s.groups[k].length).map(k=>'<li>'+J.choices[k]+'：'+list(s.groups[k])+'</li>').join('')+'</ul>'+checklist('origin','已确认留下物品的交接或处理方式')+'</div></article><article class="timeline-card"><span class="timeline-index">02</span><div><h3>首批 · 先安顿日常</h3><p>'+list(s.groups.first)+'</p><p>估算 '+fmt(s.firstVolume)+' m³，含 10% 余量。</p>'+checklist('first','首批清单已核对，准备好随身必需品')+'</div></article><article class="timeline-card"><span class="timeline-index">03</span><div><h3>后续 · 确认条件再搬</h3><p>'+list(s.groups.later)+'</p><p>估算 '+fmt(s.laterVolume)+' m³；先核对新家尺寸、楼宇搬入时段及承运安排。</p>'+checklist('later','已确认后续搬运的时间与条件')+'</div></article><article class="timeline-card"><span class="timeline-index">04</span><div><h3>抵港后 · 慢慢安顿下来</h3><p>按实际启用情况了解'+esc(district())+'周边设施，分类整理包装。</p>'+checklist('arrival','已核实入住配套并安排包装回收')+'</div></article></section><aside class="panel sticky-summary"><p class="eyebrow">'+esc(state.profile.household)+' / '+esc(state.profile.priority)+'</p><h2>我的搬家备忘</h2><p>深圳 → '+esc(district())+'<br>计划入住：'+esc(state.profile.month)+'</p><hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><h3>容器估算</h3><p class="small">'+(containers||'当前没有需要估算纸箱的物品。')+'</p><p class="small muted">大件需单独安排。箱数按容积估算，不保证实际摆放或承运可行。</p>'+checklist('measure','实际尺寸和承运条件已复核')+'<p class="note">“少搬体积”仅比较当前尺寸已确认的可搬物品，不是减排量或费用节省估算。</p><button class="text-button" data-action="reset">重新开始这段旅程</button></aside></div><h2 class="section-title">把计划落实：服务入口</h2><p class="small muted">深圳处理在出发前安排；下列香港平台供抵港后使用。深圳转卖、捐赠及跨境承运方仍需自行确认，不能用香港本地服务替代。</p><div class="services">'+D.services.map(service=>'<a class="service-link" href="'+esc(service.url)+'" target="_blank" rel="noopener noreferrer"><span>'+esc(service.area)+' · '+esc(service.kind)+'</span><strong>'+esc(service.name)+'</strong><span>'+esc(service.note)+'</span><small>'+esc(service.action)+' ↗ · 新标签页打开</small></a>').join('')+'</div><p class="note no-print">点击服务链接只会打开网站，不会替你下单或预约。<a href="./features/explore/index.html" target="_blank" rel="noopener">查看完整配套与服务 ↗</a></p>';
  }
  function render(focus=false){
    const previous=document.activeElement;const previousId=previous?.id;const choiceId=previous?.dataset?.choice;
    main.dataset.transition=focus?'enter':'idle';
    renderNav();main.innerHTML=[landing,setup,facilities,scan,decisions,plan][state.step]();updateControls();
    if(!focus){if(previousId)document.getElementById(previousId)?.focus({preventScroll:true});else if(choiceId)main.querySelector('[data-choice="'+choiceId+'"]')?.focus({preventScroll:true});}
    if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }
  function go(step){
    if(step>1&&!J.canAdvance(state,1)){toast('请先在目的地步骤填写有效的入住月份。');return;}
    if(step===5&&!J.canAdvance(state,4)){toast('先为全部物品选择去向并完成确认。');return;}
    if(step>=4&&!state.session?.entities?.length){toast('请先整理示例房间。');return;}
    state.step=step;state.furthest=Math.max(state.furthest,step);save();render(true);
  }
  async function loadSample(){
    if(busy)return;busy=true;render();
    try{state.session=await window.createLoopMoveExample(L);state.decisions={};state.checks={};state.confirmed=false;selectedItem=state.session.entities[0].id;save();}
    catch(_){toast('示例暂时无法加载，请重试。');}finally{busy=false;render();}
  }
  function setDimensions(dimensions,isSample=false){
    if(!J.validDimensions(dimensions)){const message='请填写大于 0 且不超过 1000 cm 的长、宽、高。';const error=$('#dimensions-error');if(error)error.textContent=message;else toast(message);return;}
    const result=L.setEntityDimensions(state.session,selectedItem,dimensions);
    if(!result.ok){const error=$('#dimensions-error');if(error)error.textContent=result.error;else toast(result.error);return;}
    state.session=result.session;
    if(isSample){const entity=state.session.entities.find(e=>e.id===selectedItem);entity.source='illustrated_dimensions';entity.dimensionsCm.source='illustrated_dimensions';}
    state.confirmed=false;state.checks={};save();render();toast(isSample?'已填入示例尺寸，实际搬运前请重新测量。':'尺寸已保存，搬家体积会随之更新。');
  }
  function exportPlan(){
    const s=J.summarize(state),lines=['LoopMove 搬家行动计划','深圳 → '+district(),'计划入住：'+state.profile.month,'同行：'+state.profile.household,'目标：'+state.profile.priority,'','搬运体积（含 10% 余量）：'+fmt(s.totalVolume)+' m³',''];
    Object.entries(J.choices).forEach(([k,v])=>{lines.push(v+'：'+(s.groups[k].map(label).join('、')||'暂无'));});
    lines.push('','示例清单；尺寸与承运条件需复核。规划设施不是启用承诺。','服务入口：',...D.services.map(p=>p.name+'（'+p.area+'）：'+p.url));
    const url=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='LoopMove-搬家行动计划.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('行动计划已生成。');
  }
  document.addEventListener('click',e=>{
    const step=e.target.closest('[data-step]');if(step&&!step.disabled){go(Number(step.dataset.step));return;}
    const districtButton=e.target.closest('[data-district]');if(districtButton){state.profile.district=districtButton.dataset.district;state.confirmed=false;state.checks={};save();render();return;}
    const view=e.target.closest('[data-view]');if(view){state.facilityView=view.dataset.view;save();render();return;}
    const item=e.target.closest('[data-item]');if(item){selectedItem=item.dataset.item;render();return;}
    const action=e.target.closest('[data-action]');if(!action||action.disabled)return;
    switch(action.dataset.action){
      case 'start':go(state.furthest===5&&J.canAdvance(state,4)?5:Math.min(state.furthest,state.session?4:3));break;
      case 'next':if(nextAllowed())go(state.step+1);break;
      case 'back':go(state.step-1);break;
      case 'scan':loadSample();break;
      case 'sample-dims':setDimensions({width:77,depth:52,height:30},true);break;
      case 'suggest':state=J.applySuggestions(state);state.checks={};save();render();toast('已填入建议，请核对并确认。');break;
      case 'reset':$('#reset-dialog').showModal();break;
      case 'export':exportPlan();break;
      case 'print':window.print();break;
    }
  });
  document.addEventListener('change',e=>{
    const t=e.target;
    const profileKey={'move-month':'month',household:'household',priority:'priority'}[t.id];
    if(profileKey){state.profile[profileKey]=t.value;state.confirmed=false;state.checks={};save();renderNav();updateControls();render();return;}
    if(t.dataset.choice){state.decisions[t.dataset.choice]=t.value;state.confirmed=false;state.checks={};save();render();return;}
    if(t.dataset.check){state.checks[t.dataset.check]=t.checked;save();return;}
    if(t.id==='confirm-decisions'){state.confirmed=t.checked;save();renderNav();updateControls();return;}
    if(t.id==='fixed-item'){state.session=L.setEntityDisposition(state.session,selectedItem,t.checked?'fixed':'movable');state.confirmed=false;state.checks={};save();render();}
  });
  document.addEventListener('invalid',e=>{if(e.target.closest('form')?.id==='dimensions-form'){const error=$('#dimensions-error');if(error)error.textContent='请填写大于 0 且不超过 1000 cm 的长、宽、高。';}},true);
  document.addEventListener('submit',e=>{if(e.target.id!=='dimensions-form')return;e.preventDefault();const f=new FormData(e.target);setDimensions({width:Number(f.get('width')),depth:Number(f.get('depth')),height:Number(f.get('height'))});});
  $('#cancel-reset').addEventListener('click',()=>$('#reset-dialog').close());
  $('#confirm-reset').addEventListener('click',()=>{state=J.initial();selectedItem=null;$('#reset-dialog').close();save();render(true);});
  $('#theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';$('#theme').setAttribute('aria-pressed',String(dark));});
  if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark';$('#theme').setAttribute('aria-pressed','true');}
  render();
})();
