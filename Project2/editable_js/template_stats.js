const groupBy = (arr, keyFn) => {
  const m = new Map();
  for (const it of arr){
    const k = keyFn(it);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(it);
  }
  return m;
};
const num = (n) => new Intl.NumberFormat().format(n);
const pct = (n) => `${(n*100).toFixed(1)}%`;
const toCentury = (d) => (typeof d==='number' && Number.isFinite(d)) ? Math.floor((d-1)/100)+1 : null;

function showStats(data){
  const total = data.length;
  const publicCount = data.filter(d=>d.is_public_domain).length;
  const departments = groupBy(data, d => d.department_title || 'Unknown');
  const artists = groupBy(data, d => d.artist_title || 'Unknown');
  const origins = groupBy(data, d => d.place_of_origin || 'Unknown');

  const dates = data.map(d=>d.date_start).filter(n=>Number.isFinite(n)).sort((a,b)=>a-b);
  const earliest = dates[0] ?? '—';
  const median = dates.length ? (dates.length%2 ? dates[(dates.length-1)/2] : Math.round((dates[dates.length/2-1]+dates[dates.length/2])/2)) : '—';

  const topN = (map, n=5) => [...map.entries()].map(([k, arr])=>[k, arr.length]).sort((a,b)=>b[1]-a[1]).slice(0,n);

  const byCentury = groupBy(dates, d => toCentury(d) ?? 'Unknown');
  const centPairs = [...byCentury.entries()].map(([c, arr]) => [String(c), arr.length]).sort((a,b)=>a[0].localeCompare(b[0]));

  const html = /*html*/`
    <h2 class="view-title">📈 Statistics View</h2>

    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total artworks</div>
        <div class="stat-value">${num(total)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Public domain</div>
        <div class="stat-value">${num(publicCount)} <span class="muted">(${pct(publicCount/Math.max(total,1))})</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Departments</div>
        <div class="stat-value">${num(departments.size)}</div>
      </div>
    </section>

    <section class="two-col">
      <div class="panel">
        <h3>Time span</h3>
        <div class="kv"><span>Earliest start</span><strong>${earliest}</strong></div>
        <div class="kv"><span>Median start</span><strong>${median}</strong></div>
      </div>
      <div class="panel">
        <h3>Top 5 artists</h3>
        <ol>
          ${topN(artists).map(([k,n])=>`<li>${k} — <span class="muted">${num(n)}</span></li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="two-col">
      <div class="panel">
        <h3>Top 5 origins</h3>
        <ol>
          ${topN(origins).map(([k,n])=>`<li>${k} — <span class="muted">${num(n)}</span></li>`).join('')}
        </ol>
      </div>
      <div class="panel">
        <h3>Distribution by century</h3>
        <ul class="bar-list">
          ${centPairs.map(([c,n],_,arr)=>{
            const max = Math.max(...arr.map(p=>p[1]),1);
            const w = Math.round(n/max*100);
            return `<li class="bar-row"><span class="bar-label">${c}c</span><span class="bar-track"><span class="bar-fill" style="width:${w}%"></span></span><span class="bar-count">${n}</span></li>`;
          }).join('')}
        </ul>
      </div>
    </section>
  `;
  return html;
}

export default showStats;
