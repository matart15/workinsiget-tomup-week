# Environment Setup for Chrome Extension

## 🚀 Quick Setup

### Option 1: Automatic Setup (Recommended)

The extension can automatically read your existing environment variables:

```bash
cd chrome-extension
npm run setup
```

This script will:
1. Look for existing `.env` files in your project
2. Extract Supabase configuration
3. Create `env.json` for the Chrome extension

### Option 2: Manual Setup

Create `chrome-extension/env.json`:

```json
{
  "SUPABASE_URL": "https://your-project-id.supabase.co",
  "SUPABASE_ANON_KEY": "your-supabase-anon-key",
  "API_BASE_URL": "https://your-api-gateway-url.amazonaws.com"
}
```

## 🔧 How Environment Variables Work

### Chrome Extension Limitations

Chrome extensions can't directly access `.env` files due to security restrictions. Instead, we use:

1. **`env.json` file** - For development (loaded at runtime)
2. **Chrome storage** - For production (set via extension settings)
3. **Hardcoded defaults** - Fallback values

### Environment Loading Priority

The extension loads environment variables in this order:

1. **`env.json` file** (development)
2. **Chrome storage** (production)
3. **Hardcoded defaults** (fallback)

## 📁 File Structure

```
chrome-extension/
├── env.ts              # Environment loading logic
├── env.json            # Environment variables (created by setup)
├── env.json.example    # Example configuration
├── setup-env.js        # Setup script
└── ...
```

## 🔍 Finding Your Supabase Credentials

### From Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### From Your Existing Project

If you have a `.env` file in your main project:

```bash
# The setup script will automatically find these variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=https://your-api-gateway.amazonaws.com
```

## 🛠️ Setup Commands

### Development Setup

```bash
# 1. Run setup script
npm run setup

# 2. Install dependencies
npm install

# 3. Build extension
npm run build

# 4. Load in Chrome
# Go to chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked"
# Select chrome-extension/dist folder
```

### Production Setup

For production, you can set environment variables in Chrome storage:

```javascript
// In Chrome DevTools console (extension context)
chrome.storage.local.set({
  env_config: {
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key',
    API_BASE_URL: 'https://your-api-gateway.amazonaws.com'
  }
});
```

## 🔒 Security Considerations

### Development

- `env.json` is included in the extension bundle
- **Don't commit real credentials** to git
- Add `env.json` to `.gitignore`

### Production

- Use Chrome storage for sensitive data
- Consider using a secure configuration service
- Rotate keys regularly

## 🧪 Testing Environment Setup

### Check Configuration

Open Chrome DevTools in the extension popup:

```javascript
// Check if environment is loaded
import { validateEnv } from './env';

validateEnv().then(isValid => console.log('Config valid:', isValid));
```

### Debug Environment Loading

```javascript
// Check what environment variables are loaded
import { getEnv } from './env';

getEnv().then(env => console.log('Environment:', env));
```

## 🔧 Troubleshooting

### Common Issues

1. **"Configuration error"**
   - Run `npm run setup` to create `env.json`
   - Check that Supabase URL and key are correct

2. **"No env.json file found"**
   - Create `env.json` manually or run setup script
   - Ensure file is in `chrome-extension/` directory

3. **"Authentication failed"**
   - Verify Supabase credentials in `env.json`
   - Check if user exists in your Supabase auth

4. **"Extension not loading"**
   - Check `manifest.json` includes `env.json`
   - Verify all files are in `dist/` folder

### Debug Steps

1. **Check env.json exists**:
   ```bash
   ls -la chrome-extension/env.json
   ```

2. **Validate configuration**:
   ```bash
   node -e "console.log(require('./env.json'))"
   ```

3. **Check Chrome storage**:
   ```javascript
   chrome.storage.local.get(['env_config'], console.log);
   ```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `API_BASE_URL` | Your Lambda function URL | `https://your-api-gateway.amazonaws.com` |

## 🔄 Updating Environment Variables

### Development

Edit `chrome-extension/env.json` and rebuild:

```bash
npm run build
```

### Production

Update Chrome storage:

```javascript
chrome.storage.local.set({
  env_config: {
    // Updated values
  }
});
```

## 📚 Related Files

- `env.ts` - Environment loading logic
- `setup-env.js` - Setup script
- `config.ts` - Legacy configuration (deprecated)
- `supabase.ts` - Supabase client initialization
- `popup.ts` - Authentication logic
- `background.ts` - API calls

## 🆘 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify env.json** exists and is valid JSON
3. **Test Supabase connection** directly
4. **Review this guide** again

For additional help, check the main README.md file.
