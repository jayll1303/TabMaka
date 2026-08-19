import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface VirtualCursorProps {
  x: number;
  y: number;
  clickFrame?: number; // Frame where click happened
  label?: string;
}

export const VirtualCursor: React.FC<VirtualCursorProps> = ({
  x,
  y,
  clickFrame,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Click ripple calculation
  let rippleScale = 0;
  let rippleOpacity = 0;

  if (clickFrame !== undefined && frame >= clickFrame) {
    const elapsed = frame - clickFrame;
    if (elapsed < 20) {
      rippleScale = spring({
        frame: elapsed,
        fps,
        config: { damping: 15, stiffness: 120 },
      }) * 2.2;
      rippleOpacity = interpolate(elapsed, [0, 18], [0.8, 0], {
        extrapolateRight: "clamp",
      });
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 100,
        transform: "translate(-2px, -2px)",
      }}
    >
      {/* Click ripple */}
      {rippleOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: 2,
            top: 2,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "rgba(130, 195, 85, 0.4)",
            border: "2px solid rgba(100, 160, 60, 0.8)",
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* SVG Modern Cursor */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.3))",
        }}
      >
        <path
          d="M3 3L10.5 21L14.2 13.8L21.4 10.5L3 3Z"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>

      {/* Optional tiny tooltip label */}
      {label && (
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 20,
            backgroundColor: "rgba(20, 24, 30, 0.85)",
            color: "#ffffff",
            padding: "4px 10px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            backdropFilter: "blur(4px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
