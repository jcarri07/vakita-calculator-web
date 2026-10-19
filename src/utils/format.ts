/**
 * Formatea un número al sistema decimal venezolano/hispano:
 * Punto (.) para miles, coma (,) para decimales.
 * Ejemplo: 20000.99 -> "20.000,99"
 */
export function formatVE(value: number | string | null | undefined, decimals: number = 2): string {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'number'
    ? value
    : parseFloat(value.toString().replace(/\./g, '').replace(',', '.'));
  
  if (isNaN(num)) return '';

  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];

  return decimals > 0 ? `${integerPart},${decimalPart}` : integerPart;
}

/**
 * Parsea un string en formato "20.000,99", "20000,99" o "20000.99" a un número de JavaScript.
 */
export function parseVE(value: string): number {
  if (!value) return 0;
  const clean = value.trim();

  // Si tiene puntos y comas, el punto es miles y la coma es decimal: "20.000,99"
  if (clean.includes('.') && clean.includes(',')) {
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
  }

  // Si solo tiene coma: "20000,99"
  if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.')) || 0;
  }

  return parseFloat(clean) || 0;
}

/**
 * Limpia texto numérico permitiendo números, comas y puntos.
 */
export function cleanNumericInput(value: string): string {
  return value.replace(/[^0-9.,]/g, '');
}
