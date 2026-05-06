// Handles individual song page

document.addEventListener('DOMContentLoaded', async () => {
  const trackId = new URLSearchParams(window.location.search).get('id');

  if (!trackId) {
    window.location.href = 'search.html';
    return;
  }

  const song = await spotifyFetch(`/tracks/${trackId}`);

  if (!song) {
    window.location.href = 'search.html';
    return;
  }

  const artistName = song.artists[0].name;
  const artistId = song.artists[0].id;
  const image = song.album.images[0].url;

  // show album art song title and artist name
  document.getElementById('song-image').src = image;
  document.getElementById('song-title').textContent = song.name;
  document.getElementById('song-artist').textContent = song.artists.map(a => a.name).join(', ');

  // show song name and duration in the bar
  document.getElementById('song-bar-name').textContent = song.name;

  // Convert milliseconds to minutes:seconds  168000 -> "2:48"
  const minutes = Math.floor(song.duration_ms / 60000);
  const seconds = Math.floor((song.duration_ms % 60000) / 1000);
  document.getElementById('song-bar-duration').textContent =
    `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Plays the song
  // From: https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
  document.getElementById('play-btn').addEventListener('click', async () => {
    if (!isLoggedIn()) {
      alert('Please log in with Spotify first.');
      return;
    }

    console.log('Playing URI:', song.uri);
    await playTrack(song.uri)
  });

  // Load "More by Artist" section
  if (isLoggedIn() && artistId) {
    document.getElementById('more-heading').textContent = `More by ${artistName}`;

    // Search for more songs by the same artist
    // From: https://developer.spotify.com/documentation/web-api/reference/search
    const data = await searchSpotify(`artist:${artistName}`, 'track', 10);

    if (data && data.tracks && data.tracks.items.length > 0) {
      const moreGrid = document.getElementById('more-grid');

      const otherSongs = data.tracks.items
        .filter(t => t.id !== trackId)
        .slice(0, 5);

      otherSongs.forEach(t => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.style.cursor = 'pointer';

        const tImage = t.album.images[0].url;

        card.innerHTML = `
          <img class="album-cover" src="${tImage}" alt="${t.name}" />
          <p class="song-name">${t.name}</p>
          <p class="artist-name">${t.artists[0].name}</p>
        `;

        card.addEventListener('click', () => {
          window.location.href = `song.html?id=${t.id}`;
        });

        moreGrid.appendChild(card);
      });
    }
  }
});