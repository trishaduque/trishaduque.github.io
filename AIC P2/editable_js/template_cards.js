/**
 * CARD VIEW - Adapted for artworks (example complete view)
 * Display artworks as browsable cards
 */
function showCards(data) {
  const cardHTML = data.map((art) => /*html*/`
    <div class="art-card">
      <div class="art-image ${art.imageUrl ? '' : 'placeholder'}">
        ${art.imageUrl ? `<img alt="${art.title} by ${art.artist}" src="${art.imageUrl}" loading="lazy">` : '<div class="no-image">No image</div>'}
      </div>
      <div class="art-meta">
        <h3 class="art-title">${art.title}</h3>
        <p class="art-artist"><strong>Artist:</strong> ${art.artist}</p>
        <p class="art-sub">
          <span><strong>Date:</strong> ${art.date}</span>
          <span><strong>Dept.:</strong> ${art.department}</span>
        </p>
        <p class="art-medium">${art.medium}</p>
      </div>
    </div>
  `).join('');

  return /*html*/`
    <h2 class="view-title">🎨 Card View</h2>
    <p class="view-description">Browse artworks </p>
    <div class="card-grid">${cardHTML}</div>
  `;
}

export default showCards;