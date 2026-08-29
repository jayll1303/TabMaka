import React from "react";
import { Img, staticFile } from "remotion";

export interface PondieTabLogoProps {
  width: number;
  variant?: "mark" | "wordmark";
}

export const PondieTabLogo: React.FC<PondieTabLogoProps> = ({
  width,
  variant = "mark",
}) => (
  <Img
    src={staticFile(
      variant === "wordmark"
        ? "branding/pondie-tab-wordmark.svg"
        : "branding/pondie-tab-mark.svg",
    )}
    style={{
      width,
      height: variant === "wordmark" ? width * 0.3 : width,
      objectFit: "contain",
      display: "block",
    }}
  />
);
