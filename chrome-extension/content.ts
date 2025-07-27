// Content script for data collection
class ContentScript {
  private startTime: number = Date.now();
  private isActive: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check if extension is active
    const response = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_STATE' });
    this.isActive = response.isActive;

    if (this.isActive) {
      this.startTracking();
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  private handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
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

  private startTracking() {
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

  private stopTracking() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('click', this.handleClick.bind(this));
    document.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  private handleVisibilityChange() {
    if (!this.isActive) {
      return;
    }

    const data = {
      type: 'visibility_change',
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      isVisible: !document.hidden,
      duration: Date.now() - this.startTime,
    };

    // Send data to background script
    chrome.runtime.sendMessage({
      type: 'RECORD_DATA',
      data,
    });
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isActive) {
      return;
    }

    // Throttle mouse move events to avoid spam
    if (this.lastMouseMove && Date.now() - this.lastMouseMove < 1000) {
      return;
    }
    this.lastMouseMove = Date.now();

    const data = {
      type: 'mouse_move',
      url: window.location.href,
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY,
    };

    chrome.runtime.sendMessage({
      type: 'RECORD_DATA',
      data,
    });
  }

  private handleClick(event: MouseEvent) {
    if (!this.isActive) {
      return;
    }

    const data = {
      type: 'click',
      url: window.location.href,
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY,
      target: (event.target as HTMLElement)?.tagName || 'unknown',
    };

    chrome.runtime.sendMessage({
      type: 'RECORD_DATA',
      data,
    });
  }

  private handleScroll(event: Event) {
    if (!this.isActive) {
      return;
    }

    // Throttle scroll events
    if (this.lastScroll && Date.now() - this.lastScroll < 500) {
      return;
    }
    this.lastScroll = Date.now();

    const data = {
      type: 'scroll',
      url: window.location.href,
      timestamp: Date.now(),
      scrollY: window.scrollY,
      scrollX: window.scrollX,
    };

    chrome.runtime.sendMessage({
      type: 'RECORD_DATA',
      data,
    });
  }

  private lastMouseMove: number = 0;
  private lastScroll: number = 0;
}

// Initialize content script
new ContentScript();
