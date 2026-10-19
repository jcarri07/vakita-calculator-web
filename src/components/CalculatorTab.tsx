import { useState, useEffect } from 'react';
import type { AllRates, RateKey, RateItem } from '../types';
import { formatVE, parseVE, cleanNumericInput } from '../utils/format';
import { CopyButton } from './CopyButton';

interface CalculatorTabProps {
  rates: AllRates;
  selectedRateKey: RateKey;
  onSelectRate: (key: RateKey) => void;
  activeRate: RateItem;
  onUpdateCustomRate: (rate: number) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100, 500, 1000];

export function CalculatorTab({
  rates,
  selectedRateKey,
  onSelectRate,
  activeRate,
  onUpdateCustomRate,
  refreshing,
  onRefresh,
  onShowToast,
}: CalculatorTabProps) {
  const [foreignInput, setForeignInput] = useState('');
  const [vesInput, setVesInput] = useState('');
  const [customRateText, setCustomRateText] = useState(formatVE(rates.custom.rate, 2));

  // Recalculate when active rate changes
  useEffect(() => {
    const f = parseVE(foreignInput);
    if (f > 0) {
      setVesInput(formatVE(f * activeRate.rate, 2));
    }
  }, [activeRate.rate]);

  const handleForeignChange = (raw: string) => {
    const cleaned = cleanNumericInput(raw);
    setForeignInput(cleaned);
    const num = parseVE(cleaned);
    if (num > 0) {
      setVesInput(formatVE(num * activeRate.rate, 2));
    } else {
      setVesInput('');
    }
  };

  const handleForeignBlur = () => {
    const num = parseVE(foreignInput);
    if (num > 0) {
      setForeignInput(formatVE(num, 2));
    }
  };

  const handleVesChange = (raw: string) => {
    const cleaned = cleanNumericInput(raw);
    setVesInput(cleaned);
    const num = parseVE(cleaned);
    if (num > 0 && activeRate.rate > 0) {
      setForeignInput(formatVE(num / activeRate.rate, 2));
    } else {
      setForeignInput('');
    }
  };

  const handleVesBlur = () => {
    const num = parseVE(vesInput);
    if (num > 0) {
      setVesInput(formatVE(num, 2));
    }
  };

  const handleQuickAmount = (val: number) => {
    const formatted = formatVE(val, 2);
    setForeignInput(formatted);
    setVesInput(formatVE(val * activeRate.rate, 2));
  };

  const handleClear = () => {
    setForeignInput('');
    setVesInput('');
    onShowToast('Campos vaciados 🧹');
  };

  const handleSwap = () => {
    const tmpF = foreignInput;
    const tmpV = vesInput;
    setForeignInput(tmpV);
    setVesInput(tmpF);
  };

  const handleCustomRateInput = (text: string) => {
    const cleaned = cleanNumericInput(text);
    setCustomRateText(cleaned);
    const num = parseVE(cleaned);
    if (num > 0) {
      onUpdateCustomRate(num);
    }
  };

  const rateKeys: RateKey[] = ['bcv', 'euro', 'usdt', 'promedio', 'custom'];

  const getRateIcon = (key: RateKey) => {
    switch (key) {
      case 'bcv': return '🇻🇪';
      case 'euro': return '🇪🇺';
      case 'usdt': return '🟡';
      case 'promedio': return '⚖️';
      case 'custom': return '⚙️';
    }
  };

  return (
    <div className="scroll-content">
      {/* Header bar with Refresh */}
      <div className="rates-header-row animate-in">
        <div className="rates-header-title">
          <span>📊</span> Tasas Disponibles
        </div>
        <button
          className={`refresh-btn-mini ${refreshing ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={refreshing}
          title="Actualizar tasas desde la API"
        >
          {refreshing ? '⟳ Actualizando...' : '🔄 Actualizar'}
        </button>
      </div>

      {/* Rate Selection Grid */}
      <div className="rates-selector-grid animate-in">
        {rateKeys.map((key) => {
          const item = rates[key];
          const isSelected = selectedRateKey === key;
          return (
            <button
              key={key}
              type="button"
              className={`rate-select-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectRate(key)}
            >
              <div className="rate-card-top">
                <span className="rate-flag">{getRateIcon(key)}</span>
                <span className="rate-card-name">{item.name}</span>
              </div>
              <div className="rate-card-value">
                <span className="rate-card-bs">Bs.</span>
                <span className="rate-card-num">{formatVE(item.rate, 2)}</span>
              </div>
              <div className="rate-card-badge">
                {key === 'promedio' ? 'BCV + USDT' : key === 'custom' ? 'Manual' : item.code}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom rate input field if Custom is active */}
      {selectedRateKey === 'custom' && (
        <div className="card custom-rate-card animate-in">
          <div className="custom-rate-title">
            <span>⚙️</span> Ingresa tu tasa personalizada:
          </div>
          <div className="calc-input-row" style={{ marginTop: 8 }}>
            <div className="currency-tag ves">Bs.</div>
            <div className="calc-input-container">
              <input
                type="text"
                inputMode="decimal"
                className="calc-input-field"
                value={customRateText}
                onChange={(e) => handleCustomRateInput(e.target.value)}
                placeholder="Ej: 1.000,00"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Rate Banner */}
      <div className="card active-rate-banner animate-in animate-in-delay-1">
        <div className="active-rate-info">
          <span className="active-rate-badge-title">Tasa activa para cálculo:</span>
          <div className="active-rate-label">
            {getRateIcon(activeRate.key)} {activeRate.name} ({activeRate.code})
          </div>
        </div>
        <div className="active-rate-amount-wrap">
          <span className="active-rate-bs-label">Bs.</span>
          <span className="active-rate-amount">{formatVE(activeRate.rate, 2)}</span>
        </div>
      </div>

      {/* Converter Card */}
      <div className="card animate-in animate-in-delay-2">
        <div className="converter-card-header">
          <div className="card-title" style={{ marginBottom: 0 }}>
            <span>🧮 Calculadora</span>
          </div>

          {/* Botón de Limpiar */}
          <button
            type="button"
            className="btn-clear-action"
            onClick={handleClear}
            title="Limpiar ambos campos"
          >
            🧹 Limpiar
          </button>
        </div>

        {/* Quick Amount Chips */}
        <div className="chips-row">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              className={`chip ${foreignInput === formatVE(q, 2) ? 'chip-active' : ''}`}
              onClick={() => handleQuickAmount(q)}
            >
              {activeRate.symbol} {formatVE(q, 0)}
            </button>
          ))}
        </div>

        {/* Foreign Currency Field with integrated CopyButton inside container */}
        <div className="calc-field-label">
          {activeRate.name} ({activeRate.code})
        </div>
        <div className="calc-input-row">
          <div className="currency-tag usd">{activeRate.symbol}</div>
          <div className="calc-input-container">
            <input
              type="text"
              inputMode="decimal"
              className="calc-input-field"
              value={foreignInput}
              onChange={(e) => handleForeignChange(e.target.value)}
              onBlur={handleForeignBlur}
              placeholder="0,00"
              id="foreign-input"
            />
            {foreignInput && (
              <CopyButton
                textToCopy={`${activeRate.symbol} ${foreignInput}`}
                label={activeRate.code}
                onCopied={onShowToast}
              />
            )}
          </div>
        </div>

        {/* Swap Divider */}
        <div className="arrow-divider">
          <div className="arrow-line" />
          <div className="arrow-circle" onClick={handleSwap} title="Intercambiar valores">
            ⇅
          </div>
          <div className="arrow-line" />
        </div>

        {/* VES Field with integrated CopyButton inside container */}
        <div className="calc-field-label">Bolívares (VES)</div>
        <div className="calc-input-row">
          <div className="currency-tag ves">Bs.</div>
          <div className="calc-input-container">
            <input
              type="text"
              inputMode="decimal"
              className="calc-input-field"
              value={vesInput}
              onChange={(e) => handleVesChange(e.target.value)}
              onBlur={handleVesBlur}
              placeholder="0,00"
              id="ves-input"
            />
            {vesInput && (
              <CopyButton
                textToCopy={`Bs. ${vesInput}`}
                label="VES"
                onCopied={onShowToast}
              />
            )}
          </div>
        </div>

        {/* Equality Footer */}
        <div className="calc-footer-rate">
          1 {activeRate.code} = <strong>Bs. {formatVE(activeRate.rate, 2)}</strong>
        </div>
      </div>

      {/* Info Tip */}
      <div className="tip-card animate-in animate-in-delay-3">
        <span className="tip-icon">💡</span>
        <span className="tip-text">
          Sistema decimal venezolano: <strong>1.000,99</strong> (punto para miles, coma para decimales). Los botones de copiar se mantienen perfectamente contenidos dentro de la tarjeta.
        </span>
      </div>
    </div>
  );
}
