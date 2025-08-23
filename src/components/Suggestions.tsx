import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SEOReport } from '../types';
import {
  Lightbulb,
  Send,
  Loader,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Copy,
  Check,
  History,
  Trash2,
} from 'lucide-react';

type ChatItem = {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
  contextScore?: number;
};

const Suggestions: React.FC = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState<SEOReport[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatItem[]>([]);

  // Load reports & history
  useEffect(() => {
    const savedReports = localStorage.getItem(`reports_${user?.id}`);
    if (savedReports) setReports(JSON.parse(savedReports));

    const savedHistory = localStorage.getItem(`aiSeoHistory_${user?.id}`);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [user?.id]);

  const latestReport = reports[0];

  // Hazır hızlı komutlar (prompt şablonları)
  const quickPrompts = useMemo(
    () => [
      'Eksik başlık etiketleri ve zayıf iç bağlantılar için 10 maddelik eylem planı yaz',
      'Sayfa hızı ve Core Web Vitals için 30-60-90 günlük iyileştirme planı çıkar',
      'Site genelinde meta title/description standartlarını ve örnek şablonları öner',
      'Sitemap, robots.txt ve structured data için kontrol listesi oluştur',
      'Blog içerikleri için uzun kuyruk anahtar kelime stratejisi ve içerik takvimi öner',
    ],
    []
  );

  // Rapor bağlamını isteme ekle
  const contextFromReport = useMemo(() => {
    if (!latestReport) return '';
    const lines: string[] = [];
    lines.push(`SEO Skoru: ${latestReport.score}`);
    if (latestReport.positives?.length) {
      lines.push(`Olumlu: ${latestReport.positives.slice(0, 5).join('; ')}`);
    }
    if (latestReport.negatives?.length) {
      lines.push(`Eksikler: ${latestReport.negatives.slice(0, 8).join('; ')}`);
    }
    if (latestReport.reportData) {
      const d = latestReport.reportData as any;
      if (typeof d.pageSpeed === 'number') lines.push(`PageSpeed: ${d.pageSpeed}`);
      if (Array.isArray(d.keywords) && d.keywords.length)
        lines.push(`Örnek Anahtar Kelimeler: ${d.keywords.slice(0, 6).join(', ')}`);
    }
    lines.push(`Site: ${latestReport.websiteUrl}`);
    return lines.join(' | ');
  }, [latestReport]);

  const gated = user?.membershipType === 'Free'; // Pro ve Advanced kullanabilir

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // no-op
    }
  };

  const saveHistory = (item: ChatItem) => {
    const updated = [item, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem(`aiSeoHistory_${user?.id}`, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`aiSeoHistory_${user?.id}`);
  };

  const pickMock = (p: string) => {
    // İstem ve rapor bağlamına göre sahte (mock) içerik
    const contextNote = contextFromReport ? `\n\n🔎 Bağlam: ${contextFromReport}` : '';
    return (
      `## 🛠 Hızlı Kazanımlar (0-7 gün)\n` +
      `- H1 etiketi eksik sayfalar için şablon belirleyin ve tekil H1 kuralını uygulayın.\n` +
      `- Open Graph ve Twitter Card meta etiketlerini temel şablonla ekleyin.\n` +
      `- Görsellere eksik alt metinlerini ekleyin; dosya adlarını anahtar kelimeyle uyumlu hale getirin.\n` +
      `- XML sitemap oluşturun ve Search Console'a gönderin.\n` +
      `- İç bağlantı yapısını güçlendirmek için üst seviye sayfalardan kategori/önemli sayfalara 2-3 bağlantı ekleyin.\n\n` +
      `## 📈 30-60-90 Günlük Plan\n` +
      `**30 Gün:** Site genelinde title/description standartlarını eşitleyin (title ≤ 60 karakter, description 140-160). Core sayfalarda LCP hedefi ≤ 2.5s.\n` +
      `**60 Gün:** Şema işaretlemelerini (Organization, WebSite, Article, Product) kritik şablonlara ekleyin. Dahili linkler için breadcrumb + ilgili içerik modülleri.\n` +
      `**90 Gün:** İçerik takvimi: uzun kuyruk konularda haftada 2 yeni yazı. Eski içeriklerde güncelleme turu (tarih, istatistik, görsel, dahili link).\n\n` +
      `## ✅ Kontrol Listesi\n` +
      `- [ ] Robots.txt ve sitemap.xml erişilebilir\n` +
      `- [ ] Her sayfada 1 adet H1 ve mantıklı H2-H3 hiyerarşisi\n` +
      `- [ ] Mobil uyumluluk ve CLS ≤ 0.1\n` +
      `- [ ] 404 ve 301 yönlendirme kuralları güncel\n` +
      `- [ ] Dahili linklerde anlaşılan anchor metinleri\n\n` +
      `## ✍️ Meta Örnekleri\n` +
      `- **Title:** {Ana Anahtar Kelime} | {Marka}\n` +
      `- **Description:** {Kısa değer önerisi}. {1-2 fayda}. Hemen keşfedin.\n\n` +
      `## 📌 İstem\n` +
      `${p.trim()}` +
      contextNote
    );
  };

  const handleAIPrompt = async (customPrompt?: string) => {
    const finalPrompt = (customPrompt ?? prompt).trim();
    if (!finalPrompt || !user) return;

    if (gated) {
      alert('Bu özellik Pro ve Advanced üyelerde mevcuttur.');
      return;
    }

    setLoading(true);
    setAiResponse('');

    // MOCK: Gerçek API entegrasyonu hazır olana kadar simüle ediyoruz.
    setTimeout(() => {
      const response = pickMock(finalPrompt);
      setAiResponse(response);

      const item: ChatItem = {
        id: Date.now().toString(),
        prompt: finalPrompt,
        response,
        createdAt: new Date().toISOString(),
        contextScore: latestReport?.score,
      };
      saveHistory(item);
      setLoading(false);
    }, 1600);
  };

  return (
    <div className="space-y-8">
      {/* Son Rapor Özetli Öneriler */}
      {latestReport && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" />
            SEO Önerileri (Son Rapor)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Güçlü Yönler */}
            <div>
              <h3 className="text-lg font-medium text-green-600 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Güçlü Yönleriniz
              </h3>
              <div className="space-y-3">
                {latestReport.positives.map((positive, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-800">{positive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* İyileştirme Alanları */}
            <div>
              <h3 className="text-lg font-medium text-red-600 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                İyileştirme Alanları
              </h3>
              <div className="space-y-3">
                {latestReport.negatives.map((negative, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800">{negative}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detaylı Öneri Kartları */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-blue-600 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Detaylı Öneriler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestReport.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-blue-800">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Yapay Zeka SEO Asistanı */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Sparkles className="h-6 w-6 text-purple-500 mr-2" />
          Yapay Zeka SEO Asistanı
        </h2>

        {gated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Bu özellik Pro ve Advanced üyelerde mevcuttur. Üyeliğinizi yükseltin.
              </p>
            </div>
          </div>
        )}

        {/* Hızlı Komutlar */}
        <div className="mb-4">
          <p className="block text-sm font-medium text-gray-700 mb-2">Hızlı komutlar</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => setPrompt(qp)}
                className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 bg-white"
                disabled={gated}
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Bağlam */}
        {contextFromReport && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
            <p className="text-xs text-gray-600">
              <strong>Rapor bağlamı:</strong> {contextFromReport}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Prompt alanı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO sorunuz veya ihtiyacınız nedir?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örnek: Ana sayfamda H1 etiketi yok. Hızlı bir düzeltme planı ve kontrol listesi hazırlar mısın?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              disabled={gated}
            />
          </div>

          {/* Butonlar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAIPrompt()}
              disabled={loading || !prompt.trim() || gated}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{loading ? 'Analiz ediliyor...' : 'Önerileri Al'}</span>
            </button>

            {!gated && latestReport && (
              <button
                onClick={() =>
                  handleAIPrompt(
                    `${prompt || 'Site genel SEO iyileştirmeleri'}\n\nRapor Özetine Göre: ${contextFromReport}`
                  )
                }
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Raporu Dahil Et</span>
              </button>
            )}
          </div>

          {/* AI Yanıtı */}
          {aiResponse && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Yapay Zeka Önerileri
                </h4>
                <button
                  onClick={() => handleCopy(aiResponse, 'current')}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  {copied === 'current' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  <span className="text-sm">{copied === 'current' ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geçmiş */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <History className="h-6 w-6 text-gray-500 mr-2" />
            Asistan Geçmişi
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Geçmişi Temizle</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
            Henüz geçmiş yok. Bir soru sorun ve öneriler alın!
          </div>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 10).map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString('tr-TR')}
                    {typeof item.contextScore === 'number' && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        Skor: {item.contextScore}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(item.response, item.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                  >
                    {copied === item.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    <span className="text-sm">{copied === item.id ? 'Kopyalandı!' : 'Kopyala'}</span>
                  </button>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium text-gray-900">Prompt:</span> {item.prompt}
                </p>
                <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {item.response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
