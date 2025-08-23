import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, CreditCard, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { user, updateCredits } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<'credits' | 'pro' | 'advanced'>('credits');
  const [loading, setLoading] = useState(false);

  const packages = {
    credits: {
      name: '50 Kredi',
      price: '₺29.99',
      description: 'Free üyeliğinize 50 kredi ekler',
      features: ['50 SEO taraması', 'Temel raporlar', 'E-posta desteği']
    },
    pro: {
      name: 'Pro Üyelik',
      price: '₺99.99/ay',
      description: 'Sınırsız SEO taraması ve AI önerileri',
      features: ['Sınırsız SEO taraması', 'AI SEO önerileri', 'Detaylı raporlar', 'Öncelikli destek']
    },
    advanced: {
      name: 'Advanced Üyelik',
      price: '₺199.99/ay',
      description: 'Tüm özellikler + AI içerik üretimi',
      features: ['Tüm Pro özellikler', 'AI içerik üretimi', 'Sosyal medya içerikleri', '7/24 destek']
    }
  };

  const handlePayment = async () => {
    if (!user) return;

    setLoading(true);

    // Simulate payment process
    setTimeout(() => {
      if (selectedPackage === 'credits') {
        updateCredits(user.credits + 50);
        alert('50 kredi hesabınıza eklendi!');
      } else {
        // In a real app, this would update the user's membership
        alert(`${packages[selectedPackage].name} başarıyla satın alındı!`);
      }
      setLoading(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Ödeme</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Package Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Paket Seçin</h3>
            {Object.entries(packages).map(([key, pkg]) => (
              <div
                key={key}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPackage(key as any)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPackage === key
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPackage === key && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{pkg.price}</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ödeme Bilgileri</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  <strong>Demo Ödeme:</strong> Bu bir demo uygulamasıdır. Gerçek ödeme işlemi yapılmayacaktır.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Numarası
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Kullanma
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Sahibi
                </label>
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>{packages[selectedPackage].price} Öde</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;