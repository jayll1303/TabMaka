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

  // 80s Synthwave Beat Animation timings
  const _beat = Math.sin(frame * 0.45);
  const danceSway = Math.sin(frame * 0.35) * 12;
  const armSwing = Math.cos(frame * 0.35) * 18;
  const headBob = Math.abs(Math.sin(frame * 0.45)) * 6;

  // Disco / Stage Lights oscillation
  const light1X = 30 + Math.sin(frame * 0.1) * 25;
  const light2X = 70 + Math.cos(frame * 0.12) * 25;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0F0F0F",
        color: "#F1F1F1",
        display: "flex",
        flexDirection: isPortrait ? "column" : "row",
        padding: isPortrait ? "16px 16px 20px" : 20,
        gap: isPortrait ? 12 : 20,
        fontFamily:
          "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Video Player Main Area */}
      <div
        style={{
          flex: isPortrait ? "none" : 3,
          width: isPortrait ? "100%" : undefined,
          height: isPortrait ? "66%" : "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Video Stage Canvas */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#0c0a14",
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(180deg, #120d24 0%, #1e1335 55%, #110d1f 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          {/* 80s Retro Spotlight Beams */}
          <div
            style={{
              position: "absolute",
              top: -50,
              left: `${light1X}%`,
              width: 140,
              height: "140%",
              background:
                "linear-gradient(180deg, rgba(255, 64, 129, 0.35) 0%, rgba(255, 64, 129, 0.02) 80%, transparent 100%)",
              transform: `rotate(${Math.sin(frame * 0.08) * 15}deg)`,
              transformOrigin: "top center",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -50,
              left: `${light2X}%`,
              width: 150,
              height: "140%",
              background:
                "linear-gradient(180deg, rgba(0, 229, 255, 0.35) 0%, rgba(0, 229, 255, 0.02) 80%, transparent 100%)",
              transform: `rotate(${-Math.cos(frame * 0.09) * 15}deg)`,
              transformOrigin: "top center",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />

          {/* 80s Grid Horizon Floor */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: 0,
              right: 0,
              height: "35%",
              background:
                "linear-gradient(to top, rgba(255, 64, 129, 0.15), transparent)",
              borderTop: "1px solid rgba(255, 64, 129, 0.3)",
              pointerEvents: "none",
            }}
          />

          {/* Dancing Rick Astley Vector / Silhouette Animation */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 5,
              transform: `translate(${danceSway}px, ${-headBob}px)`,
            }}
          >
            {/* Animated Musical Notes Floating Around */}
            <div
              style={{
                position: "absolute",
                top: -30,
                fontSize: 22,
                color: "#FFD600",
                transform: `translate(${Math.sin(frame * 0.2) * 40}px, ${-Math.abs(Math.sin(frame * 0.3)) * 25}px)`,
                textShadow: "0 0 10px rgba(255, 214, 0, 0.8)",
              }}
            >
              🎵 Never gonna give you up 🎶
            </div>

            {/* Rick Astley Character SVG (Iconic trenchcoat, quiff hair & microphone) */}
            <svg
              width={isPortrait ? "220" : "160"}
              height={isPortrait ? "275" : "200"}
              viewBox="0 0 160 200"
              style={{
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
              }}
            >
              {/* Retro Quiff Red/Brown Hair */}
              <path
                d="M 60 40 Q 80 15 105 35 Q 115 48 100 55 Q 85 52 65 50 Z"
                fill="#B85D26"
                stroke="#421C06"
                strokeWidth="3"
              />
              {/* Head / Face */}
              <circle cx="80" cy="52" r="18" fill="#FAD0AE" stroke="#2B150A" strokeWidth="2.5" />
              {/* Cool 80s Sunglasses */}
              <rect x="68" y="46" width="10" height="7" rx="2" fill="#111111" />
              <rect x="82" y="46" width="10" height="7" rx="2" fill="#111111" />
              <line x1="78" y1="49" x2="82" y2="49" stroke="#111111" strokeWidth="2" />
              {/* Smile */}
              <path d="M 74 60 Q 80 66 86 60" fill="none" stroke="#2B150A" strokeWidth="2" strokeLinecap="round" />

              {/* Iconic Trench Coat / Collar */}
              <path
                d="M 52 75 L 80 90 L 108 75 L 120 145 L 40 145 Z"
                fill="#E2D4B7"
                stroke="#2B261D"
                strokeWidth="3"
              />
              {/* Polo Shirt Inner */}
              <polygon points="72,75 88,75 80,95" fill="#182A45" />

              {/* Left Arm (holding microphone) */}
              <path
                d={`M 52 80 Q ${40 + armSwing} 100 ${58 + armSwing * 0.5} 85`}
                fill="none"
                stroke="#E2D4B7"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Microphone */}
              <line
                x1={58 + armSwing * 0.5}
                y1={85}
                x2={60 + armSwing * 0.5}
                y2={72}
                stroke="#888888"
                strokeWidth="4"
              />
              <circle cx={60 + armSwing * 0.5} cy={70} r="5" fill="#CCCCCC" />

              {/* Right Arm (grooving / swinging side to side) */}
              <path
                d={`M 108 80 Q ${125 - armSwing} 100 ${110 - armSwing * 0.6} 120`}
                fill="none"
                stroke="#E2D4B7"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Dark Slacks Legs */}
              <rect x="58" y="145" width="18" height="42" fill="#1E232A" rx="3" />
              <rect x="84" y="145" width="18" height="42" fill="#1E232A" rx="3" />
              {/* Shoes */}
              <ellipse cx="65" cy="188" rx="12" ry="6" fill="#111111" />
              <ellipse cx="95" cy="188" rx="12" ry="6" fill="#111111" />
            </svg>

            {/* Audio Equalizer dancing to the beat */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 24,
                marginTop: 2,
              }}
            >
              {[14, 22, 28, 18, 26, 12, 24, 20, 26, 16, 28, 18].map((maxH, idx) => {
                const h = interpolate(
                  Math.sin(frame * 0.35 + idx * 0.8),
                  [-1, 1],
                  [4, maxH]
                );
                return (
                  <div
                    key={idx}
                    style={{
                      width: 4,
                      height: h,
                      background: "linear-gradient(to top, #FF4081, #FFD600)",
                      borderRadius: 2,
                      boxShadow: "0 0 6px rgba(255, 64, 129, 0.6)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* YouTube Video Controls Bottom Bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "8px 14px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 12,
              zIndex: 10,
            }}
          >
            {/* Red Scrubbing Progress Bar */}
            <div
              style={{
                width: "100%",
                height: 4,
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: 2,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${interpolate(frame, [0, 105], [25, 45])}%`,
                  height: "100%",
                  backgroundColor: "#FF0000",
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -4,
                    top: -3,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#FF0000",
                  }}
                />
              </div>
            </div>

            {/* Controls items */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ cursor: "pointer", fontSize: 13 }}>⏸</span>
                <span style={{ cursor: "pointer", fontSize: 13 }}>🔊</span>
                <span style={{ color: "#AAAAAA", fontSize: 11, fontWeight: 500 }}>
                  0:48 / 3:33
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
                <span>HD</span>
                <span>⚙️</span>
                <span>⛶</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info Header */}
        <div>
          <h2
            style={{
              fontSize: isPortrait ? 20 : 17,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              color: "#FFFFFF",
            }}
          >
            {isPortrait
              ? "Now playing · Never Gonna Give You Up"
              : "Rick Astley - Never Gonna Give You Up (Official Music Video)"}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 6,
              color: "#AAAAAA",
              fontSize: 13,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "#B85D26",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              RA
            </div>
            <span style={{ fontWeight: 600, color: "#FFFFFF" }}>Rick Astley</span>
            <span style={{ fontSize: 11, color: "#AAAAAA" }}>♪ 1.5B views</span>
            <span
              style={{
                backgroundColor: "#CC0000",
                color: "#FFFFFF",
                padding: "3px 12px",
                borderRadius: 16,
                fontWeight: 600,
                fontSize: 11,
                marginLeft: "auto",
                display: isPortrait ? "none" : undefined,
              }}
            >
              Subscribe
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Video / Live Chat Sidebar (Desktop Only) */}
      {!isPortrait && (
        <div
          style={{
            flex: 1,
            backgroundColor: "#181818",
            borderRadius: 12,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              borderBottom: "1px solid #282828",
              paddingBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Top Live Chat 💬</span>
            <span style={{ color: "#82C355", fontSize: 11 }}>● Live</span>
          </div>
          {[
            { user: "RickRollLegend", text: "Never gonna give you up! 🕺✨" },
            { user: "MusicFan2026", text: "Classic timeless masterpiece 🔥" },
            { user: "TabMaka_User", text: "Best cozy pet extension 🐸" },
            { user: "CodeVibe", text: "Coding with Rick Astley = 10x 🎧" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 11,
                display: "flex",
                gap: 6,
                lineHeight: 1.35,
              }}
            >
              <span style={{ color: "#AAAAAA", fontWeight: 600 }}>
                {item.user}:
              </span>
              <span style={{ color: "#E0E0E0" }}>{item.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
