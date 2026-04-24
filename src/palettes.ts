export type PaletteKey = 'pink' | 'green' | 'dark'

export interface Palette {
  key: PaletteKey
  name: string
  bg: string
  bgGrad: string
  primary: string
  primaryDark: string
  secondary: string
  accent: string
  ink: string
  inkDim: string
  segA: string
  segB: string
  segC: string
  segD: string
}

export const PALETTES: Record<PaletteKey, Palette> = {
  pink: {
    key: 'pink',
    name: 'マゼンタ',
    bg: '#1a0a12',
    bgGrad: 'radial-gradient(circle at 50% 30%, #3a0a26 0%, #120509 80%)',
    primary: '#E50A7C',
    primaryDark: '#8E0A4E',
    secondary: '#F7A8C9',
    accent: '#0E5D55',
    ink: '#FFF3E8',
    inkDim: 'rgba(255,243,232,0.55)',
    segA: '#E50A7C',
    segB: '#0E5D55',
    segC: '#1A0A12',
    segD: '#F7A8C9',
  },
  green: {
    key: 'green',
    name: 'ダークティール',
    bg: '#07211E',
    bgGrad: 'radial-gradient(circle at 50% 30%, #0F3F3A 0%, #051815 80%)',
    primary: '#0E5D55',
    primaryDark: '#063733',
    secondary: '#7BC0B6',
    accent: '#E50A7C',
    ink: '#F0FAF7',
    inkDim: 'rgba(240,250,247,0.55)',
    segA: '#0E5D55',
    segB: '#E50A7C',
    segC: '#07211E',
    segD: '#7BC0B6',
  },
  dark: {
    key: 'dark',
    name: 'ノワール',
    bg: '#08080A',
    bgGrad: 'radial-gradient(circle at 50% 30%, #1A1A1F 0%, #050506 80%)',
    primary: '#D9123F',
    primaryDark: '#7A0A24',
    secondary: '#C9C4BE',
    accent: '#0E5D55',
    ink: '#F5F0E8',
    inkDim: 'rgba(245,240,232,0.5)',
    segA: '#D9123F',
    segB: '#1A1A1F',
    segC: '#2A2A2F',
    segD: '#8B0A28',
  },
}
