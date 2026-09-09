# Soul Sangam — Matrimonial Web & Mobile App

A full-stack matrimonial platform built with **Next.js** (web), **Expo / React Native** (mobile), and **Firebase** (auth, database, storage) — all on the free tier.

---

## Project Structure

```
matrimonial-app/
├── shared/                   # Shared across web and mobile
│   ├── firebase/config.ts    # Firebase initialisation
│   ├── types/index.ts        # TypeScript interfaces
│   └── utils/age.ts          # Age / height helpers
│
├── web/                      # Next.js 14 web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                      # Landing page
│   │   │   ├── (auth)/login/                 # Login page
│   │   │   └── (main)/
│   │   │       ├── browse/                   # Browse & search
│   │   │       ├── matches/                  # Interests & matches
│   │   │       ├── chat/                     # Chat list + conversation
│   │   │       └── profile/                  # View / Edit / Setup
│   │   ├── components/
│   │   │   └── profile/
│   │   │       ├── ProfileCard.tsx
│   │   │       ├── InterestButton.tsx
│   │   │       └── PhotoUploader.tsx
│   │   ├── context/AuthContext.tsx
│   │   └── hooks/useRequireAuth.ts
│   └── .env.local.example
│
├── mobile/                   # Expo (React Native) mobile app
│   ├── app/
│   │   ├── _layout.tsx                       # Root layout
│   │   ├── index.tsx                         # Auth redirect
│   │   ├── (auth)/login.tsx                  # Login screen
│   │   ├── (tabs)/                           # Tab navigator
│   │   │   ├── browse.tsx
│   │   │   ├── matches.tsx
│   │   │   ├── chat.tsx
│   │   │   └── profile.tsx
│   │   ├── profile/[uid].tsx                 # Profile view
│   │   ├── profile/setup.tsx                 # Profile setup wizard
│   │   └── chat/[convId].tsx                 # Conversation screen
│   └── src/
│       ├── components/
│       │   ├── profile/ProfileCard.tsx
│       │   ├── profile/PhotoUploader.tsx
│       │   └── ui/ Button.tsx + Input.tsx
│       ├── constants/theme.ts
│       ├── context/AuthContext.tsx
│       └── lib/firebase.ts
│
├── firestore/
│   ├── firestore.rules          # Firestore security rules
│   ├── firestore.indexes.json   # Composite indexes
│   └── storage.rules            # Firebase Storage rules
│
├── firebase.json                # Firebase project config
└── .firebaserc                  # Project alias (fill in your project ID)
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| npm / pnpm | latest | bundled with Node |
| Expo CLI | latest | `npm i -g expo-cli` |
| Firebase CLI | latest | `npm i -g firebase-tools` |
| Git | any | https://git-scm.com |

---

## 1 — Create Your Firebase Project

> Everything is on the **free Spark plan** — no billing required for testing.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**.
2. Give it a name (e.g. `nikkah-connect`). Disable Google Analytics if you prefer.
3. Once created, note the **Project ID** (e.g. `nikkah-connect-12345`).

### Enable Authentication

1. In the Firebase console → **Authentication** → **Get started**.
2. Enable **Google** sign-in: toggle on, add your support email, save.
3. Enable **Facebook** sign-in:
   - You need a Facebook App first (see section below).
   - Paste your Facebook **App ID** and **App Secret** into Firebase.
   - Copy the **OAuth redirect URI** Firebase gives you — you'll need it in the Facebook developer console.

### Create a Facebook App (for Facebook Login)

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App**.
2. Choose **Consumer** type.
3. Add the **Facebook Login** product.
4. Under Facebook Login → Settings, add the OAuth redirect URI from Firebase.
5. Copy the **App ID** and **App Secret** into Firebase Auth → Facebook provider.

### Enable Firestore

1. Firebase console → **Firestore Database** → **Create database**.
2. Start in **test mode** (you'll deploy proper rules shortly).
3. Choose a region close to your users (e.g. `europe-west2` for UK).

### Enable Firebase Storage

1. Firebase console → **Storage** → **Get started**.
2. Start in **test mode**.
3. Same region as Firestore.

### Get Your Web Config

1. Firebase console → **Project Settings** (gear icon) → **Your apps** → **Add app** → Web (`</>`).
2. Register the app (name it `nikkah-connect-web`).
3. Copy the config object — you'll need it next.

---

## 2 — Configure the Web App

```bash
cd matrimonial-app/web
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=soulsangam-d6ffe.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=soulsangam-d6ffe
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=soulsangam-d6ffe.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Install & Run the Web App

```bash
cd matrimonial-app/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 3 — Configure the Mobile App

Open `matrimonial-app/mobile/app.json` and fill in the `extra` block:

```json
"extra": {
  "firebaseApiKey":            "AIza...",
  "firebaseAuthDomain":        "nikkah-connect-12345.firebaseapp.com",
  "firebaseProjectId":         "nikkah-connect-12345",
  "firebaseStorageBucket":     "nikkah-connect-12345.appspot.com",
  "firebaseMessagingSenderId": "123456789",
  "firebaseAppId":             "1:123456789:web:abc123",
  "googleWebClientId":         "123456789-xxxx.apps.googleusercontent.com"
}
```

> The `googleWebClientId` is found in the Google Cloud Console → **APIs & Services** → **Credentials** → your Web OAuth client.

### Additional Mobile Setup

**Google Sign-In (Android)**
1. In Firebase console → Project Settings → Your apps → Add app → Android.
2. Use package name `com.nikkahconnect.app`.
3. Download `google-services.json` and place it at `mobile/google-services.json`.

**Google Sign-In (iOS)**
1. In Firebase console → Add app → iOS.
2. Use bundle ID `com.nikkahconnect.app`.
3. Download `GoogleService-Info.plist` and place it at `mobile/GoogleService-Info.plist`.
4. Add the reversed client ID from that file to `app.json` under `ios.infoPlist.CFBundleURLTypes`.

**Facebook Sign-In (Mobile)**
1. In your Facebook App dashboard → Settings → Basic → copy the **App ID**.
2. Add to `app.json`:
   ```json
   "facebookScheme": "fbYOUR_APP_ID",
   "facebookAppId":  "YOUR_APP_ID",
   "facebookDisplayName": "Nikkah Connect"
   ```

### Install & Run the Mobile App

```bash
cd matrimonial-app/mobile
npm install
npx expo start
```

- Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with **Expo Go**.

---

## 4 — Deploy Firestore Rules & Indexes

```bash
# From the project root
cd matrimonial-app

# Login to Firebase
firebase login

# Set your project
# Edit .firebaserc and replace YOUR_FIREBASE_PROJECT_ID first
firebase use YOUR_FIREBASE_PROJECT_ID

# Deploy rules and indexes
firebase deploy --only firestore,storage
```

> Indexes can take 2–5 minutes to build in the Firebase console after deployment.

---

## 5 — Deploy the Web App (Firebase Hosting)

```bash
cd matrimonial-app/web
npm run build

# From project root
cd ..
firebase deploy --only hosting
```

Your app will be live at `https://YOUR_PROJECT_ID.web.app`.

---

## 6 — Authorised Domains

For Google/Facebook OAuth to work in production, add your domains to Firebase:

1. Firebase console → **Authentication** → **Settings** → **Authorised domains**.
2. Add:
   - `localhost` (already there)
   - `YOUR_PROJECT_ID.web.app`
   - Any custom domain you configure

---

## Features Summary

| Feature | Web | Mobile |
|---|---|---|
| Google Sign-In | ✅ | ✅ |
| Facebook Sign-In | ✅ | ✅ |
| 5-step profile wizard | ✅ | ✅ |
| Photo upload (up to 6) | ✅ | ✅ |
| Browse & filter profiles | ✅ | ✅ |
| Send / accept / decline interest | ✅ | ✅ |
| Real-time chat | ✅ | ✅ |
| Profile edit | ✅ | ✅ (via setup) |
| Privacy controls | ✅ | ✅ |
| Mobile bottom tab nav | — | ✅ |
| Firestore security rules | ✅ | ✅ |
| Firebase Storage rules | ✅ | ✅ |

---

## Free Tier Limits (Firebase Spark)

| Service | Free allowance | Enough for… |
|---|---|---|
| Firestore reads | 50,000 / day | ~500 active users |
| Firestore writes | 20,000 / day | ~200 profile updates |
| Storage | 5 GB | ~1,000 profile photos |
| Storage downloads | 1 GB / day | ~200 users browsing |
| Hosting | 10 GB / month | Plenty for testing |
| Auth | Unlimited | ✅ |

When you're ready to scale, upgrading to the **Blaze plan** (pay-as-you-go) keeps costs very low at small scale and unlocks Cloud Functions for server-side notifications and admin tasks.

---

## Next Steps (Post-Testing)

- [ ] Add push notifications (Firebase Cloud Messaging)
- [ ] Profile verification workflow (ID upload + admin review)
- [ ] Admin dashboard (profile moderation, user management)
- [ ] Subscription / premium tiers (Stripe or Razorpay)
- [ ] Email/SMS OTP login as an alternative to social auth
- [ ] App Store & Google Play submission

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | Next.js 14 (App Router), Tailwind CSS |
| Mobile | Expo 51, React Native, Expo Router |
| Auth | Firebase Authentication (Google, Facebook) |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Hosting | Firebase Hosting |
| Language | TypeScript throughout |

---

## Troubleshooting

**"Firebase: Error (auth/unauthorized-domain)"**
→ Add your domain to Firebase Auth → Settings → Authorised domains.

**"Missing or insufficient permissions" on Firestore**
→ Deploy the security rules: `firebase deploy --only firestore:rules`

**Browse page shows no profiles**
→ Firestore indexes take a few minutes to build after first deploy. Check the Indexes tab in the Firebase console for status.

**Facebook login works on web but not mobile**
→ Ensure `facebookScheme`, `facebookAppId`, and the Facebook App's iOS/Android bundle IDs are all configured correctly in `app.json`.

**Photos not uploading**
→ Check Storage rules are deployed and the bucket name in your `.env.local` / `app.json` matches your Firebase project exactly.
