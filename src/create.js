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

  // Create Playlist button
  document.getElementById('create-playlist-btn').addEventListener('click', createPlaylist);
});


function loadSearchResults(tracks) {
  const resultsEl = document.getElementById('track-results');
  resultsEl.innerHTML = '';
 
  tracks.forEach(t => {
    const row = document.createElement('div');
    row.className = 'track-result-row';
 
    const image = t.album.images[0].url;
 
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
    id: track.id,
    uri: track.uri,
    name: track.name,
    artists: track.artists[0].name,
    image: track.album.images[0].url,
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


// Saves playlist data to LS and go to playlist.html
function createPlaylist() {
  const name = document.getElementById('playlist-name').value.trim();
  const description = document.getElementById('playlist-desc').value.trim();
  const statusEl = document.getElementById('create-status');

  if (!name) {
    statusEl.textContent = 'Please enter a playlist name.';
    return;
  }

  if (selectedTracks.length === 0) {
    statusEl.textContent = 'Please add at least one track.';
    return;
  }

  // Build a route string from the start/end inputs if filled in
  const start = document.getElementById('route-start')?.value.trim();
  const end = document.getElementById('route-end')?.value.trim();
  let route = '';
  if (start && end) {
    route = `${start} → ${end}`;
  } else if (start) {
    route = start;
  } else if (end) {
    route = end;
  }

  const playlist = {
    name,
    description,
    route,
    tracks: selectedTracks,
    createdAt: Date.now(),
  };

  // Save to LS playlist.js
  localStorage.setItem('current_playlist', JSON.stringify(playlist));

  // Append to saved playlists list for the My Playlists page
  const saved = JSON.parse(localStorage.getItem('saved_playlists') || '[]');
  saved.push(playlist);
  localStorage.setItem('saved_playlists', JSON.stringify(saved));

  window.location.href = 'playlist.html';
}