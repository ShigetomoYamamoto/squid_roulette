import { PALETTES, type Palette, type PaletteKey } from './palettes'
import type { Motif } from './Wheel'
import type { Drama } from './useSpin'
import type { HistoryEntry } from './storage'
import { buildShareUrl } from './share'

interface Props {
  palette: Palette
  paletteKey: PaletteKey
  setPaletteKey: (k: PaletteKey) => void
  motif: Motif
  setMotif: (m: Motif) => void
  drama: Drama
  setDrama: (d: Drama) => void
  speed: number
  setSpeed: (s: number) => void
  muted: boolean
  setMuted: (m: boolean) => void
  history: HistoryEntry[]
  clearHistory: () => void
  items: string[]
  onClose: () => void
}

export function SettingsSheet({
  palette: P,
  paletteKey,
  setPaletteKey,
  motif,
  setMotif,
  drama,
  setDrama,
  speed,
  setSpeed,
  muted,
  setMuted,
  history,
  clearHistory,
  items,
  onClose,
}: Props) {
  const share = async () => {
    const url = buildShareUrl(items)
    try {
      if (navigator.share) {
        await navigator.share({ title: '運命のルーレット', url })
      } else {
        await navigator.clipboard.writeText(url)
        window.alert('共有URLをコピーしました')
      }
    } catch (err) {
      console.error('share failed', err)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="設定"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '85vh',
          overflowY: 'auto',
          background: P.bg,
          borderRadius: '20px 20px 0 0',
          border: `1px solid ${P.inkDim}`,
          padding: '12px 20px 24px',
          color: P.ink,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 40,
            height: 4,
            background: P.inkDim,
            borderRadius: 2,
            margin: '0 auto 12px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 18, fontWeight: 700 }}>
            設定
          </div>
          <button onClick={onClose} aria-label="閉じる" style={closeBtn(P)}>
            ×
          </button>
        </div>

        <Section title="配色" P={P}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.keys(PALETTES) as PaletteKey[]).map((k) => {
              const pal = PALETTES[k]
              const active = k === paletteKey
              return (
                <button
                  key={k}
                  onClick={() => setPaletteKey(k)}
                  style={{
                    flex: '1 1 30%',
                    minWidth: 90,
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: `1px solid ${active ? P.primary : P.inkDim}`,
                    background: active ? `${P.primary}20` : 'transparent',
                    color: P.ink,
                    fontFamily: 'inherit',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6, justifyContent: 'center' }}>
                    {[pal.segA, pal.segB, pal.segC, pal.segD].map((c, i) => (
                      <span
                        key={i}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: c,
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      />
                    ))}
                  </div>
                  {pal.name}
                </button>
              )
            })}
          </div>
        </Section>

        <Section title="表示モチーフ" P={P}>
          <SegGroup
            P={P}
            value={motif}
            options={[
              { v: 'symbol', label: '○△□' },
              { v: 'number', label: '001' },
              { v: 'none', label: 'なし' },
            ]}
            onChange={setMotif}
          />
        </Section>

        <Section title="演出の強さ" P={P}>
          <SegGroup
            P={P}
            value={drama}
            options={[
              { v: 'low', label: '控えめ' },
              { v: 'mid', label: '標準' },
              { v: 'high', label: '派手' },
            ]}
            onChange={setDrama}
          />
        </Section>

        <Section title={`回転速度  ${speed.toFixed(1)}x`} P={P}>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="回転速度"
            style={{ width: '100%', accentColor: P.primary }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: P.inkDim }}>
            <span>0.5x</span>
            <span>2.0x</span>
          </div>
        </Section>

        <Section title="サウンド" P={P}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!muted}
              onChange={(e) => setMuted(!e.target.checked)}
              style={{ accentColor: P.primary }}
            />
            <span>回転音 / 当選音を鳴らす</span>
          </label>
        </Section>

        <Section title={`履歴  （${history.length}件）`} P={P}>
          <div
            style={{
              maxHeight: 140,
              overflowY: 'auto',
              border: `1px solid ${P.inkDim}`,
              borderRadius: 6,
              padding: 8,
              marginBottom: 8,
              fontSize: 12,
            }}
          >
            {history.length === 0 ? (
              <div style={{ color: P.inkDim, textAlign: 'center', padding: 8 }}>履歴なし</div>
            ) : (
              history.slice(0, 50).map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    borderBottom: i < history.length - 1 ? `1px solid rgba(255,255,255,0.06)` : 'none',
                  }}
                >
                  <span style={{ color: P.primary, fontWeight: 600 }}>
                    {h.items[h.winner] ?? '?'}
                  </span>
                  <span style={{ color: P.inkDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                    {new Date(h.t).toLocaleString('ja-JP', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
          <button onClick={clearHistory} style={chipBtn(P)}>
            履歴をクリア
          </button>
        </Section>

        <Section title="共有" P={P}>
          <button
            onClick={share}
            style={{
              width: '100%',
              padding: 10,
              background: 'transparent',
              border: `1px solid ${P.primary}`,
              color: P.primary,
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            項目セットを共有（URL）
          </button>
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  P,
  children,
}: {
  title: string
  P: Palette
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.2em',
          color: P.inkDim,
          marginBottom: 8,
        }}
      >
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  )
}

interface SegOpt<V extends string> {
  v: V
  label: string
}

function SegGroup<V extends string>({
  P,
  value,
  options,
  onChange,
}: {
  P: Palette
  value: V
  options: SegOpt<V>[]
  onChange: (v: V) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        border: `1px solid ${P.inkDim}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {options.map((o, i) => {
        const active = o.v === value
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${P.inkDim}` : 'none',
              background: active ? P.primary : 'transparent',
              color: active ? P.ink : P.ink,
              fontFamily: 'inherit',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

const chipBtn = (P: Palette): React.CSSProperties => ({
  background: 'transparent',
  border: `1px solid ${P.inkDim}`,
  color: P.ink,
  fontFamily: 'inherit',
  fontSize: 11,
  borderRadius: 6,
  padding: '6px 12px',
  cursor: 'pointer',
})

const closeBtn = (P: Palette): React.CSSProperties => ({
  background: 'transparent',
  border: 'none',
  color: P.ink,
  fontSize: 24,
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1,
})
