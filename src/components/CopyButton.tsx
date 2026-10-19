import { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  onCopied?: (msg: string) => void;
  className?: string;
  size?: number;
}

export function CopyButton({
  textToCopy,
  label = '',
  onCopied,
  className = '',
  size = 18,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!textToCopy) return;

    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    if (onCopied) {
      onCopied(`Copiado: ${label ? label + ' ' : ''}${textToCopy}`);
    }
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      className={`app-copy-btn ${copied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
      title={copied ? 'Copiado!' : 'Copiar'}
      aria-label="Copiar al portapapeles"
    >
      {copied ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="copy-icon-svg check"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="copy-icon-svg"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
