import express from 'express';
import cors from 'cors';
import { MOVIES } from '@consumet/extensions';

const app = express();
app.use(cors());
app.use(express.json());

// تشغيل ملقط الأفلام من مكتبة Consumet
const vidsrc = new MOVIES.VidSrcTo();

app.get('/', (req, res) => {
    res.json({ status: "Aura Stable Bridge is Online" });
});

app.get('/watch/:id', async (req, res) => {
    const tmdbId = req.params.id;
    const embedUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;

    try {
        // المكتبة بتدخل تفك التشفير داخلياً وتجيب السيرفرات المباشرة
        const movieSources = await vidsrc.fetchEpisodeSources(tmdbId);

        // تصفية الروابط لـ جلب رابط البث المباشر (.m3u8) عالي الجودة
        if (movieSources && movieSources.sources && movieSources.sources.length > 0) {
            // غالباً أول سيرفر هو الأساسي والأعلى جودة
            const primarySource = movieSources.sources[0]; 

            return res.json({
                success: true,
                provider: "vidsrc_consumet_native",
                embed_url: embedUrl,
                stream_url: primarySource.url, // الرابط الخام الناتيڤ (.m3u8)
                subtitles: movieSources.subtitles || [],
                message: "Native stream extracted successfully by Aura Bridge"
            });
        }

        // Fallback لو المكتبة معرفتش تلقط اللينك في ثواني
        return res.json({
            success: true,
            provider: "fallback_embed",
            embed_url: embedUrl,
            stream_url: null,
            message: "Direct stream currently unavailable, falling back to embed"
        });

    } catch (error) {
        return res.json({
            success: true,
            provider: "fallback_embed",
            embed_url: embedUrl,
            stream_url: null,
            message: `Extraction error: ${error.message}. Using fallback.`
        });
    }
});

export default app;