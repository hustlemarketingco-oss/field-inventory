import { useState, useRef, useCallback } from 'react'

export function useSpeech({ onResult }) {
  const [isListening, setIsListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef(null)
  const silenceRef = useRef(null)
  const finalRef = useRef('')

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!isSupported) return false
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'
    finalRef.current = ''

    rec.onstart = () => setIsListening(true)

    rec.onresult = (e) => {
      let fin = ''
      let inter = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript
        else inter += e.results[i][0].transcript
      }
      if (fin) finalRef.current += fin
      setInterim(inter)

      clearTimeout(silenceRef.current)
      silenceRef.current = setTimeout(() => rec.stop(), 1800)
    }

    rec.onend = () => {
      setIsListening(false)
      setInterim('')
      const text = finalRef.current.trim()
      if (text) onResult(text)
    }

    rec.onerror = (e) => {
      console.error('Speech error', e.error)
      setIsListening(false)
      setInterim('')
    }

    recognitionRef.current = rec
    rec.start()
    return true
  }, [isSupported, onResult])

  const stop = useCallback(() => {
    clearTimeout(silenceRef.current)
    recognitionRef.current?.stop()
  }, [])

  return { isListening, interim, isSupported, start, stop }
}
