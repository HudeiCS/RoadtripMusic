// Handles individual playlist page

document.addEventListener('DOMContentLoaded', async () => {
  const playlist = JSON.parse(localStorage.getItem('current_playlist'));

  if (!playlist) {
    window.location.href = 'create.html';
    return;
  }

  // Display playlist name, description, route, and stats
  document.title = `${playlist.name} - RoadTrip Music`;
  document.getElementById('playlist-title').textContent = playlist.name;
  document.getElementById('playlist-desc-text').textContent = playlist.description;
  document.getElementById('playlist-route').textContent = playlist.route;

  let totalMs = 0;
  playlist.tracks.forEach(t => {
    totalMs += t.duration_ms;
  });

  const totalMins = Math.floor(totalMs / 60000);
  document.getElementById('playlist-stats').textContent =
    `${playlist.tracks.length} songs ~ ${totalMins} min`;

  // First song is the album art as the playlist cover or if they upload an image
  const cover = document.createElement('img');
  const playlistCover = await getPlaylistImage(playlist.createdAt);
  cover.src = playlistCover || playlist.tracks[0].image;
  cover.alt = playlist.name;
  document.getElementById('playlist-cover').appendChild(cover);

  // Load each track as a row in the track list
  const listEl = document.getElementById('playlist-tracks-list');

  playlist.tracks.forEach((track, idx) => {
    const minutes = Math.floor(track.duration_ms / 60000);
    const seconds = Math.floor((track.duration_ms % 60000) / 1000);

    const row = document.createElement('div');
    row.className = 'playlist-track-row';
    row.innerHTML = `
      <span class="col-num">${idx + 1}</span>
      <div class="col-title">
        <img src="${track.image}" alt="${track.name}" />
        <div class="track-text">
          <p class="track-name">${track.name}</p>
          <p class="track-artist">${track.artists}</p>
        </div>
      </div>
      <span class="col-duration">${minutes}:${seconds.toString().padStart(2, '0')}</span>
      <button class="track-remove-btn">✕</button>
    `;

    row.addEventListener('click', () => {
      window.location.href = `song.html?id=${track.id}`;
    });

    row.querySelector('.track-remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      playlist.tracks.splice(idx, 1);
      localStorage.setItem('current_playlist', JSON.stringify(playlist));
      row.remove();

      if (playlist.tracks.length === 0) {
        const saved = JSON.parse(localStorage.getItem('saved_playlists') || '[]');
        const i = saved.findIndex(p => p.createdAt === playlist.createdAt); // Filters out the playlist that we are currently on
        saved.splice(i, 1);
        localStorage.setItem('saved_playlists', JSON.stringify(saved));
        window.location.href = 'playlists.html';
      }
    });

    listEl.appendChild(row);
  });

  updateAuthUI();
});

// Plays all tracks in the playlist via Spotify
// From: https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
async function playAll() {
  if (!isLoggedIn()) {
    alert('Please log in with Spotify first.');
    return;
  }

  const playlist = JSON.parse(localStorage.getItem('current_playlist'));
  const uris = playlist.tracks.map(t => t.uri);

  await spotifyFetch('/me/player/play', {
    method: 'PUT',
    body: JSON.stringify({ uris }),
  });
}