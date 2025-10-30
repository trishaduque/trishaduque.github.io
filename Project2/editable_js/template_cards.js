const safe = (v, f='—') => (v == null || v === '') ? f : v;
const imageUrl = (image_id, w = 400) =>
  image_id ? `https://www.artic.edu/iiif/2/${image_id}/full/${w},/0/default.jpg` : null;

function showCards(data) {
  const cardHTML = data.map((art) => {
    const img = imageUrl(art.image_id);
    const dates = (Number.isFinite(art.date_start) || Number.isFinite(art.date_end))
      ? `${art.date_start ?? '—'}–${art.date_end ?? art.date_start ?? '—'}`
      : '—';
    const pd = art.is_public_domain ? '<span class="tag success">Public Domain</span>' : '<span class="tag">Rights Restricted</span>';

    return /*html*/`
      <div class="restaurant-card">
        ${img ? `<img class="card-image" src="${img}" alt="${safe(art.title)}">` : ''}
        <h3>${safe(art.title)}</h3>
        <p><strong>Artist:</strong> ${safe(art.artist_title)}</p>
        <p><strong>Department:</strong> ${safe(art.department_title)}</p>
        <p><strong>Type:</strong> ${safe(art.artwork_type_title)}</p>
        <p><strong>Origin:</strong> ${safe(art.place_of_origin)}</p>
        <p><strong>Date:</strong> ${dates}</p>
        ${art.medium_display ? `<p><strong>Medium:</strong> ${safe(art.medium_display)}</p>` : ''}
        <div class="asst-box">${pd}</div>
      </div>
    `;
  }).join('');

  return /*html*/`
    <h2 class="view-title">🖼️ Card View</h2>
    <div class="card-grid">${cardHTML}</div>
  `;
}

export default showCards;
