# weeme.ai - AI-Powered SEO Automation Platform

Modern, kapsamlı SEO analizi ve AI destekli içerik üretimi platformu.

## 🚀 Özellikler

- **Otomatik SEO Analizi**: Kapsamlı website taraması ve skorlama
- **AI SEO Önerileri**: Yapay zeka destekli detaylı öneriler (Pro/Advanced)
- **AI İçerik Üretimi**: Sosyal medya içerik üretimi (Advanced)
- **Çoklu Üyelik Sistemi**: Free/Pro/Advanced planları
- **Responsive Tasarım**: Tüm cihazlarda mükemmel deneyim
- **Güvenli API**: Rate limiting ve güvenlik önlemleri

## 📋 Gereksinimler

### Development
- Node.js 18+
- npm veya yarn
- OpenAI API Key (AI özellikler için)

### Production
- SSL sertifikası
- Domain name
- Environment variables
- Database (önerilir)

## 🛠️ Kurulum

1. **Repository'yi klonlayın**
```bash
git clone <repo-url>
cd weemeai
```

2. **Dependencies yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp .env.example .env.local
# .env.local dosyasını düzenleyin
```

4. **Development server başlatın**
```bash
npm run dev
```

## 🔧 Environment Variables

### Zorunlu
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### Opsiyonel
```env
VITE_API_BASE=http://localhost:8787
API_PORT=8787
NODE_ENV=development
```

## 🚀 Production Deployment

### 1. Environment Hazırlığı
```env
NODE_ENV=production
OPENAI_API_KEY=sk-prod-key-here
VITE_API_BASE=https://yourdomain.com
```

### 2. Build
```bash
npm run build
```

### 3. Server Start
```bash
npm run dev:server
```

## 📊 API Endpoints

### SEO Scan
```
POST /api/seo-scan
Body: { url: "https://example.com" }
```

### AI Suggestions (Pro/Advanced)
```
POST /api/seo-suggestions
Body: { membershipType, prompt, useReportBase }
```

### AI Content (Advanced)
```
POST /api/ai-content
Body: { membershipType, platform, prompt, ... }
```

## 🔒 Güvenlik

- Helmet.js güvenlik başlıkları
- Rate limiting (15 dakikada 100 istek)
- CORS koruması
- Input validation
- API key validation

## 📈 Performans

- Fallback sistemleri
- Error handling
- Request timeout'ları
- Efficient caching

## 🐛 Troubleshooting

### OpenAI API Hatası
- API key'in doğru olduğundan emin olun
- Fallback mode otomatik devreye girer

### Server Başlatma Sorunu
```bash
# Port kontrolü
lsof -i :8787

# Dependencies yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

## 📝 Changelog

### v1.0.0
- İlk release
- Temel SEO analizi
- AI entegrasyonu
- Üyelik sistemi

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - detaylar için LICENSE dosyasına bakın.

### OpenAI
- **Development**: `.env.local` dosyasına `OPENAI_API_KEY=sk-...` ekleyin
- **Production**: Backend proxy üzerinden güvenli çağrı
- **Fallback**: API key yoksa otomatik fallback mode

### Güvenlik
- API key asla client'a expose edilmez
- Rate limiting aktif
- Input validation mevcut
- HTTPS zorunlu (production)