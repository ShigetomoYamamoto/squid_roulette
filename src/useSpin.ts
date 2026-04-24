import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioFX } from './audio'

export type Drama = 'low' | 'mid' | 'high'

interface UseSpinOptions {
  itemCount: number
  speed?: number
  drama?: Drama
  onLand?: (winnerIdx: number) => void
}

interface SpinState {
  start: number
  from: number
  to: number
  duration: number
  lastTick: number
}

export function useSpin({ itemCount, speed = 1, drama = 'high', onLand }: UseSpinOptions) {
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [justLanded, setJustLanded] = useState(false)
  const rafRef = useRef<number | null>(null)
  const stateRef = useRef<SpinState>({ start: 0, from: 0, to: 0, duration: 0, lastTick: -1 })
  const flashTimerRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const spin = useCallback(
    (targetIdx: number) => {
      if (itemCount <= 0) return
      stop()
      setWinner(null)
      setJustLanded(false)
      const segAngle = 360 / itemCount
      const theta = targetIdx * segAngle + segAngle / 2
      const baseTurns = 5 + Math.floor(Math.random() * 3)
      const currentMod = ((angle % 360) + 360) % 360
      const desiredMod = (((360 - theta) % 360) + 360) % 360
      const jitter = (Math.random() - 0.5) * segAngle * 0.4
      const delta = ((desiredMod - currentMod + 360) % 360) + baseTurns * 360 + jitter
      const to = angle + delta

      const dramaMult = drama === 'low' ? 0.75 : drama === 'high' ? 1.15 : 1
      const duration = ((4200 + Math.random() * 1200) * dramaMult) / Math.max(0.1, speed)
      stateRef.current = {
        start: performance.now(),
        from: angle,
        to,
        duration,
        lastTick: -1,
      }
      setSpinning(true)
      AudioFX.spinStart()

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)

      const tick = (now: number) => {
        const s = stateRef.current
        const t = Math.min(1, (now - s.start) / s.duration)
        const eased = easeOut(t)
        const a = s.from + (s.to - s.from) * eased
        setAngle(a)

        const spokeIdx = Math.floor((((a % 360) + 360) % 360) / segAngle)
        if (spokeIdx !== s.lastTick) {
          const vol = 0.04 + 0.12 * (1 - t)
          AudioFX.tick(vol)
          s.lastTick = spokeIdx
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          rafRef.current = null
          setSpinning(false)
          setWinner(targetIdx)
          setJustLanded(true)
          window.setTimeout(() => AudioFX.win(), 100)
          if (onLand) onLand(targetIdx)
          if (flashTimerRef.current != null) window.clearTimeout(flashTimerRef.current)
          flashTimerRef.current = window.setTimeout(() => setJustLanded(false), 2600)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [angle, itemCount, speed, drama, onLand, stop],
  )

  useEffect(() => {
    return () => {
      stop()
      if (flashTimerRef.current != null) window.clearTimeout(flashTimerRef.current)
    }
  }, [stop])

  return { angle, spinning, winner, justLanded, spin }
}
