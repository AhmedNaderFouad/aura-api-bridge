import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: "Aura Stable Bridge is Online" });
});

app.get('/watch/:id', async (req, res) => {
    const tmdbId = req.params.id;
    const embedUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;

    try {
        const resolverUrl = `https://vidsrc-api-eta.vercel.app/api/source/${tmdbId}`; 
        
        // حطينا وقت أقصى للاستجابة (Timeout) عشان السيرفر ميتعلقش لو الموقع التاني مهنج
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 ثواني

        const response = await fetch(resolverUrl, { signal: controller.signal });
        clearTimeout(timeout);

        // التأكد إن الرد سليم وجاي بصيغة JSON فعلياً مش كتابة أو صفحة إيرور
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (data && data.stream_url) {
                return res.json({
                    success: true,
                    provider: "vidsrc_native",
                    embed_url: embedUrl,
                    stream_url: data.stream_url,
                    subtitles: data.subtitles || [],
                    message: "Native stream loaded successfully"
                });
            }
        }

        // لو السيرفر التاني رجع إيرور أو مش JSON، بندخل هنا فوراً بدون ما السيرفر ينهار
        return res.json({
            success: true,
            provider: "fallback_embed",
            embed_url: embedUrl,
            stream_url: null,
            message: "Direct stream currently unavailable, falling back to embed URL"
        });

    } catch (error) {
        // حماية قصوى: لو حصل أي إيرور مفاجئ في الـ Fetch، ارجع للرابط الاحتياطي برضه
        return res.json({
            success: true,
            provider: "fallback_embed",
            embed_url: embedUrl,
            stream_url: null,
            message: `Scraper error: ${error.message}. Using fallback embed URL.`
        });
    }
});

export default app;