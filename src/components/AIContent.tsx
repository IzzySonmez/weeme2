import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AIContent as AIContentType } from '../types';
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
type Tone = 'bilgilendirici' | 'samimi' | 'profesyonel' | 'eğlenceli';

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

const defaultHashtags = {
  linkedin: ['#iş', '#kariyer', '#pazarlama'],
  instagram: ['#instagram', '#sosyalmedya', '#içerik'],
  twitter: ['#seo', '#growth', '#marketing'],
  facebook: ['#topluluk', '#paylaşım', '#pazarlama'],
} as Record<Platform, string[]>;

const presetIdeas = [
  'Yeni ürün lansmanı duyurusu',
  'Haftalık ipuçları: SEO hızlı kazanımlar',
  'Müşteri başarı hikayesi (case study) özeti',
  'Ekip/kültür paylaşımı',
  'Trend bir konuya görüş ekleme (thought leadership)',
];

const tonePreambles: Record<Tone, string> = {
  bilgilendirici: 'Bilgilendirici bir dille, net ve veri odaklı:',
  samimi: 'Samimi, sıcak ve günlük konuşma diliyle:',
  profesyonel: 'Kurumsal ve profesyonel bir üslupla:',
  eğlenceli: 'Hafif mizahi ve enerjik bir dille:',
};

const AIContent: React.FC = () => {
  const { user } = useAuth();

  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<Tone>('profesyonel');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(3);
  const [targetLength, setTargetLength] = useState(120); // karakter hedefi (özellikle twitter için faydalı)

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

  const applyLengthGuard = (text: string) => {
    if (text.length <= hardLimit) return text;
    // Karakter limitini aşarsa kibarca kırp
    return text.slice(0, hardLimit - 1) + '…';
  };

  const selectPreset = (idea: string) => setPrompt(idea);

  const randomizedHashtags = (p: Platform) =>
    defaultHashtags[p].slice(0, hashtagCount).join(' ');

  const sprinkleEmojis = (p: Platform) => {
    if (!includeEmojis) return { lead: '', end: '' };
    const map: Record<Platform, { lead: string; end: string[] }> = {
      linkedin: { lead: '🚀 ', end: ['💡', '📈', '🤝', '✅'] },
      instagram: { lead: '✨ ', end: ['📸', '💫', '🔥', '🚀'] },
      twitter: { lead: '🔥 ', end: ['🧵', '✅', '📊', '🚀'] },
      facebook: { lead: '👋 ', end: ['💬', '📣', '🎯', '👏'] },
    };
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return { lead: map[p].lead, end: pick(map[p].end) };
  };

  const generateMock = (p: Platform, topic: string, t: Tone) => {
    // temel iskelet + platform pratikleri
    const { lead, end } = sprinkleEmojis(p);
    const bullets = (points: string[]) => points.map((x) => `• ${x}`).join('\n');

    const commonTips = [
      'Net bir CTA ekleyin',
      'Gereksiz jargondan kaçının',
      'Takipçiye değer katın',
    ];

    const platforms: Record<Platform, string> = {
      linkedin: `${lead}${topic}\n\n${tonePreambles[t]}\n${bullets([
        'Sorunu/bağlamı 1-2 cümlede tanımlayın',
        'Somut çıkarımlar ve kısa ipuçları verin',
        'Gerekiyorsa küçük bir istatistik veya örnek ekleyin',
      ])}\n\n${bullets(commonTips)}\n\n${randomizedHashtags('linkedin')} ${end}`,
      instagram: `${lead}${topic} ✨\n\n${bullets([
        'Görsel(ler)inizle uyumlu kısa bir hikâye anlatın',
        '1-2 soru ile etkileşimi tetikleyin',
        'Mini ipucu ya da adım listesi verin',
      ])}\n\n${randomizedHashtags('instagram')} ${end}`,
      twitter: `${lead}${topic}\n\n${bullets([
        'Ana fikri 1 cümlede ver',
        '1-2 pratik ipucu ekle',
        'Soruyla bitir ve etkileşime çağır',
      ])}\n\n${randomizedHashtags('twitter')} ${end}`,
      facebook: `${lead}${topic}\n\n${bullets([
        'Sorunu anlaşılır şekilde özetle',
        'Kısa bir çözüm listesi paylaş',
        'Topluluktan deneyim iste',
      ])}\n\n${randomizedHashtags('facebook')} ${end}`,
    };

    let text = platforms[p];

    // kabaca hedef uzunluk için kısaltma
    if (p === 'twitter' && targetLength > 0) {
      if (text.length > targetLength) text = text.slice(0, targetLength - 1) + '…';
    }

    return applyLengthGuard(text);
  };

  const generateContent = async () => {
    if (!prompt.trim() || !user) return;

    if (user.membershipType !== 'Advanced') {
      alert('Bu özellik sadece Advanced üyelerde mevcuttur.');
      return;
    }

    setLoading(true);

    // demo: AI çağrısı yerine mock üretim
    setTimeout(() => {
      const content = generateMock(platform, prompt.trim(), tone);

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
      setLoading(false);
    }, 850);
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
    setGeneratedContent('');
    setTone('profesyonel');
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
                Hazır Fikirler
              </label>
              <button
                type="button"
                onClick={() => selectPreset(presetIdeas[Math.floor(Math.random() * presetIdeas.length)])}
                className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                disabled={disabled}
              >
                <Wand2 className="h-4 w-4" />
                <span>Rastgele seç</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetIdeas.map((idea) => (
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

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="Örnek: Dijital pazarlama trendleri hakkında bir gönderi"
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
