import React, { useState } from "react";
import { Sparkles, MessageSquarePlus } from "lucide-react";

export function LumenOrbSphere({ size = 48, animate = true, showGlow = true }) {
  return (
    <div
      className="relative select-none flex-shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Ambient Outer Glow */}
      {showGlow && (
        <div
          className={`absolute inset-0 rounded-full ${animate ? "animate-pulse" : ""}`}
          style={{
            background: "radial-gradient(circle, rgba(250, 204, 21, 0.65) 0%, rgba(234, 179, 8, 0.25) 55%, transparent 80%)",
            filter: "blur(10px)",
            transform: "scale(1.35)",
          }}
        />
      )}

      {/* 3D Sphere Surface */}
      <div
        className="relative w-full h-full rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(circle at 32% 28%, #fef08a 0%, #facc15 28%, #eab308 58%, #ca8a04 88%, #854d0e 100%)",
          boxShadow: `
            inset -3px -5px 10px rgba(113, 63, 18, 0.65),
            inset 2px 3px 6px rgba(255, 255, 255, 0.85),
            0 8px 20px -2px rgba(202, 138, 4, 0.5),
            0 4px 10px rgba(0, 0, 0, 0.35)
          `,
        }}
      >
        {/* Specular Highlight */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: "12%",
            left: "16%",
            width: "38%",
            height: "28%",
            background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 80%)",
            transform: "rotate(-30deg)",
          }}
        />

        {/* Core Icon Inside Orb */}
        <div className="relative z-10 text-zinc-950 flex items-center justify-center">
          <Sparkles className="w-5 h-5 stroke-[2.2] text-zinc-950 drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
}

export default function LumenOrb({ onClick, isCreating = false, isHidden = false }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 select-none transition-all duration-500 ease-out ${
        isHidden
          ? "opacity-0 translate-y-6 scale-75 pointer-events-none"
          : "opacity-100 translate-y-0 scale-100 pointer-events-auto"
      }`}
    >
      {/* Tooltip Pill */}
      <div
        className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ease-out shadow-lg backdrop-blur-md ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
        style={{
          background: "rgba(24, 24, 27, 0.9)",
          color: "#fef08a",
          border: "1px solid rgba(234, 179, 8, 0.3)",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          <span>Start Lumen Session</span>
        </span>
      </div>

      {/* Floating Yellow Orb Trigger */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Start Lumen Study Session"
        title="Start Lumen Study Session"
        className="relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/50 rounded-full transition-transform duration-300 active:scale-95"
        style={{
          width: "56px",
          height: "56px",
          transform: isHovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
        }}
      >
        {/* Ambient Outer Glow */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-500 animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(250, 204, 21, 0.6) 0%, rgba(234, 179, 8, 0.2) 60%, transparent 80%)",
            filter: "blur(10px)",
            transform: "scale(1.4)",
            opacity: isHovered ? 0.9 : 0.65,
          }}
        />

        {/* 3D Sphere Surface */}
        <div
          className="relative w-full h-full rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
          style={{
            background: "radial-gradient(circle at 32% 28%, #fef08a 0%, #facc15 28%, #eab308 58%, #ca8a04 88%, #854d0e 100%)",
            boxShadow: `
              inset -4px -6px 12px rgba(113, 63, 18, 0.6),
              inset 3px 4px 8px rgba(255, 255, 255, 0.8),
              0 10px 25px -4px rgba(202, 138, 4, 0.5),
              0 4px 10px rgba(0, 0, 0, 0.3)
            `,
          }}
        >
          {/* Specular Highlight */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "14%",
              left: "18%",
              width: "36%",
              height: "26%",
              background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 80%)",
              transform: "rotate(-30deg)",
            }}
          />

          {/* Icon Overlay inside Sphere */}
          <div className="relative z-10 text-zinc-950 flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
            {isCreating ? (
              <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MessageSquarePlus className="w-5 h-5 stroke-[2.2] drop-shadow-sm text-zinc-900" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
