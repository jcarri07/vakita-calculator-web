import { useState } from 'react';
import type { TabId } from './types';
import { useRates } from './hooks/useRates';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { CalculatorTab } from './components/CalculatorTab';
import { CommissionsTab } from './components/CommissionsTab';
import { HistoryTab } from './components/HistoryTab';
import { IosInstallBanner } from './components/IosInstallBanner';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('calculator');
  const {
    rates,
    selectedRateKey,
    setSelectedRateKey,
    activeRate,
    rateHistory,
    isDark,
    refreshing,
    toast,
    refreshRates,
    updateCustomRate,
    clearHistory,
    toggleTheme,
    showToast,
  } = useRates();

  return (
    <div className="app-container">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="main-content">
        <IosInstallBanner />

        {activeTab === 'calculator' && (
          <CalculatorTab
            rates={rates}
            selectedRateKey={selectedRateKey}
            onSelectRate={setSelectedRateKey}
            activeRate={activeRate}
            onUpdateCustomRate={updateCustomRate}
            refreshing={refreshing}
            onRefresh={refreshRates}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'commissions' && (
          <CommissionsTab
            activeRate={activeRate}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            history={rateHistory}
            onClear={clearHistory}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      <div className={`toast ${toast ? 'visible' : ''}`} role="status">
        {toast}
      </div>

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export default App;
