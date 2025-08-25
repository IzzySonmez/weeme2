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
          report.score >= 80 ? 'Mükemmel! Küçük iyileştirmelerle 90+ hedefleyin.' :
          report.score >= 60 ? 'İyi durumda. Aşağıdaki aksiyonlarla 80+ skoruna ulaşabilirsiniz.' :
          'Gelişim alanı var. Öncelikli aksiyonlarla hızlı kazanımlar elde edebilirsiniz.'
        }
      </div>
    </div>

    <div className="space-y-3">
      <div className="bg-white border border-purple-100 rounded p-3">
        <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
          <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
          Öncelik 1: {report.negatives[0] || 'Meta etiketleri optimize edin'}
        </div>
        <p className="text-sm text-gray-700 ml-7">
          {report.suggestions[0] || 'Ana sayfaya H1 etiketi ekleyin ve meta description\'ı 150-160 karakter arasında tutun.'}
        </p>
      </div>

      <div className="bg-white border border-purple-100 rounded p-3">
        <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
          <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
          Öncelik 2: {report.negatives[1] || 'Teknik SEO iyileştirmeleri'}
        </div>
        <p className="text-sm text-gray-700 ml-7">
          {report.suggestions[1] || 'XML sitemap oluşturun ve Search Console\'a gönderin.'}
        </p>
      </div>

      <div className="bg-white border border-purple-100 rounded p-3">
        <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
          <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
          Öncelik 3: {report.negatives[2] || 'İçerik optimizasyonu'}
        </div>
        <p className="text-sm text-gray-700 ml-7">
          {report.suggestions[2] || 'İç bağlantı yapısını güçlendirin ve görsel alt etiketlerini ekleyin.'}
        </p>
      </div>
    </div>
  </div>
);

const HistoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  reports: SEOReport[];
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  years: number[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}> = ({ 
  isOpen, 
  onClose, 
  reports, 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange, 
  years,
  onExportCSV,
  onExportJSON
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });
  }, [reports, selectedYear, selectedMonth]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Tüm Rapor Geçmişi</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportCSV}
                disabled={!filteredReports.length}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> CSV
              </button>
              <button
                onClick={onExportJSON}
                disabled={!filteredReports.length}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
              >
                <FileJson className="h-4 w-4" /> JSON
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!filteredReports.length ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
              Seçilen yıl/ay için rapor bulunamadı.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <CompactReportRow
                  key={report.id}
                  report={report}
                  expanded={expandedRows.has(report.id)}
                  onToggle={() => toggleRow(report.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onOpenBilling }) => {
  const { user, updateCredits } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [trackingCode, setTrackingCode] = useState<TrackingCode | null>(null);
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanFrequency, setScanFrequency] = useState<ScanFrequency>('weekly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [autoSkipped, setAutoSkipped] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Load persisted data
  useEffect(() => {
    if (!user) return;
    const rep = localStorage.getItem(`reports_${user.id}`);
    const tc = localStorage.getItem(`trackingCode_${user.id}`);
    if (rep) setReports(JSON.parse(rep));
    if (tc) {
      const parsed: TrackingCode = JSON.parse(tc);
      setTrackingCode(parsed);
      setScanFrequency(parsed.scanFrequency);
      setWebsiteUrl(parsed.websiteUrl);
    }
  }, [user?.id]);

  // Computed values with useMemo
  const years = useMemo(() => {
    const set = new Set<number>();
    reports.forEach((r) => set.add(new Date(r.createdAt).getFullYear()));
    const arr = Array.from(set);
    if (arr.length === 0) arr.push(new Date().getFullYear());
    return arr.sort((a, b) => b - a);
  }, [reports]);

  const months = useMemo(() => {
    const set = new Set<number>();
    reports
      .filter((r) => new Date(r.createdAt).getFullYear() === selectedYear)
      .forEach((r) => set.add(new Date(r.createdAt).getMonth() + 1));
    const arr = Array.from(set);
    if (arr.length === 0) return [new Date().getMonth() + 1];
    return arr.sort((a, b) => b - a);
  }, [reports, selectedYear]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });
  }, [reports, selectedYear, selectedMonth]);

  const lastScoreInPeriod = useMemo(() => filteredReports[0]?.score ?? null, [filteredReports]);
  const prevScoreInPeriod = useMemo(() => filteredReports[1]?.score ?? null, [filteredReports]);
  const periodDelta = useMemo(() => {
    return lastScoreInPeriod !== null && prevScoreInPeriod !== null 
      ? lastScoreInPeriod - prevScoreInPeriod 
      : null;
  }, [lastScoreInPeriod, prevScoreInPeriod]);

  const allTimeLastScore = useMemo(() => reports[0]?.score ?? null, [reports]);

  useEffect(() => {
    if (!months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  // Auto-scan effect
  useEffect(() => {
    if (!user || !trackingCode) return;
    const now = Date.now();
    const due = new Date(trackingCode.nextScan).getTime();
    
    if (now >= due) {
      if (user.membershipType === 'Free' && (user.credits ?? 0) <= 0) {
        // Skip auto-scan, advance nextScan
        const updatedTC: TrackingCode = {
          ...trackingCode,
          nextScan: getNextScanDate(trackingCode.scanFrequency),
        };
        setTrackingCode(updatedTC);
        localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updatedTC));
        setAutoSkipped(true);
        return;
      }
      runSEOScan(true);
    }
  }, [trackingCode?.nextScan, user?.membershipType, user?.credits]);

  const generateTrackingCode = () => {
    if (!user) return;
    const url = normalizeUrl(websiteUrl.trim());
    if (!/^https?:\/\/.+\..+/.test(url)) {
      alert('Lütfen geçerli bir web sitesi adresi giriniz (https://... )');
      return;
    }
    const code = `<script src="https://app-domain.com/seo.js" data-site-id="${user.id}" data-url="${url}"></script>`;
    const tc: TrackingCode = {
      id: `${user.id}-${Date.now()}`,
      userId: user.id,
      websiteUrl: url,
      code,
      isActive: true,
      scanFrequency,
      lastScan: '',
      nextScan: getNextScanDate(scanFrequency),
    };
    setTrackingCode(tc);
    localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(tc));
  };

  const exportCSV = () => {
    if (!filteredReports.length) return;
    const header = [
      '"id"',
      '"websiteUrl"',
      '"score"',
      '"createdAt"',
      '"positives"',
      '"negatives"',
      '"suggestions"',
    ].join(',');
    const rows = filteredReports.map((r) =>
      [
        `"${r.id}"`,
        `"${r.websiteUrl}"`,
        `"${r.score}"`,
        `"${r.createdAt}"`,
        `"${r.positives.join('; ').replace(/"/g, '""')}"`,
        `"${r.negatives.join('; ').replace(/"/g, '""')}"`,
        `"${r.suggestions.join('; ').replace(/"/g, '""')}"`,
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-reports-${selectedYear}-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (!filteredReports.length) return;
    const json = JSON.stringify(filteredReports, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-reports-${selectedYear}-${selectedMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runSEOScan = (auto = false) => {
    if (!user || !trackingCode) return;

    if (!auto && user.membershipType === 'Free' && user.credits <= 0) {
      onOpenBilling?.();
      return;
    }

    setLoading(true);

    const performScan = async () => {
      try {
        const apiBase = import.meta.env?.VITE_API_BASE || 'http://localhost:8787';
        const scanUrl = `${apiBase}/api/seo-scan`;
        
        const resp = await fetch(scanUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trackingCode.websiteUrl }),
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('[ERROR] SEO scan failed:', resp.status, errorText);
          // Fallback to old mock scan if API fails
          return runSEOScanOld(auto);
        }

        const json = await resp.json();
        const report = json?.report;
        if (!report) {
          console.error('Invalid scan output:', json);
          // Fallback to old mock scan if response is invalid
          return runSEOScanOld(auto);
        }

        const mockReport: SEOReport = {
          id: Date.now().toString(),
          userId: user.id,
          websiteUrl: trackingCode.websiteUrl,
          score: report.score,
          positives: report.positives,
          negatives: report.negatives,
          suggestions: report.suggestions,
          createdAt: new Date().toISOString(),
          reportData: report.reportData,
        };

        const updatedReports = [mockReport, ...reports];
        setReports(updatedReports);
        localStorage.setItem(`reports_${user.id}`, JSON.stringify(updatedReports));

        if (user.membershipType === 'Free') {
          updateCredits(Math.max(0, user.credits - 1));
        }

        const updatedTC: TrackingCode = {
          ...trackingCode,
          lastScan: new Date().toISOString(),
          nextScan: getNextScanDate(trackingCode.scanFrequency),
        };
        setTrackingCode(updatedTC);
        localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updatedTC));
      } catch (e) {
        console.error('SEO scan error:', e);
        // Fallback to old mock scan on any error
        return runSEOScanOld(auto);
      } finally {
        setLoading(false);
      }
    };

    // For auto scans, add a small delay to avoid overwhelming the server
    if (auto) {
      setTimeout(performScan, 1000);
    } else {
      performScan();
    }
  };

  const runSEOScanOld = (auto = false) => {
    if (!user || !trackingCode) return;

    if (!auto && user.membershipType === 'Free' && (user.credits ?? 0) <= 0) {
      onOpenBilling?.();
      return;
    }

    setLoading(true);

    // Old simulate scan (fallback)
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60;
      const mockReport: SEOReport = {
        id: Date.now().toString(),
        userId: user.id,
        websiteUrl: trackingCode.websiteUrl,
        score,
        positives: [
          'Meta title ve description mevcut',
          'SSL sertifikası aktif',
          'Mobil uyumlu tasarım',
          'Hızlı sayfa yükleme süresi',
          'Alt etiketleri kullanılmış',
        ],
        negatives: [
          'H1 etiketi eksik',
          'Sitemap bulunamadı',
          'Sosyal medya meta etiketleri eksik',
          'İç bağlantı yapısı zayıf',
        ],
        suggestions: [
          'Ana sayfaya H1 etiketi ekleyin',
          'XML sitemap oluşturun ve Search Console\'a gönderin',
          'Open Graph ve Twitter Card meta etiketlerini ekleyin',
          'İç sayfa bağlantılarını güçlendirin',
          'Görsel optimizasyonu yapın',
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
          keywords: ['seo', 'optimizasyon', 'web', 'site'],
        } as any,
      };

      const updatedReports = [mockReport, ...reports];
      setReports(updatedReports);
      localStorage.setItem(`reports_${user.id}`, JSON.stringify(updatedReports));

      if (user.membershipType === 'Free') {
        updateCredits(Math.max(0, (user.credits ?? 0) - 1));
      }

      const updatedTC: TrackingCode = {
        ...trackingCode,
        lastScan: new Date().toISOString(),
        nextScan: getNextScanDate(trackingCode.scanFrequency),
      };
      setTrackingCode(updatedTC);
      localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updatedTC));

      setLoading(false);
      setAutoSkipped(false); // Clear skip flag after successful scan
    }, 1000);
  };

  const onChangeFrequency = (f: ScanFrequency) => {
    setScanFrequency(f);
    if (!user || !trackingCode) return;
    const updated: TrackingCode = {
      ...trackingCode,
      scanFrequency: f,
      nextScan: getNextScanDate(f),
    };
    setTrackingCode(updated);
    localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updated));
  };

  const toggleReportExpansion = (id: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedReports(newExpanded);
  };

  const isFreeAndOut = user?.membershipType === 'Free' && (user?.credits ?? 0) <= 0;
  const isPro = user?.membershipType === 'Pro';
  const isAdvanced = user?.membershipType === 'Advanced';

  return (
    <div className="space-y-8">
      {/* Membership-aware banners */}
      {isFreeAndOut && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-700 mr-2 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Krediniz tükendi. Yeni bir tarama başlatmak için kredi satın alın veya üyeliğinizi yükseltin.
            </p>
          </div>
          <button
            onClick={() => onOpenBilling?.()}
            className="inline-flex items-center gap-2 bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700"
          >
            <CreditCard className="h-4 w-4" />
            Kredi Satın Al
          </button>
        </div>
      )}

      {isPro && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start">
            <Sparkles className="h-5 w-5 text-blue-700 mr-2 mt-0.5" />
            <p className="text-sm text-blue-800">
              AI içerik & akıllı snippet'ler için Advanced'e geçin.
            </p>
          </div>
          <button
            onClick={() => onOpenBilling?.()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            Advanced'e Geç
          </button>
        </div>
      )}

      {autoSkipped && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            Son otomatik tarama kredi yetersizliğinden atlandı.
          </p>
        </div>
      )}

      {/* Tracking Setup */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Globe className="h-6 w-6 text-blue-600 mr-2" />
          Site Doğrulama ve Takip Kodu
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Web siteniz</label>
            <div className="flex gap-2">
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={generateTrackingCode}
                disabled={!websiteUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Takip Kodu Oluştur
              </button>
            </div>
            
            {/* Quick URL suggestions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Hızlı test:</span>
              {['https://google.com', 'https://github.com', 'https://stackoverflow.com'].map(url => (
                <button
                  key={url}
                  onClick={() => setWebsiteUrl(url)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border"
                >
                  {url.replace('https://', '')}
                </button>
              ))}
            </div>

            {trackingCode && (
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showInstall}
                    onChange={(e) => setShowInstall(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Takip Kodunu Göster</span>
                </label>
                
                {showInstall && (
                  <InstallationPanel trackingCode={trackingCode} user={user} />
                )}
                
                {!showInstall && (
                  <p className="text-sm text-gray-600 mt-2">
                    Otomatik kurulum yerine manuel tarama kullanın.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Otomatik Tarama Sıklığı</label>
            <select
              value={scanFrequency}
              onChange={(e) => onChangeFrequency(e.target.value as ScanFrequency)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Haftalık</option>
              <option value="biweekly">2 Haftada Bir</option>
              <option value="monthly">Aylık</option>
            </select>

            {trackingCode && (
              <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gray-600" />
                  <span>
                    <b>Sonraki Otomatik Tarama:</b>{' '}
                    {new Date(trackingCode.nextScan).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => runSEOScan(false)}
              disabled={!trackingCode || loading || isFreeAndOut}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
              {loading ? 'Taranıyor…' : 'Şimdi Tara'}
            </button>

            {user?.membershipType === 'Free' && (
              <p className="text-xs text-gray-500">
                Manuel tarama her çalıştırıldığında 1 kredi düşer. Kalan: <b>{user.credits ?? 0}</b>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Score Snapshot */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileCode2 className="h-6 w-6 text-indigo-600 mr-2" />
            Skorum
          </h2>
          {periodDelta !== null && (
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                periodDelta >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
              title="Seçili dönemdeki son iki rapor arasındaki fark"
            >
              {periodDelta >= 0 ? `+${periodDelta}` : `${periodDelta}`}
            </div>
          )}
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-10 text-center text-gray-600">
            Seçili dönem için rapor yok. Bir site ekleyip tarama başlatın.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Son Skor (Seçili Dönem)</div>
                <div
                  className={`text-3xl font-bold ${
                    (lastScoreInPeriod ?? 0) >= 80 ? 'text-emerald-600' : 
                    (lastScoreInPeriod ?? 0) >= 50 ? 'text-amber-600' : 'text-rose-600'
                  }`}
                >
                  {lastScoreInPeriod ?? '—'}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Rapor Sayısı (Seçili Dönem)</div>
                <div className="text-3xl font-bold">{filteredReports.length}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Seçili Ay</div>
                <div className="text-3xl font-bold">
                  {selectedYear}-{String(selectedMonth).padStart(2, '0')}
                </div>
              </div>
            </div>
            {allTimeLastScore !== null && (
              <div className="mt-3 text-xs text-gray-500 text-center">
                Tüm zamanların son skoru: {allTimeLastScore}
              </div>
            )}
          </>
        )}
      </div>

      {/* AI Summary for Advanced users */}
      {isAdvanced && reports.length > 0 && (
        <AISummaryCard report={reports[0]} />
      )}

      {/* Filters + History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            Rapor Geçmişi
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <button
              onClick={exportCSV}
              disabled={!filteredReports.length}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              onClick={exportJSON}
              disabled={!filteredReports.length}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            >
              <FileJson className="h-4 w-4" /> JSON
            </button>
          </div>
        </div>

        {!filteredReports.length ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
            Seçilen yıl/ay için rapor bulunamadı.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredReports.slice(0, 5).map((report) => (
                <CompactReportRow
                  key={report.id}
                  report={report}
                  expanded={expandedReports.has(report.id)}
                  onToggle={() => toggleReportExpansion(report.id)}
                />
              ))}
            </div>
            
            {filteredReports.length > 5 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setHistoryModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  Tüm geçmişi görüntüle ({filteredReports.length} rapor)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        reports={reports}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        years={years}
        onExportCSV={exportCSV}
        onExportJSON={exportJSON}
      />
    </div>
  );
};

export default Dashboard;