import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, User, CreditCard, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Skorum', icon: BarChart3, guard: () => true },
    { id: 'suggestions', label: 'Öneriler', icon: User, guard: () => true },
    { id: 'ai-content', label: 'Yapay Zeka Gönderi', icon: CreditCard, guard: (m?: string) => m === 'AdvancedSun' },
  ];

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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hoş geldin, {user?.username}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.membershipType === 'Free' ? 'bg-gray-100 text-gray-800'
                  : user?.membershipType === 'ProSub' ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
                }`}>
                  {user?.membershipType === 'ProSub' ? 'Pro Sub' : user?.membershipType === 'AdvancedSun' ? 'Advanced Sun' : 'Free'}
                </span>
                {user?.membershipType === 'Free' && (
                  <span className="text-sm text-gray-600">
                    Kredi: {user.credits}
                  </span>
                )}
              </div>
              <button
                onClick={logout}
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const allowed = tab.guard(user?.membershipType);
              return (
                <button
                  key={tab.id}
                  onClick={() => allowed && onTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${!allowed ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={!allowed}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;