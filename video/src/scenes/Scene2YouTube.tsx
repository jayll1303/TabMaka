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

  // Coordinates for the Address Bar and Tab Bar
  const addressBarX = isPortrait ? width * 0.48 : width * 0.44;
  const addressBarY = isPortrait ? 120 : 92;

  const newTabPlusX = isPortrait ? 385 : 435;
  const newTabPlusY = isPortrait ? 78 : 64;

  // Camera Zoom on Address Bar during URL navigation (Frames 0 - 24)
  const navZoomIn = interpolate(frame, [0, 14], [1.0, isPortrait ? 1.25 : 1.18], {
    extrapolateRight: "clamp",
  });

  const navZoomOutSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cameraScale =
    frame < 18 ? navZoomIn : interpolate(navZoomOutSpring, [0, 1], [isPortrait ? 1.25 : 1.18, 1.0]);

  // Dynamic Cursor movements:
  // 1. Move to Address Bar (0 - 15), click/type at 16
  // 2. Float around video while music plays (25 - 60)
  // 3. Move to `+` (New Tab) button (60 - 80), click at 80
  const cursorX = interpolate(
    frame,
    [0, 15, 25, 45, 60, 78, 88],
    isPortrait
      ? [width * 0.5, addressBarX, addressBarX, width * 0.5, width * 0.45, newTabPlusX, newTabPlusX]
      : [width * 0.52, addressBarX, addressBarX, width * 0.6, width * 0.55, newTabPlusX, newTabPlusX],
    { extrapolateRight: "clamp" }
  );

  const cursorY = interpolate(
    frame,
    [0, 15, 25, 45, 60, 78, 88],
    isPortrait
      ? [height * 0.6, addressBarY, addressBarY, height * 0.5, height * 0.35, newTabPlusY, newTabPlusY]
      : [height * 0.55, addressBarY, addressBarY, height * 0.5, height * 0.35, newTabPlusY, newTabPlusY],
    { extrapolateRight: "clamp" }
  );

  const isNavClick = frame >= 14 && frame <= 19;
  const isPlusClicked = frame >= 76 && frame <= 83;

  // Page state: 'newtab' before frame 20, 'youtube' from frame 20 onwards
  const isYouTubeLoaded = frame >= 20;

  // Dynamic Browser Tabs definition
  const tabs: BrowserTab[] = isYouTubeLoaded
    ? [
        {
          id: "youtube",
          title: "lofi hip hop radio ☕",
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

  const currentUrl =
    frame < 6
      ? "chrome://newtab"
      : frame < 20
      ? "youtube.com/lofi-hip-hop"
      : "https://youtube.com/watch?v=jfKfPfyJRdk";

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
          transform: `scale(${cameraScale})`,
          transformOrigin: isPortrait ? "50% 12%" : "50% 10%",
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
            /* YouTube Lo-Fi Player View */
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
                opacity: interpolate(frame, [14, 20], [1, 0]),
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
          clickFrame={isNavClick ? 16 : isPlusClicked ? 78 : undefined}
        />
      </div>
    </div>
  );
};
