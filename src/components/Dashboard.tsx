import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  membershipType: 'Free' | 'Premium';
  credits: number;
}

interface TrackingCode {
  websiteUrl: string;
  nextScan: string;
  lastScan: string;
  scanFrequency: string;
}

interface SEOReport {
  id: string;
  userId: string;
  websiteUrl: string;
  score: number;
  positives: string[];
  negatives: string[];
  suggestions: string[];
  createdAt: string;
  reportData: {
    metaTags: boolean;
    headings: boolean;
    images: boolean;
    performance: number;
    mobileOptimization: boolean;
    sslCertificate: boolean;
    pageSpeed: number;
    keywords: string[];
  };
}

interface DashboardProps {
  user: User | null;
  updateCredits: (credits: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, updateCredits }) => {
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [trackingCode, setTrackingCode] = useState<TrackingCode | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Generate dynamic year/month filters (e.g., 5 years back)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="dashboard">
      <h1>SEO Dashboard</h1>
      {/* Dashboard content will be implemented here */}
      <div>
        <p>User: {user?.id}</p>
        <p>Credits: {user?.credits}</p>
        <p>Membership: {user?.membershipType}</p>
        <p>Reports: {reports.length}</p>
        {loading && <p>Loading...</p>}
        <button onClick={() => runSEOScan(false)} disabled={loading}>
          Run SEO Scan
        </button>
      </div>
    </div>
  );
};

export default Dashboard;