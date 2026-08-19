import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface MusicParticlesProps {
  count?: number;
  originX: number;
  originY: number;
}

export const MusicParticles: React.FC<MusicParticlesProps> = ({
  count = 6,
  originX,
  originY,
}) => {
  const frame = useCurrentFrame();
  const symbols = ["♪", "♫", "♬", "✨", "🎵"];

  const particles = Array.from({ length: count }, (_, i) => {
    const seed = i * 137.5;
    const cycle = 45; // loop period in frames
    const progress = ((frame + seed) % cycle) / cycle;

    const angle = ((i * 360) / count + (frame * 0.8)) * (Math.PI / 180);
    const distance = interpolate(progress, [0, 1], [40, 140]);
    const x = originX + Math.cos(angle) * distance;
    const y = originY - progress * 120 + Math.sin(progress * Math.PI * 2) * 15;

    const opacity = Math.sin(progress * Math.PI) * 0.9;
    const scale = interpolate(progress, [0, 0.5, 1], [0.6, 1.2, 0.8]);
    const symbol = symbols[i % symbols.length];

    return { id: i, x, y, opacity, scale, symbol };
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) scale(${p.scale})`,
            fontSize: 32,
            fontWeight: 800,
            color: "#2d4a22",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
            userSelect: "none",
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
};
