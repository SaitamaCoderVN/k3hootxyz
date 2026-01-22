'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailEmoji {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  rotation: number;
  size: number;
  bounces: number;
  state: 'falling' | 'settled' | 'popping' | 'dead';
  settledAt?: number;
}

const EMOJI_SET = ['😂', '😍', '😎', '🤩', '🤯', '✨', '🔥', '💎', '🚀', '⚡', '💰', '👑'];
const GRAVITY = 0.7; // Moderate gravity
const BOUNCE_FACTOR = -0.55; // Elastic bounce
const FRICTION = 0.8; // Allow some sliding
const TERMINAL_VELOCITY = 15;

export function CursorTrail() {
  const [emojis, setEmojis] = useState<TrailEmoji[]>([]);
  const emojisRef = useRef<TrailEmoji[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });

  const addEmoji = useCallback((x: number, y: number) => {
    const dist = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
    if (dist < 80) return;

    const newEmoji: TrailEmoji = {
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 5,
      char: EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)],
      rotation: Math.random() * 40 - 20,
      size: Math.random() * 10 + 30,
      bounces: 0,
      state: 'falling',
    };

    emojisRef.current = [...emojisRef.current.slice(-20), newEmoji];
    lastPos.current = { x, y };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      addEmoji(e.clientX, e.clientY);
    };

    let animationFrame: number;
    const updatePhysics = () => {
      const windowHeight = window.innerHeight;
      const now = Date.now();
      
      emojisRef.current = emojisRef.current.map(emoji => {
        if (emoji.state === 'dead') return emoji;

        let newState = emoji.state;
        let { x, y, vx, vy, bounces, size, settledAt } = emoji;
        const ground = windowHeight - size;

        if (emoji.state === 'falling') {
          // Apply Physics
          vy += GRAVITY;
          if (vy > TERMINAL_VELOCITY) vy = TERMINAL_VELOCITY;

          x += vx;
          y += vy;

          // Ground Collision
          if (y >= ground) {
            y = ground;
            vy *= BOUNCE_FACTOR;
            vx *= FRICTION;
            bounces += 1;
            
            // Settle after 4 bounces or very low momentum
            if (bounces >= 4 || (Math.abs(vy) < 0.8 && y >= ground - 2)) {
              vy = 0;
              vx = 0;
              y = ground;
              newState = 'settled' as const;
              settledAt = now;
            }
          }

          // Side wall collisions (containment)
          if (x <= 0) { x = 0; vx *= -0.5; }
          if (x >= window.innerWidth - size) { x = window.innerWidth - size; vx *= -0.5; }
        } else if (emoji.state === 'settled') {
          // Transition to popping after 1.5 seconds of lying on the floor
          if (settledAt && now - settledAt > 1500) {
            newState = 'popping' as const;
          }
        }

        return { ...emoji, x, y, vx, vy, bounces, state: newState, settledAt };
      });

      setEmojis([...emojisRef.current]);
      animationFrame = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrame = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [addEmoji]);

  // Manage Magic Cursor State
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const activateCursor = () => {
      document.body.classList.add('magic-cursor');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        document.body.classList.remove('magic-cursor');
      }, 100); // Quick revert if stopped, or keep it short? 
      // Actually, if moving, mousemove fires constantly. 
      // Let's set a reasonable idle time, e.g. 500ms? 
      // "Only when moving" implies immediate stop. 
      // Let's try 100ms for a snappy feel.
    };

    const handleInteraction = () => activateCursor();

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('mousedown', handleInteraction); // Handle clicks too

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      clearTimeout(idleTimer);
      document.body.classList.remove('magic-cursor'); // Cleanup
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {emojis.map((emoji) => (
        <motion.div
// ... rest of the render logic remains same ...
          key={emoji.id}
          initial={false}
          animate={
            emoji.state === 'popping' 
              ? { scale: [1, 2.5], opacity: [1, 0] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.6 }}
          onAnimationComplete={() => {
            if (emoji.state === 'popping') {
              emojisRef.current = emojisRef.current.filter(e => e.id !== emoji.id);
            }
          }}
          className="absolute select-none pointer-events-none text-3xl"
          style={{ 
            left: 0, 
            top: 0,
            x: emoji.x,
            y: emoji.y,
            rotate: emoji.rotation,
            fontSize: `${emoji.size}px`,
            position: 'absolute'
          }}
        >
          {emoji.char}
        </motion.div>
      ))}
    </div>
  );
}