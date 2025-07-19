const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());

let accessToken = null;

// Fetch Spotify access token using Client Credentials flow
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  accessToken = data.access_token;
}

// Route to fetch podcasts related to postpartum topics
app.get('/spotify/podcasts', async (req, res) => {
  try {
    if (!accessToken) await getAccessToken();

    const query = encodeURIComponent('postpartum OR motherhood OR nutrition OR body image OR lifestyle');
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=show&limit=10`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    const podcasts = data.shows.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.images[0]?.url,
      spotifyUrl: item.external_urls.spotify
    }));

    res.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ error: 'Error fetching podcasts' });
  }
});

app.listen(port, () => {
  console.log(`Spotify server running on http://localhost:${port}`);
});
