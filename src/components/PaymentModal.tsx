import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { user, addCredits, upgradeMembership } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>('credits');
  const [loading, setLoading] = useState(false);

  const packages = {
    credits: { 
      name: '50 Kredi', 
      price: '₺29.99', 
      description: 'Free üyeliğinize 50 kredi ekler', 
      features: ['50 SEO taraması', 'Temel raporlar', 'E-posta desteği'] 
    },
    pro: { 
      name: 'Pro Sub', 
      price: '₺99.99/ay', 
      description: 'Sınırsız SEO taraması ve AI SEO önerileri', 
      features: ['Sınırsız SEO taraması', 'AI SEO önerileri', 'Detaylı raporlar', 'Öncelikli destek'] 
    },
    advanced: { 
      name: 'Advanced Sun', 
      price: '₺199.99/ay', 
      description: 'Tüm özellikler + AI içerik üretimi', 
      features: ['Tüm Pro özellikler', 'AI içerik üretimi', 'Sosyal medya içerikleri', '7/24 destek'] 
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Paket Seçimi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(packages).map(([key, pkg]) => (
            <div
              key={key}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedPackage === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedPackage(key)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{pkg.name}</h3>
                <span className="text-lg font-bold text-blue-600">{pkg.price}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{pkg.description}</p>
              <ul className="text-sm text-gray-500">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : 'Satın Al'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;