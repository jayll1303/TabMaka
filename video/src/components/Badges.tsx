import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface BadgeItem {
  icon: string;
  label: string;
  delay?: number;
}

export interface BadgesProps {
  items: BadgeItem[];
  dark?: boolean;
}

export const Badges: React.FC<BadgesProps> = ({ items, dark = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {items.map((item, idx) => {
        const delay = item.delay ?? idx * 5;
        const scale = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { damping: 14, stiffness: 120 },
        });

        return (
          <div
            key={item.label}
            style={{
              transform: `scale(${scale})`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 22px",
              borderRadius: 30,
              backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)",
              border: dark
                ? "1px solid rgba(255,255,255,0.15)"
                : "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              color: dark ? "#ffffff" : "#1a211e",
              fontSize: 22,
              fontWeight: 700,
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};
