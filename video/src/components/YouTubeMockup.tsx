import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface YouTubeMockupProps {
  layout?: "landscape" | "portrait";
}

export const YouTubeMockup: React.FC<YouTubeMockupProps> = ({
  layout = "landscape",
}) => {
  const frame = useCurrentFrame();
  const isPortrait = layout === "portrait";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0F0F0F",
        color: "#F1F1F1",
        display: "flex",
        flexDirection: isPortrait ? "column" : "row",
        padding: isPortrait ? 16 : 24,
        gap: isPortrait ? 16 : 24,
        fontFamily:
          'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Video Player Main Area */}
      <div
        style={{
          flex: isPortrait ? "none" : 3,
          height: isPortrait ? "55%" : "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Video Canvas Container */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#181818",
            borderRadius: 14,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #1f1a2e 0%, #111d28 50%, #1e2920 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* Animated Ambient Lo-fi Glows */}
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 170, 80, 0.15)",
              filter: "blur(60px)",
              top: "20%",
              left: "30%",
              transform: `scale(${1 + Math.sin(frame * 0.1) * 0.1})`,
            }}
          />

          {/* Cozy Illustration Mockup (Desk, Coffee, Music) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              zIndex: 2,
            }}
          >
            {/* Center Headphones & Radio Icon */}
            <div
              style={{
                fontSize: isPortrait ? 56 : 72,
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
                transform: `translateY(${Math.sin(frame * 0.15) * 4}px)`,
              }}
            >
              🎧☕🌙
            </div>

            {/* LIVE Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#CC0000",
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                }}
              />
              LIVE
            </div>

            {/* Equalizer Wave Visualizer */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 36,
                marginTop: 8,
              }}
            >
              {[18, 28, 35, 22, 34, 15, 30, 26, 32, 20, 36, 24].map((maxH, idx) => {
                const waveHeight = interpolate(
                  Math.sin(frame * 0.25 + idx * 0.7),
                  [-1, 1],
                  [6, maxH]
                );
                return (
                  <div
                    key={idx}
                    style={{
                      width: 5,
                      height: waveHeight,
                      backgroundColor: "#82C355",
                      borderRadius: 3,
                      boxShadow: "0 0 8px rgba(130, 195, 85, 0.4)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Video Controls Overlay Bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "10px 16px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
              zIndex: 3,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ cursor: "pointer" }}>⏸</span>
              <span style={{ cursor: "pointer" }}>🔊</span>
              <span style={{ color: "#AAAAAA", fontSize: 12 }}>
                12,450 watching now
              </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <span>⚙️</span>
              <span>⛶</span>
            </div>
          </div>
        </div>

        {/* Video Info Header */}
        <div>
          <h2
            style={{
              fontSize: isPortrait ? 15 : 18,
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            lofi hip hop radio ☕ - beats to relax/study to
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 6,
              color: "#AAAAAA",
              fontSize: isPortrait ? 12 : 13,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "#E58E26",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              L
            </div>
            <span style={{ fontWeight: 600, color: "#FFFFFF" }}>Lofi Girl</span>
            <span style={{ fontSize: 11 }}>✓</span>
            <span
              style={{
                backgroundColor: "#FFFFFF",
                color: "#0F0F0F",
                padding: "4px 12px",
                borderRadius: 16,
                fontWeight: 600,
                fontSize: 12,
                marginLeft: "auto",
              }}
            >
              Subscribe
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Video / Chat Sidebar (Desktop Only) */}
      {!isPortrait && (
        <div
          style={{
            flex: 1,
            backgroundColor: "#181818",
            borderRadius: 14,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              borderBottom: "1px solid #282828",
              paddingBottom: 8,
            }}
          >
            Top Chat 💬
          </div>
          {[
            { user: "Alex", text: "this music helps me focus so much ☕" },
            { user: "Maya", text: "studying for finals with you all ✨" },
            { user: "Dev_Sam", text: "coding late tonight! 🐸" },
            { user: "Ken", text: "lofi vibes always" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                display: "flex",
                gap: 8,
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: "#AAAAAA", fontWeight: 600 }}>
                {item.user}:
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
