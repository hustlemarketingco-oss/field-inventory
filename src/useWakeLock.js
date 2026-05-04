import { useRef, useCallback } from 'react'

export function useWakeLock() {
  const lockRef = useRef(null)

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      lockRef.current = await navigator.wakeLock.request('screen')
    } catch (e) {
      // Not critical — silently fail
    }
  }, [])

  const release = useCallback(() => {
    lockRef.current?.release()
    lockRef.current = null
  }, [])

  return { acquire, release }
}
