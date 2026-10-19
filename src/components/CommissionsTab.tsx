import { useState } from 'react';
import type { RateItem } from '../types';
import { formatVE, parseVE, cleanNumericInput } from '../utils/format';
import { CopyButton } from './CopyButton';

interface CommissionsTabProps {
  activeRate: RateItem;
  onShowToast: (msg: string) => void;
}

interface Preset {
  name: string;
  pct: number;
  icon: string;
  desc: string;
}

const PRESETS: Preset[] = [
  { name: 'Pago Móvil', pct: 0.3, icon: '📲', desc: '0,3% comisión bancaria interbancaria' },
  { name: 'Transferencia', pct: 0.3, icon: '🏦', desc: '0,3% interbancaria inmediata' },
  { name: 'Punto de Venta', pct: 1.5, icon: '💳', desc: '1,5% tarifa POS débito comercial' },
  { name: 'Tarjeta Crédito', pct: 3.0, icon: '💳', desc: '3,0% comisión tarjeta de crédito' },
  { name: 'Avance Efectivo', pct: 5.0, icon: '💵', desc: '5,0% retiro o avance en bolívares' },
];

export function CommissionsTab({ activeRate, onShowToast }: CommissionsTabProps) {
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0);
  const [customPct, setCustomPct] = useState('');
  const [mode, setMode] = useState<'deduct' | 'cover'>('deduct');

  const preset = selectedPreset !== null ? PRESETS[selectedPreset] : null;
  const pct = preset ? preset.pct : customPct ? parseVE(customPct) || 0 : 0;
  const serviceName = preset ? preset.name : customPct ? `Comisión ${customPct}%` : 'Personalizada';

  const amountVES = parseVE(amount) || 0;

  let grossVES = 0;
  let commissionVES = 0;
  let netVES = 0;

  if (mode === 'deduct') {
    grossVES = amountVES;
    commissionVES = grossVES * (pct / 100);
    netVES = Math.max(0, grossVES - commissionVES);
  } else {
    netVES = amountVES;
    const factor = 1 - pct / 100;
    grossVES = factor > 0 ? netVES / factor : netVES;
    commissionVES = grossVES - netVES;
  }

  const grossUSD = activeRate.rate > 0 ? grossVES / activeRate.rate : 0;
  const netUSD = activeRate.rate > 0 ? netVES / activeRate.rate : 0;
  const commissionUSD = activeRate.rate > 0 ? commissionVES / activeRate.rate : 0;

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setCustomPct('');
  };

  const handleCustomPctChange = (val: string) => {
    const cleaned = cleanNumericInput(val);
    setCustomPct(cleaned);
    setSelectedPreset(null);
  };

  const handleAmountChange = (raw: string) => {
    setAmount(cleanNumericInput(raw));
  };

  const handleAmountBlur = () => {
    const n = parseVE(amount);
    if (n > 0) {
      setAmount(formatVE(n, 2));
    }
  };

  const handleClear = () => {
    setAmount('');
    onShowToast('Monto vaciado 🧹');
  };

  const summaryText = `Monto Bruto: Bs. ${formatVE(grossVES, 2)} | Comisión (${serviceName} ${formatVE(pct, 1)}%): -Bs. ${formatVE(commissionVES, 2)} | Monto Neto: Bs. ${formatVE(netVES, 2)}`;

  return (
    <div className="scroll-content">
      {/* Mode Selector Card */}
      <div className="card mode-card animate-in">
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'deduct' ? 'mode-active' : ''}`}
            onClick={() => setMode('deduct')}
          >
            📉 Deduce comisión
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'cover' ? 'mode-active' : ''}`}
            onClick={() => setMode('cover')}
          >
            🎯 Quiero recibir exacto
          </button>
        </div>
      </div>

      {/* Amount Input in Bolívares */}
      <div className="card animate-in animate-in-delay-1">
        <div className="converter-card-header">
          <div className="card-title" style={{ marginBottom: 0 }}>
            <span>{mode === 'deduct' ? '📤 Monto en Bolívares a Enviar' : '📥 Monto Neto Deseado en Bs.'}</span>
          </div>

          {amount && (
            <button
              type="button"
              className="btn-clear-action"
              onClick={handleClear}
              title="Limpiar monto"
            >
              🧹 Limpiar
            </button>
          )}
        </div>

        <div className="calc-input-row" style={{ marginTop: 12 }}>
          <div className="currency-tag ves">Bs.</div>
          <div className="calc-input-container">
            <input
              type="text"
              inputMode="decimal"
              className="calc-input-field"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              onBlur={handleAmountBlur}
              placeholder="0,00"
              id="commission-amount-ves"
            />
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, marginLeft: 56 }}>
          {amountVES > 0
            ? `Equivalente aprox: $ ${formatVE(grossUSD, 2)} (${activeRate.name}: Bs. ${formatVE(activeRate.rate, 2)})`
            : `Tasa de referencia: ${activeRate.name} (Bs. ${formatVE(activeRate.rate, 2)})`}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="card animate-in animate-in-delay-2">
        <div className="card-title">
          <span>⚡ Tipo de Operación en Bolívares</span>
        </div>

        <div className="commission-grid">
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              className={`commission-item ${selectedPreset === idx ? 'active' : ''}`}
              onClick={() => handleSelectPreset(idx)}
              title={p.desc}
            >
              <div className="commission-icon">{p.icon}</div>
              <div className="commission-name">{p.name}</div>
              <div className="commission-pct">
                {formatVE(p.pct, 1)}%
              </div>
            </button>
          ))}
        </div>

        {/* Custom Commission Row */}
        <div className="custom-commission-row">
          <span className="custom-label">O porcentaje propio:</span>
          <div className="custom-input-wrap">
            <input
              type="text"
              inputMode="decimal"
              className="custom-input"
              value={customPct}
              onChange={(e) => handleCustomPctChange(e.target.value)}
              placeholder="Ej: 2,5"
            />
            <span className="custom-pct-sign">%</span>
          </div>
        </div>
      </div>

      {/* Enhanced Results Card */}
      {amountVES > 0 && pct > 0 && (
        <div className="card result-card animate-in">
          <div className="result-header">
            <div>
              <div className="result-title">📊 Desglose de Comisión</div>
              <div className="result-method-subtitle">{serviceName} • {formatVE(pct, 1)}%</div>
            </div>
          </div>

          {/* Big Highlight Panels */}
          <div className="commission-highlight-grid">
            {/* Panel 1: Monto Comisión */}
            <div className="commission-highlight-box fee-box">
              <div className="highlight-header">
                <span className="highlight-tag fee-tag">💸 Comisión ({formatVE(pct, 1)}%)</span>
                <CopyButton
                  textToCopy={`Bs. ${formatVE(commissionVES, 2)}`}
                  label="Comisión"
                  onCopied={onShowToast}
                  size={16}
                />
              </div>
              <div className="highlight-amount fee-amount">
                -Bs. {formatVE(commissionVES, 2)}
              </div>
              <div className="highlight-sub">
                -$ {formatVE(commissionUSD, 2)} USD aprox.
              </div>
            </div>

            {/* Panel 2: Monto Final */}
            <div className="commission-highlight-box total-box">
              <div className="highlight-header">
                <span className="highlight-tag total-tag">
                  {mode === 'deduct' ? '✅ Recibes Neto' : '🎯 Monto a Transferir'}
                </span>
                <CopyButton
                  textToCopy={`Bs. ${formatVE(mode === 'deduct' ? netVES : grossVES, 2)}`}
                  label={mode === 'deduct' ? 'Neto Recibido' : 'Monto a Transferir'}
                  onCopied={onShowToast}
                  size={16}
                />
              </div>
              <div className="highlight-amount total-amount">
                Bs. {formatVE(mode === 'deduct' ? netVES : grossVES, 2)}
              </div>
              <div className="highlight-sub" style={{ color: 'var(--text-secondary)' }}>
                $ {formatVE(mode === 'deduct' ? netUSD : grossUSD, 2)} USD aprox.
              </div>
            </div>
          </div>

          {/* Breakdown Rows with individual Copy Buttons */}
          <div className="breakdown-list" style={{ marginTop: 14 }}>
            <div className="breakdown-row-with-copy">
              <div>
                <span className="breakdown-label">Monto Bruto enviado:</span>
                <div className="breakdown-val-text">
                  Bs. {formatVE(grossVES, 2)} <span className="breakdown-usd-note">($ {formatVE(grossUSD, 2)})</span>
                </div>
              </div>
              <CopyButton
                textToCopy={`Bs. ${formatVE(grossVES, 2)}`}
                label="Monto Bruto"
                onCopied={onShowToast}
                size={15}
              />
            </div>

            <div className="breakdown-row-with-copy fee-row-highlight">
              <div>
                <span className="breakdown-label">Comisión deducida ({formatVE(pct, 1)}%):</span>
                <div className="breakdown-val-text fee-text">
                  -Bs. {formatVE(commissionVES, 2)} <span className="breakdown-usd-note">(-$ {formatVE(commissionUSD, 2)})</span>
                </div>
              </div>
              <CopyButton
                textToCopy={`Bs. ${formatVE(commissionVES, 2)}`}
                label="Comisión"
                onCopied={onShowToast}
                size={15}
              />
            </div>

            <div className="breakdown-row-with-copy net-row-highlight">
              <div>
                <span className="breakdown-label total-label">Monto Neto final:</span>
                <div className="breakdown-val-text net-text">
                  Bs. {formatVE(netVES, 2)} <span className="breakdown-usd-note">($ {formatVE(netUSD, 2)})</span>
                </div>
              </div>
              <CopyButton
                textToCopy={`Bs. ${formatVE(netVES, 2)}`}
                label="Monto Neto"
                onCopied={onShowToast}
                size={15}
              />
            </div>
          </div>

          {/* Quick copy full summary button */}
          <button
            type="button"
            className="btn-copy-summary"
            onClick={() => {
              navigator.clipboard?.writeText(summaryText);
              onShowToast('Resumen completo copiado 📋');
            }}
          >
            📋 Copiar Resumen Completo
          </button>
        </div>
      )}

      {/* Info Tip */}
      <div className="tip-card animate-in animate-in-delay-3">
        <span className="tip-icon">💡</span>
        <span className="tip-text">
          Cálculo directo en <strong>Bolívares (Bs.)</strong> con formato <strong>1.000,99</strong> para Pago Móvil, transferencias y puntos de venta.
        </span>
      </div>
    </div>
  );
}
