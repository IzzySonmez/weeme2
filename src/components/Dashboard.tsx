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