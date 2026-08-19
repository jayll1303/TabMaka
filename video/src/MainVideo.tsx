import React from "react";
import { Sequence } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Interactions } from "./scenes/Scene2Interactions";
import { Scene3Features } from "./scenes/Scene3Features";
import { Scene4CTA } from "./scenes/Scene4CTA";
import type { VideoProps } from "./types";

export const MainVideo: React.FC<VideoProps> = ({ layout }) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#FAF6EE",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scene 1: The Hook (Frames 0 - 90 / 3s) */}
      <Sequence from={0} durationInFrames={90} name="Scene 1 - The Hook">
        <Scene1Hook layout={layout} />
      </Sequence>

      {/* Scene 2: Playful Interactions & Vibe (Frames 90 - 195 / 3.5s) */}
      <Sequence
        from={90}
        durationInFrames={105}
        name="Scene 2 - Interactions & Vibe"
      >
        <Scene2Interactions layout={layout} />
      </Sequence>

      {/* Scene 3: Clocks, Themes & Privacy (Frames 195 - 285 / 3s) */}
      <Sequence
        from={195}
        durationInFrames={90}
        name="Scene 3 - Features & Themes"
      >
        <Scene3Features layout={layout} />
      </Sequence>

      {/* Scene 4: Outro & Call to Action (Frames 285 - 360 / 2.5s) */}
      <Sequence from={285} durationInFrames={75} name="Scene 4 - Outro & CTA">
        <Scene4CTA layout={layout} />
      </Sequence>
    </div>
  );
};
