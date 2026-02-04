import { Position, TaxConfig } from './types'

const STORAGE_KEYS = {
  POSITIONS: 'divistack-positions',
  TAX_CONFIG: 'divistack-tax-config',
}

export const storage = {
  getPositions(): Position[] {
    const data = localStorage.getItem(STORAGE_KEYS.POSITIONS)
    return data ? JSON.parse(data) : []
  },

  savePositions(positions: Position[]): void {
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions))
  },

  getTaxConfig(): TaxConfig {
    const data = localStorage.getItem(STORAGE_KEYS.TAX_CONFIG)
    return data ? JSON.parse(data) : { freeAllowance: 1000, freeAllowanceUsed: 0 }
  },

  saveTaxConfig(config: TaxConfig): void {
    localStorage.setItem(STORAGE_KEYS.TAX_CONFIG, JSON.stringify(config))
  },
}
