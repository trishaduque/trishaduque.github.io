
// editable_js/template_table.js
// TABLE VIEW — artworks (ES2015+)

const safe = (v, f='—') => (v == null || v === '') ? f : v;
const sortBy = (arr, key, dir=1) => {
  const copy = [...arr];
  copy.sort((a,b) => {
    const va = a[key], vb = b[key];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });
  return copy;
};

function showTable(data) {
  let state = { key: 'title', dir: 1 };
  let rows = sortBy(data, state.key, state.dir);

  const renderRows = (items) => items.map(d => /*html*/`
    <tr>
      <td>${safe(d.title)}</td>
      <td>${safe(d.artist_title)}</td>
      <td>${safe(d.department_title)}</td>
      <td>${safe(d.place_of_origin)}</td>
      <td>${Number.isFinite(d.date_start) ? d.date_start : '—'}</td>
      <td>${d.is_public_domain ? 'Yes' : 'No'}</td>
    </tr>
  `).join('');

  const html = /*html*/`
    <h2 class="view-title">📋 Table View</h2>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th data-key="title">Title ▲▼</th>
            <th data-key="artist_title">Artist ▲▼</th>
            <th data-key="department_title">Department ▲▼</th>
            <th data-key="place_of_origin">Origin ▲▼</th>
            <th data-key="date_start">Date Start ▲▼</th>
            <th data-key="is_public_domain">Public? ▲▼</th>
          </tr>
        </thead>
        <tbody>${renderRows(rows)}</tbody>
      </table>
    </div>
    <script>
      (function(){
        const root = document.getElementById('data-display');
        let state = { key: 'title', dir: 1 };
        let data = window._AIC_DATA || [];

        function renderRows(items){
          return items.map(d => \`
            <tr>
              <td>\${d.title ?? '—'}</td>
              <td>\${d.artist_title ?? '—'}</td>
              <td>\${d.department_title ?? '—'}</td>
              <td>\${d.place_of_origin ?? '—'}</td>
              <td>\${Number.isFinite(d.date_start) ? d.date_start : '—'}</td>
              <td>\${d.is_public_domain ? 'Yes' : 'No'}</td>
            </tr>
          \`).join('');
        }

        root.querySelectorAll('th[data-key]').forEach(th => {
          th.addEventListener('click', () => {
            const key = th.getAttribute('data-key');
            state = state.key === key ? { key, dir: -state.dir } : { key, dir: 1 };
            const sorted = [...data].sort((a,b)=>{
              const va = a[key], vb = b[key];
              if (va == null && vb == null) return 0;
              if (va == null) return 1;
              if (vb == null) return -1;
              if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * state.dir;
              return String(va).localeCompare(String(vb)) * state.dir;
            });
            root.querySelector('tbody').innerHTML = renderRows(sorted);
          });
        });
      })();
    </script>
    <script>window._AIC_DATA = ${JSON.stringify(rows)};</script>
  `;

  return html;
}

export default showTable;
