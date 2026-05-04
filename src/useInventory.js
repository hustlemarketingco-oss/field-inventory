import { useState, useCallback } from 'react'

const STORAGE_KEY = 'field_inventory_v2'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], flags: [], log: [] }
    return JSON.parse(raw)
  } catch {
    return { items: [], flags: [], log: [] }
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

function normalizeKey(str) {
  return str.toLowerCase().trim().replace(/s$/, '')
}

export function useInventory() {
  const initial = load()
  const [items, setItems] = useState(initial.items)
  const [flags, setFlags] = useState(initial.flags)
  const [log, setLog] = useState(initial.log)

  const commit = useCallback((nextItems, nextFlags, nextLog) => {
    setItems(nextItems)
    setFlags(nextFlags)
    setLog(nextLog)
    save({ items: nextItems, flags: nextFlags, log: nextLog })
  }, [])

  const addEntries = useCallback((parsedItems, room, transcript) => {
    setItems(prev => {
      const updated = [...prev]
      parsedItems.forEach(ni => {
        const key = normalizeKey(ni.item)
        const idx = updated.findIndex(e => normalizeKey(e.item) === key && e.room === room)
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + ni.quantity,
            confidence: ni.confidence === 'low' ? 'low' : updated[idx].confidence,
          }
        } else {
          updated.push({
            id: `${Date.now()}-${Math.random()}`,
            item: ni.item,
            quantity: ni.quantity,
            confidence: ni.confidence,
            room,
          })
        }
      })

      const nextFlags = [
        ...flags,
        ...parsedItems
          .filter(ni => ni.flag)
          .map(ni => ({
            id: `flag-${Date.now()}-${Math.random()}`,
            item: ni.item,
            quantity: ni.quantity,
            flag: ni.flag,
            room,
            resolved: false,
          })),
      ]

      const nextLog = [
        ...log,
        {
          time: new Date().toLocaleTimeString(),
          transcript,
          count: parsedItems.length,
        },
      ]

      save({ items: updated, flags: nextFlags, log: nextLog })
      setFlags(nextFlags)
      setLog(nextLog)
      return updated
    })
  }, [flags, log])

  const resolveFlag = useCallback((flagId, confirmedQty) => {
    setFlags(prev => {
      const next = prev.map(f => f.id === flagId ? { ...f, resolved: true } : f)
      if (confirmedQty !== undefined) {
        const flag = prev.find(f => f.id === flagId)
        if (flag) {
          setItems(prevItems => {
            const updated = prevItems.map(i =>
              normalizeKey(i.item) === normalizeKey(flag.item) && i.room === flag.room
                ? { ...i, quantity: confirmedQty, confidence: 'high' }
                : i
            )
            save({ items: updated, flags: next, log })
            return updated
          })
        }
      } else {
        save({ items, flags: next, log })
      }
      return next
    })
  }, [items, log])

  const updateItem = useCallback((id, quantity) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, quantity, confidence: 'high' } : i)
      save({ items: updated, flags, log })
      return updated
    })
  }, [flags, log])

  const deleteItem = useCallback((id) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id)
      save({ items: updated, flags, log })
      return updated
    })
  }, [flags, log])

  const clearAll = useCallback(() => {
    commit([], [], [])
  }, [commit])

  const getRooms = useCallback(() => {
    return [...new Set(items.map(i => i.room))]
  }, [items])

  const getItemsByRoom = useCallback((room) => {
    return items.filter(i => i.room === room)
  }, [items])

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const unresolvedFlags = flags.filter(f => !f.resolved)

  return {
    items,
    flags,
    log,
    unresolvedFlags,
    totalItems,
    addEntries,
    resolveFlag,
    updateItem,
    deleteItem,
    clearAll,
    getRooms,
    getItemsByRoom,
  }
}
