# 🚀 MITHAS GLOW - Supabase Backend Setup Guide

**Status:** Ready for Integration  
**Estimated Setup Time:** 30-45 minutes  
**Date:** October 22, 2025

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Installation](#database-schema-installation)
4. [Storage Buckets Setup](#storage-buckets-setup)
5. [Authentication Configuration](#authentication-configuration)
6. [Environment Variables](#environment-variables)
7. [Testing the Connection](#testing-the-connection)
8. [Next Steps](#next-steps)

---

## ✅ Prerequisites

Before starting, ensure you have:

- [ ] A Supabase account ([sign up here](https://supabase.com))
- [ ] Node.js 18+ installed
- [ ] Git repository access
- [ ] Basic understanding of SQL

---

## 🎯 Supabase Project Setup

### Step 1: Create New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in details:
   - **Organization:** Your organization
   - **Project Name:** `mithas-glow` (or preferred name)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your target users (e.g., Mumbai for India)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project provisioning

### Step 2: Get API Credentials

1. Navigate to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
3. Keep these handy for later

---

## 🗄️ Database Schema Installation

### Method 1: SQL Editor (Recommended)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"+ New query"**
3. Copy the entire contents of `/supabase/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
6. Wait for execution to complete
7. You should see: **"Success. No rows returned"**

### Method 2: CLI (Alternative)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Verify Installation

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - ✅ profiles
   - ✅ addresses
   - ✅ sellers
   - ✅ products
   - ✅ product_variants
   - ✅ vendor_offers
   - ✅ orders
   - ✅ order_items
   - ✅ reviews
   - ✅ cart
   - ✅ wishlists
   - ✅ chats
   - ✅ messages
   - ✅ notifications
   - ✅ reels
   - ✅ reel_interactions
   - ✅ seller_milestones
   - ✅ promotions
   - ✅ wallet_transactions

---

## 📦 Storage Buckets Setup

### Create Required Buckets

1. Navigate to **Storage** in Supabase Dashboard
2. Create the following buckets:

#### Bucket 1: `product-images`
```
Name: product-images
Public: Yes
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

**Policy:**
```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

#### Bucket 2: `seller-documents`
```
Name: seller-documents
Public: No
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, application/pdf
```

**Policy:**
```sql
-- Only allow users to access their own documents
CREATE POLICY "Users can access own documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'seller-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Bucket 3: `reels-videos`
```
Name: reels-videos
Public: Yes
File size limit: 50 MB
Allowed MIME types: video/mp4, video/quicktime
```

**Policy:**
```sql
-- Public read, authenticated upload
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reels-videos');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reels-videos');
```

#### Bucket 4: `avatars`
```
Name: avatars
Public: Yes
File size limit: 2 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

**Policy:**
```sql
-- Public read, users can upload own avatar
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🔐 Authentication Configuration

### Enable Auth Providers

1. Go to **Authentication** → **Providers**
2. Enable the following:

#### Email (Already enabled by default)
- ✅ Enable Email provider
- ✅ Confirm email: **Enabled** (recommended)
- ✅ Secure email change: **Enabled**

#### Phone (for OTP login)
- ✅ Enable Phone provider
- Choose SMS provider:
  - **Twilio** (recommended for India)
  - OR **MessageBird**
  - OR **Vonage**
- Add your SMS provider credentials

**Twilio Setup:**
```
Account SID: your_twilio_account_sid
Auth Token: your_twilio_auth_token
Phone Number: +1XXXXXXXXXX
```

#### Social Providers (Optional)
- 🔵 Google OAuth (recommended)
- 📘 Facebook (optional)
- 🎵 TikTok (for creator integrations)

### Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize templates:

**Confirm Signup:**
```html
<h2>Welcome to MITHAS Glow! ✨</h2>
<p>Click the link below to verify your email:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
```

**Reset Password:**
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs:**
```
http://localhost:5173/*
http://localhost:5173/auth/callback
https://your-production-domain.com/*
https://your-production-domain.com/auth/callback
```

---

## 🔧 Environment Variables

### Step 1: Create .env.local

In your project root, create `.env.local`:

```bash
# Copy from .env.example
cp .env.example .env.local
```

### Step 2: Fill in Values

Edit `.env.local` with your Supabase credentials:

```env
# SUPABASE CONFIGURATION
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# APP CONFIGURATION
VITE_APP_ENV=development
VITE_APP_NAME="MITHAS Glow"
VITE_APP_URL=http://localhost:5173
```

### Step 3: Verify .gitignore

Ensure `.env.local` is in `.gitignore`:

```bash
# Environment variables
.env.local
.env*.local
.env.production
```

---

## 🧪 Testing the Connection

### Test 1: Manual Connection Test

Create a test file `/test-supabase.ts`:

```typescript
import { supabase } from './lib/supabase';

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database test failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test 2: Auth connection
    const { data: session } = await supabase.auth.getSession();
    console.log('✅ Auth connection successful!');
    
    // Test 3: Storage connection
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('✅ Storage connection successful!');
    console.log('📦 Buckets:', buckets?.map(b => b.name));
    
    console.log('🎉 All tests passed!');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

testConnection();
```

Run the test:
```bash
npx tsx test-supabase.ts
```

### Test 2: Sign Up Flow

1. Run your app: `npm run dev`
2. Go to registration page
3. Create a test account
4. Check Supabase Dashboard → **Authentication** → **Users**
5. Verify user appears
6. Check **Table Editor** → **profiles**
7. Verify profile was created

### Test 3: Database Insert

```typescript
// Test inserting a product
const testProduct = async () => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: 'Test Product',
      price: 999,
      category: 'Fashion',
      seller_id: 'your-seller-id',
      stock: 10,
    })
    .select()
    .single();
  
  console.log('Product created:', data);
};
```

---

## 🎯 Next Steps

### Phase 1: Core Authentication ✅
- [x] Supabase project created
- [x] Database schema installed
- [x] Storage buckets configured
- [x] Auth providers enabled
- [x] Environment variables set

### Phase 2: Integrate Auth into UI

1. **Update RegisterView.tsx:**
```typescript
import { useAuth } from '../lib/hooks/useAuth';

export function RegisterView() {
  const { signUp, isLoading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signUp(email, password, { full_name, gender });
    if (result.success) {
      // Navigate to profile setup
    }
  };
  
  // ...rest of component
}
```

2. **Update LoginView.tsx:**
```typescript
import { useAuth } from '../lib/hooks/useAuth';

export function LoginView() {
  const { signIn, isLoading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn(email, password);
    if (result.success) {
      // Navigate to home
    }
  };
  
  // ...rest of component
}
```

3. **Update OTPView.tsx:**
```typescript
import { useAuth } from '../lib/hooks/useAuth';

export function OTPView() {
  const { verifyOTP, isLoading } = useAuth();
  
  const handleVerify = async () => {
    const result = await verifyOTP(phone, otp);
    if (result.success) {
      // Navigate to home or profile setup
    }
  };
  
  // ...rest of component
}
```

### Phase 3: Product Management

1. Create `useProducts` hook implementation
2. Connect shop to real products
3. Implement cart sync with database
4. Add order creation flow

### Phase 4: Seller Integration

1. Connect seller registration to database
2. Implement product CRUD operations
3. Add order management
4. Enable wallet transactions

### Phase 5: Real-time Features

1. Implement chat with real-time subscriptions
2. Add notification subscriptions
3. Enable order status updates
4. Live product views counter

---

## 🐛 Troubleshooting

### Issue: "Invalid API key"
**Solution:** 
- Check that you copied the **anon** key, not the **service_role** key
- Verify no extra spaces in `.env.local`
- Restart dev server after changing env vars

### Issue: "relation does not exist"
**Solution:**
- Ensure schema.sql ran successfully
- Check SQL Editor for errors
- Verify you're connected to the correct project

### Issue: "Row Level Security policy violation"
**Solution:**
- Check RLS policies in schema.sql
- Verify user is authenticated
- Check policy conditions match your use case

### Issue: "Storage bucket not found"
**Solution:**
- Create bucket via Storage UI
- Verify bucket name matches code
- Check bucket permissions

---

## 📚 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

## 🔒 Security Checklist

- [ ] Environment variables not committed to git
- [ ] RLS policies enabled on all tables
- [ ] Storage policies configured properly
- [ ] Email verification enabled
- [ ] Strong database password set
- [ ] API keys kept secret
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly

---

## 💡 Pro Tips

1. **Use Supabase Studio locally:**
   ```bash
   supabase start
   # Access at: http://localhost:54323
   ```

2. **Enable Database Webhooks:**
   - Trigger external actions on database changes
   - Useful for notifications, analytics

3. **Set up Database Backups:**
   - Go to Settings → Database → Backups
   - Enable daily backups

4. **Monitor Usage:**
   - Check Dashboard → Reports
   - Watch for quota limits
   - Upgrade plan if needed

5. **Use Database Functions:**
   - Create reusable SQL functions
   - Improves performance
   - Reduces client-side logic

---

## 🎉 Success Criteria

You've successfully set up Supabase when:

- ✅ All database tables created
- ✅ Storage buckets configured
- ✅ Auth providers enabled
- ✅ Test user can register
- ✅ Test user can login
- ✅ Profile data syncs
- ✅ No console errors
- ✅ RLS policies working

---

**Ready to integrate? Proceed to updating your React components to use the Supabase backend!**

**Next Guide:** `AUTHENTICATION_INTEGRATION.md` (coming next)
