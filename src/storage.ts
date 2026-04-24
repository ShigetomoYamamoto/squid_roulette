import type { PaletteKey } from './palettes'
import type { Motif } from './Wheel'
import type { Drama } from './useSpin'

export const KEYS = {
  items: 'squid-roulette.items',
  palette: 'squid-roulette.palette',
  motif: 'squid-roulette.motif',
  drama: 'squid-roulette.drama',
  speed: 'squid-roulette.speed',
  muted: 'squid-roulette.muted',
  history: 'squid-roulette.history',
  presets: 'squid-roulette.presets',
} as const

export interface HistoryEntry {
  t: number
  items: string[]
  winner: number
}

export interface Preset {
  name: string
  items: string[]
}

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch (err) {
    console.error('storage read failed', key, err)
    return fallback
  }
}

const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('storage write failed', key, err)
  }
}

export const loadItems = (fallback: string[]): string[] => {
  const v = read<string[]>(KEYS.items, fallback)
  return Array.isArray(v) && v.length >= 2 ? v : fallback
}
export const saveItems = (v: string[]) => write(KEYS.items, v)

export const loadPalette = (): PaletteKey =>
  read<PaletteKey>(KEYS.palette, 'pink')
export const savePalette = (v: PaletteKey) => write(KEYS.palette, v)

export const loadMotif = (): Motif => read<Motif>(KEYS.motif, 'symbol')
export const saveMotif = (v: Motif) => write(KEYS.motif, v)

export const loadDrama = (): Drama => read<Drama>(KEYS.drama, 'high')
export const saveDrama = (v: Drama) => write(KEYS.drama, v)

export const loadSpeed = (): number => read<number>(KEYS.speed, 1)
export const saveSpeed = (v: number) => write(KEYS.speed, v)

export const loadMuted = (): boolean => read<boolean>(KEYS.muted, false)
export const saveMuted = (v: boolean) => write(KEYS.muted, v)

export const loadHistory = (): HistoryEntry[] =>
  read<HistoryEntry[]>(KEYS.history, [])
export const saveHistory = (v: HistoryEntry[]) => write(KEYS.history, v)

export const loadPresets = (): Preset[] => read<Preset[]>(KEYS.presets, [])
export const savePresets = (v: Preset[]) => write(KEYS.presets, v)
