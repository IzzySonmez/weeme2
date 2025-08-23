// src/components/Layout.tsx (ilgili kısım)
const tabs = [
  { id: 'dashboard', label: 'Skorum', icon: BarChart3, guard: () => true },
  { id: 'suggestions', label: 'Öneriler', icon: User, guard: () => true },
  { id: 'ai-content', label: 'Yapay Zeka Gönderi', icon: CreditCard, guard: (m?: string) => m === 'AdvancedSun' },
];

// ...
<span className={`px-2 py-1 rounded-full text-xs font-medium ${
  user?.membershipType === 'Free' ? 'bg-gray-100 text-gray-800'
  : user?.membershipType === 'ProSub' ? 'bg-blue-100 text-blue-800'
  : 'bg-purple-100 text-purple-800'
}`}>
  {user?.membershipType === 'ProSub' ? 'Pro Sub' : user?.membershipType === 'AdvancedSun' ? 'Advanced Sun' : 'Free'}
</span>

// Navigasyon butonlarında:
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
