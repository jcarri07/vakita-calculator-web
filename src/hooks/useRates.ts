import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AllRates, RateKey, RateItem, RateHistoryEntry } from '../types';
import {
  fetchAllRates,
  getStoredRates,
  getStoredHistory,
  saveHistory,
  clearHistory as clearStoredHistory,
  saveCustomRate,
  getCustomRate,
} from '../services/ratesService';

const THEME_KEY = 'vakita_theme';

const INITIAL_RATES: AllRates = {
  bcv: {
    key: 'bcv',
    name: 'Dólar BCV',
    code: 'USD',
    symbol: '$',
    rate: 881.07,
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
  },
  euro: {
    key: 'euro',
    name: 'Euro BCV',
    code: 'EUR',
    symbol: '€',
    rate: 991.16,
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
  },
  usdt: {
    key: 'usdt',
    name: 'USDT / Paralelo',
    code: 'USDT',
    symbol: '₮',
    rate: 998.82,
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
  },
  promedio: {
    key: 'promedio',
    name: 'Promedio BCV/USDT',
    code: 'PROM',
    symbol: '⚖️',
    rate: 939.95,
    lastUpdated: new Date().toISOString(),
    source: 'calculated',
  },
  custom: {
    key: 'custom',
    name: 'Personalizada',
    code: 'PERS',
    symbol: '⚙️',
    rate: 950.00,
    lastUpdated: new Date().toISOString(),
    source: 'custom',
  },
};

export function useRates() {
  const [rates, setRates] = useState<AllRates>(() => {
    const stored = getStoredRates();
    return stored || INITIAL_RATES;
  });

  const [selectedRateKey, setSelectedRateKey] = useState<RateKey>('bcv');
  const [rateHistory, setRateHistory] = useState<RateHistoryEntry[]>(() => getStoredHistory());
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved !== null ? saved === 'dark' : true;
  });
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const refreshRates = useCallback(async () => {
    setRefreshing(true);
    try {
      const { rates: newRates, newHistoryEntries } = await fetchAllRates();
      setRates(newRates);

      if (newHistoryEntries.length > 0) {
        setRateHistory(prev => {
          const updated = [...newHistoryEntries, ...prev];
          saveHistory(updated);
          return updated;
        });
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  const updateCustomRate = useCallback((rateVal: number) => {
    saveCustomRate(rateVal);
    setRates(prev => ({
      ...prev,
      custom: {
        ...prev.custom,
        rate: rateVal,
        lastUpdated: new Date().toISOString(),
      },
    }));
  }, []);

  const clearHistory = useCallback(() => {
    clearStoredHistory();
    setRateHistory([]);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const activeRate: RateItem = useMemo(() => {
    return rates[selectedRateKey] || rates.bcv;
  }, [rates, selectedRateKey]);

  return {
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
  };
}
