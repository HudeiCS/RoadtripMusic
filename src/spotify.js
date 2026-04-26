// I put links on each function if yall have any questions about the code

// ── Spotify Config
const clientId = '281784019c6748359d4b872692a5c9aa';
const redirectUri = 'http://127.0.0.1:5500/src/index.html';
const scope = 'streaming user-read-playback-state user-modify-playback-state user-top-read';

// Creates a random string for Spotify login verification
// From: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#code-verifier
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Hashes the random string so Spotify can verify it later
// From: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#code-challenge
const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

// Converts the hash to a URL-safe string
// From: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#code-challenge
const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Redirects user to Spotify's login page
// From: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#request-user-authorization
async function spotifyLogin() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem('code_verifier', codeVerifier);

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

// Exchanges the login code for an access token and saves it
// From: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#request-an-access-token
const getToken = async (code) => {
  const codeVerifier = localStorage.getItem('code_verifier');

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };

  const body = await fetch(url, payload);
  const response = await body.json();

  if (response.access_token) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('token_expiry', Date.now() + response.expires_in * 1000);
  }
}

// Gets a new access token when the current one expires
// From: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
async function refreshToken() {
  const refreshTkn = localStorage.getItem('refresh_token');
  if (!refreshTkn) return null;

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshTkn,
    }),
  };

  const body = await fetch(url, payload);
  const response = await body.json();

  if (response.access_token) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('token_expiry', Date.now() + response.expires_in * 1000);
    return response.access_token;
  }
  return null;
}

// Checks if token is expired and refreshes it if needed
async function getValidToken() {
  const expiry = localStorage.getItem('token_expiry');
  if (expiry && Date.now() > expiry - 60000) {
    return await refreshToken();
  }
  return localStorage.getItem('access_token');
}

// Grabs the login code from the URL after Spotify redirects back
// From: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#response
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // If user cancelled the login
  if (urlParams.get('error')) {
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = '/src/index.html';
    return;
  }

  const code = urlParams.get('code');
  if (!code) return;

  await getToken(code);
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Returns true if there's a token saved, false if not
function isLoggedIn() {
  return localStorage.getItem('access_token') !== null;
}

// Clears all saved tokens and sends user back to home page
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('code_verifier');
  window.location.href = '/src/index.html';
}

// Attaches the access token to any Spotify API call
// From: https://developer.spotify.com/documentation/web-api/concepts/access-token
async function spotifyFetch(endpoint, options = {}) {
  try {
    const token = await getValidToken();
    console.log('Token:', token);
    const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
     headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  return await res.json();
  }
  catch (err) {
    alert('Failed to fetch. Possible internet connection problem.');
    return null;
  }
}

// Searches Spotify's database for songs
// From: https://developer.spotify.com/documentation/web-api/reference/search
async function searchSpotify(query, types = 'track', limit = 10) {
  return spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=${types}&limit=${limit}`);
}

// Check what button to display if logged in or not
function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  if (!loginBtn || !logoutBtn) return;

  if (isLoggedIn()) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
  }
}

// Checks to see if logged in on page load
document.addEventListener('DOMContentLoaded', async () => {
  await handleCallback();
  updateAuthUI();
});