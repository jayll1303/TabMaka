import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FrogMascot } from "../components/FrogMascot";
import { VirtualCursor } from "../components/VirtualCursor";
import type { LayoutMode } from "../types";

export interface Scene1HookProps {
  layout: LayoutMode;
}

export const Scene1Hook: React.FC<Scene1HookProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = layout === "portrait";

  // Text 1: "Tired of boring new tabs?" (Frames 0 - 45)
  // Text 2: "Meet TabMaka 🐸" (Frames 45 - 90)
  const title1Opacity = interpolate(frame, [0, 10, 38, 48], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const title1Y = interpolate(frame, [0, 15], [30, 0], {
    extrapolateRight: "clamp",
  });

  const title2Scale = spring({
    frame: Math.max(0, frame - 42),
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const title2Opacity = interpolate(frame, [42, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Frog entrance scale (springs in at frame 25)
  const frogSpring = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Virtual cursor path: sweeping in from bottom right and circling around frog
  const cursorProgress = interpolate(frame, [15, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const frogCenterX = width / 2;
  const frogCenterY = isPortrait ? height * 0.52 : height * 0.56;

  const cursorX = interpolate(
    cursorProgress,
    [0, 0.4, 0.7, 1],
    [width * 0.85, frogCenterX + 180, frogCenterX - 140, frogCenterX + 80],
  );
  const cursorY = interpolate(
    cursorProgress,
    [0, 0.4, 0.7, 1],
    [height * 0.85, frogCenterY - 120, frogCenterY - 60, frogCenterY + 40],
  );

  // Eye gaze direction relative to frog
  const lookAtX = (cursorX - frogCenterX) / 300;
  const lookAtY = (cursorY - frogCenterY) / 300;

  // Natural blink around frame 65
  const isBlinking = frame >= 62 && frame <= 70;

  const frogSize = isPortrait ? 380 : 440;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FAF6EE",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background ambient decorative circles */}
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 600 : 900,
          height: isPortrait ? 600 : 900,
          borderRadius: "50%",
          backgroundColor: "rgba(225, 238, 218, 0.5)",
          filter: "blur(60px)",
          transform: `scale(${interpolate(frame, [0, 90], [0.8, 1.1])})`,
        }}
      />

      {/* Top Titles */}
      <div
        style={{
          position: "absolute",
          top: isPortrait ? "14%" : "12%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        {/* Title 1 */}
        {frame < 50 && (
          <h2
            style={{
              fontSize: isPortrait ? 44 : 52,
              fontWeight: 800,
              color: "#3a4439",
              letterSpacing: -1,
              opacity: title1Opacity,
              transform: `translateY(${title1Y}px)`,
              margin: 0,
            }}
          >
            Tired of boring, sterile new tabs?
          </h2>
        )}

        {/* Title 2 */}
        {frame >= 40 && (
          <div
            style={{
              opacity: title2Opacity,
              transform: `scale(${title2Scale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: isPortrait ? 24 : 28,
                fontWeight: 700,
                color: "#679d3f",
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              Meet Your New Companion
            </span>
            <h1
              style={{
                fontSize: isPortrait ? 68 : 82,
                fontWeight: 900,
                color: "#182415",
                letterSpacing: -2,
                margin: 0,
              }}
            >
              TabMaka <span style={{ color: "#82c355" }}>🐸</span>
            </h1>
          </div>
        )}
      </div>

      {/* Mascot Container */}
      <div
        style={{
          position: "absolute",
          left: frogCenterX,
          top: frogCenterY,
          transform: `translate(-50%, -50%) scale(${frogSpring})`,
          zIndex: 5,
        }}
      >
        <FrogMascot
          pose="loaf"
          expression={frame > 45 ? "happy" : "normal"}
          isBlinking={isBlinking}
          eyeLookAt={{ x: lookAtX, y: lookAtY }}
          size={frogSize}
        />
      </div>

      {/* Virtual Cursor */}
      {frame >= 15 && <VirtualCursor x={cursorX} y={cursorY} />}
    </div>
  );
};
