// Handles the My Playlists page

document.addEventListener('DOMContentLoaded', () => {
  const saved = JSON.parse(localStorage.getItem('saved_playlists') || '[]');
  const grid = document.getElementById('playlists-grid');

  if (saved.length === 0) {
    grid.innerHTML = '<p class="no-results">No playlists yet. <a href="create.html">Create one!</a></p>';
    return;
  }

  saved.forEach((playlist, idx) => {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <img class="album-cover" src="${playlist.tracks[0].image}" alt="${playlist.name}" />
      <p class="song-name">${playlist.name}</p>
      <p class="artist-name">${playlist.tracks.length} songs</p>
      <button class="playlist-delete-btn">✕</button>
    `;

    card.addEventListener('click', () => {
      localStorage.setItem('current_playlist', JSON.stringify(playlist));
      window.location.href = 'playlist.html';
    });

    card.querySelector('.playlist-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      saved.splice(idx, 1);
      localStorage.setItem('saved_playlists', JSON.stringify(saved));
      card.remove();
    });

    grid.appendChild(card);
  });

  updateAuthUI();
});