/**
 * Zentrale Utility-Funktionen für DiviStack
 */

/**
 * Formatiert einen Betrag als Euro-Währung
 * @param value - Der Betrag in Euro
 * @param decimals - Anzahl Nachkommastellen (default: 2)
 * @returns Formatierter String mit € Symbol
 */
export function formatEuro(value: number, decimals: number = 2): string {
  return `${value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} €`
}

/**
 * Formatiert einen Betrag als kompakte Euro-Währung (ohne Nachkommastellen)
 * @param value - Der Betrag in Euro
 * @returns Formatierter String mit € Symbol
 */
export function formatEuroCompact(value: number): string {
  return formatEuro(value, 0)
}

/**
 * Formatiert einen Prozentsatz
 * @param value - Der Prozentsatz (z.B. 5.25 für 5.25%)
 * @param decimals - Anzahl Nachkommastellen (default: 2)
 * @returns Formatierter String mit % Symbol
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`
}

/**
 * Formatiert eine große Zahl mit Tausendertrennzeichen
 * @param value - Die Zahl
 * @returns Formatierter String
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('de-DE')
}
