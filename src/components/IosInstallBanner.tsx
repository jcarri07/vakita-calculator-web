import { useState, useEffect } from 'react';

export function IosInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem('vakita_ios_dismissed');

    if (isIos && !isStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('vakita_ios_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="ios-banner animate-in">
      <div className="ios-banner-header">
        <span className="ios-banner-title">📲 Instalar Vakita en tu iPhone</span>
        <button className="ios-banner-close" onClick={handleDismiss} aria-label="Cerrar">✕</button>
      </div>
      <p className="ios-banner-body">
        Para usar esta calculadora como app nativa: pulsa el botón <strong>Compartir <span className="share-icon">⎋</span></strong> en Safari y luego selecciona <strong>"Agregar al inicio ➕"</strong>.
      </p>
    </div>
  );
}
