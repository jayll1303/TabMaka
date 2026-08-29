import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";

export interface TypingFrogProps {
  size?: number;
  startFrame?: number;
}

type TypingSprite = {
  file: string;
  naturalWidth: number;
  naturalHeight: number;
};

const TYPING_SPRITES: TypingSprite[] = [
  { file: "type_0_idle.png", naturalWidth: 1298, naturalHeight: 921 },
  { file: "type_1_left.png", naturalWidth: 1295, naturalHeight: 933 },
  { file: "type_2_right.png", naturalWidth: 1300, naturalHeight: 930 },
  { file: "type_3_both.png", naturalWidth: 1297, naturalHeight: 951 },
];

const SPRITE_CYCLE = [0, 1, 2, 1, 0, 1, 2, 3];

export const TypingFrog: React.FC<TypingFrogProps> = ({
  size = 380,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const step = Math.floor(elapsed / 4);
  const sprite = TYPING_SPRITES[SPRITE_CYCLE[step % SPRITE_CYCLE.length]];
  const renderedHeight = size * (sprite.naturalHeight / sprite.naturalWidth);
  const bob = -Math.abs(Math.sin((elapsed / 4) * Math.PI)) * 2;

  return (
    <div
      style={{
        width: size,
        height: renderedHeight,
        transform: `translateY(${bob}px)`,
        filter: "drop-shadow(0 14px 28px rgba(18, 32, 12, 0.16))",
      }}
    >
      <Img
        src={staticFile(`sprites/frog/typing/${sprite.file}`)}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};
