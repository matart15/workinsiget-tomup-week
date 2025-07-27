# Firebase Hosting Setup with GitHub CI/CD

## Prerequisites

1. Firebase project created
2. GitHub repository with staging branch
3. Firebase CLI installed locally

## Setup Steps

### 1. Firebase Project Configuration

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Hosting in your Firebase project
3. Get your Firebase project ID

### 2. Update Configuration Files

1. **Update `.firebaserc`**:
   ```json
   {
     "projects": {
       "default": "your-actual-firebase-project-id"
     }
   }
   ```

2. **Update `firebase.json`** (already configured):
   - Points to `dist` folder (Vite build output)
   - Includes SPA routing configuration
   - Adds caching headers for static assets

### 3. GitHub Secrets Setup

Add these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

#### Required Secrets:
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON (see below)

#### Environment Variables (if needed):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 4. Firebase Service Account Setup

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content
5. Add it as `FIREBASE_SERVICE_ACCOUNT` secret in GitHub

### 5. Local Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# Test deployment locally
pnpm build
firebase deploy --only hosting
```

## How It Works

1. **Trigger**: Push to `staging` branch
2. **Build**: GitHub Actions runs `pnpm build`
3. **Deploy**: Automatically deploys to Firebase Hosting
4. **Result**: Your app is live at `https://your-project-id.web.app`

## Manual Deployment

```bash
# Build the project
pnpm build

# Deploy to Firebase
firebase deploy --only hosting
```

## Troubleshooting

### Common Issues:

1. **Build fails**: Check if all environment variables are set in GitHub secrets
2. **Deploy fails**: Verify Firebase service account JSON is correct
3. **404 errors**: Ensure SPA routing is configured in `firebase.json`

### Debug Commands:

```bash
# Test build locally
pnpm build

# Preview build
pnpm preview

# Check Firebase configuration
firebase projects:list
firebase use --add
```

## Environment Variables

Make sure all required environment variables are set in GitHub secrets if your app needs them for building.
