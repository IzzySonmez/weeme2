import React, { useState } from 'react';
import { X, CreditCard, Crown, Sparkles, Loader } from 'lucide-react';
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
}> = {
  credits: {
    title: '50 Kredi Paketi',
    price: '₺29.99',
    description: 'Free üyeliğinize 50 kredi ekler.',
    features: ['50 SEO taraması', 'Temel raporlar', 'E-posta desteği'],
  },
  pro: {
    title: 'Pro Üyelik',
    price: '₺99.99 / ay',
    description: 'Sınırsız SEO taraması. (AI içerik üretimi yok)',
    features: ['Sınırsız tarama (adil kullanım)', 'AI SEO önerileri', 'Detaylı raporlar', 'Öncelikli destek'],
  },
  advanced: {
    title: 'Advanced Üyelik',
    price: '₺199.99 / ay',
    description: 'Tüm özellikler + AI içerik üretimi.',
    features: ['Tüm Pro özellikleri', 'AI içerik üretimi (LinkedIn/IG/X/FB)', 'Genişletilmiş raporlar', '7/24 destek'],
  },
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { user, addCredits, upgradeMembership } = useAuth();
  const [selected, setSelected] = useState<PackageKey>('credits');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);

    // Sprint 1: DEMO — gerçek ödeme yerine simülasyon
    setTimeout(() => {
      if (selected === 'credits') {
        addCredits(50);
        alert('50 kredi hesabınıza eklendi!');
      } else if (selected === 'pro') {
        upgradeMembership('Pro');
        alert('Pro üyelik aktif!');
      } else if (selected === 'advanced') {
        upgradeMembership('Advanced');
        alert('Advanced üyelik aktif!');
      }
      setLoading(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Plan & Ödeme</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kredi Paketi */}
          <button
            onClick={() => setSelected('credits')}
            className={`text-left border rounded-lg p-4 transition ${
              selected === 'credits' ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <span className="font-medium">{PACKS.credits.title}</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{PACKS.credits.description}</div>
            <div className="text-lg font-semibold mb-3">{PACKS.credits.price}</div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              {PACKS.credits.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </button>

          {/* Pro */}
          <button
            onClick={() => setSelected('pro')}
            className={`text-left border rounded-lg p-4 transition ${
              selected === 'pro' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{PACKS.pro.title}</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{PACKS.pro.description}</div>
            <div className="text-lg font-semibold mb-3">{PACKS.pro.price}</div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              {PACKS.pro.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </button>

          {/* Advanced */}
          <button
            onClick={() => setSelected('advanced')}
            className={`text-left border rounded-lg p-4 transition ${
              selected === 'advanced' ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium">{PACKS.advanced.title}</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{PACKS.advanced.description}</div>
            <div className="text-lg font-semibold mb-3">{PACKS.advanced.price}</div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              {PACKS.advanced.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </button>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Seçim:</span>{' '}
            {PACKS[selected].title} — {PACKS[selected].price}
          </div>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            <span>Onayla</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
