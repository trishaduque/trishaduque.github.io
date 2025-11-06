// ============================================
// DATA LOADING - Completed for Art Institute of Chicago
// ============================================
/**
 * Load data from the Art Institute of Chicago API.
 * Only fetches from https://api.artic.edu/api/v1/artworks
 * Returns array of artwork objects.
 */
async function loadData() {
  try {
    const url = new URL('https://api.artic.edu/api/v1/artworks');
   
    url.searchParams.set('fields', [
      'id',
      'title',
      'artist_title',
      'artist_display',
      'date_display',
      'medium_display',
      'department_title',
      'classification_title',
      'style_title',
      'place_of_origin',
      'dimensions',
      'image_id'
    ].join(','));
    url.searchParams.set('page', '1');
    url.searchParams.set('limit', '100'); // at least 20 records

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();

    const imageBase = 'https://www.artic.edu/iiif/2/';
    const data = (json?.data ?? []).map(item => ({
      id: item.id,
      title: item.title ?? 'Untitled',
      artist: item.artist_title ?? 'Unknown artist',
      artist_display: item.artist_display ?? '',
      date: item.date_display ?? 'Unknown date',
      medium: item.medium_display ?? 'Unknown medium',
      department: item.department_title ?? 'Other',
      classification: item.classification_title ?? 'Unclassified',
      style: item.style_title ?? '—',
      origin: item.place_of_origin ?? '—',
      dimensions: item.dimensions ?? '—',
      imageUrl: item.image_id ? `${imageBase}${item.image_id}/full/400,/0/default.jpg` : null
    }));

    console.log('data loaded', data);
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    throw new Error('Could not load data from Art Institute of Chicago API');
  }
}

export default loadData;