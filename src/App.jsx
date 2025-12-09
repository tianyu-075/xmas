import React, { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';
import StartButton from './components/StartButton';
import MessageModal from './components/MessageModal';
import { FALLING_EMOJIS, GIFT_EMOJI, TWEMOJI_CDN } from './utils/emojiList';
import { getRandomMessage } from './utils/randomMessage';
import './App.css';

const {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Mouse,
  MouseConstraint,
  Common,
  Body,
  Events,
  Bounds,
  Vector,
} = Matter;

const W = window.innerWidth;
const H = window.innerHeight;
const GIFT_RADIUS = 40;
const EMOJI_RADIUS = 20;
const STOP_EPS = 0.25;

export default function App() {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);

  const [gameState, setGameState] = useState('start');
  const [giftBody, setGiftBody] = useState(null);
  const [giftReady, setGiftReady] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // =========================
  // ✅ 创建 Emoji / Gift Body
  // =========================
  const createEmojiBody = (emoji, x, y, r, isGift = false) => {
    const code = emoji.codePointAt(0).toString(16);
    return Bodies.circle(x, y, r, {
      label: isGift ? 'gift' : 'emoji',
      restitution: 0.7,
      friction: 0.02,
      density: isGift ? 0.004 : 0.001,
      render: {
        sprite: {
          texture: `${TWEMOJI_CDN}${code}.png`,
          xScale: (r * 2) / 72,
          yScale: (r * 2) / 72,
        },
      },
    });
  };

  // =========================
  // ✅ 初始化 Matter
  // =========================
  const initMatter = useCallback(() => {
    if (renderRef.current) {
      Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
      renderRef.current.textures = {};
    }
    if (runnerRef.current) Runner.stop(runnerRef.current);
    if (engineRef.current) {
      Composite.clear(engineRef.current.world);
      Engine.clear(engineRef.current);
    }

    const engine = Engine.create();
    engine.gravity.y = 1;
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine,
      options: {
        width: W,
        height: H,
        wireframes: false,
        background: '#f0f4f8',
      },
    });
    renderRef.current = render;

    const wall = { isStatic: true };
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + 30, W, 60, wall),
      Bodies.rectangle(-30, H / 2, 60, H, wall),
      Bodies.rectangle(W + 30, H / 2, 60, H, wall),
    ]);

    const mouse = Mouse.create(render.canvas);
    Composite.add(
      engine.world,
      MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      })
    );

    Render.run(render);
    runnerRef.current = Runner.run(Runner.create(), engine);
  }, []);

  // =========================
  // ✅ 判断 Gift 是否可点击
  // =========================
  const isGiftReady = (engine, gift) => {
    const bodies = Composite.allBodies(engine.world);
    // ❌ 被压着
    const covered = bodies.some(b =>
      b !== gift &&
      !b.isStatic &&
      Bounds.overlaps(b.bounds, gift.bounds)
    );
    if (covered) return false;

    // ❌ 还在动
    const v = gift.velocity;
    if (Math.abs(v.x) > STOP_EPS || Math.abs(v.y) > STOP_EPS) return false;

    return true;
  };

  // =========================
  // ✅ Start 游戏
  // =========================
  const startGame = () => {
    setGameState('falling');
    setGiftBody(null);
    setGiftReady(false);
    setModalMessage('');
    initMatter();

    setTimeout(() => {
      const engine = engineRef.current;

      const gift = createEmojiBody(GIFT_EMOJI, W / 2, 80, GIFT_RADIUS, true);
      Composite.add(engine.world, gift);
      setGiftBody(gift);

      const total = FALLING_EMOJIS.length * 4;
      const interval = 3000 / total;
      let count = 0;

      const timer = setInterval(() => {
        if (count >= total) {
          clearInterval(timer);
          setGameState('playing');
          return;
        }
        const emoji =
          FALLING_EMOJIS[Math.floor(Math.random() * FALLING_EMOJIS.length)];
        Composite.add(
          engine.world,
          createEmojiBody(
            emoji,
            Common.random(40, W - 40),
            -50,
            EMOJI_RADIUS
          )
        );
        count++;
      }, interval);
    }, 100);
  };

  // =========================
  // ✅ 每帧检测 Gift 状态
  // =========================
  useEffect(() => {
    if (!engineRef.current || !giftBody || gameState !== 'playing') {
      setGiftReady(false);
      return;
    }
    const engine = engineRef.current;
    const update = () => setGiftReady(isGiftReady(engine, giftBody));

    Events.on(engine, 'afterUpdate', update);
    return () => Events.off(engine, 'afterUpdate', update);
  }, [giftBody, gameState]);

  // =========================
  // ✅ 点击 Gift（一次，支持手机）
  // =========================
  useEffect(() => {
    const canvas = sceneRef.current?.querySelector('canvas');
    if (!canvas || !giftBody) return;

    const handleClick = (e) => {
      if (!giftReady || gameState !== 'playing') return;

      let x, y;
      if (e.touches) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }

      const rect = canvas.getBoundingClientRect();
      const pos = { x: x - rect.left, y: y - rect.top };

      if (Vector.magnitude(Vector.sub(giftBody.position, pos)) < GIFT_RADIUS) {
        setModalMessage(getRandomMessage());
        setGameState('finished');
        Body.setStatic(giftBody, true);
      }
    };

    canvas.addEventListener('pointerdown', handleClick);
    return () => canvas.removeEventListener('pointerdown', handleClick);
  }, [giftBody, giftReady, gameState]);

  // =========================
  // ✅ Render
  // =========================
  return (
    <div className="xmas-app-container">
      <div ref={sceneRef} className="matter-scene" />

      {gameState === 'start' && <StartButton onStart={startGame} />}

      {gameState === 'playing' && !giftReady && (
        <div className="game-tip">🎄 Drag the emojis away to reveal the gift</div>
      )}

      {gameState === 'playing' && giftReady && (
        <div className="game-tip ready">✨Surprise unlocked! Tap the gift 🎁</div>
      )}

      {modalMessage && (
        <MessageModal
          message={modalMessage}
          onClose={() => setModalMessage('')}
        />
      )}
    </div>
  );
}
