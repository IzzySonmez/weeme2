import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, Lightbulb, Sparkles, CreditCard, Settings, User, Crown } from 'lucide-react';

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

  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<any>; guard: (m?: string) => boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, guard: () => true },
    { id: 'suggestions', label: 'AI Öneriler', icon: Lightbulb, guard: (m?: string) => m === 'Pro' || m === 'Advanced' },
    { id: 'ai-content', label: 'İçerik Üret', icon: Sparkles, guard: (m?: string) => m === 'Advanced' },
  ];

  const membershipBadge = {
    'Advanced': { 
      component: <span className="px-4 py-2 rounded-full text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-bold border border-purple-200 shadow-lg">Advanced</span>,
      icon: <Crown className="h-5 w-5 text-purple-600" />
    },
    'Pro': { 
      component: <span className="px-4 py-2 rounded-full text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-bold border border-blue-200 shadow-lg">Pro</span>,
      icon: <Settings className="h-5 w-5 text-blue-600" />
    },
    'Free': { 
      component: <span className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 font-semibold border border-gray-200">Free</span>,
      icon: <User className="h-5 w-5 text-gray-600" />
    }
  };

  const currentMembership = membershipBadge[user?.membershipType || 'Free'];

  const creditLabel =
    user?.membershipType === 'Free'
      ? <span className="text-sm text-gray-700 flex items-center gap-2 glass px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Kredi: <b>{user?.credits ?? 0}</b>
        </span>
      : <span className="text-sm text-gray-700 flex items-center gap-2 glass px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <b>Sınırsız</b>
        </span>;

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="glass border-b border-white/20 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center gap-3 group"
                aria-label="weeme.ai ana sayfa"
              >
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-purple-600 group-hover:text-purple-700 transition-colors animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-pink-700 transition-all">
                  weeme.ai
                </span>
              </Link>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-gray-600">
                  Hoş geldin, <span className="font-bold text-gray-900">{user?.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  {currentMembership.icon}
                  {currentMembership.component}
                </div>
                <div className="hidden md:block">{creditLabel}</div>
              </div>

              <button
                onClick={onOpenBilling}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105"
                aria-label="Plan ve ödeme ayarları"
              >
                <CreditCard className="h-5 w-5" />
                <span className="hidden sm:inline">Plan & Ödeme</span>
                <span className="sm:hidden">Plan</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 glass px-4 py-3 rounded-2xl hover:bg-white/80 transition-all duration-200"
                aria-label="Çıkış yap"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav 
        key={`${user?.id}-${user?.membershipType}`} 
        className="glass border-b border-white/20 shadow-lg"
        role="navigation"
        aria-label="Ana navigasyon"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const allowed = tab.guard(user?.membershipType);
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => allowed && onTabChange(tab.id)}
                  className={`relative flex items-center space-x-3 py-6 px-8 font-bold text-lg transition-all duration-300 rounded-t-3xl ${
                    active 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl transform -translate-y-2'
                      : allowed
                        ? 'text-gray-700 hover:text-purple-600 hover:bg-white/60 glass hover:shadow-xl hover:-translate-y-1'
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                  disabled={!allowed}
                  aria-current={active ? 'page' : undefined}
                  title={!allowed ? `Bu sekme ${tab.guard('Pro') ? 'Pro' : 'Advanced'} üyelerde aktif` : undefined}
                  role="tab"
                  aria-selected={active}
                >
                  <Icon className="h-6 w-6" />
                  <span>{tab.label}</span>
                  
                  {!allowed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        className="flex-1"
        role="main"
        aria-label="Ana içerik"
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;