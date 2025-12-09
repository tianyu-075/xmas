import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const randomEmojis = [
  "⭐","🌟","✨","💖","💫","🌈","🎈","🐶","🐱","🦄","🍓","🍰","🌸",
  "🎉","🎀","🧸","🍭","😸","😻","😹","😺"
];

export default function FallingEmoji({ engine, isGift = false }) {
  const ref = useRef();

  useEffect(() => {
    if (!engine) return;

    const emoji = isGift ? "🎁" : randomEmojis[Math.floor(Math.random() * randomEmojis.length)];

    const size = 50;
    const x = Math.random() * window.innerWidth;

    const body = Matter.Bodies.circle(x, -50, size / 2, {
      restitution: 0.8
    });

    Matter.World.add(engine.world, body);

    const renderEmoji = () => {
      const { x, y } = body.position;
      ref.current.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
    };

    Matter.Events.on(engine.engine, "afterUpdate", renderEmoji);

    return () => {
      Matter.World.remove(engine.world, body);
    };
  }, [engine]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        fontSize: "40px",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {isGift ? "🎁" : ""}
    </div>
  );
}
