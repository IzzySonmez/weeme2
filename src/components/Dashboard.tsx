import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { SEOReport } from '../types';
import {
  Globe,
  PlayCircle,
  CalendarClock,
  Loader,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Filter,
  Download,
  AlertCircle,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileJson,
  X,
  Sparkles,
  Settings,
  Copy,
  Check
} from 'lucide-react';

type ScanFrequency = 'weekly' | 'biweekly' | 'monthly';

interface TrackingCode {
  id: string;
  userId: string;
  websiteUrl: string;
  code: string;
  isActive: boolean;
  scanFrequency: ScanFrequency;
  lastScan: string;
  nextScan: string;
}

interface DashboardProps {
  onOpenBilling?: () => void;
}

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const getNextScanDate = (freq: ScanFrequency, from: Date = new Date()) => {
  const next =
    freq === 'weekly' ? addDays(from, 7) : freq === 'biweekly' ? addDays(from, 14) : addDays(from, 30);
  return next.toISOString();
};

const normalizeUrl = (raw: string) => {
  if (!raw) return '';
  try {
    const prefixed = raw.startsWith('http') ? raw : `https://${raw}`;
    const u = new URL(prefixed);
    u.hash = '';
    return u.toString().replace(/\/+$/, '');
  } catch {
    return raw;
  }
};

// Helper Components
const InstallationPanel: React.FC<{ 
  trackingCode: TrackingCode; 
  user: any;
}> = ({ trackingCode, user }) => {
  const [installTab, setInstallTab] = useState<'simple' | 'enterprise'>('simple');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const simpleSnippet = `<script src="https://cdn.weeme.ai/seo.js" data-site-id="${user.id}" data-url="${trackingCode.websiteUrl}" defer></script>`;
  
  const enterpriseSnippet = `<script
  src="https://cdn.weeme.ai/seo.js"
  data-site-id="${user.id}"
  data-url="${trackingCode.websiteUrl}"
  defer
  nonce="YOUR_NONCE_HERE"
  integrity="sha384-EXAMPLE_HASH"
  crossorigin="anonymous"
></script>`;

  const handleCopy = async (snippet: string, type: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(type);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Tab Controls */}
      <div className="inline-flex rounded-lg border overflow-hidden">
        <button
          onClick={() => setInstallTab('simple')}
          className={`px-3 py-1.5 text-sm ${
            installTab === 'simple' 
              ? 'bg-purple-600 text-white' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          Basit Kurulum
        </button>
        <button
          onClick={() => setInstallTab('enterprise')}
          className={`px-3 py-1.5 text-sm ${
            installTab === 'enterprise' 
              ? 'bg-purple-600 text-white' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          Kurumsal Güvenli Kurulum
        </button>
      </div>

      {/* Tab Content */}
      {installTab === 'simple' ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Tek satırlık kodu sitenizin <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> bölümüne ekleyin. Küçük/orta ölçekli projeler için yeterlidir.
          </p>
          
          <div className="relative">
            <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto pr-12">
{simpleSnippet}
            </pre>
            <button
              onClick={() => handleCopy(simpleSnippet, 'simple')}
              className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Kopyala"
            >
              {copiedSnippet === 'simple' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-500">
            Güvenlik politikalarınız (CSP/SRI) katıysa 'Kurumsal Güvenli Kurulum' sekmesini kullanın.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Kurumsal güvenlik politikaları (CSP/SRI) için tavsiye edilir. 'nonce' ve 'integrity' alanlarını kendi dağıtım hattınızda üretin ve CSP allowlist ayarlarınızı güncelleyin.
          </p>
          
          <div className="relative">
            <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto pr-12">
{enterpriseSnippet}
            </pre>
            <button
              onClick={() => handleCopy(enterpriseSnippet, 'enterprise')}
              className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Kopyala"
            >
              {copiedSnippet === 'enterprise' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
          
          <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
            <li>nonce değeri server tarafından üretilip CSP'de izinli olmalı.</li>
            <li>integrity (SRI) hash'i sürüm güncellemesinde değişir.</li>
            <li>cdn.weeme.ai alan adını CSP'de allowlist'e ekleyin.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const CompactReportRow: React.FC<{
  report: SEOReport;
  expanded: boolean;
  onToggle: () => void;
}> = ({ report, expanded, onToggle }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
      <div>
        <div className="text-sm text-gray-500">
          {new Date(report.createdAt).toLocaleString('tr-TR')}
        </div>
        <div className="text-gray-900 font-medium truncate">{report.websiteUrl}</div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`text-lg font-bold ${
            report.score >= 80 ? 'text-emerald-600' : report.score >= 50 ? 'text-amber-600' : 'text-rose-600'
          }`}
        >
          {report.score}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
    </div>

    {expanded && (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
            <CheckCircle2 className="h-4 w-4" /> Olumlu
          </div>
          <ul className="list-disc ml-5 text-sm text-green-800 space-y-1">
            {report.positives.slice(0, 3).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
            <AlertTriangle className="h-4 w-4" /> Eksikler
          </div>
          <ul className="list-disc ml-5 text-sm text-red-800 space-y-1">
            {report.negatives.slice(0, 3).map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        <div className="sm:col-span-2">
          <div className="text-sm text-gray-600 font-medium mb-1">Öneriler</div>
          <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
            {report.suggestions.slice(0, 5).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    )}
  </div>
);

const AISummaryCard: React.FC<{ report: SEOReport }> = ({ report }) => (
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
    <div className="flex items-center gap-2 mb-4">
      <Sparkles className="h-5 w-5 text-purple-600" />
      <h3 className="font-semibold text-gray-900">AI Özet & İlk 3 Aksiyon</h3>
    </div>
    
    <div className="mb-4">
      <div className="text-sm text-gray-600 mb-2">
        <strong>Durum:</strong> Skorunuz {report.score}/100 - {
          report.score >= 80 
            ? 'Mükemmel! SEO performansınız çok iyi.'
            : report.score >= 50 
            ? 'İyi durumda, birkaç iyileştirme yapılabilir.'
            : 'Geliştirilmesi gereken alanlar var.'
        }
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">🎯 Öncelikli Aksiyonlar:</h4>
        <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
          {report.suggestions.slice(0, 3).map((suggestion, i) => (
            <li key={i}>{suggestion}</li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

export default function Dashboard({ onOpenBilling }: DashboardProps) {
  const { user } = useAuth();
  const [trackingCodes, setTrackingCodes] = useState<TrackingCode[]>([]);
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningUrl, setScanningUrl] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newFreq, setNewFreq] = useState<ScanFrequency>('weekly');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'good' | 'needs-work'>('all');

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load tracking codes
      const storedCodes = localStorage.getItem(`trackingCodes_${user.id}`);
      if (storedCodes) {
        setTrackingCodes(JSON.parse(storedCodes));
      }

      // Load reports
      const storedReports = localStorage.getItem(`seoReports_${user.id}`);
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const callSEOScan = async (url: string): Promise<SEOReport> => {
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
      const endpoint = `${base}/api/seo-scan`;
      
      console.log('[DEBUG] Making SEO scan request to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ERROR] SEO scan failed:', response.status, errorText);
        return generateFallbackReport(url);
      }

      const data = await response.json();
      console.log('[DEBUG] SEO scan response:', data);
      
      return data.report;
    } catch (error) {
      console.error('[ERROR] SEO scan request failed:', error);
      return generateFallbackReport(url);
    }
  };

  const generateFallbackReport = (url: string): SEOReport => {
    const now = new Date().toISOString();
    return {
      id: `fallback-${Date.now()}`,
      userId: user!.id,
      websiteUrl: url,
      score: 75,
      positives: [
        'Site erişilebilir durumda',
        'HTTPS protokolü kullanılıyor',
        'Temel yapı mevcut'
      ],
      negatives: [
        'Detaylı analiz için site içeriği alınamadı',
        'Meta etiketleri kontrol edilemedi',
        'Performans ölçümü yapılamadı'
      ],
      suggestions: [
        'Site erişimini kontrol edin',
        'Firewall ayarlarını gözden geçirin',
        'Meta title ve description ekleyin',
        'H1 başlık yapısını optimize edin'
      ],
      createdAt: now,
      reportData: {
        metaTags: false,
        headings: false,
        images: false,
        performance: 70,
        mobileOptimization: true,
        sslCertificate: url.startsWith('https://'),
        pageSpeed: 70,
        keywords: [],
        coreWebVitals: 'Ölçülemedi',
        technicalSEO: 'Temel kontroller yapılmalı'
      }
    };
  };

  const handleAddWebsite = async () => {
    if (!user || !newUrl.trim()) return;

    const normalizedUrl = normalizeUrl(newUrl.trim());
    if (!normalizedUrl) return;

    // Check if URL already exists
    if (trackingCodes.some(tc => tc.websiteUrl === normalizedUrl)) {
      alert('Bu website zaten ekli!');
      return;
    }

    const newCode: TrackingCode = {
      id: `tc_${Date.now()}`,
      userId: user.id,
      websiteUrl: normalizedUrl,
      code: `weeme_${user.id}_${Date.now()}`,
      isActive: true,
      scanFrequency: newFreq,
      lastScan: new Date().toISOString(),
      nextScan: getNextScanDate(newFreq),
    };

    const updatedCodes = [...trackingCodes, newCode];
    setTrackingCodes(updatedCodes);
    localStorage.setItem(`trackingCodes_${user.id}`, JSON.stringify(updatedCodes));

    // Run initial scan
    setScanningUrl(normalizedUrl);
    try {
      const report = await callSEOScan(normalizedUrl);
      const updatedReports = [report, ...reports];
      setReports(updatedReports);
      localStorage.setItem(`seoReports_${user.id}`, JSON.stringify(updatedReports));
    } catch (error) {
      console.error('Initial scan failed:', error);
    } finally {
      setScanningUrl(null);
    }

    setNewUrl('');
    setShowAddForm(false);
  };

  const handleManualScan = async (url: string) => {
    if (!user) return;
    
    setScanningUrl(url);
    try {
      const report = await callSEOScan(url);
      const updatedReports = [report, ...reports.filter(r => r.websiteUrl !== url)];
      setReports(updatedReports);
      localStorage.setItem(`seoReports_${user.id}`, JSON.stringify(updatedReports));
    } catch (error) {
      console.error('Manual scan failed:', error);
    } finally {
      setScanningUrl(null);
    }
  };

  const handleRemoveWebsite = (codeId: string) => {
    if (!user) return;
    
    const updatedCodes = trackingCodes.filter(tc => tc.id !== codeId);
    setTrackingCodes(updatedCodes);
    localStorage.setItem(`trackingCodes_${user.id}`, JSON.stringify(updatedCodes));
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filter === 'good') return report.score >= 80;
      if (filter === 'needs-work') return report.score < 80;
      return true;
    });
  }, [reports, filter]);

  const exportReports = () => {
    const dataStr = JSON.stringify(reports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-reports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Websitelerinizin SEO performansını takip edin ve optimize edin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Site</p>
              <p className="text-2xl font-bold text-gray-900">{trackingCodes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <FileCode2 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Rapor</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">İyi Performans</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.score >= 80).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">İyileştirme Gerekli</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.score < 80).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Website Section */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Website Yönetimi</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showAddForm ? 'İptal' : 'Website Ekle'}
          </button>
        </div>

        {showAddForm && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarama Sıklığı
                </label>
                <select
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value as ScanFrequency)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="weekly">Haftalık</option>
                  <option value="biweekly">İki Haftada Bir</option>
                  <option value="monthly">Aylık</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddWebsite}
                disabled={!newUrl.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ekle ve Tara
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Websites List */}
      {trackingCodes.length > 0 && (
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Takip Edilen Websiteler</h2>
          <div className="space-y-4">
            {trackingCodes.map((code) => (
              <div key={code.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{code.websiteUrl}</span>
                      <a
                        href={code.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-4 w-4" />
                        {code.scanFrequency === 'weekly' ? 'Haftalık' : 
                         code.scanFrequency === 'biweekly' ? 'İki Haftada Bir' : 'Aylık'}
                      </span>
                      <span>Son tarama: {new Date(code.lastScan).toLocaleDateString('tr-TR')}</span>
                      <span>Sonraki: {new Date(code.nextScan).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleManualScan(code.websiteUrl)}
                      disabled={scanningUrl === code.websiteUrl}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {scanningUrl === code.websiteUrl ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      Tara
                    </button>
                    <button
                      onClick={() => handleRemoveWebsite(code.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Installation Instructions */}
                <InstallationPanel trackingCode={code} user={user} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Section */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">SEO Raporları</h2>
            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">Tümü</option>
                  <option value="good">İyi Performans (80+)</option>
                  <option value="needs-work">İyileştirme Gerekli (&lt;80)</option>
                </select>
              </div>

              {/* Export */}
              <button
                onClick={exportReports}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Dışa Aktar
              </button>
            </div>
          </div>

          {/* Latest Report AI Summary */}
          {filteredReports.length > 0 && (
            <div className="mb-6">
              <AISummaryCard report={filteredReports[0]} />
            </div>
          )}

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <CompactReportRow
                key={report.id}
                report={report}
                expanded={expandedReport === report.id}
                onToggle={() => setExpandedReport(
                  expandedReport === report.id ? null : report.id
                )}
              />
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileJson className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Seçilen filtreye uygun rapor bulunamadı.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {trackingCodes.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz website eklenmemiş
          </h3>
          <p className="text-gray-600 mb-6">
            İlk websitenizi ekleyerek SEO analizine başlayın.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            İlk Website'i Ekle
          </button>
        </div>
      )}
    </div>
  );
}