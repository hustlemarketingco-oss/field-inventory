import React, { useState, useCallback, useEffect } from 'react'
import { parseInventoryEntry } from './api'
import { useSpeech } from './useSpeech'
import { useWakeLock } from './useWakeLock'
import { useInventory } from './useInventory'
import { MicButton } from './MicButton'
import { FlagPanel } from './FlagPanel'
import { InventoryTable } from './InventoryTable'

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1.05
  window.speechSynthesis.speak(u)
}

function exportCSV(items, getRooms, getItemsByRoom, roomMode) {
  const rows = [['Room', 'Item', 'Quantity', 'Status']]
  const rooms = getRooms()
  rooms.forEach(room => {
    getItemsByRoom(room).forEach(i => {
      rows.push([room, i.item, i.quantity, i.confidence])
    })
  })
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [readback, setReadback] = useState('')
  const [error, setError] = useState('')
  const [roomMode, setRoomMode] = useState(false)
  const [currentRoom, setCurrentRoom] = useState('Living Room')
  const [view, setView] = useState('field') // 'field' | 'review'

  const inv = useInventory()
  const { acquire, release } = useWakeLock()

  const handleSpeechResult = useCallback(async (text) => {
    setError('')
    setIsProcessing(true)

    // Room switch command
    if (roomMode) {
      const m = text.match(/(?:moving to|next room|switch(?:ing)? to|now in|going to)\s+(.+)/i)
      if (m) {
        const newRoom = m[1].replace(/[.,!?]$/, '').trim()
        const roomItems = inv.getItemsByRoom(currentRoom)
        let msg
        if (roomItems.length) {
          const summary = roomItems.map(i => `${i.quantity} ${i.item}`).join(', ')
          msg = `${currentRoom} complete — ${summary}. Moving to ${newRoom}.`
        } else {
          msg = `Moving to ${newRoom}.`
        }
        speak(msg)
        setReadback(msg)
        setCurrentRoom(newRoom)
        setIsProcessing(false)
        return
      }
    }

    try {
      const parsed = await parseInventoryEntry(text)
      if (!parsed.items || parsed.items.length === 0) {
        const msg = parsed.readback || "I didn't catch that clearly — please repeat."
        speak(msg)
        setReadback(msg)
      } else {
        inv.addEntries(parsed.items, roomMode ? currentRoom : 'All Items', text)
        speak(parsed.readback || 'Items logged.')
        setReadback(parsed.readback || 'Items logged.')
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong — please try again.'
      setError(msg)
      speak('There was an error. Please try again.')
    }

    setIsProcessing(false)
  }, [roomMode, currentRoom, inv])

  const speech = useSpeech({ onResult: handleSpeechResult })

  const handleMicStart = useCallback(() => {
    acquire()
    speech.start()
  }, [acquire, speech])

  const handleMicStop = useCallback(() => {
    speech.stop()
    release()
  }, [release, speech])

  const handleClear = () => {
    if (!confirm('Clear all inventory data? This cannot be undone.')) return
    inv.clearAll()
    setReadback('')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: '2px' }}>
            Insurance
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Field Inventory
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {inv.unresolvedFlags.length > 0 && (
            <div style={{
              background: 'var(--orange-dim)',
              border: '1px solid #78350f',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '12px',
              color: 'var(--orange)',
            }}>
              ⚠ {inv.unresolvedFlags.length}
            </div>
          )}
          <div style={{
            background: 'var(--green-dim)',
            border: '1px solid #166534',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '12px',
            color: 'var(--green)',
          }}>
            ✓ {inv.items.length} lines
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        {['field', 'review'].map(tab => (
          <button key={tab} onPointerDown={() => setView(tab)} style={{
            flex: 1,
            padding: '10px',
            background: 'none',
            border: 'none',
            borderBottom: view === tab ? '2px solid var(--blue)' : '2px solid transparent',
            color: view === tab ? 'var(--blue)' : 'var(--text-muted)',
            fontSize: '12px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: '600',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}>
            {tab === 'field' ? '🎙 Field' : '📋 Review'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {view === 'field' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>

            {/* Room Mode Toggle */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-dim)' }}>
                <input
                  type="checkbox"
                  checked={roomMode}
                  onChange={e => setRoomMode(e.target.checked)}
                  style={{ accentColor: 'var(--blue)', width: '16px', height: '16px' }}
                />
                Room-by-room mode
              </label>
              {roomMode && (
                <input
                  value={currentRoom}
                  onChange={e => setCurrentRoom(e.target.value)}
                  placeholder="Room name..."
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    background: 'var(--surface2)',
                    border: '1px solid var(--blue)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              )}
            </div>

            {/* Mic */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <MicButton
                isListening={speech.isListening}
                isProcessing={isProcessing}
                onStart={handleMicStart}
                onStop={handleMicStop}
              />
            </div>

            {/* Transcript */}
            {(speech.interim || speech.isListening) && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '14px',
                color: 'var(--text-dim)',
                fontStyle: 'italic',
                animation: 'fadeIn 0.2s ease',
              }}>
                "{speech.interim || '...'}"
              </div>
            )}

            {/* Readback */}
            {readback && !speech.isListening && !isProcessing && (
              <div style={{
                background: '#0a1a0a',
                border: '1px solid #166534',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13px',
                color: 'var(--green)',
                animation: 'fadeIn 0.3s ease',
              }}>
                ✓ {readback}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: 'var(--red-dim)',
                border: '1px solid #991b1b',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13px',
                color: 'var(--red)',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Browser warning */}
            {!speech.isSupported && (
              <div style={{
                background: 'var(--red-dim)',
                border: '1px solid #991b1b',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '13px',
                color: 'var(--red)',
              }}>
                ⚠ Speech recognition not supported in this browser. Please use <strong>Chrome</strong> on Android or desktop.
              </div>
            )}

            {/* Flags */}
            <FlagPanel flags={inv.unresolvedFlags} onResolve={inv.resolveFlag} />

            {/* Tips */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: '1.9',
            }}>
              <div style={{ color: 'var(--blue)', marginBottom: '6px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Tips</div>
              <div>• Speak naturally: "3 throw pillows, a 55-inch Samsung TV"</div>
              <div>• List multiple items in one breath — all will be captured</div>
              {roomMode && <div>• Say "moving to kitchen" to switch rooms</div>}
              <div>• Duplicates are automatically combined into one total</div>
              <div>• Everything auto-saves — you won't lose work</div>
            </div>
          </div>
        )}

        {view === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onPointerDown={() => exportCSV(inv.items, inv.getRooms, inv.getItemsByRoom, roomMode)}
                style={{
                  flex: 1,
                  background: 'var(--blue-dim)',
                  border: '1px solid #1d4ed8',
                  color: 'var(--blue)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                ↓ Export CSV
              </button>
              <button
                onPointerDown={handleClear}
                style={{
                  background: 'var(--red-dim)',
                  border: '1px solid #991b1b',
                  color: 'var(--red)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                ✕ Clear
              </button>
            </div>

            {/* Flags in review */}
            <FlagPanel flags={inv.unresolvedFlags} onResolve={inv.resolveFlag} />

            {/* Table */}
            <InventoryTable
              items={inv.items}
              getRooms={inv.getRooms}
              getItemsByRoom={inv.getItemsByRoom}
              onUpdate={inv.updateItem}
              onDelete={inv.deleteItem}
              roomMode={roomMode}
            />

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span><span style={{ color: 'var(--green)' }}>✓</span> Confirmed</span>
              <span><span style={{ color: 'var(--orange)' }}>~</span> Assumed qty</span>
              <span><span style={{ color: 'var(--red)' }}>⚠</span> Needs review</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
