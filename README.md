# RoadTrip Music

A web app that builds a Spotify playlist to match the drive you're about to take.

Enter a start and destination, and it maps the route, works out which musical
regions you'll pass through, and generates a playlist sized to the length of
the trip.

Built for CS343 at JMU
---

## How it works

The route is resolved through OpenRouteService, which returns the path and an
estimated drive time.

Genres are mapped to fixed anchor points across the country. For each leg of
the route, the app finds the nearest anchors by distance and uses them to pick
the musical character of that stretch. Songs are then pulled from Spotify and
the playlist is trimmed to fit the estimated drive time, so it lasts roughly
as long as the drive does.

---

## Features

- Route planning with an interactive map
- Playlists generated from the regions along the route
- Manual track search and playlist building
- Light and dark mode
- Mobile responsive

---

## Built with

- **Spotify Web API** — track search and playlist creation
- **OpenRouteService** — geocoding, autocomplete, and driving directions
- **Leaflet.js / OpenStreetMap** — map rendering

---

## Running it locally

You need a free OpenRouteService API key and a Spotify developer app.

1. Get a key at [openrouteservice.org](https://openrouteservice.org)
2. Copy `src/config.example.js` to `src/config.js` and paste your key in
3. Open `index.html` in a browser, or serve the folder:
   ```bash
   python3 -m http.server 8000
   ```
4. Go to **Create Playlist**, enter a start and destination, give it a title,
   and hit **Generate Songs**

`src/config.js` is gitignored — don't commit your key.

---

## Known limitations

- Genre matching uses straight-line distance over latitude/longitude, which
  treats the map as flat. Fine at the scale we tested, but Haversine would be
  the correct measure.
- Genre anchor points are hand-placed rather than derived from data.
- Runs locally only; not deployed.

---
