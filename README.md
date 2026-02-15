# 🎊 Vòng Quay May Mắn Tết 2026

A humorous "rigged" lucky spin wheel where users always win 1K VND despite the wheel being full of high-value prizes. Built with Next.js 15, Firebase Firestore, and steganographic security.

## ✨ Features

- 🎰 **Rigged Wheel Animation** — 3 troll strategies (Fake Jackpot, Slow Creep, Double Betrayal) that always land on 1K
- 🔐 **UIA Security** — Session token hidden inside a JPEG image via steganography
- 🧬 **Browser Fingerprinting** — Canvas, screen, navigator, device memory, touch points
- 🛡️ **Service Worker Cache** — UIA image fetched once, cached forever via SW
- 🎮 **Dual Mode** — Real (server-verified, one spin per device) + Local (unlimited testing)
- 🎵 **Background Music** — Thần Tài Đến on page load
- 📱 **Responsive** — Works on all devices
- 🔥 **Firestore** — Spin records persisted server-side

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| Validation | Zod |
| Hashing | js-sha256 |
| Caching | Service Worker (Cache Storage) |

## 🚀 Setup

### 1. Install

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials (see `.env.example` for details).

### 3. Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate a service account key:
   - Project Settings → Service Accounts → Generate New Private Key
4. Copy credentials to `.env.local`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
lucky-spin/
├── app/
│   ├── actions/
│   │   ├── spin.ts              # Server Action — spin logic + Firestore write
│   │   ├── get-spin.ts          # Check if user already spun (cookie + Firestore)
│   │   └── get-all-spins.ts     # Fetch all spins (admin)
│   ├── api/
│   │   └── getUIA/route.ts      # GET endpoint — generates JPEG with hidden token
│   ├── assmin/
│   │   └── page.tsx             # Admin page — view all spin records
│   ├── components/
│   │   ├── PageContent.tsx      # Main orchestrator (SW registration, UIA fetch, audio)
│   │   ├── ModeToggle.tsx       # Real/Local mode switcher + SpinForm container
│   │   ├── SpinForm.tsx         # Name input + spin button + token extraction
│   │   ├── WheelCanvas.tsx      # Canvas wheel with troll animation strategies
│   │   ├── ResultModal.tsx      # Congratulations modal
│   │   └── RecentRolls.tsx      # Waterfall display of recent spins
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Server-side entry (cookie check + Firestore lookup)
├── lib/
│   ├── firebase-admin.ts        # Firebase Admin SDK (server-only)
│   ├── firebase-client.ts       # Firebase Client SDK
│   ├── fingerprint.ts           # Browser fingerprint collection
│   ├── fingerprint-hash.ts      # Encoding, decoding, hashing, validation
│   ├── cookies.ts               # Fingerprint cookie management
│   └── recent-rolls.ts          # Local roll history utilities
├── public/
│   ├── sw.js                    # Service Worker — caches UIA image
│   ├── UIIA.jpg                 # Base image for UIA steganography
│   └── Thần Tài Đến.mp3        # Background music
└── .env.local                   # Environment variables (not in git)
```

## 🔐 Security Flow (UIA)

| Step | What happens | Token visible? |
|---|---|---|
| **Page load** | Fingerprint collected → `GET /api/getUIA?asset=<encoded>` → SW caches response | ❌ No |
| **Browsing** | Image in SW Cache Storage. Nothing in JS, localStorage, or React state | ❌ No |
| **Spin click** | SpinForm re-fetches (SW returns cached) → reads last 64 bytes → extracts token | ✅ Briefly |
| **Server validates** | Recomputes `SHA256(fingerprint + SERVER_SECRET)` → compares with token | — |

- ✅ No token in localStorage
- ✅ No token in React state until spin
- ✅ No obvious API returning a token (looks like a JPEG request)
- ✅ Token bound to device fingerprint
- ✅ Stateless server verification

## 🎡 Animation Strategies

The wheel always lands on 1K, but uses random strategies to create suspense:

1. **Fake Jackpot Panic** — Spins toward 500K, pauses, flashes, then snaps to 1K
2. **Cruel Slow Creep** — Overshoots past 1K, slowly creeps back
3. **Double Betrayal** — Lands on 500K, reverses to 200K, then snaps to 1K

## 📊 Admin

Visit `/assmin` to view all spin records (name, amount, time).

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## License

MIT
