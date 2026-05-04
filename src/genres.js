const GENRE_SEARCHES = {
  rap:     'hip hop rap',
  country: 'country music',
  indie:   'indie rock',
  pop:     'pop hits',
  tropical: 'tropical',
  desert:  'desert americana southwest',
  edm:     'electronic dance edm',
};

const GENRE_POINTS = [
  { name: 'New York City',  lat: 40.7128, lng: -74.0060,  genres: ['rap', 'pop'] },
  { name: 'Burlington',     lat: 44.4759, lng: -73.2121,  genres: ['indie'] },
  { name: 'Washington DC',  lat: 38.9072, lng: -77.0369,  genres: ['rap', 'pop'] },
  { name: 'Shenandoah',     lat: 38.4496, lng: -78.8689,  genres: ['country', 'indie'] },

  { name: 'Atlanta',        lat: 33.7490, lng: -84.3880,  genres: ['rap'] },
  { name: 'Asheville',      lat: 35.5951, lng: -82.5515,  genres: ['indie', 'country'] },
  { name: 'Charleston',     lat: 32.7765, lng: -79.9311,  genres: ['tropical', 'country'] },
  { name: 'Outer Banks',    lat: 35.5582, lng: -75.4665,  genres: ['tropical'] },
  { name: 'Miami',          lat: 25.7617, lng: -80.1918,  genres: ['tropical', 'pop'] },

  { name: 'Memphis',        lat: 35.1495, lng: -90.0490,  genres: ['rap'] },
  { name: 'Nashville',      lat: 36.1627, lng: -86.7816,  genres: ['country'] },
  { name: 'New Orleans',    lat: 29.9511, lng: -90.0715,  genres: ['rap', 'tropical'] },

  { name: 'Chicago',        lat: 41.8781, lng: -87.6298,  genres: ['rap'] },
  { name: 'Detroit',        lat: 42.3314, lng: -83.0458,  genres: ['rap'] },
  { name: 'Minneapolis',    lat: 44.9778, lng: -93.2650,  genres: ['indie', 'pop'] },
  { name: 'Kansas City',    lat: 39.0997, lng: -94.5786,  genres: ['country', 'rap'] },

  { name: 'Houston',        lat: 29.7604, lng: -95.3698,  genres: ['rap'] },
  { name: 'Dallas',         lat: 32.7767, lng: -96.7970,  genres: ['rap'] },
  { name: 'Austin',         lat: 30.2672, lng: -97.7431,  genres: ['indie', 'country'] },
  { name: 'West Texas',     lat: 31.5000, lng: -103.0000, genres: ['country', 'desert'] },

  { name: 'Oklahoma City',  lat: 35.4676, lng: -97.5164,  genres: ['country'] },
  { name: 'Boulder',        lat: 40.0150, lng: -105.2705, genres: ['indie'] },
  { name: 'Black Hills',    lat: 44.0000, lng: -103.5000, genres: ['country', 'indie'] },
  { name: 'Billings',       lat: 45.7833, lng: -108.5007, genres: ['country'] },
  { name: 'Salt Lake City', lat: 40.7608, lng: -111.8910, genres: ['indie'] },
  { name: 'Boise',          lat: 43.6150, lng: -116.2023, genres: ['country'] },

  { name: 'Albuquerque',    lat: 35.0844, lng: -106.6504, genres: ['desert'] },
  { name: 'Phoenix',        lat: 33.4484, lng: -112.0740, genres: ['desert'] },
  { name: 'Las Vegas',      lat: 36.1699, lng: -115.1398, genres: ['edm', 'pop'] },

  { name: 'San Diego',      lat: 32.7157, lng: -117.1611, genres: ['tropical'] },
  { name: 'Los Angeles',    lat: 34.0522, lng: -118.2437, genres: ['rap', 'pop', 'tropical'] },
  { name: 'San Francisco',  lat: 37.7749, lng: -122.4194, genres: ['indie', 'rap'] },
  { name: 'Portland',       lat: 45.5152, lng: -122.6784, genres: ['indie'] },
];
const SAMPLE_INTERVAL_MIN = 15;   // sample the route every 15 minutes of driving
const SONG_LENGTH_MIN     = 2.5;  // average song length used for song-count math

function findClosestPoint(lat, lng) {
  let closest = null;
  let minDist = Infinity;
  for (const point of GENRE_POINTS) {
    const dLat = lat - point.lat;
    const dLng = lng - point.lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDist) {
      minDist = dist;
      closest = point;
    }
  }
  return closest;
}


function sampleRouteForGenres(coords, totalMin) { // takes a point every 15 minutes on the route and findest closest location and that location genres
  const numSamples = Math.round(totalMin / SAMPLE_INTERVAL_MIN);
  const votes = {};

  for (let i = 0; i < numSamples; i++) {
    const idx = Math.floor((coords.length * i) / numSamples);
    const [lat, lng] = coords[idx];
    const point = findClosestPoint(lat, lng);

    for (const genre of point.genres) {
      votes[genre] = (votes[genre] || 0) + 1;
    }
  }
  return votes;
}


function calculateGeneration(totalMin, userMin, votes) {
  const gapMin = totalMin - userMin;
  const totalSongs = Math.round((gapMin * 1.30) / SONG_LENGTH_MIN); // 1.30 * gapMin for 30% extra amount of songs incase of skips

  let totalVotes = 0;
  for (const genre in votes) {
    totalVotes += votes[genre];
  }

  const songCounts = {};
  for (const genre in votes) {
    songCounts[genre] = Math.round(totalSongs * (votes[genre] / totalVotes)); // finds percentage of each and equivalent amount of songs
  }
  return songCounts;
}


function sumUserMinutes(tracks) {
  let totalMs = 0;
  for (const t of tracks) {
    totalMs += t.duration_ms;
  }
  return totalMs / 60000;
}