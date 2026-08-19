import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MockBrowserWindow } from "../components/MockBrowserWindow";
import { FrogMascot, FrogPose } from "../components/FrogMascot";
import { ClockWidget } from "../components/ClockWidget";
import { TypingText } from "../components/TypingText";
import { VirtualCursor } from "../components/VirtualCursor";
import { MusicParticles } from "../components/MusicParticles";
import type { LayoutMode } from "../types";

export interface Scene3NewTabVibeProps {
  layout: LayoutMode;
}

export const Scene3NewTabVibe: React.FC<Scene3NewTabVibeProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = layout === "portrait";

  // Coordinates
  const newTabPlusX = isPortrait ? 385 : 435;
  const newTabPlusY = isPortrait ? 78 : 64;

  // Cursor moves smoothly down from '+' button area into the center to vibe with the frog
  const cursorX = interpolate(
    frame,
    [0, 15, 45, 75],
    isPortrait
      ? [newTabPlusX, width * 0.5, width * 0.42, width * 0.58]
      : [newTabPlusX, width * 0.52, width * 0.45, width * 0.55],
    { extrapolateRight: "clamp" }
  );

  const cursorY = interpolate(
    frame,
    [0, 15, 45, 75],
    isPortrait
      ? [newTabPlusY, height * 0.45, height * 0.58, height * 0.52]
      : [newTabPlusY, height * 0.42, height * 0.55, height * 0.48],
    { extrapolateRight: "clamp" }
  );

  // Vibe head bob rhythm (swapping between vibe-sway and vibe-up every 10 frames)
  const isVibeUp = Math.floor(frame / 10) % 2 === 1;
  const vibePose: FrogPose = isVibeUp ? "vibe-up" : "vibe-sway";

  // Body scale bounce with the beat
  const beatBounce = 1 + Math.abs(Math.sin((frame / 10) * Math.PI)) * 0.06;

  // New tab content entrance
  const contentSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

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
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <MockBrowserWindow
          layout={layout}
          activeTabId="newtab2"
          url="chrome://newtab"
          theme="light"
          tabs={[
            {
              id: "youtube",
              title: "lofi hip hop radio ☕",
              icon: "▶️",
              isPlayingAudio: true,
            },
            {
              id: "newtab2",
              title: "New Tab",
              icon: "🐸",
            },
          ]}
        >
          {/* New Tab Content: Mascot already vibing with retro headphones */}
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transform: `scale(${contentSpring})`,
            }}
          >
            {/* Clock & Greeting */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isPortrait ? 10 : 16,
                marginBottom: isPortrait ? 30 : 50,
              }}
            >
              <ClockWidget style="minimal" scale={isPortrait ? 0.9 : 1.1} showSubtitle={false} />
              <div
                style={{
                  fontSize: isPortrait ? 20 : 26,
                  fontWeight: 500,
                  color: "#3F3C34",
                  letterSpacing: -0.5,
                }}
              >
                <TypingText
                  text="vibing to your tunes 🎧"
                  startFrame={10}
                  framesPerChar={2}
                />
              </div>
            </div>

            {/* Frog Mascot Vibing with Retro Headphones */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FrogMascot
                pose={vibePose}
                expression="uwu"
                size={isPortrait ? 310 : 350}
                scaleY={beatBounce}
              />

              {/* Floating Music Notes */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                }}
              >
                <MusicParticles
                  count={isPortrait ? 6 : 8}
                  originX={isPortrait ? 155 : 175}
                  originY={isPortrait ? 20 : 30}
                />
              </div>
            </div>
          </div>
        </MockBrowserWindow>

        {/* Animated Virtual Cursor */}
        <VirtualCursor
          x={cursorX}
          y={cursorY}
        />
      </div>
    </div>
  );
};
