import { getApiBaseUrl } from './env';

type DataPoint = {
  url: string;
  title: string;
  timestamp: number;
  duration: number;
  userId: string;
};

type UserData = {
  userId: string;
  isAuthenticated: boolean;
  isActive: boolean;
  lastSync: number;
};

class BackgroundService {
  private userData: UserData | null = null;
  private isActive = false;
  private currentTab: chrome.tabs.Tab | null = null;
  private tabStartTime: number = 0;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Load user data from storage
    const result = await chrome.storage.local.get(['userData', 'isActive']);
    this.userData = result.userData || null;
    this.isActive = result.isActive || false;

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Tab activation
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));

    // Tab updates
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));

    // Tab removal
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));

    // Extension message handling
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  private async handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    // Record end time for previous tab
    if (this.currentTab && this.tabStartTime > 0) {
      await this.recordTabData(this.currentTab, Date.now() - this.tabStartTime);
    }

    // Start tracking new tab
    const tab = await chrome.tabs.get(activeInfo.tabId);
    this.currentTab = tab;
    this.tabStartTime = Date.now();
  }

  private async handleTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    if (changeInfo.status === 'complete' && tab.active) {
      // Record end time for previous tab
      if (this.currentTab && this.tabStartTime > 0) {
        await this.recordTabData(this.currentTab, Date.now() - this.tabStartTime);
      }

      // Start tracking new tab
      this.currentTab = tab;
      this.tabStartTime = Date.now();
    }
  }

  private async handleTabRemoved(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    // Record data for removed tab if it was the current tab
    if (this.currentTab?.id === tabId && this.tabStartTime > 0) {
      await this.recordTabData(this.currentTab, Date.now() - this.tabStartTime);
      this.currentTab = null;
      this.tabStartTime = 0;
    }
  }

  private async handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
    switch (message.type) {
      case 'SET_USER_DATA':
        this.userData = message.data;
        await chrome.storage.local.set({ userData: this.userData });
        sendResponse({ success: true });
        break;

      case 'SET_ACTIVE_STATE':
        this.isActive = message.isActive;
        await chrome.storage.local.set({ isActive: this.isActive });
        sendResponse({ success: true });
        break;

      case 'GET_USER_DATA':
        sendResponse({ userData: this.userData });
        break;

      case 'GET_ACTIVE_STATE':
        sendResponse({ isActive: this.isActive });
        break;

      case 'SYNC_DATA':
        await this.syncDataToServer();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }

  private async recordTabData(tab: chrome.tabs.Tab, duration: number) {
    if (!tab.url || !tab.title || !this.userData?.userId) {
      return;
    }

    const dataPoint: DataPoint = {
      url: tab.url,
      title: tab.title,
      timestamp: this.tabStartTime,
      duration,
      userId: this.userData.userId,
    };

    // Store data locally
    const result = await chrome.storage.local.get(['collectedData']);
    const collectedData = result.collectedData || [];
    collectedData.push(dataPoint);
    await chrome.storage.local.set({ collectedData });
  }

  private async syncDataToServer() {
    if (!this.userData?.userId) {
      return;
    }

    const result = await chrome.storage.local.get(['collectedData']);
    const collectedData = result.collectedData || [];

    if (collectedData.length === 0) {
      return;
    }

    try {
      // Get presigned URL from your lambda function
      const presignedUrl = await this.getPresignedUrl();

      // Upload data to S3
      await this.uploadToS3(presignedUrl, collectedData);

      // Clear local data after successful upload
      await chrome.storage.local.remove(['collectedData']);

      // Update last sync time
      this.userData.lastSync = Date.now();
      await chrome.storage.local.set({ userData: this.userData });
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }

  private async getPresignedUrl(): Promise<string> {
    // Get presigned URL from your lambda function
    const response = await fetch(`${getApiBaseUrl()}/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userData?.userId}`,
      },
      body: JSON.stringify({
        userId: this.userData?.userId,
        filename: `data_${Date.now()}.json`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }

    const data = await response.json();
    return data.presignedUrl;
  }

  private async uploadToS3(presignedUrl: string, data: DataPoint[]) {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to upload to S3');
    }
  }
}

// Initialize the background service
new BackgroundService();
