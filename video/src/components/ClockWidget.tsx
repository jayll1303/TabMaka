import React from "react";

export type ClockStyle = "minimal" | "pixel-box" | "cozy-hand" | "analog-round";

export interface ClockWidgetProps {
  style?: ClockStyle;
  timeString?: string;
  hourAngle?: number;
  minuteAngle?: number;
  scale?: number;
  dark?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  style = "minimal",
  timeString = "10:24",
  hourAngle = 312,
  minuteAngle = 144,
  scale = 1,
  dark = false,
  showSubtitle = false,
  subtitle = "Good morning, friend ✨",
}) => {
  const textColor = dark ? "#f0f2f5" : "#1f2421";
  const mutedColor = dark ? "rgba(240,242,245,0.6)" : "rgba(31,36,33,0.6)";

  if (style === "analog-round") {
    return (
      <div
        style={{
          transform: `scale(${scale})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="130"
          height="130"
          style={{
            filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.08))",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill={dark ? "#1a1f2c" : "#ffffff"}
            stroke={dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}
            strokeWidth="3"
          />
          {/* Main 12, 3, 6, 9 ticks */}
          <circle cx="50" cy="12" r="2.5" fill={textColor} />
          <circle cx="88" cy="50" r="2.5" fill={textColor} />
          <circle cx="50" cy="88" r="2.5" fill={textColor} />
          <circle cx="12" cy="50" r="2.5" fill={textColor} />

          {/* Hour hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="28"
            stroke={textColor}
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              transformOrigin: "50px 50px",
              transform: `rotate(${hourAngle}deg)`,
            }}
          />
          {/* Minute hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="18"
            stroke={textColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            style={{
              transformOrigin: "50px 50px",
              transform: `rotate(${minuteAngle}deg)`,
            }}
          />
          {/* Center dot */}
          <circle cx="50" cy="50" r="3.5" fill="#82c355" />
        </svg>
      </div>
    );
  }

  if (style === "pixel-box") {
    return (
      <div
        style={{
          transform: `scale(${scale})`,
          padding: "10px 24px",
          border: `4px solid ${textColor}`,
          backgroundColor: dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)",
          boxShadow: `4px 4px 0px ${dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`,
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: 4,
          color: textColor,
          borderRadius: 4,
        }}
      >
        {timeString}
      </div>
    );
  }

  if (style === "cozy-hand") {
    return (
      <div
        style={{
          transform: `scale(${scale})`,
          fontSize: 64,
          fontWeight: 700,
          color: textColor,
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif",
          letterSpacing: 2,
        }}
      >
        {timeString}
      </div>
    );
  }

  // Minimal Digital
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: textColor,
          letterSpacing: -2,
          lineHeight: 1,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {timeString}
      </div>
      {showSubtitle && (
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: mutedColor,
            marginTop: 6,
            letterSpacing: 0.5,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
