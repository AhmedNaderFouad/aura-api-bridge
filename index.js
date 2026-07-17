import express from 'express';
import cors from 'cors';
import { MOVIES } from '@consumet/extensions';

const app = express();
app.use(cors());
app.use(express.json());

// تعريف مزود الخدمة (مثلاً vidsrc)
const vidsrc = new MOVIES.VidSrc();

app.get('/', (req, res) => {
    res.json({ message: "Aura API Bridge is Working!" });
});

// إندبوينت لجلب روابط الفيلم والسترينج
app.get('/watch/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const watchData = await vidsrc.fetchMediaSources(movieId);
        res.json(watchData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});