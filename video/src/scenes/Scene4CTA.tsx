import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FrogMascot } from "../components/FrogMascot";
import type { LayoutMode } from "../types";

export interface Scene4CTAProps {
  layout: LayoutMode;
}

export const Scene4CTA: React.FC<Scene4CTAProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = layout === "portrait";

  // Spring entrance for main title and mascot
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const buttonSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Pulse animation on the CTA button
  const pulse = Math.sin(frame * 0.15) * 0.03;

  // Floating heart icon from mascot
  const heartProgress = interpolate(frame, [20, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heartY = -heartProgress * 80;
  const heartOpacity = Math.sin(heartProgress * Math.PI);

  const frogSize = isPortrait ? 300 : 360;

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
        padding: isPortrait ? "60px 40px" : "40px 60px",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background Soft Glow */}
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 700 : 1000,
          height: isPortrait ? 700 : 1000,
          borderRadius: "50%",
          backgroundColor: "rgba(130, 195, 85, 0.22)",
          filter: "blur(80px)",
          transform: `scale(${1 + pulse * 2})`,
        }}
      />

      {/* Main Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: isPortrait ? 18 : 16,
          zIndex: 10,
        }}
      >
        {/* Mascot Center with Winking/Kiss Expression */}
        <div
          style={{
            position: "relative",
            transform: `scale(${logoScale})`,
          }}
        >
          <FrogMascot
            pose="loaf"
            expression={frame > 20 ? "kiss" : "happy"}
            size={frogSize}
          />

          {/* Floating Heart */}
          {heartOpacity > 0 && (
            <div
              style={{
                position: "absolute",
                right: "28%",
                top: "20%",
                fontSize: 42,
                opacity: heartOpacity,
                transform: `translateY(${heartY}px) scale(${1 + heartProgress * 0.4})`,
                filter: "drop-shadow(0 2px 8px rgba(255,100,120,0.3))",
              }}
            >
              💖
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ transform: `scale(${logoScale})` }}>
          <h1
            style={{
              fontSize: isPortrait ? 68 : 84,
              fontWeight: 900,
              color: "#182415",
              letterSpacing: -2,
              margin: 0,
              lineHeight: 1,
            }}
          >
            TabMaka
          </h1>
          <p
            style={{
              fontSize: isPortrait ? 24 : 28,
              fontWeight: 600,
              color: "#556b50",
              margin: "10px 0 0",
            }}
          >
            Your Cozy Browser Companion
          </p>
        </div>

        {/* Big CTA Button */}
        <div
          style={{
            transform: `scale(${buttonSpring * (1 + pulse)})`,
            marginTop: isPortrait ? 20 : 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              backgroundColor: "#82c355",
              color: "#ffffff",
              padding: isPortrait ? "20px 42px" : "18px 48px",
              borderRadius: 50,
              fontSize: isPortrait ? 28 : 30,
              fontWeight: 800,
              boxShadow: "0 12px 32px rgba(130, 195, 85, 0.4)",
              border: "3px solid #6fa847",
              letterSpacing: 0.5,
            }}
          >
            <span>✨</span>
            <span>Add to Chrome & Edge - Free</span>
          </div>
        </div>

        {/* Footer Subtext */}
        <div
          style={{
            fontSize: isPortrait ? 18 : 20,
            fontWeight: 600,
            color: "rgba(30, 45, 25, 0.6)",
            marginTop: 8,
          }}
        >
          100% Local • No Tracking • Open Source MIT
        </div>
      </div>
    </div>
  );
};
