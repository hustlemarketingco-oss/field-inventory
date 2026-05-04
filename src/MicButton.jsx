import React from 'react'

export function MicButton({ isListening, isProcessing, onStart, onStop, disabled }) {
  const handleTap = () => {
    if (disabled) return
    if (isListening) onStop()
    else onStart()
  }

  const getState = () => {
    if (isProcessing) return 'processing'
    if (isListening) return 'listening'
    return 'idle'
  }

  const state = getState()

  const styles = {
    idle: {
      background: 'radial-gradient(circle at 40% 35%, #1e3a5f, #0d0f14)',
      border: '3px solid #3b82f6',
      animation: 'pulse-blue 3s infinite',
    },
    listening: {
      background: 'radial-gradient(circle at 40% 35%, #3a0a0a, #1a0000)',
      border: '3px solid #ef4444',
      animation: 'pulse-red 1s infinite',
    },
    processing: {
      background: 'radial-gradient(circle at 40% 35%, #0a1a0a, #0d0f14)',
      border: '3px solid #22c55e',
      animation: 'none',
    },
  }

  const icons = {
    idle: '🎙️',
    listening: '⏹',
    processing: '⚙️',
  }

  const labels = {
    idle: 'TAP TO SPEAK',
    listening: 'LISTENING — TAP TO STOP',
    processing: 'PROCESSING...',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <button
        onPointerDown={handleTap}
        disabled={isProcessing}
        style={{
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          fontSize: '48px',
          cursor: isProcessing ? 'wait' : 'pointer',
          transition: 'transform 0.1s, border-color 0.2s',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          ...styles[state],
        }}
        onPointerDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.94)'
          handleTap()
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {icons[state]}
      </button>
      <div style={{
        fontSize: '11px',
        letterSpacing: '2px',
        color: state === 'listening' ? '#ef4444' : state === 'processing' ? '#22c55e' : '#3b82f6',
        textTransform: 'uppercase',
        fontWeight: '600',
      }}>
        {labels[state]}
      </div>
    </div>
  )
}
