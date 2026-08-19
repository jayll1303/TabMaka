import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import type { VideoProps } from "./types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Landscape Video for YouTube, Product Hunt, Website Banner, Twitter */}
      <Composition
        id="TabMakaPromo16x9"
        component={MainVideo}
        durationInFrames={390}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={
          {
            layout: "landscape",
          } satisfies VideoProps
        }
      />

      {/* 9:16 Portrait Video for TikTok, Instagram Reels, YouTube Shorts */}
      <Composition
        id="TabMakaPromo9x16"
        component={MainVideo}
        durationInFrames={390}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={
          {
            layout: "portrait",
          } satisfies VideoProps
        }
      />
    </>
  );
};
