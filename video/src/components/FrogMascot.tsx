import React from "react";
import { Img, staticFile } from "remotion";

export type FrogPose =
  | "loaf"
  | "jump-crouch"
  | "jump-launch"
  | "jump-apex"
  | "jump-land"
  | "vibe-sway"
  | "vibe-up";

export type FrogExpression =
  | "happy"
  | "uwu"
  | "kiss"
  | "tongue"
  | "surprised"
  | "sleepy"
  | "normal";

export interface FrogMascotProps {
  pose?: FrogPose;
  expression?: FrogExpression;
  isBlinking?: boolean;
  eyeLookAt?: { x: number; y: number }; // Offset normalized [-1, 1]
  size?: number; // Base width in px (relative to 566 base)
  flipX?: boolean;
  scaleX?: number;
  scaleY?: number;
}

interface PoseSpec {
  bodyFile: string;
  natW: number;
  natH: number;
  eyeAnchor: { x: number; y: number; r: number };
  mouthAnchor: { x: number; y: number };
}

const POSE_SPECS: Record<FrogPose, PoseSpec> = {
  loaf: {
    bodyFile: "sprites/frog/frog_body.png",
    natW: 566,
    natH: 450,
    eyeAnchor: { x: 313.3, y: 85.8, r: 38.8 },
    mouthAnchor: { x: 405, y: 100 },
  },
  "jump-crouch": {
    bodyFile: "sprites/frog/jump/jump_1_crouch.png",
    natW: 637,
    natH: 329,
    eyeAnchor: { x: 370, y: 110, r: 36 },
    mouthAnchor: { x: 440, y: 155 },
  },
  "jump-launch": {
    bodyFile: "sprites/frog/jump/jump_2_launch.png",
    natW: 571,
    natH: 511,
    eyeAnchor: { x: 465, y: 125, r: 34 },
    mouthAnchor: { x: 475, y: 190 },
  },
  "jump-apex": {
    bodyFile: "sprites/frog/jump/jump_3_apex.png",
    natW: 473,
    natH: 397,
    eyeAnchor: { x: 305, y: 85, r: 32 },
    mouthAnchor: { x: 340, y: 140 },
  },
  "jump-land": {
    bodyFile: "sprites/frog/jump/jump_4_land.png",
    natW: 647,
    natH: 304,
    eyeAnchor: { x: 410, y: 105, r: 35 },
    mouthAnchor: { x: 475, y: 150 },
  },
  "vibe-sway": {
    bodyFile: "sprites/frog/vibe/vibe_1_sway.png",
    natW: 529,
    natH: 521,
    eyeAnchor: { x: 315, y: 140, r: 34 },
    mouthAnchor: { x: 370, y: 230 },
  },
  "vibe-up": {
    bodyFile: "sprites/frog/vibe/vibe_2_up.png",
    natW: 501,
    natH: 487,
    eyeAnchor: { x: 280, y: 130, r: 32 },
    mouthAnchor: { x: 325, y: 205 },
  },
};

interface MouthSpec {
  file: string;
  natW: number;
  natH: number;
  widthFactor: number;
}

const MOUTH_SPECS: Record<FrogExpression, MouthSpec> = {
  normal: { file: "mouth_normal.png", natW: 157, natH: 87, widthFactor: 0.14 },
  happy: { file: "mouth_happy.png", natW: 140, natH: 105, widthFactor: 0.16 },
  uwu: { file: "mouth_uwu.png", natW: 123, natH: 50, widthFactor: 0.15 },
  surprised: { file: "mouth_surprised.png", natW: 90, natH: 92, widthFactor: 0.095 },
  sleepy: { file: "mouth_straight.png", natW: 113, natH: 32, widthFactor: 0.12 },
  tongue: { file: "mouth_tongue.png", natW: 135, natH: 71, widthFactor: 0.15 },
  kiss: { file: "mouth_kiss.png", natW: 79, natH: 80, widthFactor: 0.085 },
};

export const FrogMascot: React.FC<FrogMascotProps> = ({
  pose = "loaf",
  expression = "happy",
  isBlinking = false,
  eyeLookAt = { x: 0, y: 0 },
  size = 320,
  flipX = false,
  scaleX = 1,
  scaleY = 1,
}) => {
  const spec = POSE_SPECS[pose] ?? POSE_SPECS.loaf;
  const mouthSpec = MOUTH_SPECS[expression] ?? MOUTH_SPECS.happy;

  // Proportional sizing relative to loaf base (566)
  const curWidth = size * (spec.natW / 566);
  const curHeight = curWidth * (spec.natH / spec.natW);

  // Eye calculation
  const isShut =
    isBlinking ||
    expression === "uwu" ||
    expression === "sleepy" ||
    expression === "kiss";
  const isWide = expression === "surprised";

  const eyeR = spec.eyeAnchor.r;
  const rx = eyeR * (isWide ? 1.18 : 1.0);
  const rSmile = eyeR * 0.95;

  const glintR = rx * 0.38;
  const maxTravel = rx * 0.42;
  const lookX = Math.max(-1, Math.min(1, eyeLookAt.x * (flipX ? -1 : 1)));
  const lookY = Math.max(-1, Math.min(1, eyeLookAt.y));

  const gx = spec.eyeAnchor.x + lookX * maxTravel;
  const gy = spec.eyeAnchor.y + lookY * maxTravel;

  const g2 = glintR * 0.42;
  const g2x = spec.eyeAnchor.x + lookX * (maxTravel * 0.5) + rx * 0.34;
  const g2y = spec.eyeAnchor.y + lookY * (maxTravel * 0.5) + rx * 0.32;

  // Mouth calculation
  const mouthW = spec.natW * mouthSpec.widthFactor;
  const mouthH = mouthW * (mouthSpec.natH / mouthSpec.natW);
  const mouthX = spec.mouthAnchor.x - mouthW / 2;
  const mouthY = spec.mouthAnchor.y - mouthH / 2;

  return (
    <div
      style={{
        position: "relative",
        width: curWidth,
        height: curHeight,
        transform: `scale(${scaleX * (flipX ? -1 : 1)}, ${scaleY})`,
        transformOrigin: "center bottom",
        display: "inline-block",
      }}
    >
      {/* Body Sprite */}
      <Img
        src={staticFile(spec.bodyFile)}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          filter: "drop-shadow(0px 14px 28px rgba(18, 32, 12, 0.12))",
        }}
      />

      {/* Dynamic Eye & Mouth SVG Overlay */}
      <svg
        viewBox={`0 0 ${spec.natW} ${spec.natH}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Eye */}
        {isShut ? (
          /* Cute Closed Smile Arc */
          <path
            d={`M ${spec.eyeAnchor.x - rSmile * 0.844} ${
              spec.eyeAnchor.y + rSmile * 0.186
            } A ${rSmile} ${rSmile} 0 0 0 ${
              spec.eyeAnchor.x + rSmile * 0.844
            } ${spec.eyeAnchor.y + rSmile * 0.186}`}
            fill="none"
            stroke="#182415"
            strokeWidth={eyeR * 0.28}
            strokeLinecap="round"
          />
        ) : (
          /* Open Glossy Bead Eye */
          <g>
            {/* Dark eye bead */}
            <circle
              cx={spec.eyeAnchor.x}
              cy={spec.eyeAnchor.y}
              r={rx}
              fill="#182415"
            />
            {/* Primary specular highlight */}
            <circle cx={gx} cy={gy} r={glintR} fill="#ffffff" />
            {/* Secondary specular sparkle */}
            <circle
              cx={g2x}
              cy={g2y}
              r={g2}
              fill="rgba(255, 255, 255, 0.92)"
            />
          </g>
        )}

        {/* Mouth Sprite */}
        <image
          href={staticFile(`sprites/frog/${mouthSpec.file}`)}
          x={mouthX}
          y={mouthY}
          width={mouthW}
          height={mouthH}
        />
      </svg>
    </div>
  );
};
