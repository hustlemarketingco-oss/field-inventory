import React, { useState } from 'react'

export function FlagPanel({ flags, onResolve }) {
  const [editing, setEditing] = useState({})

  if (!flags.length) return null

  return (
    <div style={{
      background: '#1a1200',
      border: '1px solid #78350f',
      borderRadius: '12px',
      padding: '16px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        fontSize: '11px',
        letterSpacing: '2px',
        color: '#f59e0b',
        textTransform: 'uppercase',
        marginBottom: '14px',
        fontWeight: '700',
      }}>
        ⚠ {flags.length} item{flags.length > 1 ? 's' : ''} need review
      </div>

      {flags.map(flag => (
        <div key={flag.id} style={{
          borderTop: '1px solid #292012',
          paddingTop: '12px',
          marginTop: '12px',
          animation: 'slideIn 0.25s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', color: '#e2e8f0', fontWeight: '600' }}>
                {flag.quantity}× {flag.item}
              </div>
              <div style={{ fontSize: '11px', color: '#8895aa', marginTop: '2px' }}>{flag.room}</div>
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>{flag.flag}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            {editing[flag.id] !== undefined ? (
              <>
                <input
                  type="number"
                  value={editing[flag.id]}
                  onChange={e => setEditing(prev => ({ ...prev, [flag.id]: Number(e.target.value) }))}
                  style={{
                    width: '70px',
                    background: '#1c2133',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '15px',
                  }}
                />
                <button
                  onPointerDown={() => {
                    onResolve(flag.id, editing[flag.id])
                    setEditing(prev => { const n = { ...prev }; delete n[flag.id]; return n })
                  }}
                  style={{
                    flex: 1,
                    background: '#14532d',
                    border: '1px solid #22c55e',
                    color: '#22c55e',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Confirm
                </button>
                <button
                  onPointerDown={() => setEditing(prev => { const n = { ...prev }; delete n[flag.id]; return n })}
                  style={{
                    background: '#1c2133',
                    border: '1px solid #252c3d',
                    color: '#8895aa',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <button
                  onPointerDown={() => onResolve(flag.id, undefined)}
                  style={{
                    flex: 1,
                    background: '#14532d',
                    border: '1px solid #22c55e',
                    color: '#22c55e',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Looks correct
                </button>
                <button
                  onPointerDown={() => setEditing(prev => ({ ...prev, [flag.id]: flag.quantity }))}
                  style={{
                    flex: 1,
                    background: '#1a1200',
                    border: '1px solid #78350f',
                    color: '#f59e0b',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  ✎ Edit qty
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
