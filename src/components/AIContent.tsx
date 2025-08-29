import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/database';
import { config } from '../lib/config';
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
  ListRestart,
  Lock,
  Rocket,
  ArrowRight,
  Zap,
  Target,
  Users,
  TrendingUp,
  Globe,
  Heart,
  MessageCircle,
  Share,
  Eye,
  BarChart3
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
  linkedin: 'from-blue-600 to-blue-700',
  instagram: 'from-pink-600 to-purple-600',
  twitter: 'from-sky-500 to-blue-600',
  facebook: 'from-blue-700 to-indigo-700',
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
    if (user?.id) {
      loadAIContentHistory();
    }
  }, [user?.id]);

  const loadAIContentHistory = async () => {
    if (!user?.id) return;
    try {
      const contents = await db.getAIContent(user.id);
      setContentHistory(contents);
    } catch (error) {
      console.error('Failed to load AI content history:', error);
      const saved = localStorage.getItem(`aiContent_${user.id}`);
      if (saved) setContentHistory(JSON.parse(saved));
    }
  };

  const saveHistory = (item: AIContentType) => {
    const updated = [item, ...contentHistory].slice(0, 100);
    setContentHistory(updated);
    if (user) {
      db.saveAIContent(item);
      localStorage.setItem(`aiContent_${user.id}`, JSON.stringify(updated));
    }
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
      const base = config.apiBase;
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
        membershipType: user?.membershipType || "Free",
      };
      
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('AI Content API error:', resp.status, errorText);
        throw new Error(`API Error: ${resp.status}`);
      }

      const json = await resp.json();
      
      return json?.content || 'İçerik üretilemedi.';
    } catch (error) {
      console.error('AI Content request failed:', error);
      return generateFallback();
    }
  };

  const generateFallback = (): string => {
    const platformTemplates = {
      linkedin: `🚀 ${prompt || 'Dijital pazarlama stratejisi'}\n\nDijital pazarlama dünyasında sürekli değişen trendleri takip etmek kritik önemde. İşte dikkat etmeniz gereken 3 ana nokta:\n\n• Veri odaklı karar verme süreçleri\n• Müşteri deneyimi optimizasyonu\n• ROI ölçümü ve analiz\n\nSizin deneyimleriniz neler? Yorumlarda paylaşın! 💡\n\n#dijitalpazarlama #seo #marketing`,
      
      instagram: `✨ ${prompt || 'SEO ipuçları'} ✨\n\nBugün sizlerle SEO dünyasından pratik ipuçları paylaşıyorum! 📈\n\n🎯 Anahtar kelime araştırması yaparken:\n• Uzun kuyruk kelimeleri unutmayın\n• Rakip analizi yapın\n• Kullanıcı niyetini anlayın\n\nHangi SEO aracını kullanıyorsunuz? 👇💬\n\n#seo #dijitalpazarlama #marketing #webdesign #googleranking`,
      
      twitter: `🔥 ${prompt || 'Dijital pazarlama trendi'}\n\n2024'te dikkat edilmesi gereken 3 trend:\n\n1️⃣ AI destekli içerik üretimi\n2️⃣ Voice search optimizasyonu  \n3️⃣ Video-first stratejiler\n\nHangisini denediniz? 🚀\n\n#marketing #AI #seo`,
      
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
        id: uuidv4(),
        userId: user.id,
        platform,
        prompt,
        content,
        createdAt: new Date().toISOString(),
      };

      saveHistory(newContent);
    } catch (error) {
      console.error('AI content generation failed:', error);
      const fallbackContent = generateFallback();
      setGeneratedContent(fallbackContent);
      
      const newContent: AIContentType = {
        id: uuidv4(),
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

  if (disabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-4xl w-full relative z-10">
          <div className="glass rounded-3xl border border-white/20 shadow-2xl p-12 text-center">
            <div className="relative mb-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-float shadow-2xl">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-xl">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              AI İçerik Üreticisi
            </h2>
            
            <p className="text-gray-600 text-xl mb-12 leading-relaxed max-w-3xl mx-auto">
              Sosyal medya platformları için AI destekli içerik üretimi sadece 
              <span className="font-bold text-purple-600"> Advanced </span> üyelerde mevcuttur.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {Object.entries(platformIcons).map(([key, Icon]) => (
                <div key={key} className="glass rounded-3xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-sm text-gray-600 font-medium">{platformNames[key as keyof typeof platformNames]}</div>
                </div>
              ))}
            </div>

            <div className="glass rounded-3xl p-8 border border-purple-200 mb-12 hover:shadow-2xl transition-all duration-500">
              <h3 className="font-bold text-purple-900 mb-6 text-2xl">Advanced Plan Özellikleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className="text-left space-y-4">
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-purple-800">AI destekli içerik üretimi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-purple-800">Platform optimizasyonu</span>
                  </li>
                </ul>
                <ul className="text-left space-y-4">
                  <li className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-purple-800">Hedef kitle analizi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-purple-800">Engagement optimizasyonu</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => alert('Üyelik yükseltme özelliği yakında eklenecek!')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 rounded-3xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center gap-4 mx-auto"
            >
              <Rocket className="h-6 w-6" />
              Advanced'a Yükselt
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-gradient">
            AI İçerik Üreticisi
          </h1>
          <p className="text-gray-600 text-xl">Sosyal medya platformları için AI destekli içerik üretimi</p>
        </div>

        <div className="space-y-8">
          {/* Content Generator */}
          <div className="glass rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">İçerik Üreticisi</h2>
                  <p className="text-gray-600 text-lg">AI ile viral potansiyeli yüksek içerikler oluşturun</p>
                </div>
              </div>

              <div className="text-sm text-gray-500 glass px-4 py-2 rounded-full">
                Platform sınırı: <span className="font-semibold">{hardLimit.toLocaleString('tr-TR')} karakter</span>
              </div>
            </div>

            <div className="space-y-8">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Platform Seçin
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(platformIcons).map(([key, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setPlatform(key as Platform)}
                      className={`group relative overflow-hidden flex items-center justify-center space-x-3 p-6 rounded-3xl border-2 transition-all duration-300 ${
                        platform === (key as Platform)
                          ? `bg-gradient-to-r ${platformColors[key as keyof typeof platformColors]} text-white border-transparent shadow-2xl transform scale-105`
                          : 'glass text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-xl hover:-translate-y-1'
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                      <span className="font-semibold text-lg">{platformNames[key as keyof typeof platformNames]}</span>
                      {platform === (key as Platform) && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-3xl"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Sektörünüze Özel Fikirler
                  </label>
                  <button
                    type="button"
                    onClick={getRandomPreset}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-2 glass px-4 py-2 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Rastgele seç</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentPresets.map((idea) => (
                    <button
                      key={idea}
                      onClick={() => selectPreset(idea)}
                      className="text-sm px-4 py-3 border border-gray-200 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 glass hover:shadow-lg"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry & Audience Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sektörünüz
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as Industry)}
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent glass transition-all duration-200 text-lg"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Hedef Kitleniz
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as Audience)}
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent glass transition-all duration-200 text-lg"
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Ton
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 glass transition-all duration-200 text-lg"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Hashtag Sayısı
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={8}
                    value={hashtagCount}
                    onChange={(e) => setHashtagCount(Math.min(8, Math.max(0, Number(e.target.value))))}
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 glass transition-all duration-200 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                    disabled={platform !== 'twitter'}
                  />
                  <div className="text-sm text-gray-500 mt-2">{targetLength} karakter</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    İş Hedefi (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={businessGoal}
                    onChange={(e) => setBusinessGoal(e.target.value)}
                    placeholder="Satış artırma, farkındalık..."
                    className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 glass transition-all duration-200 text-lg"
                  />
                </div>
              </div>

              {/* Content Prompt */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    İçerik konunuzu yazın
                  </label>
                  <div className="text-sm text-gray-500">
                    {charCount} karakter
                  </div>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Örnek: ${currentPresets[0]}`}
                  rows={4}
                  className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 glass transition-all duration-200 resize-none text-lg"
                />
                <div className="mt-4 flex items-center justify-between">
                  <label className="inline-flex items-center gap-3 text-gray-700">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                      checked={includeEmojis}
                      onChange={(e) => setIncludeEmojis(e.target.checked)}
                    />
                    <span className="font-medium">Emojileri dahil et</span>
                  </label>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2 glass px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" /> Sıfırla
                  </button>
                </div>
              </div>

              <button
                onClick={generateContent}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 rounded-3xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                {loading ? (
                  <Loader className="h-6 w-6 animate-spin" />
                ) : (
                  <Send className="h-6 w-6" />
                )}
                <span>{loading ? 'AI İçerik Üretiyor...' : 'İçerik Üret'}</span>
              </button>

              {/* Generated Content */}
              {generatedContent && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-r ${platformColors[platform]} rounded-2xl shadow-lg`}>
                        {React.createElement(platformIcons[platform], { className: 'h-6 w-6 text-white' })}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xl">{platformNames[platform]} İçeriği</h4>
                        <div className="text-sm text-gray-500">
                          {generatedContent.length}/{hardLimit} karakter
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {overLimit && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                          Sınır aşıldı
                        </div>
                      )}
                      <button
                        onClick={() => copyToClipboard(generatedContent, 'current')}
                        className="flex items-center space-x-2 px-6 py-3 glass border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        {copiedId === 'current' ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-600" />
                        )}
                        <span className="font-medium">
                          {copiedId === 'current' ? 'Kopyalandı!' : 'Kopyala'}
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="text-gray-700 whitespace-pre-line glass rounded-2xl p-6 border border-gray-200 text-lg leading-relaxed">
                      {generatedContent}
                    </div>
                    
                    {/* Engagement Preview */}
                    <div className="mt-6 flex items-center justify-between text-sm text-gray-500 glass rounded-2xl p-4">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 50) + 10}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 20) + 5}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Share className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 10) + 2}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Tahmini engagement</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content History */}
          <div className="glass rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">İçerik Geçmişi</h2>
                  <p className="text-gray-600 text-lg">Daha önce üretilen içerikleriniz</p>
                </div>
              </div>
              {contentHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-2 bg-red-50 px-4 py-3 rounded-2xl hover:bg-red-100 transition-colors"
                >
                  <ListRestart className="h-4 w-4" /> Geçmişi Temizle
                </button>
              )}
            </div>

            {contentHistory.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative mb-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-float shadow-2xl">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz İçerik Üretilmedi</h3>
                <p className="text-gray-600 text-lg">İlk sosyal medya içeriğinizi yukarıdan oluşturun.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {contentHistory.slice(0, 10).map((content) => {
                  const Icon = platformIcons[content.platform as Platform];
                  return (
                    <div key={content.id} className="glass border border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 bg-gradient-to-r ${platformColors[content.platform as Platform]} rounded-2xl shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-lg">
                              {platformNames[content.platform as Platform]}
                            </span>
                            <div className="text-sm text-gray-500">
                              {new Date(content.createdAt).toLocaleDateString('tr-TR')} • {content.content.length} karakter
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => copyToClipboard(content.content, content.id)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 glass px-4 py-2 rounded-2xl hover:bg-gray-100 transition-colors"
                          >
                            {copiedId === content.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                              {copiedId === content.id ? 'Kopyalandı!' : 'Kopyala'}
                            </span>
                          </button>
                          <button
                            onClick={() => removeHistoryItem(content.id)}
                            className="text-gray-500 hover:text-red-600 p-2 rounded-2xl transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 font-semibold mb-2">Prompt:</div>
                        <div className="text-sm text-gray-800 glass rounded-2xl p-4">
                          {content.prompt}
                        </div>
                      </div>
                      <div className="text-gray-700 whitespace-pre-line glass rounded-2xl p-6 border border-gray-200 leading-relaxed">
                        {content.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContent;