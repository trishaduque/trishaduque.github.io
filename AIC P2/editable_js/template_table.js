/**
 * TABLE VIEW - Completed for artworks
 * Display data in sortable rows - good for scanning specific information
 */
function showTable(data) {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { key: 'date', label: 'Date' },
    { key: 'department', label: 'Department' },
    { key: 'classification', label: 'Classification' },
    { key: 'medium', label: 'Medium' }
  ];

  const header = columns.map(c => `<th data-key="${c.key}" class="sortable">${c.label}<span class="sort-indicator" aria-hidden="true"></span></th>`).join('');

  const rows = (arr) => arr.map(art => `
    <tr>
      <td>${art.title}</td>
      <td>${art.artist}</td>
      <td>${art.date}</td>
      <td>${art.department}</td>
      <td>${art.classification}</td>
      <td>${art.medium}</td>
    </tr>
  `).join('');

  // Initial table HTML
  const tableHTML = `
    <h2 class="view-title">📊 Table View</h2>
    <p class="view-description">Scan the collection.</p>
    <div class="table-wrap">
      <table class="data-table" id="artworks-table">
        <thead><tr>${header}</tr></thead>
        <tbody>${rows(data)}</tbody>
      </table>
    </div>
  `;

  // Add inline script to enable sorting (scoped to this table)
  const script = `
    <script>
      (() => {
        const table = document.getElementById('artworks-table');
        if (!table) return;
        let sortKey = null;
        let sortDir = 1; // 1 asc, -1 desc
        const getCellText = (tr, idx) => tr.children[idx].textContent.trim().toLowerCase();
        const refresh = () => {
          const theadCells = [...table.tHead.rows[0].cells];
          theadCells.forEach((th, i) => {
            const key = th.getAttribute('data-key');
            th.querySelector('.sort-indicator').textContent = (key === sortKey) ? (sortDir === 1 ? ' ↑' : ' ↓') : '';
          });
        };
        [...table.tHead.rows[0].cells].forEach((th, idx) => {
          th.addEventListener('click', () => {
            const key = th.getAttribute('data-key');
            sortDir = (sortKey === key) ? -sortDir : 1;
            sortKey = key;
            const rows = [...table.tBodies[0].rows];
            rows.sort((a, b) => {
              const A = getCellText(a, idx);
              const B = getCellText(b, idx);
              if (!isNaN(A) && !isNaN(B)) return (Number(A) - Number(B)) * sortDir;
              return A.localeCompare(B) * sortDir;
            });
            table.tBodies[0].append(...rows);
            refresh();
          });
        });
        refresh();
      })();
    </script>
  `;

  return tableHTML + script;
}

export default showTable;