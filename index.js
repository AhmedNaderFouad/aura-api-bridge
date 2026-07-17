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
    try {
        const tmdbId = req.params.id;

        // 1. الرابط الأساسي لـ VidSrc
        const embedUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;

        // 2. جلب صفحة الـ Embed وتحليلها لاستخراج الـ Media Sources
        // ملحوظة: VidSrc بتعتمد على طلبات داخلية لجلب السيرفرات (مثل vidsrc.stream أو pro)
        // بنعمل طلب للـ API الوسيط المفتوح المصدر المخصص لفك تشفير حماية vidsrc المباشرة
        const resolverUrl = `https://vidsrc-api-eta.vercel.app/api/source/${tmdbId}`; 
        
        const response = await fetch(resolverUrl);
        const data = await response.json();

        // لو نجح الـ Scraping وفك التشفير وجاب روابط البث المباشرة (HLS)
        if (data && data.stream_url) {
            return res.json({
                success: true,
                provider: "vidsrc_native",
                embed_url: embedUrl,
                stream_url: data.stream_url, // الرابط الخام اللي أوله https وآخره .m3u8
                subtitles: data.subtitles || [], // الترجمات لو متوفرة
                message: "Native stream loaded successfully"
            });
        }

        // حل احتياطي (Fallback): لو الـ Scraper معرفش يفك التشفير لأي سبب، هيرجع الـ embed_url القديم
        res.json({
            success: true,
            provider: "fallback_embed",
            embed_url: embedUrl,
            stream_url: null,
            message: "Direct stream failed, falling back to embed URL"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default app;