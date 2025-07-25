import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import spotifyRoutes from './routes/spotifyRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/spotify', spotifyRoutes);

app.get('/', (req, res) => {
  res.send('🎧 Kamala Spotify backend is live');
});

const PORT = 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});