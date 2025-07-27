import { createUserProfile, getSupabase, getUserProfile } from './supabase';

type UserData = {
  userId: string;
  email: string;
  name: string;
  isAuthenticated: boolean;
  lastSync: number;
};

type AuthResponse = {
  success: boolean;
  user?: UserData;
  error?: string;
};

class PopupController {
  private userData: UserData | null = null;
  private isActive: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Load user data and active state
    await this.loadUserData();
    await this.loadActiveState();

    // Set up event listeners
    this.setupEventListeners();

    // Update UI based on current state
    this.updateUI();
  }

  private async loadUserData() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_USER_DATA' });
      this.userData = response.userData;
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private async loadActiveState() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_STATE' });
      this.isActive = response.isActive;
    } catch (error) {
      console.error('Failed to load active state:', error);
    }
  }

  private setupEventListeners() {
    // Auth form events
    document.getElementById('loginFormElement')?.addEventListener('submit', this.handleLogin.bind(this));
    document.getElementById('signupFormElement')?.addEventListener('submit', this.handleSignup.bind(this));

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

  private async handleLogin(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;

    try {
      this.setLoading(true);
      const response = await this.authenticateUser(email, password);

      if (response.success && response.user) {
        this.userData = response.user;
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
      this.showError('Login failed. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  private async handleSignup(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const name = (form.querySelector('#signupName') as HTMLInputElement).value;
    const email = (form.querySelector('#signupEmail') as HTMLInputElement).value;
    const password = (form.querySelector('#signupPassword') as HTMLInputElement).value;
    const confirmPassword = (form.querySelector('#signupConfirmPassword') as HTMLInputElement).value;

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    try {
      this.setLoading(true);
      const response = await this.registerUser(name, email, password);

      if (response.success && response.user) {
        this.userData = response.user;
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
      this.showError('Registration failed. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  private async handleLogout() {
    try {
      // Sign out from Supabase
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

  private async handleToggleChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isActive = checkbox.checked;

    await chrome.runtime.sendMessage({
      type: 'SET_ACTIVE_STATE',
      isActive: this.isActive,
    });

    this.updateStatusIndicator();
  }

  private async handleSync() {
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

  private showLoginForm() {
    document.getElementById('loginForm')!.style.display = 'block';
    document.getElementById('signupForm')!.style.display = 'none';
  }

  private showSignupForm() {
    document.getElementById('loginForm')!.style.display = 'none';
    document.getElementById('signupForm')!.style.display = 'block';
  }

  private openPrivacyPolicy() {
    chrome.tabs.create({ url: chrome.runtime.getURL('privacy.html') });
  }

  private openTermsConditions() {
    chrome.tabs.create({ url: chrome.runtime.getURL('terms.html') });
  }

  private async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign in with Supabase
      const supabaseClient = await getSupabase();
      const { data, error } = await supabaseClient.auth.signInWithPassword({
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

      // Get user profile from database
      const profile = await getUserProfile(data.user.id);

      return {
        success: true,
        user: {
          userId: data.user.id,
          email: data.user.email || email,
          name: profile?.name || data.user.email?.split('@')[0] || 'User',
          isAuthenticated: true,
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

  private async registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign up with Supabase
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
          userId: data.user.id,
          email: data.user.email || email,
          name: profile?.name || name || email.split('@')[0],
          isAuthenticated: true,
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

  private updateUI() {
    const authSection = document.getElementById('authSection')!;
    const mainSection = document.getElementById('mainSection')!;
    const statusIndicator = document.getElementById('statusIndicator')!;

    if (this.userData?.isAuthenticated) {
      authSection.style.display = 'none';
      mainSection.style.display = 'block';

      // Update user info
      document.getElementById('userEmail')!.textContent = this.userData.email;

      // Update toggle state
      const toggle = document.getElementById('activeToggle') as HTMLInputElement;
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

  private updateStatusIndicator() {
    const statusIndicator = document.getElementById('statusIndicator')!;
    if (this.isActive && this.userData?.isAuthenticated) {
      statusIndicator.classList.remove('inactive');
    } else {
      statusIndicator.classList.add('inactive');
    }
  }

  private updateLastSync() {
    const lastSyncElement = document.getElementById('lastSync')!;
    if (this.userData?.lastSync) {
      const lastSync = new Date(this.userData.lastSync);
      lastSyncElement.textContent = `Last sync: ${lastSync.toLocaleDateString()}`;
    } else {
      lastSyncElement.textContent = 'Never synced';
    }
  }

  private updateStats() {
    // This would typically fetch stats from your backend
    // For now, showing placeholder data
    document.getElementById('sitesVisited')!.textContent = '0';
    document.getElementById('timeSpent')!.textContent = '0h';
  }

  private setLoading(loading: boolean) {
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach((button) => {
      (button as HTMLButtonElement).disabled = loading;
    });
  }

  private setSyncLoading(loading: boolean) {
    const syncBtn = document.getElementById('syncBtn') as HTMLButtonElement;
    syncBtn.disabled = loading;
    syncBtn.textContent = loading ? 'Syncing...' : 'Sync Data';
  }

  private showError(message: string) {
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

  private showSuccess(message: string) {
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
