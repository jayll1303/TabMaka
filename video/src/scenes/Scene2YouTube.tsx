import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MockBrowserWindow, BrowserTab } from "../components/MockBrowserWindow";
import { YouTubeMockup } from "../components/YouTubeMockup";
import { VirtualCursor } from "../components/VirtualCursor";
import { TypingText } from "../components/TypingText";
import { ClockWidget } from "../components/ClockWidget";
import { FrogMascot } from "../components/FrogMascot";
import type { LayoutMode } from "../types";

export interface Scene2YouTubeProps {
  layout: LayoutMode;
}

export const Scene2YouTube: React.FC<Scene2YouTubeProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = layout === "portrait";

  // Rickroll easter egg URL
  const targetUrl = "https://youtu.be/dQw4w9WgXcQ?si=PrklYN1pskm0CBAc";

  // Coordinates for the Address Bar and Tab Bar
  const addressBarX = isPortrait ? width * 0.48 : width * 0.44;
  const addressBarY = isPortrait ? 120 : 92;

  const newTabPlusX = isPortrait ? 385 : 435;
  const newTabPlusY = isPortrait ? 78 : 64;

  // Smooth, gradual Camera Zoom on Address Bar during URL navigation
  // Zoom in from frame 0 to 20, stay zoomed while typing, then zoom out from frame 56 to 78
  const maxZoom = isPortrait ? 1.25 : 1.2;
  const cameraScale =
    frame <= 20
      ? interpolate(frame, [0, 20], [1.0, maxZoom], { extrapolateRight: "clamp" })
      : frame <= 56
      ? maxZoom
      : interpolate(frame, [56, 78], [maxZoom, 1.0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Dynamic Cursor movements:
  // 1. Move to Address Bar (0 - 18), click at 19
  // 2. Stay near address bar while URL types (20 - 54)
  // 3. Glide across video while music plays (56 - 82)
  // 4. Move to `+` (New Tab) button (82 - 96), click at 96
  const cursorX = interpolate(
    frame,
    [0, 18, 54, 75, 96, 104],
    isPortrait
      ? [width * 0.5, addressBarX, addressBarX, width * 0.5, newTabPlusX, newTabPlusX]
      : [width * 0.52, addressBarX, addressBarX, width * 0.6, newTabPlusX, newTabPlusX],
    { extrapolateRight: "clamp" }
  );

  const cursorY = interpolate(
    frame,
    [0, 18, 54, 75, 96, 104],
    isPortrait
      ? [height * 0.6, addressBarY, addressBarY, height * 0.5, newTabPlusY, newTabPlusY]
      : [height * 0.55, addressBarY, addressBarY, height * 0.5, newTabPlusY, newTabPlusY],
    { extrapolateRight: "clamp" }
  );

  const isNavClick = frame >= 17 && frame <= 22;
  const isPlusClicked = frame >= 94 && frame <= 100;

  // Page state: 'newtab' before frame 58, 'youtube' from frame 58 onwards
  const isYouTubeLoaded = frame >= 58;

  // URL typing effect
  let currentUrl = "chrome://newtab";
  if (frame >= 20 && frame < 56) {
    const charsCount = Math.min(
      targetUrl.length,
      Math.floor((frame - 20) * 1.4)
    );
    const cursorBlink = Math.floor(frame / 6) % 2 === 0 ? "|" : "";
    currentUrl = targetUrl.slice(0, charsCount) + cursorBlink;
  } else if (frame >= 56) {
    currentUrl = targetUrl;
  }

  // Dynamic Browser Tabs definition
  const tabs: BrowserTab[] = isYouTubeLoaded
    ? [
        {
          id: "youtube",
          title: "Rick Astley - Never Gonna Give You Up 🎵",
          icon: "▶️",
          isPlayingAudio: true,
        },
      ]
    : [
        {
          id: "newtab",
          title: "New Tab",
          icon: "🐸",
        },
      ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FAF6EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isPortrait ? "24px 16px 70px" : "36px 70px 60px",
        overflow: "hidden",
      }}
    >
      {/* Camera Zoom Container focused on address bar / window */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${cameraScale}) translateY(${(cameraScale - 1.0) * 160}px)`,
          transformOrigin: "center top",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <MockBrowserWindow
          layout={layout}
          activeTabId={isYouTubeLoaded ? "youtube" : "newtab"}
          url={currentUrl}
          theme={isYouTubeLoaded ? "dark" : "light"}
          tabs={tabs}
          isPlusClicked={isPlusClicked}
        >
          {isYouTubeLoaded ? (
            /* YouTube Player View */
            <YouTubeMockup layout={layout} />
          ) : (
            /* New Tab transitioning out */
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: interpolate(frame, [54, 58], [1, 0]),
              }}
            >
              <ClockWidget style="minimal" scale={isPortrait ? 0.9 : 1.1} showSubtitle={false} />
              <div style={{ marginTop: 16, marginBottom: 40, fontSize: 24, color: "#3F3C34" }}>
                <TypingText text="welcome back, friend." startFrame={0} framesPerChar={1} showCursor={false} />
              </div>
              <FrogMascot pose="loaf" expression="happy" size={isPortrait ? 300 : 340} />
            </div>
          )}
        </MockBrowserWindow>

        {/* Animated Virtual Cursor */}
        <VirtualCursor
          x={cursorX}
          y={cursorY}
          clickFrame={isNavClick ? 19 : isPlusClicked ? 96 : undefined}
        />
      </div>
    </div>
  );
};
