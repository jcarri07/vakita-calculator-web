import { useState, useMemo } from 'react';
import type { RateHistoryEntry, RateKey } from '../types';
import { formatVE } from '../utils/format';
import { CopyButton } from './CopyButton';

interface HistoryTabProps {
  history: RateHistoryEntry[];
  onClear: () => void;
  onShowToast: (msg: string) => void;
}

type TabFilter = 'all' | 'bcv' | 'usdt' | 'euro';
type DayQuickFilter = 'all' | 'today' | 'yesterday' | 'week';

function getLocalDateString(iso: string): string {
  try {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

function formatDayHeader(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    const now = new Date();
    const todayStr = getLocalDateString(now.toISOString());

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday.toISOString());

    let prefix = '';
    if (dateStr === todayStr) {
      prefix = 'Hoy • ';
    } else if (dateStr === yesterdayStr) {
      prefix = 'Ayer • ';
    }

    const formatted = targetDate.toLocaleDateString('es-VE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return prefix + formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function HistoryTab({ history, onClear, onShowToast }: HistoryTabProps) {
  const [currencyTab, setCurrencyTab] = useState<TabFilter>('bcv');
  const [quickDayFilter, setQuickDayFilter] = useState<DayQuickFilter>('all');
  const [customDate, setCustomDate] = useState<string>('');

  const now = new Date();
  const todayStr = getLocalDateString(now.toISOString());
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday.toISOString());

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // 1. Currency tab filter
      if (currencyTab !== 'all' && item.rateKey !== currencyTab) {
        return false;
      }

      const itemDateStr = getLocalDateString(item.timestamp);

      // 2. Custom date filter takes precedence if set
      if (customDate) {
        return itemDateStr === customDate;
      }

      // 3. Quick day filter
      if (quickDayFilter === 'today') {
        return itemDateStr === todayStr;
      }
      if (quickDayFilter === 'yesterday') {
        return itemDateStr === yesterdayStr;
      }
      if (quickDayFilter === 'week') {
        const itemDate = new Date(item.timestamp);
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }

      return true;
    });
  }, [history, currencyTab, customDate, quickDayFilter, todayStr, yesterdayStr, now]);

  // Group by day string
  const groupedByDay = useMemo(() => {
    const groups: { [dateStr: string]: RateHistoryEntry[] } = {};
    for (const item of filteredHistory) {
      const dateStr = getLocalDateString(item.timestamp);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    }
    return groups;
  }, [filteredHistory]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDay).sort((a, b) => (a > b ? -1 : 1));
  }, [groupedByDay]);

  const getIcon = (key: RateKey) => {
    switch (key) {
      case 'bcv': return '🇻🇪';
      case 'euro': return '🇪🇺';
      case 'usdt': return '🟡';
      case 'promedio': return '⚖️';
      case 'custom': return '⚙️';
    }
  };

  const handleClearDate = () => {
    setCustomDate('');
    onShowToast('Filtro de fecha limpiado');
  };

  return (
    <div className="scroll-content">
      {/* Currency Tabs */}
      <div className="card currency-tabs-card animate-in">
        <div className="card-title" style={{ marginBottom: 12 }}>
          <span>📈 Historial de Tasas</span>
          <span className="history-counter-pill">
            {filteredHistory.length} {filteredHistory.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {/* Tab selector for BCV, USDT, Euro, All */}
        <div className="history-tab-bar">
          <button
            type="button"
            className={`history-tab-item ${currencyTab === 'bcv' ? 'active' : ''}`}
            onClick={() => setCurrencyTab('bcv')}
          >
            <span>🇻🇪</span> Dólar BCV
          </button>
          <button
            type="button"
            className={`history-tab-item ${currencyTab === 'usdt' ? 'active' : ''}`}
            onClick={() => setCurrencyTab('usdt')}
          >
            <span>🟡</span> USDT
          </button>
          <button
            type="button"
            className={`history-tab-item ${currencyTab === 'euro' ? 'active' : ''}`}
            onClick={() => setCurrencyTab('euro')}
          >
            <span>🇪🇺</span> Euro BCV
          </button>
          <button
            type="button"
            className={`history-tab-item ${currencyTab === 'all' ? 'active' : ''}`}
            onClick={() => setCurrencyTab('all')}
          >
            <span>⚖️</span> Todas
          </button>
        </div>
      </div>

      {/* Date Filters Card */}
      <div className="card date-filters-card animate-in animate-in-delay-1">
        <div className="date-filter-top">
          <div className="date-filter-label">
            <span>📅</span> Filtrar por fecha exacta:
          </div>
          {customDate && (
            <button type="button" className="btn-clear-date" onClick={handleClearDate}>
              ✕ Quitar fecha
            </button>
          )}
        </div>

        {/* Date Input */}
        <div className="date-input-wrapper">
          <input
            type="date"
            className="date-picker-input"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setQuickDayFilter('all');
            }}
          />
        </div>

        {/* Day Quick Chips */}
        <div className="quick-days-row">
          <button
            type="button"
            className={`day-chip ${quickDayFilter === 'all' && !customDate ? 'active' : ''}`}
            onClick={() => {
              setQuickDayFilter('all');
              setCustomDate('');
            }}
          >
            Todos los días
          </button>
          <button
            type="button"
            className={`day-chip ${quickDayFilter === 'today' && !customDate ? 'active' : ''}`}
            onClick={() => {
              setQuickDayFilter('today');
              setCustomDate('');
            }}
          >
            Hoy
          </button>
          <button
            type="button"
            className={`day-chip ${quickDayFilter === 'yesterday' && !customDate ? 'active' : ''}`}
            onClick={() => {
              setQuickDayFilter('yesterday');
              setCustomDate('');
            }}
          >
            Ayer
          </button>
          <button
            type="button"
            className={`day-chip ${quickDayFilter === 'week' && !customDate ? 'active' : ''}`}
            onClick={() => {
              setQuickDayFilter('week');
              setCustomDate('');
            }}
          >
            Últimos 7 días
          </button>
        </div>
      </div>

      {/* Grouped Day List */}
      {sortedDates.length === 0 ? (
        <div className="card animate-in animate-in-delay-2">
          <div className="history-empty">
            <div className="history-empty-icon">📊</div>
            <div className="history-empty-title">No hay tasas para este filtro</div>
            <div className="history-empty-text">
              {customDate
                ? `No se encontraron registros de tasas para la fecha ${customDate}.`
                : 'Intenta seleccionando otra pestaña o limpiando los filtros de fecha.'}
            </div>
            {customDate && (
              <button
                type="button"
                className="chip chip-active"
                onClick={handleClearDate}
                style={{ marginTop: 12 }}
              >
                Ver todos los días
              </button>
            )}
          </div>
        </div>
      ) : (
        sortedDates.map((dateStr, groupIndex) => {
          const dayItems = groupedByDay[dateStr];
          return (
            <div
              key={dateStr}
              className={`day-group-section animate-in animate-in-delay-${Math.min(groupIndex + 1, 4)}`}
            >
              {/* Day Section Header */}
              <div className="day-section-header">
                <span className="day-header-title">{formatDayHeader(dateStr)}</span>
                <span className="day-header-badge">
                  {dayItems.length} {dayItems.length === 1 ? 'tasa' : 'tasas'}
                </span>
              </div>

              {/* Day Items */}
              <div className="day-items-list">
                {dayItems.map((item) => {
                  const hasDiff = typeof item.change === 'number' && item.change !== 0;
                  const isPositive = (item.change ?? 0) > 0;
                  const copyText = `${item.rateName} (${item.code}): Bs. ${formatVE(item.rate, 2)} - ${formatDayHeader(dateStr)} ${formatTime(item.timestamp)}`;

                  return (
                    <div key={item.id} className="rate-history-card">
                      <div className="rate-history-left">
                        <span className="rate-history-flag">{getIcon(item.rateKey)}</span>
                        <div>
                          <div className="rate-history-title">
                            {item.rateName}{' '}
                            <span className="rate-history-code">{item.code}</span>
                          </div>
                          <div className="rate-history-date">
                            {formatTime(item.timestamp)} •{' '}
                            <span className="rate-history-source">{item.source}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rate-history-right">
                        <div className="rate-history-amount">
                          Bs. {formatVE(item.rate, 2)}
                        </div>
                        {hasDiff && (
                          <div className={`rate-change-badge ${isPositive ? 'up' : 'down'}`}>
                            {isPositive ? '▲ +' : '▼ '}
                            {formatVE(Math.abs(item.change!), 2)} (
                            {item.changePct! > 0 ? '+' : ''}
                            {formatVE(item.changePct!, 2)}%)
                          </div>
                        )}
                        {item.previousRate && (
                          <div className="rate-previous-sub">
                            Ant: Bs. {formatVE(item.previousRate, 2)}
                          </div>
                        )}
                      </div>

                      <CopyButton
                        textToCopy={copyText}
                        label={item.rateName}
                        onCopied={onShowToast}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Clear History Button */}
      {history.length > 0 && (
        <div className="history-clear">
          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => {
              if (window.confirm('¿Deseas reiniciar el historial de tasas?')) {
                onClear();
                onShowToast('Historial vaciado');
              }
            }}
          >
            🗑️ Limpiar historial completo
          </button>
        </div>
      )}
    </div>
  );
}
