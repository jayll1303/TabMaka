import React from "react";

export interface ChromeLogoProps {
  size?: number;
}

export const ChromeLogo: React.FC<ChromeLogoProps> = ({ size = 64 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" />
      <g clipPath="url(#chrome-clip)">
        {/* Red Top Segment */}
        <path
          d="M50 50L84.64 30C76.5 15.8 61.2 6.6 50 6.6C33.8 6.6 19.8 15.6 12.8 28.8L30.12 58.8L50 50Z"
          fill="#EA4335"
        />
        {/* Yellow Right Segment */}
        <path
          d="M50 50L50 14.8C69.4 14.8 85.2 30.6 85.2 50C85.2 61.6 79.6 72 70.8 78.4L52.6 47L50 50Z"
          fill="#FBBC05"
        />
        {/* Green Bottom Segment */}
        <path
          d="M50 50L20 40L14.8 50C14.8 69.4 30.6 85.2 50 85.2C61.4 85.2 71.6 79.8 78.2 71.2L50 50Z"
          fill="#34A853"
        />
        {/* Center Blue Circle with White Border */}
        <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="18" fill="#4285F4" />
      </g>
      <defs>
        <clipPath id="chrome-clip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>
    </svg>
  );
};
