# 🚀 MITHAS GLOW - Quick Start Guide

**Get your app running with Supabase in 15 minutes!**

---

## ⚡ Quick Setup (15 minutes)

### Step 1: Install Dependencies (2 min)

```bash
# Make sure you have all dependencies
npm install

# Specifically ensure Supabase is installed
npm install @supabase/supabase-js
npm install zustand
```

### Step 2: Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - Project name: `mithas-glow`
   - Database password: *Generate & save securely*
   - Region: `Mumbai` (or closest to you)
4. Wait 2-3 minutes for setup

### Step 3: Setup Database (3 min)

1. In Supabase Dashboard → **SQL Editor**
2. Click **"+ New query"**
3. Copy **ALL** contents from `/supabase/schema.sql`
4. Paste and click **"Run"**
5. Wait for "Success" message

### Step 4: Get API Keys (1 min)

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...`

### Step 5: Configure Environment (2 min)

1. Create `.env.local` file in project root:

```bash
# Create the file
touch .env.local
```

2. Add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ENV=development
```

3. **IMPORTANT:** Verify `.env.local` is in `.gitignore`

### Step 6: Start Development Server (1 min)

```bash
# Start the app
npm run dev
```

### Step 7: Test Connection (1 min)

1. Open browser: `http://localhost:5173`
2. Click **"Create Account"**
3. Fill in registration form
4. Submit
5. Check Supabase Dashboard → **Authentication** → **Users**
6. You should see your new user! ✅

---

## 🎯 What's Working Now

After Quick Start, you have:

✅ **Full Authentication:**
- Email/password registration
- Login with email
- Phone OTP login (if SMS configured)
- Session persistence
- Profile management

✅ **Database:**
- All 20+ tables created
- Row Level Security enabled
- Indexes optimized
- Triggers configured

✅ **Storage:**
- Ready for product images
- Ready for seller documents
- Ready for reels videos
- Ready for user avatars

---

## 🔧 Configuration Options

### Enable Phone OTP (Optional)

1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Phone**
3. Choose SMS provider (Twilio recommended)
4. Add credentials:
   ```
   Account SID: your_twilio_sid
   Auth Token: your_twilio_token
   Phone Number: +1XXXXXXXXXX
   ```

### Create Storage Buckets (Optional - for images)

Run this in Supabase SQL Editor:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('seller-documents', 'seller-documents', false),
  ('reels-videos', 'reels-videos', true),
  ('avatars', 'avatars', true);
```

Then add policies (see SUPABASE_SETUP_GUIDE.md)

---

## 📱 Test User Journeys

### Journey 1: New User Registration

```
1. Click "Create Account"
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: Password123!
   - Gender: Women
3. Submit
4. Check email for verification link (if enabled)
5. Complete profile setup
6. You're in! ✨
```

### Journey 2: Existing User Login

```
1. Click "Sign In"
2. Enter credentials
3. Submit
4. Welcome back! ✨
```

### Journey 3: Phone OTP (if configured)

```
1. Click "Sign in with Phone (OTP)"
2. Enter phone: +91 9876543210
3. Click "Send OTP"
4. Enter 6-digit OTP from SMS
5. Click "Verify & Continue"
6. You're in! ✨
```

---

## 🐛 Troubleshooting

### Issue: "Supabase credentials not found"
**Fix:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify it has content
cat .env.local

# Restart dev server
npm run dev
```

### Issue: "Invalid API key"
**Fix:**
- Go to Supabase → Settings → API
- Copy the **anon** key (not service_role)
- Update `.env.local`
- Restart server

### Issue: "relation does not exist"
**Fix:**
- Go to Supabase → SQL Editor
- Re-run `/supabase/schema.sql`
- Check for error messages

### Issue: Registration works but no profile created
**Fix:**
Check Supabase logs:
```
Dashboard → Logs → Database logs
```
Look for errors related to `profiles` table

### Issue: "Row Level Security policy violation"
**Fix:**
The RLS policies in schema.sql should handle this.
If issues persist, temporarily disable RLS for testing:
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```
(Re-enable for production!)

---

## 🎓 Learn More

### Documentation Files

- `SUPABASE_SETUP_GUIDE.md` - Complete setup guide
- `AUTHENTICATION_INTEGRATION.md` - Auth integration details
- `SELLER_PLATFORM_GUIDE.md` - Seller features
- `NEW_FEATURES_GUIDE.md` - Performance optimizations

### Supabase Resources

- [Supabase Docs](https://supabase.com/docs)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Database Guide](https://supabase.com/docs/guides/database)
- [Storage Guide](https://supabase.com/docs/guides/storage)

### Community

- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

## 🚀 Next Steps

Now that basic auth is working, you can:

### 1. Connect Shop to Database

```typescript
// /lib/hooks/useProducts.ts
export function useProducts() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);
  
  return { products };
}
```

### 2. Implement Cart Sync

```typescript
// /lib/hooks/useCart.ts
export function useCart() {
  const { user } = useAuth();
  
  const addToCart = async (productId, quantity) => {
    await supabase
      .from('cart')
      .insert({ user_id: user.id, product_id: productId, quantity });
  };
  
  return { addToCart };
}
```

### 3. Enable Real-time Chat

```typescript
// Subscribe to messages
const channel = supabase
  .channel('chat-messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('New message!', payload);
    }
  )
  .subscribe();
```

### 4. Add Product Upload

```typescript
// Upload product image
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`products/${file.name}`, file);

const publicUrl = supabase.storage
  .from('product-images')
  .getPublicUrl(data.path).data.publicUrl;
```

---

## ✅ Completion Checklist

- [ ] Supabase project created
- [ ] Database schema installed
- [ ] Environment variables configured
- [ ] `.env.local` in `.gitignore`
- [ ] Dev server running
- [ ] Test registration successful
- [ ] Test login successful
- [ ] User appears in Supabase dashboard
- [ ] Profile created in database
- [ ] Session persists on refresh

**All checked?** You're ready to build! 🎉

---

## 💡 Pro Tips

1. **Use Supabase Studio locally:**
   ```bash
   npx supabase start
   ```
   Access at: `http://localhost:54323`

2. **Enable Realtime for live features:**
   Dashboard → Database → Publications → Enable for tables

3. **Use Database Functions for complex logic:**
   ```sql
   CREATE FUNCTION get_trending_products()
   RETURNS TABLE(product_id uuid, score numeric) AS $$
     SELECT id, views * 0.3 + sales * 0.7 as score
     FROM products
     ORDER BY score DESC
     LIMIT 10;
   $$ LANGUAGE SQL;
   ```

4. **Monitor performance:**
   Dashboard → Reports → Database queries

5. **Set up automatic backups:**
   Settings → Database → Enable daily backups

---

## 🎯 Success Metrics

You'll know everything is working when:

1. ✅ Registration creates user + profile
2. ✅ Login works and persists
3. ✅ No console errors
4. ✅ Supabase dashboard shows activity
5. ✅ Session survives page refresh
6. ✅ Logout clears session

---

**Need help?** Check the troubleshooting section or the comprehensive guides in the docs folder.

**Ready to build more features?** See `AUTHENTICATION_INTEGRATION.md` for detailed component integration.

Happy coding! 🚀✨
