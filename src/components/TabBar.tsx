import type { TabId } from '../types';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'calculator', icon: '\u{1F9EE}', label: 'Calculadora' },
  { id: 'commissions', icon: '\u{1F4B8}', label: 'Comisiones' },
  { id: 'history', icon: '\u{1F4C8}', label: 'Historial Tasas' },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={tab.label}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
