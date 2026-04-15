// Handles individual song page

document.addEventListener('DOMContentLoaded', async () => {
  const song = JSON.parse(localStorage.getItem('selected_track'));

  if (!song) {
    window.location.href = 'search.html';
    return;
  }

  // Display album art, song title, and artist name
  document.getElementById('song-image').src = song.image;
  document.getElementById('song-title').textContent = song.name;
  document.getElementById('song-artist').textContent = song.artists;

  // Display song name and duration in the bar
  document.getElementById('song-bar-name').textContent = song.name;

  // Convert milliseconds to minutes:seconds (e.g. 168000 -> "2:48")
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

    await spotifyFetch('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify({ uris: [song.uri] }),
    });
  });

  // Load "More by Artist" section
  if (isLoggedIn() && song.artistId) {
    const artistName = song.artists.split(',')[0].trim();
    document.getElementById('more-heading').textContent = `More by ${artistName}`;

    // Search for more songs by the same artist
    // From: https://developer.spotify.com/documentation/web-api/reference/search
    const data = await searchSpotify(`artist:${artistName}`, 'track', 10);

    if (data && data.tracks && data.tracks.items.length > 0) {
      const moreGrid = document.getElementById('more-grid');

      // Filter out the current song and limit to 5
      const otherSongs = data.tracks.items
        .filter(t => t.uri !== song.uri)
        .slice(0, 5);

      otherSongs.forEach(t => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.style.cursor = 'pointer';

        let image = '';
        if (t.album.images[0]) {
            image = t.album.images[0].url;
        }

        card.innerHTML = `
          <img class="album-cover" src="${image}" alt="${t.name}" />
          <p class="song-name">${t.name}</p>
          <p class="artist-name">${t.artists[0].name}</p>
        `;

        // Click to view this song's page
        card.addEventListener('click', () => {
          const songData = {
            name: t.name,
            artists: t.artists[0].name,
            artistId: t.artists[0].id,
            album: t.album.name,
            image: image,
            uri: t.uri,
            duration_ms: t.duration_ms,
          };
          localStorage.setItem('selected_track', JSON.stringify(songData));
          window.location.reload();
        });

        moreGrid.appendChild(card);
      });
    }
  }
});