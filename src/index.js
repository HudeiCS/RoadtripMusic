document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn()) {
    showLoginPrompt('#trending .album-grid');
    showLoginPrompt('#trending-albums .album-grid');
    return;
  }

  await Promise.all([loadTrendingSongs(), loadTopAlbums()]);
});

function showLoginPrompt(selector) {
  const grid = document.querySelector(selector);
  if (grid) grid.innerHTML = '<p style="color: var(--text-4); font-size: 0.95rem;">Log in with Spotify to see trending content.</p>';
}

async function loadTrendingSongs() {
  const grid = document.querySelector('#trending .album-grid');
  if (!grid) return;

  grid.innerHTML = '<p style="color: var(--text-4); font-size: 0.95rem;">Loading…</p>';

  const data = await spotifyFetch('/me/top/tracks?time_range=short_term&limit=5');
  if (!data?.items?.length) return;

  grid.innerHTML = '';
  for (const track of data.items) {
    grid.appendChild(buildCard(
      track.album.images[0]?.url,
      track.name,
      track.artists[0]?.name,
      `song.html?id=${track.id}`
    ));
  }
}

async function loadTopAlbums() {
  const grid = document.querySelector('#trending-albums .album-grid');
  if (!grid) return;

  grid.innerHTML = '<p style="color: var(--text-4); font-size: 0.95rem;">Loading…</p>';

  const data = await spotifyFetch('/me/top/tracks?time_range=medium_term&limit=20');
  if (!data?.items?.length) return;

  grid.innerHTML = '';
  const seen = new Set();
  for (const item of data.items) {
    if (seen.size === 5) break;
    const album = item.album;
    if (seen.has(album.id)) continue;
    seen.add(album.id);
    grid.appendChild(buildCard(
      album.images[0]?.url,
      album.name,
      album.artists[0]?.name
    ));
  }
}

function buildCard(imageUrl, title, subtitle, href) {
  const card = document.createElement('div');
  card.className = 'album-card';

  const img = document.createElement('img');
  img.className = 'album-cover';
  img.src = imageUrl || '';
  img.alt = title;

  const name = document.createElement('p');
  name.className = 'song-name';
  name.textContent = title;

  const artist = document.createElement('p');
  artist.className = 'artist-name';
  artist.textContent = subtitle;

  card.append(img, name, artist);

  if (href) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => { window.location.href = href; });
  }

  return card;
}
