# 🚀 K3HOOT Phase 1 Deployment Guide

## Quick Start (3 Steps)

### **Step 1: Install Dependencies**
```bash
cd k3hootxyz
yarn add uuid @types/uuid
```

---

### **Step 2: Apply Database Migration**

#### Option A: Supabase CLI (Recommended)
```bash
supabase db push
```

#### Option B: Supabase Dashboard
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Copy entire content from: `supabase/migrations/20251222150000_add_quiz_sets.sql`
4. Paste and click "Run"

**Verify Success**:
```sql
SELECT COUNT(*) FROM quiz_sets;
-- Should return 0 (table exists but empty)
```

---

### **Step 3: Start Development Server**
```bash
yarn dev
```

Visit: http://localhost:3000/play

---

## Test Your Implementation

### Create Your First Quiz
1. Visit: http://localhost:3000/create-quiz
2. Connect your Solana wallet
3. Fill in quiz details:
   - Title: "Solana Basics"
   - Reward: 0.1 SOL
   - Add 3 questions
4. Click "Create Quiz Set"

### Host a Game
1. Go to: http://localhost:3000/play
2. Click "My Quiz Sets" tab
3. Find your quiz
4. Click "Host Game"

---

## Production Deployment

### Build & Deploy
```bash
# Test build
yarn build

# Deploy to Vercel
vercel deploy --prod
```

---

## Environment Variables

Make sure these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## Troubleshooting

### "Cannot find module 'uuid'"
```bash
yarn add uuid @types/uuid
```

### "relation quiz_sets does not exist"
Migration not applied. Run Step 2 again.

### "Build failed with TypeScript errors"
```bash
yarn build 2>&1 | grep error
# Fix reported errors
```

---

## What's Included

✅ **Quiz Set Creation** - Multi-question quizzes (3-20 questions)
✅ **Owner-Only Hosting** - Enforced by database RLS
✅ **Claim Recovery** - Persistent reward tracking
✅ **Polished UI** - Smooth animations, no footer overlap

---

## Next Steps

1. **Test locally** - Create a quiz and host a game
2. **Deploy to production** - Use Vercel or your preferred host
3. **Phase 2** (optional) - Quiz management, analytics
4. **Phase 3** (optional) - Arcium MPC integration

---

**Need help?** Check [test-phase1.md](../test-phase1.md) for detailed testing guide.
