# Lablab 💕 | All-In-One Couple Web App

A personalized couple web app created with love for **Nekol** and her bebe. Features Penguin & Kuromi dual aesthetics, an interactive gatekeeper with evasive anti-intruder protocols, movie roulette, Metro Manila foodie date explorer, couple expense tracker, and a shared photo memory scrapbook.

---

## 🌟 Key Features

1. **Gatekeeper Security ("Are you Nekol my bebe lablab? 💕")**
   - **Yes, it's me!**: Triggers celebration confetti, success fanfare, and grants entry.
   - **No, not me**: The "No" button physically evades the cursor/touch screen! If somehow caught, it activates **Level 5 Intruder Lockdown** with alarm sirens, tactical bodyguard penguins 🐧🥋, and angry Kuromi 😈 bombs, with a playful redemption unlock.

2. **Dual Themes (Penguin 🐧 vs Kuromi 😈)**
   - Seamless one-tap toggle in the header.
   - **Penguin Theme**: Frosty blues, cozy polar whites, and playful penguin badges.
   - **Kuromi Theme**: Midnight black, gothic lavender, neon magenta/hot-pink, and starry punk sparkles.

3. **Movie Roulette 🎬**
   - Multi-genre spinning wheel randomizer (Romance, Pinoy Rom-Coms, Animation/Anime, Horror, K-Drama, Comedy).
   - "Surprise Me" instant pick.
   - Watchlist & Watched History with 1-5 heart ratings and couple reviews.

4. **Where to Eat in Metro Manila 🍽️**
   - Filters designed for Manila date reality:
     - **Budget**: ₱ (Tipid < ₱350), ₱₱ (Casual Date ₱350–₱1000), ₱₱₱ (Celebration / Fancy ₱1000+)
     - **Gutom Level**: Konti lang / Kape & Dessert 🧋, Tamang Gutom 🍲, Patay-Gutom / Beast Mode 🥩
     - **Pagod Level**: Katabi lang 🛵, 15–30 Mins 🚗, Adventure Mode 🗺️
   - Preloaded with top-reviewed date spots across BGC, Makati, QC, Binondo, etc.
   - Direct Google Maps directions button and custom spot submission.

5. **Fun Couple Expense Tracker 💸**
   - "Sino Nagbayad?" visual breakdown (Boyfriend 🐧 vs Nekol 🎀 vs 50/50 ⚖️ vs Treats 🎁).
   - Cute stats: Boba & Coffee fund, food trip totals, and total date investment.
   - Category tags and spending history ledger.

6. **Shared Love Calendar & Scrapbook 📅📸**
   - Interactive monthly calendar marking dates with memories and heart badges.
   - Journal entry for each date ("What happened on this day / What it's about").
   - Photo upload with automatic lightweight compression.
   - Polaroid Scrapbook gallery feed.

7. **100% Mobile & Desktop Responsive**
   - Native mobile bottom navigation bar on phones.
   - Top tab bar on desktop and tablets.

---

## 🚀 How to Run Locally

1. Install dependencies (Node.js 18+ required):
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## ☁️ Setting Up Supabase for 2-Phone Real-Time Cloud Sync (Optional)

The app functions 100% out of the box in **Local Storage Mode**. If you want instant synchronization so both of you can log dates, expenses, and photos from separate phones:

1. Create a free project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in Supabase, copy the contents of `supabase_schema.sql`, and click **Run**.
3. Create a `.env.local` file in the root folder (or set Environment Variables in Vercel):
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Restart your app or redeploy — the app will automatically switch to **Cloud Sync** mode!

---

## 🌐 Deploying to Vercel

1. Push this folder to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite** (detected automatically).
5. (Optional) Add your Supabase environment variables if you configured them.
6. Click **Deploy**! Your app will be live with a free `.vercel.app` URL for Nekol! 💕
