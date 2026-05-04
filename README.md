# Field Inventory App

A voice-powered insurance inventory tool. Walk through a property, speak item descriptions, and get a clean itemized list ready to export.

---

## Setup (one time)

### 1. Prerequisites
- [Node.js](https://nodejs.org) installed (v18 or later)
- A GitHub account
- Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

---

### 2. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
npm install
```

---

### 3. Add your API key

Copy the example env file:

```bash
cp .env.example .env
```

Open `.env` in any text editor and replace `your_api_key_here` with your actual Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx
```

> ⚠️ Never commit `.env` to git. It's already in `.gitignore` so this is handled automatically.

---

### 4. Run locally (for testing)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in Chrome.

---

### 5. Deploy to GitHub Pages

**One-time GitHub setup:**

1. Go to your repo on GitHub
2. Click **Settings → Pages**
3. Under "Source" select **GitHub Actions** (or "Deploy from a branch" → `gh-pages`)

**Deploy:**

```bash
npm run deploy
```

This builds the app and pushes to the `gh-pages` branch automatically.

Your app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

> Note: GitHub Pages is public by default. Since the API key is loaded at build time via Vite's env system, it will be embedded in the built JavaScript. For a private family use app this is acceptable — just don't share the URL publicly or use a Anthropic key with a low spend limit set in the console.

---

## Usage

### On phone (field use)
- Use **Chrome** on Android (or Chrome on iPhone — Safari does NOT support speech recognition)
- Tap the mic button and describe items naturally
- The app reads back what it logged out loud so you can keep your eyes on the room
- Tap **Review** tab to see the full list and resolve any flagged items

### On laptop (after the job)
- Open the URL in Chrome
- Go to **Review** tab
- Edit any quantities, resolve flags, then tap **Export CSV**

---

## How it works

| Feature | Details |
|---|---|
| **Speech** | Web Speech API (Chrome only) |
| **AI parsing** | Claude Sonnet extracts items + quantities from natural speech |
| **Duplicate merging** | Same item mentioned in multiple rooms = one combined total |
| **Flags** | Vague quantities, missing numbers, or implausible counts get flagged for review |
| **Audio readback** | App speaks confirmation after each entry |
| **Auto-save** | Everything saves to browser localStorage instantly — no data loss on crash |
| **Room mode** | Optional — say "moving to kitchen" to switch rooms |
| **Export** | CSV with room, item, quantity, and confidence columns |

---

## Tips

- Speak naturally: *"3 throw pillows, a Samsung 55-inch TV, and 6 dining chairs"*
- Multiple items in one breath all get captured
- If something gets flagged, just keep going — resolve flags at the end of the room or at the end of the job
- The **Review** tab is designed for laptop use — larger table, inline editing

---

## Cost

Each voice entry makes one Claude API call. A typical room (5–10 items) costs less than $0.01. A full house job is usually under $0.10 total.

Set a monthly spend limit at [console.anthropic.com](https://console.anthropic.com) → Billing → Limits.
