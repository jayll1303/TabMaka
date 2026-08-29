import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Scene1DesktopLaunch } from "./scenes/Scene1DesktopLaunch";
import { Scene2YouTube } from "./scenes/Scene2YouTube";
import { Scene3NewTabVibe } from "./scenes/Scene3NewTabVibe";
import { Scene4CTA } from "./scenes/Scene4CTA";
import { CROSSFADE_FRAMES, type VideoProps } from "./types";

export const MainVideo: React.FC<VideoProps> = ({ layout }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const audioFadeInFrames = Math.round(0.4 * fps);
  const audioFadeOutFrames = Math.round(0.8 * fps);

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

      <Audio
        src={staticFile("audio/teaser-bgm.wav")}
        loop
        loopVolumeCurveBehavior="extend"
        volume={(frame) =>
          interpolate(
            frame,
            [
              0,
              audioFadeInFrames,
              durationInFrames - audioFadeOutFrames,
              durationInFrames,
            ],
            [0, 0.7, 0.7, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Scene 1: Desktop -> Launch Chrome -> New Tab & Frog Hop In (Frames 0 - 135 / 4.5s) */}
      <Sequence from={0} durationInFrames={135} name="Scene 1 - Desktop & New Tab Launch">
        <Scene1DesktopLaunch layout={layout} />
      </Sequence>

      {/* Scene 2: overlaps Scene 3 by 8 frames for a soft crossfade (Frames 135 - 248) */}
      <Sequence
        from={135}
        durationInFrames={105 + CROSSFADE_FRAMES}
        name="Scene 2 - YouTube Lo-fi Tab"
      >
        <Scene2YouTube layout={layout} />
      </Sequence>

      {/* Scene 3: overlaps Scene 2 and Scene 4 by 8 frames (Frames 232 - 330) */}
      <Sequence
        from={240 - CROSSFADE_FRAMES}
        durationInFrames={90 + CROSSFADE_FRAMES}
        name="Scene 3 - Smart New Tab Vibe"
      >
        <Scene3NewTabVibe layout={layout} />
      </Sequence>

      {/* Scene 4: overlaps Scene 3 by 8 frames and still ends at frame 405 */}
      <Sequence
        from={330 - CROSSFADE_FRAMES}
        durationInFrames={75 + CROSSFADE_FRAMES}
        name="Scene 4 - Outro & CTA"
      >
        <Scene4CTA layout={layout} />
      </Sequence>
    </div>
  );
};
