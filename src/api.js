const SYSTEM_PROMPT = `You are an insurance inventory assistant. Extract items and quantities from spoken inventory descriptions.

Return ONLY valid JSON — no preamble, no markdown, no backticks:
{
  "items": [
    {
      "item": "normalized item name (clean, singular noun phrase)",
      "quantity": number,
      "confidence": "high|medium|low",
      "flag": null or "reason string"
    }
  ],
  "readback": "Brief spoken confirmation, e.g. 'Got it — 3 throw pillows and 1 TV logged.'"
}

Rules:
- Normalize names consistently: 'throw pillow' not 'throw pillows', 'dining chair' not 'chairs'
- No quantity stated → assume 1, confidence 'medium', flag 'No quantity stated — assumed 1'
- Vague quantity (few, some, couple, bunch) → best guess, confidence 'low', flag 'Vague quantity — please confirm'
- Implausible quantity for a home (e.g. 40+ dining chairs) → log it, confidence 'low', flag 'Unusually high quantity — please confirm'
- Garbled/nonsensical input → items: [], readback: "I didn't catch that clearly — please repeat"
- Multiple items in one phrase is fine — extract all of them
- NEVER output anything except the JSON object`

export async function parseInventoryEntry(text) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API key not configured. Check your .env file.')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const raw = data.content?.find(b => b.type === 'text')?.text || '{}'
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
