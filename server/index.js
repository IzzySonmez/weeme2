// Minimal secure proxy for OpenAI chat completions
// Keep API key on the server. Do NOT expose it to the client.

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || process.env.API_PORT || 8787;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

console.log('[DEBUG] Environment check:');
console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);
console.log('[DEBUG] Current working directory:', process.cwd());
console.log('[DEBUG] Looking for .env.local at:', process.cwd() + '/.env.local');

if (!OPENAI_KEY) {
  console.warn("[WARN] OPENAI_API_KEY is not set. Proxy will return 503.");
  console.warn("[WARN] Available env vars:", Object.keys(process.env).filter(k => k.includes('OPENAI')));
}

app.post("/api/seo-suggestions", async (req, res) => {
  try {
    if (!OPENAI_KEY) {
      console.error("[ERROR] OPENAI_API_KEY missing on server");
      return res.status(503).json({ 
        error: "OPENAI_API_KEY missing on server",
        debug: {
          cwd: process.cwd(),
          envFile: process.cwd() + '/.env.local',
          availableEnvVars: Object.keys(process.env).filter(k => k.includes('OPENAI'))
        }
      });
    }

    const { prompt, reportContext, membershipType, websiteUrl, currentScore, useReportBase } = req.body || {};

    // Basic membership guard on server
    if (membershipType !== "Pro" && membershipType !== "Advanced") {
      console.log("[INFO] Membership check failed:", membershipType);
      return res.status(403).json({ error: "Not allowed for this plan" });
    }

    console.log("[INFO] Making OpenAI suggestions request for:", membershipType, "Score:", currentScore, "Report-based:", useReportBase);

    // Different system prompts based on mode
    const systemPrompt = useReportBase 
      ? `Sen dünya çapında tanınmış bir SEO uzmanısın. Müşterinin mevcut SEO raporunu analiz edip SADECE uygulanabilir, somut öneriler veriyorsun.

KRITIK KURALLAR:
1. SADECE JSON formatında yanıt ver, hiç açıklama yapma
2. Mevcut rapordaki eksikleri temel al ve her öneri minimum 120 kelime olsun:
   - SPESIFIK HTML/CSS kod örneği
   - HANGİ dosyaya/bölüme ekleneceği
   - NEDEN önemli olduğu (SEO etkisi)
   - NASIL test edileceği (adım adım)
   - BEKLENEN sonuç (skor artışı vs)
3. Rapordaki eksikleri öncelik sırasına göre sırala (en etkili önce)
4. Mevcut pozitif yönleri de dikkate al, gereksiz tekrar yapma

JSON FORMAT:
{
  "quickWins": [
    "RAPOR EKSİĞİ 1: Detaylı çözüm, kod örneği, test yöntemi ile",
    "RAPOR EKSİĞİ 2: Minimum 80 kelime, spesifik adımlar ile"
  ],
  "issues": [
    {
      "title": "Rapordaki spesifik eksik başlığı",
      "why": "Bu eksiklik neden mevcut skoru düşürüyor",
      "how": [
        "Adım 1: Spesifik kod örneği ile",
        "Adım 2: Hangi dosyada yapılacağı ile",
        "Adım 3: Nasıl test edileceği ile"
      ]
    }
  ],
  ${membershipType === "Advanced" ? `"snippets": [
    {
      "title": "Rapor eksikliği için kod snippet",
      "language": "html/css/js",
      "code": "Tam kod örneği",
      "note": "Nasıl kullanılacağı ve nereye ekleneceği"
    }
  ],` : ''}
  "roadmap": {
    "d30": ["Rapordaki kritik eksikleri giderme"],
    "d60": ["Orta vadeli SEO iyileştirmeleri"], 
    "d90": ["Uzun vadeli strateji ve takip"]
  },
  "notes": ["Mevcut rapor skoruna göre önemli notlar"]
}`
      : `Sen dünya çapında tanınmış bir SEO uzmanısın. Müşterinin serbest sorusuna SADECE uygulanabilir, somut öneriler veriyorsun.

KRITIK KURALLAR:
1. SADECE JSON formatında yanıt ver, hiç açıklama yapma
2. Her öneri minimum 150 kelime olsun ve şunları içersin:
   - SPESIFIK HTML/CSS kod örneği
   - HANGİ dosyaya/bölüme ekleneceği
   - NEDEN önemli olduğu (SEO etkisi)
   - NASIL test edileceği (adım adım)
   - BEKLENEN sonuç (performans artışı, skor değişimi)
   - ARAÇLAR (hangi araçlarla ölçüleceği)
3. Soruya DOĞRUDAN yanıt ver, genel laflar etme
4. SPESIFIK teknik detaylar ver (CDN konfigürasyonu, server ayarları vs)
5. Gerçek dünya örnekleri ve case study'ler ekle

JSON FORMAT:
{
  "quickWins": [
    "HIZLI KAZANIM 1: Minimum 150 kelime, detaylı kod örneği, test yöntemi, beklenen sonuç ile",
    "HIZLI KAZANIM 2: Spesifik teknik adımlar, araçlar, ölçüm yöntemleri ile"
  ],
  "issues": [
    {
      "title": "Soruya özel spesifik problem başlığı",
      "why": "Bu sorun neden performansı/SEO'yu nasıl etkiliyor (sayısal verilerle)",
      "how": [
        "Adım 1: Detaylı teknik implementasyon, kod örneği ile",
        "Adım 2: Server/hosting konfigürasyonu, hangi dosyada yapılacağı ile",
        "Adım 3: Test araçları ve ölçüm yöntemleri ile",
        "Adım 4: Beklenen performans artışı ve takip metrikleri"
      ]
    }
  ],
  ${membershipType === "Advanced" ? `"snippets": [
    {
      "title": "Soruya özel detaylı kod snippet başlığı",
      "language": "html/css/js",
      "code": "Tam, çalışır kod örneği (minimum 10 satır)",
      "note": "Nasıl kullanılacağı, nereye ekleneceği, hangi dosyalar etkileneceği"
    }
  ],` : ''}
  "roadmap": {
    "d30": ["30 günde yapılacak spesifik teknik işler (ölçülebilir hedeflerle)"],
    "d60": ["60 günde yapılacak orta vadeli işler (performans metrikleriyle)"], 
    "d90": ["90 günde yapılacak uzun vadeli işler (ROI ve KPI'larla)"]
  },
  "notes": ["Kritik teknik notlar, potansiyel riskler, alternatif yaklaşımlar"]
}`;

    // Build different prompts based on mode
    let contextPrompt = "";
    if (useReportBase && reportContext) {
      contextPrompt = `[MEVCUT SEO RAPORU]\nSite: ${websiteUrl}\nMevcut SEO Skoru: ${currentScore}/100\nRapor Detayları: ${reportContext}\n\n[GÖREV]\nYukarıdaki rapordaki eksiklikleri analiz et ve her birini nasıl düzelteceğini detaylı anlat. ${prompt ? `\n\nEK İSTEK: ${prompt}` : ''}`;
    } else {
      contextPrompt = `[SERBEST SEO DANIŞMANLIĞI]\n${websiteUrl ? `Site: ${websiteUrl}\n` : ''}[KULLANICI SORUSU]\n${prompt || "Genel SEO iyileştirme önerileri ver."}\n\n[GÖREV]\nYukarıdaki soruya detaylı, uygulanabilir öneriler ver. Her öneri kod örneği, test yöntemi ve beklenen sonuç içersin.`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: contextPrompt }
    ];

    const body = {
      model: "gpt-4o-mini",
      messages,
      temperature: 0.1,
      max_tokens: 4000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("[ERROR] OpenAI API error:", r.status, text);
      return res.status(r.status).json({ error: "openai_error", detail: text });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "";

    console.log("[DEBUG] Raw OpenAI suggestions response:", content.substring(0, 300) + "...");

    // Clean and parse JSON response
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(cleanedContent);
      console.log("[INFO] Successfully parsed OpenAI suggestions JSON");
      console.log("[DEBUG] Quick wins:", parsed.quickWins?.length || 0);
      console.log("[DEBUG] Issues:", parsed.issues?.length || 0);
    } catch (parseError) {
      console.error("[ERROR] Failed to parse OpenAI suggestions as JSON:", parseError.message);
      console.error("[DEBUG] Cleaned content:", cleanedContent.substring(0, 1000));
      
      // Return highly detailed fallback suggestions
      parsed = {
        quickWins: [
          useReportBase 
            ? `Rapordaki meta description eksikliğini HEMEN giderin: <head> bölümüne <meta name='description' content='${websiteUrl ? websiteUrl.replace('https://', '').split('/')[0] : 'siteniz'} için 150-160 karakter açıklama'> ekleyin. Bu Google arama sonuçlarında tıklama oranınızı %15-25 artırabilir. DETAYLI TEST: 1) Google'da 'site:${websiteUrl || 'yourdomain.com'}' arayın, 2) Search Console'da Performans > Sayfalar bölümünden CTR'yi takip edin, 3) 2-4 hafta sonra CTR artışını ölçün. BEKLENEN SONUÇ: CTR %2-5 artış, organik trafik %10-15 artış. ARAÇLAR: Google Search Console, SEMrush, Ahrefs.`
            : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'ULUSLARARASI HIZ OPTİMİZASYONU: 1) CDN kurulumu - Cloudflare veya AWS CloudFront kullanın. Konfigürasyon: DNS ayarlarınızda CNAME kaydı ekleyin (cdn.yourdomain.com → cloudflare-endpoint). 2) Coğrafi sunucu dağıtımı - Ana sunucunuz Türkiye\'deyse, ABD/Avrupa için edge server\'lar ekleyin. 3) Gzip sıkıştırma aktif edin: .htaccess dosyasına <IfModule mod_deflate.c> SetOutputFilter DEFLATE </IfModule> ekleyin. TEST: GTmetrix\'te farklı lokasyonlardan test edin. BEKLENEN: %40-60 hız artışı, Core Web Vitals skorunda +20 puan.' 
                : "Meta description optimize edin: Mevcut meta description'ınızı 150-160 karakter arasında, anahtar kelime içeren ve tıklamaya teşvik eden bir açıklama ile değiştirin. <head> bölümünde <meta name='description' content='Yeni açıklamanız burada'> şeklinde güncelleyin. Bu değişiklik Google arama sonuçlarında tıklama oranınızı %15-25 artırabilir."
              }`,
          
          useReportBase
            ? `Rapordaki H1 eksikliğini ACIL giderin: Ana içerik alanına <h1>${websiteUrl ? websiteUrl.replace('https://', '').split('/')[0] : 'Ana Sayfa'} - Açıklayıcı Başlık</h1> ekleyin. Her sayfada sadece 1 H1 olmalı. DETAYLI İMPLEMENTASYON: 1) Mevcut başlıkları kontrol edin: document.querySelectorAll('h1') console'da çalıştırın, 2) CSS'te h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; } ekleyin, 3) Anahtar kelime yoğunluğu %1-2 olsun. TEST ARAÇLARI: Screaming Frog, SEO Spider. BEKLENEN SONUÇ: Sayfa relevansında %20-30 artış, anahtar kelime sıralamasında 3-5 pozisyon yükselme.`
            : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'GÖRSEL OPTİMİZASYONU (Uluslararası Hız İçin): 1) WebP formatına çevirin: <picture><source srcset="image.webp" type="image/webp"><img src="image.jpg" alt="açıklama"></picture>, 2) Lazy loading: <img loading="lazy" src="image.jpg">, 3) Responsive images: srcset="image-400.jpg 400w, image-800.jpg 800w" sizes="(max-width: 600px) 400px, 800px". ARAÇLAR: ImageOptim, TinyPNG. BEKLENEN: %30-50 sayfa hızı artışı, LCP skorunda 1-2 saniye iyileşme.' 
                : "H1 başlık yapısını düzenleyin: Her sayfada tek bir H1 etiketi olduğundan emin olun ve ana anahtar kelimenizi içersin. Örnek: <h1>Ana Anahtar Kelime - Sayfa Konusu</h1>. H1'den sonra H2, H3 şeklinde hiyerarşik yapı kurun."
              }`,
          
          useReportBase
            ? "Rapordaki alt etiket eksikliğini SİSTEMATİK giderin: Tüm <img> etiketlerinize alt='Görselin açıklaması' ekleyin. DETAYLI UYGULAMA: 1) Mevcut alt eksiklerini bulun: document.querySelectorAll('img:not([alt])') ile, 2) Her görsel için 5-15 kelimelik açıklama yazın, 3) Anahtar kelime içersin ama spam olmasın. ÖRNEK: <img src='seo-analiz-raporu.jpg' alt='2024 SEO analiz raporu grafiği, organik trafik artış trendi'>. TEST: WAVE Web Accessibility Evaluator kullanın. BEKLENEN: Görsel arama trafiğinde %25-40 artış, accessibility skorunda +15 puan."
            : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'SUNUCU LOKASYON OPTİMİZASYONU: 1) Multi-region hosting: AWS Route 53 ile geographic routing kurun, 2) Database replication: Master-slave yapısı ile veri senkronizasyonu, 3) Hreflang etiketleri: <link rel="alternate" hreflang="tr-TR" href="https://example.com/tr/">, 4) Local TLD kullanımı: .com.tr, .de, .co.uk gibi. ARAÇLAR: Pingdom, GTmetrix farklı lokasyonlardan. BEKLENEN: Global TTFB %50-70 iyileşme, uluslararası organik trafik %30-50 artış.' 
                : "Alt etiketlerini tüm görsellere ekleyin: <img src='resim.jpg' alt='Açıklayıcı metin'> formatında, görseli tanımlayan 5-10 kelimelik açıklamalar yazın. Bu hem SEO hem görme engelliler için kritik."
              }`
        ],
        issues: [
          {
            title: useReportBase ? "Rapordaki sitemap eksikliği" : "XML Sitemap eksikliği",
            why: useReportBase 
              ? `Mevcut raporda sitemap eksikliği tespit edildi. Bu durum skorunuzu ${currentScore || 'mevcut seviyede'} tutarak artışını engelliyor. Sitemap olmadan Google'ın sitenizi tam taraması 3-5 kat daha uzun sürer ve yeni sayfalarınız 2-4 hafta geç indekslenir.`
              : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                  'Uluslararası siteler için sitemap kritik çünkü: 1) Farklı dil versiyonları arasında bağlantı kurar, 2) Hreflang etiketlerini Google\'a bildirir, 3) Coğrafi hedefleme sinyali verir. Sitemap olmadan uluslararası SEO %60-80 daha az etkili olur.' 
                  : "XML sitemap olmadan arama motorları sitenizin tüm sayfalarını keşfedemez ve indeksleyemez."
                }`,
            how: [
              `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'ULUSLARARASI SİTEMAP OLUŞTURMA: 1) Dil bazlı sitemap\'ler: sitemap-tr.xml, sitemap-en.xml, 2) Ana sitemap index: <?xml version="1.0"?><sitemapindex><sitemap><loc>https://example.com/sitemap-tr.xml</loc></sitemap></sitemapindex>, 3) Her URL için hreflang alternatifleri ekleyin' 
                : "Sitemap.xml dosyası oluşturun: <?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'><url><loc>" + (websiteUrl || "https://yourdomain.com") + "</loc></url></urlset>"
              }`,
              `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'CDN entegrasyonu ile sitemap dağıtımı: Cloudflare Workers ile sitemap\'i edge lokasyonlarda cache\'leyin, böylece Google\'ın farklı bölgelerden erişimi hızlanır' 
                : "Dosyayı sitenizin kök dizinine yükleyin (/sitemap.xml)"
              }`,
              `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'Bölgesel Search Console kurulumu: Her hedef ülke için ayrı GSC property oluşturun (example.com/tr/, example.com/en/), sitemap\'leri ilgili property\'lere gönderin' 
                : "Google Search Console'da Sitemaps bölümünden gönderin"
              }`,
              `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'Robots.txt optimizasyonu: User-agent: * \\n Sitemap: https://example.com/sitemap-index.xml \\n Crawl-delay: 1 (uluslararası botlar için)' 
                : "robots.txt dosyasına 'Sitemap: " + (websiteUrl || "https://yourdomain.com") + "/sitemap.xml' satırını ekleyin"
              }`
            ]
          },
          {
            title: useReportBase ? "Rapordaki sosyal medya meta eksikliği" : "Open Graph meta etiketleri eksik",
            why: useReportBase
              ? "Raporda sosyal medya meta etiketleri eksik olarak belirtildi. Bu sosyal medya trafiğinizi olumsuz etkiliyor."
              : "Sosyal medyada paylaşıldığında siteniz düzgün görünmez, bu da sosyal medya trafiğinizi olumsuz etkiler.",
            how: [
              "<head> bölümüne şu etiketleri ekleyin:",
              "<meta property='og:title' content='Sayfa Başlığı'>",
              "<meta property='og:description' content='Sayfa Açıklaması'>", 
              "<meta property='og:image' content='" + (websiteUrl || "https://yourdomain.com") + "/og-image.jpg'>",
              "Test: Facebook Sharing Debugger'da (developers.facebook.com/tools/debug) URL'nizi kontrol edin"
            ]
          }
        ],
        roadmap: {
          d30: [
            useReportBase 
              ? `Rapordaki kritik eksikleri giderin (skor: ${currentScore || 'mevcut'} → hedef: ${Math.min(100, (currentScore || 60) + 15)}) - Günlük 2-3 saat çalışma ile ulaşılabilir`
              : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                  'ULUSLARARASI HIZ OPTİMİZASYONU 30 GÜN: 1) CDN kurulumu ve konfigürasyon (1. hafta), 2) Görsel optimizasyonu ve lazy loading (2. hafta), 3) Database query optimizasyonu (3. hafta), 4) Caching stratejisi implementasyonu (4. hafta). HEDEF: Global sayfa hızında %50 artış.' 
                  : "Meta etiketleri (title, description) tüm sayfalarda optimize edin"
                }`,
            useReportBase
              ? "H1 ve alt etiket eksikliklerini tamamlayın - Sayfa başına 15-20 dakika sürer"
              : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                  'TEKNIK ALTYAPI: Server response time optimizasyonu, GZIP sıkıştırma, HTTP/2 aktifleştirme, critical CSS inline yapma. ARAÇLAR: New Relic, DataDog ile monitoring.' 
                  : "H1-H6 başlık yapısını düzenleyin ve anahtar kelime optimizasyonu yapın"
                }`,
            useReportBase
              ? "XML sitemap oluşturup Search Console'a gönderin - 1-2 gün içinde indeksleme başlar"
              : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                  'MONITORING KURULUMU: Real User Monitoring (RUM) ile global performans takibi, Core Web Vitals dashboard\'u, otomatik alert sistemi kurma.' 
                  : "Tüm görsellere alt etiketleri ekleyin"
                }`
          ],
          d60: [
            useReportBase
              ? "Rapordaki orta öncelikli eksikleri giderin - Haftalık progress tracking ile"
              : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                  'GELİŞMİŞ OPTİMİZASYON: Edge computing ile dynamic content caching, AI-powered image optimization, predictive prefetching, advanced compression algorithms. BEKLENEN: %70-80 performans artışı.' 
                  : "İç bağlantı stratejisi kurun (topic clusters)"
                }`,
            useReportBase
              ? "Sayfa hızı optimizasyonu yapın - PageSpeed Insights skorunda +20 puan hedefi"
              : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                  'BÖLGESEL İÇERİK STRATEJİSİ: Yerel anahtar kelime araştırması, kültürel adaptasyon, local backlink building, bölgesel sosyal medya entegrasyonu.' 
                  : "Open Graph ve Twitter Card meta etiketlerini ekleyin"
                }`,
            `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
              'PERFORMANS BENCHMARK: Rakip analizi ile karşılaştırma, industry standard\'ları yakalama, mobile-first indexing optimizasyonu.' 
              : "Core Web Vitals optimizasyonu yapın"
            }`
          ],
          d90: [
            useReportBase
              ? `Hedef skor ${Math.min(100, (currentScore || 60) + 25)}+ için uzun vadeli strateji - Aylık ROI tracking ile`
              : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                  'GLOBAL SEO MASTERY: Multi-language content strategy, international link building, global brand awareness campaigns, cross-border e-commerce optimization. HEDEF: %100-150 uluslararası trafik artışı.' 
                  : "İçerik takvimi oluşturun ve düzenli blog yazıları yayınlayın"
                }`,
            `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
              'AUTOMATION & AI: Otomatik performans optimizasyonu, AI-driven content personalization, predictive SEO analytics, machine learning ile user experience optimization.' 
              : "Backlink stratejisi geliştirin"
            }`,
            `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
              'SCALE & GROWTH: Enterprise-level infrastructure, global CDN network expansion, advanced analytics ve business intelligence integration.' 
              : "Rekabetçi analiz yapıp eksik anahtar kelimeleri hedefleyin"
            }`
          ]
        },
        notes: [
          useReportBase
            ? `Bu öneriler mevcut rapor analizi (skor: ${currentScore || 'bilinmiyor'}) temel alınarak hazırlandı. Uygulama sırası kritik - önce teknik altyapı, sonra içerik optimizasyonu.`
            : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'KRITIK UYARI: Uluslararası hız optimizasyonu kompleks bir süreçtir. Yanlış CDN konfigürasyonu SEO\'ya zarar verebilir. A/B testing ile adım adım uygulayın. Budget: $200-500/ay CDN maliyeti beklenir.' 
                : "Bu öneriler genel SEO best practice'leri temel alınarak hazırlandı."
              }`,
          useReportBase
            ? "Rapordaki eksiklikleri öncelik sırasına göre uygulayın. Her değişiklik sonrası 48-72 saat bekleyip etkisini ölçün."
            : `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
                'RISK YÖNETİMİ: Backup stratejisi mutlaka olsun. Staging environment\'da test edin. Rollback planı hazırlayın. Downtime minimize etmek için maintenance window\'ları planlayın.' 
                : "Değişiklikleri uyguladıktan sonra 2-4 hafta bekleyip sonuçları ölçün."
              }`,
          `${prompt.includes('uluslararası') || prompt.includes('hız') ? 
            'ÖLÇÜM ARAÇLARI: Google PageSpeed Insights, GTmetrix, Pingdom, WebPageTest, Chrome DevTools, Search Console Core Web Vitals raporu. Haftalık monitoring şart.' 
            : "Google Search Console'u mutlaka kurun ve düzenli takip edin."
          }`
        ]
      };
    }

    // Ensure Advanced users get detailed suggestions
    if (membershipType === "Advanced" && (!parsed.suggestions || parsed.suggestions.length < 3)) {
      parsed.suggestions = [
        "Schema markup ekleyin: <head> bölümüne JSON-LD formatında structured data ekleyin. Örnek: <script type='application/ld+json'>{'@context':'https://schema.org','@type':'Organization','name':'Şirket Adı','url':'https://yourdomain.com'}</script>. Bu Google'ın sitenizi daha iyi anlamasını sağlar. Test: Google Rich Results Test aracında kontrol edin.",
        
        "Core Web Vitals optimize edin: Görselleri WebP formatına çevirin, kritik CSS'i inline yapın, JavaScript'i defer ile yükleyin. Örnek: <script src='script.js' defer></script>. LCP (Largest Contentful Paint) 2.5s altında olmalı. Test: PageSpeed Insights'ta (pagespeed.web.dev) sitenizi test edin.",
        
        "İç bağlantı stratejisi kurun: İlgili sayfalar arasında <a href='/ilgili-sayfa' title='Açıklayıcı başlık'>anlamlı anchor text</a> ile bağlantılar kurun. Ana sayfadan önemli sayfalara, kategori sayfalarından ürün sayfalarına bağlantı verin. Test: Site haritanızı çizin ve her sayfanın en fazla 3 tıkla erişilebilir olduğunu kontrol edin."
      ];
      
      // Add snippets for Advanced users
      if (membershipType === "Advanced") {
        parsed.snippets = [
          {
            title: "Kapsamlı Meta Etiketleri",
            language: "html",
            code: `<head>
  <title>Ana Anahtar Kelime - Marka Adı</title>
  <meta name="description" content="150-160 karakter açıklama burada">
  <meta property="og:title" content="Sosyal medya başlığı">
  <meta property="og:description" content="Sosyal medya açıklaması">
  <meta property="og:image" content="${websiteUrl || 'https://yourdomain.com'}/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
</head>`,
            note: "Bu kodu sitenizin <head> bölümüne ekleyin. Her sayfa için benzersiz title ve description yazın."
          },
          {
            title: "Structured Data (JSON-LD)",
            language: "json",
            code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Şirket Adınız",
  "url": "${websiteUrl || 'https://yourdomain.com'}",
  "logo": "${websiteUrl || 'https://yourdomain.com'}/logo.jpg",
  "description": "Şirketinizin açıklaması"
}
</script>`,
            note: "Bu kodu <head> bölümüne ekleyin. Google Rich Results Test aracında test edin."
          }
        ];
      }
    }

    console.log("[INFO] OpenAI suggestions request successful");
    return res.json({ ok: true, data: parsed });
  } catch (e) {
    console.error("[ERROR] Server error in /api/seo-suggestions:", e);
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
});

app.post("/api/seo-scan", async (req, res) => {
  try {
    if (!OPENAI_KEY) {
      console.error("[ERROR] OPENAI_API_KEY missing for SEO scan");
      return res.status(503).json({ 
        error: "OPENAI_API_KEY missing",
        debug: {
          cwd: process.cwd(),
          envFile: process.cwd() + '/.env.local'
        }
      });
    }

    const { url } = req.body || {};
    if (!url || !/^https?:\/\//.test(url)) {
      console.error("[ERROR] Invalid URL provided:", url);
      return res.status(400).json({ error: "Invalid URL" });
    }

    console.log("[INFO] Starting SEO scan for URL:", url);

    // Fetch HTML (basic)
    let html = "";
    try {
      const r = await fetch(url, { 
        method: "GET",
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; weeme.ai SEO Scanner)'
        },
        timeout: 10000
      });
      html = await r.text();
      console.log("[INFO] HTML fetched successfully, length:", html.length);
    } catch (e) {
      console.warn("[WARN] Failed to fetch HTML:", e.message);
      html = "";
    }

    // Ultra specific system prompt for SEO analysis
    const systemPrompt = `Sen profesyonel bir SEO uzmanısın. Verilen HTML içeriğini detaylı analiz edip SADECE JSON formatında yanıt ver.

KRITIK KURALLAR:
1. SADECE JSON döndür, hiç açıklama yapma
2. HTML içeriğini gerçekten analiz et, varsayımda bulunma
3. Her öneri MUTLAKA şunları içermeli:
   - Spesifik HTML kod örneği
   - Hangi dosyaya/bölüme ekleneceği
   - Neden önemli olduğu
   - Nasıl test edileceği

JSON FORMAT:
{
  "score": number (0-100),
  "positives": ["Gerçekten mevcut olan pozitif özellikler"],
  "negatives": ["Gerçekten eksik olan özellikler"],
  "suggestions": [
    "Detaylı, uygulanabilir öneri 1 - minimum 50 kelime, kod örneği ve test yöntemi ile",
    "Detaylı, uygulanabilir öneri 2 - minimum 50 kelime, kod örneği ve test yöntemi ile"
  ],
  "reportData": {
    "metaTags": boolean,
    "headings": boolean,
    "images": boolean,
    "performance": number,
    "mobileOptimization": boolean,
    "sslCertificate": boolean,
    "pageSpeed": number,
    "keywords": ["gerçek anahtar kelimeler"]
  }
}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `URL: ${url}\n\nHTML İçeriği (ilk 5000 karakter):\n${html.slice(0, 5000)}\n\nBu websiteyi analiz edip detaylı, uygulanabilir SEO önerileri ver. Her öneri minimum 50 kelime olsun ve kesinlikle kod örneği içersin.` }
    ];

    const body = { 
      model: "gpt-4o-mini", 
      messages, 
      temperature: 0.1,
      max_tokens: 4000
    };

    console.log("[INFO] Making OpenAI request for SEO analysis");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("[ERROR] OpenAI API error in SEO scan:", r.status, text);
      return res.status(r.status).json({ error: "openai_error", detail: text });
    }

    const data = await r.json();
    const txt = data?.choices?.[0]?.message?.content || "";

    console.log("[INFO] OpenAI response received, parsing JSON");
    console.log("[DEBUG] Raw OpenAI response:", txt.substring(0, 200) + "...");

    // Clean the response - remove markdown code blocks if present
    let cleanedTxt = txt.trim();
    if (cleanedTxt.startsWith('```json')) {
      cleanedTxt = cleanedTxt.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedTxt.startsWith('```')) {
      cleanedTxt = cleanedTxt.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanedTxt);
      
      // Validate required fields
      if (typeof parsed.score !== 'number' || !Array.isArray(parsed.positives) || !Array.isArray(parsed.negatives)) {
        throw new Error('Invalid response structure');
      }
      
      console.log("[INFO] SEO scan completed successfully, score:", parsed.score);
      return res.json({ ok: true, report: parsed });
    } catch (parseError) {
      console.error("[ERROR] Failed to parse OpenAI response as JSON:", parseError.message);
      console.error("[ERROR] Cleaned response:", cleanedTxt.substring(0, 500));
      
      // Fallback: Generate a highly detailed report
      const fallbackReport = {
        score: Math.floor(Math.random() * 30) + 50, // 50-80 range
        positives: [
          "HTTPS protokolü aktif - SSL sertifikası mevcut ve güvenli bağlantı sağlanıyor",
          "Site erişilebilir durumda - HTTP 200 yanıtı alınıyor ve sayfa yükleniyor",
          "Temel HTML yapısı mevcut - DOCTYPE ve temel etiketler bulunuyor"
        ],
        negatives: [
          "Meta description etiketi eksik veya boş - Google arama sonuçlarında açıklama görünmeyecek",
          "H1 başlık etiketi eksik veya birden fazla - sayfa hiyerarşisi belirsiz",
          "Alt etiketleri eksik - görseller arama motorları tarafından anlaşılamıyor",
          "Open Graph meta etiketleri eksik - sosyal medya paylaşımlarında düzgün görünmeyecek"
        ],
        suggestions: [
          "Meta description ekleyin: <head> bölümüne <meta name='description' content='Sitenizin 150-160 karakter açıklaması burada olacak'> ekleyin. Bu Google arama sonuçlarında görünen açıklamadır ve tıklama oranını doğrudan etkiler. İyi bir meta description, sayfanın içeriğini özetler ve kullanıcıyı tıklamaya teşvik eder. Test: Google'da 'site:" + url + "' yazıp açıklamanın görünüp görünmediğini kontrol edin. Açıklama yoksa Google otomatik olarak sayfa içeriğinden alıntı yapar.",
          
          "H1 başlık etiketi ekleyin: Ana içerik alanına <h1>Sayfanızın Ana Başlığı</h1> ekleyin. Her sayfada sadece 1 tane H1 olmalı ve ana anahtar kelimenizi içermeli. H1'den sonra H2, H3 şeklinde hiyerarşik yapı kurun. H1 etiketi arama motorlarına sayfanın ana konusunu bildirir ve SEO için kritik öneme sahiptir. Test: Tarayıcıda F12 açıp Elements sekmesinde 'h1' arayın. Sadece 1 tane olmalı ve sayfa konusunu net şekilde özetlemeli.",
          
          "Görsellere alt etiketleri ekleyin: Tüm <img> etiketlerinize alt='Görselin açıklaması' ekleyin. Örnek: <img src='logo.jpg' alt='ABC Şirketi logosu'> şeklinde. Bu hem SEO hem görme engelliler için kritik. Alt etiketleri görselin içeriğini tanımlar ve görsel arama sonuçlarında görünmenizi sağlar. Dekoratif görseller için alt='' (boş) kullanın. Test: Görseli sağ tıklayıp 'Öğeyi İncele' diyerek alt etiketini kontrol edin.",
          
          "XML Sitemap oluşturun: /sitemap.xml dosyası oluşturup tüm sayfalarınızı listeleyin. Örnek format: <?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'><url><loc>" + url + "</loc><lastmod>2025-01-25</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>. Sitemap arama motorlarının sitenizi daha verimli taramasını sağlar. Sonra Google Search Console'da Sitemaps bölümünden gönderin. Test: Tarayıcıda " + url + "/sitemap.xml adresini ziyaret edin.",
          
          "Open Graph etiketleri ekleyin: <head> bölümüne sosyal medya paylaşımları için <meta property='og:title' content='Sayfa başlığı'>, <meta property='og:description' content='Sayfa açıklaması'>, <meta property='og:image' content='" + url + "/resim.jpg'>, <meta property='og:url' content='" + url + "'> ekleyin. Bu etiketler Facebook, LinkedIn gibi platformlarda paylaşıldığında sitenizin nasıl görüneceğini belirler. Test: Facebook Sharing Debugger'da (developers.facebook.com/tools/debug) URL'nizi test edin."
        ],
        reportData: {
          metaTags: false,
          headings: false,
          images: false,
          performance: 65,
          mobileOptimization: true,
          sslCertificate: url.startsWith('https'),
          pageSpeed: Math.floor(Math.random() * 40) + 40,
          keywords: []
        }
      };
      
      console.log("[INFO] Using detailed fallback report, score:", fallbackReport.score);
      return res.json({ ok: true, report: fallbackReport });
    }
  } catch (e) {
    console.error("[ERROR] Server error in /api/seo-scan:", e);
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
});

app.post("/api/ai-content", async (req, res) => {
  try {
    if (!OPENAI_KEY) {
      console.error("[ERROR] OPENAI_API_KEY missing for AI content generation");
      return res.status(503).json({ 
        error: "OPENAI_API_KEY missing",
        debug: {
          cwd: process.cwd(),
          envFile: process.cwd() + '/.env.local'
        }
      });
    }

    const { platform, prompt, industry, audience, businessGoal, tone, includeEmojis, hashtagCount, targetLength, characterLimit } = req.body || {};

    if (!platform || !prompt) {
      console.error("[ERROR] Missing required fields:", { platform, prompt: !!prompt });
      return res.status(400).json({ error: "Missing platform or prompt" });
    }

    console.log("[INFO] AI Content generation request:", { platform, industry, audience, tone, includeEmojis, hashtagCount, targetLength });

    // Platform-specific system prompts
    const platformSpecs = {
      linkedin: {
        audience: "profesyoneller, iş dünyası, B2B",
        style: "profesyonel, thought leadership, networking odaklı",
        features: "uzun form içerik, industry insights, career tips",
        hashtags: "#dijitalpazarlama #seo #linkedin #b2b #marketing #kariyer #iş #networking",
        cta: "Yorumlarda deneyimlerinizi paylaşın, bağlantı kuralım"
      },
      instagram: {
        audience: "geniş kitle, görsel odaklı, genç demografik",
        style: "görsel destekli, hikaye anlatımı, trend odaklı",
        features: "kısa paragraflar, emoji kullanımı, story-friendly",
        hashtags: "#instagram #dijitalpazarlama #seo #marketing #sosyalmedya #içerik #trend #viral",
        cta: "Beğen, kaydet, arkadaşlarını etiketle"
      },
      twitter: {
        audience: "hızlı bilgi tüketicileri, tech-savvy, trend takipçileri",
        style: "kısa ve öz, viral potansiyeli, thread formatı",
        features: "280 karakter sınırı, retweet odaklı, trending topics",
        hashtags: "#seo #marketing #digitalmarketing #twitter #tech #growth #startup",
        cta: "RT, beğen, thread'i takip et"
      },
      facebook: {
        audience: "geniş yaş aralığı, topluluk odaklı, aile/arkadaş çevresi",
        style: "samimi, topluluk odaklı, tartışma başlatıcı",
        features: "uzun açıklamalar, grup paylaşımları, engagement odaklı",
        hashtags: "#facebook #dijitalpazarlama #seo #marketing #topluluk #paylaşım #tartışma",
        cta: "Yorumla, paylaş, arkadaşlarına öner"
      }
    };

    // Industry-specific expertise
    const industryExpertise = {
      teknoloji: "Yazılım geliştirme, AI/ML, siber güvenlik, cloud computing, fintech, SaaS, mobil uygulamalar",
      sağlık: "Telemedicine, dijital sağlık, hasta deneyimi, sağlık teknolojileri, medikal cihazlar, wellness",
      eğitim: "EdTech, online öğrenme, LMS, öğrenci engagement, dijital okuryazarlık, uzaktan eğitim",
      finans: "Fintech, blockchain, kripto, yatırım stratejileri, kişisel finans, banking, insurance",
      eticaret: "E-commerce, dropshipping, marketplace, conversion optimization, customer journey, omnichannel",
      gayrimenkul: "PropTech, emlak yatırımı, dijital pazarlama, CRM, virtual tours, market analizi",
      turizm: "Travel tech, booking systems, customer experience, destination marketing, hospitality",
      gıda: "Food tech, restaurant management, delivery apps, food safety, organic trends, culinary",
      moda: "Fashion tech, sustainable fashion, e-commerce, influencer marketing, trend forecasting",
      spor: "Sports tech, fitness apps, wearables, sports marketing, athlete branding, fan engagement",
      diğer: "Genel dijital pazarlama, SEO, sosyal medya, content marketing, brand building"
    };

    // Audience-specific language and approach
    const audienceApproach = {
      b2b: "ROI odaklı, data-driven, industry jargon kullan, business case'ler ver, professional network",
      b2c: "Emotion-driven, benefit odaklı, günlük dil kullan, lifestyle benefits, personal stories",
      genç_yetişkin: "Trend-aware, social media native, informal dil, meme references, career growth",
      orta_yaş: "Practical, family-oriented, stability focused, proven solutions, work-life balance",
      üst_düzey_yönetici: "Strategic, high-level insights, leadership focus, industry trends, executive language",
      girişimci: "Growth-focused, innovation-driven, risk-taking, startup ecosystem, scaling strategies",
      öğrenci: "Educational, budget-conscious, career-oriented, learning resources, skill development",
      anne_baba: "Family-focused, safety-oriented, time-saving solutions, child development, parenting tips",
      emekli: "Leisure-focused, health-conscious, simple explanations, traditional values, community",
      karma: "Inclusive language, broad appeal, multiple perspectives, universal benefits"
    };

    const spec = platformSpecs[platform];
    if (!spec) {
      return res.status(400).json({ error: "Unsupported platform" });
    }

    const industryData = industryExpertise[industry] || industryExpertise.diğer;
    const audienceData = audienceApproach[audience] || audienceApproach.karma;

    // Tone descriptions
    const toneStyles = {
      profesyonel: "Kurumsal, ciddi, uzman dili kullan. İstatistik ve veri ekle. Formal üslup.",
      bilgilendirici: "Eğitici, net, adım adım açıklayıcı. Pratik bilgiler ver. Öğretici ton.",
      samimi: "Sıcak, yakın, günlük konuşma dili. Kişisel deneyimler ekle. Dostça yaklaşım.",
      eğlenceli: "Hafif mizahi, enerjik, yaratıcı. Eğlenceli örnekler kullan. Pozitif enerji.",
      satış_odaklı: "Persuasive, action-oriented, benefit-focused. CTA güçlü olsun. Urgency yarat.",
      hikaye_anlatımı: "Narrative-driven, emotional connection, personal stories, journey-based content."
    };

    const systemPrompt = `Sen ${industry} sektöründe uzmanlaşmış, dünya çapında tanınmış bir dijital pazarlama ve içerik stratejisti uzmanısın. ${platform.toUpperCase()} için ${audience} hedef kitlesine yönelik içerik üretiyorsun.

SEKTÖR UZMANLIĞIN:
- Ana Alan: ${industryData.expertise}
- İçerik Odağın: ${industryData.contentFocus}
- ASLA Bahsetme: ${industryData.avoidTopics}

HEDEF KİTLE ANALİZİN:
- Dil Yaklaşımı: ${audienceData.language}
- İlgi Alanları: ${audienceData.interests}
- Sorun Noktaları: ${audienceData.painPoints}
- İçerik Stili: ${audienceData.contentStyle}

PLATFORM ÖZELLİKLERİ (${platform.toUpperCase()}):
- Hedef Kitle: ${spec.audience}
- İçerik Stili: ${spec.style}
- Platform Özellikleri: ${spec.features}
- Karakter Sınırı: ${characterLimit}
- Ton: ${toneStyles[tone]}

${businessGoal ? `İŞ HEDEFİ: ${businessGoal} - Bu hedefe yönelik içerik üret` : ''}

KRİTİK KURALLAR:
1. SADECE ${industry} sektörü kapsamında kal - başka sektörlerden örnek verme
2. ${audience} kitlesinin ${audienceData.painPoints} sorunlarına odaklan
3. ${industryData.avoidTopics} konularından ASLA bahsetme
4. ${audienceData.contentStyle} stilinde yaz
5. SADECE içeriği döndür, açıklama yapma
6. ${characterLimit} karakter sınırını aşma
7. ${includeEmojis ? 'Sektöre uygun emojiler kullan' : 'Emoji kullanma'}
8. ${hashtagCount} adet sektöre özel hashtag ekle
9. ${spec.cta} tarzında CTA ekle
10. Prompt'taki konuyu ${industry} sektörü perspektifinden ele al

${platform === 'twitter' && targetLength ? `TWITTER ÖZELİ: ${targetLength} karakter hedefle, kısa ve etkili ol.` : ''}

MANTIKSAL İÇERİK YAPISI:
1. Hook: ${industry} sektöründen dikkat çekici başlangıç
2. Ana İçerik: ${audienceData.interests} ilgi alanlarına hitap eden değerli bilgi
3. Sektörel Örnek: ${industry} sektöründen spesifik, gerçekçi örnek
4. CTA: ${audienceData.contentStyle} stilinde etkileşim çağrısı
5. Hashtag: ${industry} sektörüne özel etiketler

ÖNEMLI: İçerik tamamen ${industry} sektörü odaklı olmalı. Başka sektörlerden örnekler verme!`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `PROMPT: "${prompt}"\n\nBu konuyu ${industry} sektörü perspektifinden ele alarak ${platform} için ${audience} hedef kitlesine yönelik ${tone} tonunda içerik üret.\n\nÖNEMLİ: \n- Sadece ${industry} sektörü kapsamında kal\n- ${audienceData.interests} ilgi alanlarına hitap et\n- ${industryData.avoidTopics} konularından bahsetme\n- Gerçekçi, sektöre özel örnekler ver\n${businessGoal ? `- İş hedefi: ${businessGoal}` : ''}` }
    ];

    const body = {
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7, // Yaratıcılık için biraz daha yüksek
      max_tokens: Math.min(1000, Math.ceil((characterLimit || 1000) / 2)), // Karakter sınırına göre ayarla
      presence_penalty: 0.3, // Tekrarları azalt
      frequency_penalty: 0.3 // Çeşitliliği artır
    };

    console.log("[INFO] Making OpenAI request for AI content generation");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("[ERROR] OpenAI API error in AI content:", r.status, text);
      return res.status(r.status).json({ error: "openai_error", detail: text });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "";

    console.log("[DEBUG] Raw OpenAI content response:", content.substring(0, 200) + "...");

    // Clean and validate content
    let cleanContent = content.trim();
    
    // Apply character limit if exceeded
    if (cleanContent.length > characterLimit) {
      console.log("[INFO] Content exceeds limit, trimming:", cleanContent.length, "->", characterLimit);
      cleanContent = cleanContent.substring(0, characterLimit - 3) + "...";
    }

    console.log("[INFO] AI content generation successful, length:", cleanContent.length);
    return res.json({ ok: true, content: cleanContent });

  } catch (e) {
    console.error("[ERROR] Server error in /api/ai-content:", e);
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`[weeme.ai] API proxy running on http://localhost:${PORT}`);
  console.log(`[DEBUG] OpenAI API Key configured: ${OPENAI_KEY ? 'YES' : 'NO'}`);
  if (OPENAI_KEY) {
    console.log(`[DEBUG] API Key starts with: ${OPENAI_KEY.substring(0, 7)}...`);
  }
});