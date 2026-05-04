import React, { useState } from 'react'

function ConfidenceBadge({ confidence }) {
  const map = {
    high: { color: '#22c55e', label: '✓' },
    medium: { color: '#f59e0b', label: '~' },
    low: { color: '#ef4444', label: '⚠' },
  }
  const { color, label } = map[confidence] || map.medium
  return <span style={{ color, fontSize: '13px', fontWeight: '700' }}>{label}</span>
}

function ItemRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [qty, setQty] = useState(item.quantity)

  const confirm = () => {
    onUpdate(item.id, qty)
    setEditing(false)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto',
      gap: '8px',
      padding: '11px 14px',
      borderBottom: '1px solid #1c2133',
      alignItems: 'center',
      animation: 'slideIn 0.2s ease',
    }}>
      <div style={{ fontSize: '14px', color: '#e2e8f0', wordBreak: 'break-word' }}>{item.item}</div>

      {editing ? (
        <>
          <input
            type="number"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            style={{
              width: '60px',
              background: '#1c2133',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              padding: '6px 8px',
              color: '#fff',
              fontSize: '14px',
              textAlign: 'center',
            }}
          />
          <button onPointerDown={confirm} style={{
            background: '#14532d', border: '1px solid #22c55e', color: '#22c55e',
            borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer'
          }}>✓</button>
          <button onPointerDown={() => setEditing(false)} style={{
            background: '#1c2133', border: '1px solid #252c3d', color: '#8895aa',
            borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer'
          }}>✕</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', textAlign: 'right', minWidth: '28px' }}>
            {item.quantity}
          </div>
          <ConfidenceBadge confidence={item.confidence} />
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onPointerDown={() => { setQty(item.quantity); setEditing(true) }} style={{
              background: 'none', border: 'none', color: '#4a5568', fontSize: '14px',
              padding: '4px', cursor: 'pointer', lineHeight: 1
            }}>✎</button>
            <button onPointerDown={() => onDelete(item.id)} style={{
              background: 'none', border: 'none', color: '#4a5568', fontSize: '14px',
              padding: '4px', cursor: 'pointer', lineHeight: 1
            }}>🗑</button>
          </div>
        </>
      )}
    </div>
  )
}

export function InventoryTable({ items, getRooms, getItemsByRoom, onUpdate, onDelete, roomMode }) {
  if (!items.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 20px',
        color: '#2e3850',
        fontSize: '14px',
        border: '1px dashed #252c3d',
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
        <div>No items logged yet</div>
        <div style={{ fontSize: '12px', marginTop: '6px', color: '#1c2133' }}>Tap the mic and start describing items</div>
      </div>
    )
  }

  const rooms = getRooms()
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #252c3d' }}>
      {/* Header */}
      <div style={{
        background: '#1c2133',
        padding: '10px 14px',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: '8px',
        fontSize: '10px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: '#3b82f6',
        fontWeight: '700',
      }}>
        <span>Item</span>
        <span style={{ textAlign: 'right' }}>Qty</span>
        <span>OK?</span>
        <span></span>
      </div>

      {/* Rows grouped by room */}
      {rooms.map(room => {
        const roomItems = getItemsByRoom(room)
        return (
          <div key={room}>
            {roomMode && (
              <div style={{
                padding: '7px 14px',
                background: '#161a24',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#4a5568',
                borderBottom: '1px solid #1c2133',
                borderTop: '1px solid #1c2133',
              }}>
                {room}
              </div>
            )}
            {roomItems.map(item => (
              <ItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </div>
        )
      })}

      {/* Total */}
      <div style={{
        background: '#1e3a5f',
        padding: '12px 14px',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: '8px',
        borderTop: '1px solid #2e3850',
      }}>
        <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Total
        </span>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff', textAlign: 'right' }}>{totalQty}</span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}
