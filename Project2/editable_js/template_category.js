
// editable_js/template_category.js
// CATEGORY VIEW — group by department (default) with Show more/less

const safe = (v, f='—') => (v==null||v==='')?f:v;
const num  = (n) => new Intl.NumberFormat().format(n);

const groupBy = (arr, keyFn) => {
  const m = new Map();
  for (const it of arr){
    const k = keyFn(it);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(it);
  }
  return m;
};

function showCategories(data, { groupField = 'department_title' } = {}) {
  const groups = groupBy(data, d => d[groupField] || 'Unknown');
  const entries = [...groups.entries()].sort((a,b)=>b[1].length - a[1].length);

  const html = /*html*/`
    <h2 class="view-title">🗂️ Category View (${groupField})</h2>
    ${entries.map(([key, items], idx) => {
      const dates = items.map(d=>d.date_start).filter(n=>Number.isFinite(n));
      const avg = dates.length ? Math.round(dates.reduce((a,c)=>a+c,0)/dates.length) : '—';
      const sectionId = `cat_${idx}`;
      const preview = items.slice(0,10);
      const extra = items.slice(10);
      return `
        <section class="category-group" id="${sectionId}">
          <header class="category-header">
            <h3>${safe(key)} <span class="muted">(${num(items.length)})</span></h3>
            <p class="muted">Avg. start date: ${avg}</p>
          </header>
          <ul class="category-list">
            ${preview.map(d => `
              <li class="category-item">
                <div class="item-title">${safe(d.title)}</div>
                <div class="item-sub">${safe(d.artist_title)} • ${safe(d.place_of_origin)}</div>
              </li>
            `).join('')}
            ${extra.map(d => `
              <li class="category-item is-extra hidden">
                <div class="item-title">${safe(d.title)}</div>
                <div class="item-sub">${safe(d.artist_title)} • ${safe(d.place_of_origin)}</div>
              </li>
            `).join('')}
          </ul>
          ${extra.length ? `<button class="btn-toggle js-toggle-group" data-target="${sectionId}" data-state="collapsed" onclick="window.toggleCategoryGroup('${sectionId}', this)">Show all (${num(extra.length)} more)</button>` : ''}
        </section>
      `;
    }).join('')}
    `;
  return html;
}

export default showCategories;
