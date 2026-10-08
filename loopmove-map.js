(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const data = window.LoopMoveMapData;
  if (!data) {
    $('#count').textContent = '加载失败';
    $('#places').textContent = '地点数据未能加载，请刷新页面重试。';
    $('#service-cards').textContent = '服务数据未能加载，请刷新页面重试。';
    return;
  }
  const state = {mode:'facilities', query:'', category:'all', district:'all', view:'future', selected:null};
  let saved = null;
  const storageKey = 'loopmove_map_facility';
  const items = () => data.facilities;
  const categories = () => state.mode === 'facilities' ? data.facilityCategories : data.serviceCategories;
  try {
    const id = localStorage.getItem(storageKey);
    if (data.facilities.some(p => p.id === id)) saved = id;
  } catch (_) { /* Browsing does not require storage. */ }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function clearStatus() { $('#save-status').textContent = ''; }
  function buildFilters() {
    $('#filters').replaceChildren();
    Object.entries(categories()).forEach(([category,label]) => {
      const button = element('button',label);
      button.dataset.category = category;
      button.addEventListener('click', () => { state.category = category; clearStatus(); render(); });
      $('#filters').append(button);
    });
  }
  Object.entries(data.districts).forEach(([value,label]) => {
    const option = element('option',label); option.value = value; $('#district').append(option);
  });
  $('#district').addEventListener('change', e => { state.district = e.target.value; clearStatus(); render(); });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    state.view = button.dataset.view; clearStatus(); render();
  }));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    state.query = ''; state.category = 'all'; state.district = 'all'; state.view = 'future';
    state.selected = state.mode === 'facilities' ? saved : null;
    $('#search').value = ''; $('#district').value = 'all'; clearStatus();
    buildFilters(); render();
  }));
  function select(id, fromMap) {
    state.selected = id; clearStatus(); render();
    if (fromMap) $('#detail').focus();
  }
  function statusBadge(p) {
    const badge = element('span',data.statuses[p.status],'status-badge');
    badge.dataset.status = p.status;
    return badge;
  }
  function renderDetail() {
    const panel = $('#detail'); panel.replaceChildren();
    const place = items().find(p => p.id === state.selected);
    if (!place) {
      panel.append(element('p','先了解未来的日常','eyebrow'),element('h2','选一项配套看看'),element('p','查看建设状态、目标时间和官方资料。教育配套不代表学区或入学资格，片区归类不代表步行可达。'));
      return;
    }
    panel.append(element('p',categories()[place.category] + ' / ' + place.area,'eyebrow'),element('h2',place.name));
      panel.append(statusBadge(place),element('p',place.timing,'timing'),element('p',place.note));
      const source = data.sources[place.source];
      const link = element('a','官方来源：' + source.title,'source-link');
      link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      panel.append(link,element('p','资料核查：' + place.checkedAt + ' · 片区示意，不提供路线或距离。'));
      if (place.status !== 'existing') panel.append(element('p','此项不计入现有设施；目标时间可能调整。'));
    const saveLabel = () => saved === place.id ? '取消保存此配套' : '保存关注配套';
    const save = element('button',saveLabel(),'primary');
    save.addEventListener('click', () => {
      const next = saved === place.id ? null : place.id;
      try {
        if (next) localStorage.setItem(storageKey,next); else localStorage.removeItem(storageKey);
        saved = next; save.textContent = saveLabel();
        $('#save-status').textContent = next ? '已保存到此浏览器，可刷新后查看。' : '已取消保存。';
      } catch (_) { $('#save-status').textContent = '浏览器无法保存，请检查存储权限后重试。'; }
    });
    panel.append(save);
  }
  function renderFacilityMap(visible) {
    const map = $('#facility-map'); map.replaceChildren();
    // West-to-east regional grouping, deliberately not point coordinates or a route map.
    for (const district of ['hsk','st','ktn','fln']) {
      if (state.district !== 'all' && district !== state.district) continue;
      const group = element('section',null,'district-group');
      group.append(element('h3',data.districts[district]));
      const list = visible.filter(p => p.district === district);
      if (!list.length) group.append(element('p','当前条件下暂无收录；不表示该区没有此类设施。','district-empty'));
      list.forEach(p => {
        const button = element('button',null,'facility-pin');
        button.dataset.facility = p.id;
        button.setAttribute('aria-pressed',String(state.selected === p.id));
        button.append(element('span',String(data.facilities.indexOf(p) + 1),'number'),element('span',p.name),statusBadge(p));
        button.addEventListener('click', () => select(p.id,true)); group.append(button);
      });
      map.append(group);
    }
  }
  function renderServices() {
    const visible = data.filterServices(state.query,state.category);
    const cards = $('#service-cards'); cards.replaceChildren();
    $('#service-count').textContent = visible.length + ' 个入口';
    visible.forEach(service => {
      const card = element('a',null,'service-card');
      card.href = service.url; card.target = '_blank'; card.rel = 'noopener noreferrer';
      card.dataset.category = service.category;
      card.setAttribute('aria-label',service.name + '，' + service.action + '（新标签页）');
      const top = element('div',null,'service-top');
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('class','service-icon'); svg.setAttribute('aria-hidden','true');
      const use = document.createElementNS('http://www.w3.org/2000/svg','use');
      use.setAttribute('href','#service-' + service.icon); svg.append(use);
      top.append(svg,element('span',service.area + ' · ' + service.kind,'service-label'));
      card.append(top,element('h3',service.name),element('p',service.description,'service-description'),element('p',service.note,'service-note'));
      const bottom = element('div',null,'service-bottom');
      bottom.append(element('span',service.provider),element('strong',service.action + ' ↗'));
      card.append(bottom,element('span',new URL(service.url).hostname + ' · 新标签页打开','service-domain'));
      cards.append(card);
    });
    if (!visible.length) {
      const empty = element('div',null,'empty'); empty.append(element('p','没有匹配的服务，试试其他关键词或分类。'));
      const reset = element('button','清除筛选'); reset.addEventListener('click',resetView); empty.append(reset); cards.append(empty);
    }
  }
  function render() {
    const facilityMode = state.mode === 'facilities';
    $('#facility-controls').hidden = !facilityMode;
    $('#facility-workspace').hidden = !facilityMode;
    $('#services-panel').hidden = facilityMode;
    $('#mode-badge').textContent = facilityMode ? '官方资料 · 配套展望' : '回收 · 捐赠 · 转卖 · 搬运';
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.mode === state.mode)));
    document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.category === state.category)));
    $('#search').placeholder = facilityMode ? '搜索片区或配套设施' : '搜索服务、物品或地区';
    $('#search').setAttribute('aria-label',$('#search').placeholder);
    if (!facilityMode) { renderServices(); return; }
    const visible = data.filterFacilities(state);
    if (!visible.some(p => p.id === state.selected)) state.selected = null;
    $('#count').textContent = visible.length + ' 项收录';
    $('#perspective-note').textContent = state.view === 'future' ? '展望叠加现有、建设中及规划设施；各项目分期落成，不代表同年开放。' : '仅展示已核实为现有的设施，不计入在建或规划项目。资料核查：2026-10-08。';
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.mode === state.mode)));
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.view === state.view)));
    document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.category === state.category)));
    if (facilityMode) {
      $('#facility-summary').textContent = '当前筛选已收录：' + Object.entries(data.statuses).map(([status,label]) => label + ' ' + visible.filter(p => p.status === status).length + ' 项').join(' · ');
      renderFacilityMap(visible);
    }
    const focusedId = document.activeElement?.dataset.place;
    $('#places').replaceChildren();
    visible.forEach(p => {
      const index = items().indexOf(p) + 1;
      const row = element('button',null,'place'); row.dataset.place = p.id;
      row.setAttribute('aria-pressed',String(state.selected === p.id));
      const copy = element('span'); copy.append(element('strong',p.name),element('small',p.area + ' · ' + categories()[p.category]));
      copy.append(statusBadge(p));
      row.append(element('span',String(index),'number'),copy);
      row.addEventListener('click', () => select(p.id,false)); $('#places').append(row);
      if (focusedId === p.id) row.focus({preventScroll:true});
    });
    if (!visible.length) {
      const empty = element('div',null,'empty');
      empty.append(element('p','暂无符合条件的收录，不能据此判断该片区没有配套。'));
      const reset = element('button','清除筛选'); reset.addEventListener('click',resetView); empty.append(reset); $('#places').append(empty);
    }
    renderDetail();
  }
  function resetView() {
    state.query = ''; state.category = 'all'; state.district = 'all'; state.view = 'future'; state.selected = null;
    $('#search').value = ''; $('#district').value = 'all'; clearStatus(); render();
  }
  $('#search').addEventListener('input', e => { state.query = e.target.value; clearStatus(); render(); });
  $('#reset').addEventListener('click',resetView);
  $('#theme').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('#theme').setAttribute('aria-pressed',String(dark));
  });
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) { document.documentElement.dataset.theme = 'dark'; $('#theme').setAttribute('aria-pressed','true'); }
  state.selected = saved;
  buildFilters();
  render();
})();
