import React from "react";

/**
 * Liquid Glass Effect Components
 * Adapted for dark-themed apps (no TypeScript, no "use client")
 */

// SVG Filter — render once at the root of your app or layout
export const GlassFilter = () => (
  <svg style={{ display: "none" }}>
    <defs>
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.001 0.005"
          numOctaves="1"
          seed="17"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="80"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

/**
 * GlassPanel — dark-themed glass panel for sidebars and floating sections.
 * Replaces solid dark backgrounds with a frosted glass look.
 */
export const GlassPanel = ({ children, className = "", style = {}, rounded = "rounded-2xl", as: Tag = "div" }) => {
  return (
    <Tag
      className={`relative ${rounded} ${className}`}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
        ...style,
      }}
    >
      {/* Glass effect layers — clipped to panel bounds so blur doesn't bleed out */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit", zIndex: 0 }}>
        {/* Distortion + backdrop */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
            filter: "url(#glass-distortion)",
            isolation: "isolate",
          }}
        />
        {/* Dark tint */}
        <div className="absolute inset-0" style={{ background: "rgba(10, 10, 10, 0.55)" }} />
        {/* Rim highlight */}
        <div
          className="absolute inset-0"
          style={{
            boxShadow: "inset 1px 1px 0px rgba(255,255,255,0.10), inset -1px -1px 0px rgba(255,255,255,0.04)",
            borderRadius: "inherit",
          }}
        />
      </div>

      {/* Content — NOT clipped, so dropdowns can overflow */}
      <div className="relative h-full w-full" style={{ zIndex: 1 }}>{children}</div>
    </Tag>
  );
};

/**
 * GlassFloating — for the main floating content panel (right section).
 * Slightly lighter tint for readability.
 */
export const GlassFloating = ({ children, className = "", style = {} }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${className}`}
      style={{
        boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      {/* Distortion */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
      />

      {/* Tint — slightly lighter than sidebar */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: "rgba(8, 8, 12, 0.65)" }}
      />

      {/* Top edge highlight */}
      <div
        className="absolute inset-0 z-20 pointer-events-none rounded-3xl"
        style={{
          boxShadow:
            "inset 1px 1.5px 0px rgba(255,255,255,0.13), inset -1px -1px 0px rgba(255,255,255,0.04)",
        }}
      />

      {/* Content */}
      <div className="relative z-30 h-full w-full">{children}</div>
    </div>
  );
};

export default GlassPanel;
