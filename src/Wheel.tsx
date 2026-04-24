import type { Palette } from './palettes'

export type Motif = 'symbol' | 'number' | 'none'

interface WheelProps {
  items: string[]
  palette: Palette
  motif: Motif
  angle: number
  winner: number | null
  justLanded: boolean
  onHubClick?: () => void
}

type SymbolKind = 'circle' | 'triangle' | 'square'

const pickSymbol = (i: number): SymbolKind =>
  (['circle', 'triangle', 'square'] as const)[i % 3]

const renderSymbol = (
  kind: SymbolKind,
  cx: number,
  cy: number,
  r: number,
  stroke: string,
) => {
  const sw = r * 0.18
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
  }
  if (kind === 'triangle') {
    const h = r * Math.sqrt(3)
    const points = [
      [cx, cy - h * 0.58],
      [cx - r, cy + h * 0.42],
      [cx + r, cy + h * 0.42],
    ]
      .map((p) => p.join(','))
      .join(' ')
    return (
      <polygon
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="miter"
      />
    )
  }
  return (
    <rect
      x={cx - r}
      y={cy - r}
      width={r * 2}
      height={r * 2}
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
    />
  )
}

export function Wheel({ items, palette, motif, angle, winner, justLanded, onHubClick }: WheelProps) {
  const size = 300
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10
  const n = items.length
  const segAngle = 360 / n
  const colors = [palette.segA, palette.segB, palette.segC, palette.segD]

  const polarToXY = (angleDeg: number, radius: number): [number, number] => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)]
  }

  const segments = items.map((_, i) => {
    const start = i * segAngle
    const end = (i + 1) * segAngle
    const [x1, y1] = polarToXY(start, r)
    const [x2, y2] = polarToXY(end, r)
    const largeArc = segAngle > 180 ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    const mid = start + segAngle / 2
    const color = colors[i % colors.length]
    return { d, mid, color, i }
  })

  return (
    <div style={{ position: 'relative', width: size, height: size + 40 }}>
      {/* pointer */}
      <div
        style={{
          position: 'absolute',
          top: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          zIndex: 3,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: `24px solid ${palette.ink}`,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 6,
          height: 10,
          background: palette.ink,
          zIndex: 2,
          borderRadius: '0 0 2px 2px',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 0,
          width: size,
          height: size,
          transform: `rotate(${angle}deg)`,
          transformOrigin: '50% 50%',
          filter: justLanded
            ? `drop-shadow(0 0 18px ${palette.primary})`
            : 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
          transition: justLanded ? 'filter 0.3s' : 'none',
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r + 6} fill={palette.primaryDark} />
          <circle
            cx={cx}
            cy={cy}
            r={r + 4}
            fill="none"
            stroke={palette.ink}
            strokeWidth="1"
            opacity="0.3"
          />
          {segments.map((s, i) => (
            <path key={i} d={s.d} fill={s.color} stroke={palette.bg} strokeWidth="1.5" />
          ))}
          {Array.from({ length: n * 2 }).map((_, i) => {
            const a = i * (360 / (n * 2))
            const [x, y] = polarToXY(a, r + 6)
            return (
              <circle key={i} cx={x} cy={y} r={1.5} fill={palette.ink} opacity="0.4" />
            )
          })}
          {/* A+ inverted: white symbols w/ soft shadow */}
          {segments.map((s, i) => {
            const symbolY = cy - r * 0.5
            const symbolR = 13
            const kind = pickSymbol(i)
            return (
              <g key={`sym-${i}`} transform={`rotate(${s.mid} ${cx} ${cy})`}>
                {motif === 'symbol' && (
                  <g>
                    <g transform="translate(0,1)" opacity="0.35">
                      {renderSymbol(kind, cx, symbolY, symbolR, 'rgba(0,0,0,0.6)')}
                    </g>
                    <g>
                      {renderSymbol(kind, cx, symbolY, symbolR, 'rgba(255,255,255,0.95)')}
                    </g>
                  </g>
                )}
                {motif === 'number' && (
                  <text
                    x={cx}
                    y={symbolY + 5}
                    textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize="18"
                    fontWeight="700"
                    fill="rgba(255,255,255,0.95)"
                    style={{ letterSpacing: '0.04em' }}
                  >
                    {String(i + 1).padStart(3, '0')}
                  </text>
                )}
              </g>
            )
          })}
          {/* Engraved vertical labels */}
          {segments.map((s, i) => {
            const labelText = items[i] ?? ''
            const chars = [...labelText]
            const nchars = Math.max(1, chars.length)
            const bandH = r * 0.72
            const charSpacing = Math.min(17, bandH / nchars)
            const fontSize = Math.max(6, Math.min(14, charSpacing - 2))
            const midY = cy - r * 0.5
            const topY = midY - ((nchars - 1) * charSpacing) / 2
            return (
              <g key={`lbl-${i}`} transform={`rotate(${s.mid} ${cx} ${cy})`}>
                {chars.map((ch, ci) => (
                  <g key={ci}>
                    <text
                      x={cx}
                      y={topY + ci * charSpacing + 0.8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="'Noto Sans JP', sans-serif"
                      fontSize={fontSize}
                      fontWeight="700"
                      fill="rgba(255,255,255,0.35)"
                    >
                      {ch}
                    </text>
                    <text
                      x={cx}
                      y={topY + ci * charSpacing}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="'Noto Sans JP', sans-serif"
                      fontSize={fontSize}
                      fontWeight="700"
                      fill="rgba(0,0,0,0.62)"
                    >
                      {ch}
                    </text>
                  </g>
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      {/* center hub */}
      <button
        type="button"
        onClick={onHubClick}
        aria-label="スピン"
        style={{
          position: 'absolute',
          top: 20 + size / 2 - 18,
          left: size / 2 - 18,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${palette.secondary}, ${palette.primaryDark})`,
          boxShadow: `0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 3px rgba(0,0,0,0.3)`,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: palette.ink,
            opacity: 0.9,
            boxShadow: `inset 0 1px 2px rgba(0,0,0,0.4)`,
          }}
        />
      </button>

      <div style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        {winner != null && justLanded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}
