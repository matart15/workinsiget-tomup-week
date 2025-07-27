import { createClient } from '@supabase/supabase-js';

import { getSupabaseAnonKey, getSupabaseUrl } from './env';

// Create Supabase client for Chrome extension
let supabase: any = null;

// Initialize Supabase client with environment variables
const initializeSupabase = async () => {
  if (supabase) {
    return supabase;
  }

  const url = await getSupabaseUrl();
  const anonKey = await getSupabaseAnonKey();

  supabase = createClient(url, anonKey, {
    auth: {
      // Use localStorage for Chrome extension
      storage: {
        getItem: (key: string) => {
          return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
              resolve(result[key] || null);
            });
          });
        },
        setItem: (key: string, value: string) => {
          return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, resolve);
          });
        },
        removeItem: (key: string) => {
          return new Promise((resolve) => {
            chrome.storage.local.remove([key], resolve);
          });
        },
      },
      // Auto refresh tokens
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabase;
};

// Export a function to get the Supabase client
export const getSupabase = async () => {
  return await initializeSupabase();
};

// Helper function to get user profile data
export const getUserProfile = async (userId: string) => {
  try {
    const supabaseClient = await getSupabase();
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// Helper function to create user profile
export const createUserProfile = async (userId: string, email: string, name?: string) => {
  try {
    const supabaseClient = await getSupabase();
    const { data, error } = await supabaseClient
      .from('users')
      .insert([
        {
          id: userId,
          email,
          name: name || email.split('@')[0], // Use email prefix as default name
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};
