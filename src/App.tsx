import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Suggestions from './components/Suggestions';
import AIContent from './components/AIContent';
import PaymentModal from './components/PaymentModal';
import Login from './components/Login';

type Tab = 'dashboard' | 'suggestions' | 'ai-content';

const AppInner: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [billingOpen, setBillingOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('activeTab');
    if (saved === 'dashboard' || saved === 'suggestions' || saved === 'ai-content') {
      setActiveTab(saved);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  if (isLoading) return <div className="min-h-screen grid place-items-center text-gray-600">Yükleniyor…</div>;
  if (!user) return <Login />;

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        onOpenBilling={() => setBillingOpen(true)}
        onLogout={() => setActiveTab('dashboard')}
      >
        {activeTab === 'dashboard' && <Dashboard onOpenBilling={() => setBillingOpen(true)} />}
        {activeTab === 'suggestions' && <Suggestions />}
        {activeTab === 'ai-content' && <AIContent />}
      </Layout>

      <PaymentModal isOpen={billingOpen} onClose={() => setBillingOpen(false)} />
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
