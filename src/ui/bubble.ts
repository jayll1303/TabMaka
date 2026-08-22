import type { Vec } from "../engine/vec";
import type { Mascot } from "../engine/mascot";

export const GREETINGS = [
  "Xin chào bạn!",
  "Hello friend!",
  "Bonjour!",
  "Konnichiwa!",
  "Hola amigo!",
  "Aloha!",
  "G'day mate!",
  "Ciao!",
  "Hej hej!",
  "Nice to see you!",
  "Good morning!",
  "I am awake!",
  "Yawn...",
] as const;

export const TIPS = [
  "Feed me please.",
  "Click for snacks.",
  "Type something!",
  "Watch my paws.",
  "Double click me.",
  "I can jump high.",
  "Pick me up.",
  "Move me around.",
  "Click greeting to edit.",
  "Pick my colors.",
  "Play some music!",
  "Change the clock.",
] as const;

export const REACTIONS = ["Yay!", "Wheee!", "Hehe!", "Ribbit!"] as const;

const LAST_MSG_KEY = "tabmaka.lastBubbleMsg";

/**
 * Pick a message with 80% probability for Greetings and 20% for Tips.
 * Prevents immediately repeating the last shown message if alternatives exist.
 */
export function pickMessage(
  randomVal: number = Math.random(),
  lastMsg: string = "",
): string {
  const isGreeting = randomVal < 0.8;
  const pool = isGreeting ? [...GREETINGS] : [...TIPS];

  const filtered =
    pool.length > 1 && lastMsg ? pool.filter((m) => m !== lastMsg) : pool;
  const chosenIndex = Math.floor(Math.random() * filtered.length);
  return filtered[chosenIndex] || pool[0];
}

export function getLastSavedMessage(): string {
  try {
    return sessionStorage.getItem(LAST_MSG_KEY) || "";
  } catch {
    return "";
  }
}

export function saveLastMessage(msg: string): void {
  try {
    sessionStorage.setItem(LAST_MSG_KEY, msg);
  } catch {
    // ignore
  }
}

/**
 * Update the bubble element's absolute position relative to the mascot anchor point.
 * Clamps coordinates to keep the bubble within screen bounds.
 */
export function positionBubble(
  bubbleEl: HTMLElement,
  anchor: Vec,
  screenSize: { w: number; h: number },
): void {
  const bubbleRect = bubbleEl.getBoundingClientRect();
  const halfW = (bubbleRect.width || 120) / 2;
  const bubbleH = bubbleRect.height || 40;

  // Clamp horizontal center
  const minX = halfW + 16;
  const maxX = Math.max(minX, screenSize.w - halfW - 16);
  const clampedX = Math.max(minX, Math.min(maxX, anchor.x));

  // Position above the anchor point
  const desiredY = anchor.y - bubbleH - 12;
  const clampedY = Math.max(16, desiredY);

  bubbleEl.style.left = `${clampedX}px`;
  bubbleEl.style.top = `${clampedY}px`;
}

export interface BubbleController {
  show(customText?: string): void;
  hide(): void;
  react(word?: string): void;
  isVisible(): boolean;
  updatePosition(): void;
  destroy(): void;
}

/**
 * Initialize thought bubble management for the mascot.
 */
export function initBubble(
  bubbleEl: HTMLElement,
  mascot: Mascot,
  getScreenSize: () => { w: number; h: number },
): BubbleController {
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let isShowing = false;

  function clearHideTimer(): void {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function updatePosition(): void {
    if (!isShowing) return;
    const anchor = mascot.getBubbleAnchor?.();
    if (!anchor) return;
    positionBubble(bubbleEl, anchor, getScreenSize());
  }

  function hide(): void {
    clearHideTimer();
    isShowing = false;
    bubbleEl.classList.remove("visible");
    bubbleEl.setAttribute("aria-hidden", "true");
  }

  function show(customText?: string): void {
    clearHideTimer();
    const last = getLastSavedMessage();
    const msg = customText || pickMessage(Math.random(), last);
    saveLastMessage(msg);

    bubbleEl.textContent = msg;
    bubbleEl.classList.remove("reacting");
    bubbleEl.classList.add("visible");
    bubbleEl.setAttribute("aria-hidden", "false");
    isShowing = true;

    // Reposition to anchor
    updatePosition();

    // Auto-hide after 4 seconds
    hideTimer = setTimeout(() => {
      hide();
    }, 4000);
  }

  function react(word?: string): void {
    if (!isShowing) return;
    clearHideTimer();

    const reactionText =
      word || REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    bubbleEl.textContent = reactionText;
    bubbleEl.classList.add("reacting");

    // Hold reaction for 800ms before fading out
    hideTimer = setTimeout(() => {
      hide();
    }, 800);
  }

  // Click on bubble dismisses with cute reaction
  const onBubbleClick = (e: MouseEvent): void => {
    e.stopPropagation?.();
    react();
  };
  bubbleEl.addEventListener("click", onBubbleClick);

  // Hook mascot entry completion to show bubble once landed
  mascot.onEntryComplete?.(() => {
    // Show bubble after landing
    show();
  });

  // Hook mascot wake-up to show bubble after sleep
  mascot.onWake?.(() => {
    show();
  });

  return {
    show,
    hide,
    react,
    isVisible: () => isShowing,
    updatePosition,
    destroy: () => {
      clearHideTimer();
      bubbleEl.removeEventListener("click", onBubbleClick);
    },
  };
}
