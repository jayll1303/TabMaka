import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FrogMascot, type FrogPose } from "../components/FrogMascot";
import { VirtualCursor } from "../components/VirtualCursor";
import { MusicParticles } from "../components/MusicParticles";
import type { LayoutMode } from "../types";

export interface Scene2InteractionsProps {
  layout: LayoutMode;
}

export const Scene2Interactions: React.FC<Scene2InteractionsProps> = ({
  layout,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = layout === "portrait";
  const frogSize = isPortrait ? 380 : 440;

  const isVibePhase = frame >= 50;

  // Header Title transitions
  const titleAOpacity = interpolate(frame, [0, 8, 42, 48], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const titleBOpacity = interpolate(frame, [50, 58], [0, 1], {
    extrapolateRight: "clamp",
  });

  const baseCenterX = width / 2;
  const baseCenterY = isPortrait ? height * 0.52 : height * 0.56;

  // Jump physics (Frames 12 - 45)
  const clickFrame = 12;
  let currentPose: FrogPose = "loaf";
  let jumpOffsetX = 0;
  let jumpOffsetY = 0;
  let flipDirection = false;

  if (frame < clickFrame) {
    currentPose = "loaf";
  } else if (frame >= clickFrame && frame < 18) {
    currentPose = "jump-crouch";
  } else if (frame >= 18 && frame < 26) {
    currentPose = "jump-launch";
    const t = (frame - 18) / 8;
    jumpOffsetX = interpolate(t, [0, 1], [0, 60]);
    jumpOffsetY = interpolate(t, [0, 1], [0, -90]);
  } else if (frame >= 26 && frame < 36) {
    currentPose = "jump-apex";
    const t = (frame - 26) / 10;
    jumpOffsetX = interpolate(t, [0, 1], [60, 120]);
    jumpOffsetY = -90 + Math.sin(t * Math.PI) * -30;
  } else if (frame >= 36 && frame < 44) {
    currentPose = "jump-land";
    jumpOffsetX = 120;
    jumpOffsetY = 0;
  } else if (!isVibePhase) {
    currentPose = "loaf";
    jumpOffsetX = 120;
  } else {
    // Vibe loop (alternates sway and up)
    const vibeCycle = Math.floor((frame - 50) / 14) % 2;
    currentPose = vibeCycle === 0 ? "vibe-sway" : "vibe-up";
    jumpOffsetX = interpolate(frame, [50, 65], [120, 0], {
      extrapolateRight: "clamp",
    });
  }

  // Cursor movements
  const cursorX = interpolate(
    frame,
    [0, clickFrame, 25, 45, 60],
    [
      baseCenterX + 160,
      baseCenterX + 40,
      baseCenterX + 180,
      baseCenterX + 160,
      width + 100,
    ],
    { extrapolateRight: "clamp" },
  );
  const cursorY = interpolate(
    frame,
    [0, clickFrame, 25, 45, 60],
    [
      baseCenterY + 120,
      baseCenterY - 20,
      baseCenterY - 120,
      baseCenterY + 40,
      height + 100,
    ],
    { extrapolateRight: "clamp" },
  );

  const frogFinalX = baseCenterX + jumpOffsetX;
  const frogFinalY = baseCenterY + jumpOffsetY;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: isVibePhase ? "#EAF0E6" : "#FAF6EE",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "background-color 0.4s ease",
      }}
    >
      {/* Header Titles */}
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
        {/* Title A: Pokes & Hops */}
        {!isVibePhase && (
          <div style={{ opacity: titleAOpacity }}>
            <span
              style={{
                fontSize: isPortrait ? 22 : 26,
                fontWeight: 700,
                color: "#679d3f",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Interactive Mascot
            </span>
            <h2
              style={{
                fontSize: isPortrait ? 52 : 64,
                fontWeight: 900,
                color: "#182415",
                margin: "4px 0 0",
              }}
            >
              Poke, Drag & Hop 💨
            </h2>
          </div>
        )}

        {/* Title B: Vibe Mode */}
        {isVibePhase && (
          <div style={{ opacity: titleBOpacity }}>
            <span
              style={{
                fontSize: isPortrait ? 22 : 26,
                fontWeight: 700,
                color: "#4e7d32",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Smart Tab Detection
            </span>
            <h2
              style={{
                fontSize: isPortrait ? 52 : 64,
                fontWeight: 900,
                color: "#182415",
                margin: "4px 0 0",
              }}
            >
              Lo-fi Headphones Vibe 🎧
            </h2>
          </div>
        )}
      </div>

      {/* Mascot */}
      <div
        style={{
          position: "absolute",
          left: frogFinalX,
          top: frogFinalY,
          transform: "translate(-50%, -50%)",
          zIndex: 5,
        }}
      >
        <FrogMascot
          pose={currentPose}
          expression={
            isVibePhase
              ? "uwu"
              : frame >= clickFrame && frame < 18
              ? "surprised"
              : frame >= 18 && frame < 26
              ? "happy"
              : frame >= 26 && frame < 36
              ? "tongue"
              : frame >= 36 && frame < 44
              ? "surprised"
              : "happy"
          }
          size={frogSize}
          flipX={flipDirection}
        />
      </div>

      {/* Floating Music Notes during Vibe */}
      {isVibePhase && (
        <MusicParticles originX={baseCenterX} originY={baseCenterY - 40} />
      )}

      {/* Virtual Cursor */}
      {frame < 55 && (
        <VirtualCursor
          x={cursorX}
          y={cursorY}
          clickFrame={clickFrame}
          label={frame >= clickFrame && frame < 30 ? "Poke!" : undefined}
        />
      )}
    </div>
  );
};
