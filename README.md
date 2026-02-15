# 🎊 Vòng Quay May Mắn Tết 2026

A humorous "rigged" lucky spin wheel where users always win 1k VND despite visual trickery. Built with Next.js 15, Firebase Firestore, and browser fingerprinting.

## Features

- 🎰 **Rigged Wheel Animation**: Suspenseful spin that always lands on 1k
- 🔒 **Real Mode**: One spin per person (server-verified via fingerprint + Firestore)
- 🎮 **Local Mode**: Unlimited testing spins (browser-only, no server)
- 🎊 **Recent Rolls Waterfall**: Real-time display of recent spins
- 🛡️ **Rate Limiting**: IP-based protection against spam
- 🍪 **Cookie Persistence**: Fingerprint stored for session tracking
- 📱 **Responsive Design**: Works on all devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Fingerprinting**: Browser APIs + Canvas fingerprinting
- **Validation**: Zod
- **Hashing**: js-sha256

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
4. Copy the credentials to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### 3. Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /spins/{fingerprintHash} {
      allow read: if true;
      allow create: if request.resource.data.amount == 1000
                    && request.resource.data.name is string
                    && request.resource.data.createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
lucky-spin/
├── app/
│   ├── actions/
│   │   ├── spin.ts              # Server Action for spin logic
│   │   └── get-spin.ts          # Server Action to fetch existing spin
│   ├── components/
│   │   ├── ModeToggle.tsx       # Real/Local mode switcher
│   │   ├── PageContent.tsx      # Main page orchestrator
│   │   ├── RecentRolls.tsx      # Waterfall display of recent spins
│   │   ├── WheelCanvas.tsx      # Rigged wheel animation
│   │   ├── SpinForm.tsx         # Name input + spin button
│   │   └── ResultModal.tsx      # Congratulations modal
│   ├── globals.css              # Tailwind + custom animations
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Server-side entry point
├── lib/
│   ├── firebase-admin.ts        # Firebase Admin SDK (server)
│   ├── firebase-client.ts       # Firebase Client SDK
│   ├── fingerprint.ts           # Browser fingerprint collection
│   ├── fingerprint-hash.ts      # SHA-256 hashing
│   ├── rate-limit.ts            # IP-based rate limiting
│   ├── get-client-ip.ts         # Extract client IP from headers
│   ├── cookies.ts               # Fingerprint cookie management
│   └── recent-rolls.ts          # Roll display utilities
├── .env.local                   # Environment variables (not in git)
└── next.config.ts               # Next.js configuration
```

## How It Works

### Real Mode Flow

1. User enters name and clicks "QUAY NGAY!"
2. Browser collects fingerprint (canvas, screen, navigator APIs)
3. Fingerprint sent to Server Action
4. Server generates SHA-256 hash of fingerprint
5. Server checks Firestore for existing spin with that hash
6. If exists: "Bạn tham quá 😏" (already spun)
7. If new: Create Firestore document, set cookie, return success
8. Wheel animates with suspense → flash → snap to 1k
9. Result modal shows "Chúc mừng bạn đã trúng 1k! 🎉"

### Local Mode Flow

1. User enters name and clicks "QUAY NGAY!"
2. Skip Server Action entirely
3. Store spin in localStorage
4. Trigger wheel animation
5. Show result with spin count
6. Allow unlimited spins

### Fingerprint Components

- User Agent
- Platform
- Language
- Timezone
- Screen dimensions (width, height, color depth)
- Hardware concurrency
- Device memory
- Max touch points
- Canvas fingerprint (rendered text → base64)

### Rate Limiting

- 10 requests per 60 seconds per IP
- In-memory Map tracking
- Automatic cleanup of old entries

## Testing Checklist

### Real Mode
- [ ] First spin succeeds
- [ ] Second spin shows "Bạn tham quá 😏"
- [ ] Cookie persists after refresh
- [ ] Rate limit blocks after 10 requests
- [ ] Recent rolls update in real-time

### Local Mode
- [ ] Unlimited spins allowed
- [ ] Spin counter increments
- [ ] localStorage persists after refresh
- [ ] Reset button clears history
- [ ] Recent rolls show local spins

### Animation
- [ ] Wheel spins smoothly
- [ ] Suspense effect near high values
- [ ] White flash on completion
- [ ] Always lands on 1k
- [ ] Confetti in result modal

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## Security Notes

- Firebase Admin credentials are server-side only
- Private keys never exposed to client
- Rate limiting prevents spam
- Firestore rules enforce 1k amount
- Fingerprint hash prevents easy replay attacks

## Troubleshooting

**Build fails with Firebase errors:**
- Check `.env.local` has all required variables
- Ensure private key is properly escaped with `\n`

**"Bạn tham quá" on first spin:**
- Clear cookies
- Check Firestore for existing document with your fingerprint hash

**Recent rolls not updating:**
- Check Firebase client config
- Verify Firestore rules allow reads
- Check browser console for errors

**Rate limit too aggressive:**
- Adjust limits in `lib/rate-limit.ts` (default: 10 req/60s)

## License

MIT

## Credits

Built following the implementation plan for a humorous rigged lucky spin wheel with dual-mode support.
