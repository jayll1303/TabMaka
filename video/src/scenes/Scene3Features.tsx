import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ClockWidget, type ClockStyle } from "../components/ClockWidget";
import { FrogMascot } from "../components/FrogMascot";
import { Badges, type BadgeItem } from "../components/Badges";
import type { LayoutMode } from "../types";

export interface Scene3FeaturesProps {
  layout: LayoutMode;
}

export const Scene3Features: React.FC<Scene3FeaturesProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = layout === "portrait";

  // Cycle clock styles and background colors
  // 0 - 25: Minimal on Cream (#FAF6EE)
  // 25 - 50: Pixel Box on Matcha (#EAF0E6)
  // 50 - 70: Cozy Hand on Lavender (#EDE8F5)
  // 70 - 90: Analog on Dark (#0F1117)
  let currentClockStyle: ClockStyle = "minimal";
  let bgColor = "#FAF6EE";
  let isDark = false;

  if (frame < 25) {
    currentClockStyle = "minimal";
    bgColor = "#FAF6EE";
  } else if (frame < 50) {
    currentClockStyle = "pixel-box";
    bgColor = "#EAF0E6";
  } else if (frame < 70) {
    currentClockStyle = "cozy-hand";
    bgColor = "#EDE8F5";
  } else {
    currentClockStyle = "analog-round";
    bgColor = "#0F1117";
    isDark = true;
  }

  // Badges to display
  const badgeItems: BadgeItem[] = [
    { icon: "🔒", label: "100% Local", delay: 10 },
    { icon: "⚡", label: "~0% Idle CPU", delay: 20 },
    { icon: "🛡️", label: "Zero Tracking", delay: 30 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isPortrait ? "100px 40px" : "60px 80px",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Top Heading */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: isPortrait ? 22 : 26,
            fontWeight: 700,
            color: isDark ? "#82c355" : "#5d8a39",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          Cozy & Minimal
        </span>
        <h2
          style={{
            fontSize: isPortrait ? 52 : 64,
            fontWeight: 900,
            color: isDark ? "#ffffff" : "#182415",
            margin: "4px 0 0",
          }}
        >
          Curated Clocks & Pastel Themes
        </h2>
      </div>

      {/* Center Showcase: Clock + Companion */}
      <div
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: isPortrait ? 30 : 70,
          zIndex: 5,
          margin: "auto 0",
        }}
      >
        {/* Clock Component */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 260,
          }}
        >
          <ClockWidget
            style={currentClockStyle}
            timeString="10:24"
            scale={isPortrait ? 1.1 : 1.3}
            dark={isDark}
            hourAngle={312 + frame * 0.8}
            minuteAngle={144 + frame * 4}
          />
        </div>

        {/* Cozy Mascot Loaf */}
        <FrogMascot
          pose="loaf"
          expression="happy"
          size={isPortrait ? 300 : 340}
        />
      </div>

      {/* Bottom Privacy Badges */}
      <div style={{ zIndex: 10, width: "100%" }}>
        <Badges items={badgeItems} dark={isDark} />
      </div>
    </div>
  );
};
