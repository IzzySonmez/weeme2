import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../lib/config';
import type { SEOReport } from '../types';
import {
  Sparkles,
  Lightbulb,
  Loader,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Info,
  ArrowRight,
  Rocket,
  Lock,
  FileCode2,
  Zap,
  Target,
  TrendingUp,
  Brain,
  Code,
  Search,
  Globe,
  BarChart3,
  Settings,
  Wand2,
  Star,
  Clock,
  Award
} from 'lucide-react';

type AIStruct = {
  quickWins?: string[];
  issues?: Array<{ title: string; why?: string; how?: string[] }>;
  snippets?: Array<{ title: string; language?: string; code: string; note?: string }>;
  roadmap?: { d30?: string[]; d60?: string[]; d90?: string[] };
  notes?: string[];
};

type CheckRow = { id: string; title: string; status: 'pass' | 'fail' | 'check'; note?: string };

interface SuggestionsProps {
  onOpenBilling?: () => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ onOpenBilling }) => {
  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [useReportBase, setUseReportBase] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIStruct | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; at: string; prompt: string; res: AIStruct }>>([]);

  // Load latest report
  const latestReport: SEOReport | null = useMemo(() => {
    if (!user) return null;
    const raw = localStorage.getItem(`reports_${user.id}`);
    if (!raw) return null;
    const arr: SEOReport[] = JSON.parse(raw);
    return arr?.[0] ?? null;
  }, [user?.id]);

  // Build report summary
  const reportSummary = useMemo(() => {
    if (!latestReport) return '';
    const r = latestReport as any;
    const rd = (latestReport as any).reportData || {};
    const parts = [
      `SEO Skoru: ${latestReport.score}`,
      `Olumlu: ${latestReport.positives?.slice(0,5).join('; ')}`,
      `Eksikler: ${latestReport.negatives?.slice(0,5).join('; ')}`,
      `PageSpeed: ${rd.pageSpeed ?? '—'}`,
      `Mobil: ${rd.mobileOptimization ? 'evet' : 'hayır'}`,
      `SSL: ${rd.sslCertificate ? 'evet' : 'hayır'}`,
      `Örnek Anahtar Kelimeler: ${(rd.keywords || []).join(', ') || '—'}`,
      `Site: ${latestReport.websiteUrl}`,
    ];
    return parts.join(' | ');
  }, [latestReport]);

  // Build checks grid (heuristics)
  const checks: CheckRow[] = useMemo(() => {
    const rd = (latestReport as any)?.reportData || {};
    const negativesText = (latestReport?.negatives || []).join(' ').toLowerCase();

    const hasSitemapNeg = negativesText.includes('sitemap bulunamadı');
    const hasH1Neg = negativesText.includes('h1');
    const hasOgNeg = negativesText.includes('sosyal medya meta');
    const perf = typeof rd.pageSpeed === 'number' ? rd.pageSpeed : null;

    const rows: CheckRow[] = [
      { id: 'hreflang', title: 'Hreflang etiketleri', status: 'check', note: 'Doğrulama önerilir' },
      { id: 'duplicate', title: 'Duplicate içerik / canonical', status: 'check', note: 'Olası kopya içerik için kanonik kontrol' },
      { id: 'url-strategy', title: 'URL stratejisi (diller için)', status: 'check' },
      { id: 'intl-speed', title: 'Uluslararası erişim / hız', status: perf !== null && perf >= 80 ? 'pass' : perf !== null ? 'fail' : 'check', note: perf !== null ? `PageSpeed: ${perf}` : undefined },
      { id: 'l10n', title: 'Çeviri & lokal uyum', status: 'check' },
      { id: 'local-engines', title: 'Lokal arama motorlarında görünürlük', status: 'check' },
      { id: 'keywords', title: 'Anahtar kelime seçimi', status: (rd.keywords || []).length ? 'pass' : 'check' },
      { id: 'robots-sitemap-hreflang', title: 'robots.txt / sitemap.xml / hreflang', status: hasSitemapNeg ? 'fail' : 'check', note: hasSitemapNeg ? 'Sitemap eksik' : undefined },
      { id: 'canonical', title: 'Canonical etiketleri', status: 'check' },
      { id: 'indexing', title: 'Search Console index sorunları', status: 'check' },
      { id: 'mobile', title: 'Responsive tasarım', status: (rd.mobileOptimization ? 'pass' : 'check') },
    ];
    return rows;
  }, [latestReport]);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`aiSuggestions_${user.id}`);
    if (saved) setHistory(JSON.parse(saved));
  }, [user?.id]);

  const saveHistory = (res: AIStruct, usedPrompt: string) => {
    if (!user) return;
    const item = { id: `${Date.now()}`, at: new Date().toISOString(), prompt: usedPrompt, res };
    const updated = [item, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem(`aiSuggestions_${user.id}`, JSON.stringify(updated));
  };

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const buildUserPrompt = () => {
    if (useReportBase && latestReport) {
      const customPrompt = prompt?.trim() ? `\n\n[ÖZEL İSTEK]\n${prompt.trim()}` : '';
      const ctx = `[MEVCUT RAPOR ANALİZİ]\nSite: ${latestReport.websiteUrl}\nSEO Skoru: ${latestReport.score}/100\n\nOlumlu Yönler:\n${latestReport.positives.map(p => `• ${p}`).join('\n')}\n\nEksikler:\n${latestReport.negatives.map(n => `• ${n}`).join('\n')}\n\nMevcut Öneriler:\n${latestReport.suggestions.map(s => `• ${s}`).join('\n')}`;
      const checksText = checks.map(c => `- ${c.title}: ${c.status}${c.note ? ` (${c.note})` : ''}`).join('\n');
      const checkBlock = `\n\n[EK KONTROLLER]\n${checksText}`;
      const req = `\n\n[GÖREV]\nYukarıdaki rapor analizini temel alarak:\n- Bu rapordaki eksikleri nasıl düzelteceğini DETAYLI anlat\n- Her öneri için KOD ÖRNEĞİ ver\n- NEREDE yapılacağını belirt\n- NASIL test edileceğini açıkla\n- Hızlı kazanımları öncelikle\n- 30/60/90 gün yol haritası çıkar\n${user?.membershipType === 'Advanced' ? '- Uygulanabilir KOD SNIPPET\'LERİ ekle' : ''}\n\nJSON formatında dön: {quickWins[], issues[{title,why,how[]}], ${user?.membershipType === 'Advanced' ? 'snippets[{title,language,code,note}],' : ''} roadmap{d30[],d60[],d90[]}, notes[]}`;
      return `${ctx}${checkBlock}${customPrompt}${req}`;
    } else {
      const base = prompt?.trim() || 'Genel SEO iyileştirme önerileri ver.';
      const siteInfo = latestReport ? `\n\n[SİTE BİLGİSİ]\nURL: ${latestReport.websiteUrl}` : '';
      const req = `\n\n[GÖREV]\n- Detaylı, uygulanabilir öneriler ver\n- Her öneri için KOD ÖRNEĞİ ekle\n- NEREDE yapılacağını belirt\n- NASIL test edileceğini açıkla\n- Hızlı kazanımları öncelikle\n${user?.membershipType === 'Advanced' ? '- Kod snippet\'leri ekle' : ''}\n\nJSON formatında dön: {quickWins[], issues[{title,why,how[]}], ${user?.membershipType === 'Advanced' ? 'snippets[{title,language,code,note}],' : ''} roadmap{d30[],d60[],d90[]}, notes[]}`;
      return `${base}${siteInfo}${req}`;
    }
  };

  const offlineGenerate = (): AIStruct => {
    const quickWins: string[] = [];
    const issues: AIStruct['issues'] = [];
    const snippets: NonNullable<AIStruct['snippets']> = [];

    const addIssue = (title: string, why: string, how: string[], snippet?: {title:string;code:string;language?:string;note?:string}) => {
      issues!.push({ title, why, how });
      if (user?.membershipType === 'Advanced' && snippet) snippets.push(snippet);
    };

    const sitemapRow = checks.find(c => c.id === 'robots-sitemap-hreflang');
    if (sitemapRow?.status === 'fail') {
      quickWins.push('XML sitemap oluşturup /sitemap.xml olarak yayınlayın ve Search Console\'a ekleyin.');
      addIssue(
        'Sitemap eksik',
        'Arama motorları sitenizi tam tarayamıyor.',
        ['Site haritası üretin (dinamik).', 'Robots.txt içinde referans verin.', 'Search Console\'a gönderein.'],
        {
          title: 'Örnek sitemap.xml',
          language: 'xml',
          code: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${latestReport?.websiteUrl || 'https://www.example.com/'}</loc></url>
</urlset>`,
          note: 'Dinamik üretmeniz önerilir.'
        }
      );
    }

    const negativesText = (latestReport?.negatives || []).join(' ').toLowerCase();
    if (negativesText.includes('h1')) {
      quickWins.push('Ana sayfaya benzersiz bir H1 ekleyin.');
      addIssue(
        'H1 etiketi eksik',
        'Sayfanın ana konusu arama motorlarına net iletilmiyor.',
        ['Her sayfada tek, anlamlı bir H1 kullanın.', 'H2/H3 ile hiyerarşi kurun.'],
        {
          title: 'H1 örneği',
          language: 'html',
          code: `<h1>${(latestReport as any)?.reportData?.keywords?.[0] || 'Sayfanın Ana Başlığı'}</h1>`,
        }
      );
    }

    const perf = (latestReport as any)?.reportData?.pageSpeed;
    if (typeof perf === 'number' && perf < 85) {
      quickWins.push('Görselleri sıkıştırın ve lazy-load uygulayın.');
      addIssue(
        'Sayfa hızı düşük',
        'Kötü Core Web Vitals sıralamayı olumsuz etkiler.',
        ['Görsel optimizasyonu ve lazy-load.', 'Kritik CSS/JS küçültme ve geç yükleme.', 'CDN kullanımı.']
      );
    }

    addIssue(
      'Hreflang ve uluslararası yapı doğrulaması',
      'Yanlış/eksik hreflang etiketi yanlış bölgeye indekslenmeye yol açabilir.',
      ['Dil-bölge eşleşmelerini belirleyin (tr-TR, en-US...).', 'Sayfalar arası karşılıklı hreflang ekleyin.', 'Canonical ve alternates uyumunu kontrol edin.'],
      user?.membershipType === 'Advanced'
        ? {
            title: 'Hreflang örneği',
            language: 'html',
            code: `<link rel="alternate" href="https://example.com/tr/" hreflang="tr-TR" />
<link rel="alternate" href="https://example.com/en/" hreflang="en-US" />
<link rel="alternate" href="https://example.com/" hreflang="x-default" />`,
            note: 'Tüm dil versiyonlarında karşılıklı olmalı.'
          }
        : undefined
    );

    const roadmap = {
      d30: ['Hız ve başlık yapısı (H1/H2) düzenlemeleri', 'XML sitemap üretimi ve Search Console\'a gönderim', 'Öncelikli sayfalar için meta title/description standardizasyonu'],
      d60: ['İç bağlantı (topic cluster) yapısının kurulması', 'OG/Twitter Card ve structured data eklenmesi', 'Uluslararası yapı (hreflang) testleri'],
      d90: ['İçerik takvimi ve uzun kuyruk stratejisi', 'Yerelleştirilmiş landing sayfaları', 'Düzenli Core Web Vitals takibi'],
    };

    return {
      quickWins,
      issues,
      snippets: user?.membershipType === 'Advanced' ? snippets : undefined,
      roadmap,
      notes: ['Bu öneriler son rapor ve kontrol ızgarasına göre otomatik üretildi.'],
    };
  };

  const callOpenAI = async (): Promise<AIStruct> => {
    try {
      const base = config.apiBase;
      const url = `${base}/api/seo-suggestions`;
      
      const body = {
        prompt: buildUserPrompt(),
        reportContext: useReportBase ? reportSummary : "",
        membershipType: user?.membershipType || "Free",
        websiteUrl: latestReport?.websiteUrl || "",
        currentScore: latestReport?.score || 0,
        useReportBase,
      };
      
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Suggestions API error:', resp.status, errorText);
        throw new Error(`API Error: ${resp.status}`);
      }

      const json = await resp.json();
      const data = json?.data;

      if (!data) return offlineGenerate();

      if (user?.membershipType !== "Advanced" && Array.isArray(data.snippets)) {
        delete data.snippets;
      }

      return data as AIStruct;
    } catch (error) {
      console.error('Suggestions request failed, using fallback');
      return offlineGenerate();
    }
  };

  const onGenerate = async () => {
    if (!user) return;
    
    if (useReportBase && !latestReport) {
      alert('Rapor bazlı öneriler için önce Dashboard\'dan bir site taraması yapın.');
      return;
    }
    
    setLoading(true);
    setResult(null);
    try {
      const res = await callOpenAI();
      setResult(res);
      saveHistory(res, prompt || '(boş)');
    } finally {
      setLoading(false);
    }
  };

  // Membership views
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Giriş Gerekli</h3>
          <p className="text-gray-600">SEO önerilerine erişmek için önce giriş yapın.</p>
        </div>
      </div>
    );
  }

  if (user.membershipType === 'Free') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12 text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              AI SEO Önerileri
            </h2>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Yapay zeka destekli detaylı SEO önerileri ve kod snippet'leri için 
              <span className="font-semibold text-purple-600"> Pro </span> veya 
              <span className="font-semibold text-purple-600"> Advanced </span> planına geçin.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-blue-900">Pro Plan</span>
                </div>
                <ul className="text-sm text-blue-800 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    AI SEO önerileri
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Detaylı eylem planları
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    30-60-90 gün roadmap
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-purple-900">Advanced Plan</span>
                </div>
                <ul className="text-sm text-purple-800 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    Tüm Pro özellikleri
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    Kod snippet'leri
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    AI içerik üretimi
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => onOpenBilling?.()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Rocket className="h-5 w-5" />
              Planını Yükselt
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdvanced = user.membershipType === 'Advanced';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            AI SEO Asistanı
          </h1>
          <p className="text-gray-600 text-lg">Yapay zeka destekli kişiselleştirilmiş SEO önerileri</p>
        </div>

        {/* Pro upsell banner */}
        {!isAdvanced && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Advanced'a Yükselt</h3>
                  <p className="text-gray-600">Kod snippet'leri ve gelişmiş AI önerileri için</p>
                </div>
              </div>
              <button
                onClick={() => onOpenBilling?.()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Yükselt
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Main AI Assistant Panel */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Yapay Zeka SEO Asistanı</h2>
                <p className="text-gray-600">Siteniz için özelleştirilmiş öneriler alın</p>
              </div>
            </div>

            {/* Quick commands */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Hızlı Komutlar</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Eksik başlık etiketleri ve zayıf iç bağlantılar için 10 maddelik eylem planı yaz',
                  'Sayfa hızı ve Core Web Vitals için 30-60-90 günlük iyileştirme planı çıkar',
                  'Site genelinde meta title/description standartlarını ve örnek şablonları öner',
                  'Sitemap, robots.txt ve structured data için kontrol listesi oluştur',
                  'Blog içerikleri için uzun kuyruk anahtar kelime stratejisi öner',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setPrompt(q)}
                    className="px-3 py-2 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-sm transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Report context */}
            {useReportBase && latestReport && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Mevcut Rapor Temel Alınacak</span>
                </div>
                <div className="text-sm text-blue-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><strong>Site:</strong> {latestReport.websiteUrl}</div>
                  <div><strong>Skor:</strong> {latestReport.score}/100</div>
                  <div><strong>Eksikler:</strong> {latestReport.negatives.length} adet</div>
                </div>
              </div>
            )}

            {!useReportBase && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-900">Serbest Prompt Modu</span>
                </div>
                <div className="text-sm text-amber-800">
                  Rapor kullanılmayacak. Sadece girdiğiniz prompt'a göre genel öneriler alacaksınız.
                </div>
              </div>
            )}

            {/* Checks grid (compact) */}
            {useReportBase && latestReport && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Teknik Kontroller</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {checks.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-xs">
                      {c.status === 'pass' ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ) : c.status === 'fail' ? (
                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-amber-600" />
                      )}
                      <span className="text-gray-700 truncate">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {useReportBase ? 'Rapor üzerine ek soru/istek (opsiyonel):' : 'SEO sorunuz veya ihtiyacınız nedir?'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={useReportBase 
                  ? "Örnek: Bu eksikleri nasıl öncelik sırasına koymalıyım? Hangi araçları kullanabilirim?"
                  : "Örnek: E-ticaret sitesi için genel SEO stratejisi öner. Hangi araçları kullanmalıyım?"
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="promptMode"
                    className="border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={useReportBase}
                    onChange={() => setUseReportBase(true)}
                  />
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    Rapor Bazlı Öneriler
                  </div>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="promptMode"
                    className="border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={!useReportBase}
                    onChange={() => setUseReportBase(false)}
                  />
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-purple-600" />
                    Serbest Prompt
                  </div>
                </label>
              </div>

              <button
                onClick={onGenerate}
                disabled={loading || (useReportBase && !latestReport)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? 'AI Düşünüyor...' : useReportBase ? 'Rapor Bazlı Öneriler Al' : 'Serbest Öneriler Al'}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-6 pt-6 border-t border-gray-200">
                {Array.isArray(result.quickWins) && result.quickWins.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                      <Zap className="h-5 w-5" />
                      Hızlı Kazanımlar ({result.quickWins.length})
                    </div>
                    <ul className="space-y-3">
                      {result.quickWins.map((w, i) => (
                        <li key={i} className="text-green-800 flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{i + 1}</span>
                          </div>
                          <span>{typeof w === 'string' ? w : 'Geçersiz öneri'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(result.issues) && result.issues.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 text-blue-700 font-semibold mb-4">
                      <Target className="h-5 w-5" />
                      Sorunlar ve Çözümler ({result.issues.length})
                    </div>
                    <div className="space-y-4">
                      {result.issues.map((it, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
                          <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{i + 1}</span>
                            </div>
                            {typeof it?.title === 'string' ? it.title : 'Başlık bulunamadı'}
                          </div>
                          {it?.why && typeof it.why === 'string' && (
                            <div className="text-sm text-blue-800 mb-3 bg-blue-50 rounded-lg p-3">
                              <strong>Neden önemli:</strong> {it.why}
                            </div>
                          )}
                          {Array.isArray(it?.how) && it.how.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">Nasıl çözülür:</div>
                              <ul className="space-y-2">
                                {it.how.map((h, j) => (
                                  <li key={j} className="text-sm text-gray-800 flex items-start gap-2">
                                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    {typeof h === 'string' ? h : 'Geçersiz adım'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAdvanced && Array.isArray(result.snippets) && result.snippets.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 text-purple-700 font-semibold mb-4">
                      <Code className="h-5 w-5" />
                      Kod Snippet'leri ({result.snippets.length})
                    </div>
                    <div className="space-y-4">
                      {result.snippets.map((s, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">{i + 1}</span>
                              </div>
                              {typeof s?.title === 'string' ? s.title : 'Kod snippet'}
                            </div>
                            <button
                              onClick={() => copy(`snip-${i}`, s?.code || '')}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-sm text-gray-700 hover:text-gray-900 transition-all duration-200"
                            >
                              {copiedKey === `snip-${i}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              {copiedKey === `snip-${i}` ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto font-mono">
{typeof s?.code === 'string' ? s.code : 'Kod bulunamadı'}
                          </pre>
                          {s?.note && typeof s.note === 'string' && (
                            <div className="p-3 bg-gray-50 text-xs text-gray-600 border-t">
                              <Info className="h-3 w-3 inline mr-1" />
                              {s.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.roadmap && typeof result.roadmap === 'object' && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 text-orange-700 font-semibold mb-4">
                      <TrendingUp className="h-5 w-5" />
                      30-60-90 Gün Yol Haritası
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-white/60 backdrop-blur-sm border border-orange-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 font-semibold text-orange-900 mb-3">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">30</span>
                          </div>
                          İlk 30 Gün
                        </div>
                        <ul className="space-y-2">
                          {Array.isArray(result.roadmap.d30) && result.roadmap.d30.map((x, i) => (
                            <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              {typeof x === 'string' ? x : 'Geçersiz görev'}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm border border-orange-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 font-semibold text-orange-900 mb-3">
                          <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">60</span>
                          </div>
                          60 Gün
                        </div>
                        <ul className="space-y-2">
                          {Array.isArray(result.roadmap.d60) && result.roadmap.d60.map((x, i) => (
                            <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                              {typeof x === 'string' ? x : 'Geçersiz görev'}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm border border-orange-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 font-semibold text-orange-900 mb-3">
                          <div className="w-6 h-6 bg-orange-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">90</span>
                          </div>
                          90 Gün
                        </div>
                        <ul className="space-y-2">
                          {Array.isArray(result.roadmap.d90) && result.roadmap.d90.map((x, i) => (
                            <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-700 rounded-full mt-2 flex-shrink-0"></div>
                              {typeof x === 'string' ? x : 'Geçersiz görev'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {Array.isArray(result.notes) && result.notes.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      <Info className="h-5 w-5" />
                      Önemli Notlar
                    </div>
                    <ul className="space-y-2">
                      {result.notes.map((n, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {typeof n === 'string' ? n : 'Geçersiz not'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History - Compact */}
          {history.length > 0 && (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Son Öneriler</h3>
              </div>
              <div className="space-y-3">
                {history.slice(0, 3).map(h => (
                  <div key={h.id} className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {new Date(h.at).toLocaleString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {h.prompt || 'Rapor bazlı'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Suggestions;