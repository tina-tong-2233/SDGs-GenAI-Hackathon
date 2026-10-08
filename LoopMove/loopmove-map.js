(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const data = window.LoopMoveMapData;
  if (!data) {
    $('#count').textContent = '加载失败';
    $('#places').textContent = '地点数据未能加载，请刷新页面重试。';
    $('#locate-button').disabled = true;
    return;
  }
  const state = {mode:'facilities', query:'', category:'all', district:'all', view:'future', selected:null};
  const saved = {facilities:null, moving:null};
  const key = mode => mode === 'moving' ? 'loopmove_map_place' : 'loopmove_map_facility';
  const items = () => state.mode === 'facilities' ? data.facilities : data.places;
  const categories = () => state.mode === 'facilities' ? data.facilityCategories : data.categories;
  for (const mode of ['facilities','moving']) {
    try {
      const id = localStorage.getItem(key(mode));
      if ((mode === 'facilities' ? data.facilities : data.places).some(p => p.id === id)) saved[mode] = id;
    } catch (_) { /* Browsing does not require storage. */ }
  }
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
    state.selected = saved[state.mode];
    $('#search').value = ''; $('#district').value = 'all'; clearStatus();
    $('#user-position').hidden = true; $('#location-status').textContent = '';
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
    const facilityMode = state.mode === 'facilities';
    const place = items().find(p => p.id === state.selected);
    if (!place) {
      panel.append(element('p',facilityMode ? '先了解未来的日常' : '下一站，由你决定','eyebrow'),element('h2',facilityMode ? '选一项配套看看' : '选一个地点看看'),element('p',facilityMode ? '查看建设状态、目标时间和官方资料。教育配套不代表学区或入学资格，片区归类不代表步行可达。' : '点击地图标记或列表，查看适合整理的物品，并保存你的选择。'));
      return;
    }
    panel.append(element('p',categories()[place.category] + ' / ' + place.area,'eyebrow'),element('h2',place.name));
    if (facilityMode) {
      panel.append(statusBadge(place),element('p',place.timing,'timing'),element('p',place.note));
      const source = data.sources[place.source];
      const link = element('a','官方来源：' + source.title,'source-link');
      link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      panel.append(link,element('p','资料核查：' + place.checkedAt + ' · 片区示意，不提供路线或距离。'));
      if (place.status !== 'existing') panel.append(element('p','此项不计入现有设施；目标时间可能调整。'));
    } else panel.append(element('p','适用物品：' + place.accepts),element('p',place.note),element('p','演示地点 · 无真实地址、营业时间或预约服务'));
    const saveLabel = () => saved[state.mode] === place.id ? '取消保存此' + (facilityMode ? '配套' : '地点') : facilityMode ? '保存关注配套' : '保存为下一站';
    const save = element('button',saveLabel(),'primary');
    save.addEventListener('click', () => {
      const next = saved[state.mode] === place.id ? null : place.id;
      try {
        if (next) localStorage.setItem(key(state.mode),next); else localStorage.removeItem(key(state.mode));
        saved[state.mode] = next; save.textContent = saveLabel();
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
  function render() {
    const facilityMode = state.mode === 'facilities';
    const visible = facilityMode ? data.filterFacilities(state) : data.filterPlaces(state.query,state.category);
    if (!visible.some(p => p.id === state.selected)) state.selected = null;
    $('#facility-controls').hidden = !facilityMode; $('#facility-map').hidden = !facilityMode;
    $('#map').hidden = facilityMode; $('#locate-button').hidden = facilityMode;
    $('#location-status').hidden = facilityMode;
    $('#mode-badge').textContent = facilityMode ? '官方资料 · 配套展望' : '离线演示';
    $('#map-title').textContent = facilityMode ? '北部都会区 · 生活配套' : '深圳 → 香港北部';
    $('#map-subtitle').textContent = facilityMode ? '片区关系示意 · 非精确选址' : '区域示意 · 非导航地图';
    $('#map-note').textContent = facilityMode ? '按片区归类，不代表步行距离、服务覆盖或已确认选址。已收录部分配套，非完整清单。' : '地点均为虚构示例，位置仅供交互演示，请勿据此前往。';
    $('#list-title').textContent = facilityMode ? '片区配套' : '探索地点';
    $('#count').textContent = visible.length + (facilityMode ? ' 项收录' : ' 个示例');
    $('#perspective-note').textContent = state.view === 'future' ? '展望叠加现有、建设中及规划设施；各项目分期落成，不代表同年开放。' : '仅展示已核实为现有的设施，不计入在建或规划项目。资料核查：2026-10-08。';
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.mode === state.mode)));
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.view === state.view)));
    document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.category === state.category)));
    if (facilityMode) {
      $('#facility-summary').textContent = '当前筛选已收录：' + Object.entries(data.statuses).map(([status,label]) => label + ' ' + visible.filter(p => p.status === status).length + ' 项').join(' · ');
      renderFacilityMap(visible);
    }
    const focusedId = document.activeElement?.dataset.place;
    $('#markers').replaceChildren(); $('#places').replaceChildren();
    visible.forEach(p => {
      const index = items().indexOf(p) + 1;
      if (!facilityMode) {
        const point = data.project(p.lat,p.lng);
        const marker = element('button',String(index),'marker');
        marker.style.left = point.x + '%'; marker.style.top = point.y + '%'; marker.dataset.category = p.category;
        marker.setAttribute('aria-label',p.name + '，查看详情'); marker.setAttribute('aria-pressed',String(state.selected === p.id));
        marker.addEventListener('click', () => select(p.id,true)); $('#markers').append(marker);
      }
      const row = element('button',null,'place'); row.dataset.place = p.id;
      row.setAttribute('aria-pressed',String(state.selected === p.id));
      const copy = element('span'); copy.append(element('strong',p.name),element('small',p.area + ' · ' + categories()[p.category]));
      if (facilityMode) copy.append(statusBadge(p));
      row.append(element('span',String(index),'number'),copy);
      row.addEventListener('click', () => select(p.id,false)); $('#places').append(row);
      if (focusedId === p.id) row.focus({preventScroll:true});
    });
    if (!visible.length) {
      const empty = element('div',null,'empty');
      empty.append(element('p',facilityMode ? '暂无符合条件的收录，不能据此判断该片区没有配套。' : '没有匹配的地点，试试其他关键词或类型。'));
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
  $('#locate-button').addEventListener('click', () => {
    const status = $('#location-status'), button = $('#locate-button');
    $('#user-position').hidden = true;
    if (!window.isSecureContext || !navigator.geolocation) { status.textContent = '当前环境不支持定位，请使用 HTTPS 或 localhost。你仍可浏览示例地点。'; return; }
    button.disabled = true; status.textContent = '正在获取位置…';
    navigator.geolocation.getCurrentPosition(position => {
      button.disabled = false;
      const point = data.project(position.coords.latitude,position.coords.longitude);
      if (!point) { status.textContent = '你的位置不在当前示意区域内。仍可浏览深圳至香港的示例地点。'; return; }
      const dot = $('#user-position'); dot.style.left = point.x + '%'; dot.style.top = point.y + '%'; dot.hidden = false;
      status.textContent = '已显示当前位置的区域投影；示意底图不代表真实道路，不能用于导航。';
    }, error => {
      button.disabled = false;
      status.textContent = ({1:'未获得定位权限，可继续搜索和浏览示例地点。',2:'暂时无法获取位置，请稍后重试。',3:'定位超时，请重试。'})[error.code] || '定位失败，请重试。';
    }, {timeout:10000,maximumAge:60000,enableHighAccuracy:false});
  });
  state.selected = saved.facilities;
  buildFilters();
  render();
})();
