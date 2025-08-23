// src/components/Dashboard.tsx (başlangıca yakın)
useEffect(() => {
  const savedReports = localStorage.getItem(`reports_${user?.id}`);
  const savedTrackingCode = localStorage.getItem(`trackingCode_${user?.id}`);
  if (savedReports) setReports(JSON.parse(savedReports));
  if (savedTrackingCode) setTrackingCode(JSON.parse(savedTrackingCode));
}, [user?.id]);

// Otomatik tarama kontrolü
useEffect(() => {
  if (!trackingCode || !user) return;
  const now = new Date();
  const due = new Date(trackingCode.nextScan);
  if (now >= due) {
    // Free ise kredi kontrolü
    if (user.membershipType === 'Free' && user.credits <= 0) return;
    runSEOScan(true); // auto flag
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [trackingCode?.nextScan, user?.membershipType, user?.credits]);

// runSEOScan değişsin: auto parametresi ve nextScan güncellensin
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
      positives: ['Meta title ve description mevcut','SSL sertifikası aktif','Mobil uyumlu tasarım','Hızlı sayfa yükleme süresi','Alt etiketleri kullanılmış'],
      negatives: ['H1 etiketi eksik','Sitemap bulunamadı','Sosyal medya meta etiketleri eksik','İç bağlantı yapısı zayıf'],
      suggestions: [
        'Ana sayfaya H1 etiketi ekleyin',
        'XML sitemap oluşturun ve Google Search Console\'a gönderin',
        'Open Graph ve Twitter Card meta etiketlerini ekleyin',
        'İç sayfa bağlantılarını güçlendirin',
        'Görsel optimizasyonu yapın'
      ],
      createdAt: new Date().toISOString(),
      reportData: { metaTags: true, headings: false, images: true, performance: 85, mobileOptimization: true, sslCertificate: true, pageSpeed: 78, keywords: ['seo','optimizasyon','web','site'] }
    };

    const updatedReports = [mockReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem(`reports_${user.id}`, JSON.stringify(updatedReports));

    // kredi düş: auto veya manuel fark etmez
    if (user.membershipType === 'Free') {
      updateCredits(user.credits - 1);
    }

    // nextScan hesapla ve kaydet
    const updatedTC = { ...trackingCode, lastScan: new Date().toISOString(), nextScan: getNextScanDate(trackingCode.scanFrequency) };
    setTrackingCode(updatedTC);
    localStorage.setItem(`trackingCode_${user.id}`, JSON.stringify(updatedTC));

    setLoading(false);
  }, 1200);
};

// Yıl/ay filtrelerini dinamik yapın (örn. 5 yıl geriye kadar)
const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
