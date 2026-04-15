// Sign up for a free API key at https://openrouteservice.org
const ORS_API_KEY = '***REMOVED***';

// ── Map state
let map = null;
let routeLayer = null;
let startMarker = null;
let endMarker = null;

// Creates the Leaflet map centered on the US and attaches an OpenStreetMap tile layer
// From: https://leafletjs.com/reference.html#map
function initMap() {
  map = L.map('map').setView([39.8283, -98.5795], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

// ── Autocomplete
let autocompleteTimers = {};

// Attaches input and blur listeners to an address field, debouncing requests by 300ms
// From: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
function setupAutocomplete(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);

  input.addEventListener('input', () => {
    clearTimeout(autocompleteTimers[inputId]);
    const query = input.value.trim();
    if (query.length < 3) {
      hideDropdown(dropdown);
      return;
    }
    autocompleteTimers[inputId] = setTimeout(() => {
      fetchSuggestions(query, input, dropdown);
    }, 300);
  });

  // Hide dropdown when focus leaves (small delay so click on item registers first)
  input.addEventListener('blur', () => {
    setTimeout(() => hideDropdown(dropdown), 150);
  });
}

// Clears and hides the autocomplete suggestion dropdown
// From: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
function hideDropdown(dropdown) {
  dropdown.innerHTML = '';
  dropdown.style.display = 'none';
}

// Queries the ORS Geocode Autocomplete API and passes results to renderSuggestions
// From: https://openrouteservice.org/dev/#/api-docs/geocode/autocomplete/get
async function fetchSuggestions(query, input, dropdown) {
  try {
    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    renderSuggestions(data.features || [], input, dropdown);
  } catch (err) {
    console.error('Autocomplete error:', err);
  }
}

// Builds suggestion items from ORS GeoJSON features and stores lat/lng on selection
// From: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
function renderSuggestions(features, input, dropdown) {
  dropdown.innerHTML = '';
  if (!features.length) {
    hideDropdown(dropdown);
    return;
  }
  features.slice(0, 6).forEach(f => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = f.properties.label;
    item.addEventListener('mousedown', () => {
      input.value = f.properties.label;
      input.dataset.lat = f.geometry.coordinates[1];
      input.dataset.lng = f.geometry.coordinates[0];
      hideDropdown(dropdown);
    });
    dropdown.appendChild(item);
  });
  dropdown.style.display = 'block';
}

// Resolves a typed address to coordinates if none are already stored on the input element
// From: https://openrouteservice.org/dev/#/api-docs/geocode/search/get
async function geocodeInput(input) {
  if (input.dataset.lat) return true; // already have coords from autocomplete
  const text = input.value.trim();
  if (!text) return false;
  try {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}&size=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length) {
      input.dataset.lat = data.features[0].geometry.coordinates[1];
      input.dataset.lng = data.features[0].geometry.coordinates[0];
      return true;
    }
  } catch (err) {
    console.error('Geocode error:', err);
  }
  return false;
}

// Resolves both inputs to coordinates, fetches a driving route, draws it on the map, and saves trip data
// From: https://openrouteservice.org/dev/#/api-docs/v2/directions/%7Bprofile%7D/get
async function getRoute() {
  const startInput = document.getElementById('route-start');
  const endInput = document.getElementById('route-end');
  const statusEl = document.getElementById('route-status');
  const btn = document.getElementById('get-route-btn');

  if (!startInput.value.trim() || !endInput.value.trim()) {
    statusEl.textContent = 'Please enter a starting point and destination.';
    return;
  }

  statusEl.textContent = 'Locating addresses\u2026';
  btn.disabled = true;

  const [startOk, endOk] = await Promise.all([
    geocodeInput(startInput),
    geocodeInput(endInput),
  ]);

  if (!startOk || !endOk) {
    statusEl.textContent = 'Could not find one or both locations. Try being more specific.';
    btn.disabled = false;
    return;
  }

  statusEl.textContent = 'Calculating route\u2026';

  try {
    const { lat: sLat, lng: sLng } = startInput.dataset;
    const { lat: eLat, lng: eLng } = endInput.dataset;

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${sLng},${sLat}&end=${eLng},${eLat}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.features || !data.features.length) {
      statusEl.textContent = 'No route found. Try different locations.';
      return;
    }

    const feature = data.features[0];
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const { distance, duration } = feature.properties.summary;

    const distMi = (distance / 1609.34).toFixed(1);
    const distKm = (distance / 1000).toFixed(1);
    const totalMin = Math.round(duration / 60);
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    // Draw route on map
    if (routeLayer) map.removeLayer(routeLayer);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);

    routeLayer = L.polyline(coords, { color: '#e07b30', weight: 5, opacity: 0.85 }).addTo(map);

    startMarker = L.circleMarker(coords[0], {
      radius: 8, fillColor: '#e07b30', color: '#fff', weight: 2, fillOpacity: 1
    }).addTo(map).bindTooltip(startInput.value, { permanent: false });

    endMarker = L.circleMarker(coords[coords.length - 1], {
      radius: 8, fillColor: '#ffffff', color: '#e07b30', weight: 2, fillOpacity: 1
    }).addTo(map).bindTooltip(endInput.value, { permanent: false });

    map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });

    // Show summary card
    statusEl.innerHTML = `
      <div class="route-summary">
        <div class="route-stat">
          <span class="route-stat-label">Distance</span>
          <span class="route-stat-value">${distMi} mi <span class="route-stat-sub">(${distKm} km)</span></span>
        </div>
        <div class="route-divider"></div>
        <div class="route-stat">
          <span class="route-stat-label">Drive time</span>
          <span class="route-stat-value">${durationStr}</span>
        </div>
      </div>
    `;

    // Store trip data for playlist generation
    localStorage.setItem('tripDistanceKm', distKm);
    localStorage.setItem('tripDistanceMi', distMi);
    localStorage.setItem('tripDurationMin', totalMin);
    localStorage.setItem('tripOrigin', startInput.value);
    localStorage.setItem('tripDestination', endInput.value);

  } catch (err) {
    console.error('Routing error:', err);
    statusEl.textContent = 'Error fetching route. Check your API key and try again.';
  } finally {
    btn.disabled = false;
  }
}

// Initializes the map and wires up autocomplete on both address inputs on page load
// From: https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupAutocomplete('route-start', 'route-start-dropdown');
  setupAutocomplete('route-end', 'route-end-dropdown');
});
