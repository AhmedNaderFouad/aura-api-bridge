import express from 'express';
import cors from 'cors';
import { MOVIES } from '@consumet/extensions';

const app = express();
app.use(cors());
app.use(express.json());

const vidsrc = new MOVIES.VidSrc();

app.get('/', (req, res) => {
    res.json({ message: "Aura API Bridge on Vercel is Working!" });
});

app.get('/watch/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const watchData = await vidsrc.fetchMediaSources(movieId);
        res.json(watchData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default app;