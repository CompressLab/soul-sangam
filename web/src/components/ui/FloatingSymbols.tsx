"use client";

import { useEffect, useState } from "react";

// Romantic / matrimonial symbols
const SYMBOLS = ["♥", "💍", "✨", "🌸", "💫", "❤️", "🌺", "💎", "⭐", "🕊️", "🌙", "💐"];

interface Particle {
  id:        number;
  symbol:    string;
  x:         number;   // starting x position (vw)
  y:         number;   // starting y position (vh)
  size:      number;   // font size in px
  duration:  number;   // animation duration in seconds
  delay:     number;   // animation delay in seconds
  opacity:   number;   // max opacity
  direction: "left" | "right" | "up" | "diagonal-lr" | "diagonal-rl";
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id:        i,
    symbol:    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    x:         random(0, 100),
    y:         random(0, 100),
    size:      random(14, 32),
    duration:  random(12, 28),
    delay:     random(0, 15),
    opacity:   random(0.06, 0.18),
    direction: (["left", "right", "up", "diagonal-lr", "diagonal-rl"] as const)[
      Math.floor(Math.random() * 5)
    ],
  }));
}

// CSS keyframe directions
const KEYFRAMES = `
@keyframes float-left {
  0%   { transform: translateX(0)    translateY(0)    rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(-40vw) translateY(-5vh)  rotate(-15deg); opacity: 0; }
}
@keyframes float-right {
  0%   { transform: translateX(0)    translateY(0)    rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(40vw)  translateY(-5vh)  rotate(15deg);  opacity: 0; }
}
@keyframes float-up {
  0%   { transform: translateX(0)    translateY(0)    rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(5vw)   translateY(-45vh) rotate(10deg);  opacity: 0; }
}
@keyframes float-diagonal-lr {
  0%   { transform: translateX(0)    translateY(0)    rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(35vw)  translateY(-30vh) rotate(20deg);  opacity: 0; }
}
@keyframes float-diagonal-rl {
  0%   { transform: translateX(0)    translateY(0)    rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(-35vw) translateY(-30vh) rotate(-20deg); opacity: 0; }
}
`;

const ANIMATION_MAP = {
  "left":         "float-left",
  "right":        "float-right",
  "up":           "float-up",
  "diagonal-lr":  "float-diagonal-lr",
  "diagonal-rl":  "float-diagonal-rl",
};

export function FloatingSymbols({ count = 18 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setParticles(generateParticles(count));
    setMounted(true);
  }, [count]);

  if (!mounted) return null;

  return (
    <>
      {/* Inject keyframes once */}
      <style>{KEYFRAMES}</style>

      {/* Fixed background layer — sits behind all content */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              position:        "absolute",
              left:            `${p.x}%`,
              top:             `${p.y}%`,
              fontSize:        `${p.size}px`,
              opacity:         p.opacity,
              animation:       `${ANIMATION_MAP[p.direction]} ${p.duration}s ${p.delay}s ease-in-out infinite`,
              userSelect:      "none",
              lineHeight:      "1",
              willChange:      "transform, opacity",
            }}
          >
            {p.symbol}
          </span>
        ))}
      </div>
    </>
  );
}
