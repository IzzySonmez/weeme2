import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AIContent as AIContentType } from '../types';
import { Sparkles, Send, Loader, Instagram, Linkedin, Twitter, Facebook, Copy, Check } from 'lucide-react';

const AIContent: React.FC = () => {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<'linkedin' | 'instagram' | 'twitter' | 'facebook'>('linkedin');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentHistory, setContentHistory] = useState<AIContentType[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const savedContent = localStorage.getItem(`aiContent_${user?.id}`);
    if (savedContent) {
      setContentHistory(JSON.parse(savedContent));
    }
  }, [user?.id]);

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
    twitter: 'Twitter',
    facebook: 'Facebook',
  };

  const generateContent = async () => {
    if (!prompt.trim() || !user) return;

    if (user.membershipType !== 'Advanced') {
      alert('Bu özellik sadece Advanced üyelerde mevcuttur.');
      return;
    }

    setLoading(true);

    // Simulate AI content generation
    setTimeout(() => {
      const mockContent = {
        linkedin: `🚀 ${prompt}

Bu konuda uzmanlaşmak için:
✅ Sürekli öğrenmeye odaklanın
✅ Sektör trendlerini takip edin
✅ Network'ünüzü genişletin
✅ Deneyimlerinizi paylaşın

#profesyonelgelisim #linkedin #kariyer`,

        instagram: `✨ ${prompt} ✨

📸 Görsel hikayenizi anlatın
💫 Takipçilerinizle etkileşim kurun
🎯 Hedef kitlenizi tanıyın
📈 Analitiklerinizi takip edin

#instagram #sosyalmedya #içerik #pazarlama`,

        twitter: `🔥 ${prompt}

Kısa ve öz:
• Ana fikrinizi vurgulayın
• Hashtag'leri akıllıca kullanın
• Etkileşimi teşvik edin

#twitter #sosyalmedya #pazarlama`,

        facebook: `👋 ${prompt}

Facebook'ta başarı için:
🎯 Hedef kitlenizi belirleyin
📊 İçerik performansını ölçün
💬 Yorumlara yanıt verin
📅 Düzenli paylaşım yapın

Sizin deneyimleriniz neler? Yorumlarda paylaşın! 👇

#facebook #sosyalmedya #topluluk`
      };

      const content = mockContent[platform];
      setGeneratedContent(content);

      // Save to history
      const newContent: AIContentType = {
        id: Date.now().toString(),
        userId: user.id,
        platform,
        prompt,
        content,
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [newContent, ...contentHistory];
      setContentHistory(updatedHistory);
      localStorage.setItem(`aiContent_${user.id}`, JSON.stringify(updatedHistory));

      setLoading(false);
    }, 2000);
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Content Generator */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Sparkles className="h-6 w-6 text-purple-500 mr-2" />
          Yapay Zeka İçerik Üreticisi
        </h2>

        {user?.membershipType !== 'Advanced' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Bu özellik sadece Advanced üyelerde mevcuttur. Üyeliğinizi yükseltin.
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
                  onClick={() => setPlatform(key as any)}
                  disabled={user?.membershipType !== 'Advanced'}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                    platform === key
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

          {/* Content Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçerik konunuzu yazın
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örnek: Dijital pazarlama trendleri hakkında bir gönderi"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              disabled={user?.membershipType !== 'Advanced'}
            />
          </div>

          <button
            onClick={generateContent}
            disabled={loading || !prompt.trim() || user?.membershipType !== 'Advanced'}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span>{loading ? 'İçerik üretiliyor...' : 'İçerik Üret'}</span>
          </button>

          {/* Generated Content */}
          {generatedContent && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  {React.createElement(platformIcons[platform], { className: "h-5 w-5 mr-2" })}
                  {platformNames[platform]} İçeriği
                </h4>
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
              <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded border">
                {generatedContent}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content History */}
      {contentHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">İçerik Geçmişi</h2>
          <div className="space-y-4">
            {contentHistory.slice(0, 10).map((content) => {
              const Icon = platformIcons[content.platform];
              return (
                <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {platformNames[content.platform]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(content.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
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
        </div>
      )}

      {/* No Content */}
      {contentHistory.length === 0 && user?.membershipType === 'Advanced' && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz içerik üretilmedi</h3>
          <p className="text-gray-600">
            İlk sosyal medya içeriğinizi oluşturmak için yukarıdaki formu kullanın.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIContent;