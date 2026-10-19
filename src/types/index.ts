export type RateKey = 'bcv' | 'euro' | 'usdt' | 'promedio' | 'custom';

export interface RateItem {
  key: RateKey;
  name: string;
  symbol: string;
  code: string;
  rate: number;
  lastUpdated: string;
  source: 'api' | 'cache' | 'calculated' | 'custom' | 'fallback';
  change?: number;
  changePct?: number;
}

export interface AllRates {
  bcv: RateItem;
  euro: RateItem;
  usdt: RateItem;
  promedio: RateItem;
  custom: RateItem;
}

export interface RateHistoryEntry {
  id: string;
  rateKey: RateKey;
  rateName: string;
  code: string;
  symbol: string;
  rate: number;
  previousRate?: number;
  change?: number;
  changePct?: number;
  timestamp: string;
  source: string;
}

export type TabId = 'calculator' | 'commissions' | 'history';
