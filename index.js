import express from 'express';
import cors from 'cors';

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
        // استخدام بروفايدر فك تشفير سريع ومباشر وخفيف جداً
        const resUrl = `https://api.vidsrc.cc/v1/embed/movie/${tmdbId}`;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000); // 4 ثواني بالظبط عشان نلحق الـ Vercel limit

        const response = await fetch(resUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            // لو رجع رابط البث المباشر بنجاح
            if (data && data.stream_url) {
                return res.json({
                    success: true,
                    provider: "vidsrc_cc_native",
                    embed_url: embedUrl,
                    stream_url: data.stream_url,
                    subtitles: data.subtitles || [],
                    message: "Native stream loaded successfully"
                });
            }
        }

        // الـ Fallback السريع لو السيرفر اتأخر أو رجع داتا مش كاملة
        return res.json({
            success: true,
            provider: "fallback_embed",
            embed_url: embedUrl,
            stream_url: null,
            message: "Direct stream link skipped, using fallback embed URL safely"
        });

    } catch (error) {
        // حماية تامة ضد الـ Function Invocation Failed
        return res.json({
            success: true,
            provider: "fallback_embed",
            embed_url: embedUrl,
            stream_url: null,
            message: "Using fallback embed URL due to execution timeout"
        });
    }
});

export default app;