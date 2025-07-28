// Content Script for collecting website content and user interaction data
class ContentScriptDataCollector {
  constructor() {
    this.isActive = false;
    this.userData = null;
    this.startTime = Date.now();
    this.interactionData = {
      clicks: [],
      keypresses: [],
      scrolls: [],
      formInputs: [],
      selections: [],
      visibilityChanges: [],
      focusEvents: [],
      mediaEvents: [],
      clipboardEvents: [],
    };
    this.initialize();
  }

  async initialize() {
    // Get user data and active state from background script
    const response = await chrome.runtime.sendMessage({ type: 'GET_USER_DATA' });
    this.userData = response.userData;

    const activeResponse = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_STATE' });
    this.isActive = activeResponse.isActive;

    if (this.isActive && this.userData?.isAuthenticated) {
      this.setupEventListeners();
      this.collectPageData();
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  setupEventListeners() {
    // Mouse events
    document.addEventListener('click', this.handleClick.bind(this), true);
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);

    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    document.addEventListener('keyup', this.handleKeyUp.bind(this), true);
    document.addEventListener('input', this.handleInput.bind(this), true);

    // Scroll events
    document.addEventListener('scroll', this.handleScroll.bind(this), true);

    // Selection events
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this), true);

    // Visibility events
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), true);

    // Focus events
    document.addEventListener('focus', this.handleFocus.bind(this), true);
    document.addEventListener('blur', this.handleBlur.bind(this), true);

    // Media events
    document.addEventListener('play', this.handleMediaEvent.bind(this), true);
    document.addEventListener('pause', this.handleMediaEvent.bind(this), true);
    document.addEventListener('ended', this.handleMediaEvent.bind(this), true);

    // Form events
    document.addEventListener('submit', this.handleFormSubmit.bind(this), true);

    // Clipboard events
    document.addEventListener('copy', this.handleClipboardEvent.bind(this), true);
    document.addEventListener('cut', this.handleClipboardEvent.bind(this), true);
    document.addEventListener('paste', this.handleClipboardEvent.bind(this), true);
  }

  handleClick(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const clickData = {
      event: 'click',
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        textContent: event.target.textContent?.substring(0, 100),
        href: event.target.href,
        type: event.target.type,
      },
      position: {
        x: event.clientX,
        y: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.clicks.push(clickData);
    console.log('🚀 ~ Content Script Click Data:', clickData);
  }

  handleMouseMove(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    // Throttle mouse move events to avoid spam
    if (this.lastMouseMove && Date.now() - this.lastMouseMove < 100) {
      return;
    }
    this.lastMouseMove = Date.now();

    const mouseData = {
      event: 'mousemove',
      position: {
        x: event.clientX,
        y: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    console.log('🚀 ~ Content Script Mouse Move Data:', mouseData);
  }

  handleKeyDown(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const keyData = {
      event: 'keydown',
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        type: event.target.type,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.keypresses.push(keyData);
    console.log('🚀 ~ Content Script Key Down Data:', keyData);
  }

  handleKeyUp(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const keyData = {
      event: 'keyup',
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        type: event.target.type,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    console.log('🚀 ~ Content Script Key Up Data:', keyData);
  }

  handleInput(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const inputData = {
      event: 'input',
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        type: event.target.type,
        name: event.target.name,
        placeholder: event.target.placeholder,
        valueLength: event.target.value?.length || 0,
        valuePreview: event.target.value?.substring(0, 50) || '',
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.formInputs.push(inputData);
    console.log('🚀 ~ Content Script Input Data:', inputData);
  }

  handleScroll(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    // Throttle scroll events
    if (this.lastScroll && Date.now() - this.lastScroll < 200) {
      return;
    }
    this.lastScroll = Date.now();

    const scrollData = {
      event: 'scroll',
      scrollPosition: {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        scrollTop: document.documentElement.scrollTop,
        scrollLeft: document.documentElement.scrollLeft,
      },
      documentSize: {
        scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientHeight: document.documentElement.clientHeight,
        clientWidth: document.documentElement.clientWidth,
      },
      scrollPercentage: {
        vertical: (window.scrollY / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100,
        horizontal: (window.scrollX / (document.documentElement.scrollWidth - document.documentElement.clientWidth)) * 100,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.scrolls.push(scrollData);
    console.log('🚀 ~ Content Script Scroll Data:', scrollData);
  }

  handleSelectionChange(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const selectionData = {
        event: 'selection_change',
        selection: {
          text: selection.toString().substring(0, 200),
          length: selection.toString().length,
          rangeCount: selection.rangeCount,
        },
        timestamp: Date.now(),
        url: window.location.href,
        title: document.title,
      };

      this.interactionData.selections.push(selectionData);
      console.log('🚀 ~ Content Script Selection Data:', selectionData);
    }
  }

  handleVisibilityChange(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const visibilityData = {
      event: 'visibility_change',
      visibilityState: document.visibilityState,
      hidden: document.hidden,
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.visibilityChanges.push(visibilityData);
    console.log('🚀 ~ Content Script Visibility Change Data:', visibilityData);
  }

  handleFocus(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const focusData = {
      event: 'focus',
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        type: event.target.type,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.focusEvents.push(focusData);
    console.log('🚀 ~ Content Script Focus Data:', focusData);
  }

  handleBlur(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const blurData = {
      event: 'blur',
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        type: event.target.type,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    console.log('🚀 ~ Content Script Blur Data:', blurData);
  }

  handleMediaEvent(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const mediaData = {
      event: 'media_event',
      mediaType: event.type,
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        src: event.target.src,
        currentTime: event.target.currentTime,
        duration: event.target.duration,
        paused: event.target.paused,
        muted: event.target.muted,
        volume: event.target.volume,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.mediaEvents.push(mediaData);
    console.log('🚀 ~ Content Script Media Event Data:', mediaData);
  }

  handleFormSubmit(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const formData = {
      event: 'form_submit',
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        action: event.target.action,
        method: event.target.method,
        enctype: event.target.enctype,
      },
      formElements: Array.from(event.target.elements).map(element => ({
        tagName: element.tagName,
        type: element.type,
        name: element.name,
        id: element.id,
        required: element.required,
        disabled: element.disabled,
        valueLength: element.value?.length || 0,
      })),
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    console.log('🚀 ~ Content Script Form Submit Data:', formData);
  }

  handleClipboardEvent(event) {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    const clipboardData = {
      event: 'clipboard_event',
      clipboardType: event.type,
      target: {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
      },
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
    };

    this.interactionData.clipboardEvents.push(clipboardData);
    console.log('🚀 ~ Content Script Clipboard Event Data:', clipboardData);
  }

  async collectPageData() {
    if (!this.isActive || !this.userData?.isAuthenticated) {
      return;
    }

    try {
      const pageData = {
        event: 'page_data_collection',
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        domain: window.location.hostname,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        protocol: window.location.protocol,
        port: window.location.port,
        document: {
          readyState: document.readyState,
          characterSet: document.characterSet,
          contentType: document.contentType,
          lastModified: document.lastModified,
          cookie: document.cookie,
          domain: document.domain,
          referrer: document.referrer,
        },
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
          screenX: window.screenX,
          screenY: window.screenY,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        },
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
          orientation: screen.orientation,
        },
        performance: {
          timeOrigin: performance.timeOrigin,
          navigation: performance.navigation,
          timing: performance.timing,
        },
        elements: {
          forms: document.forms.length,
          images: document.images.length,
          links: document.links.length,
          scripts: document.scripts.length,
          stylesheets: document.styleSheets.length,
          inputs: document.querySelectorAll('input').length,
          buttons: document.querySelectorAll('button').length,
          textareas: document.querySelectorAll('textarea').length,
          selects: document.querySelectorAll('select').length,
          videos: document.querySelectorAll('video').length,
          audios: document.querySelectorAll('audio').length,
          iframes: document.querySelectorAll('iframe').length,
        },
        meta: {
          viewport: document.querySelector('meta[name="viewport"]')?.content,
          description: document.querySelector('meta[name="description"]')?.content,
          keywords: document.querySelector('meta[name="keywords"]')?.content,
          author: document.querySelector('meta[name="author"]')?.content,
          robots: document.querySelector('meta[name="robots"]')?.content,
          charset: document.querySelector('meta[charset]')?.charset,
        },
        language: {
          documentLanguage: document.documentElement.lang,
          navigatorLanguage: navigator.language,
          navigatorLanguages: navigator.languages,
        },
        timeSpent: Date.now() - this.startTime,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
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

      console.log('🚀 ~ Content Script Page Data Collection:', pageData);
    } catch (error) {
      console.log('🚀 ~ Error collecting page data:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'SET_ACTIVE_STATE':
        this.isActive = message.isActive;
        if (this.isActive && this.userData?.isAuthenticated) {
          this.setupEventListeners();
          this.collectPageData();
        }
        sendResponse({ success: true });
        break;

      case 'SET_USER_DATA':
        this.userData = message.data;
        if (this.isActive && this.userData?.isAuthenticated) {
          this.setupEventListeners();
          this.collectPageData();
        }
        sendResponse({ success: true });
        break;

      case 'GET_INTERACTION_DATA':
        sendResponse({ interactionData: this.interactionData });
        break;

      case 'COLLECT_PAGE_DATA':
        await this.collectPageData();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }
}

// Initialize content script data collector
console.log('🚀 ~ Content Script Starting...');
const contentScriptCollector = new ContentScriptDataCollector();
