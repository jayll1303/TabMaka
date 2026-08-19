import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FrogMascot } from "../components/FrogMascot";
import { ChromeLogo } from "../components/ChromeLogo";
import type { LayoutMode } from "../types";

export interface Scene4CTAProps {
  layout: LayoutMode;
}

export const Scene4CTA: React.FC<Scene4CTAProps> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isPortrait = layout === "portrait";

  // Spring entrance for Mascot & Content
  const mascotSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const contentSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const buttonSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  // Pulse animation on the CTA button
  const pulse = Math.sin(frame * 0.18) * 0.03;

  // Floating heart icon from mascot
  const heartProgress = interpolate(frame, [15, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heartY = -heartProgress * 70;
  const heartOpacity = Math.sin(heartProgress * Math.PI);

  const frogSize = isPortrait ? 290 : 340;

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
        padding: isPortrait ? "40px 24px" : "30px 60px",
        overflow: "hidden",
        fontFamily:
          "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background Soft Ambient Green & Warm Radiant Glow */}
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 600 : 900,
          height: isPortrait ? 600 : 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(130, 195, 85, 0.28) 0%, rgba(245, 235, 215, 0.15) 50%, transparent 75%)",
          filter: "blur(70px)",
          transform: `scale(${1 + pulse * 1.5})`,
          pointerEvents: "none",
        }}
      />

      {/* Main Clean Spotlight Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: isPortrait ? 20 : 18,
          zIndex: 10,
          maxWidth: isPortrait ? 520 : 800,
        }}
      >
        {/* Mascot Center (Winking / Kissing) */}
        <div
          style={{
            position: "relative",
            transform: `scale(${mascotSpring})`,
            filter: "drop-shadow(0 16px 32px rgba(30, 50, 20, 0.12))",
          }}
        >
          <FrogMascot
            pose="loaf"
            expression={frame > 18 ? "kiss" : "happy"}
            size={frogSize}
          />

          {/* Floating Heart */}
          {heartOpacity > 0 && (
            <div
              style={{
                position: "absolute",
                right: "12%",
                top: "2%",
                fontSize: isPortrait ? 38 : 46,
                opacity: heartOpacity,
                transform: `translateY(${heartY}px) scale(${1 + heartProgress * 0.4})`,
                filter: "drop-shadow(0 4px 12px rgba(255,80,110,0.35))",
              }}
            >
              💖
            </div>
          )}
        </div>

        {/* Brand Title & Headline */}
        <div
          style={{
            transform: `scale(${contentSpring})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <h1
            style={{
              fontSize: isPortrait ? 64 : 76,
              fontWeight: 900,
              color: "#182415",
              letterSpacing: -2,
              margin: 0,
              lineHeight: 1,
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            }}
          >
            TabMaka
          </h1>
          <p
            style={{
              fontSize: isPortrait ? 22 : 26,
              fontWeight: 600,
              color: "#526B4A",
              margin: 0,
              letterSpacing: -0.3,
            }}
          >
            Your Cozy Browser Companion
          </p>
        </div>

        {/* Highlighted Big CTA Button */}
        <div
          style={{
            transform: `scale(${buttonSpring * (1 + pulse)})`,
            marginTop: isPortrait ? 12 : 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "linear-gradient(135deg, #6FB33F 0%, #559628 100%)",
              color: "#FFFFFF",
              padding: isPortrait ? "18px 36px" : "18px 44px",
              borderRadius: 50,
              fontSize: isPortrait ? 24 : 27,
              fontWeight: 800,
              boxShadow:
                "0 14px 36px rgba(100, 175, 50, 0.45), 0 2px 4px rgba(0,0,0,0.1)",
              border: "2px solid rgba(255, 255, 255, 0.35)",
              letterSpacing: -0.2,
            }}
          >
            <ChromeLogo size={isPortrait ? 28 : 32} />
            <span>Add to Chrome — It's Free</span>
          </div>
        </div>


      </div>
    </div>
  );
};
