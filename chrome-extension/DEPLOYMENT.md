# Chrome Extension Deployment Guide

## Prerequisites

1. **Chrome Browser**: Latest version
2. **Node.js**: Version 18 or higher
3. **npm**: Package manager
4. **TypeScript**: For compilation

## Local Development Setup

### 1. Install Dependencies

```bash
cd chrome-extension
npm install
```

### 2. Build the Extension

```bash
npm run build
```

### 3. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension/dist` folder
5. The extension should now appear in your extensions list

### 4. Test the Extension

1. Click the extension icon in the toolbar
2. You should see the login/signup form
3. Use test credentials:
   - Email: `test@workinsight.com`
   - Password: `password123`

## Production Deployment

### 1. Update API Endpoints

Before deploying, update the API endpoints in your code:

**In `popup.ts`:**
```typescript
// Replace with your actual authentication endpoints
const response = await fetch('https://your-api-endpoint.com/auth/login', {
```

**In `background.ts`:**
```typescript
// Replace with your lambda function endpoint
const response = await fetch('https://your-api-endpoint.com/presigned-url', {
```

### 2. Add Extension Icons

Create and add your extension icons to the `icons/` folder:
- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

### 3. Update Legal Pages

Edit `privacy.html` and `terms.html` with your company information:
- Company name and address
- Contact email addresses
- Legal jurisdiction

### 4. Build for Production

```bash
npm run build
```

### 5. Chrome Web Store Deployment

1. **Create Developer Account**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay the one-time $5 registration fee

2. **Package Extension**:
   ```bash
   cd chrome-extension/dist
   zip -r ../workinsight-extension.zip .
   ```

3. **Upload to Store**:
   - Upload the ZIP file
   - Fill in store listing details
   - Add screenshots and descriptions
   - Submit for review

### 6. Manual Distribution

For internal or limited distribution:

1. **Build the extension**:
   ```bash
   npm run build
   ```

2. **Share the `dist/` folder**:
   - Users can load it as an unpacked extension
   - Or you can create a simple installer script

## Configuration Options

### Environment Variables

Create a `.env` file for different environments:

```bash
# Development
API_BASE_URL=https://dev-api.workinsight.com
S3_BUCKET=workinsight-dev-data

# Production
API_BASE_URL=https://api.workinsight.com
S3_BUCKET=workinsight-prod-data
```

### Feature Flags

Add feature flags in `manifest.json`:

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "tabs"
  ],
  "optional_permissions": [
    "scripting"
  ]
}
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Authentication flow works
- [ ] Data collection is active when enabled
- [ ] Data syncs to S3 correctly
- [ ] Privacy policy and terms pages load
- [ ] Extension works across different websites
- [ ] No console errors in background or content scripts

## Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Check `manifest.json` syntax
   - Verify all required files are in `dist/`
   - Check Chrome console for errors

2. **TypeScript compilation errors**:
   ```bash
   npm install
   npx tsc --noEmit
   ```

3. **API connection issues**:
   - Verify endpoint URLs are correct
   - Check CORS settings on your API
   - Test endpoints with curl or Postman

4. **Permission errors**:
   - Review `manifest.json` permissions
   - Check if permissions are being requested correctly

### Debug Mode

Enable debug logging by adding to your TypeScript files:

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('Debug message');
}
```

## Security Considerations

1. **API Security**:
   - Use HTTPS for all API calls
   - Implement proper authentication
   - Validate all user inputs

2. **Data Privacy**:
   - Encrypt sensitive data
   - Implement data retention policies
   - Provide user data export/deletion

3. **Extension Security**:
   - Minimize permissions requested
   - Validate all external data
   - Keep dependencies updated

## Performance Optimization

1. **Bundle Size**:
   - Use tree shaking
   - Minimize dependencies
   - Compress assets

2. **Memory Usage**:
   - Clean up event listeners
   - Limit data storage
   - Implement garbage collection

3. **Network Requests**:
   - Batch API calls
   - Implement retry logic
   - Use caching where appropriate

## Monitoring and Analytics

1. **Error Tracking**:
   - Implement error logging
   - Monitor extension crashes
   - Track user feedback

2. **Usage Analytics**:
   - Track feature usage
   - Monitor performance metrics
   - Analyze user behavior

## Support and Maintenance

1. **User Support**:
   - Create documentation
   - Set up support channels
   - Monitor user feedback

2. **Updates**:
   - Plan regular updates
   - Test compatibility
   - Maintain changelog

3. **Backup and Recovery**:
   - Backup user data
   - Implement recovery procedures
   - Test disaster recovery
