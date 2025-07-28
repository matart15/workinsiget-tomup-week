// Chrome Extension Popup Controller
// Clean, refactored version using official Supabase client

// Initialize Supabase client
let supabase = null;

const initializeSupabase = async () => {
  if (supabase) {
    return supabase;
  }

  const url = await window.EnvConfig.getSupabaseUrl();
  const anonKey = await window.EnvConfig.getSupabaseAnonKey();

  // Create Supabase client with Chrome extension storage
  supabase = window.supabase.createClient(url, anonKey, {
    auth: {
      storage: {
        getItem: (key) => {
          return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
              resolve(result[key] || null);
            });
          });
        },
        setItem: (key, value) => {
          return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, resolve);
          });
        },
        removeItem: (key) => {
          return new Promise((resolve) => {
            chrome.storage.local.remove([key], resolve);
          });
        },
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabase;
};

const getSupabase = async () => {
  return await initializeSupabase();
};

// Helper functions
const getUserProfile = async (userId) => {
  try {
    const supabaseClient = await getSupabase();
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
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

const createUserProfile = async (userId, email, name) => {
  try {
    const supabaseClient = await getSupabase();
    const { data, error } = await supabaseClient
      .from('profiles')
      .insert([
        {
          user_id: userId,
          email,
          full_name: name || email.split('@')[0],
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

class PopupController {
  constructor() {
    this.userData = null;
    this.isActive = false;
    this.initialize();
  }

  async initialize() {
    await this.loadUserData();
    await this.loadActiveState();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadUserData() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_USER_DATA' });
      this.userData = response.userData;
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  async loadActiveState() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_STATE' });
      this.isActive = response.isActive;
    } catch (error) {
      console.error('Failed to load active state:', error);
    }
  }

  setupEventListeners() {
    // Auth form events
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');

    loginForm?.addEventListener('submit', this.handleLogin.bind(this));
    signupForm?.addEventListener('submit', this.handleSignup.bind(this));

    // Form switching
    document.getElementById('showSignup')?.addEventListener('click', this.showSignupForm.bind(this));
    document.getElementById('showLogin')?.addEventListener('click', this.showLoginForm.bind(this));

    // Main section events
    document.getElementById('logoutBtn')?.addEventListener('click', this.handleLogout.bind(this));
    document.getElementById('activeToggle')?.addEventListener('change', this.handleToggleChange.bind(this));
    document.getElementById('syncBtn')?.addEventListener('click', this.handleSync.bind(this));

    // Footer links
    document.getElementById('privacyLink')?.addEventListener('click', this.openPrivacyPolicy.bind(this));
    document.getElementById('termsLink')?.addEventListener('click', this.openTermsConditions.bind(this));
  }

  async handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    try {
      this.setLoading(true);
      console.log('🚀 ~ handleLogin:');
      const response = await this.authenticateUser(email, password);
      console.log('🚀 ~ response:', response);

      if (response.success && response.user) {
        this.userData = response.user;
        console.log('🚀 ~ Login successful, userData:', this.userData);
        console.log('🚀 ~ accessToken:', this.userData.accessToken);
        await chrome.runtime.sendMessage({
          type: 'SET_USER_DATA',
          data: this.userData,
        });
        this.updateUI();
        this.showSuccess('Login successful!');
      } else {
        this.showError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Login failed. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  async handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.querySelector('#signupName').value;
    const email = form.querySelector('#signupEmail').value;
    const password = form.querySelector('#signupPassword').value;
    const confirmPassword = form.querySelector('#signupConfirmPassword').value;

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    try {
      this.setLoading(true);
      const response = await this.registerUser(name, email, password);

      if (response.success && response.user) {
        this.userData = response.user;
        console.log('🚀 ~ Registration successful, userData:', this.userData);
        console.log('🚀 ~ accessToken:', this.userData.accessToken);
        await chrome.runtime.sendMessage({
          type: 'SET_USER_DATA',
          data: this.userData,
        });
        this.updateUI();
        this.showSuccess('Account created successfully!');
      } else {
        this.showError(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showError('Registration failed. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  async handleLogout() {
    try {
      const supabaseClient = await getSupabase();
      await supabaseClient.auth.signOut();

      this.userData = null;
      this.isActive = false;

      await chrome.runtime.sendMessage({ type: 'SET_USER_DATA', data: null });
      await chrome.runtime.sendMessage({ type: 'SET_ACTIVE_STATE', isActive: false });

      this.updateUI();
      this.showSuccess('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      this.showError('Logout failed');
    }
  }

  async handleToggleChange(event) {
    const checkbox = event.target;
    this.isActive = checkbox.checked;

    await chrome.runtime.sendMessage({
      type: 'SET_ACTIVE_STATE',
      isActive: this.isActive,
    });

    this.updateStatusIndicator();
  }

  async handleSync() {
    try {
      this.setSyncLoading(true);
      await chrome.runtime.sendMessage({ type: 'SYNC_DATA' });
      this.showSuccess('Data synced successfully!');
      this.updateLastSync();
    } catch (error) {
      this.showError('Failed to sync data');
    } finally {
      this.setSyncLoading(false);
    }
  }

  showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
  }

  showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
  }

  openPrivacyPolicy() {
    chrome.tabs.create({ url: chrome.runtime.getURL('privacy.html') });
  }

  openTermsConditions() {
    chrome.tabs.create({ url: chrome.runtime.getURL('terms.html') });
  }

  async authenticateUser(email, password) {
    try {
      const supabaseClient = await getSupabase();
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      console.log(`🚀 ~ { data, error }:`, { data, error });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'No user data received',
        };
      }

      // Get user profile from database
      const profile = await getUserProfile(data.user.id);

      return {
        success: true,
        user: {
          userId: profile?.id || data.user.id, // Use profile.id as userId for activity logs
          email: data.user.email || email,
          name: profile?.full_name || data.user.email?.split('@')[0] || 'User',
          isAuthenticated: true,
          accessToken: data.session?.access_token, // Add access token from session
          lastSync: Date.now(),
        },
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  async registerUser(name, email, password) {
    try {
      const supabaseClient = await getSupabase();
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'No user data received',
        };
      }

      // Create user profile in database
      const profile = await createUserProfile(data.user.id, email, name);

      return {
        success: true,
        user: {
          userId: profile?.id || data.user.id, // Use profile.id as userId for activity logs
          email: data.user.email || email,
          name: profile?.full_name || name || email.split('@')[0],
          isAuthenticated: true,
          accessToken: data.session?.access_token, // Add access token from session
          lastSync: Date.now(),
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed',
      };
    }
  }

  updateUI() {
    const authSection = document.getElementById('authSection');
    const mainSection = document.getElementById('mainSection');
    const statusIndicator = document.getElementById('statusIndicator');

    if (this.userData?.isAuthenticated) {
      authSection.style.display = 'none';
      mainSection.style.display = 'block';

      // Update user info
      document.getElementById('userEmail').textContent = this.userData.email;

      // Update toggle state
      const toggle = document.getElementById('activeToggle');
      toggle.checked = this.isActive;

      this.updateStatusIndicator();
      this.updateLastSync();
      this.updateStats();
    } else {
      authSection.style.display = 'block';
      mainSection.style.display = 'none';
      statusIndicator.classList.add('inactive');
    }
  }

  updateStatusIndicator() {
    const statusIndicator = document.getElementById('statusIndicator');
    if (this.isActive && this.userData?.isAuthenticated) {
      statusIndicator.classList.remove('inactive');
    } else {
      statusIndicator.classList.add('inactive');
    }
  }

  updateLastSync() {
    const lastSyncElement = document.getElementById('lastSync');
    if (this.userData?.lastSync) {
      const lastSync = new Date(this.userData.lastSync);
      lastSyncElement.textContent = `Last sync: ${lastSync.toLocaleDateString()}`;
    } else {
      lastSyncElement.textContent = 'Never synced';
    }
  }

  updateStats() {
    // This would typically fetch stats from your backend
    // For now, showing placeholder data
    document.getElementById('sitesVisited').textContent = '0';
    document.getElementById('timeSpent').textContent = '0h';
  }

  setLoading(loading) {
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach((button) => {
      button.disabled = loading;
    });
  }

  setSyncLoading(loading) {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.disabled = loading;
    syncBtn.textContent = loading ? 'Syncing...' : 'Sync Data';
  }

  showError(message) {
    // Remove existing error messages
    document.querySelectorAll('.error').forEach(el => el.remove());

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;

    const form = document.querySelector('form');
    if (form) {
      form.appendChild(errorDiv);
    }
  }

  showSuccess(message) {
    // Remove existing success messages
    document.querySelectorAll('.success').forEach(el => el.remove());

    // Add new success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;

    const form = document.querySelector('form');
    if (form) {
      form.appendChild(successDiv);
    }
  }
}

// Initialize popup controller
new PopupController();
