// Environment Configuration for Chrome Extension
// This file handles environment variables for the Chrome extension

// Method 1: Read from a config file (recommended for development)
const loadEnvFromFile = async (): Promise<Record<string, string>> => {
  try {
    // Try to load from a local env.json file (for development)
    const response = await fetch(chrome.runtime.getURL('env.json'));
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('No env.json file found, using defaults');
  }
  return {};
};

// Method 2: Read from Chrome storage (for production)
const loadEnvFromStorage = async (): Promise<Record<string, string>> => {
  try {
    const result = await chrome.storage.local.get(['env_config']);
    return result.env_config || {};
  } catch (error) {
    console.log('No env config in storage, using defaults');
    return {};
  }
};

// Method 3: Hardcoded defaults (fallback)
const getDefaultEnv = (): Record<string, string> => ({
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key',
  API_BASE_URL: 'https://your-api-gateway.amazonaws.com',
});

// Main function to get environment variables
export const getEnv = async (): Promise<Record<string, string>> => {
  // Try different sources in order of preference
  const sources = [
    loadEnvFromFile,
    loadEnvFromStorage,
    () => Promise.resolve(getDefaultEnv()),
  ];

  for (const source of sources) {
    try {
      const env = await source();
      if (env.SUPABASE_URL && !env.SUPABASE_URL.includes('your-')) {
        return env;
      }
    } catch (error) {
      console.log('Failed to load env from source:', error);
    }
  }

  return getDefaultEnv();
};

// Helper functions to get specific env vars
export const getSupabaseUrl = async (): Promise<string> => {
  const env = await getEnv();
  return env.SUPABASE_URL;
};

export const getSupabaseAnonKey = async (): Promise<string> => {
  const env = await getEnv();
  return env.SUPABASE_ANON_KEY;
};

export const getApiBaseUrl = async (): Promise<string> => {
  const env = await getEnv();
  return env.API_BASE_URL;
};

// Function to set environment variables in Chrome storage
export const setEnvInStorage = async (envConfig: Record<string, string>): Promise<void> => {
  try {
    await chrome.storage.local.set({ env_config: envConfig });
    console.log('Environment config saved to storage');
  } catch (error) {
    console.error('Failed to save env config:', error);
  }
};

// Function to validate environment configuration
export const validateEnv = async (): Promise<boolean> => {
  const env = await getEnv();
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'API_BASE_URL'];

  for (const key of required) {
    const value = env[key];
    if (!value || value.includes('your-') || value.includes('replace')) {
      console.error(`❌ Environment error: ${key} is not properly set`);
      return false;
    }
  }

  return true;
};
