import React from "react";

/**
 * Solid Flat Theme Utilities
 * Replaced the legacy "Liquid Glass" frosted effects with flat monochromatic defaults.
 */

export const SolidPanel = ({ children, className = "", style = {}, rounded = "rounded-2xl", as: Tag = "div" }) => {
  return (
    <Tag
      className={`relative ${rounded} bg-[#0a0a0a] border border-neutral-800 ${className}`}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      <div className="relative h-full w-full">{children}</div>
    </Tag>
  );
};

export const SolidFloating = ({ children, className = "", style = {} }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-800 ${className}`}
      style={{
        boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      <div className="relative z-30 h-full w-full">{children}</div>
    </div>
  );
};

export default SolidPanel;
