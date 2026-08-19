import React from "react";
import { useCurrentFrame } from "remotion";

export interface TypingTextProps {
  text: string;
  startFrame?: number;
  framesPerChar?: number;
  showCursor?: boolean;
  cursorChar?: string;
  style?: React.CSSProperties;
}

export const TypingText: React.FC<TypingTextProps> = ({
  text,
  startFrame = 0,
  framesPerChar = 2,
  showCursor = true,
  cursorChar = "|",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charsShown = Math.min(text.length, Math.floor(elapsed / framesPerChar));

  const currentText = text.slice(0, charsShown);
  // Blink cursor every 14 frames
  const cursorVisible = showCursor && Math.floor(frame / 14) % 2 === 0;

  return (
    <span
      style={{
        fontFamily:
          "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif",
        display: "inline-block",
        ...style,
      }}
    >
      {currentText}
      {showCursor && (
        <span
          style={{
            opacity: cursorVisible ? 1 : 0,
            marginLeft: 2,
            fontWeight: 300,
            color: "inherit",
          }}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
};
