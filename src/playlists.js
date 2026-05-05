// Handles the My Playlists page

document.addEventListener('DOMContentLoaded', () => {
  const saved = JSON.parse(localStorage.getItem('saved_playlists') || '[]');
  const grid = document.getElementById('playlists-grid');
  const sortSelect = document.getElementById('sort-select')

  if (saved.length === 0) {
    grid.innerHTML = '<p class="no-results">No playlists yet. <a href="create.html">Create one!</a></p>';
    return;
  }

  function sortPlaylists(list, method) {
    const copy = [...list];
    if (method === 'name') {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (method === 'tracks') {
      copy.sort((a, b) => b.tracks.length - a.tracks.length);
    } else {
      copy.sort((a, b) => b.createdAt - a.createdAt);
    }
    return copy;
  }

  function renderGrid(list) {
    grid.innerHTML = '';
    list.forEach((playlist, idx) => {
      const card = document.createElement('div');
      card.className = 'album-card';
      card.style.cursor = 'pointer';

      card.innerHTML = `
      <img class="album-cover" src="${playlist.tracks[0].image}" alt="${playlist.name}" />
      <p class="song-name">${playlist.name}</p>
      <p class="artist-name">${playlist.tracks.length} songs</p>
      <button class="playlist-delete-btn">✕</button>
    `;

      getPlaylistImage(playlist.createdAt).then(url => {
        if (url) {
          card.querySelector('.album-cover').src = url;
        }
      })

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
  }
  renderGrid(sortPlaylists(saved, sortSelect.value));

  sortSelect.addEventListener('change', () => {
    renderGrid(sortPlaylists(saved, sortSelect.value));
  });

    updateAuthUI();
  });