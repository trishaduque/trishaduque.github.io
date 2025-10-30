
// editable_js/load_data.js
// Art Institute of Chicago artworks (ES2015+).

const AIC_BASE = 'https://api.artic.edu/api/v1/artworks';
const AIC_FIELDS = [
  'id','title','artist_title','department_title','place_of_origin',
  'date_start','date_end','medium_display','artwork_type_title',
  'is_public_domain','image_id'
].join(',');

const fetchPage = async (page = 1, limit = 100) => {
  const url = `${AIC_BASE}?fields=${AIC_FIELDS}&page=${page}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AIC API error: ${res.status}`);
  return res.json();
};

const mapArtwork = (art) => ({
  // Core identity
  id: art.id,
  title: art.title ?? 'Untitled',
  artist_title: art.artist_title ?? 'Unknown artist',

  // Taxonomy
  department_title: art.department_title ?? 'Unknown department',
  artwork_type_title: art.artwork_type_title ?? 'Unknown type',
  place_of_origin: art.place_of_origin ?? 'Unknown origin',

  // Dates & legal
  date_start: Number.isFinite(art.date_start) ? art.date_start : null,
  date_end: Number.isFinite(art.date_end) ? art.date_end : null,
  is_public_domain: !!art.is_public_domain,

  // Materials & media
  medium_display: art.medium_display ?? null,
  image_id: art.image_id ?? null,
});

export default async function loadData({ pages = 2, pageSize = 100 } = {}) {
  try {
    const items = [];
    for (let p = 1; p <= pages; p += 1) {
      const json = await fetchPage(p, pageSize);
      if (Array.isArray(json?.data)) items.push(...json.data.map(mapArtwork));
    }
    if (items.length < 20) console.warn('Loaded fewer than 20 artworks; increase pages/pageSize.');
    if (typeof window !== 'undefined') { window._AIC_FULL_DATA = items; }
    return items;
  } catch (error) {
    console.error('Failed to load data:', error);
    throw new Error('Could not load data from AIC API');
  }
}
