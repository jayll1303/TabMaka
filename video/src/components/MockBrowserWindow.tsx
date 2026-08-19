import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface BrowserTab {
  id: string;
  title: string;
  icon?: string;
  isPlayingAudio?: boolean;
}

export interface MockBrowserWindowProps {
  tabs: BrowserTab[];
  activeTabId: string;
  url: string;
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
  theme?: "light" | "dark";
  layout?: "landscape" | "portrait";
  isPlusClicked?: boolean;
}

export const MockBrowserWindow: React.FC<MockBrowserWindowProps> = ({
  tabs,
  activeTabId,
  url,
  width = "100%",
  height = "100%",
  children,
  theme = "light",
  layout = "landscape",
  isPlusClicked = false,
}) => {
  const frame = useCurrentFrame();
  const isPortrait = layout === "portrait";

  const headerBg = theme === "dark" ? "#1E1E22" : "#E8E4DC";
  const headerBorder = theme === "dark" ? "#2C2C32" : "#D4CEBF";
  const contentBg = theme === "dark" ? "#0F0F0F" : "#FAF6EE";
  const urlBarBg = theme === "dark" ? "#2B2B30" : "#FFFFFF";
  const textColor = theme === "dark" ? "#E0E0E0" : "#333333";

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: contentBg,
        borderRadius: isPortrait ? 20 : 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.08)",
        border: `1px solid ${headerBorder}`,
        position: "relative",
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Browser Window Header */}
      <div
        style={{
          backgroundColor: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          padding: isPortrait ? "10px 14px 6px 14px" : "8px 16px 4px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          userSelect: "none",
        }}
      >
        {/* Top Row: Traffic Lights + Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mac Traffic Lights */}
          <div style={{ display: "flex", gap: 6, paddingRight: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F56", border: "1px solid #E0443E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFBD2E", border: "1px solid #DEA123" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27C93F", border: "1px solid #1AAB29" }} />
          </div>

          {/* Tabs Container */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, flex: 1, overflow: "hidden" }}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const tabBg = isActive ? contentBg : "transparent";
              const tabTextCol = isActive ? textColor : theme === "dark" ? "#888890" : "#6E6A60";

              return (
                <div
                  key={tab.id}
                  style={{
                    backgroundColor: tabBg,
                    padding: isPortrait ? "6px 12px" : "6px 16px",
                    borderRadius: "10px 10px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: isPortrait ? 12 : 13,
                    fontWeight: isActive ? 600 : 500,
                    color: tabTextCol,
                    maxWidth: isPortrait ? 160 : 220,
                    minWidth: 100,
                    boxShadow: isActive ? "0 -2px 6px rgba(0,0,0,0.04)" : "none",
                    position: "relative",
                  }}
                >
                  {/* Tab Icon / Favicon */}
                  {tab.icon && (
                    <span style={{ fontSize: isPortrait ? 12 : 14 }}>
                      {tab.icon}
                    </span>
                  )}

                  {/* Title */}
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                  >
                    {tab.title}
                  </span>

                  {/* Audio Playing Indicator on Tab */}
                  {tab.isPlayingAudio && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12 }}>
                      <div
                        style={{
                          width: 3,
                          backgroundColor: "#638B48",
                          borderRadius: 2,
                          height: interpolate(Math.sin(frame * 0.4), [-1, 1], [4, 12]),
                        }}
                      />
                      <div
                        style={{
                          width: 3,
                          backgroundColor: "#638B48",
                          borderRadius: 2,
                          height: interpolate(Math.cos(frame * 0.5), [-1, 1], [3, 11]),
                        }}
                      />
                      <div
                        style={{
                          width: 3,
                          backgroundColor: "#638B48",
                          borderRadius: 2,
                          height: interpolate(Math.sin(frame * 0.6), [-1, 1], [5, 13]),
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Plus / New Tab Button */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: theme === "dark" ? "#AAAAAA" : "#666666",
                cursor: "pointer",
                backgroundColor: isPlusClicked ? "rgba(100,160,60,0.3)" : "transparent",
                transform: isPlusClicked ? "scale(0.92)" : "scale(1)",
                transition: "all 0.1s",
              }}
            >
              +
            </div>
          </div>
        </div>

        {/* Bottom Row: Navigation Buttons + URL Address Bar + Extensions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Nav icons (Back, Forward, Reload) */}
          <div style={{ display: "flex", gap: 8, color: theme === "dark" ? "#888890" : "#777770", fontSize: 13 }}>
            <span>←</span>
            <span>→</span>
            <span>⟳</span>
          </div>

          {/* URL Address Bar */}
          <div
            style={{
              flex: 1,
              backgroundColor: urlBarBg,
              borderRadius: 20,
              padding: isPortrait ? "4px 12px" : "5px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: isPortrait ? 11 : 13,
              color: textColor,
              border: `1px solid ${headerBorder}`,
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            {/* Lock Icon */}
            <span style={{ fontSize: 11, opacity: 0.6 }}>🔒</span>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                fontSize: isPortrait ? 11 : 12,
              }}
            >
              {url}
            </span>
          </div>

          {/* Extensions Bar with TabMaka Pin */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* TabMaka active extension icon */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: "rgba(130, 195, 85, 0.2)",
                border: "1px solid rgba(130, 195, 85, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              🐸
            </div>
          </div>
        </div>
      </div>

      {/* Browser Web Page Content Area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          backgroundColor: contentBg,
        }}
      >
        {children}
      </div>
    </div>
  );
};
