// src/components/PaymentModal.tsx (ilgili kısımlar)
import { useAuth } from '../contexts/AuthContext';
// ...
const { user, addCredits, upgradeMembership } = useAuth();
// ...
const packages = {
  credits: { name: '50 Kredi', price: '₺29.99', description: 'Free üyeliğinize 50 kredi ekler', features: ['50 SEO taraması', 'Temel raporlar', 'E-posta desteği'] },
  pro:     { name: 'Pro Sub',   price: '₺99.99/ay', description: 'Sınırsız SEO taraması ve AI SEO önerileri', features: ['Sınırsız SEO taraması', 'AI SEO önerileri', 'Detaylı raporlar', 'Öncelikli destek'] },
  advanced:{ name: 'Advanced Sun', price: '₺199.99/ay', description: 'Tüm özellikler + AI içerik üretimi', features: ['Tüm Pro özellikler', 'AI içerik üretimi', 'Sosyal medya içerikleri', '7/24 destek'] }
};

const handlePayment = async () => {
  if (!user) return;
  setLoading(true);
  setTimeout(() => {
    if (selectedPackage === 'credits') {
      addCredits(50);
      alert('50 kredi hesabınıza eklendi!');
    } else if (selectedPackage === 'pro') {
      upgradeMembership('ProSub');
      alert('Pro Sub aktif!');
    } else if (selectedPackage === 'advanced') {
      upgradeMembership('AdvancedSun');
      alert('Advanced Sun aktif!');
    }
    setLoading(false);
    onClose();
  }, 1000);
};
