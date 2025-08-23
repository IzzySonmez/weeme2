import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Suggestions from './components/Suggestions';
import AIContent from './components/AIContent';
import PaymentModal from './components/PaymentModal';
import { CreditCard } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'suggestions':
        return <Suggestions />;
      case 'ai-content':
        return <AIContent />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Credit Purchase Banner */}
        {user.membershipType === 'Free' && user.credits <= 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Krediniz azalıyor! Daha fazla SEO taraması için kredi satın alın.
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm"
              >
                Kredi Satın Al
              </button>
            </div>
          </div>
        )}

        {renderContent()}
      </Layout>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;