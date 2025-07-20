import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
let accessToken = null;
let tokenExpiry = 0;

async function getSpotifyToken() {
  const now = Date.now();
  if (accessToken && now < tokenExpiry) return accessToken;

  const authString = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!data.access_token) throw new Error('Failed to get Spotify token');

  accessToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000 - 60000;

  return accessToken;
}

router.get('/podcasts', async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const query = 'postpartum motherhood depression postpartum depression nutrition mental health maternal mental health mom guilt healing after birth'; // keywords to search
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=show&limit=10&market=IN`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.shows || !data.shows.items) {
      return res.status(404).json({ error: 'No shows found' });
    }

    const shows = data.shows.items.map((show) => ({
      id: show.id,
      name: show.name,
      description: show.description,
      image: show.images?.[0]?.url || '',
      spotifyUrl: show.external_urls?.spotify,
    }));

    res.json(shows);
  } catch (error) {
    console.error('Spotify fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts from Spotify' });
  }
});

export default router;
