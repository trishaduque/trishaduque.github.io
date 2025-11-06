/**
 * STATS VIEW - Completed for artworks
 * Aggregate insights and key metrics
 */
function showStats(data) {
  const total = data.length;
  const unique = (arr) => [...new Set(arr)];
  const uniqueArtists = unique(data.map(d => d.artist)).length;
  const departments = unique(data.map(d => d.department));
  const classifications = unique(data.map(d => d.classification));

  // Top departments by count
  const counts = data.reduce((acc, d) => {
    acc[d.department] = (acc[d.department] || 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Simple frequency bars
  const maxCount = Math.max(...Object.values(counts));

  const bars = top.map(([dept, count]) => `
    <div class="bar-row">
      <div class="bar-label">${dept}</div>
      <div class="bar" style="--w:${(count/maxCount)*100}%"></div>
      <div class="bar-value">${count}</div>
    </div>
  `).join('');

  // With images percentage
  const withImages = data.filter(d => !!d.imageUrl).length;
  const withImagesPct = Math.round((withImages/total)*100);

  return /*html*/`
    <h2 class="view-title">📈 Statistics View</h2>
    <p class="view-description">Insights from the selected artworks.</p>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${total}</div>
        <div class="stat-label">Total Artworks</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${uniqueArtists}</div>
        <div class="stat-label">Unique Artists</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${departments.length}</div>
        <div class="stat-label">Departments</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${classifications.length}</div>
        <div class="stat-label">Classifications</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${withImagesPct}%</div>
        <div class="stat-label">Have Images</div>
      </div>
    </div>

    <h3 class="subhead">Top Departments</h3>
    <div class="bar-chart">
      ${bars}
    </div>
  `;
}

export default showStats;