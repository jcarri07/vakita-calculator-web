import type { AllRates, RateHistoryEntry, RateKey } from '../types';

const STORAGE_RATES_KEY = 'vakita_all_rates';
const STORAGE_HISTORY_KEY = 'vakita_rate_history';
const STORAGE_CUSTOM_RATE_KEY = 'vakita_custom_rate';

const FALLBACK_BCV = 881.07;
const FALLBACK_EUR = 991.16;
const FALLBACK_USDT = 998.82;

// Seed history with rich daily records for the current day and past days
function generateSeedHistory(): RateHistoryEntry[] {
  const now = new Date();
  const formatISO = (daysAgo: number, hour: number, min: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, min, 0, 0);
    return d.toISOString();
  };

  return [
    // Hoy
    {
      id: 'h-today-1',
      rateKey: 'bcv',
      rateName: 'Dólar BCV',
      code: 'USD',
      symbol: '$',
      rate: 881.07,
      previousRate: 874.20,
      change: 6.87,
      changePct: 0.79,
      timestamp: formatISO(0, 10, 30),
      source: 'Oficial BCV',
    },
    {
      id: 'h-today-2',
      rateKey: 'usdt',
      rateName: 'USDT / Paralelo',
      code: 'USDT',
      symbol: '₮',
      rate: 998.82,
      previousRate: 989.50,
      change: 9.32,
      changePct: 0.94,
      timestamp: formatISO(0, 9, 15),
      source: 'Mercado P2P',
    },
    {
      id: 'h-today-3',
      rateKey: 'euro',
      rateName: 'Euro BCV',
      code: 'EUR',
      symbol: '€',
      rate: 991.16,
      previousRate: 984.30,
      change: 6.86,
      changePct: 0.70,
      timestamp: formatISO(0, 8, 45),
      source: 'Oficial BCV',
    },
    // Ayer
    {
      id: 'h-yest-1',
      rateKey: 'bcv',
      rateName: 'Dólar BCV',
      code: 'USD',
      symbol: '$',
      rate: 874.20,
      previousRate: 869.80,
      change: 4.40,
      changePct: 0.51,
      timestamp: formatISO(1, 14, 0),
      source: 'Oficial BCV',
    },
    {
      id: 'h-yest-2',
      rateKey: 'usdt',
      rateName: 'USDT / Paralelo',
      code: 'USDT',
      symbol: '₮',
      rate: 989.50,
      previousRate: 978.00,
      change: 11.50,
      changePct: 1.18,
      timestamp: formatISO(1, 13, 0),
      source: 'Mercado P2P',
    },
    {
      id: 'h-yest-3',
      rateKey: 'euro',
      rateName: 'Euro BCV',
      code: 'EUR',
      symbol: '€',
      rate: 984.30,
      previousRate: 979.10,
      change: 5.20,
      changePct: 0.53,
      timestamp: formatISO(1, 9, 30),
      source: 'Oficial BCV',
    },
    // Hace 2 días
    {
      id: 'h-2d-1',
      rateKey: 'bcv',
      rateName: 'Dólar BCV',
      code: 'USD',
      symbol: '$',
      rate: 869.80,
      previousRate: 865.10,
      change: 4.70,
      changePct: 0.54,
      timestamp: formatISO(2, 11, 0),
      source: 'Oficial BCV',
    },
    {
      id: 'h-2d-2',
      rateKey: 'usdt',
      rateName: 'USDT / Paralelo',
      code: 'USDT',
      symbol: '₮',
      rate: 978.00,
      previousRate: 970.50,
      change: 7.50,
      changePct: 0.77,
      timestamp: formatISO(2, 14, 30),
      source: 'Mercado P2P',
    },
    {
      id: 'h-2d-3',
      rateKey: 'euro',
      rateName: 'Euro BCV',
      code: 'EUR',
      symbol: '€',
      rate: 979.10,
      previousRate: 974.40,
      change: 4.70,
      changePct: 0.48,
      timestamp: formatISO(2, 9, 0),
      source: 'Oficial BCV',
    },
    // Hace 3 días
    {
      id: 'h-3d-1',
      rateKey: 'bcv',
      rateName: 'Dólar BCV',
      code: 'USD',
      symbol: '$',
      rate: 865.10,
      previousRate: 860.00,
      change: 5.10,
      changePct: 0.59,
      timestamp: formatISO(3, 10, 0),
      source: 'Oficial BCV',
    },
    {
      id: 'h-3d-2',
      rateKey: 'usdt',
      rateName: 'USDT / Paralelo',
      code: 'USDT',
      symbol: '₮',
      rate: 970.50,
      previousRate: 962.00,
      change: 8.50,
      changePct: 0.88,
      timestamp: formatISO(3, 13, 45),
      source: 'Mercado P2P',
    },
    {
      id: 'h-3d-3',
      rateKey: 'euro',
      rateName: 'Euro BCV',
      code: 'EUR',
      symbol: '€',
      rate: 974.40,
      previousRate: 968.20,
      change: 6.20,
      changePct: 0.64,
      timestamp: formatISO(3, 9, 15),
      source: 'Oficial BCV',
    },
  ];
}

export function getCustomRate(): number {
  try {
    const saved = localStorage.getItem(STORAGE_CUSTOM_RATE_KEY);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val > 0) return val;
    }
  } catch {}
  return 950.00;
}

export function saveCustomRate(rate: number): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_RATE_KEY, rate.toString());
  } catch {}
}

export function getStoredHistory(): RateHistoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return generateSeedHistory();
}

export function saveHistory(history: RateHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 150)));
  } catch {}
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  } catch {}
}

export function getStoredRates(): AllRates | null {
  try {
    const saved = localStorage.getItem(STORAGE_RATES_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export async function fetchAllRates(): Promise<{ rates: AllRates; newHistoryEntries: RateHistoryEntry[] }> {
  let bcvVal = FALLBACK_BCV;
  let eurVal = FALLBACK_EUR;
  let usdtVal = FALLBACK_USDT;
  let isApi = false;

  try {
    const [bcvRes, eurRes, usdtRes] = await Promise.allSettled([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.json()),
      fetch('https://ve.dolarapi.com/v1/euros/oficial').then(r => r.json()),
      fetch('https://ve.dolarapi.com/v1/dolares/paralelo').then(r => r.json()),
    ]);

    if (bcvRes.status === 'fulfilled' && bcvRes.value?.promedio) {
      bcvVal = Number(bcvRes.value.promedio);
      isApi = true;
    }
    if (eurRes.status === 'fulfilled' && eurRes.value?.promedio) {
      eurVal = Number(eurRes.value.promedio);
      isApi = true;
    }
    if (usdtRes.status === 'fulfilled' && usdtRes.value?.promedio) {
      usdtVal = Number(usdtRes.value.promedio);
      isApi = true;
    }
  } catch {
    const cached = getStoredRates();
    if (cached) {
      return { rates: cached, newHistoryEntries: [] };
    }
  }

  const promedioVal = (bcvVal + usdtVal) / 2;
  const customVal = getCustomRate();
  const now = new Date().toISOString();
  const source = isApi ? 'api' : 'fallback';

  const rates: AllRates = {
    bcv: {
      key: 'bcv',
      name: 'Dólar BCV',
      code: 'USD',
      symbol: '$',
      rate: bcvVal,
      lastUpdated: now,
      source,
    },
    euro: {
      key: 'euro',
      name: 'Euro BCV',
      code: 'EUR',
      symbol: '€',
      rate: eurVal,
      lastUpdated: now,
      source,
    },
    usdt: {
      key: 'usdt',
      name: 'USDT / Paralelo',
      code: 'USDT',
      symbol: '₮',
      rate: usdtVal,
      lastUpdated: now,
      source,
    },
    promedio: {
      key: 'promedio',
      name: 'Promedio BCV/USDT',
      code: 'PROM',
      symbol: '⚖️',
      rate: promedioVal,
      lastUpdated: now,
      source: 'calculated',
    },
    custom: {
      key: 'custom',
      name: 'Personalizada',
      code: 'PERS',
      symbol: '⚙️',
      rate: customVal,
      lastUpdated: now,
      source: 'custom',
    },
  };

  const currentHistory = getStoredHistory();
  const newHistoryEntries: RateHistoryEntry[] = [];

  const rateConfigs: { key: RateKey; name: string; code: string; symbol: string; val: number; src: string }[] = [
    { key: 'bcv', name: 'Dólar BCV', code: 'USD', symbol: '$', val: bcvVal, src: 'Oficial BCV' },
    { key: 'euro', name: 'Euro BCV', code: 'EUR', symbol: '€', val: eurVal, src: 'Oficial BCV' },
    { key: 'usdt', name: 'USDT / Paralelo', code: 'USDT', symbol: '₮', val: usdtVal, src: 'Mercado P2P' },
  ];

  for (const item of rateConfigs) {
    const latestForType = currentHistory.find(h => h.rateKey === item.key);
    if (!latestForType || Math.abs(latestForType.rate - item.val) > 0.001) {
      const prev = latestForType ? latestForType.rate : item.val;
      const diff = item.val - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : 0;

      newHistoryEntries.push({
        id: 'hist-' + Date.now() + '-' + item.key,
        rateKey: item.key,
        rateName: item.name,
        code: item.code,
        symbol: item.symbol,
        rate: item.val,
        previousRate: prev,
        change: diff,
        changePct: pct,
        timestamp: now,
        source: item.src,
      });
    }
  }

  try {
    localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify(rates));
  } catch {}

  return { rates, newHistoryEntries };
}
