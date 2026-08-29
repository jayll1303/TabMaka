import React from "react";
import { ChromeLogo } from "./ChromeLogo";

export interface MockDesktopProps {
  layout?: "landscape" | "portrait";
  isChromeClicked?: boolean;
}

export const MockDesktop: React.FC<MockDesktopProps> = ({
  layout = "landscape",
  isChromeClicked = false,
}) => {
  const isPortrait = layout === "portrait";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, #E6EFE3 0%, #F5EDE0 40%, #E3E7EE 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isPortrait ? "16px 20px 104px" : "12px 28px 52px",
        overflow: "hidden",
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Background Soft Organic Shapes for Depth */}
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 500 : 800,
          height: isPortrait ? 500 : 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(160,205,140,0.28) 0%, transparent 70%)",
          top: "-10%",
          left: "15%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 400 : 650,
          height: isPortrait ? 400 : 650,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(235,185,140,0.22) 0%, transparent 70%)",
          bottom: "10%",
          right: "10%",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Top Menu Bar (Modern macOS Frosted Style) */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: 14,
          padding: isPortrait ? "6px 14px" : "7px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#2C2A24",
          fontSize: isPortrait ? 12 : 13,
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>🍎</span>
          <span style={{ fontWeight: 700 }}>Finder</span>
          {!isPortrait && <span>File</span>}
          {!isPortrait && <span>Edit</span>}
          {!isPortrait && <span>View</span>}
          {!isPortrait && <span>Go</span>}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span>🔋 100%</span>
          <span>📶</span>
          <span>Tue 9:41 AM</span>
        </div>
      </div>

      {/* Desktop Content Area (Clean Wallpaper) */}
      <div style={{ flex: 1 }} />

      {/* Bottom macOS Frosted Dock */}
      <div
        style={{
          alignSelf: "center",
          backgroundColor: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.7)",
          borderRadius: 24,
          padding: isPortrait ? "8px 16px" : "10px 22px",
          display: "flex",
          gap: isPortrait ? 14 : 18,
          alignItems: "center",
          boxShadow: "0 14px 35px rgba(0,0,0,0.08)",
          zIndex: 5,
        }}
      >
        {/* Finder */}
        <div
          style={{
            width: isPortrait ? 38 : 44,
            height: isPortrait ? 38 : 44,
            borderRadius: 10,
            backgroundColor: "#2E7DF6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isPortrait ? 20 : 24,
            boxShadow: "0 4px 8px rgba(46,125,246,0.3)",
          }}
        >
          😀
        </div>

        {/* Chrome in Dock */}
        <div
          style={{
            width: isPortrait ? 38 : 44,
            height: isPortrait ? 38 : 44,
            borderRadius: 10,
            backgroundColor: isChromeClicked
              ? "rgba(130, 195, 85, 0.3)"
              : "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: isChromeClicked ? "translateY(-5px) scale(1.08)" : "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <ChromeLogo size={isPortrait ? 32 : 36} />
        </div>

        {/* Music / Spotify */}
        <div
          style={{
            width: isPortrait ? 38 : 44,
            height: isPortrait ? 38 : 44,
            borderRadius: 10,
            backgroundColor: "#FC3C44",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isPortrait ? 20 : 24,
            color: "#FFF",
            boxShadow: "0 4px 8px rgba(252,60,68,0.3)",
          }}
        >
          🎵
        </div>

        {/* Notes */}
        <div
          style={{
            width: isPortrait ? 38 : 44,
            height: isPortrait ? 38 : 44,
            borderRadius: 10,
            backgroundColor: "#FFD60A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isPortrait ? 20 : 24,
            boxShadow: "0 4px 8px rgba(255,214,10,0.3)",
          }}
        >
          📝
        </div>

        {/* Settings */}
        <div
          style={{
            width: isPortrait ? 38 : 44,
            height: isPortrait ? 38 : 44,
            borderRadius: 10,
            backgroundColor: "#8E8E93",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isPortrait ? 20 : 24,
            color: "#FFF",
            boxShadow: "0 4px 8px rgba(142,142,147,0.3)",
          }}
        >
          ⚙️
        </div>
      </div>
    </div>
  );
};
