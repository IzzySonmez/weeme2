import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SEOReport, TrackingCode } from '../types';
import { BarChart3, Globe, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, updateCredits } = useAuth();
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [trackingCode, setTrackingCode] = useState<TrackingCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scanFrequency, setScanFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');

  // Helper function to calculate next scan date
  const getNextScanDate = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        now.setDate(now.getDate() + 7);
    }
    return now.toISOString();
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem(`reports_${user?.id}`);
    const savedTrackingCode = localStorage.getItem(`trackingCode_${user?.id}`);
    if (savedReports) setReports(JSON.parse(savedReports));
    if (savedTrackingCode) setTrackingCode(JSON.parse(savedTrackingCode));
  }, [user?.id]);

  // Automatic scan check
  useEffect(() => {
    if (!trackingCode || !user) return;
    const now = new Date();
    const due = new Date(trackingCode.nextScan);
    if (now >= due) {
      // Check credits for Free users
      if (user.membershipType === 'Free' && user.credits <= 0) return;
      runSEOScan(true); // auto flag
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingCode?.nextScan, user?.membershipType, user?.credits]);

  // SEO scan function with auto parameter and nextScan update
  const runSEOScan = async (auto = false) => {
    if (!trackingCode || !user) return;
    if (!auto && user.membershipType === 'Free' && user.credits <= 0) {
      alert('Krediniz yetersiz! Lütfen kredi satın alın.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const mockReport: SEOReport = {
        id: Date.now().toString(),
        userId: user.id,
        websiteUrl: trackingCode.websiteUrl,
        score: Math.floor(Math.random() * 40) + 60,
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
          // Report data will be added here
        }
      };

      const updatedReports = [mockReport, ...reports];
      setReports(updatedReports);
      localStorage.setItem(`reports_${user.id}`, JSON.stringify(updatedReports));

      // Deduct credits for both auto and manual scans
      if (user.membershipType === 'Free') {
        updateCredits(user.credits - 1);
      }

      // Calculate and save nextScan
      const updatedTC = {
        ...trackingCode,
        lastScan: new Date().toISOString(),
        nextScan: getNextScanDate(trackingCode.scanFrequency)
      };
      setTrackingCode(updatedTC);
      localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updatedTC));

      setLoading(false);
    }, 1200);
  };

  const setupTracking = () => {
    if (!websiteUrl.trim() || !user) return;
    
    const newTrackingCode: TrackingCode = {
      id: Date.now().toString(),
      userId: user.id,
      websiteUrl: websiteUrl.trim(),
      code: `seo-${Date.now()}`,
      isActive: true,
      scanFrequency,
      lastScan: '',
      nextScan: getNextScanDate(scanFrequency)
    };
    
    setTrackingCode(newTrackingCode);
    localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(newTrackingCode));
    setWebsiteUrl('');
  };

  const latestReport = reports[0];

  return (
    <div className="space-y-8">
      {/* Website Setup */}
      {!trackingCode && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="h-6 w-6 text-blue-500 mr-2" />
            Website Kurulumu
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL'nizi girin
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
                <option value="biweekly">İki Haftada Bir</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
            <button
              onClick={setupTracking}
              disabled={!websiteUrl.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Takibi Başlat
            </button>
          </div>
        </div>
      )}

      {/* Current Score */}
      {latestReport && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 text-green-500 mr-2" />
            Mevcut SEO Skoru
          </h2>
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
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Son tarama: {new Date(latestReport.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {trackingCode && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Manuel Tarama</h3>
              <p className="text-sm text-gray-600 mb-4">
                Hemen yeni bir SEO taraması başlatın
              </p>
              <button
                onClick={() => runSEOScan(false)}
                disabled={loading || (user?.membershipType === 'Free' && (user?.credits || 0) <= 0)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Taranıyor...' : 'Tarama Başlat'}
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Sonraki Otomatik Tarama</h3>
              <p className="text-sm text-gray-600 mb-4">
                {new Date(trackingCode.nextScan).toLocaleDateString('tr-TR')}
              </p>
              <div className="flex items-center text-sm text-green-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Otomatik tarama aktif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports Summary */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Son Raporlar</h2>
          <div className="space-y-4">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    report.score >= 80 ? 'bg-green-100 text-green-600' :
                    report.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <span className="font-semibold">{report.score}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.websiteUrl}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{report.positives.length} güçlü</span>
                  </div>
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{report.negatives.length} zayıf</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!trackingCode && reports.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">SEO yolculuğunuza başlayın</h3>
          <p className="text-gray-600">
            Website'nizi ekleyerek ilk SEO analizinizi yapın ve skorunuzu öğrenin.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;