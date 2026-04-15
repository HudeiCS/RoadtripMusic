// Handles the search page functionality

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const resultsGrid = document.getElementById('results-grid');
  const resultsHeading = document.getElementById('results-heading');
  const noResults = document.getElementById('no-results');

  // Search when button is clicked
  searchBtn.addEventListener('click', performSearch);

  // Search when Enter key is pressed
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    if (!isLoggedIn()) {
      alert('Please log in with Spotify first.');
      return;
    }

    // Clear previous results
    resultsGrid.innerHTML = '';
    noResults.style.display = 'none';
    resultsHeading.style.display = 'none';

    const data = await searchSpotify(query);

    if (!data || !data.tracks || data.tracks.items.length === 0) {
        noResults.style.display = 'block';
        return;
}

    // Show heading
    resultsHeading.textContent = `Results for "${query}"`;
    resultsHeading.style.display = 'block';

    // Build a card for each track
    data.tracks.items.forEach(track => {
  const card = document.createElement('div');
  card.className = 'album-card';
  card.style.cursor = 'pointer';

  let image = '';
  if (track.album.images[0]) {
    image = track.album.images[0].url;
  }

  card.innerHTML = `
    <img class="album-cover" src="${image}" alt="${track.name}" />
    <p class="song-name">${track.name}</p>
    <p class="artist-name">${track.artists.map(a => a.name).join(', ')}</p>
  `;

  // Save track info and go to song page when clicked
  card.addEventListener('click', () => {
  const trackData = {
    name: track.name,
    artists: track.artists.map(a => a.name).join(', '),
    artistId: track.artists[0].id,
    album: track.album.name,
    image: image,
    uri: track.uri,
    duration_ms: track.duration_ms,
  };
  localStorage.setItem('selected_track', JSON.stringify(trackData));
  window.location.href = 'song.html';
});

  resultsGrid.appendChild(card);
});
  }
});