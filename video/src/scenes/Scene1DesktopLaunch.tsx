import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MockDesktop } from "../components/MockDesktop";
import { MockBrowserWindow } from "../components/MockBrowserWindow";
import { ClockWidget } from "../components/ClockWidget";
import { TypingText } from "../components/TypingText";
import { FrogMascot } from "../components/FrogMascot";
import { VirtualCursor } from "../components/VirtualCursor";
import type { LayoutMode } from "../types";

export interface Scene1DesktopLaunchProps {
  layout: LayoutMode;
}

export const Scene1DesktopLaunch: React.FC<Scene1DesktopLaunchProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = layout === "portrait";

  // Chrome icon coordinates in the bottom Dock
  const chromeDockX = isPortrait ? 490 : 898;
  const chromeDockY = isPortrait ? 1858 : 1030;

  // Camera Zoom & Follow animation
  const zoomIn = interpolate(frame, [0, 20], [1.0, isPortrait ? 1.55 : 1.4], {
    extrapolateRight: "clamp",
  });

  const zoomOutSpring = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  // Current camera scale: zooms in, then springs smoothly back to 1.0
  const cameraScale =
    frame < 22 ? zoomIn : interpolate(zoomOutSpring, [0, 1], [isPortrait ? 1.55 : 1.4, 1.0]);

  // Cursor coordinates
  const cursorX = interpolate(
    frame,
    [0, 20, 26, 45, 75, 100, 130],
    isPortrait
      ? [width * 0.5, chromeDockX, chromeDockX, width * 0.5, width * 0.45, width * 0.65, width * 0.5]
      : [width * 0.5, chromeDockX, chromeDockX, width * 0.5, width * 0.42, width * 0.6, width * 0.52],
    { extrapolateRight: "clamp" }
  );

  const cursorY = interpolate(
    frame,
    [0, 20, 26, 45, 75, 100, 130],
    isPortrait
      ? [height * 0.6, chromeDockY, chromeDockY, height * 0.55, height * 0.62, height * 0.58, height * 0.62]
      : [height * 0.6, chromeDockY, chromeDockY, height * 0.48, height * 0.58, height * 0.52, height * 0.58],
    { extrapolateRight: "clamp" }
  );

  const isClicked = frame >= 20 && frame <= 25;
  const isChromeActive = frame >= 20;

  // Browser Window Expansion Spring
  const browserSpring =
    frame < 22
      ? 0
      : spring({
          frame: frame - 22,
          fps,
          config: { damping: 15, stiffness: 110, mass: 0.9 },
        });

  const browserOpacity = interpolate(frame, [22, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frog mascot jump animation (starts at frame 60)
  const jumpStartFrame = 60;
  const jumpElapsed = Math.max(0, frame - jumpStartFrame);

  let frogPose: "loaf" | "jump-launch" | "jump-apex" | "jump-land" = "loaf";
  let frogOffsetY = 0;
  let frogOffsetX = 0;
  let frogOpacity = 0;

  if (frame < jumpStartFrame) {
    frogOpacity = 0;
  } else if (jumpElapsed < 6) {
    frogPose = "jump-launch";
    frogOpacity = 1;
    frogOffsetY = interpolate(jumpElapsed, [0, 6], [220, 120]);
    frogOffsetX = interpolate(jumpElapsed, [0, 6], [-180, -90]);
  } else if (jumpElapsed < 14) {
    frogPose = "jump-apex";
    frogOpacity = 1;
    frogOffsetY = interpolate(jumpElapsed, [6, 14], [120, -70]);
    frogOffsetX = interpolate(jumpElapsed, [6, 14], [-90, 0]);
  } else if (jumpElapsed < 22) {
    frogPose = "jump-land";
    frogOpacity = 1;
    frogOffsetY = interpolate(jumpElapsed, [14, 22], [-70, 0]);
    frogOffsetX = 0;
  } else {
    frogPose = "loaf";
    frogOpacity = 1;
    frogOffsetY = 0;
    frogOffsetX = 0;
  }

  // Dynamic Ground Shadow calculation
  let shadowScale = 0;
  let shadowOpacity = 0;

  if (frame >= jumpStartFrame) {
    if (jumpElapsed < 6) {
      shadowOpacity = interpolate(jumpElapsed, [0, 6], [0, 0.2]);
      shadowScale = 0.6;
    } else if (jumpElapsed < 14) {
      // In air at apex
      const airRatio = Math.max(0, -frogOffsetY / 70);
      shadowScale = 1 - airRatio * 0.45;
      shadowOpacity = 0.28 * (1 - airRatio * 0.65);
    } else if (jumpElapsed < 22) {
      // Landing
      const landRatio = Math.max(0, -frogOffsetY / 70);
      shadowScale = 0.7 + (1 - landRatio) * 0.3;
      shadowOpacity = 0.28;
    } else {
      // Settled loaf
      shadowScale = 1.0;
      shadowOpacity = 0.28;
    }
  }

  // Eye look-at offset tracking cursor
  const frogCenterTargetX = width * 0.5;
  const frogCenterTargetY = isPortrait ? height * 0.65 : height * 0.62;
  const lookX = interpolate(cursorX - frogCenterTargetX, [-400, 400], [-3.5, 3.5]);
  const lookY = interpolate(cursorY - frogCenterTargetY, [-300, 300], [-3, 3]);

  // Landing impact dust particles
  const showDust = jumpElapsed >= 20 && jumpElapsed <= 34;
  const dustScale = interpolate(jumpElapsed, [20, 34], [0.3, 1.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dustOpacity = interpolate(jumpElapsed, [20, 24, 34], [0, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {/* Dynamic Camera Zoom Container (Focuses on Dock & Cursor) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraScale})`,
          transformOrigin: isPortrait ? "47% 95%" : "47% 95%",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Desktop Wallpaper & Frosted Dock */}
        <MockDesktop layout={layout} isChromeClicked={isChromeActive} />

        {/* Expanding Chrome Browser Window */}
        {frame >= 22 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isPortrait ? "24px 16px 70px" : "36px 70px 60px",
              opacity: browserOpacity,
              transform: `scale(${browserSpring}) translateY(${(1 - browserSpring) * 120}px)`,
              transformOrigin: "bottom center",
              zIndex: 10,
            }}
          >
            <MockBrowserWindow
              layout={layout}
              activeTabId="newtab"
              url="chrome://newtab"
              theme="light"
              tabs={[{ id: "newtab", title: "New Tab", icon: "🐸" }]}
            >
              {/* New Tab Content: Elevated Stage (Text & Clock in upper area, Mascot centered below) */}
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: isPortrait ? "8%" : "4%",
                  position: "relative",
                }}
              >
                {/* 1. Header Area: Greeting ON TOP + Pixel Clock BELOW */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      fontSize: isPortrait ? 22 : 28,
                      fontWeight: 400,
                      color: "#1F2421",
                      letterSpacing: "-0.01em",
                      fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    <TypingText
                      text="welcome back, friend."
                      startFrame={38}
                      framesPerChar={2}
                    />
                  </div>

                  <ClockWidget
                    style="pixel-box"
                    scale={isPortrait ? 0.9 : 1.0}
                    showSubtitle={false}
                  />
                </div>

                {/* 2. Mascot Container positioned at comfortable center/lower area */}
                <div
                  style={{
                    position: "absolute",
                    top: isPortrait ? "56%" : "60%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Ground Shadow Ellipse */}
                  {shadowOpacity > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: isPortrait ? 4 : 8,
                        width: isPortrait ? 210 : 250,
                        height: isPortrait ? 30 : 36,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(ellipse at center, rgba(18, 28, 14, 0.35) 0%, rgba(18, 28, 14, 0.1) 60%, transparent 80%)",
                        transform: `scale(${shadowScale})`,
                        opacity: shadowOpacity,
                        filter: "blur(4px)",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Mascot Sprite Body */}
                  <div
                    style={{
                      opacity: frogOpacity,
                      transform: `translate(${frogOffsetX}px, ${frogOffsetY}px)`,
                      position: "relative",
                    }}
                  >
                    <FrogMascot
                      pose={frogPose}
                      expression={frogPose === "jump-apex" ? "surprised" : "happy"}
                      size={isPortrait ? 310 : 350}
                      eyeLookAt={{ x: lookX, y: lookY }}
                    />

                    {/* Dust Puffs on landing */}
                    {showDust && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: -10,
                          left: "50%",
                          transform: `translateX(-50%) scale(${dustScale})`,
                          display: "flex",
                          gap: 160,
                          opacity: dustOpacity,
                          pointerEvents: "none",
                        }}
                      >
                        <span style={{ fontSize: 24 }}>💨</span>
                        <span style={{ fontSize: 24 }}>💨</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </MockBrowserWindow>
          </div>
        )}

        {/* Animated Virtual Cursor */}
        <VirtualCursor
          x={cursorX}
          y={cursorY}
          clickFrame={isClicked ? 21 : undefined}
        />
      </div>
    </div>
  );
};
