/**
 * CATEGORY VIEW - Completed for artworks
 * Group data by department to reveal collection composition
 */
function showCategories(data) {
  const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
      const k = item[key] || 'Other';
      (acc[k] ||= []).push(item);
      return acc;
    }, {});

  const groups = groupBy(data, 'department');
  const entries = Object.entries(groups).sort((a,b)=> b[1].length - a[1].length);

  const groupHTML = entries.map(([dept, items]) => {
    const sample = items.slice(0, 6).map(a => `<li><span class="title">${a.title}</span> <span class="by">by ${a.artist}</span></li>`).join('');
    return `
      <section class="category">
        <header class="category-header">
          <h3>${dept}</h3>
          <div class="pill">${items.length} works</div>
        </header>
        <ul class="category-list">${sample}</ul>
      </section>
    `;
  }).join('');

  return /*html*/`
    <h2 class="view-title">🗂️ Category View</h2>
    <p class="view-description">Grouped by <strong>Department</strong> to compare areas of the collection.</p>
    <div class="category-grid">
      ${groupHTML}
    </div>
  `;
}

export default showCategories;