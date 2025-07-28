// Environment Configuration for Chrome Extension
// Clean, refactored version

// Method 1: Read from a config file (recommended for development)
const loadEnvFromFile = async () => {
  try {
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
const loadEnvFromStorage = async () => {
  try {
    const result = await chrome.storage.local.get(['env_config']);
    return result.env_config || {};
  } catch (error) {
    console.log('No env config in storage, using defaults');
    return {};
  }
};

// Method 3: Hardcoded defaults (fallback)
const getDefaultEnv = () => ({});

// Main function to get environment variables
const getEnv = async () => {
  // Try different sources in order of preference
  const sources = [
    loadEnvFromFile,
    loadEnvFromStorage,
    () => Promise.resolve(getDefaultEnv()),
  ];

  for (const source of sources) {
    try {
      const env = await source();
      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        return env;
      }
    } catch (error) {
      console.log('Failed to load env from source:', error);
    }
  }

  throw new Error('No valid environment configuration found. Please set up env.json or configure via storage.');
};

// Helper functions to get specific env vars
const getSupabaseUrl = async () => {
  const env = await getEnv();
  return env.SUPABASE_URL;
};

const getSupabaseAnonKey = async () => {
  const env = await getEnv();
  return env.SUPABASE_ANON_KEY;
};

// Function to set environment variables in Chrome storage
const setEnvInStorage = async (envConfig) => {
  try {
    await chrome.storage.local.set({ env_config: envConfig });
    console.log('Environment config saved to storage');
  } catch (error) {
    console.error('Failed to save env config:', error);
  }
};

// Function to validate environment configuration
const validateEnv = async () => {
  try {
    const env = await getEnv();
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

    for (const key of required) {
      if (!env[key]) {
        console.error(`❌ Environment error: ${key} is not set`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    return false;
  }
};

// Make functions available globally for Chrome extension
window.EnvConfig = {
  getEnv,
  getSupabaseUrl,
  getSupabaseAnonKey,
  setEnvInStorage,
  validateEnv,
};
