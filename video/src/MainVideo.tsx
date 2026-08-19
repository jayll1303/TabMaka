import React from "react";
import { Sequence } from "remotion";
import { Scene1DesktopLaunch } from "./scenes/Scene1DesktopLaunch";
import { Scene2YouTube } from "./scenes/Scene2YouTube";
import { Scene3NewTabVibe } from "./scenes/Scene3NewTabVibe";
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
        fontFamily:
          "'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Global Modern Styling */}
      <style>{`
        * {
          font-family: 'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
        }
      `}</style>

      {/* Scene 1: Desktop -> Launch Chrome -> New Tab & Frog Hop In (Frames 0 - 135 / 4.5s) */}
      <Sequence from={0} durationInFrames={135} name="Scene 1 - Desktop & New Tab Launch">
        <Scene1DesktopLaunch layout={layout} />
      </Sequence>

      {/* Scene 2: Browsing YouTube Lo-fi Music (Frames 135 - 225 / 3.0s) */}
      <Sequence from={135} durationInFrames={90} name="Scene 2 - YouTube Lo-fi Tab">
        <Scene2YouTube layout={layout} />
      </Sequence>

      {/* Scene 3: Open Second New Tab -> Mascot Already Vibing (Frames 225 - 315 / 3.0s) */}
      <Sequence from={225} durationInFrames={90} name="Scene 3 - Smart New Tab Vibe">
        <Scene3NewTabVibe layout={layout} />
      </Sequence>

      {/* Scene 4: Outro & Call to Action (Frames 315 - 390 / 2.5s) */}
      <Sequence from={315} durationInFrames={75} name="Scene 4 - Outro & CTA">
        <Scene4CTA layout={layout} />
      </Sequence>
    </div>
  );
};
