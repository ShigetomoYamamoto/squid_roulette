import { useMemo } from 'react'
import type { Palette } from './palettes'

interface Props {
  palette: Palette
  seed: number
}

interface Particle {
  id: number
  shape: 'circle' | 'triangle' | 'square'
  color: string
  left: number
  delay: number
  duration: number
  size: number
  rot: number
}

export function ConfettiOverlay({ palette, seed }: Props) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const shape = (['circle', 'triangle', 'square'] as const)[i % 3]
      const colors = [palette.primary, palette.secondary, palette.ink]
      return {
        id: i,
        shape,
        color: colors[i % colors.length],
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 0.8,
        size: 6 + Math.random() * 8,
        rot: Math.random() * 360,
      }
    })
    // seed/palette trigger regeneration
  }, [seed, palette])

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '40%',
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `fall-${p.id % 4} ${p.duration}s ${p.delay}s cubic-bezier(.25,.46,.45,.94) forwards`,
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 10 10"
            style={{ transform: `rotate(${p.rot}deg)` }}
          >
            {p.shape === 'circle' && <circle cx="5" cy="5" r="4" fill={p.color} />}
            {p.shape === 'triangle' && <polygon points="5,1 9,9 1,9" fill={p.color} />}
            {p.shape === 'square' && <rect x="1" y="1" width="8" height="8" fill={p.color} />}
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes fall-0 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(30px, 400px) rotate(540deg); opacity: 0; } }
        @keyframes fall-1 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(-40px, 420px) rotate(-540deg); opacity: 0; } }
        @keyframes fall-2 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(-10px, 380px) rotate(360deg); opacity: 0; } }
        @keyframes fall-3 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(50px, 440px) rotate(-720deg); opacity: 0; } }
      `}</style>
    </div>
  )
}
