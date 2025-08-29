import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/database';
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

const Dashboard: React.FC<DashboardProps> = ({ onOpenBilling }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [trackingCodes, setTrackingCodes] = useState<TrackingCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [newWebsite, setNewWebsite] = useState('');
  const [scanFreq, setScanFreq] = useState<ScanFrequency>('weekly');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load from database (hybrid localStorage + Supabase)
      const [codes, reports] = await Promise.all([
        db.getTrackingCodes(user.id),
        db.getReports(user.id)
      ]);
      
      setTrackingCodes(codes);
      setReports(reports);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to localStorage if database fails
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
      nextScan: getNextScanDate(scanFreq)
    };

    const updatedCodes = [...trackingCodes, newCode];
    setTrackingCodes(updatedCodes);
    // Save to database
    await db.saveTrackingCode(newCode);
    setNewWebsite('');
  };

  const handleScanNow = async (websiteUrl: string) => {
    if (!user) return;
    
    // Check credits for Free users
    if (user.membershipType === 'Free' && user.credits <= 0) {
      alert('Kredi bakiyeniz yetersiz. Lütfen kredi satın alın veya üyeliğinizi yükseltin.');
      onOpenBilling?.();
      return;
    }
    
    console.log('[DEBUG] Starting SEO scan for:', websiteUrl);
    setIsScanning(true);
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
      console.log('[DEBUG] API base URL:', base);
      
      const response = await fetch(`${base}/api/seo-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      });

      console.log('[DEBUG] SEO scan response:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('[SUCCESS] SEO scan completed:', {
          score: result.report?.score,
          positives: result.report?.positives?.length,
          negatives: result.report?.negatives?.length
        });
        
        if (result.ok && result.report) {
          // Create new report with proper structure
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
          // Save to database
          await db.saveReport(newReport);
          
          // Deduct credit for Free users
          if (user.membershipType === 'Free') {
            const { updateCredits } = useAuth();
            updateCredits(user.credits - 1);
            console.log('[INFO] Credit deducted, remaining:', user.credits - 1);
          }
          
          alert(`🎉 SEO taraması tamamlandı!\n\n📊 Skor: ${result.report.score}/100\n✅ ${result.report.positives?.length || 0} olumlu nokta\n⚠️ ${result.report.negatives?.length || 0} iyileştirme alanı`);
        } else {
          throw new Error(result.message || 'Tarama başarısız');
        }
      } else {
        const errorText = await response.text();
        console.error('[ERROR] SEO scan failed:', response.status, errorText);
        
        let userMessage = 'Tarama başarısız oldu.';
        if (response.status === 400) userMessage = 'Geçersiz URL formatı. Lütfen doğru URL girin.';
        else if (response.status === 429) userMessage = 'Çok fazla istek. Lütfen biraz bekleyin.';
        else if (response.status >= 500) userMessage = 'Server hatası. Lütfen daha sonra tekrar deneyin.';
        
        throw new Error(userMessage);
      }
    } catch (error) {
      console.error('[ERROR] Scan error:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemoveWebsite = (codeId: string) => {
    const updatedCodes = trackingCodes.filter(code => code.id !== codeId);
    setTrackingCodes(updatedCodes);
    // Delete from database
    db.deleteTrackingCode(codeId);
  };

  const loadReports = () => {
    if (!user) return;
    const saved = localStorage.getItem(`reports_${user.id}`);
    if (saved) {
      try {
        const updatedReports = JSON.parse(saved);
        setReports(updatedReports);
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Dashboard</h1>
        <p className="text-gray-600">Sitelerinizi takip edin ve SEO performansınızı artırın</p>
      </div>

      {/* Add Website Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-600" />
          Site Doğrulama ve Takip Kodu
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <input
            type="url"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            placeholder="https://example.com"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <select
            value={scanFreq}
            onChange={(e) => setScanFreq(e.target.value as ScanFrequency)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="weekly">Haftalık Tarama</option>
            <option value="biweekly">İki Haftada Bir</option>
            <option value="monthly">Aylık Tarama</option>
          </select>
          <button
            onClick={handleAddWebsite}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Site Ekle
          </button>
        </div>
      </div>

      {/* Tracking Codes */}
      {trackingCodes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-purple-600" />
            Takip Kodları
          </h3>
          
          {trackingCodes.map((code) => (
            <div key={code.id} className="border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900">{code.websiteUrl}</div>
                  <div className="text-sm text-gray-500">
                    Son tarama: {new Date(code.lastScan).toLocaleDateString('tr-TR')} | 
                    Sonraki: {new Date(code.nextScan).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleScanNow(code.websiteUrl)}
                      disabled={isScanning || (user?.membershipType === 'Free' && user.credits <= 0)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Siteyi kaldır"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <InstallationPanel trackingCode={code} user={user} />
            </div>
          ))}
        </div>
      )}

      {/* SEO Reports */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            SEO Raporları
          </h3>
          
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
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz site eklenmemiş</h3>
          <p className="text-gray-600">İlk sitenizi ekleyerek SEO analizine başlayın</p>
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
          report.score >= 80 ? 'Mükemmel' : report.score >= 50 ? 'Orta' : 'Geliştirilmeli'
        }
      </div>
    </div>
  </div>
);

export default Dashboard; 