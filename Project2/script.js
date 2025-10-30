const API_URL = 'https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json?$order=inspection_date DESC&$limit=3000';
let DATA = [];
let FILTERED = [];
let currentSort = { key: 'name', dir: 'asc' };

document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.querySelector('#load-data-button');
  const cardBtn = document.querySelector('#card-view-btn');
  const tableBtn = document.querySelector('#table-view-btn');
  const catBtn = document.querySelector('#category-view-btn');
  const statsBtn = document.querySelector('#stats-view-btn');
  const thead = document.querySelector('#inspection-table thead');

  loadBtn.addEventListener('click', onLoad);
  cardBtn.addEventListener('click', () => switchTo('card', cardBtn));
  tableBtn.addEventListener('click', () => switchTo('table', tableBtn));
  catBtn.addEventListener('click', () => switchTo('category', catBtn));
  statsBtn.addEventListener('click', () => switchTo('stats', statsBtn));
  thead?.addEventListener('click', onSortClick);
});

async function onLoad() {
  const loadBtn = document.querySelector('#load-data-button');
  try {
    setStatus('loading', 'Loading from API…');
    loadBtn.disabled = true; loadBtn.textContent = 'Loading…';
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    DATA = raw.map(clean);
    FILTERED = DATA.slice();
    setStatus('success', `Loaded ${DATA.length} records`);
    showApp();
    renderCardView();
    loadBtn.disabled = false; loadBtn.textContent = 'Reload Data';
  } catch (e) {
    console.error(e);
    setStatus('error', e.message.includes('Failed to fetch')
      ? 'Network error. Use a local server (Live Server).'
      : ('Error: ' + e.message));
    loadBtn.disabled = false; loadBtn.textContent = 'Try Again';
  }
}

/* Normalizers & guards */
function normalizeCity(raw) {
  let s = (raw || '').toString().trim().toUpperCase();
  if (!s) return 'UNKNOWN';
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/^(CITY OF|TOWN OF|VILLAGE OF)\s+/i, '');
  s = s.replace(/\s*-\s*/g, '-').replace(/\s*\/\s*/g, '/');
  return s;
}
function sensibleDateOrNull(d) {
  if (!d) return null;
  const now = new Date();
  if (d > now || d.getFullYear() < 2000) return null;
  return d;
}

function clean(r) {
  const d = r.inspection_date ? new Date(r.inspection_date) : null;
  return {
    name: r.name || 'Unknown',
    city: normalizeCity(r.city),
    zip: r.zip || '',
    inspection_date: sensibleDateOrNull(d && !isNaN(d) ? d : null),
    inspection_results: r.inspection_results || 'N/A',
    risk_category: r.risk_category || 'N/A'
  };
}

function setStatus(kind, msg) {
  const box = document.querySelector('#loading-status');
  box.classList.remove('loading','success','error');
  box.classList.add(kind);
  box.querySelector('.status-message').textContent = msg;
}

function showApp() {
  document.querySelector('#view-controls').classList.remove('hidden');
  document.querySelector('#display-container').classList.remove('hidden');
  document.querySelector('#tutorial-insights').classList.remove('hidden');
  updateSummary();
}

/* Helpers */
function formatDate(d) { return d ? d.toLocaleDateString() : 'No date'; }
function statusClass(txt) {
  if (!txt || txt==='N/A' || txt==='------') return 'other';
  const s = String(txt).toLowerCase();
  return (s.includes('non-compliant') || s.includes('fail') || s.includes('not in')) ? 'non-compliant' : 'compliant';
}
function escapeHtml(s) {
  return (s ?? '').toString().replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function sortBy(a,b,key,dir){
  let va=a[key], vb=b[key];
  if (key==='inspection_date'){ va = a.inspection_date? a.inspection_date.getTime():0; vb=b.inspection_date? b.inspection_date.getTime():0; }
  else { va=(va||'').toString().toLowerCase(); vb=(vb||'').toString().toLowerCase(); }
  if (va<vb) return dir==='asc'?-1:1;
  if (va>vb) return dir==='asc'? 1:-1;
  return 0;
}

/* Summary */
function updateSummary() {
  const total = FILTERED.length;
  const compliant = FILTERED.filter(p => statusClass(p.inspection_results)==='compliant').length;
  const rate = total ? ((compliant/total)*100).toFixed(1) : '0.0';
  const citySet = new Set(FILTERED.map(p => p.city).filter(c => c && c !== 'UNKNOWN'));
  document.querySelector('#record-count').textContent = total;
  document.querySelector('#compliance-rate').textContent = rate + '%';
  document.querySelector('#city-count').textContent = citySet.size;
  document.querySelector('#data-summary').classList.remove('hidden');
}

/* Views */
function onSortClick(e){
  const th = e.target.closest('th[data-key]'); if (!th) return;
  const k = th.dataset.key;
  currentSort.dir = (currentSort.key === k && currentSort.dir === 'asc') ? 'desc' : 'asc';
  currentSort.key = k;
  renderTableView();
}

function switchTo(name, btn) {
  document.querySelectorAll('.view-button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.view-panel').forEach(p=>p.classList.remove('active'));
  document.querySelector(`#${name}-view`).classList.add('active');
  if (name==='card') renderCardView();
  if (name==='table') renderTableView();
  if (name==='category') renderCategoryView();
  if (name==='stats') renderStatsView();
}

function renderCardView() {
  const grid = document.querySelector('#card-grid');
  grid.innerHTML = '';
  FILTERED.slice(0,24).forEach(p => {
    const sc = statusClass(p.inspection_results);
    const div = document.createElement('div');
    div.className = `restaurant-card ${sc}`;
    div.innerHTML = `
      <div class="card-name">${escapeHtml(p.name)}</div>
      <div class="card-location">${escapeHtml(p.city)}, ${escapeHtml(p.zip)}</div>
      <div class="card-status ${sc}">${sc.replace('-', ' ')}</div>
      <div class="card-date">Last inspected: ${formatDate(p.inspection_date)}</div>
    `;
    grid.appendChild(div);
  });
}

function renderTableView() {
  const tbody = document.querySelector('#inspection-table tbody');
  tbody.innerHTML = '';
  const rows = FILTERED.slice(0, 1000).slice();
  rows.sort((a,b)=>sortBy(a,b,currentSort.key,currentSort.dir));
  rows.forEach(p=>{
    const sc = statusClass(p.inspection_results);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="table-restaurant-name">${escapeHtml(p.name)}</span></td>
      <td>${escapeHtml(p.city)}</td>
      <td>${formatDate(p.inspection_date)}</td>
      <td><span class="table-status ${sc}">${escapeHtml(p.inspection_results)}</span></td>
      <td>${escapeHtml(p.risk_category)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCategoryView() {
  const container = document.querySelector('#category-container');
  container.innerHTML = '';
  const groups = {};
  FILTERED.forEach(p => {
    const c = p.city || 'UNKNOWN';
    if (!groups[c]) groups[c] = { items: [], compliant: 0 };
    groups[c].items.push(p);
    if (statusClass(p.inspection_results)==='compliant') groups[c].compliant++;
  });
  Object.entries(groups)
    .sort(([,a],[,b]) => b.items.length - a.items.length)
    .forEach(([city, g]) => {
      const rate = g.items.length ? Math.round((g.compliant/g.items.length)*100) : 0;
      const wrap = document.createElement('div');
      wrap.className = 'city-stat';
      const id = `city-${city.replace(/\W+/g,'-').toLowerCase()}`;
      wrap.innerHTML = `
        <div>
          <div class="city-name">${escapeHtml(city === 'UNKNOWN' ? '(Unspecified)' : city)}</div>
          <div class="city-compliance">${g.items.length} records • ${rate}% compliant</div>
        </div>
        <button aria-controls="${id}" aria-expanded="false" class="load-button" style="width:auto;padding:.25rem .75rem;">Toggle</button>
      `;
      const list = document.createElement('div');
      list.id = id; list.style.display='none'; list.style.marginTop='.5rem';
      g.items.sort((a,b)=>a.name.localeCompare(b.name)).slice(0,40).forEach(p=>{
        const row = document.createElement('div');
        row.style.display='flex'; row.style.justifyContent='space-between'; row.style.padding='.25rem 0';
        row.innerHTML = `<span>${escapeHtml(p.name)}</span><span style="opacity:.7">${formatDate(p.inspection_date)} • ${escapeHtml(p.inspection_results)}</span>`;
        list.appendChild(row);
      });
      wrap.querySelector('button').addEventListener('click', () => {
        const btn = wrap.querySelector('button');
        const exp = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!exp));
        list.style.display = exp ? 'none' : 'block';
      });
      container.appendChild(wrap);
      container.appendChild(list);
    });
}

function renderStatsView() {
  const total = FILTERED.length;
  const compliant = FILTERED.filter(p => statusClass(p.inspection_results)==='compliant').length;
  const nonCompliant = FILTERED.length - compliant;
  const rate = total ? ((compliant/total)*100).toFixed(1) : '0.0';

  const citySet = new Set(FILTERED.map(p => p.city).filter(c => c && c !== 'UNKNOWN'));
  const dates = FILTERED.map(p=>p.inspection_date?.getTime()).filter(Boolean).sort((a,b)=>a-b);
  const mostRecent = dates.length ? new Date(dates[dates.length-1]) : null;
  const medianTs = dates.length ? dates[Math.floor(dates.length/2)] : null;
  const medianDaysAgo = medianTs ? Math.round((Date.now()-medianTs)/(1000*60*60*24)) : null;
  const byCity = FILTERED.reduce((m,p)=> (m[p.city]= (m[p.city]||0)+1, m), {});
  const topCity = Object.entries(byCity)
    .filter(([c]) => c && c !== 'UNKNOWN')
    .sort(([,a],[,b])=>b-a)[0] || ['—',0];

  const grid = document.querySelector('#stats-grid');
  grid.innerHTML = `
    <div class="stat-card"><p class="stat-label">Total Records</p><div class="stat-number">${total}</div></div>
    <div class="stat-card"><p class="stat-label">Compliant</p><div class="stat-number">${compliant}</div></div>
    <div class="stat-card"><p class="stat-label">Non-Compliant</p><div class="stat-number">${nonCompliant}</div></div>
    <div class="stat-card"><p class="stat-label">Compliance Rate</p><div class="stat-number">${rate}%</div></div>
    <div class="stat-card"><p class="stat-label">Unique Cities</p><div class="stat-number">${citySet.size}</div></div>
    <div class="stat-card"><p class="stat-label">Most Recent Inspection</p><div class="stat-number" style="font-size:1.5rem">${mostRecent? mostRecent.toLocaleDateString() : '—'}</div></div>
    <div class="stat-card"><p class="stat-label">Median Days Since</p><div class="stat-number">${medianDaysAgo ?? '—'}</div></div>
    <div class="stat-card"><p class="stat-label">Top City by Records</p><div class="stat-number" style="font-size:1.5rem">${escapeHtml(topCity[0])}</div></div>
  `;

  const cityStatsDiv = document.querySelector('#city-stats');
  cityStatsDiv.innerHTML = '';
  const complianceByCity = {};
  FILTERED.forEach(p=>{
    const c = p.city || 'UNKNOWN';
    if (!complianceByCity[c]) complianceByCity[c] = { total:0, ok:0 };
    complianceByCity[c].total++;
    if (statusClass(p.inspection_results)==='compliant') complianceByCity[c].ok++;
  });
  Object.entries(complianceByCity)
    .filter(([c]) => c && c !== 'UNKNOWN')
    .sort(([,a],[,b])=>b.total-a.total).slice(0,10)
    .forEach(([city, s])=>{
      const r = ((s.ok/s.total)*100).toFixed(1);
      const el = document.createElement('div');
      el.className = 'city-stat';
      el.innerHTML = `
        <div>
          <div class="city-name">${escapeHtml(city)}</div>
          <div class="city-compliance">${s.total} records</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:bold; color:${Number(r)>=80 ? '#28a745' : '#dc3545'}">${r}%</div>
          <div style="font-size:.75rem; color:#666">compliant</div>
        </div>`;
      cityStatsDiv.appendChild(el);
    });
}
