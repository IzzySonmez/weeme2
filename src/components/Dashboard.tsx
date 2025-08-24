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

const Dashboard: React.FC<DashboardProps> = ({ onOpenBilling }) => {
  const { user, updateCredits } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [trackingCode, setTrackingCode] = useState<TrackingCode | null>(null);

  const [reports, setReports] = useState<SEOReport[]>([]);
  const [loading, setLoading] = useState(false);

  const [scanFrequency, setScanFrequency] = useState<ScanFrequency>('weekly');

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Persisted veriyi yükle
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

  // Due ise otomatik çalıştır (nextScan değişimlerinde)
  useEffect(() => {
    if (!user || !trackingCode) return;
    const now = Date.now();
    const due = new Date(trackingCode.nextScan).getTime();
    if (now >= due) {
      if (user.membershipType === 'Free' && user.credits <= 0) return;
      runSEOScan(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingCode?.nextScan, user?.membershipType, user?.credits]);

  // FRONT-107: trackingCode ilk kez state'e geldiğinde "gecikmiş tarama" kaçmasın
  useEffect(() => {
    if (!user || !trackingCode) return;
    const due = new Date(trackingCode.nextScan).getTime();
    if (Date.now() >= due) {
      if (user.membershipType === 'Free' && (user.credits ?? 0) <= 0) return;
      runSEOScan(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!trackingCode, user?.id]);

  // Yıllar (raporlardan)
  const years = useMemo(() => {
    const set = new Set<number>();
    reports.forEach((r) => set.add(new Date(r.createdAt).getFullYear()));
    const arr = Array.from(set);
    if (arr.length === 0) arr.push(new Date().getFullYear());
    return arr.sort((a, b) => b - a);
  }, [reports]);

  // Aylar (seçili yıl)
  const months = useMemo(() => {
    const set = new Set<number>();
    reports
      .filter((r) => new Date(r.createdAt).getFullYear() === selectedYear)
      .forEach((r) => set.add(new Date(r.createdAt).getMonth() + 1));
    const arr = Array.from(set);
    if (arr.length === 0) return [new Date().getMonth() + 1];
    return arr.sort((a, b) => b - a);
  }, [reports, selectedYear]);

  useEffect(() => {
    if (!months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });
  }, [reports, selectedYear, selectedMonth]);

  const lastScore = reports[0]?.score ?? null;
  const prevScore = reports[1]?.score ?? null;
  const delta = lastScore !== null && prevScore !== null ? lastScore - prevScore : null;

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
      'id',
      'websiteUrl',
      'score',
      'createdAt',
      'positives',
      'negatives',
      'suggestions',
    ].join(',');
    const rows = filteredReports.map((r) =>
      [
        r.id,
        r.websiteUrl,
        r.score,
        r.createdAt,
        JSON.stringify(r.positives).replaceAll(',', ';'),
        JSON.stringify(r.negatives).replaceAll(',', ';'),
        JSON.stringify(r.suggestions).replaceAll(',', ';'),
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

  const runSEOScan = (auto = false) => {
    if (!user || !trackingCode) return;

    if (!auto && user.membershipType === 'Free' && user.credits <= 0) {
      onOpenBilling?.();
      return;
    }

    setLoading(true);

    // Simüle tarama
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
        updateCredits(Math.max(0, user.credits - 1));
      }

      const updatedTC: TrackingCode = {
        ...trackingCode,
        lastScan: new Date().toISOString(),
        nextScan: getNextScanDate(trackingCode.scanFrequency),
      };
      setTrackingCode(updatedTC);
      localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updatedTC));

      setLoading(false);
    }, 1000);
  };

  const onChangeFrequency = (f: ScanFrequency) => {
    setScanFrequency(f);
    if (!user) return;
    if (!trackingCode) return;
    const updated: TrackingCode = {
      ...trackingCode,
      scanFrequency: f,
      nextScan: getNextScanDate(f),
    };
    setTrackingCode(updated);
    localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updated));
  };

  const isFreeAndOut = user?.membershipType === 'Free' && (user?.credits ?? 0) <= 0;

  return (
    <div className="space-y-8">
      {/* Kredi bitti uyarısı */}
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
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700"
          >
            <CreditCard className="h-4 w-4" />
            Kredi Satın Al
          </button>
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
                placeholder="https://ornek.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={generateTrackingCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Takip Kodu Oluştur
              </button>
            </div>

            {trackingCode && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Aşağıdaki kodu sitenizin <b>&lt;head&gt;</b> bölümüne ekleyin:
                </p>
                <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto">
{trackingCode.code}
                </pre>
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
              disabled={!trackingCode || loading || (user?.membershipType === 'Free' && (user?.credits ?? 0) <= 0)}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
              {loading ? 'Taranıyor…' : 'Şimdi Tara'}
            </button>

            {user?.membershipType === 'Free' && (
              <p className="text-xs text-gray-500">
                Manuel tarama her çalıştırıldığında 1 kredi düşer. Kalan: <b>{user.credits}</b>
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
          {lastScore !== null && (
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                delta === null
                  ? 'bg-gray-100 text-gray-700'
                  : delta >= 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
              title="Son iki tarama arasındaki fark"
            >
              {delta === null ? '—' : delta >= 0 ? `+${delta}` : `${delta}`}
            </div>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-10 text-center text-gray-600">
            Henüz rapor yok. Bir site ekleyip tarama başlatın.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Son Skor</div>
              <div
                className={`text-3xl font-bold ${
                  (lastScore ?? 0) >= 80 ? 'text-emerald-600' : (lastScore ?? 0) >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}
              >
                {lastScore}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Rapor Sayısı</div>
              <div className="text-3xl font-bold">{reports.length}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Seçili Ay</div>
              <div className="text-3xl font-bold">
                {selectedYear}-{String(selectedMonth).padStart(2, '0')}
              </div>
            </div>
          </div>
        )}
      </div>

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
              <Download className="h-4 w-4" /> CSV İndir
            </button>
          </div>
        </div>

        {!filteredReports.length ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
            Seçilen yıl/ay için rapor bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((r) => (
              <div key={r.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleString('tr-TR')}
                    </div>
                    <div className="text-gray-900 font-medium">{r.websiteUrl}</div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      r.score >= 80 ? 'text-emerald-600' : r.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  >
                    {r.score}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                      <CheckCircle2 className="h-4 w-4" /> Olumlu
                    </div>
                    <ul className="list-disc ml-5 text-sm text-green-800 space-y-1">
                      {r.positives.slice(0, 3).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                      <AlertTriangle className="h-4 w-4" /> Eksikler
                    </div>
                    <ul className="list-disc ml-5 text-sm text-red-800 space-y-1">
                      {r.negatives.slice(0, 3).map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm text-gray-600 font-medium mb-1">Öneriler</div>
                  <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
                    {r.suggestions.slice(0, 5).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
