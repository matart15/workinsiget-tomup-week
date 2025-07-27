// Chrome Extension Configuration
// Update these values with your actual Supabase project details

export const CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: 'https://your-project.supabase.co', // Replace with your Supabase URL
  SUPABASE_ANON_KEY: 'your-anon-key-here', // Replace with your Supabase anon key

  // API Endpoints (for S3 presigned URLs)
  API_BASE_URL: 'https://your-api-gateway-url.amazonaws.com', // Replace with your Lambda function URL

  // Extension Settings
  EXTENSION_NAME: 'WorkInsight Data Collector',
  VERSION: '1.0.0',

  // Data Collection Settings
  COLLECTION_INTERVAL: 5000, // 5 seconds
  SYNC_INTERVAL: 300000, // 5 minutes

  // Privacy Settings
  MAX_LOCAL_STORAGE: 1000, // Maximum data points to store locally
  AUTO_SYNC_ENABLED: true,

  // Debug Settings
  DEBUG_MODE: false,
};

// Helper function to get Supabase URL
export const getSupabaseUrl = (): string => {
  return CONFIG.SUPABASE_URL;
};

// Helper function to get Supabase anon key
export const getSupabaseAnonKey = (): string => {
  return CONFIG.SUPABASE_ANON_KEY;
};

// Helper function to get API base URL
export const getApiBaseUrl = (): string => {
  return CONFIG.API_BASE_URL;
};

// Validation function to check if config is properly set
export const validateConfig = (): boolean => {
  const requiredFields = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'API_BASE_URL',
  ];

  for (const field of requiredFields) {
    const value = CONFIG[field as keyof typeof CONFIG];
    if (!value || (typeof value === 'string' && (value.includes('your-') || value.includes('replace')))) {
      console.error(`❌ Configuration error: ${field} is not properly set`);
      return false;
    }
  }

  return true;
};
