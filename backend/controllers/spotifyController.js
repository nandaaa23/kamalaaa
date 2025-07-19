// controllers/spotifyController.js
import axios from 'axios';
import { getSpotifyToken } from '../utils/getSpotifyToken.js';

export const getSpotifyPodcasts = async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get(
      'https://api.spotify.com/v1/shows/7fJd7MyAiYQ1x5u1dfl6l9/episodes?market=IN&limit=20',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const episodes = response.data.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.images[0].url,
      audio: item.external_urls.spotify,
      release_date: item.release_date,
    }));

    res.json(episodes);
  } catch (error) {
    console.error('Error fetching Spotify data:', error.message);
    res.status(500).json({ error: 'Failed to fetch podcast episodes' });
  }
};
