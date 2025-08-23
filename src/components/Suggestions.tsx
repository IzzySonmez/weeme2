import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SEOReport } from '../types';
import { Lightbulb, Send, Loader, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const Suggestions: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedReports = localStorage.getItem(`reports_${user?.id}`);
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, [user?.id]);

  const latestReport = reports[0];

  const handleAIPrompt = async () => {
    if (!prompt.trim() || !user) return;

    if (user.membershipType === 'Free') {
      alert('Bu özellik Pro ve Advanced üyelerde mevcuttur.');
      return;
    }

    setLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const mockResponses = [
        `${prompt} için önerilerim:\n\n1. Meta etiketlerinizi optimize edin\n2. İçerik kalitesini artırın\n3. Sayfa hızını iyileştirin\n4. Mobil uyumluluğu kontrol edin\n5. İç bağlantı yapısını güçlendirin`,
        `SEO optimizasyonu için:\n\n• Anahtar kelime yoğunluğunu %2-3 arasında tutun\n• H1-H6 etiketlerini doğru sırayla kullanın\n• Alt etiketlerini tüm görsellerde kullanın\n• Schema markup ekleyin\n• Sosyal medya entegrasyonu yapın`,
        `İçerik stratejiniz için:\n\n- Uzun kuyruk anahtar kelimelere odaklanın\n- Kullanıcı deneyimini ön planda tutun\n- Düzenli içerik güncellemeleri yapın\n- Rakip analizi gerçekleştirin\n- Backlink stratejisi geliştirin`
      ];
      
      setAiResponse(mockResponses[Math.floor(Math.random() * mockResponses.length)]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Latest Report Suggestions */}
      {latestReport && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" />
            SEO Önerileri
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Positive Points */}
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

            {/* Improvement Areas */}
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

          {/* Detailed Suggestions */}
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

      {/* AI Assistant */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Sparkles className="h-6 w-6 text-purple-500 mr-2" />
          Yapay Zeka SEO Asistanı
        </h2>

        {user?.membershipType === 'Free' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Bu özellik Pro ve Advanced üyelerde mevcuttur. Üyeliğinizi yükseltin.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO sorunuz veya ihtiyacınız nedir?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örnek: Meta etiketlerimi nasıl optimize edebilirim?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={user?.membershipType === 'Free'}
            />
          </div>

          <button
            onClick={handleAIPrompt}
            disabled={loading || !prompt.trim() || user?.membershipType === 'Free'}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{loading ? 'Analiz ediliyor...' : 'Önerileri Al'}</span>
          </button>

          {aiResponse && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-2">AI Önerileri:</h4>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No Reports */}
      {!latestReport && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz rapor yok</h3>
          <p className="text-gray-600">
            Öneriler görmek için önce bir SEO taraması yapın.
          </p>
        </div>
      )}
    </div>
  );
};

export default Suggestions;