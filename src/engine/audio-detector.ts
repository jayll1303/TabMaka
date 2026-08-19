export type AudioStatusCallback = (audible: boolean) => void;

/**
 * Detects whether any tab in Chrome is currently playing audio (e.g. Spotify, YouTube, SoundCloud).
 * When active, triggers the mascot's headphone chill/vibe animation.
 */
export class AudioDetector {
  private isAudible = false;
  private manualOverride: boolean | null = null;
  private timer: number | null = null;
  private listenersAttached = false;
  private readonly onUpdateListener = (
    _tabId: number,
    changeInfo: { audible?: boolean },
  ) => {
    if ("audible" in changeInfo) {
      this.checkAudibleTabs();
    }
  };
  private readonly onRemovedListener = () => {
    this.checkAudibleTabs();
  };
  private readonly onActivatedListener = () => {
    this.checkAudibleTabs();
  };

  constructor(private readonly onStatusChange: AudioStatusCallback) {
    this.init();
  }

  private init(): void {
    this.checkAudibleTabs();
    this.attachChromeListeners();

    // Secondary periodic poll (every 2.5s) to guarantee resilience
    if (typeof window !== "undefined") {
      this.timer = window.setInterval(() => {
        this.checkAudibleTabs();
      }, 2500);
    }
  }

  private attachChromeListeners(): void {
    if (typeof chrome === "undefined" || !chrome.tabs) return;

    try {
      chrome.tabs.onUpdated.addListener(this.onUpdateListener);
      chrome.tabs.onRemoved.addListener(this.onRemovedListener);
      chrome.tabs.onActivated.addListener(this.onActivatedListener);
      this.listenersAttached = true;
    } catch {
      // Ignored if permissions are restricted or mocked
    }
  }

  public checkAudibleTabs(): void {
    if (typeof chrome === "undefined" || !chrome.tabs?.query) return;

    try {
      chrome.tabs.query({ audible: true }, (tabs) => {
        if (chrome.runtime?.lastError) return;
        const hasAudible = Array.isArray(tabs) && tabs.length > 0;

        if (hasAudible) {
          // Real music is playing, clear manual override and activate
          this.manualOverride = null;
          this.setAudible(true);
        } else if (this.manualOverride === null) {
          // No manual override, reflect actual state
          this.setAudible(false);
        }
      });
    } catch {
      // Silent catch
    }
  }

  public setAudible(audible: boolean): void {
    if (this.isAudible !== audible) {
      this.isAudible = audible;
      this.onStatusChange(this.isAudible);
    }
  }

  public getStatus(): boolean {
    return this.isAudible;
  }

  public toggle(): boolean {
    const next = !this.isAudible;
    this.manualOverride = next ? true : null;
    this.setAudible(next);
    return this.isAudible;
  }

  public destroy(): void {
    if (this.timer !== null && typeof window !== "undefined") {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    if (
      this.listenersAttached &&
      typeof chrome !== "undefined" &&
      chrome.tabs
    ) {
      try {
        chrome.tabs.onUpdated.removeListener(this.onUpdateListener);
        chrome.tabs.onRemoved.removeListener(this.onRemovedListener);
        chrome.tabs.onActivated.removeListener(this.onActivatedListener);
      } catch {
        // Ignored
      }
      this.listenersAttached = false;
    }
  }
}
