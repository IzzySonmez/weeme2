weemeai

### OpenAI
- Geliştirme: `.env.local` dosyanıza `VITE_OPENAI_API_KEY=...` ekleyin.
- Alternatif: Uygulama içinde "Anahtar Ekle" butonu ile geçici anahtarı tarayıcıya kaydedebilirsiniz.
- Üretim: Anahtarı doğrudan istemciye vermek güvenli değildir. Bir backend/edge proxy üzerinden çağrı yapın.

### OpenAI via Secure Proxy
- Backend proxy: `server/index.js` exposes POST /api/seo-suggestions
- Set `OPENAI_API_KEY` on the server (.env) and never expose it to the client
- Frontend uses `VITE_API_BASE` (e.g., http://localhost:8787) in dev
- Plans: endpoint rejects non-Pro/Advanced