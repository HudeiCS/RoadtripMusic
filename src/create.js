const selectedTracks = [];
 
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('track-search-input');
 
  // Press Enter to search Spotify for tracks
  // From: https://developer.spotify.com/documentation/web-api/reference/search
  input.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
 
    const query = input.value.trim();
    if (!query) return;
 
    const data = await searchSpotify(query, 'track', 10);
    loadSearchResults(data.tracks.items);
  });
});


function loadSearchResults(tracks) {
  const resultsEl = document.getElementById('track-results');
  resultsEl.innerHTML = '';
 
  tracks.forEach(t => {
    const row = document.createElement('div');
    row.className = 'track-result-row';
 
    const image = t.album.images[2].url;
 
    row.innerHTML = `
      <img class="track-result-img" src="${image}" alt="${t.name}" />
      <div class="track-result-info">
        <p class="track-result-name">${t.name}</p>
        <p class="track-result-artist">${t.artists[0].name}</p>
      </div>
      <button class="track-result-add">+</button>
    `;
 
    row.addEventListener('click', () => addTrack(t));
    resultsEl.appendChild(row);
  });
}
 

function addTrack(track) {
  selectedTracks.push({
    uri: track.uri,
    name: track.name,
    artists: track.artists[0].name,
    image: track.album.images[2].url,
    duration_ms: track.duration_ms,
  });
 
  loadSelectedTracks();
  document.getElementById('track-results').innerHTML = '';
}
 

function removeTrack(uri) {
  const idx = selectedTracks.findIndex(t => t.uri === uri);
  selectedTracks.splice(idx, 1);
  loadSelectedTracks();
}
 


function loadSelectedTracks() {
  const listEl = document.getElementById('selected-tracks');
  const countEl = document.getElementById('track-count');
 
  countEl.textContent = `${selectedTracks.length} tracks added`;
  listEl.innerHTML = '';
 
  selectedTracks.forEach(t => {
    const row = document.createElement('div');
    row.className = 'selected-track-row';
    row.innerHTML = `
      <img class="track-result-img" src="${t.image}" alt="${t.name}" />
      <div class="track-result-info">
        <p class="track-result-name">${t.name}</p>
        <p class="track-result-artist">${t.artists}</p>
      </div>
      <button class="track-remove-btn">✕</button>
    `;
 
    row.querySelector('.track-remove-btn').addEventListener('click', () => {
      removeTrack(t.uri);
    });
 
    listEl.appendChild(row);
  });
}