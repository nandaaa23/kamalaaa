import axios from 'axios';
import { getSpotifyToken } from './spotifyAuth';

export const fetchSpotifyPodcasts = async (searchTerm = 'postpartum depression') => {
  try {
    const token = await getSpotifyToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=show&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const shows = response.data.shows.items.map(show => ({
      id: show.id,
      name: show.name,
      description: show.description,
      image: show.images?.[0]?.url ?? '',
      spotifyUrl: show.external_urls.spotify,
    }));

    return shows;
  } catch (error) {
    console.error('Error fetching Spotify podcasts:', error.message);
    return [];
  }
};
