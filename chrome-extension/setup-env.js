#!/usr/bin/env node

/**
 * Environment Setup Script for Chrome Extension
 * This script helps you set up environment variables for the Chrome extension
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('🔧 Chrome Extension Environment Setup');
console.log('=====================================\n');

// Function to read user input
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = query => new Promise(resolve => rl.question(query, resolve));

async function setupEnvironment() {
  try {
    console.log('Please provide your Supabase and API configuration:\n');

    // Get Supabase URL
    const supabaseUrl = await question('Enter your Supabase URL (e.g., https://your-project.supabase.co): ');

    // Get Supabase anon key
    const supabaseAnonKey = await question('Enter your Supabase anon key: ');

    // Get API base URL
    const apiBaseUrl = await question('Enter your API base URL (e.g., https://your-api-gateway.amazonaws.com): ');

    // Validate inputs
    if (!supabaseUrl || !supabaseAnonKey || !apiBaseUrl) {
      console.log('\n❌ Error: All fields are required!');
      rl.close();
      return;
    }

    // Create env.json file
    const envConfig = {
      SUPABASE_URL: supabaseUrl.trim(),
      SUPABASE_ANON_KEY: supabaseAnonKey.trim(),
      API_BASE_URL: apiBaseUrl.trim(),
    };

    const envPath = path.join(__dirname, 'env.json');
    fs.writeFileSync(envPath, JSON.stringify(envConfig, null, 2));

    console.log('\n✅ Environment configuration saved to env.json');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Supabase URL: ${supabaseUrl}`);
    console.log(`   API Base URL: ${apiBaseUrl}`);
    console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);

    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run build');
    console.log('3. Load the extension in Chrome');
    console.log('4. Test authentication with your Supabase users');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Function to copy from existing .env file
async function copyFromExistingEnv() {
  const possibleEnvFiles = [
    '../.env',
    '../.env.local',
    '../.env.development',
    '../supabase/.env',
    '../supabase/.env.local',
  ];

  for (const envFile of possibleEnvFiles) {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
      console.log(`📁 Found existing environment file: ${envFile}`);

      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};

      // Parse .env file
      envContent.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });

      // Extract relevant variables
      const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
      const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;
      const apiBaseUrl = envVars.API_BASE_URL || envVars.LAMBDA_URL;

      if (supabaseUrl && supabaseAnonKey) {
        console.log('✅ Found Supabase configuration in existing .env file');

        const envConfig = {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_ANON_KEY: supabaseAnonKey,
          API_BASE_URL: apiBaseUrl || 'https://your-api-gateway.amazonaws.com',
        };

        const envPath = path.join(__dirname, 'env.json');
        fs.writeFileSync(envPath, JSON.stringify(envConfig, null, 2));

        console.log('✅ Environment configuration copied to env.json');
        console.log('\n📋 Configuration Summary:');
        console.log(`   Supabase URL: ${supabaseUrl}`);
        console.log(`   API Base URL: ${envConfig.API_BASE_URL}`);
        console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);

        console.log('\n🚀 Next steps:');
        console.log('1. Run: npm install');
        console.log('2. Run: npm run build');
        console.log('3. Load the extension in Chrome');
        console.log('4. Test authentication with your Supabase users');

        return true;
      }
    }
  }

  return false;
}

// Main execution
async function main() {
  console.log('🔧 Chrome Extension Environment Setup');
  console.log('=====================================\n');

  // Try to copy from existing .env file first
  const copied = await copyFromExistingEnv();

  if (!copied) {
    console.log('No existing environment configuration found.');
    console.log('Please provide your configuration manually:\n');
    await setupEnvironment();
  }
}

main().catch(console.error);
