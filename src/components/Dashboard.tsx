import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SEOReport, TrackingCode } from '../types';
import { BarChart3, Globe, Calendar, TrendingUp, AlertCircle, CheckCircle, Play, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [trackingCode, setTrackingCode] = useState<TrackingCode | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scanFrequency, setScanFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    // Load existing reports and tracking code from localStorage
    const savedReports = localStorage.getItem(`reports_${user?.id}`);
    const savedTrackingCode = localStorage.getItem(`trackingCode_${user?.id}`);
    
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
    if (savedTrackingCode) {
      setTrackingCode(JSON.parse(savedTrackingCode));
    }
  }, [user?.id]);

  const generateTrackingCode = () => {
    if (!websiteUrl) return;

    const code = `<!-- SEO Optimizer Tracking Code -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://seo-optimizer.com/track.js';
    script.setAttribute('data-site-id', '${user?.id}');
    script.setAttribute('data-url', '${websiteUrl}');
    document.head.appendChild(script);
  })();
</script>`;

    const newTrackingCode: TrackingCode = {
      id: Date.now().toString(),
      userId: user?.id || '',
      websiteUrl,
      code,
      isActive: true,
      scanFrequency,
      lastScan: new Date().toISOString(),
      nextScan: getNextScanDate(scanFrequency),
    };

    setTrackingCode(newTrackingCode);
    localStorage.setItem(`trackingCode_${user?.id}`, JSON.stringify(newTrackingCode));
  };

  const getNextScanDate = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'biweekly':
        now.setDate(now.getDate() + 14);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString();
  };

  const runSEOScan = async () => {
    if (!trackingCode || !user) return;
    
    if (user.membershipType === 'Free' && user.credits <= 0) {
      alert('Krediniz yetersiz! Lütfen kredi satın alın.');
      return;
    }

    setLoading(true);

    // Simulate SEO scan
    setTimeout(() => {
      const mockReport: SEOReport = {
        id: Date.now().toString(),
        userId: user.id,
        websiteUrl: trackingCode.websiteUrl,
        score: Math.floor(Math.random() * 40) + 60, // 60-100 arası
        positives: [
          'Meta title ve description mevcut',
          'SSL sertifikası aktif',
          'Mobil uyumlu tasarım',
          'Hızlı sayfa yükleme süresi',
          'Alt etiketleri kullanılmış'
        ],
        negatives: [
          'H1 etiketi eksik',
          'Sitemap bulunamadı',
          'Sosyal medya meta etiketleri eksik',
          'İç bağlantı yapısı zayıf'
        ],
        suggestions: [
          'Ana sayfaya H1 etiketi ekleyin',
          'XML sitemap oluşturun ve Google Search Console\'a gönderin',
          'Open Graph ve Twitter Card meta etiketlerini ekleyin',
          'İç sayfa bağlantılarını güçlendirin',
          'Görsel optimizasyonu yapın'
        ],
        createdAt: new Date().toISOString(),
        reportData: {
          metaTags: true,
          headings: false,
          images: true,
          performance: 85,
          mobileOptimization: true,
          sslCertificate: true,
          pageSpeed: 78,
          keywords: ['seo', 'optimizasyon', 'web', 'site']
        }
      };

      const updatedReports = [mockReport, ...reports];
      setReports(updatedReports);
      localStorage.setItem(`reports_${user.id}`, JSON.stringify(updatedReports));

      // Update credits for Free users
      if (user.membershipType === 'Free') {
        updateCredits(user.credits - 1);
      }

      setLoading(false);
    }, 3000);
  };

  const filteredReports = reports.filter(report => {
    const reportDate = new Date(report.createdAt);
    return reportDate.getFullYear() === selectedYear && 
           reportDate.getMonth() + 1 === selectedMonth;
  });

  const latestReport = reports[0];

  return (
    <div className="space-y-8">
      {/* Website Setup */}
      {!trackingCode && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Website Kurulumu</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL'si
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarama Sıklığı
              </label>
              <select
                value={scanFrequency}
                onChange={(e) => setScanFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Haftalık</option>
                <option value="biweekly">2 Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
            <button
              onClick={generateTrackingCode}
              disabled={!websiteUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Takip Kodu Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Tracking Code Display */}
      {trackingCode && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Takip Kodu</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Sonraki tarama: {new Date(trackingCode.nextScan).toLocaleDateString('tr-TR')}
              </span>
              <button
                onClick={runSEOScan}
                disabled={loading || (user?.membershipType === 'Free' && user.credits <= 0)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>{loading ? 'Taranıyor...' : 'Manuel Tarama'}</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600 mb-2">
              Bu kodu web sitenizin &lt;head&gt; bölümüne ekleyin:
            </p>
            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
              {trackingCode.code}
            </pre>
          </div>
        </div>
      )}

      {/* Latest Score */}
      {latestReport && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Son SEO Skoru</h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {[2024, 2023, 2022].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleDateString('tr-TR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={latestReport.score >= 80 ? "#10b981" : latestReport.score >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(latestReport.score / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{latestReport.score}</span>
                </div>
              </div>
            </div>

            {/* Positives */}
            <div>
              <h3 className="text-lg font-medium text-green-600 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Olumlu Yönler
              </h3>
              <ul className="space-y-2">
                {latestReport.positives.slice(0, 3).map((positive, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {positive}
                  </li>
                ))}
              </ul>
            </div>

            {/* Negatives */}
            <div>
              <h3 className="text-lg font-medium text-red-600 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                İyileştirme Alanları
              </h3>
              <ul className="space-y-2">
                {latestReport.negatives.slice(0, 3).map((negative, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    {negative}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Reports History */}
      {filteredReports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rapor Geçmişi</h2>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                      report.score >= 80 ? 'bg-green-500' : report.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {report.score}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{report.websiteUrl}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">
                      {report.positives.length} Olumlu
                    </span>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">
                      {report.negatives.length} İyileştirme
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Reports */}
      {reports.length === 0 && trackingCode && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz rapor yok</h3>
          <p className="text-gray-600 mb-4">
            İlk SEO raporunuzu oluşturmak için manuel tarama başlatın.
          </p>
          <button
            onClick={runSEOScan}
            disabled={loading || (user?.membershipType === 'Free' && user.credits <= 0)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Taranıyor...' : 'İlk Taramayı Başlat'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;