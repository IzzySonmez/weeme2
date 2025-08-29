import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/database';
import { config } from '../lib/config';
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
  Check,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  Award,
  Activity,
  Eye,
  Users,
  Clock
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
    <div className="mt-6 space-y-4">
      {/* Tab Controls */}
      <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setInstallTab('simple')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
            installTab === 'simple' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
              : 'bg-white hover:bg-gray-50 text-gray-700'
          }`}
        >
          Basit Kurulum
        </button>
        <button
          onClick={() => setInstallTab('enterprise')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
            installTab === 'enterprise' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
              : 'bg-white hover:bg-gray-50 text-gray-700'
          }`}
        >
          Kurumsal Güvenli
        </button>
      </div>

      {/* Tab Content */}
      {installTab === 'simple' ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Hızlı Kurulum</span>
            </div>
            <p className="text-sm text-blue-800">
              Tek satırlık kodu sitenizin <code className="bg-blue-100 px-2 py-1 rounded text-xs">&lt;head&gt;</code> bölümüne ekleyin.
            </p>
          </div>
          
          <div className="relative group">
            <pre className="bg-gray-900 text-gray-100 border border-gray-700 rounded-xl p-4 text-xs overflow-x-auto pr-12 font-mono">
{simpleSnippet}
            </pre>
            <button
              onClick={() => handleCopy(simpleSnippet, 'simple')}
              className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group-hover:opacity-100 opacity-70"
              title="Kopyala"
            >
              {copiedSnippet === 'simple' ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-900">Kurumsal Güvenlik</span>
            </div>
            <p className="text-sm text-orange-800">
              CSP/SRI politikaları için güvenli kurulum. Nonce ve integrity değerlerini güncelleyin.
            </p>
          </div>
          
          <div className="relative group">
            <pre className="bg-gray-900 text-gray-100 border border-gray-700 rounded-xl p-4 text-xs overflow-x-auto pr-12 font-mono">
{enterpriseSnippet}
            </pre>
            <button
              onClick={() => handleCopy(enterpriseSnippet, 'enterprise')}
              className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group-hover:opacity-100 opacity-70"
              title="Kopyala"
            >
              {copiedSnippet === 'enterprise' ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-300" />
              )}
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">Güvenlik Notları:</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
              <li>Nonce değeri server tarafından üretilmeli</li>
              <li>Integrity hash'i sürüm güncellemesinde değişir</li>
              <li>cdn.weeme.ai alan adını CSP allowlist'e ekleyin</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onOpenBilling }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [trackingCodes, setTrackingCodes] = useState<TrackingCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [newWebsite, setNewWebsite] = useState('');
  const [scanFreq, setScanFreq] = useState<ScanFrequency>('weekly');
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({
    totalScans: 0,
    avgScore: 0,
    improvement: 0,
    activeSites: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Calculate stats from reports
  useEffect(() => {
    if (reports.length > 0) {
      const totalScans = reports.length;
      const avgScore = Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length);
      const activeSites = trackingCodes.filter(c => c.isActive).length;
      
      // Calculate improvement (mock calculation)
      const recentReports = reports.slice(0, 5);
      const olderReports = reports.slice(-5);
      const recentAvg = recentReports.reduce((sum, r) => sum + r.score, 0) / recentReports.length;
      const olderAvg = olderReports.reduce((sum, r) => sum + r.score, 0) / olderReports.length;
      const improvement = Math.round(((recentAvg - olderAvg) / olderAvg) * 100) || 0;

      setStats({ totalScans, avgScore, improvement, activeSites });
    }
  }, [reports, trackingCodes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [codes, reports] = await Promise.all([
        db.getTrackingCodes(user.id),
        db.getReports(user.id)
      ]);
      
      setTrackingCodes(codes);
      setReports(reports);
    } catch (error) {
      console.error('Error loading data:', error);
      const savedCodes = localStorage.getItem(`trackingCodes_${user.id}`);
      const savedReports = localStorage.getItem(`reports_${user.id}`);
      
      if (savedCodes) setTrackingCodes(JSON.parse(savedCodes));
      if (savedReports) setReports(JSON.parse(savedReports));
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = async () => {
    if (!newWebsite.trim() || !user) return;

    const normalizedUrl = normalizeUrl(newWebsite.trim());
    const newCode: TrackingCode = {
      id: uuidv4(),
      userId: user.id,
      websiteUrl: normalizedUrl,
      code: `weeme-${user.id}-${Date.now()}`,
      isActive: true,
      scanFrequency: scanFreq,
      lastScan: new Date().toISOString(),
      nextScan: getNextScanDate(scanFreq),
      createdAt: new Date().toISOString()
    };

    const updatedCodes = [...trackingCodes, newCode];
    setTrackingCodes(updatedCodes);
    await db.saveTrackingCode(newCode);
    setNewWebsite('');
  };

  const handleScanNow = async (websiteUrl: string) => {
    if (!user) return;
    
    if (user.membershipType === 'Free' && user.credits <= 0) {
      alert('Kredi bakiyeniz yetersiz. Lütfen kredi satın alın veya üyeliğinizi yükseltin.');
      onOpenBilling?.();
      return;
    }
    
    setIsScanning(true);
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
      
      const response = await fetch(`${base}/api/seo-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.ok && result.report) {
          const newReport: SEOReport = {
            id: uuidv4(),
            userId: user.id,
            websiteUrl: websiteUrl,
            score: result.report.score,
            positives: result.report.positives || [],
            negatives: result.report.negatives || [],
            suggestions: result.report.suggestions || [],
            createdAt: new Date().toISOString(),
            reportData: result.report.reportData || {}
          };
          
          const updatedReports = [newReport, ...reports];
          setReports(updatedReports);
          await db.saveReport(newReport);
          
          if (user.membershipType === 'Free') {
            const { updateCredits } = useAuth();
            updateCredits(user.credits - 1);
          }
          
          alert(`🎉 SEO taraması tamamlandı!\n\n📊 Skor: ${result.report.score}/100\n✅ ${result.report.positives?.length || 0} olumlu nokta\n⚠️ ${result.report.negatives?.length || 0} iyileştirme alanı`);
        } else {
          throw new Error(result.message || 'Tarama başarısız');
        }
      } else {
        const errorText = await response.text();
        console.error('SEO scan failed:', response.status, errorText);
        
        let userMessage = 'Tarama başarısız oldu.';
        if (response.status === 400) userMessage = 'Geçersiz URL formatı. Lütfen doğru URL girin.';
        else if (response.status === 429) userMessage = 'Çok fazla istek. Lütfen biraz bekleyin.';
        else if (response.status >= 500) userMessage = 'Server hatası. Lütfen daha sonra tekrar deneyin.';
        
        throw new Error(userMessage);
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemoveWebsite = (codeId: string) => {
    const updatedCodes = trackingCodes.filter(code => code.id !== codeId);
    setTrackingCodes(updatedCodes);
    db.deleteTrackingCode(codeId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                SEO Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Sitelerinizi takip edin ve performansınızı artırın</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20">
                <div className="text-sm text-gray-600">Son güncelleme</div>
                <div className="font-semibold text-gray-900">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalScans}</div>
              <div className="text-sm text-gray-600">Toplam Tarama</div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.avgScore}</div>
              <div className="text-sm text-gray-600">Ortalama Skor</div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${stats.improvement >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeSites}</div>
              <div className="text-sm text-gray-600">Aktif Site</div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Otomatik İzleme</div>
            </div>
          </div>
        </div>

        {/* Add Website Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Site Ekle & Takip Kodu</h2>
              <p className="text-gray-600">Yeni sitenizi ekleyin ve otomatik tarama başlatın</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <input
                type="url"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarama Sıklığı</label>
              <select
                value={scanFreq}
                onChange={(e) => setScanFreq(e.target.value as ScanFrequency)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="weekly">Haftalık</option>
                <option value="biweekly">İki Haftada Bir</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddWebsite}
                disabled={!newWebsite.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Site Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Codes */}
        {trackingCodes.length > 0 && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <FileCode2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Takip Kodları</h3>
                <p className="text-gray-600">Sitelerinize entegre edilecek kodlar</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {trackingCodes.map((code) => (
                <div key={code.id} className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{code.websiteUrl}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span>Son tarama: {new Date(code.lastScan).toLocaleDateString('tr-TR')}</span>
                          <span>•</span>
                          <span>Sonraki: {new Date(code.nextScan).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleScanNow(code.websiteUrl)}
                        disabled={isScanning || (user?.membershipType === 'Free' && user.credits <= 0)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {isScanning ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <PlayCircle className="h-4 w-4" />
                        )}
                        Şimdi Tara
                      </button>
                      <button
                        onClick={() => handleRemoveWebsite(code.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        title="Siteyi kaldır"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <InstallationPanel trackingCode={code} user={user} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Reports */}
        {reports.length > 0 && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">SEO Raporları</h3>
                <p className="text-gray-600">Detaylı analiz sonuçları ve öneriler</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id}>
                  <CompactReportRow
                    report={report}
                    expanded={expandedReport === report.id}
                    onToggle={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                  />
                  {expandedReport === report.id && (
                    <AISummaryCard report={report} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {reports.length === 0 && trackingCodes.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Globe className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">İlk Sitenizi Ekleyin</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              SEO analizine başlamak için yukarıdan ilk sitenizi ekleyin ve otomatik tarama başlatın
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>3 dakikada kurulum</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Otomatik raporlar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>AI önerileri</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CompactReportRow: React.FC<{
  report: SEOReport;
  expanded: boolean;
  onToggle: () => void;
}> = ({ report, expanded, onToggle }) => (
  <div className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
            report.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 
            report.score >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' : 
            'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}>
            {report.score}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
            {report.score >= 80 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : report.score >= 50 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-lg truncate max-w-md">{report.websiteUrl}</div>
          <div className="text-sm text-gray-500 flex items-center gap-4">
            <span>{new Date(report.createdAt).toLocaleString('tr-TR')}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {report.positives.length} olumlu
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              {report.negatives.length} iyileştirme
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm text-gray-500">SEO Skoru</div>
          <div className={`text-2xl font-bold ${
            report.score >= 80 ? 'text-green-600' : report.score >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {report.score}/100
          </div>
        </div>
        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
          {expanded ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
        </div>
      </div>
    </div>

    {expanded && (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
              <CheckCircle2 className="h-5 w-5" />
              Güçlü Yönler ({report.positives.length})
            </div>
            <ul className="space-y-2">
              {report.positives.slice(0, 4).map((p, i) => (
                <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
              <AlertTriangle className="h-5 w-5" />
              İyileştirme Alanları ({report.negatives.length})
            </div>
            <ul className="space-y-2">
              {report.negatives.slice(0, 4).map((n, i) => (
                <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {report.suggestions.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
              <Sparkles className="h-5 w-5" />
              AI Önerileri ({report.suggestions.length})
            </div>
            <ul className="space-y-2">
              {report.suggestions.slice(0, 5).map((s, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
);

const AISummaryCard: React.FC<{ report: SEOReport }> = ({ report }) => (
  <div className="mt-4 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg">AI Özet & Öncelikli Aksiyonlar</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
        <div className="text-sm font-medium text-gray-600 mb-2">Genel Durum</div>
        <div className="text-lg font-bold text-gray-900">
          {report.score >= 80 ? '🎉 Mükemmel' : report.score >= 50 ? '⚡ Gelişiyor' : '🚀 Potansiyel Yüksek'}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Skorunuz {report.score}/100 - {report.score >= 80 ? 'Harika iş!' : 'İyileştirme fırsatları var'}
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
        <div className="text-sm font-medium text-gray-600 mb-2">İlk Adım</div>
        <div className="text-lg font-bold text-gray-900">
          {report.negatives.length > 0 ? '🎯 Hızlı Kazanımlar' : '✨ Optimizasyon'}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {report.negatives.length > 0 ? 'Önce kritik sorunları çözün' : 'Mevcut başarıları güçlendirin'}
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
        <div className="text-sm font-medium text-gray-600 mb-2">Tahmini Süre</div>
        <div className="text-lg font-bold text-gray-900">
          {report.negatives.length > 5 ? '📅 2-4 Hafta' : '⚡ 1-2 Hafta'}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Önerilen iyileştirmeler için
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;