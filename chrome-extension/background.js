/* eslint-disable no-undef */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
// Chrome Extension Background Service
const loadEnvFromFile = async () => {
  try {
    const response = await fetch(chrome.runtime.getURL('env.json'));
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
  }
  return {};
};

const loadEnvFromStorage = async () => {
  try {
    const result = await chrome.storage.local.get(['env_config']);
    return result.env_config || {};
  } catch (error) {
    return {};
  }
};

const getDefaultEnv = () => ({});

const getEnv = async () => {
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
    }
  }

  throw new Error('No valid environment configuration found. Please set up env.json or configure via storage.');
};

let supabaseClient = null;

const initializeSupabase = async (accessToken = null) => {
  if (supabaseClient && supabaseClient.token === accessToken) {
    return supabaseClient;
  }

  const env = await getEnv();

  supabaseClient = {
    url: env.SUPABASE_URL,
    key: env.SUPABASE_ANON_KEY,
    token: accessToken,

    from(table) {
      return {
        insert: async (data) => {
          try {
            const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
                'Prefer': 'return=minimal',
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Supabase insert failed: ${response.status} - ${error}`);
            }

            return { data: null, error: null };
          } catch (error) {
            throw error;
          }
        },
      };
    },
  };

  return supabaseClient;
};

class BackgroundService {
  constructor() {
    this.userData = null;
    this.isActive = false;
    this.currentTab = null;
    this.tabStartTime = 0;
    this.syncInterval = null;
    this.collectedData = {
      timestamp: Date.now(),
      user: null,
      tabs: [],
      windows: [],
      navigation: [],
      sessions: [],
      idle: [],
      system: null,
      storage: null,
      bookmarks: null,
      history: null,
      network: null,
      battery: null,
      clipboard: null,
      extension: null,
      events: [],
    };
    this.initialize();
  }

  async initialize() {
    const result = await chrome.storage.local.get(['userData', 'isActive']);
    this.userData = result.userData || null;
    this.isActive = result.isActive || false;

    this.setupEventListeners();

    if (this.userData?.isAuthenticated && this.isActive) {
      this.startSyncInterval();
    }
  }

  setupEventListeners() {
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));
    chrome.windows.onCreated.addListener(this.handleWindowCreated.bind(this));
    chrome.windows.onRemoved.addListener(this.handleWindowRemoved.bind(this));
    chrome.windows.onFocusChanged.addListener(this.handleWindowFocusChanged.bind(this));

    // Add webNavigation listeners if available
    if (chrome.webNavigation) {
      chrome.webNavigation.onCompleted.addListener(this.handleNavigationCompleted.bind(this));
      chrome.webNavigation.onBeforeNavigate.addListener(this.handleBeforeNavigate.bind(this));
      chrome.webNavigation.onDOMContentLoaded.addListener(this.handleDOMContentLoaded.bind(this));
    }

    // Add sessions listener if available
    if (chrome.sessions) {
      chrome.sessions.onChanged.addListener(this.handleSessionChanged.bind(this));
    }

    // Add idle listener if available
    if (chrome.idle) {
      chrome.idle.onStateChanged.addListener(this.handleIdleStateChanged.bind(this));
    }

    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    // Collect initial comprehensive data
    this.collectSystemData();
    this.collectExtensionData();
    this.collectStorageData();
    this.collectBookmarkData();
    this.collectHistoryData();
    this.collectSessionData();
    this.collectIdleData();
    this.collectNetworkData();
    this.collectBatteryData();
    this.collectClipboardData();
  }

  async handleTabActivated(activeInfo) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    if (this.currentTab && this.tabStartTime > 0) {
      await this.recordTabData(this.currentTab, Date.now() - this.tabStartTime);
    }

    const tab = await chrome.tabs.get(activeInfo.tabId);
    this.currentTab = tab;
    this.tabStartTime = Date.now();

    const tabData = {
      event: 'tab_activated',
      tabId: activeInfo.tabId,
      windowId: activeInfo.windowId,
      tab: {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        index: tab.index,
        pinned: tab.pinned,
        incognito: tab.incognito,
        status: tab.status,
        audible: tab.audible,
        mutedInfo: tab.mutedInfo,
        groupId: tab.groupId,
        favIconUrl: tab.favIconUrl,
        width: tab.width,
        height: tab.height,
        sessionId: tab.sessionId,
        openerTabId: tab.openerTabId,
        discarded: tab.discarded,
        autoDiscardable: tab.autoDiscardable,
        pendingUrl: tab.pendingUrl,
        successorTabId: tab.successorTabId,
        cookieStoreId: tab.cookieStoreId,
        highlighted: tab.highlighted,
        active: tab.active,
        attention: tab.attention,
        hidden: tab.hidden,
        lastAccessed: tab.lastAccessed,
        shared: tab.shared,
        unread: tab.unread,
        windowId: tab.windowId,
      },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.tabs.push(tabData);
    this.collectedData.events.push(tabData);
  }

  async handleTabUpdated(tabId, changeInfo, tab) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    if (changeInfo.status === 'complete' && tab.active) {
      if (this.currentTab && this.tabStartTime > 0) {
        await this.recordTabData(this.currentTab, Date.now() - this.tabStartTime);
      }

      this.currentTab = tab;
      this.tabStartTime = Date.now();
    }

    // Collect comprehensive tab update data
    const updateData = {
      event: 'tab_updated',
      tabId,
      changeInfo: {
        status: changeInfo.status,
        url: changeInfo.url,
        pinned: changeInfo.pinned,
        audible: changeInfo.audible,
        mutedInfo: changeInfo.mutedInfo,
        favIconUrl: changeInfo.favIconUrl,
        title: changeInfo.title,
        discarded: changeInfo.discarded,
        attention: changeInfo.attention,
        highlighted: changeInfo.highlighted,
        active: changeInfo.active,
        groupId: changeInfo.groupId,
        openerTabId: changeInfo.openerTabId,
        successorTabId: changeInfo.successorTabId,
        width: changeInfo.width,
        height: changeInfo.height,
        sessionId: changeInfo.sessionId,
        autoDiscardable: changeInfo.autoDiscardable,
        pendingUrl: changeInfo.pendingUrl,
        cookieStoreId: changeInfo.cookieStoreId,
        hidden: changeInfo.hidden,
        lastAccessed: changeInfo.lastAccessed,
        shared: changeInfo.shared,
        unread: changeInfo.unread,
        windowId: changeInfo.windowId,
      },
      tab: {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        index: tab.index,
        pinned: tab.pinned,
        incognito: tab.incognito,
        status: tab.status,
        audible: tab.audible,
        mutedInfo: tab.mutedInfo,
        groupId: tab.groupId,
        favIconUrl: tab.favIconUrl,
        width: tab.width,
        height: tab.height,
        sessionId: tab.sessionId,
        openerTabId: tab.openerTabId,
        discarded: tab.discarded,
        autoDiscardable: tab.autoDiscardable,
        pendingUrl: tab.pendingUrl,
        successorTabId: tab.successorTabId,
        cookieStoreId: tab.cookieStoreId,
        highlighted: tab.highlighted,
        active: tab.active,
        attention: tab.attention,
        hidden: tab.hidden,
        lastAccessed: tab.lastAccessed,
        shared: tab.shared,
        unread: tab.unread,
        windowId: tab.windowId,
      },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.tabs.push(updateData);
    this.collectedData.events.push(updateData);
  }

  async handleTabRemoved(tabId, removeInfo) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    if (this.currentTab?.id === tabId && this.tabStartTime > 0) {
      await this.recordTabData(this.currentTab, Date.now() - this.tabStartTime);
      this.currentTab = null;
      this.tabStartTime = 0;
    }

    // Collect comprehensive tab removal data
    const removalData = {
      event: 'tab_removed',
      tabId,
      removeInfo: {
        windowId: removeInfo.windowId,
        isWindowClosing: removeInfo.isWindowClosing,
      },
      wasCurrentTab: this.currentTab?.id === tabId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.tabs.push(removalData);
    this.collectedData.events.push(removalData);
  }

  async handleWindowCreated(window) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const windowData = {
      event: 'window_created',
      window: {
        id: window.id,
        focused: window.focused,
        top: window.top,
        left: window.left,
        width: window.width,
        height: window.height,
        incognito: window.incognito,
        type: window.type,
        state: window.state,
        alwaysOnTop: window.alwaysOnTop,
        sessionId: window.sessionId,
        title: window.title,
        tabs: window.tabs,
        tabIds: window.tabIds,
      },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.windows.push(windowData);
    this.collectedData.events.push(windowData);
  }

  async handleWindowRemoved(windowId) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const windowData = {
      event: 'window_removed',
      windowId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.windows.push(windowData);
    this.collectedData.events.push(windowData);
  }

  async handleWindowFocusChanged(windowId) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const windowData = {
      event: 'window_focus_changed',
      windowId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.windows.push(windowData);
    this.collectedData.events.push(windowData);
  }

  async collectSystemData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Get all windows
      const windows = await chrome.windows.getAll({ populate: true });

      // Get all tabs
      const tabs = await chrome.tabs.query({});

      // Note: systemInfo API is not available in standard Chrome extensions
      // We'll collect basic system info from navigator and screen APIs
      const systemInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      const cpuInfo = {
        hardwareConcurrency: navigator.hardwareConcurrency,
      };

      const memoryInfo = {
        deviceMemory: navigator.deviceMemory,
        totalJSHeapSize: performance.memory?.totalJSHeapSize,
        usedJSHeapSize: performance.memory?.usedJSHeapSize,
        jsHeapSizeLimit: performance.memory?.jsHeapSizeLimit,
      };

      const displayInfo = {
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
          orientation: screen.orientation,
        },
      };

      const systemData = {
        event: 'system_data_collection',
        windows: windows.map(window => ({
          id: window.id,
          focused: window.focused,
          top: window.top,
          left: window.left,
          width: window.width,
          height: window.height,
          incognito: window.incognito,
          type: window.type,
          state: window.state,
          alwaysOnTop: window.alwaysOnTop,
          sessionId: window.sessionId,
          title: window.title,
          tabIds: window.tabIds,
        })),
        tabs: tabs.map(tab => ({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          index: tab.index,
          pinned: tab.pinned,
          incognito: tab.incognito,
          status: tab.status,
          audible: tab.audible,
          mutedInfo: tab.mutedInfo,
          groupId: tab.groupId,
          favIconUrl: tab.favIconUrl,
          width: tab.width,
          height: tab.height,
          sessionId: tab.sessionId,
          openerTabId: tab.openerTabId,
          discarded: tab.discarded,
          autoDiscardable: tab.autoDiscardable,
          pendingUrl: tab.pendingUrl,
          successorTabId: tab.successorTabId,
          cookieStoreId: tab.cookieStoreId,
          highlighted: tab.highlighted,
          active: tab.active,
          attention: tab.attention,
          hidden: tab.hidden,
          lastAccessed: tab.lastAccessed,
          shared: tab.shared,
          unread: tab.unread,
          windowId: tab.windowId,
        })),
        systemInfo,
        cpuInfo,
        memoryInfo,
        displayInfo,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
          orientation: screen.orientation,
        },
        location: {
          href: location.href,
          origin: location.origin,
          protocol: location.protocol,
          host: location.host,
          hostname: location.hostname,
          port: location.port,
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        },
        performance: {
          timeOrigin: performance.timeOrigin,
          navigation: performance.navigation,
          timing: performance.timing,
        },
      };

      this.collectedData.system = systemData;
    } catch (error) {
      // Error collecting system data
    }
  }

  async collectExtensionData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Get extension info
      const extensionInfo = chrome.runtime.getManifest();

      // Get extension ID
      const extensionId = chrome.runtime.id;

      // Get extension URL
      const extensionUrl = chrome.runtime.getURL('');

      // Get extension views
      const views = chrome.extension.getViews();

      // Get extension background page
      const backgroundPage = chrome.extension.getBackgroundPage();

      const extensionData = {
        event: 'extension_data_collection',
        extensionInfo,
        extensionId,
        extensionUrl,
        views: views ? views.length : 0,
        hasBackgroundPage: !!backgroundPage,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.extension = extensionData;
    } catch (error) {
      // Error collecting extension data
    }
  }

  async collectStorageData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Get local storage data
      const localStorage = await chrome.storage.local.get(null);

      // Get sync storage data
      const syncStorage = await chrome.storage.sync.get(null);

      // Get session storage data
      const sessionStorage = await chrome.storage.session.get(null);

      const storageData = {
        event: 'storage_data_collection',
        local: Object.keys(localStorage),
        sync: Object.keys(syncStorage),
        session: Object.keys(sessionStorage),
        localSize: JSON.stringify(localStorage).length,
        syncSize: JSON.stringify(syncStorage).length,
        sessionSize: JSON.stringify(sessionStorage).length,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.storage = storageData;
    } catch (error) {
      // Error collecting storage data
    }
  }

  async collectBookmarkData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Check if bookmarks API is available
      if (!chrome.bookmarks) {
        return;
      }

      // Get bookmark tree
      const bookmarkTree = await chrome.bookmarks.getTree();

      // Get recent bookmarks
      const recentBookmarks = await chrome.bookmarks.getRecent(10);

      const bookmarkData = {
        event: 'bookmark_data_collection',
        bookmarkTree,
        recentBookmarks,
        totalBookmarks: this.countBookmarks(bookmarkTree),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.bookmarks = bookmarkData;
    } catch (error) {
      // Error collecting bookmark data
    }
  }

  countBookmarks(bookmarkTree) {
    let count = 0;
    const countRecursive = (nodes) => {
      nodes.forEach((node) => {
        if (node.url) {
          count++;
        }
        if (node.children) {
          countRecursive(node.children);
        }
      });
    };
    countRecursive(bookmarkTree);
    return count;
  }

  async collectHistoryData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Check if history API is available
      if (!chrome.history) {
        return;
      }

      // Get recent history
      const endTime = Date.now();
      const startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours
      const historyItems = await chrome.history.search({
        text: '',
        startTime,
        endTime,
        maxResults: 100,
      });

      const historyData = {
        event: 'history_data_collection',
        historyItems,
        totalItems: historyItems.length,
        timeRange: {
          startTime,
          endTime,
          duration: endTime - startTime,
        },
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.history = historyData;
    } catch (error) {
      // Error collecting history data
    }
  }

  async handleNavigationCompleted(details) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const navigationData = {
      event: 'navigation_completed',
      details: {
        tabId: details.tabId,
        url: details.url,
        frameId: details.frameId,
        parentFrameId: details.parentFrameId,
        timeStamp: details.timeStamp,
        processId: details.processId,
        fromCache: details.fromCache,
        errorOccurred: details.errorOccurred,
        documentLifecycle: details.documentLifecycle,
        transitionType: details.transitionType,
        transitionQualifiers: details.transitionQualifiers,
      },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.navigation.push(navigationData);
    this.collectedData.events.push(navigationData);
  }

  async handleBeforeNavigate(details) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const navigationData = {
      event: 'before_navigate',
      details: {
        tabId: details.tabId,
        url: details.url,
        frameId: details.frameId,
        parentFrameId: details.parentFrameId,
        timeStamp: details.timeStamp,
        processId: details.processId,
      },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.navigation.push(navigationData);
    this.collectedData.events.push(navigationData);
  }

  async handleDOMContentLoaded(details) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const navigationData = {
      event: 'dom_content_loaded',
      details: {
        tabId: details.tabId,
        url: details.url,
        frameId: details.frameId,
        parentFrameId: details.parentFrameId,
        timeStamp: details.timeStamp,
        processId: details.processId,
      },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.navigation.push(navigationData);
    this.collectedData.events.push(navigationData);
  }

  async handleSessionChanged() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const sessionData = {
      event: 'session_changed',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.sessions.push(sessionData);
    this.collectedData.events.push(sessionData);
  }

  async handleIdleStateChanged(state) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const idleData = {
      event: 'idle_state_changed',
      state,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      product: navigator.product,
      productSub: navigator.productSub,
      userAgentData: navigator.userAgentData,
    };

    this.collectedData.idle.push(idleData);
    this.collectedData.events.push(idleData);
  }

  async collectSessionData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Check if sessions API is available
      if (!chrome.sessions) {
        return;
      }

      // Get recently closed sessions
      const recentlyClosed = await chrome.sessions.getRecentlyClosed();

      // Get device info
      const deviceInfo = await chrome.sessions.getDeviceInfo();

      const sessionData = {
        event: 'session_data_collection',
        recentlyClosed,
        deviceInfo,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.sessions.push(sessionData);
    } catch (error) {
      // Error collecting session data
    }
  }

  async collectIdleData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Check if idle API is available
      if (!chrome.idle) {
        return;
      }

      // Get current idle state
      const idleState = await chrome.idle.queryState(60); // 60 seconds threshold

      // Get idle time
      const idleTime = await chrome.idle.queryState(0);

      const idleData = {
        event: 'idle_data_collection',
        idleState,
        idleTime,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.idle.push(idleData);
    } catch (error) {
      // Error collecting idle data
    }
  }

  async collectNetworkData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Get network connectivity info
      const networkData = {
        event: 'network_data_collection',
        connection: navigator.connection
          ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
              rtt: navigator.connection.rtt,
              saveData: navigator.connection.saveData,
            }
          : null,
        onLine: navigator.onLine,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.network = networkData;
    } catch (error) {
      // Error collecting network data
    }
  }

  async collectBatteryData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Get battery status if available
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();

        const batteryData = {
          event: 'battery_data_collection',
          battery: {
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            level: battery.level,
          },
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          languages: navigator.languages,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: navigator.deviceMemory,
          maxTouchPoints: navigator.maxTouchPoints,
          vendor: navigator.vendor,
          appName: navigator.appName,
          appVersion: navigator.appVersion,
          product: navigator.product,
          productSub: navigator.productSub,
          userAgentData: navigator.userAgentData,
        };

        this.collectedData.battery = batteryData;
      }
    } catch (error) {
      // Error collecting battery data
    }
  }

  async collectClipboardData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      // Check clipboard permissions and content
      const clipboardData = {
        event: 'clipboard_data_collection',
        permissions: {
          clipboardRead: 'clipboard-read' in navigator.permissions ? await navigator.permissions.query({ name: 'clipboard-read' }) : null,
          clipboardWrite: 'clipboard-write' in navigator.permissions ? await navigator.permissions.query({ name: 'clipboard-write' }) : null,
        },
        clipboardAvailable: 'clipboard' in navigator,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        userAgentData: navigator.userAgentData,
      };

      this.collectedData.clipboard = clipboardData;
    } catch (error) {
      // Error collecting clipboard data
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'SET_USER_DATA':
        this.userData = message.data;
        await chrome.storage.local.set({ userData: this.userData });

        if (this.userData?.isAuthenticated && this.isActive) {
          this.startSyncInterval();
        } else {
          this.stopSyncInterval();
        }

        sendResponse({ success: true });
        break;

      case 'SET_ACTIVE_STATE':
        this.isActive = message.isActive;
        await chrome.storage.local.set({ isActive: this.isActive });

        if (this.isActive && this.userData?.isAuthenticated) {
          this.startSyncInterval();
        } else {
          this.stopSyncInterval();
        }

        sendResponse({ success: true });
        break;

      case 'GET_USER_DATA':
        sendResponse({ userData: this.userData });
        break;

      case 'GET_ACTIVE_STATE':
        sendResponse({ isActive: this.isActive });
        break;

      case 'SYNC_DATA':
        try {
          await this.syncDataToServer();
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  async recordTabData(tab, duration) {
    if (!this.userData?.isAuthenticated) {
      return;
    }

    const data = {
      user_id: this.userData.userId,
      url: tab.url,
      title: tab.title,
      duration: Math.round(duration / 1000),
      timestamp: Date.now(),
    };

    const existingData = await chrome.storage.local.get(['tabData']);
    const tabData = existingData.tabData || [];
    tabData.push(data);
    await chrome.storage.local.set({ tabData });
  }

  startSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncDataToServer();
        await this.collectSystemData();
        await this.collectExtensionData();
        await this.collectStorageData();
        await this.collectBookmarkData();
        await this.collectHistoryData();
        await this.collectSessionData();
        await this.collectIdleData();
        await this.collectNetworkData();
        await this.collectBatteryData();
        await this.collectClipboardData();
      } catch (error) {
      }
    }, 10000);
  }

  stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  logAllCollectedData() {
    // Update timestamp
    this.collectedData.timestamp = Date.now();

    // Add user data
    this.collectedData.user = this.userData;

    console.log('🚀 ~ COMPREHENSIVE DATA COLLECTION SUMMARY:', {
      timestamp: this.collectedData.timestamp,
      user: this.collectedData.user ? 'Authenticated' : 'Not authenticated',
      events: {
        tabs: this.collectedData.tabs.length,
        windows: this.collectedData.windows.length,
        navigation: this.collectedData.navigation.length,
        sessions: this.collectedData.sessions.length,
        idle: this.collectedData.idle.length,
        total: this.collectedData.events.length,
      },
      data: {
        system: this.collectedData.system ? 'Available' : 'Not available',
        storage: this.collectedData.storage ? 'Available' : 'Not available',
        bookmarks: this.collectedData.bookmarks ? 'Available' : 'Not available',
        history: this.collectedData.history ? 'Available' : 'Not available',
        network: this.collectedData.network ? 'Available' : 'Not available',
        battery: this.collectedData.battery ? 'Available' : 'Not available',
        clipboard: this.collectedData.clipboard ? 'Available' : 'Not available',
        extension: this.collectedData.extension ? 'Available' : 'Not available',
      },
      fullData: this.collectedData,
    });
  }

  async syncDataToServer() {
    if (!this.userData?.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    // Log all collected data before sending to database
    this.logAllCollectedData();

    const result = await chrome.storage.local.get(['tabData']);
    const tabData = result.tabData || [];

    if (tabData.length === 0) {
      return;
    }

    const validTabData = tabData.filter((item) => {
      if (item.profile_id) {
        item.user_id = item.profile_id;
        delete item.profile_id;
      }
      return item.user_id && item.url && item.duration && item.timestamp;
    });

    if (validTabData.length === 0) {
      await chrome.storage.local.remove(['tabData']);
      return;
    }

    try {
      const supabase = await initializeSupabase(this.userData.accessToken);

      const { error } = await supabase.from('user_activity_logs').insert(validTabData);

      if (error) {
        throw new Error(`Failed to insert data: ${error}`);
      }

      await chrome.storage.local.remove(['tabData']);
    } catch (error) {
      throw error;
    }
  }
}

try {
  const backgroundService = new BackgroundService();
} catch (error) {
}
