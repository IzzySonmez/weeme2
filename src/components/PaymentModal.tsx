import React, { useState } from 'react';
import { X, CreditCard, Crown, Sparkles, Loader, CheckCircle2, Zap, Target, Users, BarChart3, Code, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PackageKey = 'credits' | 'pro' | 'advanced';

const PACKS: Record<PackageKey, {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  gradient: string;
  icon: React.ComponentType<any>;
}> = {
  credits: {
    title: '50 Kredi Paketi',
    price: '₺29.99',
    description: 'Free üyeliğinize 50 kredi ekler.',
    features: ['50 SEO taraması', 'Temel raporlar', 'E-posta desteği', '30 gün geçerlilik'],
    gradient: 'from-green-500 to-emerald-600',
    icon: Zap
  },
  pro: {
    title: 'Pro Üyelik',
    price: '₺99.99 / ay',
    description: 'Sınırsız SEO taraması + AI önerileri',
    features: ['Sınırsız tarama', 'AI SEO önerileri', 'Detaylı raporlar', 'Öncelikli destek', 'Çoklu site yönetimi'],
    popular: true,
    gradient: 'from-blue-600 to-purple-600',
    icon: Target
  },
  advanced: {
    title: 'Advanced Üyelik',
    price: '₺199.99 / ay',
    description: 'Tüm özellikler + AI içerik üretimi',
    features: ['Tüm Pro özellikleri', 'AI içerik üretimi', 'Sosyal medya entegrasyonu', 'Kod snippet\'leri', '7/24 destek', 'API erişimi'],
    gradient: 'from-purple-600 to-pink-600',
    icon: Sparkles
  },
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { user, addCredits, upgradeMembership, refreshUser } = useAuth();
  const [selected, setSelected] = useState<PackageKey>('pro');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);

    // Demo implementation - replace with real payment processing
    setTimeout(() => {
      if (selected === 'credits') {
        addCredits(50);
        alert('🎉 50 kredi hesabınıza eklendi!');
      } else if (selected === 'pro') {
        upgradeMembership('Pro');
        alert('🚀 Pro üyelik aktif! Tüm AI öneriler artık kullanılabilir.');
      } else if (selected === 'advanced') {
        upgradeMembership('Advanced');
        alert('✨ Advanced üyelik aktif! AI içerik üretimi de dahil tüm özellikler açıldı.');
      }

      refreshUser();
      setLoading(false);
      onClose();
    }, 1500);
  };

  const selectedPack = PACKS[selected];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-6xl glass rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between px-12 py-8 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Plan & Ödeme</h3>
            <p className="text-gray-600 mt-2 text-lg">İhtiyacınıza uygun planı seçin</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-2xl hover:bg-white/60 transition-colors"
          >
            <X className="h-8 w-8 text-gray-600" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {Object.entries(PACKS).map(([key, pack]) => {
              const Icon = pack.icon;
              const isSelected = selected === key;
              const isPro = key === 'pro';
              
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key as PackageKey)}
                  className={`relative text-left border-2 rounded-3xl p-8 transition-all duration-300 ${
                    isSelected 
                      ? `border-transparent bg-gradient-to-br ${pack.gradient} text-white shadow-2xl transform scale-105` 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-2xl glass hover:-translate-y-2'
                  }`}
                >
                  {/* Popular Badge */}
                  {pack.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-2xl">
                      EN POPÜLER
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                    isSelected 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : `bg-gradient-to-r ${pack.gradient}`
                  }`}>
                    <Icon className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-white'}`} />
                  </div>

                  {/* Content */}
                  <h4 className={`text-2xl font-bold mb-4 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {pack.title}
                  </h4>
                  
                  <div className={`text-4xl font-bold mb-4 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {pack.price}
                  </div>
                  
                  <p className={`text-lg mb-6 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                    {pack.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {pack.features.map((feature, index) => (
                      <li key={index} className={`flex items-center gap-3 ${
                        isSelected ? 'text-white/90' : 'text-gray-700'
                      }`}>
                        <CheckCircle2 className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-green-500'} flex-shrink-0`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Plan Info */}
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 mb-8 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-900 text-xl">Mevcut Planınız</div>
                    <div className="text-blue-700 text-lg">
                      {user.membershipType} {user.membershipType === 'Free' && `• ${user.credits} kredi kaldı`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-600 font-medium">Seçilen Plan</div>
                  <div className="font-bold text-blue-900 text-xl">{selectedPack.title}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              <div className="font-bold text-xl">Seçiminiz: {selectedPack.title}</div>
              <div className="text-gray-500 text-lg">{selectedPack.price}</div>
            </div>
            
            <div className="flex items-center gap-6">
              <button
                onClick={onClose}
                className="px-8 py-4 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors font-bold text-lg"
              >
                İptal
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`inline-flex items-center gap-4 px-12 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-60 disabled:transform-none bg-gradient-to-r ${selectedPack.gradient}`}
              >
                {loading ? (
                  <Loader className="h-6 w-6 animate-spin" />
                ) : (
                  <CreditCard className="h-6 w-6" />
                )}
                <span>{loading ? 'İşleniyor...' : 'Onayla & Öde'}</span>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center text-sm text-gray-500 glass rounded-2xl p-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Globe className="h-5 w-5" />
              <span className="font-bold">Güvenli Ödeme</span>
            </div>
            <p className="leading-relaxed">
              Tüm ödemeler SSL ile şifrelenir. İstediğiniz zaman iptal edebilirsiniz. 
              Demo modunda gerçek ödeme alınmaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;