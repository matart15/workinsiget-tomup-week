// Content script for data collection
// Clean, refactored version

class ContentScript {
  constructor() {
    this.startTime = Date.now();
    this.isActive = false;
    this.lastMouseMove = 0;
    this.lastScroll = 0;
    this.initialize();
  }

  async initialize() {
    // Check if extension is active
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_STATE' });
    this.isActive = response.isActive;

    if (this.isActive) {
      this.startTracking();
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'SET_ACTIVE_STATE':
        this.isActive = message.isActive;
        if (this.isActive) {
          this.startTracking();
        } else {
          this.stopTracking();
        }
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }

  startTracking() {
    this.startTime = Date.now();

    // Track page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Track mouse movements (optional - for more detailed analytics)
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));

    // Track clicks
    document.addEventListener('click', this.handleClick.bind(this));

    // Track scroll events
    document.addEventListener('scroll', this.handleScroll.bind(this));
  }

  stopTracking() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('click', this.handleClick.bind(this));
    document.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  handleVisibilityChange() {
    if (!this.isActive) {

    }

    // Note: Data collection is handled by background.js tab tracking
    // This function is kept for potential future use
  }

  handleMouseMove(event) {
    if (!this.isActive) {
      return;
    }

    // Throttle mouse move events to avoid spam
    if (this.lastMouseMove && Date.now() - this.lastMouseMove < 1000) {
      return;
    }
    this.lastMouseMove = Date.now();

    // Note: Mouse tracking is disabled for privacy
    // This function is kept for potential future use
  }

  handleClick(event) {
    if (!this.isActive) {

    }

    // Note: Click tracking is disabled for privacy
    // This function is kept for potential future use
  }

  handleScroll(event) {
    if (!this.isActive) {
      return;
    }

    // Throttle scroll events
    if (this.lastScroll && Date.now() - this.lastScroll < 500) {
      return;
    }
    this.lastScroll = Date.now();

    // Note: Scroll tracking is disabled for privacy
    // This function is kept for potential future use
  }
}

// Initialize content script
new ContentScript();
