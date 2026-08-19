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
              title: "Rick Astley - Never Gonna Give You Up 🎵",
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
          {/* New Tab Content: Elevated Stage with matching pixel-box clock & headphones vibe */}
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: isPortrait ? "8%" : "4%",
              position: "relative",
              transform: `scale(${contentSpring})`,
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
                  text="vibing to your tunes 🎧"
                  startFrame={8}
                  framesPerChar={2}
                />
              </div>

              <ClockWidget
                style="pixel-box"
                scale={isPortrait ? 0.9 : 1.0}
                showSubtitle={false}
              />
            </div>

            {/* 2. Frog Mascot Vibing with Retro Headphones & Ground Shadow */}
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
              {/* Ground Shadow */}
              <div
                style={{
                  position: "absolute",
                  bottom: isPortrait ? 4 : 8,
                  width: isPortrait ? 210 : 250,
                  height: isPortrait ? 30 : 36,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse at center, rgba(18, 28, 14, 0.35) 0%, rgba(18, 28, 14, 0.1) 60%, transparent 80%)",
                  transform: `scale(${1 + (beatBounce - 1) * 0.5})`,
                  opacity: 0.28,
                  filter: "blur(4px)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative" }}>
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
