import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, Lightbulb, Sparkles, CreditCard } from 'lucide-react';

type Tab = 'dashboard' | 'suggestions' | 'ai-content';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenBilling: () => void;
  onOpenDataTools?: () => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onOpenBilling,
  onOpenDataTools,
  onLogout,
}) => {
  const { user, logout } = useAuth();

  // Sekmeler (guard'lar membershipType'a bağlı)
  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<any>; guard: (m?: string) => boolean }> = [
    { id: 'dashboard', label: 'Skorum', icon: BarChart3, guard: () => true },
    { id: 'suggestions', label: 'Öneriler', icon: Lightbulb, guard: () => true },
    { id: 'ai-content', label: 'Yapay Zeka Gönderi', icon: Sparkles, guard: (m?: string) => m === 'Advanced' },
  ];

  const membershipBadge =
    user?.membershipType === 'Advanced'
      ? <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">Advanced</span>
      : user?.membershipType === 'Pro'
      ? <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">Pro</span>
      : <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">Free</span>;

  const creditLabel =
    user?.membershipType === 'Free'
      ? <span className="text-sm text-gray-700">Kredi: <b>{user?.credits ?? 0}</b></span>
      : <span className="text-sm text-gray-700">Kredi: ∞</span>;

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">SEO Optimizer</h1>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:inline">Hoş geldin, {user?.username}</span>
              {membershipBadge}
              <div className="hidden sm:block">{creditLabel}</div>

              <button
                onClick={onOpenBilling}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border hover:bg-gray-50"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Plan / Ödeme</span>
              </button>

              {onOpenDataTools && (
                <button
                  onClick={onOpenDataTools}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border hover:bg-gray-50"
                >
                  {/* opsiyonel veri aracı butonun varsa ikon ekleyebilirsin */}
                  <span className="text-sm">Veri</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {/* ÖNEMLİ: key ile membership değişince nav yeniden oluşturulsun (guard anında yansısın) */}
      <nav key={`${user?.id}-${user?.membershipType}`} className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const allowed = tab.guard(user?.membershipType);
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => allowed && onTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    active ? 'border-blue-500 text-blue-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${!allowed ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={!allowed}
                  aria-current={active ? 'page' : undefined}
                  title={!allowed ? 'Bu sekme Advanced üyelerde aktif' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
