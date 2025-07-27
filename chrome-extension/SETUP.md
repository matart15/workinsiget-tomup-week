# Chrome Extension Setup Guide

## 🚀 Quick Setup

### 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon public key**

### 2. Update Configuration

Edit `chrome-extension/config.ts`:

```typescript
export const CONFIG = {
  // Replace with your actual Supabase details
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-actual-anon-key',

  // Replace with your Lambda function URL
  API_BASE_URL: 'https://your-api-gateway-url.amazonaws.com',

  // ... rest of config
};
```

### 3. Install Dependencies

```bash
cd chrome-extension
npm install
```

### 4. Build Extension

```bash
npm run build
```

### 5. Load in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `chrome-extension/dist` folder

## 🔧 Configuration Details

### Supabase Setup

Your Supabase project should have:

1. **Authentication enabled** (default)
2. **Users table** with this structure:
   ```sql
   CREATE TABLE users (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT NOT NULL,
     name TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Row Level Security (RLS)** policies:
   ```sql
   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   -- Users can read their own profile
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);

   -- Users can update their own profile
   CREATE POLICY "Users can update own profile" ON users
     FOR UPDATE USING (auth.uid() = id);
   ```

### Lambda Function Setup

Your Lambda function should:

1. **Accept POST requests** to `/presigned-url`
2. **Return presigned URLs** for S3 uploads
3. **Validate user authentication** (using Supabase JWT)

Example Lambda response:
```json
{
  "presignedUrl": "https://your-bucket.s3.amazonaws.com/...",
  "filename": "data_1234567890.json"
}
```

## 🧪 Testing

### Test Authentication

1. **Load the extension** in Chrome
2. **Click the extension icon**
3. **Try logging in** with existing credentials
4. **Check console** for any errors

### Test Data Collection

1. **Login to the extension**
2. **Enable data collection** (toggle switch)
3. **Browse some websites**
4. **Click "Sync Data"** to test S3 upload

### Debug Mode

Enable debug logging by editing `config.ts`:

```typescript
export const CONFIG = {
  // ... other config
  DEBUG_MODE: true, // Enable debug logging
};
```

## 🔍 Troubleshooting

### Common Issues

1. **"Configuration error"**
   - Check that you've updated `config.ts` with real values
   - Make sure Supabase URL and key are correct

2. **"Authentication failed"**
   - Verify Supabase credentials
   - Check if user exists in your Supabase auth
   - Ensure users table exists and has correct structure

3. **"Sync failed"**
   - Check Lambda function URL
   - Verify Lambda function is working
   - Check S3 bucket permissions

4. **Extension not loading**
   - Check `manifest.json` syntax
   - Verify all files are in `dist/` folder
   - Check Chrome console for errors

### Debug Steps

1. **Check Chrome DevTools**:
   - Right-click extension icon → "Inspect popup"
   - Check Console tab for errors

2. **Check Background Script**:
   - Go to `chrome://extensions/`
   - Click "service worker" link for your extension
   - Check console for background script errors

3. **Check Supabase**:
   - Go to Supabase Dashboard → Authentication → Users
   - Verify user exists and is confirmed

4. **Check Lambda**:
   - Test your Lambda function directly
   - Check CloudWatch logs for errors

## 📝 Environment Variables (Optional)

Instead of hardcoding values, you can use environment variables:

1. **Create `.env` file**:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   API_BASE_URL=https://your-api-gateway.amazonaws.com
   ```

2. **Update config.ts** to read from environment:
   ```typescript
   export const CONFIG = {
     SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
     SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
     // ... rest
   };
   ```

## 🔒 Security Notes

1. **Never commit real credentials** to git
2. **Use environment variables** for production
3. **Enable RLS** on your Supabase tables
4. **Validate user permissions** in Lambda functions
5. **Use HTTPS** for all API calls

## 📦 Production Deployment

1. **Update all configuration** with production values
2. **Test thoroughly** with real data
3. **Build extension**: `npm run build`
4. **Package for Chrome Web Store** or distribute manually

## 🆘 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify configuration** is correct
3. **Test Supabase connection** directly
4. **Check Lambda function** logs
5. **Review this setup guide** again

For additional help, check the main README.md file.
