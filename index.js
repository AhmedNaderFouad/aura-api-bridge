import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // أو استخدام fetch المدمج في Node 18+

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: "Aura Stable Bridge is Online" });
});

app.get('/watch/:id', async (req, res) => {
    try {
        const tmdbId = req.params.id;


        const targetUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;

        res.json({
            success: true,
            embed_url: targetUrl,
            message: "Use this in your media pipeline"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default app;