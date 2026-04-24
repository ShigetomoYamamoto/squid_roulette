import { useCallback, useEffect, useMemo, useState } from 'react'
import { PALETTES, type PaletteKey } from './palettes'
import { Wheel, type Motif } from './Wheel'
import { useSpin, type Drama } from './useSpin'
import { AudioFX } from './audio'
import { ItemSheet } from './ItemSheet'
import { SettingsSheet } from './SettingsSheet'
import { ConfettiOverlay } from './Confetti'
import {
  loadDrama,
  loadHistory,
  loadItems,
  loadMotif,
  loadMuted,
  loadPalette,
  loadPresets,
  loadSpeed,
  saveDrama,
  saveHistory,
  saveItems,
  saveMotif,
  saveMuted,
  savePalette,
  saveSpeed,
  type HistoryEntry,
} from './storage'
import { readItemsFromLocation } from './share'

const DEFAULT_ITEMS = ['項目1', '項目2', '項目3', '項目4', '項目5', '項目6']

export function App() {
  const [items, setItemsState] = useState<string[]>(() => {
    const fromUrl = readItemsFromLocation()
    if (fromUrl) return fromUrl
    return loadItems(DEFAULT_ITEMS)
  })
  const [paletteKey, setPaletteKeyState] = useState<PaletteKey>(() => loadPalette())
  const [motif, setMotifState] = useState<Motif>(() => loadMotif())
  const [drama, setDramaState] = useState<Drama>(() => loadDrama())
  const [speed, setSpeedState] = useState<number>(() => loadSpeed())
  const [muted, setMutedState] = useState<boolean>(() => loadMuted())
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())
  const [showItems, setShowItems] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiSeed, setConfettiSeed] = useState(0)

  const userPresets = useMemo(() => loadPresets(), [])
  const palette = PALETTES[paletteKey]

  useEffect(() => {
    AudioFX.setMuted(muted)
  }, [muted])

  const setItems = useCallback((next: string[]) => {
    setItemsState(next)
    saveItems(next)
  }, [])
  const setPaletteKey = useCallback((k: PaletteKey) => {
    setPaletteKeyState(k)
    savePalette(k)
  }, [])
  const setMotif = useCallback((m: Motif) => {
    setMotifState(m)
    saveMotif(m)
  }, [])
  const setDrama = useCallback((d: Drama) => {
    setDramaState(d)
    saveDrama(d)
  }, [])
  const setSpeed = useCallback((s: number) => {
    setSpeedState(s)
    saveSpeed(s)
  }, [])
  const setMuted = useCallback((m: boolean) => {
    setMutedState(m)
    saveMuted(m)
  }, [])

  const onLand = useCallback(
    (idx: number) => {
      const entry: HistoryEntry = { t: Date.now(), items: [...items], winner: idx }
      const next = [entry, ...history].slice(0, 50)
      setHistory(next)
      saveHistory(next)
      if (drama !== 'low') {
        setConfettiSeed((s) => s + 1)
        setShowConfetti(true)
        window.setTimeout(() => setShowConfetti(false), 2400)
      }
    },
    [items, history, drama],
  )

  const { angle, spinning, winner, justLanded, spin } = useSpin({
    itemCount: items.length,
    speed,
    drama,
    onLand,
  })

  const handleSpin = useCallback(() => {
    if (spinning || items.length < 2) return
    AudioFX.resume()
    const target = Math.floor(Math.random() * items.length)
    spin(target)
  }, [spinning, items.length, spin])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      if (typing) return
      if (e.code === 'Space') {
        e.preventDefault()
        handleSpin()
      } else if (e.key === 'e' || e.key === 'E') {
        if (!showSettings) setShowItems(true)
      } else if (e.key === 'Escape') {
        setShowItems(false)
        setShowSettings(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSpin, showSettings])

  const titleFont = "'Noto Serif JP', serif"
  const monoFont = "'JetBrains Mono', monospace"
  const P = palette

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        maxWidth: 520,
        marginInline: 'auto',
        background: P.bgGrad,
        color: P.ink,
        position: 'relative',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* background texture */}
      <svg
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <pattern
            id={`bg-hex-${paletteKey}`}
            x="0"
            y="0"
            width="30"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="15,0 30,8.66 30,17.32 15,26 0,17.32 0,8.66"
              fill="none"
              stroke={P.ink}
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#bg-hex-${paletteKey})`} />
      </svg>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px 0',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <circle cx="7" cy="7" r="5" fill="none" stroke={P.primary} strokeWidth="1.3" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <polygon points="7,1.5 13,12.5 1,12.5" fill="none" stroke={P.primary} strokeWidth="1.3" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <rect x="2" y="2" width="10" height="10" fill="none" stroke={P.primary} strokeWidth="1.3" />
          </svg>
        </div>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 11,
            color: P.inkDim,
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: P.primary,
              boxShadow: `0 0 6px ${P.primary}`,
              animation: 'pulse 2s infinite',
            }}
          />
          ROOM No.{String(56 + (items.length % 9)).padStart(3, '0')}
        </div>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="設定を開く"
          style={{
            background: 'transparent',
            border: 'none',
            color: P.ink,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="3" stroke={P.ink} strokeWidth="1.5" />
            <path
              d="M11 2v3M11 17v3M20 11h-3M5 11H2M17.36 4.64l-2.12 2.12M6.76 15.24l-2.12 2.12M17.36 17.36l-2.12-2.12M6.76 6.76L4.64 4.64"
              stroke={P.ink}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div style={{ padding: '20px 24px 10px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 10,
            letterSpacing: '0.35em',
            color: P.inkDim,
            marginBottom: 6,
          }}
        >
          SURVIVAL ROULETTE / 生死ノ盤
        </div>
        <div
          style={{
            fontFamily: titleFont,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: P.ink,
            textShadow: `0 2px 12px ${P.primary}40`,
          }}
        >
          運命のルーレット
        </div>
      </div>

      {/* Wheel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '10px 0',
        }}
      >
        <div className="wheel-wrap">
          <Wheel
            items={items}
            palette={P}
            motif={motif}
            angle={angle}
            winner={winner}
            justLanded={justLanded}
            onHubClick={handleSpin}
          />
        </div>

        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 8,
            minHeight: 56,
            width: '85%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {winner != null && !spinning ? (
            <div
              key={confettiSeed}
              style={{ animation: 'resultPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <div
                style={{
                  fontFamily: monoFont,
                  fontSize: 10,
                  color: P.primary,
                  letterSpacing: '0.3em',
                  marginBottom: 4,
                }}
              >
                SELECTED
              </div>
              <div
                style={{
                  fontFamily: titleFont,
                  fontSize: 22,
                  fontWeight: 700,
                  color: P.ink,
                  letterSpacing: '0.04em',
                  textShadow: `0 0 16px ${P.primary}`,
                }}
              >
                {items[winner]}
              </div>
            </div>
          ) : spinning ? (
            <div
              style={{
                fontFamily: monoFont,
                fontSize: 11,
                color: P.inkDim,
                letterSpacing: '0.3em',
                animation: 'flash 0.5s infinite',
              }}
            >
              SPINNING…
            </div>
          ) : (
            <div
              style={{
                fontFamily: monoFont,
                fontSize: 10,
                color: P.inkDim,
                letterSpacing: '0.3em',
              }}
            >
              PRESS TO START
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '8px 20px 10px', position: 'relative', zIndex: 2 }}>
        <button
          onClick={handleSpin}
          disabled={spinning || items.length < 2}
          aria-label="スピンを開始"
          style={{
            width: '100%',
            height: 56,
            border: 'none',
            cursor: spinning ? 'default' : 'pointer',
            background: spinning
              ? `linear-gradient(135deg, ${P.primaryDark}, ${P.primaryDark})`
              : `linear-gradient(135deg, ${P.primary}, ${P.primaryDark})`,
            color: P.ink,
            fontFamily: titleFont,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.15em',
            borderRadius: 28,
            boxShadow: spinning
              ? `inset 0 2px 6px rgba(0,0,0,0.4)`
              : `0 4px 12px ${P.primary}80, inset 0 1px 0 rgba(255,255,255,0.2)`,
            transition: 'all 0.15s',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {spinning ? 'SPINNING…' : '運命を決める'}
        </button>
      </div>

      {/* Sub actions */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '0 20px 24px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <button onClick={() => setShowItems(true)} style={subBtn(P)}>
          <span>✎</span>
          <span>項目を編集（{items.length}）</span>
        </button>
        <button onClick={() => setShowSettings(true)} style={subBtn(P)}>
          <span>🎨</span>
          <span>配色・設定</span>
        </button>
      </div>

      {showConfetti && <ConfettiOverlay palette={P} seed={confettiSeed} />}
      {justLanded && drama !== 'low' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 50%, ${P.primary}40, transparent 60%)`,
            animation: 'winFlash 0.6s',
          }}
        />
      )}

      {showItems && (
        <ItemSheet
          palette={P}
          items={items}
          onChange={setItems}
          onClose={() => setShowItems(false)}
          userPresets={userPresets}
        />
      )}
      {showSettings && (
        <SettingsSheet
          palette={P}
          paletteKey={paletteKey}
          setPaletteKey={setPaletteKey}
          motif={motif}
          setMotif={setMotif}
          drama={drama}
          setDrama={setDrama}
          speed={speed}
          setSpeed={setSpeed}
          muted={muted}
          setMuted={setMuted}
          history={history}
          clearHistory={clearHistory}
          items={items}
          onClose={() => setShowSettings(false)}
        />
      )}

      <style>{`
        @media (max-height: 720px) {
          .wheel-wrap { transform: scale(0.86); transform-origin: center top; }
        }
        @media (max-height: 620px) {
          .wheel-wrap { transform: scale(0.74); }
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes flash { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes resultPop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes winFlash {
          0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const subBtn = (P: typeof PALETTES[PaletteKey]): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '10px 8px',
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid rgba(255,255,255,0.12)`,
  color: P.ink,
  borderRadius: 10,
  fontFamily: 'inherit',
  fontSize: 12,
  cursor: 'pointer',
})
