import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { AIContent as AIContentType } from '../types';
import {
  Sparkles,
  Send,
  Loader,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Copy,
  Check,
  Trash2,
  Wand2,
  RefreshCw,
  ListRestart
} from 'lucide-react';

type Platform = 'linkedin' | 'instagram' | 'twitter' | 'facebook';
type Tone = 'bilgilendirici' | 'samimi' | 'profesyonel' | 'eğlenceli' | 'satış_odaklı' | 'hikaye_anlatımı';
type Industry = 'teknoloji' | 'sağlık' | 'eğitim' | 'finans' | 'eticaret' | 'gayrimenkul' | 'turizm' | 'gıda' | 'moda' | 'spor' | 'diğer';
type Audience = 'b2b' | 'b2c' | 'genç_yetişkin' | 'orta_yaş' | 'üst_düzey_yönetici' | 'girişimci' | 'öğrenci' | 'anne_baba' | 'emekli' | 'karma';

const PLATFORM_LIMITS: Record<Platform, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206
};

const platformIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
};

const platformColors = {
  linkedin: 'bg-blue-600',
  instagram: 'bg-pink-600',
  twitter: 'bg-sky-500',
  facebook: 'bg-blue-700',
};

const platformNames = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
};


const industryPresets: Record<Industry, string[]> = {
  teknoloji: [
    'Yapay zeka trendleri ve iş dünyasına etkileri',
    'Siber güvenlik ipuçları: 2024 tehditleri',
    'Cloud computing maliyetlerini optimize etme',
    'Mobil uygulama geliştirme best practice\'leri'
  ],
  sağlık: [
    'Dijital sağlık çözümleri ve hasta deneyimi',
    'Telemedicine\'in geleceği ve fırsatları',
    'Sağlık sektöründe veri güvenliği',
    'Hasta memnuniyeti artırma stratejileri'
  ],
  eğitim: [
    'Online eğitim platformları karşılaştırması',
    'Uzaktan öğrenme motivasyon teknikleri',
    'Eğitim teknolojileri ve öğrenci başarısı',
    'Dijital okuryazarlık önemini artırma'
  ],
  finans: [
    'Kripto para yatırım stratejileri',
    'Kişisel finans yönetimi ipuçları',
    'Fintech trendleri ve bankacılığın geleceği',
    'Yatırım portföyü çeşitlendirme rehberi'
  ],
  eticaret: [
    'E-ticaret dönüşüm oranı artırma yöntemleri',
    'Sosyal medya üzerinden satış stratejileri',
    'Müşteri sadakati programları tasarlama',
    'Kargo ve lojistik optimizasyonu'
  ],
  gayrimenkul: [
    'Emlak yatırımında dikkat edilecek noktalar',
    'Dijital pazarlama ile emlak satışı',
    'Gayrimenkul değerleme kriterleri',
    'Kiralama süreçlerini optimize etme'
  ],
  turizm: [
    'Sürdürülebilir turizm trendleri',
    'Sosyal medyada destinasyon pazarlama',
    'Müşteri deneyimi ve turizm sektörü',
    'Dijital dönüşüm ve otel işletmeciliği'
  ],
  gıda: [
    'Organik gıda trendleri ve tüketici tercihleri',
    'Restoran işletmeciliğinde dijital çözümler',
    'Gıda güvenliği ve kalite standartları',
    'Sosyal medyada yemek fotoğrafçılığı'
  ],
  moda: [
    'Sürdürülebilir moda ve çevre bilinci',
    'Influencer marketing moda sektöründe',
    'E-ticaret ve moda: trendler ve fırsatlar',
    'Kişisel stil danışmanlığı ipuçları'
  ],
  spor: [
    'Fitness motivasyonu ve hedef belirleme',
    'Spor beslenme programları rehberi',
    'Dijital fitness uygulamaları karşılaştırması',
    'Spor sektöründe sosyal medya stratejileri'
  ],
  diğer: [
    'Kişisel marka oluşturma stratejileri',
    'Dijital pazarlama trendleri 2024',
    'Sosyal medya algoritmaları nasıl çalışır?',
    'İçerik pazarlama ROI ölçüm yöntemleri'
  ]
};


const AIContent: React.FC = () => {
  const { user } = useAuth();

  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<Tone>('profesyonel');
  const [industry, setIndustry] = useState<Industry>('diğer');
  const [audience, setAudience] = useState<Audience>('karma');
  const [businessGoal, setBusinessGoal] = useState('');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(3);
  const [targetLength, setTargetLength] = useState(120);

  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentHistory, setContentHistory] = useState<AIContentType[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const disabled = user?.membershipType !== 'Advanced';

  useEffect(() => {
    const saved = localStorage.getItem(`aiContent_${user?.id}`);
    if (saved) setContentHistory(JSON.parse(saved));
  }, [user?.id]);

  const saveHistory = (item: AIContentType) => {
    const updated = [item, ...contentHistory].slice(0, 100);
    setContentHistory(updated);
    if (user) localStorage.setItem(`aiContent_${user.id}`, JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (!user) return;
    localStorage.removeItem(`aiContent_${user.id}`);
    setContentHistory([]);
  };

  const removeHistoryItem = (id: string) => {
    const updated = contentHistory.filter((c) => c.id !== id);
    setContentHistory(updated);
    if (user) localStorage.setItem(`aiContent_${user.id}`, JSON.stringify(updated));
  };

  const charCount = useMemo(() => prompt.trim().length, [prompt]);
  const hardLimit = PLATFORM_LIMITS[platform];
  const overLimit = generatedContent && generatedContent.length > hardLimit;

  const currentPresets = industryPresets[industry] || industryPresets.diğer;

  const selectPreset = (idea: string) => setPrompt(idea);
  const getRandomPreset = () => {
    const allPresets = Object.values(industryPresets).flat();
    const randomIdea = allPresets[Math.floor(Math.random() * allPresets.length)];
    setPrompt(randomIdea);
  };

  const callOpenAI = async (): Promise<string> => {
    try {
      const base = (import.meta as any).env?.VITE_API_BASE || "";
      const url = `${base}/api/ai-content`;
      
      const body = {
        platform,
        prompt: prompt.trim(),
        industry,
        audience,
        businessGoal: businessGoal.trim(),
        tone,
        includeEmojis,
        hashtagCount,
        targetLength: platform === 'twitter' ? targetLength : null,
        characterLimit: hardLimit,
      };

      console.log('[DEBUG] AI Content request:', body);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log('[DEBUG] AI Content response status:', resp.status);

      if (!resp.ok) {
        console.error('[DEBUG] AI Content API error:', resp.status);
        throw new Error('API request failed');
      }

      const json = await resp.json();
      console.log('[DEBUG] AI Content response:', json);
      
      return json?.content || 'İçerik üretilemedi.';
    } catch (error) {
      console.error('[DEBUG] AI Content request failed:', error);
      throw error;
    }
  };

  const generateFallback = (): string => {
    const platformTemplates = {
      linkedin: `🚀 ${prompt || 'Dijital pazarlama stratejisi'}\n\nDijital pazarlama dünyasında sürekli değişen trendleri takip etmek kritik önemde. İşte dikkat etmeniz gereken 3 ana nokta:\n\n• Veri odaklı karar verme süreçleri\n• Müşteri deneyimi optimizasyonu\n• ROI ölçümü ve analiz\n\nSizin deneyimleriniz neler? Yorumlarda paylaşın! 💡\n\n#dijitalpazarlama #seo #marketing`,
      
      instagram: `✨ ${prompt || 'SEO ipuçları'} ✨\n\nBugün sizlerle SEO dünyasından pratik ipuçları paylaşıyorum! 📈\n\n🎯 Anahtar kelime araştırması yaparken:\n• Uzun kuyruk kelimeleri unutmayın\n• Rakip analizi yapın\n• Kullanıcı niyetini anlayın\n\nHangi SEO aracını kullanıyorsunuz? 👇\n\n#seo #dijitalpazarlama #marketing #webdesign #googleranking`,
      
      twitter: `🔥 ${prompt || 'Dijital pazarlama trendi'}\n\n2024'te dikkat edilmesi gereken 3 trend:\n\n1️⃣ AI destekli içerik üretimi\n2️⃣ Voice search optimizasyonu  \n3️⃣ Video-first stratejiler\n\nHangisini daha önce denediniz? 🚀\n\n#marketing #AI #seo`,
      
      facebook: `👋 Dijital pazarlama topluluğu!\n\n${prompt || 'SEO stratejileri'} konusunda deneyimlerinizi merak ediyorum.\n\nÖzellikle şu konularda:\n• Organik trafik artırma yöntemleri\n• İçerik pazarlama stratejileri\n• Sosyal medya entegrasyonu\n\nSizin en etkili bulduğunuz yöntem hangisi? Deneyimlerinizi paylaşır mısınız? 💬\n\n#dijitalpazarlama #seo #marketing #topluluk`
    };

    return platformTemplates[platform];
  };

  const generateContent = async () => {
    if (!prompt.trim() || !user) return;

    if (user.membershipType !== 'Advanced') {
      alert('Bu özellik sadece Advanced üyelerde mevcuttur.');
      return;
    }

    setLoading(true);

    try {
      const content = await callOpenAI();

      setGeneratedContent(content);

      const newContent: AIContentType = {
        id: Date.now().toString(),
        userId: user.id,
        platform,
        prompt,
        content,
        createdAt: new Date().toISOString(),
      };

      saveHistory(newContent);
    } catch (error) {
      console.error('AI content generation failed:', error);
      // Fallback to template-based generation
      const fallbackContent = generateFallback();
      setGeneratedContent(fallbackContent);
      
      const newContent: AIContentType = {
        id: Date.now().toString(),
        userId: user.id,
        platform,
        prompt,
        content: fallbackContent,
        createdAt: new Date().toISOString(),
      };
      
      saveHistory(newContent);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setBusinessGoal('');
    setGeneratedContent('');
    setTone('profesyonel');
    setIndustry('diğer');
    setAudience('karma');
    setIncludeEmojis(true);
    setHashtagCount(3);
    setTargetLength(120);
  };

  return (
    <div className="space-y-8">
      {/* Content Generator */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Sparkles className="h-6 w-6 text-purple-500 mr-2" />
            Yapay Zeka İçerik Üreticisi
          </h2>

          <div className="text-xs text-gray-500">
            Platform sınırı: <span className="font-medium">{hardLimit.toLocaleString('tr-TR')} karakter</span>
          </div>
        </div>

        {disabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Bu özellik sadece <b>Advanced</b> üyelerde mevcuttur. Üyeliğinizi yükseltin.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Platform Seçin
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(platformIcons).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setPlatform(key as Platform)}
                  disabled={disabled}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                    platform === (key as Platform)
                      ? `${platformColors[key as keyof typeof platformColors]} text-white border-transparent`
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{platformNames[key as keyof typeof platformNames]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Sektörünüze Özel Fikirler
              </label>
              <button
                type="button"
                onClick={getRandomPreset}
                className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                disabled={disabled}
              >
                <Wand2 className="h-4 w-4" />
                <span>Rastgele seç</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentPresets.map((idea) => (
                <button
                  key={idea}
                  onClick={() => selectPreset(idea)}
                  disabled={disabled}
                  className="text-xs px-2 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Industry & Audience Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sektörünüz
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as Industry)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={disabled}
              >
                <option value="teknoloji">Teknoloji</option>
                <option value="sağlık">Sağlık</option>
                <option value="eğitim">Eğitim</option>
                <option value="finans">Finans</option>
                <option value="eticaret">E-ticaret</option>
                <option value="gayrimenkul">Gayrimenkul</option>
                <option value="turizm">Turizm</option>
                <option value="gıda">Gıda & Restoran</option>
                <option value="moda">Moda & Tekstil</option>
                <option value="spor">Spor & Fitness</option>
                <option value="diğer">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hedef Kitleniz
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as Audience)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={disabled}
              >
                <option value="b2b">B2B (İş Dünyası)</option>
                <option value="b2c">B2C (Bireysel Müşteri)</option>
                <option value="genç_yetişkin">Genç Yetişkin (18-35)</option>
                <option value="orta_yaş">Orta Yaş (35-55)</option>
                <option value="üst_düzey_yönetici">Üst Düzey Yönetici</option>
                <option value="girişimci">Girişimci & Startup</option>
                <option value="öğrenci">Öğrenci</option>
                <option value="anne_baba">Anne & Baba</option>
                <option value="emekli">Emekli</option>
                <option value="karma">Karma Kitle</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ton
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={disabled}
              >
                <option value="profesyonel">Profesyonel</option>
                <option value="bilgilendirici">Bilgilendirici</option>
                <option value="samimi">Samimi</option>
                <option value="eğlenceli">Eğlenceli</option>
                <option value="satış_odaklı">Satış Odaklı</option>
                <option value="hikaye_anlatımı">Hikaye Anlatımı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hashtag Sayısı
              </label>
              <input
                type="number"
                min={0}
                max={8}
                value={hashtagCount}
                onChange={(e) => setHashtagCount(Math.min(8, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hedef Uzunluk (Twitter için)
              </label>
              <input
                type="range"
                min={80}
                max={280}
                step={10}
                value={targetLength}
                onChange={(e) => setTargetLength(Number(e.target.value))}
                className="w-full"
                disabled={disabled || platform !== 'twitter'}
              />
              <div className="text-xs text-gray-500 mt-1">{targetLength} karakter</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İş Hedefi (Opsiyonel)
              </label>
              <input
                type="text"
                value={businessGoal}
                onChange={(e) => setBusinessGoal(e.target.value)}
                placeholder="Satış artırma, farkındalık..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Content Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                İçerik konunuzu yazın
              </label>
              <div className="text-xs text-gray-500">
                {charCount} karakter
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Örnek: ${currentPresets[0]}`}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              disabled={disabled}
            />
            <div className="mt-2 flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  disabled={disabled}
                />
                Emojileri dahil et
              </label>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                disabled={disabled}
              >
                <RefreshCw className="h-4 w-4" /> Sıfırla
              </button>
            </div>
          </div>

          <button
            onClick={generateContent}
            disabled={loading || !prompt.trim() || disabled}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span>{loading ? 'İçerik üretiliyor...' : 'İçerik Üret'}</span>
          </button>

          {/* Generated Content */}
          {generatedContent && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  {React.createElement(platformIcons[platform], { className: 'h-5 w-5 mr-2' })}
                  {platformNames[platform]} İçeriği
                </h4>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${
                    overLimit ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {generatedContent.length}/{hardLimit}
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedContent, 'current')}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                  >
                    {copiedId === 'current' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {copiedId === 'current' ? 'Kopyalandı!' : 'Kopyala'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded border">
                {generatedContent}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">İçerik Geçmişi</h2>
          {contentHistory.length > 0 ? (
            <button
              onClick={clearHistory}
              className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
            >
              <ListRestart className="h-4 w-4" /> Geçmişi Temizle
            </button>
          ) : null}
        </div>

        {contentHistory.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Sparkles className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Henüz içerik üretilmedi. İlk paylaşımınızı yukarıdan oluşturun.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contentHistory.slice(0, 10).map((content) => {
              const Icon = platformIcons[content.platform as Platform];
              return (
                <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {platformNames[content.platform as Platform]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(content.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(content.content, content.id)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                      >
                        {copiedId === content.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="text-sm">
                          {copiedId === content.id ? 'Kopyalandı!' : 'Kopyala'}
                        </span>
                      </button>
                      <button
                        onClick={() => removeHistoryItem(content.id)}
                        className="text-gray-500 hover:text-red-600"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    Prompt: {content.prompt}
                  </p>
                  <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                    {content.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIContent;