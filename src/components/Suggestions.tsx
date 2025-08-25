import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { SEOReport } from '../types';
import {
  Sparkles,
  Lightbulb,
  Loader,
  CheckCircle2,
  AlertTriangle,
  ClipboardCopy,
  Check,
  Info,
  ArrowRight,
  Rocket,
  Lock,
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

const OPENAI_KEY_STORAGE = 'openai_api_key';

const Suggestions: React.FC<SuggestionsProps> = ({ onOpenBilling }) => {
  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [includeReport, setIncludeReport] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIStruct | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; at: string; prompt: string; res: AIStruct }>>([]);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');

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
    const base = prompt?.trim() || 'SEO iyileştirme planı üret.';
    const ctx = includeReport && reportSummary ? `\n\n[RAPOR BAĞLAMI]\n${reportSummary}` : '';
    const checksText = checks.map(c => `- ${c.title}: ${c.status}${c.note ? ` (${c.note})` : ''}`).join('\n');
    const checkBlock = `\n\n[KONTROLLER]\n${checksText}`;
    const req = `\n\n[İSTEK]\n- Önce en hızlı kazanımlar (quick wins)\n- Sorunlar için: neden (why) + adım adım çözüm (how)\n- 30/60/90 gün yol haritası\n- ${user?.membershipType === 'Advanced' ? 'Uygulanabilir KOD SNIPPET\'LERİ de ver.' : 'Kod snippet gerekmez.'}\n- JSON formatında dön (quickWins[], issues[], ${user?.membershipType === 'Advanced' ? 'snippets[],' : ''} roadmap{d30[],d60[],d90[]}, notes[]).`;
    return `${base}${ctx}${checkBlock}${req}`;
  };

  const offlineGenerate = (): AIStruct => {
    // Heuristic suggestions based on checks + negatives
    const quickWins: string[] = [];
    const issues: AIStruct['issues'] = [];
    const snippets: NonNullable<AIStruct['snippets']> = [];

    const addIssue = (title: string, why: string, how: string[], snippet?: {title:string;code:string;language?:string;note?:string}) => {
      issues!.push({ title, why, how });
      if (user?.membershipType === 'Advanced' && snippet) snippets.push(snippet);
    };

    // Sitemap
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

    // H1 / headings
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

    // Performance
    const perf = (latestReport as any)?.reportData?.pageSpeed;
    if (typeof perf === 'number' && perf < 85) {
      quickWins.push('Görselleri sıkıştırın ve lazy-load uygulayın.');
      addIssue(
        'Sayfa hızı düşük',
        'Kötü Core Web Vitals sıralamayı olumsuz etkiler.',
        ['Görsel optimizasyonu ve lazy-load.', 'Kritik CSS/JS küçültme ve geç yükleme.', 'CDN kullanımı.']
      );
    }

    // Hreflang / i18n
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
      const base = (import.meta as any).env?.VITE_API_BASE || "";
      const url = `${base}/api/seo-suggestions`;
      
      const body = {
        prompt: buildUserPrompt(),
        reportContext: includeReport ? reportSummary : "",
        membershipType: user?.membershipType || "Free",
        websiteUrl: latestReport?.websiteUrl || "",
        currentScore: latestReport?.score || 0,
      };

      console.log('[DEBUG] Sending suggestions request:', body);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log('[DEBUG] Suggestions response status:', resp.status);

      if (!resp.ok) {
        console.error('[DEBUG] Suggestions API error:', resp.status);
        return offlineGenerate();
      }

      const json = await resp.json();
      console.log('[DEBUG] Suggestions API response:', json);
      const data = json?.data;

      if (!data) return offlineGenerate();

      // Ensure proper structure
      if (user?.membershipType !== "Advanced" && Array.isArray(data.snippets)) {
        delete data.snippets;
      }

      console.log('[DEBUG] Final suggestions data:', data);
      return data as AIStruct;
    } catch {
      console.error('[DEBUG] Suggestions request failed, using fallback');
      return offlineGenerate();
    }
  };

  const callOpenAIOld = async (): Promise<AIStruct> => {
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a senior SEO assistant. Return concise, actionable output in JSON with fields quickWins[], issues[], snippets[] (optional), roadmap{d30[],d60[],d90[]}, notes[]. Use Turkish.' },
        { role: 'user', content: buildUserPrompt() },
      ],
      temperature: 0.3,
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer DUMMY` },
      body: JSON.stringify(body),
    });

    if (!resp.ok) return offlineGenerate();
    const data = await resp.json();
    const txt: string = data?.choices?.[0]?.message?.content || '';
    try {
      const parsed: AIStruct = JSON.parse(txt);
      return parsed?.issues || parsed?.quickWins || parsed?.roadmap ? parsed : offlineGenerate();
    } catch {
      return offlineGenerate();
    }
  };

  const onGenerate = async () => {
    if (!user) return;
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
    return <div className="p-6 bg-white rounded-lg border">Önce giriş yapın.</div>;
  }

  if (user.membershipType === 'Free') {
    return (
      <div className="bg-white rounded-lg border p-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-gray-700">
          <Lock className="h-5 w-5" />
          <span className="font-medium">SEO Önerileri</span>
        </div>
        <p className="text-gray-600">Bu özellik <b>Pro</b> ve <b>Advanced</b> paketlerde kullanılabilir.</p>
        <button
          onClick={() => onOpenBilling?.()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
        >
          <Rocket className="h-4 w-4" /> Planını Yükselt
        </button>
      </div>
    );
  }

  const isAdvanced = user.membershipType === 'Advanced';

  return (
    <div className="space-y-8">
      {/* Pro upsell banner */}
      {!isAdvanced && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Advanced'a yükselt</div>
              <div className="text-sm text-gray-600">Kod snippet'leri ve gelişmiş öneriler için</div>
            </div>
            <button
              onClick={() => onOpenBilling?.()}
              className="ml-auto px-3 py-1.5 rounded-md bg-purple-600 text-white text-sm hover:bg-purple-700"
            >
              Yükselt
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-purple-600" />
          Yapay Zeka SEO Asistanı
        </h2>

        {/* Quick commands */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            'Eksik başlık etiketleri ve zayıf iç bağlantılar için 10 maddelik eylem planı yaz',
            'Sayfa hızı ve Core Web Vitals için 30-60-90 günlük iyileştirme planı çıkar',
            'Site genelinde meta title/description standartlarını ve örnek şablonları öner',
            'Sitemap, robots.txt ve structured data için kontrol listesi oluştur',
            'Blog içerikleri için uzun kuyruk anahtar kelime stratejisi ve içerik takvimi öner',
          ].map((q) => (
            <button
              key={q}
              onClick={() => setPrompt(q)}
              className="px-3 py-2 rounded-full border hover:bg-gray-50 text-sm"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Report context */}
        <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700 mb-4">
          <span className="font-medium">Rapor bağlamı:</span>{' '}
          {reportSummary || 'Son rapor bulunamadı.'}
        </div>

        {/* Checks grid (compact) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {checks.map(c => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              {c.status === 'pass' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : c.status === 'fail' ? (
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              ) : (
                <Lightbulb className="h-4 w-4 text-amber-600" />
              )}
              <span className="text-gray-800">{c.title}</span>
              <span className="text-gray-500">• {c.status}</span>
            </div>
          ))}
        </div>

        {/* Prompt */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SEO sorunuz veya ihtiyacınız nedir?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Örnek: Ana sayfamda H1 etiketi yok. Hızlı bir düzeltme planı ve kontrol listesi hazırlar mısın?"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
        />

        <div className="flex items-center justify-between mb-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={includeReport}
              onChange={(e) => setIncludeReport(e.target.checked)}
            />
            Raporu Dahil Et
          </label>

          <button
            onClick={onGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Önerileri Al
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {result.quickWins?.length ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Hızlı Kazanımlar</h3>
                <ul className="list-disc ml-5 text-gray-800 space-y-1">
                  {result.quickWins.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            ) : null}

            {result.issues?.length ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sorunlar ve Çözümler</h3>
                <div className="space-y-3">
                  {result.issues.map((it, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="font-medium text-gray-900">{it.title}</div>
                      {it.why && <div className="text-sm text-gray-700 mt-1">{it.why}</div>}
                      {it.how?.length ? (
                        <ul className="list-disc ml-5 text-sm text-gray-800 mt-2 space-y-1">
                          {it.how.map((h, j) => <li key={j}>{h}</li>)}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isAdvanced && result.snippets?.length ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Kod Snippet'leri</h3>
                <div className="space-y-3">
                  {result.snippets.map((s, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{s.title}</div>
                        <button
                          onClick={() => copy(`snip-${i}`, s.code)}
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          {copiedKey === `snip-${i}` ? <Check className="h-4 w-4 text-emerald-600" /> : <ClipboardCopy className="h-4 w-4" />}
                          {copiedKey === `snip-${i}` ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                      </div>
                      <pre className="mt-2 bg-gray-50 border rounded p-3 text-xs overflow-x-auto">
{`${s.code}`}
                      </pre>
                      {s.note && <div className="text-xs text-gray-600 mt-2">{s.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {result.roadmap && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">30-60-90 Gün Yol Haritası</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="border rounded p-3">
                    <div className="font-medium">30 Gün</div>
                    <ul className="list-disc ml-5 text-sm text-gray-800 mt-1 space-y-1">
                      {result.roadmap?.d30?.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                  <div className="border rounded p-3">
                    <div className="font-medium">60 Gün</div>
                    <ul className="list-disc ml-5 text-sm text-gray-800 mt-1 space-y-1">
                      {result.roadmap?.d60?.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                  <div className="border rounded p-3">
                    <div className="font-medium">90 Gün</div>
                    <ul className="list-disc ml-5 text-sm text-gray-800 mt-1 space-y-1">
                      {result.roadmap?.d90?.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {result.notes?.length ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notlar</h3>
                <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
                  {result.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Geçmiş</h3>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="border rounded p-3">
                <div className="text-xs text-gray-500">{new Date(h.at).toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-800 mt-1 line-clamp-2">Prompt: {h.prompt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="text-lg font-semibold">OpenAI API Anahtarı</div>
            <p className="text-sm text-gray-600">
              Bu anahtar sadece tarayıcınızda saklanır (<code>localStorage</code>).
              Üretimde server-side proxy önerilir.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-... (OpenAI)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded-md border hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  const v = (tempKey || '').trim();
                  if (!v) return;
                  localStorage.setItem(OPENAI_KEY_STORAGE, v);
                  setShowKeyModal(false);
                }}
                className="px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;