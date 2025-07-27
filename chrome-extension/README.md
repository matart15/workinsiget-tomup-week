# WorkInsight Chrome Extension

A Chrome extension for collecting and analyzing browsing data to provide productivity insights.

## Features

- **User Authentication**: Sign up and login functionality
- **Data Collection**: Tracks browsing activity, time spent on sites, and user interactions
- **Privacy Controls**: Users can enable/disable data collection at any time
- **Secure Storage**: Data is encrypted and stored securely
- **S3 Integration**: Data is synced to S3 using presigned URLs
- **Privacy Policy & Terms**: Static pages for legal compliance

## Project Structure

```
chrome-extension/
├── manifest.json          # Extension manifest
├── background.ts          # Background service worker
├── content.ts            # Content script for data collection
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.ts              # Popup logic
├── privacy.html          # Privacy policy page
├── terms.html            # Terms & conditions page
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
├── icons/                # Extension icons
└── dist/                 # Compiled output
```

## Setup

1. **Install Dependencies**:
   ```bash
   cd chrome-extension
   npm install
   ```

2. **Build the Extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension/dist` folder

## Development

- **Watch Mode**: `npm run dev` - Builds and watches for changes
- **Clean Build**: `npm run clean && npm run build`

## Configuration

### API Endpoints

Update the following endpoints in the code:

1. **Authentication** (`popup.ts`):
   ```typescript
   // Replace with your actual endpoints
   const response = await fetch('https://your-api-endpoint.com/auth/login', {
   ```

2. **Presigned URL** (`background.ts`):
   ```typescript
   // Replace with your lambda function endpoint
   const response = await fetch('https://your-api-endpoint.com/presigned-url', {
   ```

### Icons

Place your extension icons in the `icons/` folder:
- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## Data Collection

The extension collects the following data:

- **URLs visited** and page titles
- **Time spent** on each page
- **User interactions** (clicks, scrolls, mouse movements)
- **Page visibility** changes
- **Tab switching** behavior

## Privacy & Security

- Data is collected only when the user is authenticated and has enabled data collection
- All data is encrypted during transmission
- Users can disable data collection at any time
- Data is stored locally until synced to S3
- No data is shared with third parties

## API Integration

### Authentication Flow

1. User enters credentials in popup
2. Extension calls your auth endpoint
3. User data is stored locally
4. Extension becomes active for data collection

### Data Sync Flow

1. Extension collects data locally
2. User clicks "Sync Data" or automatic sync triggers
3. Extension requests presigned URL from your lambda
4. Data is uploaded directly to S3
5. Local data is cleared after successful upload

## Legal Pages

The extension includes static pages for:
- **Privacy Policy** (`privacy.html`)
- **Terms & Conditions** (`terms.html`)

Update the contact information and company details in these files.

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check the manifest.json syntax
2. **TypeScript errors**: Run `npm install` to get Chrome types
3. **API errors**: Verify your endpoint URLs are correct
4. **Permission errors**: Check manifest.json permissions

### Debug Mode

Enable debug logging by adding to background.ts:
```typescript
const DEBUG = true;
if (DEBUG) {
  console.log('Debug message');
}
```

## Deployment

1. Build the extension: `npm run build`
2. Zip the `dist/` folder
3. Upload to Chrome Web Store or distribute manually

## Support

For issues or questions:
- Check the console for error messages
- Verify API endpoints are accessible
- Ensure all permissions are properly configured

## License

MIT License - see LICENSE file for details.
