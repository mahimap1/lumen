import React, { useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * Mascot Lumen Orb implementation matching the requested animated design:
 * - Happy crescent eyes (idle) transitioning to vertical ovals on hover/active
 * - Floor reflection shadow with subtle pulsing
 * - Warm ambient glow radial gradient with float and glow animations
 */
export function LumenOrbSphere({ size = 48, active = false, compact = true }) {
  return (
    <div
      className="relative select-none flex-shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Floor reflection shadow */}
      <div
        className={`lumen-shadow ${active ? "active" : ""}`}
        style={{
          bottom: `-${Math.round(size * 0.12)}px`,
          height: `${Math.max(6, Math.round(size * 0.14))}px`
        }}
      />

      {/* Mascot Orb Sphere */}
      <div className={`lumen-mascot-orb ${active ? "active" : ""} ${compact ? "compact" : ""}`}>
        <div className="lumen-face">
          <div className="eyes-container">
            <div className="lumen-eye left" />
            <div className="lumen-eye right" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main floating Lumen Companion widget
 * Opens the new session setup modal when clicked instead of an alert.
 */
export default function LumenOrb({
  onClick,
  isCreating = false,
  isHidden = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleClick = (e) => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 800);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`fixed bottom-7 right-7 z-50 flex items-center gap-3 select-none transition-all duration-500 ease-out ${isHidden
          ? "opacity-0 translate-y-6 scale-75 pointer-events-none"
          : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
        }`}
    >


      {/* Floating Mascot Button */}
      <button
        type="button"
        id="lumenBtn"
        aria-label="Start New Study Session"
        title="Start New Study Session"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`lumen-button ${isActive ? "active" : ""}`}
        style={{
          width: "84px",
          height: "84px"
        }}
      >
        {/* Floor Shadow */}
        <div className="lumen-shadow" />

        {/* Mascot Orb */}
        <div className="lumen-mascot-orb">
          <div className="lumen-face">
            <div className="eyes-container">
              <div className="lumen-eye left" />
              <div className="lumen-eye right" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
