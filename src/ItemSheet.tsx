import { useState } from 'react'
import type { Palette } from './palettes'
import { BUILTIN_PRESETS } from './presets'
import type { Preset } from './storage'

const MAX_ITEMS = 12
const MIN_ITEMS = 2
const MAX_LEN = 20

interface Props {
  palette: Palette
  items: string[]
  onChange: (next: string[]) => void
  onClose: () => void
  userPresets: Preset[]
}

export function ItemSheet({ palette: P, items, onChange, onClose, userPresets }: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [showPresets, setShowPresets] = useState(false)

  const updateItem = (i: number, v: string) => {
    const trimmed = v.slice(0, MAX_LEN)
    onChange(items.map((x, j) => (j === i ? trimmed : x)))
  }

  const addItem = () => {
    if (items.length >= MAX_ITEMS) return
    onChange([...items, `項目${items.length + 1}`])
  }

  const removeItem = (i: number) => {
    if (items.length <= MIN_ITEMS) return
    onChange(items.filter((_, j) => j !== i))
  }

  const clearAll = () => {
    if (!window.confirm('全ての項目を削除しますか？')) return
    onChange(['項目1', '項目2'])
  }

  const applyPreset = (p: Preset) => {
    onChange([...p.items].slice(0, MAX_ITEMS))
    setShowPresets(false)
  }

  const onDragStart = (i: number) => setDragIdx(i)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (target: number) => {
    if (dragIdx == null || dragIdx === target) return
    const next = [...items]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(target, 0, moved)
    onChange(next)
    setDragIdx(null)
  }

  const saveAndClose = () => {
    const sanitized = items.map((x, i) => (x.trim() === '' ? `項目${i + 1}` : x))
    if (sanitized.some((x, i) => x !== items[i])) onChange(sanitized)
    onClose()
  }

  const allPresets: Preset[] = [...BUILTIN_PRESETS, ...userPresets]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="項目を編集"
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
          background: P.bg,
          borderRadius: '20px 20px 0 0',
          border: `1px solid ${P.inkDim}`,
          padding: '12px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
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
            marginBottom: 8,
          }}
        >
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 18, fontWeight: 700 }}>
            項目を編集
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowPresets((s) => !s)}
              style={chipBtn(P)}
            >
              プリセット
            </button>
            <button onClick={clearAll} style={chipBtn(P)}>
              全削除
            </button>
          </div>
        </div>

        {showPresets && (
          <div
            style={{
              border: `1px solid ${P.inkDim}`,
              borderRadius: 8,
              padding: 8,
              marginBottom: 12,
              maxHeight: 180,
              overflowY: 'auto',
            }}
          >
            {allPresets.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  background: 'transparent',
                  border: 'none',
                  color: P.ink,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${P.inkDim}`,
                }}
              >
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: P.inkDim, fontSize: 11, marginLeft: 8 }}>
                  {p.items.length}項目
                </span>
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: 10,
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 4px',
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
                opacity: dragIdx === i ? 0.4 : 1,
              }}
            >
              <span
                aria-hidden
                style={{ color: P.inkDim, cursor: 'grab', userSelect: 'none', fontSize: 16 }}
              >
                ≡
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: P.inkDim,
                  minWidth: 28,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <input
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                maxLength={MAX_LEN}
                aria-label={`項目 ${i + 1}`}
                style={{
                  flex: 1,
                  height: 32,
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid rgba(255,255,255,0.12)`,
                  borderRadius: 6,
                  color: P.ink,
                  fontFamily: 'inherit',
                  fontSize: 14,
                  padding: '0 8px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => removeItem(i)}
                disabled={items.length <= MIN_ITEMS}
                aria-label={`項目 ${i + 1} を削除`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: items.length <= MIN_ITEMS ? P.inkDim : P.primary,
                  fontSize: 20,
                  cursor: items.length <= MIN_ITEMS ? 'not-allowed' : 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            disabled={items.length >= MAX_ITEMS}
            style={{
              width: '100%',
              marginTop: 10,
              padding: 10,
              border: `1px dashed ${P.inkDim}`,
              background: 'transparent',
              color: items.length >= MAX_ITEMS ? P.inkDim : P.primary,
              borderRadius: 8,
              cursor: items.length >= MAX_ITEMS ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            ＋ 項目を追加（{items.length}/{MAX_ITEMS}）
          </button>
        </div>

        <button
          onClick={saveAndClose}
          style={{
            width: '100%',
            height: 48,
            background: `linear-gradient(135deg, ${P.primary}, ${P.primaryDark})`,
            color: P.ink,
            border: 'none',
            borderRadius: 10,
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          保存して閉じる
        </button>
      </div>
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
  padding: '4px 10px',
  cursor: 'pointer',
})
